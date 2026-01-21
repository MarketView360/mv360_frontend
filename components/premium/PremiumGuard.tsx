
"use client";

import { usePremium } from '@/hooks/usePremium';
import PremiumOverlay from './PremiumOverlay';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PremiumGuardProps {
    children: ReactNode;
    className?: string; // Allow passing styles to the wrapper
    fallback?: ReactNode; // Optional custom fallback instead of default overlay
}

export default function PremiumGuard({ children, className, fallback }: PremiumGuardProps) {
    const { isPremium, loading } = usePremium();

    if (loading) {
        // Optional: Render a skeleton or loading spinner here
        return <div className="animate-pulse w-full h-96 bg-slate-100 dark:bg-slate-900 rounded-xl" />;
    }

    if (isPremium) {
        return <>{children}</>;
    }

    return (
        <div className={cn("relative min-h-[400px] w-full overflow-hidden rounded-xl", className)}>
            {/* Render children with blur/disabled state behind the overlay to give context */}
            <div className="filter blur-sm select-none pointer-events-none opacity-50 absolute inset-0 overflow-hidden">
                {children}
            </div>

            {fallback || <PremiumOverlay />}
        </div>
    );
}
