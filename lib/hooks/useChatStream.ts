import { useState, useEffect } from "react";
import type { ChatMessage } from "@/lib/utils/jovan/types";
import { mockMessages } from "@/lib/utils/jovan/mockData";

export function useChatStream(token: string | null, sessionId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      setMessages(mockMessages(sessionId));
    } else {
      setMessages([]);
    }
    setLoading(false);
  }, [sessionId]);

  const handleDeleteMessage = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const handleEditMessage = (id: string, content: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, content } : m))
    );
  };

  return {
    messages,
    loadingMsgs: loading,
    handleDeleteMessage,
    handleEditMessage,
  };
}