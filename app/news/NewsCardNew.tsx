"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow, format, isValid, parseISO } from "date-fns";
import { Clock, ExternalLink, Calendar, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getImageForArticle } from "./newsImages";

export interface Article {
  title: string;
  content: string;
  date: string;
  link: string;
  symbols?: string[];
  id?: string;
  slug?: string;
  [key: string]: unknown;
}

interface NewsCardProps {
  article: Article;
  index: number;
  onExternalLinkClick: (url: string) => void;
}

function cleanContent(content: string): string {
  let cleaned = content;
  
  // Remove paywall and premium content markers
  cleaned = cleaned
    .replace(/PREMIUM[\s\S]*$/i, "")
    .replace(/Upgrade to read[\s\S]*$/i, "")
    .replace(/Already have a subscription\?[\s\S]*$/i, "")
    .replace(/A Silver or Gold subscription[\s\S]*$/i, "")
    .replace(/Want the latest recommendations[\s\S]*$/i, "")
    .replace(/Click to get this free report[\s\S]*$/i, "")
    .replace(/ETF Research Reports?[\s\S]*$/gi, "")
    .replace(/繼續閱讀/g, "")
    .replace(/\(read:.*?\)/gi, "");
  
  // Remove common suffixes
  const patterns = [
    /View Comments?\.?$/i,
    /Read More\.?$/i,
    /Continue Reading\.?$/i,
    /Click here to read more\.?$/i,
    /\[…\]$/,
    /\.\.\.$/,
  ];
  
  patterns.forEach((pattern) => {
    cleaned = cleaned.replace(pattern, "").trim();
  });
  
  // Clean up excessive whitespace and newlines
  cleaned = cleaned
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, ' ')
    .trim();
  
  return cleaned;
}

function getReadTime(title: string, content: string): number {
  const words = (title + " " + content).split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function getHostname(link: string): string {
  try {
    const url = new URL(link);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return "News";
  }
}

function formatDate(dateStr: string): { relative: string; full: string } {
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) {
      return { relative: dateStr, full: dateStr };
    }
    
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      // Remove "about" prefix from relative time
      let relative = formatDistanceToNow(date, { addSuffix: true });
      relative = relative.replace(/^about\s+/i, '');
      return {
        relative,
        full: format(date, "MMM d, yyyy 'at' h:mm a"),
      };
    } else if (diffInHours < 168) {
      let relative = formatDistanceToNow(date, { addSuffix: true });
      relative = relative.replace(/^about\s+/i, '');
      return {
        relative,
        full: format(date, "EEEE, MMM d, yyyy 'at' h:mm a"),
      };
    } else {
      return {
        relative: format(date, "MMM d, yyyy"),
        full: format(date, "EEEE, MMM d, yyyy 'at' h:mm a"),
      };
    }
  } catch {
    return { relative: dateStr, full: dateStr };
  }
}

function generateSlug(article: Article): string {
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

export function NewsCard({ article, index, onExternalLinkClick }: NewsCardProps) {
  const { title, content, date, link, symbols = [] } = article;
  const [imageError, setImageError] = useState(false);

  const cleanedContent = useMemo(() => cleanContent(content), [content]);
  const readTime = useMemo(() => getReadTime(title, content), [title, content]);
  const hostname = useMemo(() => getHostname(link), [link]);
  const formattedDate = useMemo(() => formatDate(date), [date]);
  const imageUrl = useMemo(
    () => getImageForArticle(link, index),
    [link, index]
  );
  const slug = useMemo(() => generateSlug(article), [article]);

  const handleExternalClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onExternalLinkClick(link);
  };

  const handleCardClick = () => {
    // Store article data in sessionStorage for the detail page
    if (typeof window !== "undefined") {
      sessionStorage.setItem(`article_${slug}`, JSON.stringify(article));
    }
  };

  return (
    <article
      className={cn(
        "group relative flex flex-col h-full rounded-xl overflow-hidden",
        "border border-slate-200 dark:border-slate-800",
        "bg-white dark:bg-slate-900/80",
        "shadow-sm hover:shadow-lg",
        "transition-all duration-300 ease-out",
        "hover:border-brand/40 dark:hover:border-brand/40"
      )}
    >
      {/* Image Container */}
      <Link href={`/news/${slug}`} onClick={handleCardClick} className="block relative">
        <div className="relative aspect-[16/9] overflow-hidden bg-slate-100 dark:bg-slate-800">
          {!imageError ? (
            <Image
              src={imageUrl}
              alt=""
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImageError(true)}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
              <TrendingUp className="h-12 w-12 text-slate-300 dark:text-slate-600" />
            </div>
          )}
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Source badge */}
          <div className="absolute top-3 left-3">
            <Badge
              variant="secondary"
              className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-slate-700 dark:text-slate-300 text-[10px] font-medium px-2 py-0.5 shadow-sm"
            >
              {hostname}
            </Badge>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-grow p-4">
        {/* Meta info */}
        <div className="flex items-center gap-2 mb-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1" title={formattedDate.full}>
            <Calendar className="h-3 w-3" />
            <span>{formattedDate.relative}</span>
          </div>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{readTime} min read</span>
          </div>
        </div>

        {/* Title */}
        <Link href={`/news/${slug}`} onClick={handleCardClick} className="block group/title">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white line-clamp-2 mb-2 group-hover/title:text-brand transition-colors leading-snug">
            {title}
          </h3>
        </Link>

        {/* Preview content */}
        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 flex-grow leading-relaxed">
          {cleanedContent}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 mt-auto">
          {/* Ticker badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {symbols.slice(0, 3).map((symbol: string) => (
              <Badge
                key={symbol}
                variant="outline"
                className="text-[10px] font-medium h-5 px-1.5 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
              >
                {symbol}
              </Badge>
            ))}
            {symbols.length > 3 && (
              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                +{symbols.length - 3}
              </span>
            )}
          </div>

          {/* External link button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExternalClick}
            className="h-7 px-2 text-xs text-slate-500 hover:text-brand dark:text-slate-400 dark:hover:text-brand"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Source
          </Button>
        </div>
      </div>

      {/* Hover accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </article>
  );
}

export default NewsCard;
