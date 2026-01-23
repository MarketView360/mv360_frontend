"use client";

import Link from "next/link";
import { ArrowLeft, Cookie, Settings, BarChart3, Shield, AlertCircle } from "lucide-react";

export default function CookiePolicyPage() {
  const lastUpdated = "December 23, 2025";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 md:p-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30">
              <Cookie className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Cookie Policy</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Last updated: {lastUpdated}</p>
            </div>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
              This Cookie Policy explains how Marketview360 uses cookies and similar tracking technologies when you visit our platform.
            </p>

            <section className="mt-10">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">What Are Cookies?</h2>
              <p className="text-slate-600 dark:text-slate-300">
                Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences and improve your experience. We also use similar technologies like local storage and session storage.
              </p>
            </section>

            <section className="mt-10">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white m-0">Essential Cookies</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                These cookies are required for the platform to function properly. They cannot be disabled.
              </p>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-700 dark:text-slate-300">
                      <th className="pb-2">Cookie</th>
                      <th className="pb-2">Purpose</th>
                      <th className="pb-2">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-600 dark:text-slate-400">
                    <tr>
                      <td className="py-2 font-mono text-xs">sb-access-token</td>
                      <td className="py-2">Authentication session</td>
                      <td className="py-2">Session</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-mono text-xs">sb-refresh-token</td>
                      <td className="py-2">Session refresh</td>
                      <td className="py-2">7 days</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-mono text-xs">csrf-token</td>
                      <td className="py-2">Security protection</td>
                      <td className="py-2">Session</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-10">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white m-0">Preference Cookies</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                These cookies remember your settings and preferences to provide a personalized experience.
              </p>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-700 dark:text-slate-300">
                      <th className="pb-2">Cookie</th>
                      <th className="pb-2">Purpose</th>
                      <th className="pb-2">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-600 dark:text-slate-400">
                    <tr>
                      <td className="py-2 font-mono text-xs">theme</td>
                      <td className="py-2">Light/dark mode preference</td>
                      <td className="py-2">1 year</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-mono text-xs">text-size</td>
                      <td className="py-2">Display text size</td>
                      <td className="py-2">1 year</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-mono text-xs">compact-mode</td>
                      <td className="py-2">UI density preference</td>
                      <td className="py-2">1 year</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-10">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white m-0">Analytics Cookies</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                These cookies help us understand how visitors interact with our platform so we can improve it.
              </p>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-700 dark:text-slate-300">
                      <th className="pb-2">Cookie</th>
                      <th className="pb-2">Purpose</th>
                      <th className="pb-2">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-600 dark:text-slate-400">
                    <tr>
                      <td className="py-2 font-mono text-xs">_ga</td>
                      <td className="py-2">Google Analytics visitor ID</td>
                      <td className="py-2">2 years</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-mono text-xs">_gid</td>
                      <td className="py-2">Google Analytics session ID</td>
                      <td className="py-2">24 hours</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-10">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white m-0">Error Tracking</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                We use Sentry for error monitoring to improve platform stability and quickly fix issues.
              </p>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-700 dark:text-slate-300">
                      <th className="pb-2">Cookie</th>
                      <th className="pb-2">Purpose</th>
                      <th className="pb-2">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-600 dark:text-slate-400">
                    <tr>
                      <td className="py-2 font-mono text-xs">sentry-sc</td>
                      <td className="py-2">Error tracking session</td>
                      <td className="py-2">Session</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-10">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Managing Cookies</h2>
              <p className="text-slate-600 dark:text-slate-300">
                You can control cookies through your browser settings:
              </p>
              <ul className="text-slate-600 dark:text-slate-300 space-y-2">
                <li><strong>Chrome:</strong> Settings &gt; Privacy and security &gt; Cookies</li>
                <li><strong>Firefox:</strong> Settings &gt; Privacy &amp; Security &gt; Cookies</li>
                <li><strong>Safari:</strong> Preferences &gt; Privacy &gt; Cookies</li>
                <li><strong>Edge:</strong> Settings &gt; Cookies and site permissions</li>
              </ul>
              <p className="text-slate-600 dark:text-slate-300 mt-4">
                Note: Blocking essential cookies may prevent you from using certain features of our platform.
              </p>
            </section>

            <section className="mt-10">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Third-Party Cookies</h2>
              <p className="text-slate-600 dark:text-slate-300">
                Some third-party services we use may set their own cookies:
              </p>
              <ul className="text-slate-600 dark:text-slate-300 space-y-2">
                <li><strong>Google:</strong> For authentication (OAuth) and analytics</li>
                <li><strong>Supabase:</strong> For authentication and database services</li>
                <li><strong>Sentry:</strong> For error tracking and monitoring</li>
              </ul>
              <p className="text-slate-600 dark:text-slate-300 mt-4">
                These services have their own privacy policies governing cookie use.
              </p>
            </section>

            <section className="mt-10">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Updates to This Policy</h2>
              <p className="text-slate-600 dark:text-slate-300">
                We may update this Cookie Policy from time to time. Changes will be posted on this page with an updated revision date.
              </p>
            </section>

            <section className="mt-10">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Contact Us</h2>
              <p className="text-slate-600 dark:text-slate-300">
                If you have questions about our use of cookies, please contact us at{" "}
                <a href="mailto:support@marketview360.io" className="text-blue-600 dark:text-blue-400 hover:underline">
                  support@marketview360.io
                </a>
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-4 justify-center">
            <Link href="/privacy" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Privacy Policy
            </Link>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <Link href="/terms" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
