"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Globe, Calculator, Search, Zap } from "lucide-react";
import type { ToolType } from "@/lib/utils/jovan/types";
import { cn } from "@/lib/utils";

const TOOL_CONFIGS = {
  visiting: { icon: Globe, label: "Visiting website", color: "text-blue-500" },
  calculating: { icon: Calculator, label: "Calculating metrics", color: "text-green-500" },
  searching: { icon: Search, label: "Searching data", color: "text-purple-500" },
  routing: { icon: Zap, label: "Routing model", color: "text-yellow-500" },
  evaluating: { icon: Loader2, label: "Evaluating response", color: "text-orange-500" },
};

export function ToolIndicator({ type }: { type: ToolType }) {
  const config = TOOL_CONFIGS[type];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="my-2 flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400"
      >
        <config.icon className={cn("h-4 w-4 animate-spin", config.color)} />
        <span>{config.label}</span>
      </motion.div>
    </AnimatePresence>
  );
}