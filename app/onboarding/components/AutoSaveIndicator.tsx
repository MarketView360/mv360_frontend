"use client";

import { Check, Loader2 } from "lucide-react";

interface AutoSaveIndicatorProps {
  show: boolean;
  saving: boolean;
}

export function AutoSaveIndicator({ show, saving }: AutoSaveIndicatorProps) {
  const visible = saving || show;

  return (
    <div
      className={`flex h-5 items-center justify-center gap-1.5 transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
      }`}
      aria-live="polite"
      aria-atomic="true"
    >
      {saving ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
          <span className="text-xs text-slate-400 font-medium">Saving…</span>
        </>
      ) : show ? (
        <>
          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20">
            <Check className="h-2.5 w-2.5 text-emerald-400" strokeWidth={3} />
          </div>
          <span className="text-xs text-emerald-400 font-medium">Progress saved</span>
        </>
      ) : null}
    </div>
  );
}