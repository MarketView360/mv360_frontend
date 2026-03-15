import Link from "next/link";
import { ArrowLeft, Shield, Database, Eye, Lock, Share2, Globe, Trash2, Baby, Mail } from "lucide-react";

export default function PrivacyPolicyPage() {
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
            <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
              <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Privacy Policy</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Last updated: {lastUpdated}</p>
            </div>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
              At Marketview360, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
            </p>

            <section className="mt-10">
              <div className="flex items-center gap-2 mb-4">
                <Database className="h-5 w-5 text-green-600 dark:text-green-400" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white m-0">1. Information We Collect</h2>
              </div>
              
              <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mt-6">Personal Information</h3>
              <p className="text-slate-600 dark:text-slate-300">When you create an account, we collect:</p>
              <ul className="text-slate-600 dark:text-slate-300 space-y-1">
                <li>Full name</li>
                <li>Email address</li>
                <li>Password (encrypted)</li>
                <li>Profile information you choose to provide</li>
              </ul>

              <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mt-6">Usage Data</h3>
              <p className="text-slate-600 dark:text-slate-300">We automatically collect:</p>
              <ul className="text-slate-600 dark:text-slate-300 space-y-1">
                <li>IP address and device information</li>
                <li>Browser type and version</li>
                <li>Pages visited and features used</li>
                <li>Search queries and stocks viewed</li>
                <li>Time spent on the platform</li>
                <li>Error logs and performance data</li>
              </ul>

              <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mt-6">AI Chat Data</h3>
              <p className="text-slate-600 dark:text-slate-300">When you use our AI assistant (Jovan):</p>
              <ul className="text-slate-600 dark:text-slate-300 space-y-1">
                <li>Chat messages and conversation history</li>
                <li>Session metadata (timestamps, session IDs)</li>
                <li>Custom AI API keys you provide (encrypted at rest)</li>
              </ul>

              <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mt-6">Third-Party Authentication</h3>
              <p className="text-slate-600 dark:text-slate-300">
                If you sign in via Google or other OAuth providers, we receive your basic profile information as permitted by your privacy settings with those services.
              </p>
            </section>

            <section className="mt-10">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="h-5 w-5 text-green-600 dark:text-green-400" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white m-0">2. How We Use Your Information</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-300">We use collected information to:</p>
              <ul className="text-slate-600 dark:text-slate-300 space-y-2">
                <li><strong>Provide the Service:</strong> Deliver stock analysis, market data, and AI chat features</li>
                <li><strong>Personalization:</strong> Remember your preferences, watchlists, and settings</li>
                <li><strong>Communication:</strong> Send account notifications, updates, and optional marketing emails</li>
                <li><strong>Improvement:</strong> Analyze usage patterns to enhance our platform</li>
                <li><strong>Security:</strong> Detect fraud, abuse, and protect user accounts</li>
                <li><strong>Legal Compliance:</strong> Meet regulatory and legal obligations</li>
              </ul>
            </section>

            <section className="mt-10">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="h-5 w-5 text-green-600 dark:text-green-400" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white m-0">3. Data Security</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-300">We implement industry-standard security measures:</p>
              <ul className="text-slate-600 dark:text-slate-300 space-y-2">
                <li>All data transmitted via HTTPS/TLS encryption</li>
                <li>Passwords hashed using secure algorithms</li>
                <li>Custom API keys encrypted at rest</li>
                <li>Regular security audits and monitoring</li>
                <li>Access controls and authentication for all systems</li>
                <li>Data stored on secure cloud infrastructure (Supabase)</li>
              </ul>
              <p className="text-slate-600 dark:text-slate-300 mt-4">
                While we strive to protect your data, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.
              </p>
            </section>

            <section className="mt-10">
              <div className="flex items-center gap-2 mb-4">
                <Share2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white m-0">4. Information Sharing</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-300">We do NOT sell your personal information. We may share data with:</p>
              <ul className="text-slate-600 dark:text-slate-300 space-y-2">
                <li><strong>Service Providers:</strong> Third parties that help us operate (hosting, analytics, payment processing)</li>
                <li><strong>AI Providers:</strong> When using AI features, your prompts may be sent to AI providers (OpenAI, Anthropic, Groq) subject to their privacy policies</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
              </ul>
            </section>

            <section className="mt-10">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="h-5 w-5 text-green-600 dark:text-green-400" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white m-0">5. Cookies and Tracking</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-300">We use cookies and similar technologies for:</p>
              <ul className="text-slate-600 dark:text-slate-300 space-y-2">
                <li><strong>Essential Cookies:</strong> Required for authentication and core functionality</li>
                <li><strong>Preference Cookies:</strong> Remember your settings (theme, layout)</li>
                <li><strong>Analytics Cookies:</strong> Understand how users interact with our platform</li>
                <li><strong>Error Tracking:</strong> Monitor and fix issues (via Sentry)</li>
              </ul>
              <p className="text-slate-600 dark:text-slate-300 mt-4">
                You can control cookies through your browser settings. Disabling certain cookies may affect functionality.
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                For more details, see our <Link href="/cookies" className="text-blue-600 dark:text-blue-400 hover:underline">Cookie Policy</Link>.
              </p>
            </section>

            <section className="mt-10">
              <div className="flex items-center gap-2 mb-4">
                <Trash2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white m-0">6. Your Rights and Choices</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-300">You have the right to:</p>
              <ul className="text-slate-600 dark:text-slate-300 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                <li><strong>Portability:</strong> Receive your data in a portable format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Withdraw Consent:</strong> Where processing is based on consent</li>
              </ul>
              <p className="text-slate-600 dark:text-slate-300 mt-4">
                To exercise these rights, <Link href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">contact us</Link> and select &quot;Data Request&quot; as the category. We will respond within 30 days.
              </p>
            </section>

            <section className="mt-10">
              <div className="flex items-center gap-2 mb-4">
                <Database className="h-5 w-5 text-green-600 dark:text-green-400" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white m-0">7. Data Retention</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                We retain your personal data for as long as your account is active or as needed to provide services. After account deletion:
              </p>
              <ul className="text-slate-600 dark:text-slate-300 space-y-2">
                <li>Personal data is deleted within 30 days</li>
                <li>Some data may be retained for legal compliance (up to 7 years)</li>
                <li>Anonymized analytics data may be retained indefinitely</li>
                <li>Backup data is purged according to our retention schedule</li>
              </ul>
            </section>

            <section className="mt-10">
              <div className="flex items-center gap-2 mb-4">
                <Baby className="h-5 w-5 text-green-600 dark:text-green-400" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white m-0">8. Children&apos;s Privacy</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Marketview360 is not intended for users under 18 years of age. We do not knowingly collect information from children. If you believe a child has provided us with personal information, please contact us immediately.
              </p>
            </section>

            <section className="mt-10">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="h-5 w-5 text-green-600 dark:text-green-400" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white m-0">9. International Data Transfers</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in compliance with applicable laws.
              </p>
            </section>

            <section className="mt-10">
              <div className="flex items-center gap-2 mb-4">
                <Mail className="h-5 w-5 text-green-600 dark:text-green-400" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white m-0">10. Contact Us</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                For privacy-related questions or to exercise your rights:
              </p>
              <ul className="text-slate-600 dark:text-slate-300">
                <li>Email: <a href="mailto:privacy@marketview360.io" className="text-blue-600 dark:text-blue-400 hover:underline">support@marketview360.io</a></li>
                <li>Contact Page: <Link href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">marketview360.io/contact</Link></li>
              </ul>
            </section>

            <section className="mt-10">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">11. Changes to This Policy</h2>
              <p className="text-slate-600 dark:text-slate-300">
                We may update this Privacy Policy periodically. We will notify you of significant changes via email or through our platform. Your continued use after changes constitutes acceptance.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
              By using Marketview360, you acknowledge that you have read and understood this Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
