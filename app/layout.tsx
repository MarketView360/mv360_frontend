"use client";

import { usePathname } from "next/navigation";

import "./globals.css";
import { cn } from "@/lib/utils";
import { Footer } from "@/components/Footer";
import { NetworkStatusWatcher } from "@/components/NetworkStatusWatcher";
import { ThemeProvider } from "./providers";
import NavigationBar from "@/components/NavigationBar";
import { AiChatWidget } from "@/components/AiChatWidget";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="min-h-screen bg-white dark:bg-slate-950 font-sans antialiased flex flex-col transition-colors duration-300 overflow-x-hidden"
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
          <a href="#main-content" className="skip-to-content">
            Skip to main content
          </a>
          <NavigationBar />
          <main id="main-content" className="flex-1 w-full">{children}</main>
          <NetworkStatusWatcher />
          {pathname !== "/jovan-chat" && <Footer />}
          {pathname !== "/jovan-chat" && <AiChatWidget />}
        </ThemeProvider>
      </body>
    </html>
  );
}