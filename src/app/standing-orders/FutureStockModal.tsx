"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Search } from "lucide-react";

const t = (v: any) => String(v ?? "").trim();
const fmt = (v: any) => parseFloat(v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface StockRow {
    available_date: string;
    farm:           string;
    clase:          string;
    subclase:       string;
    description:    string;
    units_case:     number;
    unit_price:     number;
}

interface Props {
    onClose: () => void;
}

export function FutureStockModal({ onClose }: Props) {
    const [rows,    setRows]    = useState<StockRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search,  setSearch]  = useState("");

    useEffect(() => {
        (async () => {
            try {
                const r = await fetch("/api/standing-orders/future-stock");
                const j = await r.json();
                if (!r.ok) throw new Error(j.error || "Failed");
                setRows(Array.isArray(j) ? j.map((x: any) => ({
                    available_date: t(x.available_date ?? x.AVAILABLE_DATE),
                    farm:           t(x.farm           ?? x.FARM),
                    clase:          t(x.clase          ?? x.CLASE),
                    subclase:       t(x.subclase       ?? x.SUBCLASE),
                    description:    t(x.description    ?? x.DESCRIPTION),
                    units_case:     Number(x.units_case  ?? x.UNITS_CASE  ?? 0),
                    unit_price:     Number(x.unit_price  ?? x.UNIT_PRICE  ?? 0),
                })) : []);
            } catch {
                setRows([]);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const filtered = search.trim()
        ? rows.filter(r =>
            r.description.toLowerCase().includes(search.toLowerCase()) ||
            r.farm.toLowerCase().includes(search.toLowerCase()) ||
            r.clase.toLowerCase().includes(search.toLowerCase())
          )
        : rows;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="h-10 bg-[#374151] flex items-center justify-between px-4 shrink-0 rounded-t-lg">
                    <span className="font-black text-[11px] text-white uppercase tracking-widest">SO Future Stock — Availability Report</span>
                    <button onClick={onClose} className="text-white/60 hover:text-white"><X size={14} /></button>
                </div>

                {/* Search */}
                <div className="px-3 py-2 border-b border-gray-200 flex items-center gap-2 shrink-0">
                    <Search size={12} className="text-gray-400 shrink-0" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Filter by description, farm, class..."
                        className="flex-1 text-[11px] focus:outline-none"
                        autoFocus
                    />
                    {loading && <Loader2 size={12} className="animate-spin text-gray-400 shrink-0" />}
                    <span className="text-[10px] text-gray-400 shrink-0">{filtered.length} rows</span>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-auto min-h-0">
                    <table className="min-w-full text-[11px] text-left">
                        <thead className="sticky top-0 z-10">
                            <tr className="bg-gray-100 text-gray-700">
                                <th className="px-2 py-1.5 font-bold border-b border-gray-200">Avail. Date</th>
                                <th className="px-2 py-1.5 font-bold border-b border-gray-200">Farm</th>
                                <th className="px-2 py-1.5 font-bold border-b border-gray-200">Class</th>
                                <th className="px-2 py-1.5 font-bold border-b border-gray-200">Subclass</th>
                                <th className="px-2 py-1.5 font-bold border-b border-gray-200 min-w-[220px]">Description</th>
                                <th className="px-2 py-1.5 font-bold border-b border-gray-200 text-right">Un/Case</th>
                                <th className="px-2 py-1.5 font-bold border-b border-gray-200 text-right">Unit Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((row, i) => (
                                <tr key={i} className="border-b odd:bg-white even:bg-gray-50 hover:bg-blue-50 text-gray-700">
                                    <td className="px-2 py-1 font-semibold text-green-700 whitespace-nowrap">{row.available_date}</td>
                                    <td className="px-2 py-1 font-bold text-[#FB7506]">{row.farm}</td>
                                    <td className="px-2 py-1">{row.clase}</td>
                                    <td className="px-2 py-1">{row.subclase}</td>
                                    <td className="px-2 py-1 font-medium">{row.description}</td>
                                    <td className="px-2 py-1 text-right">{row.units_case.toLocaleString()}</td>
                                    <td className="px-2 py-1 text-right font-semibold">{fmt(row.unit_price)}</td>
                                </tr>
                            ))}
                            {!loading && filtered.length === 0 && (
                                <tr><td colSpan={7} className="p-8 text-center text-gray-400 italic">No availability data</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="h-10 bg-gray-50 border-t border-gray-200 flex items-center justify-end px-4 shrink-0 rounded-b-lg">
                    <button onClick={onClose}
                        className="px-4 py-1.5 text-[11px] font-black text-white bg-[#374151] hover:bg-gray-600 rounded transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
