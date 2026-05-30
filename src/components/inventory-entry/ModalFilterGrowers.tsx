"use client";
import { useState } from "react";
import { X, Flower2, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const t = (v: any) => String(v ?? "").trim();

interface Props {
    open: boolean;
    onClose: () => void;
    growers: any[];
    currentGrowerUq: string;
    onApply: (growerUq: string) => void;
}

export function ModalFilterGrowers({ open, onClose, growers, currentGrowerUq, onApply }: Props) {
    const [search,   setSearch]   = useState("");
    const [selected, setSelected] = useState(currentGrowerUq);

    if (!open) return null;

    const filtered = growers.filter(g => {
        const name = t(g.GROWER ?? g.DESCRIPTION ?? g.NAME ?? "").toLowerCase();
        const code = t(g.UNICO ?? "").toLowerCase();
        const q = search.toLowerCase();
        return !q || name.includes(q) || code.includes(q);
    });

    const handleApply = () => {
        onApply(selected);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md flex flex-col overflow-hidden" style={{ maxHeight: "75vh" }} onClick={e => e.stopPropagation()}>
                <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 rounded-t-lg shrink-0">
                    <div className="flex items-center gap-2">
                        <Flower2 size={16} className="text-[#FB7506]" />
                        <span className="font-black text-[10px] text-white uppercase tracking-widest">Filter by Grower</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={16} /></button>
                </div>
                <div className="p-3 border-b shrink-0">
                    <div className="relative">
                        <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input value={search} onChange={e => setSearch(e.target.value)} className="fos-input h-7 text-xs pl-6 w-full" placeholder="Search growers..." autoFocus />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-xs">
                        <tbody>
                            <tr
                                onClick={() => setSelected("")}
                                className={cn("border-b border-gray-100 cursor-pointer transition-colors", selected === "" ? "bg-blue-100" : "odd:bg-white even:bg-gray-50 hover:bg-blue-50")}>
                                <td className={cn("p-2 font-semibold italic", selected === "" ? "text-blue-700" : "text-gray-400")}>— All Growers —</td>
                            </tr>
                            {filtered.map((g: any, i: number) => {
                                const uq  = t(g.UNICO);
                                const sel = selected === uq;
                                return (
                                    <tr key={i} onClick={() => setSelected(uq)}
                                        className={cn("border-b border-gray-100 cursor-pointer transition-colors", sel ? "bg-blue-100 ring-1 ring-inset ring-blue-300" : "odd:bg-white even:bg-gray-50 hover:bg-blue-50")}>
                                        <td className={cn("p-2 font-semibold", sel ? "text-blue-700" : "text-gray-800")}>
                                            {t(g.GROWER ?? g.DESCRIPTION ?? g.NAME ?? uq)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-end gap-2 px-4 py-3 bg-gray-50 border-t shrink-0">
                    <button onClick={() => { onApply(""); onClose(); }}
                        className="px-4 py-2 rounded border border-gray-200 text-xs font-black uppercase text-gray-600 hover:bg-gray-100 transition-colors">
                        Clear
                    </button>
                    <button onClick={handleApply}
                        className="flex items-center gap-2 px-5 py-2 rounded bg-[#FB7506] hover:bg-orange-600 text-white text-xs font-black uppercase tracking-wider transition-all">
                        <Check size={12} />
                        Apply Filter
                    </button>
                </div>
            </div>
        </div>
    );
}
