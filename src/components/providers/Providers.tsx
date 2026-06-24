"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import {
  createSolanaRpc,
  createSolanaRpcSubscriptions,
} from "@solana/kit";

function getSolanaRpcUrls() {
  const http =
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL ??
    "https://api.mainnet-beta.solana.com";
  const ws = http.startsWith("https")
    ? http.replace("https://", "wss://")
    : http.replace("http://", "ws://");
  return { http, ws };
}

export function Providers({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!appId) {
    return <>{children}</>;
  }

  const { http, ws } = getSolanaRpcUrls();

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
            "solana:mainnet": {
              rpc: createSolanaRpc(http),
              rpcSubscriptions: createSolanaRpcSubscriptions(ws),
            },
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
