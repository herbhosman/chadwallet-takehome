import { NextRequest, NextResponse } from "next/server";
import { getJupiterOrder } from "@/lib/jupiter";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const inputMint = searchParams.get("inputMint");
  const outputMint = searchParams.get("outputMint");
  const amount = searchParams.get("amount");
  const taker = searchParams.get("taker");
  const slippageBps = searchParams.get("slippageBps");

  if (!inputMint || !outputMint || !amount || !taker) {
    return NextResponse.json(
      { error: "inputMint, outputMint, amount, and taker are required" },
      { status: 400 },
    );
  }

  try {
    const order = await getJupiterOrder({
      inputMint,
      outputMint,
      amount,
      taker,
      slippageBps: slippageBps ? parseInt(slippageBps, 10) : undefined,
    });
    return NextResponse.json(order);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Quote failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
