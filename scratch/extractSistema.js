const fs = require('fs');
const path = require('path');

const dir = 'C:\\EIS-Data\\AppSmith\\Antigravity\\FOS_VFP_Original\\Sistema';
if (!fs.existsSync(dir)) {
    console.log("No Sistema folder found.");
    process.exit(0);
}
const files = fs.readdirSync(dir);
const results = [];

files.forEach(file => {
    if (file.toLowerCase().includes('usuario')) {
        const filePath = path.join(dir, file);
        try {
            const content = fs.readFileSync(filePath, 'binary');
            const strings = content.match(/[\x20-\x7E]{10,}/g) || [];
            strings.forEach(s => {
                if (s.toLowerCase().includes('sp_') || s.toLowerCase().includes('insert into') || s.toLowerCase().includes('delete from') || s.toLowerCase().includes('sqlexec')) {
                    results.push({ file, text: s.trim() });
                }
            });
        } catch (e) {}
    }
});
console.log(JSON.stringify(results, null, 2));
