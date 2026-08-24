import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdminUser } from "@/lib/admin-auth";

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
    .collection("orders")
    .orderBy("createdAt", "desc")
    .limit(200)
    .get();

  return NextResponse.json(snapshot.docs.map((d) => d.data()));
}
