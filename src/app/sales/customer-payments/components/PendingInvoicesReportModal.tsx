import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { RefreshCcw, Save, Search, Trash2, CheckCircle, Users, FileText, Banknote, RotateCcw, Printer, Check, X, ChevronRight, DollarSign, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal, Btn, t, fmt, fmtDate, today, cpFetch } from "./Shared";

// ─── PendingInvoicesReportModal ────────────────────────────────────────────────
function PendingInvoicesReportModal({ customerUq, onClose }: any) {
    const [dateFrom, setDateFrom] = useState(today());
    const [dateTo,   setDateTo]   = useState(today());
    const [loading,  setLoading]  = useState(false);
    const [done,     setDone]     = useState(false);

    const run = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/customer-payments/reports/pending-invoices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ customer_uq: customerUq, date_from: dateFrom, date_to: dateTo }) });
            const d = await res.json();
            if (!d.success) throw new Error(d.error);
            setDone(true);
            setTimeout(onClose, 1200);
        } catch(e: any) { alert((e as any).message); }
        finally { setLoading(false); }
    };

    return (
        <Modal title="Pending Invoices Report" icon={FileText} onClose={onClose} size="sm"
            footer={<><button onClick={onClose} className="px-4 py-2 rounded border text-sm font-bold text-gray-600 hover:bg-gray-100">Cancel</button><button onClick={run} disabled={loading||done} className="flex items-center gap-2 px-4 py-2 rounded bg-[#FB7506] text-white text-sm font-black disabled:opacity-50">{loading?<RefreshCcw size={13} className="animate-spin"/>:done?<Check size={13}/>:<Printer size={13}/>}{done?"Done!":"Generate"}</button></>}>
            <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex flex-col gap-0.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase">Date From</label>
                        <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} className="fos-input py-1.5"/>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase">Date To</label>
                        <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} className="fos-input py-1.5"/>
                    </div>
                </div>
                <p className="text-xs text-gray-500 italic">Pending Invoices report for selected customer and date range.</p>
            </div>
        </Modal>
    );
}


export default PendingInvoicesReportModal;
