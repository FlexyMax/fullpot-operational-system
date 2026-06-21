"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Download, ChevronDown, X, Trash2, Pencil, ArrowRight, Package, Warehouse, FileText, ScanLine } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQCContext } from "../../context/QCContext";
const EMPTY_ARR: any[] = [];

const t   = (v: any) => String(v ?? "").trim();
const fmt = (v: any) => parseFloat(v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const today = () => new Date().toISOString().split("T")[0];

const qcPost = (url: string, body: any) =>
    fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        .then(r => r.json());

const toastConfirm = (msg: string, fn: () => void) =>
    toast(msg, { duration: 10000, action: { label: "Confirm", onClick: fn }, cancel: { label: "Cancel", onClick: () => {} } });


type SubTab = "warehouse-stock" | "invoiced-lots";

interface Props {
    onSendToWarehouse?: (row: any) => void;
    onEditTransfer?:    (row: any) => void;
    onAddQC?:           (lot: any) => void;
}

// ── Help icon ────────────────────────────────────────────────────────────────
function HelpIcon() {
    return (
        <span className="w-4 h-4 rounded-full border border-gray-400 text-gray-400 text-[9px] font-bold flex items-center justify-center shrink-0 cursor-default select-none">?</span>
    );
}

// ── Grid toolbar ─────────────────────────────────────────────────────────────
function GridToolbar({ total, page, totalPages, onPage }:
    { total: number; page: number; totalPages: number; onPage: (p: number) => void }) {
    return (
        <div className="h-9 border-b border-[#DBD9D9] flex items-center px-3 gap-3 shrink-0 bg-white text-xs justify-between">
            <div className="flex items-center gap-2 text-gray-400 min-w-0">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" placeholder="Search..." className="outline-none text-[11px] w-32 text-black placeholder-gray-400"/>
            </div>
            <div className="flex items-center gap-3 shrink-0">
                <button className="flex items-center gap-1 text-gray-500 hover:text-black font-semibold">
                    <Download size={11}/> <span className="text-[10px]">Download</span>
                </button>
                {total > 0 && (
                    <span className="text-[10px] text-gray-500 whitespace-nowrap">{total.toLocaleString()} Records</span>
                )}
                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                    <button onClick={() => onPage(page - 1)} disabled={page <= 1} className="p-0.5 rounded hover:bg-gray-100 disabled:opacity-30">‹</button>
                    <span>Page <span className="font-bold">{page}</span> of {totalPages}</span>
                    <button onClick={() => onPage(page + 1)} disabled={page >= totalPages} className="p-0.5 rounded hover:bg-gray-100 disabled:opacity-30">›</button>
                </div>
            </div>
        </div>
    );
}

// ── Sub-grid toolbar (header bar) ─────────────────────────────────────────────
function SubGridHeader({ title, icon: Icon, actions }: { title: string; icon?: LucideIcon; actions?: React.ReactNode }) {
    return (
        <div className="h-8 bg-white flex items-center justify-between px-3 shrink-0 rounded-t-lg border-b border-[#DBD9D9]">
            <div className="flex items-center gap-2 min-w-0">
                {Icon && <Icon size={14} className="text-[#FB7506] shrink-0"/>}
                <span className="text-[#4F4F4F] text-[14px] font-bold uppercase tracking-tight truncate">{title}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <RefreshCw size={12} className="text-gray-400 cursor-pointer hover:text-[#FB7506]"/>
                {actions}
            </div>
        </div>
    );
}

function ScanPanel({ title, icon: Icon, rows, loading }: { title: string; icon?: LucideIcon; rows: any[]; loading: boolean }) {
    return (
        <div className="w-80 flex flex-col border-l border-[#DBD9D9] shrink-0 overflow-hidden">
            <div className="h-8 bg-white flex items-center justify-between px-3 shrink-0 border-b border-[#DBD9D9]">
                <div className="flex items-center gap-2 min-w-0">
                    {Icon && <Icon size={14} className="text-[#FB7506] shrink-0"/>}
                    <span className="text-[#4F4F4F] text-[14px] font-bold uppercase tracking-tight truncate">{title}</span>
                </div>
                <RefreshCw size={12} className="text-gray-400 cursor-pointer hover:text-[#FB7506]"/>
            </div>
            <GridToolbar total={rows.length} page={1} totalPages={1} onPage={() => {}}/>
            <div className="overflow-auto flex-1">
                <table className="min-w-full text-xs">
                    <thead className="bg-[#4F4F4F] text-white font-bold text-[11px] uppercase sticky top-0">
                        <tr>{["ScanTime","Barcode","Rack","Grower"].map(h => <th key={h} className="p-1.5 whitespace-nowrap">{h}</th>)}</tr>
                    </thead>
                    <tbody className="fos-grid-tbody divide-y divide-[#DBD9D9]">
                        {loading && <tr><td colSpan={4} className="p-4 text-center text-gray-400">Loading...</td></tr>}
                        {!loading && rows.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-gray-300 italic">No scan data</td></tr>}
                        {(rows as any[]).map((r, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                                <td className="p-1.5 whitespace-nowrap text-[10px] text-green-600 font-semibold">{t(r.ScanTime)?.replace("T", " ").substring(0, 16)}</td>
                                <td className="p-1.5 font-bold text-blue-600 text-[10px]">{t(r.barcode)}</td>
                                <td className="p-1.5 text-[10px]">{t(r.rack)}</td>
                                <td className="p-1.5 text-[10px] truncate max-w-[80px]">{t(r.grower)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function StockListTab({ onSendToWarehouse, onEditTransfer, onAddQC }: Props) {
    const qc    = useQueryClient();
    const { canCreate, canEdit, canDelete, refreshTrigger, triggerRefresh } = useQCContext();

    // Filters
    const [dateFrom,  setDateFrom]  = useState(today());
    const [dateTo,    setDateTo]    = useState(today());
    const [warehouse, setWarehouse] = useState("%"); // "%" = ALL (matches physical_list unico for ALL)
    const [search,    setSearch]    = useState("");
    const [page,      setPage]      = useState(1);
    const PAGE_SIZE = 20;

    // Selection
    const [selRow,     setSelRow]     = useState<any>(null);
    const [selStock,   setSelStock]   = useState<any>(null);
    const [selInvoice, setSelInvoice] = useState<any>(null);
    const [subTab,     setSubTab]     = useState<SubTab>("warehouse-stock");

    // Physical warehouses
    const { data: physWarehouses = EMPTY_ARR } = useQuery({
        queryKey: ["qc-phys-warehouses"],
        queryFn: () => qcPost("/api/qc/stock/physical-warehouses", {}),
        staleTime: 300000,
        select: (d: any) => d.data ?? [],
    });

    // Main packing list
    const { data: packingResp, isFetching: loadingPacking, refetch: refetchPacking } = useQuery({
        queryKey: ["qc-packing", page, dateFrom, dateTo, warehouse, search],
        queryFn: () => qcPost("/api/qc/stock/list", {
            pageNo: page, pageSize: PAGE_SIZE,
            dateFrom, dateTo,
            warehouseUq: warehouse,
            search: search || "",
        }),
        staleTime: 0,
        select: (d: any) => d,
    });
    const packingRows  = (packingResp as any)?.data ?? [];
    const totalRecords = (packingResp as any)?.data?.[0]?.QueryTotalRecords ?? (packingResp as any)?.total ?? 0;
    const totalPages   = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));

    // Lots Scan IN (right panel — always refreshes with selected row)
    const { data: scanInRows = EMPTY_ARR, isFetching: loadingScanIn } = useQuery({
        queryKey: ["qc-scan-in", selRow?.unico, refreshTrigger],
        queryFn: () => qcPost("/api/qc/stock/racks-by-lot", { pkboxUq: selRow.unico }),
        enabled: !!selRow?.unico,
        staleTime: 0,
        select: (d: any) => d.data ?? [],
    });

    // Warehouse stock (sub-tab 1)
    const { data: stockRows = EMPTY_ARR, isFetching: loadingStock } = useQuery({
        queryKey: ["qc-stock-by-box", selRow?.unico, refreshTrigger],
        queryFn: () => qcPost("/api/qc/stock/stock-by-box", { pkboxUq: selRow.unico }),
        enabled: !!selRow?.unico && subTab === "warehouse-stock",
        staleTime: 0,
        select: (d: any) => d.data ?? [],
    });

    // Invoiced lots (sub-tab 2)
    const { data: invoiceRows = EMPTY_ARR, isFetching: loadingInvoice } = useQuery({
        queryKey: ["qc-invoiced-by-box", selRow?.unico],
        queryFn: () => qcPost("/api/qc/stock/invoiced-by-box", { pkboxUq: selRow.unico }),
        enabled: !!selRow?.unico && subTab === "invoiced-lots",
        staleTime: 0,
        select: (d: any) => d.data ?? [],
    });

    // Invoice Lots Scan OUT (right panel for sub-tab 2)
    const { data: scanOutRows = EMPTY_ARR, isFetching: loadingScanOut } = useQuery({
        queryKey: ["qc-scan-out", selInvoice?.unico],
        queryFn: () => qcPost("/api/qc/stock/racks-by-invoice", { invoiceBoxUq: selInvoice.unico }),
        enabled: !!selInvoice?.unico && subTab === "invoiced-lots",
        staleTime: 0,
        select: (d: any) => d.data ?? [],
    });

    const deleteTransfer = useMutation({
        mutationFn: (row: any) => qcPost("/api/qc/stock/delete-transfer", { unico: row.unico, userUq: "" }),
        onSuccess: (d) => {
            if (!d.success) { toast.error(d.error || "Error"); return; }
            toast.success("Transfer deleted.");
            triggerRefresh();
        },
    });

    const handleSelectRow = (row: any) => {
        setSelRow(row);
        setSelStock(null);
        setSelInvoice(null);
        qc.invalidateQueries({ queryKey: ["qc-scan-in",       row.unico] });
        qc.invalidateQueries({ queryKey: ["qc-stock-by-box",  row.unico] });
        qc.invalidateQueries({ queryKey: ["qc-invoiced-by-box", row.unico] });
    };

    return (
        <div className="flex flex-col h-full gap-1.5 text-xs">

            {/* ── Filter bar ─────────────────────────────────── */}
            <div className="bg-[#F5F3F3] rounded-lg border border-[#DBD9D9] shadow-sm px-3 py-2 flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1.5">
                    <HelpIcon/>
                    <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="fos-input py-1 w-32 text-[11px]"/>
                </div>
                <div className="flex items-center gap-1.5">
                    <HelpIcon/>
                    <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="fos-input py-1 w-32 text-[11px]"/>
                </div>
                {/* Warehouse select with clear */}
                <div className="flex items-center gap-1.5">
                    <HelpIcon/>
                    <div className="relative flex items-center">
                        <select value={warehouse} onChange={e => setWarehouse(e.target.value)}
                            className="fos-input py-1 w-36 text-[11px] pr-12 appearance-none">
                            <option value="%">ALL</option>
                            {(physWarehouses as any[]).map((w: any) => (
                                <option key={w.unico ?? w.wphysical_uq} value={w.unico ?? w.wphysical_uq}>{t(w.description ?? w.warehouse)}</option>
                            ))}
                        </select>
                        <div className="absolute right-1 flex items-center gap-0.5 pointer-events-none">
                            {warehouse && warehouse !== "%" && (
                                <button className="pointer-events-auto" onClick={() => setWarehouse("%")}>
                                    <X size={10} className="text-gray-400 hover:text-gray-700"/>
                                </button>
                            )}
                            <ChevronDown size={10} className="text-gray-400"/>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 flex-1">
                    <HelpIcon/>
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && refetchPacking()}
                        placeholder="Lot, AWB Code, Farm, Product"
                        className="fos-input py-1 flex-1 text-[11px] min-w-0"/>
                </div>
                <button onClick={() => { setPage(1); refetchPacking(); }}
                    className={cn("p-1.5 rounded-full transition-colors shrink-0", loadingPacking ? "text-gray-300" : "text-green-500 hover:bg-green-50")}>
                    <RefreshCw size={14} className={loadingPacking ? "animate-spin" : ""}/>
                </button>
            </div>

            {/* ── Main split: packing grid + Lots Scan IN ─────── */}
            <div className="flex bg-white rounded-lg border border-[#DBD9D9] shadow-sm overflow-hidden flex-[3] min-h-0">
                {/* Packing grid */}
                <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                    <div className="h-8 bg-white flex items-center justify-between px-3 shrink-0 border-b border-[#DBD9D9]">
                        <div className="flex items-center gap-2 min-w-0">
                            <Package size={14} className="text-[#FB7506] shrink-0"/>
                            <span className="text-[#4F4F4F] text-[14px] font-bold uppercase tracking-tight truncate">Packing List Boxes</span>
                        </div>
                        <RefreshCw size={12} className="text-gray-400 cursor-pointer hover:text-[#FB7506]" onClick={() => refetchPacking()}/>
                    </div>
                    <GridToolbar
                        total={totalRecords}
                        page={page} totalPages={totalPages}
                        onPage={p => setPage(p)}
                    />
                    <div className="overflow-auto flex-1">
                        <table className="min-w-full text-xs text-left">
                            <thead className="bg-[#4F4F4F] text-white font-bold text-[11px] uppercase sticky top-0 z-10">
                                <tr>
                                    <th className="p-1.5 w-10">+QC</th>
                                    <th className="p-1.5 whitespace-nowrap">AvailableDate</th>
                                    <th className="p-1.5 whitespace-nowrap">InvoiceDate</th>
                                    <th className="p-1.5 whitespace-nowrap">PbookDate</th>
                                    <th className="p-1.5 whitespace-nowrap">Warehouse</th>
                                    <th className="p-1.5 whitespace-nowrap">ReadyTran</th>
                                    <th className="p-1.5 min-w-[220px]">Description</th>
                                    <th className="p-1.5 whitespace-nowrap">SOrder No</th>
                                    <th className="p-1.5 whitespace-nowrap">AWBCode</th>
                                    <th className="p-1.5 text-right">Lot</th>
                                    <th className="p-1.5 text-right">BoxQty</th>
                                </tr>
                            </thead>
                            <tbody className="fos-grid-tbody divide-y divide-[#DBD9D9]">
                                {loadingPacking && <tr><td colSpan={11} className="p-6 text-center text-gray-400">Loading...</td></tr>}
                                {!loadingPacking && packingRows.length === 0 && (
                                    <tr><td colSpan={11} className="p-6 text-center text-gray-400">No results for the selected filters.</td></tr>
                                )}
                                {(packingRows as any[]).map((row: any) => {
                                    const isSelected = selRow?.unico === row.unico;
                                    const boxColor   = row.foreColor ?? (Number(row.box_qty) >= 50 ? "#f97316" : Number(row.box_qty) >= 20 ? "#22c55e" : undefined);
                                    return (
                                        <tr key={row.unico} onClick={() => handleSelectRow(row)}
                                            style={{ backgroundColor: isSelected ? undefined : (row.backColor || undefined) }}
                                            className={cn("cursor-pointer transition-colors", isSelected ? "!bg-[#FB7506]/10" : "hover:bg-gray-50")}>
                                            <td className="p-1 text-center" onClick={e => e.stopPropagation()}>
                                                {canCreate && (
                                                    <button onClick={() => onAddQC?.(row)}
                                                        className="px-1.5 py-0.5 bg-green-500 hover:bg-green-600 text-white text-[9px] font-black rounded">
                                                        QC
                                                    </button>
                                                )}
                                            </td>
                                            <td className="p-1.5 whitespace-nowrap">{t(row.AvailableDate)?.split("T")[0]}</td>
                                            <td className="p-1.5 whitespace-nowrap">{t(row.InvoiceDate)?.split("T")[0]}</td>
                                            <td className="p-1.5 whitespace-nowrap">{t(row.pb_date ?? row.PbookDate)?.split("T")[0]}</td>
                                            <td className="p-1.5 whitespace-nowrap max-w-[90px] truncate">{t(row.warehouse ?? row.Warehouse)}</td>
                                            <td className="p-1.5 text-center">{row.ready_tran ? "✓" : ""}</td>
                                            <td className="p-1.5 font-semibold truncate max-w-[220px]"
                                                style={{ color: row.foreColor ?? "#f97316" }}>
                                                {t(row.description)}
                                            </td>
                                            <td className="p-1.5 whitespace-nowrap">{t(row.sorder_no)}</td>
                                            <td className="p-1.5 whitespace-nowrap font-mono">{t(row.awbcode)}</td>
                                            <td className="p-1.5 text-right">{row.lote}</td>
                                            <td className="p-1.5 text-right font-black" style={{ color: boxColor }}>
                                                {row.box_qty}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right: Lots Scan IN */}
                <ScanPanel title="Lots Scan IN" icon={ScanLine} rows={scanInRows as any[]} loading={loadingScanIn}/>
            </div>

            {/* ── Bottom: sub-tabs ────────────────────────────── */}
            <div className="flex flex-col bg-white rounded-lg border border-[#DBD9D9] shadow-sm overflow-hidden flex-[2] min-h-0">
                {/* Sub-tab bar */}
                <div className="h-10 bg-[#F5F3F3] border-b border-[#DBD9D9] flex items-end px-2 shrink-0 gap-0.5">
                    {[
                        { id: "warehouse-stock" as SubTab, label: "Warehouse Stock" },
                        { id: "invoiced-lots"   as SubTab, label: "Invoiced Stock Lots" },
                    ].map(s => (
                        <button key={s.id} onClick={() => setSubTab(s.id)}
                            className={cn("flex items-center px-3 h-8 text-[10px] font-black uppercase tracking-wider rounded-t transition-all",
                                subTab === s.id ? "bg-white text-[#FB7506] border-b-2 border-[#FB7506]" : "text-gray-500 hover:text-[#FB7506] hover:bg-white/60")}>
                            {s.label}
                        </button>
                    ))}
                </div>

                {/* Sub-tab content */}
                <div className="flex flex-1 min-h-0 overflow-hidden">

                    {/* Warehouse Stock */}
                    {subTab === "warehouse-stock" && (
                        <div className="flex flex-col flex-1 overflow-hidden">
                            <SubGridHeader title="Packing List Boxes transferred to Stock" icon={Warehouse}
                                actions={
                                    canCreate && selRow ? (
                                        <button onClick={() => onSendToWarehouse?.(selRow)}
                                            className="flex items-center gap-1 text-[10px] font-bold bg-[#FB7506] hover:bg-orange-500 text-white px-2 py-0.5 rounded">
                                            <ArrowRight size={9}/> Send to Warehouse
                                        </button>
                                    ) : undefined
                                }
                            />
                            <GridToolbar total={(stockRows as any[]).length} page={1} totalPages={1} onPage={() => {}}/>
                            <div className="overflow-auto flex-1">
                                <table className="min-w-full text-xs text-left">
                                    <thead className="bg-[#4F4F4F] text-white font-bold text-[11px] uppercase sticky top-0">
                                        <tr>{["Warehouse","Lot","Grower","inv_type","Days","QtyIn","QtyOut","QtyHold","WHStock","Stock","Flower CostxU","Landing CostxU","Total CostxU","PricexU","UnitsBox","BoxID","Actions"].map(h => (
                                            <th key={h} className="p-1.5 whitespace-nowrap">{h}</th>
                                        ))}</tr>
                                    </thead>
                                    <tbody className="fos-grid-tbody divide-y divide-[#DBD9D9]">
                                        {!selRow && <tr><td colSpan={17} className="p-6 text-center text-gray-400">Select a packing row above.</td></tr>}
                                        {selRow && loadingStock && <tr><td colSpan={17} className="p-6 text-center text-gray-400">Loading...</td></tr>}
                                        {selRow && !loadingStock && (stockRows as any[]).length === 0 && <tr><td colSpan={17} className="p-6 text-center text-gray-300 italic">No warehouse stock for this box.</td></tr>}
                                        {(stockRows as any[]).map((row: any) => (
                                            <tr key={row.unico} onClick={() => setSelStock(row)}
                                                style={{ backgroundColor: row.backColor || undefined, color: row.foreColor || undefined }}
                                                className={cn("cursor-pointer transition-colors", selStock?.unico === row.unico ? "!bg-[#FB7506]/10" : "hover:bg-gray-50")}>
                                                <td className="p-1.5 whitespace-nowrap truncate max-w-[100px]">{t(row.warehouse)}</td>
                                                <td className="p-1.5 text-right">{row.lote}</td>
                                                <td className="p-1.5 whitespace-nowrap truncate max-w-[80px]">{t(row.grower)}</td>
                                                <td className="p-1.5">{t(row.inv_type)}</td>
                                                <td className="p-1.5 text-right">{row.days}</td>
                                                <td className="p-1.5 text-right text-green-600">{row.qty_in}</td>
                                                <td className="p-1.5 text-right text-red-500">{row.qty_out}</td>
                                                <td className="p-1.5 text-right">{row.qty_hold}</td>
                                                <td className="p-1.5 text-right">{row.wh_stock}</td>
                                                <td className="p-1.5 text-right font-bold">{row.stock}</td>
                                                <td className="p-1.5 text-right">{fmt(row.f_cost_x_u)}</td>
                                                <td className="p-1.5 text-right">{fmt(row.c_cost_x_u)}</td>
                                                <td className="p-1.5 text-right">{fmt(row.t_cost_x_u)}</td>
                                                <td className="p-1.5 text-right">{fmt(row.price_x_u)}</td>
                                                <td className="p-1.5 text-right">{row.tunits_x_box}</td>
                                                <td className="p-1.5 whitespace-nowrap truncate max-w-[80px]">{t(row.box_id)}</td>
                                                <td className="p-1.5">
                                                    <div className="flex gap-1">
                                                        {canEdit && <button onClick={e => { e.stopPropagation(); onEditTransfer?.(row); }} className="text-amber-500 hover:text-amber-700" title="Edit Transfer"><Pencil size={11}/></button>}
                                                        {canDelete && <button onClick={e => { e.stopPropagation(); toastConfirm("Delete this transfer?", () => deleteTransfer.mutate(row)); }} className="text-red-500 hover:text-red-700" title="Delete Transfer"><Trash2 size={11}/></button>}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Invoiced Stock Lots */}
                    {subTab === "invoiced-lots" && (
                        <>
                            <div className="flex flex-col flex-1 overflow-hidden">
                                <SubGridHeader title="Invoiced Stock Lots" icon={FileText}/>
                                <GridToolbar total={(invoiceRows as any[]).length} page={1} totalPages={1} onPage={() => {}}/>
                                <div className="overflow-auto flex-1">
                                    <table className="min-w-full text-xs text-left">
                                        <thead className="bg-[#4F4F4F] text-white font-bold text-[11px] uppercase sticky top-0">
                                            <tr>{["InvoiceNo","Invoice Date","Customer","Description","Lot","BoxQty","void","Status","ScanQty","UxBox","Price","TUnits","ExtPrice","Case"].map(h => (
                                                <th key={h} className="p-1.5 whitespace-nowrap">{h}</th>
                                            ))}</tr>
                                        </thead>
                                        <tbody className="fos-grid-tbody divide-y divide-[#DBD9D9]">
                                            {!selRow && <tr><td colSpan={14} className="p-6 text-center text-gray-400">Select a packing row above.</td></tr>}
                                            {selRow && loadingInvoice && <tr><td colSpan={14} className="p-6 text-center text-gray-400">Loading...</td></tr>}
                                            {selRow && !loadingInvoice && (invoiceRows as any[]).length === 0 && <tr><td colSpan={14} className="p-6 text-center text-gray-300 italic">No invoiced lots.</td></tr>}
                                            {(invoiceRows as any[]).map((row: any) => (
                                                <tr key={row.unico} onClick={() => setSelInvoice(row)}
                                                    className={cn("cursor-pointer transition-colors", selInvoice?.unico === row.unico ? "!bg-[#FB7506]/10" : "hover:bg-gray-50")}>
                                                    <td className="p-1.5 font-bold text-purple-600 whitespace-nowrap">{t(row.invoice_no)}</td>
                                                    <td className="p-1.5 whitespace-nowrap">{t(row.invoice_date)?.split("T")[0]}</td>
                                                    <td className="p-1.5 whitespace-nowrap truncate max-w-[100px]">{t(row.customer)}</td>
                                                    <td className="p-1.5 font-semibold text-green-600 truncate max-w-[140px]">{t(row.description)}</td>
                                                    <td className="p-1.5 text-right">{row.lote}</td>
                                                    <td className="p-1.5 text-right font-bold text-[#FB7506]">{row.box_qty}</td>
                                                    <td className="p-1.5">{row.void ? "Yes" : "No"}</td>
                                                    <td className="p-1.5">{t(row.status)}</td>
                                                    <td className="p-1.5 text-right">{row.scan_qty}</td>
                                                    <td className="p-1.5 text-right">{row.units_x_box}</td>
                                                    <td className="p-1.5 text-right text-[#FB7506]">${fmt(row.price)}</td>
                                                    <td className="p-1.5 text-right">{row.total_units}</td>
                                                    <td className="p-1.5 text-right font-bold text-[#FB7506]">${fmt(row.ext_price)}</td>
                                                    <td className="p-1.5">{t(row.case_sh)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            {/* Invoice Lots Scan OUT panel */}
                            <ScanPanel title="Invoice Lots Scan OUT" icon={ScanLine} rows={scanOutRows as any[]} loading={loadingScanOut}/>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
