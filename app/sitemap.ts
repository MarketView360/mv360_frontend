import { MetadataRoute } from 'next'

// Popular S&P 500 stocks to include in sitemap for SEO
// These are the most searched/traded stocks
const POPULAR_TICKERS = [
  'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK.B', 'UNH',
  'JNJ', 'JPM', 'V', 'PG', 'XOM', 'HD', 'CVX', 'MA', 'ABBV', 'MRK',
  'LLY', 'PEP', 'COST', 'KO', 'AVGO', 'WMT', 'MCD', 'CSCO', 'TMO', 'ABT',
  'CRM', 'ACN', 'DHR', 'NKE', 'ADBE', 'CMCSA', 'VZ', 'NEE', 'TXN', 'PM',
  'INTC', 'AMD', 'NFLX', 'DIS', 'ORCL', 'IBM', 'QCOM', 'HON', 'UPS', 'LOW',
  'CAT', 'BA', 'GS', 'MS', 'AXP', 'BLK', 'SPGI', 'DE', 'RTX', 'GE',
  'AMAT', 'SBUX', 'PYPL', 'SQ', 'SHOP', 'UBER', 'ABNB', 'COIN', 'RIVN', 'PLTR'
]

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.marketview360.io'
  const currentDate = new Date()

  // Static pages with high priority
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/market`,
      lastModified: currentDate,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: currentDate,
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/screens`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/watchlist`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/earnings`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/ai`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/feedback`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/disclaimer`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // Company pages for popular stocks (high SEO value)
  const companyPages: MetadataRoute.Sitemap = POPULAR_TICKERS.map(ticker => ({
    url: `${baseUrl}/company/${ticker}`,
    lastModified: currentDate,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...companyPages]
}
