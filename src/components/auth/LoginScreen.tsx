"use client";

import Image from "next/image";
import { useLogin } from "@privy-io/react-auth";
import { BRAND } from "@/lib/branding";

export function LoginScreen() {
  const { login } = useLogin();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-chad-bg px-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          background:
            "linear-gradient(180deg, #5eb8ff 0%, #7ee8b0 55%, transparent 100%)",
        }}
      />
      <div className="relative w-full max-w-sm space-y-8 text-center">
        <div className="space-y-4">
          <Image
            src={BRAND.logoLight}
            alt="ChadWallet"
            width={112}
            height={112}
            priority
            className="mx-auto rounded-2xl"
          />
          <h1 className="text-3xl font-black tracking-tight text-chad-text">
            Chad<span className="text-chad-accent">Wallet</span>
          </h1>
          <p className="text-sm font-semibold text-chad-text">{BRAND.tagline}</p>
          <p className="text-sm text-chad-muted">{BRAND.subtitle}</p>
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
