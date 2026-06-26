import { NextRequest, NextResponse } from "next/server";
import { searchTokens } from "@/lib/codex";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q) {
    return NextResponse.json([]);
  }

  const limit = Math.min(
    parseInt(req.nextUrl.searchParams.get("limit") ?? "25", 10) || 25,
    50,
  );

  const results = await searchTokens(q, limit);
  return NextResponse.json(results);
}
