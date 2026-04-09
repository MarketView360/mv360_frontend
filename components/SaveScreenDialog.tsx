"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, AlertCircle, Sparkles, Info, CheckCircle, Infinity } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface SaveScreenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: { name: string; description?: string }) => Promise<void>;
  query: string;
  currentCount: number;
  maxAllowed: number;
  canSave: boolean;
  quotaMessage: string;
  subscriptionTier?: string;
}

export function SaveScreenDialog({
  open,
  onOpenChange,
  onSave,
  query,
  currentCount,
  maxAllowed,
  canSave,
  quotaMessage,
  subscriptionTier = "free",
}: SaveScreenDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;

    setSaving(true);
    try {
      await onSave({ name: name.trim(), description: description.trim() || undefined });
      setName("");
      setDescription("");
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to save screen:", err);
    } finally {
      setSaving(false);
    }
  };

  const isPremium = subscriptionTier === "premium" || subscriptionTier === "pro" || subscriptionTier === "elite";
  const isUnlimited = maxAllowed === -1;
  const isQuotaWarning = !isUnlimited && currentCount >= maxAllowed - 1 && canSave;
  const isQuotaReached = !isUnlimited && currentCount >= maxAllowed;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 rounded-lg bg-brand/10">
              <Save className="h-5 w-5 text-brand" />
            </div>
            Save Screen
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            Save your current query for quick access later.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Quota Info - Improved Design */}
          <div className={cn(
            "flex items-center gap-3 p-4 rounded-xl border text-sm transition-colors",
            isQuotaReached
              ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
              : isQuotaWarning
                ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                : isPremium
                  ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
                  : "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
          )}>
            {isQuotaReached ? (
              <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/50">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
            ) : isQuotaWarning ? (
              <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/50">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
            ) : isPremium ? (
              <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/50">
                <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            ) : (
              <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-700">
                <Save className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </div>
            )}
            <div className="flex-1">
              {isUnlimited ? (
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-emerald-700 dark:text-emerald-300">Unlimited saved screens</p>
                  <Infinity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
              ) : (
                <>
                  <p className={cn(
                    "font-semibold",
                    isQuotaReached 
                      ? "text-red-700 dark:text-red-300" 
                      : isQuotaWarning 
                        ? "text-amber-700 dark:text-amber-300"
                        : "text-slate-700 dark:text-slate-300"
                  )}>
                    {currentCount} of {maxAllowed} screens used
                  </p>
                  {isQuotaReached && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      Limit reached. <Link href="/pricing" className="underline font-medium hover:text-red-700">Upgrade to Premium</Link> for unlimited screens.
                    </p>
                  )}
                  {isQuotaWarning && !isQuotaReached && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                      Almost at limit! Consider upgrading for unlimited screens.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="screen-name" className="text-slate-900 dark:text-white font-medium">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="screen-name"
              placeholder="e.g., Large Cap Growth Stocks"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!canSave || saving}
              className="border-slate-300 dark:border-slate-600 focus:border-brand focus:ring-brand"
            />
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <Label htmlFor="screen-description" className="text-slate-900 dark:text-white font-medium">
              Description <span className="text-slate-400 font-normal">(optional)</span>
            </Label>
            <Textarea
              id="screen-description"
              placeholder="Describe what this screen looks for..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={!canSave || saving}
              rows={3}
              className="border-slate-300 dark:border-slate-600 focus:border-brand focus:ring-brand resize-none"
            />
          </div>

          {/* Query Preview */}
          <div className="space-y-2">
            <Label className="text-slate-900 dark:text-white font-medium">Query Preview</Label>
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <pre className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                {query.length > 200 ? query.slice(0, 200) + "..." : query}
              </pre>
            </div>
          </div>

          {/* Helpful hint */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Saved screens can be accessed from "My Saved Screens" in the header. Run them anytime with one click!
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
            className="border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim() || !canSave || saving}
            style={{ backgroundColor: '#0087f6' }}
            className="hover:opacity-90 text-white font-medium shadow-sm transition-opacity"
          >
            {saving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white mr-2" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Save Screen
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
