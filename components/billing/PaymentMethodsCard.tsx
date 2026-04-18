"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  Plus,
  CheckCircle,
  Trash2,
  Star,
  AlertTriangle,
  Loader2,
  Edit2,
  Shield,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/providers/AuthProvider";
import { paymentApi, PaymentMethod } from "@/lib/api/payment";
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

const cardBrandIcons: Record<string, string> = {
  visa: "💳",
  mastercard: "💳",
  amex: "💳",
  discover: "💳",
  rupay: "💳",
};

const cardBrandColors: Record<string, string> = {
  visa: "text-blue-600",
  mastercard: "text-orange-600",
  amex: "text-green-600",
  discover: "text-purple-600",
};

export function PaymentMethodsCard() {
  const { session } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (session?.access_token) {
      fetchPaymentMethods();
    }
  }, [session?.access_token]);

  const fetchPaymentMethods = async () => {
    if (!session?.access_token) return;
    setIsLoading(true);
    try {
      const methods = await paymentApi.getPaymentMethods(session.access_token);
      setPaymentMethods(methods);
    } catch (err) {
      toast.error("Failed to load payment methods");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefault = async (methodId: string) => {
    if (!session?.access_token) return;
    setActionLoading(methodId);
    try {
      await paymentApi.setDefaultPaymentMethod(session.access_token, methodId);
      toast.success("Default payment method updated");
      await fetchPaymentMethods();
    } catch (err) {
      toast.error("Failed to update default payment method");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!session?.access_token || !methodToDelete) return;
    setActionLoading(methodToDelete);
    try {
      await paymentApi.deletePaymentMethod(session.access_token, methodToDelete);
      toast.success("Payment method removed");
      await fetchPaymentMethods();
    } catch (err) {
      toast.error("Failed to remove payment method");
    } finally {
      setActionLoading(null);
      setShowDeleteDialog(false);
      setMethodToDelete(null);
    }
  };

  const getCardIcon = (brand?: string) => {
    return cardBrandIcons[brand?.toLowerCase() || ""] || "💳";
  };

  const getCardColor = (brand?: string) => {
    return cardBrandColors[brand?.toLowerCase() || ""] || "text-slate-600";
  };

  const formatMethodType = (type: string) => {
    const typeLabels: Record<string, string> = {
      card: "Credit/Debit Card",
      upi: "UPI",
      netbanking: "Net Banking",
      wallet: "Wallet",
      other: "Other",
    };
    return typeLabels[type] || type;
  };

  const getExpiryStatus = (month?: number, year?: number) => {
    if (!month || !year) return null;
    const now = new Date();
    const expiry = new Date(year, month);
    const monthsUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);

    if (monthsUntilExpiry < 0) {
      return { status: "expired", label: "Expired" };
    } else if (monthsUntilExpiry < 3) {
      return { status: "expiring", label: "Expiring soon" };
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-brand" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Methods
          </CardTitle>
          {paymentMethods.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => toast.info("Add new payment method during next subscription checkout")}>
              <Plus className="h-4 w-4 mr-1" />
              Add New
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {paymentMethods.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full mb-3">
              <CreditCard className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-2">
              No payment methods saved
            </p>
            <p className="text-sm text-slate-500 mb-4">
              Your payment method will be saved automatically when you subscribe to a plan.
            </p>
            <Button variant="outline" asChild>
              <a href="/pricing">
                <Plus className="h-4 w-4 mr-2" />
                Subscribe to a Plan
              </a>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Default method info */}
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Default Payment Method
                </span>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                This card will be used for automatic subscription renewals.
              </p>
            </div>

            {/* Payment methods list */}
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`p-4 rounded-lg border ${
                  method.isDefault
                    ? "border-brand bg-brand/5"
                    : "border-slate-200 dark:border-slate-700"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {/* Card icon */}
                    <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <span className={`text-xl ${getCardColor(method.cardBrand)}`}>
                        {getCardIcon(method.cardBrand)}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium capitalize">
                          {method.cardBrand || formatMethodType(method.methodType)}
                        </span>
                        {method.isDefault && (
                          <Badge variant="default" className="bg-brand text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Default
                          </Badge>
                        )}
                      </div>

                      {/* Card details */}
                      {method.methodType === "card" && (
                        <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                          <span className="font-mono">•••• {method.cardLast4}</span>
                          {method.cardType && (
                            <span className="capitalize">{method.cardType}</span>
                          )}
                          {method.cardExpiryMonth && method.cardExpiryYear && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {method.cardExpiryMonth}/{method.cardExpiryYear}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Expiry warning */}
                      {method.methodType === "card" && (
                        (() => {
                          const expiryStatus = getExpiryStatus(
                            method.cardExpiryMonth,
                            method.cardExpiryYear
                          );
                          if (expiryStatus?.status === "expired") {
                            return (
                              <div className="flex items-center gap-1 mt-2 text-xs text-red-500">
                                <AlertTriangle className="h-3 w-3" />
                                This card has expired
                              </div>
                            );
                          } else if (expiryStatus?.status === "expiring") {
                            return (
                              <div className="flex items-center gap-1 mt-2 text-xs text-yellow-500">
                                <AlertTriangle className="h-3 w-3" />
                                {expiryStatus.label}
                              </div>
                            );
                          }
                          return null;
                        })()
                      )}

                      {/* Bank/Issuer */}
                      {method.cardIssuer && (
                        <p className="text-xs text-slate-400 mt-1">{method.cardIssuer}</p>
                      )}

                      {/* Last used */}
                      {method.lastUsedAt && (
                        <p className="text-xs text-slate-400 mt-1">
                          Last used: {new Date(method.lastUsedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {!method.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetDefault(method.id)}
                        disabled={actionLoading !== null}
                        title="Set as default"
                      >
                        {actionLoading === method.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-slate-400" />
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setMethodToDelete(method.id);
                        setShowDeleteDialog(true);
                      }}
                      disabled={actionLoading !== null || method.isDefault}
                      title={method.isDefault ? "Cannot delete default method" : "Remove"}
                      className={method.isDefault ? "opacity-50" : ""}
                    >
                      <Trash2 className="h-4 w-4 text-slate-400 hover:text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add new method hint */}
            <p className="text-xs text-slate-500 text-center pt-2">
              To add a new payment method, complete a subscription checkout with a different card.
            </p>
          </div>
        )}
      </CardContent>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Payment Method?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove this payment method from your account. If it&apos;s your only method,
              you&apos;ll need to add a new one during your next subscription checkout.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMethodToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={actionLoading !== null}
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}