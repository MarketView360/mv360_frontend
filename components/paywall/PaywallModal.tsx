"use client";

import { useEffect, useCallback } from "react";
import { X, Check, Lock, Crown } from "lucide-react";
import Link from "next/link";
import { TierType } from "./PaywallOverlay";

interface PaywallModalProps {
    isOpen: boolean;
    onClose: () => void;
    tier?: TierType;
    feature?: string;
    benefits?: string[];
}

export function PaywallModal({
    isOpen,
    onClose,
    tier = "premium",
    feature,
    benefits,
}: PaywallModalProps) {
    const handleEscape = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        },
        [onClose]
    );

    useEffect(() => {
        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "";
        };
    }, [isOpen, handleEscape]);

    if (!isOpen) return null;

    const isPremium = tier === "premium";
    const tierName = isPremium ? "Premium" : "Elite";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 fade-in duration-200">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10"
                    aria-label="Close"
                >
                    <X className="w-4 h-4 text-slate-400" />
                </button>

                {/* Content */}
                <div className="p-6 text-center">
                    {/* Icon */}
                    <div className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${isPremium ? "bg-brand/10" : "bg-amber-500/10"}`}>
                        {isPremium ? (
                            <Lock className="w-7 h-7 text-brand" />
                        ) : (
                            <Crown className="w-7 h-7 text-amber-500" />
                        )}
                    </div>

                    {/* Title */}
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                        {feature ? `Unlock ${feature}` : `Upgrade to ${tierName}`}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                        This feature is available on {tierName} and above.
                    </p>

                    {/* Benefits */}
                    {benefits && benefits.length > 0 && (
                        <div className="text-left mb-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                            <ul className="space-y-2.5">
                                {benefits.map((b, i) => (
                                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                                        <Check className="w-4 h-4 text-brand mt-0.5 shrink-0" />
                                        <span>{b}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="space-y-2">
                        <Link
                            href="/pricing"
                            className="w-full inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-semibold text-white bg-brand hover:bg-brand/90 transition-colors text-sm"
                        >
                            View Plans
                        </Link>
                        <button
                            onClick={onClose}
                            className="w-full px-5 py-2 rounded-xl text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Maybe Later
                        </button>
                    </div>

                    {/* Trust */}
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-4">
                        No credit card required · Cancel anytime
                    </p>
                </div>
            </div>
        </div>
    );
}
