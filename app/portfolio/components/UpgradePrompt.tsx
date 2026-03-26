"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Briefcase, BarChart3, Shield, Sparkles } from "lucide-react";

const PREMIUM_FEATURES = [
  {
    icon: Briefcase,
    title: "Portfolio Tracking",
    description: "Connect brokerages and see all holdings in one place",
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description: "Track P&L, sector allocation, and historical performance",
  },
  {
    icon: Shield,
    title: "Read-Only & Secure",
    description: "Bank-grade encryption with no trading capability",
  },
  {
    icon: Sparkles,
    title: "AI Portfolio Insights",
    description: "Get personalized analysis based on your holdings",
  },
];

export function UpgradePrompt() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-linear-to-br from-amber-400 to-orange-500 mb-6">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Upgrade to Premium
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Portfolio tracking is a Premium feature. Upgrade to connect your
            brokerages and see your complete financial picture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {PREMIUM_FEATURES.map((feature) => (
            <Card key={feature.title}>
              <CardContent className="flex items-start gap-4 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {feature.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center space-y-4">
          <Link href="/pricing">
            <Button size="lg" className="gap-2 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
              <Crown className="h-4 w-4" />
              View Premium Plans
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground">
            Starting at $9.99/month • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}
