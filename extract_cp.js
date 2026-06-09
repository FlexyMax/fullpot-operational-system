const fs = require('fs');
const path = require('path');

const srcFile = path.join(__dirname, 'src/app/sales/customer-payments/page.tsx');
let content = fs.readFileSync(srcFile, 'utf8');

const modals = [
    { name: 'CustomerEditModal', regex: /\/\/\s*───\s*CustomerEditModal[\s\S]*?(?=\/\/\s*───\s*[A-Z])/ },
    { name: 'InvoiceSearchModal', regex: /\/\/\s*───\s*InvoiceSearchModal[\s\S]*?(?=\/\/\s*───\s*[A-Z])/ },
    { name: 'NewPaymentModal', regex: /\/\/\s*───\s*NewPaymentModal[\s\S]*?(?=\/\/\s*───\s*[A-Z])/ },
    { name: 'ApplyPaymentModal', regex: /\/\/\s*───\s*ApplyPaymentModal[\s\S]*?(?=\/\/\s*───\s*[A-Z])/ },
    { name: 'PendingInvoicesReportModal', regex: /\/\/\s*───\s*PendingInvoicesReportModal[\s\S]*?(?=\/\/\s*───\s*[A-Z])/ },
    { name: 'ApproveCreditModal', regex: /\/\/\s*───\s*ApproveCreditModal[\s\S]*?(?=\/\/\s*───\s*[A-Z])/ },
    { name: 'CashBackModal', regex: /\/\/\s*───\s*CashBackModal[\s\S]*?(?=\/\/\s*───\s*[A-Z])/ },
    { name: 'CrDbModal', regex: /\/\/\s*───\s*CrDbModal[\s\S]*?(?=\/\/\s*───\s*[A-Z])/ },
    { name: 'CrDbReportModal', regex: /\/\/\s*───\s*CrDbReportModal[\s\S]*?(?=\/\/\s*───\s*[A-Z])/ },
    { name: 'SalesmanSelectorModal', regex: /\/\/\s*───\s*SalesmanSelectorModal[\s\S]*?(?=\/\/\s*───\s*[A-Z])/ },
    { name: 'CutDateSelectorModal', regex: /\/\/\s*───\s*CutDateSelectorModal[\s\S]*?(?=\/\/\s*───\s*[A-Z])/ },
    { name: 'CorpPaymentModal', regex: /\/\/\s*───\s*CorpPaymentModal[\s\S]*?(?=\/\/\s*───\s*[A-Z])/ },
    { name: 'CorpInvoiceModal', regex: /\/\/\s*───\s*CorpInvoiceModal[\s\S]*?(?=\/\/\s*───\s*[A-Z])/ }
];

const componentsDir = path.join(__dirname, 'src/app/sales/customer-payments/components');
if (!fs.existsSync(componentsDir)) fs.mkdirSync(componentsDir, { recursive: true });

let importStatements = `import { useQuery } from "@tanstack/react-query";\nimport { useState, useEffect } from "react";\nimport { RefreshCcw, Save, Search, Trash2, CheckCircle, Users, FileText, Banknote, RotateCcw, Printer, Check, X, ChevronRight, DollarSign, CreditCard } from "lucide-react";\nimport { cn } from "@/lib/utils";\nimport { Modal, Btn, t, fmt, fmtDate, today, cpFetch } from "./Shared";\n\n`;

for (let m of modals) {
    const match = content.match(m.regex);
    if (match) {
        let modalCode = match[0];
        // clean up internal references
        const fileContent = importStatements + modalCode;
        fs.writeFileSync(path.join(componentsDir, `${m.name}.tsx`), fileContent);
        
        // Remove from main content
        content = content.replace(m.regex, `// Extracted ${m.name}\n`);
    }
}

// Write the main page backup
fs.writeFileSync(srcFile + '.bak', content);
console.log('Modals extracted. Review page.tsx.bak');
