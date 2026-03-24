const fs = require('fs');
const html = fs.readFileSync('debug_lokermedan.html', 'utf8');
const links = html.match(/href="([^"]+-loker-[^"]+\.html)"/g);
if (links) {
    const cleanLinks = links.map(l => l.replace('href="', '').replace('"', ''));
    console.log([...new Set(cleanLinks)]);
} else {
    console.log("No links found");
}
