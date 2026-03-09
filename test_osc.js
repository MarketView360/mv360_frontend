const { chromium } = require('playwright');
(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

    await page.goto('http://localhost:3000/stocks/AAPL');
    await page.waitForTimeout(3000);

    console.log('Clicking settings icon...');
    await page.click('button:has(svg.lucide-settings-2)');
    await page.waitForTimeout(500);

    console.log('Clicking Indicators...');
    await page.click('div[role="menuitem"]:has-text("Indicators")');
    await page.waitForTimeout(500);

    console.log('Clicking Oscillator Sub-Pane...');
    await page.click('div[role="menuitem"]:has-text("Oscillator Sub-Pane")');
    await page.waitForTimeout(500);

    console.log('Selecting RSI (14)...');
    await page.click('div[role="menuitemradio"]:has-text("RSI (14)")');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'rsi_test.png' });
    console.log('Screenshot saved to rsi_test.png');
    await browser.close();
})();
