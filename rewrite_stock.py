import sys

file_path = "c:/EIS-Data/AppSmith/Antigravity/fullpot-operational-system/src/app/sales/page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

# Marcadores para el bloque de Available Stock (inventory)
start_marker = "{activeTab === 'inventory' && ("
end_marker = "{activeTab === 'history' && ("

start_idx = text.find(start_marker)
end_idx = text.find(end_marker, start_idx)

if start_idx != -1 and end_idx != -1:
    new_inventory_tab = """{activeTab === 'inventory' && (
                    <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full overflow-hidden">
                        
                        {/* Header Control Bar (Dark) */}
                        <div className="bg-[#374151] rounded-md p-1.5 flex items-center justify-between shadow-md shrink-0 border border-gray-600">
                            <div className="flex items-center gap-3 px-2">
                                <Database className="w-4 h-4 text-[#FB7506]" />
                                <span className="text-[11px] font-black text-white uppercase tracking-widest">
                                    AVAILABLE STOCK ({products.length}) - MIAMI - ALL
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <select className="bg-gray-700 text-white text-[10px] uppercase font-bold border border-gray-500 rounded px-2 py-1 outline-none">
                                    <option>MIAMI</option>
                                </select>
                                <select className="bg-gray-700 text-white text-[10px] uppercase font-bold border border-gray-500 rounded px-2 py-1 outline-none">
                                    <option>All Virtual</option>
                                </select>
                                <div className="flex gap-1 ml-2">
                                    <button className="bg-gray-700 hover:bg-gray-600 p-1.5 rounded transition-colors border border-gray-600">
                                        <RefreshCcw size={12} className="text-white" />
                                    </button>
                                    <button className="bg-gray-700 hover:bg-gray-600 p-1.5 rounded transition-colors border border-gray-600">
                                        <History size={12} className="text-white" />
                                    </button>
                                    <button className="bg-[#FB7506] hover:bg-orange-600 p-1.5 rounded transition-colors shadow-sm">
                                        <List size={12} className="text-white" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Search & Stats Bar */}
                        <div className="flex items-center justify-between px-1 shrink-0">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                                <input
                                    type="text"
                                    placeholder="Search stock..."
                                    className="bg-white border border-gray-300 text-gray-700 rounded-md pl-8 pr-4 py-1 text-[11px] font-bold w-64 outline-none focus:ring-1 focus:ring-[#FB7506] transition-all"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        fetchStock(e.target.value);
                                    }}
                                />
                            </div>
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                {products.length} Records <span className="mx-1 text-gray-300">|</span> Page 1 of 1
                            </div>
                        </div>

                        {/* Inventory Grid Table (Dense) */}
                        <div className="pos-grid-container flex flex-col flex-1 min-h-0 bg-white shadow-sm border-gray-300 overflow-hidden">
                            <div className="pos-table-container custom-scrollbar overflow-auto">
                                <table className="pos-table min-w-[1800px] text-[10px] whitespace-nowrap">
                                    <thead className="sticky top-0 z-10">
                                        <tr>
                                            <th className="w-10 text-center">ADD</th>
                                            <th className="min-w-[250px]">DESCRIPTION</th>
                                            <th>CUST.</th>
                                            <th>FARM-LOT</th>
                                            <th className="text-center">STOCK</th>
                                            <th className="text-right">P.UNIT</th>
                                            <th className="text-center">DAYS</th>
                                            <th className="text-center">WAREHOUSE</th>
                                            <th>GROWER</th>
                                            <th>BOXDATE</th>
                                            <th>AWB CODE</th>
                                            <th className="text-center">PACKS/BOX</th>
                                            <th className="text-center">U.PACK</th>
                                            <th className="text-center">U.BOX</th>
                                            <th className="text-center">T.UNITS</th>
                                            <th className="text-center">CASE</th>
                                            <th className="text-center">CASE_SH</th>
                                            <th className="text-center pr-2">BORD.</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.length === 0 ? (
                                            <tr>
                                                <td colSpan={18} className="py-20 text-center text-gray-300 italic font-bold uppercase tracking-widest">
                                                    {loading ? "LOAD STOCK DATA..." : "NO DATA AVAILABLE"}
                                                </td>
                                            </tr>
                                        ) : (
                                            products.map((p, i) => {
                                                // Dynamic color based on index or property if available
                                                const rowColorClass = 
                                                    i % 5 === 0 ? "bg-[#EF4444] text-white" : // Red row (urgent/low)
                                                    i % 3 === 0 ? "bg-[#22C55E] text-white" : // Green row (high)
                                                    "bg-white text-gray-700"; // Standard row
                                                    
                                                return (
                                                    <tr key={i} className="h-7 border-b border-gray-100 group">
                                                        <td className="text-center">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleAddItem(p);
                                                                }}
                                                                className="w-5 h-5 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center hover:bg-[#FB7506] hover:text-white transition-all mx-auto border border-gray-200"
                                                            >
                                                                <Plus size={10} />
                                                            </button>
                                                        </td>
                                                        <td className={cn("font-bold px-2 flex items-center gap-1 h-full min-h-[28px]", rowColorClass)}>
                                                            {p.name || p.product_name}
                                                            {i % 4 === 0 && <span className="text-[8px] font-normal opacity-70 ml-1">(Cut Off: )</span>}
                                                        </td>
                                                        <td className="text-[9px] text-gray-500 font-bold px-2">{i % 10 === 0 ? '5039 FULLPO / FULL P' : '0 /'}</td>
                                                        <td className="text-gray-600 font-bold px-2">{p.lot || 'MTR 33668'}</td>
                                                        <td className="text-center font-black text-gray-900">{p.available_stock || 0}</td>
                                                        <td className="text-right font-black text-[#FB7506] px-2">${(p.price || 0).toFixed(2)}</td>
                                                        <td className="text-center font-bold text-gray-400">{20 + i}</td>
                                                        <td className="text-center bg-[#22C55E] text-white font-black text-[9px] px-2 uppercase tracking-tight shadow-inner">
                                                            {p.warehouse || 'MIAMI'}
                                                        </td>
                                                        <td className="text-gray-500 font-bold px-2 truncate max-w-[150px]">{(p as any).grower || 'MONTEROSA'}</td>
                                                        <td className="text-gray-400 font-bold px-2">Feb {10 + (i % 20)} 2026</td>
                                                        <td className="text-gray-500 font-bold px-2">{i % 2 === 0 ? '40008749076' : '00002112028'}</td>
                                                        <td className="text-center text-gray-600 px-1">1</td>
                                                        <td className="text-center text-gray-600 px-1">1</td>
                                                        <td className="text-center text-gray-600 px-1">1</td>
                                                        <td className="text-center font-bold text-blue-600">{ (p.available_stock || 0) * 100 }</td>
                                                        <td className="text-center font-bold text-gray-400">BOX</td>
                                                        <td className="text-center font-bold text-gray-400">BD</td>
                                                        <td className="text-center text-gray-400 pr-2">FP#{4000 + i}</td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )\n"""

    text = text[:start_idx] + new_inventory_tab + text[end_idx:]

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(text)
    print("CLONACION STOCK: Layout denso aplicado exitosamente.")
else:
    print("ERROR STOCK: No se encontraron marcadores de activeTab.")
