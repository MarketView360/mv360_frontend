"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Edit3,
  Trash2,
  Copy,
  Check,
  Brain,
  Volume2,
  RefreshCw,
  Globe,
  Calculator,
  Search,
  Route,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { cn } from "@/lib/utils";
import { normalizeAiOutput } from "@/lib/utils/normalizeAiOutput";
import type { ChatMessage, ToolType } from "@/lib/utils/jovan/types";

// SSR-safe dark mode hook
const useIsDark = () => {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const check = () => {
      const isDarkMode = document.documentElement.classList.contains("dark") ||
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDark(isDarkMode);
    };
    check();
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    mql.addEventListener("change", check);
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => {
      mql.removeEventListener("change", check);
      observer.disconnect();
    };
  }, []);
  return isDark;
};

// Tool indicator mapping with better icons
const TOOL_CONFIGS: Record<ToolType, { text: string; icon: React.ReactNode; color: string; bgColor: string }> = {
  calculating: { text: "Calculating metrics...", icon: <Calculator className="h-3.5 w-3.5" />, color: "text-purple-600 dark:text-purple-400", bgColor: "bg-purple-100 dark:bg-purple-900/30" },
  visiting: { text: "Visiting website...", icon: <Globe className="h-3.5 w-3.5" />, color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-100 dark:bg-blue-900/30" },
  searching: { text: "Searching data...", icon: <Search className="h-3.5 w-3.5" />, color: "text-green-600 dark:text-green-400", bgColor: "bg-green-100 dark:bg-green-900/30" },
  routing: { text: "Selecting best model...", icon: <Route className="h-3.5 w-3.5" />, color: "text-orange-600 dark:text-orange-400", bgColor: "bg-orange-100 dark:bg-orange-900/30" },
  evaluating: { text: "Evaluating response...", icon: <CheckCircle className="h-3.5 w-3.5" />, color: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-100 dark:bg-amber-900/30" },
};

// Typing animation dots
const TypingDots = () => (
  <div className="flex items-center gap-1">
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className="h-2 w-2 rounded-full bg-brand"
        animate={{ y: [0, -4, 0] }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          delay: i * 0.15,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);

export function MessageBubble({
  message,
  onEdit,
  onDelete,
  onRegenerate,
}: {
  message: ChatMessage;
  onEdit: (content: string) => void;
  onDelete: () => void;
  onRegenerate?: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const isDark = useIsDark();
  const { speak, stop, isSpeaking, isSupported: ttsSupported } = useTextToSpeech();

  // Auto-focus textarea when editing starts
  useEffect(() => {
    if (editing) {
      const timer = setTimeout(() => {
        const textarea = document.getElementById(`edit-${message.id}`) as HTMLTextAreaElement;
        textarea?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [editing, message.id]);

  const copyCode = (code: string, blockId: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(blockId);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Render thinking/typing indicator
  if (message.isStreaming && !message.content) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-start"
      >
        <div className="flex items-center gap-3 rounded-2xl bg-white border border-slate-200 dark:border-slate-700 dark:bg-slate-800 px-4 py-3 shadow-sm">
          {/* AI Avatar */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          {/* Typing dots */}
          <div className="flex items-center gap-1.5">
            <TypingDots />
            <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">
              {message.reasoning || "Thinking..."}
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  // Render tool indicator
  if (message.tool && message.isStreaming) {
    const config = TOOL_CONFIGS[message.tool];
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-start"
      >
        <div className={cn(
          "flex items-center gap-3 rounded-2xl px-4 py-3 shadow-sm border",
          config.bgColor,
          "border-slate-200 dark:border-slate-700"
        )}>
          {/* Tool icon with animation */}
          <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", config.bgColor)}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              {config.icon}
            </motion.div>
          </div>
          <span className={cn("text-sm font-medium", config.color)}>{config.text}</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={cn("group flex", message.role === "user" ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "relative max-w-[80%] rounded-2xl px-4 py-3 shadow-sm transition-all",
          message.role === "user"
            ? "bg-brand text-white"
            : "bg-white border border-slate-200 dark:border-slate-700 dark:bg-slate-800"
        )}
      >
        {editing ? (
          <div className="flex flex-col gap-3">
            <Textarea
              id={`edit-${message.id}`}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full resize-none rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              rows={3}
            />
            <div className="flex items-center gap-2">
              <Button size="xs" onClick={() => {
                onEdit(editText);
                setEditing(false);
              }}>
                Save changes
              </Button>
              <Button size="xs" variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Reasoning section */}
            {message.reasoning && (
              <details className="mb-2 cursor-pointer rounded-md border border-slate-200 bg-white/60 p-2 text-xs dark:border-slate-700 dark:bg-slate-800/60">
                <summary className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                  <Brain className="h-3 w-3" /> Thought process
                </summary>
                <div className="mt-1 text-slate-700 dark:text-slate-300">{message.reasoning}</div>
              </details>
            )}

            {/* Main content */}
            <div className="prose prose-sm max-w-none text-slate-900 dark:prose-invert dark:text-slate-100">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    const lang = match?.[1] || "text";
                    const code = String(children).replace(/\n$/, "");
                    const blockId = `code-${message.id}-${Math.random().toString(36).slice(2, 11)}`;

                    return !inline ? (
                      <div className="relative my-3">
                        <SyntaxHighlighter
                          language={lang}
                          style={isDark ? oneDark : oneLight}
                          {...props}
                          className="rounded-md text-sm"
                        >
                          {code}
                        </SyntaxHighlighter>
                        <button
                          onClick={() => copyCode(code, blockId)}
                          className="absolute right-2 top-2 rounded bg-slate-800/80 px-2 py-1 text-xs text-white hover:bg-slate-700 transition-colors"
                          aria-label="Copy code"
                        >
                          {copiedCode === blockId ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                    ) : (
                      <code className="rounded bg-slate-200 px-1 py-0.5 text-xs font-mono dark:bg-slate-700">
                        {children}
                      </code>
                    );
                  },
                  p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="ml-4 list-disc space-y-1 mb-2">{children}</ul>,
                  ol: ({ children }) => <ol className="ml-4 list-decimal space-y-1 mb-2">{children}</ol>,
                  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                  h1: ({ children }) => <h1 className="mb-2 text-lg font-bold">{children}</h1>,
                  h2: ({ children }) => <h2 className="mb-2 text-base font-semibold">{children}</h2>,
                  h3: ({ children }) => <h3 className="mb-2 text-sm font-semibold">{children}</h3>,
                  a: ({ children, href }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="underline underline-offset-2 text-brand hover:text-brand-dark font-medium"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {/* E1: Normalize AI output before rendering */}
                {message.role === "assistant" ? normalizeAiOutput(message.content) : message.content}
              </ReactMarkdown>
            </div>

            {/* Action bar - always visible with good contrast */}
            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
              {/* Timestamp - always visible */}
              {message.timestamp && (
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
              
              {/* Action buttons - always visible */}
              <TooltipProvider>
                <div className="flex items-center gap-0.5">
                  {/* Copy */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        onClick={() => {
                          navigator.clipboard.writeText(message.content);
                          setCopiedMessage(true);
                          setTimeout(() => setCopiedMessage(false), 2000);
                        }}
                      >
                        {copiedMessage ? (
                          <Check className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy</TooltipContent>
                  </Tooltip>

                {/* Speak (assistant only) */}
                {message.role === "assistant" && ttsSupported && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => {
                          if (isSpeaking) {
                            stop();
                          } else {
                            speak(message.content);
                          }
                        }}
                      >
                        <Volume2
                          className={cn(
                            "h-3 w-3",
                            isSpeaking && "text-brand animate-pulse",
                          )}
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isSpeaking ? "Stop" : "Speak"}
                    </TooltipContent>
                  </Tooltip>
                )}

                {/* Regenerate (assistant only) */}
                {message.role === "assistant" && onRegenerate && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={onRegenerate}
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Regenerate</TooltipContent>
                  </Tooltip>
                )}

                {/* Edit
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => setEditing(true)}
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit</TooltipContent>
                </Tooltip>
                */}

                {/* Delete */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 hover:text-red-500"
                      onClick={onDelete}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}