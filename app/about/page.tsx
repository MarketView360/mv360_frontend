"use client";

import Link from "next/link";
import { ArrowLeft, TrendingUp, Zap, Shield, Users, Target, Eye, BarChart3, Globe, Heart } from "lucide-react";

export default function AboutPage() {
  const values = [
    {
      icon: Zap,
      title: "Speed & Efficiency",
      description: "Real-time data and lightning-fast analysis tools to keep you ahead of the market."
    },
    {
      icon: Shield,
      title: "Trust & Transparency",
      description: "Clear data sourcing, honest limitations, and no hidden agendas."
    },
    {
      icon: Target,
      title: "Precision",
      description: "Accurate financial metrics and reliable technical indicators you can depend on."
    },
    {
      icon: Users,
      title: "Accessibility",
      description: "Professional-grade tools made accessible for investors of all experience levels."
    }
  ];

  const features = [
    {
      icon: BarChart3,
      title: "Stock Screener",
      description: "Filter thousands of stocks by fundamental and technical criteria to find opportunities."
    },
    {
      icon: TrendingUp,
      title: "Market Overview",
      description: "Real-time indices, sector performance, and market breadth at a glance."
    },
    {
      icon: Globe,
      title: "Market News",
      description: "Curated financial news and analysis to stay informed on market-moving events."
    },
    {
      icon: Zap,
      title: "AI Assistant",
      description: "Intelligent chat assistant to help you research stocks and understand concepts."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-white dark:bg-slate-900">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              About <span className="text-blue-600">Marketview360</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
              We&apos;re building the fastest, most intuitive platform for analyzing US equities.
              Our mission is to give every investor access to professional-grade research tools.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Our Mission</h2>
            </div>
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              Financial markets shouldn&apos;t require expensive subscriptions or complex interfaces to understand.
              We believe that clear, accurate data presented thoughtfully can help anyone make better investment decisions.
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              Marketview360 combines real-time market data, comprehensive financial metrics, and AI-powered
              analysis in one clean, modern platform. Whether you&apos;re a seasoned trader or just starting your
              investment journey, we&apos;re here to help you analyze US stocks like a pro.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 bg-white dark:bg-slate-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Our Values</h2>
            <p className="text-slate-600 dark:text-slate-400">The principles that guide everything we build</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{value.title}</h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">{value.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">What We Offer</h2>
            <p className="text-slate-600 dark:text-slate-400">Powerful tools for smarter investing</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                      <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                      <p className="text-slate-600 dark:text-slate-400">{feature.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Data Sources Section */}
      <section className="py-16 px-4 bg-white dark:bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 md:p-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Data Sources</h2>
            <p className="text-slate-600 dark:text-slate-300 text-center mb-8">
              We aggregate data from trusted financial data providers to ensure accuracy and reliability.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="font-medium text-slate-900 dark:text-white">EODHD</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Market Data</p>
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="font-medium text-slate-900 dark:text-white">News APIs</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Financial News</p>
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="font-medium text-slate-900 dark:text-white">SEC Filings</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Company Data</p>
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="font-medium text-slate-900 dark:text-white">OpenAI/Anthropic</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">AI Analysis</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl mb-6">
            <Heart className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Built for Investors, by Investors
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
            We use Marketview360 every day for our own research. Join thousands of investors
            who trust our platform to help them make smarter decisions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
