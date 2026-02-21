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
  Sparkles,
  Heart,
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

  // User info from auth (read-only display)
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
    { id: "general", label: "General Feedback", icon: MessageSquare, color: "blue" },
    { id: "feature", label: "Feature Request", icon: Lightbulb, color: "purple" },
    { id: "bug", label: "Bug Report", icon: Bug, color: "red" },
    { id: "improvement", label: "Improvement Idea", icon: ThumbsUp, color: "emerald" },
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

    // Client-side validation matching backend
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 md:p-12 text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
              Thank You for Your Feedback!
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-2">
              Your voice matters to us, and we truly appreciate you taking the time to share your thoughts.
            </p>
            <p className="text-slate-500 dark:text-slate-400 mb-8">
              Our team reviews every piece of feedback to continuously improve Marketview360 for you and our entire community.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/"
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold transition-all shadow-lg shadow-blue-600/25"
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
                className="px-6 py-3 rounded-lg border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Info Sidebar */}
          <div className="md:col-span-1 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl mb-2">
                <Heart className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                We Value Your Feedback
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                Your insights help us build a better experience for everyone.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white mb-1">
                    Constantly Improving
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    We're committed to evolving Marketview360 based on your needs and suggestions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MessageSquare className="h-6 w-6 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white mb-1">
                    Every Voice Matters
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Whether it's a bug, feature request, or general thought, we listen and act.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Heart className="h-6 w-6 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white mb-1">
                    Built With You
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Together, we're creating the ultimate platform for modern investors.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800/50 p-5">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-200 leading-relaxed">
                💡 <strong>Quick Tip:</strong> Quality feedback helps us improve faster!
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                🎁 <strong>Bonus:</strong> Exceptional feedback may be eligible for rewards and early access to new features.
              </p>
            </div>
          </div>

          {/* Feedback Form */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Share Your Thoughts
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Help us make Marketview360 even better for you and the community.
                </p>
              </div>

              {/* Optional Star Rating (collapsed by default) */}
              <div className="mb-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Rate your experience with Marketview360
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      A quick rating helps us understand how we&apos;re doing overall.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRatingExpanded(!ratingExpanded)}
                    className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex-shrink-0"
                  >
                    {ratingExpanded ? "Hide rating" : "Add rating"}
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
                            className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Feedback Type Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
                    What type of feedback are you sharing?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {feedbackTypes.map((ft) => {
                      const Icon = ft.icon;
                      const isSelected = type === ft.id;
                      return (
                        <button
                          key={ft.id}
                          type="button"
                          onClick={() => setType(ft.id as FeedbackType)}
                          className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left font-medium transition-all ${
                            isSelected
                              ? `border-${ft.color}-500 bg-${ft.color}-50 dark:bg-${ft.color}-900/20 text-${ft.color}-700 dark:text-${ft.color}-300 shadow-lg`
                              : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                          }`}
                        >
                          <Icon className={`h-5 w-5 shrink-0 ${isSelected ? "text-blue-600 dark:text-blue-400" : ""}`} />
                          <span className="text-sm">{ft.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {error && (
                  <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>
                  </div>
                )}

                {/* User Info (read-only from account) */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">Submitting as</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Name</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{userName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <Mail className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{userEmail || "Not available"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Subject
                  </label>
                  <input
                    id="subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    placeholder="Brief summary of your feedback"
                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Your Feedback
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={8}
                    placeholder="Share your thoughts, ideas, or concerns in detail. The more information you provide, the better we can help!"
                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
                  />
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    {message.length} characters
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || secondsLeft > 0 || !token}
                  className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-blue-600/25 hover:shadow-2xl hover:shadow-blue-600/30 disabled:shadow-none"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Sending Your Feedback...
                    </>
                  ) : secondsLeft > 0 ? (
                    <>
                      <Send className="h-5 w-5" />
                      Send available in {secondsLeft}s
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Send Feedback
                    </>
                  )}
                </button>

                {secondsLeft > 0 && (
                  <p className="text-center text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg py-2 px-3">
                    You can submit one feedback per minute to keep the system fair for everyone.
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
