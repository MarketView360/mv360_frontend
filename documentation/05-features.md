# Frontend Key Features Documentation

**File**: `05-features.md`  
**Version**: 1.0.0  
**Date**: 2025-12-19

---

## Table of Contents

1. [Stock Screener](#stock-screener)
2. [Company Analysis](#company-analysis)
3. [Market Overview](#market-overview)
4. [AI Chat (Jovan)](#ai-chat-jovan)
5. [User Management](#user-management)
6. [Responsive Design](#responsive-design)

---

## Stock Screener

### Purpose

Build complex stock screening queries using natural language or visual filters.

### Routes

- `GET /screens` - Screener main interface
- `GET /screens/results` - Results view
- `GET /screens/saved` - Saved screens list

### Key Components

#### ScreenerQueryBuilder

```typescript
// Main screener interface
location: components/ScreenerQueryBuilder.tsx

Features:
- Natural language query input ("PE < 20 AND dividend > 3%")
- Visual filter builder (drag & drop)
- Metric selector (80+ metrics)
- Result sorting/filtering
- Save query functionality
- Export to CSV
```

#### Query Parsing Flow

```
User Input (Natural Language)
    ↓
Query Parser (lib/queryBuilder.ts)
    ↓
Filter Validation
    ↓
Generate Filters Array
    ↓
Send to Backend (/api/run-query)
    ↓
Database Query Execution
    ↓
Return Results
    ↓
Display in FinancialTable
```

### Supported Metrics (80+)

**Valuation Metrics**:

- P/E Ratio (Price-to-Earnings)
- Forward P/E
- P/B Ratio (Price-to-Book)
- PEG Ratio (Price/Earnings to Growth)
- Enterprise Value (EV)
- EV/Revenue, EV/EBITDA

**Growth Metrics**:

- Revenue Growth (YoY)
- Earnings Growth (YoY)
- Revenue per Share Growth
- Earnings per Share Growth

**Quality Metrics**:

- ROE (Return on Equity)
- ROA (Return on Assets)
- ROIC (Return on Invested Capital)
- Debt-to-Equity Ratio
- Current Ratio
- Quick Ratio

**Dividend Metrics**:

- Dividend Yield
- Dividend Payout Ratio
- 5-Year Dividend Growth

**Technical Indicators**:

- RSI (14-day)
- MACD (Moving Average Convergence Divergence)
- Bollinger Bands
- SMA 20, 50, 200

### Example Usage

```typescript
// In app/screens/page.tsx
"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import ScreenerQueryBuilder from "@/components/ScreenerQueryBuilder";
import { useState } from "react";

export default function ScreenerPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Company[]>([]);

  const handleRunScreen = async (filters: Filter[]) => {
    try {
      const response = await fetch("/api/run-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filters }),
      });

      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      console.error("Screen error:", error);
    }
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Stock Screener</h1>

        <ScreenerQueryBuilder
          query={query}
          onQueryChange={setQuery}
          onRunScreen={handleRunScreen}
        />

        <ResultsTable
          results={results}
          onSelectCompany={(ticker) => {
            router.push(`/company/${ticker}`);
          }}
        />
      </div>
    </ProtectedRoute>
  );
}
```

### Advanced Queries

```
// Value investing: Undervalued with growth
PE < 15 AND PEG < 1 AND revenue_growth > 10% AND ROE > 15%

// Dividend stocks: High yield with low payout
dividend_yield > 3% AND payout_ratio < 60% AND debt_to_equity < 1.5

// Growth stocks: High growth, reasonable valuation
revenue_growth > 25% AND earnings_growth > 20% AND PEG < 2

// Quality: Strong fundamentals
ROE > 20% AND debt_to_equity < 0.5 AND current_ratio > 1.5

// Technical: Support + overbought
RSI < 30 AND price > 200_day_SMA AND volume > avg_volume_200d
```

---

## Company Analysis

### Purpose

Deep dive into single company financials, technicals, and comparisons.

### Routes

- `GET /company` - Company search/list
- `GET /company/:ticker` - Company detail page
- `GET /company/:ticker/comparisons` - Peer comparison

### Key Components

#### CompanyHeader

```typescript
// Header with stock price, basic info
- Stock ticker and name
- Current price & 1-day change
- Quick stats (market cap, PE ratio)
- Navigation tabs
```

#### FinancialTable

```typescript
// Display financial metrics
- Income statement data
- Balance sheet data
- Cash flow statement
- Customizable columns
- Sortable and paginated
```

#### PriceChart

```typescript
// Interactive stock chart
- Multiple timeframes (1d, 1w, 1m, 3m, 6m, 1y)
- Technical indicators (SMA, RSI, MACD)
- Zoom and pan
- Date range selection
```

### Data Displayed

**Overview Tab**:

- Company description
- Industry & sector
- Website & headquarters
- Key metrics (P/E, dividend yield, etc.)

**Financials Tab**:

- Income statement (quarterly & annual)
- Balance sheet
- Cash flow statement
- Key ratios

**Technicals Tab**:

- 14-day RSI
- MACD indicators
- Bollinger Bands
- Recent price action

**Comparisons Tab**:

- Peer companies in same sector
- Side-by-side metric comparison
- Performance comparison

### Implementation Example

```typescript
// app/company/[ticker]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CompanyHeader } from "@/components/company/CompanyHeader";
import { PriceChart } from "@/components/PriceChart";
import { FinancialTable } from "@/components/FinancialTable";

interface CompanyData {
  ticker: string;
  name: string;
  price: number;
  marketCap: number;
  pe: number;
  financials: Financials;
  technicals: Technicals;
}

export default function CompanyPage() {
  const { ticker } = useParams();
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    async function fetchCompany() {
      try {
        const response = await fetch(`/api/company/${ticker}`);
        const data = await response.json();
        setCompany(data);
      } catch (error) {
        console.error("Error fetching company:", error);
      } finally {
        setLoading(false);
      }
    }

    if (ticker) {
      fetchCompany();
    }
  }, [ticker]);

  if (loading) return <div>Loading...</div>;
  if (!company) return <div>Company not found</div>;

  return (
    <div className="space-y-6">
      <CompanyHeader company={company} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PriceChart ticker={company.ticker} />
        </div>

        <div>
          <KeyMetrics company={company} />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="technicals">Technicals</TabsTrigger>
          <TabsTrigger value="comparisons">Comparisons</TabsTrigger>
        </TabsList>

        <TabsContent value="financials">
          <FinancialTable data={company.financials} sortable paginated />
        </TabsContent>

        <TabsContent value="comparisons">
          <ComparisonsTable ticker={company.ticker} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## Market Overview

### Purpose

High-level view of market performance and trends.

### Routes

- `GET /market` - Market dashboard

### Key Components

#### MarketHeatmap

```typescript
// Sector/market visualization
- Visual heatmap of sector performance
- Color gradient (red = down, green = up)
- Click to drill down into sectors
- Real-time updates
```

#### MarketIndices

```typescript
// Major indices display
- S&P 500
- Dow Jones
- Nasdaq
- Russell 2000
- International indices
```

#### TrendingStocks

```typescript
// Most active stocks
- Gainers
- Losers
- Most traded
- Click to view company detail
```

### Implementation

```typescript
// app/market/page.tsx
"use client";

import { MarketHeatmap } from "@/components/MarketHeatmap";
import { MarketIndices } from "@/components/MarketIndices";
import { TrendingStocks } from "@/components/TrendingStocks";

export default function MarketPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Market Overview</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MarketHeatmap
            onSectorClick={(sector) => {
              router.push(`/screens?sector=${sector}`);
            }}
          />
        </div>

        <div>
          <MarketIndices />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TrendingStocks type="gainers" />
        <TrendingStocks type="losers" />
        <TrendingStocks type="mostActive" />
      </div>
    </div>
  );
}
```

---

## AI Chat (Jovan)

### Purpose

AI-powered assistant for stock research and analysis questions.

### Routes

- `GET /jovan-chat` - Chat interface
- `GET /jovan-chat/:sessionId` - Specific chat session

### Architecture

**Client Flow**:

```
User Input
    ↓
AiChatWidget (local state)
    ↓
Validate Message & Check Quota (useQuota hook)
    ↓
Send to Backend (/ai/chat)
    ↓
Display Response (with markdown)
    ↓
Update Usage Quota
```

**Backend Flow** (see backend docs):

1. Receive message
2. Select AI provider based on user preferences
3. Call Groq/ByteZ/OpenRouter API
4. Stream response or return completion
5. Track quota usage
6. Cache response for performance

### Key Components

#### AiChatWidget

```typescript
// Floating chat widget (bottom right)
- Always accessible
- Shows message count
- Displays quota status
- Can be minimized
```

#### ChatInterface (Full Page)

```typescript
// Full-page chat view
location: app/jovan-chat/page.tsx
- Chat history
- Session management
- Export conversation
- Share chat
```

### Features

**Multi-Model Support**:

- Groq (Mixtral 8x7B, LLaMA 2)
- ByteZ (Claude-like model)
- OpenRouter (Multiple models)

**Smart Context**:

- Understand company references
- Execute screener queries in context
- Provide financial analysis

**Quota Management**:

- Standard messages (free tier)
- Reasoning messages (premium)
- Voice messages
- Real-time quota display

**Conversation Memory**:

- Store sessions in database
- Resume conversations
- Search chat history

### Usage Example

```typescript
// In component
import { AiChatWidget } from "@/components/AiChatWidget";

export default function Layout() {
  return (
    <>
      {/* Other components */}
      <AiChatWidget /> {/* Always available */}
    </>
  );
}

// User can ask:
// "What is Apple's PE ratio?"
// "Find stocks with PE < 20 and dividend > 3%"
// "Should I buy AAPL at current prices?"
// "Compare AAPL vs MSFT"
// "What are the market trends today?"
```

---

## User Management

### Purpose

User authentication and preference management.

### Routes

- `GET /auth` - Auth landing (login/register)
- `GET /auth/login` - Login page
- `GET /auth/register` - Registration page
- `GET /profile` - User profile
- `GET /profile/settings` - Settings
- `GET /profile/watchlist` - Saved watchlist

### Components

#### AuthForm

```typescript
// Login/Register form
- Email validation
- Password strength indicator
- Terms of service checkbox
- OAuth options (if configured)
```

#### ProfilePage

```typescript
// User information
- Email
- Subscription tier
- Account creation date
- Action buttons (upgrade, logout)
```

#### PreferencesPage

```typescript
// User preferences
- AI model selection
- Language preference
- Theme preference (dark/light)
- Email notification preferences
- Price alert settings
```

### Watchlist Management

```typescript
// Add/remove stocks to personal watchlist
const addToWatchlist = async (ticker: string) => {
  const { data, error } = await supabase.from("watchlists").insert({
    user_id: user.id,
    ticker,
    added_at: new Date(),
  });
};

const removeFromWatchlist = async (ticker: string) => {
  await supabase
    .from("watchlists")
    .delete()
    .eq("user_id", user.id)
    .eq("ticker", ticker);
};

// Display watchlist
const watchlistItems = await supabase
  .from("watchlists")
  .select(
    `
    ticker,
    added_at,
    stocks (
      name,
      current_price,
      pe_ratio
    )
  `
  )
  .eq("user_id", user.id);
```

---

## Responsive Design

### Design Philosophy

Mobile-first approach with progressive enhancement for larger screens.

### Breakpoints

```typescript
// Tailwind breakpoints used
sm: 640px   (mobile landscape)
md: 768px   (tablet)
lg: 1024px  (desktop)
xl: 1280px  (large desktop)
2xl: 1536px (extra large)
```

### Responsive Components

#### Navigation

Mobile (<md):

```
[Menu Icon] [Logo]        [Theme] [Auth]
```

Desktop (md+):

```
[Logo] [Screens] [Markets] [News] [AI]  [Search] [Theme] [Auth]
```

#### Charts

Mobile:

- Single chart, full width
- Collapsed controls
- Single timeframe option

Desktop:

- Multiple charts side-by-side
- Expanded controls
- All timeframe options

#### Tables

Mobile:

- Scrollable horizontally
- Compact column headers
- Tap to expand row

Desktop:

- Full table display
- Sortable columns
- Pagination

### Implementation Example

```typescript
// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id}>{item}</Card>)}
</div>

// Responsive text
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
  Stock Screener
</h1>

// Responsive image
<Image
  src={image}
  alt="Chart"
  className="w-full h-auto"
  priority
/>

// Mobile-first flexbox
<div className="flex flex-col md:flex-row gap-4">
  <aside className="md:w-64">Sidebar</aside>
  <main className="flex-1">Content</main>
</div>
```

### Dark Mode Support

All components support dark mode via `dark:` Tailwind prefix:

```typescript
<div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
  Content
</div>

// Theme toggle in header
<ThemeToggle />

// Theme context
const { theme, setTheme } = useTheme();
```

---

**Last Updated**: 2025-12-19  
**Version**: 1.0.0
