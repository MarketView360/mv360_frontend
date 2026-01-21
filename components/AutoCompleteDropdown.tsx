"use client";

import React, { useEffect, useRef } from 'react';
import { QuerySuggestion } from '@/lib/queryBuilder';
import { Hash, Code, Zap, TrendingUp, BarChart3, Calculator, Target } from 'lucide-react';

interface AutoCompleteDropdownProps {
  suggestions: QuerySuggestion[];
  selectedIndex: number;
  onSelect: (suggestion: QuerySuggestion) => void;
  onClose: () => void;
  position: { top: number; left: number };
  visible: boolean;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'field': return <Hash className="w-3.5 h-3.5 text-brand" />;
    case 'operator': return <Code className="w-3.5 h-3.5 text-purple-500" />;
    case 'function': return <Zap className="w-3.5 h-3.5 text-growth" />;
    default: return <Calculator className="w-3.5 h-3.5 text-slate-400" />;
  }
};

const getCategoryIcon = (suggestion: QuerySuggestion) => {
  const text = suggestion.text.toLowerCase();
  if (text.includes('growth') || text.includes('cagr')) return <TrendingUp className="w-3.5 h-3.5 text-growth" />;
  if (text.includes('ratio') || text.includes('return')) return <BarChart3 className="w-3.5 h-3.5 text-brand" />;
  if (text.includes('price') || text.includes('market')) return <Target className="w-3.5 h-3.5 text-purple-500" />;
  return getTypeIcon(suggestion.type);
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'field': return 'border-l-brand-400 bg-brand-50/30';
    case 'operator': return 'border-l-purple-400 bg-purple-50/30';
    case 'function': return 'border-l-growth-400 bg-growth-50/30';
    default: return 'border-l-slate-300 bg-slate-50/30';
  }
};

const getKeyboardShortcut = (index: number) => {
  if (index < 9) return `${index + 1}`;
  return null;
};

export default function AutoCompleteDropdown({
  suggestions,
  selectedIndex,
  onSelect,
  onClose,
  position,
  visible
}: AutoCompleteDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!visible) return;

      // Number key shortcuts (1-9)
      const num = parseInt(event.key);
      if (num >= 1 && num <= 9 && num <= suggestions.length) {
        event.preventDefault();
        onSelect(suggestions[num - 1]);
      }
    };

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [visible, onClose, suggestions, onSelect]);

  useEffect(() => {
    // Scroll selected item into view
    if (dropdownRef.current && selectedIndex >= 0) {
      const selectedElement = dropdownRef.current.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!visible || suggestions.length === 0) return null;

  return (
    <div
      ref={dropdownRef}
      className="fixed z-50 w-96 max-h-80 overflow-hidden bg-white border border-slate-200 rounded-xl shadow-2xl backdrop-blur-sm"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      {/* Compact Header */}
      <div className="px-3 py-2 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <Calculator className="w-3 h-3" />
            <span className="font-medium">Quick Insert</span>
          </div>
          <div className="flex items-center gap-3 text-slate-500">
            <span>↑↓ Navigate</span>
            <span>Tab/Enter Insert</span>
            <span>1-9 Quick</span>
          </div>
        </div>
      </div>

      {/* Suggestions List */}
      <div className="overflow-y-auto max-h-64">
        {suggestions.map((suggestion, index) => {
          const shortcut = getKeyboardShortcut(index);
          const showCategoryHeader = index === 0 || suggestions[index - 1].category !== suggestion.category;

          return (
            <React.Fragment key={`${suggestion.text}-${index}`}>
              {showCategoryHeader && suggestion.category && (
                <div className="px-3 py-1.5 bg-slate-50/80 dark:bg-slate-800/80 text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-700 mt-1 first:mt-0">
                  {suggestion.category}
                </div>
              )}
              <button
                data-index={index}
                className={`w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-150 border-l-2 group ${index === selectedIndex
                  ? `${getTypeColor(suggestion.type)} border-l-3 bg-slate-50 dark:bg-slate-800`
                  : 'border-l-transparent hover:border-l-slate-200 dark:hover:border-l-slate-700'
                  }`}
                onClick={() => onSelect(suggestion)}
              >
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div className="shrink-0">
                    {getCategoryIcon(suggestion)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium text-slate-900 dark:text-slate-100 truncate text-sm">
                        {suggestion.text}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-md uppercase font-bold shrink-0">
                        {suggestion.type}
                      </span>
                    </div>
                    {suggestion.description && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {suggestion.description}
                      </div>
                    )}
                  </div>

                  {/* Keyboard Shortcut */}
                  {shortcut && (
                    <div className="shrink-0">
                      <kbd className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 group-hover:bg-white dark:group-hover:bg-slate-900 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                        {shortcut}
                      </kbd>
                    </div>
                  )}
                </div>
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Compact Footer */}
      <div className="px-3 py-2 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{suggestions.length} result{suggestions.length !== 1 ? 's' : ''}</span>
          <span>Press Esc to close</span>
        </div>
      </div>
    </div>
  );
}