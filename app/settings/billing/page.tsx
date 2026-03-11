"use client";

import { Crown, Rocket, Bell, ArrowRight, Zap, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function BillingPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-4xl mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand/10 border border-brand/20">
            <Rocket className="h-4 w-4 text-brand" />
            <span className="text-sm font-medium text-brand">
              Coming Soon
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
            Billing & Subscriptions
            <span className="block text-brand">
              launching soon
            </span>
          </h1>

          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            We're building something special. Manage your subscription, view invoices,
            and handle payments — all in one seamless experience.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardContent className="pt-6 text-center space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand/10">
                <Crown className="h-6 w-6 text-brand" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Flexible Plans
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Choose from multiple tiers designed for every type of investor
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardContent className="pt-6 text-center space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-growth/10">
                <Shield className="h-6 w-6 text-growth" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Secure Payments
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Enterprise-grade security for all your transactions
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardContent className="pt-6 text-center space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-warning/10">
                <Zap className="h-6 w-6 text-warning" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Instant Access
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Upgrade anytime and get immediate access to premium features
              </p>
            </CardContent>
          </Card>
        </div>

        {/* What's Coming Section */}
        <Card className="border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 mb-8">
          <CardContent className="pt-8 pb-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-brand/10 mb-3">
                <Sparkles className="h-5 w-5 text-brand" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                What's Coming
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {[
                "Monthly & annual subscription plans",
                "Secure payment processing",
                "Invoice history & downloads",
                "Plan upgrades & downgrades",
                "Automatic billing management",
                "Refund & cancellation support",
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="shrink-0 w-5 h-5 rounded-full bg-growth/10 flex items-center justify-center">
                    <svg className="w-3 h-3 text-growth" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm text-slate-700 dark:text-slate-300">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center space-y-4">
          <p className="text-slate-600 dark:text-slate-400">
            Want to see what premium features await you?
          </p>
          <Link href="/pricing">
            <Button className="bg-brand hover:bg-brand/90 text-white">
              View Pricing Plans
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Notify Me */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
            Be the first to know when we launch
          </p>
          <div className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Bell className="h-4 w-4" />
            <span className="text-sm">Notifications will be available soon</span>
          </div>
        </div>
      </div>
    </div>
  );
}
