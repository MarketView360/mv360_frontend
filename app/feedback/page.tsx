"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import {
  ArrowLeft,
  Send,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Lightbulb,
  Bug,
  ThumbsUp,
  Star,
  User,
  Mail
} from "lucide-react";

type FeedbackType = "general" | "feature" | "bug" | "improvement";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const FEEDBACK_COOLDOWN_MS = 60_000;

export default function FeedbackPage() {
  const { user, session } = useAuth();
  const token = session?.access_token || null;

  const [type, setType] = useState<FeedbackType>("general");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ratingExpanded, setRatingExpanded] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState<number>(0);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const userName = user?.user_metadata?.full_name || user?.user_metadata?.display_name || "User";
  const userEmail = user?.email || "";

  useEffect(() => {
    if (!cooldownUntil) {
      setSecondsLeft(0);
      return;
    }

    const update = () => {
      const remainingMs = Math.max(0, cooldownUntil - Date.now());
      const remainingSeconds = Math.ceil(remainingMs / 1000);
      setSecondsLeft(remainingSeconds);
      if (remainingMs <= 0) {
        setCooldownUntil(0);
      }
    };

    update();
    const timer = setInterval(update, 250);
    return () => clearInterval(timer);
  }, [cooldownUntil]);

  const feedbackTypes = [
    { id: "general", label: "General", icon: MessageSquare },
    { id: "feature", label: "Feature Request", icon: Lightbulb },
    { id: "bug", label: "Bug Report", icon: Bug },
    { id: "improvement", label: "Improvement", icon: ThumbsUp },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (secondsLeft > 0) {
      setError(`Please wait ${secondsLeft}s before sending another feedback.`);
      return;
    }

    if (!token) {
      setError("Please log in to submit feedback.");
      return;
    }

    if (!subject.trim() || !message.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    if (subject.trim().length < 10) {
      setError("Subject must be at least 10 characters.");
      return;
    }

    if (message.trim().length < 20) {
      setError("Message must be at least 20 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type,
          subject: subject.trim(),
          message: message.trim(),
          ...(rating && { rating }),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 429) {
          const retryAfter = Number(res.headers.get("retry-after") || "0");
          const cooldownMs = retryAfter > 0 ? retryAfter * 1000 : FEEDBACK_COOLDOWN_MS;
          setCooldownUntil(Date.now() + cooldownMs);
          throw new Error("Thanks for your feedback. Please wait 1 minute before sending another one.");
        }
        throw new Error(data.message || "Failed to submit feedback");
      }

      setCooldownUntil(Date.now() + FEEDBACK_COOLDOWN_MS);
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send feedback. Please try again or email us directly at support@marketview360.io"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4">
        <div className="max-w-xl mx-auto">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Thank You for Your Feedback
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              We review every submission to help improve MarketView360.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/"
                className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
              >
                Back to Home
              </Link>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setSubject("");
                  setMessage("");
                  setType("general");
                  setRating(null);
                  setRatingExpanded(false);
                }}
                className="px-6 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Send More Feedback
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="grid md:grid-cols-5 gap-6">
          {/* Info Sidebar */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Help Us Improve
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Share your thoughts and help shape the future of MarketView360.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                  <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    We Listen
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Every piece of feedback is reviewed by our team.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                  <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    Drive Innovation
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Your ideas influence our product roadmap.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                  <Bug className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    Report Issues
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Help us catch and fix bugs faster.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Form */}
          <div className="md:col-span-3">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                  Share Your Thoughts
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Fill out the form below to submit your feedback.
                </p>
              </div>

              {/* Optional Star Rating */}
              <div className="mb-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      Rate your experience
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Optional rating helps us track overall satisfaction.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRatingExpanded(!ratingExpanded)}
                    className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {ratingExpanded ? "Hide" : "Add rating"}
                  </button>
                </div>

                {ratingExpanded && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, index) => {
                        const value = index + 1;
                        const active = rating !== null && value <= rating;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setRating(value)}
                            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            aria-label={`Rate ${value} star${value > 1 ? "s" : ""}`}
                          >
                            <Star
                              className={`h-5 w-5 ${
                                active
                                  ? "text-amber-500 fill-amber-400"
                                  : "text-slate-300 dark:text-slate-600"
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                    {rating && (
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        {rating} / 5
                      </span>
                    )}
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Feedback Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2.5">
                    Feedback type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {feedbackTypes.map((ft) => {
                      const Icon = ft.icon;
                      const isSelected = type === ft.id;
                      return (
                        <button
                          key={ft.id}
                          type="button"
                          onClick={() => setType(ft.id as FeedbackType)}
                          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-sm font-medium transition-all ${
                            isSelected
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                              : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                          }`}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span>{ft.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </div>
                )}

                {/* User Info (read-only) */}
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2.5">Submitting as</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        <User className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Name</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{userName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        <Mail className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Email</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{userEmail || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-slate-900 dark:text-white mb-1.5">
                    Subject
                  </label>
                  <input
                    id="subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    placeholder="Brief summary of your feedback"
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-900 dark:text-white mb-1.5">
                    Message
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={6}
                    placeholder="Describe your feedback in detail..."
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
                  />
                  <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                    {message.length} characters (minimum 20)
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || secondsLeft > 0 || !token}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Sending...
                    </>
                  ) : secondsLeft > 0 ? (
                    <>
                      <Send className="h-4 w-4" />
                      Available in {secondsLeft}s
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit Feedback
                    </>
                  )}
                </button>

                {secondsLeft > 0 && (
                  <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                    One feedback per minute to keep the system fair for everyone.
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
