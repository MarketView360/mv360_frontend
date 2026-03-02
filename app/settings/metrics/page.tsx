"use client";

import { BarChart3, RotateCcw, Eye, EyeOff, ChevronDown, ChevronUp, Info } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

export default function MetricsSettingsPage() {
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
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-brand" />
              Key Metrics Display
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-lg" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Key Metrics Display
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Customize how financial metrics are displayed on company pages
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={resetToDefaults}
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset to Defaults
        </Button>
      </div>

      {/* Display Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Display Options</CardTitle>
          <CardDescription>
            Control what information is shown alongside metric values
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quality Tags */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="space-y-1">
                <Label htmlFor="quality-tags" className="text-sm font-medium">
                  Quality Indicators
                </Label>
                <p className="text-xs text-muted-foreground">
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
              id="quality-tags"
              checked={preferences.showQualityTags}
              onCheckedChange={setShowQualityTags}
            />
          </div>

          {/* Definitions on Hover */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="definitions" className="text-sm font-medium">
                Show Definitions on Hover
              </Label>
              <p className="text-xs text-muted-foreground">
                Display metric explanations when hovering over metric cards
              </p>
            </div>
            <Switch
              id="definitions"
              checked={preferences.showDefinitionsOnHover}
              onCheckedChange={setShowDefinitionsOnHover}
            />
          </div>

          {/* Advanced Metrics */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="space-y-1">
                <Label htmlFor="advanced" className="text-sm font-medium">
                  Show Advanced Metrics
                </Label>
                <p className="text-xs text-muted-foreground">
                  Include detailed metrics like EV/EBITDA, PEG Ratio, Quick Ratio
                </p>
              </div>
              <Badge variant="secondary" className="text-[10px]">
                Pro
              </Badge>
            </div>
            <Switch
              id="advanced"
              checked={preferences.showAdvancedMetrics}
              onCheckedChange={setShowAdvancedMetrics}
            />
          </div>

          {/* Smart Screener Columns */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="space-y-1">
                <Label htmlFor="smart-columns" className="text-sm font-medium">
                  Smart Screener Columns
                </Label>
                <p className="text-xs text-muted-foreground">
                  Automatically prioritize and show columns used in your screener query. You can still toggle other columns from the results table.
                </p>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[260px]">
                    <p className="text-xs">
                      When enabled, the results table highlights metrics referenced in your query (for example ROE, P/E, dividend yield) and keeps the layout focused. Disable if you prefer a fixed set of columns.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Switch
              id="smart-columns"
              checked={preferences.enableSmartScreenerColumns}
              onCheckedChange={setEnableSmartScreenerColumns}
            />
          </div>
        </CardContent>
      </Card>

      {/* Category Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Metric Categories</CardTitle>
              <CardDescription>
                Control visibility and default expansion state for each category
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={expandAllCategories}
                className="gap-1.5 text-xs"
              >
                <ChevronDown className="h-3.5 w-3.5" />
                Expand All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={collapseAllCategories}
                className="gap-1.5 text-xs"
              >
                <ChevronUp className="h-3.5 w-3.5" />
                Collapse All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {CATEGORY_ORDER.map((category) => {
              const info = CATEGORY_INFO[category];
              const isVisible = preferences.visibleCategories[category];
              const isExpanded = preferences.expandedCategories[category];

              return (
                <div
                  key={category}
                  className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-slate-900 dark:text-white">
                        {info.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {info.description}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Visibility Toggle */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCategoryVisible(category, !isVisible)}
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
                    </div>

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
                        onCheckedChange={(checked) =>
                          setCategoryExpanded(category, checked)
                        }
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
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Preferences are saved locally
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Your metric display preferences are stored in your browser and will persist across sessions. 
                They are not synced across different devices or browsers.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
