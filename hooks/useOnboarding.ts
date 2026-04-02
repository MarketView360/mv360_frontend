"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

// Types matching backend DTOs
export interface OnboardingStatus {
  needs_onboarding: boolean;
  last_completed_step: number;
  skipped: boolean;
  subscription_tier: string;
}

export interface OnboardingStep1Data {
  full_name: string;
  display_name: string;
  timezone: string;
}

export interface OnboardingStep2Data {
  professional_role: string;
  experience_level: string;
  primary_goal: string;
  investment_style?: string[];
}

export interface OnboardingStep3Data {
  interests: string[];
  usage_frequency: string;
}

export interface OnboardingStep4Data {
  announcements_opt_in: boolean;
  newsletter_opt_in: boolean;
  alerts_opt_in: boolean;
  events_and_promotions_opt_in: boolean;
  referral_source?: string;
}

export interface OnboardingData extends 
  OnboardingStep1Data, 
  OnboardingStep2Data, 
  OnboardingStep3Data, 
  OnboardingStep4Data {}

// Enum values
export const PROFESSIONAL_ROLES = [
  { value: "individual_investor", label: "Individual Investor", icon: "💼" },
  { value: "day_trader", label: "Day Trader", icon: "📈" },
  { value: "swing_trader", label: "Swing Trader", icon: "🔄" },
  { value: "financial_analyst", label: "Financial Analyst", icon: "📊" },
  { value: "portfolio_manager", label: "Portfolio Manager", icon: "📁" },
  { value: "student", label: "Student / Learner", icon: "🎓" },
  { value: "exploring", label: "Just Exploring", icon: "🔍" },
] as const;

export const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "New to investing" },
  { value: "1_3_years", label: "1–3 years" },
  { value: "3_10_years", label: "3–10 years" },
  { value: "10_plus_years", label: "10+ years" },
] as const;

export const PRIMARY_GOALS = [
  { value: "find_stocks", label: "Find undervalued stocks", icon: "🎯" },
  { value: "track_portfolio", label: "Track my portfolio", icon: "📋" },
  { value: "follow_news", label: "Stay on top of market news", icon: "📰" },
  { value: "learn_investing", label: "Learn investing fundamentals", icon: "📚" },
  { value: "build_strategies", label: "Build & test screening strategies", icon: "⚙️" },
] as const;

export const INVESTMENT_STYLES = [
  { value: "value", label: "Value" },
  { value: "growth", label: "Growth" },
  { value: "dividend", label: "Dividend" },
  { value: "technical", label: "Technical" },
  { value: "momentum", label: "Momentum" },
  { value: "passive", label: "Index / Passive" },
] as const;

export const FEATURE_INTERESTS = [
  { value: "screener", label: "Screen & filter stocks", icon: "🔍" },
  { value: "watchlists", label: "Track watchlists", icon: "👁️" },
  { value: "ai_chat", label: "Chat with AI Assistant", icon: "🤖" },
  { value: "portfolio", label: "Manage my portfolio", icon: "📊" },
  { value: "alerts", label: "Set price alerts", icon: "🔔" },
  { value: "news", label: "Read market news", icon: "📰" },
  { value: "research", label: "Dive into company research", icon: "🔬" },
  { value: "charts", label: "Analyze technical charts", icon: "📈" },
] as const;

export const USAGE_FREQUENCIES = [
  { value: "daily", label: "Daily" },
  { value: "few_times_week", label: "A few times a week" },
  { value: "weekly", label: "Weekly" },
  { value: "occasionally", label: "Occasionally" },
] as const;

export const REFERRAL_SOURCES = [
  { value: "search", label: "Google / Search" },
  { value: "social_media", label: "Social Media" },
  { value: "friend", label: "Friend / Colleague" },
  { value: "blog_article", label: "Blog / Article" },
  { value: "advertisement", label: "Advertisement" },
  { value: "other", label: "Other" },
] as const;

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function useOnboarding() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  
  // Step data
  const [step1Data, setStep1Data] = useState<OnboardingStep1Data>({
    full_name: "",
    display_name: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  
  const [step2Data, setStep2Data] = useState<OnboardingStep2Data>({
    professional_role: "",
    experience_level: "",
    primary_goal: "",
    investment_style: [],
  });
  
  const [step3Data, setStep3Data] = useState<OnboardingStep3Data>({
    interests: [],
    usage_frequency: "",
  });
  
  const [step4Data, setStep4Data] = useState<OnboardingStep4Data>({
    announcements_opt_in: true, // Default ON per plan
    newsletter_opt_in: false,
    alerts_opt_in: false,
    events_and_promotions_opt_in: false,
    referral_source: "",
  });

  // Fetch onboarding status
  const fetchStatus = useCallback(async (token: string) => {
    try {
      const response = await fetch(`${API_BASE}/profile/onboarding-status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch onboarding status");
      }
      
      const data: OnboardingStatus = await response.json();
      setStatus(data);
      
      // Resume from last completed step if applicable
      if (data.last_completed_step > 0 && data.last_completed_step < 4) {
        setCurrentStep(data.last_completed_step + 1);
      }
      
      return data;
    } catch (err) {
      console.error("Error fetching onboarding status:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      return null;
    }
  }, []);

  // Save step data (auto-save)
  const saveStep = useCallback(async (
    token: string,
    step: number,
    data: Record<string, unknown>
  ) => {
    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE}/profile/onboarding/step/${step}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Failed to save step");
      }
      
      // Show save indicator
      setShowSaveIndicator(true);
      setTimeout(() => setShowSaveIndicator(false), 2000);
      
      return true;
    } catch (err) {
      console.error("Error saving step:", err);
      setError(err instanceof Error ? err.message : "Failed to save");
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Complete onboarding
  const completeOnboarding = useCallback(async (token: string) => {
    setIsLoading(true);
    setError(null);
    
    const completeData: OnboardingData = {
      ...step1Data,
      ...step2Data,
      ...step3Data,
      ...step4Data,
    };
    
    try {
      const response = await fetch(`${API_BASE}/profile/onboarding/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(completeData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to complete onboarding");
      }
      
      const result = await response.json();
      router.push(result.redirect_url || "/market");
      return true;
    } catch (err) {
      console.error("Error completing onboarding:", err);
      setError(err instanceof Error ? err.message : "Failed to complete onboarding");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [step1Data, step2Data, step3Data, step4Data, router]);

  // Skip onboarding
  const skipOnboarding = useCallback(async (token: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/profile/onboarding/skip`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to skip onboarding");
      }
      
      const result = await response.json();
      router.push(result.redirect_url || "/market");
      return true;
    } catch (err) {
      console.error("Error skipping onboarding:", err);
      setError(err instanceof Error ? err.message : "Failed to skip onboarding");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Navigation
  const goToNextStep = useCallback(() => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep]);

  const goToPreviousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  // Validation
  const isStep1Valid = useCallback(() => {
    return (
      step1Data.full_name.trim().length > 0 &&
      step1Data.display_name.trim().length > 0 &&
      step1Data.timezone.length > 0
    );
  }, [step1Data]);

  const isStep2Valid = useCallback(() => {
    return (
      step2Data.professional_role.length > 0 &&
      step2Data.experience_level.length > 0 &&
      step2Data.primary_goal.length > 0
    );
  }, [step2Data]);

  const isStep3Valid = useCallback(() => {
    return (
      step3Data.interests.length > 0 &&
      step3Data.usage_frequency.length > 0
    );
  }, [step3Data]);

  const isStep4Valid = useCallback(() => {
    // Step 4 always valid since checkboxes have defaults
    return true;
  }, []);

  const isCurrentStepValid = useCallback(() => {
    switch (currentStep) {
      case 1: return isStep1Valid();
      case 2: return isStep2Valid();
      case 3: return isStep3Valid();
      case 4: return isStep4Valid();
      default: return false;
    }
  }, [currentStep, isStep1Valid, isStep2Valid, isStep3Valid, isStep4Valid]);

  return {
    // State
    currentStep,
    setCurrentStep,
    isLoading,
    isSaving,
    error,
    setError,
    showSaveIndicator,
    status,
    
    // Step data
    step1Data,
    setStep1Data,
    step2Data,
    setStep2Data,
    step3Data,
    setStep3Data,
    step4Data,
    setStep4Data,
    
    // Actions
    fetchStatus,
    saveStep,
    completeOnboarding,
    skipOnboarding,
    goToNextStep,
    goToPreviousStep,
    
    // Validation
    isStep1Valid,
    isStep2Valid,
    isStep3Valid,
    isStep4Valid,
    isCurrentStepValid,
  };
}
