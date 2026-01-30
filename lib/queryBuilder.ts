// Query Builder Utilities and Types
// Aligned with backend's advanced-query.service.ts for consistency

export interface QuerySuggestion {
  text: string;
  type: "field" | "operator" | "value" | "function";
  description?: string;
  category?: string;
  insertText?: string;
  score?: number;
  tier?: "free" | "pro";
}

export interface QueryValidationError {
  line: number;
  column: number;
  message: string;
  severity: "error" | "warning" | "info";
}

// Complete comprehensive field list for stock screening
export interface FieldDef {
  name: string;
  description: string;
  unit: string;
  keywords: string[];
  example?: string;
  category?: string;
  backendField?: string; // Maps to backend database column
  tier?: "free" | "pro"; // Access tier for gating fields
}

// ═══════════════════════════════════════════════════════════════════════════════
// AVAILABLE TABLES - Mirrors backend's AVAILABLE_TABLES
// These are the database tables available for advanced screening queries
// ═══════════════════════════════════════════════════════════════════════════════
export const AVAILABLE_TABLES = [
  "companies",
  "company_metrics_ttm",
  "price_data",
  "analyst_ratings",
  "balance_sheet_annual",
  "balance_sheet_quarterly",
  "cash_flow_annual",
  "cash_flow_quarterly",
  "income_statement_annual",
  "income_statement_quarterly",
  "earnings_annual",
  "earnings_estimates",
  "earnings_history",
  "dividend_history",
  "esg_scores",
  "fund_holders",
  "insider_transactions",
  "institutional_holders",
  "news",
  "index_components",
  "index_registry",
  "outstanding_shares_history_annual",
  "outstanding_shares_history_quarterly",
  "company_financials_view",
] as const;

export type AvailableTable = (typeof AVAILABLE_TABLES)[number];

// ═══════════════════════════════════════════════════════════════════════════════
// BACKEND FIELD MAP - Mirrors backend's FIELD_ALIASES
// Maps user-friendly names to { table, column } for advanced queries
// ═══════════════════════════════════════════════════════════════════════════════
export interface FieldMapping {
  table: string;
  column: string;
}

export const FIELD_ALIASES: Record<string, FieldMapping> = {
  // Company fields (companies table)
  ticker: { table: "companies", column: "ticker" },
  symbol: { table: "companies", column: "ticker" },
  code: { table: "companies", column: "ticker" },
  name: { table: "companies", column: "name" },
  sector: { table: "companies", column: "sector" },
  industry: { table: "companies", column: "industry" },
  exchange: { table: "companies", column: "exchange" },
  country: { table: "companies", column: "country_name" },
  employees: { table: "companies", column: "employees" },

  // Valuation metrics (company_metrics_ttm table)
  market_cap: { table: "company_metrics_ttm", column: "market_cap" },
  market_capitalization: { table: "company_metrics_ttm", column: "market_cap" },
  pe_ratio: { table: "company_metrics_ttm", column: "pe_ratio" },
  pe: { table: "company_metrics_ttm", column: "pe_ratio" },
  forward_pe: { table: "company_metrics_ttm", column: "forward_pe" },
  trailing_pe: { table: "company_metrics_ttm", column: "trailing_pe" },
  peg_ratio: { table: "company_metrics_ttm", column: "peg_ratio" },
  peg: { table: "company_metrics_ttm", column: "peg_ratio" },
  pb_ratio: { table: "company_metrics_ttm", column: "price_book_mrq" },
  price_to_book: { table: "company_metrics_ttm", column: "price_book_mrq" },
  pb: { table: "company_metrics_ttm", column: "price_book_mrq" },
  ps_ratio: { table: "company_metrics_ttm", column: "price_sales_ttm" },
  price_to_sales: { table: "company_metrics_ttm", column: "price_sales_ttm" },
  enterprise_value: {
    table: "company_metrics_ttm",
    column: "enterprise_value",
  },
  ev: { table: "company_metrics_ttm", column: "enterprise_value" },
  ev_ebitda: { table: "company_metrics_ttm", column: "ev_ebitda" },
  ev_revenue: { table: "company_metrics_ttm", column: "ev_revenue" },

  // Profitability (company_metrics_ttm table)
  profit_margin: { table: "company_metrics_ttm", column: "profit_margin" },
  operating_margin: {
    table: "company_metrics_ttm",
    column: "operating_margin_ttm",
  },
  roe: { table: "company_metrics_ttm", column: "return_on_equity_ttm" },
  return_on_equity: {
    table: "company_metrics_ttm",
    column: "return_on_equity_ttm",
  },
  roa: { table: "company_metrics_ttm", column: "return_on_assets_ttm" },
  return_on_assets: {
    table: "company_metrics_ttm",
    column: "return_on_assets_ttm",
  },

  // Dividends (company_metrics_ttm table)
  dividend_yield: { table: "company_metrics_ttm", column: "dividend_yield" },
  dividend_per_share: {
    table: "company_metrics_ttm",
    column: "dividend_per_share",
  },
  forward_dividend_yield: {
    table: "company_metrics_ttm",
    column: "forward_annual_dividend_yield",
  },
  forward_annual_dividend_yield: {
    table: "company_metrics_ttm",
    column: "forward_annual_dividend_yield",
  },
  payout_ratio: { table: "company_metrics_ttm", column: "payout_ratio" },

  // Earnings (company_metrics_ttm table)
  eps: { table: "company_metrics_ttm", column: "earnings_share" },
  earnings_per_share: {
    table: "company_metrics_ttm",
    column: "earnings_share",
  },
  diluted_eps: { table: "company_metrics_ttm", column: "diluted_eps_ttm" },
  revenue: { table: "company_metrics_ttm", column: "revenue_ttm" },
  revenue_ttm: { table: "company_metrics_ttm", column: "revenue_ttm" },
  ebitda: { table: "company_metrics_ttm", column: "ebitda" },

  // Technical (company_metrics_ttm table)
  beta: { table: "company_metrics_ttm", column: "beta" },
  week_52_high: { table: "company_metrics_ttm", column: "week_52_high" },
  week_52_low: { table: "company_metrics_ttm", column: "week_52_low" },
  day_50_ma: { table: "company_metrics_ttm", column: "day_50_ma" },
  sma50: { table: "company_metrics_ttm", column: "day_50_ma" },
  ma50: { table: "company_metrics_ttm", column: "day_50_ma" },
  day_200_ma: { table: "company_metrics_ttm", column: "day_200_ma" },
  sma200: { table: "company_metrics_ttm", column: "day_200_ma" },
  ma200: { table: "company_metrics_ttm", column: "day_200_ma" },

  // Shares (company_metrics_ttm table)
  shares_outstanding: {
    table: "company_metrics_ttm",
    column: "shares_outstanding",
  },
  shares_float: { table: "company_metrics_ttm", column: "shares_float" },

  // Analyst (company_metrics_ttm table)
  analyst_rating: { table: "company_metrics_ttm", column: "analyst_rating" },
  target_price: {
    table: "company_metrics_ttm",
    column: "analyst_target_price",
  },

  // Price data (price_data table)
  price: { table: "price_data", column: "adjusted_close" },
  adjusted_close: { table: "price_data", column: "adjusted_close" },
  close: { table: "price_data", column: "close" },
  open: { table: "price_data", column: "open" },
  high: { table: "price_data", column: "high" },
  low: { table: "price_data", column: "low" },
  volume: { table: "price_data", column: "volume" },
  change: { table: "price_data", column: "change" },
  change_percent: { table: "price_data", column: "change_percent" },

  // Balance sheet (balance_sheet_annual/quarterly tables)
  total_assets: { table: "balance_sheet_annual", column: "total_assets" },
  total_current_assets: {
    table: "balance_sheet_annual",
    column: "total_current_assets",
  },
  cash_and_equivalents: {
    table: "balance_sheet_annual",
    column: "cash_and_equivalents",
  },
  cash: { table: "balance_sheet_annual", column: "cash_and_equivalents" },
  net_receivables: {
    table: "balance_sheet_annual",
    column: "net_receivables",
  },
  inventory: { table: "balance_sheet_annual", column: "inventory" },
  total_liabilities: {
    table: "balance_sheet_annual",
    column: "total_liabilities",
  },
  total_current_liabilities: {
    table: "balance_sheet_annual",
    column: "total_current_liabilities",
  },
  long_term_debt: { table: "balance_sheet_annual", column: "long_term_debt" },
  short_term_debt: {
    table: "balance_sheet_annual",
    column: "short_term_debt",
  },
  total_stockholder_equity: {
    table: "balance_sheet_annual",
    column: "total_stockholder_equity",
  },
  retained_earnings: {
    table: "balance_sheet_annual",
    column: "retained_earnings",
  },
  net_debt: { table: "balance_sheet_annual", column: "net_debt" },
  net_working_capital: {
    table: "balance_sheet_annual",
    column: "net_working_capital",
  },

  // Income statement (income_statement_annual/quarterly tables)
  total_revenue: {
    table: "income_statement_annual",
    column: "total_revenue",
  },
  cost_of_revenue: {
    table: "income_statement_annual",
    column: "cost_of_revenue",
  },
  gross_profit: { table: "income_statement_annual", column: "gross_profit" },
  operating_income: {
    table: "income_statement_annual",
    column: "operating_income",
  },
  ebit: { table: "income_statement_annual", column: "ebit" },
  net_income: { table: "income_statement_annual", column: "net_income" },
  interest_expense: {
    table: "income_statement_annual",
    column: "interest_expense",
  },
  income_tax_expense: {
    table: "income_statement_annual",
    column: "income_tax_expense",
  },
  research_development: {
    table: "income_statement_annual",
    column: "research_development",
  },

  // Cash flow (cash_flow_annual/quarterly tables)
  total_cash_from_operating_activities: {
    table: "cash_flow_annual",
    column: "total_cash_from_operating_activities",
  },
  operating_cash_flow: {
    table: "cash_flow_annual",
    column: "total_cash_from_operating_activities",
  },
  ocf: {
    table: "cash_flow_annual",
    column: "total_cash_from_operating_activities",
  },
  capital_expenditures: {
    table: "cash_flow_annual",
    column: "capital_expenditures",
  },
  capex: { table: "cash_flow_annual", column: "capital_expenditures" },
  free_cash_flow: { table: "cash_flow_annual", column: "free_cash_flow" },
  fcf: { table: "cash_flow_annual", column: "free_cash_flow" },
  dividends_paid: { table: "cash_flow_annual", column: "dividends_paid" },
  net_borrowings: { table: "cash_flow_annual", column: "net_borrowings" },
  change_in_cash: { table: "cash_flow_annual", column: "change_in_cash" },
};

// Simple string mapping for backward compatibility with existing code
// Maps frontend display names (short forms) to actual database column names (exact backend names)
// ONLY includes fields that exist in the backend according to SCREENER.md
export const BACKEND_FIELD_MAP: Record<string, string> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // COMPANIES TABLE
  // ═══════════════════════════════════════════════════════════════════════════
  ticker: "ticker",
  symbol: "ticker",
  code: "ticker",
  name: "name",
  "company name": "name",
  sector: "sector",
  industry: "industry",
  "gic sector": "gic_sector",
  "gic industry": "gic_industry",
  "country iso": "country_iso",
  "country name": "country_name",
  country: "country_name",
  "currency code": "currency_code",
  currency: "currency_code",
  employees: "employees",
  "full time employees": "employees",
  "ipo date": "ipo_date",
  "is active": "is_active",
  website: "website",
  description: "description",

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPANY_METRICS_TTM TABLE
  // ═══════════════════════════════════════════════════════════════════════════
  "market capitalization": "market_cap",
  "market cap": "market_cap",
  market_cap: "market_cap",
  marketcap: "market_cap",
  mcap: "market_cap",
  "enterprise value": "enterprise_value",
  enterprise_value: "enterprise_value",
  ev: "enterprise_value",

  // Valuation Metrics (company_metrics_ttm)
  pe: "pe_ratio",
  "pe ratio": "pe_ratio",
  "price to earning": "pe_ratio",
  "price to earnings": "pe_ratio",
  "price/earning": "pe_ratio",
  "price/earnings": "pe_ratio",
  "p/e": "pe_ratio",
  "trailing pe": "trailing_pe",
  "forward pe": "forward_pe",
  "forward p/e": "forward_pe",
  peg: "peg_ratio",
  "peg ratio": "peg_ratio",
  "price earnings growth": "peg_ratio",
  "price to book": "price_book_mrq",
  "price to book value": "price_book_mrq",
  "price/book": "price_book_mrq",
  "p/b": "price_book_mrq",
  pb: "price_book_mrq",
  "price to sales": "price_sales_ttm",
  "price/sales": "price_sales_ttm",
  "p/s": "price_sales_ttm",
  ps: "price_sales_ttm",
  "ev/ebitda": "ev_ebitda",
  "ev to ebitda": "ev_ebitda",
  "ev/revenue": "ev_revenue",
  "ev to revenue": "ev_revenue",

  // Profitability Metrics (company_metrics_ttm)
  "profit margin": "profit_margin",
  "net margin": "profit_margin",
  "net profit margin": "profit_margin",
  "operating margin": "operating_margin_ttm",
  "operating profit margin": "operating_margin_ttm",
  opm: "operating_margin_ttm",
  "operating margin ttm": "operating_margin_ttm",
  roe: "return_on_equity_ttm",
  "return on equity": "return_on_equity_ttm",
  "roe ttm": "return_on_equity_ttm",
  roa: "return_on_assets_ttm",
  "return on assets": "return_on_assets_ttm",
  "roa ttm": "return_on_assets_ttm",

  // Earnings (company_metrics_ttm)
  revenue: "revenue_ttm",
  "revenue ttm": "revenue_ttm",
  sales: "revenue_ttm",
  "total revenue": "revenue_ttm",
  eps: "earnings_share",
  "earnings per share": "earnings_share",
  "diluted eps": "diluted_eps_ttm",
  "diluted eps ttm": "diluted_eps_ttm",

  // Dividends (company_metrics_ttm)
  "dividend yield": "dividend_yield",
  dividend_yield: "dividend_yield",
  "div yield": "dividend_yield",
  "dividend per share": "dividend_per_share",
  dividend_per_share: "dividend_per_share",
  "dividend share": "dividend_per_share",
  "forward dividend yield": "forward_annual_dividend_yield",
  forward_dividend_yield: "forward_annual_dividend_yield",
  forward_annual_dividend_yield: "forward_annual_dividend_yield",
  "forward div yield": "forward_annual_dividend_yield",
  "payout ratio": "payout_ratio",
  payout_ratio: "payout_ratio",
  "dividend payout ratio": "payout_ratio",

  // Technical (company_metrics_ttm)
  beta: "beta",
  "stock beta": "beta",
  "52 week high": "week_52_high",
  week_52_high: "week_52_high",
  "52w high": "week_52_high",
  "52wk high": "week_52_high",
  "52 week low": "week_52_low",
  week_52_low: "week_52_low",
  "52w low": "week_52_low",
  "52wk low": "week_52_low",
  "50 day moving average": "day_50_ma",
  day_50_ma: "day_50_ma",
  "50dma": "day_50_ma",
  "50 dma": "day_50_ma",
  sma50: "day_50_ma",
  ma50: "day_50_ma",
  "sma 50": "day_50_ma",
  "moving average 50": "day_50_ma",
  "200 day moving average": "day_200_ma",
  day_200_ma: "day_200_ma",
  "200dma": "day_200_ma",
  "200 dma": "day_200_ma",
  sma200: "day_200_ma",
  ma200: "day_200_ma",
  "sma 200": "day_200_ma",
  "moving average 200": "day_200_ma",

  // Shares (company_metrics_ttm)
  "shares outstanding": "shares_outstanding",
  shares_outstanding: "shares_outstanding",
  "shares float": "shares_float",
  shares_float: "shares_float",
  float: "shares_float",

  // Analyst (company_metrics_ttm)
  "analyst rating": "analyst_rating",
  analyst_rating: "analyst_rating",
  "target price": "analyst_target_price",
  target_price: "analyst_target_price",
  "analyst target": "analyst_target_price",
  "analyst target price": "analyst_target_price",

  // ═══════════════════════════════════════════════════════════════════════════
  // PRICE_DATA TABLE
  // ═══════════════════════════════════════════════════════════════════════════
  price: "adjusted_close",
  "current price": "adjusted_close",
  "stock price": "adjusted_close",
  "share price": "adjusted_close",
  "adjusted close": "adjusted_close",
  close: "close",
  open: "open",
  high: "high",
  low: "low",
  volume: "volume",
  "trading volume": "volume",
  change: "change",
  "price change": "change",
  "change percent": "change_percent",
  "change percentage": "change_percent",

  // ═══════════════════════════════════════════════════════════════════════════
  // BALANCE_SHEET TABLES (annual/quarterly)
  // ═══════════════════════════════════════════════════════════════════════════
  "total assets": "total_assets",
  "current assets": "total_current_assets",
  "total current assets": "total_current_assets",
  "cash and equivalents": "cash_and_equivalents",
  "cash equivalents": "cash_and_equivalents",
  cash: "cash_and_equivalents",
  receivables: "net_receivables",
  "net receivables": "net_receivables",
  "accounts receivable": "net_receivables",
  inventory: "inventory",
  "total liabilities": "total_liabilities",
  "current liabilities": "total_current_liabilities",
  "total current liabilities": "total_current_liabilities",
  "long term debt": "long_term_debt",
  "lt debt": "long_term_debt",
  "short term debt": "short_term_debt",
  "st debt": "short_term_debt",
  "shareholder equity": "total_stockholder_equity",
  "shareholders equity": "total_stockholder_equity",
  "stockholder equity": "total_stockholder_equity",
  "stockholders equity": "total_stockholder_equity",
  "retained earnings": "retained_earnings",
  "net debt": "net_debt",
  "net working capital": "net_working_capital",
  "working capital": "net_working_capital",

  // ═══════════════════════════════════════════════════════════════════════════
  // INCOME_STATEMENT TABLES (annual/quarterly)
  // ═══════════════════════════════════════════════════════════════════════════
  total_revenue: "total_revenue",
  "cost of revenue": "cost_of_revenue",
  "gross profit": "gross_profit",
  "operating income": "operating_income",
  ebit: "ebit",
  ebitda: "ebitda",
  "net income": "net_income",
  earnings: "net_income",
  "interest expense": "interest_expense",
  "income tax expense": "income_tax_expense",
  "tax expense": "income_tax_expense",
  "research development": "research_development",
  "r&d": "research_development",
  "research and development": "research_development",

  // ═══════════════════════════════════════════════════════════════════════════
  // CASH_FLOW TABLES (annual/quarterly)
  // ═══════════════════════════════════════════════════════════════════════════
  "operating cash flow": "total_cash_from_operating_activities",
  ocf: "total_cash_from_operating_activities",
  "cash from operations": "total_cash_from_operating_activities",
  capex: "capital_expenditures",
  "capital expenditures": "capital_expenditures",
  "capital expenditure": "capital_expenditures",
  "free cash flow": "free_cash_flow",
  fcf: "free_cash_flow",
  "dividends paid": "dividends_paid",
  "net borrowings": "net_borrowings",
  "change in cash": "change_in_cash",
};


// Helper function to get backend field name
export function getBackendFieldName(fieldName: string): string {
  const normalized = fieldName.toLowerCase().trim();
  return BACKEND_FIELD_MAP[normalized] || normalized.replace(/\s+/g, "_");
}

export const ENHANCED_DATA_SOURCE: Record<string, FieldDef[]> = {
  "Most Used": [
    {
      name: "Market Capitalization",
      description: "Total market value of shares",
      unit: "USD",
      keywords: ["market cap", "mcap", "market value"],
      example: "Market Capitalization > 5000000000",
      category: "Most Used",
      backendField: "market_cap",
    },
    {
      name: "PE",
      description: "Price to Earnings ratio",
      unit: "x",
      keywords: ["price earnings", "pe ratio", "p/e"],
      example: "PE BETWEEN 10 AND 25",
      category: "Most Used",
      backendField: "pe_ratio",
    },
    {
      name: "Price",
      description: "Current stock price",
      unit: "$",
      keywords: ["price", "stock price", "share price", "current price"],
      example: "Price > 100",
      category: "Most Used",
      backendField: "adjusted_close",
    },
    {
      name: "ROE",
      description: "Return on Equity",
      unit: "%",
      keywords: ["return equity", "roe"],
      example: "ROE > 15",
      category: "Most Used",
      backendField: "return_on_equity_ttm",
    },
    {
      name: "Volume",
      description: "Current trading volume",
      unit: "shares",
      keywords: ["volume", "trading volume"],
      example: "Volume > 1000000",
      category: "Most Used",
      backendField: "volume",
    },
  ],
  "Size & Volume": [
    {
      name: "Market Capitalization",
      description: "Total market value of shares",
      unit: "USD",
      keywords: ["market cap", "mcap", "market value"],
      example: "Market Capitalization > 5000000000",
      category: "Size & Volume",
      backendField: "market_cap",
    },
    {
      name: "Price",
      description: "Current stock price",
      unit: "$",
      keywords: ["price", "stock price", "share price", "current price"],
      example: "Price > 100",
      category: "Size & Volume",
      backendField: "adjusted_close",
    },
    {
      name: "Volume",
      description: "Current trading volume",
      unit: "shares",
      keywords: ["volume", "trading volume"],
      example: "Volume > 500000",
      category: "Size & Volume",
      backendField: "volume",
    },
  ],
  Valuation: [
    {
      name: "Price to Earning",
      description: "Current price divided by earnings per share",
      unit: "x",
      keywords: ["pe", "price earnings", "p/e"],
      example: "Price to Earning BETWEEN 10 AND 25",
      category: "Valuation",
      backendField: "pe_ratio",
    },
    {
      name: "Forward PE",
      description: "Price divided by forward earnings estimate",
      unit: "x",
      keywords: ["forward pe", "forward p/e"],
      example: "Forward PE < 20",
      category: "Valuation",
      backendField: "forward_pe",
    },
    {
      name: "PEG Ratio",
      description: "PE ratio divided by earnings growth rate",
      unit: "x",
      keywords: ["peg", "price earnings growth"],
      example: "PEG Ratio < 1",
      category: "Valuation",
      backendField: "peg_ratio",
    },
    {
      name: "Price to Book Value",
      description: "Market price vs book value per share",
      unit: "x",
      keywords: ["pb", "price book", "p/b"],
      example: "Price to Book Value < 3",
      category: "Valuation",
      backendField: "price_book_mrq",
    },
    {
      name: "Dividend Yield",
      description: "Annual dividend as % of current price",
      unit: "%",
      keywords: ["dividend", "yield", "div yield"],
      example: "Dividend Yield BETWEEN 2 AND 6",
      category: "Valuation",
      backendField: "dividend_yield",
    },
    {
      name: "EV/EBITDA",
      description: "Enterprise Value to EBITDA ratio",
      unit: "x",
      keywords: ["ev ebitda", "enterprise value"],
      example: "EV/EBITDA < 15",
      category: "Valuation",
      backendField: "ev_ebitda",
    },
    {
      name: "EV/Revenue",
      description: "Enterprise Value to Revenue ratio",
      unit: "x",
      keywords: ["ev revenue", "ev/r"],
      example: "EV/Revenue < 5",
      category: "Valuation",
      backendField: "ev_revenue",
    },
    {
      name: "Price to Sales",
      description: "Market cap divided by revenue",
      unit: "x",
      keywords: ["ps", "price sales", "p/s"],
      example: "Price to Sales < 5",
      category: "Valuation",
      backendField: "price_sales_ttm",
    },
  ],
  Profitability: [
    {
      name: "Return on Equity",
      description: "Net income as % of shareholders equity",
      unit: "%",
      keywords: ["roe", "return equity"],
      example: "Return on Equity > 15",
      category: "Profitability",
      backendField: "return_on_equity_ttm",
    },
    {
      name: "ROA",
      description: "Return on Assets",
      unit: "%",
      keywords: ["return assets", "roa"],
      example: "ROA > 5",
      category: "Profitability",
      backendField: "return_on_assets_ttm",
    },
    {
      name: "OPM",
      description: "Operating Profit Margin",
      unit: "%",
      keywords: ["operating", "margin", "profit margin"],
      example: "OPM > 15",
      category: "Profitability",
      backendField: "operating_margin_ttm",
    },
    {
      name: "Operating Profit Margin",
      description: "Operating profit as % of revenue",
      unit: "%",
      keywords: ["opm", "operating margin"],
      example: "Operating Profit Margin > 10",
      category: "Profitability",
      backendField: "operating_margin_ttm",
    },
    {
      name: "Net Profit Margin",
      description: "Net profit as % of revenue",
      unit: "%",
      keywords: ["profit margin", "net margin"],
      example: "Net Profit Margin > 10",
      category: "Profitability",
      backendField: "profit_margin",
    },
  ],
  "Financial Strength": [
    {
      name: "Long Term Debt",
      description: "Long-term debt on balance sheet",
      unit: "USD",
      keywords: ["long term debt", "lt debt"],
      example: "Long Term Debt < 1000000000",
      category: "Financial Strength",
      backendField: "long_term_debt",
    },
    {
      name: "Short Term Debt",
      description: "Short-term debt on balance sheet",
      unit: "USD",
      keywords: ["short term debt", "st debt"],
      example: "Short Term Debt < 500000000",
      category: "Financial Strength",
      backendField: "short_term_debt",
    },
    {
      name: "Net Debt",
      description: "Total debt minus cash and equivalents",
      unit: "USD",
      keywords: ["net debt"],
      example: "Net Debt < 500000000",
      category: "Financial Strength",
      backendField: "net_debt",
    },
    {
      name: "Cash and Equivalents",
      description: "Cash and cash equivalents on balance sheet",
      unit: "USD",
      keywords: ["cash", "cash equivalents", "liquidity"],
      example: "Cash and Equivalents > 500000000",
      category: "Financial Strength",
      backendField: "cash_and_equivalents",
    },
  ],
  "Cash Flow": [
    {
      name: "Operating Cash Flow",
      description: "Cash flow from operations",
      unit: "USD",
      keywords: ["ocf", "operating cf", "cash flow operations"],
      example: "Operating Cash Flow > 100000000",
      category: "Cash Flow",
      backendField: "total_cash_from_operating_activities",
    },
    {
      name: "Free Cash Flow",
      description: "Operating cash flow minus capital expenditures",
      unit: "USD",
      keywords: ["fcf", "free cf"],
      example: "Free Cash Flow > 50000000",
      category: "Cash Flow",
      backendField: "free_cash_flow",
    },
    {
      name: "Capital Expenditures",
      description: "Capital expenditures (capex)",
      unit: "USD",
      keywords: ["capex", "capital expenditure"],
      example: "Capital Expenditures < 50000000",
      category: "Cash Flow",
      backendField: "capital_expenditures",
    },
    {
      name: "Dividends Paid",
      description: "Dividends paid to shareholders",
      unit: "USD",
      keywords: ["dividends paid"],
      example: "Dividends Paid > 10000000",
      category: "Cash Flow",
      backendField: "dividends_paid",
    },
  ],
  "Technical Analysis": [
    {
      name: "Beta",
      description: "Stock's volatility relative to market",
      unit: "x",
      keywords: ["beta", "volatility"],
      example: "Beta BETWEEN 0.8 AND 1.2",
      category: "Technical Analysis",
      backendField: "beta",
    },
    {
      name: "Moving Average 50",
      description: "50-day moving average",
      unit: "$",
      keywords: ["ma50", "sma50", "50 day ma"],
      example: "Price > Moving Average 50",
      category: "Technical Analysis",
      backendField: "day_50_ma",
    },
    {
      name: "Moving Average 200",
      description: "200-day moving average",
      unit: "$",
      keywords: ["ma200", "sma200", "200 day ma"],
      example: "Moving Average 50 > Moving Average 200",
      category: "Technical Analysis",
      backendField: "day_200_ma",
    },
    {
      name: "52 Week High",
      description: "52-week high price",
      unit: "$",
      keywords: ["52w high", "52 week high"],
      example: "52 Week High > 100",
      category: "Technical Analysis",
      backendField: "week_52_high",
    },
    {
      name: "52 Week Low",
      description: "52-week low price",
      unit: "$",
      keywords: ["52w low", "52 week low"],
      example: "52 Week Low < 50",
      category: "Technical Analysis",
      backendField: "week_52_low",
    },
    {
      name: "Change",
      description: "Price change",
      unit: "$",
      keywords: ["change", "price change"],
      example: "Change > 1",
      category: "Technical Analysis",
      backendField: "change",
    },
    {
      name: "Change Percent",
      description: "Price change percentage",
      unit: "%",
      keywords: ["change percent", "% change"],
      example: "Change Percent > 2",
      category: "Technical Analysis",
      backendField: "change_percent",
    },
  ],
  "Company Info": [
    {
      name: "Sector",
      description: "Industry sector",
      unit: "text",
      keywords: ["sector"],
      example: 'Sector = "Technology"',
      category: "Company Info",
      backendField: "sector",
    },
    {
      name: "Industry",
      description: "Specific industry classification",
      unit: "text",
      keywords: ["industry", "business"],
      example: 'Industry = "Software"',
      category: "Company Info",
      backendField: "industry",
    },
    {
      name: "Exchange",
      description: "Stock exchange",
      unit: "text",
      keywords: ["exchange", "listing"],
      example: 'Exchange = "US"',
      category: "Company Info",
      backendField: "exchange",
    },
    {
      name: "Country",
      description: "Country of incorporation",
      unit: "text",
      keywords: ["country"],
      example: 'Country = "USA"',
      category: "Company Info",
      backendField: "country",
    },
    {
      name: "Currency",
      description: "Trading currency",
      unit: "text",
      keywords: ["currency"],
      example: 'Currency = "USD"',
      category: "Company Info",
      backendField: "currency",
    },
    {
      name: "Symbol",
      description: "Stock ticker symbol",
      unit: "text",
      keywords: ["symbol", "ticker", "code"],
      example: 'Symbol = "AAPL"',
      category: "Company Info",
      backendField: "ticker",
    },
    {
      name: "Name",
      description: "Company name",
      unit: "text",
      keywords: ["name", "company"],
      example: 'Name = "Apple"',
      category: "Company Info",
      backendField: "name",
    },
  ],
  Earnings: [
    {
      name: "EPS",
      description: "Earnings per Share (TTM)",
      unit: "$",
      keywords: ["eps", "earnings per share"],
      example: "EPS > 5",
      category: "Earnings",
      backendField: "earnings_share",
    },
    {
      name: "Diluted EPS",
      description: "Diluted Earnings per Share (TTM)",
      unit: "$",
      keywords: ["diluted eps"],
      example: "Diluted EPS > 4",
      category: "Earnings",
      backendField: "diluted_eps_ttm",
    },
    {
      name: "Revenue",
      description: "Total Revenue (TTM)",
      unit: "USD",
      keywords: ["revenue", "sales", "turnover"],
      example: "Revenue > 1000000000",
      category: "Earnings",
      backendField: "revenue_ttm",
    },
    {
      name: "Market Capitalization",
      description: "Total market value of shares",
      unit: "USD",
      keywords: ["market cap", "mcap", "market value"],
      example: "Market Capitalization > 10000000000",
      category: "Earnings",
      backendField: "market_cap",
    },
    {
      name: "Volume",
      description: "Current trading volume",
      unit: "shares",
      keywords: ["volume", "trading volume"],
      example: "Volume > 1000000",
      category: "Earnings",
      backendField: "volume",
    },
  ],
  "Balance Sheet": [
    {
      name: "Total Assets",
      description: "Total assets from balance sheet",
      unit: "USD",
      keywords: ["total assets", "assets"],
      example: "Total Assets > 1000000000",
      category: "Balance Sheet",
      backendField: "total_assets",
    },
    {
      name: "Shares Outstanding",
      description: "Total shares outstanding",
      unit: "shares",
      keywords: ["shares outstanding", "outstanding shares"],
      example: "Shares Outstanding > 100000000",
      category: "Balance Sheet",
      backendField: "shares_outstanding",
    },
    {
      name: "Shares Float",
      description: "Shares available for trading",
      unit: "shares",
      keywords: ["shares float", "float", "tradeable shares"],
      example: "Shares Float > 50000000",
      category: "Balance Sheet",
      backendField: "shares_float",
    },
    {
      name: "Total Liabilities",
      description: "Total liabilities from balance sheet",
      unit: "USD",
      keywords: ["total liabilities", "liabilities"],
      example: "Total Liabilities < 5000000000",
      backendField: "total_liabilities",
      category: "Balance Sheet",
    },
    {
      name: "Shareholder Equity",
      description: "Total stockholders equity",
      unit: "USD",
      keywords: ["shareholder equity", "stockholders equity", "book value"],
      example: "Shareholder Equity > 1000000000",
      backendField: "total_stockholder_equity",
      category: "Balance Sheet",
    },
    {
      name: "Inventory",
      description: "Current inventory",
      unit: "USD",
      keywords: ["inventory", "stock"],
      example: "Inventory < 500000000",
      backendField: "inventory",
      category: "Balance Sheet",
    },
    {
      name: "Receivables",
      description: "Net receivables",
      unit: "USD",
      keywords: ["receivables", "accounts receivable"],
      example: "Receivables < 1000000000",
      backendField: "net_receivables",
      category: "Balance Sheet",
    },
    {
      name: "Current Assets",
      description: "Total current assets",
      unit: "USD",
      keywords: ["current assets", "short term assets"],
      example: "Current Assets > 2000000000",
      backendField: "total_current_assets",
      category: "Balance Sheet",
    },
    {
      name: "Current Liabilities",
      description: "Total current liabilities",
      unit: "USD",
      keywords: ["current liabilities", "short term liabilities"],
      example: "Current Liabilities < 1000000000",
      backendField: "total_current_liabilities",
      category: "Balance Sheet",
    },
    {
      name: "Long Term Debt",
      description: "Long-term debt",
      unit: "USD",
      keywords: ["long term debt", "lt debt"],
      example: "Long Term Debt < 2000000000",
      backendField: "long_term_debt",
      category: "Balance Sheet",
    },
    {
      name: "Short Term Debt",
      description: "Short-term debt",
      unit: "USD",
      keywords: ["short term debt", "st debt", "current debt"],
      example: "Short Term Debt < 500000000",
      backendField: "short_term_debt",
      category: "Balance Sheet",
    },
    {
      name: "Net Debt",
      description: "Total Debt - Cash and Equivalents",
      unit: "USD",
      keywords: ["net debt"],
      example: "Net Debt < 1000000000",
      backendField: "net_debt",
      category: "Balance Sheet",
    },
    {
      name: "Retained Earnings",
      description: "Retained earnings",
      unit: "USD",
      keywords: ["retained earnings"],
      example: "Retained Earnings > 100000000",
      backendField: "retained_earnings",
      category: "Balance Sheet",
    },
    {
      name: "Net Working Capital",
      description: "Current Assets - Current Liabilities",
      unit: "USD",
      keywords: ["net working capital", "working capital"],
      example: "Net Working Capital > 500000000",
      backendField: "net_working_capital",
      category: "Balance Sheet",
    },
  ],
  "Income Statement": [
    {
      name: "EBITDA",
      description: "Earnings before interest, tax, depreciation & amortization",
      unit: "USD",
      keywords: ["ebitda"],
      example: "EBITDA > 1000000000",
      backendField: "ebitda",
      category: "Income Statement",
    },
    {
      name: "Gross Profit",
      description: "Gross profit",
      unit: "USD",
      keywords: ["gross profit"],
      example: "Gross Profit > 500000000",
      backendField: "gross_profit",
      category: "Income Statement",
    },
    {
      name: "Net Income",
      description: "Net income",
      unit: "USD",
      keywords: ["net income", "earnings", "profit"],
      example: "Net Income > 100000000",
      backendField: "net_income",
      category: "Income Statement",
    },
    {
      name: "Total Revenue",
      description: "Total revenue",
      unit: "USD",
      keywords: ["total revenue", "revenue", "sales"],
      example: "Total Revenue > 1000000000",
      backendField: "total_revenue",
      category: "Income Statement",
    },
    {
      name: "Cost of Revenue",
      description: "Cost of revenue",
      unit: "USD",
      keywords: ["cost of revenue", "cogs"],
      example: "Cost of Revenue < 500000000",
      backendField: "cost_of_revenue",
      category: "Income Statement",
    },
    {
      name: "Operating Income",
      description: "Operating income",
      unit: "USD",
      keywords: ["operating income", "operating profit"],
      example: "Operating Income > 200000000",
      backendField: "operating_income",
      category: "Income Statement",
    },
    {
      name: "EBIT",
      description: "Earnings before interest and taxes",
      unit: "USD",
      keywords: ["ebit"],
      example: "EBIT > 150000000",
      backendField: "ebit",
      category: "Income Statement",
    },
    {
      name: "Interest Expense",
      description: "Interest expense",
      unit: "USD",
      keywords: ["interest expense"],
      example: "Interest Expense < 100000000",
      backendField: "interest_expense",
      category: "Income Statement",
    },
    {
      name: "Income Tax Expense",
      description: "Income tax expense",
      unit: "USD",
      keywords: ["income tax expense", "tax expense"],
      example: "Income Tax Expense < 50000000",
      backendField: "income_tax_expense",
      category: "Income Statement",
    },
    {
      name: "Research Development",
      description: "Research and development expenses",
      unit: "USD",
      keywords: ["research development", "r&d"],
      example: "Research Development > 50000000",
      backendField: "research_development",
      category: "Income Statement",
    },
  ],
  "Dividends": [
    {
      name: "Dividend Per Share",
      description: "Dividend per share",
      unit: "$",
      keywords: ["dividend per share", "dps"],
      example: "Dividend Per Share > 2",
      backendField: "dividend_per_share",
      category: "Dividends",
    },
    {
      name: "Forward Dividend Yield",
      description: "Expected annual dividend yield based on forward rate",
      unit: "%",
      keywords: ["forward dividend yield", "forward dividend", "forward div yield"],
      example: "Forward Dividend Yield > 3",
      backendField: "forward_annual_dividend_yield",
      category: "Dividends",
    },
    {
      name: "Payout Ratio",
      description: "Dividend payout ratio",
      unit: "%",
      keywords: ["payout ratio", "dividend payout"],
      example: "Payout Ratio < 60",
      backendField: "payout_ratio",
      category: "Dividends",
    },
  ],
  "Analyst": [
    {
      name: "Analyst Rating",
      description: "Analyst rating",
      unit: "",
      keywords: ["analyst rating", "rating"],
      example: "Analyst Rating > 3",
      backendField: "analyst_rating",
      category: "Analyst",
    },
    {
      name: "Analyst Target Price",
      description: "Analyst consensus target price",
      unit: "$",
      keywords: ["target price", "analyst target", "target"],
      example: "Analyst Target Price > Price * 1.2",
      backendField: "analyst_target_price",
      category: "Analyst",
    },
  ],
  "Other Info": [
    {
      name: "Employees",
      description: "Full-time employees",
      unit: "",
      keywords: ["employees", "full time employees"],
      example: "Employees > 10000",
      backendField: "employees",
      category: "Other Info",
    },
  ],
};

export const OPERATORS = [
  {
    symbol: ">",
    description: "Greater than",
    example: "PE > 15",
    category: "Comparison",
  },
  {
    symbol: "<",
    description: "Less than",
    example: "PE < 20",
    category: "Comparison",
  },
  {
    symbol: ">=",
    description: "Greater than or equal",
    example: "Sales >= 1000",
    category: "Comparison",
  },
  {
    symbol: "<=",
    description: "Less than or equal",
    example: "Debt <= 500",
    category: "Comparison",
  },
  {
    symbol: "=",
    description: "Equal to",
    example: 'Sector = "Technology"',
    category: "Comparison",
  },
  {
    symbol: "!=",
    description: "Not equal to",
    example: "PE != 0",
    category: "Comparison",
  },
  {
    symbol: "+",
    description: "Add values (use inside expressions before comparison)",
    example: "PE + PB > 10",
    category: "Arithmetic",
  },
  {
    symbol: "-",
    description: "Subtract values (use inside expressions before comparison)",
    example: "Price - SMA50 > 0",
    category: "Arithmetic",
  },
  {
    symbol: "*",
    description: "Multiply values (use inside expressions before comparison)",
    example: "PE * EPS > 100",
    category: "Arithmetic",
  },
  {
    symbol: "/",
    description: "Divide values (use inside expressions before comparison)",
    example: "Market Capitalization / Revenue < 10",
    category: "Arithmetic",
  },
  {
    symbol: "AND",
    description: "Logical AND",
    example: "PE > 10 AND Sales > 500",
    category: "Logical",
  },
  {
    symbol: "OR",
    description: "Logical OR",
    example: "PE < 15 OR PB < 2",
    category: "Logical",
  },
  {
    symbol: "NOT",
    description: "Logical NOT",
    example: "NOT (Debt > 1000)",
    category: "Logical",
  },
  {
    symbol: "IN",
    description: "Value in list",
    example: 'Sector IN ("Technology", "Healthcare")',
    category: "Comparison",
  },
  {
    symbol: "BETWEEN",
    description: "Value between range",
    example: "PE BETWEEN 10 AND 25",
    category: "Comparison",
  },
  {
    symbol: "LIKE",
    description: "Pattern matching",
    example: 'Company Name LIKE "%Reliance%"',
    category: "Text",
  },
  {
    symbol: "IS NULL",
    description: "Check for null values",
    example: "Dividend yield IS NULL",
    category: "Comparison",
  },
  {
    symbol: "IS NOT NULL",
    description: "Check for non-null values",
    example: "EPS IS NOT NULL",
    category: "Comparison",
  },
];

export const FUNCTIONS = [
  {
    name: "AVG",
    description: "Average value",
    example: "AVG(PE) > 15",
    category: "Aggregate",
  },
  {
    name: "MAX",
    description: "Maximum value",
    example: "MAX(Sales)",
    category: "Aggregate",
  },
  {
    name: "MIN",
    description: "Minimum value",
    example: "MIN(PE)",
    category: "Aggregate",
  },
  {
    name: "SUM",
    description: "Sum of values",
    example: "SUM(Debt)",
    category: "Aggregate",
  },
  {
    name: "COUNT",
    description: "Count of records",
    example: "COUNT(*)",
    category: "Aggregate",
  },
  {
    name: "ABS",
    description: "Absolute value",
    example: "ABS(Price Change) < 5",
    category: "Math",
  },
  {
    name: "ROUND",
    description: "Round to specified decimals",
    example: "ROUND(PE, 2) < 15.50",
    category: "Math",
  },
  {
    name: "SQRT",
    description: "Square root",
    example: "SQRT(Market Capitalization) > 100",
    category: "Math",
  },
  {
    name: "LOG",
    description: "Natural logarithm",
    example: "LOG(Revenue) > 10",
    category: "Math",
  },
  {
    name: "EXP",
    description: "Exponential function",
    example: "EXP(ROE/100) > 1.15",
    category: "Math",
  },
  {
    name: "POWER",
    description: "Power function",
    example: "POWER(Sales growth 3Years/100, 3) > 1.3",
    category: "Math",
  },
  {
    name: "FLOOR",
    description: "Floor function",
    example: "FLOOR(PE) < 20",
    category: "Math",
  },
  {
    name: "CEIL",
    description: "Ceiling function",
    example: "CEIL(PB) <= 3",
    category: "Math",
  },
];

// Keyboard shortcuts configuration
export const KEYBOARD_SHORTCUTS = {
  "Ctrl+Space": "Show auto-complete suggestions",
  Tab: "Accept selected suggestion",
  Escape: "Close suggestions",
  "Ctrl+Z": "Undo",
  "Ctrl+Y": "Redo",
  "Ctrl+Shift+Z": "Redo (alternative)",
  "Ctrl+A": "Select all",
  "Ctrl+C": "Copy",
  "Ctrl+V": "Paste",
  "Ctrl+X": "Cut",
  "Ctrl+F": "Find in query",
  "Ctrl+H": "Replace in query",
  "Ctrl+/": "Toggle comment",
  "Ctrl+Enter": "Execute query",
  "Ctrl+Shift+F": "Format query",
  "Ctrl+D": "Duplicate line",
  "Ctrl+L": "Select line",
  "Ctrl+Shift+K": "Delete line",
  "Ctrl+Shift+Up": "Move line up",
  "Ctrl+Shift+Down": "Move line down",
  F1: "Show help guide",
  "Alt+Up": "Previous suggestion",
  "Alt+Down": "Next suggestion",
  "Ctrl+Shift+C": "Clear query",
};

// Common query examples and templates
// Example queries for the query builder
export const QUERY_EXAMPLES = [
  {
    name: "High Market Cap",
    query: "Market Cap > 100000000000",
    description: "Stocks with a market capitalization greater than $100 billion.",
  },
  {
    name: "Undervalued Growth",
    query: "PE < 20 AND ROE > 15 AND Revenue > 1000000000",
    description: "Companies with reasonable valuation, high return on equity, and significant revenue.",
  },
  {
    name: "Dividend Aristocrats",
    query: "Dividend Yield > 3 AND Payout Ratio < 60",
    description: "Sustainable dividend payers with yield over 3% and healthy payout ratio.",
  },
  {
    name: "Tech Growth",
    query: "Sector = 'Technology' AND Revenue > 500000000 AND PE < 50",
    description: "Technology companies with significant revenue and growth potential.",
  },
  {
    name: "Deep Value",
    query: "Price to Book Value < 1 AND PE < 15 AND Net Debt < 0",
    description: "Stocks trading below book value with low earnings multiples and strong balance sheets.",
  },
  {
    name: "Momentum",
    query: "Price > SMA200 AND Price > SMA50 AND RSI > 50",
    description: "Stocks in an uptrend trading above their moving averages.",
  },
  {
    name: "High Quality Defensives",
    query: "Sector = 'Healthcare' OR Sector = 'Consumer Defensive' AND ROE > 20",
    description: "High quality companies in defensive sectors.",
  },
  {
    name: "Debt Free Cash Cows",
    query: "Long Term Debt = 0 AND Free Cash Flow > 100000000",
    description: "Companies with zero long term debt and strong free cash flow.",
  },
];

// Common error patterns and solutions
export const ERROR_SOLUTIONS = {
  "Unknown field":
    "Check field name spelling. Use the auto-complete (Ctrl+Space) to see available fields.",
  "Missing operator":
    "Add a comparison operator like >, <, =, >=, <=, or != after the field or expression. Arithmetic operators (+, -, *, /) are allowed inside expressions before a comparison.",
  "Missing value":
    'Add a value after the operator. Use quotes for text values like "Technology".',
  "Unmatched parentheses":
    "Make sure every opening parenthesis ( has a matching closing parenthesis ).",
  "Invalid syntax":
    "Check for typos in field names, operators, or logical connectors (AND, OR, NOT).",
  "Incomplete condition":
    "Complete the condition with field + operator + value format.",
};

// Get all fields as flat array for searching
export const getAllFields = (): FieldDef[] => {
  const allFields: FieldDef[] = [];
  Object.entries(ENHANCED_DATA_SOURCE).forEach(([categoryName, fields]) => {
    (fields as FieldDef[]).forEach((field: FieldDef) => {
      allFields.push({
        ...field,
        category: field.category || categoryName,
      });
    });
  });
  return allFields;
};

// Value suggestions for specific fields
export const VALUE_SUGGESTIONS: Record<string, string[]> = {
  sector: [
    "Technology",
    "Financial Services",
    "Healthcare",
    "Consumer Cyclical",
    "Industrials",
    "Communication Services",
    "Consumer Defensive",
    "Energy",
    "Real Estate",
    "Basic Materials",
    "Utilities",
  ],
  exchange: ["US", "NASDAQ", "NYSE", "AMEX", "BATS"],
  country: [
    "USA",
    "India",
    "UK",
    "Canada",
    "China",
    "Germany",
    "France",
    "Japan",
  ],
};

// Search function for auto-completion
export const searchSuggestions = (
  input: string,
  cursorPosition: number
): QuerySuggestion[] => {
  const suggestions: QuerySuggestion[] = [];

  // Get the current word being typed
  const beforeCursor = input.substring(0, cursorPosition).trimStart();
  const words = beforeCursor.split(/\s+/);
  const currentWord = words[words.length - 1]?.toLowerCase() || "";

  // Previous word might indicate we need value suggestions (e.g., "Sector =" or "Exchange IN")
  const prevWord = words[words.length - 2]?.toLowerCase() || "";
  const secondPrevWord = words[words.length - 3]?.toLowerCase() || "";

  // Check for value suggestions (e.g., "Sector =", "Sector IN")
  const valueField = ["=", "!=", "in", "like", "between"].includes(prevWord)
    ? secondPrevWord
    : ["=", "!=", "in", "like", "between"].includes(currentWord)
      ? prevWord
      : null;

  if (valueField && VALUE_SUGGESTIONS[valueField.toLowerCase()]) {
    const values = VALUE_SUGGESTIONS[valueField.toLowerCase()];
    values.forEach((val) => {
      if (
        val.toLowerCase().includes(currentWord.replace(/['"]/g, "")) ||
        currentWord === "=" ||
        currentWord === "in"
      ) {
        suggestions.push({
          text: val,
          type: "value",
          description: `Value for ${valueField}`,
          insertText: `"${val}"`,
        });
      }
    });
    if (suggestions.length > 0) return suggestions.slice(0, 10);
  }

  if (currentWord.length === 0) return [];

  // Search in fields
  getAllFields().forEach((field) => {
    if (
      field.name.toLowerCase().includes(currentWord) ||
      field.keywords.some((keyword) => keyword.includes(currentWord))
    ) {
      suggestions.push({
        text: field.name,
        type: "field",
        description: `${field.description} (${field.unit})`,
        insertText: field.name,
      });
    }
  });

  // Search in operators
  OPERATORS.forEach((op) => {
    if (
      op.symbol.toLowerCase().includes(currentWord) ||
      op.description.toLowerCase().includes(currentWord)
    ) {
      suggestions.push({
        text: op.symbol,
        type: "operator",
        description: op.description,
        insertText: ` ${op.symbol} `,
      });
    }
  });

  // Search in functions
  FUNCTIONS.forEach((func) => {
    if (func.name.toLowerCase().includes(currentWord)) {
      suggestions.push({
        text: func.name,
        type: "function",
        description: func.description,
        insertText: `${func.name}(`,
      });
    }
  });

  return suggestions.slice(0, 10); // Limit to 10 suggestions
};

// Detect if left side of a condition is an arithmetic expression (contains +, -, *, /)
// Also handles expressions wrapped in parentheses
const isArithmeticExpression = (text: string): boolean => {
  // Strip leading/trailing parentheses for checking
  const stripped = text.replace(/^\(+/, "").replace(/\)+$/, "").trim();
  return /[+\-*/]/.test(stripped);
};

// Extract field names from an arithmetic expression for validation
const extractFieldsFromArithmetic = (text: string): string[] => {
  // Remove parentheses
  const stripped = text.replace(/[()]/g, " ");
  // Split by arithmetic operators
  const parts = stripped.split(/[+\-*/]/);
  // Filter and clean field names (exclude pure numbers)
  return parts
    .map((p) => p.trim())
    .filter((p) => p && !/^\d+(\.\d+)?$/.test(p));
};

// Split query by logical operators (AND/OR) but only when NOT inside parentheses
// This prevents incorrectly splitting field names like "Cash and Equivalents"
const splitByLogicalOperators = (query: string): string[] => {
  const results: string[] = [];
  let current = "";
  let parenDepth = 0;
  let i = 0;

  let betweenDepth = 0;

  while (i < query.length) {
    const char = query[i];

    if (char === "(") {
      parenDepth++;
      current += char;
      i++;
    } else if (char === ")") {
      parenDepth--;
      current += char;
      i++;
    } else if (parenDepth === 0) {
      const remaining = query.slice(i);

      // Track BETWEEN to avoid splitting on the 'AND' between values
      const betweenStartMatch = remaining.match(/^(\bBETWEEN\b\s+)/i);
      if (betweenStartMatch) {
        betweenDepth++;
        current += betweenStartMatch[1];
        i += betweenStartMatch[1].length;
        continue;
      }

      // Check for AND/OR only when NOT inside parentheses and NOT inside a BETWEEN clause
      const andMatch = remaining.match(/^(\s*AND\s+)/i);
      const orMatch = remaining.match(/^(\s*OR\s+)/i);

      if (andMatch && (i === 0 || /\s$/.test(current))) {
        if (betweenDepth > 0) {
          // This AND is likely part of BETWEEN x AND y
          betweenDepth--; // Finish one BETWEEN clause
          current += andMatch[1];
          i += andMatch[1].length;
        } else {
          if (current.trim()) results.push(current.trim());
          results.push("AND");
          current = "";
          i += andMatch[1].length;
        }
      } else if (orMatch && (i === 0 || /\s$/.test(current))) {
        if (current.trim()) results.push(current.trim());
        results.push("OR");
        current = "";
        i += orMatch[1].length;
      } else {
        current += char;
        i++;
      }
    } else {
      current += char;
      i++;
    }
  }

  if (current.trim()) results.push(current.trim());
  return results;
};

// Enhanced query validation that properly handles multi-word field names and multi-line queries
export const validateQuery = (query: string): QueryValidationError[] => {
  const errors: QueryValidationError[] = [];
  const lines = query.split("\n");
  const fieldNames = getAllFields().map((f) => f.name);

  // Also get all keywords from fields for validation
  const allKeywords = getAllFields().flatMap((f) => f.keywords || []);

  // Also include BACKEND_FIELD_MAP keys as valid field names
  const backendFieldKeys = Object.keys(BACKEND_FIELD_MAP);

  // Combine all valid field identifiers (use Array.from for compatibility)
  const allValidFields = Array.from(
    new Set([...fieldNames, ...allKeywords, ...backendFieldKeys])
  );

  // First, let's check the entire query as a whole for multi-line validation
  // const fullQuery = query.replace(/\n/g, ' ').trim();

  lines.forEach((line, lineIndex) => {
    const trimmedLine = line.trim();
    if (trimmedLine.length === 0) return;

    // Check for unmatched parentheses
    const openParens = (trimmedLine.match(/\(/g) || []).length;
    const closeParens = (trimmedLine.match(/\)/g) || []).length;

    if (openParens !== closeParens) {
      errors.push({
        line: lineIndex + 1,
        column: 1,
        message: "Unmatched parentheses",
        severity: "error",
      });
    }

    // For multi-line queries, only flag incomplete operators if it's the last line
    const isLastLine = lineIndex === lines.length - 1;
    if (
      isLastLine &&
      (trimmedLine.endsWith(" AND") ||
        trimmedLine.endsWith(" OR") ||
        trimmedLine.endsWith(" NOT"))
    ) {
      errors.push({
        line: lineIndex + 1,
        column: trimmedLine.length - 2,
        message: "Incomplete logical operator - missing condition after",
        severity: "warning",
      });
    }

    // Split by AND/OR to get individual conditions, but only when NOT inside parentheses
    // This prevents splitting "Cash and Equivalents" incorrectly
    const conditions = splitByLogicalOperators(trimmedLine);

    conditions.forEach((condition) => {
      // Skip the AND/OR operators themselves
      if (["AND", "OR"].includes(condition.toUpperCase())) return;

      const conditionTrimmed = condition.trim();
      if (!conditionTrimmed) return;

      // If this condition is a parenthesized expression, recursively validate its contents
      if (conditionTrimmed.startsWith("(") && conditionTrimmed.endsWith(")")) {
        // Extract the content inside the parentheses
        const innerContent = conditionTrimmed.substring(1, conditionTrimmed.length - 1).trim();
        
        // Recursively split and validate the inner expression
        const innerConditions = splitByLogicalOperators(innerContent);
        
        innerConditions.forEach((innerCondition) => {
          if (["AND", "OR"].includes(innerCondition.toUpperCase())) return;
          
          const innerTrimmed = innerCondition.trim();
          if (!innerTrimmed) return;
          
          // Recursively handle nested parentheses
          if (innerTrimmed.startsWith("(") && innerTrimmed.endsWith(")")) {
            // For deeply nested parentheses, we'll just validate them at the current level
            // This prevents infinite recursion while still catching basic issues
            return;
          }
          
          // Validate this inner condition
          const operatorMatch = innerTrimmed.match(
            /(>=|<=|!=|>|<|=|\bIN\b|\bBETWEEN\b|\bLIKE\b|\bIS\s+NOT\s+NULL\b|\bIS\s+NULL\b)/i
          );
          
          if (!operatorMatch) {
            const isKnownField = allValidFields.some(
              (field) => field.toLowerCase() === innerTrimmed.toLowerCase()
            );
            
            if (isKnownField) {
              errors.push({
                line: lineIndex + 1,
                column: trimmedLine.indexOf(innerTrimmed) + 1,
                message: `Field "${innerTrimmed}" needs an operator and value`,
                severity: "error",
              });
            } else if (innerTrimmed.length > 0) {
              errors.push({
                line: lineIndex + 1,
                column: Math.max(1, trimmedLine.indexOf(innerTrimmed) + 1),
                message: `Unknown field "${innerTrimmed}"`,
                severity: "error",
              });
            }
            return;
          }
          
          const operator = operatorMatch[0];
          const operatorIndex = innerTrimmed.indexOf(operator);
          const fieldPart = innerTrimmed.substring(0, operatorIndex).trim();
          const valuePart = innerTrimmed.substring(operatorIndex + operator.length).trim();
          
          // Validate field in parenthesized expression
          if (fieldPart) {
            const isValidField = allValidFields.some(
              (field) => field.toLowerCase() === fieldPart.toLowerCase()
            );
            
            if (!isValidField) {
              const closeMatch = allValidFields.find((field) => {
                const fieldLower = field.toLowerCase();
                const fieldPartLower = fieldPart.toLowerCase();
                return fieldLower.includes(fieldPartLower) || fieldPartLower.includes(fieldLower);
              });
              
              if (closeMatch) {
                errors.push({
                  line: lineIndex + 1,
                  column: trimmedLine.indexOf(fieldPart) + 1,
                  message: `Did you mean "${closeMatch}"?`,
                  severity: "warning",
                });
              } else {
                errors.push({
                  line: lineIndex + 1,
                  column: trimmedLine.indexOf(fieldPart) + 1,
                  message: `Unknown field "${fieldPart}"`,
                  severity: "error",
                });
              }
            }
          }
          
          // Validate value for IS NULL/IS NOT NULL - no value needed
          if (!valuePart && !/(IS\s+NULL|IS\s+NOT\s+NULL)$/i.test(operator)) {
            errors.push({
              line: lineIndex + 1,
              column: trimmedLine.indexOf(operator) + operator.length + 1,
              message: `Operator "${operator}" needs a value after it`,
              severity: "error",
            });
          }
        });
        
        return; // Skip further processing for parenthesized expressions
      }

      // Find operator in this condition - now supports more operators
      const operatorMatch = conditionTrimmed.match(
        /(>=|<=|!=|>|<|=|\bIN\b|\bBETWEEN\b|\bLIKE\b|\bIS\s+NOT\s+NULL\b|\bIS\s+NULL\b)/i
      );

      if (!operatorMatch) {
        // No operator found - decide if this is a known or unknown field fragment
        if (conditionTrimmed.length > 0) {
          const isKnownField = allValidFields.some(
            (field) => field.toLowerCase() === conditionTrimmed.toLowerCase()
          );

          if (isKnownField) {
            // Only flag as error if this is a complete line or the last condition
            const hasMoreContent =
              trimmedLine.indexOf(conditionTrimmed) + conditionTrimmed.length <
              trimmedLine.length;
            if (!hasMoreContent) {
              errors.push({
                line: lineIndex + 1,
                column:
                  trimmedLine.indexOf(conditionTrimmed) +
                  conditionTrimmed.length +
                  1,
                message: `Field "${conditionTrimmed}" needs an operator and value`,
                severity: "error",
              });
            }
          } else {
            // Unknown field without operator – still report so users see immediate feedback
            errors.push({
              line: lineIndex + 1,
              column: Math.max(1, trimmedLine.indexOf(conditionTrimmed) + 1),
              message: `Unknown field "${conditionTrimmed}"`,
              severity: "error",
            });
          }
        }
        return;
      }

      const operator = operatorMatch[0];
      const operatorIndex = conditionTrimmed.indexOf(operator);
      const fieldPart = conditionTrimmed.substring(0, operatorIndex).trim();
      const valuePart = conditionTrimmed
        .substring(operatorIndex + operator.length)
        .trim();

      // Validate field name
      if (fieldPart) {
        const isArithmetic = isArithmeticExpression(fieldPart);
        const isValidField = allValidFields.some(
          (field) => field.toLowerCase() === fieldPart.toLowerCase()
        );

        if (isValidField) {
          // Valid single field, nothing to do
        } else if (isArithmetic) {
          // Validate individual fields in arithmetic expression
          const subFields = extractFieldsFromArithmetic(fieldPart);
          subFields.forEach(subField => {
            const isSubFieldValid = allValidFields.some(
              (field) => field.toLowerCase() === subField.toLowerCase()
            );
            if (!isSubFieldValid) {
              // Check for close match for subfield ? (Optional improvement)
              errors.push({
                line: lineIndex + 1,
                column: trimmedLine.indexOf(subField) + 1,
                message: `Unknown field "${subField}" in expression`,
                severity: "error",
              });
            }
          });
        } else {
          // Try to find a close match
          const closeMatch = allValidFields.find((field) => {
            const fieldLower = field.toLowerCase();
            const fieldPartLower = fieldPart.toLowerCase();

            // Exact match
            if (fieldLower === fieldPartLower) return true;

            // Contains match
            if (
              fieldLower.includes(fieldPartLower) ||
              fieldPartLower.includes(fieldLower)
            )
              return true;

            // Word-based match for multi-word fields
            const fieldWords = fieldLower.split(/\s+/);
            const inputWords = fieldPartLower.split(/\s+/);

            return inputWords.every((inputWord: string) =>
              fieldWords.some(
                (fieldWord: string) =>
                  fieldWord.includes(inputWord) || inputWord.includes(fieldWord)
              )
            );
          });

          if (closeMatch) {
            errors.push({
              line: lineIndex + 1,
              column: trimmedLine.indexOf(fieldPart) + 1,
              message: `Did you mean "${closeMatch}"?`,
              severity: "warning",
            });
          } else {
            errors.push({
              line: lineIndex + 1,
              column: trimmedLine.indexOf(fieldPart) + 1,
              message: `Unknown field "${fieldPart}"`,
              severity: "error",
            });
          }
        }
      } else {
        errors.push({
          line: lineIndex + 1,
          column: trimmedLine.indexOf(operator) + 1,
          message: `Operator "${operator}" needs a field before it`,
          severity: "error",
        });
      }

      // Validate value - IS NULL and IS NOT NULL don't need values
      const isNullOperator = /^IS\s+(NOT\s+)?NULL$/i.test(operator);
      
      if (!valuePart && !isNullOperator) {
        errors.push({
          line: lineIndex + 1,
          column: trimmedLine.indexOf(operator) + operator.length + 1,
          message: `Operator "${operator}" needs a value after it`,
          severity: "error",
        });
      } else if (valuePart) {
        // Detect missing logical operator between adjacent conditions
        // Strategy: search for any known field name inside valuePart (case-insensitive),
        // and if immediately followed (after optional spaces) by an operator OR any token (number/word), report error.
        const lowerValue = valuePart.toLowerCase();
        let offendingField: string | null = null;
        let offendingPosInValue = -1;
        for (const fname of fieldNames) {
          const lname = fname.toLowerCase();
          const pos = lowerValue.indexOf(lname);
          if (pos >= 0) {
            const beforeChar = pos === 0 ? "" : lowerValue[pos - 1];
            // Ensure boundary before field (start or whitespace or '(')
            if (pos === 0 || /\s|\(/.test(beforeChar)) {
              const rest = lowerValue.slice(pos + lname.length);
              const afterTrim = rest.trimStart();
              // Case 1: immediately followed by comparison operator => clearly a second condition
              if (/^(>=|<=|!=|>|<|=)/.test(afterTrim)) {
                offendingField = fname;
                offendingPosInValue = pos;
                break;
              }
              // Case 2: appears to start a condition but missing operator, e.g., "ROCE 200" or just "ROCE" at end
              if (afterTrim.length === 0 || /^\d|^[a-zA-Z(]/.test(afterTrim)) {
                offendingField = fname;
                offendingPosInValue = pos;
                break;
              }
            }
          }
        }
        if (offendingField) {
          // Compute column relative to full trimmed line
          const baseIndex = trimmedLine.indexOf(operator) + operator.length;
          const secondIndexInLine = trimmedLine
            .toLowerCase()
            .indexOf(offendingField.toLowerCase(), baseIndex);
          errors.push({
            line: lineIndex + 1,
            column: Math.max(
              1,
              (secondIndexInLine >= 0
                ? secondIndexInLine
                : baseIndex + offendingPosInValue) + 1
            ),
            message: `Missing logical operator (AND/OR) before "${offendingField}"`,
            severity: "error",
          });
        }
      }
    });
  });

  return errors;
};

// Enhanced syntax highlighting tokens
export const tokenizeQuery = (query: string) => {
  const tokens = [];
  const fieldNames = getAllFields().map((f) => f.name);
  const allKeywords = getAllFields().flatMap((f) => f.keywords || []);
  const backendFieldKeys = Object.keys(BACKEND_FIELD_MAP);
  const allValidFields = Array.from(
    new Set([...fieldNames, ...allKeywords, ...backendFieldKeys])
  );
  const operatorSymbols = OPERATORS.map((o) => o.symbol);
  const functionNames = FUNCTIONS.map((f) => f.name);

  // Better tokenization that preserves spacing and handles multi-character operators
  const regex =
    /(\s+|>=|<=|!=|AND|OR|NOT|IN|BETWEEN|LIKE|IS\s+NOT\s+NULL|IS\s+NULL|[()><=]|\w+(?:\s+\w+)*|\d+(?:\.\d+)?|[^\w\s()><=])/gi;
  let match;
  let lastIndex = 0;

  while ((match = regex.exec(query)) !== null) {
    // Add any text between matches
    if (match.index > lastIndex) {
      const betweenText = query.substring(lastIndex, match.index);
      if (betweenText) {
        tokens.push({ text: betweenText, type: "text" });
      }
    }

    const matchedText = match[0];
    let type = "text";

    // Determine token type
    if (/^\s+$/.test(matchedText)) {
      type = "whitespace";
    } else if (
      allValidFields.some((f) => f.toLowerCase() === matchedText.toLowerCase())
    ) {
      type = "field";
    } else if (operatorSymbols.includes(matchedText)) {
      type = "operator";
    } else if (["AND", "OR", "NOT"].includes(matchedText.toUpperCase())) {
      type = "operator";
    } else if (functionNames.some((fn) => matchedText.startsWith(fn))) {
      type = "function";
    } else if (/^\d+(\.\d+)?$/.test(matchedText)) {
      type = "number";
    } else if (/^[()]+$/.test(matchedText)) {
      type = "punctuation";
    } else if (matchedText.length > 1) {
      // Check if it's a partial field name match
      const partialMatch = allValidFields.find((name) =>
        name.toLowerCase().includes(matchedText.toLowerCase())
      );
      if (partialMatch) {
        type = "field-partial";
      }
    }

    tokens.push({ text: matchedText, type });
    lastIndex = regex.lastIndex;
  }

  // Add any remaining text
  if (lastIndex < query.length) {
    const remainingText = query.substring(lastIndex);
    if (remainingText) {
      tokens.push({ text: remainingText, type: "text" });
    }
  }

  return tokens;
};
