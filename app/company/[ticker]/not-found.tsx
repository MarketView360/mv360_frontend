import Link from "next/link";
import { AlertTriangle, Search, TrendingUp, Home, X, MessageCircleQuestionMark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function CompanyNotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Card className="max-w-2xl w-full border-slate-200 dark:border-slate-800 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardContent className="p-8 md:p-12">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full blur-xl opacity-30 animate-pulse" />
              <div className="relative bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-full p-6">
                <X className="h-16 w-16 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-center text-slate-900 dark:text-white mb-4">
            Stock Not Found
          </h1>

          {/* Description */}
          <div className="text-center mb-8">
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-3">
              We couldn&apos;t find the stock or company you&apos;re looking for.
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500">
              This ticker may not be available or supported by{" "}
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400">
                MarketView360
              </span>{" "}
              at this time.
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Search className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              What you can do:
            </h3>
            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span>Double-check the ticker symbol for any typos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span>Try searching for the company name instead</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span>Browse our supported stocks from the screener</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span>Check if the stock is listed on a major US exchange</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/" className="w-full">
              <Button variant="outline" className="w-full h-12 border-2 group hover:border-brand hover:bg-brand/5">
                <Home className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                Go to Home
              </Button>
            </Link>
            <Link href="/contact" className="w-full">
              <Button variant="outline" className="w-full h-12 border-2 group hover:border-brand hover:bg-brand/5">
                <MessageCircleQuestionMark className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                Contact Support
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
