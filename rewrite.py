import sys

with open("c:/EIS-Data/AppSmith/Antigravity/fullpot-operational-system/src/app/sales/page.tsx", "r", encoding="utf-8") as f:
    text = f.read()

start_idx = text.find("{activeTab === 'sales' && (")
end_idx = text.find("{activeTab === 'terminal' && (", start_idx)

if start_idx != -1 and end_idx != -1:
    new_sales_tab = """{activeTab === 'sales' && (
                    <div className="flex flex-col h-full overflow-hidden bg-white animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Three Column Layout exactly like screenshot */}
                        <div className="flex-1 flex flex-row min-h-0">
                            
                            {/* Column 1: Sales Dates */}
                            <div className="w-[30%] flex flex-col border-r border-[#E5E7EB] min-h-0">
                                <div className="px-4 py-3 border-b border-[#E5E7EB]">
                                    <div className="font-bold text-[11px] uppercase tracking-widest text-[#FB7506] flex items-center gap-2">
                                        <Calendar size={13} /> SALES DATES
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto custom-scrollbar">
                                    <table className="w-full text-left">
                                        <thead className="sticky top-0 bg-white shadow-sm">
                                            <tr>
                                                <th className="py-2 px-4 text-[10px] font-black text-gray-500 uppercase border-b border-[#E5E7EB]">DATE</th>
                                                <th className="py-2 px-4 text-[10px] font-black text-gray-500 uppercase border-b border-[#E5E7EB] text-center">ORDERS</th>
                                                <th className="py-2 px-4 text-[10px] font-black text-gray-500 uppercase border-b border-[#E5E7EB] text-right">
                                                    <div className="flex items-center justify-end gap-1">AMOUNT <ArrowDownUp size={10} className="text-gray-400"/></div>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {salesDates.length === 0 ? (
                                                <tr><td colSpan={3} className="py-10 text-center text-xs text-gray-400 font-bold uppercase italic">{loadingSalesCenter ? 'Loading...' : 'No records'}</td></tr>
                                            ) : (
                                                salesDates.map((dateObj, i) => {
                                                    const dateStr = dateObj.ship_date ? dateObj.ship_date.split('T')[0] : '';
                                                    const isActive = selectedSalesDate === dateStr;
                                                    return (
                                                        <tr
                                                            key={i}
                                                            onClick={() => handleSelectSalesDate(dateStr)}
                                                            className={`cursor-pointer border-b border-gray-100 transition-colors \${isActive ? 'bg-[#FFF3E0]' : 'hover:bg-gray-50'}`}
                                                        >
                                                            <td className={`py-2.5 px-4 text-[10px] font-bold uppercase \${isActive ? "text-[#FB7506]" : "text-gray-700"}`}>
                                                                {dateStr}
                                                            </td>
                                                            <td className="py-2.5 px-4 text-[10px] font-bold text-gray-600 text-center">{dateObj.orders || dateObj.total_orders || 0}</td>
                                                            <td className="py-2.5 px-4 text-[10px] font-black text-[#FB7506] text-right">
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
                            <div className="w-[30%] flex flex-col border-r border-[#E5E7EB] min-h-0">
                                <div className="px-4 py-3 border-b border-[#E5E7EB]">
                                    <div className="font-bold text-[11px] uppercase tracking-widest text-[#FB7506] flex items-center gap-2">
                                        <Users size={13} /> SALES BY REP
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto custom-scrollbar">
                                    <table className="w-full text-left">
                                        <thead className="sticky top-0 bg-white shadow-sm">
                                            <tr>
                                                <th className="py-2 px-4 text-[10px] font-black text-gray-500 uppercase border-b border-[#E5E7EB]">REP</th>
                                                <th className="py-2 px-4 text-[10px] font-black text-gray-500 uppercase border-b border-[#E5E7EB] text-center">ORDERS</th>
                                                <th className="py-2 px-4 text-[10px] font-black text-gray-500 uppercase border-b border-[#E5E7EB] text-right">AMOUNT</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {salesByRep.length === 0 ? (
                                                <tr><td colSpan={3} className="py-10 text-center text-xs text-gray-400 font-bold uppercase italic">{loadingSalesCenter ? 'Loading...' : 'No reps found'}</td></tr>
                                            ) : (
                                                salesByRep.map((rep, i) => {
                                                    const isActive = selectedSalesRep?.sales_cus_uq === rep.sales_cus_uq;
                                                    return (
                                                        <tr
                                                            key={i}
                                                            onClick={() => handleSelectSalesRep(rep)}
                                                            className={`cursor-pointer border-b border-gray-100 transition-colors \${isActive ? 'bg-[#FFF3E0]' : 'hover:bg-gray-50'}`}
                                                        >
                                                            <td className={`py-2.5 px-4 text-[10px] font-bold truncate max-w-[150px] \${isActive ? "text-[#FB7506]" : "text-gray-700"}`}>
                                                                {rep.Salesman || rep.sales_name || rep.sales_code || 'Unknown'}
                                                            </td>
                                                            <td className="py-2.5 px-4 text-[10px] font-bold text-gray-600 text-center">{rep.orders || rep.total_orders || 0}</td>
                                                            <td className="py-2.5 px-4 text-[10px] font-black text-[#FB7506] text-right">
                                                                \${parseMoney(rep.amount || rep.total_amount).toFixed(2)}
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
                            <div className="w-[40%] flex flex-col min-h-0">
                                <div className="px-4 py-3 border-b border-[#E5E7EB]">
                                    <div className="font-bold text-[11px] uppercase tracking-widest text-[#FB7506] flex items-center gap-2">
                                        <Box size={13} /> ORDERS LIST
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto custom-scrollbar">
                                    <table className="w-full text-left">
                                        <thead className="sticky top-0 bg-white shadow-sm">
                                            <tr>
                                                <th className="py-2 px-4 text-[10px] font-black text-gray-500 uppercase border-b border-[#E5E7EB]">INVOICE</th>
                                                <th className="py-2 px-4 text-[10px] font-black text-gray-500 uppercase border-b border-[#E5E7EB]">CUSTOMER</th>
                                                <th className="py-2 px-4 text-[10px] font-black text-gray-500 uppercase border-b border-[#E5E7EB] text-center">STATUS</th>
                                                <th className="py-2 px-4 text-[10px] font-black text-gray-500 uppercase border-b border-[#E5E7EB] text-right">
                                                    <div className="flex items-center justify-end gap-1">AMOUNT <ArrowDownUp size={10} className="text-gray-400"/></div>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ordersList.length === 0 ? (
                                                <tr><td colSpan={4} className="py-10 text-center text-xs text-gray-400 font-bold uppercase italic">{loadingSalesCenter ? 'Loading...' : 'No orders found'}</td></tr>
                                            ) : (
                                                ordersList.map((order, i) => {
                                                    const isActive = selectedOrder?.unico === order.unico;
                                                    return (
                                                        <tr
                                                            key={order.unico || i}
                                                            onClick={() => setSelectedOrder(order)}
                                                            className={`cursor-pointer border-b border-gray-100 transition-colors \${isActive ? 'bg-[#FFF3E0]' : 'hover:bg-gray-50'}`}
                                                        >
                                                            <td className={`py-2.5 px-4 text-[10px] font-black \${isActive ? "text-[#FB7506]" : "text-gray-700"}`}>
                                                                {order.invoice_no || order.Invoice_No || 'N/A'}
                                                            </td>
                                                            <td className="py-2.5 px-4 text-[10px] font-bold text-gray-600 truncate max-w-[180px]">
                                                                {order.customer_name || order.Customer}
                                                            </td>
                                                            <td className="py-2.5 px-4 text-[10px] font-bold text-center">
                                                                <span className={cn(
                                                                    "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                                                                    order.status === 'O' || !order.status ? "text-green-600 border-green-200 bg-green-50" :
                                                                    order.status === 'C' ? "text-gray-600 border-gray-200 bg-gray-50" : 
                                                                    "text-red-500 border-red-200 bg-red-50"
                                                                )}>
                                                                    {order.status === 'O' ? 'OPEN' : order.status === 'C' ? 'CLOSED' : order.status || 'VOID'}
                                                                </span>
                                                            </td>
                                                            <td className="py-2.5 px-4 text-[10px] font-black text-[#FB7506] text-right">
                                                                \${parseMoney(order.total_amount || order.Total_Amount).toFixed(2)}
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
"""

    text = text[:start_idx] + new_sales_tab + text[end_idx:]

with open("c:/EIS-Data/AppSmith/Antigravity/fullpot-operational-system/src/app/sales/page.tsx", "w", encoding="utf-8") as f:
    f.write(text)

print("Update accomplished via Python.")
