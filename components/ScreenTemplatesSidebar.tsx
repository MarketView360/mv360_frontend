"use client";

import React from "react";

export const TEMPLATES = [
    {
        name: "The Bull Cartel",
        description:
            "High momentum stocks breaking out with strong price performance and volume.",
        tags: ["Momentum", "Technical"],
        color: "bg-yellow-500",
        query: `Price Change 1d > 5 AND
Volume > 500000 AND
Market Capitalization > 1000`,
    },
    {
        name: "Undervalued Growth",
        description:
            "Companies with >20% revenue growth trading at a PEG ratio under 1.5.",
        tags: ["Growth", "Value"],
        color: "bg-green-500",
        query: `PEG Ratio < 1.5 AND
PEG Ratio > 0 AND
Price to Sales < 5 AND
Market Capitalization > 500`,
    },
    {
        name: "Coffee Can Portfolio",
        description:
            "Consistent compounders with high ROE (>15%) and quality metrics.",
        tags: ["Long Term", "Quality"],
        color: "bg-blue-500",
        query: `ROE > 15 AND
ROA > 10 AND
Operating Margin > 15 AND
Market Capitalization > 1000`,
    },
    {
        name: "Magic Formula",
        description: "High Return on Capital and High Earnings Yield (Greenblatt).",
        tags: ["Value", "Quality"],
        color: "bg-purple-500",
        query: `ROA > 15 AND
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
Net Debt < 5000 AND
Market Capitalization > 1000`,
    },
    {
        name: "Low Debt Quality",
        description: "Profitable companies with low debt and high profit margins.",
        tags: ["Quality", "Safe"],
        color: "bg-pink-500",
        query: `Net Debt < 1000 AND
OPM > 15 AND
ROE > 12 AND
Current Assets > Current Liabilities AND
Market Capitalization > 500`,
    },
];

interface ScreenTemplatesSidebarProps {
    onTemplateSelect: (query: string) => void;
}

export default function ScreenTemplatesSidebar({
    onTemplateSelect,
}: ScreenTemplatesSidebarProps) {
    return (
        <div className="space-y-6 animate-in fade-in-50 duration-300">
            <div className="space-y-4">
                {TEMPLATES.map((template, i) => (
                    <div
                        key={i}
                        className="group flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
                        onClick={() => onTemplateSelect(template.query)}
                    >
                        <div className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${template.color}`} />
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-1">
                                {template.name}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-2">
                                {template.description}
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {template.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
