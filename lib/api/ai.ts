import { createClient } from "@/lib/supabase/client";
import type { SessionSummary, ChatMessage, ReasoningQuota } from "@/lib/utils/jovan/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function getAuthToken(): Promise<string | null> {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
}

async function authFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const token = await getAuthToken();
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
}

export interface SendMessageParams {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  sessionId?: string;
  reasoning?: boolean;
}

export interface ChatResponse {
  reply: string;
  sessionId?: string;
}

export interface QuotaStatus {
  standard: { used: number; limit: number };
  reasoning: { used: number; limit: number };
  premium: { used: number; limit: number };
  voice: { used: number; limit: number };
  tier: "free" | "premium";
  resetsAt: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  capabilities: string[];
  tier: string;
  speed: string;
  description?: string;
  available: boolean;
  requiresByok: boolean;
}

export interface ModelsResponse {
  providers: string[];
  models: Record<string, ModelInfo[]>;
  freeReasoningModels: string[];
}

export const aiApi = {
  async fetchSessions(): Promise<SessionSummary[]> {
    const response = await authFetch("/ai/sessions");
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch sessions" }));
      throw new Error(error.message || "Failed to fetch sessions");
    }

    return response.json();
  },

  async fetchSessionMessages(sessionId: string): Promise<ChatMessage[]> {
    const response = await authFetch(`/ai/sessions/${sessionId}/messages`);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch messages" }));
      throw new Error(error.message || "Failed to fetch messages");
    }

    const data = await response.json();
    
    return data.map((msg: { role: string; content: string; created_at: string }, index: number) => ({
      id: `${sessionId}-${index}`,
      role: msg.role as "user" | "assistant",
      content: msg.content,
      timestamp: msg.created_at,
    }));
  },

  async renameSession(sessionId: string, title: string): Promise<void> {
    const response = await authFetch(`/ai/sessions/${sessionId}`, {
      method: "PATCH",
      body: JSON.stringify({ title }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to rename session" }));
      throw new Error(error.message || "Failed to rename session");
    }
  },

  async deleteSession(sessionId: string): Promise<void> {
    const response = await authFetch(`/ai/sessions/${sessionId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to delete session" }));
      throw new Error(error.message || "Failed to delete session");
    }
  },

  async sendMessage(params: SendMessageParams): Promise<ChatResponse> {
    const response = await authFetch("/ai/chat-auth", {
      method: "POST",
      body: JSON.stringify({
        messages: params.messages,
        sessionId: params.sessionId,
        reasoning: params.reasoning,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to send message" }));
      throw new Error(error.message || error.details || "Failed to send message");
    }

    return response.json();
  },

  async *streamMessage(params: SendMessageParams): AsyncGenerator<{ text: string; sessionId?: string }, void, unknown> {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE}/ai/chat-auth/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        messages: params.messages,
        sessionId: params.sessionId,
        reasoning: params.reasoning,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to stream message" }));
      throw new Error(error.message || error.details || "Failed to stream message");
    }

    const sessionId = response.headers.get("x-session-id") || undefined;
    const reader = response.body?.getReader();
    
    if (!reader) {
      throw new Error("No response body");
    }

    const decoder = new TextDecoder();
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const text = decoder.decode(value, { stream: true });
        if (text) {
          yield { text, sessionId };
        }
      }
    } finally {
      reader.releaseLock();
    }
  },

  async fetchReasoningQuota(): Promise<ReasoningQuota> {
    const response = await authFetch("/ai/reasoning-quota");
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch quota" }));
      throw new Error(error.message || "Failed to fetch quota");
    }

    return response.json();
  },

  async fetchQuotaStatus(): Promise<QuotaStatus> {
    const response = await authFetch("/ai/quota");
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch quota status" }));
      throw new Error(error.message || "Failed to fetch quota status");
    }

    return response.json();
  },

  async fetchModels(): Promise<ModelsResponse> {
    const response = await authFetch("/ai/models");
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch models" }));
      throw new Error(error.message || "Failed to fetch models");
    }

    return response.json();
  },

  async fetchProviderStatus(): Promise<Record<string, { available: boolean; name: string }>> {
    const response = await fetch(`${API_BASE}/ai/providers/status`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch provider status");
    }

    const data = await response.json();
    return data.providers;
  },

  async sendAnonymousMessage(messages: Array<{ role: "user" | "assistant"; content: string }>): Promise<ChatResponse> {
    const response = await fetch(`${API_BASE}/ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to send message" }));
      throw new Error(error.message || error.details || "Failed to send message");
    }

    return response.json();
  },
};

export default aiApi;
