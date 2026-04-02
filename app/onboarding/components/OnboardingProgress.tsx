"use client";

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  return (
    <div className="flex justify-center gap-2 mb-8" role="navigation" aria-label="Onboarding progress">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div
          key={step}
          className={`w-3 h-3 rounded-full transition-all duration-300 ${
            step === currentStep
              ? "bg-blue-600 dark:bg-blue-500 scale-110"
              : step < currentStep
              ? "bg-blue-400 dark:bg-blue-600"
              : "bg-slate-200 dark:bg-slate-700"
          }`}
          aria-label={`Step ${step} of ${totalSteps}${step === currentStep ? " (current)" : step < currentStep ? " (completed)" : ""}`}
          aria-current={step === currentStep ? "step" : undefined}
        />
      ))}
    </div>
  );
}
