"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search, X, Clock, ChevronRight, BookOpen, Megaphone,
  TrendingUp, BarChart2, BookMarked, LayoutGrid, Calendar,
  Star, ArrowUpRight, Sparkles,
  Speaker,
  GitGraphIcon,
} from "lucide-react";
import { ExternalLinkWarning, useExternalLinkWarning } from "../news/ExternalLinkWarning";
import { NewsletterSubscribe } from "./components/NewsletterSubscribe";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface Blog {
  id: number;
  created_at: string;
  title: string;
  description: string;
  date: string;
  type: string;
  content?: string;
  read_time?: number;
  is_featured?: boolean;
  published?: boolean;
  status?: string;
  thumbnail?: string;
}

type Tab = "blog" | "announcements";

// ─── Markdown link parser ────────────────────────────────────────────────────
type MarkdownPart = { type: "text"; text: string } | { type: "link"; text: string; url: string };

function parseMarkdownLinks(text: string): MarkdownPart[] {
  const parts: MarkdownPart[] = [];
  if (!text) return parts;
  const regex = /\[([^\]]+)\]\s*\(([^)]+)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push({ type: "text", text: text.slice(lastIndex, match.index) });
    parts.push({ type: "link", text: match[1], url: match[2] });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) parts.push({ type: "text", text: text.slice(lastIndex) });
  return parts;
}

function isInternalUrl(rawUrl: string): boolean {
  if (!rawUrl || rawUrl.startsWith("/")) return true;
  try {
    return new URL(rawUrl, "https://www.marketview360.io").hostname.endsWith("marketview360.io");
  } catch { return false; }
}

function RichText({ text, onExternalClick }: { text: string; onExternalClick: (url: string) => void }) {
  const parts = useMemo(() => parseMarkdownLinks(text), [text]);
  if (!parts.length) return <>{text}</>;
  return (
    <>
      {parts.map((p, i) =>
        p.type === "text" ? <span key={i}>{p.text}</span> :
          isInternalUrl(p.url)
            ? <a key={i} href={p.url} className="text-blue-600 hover:underline">{p.text}</a>
            : <button key={i} type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onExternalClick(p.url); }}
                className="text-blue-600 hover:underline">{p.text}</button>
      )}
    </>
  );
}

// ─── Category config ─────────────────────────────────────────────────────────
const BLOG_CATEGORIES = [
  { label: "All", icon: <LayoutGrid className="h-3.5 w-3.5" /> },
  { label: "Investing Tips", icon: <TrendingUp className="h-3.5 w-3.5" /> },
  { label: "Market Analysis", icon: <BarChart2 className="h-3.5 w-3.5" /> },
  { label: "Guides", icon: <BookMarked className="h-3.5 w-3.5" /> },
];
const ANNOUNCEMENT_CATEGORIES = [
  { label: "All", icon: <LayoutGrid className="h-3.5 w-3.5" /> },
  { label: "Feature", icon: <Sparkles className="h-3.5 w-3.5" /> },
  { label: "Fix", icon: <LayoutGrid className="h-3.5 w-3.5" /> },
  { label: "Improvement", icon: <TrendingUp className="h-3.5 w-3.5" /> },
  { label: "Performance", icon: <BarChart2 className="h-3.5 w-3.5" /> },
];
const ANNOUNCEMENT_TYPES = ["feature", "fix", "improvement", "performance"];

// ─── Badge colours ────────────────────────────────────────────────────────────
const TYPE_BADGE: Record<string, string> = {
  "investing tips": "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
  "market analysis": "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-800",
  "guides": "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-400 dark:border-violet-800",
  "feature": "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
  "fix": "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
  "improvement": "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
  "performance": "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
};
const getBadgeCls = (t: string) =>
  TYPE_BADGE[t?.toLowerCase()] ??
  "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";

function TypeBadge({ type }: { type: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getBadgeCls(type)}`}>
      {type}
    </span>
  );
}

// ─── Placeholder gradient thumbnails ─────────────────────────────────────────
const GRADIENTS = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-violet-500 to-purple-600",
  "from-amber-500 to-orange-600",
  "from-sky-500 to-cyan-600",
  "from-rose-500 to-pink-600",
];
const getGradient = (id: number) => GRADIENTS[id % GRADIENTS.length];

// ─── Featured Hero Card ───────────────────────────────────────────────────────
function FeaturedCard({ blog, onSelect, onExternalClick }: {
  blog: Blog;
  onSelect: () => void;
  onExternalClick: (u: string) => void;
}) {
  const date = new Date(blog.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  return (
    <button onClick={onSelect}
      className="group w-full text-left rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-900 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
      <div className="flex flex-col lg:flex-row">
        {/* Thumbnail */}
        <div className="relative lg:w-[52%] h-52 sm:h-64 lg:h-auto overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
          {blog.thumbnail
            ? <img src={blog.thumbnail} alt={blog.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            : <div className={`w-full h-full min-h-[220px] bg-gradient-to-br ${getGradient(blog.id)} flex items-center justify-center`}>
                <BarChart2 className="h-16 w-16 text-white/25" />
              </div>
          }
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full shadow-sm">
            <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> Featured
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between p-6 sm:p-8">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {blog.type && <TypeBadge type={blog.type} />}
              <span className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
                <Calendar className="h-3 w-3" />{date}
              </span>
              {blog.read_time && (
                <span className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
                  <Clock className="h-3 w-3" />{blog.read_time} min
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug line-clamp-3">
              {blog.title}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
              <RichText text={blog.description} onExternalClick={onExternalClick} />
            </p>
          </div>
          <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:gap-3 transition-all">
            Read article <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </button>
  );
}

// ─── Standard Article Card ────────────────────────────────────────────────────
function ArticleCard({ blog, onSelect, onExternalClick, index }: {
  blog: Blog;
  onSelect: () => void;
  onExternalClick: (u: string) => void;
  index: number;
}) {
  const date = new Date(blog.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return (
    <button onClick={onSelect}
      style={{ animationDelay: `${index * 60}ms` }}
      className="group w-full text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 animate-fadeUp">
      {/* Thumbnail */}
      <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-slate-800">
        {blog.thumbnail
          ? <img src={blog.thumbnail} alt={blog.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className={`w-full h-full bg-gradient-to-br ${getGradient(blog.id)} flex items-center justify-center`}>
              <TrendingUp className="h-10 w-10 text-white/25" />
            </div>
        }
        {blog.type && (
          <div className="absolute top-3 left-3">
            <TypeBadge type={blog.type} />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 space-y-2.5">
        <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
          <Calendar className="h-3 w-3 shrink-0" />{date}
          {blog.read_time && <><span className="opacity-50">·</span><Clock className="h-3 w-3 shrink-0" />{blog.read_time} min read</>}
        </div>
        <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug line-clamp-2">
          {blog.title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
          <RichText text={blog.description} onExternalClick={onExternalClick} />
        </p>
        <div className="pt-1 flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:gap-2 transition-all">
          Read more <ChevronRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </button>
  );
}

// ─── Skeletons ────────────────────────────────────────────────────────────────
function FeaturedSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row">
      <Skeleton className="lg:w-[52%] h-56 lg:h-72" />
      <div className="flex-1 p-8 space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-7 w-full" />
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}
function CardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
      <Skeleton className="h-44 w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  );
}

// ─── Article Modal ────────────────────────────────────────────────────────────
function ArticleModal({ blog, onClose, onExternalClick }: {
  blog: Blog;
  onClose: () => void;
  onExternalClick: (u: string) => void;
}) {
  const date = new Date(blog.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
      onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl animate-slideUp"
        onClick={(e) => e.stopPropagation()}>

        {/* Header image / gradient */}
        <div className="relative shrink-0">
          {blog.thumbnail
            ? <div className="h-48 sm:h-60 overflow-hidden rounded-t-2xl bg-slate-100 dark:bg-slate-800">
                <img src={blog.thumbnail} alt={blog.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent rounded-t-2xl" />
              </div>
            : <div className={`h-24 rounded-t-2xl bg-gradient-to-br ${getGradient(blog.id)}`} />
          }
          <button onClick={onClose} aria-label="Close"
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors shadow-sm">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Meta */}
        <div className="px-6 sm:px-8 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800 space-y-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            {blog.type && <TypeBadge type={blog.type} />}
            {blog.is_featured && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                <Star className="h-3 w-3 fill-current" /> Featured
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-slate-400"><Calendar className="h-3.5 w-3.5" />{date}</span>
            {blog.read_time && <span className="flex items-center gap-1 text-xs text-slate-400"><Clock className="h-3.5 w-3.5" />{blog.read_time} min read</span>}
          </div>
          <h2 id="modal-title" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
            {blog.title}
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 sm:px-8 py-6 overflow-y-auto flex-1 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
          <RichText text={blog.content || blog.description} onExternalClick={onExternalClick} />
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50 dark:bg-slate-800/40 rounded-b-2xl shrink-0">
          <button onClick={onClose}
            className="px-5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">{label}</h2>
      <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("blog");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { warningState, showWarning, confirmNavigation, setWarningOpen } = useExternalLinkWarning();

  useEffect(() => {
    fetch(`${API_BASE}/blog`)
      .then((r) => { if (!r.ok) throw new Error(r.statusText); return r.json(); })
      .then((d) => setBlogs(d || []))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setSelectedBlog(null); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setSelectedCategory("All");
    setSearchQuery("");
  };

  const tabBlogs = useMemo(() =>
    blogs.filter((b) => {
      const t = b.type?.toLowerCase() ?? "";
      return activeTab === "announcements" ? ANNOUNCEMENT_TYPES.includes(t) : !ANNOUNCEMENT_TYPES.includes(t);
    }),
    [blogs, activeTab]
  );

  const filteredBlogs = useMemo(() =>
    tabBlogs.filter((b) => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || b.title.toLowerCase().includes(q) || b.description.toLowerCase().includes(q);
      const matchCat = selectedCategory === "All" || b.type?.toLowerCase() === selectedCategory.toLowerCase();
      return matchSearch && matchCat;
    }),
    [tabBlogs, searchQuery, selectedCategory]
  );

  const featured = filteredBlogs.find((b) => b.is_featured);
  const rest = filteredBlogs.filter((b) => b.id !== featured?.id);
  const categories = activeTab === "blog" ? BLOG_CATEGORIES : ANNOUNCEMENT_CATEGORIES;

  return (
    <div className="min-h-screen bg-[#f9fafb] dark:bg-[#0b0f1a]">
      <ExternalLinkWarning open={warningState.open} onOpenChange={setWarningOpen} url={warningState.url} onConfirm={confirmNavigation} />

      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        {/* Subtle dot grid */}
        <div className="absolute inset-0 bg-[radial-gradient(circle,#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(circle,#1e293b_1px,transparent_1px)] bg-[size:28px_28px] opacity-60" />
        {/* Blue glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[700px] h-40 bg-blue-500/8 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10 text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 mb-5 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <GitGraphIcon className="h-3 w-3" /> Version 1.0 [Beta]
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-slate-900 dark:text-white tracking-tight mb-4 leading-tight">
            Insights &amp;{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              Updates
            </span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg max-w-xl mx-auto mb-9 leading-relaxed">
            Expert analysis, investing guides, and product updates from the MarketView360 team
          </p>

          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 h-12 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-400 shadow-sm transition"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex">
            {(["blog", "announcements"] as Tab[]).map((tab) => (
              <button key={tab} onClick={() => handleTabChange(tab)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all duration-150 ${
                  activeTab === tab
                    ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                }`}>
                {tab === "blog" ? <BookOpen className="h-4 w-4" /> : <Megaphone className="h-4 w-4" />}
                {tab === "blog" ? "Blog Posts" : "Announcements"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Sticky category filter ── */}
      <div className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {categories.map(({ label, icon }) => (
            <button key={label} onClick={() => setSelectedCategory(label)}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 ${
                selectedCategory === label
                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200 dark:shadow-blue-900/30"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400"
              }`}>
              {icon}{label}
            </button>
          ))}
          {!loading && filteredBlogs.length > 0 && (
            <span className="ml-auto shrink-0 text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
              {filteredBlogs.length} {filteredBlogs.length === 1 ? "article" : "articles"}
            </span>
          )}
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

        {loading ? (
          <div className="space-y-8">
            <FeaturedSkeleton />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-5 border border-slate-200 dark:border-slate-700">
              <Search className="h-7 w-7 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No articles found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
              We couldn&apos;t find any articles matching your search criteria. Try adjusting your filters.
            </p>
            {(searchQuery || selectedCategory !== "All") && (
              <button onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                className="mt-5 px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Featured */}
            {featured && (
              <section>
                <SectionLabel label="Featured" />
                <FeaturedCard blog={featured} onSelect={() => setSelectedBlog(featured)} onExternalClick={showWarning} />
              </section>
            )}

            {/* Article grid */}
            {rest.length > 0 && (
              <section>
                {featured && <SectionLabel label="Latest Articles" />}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {rest.map((b, i) => (
                    <ArticleCard key={b.id} blog={b} onSelect={() => setSelectedBlog(b)} onExternalClick={showWarning} index={i} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* Newsletter */}
        <NewsletterSubscribe />
      </div>

      {/* Modal */}
      {selectedBlog && (
        <ArticleModal blog={selectedBlog} onClose={() => setSelectedBlog(null)} onExternalClick={showWarning} />
      )}

      <style jsx>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(32px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        .animate-fadeUp  { animation: fadeUp  0.45s ease-out both; }
        .animate-fadeIn  { animation: fadeIn  0.2s  ease-out; }
        .animate-slideUp { animation: slideUp 0.3s  cubic-bezier(0.16,1,0.3,1); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}