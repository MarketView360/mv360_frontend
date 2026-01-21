import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import MarketOverview from "@/components/MarketOverview";
import SearchBar from "@/components/SearchBar";

export default async function Home() {
  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950 flex flex-col font-sans selection:bg-brand/20 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative w-full py-20 md:py-32 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-brand/10 dark:bg-brand/5 rounded-full blur-[120px] -z-10 animate-pulse" />
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-blue-600/10 dark:bg-blue-600/5 rounded-full blur-[100px] -z-10 animate-pulse delay-700" />

        <div className="mx-auto max-w-[1600px] px-4 md:px-8 lg:px-12">
          <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
            <Badge
              variant="outline"
              className="mb-8 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] border-brand/30 text-brand bg-brand/5 rounded-full backdrop-blur-md shadow-sm"
            >
              v2.0 is now live
            </Badge>

            {/* Logo */}
            <div className="relative h-24 w-96 md:h-32 md:w-[28rem] mb-8">
              <Image
                src="/logo.svg"
                alt="Marketview360"
                fill
                className="object-contain dark:hidden"
                priority
              />
              <Image
                src="/logo-dark.svg"
                alt="Marketview360"
                fill
                className="object-contain hidden dark:block"
                priority
              />
            </div>

            <div className="space-y-6 mb-12">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.05]">
                Analyze US Stocks{" "}
                <br className="hidden md:block" />
                <span className="text-brand">
                  Like a Pro.
                </span>
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 md:text-xl max-w-3xl mx-auto leading-relaxed">
                Real-time US equity insights delivered with speed, clarity, and analytical depth.
                Marketview360 transforms complex U.S. equity data into actionable intelligence.
                Source Ideas, value deeper, and trade with conviction.
              </p>
            </div>

            <div className="w-full max-w-2xl">
              <SearchBar />
              <div className="mt-8 flex flex-wrap justify-center items-center gap-4 text-sm">
                <span className="font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-widest text-[10px]">
                  Popular:
                </span>
                {['AAPL', 'NVDA', 'TSLA', 'MSFT'].map((ticker) => (
                  <Link
                    key={ticker}
                    href={`/company/${ticker}`}
                    className="px-4 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand dark:hover:border-brand hover:text-brand dark:hover:text-brand transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 text-slate-600 dark:text-slate-300 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                  >
                    {ticker}
                  </Link>
                ))}
              </div>
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
