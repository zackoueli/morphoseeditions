import { NextResponse } from "next/server";
import { z } from "zod";
import { getStripe, SHIPPING_FLAT_RATE_CENTS } from "@/lib/stripe";
import { adminDb } from "@/lib/firebase/admin";
import type { Issue } from "@/lib/types";

const RelayPointSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  line1: z.string(),
  postalCode: z.string().min(1),
  city: z.string().min(1),
  country: z.string().min(1),
});

const CheckoutSchema = z.object({
  items: z
    .array(
      z.object({
        issueId: z.string().min(1),
        quantity: z.number().int().min(1).max(20),
      })
    )
    .min(1),
  customerName: z.string().trim().min(1).max(200),
  customerPhone: z.string().trim().min(1).max(50),
  relayPoint: RelayPointSchema,
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = CheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const db = adminDb();
  const issueRefs = parsed.data.items.map((i) =>
    db.collection("issues").doc(i.issueId)
  );
  const snapshots = await db.getAll(...issueRefs);

  const lineItems: {
    price_data: {
      currency: string;
      product_data: { name: string; images: string[] };
      unit_amount: number;
    };
    quantity: number;
  }[] = [];

  for (let i = 0; i < snapshots.length; i++) {
    const snap = snapshots[i];
    const requested = parsed.data.items[i];
    if (!snap.exists) {
      return NextResponse.json({ error: "issue_not_found" }, { status: 400 });
    }
    const issue = snap.data() as Issue;
    if (!issue.published) {
      return NextResponse.json({ error: "issue_unavailable" }, { status: 400 });
    }
    if (issue.stock < requested.quantity) {
      return NextResponse.json(
        { error: "insufficient_stock", issueId: issue.id },
        { status: 409 }
      );
    }
    lineItems.push({
      price_data: {
        currency: "eur",
        product_data: {
          name: issue.title,
          images: issue.coverImageUrl ? [issue.coverImageUrl] : [],
        },
        unit_amount: issue.priceCents,
      },
      quantity: requested.quantity,
    });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    // Managed Payments est activé par défaut sur le compte ; on le désactive
    // pour cette requête (livraison en point relais, pas d'adresse postale).
    managed_payments: { enabled: false },
    line_items: [
      ...lineItems,
      {
        price_data: {
          currency: "eur",
          product_data: { name: "Frais de port — Point relais" },
          unit_amount: SHIPPING_FLAT_RATE_CENTS,
        },
        quantity: 1,
      },
    ],
    success_url: `${siteUrl}/panier/confirmation?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/panier`,
    metadata: {
      type: "issue_order",
      items: JSON.stringify(parsed.data.items),
      customerName: parsed.data.customerName,
      customerPhone: parsed.data.customerPhone,
      relayPoint: JSON.stringify(parsed.data.relayPoint),
    },
  });

  return NextResponse.json({ url: session.url });
}
