"use client";

import type { OnboardingStep2Data } from "@/hooks/useOnboarding";
import {
  PROFESSIONAL_ROLES,
  EXPERIENCE_LEVELS,
  PRIMARY_GOALS,
  INVESTMENT_STYLES,
} from "@/hooks/useOnboarding";

interface StepBackgroundProps {
  data: OnboardingStep2Data;
  setData: React.Dispatch<React.SetStateAction<OnboardingStep2Data>>;
}

export function StepBackground({ data, setData }: StepBackgroundProps) {
  const toggleInvestmentStyle = (style: string) => {
    setData((prev) => {
      const current = prev.investment_style || [];
      if (current.includes(style)) {
        return { ...prev, investment_style: current.filter((s) => s !== style) };
      }
      return { ...prev, investment_style: [...current, style] };
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Tell us about yourself
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          We&apos;ll surface what&apos;s most relevant to you.
        </p>
      </div>

      <div className="space-y-6">
        {/* Professional Role - Card Grid */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            I am a...
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PROFESSIONAL_ROLES.map((role) => (
              <button
                key={role.value}
                type="button"
                onClick={() =>
                  setData((prev) => ({ ...prev, professional_role: role.value }))
                }
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  data.professional_role === role.value
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                }`}
              >
                <span className="text-lg mb-1 block">{role.icon}</span>
                <span
                  className={`text-sm font-medium ${
                    data.professional_role === role.value
                      ? "text-blue-700 dark:text-blue-300"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {role.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Experience Level - Segmented Control */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Experience level
          </label>
          <div className="flex flex-wrap gap-2">
            {EXPERIENCE_LEVELS.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() =>
                  setData((prev) => ({ ...prev, experience_level: level.value }))
                }
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  data.experience_level === level.value
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Goal - Card Grid */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            My primary goal
          </label>
          <div className="space-y-2">
            {PRIMARY_GOALS.map((goal) => (
              <button
                key={goal.value}
                type="button"
                onClick={() =>
                  setData((prev) => ({ ...prev, primary_goal: goal.value }))
                }
                className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                  data.primary_goal === goal.value
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                }`}
              >
                <span className="text-xl">{goal.icon}</span>
                <span
                  className={`text-sm font-medium ${
                    data.primary_goal === goal.value
                      ? "text-blue-700 dark:text-blue-300"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {goal.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Investment Style - Pill Multi-select */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Investment style
            <span className="ml-1 text-xs text-slate-400 font-normal">
              (optional)
            </span>
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Skip if you&apos;re still figuring this out
          </p>
          <div className="flex flex-wrap gap-2">
            {INVESTMENT_STYLES.map((style) => (
              <button
                key={style.value}
                type="button"
                onClick={() => toggleInvestmentStyle(style.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  data.investment_style?.includes(style.value)
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
