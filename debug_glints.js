const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    const url = "https://glints.com/id/opportunities/jobs/explore?keyword=social+media&country=ID&locationId=a6f7a20f-7172-4436-a418-afc91020ba0f&locationName=Medan%2C+Sumatera+Utara&lowestLocationLevel=3&page=1";

    console.log(`Testing URL: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    const jobLinksCount = await page.evaluate(() => {
        return document.querySelectorAll('a[href*="/opportunities/jobs/"]').length;
    });
    console.log(`Found ${jobLinksCount} job links with current selector.`);

    const sampleLinks = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a[href*="/opportunities/jobs/"]'))
            .slice(0, 3)
            .map(a => ({ href: a.href, text: a.innerText }));
    });
    console.log("Sample links:", JSON.stringify(sampleLinks, null, 2));

    const cardDetails = await page.evaluate(() => {
        const link = document.querySelector('a[href*="/opportunities/jobs/"]');
        if (!link) return { found: false, error: "No link found" };
        let container = link.closest('div[class*="JobCard"]');
        if (!container) {
            container = link.parentElement?.parentElement?.parentElement?.parentElement;
        }
        if (!container) return { found: false, error: "No container found" };

        const companyEl = container.querySelector('a[href*="/companies/"]');
        const companyName = companyEl ? companyEl.innerText : "Not found via link";

        return {
            found: true,
            className: container.className,
            title: link.innerText,
            companyName: companyName,
            allText: container.innerText,
            companyViaLink: !!companyEl
        };
    });
    console.log("Card details:", JSON.stringify(cardDetails, null, 2));

    const allCards = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('div[class*="JobCard"]')).slice(0, 5).map(c => ({
            text: c.innerText.substring(0, 100).replace(/\n/g, ' '),
            hasCompanyLink: !!c.querySelector('a[href*="/companies/"]')
        }));
    });
    console.log("First 5 cards summary:", JSON.stringify(allCards, null, 2));

    await browser.close();
})();
