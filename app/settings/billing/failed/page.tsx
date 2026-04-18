"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { usePaymentStatus } from "@/lib/hooks/usePaymentStatus";
import {
  XCircle,
  AlertTriangle,
  ArrowRight,
  Loader2,
  CreditCard,
  RefreshCw,
  Mail,
  HelpCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

// Common payment errors and their solutions
const PAYMENT_ERROR_GUIDANCE: Record<string, {
  title: string;
  description: string;
  solutions: string[];
  severity: "high" | "medium" | "low";
}> = {
  PAYMENT_DECLINED: {
    title: "Payment Declined by Card Issuer",
    description: "Your card issuer rejected this transaction. This is common and usually easy to fix.",
    solutions: [
      "Check if your card has sufficient available credit/balance",
      "Verify your card details are correct (number, expiry, CVV)",
      "Try a different card (Visa or Mastercard work best)",
      "Contact your card issuer to authorize the transaction",
    ],
    severity: "high",
  },
  INSUFFICIENT_FUNDS: {
    title: "Insufficient Funds",
    description: "Your card doesn't have enough available balance for this payment.",
    solutions: [
      "Check your available credit/balance and try again",
      "Use a different card with sufficient balance",
      "Contact your card issuer if you believe this is an error",
    ],
    severity: "high",
  },
  BAD_REQUEST_ERROR: {
    title: "Invalid Payment Request",
    description: "Something went wrong with the payment setup.",
    solutions: [
      "Refresh the page and try again",
      "Clear your browser cache and retry",
      "Use a different browser if the issue persists",
    ],
    severity: "medium",
  },
  GATEWAY_ERROR: {
    title: "Payment Gateway Issue",
    description: "Our payment processor encountered a temporary issue.",
    solutions: [
      "Wait 5-10 minutes and try again",
      "Try a different payment method",
      "Contact support if problem persists after 30 minutes",
    ],
    severity: "medium",
  },
  RATE_LIMIT_ERROR: {
    title: "Too Many Attempts",
    description: "You've made too many payment attempts recently.",
    solutions: [
      "Wait 30 minutes before trying again",
      "Contact support if you need immediate assistance",
    ],
    severity: "medium",
  },
  TRANSACTION_FORBIDDEN: {
    title: "Transaction Not Permitted",
    description: "Your card issuer doesn't allow this type of transaction.",
    solutions: [
      "Contact your card issuer to enable online transactions",
      "Try a different card (Visa or Mastercard have fewer restrictions)",
      "Ask your card issuer to whitelist MarketView360",
    ],
    severity: "high",
  },
  PAYMENT_AUTH_ERROR: {
    title: "Authentication Failed",
    description: "The payment verification step failed.",
    solutions: [
      "Complete the 3D Secure authentication step from your card issuer",
      "Check that your card supports online authentication",
      "Try again and carefully follow all authentication prompts",
    ],
    severity: "medium",
  },
  VERIFICATION_FAILED: {
    title: "Payment Verification Failed",
    description: "We couldn't verify the payment completion on our end.",
    solutions: [
      "Check your bank account - payment might still have succeeded",
      "Wait 5 minutes and check your billing page",
      "Contact support with your payment reference if money was deducted",
    ],
    severity: "high",
  },
  INTERNAL_SERVER_ERROR: {
    title: "Server Error",
    description: "An unexpected error occurred on our systems.",
    solutions: [
      "Wait a few minutes and try again",
      "Contact support with the error details below",
    ],
    severity: "low",
  },
};

export default function SubscriptionFailedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, loading: authLoading } = useAuth();
  const { subscription, refetch } = usePaymentStatus();

  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [showAllSolutions, setShowAllSolutions] = useState(false);

  const errorCode = searchParams.get("error_code") || "";
  const errorDesc = searchParams.get("error_description") || "Payment could not be completed";
  const planName = searchParams.get("plan") || "Premium";
  const paymentId = searchParams.get("payment_id") || "";

  useEffect(() => {
    if (authLoading) return;

    setLoading(false);

    // Must be logged in
    if (!session) {
      router.replace("/auth/login?redirect=/pricing");
      return;
    }
  }, [authLoading, session, router]);

  // Get guidance for this specific error
  const errorGuidance = PAYMENT_ERROR_GUIDANCE[errorCode] || {
    title: "Payment Failed",
    description: errorDesc,
    solutions: [
      "Try again with the same card",
      "Use a different card (Visa or Mastercard recommended)",
      "Contact support if the issue persists",
    ],
    severity: "medium",
  };

  // Retry payment - redirects to pricing
  const handleRetry = async () => {
    setRetrying(true);
    // Refetch subscription to check if there's a pending one to resume
    await refetch();
    router.push("/pricing");
  };

  // Check if payment might have succeeded despite error
  const handleCheckStatus = async () => {
    setRetrying(true);
    await refetch();

    if (subscription?.status === "active") {
      toast.success("Payment successful!", {
        description: "Your subscription is now active.",
      });
      router.push("/settings/billing");
    } else if (subscription?.status === "pending") {
      toast.info("Payment pending", {
        description: "Your payment is still processing. Please wait a few minutes.",
      });
    } else {
      toast.info("No active subscription found", {
        description: "The payment did not complete. Please try again.",
      });
    }
    setRetrying(false);
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  if (!session) return null;

  const severityColors = {
    high: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    medium: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
    low: "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700",
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Payment Could Not Be Completed
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Don&apos;t worry — this happens sometimes and is usually easy to fix.
          </p>
        </div>

        {/* Error Details Card */}
        <Card className={`mb-6 ${severityColors[errorGuidance.severity]}`}>
          <CardHeader className="pb-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className={`h-5 w-5 ${
                errorGuidance.severity === "high" ? "text-red-500" :
                errorGuidance.severity === "medium" ? "text-yellow-500" : "text-slate-500"
              }`} />
              <div>
                <CardTitle className="text-lg">{errorGuidance.title}</CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {errorGuidance.description}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Solutions */}
            <div className="space-y-3 mb-6">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                What you can do:
              </p>
              <div className="space-y-2">
                {errorGuidance.solutions
                  .slice(0, showAllSolutions ? undefined : 2)
                  .map((solution, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">{solution}</span>
                    </div>
                  ))}
                {errorGuidance.solutions.length > 2 && (
                  <button
                    onClick={() => setShowAllSolutions(!showAllSolutions)}
                    className="text-sm text-brand hover:text-brand/80 flex items-center gap-1"
                  >
                    {showAllSolutions ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        Show fewer options
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        Show more options ({errorGuidance.solutions.length - 2} more)
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Reference Info */}
            {(errorCode || paymentId) && (
              <div className="bg-white dark:bg-slate-900 rounded-lg p-3 mb-4 border border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500 mb-2">Reference Details</p>
                <div className="space-y-1">
                  {errorCode && (
                    <p className="text-sm font-mono">
                      <span className="text-slate-400">Error:</span> {errorCode}
                    </p>
                  )}
                  {paymentId && (
                    <p className="text-sm font-mono">
                      <span className="text-slate-400">Payment ID:</span> {paymentId}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid sm:grid-cols-2 gap-3">
              <Button
                onClick={handleRetry}
                disabled={retrying}
                className="bg-brand hover:bg-brand/90"
              >
                {retrying ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={handleCheckStatus}
                disabled={retrying}
              >
                <Clock className="h-4 w-4 mr-2" />
                Check Payment Status
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods Guide */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-5 w-5" />
              Payment Methods That Work Best
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-sm">Visa</span>
                </div>
                <p className="text-xs text-slate-500">
                  Widely accepted with high success rate and reliable support.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4 text-orange-500" />
                  <span className="font-medium text-sm">Mastercard</span>
                </div>
                <p className="text-xs text-slate-500">
                  Excellent compatibility and global acceptance.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4 text-green-500" />
                  <span className="font-medium text-sm">American Express</span>
                </div>
                <p className="text-xs text-slate-500">
                  Full Amex support with premium card benefits.
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4">
              While regional cards may work, Visa, Mastercard, and American Express offer the best reliability.
            </p>
          </CardContent>
        </Card>

        {/* If money was deducted */}
        <Card className="mb-6 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  If money was deducted but payment failed
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Sometimes banks deduct money but the transaction fails. If this happened:
                </p>
                <ul className="text-sm text-slate-600 dark:text-slate-400 mt-2 space-y-1 list-disc list-inside">
                  <li>Wait 5-10 minutes — funds usually auto-refund</li>
                  <li>Check your billing page for subscription status</li>
                  <li>If not refunded after 24 hours, contact support with payment ID</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support Section */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Still having trouble?</p>
                  <p className="text-sm text-slate-500">
                    Our support team can help resolve payment issues quickly.
                  </p>
                </div>
              </div>
              <Link href={`/contact?subject=Payment%20Issue&ref=${encodeURIComponent(paymentId || errorCode)}`}>
                <Button variant="outline" size="sm">
                  Contact Support
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-slate-400">
          <p>
            Your payment details are secure. We never store your full card information.
          </p>
          <p className="mt-1">
            <Link href="/help/billing" className="text-brand hover:underline">
              View payment FAQ
            </Link>
            •
            <Link href="/settings/billing" className="text-brand hover:underline">
              Go to billing
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}