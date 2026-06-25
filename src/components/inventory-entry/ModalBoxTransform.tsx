"use client";
import { useState } from "react";
import { X, ArrowRight, RefreshCcw, Check } from "lucide-react";
import { toast } from "sonner";

const t = (v: any) => String(v ?? "").trim();
const num = (v: any) => { const n = parseFloat(String(v ?? 0)); return isNaN(n) ? 0 : n; };

interface Props {
    open: boolean;
    onClose: () => void;
    boxUnico: string;
    boxLabel: string;
    growers: any[];
    warehouses: any[];
    userId: string;
    onSuccess: () => void;
}

export function ModalBoxTransform({ open, onClose, boxUnico, boxLabel, growers, warehouses, userId, onSuccess }: Props) {
    const [vendor_uq,            setVendorUq]      = useState("");
    const [physical_destination, setPhysicalDest]  = useState("");
    const [sales_price,          setSalesPrice]    = useState(0);
    const [saving,               setSaving]        = useState(false);
    const [error,                setError]         = useState<string | null>(null);

    if (!open) return null;

    const handleSave = async () => {
        if (!vendor_uq) { toast.error("Select a destination vendor."); return; }
        if (!physical_destination) { toast.error("Select a destination warehouse."); return; }
        setSaving(true); setError(null);
        try {
            const res = await fetch(`/api/inventory-entry/boxes/${boxUnico}/transform`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ vendor_uq, physical_destination, sales_price, user_uq: userId }),
            });
            const d = await res.json();
            if (!d.success) throw new Error(d.error || "Transform failed");
            toast.success("Inventory transformed.");
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
                        <ArrowRight size={16} className="text-[#FB7506]" />
                        <span className="font-black text-[10px] text-white uppercase tracking-widest">Transform Inventory</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={16} /></button>
                </div>
                <div className="p-4 space-y-3">
                    <div className="bg-gray-50 rounded p-2 text-xs text-gray-600 border border-gray-100">
                        Lot: <span className="font-bold text-gray-800">{boxLabel || boxUnico}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <label className={fLabel}>Destination Vendor *</label>
                        <select value={vendor_uq} onChange={e => setVendorUq(e.target.value)} className={fInput}>
                            <option value="">-- Select Vendor --</option>
                            {growers.map((g: any) => (
                                <option key={t(g.UNICO)} value={t(g.UNICO)}>{t(g.GROWER ?? g.NAME ?? g.UNICO)}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <label className={fLabel}>Destination Warehouse *</label>
                        <select value={physical_destination} onChange={e => setPhysicalDest(e.target.value)} className={fInput}>
                            <option value="">-- Select Warehouse --</option>
                            {warehouses.map((w: any) => (
                                <option key={t(w.UNICO)} value={t(w.UNICO)}>{t(w.WHOUSE ?? w.DESCRIPTION ?? w.WPHYSICAL ?? w.NAME ?? w.UNICO)}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <label className={fLabel}>Sales Price</label>
                        <input type="number" step="0.01" value={sales_price} onChange={e => setSalesPrice(num(e.target.value))} className={fInput + " text-right"} />
                    </div>
                    {error && <p className="text-xs text-red-500 bg-red-50 rounded p-2">{error}</p>}
                </div>
                <div className="flex justify-end gap-2 px-4 py-3 bg-gray-50 border-t shrink-0">
                    <button onClick={onClose} className="px-4 py-2 rounded border border-gray-200 text-xs font-black uppercase text-gray-600 hover:bg-gray-100 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving}
                        className="flex items-center gap-2 px-5 py-2 rounded bg-[#FB7506] hover:bg-orange-600 disabled:opacity-40 text-white text-xs font-black uppercase tracking-wider transition-all">
                        {saving ? <RefreshCcw size={12} className="animate-spin" /> : <Check size={12} />}
                        {saving ? "Transforming..." : "Transform"}
                    </button>
                </div>
            </div>
        </div>
    );
}
