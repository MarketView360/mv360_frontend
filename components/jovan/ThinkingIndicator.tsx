"use client";

import { motion } from "framer-motion";
import { Brain } from "lucide-react";

export function ThinkingIndicator({ text }: { text?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="mb-2"
    >
      <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        <Brain className="h-3 w-3 animate-pulse text-brand" />
        {text || "Thinking..."}
      </div>
    </motion.div>
  );
}