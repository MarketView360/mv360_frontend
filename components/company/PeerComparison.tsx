"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UsdValue } from "@/components/company/UsdValue";

interface PeerRow {
    ticker: string;
    name: string;
    exchange: string | null;
    sector: string | null;
    industry: string | null;
    market_capitalization: number | null;
    price: number | null;
    pe_ratio: number | null;
    refund_1d_p: number | null;
}

const formatMarketCap = (n: number | null) => {
    if (n == null) return "—";
    const abs = Math.abs(n);
    if (abs >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (abs >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (abs >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    return `$${n.toLocaleString()}`;
};

export function PeerComparison({
    ticker,
    sector,
    exchange,
    initialData,
}: {
    ticker: string;
    sector: string | null;
    exchange: string | null;
    initialData?: PeerRow[];
}) {
    const [peers, setPeers] = useState<PeerRow[]>(initialData || []);
    const [loading, setLoading] = useState(!initialData);

    useEffect(() => {
        if (initialData) return;
        async function loadPeers() {
            const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
            const params = new URLSearchParams();
            if (exchange) {
                params.set("exchange", exchange);
            }

            try {
                const res = await fetch(
                    `${baseUrl}/api/company/${encodeURIComponent(ticker)}/peers?${params.toString()}`
                );
                if (res.ok) {
                    const data = (await res.json()) as PeerRow[];
                    setPeers(data);
                }
            } catch (err) {
                console.error("Failed to load peers:", err);
            } finally {
                setLoading(false);
            }
        }
        loadPeers();
    }, [ticker, exchange]);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Peer Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-32 bg-slate-50 dark:bg-slate-900/50 animate-pulse rounded-lg" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Peer Comparison</CardTitle>
            </CardHeader>
            <CardContent>
                {peers.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {sector
                            ? `No peers found in the ${sector} sector yet.`
                            : "No peers found for this company yet."}
                    </p>
                ) : (
                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-sm">
                            <thead className="text-xs uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                                <tr>
                                    <th className="py-2 text-left">Ticker</th>
                                    <th className="py-2 text-left">Name</th>
                                    <th className="py-2 text-right">Price</th>
                                    <th className="py-2 text-right">Mkt Cap</th>
                                    <th className="py-2 text-right">P/E</th>
                                    <th className="py-2 text-right">1D %</th>
                                </tr>
                            </thead>
                            <tbody>
                                {peers.map((peer) => (
                                    <tr
                                        key={peer.ticker}
                                        className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors"
                                    >
                                        <td className="py-2 font-semibold">
                                            <Link
                                                href={`/company/${encodeURIComponent(peer.ticker)}`}
                                                className="text-brand hover:underline"
                                            >
                                                {peer.ticker}
                                            </Link>
                                        </td>
                                        <td className="py-2 truncate max-w-[160px]">{peer.name}</td>
                                        <td className="py-2 text-right font-mono">
                                            {peer.price != null ? (
                                                <UsdValue amount={peer.price} />
                                            ) : (
                                                "—"
                                            )}
                                        </td>
                                        <td className="py-2 text-right font-mono">
                                            {peer.market_capitalization != null
                                                ? formatMarketCap(peer.market_capitalization)
                                                : "—"}
                                        </td>
                                        <td className="py-2 text-right font-mono">
                                            {peer.pe_ratio != null ? peer.pe_ratio.toFixed(2) : "—"}
                                        </td>
                                        <td className="py-2 text-right font-mono">
                                            {peer.refund_1d_p != null
                                                ? `${peer.refund_1d_p.toFixed(2)}%`
                                                : "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
