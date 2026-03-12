import Link from "next/link";
import { SupportWidget } from "@/components/support/SupportWidget";
import {
  ArrowLeft,
  HelpCircle,
  User,
  CreditCard,
  BarChart3,
  MessageSquare,
  Shield,
  Settings,
  Zap,
  Key
} from "lucide-react";
import { HelpClient } from "./HelpClient";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
  faqs: FAQItem[];
}

const faqCategories: FAQCategory[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: Zap,
    description: "New to Marketview360? Start here.",
    faqs: [
      {
        question: "What is Marketview360?",
        answer: "Marketview360 is a comprehensive platform for analyzing US equities. We provide real-time stock data, financial metrics, technical analysis, market news, and an AI-powered assistant to help you make informed investment decisions."
      },
      {
        question: "How do I create an account?",
        answer: "Click 'Sign Up' in the top navigation bar. You can register using your email address or sign in with Google. After verifying your email, you'll have full access to the platform."
      },
      {
        question: "Is Marketview360 free to use?",
        answer: "Yes! We offer a free tier with access to core features including stock screening, market overview, news, and limited AI chat. Premium features and higher usage limits are available through paid subscriptions."
      },
      {
        question: "What markets does Marketview360 cover?",
        answer: "We currently focus on US equities listed on major exchanges (NYSE, NASDAQ, AMEX). This includes stocks, ETFs, and major indices like S&P 500, Dow Jones, and NASDAQ Composite."
      }
    ]
  },
  {
    id: "account",
    title: "Account & Profile",
    icon: User,
    description: "Manage your account settings.",
    faqs: [
      {
        question: "How do I reset my password?",
        answer: "Go to the login page and click 'Forgot Password'. Enter your email address and we'll send you a password reset link. You can also change your password from Settings > Account if you're already logged in."
      },
      {
        question: "How do I delete my account?",
        answer: "Visit Settings > Account and scroll to the 'Danger Zone' section. Click 'Delete Account' and follow the confirmation steps. Note: This action is irreversible and will delete all your data, including chat history and saved preferences."
      },
      {
        question: "Can I change my email address?",
        answer: "Currently, you cannot change your email address directly. Please contact support if you need to update your email, and we'll help you migrate your account."
      },
      {
        question: "How do I enable two-factor authentication?",
        answer: "Two-factor authentication is currently handled through your OAuth provider (e.g., Google). We recommend enabling 2FA on your Google account for enhanced security."
      }
    ]
  },
  {
    id: "stock-screener",
    title: "Stock Screener",
    icon: BarChart3,
    description: "Learn to use our powerful screener.",
    faqs: [
      {
        question: "How does the stock screener work?",
        answer: "Our screener lets you filter stocks based on various criteria including market cap, P/E ratio, dividend yield, sector, and technical indicators. Select your filters, and we'll show you matching stocks in real-time."
      },
      {
        question: "Can I save my screener filters?",
        answer: "Yes! After setting up your filters, click 'Save Screen' to store your criteria. You can access saved screens from your profile and quickly rerun them anytime."
      },
      {
        question: "How often is the screener data updated?",
        answer: "Stock prices update in near real-time during market hours. Fundamental data (financials, ratios) is updated daily after market close. Technical indicators are recalculated with each price update."
      },
      {
        question: "What technical indicators are available?",
        answer: "We offer popular indicators including Moving Averages (SMA, EMA), RSI, MACD, Bollinger Bands, Volume analysis, and more. These help identify trends, momentum, and potential entry/exit points."
      }
    ]
  },
  {
    id: "ai-assistant",
    title: "AI Assistant (Jovan)",
    icon: MessageSquare,
    description: "Get the most out of our AI chat.",
    faqs: [
      {
        question: "What can Jovan help me with?",
        answer: "Jovan can answer questions about stocks, explain financial concepts, analyze company fundamentals, discuss market trends, and help you understand technical analysis. It's designed to be your intelligent research companion."
      },
      {
        question: "Is the AI advice financial recommendation?",
        answer: "No. Jovan provides educational information only and should not be considered financial advice. Always consult with a qualified financial advisor before making investment decisions. AI responses are for informational purposes only."
      },
      {
        question: "Can I use my own AI API keys?",
        answer: "Yes! Go to Settings > AI Configuration to add your own API keys for OpenAI, Anthropic, Groq, or other providers. This gives you more control and potentially higher usage limits."
      },
      {
        question: "How do I delete my chat history?",
        answer: "Go to Settings > Privacy & Data and click 'Delete All Chat History'. This will permanently remove all your conversations with Jovan. You can also delete individual chat sessions from the chat interface."
      }
    ]
  },
  {
    id: "data-security",
    title: "Data & Security",
    icon: Shield,
    description: "How we protect your information.",
    faqs: [
      {
        question: "How is my data protected?",
        answer: "We use industry-standard encryption (TLS/SSL) for all data transmission. Passwords are hashed, API keys are encrypted at rest, and we follow security best practices. Our infrastructure is hosted on secure cloud platforms."
      },
      {
        question: "Do you sell my data?",
        answer: "Absolutely not. We never sell your personal information to third parties. We only share data with service providers necessary to operate the platform, as detailed in our Privacy Policy."
      },
      {
        question: "Where is my data stored?",
        answer: "Your data is stored securely on Supabase infrastructure in the United States. We maintain regular backups and have disaster recovery procedures in place."
      },
      {
        question: "Can I export my data?",
        answer: "Yes. You can request a copy of your personal data by contacting support. We'll provide your data in a portable format within 30 days, in compliance with privacy regulations."
      }
    ]
  },
  {
    id: "billing",
    title: "Billing & Subscriptions",
    icon: CreditCard,
    description: "Payments and plan information.",
    faqs: [
      {
        question: "What payment methods do you accept?",
        answer: "We accept major credit cards (Visa, Mastercard, American Express) and debit cards through our secure payment processor. Additional payment methods may be available in your region."
      },
      {
        question: "How do I cancel my subscription?",
        answer: "Go to Settings > Subscription and click 'Cancel Subscription'. Your access will continue until the end of your current billing period. You can resubscribe anytime."
      },
      {
        question: "Do you offer refunds?",
        answer: "We offer a 7-day money-back guarantee for new subscribers. If you're not satisfied within 7 days of your first payment, contact support for a full refund. After this period, refunds are handled on a case-by-case basis."
      },
      {
        question: "Can I switch between plans?",
        answer: "Yes! You can upgrade or downgrade your plan anytime from Settings > Subscription. Upgrades take effect immediately with prorated billing. Downgrades apply at the next billing cycle."
      }
    ]
  }
];

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4">
      <SupportWidget />
      <div className="max-w-5xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl mb-4">
            <HelpCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">Help Center</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Find answers to common questions or contact our support team
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Link href="/contact" className="flex flex-col items-center p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group">
            <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-slate-900 dark:text-white">Contact Us</span>
          </Link>
          <Link href="/settings" className="flex flex-col items-center p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group">
            <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-slate-900 dark:text-white">Settings</span>
          </Link>
          <Link href="/privacy" className="flex flex-col items-center p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group">
            <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-slate-900 dark:text-white">Privacy</span>
          </Link>
          <Link href="/terms" className="flex flex-col items-center p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group">
            <Key className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-slate-900 dark:text-white">Terms</span>
          </Link>
        </div>

        {/* Interactive FAQ Component */}
        <HelpClient categories={faqCategories} />

        {/* Still Need Help */}
        <div className="mt-12 bg-blue-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Still Need Help?</h2>
          <p className="text-blue-100 mb-6">
            Can&apos;t find what you&apos;re looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              Contact Support
            </Link>
            <Link
              href="/ai"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-400 transition-colors"
            >
              <Zap className="h-4 w-4" />
              Ask Jovan AI
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
