import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { RefreshCcw, Save, Search, Trash2, CheckCircle, Users, FileText, Banknote, RotateCcw, Printer, Check, X, ChevronRight, DollarSign, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal, Btn, t, fmt, fmtDate, today, cpFetch, EMPTY_ARR } from "./Shared";

// ─── SalesmanSelectorModal ────────────────────────────────────────────────────
function SalesmanSelectorModal({ destination, onClose, onConfirm }: any) {
    const [salesmanUq, setSalesmanUq] = useState("");
    const { data: salesmen = EMPTY_ARR } = useQuery({ queryKey:["cp-salesmen"], queryFn:()=>cpFetch("/api/customer-payments/lookups/salesmen"), staleTime:60000 });
    return (
        <Modal title="Print by Salesman" icon={Users} onClose={onClose} size="sm"
            footer={<><button onClick={onClose} className="px-4 py-2 rounded border text-sm font-bold text-gray-600 hover:bg-gray-100">Cancel</button><button onClick={()=>{ if(!salesmanUq){return;} onConfirm(salesmanUq); onClose(); }} disabled={!salesmanUq} className="flex items-center gap-2 px-4 py-2 rounded bg-[#FB7506] text-white text-sm font-black disabled:opacity-50"><Printer size={13}/>Print</button></>}>
            <div className="space-y-3 text-xs">
                <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Salesman</label>
                    <select value={salesmanUq} onChange={e=>setSalesmanUq(e.target.value)} className="fos-input py-1.5">
                        <option value="">— Select —</option>
                        {(salesmen as any[]).map((s:any)=><option key={s.unico} value={s.unico}>{t(s.salesman_name)}</option>)}
                    </select>
                </div>
                <p className="text-gray-400 text-[10px] italic">Destination: {destination===1?"PRINT":destination===2?"EMAIL":"FAX"}</p>
            </div>
        </Modal>
    );
}


export default SalesmanSelectorModal;
