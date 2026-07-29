"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LogOut, RefreshCcw, CheckSquare, Search, ChevronDown, Pencil } from "lucide-react";
import { toast } from "sonner";
const EMPTY_ARR: any[] = [];

const qcPost = (url: string, body: any) =>
    fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        .then(r => r.json());

interface BoxTransferModalProps {
    mode:    "insert" | "edit";
    lot:     any;     // packing box row (insert) or stock row (edit)
    onClose: () => void;
    onSaved: () => void;
}

export default function BoxTransferModal({ mode, lot, onClose, onSaved }: BoxTransferModalProps) {
    const isEdit = mode === "edit";

    // ── Insert state ──────────────────────────────────────────────────────────
    const [warehouseUq,     setWarehouseUq]     = useState("");
    const [warehouseName,   setWarehouseName]   = useState("");
    const [warehouseOpen,   setWarehouseOpen]   = useState(false);
    const [warehouseSearch, setWarehouseSearch] = useState("");
    const [boxQty,          setBoxQty]          = useState<number>(
        Number(lot?.qty_transit ?? lot?.stock ?? 0)
    );

    // ── Edit state ────────────────────────────────────────────────────────────
    const [priceXU,  setPriceXU]  = useState(Number(lot?.price_x_u  ?? 0));
    const [boxUnits, setBoxUnits] = useState(Number(lot?.tunits_x_box ?? lot?.total_units ?? 0));

    const [saving, setSaving] = useState(false);
    const [error,  setError]  = useState<string | null>(null);

    const { data: warehouses = EMPTY_ARR } = useQuery({
        queryKey: ["qc-warehouses"],
        queryFn:  () => qcPost("/api/qc/lookup/warehouses", {}),
        staleTime: 300000,
        select: (d: any) => d.data ?? [],
    });

    const filtered = (warehouses as any[]).filter((w: any) =>
        (w.description ?? w.warehouse ?? "").toUpperCase().includes(warehouseSearch.toUpperCase())
    );

    const save = async () => {
        if (!isEdit && !warehouseUq) { setError("Warehouse is required."); return; }
        setSaving(true); setError(null);
        try {
            let d: any;
            if (isEdit) {
                d = await qcPost("/api/qc/stock/update-transfer", {
                    pkstockUq: lot.unico,
                    priceXU,
                    boxUnits,
                });
            } else {
                d = await qcPost("/api/qc/stock/insert-transfer", {
                    pkboxUq:     lot.unico,
                    warehouseUq,
                    qtyIn:       boxQty,
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
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm flex flex-col">

                {/* ── Header ── */}
                <div className="h-10 bg-[#374151] rounded-t-xl flex items-center justify-between px-4 shrink-0">
                    <span className="text-white text-[12px] font-black">
                        {isEdit ? "Edit Warehouse Transfer" : "Box Transfer"}
                    </span>
                    <button onClick={onClose} title="Close">
                        <LogOut size={16} className="text-gray-300 hover:text-white transition-colors"/>
                    </button>
                </div>

                {/* ── Error bar ── */}
                {error && (
                    <div className="px-4 pt-2 text-[11px] text-red-600 font-bold">{error}</div>
                )}

                {/* ── Body ── */}
                <div className="p-4 flex flex-col gap-4">
                    {!isEdit ? (
                        <>
                            {/* Warehouse with searchable dropdown */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[12px] font-semibold text-gray-700">Warehouse</label>
                                <div className="relative">
                                    <button type="button"
                                        onClick={() => { setWarehouseOpen(o => !o); setWarehouseSearch(""); }}
                                        className={`w-full flex items-center justify-between border rounded-lg px-3 py-2.5 text-[13px] text-left bg-white transition-colors ${!warehouseUq ? "border-red-400 text-gray-400" : "border-gray-300 text-gray-800"}`}>
                                        <span>{warehouseName || "Select option"}</span>
                                        <ChevronDown size={14} className="text-gray-400 shrink-0"/>
                                    </button>

                                    {warehouseOpen && (
                                        <div className="absolute top-full left-0 right-0 z-20 bg-white border border-gray-200 rounded-lg shadow-xl mt-1 overflow-hidden">
                                            {/* Search */}
                                            <div className="p-2 border-b border-gray-100">
                                                <div className="flex items-center gap-2 border border-gray-200 rounded px-2 py-1.5">
                                                    <Search size={12} className="text-gray-400 shrink-0"/>
                                                    <input autoFocus value={warehouseSearch}
                                                        onChange={e => setWarehouseSearch(e.target.value)}
                                                        placeholder="Filter..."
                                                        className="flex-1 text-[12px] outline-none bg-transparent"/>
                                                </div>
                                            </div>
                                            {/* Options */}
                                            <div className="max-h-48 overflow-y-auto">
                                                {filtered.length === 0 ? (
                                                    <div className="px-4 py-3 text-[11px] text-gray-400 italic">No results</div>
                                                ) : filtered.map((w: any) => {
                                                    const uq  = w.unico ?? w.whouse_uq ?? "";
                                                    const lbl = (w.description ?? w.warehouse ?? "").toUpperCase();
                                                    return (
                                                        <button key={uq} type="button"
                                                            onClick={() => { setWarehouseUq(uq); setWarehouseName(lbl); setWarehouseOpen(false); setError(null); }}
                                                            className={`w-full text-left px-4 py-2.5 text-[13px] hover:bg-gray-50 transition-colors ${warehouseUq === uq ? "bg-gray-100 font-semibold" : ""}`}>
                                                            {lbl}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Box Qty */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[12px] font-semibold text-gray-700">Box Qty</label>
                                <input type="number" value={boxQty}
                                    onChange={e => setBoxQty(parseInt(e.target.value) || 0)}
                                    className="border border-gray-300 rounded-lg px-3 py-2.5 text-[13px] outline-none focus:ring-1 focus:ring-green-500"/>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex flex-col gap-1">
                                <label className="text-[12px] font-semibold text-gray-700">Price x Unit</label>
                                <input type="number" step="0.01" value={priceXU}
                                    onChange={e => setPriceXU(parseFloat(e.target.value) || 0)}
                                    className="border border-gray-300 rounded-lg px-3 py-2.5 text-[13px] outline-none focus:ring-1 focus:ring-[#FB7506]"/>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[12px] font-semibold text-gray-700">Units x Box</label>
                                <input type="number" value={boxUnits}
                                    onChange={e => setBoxUnits(parseInt(e.target.value) || 0)}
                                    className="border border-gray-300 rounded-lg px-3 py-2.5 text-[13px] outline-none focus:ring-1 focus:ring-[#FB7506]"/>
                            </div>
                        </>
                    )}
                </div>

                {/* ── Insert / Update button ── */}
                <div className="px-4 pb-4">
                    <button onClick={save} disabled={saving}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg text-white text-[14px] font-black disabled:opacity-50 transition-colors
                            ${isEdit ? "bg-[#FB7506] hover:bg-orange-600" : "bg-green-600 hover:bg-green-700"}`}>
                        {saving
                            ? <RefreshCcw size={15} className="animate-spin"/>
                            : isEdit ? <Pencil size={15}/> : <CheckSquare size={15}/>}
                        {saving ? "Saving…" : isEdit ? "Update" : "Insert"}
                    </button>
                </div>

            </div>
        </div>
    );
}
