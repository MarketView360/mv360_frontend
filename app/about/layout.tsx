import type { ReactNode } from "react";
import { BreadcrumbSchema } from "@/components/seo";

export { metadata } from "./metadata";

export default function AboutLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://www.marketview360.io" },
          { name: "About", url: "https://www.marketview360.io/about" },
        ]}
      />
      {children}
    </>
  );
}
