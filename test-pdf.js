const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    page.on('console', msg => {
        if (msg.type() === 'error' || msg.type() === 'warning') {
            console.log(`BROWSER ${msg.type().toUpperCase()}:`, msg.text());
        }
    });

    try {
        await page.goto('http://localhost:5173/tax-return-input', { waitUntil: 'networkidle' });
        console.log('Page loaded');

        await page.evaluate(() => {
            console.log('Replacing console.error');
            const oldErr = console.error;
            console.error = function (...args) {
                window.lastError = args;
                oldErr.apply(console, args);
            };
        });

        const button = page.locator('button', { hasText: '確定申告書 第一表・第二表' });
        await button.click();
        console.log('Button clicked, waiting 5 seconds...');

        await page.waitForTimeout(5000);

        const err = await page.evaluate(() => window.lastError);
        console.log('Captured error:', err);

        // check if isGeneratingPdf is stuck
        const btnHtml = await button.innerHTML();
        if (btnHtml.includes('animate-spin')) {
            console.log('BUTTON IS SPINNING! The Promise is hanging.');
        } else {
            console.log('Button is not spinning.');
        }
    } catch (err) {
        console.error('Test script error:', err);
    } finally {
        await browser.close();
    }
})();
