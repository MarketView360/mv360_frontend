"use client";

import { useRouter } from "next/navigation";
import { UserCircle, ArrowRight } from "lucide-react";

interface CompleteSetupCardProps {
  className?: string;
}

export function CompleteSetupCard({ className = "" }: CompleteSetupCardProps) {
  const router = useRouter();

  return (
    <div
      className={`p-4 rounded-xl border-2 border-dashed border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20 ${className}`}
    >
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex-shrink-0">
          <UserCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
            Complete your profile setup
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
            Help us personalize your experience by completing the quick onboarding wizard.
          </p>
          <button
            onClick={() => router.push("/onboarding?resume=true")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Complete Setup
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
