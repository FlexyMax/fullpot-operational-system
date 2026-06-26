"use client";
import { useState } from "react";
import { X, ShoppingCart, Check } from "lucide-react";

const t = (v: any) => String(v ?? "").trim();

interface Props {
    open: boolean;
    onClose: () => void;
    customers: any[];
    currentCustomer: string;
    onApply: (customerUq: string) => void;
}

// Customers list passed in is already scoped to the current AWB's boxes
// (mirrors the VFP screen's "Customer by AWB" combobox, RowSource c_customers_awb).
export function ModalFilterCustomers({ open, onClose, customers, currentCustomer, onApply }: Props) {
    const [selected, setSelected] = useState(currentCustomer);

    if (!open) return null;

    const handleApply = () => {
        onApply(selected);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 rounded-t-lg shrink-0">
                    <div className="flex items-center gap-2">
                        <ShoppingCart size={16} className="text-[#FB7506]" />
                        <span className="font-black text-[10px] text-white uppercase tracking-widest">Filter by Customer</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={16} /></button>
                </div>
                <div className="p-4 space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Customer Name</label>
                    <select value={selected} onChange={e => setSelected(e.target.value)} className="fos-input h-8 text-xs w-full" autoFocus>
                        <option value="">— All Customers —</option>
                        {customers.map((c: any, i: number) => (
                            <option key={`${t(c.UNICO)}-${i}`} value={t(c.UNICO)}>{t(c.CUSTOMER ?? "")}</option>
                        ))}
                    </select>
                    {customers.length === 0 && (
                        <p className="text-[10px] text-gray-400 italic">No customer-assigned boxes for the current AWB.</p>
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
                        Apply Filter
                    </button>
                </div>
            </div>
        </div>
    );
}
