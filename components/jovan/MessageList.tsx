"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MessageBubble } from "./MessageBubble";

import type { ChatMessage } from "@/lib/utils/jovan/types";

export function MessageList({
  messages,
  onEditMessage,
  onDeleteMessage,
}: {
  messages: ChatMessage[];
  onEditMessage: (id: string, content: string) => void;
  onDeleteMessage: (id: string) => void;
}) {
  return (
    <div id="messages-scroll" className="px-4 py-6">
      <AnimatePresence mode="popLayout">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="mb-4"
          >
           <MessageBubble
              message={msg}
              onEdit={(content) => onEditMessage(msg.id, content)}
              onDelete={() => onDeleteMessage(msg.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}