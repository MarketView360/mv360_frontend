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
        <Card className="max-w-lg w-full border-amber-200 dark:border-amber-800 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-4 shadow-lg">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Take a Quick Break</CardTitle>
            <CardDescription className="text-base">
              You've used all your AI tokens for this period
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Your quota will reset in <strong>12 hours</strong> with a fresh 100,000 tokens.
              </p>
              <p className="text-lg font-semibold text-amber-900 dark:text-amber-100 mt-2">
                {resetsAt ? new Date(resetsAt).toLocaleString() : new Date(cooldownUntil!).toLocaleString()}
              </p>
            </div>
            <div className="grid gap-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <Zap className="w-5 h-5 text-emerald-500 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">Current Plan: Free</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Limited AI access during peak times</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                <Crown className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                <div>
                  <p className="font-medium text-emerald-900 dark:text-emerald-100">Premium includes:</p>
                  <ul className="text-sm text-emerald-700 dark:text-emerald-300 space-y-1 mt-1">
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                      100,000 AI tokens every 12 hours
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                      Priority access during peak times
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                      Advanced AI models (GPT-4, Claude, and more)
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button onClick={handleUpgrade} className="w-full gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold">
              <Crown className="w-4 h-4" />
              Upgrade to Premium - Never Wait
            </Button>
            <Button variant="ghost" onClick={() => router.push('/ai')} className="w-full">
              Return to AI Chat
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Default: Not premium - welcoming upgrade invitation
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 p-4">
      <Card className="max-w-2xl w-full border-emerald-200 dark:border-emerald-800 shadow-2xl overflow-hidden">
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold">Unlock the Full Power of Jovan AI</h2>
          </div>
          <p className="text-emerald-100 text-sm ml-15">
            Get instant access to AI-powered investing insights and analysis
          </p>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Value Proposition */}
          <div className="text-center space-y-2">
            <p className="text-lg text-slate-700 dark:text-slate-300">
              Premium members get <strong className="text-emerald-600 dark:text-emerald-400">10x more AI power</strong> to make smarter investment decisions
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800">
              <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0 shadow-md">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">100,000 Tokens</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Every 12 hours for AI chat and analysis</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800">
              <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center shrink-0 shadow-md">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Priority Access</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Faster responses during peak times</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800">
              <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center shrink-0 shadow-md">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Advanced Models</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">GPT-4, Claude, and custom Jovan models</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800">
              <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center shrink-0 shadow-md">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">MarketView360 Pro</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Full access to all premium features</p>
              </div>
            </div>
          </div>

          {/* Social Proof / Trust */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Trusted by investors</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Join thousands of investors who use Jovan AI daily to screen stocks, analyze watchlists, and discover opportunities.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 px-6 pb-6">
          <Button onClick={handleUpgrade} size="lg" className="w-full gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all">
            <Crown className="w-5 h-5" />
            Upgrade to Premium
            <ArrowRight className="w-5 h-5" />
          </Button>
          <Link href="/" className="w-full">
            <Button variant="ghost" className="w-full text-slate-600 dark:text-slate-400">
              Return to Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
