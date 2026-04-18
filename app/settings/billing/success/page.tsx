"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Crown,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Loader2,
  Zap,
  Shield,
  BarChart3,
  MessageSquare,
  Download,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { confetti } from "@/lib/confetti";

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAnimating, setIsAnimating] = useState(true);

  const planName = searchParams.get("plan") || "Premium";
  const tier = searchParams.get("tier") || "premium";
  const billingPeriod = searchParams.get("period") || "monthly";

  useEffect(() => {
    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    // Secondary burst after a delay
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });
    }, 250);

    setIsAnimating(false);
  }, []);

  const tierFeatures = {
    premium: [
      { icon: BarChart3, text: "Unlimited stock analysis" },
      { icon: Zap, text: "Advanced screener filters" },
      { icon: Download, text: "Export to CSV/Excel" },
      { icon: Shield, text: "Priority support" },
      { icon: MessageSquare, text: "AI-powered insights" },
    ],
    max: [
      { icon: BarChart3, text: "Everything in Premium" },
      { icon: Zap, text: "Real-time data" },
      { icon: MessageSquare, text: "Unlimited AI questions" },
      { icon: Shield, text: "API access (10k calls/month)" },
      { icon: Clock, text: "Premium support (1-hour response)" },
    ],
  };

  const features = tierFeatures[tier as "premium" | "max"] || tierFeatures.premium;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full">
        {/* Celebration Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full mb-6 shadow-lg shadow-amber-200 dark:shadow-amber-900/30 animate-bounce">
            <Crown className="h-10 w-10 text-white" />
          </div>

          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              Welcome to {planName}!
            </h1>
            <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
          </div>

          <p className="text-lg text-slate-600 dark:text-slate-400">
            Your subscription is now active. Thank you for joining MarketView360!
          </p>
        </div>

        {/* Success Card */}
        <Card className="border-2 border-amber-200 dark:border-amber-800 shadow-xl mb-6 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-amber-400 to-orange-500" />
          <CardContent className="p-6">
            {/* Plan Details */}
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Plan</p>
                <p className="font-semibold text-lg text-slate-900 dark:text-white">{planName}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Billing</p>
                <p className="font-semibold capitalize text-slate-900 dark:text-white">{billingPeriod}</p>
              </div>
              <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">Active</span>
              </div>
            </div>

            {/* Features List */}
            <div className="mb-6">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                What you now have access to:
              </p>
              <div className="space-y-2">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <feature.icon className="h-4 w-4 text-amber-500" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Billing Info */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                Your billing period starts today
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                You can manage your subscription anytime from Settings → Billing
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/screens" className="flex-1">
                <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Start Screening
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link href="/ai" className="flex-1">
                <Button variant="outline" className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Try Jovan AI
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Additional Links */}
        <div className="text-center space-y-3">
          <Link
            href="/settings/billing"
            className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
          >
            View billing details →
          </Link>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Questions? Contact us at support@marketview360.io
          </p>
        </div>
      </div>
    </div>
  );
}