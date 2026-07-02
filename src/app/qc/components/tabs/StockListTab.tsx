"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, ChevronDown, X, Trash2, Pencil, ArrowRight, Package, Warehouse, FileText, ScanLine, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import PanelGrid from "@/components/ui/PanelGrid";
import { AuditLogModal } from "@/components/AuditLogModal";
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

function HelpIcon() {
    return (
        <span className="w-4 h-4 rounded-full border border-gray-400 text-gray-400 text-[9px] font-bold flex items-center justify-center shrink-0 cursor-default select-none">?</span>
    );
}

const PAGE_SIZE = 20;

export default function StockListTab({ onSendToWarehouse, onEditTransfer, onAddQC }: Props) {
    const qc    = useQueryClient();
    const { canCreate, canEdit, canDelete, refreshTrigger, triggerRefresh } = useQCContext();

    const [dateFrom,  setDateFrom]  = useState(today());
    const [dateTo,    setDateTo]    = useState(today());
    const [warehouse, setWarehouse] = useState("%");
    const [search,    setSearch]    = useState("");

    const [selRow,     setSelRow]     = useState<any>(null);
    const [selStock,   setSelStock]   = useState<any>(null);
    const [selInvoice, setSelInvoice] = useState<any>(null);
    const [subTab,     setSubTab]     = useState<SubTab>("warehouse-stock");
    const [scanModal,  setScanModal]  = useState(false);

    const sentinelRef = useRef<HTMLDivElement>(null);

    const { data: physWarehouses = EMPTY_ARR } = useQuery({
        queryKey: ["qc-phys-warehouses"],
        queryFn: () => qcPost("/api/qc/stock/physical-warehouses", {}),
        staleTime: 300000,
        select: (d: any) => d.data ?? [],
    });

    const {
        data: packingData,
        isFetching: loadingPacking,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        refetch: refetchPacking,
    } = useInfiniteQuery({
        queryKey: ["qc-packing", dateFrom, dateTo, warehouse, search],
        queryFn: ({ pageParam }: { pageParam: number }) =>
            qcPost("/api/qc/stock/list", {
                pageNo: pageParam, pageSize: PAGE_SIZE,
                dateFrom, dateTo, warehouseUq: warehouse, search: search || "",
            }),
        initialPageParam: 1,
        getNextPageParam: (lastPage: any, allPages) => {
            const total  = lastPage?.data?.[0]?.QueryTotalRecords ?? 0;
            const loaded = allPages.reduce((acc: number, p: any) => acc + (p?.data?.length ?? 0), 0);
            return loaded < total ? allPages.length + 1 : undefined;
        },
        staleTime: 0,
    });

    const packingRows  = packingData?.pages.flatMap((p: any) => p?.data ?? []) ?? [];
    const totalRecords = packingData?.pages[0]?.data?.[0]?.QueryTotalRecords ?? 0;
    const countLabel: string | number | undefined = packingRows.length > 0
        ? (totalRecords && totalRecords !== packingRows.length ? `${packingRows.length} / ${totalRecords}` : packingRows.length)
        : undefined;

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;
        const obs = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage)
                fetchNextPage();
        }, { rootMargin: "150px" });
        obs.observe(el);
        return () => obs.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const { data: scanInRows = EMPTY_ARR, isFetching: loadingScanIn, refetch: refetchScanIn } = useQuery({
        queryKey: ["qc-scan-in", selRow?.unico, refreshTrigger],
        queryFn: () => qcPost("/api/qc/stock/racks-by-lot", { pkboxUq: selRow.unico }),
        enabled: !!selRow?.unico,
        staleTime: 0,
        select: (d: any) => d.data ?? [],
    });

    const { data: stockRows = EMPTY_ARR, isFetching: loadingStock, refetch: refetchStock } = useQuery({
        queryKey: ["qc-stock-by-box", selRow?.unico, refreshTrigger],
        queryFn: () => qcPost("/api/qc/stock/stock-by-box", { pkboxUq: selRow.unico }),
        enabled: !!selRow?.unico && subTab === "warehouse-stock",
        staleTime: 0,
        select: (d: any) => d.data ?? [],
    });

    const { data: invoiceRows = EMPTY_ARR, isFetching: loadingInvoice, refetch: refetchInvoice } = useQuery({
        queryKey: ["qc-invoiced-by-box", selRow?.unico],
        queryFn: () => qcPost("/api/qc/stock/invoiced-by-box", { pkboxUq: selRow.unico }),
        enabled: !!selRow?.unico && subTab === "invoiced-lots",
        staleTime: 0,
        select: (d: any) => d.data ?? [],
    });

    const { data: scanOutRows = EMPTY_ARR, isFetching: loadingScanOut, refetch: refetchScanOut } = useQuery({
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
        qc.invalidateQueries({ queryKey: ["qc-scan-in",         row.unico] });
        qc.invalidateQueries({ queryKey: ["qc-stock-by-box",    row.unico] });
        qc.invalidateQueries({ queryKey: ["qc-invoiced-by-box", row.unico] });
    };

    return (
        <div className="flex flex-col h-full gap-1.5 text-xs">

            {/* ── Filter bar ───────────────────────────────────── */}
            <div className="bg-[#F5F3F3] rounded-lg border border-[#DBD9D9] shadow-sm px-3 py-2 flex flex-wrap items-center gap-3 shrink-0">
                <div className="flex items-center gap-1.5">
                    <HelpIcon/>
                    <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="fos-input py-1 w-32 text-[11px]"/>
                </div>
                <div className="flex items-center gap-1.5">
                    <HelpIcon/>
                    <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="fos-input py-1 w-32 text-[11px]"/>
                </div>
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
                <div className="flex items-center gap-1.5 flex-1 min-w-[160px]">
                    <HelpIcon/>
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && refetchPacking()}
                        placeholder="Lot, AWB Code, Farm, Product"
                        className="fos-input py-1 flex-1 text-[11px] min-w-0"/>
                </div>
                <button onClick={() => refetchPacking()}
                    className={cn("p-1.5 rounded-full transition-colors shrink-0", loadingPacking ? "text-gray-300" : "text-green-500 hover:bg-green-50")}>
                    <RefreshCw size={14} className={loadingPacking ? "animate-spin" : ""}/>
                </button>
            </div>

            {/* ── Main split: packing grid + Lots Scan IN ──────── */}
            <div className="flex gap-1.5 flex-[3] min-h-0">
                <PanelGrid
                    title="Packing List Boxes"
                    icon={Package}
                    recordCount={countLabel}
                    onRefresh={() => refetchPacking()}
                    refreshing={loadingPacking}
                    onDownload={() => {}}
                    headerRight={
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => selRow ? setScanModal(true) : toast.error("Select a row first")}
                                className="md:hidden flex items-center gap-1 h-7 px-2 text-[10px] font-bold bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                            >
                                <ScanLine size={12}/> Scan
                            </button>
                            <AuditLogModal recordId={selRow?.unico} disabled={!selRow}/>
                        </div>
                    }
                    className="flex-1 min-w-0 shadow-sm"
                >
                    <table className="min-w-full text-xs text-left">
                        <thead className="bg-[#4F4F4F] text-white font-bold text-[11px] uppercase sticky top-0 z-10">
                            <tr className="divide-x divide-[#DBD9D9]/30">
                                <th className="p-1.5 w-12">+QC</th>
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
                            {loadingPacking && packingRows.length === 0 && (
                                <tr><td colSpan={11} className="p-6 text-center text-gray-400">Loading...</td></tr>
                            )}
                            {!loadingPacking && packingRows.length === 0 && (
                                <tr><td colSpan={11} className="p-6 text-center text-gray-400">No results for the selected filters.</td></tr>
                            )}
                            {(packingRows as any[]).map((row: any) => {
                                const isSelected = selRow?.unico === row.unico;
                                const boxColor   = row.foreColor ?? (Number(row.box_qty) >= 50 ? "#f97316" : Number(row.box_qty) >= 20 ? "#22c55e" : undefined);
                                return (
                                    <tr key={row.unico} onClick={() => handleSelectRow(row)}
                                        style={{ backgroundColor: isSelected ? undefined : (row.backColor || undefined) }}
                                        className={cn("cursor-pointer transition-colors divide-x divide-[#DBD9D9]", isSelected ? "!bg-[#FB7506]/10" : "hover:bg-gray-50")}>
                                        <td className="p-1 text-center" onClick={e => e.stopPropagation()}>
                                            {canCreate && (
                                                <button onClick={() => onAddQC?.(row)}
                                                    className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white text-[11px] font-black rounded transition-colors">
                                                    QC
                                                </button>
                                            )}
                                        </td>
                                        <td className="p-1.5 whitespace-nowrap">{t(row.AvailableDate)?.split("T")[0]}</td>
                                        <td className="p-1.5 whitespace-nowrap">{t(row.InvoiceDate)?.split("T")[0]}</td>
                                        <td className="p-1.5 whitespace-nowrap">{t(row.pb_date ?? row.PbookDate)?.split("T")[0]}</td>
                                        <td className="p-1.5 whitespace-nowrap max-w-[90px] truncate">{t(row.warehouse ?? row.Warehouse)}</td>
                                        <td className="p-1.5 text-center">{row.ready_tran ? "✓" : ""}</td>
                                        <td className="p-1.5 font-semibold truncate max-w-[220px]" style={{ color: row.foreColor ?? "#f97316" }}>
                                            {t(row.description)}
                                        </td>
                                        <td className="p-1.5 whitespace-nowrap">{t(row.sorder_no)}</td>
                                        <td className="p-1.5 whitespace-nowrap font-mono">{t(row.awbcode)}</td>
                                        <td className="p-1.5 text-right">{row.lote}</td>
                                        <td className="p-1.5 text-right font-black" style={{ color: boxColor }}>{row.box_qty}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <div ref={sentinelRef} className="flex items-center justify-center py-2 text-[10px] text-gray-400">
                        {isFetchingNextPage && "Loading more..."}
                    </div>
                </PanelGrid>

                <PanelGrid
                    title="Lots Scan IN"
                    icon={ScanLine}
                    recordCount={(scanInRows as any[]).length > 0 ? (scanInRows as any[]).length : undefined}
                    onRefresh={() => refetchScanIn()}
                    refreshing={loadingScanIn}
                    headerRight={<AuditLogModal recordId={selRow?.unico} disabled={!selRow}/>}
                    className="hidden md:flex w-72 shrink-0 shadow-sm"
                >
                    <table className="min-w-full text-xs">
                        <thead className="bg-[#4F4F4F] text-white font-bold text-[11px] uppercase sticky top-0">
                            <tr className="divide-x divide-[#DBD9D9]/30">
                                {["ScanTime","Barcode","Rack","Grower"].map(h => <th key={h} className="p-1.5 whitespace-nowrap">{h}</th>)}
                            </tr>
                        </thead>
                        <tbody className="fos-grid-tbody divide-y divide-[#DBD9D9]">
                            {loadingScanIn && <tr><td colSpan={4} className="p-4 text-center text-gray-400">Loading...</td></tr>}
                            {!loadingScanIn && (scanInRows as any[]).length === 0 && <tr><td colSpan={4} className="p-4 text-center text-gray-300 italic">No scan data</td></tr>}
                            {(scanInRows as any[]).map((r, i) => (
                                <tr key={i} className="hover:bg-gray-50 divide-x divide-[#DBD9D9]">
                                    <td className="p-1.5 whitespace-nowrap text-[10px] text-green-600 font-semibold">{t(r.ScanTime)?.replace("T", " ").substring(0, 16)}</td>
                                    <td className="p-1.5 font-bold text-blue-600 text-[10px]">{t(r.barcode)}</td>
                                    <td className="p-1.5 text-[10px]">{t(r.rack)}</td>
                                    <td className="p-1.5 text-[10px] truncate max-w-[80px]">{t(r.grower)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </PanelGrid>
            </div>

            {/* ── Bottom: sub-tabs ─────────────────────────────── */}
            <div className="flex flex-col flex-[2] min-h-0 bg-white rounded-md border border-[#DBD9D9] shadow-sm overflow-hidden">
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

                <div className="flex flex-1 min-h-0 gap-1.5 p-1.5 overflow-hidden">

                    {subTab === "warehouse-stock" && (
                        <PanelGrid
                            title="Packing List Boxes transferred to Stock"
                            icon={Warehouse}
                            recordCount={(stockRows as any[]).length > 0 ? (stockRows as any[]).length : undefined}
                            onRefresh={() => refetchStock()}
                            refreshing={loadingStock}
                            onDownload={() => {}}
                            headerRight={
                                <div className="flex items-center gap-1">
                                    {canCreate && selRow && (
                                        <button onClick={() => onSendToWarehouse?.(selRow)}
                                            className="flex items-center gap-1.5 text-[11px] font-bold bg-[#FB7506] hover:bg-orange-500 text-white px-3 h-7 rounded transition-colors">
                                            <ArrowRight size={11}/> Send to Warehouse
                                        </button>
                                    )}
                                    <AuditLogModal recordId={selStock?.unico} disabled={!selStock}/>
                                </div>
                            }
                            className="flex-1 min-w-0"
                        >
                            <table className="min-w-full text-xs text-left">
                                <thead className="bg-[#4F4F4F] text-white font-bold text-[11px] uppercase sticky top-0">
                                    <tr className="divide-x divide-[#DBD9D9]/30">{["Warehouse","Lot","Grower","inv_type","Days","QtyIn","QtyOut","QtyHold","WHStock","Stock","Flower CostxU","Landing CostxU","Total CostxU","PricexU","UnitsBox","BoxID","Actions"].map(h => (
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
                                            className={cn("cursor-pointer transition-colors divide-x divide-[#DBD9D9]", selStock?.unico === row.unico ? "!bg-[#FB7506]/10" : "hover:bg-gray-50")}>
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
                                                    {canEdit && <button onClick={e => { e.stopPropagation(); onEditTransfer?.(row); }} className="text-amber-500 hover:text-amber-700" title="Edit Transfer"><Pencil size={12}/></button>}
                                                    {canDelete && <button onClick={e => { e.stopPropagation(); toastConfirm("Delete this transfer?", () => deleteTransfer.mutate(row)); }} className="text-red-500 hover:text-red-700" title="Delete Transfer"><Trash2 size={12}/></button>}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </PanelGrid>
                    )}

                    {subTab === "invoiced-lots" && (
                        <>
                            <PanelGrid
                                title="Invoiced Stock Lots"
                                icon={FileText}
                                recordCount={(invoiceRows as any[]).length > 0 ? (invoiceRows as any[]).length : undefined}
                                onRefresh={() => refetchInvoice()}
                                refreshing={loadingInvoice}
                                onDownload={() => {}}
                                headerRight={<AuditLogModal recordId={selInvoice?.unico} disabled={!selInvoice}/>}
                                className="flex-1 min-w-0"
                            >
                                <table className="min-w-full text-xs text-left">
                                    <thead className="bg-[#4F4F4F] text-white font-bold text-[11px] uppercase sticky top-0">
                                        <tr className="divide-x divide-[#DBD9D9]/30">{["InvoiceNo","Invoice Date","Customer","Description","Lot","BoxQty","void","Status","ScanQty","UxBox","Price","TUnits","ExtPrice","Case"].map(h => (
                                            <th key={h} className="p-1.5 whitespace-nowrap">{h}</th>
                                        ))}</tr>
                                    </thead>
                                    <tbody className="fos-grid-tbody divide-y divide-[#DBD9D9]">
                                        {!selRow && <tr><td colSpan={14} className="p-6 text-center text-gray-400">Select a packing row above.</td></tr>}
                                        {selRow && loadingInvoice && <tr><td colSpan={14} className="p-6 text-center text-gray-400">Loading...</td></tr>}
                                        {selRow && !loadingInvoice && (invoiceRows as any[]).length === 0 && <tr><td colSpan={14} className="p-6 text-center text-gray-300 italic">No invoiced lots.</td></tr>}
                                        {(invoiceRows as any[]).map((row: any) => (
                                            <tr key={row.unico} onClick={() => setSelInvoice(row)}
                                                className={cn("cursor-pointer transition-colors divide-x divide-[#DBD9D9]", selInvoice?.unico === row.unico ? "!bg-[#FB7506]/10" : "hover:bg-gray-50")}>
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
                            </PanelGrid>

                            <PanelGrid
                                title="Invoice Lots Scan OUT"
                                icon={ScanLine}
                                recordCount={(scanOutRows as any[]).length > 0 ? (scanOutRows as any[]).length : undefined}
                                onRefresh={() => refetchScanOut()}
                                refreshing={loadingScanOut}
                                headerRight={<AuditLogModal recordId={selInvoice?.unico} disabled={!selInvoice}/>}
                                className="w-72 shrink-0"
                            >
                                <table className="min-w-full text-xs">
                                    <thead className="bg-[#4F4F4F] text-white font-bold text-[11px] uppercase sticky top-0">
                                        <tr className="divide-x divide-[#DBD9D9]/30">
                                            {["ScanTime","Barcode","Rack","Grower"].map(h => <th key={h} className="p-1.5 whitespace-nowrap">{h}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody className="fos-grid-tbody divide-y divide-[#DBD9D9]">
                                        {loadingScanOut && <tr><td colSpan={4} className="p-4 text-center text-gray-400">Loading...</td></tr>}
                                        {!loadingScanOut && (scanOutRows as any[]).length === 0 && <tr><td colSpan={4} className="p-4 text-center text-gray-300 italic">No scan data</td></tr>}
                                        {(scanOutRows as any[]).map((r, i) => (
                                            <tr key={i} className="hover:bg-gray-50 divide-x divide-[#DBD9D9]">
                                                <td className="p-1.5 whitespace-nowrap text-[10px] text-green-600 font-semibold">{t(r.ScanTime)?.replace("T", " ").substring(0, 16)}</td>
                                                <td className="p-1.5 font-bold text-blue-600 text-[10px]">{t(r.barcode)}</td>
                                                <td className="p-1.5 text-[10px]">{t(r.rack)}</td>
                                                <td className="p-1.5 text-[10px] truncate max-w-[80px]">{t(r.grower)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </PanelGrid>
                        </>
                    )}
                </div>
            </div>

            {/* ── Scan IN modal (mobile only) ───────────────────── */}
            {scanModal && createPortal(
                <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-[200]">
                    <div className="bg-white rounded-t-2xl shadow-2xl w-full max-h-[75vh] flex flex-col overflow-hidden">
                        <div className="h-10 bg-[#333030] rounded-t-2xl flex items-center justify-between px-4 shrink-0">
                            <div className="flex items-center gap-2">
                                <ScanLine size={14} className="text-[#FB7506]"/>
                                <span className="font-black text-[11px] uppercase tracking-widest text-white">
                                    Lots Scan IN {selRow?.lote ? `— Lot ${selRow.lote}` : ""}
                                </span>
                            </div>
                            <button onClick={() => setScanModal(false)}>
                                <XCircle size={16} className="text-gray-400 hover:text-white transition-colors"/>
                            </button>
                        </div>
                        <div className="overflow-auto flex-1">
                            {loadingScanIn && <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>}
                            {!loadingScanIn && (scanInRows as any[]).length === 0 && (
                                <div className="p-8 text-center text-gray-400 text-sm italic">No scan data for this lot.</div>
                            )}
                            {(scanInRows as any[]).length > 0 && (
                                <table className="min-w-full text-xs">
                                    <thead className="bg-[#4F4F4F] text-white font-bold text-[11px] uppercase sticky top-0">
                                        <tr className="divide-x divide-[#DBD9D9]/30">
                                            {["ScanTime","Barcode","Rack","Grower"].map(h => <th key={h} className="p-2 whitespace-nowrap">{h}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#DBD9D9]">
                                        {(scanInRows as any[]).map((r: any, i: number) => (
                                            <tr key={i} className="divide-x divide-[#DBD9D9]">
                                                <td className="p-2 whitespace-nowrap text-[10px] text-green-600 font-semibold">{t(r.ScanTime)?.replace("T", " ").substring(0, 16)}</td>
                                                <td className="p-2 font-bold text-blue-600 text-[10px]">{t(r.barcode)}</td>
                                                <td className="p-2 text-[10px]">{t(r.rack)}</td>
                                                <td className="p-2 text-[10px]">{t(r.grower)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        <div className="px-4 py-2 bg-gray-50 border-t shrink-0 flex justify-end">
                            <button onClick={() => setScanModal(false)}
                                className="px-4 py-1.5 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
