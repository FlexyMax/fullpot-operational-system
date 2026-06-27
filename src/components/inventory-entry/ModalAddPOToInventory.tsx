"use client";
import { useState } from "react";
import { X, ShoppingCart, RefreshCcw, Check, Search } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const t = (v: any) => String(v ?? "").trim();
const norm = (rows: any[]) => rows.map(r => { const n: any = {}; for (const [k, v] of Object.entries(r)) n[k.toUpperCase()] = v; return n; });

interface Props {
    open: boolean;
    onClose: () => void;
    poLine: any;
    defaultDate: string;
    userId: string;
    onSuccess: () => void;
}

// VFP didn't surface this as a single button on the PO page — sp_flower_inventory_insert_from_porder
// (verified live) needs an existing destination packing's unico, not just an AWB code, so this lets
// the user find that packing the same way every other "attach to a packing" action in this app does:
// AWB code + date, same lookup ModalBoxPO/the AWB's Packings tab already use.
export function ModalAddPOToInventory({ open, onClose, poLine, defaultDate, userId, onSuccess }: Props) {
    const [awbCode,   setAwbCode]   = useState("");
    const [date,      setDate]      = useState(defaultDate);
    const [packings,  setPackings]  = useState<any[]>([]);
    const [loading,   setLoading]   = useState(false);
    const [selPack,   setSelPack]   = useState<any>(null);
    const [qtyShip,   setQtyShip]   = useState(0);
    const [saving,    setSaving]    = useState(false);

    if (!open) return null;

    const doFind = async () => {
        if (!awbCode.trim()) { toast.error("Enter an AWB code first."); return; }
        setLoading(true);
        setSelPack(null);
        try {
            const res = await fetch(`/api/inventory-entry/packing-x-awb?awb=${encodeURIComponent(awbCode.trim())}&date=${date}`);
            const d = await res.json();
            setPackings(norm(Array.isArray(d) ? d : []));
        } catch {
            setPackings([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!selPack) { toast.error("Select a destination packing first."); return; }
        if (!qtyShip) { toast.error("Enter qty to ship."); return; }
        setSaving(true);
        try {
            const res = await fetch("/api/inventory-entry/po-entries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    porder_uq:  t(poLine?.PORDER_UQ ?? poLine?.UNICO ?? ""),
                    packing_uq: t(selPack.PACK_UQ ?? selPack.UNICO ?? ""),
                    qty_ship:   qtyShip,
                    user_uq:    userId,
                }),
            });
            const d = await res.json();
            if (!d.success) throw new Error(d.error || "Insert from PO failed");
            toast.success("P.O. added to inventory.");
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
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden" style={{ maxHeight: "85vh" }} onClick={e => e.stopPropagation()}>
                <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 rounded-t-lg shrink-0">
                    <div className="flex items-center gap-2">
                        <ShoppingCart size={16} className="text-[#FB7506]" />
                        <span className="font-black text-[10px] text-white uppercase tracking-widest">Add P.O. to Inventory</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={16} /></button>
                </div>

                <div className="p-3 border-b bg-gray-50 shrink-0 text-xs text-gray-600 space-y-0.5">
                    <div>P.Order: <span className="font-bold text-gray-800">{t(poLine?.PORDER ?? "")}</span> &nbsp; Farm: <span className="font-bold text-gray-800">{t(poLine?.FARM ?? "")}</span></div>
                    <div>Product: <span className="font-bold text-gray-800">{t(poLine?.DESCRIPTION ?? "")}</span></div>
                    <div>Pending: <span className="font-bold text-[#FB7506]">{t(poLine?.QTY_DIFF ?? 0)}</span> of {t(poLine?.QTY_PORDER ?? 0)} ordered</div>
                </div>

                <div className="p-3 border-b shrink-0 flex gap-2 items-end">
                    <div className="flex flex-col gap-0.5 w-28">
                        <label className={fLabel}>Date</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className={fInput} />
                    </div>
                    <div className="flex flex-col gap-0.5 flex-1">
                        <label className={fLabel}>AWB Code (destination)</label>
                        <input value={awbCode} onChange={e => setAwbCode(e.target.value)} onKeyDown={e => e.key === "Enter" && doFind()}
                            className={fInput} placeholder="11-character AWB code..." />
                    </div>
                    <button onClick={doFind} className="flex items-center gap-1 px-3 h-7 bg-gray-700 hover:bg-gray-800 text-white text-xs font-bold rounded shrink-0 transition-colors">
                        {loading ? <RefreshCcw size={11} className="animate-spin" /> : <Search size={11} />}
                        Find
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0">
                    <table className="w-full text-xs">
                        <thead className="bg-gray-100 sticky top-0">
                            <tr>
                                {["Grower", "Packing No.", "Invoice", "Status"].map(h => (
                                    <th key={h} className="p-2 text-left font-bold text-gray-700 border-r border-gray-200 whitespace-nowrap last:border-r-0">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {packings.length === 0 ? (
                                <tr><td colSpan={4} className="p-4 text-center text-gray-400 italic">{loading ? "" : "Find a destination packing by AWB + date"}</td></tr>
                            ) : packings.map((row: any, i: number) => {
                                const uq  = t(row.PACK_UQ ?? row.UNICO ?? "");
                                const sel = selPack && t(selPack.PACK_UQ ?? selPack.UNICO ?? "") === uq;
                                return (
                                    <tr key={i} onClick={() => setSelPack(row)}
                                        className={cn("border-b border-gray-100 cursor-pointer transition-colors", sel ? "bg-blue-100 ring-1 ring-inset ring-blue-300" : "odd:bg-white even:bg-gray-50 hover:bg-blue-50")}>
                                        <td className="p-2 border-r border-gray-100 max-w-[140px] truncate">{t(row.GROWER ?? "")}</td>
                                        <td className="p-2 border-r border-gray-100">{t(row.PACKING_NO ?? "")}</td>
                                        <td className="p-2 border-r border-gray-100">{t(row.INVOICE_NO ?? "")}</td>
                                        <td className="p-2">{t(row.STATUS ?? "")}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {selPack && (
                    <div className="p-3 border-t bg-blue-50 shrink-0 flex items-center gap-3">
                        <span className="text-xs text-blue-700 font-bold truncate flex-1">
                            Destination: {t(selPack.GROWER ?? "")} — {t(selPack.PACKING_NO ?? "")}
                        </span>
                        <label className={fLabel + " whitespace-nowrap"}>Qty to Ship:</label>
                        <input type="number" min={1} value={qtyShip || ""} onChange={e => setQtyShip(parseInt(e.target.value) || 0)}
                            className={fInput + " w-20 text-right"} />
                    </div>
                )}

                <div className="flex justify-end gap-2 px-4 py-3 bg-gray-50 border-t shrink-0">
                    <button onClick={onClose} className="px-4 py-2 rounded border border-gray-200 text-xs font-black uppercase text-gray-600 hover:bg-gray-100 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving || !selPack || !qtyShip}
                        className="flex items-center gap-2 px-5 py-2 rounded bg-[#FB7506] hover:bg-orange-600 disabled:opacity-40 text-white text-xs font-black uppercase tracking-wider transition-all">
                        {saving ? <RefreshCcw size={12} className="animate-spin" /> : <Check size={12} />}
                        {saving ? "Adding..." : "Add P.O"}
                    </button>
                </div>
            </div>
        </div>
    );
}
