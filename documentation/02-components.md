# Frontend Components Documentation

**File**: `02-components.md`  
**Version**: 1.0.0  
**Date**: 2025-12-19

---

## Table of Contents

1. [Layout Components](#layout-components)
2. [Navigation Components](#navigation-components)
3. [Feature Components](#feature-components)
4. [UI Components](#ui-components)
5. [Auth Components](#auth-components)
6. [Shared Patterns](#shared-patterns)

---

## Layout Components

### NavigationBar

Main navigation bar shown on all pages.

**Location**: `components/NavigationBar.tsx`

**Features**:

- Sticky top navigation with backdrop blur
- Dark mode support
- Responsive (hidden on mobile, visible on desktop)
- Search bar integration
- User authentication status
- Dynamic user dropdown

**Props**: None (uses context for user data)

**Usage**:

```typescript
import NavigationBar from "@/components/NavigationBar";

// In layout.tsx
<NavigationBar />;
```

**Key Implementation**:

```typescript
"use client";

export default function NavigationBar() {
  const { user, loading } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b">
      <div className="flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/">
          Marketview<span className="text-brand">360</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-6">
          <Link href="/screens">Screens</Link>
          <Link href="/market">Markets</Link>
          <Link href="/news">News</Link>
          <Link href="/jovan-chat">AI Assistant</Link>
        </div>

        {/* Right Side: Search, Theme, Auth */}
        <div className="flex items-center gap-4">
          <NavSearch /> {/* Desktop only */}
          <ThemeToggle />
          {user ? <UserDropdown /> : <AuthButtons />}
        </div>
      </div>
    </nav>
  );
}
```

### Footer

Footer component shown on all pages.

**Location**: `components/Footer.tsx`

**Features**:

- 4-column grid layout
- Social media links
- Product links
- Legal links
- Dark mode support

**Usage**:

```typescript
import { Footer } from "@/components/Footer";

// In layout.tsx
<Footer />;
```

---

## Navigation Components

### NavSearch

Search bar for company/symbol lookup.

**Location**: `components/NavSearch.tsx`

**Props**:

```typescript
interface NavSearchProps {
  onSearch?: (query: string) => void;
  className?: string;
  placeholder?: string;
}
```

**Features**:

- Autocomplete dropdown
- Company/ticker search
- Real-time filtering
- Keyboard navigation (Enter to search)

**Usage**:

```typescript
import { NavSearch } from "@/components/NavSearch";

<NavSearch
  onSearch={(query) => {
    console.log("Searching for:", query);
    router.push(`/company/${query}`);
  }}
  placeholder="Search stocks..."
/>;
```

### UserDropdown

User menu dropdown with profile and logout.

**Location**: `components/auth/UserDropdown.tsx`

**Features**:

- Profile link
- Settings link
- Logout button
- User email display

**Usage**:

```typescript
import { UserDropdown } from "@/components/auth/UserDropdown";

// When user is authenticated
{
  user && <UserDropdown />;
}
```

---

## Feature Components

### ScreenerQueryBuilder

Interactive stock screening interface.

**Location**: `components/ScreenerQueryBuilder.tsx`

**Purpose**: Build and execute stock screener queries

**Props**:

```typescript
interface ScreenerQueryBuilderProps {
  onResults?: (results: ScreenResult[]) => void;
  savedQueries?: SavedQuery[];
  onSaveQuery?: (query: Query) => void;
}
```

**Features**:

- Filter builder (drag & drop)
- Natural language query input
- Metric selector (80+ metrics)
- Result table with sorting/pagination
- Save query functionality
- Export results

**Usage**:

```typescript
"use client";

import ScreenerQueryBuilder from "@/components/ScreenerQueryBuilder";

export default function ScreenerPage() {
  return (
    <ProtectedRoute>
      <ScreenerQueryBuilder
        onResults={(results) => {
          console.log("Screen results:", results);
        }}
      />
    </ProtectedRoute>
  );
}
```

**Key Implementation**:

```typescript
export function ScreenerQueryBuilder() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filter[]>([]);
  const [results, setResults] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);

  const handleRunQuery = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/screener/run-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filters, query }),
      });

      const data = await response.json();
      setResults(data.results);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <QueryInput value={query} onChange={setQuery} />
      <FilterBuilder filters={filters} onChange={setFilters} />
      <Button onClick={handleRunQuery} disabled={loading}>
        Run Screen
      </Button>
      <ResultsTable results={results} />
    </div>
  );
}
```

### PriceChart

Interactive stock price chart with technical analysis.

**Location**: `components/PriceChart.tsx`

**Props**:

```typescript
interface PriceChartProps {
  ticker: string;
  timeframe?: "1d" | "1w" | "1m" | "3m" | "6m" | "1y";
  indicators?: ("sma20" | "sma50" | "rsi" | "macd")[];
  height?: number;
  onDateRange?: (start: Date, end: Date) => void;
}
```

**Features**:

- Recharts integration
- Multiple timeframes
- Technical indicators (SMA, RSI, MACD)
- Date range selector
- Zoom & pan

**Usage**:

```typescript
import { PriceChart } from "@/components/PriceChart";

<PriceChart
  ticker="AAPL"
  timeframe="1m"
  indicators={["sma20", "sma50", "rsi"]}
  height={400}
/>;
```

### MarketHeatmap

Market overview heatmap showing sector/market data.

**Location**: `components/MarketHeatmap.tsx`

**Features**:

- Sector performance visualization
- Market cap weighted display
- Color gradient (red/green)
- Interactive tooltips
- Real-time updates

**Usage**:

```typescript
import { MarketHeatmap } from "@/components/MarketHeatmap";

<MarketHeatmap
  onSelect={(sector) => {
    router.push(`/screens?sector=${sector}`);
  }}
/>;
```

### FinancialTable

Responsive financial data table.

**Location**: `components/FinancialTable.tsx`

**Props**:

```typescript
interface FinancialTableProps {
  data: FinancialMetric[];
  columns?: string[];
  sortable?: boolean;
  filterable?: boolean;
  paginated?: boolean;
  pageSize?: number;
}
```

**Features**:

- Column sorting
- Filtering
- Pagination
- Responsive scrolling on mobile
- Number formatting (billions, percentages)

**Usage**:

```typescript
import { FinancialTable } from "@/components/FinancialTable";

<FinancialTable
  data={financialData}
  columns={["metric", "value", "change"]}
  sortable
  paginated
  pageSize={20}
/>;
```

### RatioCube

3D visualization for financial ratio comparisons.

**Location**: `components/RatioCube.tsx`

**Features**:

- 3D cube rendering (Three.js)
- Interactive rotation
- Metric comparison
- Color coded values

**Usage**:

```typescript
import { RatioCube } from "@/components/RatioCube";

<RatioCube
  metrics={{
    pe: 25,
    pb: 3.5,
    ps: 8.2,
  }}
/>;
```

### AiChatWidget

Floating AI chat assistant widget.

**Location**: `components/AiChatWidget.tsx`

**Features**:

- Floating button (bottom right)
- Chat history
- Message input
- Loading states
- Quota management
- Markdown rendering

**Usage**:

```typescript
import { AiChatWidget } from "@/components/AiChatWidget";

// In layout.tsx - accessible everywhere
<AiChatWidget />;
```

**Key Implementation**:

```typescript
"use client";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    const userMessage = input.trim();
    if (!userMessage) return;

    setMessages([...messages, { role: "user", content: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMessage }],
        }),
      });

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.content },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {!open && (
        <Button
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-4"
        >
          <MessageCircle />
        </Button>
      )}

      {open && (
        <Card className="fixed bottom-4 right-4 w-96">
          <div className="h-96 flex flex-col">
            <div className="flex-1 overflow-y-auto">
              {messages.map((msg) => (
                <div key={msg.content} className={msg.role}>
                  {msg.content}
                </div>
              ))}
            </div>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about stocks..."
            />
            <Button onClick={handleSend} disabled={loading}>
              <Send />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
```

### StrategyLibrary

Pre-built investment strategy selector and visualizer.

**Location**: `components/StrategyLibrary.tsx`

**Features**:

- Strategy list/grid
- Strategy details
- Backtest results
- Clone strategy

**Usage**:

```typescript
<StrategyLibrary
  onSelect={(strategy) => {
    applyStrategy(strategy);
  }}
/>
```

### SearchBar

Global application search bar.

**Location**: `components/SearchBar.tsx`

**Features**:

- Debounced search
- Multi-category results (companies, news, screeners)
- Keyboard shortcut (⌘K)
- Recent searches

**Usage**:

```typescript
<SearchBar onSearch={(term) => router.push(`/search?q=${term}`)} />
```

### SyntaxHighlighter

Code syntax highlighting for query display.

**Location**: `components/SyntaxHighlighter.tsx`

**Props**:

```typescript
interface SyntaxHighlighterProps {
  code: string;
  language?: "sql" | "json" | "javascript";
  showLineNumbers?: boolean;
  copyable?: boolean;
}
```

**Usage**:

```typescript
<SyntaxHighlighter code={sqlQuery} language="sql" showLineNumbers copyable />
```

---

## UI Components

Located in `components/ui/` - Radix UI based primitives:

### Button

```typescript
import { Button } from "@/components/ui/button";

<Button variant="primary" size="lg">
  Click me
</Button>;
```

**Variants**: `primary`, `secondary`, `outline`, `ghost`, `destructive`  
**Sizes**: `sm`, `md`, `lg`

### Card

```typescript
import { Card } from "@/components/ui/card";

<Card className="p-6">
  <CardHeader>Title</CardHeader>
  <CardContent>Content here</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>;
```

### Input

```typescript
import { Input } from "@/components/ui/input";

<Input
  type="text"
  placeholder="Search..."
  onChange={(e) => setQuery(e.target.value)}
/>;
```

### Dialog

```typescript
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";

<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <h2>Dialog Title</h2>
    <p>Dialog content</p>
  </DialogContent>
</Dialog>;
```

### Select

```typescript
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

<Select onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Choose..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="opt1">Option 1</SelectItem>
    <SelectItem value="opt2">Option 2</SelectItem>
  </SelectContent>
</Select>;
```

### Tabs

```typescript
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>;
```

---

## Auth Components

Located in `components/auth/`

### ProtectedRoute

Wraps components that require authentication.

**Location**: `components/auth/ProtectedRoute.tsx`

**Usage**:

```typescript
"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function ScreenerPage() {
  return (
    <ProtectedRoute>
      <ScreenerQueryBuilder />
    </ProtectedRoute>
  );
}
```

### UserDropdown

User profile menu.

**Location**: `components/auth/UserDropdown.tsx`

**Usage**:

```typescript
import { UserDropdown } from "@/components/auth/UserDropdown";

{
  user && <UserDropdown />;
}
```

---

## Shared Patterns

### Loading States

```typescript
// Skeleton loading
<Skeleton className="h-12 w-full rounded-md" />

// Animated spinner
<Spinner size="lg" />

// Loading text
<div className="animate-pulse">Loading...</div>
```

### Error Handling

```typescript
// Error display
if (error) {
  return (
    <Alert variant="destructive">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{error.message}</AlertDescription>
    </Alert>
  );
}
```

### Responsive Images

```typescript
import Image from "next/image";

<Image
  src="/charts/market.png"
  alt="Market chart"
  width={800}
  height={600}
  priority
  className="w-full h-auto"
/>;
```

---

**Last Updated**: 2025-12-19  
**Version**: 1.0.0
