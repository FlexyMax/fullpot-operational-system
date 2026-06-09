import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { RefreshCcw, Save, Search, Trash2, CheckCircle, Users, FileText, Banknote, RotateCcw, Printer, Check, X, ChevronRight, DollarSign, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal, Btn, t, fmt, fmtDate, today, cpFetch } from "./Shared";

// ─── CashBackModal ────────────────────────────────────────────────────────────
function CashBackModal({ payment, customerName, onClose, onSaved }: any) {
    const [form,   setForm]   = useState({ in_date: today(), in_ammount: 0, details: "" });
    const [saving, setSaving] = useState(false);
    const [error,  setError]  = useState<string|null>(null);
    const maxAmount = parseFloat(payment?.in_balance ?? 0);

    const save = async () => {
        if (!form.in_ammount) { setError("Income amount is empty."); return; }
        if (form.in_ammount > maxAmount) { setError("Income amount is greather to balance."); return; }
        setSaving(true); setError(null);
        try {
            const res = await fetch("/api/customer-payments/cashback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ income_uq: payment.unico, ...form }) });
            const d = await res.json();
            if (!d.success) throw new Error(d.error);
            onSaved(d.unico);
            onClose();
        } catch(e: any) { setError(e.message); }
        finally { setSaving(false); }
    };

    return (
        <Modal title={`Customer Cash Back — ${customerName}`} icon={RotateCcw} onClose={onClose} size="sm" error={error}
            footer={<><button onClick={onClose} className="px-4 py-2 rounded border text-sm font-bold text-gray-600 hover:bg-gray-100">Cancel</button><button onClick={save} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded bg-[#FB7506] text-white text-sm font-black disabled:opacity-50">{saving?<RefreshCcw size={13} className="animate-spin"/>:<Save size={13}/>}{saving?"Saving...":"Create"}</button></>}>
            <div className="space-y-3 text-xs">
                <div className="bg-gray-50 rounded p-2 grid grid-cols-2 gap-2">
                    <div><span className="text-[9px] font-black text-gray-400 uppercase">Source Income: </span><span className="font-bold">{t(payment?.dato||payment?.unico)}</span></div>
                    <div><span className="text-[9px] font-black text-gray-400 uppercase">Income Balance: </span><span className="font-bold text-blue-700">{fmt(maxAmount)}</span></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-0.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase">Date *</label>
                        <input type="date" value={form.in_date} onChange={e=>setForm(p=>({...p,in_date:e.target.value}))} className="fos-input py-1.5"/>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase">Amount * (max {fmt(maxAmount)})</label>
                        <input type="number" step="0.01" max={maxAmount} value={form.in_ammount} onChange={e=>setForm(p=>({...p,in_ammount:parseFloat(e.target.value)||0}))} className="fos-input py-1.5"/>
                    </div>
                </div>
                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Details</label>
                    <textarea value={form.details} onChange={e=>setForm(p=>({...p,details:e.target.value}))} rows={2} className="fos-input py-1 resize-none"/>
                </div>
            </div>
        </Modal>
    );
}


export default CashBackModal;
