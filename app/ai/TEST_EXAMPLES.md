# Jovan Parser Test Examples

## Test 1: Text Formatting

```
Hi! Let me show you **bold text**, {{i}}italic text{{/i}}, {{u}}underlined text{{/u}}, {{s}}strikethrough text{{/s}}, and {{mark}}highlighted text{{/mark}}.

{{blank}}

You can also use {{code}}inline code{{/code}} for metrics like {{code}}P/E ratio{{/code}} or {{code}}ROE{{/code}}.
```

---

## Test 2: Financial Elements

```
Let's analyze {{ticker}}AAPL{{/ticker}}, {{ticker}}MSFT{{/ticker}}, and {{ticker}}GOOGL{{/ticker}}.

{{blank}}

The {{formula}}P/E Ratio = Stock Price ÷ Earnings Per Share{{/formula}} is a key valuation metric.

{{blank}}

Recent performance shows {{positive}}+5.2%{{/positive}} gains in tech, while energy is down {{negative}}-3.1%{{/negative}}. Utilities remain {{neutral}}0.0%{{/neutral}}.

{{blank}}

Apple's market cap is {{currency}}2850.50{{/currency}} billion, with a dividend yield of {{percent}}0.52{{/percent}}. The company has {{number}}157000{{/number}} employees.
```

---

## Test 3: Links

```
Check out {{link url="https://finance.yahoo.com"}}Yahoo Finance{{/link}} for real-time data.

{{blank}}

You can find this feature in the {{pagelink page="screener"}}Screener{{/pagelink}} or {{pagelink page="watchlist"}}Watchlist{{/pagelink}} sections.
```

---

## Test 4: Structure & Headings

```
{{h2}}Understanding Value Investing{{/h2}}

{{blank}}

Value investing focuses on finding undervalued companies.

{{blank}}

{{h3}}Key Principles{{/h3}}

{{blank}}

Look for companies trading below intrinsic value.{{br}}
Focus on fundamentals, not market sentiment.{{br}}
Maintain a margin of safety.

{{blank}}

{{hr}}

{{blank}}

This approach requires patience and discipline.
```

---

## Test 5: Callout Boxes

```
{{callout type="info"}}
MarketView360 provides real-time screening capabilities for over 5,000 stocks.
{{/callout}}

{{blank}}

{{callout type="warning"}}
High P/E ratios may indicate overvaluation or strong growth expectations. Always compare within the same industry.
{{/callout}}

{{blank}}

{{callout type="tip"}}
Pro tip: Use the {{code}}PEG ratio{{/code}} to account for growth when evaluating P/E ratios.
{{/callout}}

{{blank}}

{{callout type="success"}}
Your screening query has been saved successfully!
{{/callout}}
```

---

## Test 6: Lists

```
{{h3}}Value Stock Criteria{{/h3}}

{{blank}}

{{ul}}
{{li}}{{code}}P/E ratio{{/code}} below 15{{/li}}
{{li}}{{code}}P/B ratio{{/code}} below 2{{/li}}
{{li}}{{code}}Dividend Yield{{/code}} above 3%{{/li}}
{{li}}Strong balance sheet with low debt{{/li}}
{{/ul}}

{{blank}}

{{h3}}Screening Process{{/h3}}

{{blank}}

{{ol}}
{{li}}Define your investment criteria{{/li}}
{{li}}Build your screening query{{/li}}
{{li}}Review the results{{/li}}
{{li}}Perform detailed analysis on top candidates{{/li}}
{{li}}Make informed investment decisions{{/li}}
{{/ol}}
```

---

## Test 7: Nested Lists

```
{{h3}}Investment Categories{{/h3}}

{{blank}}

{{ul}}
{{li}}Value Stocks
{{ul}}
{{li}}Low P/E ratio{{/li}}
{{li}}High dividend yield{{/li}}
{{li}}Strong fundamentals{{/li}}
{{/ul}}
{{/li}}
{{li}}Growth Stocks
{{ul}}
{{li}}High revenue growth{{/li}}
{{li}}Expanding market share{{/li}}
{{li}}Innovation focus{{/li}}
{{/ul}}
{{/li}}
{{li}}Dividend Stocks
{{ul}}
{{li}}Consistent dividend history{{/li}}
{{li}}Sustainable payout ratio{{/li}}
{{li}}Growing dividends{{/li}}
{{/ul}}
{{/li}}
{{/ul}}
```

---

## Test 8: Definition Lists

```
{{h3}}Key Financial Metrics{{/h3}}

{{blank}}

{{dl}}
{{dt}}P/E Ratio{{/dt}}
{{dd}}Price-to-Earnings ratio measures how much investors pay per dollar of earnings. Lower values may indicate undervaluation.{{/dd}}

{{dt}}ROE{{/dt}}
{{dd}}Return on Equity shows how efficiently a company uses shareholder equity to generate profits. Higher is generally better.{{/dd}}

{{dt}}Debt-to-Equity{{/dt}}
{{dd}}Measures financial leverage by comparing total debt to shareholder equity. Lower values indicate less financial risk.{{/dd}}

{{dt}}Free Cash Flow{{/dt}}
{{dd}}Cash generated after capital expenditures, available for dividends, buybacks, or debt reduction.{{/dd}}
{{/dl}}
```

---

## Test 9: Tables

```
{{h3}}Tech Stock Comparison{{/h3}}

{{blank}}

{{table}}
{{thead}}
{{tr}}
{{th align="left"}}Company{{/th}}
{{th align="center"}}P/E Ratio{{/th}}
{{th align="right"}}Market Cap{{/th}}
{{th align="right"}}YTD Change{{/th}}
{{/tr}}
{{/thead}}
{{tbody}}
{{tr}}
{{td align="left"}}{{ticker}}AAPL{{/ticker}}{{/td}}
{{td align="center"}}28.5{{/td}}
{{td align="right"}}{{currency}}2850{{/currency}}B{{/td}}
{{td align="right"}}{{positive}}+15.2%{{/positive}}{{/td}}
{{/tr}}
{{tr}}
{{td align="left"}}{{ticker}}MSFT{{/ticker}}{{/td}}
{{td align="center"}}32.1{{/td}}
{{td align="right"}}{{currency}}2620{{/currency}}B{{/td}}
{{td align="right"}}{{positive}}+22.8%{{/positive}}{{/td}}
{{/tr}}
{{tr}}
{{td align="left"}}{{ticker}}GOOGL{{/ticker}}{{/td}}
{{td align="center"}}24.3{{/td}}
{{td align="right"}}{{currency}}1680{{/currency}}B{{/td}}
{{td align="right"}}{{positive}}+18.5%{{/positive}}{{/td}}
{{/tr}}
{{tr}}
{{td align="left"}}{{ticker}}META{{/ticker}}{{/td}}
{{td align="center"}}26.7{{/td}}
{{td align="right"}}{{currency}}890{{/currency}}B{{/td}}
{{td align="right"}}{{negative}}-5.3%{{/negative}}{{/td}}
{{/tr}}
{{/tbody}}
{{/table}}
```

---

## Test 10: Code Blocks

```
{{h3}}Calculating P/E Ratio{{/h3}}

{{blank}}

{{codeblock}}
P/E Ratio = Stock Price / Earnings Per Share

Example:
Stock Price: $150
EPS: $5
P/E Ratio = $150 / $5 = 30

Interpretation:
- P/E < 15: Potentially undervalued
- P/E 15-25: Fair value range
- P/E > 25: Potentially overvalued or high growth
{{/codeblock}}
```

---

## Test 11: Query Blocks (CRITICAL)

```
{{h3}}Value Stock Screening Query{{/h3}}

{{blank}}

Here's a query to find undervalued companies with strong fundamentals:

{{query}}
P/E < 15 AND P/B < 2 AND Dividend_Yield > 0.03 AND Debt_to_Equity < 0.5 AND Market_Cap > 1000000000 AND ROE > 0.15
{{/query}}

{{blank}}

{{callout type="info"}}
Note: Query syntax may have been updated. Please verify in the Query Editor before running.
{{/callout}}

{{blank}}

This query will find companies with:
{{ul}}
{{li}}P/E ratio below 15 (value){{/li}}
{{li}}P/B ratio below 2 (trading near book value){{/li}}
{{li}}Dividend yield above 3% (income){{/li}}
{{li}}Low debt (financial stability){{/li}}
{{li}}Market cap above $1B (established companies){{/li}}
{{li}}ROE above 15% (profitability){{/li}}
{{/ul}}
```

---

## Test 12: Quote Blocks

```
{{quote}}
The stock market is a device for transferring money from the impatient to the patient.
{{/quote}}

{{blank}}

{{quote source="Warren Buffett"}}
Price is what you pay, value is what you get.
{{/quote}}

{{blank}}

{{quote source="Benjamin Graham"}}
In the short run, the market is a voting machine but in the long run, it is a weighing machine.
{{/quote}}
```

---

## Test 13: UI Elements

```
To save your screener, click the {{button}}Save Screener{{/button}} button in the top right.

{{blank}}

Use {{kbd}}Ctrl+K{{/kbd}} to quickly open the command palette, or {{kbd}}Ctrl+S{{/kbd}} to save your work.

{{blank}}

This feature requires a {{badge}}Premium{{/badge}} subscription.
```

---

## Test 14: Accordion

```
{{accordion title="Advanced P/E Ratio Analysis"}}
The P/E ratio should be evaluated in context:

{{blank}}

{{ul}}
{{li}}Compare to industry average{{/li}}
{{li}}Consider growth rate (use PEG ratio){{/li}}
{{li}}Look at historical P/E range{{/li}}
{{li}}Account for cyclical businesses{{/li}}
{{li}}Adjust for one-time events{{/li}}
{{/ul}}

{{blank}}

The {{formula}}PEG Ratio = P/E Ratio ÷ Earnings Growth Rate{{/formula}} provides better context for growth companies.
{{/accordion}}

{{blank}}

{{accordion title="Understanding Market Cap Categories"}}
Companies are categorized by market capitalization:

{{blank}}

{{dl}}
{{dt}}Mega Cap{{/dt}}
{{dd}}Market cap above {{currency}}200{{/currency}} billion. Examples: {{ticker}}AAPL{{/ticker}}, {{ticker}}MSFT{{/ticker}}{{/dd}}

{{dt}}Large Cap{{/dt}}
{{dd}}Market cap between {{currency}}10{{/currency}}-{{currency}}200{{/currency}} billion{{/dd}}

{{dt}}Mid Cap{{/dt}}
{{dd}}Market cap between {{currency}}2{{/currency}}-{{currency}}10{{/currency}} billion{{/dd}}

{{dt}}Small Cap{{/dt}}
{{dd}}Market cap between {{currency}}300{{/currency}}M-{{currency}}2{{/currency}} billion{{/dd}}
{{/dl}}
{{/accordion}}
```

---

## Test 15: Placeholders

```
{{h3}}Future Features{{/h3}}

{{blank}}

{{image src="pe_ratio_chart" alt="P/E Ratio Historical Trend"}}

{{blank}}

{{chart type="line" data-id="12345"}}
```

---

## Test 16: Complete Example (All Tags)

```
{{h2}}Complete Value Stock Analysis Guide{{/h2}}

{{blank}}

Welcome! I'm **Jovan**, your MarketView360 assistant. Let me help you understand value investing.

{{blank}}

{{h3}}What is Value Investing?{{/h3}}

{{blank}}

Value investing is a strategy where you buy {{ticker}}stocks{{/ticker}} trading below their {{mark}}intrinsic value{{/mark}}. The key formula is:

{{blank}}

{{formula}}Intrinsic Value = Present Value of Future Cash Flows{{/formula}}

{{blank}}

{{callout type="tip"}}
Pro tip: Focus on companies with {{code}}P/E < 15{{/code}}, {{code}}P/B < 2{{/code}}, and {{code}}ROE > 15%{{/code}}.
{{/callout}}

{{blank}}

{{h3}}Key Metrics to Evaluate{{/h3}}

{{blank}}

{{dl}}
{{dt}}P/E Ratio{{/dt}}
{{dd}}Measures valuation relative to earnings. Lower is generally better for value stocks.{{/dd}}

{{dt}}P/B Ratio{{/dt}}
{{dd}}Compares market value to book value. Values below 1 may indicate undervaluation.{{/dd}}

{{dt}}Dividend Yield{{/dt}}
{{dd}}Annual dividend as percentage of stock price. Higher yields provide income.{{/dd}}
{{/dl}}

{{blank}}

{{h3}}Top Value Stocks (Example){{/h3}}

{{blank}}

{{table}}
{{thead}}
{{tr}}
{{th align="left"}}Ticker{{/th}}
{{th align="center"}}P/E{{/th}}
{{th align="center"}}P/B{{/th}}
{{th align="right"}}Div Yield{{/th}}
{{th align="right"}}Score{{/th}}
{{/tr}}
{{/thead}}
{{tbody}}
{{tr}}
{{td align="left"}}{{ticker}}XOM{{/ticker}}{{/td}}
{{td align="center"}}12.3{{/td}}
{{td align="center"}}1.8{{/td}}
{{td align="right"}}{{percent}}3.5{{/percent}}{{/td}}
{{td align="right"}}{{positive}}+8.2{{/positive}}{{/td}}
{{/tr}}
{{tr}}
{{td align="left"}}{{ticker}}CVX{{/ticker}}{{/td}}
{{td align="center"}}11.7{{/td}}
{{td align="center"}}1.6{{/td}}
{{td align="right"}}{{percent}}3.8{{/percent}}{{/td}}
{{td align="right"}}{{positive}}+7.9{{/positive}}{{/td}}
{{/tr}}
{{tr}}
{{td align="left"}}{{ticker}}PFE{{/ticker}}{{/td}}
{{td align="center"}}14.2{{/td}}
{{td align="center"}}2.1{{/td}}
{{td align="right"}}{{percent}}4.2{{/percent}}{{/td}}
{{td align="right"}}{{neutral}}0.0{{/neutral}}{{/td}}
{{/tr}}
{{/tbody}}
{{/table}}

{{blank}}

{{h3}}Sample Screening Query{{/h3}}

{{blank}}

Use this query to find value stocks:

{{query}}
P/E < 15 AND P/B < 2 AND Dividend_Yield > 0.03 AND ROE > 0.15 AND Debt_to_Equity < 0.5 AND Market_Cap > 5000000000
{{/query}}

{{blank}}

{{callout type="warning"}}
Remember: Low valuation doesn't always mean a good investment. Always research the company's fundamentals and industry position.
{{/callout}}

{{blank}}

{{h3}}Next Steps{{/h3}}

{{blank}}

{{ol}}
{{li}}Navigate to the {{pagelink page="screener"}}Screener{{/pagelink}}{{/li}}
{{li}}Click {{button}}New Query{{/button}} to start{{/li}}
{{li}}Use {{kbd}}Ctrl+Enter{{/kbd}} to run your query{{/li}}
{{li}}Review results and add to {{pagelink page="watchlist"}}Watchlist{{/pagelink}}{{/li}}
{{li}}Perform detailed analysis before investing{{/li}}
{{/ol}}

{{blank}}

{{accordion title="Advanced Valuation Techniques"}}
For deeper analysis, consider these advanced methods:

{{blank}}

{{ul}}
{{li}}Discounted Cash Flow (DCF) analysis{{/li}}
{{li}}Comparable company analysis{{/li}}
{{li}}Precedent transaction analysis{{/li}}
{{li}}Sum-of-the-parts valuation{{/li}}
{{/ul}}

{{blank}}

{{codeblock}}
DCF Formula:
Intrinsic Value = Σ(FCF_t / (1 + r)^t) + Terminal Value

Where:
FCF_t = Free Cash Flow in year t
r = Discount rate (WACC)
Terminal Value = FCF_n × (1 + g) / (r - g)
{{/codeblock}}
{{/accordion}}

{{blank}}

{{hr}}

{{blank}}

{{quote source="Warren Buffett"}}
Be fearful when others are greedy, and greedy when others are fearful.
{{/quote}}

{{blank}}

For more information, visit {{link url="https://www.investopedia.com/terms/v/valueinvesting.asp"}}Investopedia's Value Investing Guide{{/link}}.

{{blank}}

{{i}}This is general educational information, not personalized investment advice. Always conduct your own research and consider consulting a financial advisor.{{/i}}
```

---

## How to Test

1. Start a chat session in the AI interface
2. Copy any of the test examples above
3. Paste into the backend system prompt or send as a simulated AI response
4. Verify all tags render correctly in both light and dark themes
5. Test interactive elements (query buttons, accordions)
6. Verify responsive behavior on mobile devices

## Expected Results

- ✅ All text formatting renders correctly
- ✅ Financial elements have appropriate colors (green/red)
- ✅ Links are clickable and open correctly
- ✅ Tables are responsive and styled properly
- ✅ Query blocks show syntax highlighting
- ✅ Query buttons navigate to correct URLs
- ✅ Accordions expand/collapse smoothly
- ✅ Callouts display with correct icons and colors
- ✅ Theme switching works seamlessly
- ✅ Streaming shows incomplete tags correctly
