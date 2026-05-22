"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const t   = (v: any) => String(v ?? "").trim();
const fmt = (v: any) => parseFloat(v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const qcPost = (url: string, body: any) =>
    fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        .then(r => r.json());

export default function TransitBoxesTab() {
    const [year,      setYear]      = useState(new Date().getFullYear());
    const [search,    setSearch]    = useState("%");
    const [searchKey, setSearchKey] = useState(0);
    const [selRow,    setSelRow]    = useState<any>(null);

    const { data: years = [] } = useQuery({
        queryKey: ["qc-transit-years"],
        queryFn: () => qcPost("/api/qc/transit/years", {}),
        staleTime: 300000,
        select: (d: any) => d.data ?? [],
    });

    const { data: transitRows = [], isFetching: loading } = useQuery({
        queryKey: ["qc-transit-list", searchKey, year, search],
        queryFn: () => qcPost("/api/qc/transit/list", { lnYear: year, search: search || "%" }),
        enabled: searchKey > 0,
        staleTime: 0,
        select: (d: any) => d.data ?? [],
    });

    return (
        <div className="flex flex-col h-full gap-2">
            {/* Filter bar */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm px-3 py-2 flex flex-wrap items-center gap-3 shrink-0 text-xs">
                <div className="flex items-center gap-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Year</label>
                    <select value={year} onChange={e => setYear(Number(e.target.value))} className="fos-input py-1 w-24">
                        {(years as any[]).length
                            ? (years as any[]).map((y: any) => <option key={y.year ?? y} value={y.year ?? y}>{y.year ?? y}</option>)
                            : Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => <option key={y} value={y}>{y}</option>)
                        }
                    </select>
                </div>
                <div className="flex items-center gap-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Search</label>
                    <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && setSearchKey(k => k + 1)} placeholder="%" className="fos-input py-1 w-44"/>
                </div>
                <button onClick={() => setSearchKey(k => k + 1)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FB7506] hover:bg-orange-600 text-white text-xs font-black rounded">
                    {loading ? <RefreshCcw size={11} className="animate-spin"/> : <Search size={11}/>} Boxes in Transit
                </button>
            </div>

            {/* Grid */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex-1 flex flex-col overflow-hidden">
                <div className="h-8 bg-[#374151] flex items-center justify-between px-3 shrink-0">
                    <span className="text-white text-[10px] font-black uppercase tracking-widest">Transit Boxes</span>
                    {!loading && searchKey > 0 && <span className="text-gray-400 text-[10px]">{(transitRows as any[]).length} records</span>}
                </div>
                <div className="overflow-auto flex-1">
                    <table className="min-w-full text-xs text-left">
                        <thead className="bg-gray-100 border-b fos-grid-thead text-gray-700 sticky top-0">
                            <tr>{["AWBCode","Description","Grower","Customer","Lote","Market","Box Qty","Units","F.Cost","Stock","Days","Box Date","Warehouse","Avail.Date"].map(h => (
                                <th key={h} className="p-1.5 border-r border-gray-200 last:border-r-0 whitespace-nowrap">{h}</th>
                            ))}</tr>
                        </thead>
                        <tbody className="fos-grid-tbody divide-y divide-gray-100">
                            {searchKey === 0 && <tr><td colSpan={14} className="p-6 text-center text-gray-400">Select year and click Boxes in Transit to search.</td></tr>}
                            {searchKey > 0 && loading && <tr><td colSpan={14} className="p-6 text-center text-gray-400">Loading...</td></tr>}
                            {searchKey > 0 && !loading && (transitRows as any[]).length === 0 && <tr><td colSpan={14} className="p-6 text-center text-gray-400">No transit boxes found.</td></tr>}
                            {(transitRows as any[]).map((row: any, i: number) => (
                                <tr key={row.unico ?? i} onClick={() => setSelRow(row)}
                                    style={{ backgroundColor: row.backColor || undefined, color: row.foreColor || undefined }}
                                    className={cn("cursor-pointer transition-colors", selRow?.unico === row.unico ? "!bg-blue-100 ring-2 ring-inset ring-blue-300" : "hover:bg-blue-50")}>
                                    <td className="p-1.5 font-bold text-[#FB7506] whitespace-nowrap">{t(row.awbcode)}</td>
                                    <td className="p-1.5 max-w-[160px] truncate">{t(row.description)}</td>
                                    <td className="p-1.5 whitespace-nowrap">{t(row.grower)}</td>
                                    <td className="p-1.5 whitespace-nowrap">{t(row.customer)}</td>
                                    <td className="p-1.5 text-right">{row.lote}</td>
                                    <td className="p-1.5">{t(row.market)}</td>
                                    <td className="p-1.5 text-right">{row.box_qty}</td>
                                    <td className="p-1.5 text-right">{row.total_units}</td>
                                    <td className="p-1.5 text-right">{fmt(row.f_cost_x_u)}</td>
                                    <td className="p-1.5 text-right font-bold">{row.stock}</td>
                                    <td className="p-1.5 text-right">{row.days}</td>
                                    <td className="p-1.5 whitespace-nowrap">{t(row.box_date)?.split("T")[0]}</td>
                                    <td className="p-1.5 whitespace-nowrap">{t(row.Warehouse)}</td>
                                    <td className="p-1.5 whitespace-nowrap">{t(row.AvailableDate)?.split("T")[0]}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
