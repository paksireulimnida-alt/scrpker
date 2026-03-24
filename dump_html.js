const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    const url = "https://lokermedan.co.id/";

    console.log(`Testing URL: ${url}`);

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });

    // Wait for dynamic content to load
    await new Promise(resolve => setTimeout(resolve, 8000));

    // Check main document HTML again just in case
    const html = await page.content();
    fs.writeFileSync('rendered_lokermedan.html', html);
    console.log('Saved rendered HTML.');

    await browser.close();
})();
