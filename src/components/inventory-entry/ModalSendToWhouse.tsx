"use client";
import { useState, useEffect } from "react";
import { X, ArrowRight, RefreshCcw, Warehouse } from "lucide-react";
import { toast } from "sonner";

const t = (v: any) => String(v ?? "").trim();

interface Props {
    open: boolean;
    onClose: () => void;
    packUq: string;
    warehouses: any[];
    userId: string;
    onSuccess: () => void;
}

export function ModalSendToWhouse({ open, onClose, packUq, warehouses, userId, onSuccess }: Props) {
    const [whouseUq,   setWhouseUq]   = useState("");
    const [packingNo,  setPackingNo]  = useState("");
    const [awbcode,    setAwbcode]    = useState("");
    const [loading,    setLoading]    = useState(false);
    const [saving,     setSaving]     = useState(false);
    const [error,      setError]      = useState<string | null>(null);

    useEffect(() => {
        if (!open || !packUq) return;
        setLoading(true);
        setError(null);
        fetch(`/api/inventory-entry/packings/${packUq}`)
            .then(r => r.json())
            .then(d => {
                if (!d) return;
                const f: any = {};
                for (const [k, v] of Object.entries(d)) f[k.toLowerCase()] = v;
                setPackingNo(t(f.packing_no ?? ""));
                setAwbcode(t(f.awbcode ?? ""));
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [open, packUq]);

    if (!open) return null;

    const handleSave = async () => {
        if (!t(whouseUq)) { toast.error("Select a warehouse."); return; }
        setSaving(true); setError(null);
        try {
            const res = await fetch(`/api/inventory-entry/packings/${packUq}/to-whouse`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ whouse_uq: whouseUq, user_uq: userId }),
            });
            const d = await res.json();
            if (!d.success) throw new Error(d.error || "Send to warehouse failed");
            toast.success("Packing sent to warehouse.");
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
                        <span className="font-black text-[10px] text-white uppercase tracking-widest">Packing to Warehouse</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={16} /></button>
                </div>
                <div className="p-4 space-y-3">
                    {loading && <div className="flex items-center gap-2 text-gray-400 text-xs"><RefreshCcw size={12} className="animate-spin" /> Loading...</div>}
                    {/* Packing info — readonly, large text like VFP */}
                    <div className="bg-gray-50 rounded p-3 border border-gray-100 space-y-2">
                        <div>
                            <div className={fLabel + " mb-0.5"}>Packing No.</div>
                            <div className="font-mono font-black text-gray-800 text-sm">{packingNo || "—"}</div>
                        </div>
                        <div>
                            <div className={fLabel + " mb-0.5"}>AWB Code</div>
                            <div className="font-mono font-black text-gray-800 text-sm">{awbcode || "—"}</div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <label className={fLabel}>Warehouse *</label>
                        <select value={whouseUq} onChange={e => setWhouseUq(e.target.value)} className={fInput}>
                            <option value="">-- Select Warehouse --</option>
                            {warehouses.map((w: any) => (
                                <option key={t(w.UNICO)} value={t(w.UNICO)}>
                                    {t(w.WAREHOUSE ?? w.WP_NAME ?? w.UNICO)}
                                </option>
                            ))}
                        </select>
                    </div>
                    {error && <p className="text-xs text-red-500 bg-red-50 rounded p-2">{error}</p>}
                </div>
                <div className="flex justify-end gap-2 px-4 py-3 bg-gray-50 border-t shrink-0">
                    <button onClick={onClose} className="px-4 py-2 rounded border border-gray-200 text-xs font-black uppercase text-gray-600 hover:bg-gray-100 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving || !whouseUq}
                        className="flex items-center gap-2 px-5 py-2 rounded bg-blue-700 hover:bg-blue-800 disabled:opacity-40 text-white text-xs font-black uppercase tracking-wider transition-all">
                        {saving ? <RefreshCcw size={12} className="animate-spin" /> : <ArrowRight size={12} />}
                        {saving ? "Sending..." : "Send to WH"}
                    </button>
                </div>
            </div>
        </div>
    );
}
