import { NextResponse } from "next/server";
import { z } from "zod";
import { getStripe, SHIPPING_FLAT_RATE_CENTS } from "@/lib/stripe";
import { adminDb } from "@/lib/firebase/admin";
import type { Issue } from "@/lib/types";

const CheckoutSchema = z.object({
  items: z
    .array(
      z.object({
        issueId: z.string().min(1),
        quantity: z.number().int().min(1).max(20),
      })
    )
    .min(1),
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
          name: `${issue.title} (n°${issue.issueNumber})`,
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
    line_items: [
      ...lineItems,
      {
        price_data: {
          currency: "eur",
          product_data: { name: "Frais de port" },
          unit_amount: SHIPPING_FLAT_RATE_CENTS,
        },
        quantity: 1,
      },
    ],
    shipping_address_collection: { allowed_countries: ["FR", "BE", "CH", "LU"] },
    success_url: `${siteUrl}/panier/confirmation?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/panier`,
    metadata: {
      type: "issue_order",
      items: JSON.stringify(parsed.data.items),
    },
  });

  return NextResponse.json({ url: session.url });
}
