"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Plus, GitCompareArrows, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CompanyLogo } from "@/components/company/CompanyLogo";
import { useWatchlist } from "@/providers/WatchlistProvider";
import type { WatchlistWithItems } from "@/providers/WatchlistProvider";

interface PeerMetrics {
  ticker: string;
  name: string;
  exchange: string | null;
  sector: string | null;
  industry: string | null;
  price: number | null;
  refund_1d_p: number | null;
  market_capitalization: number | null;
  pe_ratio: number | null;
  forward_pe: number | null;
}

interface SimilarStocksProps {
  watchlist: WatchlistWithItems;
  onAddToComparison?: (tickers: string[]) => void;
}

const formatMarketCap = (n: number | null) => {
  if (n == null) return "—";
  const abs = Math.abs(n);
  if (abs >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString()}`;
};

export function SimilarStocks({ watchlist, onAddToComparison }: SimilarStocksProps) {
  const [peers, setPeers] = useState<PeerMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingTicker, setAddingTicker] = useState<string | null>(null);
  const { addToWatchlist } = useWatchlist();

  const watchlistTickers = useMemo(() => 
    watchlist.items.map(i => i.ticker.replace(/\.US$/i, '').toUpperCase()),
    [watchlist.items]
  );

  useEffect(() => {
    if (watchlist.items.length === 0) {
      setPeers([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
        
        // Fetch peers for ALL stocks in watchlist to get diverse results across sectors
        const allPeersPromises = watchlistTickers.slice(0, 10).map(ticker => 
          fetch(`${baseUrl}/api/company/${ticker}/peers`)
            .then(res => res.ok ? res.json() : [])
            .catch(() => [])
        );
        
        const allPeersResults = await Promise.all(allPeersPromises);
        
        if (cancelled) return;
        
        // Merge and deduplicate all peers
        const allPeers: PeerMetrics[] = [];
        const seenTickers = new Set<string>();
        
        for (const peerList of allPeersResults) {
          const peers = Array.isArray(peerList) ? peerList : [];
          for (const peer of peers) {
            const peerCode = (peer.ticker || '').replace(/\.US$/i, '').toUpperCase();
            
            // Skip if already in watchlist or already added
            if (!peerCode || watchlistTickers.includes(peerCode) || seenTickers.has(peerCode)) {
              continue;
            }
            
            seenTickers.add(peerCode);
            allPeers.push(peer);
          }
        }
        
        // Sort by market cap (descending) and take top 10
        const sorted = allPeers
          .filter(p => p.market_capitalization != null)
          .sort((a, b) => (b.market_capitalization || 0) - (a.market_capitalization || 0))
          .slice(0, 10);
        
        console.log('[SimilarStocks] Fetched peers from', watchlistTickers.length, 'stocks');
        console.log('[SimilarStocks] Found', allPeers.length, 'unique peers, showing top 10');
        console.log('[SimilarStocks] Peer sectors:', sorted.map(p => `${p.ticker}:${p.sector}`));
        
        setPeers(sorted);
      } catch (err) {
        if (!cancelled) console.error("Error loading similar stocks:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [watchlistTickers]);

  const handleAddStock = async (ticker: string) => {
    setAddingTicker(ticker);
    try {
      await addToWatchlist(watchlist.id, ticker);
      const { toast } = await import("sonner");
      toast.success(`Added ${ticker} to watchlist`);
      // Remove from peers list
      setPeers(prev => prev.filter(p => p.ticker !== ticker));
    } catch (err) {
      const { toast } = await import("sonner");
      toast.error(`Failed to add ${ticker}`);
    } finally {
      setAddingTicker(null);
    }
  };

  const handleAddAllToWatchlist = async () => {
    if (peers.length === 0) return;
    
    setAddingTicker('all');
    let added = 0;
    
    for (const peer of peers) {
      try {
        await addToWatchlist(watchlist.id, peer.ticker);
        added++;
      } catch (err) {
        console.error(`Failed to add ${peer.ticker}:`, err);
      }
    }
    
    setAddingTicker(null);
    const { toast } = await import("sonner");
    if (added > 0) {
      toast.success(`Added ${added} stock${added !== 1 ? 's' : ''} to watchlist`);
      setPeers([]);
    } else {
      toast.error('Failed to add stocks');
    }
  };

  const handleAddAllToComparison = () => {
    if (peers.length === 0 || !onAddToComparison) return;
    onAddToComparison(peers.map(p => p.ticker));
    const { toast } = import("sonner");
    toast.then(t => t.toast.success(`Added ${peers.length} stocks to comparison`));
  };

  if (watchlist.items.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-brand" />
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Similar Stocks
            </h3>
            {!loading && peers.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {peers.length} peers
              </Badge>
            )}
          </div>
          {!loading && peers.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={handleAddAllToComparison}
                disabled={!onAddToComparison}
              >
                <GitCompareArrows className="w-3.5 h-3.5" />
                Compare All
              </Button>
              <Button
                variant="default"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={handleAddAllToWatchlist}
                disabled={addingTicker === 'all'}
              >
                {addingTicker === 'all' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                Add All
              </Button>
            </div>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Stocks in similar sector/industry as your watchlist
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-brand" />
        </div>
      ) : peers.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">
          No similar stocks found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/50 dark:bg-slate-800/30">
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  1D Change
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Market Cap
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  P/E
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Fwd P/E
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Sector
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {peers.map((peer, idx) => (
                <tr
                  key={peer.ticker}
                  className={`${idx % 2 === 0 ? '' : 'bg-slate-50/30 dark:bg-slate-800/10'} hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-colors`}
                >
                  <td className="px-4 py-3">
                    <Link href={`/company/${peer.ticker}`} className="flex items-center gap-2 group">
                      <CompanyLogo ticker={peer.ticker} name={peer.name} size="sm" />
                      <div className="min-w-0">
                        <div className="font-medium text-slate-900 dark:text-white truncate group-hover:text-brand transition-colors">
                          {peer.ticker}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                          {peer.name}
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-700 dark:text-slate-300">
                    {peer.price != null ? `$${peer.price.toFixed(2)}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {peer.refund_1d_p != null ? (
                      <span className={`font-mono font-semibold ${peer.refund_1d_p >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {peer.refund_1d_p >= 0 ? '+' : ''}{peer.refund_1d_p.toFixed(2)}%
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-700 dark:text-slate-300">
                    {formatMarketCap(peer.market_capitalization)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-700 dark:text-slate-300">
                    {peer.pe_ratio != null ? peer.pe_ratio.toFixed(2) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-700 dark:text-slate-300">
                    {peer.forward_pe != null ? peer.forward_pe.toFixed(2) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-700 dark:text-slate-300">
                    {peer.sector || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 gap-1 text-xs"
                        onClick={() => onAddToComparison?.([peer.ticker])}
                        disabled={!onAddToComparison}
                      >
                        <GitCompareArrows className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 gap-1 text-xs"
                        onClick={() => handleAddStock(peer.ticker)}
                        disabled={addingTicker === peer.ticker}
                      >
                        {addingTicker === peer.ticker ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Plus className="w-3 h-3" />
                        )}
                        Add
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
