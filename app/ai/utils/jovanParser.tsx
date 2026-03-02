"use client";

import React, { ReactNode, useState } from "react";
import { Copy, Edit, Play, ChevronDown, ExternalLink as ExternalLinkIcon } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// External Link Component with confirmation dialog
function ExternalLink({ url, children }: { url: string; children: ReactNode }) {
  const [showConfirm, setShowConfirm] = useState(false);

  // Check if URL is internal (our domains)
  const isInternalUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      const internalDomains = ['marketview360.io', 'www.marketview360.io', 'localhost'];
      return internalDomains.includes(urlObj.hostname);
    } catch {
      return false;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // If internal URL, open directly
    if (isInternalUrl(url)) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    
    // External URL - show confirmation
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    setShowConfirm(false);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <>
      <a
        href={url}
        onClick={handleClick}
        className="text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:text-blue-700 dark:hover:text-blue-300 transition-all hover:decoration-2 cursor-pointer"
      >
        {children}
      </a>
      
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 max-w-md w-full border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                <ExternalLinkIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">External Link</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">This link will take you to a domain outside MarketView360</p>
              </div>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-3 mb-4">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Destination URL:</p>
              <p className="text-sm font-mono text-slate-900 dark:text-slate-100 break-all">{url}</p>
            </div>
            
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded p-3 mb-4">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Important:</strong> Make sure you trust this destination before visiting. Jovan cannot scan external links for safety.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
              >
                Visit Site
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * JovanParser - Comprehensive parser for Jovan AI custom tag syntax
 * 
 * Supports all MarketView360 financial assistant formatting:
 * - Text formatting: {{b}}, {{i}}, {{u}}, {{s}}, {{code}}, {{mark}}, {{link}}, {{pagelink}}
 * - Financial: {{ticker}}, {{formula}}, {{positive}}, {{negative}}, {{neutral}}, {{currency}}, {{percent}}, {{number}}
 * - Structure: {{h2}}, {{h3}}, {{br}}, {{blank}}, {{hr}}
 * - Lists: {{ul}}, {{ol}}, {{li}}, {{dl}}, {{dt}}, {{dd}}
 * - Tables: {{table}}, {{thead}}, {{tbody}}, {{tr}}, {{th}}, {{td}} with align attribute
 * - Callouts: {{callout type="info|warning|tip|success"}}
 * - Code: {{codeblock}}
 * - Query: {{query}} with syntax highlighting and action buttons
 * - Quotes: {{quote}} with optional source attribute
 * - UI: {{button}}, {{kbd}}, {{badge}}
 * - Interactive: {{accordion title="..."}}
 * - Placeholders: {{image}}, {{chart}}
 */

// Check if content has incomplete tags (for streaming)
export function hasIncompleteTags(text: string): { clean: string; pending: string } {
  const lastOpenBrace = text.lastIndexOf("{{");
  const lastCloseBrace = text.lastIndexOf("}}");
  
  if (lastOpenBrace > lastCloseBrace) {
    return {
      clean: text.substring(0, lastOpenBrace),
      pending: text.substring(lastOpenBrace)
    };
  }
  
  return { clean: text, pending: "" };
}

// Query syntax highlighter
function highlightQuerySyntax(query: string): ReactNode {
  const parts: ReactNode[] = [];
  let keyIndex = 0;
  let currentIndex = 0;

  while (currentIndex < query.length) {
    let matched = false;
    
    // Check for keywords first (highest priority)
    const keywordMatch = query.slice(currentIndex).match(/^(AND|OR)\b/);
    if (keywordMatch) {
      parts.push(
        <span key={`token-${keyIndex++}`} className="text-purple-600 dark:text-purple-400 font-bold">
          {keywordMatch[0]}
        </span>
      );
      currentIndex += keywordMatch[0].length;
      matched = true;
      continue;
    }

    // Check for operators
    const operatorMatch = query.slice(currentIndex).match(/^([<>=!]+)/);
    if (operatorMatch) {
      parts.push(
        <span key={`token-${keyIndex++}`} className="text-slate-700 dark:text-slate-300 font-semibold">
          {operatorMatch[0]}
        </span>
      );
      currentIndex += operatorMatch[0].length;
      matched = true;
      continue;
    }

    // Check for metric names (but NOT AND/OR)
    const metricMatch = query.slice(currentIndex).match(/^([A-Z_][A-Z_0-9]*(?:_[A-Z0-9]+)*)\b/);
    if (metricMatch && !['AND', 'OR'].includes(metricMatch[0])) {
      parts.push(
        <span key={`token-${keyIndex++}`} className="text-cyan-600 dark:text-cyan-400 font-semibold">
          {metricMatch[0]}
        </span>
      );
      currentIndex += metricMatch[0].length;
      matched = true;
      continue;
    }

    // Check for numbers
    const numberMatch = query.slice(currentIndex).match(/^(\d+\.?\d*)\b/);
    if (numberMatch) {
      parts.push(
        <span key={`token-${keyIndex++}`} className="text-red-600 dark:text-red-400">
          {numberMatch[0]}
        </span>
      );
      currentIndex += numberMatch[0].length;
      matched = true;
      continue;
    }

    // Add plain text (whitespace, commas, etc.)
    parts.push(
      <span key={`text-${keyIndex++}`}>
        {query[currentIndex]}
      </span>
    );
    currentIndex++;
  }

  return <>{parts}</>;
}

// Query Block Component with action buttons
function QueryBlock({ content }: { content: string }) {
  const router = useRouter();
  const queryText = content.trim();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(queryText);
      toast.success("Query copied to clipboard");
    } catch {
      toast.error("Failed to copy query");
    }
  };

  const handleUseInEditor = () => {
    // Navigate to screener with query parameter
    router.push(`/screener?query=${encodeURIComponent(queryText)}`);
    toast.success("Opening query editor...");
  };

  const handleRunQuery = () => {
    // Navigate to screener and auto-run
    router.push(`/screener?query=${encodeURIComponent(queryText)}&run=true`);
    toast.success("Running query...");
  };

  return (
    <div className="my-4 rounded-lg border border-slate-300 dark:border-slate-700 overflow-hidden">
      <div className="bg-slate-50 dark:bg-slate-900 p-4 font-mono text-sm overflow-x-auto whitespace-pre-wrap">
        {highlightQuerySyntax(queryText)}
      </div>
      <div className="flex flex-col sm:flex-row gap-2 p-3 bg-slate-100 dark:bg-slate-800 border-t border-slate-300 dark:border-slate-700">
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors text-sm font-medium"
        >
          <Copy className="w-4 h-4" />
          Copy Query
        </button>
        <button
          onClick={handleUseInEditor}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors text-sm font-medium"
        >
          <Edit className="w-4 h-4" />
          Use in Editor
        </button>
        <button
          onClick={handleRunQuery}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Play className="w-4 h-4" />
          Run Query
        </button>
      </div>
    </div>
  );
}

// Accordion Component
function AccordionBlock({ title, content }: { title: string; content: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="my-4 border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-semibold text-left"
      >
        <span>{title}</span>
        <ChevronDown
          className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-300 dark:border-slate-700">
          {parseInlineContent(content)}
        </div>
      )}
    </div>
  );
}

// Parse inline content (text with nested formatting tags)
function parseInlineContent(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let remaining = text;
  let keyIndex = 0;

  // Convert Markdown-style **text** to {{b}}text{{/b}}
  remaining = remaining.replace(/\*\*([^*]+)\*\*/g, '{{b}}$1{{/b}}');
  
  // Pattern for inline tags (added date)
  const inlinePattern = /\{\{(b|i|u|s|code|mark|link|pagelink|ticker|formula|positive|negative|neutral|currency|percent|number|date|button|kbd|badge)(?:\s+([^}]*))?\}\}([\s\S]*?)\{\{\/\1\}\}/;
  
  while (remaining.length > 0) {
    const match = remaining.match(inlinePattern);
    
    if (!match) {
      if (remaining) {
        nodes.push(remaining);
      }
      break;
    }

    const beforeText = remaining.substring(0, match.index);
    if (beforeText) {
      nodes.push(beforeText);
    }

    const [fullMatch, tag, attrs, content] = match;
    const key = `inline-${keyIndex++}`;
    const parsedContent = parseInlineContent(content);

    switch (tag) {
      case "b":
        nodes.push(<strong key={key} className="font-semibold text-slate-900 dark:text-slate-100">{parsedContent}</strong>);
        break;
      case "i":
        nodes.push(<em key={key} className="italic">{parsedContent}</em>);
        break;
      case "u":
        nodes.push(<span key={key} className="underline underline-offset-2">{parsedContent}</span>);
        break;
      case "s":
        nodes.push(<span key={key} className="line-through opacity-70">{parsedContent}</span>);
        break;
      case "code":
        nodes.push(
          <code key={key} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-mono text-[0.85em] border border-slate-200 dark:border-slate-700">
            {parsedContent}
          </code>
        );
        break;
      case "mark":
        nodes.push(
          <mark key={key} className="bg-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-100 px-1 py-0.5 rounded">
            {parsedContent}
          </mark>
        );
        break;
      case "ticker":
        nodes.push(
          <span key={key} className="inline-block px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono font-semibold text-[0.95em] border border-blue-200 dark:border-blue-800 tracking-wide">
            {parsedContent}
          </span>
        );
        break;
      case "formula":
        nodes.push(
          <span key={key} className="inline-block px-2.5 py-1 rounded-md bg-sky-50 dark:bg-sky-950/50 text-sky-900 dark:text-sky-200 italic border-l-2 border-blue-500 font-serif tracking-wide">
            {parsedContent}
          </span>
        );
        break;
      case "positive":
        nodes.push(
          <span key={key} className="text-green-600 dark:text-green-400 font-semibold">
            {content.startsWith('+') ? parsedContent : <>+{parsedContent}</>}
          </span>
        );
        break;
      case "negative":
        nodes.push(
          <span key={key} className="text-red-600 dark:text-red-400 font-semibold">
            {parsedContent}
          </span>
        );
        break;
      case "neutral":
        nodes.push(
          <span key={key} className="text-slate-500 dark:text-slate-400 font-medium">
            {parsedContent}
          </span>
        );
        break;
      case "currency":
        nodes.push(
          <span key={key} className="font-medium tabular-nums">
            ${parsedContent}
          </span>
        );
        break;
      case "percent":
        nodes.push(
          <span key={key} className="font-medium tabular-nums">
            {parsedContent}%
          </span>
        );
        break;
      case "number":
        const num = parseFloat(content);
        let formatted = content;
        if (!isNaN(num)) {
          if (num >= 1e9) formatted = `${(num / 1e9).toFixed(2)}B`;
          else if (num >= 1e6) formatted = `${(num / 1e6).toFixed(2)}M`;
          else if (num >= 1e3) formatted = `${(num / 1e3).toFixed(2)}K`;
        }
        nodes.push(
          <span key={key} className="font-medium tabular-nums">
            {formatted}
          </span>
        );
        break;
      case "date":
        // Format dates nicely (assumes YYYY-MM-DD or similar ISO format)
        let dateFormatted = content;
        try {
          const dateObj = new Date(content);
          if (!isNaN(dateObj.getTime())) {
            dateFormatted = dateObj.toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            });
          }
        } catch {
          // Keep original if parsing fails
        }
        nodes.push(
          <span key={key} className="font-medium text-slate-700 dark:text-slate-300">
            {dateFormatted}
          </span>
        );
        break;
      case "link":
        const urlMatch = attrs?.match(/url="([^"]+)"/);
        const url = urlMatch ? urlMatch[1] : "";
        nodes.push(
          <ExternalLink key={key} url={url}>
            {parsedContent} ↗
          </ExternalLink>
        );
        break;
      case "pagelink":
        const pageMatch = attrs?.match(/page="([^"]+)"/);
        const page = pageMatch ? pageMatch[1] : "";
        nodes.push(
          <a 
            key={key} 
            href={`/${page}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            → {parsedContent}
          </a>
        );
        break;
      case "button":
        nodes.push(
          <span key={key} className="inline-flex items-center px-3 py-1 rounded-md bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 font-semibold text-sm">
            {parsedContent}
          </span>
        );
        break;
      case "kbd":
        nodes.push(
          <kbd key={key} className="inline-block px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 shadow-sm font-mono text-sm font-semibold">
            {parsedContent}
          </kbd>
        );
        break;
      case "badge":
        nodes.push(
          <span key={key} className="inline-block px-2 py-0.5 rounded-full bg-blue-600 text-white text-xs font-bold uppercase tracking-wide">
            {parsedContent}
          </span>
        );
        break;
      default:
        nodes.push(parsedContent);
    }

    remaining = remaining.substring((match.index || 0) + fullMatch.length);
  }

  return nodes;
}

// Parse list items
function parseListItems(content: string): ReactNode[] {
  const items: ReactNode[] = [];
  const liPattern = /\{\{li\}\}([\s\S]*?)\{\{\/li\}\}/g;
  let match;
  let index = 0;

  while ((match = liPattern.exec(content)) !== null) {
    // Check for nested lists
    const itemContent = match[1];
    const hasNestedUl = /\{\{ul\}\}/.test(itemContent);
    const hasNestedOl = /\{\{ol\}\}/.test(itemContent);
    
    if (hasNestedUl || hasNestedOl) {
      // Parse nested structure
      const parts = parseBlockContent(itemContent);
      items.push(
        <li key={`li-${index++}`} className="leading-relaxed">
          {parts}
        </li>
      );
    } else {
      items.push(
        <li key={`li-${index++}`} className="leading-relaxed">
          {parseJovanResponse(itemContent, false)}
        </li>
      );
    }
  }

  return items;
}

// Parse definition list items
function parseDefinitionList(content: string): ReactNode {
  const items: ReactNode[] = [];
  let index = 0;
  
  // Match dt/dd pairs
  const dtPattern = /\{\{dt\}\}([\s\S]*?)\{\{\/dt\}\}/g;
  const ddPattern = /\{\{dd\}\}([\s\S]*?)\{\{\/dd\}\}/g;
  
  let dtMatch;
  const dts: Array<{ content: string; index: number }> = [];
  while ((dtMatch = dtPattern.exec(content)) !== null) {
    dts.push({ content: dtMatch[1], index: dtMatch.index });
  }
  
  let ddMatch;
  const dds: Array<{ content: string; index: number }> = [];
  while ((ddMatch = ddPattern.exec(content)) !== null) {
    dds.push({ content: ddMatch[1], index: ddMatch.index });
  }
  
  // Pair them up
  for (let i = 0; i < Math.min(dts.length, dds.length); i++) {
    items.push(
      <div key={`dl-item-${index++}`} className="mt-3 first:mt-0">
        <dt className="font-bold text-slate-900 dark:text-slate-100">
          {parseInlineContent(dts[i].content)}
        </dt>
        <dd className="ml-6 mt-1 text-slate-700 dark:text-slate-300">
          {parseInlineContent(dds[i].content)}
        </dd>
      </div>
    );
  }
  
  return <dl className="my-4">{items}</dl>;
}

// Parse table rows
function parseTableRows(content: string, isHeader: boolean): ReactNode[] {
  const rows: ReactNode[] = [];
  const trPattern = /\{\{tr\}\}([\s\S]*?)\{\{\/tr\}\}/g;
  let trMatch;
  let rowIndex = 0;

  while ((trMatch = trPattern.exec(content)) !== null) {
    const cells: ReactNode[] = [];
    const cellTag = isHeader ? "th" : "td";
    const cellPattern = new RegExp(`\\{\\{${cellTag}(?:\\s+([^}]*))?\\}\\}([\\s\\S]*?)\\{\\{\\/${cellTag}\\}\\}`, "g");
    let cellMatch;
    let cellIndex = 0;

    while ((cellMatch = cellPattern.exec(trMatch[1])) !== null) {
      const attrs = cellMatch[1] || "";
      const cellContent = cellMatch[2];
      const alignMatch = attrs.match(/align="([^"]+)"/);
      const align = alignMatch ? alignMatch[1] : "left";
      
      const alignClass = 
        align === "center" ? "text-center" :
        align === "right" ? "text-right" :
        "text-left";

      if (isHeader) {
        cells.push(
          <th 
            key={`th-${cellIndex++}`} 
            className={`p-2.5 font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 ${alignClass}`}
          >
            {parseInlineContent(cellContent)}
          </th>
        );
      } else {
        cells.push(
          <td 
            key={`td-${cellIndex++}`} 
            className={`p-2.5 border border-slate-200 dark:border-slate-700 ${alignClass}`}
          >
            {parseInlineContent(cellContent)}
          </td>
        );
      }
    }

    rows.push(
      <tr key={`tr-${rowIndex++}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
        {cells}
      </tr>
    );
  }

  return rows;
}

// Parse a table
function parseTable(content: string): ReactNode {
  let thead: ReactNode = null;
  let tbody: ReactNode = null;

  const theadMatch = content.match(/\{\{thead\}\}([\s\S]*?)\{\{\/thead\}\}/);
  if (theadMatch) {
    thead = (
      <thead className="bg-slate-50 dark:bg-slate-800/50">
        {parseTableRows(theadMatch[1], true)}
      </thead>
    );
  }

  const tbodyMatch = content.match(/\{\{tbody\}\}([\s\S]*?)\{\{\/tbody\}\}/);
  if (tbodyMatch) {
    tbody = (
      <tbody>
        {parseTableRows(tbodyMatch[1], false)}
      </tbody>
    );
  }

  return (
    <div className="overflow-x-auto my-4 rounded-lg shadow-sm">
      <table className="w-full border-collapse text-sm bg-white dark:bg-slate-900">
        {thead}
        {tbody}
      </table>
    </div>
  );
}

// Parse callout boxes
function parseCallout(content: string, type: string): ReactNode {
  const icons = {
    info: "ℹ️",
    warning: "⚠️",
    tip: "💡",
    success: "✓"
  };

  const styles = {
    info: "bg-blue-50 dark:bg-blue-950/30 border-l-blue-500 dark:border-l-blue-400",
    warning: "bg-yellow-50 dark:bg-yellow-950/30 border-l-yellow-500 dark:border-l-yellow-400",
    tip: "bg-green-50 dark:bg-green-950/30 border-l-green-500 dark:border-l-green-400",
    success: "bg-green-50 dark:bg-green-950/30 border-l-green-500 dark:border-l-green-400"
  };

  const icon = icons[type as keyof typeof icons] || icons.info;
  const style = styles[type as keyof typeof styles] || styles.info;

  return (
    <div className={`flex gap-3 p-4 my-4 rounded-lg border-l-4 ${style}`}>
      <div className="text-xl flex-shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1 leading-relaxed">
        {parseJovanResponse(content, false)}
      </div>
    </div>
  );
}

// Parse quote blocks
function parseQuote(content: string, source?: string): ReactNode {
  return (
    <blockquote className="my-4 pl-4 border-l-4 border-blue-500 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-r-lg pr-4">
      <div className="italic text-slate-700 dark:text-slate-300 leading-relaxed">
        {parseInlineContent(content)}
      </div>
      {source && (
        <div className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
          — {source}
        </div>
      )}
    </blockquote>
  );
}

// Helper to parse block content (for nested structures)
function parseBlockContent(text: string): ReactNode[] {
  const elements: ReactNode[] = [];
  let remaining = text;
  let keyIndex = 0;

  const blockPatterns = [
    { pattern: /\{\{ul\}\}([\s\S]*?)\{\{\/ul\}\}/, type: "ul" },
    { pattern: /\{\{ol\}\}([\s\S]*?)\{\{\/ol\}\}/, type: "ol" },
  ];

  while (remaining.length > 0) {
    let earliestMatch: { match: RegExpMatchArray; type: string } | null = null;
    let earliestIndex = Infinity;

    for (const { pattern, type } of blockPatterns) {
      const match = remaining.match(pattern);
      if (match && match.index !== undefined && match.index < earliestIndex) {
        earliestIndex = match.index;
        earliestMatch = { match, type };
      }
    }

    if (!earliestMatch) {
      if (remaining.trim()) {
        elements.push(
          <span key={`text-${keyIndex++}`}>
            {parseInlineContent(remaining)}
          </span>
        );
      }
      break;
    }

    const beforeText = remaining.substring(0, earliestMatch.match.index);
    if (beforeText.trim()) {
      elements.push(
        <span key={`text-${keyIndex++}`}>
          {parseInlineContent(beforeText)}
        </span>
      );
    }

    const { match, type } = earliestMatch;
    const key = `nested-${keyIndex++}`;

    if (type === "ul") {
      elements.push(
        <ul key={key} className="list-disc pl-5 my-2 space-y-1">
          {parseListItems(match[1])}
        </ul>
      );
    } else if (type === "ol") {
      elements.push(
        <ol key={key} className="list-decimal pl-5 my-2 space-y-1">
          {parseListItems(match[1])}
        </ol>
      );
    }

    remaining = remaining.substring((match.index || 0) + match[0].length);
  }

  return elements;
}

// Preprocess text to move {{br}} tags before {{query}} to after {{query}}
function preprocessBrTags(text: string): string {
  // Match any {{br}} followed by {{query}}...{{/query}}
  return text.replace(/\{\{br\}\}\s*\{\{query\}\}([\s\S]*?)\{\{\/query\}\}/g, '{{query}}$1{{/query}}{{br}}');
}

// Main parse function
export function parseJovanResponse(text: string, isStreaming: boolean = false): ReactNode {
  if (!text) return null;

  let textToParse = text;
  if (isStreaming) {
    const { clean } = hasIncompleteTags(text);
    textToParse = clean;
  }

  // Fix triple braces to double braces (AI sometimes outputs {{{tag}}} instead of {{tag}})
  textToParse = textToParse.replace(/\{\{\{/g, '{{').replace(/\}\}\}/g, '}}');

  // Preprocess to move {{br}} tags before {{query}} to after {{query}}
  textToParse = preprocessBrTags(textToParse);

  const elements: ReactNode[] = [];
  let remaining = textToParse;
  let keyIndex = 0;

  // Block-level patterns
  const blockPatterns = [
    { pattern: /\{\{h2\}\}([\s\S]*?)\{\{\/h2\}\}/, type: "h2" },
    { pattern: /\{\{h3\}\}([\s\S]*?)\{\{\/h3\}\}/, type: "h3" },
    { pattern: /\{\{codeblock\}\}([\s\S]*?)\{\{\/codeblock\}\}/, type: "codeblock" },
    { pattern: /\{\{query\}\}([\s\S]*?)\{\{\/query\}\}/, type: "query" },
    { pattern: /\{\{callout(?:\s+type="([^"]+)")?\}\}([\s\S]*?)\{\{\/callout\}\}/, type: "callout" },
    { pattern: /\{\{quote(?:\s+source="([^"]+)")?\}\}([\s\S]*?)\{\{\/quote\}\}/, type: "quote" },
    { pattern: /\{\{accordion(?:\s+title="([^"]+)")?\}\}([\s\S]*?)\{\{\/accordion\}\}/, type: "accordion" },
    { pattern: /\{\{ul\}\}([\s\S]*?)\{\{\/ul\}\}/, type: "ul" },
    { pattern: /\{\{ol\}\}([\s\S]*?)\{\{\/ol\}\}/, type: "ol" },
    { pattern: /\{\{dl\}\}([\s\S]*?)\{\{\/dl\}\}/, type: "dl" },
    { pattern: /\{\{table\}\}([\s\S]*?)\{\{\/table\}\}/, type: "table" },
    { pattern: /\{\{blank\}\}/, type: "blank" },
    { pattern: /\{\{br\}\}/, type: "br" },
    { pattern: /\{\{hr\}\}/, type: "hr" },
    { pattern: /\{\{image(?:\s+([^}]*))?\}\}/, type: "image" },
    { pattern: /\{\{chart(?:\s+([^}]*))?\}\}/, type: "chart" },
  ];

  while (remaining.length > 0) {
    let earliestMatch: { match: RegExpMatchArray; type: string } | null = null;
    let earliestIndex = Infinity;

    for (const { pattern, type } of blockPatterns) {
      const match = remaining.match(pattern);
      if (match && match.index !== undefined && match.index < earliestIndex) {
        earliestIndex = match.index;
        earliestMatch = { match, type };
      }
    }

    if (!earliestMatch) {
      if (remaining.trim()) {
        elements.push(
          <p key={`p-${keyIndex++}`} className="leading-relaxed mb-3">
            {parseInlineContent(remaining)}
          </p>
        );
      }
      break;
    }

    const beforeText = remaining.substring(0, earliestMatch.match.index);
    if (beforeText.trim()) {
      elements.push(
        <p key={`p-${keyIndex++}`} className="leading-relaxed mb-3">
          {parseInlineContent(beforeText)}
        </p>
      );
    }

    const { match, type } = earliestMatch;
    const key = `block-${keyIndex++}`;

    switch (type) {
      case "h2":
        elements.push(
          <h2 key={key} className="text-xl font-bold mt-6 mb-3 text-slate-900 dark:text-slate-100 border-b-2 border-slate-200 dark:border-slate-700 pb-2">
            {parseInlineContent(match[1])}
          </h2>
        );
        break;
      case "h3":
        elements.push(
          <h3 key={key} className="text-lg font-semibold mt-4 mb-2 text-slate-900 dark:text-slate-100">
            {parseInlineContent(match[1])}
          </h3>
        );
        break;
      case "codeblock":
        elements.push(
          <pre key={key} className="my-3 p-4 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-x-auto border border-slate-200 dark:border-slate-700">
            <code className="text-sm font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
              {match[1].trim()}
            </code>
          </pre>
        );
        break;
      case "query":
        elements.push(<QueryBlock key={key} content={match[1]} />);
        break;
      case "callout":
        const calloutType = match[1] || "info";
        elements.push(<React.Fragment key={key}>{parseCallout(match[2], calloutType)}</React.Fragment>);
        break;
      case "quote":
        const quoteSource = match[1];
        elements.push(<React.Fragment key={key}>{parseQuote(match[2], quoteSource)}</React.Fragment>);
        break;
      case "accordion":
        const accordionTitle = match[1] || "Click to expand";
        elements.push(<AccordionBlock key={key} title={accordionTitle} content={match[2]} />);
        break;
      case "ul":
        elements.push(
          <ul key={key} className="list-disc pl-6 my-3 space-y-2">
            {parseListItems(match[1])}
          </ul>
        );
        break;
      case "ol":
        elements.push(
          <ol key={key} className="list-decimal pl-6 my-3 space-y-2">
            {parseListItems(match[1])}
          </ol>
        );
        break;
      case "dl":
        elements.push(<React.Fragment key={key}>{parseDefinitionList(match[1])}</React.Fragment>);
        break;
      case "table":
        elements.push(<React.Fragment key={key}>{parseTable(match[1])}</React.Fragment>);
        break;
      case "blank":
        elements.push(<div key={key} className="h-4" />);
        break;
      case "br":
        elements.push(<br key={key} />);
        elements.push(<span key={`${key}-space`}>&nbsp;</span>);
        break;
      case "hr":
        elements.push(<hr key={key} className="my-6 border-slate-300 dark:border-slate-700" />);
        break;
      case "image":
        const imgAttrs = match[1] || "";
        const srcMatch = imgAttrs.match(/src="([^"]+)"/);
        const altMatch = imgAttrs.match(/alt="([^"]+)"/);
        elements.push(
          <div key={key} className="my-4 p-4 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-center text-slate-500 dark:text-slate-400">
            📊 Image placeholder: {altMatch ? altMatch[1] : srcMatch ? srcMatch[1] : "Chart"}
          </div>
        );
        break;
      case "chart":
        const chartAttrs = match[1] || "";
        const typeMatch = chartAttrs.match(/type="([^"]+)"/);
        elements.push(
          <div key={key} className="my-4 p-4 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-center text-slate-500 dark:text-slate-400">
            📈 Chart placeholder: {typeMatch ? typeMatch[1] : "Chart"}
          </div>
        );
        break;
    }

    remaining = remaining.substring((match.index || 0) + match[0].length);
  }

  if (isStreaming) {
    const { pending } = hasIncompleteTags(text);
    if (pending) {
      elements.push(
        <span key="pending" className="text-slate-400">
          {pending}
        </span>
      );
    }
  }

  return <>{elements}</>;
}

// Component wrapper
interface JovanResponseProps {
  content: string;
  isStreaming?: boolean;
}

export function JovanResponse({ content, isStreaming = false }: JovanResponseProps) {
  return (
    <div className="jovan-response text-[15px] leading-relaxed">
      {parseJovanResponse(content, isStreaming)}
      {isStreaming && (
        <span className="inline-block w-2 h-4 ml-0.5 bg-indigo-500 animate-pulse rounded-sm align-middle" />
      )}
    </div>
  );
}

// Strip custom tags for clipboard copy
export function stripJovanTags(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\{\{(br|blank|hr|image|chart)\}\}/g, "\n")
    .replace(/\{\{(b|i|u|s|code|mark|h2|h3|li|th|td|dt|dd|ticker|formula|positive|negative|neutral|currency|percent|number|button|kbd|badge)\}\}([\s\S]*?)\{\{\/\1\}\}/g, "$2")
    .replace(/\{\{link[^}]*\}\}([\s\S]*?)\{\{\/link\}\}/g, "$1")
    .replace(/\{\{pagelink[^}]*\}\}([\s\S]*?)\{\{\/pagelink\}\}/g, "$1")
    .replace(/\{\{callout[^}]*\}\}([\s\S]*?)\{\{\/callout\}\}/g, "$1")
    .replace(/\{\{quote[^}]*\}\}([\s\S]*?)\{\{\/quote\}\}/g, "$1")
    .replace(/\{\{accordion[^}]*\}\}([\s\S]*?)\{\{\/accordion\}\}/g, "$1")
    .replace(/\{\{query\}\}([\s\S]*?)\{\{\/query\}\}/g, "$1")
    .replace(/\{\{(ul|ol|dl|table|thead|tbody|tr|codeblock)\}\}/g, "")
    .replace(/\{\{\/(?:ul|ol|dl|table|thead|tbody|tr|codeblock)\}\}/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
