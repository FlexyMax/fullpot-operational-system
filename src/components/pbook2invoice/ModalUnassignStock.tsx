"use client";
import { useState, useEffect } from "react";
import { X, Minus, RefreshCcw, Check } from "lucide-react";
import { toast } from "sonner";

const t = (v: any) => String(v ?? "").trim();

interface Props {
    open: boolean;
    onClose: () => void;
    row: any;   // selected row from AssignedStockTab (sp_flower_packing_stock_preassigned)
    onSuccess: () => void;
}

export function ModalUnassignStock({ open, onClose, row, onSuccess }: Props) {
    const [reasons,      setReasons]      = useState<any[]>([]);
    const [reasonUq,     setReasonUq]     = useState("");
    const [boxesDelete,  setBoxesDelete]  = useState(0);
    const [saving,       setSaving]       = useState(false);
    const [error,        setError]        = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;
        setReasonUq("");
        setBoxesDelete(0);
        setError(null);
        fetch("/api/pbook2invoice/reasons")
            .then(r => r.json())
            .then(d => setReasons(Array.isArray(d) ? d : []))
            .catch(() => {});
    }, [open]);

    if (!open || !row) return null;

    const assignedBoxes = parseInt(row.WH_STOCK ?? row.STOCK ?? 0, 10);

    const handleSave = async () => {
        if (!boxesDelete || boxesDelete <= 0) { setError("Boxes to unassign is empty."); return; }
        if (boxesDelete > assignedBoxes) { setError("Boxes to unassign are bigger than assigned boxes."); return; }
        if (!reasonUq) { setError("Reason is empty."); return; }
        setSaving(true); setError(null);
        try {
            const res = await fetch("/api/pbook2invoice/unassign-stock", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ stock_uq: t(row.UNICO), boxes_delete: boxesDelete, reason_uq: reasonUq }),
            });
            const d = await res.json();
            if (!d.success) throw new Error(d.error || "Save failed");
            toast.success("Stock unassigned.");
            onSuccess();
            onClose();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 rounded-t-lg shrink-0">
                    <div className="flex items-center gap-2">
                        <Minus size={16} className="text-[#FB7506]" />
                        <span className="font-black text-[10px] text-white uppercase tracking-widest">Unassign Stock</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={16} /></button>
                </div>
                <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-gray-50 rounded p-2">
                        <div><span className="text-gray-400">Product</span><div className="font-semibold text-gray-700 truncate">{t(row.DESCRIPTION)}</div></div>
                        <div><span className="text-gray-400">Vendor</span><div className="font-semibold text-gray-700">{t(row.GROWER)}</div></div>
                        <div><span className="text-gray-400">Awb</span><div className="font-semibold text-gray-700">{t(row.AWBCODE)}</div></div>
                        <div><span className="text-gray-400">Lote</span><div className="font-semibold text-gray-700">{t(row.LOTE)}</div></div>
                    </div>
                    <label className="block">
                        <span className="text-[10px] font-bold text-red-500 uppercase">Assigned Boxes</span>
                        <input value={assignedBoxes} readOnly className="fos-input text-xs w-full mt-0.5 bg-gray-100 text-gray-500" />
                    </label>
                    <label className="block">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Boxes to Unassign</span>
                        <input type="number" value={boxesDelete || ""} onChange={e => setBoxesDelete(Math.abs(parseInt(e.target.value || "0", 10)))}
                            autoFocus className="fos-input text-xs w-full mt-0.5" />
                    </label>
                    <label className="block">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Reason</span>
                        <select value={reasonUq} onChange={e => setReasonUq(e.target.value)} className="fos-input text-xs w-full mt-0.5">
                            <option value="">Select a reason...</option>
                            {reasons.map((r: any) => <option key={t(r.unico)} value={t(r.unico)}>{t(r.reason)}</option>)}
                        </select>
                    </label>
                    {error && <p className="text-xs text-red-500 bg-red-50 rounded p-2">{error}</p>}
                </div>
                <div className="flex justify-end gap-2 px-4 py-3 bg-gray-50 border-t shrink-0">
                    <button onClick={onClose} className="px-4 py-2 rounded border border-gray-200 text-xs font-black uppercase text-gray-600 hover:bg-gray-100 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving}
                        className="flex items-center gap-2 px-5 py-2 rounded bg-[#FB7506] hover:bg-orange-600 disabled:opacity-40 text-white text-xs font-black uppercase tracking-wider transition-all">
                        {saving ? <RefreshCcw size={12} className="animate-spin" /> : <Check size={12} />}
                        {saving ? "Saving..." : "Unassign"}
                    </button>
                </div>
            </div>
        </div>
    );
}
