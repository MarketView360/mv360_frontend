/**
 * Screener API Types
 * Aligned with backend's advanced-query.service.ts and run-query.dto.ts
 */

// ═══════════════════════════════════════════════════════════════════════════════
// FILTER TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Supported comparison operators
 */
export type ComparisonOperator =
  | "="
  | "!="
  | ">"
  | "<"
  | ">="
  | "<="
  | "BETWEEN"
  | "IN"
  | "LIKE"
  | "ILIKE"
  | "IS NULL"
  | "IS NOT NULL";

/**
 * Supported logical operators
 */
export type LogicalOperator = "AND" | "OR" | "NOT";

/**
 * Supported arithmetic operators (for computed fields)
 */
export type ArithmeticOperator = "+" | "-" | "*" | "/";

/**
 * Single filter condition
 */
export interface FilterCondition {
  field: string;
  operator: ComparisonOperator;
  value?: string | number | boolean | null | (string | number)[];
  table?: string; // Optional: specify source table for cross-table queries
}

/**
 * Filter group with logical operators
 */
export interface FilterGroup {
  operator: LogicalOperator;
  conditions: (FilterCondition | FilterGroup)[];
}

/**
 * Computed field definition for calculated metrics
 */
export interface ComputedField {
  name: string;
  expression: string;
  alias?: string;
}

/**
 * Sort specification
 */
export interface SortSpec {
  field: string;
  direction: "ASC" | "DESC";
  nulls?: "FIRST" | "LAST";
}

// ═══════════════════════════════════════════════════════════════════════════════
// REQUEST TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Basic screener query request (compatible with existing endpoint)
 */
export interface ScreenerQueryRequest {
  query: string;
  sort?: string;
  limit?: number;
  offset?: number;
  exchange?: string;
}

/**
 * Advanced screener query request (for structured queries)
 */
export interface AdvancedQueryRequest {
  /** Natural language query string (parsed by backend) */
  query?: string;

  /** Structured filters (alternative to query string) */
  filters?: FilterGroup;

  /** Tables to include in query (default: company_metrics_ttm, companies) */
  tables?: string[];

  /** Fields to select (default: common fields) */
  selectFields?: string[];

  /** Computed fields to add */
  computedFields?: ComputedField[];

  /** Sorting specification */
  sortBy?: SortSpec[];

  /** Alternative: simple sort string (e.g., "market_cap.desc") */
  sort?: string;

  /** Pagination */
  limit?: number;
  offset?: number;

  /** Exchange filter (e.g., "us", "nasdaq", "nyse") */
  exchange?: string;

  /** Date range for time-series data */
  dateRange?: {
    start?: string;
    end?: string;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Screener result row
 * Includes fields from companies, company_metrics_ttm, and price_data tables
 */
export interface ScreenerRow {
  // Company Info (companies table)
  ticker?: string;
  code?: string; // alias for ticker
  name?: string;
  exchange?: string;
  sector?: string;
  industry?: string;
  country_name?: string;
  currency?: string;
  employees?: number;

  // Price Data (price_data table)
  adjusted_close?: number;
  close?: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;

  // Market Data (company_metrics_ttm table)
  market_cap?: number;
  market_capitalization?: number; // alias

  // Valuation Metrics
  pe_ratio?: number;
  forward_pe?: number;
  trailing_pe?: number;
  peg_ratio?: number;
  price_book_mrq?: number;
  price_sales_ttm?: number;
  enterprise_value?: number;
  ev_ebitda?: number;
  ev_revenue?: number;

  // Profitability Metrics
  return_on_equity_ttm?: number;
  return_on_assets_ttm?: number;
  profit_margin?: number;
  operating_margin_ttm?: number;

  // Earnings & Revenue
  earnings_share?: number;
  eps_ttm?: number; // alias
  diluted_eps_ttm?: number;
  revenue_ttm?: number;
  ebitda?: number;
  gross_profit?: number;
  quarterly_revenue_growth_yoy?: number;
  quarterly_earnings_growth_yoy?: number;

  // Dividends
  dividend_yield?: number;
  dividend_per_share?: number;

  payout_ratio?: number;
  revenue_per_share?: number;
  book_value_per_share?: number;

  // Financial Strength
  net_debt?: number;

  // Cash Flow
  free_cash_flow?: number;
  operating_cash_flow?: number;

  // Technical Indicators
  beta?: number;
  week_52_high?: number;
  week_52_low?: number;
  day_50_ma?: number;
  day_200_ma?: number;

  // Price Change
  change?: number;
  change_percent?: number;

  // Shares
  shares_outstanding?: number;
  shares_float?: number;

  // Analyst
  analyst_rating?: string;
  analyst_target_price?: number;

  // Index for dynamic access
  [key: string]: unknown;
}

/**
 * Screener API response
 */
export interface ScreenerResponse {
  success: boolean;
  data: ScreenerRow[];
  count?: number;
  total?: number;
  offset?: number;
  limit?: number;
  query?: string;
  source?: string;
  executionTime?: number;
  error?: string;
}

/**
 * Schema information response
 */
export interface TableSchemaResponse {
  tables: string[];
}

export interface ColumnSchemaResponse {
  table: string;
  columns: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Field alias mapping
 */
export interface FieldAlias {
  table: string;
  column: string;
}

/**
 * Query validation error
 */
export interface QueryError {
  code: string;
  message: string;
  position?: number;
  suggestion?: string;
}

/**
 * Query parsing result
 */
export interface ParsedQuery {
  filters: FilterGroup;
  errors: QueryError[];
  warnings: string[];
}
