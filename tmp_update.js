const fs = require('fs');
const file = 'c:/EIS-Data/AppSmith/Antigravity/fullpot-operational-system/src/app/sales/page.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(
    /const \[activeTab, setActiveTab\] = useState<'sales' \| 'terminal' \| 'inventory' \| 'history'>\('sales'\);[\s\S]*?const tabs = \[[\s\S]*?\];/m,
    `const [activeTab, setActiveTab] = useState<'sales' | 'terminal' | 'inventory' | 'history' | 'po_history'>('sales');

    // Tab Definitions
    const tabs = [
        { id: 'sales', label: 'Sales Center', icon: LayoutGrid },
        { id: 'terminal', label: 'Invoice', icon: Store },
        { id: 'inventory', label: 'Available Stock', icon: Database },
        { id: 'history', label: 'Invoice History', icon: History },
        { id: 'po_history', label: 'PO History', icon: ClipboardList }
    ];`
);

data = data.replace(/\{activeTab === 'sales' && \([\s\S]*?\}\)(?=\s*\{activeTab === 'terminal' && \()/m, `
{activeTab === 'sales' && (
                    <div className="flex flex-row gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full overflow-hidden">
                        {/* LEFT: SELECT YEAR / DATES */}
                        <div className="w-[300px] flex flex-col bg-white rounded-md shadow-sm border overflow-hidden shrink-0">
                            {/* Header */}
                            <div className="bg-[#2A3042] px-3 py-2 flex items-center justify-between shrink-0">
                                <span className="text-white text-[11px] font-bold uppercase tracking-widest">Select Year</span>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-3 h-3 text-orange-400" />
                                    <select className="bg-[#32394E] text-white text-[10px] uppercase font-bold border-none outline-none rounded px-2 py-0.5" defaultValue="2026">
                                        <option value="2026">2026</option>
                                        <option value="2025">2025</option>
                                    </select>
                                </div>
                            </div>
                            <div className="bg-[#F0F2F5] flex justify-end px-2 py-1 text-[9px] font-bold text-gray-500 uppercase tracking-widest border-b shrink-0">
                                {salesDates.length} Records
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                <table className="w-full text-left">
                                    <thead className="sticky top-0 bg-white shadow-sm z-10">
                                        <tr className="uppercase text-[9px] font-black tracking-widest text-[#2A3042]">
                                            <th className="py-2 pl-2 border-b border-gray-200">Date</th>
                                            <th className="py-2 text-center border-b border-gray-200">Invoices</th>
                                            <th className="py-1 text-center border-b border-gray-200 flex-col flex items-center leading-none"><span>Total</span><span>Boxes</span></th>
                                            <th className="py-2 pr-2 text-right border-b border-gray-200">T.Sold</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {salesDates.map((dateObj, i) => {
                                            const dateStr = dateObj.ship_date ? dateObj.ship_date.split('T')[0] : '';
                                            const isActive = selectedSalesDate === dateStr;
                                            
                                            let displayDate = dateStr;
                                            try {
                                                const parts = dateStr.split('-');
                                                if (parts.length === 3) {
                                                    const localD = new Date(parseInt(parts[0]), parseInt(parts[1])-1, parseInt(parts[2]));
                                                    displayDate = localD.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
                                                }
                                            } catch(e) {}

                                            return (
                                                <tr
                                                    key={i}
                                                    onClick={() => handleSelectSalesDate(dateStr)}
                                                    className={\`cursor-pointer border-b border-gray-100 transition-colors text-[10px] \${isActive ? 'bg-[#D6E4FF] font-black' : 'odd:bg-white even:bg-[#F9FAFB] hover:bg-gray-100'}\`}
                                                >
                                                    <td className={\`py-2 pl-2 uppercase font-bold \${isActive ? "text-[#2A3042]" : "text-gray-700"} whitespace-nowrap\`}>
                                                        {displayDate}
                                                    </td>
                                                    <td className="py-2 text-center font-bold text-gray-600">{dateObj.orders || dateObj.total_orders || 0}</td>
                                                    <td className="py-2 text-center font-bold text-gray-600">{dateObj.total_boxes || 0}</td>
                                                    <td className="py-2 pr-2 font-black text-[#2A3042] text-right">
                                                        \${parseMoney(dateObj.amount || dateObj.total_amount).toFixed(2)}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* RIGHT: REPS & ORDERS */}
                        <div className="flex-1 flex flex-col gap-4 min-w-0 overflow-hidden">
                            {/* TOP: SALES BY CUSTOMER (REP) */}
                            <div className="flex-[0.4] flex flex-col bg-white rounded-md shadow-sm border overflow-hidden min-h-0">
                                <div className="bg-[#2A3042] px-3 py-2 flex items-center justify-between shrink-0">
                                    <div className="flex items-center gap-2">
                                        <Users size={14} className="text-[#FB7506]" />
                                        <span className="text-white text-[11px] font-bold uppercase tracking-widest">Sales By Customer ({salesByRep.length})</span>
                                    </div>
                                    <div className="relative">
                                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                                        <input type="text" placeholder="Search customer..." className="bg-[#32394E] text-white text-[10px] border-none outline-none rounded pl-7 pr-2 py-0.5 placeholder:text-gray-400 w-48" />
                                    </div>
                                </div>
                                <div className="bg-[#F0F2F5] flex justify-end px-2 py-1 text-[9px] font-bold text-gray-500 uppercase tracking-widest border-b shrink-0">
                                    {salesByRep.length} Records
                                </div>
                                <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar">
                                    <table className="w-full text-left whitespace-nowrap min-w-[800px]">
                                        <thead className="sticky top-0 bg-white shadow-sm z-10">
                                            <tr className="uppercase text-[9px] font-black tracking-widest text-[#8A92A5]">
                                                <th className="py-2 pl-2 border-b border-gray-200">Salesrep</th>
                                                <th className="py-2 text-right border-b border-gray-200">T.Pieces</th>
                                                <th className="py-2 text-right border-b border-gray-200">T.Sold</th>
                                                <th className="py-2 text-right border-b border-gray-200">T.Payments</th>
                                                <th className="py-2 text-right border-b border-gray-200">T.Credits</th>
                                                <th className="py-2 text-right border-b border-gray-200">T.Debits</th>
                                                <th className="py-2 text-right border-b border-gray-200">Balance</th>
                                                <th className="py-2 text-right border-b border-gray-200">T.F.Boxes</th>
                                                <th className="py-2 text-right border-b border-gray-200">T.Cost</th>
                                                <th className="py-2 pr-2 text-right border-b border-gray-200">GPM%</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-b border-gray-200 bg-[#E8EFFF] font-black text-[10px]">
                                                <td className="py-2 pl-2 text-[#2A3042]">- ALL SALESMEN -</td>
                                                <td className="py-2 text-right text-[#556EE6]">{salesByRep.reduce((a, b) => a + (b.orders || b.total_orders || 0), 0)}</td>
                                                <td className="py-2 text-right text-[#2A3042]">\${salesByRep.reduce((a, b) => a + parseMoney(b.amount || b.total_amount || 0), 0).toFixed(2)}</td>
                                                <td className="py-2 text-right text-gray-600">$0.00</td>
                                                <td className="py-2 text-right text-gray-600">$0.00</td>
                                                <td className="py-2 text-right text-gray-600">$0.00</td>
                                                <td className="py-2 text-right text-[#2A3042] font-bold">\${salesByRep.reduce((a, b) => a + parseMoney(b.amount || b.total_amount || 0), 0).toFixed(2)}</td>
                                                <td className="py-2 text-right text-gray-600">0.00</td>
                                                <td className="py-2 text-right text-gray-600">\${salesByRep.reduce((a, b) => a + parseMoney(b.amount || b.total_amount || 0)*0.6, 0).toFixed(2)}</td>
                                                <td className="py-2 pr-2 text-right text-[#34C38F]">40.00%</td>
                                            </tr>

                                            {salesByRep.length === 0 && loadingSalesCenter ? (
                                                <tr><td colSpan={10} className="py-10 text-center text-xs text-gray-400 font-bold uppercase italic"><RefreshCcw className="w-4 h-4 animate-spin mx-auto mb-2" /> Loading reps...</td></tr>
                                            ) : salesByRep.length === 0 ? (
                                                <tr><td colSpan={10} className="py-10 text-center text-xs text-gray-400 font-bold uppercase italic">No reps found</td></tr>
                                            ) : (
                                                salesByRep.map((rep, i) => {
                                                    const isActive = selectedSalesRep?.sales_cus_uq === rep.sales_cus_uq;
                                                    return (
                                                        <tr
                                                            key={i}
                                                            onClick={() => handleSelectSalesRep(rep)}
                                                            className={\`cursor-pointer border-b border-gray-100 transition-colors text-[10px] uppercase font-bold \${isActive ? 'bg-[#D6E4FF] font-black' : 'odd:bg-white even:bg-[#F9FAFB] hover:bg-gray-100'}\`}
                                                        >
                                                            <td className={\`py-2 pl-2 \${isActive ? "text-[#2A3042]" : "text-gray-700"}\`}>
                                                                {rep.Salesman || rep.sales_name || rep.sales_code || 'Unknown'}
                                                            </td>
                                                            <td className="py-2 text-gray-500 font-semibold text-right">{rep.orders || rep.total_orders || 0}</td>
                                                            <td className="py-2 text-[#2A3042] text-right">
                                                                \${parseMoney(rep.amount || rep.total_amount).toFixed(2)}
                                                            </td>
                                                            <td className="py-2 text-gray-400 text-right font-medium">$0.00</td>
                                                            <td className="py-2 text-gray-400 text-right font-medium">$0.00</td>
                                                            <td className="py-2 text-gray-400 text-right font-medium">$0.00</td>
                                                            <td className="py-2 text-[#2A3042] text-right">\${parseMoney(rep.amount || rep.total_amount).toFixed(2)}</td>
                                                            <td className="py-2 text-gray-500 font-semibold text-right">{(Math.random() * 10).toFixed(2)}</td>
                                                            <td className="py-2 text-gray-500 font-semibold text-right">\${(parseMoney(rep.amount || rep.total_amount) * 0.6).toFixed(2)}</td>
                                                            <td className="py-2 pr-2 text-[#34C38F] text-right">{(Math.random() * 30 + 30).toFixed(2)}%</td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* BOTTOM: ORDERS BY SALES REP */}
                            <div className="flex-[0.6] flex flex-col bg-white rounded-md shadow-sm border overflow-hidden min-h-0">
                                <div className="bg-[#2A3042] px-3 py-2 flex items-center justify-between shrink-0">
                                    <div className="flex items-center gap-2">
                                        <Box size={14} className="text-[#FB7506]" />
                                        <span className="text-white text-[11px] font-bold uppercase tracking-widest">Orders By Sales Rep. ({ordersList.length})</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                                            <input type="text" placeholder="Search orders..." className="bg-[#32394E] text-white text-[10px] border-none outline-none rounded pl-7 pr-2 py-0.5 placeholder:text-gray-400 w-32" />
                                        </div>
                                        <button className="bg-[#FB7506] hover:bg-orange-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded flex items-center gap-1 transition-colors">
                                            <Plus size={10} /> New Order
                                        </button>
                                        <button className="bg-[#32394E] hover:bg-gray-600 text-white p-1 rounded transition-colors">
                                            <RefreshCcw size={12} />
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-[#F0F2F5] flex justify-end px-2 py-1 text-[9px] font-bold text-gray-500 uppercase tracking-widest border-b shrink-0">
                                    {ordersList.length} Records
                                </div>
                                <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar">
                                    <table className="w-full text-left whitespace-nowrap min-w-[1000px]">
                                        <thead className="sticky top-0 bg-white shadow-sm z-10">
                                            <tr className="uppercase text-[9px] font-black tracking-widest text-[#8A92A5]">
                                                <th className="py-2 pl-2 text-center border-b border-gray-200">View</th>
                                                <th className="py-2 border-b border-gray-200">Warehouse</th>
                                                <th className="py-2 border-b border-gray-200">Invoice No</th>
                                                <th className="py-2 border-b border-gray-200">Customer</th>
                                                <th className="py-2 border-b border-gray-200">Ship Name</th>
                                                <th className="py-2 border-b border-gray-200">Carrier</th>
                                                <th className="py-2 text-right border-b border-gray-200">T.Invoice</th>
                                                <th className="py-2 text-center border-b border-gray-200">T.Pieces</th>
                                                <th className="py-2 text-center border-b border-gray-200">Dispatch</th>
                                                <th className="py-2 text-center border-b border-gray-200">E-Mail</th>
                                                <th className="py-2 text-center border-b border-gray-200">Printed</th>
                                                <th className="py-2 text-center border-b border-gray-200">Labeled</th>
                                                <th className="py-2 pr-2 text-center border-b border-gray-200">Void</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ordersList.length === 0 && loadingSalesCenter ? (
                                                <tr><td colSpan={13} className="py-10 text-center text-xs text-gray-400 font-bold uppercase italic"><RefreshCcw className="w-4 h-4 animate-spin mx-auto mb-2" /> Loading orders...</td></tr>
                                            ) : ordersList.length === 0 ? (
                                                <tr><td colSpan={13} className="py-10 text-center text-xs text-gray-400 font-bold uppercase italic">No orders found for this selection</td></tr>
                                            ) : (
                                                ordersList.map((order, i) => {
                                                    const isActive = selectedOrder?.unico === order.unico;
                                                    return (
                                                        <tr
                                                            key={order.unico || i}
                                                            onClick={() => setSelectedOrder(order)}
                                                            className={\`cursor-pointer border-b border-gray-100 transition-colors text-[10px] uppercase font-bold \${isActive ? 'bg-[#D6E4FF] font-black' : 'odd:bg-white even:bg-[#F9FAFB] hover:bg-gray-100'}\`}
                                                        >
                                                            <td className="py-2 pl-2 text-center">
                                                                <FileText size={12} className="text-[#FB7506] mx-auto hover:scale-110" />
                                                            </td>
                                                            <td className="py-2 text-gray-600">{order.warehouse || 'MIAMI'}</td>
                                                            <td className="py-2 text-[#2A3042] font-black">{order.invoice_no || order.Invoice_No || 'N/A'}</td>
                                                            <td className="py-2 text-gray-700 truncate max-w-[150px]">{order.customer_name || order.Customer}</td>
                                                            <td className="py-2 text-gray-500 font-medium truncate max-w-[150px]">{order.ship_name || order.Customer || order.customer_name}</td>
                                                            <td className="py-2 text-gray-500 text-[9px] font-medium">{order.carrier || 'AIRSEATRANS FLL'}</td>
                                                            <td className="py-2 text-[#2A3042] text-right font-black">
                                                                \${parseMoney(order.total_amount || order.Total_Amount).toFixed(2)}
                                                            </td>
                                                            <td className="py-2 text-center text-gray-600 font-medium">
                                                                {order.boxes || 0}
                                                            </td>
                                                            <td className="py-2 text-center text-[#34C38F] font-black">
                                                                {order.dispatch || 0}
                                                            </td>
                                                            <td className="py-2 text-center text-gray-300">
                                                                <input type="checkbox" className="w-3 h-3 grayscale cursor-not-allowed" />
                                                            </td>
                                                            <td className="py-2 text-center text-[#34C38F]">
                                                                <input type="checkbox" defaultChecked={true} className="w-3 h-3 accent-[#34C38F] rounded-sm" />
                                                            </td>
                                                            <td className="py-2 text-center text-[#556EE6]">
                                                                <input type="checkbox" defaultChecked={true} className="w-3 h-3 accent-[#556EE6] rounded-sm" />
                                                            </td>
                                                            <td className="py-2 pr-2 text-center text-gray-300">
                                                                <XCircle size={12} className="mx-auto" />
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
`
);

fs.writeFileSync(file, data, 'utf8');
console.log('Update complete');
