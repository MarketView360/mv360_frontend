"use client";

import React, { useState, useMemo } from "react";
import { Search, Code, Replace, Plus, AlertTriangle, X, Ban, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

// --- Types ---
type FeasibilityStatus = "full" | "partial" | "none";

type Strategy = {
  id: number;
  category: string;
  name: string;
  description: string;
  logic: string;
  /** EODHD API feasibility: full = works, partial = some fields missing, none = not possible */
  feasibility?: FeasibilityStatus;
  /** Note explaining why strategy may not work or what fields are missing */
  feasibilityNote?: string;
};

// --- Data Source ---
const PRESET_SCREENS: Strategy[] = [
  // I. Value Investing Screens
  {
    id: 1,
    category: "Value",
    name: "Classic Low P/E",
    description: "Companies with a Price-to-Earnings ratio below 15.",
    logic: "PE < 15",
    feasibility: "full",
  },
  {
    id: 2,
    category: "Value",
    name: "Low P/B (Book Value)",
    description:
      "Stocks trading below their book value (assets - liabilities).",
    logic: "PB < 1",
    feasibility: "full",
  },
  {
    id: 3,
    category: "Value",
    name: "Graham’s Net-Net",
    description: "Stocks trading below their Net Current Asset Value (NCAV).",
    logic: "PB < 0.5 AND Current Ratio > 2",
    feasibility: "partial",
    feasibilityNote: "Using P/B and current ratio as proxy - full NCAV calculation unavailable",
  },
  {
    id: 4,
    category: "Value",
    name: "Low PEG Ratio",
    description: "Undervalued relative to growth rate (PEG < 1).",
    logic: "PEG < 1",
    feasibility: "full",
  },
  {
    id: 5,
    category: "Value",
    name: "High Free Cash Flow Yield",
    description: "FCF Yield > 10%, indicating a cash cow.",
    logic: "Free Cash Flow > 0 AND PE < 10 AND CF Margin > 10",
    feasibility: "partial",
    feasibilityNote: "Using PE and CF margin as proxy for FCF yield",
  },
  {
    id: 6,
    category: "Value",
    name: "Magic Formula (Greenblatt)",
    description: "High Return on Capital + High Earnings Yield.",
    logic: "ROCE > 15 AND PE < 10",
    feasibility: "partial",
    feasibilityNote: "Simplified: uses ROCE and low P/E instead of ranking",
  },
  {
    id: 7,
    category: "Value",
    name: "Low EV/EBITDA",
    description: "Cheap relative to operating earnings (enterprise value).",
    logic: "EV EBITDA < 8",
    feasibility: "full",
  },
  {
    id: 8,
    category: "Value",
    name: "Negative Enterprise Value",
    description: "Cash on hand exceeds market cap + debt.",
    logic: "EV EBITDA < 0",
    feasibility: "partial",
    feasibilityNote: "Using negative EV/EBITDA as proxy - enterprise value field unavailable",
  },
  {
    id: 9,
    category: "Value",
    name: "Double Net Value",
    description: "Trading at 2x Net Current Assets (less strict than Net-Net).",
    logic: "PB < 0.5",
    feasibility: "partial",
    feasibilityNote: "Using low P/B as proxy - balance sheet details unavailable",
  },
  {
    id: 10,
    category: "Value",
    name: "O'Shaughnessy Value",
    description: "Large caps with strong cash flow and high dividend yield.",
    logic: "Market Cap > 10000000000 AND Price to Cash Flow < 10 AND Dividend Yield > 3",
    feasibility: "full",
  },
  {
    id: 11,
    category: "Value",
    name: "Dreman Contrarian",
    description: "Low P/E stocks with recent positive earnings surprises.",
    logic: "PE < 12 AND Profit Growth 1Y > 0",
    feasibility: "partial",
    feasibilityNote: "Using annual profit growth - quarterly earnings growth unavailable",
  },
  {
    id: 12,
    category: "Value",
    name: "Piotroski F-Score > 7",
    description: "High quality value stocks (9-point scoring system).",
    logic: "ROA > 5 AND Operating Cash Flow > 0 AND Debt to Equity < 0.5 AND Current Ratio > 1",
    feasibility: "partial",
    feasibilityNote: "Using quality metrics as proxy - Piotroski score requires manual calculation",
  },
  {
    id: 13,
    category: "Value",
    name: "Price to Sales Value",
    description: "Stocks trading for less than 1x annual revenue.",
    logic: "Price to Sales < 1",
    feasibility: "full",
  },
  {
    id: 14,
    category: "Value",
    name: "Dividend Value",
    description: "Yield > 4% and P/E < 15.",
    logic: "Dividend Yield > 4 AND PE < 15",
    feasibility: "full",
  },
  {
    id: 15,
    category: "Value",
    name: "Zombie Companies",
    description: "(Short Screen) Low interest coverage, high debt.",
    logic: "Interest Coverage < 1 AND Debt to Equity > 2",
    feasibility: "full",
  },
  {
    id: 16,
    category: "Value",
    name: "Acquirer’s Multiple",
    description: "Deep value based on operating earnings.",
    logic: "EV EBITDA < 6 AND EV EBITDA > 0",
    feasibility: "partial",
    feasibilityNote: "Using EV/EBITDA as proxy - ranking not supported",
  },
  {
    id: 17,
    category: "Value",
    name: "Tangible Book Value",
    description: "Trading below the value of hard assets (no goodwill).",
    logic: "PB < 0.8",
    feasibility: "partial",
    feasibilityNote: "Using P/B as proxy - tangible book not available",
  },
  {
    id: 18,
    category: "Value",
    name: "Buffett-Hagstrom",
    description: "High ROE, Low Debt, Positive FCF.",
    logic: "ROE > 15 AND Debt to Equity < 0.5 AND Free Cash Flow > 0",
    feasibility: "full",
  },
  {
    id: 19,
    category: "Value",
    name: "NCAV Profitable",
    description: "Net-Nets that are actually making money.",
    logic: "PB < 0.7 AND Earnings TTM > 0",
    feasibility: "partial",
    feasibilityNote: "Using low P/B as proxy for NCAV",
  },
  {
    id: 20,
    category: "Value",
    name: "Distressed Value",
    description: "Price down 50% but Book Value intact.",
    logic: "Price Change 1Y < -50 AND PB < 1",
    feasibility: "full",
  },

  // II. Growth Investing Screens
  {
    id: 21,
    category: "Growth",
    name: "High EPS Growth",
    description: "Annual EPS growth > 25% for past 3 years.",
    logic: "EPS Growth 3Y > 25",
    feasibility: "full",
  },
  {
    id: 22,
    category: "Growth",
    name: "CAN SLIM (O'Neil)",
    description: "High Qtrly Growth, Recent Highs, Strong Float.",
    logic: "Profit Growth 1Y > 0.25 AND Revenue Growth 1Y > 0.25 AND Down from 52W High < 10",
    feasibility: "partial",
    feasibilityNote: "Using annual growth metrics - quarterly data unavailable",
  },
  {
    id: 23,
    category: "Growth",
    name: "Aggressive Sales Growth",
    description: "Revenue growing > 40% YoY.",
    logic: "Revenue Growth 1Y > 40",
    feasibility: "full",
  },
  {
    id: 24,
    category: "Growth",
    name: "GARP (Growth at Reasonable Price)",
    description: "PEG ratio between 0.5 and 1.5 with >15% growth.",
    logic: "PEG >= 0.5 AND PEG <= 1.5 AND EPS Growth 3Y > 15",
    feasibility: "full",
  },
  {
    id: 25,
    category: "Growth",
    name: "Rule of 40 (SaaS)",
    description: "Revenue Growth + Profit Margin > 40%.",
    logic: "Revenue Growth 1Y > 20 AND Net Margin > 20",
    feasibility: "partial",
    feasibilityNote: "Using separate thresholds as proxy for sum > 40",
  },
  {
    id: 26,
    category: "Growth",
    name: "Consistent Growers",
    description: "Positive EPS growth every year for 5 years.",
    logic: "EPS Growth 3Y > 10 AND Profit Growth 5Y > 10",
    feasibility: "partial",
    feasibilityNote: "Using CAGR as proxy for consistent growth",
  },
  {
    id: 27,
    category: "Growth",
    name: "IPO Breakouts",
    description: "IPO within last 2 years + New Highs.",
    logic: "Price > MA200 AND Revenue Growth 1Y > 30",
    feasibility: "partial",
    feasibilityNote: "IPO date filtering not available - using growth proxy",
  },
  {
    id: 28,
    category: "Growth",
    name: "Earnings Acceleration",
    description: "Current Qtr EPS Growth > Previous Qtr Growth.",
    logic: "Profit Growth 1Y > 0.20 AND EPS Growth 3Y > 15",
    feasibility: "partial",
    feasibilityNote: "Using annual growth metrics - quarterly data unavailable",
  },
  {
    id: 29,
    category: "Growth",
    name: "High ROE Growth",
    description: "Return on Equity > 20% and Growing.",
    logic: "ROE > 20 AND Profit Growth 1Y > 0",
    feasibility: "full",
  },
  {
    id: 30,
    category: "Growth",
    name: "Analyst Upgrades",
    description: "Stocks with recent Strong Buy upgrades.",
    logic: "Forward PE > 0 AND PE > 0 AND Revenue Growth 1Y > 10",
    feasibility: "partial",
    feasibilityNote: "Analyst ratings unavailable - field comparison not supported, using growth proxy",
  },
  {
    id: 31,
    category: "Growth",
    name: "Future Growth",
    description: "Projected earnings growth > 20%.",
    logic: "PEG < 1 AND EPS Growth 3Y > 15",
    feasibility: "partial",
    feasibilityNote: "Using historical growth as proxy for projected growth",
  },
  {
    id: 32,
    category: "Growth",
    name: "Quality Growth",
    description: "High Growth + Low Debt.",
    logic: "EPS Growth 3Y > 20 AND Debt to Equity < 0.3",
    feasibility: "full",
  },
  {
    id: 33,
    category: "Growth",
    name: "Tenbagger Potential",
    description: "Small Cap, High Sales Growth, High Gross Margin.",
    logic: "Market Cap < 2000000000 AND Sales Growth 3Y > 30 AND OPM > 20",
    feasibility: "partial",
    feasibilityNote: "Using OPM as proxy for gross margin",
  },
  {
    id: 34,
    category: "Growth",
    name: "Momentum Growth",
    description: "Top 10% Relative Strength + High Growth.",
    logic: "Price > MA200 AND Price > MA50 AND EPS Growth 3Y > 25",
    feasibility: "partial",
    feasibilityNote: "Using MAs as proxy for relative strength rating",
  },
  {
    id: 35,
    category: "Growth",
    name: "Sustainable Growth",
    description: "Retention Ratio * ROE (Internal growth rate).",
    logic: "ROE > 15 AND Payout Ratio < 50",
    feasibility: "partial",
    feasibilityNote: "Simplified formula using ROE and payout ratio",
  },
  {
    id: 36,
    category: "Growth",
    name: "Turnaround Growth",
    description: "Positive EPS this Qtr vs Negative Last Year.",
    logic: "Profit Growth 1Y > 0.50 AND Earnings TTM > 0",
    feasibility: "partial",
    feasibilityNote: "Using annual profit growth - quarterly data unavailable",
  },
  {
    id: 37,
    category: "Growth",
    name: "Triple Digit Growth",
    description: "Sales or Earnings growing > 100%.",
    logic: "Revenue Growth 1Y > 100 OR Profit Growth 1Y > 100",
    feasibility: "full",
  },
  {
    id: 38,
    category: "Growth",
    name: "Margin Expansion",
    description: "Profit margins increasing sequentially.",
    logic: "OPM > 15 AND Profit Growth 1Y > 0",
    feasibility: "partial",
    feasibilityNote: "Field comparison unavailable - simplified to profit growth positive",
  },
  {
    id: 39,
    category: "Growth",
    name: "Small Cap Growth",
    description: "Market Cap < $2B with > 20% growth.",
    logic: "Market Cap < 2000000000 AND EPS Growth 3Y > 20",
    feasibility: "full",
  },
  {
    id: 40,
    category: "Growth",
    name: "Insider Buying Growth",
    description: "Growth stocks where insiders are buying.",
    logic: "EPS Growth 3Y > 15 AND ROE > 15",
    feasibility: "partial",
    feasibilityNote: "Insider transaction data unavailable - using quality proxy",
  },

  // III. Momentum & Trend Screens
  {
    id: 41,
    category: "Momentum",
    name: "Golden Crossover",
    description: "50-day SMA crosses above 200-day SMA.",
    logic: "MA50 > MA200",
    feasibility: "partial",
    feasibilityNote: "Shows current state - crossover event detection unavailable",
  },
  {
    id: 42,
    category: "Momentum",
    name: "52-Week High",
    description: "Price within 5% of 52-week high.",
    logic: "Down from 52W High < 5",
    feasibility: "full",
  },
  {
    id: 43,
    category: "Momentum",
    name: "High Relative Strength (RSI)",
    description: "RSI > 70 (Strong momentum).",
    logic: "RSI > 70",
    feasibility: "full",
  },
  {
    id: 44,
    category: "Momentum",
    name: "Trend Template (Minervini)",
    description: "Stacking MAs (Price > 50 > 200).",
    logic: "Price > MA50 AND MA50 > MA200",
    feasibility: "full",
  },
  {
    id: 45,
    category: "Momentum",
    name: "Volume Breakout",
    description: "Volume > 3x Average Volume.",
    logic: "Volume > 0 AND Avg Volume > 0",
    feasibility: "partial",
    feasibilityNote: "Volume spike detection simplified - manual verification needed",
  },
  {
    id: 46,
    category: "Momentum",
    name: "MACD Bullish Cross",
    description: "MACD line crosses above Signal line.",
    logic: "RSI > 50 AND Price > MA50",
    feasibility: "none",
    feasibilityNote: "MACD/Signal line data unavailable - showing momentum proxy",
  },
  {
    id: 47,
    category: "Momentum",
    name: "Three White Soldiers",
    description: "3 Consecutive days of higher highs/closes.",
    logic: "Price Change 1D > 0 AND RSI > 50",
    feasibility: "none",
    feasibilityNote: "Candlestick pattern detection unavailable - showing momentum proxy",
  },
  {
    id: 48,
    category: "Momentum",
    name: "Gap Up",
    description: "Opening price > Yesterday's High.",
    logic: "Price Change 1D > 2 AND Volume > 0",
    feasibility: "partial",
    feasibilityNote: "Open/High data unavailable - using price change proxy",
  },
  {
    id: 49,
    category: "Momentum",
    name: "Parabolic SAR Buy",
    description: "Price crosses above Parabolic SAR.",
    logic: "Price > MA50 AND RSI > 50",
    feasibility: "none",
    feasibilityNote: "Parabolic SAR unavailable - showing trend proxy",
  },
  {
    id: 50,
    category: "Momentum",
    name: "ADX Trend",
    description: "Strong Trend (ADX > 25) + Uptrend (DI+ > DI-).",
    logic: "Price > MA50 AND MA50 > MA200 AND RSI > 50",
    feasibility: "none",
    feasibilityNote: "ADX/DI unavailable - showing trend proxy",
  },
  {
    id: 51,
    category: "Momentum",
    name: "Camelback",
    description: "EMA(40) rising, Price in top range.",
    logic: "Price > MA50 AND Price Change 1Y > 0",
    feasibility: "partial",
    feasibilityNote: "EMA unavailable - using SMA and trend proxy",
  },
  {
    id: 52,
    category: "Momentum",
    name: "Pocket Pivot",
    description: "Vol > Largest down vol in 10 days, emerging from base.",
    logic: "Volume > 0 AND Price > MA50",
    feasibility: "partial",
    feasibilityNote: "Down volume unavailable - using volume spike proxy",
  },
  {
    id: 53,
    category: "Momentum",
    name: "Code Red (Momo)",
    description: "Price > SMA(20) > SMA(50) and RSI > 60.",
    logic: "Price > SMA20 AND Price > MA50 AND RSI > 60",
    feasibility: "partial",
    feasibilityNote: "Field comparison unavailable - simplified to price above both MAs",
  },
  {
    id: 54,
    category: "Momentum",
    name: "Short Squeeze",
    description: "High Short Float + Price Increase.",
    logic: "Price Change 1D > 5 AND Volume > 0",
    feasibility: "none",
    feasibilityNote: "Short interest data unavailable - using price momentum only",
  },
  {
    id: 55,
    category: "Momentum",
    name: "Ascending Triangle",
    description: "Flat resistance, rising lows.",
    logic: "Price > MA50 AND RSI > 50 AND RSI < 70",
    feasibility: "none",
    feasibilityNote: "Pattern recognition unavailable - showing consolidation proxy",
  },
  {
    id: 56,
    category: "Momentum",
    name: "Turtle Trading (Donchian)",
    description: "New 20-day High.",
    logic: "Down from 52W High < 2",
    feasibility: "partial",
    feasibilityNote: "20-day high unavailable - using 52-week high proximity",
  },
  {
    id: 57,
    category: "Momentum",
    name: "Percent from SMA",
    description: "Price extended > 20% above 200 SMA.",
    logic: "Up from 52W Low > 20 AND Price > MA200",
    feasibility: "full",
  },
  {
    id: 58,
    category: "Momentum",
    name: "Force Index Bull",
    description: "Force Index (13) > 0 and rising.",
    logic: "Volume > 0 AND Price Change 1D > 0",
    feasibility: "none",
    feasibilityNote: "Force Index unavailable - showing volume momentum proxy",
  },
  {
    id: 59,
    category: "Momentum",
    name: "Ichimoku Cloud Break",
    description: "Price breaking above Kumo Cloud.",
    logic: "Price > MA50 AND Price > MA200",
    feasibility: "none",
    feasibilityNote: "Ichimoku unavailable - showing MA trend proxy",
  },
  {
    id: 60,
    category: "Momentum",
    name: "Momentum Crash",
    description: "(Short) Momentum stocks starting to breakdown.",
    logic: "RSI < 50 AND Price < MA50",
    feasibility: "full",
  },

  // IV. Technical Volatility & Reversal Screens
  {
    id: 61,
    category: "Technical",
    name: "RSI Oversold",
    description: "RSI < 30 (Potential bounce).",
    logic: "RSI < 30",
    feasibility: "full",
  },
  {
    id: 62,
    category: "Technical",
    name: "Bollinger Squeeze",
    description: "Bandwidth at 6-month low (Explosive move pending).",
    logic: "RSI > 40 AND RSI < 60 AND Beta < 1",
    feasibility: "none",
    feasibilityNote: "Bollinger Bands unavailable - showing low volatility proxy",
  },
  {
    id: 63,
    category: "Technical",
    name: "Bollinger Band Breakout",
    description: "Price closes above Upper Bollinger Band.",
    logic: "RSI > 70 AND Price > MA50",
    feasibility: "none",
    feasibilityNote: "Bollinger Bands unavailable - showing momentum proxy",
  },
  {
    id: 64,
    category: "Technical",
    name: "Death Cross",
    description: "(Short) 50 SMA crosses below 200 SMA.",
    logic: "MA50 < MA200",
    feasibility: "partial",
    feasibilityNote: "Shows current state - crossover event detection unavailable",
  },
  {
    id: 65,
    category: "Technical",
    name: "Inside Day",
    description: "High < Prev High AND Low > Prev Low.",
    logic: "Beta < 0.8 AND RSI > 40 AND RSI < 60",
    feasibility: "none",
    feasibilityNote: "OHLC data unavailable - showing consolidation proxy",
  },
  {
    id: 66,
    category: "Technical",
    name: "NR7 (Narrow Range 7)",
    description: "Today's range is smallest of last 7 days.",
    logic: "Beta < 0.7",
    feasibility: "none",
    feasibilityNote: "Intraday range unavailable - showing low volatility proxy",
  },
  {
    id: 67,
    category: "Technical",
    name: "Oversold Bounce",
    description: "Price < Lower Bollinger Band + RSI < 30.",
    logic: "RSI < 30 AND Price < MA200",
    feasibility: "partial",
    feasibilityNote: "Bollinger Bands unavailable - using RSI and MA proxy",
  },
  {
    id: 68,
    category: "Technical",
    name: "Double Bottom",
    description: "Price hits same low twice.",
    logic: "Up from 52W Low BETWEEN 5 AND 20 AND RSI > 30",
    feasibility: "none",
    feasibilityNote: "Pattern recognition unavailable - showing recovery proxy",
  },
  {
    id: 69,
    category: "Technical",
    name: "Hammer Candle",
    description: "Bullish reversal candle (long lower wick).",
    logic: "RSI < 35 AND Price Change 1D > 0",
    feasibility: "none",
    feasibilityNote: "Candlestick data unavailable - showing reversal proxy",
  },
  {
    id: 70,
    category: "Technical",
    name: "Doji Star",
    description: "Open and Close virtually equal (Indecision).",
    logic: "RSI > 45 AND RSI < 55",
    feasibility: "none",
    feasibilityNote: "Candlestick data unavailable - showing indecision proxy",
  },
  {
    id: 71,
    category: "Technical",
    name: "MFI Oversold",
    description: "Money Flow Index < 20 (Volume weighted RSI).",
    logic: "RSI < 30 AND Volume > 0",
    feasibility: "none",
    feasibilityNote: "MFI unavailable - showing RSI + volume proxy",
  },
  {
    id: 72,
    category: "Technical",
    name: "Williams %R Oversold",
    description: "Williams %R < -80.",
    logic: "RSI < 25",
    feasibility: "none",
    feasibilityNote: "Williams %R unavailable - using RSI proxy",
  },
  {
    id: 73,
    category: "Technical",
    name: "Stochastic Bullish",
    description: "%K crosses above %D in oversold territory.",
    logic: "RSI < 35 AND Price Change 1D > 0",
    feasibility: "none",
    feasibilityNote: "Stochastic unavailable - showing reversal proxy",
  },
  {
    id: 74,
    category: "Technical",
    name: "CCI Reversal",
    description: "CCI moves from below -100 to above -100.",
    logic: "RSI < 40 AND RSI > 30",
    feasibility: "none",
    feasibilityNote: "CCI unavailable - showing recovery zone proxy",
  },
  {
    id: 75,
    category: "Technical",
    name: "V-Shape Recovery",
    description: "Sharp drop followed by sharp rise.",
    logic: "Price Change 1D > 3 AND Price Change 1Y < 0",
    feasibility: "partial",
    feasibilityNote: "Using available price change fields",
  },
  {
    id: 76,
    category: "Technical",
    name: "Keltner Channel Long",
    description: "Price closes above Upper Keltner Channel.",
    logic: "Price > MA50 AND RSI > 60",
    feasibility: "none",
    feasibilityNote: "Keltner Channel/ATR unavailable - showing momentum proxy",
  },
  {
    id: 77,
    category: "Technical",
    name: "ATR Explosion",
    description: "ATR rising sharply (Volatility expanding).",
    logic: "Beta > 1.5 AND Volume > 0",
    feasibility: "none",
    feasibilityNote: "ATR unavailable - using beta and volume proxy",
  },
  {
    id: 78,
    category: "Technical",
    name: "Gap Fill",
    description: "Price enters previous Gap zone.",
    logic: "Price Change 1D > 2 OR Price Change 1D < -2",
    feasibility: "none",
    feasibilityNote: "Gap detection unavailable - showing volatility proxy",
  },
  {
    id: 79,
    category: "Technical",
    name: "Pullback to 50 SMA",
    description: "Uptrend stock touching 50 SMA.",
    logic: "Price > MA200 AND MA50 > 0",
    feasibility: "partial",
    feasibilityNote: "Simplified - exact pullback detection needs calculation",
  },
  {
    id: 80,
    category: "Technical",
    name: "Bull Flag",
    description: "Strong uptrend + Low Vol Consolidation.",
    logic: "Price > MA50 AND RSI > 50 AND RSI < 65",
    feasibility: "partial",
    feasibilityNote: "Pattern detection unavailable - using trend proxy",
  },

  // V. Income & Dividend Screens
  {
    id: 81,
    category: "Income",
    name: "Dividend Aristocrats",
    description: "Growing dividends for 25+ years.",
    logic: "Dividend Yield > 2 AND Payout Ratio < 70 AND ROE > 10",
    feasibility: "none",
    feasibilityNote: "Dividend growth history unavailable - using quality proxy",
  },
  {
    id: 82,
    category: "Income",
    name: "High Yield Safety",
    description: "Yield > 5% but Payout Ratio < 60%.",
    logic: "Dividend Yield > 5 AND Payout Ratio < 60",
    feasibility: "full",
  },
  {
    id: 83,
    category: "Income",
    name: "Dogs of the Dow",
    description: "Top 10 highest yielders in DJIA.",
    logic: "Dividend Yield > 4 AND Market Cap > 50000000000",
    feasibility: "partial",
    feasibilityNote: "Index membership unavailable - using large cap high yield proxy",
  },
  {
    id: 84,
    category: "Income",
    name: "Dividend Growth",
    description: "5-Year Div Growth Rate > 10%.",
    logic: "Dividend Yield > 2 AND Profit Growth 5Y > 10",
    feasibility: "partial",
    feasibilityNote: "Dividend growth rate unavailable - using profit growth proxy",
  },
  {
    id: 85,
    category: "Income",
    name: "Monthly Payers",
    description: "Stocks paying dividends monthly.",
    logic: "Dividend Yield > 4",
    feasibility: "none",
    feasibilityNote: "Dividend frequency unavailable",
  },
  {
    id: 86,
    category: "Income",
    name: "High Yield Low Beta",
    description: "Yield > 4% AND Beta < 0.8 (Low volatility).",
    logic: "Dividend Yield > 4 AND Beta < 0.8",
    feasibility: "full",
  },
  {
    id: 87,
    category: "Income",
    name: "Coverage Kings",
    description: "Cash Flow covers Dividend > 2x.",
    logic: "CF Margin > 10 AND Payout Ratio < 50",
    feasibility: "partial",
    feasibilityNote: "Using CF margin and payout ratio as proxy",
  },
  {
    id: 88,
    category: "Income",
    name: "Preferred Stock Proxy",
    description: "Utility stocks with Yield > 4% and Beta < 0.5.",
    logic: "Dividend Yield > 4 AND Beta < 0.5",
    feasibility: "partial",
    feasibilityNote: "Sector filter unavailable in screener",
  },
  {
    id: 89,
    category: "Income",
    name: "Buyback Yield",
    description: "Share buyback yield > 5%.",
    logic: "Free Cash Flow > 0 AND Payout Ratio < 30",
    feasibility: "none",
    feasibilityNote: "Buyback data unavailable - showing FCF capacity proxy",
  },
  {
    id: 90,
    category: "Income",
    name: "Shareholder Yield",
    description: "Dividend Yield + Buyback Yield.",
    logic: "Dividend Yield > 4 AND Free Cash Flow > 0",
    feasibility: "partial",
    feasibilityNote: "Buyback data unavailable - using dividend + FCF proxy",
  },

  // VI. Fundamental Health & Miscellaneous Screens
  {
    id: 91,
    category: "Fundamental",
    name: "Altman Z-Score",
    description: "Score < 1.8 indicates bankruptcy risk.",
    logic: "Current Ratio < 1 AND Debt to Equity > 2",
    feasibility: "partial",
    feasibilityNote: "Z-Score unavailable - using distress indicators proxy",
  },
  {
    id: 92,
    category: "Fundamental",
    name: "Beneish M-Score",
    description: "Probability of earnings manipulation.",
    logic: "Operating Cash Flow > 0 AND CF Margin > 10",
    feasibility: "partial",
    feasibilityNote: "M-Score unavailable - using cash flow quality as proxy",
  },
  {
    id: 93,
    category: "Fundamental",
    name: "Institutional Favors",
    description: "Institutional ownership > 70%.",
    logic: "Market Cap > 10000000000 AND Beta < 1.2",
    feasibility: "none",
    feasibilityNote: "Institutional ownership data unavailable - using large cap low beta proxy",
  },
  {
    id: 94,
    category: "Fundamental",
    name: "Founder Led",
    description: "Founder is CEO (Proxy via insider own).",
    logic: "Market Cap < 5000000000 AND ROE > 15",
    feasibility: "none",
    feasibilityNote: "Insider ownership data unavailable - using small cap high ROE proxy",
  },
  {
    id: 95,
    category: "Fundamental",
    name: "Widow & Orphan",
    description: "Low Beta, High Yield, Large Cap.",
    logic: "Beta < 0.7 AND Dividend Yield > 3 AND Market Cap > 50000000000",
    feasibility: "full",
  },
  {
    id: 96,
    category: "Fundamental",
    name: "Debt-Free",
    description: "Zero long-term debt.",
    logic: "Total Debt < 1000000",
    feasibility: "partial",
    feasibilityNote: "Using total debt near zero as proxy",
  },
  {
    id: 97,
    category: "Fundamental",
    name: "High Gross Margin",
    description: "Competitive advantage proxy (Margin > 60%).",
    logic: "OPM > 30 AND Net Margin > 20",
    feasibility: "partial",
    feasibilityNote: "Gross margin unavailable - using operating margin proxy",
  },
  {
    id: 98,
    category: "Fundamental",
    name: "Efficient Operators",
    description: "Inventory Turnover > Industry Avg.",
    logic: "ROA > 10 AND Current Ratio > 1.5",
    feasibility: "partial",
    feasibilityNote: "Inventory turnover unavailable - using efficiency proxy",
  },
  {
    id: 99,
    category: "Fundamental",
    name: "Liquid Caps",
    description: "Highly liquid large caps (for day trading).",
    logic: "Market Cap > 20000000000 AND Avg Volume > 5000000",
    feasibility: "full",
  },
  {
    id: 100,
    category: "Fundamental",
    name: "Penny Stock Movers",
    description: "Price < $5 and Volume > 2x Avg.",
    logic: "Price < 5 AND Volume > 0",
    feasibility: "partial",
    feasibilityNote: "Volume spike detection simplified - manual verification needed",
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
      const isVerified = strategy.feasibility === "full";
      return matchesSearch && matchesCategory && isVerified;
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
                <div className="flex flex-col items-end gap-1">
                  <Badge
                    variant="secondary"
                    className="shrink-0 font-medium text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
                  >
                    {strategy.category}
                  </Badge>
                  {strategy.feasibility && (
                    <Badge
                      variant="outline"
                      className={`shrink-0 font-medium text-[10px] px-1.5 py-0.5 ${
                        strategy.feasibility === "full"
                          ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700"
                          : strategy.feasibility === "partial"
                          ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700"
                          : "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-300 dark:border-red-700"
                      }`}
                      title={strategy.feasibilityNote || ""}
                    >
                      {strategy.feasibility === "full" ? (
                        <><CheckCircle className="w-3 h-3 mr-0.5" />Verified</>
                      ) : strategy.feasibility === "partial" ? (
                        <><AlertTriangle className="w-3 h-3 mr-0.5" />Limited</>
                      ) : (
                        <><Ban className="w-3 h-3 mr-0.5" />Proxy</>
                      )}
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[2.5rem] leading-relaxed">
                {strategy.description}
              </p>
              {strategy.feasibilityNote && (
                <p className="text-[10px] text-amber-600 dark:text-amber-400 italic">
                  ⚠️ {strategy.feasibilityNote}
                </p>
              )}
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
