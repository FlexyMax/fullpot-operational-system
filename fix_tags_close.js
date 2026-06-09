const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/app/sales/customer-payments/page.tsx');
let content = fs.readFileSync(file, 'utf8');

// Fix unreplaced </tfoot>
content = content.replace(/<\/tfoot>/g, '</PanelGridTfoot>');

fs.writeFileSync(file, content);
console.log('Fixed closing tags');
