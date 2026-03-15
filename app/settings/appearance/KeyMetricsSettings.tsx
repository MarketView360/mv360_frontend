"use client";

import { BarChart3, RotateCcw, Eye, EyeOff, ChevronDown, ChevronUp, Info, Tag, Sparkles, Columns } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  useMetricsPreferences,
  type MetricCategory,
} from "@/hooks/useMetricsPreferences";
import { CATEGORY_INFO } from "@/lib/metricDefinitions";

const CATEGORY_ORDER: MetricCategory[] = [
  "valuation",
  "profitability",
  "growth",
  "dividends",
  "risk",
  "ownership",
];

export function KeyMetricsSettings() {
  const {
    preferences,
    isLoaded,
    setShowQualityTags,
    setShowDefinitionsOnHover,
    setShowAdvancedMetrics,
    setEnableSmartScreenerColumns,
    setCategoryVisible,
    setCategoryExpanded,
    expandAllCategories,
    collapseAllCategories,
    resetToDefaults,
  } = useMetricsPreferences();

  if (!isLoaded) {
    return (
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5 text-indigo-500" />
            Key Metrics Display
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Display Options Card */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5 text-indigo-500" />
                Key Metrics Display
              </CardTitle>
              <CardDescription>
                Control how financial metrics are displayed on company pages
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                resetToDefaults();
                toast.success("Metrics preferences reset to defaults");
              }}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quality Tags */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <Tag className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="space-y-0.5">
                <Label className="font-medium text-slate-900 dark:text-white">
                  Quality Indicators
                </Label>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Show Strong, Normal, Weak tags below metric values
                </p>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[250px]">
                    <p className="text-xs">
                      Quality tags are based on industry-standard thresholds. For example, ROE above 15% is considered Strong.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Switch
              checked={preferences.showQualityTags}
              onCheckedChange={(checked) => {
                setShowQualityTags(checked);
                toast.success(checked ? "Quality tags enabled" : "Quality tags disabled");
              }}
            />
          </div>

          {/* Definitions on Hover */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="space-y-0.5">
                <Label className="font-medium text-slate-900 dark:text-white">
                  Show Definitions on Hover
                </Label>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Display metric explanations when hovering over metric cards
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.showDefinitionsOnHover}
              onCheckedChange={(checked) => {
                setShowDefinitionsOnHover(checked);
                toast.success(checked ? "Hover definitions enabled" : "Hover definitions disabled");
              }}
            />
          </div>

          {/* Advanced Metrics - No Pro badge, available to all */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                <Sparkles className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div className="space-y-0.5">
                <Label className="font-medium text-slate-900 dark:text-white">
                  Show Advanced Metrics
                </Label>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Include detailed metrics like EV/EBITDA, PEG Ratio, Quick Ratio
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.showAdvancedMetrics}
              onCheckedChange={(checked) => {
                setShowAdvancedMetrics(checked);
                toast.success(checked ? "Advanced metrics enabled" : "Advanced metrics disabled");
              }}
            />
          </div>

          {/* Smart Screener Columns */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Columns className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="space-y-0.5">
                <Label className="font-medium text-slate-900 dark:text-white">
                  Smart Screener Columns
                </Label>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Auto-prioritize columns used in your screener query
                </p>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[260px]">
                    <p className="text-xs">
                      When enabled, the results table highlights metrics referenced in your query and keeps the layout focused.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Switch
              checked={preferences.enableSmartScreenerColumns}
              onCheckedChange={(checked) => {
                setEnableSmartScreenerColumns(checked);
                toast.success(checked ? "Smart columns enabled" : "Smart columns disabled");
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Category Settings Card */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Eye className="h-5 w-5 text-emerald-500" />
                Metric Categories
              </CardTitle>
              <CardDescription>
                Control visibility and default expansion state for each category
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  expandAllCategories();
                  toast.success("All categories expanded");
                }}
                className="gap-1.5 text-xs"
              >
                <ChevronDown className="h-3.5 w-3.5" />
                Expand All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  collapseAllCategories();
                  toast.success("All categories collapsed");
                }}
                className="gap-1.5 text-xs"
              >
                <ChevronUp className="h-3.5 w-3.5" />
                Collapse All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {CATEGORY_ORDER.map((category) => {
              const info = CATEGORY_INFO[category];
              const isVisible = preferences.visibleCategories[category];
              const isExpanded = preferences.expandedCategories[category];

              return (
                <div
                  key={category}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-sm text-slate-900 dark:text-white">
                        {info.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {info.description}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Visibility Toggle */}
                    <button
                      onClick={() => {
                        setCategoryVisible(category, !isVisible);
                        toast.success(isVisible ? `${info.label} hidden` : `${info.label} visible`);
                      }}
                      className={`p-1.5 rounded-md transition-colors ${
                        isVisible
                          ? "text-brand hover:bg-brand/10"
                          : "text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                      title={isVisible ? "Hide category" : "Show category"}
                    >
                      {isVisible ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </button>

                    {/* Expansion Toggle */}
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor={`expand-${category}`}
                        className="text-xs text-muted-foreground"
                      >
                        Auto-expand
                      </Label>
                      <Switch
                        id={`expand-${category}`}
                        checked={isExpanded}
                        onCheckedChange={(checked) => setCategoryExpanded(category, checked)}
                        disabled={!isVisible}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Info Box */}
      <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
        Metric preferences are stored locally in your browser and will persist across sessions.
        Visit a company page to see these settings in action.
      </p>
    </div>
  );
}
