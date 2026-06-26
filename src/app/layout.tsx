import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import { BRAND } from "@/lib/branding";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#0b0f14",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "ChadWallet — Social Crypto Trading",
  description:
    "Trade Solana tokens in seconds. fomo-style social trading powered by Privy, Codex, Jupiter, and Alchemy.",
  icons: { icon: BRAND.logoLight },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-chad-bg text-chad-text">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
