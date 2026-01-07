"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

function getScrollContainer(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  // RouteChrome wraps content in .app-scroll
  return document.querySelector(".app-scroll") as HTMLElement | null;
}

export function ScrollToTopFab() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const container = getScrollContainer() || window;

    const handleScroll = () => {
      const offset =
        container instanceof Window
          ? window.scrollY
          : (container as HTMLElement).scrollTop;
      setVisible(offset > 400);
    };

    if (container instanceof Window) {
      window.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll();
      return () => window.removeEventListener("scroll", handleScroll);
    }

    (container as HTMLElement).addEventListener("scroll", handleScroll, {
      passive: true,
    });
    handleScroll();

    return () => {
      (container as HTMLElement).removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    const container = getScrollContainer();
    if (container) {
      container.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <Button
        type="button"
        size="icon"
        onClick={scrollToTop}
        className="h-11 w-11 rounded-full shadow-lg bg-slate-900 text-white hover:bg-slate-800 dark:bg-brand dark:hover:bg-brand/90"
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-5 w-5" />
      </Button>
    </div>
  );
}
