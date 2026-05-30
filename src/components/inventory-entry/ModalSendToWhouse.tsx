"use client";
import { useState, useEffect } from "react";
import { X, ArrowRight, RefreshCcw, Check, Warehouse } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const t = (v: any) => String(v ?? "").trim();
const norm = (rows: any[]) => rows.map(r => { const n: any = {}; for (const [k, v] of Object.entries(r)) n[k.toUpperCase()] = v; return n; });

interface Props {
    open: boolean;
    onClose: () => void;
    packUq: string;
    warehouses: any[];
    userId: string;
    onSuccess: () => void;
}

export function ModalSendToWhouse({ open, onClose, packUq, warehouses, userId, onSuccess }: Props) {
    const [whouseUq, setWhouseUq] = useState("");
    const [movable, setMovable] = useState<any[]>([]);
    const [loadingMovable, setLoadingMovable] = useState(false);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (!open || !packUq) return;
        setLoadingMovable(true);
        fetch(`/api/inventory-entry/packings/${packUq}/to-whouse`)
            .then(r => r.json())
            .then(d => setMovable(norm(Array.isArray(d) ? d : [])))
            .catch(() => setMovable([]))
            .finally(() => setLoadingMovable(false));
    }, [open, packUq]);

    if (!open) return null;

    const filteredWH = warehouses.filter(w => {
        const name = t(w.WHOUSE ?? w.DESCRIPTION ?? w.WPHYSICAL ?? w.NAME ?? "").toLowerCase();
        const q = search.toLowerCase();
        return !q || name.includes(q) || t(w.UNICO ?? "").toLowerCase().includes(q);
    });

    const handleSave = async () => {
        if (!t(whouseUq)) { toast.error("Select a warehouse."); return; }
        setSaving(true);
        try {
            const res = await fetch(`/api/inventory-entry/packings/${packUq}/to-whouse`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ whouse_uq: whouseUq, user_uq: userId }),
            });
            const d = await res.json();
            if (!d.success) throw new Error(d.error || "Send to warehouse failed");
            toast.success("Packing sent to warehouse.");
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
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-xl flex flex-col overflow-hidden" style={{ maxHeight: "80vh" }} onClick={e => e.stopPropagation()}>
                <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 rounded-t-lg shrink-0">
                    <div className="flex items-center gap-2">
                        <Warehouse size={16} className="text-[#FB7506]" />
                        <span className="font-black text-[10px] text-white uppercase tracking-widest">Send to Warehouse</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={16} /></button>
                </div>
                <div className="flex flex-1 overflow-hidden min-h-0">
                    {/* Left: available packings */}
                    <div className="w-1/2 border-r flex flex-col overflow-hidden">
                        <div className="px-3 py-2 border-b shrink-0">
                            <span className="text-[10px] font-black text-gray-500 uppercase">Available Packings</span>
                            {loadingMovable && <RefreshCcw size={10} className="inline ml-2 animate-spin text-gray-400" />}
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <table className="w-full text-xs">
                                <thead className="bg-gray-100 sticky top-0">
                                    <tr>
                                        <th className="p-2 text-left font-bold text-gray-700 border-r border-gray-200">Packing</th>
                                        <th className="p-2 text-left font-bold text-gray-700">Grower</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {movable.length === 0 ? (
                                        <tr><td colSpan={2} className="p-3 text-center text-gray-400 italic text-[10px]">{loadingMovable ? "" : "No packings available"}</td></tr>
                                    ) : movable.map((row: any, i: number) => (
                                        <tr key={i} className="border-b border-gray-100 odd:bg-white even:bg-gray-50">
                                            <td className="p-2 border-r border-gray-100 font-mono">{t(row.PACKING_NO ?? row.PACK_NO ?? row.UNICO)}</td>
                                            <td className="p-2 truncate max-w-[100px]">{t(row.GROWER ?? "")}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {/* Right: warehouse selector */}
                    <div className="w-1/2 flex flex-col overflow-hidden">
                        <div className="p-3 border-b shrink-0 space-y-2">
                            <span className="text-[10px] font-black text-gray-500 uppercase">Target Warehouse</span>
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className={fInput + " w-full"}
                                placeholder="Search..."
                            />
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <table className="w-full text-xs">
                                <tbody>
                                    {filteredWH.map((w: any, i: number) => {
                                        const uq = t(w.UNICO);
                                        const sel = whouseUq === uq;
                                        return (
                                            <tr key={i}
                                                onClick={() => setWhouseUq(uq)}
                                                className={cn("border-b border-gray-100 cursor-pointer transition-colors", sel ? "bg-blue-100 ring-1 ring-inset ring-blue-300" : "odd:bg-white even:bg-gray-50 hover:bg-blue-50")}>
                                                <td className={cn("p-2 font-semibold", sel ? "text-blue-700" : "text-gray-800")}>
                                                    {t(w.WHOUSE ?? w.DESCRIPTION ?? w.WPHYSICAL ?? w.NAME ?? uq)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-2 px-4 py-3 bg-gray-50 border-t shrink-0">
                    <span className="flex-1 text-[10px] text-gray-500 self-center">
                        {whouseUq ? `Selected: ${t(warehouses.find(w => t(w.UNICO) === whouseUq)?.WHOUSE ?? whouseUq)}` : "No warehouse selected"}
                    </span>
                    <button onClick={onClose} className="px-4 py-2 rounded border border-gray-200 text-xs font-black uppercase text-gray-600 hover:bg-gray-100 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving || !whouseUq}
                        className="flex items-center gap-2 px-5 py-2 rounded bg-blue-700 hover:bg-blue-800 disabled:opacity-40 text-white text-xs font-black uppercase tracking-wider transition-all">
                        {saving ? <RefreshCcw size={12} className="animate-spin" /> : <ArrowRight size={12} />}
                        {saving ? "Sending..." : "Send to WH"}
                    </button>
                </div>
            </div>
        </div>
    );
}
