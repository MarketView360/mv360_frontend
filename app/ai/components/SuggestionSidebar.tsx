"use client";

import React, { useState } from "react";
import { Lightbulb, TrendingUp, Search, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SuggestionSidebarProps {
    onSuggestionClick: (text: string) => void;
    isOpen?: boolean;
    onToggle?: () => void;
    className?: string;
}

const MARKET_INSIGHTS = [
    { title: "Market Movers", description: "Who is moving pre-market?", prompt: "Analyze pre-market movers today and identify key catalysts." },
    { title: "Earnings Watch", description: "Upcoming reports this week", prompt: "List the most anticipated earnings reports for this week and their expected impact." },
    { title: "Sector Rotation", description: "Where is money flowing?", prompt: "Analyze current sector rotation trends. Which sectors are gaining momentum?" },
    { title: "Macro Outlook", description: "Fed updates & inflation", prompt: "Summarize the latest Federal Reserve comments and their potential impact on interest rates." },
];

const PROMPTS = [
    "Screen for undervalued tech stocks with high growth",
    "Explain the difference between P/E and PEG ratios",
    "Find stocks with a Dividend Yield > 4%",
    "Analyze the technical setup for NVDA",
    "What are the risks of investing in emerging markets?",
    "Create a diversified portfolio for a 5-year horizon",
];

export function SuggestionSidebar({
    onSuggestionClick,
    isOpen = true,
    onToggle,
    className,
}: SuggestionSidebarProps) {
    return (
        <div
            className={cn(
                "border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-all duration-300 flex flex-col",
                isOpen ? "w-80" : "w-0 overflow-hidden border-none",
                className
            )}
        >
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand" />
                    Suggestions
                </h3>
                {onToggle && (
                    <Button variant="ghost" size="icon" onClick={onToggle} className="h-8 w-8">
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                )}
            </div>

            <ScrollArea className="flex-1">
                <div className="p-4 space-y-6">
                    {/* Market Insights */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <TrendingUp className="w-3 h-3" />
                            Market Insights
                        </h4>
                        <div className="grid gap-3">
                            {MARKET_INSIGHTS.map((item, i) => (
                                <Card
                                    key={i}
                                    className="cursor-pointer hover:border-brand/50 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                                    onClick={() => onSuggestionClick(item.prompt)}
                                >
                                    <CardContent className="p-3">
                                        <h5 className="text-sm font-medium text-slate-900 dark:text-slate-200 mb-1">
                                            {item.title}
                                        </h5>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {item.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Quick Prompts */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <Lightbulb className="w-3 h-3" />
                            Try These Prompts
                        </h4>
                        <div className="space-y-2">
                            {PROMPTS.map((prompt, i) => (
                                <button
                                    key={i}
                                    onClick={() => onSuggestionClick(prompt)}
                                    className="w-full text-left p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 hover:bg-brand/10 dark:hover:bg-brand/20 hover:text-brand transition-colors text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2 group"
                                >
                                    <Search className="w-3.5 h-3.5 mt-0.5 opacity-50 group-hover:opacity-100" />
                                    <span className="leading-snug">{prompt}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}

// Compact toggle button when sidebar is closed
export function SuggestionSidebarToggle({ onClick }: { onClick: () => void }) {
    return (
        <div className="absolute top-1/2 right-0 -translate-y-1/2 z-10">
            <Button
                variant="secondary"
                size="icon"
                onClick={onClick}
                className="h-12 w-8 rounded-l-lg rounded-r-none border border-r-0 border-slate-200 dark:border-slate-800 shadow-md bg-white dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900"
                title="Show suggestions"
            >
                <Lightbulb className="w-4 h-4 text-amber-500" />
            </Button>
        </div>
    );
}
