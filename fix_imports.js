const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/app/sales/customer-payments/page.tsx');
let content = fs.readFileSync(file, 'utf8');

// Replace wrong PanelGrid import
content = content.replace(
    'import { PanelGrid, PanelGridTable, PanelGridThead, PanelGridTh, PanelGridTfoot } from "@/components/layout/PanelGrid";',
    `import PanelGrid from "@/components/ui/PanelGrid";
import { PanelGridTable, PanelGridThead, PanelGridTh, PanelGridTbody, PanelGridTr, PanelGridTd, PanelGridTfoot } from "@/components/ui/PanelGridTable";`
);

fs.writeFileSync(file, content);
console.log('Fixed imports');
