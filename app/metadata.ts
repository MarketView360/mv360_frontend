import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "MarketView360 - Professional Stock Analysis & Screening Platform",
    template: "%s | MarketView360",
  },
  description:
    "Advanced financial data screening and analysis platform with 80+ metrics, AI-powered insights, real-time charts, and comprehensive company analytics for serious investors.",
  keywords: [
    "stock screener",
    "stock analysis",
    "financial data",
    "market analysis",
    "investment research",
    "stock metrics",
    "technical analysis",
    "fundamental analysis",
    "portfolio management",
    "trading tools",
  ],
  authors: [{ name: "MarketView360 Team" }],
  creator: "MarketView360",
  publisher: "MarketView360",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://www.marketview360.io"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.marketview360.io",
    siteName: "MarketView360",
    title: "MarketView360 - Professional Stock Analysis Platform",
    description:
      "Advanced financial data screening and analysis platform with 80+ metrics, AI-powered insights, and real-time charts.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MarketView360 Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MarketView360 - Professional Stock Analysis Platform",
    description:
      "Advanced financial data screening and analysis platform with 80+ metrics, AI-powered insights, and real-time charts.",
    creator: "@marketview360",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-icon.svg", type: "image/svg+xml", sizes: "180x180" },
    ],
  },
  manifest: "/site.webmanifest",
};
