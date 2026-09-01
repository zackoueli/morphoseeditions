import { NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase/admin";
import { getStripe } from "@/lib/stripe";
import {
  createDonationMessage,
  MAX_IMAGE_BASE64,
  MAX_MESSAGE,
  MAX_NAME,
} from "@/lib/donation-messages";

const Schema = z
  .object({
    sessionId: z.string().min(1).max(200),
    message: z.string().max(MAX_MESSAGE).optional().default(""),
    authorName: z.string().max(MAX_NAME).optional().default(""),
    /** Data URL PNG/JPEG (upload photo ou export du canvas). */
    imageDataUrl: z.string().max(MAX_IMAGE_BASE64).optional(),
    kind: z.enum(["photo", "drawing"]).optional(),
  })
  .refine((v) => v.message.trim().length > 0 || v.imageDataUrl, {
    message: "empty_contribution",
  });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }
  const { sessionId, message, authorName, imageDataUrl, kind } = parsed.data;

  // --- BYPASS DEV : permet de tester le formulaire sans paiement Stripe. ---
  // Actif uniquement hors production ET si le session_id commence par "dev_".
  // Ex. : /soutenir/merci?session_id=dev_1
  const isDevBypass =
    process.env.NODE_ENV !== "production" && sessionId.startsWith("dev_");

  if (!isDevBypass) {
    // Vérifie que la session Stripe correspond à un don réellement payé.
    let session;
    try {
      session = await getStripe().checkout.sessions.retrieve(sessionId);
    } catch {
      return NextResponse.json({ error: "unknown_session" }, { status: 400 });
    }
    if (
      session.metadata?.type !== "donation" ||
      session.payment_status !== "paid"
    ) {
      return NextResponse.json({ error: "session_not_paid" }, { status: 400 });
    }
  }

  // Une seule contribution par session de don.
  const existing = await adminDb()
    .collection("donationMessages")
    .where("stripeSessionId", "==", sessionId)
    .limit(1)
    .get();
  if (!existing.empty) {
    return NextResponse.json({ error: "already_submitted" }, { status: 409 });
  }

  try {
    await createDonationMessage({
      message,
      authorName,
      imageDataUrl,
      kind,
      stripeSessionId: sessionId,
    });
  } catch {
    return NextResponse.json({ error: "invalid_image" }, { status: 400 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
