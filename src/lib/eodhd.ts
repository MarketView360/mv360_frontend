"use server";

const API_KEY = process.env.EODHD_API_TOKEN || process.env.NEXT_PUBLIC_EODHD_API_TOKEN;
const BASE_URL = 'https://eodhd.com/api';

export interface StockData {
    code: string;
    timestamp: number;
    gmtoffset: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    previousClose: number;
    change: number;
    change_p: number;
}

export const getRealTimePrice = async (ticker: string): Promise<StockData | null> => {
    if (!API_KEY) {
        console.error('EODHD API Key is missing');
        return null;
    }

    try {
        const url = `${BASE_URL}/real-time/${ticker}?api_token=${API_KEY}&fmt=json`;
        const response = await fetch(url, { cache: 'no-store' });

        if (!response.ok) {
            throw new Error(`Failed to fetch data for ${ticker}: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching stock data:', error);
        return null;
    }
};

export const getBulkRealTimePrices = async (tickers: string[]): Promise<StockData[]> => {
    if (!API_KEY) return [];
    if (tickers.length === 0) return [];

    const primaryTicker = tickers[0];
    const otherTickers = tickers.slice(1).join(',');

    try {
        let url = `${BASE_URL}/real-time/${primaryTicker}?api_token=${API_KEY}&fmt=json`;
        if (otherTickers) {
            url += `&s=${otherTickers}`;
        }

        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) throw new Error("Failed to fetch bulk data");

        const data = await response.json();
        return Array.isArray(data) ? data : [data];
    } catch (error) {
        console.error("Error fetching bulk data:", error);
        return [];
    }
};