"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Star,
    Filter,
    Briefcase,
    Bell,
    MessageSquare,
    Settings,
    Lock,
    Crown,
    ChevronUp,
} from "lucide-react";
import { FeatureBadge, type BadgeTier } from "@/components/paywall";

interface NavItem {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: BadgeTier;
}

const navItems: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/watchlist", label: "My Watchlists", icon: Star },
    { href: "/dashboard/screeners", label: "My Screeners", icon: Filter },
    { href: "/dashboard/portfolio", label: "My Portfolio", icon: Briefcase, badge: "premium" },
    { href: "/dashboard/alerts", label: "Alerts", icon: Bell, badge: "premium" },
    { href: "/dashboard/ai-history", label: "AI History", icon: MessageSquare },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

interface DashboardSidebarProps {
    userTier?: "free" | "pro" | "elite";
    userName?: string;
}

export function DashboardSidebar({
    userTier = "free",
    userName = "User",
}: DashboardSidebarProps) {
    const pathname = usePathname();

    const getTierBadge = () => {
        if (userTier === "elite") {
            return (
                <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-elite" />
                    <span className="text-elite font-medium">Elite</span>
                </div>
            );
        }
        if (userTier === "pro") {
            return (
                <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-warning" />
                    <span className="text-warning font-medium">Pro</span>
                </div>
            );
        }
        return (
            <div className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Free Plan</span>
            </div>
        );
    };

    return (
        <aside className="w-64 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-full flex flex-col">
            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    const isLocked = item.badge && userTier === "free";

                    return (
                        <Link
                            key={item.href}
                            href={isLocked ? "/pricing" : item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? "bg-brand/10 text-brand"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                                } ${isLocked ? "opacity-75" : ""}`}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="flex-1">{item.label}</span>
                            {item.badge && (
                                <FeatureBadge tier={item.badge} size="sm" showIcon={false} />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom section */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                {/* Tier Badge */}
                <div className="flex items-center justify-between mb-3">
                    {getTierBadge()}
                    {userTier === "free" && (
                        <Link
                            href="/pricing"
                            className="text-xs text-brand hover:text-brand-600 font-medium"
                        >
                            Upgrade
                        </Link>
                    )}
                </div>

                {/* User quick info */}
                <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand to-brand-600 flex items-center justify-center text-white font-bold text-sm">
                        {userName[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                            {userName}
                        </p>
                    </div>
                    <button className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                    </button>
                </div>
            </div>
        </aside>
    );
}
