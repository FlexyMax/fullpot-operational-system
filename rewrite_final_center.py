import sys

file_path = "c:/EIS-Data/AppSmith/Antigravity/fullpot-operational-system/src/app/sales/page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

# 1. Fix duplicate tab
text = text.replace(
    "{ id: 'po_history', label: 'PO History', icon: ClipboardList },\\n        { id: 'po_history', label: 'PO History', icon: ClipboardList }",
    "{ id: 'po_history', label: 'PO History', icon: ClipboardList }"
)

# 2. Replace Sales Center block
start_marker = "{activeTab === 'sales' && ("
end_marker = "{activeTab === 'terminal' && ("

start_idx = text.find(start_marker)
end_idx = text.find(end_marker, start_idx)

if start_idx != -1 and end_idx != -1:
    new_sales_tab = """{activeTab === 'sales' && (
                    <div className="flex flex-row gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full overflow-hidden p-1">
                        
                        {/* Column 1: Sales Dates */}
                        <div className="w-[25%] pos-grid-container flex flex-col shadow-sm">
                            <div className="pos-grid-header h-8">
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} className="text-[#FB7506]" />
                                    <span className="font-black text-[11px] uppercase tracking-tight">Sales Dates</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <select className="bg-gray-700 text-white text-[9px] uppercase font-bold border-none outline-none rounded px-1 py-0.5" defaultValue="2026">
                                        <option value="2026">2026</option>
                                        <option value="2025">2025</option>
                                    </select>
                                </div>
                            </div>
                            <div className="pos-table-container custom-scrollbar">
                                <table className="pos-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th className="text-center">Inv</th>
                                            <th className="text-right">Total Sold</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {salesDates.length === 0 ? (
                                            <tr><td colSpan={3} className="py-20 text-center text-gray-300 font-bold uppercase italic">No records</td></tr>
                                        ) : (
                                            salesDates.map((dateObj, i) => {
                                                const dateStr = dateObj.ship_date ? dateObj.ship_date.split('T')[0] : '';
                                                const isActive = selectedSalesDate === dateStr;
                                                return (
                                                    <tr
                                                        key={i}
                                                        onClick={() => handleSelectSalesDate(dateStr)}
                                                        className={cn("cursor-pointer", isActive && "selected bg-orange-50")}
                                                    >
                                                        <td className={cn("font-bold uppercase", isActive ? "text-[#FB7506]" : "text-gray-700")}>
                                                            {dateStr}
                                                        </td>
                                                        <td className="text-center font-bold text-gray-500">{dateObj.orders || dateObj.total_orders || 0}</td>
                                                        <td className="text-right font-black text-[#FB7506]">
                                                            ${parseMoney(dateObj.amount || dateObj.total_amount).toFixed(2)}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Column 2: Sales By Rep */}
                        <div className="w-[30%] pos-grid-container flex flex-col shadow-sm">
                            <div className="pos-grid-header h-8">
                                <div className="flex items-center gap-2">
                                    <Users size={14} className="text-[#FB7506]" />
                                    <span className="font-black text-[11px] uppercase tracking-tight">Sales By Rep</span>
                                </div>
                            </div>
                            <div className="pos-table-container custom-scrollbar">
                                <table className="pos-table">
                                    <thead>
                                        <tr>
                                            <th>Salesrep</th>
                                            <th className="text-center">Inv</th>
                                            <th className="text-right">Total Sold</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {salesByRep.length === 0 ? (
                                            <tr><td colSpan={3} className="py-20 text-center text-gray-300 font-bold uppercase italic">No reps found</td></tr>
                                        ) : (
                                            salesByRep.map((rep, i) => {
                                                const isActive = selectedSalesRep?.sales_cus_uq === rep.sales_cus_uq;
                                                return (
                                                    <tr
                                                        key={i}
                                                        onClick={() => handleSelectSalesRep(rep)}
                                                        className={cn("cursor-pointer", isActive && "selected bg-orange-50")}
                                                    >
                                                        <td className={cn("font-bold uppercase truncate max-w-[120px]", isActive ? "text-[#FB7506]" : "text-gray-700")}>
                                                            {rep.Salesman || rep.sales_name || 'Unknown'}
                                                        </td>
                                                        <td className="text-center font-bold text-gray-500">{rep.orders || rep.total_orders || 0}</td>
                                                        <td className="text-right font-black text-[#FB7506]">
                                                            ${parseMoney(rep.amount || rep.total_amount).toFixed(2)}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Column 3: Orders List */}
                        <div className="w-[45%] pos-grid-container flex flex-col shadow-sm">
                            <div className="pos-grid-header h-8">
                                <div className="flex items-center gap-2">
                                    <Box size={14} className="text-[#FB7506]" />
                                    <span className="font-black text-[11px] uppercase tracking-tight">Orders List</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={10} />
                                        <input type="text" placeholder="Filter..." className="bg-gray-700 text-white text-[9px] border-none outline-none rounded pl-6 pr-2 py-0.5 placeholder:text-gray-500 w-24" />
                                    </div>
                                    <button className="bg-[#FB7506] hover:bg-orange-600 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest text-white transition-colors">
                                        Refresh
                                    </button>
                                </div>
                            </div>
                            <div className="pos-table-container custom-scrollbar">
                                <table className="pos-table">
                                    <thead>
                                        <tr>
                                            <th>Invoice</th>
                                            <th>Customer</th>
                                            <th className="text-center">Status</th>
                                            <th className="text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ordersList.length === 0 ? (
                                            <tr><td colSpan={4} className="py-20 text-center text-gray-300 font-bold uppercase italic">No orders found</td></tr>
                                        ) : (
                                            ordersList.map((order, i) => {
                                                const isActive = selectedOrder?.unico === order.unico;
                                                return (
                                                    <tr
                                                        key={order.unico || i}
                                                        onClick={() => setSelectedOrder(order)}
                                                        className={cn("cursor-pointer", isActive && "selected bg-orange-50")}
                                                    >
                                                        <td className={cn("font-black", isActive ? "text-[#FB7506]" : "text-gray-900")}>
                                                            {order.invoice_no || order.Invoice_No || 'N/A'}
                                                        </td>
                                                        <td className="font-bold text-gray-600 truncate max-w-[150px]">
                                                            {order.customer_name || order.Customer}
                                                        </td>
                                                        <td className="text-center font-bold">
                                                            <span className={cn(
                                                                "text-[8px] font-black uppercase px-1.5 py-0.5 rounded border leading-none",
                                                                order.status === 'O' || !order.status ? "text-green-600 border-green-200 bg-green-50" :
                                                                order.status === 'C' ? "text-gray-600 border-gray-200 bg-gray-50" : 
                                                                "text-red-500 border-red-200 bg-red-50"
                                                            )}>
                                                                {order.status === 'O' ? 'OPEN' : order.status === 'C' ? 'CLOSED' : order.status || 'VOID'}
                                                            </span>
                                                        </td>
                                                        <td className="text-right font-black text-[#FB7506]">
                                                            ${parseMoney(order.total_amount || order.Total_Amount).toFixed(2)}
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
                )}
"""
    
    text = text[:start_idx] + new_sales_tab + text[end_idx:]

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(text)
    print("Reemplazo de 3 columnas (Dark Mode) completado.")
else:
    print("Error: No se encontró el marcador.")
