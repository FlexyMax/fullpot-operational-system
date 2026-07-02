"use client";
import { useState, useEffect } from "react";
import { X, ScanLine } from "lucide-react";
import { toast } from "sonner";
import PanelGrid from "@/components/ui/PanelGrid";

const t = (v: any) => String(v ?? "").trim();

interface Props {
    open: boolean;
    onClose: () => void;
    boxUnico: string;
    lote: string;
}

export function ModalScanHistory({ open, onClose, boxUnico, lote }: Props) {
    const [rows,    setRows]    = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const load = () => {
        if (!boxUnico) return;
        setLoading(true);
        fetch(`/api/inventory-entry/boxes/${boxUnico}/scan-history`)
            .then(r => r.json())
            .then(d => setRows(Array.isArray(d) ? d : []))
            .catch(e => toast.error(e.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (!open || !boxUnico) return;
        load();
    }, [open, boxUnico]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden" style={{ maxHeight: "75vh" }} onClick={e => e.stopPropagation()}>
                <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 rounded-t-lg shrink-0">
                    <div className="flex items-center gap-2">
                        <ScanLine size={16} className="text-[#FB7506]" />
                        <span className="font-black text-[10px] text-white uppercase tracking-widest">Scan History — Lot {lote}</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={16} /></button>
                </div>

                <PanelGrid
                    title="Scan Events"
                    icon={ScanLine}
                    recordCount={rows.length}
                    onRefresh={load}
                    refreshing={loading}
                    className="flex-1 min-h-0 rounded-none border-x-0 border-b-0"
                >
                    <table className="w-full text-xs">
                        <thead className="bg-gray-100 sticky top-0">
                            <tr>
                                {["Timestamp","Box No.","Qty In","Qty Out","Total","Barcode","Rack"].map(h => (
                                    <th key={h} className="p-2 text-left font-bold text-gray-700 border-r border-gray-200 whitespace-nowrap last:border-r-0">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length === 0 && !loading ? (
                                <tr><td colSpan={7} className="p-4 text-center text-gray-400 italic">No scan history for this lot</td></tr>
                            ) : rows.map((row: any, i: number) => (
                                <tr key={i} className="border-b border-gray-100 odd:bg-white even:bg-gray-50">
                                    <td className="p-2 border-r border-gray-100 whitespace-nowrap">{row.timestamp ? new Date(row.timestamp).toLocaleString() : ""}</td>
                                    <td className="p-2 border-r border-gray-100 text-right">{t(row.box_no)}</td>
                                    <td className="p-2 border-r border-gray-100 text-right text-green-600 font-bold">{Number(row.qty_in) || ""}</td>
                                    <td className="p-2 border-r border-gray-100 text-right text-red-500 font-bold">{Number(row.qty_out) || ""}</td>
                                    <td className="p-2 border-r border-gray-100 text-right">{t(row.qty_total)}</td>
                                    <td className="p-2 border-r border-gray-100 font-mono">{t(row.barcode)}</td>
                                    <td className="p-2">{t(row.rack)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </PanelGrid>

                <div className="px-4 py-2 bg-gray-50 border-t shrink-0 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 rounded border border-gray-200 text-xs font-black uppercase text-gray-600 hover:bg-gray-100 transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
