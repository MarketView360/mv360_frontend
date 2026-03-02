"use client";

import { useState } from "react";
import { AlertCircle, X, Calendar, Clock, Info } from "lucide-react";
import { formatMaintenanceTime, type MaintenanceStatus } from "@/lib/maintenance";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface MaintenanceBannerProps {
  maintenance: MaintenanceStatus;
}

export function MaintenanceBanner({ maintenance }: MaintenanceBannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const timeStr = formatMaintenanceTime(
    maintenance.scheduled_at,
    maintenance.ends_at
  );

  return (
    <>
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-amber-950/30 border-b border-amber-200 dark:border-amber-900/50">
        <div className="mx-auto max-w-[1600px] px-4 md:px-8 lg:px-12">
          <div className="flex items-center justify-between gap-4 py-2.5">
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-3 min-w-0 flex-1 justify-center text-center group"
            >
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-medium text-slate-900 dark:text-white truncate">
                Scheduled maintenance: {timeStr}
              </span>
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="shrink-0 p-1 rounded-md hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="bg-amber-100 dark:bg-amber-950/50 p-2.5 rounded-lg">
                <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-xl">
                  {maintenance.title || "Scheduled Maintenance"}
                </DialogTitle>
                <DialogDescription className="mt-1.5">
                  We&apos;ll be performing maintenance to enhance your experience
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Timeline */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                    Scheduled Time
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {timeStr}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            {maintenance.description && (
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                  What to Expect
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {maintenance.description}
                </p>
              </div>
            )}

            {/* What happens during maintenance */}
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-900/50">
              <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4" />
                During Maintenance
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1 ml-6 list-disc">
                <li>Our platform will be temporarily unavailable</li>
                <li>Any active sessions may be interrupted</li>
                <li>We recommend saving your work beforehand</li>
              </ul>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => setIsOpen(false)}
                variant="default"
                className="flex-1 bg-brand text-slate-900 font-semibold hover:bg-brand/90 dark:bg-brand dark:text-white dark:hover:bg-brand/90"
              >
                Got it, thanks!
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
