"use client";
import { useState } from "react";
import { X, ShoppingCart, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const t = (v: any) => String(v ?? "").trim();

interface Props {
    open: boolean;
    onClose: () => void;
    currentCustomer: string;
    onApply: (customer: string) => void;
}

export function ModalFilterCustomers({ open, onClose, currentCustomer, onApply }: Props) {
    const [value, setValue] = useState(currentCustomer);

    if (!open) return null;

    const handleApply = () => {
        onApply(value.trim());
        onClose();
    };

    const fLabel = "text-[10px] font-black text-gray-500 uppercase tracking-wider";
    const fInput = "fos-input h-7 text-xs";

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-xs flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 rounded-t-lg shrink-0">
                    <div className="flex items-center gap-2">
                        <ShoppingCart size={16} className="text-[#FB7506]" />
                        <span className="font-black text-[10px] text-white uppercase tracking-widest">Filter by Customer</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={16} /></button>
                </div>
                <div className="p-4 space-y-3">
                    <div className="flex flex-col gap-0.5">
                        <label className={fLabel}>Customer Code / Name</label>
                        <input
                            value={value}
                            onChange={e => setValue(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleApply()}
                            className={fInput}
                            placeholder="Enter customer code or name..."
                            autoFocus
                        />
                    </div>
                    {value && (
                        <p className="text-[10px] text-gray-400">Filter active: <span className="font-bold text-gray-600">{value}</span></p>
                    )}
                </div>
                <div className="flex justify-end gap-2 px-4 py-3 bg-gray-50 border-t shrink-0">
                    <button onClick={() => { onApply(""); onClose(); }}
                        className="px-4 py-2 rounded border border-gray-200 text-xs font-black uppercase text-gray-600 hover:bg-gray-100 transition-colors">
                        Clear
                    </button>
                    <button onClick={handleApply}
                        className="flex items-center gap-2 px-5 py-2 rounded bg-[#FB7506] hover:bg-orange-600 text-white text-xs font-black uppercase tracking-wider transition-all">
                        <Check size={12} />
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
}
