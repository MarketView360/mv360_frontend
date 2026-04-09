"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Check, Loader2, Sparkles, X } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { toast } from "sonner";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function NewsletterSubscribe() {
  const { session } = useAuth();
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [useDifferentEmail, setUseDifferentEmail] = useState(false);
  const [customEmail, setCustomEmail] = useState("");

  const userEmail = session?.user?.email || "";

  const handleSubscribe = async () => {
    const emailToSubscribe = useDifferentEmail ? customEmail : userEmail;

    if (!emailToSubscribe) {
      toast.error("Please sign in to subscribe");
      return;
    }

    if (useDifferentEmail && !emailToSubscribe.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubscribing(true);

    try {
      const response = await fetch(`${API_BASE}/blog/newsletter/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: useDifferentEmail ? customEmail : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to subscribe");
      }

      setIsSubscribed(true);
      toast.success("Successfully subscribed to newsletter!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to subscribe");
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleCancel = () => {
    setUseDifferentEmail(false);
    setCustomEmail("");
  };

  if (isSubscribed) {
    return (
      <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
              <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-300">
                You&apos;re subscribed!
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                You&apos;ll receive our latest updates at {useDifferentEmail ? customEmail : userEmail}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!session) {
    return (
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-brand/10 rounded-xl">
              <Mail className="h-5 w-5 text-brand" />
            </div>
            <div>
              <CardTitle className="text-lg">Subscribe to our newsletter</CardTitle>
              <CardDescription>Get the latest updates delivered to your inbox</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Sign in to subscribe with your email address
          </p>
          <Button className="w-full bg-brand hover:bg-brand/90">
            Sign in to subscribe
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg shadow-brand/5">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-brand/10 rounded-xl">
            <Mail className="h-5 w-5 text-brand" />
          </div>
          <div>
            <CardTitle className="text-lg">Subscribe to our newsletter</CardTitle>
            <CardDescription>Stay updated with the latest features and insights</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!useDifferentEmail ? (
          <>
            <div className="flex items-center justify-between gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-200 dark:bg-slate-700 rounded-full">
                  <Mail className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Subscribing as</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{userEmail}</p>
                </div>
              </div>
            </div>
            <Button
              onClick={handleSubscribe}
              disabled={isSubscribing}
              className="w-full bg-brand hover:bg-brand/90"
            >
              {isSubscribing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Subscribing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Subscribe
                </>
              )}
            </Button>
            <button
              onClick={() => setUseDifferentEmail(true)}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-brand dark:hover:text-brand underline underline-offset-4"
            >
              Want to use a different email?
            </button>
          </>
        ) : (
          <>
            <div className="space-y-3">
              <div>
                <label htmlFor="custom-email" className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                  Email address
                </label>
                <Input
                  id="custom-email"
                  type="email"
                  placeholder="your@email.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSubscribe}
                  disabled={isSubscribing || !customEmail}
                  className="flex-1 bg-brand hover:bg-brand/90"
                >
                  {isSubscribing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Subscribing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Subscribe
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubscribing}
                  className="border-slate-200 dark:border-slate-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
