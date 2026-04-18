"use client";

import { useState, useEffect } from "react";
import {
  CreditCard, Plus, CheckCircle, Trash2, Star,
  AlertTriangle, Loader2, Shield, Calendar, Banknote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/providers/AuthProvider";
import { paymentApi, PaymentMethod } from "@/lib/api/payment";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

// Brand colours (text only — no background images needed)
const BRAND_COLORS: Record<string, string> = {
  visa:       "text-blue-600 dark:text-blue-400",
  mastercard: "text-orange-600 dark:text-orange-400",
  amex:       "text-sky-600 dark:text-sky-400",
  discover:   "text-purple-600 dark:text-purple-400",
  rupay:      "text-green-600 dark:text-green-400",
};

const METHOD_TYPE_LABELS: Record<string, string> = {
  card:       "Card",
  upi:        "UPI",
  netbanking: "Net Banking",
  wallet:     "Wallet",
  other:      "Other",
};

function CardNetworkIcon({ brand }: { brand?: string }) {
  const b = brand?.toLowerCase() ?? "";
  return (
    <div className={cn(
      "h-10 w-14 rounded-lg flex items-center justify-center text-xs font-black tracking-tight border",
      "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700",
      BRAND_COLORS[b] ?? "text-slate-500 dark:text-slate-400",
    )}>
      {b ? b.toUpperCase() : <CreditCard className="h-5 w-5" />}
    </div>
  );
}

function ExpiryBadge({ month, year }: { month?: number; year?: number }) {
  if (!month || !year) return null;
  const now = new Date();
  const months = (new Date(year, month).getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
  if (months < 0) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700">
      <AlertTriangle className="h-2.5 w-2.5" /> Expired
    </span>
  );
  if (months < 3) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700">
      <AlertTriangle className="h-2.5 w-2.5" /> Expiring soon
    </span>
  );
  return null;
}

export function PaymentMethodsCard() {
  const { session } = useAuth();
  const [methods, setMethods]             = useState<PaymentMethod[]>([]);
  const [loading, setLoading]             = useState(true);
  const [actionId, setActionId]           = useState<string | null>(null);
  const [deleteId, setDeleteId]           = useState<string | null>(null);

  useEffect(() => {
    if (session?.access_token) load();
  }, [session?.access_token]);

  const load = async () => {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      setMethods(await paymentApi.getPaymentMethods(session.access_token));
    } catch {
      toast.error("Failed to load payment methods");
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    if (!session?.access_token) return;
    setActionId(id);
    try {
      await paymentApi.setDefaultPaymentMethod(session.access_token, id);
      toast.success("Default payment method updated");
      await load();
    } catch {
      toast.error("Failed to update default payment method");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async () => {
    if (!session?.access_token || !deleteId) return;
    setActionId(deleteId);
    try {
      await paymentApi.deletePaymentMethod(session.access_token, deleteId);
      toast.success("Payment method removed");
      await load();
    } catch {
      toast.error("Failed to remove payment method");
    } finally {
      setActionId(null);
      setDeleteId(null);
    }
  };

  return (
    <>
      <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="h-1.5 w-full bg-slate-300 dark:bg-slate-700" />
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400"><CreditCard className="h-4 w-4" /></span>
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Payment Methods</h2>
            </div>
            {methods.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.info("Add a new card during your next checkout")}
                className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-xs h-8"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add New
              </Button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-brand" />
            </div>
          ) : methods.length === 0 ? (
            /* ── Empty state ── */
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
              <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <CreditCard className="h-7 w-7 text-slate-400 dark:text-slate-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No payment methods</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[220px]">
                  Your card will be saved automatically when you subscribe.
                </p>
              </div>
              <a href="/pricing">
                <Button size="sm" variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium">
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Subscribe to a Plan
                </Button>
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Auto-renewal note */}
              <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
                <Shield className="h-4 w-4 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Your <strong>default</strong> card is charged automatically at each renewal.
                </p>
              </div>

              {/* Method list */}
              {methods.map(m => {
                const isDefault = m.isDefault;
                const busy      = actionId === m.id;
                return (
                  <div
                    key={m.id}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-xl border transition-all",
                      isDefault
                        ? "border-brand/40 bg-brand/5 dark:bg-brand/10"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600",
                    )}
                  >
                    {/* Network logo */}
                    <CardNetworkIcon brand={m.cardBrand} />

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white capitalize">
                          {m.cardBrand || METHOD_TYPE_LABELS[m.methodType] || m.methodType}
                        </span>
                        {m.cardLast4 && (
                          <span className="font-mono text-sm text-slate-600 dark:text-slate-300">
                            ···· {m.cardLast4}
                          </span>
                        )}
                        {isDefault && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand text-white">
                            <Star className="h-2.5 w-2.5" /> Default
                          </span>
                        )}
                        <ExpiryBadge month={m.cardExpiryMonth} year={m.cardExpiryYear} />
                      </div>

                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        {m.cardType && (
                          <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">{m.cardType}</span>
                        )}
                        {m.cardExpiryMonth && m.cardExpiryYear && (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                            <Calendar className="h-3 w-3" />
                            {String(m.cardExpiryMonth).padStart(2, "0")}/{m.cardExpiryYear}
                          </span>
                        )}
                        {m.cardIssuer && (
                          <span className="text-xs text-slate-400 dark:text-slate-500">{m.cardIssuer}</span>
                        )}
                        {m.lastUsedAt && (
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            Used {new Date(m.lastUsedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {!isDefault && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSetDefault(m.id)}
                          disabled={actionId !== null}
                          title="Set as default"
                          className="h-8 w-8 p-0 text-slate-400 dark:text-slate-500 hover:text-brand hover:bg-brand/10"
                        >
                          {busy
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : <CheckCircle className="h-4 w-4" />
                          }
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(m.id)}
                        disabled={actionId !== null || isDefault}
                        title={isDefault ? "Cannot remove default method" : "Remove card"}
                        className={cn(
                          "h-8 w-8 p-0",
                          isDefault
                            ? "opacity-30 cursor-not-allowed text-slate-400 dark:text-slate-600"
                            : "text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        )}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}

              <p className="text-[11px] text-center text-slate-400 dark:text-slate-500 pt-1">
                To add a new card, complete a checkout with a different card.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={v => { if (!v) setDeleteId(null); }}>
        <AlertDialogContent className="max-w-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white">Remove this card?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
              This card will be removed from your account. You'll need to add a new one during your next checkout if it's your only method.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              onClick={() => setDeleteId(null)}
              className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Keep Card
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={actionId !== null}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              {actionId ? <Loader2 className="h-4 w-4 animate-spin" /> : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}