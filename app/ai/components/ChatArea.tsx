"use client";

import React, { useRef, useEffect, useState } from "react";
import { User, Copy, ThumbsUp, ThumbsDown, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import { Icons } from "./Icons";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  model?: string;
  timestamp: Date;
  isReasoning?: boolean;
}

interface ChatAreaProps {
  messages: Message[];
}

const MOCK_MESSAGES: Message[] = [
  {
    id: "1",
    role: "user",
    content: "Analyze the current market trends for EV stocks, specifically focusing on Tesla and Rivian.",
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
  },
  {
    id: "2",
    role: "assistant",
    model: "gpt-5.1",
    content: "Based on the latest market data, the EV sector is currently experiencing a consolidation phase. \n\n**Tesla (TSLA)**\n- **Current Trend:** Bullish reversal pattern forming on the weekly chart.\n- **Key Levels:** Support at $210, Resistance at $250.\n- **News:** Recent FSD updates have been received positively by early testers.\n\n**Rivian (RIVN)**\n- **Current Trend:** Neutral to slightly bearish.\n- **Production:** Improving, but cash burn remains a primary concern for investors.\n\nWould you like a deeper technical analysis on either of these?",
    timestamp: new Date(Date.now() - 1000 * 60 * 4), // 4 mins ago
  },
  {
    id: "3",
    role: "user",
    content: "What about the technicals for Tesla? Give me the support and resistance levels.",
    timestamp: new Date(Date.now() - 1000 * 60 * 2), // 2 mins ago
  },
  {
    id: "4",
    role: "assistant",
    model: "claude-sonnet-4.5",
    content: "Here are the key technical levels for Tesla (TSLA) as of today:\n\n### Support Levels\n1. **$210.00** - Strong psychological support and 50-day moving average.\n2. **$194.50** - Previous swing low from last month.\n\n### Resistance Levels\n1. **$250.00** - Major resistance zone.\n2. **$265.20** - 200-day moving average convergence.\n\nThe RSI is currently at 58, indicating there is still room for upside before hitting overbought territory.",
    timestamp: new Date(Date.now() - 1000 * 60 * 1), // 1 min ago
  }
];

export function ChatArea({ messages = MOCK_MESSAGES }: ChatAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

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
      <div className="max-w-3xl mx-auto space-y-8 pb-8">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-4 group",
              message.role === "user" ? "flex-row-reverse" : "flex-row"
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
              "flex flex-col max-w-[85%] md:max-w-[75%]",
              message.role === "user" ? "items-end" : "items-start"
            )}>
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {message.role === "user" ? "You" : getModelName(message.model)}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className={cn(
                "rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                message.role === "user" 
                  ? "bg-indigo-600 text-white rounded-tr-sm" 
                  : "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm"
              )}>
                 <div className="prose prose-sm dark:prose-invert max-w-none wrap-break-word">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                 </div>
              </div>

              {/* Message Actions (Assistant only) */}
              {message.role === "assistant" && (
                <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <Copy className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <ThumbsUp className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <ThumbsDown className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <RefreshCw className="w-3 h-3" />
                    </Button>
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
    
    if (modelId.includes('gpt')) return <Icons.OpenAI className="w-5 h-5 text-slate-900 dark:text-white" />;
    if (modelId.includes('claude')) return <Icons.Anthropic className="w-5 h-5 text-slate-900 dark:text-white" />;
    if (modelId.includes('gemini')) return <Icons.Google className="w-5 h-5 text-blue-600" />;
    
    return <Icons.Auto className="w-5 h-5 text-indigo-500" />;
}

function getModelName(modelId?: string) {
    if (!modelId) return "Assistant";
    if (modelId === 'auto') return "Auto Model";
    if (modelId === 'gpt-5.1') return "GPT 5.1";
    if (modelId === 'claude-sonnet-4.5') return "Claude Sonnet";
    if (modelId === 'gemini-3') return "Gemini 3";
    return modelId;
}
