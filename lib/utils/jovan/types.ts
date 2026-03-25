export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isStreaming?: boolean;
  reasoning?: string;
  toolCalls?: string[];
  toolStatus?: string;
  isWatchlistAnalysis?: boolean; // Badge indicator for watchlist analysis messages
  metrics?: {
    ttft: number; // Time to first token (ms)
    tps: number; // Tokens per second
    totalTokens: number; // Estimated tokens
    totalTime: number; // Total request time (ms)
  };
}

export interface SessionSummary {
  id: string;
  title: string | null;
  created_at: string;
  titleGenerating?: boolean; // Client-side flag for loading state
}

export type ToolType =
  | "visiting"
  | "calculating"
  | "searching"
  | "routing"
  | "evaluating";

export interface ReasoningQuota {
  used: number;
  limit: number;
  resetsAt: string;
}

/**
 * Token-based quota status with 12-hour reset
 * 
 * Limits:
 * - Free: 30,000 tokens / 12 hours, 3 reasoning / 12 hours
 * - Premium: 300,000 tokens / 12 hours, 10 reasoning / 12 hours
 */
export interface QuotaStatus {
  success: boolean;
  tokens: {
    used: number;
    limit: number;
    remaining: number;
  };
  reasoning: {
    used: number;
    limit: number;
    remaining: number;
  };
  resetsAt: string;
  tier: 'free' | 'premium';
}