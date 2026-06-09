const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/app/sales/customer-payments/components');
const files = fs.readdirSync(dir);

for (const file of files) {
    if (file === 'Shared.tsx') continue;
    
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    const name = file.replace('.tsx', '');
    if (!content.includes(`export default ${name}`)) {
        content += `\nexport default ${name};\n`;
        fs.writeFileSync(filePath, content);
    }
}
console.log('Added exports');
