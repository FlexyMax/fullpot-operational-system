"use client";
import { useState, useEffect } from "react";
import { X, Paperclip, RefreshCcw, Check } from "lucide-react";
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
    onSuccess: () => void;
}

export function ModalAttachInvoice({ open, onClose, pbookUq, onSuccess }: Props) {
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loading,     setLoading]    = useState(false);
    const [invoiceUq,   setInvoiceUq]  = useState("");
    const [saving,      setSaving]     = useState(false);
    const [error,       setError]      = useState<string | null>(null);

    useEffect(() => {
        if (!open || !pbookUq) return;
        setInvoiceUq("");
        setError(null);
        setLoading(true);
        fetch(`/api/pbook2invoice/attach-candidates?pbook_uq=${pbookUq}`)
            .then(r => r.json())
            .then(d => setCandidates(Array.isArray(d) ? d : []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [open, pbookUq]);

    if (!open) return null;

    const handleSave = async () => {
        if (!invoiceUq) { setError("Destination is empty."); return; }
        setSaving(true); setError(null);
        try {
            const res = await fetch("/api/pbook2invoice/attach-invoice", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pbook_uq: pbookUq, invoice_uq: invoiceUq }),
            });
            const d = await res.json();
            if (!d.success) throw new Error(d.error || "Save failed");
            toast.success("Prebook attached to invoice.");
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
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 rounded-t-lg shrink-0">
                    <div className="flex items-center gap-2">
                        <Paperclip size={16} className="text-[#FB7506]" />
                        <span className="font-black text-[10px] text-white uppercase tracking-widest">Attach Prebook to Invoice</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={16} /></button>
                </div>
                <div className="p-4 space-y-3">
                    <label className="block">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">New Destination (Invoice / Cust.PO / Delivery / Shipping date)</span>
                        {loading ? (
                            <div className="flex items-center gap-2 text-gray-400 text-xs mt-1"><RefreshCcw size={12} className="animate-spin" /> Loading...</div>
                        ) : (
                            <select value={invoiceUq} onChange={e => setInvoiceUq(e.target.value)} className="fos-input text-xs w-full mt-0.5">
                                <option value="">Select an open invoice...</option>
                                {candidates.map((c: any) => (
                                    <option key={t(c.unico)} value={t(c.unico)}>
                                        {`#${t(c.invoice_no)} — PO ${t(c.cporder_no) || "—"} — Delivery ${fmtDate(c.invoice_date)} / Ship ${fmtDate(c.whouse_date)}`}
                                    </option>
                                ))}
                            </select>
                        )}
                        {!loading && candidates.length === 0 && (
                            <p className="text-[11px] text-gray-400 italic mt-1">No open invoices for this customer/destination.</p>
                        )}
                    </label>
                    {error && <p className="text-xs text-red-500 bg-red-50 rounded p-2">{error}</p>}
                </div>
                <div className="flex justify-end gap-2 px-4 py-3 bg-gray-50 border-t shrink-0">
                    <button onClick={onClose} className="px-4 py-2 rounded border border-gray-200 text-xs font-black uppercase text-gray-600 hover:bg-gray-100 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving || !invoiceUq}
                        className="flex items-center gap-2 px-5 py-2 rounded bg-[#FB7506] hover:bg-orange-600 disabled:opacity-40 text-white text-xs font-black uppercase tracking-wider transition-all">
                        {saving ? <RefreshCcw size={12} className="animate-spin" /> : <Check size={12} />}
                        {saving ? "Saving..." : "Attach"}
                    </button>
                </div>
            </div>
        </div>
    );
}
