import Image from "next/image";
import { cn } from "@/lib/utils";

interface TokenAvatarProps {
  symbol: string;
  imageUrl?: string;
  size?: number;
  className?: string;
}

export function TokenAvatar({
  symbol,
  imageUrl,
  size = 36,
  className,
}: TokenAvatarProps) {
  const letter = (symbol[0] ?? "?").toUpperCase();

  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={symbol}
        width={size}
        height={size}
        className={cn("shrink-0 rounded-full bg-chad-bg object-cover", className)}
        unoptimized
      />
    );
  }

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-chad-bg font-bold text-chad-accent",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {letter}
    </span>
  );
}
