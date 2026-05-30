"use client";
import { useState } from "react";
import { X, Trash2, RefreshCcw, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const t = (v: any) => String(v ?? "").trim();
const fmt2 = (v: any) => parseFloat(v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface Props {
    open: boolean;
    onClose: () => void;
    packUq: string;
    packingDetails: any[];
    userId: string;
    onSuccess: () => void;
}

export function ModalDeletePackingDetails({ open, onClose, packUq, packingDetails, userId, onSuccess }: Props) {
    const [selected, setSelected]   = useState<Set<string>>(new Set());
    const [deleting, setDeleting]   = useState(false);
    const [confirmed, setConfirmed] = useState(false);

    if (!open) return null;

    const toggleAll = () => {
        if (selected.size === packingDetails.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(packingDetails.map((r: any) => t(r.UNICO))));
        }
    };

    const toggle = (unico: string) => {
        setSelected(prev => {
            const s = new Set(prev);
            s.has(unico) ? s.delete(unico) : s.add(unico);
            return s;
        });
    };

    const handleDelete = async () => {
        if (selected.size === 0) { toast.error("Select at least one box to delete."); return; }
        if (!confirmed) { setConfirmed(true); return; }
        setDeleting(true);
        const errors: string[] = [];
        for (const unico of selected) {
            try {
                const res = await fetch(`/api/inventory-entry/boxes/${unico}`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ user_uq: userId }),
                });
                const d = await res.json();
                if (!d.success) errors.push(`${unico}: ${d.error || "failed"}`);
            } catch (e: any) {
                errors.push(`${unico}: ${e.message}`);
            }
        }
        setDeleting(false);
        if (errors.length > 0) {
            toast.error(`${errors.length} deletion(s) failed.`);
        } else {
            toast.success(`${selected.size} box(es) deleted.`);
            onSuccess();
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden" style={{ maxHeight: "80vh" }} onClick={e => e.stopPropagation()}>
                <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 rounded-t-lg shrink-0">
                    <div className="flex items-center gap-2">
                        <Trash2 size={16} className="text-red-400" />
                        <span className="font-black text-[10px] text-white uppercase tracking-widest">Delete Packing Details</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={16} /></button>
                </div>
                <div className="flex-1 overflow-y-auto min-h-0">
                    <table className="w-full text-xs">
                        <thead className="bg-gray-100 sticky top-0">
                            <tr>
                                <th className="p-2 border-r border-gray-200">
                                    <input type="checkbox" checked={selected.size === packingDetails.length && packingDetails.length > 0} onChange={toggleAll} className="accent-red-500" />
                                </th>
                                {["Product","Case","Qty","Units","Price","T.Price","Lote","Customer"].map(h => (
                                    <th key={h} className="p-2 text-left font-bold text-gray-700 border-r border-gray-200 whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {packingDetails.length === 0 ? (
                                <tr><td colSpan={9} className="p-4 text-center text-gray-400 italic">No boxes in this packing</td></tr>
                            ) : packingDetails.map((row: any, i: number) => {
                                const unico = t(row.UNICO);
                                const sel   = selected.has(unico);
                                return (
                                    <tr key={i}
                                        onClick={() => toggle(unico)}
                                        className={cn("border-b border-gray-100 cursor-pointer transition-colors", sel ? "bg-red-50 ring-1 ring-inset ring-red-300" : "odd:bg-white even:bg-gray-50 hover:bg-red-50")}>
                                        <td className="p-2 border-r border-gray-100 text-center" onClick={e => { e.stopPropagation(); toggle(unico); }}>
                                            <input type="checkbox" checked={sel} onChange={() => toggle(unico)} className="accent-red-500" />
                                        </td>
                                        <td className="p-2 border-r border-gray-100 max-w-[120px] truncate">{t(row.DESCRIPTION ?? row.PRODUCT ?? "")}</td>
                                        <td className="p-2 border-r border-gray-100">{t(row.CASE ?? "")}</td>
                                        <td className="p-2 border-r border-gray-100 text-right">{t(row.BOX_QTY ?? row.BOX_QTY ?? "")}</td>
                                        <td className="p-2 border-r border-gray-100 text-right">{t(row.TOTAL_UNITS ?? "")}</td>
                                        <td className="p-2 border-r border-gray-100 text-right">{fmt2(row.PRICE_X_U ?? row.PRICE ?? 0)}</td>
                                        <td className="p-2 border-r border-gray-100 text-right font-bold">{fmt2(row.T_PRICE ?? 0)}</td>
                                        <td className="p-2 border-r border-gray-100 text-right">{t(row.LOTE ?? "")}</td>
                                        <td className="p-2 max-w-[100px] truncate">{t(row.CUSTOMER ?? row.CUST ?? "")}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {confirmed && selected.size > 0 && (
                    <div className="px-4 py-2 bg-red-50 border-t border-red-200 shrink-0 flex items-center gap-2">
                        <AlertCircle size={14} className="text-red-500 shrink-0" />
                        <span className="text-xs text-red-700 font-bold">
                            Confirm: permanently delete {selected.size} box(es)? Click again to confirm.
                        </span>
                    </div>
                )}
                <div className="flex items-center justify-between gap-2 px-4 py-3 bg-gray-50 border-t shrink-0">
                    <span className="text-[10px] text-gray-400">{selected.size} of {packingDetails.length} selected</span>
                    <div className="flex gap-2">
                        <button onClick={() => { onClose(); setConfirmed(false); setSelected(new Set()); }}
                            className="px-4 py-2 rounded border border-gray-200 text-xs font-black uppercase text-gray-600 hover:bg-gray-100 transition-colors">
                            Cancel
                        </button>
                        <button onClick={handleDelete} disabled={deleting || selected.size === 0}
                            className="flex items-center gap-2 px-5 py-2 rounded bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-xs font-black uppercase tracking-wider transition-all">
                            {deleting ? <RefreshCcw size={12} className="animate-spin" /> : <Trash2 size={12} />}
                            {deleting ? "Deleting..." : confirmed ? "Confirm Delete" : "Delete Selected"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
