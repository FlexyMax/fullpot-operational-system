"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Reason {
    UNICO:  string;
    CODE:   string;
    REASON: string;
}

interface DelayedBoxModalProps {
    mode:      "add" | "edit";
    pkBoxUq:   string;
    initial?:  { unico: string; reason_uq: string; qty: number; notes: string };
    onClose:   () => void;
    onSaved:   () => void;
}

export function DelayedBoxModal({ mode, pkBoxUq, initial, onClose, onSaved }: DelayedBoxModalProps) {
    const [reasons,    setReasons]    = useState<Reason[]>([]);
    const [reasonUq,   setReasonUq]   = useState(initial?.reason_uq ?? "");
    const [qty,        setQty]        = useState(String(initial?.qty ?? "1"));
    const [notes,      setNotes]      = useState(initial?.notes ?? "");
    const [saving,     setSaving]     = useState(false);
    const [loadingR,   setLoadingR]   = useState(true);
    const [error,      setError]      = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/scan-in/reasons")
            .then((r) => r.json())
            .then((data: Reason[]) => { setReasons(Array.isArray(data) ? data : []); })
            .catch(() => setError("Could not load reasons"))
            .finally(() => setLoadingR(false));
    }, []);

    const handleSave = async () => {
        if (!reasonUq) { toast.error("Please select a reason"); return; }
        const qtyNum = parseInt(qty, 10);
        if (isNaN(qtyNum) || qtyNum < 1) { toast.error("Qty must be at least 1"); return; }

        setSaving(true);
        try {
            const body = mode === "add"
                ? { pk_box_uq: pkBoxUq, reason_uq: reasonUq, qty: qtyNum, notes }
                : { unico: initial!.unico, pk_box_uq: pkBoxUq, reason_uq: reasonUq, qty: qtyNum, notes };

            const res = await fetch("/api/scan-in/delayed", {
                method:  mode === "add" ? "POST" : "PUT",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify(body),
            });
            const json = await res.json();
            if (!res.ok) { toast.error(json.error || "Save failed"); return; }
            toast.success(mode === "add" ? "Delayed box added" : "Delayed box updated");
            onSaved();
            onClose();
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setSaving(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[300] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">

                {/* Dark header */}
                <div className="bg-[#374151] text-white px-4 py-3 flex items-center justify-between shrink-0">
                    <span className="font-black text-[11px] uppercase tracking-widest">
                        {mode === "add" ? "Add Delayed Box" : "Edit Delayed Box"}
                    </span>
                    <button onClick={onClose} className="hover:text-[#FB7506] transition-colors">
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 flex flex-col gap-3 overflow-y-auto">
                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded p-2 text-xs text-red-600">
                            <AlertTriangle size={12} />
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                            Reason <span className="text-red-500">*</span>
                        </label>
                        {loadingR ? (
                            <div className="flex items-center gap-2 py-2 text-xs text-gray-400">
                                <Loader2 size={12} className="animate-spin" /> Loading reasons...
                            </div>
                        ) : (
                            <select
                                value={reasonUq}
                                onChange={(e) => setReasonUq(e.target.value)}
                                className="border border-[#DBD9D9] rounded px-3 py-2 text-sm font-semibold text-[#333] bg-[#F5F3F3] focus:outline-none focus:border-[#FB7506]"
                            >
                                <option value="">— Select reason —</option>
                                {reasons.map((r) => (
                                    <option key={r.UNICO} value={r.UNICO}>
                                        {r.CODE} — {r.REASON}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                            Qty <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            min={1}
                            value={qty}
                            onChange={(e) => setQty(e.target.value)}
                            className="border border-[#DBD9D9] rounded px-3 py-2 text-sm font-semibold text-[#333] bg-[#F5F3F3] focus:outline-none focus:border-[#FB7506]"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Notes</label>
                        <textarea
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="border border-[#DBD9D9] rounded px-3 py-2 text-sm text-[#333] bg-[#F5F3F3] focus:outline-none focus:border-[#FB7506] resize-none"
                            placeholder="Optional notes..."
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-[#F5F3F3] border-t border-[#DBD9D9] px-4 py-3 flex items-center justify-end gap-2 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 rounded border border-[#DBD9D9] text-xs font-black uppercase text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || loadingR}
                        className={cn(
                            "px-4 py-1.5 rounded text-xs font-black uppercase text-white transition-colors flex items-center gap-1.5",
                            saving || loadingR
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-[#374151] hover:bg-[#4B5563]"
                        )}
                    >
                        {saving && <Loader2 size={11} className="animate-spin" />}
                        {mode === "add" ? "Add" : "Save"}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
