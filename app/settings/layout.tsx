"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Shield,
  Lock,
  Palette,
  Bell,
  CreditCard,
  Sparkles,
  HelpCircle,
} from "lucide-react";

interface SettingsLayoutProps {
  children: ReactNode;
}

const settingsNav = [
  {
    title: "Account",
    items: [
      { name: "Security", href: "/settings/security", icon: Shield },
      { name: "Privacy", href: "/settings/privacy", icon: Lock },
      { name: "Billing", href: "/settings/billing", icon: CreditCard },
    ],
  },
  {
    title: "Preferences",
    items: [
      { name: "Appearance", href: "/settings/appearance", icon: Palette },
      { name: "Notifications", href: "/settings/notifications", icon: Bell },
    ],
  },
  {
    title: "Services",
    items: [
      { name: "Jovan AI", href: "/settings/jovan-ai", icon: Sparkles },
    ],
  },
];

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-[1600px] px-4 md:px-8 lg:px-12 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Settings
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="space-y-6 sticky top-8">
              {settingsNav.map((section) => (
                <div key={section.title}>
                  <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                    {section.title}
                  </h3>
                  <ul className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                              isActive
                                ? "bg-brand/10 text-brand dark:bg-brand/20"
                                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            {item.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}

              {/* Help Center Link */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <Link
                  href="/help"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <HelpCircle className="h-4 w-4" />
                  Help Center
                </Link>
              </div>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
