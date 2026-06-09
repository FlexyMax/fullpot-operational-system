import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { RefreshCcw, Save, Search, Trash2, CheckCircle, Users, FileText, Banknote, RotateCcw, Printer, Check, X, ChevronRight, DollarSign, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal, Btn, t, fmt, fmtDate, today, cpFetch } from "./Shared";

// ─── CrDbReportModal ──────────────────────────────────────────────────────────
function CrDbReportModal({ invoiceUq, onClose }: any) {
    const [option,  setOption]  = useState(1);
    const [loading, setLoading] = useState(false);

    const run = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/customer-payments/reports/crdb", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ report_option: option, invoice_uq: invoiceUq }) });
            const d = await res.json();
            if (!d.success) throw new Error(d.error);
            alert(`Report generated: ${d.records?.length ?? 0} record(s). Print functionality coming soon.`);
            onClose();
        } catch(e: any) { alert((e as any).message); }
        finally { setLoading(false); }
    };

    return (
        <Modal title="Print Material — Cr/Db Report" icon={Printer} onClose={onClose} size="sm"
            footer={<><button onClick={onClose} className="px-4 py-2 rounded border text-sm font-bold text-gray-600 hover:bg-gray-100">Cancel</button><button onClick={run} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded bg-[#FB7506] text-white text-sm font-black disabled:opacity-50">{loading?<RefreshCcw size={13} className="animate-spin"/>:<Printer size={13}/>}{loading?"Running...":"Print"}</button></>}>
            <div className="space-y-3 text-xs">
                {[{v:1,l:"Credit by Products"},{v:2,l:"Direct Credit to A/R"}].map(opt=>(
                    <label key={opt.v} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" checked={option===opt.v} onChange={()=>setOption(opt.v)} className="accent-[#FB7506]"/>
                        <span className="font-semibold text-gray-700">{opt.l}</span>
                    </label>
                ))}
            </div>
        </Modal>
    );
}


export default CrDbReportModal;
