import type { ReactNode } from "react";

import { Inter, Lexend_Mega } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";

import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "./providers";
import RouteChrome from "./RouteChrome";
import { Toaster } from "@/components/ui/sonner";
import { MaintenanceWrapper } from "@/components/MaintenanceWrapper";
import { GlobalStructuredData } from "@/components/seo";

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
      <head>
        <GlobalStructuredData />
      </head>
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
        <Script
          id="microsoft-clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i+"?ref=bwt";
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "vvhult0bm8");
            `,
          }}
        />
      </body>
    </html>
  );
}