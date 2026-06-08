const fs = require('fs');
const path = require('path');

const dir = 'C:\\EIS-Data\\AppSmith\\Antigravity\\FOS_VFP_Original\\Masters';
const files = fs.readdirSync(dir);

const results = [];

files.forEach(file => {
    if (file.toLowerCase().includes('freights') || file.toLowerCase().includes('cities') || file.toLowerCase().includes('seasons') || file.toLowerCase().includes('airlines')) {
        const filePath = path.join(dir, file);
        try {
            const content = fs.readFileSync(filePath, 'binary');
            // Extract printable strings of length >= 4
            const strings = content.match(/[\x20-\x7E]{10,}/g) || [];
            
            strings.forEach(s => {
                if (s.toLowerCase().includes('sp_flower') || s.toLowerCase().includes('insert into') || s.toLowerCase().includes('delete from') || s.toLowerCase().includes('sqlexec')) {
                    results.push({ file, text: s.trim() });
                }
            });
        } catch (e) {
            console.error(`Error reading ${file}: ${e.message}`);
        }
    }
});

console.log(JSON.stringify(results, null, 2));
