"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, X, ChevronDown, Download } from "lucide-react";
import { cn } from "@/lib/utils";

const t = (v: any) => String(v ?? "").trim();

const qcPost = (url: string, body: any) =>
    fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        .then(r => r.json());

const PAGE_SIZE = 25;

function colorVal(val: any, type: "orange" | "green" | "purple" | "blue") {
    if (!val || val === 0) return <span className="text-gray-400">0</span>;
    const cls = { orange: "text-orange-500 font-bold", green: "text-green-500 font-bold", purple: "text-purple-500 font-bold", blue: "text-blue-500 font-bold" };
    return <span className={cls[type]}>{val}</span>;
}

export default function TransitBoxesTab() {
    const [year,      setYear]      = useState(new Date().getFullYear());
    const [search,    setSearch]    = useState("");
    const [page,      setPage]      = useState(1);

    const { data: years = [] } = useQuery({
        queryKey: ["qc-transit-years"],
        queryFn:  () => qcPost("/api/qc/transit/years", {}),
        staleTime: 300000,
        select:   (d: any) => d.data ?? [],
    });

    const { data: transitResp, isFetching: loading, refetch } = useQuery({
        queryKey: ["qc-transit-list", year, search],
        queryFn:  () => qcPost("/api/qc/transit/list", { lnYear: year, search: search || "%" }),
        staleTime: 0,
        select:   (d: any) => d,
    });

    const allRows = (transitResp as any)?.data ?? [];
    const totalRecords = allRows.length;
    const totalPages   = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));
    const rows         = allRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">

            {/* ── Unified header row ─────────────────────────── */}
            <div className="flex items-stretch shrink-0 border-b border-gray-200">
                {/* Left: dark title */}
                <div className="h-9 bg-[#374151] flex items-center gap-2 px-3 shrink-0 min-w-[280px]">
                    <span className="text-white text-[10px] font-black uppercase tracking-widest">Boxes in Transit Delivery Date</span>
                    <RefreshCw size={11} className="text-gray-400 cursor-pointer hover:text-white flex-shrink-0" onClick={() => refetch()}/>
                </div>

                {/* Right: filters */}
                <div className="flex items-center gap-2 px-3 bg-white flex-1">
                    {/* Year combobox */}
                    <div className="relative flex items-center">
                        <select value={year} onChange={e => { setYear(Number(e.target.value)); setPage(1); }}
                            className="fos-input py-1 text-[11px] w-24 pr-10 appearance-none">
                            {(years as any[]).length
                                ? (years as any[]).map((y: any) => <option key={y.year ?? y} value={y.year ?? y}>{y.year ?? y}</option>)
                                : Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => <option key={y} value={y}>{y}</option>)
                            }
                        </select>
                        <div className="absolute right-1 flex items-center gap-0.5 pointer-events-none">
                            <X size={9} className="text-gray-400"/>
                            <ChevronDown size={9} className="text-gray-400"/>
                        </div>
                    </div>
                    {/* Search */}
                    <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                        onKeyDown={e => e.key === "Enter" && refetch()}
                        placeholder="Search" className="fos-input py-1 text-[11px] flex-1 max-w-xs"/>
                </div>

                {/* Far right: refresh */}
                <button onClick={() => { setPage(1); refetch(); }} className="px-3 text-green-500 hover:text-green-600 shrink-0">
                    <RefreshCw size={14} className={loading ? "animate-spin" : ""}/>
                </button>
            </div>

            {/* ── Grid toolbar ───────────────────────────────── */}
            <div className="h-9 border-b border-gray-200 flex items-center px-3 gap-4 shrink-0 bg-white justify-between text-xs">
                <div className="flex items-center gap-1.5 text-gray-400">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input type="text" placeholder="Search..." className="outline-none text-[11px] w-32 text-black placeholder-gray-400"/>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-gray-500">
                    <button className="flex items-center gap-1 hover:text-black font-semibold">
                        <Download size={11}/> Download
                    </button>
                    {!loading && totalRecords > 0 && (
                        <span className="whitespace-nowrap">{totalRecords.toLocaleString()} Records</span>
                    )}
                    {totalPages > 1 && (
                        <div className="flex items-center gap-1">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="p-0.5 rounded hover:bg-gray-100 disabled:opacity-30">‹</button>
                            <span>Page <b>{page}</b> of {totalPages}</span>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-0.5 rounded hover:bg-gray-100 disabled:opacity-30">›</button>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Data grid ──────────────────────────────────── */}
            <div className="overflow-auto flex-1">
                <table className="min-w-full text-xs text-left">
                    <thead className="bg-white border-b sticky top-0 z-10">
                        <tr className="fos-grid-thead text-gray-700">
                            {["AvailableDate","InvoiceDate","Warehouse","AWBcode","Lot","Case","BoxQty","QtyTransit","QtyHold","Qty Adjust","Stock","Units Box","Total Units","Market","Description","AP Invoice","AP Amt"].map(h => (
                                <th key={h} className="p-2 border-r border-gray-100 last:border-r-0 whitespace-nowrap font-bold">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="fos-grid-tbody divide-y divide-gray-100">
                        {loading && <tr><td colSpan={17} className="p-8 text-center text-gray-400">Loading...</td></tr>}
                        {!loading && rows.length === 0 && <tr><td colSpan={17} className="p-8 text-center text-gray-400">No transit boxes for the selected year.</td></tr>}
                        {(rows as any[]).map((row: any, i: number) => (
                            <tr key={row.unico ?? i}
                                style={{ backgroundColor: row.backColor || undefined }}
                                className="hover:bg-gray-50 transition-colors">
                                <td className="p-2 whitespace-nowrap">{t(row.AvailableDate)?.split("T")[0]}</td>
                                <td className="p-2 whitespace-nowrap">{t(row.box_date)?.split("T")[0]}</td>
                                <td className="p-2 whitespace-nowrap truncate max-w-[100px]">{t(row.Warehouse)}</td>
                                <td className="p-2 font-mono whitespace-nowrap">{t(row.awbcode)}</td>
                                <td className="p-2 text-right">{row.lote}</td>
                                <td className="p-2">{t(row.case_sh)}</td>
                                <td className="p-2 text-right">{colorVal(row.box_qty, "orange")}</td>
                                <td className="p-2 text-right">{colorVal(row.qty_transit, "orange")}</td>
                                <td className="p-2 text-right">{colorVal(row.qty_hold, "blue")}</td>
                                <td className="p-2 text-right">{colorVal(row.qty_adj, "purple")}</td>
                                <td className="p-2 text-right">{colorVal(row.stock, "green")}</td>
                                <td className="p-2 text-right">{row.tunits_x_box}</td>
                                <td className="p-2 text-right">{row.total_units}</td>
                                <td className="p-2">{t(row.market)}</td>
                                <td className="p-2 max-w-[200px] truncate">{t(row.description)}</td>
                                <td className="p-2 whitespace-nowrap">{t(row.APInvoice)}</td>
                                <td className="p-2 text-right">{row.APAmount ? `$${Number(row.APAmount).toFixed(2)}` : ""}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
