"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/app/providers";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const nextTheme = theme === "dark" ? "light" : "dark";

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="inline-flex items-center justify-center p-2 rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
        <Sun className="w-4 h-4" />
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(nextTheme)}
      className="inline-flex items-center justify-center p-2 rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
      title={`Current theme: ${theme}. Click to switch`}
    >
      {theme === "dark" && <Moon className="w-4 h-4" />}
      {theme === "light" && <Sun className="w-4 h-4" />}
    </button>
  );
}
