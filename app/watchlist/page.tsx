"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import {
  Star,
  Plus,
  Trash2,
  Pencil,
  ChevronRight,
  Loader2,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useWatchlist, type WatchlistWithItems } from "@/hooks/useWatchlist";
import { useAuth } from "@/providers/AuthProvider";
import { WatchlistStockTable } from "@/components/watchlist/WatchlistStockTable";
import { StockCompare } from "@/components/watchlist/StockCompare";

const WATCHLIST_COLORS = [
  "#3b82f6",
  "#ef4444",
  "#22c55e",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#f97316",
];

export default function WatchlistPage() {
  return (
    <Suspense fallback={<WatchlistPageSkeleton />}>
      <WatchlistPageContent />
    </Suspense>
  );
}

function WatchlistPageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand" />
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
    removeFromWatchlist,
  } = useWatchlist();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedWatchlist, setSelectedWatchlist] = useState<WatchlistWithItems | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [compareTickers, setCompareTickers] = useState<string[]>([]);

  const handleAddCompare = (ticker: string) => {
    const clean = ticker.replace(/\.US$/i, "").toUpperCase();
    setCompareTickers((prev) => prev.includes(clean) ? prev : [...prev, clean]);
  };

  const handleRemoveCompare = (ticker: string) => {
    const clean = ticker.replace(/\.US$/i, "").toUpperCase();
    setCompareTickers((prev) => prev.filter((t) => t !== clean));
  };

  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newColor, setNewColor] = useState("#3b82f6");
  const [actionLoading, setActionLoading] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setActionLoading(true);
    await createWatchlist(newName.trim(), newDescription.trim() || undefined, newColor);
    setActionLoading(false);
    setNewName("");
    setNewDescription("");
    setNewColor("#3b82f6");
    setShowCreateDialog(false);
  };

  const handleEdit = async () => {
    if (!selectedWatchlist || !newName.trim()) return;
    setActionLoading(true);
    await updateWatchlist(selectedWatchlist.id, {
      name: newName.trim(),
      description: newDescription.trim() || undefined,
      color: newColor,
    });
    setActionLoading(false);
    setShowEditDialog(false);
    setSelectedWatchlist(null);
  };

  const handleDelete = async () => {
    if (!selectedWatchlist) return;
    setActionLoading(true);
    await deleteWatchlist(selectedWatchlist.id);
    setActionLoading(false);
    setShowDeleteDialog(false);
    setSelectedWatchlist(null);
    if (expandedId === selectedWatchlist.id) setExpandedId(null);
  };

  const handleRemoveStock = async (watchlistId: string, ticker: string) => {
    await removeFromWatchlist(watchlistId, ticker);
  };

  const openEditDialog = (watchlist: WatchlistWithItems) => {
    setSelectedWatchlist(watchlist);
    setNewName(watchlist.name);
    setNewDescription(watchlist.description || "");
    setNewColor(watchlist.color);
    setShowEditDialog(true);
  };

  const openDeleteDialog = (watchlist: WatchlistWithItems) => {
    setSelectedWatchlist(watchlist);
    setShowDeleteDialog(true);
  };

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950 pb-20 font-sans transition-colors duration-300">
      {/* Compact Header — matches /screens pattern */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-16 transition-colors duration-300">
        <div className="h-full mx-auto max-w-[1920px] px-4 md:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Star className="w-5 h-5 text-amber-500" />
            <h1 className="text-lg font-bold font-heading text-slate-900 dark:text-white tracking-tight">
              Watchlists
            </h1>
            <span className="hidden sm:inline-block h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />
            <p className="text-slate-500 dark:text-slate-400 text-sm hidden sm:block truncate max-w-md">
              {watchlists.length} watchlist{watchlists.length !== 1 ? "s" : ""} &middot;{" "}
              {watchlists.reduce((sum, w) => sum + w.items.length, 0)} total stocks
            </p>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <Button
                size="sm"
                onClick={() => setShowCreateDialog(true)}
                className="gap-2 h-9"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Watchlist</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-[1920px] px-4 md:px-6 lg:px-8 py-6">
        {!user ? (
          /* Unauthenticated state */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Star className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Sign in to view your watchlists
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">
              Create watchlists to track your favorite stocks and monitor their performance.
            </p>
            <Link href="/auth/login">
              <Button>Sign In</Button>
            </Link>
          </div>
        ) : loading ? (
          /* Loading State */
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-brand" />
          </div>
        ) : watchlists.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
              <Star className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              No watchlists yet
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm">
              Create your first watchlist to start tracking stocks. You can add stocks from any company page.
            </p>
            <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Your First Watchlist
            </Button>
          </div>
        ) : (
          <>
          {/* Stock Compare Module */}
          <StockCompare
            tickers={compareTickers}
            onAddTicker={handleAddCompare}
            onRemoveTicker={handleRemoveCompare}
            onClear={() => setCompareTickers([])}
          />

          {/* Watchlist Cards */}
          <div className="space-y-4 mt-4">
            {watchlists.map((watchlist) => {
              const isExpanded = expandedId === watchlist.id;

              return (
                <div
                  key={watchlist.id}
                  className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-all"
                >
                  {/* Watchlist Header */}
                  <div
                    className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : watchlist.id)}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${watchlist.color}20` }}
                    >
                      <Star
                        className="w-5 h-5"
                        style={{ color: watchlist.color }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                          {watchlist.name}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          {watchlist.items.length} stock{watchlist.items.length !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                      {watchlist.description && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {watchlist.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditDialog(watchlist);
                            }}
                          >
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteDialog(watchlist);
                            }}
                            className="text-red-600 dark:text-red-400"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <ChevronRight
                        className={`w-5 h-5 text-slate-400 transition-transform ${
                          isExpanded ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                  </div>

                  {/* Expanded Stock Table */}
                  {isExpanded && (
                    <div className="border-t border-slate-200 dark:border-slate-700">
                      {watchlist.items.length === 0 ? (
                        <div className="p-6 text-center">
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                            No stocks in this watchlist yet.
                          </p>
                          <Link href="/screens">
                            <Button variant="outline" size="sm" className="gap-2">
                              <Plus className="w-4 h-4" />
                              Browse Stocks
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <WatchlistStockTable
                          items={watchlist.items}
                          watchlistId={watchlist.id}
                          onRemoveStock={handleRemoveStock}
                          onCompareStock={handleAddCompare}
                          compareTickers={compareTickers}
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          </>
        )}
      </div>

      {/* Create Watchlist Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Watchlist</DialogTitle>
            <DialogDescription>
              Create a new watchlist to organize and track your favorite stocks.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                Name
              </label>
              <Input
                placeholder="e.g. Tech Giants, Dividend Kings"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                }}
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                Description (optional)
              </label>
              <Input
                placeholder="Brief description..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                Color
              </label>
              <div className="flex gap-2">
                {WATCHLIST_COLORS.map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full transition-all ${
                      newColor === color
                        ? "ring-2 ring-offset-2 ring-slate-900 dark:ring-white dark:ring-offset-slate-900"
                        : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewColor(color)}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!newName.trim() || actionLoading}
              className="gap-2"
            >
              {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Watchlist Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Watchlist</DialogTitle>
            <DialogDescription>
              Update your watchlist details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                Name
              </label>
              <Input
                placeholder="Watchlist name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                Description (optional)
              </label>
              <Input
                placeholder="Brief description..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                Color
              </label>
              <div className="flex gap-2">
                {WATCHLIST_COLORS.map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full transition-all ${
                      newColor === color
                        ? "ring-2 ring-offset-2 ring-slate-900 dark:ring-white dark:ring-offset-slate-900"
                        : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewColor(color)}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              disabled={!newName.trim() || actionLoading}
              className="gap-2"
            >
              {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Watchlist</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedWatchlist?.name}&quot;? This will
              remove all {selectedWatchlist?.items.length || 0} stocks from this watchlist.
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
