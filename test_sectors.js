const http = require('http');

// Query to get distinct sector values from the database
const data = JSON.stringify({
    select: ["sector"],
    sort: "market_cap.desc",
    limit: 500,
    exchange: "us"
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

    res.on('data', (chunk) => {
        body += chunk;
    });

    res.on('end', () => {
        try {
            const parsed = JSON.parse(body);

            // Get unique sectors
            const sectors = new Set();
            (parsed.data || []).forEach(row => {
                if (row.sector) sectors.add(row.sector);
            });

            console.log('Unique sectors in database:');
            [...sectors].sort().forEach(s => console.log(`  - "${s}"`));
            console.log(`\nTotal: ${sectors.size} sectors`);
        } catch (e) {
            console.error('Error:', e);
        }
    });
});

req.on('error', (error) => {
    console.error('Error:', error);
});

req.write(data);
req.end();
