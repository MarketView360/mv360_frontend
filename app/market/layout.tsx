import type { ReactNode } from "react";
import { BreadcrumbSchema } from "@/components/seo";

export { metadata } from "./metadata";

export default function MarketLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://www.marketview360.io" },
          { name: "Market", url: "https://www.marketview360.io/market" },
        ]}
      />
      {children}
    </>
  );
}
