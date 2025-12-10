import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import MarketOverview from "@/components/MarketOverview";
import SearchBar from "@/components/SearchBar";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

async function fetchTopNews() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/news?limit=4`, {
      next: { revalidate: 300 },
    });
    if (!res.ok)
      return [] as {
        date: string;
        title: string;
        content: string;
        link: string;
      }[];
    return (await res.json()) as {
      date: string;
      title: string;
      content: string;
      link: string;
    }[];
  } catch {
    return [] as {
      date: string;
      title: string;
      content: string;
      link: string;
    }[];
  }
}

export default async function Home() {
  const topNews = await fetchTopNews();
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans selection:bg-brand/20 transition-colors duration-300">
      {/* Hero Section */}
      <section className="w-full py-24 md:py-32 bg-gradient-to-b from-white dark:from-slate-900 via-slate-50 dark:via-slate-950 to-slate-100 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800 relative overflow-hidden">
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
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-blue-600">
                Like a Pro.
              </span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 md:text-2xl max-w-[800px] mx-auto leading-relaxed">
              Marketview360 is the fastest way to screen, analyze, and track US
              equities. Real-time data, powerful ratios, and clean design.
            </p>
          </div>

          <div className="w-full max-w-2xl relative mt-8">
            <SearchBar />
            <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm text-slate-500 dark:text-slate-400">
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
          </div>
        </div>
      </section>

      {/* Market Overview Section */}
      <section className="w-full py-16 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
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
