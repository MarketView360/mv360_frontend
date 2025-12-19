# Code-Documentation Mapping & Traversal Guide

**Purpose**: Maps source code files to their documentation locations for easy reference and maintenance.  
**Usage**: When modifying code, consult this map to find and update relevant documentation.  
**Last Updated**: 2025-12-19

---

## Quick Reference

**Rule**: When you modify a file in the "Code Location" column, update the corresponding documentation file(s) listed in the "Documentation" column.

---

## App Structure & Routing

| Code Location          | Documentation                                                          | Description                       |
| ---------------------- | ---------------------------------------------------------------------- | --------------------------------- |
| `app/layout.tsx`       | [01-app-structure.md](./01-app-structure.md), [README.md](./README.md) | Root layout, metadata, providers  |
| `app/page.tsx`         | [01-app-structure.md](./01-app-structure.md)                           | Home page (redirects to /market)  |
| `app/providers.tsx`    | [01-app-structure.md](./01-app-structure.md), [README.md](./README.md) | Client-side providers wrapper     |
| `middleware.ts`        | [01-app-structure.md](./01-app-structure.md), [README.md](./README.md) | Auth middleware, route protection |
| `app/global-error.tsx` | [01-app-structure.md](./01-app-structure.md)                           | Global error boundary             |

**When to Update**: Layout changes, new global providers, middleware logic updates, error handling changes.

---

## Auth Routes

| Code Location                      | Documentation                                                                    | Description            |
| ---------------------------------- | -------------------------------------------------------------------------------- | ---------------------- |
| `app/auth/login/page.tsx`          | [01-app-structure.md](./01-app-structure.md), [05-features.md](./05-features.md) | Login page             |
| `app/auth/signup/page.tsx`         | [01-app-structure.md](./01-app-structure.md), [05-features.md](./05-features.md) | Signup page            |
| `app/auth/reset-password/page.tsx` | [01-app-structure.md](./01-app-structure.md), [05-features.md](./05-features.md) | Password reset         |
| `app/auth/callback/route.ts`       | [01-app-structure.md](./01-app-structure.md)                                     | OAuth callback handler |

**When to Update**: Auth flow changes, new OAuth providers, form validation updates.

---

## Market & Company Routes

| Code Location                   | Documentation                                                                    | Description                         |
| ------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------- |
| `app/market/page.tsx`           | [01-app-structure.md](./01-app-structure.md), [05-features.md](./05-features.md) | Market overview, indices, heatmap   |
| `app/company/[ticker]/page.tsx` | [01-app-structure.md](./01-app-structure.md), [05-features.md](./05-features.md) | Company detail page (dynamic route) |
| `app/news/page.tsx`             | [01-app-structure.md](./01-app-structure.md), [05-features.md](./05-features.md) | Market news feed                    |

**When to Update**: New market features, company data displays, news integration changes.

---

## Jovan Chat Routes

| Code Location               | Documentation                                                                    | Description         |
| --------------------------- | -------------------------------------------------------------------------------- | ------------------- |
| `app/jovan-chat/page.tsx`   | [01-app-structure.md](./01-app-structure.md), [05-features.md](./05-features.md) | AI chat interface   |
| `app/jovan-chat/layout.tsx` | [01-app-structure.md](./01-app-structure.md)                                     | Chat layout wrapper |

**When to Update**: Chat UI changes, new chat features, model selection updates.

---

## Screener Routes

| Code Location               | Documentation                                                                    | Description                   |
| --------------------------- | -------------------------------------------------------------------------------- | ----------------------------- |
| `app/screens/page.tsx`      | [01-app-structure.md](./01-app-structure.md), [05-features.md](./05-features.md) | Stock screener interface      |
| `app/screens/[id]/page.tsx` | [01-app-structure.md](./01-app-structure.md), [05-features.md](./05-features.md) | Saved screen detail (dynamic) |

**When to Update**: Screener query builder changes, new metrics, result display updates.

---

## User Profile & Settings Routes

| Code Location           | Documentation                                                                    | Description                      |
| ----------------------- | -------------------------------------------------------------------------------- | -------------------------------- |
| `app/profile/page.tsx`  | [01-app-structure.md](./01-app-structure.md), [05-features.md](./05-features.md) | User profile page                |
| `app/settings/page.tsx` | [01-app-structure.md](./01-app-structure.md), [05-features.md](./05-features.md) | User settings, preferences, BYOK |

**When to Update**: New settings options, profile fields, preference toggles.

---

## API Routes

| Code Location                         | Documentation                                | Description                          |
| ------------------------------------- | -------------------------------------------- | ------------------------------------ |
| `app/api/auth/[...nextauth]/route.ts` | [01-app-structure.md](./01-app-structure.md) | NextAuth handler (if using NextAuth) |
| `app/api/user-preferences/route.ts`   | [01-app-structure.md](./01-app-structure.md) | User preferences API                 |
| `app/api/eodhd/route.ts`              | [01-app-structure.md](./01-app-structure.md) | EODHD proxy endpoint                 |

**When to Update**: New API endpoints, request/response changes, proxy logic updates.

---

## Layout Components

| Code Location                  | Documentation                                                    | Description                             |
| ------------------------------ | ---------------------------------------------------------------- | --------------------------------------- |
| `components/NavigationBar.tsx` | [02-components.md](./02-components.md), [README.md](./README.md) | Top navigation with search, theme, auth |
| `components/Footer.tsx`        | [02-components.md](./02-components.md)                           | Footer with links and copyright         |
| `components/NavSearch.tsx`     | [02-components.md](./02-components.md)                           | Ticker search in navigation             |

**When to Update**: Navigation structure changes, new nav items, search behavior updates.

---

## Feature Components

| Code Location                         | Documentation                                                              | Description                      |
| ------------------------------------- | -------------------------------------------------------------------------- | -------------------------------- |
| `components/AiChatWidget.tsx`         | [02-components.md](./02-components.md), [05-features.md](./05-features.md) | AI chat interface widget         |
| `components/ScreenerQueryBuilder.tsx` | [02-components.md](./02-components.md), [05-features.md](./05-features.md) | Query builder for stock screener |
| `components/MarketHeatmap.tsx`        | [02-components.md](./02-components.md), [05-features.md](./05-features.md) | Market heatmap visualization     |
| `components/MarketOverview.tsx`       | [02-components.md](./02-components.md), [05-features.md](./05-features.md) | Market indices overview          |
| `components/PriceChart.tsx`           | [02-components.md](./02-components.md), [05-features.md](./05-features.md) | Stock price chart                |
| `components/FinancialTable.tsx`       | [02-components.md](./02-components.md), [05-features.md](./05-features.md) | Financial data tables            |
| `components/StrategyLibrary.tsx`      | [02-components.md](./02-components.md), [05-features.md](./05-features.md) | Saved strategies/screens         |
| `components/RatioCube.tsx`            | [02-components.md](./02-components.md)                                     | Financial ratios visualization   |

**When to Update**: Component functionality changes, new features, UI redesigns.

---

## Company Components

| Code Location                              | Documentation                                                              | Description                  |
| ------------------------------------------ | -------------------------------------------------------------------------- | ---------------------------- |
| `components/company/CompanyHeader.tsx`     | [02-components.md](./02-components.md), [05-features.md](./05-features.md) | Company page header          |
| `components/company/CompanyProfile.tsx`    | [02-components.md](./02-components.md)                                     | Company profile info         |
| `components/company/CompanyFinancials.tsx` | [02-components.md](./02-components.md)                                     | Financial statements display |
| `components/company/CompanyNews.tsx`       | [02-components.md](./02-components.md)                                     | Company-specific news        |

**When to Update**: Company data display changes, new sections, data source updates.

---

## Auth Components

| Code Location                        | Documentation                                                    | Description                  |
| ------------------------------------ | ---------------------------------------------------------------- | ---------------------------- |
| `components/auth/ProtectedRoute.tsx` | [02-components.md](./02-components.md), [README.md](./README.md) | Client-side route protection |
| `components/auth/LoginForm.tsx`      | [02-components.md](./02-components.md)                           | Login form component         |
| `components/auth/SignupForm.tsx`     | [02-components.md](./02-components.md)                           | Signup form component        |

**When to Update**: Auth logic changes, form validation updates, OAuth flow changes.

---

## Jovan Chat Components

| Code Location                             | Documentation                                                              | Description                      |
| ----------------------------------------- | -------------------------------------------------------------------------- | -------------------------------- |
| `components/jovan/JovanChatInterface.tsx` | [02-components.md](./02-components.md), [05-features.md](./05-features.md) | Main chat interface              |
| `components/jovan/JovanMessage.tsx`       | [02-components.md](./02-components.md)                                     | Message bubble component         |
| `components/jovan/JovanInput.tsx`         | [02-components.md](./02-components.md)                                     | Chat input with voice/attachment |
| `components/jovan/JovanSidebar.tsx`       | [02-components.md](./02-components.md)                                     | Chat sessions sidebar            |
| `components/jovan/ModelSelector.tsx`      | [02-components.md](./02-components.md)                                     | AI model selection dropdown      |

**When to Update**: Chat UI changes, new message types, model selection updates, voice/attachment features.

---

## UI Components (shadcn/ui)

| Code Location              | Documentation                          | Description               |
| -------------------------- | -------------------------------------- | ------------------------- |
| `components/ui/button.tsx` | [02-components.md](./02-components.md) | Button component          |
| `components/ui/card.tsx`   | [02-components.md](./02-components.md) | Card component            |
| `components/ui/input.tsx`  | [02-components.md](./02-components.md) | Input component           |
| `components/ui/dialog.tsx` | [02-components.md](./02-components.md) | Dialog/modal component    |
| `components/ui/select.tsx` | [02-components.md](./02-components.md) | Select dropdown component |
| `components/ui/tabs.tsx`   | [02-components.md](./02-components.md) | Tabs component            |
| `components/ui/*.tsx`      | [02-components.md](./02-components.md) | All other UI primitives   |

**When to Update**: UI library updates, new components added, design system changes.

---

## Custom Hooks

### AI/LLM Hooks

| Code Location               | Documentation                                                    | Description                   |
| --------------------------- | ---------------------------------------------------------------- | ----------------------------- |
| `hooks/useAIModels.ts`      | [03-hooks.md](./03-hooks.md), [05-features.md](./05-features.md) | Fetch available AI models     |
| `hooks/useAIPreferences.ts` | [03-hooks.md](./03-hooks.md), [05-features.md](./05-features.md) | Get/update AI preferences     |
| `hooks/useQuota.ts`         | [03-hooks.md](./03-hooks.md), [05-features.md](./05-features.md) | Check quota status            |
| `hooks/useVoiceInput.ts`    | [03-hooks.md](./03-hooks.md), [05-features.md](./05-features.md) | Voice recording/transcription |
| `hooks/useTextToSpeech.ts`  | [03-hooks.md](./03-hooks.md), [05-features.md](./05-features.md) | Text-to-speech playback       |

**When to Update**: New AI features, quota logic changes, voice/TTS updates.

---

### Network & State Hooks

| Code Location               | Documentation                | Description                  |
| --------------------------- | ---------------------------- | ---------------------------- |
| `hooks/useNetworkStatus.ts` | [03-hooks.md](./03-hooks.md) | Monitor network connectivity |

**When to Update**: Network detection logic changes, new states.

---

## Library & API Clients

| Code Location         | Documentation                                                                    | Description                         |
| --------------------- | -------------------------------------------------------------------------------- | ----------------------------------- |
| `lib/eodhd.ts`        | [04-library-utils.md](./04-library-utils.md), [README.md](./README.md)           | EODHD API client and types          |
| `lib/queryBuilder.ts` | [04-library-utils.md](./04-library-utils.md), [05-features.md](./05-features.md) | Stock screener query builder        |
| `lib/utils.ts`        | [04-library-utils.md](./04-library-utils.md)                                     | Shared utility functions (cn, etc.) |

**When to Update**: API changes, new utility functions, query syntax updates.

---

## Supabase Integration

| Code Location                | Documentation                                                          | Description                 |
| ---------------------------- | ---------------------------------------------------------------------- | --------------------------- |
| `lib/supabase/client.ts`     | [04-library-utils.md](./04-library-utils.md), [README.md](./README.md) | Browser Supabase client     |
| `lib/supabase/server.ts`     | [04-library-utils.md](./04-library-utils.md)                           | Server-side Supabase client |
| `lib/supabase/middleware.ts` | [04-library-utils.md](./04-library-utils.md)                           | Middleware helper           |

**When to Update**: Supabase client config changes, auth updates, RLS policy changes.

---

## Providers

| Code Location                | Documentation                                                          | Description                     |
| ---------------------------- | ---------------------------------------------------------------------- | ------------------------------- |
| `providers/AuthProvider.tsx` | [README.md](./README.md), [01-app-structure.md](./01-app-structure.md) | Authentication context provider |

**When to Update**: Auth state management changes, new auth-related context.

---

## Configuration Files

| Code Location        | Documentation                                                          | Description                |
| -------------------- | ---------------------------------------------------------------------- | -------------------------- |
| `next.config.mjs`    | [README.md](./README.md), [01-app-structure.md](./01-app-structure.md) | Next.js configuration      |
| `tailwind.config.ts` | [README.md](./README.md)                                               | Tailwind CSS configuration |
| `tsconfig.json`      | [README.md](./README.md)                                               | TypeScript configuration   |
| `middleware.ts`      | [01-app-structure.md](./01-app-structure.md)                           | Middleware configuration   |

**When to Update**: Build config changes, styling updates, TS settings, middleware logic.

---

## Feature Documentation

| Feature                     | Code Locations                                                                                                | Documentation                      |
| --------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| **AI Chat (Jovan)**         | `app/jovan-chat/*`, `components/jovan/*`, `hooks/useAI*.ts`, `hooks/useVoice*.ts`, `hooks/useTextToSpeech.ts` | [05-features.md](./05-features.md) |
| **Stock Screener**          | `app/screens/*`, `components/ScreenerQueryBuilder.tsx`, `lib/queryBuilder.ts`                                 | [05-features.md](./05-features.md) |
| **Market Overview**         | `app/market/*`, `components/MarketHeatmap.tsx`, `components/MarketOverview.tsx`                               | [05-features.md](./05-features.md) |
| **Company Analysis**        | `app/company/[ticker]/*`, `components/company/*`, `components/PriceChart.tsx`                                 | [05-features.md](./05-features.md) |
| **User Profile & Settings** | `app/profile/*`, `app/settings/*`, `hooks/useAIPreferences.ts`                                                | [05-features.md](./05-features.md) |
| **News Feed**               | `app/news/*`, `components/company/CompanyNews.tsx`                                                            | [05-features.md](./05-features.md) |

**When to Update**: Feature changes, new functionality, user flow updates.

---

## Documentation Update Workflow

### When Modifying Code

1. **Identify** which files you're changing (use this map)
2. **Review** the corresponding documentation file(s)
3. **Make code changes**
4. **Update documentation** immediately:
   - Add new components/hooks to relevant docs
   - Update examples if behavior changed
   - Modify feature descriptions if UX changed
   - Update API integration notes
   - Adjust configuration if env vars changed
5. **Update this map** if new files/features are added
6. **Update DOCUMENTATION-STATUS.md** with timestamp

### For New Components/Features

1. Create component/feature code
2. Update corresponding documentation section
3. Add entry to this map
4. Update [INDEX.md](./INDEX.md) if major feature
5. Update [DOCUMENTATION-STATUS.md](./DOCUMENTATION-STATUS.md)
6. Update [README.md](./README.md) if it affects architecture

---

## Cross-References

### Multi-Component Features

Some features use multiple components/hooks. Update all relevant docs:

**AI Chat Feature**:

- Code: `app/jovan-chat/*`, `components/jovan/*`, `hooks/useAI*.ts`, `hooks/useVoice*.ts`
- Docs: [05-features.md](./05-features.md), [03-hooks.md](./03-hooks.md), [02-components.md](./02-components.md)

**Stock Screener**:

- Code: `app/screens/*`, `components/ScreenerQueryBuilder.tsx`, `lib/queryBuilder.ts`
- Docs: [05-features.md](./05-features.md), [04-library-utils.md](./04-library-utils.md), [02-components.md](./02-components.md)

**Authentication Flow**:

- Code: `app/auth/*`, `components/auth/*`, `middleware.ts`, `providers/AuthProvider.tsx`
- Docs: [01-app-structure.md](./01-app-structure.md), [02-components.md](./02-components.md), [README.md](./README.md)

**Company Details**:

- Code: `app/company/*`, `components/company/*`, `components/PriceChart.tsx`, `lib/eodhd.ts`
- Docs: [05-features.md](./05-features.md), [04-library-utils.md](./04-library-utils.md), [02-components.md](./02-components.md)

---

## Automated Checks

Before committing code changes, verify:

- [ ] All modified code files have corresponding doc updates
- [ ] New components added to [02-components.md](./02-components.md)
- [ ] New hooks added to [03-hooks.md](./03-hooks.md)
- [ ] New utilities/APIs added to [04-library-utils.md](./04-library-utils.md)
- [ ] New features added to [05-features.md](./05-features.md)
- [ ] New routes added to [01-app-structure.md](./01-app-structure.md)
- [ ] Code examples in docs still work
- [ ] Props/types documented if changed
- [ ] Dependencies updated in README if added

---

## AI Assistant Instructions

When you modify code in this repository:

1. **Before coding**: Check this map to locate relevant documentation
2. **While coding**: Note which docs will need updates
3. **After coding**: Update all affected documentation files
4. **Finally**: Update this map if you added new files/features

**Example workflow**:

```
1. User asks to add voice input to chat
2. Check map → affects hooks/useVoiceInput.ts, components/jovan/JovanInput.tsx
3. Map shows: update 03-hooks.md, 02-components.md, 05-features.md
4. Make code changes
5. Update 03-hooks.md (add/update useVoiceInput section)
6. Update 02-components.md (update JovanInput documentation)
7. Update 05-features.md (add voice feature to AI Chat section)
8. Confirm changes, commit
```

---

**Last Updated**: 2025-12-19  
**Maintainer**: Auto-updated by AI assistant during code changes
