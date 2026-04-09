import React, { Suspense } from "react";
import AiPageClient from "./AiPageClient";

export default function AiPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center bg-white dark:bg-slate-950">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      }
    >
      <AiPageClient />
    </Suspense>
  );
}
