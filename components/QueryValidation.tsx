"use client";

import React, { useState } from 'react';
import { QueryValidationError } from '@/lib/queryBuilder';
import { AlertCircle, AlertTriangle, Info, ChevronDown, ChevronRight } from 'lucide-react';

interface QueryValidationProps {
  errors: QueryValidationError[];
  onJumpToLine?: (line: number, column?: number) => void;
}

const getErrorIcon = (severity: string) => {
  switch (severity) {
    case 'error':
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    case 'warning':
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    case 'info':
      return <Info className="w-4 h-4 text-blue-500" />;
    default:
      return <Info className="w-4 h-4 text-slate-400" />;
  }
};

const getErrorStyle = (severity: string) => {
  switch (severity) {
    case 'error':
      return 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200';
    case 'warning':
      return 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';
    case 'info':
      return 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200';
    default:
      return 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200';
  }
};

const getSectionStyle = (severity: string) => {
  switch (severity) {
    case 'error':
      return 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20';
    case 'warning':
      return 'border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-900/20';
    case 'info':
      return 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20';
    default:
      return 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50';
  }
};

export default function QueryValidation({ errors, onJumpToLine }: QueryValidationProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    error: false,
    warning: false,
    info: false
  });

  if (errors.length === 0) return null;

  // Group errors by severity
  const groupedErrors = errors.reduce((acc, error) => {
    if (!acc[error.severity]) {
      acc[error.severity] = [];
    }
    acc[error.severity].push(error);
    return acc;
  }, {} as Record<string, QueryValidationError[]>);

  const toggleSection = (severity: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [severity]: !prev[severity]
    }));
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'error': return 'Errors';
      case 'warning': return 'Warnings';
      case 'info': return 'Information';
      default: return severity;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'text-red-700 dark:text-red-300';
      case 'warning': return 'text-yellow-700 dark:text-yellow-300';
      case 'info': return 'text-blue-700 dark:text-blue-300';
      default: return 'text-slate-700 dark:text-slate-300';
    }
  };

  return (
    <div className="space-y-3">
      {Object.entries(groupedErrors).map(([severity, severityErrors]) => (
        <div key={severity} className={`rounded-lg border ${getSectionStyle(severity)}`}>
          {/* Section Header */}
          <button
            onClick={() => toggleSection(severity)}
            className="w-full flex items-center justify-between p-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors rounded-t-lg"
          >
            <div className="flex items-center gap-2">
              {getErrorIcon(severity)}
              <span className={`font-medium text-sm ${getSeverityColor(severity)}`}>
                {getSeverityLabel(severity)} ({severityErrors.length})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Click to {expandedSections[severity] ? 'collapse' : 'expand'}
              </span>
              {expandedSections[severity] ? (
                <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              )}
            </div>
          </button>

          {/* Section Content */}
          {expandedSections[severity] && (
            <div className="border-t border-current/20 p-3 space-y-2">
              {severityErrors.map((error, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-md border ${getErrorStyle(error.severity)} relative group`}
                >
                  <div className="mt-0.5">
                    {getErrorIcon(error.severity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        Line {error.line}, Column {error.column}
                      </span>
                      {onJumpToLine && (
                        <button
                          onClick={() => onJumpToLine(error.line, error.column)}
                          className="text-xs px-2 py-1 rounded bg-white/50 dark:bg-black/30 hover:bg-white/80 dark:hover:bg-black/50 transition-colors border border-current/20 hover:shadow-sm"
                          title="Jump to this location in the editor"
                        >
                          Go to line
                        </button>
                      )}
                    </div>
                    <div className="text-sm leading-relaxed">
                      {error.message}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      
      {/* Summary */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
        <span>
          Total: {errors.length} issue{errors.length !== 1 ? 's' : ''} found
        </span>
        <span>
          Press Ctrl+. for quick fixes
        </span>
      </div>
    </div>
  );
} 