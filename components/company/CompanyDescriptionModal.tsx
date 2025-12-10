"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CompanyDescriptionModalProps {
  name: string;
  description: string | null;
}

export function CompanyDescriptionModal({ name, description }: CompanyDescriptionModalProps) {
  const [open, setOpen] = useState(false);

  const text = description || "No description available.";
  const isLong = text.length > 260;
  const preview = isLong ? text.slice(0, 240) + "…" : text;

  return (
    <div className="space-y-2">
      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        {preview}
      </p>
      {isLong && (
        <Button
          type="button"
          variant="link"
          size="sm"
          className="px-0 h-auto text-xs text-brand"
          onClick={() => setOpen(true)}
        >
          View full details
        </Button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-2xl max-h-[80vh] rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                About {name}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-5 py-4 overflow-y-auto text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
              {text}
            </div>
            <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
