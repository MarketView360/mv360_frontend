"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface Tab {
    id: string;
    label: string;
    href: string;
}

interface CompanyNavigationProps {
    ticker: string;
    currentTab: string;
}

export function CompanyNavigation({ ticker, currentTab: initialTab }: CompanyNavigationProps) {
    const pathname = usePathname();
    const isMainPage = pathname === `/company/${ticker}`;
    const [activeTab, setActiveTab] = useState(initialTab);

    const tabs: Tab[] = [
        { id: "overview", label: "Overview", href: `/company/${ticker}` },
        { id: "peers", label: "Peers", href: `/company/${ticker}/peers` },
        { id: "news", label: "News", href: `/company/${ticker}/news` },
    ];

    // Listen for scroll to update active tab
    useEffect(() => {
        if (!isMainPage) return;

        const handleScroll = () => {
            const sections = tabs
                .filter(tab => ["overview", "peers", "news"].includes(tab.id))
                .map(tab => document.getElementById(tab.id))
                .filter(Boolean) as HTMLElement[];

            const scrollPosition = window.scrollY + 160; // Offset for sticky headers

            for (const section of sections) {
                if (
                    scrollPosition >= section.offsetTop &&
                    scrollPosition < section.offsetTop + section.offsetHeight
                ) {
                    setActiveTab(section.id);
                    break;
                }
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isMainPage, tabs]);

    const handleTabClick = (e: React.MouseEvent<HTMLAnchorElement>, tab: Tab) => {
        const isInternalSection = ["overview", "peers", "news"].includes(tab.id);

        if (isMainPage && isInternalSection) {
            e.preventDefault();
            const element = document.getElementById(tab.id);
            if (element) {
                const offset = 140; // Total height of sticky headers
                const elementPosition = element.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
                setActiveTab(tab.id);
            }
        }
    };

    return (
        <div className="bg-white/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 -mx-4 px-4 md:-mx-8 md:px-8 lg:-mx-12 lg:px-12 transition-colors duration-300">
            <div className="mx-auto max-w-[1600px]">
                <div className="flex items-center overflow-x-auto no-scrollbar">
                    <div className="flex gap-1 py-1">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            const isInternalSection = ["overview", "peers", "news"].includes(tab.id);
                            const href = isMainPage && isInternalSection ? `#${tab.id}` : tab.href;

                            return (
                                <Link
                                    key={tab.id}
                                    href={href}
                                    onClick={(e) => handleTabClick(e, tab)}
                                    className={cn(
                                        "px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap",
                                        isActive
                                            ? "bg-brand/10 text-brand dark:bg-brand/20"
                                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                                    )}
                                >
                                    <div className="relative">
                                        {tab.label}
                                        {isActive && (
                                            <div className="absolute -bottom-[6px] inset-x-0 h-0.5 bg-brand rounded-full" />
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
