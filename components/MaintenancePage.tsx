"use client";

import { Construction, Clock, AlertTriangle } from "lucide-react";
import { formatMaintenanceTime } from "@/lib/maintenance";

interface MaintenancePageProps {
  title?: string | null;
  description?: string | null;
  scheduledAt?: string | null;
  endsAt?: string | null;
}

export function MaintenancePage({
  title,
  description,
  scheduledAt,
  endsAt,
}: MaintenancePageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4">
      <div className="max-w-2xl w-full">
        {/* Main Card */}
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
          {/* Decorative gradient bar */}
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500" />
          
          <div className="p-8 md:p-12">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-500/20 dark:bg-amber-500/10 rounded-full blur-2xl" />
                <div className="relative bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-950/50 dark:to-orange-950/50 p-6 rounded-full border-2 border-amber-200 dark:border-amber-800">
                  <Construction className="w-12 h-12 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-center text-slate-900 dark:text-white mb-4">
              {title || "We're Upgrading Our Systems"}
            </h1>

            {/* Description */}
            <p className="text-center text-slate-600 dark:text-slate-300 text-lg mb-8 leading-relaxed">
              {description ||
                "We're currently performing scheduled maintenance to improve your experience. Our platform will be back online shortly. Thank you for your patience!"}
            </p>

            {/* Time Info */}
            {(scheduledAt || endsAt) && (
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-start gap-4">
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                    <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                      Estimated Timeline
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {formatMaintenanceTime(scheduledAt, endsAt)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Status indicator */}
            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
                <span>Maintenance in progress</span>
              </div>
            </div>

            {/* Support Info */}
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" />
                <p>
                  If you need immediate assistance, please contact our support team at{" "}
                  <a
                    href="mailto:support@finsaas.com"
                    className="text-brand hover:underline font-medium"
                  >
                    support@finsaas.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer text */}
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
          We appreciate your understanding and patience
        </p>
      </div>
    </div>
  );
}
