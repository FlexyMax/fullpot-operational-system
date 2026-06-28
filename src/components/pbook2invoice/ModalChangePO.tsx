"use client";
import { useState, useEffect } from "react";
import { X, FilePen, RefreshCcw, Check } from "lucide-react";
import { toast } from "sonner";

const t = (v: any) => String(v ?? "").trim();

interface Props {
    open: boolean;
    onClose: () => void;
    pbookUq: string;
    currentPo: string;
    onSuccess: () => void;
}

export function ModalChangePO({ open, onClose, pbookUq, currentPo, onSuccess }: Props) {
    const [newPo,   setNewPo]   = useState("");
    const [saving,  setSaving]  = useState(false);
    const [error,   setError]   = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;
        setNewPo("");
        setError(null);
    }, [open]);

    if (!open) return null;

    const handleSave = async () => {
        if (!newPo.trim()) { setError("New PO is empty."); return; }
        setSaving(true); setError(null);
        try {
            const res = await fetch("/api/pbook2invoice/change-po", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pbook_uq: pbookUq, new_po: newPo.trim() }),
            });
            const d = await res.json();
            if (!d.success) throw new Error(d.error || "Save failed");
            toast.success("PO number changed.");
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
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 rounded-t-lg shrink-0">
                    <div className="flex items-center gap-2">
                        <FilePen size={16} className="text-[#FB7506]" />
                        <span className="font-black text-[10px] text-white uppercase tracking-widest">Change PO Number</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={16} /></button>
                </div>
                <div className="p-4 space-y-3">
                    <label className="block">
                        <span className="text-[10px] font-bold text-red-500 uppercase">Current PO Number</span>
                        <input value={t(currentPo) || "—"} readOnly className="fos-input text-xs w-full mt-0.5 bg-gray-100 text-gray-500" />
                    </label>
                    <label className="block">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">New PO Number</span>
                        <input value={newPo} onChange={e => setNewPo(e.target.value.substring(0, 30))} autoFocus
                            className="fos-input text-xs w-full mt-0.5" placeholder="Customer PO number" />
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
                        {saving ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}
