"use client";
import { useState, useEffect } from "react";
import { X, Link2, RefreshCcw } from "lucide-react";

const t = (v: any) => String(v ?? "").trim();
const fmtI = (v: any) => { const n = parseInt(v ?? 0, 10); return isNaN(n) ? "" : n.toLocaleString("en-US"); };
const fmt = (v: any) => { const n = parseFloat(v ?? 0); return isNaN(n) ? "" : n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
const fmtDate = (v: any) => { const d = v ? new Date(v) : null; return d && !isNaN(d.getTime()) ? d.toLocaleDateString("en-US") : ""; };

interface Props {
    open: boolean;
    onClose: () => void;
    customerUq: string;
    date: string;
}

export function ModalInvoicesByCustomer({ open, onClose, customerUq, date }: Props) {
    const [rows,    setRows]    = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [prevOpen, setPrevOpen] = useState(open);
    if (open !== prevOpen) {
        setPrevOpen(open);
        if (open) setLoading(true);
    }

    useEffect(() => {
        if (!open) return;
        fetch(`/api/pbook2invoice/invoices-by-customer?customer_uq=${customerUq}&date=${date}`)
            .then(r => r.json())
            .then(d => setRows(Array.isArray(d) ? d : []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [open, customerUq, date]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden" style={{ maxHeight: "80vh" }} onClick={e => e.stopPropagation()}>
                <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 rounded-t-lg shrink-0">
                    <div className="flex items-center gap-2">
                        <Link2 size={16} className="text-[#FB7506]" />
                        <span className="font-black text-[10px] text-white uppercase tracking-widest">Invoice By Date</span>
                        {loading && <RefreshCcw size={11} className="text-gray-400 animate-spin ml-1" />}
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={16} /></button>
                </div>
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-[#4F4F4F] text-white text-[11px] font-bold uppercase sticky top-0 z-10">
                            <tr className="divide-x divide-white/20">
                                <th className="p-2">Pbook</th><th className="p-2">STD No</th><th className="p-2">Cust PO</th>
                                <th className="p-2">Invoice</th><th className="p-2">Product</th><th className="p-2">Case</th>
                                <th className="p-2 text-right">Boxes</th><th className="p-2 text-right">Units</th>
                                <th className="p-2 text-right">PBQty</th><th className="p-2">Invoice Date</th>
                                <th className="p-2 text-right">Total</th><th className="p-2">Status</th><th className="p-2">Void</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#DBD9D9]">
                            {rows.map((r: any, i: number) => (
                                <tr key={i} className="hover:bg-gray-50 text-gray-600 divide-x divide-[#DBD9D9]">
                                    <td className="p-2">{t(r.pbook_no)}</td>
                                    <td className="p-2">{t(r.stdorder_no)}</td>
                                    <td className="p-2">{t(r.cust_po)}</td>
                                    <td className="p-2 font-semibold text-blue-700">{t(r.invoice_no)}</td>
                                    <td className="p-2 max-w-[180px] truncate">{t(r.description)}</td>
                                    <td className="p-2">{t(r.case_sh)}</td>
                                    <td className="p-2 text-right">{fmtI(r.box_qty)}</td>
                                    <td className="p-2 text-right">{fmtI(r.total_units)}</td>
                                    <td className="p-2 text-right">{fmtI(r.pb_pieces)}</td>
                                    <td className="p-2">{fmtDate(r.invoice_date)}</td>
                                    <td className="p-2 text-right font-semibold">{fmt(r.total_invoice)}</td>
                                    <td className="p-2">{t(r.status)}</td>
                                    <td className="p-2">{t(r.void)}</td>
                                </tr>
                            ))}
                            {!loading && rows.length === 0 && (
                                <tr><td colSpan={13} className="p-6 text-center text-gray-400 italic">No invoices for this customer on this date.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-4 py-2 bg-gray-50 border-t shrink-0 flex items-center justify-end">
                    <button onClick={onClose} className="px-4 py-2 rounded border border-gray-200 text-xs font-black uppercase text-gray-600 hover:bg-gray-100 transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
