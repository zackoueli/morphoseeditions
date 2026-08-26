import { NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdminUser } from "@/lib/admin-auth";

const AuthorInputSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  role: z.string().default(""),
  bio: z.string().default(""),
  photoUrl: z.string().url(),
  published: z.boolean(),
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

  const snapshot = await adminDb().collection("authors").orderBy("name", "asc").get();
  return NextResponse.json(snapshot.docs.map((d) => d.data()));
}

export async function POST(req: Request) {
  try {
    await requireAdminUser(bearerToken(req));
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = AuthorInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }

  const db = adminDb();
  const ref = db.collection("authors").doc();
  const now = Date.now();
  const author = { ...parsed.data, id: ref.id, createdAt: now, updatedAt: now };
  await ref.set(author);

  return NextResponse.json(author, { status: 201 });
}
