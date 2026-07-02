"use client";
import { useState } from "react";
import { X, Warehouse } from "lucide-react";
import PanelGrid from "@/components/ui/PanelGrid";

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

                <PanelGrid
                    title="Warehouses"
                    icon={Warehouse}
                    recordCount={filtered.length}
                    searchValue={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search warehouses..."
                    className="flex-1 min-h-0 rounded-none border-x-0 border-b-0"
                >
                    <table className="w-full text-xs">
                        <thead className="bg-gray-100 sticky top-0">
                            <tr>
                                <th className="p-2 text-left font-bold text-gray-700 border-r border-gray-200 w-20">Code</th>
                                <th className="p-2 text-left font-bold text-gray-700">Warehouse</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={2} className="p-4 text-center text-gray-400 italic">No warehouses found</td></tr>
                            ) : filtered.map((w: any, i: number) => (
                                <tr key={i}
                                    onClick={() => { onSelect(w); onClose(); }}
                                    className="border-b border-gray-100 cursor-pointer odd:bg-white even:bg-gray-50 hover:!bg-[#FB7506]/10 transition-colors">
                                    <td className="p-2 border-r border-gray-100 font-mono text-gray-500">{t(w.UNICO)}</td>
                                    <td className="p-2 font-semibold text-gray-800">{t(w.WAREHOUSE ?? w.WP_NAME ?? w.UNICO)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </PanelGrid>

                <div className="px-4 py-2 bg-gray-50 border-t shrink-0 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 rounded border border-gray-200 text-xs font-black uppercase text-gray-600 hover:bg-gray-100 transition-colors">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
