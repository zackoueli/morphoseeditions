import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { sendMail, TO_EMAIL } from "@/lib/mail";
import type { Order } from "@/lib/types";

const DAY_MS = 24 * 60 * 60 * 1000;
/** Délai après expédition avant d'écrire au client (le temps de recevoir et de lire). */
const FOLLOW_UP_AFTER_DAYS = 10;
/** Au-delà, on n'écrit plus : évite d'envoyer un e-mail tardif si la tâche a été en panne. */
const FOLLOW_UP_MAX_DAYS = 30;

/**
 * Tâche planifiée quotidienne (cf. vercel.json) : envoie, une seule fois par commande,
 * un e-mail « bien reçu ? » quelques jours après l'expédition.
 * Vercel appelle cette route avec `Authorization: Bearer ${CRON_SECRET}`.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const db = adminDb();
  const snapshot = await db
    .collection("orders")
    .where("shippedAt", "<=", now - FOLLOW_UP_AFTER_DAYS * DAY_MS)
    .where("shippedAt", ">=", now - FOLLOW_UP_MAX_DAYS * DAY_MS)
    .get();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  let sent = 0;

  for (const doc of snapshot.docs) {
    const order = doc.data() as Order;
    if (order.status !== "shipped" || order.followUpSentAt || !order.customerEmail) {
      continue;
    }

    const ok = await sendMail({
      to: order.customerEmail,
      subject: "Votre revue Morphose est-elle bien arrivée ?",
      heading: "Bonne lecture ?",
      intro:
        "Votre commande est partie il y a une dizaine de jours : nous espérons qu'elle est bien arrivée et qu'elle vous plaît. Un mot, une critique, une photo de la revue chez vous ? Répondez simplement à cet e-mail, chaque retour compte pour une petite maison d'édition associative. Et s'il y a eu le moindre souci avec le colis, dites-le-nous de la même façon.",
      fields: [],
      body: {
        label: "Votre commande",
        value: order.items.map((i) => `${i.quantity}× ${i.title}`).join("\n"),
      },
      cta: { label: "Découvrir les autres numéros", url: `${siteUrl}/catalogue` },
      replyTo: { email: TO_EMAIL, name: "Morphose Éditions" },
    });

    if (ok) {
      await doc.ref.update({ followUpSentAt: Date.now() });
      sent++;
    }
  }

  return NextResponse.json({ checked: snapshot.size, sent });
}
