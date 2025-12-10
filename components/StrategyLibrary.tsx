"use client";

import React, { useState, useMemo } from "react";
import { Search, Code, Replace, Plus, AlertTriangle, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

// --- Types ---
type Strategy = {
  id: number;
  category: string;
  name: string;
  description: string;
  logic: string;
};

// --- Data Source ---
const PRESET_SCREENS: Strategy[] = [
  // I. Value Investing Screens
  {
    id: 1,
    category: "Value",
    name: "Classic Low P/E",
    description: "Companies with a Price-to-Earnings ratio below 15.",
    logic: "PE_TTM < 15",
  },
  {
    id: 2,
    category: "Value",
    name: "Low P/B (Book Value)",
    description:
      "Stocks trading below their book value (assets - liabilities).",
    logic: "Price_to_Book < 1",
  },
  {
    id: 3,
    category: "Value",
    name: "Graham’s Net-Net",
    description: "Stocks trading below their Net Current Asset Value (NCAV).",
    logic: "Price < ((CurrentAssets - TotalLiabilities) / SharesOutstanding)",
  },
  {
    id: 4,
    category: "Value",
    name: "Low PEG Ratio",
    description: "Undervalued relative to growth rate (PEG < 1).",
    logic: "(PE_TTM / EPS_Growth_5Y) < 1",
  },
  {
    id: 5,
    category: "Value",
    name: "High Free Cash Flow Yield",
    description: "FCF Yield > 10%, indicating a cash cow.",
    logic: "(FreeCashFlow_TTM / MarketCap) > 0.10",
  },
  {
    id: 6,
    category: "Value",
    name: "Magic Formula (Greenblatt)",
    description: "High Return on Capital + High Earnings Yield.",
    logic:
      "Rank(EBIT / EnterpriseValue) + Rank(EBIT / (NetFixedAssets + WorkingCapital))",
  },
  {
    id: 7,
    category: "Value",
    name: "Low EV/EBITDA",
    description: "Cheap relative to operating earnings (enterprise value).",
    logic: "(EnterpriseValue / EBITDA_TTM) < 8",
  },
  {
    id: 8,
    category: "Value",
    name: "Negative Enterprise Value",
    description: "Cash on hand exceeds market cap + debt.",
    logic: "(MarketCap + TotalDebt - CashAndEquivalents) < 0",
  },
  {
    id: 9,
    category: "Value",
    name: "Double Net Value",
    description: "Trading at 2x Net Current Assets (less strict than Net-Net).",
    logic:
      "Price < 2 * ((CurrentAssets - TotalLiabilities) / SharesOutstanding)",
  },
  {
    id: 10,
    category: "Value",
    name: "O'Shaughnessy Value",
    description: "Large caps with strong cash flow and high dividend yield.",
    logic:
      "MarketCap > 10B AND Price_to_CashFlow < Industry_Avg AND Div_Yield > Industry_Avg",
  },
  {
    id: 11,
    category: "Value",
    name: "Dreman Contrarian",
    description: "Low P/E stocks with recent positive earnings surprises.",
    logic: "PE_TTM < (Market_PE * 0.8) AND Earnings_Surprise_Last_Q > 0",
  },
  {
    id: 12,
    category: "Value",
    name: "Piotroski F-Score > 7",
    description: "High quality value stocks (9-point scoring system).",
    logic: "Piotroski_Score >= 8",
  },
  {
    id: 13,
    category: "Value",
    name: "Price to Sales Value",
    description: "Stocks trading for less than 1x annual revenue.",
    logic: "Price_to_Sales_TTM < 1",
  },
  {
    id: 14,
    category: "Value",
    name: "Dividend Value",
    description: "Yield > 4% and P/E < 15.",
    logic: "Div_Yield > 0.04 AND PE_TTM < 15",
  },
  {
    id: 15,
    category: "Value",
    name: "Zombie Companies",
    description: "(Short Screen) Low interest coverage, high debt.",
    logic: "EBIT_TTM < Interest_Expense_TTM AND Debt_to_Equity > 2",
  },
  {
    id: 16,
    category: "Value",
    name: "Acquirer’s Multiple",
    description: "Deep value based on operating earnings.",
    logic: "Sort_Ascending(EnterpriseValue / OperatingEarnings)",
  },
  {
    id: 17,
    category: "Value",
    name: "Tangible Book Value",
    description: "Trading below the value of hard assets (no goodwill).",
    logic: "Price < (Tangible_Book_Value_Per_Share)",
  },
  {
    id: 18,
    category: "Value",
    name: "Buffett-Hagstrom",
    description: "High ROE, Low Debt, Positive FCF.",
    logic: "ROE > 0.15 AND Debt_to_Equity < 0.5 AND FCF > 0",
  },
  {
    id: 19,
    category: "Value",
    name: "NCAV Profitable",
    description: "Net-Nets that are actually making money.",
    logic: "Price < NCAV AND Net_Income_TTM > 0",
  },
  {
    id: 20,
    category: "Value",
    name: "Distressed Value",
    description: "Price down 50% but Book Value intact.",
    logic: "Price_Change_52W < -0.50 AND Price_to_Book < 1",
  },

  // II. Growth Investing Screens
  {
    id: 21,
    category: "Growth",
    name: "High EPS Growth",
    description: "Annual EPS growth > 25% for past 3 years.",
    logic: "EPS_Growth_3Y_CAGR > 0.25",
  },
  {
    id: 22,
    category: "Growth",
    name: "CAN SLIM (O'Neil)",
    description: "High Qtrly Growth, Recent Highs, Strong Float.",
    logic:
      "EPS_Growth_QoQ > 0.25 AND Sales_Growth_QoQ > 0.25 AND Price > 0.9 * High_52W",
  },
  {
    id: 23,
    category: "Growth",
    name: "Aggressive Sales Growth",
    description: "Revenue growing > 40% YoY.",
    logic: "Revenue_Growth_YoY > 0.40",
  },
  {
    id: 24,
    category: "Growth",
    name: "GARP (Growth at Reasonable Price)",
    description: "PEG ratio between 0.5 and 1.5 with >15% growth.",
    logic: "PEG >= 0.5 AND PEG <= 1.5 AND EPS_Growth_5Y > 0.15",
  },
  {
    id: 25,
    category: "Growth",
    name: "Rule of 40 (SaaS)",
    description: "Revenue Growth + Profit Margin > 40%.",
    logic: "(Revenue_Growth_YoY * 100) + (Net_Profit_Margin * 100) > 40",
  },
  {
    id: 26,
    category: "Growth",
    name: "Consistent Growers",
    description: "Positive EPS growth every year for 5 years.",
    logic: "EPS_Y1 > EPS_Y2 AND EPS_Y2 > EPS_Y3 ... (for 5 yrs)",
  },
  {
    id: 27,
    category: "Growth",
    name: "IPO Breakouts",
    description: "IPO within last 2 years + New Highs.",
    logic: "Days_Since_IPO < 730 AND Price >= 0.98 * High_AllTime",
  },
  {
    id: 28,
    category: "Growth",
    name: "Earnings Acceleration",
    description: "Current Qtr EPS Growth > Previous Qtr Growth.",
    logic: "EPS_Growth_QoQ > EPS_Growth_QoQ_Prev",
  },
  {
    id: 29,
    category: "Growth",
    name: "High ROE Growth",
    description: "Return on Equity > 20% and Growing.",
    logic: "ROE_TTM > 0.20 AND ROE_TTM > ROE_5Y_Avg",
  },
  {
    id: 30,
    category: "Growth",
    name: "Analyst Upgrades",
    description: 'Stocks with recent "Strong Buy" upgrades.',
    logic: "Analyst_Rating_Change_1M > 0 AND Current_Rating <= 1.5",
  },
  {
    id: 31,
    category: "Growth",
    name: "Future Growth",
    description: "Projected earnings growth > 20%.",
    logic: "EPS_Est_Growth_Next_Y > 0.20",
  },
  {
    id: 32,
    category: "Growth",
    name: "Quality Growth",
    description: "High Growth + Low Debt.",
    logic: "EPS_Growth_3Y > 0.20 AND Debt_to_Equity < 0.3",
  },
  {
    id: 33,
    category: "Growth",
    name: "Tenbagger Potential",
    description: "Small Cap, High Sales Growth, High Gross Margin.",
    logic: "MarketCap < 2B AND Sales_Growth_3Y > 0.30 AND Gross_Margin > 0.50",
  },
  {
    id: 34,
    category: "Growth",
    name: "Momentum Growth",
    description: "Top 10% Relative Strength + High Growth.",
    logic: "Relative_Strength_Rating > 90 AND EPS_Growth_TTM > 0.25",
  },
  {
    id: 35,
    category: "Growth",
    name: "Sustainable Growth",
    description: "Retention Ratio * ROE (Internal growth rate).",
    logic: "(1 - Payout_Ratio) * ROE > 0.15",
  },
  {
    id: 36,
    category: "Growth",
    name: "Turnaround Growth",
    description: "Positive EPS this Qtr vs Negative Last Year.",
    logic: "EPS_Q_Current > 0 AND EPS_Q_SameQ_LastYear < 0",
  },
  {
    id: 37,
    category: "Growth",
    name: "Triple Digit Growth",
    description: "Sales or Earnings growing > 100%.",
    logic: "Sales_Growth_QoQ > 1.0 OR EPS_Growth_QoQ > 1.0",
  },
  {
    id: 38,
    category: "Growth",
    name: "Margin Expansion",
    description: "Profit margins increasing sequentially.",
    logic: "Operating_Margin_Q_Current > Operating_Margin_Q_Prev",
  },
  {
    id: 39,
    category: "Growth",
    name: "Small Cap Growth",
    description: "Market Cap < $2B with > 20% growth.",
    logic: "MarketCap < 2000000000 AND EPS_Growth_TTM > 0.20",
  },
  {
    id: 40,
    category: "Growth",
    name: "Insider Buying Growth",
    description: "Growth stocks where insiders are buying.",
    logic: "EPS_Growth_TTM > 0.15 AND Net_Insider_Shares_Purchased_3M > 0",
  },

  // III. Momentum & Trend Screens
  {
    id: 41,
    category: "Momentum",
    name: "Golden Crossover",
    description: "50-day SMA crosses above 200-day SMA.",
    logic: "SMA(50) > SMA(200) AND Prev_SMA(50) <= Prev_SMA(200)",
  },
  {
    id: 42,
    category: "Momentum",
    name: "52-Week High",
    description: "Price within 5% of 52-week high.",
    logic: "Price >= 0.95 * High_52W",
  },
  {
    id: 43,
    category: "Momentum",
    name: "High Relative Strength (RSI)",
    description: "RSI > 70 (Strong momentum).",
    logic: "RSI(14) > 70",
  },
  {
    id: 44,
    category: "Momentum",
    name: "Trend Template (Minervini)",
    description: "Stacking MAs (Price > 50 > 150 > 200).",
    logic: "Price > SMA(50) AND SMA(50) > SMA(150) AND SMA(150) > SMA(200)",
  },
  {
    id: 45,
    category: "Momentum",
    name: "Volume Breakout",
    description: "Volume > 3x Average Volume.",
    logic: "Volume_Today > (3 * SMA_Volume(20))",
  },
  {
    id: 46,
    category: "Momentum",
    name: "MACD Bullish Cross",
    description: "MACD line crosses above Signal line.",
    logic: "MACD_Line > Signal_Line AND Prev_MACD_Line <= Prev_Signal_Line",
  },
  {
    id: 47,
    category: "Momentum",
    name: "Three White Soldiers",
    description: "3 Consecutive days of higher highs/closes.",
    logic: "Close > Open AND Close > Prev_Close AND Prev_Close > Prev2_Close",
  },
  {
    id: 48,
    category: "Momentum",
    name: "Gap Up",
    description: "Opening price > Yesterday's High.",
    logic: "Open > Prev_High",
  },
  {
    id: 49,
    category: "Momentum",
    name: "Parabolic SAR Buy",
    description: "Price crosses above Parabolic SAR.",
    logic: "Price > SAR AND Prev_Price <= Prev_SAR",
  },
  {
    id: 50,
    category: "Momentum",
    name: "ADX Trend",
    description: "Strong Trend (ADX > 25) + Uptrend (DI+ > DI-).",
    logic: "ADX(14) > 25 AND DI_Plus > DI_Minus",
  },
  {
    id: 51,
    category: "Momentum",
    name: "Camelback",
    description: "EMA(40) rising, Price in top range.",
    logic: "Slope(EMA(40)) > 0 AND Price > EMA(15)",
  },
  {
    id: 52,
    category: "Momentum",
    name: "Pocket Pivot",
    description: "Vol > Largest down vol in 10 days, emerging from base.",
    logic: "Volume > Max(Down_Volume_10D) AND Price > SMA(10)",
  },
  {
    id: 53,
    category: "Momentum",
    name: "Code Red (Momo)",
    description: "Price > SMA(10) > SMA(20) and RSI > 60.",
    logic: "Price > SMA(10) AND SMA(10) > SMA(20) AND RSI(14) > 60",
  },
  {
    id: 54,
    category: "Momentum",
    name: "Short Squeeze",
    description: "High Short Float + Price Increase.",
    logic: "Short_Float > 0.20 AND Price_Change_5D > 0.10",
  },
  {
    id: 55,
    category: "Momentum",
    name: "Ascending Triangle",
    description: "Flat resistance, rising lows.",
    logic: "Resistance_Touch_Count >= 3 AND Trendline_Slope_Lows > 0",
  },
  {
    id: 56,
    category: "Momentum",
    name: "Turtle Trading (Donchian)",
    description: "New 20-day High.",
    logic: "Price > Max_High(20)",
  },
  {
    id: 57,
    category: "Momentum",
    name: "Percent from SMA",
    description: "Price extended > 20% above 200 SMA.",
    logic: "Price > (SMA(200) * 1.20)",
  },
  {
    id: 58,
    category: "Momentum",
    name: "Force Index Bull",
    description: "Force Index (13) > 0 and rising.",
    logic: "ForceIndex(13) > 0 AND ForceIndex(13) > Prev_ForceIndex(13)",
  },
  {
    id: 59,
    category: "Momentum",
    name: "Ichimoku Cloud Break",
    description: "Price breaking above Kumo Cloud.",
    logic: "Price > Senkou_Span_A AND Price > Senkou_Span_B",
  },
  {
    id: 60,
    category: "Momentum",
    name: "Momentum Crash",
    description: "(Short) Momentum stocks starting to breakdown.",
    logic: "RSI(14) < 50 AND Price < SMA(50) AND Prev_Price > SMA(50)",
  },

  // IV. Technical Volatility & Reversal Screens
  {
    id: 61,
    category: "Technical",
    name: "RSI Oversold",
    description: "RSI < 30 (Potential bounce).",
    logic: "RSI(14) < 30",
  },
  {
    id: 62,
    category: "Technical",
    name: "Bollinger Squeeze",
    description: "Bandwidth at 6-month low (Explosive move pending).",
    logic: "(UpperBand - LowerBand) / SMA(20) < Min_Bandwidth_6M",
  },
  {
    id: 63,
    category: "Technical",
    name: "Bollinger Band Breakout",
    description: "Price closes above Upper Bollinger Band.",
    logic: "Close > UpperBand_2_StdDev",
  },
  {
    id: 64,
    category: "Technical",
    name: "Death Cross",
    description: "(Short) 50 SMA crosses below 200 SMA.",
    logic: "SMA(50) < SMA(200) AND Prev_SMA(50) >= Prev_SMA(200)",
  },
  {
    id: 65,
    category: "Technical",
    name: "Inside Day",
    description: "High < Prev High AND Low > Prev Low.",
    logic: "High < Prev_High AND Low > Prev_Low",
  },
  {
    id: 66,
    category: "Technical",
    name: "NR7 (Narrow Range 7)",
    description: "Today's range is smallest of last 7 days.",
    logic: "(High - Low) < Min_Range_Last_7_Days",
  },
  {
    id: 67,
    category: "Technical",
    name: "Oversold Bounce",
    description: "Price < Lower Bollinger Band + RSI < 30.",
    logic: "Close < LowerBand_2_StdDev AND RSI(14) < 30",
  },
  {
    id: 68,
    category: "Technical",
    name: "Double Bottom",
    description: "Price hits same low twice.",
    logic: "Abs(Low_1 - Low_2) < (Price * 0.01) AND Time_Diff > 20_Days",
  },
  {
    id: 69,
    category: "Technical",
    name: "Hammer Candle",
    description: "Bullish reversal candle (long lower wick).",
    logic: "(Min(Open, Close) - Low) > 2 * (High - Max(Open, Close))",
  },
  {
    id: 70,
    category: "Technical",
    name: "Doji Star",
    description: "Open and Close virtually equal (Indecision).",
    logic: "Abs(Open - Close) <= (High - Low) * 0.1",
  },
  {
    id: 71,
    category: "Technical",
    name: "MFI Oversold",
    description: "Money Flow Index < 20 (Volume weighted RSI).",
    logic: "MFI(14) < 20",
  },
  {
    id: 72,
    category: "Technical",
    name: "Williams %R Oversold",
    description: "Williams %R < -80.",
    logic: "Williams_R < -80",
  },
  {
    id: 73,
    category: "Technical",
    name: "Stochastic Bullish",
    description: "%K crosses above %D in oversold territory.",
    logic: "K < 20 AND D < 20 AND K > D AND Prev_K <= Prev_D",
  },
  {
    id: 74,
    category: "Technical",
    name: "CCI Reversal",
    description: "CCI moves from below -100 to above -100.",
    logic: "CCI(20) > -100 AND Prev_CCI(20) < -100",
  },
  {
    id: 75,
    category: "Technical",
    name: "V-Shape Recovery",
    description: "Sharp drop followed by sharp rise.",
    logic: "Price_Change_3D > 0.10 AND Price_Change_10D < -0.10",
  },
  {
    id: 76,
    category: "Technical",
    name: "Keltner Channel Long",
    description: "Price closes above Upper Keltner Channel.",
    logic: "Close > (EMA(20) + (2 * ATR(10)))",
  },
  {
    id: 77,
    category: "Technical",
    name: "ATR Explosion",
    description: "ATR rising sharply (Volatility expanding).",
    logic: "ATR(14) > SMA(ATR(14), 20) * 1.5",
  },
  {
    id: 78,
    category: "Technical",
    name: "Gap Fill",
    description: "Price enters previous Gap zone.",
    logic: "High > Gap_Low AND Low < Gap_High",
  },
  {
    id: 79,
    category: "Technical",
    name: "Pullback to 50 SMA",
    description: "Uptrend stock touching 50 SMA.",
    logic: "Price > SMA(200) AND Low <= SMA(50) AND Close >= SMA(50)",
  },
  {
    id: 80,
    category: "Technical",
    name: "Bull Flag",
    description: "Strong uptrend + Low Vol Consolidation.",
    logic: "Trend_30D > 20% AND RSI(14) < 60 AND Volume < SMA_Vol(20)",
  },

  // V. Income & Dividend Screens
  {
    id: 81,
    category: "Income",
    name: "Dividend Aristocrats",
    description: "Growing dividends for 25+ years.",
    logic: "Consecutive_Dividend_Growth_Years >= 25",
  },
  {
    id: 82,
    category: "Income",
    name: "High Yield Safety",
    description: "Yield > 5% but Payout Ratio < 60%.",
    logic: "Div_Yield > 0.05 AND Payout_Ratio < 0.60",
  },
  {
    id: 83,
    category: "Income",
    name: "Dogs of the Dow",
    description: "Top 10 highest yielders in DJIA.",
    logic: "Index == 'DJIA' AND Rank_Desc(Div_Yield) <= 10",
  },
  {
    id: 84,
    category: "Income",
    name: "Dividend Growth",
    description: "5-Year Div Growth Rate > 10%.",
    logic: "Div_Growth_Rate_5Y > 0.10",
  },
  {
    id: 85,
    category: "Income",
    name: "Monthly Payers",
    description: "Stocks paying dividends monthly.",
    logic: "Dividend_Frequency == 'Monthly'",
  },
  {
    id: 86,
    category: "Income",
    name: "High Yield Low Beta",
    description: "Yield > 4% AND Beta < 0.8 (Low volatility).",
    logic: "Div_Yield > 0.04 AND Beta < 0.8",
  },
  {
    id: 87,
    category: "Income",
    name: "Coverage Kings",
    description: "Cash Flow covers Dividend > 2x.",
    logic: "FreeCashFlow_Per_Share > (2 * Dividend_Per_Share)",
  },
  {
    id: 88,
    category: "Income",
    name: "Preferred Stock Proxy",
    description: "Utility stocks with Yield > 4% and Beta < 0.5.",
    logic: "Sector == 'Utilities' AND Div_Yield > 0.04 AND Beta < 0.5",
  },
  {
    id: 89,
    category: "Income",
    name: "Buyback Yield",
    description: "Share buyback yield > 5%.",
    logic: "(Net_Buybacks_TTM / MarketCap) > 0.05",
  },
  {
    id: 90,
    category: "Income",
    name: "Shareholder Yield",
    description: "Dividend Yield + Buyback Yield.",
    logic: "(Div_Yield + Buyback_Yield) > 0.08",
  },

  // VI. Fundamental Health & Miscellaneous Screens
  {
    id: 91,
    category: "Fundamental",
    name: "Altman Z-Score",
    description: "Score < 1.8 indicates bankruptcy risk.",
    logic: "Altman_Z_Score < 1.8",
  },
  {
    id: 92,
    category: "Fundamental",
    name: "Beneish M-Score",
    description: "Probability of earnings manipulation.",
    logic: "Beneish_M_Score > -1.78",
  },
  {
    id: 93,
    category: "Fundamental",
    name: "Institutional Favors",
    description: "Institutional ownership > 70%.",
    logic: "Inst_Ownership > 0.70",
  },
  {
    id: 94,
    category: "Fundamental",
    name: "Founder Led",
    description: "Founder is CEO (Proxy via insider own).",
    logic: "Insider_Ownership > 0.10",
  },
  {
    id: 95,
    category: "Fundamental",
    name: "Widow & Orphan",
    description: "Low Beta, High Yield, Large Cap.",
    logic: "Beta < 0.7 AND Div_Yield > 0.03 AND MarketCap > 50B",
  },
  {
    id: 96,
    category: "Fundamental",
    name: "Debt-Free",
    description: "Zero long-term debt.",
    logic: "Long_Term_Debt == 0",
  },
  {
    id: 97,
    category: "Fundamental",
    name: "High Gross Margin",
    description: "Competitive advantage proxy (Margin > 60%).",
    logic: "Gross_Margin > 0.60",
  },
  {
    id: 98,
    category: "Fundamental",
    name: "Efficient Operators",
    description: "Inventory Turnover > Industry Avg.",
    logic: "Inventory_Turnover > Industry_Avg_Inventory_Turnover",
  },
  {
    id: 99,
    category: "Fundamental",
    name: "Liquid Caps",
    description: "Highly liquid large caps (for day trading).",
    logic: "MarketCap > 20B AND Avg_Volume_30D > 5000000",
  },
  {
    id: 100,
    category: "Fundamental",
    name: "Penny Stock Movers",
    description: "Price < $5 and Volume > 2x Avg.",
    logic: "Price < 5 AND Volume > (2 * SMA_Volume(20))",
  },
];

const CATEGORIES = [
  "All",
  "Value",
  "Growth",
  "Momentum",
  "Technical",
  "Income",
  "Fundamental",
];

interface StrategyLibraryProps {
  onOverwrite?: (logic: string) => void;
  onAppend?: (logic: string, operator: "AND" | "OR") => void;
  // Legacy prop for backward compatibility
  onSelect?: (logic: string) => void;
}

export default function StrategyLibrary({
  onOverwrite,
  onAppend,
  onSelect,
}: StrategyLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Popup state
  const [showOverwriteConfirm, setShowOverwriteConfirm] = useState<
    number | null
  >(null);
  const [showAppendOptions, setShowAppendOptions] = useState<number | null>(
    null
  );

  const filteredStrategies = useMemo(() => {
    return PRESET_SCREENS.filter((strategy) => {
      const matchesSearch =
        strategy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        strategy.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || strategy.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleOverwrite = (logic: string) => {
    if (onOverwrite) {
      onOverwrite(logic);
    } else if (onSelect) {
      onSelect(logic);
    }
    setShowOverwriteConfirm(null);
  };

  const handleAppend = (logic: string, operator: "AND" | "OR") => {
    if (onAppend) {
      onAppend(logic, operator);
    }
    setShowAppendOptions(null);
  };

  return (
    <div className="w-full space-y-10 font-sans">
      {/* Header Section */}
      <div className="space-y-8">
        <div className="max-w-3xl">
          <p className="text-lg text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
            Browse 100+ proven stock screens based on fundamental and technical
            strategies. Select a strategy to load it into the query builder.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          <div className="relative w-full lg:w-96 group">
            <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Search strategies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-base shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 border ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white border-blue-600 shadow-md"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-500"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredStrategies.map((strategy) => (
          <Card
            key={strategy.id}
            className="group flex flex-col h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50"
          >
            <CardHeader className="pb-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-bold text-lg leading-tight text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                  {strategy.name}
                </h3>
                <Badge
                  variant="secondary"
                  className="shrink-0 font-medium text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
                >
                  {strategy.category}
                </Badge>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[2.5rem] leading-relaxed">
                {strategy.description}
              </p>
            </CardHeader>
            <CardContent className="flex-1 pb-4">
              <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-4 font-mono text-xs text-emerald-400 border border-slate-700 dark:border-slate-800 overflow-hidden relative group/code shadow-inner">
                <div className="absolute top-2 right-2 opacity-0 group-hover/code:opacity-100 transition-opacity bg-slate-800 p-1 rounded">
                  <Code className="w-3 h-3 text-slate-400" />
                </div>
                <p className="line-clamp-3 break-all leading-relaxed">
                  {strategy.logic}
                </p>
              </div>
            </CardContent>
            <CardFooter className="pt-0 pb-6 px-6">
              <div className="w-full space-y-2">
                {/* Button Row */}
                <div className="flex gap-2">
                  {/* Add to Query Button (Overwrite) */}
                  <div className="relative flex-1">
                    <button
                      onClick={() =>
                        setShowOverwriteConfirm(
                          showOverwriteConfirm === strategy.id
                            ? null
                            : strategy.id
                        )
                      }
                      className="w-full inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-blue-600 hover:text-white hover:border-blue-600 h-10 px-3 py-2 shadow-sm"
                    >
                      <Replace className="w-4 h-4 mr-1.5" />
                      Add to Query
                    </button>

                    {/* Overwrite Confirmation Popup */}
                    {showOverwriteConfirm === strategy.id && (
                      <div className="absolute bottom-full left-0 right-0 mb-2 z-50 animate-in fade-in-0 zoom-in-95 duration-200">
                        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 shadow-xl p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 dark:text-white">
                                Replace current query?
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                This will overwrite your existing query in the
                                builder.
                              </p>
                            </div>
                            <button
                              onClick={() => setShowOverwriteConfirm(null)}
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => setShowOverwriteConfirm(null)}
                              className="flex-1 h-8 px-3 text-xs font-medium rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleOverwrite(strategy.logic)}
                              className="flex-1 h-8 px-3 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                            >
                              Replace
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Append Button */}
                  <div className="relative flex-1">
                    <button
                      onClick={() =>
                        setShowAppendOptions(
                          showAppendOptions === strategy.id ? null : strategy.id
                        )
                      }
                      className="w-full inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 border border-emerald-300 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 h-10 px-3 py-2 shadow-sm"
                    >
                      <Plus className="w-4 h-4 mr-1.5" />
                      Append
                    </button>

                    {/* Append Options Popup */}
                    {showAppendOptions === strategy.id && (
                      <div className="absolute bottom-full left-0 right-0 mb-2 z-50 animate-in fade-in-0 zoom-in-95 duration-200">
                        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 shadow-xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              Choose operator
                            </p>
                            <button
                              onClick={() => setShowAppendOptions(null)}
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                            How should this be combined with your existing
                            query?
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleAppend(strategy.logic, "AND")
                              }
                              className="flex-1 h-9 px-3 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                            >
                              AND
                            </button>
                            <button
                              onClick={() => handleAppend(strategy.logic, "OR")}
                              className="flex-1 h-9 px-3 text-sm font-medium rounded-md bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                            >
                              OR
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredStrategies.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Search className="w-8 h-8 text-slate-400 dark:text-slate-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              No strategies found
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              We couldn&apos;t find any strategies matching &quot;{searchQuery}
              &quot; in {selectedCategory}.
            </p>
          </div>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
            }}
            className="mt-2 text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
