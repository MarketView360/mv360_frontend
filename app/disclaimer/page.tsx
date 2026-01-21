"use client";

import Link from "next/link";
import { ArrowLeft, AlertTriangle, TrendingUp, Bot, Database, Scale } from "lucide-react";

export default function DisclaimerPage() {
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
              <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Disclaimer</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Last updated: {lastUpdated}</p>
            </div>
          </div>

          {/* Important Warning Box */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700 rounded-xl p-6 mb-10">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="font-bold text-amber-800 dark:text-amber-300 text-lg mb-2">
                  Important: Not Financial Advice
                </h2>
                <p className="text-amber-700 dark:text-amber-400">
                  Marketview360 provides financial information for educational and informational purposes only. 
                  Nothing on this platform should be construed as investment advice, financial advice, trading advice, 
                  or any other type of advice. You should not make any financial decisions based solely on the 
                  information provided here.
                </p>
              </div>
            </div>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-10">
            
            <section>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white m-0">Investment Risks</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Investing in stocks and securities involves substantial risk of loss and is not suitable for every investor. 
                The valuation of stocks and securities may fluctuate, and, as a result, you may lose more than your original investment.
              </p>
              <ul className="text-slate-600 dark:text-slate-300 space-y-2">
                <li><strong>Past performance is not indicative of future results.</strong> Historical data shown on our platform does not guarantee future performance.</li>
                <li><strong>You can lose money.</strong> The value of investments can go down as well as up.</li>
                <li><strong>Market volatility.</strong> Stock prices can be highly volatile and affected by numerous factors beyond anyone&apos;s control.</li>
                <li><strong>No guaranteed returns.</strong> There are no guarantees that any investment strategy will be successful.</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <Database className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white m-0">Data Accuracy</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                While we strive to provide accurate and up-to-date information, we make no representations or warranties 
                about the accuracy, completeness, or reliability of any data displayed on our platform.
              </p>
              <ul className="text-slate-600 dark:text-slate-300 space-y-2">
                <li><strong>Data delays.</strong> Stock prices and market data may be delayed by 15-20 minutes or more depending on the source.</li>
                <li><strong>Third-party data.</strong> We rely on third-party data providers who may have their own accuracy limitations.</li>
                <li><strong>Technical errors.</strong> Data may occasionally be incorrect due to technical issues, transmission errors, or provider issues.</li>
                <li><strong>No verification.</strong> We do not independently verify all data from our sources.</li>
              </ul>
              <p className="text-slate-600 dark:text-slate-300 mt-4">
                Always verify important information from multiple sources before making investment decisions.
              </p>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <Bot className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white m-0">AI-Generated Content</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Our platform includes AI-powered features (Jovan assistant) that generate content based on machine learning models. 
                This content is subject to additional limitations:
              </p>
              <ul className="text-slate-600 dark:text-slate-300 space-y-2">
                <li><strong>AI can be wrong.</strong> AI systems may produce inaccurate, incomplete, or misleading information.</li>
                <li><strong>Not real-time.</strong> AI models have knowledge cutoff dates and may not reflect the most recent market events.</li>
                <li><strong>No personalization.</strong> AI responses are general and do not account for your specific financial situation, goals, or risk tolerance.</li>
                <li><strong>Hallucinations.</strong> AI may occasionally generate plausible-sounding but incorrect or fabricated information.</li>
                <li><strong>Not a substitute.</strong> AI analysis should never replace advice from qualified financial professionals.</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <Scale className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white m-0">Professional Advice</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Before making any investment decisions, you should:
              </p>
              <ul className="text-slate-600 dark:text-slate-300 space-y-2">
                <li>Consult with a qualified financial advisor who understands your personal financial situation.</li>
                <li>Consider your investment objectives, risk tolerance, and time horizon.</li>
                <li>Conduct your own due diligence and research.</li>
                <li>Understand the risks associated with any investment.</li>
                <li>Never invest more than you can afford to lose.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Limitation of Liability</h2>
              <p className="text-slate-600 dark:text-slate-300">
                To the fullest extent permitted by applicable law, Marketview360 and its affiliates, officers, employees, 
                agents, partners, and licensors shall not be liable for any direct, indirect, incidental, special, 
                consequential, or punitive damages, including but not limited to:
              </p>
              <ul className="text-slate-600 dark:text-slate-300 space-y-1">
                <li>Loss of profits, revenue, or anticipated savings</li>
                <li>Loss of data or business interruption</li>
                <li>Investment losses or financial damages</li>
                <li>Any other pecuniary loss</li>
              </ul>
              <p className="text-slate-600 dark:text-slate-300 mt-4">
                This limitation applies regardless of the legal theory under which damages are sought.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Third-Party Links and Services</h2>
              <p className="text-slate-600 dark:text-slate-300">
                Our platform may contain links to third-party websites, services, or resources. We are not responsible 
                for the content, accuracy, or practices of these external sites. Accessing third-party links is at your own risk.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Regulatory Compliance</h2>
              <p className="text-slate-600 dark:text-slate-300">
                Marketview360 is not a registered investment advisor, broker-dealer, or financial planner. We do not 
                provide personalized investment recommendations. Our platform is intended for informational purposes only 
                and should not be used as the sole basis for investment decisions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Contact</h2>
              <p className="text-slate-600 dark:text-slate-300">
                If you have questions about this disclaimer, please contact us at{" "}
                <a href="mailto:support@marketview360.io" className="text-blue-600 dark:text-blue-400 hover:underline">
                  support@marketview360.io
                </a>
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
              By using Marketview360, you acknowledge that you have read, understood, and agree to this disclaimer.
            </p>
            <div className="flex flex-wrap gap-4 justify-center mt-4">
              <Link href="/terms" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                Terms of Service
              </Link>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <Link href="/privacy" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
