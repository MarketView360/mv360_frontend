import Link from "next/link";
import { Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import MarketOverview from "@/components/MarketOverview";
import SearchBar from "@/components/SearchBar";
import { PopularStocksCarousel } from "@/components/home/PopularStocksCarousel";

export default async function Home() {
  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950 flex flex-col font-sans selection:bg-brand/20 transition-colors duration-300">
      {/* Hero Section */}
      <section className="w-full py-24 md:py-32 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 relative">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-brand/5 blur-3xl opacity-50"></div>
          <div className="absolute top-[40%] -left-[10%] w-[500px] h-[500px] rounded-full bg-blue-400/5 blur-3xl opacity-50"></div>
        </div>

        <div className="mx-auto max-w-[1600px] px-4 md:px-8 lg:px-12 flex flex-col items-center text-center space-y-8 relative z-10">
          <Badge
            variant="outline"
            className="px-4 py-1.5 text-sm font-medium border-brand/20 text-brand bg-brand/5 rounded-full animate-fade-in"
          >
            v2.0 is now live
          </Badge>

          <div className="space-y-4 max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-bold font-heading tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              Analyze US Stocks <br className="hidden md:inline" />
              <span className="text-brand">
                Like a Pro.
              </span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 md:text-2xl max-w-[800px] mx-auto leading-relaxed">
              Real-time US equity insights delivered with speed, clarity, and analytical depth. Marketview360 transforms complex U.S. equity data into actionable intelligence.
            </p>
          </div>

          <div className="w-full max-w-2xl relative mt-8">
            <SearchBar />
            <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm text-muted-foreground">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Popular:
              </span>
              <Link
                href="/company/AAPL"
                className="px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand dark:hover:border-brand hover:text-brand dark:hover:text-brand transition-colors shadow-sm"
              >
                AAPL
              </Link>
              <Link
                href="/company/NVDA"
                className="px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand dark:hover:border-brand hover:text-brand dark:hover:text-brand transition-colors shadow-sm"
              >
                NVDA
              </Link>
              <Link
                href="/company/TSLA"
                className="px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand dark:hover:border-brand hover:text-brand dark:hover:text-brand transition-colors shadow-sm"
              >
                TSLA
              </Link>
              <Link
                href="/company/MSFT"
                className="px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand dark:hover:border-brand hover:text-brand dark:hover:text-brand transition-colors shadow-sm"
              >
                MSFT
              </Link>
            </div>

            {/* Watch Demo Button - controlled by environment variable */}
            {process.env.NEXT_PUBLIC_SHOW_DEMO_BUTTON === 'true' && (
              <div className="mt-6 flex justify-center">
                <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-brand/20 bg-white dark:bg-slate-800/50 text-brand dark:text-brand font-semibold hover:bg-brand/5 dark:hover:bg-brand/10 hover:border-brand transition-all shadow-sm hover:shadow-md">
                  <Play className="w-5 h-5" />
                  Watch Demo
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* US Stocks Section */}
      <section className="w-full py-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-[1600px] px-4 md:px-8 lg:px-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold font-heading text-slate-900 dark:text-white mb-2">
              US Stocks
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Discover trending stocks and market movers
            </p>
          </div>
          <PopularStocksCarousel />
        </div>
      </section>

      {/* Market Overview Section */}
      <section className="w-full py-16 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-[1600px] px-4 md:px-8 lg:px-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold font-heading text-slate-900 dark:text-white mb-2">
              Market Overview
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Stay updated with the latest market data and trends
            </p>
          </div>
          <MarketOverview hideRefresh />
        </div>
      </section>
    </div>
  );
}

