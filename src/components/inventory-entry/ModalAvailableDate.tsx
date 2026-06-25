"use client";
import { useState, useEffect } from "react";
import { X, Calendar, RefreshCcw, Check } from "lucide-react";
import { toast } from "sonner";

const t = (v: any) => String(v ?? "").trim();
const today = () => new Date().toISOString().split("T")[0];

interface Props {
    open: boolean;
    onClose: () => void;
    packUq: string;
    userId: string;
    onSuccess: () => void;
}

export function ModalAvailableDate({ open, onClose, packUq, userId, onSuccess }: Props) {
    const [availableDate, setAvailableDate] = useState(today());
    const [loading, setLoading] = useState(false);
    const [saving,  setSaving]  = useState(false);
    const [error,   setError]   = useState<string | null>(null);

    useEffect(() => {
        if (!open || !packUq) return;
        setLoading(true);
        setError(null);
        fetch(`/api/inventory-entry/packings/${packUq}`)
            .then(r => r.json())
            .then(d => {
                const f: any = {};
                for (const [k, v] of Object.entries(d ?? {})) f[k.toLowerCase()] = v;
                setAvailableDate(f.available_date ? new Date(f.available_date).toISOString().split("T")[0] : today());
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [open, packUq]);

    if (!open) return null;

    const handleSave = async () => {
        setSaving(true); setError(null);
        try {
            const r = await fetch(`/api/inventory-entry/packings/${packUq}`);
            const cur = await r.json();
            const f: any = {};
            for (const [k, v] of Object.entries(cur ?? {})) f[k.toLowerCase()] = v;
            const payload = {
                grower_uq:      t(f.grower_uq),
                packing_no:     t(f.packing_no),
                invoice_date:   f.date_invo ? new Date(f.date_invo).toISOString().split("T")[0] : today(),
                invoice_no:     t(f.invoice_no),
                awbcode:        t(f.awbcode),
                details:        t(f.details),
                porder_no:      parseInt(f.porder_no ?? 0) || 0,
                wphysical_uq:   t(f.wphysical_uq),
                available_date: availableDate,
                consolidated:   Boolean(f.consolidated),
            };
            const res = await fetch(`/api/inventory-entry/packings/${packUq}`, {
                method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
            });
            const d = await res.json();
            if (!d.success) throw new Error(d.error || "Update failed");
            toast.success("Available date updated.");
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
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-xs flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 rounded-t-lg shrink-0">
                    <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-[#FB7506]" />
                        <span className="font-black text-[10px] text-white uppercase tracking-widest">Update Available Date</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={16} /></button>
                </div>
                <div className="p-4 space-y-3">
                    {loading && <div className="flex items-center gap-2 text-gray-400 text-xs"><RefreshCcw size={12} className="animate-spin" /> Loading...</div>}
                    <div className="flex flex-col gap-0.5">
                        <label className={fLabel}>Available Date</label>
                        <input type="date" value={availableDate} onChange={e => setAvailableDate(e.target.value)} className={fInput} />
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
                        {saving ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}
