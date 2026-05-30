"use client";
import { useState, useEffect } from "react";
import { X, Warehouse, RefreshCcw, Check } from "lucide-react";
import { toast } from "sonner";

const t = (v: any) => String(v ?? "").trim();

interface Props {
    open: boolean;
    onClose: () => void;
    boxUnico: string;
    cases: any[];
    userId: string;
    onSuccess: () => void;
}

const EMPTY = { case_uq: "", box_qty: 0, packs_box: 0, packs_units: 0, salesman_uq: "" };

export function ModalBoxWHControl({ open, onClose, boxUnico, cases, userId, onSuccess }: Props) {
    const [form,    setForm]    = useState({ ...EMPTY });
    const [loading, setLoading] = useState(false);
    const [saving,  setSaving]  = useState(false);
    const [error,   setError]   = useState<string | null>(null);

    useEffect(() => {
        if (!open || !boxUnico) return;
        setLoading(true);
        setError(null);
        fetch(`/api/inventory-entry/boxes/${boxUnico}`)
            .then(r => r.json())
            .then(d => {
                if (!d) return;
                const fill: any = {};
                for (const [k, v] of Object.entries(d)) fill[k.toLowerCase()] = v;
                setForm({
                    case_uq:     t(fill.case_uq),
                    box_qty:     parseInt(fill.box_qty  ?? 0) || 0,
                    packs_box:   parseInt(fill.packs_box ?? fill.bunches_x_case ?? 0) || 0,
                    packs_units: parseInt(fill.packs_units ?? fill.units_x_bunch ?? 0) || 0,
                    salesman_uq: t(fill.salesman_uq ?? fill.customer_uq ?? ""),
                });
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [open, boxUnico]);

    if (!open) return null;

    const setF = (key: string, val: any) => setForm(p => ({ ...p, [key]: val }));

    const handleSave = async () => {
        setSaving(true); setError(null);
        try {
            const res = await fetch(`/api/inventory-entry/boxes/${boxUnico}/wh-control`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, user_uq: userId }),
            });
            const d = await res.json();
            if (!d.success) throw new Error(d.error || "WH Control update failed");
            toast.success("WH Control updated.");
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
                        <span className="font-black text-[10px] text-white uppercase tracking-widest">Box WH Control</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={16} /></button>
                </div>
                <div className="p-4 space-y-3">
                    {loading && <div className="flex items-center gap-2 text-gray-400 text-xs"><RefreshCcw size={12} className="animate-spin" /> Loading...</div>}
                    <div className="bg-gray-50 rounded p-2 text-xs text-gray-600 border border-gray-100">
                        Box: <span className="font-mono font-bold text-gray-800">{boxUnico}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <label className={fLabel}>Case</label>
                        <select value={form.case_uq} onChange={e => setF("case_uq", e.target.value)} className={fInput}>
                            <option value="">-- Case --</option>
                            {cases.map((c: any) => (
                                <option key={t(c.UNICO)} value={t(c.UNICO)}>{t(c.CASE ?? c.DESCRIPTION ?? c.UNICO)}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-0.5">
                            <label className={fLabel}>Box Qty</label>
                            <input type="number" value={form.box_qty} onChange={e => setF("box_qty", parseInt(e.target.value) || 0)} className={fInput + " text-right"} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <label className={fLabel}>Packs / Box</label>
                            <input type="number" value={form.packs_box} onChange={e => setF("packs_box", parseInt(e.target.value) || 0)} className={fInput + " text-right"} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <label className={fLabel}>Packs Units</label>
                            <input type="number" value={form.packs_units} onChange={e => setF("packs_units", parseInt(e.target.value) || 0)} className={fInput + " text-right"} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <label className={fLabel}>Salesman UQ</label>
                            <input value={form.salesman_uq} onChange={e => setF("salesman_uq", e.target.value)} className={fInput + " font-mono"} />
                        </div>
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
                        {saving ? "Saving..." : "Save WH Control"}
                    </button>
                </div>
            </div>
        </div>
    );
}
