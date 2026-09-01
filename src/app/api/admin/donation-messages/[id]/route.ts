import { NextResponse } from "next/server";
import { adminDb, adminStorage } from "@/lib/firebase/admin";
import { requireAdminUser } from "@/lib/admin-auth";

function bearerToken(req: Request): string | null {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length);
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
  await adminDb().collection("donationMessages").doc(id).delete();

  // Supprime aussi le média associé (best-effort).
  await adminStorage()
    .bucket()
    .deleteFiles({ prefix: `donation-messages/${id}/` })
    .catch(() => {});

  return NextResponse.json({ ok: true });
}
