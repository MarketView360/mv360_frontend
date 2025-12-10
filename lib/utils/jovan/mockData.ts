import type { SessionSummary, ChatMessage } from "./types";

export const mockSessions: SessionSummary[] = [
  {
    id: "session-1",
    title: "SaaS Metrics Analysis",
    created_at: "2024-01-15T10:30:00Z",
  },
  {
    id: "session-2",
    title: "AAPL vs MSFT Comparison",
    created_at: "2024-01-14T15:45:00Z",
  },
  {
    id: "session-3",
    title: "ROIC Explanation",
    created_at: "2024-01-13T09:20:00Z",
  },
];

export const mockMessages = (sessionId: string): ChatMessage[] => {
  const messages: Record<string, ChatMessage[]> = {
    "session-1": [
      {
        id: "msg-1",
        role: "user",
        content: "What is the Rule of 40 for SaaS companies?",
        timestamp: "2024-01-15T10:30:00Z",
      },
      {
        id: "msg-2",
        role: "assistant",
        content:
          "The Rule of 40 is a key metric for SaaS companies that states: **Growth Rate + Profit Margin ≥ 40%**. This helps evaluate whether a SaaS business is balancing growth and profitability effectively.",
        timestamp: "2024-01-15T10:30:05Z",
      },
    ],
    "session-2": [
      {
        id: "msg-3",
        role: "user",
        content: "Compare AAPL and MSFT using key metrics",
        timestamp: "2024-01-14T15:45:00Z",
      },
      {
        id: "msg-4",
        role: "assistant",
        content: `Here's a comparison of AAPL and MSFT:

**AAPL (Apple Inc.)**
- P/E Ratio: 28.5
- Revenue Growth: 8.1%
- ROE: 160.1%

**MSFT (Microsoft Corp.)**
- P/E Ratio: 31.2
- Revenue Growth: 12.4%
- ROE: 42.9%

MSFT shows higher growth, while AAPL has better efficiency metrics.`,
        timestamp: "2024-01-14T15:45:10Z",
      },
    ],
    "session-3": [
      {
        id: "msg-5",
        role: "user",
        content: "What is ROIC and why does it matter?",
        timestamp: "2024-01-13T09:20:00Z",
      },
      {
        id: "msg-6",
        role: "assistant",
        content:
          "ROIC (Return on Invested Capital) measures how efficiently a company uses its capital to generate profits. It's crucial because it shows the true profitability of a business regardless of its financing structure.",
        timestamp: "2024-01-13T09:20:08Z",
      },
    ],
  };

  return messages[sessionId] || [];
};