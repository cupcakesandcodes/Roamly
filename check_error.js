import puppeteer from 'puppeteer';
(async () => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
        page.on('console', msg => {
            if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text());
        });
        await page.goto('http://localhost:5173/agent/trip-builder');
        await new Promise(r => setTimeout(r, 2000));
        await browser.close();
    } catch (e) {
        console.error(e);
    }
})();
