"use client";
import { useState, useEffect } from "react";
import { X, FileText, RefreshCcw, Check, Save } from "lucide-react";
import { toast } from "sonner";

const t = (v: any) => String(v ?? "").trim();
const today = () => new Date().toISOString().split("T")[0];

interface Props {
    open: boolean;
    onClose: () => void;
    packUq: string;
    warehouses: any[];
    airlines: any[];
    userId: string;
    onSuccess: () => void;
}

const EMPTY = {
    packing_no: "", invoice_date: today(), invoice_no: "", awbcode: "",
    airline_uq: "", details: "", porder_no: 0, wphysical_uq: "",
    available_date: today(), inhouse: false, consolidated: false,
};

export function ModalHeader2({ open, onClose, packUq, warehouses, airlines, userId, onSuccess }: Props) {
    const [form,    setForm]    = useState({ ...EMPTY });
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
                if (!d) return;
                const fill: any = {};
                for (const [k, v] of Object.entries(d)) fill[k.toLowerCase()] = v;
                setForm({
                    packing_no:     t(fill.packing_no),
                    invoice_date:   fill.date_invo ? new Date(fill.date_invo).toISOString().split("T")[0] : today(),
                    invoice_no:     t(fill.invoice_no),
                    awbcode:        t(fill.awbcode),
                    airline_uq:     t(fill.airline_uq ?? fill.pob_uq),
                    details:        t(fill.details),
                    porder_no:      parseInt(fill.porder_no ?? 0) || 0,
                    wphysical_uq:   t(fill.wphysical_uq),
                    available_date: fill.available_date ? new Date(fill.available_date).toISOString().split("T")[0] : today(),
                    inhouse:        Boolean(fill.inhouse),
                    consolidated:   Boolean(fill.consolidated),
                });
            })
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [open, packUq]);

    if (!open) return null;

    const setF = (key: string, val: any) => setForm(p => ({ ...p, [key]: val }));

    const handleSave = async () => {
        setSaving(true); setError(null);
        try {
            const res = await fetch(`/api/inventory-entry/packings/${packUq}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, grower_uq: "", user_uq: userId }),
            });
            const d = await res.json();
            if (!d.success) throw new Error(d.error || "Update failed");
            toast.success("Packing header updated.");
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
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg flex flex-col overflow-hidden" style={{ maxHeight: "85vh" }} onClick={e => e.stopPropagation()}>
                <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 rounded-t-lg shrink-0">
                    <div className="flex items-center gap-2">
                        <FileText size={16} className="text-[#FB7506]" />
                        <span className="font-black text-[10px] text-white uppercase tracking-widest">Edit Packing Header 2</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={16} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {loading && <div className="flex items-center gap-2 text-gray-400 text-xs"><RefreshCcw size={12} className="animate-spin" />Loading...</div>}
                    <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                        <div className="flex flex-col gap-0.5">
                            <label className={fLabel}>Packing No.</label>
                            <input value={form.packing_no} onChange={e => setF("packing_no", e.target.value)} className={fInput} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <label className={fLabel}>Invoice No.</label>
                            <input value={form.invoice_no} onChange={e => setF("invoice_no", e.target.value)} className={fInput} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <label className={fLabel}>Invoice Date</label>
                            <input type="date" value={form.invoice_date} onChange={e => setF("invoice_date", e.target.value)} className={fInput} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <label className={fLabel}>Available Date</label>
                            <input type="date" value={form.available_date} onChange={e => setF("available_date", e.target.value)} className={fInput} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <label className={fLabel}>AWB Code</label>
                            <input value={form.awbcode} onChange={e => setF("awbcode", e.target.value)} className={fInput + " font-mono"} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <label className={fLabel}>Airline</label>
                            <select value={form.airline_uq} onChange={e => setF("airline_uq", e.target.value)} className={fInput}>
                                <option value="">-- None --</option>
                                {airlines.map((a: any) => (
                                    <option key={t(a.UNICO)} value={t(a.UNICO)}>{t(a.AIRLINE ?? a.DESCRIPTION ?? a.UNICO)}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <label className={fLabel}>Physical Warehouse</label>
                            <select value={form.wphysical_uq} onChange={e => setF("wphysical_uq", e.target.value)} className={fInput}>
                                <option value="">-- None --</option>
                                {warehouses.map((w: any) => (
                                    <option key={t(w.UNICO)} value={t(w.UNICO)}>{t(w.WHOUSE ?? w.DESCRIPTION ?? w.WPHYSICAL ?? w.NAME ?? w.UNICO)}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <label className={fLabel}>POrder No.</label>
                            <input type="number" value={form.porder_no} onChange={e => setF("porder_no", parseInt(e.target.value) || 0)} className={fInput + " text-right"} />
                        </div>
                        <div className="col-span-2 flex flex-col gap-0.5">
                            <label className={fLabel}>Details / Comments</label>
                            <textarea value={form.details} onChange={e => setF("details", e.target.value)} rows={2} className="fos-input text-xs resize-none py-1" />
                        </div>
                        <div className="col-span-2 flex items-center gap-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={form.inhouse} onChange={e => setF("inhouse", e.target.checked)} className="w-4 h-4 accent-[#FB7506]" />
                                <span className="text-xs font-semibold text-gray-700">In House</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={form.consolidated} onChange={e => setF("consolidated", e.target.checked)} className="w-4 h-4 accent-[#FB7506]" />
                                <span className="text-xs font-semibold text-gray-700">Consolidated</span>
                            </label>
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
                        {saving ? <RefreshCcw size={12} className="animate-spin" /> : <Save size={12} />}
                        {saving ? "Saving..." : "Save Header"}
                    </button>
                </div>
            </div>
        </div>
    );
}
