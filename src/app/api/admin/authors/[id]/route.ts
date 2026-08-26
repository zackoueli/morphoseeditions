import { NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdminUser } from "@/lib/admin-auth";

const AuthorUpdateSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  role: z.string().default(""),
  bio: z.string().default(""),
  photoUrl: z.string().url(),
  portfolioImageUrls: z.array(z.string().url()).default([]),
  email: z.string().email().or(z.literal("")).default(""),
  website: z.string().url().or(z.literal("")).default(""),
  instagram: z.string().default(""),
  facebook: z.string().default(""),
  published: z.boolean(),
});

function bearerToken(req: Request): string | null {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length);
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
  const parsed = AuthorUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }

  const ref = adminDb().collection("authors").doc(id);
  await ref.update({ ...parsed.data, updatedAt: Date.now() });
  const snap = await ref.get();

  return NextResponse.json(snap.data());
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminUser(bearerToken(req));
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await adminDb().collection("authors").doc(id).delete();
  return NextResponse.json({ ok: true });
}
