"use client";
import { useState, useCallback } from "react";
import { X, BarChart2, RefreshCcw, Search } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import PanelGrid from "@/components/ui/PanelGrid";

const t = (v: any) => String(v ?? "").trim();
const today = () => new Date().toISOString().split("T")[0];

interface Props {
    open: boolean;
    onClose: () => void;
    lddate: string;
    warehouses: any[];
}

export function ModalWhouseTotals({ open, onClose, lddate, warehouses }: Props) {
    const [date,    setDate]    = useState(lddate || today());
    const [whouse,  setWhouse]  = useState("");
    const [rows,    setRows]    = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const doSearch = useCallback(async () => {
        if (!whouse) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/inventory-entry/whouse-totals?date=${date}&whouse=${encodeURIComponent(whouse)}`);
            const d = await res.json();
            if (d.error) throw new Error(d.error);
            setRows((Array.isArray(d) ? d : []).map((r: any) => {
                const n: any = {};
                for (const [k, v] of Object.entries(r)) n[k.toUpperCase()] = v;
                return n;
            }));
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setLoading(false);
        }
    }, [date, whouse]);

    if (!open) return null;

    const whouseName = warehouses.find(w => t(w.UNICO) === whouse);
    const fInput = "fos-input h-7 text-xs";

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden" style={{ maxHeight: "80vh" }} onClick={e => e.stopPropagation()}>
                <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 rounded-t-lg shrink-0">
                    <div className="flex items-center gap-2">
                        <BarChart2 size={16} className="text-[#FB7506]" />
                        <span className="font-black text-[10px] text-white uppercase tracking-widest">Totals by Physical Warehouse</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={16} /></button>
                </div>

                <div className="p-3 border-b shrink-0 flex gap-2 items-end">
                    <div className="flex flex-col gap-0.5 w-36">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Date</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className={fInput} />
                    </div>
                    <div className="flex flex-col gap-0.5 flex-1">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Physical Warehouse *</label>
                        <select value={whouse} onChange={e => setWhouse(e.target.value)} className={fInput}>
                            <option value="">-- Select Warehouse --</option>
                            {warehouses.map((w: any) => (
                                <option key={t(w.UNICO)} value={t(w.UNICO)}>
                                    {t(w.WAREHOUSE ?? w.WP_NAME ?? w.UNICO)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button onClick={doSearch} disabled={!whouse || loading}
                        className="flex items-center gap-1 px-3 h-7 bg-gray-700 hover:bg-gray-800 disabled:opacity-40 text-white text-xs font-bold rounded shrink-0 transition-colors">
                        {loading ? <RefreshCcw size={11} className="animate-spin" /> : <Search size={11} />}
                        Search
                    </button>
                </div>

                <PanelGrid
                    title="WH Totals"
                    icon={BarChart2}
                    recordCount={rows.length > 0 ? rows.length : undefined}
                    onRefresh={whouse ? doSearch : undefined}
                    refreshing={loading}
                    className="flex-1 min-h-0 rounded-none border-x-0 border-b-0"
                >
                    {!whouse && rows.length === 0 ? (
                        <div className="p-6 text-center text-gray-400 text-xs italic">Select a warehouse and click Search</div>
                    ) : (
                        <table className="w-full text-xs">
                            <thead className="bg-gray-100 sticky top-0">
                                <tr>
                                    {["AWB Code","Records","Boxes","Full Boxes","WH Status","Delayed"].map(h => (
                                        <th key={h} className="p-2 text-left font-bold text-gray-700 border-r border-gray-200 whitespace-nowrap last:border-r-0">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length === 0 ? (
                                    <tr><td colSpan={6} className="p-4 text-center text-gray-400 italic">No data for this warehouse / date</td></tr>
                                ) : rows.map((row: any, i: number) => {
                                    const whst = t(row.WHSTATUS ?? "");
                                    const dly  = Number(row.DELAYED ?? 0);
                                    return (
                                        <tr key={i} className="border-b border-gray-100 odd:bg-white even:bg-gray-50">
                                            <td className="p-2 border-r border-gray-100 font-mono font-bold">{t(row.AWBCODE ?? row.AWB ?? "")}</td>
                                            <td className="p-2 border-r border-gray-100 text-right">{t(row.RECORDS ?? "")}</td>
                                            <td className="p-2 border-r border-gray-100 text-right font-bold">{t(row.BOXES ?? "")}</td>
                                            <td className="p-2 border-r border-gray-100 text-right">{t(row.FULL_BOXES ?? "")}</td>
                                            <td className={cn("p-2 border-r border-gray-100", whst === "WH" ? "text-green-600 font-bold" : whst === "PWH" ? "text-amber-600 font-bold" : "text-blue-500")}>{whst}</td>
                                            <td className={cn("p-2 text-right", dly > 0 ? "text-red-600 font-bold" : "text-gray-300")}>{dly || ""}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </PanelGrid>

                <div className="px-4 py-2 bg-gray-50 border-t shrink-0 flex items-center justify-between">
                    <span className="text-[10px] text-gray-400">
                        {whouseName ? t(whouseName.WAREHOUSE ?? whouseName.WP_NAME ?? whouseName.UNICO) : ""}
                    </span>
                    <button onClick={onClose} className="px-4 py-2 rounded border border-gray-200 text-xs font-black uppercase text-gray-600 hover:bg-gray-100 transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
