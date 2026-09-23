import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { adminDb } from "@/lib/firebase/admin";
import { sendMail } from "@/lib/mail";
import { formatPrice } from "@/lib/format";
import { createRelayParcel, PARCEL_WEIGHT_PER_ITEM_G } from "@/lib/sendcloud";
import type Stripe from "stripe";
import type { Order, OrderItem } from "@/lib/types";

function itemLines(items: OrderItem[]) {
  return items
    .map(
      (i) =>
        `${i.quantity}× ${i.title} — ${formatPrice(i.priceCents * i.quantity)}`
    )
    .join("\n");
}

function relayPointLines(p: Order["relayPoint"]) {
  return [p.name, p.line1, `${p.postalCode} ${p.city}`].filter(Boolean).join("\n");
}

/** Notifie l'association + envoie une confirmation au client. Best-effort. */
async function notifyOrder(order: Omit<Order, "id">) {
  const commonFields = [
    { label: "Total", value: formatPrice(order.amountTotalCents) },
    { label: "E-mail client", value: order.customerEmail || "—" },
    { label: "Nom du client", value: order.customerName },
    { label: "Téléphone", value: order.customerPhone },
    { label: "Point relais", value: relayPointLines(order.relayPoint) },
    {
      label: "Étiquette Sendcloud",
      value: order.sendcloudParcelId
        ? `Colis créé automatiquement (n°${order.sendcloudParcelId}) — à imprimer sur panel.sendcloud.sc`
        : "Non créé automatiquement — à créer manuellement sur panel.sendcloud.sc",
    },
  ];
  const itemsBody = { label: "Articles", value: itemLines(order.items) };

  await Promise.allSettled([
    sendMail({
      subject: `Nouvelle commande — ${formatPrice(order.amountTotalCents)}`,
      heading: "Nouvelle commande",
      intro: "Une commande vient d'être payée sur la boutique.",
      fields: commonFields,
      body: itemsBody,
      replyTo: order.customerEmail
        ? { email: order.customerEmail, name: order.customerName }
        : undefined,
    }),
    order.customerEmail
      ? sendMail({
          to: order.customerEmail,
          subject: "Votre commande Morphose Éditions est confirmée",
          heading: "Commande confirmée",
          intro:
            "Merci pour votre commande ! Nous préparons votre colis et vous écrivons à l'expédition.",
          fields: [
            { label: "Total", value: formatPrice(order.amountTotalCents) },
            {
              label: "Point relais choisi",
              value: relayPointLines(order.relayPoint),
            },
          ],
          body: itemsBody,
        })
      : Promise.resolve(false),
  ]);
}

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
    let createdOrder: Omit<Order, "id"> | null = null;
    let createdOrderId: string | null = null;

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

      const relayPoint: Order["relayPoint"] = JSON.parse(
        session.metadata?.relayPoint ?? "null"
      );

      const order: Omit<Order, "id"> = {
        items: orderItems,
        amountTotalCents: session.amount_total ?? 0,
        shippingCents: 0,
        customerName: session.metadata?.customerName ?? "",
        customerPhone: session.metadata?.customerPhone ?? "",
        relayPoint,
        sendcloudParcelId: null,
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
      createdOrder = order;
      createdOrderId = orderRef.id;
    });

    if (createdOrder && createdOrderId) {
      const order: Omit<Order, "id"> = createdOrder;
      const totalItems = order.items.reduce((sum, i) => sum + i.quantity, 0);
      const parcel = await createRelayParcel({
        orderNumber: createdOrderId,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerEmail: order.customerEmail,
        relayPoint: order.relayPoint,
        weightGrams: totalItems * PARCEL_WEIGHT_PER_ITEM_G,
      });
      if (parcel) {
        await db
          .collection("orders")
          .doc(createdOrderId)
          .update({ sendcloudParcelId: parcel.parcelId, updatedAt: Date.now() });
        order.sendcloudParcelId = parcel.parcelId;
      }

      await notifyOrder(order);
    }
  }

  return NextResponse.json({ received: true });
}
