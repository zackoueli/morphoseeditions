import { NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdminUser } from "@/lib/admin-auth";

const OrderUpdateSchema = z.object({
  status: z.enum(["pending_payment", "paid", "shipped", "cancelled"]),
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
  const parsed = OrderUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const ref = adminDb().collection("orders").doc(id);
  await ref.update({ status: parsed.data.status, updatedAt: Date.now() });
  const snap = await ref.get();

  return NextResponse.json(snap.data());
}
