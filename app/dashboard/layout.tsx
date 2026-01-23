"use client";

import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { useAuth } from "@/providers/AuthProvider";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = useAuth();

    // Get user tier from user metadata (default to free)
    const userTier = (user?.user_metadata?.tier as "free" | "pro" | "elite") || "free";
    const userName = user?.user_metadata?.name || user?.email?.split("@")[0] || "User";

    return (
        <div className="flex h-[calc(100vh-64px)]">
            {/* Sidebar - hidden on mobile */}
            <div className="hidden md:block">
                <DashboardSidebar userTier={userTier} userName={userName} />
            </div>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
                <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-6 md:py-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
