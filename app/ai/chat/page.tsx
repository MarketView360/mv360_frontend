"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Edit3,
  Trash2,
  Command,
  ChevronRight,
  ChevronRight as ChevronRightIcon,
  Brain,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast, Toaster } from "sonner";

/* ---------- types ---------- */
type ChatMessage = { role: "user" | "assistant"; content: string; id: string; reasoning?: string };
type SessionSummary = { id: string; title: string | null; created_at: string };

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

/* ---------- main ---------- */
function JovanChatPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, session: authSession, loading: authLoading } = useAuth();

  /* URL state */
  const urlSession = searchParams.get("session");

  /* local state */
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamingEnabled, setStreamingEnabled] = useState(true);
  const [reasoningEnabled, setReasoningEnabled] = useState(false);
  const [reasoningQuota, setReasoningQuota] = useState<{
    used: number;
    limit: number;
    resetsAt: string;
  }>({
    used: 0,
    limit: 3,
    resetsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const token = authSession?.access_token;

  /* scroll to bottom on new message */
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  /* keyboard shortcuts */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement) {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          void handleSend();
        }
        if (e.key === "Escape") {
          e.preventDefault();
          setEditingId(null);
        }
        return;
      }
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        textareaRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* fetch sessions + quota on mount */
  useEffect(() => {
    if (!authLoading && user && token) {
      void fetchSessions();
      void fetchReasoningQuota();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, token]);

  /* load messages when URL session changes */
  useEffect(() => {
    if (!token || !urlSession) return;
    void loadSessionMessages(urlSession);
  }, [token, urlSession]);

  /* ---------- data ---------- */
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
      toast.error(e.message);
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
      /* ignore */
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
      const data = (await res.json()) as { role: string; content: string; id: string; reasoning?: string }[];
      setMessages(data.map((m) => ({ ...m, role: m.role as "user" | "assistant" })));
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoadingMsgs(false);
    }
  };

  const handleDeleteMessage = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const handleEditMessage = (id: string, newContent: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, content: newContent } : m)));
    setEditingId(null);
  };

  const handleRenameSession = async (id: string, title: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/ai/sessions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Rename failed");
      setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, title } : s)));
      toast.success("Renamed");
    } catch (e: any) {
      toast.error(e.message);
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
      if (urlSession === id) router.replace("/ai/chat");
      toast.success("Deleted");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === urlSession),
    [sessions, urlSession]
  );

  /* ---------- send ---------- */
  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || sending || !token) return;

    /* check reasoning quota if enabled */
    if (reasoningEnabled && reasoningQuota.used >= reasoningQuota.limit) {
      toast.error("Daily reasoning limit reached (3). Resets at 00:00 UTC.");
      return;
    }

    const userMsg: ChatMessage = { role: "user", content: trimmed, id: crypto.randomUUID() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setSending(true);
    setError(null);
    try {
      if (!streamingEnabled) {
        // Non-streaming: use standard chat-auth endpoint
        const res = await fetch(`${API_BASE}/ai/chat-auth`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
            sessionId: urlSession ?? undefined,
            reasoning: reasoningEnabled,
          }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.details || body?.message || "Request failed");
        }

        const data = (await res.json()) as { reply?: string; sessionId?: string };
        const reply = data.reply ?? "";
        const newSession = data.sessionId ?? urlSession ?? undefined;

        if (reply) {
          setMessages((prev) => [...prev, { role: "assistant", content: reply, id: crypto.randomUUID() }]);
        }

        if (!urlSession && newSession) {
          router.replace(`/ai/chat?session=${newSession}`);
          void fetchSessions();
        }

        if (reasoningEnabled) void fetchReasoningQuota();
      } else {
        // Streaming reply via chat-auth/stream
        const ctrl = new AbortController();
        const streamRes = await fetch(`${API_BASE}/ai/chat-auth/stream`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
            sessionId: urlSession ?? undefined,
            reasoning: reasoningEnabled,
          }),
          signal: ctrl.signal,
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
        setStreaming(true);
        setMessages((prev) => [...prev, { role: "assistant", content: "", id: assistantId, reasoning: "" }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          /* simple protocol: first line is reasoning, rest is reply */
          const [reasoningLine, ...replyLines] = chunk.split("\n");
          if (reasoningLine.startsWith("REASONING:")) {
            reasoningContent += reasoningLine.replace("REASONING:", "");
          }
          assistantContent += replyLines.join("\n");
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: assistantContent, reasoning: reasoningContent } : m
            )
          );
        }

        reader.releaseLock();
        const newSession = streamRes.headers.get("x-session-id");
        if (newSession && !urlSession) {
          router.replace(`/ai/chat?session=${newSession}`);
          void fetchSessions();
        }
        if (reasoningEnabled) void fetchReasoningQuota();
      }
    } catch (e: any) {
      console.error("Jovan chat error", e);
      toast.error(e.message || "Something went wrong. Please try again.");
    } finally {
      setStreaming(false);
      setSending(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <>
      <Toaster position="bottom-right" />
      <div className="flex min-h-[75vh] flex-col px-3 py-4 sm:px-4 sm:py-6">
        {/* Breadcrumbs */}
        <div className="mx-auto mb-3 flex w-full max-w-5xl items-baseline justify-between gap-2 px-1 text-sm text-slate-500 dark:text-slate-400">
          <nav className="flex items-center gap-1">
            <a href="/" className="hover:text-brand transition-colors">Home</a>
            <ChevronRightIcon className="h-4 w-4" />
            <span className="text-slate-900 dark:text-slate-100 font-medium">Jovan Chat</span>
          </nav>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                const title = prompt("New title", activeSession?.title || "");
                if (title) void handleRenameSession(urlSession!, title);
              }}
              title="Rename session"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                if (confirm("Delete this session?")) void handleDeleteSession(urlSession!);
              }}
              title="Delete session"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mx-auto grid w-full max-w-5xl flex-1 gap-4 md:grid-cols-[280px,1fr]">
          {/* Sidebar */}
          <aside className="hidden md:flex flex-col gap-3 rounded-xl border border-slate-200 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold">Chat History</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Your saved conversations</p>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setMessages([]);
                  setInput("");
                  setEditingId(null);
                  router.replace("/ai/chat");
                }}
              >
                New chat
              </Button>
            </div>
            <div className="flex-1 space-y-1 overflow-y-auto pr-2">
              <div className="space-y-1">
                {sessions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => router.replace(`/ai/chat?session=${s.id}`)}
                    className={cn(
                      "flex w-full flex-col items-start rounded-md px-2 py-1.5 text-left text-xs transition-colors",
                      urlSession === s.id
                        ? "bg-brand/10 text-brand dark:bg-brand/20"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                  >
                    <span className="line-clamp-1 font-medium">{s.title || "Untitled"}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {new Date(s.created_at).toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Mobile drawer */}
          <div className="md:hidden">
            <button
              onClick={() => setDrawerOpen((o) => !o)}
              className="mb-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900/80"
            >
              <ChevronRight className={cn("h-4 w-4", drawerOpen && "rotate-90")} />
              History
            </button>
            <AnimatePresence>
              {drawerOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white/80 p-3 dark:border-slate-800 dark:bg-slate-900/80"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold">History</h2>
                    <Button size="icon" variant="ghost" onClick={() => setDrawerOpen(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-2 h-[40vh] overflow-y-auto">
                    <div className="space-y-1 pr-2">
                      {sessions.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            router.replace(`/ai/chat?session=${s.id}`);
                            setDrawerOpen(false);
                          }}
                          className={cn(
                            "flex w-full flex-col items-start rounded-md px-2 py-1.5 text-left text-xs",
                            urlSession === s.id
                              ? "bg-brand/10 text-brand dark:bg-brand/20"
                              : "hover:bg-slate-100 dark:hover:bg-slate-800"
                          )}
                        >
                          <span className="line-clamp-1 font-medium">{s.title || "Untitled"}</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            {new Date(s.created_at).toLocaleString()}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Chat panel */}
          <section className="flex min-h-[60vh] flex-col rounded-xl border border-slate-200 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-900/80">
            {/* Header */}
            <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-2 dark:border-slate-800">
              <div>
                <h2 className="text-base font-semibold">Jovan · MarketView360 AI</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {activeSession ? activeSession.title || "Untitled" : "New chat"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const title = prompt("New title", activeSession?.title || "");
                    if (title) void handleRenameSession(urlSession!, title);
                  }}
                  title="Rename session"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (confirm("Delete this session?")) void handleDeleteSession(urlSession!);
                  }}
                  title="Delete session"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto pr-2" ref={scrollRef}>
              <div className="space-y-3 text-sm">
                {messages.length === 0 && !loadingMsgs && !sending && (
                  <Greeting onExampleClick={(text) => setInput(text)} />
                )}
                <AnimatePresence>
                  {messages.map((msg) => (
                    <MessageItem
                      key={msg.id}
                      msg={msg}
                      editing={editingId === msg.id}
                      onEdit={(txt) => handleEditMessage(msg.id, txt)}
                      onDelete={() => handleDeleteMessage(msg.id)}
                      onStartEdit={() => {
                        setEditingId(msg.id);
                        setEditText(msg.content);
                      }}
                      onCancelEdit={() => setEditingId(null)}
                      editText={editText}
                      setEditText={setEditText}
                    />
                  ))}
                </AnimatePresence>
                {streaming && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl bg-slate-100/95 dark:bg-slate-800/95 px-3 py-2 text-xs text-slate-500 dark:text-slate-400">Jovan is typing…</div>
                  </div>
                )}
              </div>
            </div>

            {/* Input */}
            <div className="mt-3 border-t border-slate-200 pt-2 dark:border-slate-800">
              {/* Quota bar */}
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-100/80 px-3 py-2 text-xs dark:bg-slate-800/80">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-brand" />
                  <span>Reasoning quota</span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {reasoningQuota.used} / {reasoningQuota.limit}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    • Resets {new Date(reasoningQuota.resetsAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStreamingEnabled((v) => !v)}
                    className={cn(
                      "rounded-full border px-2 py-1",
                      streamingEnabled
                        ? "border-brand/70 bg-brand/10 text-brand"
                        : "border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300",
                    )}
                  >
                    Streaming: {streamingEnabled ? "On" : "Off"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setReasoningEnabled((v) => !v)}
                    className={cn(
                      "rounded-full border px-2 py-1",
                      reasoningEnabled
                        ? "border-brand/70 bg-brand/10 text-brand"
                        : "border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300",
                    )}
                  >
                    Reasoning: {reasoningEnabled ? "On" : "Off"}
                  </button>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleSend();
                }}
                className="flex items-end gap-2"
              >
                <textarea
                  ref={textareaRef}
                  rows={2}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void handleSend();
                    }
                  }}
                  placeholder="Ask Jovan about a ratio, screen, or company…"
                  className="flex-1 resize-none rounded-lg border border-slate-200/80 bg-white/95 px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-brand dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="rounded-full bg-brand text-white hover:bg-brand-dark"
                  disabled={sending || !input.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                Jovan answers are for educational purposes only, not investment advice.
              </p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

/* ---------- components ---------- */
function Greeting({ onExampleClick }: { onExampleClick: (text: string) => void }) {
  const examples = [
    "What is the Rule of 40 for SaaS companies?",
    "Explain ROIC and why it matters.",
    "Compare AAPL and MSFT using key metrics.",
  ];
  return (
    <div className="flex flex-col items-center justify-center gap-4 text-center text-slate-500 dark:text-slate-400">
      <div className="rounded-full bg-brand/10 p-3">
        <Command className="h-6 w-6 text-brand" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">How can I help you today?</h3>
      <p className="text-xs">Ask about metrics, screens, or companies.</p>
      <div className="flex flex-wrap justify-center gap-2">
        {examples.map((e) => (
          <button
            key={e}
            onClick={() => onExampleClick(e)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageItem({
  msg,
  editing,
  onEdit,
  onDelete,
  onStartEdit,
  onCancelEdit,
  editText,
  setEditText,
}: {
  msg: ChatMessage;
  editing: boolean;
  onEdit: (txt: string) => void;
  onDelete: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  editText: string;
  setEditText: (t: string) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "relative max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm",
          msg.role === "user"
            ? "bg-brand text-white"
            : "bg-slate-100/95 dark:bg-slate-800/95 text-slate-900 dark:text-slate-50"
        )}
      >
        {editing ? (
          <div className="flex flex-col gap-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="resize-none rounded-md border border-slate-200 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900"
              rows={3}
            />
            <div className="flex items-center gap-2">
              <Button size="xs" onClick={() => onEdit(editText)}>
                Save
              </Button>
              <Button size="xs" variant="ghost" onClick={onCancelEdit}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* reasoning bubble */}
            {msg.reasoning && (
              <details className="mb-2 cursor-pointer rounded-md border border-slate-200 bg-white/60 p-2 text-xs dark:border-slate-700 dark:bg-slate-800/60">
                <summary className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                  <Brain className="h-3 w-3" /> Thought process
                </summary>
                <div className="mt-1 text-slate-700 dark:text-slate-300">{msg.reasoning}</div>
              </details>
            )}
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="ml-4 list-disc space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="ml-4 list-decimal space-y-1">{children}</ol>,
                li: ({ children }) => <li>{children}</li>,
                code: ({ children }) => (
                  <code className="rounded bg-slate-200 px-1 py-0.5 text-xs dark:bg-slate-700">
                    {children}
                  </code>
                ),
                a: ({ children, href }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-2 text-brand hover:text-brand-dark"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {msg.content}
            </ReactMarkdown>
            <div className="mt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={onStartEdit} title="Edit">
                <Edit3 className="h-3 w-3" />
              </button>
              <button onClick={onDelete} title="Delete">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

/* ---------- page export with Suspense ---------- */
export default function JovanChatPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand" /></div>}>
      <JovanChatPageContent />
    </Suspense>
  );
}