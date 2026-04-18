"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/");
    }, [router]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand mb-4" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Redirecting...</p>
        </div>
    );
}
