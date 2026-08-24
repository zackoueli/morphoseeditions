import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function GET() {
  const snapshot = await adminDb()
    .collection("issues")
    .where("published", "==", true)
    .get();

  const issues = snapshot.docs
    .map((d) => d.data())
    .sort((a, b) => b.issueNumber - a.issueNumber);

  return NextResponse.json(issues);
}
