"use client";
import { useEffect, useState } from "react";
import { X, BarChart2, RefreshCcw } from "lucide-react";

const t = (v: any) => String(v ?? "").trim();
const norm = (rows: any[]) => rows.map(r => { const n: any = {}; for (const [k, v] of Object.entries(r)) n[k.toUpperCase()] = v; return n; });
const fmt2 = (v: any) => parseFloat(v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface Props {
    open: boolean;
    onClose: () => void;
    lddate: string;
}

export function ModalWhouseTotals({ open, onClose, lddate }: Props) {
    const [rows, setRows] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;
        setLoading(true);
        setError(null);
        fetch(`/api/inventory-entry/pl-control?date=${lddate}`)
            .then(r => r.json())
            .then(d => {
                if (d.error) throw new Error(d.error);
                setRows(norm(Array.isArray(d) ? d : []));
            })
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [open, lddate]);

    if (!open) return null;

    // Group by warehouse
    const byWhouse: Record<string, { boxes: number; units: number; cost: number }> = {};
    for (const row of rows) {
        const wh = t(row.WHOUSE ?? row.WPHYSICAL ?? row.PWHOUSE ?? "—");
        if (!byWhouse[wh]) byWhouse[wh] = { boxes: 0, units: 0, cost: 0 };
        byWhouse[wh].boxes += Number(row.TOTAL_BOXES ?? row.FULL_BOXES ?? 0);
        byWhouse[wh].units += Number(row.TOTAL_UNITS ?? 0);
        byWhouse[wh].cost  += Number(row.TOTAL_COST  ?? row.FLOWER_COST ?? 0);
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg flex flex-col overflow-hidden" style={{ maxHeight: "70vh" }} onClick={e => e.stopPropagation()}>
                <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 rounded-t-lg shrink-0">
                    <div className="flex items-center gap-2">
                        <BarChart2 size={16} className="text-[#FB7506]" />
                        <span className="font-black text-[10px] text-white uppercase tracking-widest">Warehouse Totals — {lddate}</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={16} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-3">
                    {loading && (
                        <div className="flex items-center justify-center py-8 gap-2 text-gray-400">
                            <RefreshCcw size={14} className="animate-spin" />
                            <span className="text-xs">Loading...</span>
                        </div>
                    )}
                    {error && <div className="text-xs text-red-500 p-3 bg-red-50 rounded">{error}</div>}
                    {!loading && !error && (
                        <table className="w-full text-xs">
                            <thead className="bg-gray-100 sticky top-0">
                                <tr>
                                    <th className="p-2 text-left font-bold text-gray-700 border-r border-gray-200">Warehouse</th>
                                    <th className="p-2 text-right font-bold text-gray-700 border-r border-gray-200">Boxes</th>
                                    <th className="p-2 text-right font-bold text-gray-700 border-r border-gray-200">Units</th>
                                    <th className="p-2 text-right font-bold text-gray-700">Cost</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.keys(byWhouse).length === 0 ? (
                                    <tr><td colSpan={4} className="p-4 text-center text-gray-400 italic">No data for this date</td></tr>
                                ) : Object.entries(byWhouse).map(([wh, vals], i) => (
                                    <tr key={i} className="border-b border-gray-100 odd:bg-white even:bg-gray-50">
                                        <td className="p-2 border-r border-gray-100 font-semibold">{wh}</td>
                                        <td className="p-2 border-r border-gray-100 text-right">{vals.boxes.toLocaleString()}</td>
                                        <td className="p-2 border-r border-gray-100 text-right">{vals.units.toLocaleString()}</td>
                                        <td className="p-2 text-right">{fmt2(vals.cost)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                <div className="px-4 py-2 bg-gray-50 border-t shrink-0 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 rounded border border-gray-200 text-xs font-black uppercase text-gray-600 hover:bg-gray-100 transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
