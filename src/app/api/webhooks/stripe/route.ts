import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { adminDb } from "@/lib/firebase/admin";
import type Stripe from "stripe";
import type { Order, OrderItem } from "@/lib/types";

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  const rawBody = await req.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const db = adminDb();

  if (session.metadata?.type === "donation") {
    await db.collection("donations").add({
      amountCents: session.amount_total ?? 0,
      donorEmail: session.customer_details?.email ?? null,
      stripeSessionId: session.id,
      createdAt: Date.now(),
    });
    return NextResponse.json({ received: true });
  }

  if (session.metadata?.type === "issue_order") {
    const existing = await db
      .collection("orders")
      .where("stripeSessionId", "==", session.id)
      .limit(1)
      .get();
    if (!existing.empty) {
      return NextResponse.json({ received: true });
    }

    const requestedItems = JSON.parse(
      session.metadata.items ?? "[]"
    ) as { issueId: string; quantity: number }[];

    const orderItems: OrderItem[] = [];

    await db.runTransaction(async (tx) => {
      for (const item of requestedItems) {
        const ref = db.collection("issues").doc(item.issueId);
        const snap = await tx.get(ref);
        if (!snap.exists) continue;
        const issue = snap.data()!;
        const newStock = Math.max(0, issue.stock - item.quantity);
        tx.update(ref, { stock: newStock, updatedAt: Date.now() });
        orderItems.push({
          issueId: item.issueId,
          title: issue.title,
          priceCents: issue.priceCents,
          quantity: item.quantity,
        });
      }

      const shipping = session.collected_information?.shipping_details;
      const order: Omit<Order, "id"> = {
        items: orderItems,
        amountTotalCents: session.amount_total ?? 0,
        shippingCents: 0,
        shippingAddress: {
          name: shipping?.name ?? session.customer_details?.name ?? "",
          line1: shipping?.address?.line1 ?? "",
          line2: shipping?.address?.line2 ?? undefined,
          postalCode: shipping?.address?.postal_code ?? "",
          city: shipping?.address?.city ?? "",
          country: shipping?.address?.country ?? "",
        },
        customerEmail: session.customer_details?.email ?? "",
        status: "paid",
        stripeSessionId: session.id,
        stripePaymentIntentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const orderRef = db.collection("orders").doc();
      tx.set(orderRef, { ...order, id: orderRef.id });
    });
  }

  return NextResponse.json({ received: true });
}
