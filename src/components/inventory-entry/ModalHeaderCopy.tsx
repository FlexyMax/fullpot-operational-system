"use client";
import { useState } from "react";
import { X, Copy, RefreshCcw, Check } from "lucide-react";
import { toast } from "sonner";

const t = (v: any) => String(v ?? "").trim();
const today = () => new Date().toISOString().split("T")[0];

interface Props {
    open: boolean;
    onClose: () => void;
    packUq: string;
    packingNo: string;
    invoiceNo: string;
    grower: string;
    userId: string;
    onSuccess: (newUnico?: string) => void;
}

export function ModalHeaderCopy({ open, onClose, packUq, packingNo, invoiceNo, grower, userId, onSuccess }: Props) {
    const [dateInvo, setDateInvo] = useState(today());
    const [cutOff,   setCutOff]   = useState(today());
    const [saving,   setSaving]   = useState(false);

    if (!open) return null;

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/inventory-entry/packings/${packUq}/copy`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date_invo: dateInvo, ldcut_off: cutOff, user_uq: userId }),
            });
            const d = await res.json();
            if (!d.success) throw new Error(d.error || "Copy failed");
            toast.success("Packing copied successfully.");
            onSuccess(d.unico);
            onClose();
        } catch (e: any) {
            toast.error(e.message);
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
                        <Copy size={16} className="text-[#FB7506]" />
                        <span className="font-black text-[10px] text-white uppercase tracking-widest">Copy Packing Header</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={16} /></button>
                </div>
                <div className="p-4 space-y-3">
                    <div className="bg-gray-50 rounded p-2 text-xs text-gray-600 border border-gray-100 space-y-0.5">
                        <div>Vendor: <span className="font-bold text-gray-800">{t(grower) || "—"}</span></div>
                        <div>Packing No: <span className="font-bold text-gray-800">{t(packingNo) || "—"}</span> &nbsp; Invoice No: <span className="font-bold text-gray-800">{t(invoiceNo) || "—"}</span></div>
                        <div className="text-[10px] text-gray-400">Source unico: <span className="font-mono">{packUq}</span></div>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <label className={fLabel}>Invoice Date *</label>
                        <input type="date" value={dateInvo} onChange={e => setDateInvo(e.target.value)} className={fInput} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <label className={fLabel}>Cut Off Date</label>
                        <input type="date" value={cutOff} onChange={e => setCutOff(e.target.value)} className={fInput} />
                    </div>
                </div>
                <div className="flex justify-end gap-2 px-4 py-3 bg-gray-50 border-t shrink-0">
                    <button onClick={onClose} className="px-4 py-2 rounded border border-gray-200 text-xs font-black uppercase text-gray-600 hover:bg-gray-100 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving}
                        className="flex items-center gap-2 px-5 py-2 rounded bg-[#FB7506] hover:bg-orange-600 disabled:opacity-40 text-white text-xs font-black uppercase tracking-wider transition-all">
                        {saving ? <RefreshCcw size={12} className="animate-spin" /> : <Copy size={12} />}
                        {saving ? "Copying..." : "Copy Header"}
                    </button>
                </div>
            </div>
        </div>
    );
}
