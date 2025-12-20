"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function AiComingSoon() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 overflow-hidden relative">
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight"
        >
          Meet{" "}
          <span className="text-brand">
            Jovan AI
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-xl sm:text-2xl text-slate-700 dark:text-slate-400 mb-6 font-light"
        >
          Your intelligent market analysis companion
        </motion.p>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-slate-600 dark:text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed"
        >
          We&apos;re building something extraordinary. Jovan will help you analyze stocks, 
          understand financial metrics, and make smarter investment decisions with 
          cutting-edge AI technology.
        </motion.p>

        {/* Coming Soon badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="inline-block mb-8"
        >
          <div className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-3 font-semibold text-lg bg-brand text-brand-foreground shadow-xl border-2 border-brand-dark">
            🚀 Coming Soon
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <Link href="/">
            <Button
              variant="outline"
              size="lg"
              className="group"
            >
              Explore MarketView360
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>

        {/* Bottom text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-12 text-xs text-slate-600 dark:text-slate-500"
        >
          Stay tuned for the future of intelligent market analysis
        </motion.p>
      </div>
    </div>
  );
}
