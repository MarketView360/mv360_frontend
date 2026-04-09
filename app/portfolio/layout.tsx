"use client";

import { ReactNode } from "react";
import { PortfolioProvider } from "@/providers/PortfolioProvider";

export default function PortfolioLayout({ children }: { children: ReactNode }) {
  return <PortfolioProvider>{children}</PortfolioProvider>;
}
