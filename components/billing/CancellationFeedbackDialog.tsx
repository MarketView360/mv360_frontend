"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  XCircle,
  AlertTriangle,
  Loader2,
  DollarSign,
  Clock,
  Features,
  Bug,
  Support,
  Alternative,
  Temporary,
  Sad,
  Meh,
  Smile,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Predefined cancellation reasons
const CANCELLATION_REASONS = [
  { id: "price", label: "Price is too high", icon: DollarSign },
  { id: "not_using", label: "Not using the features enough", icon: Features },
  { id: "found_alternative", label: "Found a better alternative", icon: Alternative },
  { id: "missing_features", label: "Missing features I need", icon: Bug },
  { id: "technical_issues", label: "Technical issues or bugs", icon: Bug },
  { id: "support_issues", label: "Support didn't meet expectations", icon: Support },
  { id: "temporary_pause", label: "Temporary pause (will return)", icon: Temporary },
  { id: "moving_platform", label: "Moving to different platform", icon: Alternative },
];

interface CancellationFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: (feedback: CancellationFeedback, cancelImmediately: boolean) => Promise<void>;
  subscriptionInfo: {
    tier: string;
    billingPeriod: string;
    daysRemaining?: number;
    currentPeriodEnd?: string;
  };
  loading?: boolean;
}

export interface CancellationFeedback {
  reasons: string[];
  customReason?: string;
  satisfactionScore?: number;
  wouldReturn?: boolean;
  additionalComments?: string;
}

export function CancellationFeedbackDialog({
  open,
  onOpenChange,
  onCancel,
  subscriptionInfo,
  loading,
}: CancellationFeedbackDialogProps) {
  const router = useRouter();
  const [step, setStep] = useState<"warning" | "feedback" | "confirm">("warning");
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [customReason, setCustomReason] = useState("");
  const [satisfactionScore, setSatisfactionScore] = useState<number | undefined>();
  const [wouldReturn, setWouldReturn] = useState<boolean | undefined>();
  const [additionalComments, setAdditionalComments] = useState("");
  const [cancelImmediately, setCancelImmediately] = useState(false);

  const handleReasonToggle = (reasonId: string) => {
    setSelectedReasons((prev) =>
      prev.includes(reasonId)
        ? prev.filter((r) => r !== reasonId)
        : [...prev, reasonId]
    );
  };

  const handleNextStep = () => {
    if (step === "warning") {
      setStep("feedback");
    } else if (step === "feedback") {
      if (selectedReasons.length === 0) {
        // At least one reason required
        return;
      }
      setStep("confirm");
    }
  };

  const handleBackStep = () => {
    if (step === "confirm") {
      setStep("feedback");
    } else if (step === "feedback") {
      setStep("warning");
    }
  };

  const handleSubmit = async () => {
    const feedback: CancellationFeedback = {
      reasons: selectedReasons,
      customReason: customReason.trim() || undefined,
      satisfactionScore,
      wouldReturn,
      additionalComments: additionalComments.trim() || undefined,
    };

    await onCancel(feedback, cancelImmediately);

    // Reset state
    setStep("warning");
    setSelectedReasons([]);
    setCustomReason("");
    setSatisfactionScore(undefined);
    setWouldReturn(undefined);
    setAdditionalComments("");
    setCancelImmediately(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state
    setStep("warning");
    setSelectedReasons([]);
    setCustomReason("");
    setSatisfactionScore(undefined);
    setWouldReturn(undefined);
    setAdditionalComments("");
    setCancelImmediately(false);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "unknown date";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-lg">
        {/* Step 1: Warning */}
        {step === "warning" && (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Before You Cancel
              </AlertDialogTitle>
              <AlertDialogDescription className="text-left">
                You&apos;re about to cancel your <strong className="capitalize">{subscriptionInfo.tier}</strong> subscription.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-4 py-4">
              {/* What you'll lose */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="font-medium text-slate-700 dark:text-slate-300 mb-2">
                  You&apos;ll lose access to:
                </p>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  <li>• Unlimited stock screening</li>
                  <li>• Advanced screener filters</li>
                  <li>• AI-powered analysis (Jovan)</li>
                  <li>• Export to CSV/Excel</li>
                  <li>• Priority support</li>
                </ul>
              </div>

              {/* Billing info */}
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  {subscriptionInfo.daysRemaining && subscriptionInfo.daysRemaining > 0
                    ? `You have ${subscriptionInfo.daysRemaining} days remaining in your billing period (ends ${formatDate(subscriptionInfo.currentPeriodEnd)}).`
                    : "Your subscription will end immediately."}
                </p>
              </div>

              {/* Retention offer */}
              <div className="p-4 border border-brand/30 bg-brand/5 rounded-lg">
                <p className="font-medium text-brand mb-2">
                  Need help? We&apos;re here for you.
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  If you&apos;re having issues, our support team can help resolve them before you cancel.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/contact?subject=Subscription%20Help")}
                >
                  Contact Support
                </Button>
              </div>
            </div>

            <AlertDialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Keep My Subscription
              </Button>
              <Button
                variant="destructive"
                onClick={handleNextStep}
              >
                Continue to Cancel
              </Button>
            </AlertDialogFooter>
          </>
        )}

        {/* Step 2: Feedback Collection */}
        {step === "feedback" && (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                Tell Us Why You&apos;re Canceling
              </AlertDialogTitle>
              <AlertDialogDescription>
                This helps us improve. Your feedback is valuable.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-6 py-4">
              {/* Reason selection */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  What&apos;s the main reason for canceling? (select at least one)
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {CANCELLATION_REASONS.map((reason) => (
                    <button
                      key={reason.id}
                      type="button"
                      onClick={() => handleReasonToggle(reason.id)}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-lg border text-sm transition-colors",
                        selectedReasons.includes(reason.id)
                          ? "border-brand bg-brand/10 text-brand"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      )}
                    >
                      <reason.icon className="h-4 w-4" />
                      <span>{reason.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom reason */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Other reason (optional)
                </Label>
                <Textarea
                  placeholder="Tell us more about why you're canceling..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="resize-none"
                  rows={2}
                />
              </div>

              {/* Satisfaction score */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  How satisfied were you with our service?
                </Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setSatisfactionScore(score)}
                      className={cn(
                        "flex flex-col items-center p-2 rounded-lg border transition-colors",
                        satisfactionScore === score
                          ? score <= 2
                            ? "border-red-300 bg-red-50 text-red-600"
                            : score === 3
                            ? "border-amber-300 bg-amber-50 text-amber-600"
                            : "border-green-300 bg-green-50 text-green-600"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                      )}
                    >
                      {score <= 2 ? (
                        <Sad className="h-5 w-5" />
                      ) : score === 3 ? (
                        <Meh className="h-5 w-5" />
                      ) : (
                        <Smile className="h-5 w-5" />
                      )}
                      <span className="text-xs mt-1">{score}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Would return */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Would you consider returning in the future?
                </Label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setWouldReturn(true)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors",
                      wouldReturn === true
                        ? "border-green-300 bg-green-50 text-green-600"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    )}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    Yes, I might return
                  </button>
                  <button
                    type="button"
                    onClick={() => setWouldReturn(false)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors",
                      wouldReturn === false
                        ? "border-red-300 bg-red-50 text-red-600"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    )}
                  >
                    <ThumbsDown className="h-4 w-4" />
                    No, unlikely
                  </button>
                </div>
              </div>

              {/* Additional comments */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Any other comments? (optional)
                </Label>
                <Textarea
                  placeholder="Suggestions, issues, or anything else you'd like us to know..."
                  value={additionalComments}
                  onChange={(e) => setAdditionalComments(e.target.value)}
                  className="resize-none"
                  rows={2}
                />
              </div>
            </div>

            <AlertDialogFooter>
              <Button variant="outline" onClick={handleBackStep}>
                Back
              </Button>
              <Button
                variant="destructive"
                onClick={handleNextStep}
                disabled={selectedReasons.length === 0}
              >
                Continue
              </Button>
            </AlertDialogFooter>
          </>
        )}

        {/* Step 3: Final Confirmation */}
        {step === "confirm" && (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                <XCircle className="h-5 w-5" />
                Final Confirmation
              </AlertDialogTitle>
              <AlertDialogDescription>
                Choose when you want your subscription to end.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-4 py-4">
              {/* Cancel timing options */}
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <input
                    type="radio"
                    name="cancelType"
                    checked={!cancelImmediately}
                    onChange={() => setCancelImmediately(false)}
                    className="mt-1 h-4 w-4 accent-brand"
                  />
                  <div>
                    <p className="font-medium">Keep access until billing period ends</p>
                    <p className="text-sm text-slate-500">
                      {subscriptionInfo.currentPeriodEnd
                        ? `You&apos;ll keep {subscriptionInfo.tier} features until ${formatDate(subscriptionInfo.currentPeriodEnd)}. No charges after that.`
                        : "Your subscription will end at the end of your current billing period."}
                    </p>
                    <p className="text-xs text-green-600 mt-1">Recommended</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-red-300 bg-red-50 dark:bg-red-900/20 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                  <input
                    type="radio"
                    name="cancelType"
                    checked={cancelImmediately}
                    onChange={() => setCancelImmediately(true)}
                    className="mt-1 h-4 w-4 accent-red-500"
                  />
                  <div>
                    <p className="font-medium text-red-700">Cancel immediately</p>
                    <p className="text-sm text-red-600">
                      You&apos;ll lose all premium features right now. No refund for remaining days.
                    </p>
                    <p className="text-xs text-red-500 mt-1">
                      {subscriptionInfo.daysRemaining && subscriptionInfo.daysRemaining > 0
                        ? `You&apos;ll forfeit ${subscriptionInfo.daysRemaining} days of access.`
                        : "All access ends immediately."}
                    </p>
                  </div>
                </label>
              </div>

              {/* Feedback summary */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-xs text-slate-500 mb-2">Your feedback:</p>
                <div className="flex flex-wrap gap-1">
                  {selectedReasons.map((r) => (
                    <span
                      key={r}
                      className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-xs capitalize"
                    >
                      {r.replace("_", " ")}
                    </span>
                  ))}
                </div>
                {satisfactionScore && (
                  <p className="text-xs text-slate-500 mt-2">
                    Satisfaction: {satisfactionScore}/5
                  </p>
                )}
              </div>
            </div>

            <AlertDialogFooter>
              <Button variant="outline" onClick={handleBackStep}>
                Back
              </Button>
              <Button
                variant="outline"
                onClick={handleClose}
                className="text-green-600 border-green-300 hover:bg-green-50"
              >
                Keep Subscription
              </Button>
              <Button
                variant="destructive"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                Cancel Subscription
              </Button>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}