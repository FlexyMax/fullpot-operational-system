"use client";
import { useState, useEffect } from "react";
import { X, ArrowRight, RefreshCcw, Check, Warehouse } from "lucide-react";
import { toast } from "sonner";

const t = (v: any) => String(v ?? "").trim();
const today = () => new Date().toISOString().split("T")[0];
const num = (v: any) => { const n = parseFloat(String(v ?? 0)); return isNaN(n) ? 0 : n; };
const int = (v: any) => { const n = parseInt(String(v ?? 0), 10); return isNaN(n) ? 0 : n; };

interface Props {
    open: boolean;
    onClose: () => void;
    boxUnico: string;
    warehouses: any[];
    userId: string;
    onSuccess: () => void;
}

const EMPTY = {
    wphysical_uq: "", awbcode: "", date_invo: today(),
    available: today(), invoice_no: "", box_qty: 0, box_freight: 0,
};

export function ModalWarehouseTransfer({ open, onClose, boxUnico, warehouses, userId, onSuccess }: Props) {
    const [form,    setForm]    = useState({ ...EMPTY });
    const [loading, setLoading] = useState(false);
    const [saving,  setSaving]  = useState(false);
    const [error,   setError]   = useState<string | null>(null);

    useEffect(() => {
        if (!open || !boxUnico) return;
        setLoading(true);
        fetch(`/api/inventory-entry/boxes/${boxUnico}`)
            .then(r => r.json())
            .then(d => {
                if (!d) return;
                const fill: any = {};
                for (const [k, v] of Object.entries(d)) fill[k.toLowerCase()] = v;
                setForm(prev => ({
                    ...prev,
                    awbcode:   t(fill.awbcode ?? ""),
                    box_qty:   int(fill.box_qty ?? 0),
                }));
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [open, boxUnico]);

    if (!open) return null;

    const setF = (key: string, val: any) => setForm(p => ({ ...p, [key]: val }));

    const handleSave = async () => {
        if (!t(form.wphysical_uq)) { toast.error("Select a target warehouse."); return; }
        if (!form.box_qty) { toast.error("Box qty is required."); return; }
        setSaving(true); setError(null);
        try {
            const res = await fetch(`/api/inventory-entry/boxes/${boxUnico}/transfer`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, user_uq: userId }),
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
                    {loading && <div className="flex items-center gap-2 text-gray-400 text-xs"><RefreshCcw size={12} className="animate-spin" />Loading...</div>}
                    <div className="bg-gray-50 rounded p-2 text-xs text-gray-600 border border-gray-100">
                        Box: <span className="font-mono font-bold text-gray-800">{boxUnico}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <label className={fLabel}>Target Warehouse *</label>
                        <select value={form.wphysical_uq} onChange={e => setF("wphysical_uq", e.target.value)} className={fInput}>
                            <option value="">-- Select Warehouse --</option>
                            {warehouses.map((w: any) => (
                                <option key={t(w.UNICO)} value={t(w.UNICO)}>{t(w.WHOUSE ?? w.DESCRIPTION ?? w.WPHYSICAL ?? w.NAME ?? w.UNICO)}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-0.5">
                            <label className={fLabel}>AWB Code</label>
                            <input value={form.awbcode} onChange={e => setF("awbcode", e.target.value)} className={fInput + " font-mono"} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <label className={fLabel}>Invoice No.</label>
                            <input value={form.invoice_no} onChange={e => setF("invoice_no", e.target.value)} className={fInput} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <label className={fLabel}>Invoice Date</label>
                            <input type="date" value={form.date_invo} onChange={e => setF("date_invo", e.target.value)} className={fInput} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <label className={fLabel}>Available Date</label>
                            <input type="date" value={form.available} onChange={e => setF("available", e.target.value)} className={fInput} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <label className={fLabel}>Box Qty *</label>
                            <input type="number" value={form.box_qty} onChange={e => setF("box_qty", int(e.target.value))} className={fInput + " text-right font-bold"} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <label className={fLabel}>Box Freight</label>
                            <input type="number" step="0.01" value={form.box_freight} onChange={e => setF("box_freight", num(e.target.value))} className={fInput + " text-right"} />
                        </div>
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
