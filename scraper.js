require('dotenv').config();
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const axios = require('axios');

puppeteer.use(StealthPlugin());

const TARGET_URLS = [
    // Previous target
    "https://glints.com/id/opportunities/jobs/explore?keyword=admin&country=ID&locationId=a6f7a20f-7172-4436-a418-afc91020ba0f&locationName=Medan%2C+Sumatera+Utara&lowestLocationLevel=3&sortBy=LATEST",
    
    // Glints
    "https://glints.com/id/opportunities/jobs/explore?keyword=Cleaning+Service&country=ID&locationId=a6f7a20f-7172-4436-a418-afc91020ba0f&locationName=Medan%2C+Sumatera+Utara&lowestLocationLevel=3&sortBy=LATEST",
    "https://glints.com/id/opportunities/jobs/explore?keyword=officeboy&country=ID&locationId=a6f7a20f-7172-4436-a418-afc91020ba0f&locationName=Medan%2C+Sumatera+Utara&lowestLocationLevel=3&sortBy=LATEST",
    "https://glints.com/id/opportunities/jobs/explore?keyword=Waiter%2FWaiters&country=ID&locationId=a6f7a20f-7172-4436-a418-afc91020ba0f&locationName=Medan%2C+Sumatera+Utara&lowestLocationLevel=3&sortBy=LATEST",
    "https://glints.com/id/opportunities/jobs/explore?keyword=Steward&country=ID&locationId=a6f7a20f-7172-4436-a418-afc91020ba0f&locationName=Medan%2C+Sumatera+Utara&lowestLocationLevel=3&sortBy=LATEST",
    "https://glints.com/id/opportunities/jobs/explore?keyword=Digital+Marketing&country=ID&locationId=a6f7a20f-7172-4436-a418-afc91020ba0f&locationName=Medan%2C+Sumatera+Utara&lowestLocationLevel=3&sortBy=LATEST",
    "https://glints.com/id/opportunities/jobs/explore?keyword=Media+sosial&country=ID&locationId=a6f7a20f-7172-4436-a418-afc91020ba0f&locationName=Medan%2C+Sumatera+Utara&lowestLocationLevel=3&sortBy=LATEST",
    "https://glints.com/id/opportunities/jobs/explore?keyword=server&country=ID&locationId=a6f7a20f-7172-4436-a418-afc91020ba0f&locationName=Medan%2C+Sumatera+Utara&lowestLocationLevel=3&sortBy=LATEST",

    // KitaLulus
    "https://www.kitalulus.com/lowongan/provinsi/sumatra-utara?job_specializations=IT",
    "https://www.kitalulus.com/lowongan/provinsi/sumatra-utara?keyword=admin",

    // Pintarnya
    "https://pintarnya.com/q-cleaning-service-l-kota-medan-lowongan?sort=-recommend&search=cleaning+service&city_id=45&province_id=-1",
    "https://pintarnya.com/q-admin-l-kota-medan-lowongan?search=admin&city_id=45&province_id=-1&latitude=3.59154&longitude=98.6693&from=Search+Bar&sort=-recommend",
    "https://pintarnya.com/q-office-boy-l-kota-medan-lowongan?search=office+boy&city_id=45&province_id=-1&latitude=3.59154&longitude=98.6693&from=Search+Bar&sort=-recommend",
    "https://pintarnya.com/q-kurir-l-kota-medan-lowongan?search=kurir&city_id=45&province_id=-1&latitude=3.59154&longitude=98.6693&from=Search+Bar&sort=-recommend",
    "https://pintarnya.com/q-gudang-l-kota-medan-lowongan?search=gudang&city_id=45&province_id=-1&from=Search+Bar&latitude=3.59154&longitude=98.6693&sort=-recommend",
    "https://pintarnya.com/q-part-time-l-kota-medan-lowongan?search=part+time&city_id=45&province_id=-1&from=Search+Bar&latitude=3.59154&longitude=98.6693&sort=-recommend",
    "https://pintarnya.com/q-operator-produksi-l-kota-medan-lowongan?search=operator+produksi&city_id=45&province_id=-1&from=Search+Bar&latitude=3.59154&longitude=98.6693&sort=-recommend",

    // JobStreet
    "https://id.jobstreet.com/id/Cleaning-Service-jobs/in-Medan-Sumatera-Utara?sortmode=ListedDate",
    "https://id.jobstreet.com/id/waiter-jobs/in-Medan-Sumatera-Utara?sortmode=ListedDate",
    "https://id.jobstreet.com/id/steward-jobs/in-Medan-Sumatera-Utara?sortmode=ListedDate",
    "https://id.jobstreet.com/id/office-boy-jobs/in-Medan-Sumatera-Utara?sortmode=ListedDate",
    "https://id.jobstreet.com/id/manager-produksi-jobs/in-Medan-Sumatera-Utara?sortmode=ListedDate",
    "https://id.jobstreet.com/id/gudang-jobs/in-Medan-Sumatera-Utara?sortmode=ListedDate",
    "https://id.jobstreet.com/id/staff-jobs/in-Medan-Sumatera-Utara?sortmode=ListedDate",
    "https://id.jobstreet.com/id/Administrasi-jobs/in-Medan-Sumatera-Utara?sortmode=ListedDate",

    // Tambahan baru (Guru & Siduta)
    "https://id.jobstreet.com/id/Guru-jobs/in-Medan-Sumatera-Utara?sortmode=ListedDate",
    "https://glints.com/id/opportunities/jobs/explore?keyword=guru&country=ID&locationId=a6f7a20f-7172-4436-a418-afc91020ba0f&locationName=Medan%2C+Sumatera+Utara&lowestLocationLevel=3&sortBy=LATEST",
    "https://siduta.medan.go.id/main/job_vacancy"
];

const BLACKLIST_COMPANIES = ["PT ALFA SCORPII", "ALFA SCORPII"];

// Helper to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const MAX_NOTIFICATIONS_PER_RUN = 1000; // Increased to ensure no jobs are missed

// Helper to check freshness (max 7 days)
function isFresh(text) {
    if (!text) return false;
    const lower = text.toLowerCase();

    // "Baru saja", "menit yang lalu", "jam yang lalu" -> Always fresh
    if (lower.includes("baru saja") || lower.includes("menit") || lower.includes("jam") || lower.includes("just now") || lower.includes("minutes") || lower.includes("hours")) {
        return true;
    }

    // Check for short format like "2h ago", "10m ago"
    if (lower.match(/\d+\s*(h|m)\b\s*ago/)) {
        return true;
    }

    // Check days
    // Matches "1 hari", "2 days", "3 hari yang lalu", "2d ago", etc.
    const dayMatch = lower.match(/(\d+)\s*(hari|day|d\s*ago)/);
    if (dayMatch) {
        const days = parseInt(dayMatch[1]);
        return days <= 7; // Limit 7 days
    }

    // "1 minggu" or "1 week" -> Exactly 7 days, so keep it
    if (lower.includes("1 minggu") || lower.includes("1 week") || lower.match(/\b1w\s*ago/)) {
        return true;
    }

    // "minggu" (more than 1) or "bulan" -> Old
    if (lower.includes("minggu") || lower.includes("week") || lower.includes("bulan") || lower.includes("month") || lower.match(/\d+\s*(w|mo)\b\s*ago/)) {
        return false;
    }

    return false; // Strict default
}

// Notifications have been removed

const fs = require('fs');
const HISTORY_FILE = 'processed_jobs.json';

(async () => {
    console.log("Starting Scraper...");
    const browser = await puppeteer.launch({
        headless: "new",
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null, // Use CI path or default
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    let processedJobs = new Map(); // Map<id, {id, title, company, firstSeen, lastSeen, seenCount, lastNotified}>

    // Load history (backward compatible with old string array format)
    if (fs.existsSync(HISTORY_FILE)) {
        try {
            const data = fs.readFileSync(HISTORY_FILE, 'utf8');
            const json = JSON.parse(data);
            for (const item of json) {
                if (typeof item === 'string') {
                    // Old format: just a string ID
                    const id = item.toLowerCase().trim();
                    processedJobs.set(id, {
                        id,
                        title: '',
                        company: '',
                        firstSeen: new Date().toISOString(),
                        lastSeen: new Date().toISOString(),
                        seenCount: 1,
                        lastNotified: new Date().toISOString()
                    });
                } else if (item && item.id) {
                    // New format: object with metadata
                    processedJobs.set(item.id, item);
                }
            }
            console.log(`Loaded ${processedJobs.size} processed jobs from history.`);
        } catch (e) {
            console.error("Error reading history file:", e.message);
        }
    }

    try {
        const page = await browser.newPage();
        // Set a realistic user agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        let allNewJobsToNotify = [];

        for (const url of TARGET_URLS) {
            console.log(`Scraping: ${url}`);
            try {
                await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
                await delay(2000); // Wait for content to settle

                let jobs = [];

                if (url.includes('glints.com')) {
                    // --- GLINTS SCRAPING LOGIC ---
                    console.log("Detected Glints URL");
                    // Scroll down to trigger lazy loading
                    await page.evaluate(async () => {
                        await new Promise((resolve) => {
                            let totalHeight = 0;
                            const distance = 100;
                            const timer = setInterval(() => {
                                const scrollHeight = document.body.scrollHeight;
                                window.scrollBy(0, distance);
                                totalHeight += distance;

                                if (totalHeight >= scrollHeight - window.innerHeight || totalHeight > 5000) { // Limit scroll
                                    clearInterval(timer);
                                    resolve();
                                }
                            }, 100);
                        });
                    });

                    await delay(2000);

                    // Extract Job Cards
                    jobs = await page.evaluate(() => {
                        const extracted = [];
                        // Primary anchor: Job Title Link
                        const jobLinks = document.querySelectorAll('a[href*="/opportunities/jobs/"]');

                        jobLinks.forEach(link => {
                            let container = link.closest('div[class*="JobCard"]');
                            if (!container) {
                                container = link.parentElement?.parentElement?.parentElement?.parentElement;
                            }

                            if (!container) return;

                            const companyEl = container.querySelector('a[href*="/companies/"]');
                            let companyName = '';
                            
                            // Primary: get full text from company link
                            if (companyEl) {
                                companyName = companyEl.textContent.trim();
                            }
                            
                            // Fallback: search all text nodes for something that looks like a company name
                            if (!companyName || companyName.length < 3) {
                                const allText = container.querySelectorAll('span, div, p, a');
                                for (const el of allText) {
                                    const txt = el.textContent.trim();
                                    // Skip the job title itself, dates, locations, salary
                                    if (txt === link.textContent.trim()) continue;
                                    if (txt.length < 3 || txt.length > 120) continue;
                                    if (/^\d|ago|lalu|hari|jam|menit|Rp|IDR|Gaji|tahun|bulan/i.test(txt)) continue;
                                    // Look for company-like patterns: PT, CV, multi-word capitalized, etc.
                                    if (/^(PT|CV|UD|Yayasan|Koperasi)\b/i.test(txt) || 
                                        (txt.split(' ').length >= 2 && /^[A-Z]/.test(txt) && el.children.length === 0)) {
                                        companyName = txt;
                                        break;
                                    }
                                }
                            }
                            
                            // Last resort fallback
                            if (!companyName || companyName.length < 3) {
                                const lines = container.innerText.split('\n').filter(l => l.trim().length > 3);
                                // Skip first line (usually title), pick next substantial line
                                for (let i = 1; i < lines.length; i++) {
                                    const line = lines[i].trim();
                                    if (line === link.textContent.trim()) continue;
                                    if (/^\d|ago|lalu|hari|jam|menit|Rp|IDR/i.test(line)) continue;
                                    if (line.length >= 3 && line.length <= 100) {
                                        companyName = line;
                                        break;
                                    }
                                }
                            }
                            
                            if (!companyName) companyName = "Unknown Company";

                            if (link && companyName) {
                                extracted.push({
                                    title: link.innerText,
                                    company: companyName,
                                    link: link.href,
                                    details: container.innerText
                                });
                            }
                        });

                        // Filter duplicates
                        const unique = [];
                        const seen = new Set();
                        extracted.forEach(item => {
                            if (!seen.has(item.link)) {
                                seen.add(item.link);
                                unique.push(item);
                            }
                        });
                        return unique;
                    });

                } else if (url.includes('jobstreet')) {
                    // --- JOBSTREET SCRAPING LOGIC ---
                    console.log("Detected JobStreet URL");

                    // JobStreet Infinite Scroll (Simple)
                    await page.evaluate(async () => {
                        await new Promise((resolve) => {
                            let totalHeight = 0;
                            const distance = 300;
                            let retries = 0;
                            const timer = setInterval(() => {
                                const scrollHeight = document.body.scrollHeight;
                                window.scrollBy(0, distance);
                                totalHeight += distance;

                                if (totalHeight >= scrollHeight || totalHeight > 10000) {
                                    clearInterval(timer);
                                    resolve();
                                }
                            }, 200);
                        });
                    });

                    await delay(3000);

                    jobs = await page.evaluate(() => {
                        const extracted = [];
                        // JobStreet uses <article> for job cards usually
                        const articles = document.querySelectorAll('article');

                        articles.forEach(article => {
                            const titleEl = article.querySelector('[data-automation="jobTitle"]');
                            const companyEl = article.querySelector('[data-automation="jobCompany"]');
                            const dateEl = article.querySelector('[data-automation="jobListingDate"]');
                            const locationEl = article.querySelector('[data-automation="jobLocation"]');
                            const linkEl = article.querySelector('a[data-automation="jobTitle"]') || article.querySelector('a[href*="/job/"]');

                            if (titleEl && linkEl) {
                                extracted.push({
                                    title: titleEl.innerText,
                                    company: companyEl ? companyEl.innerText : "Unknown Info",
                                    link: linkEl.href,
                                    // Combine text for context
                                    details: `${titleEl.innerText}\n${companyEl ? companyEl.innerText : ''}\n${locationEl ? locationEl.innerText : ''}\n${dateEl ? dateEl.innerText : ''}`
                                });
                            }
                        });

                        // Filter duplicates
                        const unique = [];
                        const seen = new Set();
                        extracted.forEach(item => {
                            if (!seen.has(item.link)) {
                                seen.add(item.link);
                                unique.push(item);
                            }
                        });
                        return unique;
                    });
                } else if (url.includes('lokermedan.co.id')) {
                    // --- LOKERMEDAN SCRAPING LOGIC ---
                    console.log("Detected LokerMedan URL");
                    await delay(3000);

                    jobs = await page.evaluate(() => {
                        const extracted = [];
                        const links = Array.from(document.querySelectorAll('a'))
                            .map(a => a.getAttribute('href')) // Get raw href, not absolute yet
                            .filter(href => href && href.includes('-loker-') && href.endsWith('.html') && !href.includes('whatsapp.com'));

                        // Use a Set to avoid processing same relative link twice
                        const uniqueHrefs = [...new Set(links)];

                        uniqueHrefs.forEach(href => {
                            // Find an anchor element that matches this href to extract title/details
                            const linkEl = document.querySelector(`a[href="${href}"]`);
                            if (!linkEl) return;

                            const title = linkEl.innerText.trim() || linkEl.title || "Unknown";

                            // Make URL absolute
                            const absoluteUrl = href.startsWith('http') ? href : `https://lokermedan.co.id/${href.replace('../', '').replace('./', '')}`;

                            if (title.length > 5 && title.toLowerCase() !== "selengkapnya" && title.toLowerCase() !== "apply") {
                                let details = "";
                                const container = linkEl.closest('.job-item, .card, .post, article, div[class*="item"], div[class*="col-"]');
                                if (container) {
                                    details = container.innerText.trim();
                                }

                                // Try to extract company from title "Loker [Title] [Company] ..."
                                let company = "LokerMedan";
                                const titleParts = title.split('-');
                                if (titleParts.length > 1) {
                                    company = titleParts[titleParts.length - 1].trim(); // Usually company or location is at the end
                                }

                                extracted.push({
                                    title: title,
                                    company: company,
                                    link: absoluteUrl,
                                    details: details || title
                                });
                            }
                        });

                        // Filter duplicates
                        const unique = [];
                        const seen = new Set();
                        extracted.forEach(item => {
                            if (!seen.has(item.link)) {
                                seen.add(item.link);
                                unique.push(item);
                            }
                        });
                        return unique;
                    });
                } else if (url.includes('loker.id')) {
                    // --- LOKER.ID SCRAPING LOGIC ---
                    console.log("Detected Loker.id URL");
                    await delay(3000);

                    jobs = await page.evaluate(() => {
                        const extracted = [];
                        // Loker.id job links end with .html and contain category paths
                        const allLinks = Array.from(document.querySelectorAll('a[href$=".html"]'));

                        const jobLinks = allLinks.filter(a => {
                            const href = a.getAttribute('href') || '';
                            // Job detail links have pattern: /category/subcategory/job-title-company-city.html
                            const parts = href.replace(/^\//, '').split('/');
                            return parts.length >= 3 && href.endsWith('.html') && !href.includes('tentang-kami') && !href.includes('kebijakan');
                        });

                        const uniqueHrefs = [...new Set(jobLinks.map(a => a.getAttribute('href')))];

                        uniqueHrefs.forEach(href => {
                            const linkEl = document.querySelector(`a[href="${href}"]`);
                            if (!linkEl) return;

                            const title = linkEl.innerText.trim() || linkEl.title || "Unknown";
                            if (title.length <= 3 || title.toLowerCase() === 'rincian' || title.toLowerCase() === 'selengkapnya') return;

                            // Make URL absolute
                            const absoluteUrl = href.startsWith('http') ? href : `https://www.loker.id${href.startsWith('/') ? '' : '/'}${href}`;

                            // Extract company from container text or title
                            let company = "";
                            
                            // Strategy 1: Look for company name in container text (often has PT/CV prefix)
                            if (container) {
                                const containerText = container.innerText || '';
                                const lines = containerText.split('\n').filter(l => l.trim().length > 3);
                                for (const line of lines) {
                                    const trimmed = line.trim();
                                    if (trimmed === title) continue; // skip title
                                    if (/^(PT|CV|UD|Yayasan)\b/i.test(trimmed)) {
                                        company = trimmed;
                                        break;
                                    }
                                }
                                // If no PT/CV found, look for any line that looks like a company
                                if (!company) {
                                    for (const line of lines) {
                                        const trimmed = line.trim();
                                        if (trimmed === title) continue;
                                        if (trimmed.length < 4 || trimmed.length > 100) continue;
                                        if (/lokasi|gaji|apply|selengkap|rincian|^\d/i.test(trimmed)) continue;
                                        // Multi-word, starts with capital = likely company
                                        if (trimmed.split(' ').length >= 2 && /^[A-Z]/.test(trimmed)) {
                                            company = trimmed;
                                            break;
                                        }
                                    }
                                }
                            }
                            
                            // Strategy 2: Extract from URL slug as fallback
                            if (!company) {
                                const slug = href.split('/').pop().replace('.html', '');
                                // Loker.id slugs: job-title-pt-company-name-city
                                const ptMatch = slug.match(/-(pt|cv|ud)-(.+?)-(medan|sumatera|indonesia|jakarta|bandung)/i);
                                if (ptMatch) {
                                    company = (ptMatch[1] + ' ' + ptMatch[2]).replace(/-/g, ' ');
                                    company = company.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                                } else {
                                    // Fallback: use everything after the last known title word
                                    company = "Loker.id";
                                }
                            }

                            // Try to get details from parent container
                            let details = "";
                            const container = linkEl.closest('.card, .job-item, article, div[class*="item"], div[class*="col"], div[class*="list"], tr, li');
                            if (container) {
                                details = container.innerText.trim();
                            }

                            extracted.push({
                                title: title,
                                company: company,
                                link: absoluteUrl,
                                details: details || title
                            });
                        });

                        // Filter duplicates
                        const unique = [];
                        const seen = new Set();
                        extracted.forEach(item => {
                            if (!seen.has(item.link)) {
                                seen.add(item.link);
                                unique.push(item);
                            }
                        });
                        return unique;
                    });
                }

                if (jobs.length === 0) {
                    console.log(`No jobs found on ${url}`);
                }

                console.log(`Found ${jobs.length} jobs on this page.`);

                for (const job of jobs) {
                    const uniqueId = `${job.title.trim().toLowerCase()}-${job.company.trim().toLowerCase()}`;
                    const now = new Date();
                    const existingJob = processedJobs.get(uniqueId);

                    if (existingJob) {
                        // Job sudah pernah diproses — update lastSeen saja (tidak kirim notifikasi lagi)
                        existingJob.lastSeen = now.toISOString();
                        existingJob.seenCount += 1;
                        console.log(`Skipped (Duplicate/Repost): ${job.title} at ${job.company}`);
                        continue;
                    } else {
                        // Job baru — proses seperti biasa

                        // 0. DATE Filter
                        if (!isFresh(job.details) && !job.link.includes('lokermedan.co.id') && !job.link.includes('loker.id')) {
                            console.log(`Skipped (Old/No Date): ${job.title} - ${job.company}`);
                            continue;
                        }

                        // 1. Hard Filter
                        if (BLACKLIST_COMPANIES.some(b => job.company.toUpperCase().includes(b))) {
                            console.log(`Skipped (Blacklisted): ${job.company}`);
                            continue;
                        }

                        // Simpan ke history sebagai job baru
                        processedJobs.set(uniqueId, {
                            id: uniqueId,
                            title: job.title.trim(),
                            company: job.company.trim(),
                            firstSeen: now.toISOString(),
                            lastSeen: now.toISOString(),
                            seenCount: 1,
                            lastNotified: now.toISOString()
                        });

                        // Check if it's an IT job based on title
                        // Comprehensive IT Keywords (Software, Infra, Hardware, Data, Creative/Digital)
                        const itKeywords = [
                            'IT', 'Programmer', 'Developer', 'Software', 'Frontend', 'Backend', 'Fullstack',
                            'Data', 'Network', 'Networking', 'Jaringan', 'System', 'DevOps', 'Cloud', 'AWS', 'Azure',
                            'UI', 'UX', 'Web', 'Mobile', 'Android', 'iOS', 'Flutter', 'React', 'Node', 'PHP', 'Laravel',
                            'WordPress', 'CMS', 'SEO', 'Hardware', 'Teknisi Komputer', 'Computer', 'Support', 'Helpdesk',
                            'CCTV', 'Infrastruktur', 'Information Technology', 'Security', 'Cyber', 'QA', 'Tester', 'Game'
                        ].join('|');
                        job.isItJob = new RegExp(itKeywords, 'i').test(job.title);

                        allNewJobsToNotify.push(job);
                        console.log(`Added to notification queue: ${job.title} at ${job.company}`);
                    }
                }

            } catch (err) {
                console.error(`Error scraping ${url}:`, err.message);
            }

            await delay(3000); // Wait between pages
        }

        if (allNewJobsToNotify.length === 0) {
            console.log("No new jobs found in this run.");
        } else {
            // --- FETCH FULL JOB DESCRIPTIONS ---
            console.log(`Fetching full HTML descriptions for ${allNewJobsToNotify.length} new jobs...`);
            for (let i = 0; i < allNewJobsToNotify.length; i++) {
                const job = allNewJobsToNotify[i];
                try {
                    const detailPage = await browser.newPage();
                    // Speed up loading by aborting images/fonts
                    await detailPage.setRequestInterception(true);
                    detailPage.on('request', (req) => {
                        if(req.resourceType() === 'image' || req.resourceType() === 'font' || req.resourceType() === 'stylesheet'){
                            req.abort();
                        } else {
                            req.continue();
                        }
                    });
                    
                    await detailPage.goto(job.link, { waitUntil: 'domcontentloaded', timeout: 30000 });
                    await delay(2000); // give SPA time to render
                    
                    let fullDescHtml = await detailPage.evaluate(() => {
                        let el = document.querySelector('[data-automation="jobDescription"]');
                        if (el) return el.innerHTML;
                        
                        el = document.querySelector('div[class*="JobDescription"]');
                        if (el) return el.innerHTML;
                        
                        el = document.querySelector('.job-description');
                        if (el) return el.innerHTML;
                        
                        el = document.querySelector('.entry-content');
                        if (!el) el = document.querySelector('.post-content');
                        if (el) return el.innerHTML;
                        
                        return null;
                    });
                    
                    if (fullDescHtml && fullDescHtml.trim().length > 50) {
                        job.details = fullDescHtml.trim();
                    }
                    await detailPage.close();
                } catch (err) {
                    console.log(`Failed to fetch full description for ${job.title}: ${err.message}`);
                }
            }

            // --- SEND TO MEDANKERJA API ---
            try {
                console.log("Sending jobs to MedanKerja API...");
                // Note: Using medankerja.test as Laragon default hostname. Modify if using localhost/medankerja
                const apiUrl = "http://medankerja.test/api/import_jobs.php?token=medanjobs_scraper_secret_2024";
                const apiRes = await axios.post(apiUrl, allNewJobsToNotify);
                console.log("MedanKerja Import Result:", apiRes.data);
            } catch (err) {
                console.error("Failed to send to MedanKerja:", err.message);
            }
        }

    } catch (error) {
        console.error("Fatal Error:", error);
    } finally {
        await browser.close();

        // Save history (Limit to last 1000 to prevent infinite growth)
        try {
            const historyArray = Array.from(processedJobs.values()).slice(-1000);
            fs.writeFileSync(HISTORY_FILE, JSON.stringify(historyArray, null, 2));
            console.log("Updated job history saved.");
        } catch (e) {
            console.error("Error saving history:", e.message);
        }

        console.log("Scraper finished.");
    }
})();
