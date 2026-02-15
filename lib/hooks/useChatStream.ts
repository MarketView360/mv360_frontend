import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import type { ChatMessage } from "@/lib/utils/jovan/types";
import { aiApi, AIApiError } from "@/lib/api/ai";

export interface StreamingState {
  isStreaming: boolean;
  toolInUse?: string;
}

export function useChatStream(token: string | null, sessionId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [streamingState, setStreamingState] = useState<StreamingState>({ isStreaming: false });
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const sessionJustCreatedRef = useRef<boolean>(false);
  const messagesRef = useRef<ChatMessage[]>([]);

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
    // Don't fetch messages if we just created the session during streaming
    // This prevents overwriting the streaming messages
    if (!sessionJustCreatedRef.current) {
      fetchMessages();
    } else {
      // Reset the flag after skipping the fetch
      sessionJustCreatedRef.current = false;
    }
  }, [fetchMessages]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const sendMessage = useCallback(
    async (
      content: string,
      options: { 
        reasoning?: boolean; 
        onSessionCreated?: (id: string, title: string) => void;
      } = {}
    ): Promise<{ sessionId: string | null; title: string | null }> => {
      if (!token) {
        toast.error("Please log in to send messages");
        setError("Please log in to send messages");
        return { sessionId: null, title: null };
      }

      // Cancel any existing stream
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const userMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        role: "user",
        content,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setStreamingState({ isStreaming: true });
      setError(null);

      const assistantMessageId = `temp-${Date.now() + 1}`;
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
        isStreaming: true,
        reasoning: options.reasoning ? "" : undefined,
        toolCalls: undefined,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      try {
        const history = messagesRef.current
          .filter((m) => m.role !== "assistant" || m.content.trim() !== "")
          .filter((m) => !m.isStreaming);

        const allMessages = [
          ...history.map((m) => ({ role: m.role, content: m.content })),
          { role: "user" as const, content },
        ];

        let fullContent = "";
        let fullReasoning = "";
        let toolCallsUsed: string[] = [];
        let resolvedSessionId: string | undefined = sessionId || undefined;
        let resolvedTitle: string | undefined;

        for await (const chunk of aiApi.streamMessage(
          {
            messages: allMessages,
            sessionId: sessionId || undefined,
            reasoning: options.reasoning,
          },
          abortControllerRef.current.signal
        )) {
          fullContent += chunk.text;
          
          // Accumulate reasoning content
          if (chunk.reasoning) {
            fullReasoning += chunk.reasoning;
          }
          
          // Track tool calls (local tools like fundamentals)
          if (chunk.toolCall && !toolCallsUsed.includes(chunk.toolCall)) {
            toolCallsUsed.push(chunk.toolCall);
            console.log('[useChatStream] Added tool call:', chunk.toolCall, 'Total:', toolCallsUsed);
          }
          
          // Handle new session creation
          if (chunk.sessionId && !resolvedSessionId) {
            resolvedSessionId = chunk.sessionId;
            // Title is already decoded in ai.ts from the header, don't decode again
            resolvedTitle = chunk.title;
            // Mark that we just created a session to prevent refetching during streaming
            sessionJustCreatedRef.current = true;
            options.onSessionCreated?.(chunk.sessionId, resolvedTitle || "New chat");
          }

          // Update tool indicator (Groq compound tools like web_search)
          if (chunk.toolUse) {
            setStreamingState({ isStreaming: true, toolInUse: chunk.toolUse });
            const toolNames: Record<string, string> = {
              web_search: "Searching the web...",
              visit_website: "Visiting website...",
              calculator: "Calculating...",
            };
            toast.info(toolNames[chunk.toolUse] || "Using tool...", { id: "tool-use" });
          }

          setMessages((prev) => {
            const updated = prev.map((m) =>
              m.id === assistantMessageId
                ? { 
                    ...m, 
                    content: fullContent,
                    reasoning: fullReasoning || undefined,
                    toolCalls: toolCallsUsed.length > 0 ? toolCallsUsed : undefined,
                  }
                : m
            );
            
            // Debug: log the updated message
            const updatedMsg = updated.find(m => m.id === assistantMessageId);
            if (updatedMsg && toolCallsUsed.length > 0) {
              console.log('[useChatStream] Updated message with toolCalls:', updatedMsg.toolCalls);
            }
            
            return updated;
          });
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId
              ? { ...m, isStreaming: false }
              : m
          )
        );

        return { sessionId: resolvedSessionId || null, title: resolvedTitle || null };
      } catch (err) {
        console.error("Failed to send message:", err);
        
        // Handle different error types
        if (err instanceof AIApiError) {
          if (err.isQuotaError()) {
            toast.error("Daily limit reached", {
              description: "Upgrade to premium for more messages.",
            });
          } else if (err.isNetworkError()) {
            toast.error("Connection error", {
              description: "Please check your internet connection.",
            });
          } else if (err.code === "CANCELLED") {
            // User cancelled, don't show error
          } else {
            toast.error("Failed to send message", {
              description: err.details || err.message,
            });
          }
          setError(err.message);
        } else {
          const message = err instanceof Error ? err.message : "Failed to send message";
          toast.error(message);
          setError(message);
        }
        
        // Remove the failed assistant message
        setMessages((prev) =>
          prev.filter((m) => m.id !== assistantMessageId)
        );
        
        return { sessionId: null, title: null };
      } finally {
        setStreamingState({ isStreaming: false });
        abortControllerRef.current = null;
      }
    },
    [token, sessionId]
  );

  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setStreamingState({ isStreaming: false });
    toast.info("Response cancelled");
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
    isStreaming: streamingState.isStreaming,
    toolInUse: streamingState.toolInUse,
    error,
    sendMessage,
    cancelStream,
    clearMessages,
    fetchMessages,
    handleDeleteMessage,
    handleEditMessage,
  };
}