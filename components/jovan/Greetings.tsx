"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Zap,
  Globe,
  Calculator,
  TrendingUp,
  BarChart3,
  PieChart,
  Mic,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const suggestionCards = [
  {
    icon: TrendingUp,
    title: "Stock Analysis",
    prompt: "Analyze AAPL stock with key financial metrics and growth potential",
    solidColor: "bg-blue-500",
    bgLight: "bg-blue-50",
    bgDark: "dark:bg-blue-950/50",
  },
  {
    icon: BarChart3,
    title: "Compare Companies",
    prompt: "Compare MSFT and GOOGL using revenue, margins, and valuation",
    solidColor: "bg-emerald-500",
    bgLight: "bg-emerald-50",
    bgDark: "dark:bg-emerald-950/50",
  },
  {
    icon: PieChart,
    title: "Screen Stocks",
    prompt: "Find undervalued growth stocks with PE < 20 and revenue growth > 15%",
    gradient: "from-violet-500 to-purple-500",
    bgLight: "bg-gradient-to-br from-violet-50 to-purple-50",
    bgDark: "dark:from-violet-950/50 dark:to-purple-950/50",
  },
  {
    icon: Calculator,
    title: "Financial Concepts",
    prompt: "Explain the Rule of 40 for SaaS companies with examples",
    solidColor: "bg-amber-500",
    bgLight: "bg-amber-50",
    bgDark: "dark:bg-amber-950/50",
  },
];

const capabilities = [
  { icon: Zap, label: "Fast", color: "text-yellow-500" },
  { icon: Brain, label: "Reasoning", color: "text-purple-500" },
  { icon: Globe, label: "Web Search", color: "text-green-500" },
  { icon: Mic, label: "Voice", color: "text-blue-500" },
  { icon: Sparkles, label: "Multi-Model", color: "text-pink-500" },
];

export function Greeting({
  onExampleClick,
}: {
  onExampleClick: (text: string) => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-2 max-w-2xl mx-auto">
      {/* Logo and Title */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mb-2 text-center"
      >

        <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
          Jovan AI
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          Your intelligent assistant for financial analysis and market insights
        </p>
      </motion.div>

      {/* Capabilities Pills
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-wrap items-center justify-center gap-2 mb-8"
      >
        {capabilities.map((cap, i) => {
          const Icon = cap.icon;
          return (
            <motion.div
              key={cap.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 text-xs font-medium"
            >
              <Icon className={cn("h-3 w-3", cap.color)} />
              <span className="text-slate-600 dark:text-slate-300">{cap.label}</span>
            </motion.div>
          );
        })}
      </motion.div>
       */}

      {/* Suggestion Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="w-full max-w-2xl"
      >
        <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-3 text-center">
          Try asking about...
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {suggestionCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.button
                key={card.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.08 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onExampleClick(card.prompt)}
                className={cn(
                  "group relative flex items-start gap-3 p-4 rounded-xl text-left transition-all duration-200",
                  "border border-slate-200/80 dark:border-slate-700/50",
                  "hover:border-slate-300 dark:hover:border-slate-600",
                  "hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50",
                  card.bgLight,
                  card.bgDark,
                )}
              >
                {/* Icon */}
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    "shadow-sm",
                    card.solidColor,
                  )}
                >
                  <Icon className="h-5 w-5 text-white" />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                    {card.prompt}
                  </p>
                </div>

                {/* Arrow indicator */}
                <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Keyboard Shortcut Hint */}

    </div>
  );
}