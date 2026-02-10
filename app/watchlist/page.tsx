"use client";

import { Suspense, useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Star,
  Plus,
  Trash2,
  Pencil,
  Loader2,
  MoreHorizontal,
  Download,
  Upload,
  TrendingUp,
  Search,
  Eye,
  GitCompareArrows,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useWatchlist, type WatchlistWithItems } from "@/providers/WatchlistProvider";
import { useAuth } from "@/providers/AuthProvider";
import { WatchlistStockTable } from "@/components/watchlist/WatchlistStockTable";
import { StockCompare } from "@/components/watchlist/StockCompare";
import { WatchlistFormDialog } from "@/components/watchlist/WatchlistFormDialog";
import { AddStockSearch } from "@/components/watchlist/AddStockSearch";
import { cleanTicker } from "@/lib/watchlist-utils";

export default function WatchlistPage() {
  return (
    <Suspense fallback={<WatchlistPageSkeleton />}>
      <WatchlistPageContent />
    </Suspense>
  );
}

function WatchlistPageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-14" />
      <div className="flex h-[calc(100vh-3.5rem)]">
        <div className="w-72 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 hidden lg:block">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
        <div className="flex-1 p-6">
          <div className="h-10 w-64 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          <div className="h-64 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function WatchlistPageContent() {
  const { user } = useAuth();
  const {
    watchlists,
    loading,
    createWatchlist,
    deleteWatchlist,
    updateWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    updateItemNotes,
  } = useWatchlist();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [dialogTarget, setDialogTarget] = useState<WatchlistWithItems | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [compareTickers, setCompareTickers] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Auto-select first watchlist
  useEffect(() => {
    if (watchlists.length > 0 && activeId === null) {
      setActiveId(watchlists[0].id);
    }
    // If active watchlist was deleted, select next
    if (activeId && !watchlists.find((w) => w.id === activeId)) {
      setActiveId(watchlists.length > 0 ? watchlists[0].id : null);
    }
  }, [watchlists, activeId]);

  const activeWatchlist = useMemo(
    () => watchlists.find((w) => w.id === activeId) || null,
    [watchlists, activeId]
  );

  const totalStocks = useMemo(
    () => watchlists.reduce((sum, w) => sum + w.items.length, 0),
    [watchlists]
  );

  const handleAddCompare = (ticker: string) => {
    const clean = ticker.replace(/\.US$/i, "").toUpperCase();
    setCompareTickers((prev) =>
      prev.includes(clean) ? prev.filter((t) => t !== clean) : [...prev, clean]
    );
    setShowCompare(true);
  };

  const handleRemoveCompare = (ticker: string) => {
    const clean = ticker.replace(/\.US$/i, "").toUpperCase();
    setCompareTickers((prev) => prev.filter((t) => t !== clean));
  };

  const handleDelete = async () => {
    if (!dialogTarget) return;
    setActionLoading(true);
    await deleteWatchlist(dialogTarget.id);
    setActionLoading(false);
    setShowDeleteDialog(false);
    setDialogTarget(null);
  };

  const handleRemoveStock = async (watchlistId: string, ticker: string) => {
    await removeFromWatchlist(watchlistId, ticker);
  };

  const exportWatchlistCsv = (watchlist: WatchlistWithItems) => {
    const header = "ticker,notes,added_at";
    const rows = watchlist.items.map((item) => {
      const ticker = item.ticker.replace(/\.US$/i, "").toUpperCase();
      const notes = (item.notes || "").replace(/"/g, '""');
      return `${ticker},"${notes}",${item.added_at || ""}`;
    });
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${watchlist.name.replace(/\s+/g, "_")}_watchlist.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importWatchlistCsv = async (watchlist: WatchlistWithItems) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
      const startIdx = lines[0]?.toLowerCase().includes("ticker") ? 1 : 0;
      let added = 0;
      for (let i = startIdx; i < lines.length; i++) {
        const parts = lines[i].split(",");
        const ticker = parts[0]?.trim().replace(/"/g, "");
        if (ticker) {
          const existing = watchlist.items.some(
            (it) => it.ticker.replace(/\.US$/i, "").toUpperCase() === ticker.toUpperCase()
          );
          if (!existing) {
            const ok = await addToWatchlist(watchlist.id, ticker);
            if (ok) added++;
          }
        }
      }
      if (added > 0) {
        const { toast } = await import("sonner");
        toast.success(`Imported ${added} stock${added !== 1 ? "s" : ""}`);
      }
    };
    input.click();
  };

  // --- Sidebar content (shared between desktop and mobile) ---
  const sidebarContent = (
    <>
      {/* New watchlist button */}
      <button
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-brand hover:bg-brand/5 dark:hover:bg-brand/10 transition-colors border border-dashed border-brand/30 hover:border-brand/50"
        onClick={() => setShowCreateDialog(true)}
      >
        <Plus className="w-4 h-4" />
        New Watchlist
      </button>

      {/* Watchlist list */}
      <div className="space-y-1 mt-3">
        {watchlists.map((w) => {
          const isActive = activeId === w.id;
          return (
            <button
              key={w.id}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all group ${
                isActive
                  ? "bg-slate-100 dark:bg-slate-800 shadow-sm"
                  : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
              onClick={() => {
                setActiveId(w.id);
                setMobileSidebarOpen(false);
              }}
            >
              <div
                className="w-2 h-8 rounded-full shrink-0 transition-opacity"
                style={{
                  backgroundColor: w.color,
                  opacity: isActive ? 1 : 0.4,
                }}
              />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${
                  isActive ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"
                }`}>
                  {w.name}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  {w.items.length} stock{w.items.length !== 1 ? "s" : ""}
                </p>
              </div>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Summary */}
      {watchlists.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/50">
          <div className="px-3 text-[11px] text-slate-400 dark:text-slate-500 space-y-1">
            <p>{watchlists.length} watchlist{watchlists.length !== 1 ? "s" : ""} &middot; {totalStocks} stocks</p>
          </div>
        </div>
      )}
    </>
  );

  // --- Unauthenticated / Loading / Empty states ---
  if (!user) {
    return (
      <div className="min-h-full bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center py-24 text-center px-4">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-800/20 flex items-center justify-center shadow-sm">
            <Star className="w-10 h-10 text-amber-500" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-brand/10 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-brand" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Track your favorite stocks
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md leading-relaxed">
          Create watchlists to monitor stock performance, compare returns, and keep notes on your investment ideas.
        </p>
        <Link href="/auth/login">
          <Button size="lg" className="gap-2">
            <Eye className="w-4 h-4" />
            Sign In to Get Started
          </Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-full bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center py-24">
        <Loader2 className="w-7 h-7 animate-spin text-brand mb-3" />
        <span className="text-sm text-slate-400">Loading your watchlists...</span>
      </div>
    );
  }

  if (watchlists.length === 0) {
    return (
      <div className="min-h-full bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/20 flex items-center justify-center shadow-sm">
            <Star className="w-10 h-10 text-amber-500" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Create your first watchlist
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm leading-relaxed">
          Organize stocks into watchlists, track their performance over time, and compare returns side by side.
        </p>
        <div className="flex items-center gap-3">
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2" size="lg">
            <Plus className="w-4 h-4" />
            Create Watchlist
          </Button>
          <Link href="/screens">
            <Button variant="outline" size="lg" className="gap-2">
              <Search className="w-4 h-4" />
              Browse Stocks
            </Button>
          </Link>
        </div>

        {/* Dialogs still accessible */}
        <WatchlistFormDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          mode="create"
          loading={actionLoading}
          onSubmit={async (name, description, color) => {
            setActionLoading(true);
            try {
              const result = await createWatchlist(name, description, color);
              if (result) setShowCreateDialog(false);
            } finally {
              setActionLoading(false);
            }
          }}
        />
      </div>
    );
  }

  // --- Main Layout: Sidebar + Detail ---
  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-72 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Star className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white">Watchlists</h1>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            {sidebarContent}
          </div>
        </aside>

        {/* Mobile Header + Sidebar Toggle */}
        <div className="lg:hidden fixed top-[4rem] left-0 right-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 flex items-center gap-3">
          <button
            className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          >
            <div
              className="w-2 h-5 rounded-full"
              style={{ backgroundColor: activeWatchlist?.color || "#3b82f6" }}
            />
            <span className="truncate max-w-48">{activeWatchlist?.name || "Select"}</span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${mobileSidebarOpen ? "rotate-180" : ""}`} />
          </button>
          <div className="flex-1" />
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Mobile Sidebar Dropdown */}
        {mobileSidebarOpen && (
          <>
            <div className="lg:hidden fixed inset-0 top-[7rem] z-20 bg-black/20 dark:bg-black/40" onClick={() => setMobileSidebarOpen(false)} />
            <div className="lg:hidden fixed top-[7rem] left-0 right-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pb-4 max-h-80 overflow-y-auto shadow-lg">
              {sidebarContent}
            </div>
          </>
        )}

        {/* Main Detail Panel */}
        <main className="flex-1 overflow-y-auto lg:pt-0 pt-12">
          {activeWatchlist ? (
            <div className="h-full flex flex-col">
              {/* Detail Header */}
              <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
                <div className="px-4 sm:px-6 py-3 flex items-center gap-3">
                  <div
                    className="w-3 h-8 rounded-full shrink-0"
                    style={{ backgroundColor: activeWatchlist.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                        {activeWatchlist.name}
                      </h2>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 shrink-0">
                        {activeWatchlist.items.length}
                      </Badge>
                    </div>
                    {activeWatchlist.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {activeWatchlist.description}
                      </p>
                    )}
                  </div>

                  {/* Compare toggle */}
                  <Button
                    variant={showCompare ? "default" : "outline"}
                    size="sm"
                    className="gap-1.5 h-8 hidden sm:flex"
                    onClick={() => setShowCompare(!showCompare)}
                  >
                    <GitCompareArrows className="w-3.5 h-3.5" />
                    Compare
                    {compareTickers.length > 0 && (
                      <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 ml-0.5">
                        {compareTickers.length}
                      </Badge>
                    )}
                  </Button>

                  {/* Actions dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem onClick={() => { setDialogTarget(activeWatchlist); setShowEditDialog(true); }}>
                        <Pencil className="w-4 h-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => exportWatchlistCsv(activeWatchlist)}>
                        <Download className="w-4 h-4 mr-2" /> Export CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => importWatchlistCsv(activeWatchlist)}>
                        <Upload className="w-4 h-4 mr-2" /> Import CSV
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => { setDialogTarget(activeWatchlist); setShowDeleteDialog(true); }}
                        className="text-red-600 dark:text-red-400"
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Inline Add Stock Search */}
                <div className="px-4 sm:px-6 pb-3">
                  <AddStockSearch
                    existingTickers={activeWatchlist.items.map((i) => i.ticker)}
                    onAdd={async (ticker) => {
                      return await addToWatchlist(activeWatchlist.id, ticker);
                    }}
                    placeholder="Add stock — search by ticker or name..."
                  />
                </div>
              </div>

              {/* Stock Table */}
              <div className="flex-1">
                {activeWatchlist.items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                      <Search className="w-7 h-7 text-slate-300 dark:text-slate-600" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      No stocks yet
                    </h3>
                    <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs">
                      Use the search bar above to find and add stocks to this watchlist.
                    </p>
                  </div>
                ) : (
                  <>
                    <WatchlistStockTable
                      items={activeWatchlist.items}
                      watchlistId={activeWatchlist.id}
                      onRemoveStock={handleRemoveStock}
                      onCompareStock={handleAddCompare}
                      onUpdateNotes={(wId, ticker, notes) => updateItemNotes(wId, ticker, notes)}
                      compareTickers={compareTickers}
                    />

                    {/* Integrated Compare Section */}
                    {showCompare && (
                      <div className="border-t border-slate-200 dark:border-slate-700 mx-4 sm:mx-6 mt-2">
                        <div className="py-4">
                          <StockCompare
                            tickers={compareTickers}
                            onAddTicker={handleAddCompare}
                            onRemoveTicker={handleRemoveCompare}
                            onClear={() => setCompareTickers([])}
                          />
                        </div>
                      </div>
                    )}

                    {/* Quick compare prompt (when compare is hidden and no tickers selected) */}
                    {!showCompare && compareTickers.length === 0 && activeWatchlist.items.length >= 2 && (
                      <div className="px-4 sm:px-6 py-4">
                        <button
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-sm text-slate-400 hover:text-brand hover:border-brand/30 transition-colors"
                          onClick={() => {
                            // Auto-add first few stocks to compare
                            const tickers = activeWatchlist.items
                              .slice(0, 4)
                              .map((i) => cleanTicker(i.ticker));
                            setCompareTickers(tickers);
                            setShowCompare(true);
                          }}
                        >
                          <GitCompareArrows className="w-4 h-4" />
                          Compare stocks in this watchlist
                        </button>
                      </div>
                    )}

                    {/* Quick compare prompt when tickers are selected but panel is hidden */}
                    {!showCompare && compareTickers.length > 0 && (
                      <div className="px-4 sm:px-6 py-4">
                        <button
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-brand/30 text-sm text-brand hover:bg-brand/5 transition-colors"
                          onClick={() => setShowCompare(true)}
                        >
                          <GitCompareArrows className="w-4 h-4" />
                          Show comparison ({compareTickers.length} stocks selected)
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm">
              Select a watchlist to get started
            </div>
          )}
        </main>
      </div>

      {/* Create Watchlist Dialog */}
      <WatchlistFormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        mode="create"
        loading={actionLoading}
        onSubmit={async (name, description, color) => {
          setActionLoading(true);
          try {
            const result = await createWatchlist(name, description, color);
            if (result) {
              setShowCreateDialog(false);
              setActiveId(result.id);
            }
          } finally {
            setActionLoading(false);
          }
        }}
      />

      {/* Edit Watchlist Dialog */}
      <WatchlistFormDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        mode="edit"
        initialName={dialogTarget?.name || ""}
        initialDescription={dialogTarget?.description || ""}
        initialColor={dialogTarget?.color || "#3b82f6"}
        loading={actionLoading}
        onSubmit={async (name, description, color) => {
          if (!dialogTarget) return;
          setActionLoading(true);
          try {
            const ok = await updateWatchlist(dialogTarget.id, { name, description, color });
            if (ok) setShowEditDialog(false);
          } finally {
            setActionLoading(false);
          }
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Watchlist</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{dialogTarget?.name}&quot;? This will
              remove all {dialogTarget?.items.length || 0} stocks from this watchlist.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={actionLoading}
              className="gap-2"
            >
              {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
