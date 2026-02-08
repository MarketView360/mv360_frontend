"use client";

import { useState } from "react";
import { Star, Plus, Check, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useAuth } from "@/providers/AuthProvider";
import Link from "next/link";

interface AddToWatchlistButtonProps {
  ticker: string;
}

export function AddToWatchlistButton({ ticker }: AddToWatchlistButtonProps) {
  const { user } = useAuth();
  const {
    watchlists,
    loading,
    addToWatchlist,
    removeFromWatchlist,
    isTickerInWatchlist,
    createWatchlist,
  } = useWatchlist();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState("");
  const [creating, setCreating] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isInAnyWatchlist = watchlists.some((w) =>
    w.items.some((i) => i.ticker === ticker.toUpperCase())
  );

  const handleToggle = async (watchlistId: string) => {
    setActionLoading(watchlistId);
    if (isTickerInWatchlist(watchlistId, ticker)) {
      await removeFromWatchlist(watchlistId, ticker);
    } else {
      await addToWatchlist(watchlistId, ticker);
    }
    setActionLoading(null);
  };

  const handleCreateAndAdd = async () => {
    if (!newWatchlistName.trim()) return;
    setCreating(true);
    const newList = await createWatchlist(newWatchlistName.trim());
    if (newList) {
      await addToWatchlist(newList.id, ticker);
    }
    setCreating(false);
    setNewWatchlistName("");
    setShowCreateDialog(false);
  };

  if (!user) {
    return (
      <Link href="/auth/login">
        <Button
          variant="outline"
          size="sm"
          className="gap-2 h-9 border-slate-300 dark:border-slate-700 hover:border-brand hover:text-brand"
        >
          <Star className="w-4 h-4" />
          <span className="hidden sm:inline">Watchlist</span>
        </Button>
      </Link>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`gap-2 h-9 ${
              isInAnyWatchlist
                ? "border-amber-400 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:bg-amber-950/30 dark:text-amber-400 dark:hover:bg-amber-950/50"
                : "border-slate-300 dark:border-slate-700 hover:border-brand hover:text-brand"
            }`}
          >
            <Star
              className={`w-4 h-4 ${isInAnyWatchlist ? "fill-amber-400 text-amber-400" : ""}`}
            />
            <span className="hidden sm:inline">
              {isInAnyWatchlist ? "Watchlisted" : "Watchlist"}
            </span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
            Add to watchlist
          </DropdownMenuLabel>

          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          ) : watchlists.length === 0 ? (
            <div className="px-2 py-3 text-center">
              <p className="text-xs text-muted-foreground mb-2">No watchlists yet</p>
            </div>
          ) : (
            watchlists.map((watchlist) => {
              const isInThis = isTickerInWatchlist(watchlist.id, ticker);
              const isLoading = actionLoading === watchlist.id;

              return (
                <DropdownMenuItem
                  key={watchlist.id}
                  onClick={(e) => {
                    e.preventDefault();
                    handleToggle(watchlist.id);
                  }}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: watchlist.color }}
                  />
                  <span className="flex-1 truncate">{watchlist.name}</span>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  ) : isInThis ? (
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                  ) : null}
                </DropdownMenuItem>
              );
            })
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              setShowCreateDialog(true);
            }}
            className="flex items-center gap-2 cursor-pointer text-brand"
          >
            <Plus className="w-4 h-4" />
            <span>Create new watchlist</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Watchlist</DialogTitle>
            <DialogDescription>
              Create a new watchlist and add {ticker} to it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              placeholder="Watchlist name (e.g. Tech Giants)"
              value={newWatchlistName}
              onChange={(e) => setNewWatchlistName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateAndAdd();
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateAndAdd}
              disabled={!newWatchlistName.trim() || creating}
              className="gap-2"
            >
              {creating && <Loader2 className="w-4 h-4 animate-spin" />}
              Create & Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
