"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Pin,
  PinOff,
  Edit3,
  Trash2,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface SessionSummary {
  id: string;
  title: string;
  created_at: string;
  pinned?: boolean;
  message_count?: number;
}

interface SessionGroup {
  label: string;
  sessions: SessionSummary[];
}

interface SessionSidebarProps {
  sessions: SessionSummary[];
  activeSessionId: string | null;
  loading: boolean;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  onRenameSession: (id: string, title: string) => void;
  onDeleteSession: (id: string) => void;
  onPinSession?: (id: string) => void;
}

/**
 * Group sessions by date
 */
function groupSessionsByDate(sessions: SessionSummary[]): SessionGroup[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const weekAgo = new Date(today.getTime() - 7 * 86400000);
  const monthAgo = new Date(today.getTime() - 30 * 86400000);

  const groups: Record<string, SessionSummary[]> = {
    pinned: [],
    today: [],
    yesterday: [],
    thisWeek: [],
    thisMonth: [],
    older: [],
  };

  for (const session of sessions) {
    if (session.pinned) {
      groups.pinned.push(session);
      continue;
    }

    const date = new Date(session.created_at);
    if (date >= today) {
      groups.today.push(session);
    } else if (date >= yesterday) {
      groups.yesterday.push(session);
    } else if (date >= weekAgo) {
      groups.thisWeek.push(session);
    } else if (date >= monthAgo) {
      groups.thisMonth.push(session);
    } else {
      groups.older.push(session);
    }
  }

  const result: SessionGroup[] = [];

  if (groups.pinned.length > 0) {
    result.push({ label: "Pinned", sessions: groups.pinned });
  }
  if (groups.today.length > 0) {
    result.push({ label: "Today", sessions: groups.today });
  }
  if (groups.yesterday.length > 0) {
    result.push({ label: "Yesterday", sessions: groups.yesterday });
  }
  if (groups.thisWeek.length > 0) {
    result.push({ label: "This Week", sessions: groups.thisWeek });
  }
  if (groups.thisMonth.length > 0) {
    result.push({ label: "This Month", sessions: groups.thisMonth });
  }
  if (groups.older.length > 0) {
    result.push({ label: "Older", sessions: groups.older });
  }

  return result;
}

export function SessionSidebar({
  sessions,
  activeSessionId,
  loading,
  onNewChat,
  onSelectSession,
  onRenameSession,
  onDeleteSession,
  onPinSession,
}: SessionSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set(),
  );

  // Filter sessions by search query
  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;
    const query = searchQuery.toLowerCase();
    return sessions.filter(
      (s) =>
        s.title?.toLowerCase().includes(query) ||
        s.id.toLowerCase().includes(query),
    );
  }, [sessions, searchQuery]);

  // Group filtered sessions by date
  const groupedSessions = useMemo(
    () => groupSessionsByDate(filteredSessions),
    [filteredSessions],
  );

  const toggleGroup = (label: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  return (
    <div className="flex h-full flex-col">
      {/* New Chat Button */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-700">
        <Button onClick={onNewChat} className="w-full gap-2" size="sm">
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-700">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-8 h-9 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-brand" />
          </div>
        ) : groupedSessions.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500">
            {searchQuery ? "No matching chats" : "No chats yet"}
          </div>
        ) : (
          <div className="space-y-4">
            {groupedSessions.map((group) => (
              <div key={group.label}>
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="flex w-full items-center gap-1 px-2 py-1 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                >
                  {collapsedGroups.has(group.label) ? (
                    <ChevronRight className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                  {group.label}
                  <span className="ml-auto text-slate-400">
                    {group.sessions.length}
                  </span>
                </button>

                {/* Group Sessions */}
                <AnimatePresence>
                  {!collapsedGroups.has(group.label) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-1 pt-1">
                        {group.sessions.map((session) => (
                          <SessionItem
                            key={session.id}
                            session={session}
                            active={session.id === activeSessionId}
                            onSelect={() => onSelectSession(session.id)}
                            onRename={(title) =>
                              onRenameSession(session.id, title)
                            }
                            onDelete={() => onDeleteSession(session.id)}
                            onPin={
                              onPinSession
                                ? () => onPinSession(session.id)
                                : undefined
                            }
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Session Count */}
      <div className="border-t border-slate-200 p-3 text-xs text-slate-500 dark:border-slate-700">
        {sessions.length} chat{sessions.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}

/* ---------- Session Item ---------- */
function SessionItem({
  session,
  active,
  onSelect,
  onRename,
  onDelete,
  onPin,
}: {
  session: SessionSummary;
  active: boolean;
  onSelect: () => void;
  onRename: (title: string) => void;
  onDelete: () => void;
  onPin?: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(session.title || "");

  return (
    <div
      className={cn(
        "group relative flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors",
        active
          ? "bg-brand/10 text-brand dark:bg-brand/20"
          : "hover:bg-slate-100 dark:hover:bg-slate-800",
      )}
      onClick={onSelect}
    >
      {/* Pin indicator */}
      {session.pinned && (
        <Pin className="h-3 w-3 shrink-0 text-amber-500" />
      )}

      {/* Icon */}
      {!session.pinned && (
        <MessageSquare className="h-4 w-4 shrink-0 text-slate-400" />
      )}

      {/* Content */}
      {editing ? (
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onBlur={() => {
            setEditing(false);
            if (title.trim()) onRename(title);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setEditing(false);
              if (title.trim()) onRename(title);
            }
            if (e.key === "Escape") {
              setEditing(false);
              setTitle(session.title || "");
            }
          }}
          className="flex-1 rounded border border-slate-300 bg-white px-2 py-0.5 text-sm dark:border-slate-600 dark:bg-slate-800"
        />
      ) : (
        <div className="flex-1 min-w-0">
          <div className="truncate font-medium">
            {session.title || "Untitled"}
          </div>
          {session.message_count !== undefined && session.message_count > 0 && (
            <div className="text-[10px] text-slate-400">
              {session.message_count} message
              {session.message_count !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        {onPin && (
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onPin();
            }}
            title={session.pinned ? "Unpin" : "Pin"}
          >
            {session.pinned ? (
              <PinOff className="h-3 w-3" />
            ) : (
              <Pin className="h-3 w-3" />
            )}
          </Button>
        )}
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6"
          onClick={(e) => {
            e.stopPropagation();
            setEditing(true);
          }}
          title="Rename"
        >
          <Edit3 className="h-3 w-3" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6 hover:text-red-500"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title="Delete"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
