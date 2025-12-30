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
    case 'field': return <Hash className="w-3.5 h-3.5 text-blue-500" />;
    case 'operator': return <Code className="w-3.5 h-3.5 text-purple-500" />;
    case 'function': return <Zap className="w-3.5 h-3.5 text-green-500" />;
    default: return <Calculator className="w-3.5 h-3.5 text-slate-400" />;
  }
};

const getCategoryIcon = (suggestion: QuerySuggestion) => {
  const text = suggestion.text.toLowerCase();
  if (text.includes('growth') || text.includes('cagr')) return <TrendingUp className="w-3.5 h-3.5 text-green-500" />;
  if (text.includes('ratio') || text.includes('return')) return <BarChart3 className="w-3.5 h-3.5 text-blue-500" />;
  if (text.includes('price') || text.includes('market')) return <Target className="w-3.5 h-3.5 text-purple-500" />;
  return getTypeIcon(suggestion.type);
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'field': return 'border-l-blue-400 bg-blue-50/30';
    case 'operator': return 'border-l-purple-400 bg-purple-50/30';
    case 'function': return 'border-l-green-400 bg-green-50/30';
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
          return (
            <button
              key={`${suggestion.text}-${index}`}
              data-index={index}
              className={`w-full px-3 py-2 text-left hover:bg-slate-50 transition-all duration-150 border-l-2 group ${index === selectedIndex
                  ? `${getTypeColor(suggestion.type)} border-l-3 bg-slate-50`
                  : 'border-l-transparent hover:border-l-slate-200'
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
                    <span className="font-medium text-slate-900 truncate text-sm">
                      {suggestion.text}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-md uppercase font-medium shrink-0">
                      {suggestion.type}
                    </span>
                  </div>
                  {suggestion.description && (
                    <div className="text-xs text-slate-500 truncate">
                      {suggestion.description}
                    </div>
                  )}
                </div>

                {/* Keyboard Shortcut */}
                {shortcut && (
                  <div className="shrink-0">
                    <kbd className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-slate-500 bg-slate-100 border border-slate-200 rounded group-hover:bg-white group-hover:text-slate-700 transition-colors">
                      {shortcut}
                    </kbd>
                  </div>
                )}
              </div>
            </button>
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