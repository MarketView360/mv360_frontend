import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Market Overview - Real-Time US Market Data",
  description:
    "Track US stock market in real-time. View market breadth, sector performance, top gainers and losers, and key indices like S&P 500, NASDAQ, and Dow Jones.",
  keywords: [
    "stock market overview",
    "US market data",
    "market breadth",
    "sector performance",
    "S&P 500",
    "NASDAQ",
    "Dow Jones",
    "market movers",
    "top gainers",
    "top losers",
  ],
  openGraph: {
    title: "Market Overview | MarketView360",
    description:
      "Real-time US market data with sector performance, market breadth, and top movers.",
    url: "https://www.marketview360.io/market",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "US Market Overview",
    description:
      "Track S&P 500, NASDAQ, Dow Jones with real-time sector performance and market movers.",
  },
  alternates: {
    canonical: "/market",
  },
};
