"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { NavSearch } from "@/components/NavSearch";
import { useAuth } from "@/providers/AuthProvider";
import { UserDropdown } from "@/components/auth/UserDropdown";
import { Logo } from "@/components/common/Logo";

export default function NavigationBar() {
  const { user, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/screens", label: "Screens" },
    { href: "/market", label: "Markets" },
    { href: "/news", label: "News" },
    { href: "/ai", label: "AI Assistant" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm transition-colors duration-300">
      <div className="mx-auto max-w-container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-8">
          <Link className="flex items-center" href="/">
            <Logo />
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-brand transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex w-full max-w-sm">
            <NavSearch />
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {loading ? (
              <div className="hidden md:flex items-center gap-2">
                <div className="h-9 w-16 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse" />
                <div className="h-9 w-20 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
              </div>
            ) : user ? (
              <UserDropdown />
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="hidden md:inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white dark:ring-offset-slate-950 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 dark:focus-visible:ring-slate-300 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white h-9 px-4 py-2"
                >
                  Log in
                </Link>
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-white dark:ring-offset-slate-950 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 dark:focus-visible:ring-slate-300 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-slate-900 dark:bg-slate-100 text-slate-50 dark:text-slate-900 hover:bg-slate-900/90 dark:hover:bg-slate-100/90 h-9 px-4 py-2"
                >
                  Sign up
                </Link>
              </>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="space-y-4 px-4 py-6">
            <div className="mb-6">
              <NavSearch />
            </div>
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-lg font-medium text-slate-600 dark:text-slate-400 hover:text-brand dark:hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              {!user && !loading && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    href="/auth/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex h-11 items-center justify-center rounded-md border border-slate-200 dark:border-slate-800 font-medium"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex h-11 items-center justify-center rounded-md bg-brand text-white font-medium"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
