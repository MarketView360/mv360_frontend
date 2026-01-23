# Frontend Documentation Index

**Version**: 1.0.0  
**Last Updated**: 2025-12-19  
**Status**: Complete (5/5 modules + README)

---

## Documentation Structure

**🔥 NEW**: Use [CODE-DOCS-MAP.md](./CODE-DOCS-MAP.md) to find which documentation to update when changing code!

### Core Documentation

| Module                   | File                                         | Status      | Words  | Sections |
| ------------------------ | -------------------------------------------- | ----------- | ------ | -------- |
| **README**               | [README.md](./README.md)                     | ✅ Complete | ~3,500 | 13       |
| **01 - App Structure**   | [01-app-structure.md](./01-app-structure.md) | ✅ Complete | ~2,500 | 8        |
| **02 - Components**      | [02-components.md](./02-components.md)       | ✅ Complete | ~2,200 | 6        |
| **03 - Hooks**           | [03-hooks.md](./03-hooks.md)                 | ✅ Complete | ~2,100 | 5        |
| **04 - Library & Utils** | [04-library-utils.md](./04-library-utils.md) | ✅ Complete | ~2,400 | 5        |
| **05 - Features**        | [05-features.md](./05-features.md)           | ✅ Complete | ~2,800 | 6        |

**Total**: ~15,500 words across 6 files

---

## Quick Navigation

### For New Developers

**Getting Started**:

1. Start with [README.md](./README.md) for architecture overview
2. Understand routing in [01-app-structure.md](./01-app-structure.md)
3. Learn component structure in [02-components.md](./02-components.md)
4. Explore custom hooks in [03-hooks.md](./03-hooks.md)

**Building Features**:

1. Reference [04-library-utils.md](./04-library-utils.md) for API clients and utilities
2. Study [05-features.md](./05-features.md) for feature implementation patterns
3. Use [02-components.md](./02-components.md) to find reusable components

### For Specific Tasks

**Adding a new page**:

- See [01-app-structure.md](./01-app-structure.md) → "Route Examples"
- Use protected route patterns from [02-components.md](./02-components.md) → "Auth Components"

**Creating a new component**:

- Reference [02-components.md](./02-components.md) for component patterns
- Use existing components from "UI Components" section
- Check [04-library-utils.md](./04-library-utils.md) for utility functions

**Working with AI features**:

- Study [03-hooks.md](./03-hooks.md) → "AI/LLM Hooks"
- Review implementation in [05-features.md](./05-features.md) → "AI Chat (Jovan)"

**Stock screener queries**:

- Reference [04-library-utils.md](./04-library-utils.md) → "Query Builder"
- See examples in [05-features.md](./05-features.md) → "Stock Screener"

**API integration**:

- Reference [04-library-utils.md](./04-library-utils.md) → "API Clients"
- EODHD integration: [04-library-utils.md](./04-library-utils.md) → "External APIs"
- Supabase setup: [04-library-utils.md](./04-library-utils.md) → "Supabase Integration"

---

## Module Details

### README.md

**Purpose**: Main entry point with complete architecture overview

**Sections**:

1. Architecture Overview
2. Quick Start
3. Project Structure
4. Technology Stack (14 libraries)
5. Key Features (6 features)
6. Routing Map
7. State Management
8. Authentication Flow
9. Component Architecture
10. API Integration
11. Performance Optimizations
12. Deployment
13. Environment Variables

**Key Content**: Full app routing map, authentication flow diagram, component hierarchy

**Best For**: Understanding overall application structure and flow

---

### 01-app-structure.md

**Purpose**: Comprehensive routing and layout documentation

**Sections**:

1. Next.js App Router Overview
2. Layouts & Nesting
3. Route Protection
4. API Routes
5. Error Handling
6. Metadata & SEO
7. Middleware
8. Route Examples

**Key Content**:

- Complete directory tree of all routes
- Protected route patterns
- Layout composition hierarchy
- API route examples
- Dynamic and parallel routes

**Best For**: Understanding how to navigate, create, and protect routes

---

### 02-components.md

**Purpose**: Component API and usage documentation

**Sections**:

1. Layout Components (NavigationBar, Footer)
2. Navigation Components (NavSearch, UserDropdown)
3. Feature Components (Screener, Charts, Tables, etc.)
4. UI Components (Button, Card, Input, Dialog, etc.)
5. Auth Components (ProtectedRoute)
6. Shared Patterns (Loading, Error, Images)

**Key Content**:

- 15+ major components documented
- Props and usage examples
- Implementation patterns
- Reusable UI component library

**Best For**: Building UIs and understanding component APIs

---

### 03-hooks.md

**Purpose**: Custom React hooks documentation

**Sections**:

1. Authentication Hooks (useAuth)
2. AI/LLM Hooks (useAIModels, useAIPreferences, useQuota)
3. Network & Status Hooks (useNetworkStatus)
4. Voice Hooks (useVoiceInput, useTextToSpeech)
5. Custom Hook Patterns

**Key Content**:

- 6 custom hooks with full implementations
- Hook signatures and return types
- Usage examples for each hook
- Custom hook patterns (caching, persistence, debouncing)

**Best For**: Managing state and side effects, AI features, network handling

---

### 04-library-utils.md

**Purpose**: Utilities, helpers, and external API integration

**Sections**:

1. API Clients (Backend API)
2. Query Builder (80+ metrics)
3. Utilities & Helpers (Formatting, Dates, Validation)
4. Supabase Integration
5. External APIs (EODHD)

**Key Content**:

- Complete query builder documentation
- 80+ financial metrics mappings
- Utility functions with examples
- Supabase client setup and common queries
- EODHD real-time price integration

**Best For**: Data fetching, query building, utility functions, external API integration

---

### 05-features.md

**Purpose**: High-level feature implementation and usage

**Sections**:

1. Stock Screener (80+ metrics, query parsing, result display)
2. Company Analysis (financials, technicals, comparisons)
3. Market Overview (heatmap, indices, trending)
4. AI Chat (Jovan) (multi-model, quota, context)
5. User Management (auth, preferences, watchlist)
6. Responsive Design (mobile-first, breakpoints)

**Key Content**:

- Feature architectures and data flows
- Example implementations
- Supported queries and metrics
- Responsive design patterns
- Advanced usage examples

**Best For**: Understanding how features work end-to-end

---

## Architecture Overview

### Routing Hierarchy

```
/ (home)
├── /auth (authentication)
├── /market (market overview)
├── /company/[ticker] (company analysis)
├── /screens (stock screener)
├── /jovan-chat (AI chat)
├── /profile (user profile)
├── /news (financial news)
└── /settings (app settings)
```

### Component Hierarchy

```
RootLayout
├── ThemeProvider
├── AuthProvider
├── NavigationBar
├── [Children Routes]
├── AiChatWidget
└── Footer
```

### Data Flow

```
User Action
    ↓
React Component/Hook
    ↓
API Call (Backend or Supabase)
    ↓
State Update
    ↓
UI Re-render
    ↓
Display Result
```

---

## Technology Stack Summary

**Framework**: Next.js 14 (App Router)  
**Language**: TypeScript 5.9  
**Styling**: Tailwind CSS 4 + Radix UI  
**Charts**: Recharts 3.5  
**Auth**: Supabase Auth + JWT  
**Database**: Supabase PostgreSQL  
**AI**: Groq, ByteZ, OpenRouter  
**External Data**: EODHD API  
**Deployment**: Vercel

---

## Code Examples Reference

### Common Patterns

**Protected Route**:

```typescript
<ProtectedRoute>
  <Component />
</ProtectedRoute>
```

**API Call**:

```typescript
const data = await fetch("/api/endpoint", {
  method: "POST",
  body: JSON.stringify(payload),
}).then((r) => r.json());
```

**Hook Usage**:

```typescript
const { data, loading, error } = useCustomHook(dependency);
```

**Component Props**:

```typescript
interface ComponentProps {
  title: string;
  onClick?: () => void;
  className?: string;
}
```

---

## Performance Considerations

**Code Splitting**: Page-based and component-based splitting via Next.js  
**Image Optimization**: Next.js Image component with responsive sizes  
**CSS**: Tailwind with JIT compilation, minimal bundle size  
**Caching**: Client-side caching for API responses and user preferences  
**Lazy Loading**: Components loaded on-demand for routes

---

## Common Questions

**Q: How do I add a new route?**  
A: See [01-app-structure.md](./01-app-structure.md) → "Route Examples"

**Q: Where are the UI components?**  
A: See [02-components.md](./02-components.md) → "UI Components"

**Q: How do I fetch data from the backend?**  
A: See [04-library-utils.md](./04-library-utils.md) → "API Clients"

**Q: How do I add AI features?**  
A: See [03-hooks.md](./03-hooks.md) → "AI/LLM Hooks"

**Q: How does the stock screener work?**  
A: See [05-features.md](./05-features.md) → "Stock Screener"

---

## Contributing

When adding new code:

1. **New Route**: Document in [01-app-structure.md](./01-app-structure.md)
2. **New Component**: Document in [02-components.md](./02-components.md)
3. **New Hook**: Document in [03-hooks.md](./03-hooks.md)
4. **New Utility**: Document in [04-library-utils.md](./04-library-utils.md)
5. **New Feature**: Document in [05-features.md](./05-features.md)

---

**Total Documentation**: ~15,500 words  
**Files**: 6 markdown files  
**Code Examples**: 50+  
**Diagrams**: 3+

---

**Last Updated**: 2025-12-19  
**Version**: 1.0.0
