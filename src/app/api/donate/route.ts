import { NextResponse } from "next/server";
import { z } from "zod";
import { getStripe } from "@/lib/stripe";

const DonateSchema = z.object({
  amountCents: z.number().int().min(100).max(500000),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = DonateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    // Cohérence avec /api/checkout : Managed Payments est activé par défaut
    // sur le compte de prod et fait échouer la création de session.
    managed_payments: { enabled: false },
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: "Don libre à Morphose Éditions",
          },
          unit_amount: parsed.data.amountCents,
        },
        quantity: 1,
      },
    ],
    success_url: `${siteUrl}/soutenir/merci?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/soutenir`,
    metadata: { type: "donation" },
  });

  return NextResponse.json({ url: session.url });
}
