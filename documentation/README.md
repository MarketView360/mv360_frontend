# MarketView360 Frontend - Complete Documentation

**Version**: 1.0.0  
**Framework**: Next.js 14 (App Router)  
**Language**: TypeScript 5.9  
**Styling**: Tailwind CSS 4 + Radix UI  
**Date**: 2025-12-19

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Quick Start](#quick-start)
3. [Project Structure](#project-structure)
4. [Technology Stack](#technology-stack)
5. [Key Features](#key-features)
6. [Routing & Pages](#routing--pages)
7. [State Management](#state-management)
8. [Authentication Flow](#authentication-flow)
9. [Component Architecture](#component-architecture)
10. [API Integration](#api-integration)
11. [Performance & Optimization](#performance--optimization)
12. [Deployment](#deployment)
13. [Related Documentation](#related-documentation)

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MarketView360 Frontend                   │
│                     (Next.js 14 App Router)                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
┌──────────────────┐       ┌──────────────────┐
│  Public Pages    │       │ Protected Routes │
│  • Auth          │       │ • Screener       │
│  • Market        │       │ • Company        │
│  • News          │       │ • Portfolio      │
│  • Coming Soon   │       │ • Settings       │
└────────┬─────────┘       └────────┬─────────┘
         │                         │
         └────────────┬────────────┘
                      │
        ┌─────────────▼─────────────┐
        │  Shared Components        │
        │  • Navigation Bar         │
        │  • AI Chat Widget         │
        │  • Theme Switcher        │
        │  • Footer                │
        └────────────┬──────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
    ┌────────┐ ┌────────┐ ┌──────────┐
    │ Hooks  │ │ Utils  │ │ Services │
    │ (6)    │ │ (10+)  │ │ (API)    │
    └────────┘ └────────┘ └──────────┘
        │            │            │
        └────────────┴────────────┘
                     │
        ┌────────────▼──────────────┐
        │   Backend API & Supabase  │
        │  (NestJS + PostgreSQL)    │
        └───────────────────────────┘
```

---

## Quick Start

### Installation

```bash
# Clone repository
git clone https://github.com/your-org/market360.git
cd mv360_frontend

# Install dependencies
npm install
# or
yarn install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
# or
yarn dev
```

### Development Server

```bash
# Runs on http://localhost:3000
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Linting
npm run lint
```

---

## Project Structure

```
mv360_frontend/
├── app/                              # Next.js App Router
│   ├── layout.tsx                   # Root layout component
│   ├── page.tsx                     # Home page
│   ├── providers.tsx                # Theme & Client providers
│   ├── globals.css                  # Global styles
│   ├── metadata.ts                  # SEO metadata
│   │
│   ├── auth/                        # Authentication
│   │   ├── page.tsx                 # Login/Register page
│   │   └── [action]/page.tsx        # Dynamic auth routes
│   │
│   ├── market/                      # Market overview
│   │   ├── page.tsx                 # Market dashboard
│   │   └── layout.tsx               # Market layout
│   │
│   ├── company/                     # Company analysis
│   │   ├── page.tsx                 # Company list/search
│   │   ├── [ticker]/                # Dynamic company pages
│   │   │   ├── page.tsx            # Company detail
│   │   │   └── layout.tsx           # Company layout
│   │   └── [ticker]/comparisons/    # Peer comparisons
│   │
│   ├── screens/                     # Stock screener
│   │   ├── page.tsx                 # Screener interface
│   │   ├── results/                 # Results view
│   │   └── saved/                   # Saved screens
│   │
│   ├── jovan-chat/                  # AI Chat feature
│   │   ├── page.tsx                 # Chat interface
│   │   ├── [sessionId]/             # Chat session
│   │   └── layout.tsx               # Chat layout
│   │
│   ├── profile/                     # User profile
│   │   ├── page.tsx                 # Profile page
│   │   ├── settings/                # User settings
│   │   └── watchlist/               # Watchlist
│   │
│   ├── news/                        # Financial news
│   │   ├── page.tsx                 # News feed
│   │   └── [newsId]/                # News detail
│   │
│   ├── settings/                    # App settings
│   │   ├── page.tsx                 # Settings dashboard
│   │   ├── preferences/             # User preferences
│   │   └── notifications/           # Notification settings
│   │
│   ├── api/                         # API routes
│   │   ├── auth/                    # Auth endpoints
│   │   ├── chat/                    # Chat endpoints
│   │   └── user/                    # User endpoints
│   │
│   └── coming-soon/                 # Coming soon page
│
├── components/                      # React Components
│   ├── NavigationBar.tsx            # Main nav bar
│   ├── AiChatWidget.tsx             # AI Chat floating widget
│   ├── ThemeToggle.tsx              # Dark/Light mode toggle
│   ├── Footer.tsx                   # Footer component
│   ├── NetworkStatusWatcher.tsx     # Network status indicator
│   │
│   ├── auth/                        # Auth components
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── ProtectedRoute.tsx
│   │
│   ├── company/                     # Company components
│   │   ├── CompanyProfile.tsx
│   │   ├── CompanyChart.tsx
│   │   ├── CompanyFinancials.tsx
│   │   └── PeerComparison.tsx
│   │
│   ├── jovan/                       # AI Chat components
│   │   ├── ChatInterface.tsx
│   │   ├── MessageList.tsx
│   │   ├── InputArea.tsx
│   │   └── SessionList.tsx
│   │
│   ├── screens/                     # Screener components
│   │   ├── ScreenerQueryBuilder.tsx # Query builder UI
│   │   ├── QueryValidation.tsx      # Query validation
│   │   ├── ScreenerResults.tsx      # Results table
│   │   └── FilterPanel.tsx          # Filter options
│   │
│   ├── ui/                          # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Dialog.tsx
│   │   ├── Tabs.tsx
│   │   ├── Table.tsx
│   │   └── ...
│   │
│   ├── FinancialTable.tsx           # Data table with sorting
│   ├── PriceChart.tsx               # Chart component (Recharts)
│   ├── MarketOverview.tsx           # Market overview widget
│   ├── MarketHeatmap.tsx            # Market heatmap
│   ├── StrategyLibrary.tsx          # Investment strategies
│   ├── SyntaxHighlighter.tsx        # Code highlighting
│   ├── RatioCube.tsx                # 3D ratio visualization
│   ├── AutoCompleteDropdown.tsx     # Search autocomplete
│   └── SearchBar.tsx                # Search component
│
├── hooks/                           # Custom React Hooks (6)
│   ├── useAIModels.ts              # AI model selection
│   ├── useAIPreferences.ts          # User AI preferences
│   ├── useNetworkStatus.ts          # Network connectivity
│   ├── useQuota.ts                  # API quota tracking
│   ├── useTextToSpeech.ts           # Text-to-speech
│   └── useVoiceInput.ts             # Voice input/transcription
│
├── lib/                             # Utilities & Services
│   ├── utils.ts                    # Helper functions
│   ├── mockData.ts                 # Mock data for development
│   ├── queryBuilder.ts             # Query builder logic
│   ├── eodhd.ts                    # EODHD API client
│   │
│   ├── supabase/                   # Supabase integration
│   │   ├── client.ts               # Client instance
│   │   ├── server.ts               # Server instance
│   │   └── middleware.ts           # Auth middleware
│   │
│   ├── hooks/                      # Library hooks
│   │   ├── useAuth.ts              # Auth hook
│   │   ├── useUser.ts              # User data hook
│   │   └── useTheme.ts             # Theme hook
│   │
│   └── utils/                      # Utility functions
│       ├── formatting.ts           # Format numbers, dates
│       ├── validation.ts           # Input validation
│       ├── calculations.ts         # Financial calculations
│       └── localStorage.ts         # Local storage helpers
│
├── providers/                       # Context Providers
│   ├── AuthProvider.tsx            # Auth context
│   └── ThemeProvider.tsx           # Theme context
│
├── middleware.ts                    # Next.js middleware
├── instrumentation.ts               # Error tracking (Sentry)
├── next.config.mjs                 # Next.js configuration
├── tailwind.config.ts              # Tailwind configuration
├── tsconfig.json                   # TypeScript config
├── package.json                    # Dependencies
└── README.md                        # Project README
```

---

## Technology Stack

### Core Framework

- **Next.js 14**: React framework with App Router
- **React 18**: UI library
- **TypeScript 5.9**: Type safety

### Styling & UI

- **Tailwind CSS 4**: Utility-first CSS framework
- **Radix UI**: Headless UI components
  - Dropdown menus, tooltips, tabs, switches, etc.
- **Lucide React**: Icon library
- **Framer Motion**: Animation library

### State & Data

- **Supabase JS SDK 2.86**: Backend client
- **Zod**: Schema validation
- **React Hooks**: State management (useContext, useState)

### Charts & Visualization

- **Recharts 3.5**: Chart library
- **React Markdown**: Markdown rendering
- **React Syntax Highlighter**: Code highlighting

### Utilities

- **date-fns 4.1**: Date formatting
- **class-variance-authority**: Component variants
- **clsx**: Class name merging
- **tailwind-merge**: Tailwind class merging
- **xlsx**: Excel export
- **jsPDF**: PDF generation

### Developer Tools

- **ESLint**: Code linting
- **Sentry**: Error tracking
- **Next Themes**: Dark mode management
- **React Intersection Observer**: Lazy loading

---

## Key Features

### 1. **Stock Screener**

- Natural language query interface
- 80+ financial metrics
- Real-time filtering
- Save custom screens
- Export results (CSV, Excel, PDF)

### 2. **Company Analysis**

- Detailed company profiles
- Historical charts (price, metrics, technicals)
- Financial statements
- Peer comparisons
- News integration
- SEC filings

### 3. **Market Overview**

- Index performance
- Market heat map
- Sector breakdown
- Top gainers/losers
- Market news

### 4. **AI Chat (Jovan)**

- Multi-turn conversations
- Stock market analysis
- Financial calculations
- Query generation
- Voice input (transcription)
- Text-to-speech output
- Session management
- Usage quota tracking

### 5. **User Management**

- Authentication (JWT)
- User profiles
- Preferences (AI model, language)
- Watchlist
- Saved screens
- Notification settings

### 6. **Responsive Design**

- Mobile-first approach
- Tablet & desktop layouts
- Dark/light mode
- Accessibility (WCAG 2.1 AA)

---

## Routing & Pages

### Public Routes

```
/                  # Home/market overview
/auth              # Authentication page
/auth/login        # Login
/auth/register     # Sign up
/auth/reset        # Password reset
/market            # Market dashboard
/news              # Financial news
/coming-soon       # Coming soon page
```

### Protected Routes (Require Authentication)

```
/company           # Company database
/company/[ticker]  # Company detail page
/screens           # Stock screener
/screens/results   # Screener results
/screens/saved     # Saved screens
/jovan-chat        # AI Chat interface
/jovan-chat/[id]   # Chat session
/profile           # User profile
/profile/settings  # User settings
/profile/watchlist # Saved watchlist
/settings          # App settings
```

### API Routes

```
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/auth/refresh

POST   /api/chat/sessions
GET    /api/chat/sessions
POST   /api/chat/sessions/[id]/messages
GET    /api/chat/sessions/[id]/messages

POST   /api/user/preferences
GET    /api/user/preferences
POST   /api/user/watchlist
GET    /api/user/watchlist
```

---

## State Management

### 1. **Context API**

- **AuthContext**: Authentication state, user info
- **ThemeContext**: Light/dark mode

### 2. **Custom Hooks**

- **useAuth()**: Access auth state
- **useUser()**: Access user data
- **useTheme()**: Access theme state
- **useNetworkStatus()**: Network connectivity

### 3. **Local Storage**

- Theme preference
- Saved filters
- Session data
- User preferences

### 4. **Server State**

- Managed via Supabase SDK
- Real-time subscriptions
- Optimistic updates

---

## Authentication Flow

```
1. User navigates to /auth
   │
   ├─→ Shows login or register form
   │
   ├─→ User enters credentials
   │
   ├─→ POST /api/auth/login
   │
   ├─→ Supabase authenticates via JWT
   │
   ├─→ JWT stored in secure HTTP-only cookie
   │
   ├─→ Middleware validates on every request
   │
   ├─→ User redirected to /market
   │
   └─→ Protected routes accessible

2. Session Management
   ├─→ Middleware checks JWT on every request
   ├─→ Auto-refresh before expiration
   ├─→ Logout clears cookie
   └─→ Unauthorized requests redirect to /auth
```

---

## Component Architecture

### Component Hierarchy

```
RootLayout
├── ThemeProvider
├── AuthProvider
├── NavigationBar
│   ├── Logo
│   ├── NavLinks
│   ├── SearchBar
│   ├── ThemeToggle
│   └── UserMenu
├── Page Content
│   └── (Dynamic based on route)
├── AiChatWidget
│   ├── ChatInterface
│   │   ├── MessageList
│   │   └── InputArea
│   └── ToggleButton
├── NetworkStatusWatcher
└── Footer
```

### Reusable Component Pattern

**UI Components** (in `components/ui/`):

```typescript
// Shadcn/Radix based components
Button, Input, Select, Dialog, Tabs, Table, etc.
```

**Feature Components** (in `components/{feature}/`):

```typescript
// Composed of UI components + business logic
ScreenerQueryBuilder, ChatInterface, CompanyProfile, etc.
```

**Page Components** (in `app/{route}/page.tsx`):

```typescript
// Route-specific layouts and compositions
Default export components for each route
```

---

## API Integration

### Backend Endpoints

**Backend**: NestJS API running on http://localhost:4000

**Endpoints Used**:

```typescript
// Screener
GET    /api/run-query
GET    /api/company/:ticker
GET    /api/company/:ticker/peers
GET    /api/company/:ticker/valuations
GET    /api/company/:ticker/financials
GET    /api/company/:ticker/technicals
GET    /api/company/:ticker/filings
GET    /api/company/:ticker/news
GET    /api/indices
GET    /api/prices/:ticker

// Chat (if backend integration)
POST   /api/ai-chat/chat
GET    /api/ai-chat/sessions
POST   /api/ai-chat/sessions
GET    /api/ai-chat/sessions/:id/messages
```

### EODHD API Integration

**Frontend EODHD Client** (`lib/eodhd.ts`):

```typescript
// Direct API calls for:
// - Real-time quotes
// - Company fundamentals
// - News
// - Technical indicators
// - Historical data
```

### Supabase Integration

**Authentication**:

```typescript
// JWT-based with Supabase SDK
await supabase.auth.signInWithPassword({
  email,
  password,
});
```

**Database Access**:

```typescript
// User preferences, watchlists, sessions
const { data } = await supabase.from("user_preferences").select("*");
```

**Real-time Subscriptions**:

```typescript
// Live updates for prices, chat
supabase.channel("prices").on("postgres_changes", handler).subscribe();
```

---

## Performance & Optimization

### 1. **Code Splitting**

- Dynamic imports for heavy components
- Lazy loading of pages
- Route-based code splitting (Next.js automatic)

### 2. **Image Optimization**

- Next.js Image component
- Automatic WebP conversion
- Responsive images

### 3. **Caching**

- SWR for data fetching
- Browser cache headers
- Static generation for public pages

### 4. **Bundle Size**

- Tree-shaking
- ESM modules
- Minification in production

### 5. **Rendering Optimization**

- Server Components for static content
- Client Components for interactivity
- Suspense boundaries
- Streaming

### 6. **Network**

- API request debouncing
- Pagination for large lists
- Compression (gzip/brotli)
- CDN for static assets

---

## Deployment

### Development

```bash
npm run dev  # Localhost:3000
```

### Production Build

```bash
npm run build
npm start
```

### Environment Variables (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
NEXT_PUBLIC_EODHD_API_TOKEN=xxx
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Vercel Deployment

```bash
# Connect to Vercel
vercel
# Set environment variables in dashboard
# Auto-deploys on git push
```

---

## Related Documentation

- [01-App-Structure.md](./01-app-structure.md) - Detailed app routing and layouts
- [02-Components.md](./02-components.md) - Complete component reference
- [03-Hooks.md](./03-hooks.md) - Custom hooks documentation
- [04-Library-Utils.md](./04-library-utils.md) - Utility functions and services
- [05-Features.md](./05-features.md) - Feature documentation (Chat, Screener, etc.)
- [../mv360_backend/documentation/](../mv360_backend/documentation/) - Backend API reference

---

## Getting Help

### Documentation

- Check related documentation files (see above)
- Review inline code comments
- Check component storybook (if available)

### Common Issues

- **Build errors**: Clear `.next` and `node_modules`, reinstall
- **Auth issues**: Check `.env.local` values
- **API errors**: Verify backend is running on correct port
- **Styling issues**: Check Tailwind config and class names

### Development Tips

- Use React DevTools browser extension
- Use Next.js DevTools (bottom right)
- Check Sentry for production errors
- Use `npm run lint` to catch issues early

---

**Last Updated**: 2025-12-19  
**Maintained By**: Development Team  
**Version**: 1.0.0
