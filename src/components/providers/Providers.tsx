"use client";

import { useMemo } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import {
  createSolanaRpc,
  createSolanaRpcSubscriptions,
} from "@solana/kit";

function toWebSocketUrl(httpUrl: string): string {
  try {
    const url = new URL(httpUrl.trim());
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    return url.toString();
  } catch {
    return "wss://api.mainnet-beta.solana.com";
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  const solanaRpc = useMemo(() => {
    const http =
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL?.trim() ??
      "https://api.mainnet-beta.solana.com";

    return {
      rpc: createSolanaRpc(http),
      rpcSubscriptions: createSolanaRpcSubscriptions(toWebSocketUrl(http)),
    };
  }, []);

  if (!appId) {
    return <>{children}</>;
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#39FF14",
          logo: "/chadwallet-logo.svg",
          walletChainType: "solana-only",
        },
        loginMethods: ["google"],
        solana: {
          rpcs: {
            "solana:mainnet": solanaRpc,
          },
        },
        embeddedWallets: {
          solana: {
            createOnLogin: "off",
          },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
