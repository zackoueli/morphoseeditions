import { NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdminUser } from "@/lib/admin-auth";

const NewsInputSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  excerpt: z.string().min(1),
  content: z.string().min(1),
  coverImageUrl: z.string().url().nullable(),
  galleryImageUrls: z.array(z.string().url()).default([]),
  published: z.boolean(),
  publishedAt: z.number(),
});

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

  const snapshot = await adminDb().collection("news").orderBy("publishedAt", "desc").get();
  return NextResponse.json(snapshot.docs.map((d) => d.data()));
}

export async function POST(req: Request) {
  try {
    await requireAdminUser(bearerToken(req));
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = NewsInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }

  const db = adminDb();
  const ref = db.collection("news").doc();
  const now = Date.now();
  const post = { ...parsed.data, id: ref.id, createdAt: now, updatedAt: now };
  await ref.set(post);

  return NextResponse.json(post, { status: 201 });
}
