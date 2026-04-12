"use client";

import { useState } from "react";
import {
  Crown,
  ArrowRight,
  CreditCard,
  Calendar,
  Download,
  RefreshCw,
  PauseCircle,
  PlayCircle,
  XCircle,
  CheckCircle,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Receipt,
  Clock,
  Shield,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { toast } from "sonner";
import { usePaymentStatus } from "@/lib/hooks/usePaymentStatus";
import { useAuth } from "@/providers/AuthProvider";
import { paymentApi, Payment } from "@/lib/api/payment";
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
  const {
    subscription,
    plans,
    payments,
    isLoading,
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

  const handlePause = async () => {
    if (!session?.access_token) return;
    setActionLoading("pause");
    try {
      await paymentApi.pauseSubscription(session.access_token);
      toast.success("Subscription paused", {
        description: "You can resume anytime.",
      });
      refetch();
    } catch (err) {
      toast.error("Failed to pause subscription", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleResume = async () => {
    if (!session?.access_token) return;
    setActionLoading("resume");
    try {
      await paymentApi.resumeSubscription(session.access_token);
      toast.success("Subscription resumed", {
        description: "Welcome back!",
      });
      refetch();
    } catch (err) {
      toast.error("Failed to resume subscription", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!session?.access_token) return;
    setActionLoading("cancel");
    try {
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
      paused: { variant: "secondary", icon: <PauseCircle className="h-3 w-3" /> },
      canceled: { variant: "destructive", icon: <XCircle className="h-3 w-3" /> },
      past_due: { variant: "destructive", icon: <AlertTriangle className="h-3 w-3" /> },
      expired: { variant: "outline", icon: <Clock className="h-3 w-3" /> },
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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  // Free tier / No subscription
  if (isFree) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center space-y-6 mb-12">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Billing & Subscription
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            You're currently on the <strong>Free</strong> plan.
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
      </div>
    );
  }

  // Active subscription view
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

      {/* Current Plan */}
      <Card className="mb-6 border-2 border-brand/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-brand" />
              {subscription?.plan?.name || "Premium"}
            </CardTitle>
            {subscription && getStatusBadge(subscription.status)}
          </div>
        </CardHeader>
        <CardContent>
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

          {/* Warning for canceling at period end */}
          {subscription?.cancelAtPeriodEnd && (
            <div className="flex items-center gap-3 p-4 mb-6 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  Subscription Ending
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Your subscription will end on {formatDate(subscription.currentPeriodEnd)}.
                  You can resume to keep your access.
                </p>
              </div>
            </div>
          )}

          {/* Subscription Actions */}
          <div className="flex flex-wrap gap-3">
            {subscription?.status === "active" && !subscription.cancelAtPeriodEnd && (
              <>
                <Button
                  variant="outline"
                  onClick={handlePause}
                  disabled={actionLoading !== null}
                >
                  {actionLoading === "pause" ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <PauseCircle className="h-4 w-4 mr-2" />
                  )}
                  Pause Subscription
                </Button>
                <Button
                  variant="outline"
                  className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                  onClick={() => setShowCancelDialog(true)}
                  disabled={actionLoading !== null}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Subscription
                </Button>
              </>
            )}
            {subscription?.status === "paused" && (
              <Button onClick={handleResume} disabled={actionLoading !== null}>
                {actionLoading === "resume" ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <PlayCircle className="h-4 w-4 mr-2" />
                )}
                Resume Subscription
              </Button>
            )}
            {subscription?.cancelAtPeriodEnd && (
              <Button onClick={handleResume} disabled={actionLoading !== null}>
                {actionLoading === "resume" ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Keep Subscription
              </Button>
            )}
            <Link href="/pricing">
              <Button variant="outline">
                <ArrowRight className="h-4 w-4 mr-2" />
                Change Plan
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

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
                      <p className="text-sm text-slate-500">
                        {formatDate(payment.createdAt)}
                        {payment.cardLast4 && ` • •••• ${payment.cardLast4}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getPaymentStatusBadge(payment.status)}
                    {payment.invoiceUrl && (
                      <a
                        href={payment.invoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </a>
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
              Choose how you'd like to cancel your subscription.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <label className="flex items-start gap-3 p-4 rounded-lg border cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
              <input
                type="radio"
                name="cancelType"
                checked={!cancelImmediately}
                onChange={() => setCancelImmediately(false)}
                className="mt-1"
              />
              <div>
                <p className="font-medium">Cancel at period end</p>
                <p className="text-sm text-slate-500">
                  Keep access until {formatDate(subscription?.currentPeriodEnd)}
                </p>
              </div>
            </label>
            <label className="flex items-start gap-3 p-4 rounded-lg border cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
              <input
                type="radio"
                name="cancelType"
                checked={cancelImmediately}
                onChange={() => setCancelImmediately(true)}
                className="mt-1"
              />
              <div>
                <p className="font-medium">Cancel immediately</p>
                <p className="text-sm text-slate-500">
                  Lose access right away (no refund for remaining period)
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
