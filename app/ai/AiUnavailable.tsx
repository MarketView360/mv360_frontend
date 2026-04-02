"use client";

import { Logo } from "@/components/common/Logo";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export function AiUnavailable() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            AI Features Unavailable
          </h2>

          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Jovan AI is currently unavailable. Please check back later.
          </p>

          <div className="flex items-center justify-center">
            <Logo width={120} height={24} className="h-6 opacity-50" />
          </div>
        </div>
      </div>
    </div>
  );
}
