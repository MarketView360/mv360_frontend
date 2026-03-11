"use client";

import React, { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  Layers,
  X,
  Users,
  Star,
  FolderOpen,
  Save,
} from "lucide-react";
import Link from "next/link";
import ScreenerQueryBuilder from "@/components/ScreenerQueryBuilder";
import ScreenTemplatesSidebar from "@/components/ScreenTemplatesSidebar";
import { SavedScreensList } from "@/components/SavedScreensList";
import { SaveScreenDialog } from "@/components/SaveScreenDialog";
import { useSavedScreens } from "@/hooks/useSavedScreens";
import { useAuth } from "@/providers/AuthProvider";
import { toast } from "sonner";

export default function ScreensPage() {
  return (
    <Suspense fallback={<ScreensPageSkeleton />}>
      <ScreensPageContent />
    </Suspense>
  );
}

function ScreensPageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand" />
    </div>
  );
}

function ScreensPageContent() {
  const router = useRouter();
  const { session } = useAuth();
  const [query, setQuery] = useState(
    "Market Capitalization > 1000 AND\nPE < 25 AND\nROE > 15"
  );
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSavedScreens, setShowSavedScreens] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const {
    savedScreens,
    loading: screensLoading,
    saveScreen,
    updateScreen,
    deleteScreen,
    quotaInfo,
  } = useSavedScreens(session?.access_token || null);

  // Handle template selection
  const handleTemplateSelect = (templateQuery: string) => {
    setQuery(templateQuery);
    setShowTemplates(false);

    const params = new URLSearchParams({
      query: templateQuery,
      sort: "market_capitalization.desc",
      limit: String(50),
      offset: String(0),
      exchange: "us",
    });
    router.push(`/screens/results?${params.toString()}`);
  };

  // Handle saved screen selection
  const handleRunSavedScreen = (screen: typeof savedScreens[0]) => {
    setShowSavedScreens(false);
    setQuery(screen.query);

    const params = new URLSearchParams({
      query: screen.query,
      sort: screen.sort_order,
      limit: String(screen.limit_count),
      offset: String(0),
      exchange: screen.exchange,
    });
    router.push(`/screens/results?${params.toString()}`);
  };

  // Handle saving a new screen
  const handleSaveScreen = async (data: { name: string; description?: string }) => {
    const result = await saveScreen({
      name: data.name,
      description: data.description,
      query: query,
      sort_order: "market_capitalization.desc",
      limit_count: 50,
      exchange: "us",
    });

    if (result.success) {
      toast.success("Screen saved successfully!");
    } else {
      toast.error(result.error || "Failed to save screen");
    }
  };

  const handleUpdateScreen = async (
    id: string,
    updates: { name?: string; description?: string }
  ) => {
    const result = await updateScreen(id, updates);
    if (result.success) {
      toast.success("Screen updated!");
    } else {
      toast.error(result.error || "Failed to update screen");
    }
  };

  const handleDeleteScreen = async (id: string) => {
    const result = await deleteScreen(id);
    if (result.success) {
      toast.success("Screen deleted!");
    } else {
      toast.error(result.error || "Failed to delete screen");
    }
  };

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950 pb-20 font-sans transition-colors duration-300">
      {/* Compact Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-16 transition-colors duration-300">
        <div className="h-full mx-auto max-w-[1920px] px-4 md:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-slate-400" />
            <h1 className="text-lg font-bold font-heading text-slate-900 dark:text-white tracking-tight">
              Stock Screens
            </h1>
            <span className="hidden sm:inline-block h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1"></span>
            <p className="text-slate-500 dark:text-slate-400 text-sm hidden sm:block truncate max-w-md">
              Build custom queries and discover investment ideas
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* My Saved Screens Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSavedScreens(true)}
              className="flex items-center gap-2 h-9 bg-white dark:bg-slate-800"
            >
              <FolderOpen className="w-4 h-4" />
              <span className="hidden sm:inline">My Saved Screens</span>
            </Button>

            {/* Watchlists Button */}
            <Link href="/watchlist">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 h-9 bg-white dark:bg-slate-800"
              >
                <Star className="w-4 h-4" />
                <span className="hidden sm:inline">Watchlists</span>
              </Button>
            </Link>

            {/* Save Button */}
            <Button
              variant="default"
              size="sm"
              onClick={() => setShowSaveDialog(true)}
              className="flex items-center gap-2 h-9 bg-brand hover:bg-brand/90"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Save</span>
            </Button>

            {/* Templates Toggle Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTemplates(!showTemplates)}
              className={`flex items-center gap-2 h-9 ${showTemplates ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300' : 'bg-white dark:bg-slate-800'}`}
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Templates</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-[1920px] px-4 md:px-6 lg:px-8 py-6">
        {/* Query Builder */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300">
          <ScreenerQueryBuilder value={query} onChange={setQuery} />
        </div>

        {/* Community Card */}
        <div className="mt-8">
          <Card className="border-slate-200 dark:border-slate-800 border-dashed shadow-none bg-slate-50/50 dark:bg-slate-900/50">
            <CardContent className="p-8 md:p-12 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Community Screens
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm max-w-lg mb-4 leading-relaxed">
                We&apos;re crafting a space where the sharpest screen ideas from top
                investors and the MarketView360 community quietly bubble up before
                they become obvious.
              </p>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium border border-amber-200 dark:border-amber-800">
                Coming Soon
              </span>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Saved Screens Sidebar Panel */}
      {showSavedScreens && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/20 dark:bg-black/40 backdrop-blur-[1px] z-40 transition-opacity animate-in fade-in duration-200"
            onClick={() => setShowSavedScreens(false)}
          />
          <div className="fixed right-0 top-16 bottom-0 w-80 max-w-[90vw] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                My Saved Screens
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSavedScreens(false)}
                className="p-1 h-7 w-7 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="h-[calc(100%-60px)]">
              <SavedScreensList
                savedScreens={savedScreens}
                loading={screensLoading}
                onRun={handleRunSavedScreen}
                onUpdate={handleUpdateScreen}
                onDelete={handleDeleteScreen}
              />
            </div>
          </div>
        </>
      )}

      {/* Templates Overlay Panel */}
      {showTemplates && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/20 dark:bg-black/40 backdrop-blur-[1px] z-40 transition-opacity animate-in fade-in duration-200"
            onClick={() => setShowTemplates(false)}
          />
          <div className="fixed right-0 top-16 bottom-0 w-80 max-w-[90vw] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                Screen Templates
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTemplates(false)}
                className="p-1 h-7 w-7 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-4 overflow-y-auto h-[calc(100%-60px)]">
              <ScreenTemplatesSidebar
                onTemplateSelect={handleTemplateSelect}
              />
            </div>
          </div>
        </>
      )}

      {/* Save Screen Dialog */}
      <SaveScreenDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        onSave={handleSaveScreen}
        query={query}
        currentCount={quotaInfo?.current_count || 0}
        maxAllowed={quotaInfo?.max_allowed || 5}
        canSave={quotaInfo?.can_save ?? true}
        quotaMessage={quotaInfo?.message || ""}
      />
    </div>
  );
}
