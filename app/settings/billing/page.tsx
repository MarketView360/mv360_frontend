"use client";

import { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/providers/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  CreditCard, 
  Crown, 
  Calendar, 
  ArrowUpRight,
  Receipt,
  Download,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

export default function BillingPage() {
  const { session } = useAuth();
  const { profile, loading } = useProfile(session?.access_token || null);
  const [cancellingSubscription, setCancellingSubscription] = useState(false);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const isPremium = profile?.subscription_tier === "premium";

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? You'll lose access to premium features at the end of your billing period.")) {
      return;
    }

    setCancellingSubscription(true);
    try {
      // API call to cancel subscription
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Subscription cancelled. You'll have access until the end of your billing period.");
    } catch {
      toast.error("Failed to cancel subscription");
    } finally {
      setCancellingSubscription(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Billing & Subscription</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your subscription, payment methods, and billing history
        </p>
      </div>

      {/* Current Subscription Status */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5 text-brand" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white capitalize">
                  {profile?.subscription_tier || "Free"}
                </h3>
                {isPremium && (
                  <Badge className="bg-brand text-white border-0">
                    <Crown className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                )}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {isPremium
                  ? "Premium subscription with full access to all features"
                  : "Free plan with limited features"}
              </p>
            </div>
            {isPremium && (
              <div className="text-right">
                <p className="text-3xl font-bold text-slate-900 dark:text-white">$29</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">per month</p>
              </div>
            )}
          </div>

          {!isPremium ? (
            <Button className="w-full bg-brand hover:bg-brand/90 text-white">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Premium
              <ArrowUpRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="w-full">
                  Change Plan
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                  onClick={handleCancelSubscription}
                  disabled={cancellingSubscription}
                >
                  {cancellingSubscription ? "Cancelling..." : "Cancel Subscription"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Method */}
      {isPremium && (
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5 text-green-500" />
              Payment Method
            </CardTitle>
            <CardDescription>Manage your payment information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Visa ending in 4242</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Expires 12/2025</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Update
              </Button>
            </div>

            <Button variant="ghost" className="w-full">
              + Add New Payment Method
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Billing Information */}
      {isPremium && (
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-brand" />
              Billing Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Next Billing Date</p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Billing Cycle</p>
                <p className="font-semibold text-slate-900 dark:text-white">Monthly</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <Label className="text-sm text-slate-500 dark:text-slate-400 mb-2 block">Billing Email</Label>
              <div className="flex gap-2">
                <Input 
                  type="email" 
                  value={profile?.email || ""} 
                  className="flex-1"
                  disabled
                />
                <Button variant="outline" size="sm">
                  Change
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing History */}
      {isPremium && (
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Receipt className="h-5 w-5 text-brand" />
              Billing History
            </CardTitle>
            <CardDescription>View and download your past invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { date: "Dec 1, 2024", amount: "$29.00", status: "Paid" },
                { date: "Nov 1, 2024", amount: "$29.00", status: "Paid" },
                { date: "Oct 1, 2024", amount: "$29.00", status: "Paid" },
              ].map((invoice, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{invoice.date}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Premium Subscription
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-slate-900 dark:text-white">{invoice.amount}</p>
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-0 text-xs">
                        {invoice.status}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full mt-4">
              View All Invoices
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Upgrade CTA for Free Users */}
      {!isPremium && (
        <Card className="border-2 border-brand/20 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand/10">
                <Crown className="h-8 w-8 text-brand" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Unlock Premium Features
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Get unlimited AI chat, advanced screening, BYOK support, and priority support for just $29/month
                </p>
              </div>
              <div className="flex flex-col gap-2 max-w-xs mx-auto">
                <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-brand shrink-0" />
                  <span>20 reasoning requests per day</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-brand shrink-0" />
                  <span>Bring Your Own API Keys</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-brand shrink-0" />
                  <span>Advanced stock screening</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-brand shrink-0" />
                  <span>Priority customer support</span>
                </div>
              </div>
              <Button className="bg-brand hover:bg-brand/90 text-white mt-4">
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Premium
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing Support */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Need Help?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Have questions about billing or need to update your payment information? Our support team is here to help.
          </p>
          <Button variant="outline" className="w-full">
            Contact Billing Support
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
