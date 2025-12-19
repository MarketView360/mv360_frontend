# Frontend App Structure & Routing Documentation

**File**: `01-app-structure.md`  
**Version**: 1.0.0  
**Date**: 2025-12-19

---

## Table of Contents

1. [Next.js App Router Overview](#nextjs-app-router-overview)
2. [Layouts & Nesting](#layouts--nesting)
3. [Route Protection](#route-protection)
4. [API Routes](#api-routes)
5. [Error Handling](#error-handling)
6. [Metadata & SEO](#metadata--seo)
7. [Middleware](#middleware)
8. [Route Examples](#route-examples)

---

## Next.js App Router Overview

**Version**: Next.js 14 (Latest App Router)  
**Base Directory**: `/app`  
**File Conventions**:

- `layout.tsx` - Shared layout for route segment and children
- `page.tsx` - Route UI and public component
- `error.tsx` - Error boundary UI
- `not-found.tsx` - 404 UI
- `route.ts` - API endpoint handler
- `middleware.ts` - Request/response middleware (root level)

### App Router Architecture

```
Root Level (/)
│
├── layout.tsx ─────────────────── Provides RootLayout with:
│                                  • Theme provider
│                                  • Auth context
│                                  • Navigation bar
│                                  • Footer
│                                  • Global styles
│
├── page.tsx ──────────────────── Home page (/)
│
├── global-error.tsx ────────────── Global error boundary
│
├── auth/ ──────────────────────── Auth routes
│   ├── layout.tsx
│   ├── page.tsx ──────────────── Login/Register selection
│   └── [action]/
│       └── page.tsx ──────────── Dynamic auth pages
│                                  (/auth/login, /auth/register)
│
├── market/ ──────────────────── Market overview
│   ├── layout.tsx
│   └── page.tsx ──────────────── Market dashboard
│
├── company/ ─────────────────── Company analysis
│   ├── page.tsx ──────────────── Company search/list
│   └── [ticker]/
│       ├── layout.tsx ────────── Company detail layout
│       └── page.tsx ──────────── Company detail page
│           │
│           └── comparisons/
│               └── page.tsx ─── Peer comparisons
│
├── screens/ ─────────────────── Stock screener
│   ├── layout.tsx
│   ├── page.tsx ──────────────── Screener interface
│   ├── results/
│   │   └── page.tsx ──────────── Search results
│   └── saved/
│       └── page.tsx ──────────── Saved screens
│
├── jovan-chat/ ──────────────── AI Chat
│   ├── layout.tsx ────────────── Chat layout
│   ├── page.tsx ──────────────── Chat list/interface
│   └── [sessionId]/
│       └── page.tsx ──────────── Specific chat session
│
├── profile/ ──────────────────── User profile
│   ├── page.tsx ──────────────── Profile page
│   ├── settings/
│   │   └── page.tsx ──────────── Settings
│   └── watchlist/
│       └── page.tsx ──────────── Watchlist
│
├── news/ ────────────────────── Financial news
│   ├── page.tsx ──────────────── News feed
│   └── [newsId]/
│       └── page.tsx ──────────── News detail
│
├── settings/ ─────────────────── App settings
│   ├── page.tsx ──────────────── Settings dashboard
│   ├── preferences/
│   │   └── page.tsx ──────────── Preferences
│   └── notifications/
│       └── page.tsx ──────────── Notifications
│
├── api/ ──────────────────────── API routes
│   ├── auth/
│   │   ├── login/
│   │   │   └── route.ts ────── POST login
│   │   ├── register/
│   │   │   └── route.ts ────── POST register
│   │   └── logout/
│   │       └── route.ts ────── POST logout
│   │
│   ├── chat/
│   │   ├── sessions/
│   │   │   └── route.ts ────── GET/POST sessions
│   │   └── [sessionId]/
│   │       └── route.ts ────── GET session details
│   │
│   └── user/
│       ├── preferences/
│       │   └── route.ts ────── GET/PUT preferences
│       └── watchlist/
│           └── route.ts ────── GET/POST watchlist
│
└── coming-soon/ ────────────── Coming soon page
    └── page.tsx ────────────── Coming soon UI
```

---

## Layouts & Nesting

### Root Layout (`app/layout.tsx`)

Wraps entire application.

```typescript
"use client";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <AuthProvider>
            <NavigationBar />
            {children}
            <AiChatWidget />
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Key Features**:

- Global providers (Theme, Auth)
- Navigation bar on all pages
- AI Chat widget accessible everywhere
- Footer on all pages
- Dark mode script to prevent flashing

### Section Layouts

**Market Layout** (`app/market/layout.tsx`):

```typescript
export default function MarketLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <MarketHeader />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <aside className="lg:col-span-1">
          <MarketSidebar />
        </aside>
        <main className="lg:col-span-3">{children}</main>
      </div>
    </div>
  );
}
```

**Company Layout** (`app/company/[ticker]/layout.tsx`):

```typescript
export default function CompanyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { ticker: string };
}) {
  return (
    <div>
      <CompanyHeader ticker={params.ticker} />
      <CompanyNavigation ticker={params.ticker} />
      {children}
    </div>
  );
}
```

### Layout Nesting Rules

- Layouts wrap their segment and all children
- Updates affect only that segment and children
- Each layout receives `children` prop
- `children` can be from nested routes or multiple segments

**Example**:

```
/company/AAPL
  └─ RootLayout (always)
     └─ CompanyLayout (app/company/[ticker]/layout.tsx)
        └─ Page (app/company/[ticker]/page.tsx)

/company/AAPL/comparisons
  └─ RootLayout (always)
     └─ CompanyLayout (app/company/[ticker]/layout.tsx)
        └─ Page (app/company/[ticker]/comparisons/page.tsx)
```

---

## Route Protection

### Protected Routes Pattern

**Wrapper Component** (`components/auth/ProtectedRoute.tsx`):

```typescript
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth?action=login");
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
```

**Usage in Protected Route** (`app/screens/page.tsx`):

```typescript
"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import ScreenerInterface from "@/components/screens/ScreenerQueryBuilder";

export default function ScreenerPage() {
  return (
    <ProtectedRoute>
      <ScreenerInterface />
    </ProtectedRoute>
  );
}
```

### Middleware-Based Protection (`middleware.ts`)

```typescript
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

**Supabase Middleware** (`lib/supabase/middleware.ts`):

```typescript
export async function updateSession(request: NextRequest) {
  // Get session from cookie
  const session = request.cookies.get("supabase-auth-token");

  // Refresh if needed
  if (session) {
    const response = NextResponse.next();
    // Update auth state
    return response;
  }

  // No session, redirect to login
  return NextResponse.redirect(new URL("/auth", request.url));
}
```

---

## API Routes

### Authentication API

**Login** (`app/api/auth/login/route.ts`):

```typescript
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    user: data.user,
    session: data.session,
  });
}
```

**Register** (`app/api/auth/register/route.ts`):

```typescript
export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    user: data.user,
    message: "Check email for confirmation link",
  });
}
```

**Logout** (`app/api/auth/logout/route.ts`):

```typescript
export async function POST(request: NextRequest) {
  const supabase = createClient();

  await supabase.auth.signOut();

  return NextResponse.json({ message: "Logged out" });
}
```

### User Preferences API

**Get Preferences** (`app/api/user/preferences/route.ts`):

```typescript
export async function GET(request: NextRequest) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
```

**Update Preferences** (`PUT /app/api/user/preferences`):

```typescript
export async function PUT(request: NextRequest) {
  const { aiModel, language, theme } = await request.json();

  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("user_preferences")
    .update({ ai_model: aiModel, language, theme })
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
```

---

## Error Handling

### Error Boundary (`app/error.tsx`)

```typescript
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Something went wrong!</h1>
      <p className="text-gray-600 mb-8">{error.message}</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Try again
      </button>
    </div>
  );
}
```

### Global Error Boundary (`app/global-error.tsx`)

```typescript
"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-2xl font-bold mb-4">Global Error</h1>
          <button onClick={() => reset()} className="px-4 py-2 bg-blue-500">
            Reset
          </button>
        </div>
      </body>
    </html>
  );
}
```

### Not Found Page (`app/not-found.tsx`)

```typescript
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-gray-600 mb-8">Page not found</p>
      <a href="/" className="text-blue-500 hover:underline">
        Go back to home
      </a>
    </div>
  );
}
```

---

## Metadata & SEO

### Root Metadata (`app/metadata.ts`)

```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MarketView360 - Stock Screener & Analysis",
  description:
    "Advanced stock screening, analysis, and AI-powered market insights",
  keywords: ["stock screener", "financial analysis", "market data", "AI"],
  authors: [{ name: "Your Team" }],
  openGraph: {
    title: "MarketView360",
    description: "Advanced stock analysis platform",
    url: "https://marketview360.com",
    type: "website",
  },
};
```

### Dynamic Metadata (Page-specific)

**Company Page** (`app/company/[ticker]/page.tsx`):

```typescript
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { ticker: string };
}): Promise<Metadata> {
  const { ticker } = params;

  return {
    title: `${ticker} - Stock Analysis | MarketView360`,
    description: `Detailed analysis, charts, and financials for ${ticker}`,
  };
}
```

---

## Middleware

### Main Middleware (`middleware.ts`)

Runs on every request to authenticate and update session.

```typescript
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

### Custom Middleware Examples

**Redirect middleware** (in separate function):

```typescript
import { NextRequest, NextResponse } from "next/server";

export function redirectMiddleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/market", request.url));
  }
}
```

**CORS middleware**:

```typescript
export function corsMiddleware(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE"
  );
  return response;
}
```

---

## Route Examples

### Simple Route

```
/market

app/
├── layout.tsx ──────── RootLayout
│   └── market/
│       ├── layout.tsx  ─ MarketLayout
│       └── page.tsx ── MarketPage (rendered)
```

**Files**:

- `app/market/layout.tsx` - Market section layout
- `app/market/page.tsx` - Market page component

### Dynamic Route

```
/company/AAPL

app/
├── layout.tsx ──────────── RootLayout
│   └── company/
│       ├── page.tsx ────── CompanyListPage (not rendered)
│       └── [ticker]/
│           ├── layout.tsx  ─ CompanyLayout (rendered with params.ticker = "AAPL")
│           └── page.tsx ── CompanyPage (rendered)
```

**Files**:

- `app/company/[ticker]/layout.tsx` - Dynamic company layout
- `app/company/[ticker]/page.tsx` - Dynamic company page

### Nested Dynamic Route

```
/company/AAPL/comparisons

app/
├── layout.tsx ──────────────── RootLayout
│   └── company/
│       └── [ticker]/
│           ├── layout.tsx ─── CompanyLayout (rendered)
│           └── comparisons/
│               └── page.tsx ─ ComparisonsPage (rendered)
```

**Files**:

- `app/company/[ticker]/layout.tsx` - Company layout
- `app/company/[ticker]/comparisons/page.tsx` - Comparisons page

### Route with Parallel Segments

```
/screens/results

Showing screener results with optional sidebar
```

**Structure**:

- `app/screens/layout.tsx` - Screener layout
- `app/screens/page.tsx` - Screener interface
- `app/screens/results/page.tsx` - Results view

---

## Key Conventions

### File Naming

- Use `.tsx` for React components
- Use `.ts` for utilities/types
- Use `route.ts` for API handlers
- Use lowercase with hyphens for directories

### Imports

```typescript
// Use absolute imports with @
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/hooks/useAuth";

// Avoid relative imports
// ❌ import { Button } from "../../../components/ui/Button"
```

### Server vs Client Components

```typescript
// Server Component (default)
export default function ServerPage() {
  // Can use server-only libraries
  // Can access databases directly
  // Code doesn't ship to browser
}

// Client Component
("use client");
export default function ClientPage() {
  // Can use useState, useEffect
  // Can use event listeners
  // Shipped to browser
}
```

---

**Last Updated**: 2025-12-19  
**Version**: 1.0.0
