import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { RefreshCcw, Save, Search, Trash2, CheckCircle, Users, FileText, Banknote, RotateCcw, Printer, Check, X, ChevronRight, DollarSign, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal, Btn, t, fmt, fmtDate, today, cpFetch } from "./Shared";

// ─── CustomerEditModal ─────────────────────────────────────────────────────────
function CustomerEditModal({ customer, onClose, onSaved }: any) {
    const { data: detail } = useQuery({
        queryKey: ["cp-customer-detail", customer.unico],
        queryFn:  () => cpFetch(`/api/customer-payments/customers/${customer.unico}`),
        enabled:  !!customer?.unico,
        staleTime: 30000,
    });
    const [form,   setForm]   = useState<any>({ ...customer });
    const [saving, setSaving] = useState(false);
    const [error,  setError]  = useState<string|null>(null);

    useEffect(() => {
        if (detail) setForm((p: any) => ({ ...p, ...detail }));
    }, [detail]);

    const save = async () => {
        setSaving(true); setError(null);
        try {
            const res = await fetch(`/api/customer-payments/customers/${customer.unico}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
            const d = await res.json();
            if (!d.success) throw new Error(d.error);
            onSaved();
            onClose();
        } catch(e: any) { setError(e.message); }
        finally { setSaving(false); }
    };

    const F = (key: string, type: "text"|"number"|"checkbox" = "text") => {
        if (type === "checkbox") return { checked: !!form[key], onChange: (e: any) => setForm((p: any) => ({ ...p, [key]: e.target.checked }) ) };
        if (type === "number")   return { type: "number", value: form[key] ?? 0, onChange: (e: any) => setForm((p: any) => ({ ...p, [key]: parseFloat(e.target.value) || 0 })) };
        return { value: form[key] ?? "", onChange: (e: any) => setForm((p: any) => ({ ...p, [key]: e.target.value })) };
    };

    return (
        <Modal title={`Edit Customer — ${t(customer.customer)}`} icon={Users} onClose={onClose} size="lg" error={error}
            footer={<><button onClick={onClose} className="px-4 py-2 rounded border text-sm font-bold text-gray-600 hover:bg-gray-100">Cancel</button><button onClick={save} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded bg-[#FB7506] hover:bg-orange-600 text-white text-sm font-black disabled:opacity-50">{saving ? <RefreshCcw size={13} className="animate-spin"/> : <Save size={13}/>}{saving ? "Saving..." : "Save"}</button></>}>
            <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Contact info */}
                {[{k:"contact",l:"Contact"},{k:"purchaser",l:"Purchaser"},{k:"address1",l:"Address"},{k:"city",l:"City"},{k:"state",l:"State (2)"},{k:"country",l:"Country"},{k:"phone_1",l:"Phone"},{k:"fax_1",l:"Fax"},{k:"email",l:"E-mail"},{k:"ap_email",l:"AP Email"},{k:"ap_fax",l:"AP Fax"},{k:"statement_by",l:"Statement By"},{k:"resale_tax",l:"Resale Tax"},{k:"reasonhold",l:"Reason Hold"}].map(f => (
                    <div key={f.k} className="flex flex-col gap-0.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase">{f.l}</label>
                        <input {...F(f.k)} className="fos-input py-1"/>
                    </div>
                ))}
                {/* Numeric fields */}
                {[{k:"credit_limit",l:"Credit Limit"},{k:"price_margin",l:"Price Margin %"},{k:"insurance_for",l:"Insurance For"},{k:"discount_percentage",l:"Auth. Disc. %"},{k:"add_credit_limit",l:"Add Credit Limit"}].map(f => (
                    <div key={f.k} className="flex flex-col gap-0.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase">{f.l}</label>
                        <input {...F(f.k, "number")} step="0.01" className="fos-input py-1"/>
                    </div>
                ))}
                {/* Extension */}
                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Extension</label>
                    <input type="number" value={form.extension ?? 0} onChange={e=>setForm((p:any)=>({...p,extension:parseInt(e.target.value)||0}))} className="fos-input py-1"/>
                </div>
                {/* Add CR Exp Date */}
                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Add CR Exp Date</label>
                    <input type="date" value={form.add_cr_exp_date?.split("T")[0] ?? ""} onChange={e=>setForm((p:any)=>({...p,add_cr_exp_date:e.target.value}))} className="fos-input py-1"/>
                </div>
                {/* Credit card */}
                {[{k:"ccard_name",l:"CC Name"},{k:"ccard_on_file",l:"CC On File"},{k:"ccard_expiration_month",l:"CC Exp Month"},{k:"ccard_expiration_year",l:"CC Exp Year"}].map(f => (
                    <div key={f.k} className="flex flex-col gap-0.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase">{f.l}</label>
                        <input {...F(f.k)} className="fos-input py-1"/>
                    </div>
                ))}
                {/* Readonly */}
                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Credit Available</label>
                    <input readOnly value={fmt(customer.credit_available)} className="fos-input py-1 bg-gray-50 text-gray-500 font-bold"/>
                </div>
                {/* Checkboxes */}
                <div className="col-span-2 flex flex-wrap gap-4 border-t pt-2">
                    {[{k:"credithold",l:"Credit Hold"},{k:"active",l:"Active"},{k:"auto_charge",l:"Auto Charges"}].map(f => (
                        <label key={f.k} className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" {...F(f.k,"checkbox")} className="w-4 h-4 accent-[#FB7506]"/>
                            <span className="text-xs font-semibold text-gray-600">{f.l}</span>
                        </label>
                    ))}
                </div>
            </div>
        </Modal>
    );
}


export default CustomerEditModal;
