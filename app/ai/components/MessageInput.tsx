"use client";

import React, { useRef, useState } from "react";
import { Paperclip, CircleChevronUp, Mic, Globe, Image as ImageIcon, SquareArrowUp, CornerRightUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  className?: string;
  disabled?: boolean;
}

export function MessageInput({ onSendMessage, className, disabled = false }: MessageInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!input.trim()) return;
    onSendMessage(input);
    setInput("");
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  return (
    <div className={cn("relative max-w-3xl mx-auto w-full", className)}>
      <div className="relative flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all duration-200">
        
        {/* Text Area */}
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            adjustTextareaHeight();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about finance, markets, or stocks..."
          className="min-h-[60px] max-h-[200px] w-full resize-none border-none bg-transparent px-4 py-4 focus-visible:ring-0 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 disabled:opacity-50"
          rows={1}
          disabled={disabled}
        />

        {/* Toolbar */}
        <div className="flex items-center justify-between px-2 pb-2 mt-2">
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Attach file</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <ImageIcon className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Upload image</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <Globe className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Search web</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex items-center gap-2">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full">
                            <Mic className="w-4 h-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Voice input</TooltipContent>
                </Tooltip>
            </TooltipProvider>
            
            <Button 
                onClick={handleSubmit} 
                disabled={!input.trim() || disabled}
                className={cn(
                    "h-8 w-8 rounded-lg p-0 transition-all duration-200",
                    input.trim() && !disabled
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
                        : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                )}
            >
              <CornerRightUp className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="text-center mt-2">
        <p className="text-[10px] text-slate-400 dark:text-slate-500">
            AI can make mistakes. Please verify important financial information.
        </p>
      </div>
    </div>
  );
}
