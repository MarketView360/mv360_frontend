"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { useAuth } from "@/providers/AuthProvider";
import { useOnboarding } from "@/hooks/useOnboarding";
import { Logo } from "@/components/common/Logo";
import { OnboardingProgress } from "./components/OnboardingProgress";
import { StepIdentity } from "./components/StepIdentity";
import { StepBackground } from "./components/StepBackground";
import { StepInterests } from "./components/StepInterests";
import { StepPreferences } from "./components/StepPreferences";
import { AutoSaveIndicator } from "./components/AutoSaveIndicator";
import { SkipOnboardingLink } from "./components/SkipOnboardingLink";
import { ChevronLeft, Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const posthog = usePostHog();
  const { session, loading: authLoading } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);
  const [showResumeToast, setShowResumeToast] = useState(false);

  const {
    currentStep,
    setCurrentStep,
    isLoading,
    isSaving,
    error,
    setError,
    showSaveIndicator,
    status,
    step1Data,
    setStep1Data,
    step2Data,
    setStep2Data,
    step3Data,
    setStep3Data,
    step4Data,
    setStep4Data,
    fetchStatus,
    saveStep,
    completeOnboarding,
    skipOnboarding,
    goToNextStep,
    goToPreviousStep,
    isCurrentStepValid,
  } = useOnboarding();

  // Initialize onboarding
  useEffect(() => {
    const init = async () => {
      if (authLoading) return;

      if (!session) {
        router.replace("/auth/login");
        return;
      }

      const accessToken = session.access_token;
      const statusData = await fetchStatus(accessToken);

      if (statusData && !statusData.needs_onboarding) {
        // Already onboarded, redirect to dashboard
        router.replace("/market");
        return;
      }

      // Show resume toast if resuming
      if (statusData && statusData.last_completed_step > 0) {
        setShowResumeToast(true);
        setTimeout(() => setShowResumeToast(false), 4000);
      }

      // Pre-fill step1 data from profile if available
      try {
        const profileRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/profile`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        if (profileRes.ok) {
          const profile = await profileRes.json();
          if (profile.full_name || profile.display_name) {
            setStep1Data((prev) => ({
              ...prev,
              full_name: profile.full_name || prev.full_name,
              display_name: profile.display_name || profile.full_name?.split(" ")[0] || prev.display_name,
            }));
          }
        }
      } catch {
        // Ignore errors fetching profile
      }

      setIsInitializing(false);
      
      // Track onboarding started
      posthog?.capture("onboarding_started", {
        resumed: statusData?.last_completed_step ? statusData.last_completed_step > 0 : false,
        subscription_tier: statusData?.subscription_tier || "free",
      });
    };

    init();
  }, [session, authLoading, router, fetchStatus, setStep1Data, posthog]);

  // Auto-save on step change
  useEffect(() => {
    if (!session || isInitializing || currentStep === 1) return;

    const accessToken = session.access_token;
    const stepData = currentStep === 2 ? step1Data : 
                     currentStep === 3 ? step2Data : 
                     currentStep === 4 ? step3Data : null;

    if (stepData) {
      saveStep(accessToken, currentStep - 1, stepData);
    }
  }, [currentStep]);

  const handleNext = async () => {
    if (!isCurrentStepValid()) return;

    // Track step completion
    posthog?.capture("onboarding_step_completed", {
      step: currentStep,
      step_name: ["identity", "background", "interests", "preferences"][currentStep - 1],
    });

    if (currentStep === 4) {
      // Complete onboarding
      if (session) {
        const success = await completeOnboarding(session.access_token);
        if (success) {
          posthog?.capture("onboarding_completed", {
            primary_goal: step2Data.primary_goal,
            professional_role: step2Data.professional_role,
            experience_level: step2Data.experience_level,
            interests_count: step3Data.interests.length,
            subscription_tier: status?.subscription_tier || "free",
          });
        }
      }
    } else {
      // Save current step and move to next
      if (session) {
        const stepData = currentStep === 1 ? step1Data :
                         currentStep === 2 ? step2Data :
                         currentStep === 3 ? step3Data : step4Data;
        await saveStep(session.access_token, currentStep, stepData);
      }
      goToNextStep();
    }
  };

  const handleSkip = async () => {
    // Track skip event
    posthog?.capture("onboarding_skipped", {
      skipped_at_step: currentStep,
      subscription_tier: status?.subscription_tier || "free",
    });

    if (session) {
      await skipOnboarding(session.access_token);
      
      // Schedule reminder email
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/profile/onboarding/schedule-reminder`, {
          method: "POST",
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
      } catch {
        // Non-critical, ignore errors
      }
    }
  };

  if (authLoading || isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Setting up your experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-4 sm:p-6">
        <Logo width={180} height={36} className="h-8 sm:h-9" />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          {/* Resume Toast */}
          {showResumeToast && (
            <div className="mb-6 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-sm text-center animate-fade-in">
              Welcome back — picking up where you left off
            </div>
          )}

          {/* Progress Dots */}
          <OnboardingProgress currentStep={currentStep} totalSteps={4} />

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
              {error}
              <button
                onClick={() => setError(null)}
                className="ml-2 underline hover:no-underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Step Content */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
            {/* Back Button */}
            {currentStep > 1 && (
              <button
                onClick={goToPreviousStep}
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 mb-4 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
            )}

            {/* Step Components */}
            <div className="min-h-[400px]">
              {currentStep === 1 && (
                <StepIdentity data={step1Data} setData={setStep1Data} />
              )}
              {currentStep === 2 && (
                <StepBackground data={step2Data} setData={setStep2Data} />
              )}
              {currentStep === 3 && (
                <StepInterests data={step3Data} setData={setStep3Data} />
              )}
              {currentStep === 4 && (
                <StepPreferences 
                  data={step4Data} 
                  setData={setStep4Data}
                  subscriptionTier={status?.subscription_tier || "free"}
                />
              )}
            </div>

            {/* Footer */}
            <div className="mt-8 flex flex-col gap-4">
              {/* Auto-save indicator */}
              <AutoSaveIndicator show={showSaveIndicator} saving={isSaving} />

              {/* Continue/Complete Button */}
              <button
                onClick={handleNext}
                disabled={!isCurrentStepValid() || isLoading}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {currentStep === 4 ? "Completing..." : "Saving..."}
                  </span>
                ) : currentStep === 4 ? (
                  status?.subscription_tier === "free" ? "Start Exploring" : "Go to Dashboard"
                ) : (
                  "Continue"
                )}
              </button>

              {/* Skip Link */}
              <SkipOnboardingLink onSkip={handleSkip} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
