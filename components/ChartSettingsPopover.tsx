"use client";

import * as React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  BarChart3,
  TrendingUp,
  Settings2,
  Monitor,
  Sliders,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Re-import these from PriceChart.tsx - they should be passed as props
interface OscillatorGroup {
  key: string;
  label: string;
  cols: string[];
  refLines?: Array<{ price: number; color: string; label?: string }>;
}

interface ChartSettingsPopoverProps {
  // Volume
  showVolume: boolean;
  onToggleVolume: () => void;

  // Price Display
  priceDisplayMode: "rangeChange" | "absolute";
  onSetPriceDisplayMode: (mode: "rangeChange" | "absolute") => void;

  // Tooltip
  showDetailedTooltip: boolean;
  onSetShowDetailedTooltip: (show: boolean) => void;

  // Chart View
  view: "price" | "candlestick";
  onViewChange: (view: "price" | "candlestick") => void;

  // Area Style (for price view)
  areaStyle: "area" | "line";
  onSetAreaStyle: (style: "area" | "line") => void;

  // Candlestick Style
  candlestickStyle: "candlestick" | "heikin-ashi";
  onSetCandlestickStyle: (style: "candlestick" | "heikin-ashi") => void;
  isPro: boolean;

  // Risk Zones & What If
  showRiskZones: boolean;
  onSetShowRiskZones: (show: boolean) => void;
  showWhatIfSimulation: boolean;
  onSetShowWhatIfSimulation: (show: boolean) => void;

  // Indicators
  activeIndicators: string[];
  onToggleIndicator: (col: string) => void;
  indicatorLoading: boolean;

  // Group toggles
  isBBActive: boolean;
  onToggleBB: () => void;
  isKeltnerActive: boolean;
  onToggleKeltner: () => void;
  isDonchianActive: boolean;
  onToggleDonchian: () => void;
  isIchiActive: boolean;
  onToggleIchi: () => void;
  isPivotActive: boolean;
  onTogglePivot: () => void;
  isFibActive: boolean;
  onToggleFib: () => void;

  // Oscillator
  activeOscillatorKey: string | null;
  onSetActiveOscillatorKey: (key: string | null) => void;
  oscillatorGroups: OscillatorGroup[];

  // Overlay configs for colors/labels
  overlayConfigs: Record<
    string,
    { label: string; color: string; lineWidth?: number; lineStyle?: number }
  >;

  ticker?: string;
}

// Moving average keys with their display order
const MOVING_AVERAGES = [
  "ema_9",
  "ema_21",
  "ema_50",
  "ema_200",
  "sma_20",
  "sma_50",
  "sma_200",
  "wma_20",
  "hma_20",
  "dema_20",
  "tema_20",
] as const;

// Trend overlays
const TREND_OVERLAYS = ["psar", "supertrend", "vwap"] as const;

export function ChartSettingsPopover({
  showVolume,
  onToggleVolume,
  priceDisplayMode,
  onSetPriceDisplayMode,
  showDetailedTooltip,
  onSetShowDetailedTooltip,
  view,
  onViewChange,
  areaStyle,
  onSetAreaStyle,
  candlestickStyle,
  onSetCandlestickStyle,
  isPro,
  showRiskZones,
  onSetShowRiskZones,
  showWhatIfSimulation,
  onSetShowWhatIfSimulation,
  activeIndicators,
  onToggleIndicator,
  indicatorLoading,
  isBBActive,
  onToggleBB,
  isKeltnerActive,
  onToggleKeltner,
  isDonchianActive,
  onToggleDonchian,
  isIchiActive,
  onToggleIchi,
  isPivotActive,
  onTogglePivot,
  isFibActive,
  onToggleFib,
  activeOscillatorKey,
  onSetActiveOscillatorKey,
  oscillatorGroups,
  overlayConfigs,
  ticker,
}: ChartSettingsPopoverProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200",
            open && "bg-slate-100 dark:bg-slate-800 text-violet-600 dark:text-violet-400"
          )}
          title="Chart settings"
        >
          <Settings2 className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 p-0"
        sideOffset={8}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-violet-500" />
            <span className="text-sm font-semibold">Chart Settings</span>
          </div>
        </div>

        <ScrollArea className="h-[80vh]">
          <div className="space-y-4 p-4 pb-6">
            {/* General Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <Monitor className="h-3.5 w-3.5" />
                General
              </div>

              <div className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-slate-400" />
                  <span className="text-sm">Show Volume</span>
                </div>
                <Switch checked={showVolume} onCheckedChange={onToggleVolume} />
              </div>

              <div className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Price Display</span>
                </div>
                <Select
                  value={priceDisplayMode}
                  onValueChange={(v) =>
                    onSetPriceDisplayMode(v as "rangeChange" | "absolute")
                  }
                >
                  <SelectTrigger className="w-[160px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rangeChange">
                      % Change (default)
                    </SelectItem>
                    <SelectItem value="absolute">Absolute Price</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Detailed Tooltip</span>
                </div>
                <Switch
                  checked={showDetailedTooltip}
                  onCheckedChange={onSetShowDetailedTooltip}
                />
              </div>
            </div>

            <Separator />

            {/* Chart Type Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <Sliders className="h-3.5 w-3.5" />
                Chart Type
              </div>

              <div className="flex gap-2">
                <Button
                  variant={view === "price" ? "default" : "outline"}
                  size="sm"
                  className="flex-1 h-8"
                  onClick={() => onViewChange("price")}
                >
                  Area
                </Button>
                <Button
                  variant={view === "candlestick" ? "default" : "outline"}
                  size="sm"
                  className="flex-1 h-8"
                  onClick={() => onViewChange("candlestick")}
                >
                  Candlestick
                </Button>
              </div>

              {view === "price" && (
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-sm">Area Style</span>
                  <Select
                    value={areaStyle}
                    onValueChange={(v) =>
                      onSetAreaStyle(v as "area" | "line")
                    }
                  >
                    <SelectTrigger className="w-[120px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="area">Filled Area</SelectItem>
                      <SelectItem value="line">Line Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {view === "candlestick" && (
                <>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-sm">Candlestick Style</span>
                    <Select
                      value={candlestickStyle}
                      onValueChange={(v) =>
                        onSetCandlestickStyle(
                          v as "candlestick" | "heikin-ashi"
                        )
                      }
                    >
                      <SelectTrigger className="w-[120px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="candlestick">Standard</SelectItem>
                        <SelectItem value="heikin-ashi" disabled={!isPro}>
                          Heikin Ashi {!isPro && ""}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {!isPro && (
                    <p className="text-xs text-slate-500">
                      Heikin Ashi requires Pro subscription
                    </p>
                  )}
                </>
              )}
            </div>

            <Separator />

            {/* Indicators Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <TrendingUp className="h-3.5 w-3.5" />
                Indicators {indicatorLoading && "(loading...)"}
              </div>

              {/* Moving Averages */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Moving Averages
                </div>
                <div className="space-y-1.5">
                  {MOVING_AVERAGES.map((key) => {
                    const config = overlayConfigs[key];
                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between py-1"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-0.5 rounded"
                            style={{ backgroundColor: config.color }}
                          />
                          <span className="text-sm">{config.label}</span>
                        </div>
                        <Switch
                          checked={activeIndicators.includes(key)}
                          onCheckedChange={() => onToggleIndicator(key)}
                          disabled={!ticker}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Channels & Bands */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Channels & Bands
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-0.5 rounded"
                        style={{
                          backgroundColor: overlayConfigs["bollinger_upper"].color,
                        }}
                      />
                      <span className="text-sm">Bollinger Bands</span>
                    </div>
                    <Switch
                      checked={isBBActive}
                      onCheckedChange={onToggleBB}
                      disabled={!ticker}
                    />
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-0.5 rounded"
                        style={{
                          backgroundColor:
                            overlayConfigs["keltner_upper"].color,
                        }}
                      />
                      <span className="text-sm">Keltner Channel</span>
                    </div>
                    <Switch
                      checked={isKeltnerActive}
                      onCheckedChange={onToggleKeltner}
                      disabled={!ticker}
                    />
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-0.5 rounded"
                        style={{
                          backgroundColor:
                            overlayConfigs["donchian_upper"].color,
                        }}
                      />
                      <span className="text-sm">Donchian Channel</span>
                    </div>
                    <Switch
                      checked={isDonchianActive}
                      onCheckedChange={onToggleDonchian}
                      disabled={!ticker}
                    />
                  </div>
                </div>
              </div>

              {/* Ichimoku Cloud */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Ichimoku Cloud
                </div>
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-0.5 rounded bg-red-500"
                      style={{ backgroundColor: "#ef4444" }}
                    />
                    <span className="text-sm">Ichimoku Cloud</span>
                  </div>
                  <Switch
                    checked={isIchiActive}
                    onCheckedChange={onToggleIchi}
                    disabled={!ticker}
                  />
                </div>
              </div>

              {/* Trend Overlays */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Trend Overlays
                </div>
                <div className="space-y-1.5">
                  {TREND_OVERLAYS.map((key) => {
                    const config = overlayConfigs[key];
                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between py-1"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-0.5 rounded"
                            style={{ backgroundColor: config.color }}
                          />
                          <span className="text-sm">{config.label}</span>
                        </div>
                        <Switch
                          checked={activeIndicators.includes(key)}
                          onCheckedChange={() => onToggleIndicator(key)}
                          disabled={!ticker}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Support & Resistance */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Support & Resistance
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-0.5 rounded"
                        style={{
                          backgroundColor: overlayConfigs["pivot"].color,
                        }}
                      />
                      <span className="text-sm">Pivot Points</span>
                    </div>
                    <Switch
                      checked={isPivotActive}
                      onCheckedChange={onTogglePivot}
                      disabled={!ticker}
                    />
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-0.5 rounded"
                        style={{
                          backgroundColor:
                            overlayConfigs["fib_61_8"].color,
                        }}
                      />
                      <span className="text-sm">Fibonacci Levels</span>
                    </div>
                    <Switch
                      checked={isFibActive}
                      onCheckedChange={onToggleFib}
                      disabled={!ticker}
                    />
                  </div>
                </div>
              </div>

              {/* Oscillator Sub-Pane */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Oscillator Sub-Pane
                </div>
                <Select
                  value={activeOscillatorKey || "none"}
                  onValueChange={(v) =>
                    onSetActiveOscillatorKey(v === "none" ? null : v)
                  }
                >
                  <SelectTrigger className="w-full h-9">
                    <SelectValue placeholder="Select oscillator" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {oscillatorGroups.map((g) => (
                      <SelectItem key={g.key} value={g.key} disabled={!ticker}>
                        {g.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {activeOscillatorKey && (
                  <p className="text-xs text-violet-500">
                    Active:{" "}
                    {oscillatorGroups.find((g) => g.key === activeOscillatorKey)
                      ?.label || "Unknown"}
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Advanced Section */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Advanced
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-sm">Show Risk Zones</span>
                <Switch
                  checked={showRiskZones}
                  onCheckedChange={onSetShowRiskZones}
                />
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-sm">"What If I Bought Here?"</span>
                <Switch
                  checked={showWhatIfSimulation}
                  onCheckedChange={onSetShowWhatIfSimulation}
                />
              </div>
            </div>
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
