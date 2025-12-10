// Query Builder Utilities and Types

export interface QuerySuggestion {
  text: string;
  type: "field" | "operator" | "value" | "function";
  description?: string;
  category?: string;
  insertText?: string;
  score?: number;
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
}

// Backend field mapping - mirrors backend's FIELD_MAP for consistency
// This maps frontend display names to actual database column names
export const BACKEND_FIELD_MAP: Record<string, string> = {
  // Price & Market Data
  "market capitalization": "market_cap",
  "market cap": "market_cap",
  marketcap: "market_cap",
  mcap: "market_cap",
  "current price": "price",
  price: "price",
  volume: "volume",
  "avg volume": "avg_volume_200d",
  "average volume": "avg_volume_200d",
  "1d change %": "refund_1d_p",
  "5d change %": "refund_5d_p",

  // Valuation
  pe: "pe",
  "price to earning": "pe",
  "forward pe": "forward_pe",
  "forward p/e": "forward_pe",
  peg: "peg",
  "peg ratio": "peg",
  "price to book value": "pb",
  "p/b": "pb",
  pb: "pb",
  "dividend yield": "dividend_yield",
  "ev/ebitda": "ev_ebitda",
  "price to sales": "price_to_sales",
  "p/s": "price_to_sales",
  "ev/sales": "ev_sales",
  "ev/ sales": "ev_sales",
  "price to cash flow": "price_to_cash_flow",
  "p/c": "price_to_cash_flow",

  // Profitability
  roe: "roe",
  "return on equity": "roe",
  roce: "roce",
  "return on capital employed": "roce",
  roa: "roa",
  "return on assets": "roa",
  opm: "opm",
  "operating profit margin": "opm",
  "net margin": "net_margin",

  // Growth
  "sales growth 3years": "sales_cagr_3y",
  "profit growth 5years": "profit_cagr_5y",
  "eps growth 3years": "eps_cagr_3y",
  "revenue growth 1year": "revenue_growth_1y",
  "profit growth 1year": "profit_growth_1y",

  // Leverage & Quality
  "debt to equity": "debt_to_equity",
  "lt debt to equity": "lt_debt_to_equity",
  "interest coverage": "interest_coverage",
  "current ratio": "current_ratio",
  "quick ratio": "quick_ratio",
  "total debt": "total_debt",
  totaldebt: "total_debt",
  "cash and equivalents": "cash_equivalents",
  "cash equivalents": "cash_equivalents",
  "cash and cash equivalents": "cash_equivalents",
  cashequivalents: "cash_equivalents",
  cashandequivalents: "cash_equivalents",

  // Cash Flow
  "operating cash flow": "operating_cf",
  "free cash flow": "free_cf",
  "cash flow margin": "cf_margin",

  // Technicals
  beta: "beta",
  rsi: "rsi",
  sma20: "sma20",
  sma50: "ma50",
  ma50: "ma50",
  "moving average 50": "ma50",
  sma200: "ma200",
  ma200: "ma200",
  "moving average 200": "ma200",
  "price change 1d": "price_change_1d",
  "price change 1y": "price_change_1y",

  // Earnings & Revenue
  eps: "eps_ttm",
  "earnings per share": "eps_ttm",
  "diluted eps": "diluted_eps_ttm",
  revenue: "revenue_ttm",
  sales: "revenue_ttm",
  earnings: "earnings_ttm",

  // Performance
  "return over 3years": "perf_3y_p",
  perf3y: "perf_3y_p",
  "return over 5years": "perf_5y_p",
  perf5y: "perf_5y_p",

  // Company Info
  sector: "sector",
  industry: "industry",
  exchange: "exchange",
  code: "code",
  symbol: "code",
  name: "name",
  country: "country",
  currency: "currency",
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
      backendField: "pe",
    },
    {
      name: "Price",
      description: "Current stock price",
      unit: "$",
      keywords: ["price", "stock price", "share price", "current price"],
      example: "Price > 100",
      category: "Most Used",
      backendField: "price",
    },
    {
      name: "ROE",
      description: "Return on Equity",
      unit: "%",
      keywords: ["return equity", "roe"],
      example: "ROE > 15",
      category: "Most Used",
      backendField: "roe",
    },
    {
      name: "ROCE",
      description: "Return on Capital Employed",
      unit: "%",
      keywords: ["return capital", "roce"],
      example: "ROCE > 15",
      category: "Most Used",
      backendField: "roce",
    },
    {
      name: "ROA",
      description: "Return on Assets",
      unit: "%",
      keywords: ["return assets", "roa"],
      example: "ROA > 5",
      category: "Most Used",
      backendField: "roa",
    },
    {
      name: "EPS",
      description: "Earnings per Share (TTM)",
      unit: "$",
      keywords: ["earnings per share", "eps"],
      example: "EPS > 10",
      category: "Most Used",
      backendField: "eps_ttm",
    },
    {
      name: "Revenue",
      description: "Total Revenue (TTM)",
      unit: "USD",
      keywords: ["revenue", "sales", "turnover"],
      example: "Revenue > 1000000000",
      category: "Most Used",
      backendField: "revenue_ttm",
    },
    {
      name: "Dividend Yield",
      description: "Annual dividend as % of current price",
      unit: "%",
      keywords: ["dividend", "yield", "div yield"],
      example: "Dividend Yield BETWEEN 2 AND 6",
      category: "Most Used",
      backendField: "dividend_yield",
    },
    {
      name: "Volume",
      description: "Current trading volume",
      unit: "shares",
      keywords: ["volume", "trading volume"],
      example: "Volume > 500000",
      category: "Most Used",
      backendField: "volume",
    },
    {
      name: "OPM",
      description: "Operating Profit Margin",
      unit: "%",
      keywords: ["operating", "margin", "profit margin"],
      example: "OPM > 15",
      category: "Most Used",
      backendField: "opm",
    },
    {
      name: "Earnings",
      description: "Net Earnings (TTM)",
      unit: "USD",
      keywords: ["earnings", "net income", "profit"],
      example: "Earnings > 100000000",
      category: "Most Used",
      backendField: "earnings_ttm",
    },
  ],
  Valuation: [
    {
      name: "Price to Earning",
      description: "Current price divided by earnings per share",
      unit: "x",
      keywords: ["pe", "price earnings", "p/e"],
      example: "Price to Earning BETWEEN 10 AND 25",
      backendField: "pe",
    },
    {
      name: "Forward PE",
      description: "Price divided by forward earnings estimate",
      unit: "x",
      keywords: ["forward pe", "forward p/e"],
      example: "Forward PE < 20",
      backendField: "forward_pe",
    },
    {
      name: "PEG Ratio",
      description: "PE ratio divided by earnings growth rate",
      unit: "x",
      keywords: ["peg", "price earnings growth"],
      example: "PEG Ratio < 1",
      backendField: "peg",
    },
    {
      name: "Price to Book Value",
      description: "Market price vs book value per share",
      unit: "x",
      keywords: ["pb", "price book", "p/b"],
      example: "Price to Book Value < 3",
      backendField: "pb",
    },
    {
      name: "Dividend Yield",
      description: "Annual dividend as % of current price",
      unit: "%",
      keywords: ["dividend", "yield", "div yield"],
      example: "Dividend Yield BETWEEN 2 AND 6",
      backendField: "dividend_yield",
    },
    {
      name: "EV/EBITDA",
      description: "Enterprise Value to EBITDA ratio",
      unit: "x",
      keywords: ["ev ebitda", "enterprise value"],
      example: "EV/EBITDA < 15",
      backendField: "ev_ebitda",
    },
    {
      name: "Price to Sales",
      description: "Market cap divided by revenue",
      unit: "x",
      keywords: ["ps", "price sales", "p/s"],
      example: "Price to Sales < 5",
      backendField: "price_to_sales",
    },
    {
      name: "EV/Sales",
      description: "Enterprise Value to Sales ratio",
      unit: "x",
      keywords: ["ev sales", "ev/s"],
      example: "EV/Sales < 3",
      backendField: "ev_sales",
    },
    {
      name: "Price to Cash Flow",
      description: "Price to operating cash flow ratio",
      unit: "x",
      keywords: ["pcf", "price cash flow"],
      example: "Price to Cash Flow < 20",
      backendField: "price_to_cash_flow",
    },
  ],
  Profitability: [
    {
      name: "Return on Equity",
      description: "Net income as % of shareholders equity",
      unit: "%",
      keywords: ["roe", "return equity"],
      example: "Return on Equity > 15",
      backendField: "roe",
    },
    {
      name: "Return on Capital Employed",
      description: "EBIT as % of capital employed",
      unit: "%",
      keywords: ["roce", "return capital"],
      example: "Return on Capital Employed > 15",
      backendField: "roce",
    },
    {
      name: "Return on Assets",
      description: "Net income as % of total assets",
      unit: "%",
      keywords: ["roa", "return assets"],
      example: "Return on Assets > 5",
      backendField: "roa",
    },
    {
      name: "Operating Profit Margin",
      description: "Operating profit as % of revenue",
      unit: "%",
      keywords: ["opm", "operating margin"],
      example: "Operating Profit Margin > 15",
      backendField: "opm",
    },
    {
      name: "Net Margin",
      description: "Net profit as % of revenue",
      unit: "%",
      keywords: ["net margin", "profit margin"],
      example: "Net Margin > 10",
      backendField: "net_margin",
    },
  ],
  "Leverage & Quality": [
    {
      name: "Debt to Equity",
      description: "Total debt divided by shareholders equity",
      unit: "x",
      keywords: ["debt equity", "de", "d/e"],
      example: "Debt to Equity < 0.5",
      backendField: "debt_to_equity",
    },
    {
      name: "LT Debt to Equity",
      description: "Long-term debt to equity ratio",
      unit: "x",
      keywords: ["lt debt equity", "long term debt"],
      example: "LT Debt to Equity < 0.3",
      backendField: "lt_debt_to_equity",
    },
    {
      name: "Interest Coverage",
      description: "EBIT divided by interest expense",
      unit: "x",
      keywords: ["interest cover", "times interest earned"],
      example: "Interest Coverage > 5",
      backendField: "interest_coverage",
    },
    {
      name: "Current Ratio",
      description: "Current assets divided by current liabilities",
      unit: "x",
      keywords: ["current", "liquidity"],
      example: "Current Ratio > 1.5",
      backendField: "current_ratio",
    },
    {
      name: "Quick Ratio",
      description: "Quick assets divided by current liabilities",
      unit: "x",
      keywords: ["quick", "acid test"],
      example: "Quick Ratio > 1",
      backendField: "quick_ratio",
    },
    {
      name: "Total Debt",
      description: "Total debt (short-term + long-term)",
      unit: "USD",
      keywords: ["total debt", "debt", "total liabilities"],
      example: "Total Debt < 1000000000",
      backendField: "total_debt",
    },
    {
      name: "Cash and Equivalents",
      description: "Cash and cash equivalents on balance sheet",
      unit: "USD",
      keywords: ["cash", "cash equivalents", "liquidity"],
      example: "Cash and Equivalents > 500000000",
      backendField: "cash_equivalents",
    },
  ],
  "Cash Flow": [
    {
      name: "Operating Cash Flow",
      description: "Cash flow from operations",
      unit: "USD",
      keywords: ["ocf", "operating cf", "cash flow operations"],
      example: "Operating Cash Flow > 100000000",
      backendField: "operating_cf",
    },
    {
      name: "Free Cash Flow",
      description: "Operating cash flow minus capital expenditures",
      unit: "USD",
      keywords: ["fcf", "free cf"],
      example: "Free Cash Flow > 50000000",
      backendField: "free_cf",
    },
    {
      name: "Cash Flow Margin",
      description: "Operating cash flow as % of revenue",
      unit: "%",
      keywords: ["cf margin", "cash margin"],
      example: "Cash Flow Margin > 10",
      backendField: "cf_margin",
    },
  ],
  Growth: [
    {
      name: "Sales Growth 3Years",
      description: "3-year compound annual growth rate",
      unit: "%",
      keywords: ["3y growth", "sales cagr"],
      example: "Sales Growth 3Years > 15",
      backendField: "sales_cagr_3y",
    },
    {
      name: "Profit Growth 5Years",
      description: "5-year profit compound annual growth rate",
      unit: "%",
      keywords: ["5y growth", "profit cagr"],
      example: "Profit Growth 5Years > 20",
      backendField: "profit_cagr_5y",
    },
    {
      name: "EPS Growth 3Years",
      description: "3-year EPS compound annual growth rate",
      unit: "%",
      keywords: ["3y eps", "earnings growth"],
      example: "EPS Growth 3Years > 18",
      backendField: "eps_cagr_3y",
    },
    {
      name: "Revenue Growth 1Year",
      description: "1-year revenue growth rate",
      unit: "%",
      keywords: ["1y revenue", "annual revenue growth"],
      example: "Revenue Growth 1Year > 10",
      backendField: "revenue_growth_1y",
    },
    {
      name: "Profit Growth 1Year",
      description: "1-year profit growth rate",
      unit: "%",
      keywords: ["1y profit", "annual profit growth"],
      example: "Profit Growth 1Year > 15",
      backendField: "profit_growth_1y",
    },
    {
      name: "Return over 3years",
      description: "3-year stock return",
      unit: "%",
      keywords: ["3y return", "stock performance"],
      example: "Return over 3years > 50",
      backendField: "perf_3y_p",
    },
    {
      name: "Return over 5years",
      description: "5-year stock return",
      unit: "%",
      keywords: ["5y return", "long term return"],
      example: "Return over 5years > 100",
      backendField: "perf_5y_p",
    },
  ],
  Technical: [
    {
      name: "Beta",
      description: "Stock's volatility relative to market",
      unit: "x",
      keywords: ["beta", "volatility"],
      example: "Beta BETWEEN 0.8 AND 1.2",
      backendField: "beta",
    },
    {
      name: "RSI",
      description: "Relative Strength Index",
      unit: "",
      keywords: ["rsi", "momentum"],
      example: "RSI BETWEEN 30 AND 70",
      backendField: "rsi",
    },
    {
      name: "SMA20",
      description: "20-day simple moving average",
      unit: "$",
      keywords: ["sma20", "20 day ma"],
      example: "Price > SMA20",
      backendField: "sma20",
    },
    {
      name: "Moving Average 50",
      description: "50-day moving average",
      unit: "$",
      keywords: ["ma50", "sma50", "50 day ma"],
      example: "Price > Moving Average 50",
      backendField: "ma50",
    },
    {
      name: "Moving Average 200",
      description: "200-day moving average",
      unit: "$",
      keywords: ["ma200", "sma200", "200 day ma"],
      example: "Moving Average 50 > Moving Average 200",
      backendField: "ma200",
    },
    {
      name: "Average Volume",
      description: "200-day average daily trading volume",
      unit: "shares",
      keywords: ["avg volume", "average volume"],
      example: "Average Volume > 1000000",
      backendField: "avg_volume_200d",
    },
    {
      name: "Volume",
      description: "Current trading volume",
      unit: "shares",
      keywords: ["volume", "trading volume"],
      example: "Volume > 500000",
      backendField: "volume",
    },
    {
      name: "1D Change %",
      description: "1-day price change percentage",
      unit: "%",
      keywords: ["1d change", "daily change"],
      example: "1D Change % > 2",
      backendField: "refund_1d_p",
    },
    {
      name: "5D Change %",
      description: "5-day price change percentage",
      unit: "%",
      keywords: ["5d change", "weekly change"],
      example: "5D Change % > 5",
      backendField: "refund_5d_p",
    },
    {
      name: "Price Change 1D",
      description: "1-day absolute price change",
      unit: "$",
      keywords: ["price change 1d"],
      example: "Price Change 1D > 1",
      backendField: "price_change_1d",
    },
    {
      name: "Price Change 1Y",
      description: "1-year price change",
      unit: "%",
      keywords: ["price change 1y", "annual change"],
      example: "Price Change 1Y > 20",
      backendField: "price_change_1y",
    },
  ],
  "Company Info": [
    {
      name: "Sector",
      description: "Industry sector",
      unit: "text",
      keywords: ["sector"],
      example: 'Sector = "Technology"',
      backendField: "sector",
    },
    {
      name: "Industry",
      description: "Specific industry classification",
      unit: "text",
      keywords: ["industry", "business"],
      example: 'Industry = "Software"',
      backendField: "industry",
    },
    {
      name: "Exchange",
      description: "Stock exchange",
      unit: "text",
      keywords: ["exchange", "listing"],
      example: 'Exchange = "US"',
      backendField: "exchange",
    },
    {
      name: "Country",
      description: "Country of incorporation",
      unit: "text",
      keywords: ["country"],
      example: 'Country = "USA"',
      backendField: "country",
    },
    {
      name: "Currency",
      description: "Trading currency",
      unit: "text",
      keywords: ["currency"],
      example: 'Currency = "USD"',
      backendField: "currency",
    },
    {
      name: "Symbol",
      description: "Stock ticker symbol",
      unit: "text",
      keywords: ["symbol", "ticker", "code"],
      example: 'Symbol = "AAPL"',
      backendField: "code",
    },
    {
      name: "Name",
      description: "Company name",
      unit: "text",
      keywords: ["name", "company"],
      example: 'Name = "Apple"',
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
      backendField: "eps_ttm",
    },
    {
      name: "Diluted EPS",
      description: "Diluted Earnings per Share (TTM)",
      unit: "$",
      keywords: ["diluted eps"],
      example: "Diluted EPS > 4",
      backendField: "diluted_eps_ttm",
    },
    {
      name: "Revenue",
      description: "Total Revenue (TTM)",
      unit: "USD",
      keywords: ["revenue", "sales"],
      example: "Revenue > 1000000000",
      backendField: "revenue_ttm",
    },
    {
      name: "Earnings",
      description: "Net Earnings (TTM)",
      unit: "USD",
      keywords: ["earnings", "net income", "profit after tax"],
      example: "Earnings > 100000000",
      backendField: "earnings_ttm",
    },
  ],
  "Price & Market": [
    {
      name: "Price",
      description: "Current stock price",
      unit: "$",
      keywords: ["price", "current price", "stock price"],
      example: "Price > 50",
      backendField: "price",
    },
    {
      name: "Market Capitalization",
      description: "Total market value of shares",
      unit: "USD",
      keywords: ["market cap", "mcap", "market value"],
      example: "Market Capitalization > 10000000000",
      backendField: "market_cap",
    },
    {
      name: "Volume",
      description: "Current trading volume",
      unit: "shares",
      keywords: ["volume", "trading volume"],
      example: "Volume > 1000000",
      backendField: "volume",
    },
    {
      name: "Average Volume",
      description: "200-day average trading volume",
      unit: "shares",
      keywords: ["avg volume", "average volume"],
      example: "Average Volume > 500000",
      backendField: "avg_volume_200d",
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
export const QUERY_EXAMPLES = {
  "Value Stocks": {
    query: "PE < 15 AND PB < 2 AND ROE > 15 AND Debt to equity < 0.5",
    description: "Find undervalued stocks with good fundamentals",
  },
  "Growth Stocks": {
    query: "Sales growth 3Years > 20 AND EPS growth 3Years > 25 AND ROE > 20",
    description: "High growth companies with strong earnings",
  },
  "Dividend Stocks": {
    query:
      "Dividend yield > 3 AND Dividend growth 5Years > 8 AND Payout Ratio < 60",
    description: "Reliable dividend paying stocks",
  },
  "Quality Stocks": {
    query:
      "ROE > 18 AND ROCE > 20 AND Current Ratio > 1.5 AND Interest Coverage > 5",
    description: "High quality companies with strong financials",
  },
  "Small Cap Growth": {
    query:
      "Market Capitalization BETWEEN 500 AND 5000 AND Sales growth 3Years > 25",
    description: "Small cap companies with high growth",
  },
  "Large Cap Stable": {
    query: "Market Capitalization > 50000 AND Beta < 1.2 AND ROE > 12",
    description: "Large stable companies with consistent returns",
  },
  "Turnaround Stories": {
    query: "Return over 1year > 50 AND Profit Growth 1Year > 100 AND PE < 25",
    description: "Companies showing strong recovery",
  },
  "Cash Rich Companies": {
    query: "Cash and Equivalents > Total Debt AND Free Cash Flow > 200",
    description: "Companies with strong cash positions",
  },
};

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

// Search function for auto-completion
export const searchSuggestions = (
  input: string,
  cursorPosition: number
): QuerySuggestion[] => {
  const suggestions: QuerySuggestion[] = [];

  // Get the current word being typed
  const beforeCursor = input.substring(0, cursorPosition);
  const words = beforeCursor.split(/\s+/);
  const currentWord = words[words.length - 1]?.toLowerCase() || "";

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
const isArithmeticExpression = (text: string): boolean => {
  return /[+\-*/]/.test(text);
};

// Enhanced query validation that properly handles multi-word field names and multi-line queries
export const validateQuery = (query: string): QueryValidationError[] => {
  const errors: QueryValidationError[] = [];
  const lines = query.split("\n");
  const fieldNames = getAllFields().map((f) => f.name);

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

    // Split by AND/OR to get individual conditions
    const conditions = trimmedLine.split(/\s+(AND|OR)\s+/i);

    conditions.forEach((condition) => {
      // Skip the AND/OR operators themselves
      if (["AND", "OR"].includes(condition.toUpperCase())) return;

      const conditionTrimmed = condition.trim();
      if (!conditionTrimmed) return;

      // Find operator in this condition
      const operatorMatch = conditionTrimmed.match(/(>=|<=|!=|>|<|=)/);

      if (!operatorMatch) {
        // No operator found - decide if this is a known or unknown field fragment
        if (conditionTrimmed.length > 0) {
          const isKnownField = fieldNames.some(
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
        const isValidField = fieldNames.some(
          (field) => field.toLowerCase() === fieldPart.toLowerCase()
        );

        if (!isValidField && !isArithmetic) {
          // Try to find a close match
          const closeMatch = fieldNames.find((field) => {
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

            return inputWords.every((inputWord) =>
              fieldWords.some(
                (fieldWord) =>
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

      // Validate value
      if (!valuePart) {
        errors.push({
          line: lineIndex + 1,
          column: trimmedLine.indexOf(operator) + operator.length + 1,
          message: `Operator "${operator}" needs a value after it`,
          severity: "error",
        });
      } else {
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
  const operatorSymbols = OPERATORS.map((o) => o.symbol);
  const functionNames = FUNCTIONS.map((f) => f.name);

  // Better tokenization that preserves spacing and handles multi-character operators
  const regex =
    /(\s+|>=|<=|!=|AND|OR|NOT|[()><=]|\w+(?:\s+\w+)*|\d+(?:\.\d+)?|[^\w\s()><=])/g;
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
    } else if (fieldNames.includes(matchedText)) {
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
      const partialMatch = fieldNames.find((name) =>
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
