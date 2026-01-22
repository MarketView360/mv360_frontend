"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, Lock, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/providers/AuthProvider";
import { PaywallModal } from "@/components/paywall/PaywallModal";

export function AdvancedSearchModal({
    trigger
}: {
    trigger?: React.ReactNode
}) {
    const { session } = useAuth();
    const isPro = session?.tier === "pro" || session?.tier === "elite";
    const [open, setOpen] = useState(false);
    const [showPaywall, setShowPaywall] = useState(false);

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            setOpen(false);
            return;
        }

        if (!isPro) {
            setShowPaywall(true);
            return;
        }

        setOpen(true);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>
                    {trigger || (
                        <Button variant="outline" size="sm" className="gap-2 h-9 border-dashed text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                            <SlidersHorizontal className="w-4 h-4" />
                            <span>Advanced</span>
                        </Button>
                    )}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Advanced Search</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="exact">Exact Phrase</Label>
                            <Input id="exact" placeholder="e.g. 'earnings beat'" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="exclude">Exclude Words</Label>
                            <Input id="exclude" placeholder="e.g. 'crypto', 'nft'" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Source</Label>
                                <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300">
                                    <option>All Sources</option>
                                    <option>Bloomberg</option>
                                    <option>Reuters</option>
                                    <option>WSJ</option>
                                    <option>CNBC</option>
                                </select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Sentiment</Label>
                                <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300">
                                    <option>Any Sentiment</option>
                                    <option>Positive</option>
                                    <option>Negative</option>
                                    <option>Neutral</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button className="bg-brand hover:bg-brand/90 text-white gap-2">
                            <Search className="w-4 h-4" />
                            Search
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <PaywallModal
                isOpen={showPaywall}
                onClose={() => setShowPaywall(false)}
                feature="Advanced News Search"
                benefits={[
                    "Search by exact phrase",
                    "Exclude keywords",
                    "Filter by sentiment (AI)",
                    "Select specific sources"
                ]}
            />
        </>
    );
}
