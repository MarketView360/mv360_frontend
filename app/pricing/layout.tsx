import { BreadcrumbSchema } from "@/components/seo";

export { metadata } from "./metadata";

export default function PricingLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <BreadcrumbSchema
                items={[
                    { name: "Home", url: "https://www.marketview360.io" },
                    { name: "Pricing", url: "https://www.marketview360.io/pricing" },
                ]}
            />
            {children}
        </>
    );
}
