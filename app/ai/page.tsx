"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "./components/Sidebar";
import { ChatArea, Message } from "./components/ChatArea";
import { MessageInput } from "./components/MessageInput";
import { ModelSelector } from "./components/ModelSelector";
import { LoginRequired } from "./components/LoginRequired";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useChatSession } from "@/lib/hooks/useChatSession";
import { useChatStream } from "@/lib/hooks/useChatStream";
import { useReasoningQuota } from "@/lib/hooks/useReasoningQuota";

// Feature flag: Allow anonymous users to access AI chat.
// Default: true (if unset). Set NEXT_PUBLIC_ALLOW_ANONYMOUS_AI_CHAT=false to require login.
const ALLOW_ANONYMOUS_CHAT =
  process.env.NEXT_PUBLIC_ALLOW_ANONYMOUS_AI_CHAT !== "false";

export default function AiPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedModel, setSelectedModel] = useState("auto");
  const [isReasoningEnabled, setIsReasoningEnabled] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [anonymousMessageCount, setAnonymousMessageCount] = useState(0);

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
    };
    
    getToken();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setToken(session?.access_token || null);
      
      // Disable reasoning if user logs out
      if (!session) {
        setIsReasoningEnabled(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Use real hooks
  const {
    sessions,
    activeSessionId,
    loadingSessions,
    handleSelectSession,
    handleNewChat,
    handleDeleteSession,
    addSession,
  } = useChatSession(token, null);

  const {
    messages: chatMessages,
    sendMessage,
    clearMessages,
  } = useChatStream(token, activeSessionId);

  const {
    canUseReasoning,
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
    // Anonymous user: strict 2 message limit, no reasoning, no tools
    if (!token) {
      if (anonymousMessageCount >= 2) {
        alert("You've reached the limit of 2 messages. Please sign in to continue chatting.");
        return;
      }
      
      // Send anonymous message (backend enforces limits too)
      try {
        const { aiApi } = await import("@/lib/api/ai");
        await aiApi.sendAnonymousMessage([{ role: "user", content }]);
        setAnonymousMessageCount(prev => prev + 1);
      } catch (error) {
        console.error("Anonymous message failed:", error);
        if (error instanceof Error && error.message.includes("limit")) {
          alert("Anonymous chat limit reached. Please sign in to continue.");
        }
      }
      return;
    }

    // Authenticated user: full features
    await sendMessage(content, {
      reasoning: isReasoningEnabled && canUseReasoning,
      onSessionCreated: (id) => {
        addSession({
          id,
          title: content.slice(0, 50) + (content.length > 50 ? "..." : ""),
          created_at: new Date().toISOString(),
        });
      },
    });

    if (isReasoningEnabled) {
      fetchReasoningQuota();
    }
  }, [token, anonymousMessageCount, sendMessage, isReasoningEnabled, canUseReasoning, addSession, fetchReasoningQuota]);

  const handleNewChatClick = useCallback(() => {
    handleNewChat();
    clearMessages();
  }, [handleNewChat, clearMessages]);

  // Show login required page if anonymous chat is disabled and user is not logged in
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
                <MessageInput onSendMessage={handleSendMessage} />
            </div>
        </div>

      </div>
    </div>
  );
}
