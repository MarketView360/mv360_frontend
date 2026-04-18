"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  XCircle, AlertTriangle, Loader2, DollarSign, Clock, List,
  Bug, Headphones, ArrowLeftRight, Hourglass, Frown, Meh,
  Smile, ThumbsUp, ThumbsDown, ChevronLeft, ChevronRight,
  Crown, Shield, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CANCELLATION_REASONS = [
  { id: "price",             label: "Too expensive",             icon: DollarSign },
  { id: "not_using",         label: "Not using it enough",       icon: List },
  { id: "found_alternative", label: "Found an alternative",      icon: ArrowLeftRight },
  { id: "missing_features",  label: "Missing features",          icon: Sparkles },
  { id: "technical_issues",  label: "Technical issues / bugs",   icon: Bug },
  { id: "support_issues",    label: "Support expectations",      icon: Headphones },
  { id: "temporary_pause",   label: "Temporary pause",           icon: Hourglass },
  { id: "moving_platform",   label: "Moving platforms",          icon: ArrowLeftRight },
];

const WHAT_YOU_LOSE = [
  "Unlimited AI-powered stock analysis",
  "Advanced screener filters",
  "Custom watchlists & alerts",
  "Export to CSV / Excel",
  "Priority support",
];

export interface CancellationFeedback {
  reasons: string[];
  customReason?: string;
  satisfactionScore?: number;
  wouldReturn?: boolean;
  additionalComments?: string;
}

interface Props {
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

type Step = "warning" | "feedback" | "confirm";

const STEPS: Step[] = ["warning", "feedback", "confirm"];
const STEP_LABELS = ["Overview", "Feedback", "Confirm"];

function StepIndicator({ current }: { current: Step }) {
  const idx = STEPS.indexOf(current);
  return (
    <div className="flex items-center justify-center gap-2 mb-5">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div className={cn(
            "h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all",
            i < idx  ? "bg-brand text-white"
            : i === idx ? "bg-brand text-white ring-4 ring-brand/20"
            : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
          )}>
            {i < idx ? "✓" : i + 1}
          </div>
          <span className={cn(
            "text-xs font-medium hidden sm:block",
            i === idx ? "text-slate-800 dark:text-slate-100" : "text-slate-400 dark:text-slate-500"
          )}>{STEP_LABELS[i]}</span>
          {i < STEPS.length - 1 && (
            <div className={cn("h-px w-6 transition-all", i < idx ? "bg-brand" : "bg-slate-200 dark:bg-slate-700")} />
          )}
        </div>
      ))}
    </div>
  );
}

export function CancellationFeedbackDialog({ open, onOpenChange, onCancel, subscriptionInfo, loading }: Props) {
  const router = useRouter();
  const [step, setStep]                     = useState<Step>("warning");
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [customReason, setCustomReason]       = useState("");
  const [satisfactionScore, setSatisfaction]  = useState<number | undefined>();
  const [wouldReturn, setWouldReturn]         = useState<boolean | undefined>();
  const [additionalComments, setComments]     = useState("");
  const [cancelImmediately, setCancelNow]     = useState(false);

  const reset = () => {
    setStep("warning"); setSelectedReasons([]); setCustomReason("");
    setSatisfaction(undefined); setWouldReturn(undefined); setComments(""); setCancelNow(false);
  };

  const handleClose = () => { onOpenChange(false); reset(); };

  const toggleReason = (id: string) =>
    setSelectedReasons(p => p.includes(id) ? p.filter(r => r !== id) : [...p, id]);

  const next = () => {
    if (step === "warning")  setStep("feedback");
    if (step === "feedback" && selectedReasons.length > 0) setStep("confirm");
  };
  const back = () => {
    if (step === "confirm")  setStep("feedback");
    if (step === "feedback") setStep("warning");
  };

  const handleSubmit = async () => {
    await onCancel({
      reasons: selectedReasons,
      customReason: customReason.trim() || undefined,
      satisfactionScore,
      wouldReturn,
      additionalComments: additionalComments.trim() || undefined,
    }, cancelImmediately);
    reset();
  };

  const fmtDate = (s?: string) =>
    s ? new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

  const tierLabel = subscriptionInfo.tier.charAt(0).toUpperCase() + subscriptionInfo.tier.slice(1);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      {/* max-w + max-h + overflow scroll prevents going off-screen */}
      <DialogContent className="w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">

        {/* Coloured header strip */}
        <div className="h-1.5 w-full rounded-t-2xl bg-red-500" />

        <div className="p-5 sm:p-6">
          <StepIndicator current={step} />

          {/* ── STEP 1: Warning ─────────────────────────────────────── */}
          {step === "warning" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                  Before you cancel
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  You're about to cancel your <span className="font-semibold text-slate-700 dark:text-slate-200">{tierLabel}</span> subscription.
                </p>
              </div>

              {/* Lose access */}
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">You'll lose access to</p>
                <ul className="space-y-2">
                  {WHAT_YOU_LOSE.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                      <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Days remaining */}
              {(subscriptionInfo.daysRemaining ?? 0) > 0 && (
                <div className="flex items-start gap-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 p-4">
                  <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    You still have <strong>{subscriptionInfo.daysRemaining} days</strong> left — access continues until{" "}
                    <strong>{fmtDate(subscriptionInfo.currentPeriodEnd)}</strong> if you cancel now.
                  </p>
                </div>
              )}

              {/* Support offer */}
              <div className="flex items-start gap-3 rounded-xl bg-brand/5 border border-brand/20 p-4">
                <Shield className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">Having issues?</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    Our team can often fix problems faster than you'd expect.
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push("/contact?subject=Subscription%20Help")}
                    className="text-xs font-semibold text-brand hover:underline"
                  >
                    Contact support →
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 pt-1">
                <Button
                  variant="outline"
                  className="flex-1 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                  onClick={handleClose}
                >
                  Keep Subscription
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold"
                  onClick={next}
                >
                  Continue
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Feedback ─────────────────────────────────────── */}
          {step === "feedback" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Why are you leaving?</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Select at least one reason. Your feedback genuinely helps.</p>
              </div>

              {/* Reason chips */}
              <div className="grid grid-cols-2 gap-2">
                {CANCELLATION_REASONS.map(r => {
                  const active = selectedReasons.includes(r.id);
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => toggleReason(r.id)}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-xl border text-sm font-medium text-left transition-all",
                        active
                          ? "border-red-400 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                          : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                      )}
                    >
                      <r.icon className={cn("h-4 w-4 shrink-0", active ? "text-red-500" : "text-slate-400 dark:text-slate-500")} />
                      <span className="leading-tight">{r.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom reason */}
              <div>
                <Label className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 block">
                  Other reason <span className="normal-case font-normal">(optional)</span>
                </Label>
                <Textarea
                  placeholder="Tell us in your own words…"
                  value={customReason}
                  onChange={e => setCustomReason(e.target.value)}
                  className="resize-none text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-brand"
                  rows={2}
                />
              </div>

              {/* Satisfaction */}
              <div>
                <Label className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3 block">
                  Overall satisfaction
                </Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(n => {
                    const active = satisfactionScore === n;
                    const icon = n <= 2 ? <Frown className="h-5 w-5" /> : n === 3 ? <Meh className="h-5 w-5" /> : <Smile className="h-5 w-5" />;
                    const colors = active
                      ? n <= 2 ? "border-red-400 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                        : n === 3 ? "border-amber-400 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                        : "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                      : "border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600";
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setSatisfaction(n)}
                        className={cn("flex-1 flex flex-col items-center py-2.5 rounded-xl border transition-all", colors)}
                      >
                        {icon}
                        <span className="text-xs mt-1 font-semibold">{n}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Would return */}
              <div>
                <Label className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3 block">
                  Might you return later?
                </Label>
                <div className="flex gap-3">
                  {[
                    { val: true,  Icon: ThumbsUp,   label: "Maybe yes", active: "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" },
                    { val: false, Icon: ThumbsDown, label: "Unlikely",   active: "border-red-400 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300" },
                  ].map(({ val, Icon, label, active }) => (
                    <button
                      key={String(val)}
                      type="button"
                      onClick={() => setWouldReturn(val)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all",
                        wouldReturn === val
                          ? active
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comments */}
              <div>
                <Label className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 block">
                  Anything else? <span className="normal-case font-normal">(optional)</span>
                </Label>
                <Textarea
                  placeholder="Suggestions, issues, anything else…"
                  value={additionalComments}
                  onChange={e => setComments(e.target.value)}
                  className="resize-none text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  rows={2}
                />
              </div>

              <div className="flex gap-3 pt-1">
                <Button
                  variant="outline"
                  onClick={back}
                  className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold disabled:opacity-40"
                  onClick={next}
                  disabled={selectedReasons.length === 0}
                >
                  Continue
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Confirm ──────────────────────────────────────── */}
          {step === "confirm" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                  One last step
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Choose when your subscription ends.</p>
              </div>

              {/* Timing options */}
              <div className="space-y-3">
                {/* End of period — recommended */}
                <label className={cn(
                  "flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                  !cancelImmediately
                    ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                )}>
                  <input
                    type="radio" name="cancelType" checked={!cancelImmediately}
                    onChange={() => setCancelNow(false)}
                    className="mt-1 accent-emerald-500"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        Keep access until {fmtDate(subscriptionInfo.currentPeriodEnd)}
                      </p>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                        Recommended
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      No further charges. You keep all features until your period ends.
                    </p>
                  </div>
                </label>

                {/* Immediate */}
                <label className={cn(
                  "flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                  cancelImmediately
                    ? "border-red-400 bg-red-50 dark:bg-red-900/20"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                )}>
                  <input
                    type="radio" name="cancelType" checked={cancelImmediately}
                    onChange={() => setCancelNow(true)}
                    className="mt-1 accent-red-500"
                  />
                  <div>
                    <p className="text-sm font-semibold text-red-700 dark:text-red-400">Cancel immediately</p>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      You lose all premium features right now.
                      {(subscriptionInfo.daysRemaining ?? 0) > 0 &&
                        ` You forfeit ${subscriptionInfo.daysRemaining} remaining days with no refund.`}
                    </p>
                  </div>
                </label>
              </div>

              {/* Feedback summary pill row */}
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Your feedback summary</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedReasons.map(r => (
                    <span key={r} className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium capitalize">
                      {r.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
                {satisfactionScore && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Satisfaction: <strong>{satisfactionScore}/5</strong>
                    {wouldReturn !== undefined && <> · Would return: <strong>{wouldReturn ? "Yes" : "No"}</strong></>}
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <Button
                  variant="outline"
                  onClick={back}
                  className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 font-semibold"
                >
                  Keep Subscription
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold"
                >
                  {loading
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <><XCircle className="h-4 w-4 mr-1.5" />Confirm Cancel</>
                  }
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}