"use client";

import { Crown, ArrowRight, Zap, Shield, Sparkles, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function BillingPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-4xl mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand/20 border-2 border-brand">
            <Sparkles className="h-4 w-4 text-brand" />
            <span className="text-sm font-bold text-brand uppercase tracking-wide">
              Coming Soon
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Billing & Subscriptions
            <span className="block text-brand mt-2">
              launching soon
            </span>
          </h1>

          <p className="text-lg font-medium text-slate-700 dark:text-slate-300 max-w-xl mx-auto">
            We're building something special. Manage your subscription, view invoices,
            and handle payments — all in one seamless experience.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <Card className="border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-md">
            <CardContent className="pt-6 text-center space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand/20 border-2 border-brand">
                <Crown className="h-6 w-6 text-brand" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Flexible Plans
              </h3>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Choose from multiple tiers designed for every type of investor
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-md">
            <CardContent className="pt-6 text-center space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-growth/20 border-2 border-growth">
                <Shield className="h-6 w-6 text-growth" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Secure Payments
              </h3>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Enterprise-grade security for all your transactions
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-md">
            <CardContent className="pt-6 text-center space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-warning/20 border-2 border-warning">
                <Zap className="h-6 w-6 text-warning" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Instant Access
              </h3>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Upgrade anytime and get immediate access to premium features
              </p>
            </CardContent>
          </Card>
        </div>

        {/* What's Coming Section */}
        <Card className="border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg mb-8">
          <CardContent className="pt-8 pb-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand/20 border-2 border-brand mb-3">
                <Sparkles className="h-6 w-6 text-brand" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
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
                  <div className="shrink-0 w-6 h-6 rounded-full bg-growth/20 border-2 border-growth flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-growth" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-base font-medium text-slate-800 dark:text-slate-200">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center space-y-4 mb-8">
          <p className="text-base font-medium text-slate-700 dark:text-slate-300">
            Want to see what premium features await you?
          </p>
          <Link href="/pricing">
            <Button className="bg-brand hover:bg-brand/90 text-white font-bold text-lg px-8 py-6 rounded-xl border-4 border-brand/30 shadow-xl hover:shadow-2xl transition-all">
              View Pricing Plans
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Contact Us CTA */}
        <Card className="border-2 border-brand bg-brand/10 dark:bg-brand/5">
          <CardContent className="pt-8 pb-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand/20 border-2 border-brand mb-4">
                <Mail className="h-6 w-6 text-brand" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-3">
                Want Early Access or Custom Features?
              </h3>
              <p className="text-base font-medium text-slate-700 dark:text-slate-300 mb-6 max-w-lg mx-auto">
                If you'd like to try the billing system earlier and provide feedback, or need custom features, we'd love to hear from you!
              </p>
              <Link href="/contact">
                <Button className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 text-white font-bold px-6 py-4 rounded-lg border-2 border-slate-900 dark:border-white">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Us
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
