"use client";
import { useState, useEffect } from "react";
import { X, ClipboardList, RefreshCcw, Check, Search } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const t = (v: any) => String(v ?? "").trim();
const norm = (rows: any[]) => rows.map(r => { const n: any = {}; for (const [k, v] of Object.entries(r)) n[k.toUpperCase()] = v; return n; });
const fmt2 = (v: any) => parseFloat(v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface Props {
    open: boolean;
    onClose: () => void;
    packUq: string;
    ldship_date: string;
    userId: string;
    onSuccess: () => void;
}

export function ModalBoxPO({ open, onClose, packUq, ldship_date, userId, onSuccess }: Props) {
    const [poSearch,   setPoSearch]   = useState("");
    const [poRows,     setPoRows]     = useState<any[]>([]);
    const [loading,    setLoading]    = useState(false);
    const [selPO,      setSelPO]      = useState<any>(null);
    const [qtyShip,    setQtyShip]    = useState(0);
    const [saving,     setSaving]     = useState(false);

    const doSearch = async () => {
        if (!poSearch.trim()) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/inventory-entry/purchase-orders?ship_date=${ldship_date}&grower_uq=`);
            const d = await res.json();
            const rows = norm((d.summary ?? d.byGrower ?? d) as any[]);
            setPoRows(rows.filter(r => {
                const s = poSearch.toLowerCase();
                return t(r.PORDER_NO ?? r.PORDER ?? "").toLowerCase().includes(s) ||
                       t(r.GROWER ?? "").toLowerCase().includes(s) ||
                       t(r.DESCRIPTION ?? "").toLowerCase().includes(s);
            }));
        } catch {
            setPoRows([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!open) { setSelPO(null); setPoRows([]); setPoSearch(""); }
    }, [open]);

    if (!open) return null;

    const handleSave = async () => {
        if (!selPO) { toast.error("Select a PO first."); return; }
        if (!qtyShip) { toast.error("Enter qty to ship."); return; }
        setSaving(true);
        try {
            const res = await fetch("/api/inventory-entry/po-entries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    porder_uq:  t(selPO.UNICO ?? selPO.PORDER_UQ ?? ""),
                    packing_uq: packUq,
                    qty_ship:   qtyShip,
                    user_uq:    userId,
                }),
            });
            const d = await res.json();
            if (!d.success) throw new Error(d.error || "Insert from PO failed");
            toast.success("Box inserted from PO.");
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
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden" style={{ maxHeight: "80vh" }} onClick={e => e.stopPropagation()}>
                <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 rounded-t-lg shrink-0">
                    <div className="flex items-center gap-2">
                        <ClipboardList size={16} className="text-[#FB7506]" />
                        <span className="font-black text-[10px] text-white uppercase tracking-widest">Add Box from PO</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={16} /></button>
                </div>
                <div className="p-3 border-b shrink-0 flex gap-2">
                    <div className="relative flex-1">
                        <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            value={poSearch}
                            onChange={e => setPoSearch(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && doSearch()}
                            className={fInput + " pl-6 w-full"}
                            placeholder="Search PO by number, grower or product..."
                            autoFocus
                        />
                    </div>
                    <button onClick={doSearch} className="px-3 py-1 bg-gray-700 text-white text-xs font-bold rounded hover:bg-gray-800 flex items-center gap-1 shrink-0">
                        {loading ? <RefreshCcw size={11} className="animate-spin" /> : <Search size={11} />}
                        Search
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto min-h-0">
                    <table className="w-full text-xs">
                        <thead className="bg-gray-100 sticky top-0">
                            <tr>
                                {["PO #","Grower","Description","Ship Date","Qty Ord","Qty Pend","Price"].map(h => (
                                    <th key={h} className="p-2 text-left font-bold text-gray-700 border-r border-gray-200 whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {poRows.length === 0 ? (
                                <tr><td colSpan={7} className="p-4 text-center text-gray-400 italic">{loading ? "" : "Search POs above"}</td></tr>
                            ) : poRows.map((row: any, i: number) => {
                                const uq  = t(row.UNICO ?? row.PORDER_UQ ?? "");
                                const sel = selPO && (t(selPO.UNICO ?? selPO.PORDER_UQ ?? "") === uq);
                                return (
                                    <tr key={i} onClick={() => setSelPO(row)}
                                        className={cn("border-b border-gray-100 cursor-pointer transition-colors", sel ? "bg-blue-100 ring-1 ring-inset ring-blue-300" : "odd:bg-white even:bg-gray-50 hover:bg-blue-50")}>
                                        <td className={cn("p-2 border-r border-gray-100 font-mono", sel && "text-blue-700")}>{t(row.PORDER_NO ?? row.PORDER ?? uq)}</td>
                                        <td className="p-2 border-r border-gray-100 max-w-[100px] truncate">{t(row.GROWER ?? "")}</td>
                                        <td className="p-2 border-r border-gray-100 max-w-[120px] truncate">{t(row.DESCRIPTION ?? row.PRODUCT ?? "")}</td>
                                        <td className="p-2 border-r border-gray-100">{t(row.SHIP_DATE ?? row.SHIPDATE ?? "").substring(0, 10)}</td>
                                        <td className="p-2 border-r border-gray-100 text-right">{t(row.QTY_ORD ?? row.ORDERED ?? "")}</td>
                                        <td className="p-2 border-r border-gray-100 text-right">{t(row.QTY_PEND ?? row.PENDING ?? "")}</td>
                                        <td className="p-2 text-right">{fmt2(row.PRICE ?? 0)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {selPO && (
                    <div className="p-3 border-t bg-blue-50 shrink-0 flex items-center gap-3">
                        <span className="text-xs text-blue-700 font-bold truncate flex-1">
                            Selected: {t(selPO.PORDER_NO ?? selPO.PORDER ?? "")} — {t(selPO.DESCRIPTION ?? selPO.GROWER ?? "")}
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
                    <button onClick={handleSave} disabled={saving || !selPO || !qtyShip}
                        className="flex items-center gap-2 px-5 py-2 rounded bg-[#FB7506] hover:bg-orange-600 disabled:opacity-40 text-white text-xs font-black uppercase tracking-wider transition-all">
                        {saving ? <RefreshCcw size={12} className="animate-spin" /> : <Check size={12} />}
                        {saving ? "Adding..." : "Add from PO"}
                    </button>
                </div>
            </div>
        </div>
    );
}
