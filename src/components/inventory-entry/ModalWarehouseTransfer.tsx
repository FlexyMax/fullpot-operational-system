"use client";
import { useState, useEffect } from "react";
import { X, ArrowRight, RefreshCcw, Warehouse } from "lucide-react";
import { toast } from "sonner";

const t = (v: any) => String(v ?? "").trim();
const today = () => new Date().toISOString().split("T")[0];
const int = (v: any) => { const n = parseInt(String(v ?? 0), 10); return isNaN(n) ? 0 : n; };

interface Props {
    open: boolean;
    onClose: () => void;
    boxUnico: string;
    warehouses: any[];
    userId: string;
    onSuccess: () => void;
}

export function ModalWarehouseTransfer({ open, onClose, boxUnico, warehouses, userId, onSuccess }: Props) {
    const [wphysical_uq, setWphysical_uq] = useState("");
    const [hold_qty,     setHold_qty]     = useState(0);
    const [sourceWH,     setSourceWH]     = useState("");
    const [awbcode,      setAwbcode]      = useState("");
    const [loading,      setLoading]      = useState(false);
    const [saving,       setSaving]       = useState(false);
    const [error,        setError]        = useState<string | null>(null);

    useEffect(() => {
        if (!open || !boxUnico) return;
        setLoading(true);
        setError(null);
        fetch(`/api/inventory-entry/boxes/${boxUnico}`)
            .then(r => r.json())
            .then(d => {
                if (!d) return;
                const f: any = {};
                for (const [k, v] of Object.entries(d)) f[k.toLowerCase()] = v;
                setHold_qty(int(f.box_qty ?? 0));
                setSourceWH(t(f.wphysical_uq ?? f.whouse_uq ?? ""));
                setAwbcode(t(f.awbcode ?? ""));
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [open, boxUnico]);

    if (!open) return null;

    const sourceWHName = warehouses.find(w => t(w.UNICO) === sourceWH);

    const handleSave = async () => {
        if (!t(wphysical_uq)) { toast.error("Select a target warehouse."); return; }
        if (!hold_qty) { toast.error("Hold Qty is required."); return; }
        setSaving(true); setError(null);
        try {
            const res = await fetch(`/api/inventory-entry/boxes/${boxUnico}/transfer`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    wphysical_uq,
                    box_qty:    hold_qty,
                    awbcode:    awbcode,
                    date_invo:  today(),
                    available:  today(),
                    invoice_no: "",
                    box_freight: 0,
                    user_uq:    userId,
                }),
            });
            const d = await res.json();
            if (!d.success) throw new Error(d.error || "Transfer failed");
            toast.success("Box transferred to warehouse.");
            onSuccess();
            onClose();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    };

    const fLabel = "text-[10px] font-black text-gray-500 uppercase tracking-wider";
    const fInput = "fos-input h-7 text-xs";

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 rounded-t-lg shrink-0">
                    <div className="flex items-center gap-2">
                        <Warehouse size={16} className="text-[#FB7506]" />
                        <span className="font-black text-[10px] text-white uppercase tracking-widest">Warehouse Transfer</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={16} /></button>
                </div>
                <div className="p-4 space-y-3">
                    {loading && <div className="flex items-center gap-2 text-gray-400 text-xs"><RefreshCcw size={12} className="animate-spin" /> Loading...</div>}
                    {/* Source info */}
                    <div className="bg-gray-50 rounded p-2 text-xs text-gray-600 border border-gray-100 space-y-0.5">
                        <div>Box: <span className="font-mono font-bold text-gray-800">{boxUnico}</span></div>
                        {awbcode && <div>AWB: <span className="font-mono font-bold text-gray-800">{awbcode}</span></div>}
                        <div>
                            Source WH:{" "}
                            <span className="font-bold text-gray-800">
                                {sourceWHName
                                    ? t(sourceWHName.WAREHOUSE ?? sourceWHName.WP_NAME ?? sourceWH)
                                    : (sourceWH || "—")}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <label className={fLabel}>New Warehouse *</label>
                        <select value={wphysical_uq} onChange={e => setWphysical_uq(e.target.value)} className={fInput}>
                            <option value="">-- Select Warehouse --</option>
                            {warehouses.map((w: any) => (
                                <option key={t(w.UNICO)} value={t(w.UNICO)}>
                                    {t(w.WAREHOUSE ?? w.WP_NAME ?? w.UNICO)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <label className={fLabel}>Hold Qty *</label>
                        <input
                            type="number"
                            value={hold_qty}
                            onChange={e => setHold_qty(int(e.target.value))}
                            className={fInput + " text-right font-bold"}
                        />
                    </div>
                    {error && <p className="text-xs text-red-500 bg-red-50 rounded p-2">{error}</p>}
                </div>
                <div className="flex justify-end gap-2 px-4 py-3 bg-gray-50 border-t shrink-0">
                    <button onClick={onClose} className="px-4 py-2 rounded border border-gray-200 text-xs font-black uppercase text-gray-600 hover:bg-gray-100 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving}
                        className="flex items-center gap-2 px-5 py-2 rounded bg-blue-700 hover:bg-blue-800 disabled:opacity-40 text-white text-xs font-black uppercase tracking-wider transition-all">
                        {saving ? <RefreshCcw size={12} className="animate-spin" /> : <ArrowRight size={12} />}
                        {saving ? "Transferring..." : "Transfer to WH"}
                    </button>
                </div>
            </div>
        </div>
    );
}
