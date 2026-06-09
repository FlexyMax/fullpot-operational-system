import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { RefreshCcw, Save, Search, Trash2, CheckCircle, Users, FileText, Banknote, RotateCcw, Printer, Check, X, ChevronRight, DollarSign, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal, Btn, t, fmt, fmtDate, today, cpFetch } from "./Shared";

// ─── InvoiceSearchModal ────────────────────────────────────────────────────────
function InvoiceSearchModal({ onFound, onClose }: any) {
    const [invoiceNo, setInvoiceNo] = useState("");
    const [loading,   setLoading]   = useState(false);
    const [message,   setMessage]   = useState<string|null>(null);

    const search = async () => {
        if (!invoiceNo.trim()) { setMessage("Search criteria is empty."); return; }
        setLoading(true); setMessage(null);
        try {
            const d = await cpFetch(`/api/customer-payments/invoice-search?q=${invoiceNo}`);
            if (!d.found) { setMessage(d.message); return; }
            if (d.voided) { setMessage(d.message); return; }
            onFound(d.invoice);
            onClose();
        } catch(e: any) { setMessage(e.message); }
        finally { setLoading(false); }
    };

    return (
        <Modal title="Invoice Search" icon={Search} onClose={onClose} size="sm"
            footer={<><button onClick={onClose} className="px-4 py-2 rounded border text-sm font-bold text-gray-600 hover:bg-gray-100">Cancel</button><button onClick={search} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded bg-[#FB7506] text-white text-sm font-black disabled:opacity-50">{loading?<RefreshCcw size={13} className="animate-spin"/>:<Search size={13}/>}Search</button></>}>
            <div className="space-y-3">
                <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Invoice No.</label>
                    <input type="number" value={invoiceNo} onChange={e=>setInvoiceNo(e.target.value)} onKeyDown={e=>e.key==="Enter"&&search()} placeholder="Enter invoice number..." className="fos-input py-2 text-sm" autoFocus/>
                </div>
                {message && <p className="text-sm font-bold text-amber-600">{message}</p>}
            </div>
        </Modal>
    );
}


export default InvoiceSearchModal;
