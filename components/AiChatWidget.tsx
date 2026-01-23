"use client";

import { useState, type ReactNode } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";
const AI_ENABLED = process.env.NEXT_PUBLIC_AI_ENABLED === "true";

export function AiChatWidget() {
  // Don't render the widget if AI is disabled
  if (!AI_ENABLED) {
    return null;
  }

  return <AiChatWidgetInner />;
}

function AiChatWidgetInner() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading || quotaExceeded) return;

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);

        if (response.status === 429 || response.status === 403) {
          setQuotaExceeded(true);
          const msg =
            body?.details ||
            body?.message ||
            "You have reached the free Jovan limit. Please log in or sign up to continue.";
          setError(msg);
          return;
        }

        throw new Error(body?.details || body?.message || "Request failed");
      }

      const data = (await response.json()) as { reply?: string };
      const reply = data.reply ?? "";
      if (reply) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: reply },
        ]);
      }
    } catch (e: unknown) {
      console.error("AI chat error", e);
      const message =
        typeof e === "object" && e !== null && "message" in e
          ? String((e as { message?: string }).message)
          : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderMessageContent = (content: string) => {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
          strong: ({ children }: { children?: ReactNode }) => <strong>{children}</strong>,
          em: ({ children }: { children?: ReactNode }) => <em>{children}</em>,
          u: ({ children }: { children?: ReactNode }) => (
            <span className="underline underline-offset-2">{children}</span>
          ),
          a: ({ children, href }: { children?: ReactNode; href?: string }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 text-brand hover:text-brand-dark"
            >
              {children}
            </a>
          ),
          ul: ({ children }: { children?: ReactNode }) => (
            <ul className="mt-1 list-disc space-y-1 pl-4 text-xs sm:text-sm">
              {children}
            </ul>
          ),
          ol: ({ children }: { children?: ReactNode }) => (
            <ol className="mt-1 list-decimal space-y-1 pl-4 text-xs sm:text-sm">
              {children}
            </ol>
          ),
          li: ({ children }: { children?: ReactNode }) => <li>{children}</li>,
          br: () => <br />,
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  return (
    <>
      {/* Floating Action Button and Chat Panel */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 md:bottom-6 md:right-6">
        {open && (
          <Card className="w-[340px] sm:w-[380px] shadow-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md supports-backdrop-filter:bg-white/85 dark:supports-backdrop-filter:bg-slate-900/85 flex flex-col max-h-[70vh]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/80">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  Jovan · MarketView360 AI
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Ask Jovan about metrics, screens, or how to use MarketView360.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-200/80 dark:text-slate-400 dark:hover:text-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-sm">
              {messages.length === 0 && !loading && !error && (
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  This assistant can help explain financial ratios, metrics, and how
                  to interpret the data in Marketview360. Try asking about a
                  specific screen or company metric.
                </p>
              )}

              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`rounded-2xl px-3 py-2 max-w-[80%] whitespace-pre-wrap text-xs sm:text-sm leading-relaxed shadow-sm ${
                      msg.role === "user"
                        ? "bg-brand text-white"
                        : "bg-slate-100/95 dark:bg-slate-800/95 text-slate-900 dark:text-slate-50"
                    }`}
                  >
                    {msg.role === "assistant"
                      ? renderMessageContent(msg.content)
                      : msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Thinking...
                </p>
              )}

              {error && (
                <p className="text-xs text-red-500">{error}</p>
              )}
            </div>

            <div className="border-t border-slate-200/80 dark:border-slate-800/80 px-3 py-2 bg-slate-50/60 dark:bg-slate-900/70">
              <div className="flex items-end gap-2">
                <textarea
                  rows={2}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question about a ratio, screen, or metric..."
                  className="flex-1 resize-none rounded-lg border border-slate-200/80 bg-white/95 px-2.5 py-1.5 text-xs sm:text-sm text-slate-900 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 focus-visible:ring-offset-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:focus-visible:ring-offset-slate-900"
                />
                <Button
                  size="icon"
                  className="h-9 w-9 rounded-full bg-brand text-white hover:bg-brand-dark shadow-md disabled:opacity-60"
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                AI answers are for educational purposes only, not investment
                advice.
              </p>
            </div>
          </Card>
        )}

        <Button
          size="icon"
          variant="default"
          className="h-12 w-12 rounded-full shadow-xl bg-brand text-white hover:bg-brand-dark focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-transform hover:scale-[1.03]"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close AI assistant" : "Open AI assistant"}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    </>
  );
}
