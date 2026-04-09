"use client";

const STEP_LABELS = ["Identity", "Background", "Interests", "Preferences"];

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function OnboardingProgress({
  currentStep,
  totalSteps,
}: OnboardingProgressProps) {
  return (
    <nav
      aria-label="Onboarding progress"
      className="mb-8 flex items-center justify-center gap-0"
    >
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step, idx) => {
        const isCompleted = step < currentStep;
        const isCurrent = step === currentStep;

        return (
          <div key={step} className="flex items-center">
            {/* Step node */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                aria-label={`Step ${step} of ${totalSteps}: ${STEP_LABELS[idx]}${isCurrent ? " (current)" : isCompleted ? " (completed)" : ""}`}
                aria-current={isCurrent ? "step" : undefined}
                className={`
                  flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold
                  ring-1 transition-all duration-500
                  ${
                    isCompleted
                      ? "bg-blue-500 ring-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.4)]"
                      : isCurrent
                      ? "bg-blue-600 ring-blue-500/60 text-white shadow-[0_0_18px_rgba(59,130,246,0.5)] scale-110"
                      : "bg-slate-200 dark:bg-slate-800 ring-slate-300 dark:ring-slate-700 text-slate-500 dark:text-slate-500"
                  }
                `}
              >
                {isCompleted ? (
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 8l3.5 3.5L13 4.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  step
                )}
              </div>

              {/* Label */}
              <span
                className={`hidden sm:block text-[10px] font-medium uppercase tracking-widest transition-colors duration-300 ${
                  isCurrent
                    ? "text-blue-600 dark:text-blue-400"
                    : isCompleted
                    ? "text-slate-500 dark:text-slate-400"
                    : "text-slate-400 dark:text-slate-600"
                }`}
              >
                {STEP_LABELS[idx]}
              </span>
            </div>

            {/* Connector line */}
            {idx < totalSteps - 1 && (
              <div className="relative mx-2 mb-5 h-px w-12 sm:w-16 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="absolute inset-y-0 left-0 bg-blue-500 transition-all duration-700 ease-out"
                  style={{ width: isCompleted ? "100%" : "0%" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}