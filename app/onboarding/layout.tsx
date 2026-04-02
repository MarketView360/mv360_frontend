import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Welcome to MarketView360 | Setup Your Profile",
  description: "Set up your MarketView360 profile to get personalized stock screening and market insights.",
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {children}
    </div>
  );
}
