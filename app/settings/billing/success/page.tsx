"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { useProfile } from "@/hooks/useProfile";
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
  const { session, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, refetch } = useProfile(session?.access_token || null);

  const [isAnimating, setIsAnimating] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreliminary, setShowPreliminary] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const planName = searchParams.get("plan") || "Premium";
  const tier = searchParams.get("tier") || "premium";
  const billingPeriod = searchParams.get("period") || "monthly";
  const paymentId = searchParams.get("payment_id");

  // Show preliminary success immediately based on URL params
  // This prevents "logged out" feeling while auth loads
  useEffect(() => {
    // Trigger confetti animation immediately on page load
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

  // Verify user has premium access (after auth loads)
  useEffect(() => {
    if (authLoading || profileLoading) return;

    setShowPreliminary(false);

    // If not logged in, wait a bit and retry before redirecting
    if (!session) {
      if (retryCount < 3) {
        setRetryCount(retryCount + 1);
        // Wait 2 seconds and retry - session might still be loading from localStorage
        setTimeout(() => {
          // Force re-check by not doing anything - useEffect will re-run
        }, 2000);
        return;
      }
      // After retries, redirect to login
      router.replace("/auth/login?redirect=/settings/billing/success");
      return;
    }

    // Must have premium tier (either from subscription or profile)
    const profileTier = profile?.subscription_tier || "free";
    if (profileTier === "free" && !searchParams.get("skip_verify")) {
      // If user is still free tier, try to refetch profile
      if (retryCount < 2) {
        setRetryCount(retryCount + 1);
        refetch();
        return;
      }
      // Show processing message instead of redirecting
      setError("Your subscription may still be processing. Please wait a moment or check your billing page.");
      setVerified(false);
      return;
    }

    setVerified(true);
  }, [authLoading, profileLoading, session, profile, router, searchParams, retryCount, refetch]);

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

  // Loading state with preliminary success UI
  if ((authLoading || profileLoading || isAnimating) && showPreliminary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full">
          {/* Show success UI immediately */}
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
              Your subscription is being activated...
            </p>

            {paymentId && (
              <p className="text-xs text-slate-400 mt-2 font-mono">
                Payment ID: {paymentId}
              </p>
            )}
          </div>

          <Card className="border-2 border-amber-200 dark:border-amber-800 shadow-xl">
            <CardContent className="p-6 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-brand mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">
                Verifying your subscription...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Full loading spinner if not showing preliminary
  if (authLoading || profileLoading || isAnimating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  // Error state - not verified
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <Clock className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Subscription Processing
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {error}
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/settings/billing">
                <Button variant="outline">Check Billing</Button>
              </Link>
              <Link href="/pricing">
                <Button>Try Again</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not logged in - will redirect
  if (!session) return null;

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

          {paymentId && (
            <p className="text-xs text-slate-400 mt-2 font-mono">
              Payment ID: {paymentId}
            </p>
          )}
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