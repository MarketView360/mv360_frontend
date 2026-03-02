import type { MetricCategory } from "@/hooks/useMetricsPreferences";

export type QualityLevel = "strong" | "normal" | "weak" | "neutral";

export interface MetricDefinition {
  key: string;
  label: string;
  shortLabel?: string;
  category: MetricCategory;
  definition: string;
  format: "number" | "percent" | "currency" | "ratio" | "date" | "text";
  decimals?: number;
  suffix?: string;
  prefix?: string;
  isAdvanced?: boolean;
  isTTM?: boolean;
  qualityRules?: QualityRule[];
}

export interface QualityRule {
  condition: "gt" | "gte" | "lt" | "lte" | "between" | "eq";
  value: number | [number, number];
  level: QualityLevel;
  label: string;
}

export interface FormattedMetric {
  key: string;
  label: string;
  value: string;
  rawValue: number | string | null;
  category: MetricCategory;
  definition: string;
  quality?: {
    level: QualityLevel;
    label: string;
  };
  isTTM?: boolean;
  isAdvanced?: boolean;
}

// Quality evaluation function
export function evaluateQuality(
  value: number | null | undefined,
  rules?: QualityRule[]
): { level: QualityLevel; label: string } | undefined {
  if (value == null || !rules || rules.length === 0) return undefined;

  for (const rule of rules) {
    let matches = false;

    switch (rule.condition) {
      case "gt":
        matches = value > (rule.value as number);
        break;
      case "gte":
        matches = value >= (rule.value as number);
        break;
      case "lt":
        matches = value < (rule.value as number);
        break;
      case "lte":
        matches = value <= (rule.value as number);
        break;
      case "between":
        const [min, max] = rule.value as [number, number];
        matches = value >= min && value <= max;
        break;
      case "eq":
        matches = value === (rule.value as number);
        break;
    }

    if (matches) {
      return { level: rule.level, label: rule.label };
    }
  }

  return { level: "neutral", label: "Normal" };
}

// All metric definitions organized by category
export const METRIC_DEFINITIONS: MetricDefinition[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // VALUATION METRICS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    key: "market_cap",
    label: "Market Cap",
    category: "valuation",
    definition: "Total market value of a company's outstanding shares. Market Cap = Share Price × Shares Outstanding.",
    format: "currency",
  },
  {
    key: "pe_ratio",
    label: "P/E Ratio",
    shortLabel: "P/E",
    category: "valuation",
    definition: "Price-to-Earnings ratio. How much investors pay for each dollar of earnings. P/E = Price / EPS.",
    format: "ratio",
    decimals: 2,
    isTTM: true,
    qualityRules: [
      { condition: "lt", value: 15, level: "strong", label: "Cheap" },
      { condition: "between", value: [15, 25], level: "normal", label: "Fair" },
      { condition: "between", value: [25, 40], level: "weak", label: "Expensive" },
      { condition: "gt", value: 40, level: "weak", label: "Very Expensive" },
    ],
  },
  {
    key: "forward_pe",
    label: "Forward P/E",
    category: "valuation",
    definition: "Price-to-Earnings ratio based on estimated future earnings. Forward P/E = Price / Expected EPS.",
    format: "ratio",
    decimals: 2,
    qualityRules: [
      { condition: "lt", value: 15, level: "strong", label: "Cheap" },
      { condition: "between", value: [15, 25], level: "normal", label: "Fair" },
      { condition: "gt", value: 25, level: "weak", label: "Expensive" },
    ],
  },
  {
    key: "peg_ratio",
    label: "PEG Ratio",
    shortLabel: "PEG",
    category: "valuation",
    definition: "Price/Earnings to Growth ratio. Accounts for growth in valuation. PEG = P/E / Earnings Growth Rate.",
    format: "ratio",
    decimals: 2,
    isAdvanced: true,
    qualityRules: [
      { condition: "lt", value: 1, level: "strong", label: "Undervalued" },
      { condition: "between", value: [1, 2], level: "normal", label: "Fair" },
      { condition: "gt", value: 2, level: "weak", label: "Overvalued" },
    ],
  },
  {
    key: "price_to_sales",
    label: "P/S Ratio",
    shortLabel: "P/S",
    category: "valuation",
    definition: "Price-to-Sales ratio. Useful for unprofitable companies. P/S = Market Cap / Revenue.",
    format: "ratio",
    decimals: 2,
    isTTM: true,
  },
  {
    key: "price_to_book",
    label: "P/B Ratio",
    shortLabel: "P/B",
    category: "valuation",
    definition: "Price-to-Book ratio. Compares price to net asset value. P/B = Price / Book Value per Share.",
    format: "ratio",
    decimals: 2,
    qualityRules: [
      { condition: "lt", value: 1, level: "strong", label: "Below Book" },
      { condition: "between", value: [1, 3], level: "normal", label: "Fair" },
      { condition: "gt", value: 3, level: "neutral", label: "Premium" },
    ],
  },
  {
    key: "ev_ebitda",
    label: "EV/EBITDA",
    category: "valuation",
    definition: "Enterprise Value to EBITDA. Capital-structure neutral valuation. EV/EBITDA = Enterprise Value / EBITDA.",
    format: "ratio",
    decimals: 2,
    isAdvanced: true,
    qualityRules: [
      { condition: "lt", value: 10, level: "strong", label: "Cheap" },
      { condition: "between", value: [10, 15], level: "normal", label: "Fair" },
      { condition: "gt", value: 15, level: "weak", label: "Expensive" },
    ],
  },
  {
    key: "ev_revenue",
    label: "EV/Revenue",
    category: "valuation",
    definition: "Enterprise Value to Revenue ratio. Useful for high-growth companies. EV/Revenue = Enterprise Value / Revenue.",
    format: "ratio",
    decimals: 2,
    isAdvanced: true,
  },
  {
    key: "enterprise_value",
    label: "Enterprise Value",
    shortLabel: "EV",
    category: "valuation",
    definition: "Total company value including debt. EV = Market Cap + Total Debt - Cash.",
    format: "currency",
    isAdvanced: true,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PROFITABILITY METRICS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    key: "roe",
    label: "Return on Equity",
    shortLabel: "ROE",
    category: "profitability",
    definition: "Profit generated per ₹1 of shareholder equity. ROE = Net Income / Shareholders' Equity.",
    format: "percent",
    decimals: 2,
    isTTM: true,
    qualityRules: [
      { condition: "gte", value: 0.20, level: "strong", label: "Excellent" },
      { condition: "between", value: [0.15, 0.20], level: "strong", label: "Strong" },
      { condition: "between", value: [0.08, 0.15], level: "normal", label: "Average" },
      { condition: "lt", value: 0.08, level: "weak", label: "Weak" },
    ],
  },
  {
    key: "roa",
    label: "Return on Assets",
    shortLabel: "ROA",
    category: "profitability",
    definition: "How efficiently a company uses its assets to generate profit. ROA = Net Income / Total Assets.",
    format: "percent",
    decimals: 2,
    isTTM: true,
    qualityRules: [
      { condition: "gte", value: 0.10, level: "strong", label: "Excellent" },
      { condition: "between", value: [0.05, 0.10], level: "normal", label: "Average" },
      { condition: "lt", value: 0.05, level: "weak", label: "Weak" },
    ],
  },
  {
    key: "profit_margin",
    label: "Net Margin",
    category: "profitability",
    definition: "Percentage of revenue that becomes profit. Net Margin = Net Income / Revenue.",
    format: "percent",
    decimals: 2,
    isTTM: true,
    qualityRules: [
      { condition: "gte", value: 0.20, level: "strong", label: "Excellent" },
      { condition: "between", value: [0.10, 0.20], level: "strong", label: "Strong" },
      { condition: "between", value: [0.05, 0.10], level: "normal", label: "Average" },
      { condition: "lt", value: 0.05, level: "weak", label: "Thin" },
    ],
  },
  {
    key: "operating_margin",
    label: "Operating Margin",
    shortLabel: "Op. Margin",
    category: "profitability",
    definition: "Profit from core operations before interest and taxes. Op Margin = Operating Income / Revenue.",
    format: "percent",
    decimals: 2,
    isTTM: true,
    isAdvanced: true,
    qualityRules: [
      { condition: "gte", value: 0.20, level: "strong", label: "Strong" },
      { condition: "between", value: [0.10, 0.20], level: "normal", label: "Average" },
      { condition: "lt", value: 0.10, level: "weak", label: "Weak" },
    ],
  },
  {
    key: "gross_margin",
    label: "Gross Margin",
    category: "profitability",
    definition: "Revenue minus cost of goods sold, as a percentage. Gross Margin = (Revenue - COGS) / Revenue.",
    format: "percent",
    decimals: 2,
    isAdvanced: true,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GROWTH METRICS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    key: "revenue_ttm",
    label: "Revenue",
    category: "growth",
    definition: "Total revenue over the trailing twelve months (TTM).",
    format: "currency",
    isTTM: true,
  },
  {
    key: "eps_ttm",
    label: "EPS",
    category: "growth",
    definition: "Earnings Per Share over the trailing twelve months. EPS = Net Income / Shares Outstanding.",
    format: "number",
    decimals: 2,
    prefix: "$",
    isTTM: true,
  },
  {
    key: "revenue_growth_ttm_yoy",
    label: "Revenue Growth (TTM YoY)",
    shortLabel: "Rev Growth",
    category: "growth",
    definition: "Year-over-year revenue growth comparing current trailing 12 months to the same period one year ago.",
    format: "percent",
    decimals: 2,
    qualityRules: [
      { condition: "gte", value: 0.20, level: "strong", label: "High Growth" },
      { condition: "between", value: [0.05, 0.20], level: "normal", label: "Growing" },
      { condition: "between", value: [0, 0.05], level: "neutral", label: "Stable" },
      { condition: "lt", value: 0, level: "weak", label: "Declining" },
    ],
  },
  {
    key: "eps_growth_ttm_yoy",
    label: "EPS Growth (TTM YoY)",
    shortLabel: "EPS Growth",
    category: "growth",
    definition: "Year-over-year earnings per share growth comparing current trailing 12 months to the same period one year ago.",
    format: "percent",
    decimals: 2,
    qualityRules: [
      { condition: "gte", value: 0.20, level: "strong", label: "High Growth" },
      { condition: "between", value: [0.05, 0.20], level: "normal", label: "Growing" },
      { condition: "between", value: [0, 0.05], level: "neutral", label: "Stable" },
      { condition: "lt", value: 0, level: "weak", label: "Declining" },
    ],
  },
  {
    key: "revenue_cagr_3y",
    label: "Revenue CAGR (3Y)",
    category: "growth",
    definition: "3-year compound annual growth rate for revenue. Shows consistency of growth over time.",
    format: "percent",
    decimals: 2,
    isAdvanced: true,
    qualityRules: [
      { condition: "gte", value: 0.15, level: "strong", label: "Strong" },
      { condition: "between", value: [0.05, 0.15], level: "normal", label: "Steady" },
      { condition: "between", value: [0, 0.05], level: "neutral", label: "Slow" },
      { condition: "lt", value: 0, level: "weak", label: "Declining" },
    ],
  },
  {
    key: "eps_cagr_3y",
    label: "EPS CAGR (3Y)",
    category: "growth",
    definition: "3-year compound annual growth rate for earnings per share. More important than revenue CAGR for profitability assessment.",
    format: "percent",
    decimals: 2,
    isAdvanced: true,
    qualityRules: [
      { condition: "gte", value: 0.15, level: "strong", label: "Strong" },
      { condition: "between", value: [0.05, 0.15], level: "normal", label: "Steady" },
      { condition: "between", value: [0, 0.05], level: "neutral", label: "Slow" },
      { condition: "lt", value: 0, level: "weak", label: "Declining" },
    ],
  },
  {
    key: "quarterly_revenue_growth_yoy",
    label: "Revenue Growth (Quarterly YoY)",
    shortLabel: "Q Rev Growth",
    category: "growth",
    definition: "Revenue growth this quarter compared to the same quarter last year. More volatile than TTM YoY.",
    format: "percent",
    decimals: 2,
    isAdvanced: true,
    qualityRules: [
      { condition: "gte", value: 0.20, level: "strong", label: "High Growth" },
      { condition: "between", value: [0.05, 0.20], level: "normal", label: "Growing" },
      { condition: "between", value: [0, 0.05], level: "neutral", label: "Stable" },
      { condition: "lt", value: 0, level: "weak", label: "Declining" },
    ],
  },
  {
    key: "quarterly_earnings_growth_yoy",
    label: "EPS Growth (Quarterly YoY)",
    shortLabel: "Q EPS Growth",
    category: "growth",
    definition: "Earnings growth this quarter compared to the same quarter last year. More volatile than TTM YoY.",
    format: "percent",
    decimals: 2,
    isAdvanced: true,
    qualityRules: [
      { condition: "gte", value: 0.20, level: "strong", label: "High Growth" },
      { condition: "between", value: [0.05, 0.20], level: "normal", label: "Growing" },
      { condition: "between", value: [0, 0.05], level: "neutral", label: "Stable" },
      { condition: "lt", value: 0, level: "weak", label: "Declining" },
    ],
  },
  {
    key: "eps_estimate_current_year",
    label: "EPS Est. (Current Year)",
    category: "growth",
    definition: "Analyst consensus estimate for earnings per share this fiscal year.",
    format: "number",
    decimals: 2,
    prefix: "$",
    isAdvanced: true,
  },
  {
    key: "eps_estimate_next_year",
    label: "EPS Est. (Next Year)",
    category: "growth",
    definition: "Analyst consensus estimate for earnings per share next fiscal year.",
    format: "number",
    decimals: 2,
    prefix: "$",
    isAdvanced: true,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DIVIDEND METRICS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    key: "dividend_yield",
    label: "Dividend Yield",
    category: "dividends",
    definition: "Annual dividend as a percentage of stock price. Dividend Yield = Annual Dividend / Stock Price.",
    format: "percent",
    decimals: 2,
    qualityRules: [
      { condition: "gte", value: 0.05, level: "strong", label: "High Yield" },
      { condition: "between", value: [0.02, 0.05], level: "normal", label: "Moderate" },
      { condition: "between", value: [0, 0.02], level: "neutral", label: "Low" },
    ],
  },
  {
    key: "forward_dividend_yield",
    label: "Forward Dividend Yield",
    category: "dividends",
    definition: "Expected dividend yield based on forward annual dividend rate.",
    format: "percent",
    decimals: 2,
    isAdvanced: true,
  },
  {
    key: "payout_ratio",
    label: "Payout Ratio",
    category: "dividends",
    definition: "Percentage of earnings paid as dividends. Payout Ratio = Dividends / Net Income.",
    format: "percent",
    decimals: 2,
    qualityRules: [
      { condition: "between", value: [0.20, 0.60], level: "strong", label: "Sustainable" },
      { condition: "between", value: [0.60, 0.80], level: "normal", label: "High" },
      { condition: "gt", value: 0.80, level: "weak", label: "Risky" },
    ],
  },
  {
    key: "ex_dividend_date",
    label: "Ex-Dividend Date",
    category: "dividends",
    definition: "The date on which the stock begins trading without the dividend.",
    format: "date",
    isAdvanced: true,
  },
  {
    key: "dividend_policy",
    label: "Dividend Policy",
    category: "dividends",
    definition: "Classification of company's dividend payment behavior based on multiple signals including yield, payout ratio, and payment history.",
    format: "text",
    isAdvanced: false,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // RISK & VOLATILITY METRICS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    key: "beta",
    label: "Beta",
    category: "risk",
    definition: "Measure of stock volatility relative to the market. Beta > 1 means more volatile than market.",
    format: "number",
    decimals: 2,
    qualityRules: [
      { condition: "lt", value: 0.8, level: "strong", label: "Low Risk" },
      { condition: "between", value: [0.8, 1.2], level: "normal", label: "Market-like" },
      { condition: "between", value: [1.2, 1.5], level: "neutral", label: "Moderate Risk" },
      { condition: "gt", value: 1.5, level: "weak", label: "High Risk" },
    ],
  },
  {
    key: "price_volatility_1y",
    label: "Price Volatility (1Y)",
    category: "risk",
    definition:
      "Annualised standard deviation of daily returns over approximately the last 1 year (252 trading days).",
    format: "percent",
    decimals: 2,
    isAdvanced: true,
  },
  {
    key: "max_drawdown_1y",
    label: "Max Drawdown (1Y)",
    category: "risk",
    definition:
      "Largest peak-to-trough decline in price over approximately the last 1 year. Shows worst-case pain for a buy-and-hold investor.",
    format: "percent",
    decimals: 2,
    qualityRules: [
      { condition: "gte", value: -0.20, level: "strong", label: "Shallow" },
      { condition: "between", value: [-0.40, -0.20], level: "normal", label: "Moderate" },
      { condition: "lt", value: -0.40, level: "weak", label: "Deep" },
    ],
  },
  {
    key: "week_52_high",
    label: "52-Week High",
    category: "risk",
    definition: "Highest stock price in the past 52 weeks.",
    format: "currency",
  },
  {
    key: "week_52_low",
    label: "52-Week Low",
    category: "risk",
    definition: "Lowest stock price in the past 52 weeks.",
    format: "currency",
  },
  {
    key: "distance_from_52w_high",
    label: "% from 52W High",
    shortLabel: "To 52W High",
    category: "risk",
    definition:
      "Percentage distance from the 52-week high. Negative values mean the current price is below the 52-week high.",
    format: "percent",
    decimals: 2,
  },
  {
    key: "distance_from_52w_low",
    label: "% from 52W Low",
    shortLabel: "From 52W Low",
    category: "risk",
    definition:
      "Percentage distance from the 52-week low. Positive values mean the current price is above the 52-week low.",
    format: "percent",
    decimals: 2,
  },
  {
    key: "short_percent_float",
    label: "Short Interest",
    shortLabel: "Short %",
    category: "risk",
    definition: "Percentage of float shares sold short. High short interest may indicate bearish sentiment.",
    format: "percent",
    decimals: 2,
    isAdvanced: true,
    qualityRules: [
      { condition: "lt", value: 0.05, level: "strong", label: "Low" },
      { condition: "between", value: [0.05, 0.15], level: "normal", label: "Moderate" },
      { condition: "gt", value: 0.15, level: "weak", label: "High" },
    ],
  },
  {
    key: "debt_to_equity",
    label: "Debt/Equity",
    shortLabel: "D/E",
    category: "risk",
    definition: "Company's financial leverage. D/E = Total Debt / Shareholders' Equity.",
    format: "ratio",
    decimals: 2,
    qualityRules: [
      { condition: "lt", value: 0.5, level: "strong", label: "Low Leverage" },
      { condition: "between", value: [0.5, 1.5], level: "normal", label: "Moderate" },
      { condition: "gt", value: 1.5, level: "weak", label: "High Leverage" },
    ],
  },
  {
    key: "current_ratio",
    label: "Current Ratio",
    category: "risk",
    definition: "Ability to pay short-term obligations. Current Ratio = Current Assets / Current Liabilities.",
    format: "ratio",
    decimals: 2,
    isAdvanced: true,
    qualityRules: [
      { condition: "gte", value: 2, level: "strong", label: "Strong" },
      { condition: "between", value: [1, 2], level: "normal", label: "Adequate" },
      { condition: "lt", value: 1, level: "weak", label: "Weak" },
    ],
  },
  {
    key: "quick_ratio",
    label: "Quick Ratio",
    category: "risk",
    definition: "Like current ratio but excludes inventory. Quick Ratio = (Current Assets - Inventory) / Current Liabilities.",
    format: "ratio",
    decimals: 2,
    isAdvanced: true,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // OWNERSHIP & ANALYST METRICS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    key: "percent_insiders",
    label: "Insider Ownership",
    shortLabel: "Insiders",
    category: "ownership",
    definition: "Percentage of shares owned by company insiders (executives, directors).",
    format: "percent",
    decimals: 2,
    qualityRules: [
      { condition: "gte", value: 0.10, level: "strong", label: "High" },
      { condition: "between", value: [0.02, 0.10], level: "normal", label: "Moderate" },
      { condition: "lt", value: 0.02, level: "neutral", label: "Low" },
    ],
  },
  {
    key: "percent_institutions",
    label: "Institutional Ownership",
    shortLabel: "Institutions",
    category: "ownership",
    definition: "Percentage of shares owned by institutional investors (funds, pensions).",
    format: "percent",
    decimals: 2,
  },
  {
    key: "analyst_rating",
    label: "Analyst Rating (Avg)",
    category: "ownership",
    definition:
      "Average analyst rating on a 1–5 scale, where 1 = Strong Sell and 5 = Strong Buy. Calculated from all individual recommendations.",
    format: "number",
    decimals: 2,
    qualityRules: [
      { condition: "gte", value: 4, level: "strong", label: "Strong Buy" },
      { condition: "between", value: [3, 4], level: "normal", label: "Buy" },
      { condition: "between", value: [2, 3], level: "neutral", label: "Hold" },
      { condition: "lt", value: 2, level: "weak", label: "Sell" },
    ],
  },
  {
    key: "analyst_target_price",
    label: "Price Target",
    category: "ownership",
    definition: "Average analyst price target for the stock.",
    format: "currency",
  },
  {
    key: "shares_outstanding",
    label: "Shares Outstanding",
    category: "ownership",
    definition: "Total number of shares currently held by all shareholders.",
    format: "number",
    decimals: 0,
    isAdvanced: true,
  },
  {
    key: "shares_float",
    label: "Float",
    category: "ownership",
    definition: "Shares available for public trading (excludes restricted shares).",
    format: "number",
    decimals: 0,
    isAdvanced: true,
  },
];

// Helper to get metric definition by key
export function getMetricDefinition(key: string): MetricDefinition | undefined {
  return METRIC_DEFINITIONS.find((m) => m.key === key);
}

// Helper to get all metrics for a category
export function getMetricsByCategory(category: MetricCategory): MetricDefinition[] {
  return METRIC_DEFINITIONS.filter((m) => m.category === category);
}

// Category display info
export const CATEGORY_INFO: Record<MetricCategory, { label: string; icon: string; description: string }> = {
  valuation: {
    label: "Valuation",
    icon: "DollarSign",
    description: "How the market values this company relative to its fundamentals",
  },
  profitability: {
    label: "Profitability",
    icon: "TrendingUp",
    description: "How efficiently the company generates profit",
  },
  growth: {
    label: "Growth",
    icon: "BarChart3",
    description: "Revenue and earnings trajectory",
  },
  dividends: {
    label: "Dividends",
    icon: "Wallet",
    description: "Income returned to shareholders",
  },
  risk: {
    label: "Risk & Volatility",
    icon: "ShieldAlert",
    description: "Financial health and market risk indicators",
  },
  ownership: {
    label: "Ownership & Analyst",
    icon: "Users",
    description: "Who owns the stock and what analysts think",
  },
};

// Helper to normalize ownership percentages that may already be in percentage format
function normalizeOwnershipPercent(value: number, metricKey: string): number {
  // Ownership metrics that may come as percentages instead of decimals
  const ownershipKeys = ['percent_insiders', 'percent_institutions'];
  
  if (ownershipKeys.includes(metricKey) && value > 1) {
    // If value > 1 (e.g., 45.118), it's already a percentage, so convert to decimal
    // This handles the common bug where APIs return percentages but we expect decimals
    return value / 100;
  }
  
  return value;
}

// Format a metric value based on its definition
export function formatMetricValue(
  value: number | string | null | undefined,
  definition: MetricDefinition
): string {
  if (value == null || value === "") return "—";

  if (definition.format === "date") {
    if (typeof value === "string") {
      try {
        const date = new Date(value);
        return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
      } catch {
        return value;
      }
    }
    return String(value);
  }

  if (definition.format === "text") {
    return String(value);
  }

  let numValue = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(numValue)) return "—";

  // Normalize ownership percentages if needed
  numValue = normalizeOwnershipPercent(numValue, definition.key);

  const decimals = definition.decimals ?? 2;

  switch (definition.format) {
    case "currency":
      const abs = Math.abs(numValue);
      if (abs >= 1e12) return `$${(numValue / 1e12).toFixed(2)}T`;
      if (abs >= 1e9) return `$${(numValue / 1e9).toFixed(2)}B`;
      if (abs >= 1e6) return `$${(numValue / 1e6).toFixed(2)}M`;
      if (abs >= 1e3) return `$${(numValue / 1e3).toFixed(2)}K`;
      return `$${numValue.toFixed(decimals)}`;

    case "percent":
      // Assume value is already decimal (0.15 = 15%)
      const pct = numValue * 100;
      return `${pct.toFixed(decimals)}%`;

    case "ratio":
    case "number":
      const prefix = definition.prefix || "";
      const suffix = definition.suffix || "";
      return `${prefix}${numValue.toFixed(decimals)}${suffix}`;

    default:
      return String(numValue);
  }
}
