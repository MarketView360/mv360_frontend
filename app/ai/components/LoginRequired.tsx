"use client";

import React from "react";
import { Sparkles, ArrowRight, UserCircle2, UserPlus2 } from "lucide-react";
import Link from "next/link";

export function LoginRequired() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-white px-4 dark:bg-slate-950">
      <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
        
        {/* Header */}
    <div className="text-center space-y-5">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
        <Sparkles className="h-7 w-7" />
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Ready to meet Jovan?
        </h1>
        <p className="mx-auto max-w-md text-base text-slate-500 dark:text-slate-400 leading-relaxed">
          Unlock your intelligent financial analyst and start making data-driven investment decisions.
        </p>
      </div>
    </div>

    {/* Action Section */}
    <div className="rounded-3xl border border-slate-200 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-900/20 space-y-5">
      <h2 className="text-center text-base font-semibold text-slate-800 dark:text-slate-200">
        Jovan needs an account to assist you. Got one?
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {/* Login Card - Increased border contrast (slate-300 light, slate-700 dark) */}
        <Link href="auth/login" className="group">
          <div className="flex h-full flex-col items-center space-y-3 rounded-2xl border border-slate-300 bg-white p-6 text-center transition-all duration-300 hover:border-indigo-500 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-400">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 transition-transform group-hover:scale-110 dark:bg-indigo-950/30 dark:text-indigo-400">
              <UserCircle2 className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-bold text-slate-900 dark:text-slate-100">Yes, I have one</p>
              <p className="text-xs text-slate-500">Sign in to chat</p>
            </div>
            <div className="pt-2">
              <span className="inline-flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400">
                Sign In to MarketView360 <ArrowRight className="ml-1 h-3 w-3" />
              </span>
            </div>
          </div>
        </Link>

        {/* Signup Card - Increased border contrast (slate-300 light, slate-700 dark) */}
        <Link href="auth/signup" className="group">
          <div className="flex h-full flex-col items-center space-y-3 rounded-2xl border border-slate-300 bg-white p-6 text-center transition-all duration-300 hover:border-indigo-500 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-400">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 transition-transform group-hover:scale-110 dark:bg-indigo-950/30 dark:text-indigo-400">
              <UserPlus2 className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-bold text-slate-900 dark:text-slate-100">No, create new</p>
              <p className="text-xs text-slate-500">Free in 30 seconds</p>
            </div>
            <div className="pt-2">
              <span className="inline-flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400">
                Join MarketView360 <ArrowRight className="ml-1 h-3 w-3" />
              </span>
            </div>
          </div>
        </Link>
      </div>
    </div>
    
  </div>
</div>
  );
}