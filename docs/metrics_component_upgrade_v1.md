# Key Metrics Component Upgrade v1

## Status: In Progress
Last Updated: Jan 26, 2026

---

## Overview

Comprehensive upgrade to the Key Metrics component to transform it from "What are the numbers?" to "Are these numbers good or bad, and why should I care?"

---

## Current State Assessment

### What's Good ✅
- Clean card layout with good spacing
- Standard finance terms (no jargon abuse)
- Beta included
- Numbers are scannable

### What's Missing/Needs Improvement 🔴

1. **Time Context** - Users don't know if metrics are TTM, FY, or quarterly
2. **Sector Benchmarking** - No comparison to sector/index averages
3. **Growth Metrics** - Missing revenue growth, profit growth, EPS growth
4. **Metric Grouping** - Flat grid instead of meaningful categories
5. **Quality Tags** - No "Good/Neutral/Risky" indicators
6. **Definitions** - No hover tooltips explaining metrics
7. **User Preferences** - No customization options

---

## Database Columns Available (company_metrics_ttm)

### Valuation
- [x] market_cap, market_cap_mln
- [x] pe_ratio, trailing_pe, forward_pe, peg_ratio
- [x] price_sales_ttm, price_book_mrq
- [x] enterprise_value, ev_revenue, ev_ebitda

### Profitability
- [x] profit_margin, operating_margin_ttm
- [x] return_on_assets_ttm, return_on_equity_ttm
- [x] gross_profit_ttm, ebitda

### Per Share
- [x] earnings_share, diluted_eps_ttm
- [x] revenue_per_share_ttm, book_value

### Growth (Existing)
- [x] quarterly_revenue_growth_yoy
- [x] quarterly_earnings_growth_yoy

### Growth (Need to Calculate)
- [ ] TTM Revenue Growth YoY
- [ ] TTM EPS Growth YoY
- [ ] 3Y Revenue CAGR
- [ ] 3Y EPS CAGR

### Dividends
- [x] dividend_per_share, dividend_yield
- [x] forward_annual_dividend_rate, forward_annual_dividend_yield
- [x] payout_ratio, dividend_date, ex_dividend_date

### Risk/Technical
- [x] beta
- [x] week_52_high, week_52_low
- [x] day_50_ma, day_200_ma
- [x] short_percent_float, short_ratio

### Ownership
- [x] percent_insiders, percent_institutions
- [x] shares_outstanding, shares_float

### Analyst
- [x] analyst_rating, analyst_target_price
- [x] analyst_strong_buy, analyst_buy, analyst_hold, analyst_sell, analyst_strong_sell

---

## Implementation Plan

### Phase 1: Foundation ✅
- [x] Create tracking document
- [x] Analyze current frontend component
- [x] Analyze current backend endpoint
- [x] Create useMetricsPreferences hook

### Phase 2: Backend Updates ✅
- [x] Expand metrics returned by getCompanyDetails to include all available fields
- [x] Organized metrics by category (valuation, profitability, growth, dividends, risk, ownership)

### Phase 3: Frontend Redesign ✅
- [x] Create metric category groups (Valuation, Profitability, Growth, Dividends, Risk, Ownership)
- [x] Implement expand/collapse mode per category
- [x] Add metric definitions (hover tooltips)
- [x] Add "Strong/Normal/Weak" quality tags with rules
- [x] Add TTM indicator badges

### Phase 4: User Preferences ✅
- [x] Create localStorage-based preferences hook (useMetricsPreferences)
- [x] Add quick settings dropdown in KeyMetrics component
- [x] Add metrics preferences section to Settings page (/settings/metrics)
- [x] Implement preference options:
  - Visible metric categories (toggle per category)
  - Default expanded/collapsed state (per category)
  - Show/hide quality tags
  - Show advanced metrics toggle

---

## Metric Categories Structure

```
Valuation
├── Market Cap
├── P/E (TTM)
├── Forward P/E
├── PEG Ratio
├── P/S (TTM)
├── P/B
├── EV/Revenue
└── EV/EBITDA

Profitability
├── ROE (TTM)
├── ROA (TTM)
├── Net Margin
├── Operating Margin
└── Gross Margin (if available)

Growth
├── Revenue (TTM)
├── Revenue Growth (TTM YoY)
├── Revenue Growth (Quarterly YoY)
├── EPS (TTM)
├── EPS Growth (TTM YoY)
├── EPS Growth (Quarterly YoY)
└── Revenue CAGR 3Y (Pro)

Dividends
├── Dividend Yield
├── Forward Dividend Yield
├── Payout Ratio
└── Ex-Dividend Date

Risk & Volatility
├── Beta
├── 52W High/Low
├── Short Interest
└── Debt/Equity (if available)

Ownership & Analyst
├── Insider Ownership
├── Institutional Ownership
├── Analyst Rating
└── Price Target
```

---

## Quality Tag Rules (Rules-Based, Not Opinions)

### ROE
- Strong: > 15%
- Normal: 8-15%
- Weak: < 8%

### Net Margin
- Strong: > 15%
- Normal: 5-15%
- Weak: < 5%

### P/E Ratio (Context-Dependent)
- Expensive: > 35
- Normal: 15-35
- Cheap: < 15

### Beta
- High Risk: > 1.5
- Normal: 0.8-1.5
- Low Risk: < 0.8

### Debt/Equity
- Low Leverage: < 0.5
- Normal: 0.5-1.5
- High Leverage: > 1.5

---

## User Preferences Schema

```typescript
interface MetricsPreferences {
  // Display mode
  defaultView: 'compact' | 'expanded';
  showQualityTags: boolean;
  showDefinitionsOnHover: boolean;
  
  // Visible categories
  visibleCategories: {
    valuation: boolean;
    profitability: boolean;
    growth: boolean;
    dividends: boolean;
    risk: boolean;
    ownership: boolean;
  };
  
  // Category expansion state
  expandedCategories: {
    valuation: boolean;
    profitability: boolean;
    growth: boolean;
    dividends: boolean;
    risk: boolean;
    ownership: boolean;
  };
  
  // Tier access (for gating)
  showProMetrics: boolean;
}
```

---

## Files Modified/Created

### Frontend ✅
- [x] `components/company/KeyMetrics.tsx` - New component with grouped categories, expand/collapse, tooltips, quality tags
- [x] `hooks/useMetricsPreferences.ts` - New hook for localStorage-based preferences
- [x] `lib/metricDefinitions.ts` - New file with definitions, categories, and quality rules
- [x] `app/settings/metrics/page.tsx` - New metrics preferences page
- [x] `app/settings/layout.tsx` - Added Key Metrics nav item
- [x] `app/company/[ticker]/page.tsx` - Updated to use new KeyMetrics component

### Backend ✅
- [x] `src/screener/screener.service.ts` - Expanded getCompanyDetails to return all available metrics

---

## Progress Log

### Jan 26, 2026
- Created tracking document
- Analyzed frontend KeyMetrics component and company page structure
- Analyzed backend metrics endpoint and data structure
- Created useMetricsPreferences hook for localStorage-based preferences
- Created metricDefinitions.ts with 30+ metrics, definitions, and quality rules
- Updated backend to return all available metrics (growth, dividends, ownership, etc.)
- Redesigned KeyMetrics component with 6 collapsible categories
- Added metric definitions tooltips and Strong/Normal/Weak quality tags
- Added quick settings dropdown in KeyMetrics component
- Created new /settings/metrics page for full preferences management
- All phases complete!

