const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    const url = "https://lokermedan.com/";

    console.log(`Testing URL: ${url}`);

    try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });
        await delay(5000);

        const extractedJobs = await page.evaluate(() => {
            const extracted = [];
            // Lokermedan.com usually lists jobs with a, article, div
            const anchors = Array.from(document.querySelectorAll('a'));

            anchors.forEach(a => {
                const href = a.href;
                const text = a.innerText.trim();

                // Usually job links contain words like 'lowongan', 'loker', or have specific patterns
                // We'll capture any link that might be a job to analyze
                if (href && href !== window.location.href && !href.includes('whatsapp.com')) {
                    extracted.push({
                        link: href,
                        title: text
                    });
                }
            });
            return extracted;
        });

        console.log(`Extracted total links: ${extractedJobs.length}`);

        // Let's filter some potential job links
        const jobLinks = extractedJobs.filter(job =>
            job.link.includes('lowongan') ||
            job.link.includes('/loker') ||
            job.link.includes('/job') ||
            job.title.toLowerCase().includes('loker') ||
            job.title.toLowerCase().includes('dibutuhkan') ||
            job.title.toLowerCase().includes('lowongan')
        );

        console.log(`Potential job links: ${jobLinks.length}`);
        console.log(jobLinks.slice(0, 5));

        if (jobLinks.length === 0) {
            console.log("No obvious job links found. Dumping page info...");
            const title = await page.title();
            console.log("Page Title:", title);

            // Print top 10 links just to see what's there
            console.log("Top 10 visible links:");
            console.log(extractedJobs.filter(j => j.title.length > 5).slice(0, 10));
        }

    } catch (err) {
        console.error("Error navigating to page", err);
    }

    await browser.close();
})();
