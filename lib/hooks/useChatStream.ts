import { useState, useEffect, useCallback, useRef } from "react";
import type { ChatMessage } from "@/lib/utils/jovan/types";
import { aiApi } from "@/lib/api/ai";

export function useChatStream(token: string | null, sessionId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!token || !sessionId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await aiApi.fetchSessionMessages(sessionId);
      setMessages(data);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch messages");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [token, sessionId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const sendMessage = useCallback(
    async (
      content: string,
      options: { reasoning?: boolean; onSessionCreated?: (id: string) => void } = {}
    ): Promise<string | null> => {
      if (!token) {
        setError("Please log in to send messages");
        return null;
      }

      const userMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        role: "user",
        content,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsStreaming(true);
      setError(null);

      const assistantMessageId = `temp-${Date.now() + 1}`;
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      try {
        const allMessages = [
          ...messages.map((m) => ({ role: m.role, content: m.content })),
          { role: "user" as const, content },
        ];

        let fullContent = "";
        let resolvedSessionId: string | undefined = sessionId || undefined;

        for await (const chunk of aiApi.streamMessage({
          messages: allMessages,
          sessionId: sessionId || undefined,
          reasoning: options.reasoning,
        })) {
          fullContent += chunk.text;
          
          if (chunk.sessionId && !resolvedSessionId) {
            resolvedSessionId = chunk.sessionId;
            options.onSessionCreated?.(chunk.sessionId);
          }

          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessageId
                ? { ...m, content: fullContent }
                : m
            )
          );
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId
              ? { ...m, isStreaming: false }
              : m
          )
        );

        return resolvedSessionId || null;
      } catch (err) {
        console.error("Failed to send message:", err);
        setError(err instanceof Error ? err.message : "Failed to send message");
        
        setMessages((prev) =>
          prev.filter((m) => m.id !== assistantMessageId)
        );
        
        return null;
      } finally {
        setIsStreaming(false);
      }
    },
    [token, sessionId, messages]
  );

  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const handleDeleteMessage = useCallback((id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const handleEditMessage = useCallback((id: string, content: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, content } : m))
    );
  }, []);

  return {
    messages,
    loadingMsgs: loading,
    isStreaming,
    error,
    sendMessage,
    cancelStream,
    clearMessages,
    fetchMessages,
    handleDeleteMessage,
    handleEditMessage,
  };
}