"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { ChatArea, Message } from "./components/ChatArea";
import { MessageInput } from "./components/MessageInput";
import { ModelSelector } from "./components/ModelSelector";
import { Menu, TrendingUp, Search, PieChart, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AiPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedModel, setSelectedModel] = useState("auto");
  const [isReasoningEnabled, setIsReasoningEnabled] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [greeting, setGreeting] = useState("");

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
    "What’s on your portfolio today?",
    "Seeking the next alpha?",
    "Planning your next move?",
    "Watching any key stocks today?",
    "Keeping an eye on the markets?",
    "Looking for the next opportunity?",
    "Tracking your positions today?",
    "Reviewing your investments?",
    "Following today’s market moves?",
    "Spotting trends before they move?",
    "Monitoring your watchlist?",
    "Evaluating risk and reward?",
    "Thinking long-term or short-term today?",
    "Checking how the market’s behaving?"
  ];

  const randomGreeting =
    financeGreetings[Math.floor(Math.random() * financeGreetings.length)];

  const finalGreeting = `${timeGreeting} Investor, ${randomGreeting}`;

  setGreeting(finalGreeting);
}, []);

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, newMessage]);

    // Mock response after a delay
    setTimeout(() => {
        const responseMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "This is a mock response. In a real application, I would process your request using the selected model (" + selectedModel + ") and provide a detailed financial analysis.",
            timestamp: new Date(),
            model: selectedModel,
            isReasoning: isReasoningEnabled
        };
        setMessages((prev) => [...prev, responseMessage]);
    }, 1500);
  };

  return (
    <div className="flex h-full w-full bg-white dark:bg-slate-950 overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
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
