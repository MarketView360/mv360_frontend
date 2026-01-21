
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

export default function PremiumOverlay() {
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
            {/* Blur Background */}
            <div className="absolute inset-0 bg-slate-900/10 dark:bg-slate-950/20 backdrop-blur-[6px]" />

            {/* Glassmorphism Card */}
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/40 bg-white/60 p-8 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">

                {/* Decorative Gradient Blob */}
                <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-brand/30 blur-3xl dark:bg-brand/20" />
                <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-blue-500/30 blur-3xl dark:bg-blue-500/20" />

                <div className="relative flex flex-col items-center text-center">
                    <div className="mb-6 rounded-full bg-brand/10 p-4 ring-1 ring-brand/20">
                        <Lock className="h-8 w-8 text-brand" />
                    </div>

                    <h3 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
                        Premium Feature
                    </h3>

                    <p className="mb-8 text-slate-600 dark:text-slate-300">
                        Unlock advanced AI insights, unlimited screening, and real-time data with our Premium plan.
                    </p>

                    <div className="flex w-full flex-col gap-3">
                        <Button
                            asChild
                            className="w-full bg-brand hover:bg-brand-dark text-white font-semibold h-12 rounded-xl shadow-lg shadow-brand/20 transition-all hover:scale-[1.02]"
                        >
                            <Link href="/pricing">
                                Upgrade to Premium
                            </Link>
                        </Button>

                        <Button
                            variant="ghost"
                            asChild
                            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        >
                            <Link href="/dashboard">
                                Maybe Later
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
