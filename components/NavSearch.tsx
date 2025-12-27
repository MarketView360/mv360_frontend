"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function NavSearch() {
  const router = useRouter();
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ticker = value.trim().toUpperCase();
    if (!ticker) return;
    router.push(`/company/${ticker}`);
  };

  return (
    <form onSubmit={handleSubmit} className="relative group">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500 group-focus-within:text-brand transition-colors" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={cn(
          "flex h-9 w-56 lg:w-64 rounded-full border border-slate-200 dark:border-slate-800",
          "bg-slate-50/50 dark:bg-slate-900/50 pl-9 pr-10 py-1 text-[13px] shadow-xs",
          "transition-all focus:w-64 lg:focus:w-72 focus:bg-white dark:focus:bg-slate-900",
          "focus:border-brand/50 focus:ring-4 focus:ring-brand/10 focus:outline-none",
          "placeholder:text-slate-400 dark:placeholder:text-slate-600 dark:text-slate-200"
        )}
        placeholder="Search ticker..."
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 pointer-events-none">
        <kbd className="h-5 px-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-[10px] font-medium text-slate-400 dark:text-slate-600 flex items-center justify-center">
          /
        </kbd>
      </div>
    </form>

  );
}
