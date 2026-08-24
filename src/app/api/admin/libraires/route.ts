import { NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdminUser } from "@/lib/admin-auth";

const LibrairesSchema = z.object({ content: z.string().min(1) });

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

  const snap = await adminDb().collection("settings").doc("libraires").get();
  return NextResponse.json(snap.exists ? snap.data() : { content: "" });
}

export async function PUT(req: Request) {
  try {
    await requireAdminUser(bearerToken(req));
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = LibrairesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  await adminDb()
    .collection("settings")
    .doc("libraires")
    .set({ content: parsed.data.content, updatedAt: Date.now() });

  return NextResponse.json({ ok: true });
}
