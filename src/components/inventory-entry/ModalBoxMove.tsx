"use client";
import { useState } from "react";
import { X, ArrowRight, RefreshCcw, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const t = (v: any) => String(v ?? "").trim();
const norm = (rows: any[]) => rows.map(r => { const n: any = {}; for (const [k, v] of Object.entries(r)) n[k.toUpperCase()] = v; return n; });

interface Props {
    open: boolean;
    onClose: () => void;
    boxUnico: string;
    currentPackUq: string;
    userId: string;
    onSuccess: () => void;
}

export function ModalBoxMove({ open, onClose, boxUnico, currentPackUq, userId, onSuccess }: Props) {
    const [targetPackUq, setTargetPackUq] = useState("");
    const [saving, setSaving] = useState(false);

    if (!open) return null;

    const handleSave = async () => {
        if (!t(targetPackUq)) { toast.error("Enter a target packing ID."); return; }
        if (!boxUnico) { toast.error("No box selected."); return; }
        setSaving(true);
        try {
            const res = await fetch(`/api/inventory-entry/boxes/${boxUnico}/move`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newpacking_uq: targetPackUq, user_uq: userId }),
            });
            const d = await res.json();
            if (!d.success) throw new Error(d.error || "Move failed");
            toast.success("Box moved successfully.");
            onSuccess();
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
                        <ArrowRight size={16} className="text-[#FB7506]" />
                        <span className="font-black text-[10px] text-white uppercase tracking-widest">Move Box</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={16} /></button>
                </div>
                <div className="p-4 space-y-3">
                    <div className="bg-gray-50 rounded p-2 text-xs text-gray-600 border border-gray-100">
                        Box: <span className="font-mono font-bold text-gray-800">{boxUnico}</span>
                        <br />
                        Current packing: <span className="font-mono font-bold text-gray-800">{currentPackUq}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <label className={fLabel}>Target Packing ID *</label>
                        <input
                            value={targetPackUq}
                            onChange={e => setTargetPackUq(e.target.value)}
                            className={fInput}
                            placeholder="Enter target packing unique ID"
                            autoFocus
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-2 px-4 py-3 bg-gray-50 border-t shrink-0">
                    <button onClick={onClose} className="px-4 py-2 rounded border border-gray-200 text-xs font-black uppercase text-gray-600 hover:bg-gray-100 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving}
                        className="flex items-center gap-2 px-5 py-2 rounded bg-[#FB7506] hover:bg-orange-600 disabled:opacity-40 text-white text-xs font-black uppercase tracking-wider transition-all">
                        {saving ? <RefreshCcw size={12} className="animate-spin" /> : <Check size={12} />}
                        {saving ? "Moving..." : "Move Box"}
                    </button>
                </div>
            </div>
        </div>
    );
}
