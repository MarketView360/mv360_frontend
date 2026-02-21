"use client";

import { useState } from "react";
import { X, Mail, User, Phone, Globe, Loader2, Bell } from "lucide-react";

interface WaitlistDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WaitlistFormData) => Promise<void>;
}

export interface WaitlistFormData {
  name: string;
  email: string;
  phone?: string;
  country?: string;
}

export function WaitlistDialog({ isOpen, onClose, onSubmit }: WaitlistDialogProps) {
  const [formData, setFormData] = useState<WaitlistFormData>({
    name: "",
    email: "",
    phone: "",
    country: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof WaitlistFormData, string>>>({});

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof WaitlistFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
      // Reset form
      setFormData({ name: "", email: "", phone: "", country: "" });
    } catch (error) {
      // Error is handled by parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>

        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Join Premium Waitlist
            </h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Be the first to know when MarketView360 Premium launches!
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                  errors.name
                    ? "border-red-500 dark:border-red-500"
                    : "border-slate-300 dark:border-slate-600"
                } bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="John Doe"
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                  errors.email
                    ? "border-red-500 dark:border-red-500"
                    : "border-slate-300 dark:border-slate-600"
                } bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="john@example.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Phone (Optional) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Phone <span className="text-slate-400 text-xs">(optional)</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          {/* Country (Optional) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Country <span className="text-slate-400 text-xs">(optional)</span>
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="United States"
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Joining...
              </>
            ) : (
              <>
                <Bell className="w-4 h-4" />
                Join Waitlist
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative py-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-xs text-slate-500 bg-white dark:bg-slate-900">
                Or
              </span>
            </div>
          </div>

          {/* Sign up link */}
          <div className="text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              Already have an account or want to sign up?
            </p>
            <a
              href="/auth/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              Sign in or Create Free Account →
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
