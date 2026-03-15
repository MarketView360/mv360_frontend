"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTheme } from "@/app/providers";
import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
    width?: number;
    height?: number;
}

export function Logo({ className, width = 160, height = 30 }: LogoProps) {
    const { isDark } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Keep SSR and first client render identical to avoid hydration warnings.
    const logoSrc = mounted && isDark ? "/logo/logo-dark.svg" : "/logo/logo-light.svg";

    return (
        <div className={cn("relative flex items-center shrink-0", className)}>
            <Image
                src={logoSrc}
                alt="Marketview360 Logo"
                width={width}
                height={height}
                className="h-12 w-auto object-contain"
                priority
            />
        </div>
    );
}
