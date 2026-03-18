"use client";

import { useState } from "react";
import Image from "next/image";
import { CometCard } from "@/components/ui/comet-card";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { Crown, Star, Layers, TrendingUp, Bookmark, Calendar, Share2, Check, Infinity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

interface MaxShowcaseCardProps {
  user: User;
  displayName: string;
  stats?: {
    watchlistsCount: number;
    stocksTracked: number;
    savedScreensCount: number;
    memberSince: string;
  };
}

export function MaxShowcaseCard({ user, displayName, stats }: MaxShowcaseCardProps) {
  const name = displayName || user.email?.split("@")[0] || "Max User";
  const [copied, setCopied] = useState(false);
  
  const memberSince = stats?.memberSince 
    ? new Date(stats.memberSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Recently';
  
  const watchlistsCount = stats?.watchlistsCount ?? 0;
  const stocksTracked = stats?.stocksTracked ?? 0;
  const savedScreensCount = stats?.savedScreensCount ?? 0;
  
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/showcase/${user.id}?tier=max`;
    
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
        className="relative w-full rounded-[16px] border-0 bg-gradient-to-br from-purple-600 via-violet-600 to-fuchsia-600 p-1 shadow-2xl"
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* Inner card with gradient background */}
        <div className="relative overflow-hidden rounded-[14px] bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 dark:from-slate-900 dark:via-purple-950 dark:to-slate-900 p-6">
          {/* Purple sparkle particles - subtle */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
            <div className="absolute top-[15%] left-[20%] w-1 h-1 bg-purple-400 rounded-full"></div>
            <div className="absolute top-[30%] right-[25%] w-1 h-1 bg-violet-300 rounded-full"></div>
            <div className="absolute bottom-[35%] left-[30%] w-1 h-1 bg-fuchsia-400 rounded-full"></div>
          </div>
          {/* Brand Logo */}
          <div className="absolute top-3 left-3 z-10">
            <div className="flex items-center gap-1.5 bg-slate-800/90 backdrop-blur-sm px-2.5 py-1 rounded-full border border-purple-500/30">
              <Image
                src="/logo/mv360_logo.png"
                alt="MarketView360"
                width={16}
                height={16}
                className="rounded-sm"
              />
              <span className="text-[10px] font-semibold text-purple-400 tracking-wide">MARKETVIEW360</span>
            </div>
          </div>

          {/* Background stars - subtle */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-6 left-6">
              <Star className="h-2.5 w-2.5 text-purple-400 fill-purple-400" />
            </div>
            <div className="absolute top-10 right-10">
              <Star className="h-2 w-2 text-violet-400 fill-violet-400" />
            </div>
            <div className="absolute bottom-14 left-14">
              <Star className="h-2 w-2 text-fuchsia-300 fill-fuchsia-300" />
            </div>
          </div>

          {/* Max header with infinity symbol */}
          <div className="relative z-10 mb-6 mt-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500/20 to-fuchsia-500/20 px-4 py-2 border border-purple-400/30">
              <Crown className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-bold text-purple-400 tracking-wider uppercase">
                Max Member
              </span>
              <Infinity className="h-4 w-4 text-fuchsia-400" />
            </div>
          </div>

          {/* User avatar and info */}
          <div className="relative z-10 flex flex-col items-center mb-6">
            <div className="relative mb-4">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 blur-lg opacity-30"></div>
              <UserAvatar 
                user={user} 
                size="lg" 
                className="relative h-24 w-24 text-2xl ring-4 ring-purple-500/50 shadow-2xl" 
              />
            </div>
            <h3 className="text-2xl font-bold text-white mb-1 tracking-tight">
              {name}
            </h3>
            <p className="text-sm text-purple-200/80 font-medium">
              {user.email}
            </p>
          </div>

          {/* Portfolio Stats */}
          <div className="relative z-10 space-y-2">
            <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-900/30 to-transparent border border-purple-500/20">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/20">
                  <Layers className="h-4 w-4 text-purple-400" />
                </div>
                <span className="text-sm font-medium text-white">Watchlists</span>
              </div>
              <span className="text-sm font-bold text-purple-400">{watchlistsCount}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-900/30 to-transparent border border-purple-500/20">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/20">
                  <TrendingUp className="h-4 w-4 text-purple-400" />
                </div>
                <span className="text-sm font-medium text-white">Stocks Tracked</span>
              </div>
              <span className="text-sm font-bold text-purple-400">{stocksTracked}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-900/30 to-transparent border border-purple-500/20">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/20">
                  <Bookmark className="h-4 w-4 text-purple-400" />
                </div>
                <span className="text-sm font-medium text-white">Saved Screens</span>
              </div>
              <span className="text-sm font-bold text-purple-400">{savedScreensCount}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-900/30 to-transparent border border-purple-500/20">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/20">
                  <Calendar className="h-4 w-4 text-purple-400" />
                </div>
                <span className="text-sm font-medium text-white">Member Since</span>
              </div>
              <span className="text-sm font-bold text-purple-400">{memberSince}</span>
            </div>
          </div>

          {/* Footer with share button */}
          <div className="relative z-10 mt-6 pt-6 border-t border-purple-500/20">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-purple-300/80 tracking-wide uppercase">
                Max Card
              </p>
              <Button
                onClick={handleShare}
                size="sm"
                className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 h-8 gap-2"
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

        {/* Subtle gradient border */}
        <div className="absolute -inset-[1px] rounded-[16px] bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-500 opacity-50 blur-[2px]"></div>
      </div>
    </CometCard>
  );
}
