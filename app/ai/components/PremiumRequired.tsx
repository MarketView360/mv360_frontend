"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Zap, Shield, TrendingUp, MessageSquare, Clock, ArrowRight, Crown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PremiumRequiredProps {
  reason?: 'not_premium' | 'cooldown_active' | 'quota_exceeded';
  cooldownUntil?: string;
  resetsAt?: string;
}

export function PremiumRequired({ reason, cooldownUntil, resetsAt }: PremiumRequiredProps) {
  const router = useRouter();

  const handleUpgrade = () => {
    router.push('/pricing');
  };

  // Cooldown / Quota exhausted state - temporary limitation
  if (reason === 'cooldown_active' || reason === 'quota_exceeded') {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
        <Card className="max-w-md w-full border-amber-200 dark:border-amber-800 shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-3 shadow-lg">
              <Clock className="w-7 h-7 text-white" />
            </div>
            <CardTitle className="text-xl">Take a Quick Break</CardTitle>
            <CardDescription className="text-sm">
              You've used all your AI tokens for this period
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-3">
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <p className="text-xs text-amber-800 dark:text-amber-200">
                Your quota will reset in <strong>12 hours</strong> with 50,000 fresh tokens.
              </p>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 mt-1">
                {resetsAt ? new Date(resetsAt).toLocaleString() : new Date(cooldownUntil!).toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
              <p className="font-medium text-emerald-900 dark:text-emerald-100 text-sm flex items-center gap-1.5">
                <Crown className="w-4 h-4" />
                Premium includes:
              </p>
              <ul className="text-xs text-emerald-700 dark:text-emerald-300 space-y-1 mt-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  50,000 AI tokens every 12 hours
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Priority access during peak times
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Advanced AI models (GPT-4, Claude)
                </li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 pt-3">
            <Button onClick={handleUpgrade} className="w-full gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-medium">
              <Crown className="w-4 h-4" />
              Upgrade to Premium
            </Button>
            <Button variant="ghost" onClick={() => router.push('/ai')} className="w-full text-sm">
              Return to AI Chat
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Default: Not premium - welcoming upgrade invitation (compact version)
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 p-4">
      <Card className="max-w-lg w-full border-emerald-200 dark:border-emerald-800 shadow-2xl overflow-hidden">
        {/* Gradient Header - Compact */}
        <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-5 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Unlock Jovan AI Premium</h2>
              <p className="text-emerald-100 text-xs">AI-powered investing insights</p>
            </div>
          </div>
        </div>

        <CardContent className="p-5 space-y-4">
          {/* Value Proposition - Compact */}
          <p className="text-sm text-slate-700 dark:text-slate-300 text-center">
            Get <strong className="text-emerald-600 dark:text-emerald-400">50,000 tokens</strong> every 12 hours to make smarter investment decisions
          </p>

          {/* Features Grid - 2x2 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col items-center text-center p-3 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0 mb-2">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <p className="font-semibold text-slate-900 dark:text-white text-sm">50K Tokens</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Every 12 hours</p>
            </div>

            <div className="flex flex-col items-center text-center p-3 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800">
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shrink-0 mb-2">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <p className="font-semibold text-slate-900 dark:text-white text-sm">Priority Access</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Faster responses</p>
            </div>

            <div className="flex flex-col items-center text-center p-3 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800">
              <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center shrink-0 mb-2">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <p className="font-semibold text-slate-900 dark:text-white text-sm">Advanced Models</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">GPT-4, Claude</p>
            </div>

            <div className="flex flex-col items-center text-center p-3 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shrink-0 mb-2">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <p className="font-semibold text-slate-900 dark:text-white text-sm">Pro Features</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Full access</p>
            </div>
          </div>

          {/* Social Proof - Compact */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Trusted by thousands of investors daily
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 px-5 pb-5">
          <Button onClick={handleUpgrade} size="lg" className="w-full gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold shadow-lg">
            <Crown className="w-4 h-4" />
            Upgrade to Premium
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Link href="/" className="w-full">
            <Button variant="ghost" className="w-full text-sm">
              Return to Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
