"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, ArrowRight, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { WatchlistWithItems } from "@/providers/WatchlistProvider";

interface AnalyzeWithAIProps {
  watchlist: WatchlistWithItems;
  stockMetrics?: Map<string, {
    price?: number | null;
    price_change_1d?: number | null;
    price_change_1m?: number | null;
    market_cap?: number | null;
    pe_ratio?: number | null;
    eps_ttm?: number | null;
    sector?: string | null;
  }>;
}

const AI_SUGGESTIONS = [
  {
    id: "describe",
    text: "Describe my watchlist",
    prompt: "Please analyze and describe my watchlist. What are the key characteristics of the stocks I'm tracking?",
  },
  {
    id: "performance",
    text: "How are the tickers in my watchlist performing?",
    prompt: "How are the stocks in my watchlist currently performing? Please provide an overview of their recent price movements and trends.",
  },
  {
    id: "suggest",
    text: "Suggest more stocks to add to my watchlist",
    prompt: "Based on the stocks in my watchlist, can you suggest similar stocks or opportunities I should consider adding?",
  },
  {
    id: "risk",
    text: "Analyze the risk profile of my watchlist",
    prompt: "What is the overall risk profile of my watchlist? Are there any concerning patterns or concentrations?",
  },
  {
    id: "diversification",
    text: "Is my watchlist well diversified?",
    prompt: "Please evaluate the diversification of my watchlist. Are there sectors or asset types I should consider adding?",
  },
];

const formatMarketCap = (n: number | null | undefined) => {
  if (n == null) return "N/A";
  const abs = Math.abs(n);
  if (abs >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString()}`;
};

export function AnalyzeWithAI({ watchlist, stockMetrics }: AnalyzeWithAIProps) {
  const [open, setOpen] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [customMessage, setCustomMessage] = useState("");
  const [isDataReady, setIsDataReady] = useState(false);
  const router = useRouter();

  // Check if we have metrics data for all stocks
  useEffect(() => {
    if (!stockMetrics || stockMetrics.size === 0) {
      setIsDataReady(false);
      return;
    }
    
    // Check if we have at least some data for the stocks
    const hasData = watchlist.items.some(item => {
      const ticker = item.ticker.replace(/\.US$/i, '').toUpperCase();
      return stockMetrics.has(ticker);
    });
    
    setIsDataReady(hasData);
  }, [stockMetrics, watchlist.items]);

  const buildSystemContext = () => {
    const stocks = watchlist.items.map((item) => {
      const ticker = item.ticker.replace(/\.US$/i, '').toUpperCase();
      const metrics = stockMetrics?.get(ticker);
      
      return {
        ticker,
        notes: item.notes || "",
        added_date: item.added_at,
        metrics: metrics || null,
      };
    });

    // Build detailed system context with all metrics (hidden from user)
    const stockDetails = stocks.map((s, i) => {
      const parts = [`${i + 1}. ${s.ticker}`];
      const m = s.metrics;
      
      if (!m) {
        parts.push('⚠️ Data not available');
        if (s.notes) parts.push(`Notes: ${s.notes}`);
        return parts.join(' | ');
      }
      
      // Company info
      if (m.sector) parts.push(`Sector: ${m.sector}`);
      
      // Price & Performance
      if (m.price != null) parts.push(`Price: $${m.price.toFixed(2)}`);
      if (m.price_change_1d != null) parts.push(`1D: ${m.price_change_1d >= 0 ? '+' : ''}${m.price_change_1d.toFixed(2)}%`);
      if (m.price_change_1m != null) parts.push(`1M: ${m.price_change_1m >= 0 ? '+' : ''}${m.price_change_1m.toFixed(2)}%`);
      
      // Valuation
      if (m.market_cap != null) parts.push(`Mkt Cap: ${formatMarketCap(m.market_cap)}`);
      if (m.enterprise_value != null) parts.push(`EV: ${formatMarketCap(m.enterprise_value)}`);
      if (m.pe_ratio != null) parts.push(`P/E: ${m.pe_ratio.toFixed(2)}`);
      if ((m as any).forward_pe != null) parts.push(`Fwd P/E: ${(m as any).forward_pe.toFixed(2)}`);
      if ((m as any).ev_ebitda != null) parts.push(`EV/EBITDA: ${(m as any).ev_ebitda.toFixed(2)}`);
      if ((m as any).price_to_book != null) parts.push(`P/B: ${(m as any).price_to_book.toFixed(2)}`);
      if ((m as any).price_to_sales != null) parts.push(`P/S: ${(m as any).price_to_sales.toFixed(2)}`);
      
      // Financials
      if (m.revenue_ttm != null) parts.push(`Revenue: $${(m.revenue_ttm / 1e9).toFixed(2)}B`);
      if (m.eps_ttm != null) parts.push(`EPS: $${m.eps_ttm.toFixed(2)}`);
      if ((m as any).profit_margin != null) parts.push(`Profit Margin: ${(m as any).profit_margin.toFixed(2)}%`);
      if ((m as any).operating_margin_ttm != null) parts.push(`Op Margin: ${(m as any).operating_margin_ttm.toFixed(2)}%`);
      
      // Returns
      if (m.roe != null) parts.push(`ROE: ${m.roe.toFixed(2)}%`);
      if (m.roa != null) parts.push(`ROA: ${m.roa.toFixed(2)}%`);
      
      // Risk & Dividends
      if ((m as any).beta != null) parts.push(`Beta: ${(m as any).beta.toFixed(2)}`);
      if ((m as any).dividend_yield != null) parts.push(`Div Yield: ${(m as any).dividend_yield.toFixed(2)}%`);
      
      if (s.notes) parts.push(`Notes: ${s.notes}`);
      return parts.join(' | ');
    }).join('\n');

    return `[SYSTEM CONTEXT - DO NOT REPEAT THIS TO USER]
You are analyzing the user's watchlist "${watchlist.name}".

Watchlist: ${watchlist.name}
${watchlist.description ? `Description: ${watchlist.description}` : ''}
Total Stocks: ${watchlist.items.length}

Stock Details:
${stockDetails}

[END SYSTEM CONTEXT]

Respond naturally to the user's question below. Do not mention or repeat the system context.`;
  };

  const handleSubmit = async (message: string, suggestionId?: string) => {
    if (suggestionId) {
      setLoadingId(suggestionId);
    }
    
    // Store context separately: systemContext for AI, userMessage for display
    sessionStorage.setItem('ai_watchlist_context', JSON.stringify({
      watchlistName: watchlist.name,
      userMessage: message, // This is what user sees
      systemContext: buildSystemContext(), // This is hidden, sent to AI only
      isWatchlistAnalysis: true, // Badge identifier
      timestamp: Date.now(),
    }));

    // Navigate to AI page
    router.push('/ai?watchlist=' + encodeURIComponent(watchlist.name));
  };

  const handleSuggestionClick = async (suggestion: typeof AI_SUGGESTIONS[0]) => {
    await handleSubmit(suggestion.prompt, suggestion.id);
  };

  const handleCustomSubmit = async () => {
    if (!customMessage.trim()) return;
    await handleSubmit(customMessage, 'custom');
    setCustomMessage("");
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-violet-200 dark:border-violet-800 hover:from-violet-500/20 hover:to-purple-500/20 text-violet-700 dark:text-violet-300"
        onClick={() => setOpen(true)}
        disabled={!isDataReady}
      >
        {!isDataReady ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
        Analyze with AI
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                How can Jovan AI help you?
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Get AI-powered insights about <strong className="text-slate-900 dark:text-white">{watchlist.name}</strong>
            </p>

            {/* Custom Message Input */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Ask anything about your watchlist
              </label>
              <div className="flex gap-2">
                <Textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="e.g., Which stocks have the best growth potential?"
                  className="flex-1 min-h-[80px] text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      void handleCustomSubmit();
                    }
                  }}
                />
                <Button
                  onClick={handleCustomSubmit}
                  disabled={!customMessage.trim() || loadingId !== null}
                  size="icon"
                  className="bg-violet-600 hover:bg-violet-700 h-[80px] w-12"
                >
                  {loadingId === 'custom' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-900 px-2 text-slate-500">Or choose a template</span>
              </div>
            </div>

            {AI_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={loadingId !== null}
                className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-600 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-violet-700 dark:group-hover:text-violet-300">
                    {suggestion.text}
                  </span>
                  {loadingId === suggestion.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-violet-500 group-hover:translate-x-1 transition-all" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {loadingId && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-violet-600 dark:text-violet-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Opening AI assistant...</span>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
