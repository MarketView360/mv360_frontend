"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import { Plus, MessageSquare, History, PanelLeftClose, Settings, Zap, Trash2, Loader2, Pencil, MoreHorizontal, Check, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog-custom";
import Link from "next/link";
import type { SessionSummary } from "@/lib/utils/jovan/types";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  sessions?: SessionSummary[];
  activeSessionId?: string | null;
  loadingSessions?: boolean;
  onSelectSession?: (id: string) => void;
  onNewChat?: () => void;
  onDeleteSession?: (id: string) => Promise<boolean>;
  onRenameSession?: (id: string, title: string) => Promise<boolean>;
  className?: string;
}

function groupSessionsByDate(sessions: SessionSummary[]): Record<string, SessionSummary[]> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const groups: Record<string, SessionSummary[]> = {
    "Today": [],
    "Yesterday": [],
    "Previous 7 Days": [],
    "Older": [],
  };

  for (const session of sessions) {
    const sessionDate = new Date(session.created_at);
    const sessionDay = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate());

    if (sessionDay.getTime() === today.getTime()) {
      groups["Today"].push(session);
    } else if (sessionDay.getTime() === yesterday.getTime()) {
      groups["Yesterday"].push(session);
    } else if (sessionDay.getTime() >= lastWeek.getTime()) {
      groups["Previous 7 Days"].push(session);
    } else {
      groups["Older"].push(session);
    }
  }

  return groups;
}

export function Sidebar({ 
  isOpen, 
  setIsOpen, 
  sessions = [],
  activeSessionId,
  loadingSessions = false,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  className 
}: SidebarProps) {
  const groupedSessions = useMemo(() => groupSessionsByDate(sessions), [sessions]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const handleStartRename = (session: SessionSummary) => {
    setEditingId(session.id);
    setEditTitle(session.title || "");
  };

  const handleSaveRename = async () => {
    if (editingId && editTitle.trim() && onRenameSession) {
      await onRenameSession(editingId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle("");
  };

  const handleCancelRename = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveRename();
    } else if (e.key === "Escape") {
      handleCancelRename();
    }
  };

  const handleDeleteClick = (sessionId: string) => {
    setDeletingId(sessionId);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId || !onDeleteSession) return;
    
    setIsDeleting(true);
    try {
      await onDeleteSession(deletingId);
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  const handleCancelDelete = () => {
    setDeletingId(null);
  };

  const getSessionTitle = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    return session?.title || "Untitled";
  };
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
          "fixed inset-y-0 left-0 md:relative md:inset-auto z-40 h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out flex flex-col",
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
                <Button 
                    className="w-full justify-start gap-2 min-w-[248px]" 
                    variant="outline"
                    onClick={onNewChat}
                >
                    <Plus className="w-4 h-4" />
                    New Chat
                </Button>
            </div>

            {/* History List */}
            <div className="flex-1 overflow-hidden px-2">
                <ScrollArea className="h-full">
                    <div className="space-y-4 min-w-[248px] px-2 py-2">
                        {loadingSessions ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                            </div>
                        ) : sessions.length === 0 ? (
                            <div className="text-center py-8 text-sm text-slate-400">
                                No conversations yet
                            </div>
                        ) : (
                            Object.entries(groupedSessions).map(([dateGroup, groupSessions]) => {
                                if (groupSessions.length === 0) return null;
                                
                                return (
                                    <div key={dateGroup} className="space-y-1">
                                        <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 px-2 py-1 uppercase tracking-wider">
                                            {dateGroup}
                                        </h3>
                                        {groupSessions.map((session) => (
                                            <div key={session.id} className="group relative">
                                                {editingId === session.id ? (
                                                  <div className="flex items-center gap-1 px-2 h-8">
                                                    <input
                                                      ref={inputRef}
                                                      type="text"
                                                      value={editTitle}
                                                      onChange={(e) => setEditTitle(e.target.value)}
                                                      onKeyDown={handleKeyDown}
                                                      onBlur={handleSaveRename}
                                                      className="flex-1 text-sm bg-transparent border-b border-indigo-500 focus:outline-none text-slate-900 dark:text-white"
                                                      maxLength={100}
                                                    />
                                                    <Button
                                                      variant="ghost"
                                                      size="icon"
                                                      className="h-5 w-5 text-green-500"
                                                      onClick={handleSaveRename}
                                                    >
                                                      <Check className="w-3 h-3" />
                                                    </Button>
                                                    <Button
                                                      variant="ghost"
                                                      size="icon"
                                                      className="h-5 w-5 text-slate-400"
                                                      onClick={handleCancelRename}
                                                    >
                                                      <X className="w-3 h-3" />
                                                    </Button>
                                                  </div>
                                                ) : (
                                                  <>
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => onSelectSession?.(session.id)}
                                                        className={cn(
                                                            "w-full justify-start text-sm font-normal px-2 h-8 truncate pr-8",
                                                            activeSessionId === session.id
                                                                ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                                                                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                                                        )}
                                                    >
                                                        {dateGroup === "Today" ? (
                                                            <MessageSquare className="w-4 h-4 mr-2 shrink-0 opacity-70" />
                                                        ) : (
                                                            <History className="w-4 h-4 mr-2 shrink-0 opacity-70" />
                                                        )}
                                                        <span className="truncate">{session.title || "Untitled"}</span>
                                                    </Button>
                                                    <DropdownMenu>
                                                      <DropdownMenuTrigger asChild>
                                                        <Button
                                                          variant="ghost"
                                                          size="icon"
                                                          className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 opacity-100 focus:opacity-100 focus-visible:opacity-100 transition-opacity text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                                          onPointerDown={(e) => e.stopPropagation()}
                                                        >
                                                          <MoreHorizontal className="w-3 h-3" />
                                                        </Button>
                                                      </DropdownMenuTrigger>
                                                      <DropdownMenuContent align="end" className="w-32 z-[100]">
                                                        <DropdownMenuItem 
                                                          onClick={() => handleStartRename(session)}
                                                          className="cursor-pointer"
                                                        >
                                                          <Pencil className="w-3 h-3 mr-2" />
                                                          Rename
                                                        </DropdownMenuItem>
                                                        {onDeleteSession && (
                                                          <DropdownMenuItem 
                                                            onClick={() => handleDeleteClick(session.id)}
                                                            className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30 cursor-pointer"
                                                          >
                                                            <Trash2 className="w-3 h-3 mr-2" />
                                                            Delete
                                                          </DropdownMenuItem>
                                                        )}
                                                      </DropdownMenuContent>
                                                    </DropdownMenu>
                                                  </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                );
                            })
                        )}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && handleCancelDelete()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Delete Conversation
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{getSessionTitle(deletingId || '')}&rdquo;? This action cannot be undone and all messages in this conversation will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
