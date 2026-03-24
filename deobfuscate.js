const fs = require('fs');

try {
    const content = fs.readFileSync('lokermedan-js.js', 'utf8');

    // The script starts with eval(function(p,a,c,k,e,d)...
    // We can replace eval with console.log to see the deobfuscated code
    if (content.startsWith('eval(')) {
        const deobfuscatedCode = content.replace(/^eval\(/, 'console.log(');

        // Write the modified code to a temporary file
        fs.writeFileSync('temp_eval.js', deobfuscatedCode);

        console.log("Ready to evaluate.");
    } else {
        console.log("Not an eval-obfuscated script.");
    }
} catch (e) {
    console.error(e);
}
