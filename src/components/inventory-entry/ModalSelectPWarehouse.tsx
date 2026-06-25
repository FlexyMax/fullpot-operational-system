"use client";
import { useState } from "react";
import { X, Warehouse, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const t = (v: any) => String(v ?? "").trim();

interface Props {
    open: boolean;
    onClose: () => void;
    warehouses: any[];
    onSelect: (whouse: any) => void;
    title?: string;
}

export function ModalSelectPWarehouse({ open, onClose, warehouses, onSelect, title = "Select Physical Warehouse" }: Props) {
    const [search, setSearch] = useState("");

    if (!open) return null;

    const filtered = warehouses.filter(w => {
        const name = t(w.WAREHOUSE ?? w.WP_NAME ?? "").toLowerCase();
        const code = t(w.UNICO ?? "").toLowerCase();
        const q = search.toLowerCase();
        return !q || name.includes(q) || code.includes(q);
    });

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md flex flex-col overflow-hidden" style={{ maxHeight: "70vh" }} onClick={e => e.stopPropagation()}>
                <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 rounded-t-lg shrink-0">
                    <div className="flex items-center gap-2">
                        <Warehouse size={16} className="text-[#FB7506]" />
                        <span className="font-black text-[10px] text-white uppercase tracking-widest">{title}</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={16} /></button>
                </div>
                <div className="p-3 border-b shrink-0">
                    <div className="relative">
                        <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="fos-input h-7 text-xs pl-6 w-full"
                            placeholder="Search warehouses..."
                            autoFocus
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-xs">
                        <thead className="bg-gray-100 sticky top-0">
                            <tr>
                                <th className="p-2 text-left font-bold text-gray-700 border-r border-gray-200">Code</th>
                                <th className="p-2 text-left font-bold text-gray-700">Warehouse</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={2} className="p-4 text-center text-gray-400 italic">No warehouses found</td></tr>
                            ) : filtered.map((w: any, i: number) => (
                                <tr key={i}
                                    onClick={() => { onSelect(w); onClose(); }}
                                    className="border-b border-gray-100 cursor-pointer odd:bg-white even:bg-gray-50 hover:bg-blue-50 transition-colors">
                                    <td className="p-2 border-r border-gray-100 font-mono text-gray-500">{t(w.UNICO)}</td>
                                    <td className="p-2 font-semibold text-gray-800">{t(w.WAREHOUSE ?? w.WP_NAME ?? w.UNICO)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="px-4 py-2 bg-gray-50 border-t shrink-0">
                    <span className="text-[10px] text-gray-400">{filtered.length} warehouses</span>
                </div>
            </div>
        </div>
    );
}
