const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function isFresh(text) {
    if (!text) return false;
    const lower = text.toLowerCase();
    if (lower.includes("baru saja") || lower.includes("menit") || lower.includes("jam") || lower.includes("just now") || lower.includes("minutes") || lower.includes("hours")) {
        return true;
    }
    const dayMatch = lower.match(/(\d+)\s*(hari|day)/);
    if (dayMatch) {
        const days = parseInt(dayMatch[1]);
        return days <= 14;
    }
    return false;
}

(async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    const url = "https://glints.com/id/opportunities/jobs/explore?country=ID&locationId=a6f7a20f-7172-4436-a418-afc91020ba0f&locationName=Medan%2C+Sumatera+Utara&lowestLocationLevel=3&sortBy=LATEST";

    console.log(`Testing URL: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });
    await delay(5000); // Extra wait for dynamic content

    // Scroll logic same as scraper
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 100;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
                if (totalHeight >= scrollHeight - window.innerHeight || totalHeight > 5000) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
    await delay(2000);

    const extractedJobs = await page.evaluate(() => {
        const extracted = [];
        const jobLinks = document.querySelectorAll('a[href*="/opportunities/jobs/"]');
        jobLinks.forEach(link => {
            let container = link.closest('div[class*="JobCard"]');
            if (!container) {
                container = link.parentElement?.parentElement?.parentElement?.parentElement;
            }
            if (!container) return;
            const companyEl = container.querySelector('a[href*="/companies/"]');

            // Replicating the new fallback logic
            let companyName = companyEl ? companyEl.innerText : "";
            if (!companyName) {
                const lines = container.innerText.split('\n').filter(l => l.trim().length > 0);
                companyName = lines[2] || lines[1] || "Unknown Company";
            }

            extracted.push({
                title: link.innerText,
                company: companyName,
                link: link.href,
                details: container.innerText
            });
        });
        return extracted;
    });

    console.log(`Extracted total: ${extractedJobs.length} jobs.`);

    if (extractedJobs.length === 0) {
        console.log("No jobs found. Dumping page info...");
        const title = await page.title();
        console.log("Page Title:", title);
        const html = await page.evaluate(() => document.body.innerText.substring(0, 1000));
        console.log("Page Body Snippet:", html);

        // Check for common link patterns anyway
        const allLinks = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a')).slice(0, 50).map(a => a.href).filter(h => h.includes('opportunities/jobs'));
        });
        console.log("Found opportunities/jobs links anywhere on page:", allLinks.slice(0, 5));
    }

    // Check freshness for each
    const analysis = extractedJobs.map(job => ({
        title: job.title,
        company: job.company,
        isFresh: isFresh(job.details),
        detailsSnippet: job.details.substring(0, 100).replace(/\n/g, ' ')
    }));

    console.log("Job Analysis (Freshness):");
    console.table(analysis);

    await browser.close();
})();
