import { NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdminUser } from "@/lib/admin-auth";

const IssueInputSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  issueNumber: z.number().int().min(1),
  description: z.string().min(1),
  coverImageUrl: z.string().url(),
  pageImageUrls: z.array(z.string().url()),
  priceCents: z.number().int().min(0),
  stock: z.number().int().min(0),
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

  const snapshot = await adminDb().collection("issues").orderBy("issueNumber", "desc").get();
  return NextResponse.json(snapshot.docs.map((d) => d.data()));
}

export async function POST(req: Request) {
  try {
    await requireAdminUser(bearerToken(req));
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = IssueInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }

  const db = adminDb();
  const ref = db.collection("issues").doc();
  const now = Date.now();
  const issue = { ...parsed.data, id: ref.id, createdAt: now, updatedAt: now };
  await ref.set(issue);

  return NextResponse.json(issue, { status: 201 });
}
