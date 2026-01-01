# Jovan Parser - Complete Implementation Guide

## Overview
The comprehensive Jovan parser (`jovanParser.tsx`) now supports **all** tag types specified in the AI system prompt, providing rich formatting for financial assistant responses with full light/dark theme support.

## ✅ Implemented Tags

### Text Formatting
- `{{b}}text{{/b}}` - **Bold text**
- `{{i}}text{{/i}}` - *Italic text*
- `{{u}}text{{/u}}` - Underlined text
- `{{s}}text{{/s}}` - ~~Strikethrough text~~
- `{{code}}text{{/code}}` - Inline code/monospace (metrics, formulas, ratios)
- `{{mark}}text{{/mark}}` - Highlighted/marked text (yellow highlight)
- `**text**` - Markdown-style bold (auto-converted to {{b}})

### Links
- `{{link url="https://example.com"}}link text{{/link}}` - External hyperlinks with ↗ icon
- `{{pagelink page="screener"}}Screener page{{/pagelink}}` - Internal app navigation with → icon

### Financial & Numeric
- `{{ticker}}AAPL{{/ticker}}` - Stock ticker symbols (blue badge styling)
- `{{formula}}P/E = Price ÷ EPS{{/formula}}` - Mathematical formulas (serif font, sky blue bg)
- `{{positive}}+5.2%{{/positive}}` - Positive numbers (green, auto-adds + if missing)
- `{{negative}}-3.1%{{/negative}}` - Negative numbers (red)
- `{{neutral}}0.0%{{/neutral}}` - Neutral numbers (gray)
- `{{currency}}150.50{{/currency}}` - Currency values (renders with $ prefix)
- `{{percent}}25.5{{/percent}}` - Percentage values (renders with % suffix)
- `{{number}}1250000{{/number}}` - Large numbers (auto-formats: 1.25M, 1.25B, 1.25K)

### Structure
- `{{h2}}Heading Text{{/h2}}` - Major section heading (H2, with bottom border)
- `{{h3}}Subheading Text{{/h3}}` - Subsection heading (H3)
- `{{br}}` - Single line break
- `{{blank}}` - Full blank line (16px vertical spacing)
- `{{hr}}` - Horizontal rule/divider line

### Callout/Alert Boxes
```
{{callout type="info|warning|tip|success"}}
Content here that needs emphasis
{{/callout}}
```
**Types:**
- `info` - Blue/cyan theme with ℹ️ icon
- `warning` - Yellow/orange theme with ⚠️ icon
- `tip` - Green theme with 💡 icon
- `success` - Green with ✓ icon

### Lists

**Unordered Lists:**
```
{{ul}}
{{li}}First item{{/li}}
{{li}}Second item{{/li}}
{{/ul}}
```

**Ordered Lists:**
```
{{ol}}
{{li}}First step{{/li}}
{{li}}Second step{{/li}}
{{/ol}}
```

**Nested Lists (max 2 levels):**
```
{{ul}}
{{li}}Parent item
{{ul}}
{{li}}Nested child item{{/li}}
{{/ul}}
{{/li}}
{{/ul}}
```

**Definition Lists:**
```
{{dl}}
{{dt}}Term{{/dt}}
{{dd}}Definition of the term{{/dd}}
{{/dl}}
```

### Tables
```
{{table}}
{{thead}}
{{tr}}
{{th align="left"}}Header 1{{/th}}
{{th align="center"}}Header 2{{/th}}
{{th align="right"}}Header 3{{/th}}
{{/tr}}
{{/thead}}
{{tbody}}
{{tr}}
{{td align="left"}}Cell 1{{/td}}
{{td align="center"}}Cell 2{{/td}}
{{td align="right"}}Cell 3{{/td}}
{{/tr}}
{{/tbody}}
{{/table}}
```
**Alignment options:** left (default), center, right

### Code Blocks
```
{{codeblock}}
Multi-line code or calculation
Line 2
Line 3
{{/codeblock}}
```

### Query Snippets (CRITICAL FEATURE)
```
{{query}}
P/E < 15 AND Market_Cap > 1000000000 AND Dividend_Yield > 0.03
{{/query}}
```

**Renders with:**
1. **Syntax-highlighted query display** with color-coded:
   - Keywords (AND, OR): Purple/bold
   - Operators (<, >, =): Dark text/bold
   - Metric names: Cyan/bold
   - Values: Red
2. **Three action buttons:**
   - **Copy Query** - Copies to clipboard
   - **Use in Query Editor** - Opens `/screener?query=...`
   - **Run Query** - Opens `/screener?query=...&run=true`

### Quote Blocks
```
{{quote}}
Quote text here
{{/quote}}

{{quote source="Warren Buffett"}}
Quote text with attribution
{{/quote}}
```

### UI Element Tags
- `{{button}}Button Text{{/button}}` - Reference to UI button (styled badge)
- `{{kbd}}Ctrl+K{{/kbd}}` - Keyboard shortcut (keyboard key styling)
- `{{badge}}Premium{{/badge}}` - Badge/tag/label (blue pill badge)

### Accordion/Collapsible
```
{{accordion title="Click to expand"}}
Hidden content that can be toggled
{{/accordion}}
```
**Features:**
- Clickable header with chevron icon
- Smooth expand/collapse animation
- Supports nested inline formatting

### Placeholders (Future Features)
```
{{image src="chart_id" alt="Description"}}
{{chart type="line" data-id="12345"}}
```
*Currently renders as placeholder boxes with icons*

---

## Theme Support

All components are fully theme-aware using Tailwind's `dark:` variant:

### Light Theme Colors
- Text: slate-900, slate-700, slate-500
- Backgrounds: white, slate-50, slate-100
- Positive: green-600
- Negative: red-600
- Accents: blue-600, indigo-600, sky-900

### Dark Theme Colors
- Text: slate-100, slate-300, slate-400
- Backgrounds: slate-900, slate-800, slate-950
- Positive: green-400 (brighter)
- Negative: red-400 (brighter)
- Accents: blue-400, indigo-400, sky-200

---

## Streaming Support

The parser handles incomplete tags during streaming:
- `hasIncompleteTags()` detects partial tags
- Incomplete tags are displayed as pending text
- Streaming cursor animation shows active generation

---

## Usage in ChatArea

```tsx
import { JovanResponse, stripJovanTags } from "../utils/jovanParser";

// Render AI message
<JovanResponse 
  content={message.content} 
  isStreaming={message.isStreaming} 
/>

// Copy to clipboard (strips all tags)
await navigator.clipboard.writeText(stripJovanTags(message.content));
```

---

## Example Response

```
Hi! I'm Jovan, your MarketView360 assistant. Let me help you screen for value stocks.

{{h2}}Core Value Stock Filters{{/h2}}

{{blank}}

To find undervalued companies, focus on these key metrics:

{{blank}}

{{ul}}
{{li}}{{code}}P/E ratio{{/code}}: Below 15 (often 10-15 range){{/li}}
{{li}}{{code}}P/B ratio{{/code}}: Below 3, ideally under 1.5{{/li}}
{{li}}{{code}}Dividend Yield{{/code}}: Above 2-3%{{/li}}
{{li}}{{code}}Debt-to-Equity{{/code}}: Below 0.5 for stability{{/li}}
{{/ul}}

{{blank}}

{{h3}}Example: Analyzing {{ticker}}AAPL{{/ticker}}{{/h3}}

{{blank}}

{{table}}
{{thead}}
{{tr}}
{{th align="left"}}Metric{{/th}}
{{th align="center"}}Value{{/th}}
{{th align="right"}}Change{{/th}}
{{/tr}}
{{/thead}}
{{tbody}}
{{tr}}
{{td align="left"}}P/E Ratio{{/td}}
{{td align="center"}}25.3{{/td}}
{{td align="right"}}{{positive}}+2.1%{{/positive}}{{/td}}
{{/tr}}
{{tr}}
{{td align="left"}}ROE{{/td}}
{{td align="center"}}18.5%{{/td}}
{{td align="right"}}{{negative}}-0.3%{{/negative}}{{/td}}
{{/tr}}
{{/tbody}}
{{/table}}

{{blank}}

{{callout type="tip"}}
Pro tip: Use {{formula}}PEG = P/E ÷ Growth Rate{{/formula}} to account for growth expectations.
{{/callout}}

{{blank}}

Here's a sample query you can use:

{{query}}
P/E < 15 AND P/B < 2 AND Dividend_Yield > 0.03 AND Debt_to_Equity < 0.5 AND Market_Cap > 1000000000
{{/query}}

{{blank}}

Navigate to the {{pagelink page="screener"}}Screener{{/pagelink}} tab to apply these filters.

{{blank}}

{{i}}This is general educational information, not personalized investment advice. Always conduct your own research and consider consulting a financial advisor.{{/i}}
```

---

## Testing

To test all tag types, send a message to the AI asking for:
1. "Show me all formatting options" - Tests text formatting
2. "How do I screen for value stocks?" - Tests query blocks, callouts, lists
3. "Explain P/E ratio with examples" - Tests tables, formulas, tickers
4. "What are the key metrics?" - Tests definition lists, accordions

---

## Files Modified

1. **`frontend/app/ai/utils/jovanParser.tsx`** - Complete rewrite with all tags
2. **`frontend/app/ai/components/ChatArea.tsx`** - Already using JovanResponse (no changes needed)

---

## Performance Notes

- Parser uses regex matching for efficient tag detection
- Streaming support prevents rendering incomplete tags
- All components are memoization-friendly
- No external dependencies beyond lucide-react icons

---

## Future Enhancements

- [ ] Actual image/chart rendering (currently placeholders)
- [ ] Syntax highlighting for code blocks (language-specific)
- [ ] Copy individual code blocks/queries
- [ ] Expand/collapse long tables
- [ ] Export responses as PDF/Markdown
