"use client";

import { useMemo } from "react";
import { PiClock } from "react-icons/pi";
import { FiExternalLink } from "react-icons/fi";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function NewsCard({ article }: { article: any }) {
  const { title, content, date, link, symbols = [] } = article;

  const readTime = useMemo(() => {
    const words = (title + " " + content).split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  }, [title, content]);

  const hostname = useMemo(() => {
    try {
      return new URL(link).hostname.replace(/^www\./, "");
    } catch {
      return "News";
    }
  }, [link]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });

  return (
    <a
      href={link}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "group block rounded-xl border border-slate-200 dark:border-slate-800",
        "bg-white dark:bg-slate-900 p-4 shadow-sm hover:shadow-lg hover:border-brand",
        "transition-all duration-200 break-inside-avoid mb-4"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-3">
          {title}
        </h3>
        <FiExternalLink className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 mt-2">
        {content}
      </p>

      <div className="flex items-center flex-wrap gap-2 mt-3">
        {symbols.slice(0, 3).map((t: string) => (
          <Badge key={t} variant="secondary" className="text-[10px]">
            {t}
          </Badge>
        ))}
        <div className="ml-auto flex items-center gap-1.5 text-xs text-slate-500">
          <PiClock />
          <span>{readTime} min read</span>
          <span className="mx-1">•</span>
          <span>{hostname}</span>
          <span className="mx-1">•</span>
          <span>{formatDate(date)}</span>
        </div>
      </div>
    </a>
  );
}

export default NewsCard;