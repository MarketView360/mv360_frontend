"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Sparkles, Zap, Shield } from "lucide-react";
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

  if (reason === 'cooldown_active') {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white dark:bg-slate-950 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-500" />
              Quota Exhausted
            </CardTitle>
            <CardDescription>
              You've used all your AI tokens for this period
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Your AI access is on cooldown until:
              </p>
              <p className="text-lg font-semibold text-amber-900 dark:text-amber-100 mt-1">
                {resetsAt || new Date(cooldownUntil!).toLocaleString()}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Premium subscribers get <strong>100,000 tokens</strong> every 12 hours for AI chat.
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                After your cooldown period ends, your quota will reset automatically.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/ai')}>
              Return to AI Chat
            </Button>
            <Button onClick={handleUpgrade} className="gap-2">
              <Sparkles className="w-4 h-4" />
              Upgrade to Premium
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (reason === 'quota_exceeded') {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white dark:bg-slate-950 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-red-500" />
              Token Quota Exhausted
            </CardTitle>
            <CardDescription>
              You've used all 100,000 tokens for this period
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-200">
                Your quota will reset in <strong>12 hours</strong> with a fresh 100,000 tokens.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Premium includes:
              </p>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <li className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  100,000 AI tokens every 12 hours
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  Priority access during peak times
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-500" />
                  Faster response times
                </li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/ai')}>
              Return to AI Chat
            </Button>
            <Button onClick={handleUpgrade} className="gap-2">
              <Sparkles className="w-4 h-4" />
              Learn More
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Default: Not premium (upgrade required)
  return (
    <div className="flex h-full w-full items-center justify-center bg-white dark:bg-slate-950 p-4">
      <Card className="max-w-lg w-full border-emerald-200 dark:border-emerald-800 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <CardTitle className="text-2xl">Premium Access Required</CardTitle>
          <CardDescription className="text-base">
            AI chat is now exclusively available to Premium subscribers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <Sparkles className="w-5 h-5 text-emerald-500 mt-0.5" />
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">100,000 Tokens</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Every 12 hours for AI chat</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <Zap className="w-5 h-5 text-emerald-500 mt-0.5" />
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">Priority Access</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Faster responses during peak times</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <Shield className="w-5 h-5 text-emerald-500 mt-0.5" />
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">Advanced Features</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Full access to all MarketView360 features</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button onClick={handleUpgrade} size="lg" className="w-full gap-2">
            <Sparkles className="w-5 h-5" />
            Upgrade to Premium
          </Button>
          <Button variant="ghost" onClick={() => router.push('/')} className="w-full">
            Return to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
