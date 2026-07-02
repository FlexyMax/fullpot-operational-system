"use client";
import { useState, useEffect } from "react";
import { X, StickyNote, RefreshCcw, Check } from "lucide-react";
import { toast } from "sonner";

const t = (v: any) => String(v ?? "").trim();

interface Props {
    open: boolean;
    onClose: () => void;
    boxUnico: string;
    onSuccess: () => void;
}

export function ModalBoxNotes({ open, onClose, boxUnico, onSuccess }: Props) {
    const [notes,   setNotes]   = useState("");
    const [loading, setLoading] = useState(false);
    const [saving,  setSaving]  = useState(false);

    useEffect(() => {
        if (!open || !boxUnico) return;
        setLoading(true);
        fetch(`/api/inventory-entry/boxes/${boxUnico}/notes`)
            .then(r => r.json())
            .then(d => {
                const f: any = {};
                for (const [k, v] of Object.entries(d ?? {})) f[k.toLowerCase()] = v;
                setNotes(t(f.inventory_notes ?? f.notes ?? ""));
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [open, boxUnico]);

    if (!open) return null;

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/inventory-entry/boxes/${boxUnico}/notes`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notes }),
            });
            const d = await res.json();
            if (!d.success) throw new Error(d.error || "Save failed");
            toast.success("Notes saved.");
            onSuccess();
            onClose();
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 rounded-t-lg shrink-0">
                    <div className="flex items-center gap-2">
                        <StickyNote size={16} className="text-[#FB7506]" />
                        <span className="font-black text-[10px] text-white uppercase tracking-widest">Lot Notes — {boxUnico}</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={16} /></button>
                </div>
                <div className="p-4 space-y-3">
                    {loading && <div className="flex items-center gap-2 text-gray-400 text-xs"><RefreshCcw size={12} className="animate-spin" /> Loading...</div>}
                    <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value.substring(0, 250))}
                        rows={5}
                        maxLength={250}
                        placeholder="Comments about this product/lot..."
                        className="fos-input text-xs w-full resize-none"
                    />
                    <div className="text-right text-[10px] text-gray-400">{notes.length}/250</div>
                </div>
                <div className="flex justify-end gap-2 px-4 py-3 bg-gray-50 border-t shrink-0">
                    <button onClick={onClose} className="px-4 py-2 rounded border border-gray-200 text-xs font-black uppercase text-gray-600 hover:bg-gray-100 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving}
                        className="flex items-center gap-2 px-5 py-2 rounded bg-[#FB7506] hover:bg-orange-600 disabled:opacity-40 text-white text-xs font-black uppercase tracking-wider transition-all">
                        {saving ? <RefreshCcw size={12} className="animate-spin" /> : <Check size={12} />}
                        {saving ? "Saving..." : "Save Notes"}
                    </button>
                </div>
            </div>
        </div>
    );
}
