"use client";

import { useState, type ReactNode } from "react";
import { MessageSquare, X, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
      {/* Floating trigger button */}
      <TooltipProvider delayDuration={400}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              onClick={() => setOpen(true)}
              aria-label="Open Jovan AI assistant"
              aria-haspopup="dialog"
              aria-expanded={open}
              className={[
                "fixed z-50 h-12 w-12 rounded-full shadow-lg",
                "bottom-8 right-8",
                "max-md:bottom-6 max-md:right-4",
                "[bottom:calc(1.5rem_+_env(safe-area-inset-bottom))]",
                "transition-transform duration-150 hover:scale-105 active:scale-95",
              ].join(" ")}
            >
              <MessageSquare size={20} strokeWidth={1.75} aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Ask Jovan AI</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Chat panel as Sheet from the right */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-full sm:w-[420px] p-0 flex flex-col"
          aria-label="Jovan AI assistant"
        >
          <SheetHeader className="px-4 py-3 border-b border-border flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                  <Sparkles
                    size={14}
                    strokeWidth={1.75}
                    className="text-primary-foreground"
                    aria-hidden="true"
                  />
                </div>
                <SheetTitle className="text-sm font-semibold">
                  Jovan AI
                </SheetTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setOpen(false)}
                aria-label="Close AI assistant"
              >
                <X size={16} strokeWidth={1.75} aria-hidden="true" />
              </Button>
            </div>
          </SheetHeader>

          {/* Chat messages */}
          <ScrollArea className="flex-1 px-4">
            <div className="py-3 space-y-3 text-sm">
              {messages.length === 0 && !loading && !error && (
                <p className="text-xs text-muted-foreground leading-relaxed">
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
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {msg.role === "assistant"
                      ? renderMessageContent(msg.content)
                      : msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <p className="text-xs text-muted-foreground">
                  Thinking...
                </p>
              )}

              {error && (
                <p className="text-xs text-destructive">{error}</p>
              )}
            </div>
          </ScrollArea>

          <Separator />

          {/* Input area */}
          <div className="p-4 flex-shrink-0">
            <div className="flex items-end gap-2">
              <textarea
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question about a ratio, screen, or metric..."
                className="flex-1 resize-none rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs sm:text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              />
              <Button
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={handleSend}
                disabled={loading || !input.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">
              AI answers are for educational purposes only, not investment
              advice.
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
