"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { XCircle, Save, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

const fmt = (v: any) => parseFloat(v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const qcPost = (url: string, body: any) =>
    fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        .then(r => r.json());

interface BoxTransferModalProps {
    mode:       "insert" | "edit";
    lot:        any;     // packing box row (insert) or stock row (edit)
    onClose:    () => void;
    onSaved:    () => void;
}

export default function BoxTransferModal({ mode, lot, onClose, onSaved }: BoxTransferModalProps) {
    const isEdit = mode === "edit";
    const [form,   setForm]   = useState({
        warehouseUq: lot?.whouse_uq ?? "",
        priceXU:     Number(lot?.price_x_u ?? 0),
        boxUnits:    Number(lot?.tunits_x_box ?? lot?.total_units ?? 0),
    });
    const [saving, setSaving] = useState(false);
    const [error,  setError]  = useState<string | null>(null);

    const { data: warehouses = [] } = useQuery({
        queryKey: ["qc-warehouses"],
        queryFn: () => qcPost("/api/qc/lookup/warehouses", {}),
        staleTime: 300000,
        select: (d: any) => d.data ?? [],
    });

    const save = async () => {
        if (!form.warehouseUq && !isEdit) { setError("Warehouse is required."); return; }
        setSaving(true); setError(null);
        try {
            let d: any;
            if (isEdit) {
                d = await qcPost("/api/qc/stock/update-transfer", {
                    pkstockUq: lot.unico,
                    priceXU:   form.priceXU,
                    boxUnits:  form.boxUnits,
                });
            } else {
                d = await qcPost("/api/qc/stock/insert-transfer", {
                    pkboxUq:    lot.unico,
                    warehouseUq: form.warehouseUq,
                    priceXU:    form.priceXU,
                    boxUnits:   form.boxUnits,
                });
            }
            if (!d.success) throw new Error(d.error ?? "Error saving transfer.");
            toast.success(isEdit ? "Transfer updated." : "Box sent to warehouse.");
            onSaved();
            onClose();
        } catch (e: any) { setError(e.message); }
        finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col">
                <div className="h-10 bg-[#374151] rounded-t-xl flex items-center justify-between px-4 shrink-0">
                    <span className="text-white text-[11px] font-black uppercase">
                        {isEdit ? "Edit Warehouse Transfer" : "Send to Warehouse"}
                    </span>
                    {error && <span className="text-amber-400 text-[10px] font-bold ml-2 truncate">{error}</span>}
                    <button onClick={onClose}><XCircle size={16} className="text-gray-400 hover:text-white"/></button>
                </div>

                <div className="p-4 space-y-3 text-xs">
                    {/* Lot summary */}
                    <div className="bg-gray-50 rounded p-2 border text-[11px] grid grid-cols-2 gap-1">
                        <div><span className="font-black text-gray-400">Description: </span><span className="font-bold">{lot?.description?.substring(0,30)}</span></div>
                        <div><span className="font-black text-gray-400">AWBCode: </span><span className="font-bold text-[#FB7506]">{lot?.awbcode}</span></div>
                        <div><span className="font-black text-gray-400">Lote: </span><span>{lot?.lote}</span></div>
                        <div><span className="font-black text-gray-400">Grower: </span><span>{lot?.grower}</span></div>
                        <div><span className="font-black text-gray-400">Stock: </span><span className="font-bold">{lot?.stock ?? lot?.wh_stock}</span></div>
                        <div><span className="font-black text-gray-400">Current Price: </span><span>${fmt(lot?.price_x_u)}</span></div>
                    </div>

                    {!isEdit && (
                        <div className="flex flex-col gap-0.5">
                            <label className="text-[9px] font-black text-gray-400 uppercase">Warehouse *</label>
                            <select value={form.warehouseUq} onChange={e => setForm(p => ({ ...p, warehouseUq: e.target.value }))} className="fos-input py-1">
                                <option value="">— Select Warehouse —</option>
                                {(warehouses as any[]).map((w: any) => (
                                    <option key={w.unico ?? w.whouse_uq} value={w.unico ?? w.whouse_uq}>{w.description ?? w.warehouse}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="flex flex-col gap-0.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase">Price x Unit</label>
                        <input type="number" step="0.01" value={form.priceXU} onChange={e => setForm(p => ({ ...p, priceXU: parseFloat(e.target.value) || 0 }))} className="fos-input py-1"/>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase">Units x Box</label>
                        <input type="number" value={form.boxUnits} onChange={e => setForm(p => ({ ...p, boxUnits: parseInt(e.target.value) || 0 }))} className="fos-input py-1"/>
                    </div>

                    {!isEdit && (
                        <div className="text-[10px] text-amber-600 bg-amber-50 rounded p-2 border border-amber-200">
                            ⚠ sp_flower_packing_stock_insert is not available in the current database. Transfer insert will fail until this SP is added.
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2 px-4 py-3 bg-gray-50 border-t rounded-b-xl shrink-0">
                    <button onClick={onClose} className="px-4 py-2 rounded border text-sm font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
                    <button onClick={save} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded bg-[#FB7506] hover:bg-orange-600 text-white text-sm font-black disabled:opacity-50">
                        {saving ? <RefreshCcw size={13} className="animate-spin"/> : <Save size={13}/>}{saving ? "Saving..." : "OK"}
                    </button>
                </div>
            </div>
        </div>
    );
}
