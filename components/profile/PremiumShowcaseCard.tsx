"use client";

import { useState } from "react";
import Image from "next/image";
import { CometCard } from "@/components/ui/comet-card";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { Crown, Sparkles, Star, Zap, TrendingUp, Shield, Share2, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

interface PremiumShowcaseCardProps {
  user: User;
  displayName: string;
}

export function PremiumShowcaseCard({ user, displayName }: PremiumShowcaseCardProps) {
  const name = displayName || user.email?.split("@")[0] || "Premium User";
  const [copied, setCopied] = useState(false);
  
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/showcase/${user.id}?tier=premium`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  return (
    <CometCard className="w-full max-w-sm mx-auto">
      <div
        className="relative w-full rounded-[16px] border-0 bg-gradient-to-br from-amber-600 via-amber-500 to-yellow-600 p-1 shadow-2xl"
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* Inner card with gradient background */}
        <div className="relative overflow-hidden rounded-[14px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
          {/* Gold sparkle particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[10%] left-[15%] w-1 h-1 bg-amber-400 rounded-full animate-ping" style={{animationDelay: '0s'}}></div>
            <div className="absolute top-[25%] right-[20%] w-1.5 h-1.5 bg-yellow-300 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
            <div className="absolute bottom-[30%] left-[25%] w-1 h-1 bg-amber-300 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
            <div className="absolute bottom-[15%] right-[15%] w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping" style={{animationDelay: '1.5s'}}></div>
            <div className="absolute top-[40%] right-[10%] w-1 h-1 bg-amber-500 rounded-full animate-ping" style={{animationDelay: '2s'}}></div>
          </div>
          {/* Brand Logo */}
          <div className="absolute top-4 left-4 z-10">
            <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-amber-500/30">
              <Image
                src="/logo/mv360_logo.png"
                alt="MarketView360"
                width={20}
                height={20}
                className="rounded-sm"
              />
              <span className="text-xs font-semibold text-amber-400 tracking-wide">MARKETVIEW360</span>
            </div>
          </div>

          {/* Animated background stars */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 left-4 animate-pulse">
              <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
            </div>
            <div className="absolute top-8 right-8 animate-pulse delay-100">
              <Star className="h-2 w-2 text-yellow-400 fill-yellow-400" />
            </div>
            <div className="absolute bottom-12 left-12 animate-pulse delay-200">
              <Star className="h-2.5 w-2.5 text-amber-300 fill-amber-300" />
            </div>
            <div className="absolute bottom-6 right-6 animate-pulse delay-300">
              <Sparkles className="h-3 w-3 text-yellow-300" />
            </div>
          </div>

          {/* Premium header */}
          <div className="relative z-10 mb-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 px-4 py-2 border border-amber-400/30">
              <Crown className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-bold text-amber-400 tracking-wider uppercase">
                Premium Member
              </span>
              <Sparkles className="h-4 w-4 text-yellow-400" />
            </div>
          </div>

          {/* User avatar and info */}
          <div className="relative z-10 flex flex-col items-center mb-6">
            <div className="relative mb-4">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 blur-xl opacity-50 animate-pulse"></div>
              <UserAvatar 
                user={user} 
                size="lg" 
                className="relative h-24 w-24 text-2xl ring-4 ring-amber-500/50 shadow-2xl" 
              />
            </div>
            <h3 className="text-2xl font-bold text-white mb-1 tracking-tight">
              {name}
            </h3>
            <p className="text-sm text-amber-200/80 font-medium">
              {user.email}
            </p>
          </div>

          {/* Premium features showcase */}
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-amber-900/30 to-transparent border border-amber-500/20">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20">
                <Zap className="h-4 w-4 text-amber-400" />
              </div>
              <span className="text-sm font-medium text-white">Unlimited AI Chat</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-amber-900/30 to-transparent border border-amber-500/20">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20">
                <TrendingUp className="h-4 w-4 text-amber-400" />
              </div>
              <span className="text-sm font-medium text-white">Advanced Analytics</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-amber-900/30 to-transparent border border-amber-500/20">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20">
                <Shield className="h-4 w-4 text-amber-400" />
              </div>
              <span className="text-sm font-medium text-white">Priority Support</span>
            </div>
          </div>

          {/* Footer with share button */}
          <div className="relative z-10 mt-6 pt-6 border-t border-amber-500/20">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-amber-300/80 tracking-wide uppercase">
                Elite Trading Experience
              </p>
              <Button
                onClick={handleShare}
                size="sm"
                className="bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 h-8 gap-2"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span className="text-xs">Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-3.5 w-3.5" />
                    <span className="text-xs">Share</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Animated gradient border glow */}
        <div className="absolute -inset-[1px] rounded-[16px] bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 opacity-75 blur-sm animate-pulse"></div>
      </div>
    </CometCard>
  );
}
