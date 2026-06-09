const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/app/sales/customer-payments/page.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Setup store
content = content.replace(
    'const [activeTab,     setActiveTab]     = useState<"customer"|"invoices"|"payments"|"crdb"|"statement"|"corporate">("customer");',
    `const store = useCustomerPaymentsStore();
    const activeTab = store.activeTab;
    const setActiveTab = store.setActiveTab;`
);

content = content.replace(
    'const [custSearch,    setCustSearch]    = useState("");',
    `const custSearch = store.customerSearch;
    const setCustSearch = store.setCustomerSearch;`
);

content = content.replace(
    'const [custBalance,   setCustBalance]   = useState<"A"|"B"|"N">("A"); // A=All, B=Bal>0, N=Bal=0',
    `const custBalance = store.customerFilterMode;
    const setCustBalance = store.setCustomerFilterMode;`
);

// We still need local state for the Objects like selCustomer, but wait, the store holds UQs!
// To not break everything, I'll keep selCustomer object but sync it with store if needed, OR just leave it as local state since the request only said "Poner el estado con zustand" meaning the main UI state.
// Actually, let's keep selCustomer local, but add activeGrid for MobileActionBar.
content = content.replace(
    'const [payingAll,     setPayingAll]     = useState(false);',
    `const [payingAll,     setPayingAll]     = useState(false);
    const activeGrid = store.activeGrid;`
);

// 2. Tabs styling
content = content.replace(
    /const TAB_COLORS: Record<string, string> = {.*};/,
    `const TAB_COLORS: Record<string, string> = { customer:"text-gray-500 hover:text-gray-700 hover:bg-gray-50", invoices:"text-gray-500 hover:text-gray-700 hover:bg-gray-50", payments:"text-gray-500 hover:text-gray-700 hover:bg-gray-50", crdb:"text-gray-500 hover:text-gray-700 hover:bg-gray-50", statement:"text-gray-500 hover:text-gray-700 hover:bg-gray-50", corporate:"text-gray-500 hover:text-gray-700 hover:bg-gray-50" };`
);
content = content.replace(
    /const TAB_ACTIVE = ".*";/,
    `const TAB_ACTIVE = "bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm";`
);
content = content.replace(
    /<div className="h-10 bg-\[#374151\] flex items-end px-2 gap-0\.5 shrink-0 overflow-x-auto scrollbar-none">/,
    `<div className="h-12 bg-white flex items-end px-4 gap-2 shrink-0 overflow-x-auto scrollbar-none border-b border-gray-200">`
);

// 3. Grid Tables replacement
// This is a bit tricky, but we can replace the HTML tags with PanelGridTable tags
content = content.replace(/<table className="min-w-full text-left">/g, '<PanelGridTable>');
content = content.replace(/<\/table>/g, '</PanelGridTable>');

content = content.replace(/<thead className="bg-gray-100 border-b border-gray-200 text-gray-700 sticky top-0 z-10">/g, '<PanelGridThead>');
content = content.replace(/<thead className="bg-gray-100 border-b fos-grid-thead text-gray-700 sticky top-0">/g, '<PanelGridThead>');
content = content.replace(/<thead className="bg-gray-100 border-b border-gray-200 fos-grid-thead text-gray-700 sticky top-0">/g, '<PanelGridThead>');
content = content.replace(/<\/thead>/g, '</PanelGridThead>');

content = content.replace(/<tbody className="divide-y divide-gray-100 fos-grid-tbody">/g, '<tbody>');
content = content.replace(/<tbody className="fos-grid-tbody divide-y divide-gray-100">/g, '<tbody>');
// Actually, PanelGridTbody is not standard, we just use <tbody>.

content = content.replace(/<tr className="fos-grid-thead">/g, '<tr>');
content = content.replace(/<tr className="fos-grid-thead text-gray-700">/g, '<tr>');

content = content.replace(/<th key=\{h\} className="p-2 border-r border-gray-200 last:border-r-0 whitespace-nowrap">\{h\}<\/th>/g, '<PanelGridTh key={h}>{h}</PanelGridTh>');
content = content.replace(/<th key=\{h\} className="p-2 border-r border-gray-200 last:border-r-0">\{h\}<\/th>/g, '<PanelGridTh key={h}>{h}</PanelGridTh>');

// 4. MobileActionBar insertion at the end
const mobileActionBar = `
            {/* ── Mobile Action Bar ────────────────────────────────────────── */}
            <MobileActionBar
                activeGrid={activeGrid}
                items={[
                    { grid: "customer", label: "Edit Cust", icon: Pencil, color: "orange", onClick: () => { if(selCustomer) setCustEditModal(true) }, disabled: !selCustomer || !perms.canEdit },
                    { grid: "customer", label: "Print All", icon: Printer, color: "gray", onClick: () => {}, disabled: !perms.canReport },
                    { grid: "invoices", label: "Apply Pay", icon: Plus, color: "green", onClick: () => { if(selInvoice && selIncome) setApplyModal({mode:"add"}) }, disabled: !selInvoice || !selIncome || !perms.canCreate },
                    { grid: "invoices", label: "Insert Cr/Db", icon: CreditCard, color: "blue", onClick: () => { if(selInvoice) setCrdbModal({mode:"add"}) }, disabled: !selInvoice || !perms.canCreate },
                    { grid: "payments", label: "Edit", icon: Pencil, color: "orange", onClick: () => { if(selIncome) setNewPayModal({mode:"edit", income:selIncome}) }, disabled: !selIncome || !perms.canEdit },
                    { grid: "payments", label: "Delete", icon: Trash2, color: "red", onClick: () => { if(selIncome) setNewPayModal({mode:"delete", income:selIncome}) }, disabled: !selIncome || !perms.canDelete },
                    { grid: "crdb", label: "Edit", icon: Pencil, color: "orange", onClick: () => { if(selCrDb) setCrdbModal({mode:"edit"}) }, disabled: !selCrDb || !perms.canEdit },
                    { grid: "crdb", label: "Delete", icon: Trash2, color: "red", onClick: () => { if(selCrDb) setCrdbModal({mode:"delete"}) }, disabled: !selCrDb || !perms.canDelete },
                ]}
            />
`;
content = content.replace('        </div>\n    );\n}', mobileActionBar + '\n        </div>\n    );\n}');

// 5. Replace alerts with toast
content = content.replace(/alert\(/g, 'toast.info(');

// Apply selectCustomer modifications to set activeGrid
content = content.replace(
    'const selectCustomer = (c: any) => {',
    `const selectCustomer = (c: any) => {
        store.setSelCustomerUq(c?.unico || null);`
);

content = content.replace(
    'onClick={()=>setSelInvoice(inv)}',
    'onClick={()=>{setSelInvoice(inv); store.setSelInvoiceUq(inv?.unico || null);}}'
);

content = content.replace(
    'onClick={()=>setSelIncome(inc)}',
    'onClick={()=>{setSelIncome(inc); store.setSelPaymentUq(inc?.unico || null);}}'
);

content = content.replace(
    'onClick={()=>setSelCrDb(cd)}',
    'onClick={()=>{setSelCrDb(cd); store.setSelCrdbUq(cd?.unico || null);}}'
);

// Overwrite file
fs.writeFileSync(file, content);
console.log('Done refactoring');
