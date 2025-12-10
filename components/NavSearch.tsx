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
    <form onSubmit={handleSubmit} className="relative w-full max-w-sm">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-600" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={cn(
          "flex h-9 w-64 lg:w-80 rounded-full border border-slate-200 dark:border-slate-700",
          "bg-slate-50 dark:bg-slate-900 px-8 pl-8 py-1 text-sm shadow-sm",
          "transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
          "dark:focus-visible:ring-offset-slate-950 placeholder:text-slate-400 dark:placeholder:text-slate-500",
          "dark:text-white"
        )}
        placeholder="Search ticker..."
      />
    </form>
  );
}
