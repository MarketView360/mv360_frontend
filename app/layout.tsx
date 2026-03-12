import type { ReactNode } from "react";

import { Inter, Lexend_Mega } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "./providers";
import RouteChrome from "./RouteChrome";
import { Toaster } from "@/components/ui/sonner";
import { MaintenanceWrapper } from "@/components/MaintenanceWrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const lexend = Lexend_Mega({
  subsets: ["latin"],
  variable: "--font-lexend",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={cn(
          "min-h-screen bg-white dark:bg-slate-950 font-sans antialiased flex flex-col transition-colors duration-300",
          inter.variable,
          lexend.variable
        )}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = window.localStorage.getItem('theme');
                  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var theme = stored || (prefersDark ? 'dark' : 'light');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <ThemeProvider>
          <MaintenanceWrapper>
            <RouteChrome>{children}</RouteChrome>
            <Toaster position="top-right" richColors closeButton />
          </MaintenanceWrapper>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}