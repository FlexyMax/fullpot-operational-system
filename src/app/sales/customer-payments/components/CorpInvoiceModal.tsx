import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { RefreshCcw, Save, Search, Trash2, CheckCircle, Users, FileText, Banknote, RotateCcw, Printer, Check, X, ChevronRight, DollarSign, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal, Btn, t, fmt, fmtDate, today, cpFetch, EMPTY_ARR } from "./Shared";

// ─── CorpInvoiceModal ─────────────────────────────────────────────────────────
function CorpInvoiceModal({ corpIncome, customerUq, onClose, onSaved }: any) {
    const [invoiceNo,  setInvoiceNo]  = useState("");
    const [inDate,     setInDate]     = useState(today());
    const [inAmount,   setInAmount]   = useState(0);
    const [foundInv,   setFoundInv]   = useState<any>(null);
    const [searching,  setSearching]  = useState(false);
    const [saving,     setSaving]     = useState(false);
    const [error,      setError]      = useState<string|null>(null);
    const { data: types = EMPTY_ARR } = useQuery({ queryKey:["cp-inc-types"], queryFn:()=>cpFetch("/api/customer-payments/lookups/income-types"), staleTime:60000 });
    const [typeUq, setTypeUq] = useState("");

    const searchInvoice = async () => {
        if (!invoiceNo) return;
        setSearching(true); setFoundInv(null); setError(null);
        try {
            const d = await cpFetch(`/api/customer-payments/invoice-by-number/${invoiceNo}`);
            if (!d.found) { setError(d.message); return; }
            setFoundInv(d.invoice);
        } catch(e:any){ setError(e.message); }
        finally { setSearching(false); }
    };

    const save = async () => {
        if (!corpIncome) { setError("No corporate income selected."); return; }
        if (parseFloat(corpIncome.pay_balance??0) <= 0) { setError("Corporate Payment Balance is 0."); return; }
        if (!foundInv) { setError("Search and select an invoice."); return; }
        if (!inAmount) { setError("Applied amount is empty."); return; }
        setSaving(true); setError(null);
        try {
            const res = await fetch("/api/customer-payments/corporate-invoice",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type_uq:typeUq,in_date:inDate,customer_uq:customerUq,in_amount:inAmount,bank_doc:corpIncome.bank_doc,in_corp_uq:corpIncome.unico,acc_recd_uq:foundInv.unico})});
            const d = await res.json();
            if (!d.success) throw new Error(d.error);
            onSaved(d.unico); onClose();
        } catch(e:any){ setError(e.message); }
        finally { setSaving(false); }
    };

    return (
        <Modal title="Add Invoice to Corporate Payment" icon={FileText} onClose={onClose} size="md" error={error}
            footer={<><button onClick={onClose} className="px-4 py-2 rounded border text-sm font-bold text-gray-600 hover:bg-gray-100">Cancel</button><button onClick={save} disabled={saving||!foundInv} className="flex items-center gap-2 px-4 py-2 rounded bg-[#FB7506] text-white text-sm font-black disabled:opacity-50">{saving?<RefreshCcw size={13} className="animate-spin"/>:<Save size={13}/>}{saving?"Saving...":"Apply"}</button></>}>
            <div className="grid grid-cols-2 gap-3 text-xs">
                {corpIncome&&(<><div className="col-span-2 bg-gray-50 rounded p-2 grid grid-cols-3 gap-2">
                    {[{l:"Corp. Customer",v:t(corpIncome.cust_code)},{l:"Bank Doc",v:t(corpIncome.bank_doc)},{l:"Total",v:fmt(corpIncome.pay_amount)},{l:"Applied",v:fmt(corpIncome.pay_applied)},{l:"Balance",v:fmt(corpIncome.pay_balance)}].map((f,i)=>(
                        <div key={i}><span className="text-[9px] font-black text-gray-400 uppercase">{f.l}: </span><span className="font-bold">{f.v}</span></div>
                    ))}
                </div></>)}
                <div className="flex flex-col gap-0.5"><label className="text-[9px] font-black text-gray-400 uppercase">Type</label><select value={typeUq} onChange={e=>setTypeUq(e.target.value)} className="fos-input py-1"><option value="">— Select —</option>{(types as any[]).map((tp:any)=><option key={tp.unico} value={tp.unico}>{t(tp.type)}</option>)}</select></div>
                <div className="flex flex-col gap-0.5"><label className="text-[9px] font-black text-gray-400 uppercase">Date</label><input type="date" value={inDate} onChange={e=>setInDate(e.target.value)} className="fos-input py-1"/></div>
                {/* Invoice search */}
                <div className="col-span-2 flex gap-2">
                    <div className="flex-1 flex flex-col gap-0.5"><label className="text-[9px] font-black text-gray-400 uppercase">Invoice No.</label><input type="number" value={invoiceNo} onChange={e=>setInvoiceNo(e.target.value)} onBlur={searchInvoice} onKeyDown={e=>e.key==="Enter"&&searchInvoice()} placeholder="Enter invoice number..." className="fos-input py-1"/></div>
                    <button onClick={searchInvoice} disabled={searching||!invoiceNo} className="mt-4 px-3 py-1 bg-gray-600 hover:bg-gray-700 disabled:opacity-40 text-white text-xs font-black rounded flex items-center gap-1">{searching?<RefreshCcw size={11} className="animate-spin"/>:<Search size={11}/>}Search</button>
                </div>
                {foundInv&&(<div className="col-span-2 bg-blue-50 rounded p-2 grid grid-cols-3 gap-2 border border-blue-200">
                    {[{l:"Invoice",v:foundInv.invoice_no},{l:"Customer",v:t(foundInv.customer)},{l:"Amount",v:fmt(foundInv.ammount)},{l:"Balance",v:fmt(foundInv.balance)}].map((f,i)=>(
                        <div key={i}><span className="text-[9px] font-black text-gray-400 uppercase">{f.l}: </span><span className="font-bold text-blue-700">{f.v}</span></div>
                    ))}
                </div>)}
                <div className="flex flex-col gap-0.5"><label className="text-[9px] font-black text-gray-400 uppercase">Applied Amount *</label><input type="number" step="0.01" value={inAmount} onChange={e=>setInAmount(parseFloat(e.target.value)||0)} className="fos-input py-1.5 font-bold"/></div>
                {foundInv&&<div className="flex flex-col gap-0.5"><label className="text-[9px] font-black text-gray-400 uppercase">Remaining Balance</label><input readOnly value={fmt(parseFloat(foundInv.balance??0)-inAmount)} className="fos-input py-1.5 bg-gray-50 text-gray-500 font-bold"/></div>}
            </div>
        </Modal>
    );
}


export default CorpInvoiceModal;
