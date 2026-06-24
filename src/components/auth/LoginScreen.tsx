"use client";

import Image from "next/image";
import { useLogin } from "@privy-io/react-auth";

export function LoginScreen() {
  const { login } = useLogin();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-chad-bg px-6">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="space-y-4">
          <Image
            src="/chadwallet-logo.svg"
            alt="ChadWallet"
            width={80}
            height={80}
            className="mx-auto"
          />
          <h1 className="text-3xl font-black tracking-tight text-chad-text">
            Chad<span className="text-chad-accent">Wallet</span>
          </h1>
          <p className="text-sm text-chad-muted">
            Trade Solana tokens in seconds. Where traders become legends.
          </p>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={login}
            className="w-full rounded-2xl bg-white py-3.5 text-sm font-semibold text-black transition-transform active:scale-[0.98]"
          >
            Continue with Google or Apple
          </button>
          <p className="text-[11px] text-chad-muted">
            Gasless swaps · Embedded Solana wallet · Powered by Privy
          </p>
        </div>
      </div>
    </div>
  );
}
