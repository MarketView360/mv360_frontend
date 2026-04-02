"use client";

import { Check, Loader2 } from "lucide-react";

interface AutoSaveIndicatorProps {
  show: boolean;
  saving: boolean;
}

export function AutoSaveIndicator({ show, saving }: AutoSaveIndicatorProps) {
  if (!show && !saving) return null;

  return (
    <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400 h-6">
      {saving ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Saving...</span>
        </>
      ) : show ? (
        <>
          <Check className="h-4 w-4 text-green-500" />
          <span className="text-green-600 dark:text-green-400">Progress saved</span>
        </>
      ) : null}
    </div>
  );
}
