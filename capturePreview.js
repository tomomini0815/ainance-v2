import puppeteer from 'puppeteer';
import path from 'path';

(async () => {
    try {
        const browser = await puppeteer.launch({
            headless: 'new',
            defaultViewport: { width: 1280, height: 900 }
        });
        const page = await browser.newPage();

        console.log('Navigating to app...');
        await page.goto('http://localhost:5173/corporate-tax', { waitUntil: 'networkidle0', timeout: 30000 });

        // Wait for tabs to render
        await page.waitForSelector('button', { timeout: 5000 });

        const outputDir = 'C:\\Users\\userv\\.gemini\\antigravity\\brain\\2186f7c8-56fa-4bf1-9ba8-36eedaee1c9e';

        // 1. Click "別表七" tab and screenshot
        console.log('Finding Beppyo 7 tab...');
        const buttons = await page.$$('button');
        let matched = false;
        for (const btn of buttons) {
            const text = await page.evaluate(el => el.textContent, btn);
            if (text && text.includes('別表七')) {
                await btn.click();
                matched = true;
                break;
            }
        }

        if (matched) {
            await new Promise(r => setTimeout(r, 1000)); // wait for render
            await page.screenshot({ path: path.join(outputDir, 'app_preview_beppyo7.webp'), fullPage: true, type: 'webp' });
            console.log('Saved Beppyo 7 screenshot');
        }

        // 2. Click "地方税" tab and screenshot
        console.log('Finding Local Tax tab...');
        matched = false;
        for (const btn of buttons) {
            const text = await page.evaluate(el => el.textContent, btn);
            if (text && text.includes('地方税')) {
                await btn.click();
                matched = true;
                break;
            }
        }

        if (matched) {
            await new Promise(r => setTimeout(r, 1000));
            await page.screenshot({ path: path.join(outputDir, 'app_preview_localtax.webp'), fullPage: true, type: 'webp' });
            console.log('Saved Local Tax screenshot');
        }

        await browser.close();
        console.log('Done.');
    } catch (e) {
        console.error('Puppeteer error:', e);
        process.exit(1);
    }
})();
