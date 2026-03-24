const fs = require('fs');

const html = fs.readFileSync('rendered_lokermedan.html', 'utf8');

// The links might not have quotes around them, or be single quoted
// Let's use a robust regex
const regex = /href=['"]?([^'"\s>]+-loker-[^'"\s>]+\.html)['"]?/g;

let match;
const links = new Set();
while ((match = regex.exec(html)) !== null) {
    if (!match[1].includes('whatsapp.com')) {
        links.add(match[1]);
    }
}

console.log(`Found ${links.size} unique job links in rendered HTML:`);
console.log([...links]);
