# MarketView360 — Frontend

**Professional Stock Analysis & Screening Platform**
Built with **Next.js 14** · **React 18** · **TypeScript 5.9** · **Tailwind CSS 4** · **Supabase** · **Vercel**

> Live at [marketview360.io](https://www.marketview360.io)

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [App Routes](#app-routes)
- [Components](#components)
- [Custom Hooks](#custom-hooks)
- [Providers (Global State)](#providers-global-state)
- [Library / Utilities](#library--utilities)
- [AI Chat System (Jovan)](#ai-chat-system-jovan)
- [Stock Screener & Query Builder](#stock-screener--query-builder)
- [Charting](#charting)
- [Watchlist System](#watchlist-system)
- [Paywall & Subscription Tiers](#paywall--subscription-tiers)
- [Authentication](#authentication)
- [SEO & Metadata](#seo--metadata)
- [Monitoring & Analytics](#monitoring--analytics)
- [Security Headers](#security-headers)
- [Configuration Files](#configuration-files)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Current Branch](#current-branch)

---

## Overview

MarketView360 is an advanced financial data screening and analysis platform targeting serious investors. It provides **80+ financial metrics**, AI-powered insights via the **Jovan** AI assistant, real-time charts, comprehensive company analytics, a powerful stock screener with a visual query builder, watchlists, news aggregation, market heatmaps, earnings calendars, and more.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript 5.9 |
| **UI Library** | React 18 |
| **Styling** | Tailwind CSS 4, `class-variance-authority`, `tailwind-merge` |
| **UI Components** | Radix UI (shadcn/ui pattern) — 22 primitives |
| **Auth & DB** | Supabase (SSR + client) |
| **Charting** | TradingView (Lightweight Charts v5), Recharts |
| **AI Chat** | Custom Jovan AI system (streaming, multi-model) |
| **Animations** | Framer Motion |
| **Notifications** | Sonner (toast) |
| **Icons** | Lucide React, React Icons |
| **PDF/Export** | jsPDF, ExcelJS, html2canvas, dom-to-image-more, file-saver |
| **Markdown** | react-markdown, remark-gfm, react-syntax-highlighter |
| **Validation** | Zod |
| **Error Tracking** | Sentry (Next.js SDK) |
| **Analytics** | Vercel Analytics, Vercel Speed Insights, Microsoft Clarity |
| **Hosting** | Vercel |
| **Package Manager** | Yarn 1.22 |
| **Testing** | Playwright (E2E) |

---

## Project Structure

```
mv360_frontend/
├── app/                        # Next.js App Router (pages & layouts)
│   ├── layout.tsx              # Root layout (fonts, theme, providers, analytics)
│   ├── page.tsx                # Homepage / Landing page
│   ├── providers.tsx           # ThemeProvider → AuthProvider → WatchlistProvider
│   ├── RouteChrome.tsx         # Conditional nav/footer wrapper per route
│   ├── metadata.ts             # Global SEO metadata
│   ├── sitemap.ts              # Dynamic sitemap (static pages + S&P 500 tickers)
│   ├── globals.css             # Global styles & CSS variables
│   ├── middleware.ts           # Supabase session middleware
│   ├── global-error.tsx        # Global error boundary
│   ├── not-found.tsx           # 404 page
│   │
│   ├── ai/                     # AI Chat (Jovan) page
│   ├── auth/                   # Auth flows (login, signup, forgot/reset password, callback)
│   ├── company/[ticker]/       # Dynamic company pages (overview, financials, technicals, holders, peers, news, analysis)
│   ├── dashboard/              # User dashboard
│   ├── earnings/               # Earnings calendar
│   ├── market/                 # Market overview page
│   ├── news/                   # News hub (with dynamic [slug] articles)
│   ├── pricing/                # Pricing / subscription plans
│   ├── profile/                # User profile
│   ├── screens/                # Stock screener (query builder + results)
│   ├── settings/               # User settings (9 sub-sections)
│   ├── watchlist/              # Watchlists page
│   │
│   ├── about/                  # About page
│   ├── blog/                   # Blog page
│   ├── contact/                # Contact page
│   ├── cookies/                # Cookie policy
│   ├── coming-soon/            # Coming soon page
│   ├── disclaimer/             # Disclaimer page
│   ├── feedback/               # Feedback page
│   ├── help/                   # Help center
│   ├── privacy/                # Privacy policy
│   ├── status/                 # System status page
│   ├── terms/                  # Terms of service
│   │
│   └── api/                    # API routes (IndexNow, Sentry, Status)
│
├── components/                 # Reusable React components
│   ├── ui/                     # 22 Radix/shadcn UI primitives
│   ├── auth/                   # SocialAuthButtons, UserAvatar, UserDropdown
│   ├── common/                 # Logo
│   ├── company/                # 17 company-detail components
│   ├── dashboard/              # DashboardSidebar
│   ├── home/                   # PopularStocksCarousel
│   ├── market/                 # EconomicCalendar, GlobalMarkets, MarketBreadth, SectorPerformance
│   ├── news/                   # AdvancedSearchModal, BreakingNewsCarousel, MyWatchlistsNews, NewsSidebar
│   ├── paywall/                # BlurredContent, FeatureBadge, PaywallModal, PaywallOverlay, UsageIndicator
│   ├── seo/                    # StructuredData (JSON-LD)
│   ├── support/                # SupportWidget
│   ├── watchlist/              # 12 watchlist components (table, compare, import/export, AI analyze)
│   │
│   ├── AiChatWidget.tsx        # Floating AI chat widget
│   ├── AdvancedPriceChart.tsx   # Advanced charting component
│   ├── ChartSettingsPopover.tsx # Chart configuration UI
│   ├── MarketHeatmap.tsx       # Market heatmap visualization
│   ├── MarketHeatmapNew.tsx    # Redesigned market heatmap
│   ├── MarketOverview.tsx      # Market overview dashboard
│   ├── NavigationBar.tsx       # Main navigation bar
│   ├── NavSearch.tsx           # Navigation search component
│   ├── PriceChart.tsx          # Core price chart (55KB — largest component)
│   ├── ScreenerQueryBuilder.tsx # Visual query builder (92KB)
│   ├── StrategyLibrary.tsx     # Pre-built screening strategies
│   ├── SearchBar.tsx           # Global search bar
│   ├── TradingViewChart.tsx    # TradingView integration
│   ├── SaveScreenDialog.tsx    # Save screener queries
│   ├── SavedScreensList.tsx    # Saved screens management
│   ├── ScreenTemplatesSidebar.tsx # Screener templates
│   ├── FinancialTable.tsx      # Financial data table
│   ├── RatioCube.tsx           # Ratio display widget
│   ├── QueryValidation.tsx     # Screener query validator
│   ├── AutoCompleteDropdown.tsx # Ticker autocomplete
│   ├── NetworkStatusWatcher.tsx # Offline/online detector
│   ├── MaintenanceBanner.tsx   # Maintenance mode banner
│   ├── MaintenancePage.tsx     # Full maintenance page
│   ├── MaintenanceWrapper.tsx  # Maintenance check wrapper
│   ├── AnnouncementsBanner.tsx # Site-wide announcements
│   ├── ThemeToggle.tsx         # Dark/light mode toggle
│   └── SyntaxHighlighter.tsx   # Code syntax highlighting
│
├── hooks/                      # 14 custom React hooks
├── lib/                        # Core libraries & utilities
│   ├── api/                    # API client (ai.ts, waitlist.ts)
│   ├── supabase/               # Supabase client/server/middleware setup
│   ├── utils/                  # Utilities (normalizeAiOutput, jovan/)
│   ├── metricDefinitions.ts    # 80+ financial metric definitions
│   ├── queryBuilder.ts         # Screener query engine (77KB)
│   ├── eodhd.ts                # EODHD market data API client
│   ├── maintenance.ts          # Maintenance mode logic
│   ├── announcements.ts        # Announcements config
│   ├── mockData.ts             # Development mock data
│   ├── utils.ts                # General utils (cn helper)
│   └── watchlist-utils.ts      # Watchlist utility functions
│
├── providers/                  # React Context providers
│   ├── AuthProvider.tsx        # Authentication state management
│   └── WatchlistProvider.tsx   # Watchlist state management
│
├── types/                      # TypeScript type declarations
│   ├── supabase.d.ts           # Supabase type extensions
│   └── dom-to-image-more.d.ts  # DOM-to-image type shim
│
├── src/lib/                    # Additional lib (alias resolution)
├── public/                     # Static assets (logos, icons, manifests, robots.txt)
├── docs/ & documentation/      # Project documentation
├── markdown/                   # Markdown content files
│
├── next.config.mjs             # Next.js config (Sentry, security headers, webpack aliases)
├── tailwind.config.ts          # Tailwind config (custom design tokens)
├── tsconfig.json               # TypeScript configuration
├── middleware.ts               # Root Supabase session middleware
├── vercel.json                 # Vercel deployment config
├── postcss.config.mjs          # PostCSS config
├── .eslintrc.json              # ESLint config
├── instrumentation.ts          # Sentry server instrumentation
├── instrumentation-client.ts   # Sentry client instrumentation
├── package.json                # Dependencies & scripts
└── yarn.lock                   # Dependency lockfile
```

---

## App Routes

### Core Application Routes

| Route | Description |
|---|---|
| `/` | Landing page with popular stocks carousel and platform overview |
| `/dashboard` | User dashboard with personalized market data |
| `/company/[ticker]` | **Dynamic** company page (overview, key metrics, price chart) |
| `/company/[ticker]/financials` | Income statement, balance sheet, cash flow |
| `/company/[ticker]/technicals` | Technical analysis indicators and charts |
| `/company/[ticker]/holders` | Institutional & fund ownership data |
| `/company/[ticker]/peers` | Peer comparison analysis |
| `/company/[ticker]/news` | Company-specific news feed |
| `/company/[ticker]/analysis` | AI-powered company analysis |
| `/screens` | Stock screener with visual query builder |
| `/screens/results` | Screener results page |
| `/market` | Market overview (heatmap, sector performance, breadth, global markets) |
| `/ai` | Jovan AI chat — full-page AI assistant |
| `/watchlist` | Watchlist management (create, compare, import/export, AI analysis) |
| `/earnings` | Earnings calendar |
| `/news` | News hub with filters, categories, and breaking news |
| `/news/[slug]` | Individual news article page |

### User Account Routes

| Route | Description |
|---|---|
| `/auth/login` | Login page |
| `/auth/signup` | Registration page |
| `/auth/forgot-password` | Password recovery |
| `/auth/reset-password` | Password reset |
| `/auth/callback` | OAuth callback handler |
| `/auth/already-logged-in` | Redirect for authenticated users |
| `/profile` | User profile page |
| `/settings` | Settings hub |
| `/settings/general` | General preferences |
| `/settings/appearance` | Theme & display settings |
| `/settings/jovan-ai` | AI assistant preferences |
| `/settings/metrics` | Metric display configuration |
| `/settings/billing` | Subscription & billing management |
| `/settings/notifications` | Notification preferences |
| `/settings/privacy` | Privacy settings |
| `/settings/profile` | Profile editing |
| `/settings/security` | Security & password management |
| `/pricing` | Subscription plans and pricing |

### Informational Pages

| Route | Description |
|---|---|
| `/about` | About MarketView360 |
| `/blog` | Blog & announcements |
| `/contact` | Contact form |
| `/help` | Help center |
| `/feedback` | User feedback form |
| `/status` | System status page |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |
| `/disclaimer` | Financial disclaimer |
| `/cookies` | Cookie policy |
| `/coming-soon` | Feature teaser page |

---

## Components

### UI Primitives (`components/ui/`) — 22 components

Built on **Radix UI** following the **shadcn/ui** pattern:

`alert-dialog` · `badge` · `button` · `card` · `checkbox` · `dialog` · `dropdown-menu` · `input` · `kbd` · `label` · `popover` · `progress` · `scroll-area` · `select` · `separator` · `skeleton` · `sonner` · `switch` · `tabs` · `textarea` · `tooltip` · `alert-dialog-custom`

### Domain Components

| Directory | Components | Purpose |
|---|---|---|
| `company/` | 17 components | Company detail pages — KeyMetrics, FinancialsSection, TechnicalsSection, OwnershipSection, PeerComparison, CompanyChartsSwitcher, CompanyNavigation, NewsFeed, AddToWatchlistButton, UsdValue, etc. |
| `watchlist/` | 12 components | Watchlist system — EnhancedWatchlistTable, StockCompare, WatchlistExportDialog, WatchlistImportDialog, AnalyzeWithAI, SimilarStocks, WatchlistFormDialog, WatchlistNews, etc. |
| `market/` | 4 components | Market overview — SectorPerformance, GlobalMarkets, MarketBreadth, EconomicCalendar |
| `news/` | 4 components | News features — AdvancedSearchModal, BreakingNewsCarousel, MyWatchlistsNews, NewsSidebar |
| `paywall/` | 6 components | Subscription gating — PaywallModal, PaywallOverlay, BlurredContent, FeatureBadge, UsageIndicator |
| `auth/` | 3 components | Authentication UI — SocialAuthButtons, UserAvatar, UserDropdown |
| `home/` | 1 component | PopularStocksCarousel |
| `dashboard/` | 1 component | DashboardSidebar |
| `seo/` | 2 files | StructuredData (JSON-LD schema markup) |
| `support/` | 1 component | SupportWidget |
| `common/` | 1 component | Logo |

### Key Standalone Components

| Component | Size | Description |
|---|---|---|
| `ScreenerQueryBuilder.tsx` | 92 KB | Visual stock screener query builder with 80+ metrics, operators, grouping |
| `PriceChart.tsx` | 55 KB | Core price chart with candlestick, line, area modes, indicators, annotations |
| `StrategyLibrary.tsx` | 44 KB | Pre-built screening strategy templates |
| `MarketHeatmapNew.tsx` | 29 KB | Treemap-style market heatmap visualization |
| `TradingViewChart.tsx` | 28 KB | TradingView Lightweight Charts integration |
| `MarketOverview.tsx` | 21 KB | Market dashboard with indices, movers, breadth |
| `ChartSettingsPopover.tsx` | 20 KB | Comprehensive chart configuration panel |
| `AiChatWidget.tsx` | 10 KB | Floating AI chat widget accessible site-wide |

---

## Custom Hooks

| Hook | Description |
|---|---|
| `useAIModels` | AI model selection & configuration for Jovan |
| `useAIPreferences` | User AI preferences (tone, detail level, etc.) |
| `useChartPreferences` | Chart display preferences (type, indicators, timeframe) |
| `useMetricsPreferences` | Customizable metric display preferences |
| `useNetworkStatus` | Online/offline detection & reconnection handling |
| `useNewsPreferences` | News feed filtering & display preferences |
| `useProfile` | User profile data management |
| `useQuota` | API usage quota tracking (per subscription tier) |
| `useSavedScreens` | CRUD operations for saved screener queries |
| `useTextToSpeech` | Text-to-speech for AI responses |
| `useToolsConfig` | AI tool configuration management |
| `useUserSubscription` | Subscription status & tier detection |
| `useVoiceInput` | Voice input for AI chat |
| `useWatchlist` | Watchlist CRUD operations & state |

---

## Providers (Global State)

The provider hierarchy wraps the entire application:

```
ThemeProvider (light/dark mode)
  └── AuthProvider (Supabase auth state, user session)
       └── WatchlistProvider (watchlist data, real-time sync)
            └── App content
```

- **ThemeProvider** — Manages light/dark theme with localStorage persistence and system preference detection. Flash-free via inline `<script>` in root layout.
- **AuthProvider** — Supabase auth session management with SSR support.
- **WatchlistProvider** — Global watchlist state with Supabase real-time sync.

---

## Library / Utilities

### API Layer (`lib/api/`)

| File | Description |
|---|---|
| `ai.ts` | AI chat API client — streaming responses, conversation management, model selection |
| `waitlist.ts` | Waitlist/beta access API |

### Supabase (`lib/supabase/`)

| File | Description |
|---|---|
| `client.ts` | Browser-side Supabase client |
| `server.ts` | Server-side Supabase client (cookies-based) |
| `middleware.ts` | Session refresh middleware for SSR |

### Core Utilities

| File | Size | Description |
|---|---|---|
| `queryBuilder.ts` | 77 KB | **Screener query engine** — parses, validates, and executes complex financial queries with AND/OR grouping, comparison operators, and 80+ metric support |
| `metricDefinitions.ts` | 28 KB | Comprehensive financial metric catalog (PE, PB, ROE, debt ratios, margins, growth rates, etc.) with categories, descriptions, and formatting rules |
| `eodhd.ts` | 2 KB | EODHD financial data API integration |
| `maintenance.ts` | 3 KB | Maintenance mode detection & configuration |
| `announcements.ts` | 1 KB | Site-wide announcement management |
| `utils/normalizeAiOutput.ts` | 3 KB | Normalizes AI response formatting |
| `utils/jovan/` | — | Jovan AI-specific utilities (parsing, formatting) |
| `watchlist-utils.ts` | — | Watchlist helper functions |
| `utils.ts` | — | General utilities (includes `cn()` — Tailwind class merger) |

---

## AI Chat System (Jovan)

Jovan is the platform's AI financial assistant with a dedicated `/ai` route and a floating widget accessible site-wide.

### Features

- **Multi-model support** — configurable AI model selection
- **Streaming responses** — real-time token streaming
- **Reasoning blocks** — expandable "thinking" process visualization
- **Tool usage blocks** — shows when AI uses external tools (data lookups, chart generation)
- **Voice input** — speech-to-text for chat input
- **Text-to-speech** — spoken AI responses
- **Context selection** — scope AI to specific tickers/topics
- **Conversation sidebar** — chat history management
- **Suggestion sidebar** — prompt suggestions
- **Quota tracking** — usage limits per subscription tier
- **Anonymous access** — limited messages for unauthenticated users (configurable)
- **Login gating** — upgrade prompts for free-tier users

### AI Components (`app/ai/components/`)

`ChatArea` · `MessageInput` · `ModelSelector` · `ContextSelector` · `Sidebar` · `SuggestionSidebar` · `ReasoningBlock` · `ToolUsageBlock` · `QuotaIndicator` · `LoginRequired` · `UpgradeDialog` · `Icons`

---

## Stock Screener & Query Builder

The screener is one of the platform's flagship features, powered by:

- **`ScreenerQueryBuilder.tsx`** (92 KB) — Visual drag-and-drop query builder supporting:
  - 80+ financial metrics grouped by category
  - Comparison operators (`>`, `<`, `=`, `between`, etc.)
  - AND/OR logical grouping with nested conditions
  - Real-time query validation
  - Save/load custom screens

- **`queryBuilder.ts`** (77 KB) — Core query engine that compiles visual queries into API-compatible filter objects

- **`StrategyLibrary.tsx`** (44 KB) — Pre-built screening templates (value investing, growth, momentum, dividend, etc.)

- **`SaveScreenDialog.tsx`** / **`SavedScreensList.tsx`** — Persistent screen management via Supabase

- **`ScreenTemplatesSidebar.tsx`** — Quick-access template browser

---

## Charting

The platform offers multiple charting solutions:

| Component | Library | Features |
|---|---|---|
| `PriceChart.tsx` | Custom (Canvas/SVG) | Candlestick, line, area charts; technical indicators; annotations; crosshair; zoom/pan |
| `TradingViewChart.tsx` | Lightweight Charts v5 | TradingView-powered chart with real-time data, volume, watermark |
| `AdvancedPriceChart.tsx` | — | Extended chart with advanced indicator overlays |
| `ChartSettingsPopover.tsx` | — | Comprehensive configuration panel (chart type, timeframe, indicators, colors) |
| `CompanyChartsSwitcher.tsx` | Recharts | Financials charting (revenue, income, margins over time) |
| `MarketHeatmap[New].tsx` | Custom | Treemap-style sector/stock heatmap |
| `ComparisonCharts.tsx` | Recharts | Multi-stock comparison charts in watchlist |

---

## Watchlist System

A full-featured watchlist management system:

- **Create/edit/delete** watchlists with custom names
- **Enhanced stock table** with real-time price data, sparklines, and key metrics
- **Stock comparison** — side-by-side comparison of watchlist stocks
- **AI analysis** — Jovan can analyze an entire watchlist
- **Similar stocks** — AI-powered similar stock suggestions
- **Import** — CSV/Excel import with column mapping
- **Export** — PDF, Excel, CSV export with customizable templates
- **News feed** — aggregated news for watchlist stocks
- **Real-time sync** via Supabase and WatchlistProvider

---

## Paywall & Subscription Tiers

The platform implements a tiered subscription model with client-side gating:

| Component | Purpose |
|---|---|
| `PaywallModal` | Upgrade prompt modal |
| `PaywallOverlay` | Overlay on premium content |
| `BlurredContent` | Blurred preview of gated content |
| `FeatureBadge` | Tier badges (Pro, Elite) |
| `UsageIndicator` | Quota usage display |

Subscription tiers are color-coded in the design system:
- **Free** — Default (brand blue)
- **Pro** — Warning/amber palette (`#f59e0b`)
- **Elite** — Purple palette (`#8b5cf6`)

---

## Authentication

Authentication is powered by **Supabase Auth** with SSR support:

- **Email/password** login and registration
- **Social OAuth** (via `SocialAuthButtons` component)
- **Password recovery** — forgot/reset password flow
- **Session middleware** — automatic session refresh on every request
- **Protected routes** — middleware-based route protection
- **Auth callback** — OAuth redirect handling

Files involved:
- `middleware.ts` — Root session middleware
- `lib/supabase/` — Client, server, and middleware Supabase configs
- `providers/AuthProvider.tsx` — Global auth context
- `app/auth/` — All auth route pages

---

## SEO & Metadata

- **Global metadata** (`app/metadata.ts`) — OpenGraph, Twitter Cards, structured robots directives, icons/manifest
- **Per-page metadata** — Route-specific `metadata.ts` files in `/ai`, `/market`, `/screens`, `/pricing`
- **Structured Data** (`components/seo/StructuredData.tsx`) — JSON-LD schema markup for search engines
- **Dynamic sitemap** (`app/sitemap.ts`) — Includes all static pages + 70 popular S&P 500 ticker pages
- **IndexNow API** (`app/api/indexnow/`) — Real-time URL submission to search engines
- **robots.txt** — Configured in `public/robots.txt`
- **Canonical URLs** — Set via metadata base (`https://www.marketview360.io`)

---

## Monitoring & Analytics

| Service | Purpose | Config |
|---|---|---|
| **Sentry** | Error tracking & performance monitoring | `sentry.server.config.ts`, `sentry.edge.config.ts`, `instrumentation.ts`, `instrumentation-client.ts` |
| **Vercel Analytics** | Page view & visitor analytics | `@vercel/analytics` in root layout |
| **Vercel Speed Insights** | Core Web Vitals monitoring | `@vercel/speed-insights` in root layout |
| **Microsoft Clarity** | Session recordings & heatmaps | Inline script in root layout (ID: `vvhult0bm8`) |

---

## Security Headers

Configured in `next.config.mjs` for all routes:

| Header | Value |
|---|---|
| `X-DNS-Prefetch-Control` | `on` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `X-Frame-Options` | `SAMEORIGIN` |
| `X-Content-Type-Options` | `nosniff` |
| `X-XSS-Protection` | `1; mode=block` |
| `Referrer-Policy` | `origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |

---

## Configuration Files

| File | Purpose |
|---|---|
| `next.config.mjs` | Next.js config — Sentry wrapper, security headers, webpack alias (`@/`), SWC minification |
| `tailwind.config.ts` | Custom design system — brand/growth/danger/warning/elite color palettes, Inter font, container widths (1600px max) |
| `tsconfig.json` | TypeScript config with `@/` path alias |
| `postcss.config.mjs` | PostCSS with Tailwind plugin |
| `.eslintrc.json` | ESLint with Next.js preset |
| `vercel.json` | Vercel: `next build`, `npm install`, `.next` output |
| `components.json` | shadcn/ui component configuration |

---

## Environment Variables

Based on `.env.example`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=          # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # Supabase anonymous key

# Backend API
NEXT_PUBLIC_API_URL=               # Backend API URL (default: http://localhost:3001)

# Feature Flags
NEXT_PUBLIC_SHOW_DEMO_BUTTON=      # Show "Watch Demo" button on homepage (true/false)
NEXT_PUBLIC_ALLOW_ANONYMOUS_AI_CHAT=  # Allow AI chat without login (true/false)
NEXT_PUBLIC_ALLOW_REASONING_PREVIEW=  # Show expandable AI reasoning blocks (true/false)
```

Additional env files:
- `.env.local.example` — Local development overrides
- `.env.sentry-build-plugin` — Sentry source map upload credentials

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **Yarn** 1.22+
- Supabase project with auth configured
- Backend API running (default: `http://localhost:3001`)

### Installation

```bash
# Clone the repository (ratios branch)
git clone -b ratios https://github.com/MarketView360/mv360_frontend.git
cd mv360_frontend

# Install dependencies
yarn install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase and API credentials

# Start development server
yarn dev
```

The app will be available at `http://localhost:3000`.

### Available Scripts

| Command | Description |
|---|---|
| `yarn dev` | Start development server |
| `yarn build` | Create production build |
| `yarn start` | Start production server |
| `yarn lint` | Run ESLint |

---

## Deployment

The application is deployed on **Vercel** with the following configuration:

- **Build command**: `next build`
- **Install command**: `npm install`
- **Output directory**: `.next`
- **Framework preset**: Next.js

Sentry source maps are uploaded during CI builds via `@sentry/nextjs` plugin. The monitoring tunnel route (`/monitoring`) is active only in production to circumvent ad-blockers.

---

## Current Branch

**`ratios`** — Latest commit: `b8b45c9` — *microsoft clarity analysis addon script*

---

*Last updated: March 14, 2026*