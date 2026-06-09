import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { RefreshCcw, Save, Search, Trash2, CheckCircle, Users, FileText, Banknote, RotateCcw, Printer, Check, X, ChevronRight, DollarSign, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal, Btn, t, fmt, fmtDate, today, cpFetch, EMPTY_ARR } from "./Shared";

// ─── CrDbModal ────────────────────────────────────────────────────────────────
function CrDbModal({ mode, crdb, invoice, customerName, accRecUq, onClose, onSaved }: any) {
    const isDelete = mode === "delete";
    const isAdd    = mode === "add";
    const showType = isAdd && parseFloat(invoice?.balance ?? 0) > 0;
    const defaultType = isAdd ? (parseFloat(invoice?.balance ?? 0) > 0 ? "C" : "D") : (crdb?.type ?? "C");

    const [form,   setForm]   = useState<any>(isAdd
        ? { type: defaultType, cd_date: today(), reason_uq: "", cd_ammount: 0, details: "", all_invoices: false, acc_rec_uq: accRecUq ?? "" }
        : { ...crdb, type: crdb?.type ?? "C", cd_date: crdb?.cd_date?.split("T")[0] ?? today(), cd_ammount: crdb?.cd_ammount ?? 0 });
    const [saving, setSaving] = useState(false);
    const [error,  setError]  = useState<string|null>(null);

    const { data: reasons = EMPTY_ARR } = useQuery({ queryKey: ["cp-crdb-reasons"], queryFn: () => cpFetch("/api/customer-payments/lookups/crdb-reasons"), staleTime: 60000 });

    const save = async () => {
        setSaving(true); setError(null);
        try {
            let res, d;
            if (isAdd) {
                res = await fetch("/api/customer-payments/crdb", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
            } else if (isDelete) {
                res = await fetch(`/api/customer-payments/crdb/${crdb.unico}`, { method: "DELETE" });
            } else {
                res = await fetch(`/api/customer-payments/crdb/${crdb.unico}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
            }
            d = await res.json();
            if (!d.success) throw new Error(d.error);
            onSaved(d.unico ?? crdb?.unico ?? "");
            onClose();
        } catch(e: any) { setError(e.message); }
        finally { setSaving(false); }
    };

    return (
        <Modal title={`${isAdd?"Insert":isDelete?"Delete":"Edit"} Credit/Debit — ${customerName}`} icon={Banknote} onClose={onClose} size="sm" error={error}
            footer={<><button onClick={onClose} className="px-4 py-2 rounded border text-sm font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
                <button onClick={save} disabled={saving} className={cn("flex items-center gap-2 px-4 py-2 rounded text-white text-sm font-black disabled:opacity-50", isDelete?"bg-red-600 hover:bg-red-700":"bg-[#FB7506] hover:bg-orange-600")}>
                    {saving?<RefreshCcw size={13} className="animate-spin"/>:isDelete?<Trash2 size={13}/>:<Save size={13}/>}{saving?"...":isDelete?"Delete":isAdd?"Create":"Save"}
                </button></>}>
            {isDelete ? (
                <div className="text-center space-y-3 py-2">
                    <Trash2 size={32} className="text-red-400 mx-auto"/>
                    <p className="text-sm text-gray-600">Delete CR/DB <strong>{crdb?.identity_column}</strong>?</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3 text-xs">
                    {/* Type — only editable in Add with balance>0 */}
                    <div className="flex flex-col gap-0.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase">Type *</label>
                        <select value={form.type} onChange={e=>setForm((p:any)=>({...p,type:e.target.value}))} disabled={!showType} className={cn("fos-input py-1", !showType&&"bg-gray-50 text-gray-500")}>
                            <option value="C">C — Credit</option>
                            <option value="D">D — Debit</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase">Date *</label>
                        <input type="date" value={form.cd_date} onChange={e=>setForm((p:any)=>({...p,cd_date:e.target.value}))} className="fos-input py-1"/>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase">Reason *</label>
                        <select value={form.reason_uq} onChange={e=>setForm((p:any)=>({...p,reason_uq:e.target.value}))} className="fos-input py-1">
                            <option value="">— Select —</option>
                            {(reasons as any[]).map((r:any)=><option key={r.unico} value={r.unico}>{t(r.reason)}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase">Amount *</label>
                        <input type="number" step="0.01" value={form.cd_ammount} onChange={e=>setForm((p:any)=>({...p,cd_ammount:parseFloat(e.target.value)||0}))} className="fos-input py-1"/>
                    </div>
                    <div className="col-span-2 flex flex-col gap-0.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase">Details</label>
                        <textarea value={form.details||""} onChange={e=>setForm((p:any)=>({...p,details:e.target.value}))} rows={2} className="fos-input py-1 resize-none"/>
                    </div>
                    {isAdd && (
                        <label className="col-span-2 flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={!!form.all_invoices} onChange={e=>setForm((p:any)=>({...p,all_invoices:e.target.checked}))} className="w-4 h-4 accent-[#FB7506]"/>
                            <span className="text-xs font-semibold text-gray-600">Apply to All Invoices</span>
                        </label>
                    )}
                    {!isAdd && crdb && (
                        <div className="col-span-2 bg-gray-50 rounded p-2">
                            <span className="text-[9px] font-black text-gray-400 uppercase">No. </span>
                            <span className="font-bold">{crdb.identity_column}</span>
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
}


export default CrDbModal;
