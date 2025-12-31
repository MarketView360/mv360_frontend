"use client";

import React from "react";
import { Plus, MessageSquare, History, PanelLeftClose, Settings, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  className?: string;
}

const MOCK_HISTORY = [
  { id: 1, title: "Market Trends Analysis", date: "Today" },
  { id: 2, title: "Tesla Q3 Earnings", date: "Today" },
  { id: 3, title: "Crypto Portfolio Strategy", date: "Yesterday" },
  { id: 4, title: "Dividend Stock Screener", date: "Previous 7 Days" },
  { id: 5, title: "Macroeconomic Outlook", date: "Previous 7 Days" },
];

export function Sidebar({ isOpen, setIsOpen, className }: SidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 md:relative md:inset-auto z-70 h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out flex flex-col",
          isOpen ? "w-[280px] translate-x-0" : "w-0 -translate-x-full md:w-0 md:translate-x-0 md:border-none overflow-hidden",
          className
        )}
      >
        <div className="flex flex-col h-full">
            <div className="p-4 pb-2 flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-center justify-between min-w-[248px]">
                    <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                            J
                        </div>
                        <span>Jovan AI</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <PanelLeftClose className="w-5 h-5" />
                    </Button>
                </div>

                {/* New Chat Button */}
                <Button className="w-full justify-start gap-2 min-w-[248px]" variant="outline">
                    <Plus className="w-4 h-4" />
                    New Chat
                </Button>
            </div>

            {/* History List */}
            <div className="flex-1 overflow-hidden px-2">
                <ScrollArea className="h-full">
                    <div className="space-y-4 min-w-[248px] px-2 py-2">
                        <div className="space-y-1">
                            <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 px-2 py-1 uppercase tracking-wider">
                                Today
                            </h3>
                            {MOCK_HISTORY.slice(0, 2).map((item) => (
                                <Button
                                    key={item.id}
                                    variant="ghost"
                                    className="w-full justify-start text-sm font-normal text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-2 h-8 truncate"
                                >
                                    <MessageSquare className="w-4 h-4 mr-2 shrink-0 opacity-70" />
                                    <span className="truncate">{item.title}</span>
                                </Button>
                            ))}
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 px-2 py-1 uppercase tracking-wider">
                                Previous 7 Days
                            </h3>
                            {MOCK_HISTORY.slice(2).map((item) => (
                                <Button
                                    key={item.id}
                                    variant="ghost"
                                    className="w-full justify-start text-sm font-normal text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-2 h-8 truncate"
                                >
                                    <History className="w-4 h-4 mr-2 shrink-0 opacity-70" />
                                    <span className="truncate">{item.title}</span>
                                </Button>
                            ))}
                        </div>
                    </div>
                </ScrollArea>
            </div>

            {/* Bottom Actions */}
            <div className="mt-auto p-4 border-t border-slate-200 dark:border-slate-800 min-w-[248px] space-y-1">
                 <Link href="/pricing" passHref>
                    <Button variant="ghost" className="w-full justify-start text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 gap-2">
                        <Zap className="w-4 h-4" />
                        Upgrade Plan
                    </Button>
                </Link>
                <Link href="/settings" passHref>
                    <Button variant="ghost" className="w-full justify-start text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 gap-2">
                        <Settings className="w-4 h-4" />
                        Settings
                    </Button>
                </Link>
            </div>
        </div>
      </aside>
    </>
  );
}
