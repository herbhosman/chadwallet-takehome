import { NextRequest, NextResponse } from "next/server";
import { CODEX_GRAPHQL_URL } from "@/lib/constants";

export async function POST(req: NextRequest) {
  const apiKey = process.env.CODEX_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { errors: [{ message: "CODEX_API_KEY not configured" }] },
      { status: 503 },
    );
  }

  const body = await req.json();

  const res = await fetch(CODEX_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
