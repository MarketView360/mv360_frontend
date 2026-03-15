# SEO Implementation Guide for MarketView360

This document covers the SEO infrastructure implemented for MarketView360.

## 1. Technical Foundation

### Robots.txt (`/public/robots.txt`)
- Configured for AI bot discovery (GPTBot, PerplexityBot, ClaudeBot, Google-Extended)
- Allows search engine crawlers (Googlebot, Bingbot)
- Blocks aggressive scrapers (AhrefsBot, SemrushBot)
- Disallows API routes, admin pages, and Next.js internals

### Sitemap (`/app/sitemap.ts`)
- Dynamic sitemap generation with Next.js
- Includes all static pages with appropriate priorities
- Includes 70+ popular stock company pages for SEO
- Auto-generated at `/sitemap.xml`

### IndexNow Integration
- **Key file**: `/public/fd33e1d170a841198cc2751f74fbe212.txt`
- **API endpoint**: `POST /api/indexnow`
- Submits URLs to Bing, Yandex, and other IndexNow-compatible engines
- Use when publishing/updating content for instant indexing

**Usage:**
```typescript
// Submit URLs for instant indexing
await fetch('/api/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    urls: [
      'https://www.marketview360.io/blog/new-post',
      'https://www.marketview360.io/company/AAPL'
    ]
  })
});
```

## 2. Structured Data (JSON-LD)

### Components (`/components/seo/StructuredData.tsx`)

| Component | Schema Type | Usage |
|-----------|-------------|-------|
| `GlobalStructuredData` | Organization, WebSite, WebApplication | Root layout (global) |
| `OrganizationSchema` | Organization | Company info for search/AI |
| `WebSiteSchema` | WebSite | Site info with search action |
| `WebApplicationSchema` | WebApplication | SaaS product details |
| `FAQPageSchema` | FAQPage | Help/FAQ pages |
| `BreadcrumbSchema` | BreadcrumbList | Navigation breadcrumbs |
| `FinancialProductSchema` | FinancialProduct | Company stock pages |
| `ArticleSchema` | Article | Blog posts |

**Validation:** Test at [Google Rich Results Test](https://search.google.com/test/rich-results)

## 3. Page Metadata

### Global Metadata (`/app/metadata.ts`)
- Default title template: `%s | MarketView360`
- OpenGraph and Twitter Card configuration
- Canonical URLs and robots directives

### Page-Specific Metadata
Each major page has a `metadata.ts` file:

| Page | File |
|------|------|
| About | `/app/about/metadata.ts` |
| Pricing | `/app/pricing/metadata.ts` |
| Help | `/app/help/metadata.ts` |
| Screens | `/app/screens/metadata.ts` |
| Market | `/app/market/metadata.ts` |
| News | `/app/news/metadata.ts` |
| AI | `/app/ai/metadata.ts` |
| Contact | `/app/contact/metadata.ts` |

## 4. AI Discoverability

### Optimized For:
- **ChatGPT** (GPTBot allowed in robots.txt)
- **Perplexity** (PerplexityBot allowed)
- **Claude** (ClaudeBot allowed)
- **Google AI Overviews** (Googlebot + Google-Extended allowed)

### Best Practices:
1. Clear, structured content with explicit Q&A sections (Help page)
2. Comprehensive About page explaining what MarketView360 is
3. FAQ schema markup for rich results
4. Clean URL structure: `/company/AAPL`, `/screens`, `/market`

## 5. Next Steps & Manual Tasks

### Submit to Search Consoles
1. **Google Search Console**: https://search.google.com/search-console
   - Add property: `https://www.marketview360.io`
   - Submit sitemap: `https://www.marketview360.io/sitemap.xml`
   
2. **Bing Webmaster Tools**: https://www.bing.com/webmasters
   - Add site and submit sitemap
   - Enable IndexNow for instant indexing

### Monitor & Optimize
- Check Core Web Vitals in Google Search Console
- Monitor indexing status and coverage
- Track AI citations in ChatGPT, Perplexity searches

### Content Strategy
- Create blog posts answering stock analysis questions
- Add glossary pages for financial terms
- Create educational content about screener usage

## 6. File Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Global structured data
│   ├── metadata.ts         # Global metadata
│   ├── sitemap.ts          # Dynamic sitemap
│   ├── api/
│   │   └── indexnow/
│   │       └── route.ts    # IndexNow API
│   ├── about/
│   │   ├── layout.tsx      # Breadcrumb schema
│   │   └── metadata.ts     # Page metadata
│   └── [other pages]/
│       ├── layout.tsx
│       └── metadata.ts
├── components/
│   └── seo/
│       ├── index.ts        # Exports
│       └── StructuredData.tsx
├── public/
│   ├── robots.txt          # Crawler rules
│   ├── fd33e1d170a841198cc2751f74fbe212.txt  # IndexNow key
│   └── site.webmanifest    # PWA manifest
└── documentation/
    └── SEO.md              # This file
```

## 7. Testing Checklist

- [ ] Verify robots.txt: https://www.marketview360.io/robots.txt
- [ ] Verify sitemap: https://www.marketview360.io/sitemap.xml
- [ ] Test structured data: Google Rich Results Test
- [ ] Check mobile-friendliness: Google Mobile-Friendly Test
- [ ] Validate OpenGraph: Facebook Sharing Debugger
- [ ] Test Twitter Cards: Twitter Card Validator
- [ ] Check page speed: Google PageSpeed Insights
