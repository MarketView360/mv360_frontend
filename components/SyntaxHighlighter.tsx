"use client";

import React from "react";
import { tokenizeQuery } from "@/lib/queryBuilder";

interface SyntaxHighlighterProps {
  code: string;
  className?: string;
}

const getTokenStyle = (type: string) => {
  switch (type) {
    case "field":
      return "text-blue-600 dark:text-blue-400";
    case "field-partial":
      return "text-blue-400 dark:text-blue-300";
    case "operator":
      return "text-purple-600 dark:text-purple-400";
    case "function":
      return "text-green-600 dark:text-green-400";
    case "number":
      return "text-orange-600 dark:text-orange-400";
    case "punctuation":
      return "text-slate-500 dark:text-slate-400";
    case "whitespace":
      return "";
    default:
      return "text-slate-700 dark:text-slate-300";
  }
};

export default function SyntaxHighlighter({
  code,
  className = "",
}: SyntaxHighlighterProps) {
  const tokens = tokenizeQuery(code);

  return (
    <div className={`font-mono ${className}`}>
      {tokens.map((token, index) => (
        <span key={index} className={getTokenStyle(token.type)}>
          {token.text}
        </span>
      ))}
    </div>
  );
}
