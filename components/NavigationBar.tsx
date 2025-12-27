"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { NavSearch } from "@/components/NavSearch";
import { useAuth } from "@/providers/AuthProvider";
import { UserDropdown } from "@/components/auth/UserDropdown";

export default function NavigationBar() {
  const { user, loading } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-950/60 transition-colors duration-300" aria-label="Main navigation">
      <div className="mx-auto max-w-[1600px] flex h-16 items-center justify-between px-4 md:px-8 lg:px-12">
        <div className="flex items-center gap-12">
          <Link className="flex items-center group" href="/">
            <div className="relative h-14 w-80 flex items-center">
              <Image
                src="/logo.svg"
                alt="Marketview360"
                fill
                className="object-contain transition-all duration-300 group-hover:scale-105 dark:hidden"
                priority
              />
              <Image
                src="/logo-dark.svg"
                alt="Marketview360"
                fill
                className="object-contain transition-all duration-300 group-hover:scale-105 hidden dark:block"
                priority
              />
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-10 text-[13px] font-bold tracking-wide uppercase text-slate-500 dark:text-slate-400">
            <Link
              href="/screens"
              className="hover:text-brand dark:hover:text-white transition-all hover:-translate-y-0.5"
            >
              Screens
            </Link>
            <Link href="/market" className="hover:text-brand dark:hover:text-white transition-all hover:-translate-y-0.5">
              Markets
            </Link>
            <Link href="/news" className="hover:text-brand dark:hover:text-white transition-all hover:-translate-y-0.5">
              News
            </Link>
            <Link href="/jovan-chat" className="hover:text-brand dark:hover:text-white transition-all hover:-translate-y-0.5">
              AI Assistant
            </Link>
          </div>
        </div>


        <div className="flex items-center gap-6">
          <div className="hidden lg:flex">
            <NavSearch />
          </div>
          <div className="flex items-center gap-3">
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
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              aria-label="Toggle mobile menu"
              aria-expanded="false"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
