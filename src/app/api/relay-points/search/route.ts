import { NextResponse } from "next/server";
import { z } from "zod";
import { searchRelayPoints } from "@/lib/sendcloud";

const SearchSchema = z.object({
  postalCode: z.string().trim().min(4).max(10),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = SearchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  try {
    const points = await searchRelayPoints(parsed.data.postalCode);
    if (points === null) {
      return NextResponse.json({ error: "not_configured" }, { status: 503 });
    }
    return NextResponse.json({ points });
  } catch (err) {
    console.error("mondial-relay/search:", err);
    return NextResponse.json({ error: "search_failed" }, { status: 502 });
  }
}
