"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import {
  XCircle,
  AlertTriangle,
  ArrowRight,
  Loader2,
  CreditCard,
  RefreshCw,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function SubscriptionFailedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);

  const errorCode = searchParams.get("error_code") || "";
  const errorDesc = searchParams.get("error_description") || "Payment could not be completed";
  const planName = searchParams.get("plan") || "Premium";
  const paymentId = searchParams.get("payment_id") || "";

  useEffect(() => {
    if (authLoading) return;

    setLoading(false);

    // Must be logged in to see this page
    if (!session) {
      router.replace("/auth/login?redirect=/pricing");
      return;
    }
  }, [authLoading, session, router]);

  const errorMessages: Record<string, string> = {
    BAD_REQUEST_ERROR: "Invalid payment request. Please try again.",
    GATEWAY_ERROR: "Payment gateway error. Please try a different payment method.",
    PAYMENT_AUTH_ERROR: "Payment authorization failed. Please check your card details.",
    PAYMENT_DECLINED: "Payment was declined by your bank. Please try a different card.",
    INSUFFICIENT_FUNDS: "Insufficient funds on your card.",
    TRANSACTION_FORBIDDEN: "Transaction not permitted. Please contact your bank.",
    INTERNAL_SERVER_ERROR: "Server error occurred. Please contact support.",
    RATE_LIMIT_ERROR: "Too many attempts. Please wait and try again later.",
  };

  const displayError = errorMessages[errorCode] || errorDesc;

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  // Not logged in - will redirect
  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Error Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full mb-6">
            <XCircle className="h-10 w-10 text-red-500" />
          </div>

          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Payment Failed
          </h1>

          <p className="text-slate-600 dark:text-slate-400">
            We couldn&apos;t complete your {planName} subscription payment.
          </p>
        </div>

        {/* Error Details Card */}
        <Card className="border-red-200 dark:border-red-800 shadow-xl mb-6">
          <CardContent className="p-6">
            {/* Error Message */}
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-6 border border-red-100 dark:border-red-900">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="font-medium text-red-700 dark:text-red-300">Error</p>
                  <p className="text-sm text-red-600 dark:text-red-400">{displayError}</p>
                </div>
              </div>
            </div>

            {/* Error Code */}
            {errorCode && (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 mb-4">
                <p className="text-xs text-slate-500">Error Code</p>
                <p className="text-sm font-mono">{errorCode}</p>
              </div>
            )}

            {/* Payment ID if available */}
            {paymentId && (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 mb-4">
                <p className="text-xs text-slate-500">Payment Reference</p>
                <p className="text-sm font-mono">{paymentId}</p>
              </div>
            )}

            {/* Help Section */}
            <div className="space-y-3 mb-6">
              <p className="text-sm text-slate-600 dark:text-slate-400">What you can do:</p>
              <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Try a different payment method
                </li>
                <li className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Wait a few minutes and try again
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Contact support@marketview360.io
                </li>
              </ul>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3">
              <Link href="/pricing">
                <Button className="w-full bg-brand hover:bg-brand/90">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </Link>
              <Link href="/settings/billing">
                <Button variant="outline" className="w-full">
                  View Billing
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Support Link */}
        <p className="text-center text-sm text-slate-400 dark:text-slate-500">
          Need help? Email us at{" "}
          <a href="mailto:support@marketview360.io" className="text-brand hover:underline">
            support@marketview360.io
          </a>
        </p>
      </div>
    </div>
  );
}