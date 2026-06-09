const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/app/sales/customer-payments/components');
const files = fs.readdirSync(dir);

for (const file of files) {
    if (file === 'Shared.tsx') continue;
    
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes('EMPTY_ARR') && !content.includes('EMPTY_ARR,')) {
        content = content.replace(
            'import { Modal, Btn, t, fmt, fmtDate, today, cpFetch } from "./Shared";',
            'import { Modal, Btn, t, fmt, fmtDate, today, cpFetch, EMPTY_ARR } from "./Shared";'
        );
        fs.writeFileSync(filePath, content);
    }
}
console.log('Fixed EMPTY_ARR imports');
