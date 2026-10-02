import { NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdminUser } from "@/lib/admin-auth";
import { sendMail, TO_EMAIL } from "@/lib/mail";
import { getParcelTrackingUrl } from "@/lib/sendcloud";
import type { Order } from "@/lib/types";

const OrderUpdateSchema = z.object({
  status: z.enum(["pending_payment", "paid", "shipped", "cancelled"]),
});

function bearerToken(req: Request): string | null {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length);
}

/** Prévient le client que son colis est parti, avec le lien de suivi s'il existe. Best-effort. */
async function notifyShipped(order: Order, trackingUrl: string | null) {
  if (!order.customerEmail) return;

  const items = order.items
    .map((i) => `${i.quantity}× ${i.title}`)
    .join("\n");
  const relayPoint = order.relayPoint
    ? [
        order.relayPoint.name,
        order.relayPoint.line1,
        `${order.relayPoint.postalCode} ${order.relayPoint.city}`,
      ]
        .filter(Boolean)
        .join("\n")
    : null;

  await sendMail({
    to: order.customerEmail,
    subject: "Votre commande Morphose Éditions est en route",
    heading: "Colis expédié",
    intro:
      "Votre colis vient d'être remis à Mondial Relay. Vous serez prévenu·e par Mondial Relay dès qu'il sera disponible dans votre point relais ; pensez à vous munir d'une pièce d'identité pour le retirer.",
    fields: relayPoint ? [{ label: "Point relais", value: relayPoint }] : [],
    body: { label: "Articles", value: items },
    cta: trackingUrl ? { label: "Suivre mon colis", url: trackingUrl } : undefined,
    replyTo: { email: TO_EMAIL, name: "Morphose Éditions" },
  });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminUser(bearerToken(req));
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = OrderUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const ref = adminDb().collection("orders").doc(id);
  const before = await ref.get();
  if (!before.exists) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const previous = before.data() as Order;
  // shippedAt déjà renseigné = le client a déjà été prévenu : on ne renvoie pas l'e-mail.
  const justShipped =
    parsed.data.status === "shipped" &&
    previous.status !== "shipped" &&
    !previous.shippedAt;

  if (justShipped) {
    const trackingUrl = previous.sendcloudParcelId
      ? await getParcelTrackingUrl(previous.sendcloudParcelId)
      : null;
    await ref.update({
      status: parsed.data.status,
      shippedAt: Date.now(),
      trackingUrl,
      updatedAt: Date.now(),
    });
    await notifyShipped(previous, trackingUrl);
  } else {
    await ref.update({ status: parsed.data.status, updatedAt: Date.now() });
  }

  const snap = await ref.get();

  return NextResponse.json(snap.data());
}
