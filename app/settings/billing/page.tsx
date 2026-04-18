"use client";

import { useState, useEffect } from "react";
import {
  Crown,
  ArrowRight,
  CreditCard,
  RefreshCw,
  XCircle,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Receipt,
  Clock,
  Shield,
  Zap,
  Download,
  ExternalLink,
  Gift,
  Settings,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { toast } from "sonner";
import { usePaymentStatus } from "@/lib/hooks/usePaymentStatus";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/providers/AuthProvider";
import { Payment } from "@/lib/api/payment";
import { PaymentMethodsCard } from "@/components/billing/PaymentMethodsCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function BillingPage() {
  const { session } = useAuth();
  const { profile, loading: profileLoading } = useProfile(session?.access_token || null);
  const {
    subscription,
    plans,
    payments,
    isLoading: paymentLoading,
    error,
    refetch,
    isPremium,
    isMax,
    isFree,
    daysUntilExpiry,
  } = usePaymentStatus();

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelImmediately, setCancelImmediately] = useState(false);
  const [loadingInvoices, setLoadingInvoices] = useState<Record<string, boolean>>({});

  const isLoading = paymentLoading || profileLoading;

  // Determine actual tier from BOTH sources
  // Profile tier may be set manually (gifted, admin upgrade)
  // Subscription is from Razorpay payment flow
  const profileTier = profile?.subscription_tier || "free";
  const hasActiveSubscription = subscription?.status === "active";

  // User is "premium" if EITHER profile tier OR active subscription
  const effectiveTier = hasActiveSubscription
    ? subscription?.plan?.tier || "free"
    : profileTier;

  const isEffectivePremium = effectiveTier === "premium" || effectiveTier === "max";
  const isEffectiveMax = effectiveTier === "max";

  // Is this a manual/gifted subscription? (no Razorpay subscription but premium tier)
  const isManualOrGifted = !hasActiveSubscription && isEffectivePremium;

  const handleCancel = async () => {
    if (!session?.access_token) return;
    setActionLoading("cancel");
    try {
      const { paymentApi } = await import("@/lib/api/payment");
      await paymentApi.cancelSubscription(
        session.access_token,
        cancelImmediately,
      );
      toast.success(
        cancelImmediately ? "Subscription canceled" : "Subscription will cancel at period end",
        {
          description: cancelImmediately
            ? "You've been downgraded to the free plan."
            : "You'll retain access until your billing period ends.",
        },
      );
      setShowCancelDialog(false);
      refetch();
    } catch (err) {
      toast.error("Failed to cancel subscription", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleResumeCancelled = async () => {
    if (!session?.access_token) return;
    setActionLoading("resume");
    try {
      const { paymentApi } = await import("@/lib/api/payment");
      await paymentApi.resumeSubscription(session.access_token);
      toast.success("Subscription restored", {
        description: "Your subscription will continue as normal.",
      });
      refetch();
    } catch (err) {
      toast.error("Failed to restore subscription", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleGetInvoice = async (paymentId: string) => {
    if (!session?.access_token) return;
    setLoadingInvoices((prev) => ({ ...prev, [paymentId]: true }));
    try {
      const { paymentApi } = await import("@/lib/api/payment");
      const result = await paymentApi.getInvoiceUrl(session.access_token, paymentId);

      if (result.invoiceUrl) {
        window.open(result.invoiceUrl, "_blank");
      } else {
        // Try to generate invoice
        try {
          const generated = await paymentApi.generateInvoice(session.access_token, paymentId);
          window.open(generated.invoiceUrl, "_blank");
          toast.success("Invoice generated", {
            description: "Your invoice has been generated and is ready to download.",
          });
          refetch(); // Refresh to get updated invoice URL
        } catch (genErr) {
          toast.error("Invoice not available", {
            description: "Invoice could not be generated. Please contact support.",
          });
        }
      }
    } catch (err) {
      toast.error("Failed to fetch invoice", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setLoadingInvoices((prev) => ({ ...prev, [paymentId]: false }));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
      active: { variant: "default", icon: <CheckCircle className="h-3 w-3" /> },
      paused: { variant: "secondary", icon: <Clock className="h-3 w-3" /> },
      canceled: { variant: "destructive", icon: <XCircle className="h-3 w-3" /> },
      past_due: { variant: "destructive", icon: <AlertTriangle className="h-3 w-3" /> },
      expired: { variant: "outline", icon: <Clock className="h-3 w-3" /> },
      pending: { variant: "outline", icon: <Clock className="h-3 w-3" /> },
    };
    const config = statusConfig[status] || statusConfig.expired;
    return (
      <Badge variant={config.variant} className="gap-1 capitalize">
        {config.icon}
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      captured: "default",
      authorized: "secondary",
      pending: "outline",
      failed: "destructive",
      refunded: "secondary",
    };
    return (
      <Badge variant={statusConfig[status] || "outline"} className="capitalize">
        {status}
      </Badge>
    );
  };

  const getTierBadge = (tier: string) => {
    const tierColors: Record<string, string> = {
      free: "bg-slate-100 text-slate-600",
      premium: "bg-amber-100 text-amber-700",
      max: "bg-purple-100 text-purple-700",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${tierColors[tier] || tierColors.free}`}>
        {tier}
      </span>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  // Free tier view
  if (!isEffectivePremium) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center space-y-6 mb-12">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Billing & Subscription
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            You&apos;re currently on the <strong className="text-slate-900 dark:text-white">Free</strong> plan.
          </p>
        </div>

        {/* Current Plan Card */}
        <Card className="mb-8 border-2 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-slate-400" />
              Current Plan: Free
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                <Zap className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">AI Queries</p>
                  <p className="font-semibold">Limited</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                <Shield className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Screener Access</p>
                  <p className="font-semibold">Basic</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                <CreditCard className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Price</p>
                  <p className="font-semibold">$0/month</p>
                </div>
              </div>
            </div>
            <Link href="/pricing">
              <Button className="w-full bg-brand hover:bg-brand/90">
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Premium
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* What Premium Includes */}
        <Card className="border-brand/30 bg-brand/5">
          <CardHeader>
            <CardTitle className="text-brand">
              ✨ Unlock Premium Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                "Unlimited AI-powered analysis",
                "Advanced screener filters",
                "Priority support",
                "Custom watchlists",
                "Export to CSV",
                "Real-time alerts",
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-brand" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods (for free users to pre-add) */}
        <PaymentMethodsCard />
      </div>
    );
  }

  // Premium/Max tier view (either paid or manual)
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Billing & Subscription
        </h1>
        <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Manual/Gifted subscription warning */}
      {isManualOrGifted && (
        <Card className="mb-6 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Gift className="h-5 w-5 text-purple-500" />
              <div>
                <p className="font-medium text-purple-700 dark:text-purple-300">
                  Premium Access Granted
                </p>
                <p className="text-sm text-purple-600 dark:text-purple-400">
                  Your {effectiveTier} access has been manually granted. No billing subscription is active.
                </p>
              </div>
              {getTierBadge(effectiveTier)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending subscription warning */}
      {subscription?.status === "pending" && (
        <Card className="mb-6 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div className="flex-1">
                <p className="font-medium text-yellow-700 dark:text-yellow-300">
                  Payment Pending
                </p>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  Your subscription payment is pending. Complete payment to activate your Premium access.
                </p>
              </div>
              <Link href="/pricing">
                <Button size="sm" variant="outline">
                  Complete Payment
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Plan Card */}
      <Card className="mb-6 border-2 border-brand/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-brand" />
              {subscription?.plan?.name || effectiveTier.charAt(0).toUpperCase() + effectiveTier.slice(1)}
              {!hasActiveSubscription && isEffectivePremium && (
                <Badge variant="secondary" className="ml-2">Manual</Badge>
              )}
            </CardTitle>
            {subscription && getStatusBadge(subscription.status)}
          </div>
        </CardHeader>
        <CardContent>
          {hasActiveSubscription ? (
            // Paid subscription details
            <>
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <p className="text-sm text-slate-500 mb-1">Billing Period</p>
                  <p className="font-semibold capitalize">
                    {subscription?.plan?.billingPeriod || "Monthly"}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <p className="text-sm text-slate-500 mb-1">Amount</p>
                  <p className="font-semibold">
                    {formatCurrency(subscription?.plan?.amountUsd || 0)}
                    <span className="text-sm font-normal text-slate-500">
                      /{subscription?.plan?.billingPeriod === "annual" ? "yr" : "mo"}
                    </span>
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <p className="text-sm text-slate-500 mb-1">Current Period Ends</p>
                  <p className="font-semibold">
                    {formatDate(subscription?.currentPeriodEnd)}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <p className="text-sm text-slate-500 mb-1">Days Remaining</p>
                  <p className="font-semibold">
                    {daysUntilExpiry !== null ? `${daysUntilExpiry} days` : "—"}
                  </p>
                </div>
              </div>

              {/* Subscription ID */}
              {subscription.razorpaySubscriptionId && (
                <div className="mb-6 p-3 rounded-lg bg-slate-100 dark:bg-slate-800/50 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500">Subscription ID</p>
                    <p className="text-sm font-mono">{subscription.razorpaySubscriptionId}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(subscription.razorpaySubscriptionId || "")}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {/* Warning for canceling at period end */}
              {subscription?.cancelAtPeriodEnd && (
                <div className="flex items-center gap-3 p-4 mb-6 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <div className="flex-1">
                    <p className="font-medium text-yellow-800 dark:text-yellow-200">
                      Subscription Ending
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Your subscription will end on {formatDate(subscription.currentPeriodEnd)}.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleResumeCancelled}
                    disabled={actionLoading !== null}
                  >
                    {actionLoading === "resume" ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Keep Subscription
                  </Button>
                </div>
              )}

              {/* Subscription Actions */}
              <div className="flex flex-wrap gap-3">
                {subscription?.status === "active" && !subscription.cancelAtPeriodEnd && (
                  <Button
                    variant="outline"
                    className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={() => setShowCancelDialog(true)}
                    disabled={actionLoading !== null}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel Subscription
                  </Button>
                )}
                <Link href="/pricing">
                  <Button variant="outline">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Change Plan
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            // Manual/gifted subscription - no billing details
            <div className="text-center py-6">
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                No billing subscription active. Your {effectiveTier} access was granted manually.
              </p>
              <Link href="/pricing">
                <Button variant="outline">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Set Up Billing
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <PaymentMethodsCard />

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No payments yet</p>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {payments.map((payment: Payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between py-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-slate-500" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {formatCurrency(payment.amount, payment.currency)}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span>{formatDate(payment.createdAt)}</span>
                        {payment.cardLast4 && (
                          <span className="font-mono">•••• {payment.cardLast4}</span>
                        )}
                        {payment.cardBrand && (
                          <span className="capitalize">{payment.cardBrand}</span>
                        )}
                      </div>
                      {payment.razorpayPaymentId && (
                        <p className="text-xs font-mono text-slate-400 mt-1">
                          ID: {payment.razorpayPaymentId}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getPaymentStatusBadge(payment.status)}
                    {payment.status === "captured" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleGetInvoice(payment.id)}
                        disabled={loadingInvoices[payment.id]}
                      >
                        {loadingInvoices[payment.id] ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4 mr-1" />
                        )}
                        Invoice
                        {payment.invoiceUrl && <ExternalLink className="h-3 w-3 ml-1" />}
                      </Button>
                    )}
                    {payment.razorpayPaymentId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(payment.razorpayPaymentId || "")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              Choose how you&apos;d like to cancel your subscription.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <label className="flex items-start gap-3 p-4 rounded-lg border cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <input
                type="radio"
                name="cancelType"
                checked={!cancelImmediately}
                onChange={() => setCancelImmediately(false)}
                className="mt-1 accent-brand"
              />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Cancel at period end</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Keep access until {formatDate(subscription?.currentPeriodEnd)}. No immediate changes.
                </p>
              </div>
            </label>
            <label className="flex items-start gap-3 p-4 rounded-lg border border-red-200 dark:border-red-800 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <input
                type="radio"
                name="cancelType"
                checked={cancelImmediately}
                onChange={() => setCancelImmediately(true)}
                className="mt-1 accent-red-500"
              />
              <div>
                <p className="font-medium text-red-700 dark:text-red-400">Cancel immediately</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Lose access right away. No refund for remaining period.
                </p>
              </div>
            </label>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="bg-red-600 hover:bg-red-700"
              disabled={actionLoading === "cancel"}
            >
              {actionLoading === "cancel" ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Confirm Cancellation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}