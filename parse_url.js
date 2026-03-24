const fs = require('fs');
const content = fs.readFileSync('deobfuscated.js', 'utf8');
const regex = /url:\s*['"]([^'"]+)['"]/g;
let match;
const urls = new Set();
while ((match = regex.exec(content)) !== null) {
    urls.add(match[1]);
}
console.log([...urls]);
