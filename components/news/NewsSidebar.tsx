"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, BookOpen, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const TRENDING_TOPICS = [
    { name: "Artificial Intelligence", count: 420 },
    { name: "Federal Reserve", count: 350 },
    { name: "Earnings Season", count: 280 },
    { name: "Crypto Regulation", count: 210 },
    { name: "EV Market", count: 180 },
    { name: "Oil & Gas", count: 150 },
    { name: "Semiconductors", count: 120 },
    { name: "Housing Market", count: 95 },
];

const MOST_READ = [
    { id: 1, title: "NVIDIA Announces New AI Chip Architecture", time: "2h ago" },
    { id: 2, title: "JP Morgan CEO Warns of Economic Headwinds", time: "4h ago" },
    { id: 3, title: "Tesla Misses Delivery Targets, Stock Slips", time: "6h ago" },
    { id: 4, title: "Apple Vision Pro 2 Rumors Heat Up", time: "8h ago" },
    { id: 5, title: "Bitcoin Reaches New All-Time High", time: "12h ago" },
];

export function NewsSidebar() {
    return (
        <div className="space-y-6">
            {/* Trending Topics */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                    <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-brand" />
                        Trending Topics
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="flex flex-wrap gap-2">
                        {TRENDING_TOPICS.map((topic) => (
                            <Badge
                                key={topic.name}
                                variant="secondary"
                                className="cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-normal"
                            >
                                {topic.name}
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Most Read */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                    <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-brand" />
                        Most Read
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="space-y-4">
                        {MOST_READ.map((article, index) => (
                            <div key={article.id} className="group cursor-pointer">
                                <div className="flex gap-3">
                                    <span className="text-xl font-bold text-slate-200 dark:text-slate-700 group-hover:text-brand transition-colors">
                                        {index + 1}
                                    </span>
                                    <div>
                                        <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-snug group-hover:text-brand transition-colors line-clamp-2">
                                            {article.title}
                                        </h4>
                                        <span className="text-xs text-slate-400 mt-1 block">
                                            {article.time}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Newsletter Promo */}
            <div className="rounded-xl bg-gradient-to-br from-brand/10 to-brand/5 dark:from-brand/20 dark:to-transparent p-5 border border-brand/10 dark:border-brand/20">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Daily Market Brief</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-4">
                    Get the most important market news delivered to your inbox before the bell.
                </p>
                <button className="w-full py-2 px-4 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors shadow-sm">
                    Subscribe Free
                </button>
            </div>
        </div>
    );
}
