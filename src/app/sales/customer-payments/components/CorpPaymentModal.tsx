import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { RefreshCcw, Save, Search, Trash2, CheckCircle, Users, FileText, Banknote, RotateCcw, Printer, Check, X, ChevronRight, DollarSign, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal, Btn, t, fmt, fmtDate, today, cpFetch } from "./Shared";

// ─── CorpPaymentModal ─────────────────────────────────────────────────────────
function CorpPaymentModal({ mode, income, customerName, customerUq, onClose, onSaved }: any) {
    const isDelete = mode === "delete";
    const [form,   setForm]   = useState(income ? { bank_doc:income.bank_doc||"", pay_amount:income.pay_amount||0, pay_date:income.pay_date?.split("T")[0]??today() } : { bank_doc:"", pay_amount:0, pay_date:today() });
    const [saving, setSaving] = useState(false);
    const [error,  setError]  = useState<string|null>(null);
    const save = async () => {
        setSaving(true); setError(null);
        try {
            let res;
            if (mode==="add") res = await fetch("/api/customer-payments/corporate-income",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,customer_uq:customerUq})});
            else if (isDelete) res = await fetch(`/api/customer-payments/corporate-income/${income.unico}`,{method:"DELETE"});
            else res = await fetch(`/api/customer-payments/corporate-income/${income.unico}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
            const d = await res.json();
            if (!d.success) throw new Error(d.error);
            onSaved(d.unico??income?.unico??""); onClose();
        } catch(e:any){ setError(e.message); }
        finally { setSaving(false); }
    };
    return (
        <Modal title={`${mode==="add"?"Add":isDelete?"Delete":"Edit"} Corporate Payment`} icon={Banknote} onClose={onClose} size="sm" error={error}
            footer={<><button onClick={onClose} className="px-4 py-2 rounded border text-sm font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
                <button onClick={save} disabled={saving} className={cn("flex items-center gap-2 px-4 py-2 rounded text-white text-sm font-black disabled:opacity-50",isDelete?"bg-red-600 hover:bg-red-700":"bg-[#FB7506] hover:bg-orange-600")}>
                    {saving?<RefreshCcw size={13} className="animate-spin"/>:isDelete?<Trash2 size={13}/>:<Save size={13}/>}{saving?"...":isDelete?"Delete":mode==="add"?"Create":"Save"}
                </button></>}>
            {isDelete?<div className="text-center py-2"><Trash2 size={28} className="text-red-400 mx-auto mb-2"/><p className="text-sm text-gray-600">Delete this corporate payment?</p></div>:(
                <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="col-span-2 flex flex-col gap-0.5"><label className="text-[9px] font-black text-gray-400 uppercase">Customer</label><input readOnly value={customerName} className="fos-input py-1 bg-gray-50 text-gray-500"/></div>
                    <div className="flex flex-col gap-0.5"><label className="text-[9px] font-black text-gray-400 uppercase">Bank Doc</label><input type="number" value={form.bank_doc} onChange={e=>setForm(p=>({...p,bank_doc:e.target.value}))} className="fos-input py-1"/></div>
                    <div className="flex flex-col gap-0.5"><label className="text-[9px] font-black text-gray-400 uppercase">Date</label><input type="date" value={form.pay_date} onChange={e=>setForm(p=>({...p,pay_date:e.target.value}))} className="fos-input py-1"/></div>
                    <div className="flex flex-col gap-0.5"><label className="text-[9px] font-black text-gray-400 uppercase">Payment *</label><input type="number" step="0.01" value={form.pay_amount} onChange={e=>setForm(p=>({...p,pay_amount:parseFloat(e.target.value)||0}))} className="fos-input py-1"/></div>
                    {income&&<><div className="flex flex-col gap-0.5"><label className="text-[9px] font-black text-gray-400 uppercase">Applied</label><input readOnly value={fmt(income.pay_applied)} className="fos-input py-1 bg-gray-50 text-gray-500 font-bold"/></div><div className="flex flex-col gap-0.5 col-span-2"><label className="text-[9px] font-black text-gray-400 uppercase">Balance</label><input readOnly value={fmt(income.pay_balance)} className="fos-input py-1 bg-gray-50 text-blue-700 font-bold"/></div></>}
                </div>
            )}
        </Modal>
    );
}


export default CorpPaymentModal;
