"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RefreshCcw } from "lucide-react";

export default function EarningsPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/calendar");
    }, [router]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
            <RefreshCcw className="h-12 w-12 text-brand animate-spin mb-4" />
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                Upgrading Your Experience
            </h1>
            <p className="text-slate-500 font-medium">
                Redirecting you to our new unified Stock Events Calendar...
            </p>
        </div>
    );
}
