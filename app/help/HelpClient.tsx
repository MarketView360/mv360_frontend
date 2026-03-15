"use client";

import { useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  User,
  CreditCard,
  BarChart3,
  MessageSquare,
  Shield,
  Settings,
  Zap,
  Key,
  LucideIcon
} from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQCategory {
  id: string;
  title: string;
  iconName: string;
  description: string;
  faqs: FAQItem[];
}

const iconMap: Record<string, LucideIcon> = {
  HelpCircle,
  User,
  CreditCard,
  BarChart3,
  MessageSquare,
  Shield,
  Settings,
  Zap,
  Key,
};

export function HelpClient({ categories }: { categories: FAQCategory[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const filteredCategories = categories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0);

  return (
    <>
      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* FAQ Categories */}
      <div className="space-y-4">
        {filteredCategories.map((category) => {
          const Icon = iconMap[category.iconName] || HelpCircle;
          const isExpanded = expandedCategory === category.id;

          return (
            <div
              key={category.id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-slate-900 dark:text-white">{category.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{category.description}</p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                )}
              </button>

              {isExpanded && (
                <div className="px-6 pb-4 space-y-3">
                  {category.faqs.map((faq, idx) => {
                    const faqId = `${category.id}-${idx}`;
                    const isFAQExpanded = expandedFAQ === faqId;

                    return (
                      <div
                        key={faqId}
                        className="border-t border-slate-100 dark:border-slate-700 pt-3"
                      >
                        <button
                          onClick={() => setExpandedFAQ(isFAQExpanded ? null : faqId)}
                          className="w-full text-left flex items-start justify-between gap-3 group"
                        >
                          <span className="font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {faq.question}
                          </span>
                          {isFAQExpanded ? (
                            <ChevronDown className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                          )}
                        </button>
                        {isFAQExpanded && (
                          <p className="mt-2 text-slate-600 dark:text-slate-300 leading-relaxed">
                            {faq.answer}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400">No results found for "{searchQuery}"</p>
          </div>
        )}
      </div>
    </>
  );
}
