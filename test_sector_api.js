const http = require('http');

const data = JSON.stringify({
    select: ["code", "sector", "market_cap", "price_change_1d"],
    sort: "market_cap.desc",
    limit: 5,
    exchange: "us",
    query: 'sector = "Technology"'
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
                console.log('First 5 rows:');
                console.log(JSON.stringify(parsed.data.slice(0, 5), null, 2));
            } else {
                console.log('No data returned or invalid format');
                console.log(body.substring(0, 200));
            }
        } catch (e) {
            console.error('Error parsing response:', e);
            console.log('Raw body:', body.substring(0, 200));
        }
    });
});

req.on('error', (error) => {
    console.error('Error:', error);
});

req.write(data);
req.end();
