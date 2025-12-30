"use client";

import { useState } from "react";

interface CompanyLogoProps {
  ticker: string;
  name: string;
  size?: "sm" | "md" | "lg";
}

const LOGO_DEV_BASE = "https://img.logo.dev/ticker";
const LOGO_DEV_TOKEN = process.env.NEXT_PUBLIC_LOGO_DEV_PUBLISHABLE_KEY;

export function CompanyLogo({ ticker, name, size = "md" }: CompanyLogoProps) {
  const [error, setError] = useState(false);

  const sizeClasses = {
    sm: "w-8 h-8 text-xs rounded-md",
    md: "w-16 h-16 text-2xl rounded-xl",
    lg: "w-20 h-20 text-3xl rounded-xl",
  };

  const symbol = ticker?.toLowerCase();
  const hasToken = !!LOGO_DEV_TOKEN;
  const src = hasToken
    ? `${LOGO_DEV_BASE}/${encodeURIComponent(symbol)}?token=${LOGO_DEV_TOKEN}`
    : null;

  if (!src || error) {
    return (
      <div className={`${sizeClasses[size]} bg-brand text-white flex items-center justify-center font-bold shadow-lg flex-shrink-0`}>
        {ticker?.[0] ?? "?"}
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} bg-slate-100 dark:bg-slate-900 flex items-center justify-center overflow-hidden shadow-lg flex-shrink-0`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`${name} logo`}
        className="w-full h-full object-contain p-2"
        onError={() => setError(true)}
      />
    </div>
  );
}
