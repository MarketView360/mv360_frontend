"use client";

import Link from "next/link";
import { ArrowLeft, FileText, Scale, AlertTriangle, Shield, Users, CreditCard, Ban, RefreshCw } from "lucide-react";

export default function TermsOfServicePage() {
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
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Terms of Service</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Last updated: {lastUpdated}</p>
            </div>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
              Welcome to Marketview360. By accessing or using our platform, you agree to be bound by these Terms of Service. Please read them carefully.
            </p>

            <section className="mt-10">
              <div className="flex items-center gap-2 mb-4">
                <Scale className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white m-0">1. Acceptance of Terms</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                By creating an account or using Marketview360 (&quot;Service&quot;), you agree to these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our Service.
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                We reserve the right to modify these terms at any time. Continued use of the Service after changes constitutes acceptance of the modified terms.
              </p>
            </section>

            <section className="mt-10">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white m-0">2. User Accounts</h2>
              </div>
              <ul className="text-slate-600 dark:text-slate-300 space-y-2">
                <li>You must be at least 18 years old to use this Service.</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                <li>You agree to provide accurate and complete information when creating your account.</li>
                <li>You are responsible for all activities that occur under your account.</li>
                <li>You must notify us immediately of any unauthorized use of your account.</li>
              </ul>
            </section>

            <section className="mt-10">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white m-0">3. Financial Disclaimer</h2>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <p className="text-slate-700 dark:text-slate-300 font-medium mb-2">
                  IMPORTANT: Marketview360 is for informational purposes only and does not constitute financial advice.
                </p>
                <ul className="text-slate-600 dark:text-slate-300 space-y-2 text-sm">
                  <li>The information provided is not intended as investment, legal, or tax advice.</li>
                  <li>Past performance does not guarantee future results.</li>
                  <li>Stock prices and market data may be delayed or inaccurate.</li>
                  <li>You should consult with qualified professionals before making investment decisions.</li>
                  <li>We are not responsible for any financial losses incurred based on information from our Service.</li>
                  <li>AI-generated insights and analysis should not be solely relied upon for investment decisions.</li>
                </ul>
              </div>
            </section>

            <section className="mt-10">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white m-0">4. Acceptable Use</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-300">You agree NOT to:</p>
              <ul className="text-slate-600 dark:text-slate-300 space-y-2">
                <li>Use the Service for any illegal or unauthorized purpose.</li>
                <li>Attempt to gain unauthorized access to our systems or other users&apos; accounts.</li>
                <li>Use automated tools to scrape, crawl, or extract data from the Service.</li>
                <li>Redistribute, resell, or commercially exploit our data without authorization.</li>
                <li>Interfere with or disrupt the Service or servers.</li>
                <li>Upload malicious code or content.</li>
                <li>Impersonate others or provide false information.</li>
                <li>Use the Service to manipulate markets or engage in fraudulent activities.</li>
              </ul>
            </section>

            <section className="mt-10">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white m-0">5. Subscriptions and Payments</h2>
              </div>
              <ul className="text-slate-600 dark:text-slate-300 space-y-2">
                <li>Some features may require a paid subscription.</li>
                <li>Subscription fees are billed in advance on a recurring basis.</li>
                <li>You may cancel your subscription at any time through your account settings.</li>
                <li>Refunds are provided in accordance with our refund policy.</li>
                <li>We reserve the right to change pricing with reasonable notice.</li>
              </ul>
            </section>

            <section className="mt-10">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white m-0">6. Intellectual Property</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                All content, features, and functionality of the Service, including but not limited to text, graphics, logos, and software, are owned by Marketview360 and protected by intellectual property laws.
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                You may not copy, modify, distribute, or create derivative works without our express written permission.
              </p>
            </section>

            <section className="mt-10">
              <div className="flex items-center gap-2 mb-4">
                <RefreshCw className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white m-0">7. Third-Party Services and Data</h2>
              </div>
              <ul className="text-slate-600 dark:text-slate-300 space-y-2">
                <li>Our Service integrates with third-party data providers (e.g., EODHD, news APIs).</li>
                <li>We are not responsible for the accuracy or availability of third-party data.</li>
                <li>Use of custom API keys is at your own risk and subject to those providers&apos; terms.</li>
                <li>Links to third-party websites are provided for convenience only.</li>
              </ul>
            </section>

            <section className="mt-10">
              <div className="flex items-center gap-2 mb-4">
                <Ban className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white m-0">8. Limitation of Liability</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, MARKETVIEW360 SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR OTHER INTANGIBLE LOSSES.
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                The Service is provided &quot;AS IS&quot; without warranties of any kind, either express or implied.
              </p>
            </section>

            <section className="mt-10">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white m-0">9. Termination</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                We may terminate or suspend your account immediately, without prior notice, for any reason, including breach of these Terms.
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                Upon termination, your right to use the Service will cease immediately. You may request deletion of your data in accordance with our Privacy Policy.
              </p>
            </section>

            <section className="mt-10">
              <div className="flex items-center gap-2 mb-4">
                <Scale className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white m-0">10. Governing Law</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to conflict of law principles.
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                Any disputes arising from these Terms shall be resolved through binding arbitration or in the courts of competent jurisdiction.
              </p>
            </section>

            <section className="mt-10">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">11. Contact Us</h2>
              <p className="text-slate-600 dark:text-slate-300">
                If you have questions about these Terms of Service, please contact us at:
              </p>
              <ul className="text-slate-600 dark:text-slate-300">
                <li>Email: <a href="mailto:legal@marketview360.io" className="text-blue-600 dark:text-blue-400 hover:underline">support@marketview360.io</a></li>
                <li>Contact Page: <Link href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">marketview360.io/contact</Link></li>
              </ul>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
              By using Marketview360, you acknowledge that you have read and understood these Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
