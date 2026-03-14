"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart2,
  BookMarked,
  DollarSign,
  Menu,
  Newspaper,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Logo } from "@/components/common/Logo";
import { NavSearch } from "@/components/NavSearch";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/providers/AuthProvider";
import { UserDropdown } from "@/components/auth/UserDropdown";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/screens",   label: "Screens",      Icon: SlidersHorizontal },
  { href: "/watchlist", label: "Watchlist",     Icon: BookMarked        },
  { href: "/market",    label: "Markets",       Icon: BarChart2         },
  { href: "/news",      label: "News",          Icon: Newspaper         },
  { href: "/ai",        label: "AI Assistant",  Icon: Sparkles          },
  { href: "/pricing",   label: "Pricing",       Icon: DollarSign        },
] as const;

export default function NavigationBar() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [sheetOpen, setSheetOpen] = useState(false);

  // Close sheet on navigation
  useEffect(() => {
    setSheetOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Logo size="sm" priority className="lg:hidden" />
        <Logo size="md" priority className="hidden lg:flex" />

        {/* Desktop nav */}
        <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-0.5">
          {NAV_LINKS.map(({ href, label, Icon }) => {
            const isActive =
              pathname === href || pathname.startsWith(href + "/");
            return (
              <Button
                key={href}
                variant="ghost"
                size="sm"
                asChild
                className={cn(
                  "gap-1.5 text-muted-foreground hover:text-foreground",
                  isActive && "bg-muted text-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Link href={href}>
                  <Icon
                    size={15}
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                  {label}
                </Link>
              </Button>
            );
          })}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-1">
          <div className="hidden lg:flex flex-shrink-0">
            <NavSearch />
          </div>
          <ThemeToggle />
          {loading ? (
            <div className="hidden sm:flex items-center gap-2">
              <div className="h-9 w-16 rounded-md bg-muted animate-pulse" />
            </div>
          ) : user ? (
            <UserDropdown />
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/signup">Sign up</Link>
              </Button>
            </div>
          )}

          {/* Mobile menu trigger — Sheet */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9"
              onClick={() => setSheetOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu size={20} strokeWidth={1.75} aria-hidden="true" />
            </Button>

            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="px-6 py-4 border-b border-border">
                <SheetTitle asChild>
                  <div className="flex items-center">
                    <Logo size="sm" />
                    <span className="sr-only">Navigation menu</span>
                  </div>
                </SheetTitle>
              </SheetHeader>

              {/* Nav links */}
              <nav
                aria-label="Mobile navigation"
                className="flex flex-col gap-1 p-3"
              >
                {NAV_LINKS.map(({ href, label, Icon }) => {
                  const isActive =
                    pathname === href || pathname.startsWith(href + "/");
                  return (
                    <Button
                      key={href}
                      variant={isActive ? "secondary" : "ghost"}
                      className="w-full justify-start gap-3 h-11 text-base"
                      asChild
                      aria-current={isActive ? "page" : undefined}
                    >
                      <Link href={href}>
                        <Icon
                          size={18}
                          strokeWidth={1.75}
                          aria-hidden="true"
                        />
                        {label}
                      </Link>
                    </Button>
                  );
                })}
              </nav>

              <Separator />

              {/* Auth in drawer bottom */}
              <div className="p-4">
                {loading ? (
                  <div className="h-9 w-full rounded-md bg-muted animate-pulse" />
                ) : user ? (
                  <UserDropdown />
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" asChild>
                      <Link href="/auth/login">Log in</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/auth/signup">Sign up</Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
