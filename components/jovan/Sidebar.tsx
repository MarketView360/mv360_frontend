"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Brain, Edit3, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { QuotaBar } from "./QuotaBar";
import { cn } from "@/lib/utils";
import type { SessionSummary } from "@/lib/utils/jovan/types";

export function Sidebar({
  sessions,
  activeSessionId,
  onNewChat,
  onSelectSession,
  onRenameSession,
  onDeleteSession,
  reasoningQuota,
}: {
  sessions: SessionSummary[];
  activeSessionId: string | null;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  onRenameSession: (id: string, title: string) => void;
  onDeleteSession: (id: string) => void;
  reasoningQuota: { used: number; limit: number; resetsAt: string };
}) {
  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="flex h-full w-72 flex-col border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-brand" />
          <h2 className="font-semibold">Jovan AI</h2>
        </div>
        <Button size="sm" onClick={onNewChat}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <QuotaBar quota={reasoningQuota} className="mb-4" />

      <ScrollArea className="flex-1">
        <div className="space-y-1">
          {sessions.map((session) => (
            <SidebarItem
              key={session.id}
              session={session}
              active={session.id === activeSessionId}
              onSelect={() => onSelectSession(session.id)}
              onRename={(title) => onRenameSession(session.id, title)}
              onDelete={() => onDeleteSession(session.id)}
            />
          ))}
        </div>
      </ScrollArea>
    </motion.aside>
  );
}

function SidebarItem({
  session,
  active,
  onSelect,
  onRename,
  onDelete,
}: {
  session: SessionSummary;
  active: boolean;
  onSelect: () => void;
  onRename: (title: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(session.title || "");

  return (
    <div
      className={cn(
        "group flex cursor-pointer items-center justify-between rounded-lg px-2 py-2 text-sm transition-colors",
        active ? "bg-brand/10 text-brand dark:bg-brand/20" : "hover:bg-slate-100 dark:hover:bg-slate-800"
      )}
      onClick={onSelect}
    >
      {editing ? (
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => {
            setEditing(false);
            onRename(title);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setEditing(false);
              onRename(title);
            }
          }}
          className="w-full rounded border border-slate-200 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
      ) : (
        <div className="flex-1">
          <div className="line-clamp-1 font-medium">{session.title || "Untitled"}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {new Date(session.created_at).toLocaleDateString()}
          </div>
        </div>
      )}
      <div className="ml-2 flex items-center gap-1 opacity-0 group-hover:opacity-100">
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6"
          onClick={(e) => {
            e.stopPropagation();
            setEditing(true);
          }}
        >
          <Edit3 className="h-3 w-3" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}