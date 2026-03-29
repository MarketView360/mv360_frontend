"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePostHogClient, capturePostHogEvent, identifyPostHogUser } from "@/lib/posthog";
import { toast } from "sonner";

export default function PostHogTestPage() {
  const posthog = usePostHogClient();

  const captureEvent = useCallback(() => {
    capturePostHogEvent("test_button_clicked", {
      timestamp: new Date().toISOString(),
      source: "posthog-test-page",
    });
    toast.success("Event captured! Check PostHog dashboard.");
  }, []);

  const capturePageview = useCallback(() => {
    capturePostHogEvent("$pageview", {
      $current_url: window.origin + "/posthog-test",
      test: "manual-pageview",
    });
    toast.success("Pageview captured!");
  }, []);

  const identifyUser = useCallback(() => {
    identifyPostHogUser("test-user-123", {
      email: "test@example.com",
      plan: "free",
    });
    toast.success("User identified!");
  }, []);

  const captureUsingHook = useCallback(() => {
    if (posthog) {
      posthog.capture("hook_event", {
        method: "usePostHogClient hook",
        timestamp: Date.now(),
      });
      toast.success("Event via hook captured!");
    } else {
      toast.error("PostHog not initialized");
    }
  }, [posthog]);

  const checkPostHogStatus = useCallback(() => {
    const isReady = (window as any).posthog?.__loaded;
    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

    toast.info(
      `PostHog ${isReady ? "READY" : "NOT READY"} | Key: ${apiKey?.substring(0, 8)}... | Host: ${host}`
    );
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>PostHog Integration Test</CardTitle>
            <CardDescription>
              Test PostHog event tracking. Check your PostHog dashboard at{" "}
              <a href="https://us.i.posthog.com" target="_blank" className="text-brand hover:underline">
                us.i.posthog.com
              </a>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={checkPostHogStatus} variant="outline" className="w-full">
              Check PostHog Status
            </Button>

            <Button onClick={captureEvent} className="w-full">
              Capture Test Event
            </Button>

            <Button onClick={capturePageview} variant="secondary" className="w-full">
              Capture Manual Pageview
            </Button>

            <Button onClick={identifyUser} variant="secondary" className="w-full">
              Identify Test User
            </Button>

            <Button onClick={captureUsingHook} variant="outline" className="w-full">
              Capture Event (using hook)
            </Button>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">
                Or open browser console and run:
              </p>
              <code className="block bg-slate-100 dark:bg-slate-900 p-3 rounded text-xs font-mono">
                posthog.capture(&apos;console_test_event&apos;, &#123; source: &apos;browser-console&apos; &#125;)
              </code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
