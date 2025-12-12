import Link from "next/link";
import { Twitter, Linkedin, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8 transition-colors duration-300">
      <div className="mx-auto max-w-[1600px] px-4 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-heading font-bold text-xl text-brand text-black dark:text-white">
                Marketview360
              </span>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              The fastest way to screen, analyze, and track US equities.
              Real-time data, powerful ratios, and clean design for the modern
              investor.
            </p>
            <div className="flex space-x-4">
              <Link
                href="#"
                className="text-slate-400 dark:text-slate-500 hover:text-brand dark:hover:text-brand transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </Link>
              <Link
                href="#"
                className="text-slate-400 dark:text-slate-500 hover:text-brand dark:hover:text-brand transition-colors"
              >
                <Github className="w-5 h-5" />
              </Link>
              <Link
                href="#"
                className="text-slate-400 dark:text-slate-500 hover:text-brand dark:hover:text-brand transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
              Product
            </h3>
            <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
              <li>
                <Link
                  href="/screens"
                  className="hover:text-brand transition-colors"
                >
                  Stock Screener
                </Link>
              </li>
              <li>
                <Link
                  href="/market"
                  className="hover:text-brand transition-colors"
                >
                  Market Overview
                </Link>
              </li>
              <li>
                <Link
                  href="/news"
                  className="hover:text-brand transition-colors"
                >
                  Market News
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
              Resources
            </h3>
            <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
              <li>
                <Link href="/coming-soon" className="hover:text-brand transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/coming-soon" className="hover:text-brand transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/coming-soon" className="hover:text-brand transition-colors">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
              Company
            </h3>
            <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
              <li>
                <Link href="/coming-soon" className="hover:text-brand transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/coming-soon" className="hover:text-brand transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            © {new Date().getFullYear()} Marketview360 Inc. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-slate-400 dark:text-slate-500">
            <Link
              href="#"
              className="hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              className="hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
