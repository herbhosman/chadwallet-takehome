import { NextRequest, NextResponse } from "next/server";
import { executeJupiterOrder } from "@/lib/jupiter";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { signedTransaction, requestId } = body as {
    signedTransaction?: string;
    requestId?: string;
  };

  if (!signedTransaction || !requestId) {
    return NextResponse.json(
      { error: "signedTransaction and requestId are required" },
      { status: 400 },
    );
  }

  try {
    const result = await executeJupiterOrder({ signedTransaction, requestId });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Execute failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
