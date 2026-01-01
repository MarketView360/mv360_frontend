import { useState, useEffect, useCallback } from "react";
import type { SessionSummary } from "@/lib/utils/jovan/types";
import { aiApi } from "@/lib/api/ai";

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
      
      if (urlSession) {
        setActiveSessionId(urlSession);
      } else if (data.length > 0) {
        setActiveSessionId(data[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch sessions");
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [token, urlSession]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleSelectSession = useCallback((id: string) => {
    setActiveSessionId(id);
  }, []);

  const handleNewChat = useCallback(() => {
    setActiveSessionId(null);
  }, []);

  const handleDeleteSession = useCallback(async (id: string) => {
    try {
      await aiApi.deleteSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (activeSessionId === id) {
        setActiveSessionId(null);
      }
    } catch (err) {
      console.error("Failed to delete session:", err);
      throw err;
    }
  }, [activeSessionId]);

  const handleRenameSession = useCallback(async (id: string, title: string) => {
    try {
      await aiApi.renameSession(id, title);
      setSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, title } : s))
      );
    } catch (err) {
      console.error("Failed to rename session:", err);
      throw err;
    }
  }, []);

  const addSession = useCallback((session: SessionSummary) => {
    setSessions((prev) => [session, ...prev]);
    setActiveSessionId(session.id);
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