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
    const url = "https://id.jobstreet.com/id/jobs/in-Medan-Sumatera-Utara?source=FE_HOME&jobId=90461280&type=standard";

    console.log(`Testing URL: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    const articlesCount = await page.evaluate(() => {
        return document.querySelectorAll('article').length;
    });
    console.log(`Found ${articlesCount} articles.`);

    const sampleJobs = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('article')).slice(0, 3).map(article => {
            const titleEl = article.querySelector('[data-automation="jobTitle"]');
            const companyEl = article.querySelector('[data-automation="jobCompany"]');
            const dateEl = article.querySelector('[data-automation="jobListingDate"]');
            return {
                title: titleEl ? titleEl.innerText : "No title",
                company: companyEl ? companyEl.innerText : "No company",
                date: dateEl ? dateEl.innerText : "No date",
                fullText: article.innerText.substring(0, 200).replace(/\n/g, ' ')
            };
        });
    });
    console.log("Sample jobs:", JSON.stringify(sampleJobs, null, 2));

    await browser.close();
})();
