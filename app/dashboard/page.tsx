"use client";

import Link from "next/link";
import {
    Star,
    Filter,
    Briefcase,
    Bell,
    MessageSquare,
    ArrowRight,
    Plus,
    Lock,
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { UsageIndicator, FeatureBadge, PaywallOverlay } from "@/components/paywall";
import { GoogleAdSlot } from "@/components/GoogleAdSlot";

export default function DashboardPage() {
    const { user } = useAuth();
    const userName = user?.user_metadata?.name || user?.email?.split("@")[0] || "User";
    const userTier = (user?.user_metadata?.tier as "free" | "premium" | "elite") || "free";
    const isPremium = userTier === "premium" || userTier === "elite";

    // Sample data - in production this would come from API
    const quickStats = [
        { label: "Active Watchlists", value: 3, max: userTier === "free" ? 3 : null, icon: Star },
        { label: "Saved Screeners", value: 2, max: userTier === "free" ? 3 : null, icon: Filter },
        { label: "Active Alerts", value: isPremium ? 5 : null, locked: !isPremium, icon: Bell },
        { label: "AI Questions Today", value: 2, max: 5, icon: MessageSquare },
    ];

    const recentWatchlists = [
        { name: "Tech Giants", stockCount: 8, dayChange: 1.23 },
        { name: "Dividend Kings", stockCount: 12, dayChange: -0.45 },
        { name: "Growth Picks", stockCount: 5, dayChange: 2.87 },
    ];

    const recentScreeners = [
        { name: "Value Stocks", lastRun: "2 hours ago", resultsCount: 45 },
        { name: "High ROE Growth", lastRun: "1 day ago", resultsCount: 23 },
    ];

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    Welcome back, {userName}
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                    Here&apos;s an overview of your investment activities
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickStats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={index}
                            className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Icon className="w-5 h-5 text-brand" />
                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                    {stat.label}
                                </span>
                            </div>
                            {stat.locked ? (
                                <div className="flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm text-slate-400">Upgrade to Pro</span>
                                </div>
                            ) : (
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {stat.value}
                                    </span>
                                    {stat.max && (
                                        <span className="text-sm text-slate-500">/ {stat.max}</span>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Ad Placement - Between quick stats and widget grid */}
            <GoogleAdSlot />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Watchlists Widget */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                        <h2 className="font-semibold text-slate-900 dark:text-white">
                            My Watchlists
                        </h2>
                        <Link
                            href="/watchlist"
                            className="text-sm text-brand hover:text-brand-600 font-medium flex items-center gap-1"
                        >
                            View All <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="p-4 space-y-3">
                        {recentWatchlists.map((watchlist, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center">
                                        <Star className="w-4 h-4 text-brand" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">
                                            {watchlist.name}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {watchlist.stockCount} stocks
                                        </p>
                                    </div>
                                </div>
                                <span
                                    className={`text-sm font-medium ${watchlist.dayChange >= 0
                                        ? "text-growth-600 dark:text-growth-400"
                                        : "text-danger-600 dark:text-danger-400"
                                        }`}
                                >
                                    {watchlist.dayChange >= 0 ? "+" : ""}
                                    {watchlist.dayChange.toFixed(2)}%
                                </span>
                            </div>
                        ))}

                        {/* Create new watchlist */}
                        {userTier === "free" && recentWatchlists.length >= 3 ? (
                            <div className="p-3 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 text-center">
                                <Lock className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Upgrade for unlimited watchlists
                                </p>
                            </div>
                        ) : (
                            <button className="w-full p-3 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-brand hover:text-brand transition-colors flex items-center justify-center gap-2">
                                <Plus className="w-4 h-4" />
                                Create New Watchlist
                            </button>
                        )}
                    </div>
                </div>

                {/* Screeners Widget */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                        <h2 className="font-semibold text-slate-900 dark:text-white">
                            Recent Screeners
                        </h2>
                        <Link
                            href="/dashboard/screeners"
                            className="text-sm text-brand hover:text-brand-600 font-medium flex items-center gap-1"
                        >
                            View All <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="p-4 space-y-3">
                        {recentScreeners.map((screener, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-elite/10 flex items-center justify-center">
                                        <Filter className="w-4 h-4 text-elite" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">
                                            {screener.name}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {screener.lastRun} • {screener.resultsCount} results
                                        </p>
                                    </div>
                                </div>
                                <button className="px-3 py-1.5 text-sm font-medium text-brand hover:bg-brand/10 rounded-lg transition-colors">
                                    Run
                                </button>
                            </div>
                        ))}

                        <Link
                            href="/screens"
                            className="w-full p-3 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-brand hover:text-brand transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Create New Screen
                        </Link>
                    </div>
                </div>
            </div>

            {/* Portfolio Widget - Premium Paywall */}
            <div className="relative">
                {!isPremium ? (
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8">
                        <div className="flex items-center gap-2 mb-4">
                            <Briefcase className="w-5 h-5 text-slate-400" />
                            <h2 className="font-semibold text-slate-900 dark:text-white">
                                Portfolio Tracking
                            </h2>
                            <FeatureBadge tier="premium" />
                        </div>

                        {/* Blurred preview */}
                        <div className="filter blur-sm pointer-events-none select-none opacity-50">
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                                    <p className="text-sm text-slate-500">Total Value</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">$125,430</p>
                                </div>
                                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                                    <p className="text-sm text-slate-500">Day Change</p>
                                    <p className="text-2xl font-bold text-growth-600">+$1,234</p>
                                </div>
                                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                                    <p className="text-sm text-slate-500">Total Return</p>
                                    <p className="text-2xl font-bold text-growth-600">+23.4%</p>
                                </div>
                            </div>
                        </div>

                        {/* Paywall overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-800/50 rounded-xl">
                            <PaywallOverlay
                                tier="premium"
                                feature="Portfolio Tracking"
                                benefits={[
                                    "Track your investment portfolio",
                                    "Real-time performance analytics",
                                    "Multiple portfolio support (Elite)",
                                    "Tax lot tracking",
                                ]}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-brand" />
                                <h2 className="font-semibold text-slate-900 dark:text-white">
                                    My Portfolio
                                </h2>
                            </div>
                            <Link
                                href="/dashboard/portfolio"
                                className="text-sm text-brand hover:text-brand-600 font-medium flex items-center gap-1"
                            >
                                View Details <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                                <p className="text-sm text-slate-500 dark:text-slate-400">Total Value</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">$125,430</p>
                            </div>
                            <div className="p-4 rounded-lg bg-growth-50 dark:bg-growth-900/20">
                                <p className="text-sm text-slate-500 dark:text-slate-400">Day Change</p>
                                <p className="text-2xl font-bold text-growth-600 dark:text-growth-400">+$1,234</p>
                            </div>
                            <div className="p-4 rounded-lg bg-growth-50 dark:bg-growth-900/20">
                                <p className="text-sm text-slate-500 dark:text-slate-400">Total Return</p>
                                <p className="text-2xl font-bold text-growth-600 dark:text-growth-400">+23.4%</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* AI Usage */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <MessageSquare className="w-5 h-5 text-brand" />
                        <div>
                            <p className="font-medium text-slate-900 dark:text-white">AI Assistant Usage</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {isPremium ? "100 questions per day" : "5 questions per day (Free tier)"}
                            </p>
                        </div>
                    </div>
                    <UsageIndicator
                        current={2}
                        limit={isPremium ? 100 : 5}
                        label="questions"
                        showUpgrade={!isPremium}
                    />
                </div>
            </div>
        </div>
    );
}
