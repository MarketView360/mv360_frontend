import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type { SessionSummary } from "@/lib/utils/jovan/types";
import { aiApi, AIApiError } from "@/lib/api/ai";

export function useChatSession(token: string | null, urlSession: string | null) {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    if (!token) {
      setSessions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const data = await aiApi.fetchSessions();
      setSessions(data);
      
      // Only set active session from URL, don't auto-select first
      if (urlSession) {
        setActiveSessionId(urlSession);
      }
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
      const message = err instanceof Error ? err.message : "Failed to fetch sessions";
      setError(message);
      setSessions([]);
      
      if (err instanceof AIApiError && !err.isAuthError()) {
        toast.error("Failed to load chat history");
      }
    } finally {
      setLoading(false);
    }
  }, [token, urlSession]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleSelectSession = useCallback((id: string) => {
    setActiveSessionId(id);
    // Update URL without full navigation. Encode the ID to avoid malformed
    // URI errors if it contains characters like "%".
    const encodedId = encodeURIComponent(id);
    window.history.pushState({}, "", `/ai?session=${encodedId}`);
  }, []);

  const handleNewChat = useCallback(() => {
    setActiveSessionId(null);
    // Clear URL session param
    window.history.pushState({}, "", "/ai");
  }, []);

  const handleDeleteSession = useCallback(async (id: string): Promise<boolean> => {
    try {
      await aiApi.deleteSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      
      if (activeSessionId === id) {
        setActiveSessionId(null);
        window.history.pushState({}, "", "/ai");
      }
      
      toast.success("Conversation deleted");
      return true;
    } catch (err) {
      console.error("Failed to delete session:", err);
      toast.error("Failed to delete conversation");
      return false;
    }
  }, [activeSessionId]);

  const handleRenameSession = useCallback(async (id: string, title: string): Promise<boolean> => {
    if (!title.trim()) {
      toast.error("Title cannot be empty");
      return false;
    }
    
    try {
      await aiApi.renameSession(id, title.trim());
      setSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, title: title.trim() } : s))
      );
      toast.success("Conversation renamed");
      return true;
    } catch (err) {
      console.error("Failed to rename session:", err);
      toast.error("Failed to rename conversation");
      return false;
    }
  }, []);

  const addSession = useCallback((session: SessionSummary) => {
    // Check if session already exists to prevent duplicates
    setSessions((prev) => {
      const exists = prev.some((s) => s.id === session.id);
      if (exists) return prev;
      return [session, ...prev];
    });
    
    // Only update URL and active session if not already set
    // This prevents unnecessary re-renders during streaming
    setActiveSessionId((currentId) => {
      if (currentId !== session.id) {
        // Update URL to include session. Encode ID to ensure it's a valid URI
        // component and won't break decodeURIComponent inside Next/router.
        const encodedId = encodeURIComponent(session.id);
        window.history.pushState({}, "", `/ai?session=${encodedId}`);
        return session.id;
      }
      return currentId;
    });
  }, []);

  return {
    sessions,
    activeSessionId,
    loadingSessions: loading,
    error,
    fetchSessions,
    handleSelectSession,
    handleNewChat,
    handleDeleteSession,
    handleRenameSession,
    addSession,
    setActiveSessionId,
  };
}