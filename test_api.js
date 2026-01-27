const http = require('http');

const data = JSON.stringify({
    select: ["code", "market_cap", "price_change_1d"],
    sort: "market_cap.desc",
    limit: 5,
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
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
                const json = JSON.parse(body);
                console.log("Data count:", json.count);
                if (json.data && json.data.length > 0) {
                    console.log("First 5 rows:");
                    console.log(JSON.stringify(json.data.slice(0, 5), null, 2));
                } else {
                    console.log("No data returned");
                }
            } catch (e) {
                console.error("Failed to parse JSON:", e);
                console.log("Body:", body);
            }
        } else {
            console.error("Request failed:", body);
        }
    });
});

req.on('error', (error) => {
    console.error("Error:", error);
});

req.write(data);
req.end();
