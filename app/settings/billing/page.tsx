"use client";

import { useState, useEffect } from "react";
import {
  Crown, ArrowRight, CreditCard, RefreshCw, XCircle,
  CheckCircle, AlertTriangle, Loader2, Receipt, Clock,
  Shield, Zap, Download, ExternalLink, Gift, Copy,
  ChevronRight, Calendar, TrendingUp, Sparkles, BadgeCheck,
  AlertCircle, BarChart3, Bell, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { toast } from "sonner";
import { usePaymentStatus } from "@/lib/hooks/usePaymentStatus";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/providers/AuthProvider";
import { Payment } from "@/lib/api/payment";
import { PaymentMethodsCard } from "@/components/billing/PaymentMethodsCard";
import { CancellationFeedbackDialog, CancellationFeedback } from "@/components/billing/CancellationFeedbackDialog";
import { trackBillingPageViewed, trackSubscriptionCancelled, trackSubscriptionResumed } from "@/lib/posthog";
import { cn } from "@/lib/utils";

// ─── Constants ───────────────────────────────────────────────────────────────

const PREMIUM_FEATURES = [
  { icon: <Zap       className="h-3.5 w-3.5" />, text: "Unlimited AI-powered analysis" },
  { icon: <BarChart3 className="h-3.5 w-3.5" />, text: "Advanced screener filters" },
  { icon: <Bell      className="h-3.5 w-3.5" />, text: "Real-time price alerts" },
  { icon: <Crown     className="h-3.5 w-3.5" />, text: "Custom watchlists" },
  { icon: <FileText  className="h-3.5 w-3.5" />, text: "Export to CSV / Excel" },
  { icon: <Shield    className="h-3.5 w-3.5" />, text: "Priority support" },
];

type Tier = "free" | "premium" | "max";

const TIER = {
  free:    { accent: "bg-slate-400",  ring: "border-slate-200 dark:border-slate-700",   icon: <Shield   className="h-6 w-6" />, iconBg: "bg-slate-100 dark:bg-slate-800",   iconColor: "text-slate-500 dark:text-slate-400"  },
  premium: { accent: "bg-brand",      ring: "border-brand/30",                           icon: <Crown    className="h-6 w-6" />, iconBg: "bg-amber-50 dark:bg-amber-900/30", iconColor: "text-amber-600 dark:text-amber-400"  },
  max:     { accent: "bg-purple-500", ring: "border-purple-300 dark:border-purple-700",  icon: <Sparkles className="h-6 w-6" />, iconBg: "bg-purple-50 dark:bg-purple-900/30",iconColor: "text-purple-600 dark:text-purple-400" },
} as const;

// ─── Small shared components ─────────────────────────────────────────────────

function TierPill({ tier }: { tier: string }) {
  const map: Record<string, string> = {
    free:    "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600",
    premium: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-300 dark:border-amber-700",
    max:     "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-300 dark:border-purple-700",
  };
  const icons: Record<string, React.ReactNode> = {
    free: <Shield className="h-3 w-3" />, premium: <Crown className="h-3 w-3" />, max: <Sparkles className="h-3 w-3" />,
  };
  return (
    <span className={cn("inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border", map[tier] ?? map.free)}>
      {icons[tier] ?? icons.free}
      {tier.charAt(0).toUpperCase() + tier.slice(1)}
    </span>
  );
}

function SubStatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    active:   "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700",
    paused:   "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600",
    canceled: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-300 dark:border-red-700",
    past_due: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 border-orange-300 dark:border-orange-700",
    expired:  "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600",
    pending:  "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700",
  };
  const icons: Record<string, React.ReactNode> = {
    active: <CheckCircle className="h-3 w-3" />, paused: <Clock className="h-3 w-3" />,
    canceled: <XCircle className="h-3 w-3" />, past_due: <AlertTriangle className="h-3 w-3" />,
    expired: <Clock className="h-3 w-3" />, pending: <Clock className="h-3 w-3" />,
  };
  const labels: Record<string, string> = { past_due: "Past Due" };
  return (
    <span className={cn("inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize", map[status] ?? map.expired)}>
      {icons[status] ?? icons.expired}
      {labels[status] ?? status.replace("_", " ")}
    </span>
  );
}

function PayStatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    captured:   "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700",
    authorized: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-300 dark:border-blue-700",
    pending:    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700",
    failed:     "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-300 dark:border-red-700",
    refunded:   "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600",
  };
  const labels: Record<string, string> = { captured: "Paid" };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize", map[status] ?? map.pending)}>
      {labels[status] ?? status}
    </span>
  );
}

function StatTile({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="flex flex-col gap-1 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[10px] font-semibold uppercase tracking-widest mb-0.5">
        {icon}{label}
      </div>
      <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{value}</p>
      {sub && <p className="text-[10px] text-slate-400 dark:text-slate-500">{sub}</p>}
    </div>
  );
}

function AlertBanner({
  variant, icon, title, body, action,
}: {
  variant: "purple" | "yellow" | "red" | "orange";
  icon: React.ReactNode;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  const cls = {
    purple: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700 text-purple-800 dark:text-purple-200",
    yellow: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200",
    red:    "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200",
    orange: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700 text-orange-800 dark:text-orange-200",
  }[variant];
  const subCls = {
    purple: "text-purple-600 dark:text-purple-300",
    yellow: "text-yellow-700 dark:text-yellow-300",
    red:    "text-red-600 dark:text-red-300",
    orange: "text-orange-600 dark:text-orange-300",
  }[variant];
  return (
    <div className={cn("flex items-start gap-3 p-4 rounded-xl border", cls)}>
      <span className="shrink-0 mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        <p className={cn("text-xs mt-0.5", subCls)}>{body}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// ─── Formatters ───────────────────────────────────────────────────────────────

const fmtDate = (s?: string) =>
  s ? new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const fmtCurrency = (n: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const { session }                       = useAuth();
  const { profile, loading: profLoad }    = useProfile(session?.access_token || null);
  const {
    subscription, payments, isLoading: payLoad,
    refetch, daysUntilExpiry,
  } = usePaymentStatus();

  const [actionLoading, setActionLoading]   = useState<string | null>(null);
  const [showCancel, setShowCancel]         = useState(false);
  const [loadingInv, setLoadingInv]         = useState<Record<string, boolean>>({});

  const isLoading            = payLoad || profLoad;
  const profileTier          = profile?.subscription_tier || "free";
  const hasActiveSub         = subscription?.status === "active";
  const effectiveTier        = hasActiveSub ? (subscription?.plan?.tier || "free") : profileTier;
  const isEffectivePremium   = effectiveTier === "premium" || effectiveTier === "max";
  const isManualOrGifted     = !hasActiveSub && isEffectivePremium;
  const isCancelPending      = !!subscription?.cancelAtPeriodEnd;
  const isPastDue            = subscription?.status === "past_due";
  const tierCfg              = TIER[(effectiveTier as Tier)] ?? TIER.free;

  useEffect(() => { if (!isLoading) trackBillingPageViewed(effectiveTier); }, [isLoading, effectiveTier]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleCancelWithFeedback = async (feedback: CancellationFeedback, cancelImmediately: boolean) => {
    if (!session?.access_token) return;
    setActionLoading("cancel");
    try {
      const { paymentApi } = await import("@/lib/api/payment");
      await paymentApi.cancelWithFeedback(session.access_token, feedback, cancelImmediately);
      trackSubscriptionCancelled(effectiveTier, cancelImmediately, feedback.reasons, feedback.satisfactionScore);
      toast.success(cancelImmediately ? "Subscription canceled" : "Subscription will cancel at period end", {
        description: cancelImmediately ? "You've been downgraded to the free plan." : "You'll retain access until your billing period ends.",
      });
      setShowCancel(false);
      refetch();
    } catch (err) {
      toast.error("Failed to cancel subscription", { description: err instanceof Error ? err.message : "Please try again." });
    } finally { setActionLoading(null); }
  };

  const handleResume = async () => {
    if (!session?.access_token) return;
    setActionLoading("resume");
    try {
      const { paymentApi } = await import("@/lib/api/payment");
      await paymentApi.resumeSubscription(session.access_token);
      trackSubscriptionResumed(effectiveTier);
      toast.success("Subscription restored");
      refetch();
    } catch (err) {
      toast.error("Failed to restore subscription", { description: err instanceof Error ? err.message : "Please try again." });
    } finally { setActionLoading(null); }
  };

  const handleGetInvoice = async (paymentId: string) => {
    if (!session?.access_token) return;
    setLoadingInv(p => ({ ...p, [paymentId]: true }));
    try {
      const { paymentApi } = await import("@/lib/api/payment");
      const r = await paymentApi.getInvoiceUrl(session.access_token, paymentId);
      if (r.invoiceUrl) { window.open(r.invoiceUrl, "_blank"); }
      else {
        try {
          const g = await paymentApi.generateInvoice(session.access_token, paymentId);
          window.open(g.invoiceUrl, "_blank");
          toast.success("Invoice generated");
          refetch();
        } catch { toast.error("Invoice not available", { description: "Please contact support." }); }
      }
    } catch (err) {
      toast.error("Failed to fetch invoice", { description: err instanceof Error ? err.message : "Please try again." });
    } finally { setLoadingInv(p => ({ ...p, [paymentId]: false })); }
  };

  const copyClip = (text: string) => { navigator.clipboard.writeText(text); toast.success("Copied!"); };

  // ── Loading ───────────────────────────────────────────────────────────────────

  if (isLoading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-brand" />
      <p className="text-sm text-slate-500 dark:text-slate-400">Loading billing details…</p>
    </div>
  );

  // ── FREE TIER ─────────────────────────────────────────────────────────────────

  if (!isEffectivePremium) return (
    <div className="w-full max-w-2xl mx-auto px-4 py-10 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Billing &amp; Subscription</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your plan and payments.</p>
      </div>

      {/* Current plan */}
      <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="h-1.5 w-full bg-slate-300 dark:bg-slate-700" />
        <CardContent className="p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Shield className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            </div>
            <div>
              <div className="flex items-center gap-2"><span className="text-sm font-bold text-slate-900 dark:text-white">Free Plan</span><TierPill tier="free" /></div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Limited access</p>
            </div>
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white shrink-0">$0<span className="text-sm font-normal text-slate-500">/mo</span></p>
        </CardContent>
      </Card>

      {/* Upgrade CTA */}
      <Card className="border-2 border-brand/40 bg-gradient-to-br from-brand/5 to-amber-50/40 dark:from-brand/10 dark:to-amber-900/10 dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="h-1.5 w-full bg-brand" />
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-1">
            <Crown className="h-4 w-4 text-brand" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Upgrade to Premium</h2>
            <span className="px-1.5 py-0.5 rounded bg-brand text-white text-[10px] font-bold">Recommended</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">Unlock the full platform — AI analysis, advanced screening, and more.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
            {PREMIUM_FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200">
                <span className="h-5 w-5 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">{f.icon}</span>
                {f.text}
              </div>
            ))}
          </div>
          <Link href="/pricing">
            <Button className="w-full bg-brand hover:bg-brand/90 text-white font-semibold h-10">
              <Crown className="h-4 w-4 mr-2" />View Plans<ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      <PaymentMethodsCard />
    </div>
  );

  // ── PREMIUM / MAX TIER ────────────────────────────────────────────────────────

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-10 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Billing &amp; Subscription</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your plan and payments.</p>
        </div>
        <Button
          variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}
          className="shrink-0 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", isLoading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* ── Alert banners ── */}
      {isManualOrGifted && (
        <AlertBanner
          variant="purple"
          icon={<Gift className="h-4 w-4 text-purple-500" />}
          title="Premium Access Granted"
          body={`Your ${effectiveTier} access was granted manually — no billing subscription is active.`}
          action={<TierPill tier={effectiveTier} />}
        />
      )}
      {subscription?.status === "pending" && (
        <AlertBanner
          variant="yellow"
          icon={<AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />}
          title="Payment Pending"
          body="Complete your payment to activate access."
          action={
            <Link href="/pricing">
              <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold text-xs h-8">Complete</Button>
            </Link>
          }
        />
      )}
      {isPastDue && (
        <AlertBanner
          variant="red"
          icon={<AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />}
          title="Payment Past Due"
          body="Your last payment failed. Update your payment method to keep access."
        />
      )}
      {isCancelPending && (
        <AlertBanner
          variant="orange"
          icon={<AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />}
          title="Subscription Ending"
          body={`Access ends ${fmtDate(subscription?.currentPeriodEnd)}. Resume anytime before then.`}
          action={
            <Button
              size="sm"
              onClick={handleResume}
              disabled={actionLoading !== null}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs h-8 shrink-0"
            >
              {actionLoading === "resume" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><RefreshCw className="h-3.5 w-3.5 mr-1" />Resume</>}
            </Button>
          }
        />
      )}

      {/* ── Plan card ── */}
      <Card className={cn("border-2 overflow-hidden shadow-sm bg-white dark:bg-slate-900", tierCfg.ring)}>
        <div className={cn("h-1.5 w-full", tierCfg.accent)} />
        <CardContent className="p-5">

          {/* Plan header */}
          <div className="flex items-start justify-between gap-3 mb-5">
            <div className="flex items-center gap-3 min-w-0">
              <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shrink-0", tierCfg.iconBg)}>
                <span className={tierCfg.iconColor}>{tierCfg.icon}</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {subscription?.plan?.name || `${effectiveTier.charAt(0).toUpperCase() + effectiveTier.slice(1)} Plan`}
                  </h2>
                  <TierPill tier={effectiveTier} />
                  {isManualOrGifted && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700">
                      <Gift className="h-2.5 w-2.5" />Gifted
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {subscription && <SubStatusPill status={subscription.status} />}
                  {isCancelPending && (
                    <span className="text-[10px] font-medium text-orange-600 dark:text-orange-400">Cancels {fmtDate(subscription?.currentPeriodEnd)}</span>
                  )}
                </div>
              </div>
            </div>
            {hasActiveSub && subscription?.plan?.amountUsd !== undefined && (
              <div className="text-right shrink-0">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{fmtCurrency(subscription.plan.amountUsd)}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">per {subscription.plan.billingPeriod === "annual" ? "year" : "month"}</p>
              </div>
            )}
          </div>

          {hasActiveSub ? (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
                <StatTile icon={<CreditCard className="h-3 w-3" />} label="Billing" value={<span className="capitalize">{subscription?.plan?.billingPeriod || "Monthly"}</span>} />
                <StatTile icon={<Calendar className="h-3 w-3" />}   label="Renews"  value={fmtDate(subscription?.currentPeriodEnd)} />
                <StatTile icon={<Clock className="h-3 w-3" />}      label="Days Left" value={daysUntilExpiry !== null ? `${daysUntilExpiry}` : "—"} sub={daysUntilExpiry !== null ? "days remaining" : undefined} />
                <StatTile icon={<TrendingUp className="h-3 w-3" />} label="Since"   value={fmtDate(subscription?.createdAt)} />
              </div>

              {/* Subscription ID */}
              {subscription?.razorpaySubscriptionId && (
                <div className="flex items-center justify-between px-3 py-2.5 mb-5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">Subscription ID</p>
                    <p className="text-xs font-mono text-slate-700 dark:text-slate-200 truncate">{subscription.razorpaySubscriptionId}</p>
                  </div>
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => copyClip(subscription.razorpaySubscriptionId || "")}
                    className="ml-2 shrink-0 h-8 w-8 p-0 text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}

              <Separator className="mb-4 bg-slate-200 dark:bg-slate-700" />

              {/* Actions */}
              <div className="flex flex-wrap gap-2.5">
                {effectiveTier === "premium" && process.env.NEXT_PUBLIC_ENABLE_MAX_PLAN === "true" && (
                  <Link href="/pricing">
                    <Button size="sm" className="bg-brand hover:bg-brand/90 text-white font-semibold">
                      <Sparkles className="h-3.5 w-3.5 mr-1.5" />Upgrade to Max
                    </Button>
                  </Link>
                )}
                {subscription?.status === "active" && !isCancelPending && (
                  <Button
                    variant="outline" size="sm"
                    onClick={() => setShowCancel(true)}
                    disabled={actionLoading !== null}
                    className="border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 font-medium"
                  >
                    <XCircle className="h-3.5 w-3.5 mr-1.5" />Cancel Subscription
                  </Button>
                )}
                {isCancelPending && (
                  <Button
                    variant="outline" size="sm"
                    onClick={handleResume}
                    disabled={actionLoading !== null}
                    className="border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 font-medium"
                  >
                    {actionLoading === "resume" ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5 mr-1.5" />}
                    Keep Subscription
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                No active billing subscription. Your <strong>{effectiveTier}</strong> access was granted manually.
              </p>
              <Link href="/pricing">
                <Button variant="outline" size="sm" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium">
                  <CreditCard className="h-3.5 w-3.5 mr-1.5" />Set Up Billing
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── What's included ── */}
      <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <BadgeCheck className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">What's included</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {PREMIUM_FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-200">
                <span className="h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                  <CheckCircle className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                </span>
                {f.text}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Payment Methods ── */}
      <PaymentMethodsCard />

      {/* ── Payment History ── */}
      <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Payment History</h2>
            </div>
            {payments.length > 0 && (
              <span className="text-xs text-slate-400 dark:text-slate-500">{payments.length} transaction{payments.length !== 1 ? "s" : ""}</span>
            )}
          </div>

          {payments.length === 0 ? (
            <div className="flex flex-col items-center py-10 gap-2">
              <Receipt className="h-8 w-8 text-slate-300 dark:text-slate-600" />
              <p className="text-sm text-slate-500 dark:text-slate-400">No payments yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {payments.map((payment: Payment) => (
                <div
                  key={payment.id}
                  className="flex items-center gap-3 py-3 px-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                    <CreditCard className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {fmtCurrency(payment.amount, payment.currency)}
                      </span>
                      <PayStatusPill status={payment.status} />
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span className="text-xs text-slate-500 dark:text-slate-400">{fmtDate(payment.createdAt)}</span>
                      {payment.cardLast4 && (
                        <>
                          <span className="text-slate-300 dark:text-slate-600">·</span>
                          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 capitalize">
                            {payment.cardBrand && `${payment.cardBrand} `}···· {payment.cardLast4}
                          </span>
                        </>
                      )}
                    </div>
                    {payment.razorpayPaymentId && (
                      <button
                        onClick={() => copyClip(payment.razorpayPaymentId || "")}
                        className="flex items-center gap-1 mt-0.5 group"
                      >
                        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 truncate max-w-[160px]">
                          {payment.razorpayPaymentId}
                        </span>
                        <Copy className="h-2.5 w-2.5 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 shrink-0" />
                      </button>
                    )}
                  </div>

                  {payment.status === "captured" && (
                    <Button
                      variant="outline" size="sm"
                      onClick={() => handleGetInvoice(payment.id)}
                      disabled={loadingInv[payment.id]}
                      className="shrink-0 h-8 text-xs border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                    >
                      {loadingInv[payment.id]
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <><Download className="h-3.5 w-3.5 mr-1" />Invoice{payment.invoiceUrl && <ExternalLink className="h-3 w-3 ml-1 text-slate-400" />}</>
                      }
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Support nudge ── */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Need help with billing?</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">We usually respond within a few hours.</p>
        </div>
        <a href="mailto:support@yourdomain.com" className="shrink-0">
          <Button
            variant="outline" size="sm"
            className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
          >
            Contact Support<ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </a>
      </div>

      {/* ── Cancellation dialog ── */}
      <CancellationFeedbackDialog
        open={showCancel}
        onOpenChange={setShowCancel}
        onCancel={handleCancelWithFeedback}
        subscriptionInfo={{
          tier: effectiveTier,
          billingPeriod: subscription?.plan?.billingPeriod || "monthly",
          daysRemaining: daysUntilExpiry || undefined,
          currentPeriodEnd: subscription?.currentPeriodEnd,
        }}
        loading={actionLoading === "cancel"}
      />
    </div>
  );
}