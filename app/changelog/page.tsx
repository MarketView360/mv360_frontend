"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Calendar, 
  Sparkles, 
  Bug, 
  Wrench, 
  Zap, 
  AlertCircle, 
  X, 
  Search,
  Filter,
  ChevronRight,
  Clock
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface Changelog {
  id: number;
  created_at: string;
  title: string;
  description: string;
  date: string;
  type: string;
}

const getTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "feature":
      return <Sparkles className="h-4 w-4" />;
    case "fix":
      return <Bug className="h-4 w-4" />;
    case "improvement":
      return <Wrench className="h-4 w-4" />;
    case "performance":
      return <Zap className="h-4 w-4" />;
    default:
      return <Calendar className="h-4 w-4" />;
  }
};

const getTypeBadgeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case "feature":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800";
    case "fix":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800";
    case "improvement":
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800";
    case "performance":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800";
    default:
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700";
  }
};

export default function ChangelogPage() {
  const [changelogs, setChangelogs] = useState<Changelog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChangelog, setSelectedChangelog] = useState<Changelog | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

  useEffect(() => {
    const fetchChangelogs = async () => {
      try {
        const response = await fetch(`${API_BASE}/changelog`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch changelogs: ${response.statusText}`);
        }

        const data = await response.json();
        setChangelogs(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load changelogs");
      } finally {
        setLoading(false);
      }
    };

    fetchChangelogs();
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedChangelog) {
        setSelectedChangelog(null);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [selectedChangelog]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  const filterChangelogs = (logs: Changelog[]) => {
    return logs.filter((log) => {
      const matchesSearch =
        searchQuery === "" ||
        log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType =
        selectedType === "all" ||
        log.type.toLowerCase() === selectedType.toLowerCase();

      return matchesSearch && matchesType;
    });
  };

  const groupByMonth = (logs: Changelog[]) => {
    const grouped: Record<string, Changelog[]> = {};
    
    logs.forEach((log) => {
      const date = new Date(log.date);
      const monthYear = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      });
      
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(log);
    });
    
    return grouped;
  };

  const filteredChangelogs = filterChangelogs(changelogs);
  const groupedChangelogs = groupByMonth(filteredChangelogs);
  const types = ["all", "feature", "fix", "improvement", "performance"];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="mx-auto max-w-[1200px] px-4 md:px-8 lg:px-12 py-12 md:py-20">
          <Skeleton className="h-16 w-80 mb-4" />
          <Skeleton className="h-8 w-full max-w-2xl mb-12" />
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-900 dark:text-red-300 mb-1">
                  Error loading changelog
                </h3>
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto max-w-[1200px] px-4 md:px-8 lg:px-12 py-12 md:py-20">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-brand/10 rounded-xl">
              <Sparkles className="h-8 w-8 text-brand" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent">
              Changelog
            </h1>
          </div>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl">
            Stay up to date with the latest features, improvements, and bug fixes. We&apos;re constantly improving to serve you better.
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search changelogs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-brand focus:ring-brand"
              />
            </div>

            {/* Type Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              {types.map((type) => (
                <Button
                  key={type}
                  variant={selectedType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType(type)}
                  className={`shrink-0 h-12 ${
                    selectedType === type
                      ? "bg-brand hover:bg-brand/90 text-white"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {type === "all" ? (
                    <Filter className="h-4 w-4 mr-2" />
                  ) : (
                    <span className="mr-2">{getTypeIcon(type)}</span>
                  )}
                  <span className="capitalize">{type}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Clock className="h-4 w-4" />
            <span>
              {filteredChangelogs.length} {filteredChangelogs.length === 1 ? "update" : "updates"} found
            </span>
          </div>
        </div>

        {/* Changelog Entries */}
        {Object.keys(groupedChangelogs).length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex p-6 bg-slate-100 dark:bg-slate-800/50 rounded-2xl mb-6">
              <Calendar className="h-16 w-16 text-slate-400 dark:text-slate-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              {searchQuery || selectedType !== "all" ? "No results found" : "No updates yet"}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              {searchQuery || selectedType !== "all"
                ? "Try adjusting your search or filter to find what you're looking for."
                : "Check back soon for the latest updates and improvements."}
            </p>
            {(searchQuery || selectedType !== "all") && (
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedType("all");
                }}
                className="mt-6 bg-brand hover:bg-brand/90"
              >
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-16">
            {Object.entries(groupedChangelogs).map(([monthYear, logs]) => (
              <div key={monthYear} className="relative">
                {/* Month Header with decorative line */}
                <div className="flex items-center gap-6 mb-8">
                  <div className="relative">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                      {monthYear}
                    </h2>
                    <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-brand to-transparent rounded-full" />
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-slate-200 via-slate-200 to-transparent dark:from-slate-800 dark:via-slate-800 dark:to-transparent" />
                </div>

                {/* Entries for this month */}
                <div className="space-y-6">
                  {logs.map((log, index) => (
                    <Card
                      key={log.id}
                      className="group border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl hover:border-brand/50 dark:hover:border-brand/50 transition-all duration-300 overflow-hidden"
                      style={{
                        animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
                      }}
                    >
                      <CardContent className="p-0">
                        <button
                          onClick={() => setSelectedChangelog(log)}
                          className="w-full text-left"
                        >
                          <div className="flex flex-col sm:flex-row gap-6 p-6 sm:p-8">
                            {/* Date Badge */}
                            <div className="flex sm:flex-col items-center sm:items-center gap-3 sm:gap-0 shrink-0">
                              <div className="flex flex-col items-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm group-hover:border-brand/50 dark:group-hover:border-brand/50 transition-colors min-w-[80px]">
                                <span className="text-3xl font-bold bg-gradient-to-br from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                                  {new Date(log.date).getDate()}
                                </span>
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">
                                  {new Date(log.date).toLocaleDateString("en-US", { month: "short" })}
                                </span>
                              </div>
                              <span className="text-sm text-slate-500 dark:text-slate-400 sm:mt-3">
                                {getRelativeTime(log.date)}
                              </span>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 space-y-4">
                              <div className="flex flex-wrap items-start gap-3">
                                {log.type && (
                                  <Badge
                                    variant="outline"
                                    className={`shrink-0 ${getTypeBadgeColor(log.type)} font-semibold`}
                                  >
                                    <span className="flex items-center gap-1.5">
                                      {getTypeIcon(log.type)}
                                      <span className="capitalize">{log.type}</span>
                                    </span>
                                  </Badge>
                                )}
                                <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-brand dark:group-hover:text-brand transition-colors leading-tight">
                                  {log.title}
                                </h3>
                              </div>

                              <p className="text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                                {log.description}
                              </p>

                              <div className="flex items-center gap-2 text-sm font-medium text-brand group-hover:gap-3 transition-all">
                                <span>Read more</span>
                                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                              </div>
                            </div>
                          </div>
                        </button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal for full changelog view */}
        {selectedChangelog && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
            onClick={() => setSelectedChangelog(null)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="changelog-title"
          >
            <div
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-slideUp"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-6 p-6 md:p-8 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    {selectedChangelog.type && (
                      <Badge
                        variant="outline"
                        className={`${getTypeBadgeColor(selectedChangelog.type)} font-semibold`}
                      >
                        <span className="flex items-center gap-1.5">
                          {getTypeIcon(selectedChangelog.type)}
                          <span className="capitalize">{selectedChangelog.type}</span>
                        </span>
                      </Badge>
                    )}
                    <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatDate(selectedChangelog.date)}
                    </span>
                  </div>
                  <h2
                    id="changelog-title"
                    className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight"
                  >
                    {selectedChangelog.title}
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedChangelog(null)}
                  className="shrink-0 h-10 w-10 p-0 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Modal Content */}
              <div className="p-6 md:p-8 overflow-y-auto max-h-[calc(90vh-180px)]">
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <div className="text-base md:text-lg text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {selectedChangelog.description}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between p-6 md:p-8 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <Clock className="h-4 w-4" />
                  <span>{getRelativeTime(selectedChangelog.date)}</span>
                </div>
                <Button
                  onClick={() => setSelectedChangelog(null)}
                  variant="outline"
                  className="border-slate-200 dark:border-slate-700"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
