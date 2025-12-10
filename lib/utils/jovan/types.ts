export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isStreaming?: boolean;
  reasoning?: string;
}

export interface SessionSummary {
  id: string;
  title: string | null;
  created_at: string;
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