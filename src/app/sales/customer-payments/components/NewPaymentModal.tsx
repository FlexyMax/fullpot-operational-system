import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { RefreshCcw, Save, Search, Trash2, CheckCircle, Users, FileText, Banknote, RotateCcw, Printer, Check, X, ChevronRight, DollarSign, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal, Btn, t, fmt, fmtDate, today, cpFetch, EMPTY_ARR } from "./Shared";

// ─── NewPaymentModal ───────────────────────────────────────────────────────────
function NewPaymentModal({ mode, income, customerUq, customerName, onClose, onSaved }: any) {
    const isDelete = mode === "delete";
    const isAdd    = mode === "add";
    const [form,   setForm]   = useState<any>( income ? { ...income, in_date: income.in_date?.split("T")[0] ?? today() } : { in_date: today(), customer_uq: customerUq, type_uq: "", bank_uq: "", in_ammount: 0, bank_doc: "", deposit: 0, card: "", approval: "", details: "" });
    const [saving, setSaving] = useState(false);
    const [error,  setError]  = useState<string|null>(null);

    const { data: banks = EMPTY_ARR }     = useQuery({ queryKey: ["cp-banks", mode], queryFn: () => cpFetch(`/api/customer-payments/lookups/banks?mode=${isAdd?"last":"list"}`), staleTime: 60000 });
    const { data: types = EMPTY_ARR }     = useQuery({ queryKey: ["cp-inc-types"], queryFn: () => cpFetch("/api/customer-payments/lookups/income-types"), staleTime: 60000 });

    useEffect(() => {
        if (isAdd && banks.length > 0 && !form.bank_uq) setForm((p: any) => ({ ...p, bank_uq: banks[0].unico }));
    }, [banks]);

    const save = async () => {
        setSaving(true); setError(null);
        try {
            const body = { ...form, customer_uq: customerUq };
            const url  = isAdd ? "/api/customer-payments/income" : `/api/customer-payments/income/${income.unico}`;
            const res  = await fetch(url, { method: isAdd ? "POST" : "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
            const d    = await res.json();
            if (!d.success) throw new Error(d.error);
            onSaved(d.unico ?? income?.unico);
            onClose();
        } catch(e: any) { setError(e.message); }
        finally { setSaving(false); }
    };

    const del = async () => {
        setSaving(true); setError(null);
        try {
            const res = await fetch(`/api/customer-payments/income/${income.unico}`, { method: "DELETE" });
            const d   = await res.json();
            if (!d.success) throw new Error(d.error);
            onSaved(null);
            onClose();
        } catch(e: any) { setError(e.message); }
        finally { setSaving(false); }
    };

    return (
        <Modal title={`${isAdd?"New":isDelete?"Delete":"Edit"} Payment — ${customerName}`} icon={DollarSign} onClose={onClose} size="md" error={error}
            footer={<><button onClick={onClose} className="px-4 py-2 rounded border text-sm font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
                {isDelete ? <button onClick={del} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded bg-red-600 text-white text-sm font-black disabled:opacity-50">{saving?<RefreshCcw size={13} className="animate-spin"/>:<Trash2 size={13}/>}Delete</button>
                : <button onClick={save} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded bg-[#FB7506] text-white text-sm font-black disabled:opacity-50">{saving?<RefreshCcw size={13} className="animate-spin"/>:<Save size={13}/>}{saving?"Saving...":isAdd?"Create":"Save"}</button>}
            </>}>
            {isDelete ? (
                <div className="text-center space-y-3 py-2">
                    <Trash2 size={32} className="text-red-400 mx-auto"/>
                    <p className="text-sm text-gray-600">Delete payment <strong>{t(income?.dato || income?.unico)}</strong>?</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="col-span-2 flex flex-col gap-0.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase">Customer</label>
                        <input readOnly value={customerName} className="fos-input py-1 bg-gray-50 text-gray-500"/>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase">Type *</label>
                        <select value={form.type_uq||""} onChange={e=>setForm((p:any)=>({...p,type_uq:e.target.value}))} className="fos-input py-1">
                            <option value="">— Select —</option>
                            {(types as any[]).map((tp:any)=><option key={tp.unico} value={tp.unico}>{t(tp.type)}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase">Bank *</label>
                        <select value={form.bank_uq||""} onChange={e=>setForm((p:any)=>({...p,bank_uq:e.target.value}))} className="fos-input py-1">
                            <option value="">— Select —</option>
                            {(banks as any[]).map((b:any)=><option key={b.unico} value={b.unico}>{t(b.bank)}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase">Date *</label>
                        <input type="date" value={form.in_date||today()} onChange={e=>setForm((p:any)=>({...p,in_date:e.target.value}))} className="fos-input py-1"/>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase">Amount *</label>
                        <input type="number" step="0.01" value={form.in_ammount||0} onChange={e=>setForm((p:any)=>({...p,in_ammount:parseFloat(e.target.value)||0}))} className="fos-input py-1"/>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase">Doc No.</label>
                        <input value={form.bank_doc||""} onChange={e=>setForm((p:any)=>({...p,bank_doc:e.target.value}))} className="fos-input py-1"/>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase">Card (last 4)</label>
                        <input value={form.card||""} onChange={e=>setForm((p:any)=>({...p,card:e.target.value}))} className="fos-input py-1"/>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase">Approval</label>
                        <input value={form.approval||""} onChange={e=>setForm((p:any)=>({...p,approval:e.target.value}))} className="fos-input py-1"/>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase">Deposit</label>
                        <input type="number" value={form.deposit||0} onChange={e=>setForm((p:any)=>({...p,deposit:parseInt(e.target.value)||0}))} className="fos-input py-1"/>
                    </div>
                    <div className="col-span-2 flex flex-col gap-0.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase">Detail</label>
                        <textarea value={form.details||""} onChange={e=>setForm((p:any)=>({...p,details:e.target.value}))} rows={2} className="fos-input py-1 resize-none"/>
                    </div>
                    {!isAdd && (
                        <div className="col-span-2 grid grid-cols-3 gap-2 bg-gray-50 rounded p-2">
                            {[{l:"On Invoice",v:income?.in_total},{l:"Balance",v:income?.in_balance},{l:"Cr Available",v:null}].map((f,i)=>(
                                <div key={i} className="flex flex-col gap-0.5">
                                    <label className="text-[9px] font-black text-gray-400 uppercase">{f.l}</label>
                                    <span className="text-xs font-bold text-blue-700">{f.v!=null?fmt(f.v):"—"}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
}


export default NewPaymentModal;
