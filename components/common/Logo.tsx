"use client";

import Image from "next/image";
import { useTheme } from "@/app/providers";
import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
    width?: number;
    height?: number;
}

export function Logo({ className, width = 160, height = 30 }: LogoProps) {
    const { isDark } = useTheme();

    return (
        <div className={cn("relative flex items-center shrink-0", className)}>
            <Image
                src={isDark ? "/logo/logo-dark.svg" : "/logo/logo-light.svg"}
                alt="Marketview360 Logo"
                width={width}
                height={height}
                className="h-12 w-auto object-contain"
                priority
            />
        </div>
    );
}
