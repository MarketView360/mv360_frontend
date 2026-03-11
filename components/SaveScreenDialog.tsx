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
import { Save, AlertCircle, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SaveScreenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: { name: string; description?: string }) => Promise<void>;
  query: string;
  currentCount: number;
  maxAllowed: number;
  canSave: boolean;
  quotaMessage: string;
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

  const isQuotaWarning = maxAllowed !== -1 && currentCount >= maxAllowed - 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5 text-brand" />
            Save Screen
          </DialogTitle>
          <DialogDescription>
            Save your current query for quick access later.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Quota Info */}
          <div className={cn(
            "flex items-center gap-3 p-3 rounded-lg border text-sm",
            !canSave
              ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
              : isQuotaWarning
                ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300"
                : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
          )}>
            {!canSave ? (
              <AlertCircle className="h-5 w-5 shrink-0" />
            ) : isQuotaWarning ? (
              <AlertCircle className="h-5 w-5 shrink-0" />
            ) : (
              <Crown className="h-5 w-5 shrink-0 text-brand" />
            )}
            <div className="flex-1">
              {maxAllowed === -1 ? (
                <p className="font-medium">Unlimited saved screens</p>
              ) : (
                <>
                  <p className="font-medium">
                    {currentCount} of {maxAllowed} used
                  </p>
                  <p className="text-xs opacity-80">{quotaMessage}</p>
                </>
              )}
            </div>
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="screen-name">Name</Label>
            <Input
              id="screen-name"
              placeholder="e.g., Large Cap Growth Stocks"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!canSave || saving}
            />
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <Label htmlFor="screen-description">Description (optional)</Label>
            <Textarea
              id="screen-description"
              placeholder="Describe what this screen looks for..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={!canSave || saving}
              rows={3}
            />
          </div>

          {/* Query Preview */}
          <div className="space-y-2">
            <Label>Query Preview</Label>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <pre className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap font-mono">
                {query.length > 200 ? query.slice(0, 200) + "..." : query}
              </pre>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim() || !canSave || saving}
            className="bg-brand hover:bg-brand/90"
          >
            {saving ? "Saving..." : "Save Screen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
