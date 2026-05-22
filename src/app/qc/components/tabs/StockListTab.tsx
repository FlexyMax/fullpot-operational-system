"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, RefreshCcw, Loader2, Trash2, Pencil, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQCContext } from "../../context/QCContext";

const t     = (v: any) => String(v ?? "").trim();
const fmt   = (v: any) => parseFloat(v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const today = () => new Date().toISOString().split("T")[0];

const qcPost = (url: string, body: any) =>
    fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        .then(r => r.json());

const toastConfirm = (msg: string, onConfirm: () => void) =>
    toast(msg, { duration: 10000, action: { label: "Confirm", onClick: onConfirm }, cancel: { label: "Cancel", onClick: () => {} } });

type SubTab2 = "warehouse-stock" | "invoiced-lots";

interface Props {
    onSendToWarehouse?: (row: any) => void;
    onEditTransfer?:    (row: any) => void;
}

export default function StockListTab({ onSendToWarehouse, onEditTransfer }: Props) {
    const qc   = useQueryClient();
    const { canCreate, canDelete, canEdit, refreshTrigger, triggerRefresh } = useQCContext();

    const [dateFrom,   setDateFrom]   = useState(today());
    const [dateTo,     setDateTo]     = useState(today());
    const [warehouse,  setWarehouse]  = useState("");
    const [search,     setSearch]     = useState("");
    const [searchKey,  setSearchKey]  = useState(0);
    const [page,       setPage]       = useState(1);
    const PAGE_SIZE = 50;

    const [selRow,     setSelRow]     = useState<any>(null);
    const [selStockRow,setSelStockRow]= useState<any>(null);
    const [selInvRow,  setSelInvRow]  = useState<any>(null);
    const [subTab,     setSubTab]     = useState<SubTab2>("warehouse-stock");

    // Physical warehouses dropdown
    const { data: physWarehouses = [] } = useQuery({
        queryKey: ["qc-phys-warehouses"],
        queryFn: () => qcPost("/api/qc/stock/physical-warehouses", {}),
        staleTime: 300000,
        select: (d: any) => d.data ?? [],
    });

    // Main packing list
    const { data: packingData, isFetching: loadingPacking } = useQuery({
        queryKey: ["qc-packing-list", searchKey, page, dateFrom, dateTo, warehouse, search],
        queryFn: () => qcPost("/api/qc/stock/list", {
            pageNo: page, pageSize: PAGE_SIZE,
            dateFrom, dateTo,
            warehouseUq: warehouse,
            search,
        }),
        enabled: searchKey > 0,
        staleTime: 0,
        select: (d: any) => d,
    });
    const packingRows = (packingData as any)?.data ?? [];
    const totalRecords = (packingData as any)?.total ?? 0;
    const totalPages   = Math.ceil(totalRecords / PAGE_SIZE) || 1;

    // Warehouse stock for selected row
    const { data: stockRows = [], isFetching: loadingStock } = useQuery({
        queryKey: ["qc-stock-by-box", selRow?.unico, refreshTrigger],
        queryFn: () => qcPost("/api/qc/stock/stock-by-box", { pkboxUq: selRow.unico }),
        enabled: !!selRow?.unico && subTab === "warehouse-stock",
        staleTime: 0,
        select: (d: any) => d.data ?? [],
    });

    // Invoiced lots for selected row
    const { data: invoicedRows = [], isFetching: loadingInv } = useQuery({
        queryKey: ["qc-invoiced-by-box", selRow?.unico],
        queryFn: () => qcPost("/api/qc/stock/invoiced-by-box", { pkboxUq: selRow.unico }),
        enabled: !!selRow?.unico && subTab === "invoiced-lots",
        staleTime: 0,
        select: (d: any) => d.data ?? [],
    });

    // Racks for selected invoice line
    const { data: racksRows = [], isFetching: loadingRacks } = useQuery({
        queryKey: ["qc-racks-by-invoice", selInvRow?.unico],
        queryFn: () => qcPost("/api/qc/stock/racks-by-invoice", { invoiceBoxUq: selInvRow.unico }),
        enabled: !!selInvRow?.unico && subTab === "invoiced-lots",
        staleTime: 0,
        select: (d: any) => d.data ?? [],
    });

    const deleteTransfer = useMutation({
        mutationFn: (row: any) => qcPost("/api/qc/stock/delete-transfer", {
            unico: row.unico,
            userUq: (window as any).__session?.user?.id ?? "",
        }),
        onSuccess: (d) => {
            if (!d.success) { toast.error(d.error || "Error"); return; }
            toast.success("Transfer deleted.");
            triggerRefresh();
            qc.invalidateQueries({ queryKey: ["qc-packing-list"] });
        },
    });

    const handleSelectRow = (row: any) => {
        setSelRow(row);
        setSelStockRow(null);
        setSelInvRow(null);
        qc.invalidateQueries({ queryKey: ["qc-stock-by-box",   row.unico] });
        qc.invalidateQueries({ queryKey: ["qc-invoiced-by-box", row.unico] });
    };

    return (
        <div className="flex flex-col h-full gap-2">
            {/* ── Filter bar ──────────────────────────────────── */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm px-3 py-2 flex flex-wrap items-center gap-3 shrink-0 text-xs">
                <div className="flex items-center gap-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">From</label>
                    <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="fos-input py-1 w-32"/>
                </div>
                <div className="flex items-center gap-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">To</label>
                    <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="fos-input py-1 w-32"/>
                </div>
                <div className="flex items-center gap-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Warehouse</label>
                    <select value={warehouse} onChange={e => setWarehouse(e.target.value)} className="fos-input py-1 w-44">
                        <option value="">— All —</option>
                        {(physWarehouses as any[]).map((w: any) => (
                            <option key={w.unico ?? w.wphysical_uq} value={w.unico ?? w.wphysical_uq}>{t(w.description ?? w.warehouse)}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Search</label>
                    <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && setSearchKey(k => k + 1)} placeholder="Description / AWB..." className="fos-input py-1 w-44"/>
                </div>
                <button onClick={() => { setPage(1); setSearchKey(k => k + 1); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FB7506] hover:bg-orange-600 text-white text-xs font-black rounded">
                    {loadingPacking ? <RefreshCcw size={11} className="animate-spin"/> : <Search size={11}/>} Packing List Boxes
                </button>
            </div>

            {/* ── Main packing grid ────────────────────────────── */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col overflow-hidden" style={{ maxHeight: "40vh" }}>
                <div className="h-8 bg-[#374151] flex items-center justify-between px-3 shrink-0">
                    <span className="text-white text-[10px] font-black uppercase tracking-widest">Stock List</span>
                    <div className="flex items-center gap-3">
                        {!loadingPacking && searchKey > 0 && <span className="text-gray-400 text-[10px]">{totalRecords} records</span>}
                        {loadingPacking && <Loader2 size={11} className="animate-spin text-gray-400"/>}
                        {selRow && canCreate && (
                            <button onClick={() => onSendToWarehouse?.(selRow)}
                                className="flex items-center gap-1 text-[10px] font-bold bg-green-600 hover:bg-green-700 text-white px-2 py-0.5 rounded">
                                <ArrowRight size={10}/> Send to Warehouse
                            </button>
                        )}
                    </div>
                </div>
                <div className="overflow-auto flex-1">
                    <table className="min-w-full text-xs text-left">
                        <thead className="bg-gray-100 border-b fos-grid-thead text-gray-700 sticky top-0">
                            <tr>{["AWBCode","Description","Grower","Customer","Lote","Boxes","Units","F.Cost","C.Cost","T.Cost","Price","Stock","Days","Inv.Date","Avail.Date"].map(h => (
                                <th key={h} className="p-1.5 border-r border-gray-200 last:border-r-0 whitespace-nowrap">{h}</th>
                            ))}</tr>
                        </thead>
                        <tbody className="fos-grid-tbody divide-y divide-gray-100">
                            {searchKey === 0 && <tr><td colSpan={15} className="p-6 text-center text-gray-400">Set filters and click Packing List Boxes to search.</td></tr>}
                            {searchKey > 0 && loadingPacking && <tr><td colSpan={15} className="p-6 text-center text-gray-400">Loading...</td></tr>}
                            {searchKey > 0 && !loadingPacking && packingRows.length === 0 && <tr><td colSpan={15} className="p-6 text-center text-gray-400">No results.</td></tr>}
                            {(packingRows as any[]).map((row: any) => (
                                <tr key={row.unico} onClick={() => handleSelectRow(row)}
                                    style={{ backgroundColor: row.backColor || undefined, color: row.foreColor || undefined }}
                                    className={cn("cursor-pointer transition-colors", selRow?.unico === row.unico ? "!bg-blue-100 ring-2 ring-inset ring-blue-300" : "hover:bg-blue-50")}>
                                    <td className="p-1.5 font-bold text-[#FB7506] whitespace-nowrap">{t(row.awbcode)}</td>
                                    <td className="p-1.5 max-w-[160px] truncate">{t(row.description)}</td>
                                    <td className="p-1.5 whitespace-nowrap">{t(row.grower)}</td>
                                    <td className="p-1.5 whitespace-nowrap">{t(row.customer)}</td>
                                    <td className="p-1.5 text-right">{row.lote}</td>
                                    <td className="p-1.5 text-right">{row.box_qty}</td>
                                    <td className="p-1.5 text-right">{row.total_units}</td>
                                    <td className="p-1.5 text-right">{fmt(row.f_cost_x_u)}</td>
                                    <td className="p-1.5 text-right">{fmt(row.c_cost_x_u)}</td>
                                    <td className="p-1.5 text-right">{fmt(row.t_cost_x_u)}</td>
                                    <td className="p-1.5 text-right">{fmt(row.price_x_u)}</td>
                                    <td className="p-1.5 text-right font-bold">{row.stock}</td>
                                    <td className="p-1.5 text-right">{row.days}</td>
                                    <td className="p-1.5 whitespace-nowrap">{t(row.InvoiceDate)?.split("T")[0]}</td>
                                    <td className="p-1.5 whitespace-nowrap">{t(row.AvailableDate)?.split("T")[0]}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {searchKey > 0 && totalPages > 1 && (
                    <div className="flex items-center gap-2 px-3 py-1.5 border-t bg-gray-50 text-xs shrink-0">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-2 py-0.5 border rounded disabled:opacity-40">‹</button>
                        <span className="text-gray-500">Page {page} of {totalPages}</span>
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-2 py-0.5 border rounded disabled:opacity-40">›</button>
                    </div>
                )}
            </div>

            {/* ── Sub-tabs ─────────────────────────────────────── */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col overflow-hidden flex-1 min-h-0">
                <div className="flex border-b shrink-0 bg-gray-50">
                    {[
                        { id: "warehouse-stock" as const, label: "Warehouse Stock" },
                        { id: "invoiced-lots"   as const, label: "Invoiced Stock Lots" },
                    ].map(st => (
                        <button key={st.id} onClick={() => setSubTab(st.id)}
                            className={cn("px-4 py-1.5 text-[10px] font-black uppercase tracking-wider transition-colors", subTab === st.id ? "border-b-2 border-[#FB7506] text-[#FB7506]" : "text-gray-500 hover:text-gray-800")}>
                            {st.label}
                        </button>
                    ))}
                </div>

                {/* Warehouse Stock sub-tab */}
                {subTab === "warehouse-stock" && (
                    <div className="flex-1 overflow-auto">
                        <table className="min-w-full text-xs text-left">
                            <thead className="bg-gray-100 border-b fos-grid-thead text-gray-700 sticky top-0">
                                <tr>{["Warehouse","Lote","Grower","Description","AWBCode","Inv.Type","Box Qty","In","Out","Hold","Stock","F.Cost","C.Cost","T.Cost","Price","Days","Actions"].map(h => (
                                    <th key={h} className="p-1.5 border-r border-gray-200 last:border-r-0 whitespace-nowrap">{h}</th>
                                ))}</tr>
                            </thead>
                            <tbody className="fos-grid-tbody divide-y divide-gray-100">
                                {!selRow && <tr><td colSpan={17} className="p-6 text-center text-gray-400">Select a row from the grid above.</td></tr>}
                                {selRow && loadingStock && <tr><td colSpan={17} className="p-6 text-center text-gray-400">Loading...</td></tr>}
                                {selRow && !loadingStock && (stockRows as any[]).length === 0 && <tr><td colSpan={17} className="p-6 text-center text-gray-400">No warehouse stock for this box.</td></tr>}
                                {(stockRows as any[]).map((row: any) => (
                                    <tr key={row.unico} onClick={() => setSelStockRow(row)}
                                        style={{ backgroundColor: row.backColor || undefined, color: row.foreColor || undefined }}
                                        className={cn("cursor-pointer transition-colors", selStockRow?.unico === row.unico ? "!bg-blue-100 ring-2 ring-inset ring-blue-300" : "hover:bg-blue-50")}>
                                        <td className="p-1.5 whitespace-nowrap">{t(row.warehouse)}</td>
                                        <td className="p-1.5 text-right">{row.lote}</td>
                                        <td className="p-1.5 whitespace-nowrap">{t(row.grower)}</td>
                                        <td className="p-1.5 max-w-[140px] truncate">{t(row.description)}</td>
                                        <td className="p-1.5 font-bold text-[#FB7506]">{t(row.awbcode)}</td>
                                        <td className="p-1.5">{t(row.inv_type)}</td>
                                        <td className="p-1.5 text-right">{row.wh_stock}</td>
                                        <td className="p-1.5 text-right text-green-600">{row.qty_in}</td>
                                        <td className="p-1.5 text-right text-red-500">{row.qty_out}</td>
                                        <td className="p-1.5 text-right">{row.qty_hold}</td>
                                        <td className="p-1.5 text-right font-bold">{row.stock}</td>
                                        <td className="p-1.5 text-right">{fmt(row.f_cost_x_u)}</td>
                                        <td className="p-1.5 text-right">{fmt(row.c_cost_x_u)}</td>
                                        <td className="p-1.5 text-right">{fmt(row.t_cost_x_u)}</td>
                                        <td className="p-1.5 text-right">{fmt(row.price_x_u)}</td>
                                        <td className="p-1.5 text-right">{row.days}</td>
                                        <td className="p-1.5">
                                            <div className="flex gap-1">
                                                {canEdit && (
                                                    <button onClick={e => { e.stopPropagation(); onEditTransfer?.(row); }}
                                                        className="text-amber-500 hover:text-amber-700" title="Transfer Warehouse">
                                                        <Pencil size={12}/>
                                                    </button>
                                                )}
                                                {canDelete && (
                                                    <button onClick={e => { e.stopPropagation(); toastConfirm("Delete this transfer?", () => deleteTransfer.mutate(row)); }}
                                                        className="text-red-500 hover:text-red-700" title="Delete Transfer">
                                                        <Trash2 size={12}/>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Invoiced Lots sub-tab */}
                {subTab === "invoiced-lots" && (
                    <div className="flex flex-1 gap-2 overflow-hidden p-2">
                        <div className="flex-1 overflow-auto border rounded">
                            <table className="min-w-full text-xs text-left">
                                <thead className="bg-gray-100 border-b fos-grid-thead text-gray-700 sticky top-0">
                                    <tr>{["Invoice","Customer","Date","Lote","Description","Box Qty","Units","Price","Ext Price","Status","Scan Qty"].map(h => (
                                        <th key={h} className="p-1.5 border-r border-gray-200 last:border-r-0 whitespace-nowrap">{h}</th>
                                    ))}</tr>
                                </thead>
                                <tbody className="fos-grid-tbody divide-y divide-gray-100">
                                    {!selRow && <tr><td colSpan={11} className="p-6 text-center text-gray-400">Select a box row above.</td></tr>}
                                    {selRow && loadingInv && <tr><td colSpan={11} className="p-6 text-center text-gray-400">Loading...</td></tr>}
                                    {(invoicedRows as any[]).map((row: any) => (
                                        <tr key={row.unico} onClick={() => setSelInvRow(row)}
                                            className={cn("cursor-pointer transition-colors", selInvRow?.unico === row.unico ? "!bg-blue-100 ring-2 ring-inset ring-blue-300" : "hover:bg-blue-50")}>
                                            <td className="p-1.5 font-bold">{t(row.invoice_no)}</td>
                                            <td className="p-1.5 whitespace-nowrap">{t(row.customer)}</td>
                                            <td className="p-1.5 whitespace-nowrap">{t(row.invoice_date)?.split("T")[0]}</td>
                                            <td className="p-1.5 text-right">{row.lote}</td>
                                            <td className="p-1.5 max-w-[120px] truncate">{t(row.description)}</td>
                                            <td className="p-1.5 text-right">{row.box_qty}</td>
                                            <td className="p-1.5 text-right">{row.total_units}</td>
                                            <td className="p-1.5 text-right">{fmt(row.price)}</td>
                                            <td className="p-1.5 text-right font-bold">{fmt(row.ext_price)}</td>
                                            <td className="p-1.5">{t(row.status)}</td>
                                            <td className="p-1.5 text-right">{row.scan_qty}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {selInvRow && (
                            <div className="w-56 flex flex-col overflow-hidden border rounded">
                                <div className="h-7 bg-[#374151] flex items-center px-2 shrink-0">
                                    <span className="text-white text-[10px] font-bold uppercase">Racks</span>
                                    {loadingRacks && <Loader2 size={10} className="animate-spin text-gray-400 ml-2"/>}
                                </div>
                                <div className="overflow-auto flex-1">
                                    <table className="min-w-full text-xs">
                                        <thead className="bg-gray-100 border-b fos-grid-thead text-gray-700 sticky top-0">
                                            <tr><th className="p-1.5">Barcode</th><th className="p-1.5">Rack</th><th className="p-1.5">Time</th></tr>
                                        </thead>
                                        <tbody className="fos-grid-tbody divide-y divide-gray-100">
                                            {(racksRows as any[]).map((r: any, i: number) => (
                                                <tr key={i} className="hover:bg-gray-50">
                                                    <td className="p-1.5 font-mono text-[10px]">{t(r.barcode)}</td>
                                                    <td className="p-1.5">{t(r.rack)}</td>
                                                    <td className="p-1.5 text-[10px] text-gray-400">{t(r.ScanTime)?.substring(0, 16)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
