"use client";

import { useMemo } from "react";
import { PiClock, PiArrowUpRight } from "react-icons/pi";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface Article {
  title?: string;
  content?: string;
  date?: string;
  link: string;
  symbols?: string[];
  [key: string]: any;
}

export function NewsCard({ article }: { article: Article }) {
  const { title, content, date, link, symbols = [] } = article;

  const readTime = useMemo(() => {
    const words = (title + " " + content).split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  }, [title, content]);

  const hostname = useMemo(() => {
    try {
      const url = new URL(link);
      return url.hostname.replace(/^www\./, "");
    } catch {
      return "News";
    }
  }, [link]);

  const formatDate = (d: string | undefined) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  };

  return (
    <a
      href={link}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "group flex flex-col h-full rounded-xl border border-slate-200 dark:border-slate-800",
        "bg-white dark:bg-slate-900/50 p-5 shadow-sm hover:shadow-md hover:border-brand/50",
        "transition-all duration-200 break-inside-avoid mb-4 relative overflow-hidden"
      )}
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-brand opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
           <Badge variant="outline" className="text-[10px] font-normal text-slate-500 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
            {hostname}
           </Badge>
           <span className="text-xs text-slate-400">•</span>
           <span className="text-xs text-slate-400">{formatDate(date)}</span>
        </div>
      </div>

      <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 mb-2 group-hover:text-brand transition-colors">
        {title}
      </h3>

      <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 mb-4 flex-grow">
        {content}
      </p>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 flex-wrap">
          {symbols.slice(0, 3).map((t: string) => (
            <Badge key={t} variant="secondary" className="text-[10px] font-medium h-5 px-1.5">
              {t}
            </Badge>
          ))}
        </div>
        
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <PiClock className="w-3.5 h-3.5" />
          <span>{readTime} min</span>
          <PiArrowUpRight className="w-3.5 h-3.5 ml-1 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
        </div>
      </div>
    </a>
  );
}

export default NewsCard;