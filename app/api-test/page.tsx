"use client";

import React, { useState } from 'react';
import { getRealTimePrice, StockData } from '@/lib/eodhd';

export default function ApiTestPage() {
    const [data, setData] = useState<StockData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        console.log("Fetching data...");
        try {
            // Check if key is available
            const key = process.env.NEXT_PUBLIC_EODHD_API_TOKEN;
            console.log("API Key available:", !!key);
            if (key) console.log("API Key prefix:", key.substring(0, 5));

            const result = await getRealTimePrice('AAPL.US');
            console.log("Result:", result);
            setData(result);
        } catch (err: unknown) {
            console.error("Fetch error:", err);
            setError(err instanceof Error ? err.message : 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-10">
            <h1 className="text-2xl font-bold mb-4">EODHD API Test</h1>
            <button
                onClick={fetchData}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                Fetch AAPL Data
            </button>

            {loading && <p className="mt-4">Loading...</p>}
            {error && <p className="mt-4 text-red-500">{error}</p>}

            {data && (
                <div className="mt-4 p-4 border rounded bg-gray-50">
                    <pre>{JSON.stringify(data, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}
