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
} from "lucide-react";

type FeedbackType = "general" | "feature" | "bug" | "improvement";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const FEEDBACK_COOLDOWN_MS = 60_000;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_SUBJECT_LENGTH = 200;

// Sanitize user input to prevent XSS
function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

// Validate input - strip dangerous patterns
function validateInput(input: string): { valid: boolean; sanitized: string } {
  // Remove null bytes
  let sanitized = input.replace(/\0/g, "");

  // Limit length (prevent DoS)
  if (sanitized.length > 10000) {
    sanitized = sanitized.slice(0, 10000);
  }

  // Check for script tags or event handlers (basic XSS prevention)
  const dangerousPatterns = [
    /<script\b/i,
    /javascript:/i,
    /on\w+\s*=/i, // onclick=, onerror=, etc.
    /data:text\/html/i,
    /vbscript:/i,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(sanitized)) {
      return { valid: false, sanitized: "" };
    }
  }

  return { valid: true, sanitized };
}

export default function FeedbackPage() {
  const { user, session } = useAuth();
  const token = session?.access_token || null;

  const [type, setType] = useState<FeedbackType>("general");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState<number>(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

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
    { id: "feature", label: "Feature", icon: Lightbulb },
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

    // Validate and sanitize inputs
    const subjectValidation = validateInput(subject.trim());
    const messageValidation = validateInput(message.trim());

    if (!subjectValidation.valid || !messageValidation.valid) {
      setError("Invalid characters detected in input.");
      return;
    }

    if (subjectValidation.sanitized.length < 10) {
      setError("Subject must be at least 10 characters.");
      return;
    }

    if (subjectValidation.sanitized.length > MAX_SUBJECT_LENGTH) {
      setError(`Subject must be less than ${MAX_SUBJECT_LENGTH} characters.`);
      return;
    }

    if (messageValidation.sanitized.length < 20) {
      setError("Message must be at least 20 characters.");
      return;
    }

    if (messageValidation.sanitized.length > MAX_MESSAGE_LENGTH) {
      setError(`Message must be less than ${MAX_MESSAGE_LENGTH} characters.`);
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
          subject: sanitizeInput(subjectValidation.sanitized),
          message: sanitizeInput(messageValidation.sanitized),
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center py-12 px-4 sm:px-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-200 dark:border-slate-800 p-8 sm:p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
          
          <div className="mx-auto w-20 h-20 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          </div>
          
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">
            Feedback Sent!
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
            Thank you for taking the time to share your thoughts. Every piece of feedback helps us make MarketView360 better for you.
          </p>
          
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="w-full inline-flex justify-center items-center px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition-all hover:shadow-md"
            >
              Back to Dashboard
            </Link>
            <button
              onClick={() => {
                setSubmitted(false);
                setSubject("");
                setMessage("");
                setType("general");
                setRating(null);
              }}
              className="w-full inline-flex justify-center items-center px-6 py-3 rounded-xl bg-transparent text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Submit Another Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-8 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>

        <div className="grid md:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Info Sidebar */}
          <div className="md:col-span-4 space-y-8 sticky top-12">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
                Help us build the future.
              </h1>
              <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                Whether you've found a bug, have a brilliant idea, or just want to tell us what you think—we're listening.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="mt-1 w-10 h-10 rounded-full bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center shrink-0">
                  <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Direct Impact</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Every submission is read directly by our product and engineering teams.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1 w-10 h-10 rounded-full bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center shrink-0">
                  <Lightbulb className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Feature Requests</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Your ideas directly influence our product roadmap and future updates.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1 w-10 h-10 rounded-full bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center shrink-0">
                  <Bug className="h-4 w-4 text-rose-500 dark:text-rose-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Squash Bugs</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Help us catch edge cases to keep the platform running smoothly.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Form Card */}
          <div className="md:col-span-8">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-200/80 dark:border-slate-800 overflow-hidden">
              <div className="p-6 sm:p-8">
                
                {/* User Info Banner */}
                <div className="mb-8 flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                    <User className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {userName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {userEmail || "Authenticated User"}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Feedback Type Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
                      What kind of feedback is this?
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {feedbackTypes.map((ft) => {
                        const Icon = ft.icon;
                        const isSelected = type === ft.id;
                        return (
                          <button
                            key={ft.id}
                            type="button"
                            onClick={() => setType(ft.id as FeedbackType)}
                            className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                              isSelected
                                ? "border-blue-600 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 ring-1 ring-blue-600"
                                : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                            }`}
                          >
                            <Icon className={`h-5 w-5 ${isSelected ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`} />
                            <span>{ft.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-red-800 dark:text-red-300 leading-relaxed">{error}</p>
                    </div>
                  )}

                  {/* Subject Input */}
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
                      maxLength={MAX_SUBJECT_LENGTH}
                      placeholder="e.g., Feature request for export functionality"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 text-right">
                      {subject.length} / {MAX_SUBJECT_LENGTH} chars
                    </p>
                  </div>

                  {/* Message Input */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                      Details
                    </label>
                    <textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      rows={5}
                      maxLength={MAX_MESSAGE_LENGTH}
                      placeholder="Please provide as much detail as possible..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition-all"
                    />
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Plain text only (HTML not allowed for security).
                      </p>
                      <p className={`text-xs ${message.length > 0 && message.length < 20 ? "text-amber-500" : "text-slate-500 dark:text-slate-400"}`}>
                        {message.length} / {MAX_MESSAGE_LENGTH} max
                      </p>
                    </div>
                  </div>

                  {/* Integrated Star Rating */}
                  <div className="pt-2">
                    <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                      How would you rate your overall experience? <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: 5 }).map((_, index) => {
                        const value = index + 1;
                        const isFilled = (hoveredRating !== null ? hoveredRating : rating) !== null && value <= (hoveredRating !== null ? hoveredRating : (rating || 0));
                        
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setRating(value)}
                            onMouseEnter={() => setHoveredRating(value)}
                            onMouseLeave={() => setHoveredRating(null)}
                            className="p-1 focus:outline-none focus:scale-110 transition-transform"
                            aria-label={`Rate ${value} out of 5`}
                          >
                            <Star
                              className={`h-8 w-8 transition-colors ${
                                isFilled
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-slate-200 dark:text-slate-700"
                              }`}
                            />
                          </button>
                        );
                      })}
                      {rating && (
                        <button 
                          type="button" 
                          onClick={() => setRating(null)}
                          className="ml-3 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline underline-offset-2"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Submit Button & Cooldown */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="submit"
                      disabled={isSubmitting || secondsLeft > 0 || !token}
                      className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 disabled:hover:shadow-sm"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Submitting...
                        </>
                      ) : secondsLeft > 0 ? (
                        <>
                          <Send className="h-5 w-5 opacity-70" />
                          Available in {secondsLeft}s
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5" />
                          Send Feedback
                        </>
                      )}
                    </button>
                    {secondsLeft > 0 && (
                      <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-3">
                        To prevent spam, please wait before submitting another report.
                      </p>
                    )}
                  </div>
                  
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}