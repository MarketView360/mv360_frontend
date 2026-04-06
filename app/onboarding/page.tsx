"use client";

import { useCallback, useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { ChevronLeft, Loader2, CheckCircle2 } from "lucide-react";

// Maps primary_goal → redirect path
const REDIRECT_MAP: Record<string, string> = {
  find_stocks: "/screens",
  track_portfolio: "/watchlist",
  follow_news: "/news",
  learn: "/screens",
  build_screens: "/screens",
};

// Inner component that uses useSearchParams
function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const posthog = usePostHog();
  const { session, loading: authLoading } = useAuth();

  const [isInitializing, setIsInitializing] = useState(true);
  const [showResumeToast, setShowResumeToast] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  // Direction for slide animation: "forward" | "back"
  const [slideDirection, setSlideDirection] = useState<"forward" | "back">("forward");
  const [isAnimating, setIsAnimating] = useState(false);
  const stepStartTimeRef = useRef<number>(Date.now());

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
    isCurrentStepValid,
  } = useOnboarding();

  // ─── Initialize ───────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      if (authLoading) return;

      if (!session) {
        router.replace("/auth/login");
        return;
      }

      const accessToken = session.access_token;
      const statusData = await fetchStatus(accessToken);

      // Redirect to market only if onboarding is completed (not skipped, not needing onboarding)
      // Skipped users should still be able to access onboarding to complete it
      if (statusData && !statusData.needs_onboarding && !statusData.skipped) {
        router.replace("/market");
        return;
      }

      if ((statusData?.last_completed_step ?? 0) > 0) {
        setShowResumeToast(true);
        setTimeout(() => setShowResumeToast(false), 4500);
      }

      // Handle ?step= query parameter (e.g., from profile page redirect)
      const stepParam = searchParams.get("step");
      if (stepParam) {
        const stepNum = parseInt(stepParam, 10);
        if (!isNaN(stepNum) && stepNum >= 1 && stepNum <= 4) {
          setCurrentStep(stepNum);
        }
      } else if (statusData && (statusData.last_completed_step ?? 0) > 0) {
        // Resume from last completed step + 1 if no step param
        setCurrentStep(Math.min(statusData.last_completed_step + 1, 4));
      }

      // Pre-fill Step 1 from profile
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/profile`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (res.ok) {
          const profile = await res.json();
          if (profile.full_name || profile.display_name) {
            setStep1Data((prev) => ({
              ...prev,
              full_name: profile.full_name || prev.full_name,
              display_name:
                profile.display_name ||
                profile.full_name?.trim().split(/\s+/)[0] ||
                prev.display_name,
            }));
          }
          // Pre-fill email prefs from existing profile values
          if (
            profile.announcements_opt_in !== undefined ||
            profile.newsletter_opt_in !== undefined
          ) {
            setStep4Data((prev) => ({
              ...prev,
              announcements_opt_in: profile.announcements_opt_in ?? prev.announcements_opt_in,
              newsletter_opt_in: profile.newsletter_opt_in ?? prev.newsletter_opt_in,
              alerts_opt_in: profile.alerts_opt_in ?? prev.alerts_opt_in,
              events_and_promotions_opt_in:
                profile.events_and_promotions_opt_in ?? prev.events_and_promotions_opt_in,
            }));
          }
        }
      } catch {
        // Non-critical
      }

      setIsInitializing(false);
      stepStartTimeRef.current = Date.now();

      posthog?.capture("onboarding_started", {
        resumed: (statusData?.last_completed_step ?? 0) > 0,
        subscription_tier: statusData?.subscription_tier ?? "free",
      });
    };

    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, authLoading]);

  // ─── Step navigation with animation ──────────────────────────────────────
  const navigateToStep = useCallback(
    (next: number, direction: "forward" | "back") => {
      if (isAnimating) return;
      setIsAnimating(true);
      setSlideDirection(direction);

      // Short delay to let exit animation play
      setTimeout(() => {
        setCurrentStep(next);
        stepStartTimeRef.current = Date.now();
        setIsAnimating(false);
      }, 220);
    },
    [isAnimating, setCurrentStep]
  );

  // ─── Next / Complete ──────────────────────────────────────────────────────
  const handleNext = useCallback(async () => {
    if (!isCurrentStepValid() || isLoading || isAnimating) return;

    const timeSpentMs = Date.now() - stepStartTimeRef.current;

    posthog?.capture("onboarding_step_completed", {
      step: currentStep,
      step_name: ["identity", "background", "interests", "preferences"][currentStep - 1],
      time_spent_ms: timeSpentMs,
    });

    if (currentStep === 4) {
      if (!session) return;
      const success = await completeOnboarding(session.access_token);
      if (success) {
        posthog?.capture("onboarding_completed", {
          primary_goal: step2Data.primary_goal,
          professional_role: step2Data.professional_role,
          experience_level: step2Data.experience_level,
          interests_count: step3Data.interests.length,
          subscription_tier: status?.subscription_tier ?? "free",
          redirect_destination:
            REDIRECT_MAP[step2Data.primary_goal ?? ""] ?? "/market",
        });
        setIsComplete(true);
        // Brief success moment before redirect
        setTimeout(() => {
          router.replace(REDIRECT_MAP[step2Data.primary_goal ?? ""] ?? "/market");
        }, 1800);
      }
    } else {
      if (session) {
        const stepData =
          currentStep === 1 ? step1Data
          : currentStep === 2 ? step2Data
          : step3Data;
        await saveStep(session.access_token, currentStep, stepData as unknown as Record<string, unknown>);
      }
      navigateToStep(currentStep + 1, "forward");
    }
  }, [
    isCurrentStepValid, isLoading, isAnimating, currentStep, session,
    step1Data, step2Data, step3Data, step4Data, status, posthog,
    completeOnboarding, saveStep, navigateToStep, router,
  ]);

  // ─── Back ─────────────────────────────────────────────────────────────────
  const handleBack = useCallback(() => {
    if (currentStep <= 1 || isAnimating) return;
    posthog?.capture("onboarding_step_back", {
      from_step: currentStep,
      to_step: currentStep - 1,
    });
    navigateToStep(currentStep - 1, "back");
  }, [currentStep, isAnimating, navigateToStep, posthog]);

  // ─── Skip ─────────────────────────────────────────────────────────────────
  const handleSkip = useCallback(async () => {
    posthog?.capture("onboarding_skipped", {
      skipped_at_step: currentStep,
      subscription_tier: status?.subscription_tier ?? "free",
    });

    if (session) {
      await skipOnboarding(session.access_token);
      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/profile/onboarding/schedule-reminder`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${session.access_token}` },
          }
        );
      } catch {
        // Non-critical
      }

      // Notify banner to refresh its state
      window.dispatchEvent(new CustomEvent("onboarding-status-changed"));
    }

    // Redirect to market after skip
    router.replace("/market");
  }, [currentStep, session, status, skipOnboarding, posthog, router]);

  // ─── Keyboard: Enter to advance ───────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.key === "Enter" &&
        !e.shiftKey &&
        !(e.target instanceof HTMLTextAreaElement) &&
        !(e.target instanceof HTMLButtonElement)
      ) {
        handleNext();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [handleNext]);

  // ─── Loading screen ───────────────────────────────────────────────────────
  if (authLoading || isInitializing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        <p className="text-sm text-slate-400">Setting up your workspace…</p>
      </div>
    );
  }

  // ─── Completion screen ────────────────────────────────────────────────────
  if (isComplete) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">
            You&apos;re all set{step1Data.display_name ? `, ${step1Data.display_name}` : ""}!
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Taking you to your personalised dashboard…
          </p>
        </div>
        <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
      </div>
    );
  }

  // ─── Main wizard ──────────────────────────────────────────────────────────
  return (
    <div className="flex flex-1 flex-col min-h-0 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Scrollable Content Container */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-2 sm:py-4 custom-scrollbar">
        <div className="mx-auto w-full max-w-4xl relative mt-8">
          {/* Resume toast - now absolute to save height */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-20 w-max">
            <div
              className={`overflow-hidden rounded-xl border border-blue-500/20 bg-blue-500/10 transition-all duration-500 ${
                showResumeToast ? "max-h-16 opacity-100 py-1.5 px-4 shadow-sm backdrop-blur-md" : "max-h-0 opacity-0 py-0 px-4"
              }`}
              aria-live="polite"
            >
              <p className="text-center text-xs text-blue-600 dark:text-blue-300">
                Welcome back — picking up where you left off.
              </p>
            </div>
          </div>

          {/* Progress dots */}
          <div className="mb-2 mt-2">
            <OnboardingProgress currentStep={currentStep} totalSteps={4} />
          </div>
          {/* Error */}
          {error && (
            <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
              <p className="text-sm text-red-400">{error}</p>
              <button
                onClick={() => setError(null)}
                className="shrink-0 text-xs text-red-400 underline hover:no-underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Card */}
          <div className="relative rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900/80 shadow-xl dark:shadow-2xl dark:shadow-black/40 backdrop-blur-xl">
            {/* Floating Save Indicator */}
            <div className="absolute right-4 top-4 z-10">
              <AutoSaveIndicator show={showSaveIndicator} saving={isSaving} />
            </div>

            {/* Step content — slide transition */}
            <div
              key={currentStep}
              className={`p-3 sm:px-5 sm:py-4 transition-all duration-220 ${
                isAnimating
                  ? slideDirection === "forward"
                    ? "-translate-x-4 opacity-0"
                    : "translate-x-4 opacity-0"
                  : "translate-x-0 opacity-100"
              }`}
            >
              {/* Back button */}
              {currentStep > 1 && (
                <button
                  onClick={handleBack}
                  className="mb-2 flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-300 focus:outline-none"
                  aria-label="Go back to previous step"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>
              )}

              {/* Step components */}
              <div className="min-h-[140px] sm:min-h-[180px]">
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
                    subscriptionTier={status?.subscription_tier ?? "free"}
                  />
                )}
              </div>

              {/* Footer */}
              <div className="mt-2 space-y-2">

                {/* Primary CTA */}
                  <button
                  onClick={handleNext}
                  disabled={!isCurrentStepValid() || isLoading || isAnimating}
                  className={`relative w-full overflow-hidden rounded-xl py-2.5 px-5 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-40 ${
                    isCurrentStepValid()
                      ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.25)] hover:bg-blue-500 hover:shadow-[0_0_28px_rgba(59,130,246,0.35)] active:scale-[0.99]"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-400"
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {currentStep === 4 ? "Finishing up…" : "Saving…"}
                    </span>
                  ) : currentStep === 4 ? (
                    status?.subscription_tier === "free"
                      ? "Start Exploring →"
                      : "Go to Dashboard →"
                  ) : (
                    "Continue →"
                  )}
                </button>

                {/* Skip */}
                <SkipOnboardingLink onSkip={handleSkip} isLoading={isLoading} />
              </div>
            </div>
          </div>

          {/* Bottom reassurance */}
          <p className="mt-4 text-center text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-600">
            Your answers are private & secure
          </p>
        </div>
      </main>
    </div>
  );
}

// Wrapper component with Suspense boundary
export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        <p className="text-sm text-slate-400">Loading onboarding…</p>
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  );
}