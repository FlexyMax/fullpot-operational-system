import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { RefreshCcw, Save, Search, Trash2, CheckCircle, Users, FileText, Banknote, RotateCcw, Printer, Check, X, ChevronRight, DollarSign, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal, Btn, t, fmt, fmtDate, today, cpFetch } from "./Shared";

// ─── ApplyPaymentModal ─────────────────────────────────────────────────────────
function ApplyPaymentModal({ mode, apply, invoice, income, customerName, onClose, onSaved }: any) {
    const isDelete = mode === "delete";
    const isAdd    = mode === "add";
    const [amount, setAmount] = useState<number>(apply?.in_ammount ?? 0);
    const [saving, setSaving] = useState(false);
    const [error,  setError]  = useState<string|null>(null);

    const save = async () => {
        if (!amount) { setError("Amount is empty."); return; }
        setSaving(true); setError(null);
        try {
            let res, d;
            if (isAdd) {
                res = await fetch("/api/customer-payments/apply", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ income_uq: income?.unico, invoice_uq: invoice?.unico, in_ammount: amount }) });
            } else if (isDelete) {
                res = await fetch(`/api/customer-payments/apply/${apply.unico}`, { method: "DELETE" });
            } else {
                res = await fetch(`/api/customer-payments/apply/${apply.unico}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ in_ammount: amount }) });
            }
            d = await res.json();
            if (!d.success) throw new Error(d.error);
            onSaved();
            onClose();
        } catch(e: any) { setError(e.message); }
        finally { setSaving(false); }
    };

    const invBal = parseFloat(invoice?.balance ?? 0);
    const inBal  = parseFloat(income?.in_balance ?? 0);

    return (
        <Modal title={`${isAdd?"Apply":isDelete?"Delete Apply":"Edit Apply"} Payment`} icon={CreditCard} onClose={onClose} size="sm" error={error}
            footer={<><button onClick={onClose} className="px-4 py-2 rounded border text-sm font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
                <button onClick={save} disabled={saving} className={cn("flex items-center gap-2 px-4 py-2 rounded text-white text-sm font-black disabled:opacity-50", isDelete?"bg-red-600 hover:bg-red-700":"bg-[#FB7506] hover:bg-orange-600")}>
                    {saving?<RefreshCcw size={13} className="animate-spin"/>:isDelete?<Trash2 size={13}/>:<Save size={13}/>}{saving?"...":isDelete?"Delete":isAdd?"Apply":"Save"}
                </button></>}>
            <div className="space-y-3 text-xs">
                <div className="bg-gray-50 rounded p-2 grid grid-cols-2 gap-2">
                    {[{l:"Customer",v:customerName},{l:"Invoice No",v:invoice?.invoice_no},{l:"Inv. Date",v:fmtDate(invoice?.arec_date)},{l:"Days",v:invoice?.days},{l:"Due Date",v:fmtDate(invoice?.date_due)},{l:"Invoice Amount",v:fmt(invoice?.ammount)},{l:"Invoice Balance",v:fmt(invBal)},{l:"Income",v:t(income?.dato)},{l:"Income Amount",v:fmt(income?.in_ammount)},{l:"Income Balance",v:fmt(inBal)}].map((f,i)=>(
                        <div key={i} className="flex flex-col gap-0.5">
                            <label className="text-[9px] font-black text-gray-400 uppercase">{f.l}</label>
                            <span className="text-xs font-bold text-gray-700">{f.v}</span>
                        </div>
                    ))}
                </div>
                {!isDelete && (
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-0.5">
                            <label className="text-[9px] font-black text-gray-400 uppercase">Payment Amount *</label>
                            <input type="number" step="0.01" value={amount} onChange={e=>setAmount(parseFloat(e.target.value)||0)} className="fos-input py-1.5 text-sm font-bold" autoFocus/>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <label className="text-[9px] font-black text-gray-400 uppercase">Remaining Balance</label>
                            <input readOnly value={fmt(invBal - amount)} className="fos-input py-1.5 bg-gray-50 text-gray-500 font-bold"/>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}


export default ApplyPaymentModal;
