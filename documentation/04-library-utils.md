# Frontend Libraries & Utilities Documentation

**File**: `04-library-utils.md`  
**Version**: 1.0.0  
**Date**: 2025-12-19

---

## Table of Contents

1. [API Clients](#api-clients)
2. [Query Builder](#query-builder)
3. [Utilities & Helpers](#utilities--helpers)
4. [Supabase Integration](#supabase-integration)
5. [External APIs](#external-apis)

---

## API Clients

### Backend API Client

**Location**: `lib/utils.ts` (or custom setup per feature)

**Base URL**: `process.env.NEXT_PUBLIC_BACKEND_URL` (default: `http://localhost:4000`)

**Authentication**: JWT token from Supabase auth

**Common Headers**:

```typescript
const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
};
```

**Error Handling Pattern**:

```typescript
async function apiCall(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}${endpoint}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || response.statusText);
  }

  return response.json();
}
```

### Main Endpoints

**AI Chat API**:

```typescript
// POST /ai/chat
const response = await apiCall("/ai/chat", {
  method: "POST",
  body: JSON.stringify({
    messages: [{ role: "user", content: "What is AAPL's PE ratio?" }],
    model: "groq/mixtral-8x7b", // optional
  }),
});
// Returns: { content: string, model: string, tokensUsed: number }
```

**Stock Data API**:

```typescript
// GET /api/company/:ticker
const data = await apiCall(`/api/company/AAPL`);
// Returns company details, financials, technicals

// GET /api/company/:ticker/peers
const peers = await apiCall(`/api/company/AAPL/peers`);
// Returns peer companies

// GET /api/company/:ticker/valuations
const valuations = await apiCall(`/api/company/AAPL/valuations`);
// Returns valuation metrics
```

**Screener API**:

```typescript
// POST /api/run-query
const results = await apiCall("/api/run-query", {
  method: "POST",
  body: JSON.stringify({
    filters: [
      { metric: "pe", operator: "<", value: 20 },
      { metric: "market_cap", operator: ">", value: 1e9 },
    ],
    limit: 100,
    offset: 0,
  }),
});
// Returns: { results: Company[], total: number, elapsed: number }
```

---

## Query Builder

### Purpose

The query builder translates user-friendly natural language queries into database filters.

**Location**: `lib/queryBuilder.ts` (2309 lines)

### Key Exports

#### 1. Field Definitions (`FIELD_DEFS`)

Complete list of 80+ supported metrics:

```typescript
// Price & Market Data
"market capitalization" → market_cap
"current price" → price
"trading volume" → volume

// Valuation Metrics
"pe ratio" → pe
"forward pe" → forward_pe
"price to book" → pb
"peg ratio" → peg

// Growth Metrics
"revenue growth" → revenue_growth
"earnings growth" → earnings_growth
"dividend yield" → dividend_yield

// Quality Metrics
"roe" → roe
"roa" → roa
"debt to equity" → debt_to_equity

// Technical Indicators
"rsi" → rsi_14
"macd" → macd
"bollinger bands" → bollinger_bands

// And many more...
```

#### 2. Backend Field Map

Maps frontend display names to database columns:

```typescript
export const BACKEND_FIELD_MAP: Record<string, string> = {
  // Aliases all resolve to same backend column
  "price to earning": "pe",
  "p/e ratio": "pe",
  pe: "pe",

  "market capitalization": "market_cap",
  "market cap": "market_cap",
  mcap: "market_cap",

  // Forward PE
  "forward pe": "forward_pe",
  "forward p/e": "forward_pe",

  // ... 80+ total mappings
};
```

#### 3. Operators

Supported comparison and arithmetic operators:

```typescript
// Comparison operators
"<", ">", "==", "!=", "<=", ">=";
"between", "not between";
"in", "not in";
"contains", "not contains";

// Arithmetic operators (for expressions)
"+", "-", "*", "/", "%", "^";

// Logical operators
"AND", "OR", "NOT";
```

#### 4. Query Parsing

```typescript
// Convert natural language to filters
const query = "PE < 20 AND dividend yield > 3%";
const filters = parseQuery(query);

// Returns:
[
  { metric: "pe", operator: "<", value: 20 },
  { metric: "dividend_yield", operator: ">", value: 3 },
  { logic: "AND" },
];
```

### Usage Example

```typescript
import {
  parseQuery,
  validateQuery,
  getFieldSuggestions,
  BACKEND_FIELD_MAP,
} from "@/lib/queryBuilder";

// In your screener component
export function ScreenerQueryBuilder() {
  const [query, setQuery] = useState("");
  const [errors, setErrors] = useState<QueryValidationError[]>([]);

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);

    // Validate query
    const validationErrors = validateQuery(newQuery);
    setErrors(validationErrors);
  };

  const handleRunQuery = () => {
    const filters = parseQuery(query);
    // Send to backend API
    fetch("/api/run-query", {
      method: "POST",
      body: JSON.stringify({ filters }),
    });
  };

  const suggestions = getFieldSuggestions(query);

  return (
    <div>
      <input
        value={query}
        onChange={(e) => handleQueryChange(e.target.value)}
        placeholder="PE < 20 AND ROE > 15%..."
      />

      {/* Show validation errors */}
      {errors.map((err) => (
        <div key={err.line} className="error">
          {err.message}
        </div>
      ))}

      {/* Show suggestions */}
      {suggestions.map((suggestion) => (
        <div key={suggestion.text} className="suggestion">
          {suggestion.text} - {suggestion.description}
        </div>
      ))}

      <button onClick={handleRunQuery}>Run Screen</button>
    </div>
  );
}
```

### Arithmetic Expressions

Supports complex calculations:

```typescript
// Create expressions like:
"PE * EPS > 100";
"(Revenue / Shares Outstanding) > 50";
"(Debt / EBITDA) < 3";

// Parse and evaluate
const expr = "PE * EPS > 100";
const filters = parseArithmeticExpression(expr);
// Returns AST (Abstract Syntax Tree) for evaluation
```

---

## Utilities & Helpers

### Classification Utilities (`cn()`)

Merges Tailwind classes intelligently:

```typescript
import { cn } from "@/lib/utils";

// Removes conflicting Tailwind classes
cn("px-4 px-8", "bg-red-500 bg-blue-500")
// Returns: "px-8 bg-blue-500"

// Use in components
<button className={cn(
  "px-4 py-2 rounded",
  isActive && "bg-blue-500 text-white",
  isDisabled && "opacity-50 cursor-not-allowed"
)}>
  Click me
</button>
```

### Formatting Utilities

```typescript
// Number formatting
export function formatNumber(value: number, decimals = 2): string {
  return value.toFixed(decimals);
}

// Currency formatting
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

// Percentage formatting
export function formatPercentage(value: number, decimals = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

// Large number abbreviation
export function formatCompact(value: number): string {
  const units = ["", "K", "M", "B", "T"];
  let unitIndex = 0;
  let num = Math.abs(value);

  while (num >= 1000 && unitIndex < units.length - 1) {
    num /= 1000;
    unitIndex++;
  }

  return `${num.toFixed(1)}${units[unitIndex]}`;
}

// Usage
formatNumber(123.456, 2); // "123.46"
formatCurrency(1234.56); // "$1,234.56"
formatPercentage(0.15, 2); // "15.00%"
formatCompact(1234567890); // "1.2B"
```

### Date Utilities

```typescript
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US").format(date);
}

export function getDateRange(days: number): [Date, Date] {
  const end = new Date();
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  return [start, end];
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

// Usage
getDateRange(30); // Last 30 days
isToday(new Date()); // true
```

### Validation Utilities

```typescript
export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function isValidTicker(ticker: string): boolean {
  // 1-5 uppercase letters, optional .US/.CA suffix
  const re = /^[A-Z]{1,5}(\.[A-Z]{2})?$/;
  return re.test(ticker);
}

export function isValidNumber(value: any): boolean {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

// Usage
isValidEmail("test@example.com"); // true
isValidTicker("AAPL"); // true
isValidTicker("AAPL.US"); // true
```

### Local Storage Utilities

```typescript
export function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to save ${key}:`, error);
  }
}

export function removeFromStorage(key: string): void {
  localStorage.removeItem(key);
}

// Usage
const userPrefs = getFromStorage("prefs", {});
saveToStorage("prefs", { theme: "dark" });
```

---

## Supabase Integration

### Client Initialization (`lib/supabase/client.ts`)

```typescript
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseKey);
}
```

### Server Components (`lib/supabase/server.ts`)

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookieStore.getAll().forEach((c) => cookieStore.delete(c.name));
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}
```

### Middleware Authentication

```typescript
import { createServerClient } from "@supabase/ssr";

export async function updateSession(request: NextRequest) {
  let supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          const response = NextResponse.next();
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
          return response;
        },
      },
    }
  );

  // Get session and refresh if needed
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If no user and route requires auth, redirect to login
  if (!user && request.nextUrl.pathname.startsWith("/protected")) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}
```

### Common Queries

```typescript
// Get current user
const {
  data: { user },
} = await supabase.auth.getUser();

// Get user preferences
const { data, error } = await supabase
  .from("user_preferences")
  .select("*")
  .eq("user_id", user.id)
  .single();

// Get watchlist
const { data: watchlist } = await supabase
  .from("watchlists")
  .select("*, stocks(*)")
  .eq("user_id", user.id);

// Update preferences
await supabase
  .from("user_preferences")
  .update({ theme: "dark", language: "en" })
  .eq("user_id", user.id);

// Subscribe to real-time changes
const subscription = supabase
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "watchlists" },
    (payload) => {
      console.log("Watchlist changed:", payload);
    }
  )
  .subscribe();
```

---

## External APIs

### EODHD API Client (`lib/eodhd.ts`)

Real-time stock data integration.

**Location**: `lib/eodhd.ts`

**Server-Side Only**: Uses `"use server"` directive with secure API key

**API Key**: `process.env.EODHD_API_TOKEN` or `process.env.NEXT_PUBLIC_EODHD_API_TOKEN`

**Main Functions**:

```typescript
// Get real-time price for single ticker
const price = await getRealTimePrice("AAPL");
// Returns: {
//   code: "AAPL",
//   timestamp: 1234567890,
//   open: 150.0,
//   high: 152.5,
//   low: 149.8,
//   close: 151.2,
//   volume: 1000000,
//   previousClose: 150.5,
//   change: 0.7,
//   change_p: 0.47
// }

// Get real-time prices for multiple tickers
const prices = await getBulkRealTimePrices(["AAPL", "MSFT", "GOOGL"]);
// Returns array of StockData

// Historical price data
const historical = await getHistoricalPrices(
  "AAPL",
  "2024-01-01",
  "2024-12-31"
);

// Intraday data
const intraday = await getIntradayData("AAPL", "1h");
```

### Usage in Client Components

```typescript
"use client";

import { getRealTimePrice } from "@/lib/eodhd";

export function StockPrice({ ticker }: { ticker: string }) {
  const [price, setPrice] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPrice() {
      const data = await getRealTimePrice(ticker);
      setPrice(data);
      setLoading(false);
    }
    fetchPrice();
  }, [ticker]);

  if (loading) return <div>Loading...</div>;
  if (!price) return <div>Error fetching price</div>;

  return (
    <div>
      <p>
        {ticker}: ${price.close.toFixed(2)}
      </p>
      <p className={price.change >= 0 ? "text-green-500" : "text-red-500"}>
        {price.change_p > 0 ? "+" : ""}
        {price.change_p.toFixed(2)}%
      </p>
    </div>
  );
}
```

### Rate Limiting

EODHD has rate limits (varies by plan):

- Free: 20 requests/day
- Paid: 100+ requests/day

Best practices:

```typescript
// Cache results
const cache = new Map();

export async function getPriceWithCache(ticker: string) {
  if (cache.has(ticker)) {
    const cached = cache.get(ticker);
    if (Date.now() - cached.timestamp < 60000) {
      // 1 minute cache
      return cached.data;
    }
  }

  const data = await getRealTimePrice(ticker);
  cache.set(ticker, { data, timestamp: Date.now() });
  return data;
}
```

---

**Last Updated**: 2025-12-19  
**Version**: 1.0.0
