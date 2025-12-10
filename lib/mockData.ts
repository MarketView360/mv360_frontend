export const AAPL_DATA = {
    ticker: "AAPL",
    name: "Apple Inc.",
    price: 189.45,
    changePercent: 1.25,
    priceHistory: [
        { date: "Jan", price: 150 },
        { date: "Feb", price: 155 },
        { date: "Mar", price: 148 },
        { date: "Apr", price: 160 },
        { date: "May", price: 170 },
        { date: "Jun", price: 180 },
        { date: "Jul", price: 195 },
        { date: "Aug", price: 185 },
        { date: "Sep", price: 175 },
        { date: "Oct", price: 182 },
        { date: "Nov", price: 190 },
        { date: "Dec", price: 195 },
    ],
    ratios: [
        { label: "Market Cap", value: "$2.95T" },
        { label: "Current Price", value: "$189.45" },
        { label: "High / Low", value: "$199.62 / $124.17" },
        { label: "Stock P/E", value: "30.4" },
        { label: "Book Value", value: "$4.12" },
        { label: "Dividend Yield", value: "0.52%" },
        { label: "ROCE", value: "175%" },
        { label: "ROE", value: "160%" },
    ],
    filings: [
        { type: "10-K", date: "Oct 2023" },
        { type: "10-Q", date: "Jul 2023" },
        { type: "8-K", date: "May 2023" },
        { type: "10-Q", date: "Apr 2023" },
        { type: "8-K", date: "Feb 2023" },
    ],
    financials: {
        pnl: {
            columns: ["Mar 2021", "Mar 2022", "Mar 2023", "TTM"],
            rows: [
                { name: "Revenue", values: ["365,817", "394,328", "383,285", "385,706"] },
                { name: "Expenses", values: ["256,930", "274,891", "269,146", "271,200"] },
                { name: "Operating Profit", values: ["108,949", "119,437", "114,301", "114,506"] },
                { name: "OPM %", values: ["30%", "30%", "30%", "30%"] },
                { name: "Other Income", values: ["258", "333", "-382", "-500"] },
                { name: "Interest", values: ["2,645", "2,931", "3,933", "3,900"] },
                { name: "Depreciation", values: ["11,284", "11,104", "11,519", "11,600"] },
                { name: "Profit before tax", values: ["109,207", "119,103", "113,736", "113,900"] },
                { name: "Tax %", values: ["13%", "16%", "15%", "15%"] },
                { name: "Net Profit", values: ["94,680", "99,803", "96,995", "97,100"] },
                { name: "EPS in Rs", values: ["5.61", "6.11", "6.13", "6.15"], isGrowth: true },
            ]
        },
        balanceSheet: {
            columns: ["Mar 2021", "Mar 2022", "Mar 2023", "Sep 2023"],
            rows: [
                { name: "Equity Capital", values: ["16,426", "15,943", "15,550", "15,550"] },
                { name: "Reserves", values: ["49,278", "34,704", "46,604", "48,000"] },
                { name: "Borrowings", values: ["118,723", "111,723", "109,283", "105,000"] },
                { name: "Other Liabilities", values: ["105,392", "125,481", "120,075", "122,000"] },
                { name: "Total Liabilities", values: ["289,819", "287,851", "291,512", "290,550"] },
                { name: "Fixed Assets", values: ["39,440", "39,245", "43,715", "44,000"] },
                { name: "CWIP", values: ["2,000", "2,500", "3,000", "3,200"] },
                { name: "Investments", values: ["127,877", "120,805", "110,461", "108,000"] },
                { name: "Other Assets", values: ["120,502", "125,301", "134,336", "135,350"] },
                { name: "Total Assets", values: ["289,819", "287,851", "291,512", "290,550"] },
            ]
        },
        cashFlows: {
            columns: ["Mar 2021", "Mar 2022", "Mar 2023", "TTM"],
            rows: [
                { name: "Cash from Operating Activity", values: ["104,038", "122,151", "110,543", "112,000"] },
                { name: "Cash from Investing Activity", values: ["-14,545", "-22,354", "-3,705", "-5,000"] },
                { name: "Cash from Financing Activity", values: ["-93,353", "-110,749", "-108,488", "-105,000"] },
                { name: "Net Cash Flow", values: ["-3,860", "-10,952", "-1,650", "2,000"] },
            ]
        }
    }
};
