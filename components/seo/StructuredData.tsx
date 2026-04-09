"use client";

import Script from "next/script";

const SITE_URL = "https://www.marketview360.io";
const SITE_NAME = "MarketView360";

// Organization Schema - Company information for AI and search engines
export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/logo.png`,
      width: 512,
      height: 512,
    },
    image: `${SITE_URL}/og-image.png`,
    description:
      "MarketView360 is a professional stock analysis and screening platform with 80+ metrics, AI-powered insights, real-time charts, and comprehensive company analytics for US equities.",
    foundingDate: "2024",
    sameAs: [
      "https://twitter.com/marketview360",
      "https://linkedin.com/company/marketview360",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "support@marketview360.io",
      url: `${SITE_URL}/contact`,
    },
  };

  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// WebSite Schema - With sitelinks search box for Google
export function WebSiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description:
      "Professional stock analysis and screening platform for US equities",
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/company/{search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: "en-US",
  };

  return (
    <Script
      id="website-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// WebApplication Schema - SaaS product information
export function WebApplicationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": `${SITE_URL}/#webapp`,
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Advanced financial data screening and analysis platform with 80+ metrics, AI-powered insights, real-time charts, and comprehensive company analytics for serious investors.",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    offers: [
      {
        "@type": "Offer",
        name: "Free Forever",
        price: "0",
        priceCurrency: "USD",
        description: "Basic stock screener, market overview, and limited AI chat",
      },
      {
        "@type": "Offer",
        name: "Premium",
        price: "9.99",
        priceCurrency: "USD",
        priceValidUntil: "2026-12-31",
        description:
          "Advanced screener, unlimited results, real-time quotes, full AI access",
      },
      {
        "@type": "Offer",
        name: "Max",
        price: "49.99",
        priceCurrency: "USD",
        priceValidUntil: "2026-12-31",
        description:
          "Professional features, API access, unlimited AI, advanced analytics",
      },
    ],
    featureList: [
      "Stock Screener with 80+ metrics",
      "Real-time price charts",
      "AI-powered stock analysis",
      "Watchlist management",
      "Market news and insights",
      "Technical indicators",
      "Fundamental analysis",
      "Earnings calendar",
      "Company financials",
    ],
    screenshot: `${SITE_URL}/og-image.png`,
    softwareVersion: "2.0",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "156",
      bestRating: "5",
      worstRating: "1",
    },
    provider: {
      "@id": `${SITE_URL}/#organization`,
    },
  };

  return (
    <Script
      id="webapp-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// FAQPage Schema - For Help/FAQ pages
interface FAQItem {
  question: string;
  answer: string;
}

export function FAQPageSchema({ faqs }: { faqs: FAQItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <Script
      id="faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// BreadcrumbList Schema - For navigation
interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// FinancialProduct Schema - For company pages
interface StockData {
  ticker: string;
  name: string;
  exchange: string;
  sector?: string;
  industry?: string;
  description?: string;
}

export function FinancialProductSchema({ stock }: { stock: StockData }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FinancialProduct",
    name: `${stock.ticker} - ${stock.name}`,
    description:
      stock.description ||
      `Stock analysis and financial data for ${stock.name} (${stock.ticker})`,
    category: stock.sector || "Equity",
    provider: {
      "@type": "Organization",
      name: stock.exchange,
    },
    url: `${SITE_URL}/company/${stock.ticker}`,
  };

  return (
    <Script
      id="financial-product-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Article Schema - For blog posts
interface ArticleData {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
  image?: string;
}

export function ArticleSchema({ article }: { article: ArticleData }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    url: article.url,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: {
      "@type": "Organization",
      name: SITE_NAME,
    },
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
    image: article.image || `${SITE_URL}/og-image.png`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": article.url,
    },
  };

  return (
    <Script
      id="article-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// SoftwareApplication Schema (alternative to WebApplication for app stores)
export function SoftwareApplicationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "156",
    },
  };

  return (
    <Script
      id="software-app-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Combined global schemas for the root layout
export function GlobalStructuredData() {
  return (
    <>
      <OrganizationSchema />
      <WebSiteSchema />
      <WebApplicationSchema />
    </>
  );
}
