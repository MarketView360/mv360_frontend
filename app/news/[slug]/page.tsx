"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow, format, parseISO, isValid } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Crown,
  ExternalLink,
  Share2,
  Tag,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Link2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ExternalLinkWarning,
  useExternalLinkWarning,
} from "../ExternalLinkWarning";
import { getImageForArticle } from "../newsImages";
import { ArticleDetailSkeleton } from "../NewsSkeletonNew";
import { ScrollToTopFab } from "../ScrollToTopFab";
import { useAuth } from "@/providers/AuthProvider";
import { useQuota } from "@/hooks/useQuota";
import { aiApi } from "@/lib/api/ai";
import { toast } from "sonner";
import { GoogleAdSlot, GoogleAdInline } from "@/components/GoogleAdSlot";

interface ArticleData {
  title: string;
  content: string;
  date: string;
  link: string;
  symbols?: string[];
  author?: string;
  source?: string;
}

const CONTENT_COLLAPSE_THRESHOLD = 3000;

function generateSlugFromArticle(article: ArticleData & { link: string; slug?: string }): string {
  if (article.slug) return article.slug;
  
  const titleSlug = article.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  
  const hash = article.link
    .split("")
    .reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0);
  const hashStr = Math.abs(hash).toString(36).slice(0, 6);
  
  return `${titleSlug}-${hashStr}`;
}

// Enhanced content processor
function processArticleContent(content: string) {
  if (!content) return { html: "", hasLinks: false, links: [] as string[] };

  // Clean up common suffixes and paywall/premium content
  let cleaned = content
    .replace(/View Comments?\.?\s*$/i, "")
    .replace(/Read More\.?\s*$/i, "")
    .replace(/Continue Reading\.?\s*$/i, "")
    .replace(/Click here to read more\.?\s*$/i, "")
    .replace(/PREMIUM[\s\S]*?$/i, "")
    .replace(/Want the latest recommendations from[\s\S]*?$/i, "")
    .replace(/Click to get this free report[\s\S]*?$/i, "")
    .replace(/\(read:.*?\)/gi, "")
    .replace(/繼續閱讀/g, "")
    .replace(/ETF Research Reports?[\s\S]*?$/gi, "")
    .replace(/Already have a subscription\?[\s\S]*?$/i, "")
    .replace(/A Silver or Gold subscription[\s\S]*?$/i, "")
    .replace(/Upgrade to read this[\s\S]*?$/i, "")
    .trim();

  // Some feeds embed links using a custom inline-link markup like:
  // ["inline-link" data-url="https://example.com"]>[example.com]
  // or variants with extra text like ]to">[label]. Normalize any such
  // block back to a plain URL so our URL regex can handle them.
  cleaned = cleaned.replace(
    /\["inline-link"[\s\S]*?data-url="([^"\]]+)[^]]*]/g,
    (_match, url) => url,
  );

  const urlRegex = /(https?:\/\/[^\s<]+)/g;
  const links: string[] = [];
  let hasLinks = false;

  // Replace URLs with clickable inline links
  cleaned = cleaned.replace(urlRegex, (url) => {
    hasLinks = true;
    links.push(url);
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    return `<span class="inline-link" data-url="${url}">[${hostname}]</span>`;
  });

  // Split content into paragraphs
  const paragraphs = cleaned.split(/\n\n+/).filter(p => p.trim());
  
  let html = "";
  
  for (const para of paragraphs) {
    const trimmed = para.trim();
    
    // Skip empty paragraphs
    if (!trimmed) continue;
    
    // Detect headings (lines that end with "?" or are all caps with multiple words, or start with numbers like "2026:")
    const isQuestion = /^[A-Z].+\?$/.test(trimmed);
    const isAllCapsHeading = /^[A-Z\s:0-9–-]{10,}$/.test(trimmed) && trimmed.split(/\s+/).length >= 2;
    const isNumberedHeading = /^\d{4}:/.test(trimmed);
    
    if (isQuestion || isAllCapsHeading || isNumberedHeading) {
      html += `<h2 class="article-heading">${trimmed}</h2>`;
      continue;
    }
    
    // Detect lists (lines starting with bullet points or numbers)
    const listItems = trimmed.split(/\n/).filter(l => /^[-•*]\s+|^\d+\.\s+/.test(l.trim()));
    
    if (listItems.length > 0 && listItems.length === trimmed.split(/\n/).length) {
      html += '<ul class="article-list">';
      listItems.forEach(item => {
        const cleaned = item.replace(/^[-•*]\s+|^\d+\.\s+/, '').trim();
        html += `<li>${formatInlineText(cleaned)}</li>`;
      });
      html += '</ul>';
      continue;
    }
    
    // Regular paragraph - format inline text
    html += `<p class="article-paragraph">${formatInlineText(trimmed)}</p>`;
  }

  return { html, hasLinks, links };
}

// Format inline text with bold, italic, quotes, etc.
function formatInlineText(text: string): string {
  // Handle quoted text (text in quotation marks)
  text = text.replace(/"([^"]+)"/g, '<span class="article-quote">"$1"</span>');
  
  // Handle emphasis - common patterns like "as quoted on" or "according to"
  text = text.replace(/\b(as quoted on|according to|mentioned in|said)\b/gi, '<em class="article-emphasis">$1</em>');
  
  // Handle ticker symbols (uppercase letters in parentheses)
  text = text.replace(/\(([A-Z]{1,5}(?:,\s*[A-Z]{1,5})*)\)/g, '<span class="article-ticker">($1)</span>');
  
  // Handle percentage and number formatting
  text = text.replace(/(\d+(?:\.\d+)?%)/g, '<strong class="article-number">$1</strong>');
  
  return text;
}

export default function NewsArticlePage() {
  const params = useParams() as { slug: string };
  const router = useRouter();
  const slug = params.slug as string;

  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const { warningState, showWarning, setWarningOpen, confirmNavigation } =
    useExternalLinkWarning();

  const { session } = useAuth();
  const token = session?.access_token ?? null;
  const { quota, canUse } = useQuota(token);
  const [isSummarizing, setIsSummarizing] = useState(false);

  useEffect(() => {
    async function fetchArticle() {
      try {
        // First, try to get article from sessionStorage
        if (typeof window !== "undefined") {
          const cached = sessionStorage.getItem(`article_${slug}`);
          if (cached) {
            const data = JSON.parse(cached);
            setArticle(data);
            setLoading(false);
            return;
          }
        }

        // Fallback: fetch all news and find matching article by regenerating slug
        const baseUrl =
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
        const res = await fetch(`${baseUrl}/api/news?limit=100`);

        if (!res.ok) {
          setError("Failed to load article");
          return;
        }

        const data = await res.json();
        const articles = Array.isArray(data) ? data : data.items || data.articles || [];
        
        // Find article by matching slug
        const found = articles.find((article: ArticleData & { link: string }) => {
          const articleSlug = generateSlugFromArticle(article);
          return articleSlug === slug;
        });

        if (found) {
          setArticle(found);
          // Cache it for future use
          if (typeof window !== "undefined") {
            sessionStorage.setItem(`article_${slug}`, JSON.stringify(found));
          }
        } else {
          setError("Article not found");
        }
      } catch (err) {
        console.error("Error fetching article:", err);
        setError("Failed to load article");
      } finally {
        setLoading(false);
      }
    }

    fetchArticle();
  }, [slug]);

  const processedContent = useMemo(() => {
    if (!article?.content) return { html: "", hasLinks: false, links: [] as string[] };
    return processArticleContent(article.content);
  }, [article?.content]);

  const formattedDate = useMemo(() => {
    if (!article?.date) return { relative: "", full: "" };
    try {
      const date = parseISO(article.date);
      if (!isValid(date)) return { relative: article.date, full: article.date };

      let relative = formatDistanceToNow(date, { addSuffix: true });
      relative = relative.replace(/^about\s+/i, '');

      return {
        relative,
        full: format(date, "EEEE, MMMM d, yyyy 'at' h:mm a"),
      };
    } catch {
      return { relative: article.date, full: article.date };
    }
  }, [article?.date]);

  const readTime = useMemo(() => {
    if (!article) return 0;
    const words = (article.title + " " + article.content).split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  }, [article]);

  const hostname = useMemo(() => {
    if (!article?.link) return "News Source";
    try {
      return new URL(article.link).hostname.replace(/^www\./, "");
    } catch {
      return "News Source";
    }
  }, [article?.link]);

  const imageUrl = useMemo(() => {
    if (!article?.link) return "";
    return getImageForArticle(article.link, 0);
  }, [article?.link]);

  const isLongContent =
    (article?.content?.length || 0) > CONTENT_COLLAPSE_THRESHOLD;
  const shouldShowCollapsed = isLongContent && !isContentExpanded;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title,
          url: window.location.href,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleSummarize = async () => {
    if (!article) return;

    // Check if user is logged in
    if (!token) {
      toast.error("Please sign in", {
        description: "You need to be signed in to use AI features.",
      });
      return;
    }

    // Check if user has premium access
    if (quota?.tier === "free") {
      toast.error("Premium required", {
        description: "AI summarization is exclusively available to Premium subscribers.",
      });
      return;
    }

    // Check quota
    if (!canUse("tokens")) {
      toast.error("Token quota exceeded", {
        description: `You've used all your AI tokens. Your quota will reset in 12 hours.`,
      });
      return;
    }

    setIsSummarizing(true);

try {
  // Create a short visible message + hidden full content in [REASONING]
  const newsUrl = (typeof window !== "undefined" ? window.location.href : "");
  const visible = `Summarize this news: [${article.title}](${newsUrl})`;
  const hidden = `[REASONING]I want to summarize this news content from MarketView360 news page. Start by giving a oneliner idea about what the news is about. Then provide a summary that covers all the important points of the news.

Title: ${article.title}

Content: ${article.content}

Please provide a concise summary of this news article.[/REASONING]`;
  const combinedMessage = `${visible}\n\n${hidden}`;

  // Send message and create session
  const stream = aiApi.streamMessage({
    messages: [{ role: "user", content: combinedMessage }],
  });

  // Get the first chunk to extract session ID
  const firstChunk = await stream.next();

  if (firstChunk.done || !firstChunk.value.sessionId) {
    throw new Error("Failed to create AI session");
  }

  const sessionId = firstChunk.value.sessionId;

  // Navigate to AI page with the session
  router.push(`/ai?session=${sessionId}`);
} catch (error) {
  console.error("Failed to create AI summary:", error);
  toast.error("Failed to start AI summary", {
    description: "Please try again later.",
  });
} finally {
  setIsSummarizing(false);
}
  };

  if (loading) {
    return <ArticleDetailSkeleton />;
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 inline-flex mb-4">
            <AlertTriangle className="h-8 w-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            {error || "Article not found"}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            The article you&apos;re looking for might have been removed or
            doesn&apos;t exist.
          </p>
          <Button onClick={() => router.push("/news")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to News
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Navigation */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-4xl px-4 md:px-6 py-3 flex items-center justify-between">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-brand transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to News
          </Link>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
  size="sm"
  onClick={handleSummarize}
  disabled={isSummarizing}
  className={cn(
    "h-8 gap-2 transition-all duration-200",
    quota?.tier === "free"
      ? "bg-amber-50 hover:bg-amber-100 text-amber-900 border-2 border-amber-400 dark:bg-amber-900/30 dark:hover:bg-amber-800/40 dark:text-amber-200 dark:border-amber-600"
      : "!bg-slate-900 !text-white hover:!bg-slate-700 dark:!bg-brand dark:!text-white dark:hover:!bg-brand/90"
  )}
>
  <Sparkles className={cn("h-3.5 w-3.5", quota?.tier === "free" && "text-amber-600 dark:text-amber-400")} />
  {isSummarizing ? "Starting..." : "Summarize with Jovan AI"}
  {quota?.tier === "free" && (
    <span className="flex items-center gap-1 text-[9px] font-medium uppercase tracking-wide">
      <Crown className="h-3 w-3" />
      Premium
    </span>
  )}
</Button>
            <Button
              size="sm"
              onClick={() => showWarning(article.link)}
              className="h-8 gap-2 !bg-slate-900 !text-white hover:!bg-slate-700 dark:!bg-brand dark:!text-white dark:hover:!bg-brand/90"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Visit Source
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="h-8 gap-2"
            >
              <Share2 className="h-3.5 w-3.5" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Article Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div className="mx-auto max-w-4xl px-4 md:px-6 pt-8">
          {/* Source badge */}
          <Badge
            variant="outline"
            className="mb-4 text-xs bg-slate-50 dark:bg-slate-800"
          >
            {hostname}
          </Badge>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white leading-tight mb-6">
            {article.title}
          </h1>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <div
              className="flex items-center gap-1.5"
              title={formattedDate.full}
            >
              <Calendar className="h-4 w-4" />
              <span>{formattedDate.relative}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{readTime} min read</span>
            </div>
            {article.symbols && article.symbols.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Tag className="h-4 w-4" />
                <span>{article.symbols.slice(0, 5).join(", ")}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Featured Image */}
      <div className="mx-auto max-w-4xl px-4 md:px-6 -mt-4 relative z-10">
        <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg bg-slate-100 dark:bg-slate-800">
          {!imageError ? (
            <Image
              src={imageUrl}
              alt=""
              fill
              className="object-cover"
              onError={() => setImageError(true)}
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 mx-auto mb-2 flex items-center justify-center">
                  <Link2 className="h-8 w-8 text-slate-400" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ad Placement - Between featured image and article content */}
      <GoogleAdInline />

      {/* Article Content */}
      <article className="mx-auto max-w-4xl px-4 md:px-6 py-8">
        {/* Link warning banner */}
        {processedContent.hasLinks && (
          <div className="mb-6 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  External Links Detected
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  This article contains links to external websites. Click
                  carefully as they will take you outside MarketView360.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div
          className={cn(
            "article-content",
            shouldShowCollapsed && "max-h-[600px] overflow-hidden relative"
          )}
        >
          <div
            dangerouslySetInnerHTML={{ __html: processedContent.html }}
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (target.classList.contains("inline-link")) {
                e.preventDefault();
                const url = target.getAttribute("data-url");
                if (url) showWarning(url);
              }
            }}
          />

          {/* Gradient fade for collapsed content */}
          {shouldShowCollapsed && (
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 dark:from-slate-950 to-transparent pointer-events-none" />
          )}
        </div>

        {/* Expand/Collapse button for long content */}
        {isLongContent && (
          <div className="mt-6 flex justify-center">
            <Button
              variant="outline"
              onClick={() => setIsContentExpanded(!isContentExpanded)}
              className="gap-2"
            >
              {isContentExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Read Full Article
                </>
              )}
            </Button>
          </div>
        )}

        {/* Ticker badges */}
        {article.symbols && article.symbols.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Related Tickers
            </h3>
            <div className="flex flex-wrap gap-2">
              {article.symbols.map((symbol) => (
                <Link key={symbol} href={`/company/${symbol}`}>
                  <Badge
                    variant="secondary"
                    className="h-7 px-3 text-sm cursor-pointer hover:bg-brand/10 hover:text-brand transition-colors"
                  >
                    {symbol}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Ad Placement - After article content, before source attribution */}
        <GoogleAdSlot />

        {/* Source attribution */}
        <div className="mt-8 p-6 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                Original Source
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                {hostname}
              </p>
            </div>
            <Button
              onClick={() => showWarning(article.link)}
              className="gap-2 bg-slate-900 text-white hover:bg-slate-800 dark:bg-brand dark:text-white dark:hover:bg-brand/90"
            >
              <ExternalLink className="h-4 w-4" />
              Visit Source
            </Button>
          </div>
        </div>
      </article>

      {/* External Link Warning Dialog */}
      <ExternalLinkWarning
        open={warningState.open}
        onOpenChange={setWarningOpen}
        url={warningState.url}
        onConfirm={confirmNavigation}
      />

      {/* Scroll to Top FAB */}
      <ScrollToTopFab />

      {/* Enhanced Article Styles */}
      <style jsx global>{`
        /* Article Content Container */
        .article-content {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.8;
          color: rgb(51, 65, 85);
        }
        
        .dark .article-content {
          color: rgb(203, 213, 225);
        }

        /* Paragraphs */
        .article-paragraph {
          margin-bottom: 1.5rem;
          font-size: 1.0625rem;
          line-height: 1.8;
          text-align: justify;
        }

        /* Headings */
        .article-heading {
          font-size: 1.5rem;
          font-weight: 700;
          color: rgb(15, 23, 42);
          margin-top: 2.5rem;
          margin-bottom: 1.25rem;
          line-height: 1.4;
          letter-spacing: -0.01em;
        }
        
        .dark .article-heading {
          color: rgb(248, 250, 252);
        }

        /* Lists */
        .article-list {
          margin: 1.5rem 0;
          padding-left: 1.5rem;
          list-style-type: disc;
        }
        
        .article-list li {
          margin-bottom: 0.75rem;
          font-size: 1.0625rem;
          line-height: 1.7;
          padding-left: 0.5rem;
        }

        /* Inline Links */
        .inline-link {
          color: rgb(0, 135, 246);
          cursor: pointer;
          text-decoration: none;
          border-bottom: 1px solid rgb(0, 135, 246);
          transition: all 0.2s;
          padding: 0 2px;
        }
        
        .inline-link:hover {
          background-color: rgba(0, 135, 246, 0.1);
          border-bottom-color: transparent;
        }
        
        .dark .inline-link {
          color: rgb(96, 165, 250);
          border-bottom-color: rgb(96, 165, 250);
        }
        
        .dark .inline-link:hover {
          background-color: rgba(96, 165, 250, 0.1);
        }

        /* Quotes */
        .article-quote {
          color: rgb(71, 85, 105);
          font-style: italic;
          position: relative;
        }
        
        .dark .article-quote {
          color: rgb(148, 163, 184);
        }

        /* Emphasis */
        .article-emphasis {
          color: rgb(100, 116, 139);
          font-style: italic;
          font-weight: 500;
        }
        
        .dark .article-emphasis {
          color: rgb(148, 163, 184);
        }

        /* Ticker Symbols */
        .article-ticker {
          font-family: 'Monaco', 'Courier New', monospace;
          font-size: 0.9em;
          color: rgb(16, 185, 129);
          font-weight: 600;
          background-color: rgba(16, 185, 129, 0.1);
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
        }
        
        .dark .article-ticker {
          color: rgb(52, 211, 153);
          background-color: rgba(52, 211, 153, 0.1);
        }

        /* Numbers and Percentages */
        .article-number {
          color: rgb(59, 130, 246);
          font-weight: 600;
          font-variant-numeric: tabular-nums;
        }
        
        .dark .article-number {
          color: rgb(96, 165, 250);
        }

        /* First paragraph drop cap effect (optional) */
        .article-content > .article-paragraph:first-of-type::first-letter {
          font-size: 3.5rem;
          font-weight: 700;
          line-height: 1;
          float: left;
          margin-right: 0.5rem;
          margin-top: 0.125rem;
          color: rgb(15, 23, 42);
        }
        
        .dark .article-content > .article-paragraph:first-of-type::first-letter {
          color: rgb(248, 250, 252);
        }
      `}</style>
    </div>
  );
}