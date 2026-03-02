"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, Lock, Search, X, Crown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/AuthProvider";
import Link from "next/link";

export function AdvancedSearchModal({
    trigger
}: {
    trigger?: React.ReactNode
}) {
    const { session } = useAuth();
    const isPro = session?.tier === "premium" || session?.tier === "pro" || session?.tier === "elite";
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className="gap-2 h-9 border-dashed text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                        <SlidersHorizontal className="w-4 h-4" />
                        <span>Advanced</span>
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden">
                {isPro ? (
                    <AdvancedSearchForm onClose={() => setOpen(false)} />
                ) : (
                    <UpgradePrompt onClose={() => setOpen(false)} />
                )}
            </DialogContent>
        </Dialog>
    );
}

function AdvancedSearchForm({ onClose }: { onClose: () => void }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [exactPhrase, setExactPhrase] = useState("");
    const [excludeWords, setExcludeWords] = useState("");
    const [ticker, setTicker] = useState(searchParams.get("ticker") ?? "");
    const [fromDate, setFromDate] = useState(searchParams.get("from") ?? "");
    const [toDate, setToDate] = useState(searchParams.get("to") ?? "");

    const handleSearch = () => {
        const sp = new URLSearchParams();

        // Build search query from exact phrase and exclusions
        let q = "";
        if (exactPhrase.trim()) {
            q = `"${exactPhrase.trim()}"`;
        }
        if (excludeWords.trim()) {
            const exclusions = excludeWords.split(",").map(w => w.trim()).filter(Boolean);
            if (q) q += " ";
            q += exclusions.map(w => `-${w}`).join(" ");
        }

        if (q) sp.set("q", q);
        if (ticker.trim()) sp.set("ticker", ticker.trim().toUpperCase());
        if (fromDate) sp.set("from", fromDate);
        if (toDate) sp.set("to", toDate);

        router.replace(`/news?${sp.toString()}`);
        onClose();
    };

    const handleClear = () => {
        setExactPhrase("");
        setExcludeWords("");
        setTicker("");
        setFromDate("");
        setToDate("");
    };

    return (
        <>
            <div className="p-5 pb-4 border-b border-slate-100 dark:border-slate-800">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <Search className="w-5 h-5 text-brand" />
                        Advanced Search
                    </DialogTitle>
                </DialogHeader>
            </div>

            <div className="p-5 space-y-4">
                <div className="space-y-1.5">
                    <Label htmlFor="exact" className="text-xs font-medium text-slate-600 dark:text-slate-400">Exact Phrase</Label>
                    <Input
                        id="exact"
                        value={exactPhrase}
                        onChange={(e) => setExactPhrase(e.target.value)}
                        placeholder='e.g. earnings beat'
                        className="h-9 text-sm"
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="exclude" className="text-xs font-medium text-slate-600 dark:text-slate-400">Exclude Words</Label>
                    <Input
                        id="exclude"
                        value={excludeWords}
                        onChange={(e) => setExcludeWords(e.target.value)}
                        placeholder="e.g. crypto, nft"
                        className="h-9 text-sm"
                    />
                    <p className="text-[11px] text-slate-400">Comma-separated words to exclude</p>
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="adv-ticker" className="text-xs font-medium text-slate-600 dark:text-slate-400">Ticker Symbol</Label>
                    <Input
                        id="adv-ticker"
                        value={ticker}
                        onChange={(e) => setTicker(e.target.value.toUpperCase())}
                        placeholder="e.g. AAPL, TSLA"
                        className="h-9 text-sm"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">From Date</Label>
                        <Input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="h-9 text-sm"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">To Date</Label>
                        <Input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="h-9 text-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={handleClear} className="text-xs text-slate-500 hover:text-slate-700">
                    <X className="w-3 h-3 mr-1" />
                    Clear
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleSearch}
                        className="bg-brand hover:bg-brand/90 text-white gap-1.5"
                    >
                        <Search className="w-3.5 h-3.5" />
                        Search
                    </Button>
                </div>
            </div>
        </>
    );
}

function UpgradePrompt({ onClose }: { onClose: () => void }) {
    return (
        <div className="p-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center">
                <Crown className="w-6 h-6 text-brand" />
            </div>
            <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Premium Feature
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Advanced search is available on Premium and Elite plans.
                </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
                {["Exact phrase search", "Exclude keywords", "Full date range", "Ticker filtering"].map((f) => (
                    <Badge key={f} variant="secondary" className="text-xs font-normal">
                        {f}
                    </Badge>
                ))}
            </div>
            <div className="flex gap-2 justify-center pt-2">
                <Button variant="outline" size="sm" onClick={onClose}>
                    Maybe Later
                </Button>
                <Link href="/pricing">
                    <Button size="sm" className="bg-brand hover:bg-brand/90 text-white gap-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        View Plans
                    </Button>
                </Link>
            </div>
        </div>
    );
}
