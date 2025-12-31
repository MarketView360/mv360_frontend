import Link from "next/link";
import { RiTwitterXFill } from "react-icons/ri";
import { Linkedin } from "lucide-react";
import { Logo } from "@/components/common/Logo";

export function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8 transition-colors duration-300">
      <div className="mx-auto max-w-[1600px] px-4 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div className="space-y-4">
            <Link href="/" className="flex items-center">
              <Logo width={192} height={36} />
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              The fastest way to screen, analyze, and track US equities.
              Real-time data, powerful ratios, and clean design for the modern
              investor.
            </p>
            <div className="flex space-x-4">
              <Link
                href="https://x.com/marketview360io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 dark:text-slate-500 hover:text-brand dark:hover:text-brand transition-colors"
              >
                <RiTwitterXFill className="w-5 h-5" />
              </Link>
              <Link
                href="https://www.linkedin.com/company/marketview360io"
                target="_blank"
                rel="noopener noreferrer"
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
              Support
            </h3>
            <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
              <li>
                <Link href="/help" className="hover:text-brand transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-brand transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            © {new Date().getFullYear()} Marketview360 Inc. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-400 dark:text-slate-500">
            <Link
              href="/privacy"
              className="hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/cookies"
              className="hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
            >
              Cookies
            </Link>
            <Link
              href="/disclaimer"
              className="hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
            >
              Disclaimer
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
