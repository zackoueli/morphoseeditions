import { NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdminUser } from "@/lib/admin-auth";
import {
  createDonationMessage,
  MAX_IMAGE_BASE64,
  MAX_MESSAGE,
  MAX_NAME,
} from "@/lib/donation-messages";

function bearerToken(req: Request): string | null {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length);
}

export async function GET(req: Request) {
  try {
    await requireAdminUser(bearerToken(req));
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const snapshot = await adminDb()
    .collection("donationMessages")
    .orderBy("createdAt", "desc")
    .limit(500)
    .get();

  return NextResponse.json(snapshot.docs.map((d) => d.data()));
}

const CreateSchema = z
  .object({
    message: z.string().max(MAX_MESSAGE).optional().default(""),
    authorName: z.string().max(MAX_NAME).optional().default(""),
    imageDataUrl: z.string().max(MAX_IMAGE_BASE64).optional(),
    kind: z.enum(["photo", "drawing"]).optional(),
  })
  .refine((v) => v.message.trim().length > 0 || v.imageDataUrl, {
    message: "empty_contribution",
  });

export async function POST(req: Request) {
  try {
    await requireAdminUser(bearerToken(req));
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  try {
    const doc = await createDonationMessage({
      ...parsed.data,
      stripeSessionId: null,
    });
    return NextResponse.json(doc, { status: 201 });
  } catch {
    return NextResponse.json({ error: "invalid_image" }, { status: 400 });
  }
}
