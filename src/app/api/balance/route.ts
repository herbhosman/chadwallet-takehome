import { NextRequest, NextResponse } from "next/server";
import { getSolBalance, getTokenBalance } from "@/lib/jupiter";

export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get("wallet");
  const mint = req.nextUrl.searchParams.get("mint");

  if (!wallet) {
    return NextResponse.json({ error: "wallet required" }, { status: 400 });
  }

  try {
    const sol = await getSolBalance(wallet);
    const token = mint ? await getTokenBalance(wallet, mint) : 0;
    return NextResponse.json({ sol, token });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Balance fetch failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
