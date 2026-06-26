import { SOL_MINT } from "@/lib/constants";
import type { TokenInfo } from "@/types/token";

/** Maps known tokens to TradingView Advanced Chart widget symbols. */
export function getTradingViewSymbol(token: TokenInfo): string | null {
  if (token.address === SOL_MINT || token.symbol === "SOL") {
    return "BINANCE:SOLUSDT";
  }
  if (token.symbol === "USDC") {
    return "BINANCE:USDCUSDT";
  }
  return null;
}
