const fs = require('fs');
const path = require('path');

const dir = 'C:\\EIS-Data\\AppSmith\\Antigravity\\FOS_VFP_Original\\System_management';
const files = fs.readdirSync(dir);
const results = new Set();

files.forEach(file => {
    const filePath = path.join(dir, file);
    try {
        const content = fs.readFileSync(filePath, 'binary');
        const matches = content.match(/sp_[a-zA-Z0-9_]+/gi) || [];
        matches.forEach(m => results.add(m.toLowerCase()));
    } catch (e) {}
});
console.log(Array.from(results).join('\n'));
