  "use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { Footer } from "@/components/Footer";
import { AiChatWidget } from "@/components/AiChatWidget";
import NavigationBar from "@/components/NavigationBar";
import { NetworkStatusWatcher } from "@/components/NetworkStatusWatcher";
import { OnboardingBanner } from "@/components/onboarding/OnboardingBanner";

export default function RouteChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isFullScreen = pathname === "/jovan-chat" || pathname === "/ai";
  const isOnboarding = pathname === "/onboarding";

  useEffect(() => {
    if (isFullScreen || isOnboarding) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [isFullScreen, isOnboarding]);

  return (
    <div
      className={cn(
        "flex flex-col w-full",
        "h-dvh overflow-hidden"
      )}
    >
      {!isFullScreen && pathname !== "/ai" && <NavigationBar />}
      {pathname === "/ai" && <NavigationBar />}

      {isFullScreen || isOnboarding ? (
        <main className="flex-1 w-full relative flex flex-col min-h-0 overflow-hidden">
          {children}
        </main>
      ) : (
        <div className="app-scroll custom-scrollbar flex-1 w-full overflow-y-auto">
          <OnboardingBanner />
          <main className="w-full relative pt-4 md:pt-6">
            {children}
          </main>
          <Footer />
        </div>
      )}

      <NetworkStatusWatcher />
      {!isFullScreen && pathname !== "/ai" && <AiChatWidget />}
    </div>
  );
}
