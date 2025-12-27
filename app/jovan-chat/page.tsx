"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "sonner";

import {
  Menu,
  X,
  ChevronRight as ChevronRightIcon,
  Brain,
  Edit3,
  Trash2,
  Plus,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { MessageList } from "@/components/jovan/MessageList";
import { ChatInput } from "@/components/jovan/ChatInput";
import { Greeting } from "@/components/jovan/Greetings";
import { ModelSelector } from "@/components/jovan/ModelSelector";

import { SettingsPanel } from "@/components/jovan/SettingsPanel";
import { FullQuotaBar } from "@/components/jovan/QuotaBar";

import { useAuth } from "@/providers/AuthProvider";
import { useAIModels } from "@/hooks/useAIModels";
import { useQuota } from "@/hooks/useQuota";
import type { ChatMessage, SessionSummary } from "@/lib/utils/jovan/types";
import type { AIModel } from "@/lib/utils/jovan/models";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

function JovanChatSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand" />
    </div>
  );
}

function JovanChatPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, session: authSession, loading: authLoading } = useAuth();

  const urlSession = searchParams.get("session");
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(urlSession);
  const activeSessionId = currentSessionId;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const token = authSession?.access_token ?? null;

  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamingEnabled, setStreamingEnabled] = useState(true);
  const [reasoningEnabled, setReasoningEnabled] = useState(false);
  const [reasoningQuota, setReasoningQuota] = useState({
    used: 0,
    limit: 3,
    resetsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });

  // Model selection state
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [autoModelMode, setAutoModelMode] = useState(true);
  const { models, freeReasoningModels, loading: modelsLoading } = useAIModels(token);

  // Full quota management
  const { quota: fullQuota, refetch: refetchQuota, canUse } = useQuota(token);

  const canUseReasoning = fullQuota ? canUse("reasoning") : reasoningQuota.used < reasoningQuota.limit;

  const fetchSessions = async () => {
    if (!token) return;
    setLoadingSessions(true);
    try {
      const res = await fetch(`${API_BASE}/ai/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load sessions");
      const data = (await res.json()) as SessionSummary[];
      setSessions(data);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load sessions");
    } finally {
      setLoadingSessions(false);
    }
  };

  const fetchReasoningQuota = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/ai/reasoning-quota`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setReasoningQuota(data);
    } catch {
      // ignore quota fetch errors
    }
  };

  const loadSessionMessages = async (id: string) => {
    if (!token) return;
    setLoadingMsgs(true);
    try {
      const res = await fetch(`${API_BASE}/ai/sessions/${id}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load messages");
      const data = (await res.json()) as { role: string; content: string; created_at: string }[];
      setMessages(
        data.map((m, index) => ({
          id: `${id}-${index}`,
          role: m.role as "user" | "assistant",
          content: m.content,
          timestamp: m.created_at,
        }))
      );
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load messages");
    } finally {
      setLoadingMsgs(false);
    }
  };

  const handleSelectSession = (id: string) => {
    router.replace(`/jovan-chat?session=${id}`);
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput("");
    setCurrentSessionId(null);
    router.replace("/jovan-chat");
  };

  const handleRenameSession = async (id: string, title: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/ai/sessions/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Rename failed");
      setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, title } : s)));
      toast.success("Renamed");
    } catch (e: any) {
      toast.error(e?.message ?? "Rename failed");
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/ai/sessions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (urlSession === id) {
        router.push("/jovan-chat");
        setMessages([]);
      }
      toast.success("Deleted");
    } catch (e: any) {
      toast.error(e?.message ?? "Delete failed");
    }
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    const el = document.getElementById("messages-scroll");
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target?.tagName === "TEXTAREA") {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          void handleSend();
        }
        if (e.key === "Escape") {
          e.preventDefault();
          setInput("");
        }
        return;
      }
      if (e.key === "/") {
        e.preventDefault();
        document.getElementById("chat-input")?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Fetch sessions + quota when authenticated
  useEffect(() => {
    if (!authLoading && user && token) {
      void fetchSessions();
      void fetchReasoningQuota();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, token]);

  // Sync currentSessionId with URL when URL changes
  useEffect(() => {
    setCurrentSessionId(urlSession);
  }, [urlSession]);

  // Load messages when session changes
  useEffect(() => {
    if (!token || !currentSessionId) return;
    void loadSessionMessages(currentSessionId);
  }, [token, currentSessionId]);

  const handleSend = async (overrideText?: string, options?: { reasoning?: boolean }) => {
    const text = (overrideText ?? input).trim();
    if (!text || streaming || !user || !token) return;

    const useReasoning = options?.reasoning ?? reasoningEnabled;

    if (useReasoning && !canUseReasoning) {
      toast.error(`Reasoning limit reached: ${reasoningQuota.used}/${reasoningQuota.limit}`);
      return;
    }

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    const baseMessages = [...messages, userMsg];
    setMessages(baseMessages);
    if (!overrideText) {
      setInput("");
    }
    setStreaming(true);

    try {
      if (!streamingEnabled) {
        // Non-streaming request
        const assistantId = crypto.randomUUID();
        setMessages((prev) => [
          ...prev,
          {
            id: assistantId,
            role: "assistant",
            content: "",
            timestamp: new Date().toISOString(),
            isStreaming: true,
          },
        ]);

        const res = await fetch(`${API_BASE}/ai/chat-auth`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            messages: baseMessages.map((m) => ({ role: m.role, content: m.content })),
            sessionId: currentSessionId ?? undefined,
            reasoning: useReasoning,
          }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.details || body?.message || "Request failed");
        }

        const data = (await res.json()) as { reply?: string; sessionId?: string };
        const reply = data.reply ?? "";
        const newSessionId = data.sessionId ?? currentSessionId ?? undefined;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: reply, isStreaming: false }
              : m
          )
        );

        if (!currentSessionId && newSessionId) {
          setCurrentSessionId(newSessionId);
          router.replace(`/jovan-chat?session=${newSessionId}`);
          await fetchSessions();
        }

        if (useReasoning) {
          void fetchReasoningQuota();
        }
      } else {
        // Streaming request
        const streamRes = await fetch(`${API_BASE}/ai/chat-auth/stream`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            messages: baseMessages.map((m) => ({ role: m.role, content: m.content })),
            sessionId: currentSessionId,
            reasoning: useReasoning,
          }),
        });

        if (!streamRes.ok) {
          const body = await streamRes.json().catch(() => null);
          throw new Error(body?.message || "Stream failed");
        }

        const reader = streamRes.body!.getReader();
        const decoder = new TextDecoder();
        let assistantContent = "";
        let reasoningContent = "";
        const assistantId = crypto.randomUUID();

        setMessages((prev) => [
          ...prev,
          {
            id: assistantId,
            role: "assistant",
            content: "",
            timestamp: new Date().toISOString(),
            isStreaming: true,
            reasoning: "",
          },
        ]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const prefix = "REASONING:";

          if (chunk.startsWith(prefix)) {
            const newlineIndex = chunk.indexOf("\n");
            if (newlineIndex === -1) {
              // Entire chunk is reasoning text only
              reasoningContent += chunk.slice(prefix.length);
            } else {
              // Before newline: reasoning, after newline: assistant content
              reasoningContent += chunk.slice(prefix.length, newlineIndex);
              assistantContent += chunk.slice(newlineIndex + 1);
            }
          } else {
            // Normal assistant tokens (non-reasoning models or post-reasoning text)
            assistantContent += chunk;
          }

          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: assistantContent, reasoning: reasoningContent || m.reasoning }
                : m
            )
          );
        }

        reader.releaseLock();
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, isStreaming: false } : m))
        );

        const newSessionId = streamRes.headers.get("x-session-id");
        if (newSessionId && !currentSessionId) {
          setCurrentSessionId(newSessionId);
          router.replace(`/jovan-chat?session=${newSessionId}`);
          await fetchSessions();
        } else if (newSessionId && currentSessionId !== newSessionId) {
          setCurrentSessionId(newSessionId);
        }
        if (useReasoning) {
          void fetchReasoningQuota();
          void refetchQuota();
        }
      }
    } catch (e: any) {
      console.error("Jovan chat error", e);
      toast.error(e?.message ?? "Something went wrong. Please try again.");
    } finally {
      // Keep the thinking indicator visible for a short moment so it doesn't
      // flicker too quickly on very fast responses.
      setTimeout(() => setStreaming(false), 250);
      // Refetch quota after message
      void refetchQuota();
    }
  };

  const handleDeleteMessage = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const handleEditMessage = (id: string, newContent: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, content: newContent } : m)));
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <Card className="w-full max-w-md p-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Jovan AI</h1>
          <p className="mb-6 text-slate-600 dark:text-slate-400">
            Please log in to chat with Jovan
          </p>
          <Button onClick={() => router.push("/auth/login")} className="w-full">
            Log In
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Toaster position="bottom-right" />
      <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
        {/* Mobile overlay */}
        <AnimatePresence>
          {drawerOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setDrawerOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <motion.aside
          initial={{ x: -280 }}
          animate={{ x: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={cn(
            "fixed left-0 top-0 z-50 h-full w-72 border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900",
            "md:relative md:z-0 md:translate-x-0",
            drawerOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-brand" />
              <h2 className="font-semibold">Jovan AI</h2>
            </div>
            <Button size="sm" onClick={handleNewChat}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <FullQuotaBar
            quota={fullQuota ?? {
              standard: { used: 0, limit: 50, unlimited: false },
              reasoning: { used: reasoningQuota.used, limit: reasoningQuota.limit, unlimited: false },
              premium: { used: 0, limit: 5, unlimited: false },
              voice: { used: 0, limit: 10, unlimited: false },
              resetsAt: reasoningQuota.resetsAt,
              tier: "free",
            }}
            className="mb-4"
          />

          <div className="space-y-1">
            {loadingSessions ? (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-brand" />
                Loading sessions...
              </div>
            ) : (
              sessions.map((session) => (
                <SidebarItem
                  key={session.id}
                  session={session}
                  active={session.id === activeSessionId}
                  onSelect={() => handleSelectSession(session.id)}
                  onRename={(title) => handleRenameSession(session.id, title)}
                  onDelete={() => handleDeleteSession(session.id)}
                />
              ))
            )}
          </div>
        </motion.aside>

        {/* Main content */}
        <main className="flex flex-1 flex-col min-h-0 overflow-hidden">
          {/* Header */}
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setDrawerOpen(true)}
              >
                <Menu className="h-4 w-4" />
              </Button>
              <nav className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                <a href="/" className="hover:text-brand">Home</a>
                <ChevronRightIcon className="h-4 w-4" />
                <span className="text-slate-900 dark:text-slate-100 font-medium">Jovan Chat</span>
              </nav>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSettingsOpen(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </header>

          {/* Chat area */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="min-h-full flex items-center justify-center py-4">
                <Greeting
                  onExampleClick={(text) => {
                    setInput(text);
                    document.getElementById("chat-input")?.focus();
                  }}
                />
              </div>
            ) : (
              <MessageList
                messages={messages}
                onEditMessage={handleEditMessage}
                onDeleteMessage={handleDeleteMessage}
              />
            )}
          </div>

          {/* Mode & streaming controls */}
          <div className="border-t border-slate-200 bg-slate-100/80 px-4 py-2 text-xs dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {/* Model Selector */}
                <ModelSelector
                  models={models}
                  selectedModel={selectedModel}
                  onSelect={setSelectedModel}
                  autoMode={autoModelMode}
                  onAutoModeChange={setAutoModelMode}
                  disabled={streaming || modelsLoading}
                />

                {/* Reasoning toggle - only show if selected model supports it or in auto mode */}
                {(autoModelMode || selectedModel?.capabilities.includes("reasoning")) && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!canUseReasoning && !freeReasoningModels.length) return;
                      setReasoningEnabled((v) => !v);
                    }}
                    disabled={!canUseReasoning && !freeReasoningModels.length}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs",
                      reasoningEnabled
                        ? "border-purple-500/70 bg-purple-500/10 text-purple-600 dark:text-purple-400"
                        : "border-slate-300 bg-slate-50 text-slate-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300",
                      !canUseReasoning && !freeReasoningModels.length && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <Brain className="inline-block h-3 w-3 mr-1" />
                    Reasoning {reasoningEnabled ? "On" : "Off"}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-600 dark:text-slate-400">Streaming</span>
                <button
                  type="button"
                  onClick={() => setStreamingEnabled((v) => !v)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs",
                    streamingEnabled
                      ? "border-brand/70 bg-brand/10 text-brand"
                      : "border-slate-300 bg-slate-50 text-slate-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300"
                  )}
                >
                  {streamingEnabled ? "On" : "Off"}
                </button>
              </div>
            </div>
          </div>

          {/* Input */}
          <ChatInput
            input={input}
            setInput={setInput}
            onSend={() => {
              void handleSend();
            }}
            disabled={streaming}
            reasoningEnabled={reasoningEnabled}
            setReasoningEnabled={setReasoningEnabled}
            quota={reasoningQuota}
          />
        </main>

        {/* Settings drawer */}
        <AnimatePresence>
          {settingsOpen && (
            <motion.div
              className="fixed inset-0 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="absolute inset-0 bg-black/50" onClick={() => setSettingsOpen(false)} />
              <motion.div
                className="absolute right-0 top-0 h-full w-80 bg-white p-4 shadow-lg dark:bg-slate-900"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold">Settings</h3>
                  <Button size="icon" variant="ghost" onClick={() => setSettingsOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <SettingsPanel
                  reasoningEnabled={reasoningEnabled}
                  onReasoningChange={setReasoningEnabled}
                  quota={reasoningQuota}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

/* ---------- Component: Sidebar Item ---------- */
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

export default function JovanChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand" />
        </div>
      }
    >
      <JovanChatPageContent />
    </Suspense>
  );
}