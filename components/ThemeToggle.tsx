"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/app/providers";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <TooltipProvider delayDuration={400}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
          >
            <Sun
              size={18}
              strokeWidth={1.75}
              aria-hidden="true"
              className="rotate-0 scale-100 transition-all duration-200 dark:-rotate-90 dark:scale-0"
            />
            <Moon
              size={18}
              strokeWidth={1.75}
              aria-hidden="true"
              className="absolute rotate-90 scale-0 transition-all duration-200 dark:rotate-0 dark:scale-100"
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{isDark ? "Light mode" : "Dark mode"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
