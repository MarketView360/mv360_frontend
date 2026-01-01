"use client";

import React, { ReactNode } from "react";

/**
 * JovanParser - Converts custom {{tag}} syntax to React components
 * 
 * Supports:
 * - Text: {{b}}, {{i}}, {{u}}, {{code}}, {{link url="..."}}
 * - Structure: {{h2}}, {{h3}}, {{br}}, {{blank}}, {{hr}}
 * - Lists: {{ul}}, {{ol}}, {{li}}
 * - Tables: {{table}}, {{thead}}, {{tbody}}, {{tr}}, {{th}}, {{td}}
 * - Code blocks: {{codeblock}}
 */

// Note: ParsedNode interface reserved for future AST-based parsing if needed

// Check if content has incomplete tags (for streaming)
export function hasIncompleteTags(text: string): { clean: string; pending: string } {
  // Find the last {{ that doesn't have a matching }}
  const lastOpenBrace = text.lastIndexOf("{{");
  const lastCloseBrace = text.lastIndexOf("}}");
  
  if (lastOpenBrace > lastCloseBrace) {
    // There's an unclosed tag, split at the last {{
    return {
      clean: text.substring(0, lastOpenBrace),
      pending: text.substring(lastOpenBrace)
    };
  }
  
  return { clean: text, pending: "" };
}

// Parse inline content (text with nested formatting tags)
function parseInlineContent(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let remaining = text;
  let keyIndex = 0;

  // First, convert Markdown-style **text** to {{b}}text{{/b}}
  remaining = remaining.replace(/\*\*([^*]+)\*\*/g, '{{b}}$1{{/b}}');
  
  // Pattern for inline tags: {{tag}}content{{/tag}} or {{tag attr="val"}}content{{/tag}}
  const inlinePattern = /\{\{(b|i|u|code|link)(?:\s+([^}]*))?\}\}([\s\S]*?)\{\{\/\1\}\}/;
  
  while (remaining.length > 0) {
    const match = remaining.match(inlinePattern);
    
    if (!match) {
      // No more tags, push remaining text
      if (remaining) {
        nodes.push(remaining);
      }
      break;
    }

    // Push text before the match
    const beforeText = remaining.substring(0, match.index);
    if (beforeText) {
      nodes.push(beforeText);
    }

    const [fullMatch, tag, attrs, content] = match;
    const key = `inline-${keyIndex++}`;

    // Parse the content recursively for nested tags
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
      case "code":
        nodes.push(
          <code key={key} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-mono text-[0.85em]">
            {parsedContent}
          </code>
        );
        break;
      case "link":
        // Extract URL from attrs
        const urlMatch = attrs?.match(/url="([^"]+)"/);
        const url = urlMatch ? urlMatch[1] : "#";
        nodes.push(
          <a 
            key={key} 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-indigo-600 dark:text-indigo-400 underline underline-offset-2 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
            {parsedContent}
          </a>
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
    items.push(
      <li key={`li-${index++}`} className="leading-relaxed">
        {parseInlineContent(match[1])}
      </li>
    );
  }

  return items;
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
    const cellPattern = new RegExp(`\\{\\{${cellTag}\\}\\}([\\s\\S]*?)\\{\\{\\/${cellTag}\\}\\}`, "g");
    let cellMatch;
    let cellIndex = 0;

    while ((cellMatch = cellPattern.exec(trMatch[1])) !== null) {
      if (isHeader) {
        cells.push(
          <th 
            key={`th-${cellIndex++}`} 
            className="text-left p-2.5 font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
          >
            {parseInlineContent(cellMatch[1])}
          </th>
        );
      } else {
        cells.push(
          <td 
            key={`td-${cellIndex++}`} 
            className="p-2.5 border border-slate-200 dark:border-slate-700"
          >
            {parseInlineContent(cellMatch[1])}
          </td>
        );
      }
    }

    rows.push(
      <tr key={`tr-${rowIndex++}`} className="border-b border-slate-200 dark:border-slate-700">
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

  // Extract thead
  const theadMatch = content.match(/\{\{thead\}\}([\s\S]*?)\{\{\/thead\}\}/);
  if (theadMatch) {
    thead = (
      <thead className="bg-slate-50 dark:bg-slate-800/50">
        {parseTableRows(theadMatch[1], true)}
      </thead>
    );
  }

  // Extract tbody
  const tbodyMatch = content.match(/\{\{tbody\}\}([\s\S]*?)\{\{\/tbody\}\}/);
  if (tbodyMatch) {
    tbody = (
      <tbody>
        {parseTableRows(tbodyMatch[1], false)}
      </tbody>
    );
  }

  return (
    <div className="overflow-x-auto my-4">
      <table className="w-full border-collapse text-sm">
        {thead}
        {tbody}
      </table>
    </div>
  );
}

// Main parse function
export function parseJovanResponse(text: string, isStreaming: boolean = false): ReactNode {
  if (!text) return null;

  // Handle streaming - don't parse incomplete tags
  let textToParse = text;
  if (isStreaming) {
    const { clean } = hasIncompleteTags(text);
    textToParse = clean;
  }

  const elements: ReactNode[] = [];
  let remaining = textToParse;
  let keyIndex = 0;

  // Block-level patterns
  const blockPatterns = [
    { pattern: /\{\{h2\}\}([\s\S]*?)\{\{\/h2\}\}/, type: "h2" },
    { pattern: /\{\{h3\}\}([\s\S]*?)\{\{\/h3\}\}/, type: "h3" },
    { pattern: /\{\{codeblock\}\}([\s\S]*?)\{\{\/codeblock\}\}/, type: "codeblock" },
    { pattern: /\{\{ul\}\}([\s\S]*?)\{\{\/ul\}\}/, type: "ul" },
    { pattern: /\{\{ol\}\}([\s\S]*?)\{\{\/ol\}\}/, type: "ol" },
    { pattern: /\{\{table\}\}([\s\S]*?)\{\{\/table\}\}/, type: "table" },
    { pattern: /\{\{blank\}\}/, type: "blank" },
    { pattern: /\{\{br\}\}/, type: "br" },
    { pattern: /\{\{hr\}\}/, type: "hr" },
  ];

  while (remaining.length > 0) {
    // Find the earliest matching block pattern
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
      // No more block patterns, parse remaining as inline content
      if (remaining.trim()) {
        elements.push(
          <p key={`p-${keyIndex++}`} className="leading-relaxed">
            {parseInlineContent(remaining)}
          </p>
        );
      }
      break;
    }

    // Push text before the block as a paragraph
    const beforeText = remaining.substring(0, earliestMatch.match.index);
    if (beforeText.trim()) {
      elements.push(
        <p key={`p-${keyIndex++}`} className="leading-relaxed">
          {parseInlineContent(beforeText)}
        </p>
      );
    }

    const { match, type } = earliestMatch;
    const key = `block-${keyIndex++}`;

    switch (type) {
      case "h2":
        elements.push(
          <h2 key={key} className="text-lg font-semibold mt-5 mb-2 text-slate-900 dark:text-slate-100">
            {parseInlineContent(match[1])}
          </h2>
        );
        break;
      case "h3":
        elements.push(
          <h3 key={key} className="text-base font-semibold mt-4 mb-2 text-slate-900 dark:text-slate-100">
            {parseInlineContent(match[1])}
          </h3>
        );
        break;
      case "codeblock":
        elements.push(
          <pre key={key} className="my-3 p-3 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-x-auto">
            <code className="text-sm font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
              {match[1].trim()}
            </code>
          </pre>
        );
        break;
      case "ul":
        elements.push(
          <ul key={key} className="list-disc pl-5 my-3 space-y-1.5">
            {parseListItems(match[1])}
          </ul>
        );
        break;
      case "ol":
        elements.push(
          <ol key={key} className="list-decimal pl-5 my-3 space-y-1.5">
            {parseListItems(match[1])}
          </ol>
        );
        break;
      case "table":
        elements.push(<React.Fragment key={key}>{parseTable(match[1])}</React.Fragment>);
        break;
      case "blank":
        elements.push(<div key={key} className="h-3" />);
        break;
      case "br":
        elements.push(<br key={key} />);
        break;
      case "hr":
        elements.push(<hr key={key} className="my-4 border-slate-200 dark:border-slate-700" />);
        break;
    }

    remaining = remaining.substring((match.index || 0) + match[0].length);
  }

  // If streaming and we have pending content, show cursor
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

// Component wrapper for easy use
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

// Strip custom tags for clipboard copy (plain text)
export function stripJovanTags(text: string): string {
  return text
    // First convert Markdown-style bold to plain text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    // Remove self-closing tags
    .replace(/\{\{(br|blank|hr)\}\}/g, "\n")
    // Remove paired tags but keep content
    .replace(/\{\{(b|i|u|code|h2|h3|li|th|td)\}\}([\s\S]*?)\{\{\/\1\}\}/g, "$2")
    // Remove link tags but keep text
    .replace(/\{\{link[^}]*\}\}([\s\S]*?)\{\{\/link\}\}/g, "$1")
    // Remove list/table structure tags
    .replace(/\{\{(ul|ol|table|thead|tbody|tr|codeblock)\}\}/g, "")
    .replace(/\{\{\/(?:ul|ol|table|thead|tbody|tr|codeblock)\}\}/g, "")
    // Clean up extra whitespace
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
