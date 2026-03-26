"use client";

import React from "react";
import { Crown, MessageSquare, Zap, TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface UpgradeDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UpgradeDialog({ isOpen, onClose }: UpgradeDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <DialogTitle className="text-xl">Upgrade to Premium</DialogTitle>
          </div>
          <DialogDescription className="text-left">
            Unlock the full power of Jovan AI and get access to more features
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg shrink-0">
              <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-medium text-sm text-slate-900 dark:text-white">Unlimited Chat History</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Access all your past conversations anytime</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg shrink-0">
              <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h4 className="font-medium text-sm text-slate-900 dark:text-white">10x Higher Usage Quota</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">100K tokens and 10 reasoning messages per 12 hours</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg shrink-0">
              <Sparkles className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="font-medium text-sm text-slate-900 dark:text-white">Advanced AI Models</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Access to latest Claude, GPT-4, and more</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg shrink-0">
              <TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h4 className="font-medium text-sm text-slate-900 dark:text-white">Deeper Analysis & Agentic Tasks</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Multi-step reasoning and advanced research capabilities</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Maybe Later
          </Button>
          <Link href="/pricing" className="flex-1">
            <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold">
              View Pricing
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
