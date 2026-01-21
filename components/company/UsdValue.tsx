"use client";

import React, { useMemo, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FX_ENDPOINT = "https://open.er-api.com/v6/latest/USD";

type FxRates = Record<string, number>;

type FxState = {
  rates: FxRates | null;
  lastUpdated: string | null;
};

interface UsdValueProps {
  amount: number | null;
  className?: string;
}

const POPULAR_CURRENCIES = ["EUR", "INR", "GBP", "JPY", "AUD", "CAD", "CHF"] as const;

interface ExchangeRateResponse {
  result: string;
  rates?: Record<string, number>;
  time_last_update_utc?: string;
}

export function UsdValue({ amount, className }: UsdValueProps) {
  const [open, setOpen] = useState(false);
  const [fx, setFx] = useState<FxState>({ rates: null, lastUpdated: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  const formattedUsd = useMemo(() => {
    if (amount == null || Number.isNaN(amount)) return "—";
    return `$${amount.toFixed(2)}`;
  }, [amount]);

  const allCodes = useMemo(() => {
    return fx.rates ? Object.keys(fx.rates).sort() : [];
  }, [fx.rates]);

  const filteredCodes = useMemo(() => {
    if (!search.trim()) return allCodes.slice(0, 30);
    const q = search.trim().toUpperCase();
    return allCodes.filter((c) => c.includes(q)).slice(0, 30);
  }, [allCodes, search]);

  const selectedRate = selectedCode && fx.rates ? fx.rates[selectedCode] : null;

  const loadRates = async () => {
    if (loading || fx.rates) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(FX_ENDPOINT);
      if (!res.ok) {
        throw new Error(`FX API failed: ${res.status}`);
      }
      const json = (await res.json()) as ExchangeRateResponse;
      if (json.result !== "success" || typeof json.rates !== "object" || !json.rates) {
        throw new Error("Unexpected FX API response");
      }
      const rates: FxRates = json.rates;
      setFx({
        rates,
        lastUpdated: json.time_last_update_utc ?? null,
      });
    } catch (e) {
      console.error("Failed to load FX rates", e);
      setError("Unable to load FX rates right now.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    if (amount == null) return;
    setOpen(true);
    void loadRates();
  };

  const convert = React.useCallback(
    (code: string, value: number | null) => {
      if (value == null || !fx.rates) return "—";
      const rate = fx.rates[code];
      if (!rate || Number.isNaN(rate)) return "—";
      const converted = value * rate;
      if (converted >= 1000) return converted.toFixed(0);
      if (converted >= 1) return converted.toFixed(2);
      return converted.toFixed(4);
    },
    [fx.rates]
  );

  const popularRows = useMemo(() => {
    if (!fx.rates || amount == null) return [] as { code: string; value: string }[];
    return POPULAR_CURRENCIES.filter((c) => fx.rates && fx.rates[c]).map((code) => ({
      code,
      value: convert(code, amount),
    }));
  }, [fx.rates, amount, convert]);

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        disabled={amount == null}
        className={cn(
          "inline-flex items-baseline gap-1 text-inherit underline decoration-dotted underline-offset-2 disabled:no-underline disabled:cursor-default",
          className,
        )}
        title={amount != null ? "Click to convert this USD value" : undefined}
      >
        <span>{formattedUsd}</span>
      </button>

      {open && amount != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-xl max-h-[80vh] rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Convert {formattedUsd} to other currencies
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Exchange rates are provided by our third party services.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4 overflow-y-auto text-sm">
              {loading && (
                <p className="text-slate-500 dark:text-slate-400 text-xs">
                  Loading latest FX rates…
                </p>
              )}
              {error && (
                <p className="text-xs text-rose-500">
                  {error}
                </p>
              )}

              {fx.rates && (
                <>
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Popular currencies
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {popularRows.map((row) => (
                        <button
                          key={row.code}
                          type="button"
                          onClick={() => setSelectedCode(row.code)}
                          className={cn(
                            "flex items-center justify-between rounded-lg border px-3 py-2 text-left",
                            selectedCode === row.code
                              ? "border-brand bg-brand/5 text-slate-900 dark:text-slate-50"
                              : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200",
                          )}
                        >
                          <span className="font-semibold">{row.code}</span>
                          <span>{row.value}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Search other currencies
                    </p>
                    <input
                      className="w-full h-8 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 text-xs text-slate-900 dark:text-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                      placeholder="Type currency code (e.g. EUR, INR)"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <div className="max-h-40 overflow-y-auto rounded-md border border-slate-200 dark:border-slate-800 text-xs divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                      {filteredCodes.map((code) => (
                        <button
                          key={code}
                          type="button"
                          className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
                          onClick={() => setSelectedCode(code)}
                        >
                          <span>{code}</span>
                          <span>{convert(code, amount)}</span>
                        </button>
                      ))}
                      {filteredCodes.length === 0 && (
                        <div className="px-3 py-2 text-[11px] text-slate-500 dark:text-slate-400">
                          No matching currencies.
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedCode && selectedRate && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">
                        {formattedUsd} in {selectedCode}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-slate-50">
                        {convert(selectedCode, amount)} {selectedCode}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
