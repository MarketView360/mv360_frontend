"use client";

import { useState, useEffect } from "react";
import { Loader2, Star, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const WATCHLIST_COLORS = [
  { value: "#3b82f6", label: "Blue" },
  { value: "#ef4444", label: "Red" },
  { value: "#10b981", label: "Green" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#ec4899", label: "Pink" },
  { value: "#06b6d4", label: "Cyan" },
  { value: "#f97316", label: "Orange" },
];

interface WatchlistFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initialName?: string;
  initialDescription?: string;
  initialColor?: string;
  onSubmit: (name: string, description: string, color: string) => Promise<void>;
  loading?: boolean;
}

export function WatchlistFormDialog({
  open,
  onOpenChange,
  mode,
  initialName = "",
  initialDescription = "",
  initialColor = "#3b82f6",
  onSubmit,
  loading = false,
}: WatchlistFormDialogProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [color, setColor] = useState(initialColor);

  useEffect(() => {
    if (open) {
      setName(initialName);
      setDescription(initialDescription);
      setColor(initialColor);
    }
  }, [open, initialName, initialDescription, initialColor]);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    await onSubmit(name.trim(), description.trim(), color);
  };

  const isCreate = mode === "create";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
              style={{ backgroundColor: `${color}20` }}
            >
              <Star className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <DialogTitle className="text-left">
                {isCreate ? "Create Watchlist" : "Edit Watchlist"}
              </DialogTitle>
              <DialogDescription className="text-left mt-0.5">
                {isCreate
                  ? "Organize and track your favorite stocks."
                  : "Update your watchlist details."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
              Name
            </label>
            <Input
              placeholder={isCreate ? "e.g. Tech Giants, Dividend Kings" : "Watchlist name"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
              autoFocus
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
              Description <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <Input
              placeholder="Brief description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {WATCHLIST_COLORS.map((c) => (
                <button
                  key={c.value}
                  className={`w-9 h-9 rounded-xl transition-all flex items-center justify-center ${
                    color === c.value
                      ? "ring-2 ring-offset-2 ring-slate-900 dark:ring-white dark:ring-offset-slate-900 scale-110"
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: c.value }}
                  onClick={() => setColor(c.value)}
                  title={c.label}
                >
                  {color === c.value && (
                    <Check className="w-4 h-4 text-white drop-shadow-sm" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || loading}
            className="gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isCreate ? "Create Watchlist" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
