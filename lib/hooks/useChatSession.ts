import { useState, useEffect } from "react";
import type { SessionSummary } from "@/lib/utils/jovan/types";
import { mockSessions } from "@/lib/utils/jovan/mockData";

export function useChatSession(token: string | null, urlSession: string | null) {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Replace with real API call
    setSessions(mockSessions);
    if (urlSession) {
      setActiveSessionId(urlSession);
    } else if (mockSessions.length > 0) {
      setActiveSessionId(mockSessions[0].id);
    }
    setLoading(false);
  }, [token, urlSession]);

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
  };

  const handleNewChat = () => {
    setActiveSessionId(null);
  };

  return {
    sessions,
    activeSessionId,
    loadingSessions: loading,
    fetchSessions: () => {}, // Placeholder
    handleSelectSession,
    handleNewChat,
  };
}