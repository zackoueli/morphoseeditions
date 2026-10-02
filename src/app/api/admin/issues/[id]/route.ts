import { NextResponse } from "next/server";
import { revalidatePublicPages } from "@/lib/revalidate";
import { z } from "zod";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdminUser } from "@/lib/admin-auth";
import { resolvePreviewPages } from "@/lib/issue-previews";

const IssueUpdateSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  description2: z.string().default(""),
  coverImageUrl: z.string().url(),
  backgroundImageUrl: z.string().url().or(z.literal("")).default(""),
  buttonColor: z.string().default("#dc2626"),
  pageImageUrls: z.array(z.string().url()),
  /** Affiché dans la rubrique Lecture. */
  readable: z.boolean().default(true),
  /** Pages mises en avant sur la fiche (numéros) ; vide = choix automatique. */
  previewPages: z.array(z.number().int().min(1)).max(12).default([]),
  priceCents: z.number().int().min(0),
  stock: z.number().int().min(0),
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
  const parsed = IssueUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }

  const ref = adminDb().collection("issues").doc(id);
  const previewPages = await resolvePreviewPages(
    parsed.data.previewPages,
    parsed.data.pageImageUrls
  );
  await ref.update({ ...parsed.data, previewPages, updatedAt: Date.now() });
  const snap = await ref.get();

  revalidatePublicPages();
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
  await adminDb().collection("issues").doc(id).delete();
  revalidatePublicPages();
  return NextResponse.json({ ok: true });
}
