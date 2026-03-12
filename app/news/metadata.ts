import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Market News - Latest Financial News & Analysis",
  description:
    "Stay updated with the latest stock market news, company earnings, economic updates, and financial analysis. Curated news for serious investors.",
  keywords: [
    "stock market news",
    "financial news",
    "market analysis",
    "earnings news",
    "company news",
    "economic news",
    "investing news",
    "stock news today",
  ],
  openGraph: {
    title: "Market News | MarketView360",
    description:
      "Latest financial news, company earnings, and market analysis for investors.",
    url: "https://www.marketview360.io/news",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Market News - MarketView360",
    description:
      "Stay updated with curated financial news and market analysis.",
  },
  alternates: {
    canonical: "/news",
  },
};
