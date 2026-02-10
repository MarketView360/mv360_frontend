/**
 * Shared utilities for watchlist components.
 */

/** Remove .US suffix and uppercase a ticker symbol. */
export function cleanTicker(ticker: string): string {
  return ticker.replace(/\.US$/i, "").toUpperCase();
}

/** Standard line colors for multi-stock charts. */
export const LINE_COLORS = [
  "#3b82f6",
  "#ef4444",
  "#22c55e",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#6366f1",
  "#84cc16",
];

/** Format a number as a percentage with +/- sign. */
export function formatPercent(val: number | null | undefined): string {
  if (val == null) return "—";
  return `${val >= 0 ? "+" : ""}${val.toFixed(2)}%`;
}
