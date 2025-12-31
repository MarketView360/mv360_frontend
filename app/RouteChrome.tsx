"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { Footer } from "@/components/Footer";
import { AiChatWidget } from "@/components/AiChatWidget";
import NavigationBar from "@/components/NavigationBar";
import { NetworkStatusWatcher } from "@/components/NetworkStatusWatcher";

export default function RouteChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isFullScreen = pathname === "/jovan-chat" || pathname === "/ai";

  useEffect(() => {
    if (isFullScreen) {
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
  }, [isFullScreen]);

  return (
    <div
      className={cn(
        "flex flex-col w-full",
        isFullScreen ? "h-[100dvh] overflow-hidden" : "min-h-screen"
      )}
    >
      {!isFullScreen && pathname !== "/ai" && <NavigationBar />}
      {pathname === "/ai" && <NavigationBar />}

      <main
        className={cn(
          "flex-1 w-full relative",
          isFullScreen && "flex flex-col overflow-hidden"
        )}
      >
        {children}
      </main>

      <NetworkStatusWatcher />
      {!isFullScreen && pathname !== "/ai" && <Footer />}
      {!isFullScreen && pathname !== "/ai" && <AiChatWidget />}
    </div>
  );
}
