const http = require('http');

const SECTORS_TO_TEST = [
    "Technology",
    "Healthcare",
    "Financial Services",
    "Consumer Cyclical",
    "Energy",
    "Industrials",
    "Utilities",
    "Basic Materials",
    "Real Estate",
    "Communication Services"
];

async function testSector(sectorName) {
    return new Promise((resolve) => {
        const data = JSON.stringify({
            select: ["code", "sector", "market_cap", "price_change_1d"],
            sort: "market_cap.desc",
            limit: 5,
            exchange: "us",
            query: `sector = "${sectorName}"`
        });

        const options = {
            hostname: 'localhost',
            port: 4000,
            path: '/api/run-query',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => { body += chunk; });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    const count = parsed.data?.length || 0;
                    const sample = parsed.data?.[0];
                    resolve({
                        sector: sectorName,
                        count,
                        sampleTicker: sample?.code || 'N/A',
                        sampleChange: sample?.price_change_1d
                    });
                } catch (e) {
                    resolve({ sector: sectorName, count: 0, error: e.message });
                }
            });
        });

        req.on('error', (e) => resolve({ sector: sectorName, count: 0, error: e.message }));
        req.write(data);
        req.end();
    });
}

async function runTests() {
    console.log('Testing all sectors...\n');
    for (const sector of SECTORS_TO_TEST) {
        const result = await testSector(sector);
        const status = result.count > 0 ? '✓' : '✗';
        console.log(`${status} ${sector}: ${result.count} results`);
        if (result.count > 0) {
            console.log(`   Sample: ${result.sampleTicker} (change: ${result.sampleChange?.toFixed(2)}%)`);
        }
    }
}

runTests();
