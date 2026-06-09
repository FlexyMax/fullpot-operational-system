import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { RefreshCcw, Save, Search, Trash2, CheckCircle, Users, FileText, Banknote, RotateCcw, Printer, Check, X, ChevronRight, DollarSign, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal, Btn, t, fmt, fmtDate, today, cpFetch } from "./Shared";

// ─── ApproveCreditModal ────────────────────────────────────────────────────────
function ApproveCreditModal({ requests, onClose, onAction }: any) {
    const [selReq,   setSelReq]   = useState<any>(requests[0] ?? null);
    const [amount,   setAmount]   = useState<number>(0);
    const [saving,   setSaving]   = useState(false);
    const [error,    setError]    = useState<string|null>(null);

    const { data: profile } = useQuery({ queryKey: ["cp-cred-prof", selReq?.customer_uq], queryFn: () => cpFetch(`/api/customer-payments/customers/${selReq.customer_uq}`), enabled: !!selReq?.customer_uq });

    const act = async (action: "approve"|"deny"|"extension") => {
        if (!selReq) return;
        if (action === "approve" && !amount) { setError("Approve value is empty."); return; }
        setSaving(true); setError(null);
        try {
            const res = await fetch(`/api/customer-payments/credit-approve/${selReq.unico}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, amount, customer_uq: selReq.customer_uq }) });
            const d = await res.json();
            if (!d.success) throw new Error(d.error);
            onAction();
        } catch(e: any) { setError(e.message); }
        finally { setSaving(false); }
    };

    return (
        <Modal title={`Approve Credits (${requests.length} pending)`} icon={CheckCircle} onClose={onClose} size="xl" error={error}
            footer={<>
                <button onClick={onClose} className="px-4 py-2 rounded border text-sm font-bold text-gray-600 hover:bg-gray-100">Close</button>
                <Btn icon={X}          label="Deny"      color="red"   onClick={()=>act("deny")}      disabled={!selReq||saving}/>
                <Btn icon={ChevronRight} label="Extension" color="amber" onClick={()=>act("extension")} disabled={!selReq||saving}/>
                <Btn icon={Check}      label="Approve"   color="green" onClick={()=>act("approve")}   disabled={!selReq||saving||!amount}/>
            </>}>
            <div className="flex gap-4 h-full">
                {/* Requests grid */}
                <div className="flex-1 min-w-0">
                    <table className="min-w-full text-left">
                        <thead className="bg-gray-100 border-b fos-grid-thead text-gray-700 sticky top-0">
                            <tr>{["Salesman","Invoice","Date","Min.Cr.Req","Line Amt","Total Inv","Approved"].map(h=><th key={h} className="p-2 border-r border-gray-200 last:border-r-0">{h}</th>)}</tr>
                        </thead>
                        <tbody className="fos-grid-tbody divide-y divide-gray-100">
                            {requests.map((r: any) => (
                                <tr key={r.unico} onClick={()=>setSelReq(r)} className={cn("cursor-pointer transition-colors", selReq?.unico===r.unico?"!bg-blue-50 ring-1 ring-inset ring-blue-200":"hover:bg-gray-50")}>
                                    <td className="p-2">{t(r.salesman_name)}</td>
                                    <td className="p-2 font-bold">{r.invoice_no}</td>
                                    <td className="p-2">{fmtDate(r.invoice_date)}</td>
                                    <td className="p-2 text-right text-amber-600 font-bold">{fmt(r.min_cred_req)}</td>
                                    <td className="p-2 text-right">{fmt(r.line_amount)}</td>
                                    <td className="p-2 text-right">{fmt(r.total_invoice)}</td>
                                    <td className="p-2 text-right text-green-600">{fmt(r.total_approved_by_invoice)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Approval panel */}
                {selReq && (
                    <div className="w-56 shrink-0 space-y-3 text-xs border-l pl-4">
                        <div className="bg-gray-50 rounded p-2 space-y-1">
                            {[{l:"Customer",v:t(profile?.customer)},{l:"Credit Limit",v:fmt(profile?.credit_limit)},{l:"Min. Required",v:fmt(selReq.min_cred_req)}].map((f,i)=>(
                                <div key={i}><span className="text-[9px] font-black text-gray-400 uppercase">{f.l}: </span><span className="font-bold">{f.v}</span></div>
                            ))}
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <label className="text-[9px] font-black text-gray-400 uppercase">Approve Amount</label>
                            <input type="number" step="0.01" value={amount} onChange={e=>setAmount(parseFloat(e.target.value)||0)} className="fos-input py-1.5 font-bold" placeholder="0.00"/>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}


export default ApproveCreditModal;
