const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    const url = "https://lokermedan.co.id/";

    console.log(`Testing URL: ${url}`);

    // Intercept network requests
    page.on('response', async (response) => {
        const reqRef = response.request();
        const reqUrl = reqRef.url();
        const resourceType = reqRef.resourceType();

        if (resourceType === 'xhr' || resourceType === 'fetch') {
            try {
                const text = await response.text();
                console.log(`\n--- API Response: ${reqUrl} ---`);
                console.log(text.substring(0, 500));

                // If it looks like HTML containing jobs, try to extract links
                if (text.includes('loker') && text.includes('href')) {
                    const links = [...text.matchAll(/href=\\"([^\\"]+-loker-[^\\"]+\.html)\\"/g)].map(m => m[1]);
                    if (links.length > 0) {
                        console.log("Found links in response:");
                        console.log([...new Set(links)]);
                    }
                }
            } catch (e) {
                // Ignore errors related to fetching response body
            }
        }
    });

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });

    // Wait for dynamic content to load
    await new Promise(resolve => setTimeout(resolve, 8000));

    // Check main document HTML again just in case
    const html = await page.content();
    const mainLinks = [...html.matchAll(/href="([^"]+-loker-[^"]+\.html)"/g)].map(m => m[1]);
    console.log(`\nMain HTML links found: ${new Set(mainLinks).size}`);

    await browser.close();
})();
