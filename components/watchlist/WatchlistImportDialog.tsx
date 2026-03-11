"use client";

import { useState, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileSpreadsheet,
  Loader2,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  Plus,
  FolderOpen,
  X,
  FileWarning,
} from "lucide-react";
import type { WatchlistWithItems } from "@/providers/WatchlistProvider";
import { cleanTicker } from "@/lib/watchlist-utils";

interface ParsedStock {
  ticker: string;
  name?: string;
  notes?: string;
  isDuplicate?: boolean;
}

interface ParseResult {
  watchlistName: string;
  watchlistDescription: string;
  watchlistColor: string;
  stocks: ParsedStock[];
  totalParsed: number;
  duplicates: number;
  errors: string[];
}

interface WatchlistImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  watchlists: WatchlistWithItems[];
  onImportToExisting: (
    watchlistId: string,
    stocks: ParsedStock[]
  ) => Promise<{ added: number; skipped: number; errors: number }>;
  onImportToNew: (
    name: string,
    description: string,
    color: string,
    stocks: ParsedStock[]
  ) => Promise<{ watchlistId: string | null; added: number; errors: number }>;
}

type ImportMode = "existing" | "new";
type ImportStatus = "idle" | "parsing" | "importing" | "success" | "error";

const MAX_STOCKS_PER_WATCHLIST = 10;

const WATCHLIST_COLORS = [
  "#3b82f6", // blue
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#84cc16", // lime
];

export function WatchlistImportDialog({
  open,
  onOpenChange,
  watchlists,
  onImportToExisting,
  onImportToNew,
}: WatchlistImportDialogProps) {
  const [mode, setMode] = useState<ImportMode>("new");
  const [status, setStatus] = useState<ImportStatus>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [selectedWatchlistId, setSelectedWatchlistId] = useState<string>("");
  const [newWatchlistName, setNewWatchlistName] = useState("");
  const [newWatchlistDescription, setNewWatchlistDescription] = useState("");
  const [newWatchlistColor, setNewWatchlistColor] = useState(WATCHLIST_COLORS[0]);
  const [importResult, setImportResult] = useState<{
    added: number;
    skipped: number;
    errors: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = useCallback(() => {
    setStatus("idle");
    setStatusMessage("");
    setFile(null);
    setParseResult(null);
    setSelectedWatchlistId("");
    setNewWatchlistName("");
    setNewWatchlistDescription("");
    setNewWatchlistColor(WATCHLIST_COLORS[0]);
    setImportResult(null);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onOpenChange(false);
  }, [resetState, onOpenChange]);

  const parseCSV = useCallback(
    async (content: string): Promise<ParseResult> => {
      const lines = content.split("\n").map((l) => l.trim());
      const result: ParseResult = {
        watchlistName: "",
        watchlistDescription: "",
        watchlistColor: "#3b82f6",
        stocks: [],
        totalParsed: 0,
        duplicates: 0,
        errors: [],
      };

      // Parse metadata from comments
      for (const line of lines) {
        if (line.startsWith("# Watchlist Name:")) {
          result.watchlistName = line.replace("# Watchlist Name:", "").trim();
        } else if (line.startsWith("# Description:")) {
          result.watchlistDescription = line.replace("# Description:", "").trim();
        } else if (line.startsWith("# Color:")) {
          result.watchlistColor = line.replace("# Color:", "").trim();
        }
      }

      // Find stock data section
      let inStockSection = false;
      let headerLine = "";
      const existingTickers = new Set<string>();

      // Get existing tickers from selected watchlist (if adding to existing)
      if (mode === "existing" && selectedWatchlistId) {
        const selectedWatchlist = watchlists.find(
          (w) => w.id === selectedWatchlistId
        );
        if (selectedWatchlist) {
          for (const item of selectedWatchlist.items) {
            existingTickers.add(cleanTicker(item.ticker));
          }
        }
      }

      for (const line of lines) {
        if (line === "## STOCKS") {
          inStockSection = true;
          continue;
        }
        if (line === "## PEERS") {
          inStockSection = false;
          continue;
        }
        if (line.startsWith("#") || line === "") {
          continue;
        }

        if (inStockSection) {
          // Check if this is the header line
          if (
            line.toLowerCase().includes("ticker") &&
            line.toLowerCase().includes("type")
          ) {
            headerLine = line;
            continue;
          }

          // Parse stock row
          if (line.startsWith("STOCK,")) {
            try {
              // Handle CSV with quoted fields
              const parts: string[] = [];
              let current = "";
              let inQuotes = false;

              for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"') {
                  inQuotes = !inQuotes;
                } else if (char === "," && !inQuotes) {
                  parts.push(current.trim());
                  current = "";
                } else {
                  current += char;
                }
              }
              parts.push(current.trim());

              const ticker = cleanTicker(parts[1] || "");
              if (!ticker) continue;

              const name = parts[2]?.replace(/^"|"$/g, "") || "";
              const notesIndex = parts.length - 2; // Notes is second to last
              const notes = parts[notesIndex]?.replace(/^"|"$/g, "") || "";

              const isDuplicate = existingTickers.has(ticker);
              if (isDuplicate) {
                result.duplicates++;
              }

              result.stocks.push({
                ticker,
                name,
                notes,
                isDuplicate,
              });
              result.totalParsed++;
            } catch (err) {
              result.errors.push(`Failed to parse line: ${line.substring(0, 50)}...`);
            }
          }
        }
      }

      // If no structured data found, try simple CSV format (just tickers)
      if (result.stocks.length === 0) {
        for (const line of lines) {
          if (line.startsWith("#") || line === "" || line.startsWith("Type")) {
            continue;
          }

          // Try to extract ticker from first column
          const parts = line.split(",");
          let ticker = parts[0]?.trim().replace(/^"|"$/g, "");

          // Skip if it looks like a header
          if (
            ticker?.toLowerCase() === "ticker" ||
            ticker?.toLowerCase() === "symbol"
          ) {
            continue;
          }

          ticker = cleanTicker(ticker || "");
          if (ticker && /^[A-Z]{1,5}$/.test(ticker)) {
            const isDuplicate = existingTickers.has(ticker);
            if (isDuplicate) {
              result.duplicates++;
            }

            result.stocks.push({
              ticker,
              isDuplicate,
            });
            result.totalParsed++;
          }
        }
      }

      // Set default name if not found
      if (!result.watchlistName) {
        result.watchlistName = `Imported Watchlist ${new Date().toLocaleDateString()}`;
      }

      return result;
    },
    [mode, selectedWatchlistId, watchlists]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (!selectedFile) return;

      if (!selectedFile.name.endsWith(".csv")) {
        setStatus("error");
        setStatusMessage("Please select a CSV file");
        return;
      }

      setFile(selectedFile);
      setStatus("parsing");
      setStatusMessage("Parsing CSV file...");

      try {
        const content = await selectedFile.text();
        const result = await parseCSV(content);

        if (result.stocks.length === 0) {
          setStatus("error");
          setStatusMessage("No valid stocks found in the CSV file");
          return;
        }

        setParseResult(result);
        setNewWatchlistName(result.watchlistName);
        setNewWatchlistDescription(result.watchlistDescription);
        if (result.watchlistColor) {
          setNewWatchlistColor(result.watchlistColor);
        }
        setStatus("idle");
        setStatusMessage("");
      } catch (err) {
        console.error("Parse error:", err);
        setStatus("error");
        setStatusMessage("Failed to parse CSV file");
      }
    },
    [parseCSV]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const droppedFile = e.dataTransfer.files?.[0];
      if (!droppedFile) return;

      if (!droppedFile.name.endsWith(".csv")) {
        setStatus("error");
        setStatusMessage("Please drop a CSV file");
        return;
      }

      // Create a synthetic event to reuse handleFileSelect logic
      const input = fileInputRef.current;
      if (input) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(droppedFile);
        input.files = dataTransfer.files;

        const event = {
          target: input,
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        await handleFileSelect(event);
      }
    },
    [handleFileSelect]
  );

  const getStocksToImport = useCallback((): ParsedStock[] => {
    if (!parseResult) return [];

    // Filter out duplicates
    let stocks = parseResult.stocks.filter((s) => !s.isDuplicate);

    // Apply limit
    if (mode === "existing" && selectedWatchlistId) {
      const selectedWatchlist = watchlists.find(
        (w) => w.id === selectedWatchlistId
      );
      const currentCount = selectedWatchlist?.items.length || 0;
      const available = MAX_STOCKS_PER_WATCHLIST - currentCount;
      stocks = stocks.slice(0, Math.max(0, available));
    } else {
      stocks = stocks.slice(0, MAX_STOCKS_PER_WATCHLIST);
    }

    return stocks;
  }, [parseResult, mode, selectedWatchlistId, watchlists]);

  const handleImport = async () => {
    if (!parseResult) return;

    const stocksToImport = getStocksToImport();

    if (stocksToImport.length === 0) {
      setStatus("error");
      setStatusMessage("No stocks to import (all duplicates or limit reached)");
      return;
    }

    setStatus("importing");
    setStatusMessage(`Importing ${stocksToImport.length} stocks...`);

    try {
      if (mode === "existing") {
        if (!selectedWatchlistId) {
          setStatus("error");
          setStatusMessage("Please select a watchlist");
          return;
        }

        const result = await onImportToExisting(selectedWatchlistId, stocksToImport);
        setImportResult(result);

        if (result.added > 0) {
          setStatus("success");
          setStatusMessage(
            `Successfully imported ${result.added} stock${result.added !== 1 ? "s" : ""}${result.skipped > 0 ? ` (${result.skipped} skipped)` : ""}${result.errors > 0 ? ` (${result.errors} failed)` : ""}`
          );
        } else {
          setStatus("error");
          setStatusMessage("Failed to import any stocks");
        }
      } else {
        if (!newWatchlistName.trim()) {
          setStatus("error");
          setStatusMessage("Please enter a watchlist name");
          return;
        }

        const result = await onImportToNew(
          newWatchlistName.trim(),
          newWatchlistDescription.trim(),
          newWatchlistColor,
          stocksToImport
        );

        if (result.watchlistId) {
          // Import to toast library
          const { toast } = await import("sonner");
          
          // Close dialog immediately
          handleClose();
          
          // Show success toast
          toast.success("Watchlist Created!", {
            description: `Added ${result.added} stock${result.added !== 1 ? "s" : ""} to "${newWatchlistName.trim()}"${result.errors > 0 ? `. ${result.errors} failed to import.` : "."}`,
            duration: 4000,
          });
        } else {
          setStatus("error");
          setStatusMessage("Failed to create watchlist");
        }
      }
    } catch (err) {
      console.error("Import error:", err);
      setStatus("error");
      setStatusMessage(
        err instanceof Error ? err.message : "Failed to import watchlist"
      );
    }
  };

  const stocksToImport = getStocksToImport();
  const canImport =
    parseResult &&
    stocksToImport.length > 0 &&
    (mode === "existing" ? !!selectedWatchlistId : !!newWatchlistName.trim());

  const selectedWatchlist = watchlists.find((w) => w.id === selectedWatchlistId);
  const currentStockCount = selectedWatchlist?.items.length || 0;
  const availableSlots =
    mode === "existing"
      ? MAX_STOCKS_PER_WATCHLIST - currentStockCount
      : MAX_STOCKS_PER_WATCHLIST;
  const willExceedLimit =
    parseResult && parseResult.stocks.filter((s) => !s.isDuplicate).length > availableSlots;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-brand" />
            Import Watchlist
          </DialogTitle>
          <DialogDescription>
            Import stocks from a CSV file exported from MarketView360 or a simple
            ticker list.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* File upload area */}
          {!parseResult && (
            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                status === "parsing"
                  ? "border-brand bg-brand/5"
                  : status === "error"
                    ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                    : "border-slate-200 dark:border-slate-700 hover:border-brand/50"
              }`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileSelect}
              />

              {status === "parsing" ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-brand" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {statusMessage}
                  </p>
                </div>
              ) : status === "error" ? (
                <div className="flex flex-col items-center gap-2">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {statusMessage}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setStatus("idle");
                      setStatusMessage("");
                    }}
                  >
                    Try Again
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <FileSpreadsheet className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Drop your CSV file here
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      or click to browse
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Select CSV File
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* File selected indicator */}
          {file && parseResult && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-brand" />
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {parseResult.totalParsed} stocks found
                    {parseResult.duplicates > 0 && (
                      <span className="text-amber-600">
                        {" "}
                        ({parseResult.duplicates} duplicates)
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => {
                  setFile(null);
                  setParseResult(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Import mode selection */}
          {parseResult && (
            <>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Import to</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMode("new")}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                      mode === "new"
                        ? "border-brand bg-brand/5"
                        : "border-slate-200 dark:border-slate-700 hover:border-brand/30"
                    }`}
                  >
                    <Plus
                      className={`w-5 h-5 ${mode === "new" ? "text-brand" : "text-slate-400"}`}
                    />
                    <span
                      className={`text-sm font-medium ${mode === "new" ? "text-brand" : "text-slate-600 dark:text-slate-400"}`}
                    >
                      New Watchlist
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode("existing")}
                    disabled={watchlists.length === 0}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                      mode === "existing"
                        ? "border-brand bg-brand/5"
                        : "border-slate-200 dark:border-slate-700 hover:border-brand/30"
                    } ${watchlists.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <FolderOpen
                      className={`w-5 h-5 ${mode === "existing" ? "text-brand" : "text-slate-400"}`}
                    />
                    <span
                      className={`text-sm font-medium ${mode === "existing" ? "text-brand" : "text-slate-600 dark:text-slate-400"}`}
                    >
                      Existing
                    </span>
                  </button>
                </div>
              </div>

              {/* New watchlist options */}
              {mode === "new" && (
                <div className="space-y-3 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="space-y-2">
                    <Label htmlFor="watchlist-name">Watchlist Name *</Label>
                    <Input
                      id="watchlist-name"
                      value={newWatchlistName}
                      onChange={(e) => setNewWatchlistName(e.target.value)}
                      placeholder="My Watchlist"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="watchlist-desc">Description (optional)</Label>
                    <Input
                      id="watchlist-desc"
                      value={newWatchlistDescription}
                      onChange={(e) => setNewWatchlistDescription(e.target.value)}
                      placeholder="A brief description..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Color</Label>
                    <div className="flex gap-2">
                      {WATCHLIST_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`w-8 h-8 rounded-full transition-all ${
                            newWatchlistColor === color
                              ? "ring-2 ring-offset-2 ring-brand scale-110"
                              : "hover:scale-105"
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setNewWatchlistColor(color)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Existing watchlist selection */}
              {mode === "existing" && (
                <div className="space-y-2">
                  <Label>Select Watchlist</Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto p-1">
                    {watchlists.map((w) => {
                      const isFull = w.items.length >= MAX_STOCKS_PER_WATCHLIST;
                      return (
                        <button
                          key={w.id}
                          type="button"
                          disabled={isFull}
                          onClick={() => setSelectedWatchlistId(w.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                            selectedWatchlistId === w.id
                              ? "border-brand bg-brand/5"
                              : "border-slate-200 dark:border-slate-700 hover:border-brand/30"
                          } ${isFull ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <div
                            className="w-3 h-6 rounded-full shrink-0"
                            style={{ backgroundColor: w.color }}
                          />
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              {w.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {w.items.length}/{MAX_STOCKS_PER_WATCHLIST} stocks
                              {isFull && (
                                <span className="text-red-500 ml-1">(Full)</span>
                              )}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Import summary */}
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-brand mt-0.5 shrink-0" />
                  <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    <p>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {stocksToImport.length}
                      </span>{" "}
                      stocks will be imported
                    </p>
                    {parseResult.duplicates > 0 && (
                      <p className="text-amber-600 dark:text-amber-400 text-xs">
                        <AlertTriangle className="w-3 h-3 inline mr-1" />
                        {parseResult.duplicates} duplicate(s) will be skipped
                      </p>
                    )}
                    {willExceedLimit && (
                      <p className="text-amber-600 dark:text-amber-400 text-xs">
                        <AlertTriangle className="w-3 h-3 inline mr-1" />
                        Only {availableSlots} stocks can be added (limit:{" "}
                        {MAX_STOCKS_PER_WATCHLIST} per watchlist)
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Stock limit info */}
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <FileWarning className="w-3.5 h-3.5" />
                <span>
                  Maximum {MAX_STOCKS_PER_WATCHLIST} stocks per watchlist
                </span>
              </div>
            </>
          )}

          {/* Status message */}
          {status === "importing" && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              {statusMessage}
            </div>
          )}

          {status === "success" && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-sm">
              <CheckCircle className="w-4 h-4" />
              {statusMessage}
            </div>
          )}

          {status === "error" && parseResult && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              {statusMessage}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={status === "importing"}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!canImport || status === "importing" || status === "success"}
            className="gap-2"
          >
            {status === "importing" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Import {stocksToImport.length > 0 ? `${stocksToImport.length} Stocks` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
