"use client";

import { useState } from "react";
import { X, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

const t = (v: any) => String(v ?? "").trim();

interface Props {
    soUnico:      string;
    orderNo:      string | number;
    salesmen:     any[];
    currentUq:    string;
    onClose:      () => void;
    onSaved:      () => void;
}

const inp = "w-full border border-gray-300 rounded px-2 py-1.5 text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-400";

export function ChangeSalesmanModal({ soUnico, orderNo, salesmen, currentUq, onClose, onSaved }: Props) {
    const [salesmanUq, setSalesmanUq] = useState(currentUq);
    const [saving,     setSaving]     = useState(false);

    const handleSave = async () => {
        if (!salesmanUq) { toast.error("Please select a salesman"); return; }
        setSaving(true);
        try {
            const r = await fetch("/api/standing-orders/change-salesman", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ so_uq: soUnico, salesman_uq: salesmanUq }),
            });
            const j = await r.json();
            if (!r.ok || !j.success) throw new Error(j.error || "Failed");
            toast.success("Salesman updated");
            onSaved();
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm flex flex-col overflow-hidden">
                <div className="h-10 bg-[#374151] flex items-center justify-between px-4 shrink-0 rounded-t-lg">
                    <span className="font-black text-[11px] text-white uppercase tracking-widest">
                        Change Salesman — Order #{orderNo}
                    </span>
                    <button onClick={onClose} className="text-white/60 hover:text-white"><X size={14} /></button>
                </div>
                <div className="p-4 space-y-3">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Salesman</label>
                        <select value={salesmanUq} onChange={e => setSalesmanUq(e.target.value)} className={inp}>
                            <option value="">— select —</option>
                            {salesmen.filter(s => t(s.unico) !== "%").map((s, i) => (
                                <option key={i} value={t(s.unico)}>{t(s.salesman_name)}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="h-11 bg-gray-50 border-t border-gray-200 flex items-center justify-end px-4 gap-2 shrink-0 rounded-b-lg">
                    <button onClick={onClose}
                        className="px-3 py-1.5 text-[11px] font-bold text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50">
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving}
                        className="px-4 py-1.5 text-[11px] font-black text-white bg-[#FB7506] hover:bg-orange-500 rounded disabled:opacity-40 flex items-center gap-1">
                        {saving ? <Loader2 size={10} className="animate-spin" /> : <Check size={10} />}
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
