import type { ReactNode } from "react";
import { BreadcrumbSchema, FAQPageSchema } from "@/components/seo";

export { metadata } from "./metadata";

// FAQ data for structured data
const faqsForSchema = [
  {
    question: "What is Marketview360?",
    answer: "Marketview360 is a comprehensive platform for analyzing US equities. We provide real-time stock data, financial metrics, technical analysis, market news, and an AI-powered assistant to help you make informed investment decisions.",
  },
  {
    question: "Is Marketview360 free to use?",
    answer: "Yes! We offer a free tier with access to core features including stock screening, market overview, news, and limited AI chat. Premium features and higher usage limits are available through paid subscriptions.",
  },
  {
    question: "How does the stock screener work?",
    answer: "Our screener lets you filter stocks based on various criteria including market cap, P/E ratio, dividend yield, sector, and technical indicators. Select your filters, and we'll show you matching stocks in real-time.",
  },
  {
    question: "What can the AI assistant help me with?",
    answer: "Our AI assistant Jovan can answer questions about stocks, explain financial concepts, analyze company fundamentals, discuss market trends, and help you understand technical analysis.",
  },
  {
    question: "How is my data protected?",
    answer: "We use industry-standard encryption (TLS/SSL) for all data transmission. Passwords are hashed, API keys are encrypted at rest, and we follow security best practices.",
  },
];

export default function HelpLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://www.marketview360.io" },
          { name: "Help Center", url: "https://www.marketview360.io/help" },
        ]}
      />
      <FAQPageSchema faqs={faqsForSchema} />
      {children}
    </>
  );
}
