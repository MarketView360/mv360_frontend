"use client";

import { usePortfolio } from "@/providers/PortfolioProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Shield, Eye, Zap, ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";

const FEATURES = [
  {
    icon: Building2,
    title: "Connect 20+ Brokerages",
    description: "Fidelity, Schwab, Robinhood, TD Ameritrade, and more",
  },
  {
    icon: Eye,
    title: "Read-Only Access",
    description: "We can only view your holdings — no trading capability",
  },
  {
    icon: Shield,
    title: "Bank-Grade Security",
    description: "256-bit encryption with industry-standard protocols",
  },
  {
    icon: Zap,
    title: "Real-Time Sync",
    description: "Automatic updates when your portfolio changes",
  },
];

export function EmptyState() {
  const { connectBrokerage, error } = usePortfolio();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connectBrokerage();
    } catch (err) {
      console.error("Connection error:", err);
    } finally {
      // Keep loading for a moment to show popup opened
      setTimeout(() => setIsConnecting(false), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Connect Your Brokerage
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Link your investment accounts to track your entire portfolio in one place.
            See holdings, transactions, and performance alongside our market data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {FEATURES.map((feature) => (
            <Card key={feature.title} className="border-dashed">
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

        <div className="text-center">
          <Button 
            size="lg" 
            onClick={handleConnect} 
            disabled={isConnecting}
            className="gap-2"
          >
            {isConnecting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Opening Connection...
              </>
            ) : (
              <>
                Connect Brokerage
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-3">
              {error}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-4">
            Secure, encrypted connection to your brokerage account •{" "}
            <a href="/help#portfolio" className="underline hover:text-foreground">
              View FAQ
            </a>
          </p>
        </div>

        {/* Supported Brokerages */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Supports major US brokerages including:
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            {[
              "Fidelity",
              "Charles Schwab",
              "TD Ameritrade",
              "Robinhood",
              "E*TRADE",
              "Interactive Brokers",
              "Vanguard",
              "Webull",
              "Ally Invest",
              "Firstrade",
            ].map((broker) => (
              <span
                key={broker}
                className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800"
              >
                {broker}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
