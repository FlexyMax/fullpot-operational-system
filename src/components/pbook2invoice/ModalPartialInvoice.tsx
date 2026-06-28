"use client";
import { useState, useEffect } from "react";
import { X, Scissors, RefreshCcw, Check } from "lucide-react";
import { toast } from "sonner";

const t = (v: any) => String(v ?? "").trim();
const fmtI = (v: any) => { const n = parseInt(v ?? 0, 10); return isNaN(n) ? "0" : n.toLocaleString("en-US"); };

interface Props {
    open: boolean;
    onClose: () => void;
    pbookUq: string;
    onSuccess: () => void;
}

export function ModalPartialInvoice({ open, onClose, pbookUq, onSuccess }: Props) {
    const [candidates, setCandidates] = useState<any[]>([]);
    const [selected,    setSelected]   = useState<Set<string>>(new Set());
    const [loading,     setLoading]    = useState(false);
    const [joinTo,      setJoinTo]     = useState(false);
    const [invoiceNo,   setInvoiceNo]  = useState("");
    const [saving,      setSaving]     = useState(false);
    const [error,       setError]      = useState<string | null>(null);

    useEffect(() => {
        if (!open || !pbookUq) return;
        setSelected(new Set());
        setJoinTo(false);
        setInvoiceNo("");
        setError(null);
        setLoading(true);
        fetch(`/api/pbook2invoice/partial-candidates?pbook_uq=${pbookUq}`)
            .then(r => r.json())
            .then(d => setCandidates(Array.isArray(d) ? d : []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [open, pbookUq]);

    if (!open) return null;

    const toggle = (unico: string) => setSelected(s => {
        const n = new Set(s);
        if (n.has(unico)) n.delete(unico); else n.add(unico);
        return n;
    });

    const handleSave = async () => {
        if (selected.size === 0) { setError("Select at least one line."); return; }
        if (joinTo && !invoiceNo.trim()) { setError("Invoice number to join is empty."); return; }
        setSaving(true); setError(null);
        try {
            const first = candidates[0];
            const res = await fetch("/api/pbook2invoice/partial-invoice", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    lines: Array.from(selected),
                    invoice_uq: t(first?.invoice_uq),
                    invoice_no: joinTo ? parseInt(invoiceNo, 10) : 0,
                }),
            });
            const d = await res.json();
            if (!d.success) throw new Error(d.error || "Save failed");
            toast.success(`Partial invoice created (${d.count} line${d.count > 1 ? "s" : ""}).`);
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
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 rounded-t-lg shrink-0">
                    <div className="flex items-center gap-2">
                        <Scissors size={16} className="text-[#FB7506]" />
                        <span className="font-black text-[10px] text-white uppercase tracking-widest">Prebook to Partial Invoice</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={16} /></button>
                </div>

                <div className="px-4 py-3 border-b bg-gray-50 flex items-center gap-3">
                    <label className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                        <input type="checkbox" checked={joinTo} onChange={e => setJoinTo(e.target.checked)} />
                        Attach to existing invoice
                    </label>
                    {joinTo && (
                        <input type="number" value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)}
                            placeholder="Invoice number" className="fos-input text-xs w-40" />
                    )}
                </div>

                <div className="max-h-[360px] overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center gap-2 text-gray-400 text-xs p-6 justify-center"><RefreshCcw size={14} className="animate-spin" /> Loading...</div>
                    ) : (
                        <table className="min-w-full text-xs text-left">
                            <thead className="bg-[#4F4F4F] text-white text-[11px] font-bold uppercase sticky top-0 z-10">
                                <tr>
                                    <th className="p-2 w-8"></th>
                                    <th className="p-2">Product</th>
                                    <th className="p-2">Case</th>
                                    <th className="p-2 text-right">Boxes</th>
                                    <th className="p-2 text-right">Invoiced</th>
                                    <th className="p-2 text-right">Stock</th>
                                    <th className="p-2 text-right">To Invoice</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#DBD9D9]">
                                {candidates.map((c: any, i: number) => {
                                    const uq = t(c.unico);
                                    const sel = selected.has(uq);
                                    return (
                                        <tr key={i} onClick={() => toggle(uq)} className={sel ? "!bg-[#FB7506]/10 cursor-pointer" : "hover:bg-gray-50 cursor-pointer text-gray-600"}>
                                            <td className="p-2"><input type="checkbox" checked={sel} onChange={() => toggle(uq)} onClick={e => e.stopPropagation()} /></td>
                                            <td className="p-2">{t(c.description)}</td>
                                            <td className="p-2">{t(c.case_sh)}</td>
                                            <td className="p-2 text-right">{fmtI(c.qty_order)}</td>
                                            <td className="p-2 text-right">{fmtI(c.invoiced_pieces)}</td>
                                            <td className="p-2 text-right">{fmtI(c.stock_units)}</td>
                                            <td className="p-2 text-right font-bold text-[#FB7506]">{fmtI(c.to_invoice)}</td>
                                        </tr>
                                    );
                                })}
                                {candidates.length === 0 && (
                                    <tr><td colSpan={7} className="p-6 text-center text-gray-400 italic">No lines pending invoice for this prebook.</td></tr>
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
                    <button onClick={handleSave} disabled={saving || selected.size === 0}
                        className="flex items-center gap-2 px-5 py-2 rounded bg-[#FB7506] hover:bg-orange-600 disabled:opacity-40 text-white text-xs font-black uppercase tracking-wider transition-all">
                        {saving ? <RefreshCcw size={12} className="animate-spin" /> : <Check size={12} />}
                        {saving ? "Saving..." : `Create Invoice (${selected.size})`}
                    </button>
                </div>
            </div>
        </div>
    );
}
