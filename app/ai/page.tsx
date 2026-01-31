import React, { Suspense } from "react";
import AiPageClient from "./AiPageClient";
import { TooltipProvider } from "@/components/ui/tooltip";

// Feature flag: Allow anonymous users to access AI chat.
// Default: true (if unset). Set NEXT_PUBLIC_ALLOW_ANONYMOUS_AI_CHAT=false to require login.

export default function AiPage() {
  return (
    <TooltipProvider delayDuration={200} skipDelayDuration={300}>
      <Suspense
        fallback={
          <div className="flex h-full w-full items-center justify-center bg-white dark:bg-slate-950">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        }
      >
        <AiPageClient />
      </Suspense>
    </TooltipProvider>
  );
}
