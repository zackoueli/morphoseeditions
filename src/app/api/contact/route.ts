import { NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase/admin";
import { sendMail } from "@/lib/mail";

const ContactSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  message: z.string().min(1).max(5000),
  type: z.enum(["contact", "membership"]).default("contact"),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = ContactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const { name, email, message, type } = parsed.data;

  await adminDb()
    .collection("contactMessages")
    .add({ ...parsed.data, createdAt: Date.now() });

  const isMembership = type === "membership";
  await sendMail({
    subject: isMembership
      ? `Nouvelle demande d'adhésion — ${name}`
      : `Nouveau message de contact — ${name}`,
    heading: isMembership
      ? "Nouvelle demande d'adhésion"
      : "Nouveau message de contact",
    intro: isMembership
      ? "Une demande d'adhésion vient d'être envoyée depuis le site."
      : "Un message vient d'être envoyé depuis le formulaire de contact.",
    fields: [
      { label: "Nom", value: name },
      { label: "E-mail", value: email },
    ],
    body: { label: "Message", value: message },
    replyTo: { email, name },
  });

  return NextResponse.json({ ok: true });
}
