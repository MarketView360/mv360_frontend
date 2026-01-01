"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Sidebar } from "./components/Sidebar";
import { ChatArea, Message } from "./components/ChatArea";
import { MessageInput } from "./components/MessageInput";
import { ModelSelector } from "./components/ModelSelector";
import { LoginRequired } from "./components/LoginRequired";
import { Menu, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useChatSession } from "@/lib/hooks/useChatSession";
import { useChatStream } from "@/lib/hooks/useChatStream";
import { useReasoningQuota } from "@/lib/hooks/useReasoningQuota";
import { AIApiError } from "@/lib/api/ai";

// Feature flag: Allow anonymous users to access AI chat.
// Default: true (if unset). Set NEXT_PUBLIC_ALLOW_ANONYMOUS_AI_CHAT=false to require login.
const ALLOW_ANONYMOUS_CHAT =
  process.env.NEXT_PUBLIC_ALLOW_ANONYMOUS_AI_CHAT !== "false";

export default function AiPage() {
  const searchParams = useSearchParams();
  const urlSessionId = searchParams.get("session");
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedModel, setSelectedModel] = useState("gpt");
  const [isReasoningEnabled, setIsReasoningEnabled] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [anonymousMessageCount, setAnonymousMessageCount] = useState(0);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Get auth token
  useEffect(() => {
    const supabase = createClient();
    
    const getToken = async () => {
      const { data } = await supabase.auth.getSession();
      setToken(data.session?.access_token || null);
      
      // Disable reasoning if user logs out
      if (!data.session) {
        setIsReasoningEnabled(false);
      }
      
      // Auth check complete
      setIsAuthLoading(false);
    };
    
    getToken();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setToken(session?.access_token || null);
      
      // Disable reasoning if user logs out
      if (!session) {
        setIsReasoningEnabled(false);
      }
      
      // Auth check complete
      setIsAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

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
    toolInUse,
    sendMessage,
    cancelStream,
    clearMessages,
  } = useChatStream(token, activeSessionId);

  const {
    canUseReasoning,
    remainingReasoning,
    fetchReasoningQuota,
  } = useReasoningQuota(token);

  // Convert chat messages to the Message format expected by ChatArea
  const messages: Message[] = chatMessages.map((msg) => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    timestamp: new Date(msg.timestamp),
    model: selectedModel,
    isReasoning: msg.reasoning ? true : false,
    isStreaming: msg.isStreaming,
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
      "Checking how the market's behaving?"
    ];

    const randomGreeting =
      financeGreetings[Math.floor(Math.random() * financeGreetings.length)];

    const finalGreeting = `${timeGreeting} Investor, ${randomGreeting}`;

    setGreeting(finalGreeting);
  }, []);

  const handleSendMessage = useCallback(async (content: string) => {
    // Prevent sending while streaming
    if (isStreaming) {
      toast.warning("Please wait for the current response to complete");
      return;
    }

    // Check reasoning quota before sending
    if (isReasoningEnabled && !canUseReasoning) {
      toast.error("Reasoning quota exceeded", {
        description: `You've used all ${remainingReasoning}/3 reasoning messages today. Try again tomorrow or upgrade to premium.`,
      });
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
        setAnonymousMessageCount(prev => prev + 1);
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

    // Authenticated user: full features
    const result = await sendMessage(content, {
      reasoning: isReasoningEnabled && canUseReasoning,
      onSessionCreated: (id, title) => {
        addSession({
          id,
          title: title || content.slice(0, 50) + (content.length > 50 ? "..." : ""),
          created_at: new Date().toISOString(),
        });
      },
    });

    // Refresh reasoning quota after using it
    if (isReasoningEnabled && result.sessionId) {
      // Force refresh to get updated quota
      setTimeout(() => fetchReasoningQuota(true), 1000);
    }
  }, [token, anonymousMessageCount, isStreaming, sendMessage, isReasoningEnabled, canUseReasoning, remainingReasoning, addSession, fetchReasoningQuota]);

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
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-white dark:bg-slate-950 relative">
        
        {/* Header / Top Bar */}
        <header className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 gap-4 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm z-20 relative">
            <div className="flex items-center gap-2">
                {!isSidebarOpen && (
                    <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="md:hidden">
                        <Menu className="w-5 h-5" />
                    </Button>
                )}
                {!isSidebarOpen && (
                    <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="hidden md:flex">
                        <Menu className="w-5 h-5" />
                    </Button>
                )}
                <ModelSelector 
                    selectedModelId={selectedModel} 
                    onModelChange={setSelectedModel}
                    isReasoningEnabled={isReasoningEnabled}
                    onReasoningChange={setIsReasoningEnabled}
                    reasoningLabel="Reasoning"
                    disabled={!canUseReasoning && isReasoningEnabled}
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
                                <p className="text-slate-500 dark:text-slate-400 text-lg">
                                    I can help you with most out of Marketview360
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-hidden relative">
                    <ChatArea messages={messages} />
                </div>
            )}
            
            {/* Input Area */}
            <div className="shrink-0 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4">
                <div className="max-w-3xl mx-auto">
                  {/* Tool indicator */}
                  {toolInUse && (
                    <div className="mb-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <span className="animate-pulse">●</span>
                      {toolInUse === "web_search" && "Searching the web..."}
                      {toolInUse === "visit_website" && "Visiting website..."}
                      {toolInUse === "calculator" && "Calculating..."}
                    </div>
                  )}
                  
                  {/* Cancel button during streaming */}
                  {isStreaming && (
                    <div className="mb-2 flex justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={cancelStream}
                        className="text-xs gap-1"
                      >
                        <StopCircle className="w-3 h-3" />
                        Stop generating
                      </Button>
                    </div>
                  )}
                  
                  <MessageInput 
                    onSendMessage={handleSendMessage} 
                    disabled={isStreaming}
                  />
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}
