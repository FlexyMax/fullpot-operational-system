"use client";
import { useState, useEffect } from "react";
import { X, Plus, RefreshCcw, Check } from "lucide-react";
import { toast } from "sonner";

const t = (v: any) => String(v ?? "").trim();
const int = (v: any) => { const n = parseInt(String(v ?? 0), 10); return isNaN(n) ? 0 : n; };
const num = (v: any) => { const n = parseFloat(String(v ?? 0)); return isNaN(n) ? 0 : n; };

interface Props {
    open: boolean;
    onClose: () => void;
    packUq: string;
    product: any;   // selected row from the Products List grid
    cases: any[];
    userId: string;
    onSuccess: () => void;
}

export function ModalAddProductToPacking({ open, onClose, packUq, product, cases, userId, onSuccess }: Props) {
    const [case_uq,        setCaseUq]       = useState("");
    const [box_qty,        setBoxQty]       = useState(0);
    const [up_x_case,      setUpXCase]      = useState(0);
    const [bunches_x_case, setBunchesXCase] = useState(0);
    const [units_x_bunch,  setUnitsXBunch]  = useState(0);
    const [price,          setPrice]        = useState(0);
    const [saving,         setSaving]       = useState(false);
    const [error,          setError]        = useState<string | null>(null);

    useEffect(() => {
        if (!open || !product) return;
        setCaseUq(t(product.CASE_UQ));
        const upXCase = int(product.UP_X_CASE ?? 0);
        setUpXCase(upXCase);
        setBunchesXCase(upXCase);
        setUnitsXBunch(int(product.UP_X_PACK ?? 1) || 1);
        setBoxQty(0);
        setPrice(num(product.SALES_PRICE ?? 0));
        setError(null);
    }, [open, product]);

    if (!open) return null;

    const handleSave = async () => {
        if (!packUq) { toast.error("Select a packing first."); return; }
        if (!box_qty) { setError("Box Qty is required."); return; }
        setSaving(true); setError(null);
        try {
            const res = await fetch("/api/inventory-entry/boxes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    pack_uq: packUq,
                    product_uq: t(product.UNICO),
                    case_uq, box_qty, up_x_case,
                    bunches_x_case, units_x_bunch,
                    total_units: box_qty * up_x_case,
                    price,
                    user_uq: userId,
                }),
            });
            const d = await res.json();
            if (!d.success) throw new Error(d.error || "Insert failed");
            toast.success("Product added to packing.");
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
                        <Plus size={16} className="text-[#FB7506]" />
                        <span className="font-black text-[10px] text-white uppercase tracking-widest">Add Product to Packing</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={16} /></button>
                </div>
                <div className="p-4 space-y-3">
                    <div className="bg-gray-50 rounded p-2 text-xs text-gray-600 border border-gray-100">
                        Product: <span className="font-bold text-gray-800">{t(product?.DESCRIPTION)}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <label className={fLabel}>Case</label>
                        <select value={case_uq} onChange={e => setCaseUq(e.target.value)} className={fInput}>
                            <option value="">-- Case --</option>
                            {cases.map((c: any) => (
                                <option key={t(c.UNICO)} value={t(c.UNICO)}>{t(c.CASE ?? c.DESCRIPTION ?? c.UNICO)}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-0.5">
                            <label className={fLabel}>Box Qty *</label>
                            <input type="number" value={box_qty} onChange={e => setBoxQty(int(e.target.value))} className={fInput + " text-right"} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <label className={fLabel}>Units / Case</label>
                            <input type="number" value={up_x_case} onChange={e => setUpXCase(int(e.target.value))} className={fInput + " text-right"} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <label className={fLabel}>Bunches / Case</label>
                            <input type="number" value={bunches_x_case} onChange={e => setBunchesXCase(int(e.target.value))} className={fInput + " text-right"} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <label className={fLabel}>Units / Bunch</label>
                            <input type="number" value={units_x_bunch} onChange={e => setUnitsXBunch(int(e.target.value))} className={fInput + " text-right"} />
                        </div>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <label className={fLabel}>Sales Price</label>
                        <input type="number" step="0.01" value={price} onChange={e => setPrice(num(e.target.value))} className={fInput + " text-right"} />
                    </div>
                    {error && <p className="text-xs text-red-500 bg-red-50 rounded p-2">{error}</p>}
                </div>
                <div className="flex justify-end gap-2 px-4 py-3 bg-gray-50 border-t shrink-0">
                    <button onClick={onClose} className="px-4 py-2 rounded border border-gray-200 text-xs font-black uppercase text-gray-600 hover:bg-gray-100 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving}
                        className="flex items-center gap-2 px-5 py-2 rounded bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white text-xs font-black uppercase tracking-wider transition-all">
                        {saving ? <RefreshCcw size={12} className="animate-spin" /> : <Check size={12} />}
                        {saving ? "Adding..." : "Add to Packing"}
                    </button>
                </div>
            </div>
        </div>
    );
}
