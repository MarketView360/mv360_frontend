import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stock Screener - Filter Stocks by 80+ Metrics",
  description:
    "Screen US stocks with 80+ fundamental and technical metrics. Filter by market cap, P/E ratio, dividend yield, RSI, moving averages, and more. Find your next investment opportunity.",
  keywords: [
    "stock screener",
    "stock filter",
    "fundamental analysis",
    "technical analysis",
    "P/E ratio screener",
    "dividend stock finder",
    "market cap filter",
    "RSI screener",
    "moving average filter",
    "value stocks",
    "growth stocks",
  ],
  openGraph: {
    title: "Stock Screener - 80+ Metrics | MarketView360",
    description:
      "Powerful stock screener with 80+ filters. Screen by fundamentals, technicals, and custom criteria. Free to use.",
    url: "https://www.marketview360.io/screens",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stock Screener - 80+ Metrics",
    description:
      "Filter US stocks by market cap, P/E, dividends, RSI, and 80+ more metrics. Free stock screener.",
  },
  alternates: {
    canonical: "/screens",
  },
};
