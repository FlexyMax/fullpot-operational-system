import sys

file_path = "c:/EIS-Data/AppSmith/Antigravity/fullpot-operational-system/src/app/sales/page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

# Marcadores para el bloque del Sales Center
start_marker = "{activeTab === 'sales' && ("
end_marker = "{activeTab === 'terminal' && ("

start_idx = text.find(start_marker)
end_idx = text.find(end_marker, start_idx)

if start_idx != -1 and end_idx != -1:
    new_sales_tab = """{activeTab === 'sales' && (
                    <div className="flex flex-row gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full overflow-hidden">
                        
                        {/* LEFT: SELECT YEAR / DATES (30% Width) */}
                        <div className="w-[30%] flex flex-col gap-2 min-h-0">
                            <div className="pos-grid-container flex flex-col flex-1 shadow-sm border-gray-300">
                                <div className="pos-grid-header h-8 bg-[#374151]">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-[#FB7506]" />
                                        <span className="font-black text-[11px] uppercase tracking-widest text-white">SELECT YEAR</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <select className="bg-gray-700 text-white text-[9px] uppercase font-bold border-none outline-none rounded px-1.5 py-0.5" defaultValue="2026">
                                            <option value="2026">2026</option>
                                            <option value="2025">2025</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="bg-[#F0F2F5] flex justify-end px-2 py-0.5 text-[9px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-200">
                                    {salesDates.length} Records
                                </div>
                                <div className="pos-table-container custom-scrollbar overflow-y-auto">
                                    <table className="pos-table min-w-full">
                                        <thead>
                                            <tr>
                                                <th className="w-[60%]">DATE</th>
                                                <th className="text-center">INVOICE</th>
                                                <th className="text-center leading-none flex-col flex h-full justify-center">
                                                    <span>TOTAL</span>
                                                    <span>BOXES</span>
                                                </th>
                                                <th className="text-right pr-2">T.SOLD</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {salesDates.length === 0 ? (
                                                <tr><td colSpan={4} className="py-20 text-center text-gray-300 font-bold uppercase italic">No records found</td></tr>
                                            ) : (
                                                salesDates.map((dateObj, i) => {
                                                    const dateStr = dateObj.ship_date ? dateObj.ship_date.split('T')[0] : '';
                                                    const isActive = selectedSalesDate === dateStr;
                                                    return (
                                                        <tr
                                                            key={i}
                                                            onClick={() => handleSelectSalesDate(dateStr)}
                                                            className={cn("cursor-pointer h-8", isActive && "selected bg-orange-50 font-black")}
                                                        >
                                                            <td className={cn("font-bold uppercase pl-2", isActive ? "text-[#FB7506]" : "text-gray-700")}>
                                                                {dateStr}
                                                            </td>
                                                            <td className="text-center font-bold text-gray-500">{dateObj.orders || dateObj.total_orders || 0}</td>
                                                            <td className="text-center font-bold text-gray-500">{dateObj.total_boxes || 0}</td>
                                                            <td className="text-right font-black text-[#FB7506] pr-2">
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
                        </div>

                        {/* RIGHT: REPS & ORDERS (70% Width, Split Horizontally) */}
                        <div className="w-[70%] flex flex-col gap-3 min-h-0 overflow-hidden">
                            
                            {/* TOP: SALES BY CUSTOMER (40% Height) */}
                            <div className="flex-[0.4] pos-grid-container flex flex-col shadow-sm border-gray-300 min-h-0 overflow-hidden">
                                <div className="pos-grid-header h-8 bg-[#374151]">
                                    <div className="flex items-center gap-2">
                                        <Users size={14} className="text-[#FB7506]" />
                                        <span className="font-black text-[11px] uppercase tracking-widest text-white">SALES BY CUSTOMER ({salesByRep.length})</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={10} />
                                            <input type="text" placeholder="Search customer..." className="bg-gray-700 text-white text-[9px] border-none outline-none rounded pl-7 pr-2 py-0.5 placeholder:text-gray-500 w-40" />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-[#F0F2F5] flex justify-end px-2 py-0.5 text-[9px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-200">
                                    {salesByRep.length} Records
                                </div>
                                <div className="pos-table-container custom-scrollbar overflow-auto">
                                    <table className="pos-table min-w-full text-[10px] whitespace-nowrap">
                                        <thead className="sticky top-0 z-10">
                                            <tr>
                                                <th className="pl-2">SALESREP</th>
                                                <th className="text-right">T.PIECES</th>
                                                <th className="text-right">T.SOLD</th>
                                                <th className="text-right">T.PAYMENTS</th>
                                                <th className="text-right">T.CREDITS</th>
                                                <th className="text-right">T.DEBITS</th>
                                                <th className="text-right">BALANCE</th>
                                                <th className="text-right">T.F.BOXES</th>
                                                <th className="text-right">T.COST</th>
                                                <th className="text-right pr-2">GPM%</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {/* Summary Row like in image */}
                                            <tr className="bg-orange-50/50 font-black border-b border-gray-200 text-gray-900 h-8">
                                                <td className="pl-2 uppercase">* ALL SALESMEN *</td>
                                                <td className="text-right text-blue-700">{salesByRep.reduce((v, r) => v + (r.total_orders || 0), 0)}</td>
                                                <td className="text-right">${salesByRep.reduce((v, r) => v + parseMoney(r.amount || r.total_amount), 0).toFixed(2)}</td>
                                                <td className="text-right text-gray-500">$0.00</td>
                                                <td className="text-right text-gray-500">$0.00</td>
                                                <td className="text-right text-gray-500">$0.00</td>
                                                <td className="text-right">${salesByRep.reduce((v, r) => v + parseMoney(r.amount || r.total_amount), 0).toFixed(2)}</td>
                                                <td className="text-right text-gray-500">0.00</td>
                                                <td className="text-right text-gray-500">$0.00</td>
                                                <td className="text-right text-green-600 pr-2">0.00%</td>
                                            </tr>
                                            {salesByRep.length === 0 ? (
                                                <tr><td colSpan={10} className="py-10 text-center text-gray-300 font-bold uppercase italic">No reps selected</td></tr>
                                            ) : (
                                                salesByRep.map((rep, i) => {
                                                    const isActive = selectedSalesRep?.sales_cus_uq === rep.sales_cus_uq;
                                                    return (
                                                        <tr
                                                            key={i}
                                                            onClick={() => handleSelectSalesRep(rep)}
                                                            className={cn("cursor-pointer h-8 align-middle", isActive && "selected bg-orange-50 font-black")}
                                                        >
                                                            <td className={cn("uppercase pl-2", isActive ? "text-[#FB7506]" : "text-gray-700")}>
                                                                {rep.Salesman || rep.sales_name || 'Unknown'}
                                                            </td>
                                                            <td className="text-right text-gray-600 px-2 font-bold">{rep.orders || rep.total_orders || 0}</td>
                                                            <td className="text-right font-black text-[#FB7506] px-2">
                                                                ${parseMoney(rep.amount || rep.total_amount).toFixed(2)}
                                                            </td>
                                                            <td className="text-right text-gray-400 font-medium px-2">$0.00</td>
                                                            <td className="text-right text-gray-400 font-medium px-2">$0.00</td>
                                                            <td className="text-right text-gray-400 font-medium px-2">$0.00</td>
                                                            <td className="text-right text-gray-700 font-bold px-2">${parseMoney(rep.amount || rep.total_amount).toFixed(2)}</td>
                                                            <td className="text-right text-gray-500 font-medium px-2">0.00</td>
                                                            <td className="text-right text-gray-400 font-medium px-2">$0.00</td>
                                                            <td className="text-right text-green-600 font-black pr-2">40.00%</td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* BOTTOM: ORDERS BY SALES REP (60% Height) */}
                            <div className="flex-[0.6] pos-grid-container flex flex-col shadow-sm border-gray-300 min-h-0 overflow-hidden">
                                <div className="pos-grid-header h-8 bg-[#374151]">
                                    <div className="flex items-center gap-2">
                                        <Box size={14} className="text-[#FB7506]" />
                                        <span className="font-black text-[11px] uppercase tracking-widest text-white">ORDERS BY SALES REP. ({ordersList.length})</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={10} />
                                            <input type="text" placeholder="Search orders..." className="bg-gray-700 text-white text-[9px] border-none outline-none rounded pl-7 pr-2 py-0.5 placeholder:text-gray-500 w-32" />
                                        </div>
                                        <button className="bg-[#FB7506] hover:bg-orange-600 px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest text-white transition-all shadow-sm flex items-center gap-1 active:scale-95">
                                            <Plus size={10} /> NEW ORDER
                                        </button>
                                        <button className="bg-gray-700 hover:bg-gray-600 p-1.5 rounded transition-colors border border-gray-600">
                                            <RefreshCcw size={12} className="text-white" />
                                        </button>
                                        <button className="bg-orange-500 hover:bg-orange-600 p-1.5 rounded transition-colors">
                                            <List size={12} className="text-white" />
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-[#F0F2F5] flex justify-end px-2 py-0.5 text-[9px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-200">
                                    {ordersList.length} Records
                                </div>
                                <div className="pos-table-container custom-scrollbar overflow-auto">
                                    <table className="pos-table min-w-full text-[10px] whitespace-nowrap">
                                        <thead className="sticky top-0 z-10">
                                            <tr>
                                                <th className="text-center w-8">VIEW</th>
                                                <th>WAREHOUSE</th>
                                                <th>INVOICE NO</th>
                                                <th>CUSTOMER</th>
                                                <th>SHIP NAME</th>
                                                <th>CARRIER</th>
                                                <th className="text-right">T.INVOICE</th>
                                                <th className="text-center">T.PIECES</th>
                                                <th className="text-center">DISPATCH</th>
                                                <th className="text-center">E-MAIL</th>
                                                <th className="text-center">PRINTED</th>
                                                <th className="text-center">LABELED</th>
                                                <th className="text-center pr-2">VOID</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ordersList.length === 0 ? (
                                                <tr><td colSpan={13} className="py-20 text-center text-gray-300 font-bold uppercase italic">No orders found for this representative</td></tr>
                                            ) : (
                                                ordersList.map((order, i) => {
                                                    const isActive = selectedOrder?.unico === order.unico;
                                                    return (
                                                        <tr
                                                            key={order.unico || i}
                                                            onClick={() => setSelectedOrder(order)}
                                                            className={cn("cursor-pointer h-8 transition-colors", isActive && "selected bg-orange-50 font-black")}
                                                        >
                                                            <td className="text-center">
                                                                <FileText size={12} className="text-[#FB7506] mx-auto hover:scale-110" />
                                                            </td>
                                                            <td className="font-bold text-gray-500 uppercase">{order.warehouse || 'MIAMI'}</td>
                                                            <td className="font-black text-gray-900">{order.invoice_no || order.Invoice_No || 'N/A'}</td>
                                                            <td className="font-bold text-gray-700 truncate max-w-[150px] uppercase">{order.customer_name || order.Customer}</td>
                                                            <td className="font-medium text-gray-500 truncate max-w-[150px] uppercase">{order.ship_name || order.customer_name}</td>
                                                            <td className="font-medium text-gray-400 uppercase">{order.carrier || 'PICK UP'}</td>
                                                            <td className="text-right font-black text-gray-900 px-2">${parseMoney(order.total_amount || order.Total_Amount).toFixed(2)}</td>
                                                            <td className="text-center font-bold text-gray-600">{order.boxes || 0}</td>
                                                            <td className="text-center font-black text-green-600">{order.dispatch || 0}</td>
                                                            <td className="text-center"><input type="checkbox" className="w-3 h-3 grayscale cursor-not-allowed" /></td>
                                                            <td className="text-center"><input type="checkbox" defaultChecked={true} className="w-3 h-3 accent-green-600" /></td>
                                                            <td className="text-center"><input type="checkbox" defaultChecked={true} className="w-3 h-3 accent-blue-600" /></td>
                                                            <td className="text-center pr-2"><XCircle size={12} className="text-gray-300 hover:text-red-400 mx-auto" /></td>
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
                )\n"""

    text = text[:start_idx] + new_sales_tab + text[end_idx:]

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(text)
    print("REEMPLAZO CLAVE: Layout de Imagen Objetivo aplicado exitosamente.")
else:
    print("ERROR CRITICO: Los marcadores de activeTab no coinciden con el archivo actual.")
