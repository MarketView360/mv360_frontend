"use client";

import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowUpRight,
  Filter,
  Plus,
  Search,
  BookOpen,
  Grid3X3,
  Users,
  Play,
} from "lucide-react";
import ScreenerQueryBuilder from "@/components/ScreenerQueryBuilder";
import StrategyLibrary from "@/components/StrategyLibrary";

const SCREENS = [
  {
    name: "The Bull Cartel",
    description:
      "High momentum stocks breaking out with strong price performance and volume.",
    tags: ["Momentum", "Technical"],
    color: "bg-yellow-500",
    query: `Return over 1year > 50 AND
Average Volume > 500000 AND
Market Capitalization > 1000`,
  },
  {
    name: "Undervalued Growth",
    description:
      "Companies with >20% revenue growth trading at a PEG ratio under 1.5.",
    tags: ["Growth", "Value"],
    color: "bg-green-500",
    query: `Sales growth 3Years > 20 AND
PEG Ratio < 1.5 AND
PEG Ratio > 0 AND
Market Capitalization > 500`,
  },
  {
    name: "Coffee Can Portfolio",
    description:
      "Consistent compounders with high ROE (>15%) and quality metrics.",
    tags: ["Long Term", "Quality"],
    color: "bg-blue-500",
    query: `ROE > 15 AND
ROCE > 15 AND
Debt to equity < 0.5 AND
Sales growth 3Years > 10 AND
Market Capitalization > 1000`,
  },
  {
    name: "Magic Formula",
    description: "High Return on Capital and High Earnings Yield (Greenblatt).",
    tags: ["Value", "Quality"],
    color: "bg-purple-500",
    query: `ROCE > 20 AND
PE < 15 AND
PE > 0 AND
Market Capitalization > 500`,
  },
  {
    name: "Dividend Champions",
    description:
      "High dividend yield stocks with sustainable payout and strong fundamentals.",
    tags: ["Dividend", "Safe"],
    color: "bg-emerald-500",
    query: `Dividend yield > 3 AND
Dividend yield < 10 AND
ROE > 12 AND
Debt to equity < 1 AND
Market Capitalization > 1000`,
  },
  {
    name: "Low Debt Quality",
    description: "Profitable companies with low debt and high profit margins.",
    tags: ["Quality", "Safe"],
    color: "bg-indigo-500",
    query: `Debt to equity < 0.3 AND
OPM > 15 AND
ROE > 12 AND
Current Ratio > 1.5 AND
Market Capitalization > 500`,
  },
];

export default function ScreensPage() {
  return (
    <Suspense fallback={<ScreensPageSkeleton />}>
      <ScreensPageContent />
    </Suspense>
  );
}

function ScreensPageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand" />
    </div>
  );
}


function ScreensPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(
    "Market capitalization > 500 AND\nPrice to earning < 15 AND\nReturn on capital employed > 22%"
  );

  // Get current tab from URL params, default to 'screens' (Templates)
  const currentTab = searchParams.get("tab") || "screens";

  // Handle tab change with URL update
  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", value);
    router.push(`/screens?${params.toString()}`);
  };

  // Run a template query directly
  const handleRunTemplate = (templateQuery: string) => {
    const params = new URLSearchParams({
      query: templateQuery,
      sort: "market_capitalization.desc",
      limit: String(50),
      offset: String(0),
      exchange: "us",
    });
    router.push(`/screens/results?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 font-sans transition-colors duration-300">
      {/* Header */}
      <div className="bg-linear-to-br from-white via-slate-50/50 to-white dark:from-slate-900 dark:via-slate-900/50 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800 py-8 relative overflow-hidden transition-colors duration-300">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.05),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(34,197,94,0.05),transparent_50%)]"></div>
        <div className="mx-auto max-w-[1920px] px-4 md:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
                  <Search className="w-5 h-5 text-slate-900 dark:text-white" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
                  Stock Screens
                </h1>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-base max-w-2xl leading-relaxed">
                Discover investment ideas using proven strategies and
                quantitative models.
                <span className="text-slate-500 dark:text-slate-400">
                  {" "}
                  Build custom queries, explore strategies, or use predefined
                  screens.
                </span>
              </p>
            </div>
            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-white dark:ring-offset-slate-900 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 h-10 px-6 shadow-lg hover:shadow-xl hover:scale-105 group border border-slate-900 dark:border-white">
              <Plus className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" />
              Create New Screen
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1920px] px-4 md:px-6 lg:px-8 py-8">
        <Tabs
          value={currentTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          {/* Tabs List */}
          <div className="flex justify-center mb-12">
            <TabsList className="grid w-full max-w-4xl grid-cols-4 gap-3 h-auto bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <TabsTrigger
                value="screens"
                className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 relative group py-3 sm:py-4 px-3 rounded-xl bg-transparent hover:bg-slate-50 dark:hover:bg-slate-700/50 border-2 border-transparent data-[state=active]:border-purple-400 data-[state=active]:bg-purple-50 dark:data-[state=active]:bg-purple-900/30 data-[state=active]:shadow-md transition-all duration-200"
              >
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-purple-500 flex items-center justify-center transition-all duration-300 shadow-lg shadow-purple-500/25">
                  <Grid3X3 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="text-center sm:text-left">
                  <div className="font-semibold text-slate-700 dark:text-slate-200 group-data-[state=active]:text-slate-900 dark:group-data-[state=active]:text-white text-sm sm:text-base">
                    Templates
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 group-data-[state=active]:text-slate-600 dark:group-data-[state=active]:text-slate-300 hidden sm:block">
                    Ready-made screens
                  </div>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="strategies"
                className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 relative group py-3 sm:py-4 px-3 rounded-xl bg-transparent hover:bg-slate-50 dark:hover:bg-slate-700/50 border-2 border-transparent data-[state=active]:border-emerald-400 data-[state=active]:bg-emerald-50 dark:data-[state=active]:bg-emerald-900/30 data-[state=active]:shadow-md transition-all duration-200"
              >
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-emerald-500 flex items-center justify-center transition-all duration-300 shadow-lg shadow-emerald-500/25">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="text-center sm:text-left">
                  <div className="font-semibold text-slate-700 dark:text-slate-200 group-data-[state=active]:text-slate-900 dark:group-data-[state=active]:text-white text-sm sm:text-base">
                    Strategies
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 group-data-[state=active]:text-slate-600 dark:group-data-[state=active]:text-slate-300 hidden sm:block">
                    Proven strategies
                  </div>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="builder"
                className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 relative group py-3 sm:py-4 px-3 rounded-xl bg-transparent hover:bg-slate-50 dark:hover:bg-slate-700/50 border-2 border-transparent data-[state=active]:border-blue-400 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/30 data-[state=active]:shadow-md transition-all duration-200"
              >
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-blue-500 flex items-center justify-center transition-all duration-300 shadow-lg shadow-blue-500/25">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="text-center sm:text-left">
                  <div className="font-semibold text-slate-700 dark:text-slate-200 group-data-[state=active]:text-slate-900 dark:group-data-[state=active]:text-white text-sm sm:text-base">
                    Builder
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 group-data-[state=active]:text-slate-600 dark:group-data-[state=active]:text-slate-300 hidden sm:block">
                    Custom screens
                  </div>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="community"
                className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 relative group py-3 sm:py-4 px-3 rounded-xl bg-transparent hover:bg-slate-50 dark:hover:bg-slate-700/50 border-2 border-transparent data-[state=active]:border-amber-400 data-[state=active]:bg-amber-50 dark:data-[state=active]:bg-amber-900/30 data-[state=active]:shadow-md transition-all duration-200"
              >
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-amber-500 flex items-center justify-center transition-all duration-300 shadow-lg shadow-amber-500/25">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="text-center sm:text-left">
                  <div className="font-semibold text-slate-700 dark:text-slate-200 group-data-[state=active]:text-slate-900 dark:group-data-[state=active]:text-white text-sm sm:text-base">
                    Community
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 group-data-[state=active]:text-slate-600 dark:group-data-[state=active]:text-slate-300 hidden sm:block">
                    Shared screens
                  </div>
                </div>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="screens"
            className="space-y-6 animate-in fade-in-50 duration-300"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Grid3X3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                    Screen Templates
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Ready-to-use screens based on popular investment strategies
                  </p>
                </div>
              </div>
              <button className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200 h-10 px-4 py-2 shadow-sm hover:shadow-md">
                <Filter className="w-4 h-4 mr-2" />
                Filter & Sort
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SCREENS.map((screen, i) => (
                <Card
                  key={i}
                  onClick={() => handleRunTemplate(screen.query)}
                  className="group hover:shadow-xl transition-all duration-500 cursor-pointer border-slate-200 dark:border-slate-700 hover:border-brand/40 dark:hover:border-brand/40 relative overflow-hidden bg-white dark:bg-slate-800/50 hover:-translate-y-1 hover:scale-[1.02]"
                >
                  <div
                    className={`absolute top-0 left-0 w-2 h-full ${screen.color} opacity-0 group-hover:opacity-100 transition-all duration-300`}
                  ></div>
                  <div className="absolute inset-0 bg-linear-to-br from-transparent to-slate-50/50 dark:to-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardHeader className="pb-3 relative z-10">
                    <CardTitle className="flex items-center justify-between text-lg">
                      <span className="text-slate-800 dark:text-white group-hover:text-brand transition-colors font-heading">
                        {screen.name}
                      </span>
                      <Badge
                        variant="outline"
                        className={`font-normal text-white border-0 ${screen.color} flex items-center gap-1`}
                      >
                        <Play className="w-3 h-3" />
                        Run
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm h-10 leading-relaxed group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                      {screen.description}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700 group-hover:border-slate-200 dark:group-hover:border-slate-600 transition-colors">
                      <div className="flex gap-2 flex-wrap">
                        {screen.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-brand/10 hover:text-brand transition-all duration-200 group-hover:shadow-sm"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="w-9 h-9 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center group-hover:bg-brand group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
                        <ArrowUpRight className="w-4 h-4 text-slate-400 dark:text-slate-300 group-hover:text-black dark:group-hover:text-white transition-all duration-300 group-hover:scale-110" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent
            value="strategies"
            className="space-y-4 animate-in fade-in-50 duration-300"
          >
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                    Strategy Library
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Choose from proven investment strategies and quantitative
                    models
                  </p>
                </div>
              </div>
              <StrategyLibrary
                onOverwrite={(logic) => {
                  setQuery(logic);
                  handleTabChange("builder");
                }}
                onAppend={(logic, operator) => {
                  setQuery((prev) => {
                    const trimmed = prev.trim();
                    if (!trimmed) return logic;
                    return `${trimmed} ${operator}\n${logic}`;
                  });
                  handleTabChange("builder");
                }}
              />
            </div>
          </TabsContent>

          <TabsContent
            value="builder"
            className="space-y-4 animate-in fade-in-50 duration-300"
          >
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center">
                  <Search className="w-5 h-5 text-slate-900 dark:text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Custom Query Builder
                  </h2>
                  <p className="text-slate-500 text-sm">
                    Build your own screening criteria using our intuitive query
                    builder
                  </p>
                </div>
              </div>
              <ScreenerQueryBuilder value={query} onChange={setQuery} />
            </div>
          </TabsContent>

          <TabsContent
            value="community"
            className="space-y-6 animate-in fade-in-50 duration-300"
          >
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-dashed border-amber-300/70 dark:border-amber-500/60 p-6 md:p-10 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4 md:mb-6">
                <Users className="w-6 h-6 md:w-7 md:h-7 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white mb-2">
                Community Screens
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base max-w-xl mb-4">
                We&apos;re crafting a space where the sharpest screen ideas from
                top investors and the MarketView360 community quietly bubble up
                before they become obvious.
              </p>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-md">
                Soon you&apos;ll be able to browse, follow, and clone living,
                evolving community screens&mdash;subtle signals curated so you
                can see what serious investors are tracking before it hits the
                headlines.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
