import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pricing - MarketView360",
    description: "Choose the perfect plan for your investment journey. Start free, upgrade anytime.",
};

export default function PricingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
