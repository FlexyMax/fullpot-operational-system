"use client";
import { useState } from "react";
import { X, Plus, RefreshCcw, Check } from "lucide-react";
import { toast } from "sonner";

const t = (v: any) => String(v ?? "").trim();

interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function ModalAddPOToInventory({ open, onClose, onSuccess }: Props) {
    const [awbcode, setAwbcode] = useState("");
    const [saving,  setSaving]  = useState(false);
    const [error,   setError]   = useState<string | null>(null);

    if (!open) return null;

    const handleSave = async () => {
        if (!t(awbcode)) { setError("AWB code is required."); return; }
        setSaving(true); setError(null);
        try {
            const res = await fetch(`/api/inventory-entry/packings/_/action`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "from_porder", awbcode: t(awbcode) }),
            });
            const d = await res.json();
            if (!d.success) throw new Error(d.error || "Insert from P.O failed");
            toast.success("Purchase orders added to inventory.");
            onSuccess();
            onClose();
            setAwbcode("");
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
                        <Plus size={16} className="text-[#FB7506]" />
                        <span className="font-black text-[10px] text-white uppercase tracking-widest">Add P.O to Inventory</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={16} /></button>
                </div>
                <div className="p-4 space-y-3">
                    <p className="text-xs text-gray-500">Bulk-creates packing boxes in inventory from the pending purchase orders for the destination AWB.</p>
                    <div className="flex flex-col gap-0.5">
                        <label className={fLabel}>Destination AWB Code *</label>
                        <input value={awbcode} onChange={e => setAwbcode(e.target.value)} className={fInput} placeholder="e.g. 77707192026" autoFocus />
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
                        {saving ? "Adding..." : "Add to Inventory"}
                    </button>
                </div>
            </div>
        </div>
    );
}
