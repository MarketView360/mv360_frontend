import type { ReactNode } from "react";
import { BreadcrumbSchema } from "@/components/seo";

export { metadata } from "./metadata";

export default function AiLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://www.marketview360.io" },
          { name: "AI Assistant", url: "https://www.marketview360.io/ai" },
        ]}
      />
      {children}
    </>
  );
}
