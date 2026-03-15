import type { ReactNode } from "react";
import { BreadcrumbSchema } from "@/components/seo";

export { metadata } from "./metadata";

export default function ContactLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://www.marketview360.io" },
          { name: "Contact", url: "https://www.marketview360.io/contact" },
        ]}
      />
      {children}
    </>
  );
}
