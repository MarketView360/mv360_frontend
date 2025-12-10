/**
 * E1: Normalize AI output before rendering with ReactMarkdown
 *
 * This utility:
 * - Converts <br> and <br/> tags to newlines
 * - Strips or escapes remaining HTML tags
 * - Ensures markdown tables render properly
 */

/**
 * Convert HTML line breaks to newlines
 */
function convertBrToNewlines(text: string): string {
  return text.replace(/<br\s*\/?>/gi, '\n');
}

/**
 * Strip HTML tags that shouldn't appear in markdown
 * Keeps content inside tags but removes the tags themselves
 */
function stripHtmlTags(text: string): string {
  // Common HTML tags that might leak through
  const tagsToStrip = [
    'div', 'span', 'p', 'b', 'i', 'u', 'strong', 'em',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'a', 'img', 'br', 'hr',
  ];

  let result = text;

  // Remove opening and closing tags but keep content
  for (const tag of tagsToStrip) {
    // Opening tags with attributes: <tag ...>
    result = result.replace(new RegExp(`<${tag}[^>]*>`, 'gi'), '');
    // Closing tags: </tag>
    result = result.replace(new RegExp(`</${tag}>`, 'gi'), '');
  }

  // Remove self-closing tags: <tag />
  result = result.replace(/<[a-z][a-z0-9]*\s*\/>/gi, '');

  return result;
}

/**
 * Escape any remaining angle brackets that look like HTML
 * but aren't valid markdown
 */
function escapeRemainingHtml(text: string): string {
  // Match anything that looks like an HTML tag but wasn't stripped
  return text.replace(/<([^>]+)>/g, (match, content) => {
    // If it looks like a valid HTML tag, escape it
    if (/^[a-z][a-z0-9]*(\s|$)/i.test(content)) {
      return `\\<${content}\\>`;
    }
    // Otherwise keep it (might be math like <x, y>)
    return match;
  });
}

/**
 * Clean up excessive whitespace while preserving intentional formatting
 */
function normalizeWhitespace(text: string): string {
  // Replace 3+ consecutive newlines with 2
  let result = text.replace(/\n{3,}/g, '\n\n');

  // Trim trailing whitespace from each line
  result = result
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n');

  return result.trim();
}

/**
 * Main normalizer function
 * Call this before passing AI output to ReactMarkdown
 */
export function normalizeAiOutput(text: string): string {
  if (!text) return '';

  let result = text;

  // Step 1: Convert <br> to newlines
  result = convertBrToNewlines(result);

  // Step 2: Strip HTML tags
  result = stripHtmlTags(result);

  // Step 3: Escape any remaining HTML-like content
  result = escapeRemainingHtml(result);

  // Step 4: Normalize whitespace
  result = normalizeWhitespace(result);

  return result;
}

/**
 * Check if text contains LaTeX-like content
 * Useful for deciding whether to render with math support
 */
export function containsLatex(text: string): boolean {
  // Common LaTeX patterns
  const latexPatterns = [
    /\$\$[\s\S]+?\$\$/, // Display math: $$...$$
    /\$[^$]+\$/, // Inline math: $...$
    /\\frac\{/, // Fractions
    /\\sqrt\{/, // Square roots
    /\\sum/, // Summation
    /\\int/, // Integrals
    /\\begin\{/, // Environments
    /\^{[^}]+}/, // Superscripts with braces
    /_{[^}]+}/, // Subscripts with braces
  ];

  return latexPatterns.some((pattern) => pattern.test(text));
}

export default normalizeAiOutput;
