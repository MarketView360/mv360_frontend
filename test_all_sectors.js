const http = require('http');

// Test the default "All sectors" query (no sector filter)
const data = JSON.stringify({
    select: ["code", "sector", "market_cap", "price_change_1d"],
    sort: "market_cap.desc",
    limit: 10,
    exchange: "us"
    // Note: No query/sector filter - this is the "All sectors" case
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
    console.log(`Status: ${res.statusCode}`);
    let body = '';

    res.on('data', (chunk) => {
        body += chunk;
    });

    res.on('end', () => {
        try {
            const parsed = JSON.parse(body);
            console.log('Data count:', parsed.data ? parsed.data.length : 0);
            if (parsed.data && parsed.data.length > 0) {
                console.log('First 10 rows (checking price_change_1d):');
                parsed.data.slice(0, 10).forEach((row, i) => {
                    console.log(`  ${i + 1}. ${row.code}: price_change_1d = ${row.price_change_1d}`);
                });
            } else {
                console.log('No data returned or invalid format');
                console.log(body.substring(0, 500));
            }
        } catch (e) {
            console.error('Error parsing response:', e);
            console.log('Raw body:', body.substring(0, 500));
        }
    });
});

req.on('error', (error) => {
    console.error('Error:', error);
});

req.write(data);
req.end();
