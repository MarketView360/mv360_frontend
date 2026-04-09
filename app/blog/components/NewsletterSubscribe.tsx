"use client";

import { useState, useEffect } from "react";
import { Mail, Zap, CheckCircle2, Loader2, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type SubscribeStatus = "idle" | "loading" | "success" | "error";

async function callSubscribe(email: string): Promise<void> {
  const res = await fetch(`${API_BASE}/newsletter/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    let msg = "Subscription failed. Please try again.";
    try { const b = await res.json(); if (b?.message) msg = b.message; } catch { /* ignore */ }
    throw new Error(msg);
  }
}

export function NewsletterSubscribe() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // 1-click state
  const [oneClickStatus, setOneClickStatus] = useState<SubscribeStatus>("idle");
  const [oneClickError, setOneClickError] = useState("");

  // custom email state
  const [showCustom, setShowCustom] = useState(false);
  const [customEmail, setCustomEmail] = useState("");
  const [customStatus, setCustomStatus] = useState<SubscribeStatus>("idle");
  const [customError, setCustomError] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser()
      .then(({ data }) => { setUserEmail(data?.user?.email ?? null); })
      .catch(() => { setUserEmail(null); })
      .finally(() => setLoadingUser(false));
  }, []);

  const handleOneClick = async () => {
    if (!userEmail || oneClickStatus === "loading" || oneClickStatus === "success") return;
    setOneClickStatus("loading");
    setOneClickError("");
    try {
      await callSubscribe(userEmail);
      setOneClickStatus("success");
    } catch (e) {
      setOneClickStatus("error");
      setOneClickError(e instanceof Error ? e.message : "Something went wrong.");
    }
  };

  const handleCustomSubmit = async () => {
    if (customStatus === "loading" || customStatus === "success") return;
    const trimmed = customEmail.trim();
    if (!trimmed) { setCustomError("Please enter an email address."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) { setCustomError("Please enter a valid email address."); return; }
    setCustomStatus("loading");
    setCustomError("");
    try {
      await callSubscribe(trimmed);
      setCustomStatus("success");
    } catch (e) {
      setCustomStatus("error");
      setCustomError(e instanceof Error ? e.message : "Something went wrong.");
    }
  };

  // ── Loading user skeleton ──
  if (loadingUser) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-3 w-64 bg-slate-100 dark:bg-slate-700 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">

          {/* Left: icon + text */}
          <div className="flex items-start gap-3.5 flex-1">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center border border-blue-100 dark:border-blue-800 mt-0.5">
              <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Stay Ahead of the Market</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Get the latest insights and product updates delivered to your inbox.
              </p>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex flex-col gap-3 sm:items-end sm:min-w-[300px]">

            {/* ── 1-click subscribe (only shown when user is logged in & not yet subscribed) ── */}
            {userEmail && oneClickStatus !== "success" && (
              <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                <button
                  onClick={handleOneClick}
                  disabled={oneClickStatus === "loading"}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white text-sm font-semibold transition-colors w-full sm:w-auto"
                >
                  {oneClickStatus === "loading"
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Zap className="h-4 w-4" />}
                  1-Click Subscribe
                </button>
                {oneClickStatus === "error" && (
                  <div className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {oneClickError}
                  </div>
                )}
              </div>
            )}

            {/* ── 1-click success ── */}
            {oneClickStatus === "success" && (
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                Subscribed successfully!
              </div>
            )}

            {/* ── Custom email row (always shown if no user email, or as "other email" option) ── */}
            {!userEmail && (
              <div className="flex gap-2 w-full">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={customEmail}
                    onChange={(e) => { setCustomEmail(e.target.value); setCustomError(""); setCustomStatus("idle"); }}
                    onKeyDown={(e) => { if (e.key === "Enter") handleCustomSubmit(); }}
                    disabled={customStatus === "success"}
                    className="w-full pl-9 pr-3 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 disabled:opacity-60 transition"
                  />
                </div>
                {customStatus === "success"
                  ? <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      <CheckCircle2 className="h-4 w-4" /> Done!
                    </div>
                  : <button onClick={handleCustomSubmit} disabled={customStatus === "loading" || !customEmail.trim()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold hover:bg-slate-700 dark:hover:bg-slate-100 disabled:opacity-50 transition-colors shrink-0">
                      {customStatus === "loading" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                      Subscribe
                    </button>
                }
              </div>
            )}

            {/* Custom error for no-user flow */}
            {!userEmail && customStatus === "error" && (
              <div className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />{customError}
              </div>
            )}
          </div>
        </div>

        {/* ── Logged-in sub-info + "other email" toggle ── */}
        {userEmail && oneClickStatus !== "success" && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Subscribes newsletter for{" "}
              <span className="font-semibold text-slate-600 dark:text-slate-300">{userEmail}</span>
            </p>

            {!showCustom ? (
              <button onClick={() => setShowCustom(true)}
                className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">
                Want to subscribe with a different email?
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            ) : (
              <div className="space-y-2">
                <button onClick={() => { setShowCustom(false); setCustomEmail(""); setCustomError(""); setCustomStatus("idle"); }}
                  className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium">
                  <ChevronUp className="h-3.5 w-3.5" /> Hide
                </button>

                {customStatus === "success" ? (
                  <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span><span className="font-semibold">{customEmail}</span> subscribed!</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                        <input
                          type="email"
                          placeholder="Other email address"
                          value={customEmail}
                          onChange={(e) => { setCustomEmail(e.target.value); setCustomError(""); setCustomStatus("idle"); }}
                          onKeyDown={(e) => { if (e.key === "Enter") handleCustomSubmit(); }}
                          className="w-full pl-9 pr-3 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition"
                        />
                      </div>
                      <button onClick={handleCustomSubmit}
                        disabled={customStatus === "loading" || !customEmail.trim()}
                        className="inline-flex items-center gap-1.5 px-4 h-10 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold hover:bg-slate-700 dark:hover:bg-slate-100 disabled:opacity-50 transition-colors shrink-0">
                        {customStatus === "loading" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                        Subscribe
                      </button>
                    </div>
                    {customStatus === "error" && (
                      <div className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />{customError}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Post 1-click success: still offer custom email ── */}
        {userEmail && oneClickStatus === "success" && !customStatus && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            {!showCustom ? (
              <button onClick={() => setShowCustom(true)}
                className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">
                Subscribe another email?
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            ) : (
              <div className="space-y-2">
                <button onClick={() => { setShowCustom(false); setCustomEmail(""); setCustomError(""); setCustomStatus("idle"); }}
                  className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium">
                  <ChevronUp className="h-3.5 w-3.5" /> Hide
                </button>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                    <input type="email" placeholder="Another email address" value={customEmail}
                      onChange={(e) => { setCustomEmail(e.target.value); setCustomError(""); setCustomStatus("idle"); }}
                      onKeyDown={(e) => { if (e.key === "Enter") handleCustomSubmit(); }}
                      className="w-full pl-9 pr-3 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition" />
                  </div>
                  <button onClick={handleCustomSubmit} disabled={customStatus === "loading" || !customEmail.trim()}
                    className="inline-flex items-center gap-1.5 px-4 h-10 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold hover:bg-slate-700 dark:hover:bg-slate-100 disabled:opacity-50 transition-colors shrink-0">
                    {customStatus === "loading" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                    Subscribe
                  </button>
                </div>
                {customStatus === "success" && (
                  <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" /><span>{customEmail} subscribed!</span>
                  </div>
                )}
                {customStatus === "error" && (
                  <div className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />{customError}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}