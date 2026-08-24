import { adminAuth } from "@/lib/firebase/admin";

export async function requireAdminUser(idToken: string | null) {
  if (!idToken) throw new Error("unauthenticated");
  const decoded = await adminAuth().verifyIdToken(idToken);
  if (!decoded.admin) throw new Error("forbidden");
  return decoded;
}
