"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageBubble } from "./MessageBubble";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/utils/jovan/types";

// Threshold for showing "scroll to bottom" button
const SCROLL_THRESHOLD = 200;

// Number of messages to render initially and load more
const INITIAL_RENDER_COUNT = 30;
const LOAD_MORE_COUNT = 20;

interface VirtualizedMessageListProps {
  messages: ChatMessage[];
  onEditMessage: (id: string, content: string) => void;
  onDeleteMessage: (id: string) => void;
  onRegenerate?: (id: string) => void;
}

/**
 * Virtualized message list for long conversations
 * Uses windowing to only render visible messages
 */
export function VirtualizedMessageList({
  messages,
  onEditMessage,
  onDeleteMessage,
  onRegenerate,
}: VirtualizedMessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [renderedCount, setRenderedCount] = useState(INITIAL_RENDER_COUNT);
  const [isNearBottom, setIsNearBottom] = useState(true);

  // Messages to render (from end, since we want newest visible)
  const startIndex = Math.max(0, messages.length - renderedCount);
  const visibleMessages = messages.slice(startIndex);

  // Handle scroll events
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    // Show scroll button if not near bottom
    setShowScrollButton(distanceFromBottom > SCROLL_THRESHOLD);
    setIsNearBottom(distanceFromBottom < 50);

    // Load more messages when scrolling to top
    if (scrollTop < 100 && renderedCount < messages.length) {
      setRenderedCount((prev) =>
        Math.min(prev + LOAD_MORE_COUNT, messages.length),
      );
    }
  }, [messages.length, renderedCount]);

  // Scroll to bottom
  const scrollToBottom = useCallback((smooth = true) => {
    const container = containerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  // Auto-scroll when new messages arrive (if near bottom)
  useEffect(() => {
    if (isNearBottom && messages.length > 0) {
      // Small delay to allow DOM update
      requestAnimationFrame(() => {
        scrollToBottom(true);
      });
    }
  }, [messages.length, isNearBottom, scrollToBottom]);

  // Initial scroll to bottom
  useEffect(() => {
    scrollToBottom(false);
  }, [scrollToBottom]);

  // Reset rendered count when messages change significantly
  useEffect(() => {
    if (messages.length <= INITIAL_RENDER_COUNT) {
      setRenderedCount(INITIAL_RENDER_COUNT);
    }
  }, [messages.length]);

  return (
    <div className="relative flex-1 overflow-hidden">
      {/* Messages container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto px-4 py-6 scroll-smooth"
        id="messages-scroll"
      >
        {/* Load more indicator */}
        {startIndex > 0 && (
          <div className="mb-4 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setRenderedCount((prev) =>
                  Math.min(prev + LOAD_MORE_COUNT, messages.length),
                )
              }
              className="text-xs text-slate-500"
            >
              Load {Math.min(LOAD_MORE_COUNT, startIndex)} earlier messages
            </Button>
          </div>
        )}

        {/* Message list */}
        <AnimatePresence mode="popLayout">
          {visibleMessages.map((msg, index) => (
            <motion.div
              key={msg.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
                // Stagger animation for initial load
                delay: index < 5 ? index * 0.05 : 0,
              }}
              className="mb-4"
            >
              <MessageBubble
                message={msg}
                onEdit={(content) => onEditMessage(msg.id, content)}
                onDelete={() => onDeleteMessage(msg.id)}
                onRegenerate={
                  onRegenerate && msg.role === "assistant"
                    ? () => onRegenerate(msg.id)
                    : undefined
                }
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Spacer for scroll padding */}
        <div className="h-4" />
      </div>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2"
          >
            <Button
              size="sm"
              variant="secondary"
              onClick={() => scrollToBottom(true)}
              className={cn(
                "rounded-full shadow-lg gap-1",
                "bg-white dark:bg-slate-800",
                "border border-slate-200 dark:border-slate-700",
              )}
            >
              <ChevronDown className="h-4 w-4" />
              <span className="text-xs">New messages</span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
