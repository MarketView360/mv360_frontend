import { createClient } from "@/lib/supabase/client";
import type { SessionSummary, ChatMessage, ReasoningQuota, QuotaStatus } from "@/lib/utils/jovan/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Error types for better handling
export class AIApiError extends Error {
  code: string;
  status: number;
  details?: string;

  constructor(message: string, code: string, status: number, details?: string) {
    super(message);
    this.name = "AIApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }

  static fromResponse(data: { message?: string; details?: string; code?: string }, status: number): AIApiError {
    return new AIApiError(
      data.message || "An error occurred",
      data.code || "UNKNOWN_ERROR",
      status,
      data.details
    );
  }

  isQuotaError(): boolean {
    return this.code === "QUOTA_EXCEEDED" || this.status === 429;
  }

  isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  isNetworkError(): boolean {
    return this.code === "NETWORK_ERROR";
  }
}

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

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
    return response;
  } catch {
    // Network error
    throw new AIApiError(
      "Unable to connect to the server. Please check your connection.",
      "NETWORK_ERROR",
      0
    );
  }
}

async function handleApiError(response: Response): Promise<never> {
  let errorData: { message?: string; details?: string; code?: string } = {};
  try {
    errorData = await response.json();
  } catch {
    errorData = { message: response.statusText || "Request failed" };
  }
  throw AIApiError.fromResponse(errorData, response.status);
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
      await handleApiError(response);
    }

    return response.json();
  },

  async fetchSessionMessages(sessionId: string): Promise<ChatMessage[]> {
    const response = await authFetch(`/ai/sessions/${sessionId}/messages`);
    
    if (!response.ok) {
      await handleApiError(response);
    }

    const data = await response.json();
    
    return data.map(
      (msg: { id?: string; role: string; content: string; created_at: string }, index: number) => {
        const rawContent = msg.content ?? "";

        // Extract persisted reasoning block if present
        const reasoningMatches = rawContent.match(/\[REASONING\]([\s\S]*?)\[\/REASONING\]/g);
        const reasoning = reasoningMatches
          ? reasoningMatches
              .map((m) => m.replace(/\[REASONING\]|\[\/REASONING\]/g, ""))
              .join("")
          : undefined;

        const cleanedContent = rawContent.replace(
          /\[REASONING\][\s\S]*?\[\/REASONING\]/g,
          "",
        );

        return {
          id: msg.id || `${sessionId}-${index}`,
          role: msg.role as "user" | "assistant",
          content: cleanedContent,
          reasoning,
          timestamp: msg.created_at,
        };
      },
    );
  },

  async renameSession(sessionId: string, title: string): Promise<void> {
    const response = await authFetch(`/ai/sessions/${sessionId}`, {
      method: "PATCH",
      body: JSON.stringify({ title }),
    });

    if (!response.ok) {
      await handleApiError(response);
    }
  },

  async deleteSession(sessionId: string): Promise<void> {
    const response = await authFetch(`/ai/sessions/${sessionId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      await handleApiError(response);
    }
  },

  async deleteAllSessions(): Promise<{ success: boolean; deletedCount: number }> {
    const response = await authFetch("/ai/sessions", {
      method: "DELETE",
    });

    if (!response.ok) {
      await handleApiError(response);
    }

    return response.json();
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
      await handleApiError(response);
    }

    return response.json();
  },

  async *streamMessage(
    params: SendMessageParams,
    signal?: AbortSignal
  ): AsyncGenerator<StreamChunk, void, unknown> {
    const token = await getAuthToken();
    
    let response: Response;
    try {
      response = await fetch(`${API_BASE}/ai/chat-auth/stream`, {
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
        signal,
      });
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        throw new AIApiError("Request cancelled", "CANCELLED", 0);
      }
      throw new AIApiError(
        "Unable to connect to the server. Please check your connection.",
        "NETWORK_ERROR",
        0
      );
    }

    if (!response.ok) {
      let errorData: { message?: string; details?: string; code?: string } = {};
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText || "Failed to stream message" };
      }
      throw AIApiError.fromResponse(errorData, response.status);
    }

    const sessionId = response.headers.get("x-session-id") || undefined;
    const titleHeader = response.headers.get("x-session-title");
    const title = titleHeader ? decodeURIComponent(titleHeader) : undefined;
    const reader = response.body?.getReader();
    
    if (!reader) {
      throw new AIApiError("No response body", "NO_BODY", 500);
    }

    const decoder = new TextDecoder();
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const text = decoder.decode(value, { stream: true });
        console.log('[AI API] Raw stream chunk:', text.length, 'chars:', text.substring(0, 100));
        if (!text) continue;
        {
          // Check for tool use indicators in the stream
          let toolUse: string | undefined;
          if (text.includes("[TOOL:web_search]")) {
            toolUse = "web_search";
          } else if (text.includes("[TOOL:visit_website]")) {
            toolUse = "visit_website";
          } else if (text.includes("[TOOL:wolfram_alpha]")) {
            toolUse = "calculator";
          }
          
          // Extract reasoning content from the stream
          let reasoning: string | undefined;
          let toolCall: string | undefined;
          let cleanText = text;
          
          // Parse [REASONING]...[/REASONING] tags
          const reasoningMatches = text.match(/\[REASONING\]([\s\S]*?)\[\/REASONING\]/g);
          if (reasoningMatches) {
            reasoning = reasoningMatches
              .map(match => match.replace(/\[REASONING\]|\[\/REASONING\]/g, ""))
              .join("");
            cleanText = text.replace(/\[REASONING\][\s\S]*?\[\/REASONING\]/g, "");
          }
          
          // Parse [TOOL_CALL]...[/TOOL_CALL] tags (local tool usage)
          const toolCallMatches = text.match(/\[TOOL_CALL\]([\s\S]*?)\[\/TOOL_CALL\]/g);
          if (toolCallMatches) {
            toolCall = toolCallMatches
              .map(match => match.replace(/\[TOOL_CALL\]|\[\/TOOL_CALL\]/g, ""))
              .join("");
            cleanText = cleanText.replace(/\[TOOL_CALL\][\s\S]*?\[\/TOOL_CALL\]/g, "");
            console.log('[AI API] Detected tool call:', toolCall); // Debug log
          }
          
          // Clean tool tags
          cleanText = cleanText.replace(/\[TOOL:\w+\]/g, "");
          
          console.log('[AI API] Stream chunk:', { hasToolCall: !!toolCall, textLength: cleanText.length }); // Debug
          yield { text: cleanText, reasoning, toolCall, sessionId, title, toolUse };
        }
      }
    } finally {
      reader.releaseLock();
    }
  },

  async fetchReasoningQuota(): Promise<ReasoningQuota> {
    const response = await authFetch("/ai/reasoning-quota");
    
    if (!response.ok) {
      await handleApiError(response);
    }

    return response.json();
  },

  async fetchQuotaStatus(): Promise<QuotaStatus> {
    const response = await authFetch("/ai/quota");
    
    if (!response.ok) {
      await handleApiError(response);
    }

    return response.json();
  },

  async fetchModels(): Promise<ModelsResponse> {
    const response = await authFetch("/ai/models");
    
    if (!response.ok) {
      await handleApiError(response);
    }

    return response.json();
  },

  async fetchProviderStatus(): Promise<Record<string, { available: boolean; name: string }>> {
    try {
      const response = await fetch(`${API_BASE}/ai/providers/status`);
      
      if (!response.ok) {
        throw new AIApiError("Failed to fetch provider status", "PROVIDER_STATUS_ERROR", response.status);
      }

      const data = await response.json();
      return data.providers;
    } catch {
      throw new AIApiError("Unable to connect to the server", "NETWORK_ERROR", 0);
    }
  },

  async sendAnonymousMessage(messages: Array<{ role: "user" | "assistant"; content: string }>): Promise<ChatResponse> {
    let response: Response;
    try {
      response = await fetch(`${API_BASE}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages }),
      });
    } catch {
      throw new AIApiError(
        "Unable to connect to the server. Please check your connection.",
        "NETWORK_ERROR",
        0
      );
    }

    if (!response.ok) {
      let errorData: { message?: string; details?: string; code?: string } = {};
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText || "Failed to send message" };
      }
      throw AIApiError.fromResponse(errorData, response.status);
    }

    return response.json();
  },
};

export default aiApi;
