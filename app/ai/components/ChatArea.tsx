"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  User,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Check,
  Download,
  FileText,
  FileJson,
  FileDown,
  Volume2,
  StopCircle,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { JovanResponse, stripJovanTags } from "../utils/jovanParser";
import { Icons } from "./Icons";
import { ReasoningBlock, ReasoningIndicator } from "./ReasoningBlock";
import { ToolUsageBlock } from "./ToolUsageBlock";

// Try to satisfy the missing type definition without installing new packages if possible
declare module 'dom-to-image-more';

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  model?: string;
  timestamp: Date;
  isReasoning?: boolean;
  isStreaming?: boolean;
  reasoning?: string;
  toolCalls?: string[];
  toolStatus?: string;
}

interface ChatAreaProps {
  messages: Message[];
}


export function ChatArea({ messages }: ChatAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const assistantBubbleRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const toExportPlainText = useCallback((content: string) => {
    const stripped = stripJovanTags(content);
    return stripped
      // Remove any remaining tags (defensive; should be rare)
      .replace(/\{\{[^}]+\}\}/g, "")
      // Normalize line endings
      .replace(/\r\n?/g, "\n")
      // Drop control chars that can confuse PDF encoding (keep \n and \t)
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
      // Normalize whitespace
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }, []);

  const handleExport = useCallback(
    async (message: Message, format: "pdf" | "json" | "txt") => {
      try {
        const plainText = toExportPlainText(message.content);

        const safeTimestamp = message.timestamp
          .toISOString()
          .replace(/[:.]/g, "-")
          .replace("T", "_")
          .replace("Z", "");

        const filenameBase = `ai-response_${safeTimestamp}`;

        const downloadBlob = (blob: Blob, filename: string) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
        };

        if (format === "txt") {
          const blob = new Blob([plainText], { type: "text/plain;charset=utf-8" });
          downloadBlob(blob, `${filenameBase}.txt`);
          toast.success("Exported TXT");
          return;
        }

        if (format === "json") {
          const payload = {
            id: message.id,
            role: message.role,
            model: message.model ?? null,
            timestamp: message.timestamp.toISOString(),
            reasoning: message.reasoning ?? null,
            content: {
              raw: message.content,
              plain: plainText,
            },
          };
          const blob = new Blob([JSON.stringify(payload, null, 2)], {
            type: "application/json;charset=utf-8",
          });
          downloadBlob(blob, `${filenameBase}.json`);
          toast.success("Exported JSON");
          return;
        }

        const doc = new jsPDF({ unit: "pt", format: "a4" });
        const margin = 48;

        // Prefer formatted export by capturing the rendered assistant bubble.
        const el = assistantBubbleRefs.current[message.id];
        if (el) {
          const domToImage = await import("dom-to-image-more");
          const imgData = await domToImage.toPng(el, {
            bgcolor: "#ffffff",
            quality: 1,
            style: {
              transform: "scale(2)",
              transformOrigin: "top left",
            },
            width: el.scrollWidth * 2,
            height: el.scrollHeight * 2,
          });

          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();
          const usableWidth = pageWidth - margin * 2;
          const usableHeight = pageHeight - margin * 2;

          // We rendered with scale(2) so use the element's scrollWidth/Height * 2 for aspect.
          const imgWidth = usableWidth;
          const imgHeight = ((el.scrollHeight * 2) * imgWidth) / (el.scrollWidth * 2);

          let remaining = imgHeight;
          const y = margin;
          let offset = 0;

          while (remaining > 0) {
            doc.addImage(imgData, "PNG", margin, y - offset, imgWidth, imgHeight);
            remaining -= usableHeight;
            offset += usableHeight;

            if (remaining > 0) {
              doc.addPage();
            }
          }

          doc.save(`${filenameBase}.pdf`);
          toast.success("Exported PDF");
          return;
        }

        // Fallback: plain-text PDF if bubble ref is missing.
        const pageWidth = doc.internal.pageSize.getWidth();
        const maxWidth = pageWidth - margin * 2;

        const header = message.model
          ? `AI Response (${getModelName(message.model)})`
          : "AI Response";
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text(header, margin, 64);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(`Generated: ${message.timestamp.toLocaleString()}`, margin, 84);

        doc.setFontSize(11);
        const lines = doc.splitTextToSize(plainText || "(empty)", maxWidth);
        doc.text(lines, margin, 116);

        doc.save(`${filenameBase}.pdf`);
        toast.success("Exported PDF");
      } catch (err) {
        console.error("Export failed:", err);
        toast.error("Failed to export");
      }
    },
    [toExportPlainText],
  );

  const handleCopy = useCallback(async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(messageId);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }, []);

  // Handle scroll events to detect if user is at the bottom
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      // Consider "at bottom" if within 100px of the bottom
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShouldAutoScroll(isAtBottom);
    }
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const lastMessage = messages[messages.length - 1];
    const isUserMessage = lastMessage?.role === "user";

    // Always scroll to bottom for user messages (they just typed it)
    // Or if the user was already at the bottom
    if (isUserMessage || shouldAutoScroll) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, shouldAutoScroll]);

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="h-full w-full overflow-y-auto px-4 md:px-8 pt-4 scroll-smooth custom-scrollbar"
    >
      <div className="max-w-5xl xl:max-w-6xl mx-auto space-y-8 pb-8 w-full">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-4 group",
              message.role === "user" ? "flex-row-reverse justify-start" : "flex-row justify-start"
            )}
          >
            {/* Avatar */}
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm",
              message.role === "user"
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            )}>
              {message.role === "user" ? (
                <User className="w-5 h-5" />
              ) : (
                <ModelIcon modelId={message.model} />
              )}
            </div>

            {/* Content */}
            <div className={cn(
              "flex flex-col",
              message.role === "user"
                ? "items-end max-w-[95%] sm:max-w-[90%] md:max-w-[82%] lg:max-w-[75%] ml-auto"
                : "items-start max-w-[95%] md:max-w-[92%] lg:max-w-[88%]"
            )}>
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {message.role === "user" ? "You" : getModelName(message.model)}
                </span>
                {/* Show reasoning indicator badge for assistant messages with reasoning */}
                {message.role === "assistant" && message.reasoning !== undefined && (
                  <ReasoningIndicator isActive={message.isStreaming && !message.content} />
                )}
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className={cn(
                "rounded-2xl px-5 py-4 shadow-sm min-w-[200px]",
                message.role === "user"
                  ? "bg-indigo-600 text-white rounded-tr-sm text-[15px] leading-relaxed"
                  : "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm"
              )}
                ref={(node) => {
                  if (message.role === "assistant") {
                    assistantBubbleRefs.current[message.id] = node;
                  }
                }}>
                {message.role === "user" ? (
                  <div
                    className="whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{
                      __html: message.content.replace(
                        /\[([^\]]+)\]\(([^)]+)\)/g,
                        '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-100 hover:text-blue-200 underline">$1</a>'
                      )
                    }}
                  />
                ) : (
                  <>
                    {/* Reasoning block - shown when reasoning content exists */}
                    {(message.reasoning !== undefined) && (
                      <ReasoningBlock
                        reasoning={message.reasoning}
                        isStreaming={message.isStreaming && !message.content}
                      />
                    )}
                    {/* Tool usage indicators - shown when tools were used */}
                    {message.toolCalls && message.toolCalls.length > 0 && (
                      <div className="space-y-2 mb-3">
                        {message.toolCalls.map((toolName, idx) => (
                          <ToolUsageBlock
                            key={idx}
                            toolName={toolName}
                            isActive={message.isStreaming}
                            statusMessage={message.isStreaming ? message.toolStatus : undefined}
                          />
                        ))}
                      </div>
                    )}
                    <JovanResponse
                      content={message.content}
                      isStreaming={message.isStreaming}
                    />
                  </>
                )}
              </div>

              {/* Message Actions (Assistant only, hide while streaming) */}
              {message.role === "assistant" && !message.isStreaming && (
                <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    onClick={() => handleCopy(stripJovanTags(message.content), message.id)}
                  >
                    {copiedId === message.id ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <ThumbsUp className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <ThumbsDown className="w-3 h-3" />
                  </Button>
                  <div className="h-3 w-px bg-slate-200 dark:bg-slate-700 mx-1" />
                  <SpeakButton
                    content={stripJovanTags(message.content)}
                    messageId={message.id}
                  />
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <RefreshCw className="w-3 h-3" />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" side="top" className="w-44">
                      <DropdownMenuItem
                        onClick={() => handleExport(message, "pdf")}
                        className="cursor-pointer"
                      >
                        <FileDown className="w-4 h-4 text-red-600" />
                        <span className="ml-2">Export PDF</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleExport(message, "json")}
                        className="cursor-pointer"
                      >
                        <FileJson className="w-4 h-4 text-blue-600" />
                        <span className="ml-2">Export JSON</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleExport(message, "txt")}
                        className="cursor-pointer"
                      >
                        <FileText className="w-4 h-4 text-slate-600" />
                        <span className="ml-2">Export TXT</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ModelIcon({ modelId }: { modelId?: string }) {
  if (!modelId) return <Icons.Auto className="w-5 h-5 text-indigo-500" />;

  if (modelId === 'gpt-oss') return <Icons.Jovan className="w-5 h-5" />;

  if (modelId.includes('gpt')) return <Icons.OpenAI className="w-5 h-5 text-slate-900 dark:text-white" />;
  if (modelId.includes('claude')) return <Icons.Anthropic className="w-5 h-5 text-slate-900 dark:text-white" />;
  if (modelId.includes('gemini')) return <Icons.Google className="w-5 h-5 text-blue-600" />;

  return <Icons.Auto className="w-5 h-5 text-indigo-500" />;
}

function getModelName(modelId?: string) {
  if (!modelId) return "Assistant";
  if (modelId === 'auto') return "Auto Model";
  if (modelId === 'gpt-oss') return "Jovan Fast";
  if (modelId === 'gpt-5.1') return "GPT 5.1";
  if (modelId === 'claude-sonnet-4.5') return "Claude Sonnet";
  if (modelId === 'gemini-3') return "Gemini 3";
  return modelId;
}

function SpeakButton({ content, messageId }: { content: string; messageId: string }) {
  const { speak, stop, state } = useTextToSpeech({
    onError: (err) => toast.error("TTS Error", { description: err })
  });

  const [active, setActive] = useState(false);

  useEffect(() => {
    if (state === "idle") setActive(false);
    if (state === "speaking") setActive(true);
  }, [state]);

  const toggle = () => {
    if (active) {
      stop();
    } else {
      speak(content);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "h-6 w-6 transition-colors",
        active ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
      )}
      onClick={toggle}
      title={active ? "Stop speaking" : "Read aloud"}
    >
      {active ? <StopCircle className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
    </Button>
  );
}
