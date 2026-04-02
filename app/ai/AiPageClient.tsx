"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Sidebar } from "./components/Sidebar";
import { ChatArea, Message } from "./components/ChatArea";
import { MessageInput } from "./components/MessageInput";
import { ModelSelector } from "./components/ModelSelector";
import { LoginRequired } from "./components/LoginRequired";
import { PremiumRequired } from "./components/PremiumRequired";
import { SuggestionSidebar, SuggestionSidebarToggle } from "./components/SuggestionSidebar";
import { PanelLeftOpen, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/providers/AuthProvider";
import { useChatSession } from "@/lib/hooks/useChatSession";
import { useChatStream } from "@/lib/hooks/useChatStream";
import { useQuota } from "@/hooks/useQuota";
import { useAIAccess } from "@/hooks/useAIAccess";
import { useToolsConfig } from "@/hooks/useToolsConfig";
import { AIApiError } from "@/lib/api/ai";
import { useAiFeatureFlag } from "@/hooks/useAiFeatureFlag";
import { AiUnavailable } from "./AiUnavailable";

// AI chat is now PREMIUM ONLY - anonymous access disabled
const ALLOW_ANONYMOUS_CHAT = false;

// Feature flag: Enable AI suggestions sidebar.
// Default: true (if unset). Set NEXT_PUBLIC_ENABLE_AI_SUGGESTIONS=false to disable.
const ENABLE_SUGGESTIONS =
  process.env.NEXT_PUBLIC_ENABLE_AI_SUGGESTIONS !== "false";

// Inner component that receives search params as props (no useSearchParams call here)
function AiPageClientContent({
  urlSessionId,
  watchlistParam,
}: {
  urlSessionId: string | null;
  watchlistParam: string | null;
}) {
  const { session, loading: isAuthLoading } = useAuth();
  const token = session?.access_token ?? null;

  // Check PostHog feature flag for AI availability
  const { isEnabled: isAiEnabled, isLoading: isFlagLoading } = useAiFeatureFlag();

  // Premium-only access check
  const { access: aiAccess, loading: accessLoading, refetch: refetchAccess } = useAIAccess(token);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gpt-oss");
  const [isReasoningEnabled, setIsReasoningEnabled] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [anonymousMessageCount, setAnonymousMessageCount] = useState(0);
  const [watchlistContextProcessed, setWatchlistContextProcessed] = useState(false);

  // Tools configuration (persisted in localStorage, syncs with settings page)
  const { config: toolsConfig, setToolsEnabled, setToolEnabled, isToolsActive } = useToolsConfig();

  // Disable reasoning if user logs out
  useEffect(() => {
    if (!token) {
      setIsReasoningEnabled(false);
    }
  }, [token]);

  // Refetch AI access when token changes
  useEffect(() => {
    if (!token) return;
    void refetchAccess();
  }, [token, refetchAccess]);

  // Use real hooks with URL session ID
  const {
    sessions,
    activeSessionId,
    loadingSessions,
    handleSelectSession,
    handleNewChat,
    handleDeleteSession,
    handleRenameSession,
    addSession,
  } = useChatSession(token, urlSessionId);

  const {
    messages: chatMessages,
    isStreaming,
    sendMessage,
    cancelStream,
    clearMessages,
  } = useChatStream(token, activeSessionId);

  // Real-time quota tracking
  const { quota, refetch: refetchQuota, canUse } = useQuota(token);

  // On first load (or after auth resolves), force a fresh quota fetch so the bar
  // updates immediately without requiring a user interaction.
  useEffect(() => {
    if (!token) return;
    void refetchQuota();
  }, [token, refetchQuota]);

  // If reasoning quota is exhausted, automatically turn off reasoning mode.
  useEffect(() => {
    if (isReasoningEnabled && quota && quota.reasoning.remaining <= 0) {
      setIsReasoningEnabled(false);
    }
  }, [isReasoningEnabled, quota]);

  // 20% quota warning - show warning when tokens fall below 10,000 (20% of 50K)
  // Only for premium users (free users have 0 limit and shouldn't see warnings)
  useEffect(() => {
    if (!quota || !quota.tokens || quota.tier === "free") return;

    const threshold = Math.floor(quota.tokens.limit * 0.2); // 20% of limit
    const remaining = quota.tokens.remaining;

    // Only warn once when crossing the threshold
    if (remaining <= threshold && remaining > threshold - 1000) {
      toast.warning("Low token warning", {
        description: `You have less than 20% of your AI tokens remaining (${remaining.toLocaleString()} / ${quota.tokens.limit.toLocaleString()}). When exhausted, your quota will reset in 12 hours.`,
        duration: 8000,
      });
    }
  }, [quota]);

  const handleReasoningChange = useCallback(
    (enabled: boolean) => {
      if (enabled && quota && quota.reasoning.remaining <= 0) {
        toast.error("Reasoning quota exceeded", {
          description: `You've used all ${quota.reasoning.limit} reasoning messages. Your quota will reset in 12 hours.`,
        });
        setIsReasoningEnabled(false);
        return;
      }

      setIsReasoningEnabled(enabled);
    },
    [quota],
  );

  const wasStreamingRef = useRef(false);

  const refreshQuotaSoon = useCallback(async () => {
    // Short delay to let backend finish recording usage, then fetch fresh quota
    await new Promise(r => setTimeout(r, 300));
    await refetchQuota();
    // One more retry after 2s in case DB write was slow
    setTimeout(() => {
      void refetchQuota();
    }, 2000);
  }, [refetchQuota]);

  // When a stream finishes, refresh quota so the quota bar updates without needing a page refresh.
  useEffect(() => {
    const wasStreaming = wasStreamingRef.current;
    if (wasStreaming && !isStreaming && token) {
      void refreshQuotaSoon();
    }
    wasStreamingRef.current = isStreaming;
  }, [isStreaming, token, refreshQuotaSoon]);

  // Convert chat messages to the Message format expected by ChatArea
  const messages: Message[] = chatMessages.map((msg) => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    timestamp: new Date(msg.timestamp),
    model: selectedModel,
    isReasoning: msg.reasoning ? true : false,
    reasoning: msg.reasoning,
    isStreaming: msg.isStreaming,
    toolCalls: msg.toolCalls,
    toolStatus: msg.toolStatus,
    isWatchlistAnalysis: msg.isWatchlistAnalysis,
    metrics: msg.metrics,
  }));

  useEffect(() => {
    const hours = new Date().getHours();

    let timeGreeting = "Good morning";
    if (hours >= 12 && hours < 17) {
      timeGreeting = "Good afternoon";
    } else if (hours >= 17 || hours < 5) {
      timeGreeting = "Good evening";
    }

    const financeGreetings = [
      "Ready to beat the market?",
      "What's on your portfolio today?",
      "Seeking the next alpha?",
      "Planning your next move?",
      "Watching any key stocks today?",
      "Keeping an eye on the markets?",
      "Looking for the next opportunity?",
      "Tracking your positions today?",
      "Reviewing your investments?",
      "Following today's market moves?",
      "Spotting trends before they move?",
      "Monitoring your watchlist?",
      "Evaluating risk and reward?",
      "Checking how the market's behaving?",
    ];

    const randomGreeting =
      financeGreetings[Math.floor(Math.random() * financeGreetings.length)];

    const finalGreeting = `${timeGreeting} Investor, ${randomGreeting}`;

    setGreeting(finalGreeting);
  }, []);

  const handleSendMessage = useCallback(
    async (content: string, contextData?: { watchlistName: string; context: string; isWatchlistAnalysis?: boolean }) => {
      // Prevent sending while streaming
      if (isStreaming) {
        toast.warning("Please wait for the current response to complete");
        return;
      }

      // For watchlist analysis: send system context + user message to AI, but display only user message
      // The system context is prepended but hidden from the chat display
      const messageContent = contextData?.context ? `${contextData.context}\n\n${content}` : content;
      const displayContent = content; // This is what gets shown in chat

      // Anonymous user: strict 2 message limit, no reasoning, no tools
      if (!token) {
        if (anonymousMessageCount >= 2) {
          toast.error("Message limit reached", {
            description: "Please sign in to continue chatting.",
          });
          return;
        }

        // Send anonymous message (backend enforces limits too)
        try {
          const { aiApi } = await import("@/lib/api/ai");
          await aiApi.sendAnonymousMessage([{ role: "user", content }]);
          setAnonymousMessageCount((prev) => prev + 1);
        } catch (error) {
          console.error("Anonymous message failed:", error);
          if (error instanceof AIApiError) {
            if (error.isQuotaError()) {
              toast.error("Anonymous chat limit reached", {
                description: "Please sign in to continue.",
              });
            } else {
              toast.error(error.message);
            }
          }
        }
        return;
      }

      // Authenticated user: Check quota before sending
      if (quota) {
        // Free users should be blocked by PremiumRequired screen, but double-check here
        if (quota.tier === "free") {
          toast.error("Premium required", {
            description: "AI chat is exclusively available to Premium subscribers.",
          });
          return;
        }

        // Check token quota for standard messages
        if (!isReasoningEnabled && !canUse("tokens")) {
          toast.error("Token quota exceeded", {
            description: `You've used all ${quota.tokens.limit.toLocaleString()} tokens. Your quota will reset in 12 hours.`,
          });
          return;
        }

        // Check reasoning quota
        if (isReasoningEnabled && !canUse("reasoning")) {
          toast.error("Reasoning quota exceeded", {
            description: `You've used all ${quota.reasoning.limit} reasoning messages. Your quota will reset in 12 hours.`,
          });
          return;
        }
      }

      // Send message
      try {
        console.log(`[AiPageClient] Sending message with enableTools=${isToolsActive}, reasoning=${isReasoningEnabled}`);
        await sendMessage(messageContent, {
          reasoning: isReasoningEnabled,
          enableTools: isToolsActive,
          displayContent: contextData ? content : undefined, // Show only user's question, not system context
          isWatchlistAnalysis: contextData?.isWatchlistAnalysis,
          onSessionCreated: (id, title) => {
            addSession({
              id,
              title: title || (contextData ? `${contextData.watchlistName} Analysis` : content.slice(0, 50) + (content.length > 50 ? "..." : "")),
              created_at: new Date().toISOString(),
            });
          },
        });
      } catch (error) {
        console.error("Message send failed:", error);
        if (error instanceof AIApiError) {
          if (error.isQuotaError()) {
            toast.error("Quota exceeded", {
              description: "You've reached your usage limit. Please wait for the next reset or upgrade your plan.",
            });
            // Refresh quota to show updated state
            await refreshQuotaSoon();
          } else {
            toast.error("Failed to send message", {
              description: error.message,
            });
          }
        }
      }
    },
    [
      token,
      anonymousMessageCount,
      isStreaming,
      isReasoningEnabled,
      quota,
      canUse,
      sendMessage,
      addSession,
      refreshQuotaSoon,
    ],
  );

  const handleNewChatClick = useCallback(() => {
    handleNewChat();
    clearMessages();
  }, [handleNewChat, clearMessages]);

  // Handle watchlist context from sessionStorage (sent from watchlist page)
  useEffect(() => {
    if (watchlistParam && !watchlistContextProcessed && token && !isStreaming) {
      const contextData = sessionStorage.getItem('ai_watchlist_context');
      if (contextData) {
        try {
          const parsed = JSON.parse(contextData);
          const now = Date.now();
          
          // Only use context if it's recent (within 30 seconds)
          if (parsed.timestamp && (now - parsed.timestamp) < 30000) {
            // Clear the context from sessionStorage
            sessionStorage.removeItem('ai_watchlist_context');
            
            // Auto-send the message with hidden system context
            setWatchlistContextProcessed(true);
            
            // New format: systemContext is hidden, userMessage is displayed
            const systemContext = parsed.systemContext || parsed.context;
            const userMessage = parsed.userMessage || parsed.message;
            
            void handleSendMessage(userMessage, {
              watchlistName: parsed.watchlistName,
              context: systemContext,
              isWatchlistAnalysis: parsed.isWatchlistAnalysis,
            });
          }
        } catch (err) {
          console.error('Failed to parse watchlist context:', err);
        }
      }
    }
  }, [watchlistParam, watchlistContextProcessed, token, isStreaming, handleSendMessage]);

  // Show loading spinner while checking auth, AI access, and feature flag
  if (isAuthLoading || accessLoading || isFlagLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white dark:bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Check PostHog feature flag - if AI is disabled, show unavailable message
  if (!isAiEnabled) {
    return <AiUnavailable />;
  }

  // Show login required page if anonymous chat is disabled and user is not logged in
  // AI chat is now premium-only - show login for unauthenticated users
  if (!ALLOW_ANONYMOUS_CHAT && !token) {
    return <LoginRequired />;
  }

  // Check if user has AI access (premium required)
  if (token && aiAccess && !aiAccess.allowed) {
    return (
      <PremiumRequired
        reason={aiAccess.reason}
        cooldownUntil={aiAccess.cooldownInfo?.until}
        resetsAt={aiAccess.cooldownInfo?.resetsAt}
      />
    );
  }

  return (
    <TooltipProvider delayDuration={200} skipDelayDuration={300}>
      <div className="flex h-full w-full bg-white dark:bg-slate-950 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        sessions={sessions}
        activeSessionId={activeSessionId}
        loadingSessions={loadingSessions}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChatClick}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        tier={(session as any)?.tier}
        quota={quota}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-white dark:bg-slate-950 relative">
        {/* Header / Top Bar */}
        <header className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 gap-4 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm z-20 relative">
          <div className="flex items-center gap-2">
            {!isSidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(true)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title="Open sidebar"
              >
                <PanelLeftOpen className="w-5 h-5" />
              </Button>
            )}
            <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100 hidden md:block">
              {activeSessionId ? (
                (() => {
                  const activeSession = sessions.find((s) => s.id === activeSessionId);
                  if (activeSession?.titleGenerating) {
                    return (
                      <span className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-pulse" />
                        <span className="text-slate-400 dark:text-slate-500">Generating title...</span>
                      </span>
                    );
                  }
                  return activeSession?.title || "AI Chat";
                })()
              ) : (
                "AI Chat"
              )}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {isStreaming && (
              <Button
                variant="outline"
                size="sm"
                onClick={cancelStream}
                className="gap-2"
              >
                <StopCircle className="w-4 h-4" />
                Stop
              </Button>
            )}
            <ModelSelector
              selectedModelId={selectedModel}
              onModelChange={setSelectedModel}
              isReasoningEnabled={isReasoningEnabled}
              onReasoningChange={handleReasoningChange}
              toolsConfig={toolsConfig}
              onToolsEnabledChange={setToolsEnabled}
              onToolToggle={setToolEnabled}
              disabled={isStreaming}
            />
          </div>
        </header>

        {/* Chat Area / Welcome Screen */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {messages.length === 0 ? (
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="h-full flex flex-col items-center justify-center p-4 md:p-8 animate-in fade-in duration-700">
                <div className="max-w-2xl w-full space-y-8 text-center">
                  <div className="space-y-3">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                      {greeting}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">
                      Ask me anything about stocks, screening, or market analysis.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <ChatArea messages={messages} />
          )}
        </div>

        {/* Input */}
        <div className="border-t border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-950 shrink-0">
          <MessageInput
            onSendMessage={handleSendMessage}
            onContextSelect={() => {}}
            disabled={isStreaming}
          />
        </div>

        {/* Suggestion Toggle */}
        {ENABLE_SUGGESTIONS && !isSuggestionOpen && (
          <SuggestionSidebarToggle onClick={() => setIsSuggestionOpen(true)} />
        )}
      </div>

      {/* Suggestion Sidebar */}
      <SuggestionSidebar
        isOpen={isSuggestionOpen}
        onToggle={() => setIsSuggestionOpen(false)}
        onSuggestionClick={handleSendMessage}
        className="hidden lg:flex"
      />
      </div>
    </TooltipProvider>
  );
}

// Wrapper component that handles useSearchParams() - this triggers Suspense
export default function AiPageClient() {
  const searchParams = useSearchParams();
  const urlSessionId = searchParams?.get("session") ?? null;
  const watchlistParam = searchParams?.get("watchlist") ?? null;

  return <AiPageClientContent urlSessionId={urlSessionId} watchlistParam={watchlistParam} />;
}
