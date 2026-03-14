import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  priority?: boolean;
}

const SIZES = {
  sm: { width: 120, height: 28 },
  md: { width: 152, height: 32 },
  lg: { width: 180, height: 40 },
} as const;

export function Logo({
  className,
  size = "md",
  priority = false,
}: LogoProps) {
  const { width, height } = SIZES[size];

  return (
    <Link
      href="/"
      aria-label="MarketView360 — Home"
      className={cn(
        "flex-shrink-0 rounded-sm",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
    >
      {/* Light mode */}
      <Image
        src="/logo/logo-light.svg"
        alt="MarketView360"
        width={width}
        height={height}
        priority={priority}
        className="block dark:hidden w-auto h-auto"
      />
      {/* Dark mode */}
      <Image
        src="/logo/logo-dark.svg"
        alt="MarketView360"
        width={width}
        height={height}
        priority={priority}
        className="hidden dark:block w-auto h-auto"
      />
    </Link>
  );
}

export default Logo;
