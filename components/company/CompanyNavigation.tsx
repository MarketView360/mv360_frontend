"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  href: string;
}

interface CompanyNavigationProps {
  ticker: string;
  currentTab: string;
}

export function CompanyNavigation({ ticker, currentTab: initialTab }: CompanyNavigationProps) {
  const pathname = usePathname();
  const isMainPage = pathname === `/company/${ticker}`;
  const [activeTab, setActiveTab] = useState(initialTab);

  const tabs: Tab[] = [
    { id: "overview",   label: "Overview",   href: `/company/${ticker}` },
    { id: "financials", label: "Financials", href: `/company/${ticker}/financials` },
    { id: "technicals", label: "Technicals", href: `/company/${ticker}/technicals` },
    { id: "peers",      label: "Peers",      href: `/company/${ticker}/peers` },
    { id: "news",       label: "News",       href: `/company/${ticker}/news` },
  ];

  // Scroll-spy: listen for scroll to update active tab
  useEffect(() => {
    if (!isMainPage) return;

    const handleScroll = () => {
      const sections = tabs
        .filter(tab => ["overview", "peers", "news"].includes(tab.id))
        .map(tab => document.getElementById(tab.id))
        .filter(Boolean) as HTMLElement[];

      const scrollPosition = window.scrollY + 160;

      for (const section of sections) {
        if (
          scrollPosition >= section.offsetTop &&
          scrollPosition < section.offsetTop + section.offsetHeight
        ) {
          setActiveTab(section.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMainPage, tabs]);

  const handleTabClick = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;

    const isInternalSection = ["overview", "peers", "news"].includes(tab.id);

    if (isMainPage && isInternalSection) {
      const element = document.getElementById(tab.id);
      if (element) {
        const offset = 140;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
        setActiveTab(tab.id);
      }
    }
  };

  return (
    <div className="bg-background/80 backdrop-blur border-b border-border -mx-4 px-4 md:-mx-8 md:px-8 lg:-mx-12 lg:px-12">
      <div className="mx-auto max-w-[1600px]">
        <Tabs
          value={activeTab}
          onValueChange={(v) => handleTabClick(v)}
        >
          <TabsList className="h-auto bg-transparent gap-0 p-0 rounded-none">
            {tabs.map((tab) => {
              const isInternalSection = ["overview", "peers", "news"].includes(tab.id);
              const href = isMainPage && isInternalSection ? `#${tab.id}` : tab.href;
              const isActive = activeTab === tab.id;

              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  asChild
                  className={cn(
                    "relative rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm font-medium",
                    "text-muted-foreground hover:text-foreground transition-colors",
                    "data-[state=active]:border-b-primary data-[state=active]:text-foreground",
                    "data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  )}
                >
                  <Link
                    href={href}
                    onClick={(e) => {
                      if (isMainPage && isInternalSection) {
                        e.preventDefault();
                      }
                    }}
                  >
                    {tab.label}
                  </Link>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
