"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    // Capture the error in PostHog
    posthog.captureException(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-700 dark:text-slate-300">
      <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
      <p className="text-sm mb-4">{error.message}</p>
      <Button onClick={() => reset()} className="bg-brand text-white">
        Try again
      </Button>
    </div>
  );
}
