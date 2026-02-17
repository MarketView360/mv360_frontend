"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Sidebar } from "./components/Sidebar";
import { ChatArea, Message } from "./components/ChatArea";
import { MessageInput } from "./components/MessageInput";
import { ModelSelector } from "./components/ModelSelector";
import { LoginRequired } from "./components/LoginRequired";
import { SuggestionSidebar, SuggestionSidebarToggle } from "./components/SuggestionSidebar";
import { PanelLeftOpen, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/providers/AuthProvider";
import { useChatSession } from "@/lib/hooks/useChatSession";
import { useChatStream } from "@/lib/hooks/useChatStream";
import { useQuota } from "@/hooks/useQuota";
import { useToolsConfig } from "@/hooks/useToolsConfig";
import { AIApiError } from "@/lib/api/ai";

// Feature flag: Allow anonymous users to access AI chat.
// Default: true (if unset). Set NEXT_PUBLIC_ALLOW_ANONYMOUS_AI_CHAT=false to require login.
const ALLOW_ANONYMOUS_CHAT =
  process.env.NEXT_PUBLIC_ALLOW_ANONYMOUS_AI_CHAT !== "false";

// Feature flag: Enable AI suggestions sidebar.
// Default: true (if unset). Set NEXT_PUBLIC_ENABLE_AI_SUGGESTIONS=false to disable.
const ENABLE_SUGGESTIONS =
  process.env.NEXT_PUBLIC_ENABLE_AI_SUGGESTIONS !== "false";

export default function AiPageClient() {
  const searchParams = useSearchParams();
  const urlSessionId = searchParams.get("session");

  const { session, loading: isAuthLoading } = useAuth();
  const token = session?.access_token ?? null;

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gpt-oss");
  const [isReasoningEnabled, setIsReasoningEnabled] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [anonymousMessageCount, setAnonymousMessageCount] = useState(0);

  // Tools configuration (persisted in localStorage, syncs with settings page)
  const { config: toolsConfig, setToolsEnabled, setToolEnabled, isToolsActive } = useToolsConfig();

  // Disable reasoning if user logs out
  useEffect(() => {
    if (!token) {
      setIsReasoningEnabled(false);
    }
  }, [token]);

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

  const handleReasoningChange = useCallback(
    (enabled: boolean) => {
      if (enabled && quota && quota.reasoning.remaining <= 0) {
        const tier = quota.tier === "free" ? "Free" : "Premium";
        toast.error("Reasoning quota exceeded", {
          description: `You've used all ${quota.reasoning.limit} reasoning messages for this period. ${tier === "Free" ? "Upgrade to Premium for 10 reasoning messages per 12 hours, or wait for the next reset." : "Your quota will reset soon."}`,
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
    // 1) immediate
    await refetchQuota();
    // 2) small delayed retry (DB write may lag end-of-stream by a moment)
    setTimeout(() => {
      void refetchQuota();
    }, 700);
    // 3) another retry for slower DB commits / network
    setTimeout(() => {
      void refetchQuota();
    }, 1500);
    // 4) additional retries for slow DB commit paths
    setTimeout(() => {
      void refetchQuota();
    }, 3000);
    setTimeout(() => {
      void refetchQuota();
    }, 6000);
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
    async (content: string) => {
      // Prevent sending while streaming
      if (isStreaming) {
        toast.warning("Please wait for the current response to complete");
        return;
      }

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
        // Check token quota for standard messages
        if (!isReasoningEnabled && !canUse("tokens")) {
          const tier = quota.tier === "free" ? "Free" : "Premium";
          toast.error("Token quota exceeded", {
            description: `You've used all your tokens for this period. ${tier === "Free" ? "Upgrade to Premium for 300K tokens per 12 hours, or wait for the next reset." : "Your quota will reset soon."}`,
          });
          return;
        }

        // Check reasoning quota
        if (isReasoningEnabled && !canUse("reasoning")) {
          const tier = quota.tier === "free" ? "Free" : "Premium";
          toast.error("Reasoning quota exceeded", {
            description: `You've used all ${quota.reasoning.limit} reasoning messages for this period. ${tier === "Free" ? "Upgrade to Premium for 10 reasoning messages per 12 hours, or wait for the next reset." : "Your quota will reset soon."}`,
          });
          return;
        }
      }

      // Send message
      try {
        console.log(`[AiPageClient] Sending message with enableTools=${isToolsActive}, reasoning=${isReasoningEnabled}`);
        await sendMessage(content, {
          reasoning: isReasoningEnabled,
          enableTools: isToolsActive,
          onSessionCreated: (id, title) => {
            addSession({
              id,
              title: title || content.slice(0, 50) + (content.length > 50 ? "..." : ""),
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

  // Show login required page if anonymous chat is disabled and user is not logged in
  // Also show loading spinner while checking auth
  if (isAuthLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white dark:bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!ALLOW_ANONYMOUS_CHAT && !token) {
    return <LoginRequired />;
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
