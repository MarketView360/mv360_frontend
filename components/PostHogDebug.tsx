"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { capturePostHogEvent, identifyPostHogUser, isPostHogReady } from "@/lib/posthog";
import { toast } from "sonner";

export function PostHogDebug() {
  const [status, setStatus] = useState<{
    loaded: boolean;
    hasWindowPostHog: boolean;
    apiKey: string;
    host: string;
  }>({ loaded: false, hasWindowPostHog: false, apiKey: "", host: "" });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setStatus({
        loaded: !!(window as any).posthog?.__loaded,
        hasWindowPostHog: !!(window as any).posthog,
        apiKey: process.env.NEXT_PUBLIC_POSTHOG_KEY?.substring(0, 8) + "..." || "UNDEFINED",
        host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "UNDEFINED",
      });
    }
  }, []);

  const testEvent = () => {
    capturePostHogEvent("debug_button_clicked", {
      timestamp: new Date().toISOString(),
      source: "PostHogDebug component",
    });
    toast.success("Debug event sent! Check PostHog dashboard in ~30 seconds");
  };

  const testIdentify = () => {
    identifyPostHogUser("debug-user-" + Date.now(), {
      email: "debug@example.com",
      plan: "debug",
    });
    toast.success("User identified!");
  };

  const checkNetwork = () => {
    // Check network requests to PostHog
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
    fetch(`${host}/decide/?v=3`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: process.env.NEXT_PUBLIC_POSTHOG_KEY,
        distinct_id: "test",
      }),
    })
      .then((res) => {
        console.log("[PostHogDebug] Network test status:", res.status);
        return res.json();
      })
      .then((data) => {
        console.log("[PostHogDebug] Network test response:", data);
        toast.success("PostHog API reachable!");
      })
      .catch((err) => {
        console.error("[PostHogDebug] Network test error:", err);
        toast.error(`Network error: ${err.message}`);
      });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">PostHog Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-muted-foreground">Loaded:</div>
          <div className={status.loaded ? "text-green-600" : "text-red-600"}>
            {status.loaded ? "YES" : "NO"}
          </div>

          <div className="text-muted-foreground">Window PostHog:</div>
          <div className={status.hasWindowPostHog ? "text-green-600" : "text-red-600"}>
            {status.hasWindowPostHog ? "YES" : "NO"}
          </div>

          <div className="text-muted-foreground">API Key:</div>
          <div className="font-mono text-xs">{status.apiKey}</div>

          <div className="text-muted-foreground">Host:</div>
          <div className="font-mono text-xs">{status.host}</div>
        </div>

        <div className="flex gap-2">
          <Button onClick={testEvent} size="sm" className="flex-1">
            Test Event
          </Button>
          <Button onClick={testIdentify} size="sm" variant="secondary" className="flex-1">
            Identify
          </Button>
          <Button onClick={checkNetwork} size="sm" variant="outline" className="flex-1">
            Network Test
          </Button>
        </div>

        <div className="text-xs text-muted-foreground pt-2 border-t">
          <p>Open browser console for detailed logs</p>
          <p>Check Network tab for requests to {status.host}</p>
        </div>
      </CardContent>
    </Card>
  );
}
