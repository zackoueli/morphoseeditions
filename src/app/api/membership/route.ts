import { NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase/admin";
import { sendMail } from "@/lib/mail";

const MembershipSchema = z.object({
  firstName: z.string().min(1).max(200),
  lastName: z.string().min(1).max(200),
  birthDate: z.string().min(1).max(40),
  email: z.string().email(),
  phone: z.string().max(40).optional().or(z.literal("")),
  address: z.string().max(1000).optional().or(z.literal("")),
  message: z.string().max(5000).optional().or(z.literal("")),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = MembershipSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const { firstName, lastName, birthDate, email, phone, address, message } =
    parsed.data;

  // La demande part par e-mail même si l'écriture Firestore échoue : on
  // n'échoue pas la requête pour ne pas afficher une erreur alors que
  // l'e-mail a bien été envoyé.
  try {
    await adminDb()
      .collection("membershipApplications")
      .add({ ...parsed.data, createdAt: Date.now() });
  } catch (err) {
    console.error("membership: échec de l'écriture Firestore", err);
  }

  await sendMail({
    subject: `Nouvelle demande d'adhésion — ${firstName} ${lastName}`,
    heading: "Nouvelle demande d'adhésion",
    intro: "Une demande d'adhésion vient d'être envoyée depuis le site.",
    fields: [
      { label: "Prénom", value: firstName },
      { label: "Nom", value: lastName },
      { label: "Date de naissance", value: birthDate },
      { label: "E-mail", value: email },
      { label: "Téléphone", value: phone || "" },
      { label: "Adresse", value: address || "" },
    ],
    body: { label: "Message", value: message || "" },
    replyTo: { email, name: `${firstName} ${lastName}` },
  });

  return NextResponse.json({ ok: true });
}
