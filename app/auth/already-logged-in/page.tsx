"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { Logo } from "@/components/common/Logo";
import { 
  Home, 
  TrendingUp, 
  BarChart3, 
  LogOut, 
  Sparkles,
  CheckCircle2,
  ArrowRight,
  LifeBuoy,
  Bug
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AlreadyLoggedInPage() {
  const { session, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.replace("/auth/login");
    }
  }, [session, router]);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
      </div>
    );
  }

  const quickActions = [
    {
      title: "Go to Home",
      description: "Return to your dashboard",
      icon: Home,
      href: "/",
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Screen Stocks",
      description: "Find your next investment",
      icon: BarChart3,
      href: "/screenss",
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Analyze Market",
      description: "Explore market trends",
      icon: TrendingUp,
      href: "/market",
      color: "from-emerald-500 to-teal-500",
    },
  ];

  const handleLogout = async () => {
    await signOut();
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 py-8 transition-colors duration-300">
      <div className="w-full max-w-3xl">
        <Card className="border-slate-200 dark:border-slate-800 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardContent className="p-6 md:p-8 space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full blur-xl opacity-30 animate-pulse" />
                  <div className="relative bg-gradient-to-br from-emerald-100 to-blue-100 dark:from-emerald-900/30 dark:to-blue-900/30 rounded-full p-4">
                    <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </div>
              
              <Logo width={240} height={48} className="mx-auto mb-6 h-12" />
              
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
                You&apos;re Already Logged In!
              </h1>
              
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 border border-blue-200/50 dark:border-blue-800/50 mb-4">
                <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Signed in as <span className="text-blue-600 dark:text-blue-400 font-semibold">{session.user?.email}</span>
                </span>
              </div>

              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Seems like you&apos;ve already logged in with an{" "}
                <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400">
                  MV360
                </span>{" "}
                (MarketView360) account. Here are some things you can do right away:
              </p>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 hover:shadow-lg hover:scale-105 transition-all duration-300"
                  >
                    {/* Gradient background on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                    
                    <div className="relative">
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${action.color} mb-4 shadow-lg`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                        {action.title}
                        <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                      </h3>
                      
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {action.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                  or
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="group border-2 border-slate-300 dark:border-slate-600 hover:border-red-500 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300"
              >
                <LogOut className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                Log out of this account
              </Button>
            </div>

            {/* Help / Support actions */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex flex-col items-center justify-center gap-1 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 px-3 py-2">
                <span className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">Having troubles?</span>
                <button
                  type="button"
                  onClick={() => router.push("/contact")}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <LifeBuoy className="h-3.5 w-3.5" />
                  Visit support
                </button>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 px-3 py-2">
                <span className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">Is this a bug?</span>
                <button
                  type="button"
                  onClick={() => router.push("/contact")}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:underline"
                >
                  <Bug className="h-3.5 w-3.5" />
                  Report an issue
                </button>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 px-3 py-2">
                <span className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">Need guidance?</span>
                <button
                  type="button"
                  onClick={() => router.push("/help")}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Open help center
                </button>
              </div>
            </div>

            {/* Footer note */}
            <p className="text-center text-[11px] text-slate-500 dark:text-slate-400">
              Want to switch accounts? Log out first, then sign in with a different account.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
