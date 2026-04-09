import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Welcome to MarketView360 | Setup Your Profile",
  description:
    "Set up your MarketView360 profile to get personalized stock screening and market insights.",
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative h-full overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Ambient background layers */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        {/* Deep gradient base */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />

        {/* Radial glow — top left */}
        <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-[120px]" />

        {/* Radial glow — bottom right */}
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-600/8 blur-[100px]" />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* Content wrapper - now flex to let children stretch */}
      <div className="relative z-10 flex h-full flex-col">{children}</div>
    </div>
  );
}