"use client";
import { useState, useEffect } from "react";
import { X, UserCog, RefreshCcw, Check, Search } from "lucide-react";
import { toast } from "sonner";

const t = (v: any) => String(v ?? "").trim();
const fmtDate = (v: any) => {
    const s = t(v);
    const d = s ? new Date(s) : null;
    return d && !isNaN(d.getTime()) ? d.toLocaleDateString("en-US") : "";
};

interface Props {
    open: boolean;
    onClose: () => void;
    pbookUq: string;
    header: any;   // sp_flower_prebook_box_uq_pc row (already fetched as detail.detail)
    onSuccess: () => void;
}

export function ModalChangeCustomer({ open, onClose, pbookUq, header, onSuccess }: Props) {
    const [search,     setSearch]     = useState("");
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loading,    setLoading]    = useState(false);
    const [selected,   setSelected]   = useState<{ shiptoUq: string; carrierUq: string } | null>(null);
    const [saving,     setSaving]     = useState(false);
    const [error,      setError]      = useState<string | null>(null);

    const runSearch = (q: string) => {
        setLoading(true);
        fetch(`/api/pbook2invoice/customer-search-candidates?search=${encodeURIComponent(q)}`)
            .then(r => r.json())
            .then(d => setCandidates(Array.isArray(d) ? d : []))
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (!open) return;
        setSearch("");
        setCandidates([]);
        setSelected(null);
        setError(null);
    }, [open]);

    if (!open) return null;

    const handleSave = async () => {
        if (!selected) { setError("Please select one customer."); return; }
        setSaving(true); setError(null);
        try {
            const res = await fetch("/api/pbook2invoice/change-customer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pbook_uq: pbookUq, shipto_uq: selected.shiptoUq, carrier_uq: selected.carrierUq }),
            });
            const d = await res.json();
            if (!d.success) throw new Error(d.error || "Save failed");
            toast.success("Customer changed.");
            onSuccess();
            onClose();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden" style={{ maxHeight: "85vh" }} onClick={e => e.stopPropagation()}>
                <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 rounded-t-lg shrink-0">
                    <div className="flex items-center gap-2">
                        <UserCog size={16} className="text-[#FB7506]" />
                        <span className="font-black text-[10px] text-white uppercase tracking-widest">Prebook to Change Customer</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={16} /></button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] bg-gray-50 p-3 border-b">
                    <div><span className="text-gray-400">Prebook</span><div className="font-semibold text-gray-700">{t(header?.PBOOK_NO)}</div></div>
                    <div><span className="text-gray-400">Cust.PO</span><div className="font-semibold text-gray-700">{t(header?.CPORDER_NO)}</div></div>
                    <div className="col-span-1"><span className="text-gray-400">Current Customer</span><div className="font-semibold text-gray-700 truncate">{t(header?.CUSTOMER)}</div></div>
                    <div><span className="text-gray-400">Delivery</span><div className="font-semibold text-gray-700">{fmtDate(header?.PBDATE)}</div></div>
                    <div><span className="text-gray-400">Shipping</span><div className="font-semibold text-gray-700">{fmtDate(header?.SHIPDATE)}</div></div>
                </div>

                <div className="px-4 py-2 border-b">
                    <div className="flex items-center bg-[#F5F3F3] border border-[#DBD9D9] rounded px-2 py-1 gap-1">
                        <Search size={12} className="text-gray-400 shrink-0" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") runSearch(search); }}
                            placeholder="Search by Customer or Shipto Name"
                            className="text-xs text-gray-700 placeholder-gray-400 outline-none flex-1 min-w-0 bg-transparent py-0.5"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center gap-2 text-gray-400 text-xs p-6 justify-center"><RefreshCcw size={14} className="animate-spin" /> Loading...</div>
                    ) : (
                        <table className="min-w-full text-xs text-left">
                            <thead className="bg-[#4F4F4F] text-white text-[11px] font-bold uppercase sticky top-0 z-10">
                                <tr>
                                    <th className="p-2">Customer</th>
                                    <th className="p-2">ShipTo</th>
                                    <th className="p-2">Carrier</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#DBD9D9]">
                                {candidates.map((c: any, i: number) => {
                                    const sel = selected?.shiptoUq === t(c.shipto_uq) && selected?.carrierUq === t(c.carrier_uq);
                                    return (
                                        <tr key={i} onClick={() => setSelected({ shiptoUq: t(c.shipto_uq), carrierUq: t(c.carrier_uq) })}
                                            className={sel ? "!bg-[#FB7506]/10 cursor-pointer" : "hover:bg-gray-50 cursor-pointer text-gray-600"}>
                                            <td className="p-2 font-medium">{t(c.customer)}</td>
                                            <td className="p-2">{t(c.shipto)}</td>
                                            <td className="p-2">{t(c.carrier)}</td>
                                        </tr>
                                    );
                                })}
                                {candidates.length === 0 && (
                                    <tr><td colSpan={3} className="p-6 text-center text-gray-400 italic">
                                        {search.trim() ? "No customers found." : "Type a customer or shipto name and press Enter to search."}
                                    </td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                    {error && <p className="text-xs text-red-500 bg-red-50 rounded p-2 m-3">{error}</p>}
                </div>

                <div className="flex justify-end gap-2 px-4 py-3 bg-gray-50 border-t shrink-0">
                    <button onClick={onClose} className="px-4 py-2 rounded border border-gray-200 text-xs font-black uppercase text-gray-600 hover:bg-gray-100 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving || !selected}
                        className="flex items-center gap-2 px-5 py-2 rounded bg-[#FB7506] hover:bg-orange-600 disabled:opacity-40 text-white text-xs font-black uppercase tracking-wider transition-all">
                        {saving ? <RefreshCcw size={12} className="animate-spin" /> : <Check size={12} />}
                        {saving ? "Saving..." : "OK"}
                    </button>
                </div>
            </div>
        </div>
    );
}
