"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    ArrowLeft, RefreshCcw, Search, Check, XCircle, Save, X, Trash2,
    Plus, Pencil, AlertCircle, Users, FileText, CreditCard, Menu,
    ChevronRight, Printer, Mail, BarChart2, DollarSign, CheckCircle,
    Bell, Banknote, Calendar, RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuditLog } from "@/lib/audit";
import { AuditLogModal } from "@/components/AuditLogModal";
import { usePagePermissions, PERMISSION_MSGS } from "@/lib/permissions";

const t   = (v: any) => String(v ?? "").trim();
const fmt = (v: any) => parseFloat(v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (v: any) => { if (!v) return ""; const d = new Date(v); return isNaN(d.getTime()) ? t(v) : d.toLocaleDateString("en-US"); };
const today = () => new Date().toISOString().split("T")[0];

const cpFetch = async (url: string) => {
    const r = await fetch(url);
    const j = await r.json();
    if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`);
    return j;
};

// ─── Modal wrapper ─────────────────────────────────────────────────────────────
function Modal({ title, icon: Icon, onClose, children, footer, size = "md", error }: any) {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 sm:p-4">
            <div className={cn("bg-white rounded-t-xl sm:rounded-xl shadow-2xl w-full flex flex-col h-[85vh] sm:h-auto sm:max-h-[88vh]",
                size === "lg" ? "sm:max-w-3xl" : size === "xl" ? "sm:max-w-4xl" : "sm:max-w-lg")}>
                <div className="h-10 bg-[#374151] rounded-t-xl flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-2">
                        {Icon && <Icon size={15} className="text-[#FB7506]"/>}
                        <span className="fos-grid-header-text truncate">{title}</span>
                        {error && <span className="text-amber-400 text-[10px] font-bold ml-2 truncate">{error}</span>}
                    </div>
                    <button onClick={onClose}><XCircle size={16} className="text-gray-400 hover:text-white"/></button>
                </div>
                <div className="overflow-y-auto flex-1 p-4">{children}</div>
                {footer && <div className="flex justify-end gap-2 px-4 py-3 bg-gray-50 border-t rounded-b-xl shrink-0">{footer}</div>}
            </div>
        </div>
    );
}

function Btn({ icon: Icon, label, color = "gray", onClick, disabled = false, size = "sm" }: any) {
    const cls: Record<string, string> = { green: "bg-green-600 hover:bg-green-700", blue: "bg-blue-600 hover:bg-blue-700", red: "bg-red-600 hover:bg-red-700", gray: "bg-gray-600 hover:bg-gray-700", amber: "bg-amber-500 hover:bg-amber-600", orange: "bg-[#FB7506] hover:bg-orange-600" };
    return (
        <button onClick={onClick} disabled={disabled}
            className={cn("flex items-center gap-1.5 px-3 py-1.5 text-xs text-white font-black uppercase tracking-wide rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0", cls[color] || cls.gray)}>
            {Icon && <Icon size={13}/>}{label}
        </button>
    );
}

// ─── CustomerEditModal ─────────────────────────────────────────────────────────
function CustomerEditModal({ customer, onClose, onSaved }: any) {
    const [form,   setForm]   = useState<any>({ ...customer });
    const [saving, setSaving] = useState(false);
    const [error,  setError]  = useState<string|null>(null);

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

// ─── NewPaymentModal ───────────────────────────────────────────────────────────
function NewPaymentModal({ mode, income, customerUq, customerName, onClose, onSaved }: any) {
    const isDelete = mode === "delete";
    const isAdd    = mode === "add";
    const [form,   setForm]   = useState<any>( income ? { ...income, in_date: income.in_date?.split("T")[0] ?? today() } : { in_date: today(), customer_uq: customerUq, type_uq: "", bank_uq: "", in_ammount: 0, bank_doc: "", deposit: 0, card: "", approval: "", details: "" });
    const [saving, setSaving] = useState(false);
    const [error,  setError]  = useState<string|null>(null);

    const { data: banks = [] }     = useQuery({ queryKey: ["cp-banks", mode], queryFn: () => cpFetch(`/api/customer-payments/lookups/banks?mode=${isAdd?"last":"list"}`), staleTime: 60000 });
    const { data: types = [] }     = useQuery({ queryKey: ["cp-inc-types"], queryFn: () => cpFetch("/api/customer-payments/lookups/income-types"), staleTime: 60000 });

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

// ─── ApplyPaymentModal ─────────────────────────────────────────────────────────
function ApplyPaymentModal({ mode, apply, invoice, income, customerName, onClose, onSaved }: any) {
    const isDelete = mode === "delete";
    const isAdd    = mode === "add";
    const [amount, setAmount] = useState<number>(apply?.in_ammount ?? 0);
    const [saving, setSaving] = useState(false);
    const [error,  setError]  = useState<string|null>(null);

    const save = async () => {
        if (!amount) { setError("Amount is empty."); return; }
        setSaving(true); setError(null);
        try {
            let res, d;
            if (isAdd) {
                res = await fetch("/api/customer-payments/apply", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ income_uq: income?.unico, invoice_uq: invoice?.unico, in_ammount: amount }) });
            } else if (isDelete) {
                res = await fetch(`/api/customer-payments/apply/${apply.unico}`, { method: "DELETE" });
            } else {
                res = await fetch(`/api/customer-payments/apply/${apply.unico}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ in_ammount: amount }) });
            }
            d = await res.json();
            if (!d.success) throw new Error(d.error);
            onSaved();
            onClose();
        } catch(e: any) { setError(e.message); }
        finally { setSaving(false); }
    };

    const invBal = parseFloat(invoice?.balance ?? 0);
    const inBal  = parseFloat(income?.in_balance ?? 0);

    return (
        <Modal title={`${isAdd?"Apply":isDelete?"Delete Apply":"Edit Apply"} Payment`} icon={CreditCard} onClose={onClose} size="sm" error={error}
            footer={<><button onClick={onClose} className="px-4 py-2 rounded border text-sm font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
                <button onClick={save} disabled={saving} className={cn("flex items-center gap-2 px-4 py-2 rounded text-white text-sm font-black disabled:opacity-50", isDelete?"bg-red-600 hover:bg-red-700":"bg-[#FB7506] hover:bg-orange-600")}>
                    {saving?<RefreshCcw size={13} className="animate-spin"/>:isDelete?<Trash2 size={13}/>:<Save size={13}/>}{saving?"...":isDelete?"Delete":isAdd?"Apply":"Save"}
                </button></>}>
            <div className="space-y-3 text-xs">
                <div className="bg-gray-50 rounded p-2 grid grid-cols-2 gap-2">
                    {[{l:"Customer",v:customerName},{l:"Invoice No",v:invoice?.invoice_no},{l:"Inv. Date",v:fmtDate(invoice?.arec_date)},{l:"Days",v:invoice?.days},{l:"Due Date",v:fmtDate(invoice?.date_due)},{l:"Invoice Amount",v:fmt(invoice?.ammount)},{l:"Invoice Balance",v:fmt(invBal)},{l:"Income",v:t(income?.dato)},{l:"Income Amount",v:fmt(income?.in_ammount)},{l:"Income Balance",v:fmt(inBal)}].map((f,i)=>(
                        <div key={i} className="flex flex-col gap-0.5">
                            <label className="text-[9px] font-black text-gray-400 uppercase">{f.l}</label>
                            <span className="text-xs font-bold text-gray-700">{f.v}</span>
                        </div>
                    ))}
                </div>
                {!isDelete && (
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-0.5">
                            <label className="text-[9px] font-black text-gray-400 uppercase">Payment Amount *</label>
                            <input type="number" step="0.01" value={amount} onChange={e=>setAmount(parseFloat(e.target.value)||0)} className="fos-input py-1.5 text-sm font-bold" autoFocus/>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <label className="text-[9px] font-black text-gray-400 uppercase">Remaining Balance</label>
                            <input readOnly value={fmt(invBal - amount)} className="fos-input py-1.5 bg-gray-50 text-gray-500 font-bold"/>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}

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

// ─── CashBackModal ────────────────────────────────────────────────────────────
function CashBackModal({ payment, customerName, onClose, onSaved }: any) {
    const [form,   setForm]   = useState({ in_date: today(), in_ammount: 0, details: "" });
    const [saving, setSaving] = useState(false);
    const [error,  setError]  = useState<string|null>(null);
    const maxAmount = parseFloat(payment?.in_balance ?? 0);

    const save = async () => {
        if (!form.in_ammount) { setError("Income amount is empty."); return; }
        if (form.in_ammount > maxAmount) { setError("Income amount is greather to balance."); return; }
        setSaving(true); setError(null);
        try {
            const res = await fetch("/api/customer-payments/cashback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ income_uq: payment.unico, ...form }) });
            const d = await res.json();
            if (!d.success) throw new Error(d.error);
            onSaved(d.unico);
            onClose();
        } catch(e: any) { setError(e.message); }
        finally { setSaving(false); }
    };

    return (
        <Modal title={`Customer Cash Back — ${customerName}`} icon={RotateCcw} onClose={onClose} size="sm" error={error}
            footer={<><button onClick={onClose} className="px-4 py-2 rounded border text-sm font-bold text-gray-600 hover:bg-gray-100">Cancel</button><button onClick={save} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded bg-[#FB7506] text-white text-sm font-black disabled:opacity-50">{saving?<RefreshCcw size={13} className="animate-spin"/>:<Save size={13}/>}{saving?"Saving...":"Create"}</button></>}>
            <div className="space-y-3 text-xs">
                <div className="bg-gray-50 rounded p-2 grid grid-cols-2 gap-2">
                    <div><span className="text-[9px] font-black text-gray-400 uppercase">Source Income: </span><span className="font-bold">{t(payment?.dato||payment?.unico)}</span></div>
                    <div><span className="text-[9px] font-black text-gray-400 uppercase">Income Balance: </span><span className="font-bold text-blue-700">{fmt(maxAmount)}</span></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-0.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase">Date *</label>
                        <input type="date" value={form.in_date} onChange={e=>setForm(p=>({...p,in_date:e.target.value}))} className="fos-input py-1.5"/>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase">Amount * (max {fmt(maxAmount)})</label>
                        <input type="number" step="0.01" max={maxAmount} value={form.in_ammount} onChange={e=>setForm(p=>({...p,in_ammount:parseFloat(e.target.value)||0}))} className="fos-input py-1.5"/>
                    </div>
                </div>
                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Details</label>
                    <textarea value={form.details} onChange={e=>setForm(p=>({...p,details:e.target.value}))} rows={2} className="fos-input py-1 resize-none"/>
                </div>
            </div>
        </Modal>
    );
}

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

    const { data: reasons = [] } = useQuery({ queryKey: ["cp-crdb-reasons"], queryFn: () => cpFetch("/api/customer-payments/lookups/crdb-reasons"), staleTime: 60000 });

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

// ─── SalesmanSelectorModal ────────────────────────────────────────────────────
function SalesmanSelectorModal({ destination, onClose, onConfirm }: any) {
    const [salesmanUq, setSalesmanUq] = useState("");
    const { data: salesmen = [] } = useQuery({ queryKey:["cp-salesmen"], queryFn:()=>cpFetch("/api/customer-payments/lookups/salesmen"), staleTime:60000 });
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

// ─── CutDateModal ─────────────────────────────────────────────────────────────
function CutDateModal({ customerUq, onClose }: any) {
    const [cutDate, setCutDate] = useState(today());
    const [loading, setLoading] = useState(false);
    const run = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/customer-payments/reports/statement-cut", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({customer_uq:customerUq, cut_date:cutDate}) });
            const d = await res.json();
            alert(d.success ? "Statement cut report generated (print coming soon)." : d.error);
            onClose();
        } finally { setLoading(false); }
    };
    return (
        <Modal title="Statement — Cut Date" icon={Calendar} onClose={onClose} size="sm"
            footer={<><button onClick={onClose} className="px-4 py-2 rounded border text-sm font-bold text-gray-600 hover:bg-gray-100">Cancel</button><button onClick={run} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded bg-[#FB7506] text-white text-sm font-black disabled:opacity-50">{loading?<RefreshCcw size={13} className="animate-spin"/>:<Printer size={13}/>}{loading?"...":"Print Cut"}</button></>}>
            <div className="flex flex-col gap-1 text-xs">
                <label className="text-[9px] font-black text-gray-400 uppercase">Cut Off Date</label>
                <input type="date" value={cutDate} onChange={e=>setCutDate(e.target.value)} className="fos-input py-1.5"/>
            </div>
        </Modal>
    );
}

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

// ─── CorpInvoiceModal ─────────────────────────────────────────────────────────
function CorpInvoiceModal({ corpIncome, customerUq, onClose, onSaved }: any) {
    const [invoiceNo,  setInvoiceNo]  = useState("");
    const [inDate,     setInDate]     = useState(today());
    const [inAmount,   setInAmount]   = useState(0);
    const [foundInv,   setFoundInv]   = useState<any>(null);
    const [searching,  setSearching]  = useState(false);
    const [saving,     setSaving]     = useState(false);
    const [error,      setError]      = useState<string|null>(null);
    const { data: types = [] } = useQuery({ queryKey:["cp-inc-types"], queryFn:()=>cpFetch("/api/customer-payments/lookups/income-types"), staleTime:60000 });
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

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function CustomerPaymentsPage() {
    const { data: session, status } = useSession();
    const router  = useRouter();
    const qc      = useQueryClient();
    const { logAction } = useAuditLog("customer-payments", "flower_accounts_income");
    const perms          = usePagePermissions("customer-payments");

    // ── Global state ───────────────────────────────────────────────────────────
    const [activeTab,     setActiveTab]     = useState<"customer"|"invoices"|"payments"|"crdb"|"statement"|"corporate">("customer");
    const [selCustomer,   setSelCustomer]   = useState<any>(null);
    const [custSearch,    setCustSearch]    = useState("");
    const [balanceFilter, setBalanceFilter] = useState(true);    // true=Bal>0
    const [selInvoice,    setSelInvoice]    = useState<any>(null);
    const [selApply,      setSelApply]      = useState<any>(null);
    const [selIncome,     setSelIncome]     = useState<any>(null);
    const [error,         setError]         = useState<string|null>(null);
    const [payingAll,     setPayingAll]     = useState(false);

    // ── Modal state ────────────────────────────────────────────────────────────
    const [custEditModal,    setCustEditModal]    = useState(false);
    const [invSearchModal,   setInvSearchModal]   = useState(false);
    const [newPayModal,      setNewPayModal]       = useState<{mode:"add"|"edit"|"delete";income?:any}|null>(null);
    const [applyModal,       setApplyModal]        = useState<{mode:"add"|"edit"|"delete"}|null>(null);
    const [pendingRptModal,  setPendingRptModal]   = useState(false);
    const [creditModal,      setCreditModal]       = useState(false);
    const [creditCount,      setCreditCount]       = useState(0);
    const [creditRequests,   setCreditRequests]    = useState<any[]>([]);
    // ── Tab 5 state ───────────────────────────────────────────────────────────
    const [stmtFrom,         setStmtFrom]          = useState(() => new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0]);
    const [stmtTo,           setStmtTo]            = useState(today());
    const [stmtDestination,  setStmtDestination]   = useState(1);
    const [salesmanModal,    setSalesmanModal]      = useState(false);
    const [cutDateModal,     setCutDateModal]       = useState(false);
    const [printAllProgress, setPrintAllProgress]  = useState<string|null>(null);
    // ── Tab 6 state ───────────────────────────────────────────────────────────
    const [corpDate,         setCorpDate]           = useState(today());
    const [selCorpIncome,    setSelCorpIncome]      = useState<any>(null);
    const [selCorpPayment,   setSelCorpPayment]     = useState<any>(null);
    const [corpPayModal,     setCorpPayModal]       = useState<{mode:"add"|"edit"|"delete"}|null>(null);
    const [corpInvModal,     setCorpInvModal]       = useState(false);
    // ── Tab 3 state ───────────────────────────────────────────────────────────
    const [selPayment,       setSelPayment]        = useState<any>(null);
    const [cashbackModal,    setCashbackModal]     = useState(false);
    // ── Tab 4 state ───────────────────────────────────────────────────────────
    const [selCrDb,          setSelCrDb]           = useState<any>(null);
    const [selCrDbDate,      setSelCrDbDate]       = useState<string|null>(null);
    const [crdbModal,        setCrdbModal]         = useState<{mode:"add"|"edit"|"delete"}|null>(null);
    const [crdbReportModal,  setCrdbReportModal]   = useState(false);

    useEffect(() => { if (status === "unauthenticated") router.push("/login"); }, [status, router]);

    // ── Queries ────────────────────────────────────────────────────────────────
    const { data: customers = [], isFetching: loadingCust, refetch: refetchCust } = useQuery({
        queryKey: ["cp-customers", custSearch],
        queryFn:  () => cpFetch(`/api/customer-payments/customers?search=${encodeURIComponent(custSearch||"%")}`),
        staleTime: 30000,
    });
    const { data: invoices = [], isFetching: loadingInv, refetch: refetchInv } = useQuery({
        queryKey: ["cp-invoices", selCustomer?.unico, balanceFilter],
        queryFn:  () => cpFetch(`/api/customer-payments/invoices/${selCustomer.unico}?balance=${balanceFilter}`),
        enabled:  !!selCustomer?.unico,
        staleTime: 0,
    });
    const { data: applied = [], isFetching: loadingApplied, refetch: refetchApplied } = useQuery({
        queryKey: ["cp-applied", selInvoice?.unico],
        queryFn:  () => cpFetch(`/api/customer-payments/applied/${selInvoice.unico}`),
        enabled:  !!selInvoice?.unico,
        staleTime: 0,
    });
    const { data: incomes = [], isFetching: loadingIncomes, refetch: refetchIncomes } = useQuery({
        queryKey: ["cp-incomes", selCustomer?.unico],
        queryFn:  () => cpFetch(`/api/customer-payments/incomes/${selCustomer.unico}`),
        enabled:  !!selCustomer?.unico,
        staleTime: 0,
    });

    // ── Tab 3 & 4 queries ─────────────────────────────────────────────────────
    const { data: paymentsHistory = [], isFetching: loadingPay, refetch: refetchPay } = useQuery({
        queryKey: ["cp-pay-hist", selCustomer?.unico],
        queryFn:  () => cpFetch(`/api/customer-payments/payment-history/${selCustomer.unico}`),
        enabled:  !!selCustomer?.unico && activeTab === "payments",
        staleTime: 0,
    });
    const { data: payInvoices = [], isFetching: loadingPayInv } = useQuery({
        queryKey: ["cp-pay-inv", selPayment?.unico],
        queryFn:  () => cpFetch(`/api/customer-payments/payment-invoices/${selPayment.unico}`),
        enabled:  !!selPayment?.unico,
        staleTime: 0,
    });
    const { data: crdbDates = [], isFetching: loadingCrdbDates, refetch: refetchCrdbDates } = useQuery({
        queryKey: ["cp-crdb-dates", selCustomer?.unico],
        queryFn:  () => cpFetch(`/api/customer-payments/crdb-dates/${selCustomer.unico}`),
        enabled:  !!selCustomer?.unico && activeTab === "crdb",
        staleTime: 0,
    });
    const { data: crdbHistory = [], isFetching: loadingCrdb, refetch: refetchCrdb } = useQuery({
        queryKey: ["cp-crdb-hist", selCustomer?.unico, selCrDbDate],
        queryFn:  () => cpFetch(`/api/customer-payments/crdb-history/${selCustomer.unico}?date=${selCrDbDate}`),
        enabled:  !!selCustomer?.unico && !!selCrDbDate && activeTab === "crdb",
        staleTime: 0,
    });

    // ── Tab 5 queries ─────────────────────────────────────────────────────────
    const { data: stmtData = [], isFetching: loadingStmt, refetch: refetchStmt } = useQuery({
        queryKey: ["cp-stmt", selCustomer?.unico, stmtFrom, stmtTo],
        queryFn:  () => cpFetch(`/api/customer-payments/statement/${selCustomer.unico}?from=${stmtFrom}&to=${stmtTo}`),
        enabled:  !!selCustomer?.unico && activeTab === "statement",
        staleTime: 0,
    });
    const { data: stmtBalData = [], isFetching: loadingStmtBal, refetch: refetchStmtBal } = useQuery({
        queryKey: ["cp-stmt-bal", selCustomer?.unico, stmtFrom, stmtTo],
        queryFn:  () => cpFetch(`/api/customer-payments/statement-balance/${selCustomer.unico}?from=${stmtFrom}&to=${stmtTo}`),
        enabled:  !!selCustomer?.unico && activeTab === "statement",
        staleTime: 0,
    });
    // ── Tab 6 queries ─────────────────────────────────────────────────────────
    const { data: corpIncomes = [], isFetching: loadingCorpInc, refetch: refetchCorpInc } = useQuery({
        queryKey: ["cp-corp-inc", corpDate],
        queryFn:  () => cpFetch(`/api/customer-payments/corporate-incomes?date=${corpDate}`),
        enabled:  activeTab === "corporate",
        staleTime: 0,
    });
    const { data: corpPayments = [], isFetching: loadingCorpPay, refetch: refetchCorpPay } = useQuery({
        queryKey: ["cp-corp-pay", selCorpIncome?.unico],
        queryFn:  () => cpFetch(`/api/customer-payments/corporate-payments/${selCorpIncome.unico}`),
        enabled:  !!selCorpIncome?.unico,
        staleTime: 0,
    });
    const { data: corpInvoices = [], isFetching: loadingCorpInv, refetch: refetchCorpInv } = useQuery({
        queryKey: ["cp-corp-inv", selCorpPayment?.unico],
        queryFn:  () => cpFetch(`/api/customer-payments/corporate-invoices/${selCorpPayment.unico}`),
        enabled:  !!selCorpPayment?.unico,
        staleTime: 0,
    });
    useEffect(() => { if ((corpIncomes as any[]).length > 0 && !selCorpIncome) setSelCorpIncome((corpIncomes as any[])[0]); }, [corpIncomes]);
    useEffect(() => { if ((corpPayments as any[]).length > 0 && !selCorpPayment) setSelCorpPayment((corpPayments as any[])[0]); }, [corpPayments]);

    // Auto-select first crdb date
    useEffect(() => {
        if ((crdbDates as any[]).length > 0 && !selCrDbDate) {
            const first = (crdbDates as any[])[0];
            setSelCrDbDate(first.cddate ?? first.cd_date ?? null);
        }
    }, [crdbDates]);

    // Auto-select first payment
    useEffect(() => {
        if ((paymentsHistory as any[]).length > 0 && !selPayment) setSelPayment((paymentsHistory as any[])[0]);
    }, [paymentsHistory]);

    // Auto-select first invoice
    useEffect(() => {
        if ((invoices as any[]).length > 0) setSelInvoice((inv: any) => inv ?? (invoices as any[])[0]);
        else setSelInvoice(null);
    }, [invoices]);

    // Auto-select first applied
    useEffect(() => {
        if ((applied as any[]).length > 0) setSelApply((a: any) => a ?? (applied as any[])[0]);
        else setSelApply(null);
    }, [applied]);

    // ── Credit requests timer (every 5s) ───────────────────────────────────────
    useEffect(() => {
        const poll = async () => {
            try {
                const d = await cpFetch("/api/customer-payments/credit-requests");
                setCreditCount(d.count ?? 0);
                setCreditRequests(d.records ?? []);
            } catch {}
        };
        poll();
        const id = setInterval(poll, 5000);
        return () => clearInterval(id);
    }, []);

    // ── Helpers ────────────────────────────────────────────────────────────────
    const selectCustomer = (c: any) => {
        setSelCustomer(c);
        setSelInvoice(null);
        setSelApply(null);
        setSelIncome(null);
    };

    const refreshAll = () => { refetchCust(); refetchInv(); refetchIncomes(); refetchApplied(); };

    const handlePayAll = async () => {
        if (!selIncome) { setError("Select an income first."); return; }
        if (!selCustomer) { setError("Select a customer first."); return; }
        if (!confirm("Apply this income to all invoices with balance?")) return;
        setPayingAll(true); setError(null);
        try {
            const res = await fetch("/api/customer-payments/pay-all", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ income_uq: selIncome.unico, customer_uq: selCustomer.unico }) });
            const d = await res.json();
            if (!d.success) throw new Error(d.error);
            setError(`✓ ${d.message}`);
            refetchInv(); refetchApplied(); refetchIncomes(); refetchCust();
        } catch(e: any) { setError((e as any).message); }
        finally { setPayingAll(false); }
    };

    const handleInvoiceFound = (inv: any) => {
        const custMatch = (customers as any[]).find((c: any) => c.unico === inv.customer_uq);
        if (custMatch) selectCustomer(custMatch);
        if (parseFloat(inv.total_balance ?? 0) <= 0) setBalanceFilter(false);
        setActiveTab("invoices");
    };

    const totalRow = { payments: (customers as any[]).reduce((s: number, c: any) => s + parseFloat(c.total_incomes||0), 0), balance: (customers as any[]).reduce((s: number, c: any) => s + parseFloat(c.total_books_bal||0), 0) };
    const invTotals = { payments: (invoices as any[]).reduce((s: number, i: any) => s + parseFloat(i.in_ammount||0), 0), credits: (invoices as any[]).reduce((s: number, i: any) => s + parseFloat(i.cre_ammount||0), 0), debits: (invoices as any[]).reduce((s: number, i: any) => s + parseFloat(i.deb_ammount||0), 0), invBal: (invoices as any[]).reduce((s: number, i: any) => s + parseFloat(i.balance||0), 0), booksBal: selCustomer?.total_books_bal ?? 0 };

    const TAB_COLORS: Record<string, string> = { customer:"text-gray-300 hover:text-white", invoices:"text-blue-300 hover:text-blue-100", payments:"text-red-300 hover:text-red-100", crdb:"text-green-300 hover:text-green-100", statement:"text-rose-300 hover:text-rose-100", corporate:"text-gray-300 hover:text-white" };
    const TAB_ACTIVE: Record<string, string> = { customer:"bg-white text-[#FB7506]", invoices:"bg-blue-50 text-blue-700", payments:"bg-red-50 text-red-700", crdb:"bg-green-50 text-green-700", statement:"bg-rose-50 text-rose-700", corporate:"bg-gray-100 text-gray-800" };

    if (status === "loading") return null;

    return (
        <div className="flex flex-col h-screen bg-[#f4f6f8] overflow-hidden font-sans">

            {/* Header */}
            <div className="h-10 bg-[#374151] flex items-center justify-between px-4 shrink-0 text-white">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.push("/menu")} className="hover:bg-white/10 p-1 rounded"><ArrowLeft size={15}/></button>
                    <CreditCard size={13} className="text-[#FB7506]"/>
                    <span className="font-black text-xs uppercase tracking-widest">Customer Payments</span>
                    {selCustomer && <span className="text-[#FB7506] font-bold text-xs ml-2">— {t(selCustomer.customer)}</span>}
                </div>
                <div className="flex items-center gap-2">
                    {/* Approve Credits button with badge */}
                    <button onClick={()=>creditCount>0&&setCreditModal(true)} disabled={creditCount===0}
                        className="relative flex items-center gap-1.5 px-3 py-1.5 bg-green-700 hover:bg-green-600 disabled:opacity-40 text-white text-xs font-black uppercase rounded transition-colors">
                        <Bell size={12}/>Approve Credits
                        {creditCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">{creditCount}</span>}
                    </button>
                    {error && <span className={cn("flex items-center gap-1 text-[9px] font-bold max-w-xs truncate", error.startsWith("✓")?"text-green-400":"text-amber-400")}>
                        {error.startsWith("✓")?<Check size={11}/>:<AlertCircle size={11}/>}{error}
                        <button onClick={()=>setError(null)}><X size={10} className="text-gray-400 hover:text-white"/></button>
                    </span>}
                    <span className="text-gray-400 text-[10px]">User: <span className="text-white">{session?.user?.name}</span></span>
                </div>
            </div>

            {/* Tab bar */}
            <div className="h-9 bg-gray-800 flex items-center px-2 gap-0.5 shrink-0 border-b border-black/20">
                {(["customer","invoices","payments","crdb","statement","corporate"] as const).map(tab => (
                    <button key={tab} onClick={()=>setActiveTab(tab)}
                        className={cn("px-4 h-7 text-[10px] font-black uppercase tracking-wider rounded transition-all",
                            activeTab===tab ? TAB_ACTIVE[tab] : TAB_COLORS[tab])}>
                        {tab==="customer"?"Customer":tab==="invoices"?"Invoices":tab==="payments"?"Customer Payments":tab==="crdb"?"Credits / Debits":tab==="statement"?"Statement":"Corporate Payments"}
                    </button>
                ))}
            </div>

            {/* ── TAB 1: CUSTOMER ───────────────────────────────────────────── */}
            {activeTab === "customer" && (
                <div className="flex flex-col flex-1 overflow-hidden p-1.5 gap-1.5">
                    {/* Toolbar */}
                    <div className="bg-gray-100 border border-gray-200 rounded-lg px-2 py-1.5 flex flex-wrap gap-1 shrink-0">
                        <Btn icon={Pencil}    label="Update"         color="blue"   onClick={()=>{ if(!selCustomer){setError("Select a customer.");return;} if(!perms.canEdit){setError(PERMISSION_MSGS.edit);return;} setCustEditModal(true); }} disabled={!selCustomer||!perms.canEdit}/>
                        <Btn icon={Search}    label="Invoice Search" color="gray"   onClick={()=>setInvSearchModal(true)}/>
                        <Btn icon={AlertCircle} label="Hold No Sales" color="amber" onClick={async()=>{ if(!confirm("Put on hold customers with no sales?"))return; const r=await fetch("/api/customer-payments/hold-no-sales",{method:"POST"}); const d=await r.json(); setError(d.error||"Done."); }}/>
                        <Btn icon={Printer}   label="All Statements" color="gray"   onClick={()=>setError("Statements report — Coming soon")} disabled={!perms.canReport}/>
                        <Btn icon={Mail}      label="Send All"       color="gray"   onClick={()=>setError("Send all statements — Coming soon")} disabled={!perms.canReport}/>
                    </div>
                    {/* Search + grid */}
                    <div className="flex flex-col flex-1 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-0 shrink-0 rounded-t-lg">
                            <div className="flex items-center gap-2">
                                <Users size={15} className="text-[#FB7506]"/>
                                <span className="fos-grid-header-text">Customers</span>
                                {loadingCust && <RefreshCcw size={11} className="text-gray-400 animate-spin"/>}
                                <span className="text-gray-400 text-[10px]">{(customers as any[]).length} records</span>
                            </div>
                            <AuditLogModal recordId={selCustomer?.unico} disabled={!selCustomer}/>
                        </div>
                        <div className="p-1.5 border-b border-gray-100 shrink-0">
                            <div className="relative">
                                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                                <input value={custSearch} onChange={e=>setCustSearch(e.target.value)} placeholder="Search customers..."
                                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-md outline-none focus:ring-1 focus:ring-[#FB7506]"/>
                            </div>
                        </div>
                        <div className="overflow-auto flex-1">
                            <table className="min-w-full text-left">
                                <thead className="bg-gray-100 border-b border-gray-200 text-gray-700 sticky top-0 z-10">
                                    <tr className="fos-grid-thead">
                                        {["Customer","% Margin","Cr. Limit","G.Invoice","T.Credits","T.Debits","N.Invoice","Payments","Apply","Inv-Bal","Unapply","Book-Bal","Stmt By","Hold"].map(h=>(
                                            <th key={h} className="p-2 border-r border-gray-200 last:border-r-0 whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 fos-grid-tbody">
                                    {(customers as any[]).map((c: any) => {
                                        const isSel = selCustomer?.unico === c.unico;
                                        return (
                                            <tr key={c.unico} onDoubleClick={()=>setActiveTab("invoices")} onClick={()=>selectCustomer(c)}
                                                className={cn("cursor-pointer transition-colors", isSel?"!bg-blue-50 ring-1 ring-inset ring-blue-200":"hover:bg-gray-50")}>
                                                <td className="p-2 border-r border-gray-100 font-medium">
                                                    <div className="font-bold text-gray-800">{t(c.cust_code)}</div>
                                                    <div className="text-gray-500 text-[10px]">{t(c.customer)}</div>
                                                </td>
                                                <td className="p-2 border-r border-gray-100 text-right">{fmt(c.price_margin)}%</td>
                                                <td className="p-2 border-r border-gray-100 text-right">{fmt(c.credit_limit)}</td>
                                                <td className="p-2 border-r border-gray-100 text-right">{fmt(c.total_invoice)}</td>
                                                <td className="p-2 border-r border-gray-100 text-right text-green-600">{fmt(c.total_credits)}</td>
                                                <td className="p-2 border-r border-gray-100 text-right text-red-500">{fmt(c.total_debits)}</td>
                                                <td className="p-2 border-r border-gray-100 text-right font-bold">{fmt(c.total_in_cr_db)}</td>
                                                <td className="p-2 border-r border-gray-100 text-right text-blue-700">{fmt(c.total_incomes)}</td>
                                                <td className="p-2 border-r border-gray-100 text-right">{fmt(c.total_payments)}</td>
                                                <td className="p-2 border-r border-gray-100 text-right font-bold text-orange-600">{fmt(c.total_inv_bal)}</td>
                                                <td className="p-2 border-r border-gray-100 text-right">{fmt(c.total_unapply)}</td>
                                                <td className="p-2 border-r border-gray-100 text-right font-bold">{fmt(c.total_books_bal)}</td>
                                                <td className="p-2 border-r border-gray-100 text-gray-500">{t(c.statement_by)}</td>
                                                <td className="p-2 text-center">{c.hold?<span className="text-red-500 font-black text-[9px]">HOLD</span>:"—"}</td>
                                            </tr>
                                        );
                                    })}
                                    {!loadingCust && (customers as any[]).length === 0 && <tr><td colSpan={14} className="p-8 text-center text-gray-400 italic text-xs">No customers found</td></tr>}
                                </tbody>
                                {/* Totals row */}
                                {(customers as any[]).length > 0 && (
                                    <tfoot className="bg-gray-100 border-t-2 border-gray-300 sticky bottom-0">
                                        <tr className="fos-grid-thead text-gray-700">
                                            <td className="p-2 font-black">TOTALS</td>
                                            <td colSpan={6} className="p-2"/>
                                            <td className="p-2 text-right font-black text-blue-700">{fmt(totalRow.payments)}</td>
                                            <td className="p-2"/>
                                            <td className="p-2 text-right font-black text-orange-600">{fmt((customers as any[]).reduce((s:number,c:any)=>s+parseFloat(c.total_inv_bal||0),0))}</td>
                                            <td className="p-2"/>
                                            <td className="p-2 text-right font-black">{fmt(totalRow.balance)}</td>
                                            <td colSpan={2} className="p-2"/>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ── TAB 2: INVOICES ───────────────────────────────────────────── */}
            {activeTab === "invoices" && (
                <div className="flex flex-col flex-1 overflow-hidden p-1.5 gap-1.5">
                    {/* Toolbar */}
                    <div className="bg-gray-100 border border-gray-200 rounded-lg px-2 py-1.5 flex flex-wrap gap-1.5 items-center shrink-0">
                        <Btn icon={RefreshCcw}   label="Refresh"      color="gray"   onClick={refreshAll}/>
                        <Btn icon={Search}        label="Inv. Search"  color="gray"   onClick={()=>setInvSearchModal(true)}/>
                        <Btn icon={Mail}          label="Email"        color="gray"   onClick={()=>setError("Email invoice — Coming soon")} disabled={!selInvoice||!perms.canReport}/>
                        <Btn icon={Printer}       label="Invoice"      color="gray"   onClick={()=>setError("Print invoice — Coming soon")} disabled={!selInvoice||!perms.canReport}/>
                        <Btn icon={BarChart2}     label="Reports"      color="gray"   onClick={()=>setPendingRptModal(true)} disabled={!selCustomer||!perms.canReport}/>
                        <div className="w-px h-5 bg-gray-300"/>
                        <Btn icon={Plus}          label="New Payment"  color="green"  onClick={()=>{ if(!perms.canCreate){setError(PERMISSION_MSGS.create);return;} setNewPayModal({mode:"add"}); }} disabled={!selCustomer||!perms.canCreate}/>
                        <Btn icon={CreditCard}    label="Insert Cr/Db" color="blue"   onClick={()=>{ if(!perms.canCreate){setError(PERMISSION_MSGS.create);return;} if(!selInvoice){setError("Select an invoice first.");return;} setCrdbModal({mode:"add"}); }} disabled={!selCustomer||!selInvoice||!perms.canCreate}/>
                        <div className="w-px h-5 bg-gray-300"/>
                        {/* Balance filter */}
                        <div className="flex items-center gap-2 text-xs font-bold">
                            <label className="flex items-center gap-1 cursor-pointer">
                                <input type="radio" checked={balanceFilter} onChange={()=>setBalanceFilter(true)} className="accent-[#FB7506]"/>
                                <span className={cn(balanceFilter?"text-[#FB7506]":"text-gray-500")}>Bal &gt; 0</span>
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer">
                                <input type="radio" checked={!balanceFilter} onChange={()=>setBalanceFilter(false)} className="accent-[#FB7506]"/>
                                <span className={cn(!balanceFilter?"text-[#FB7506]":"text-gray-500")}>Bal = 0</span>
                            </label>
                        </div>
                    </div>

                    {/* Invoices grid */}
                    <div className="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden" style={{flex:"1 1 55%",minHeight:0}}>
                        <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-0 shrink-0 rounded-t-lg">
                            <div className="flex items-center gap-2">
                                <FileText size={15} className="text-[#FB7506]"/>
                                <span className="fos-grid-header-text">Invoices {selCustomer ? `— ${t(selCustomer.customer)}` : ""}</span>
                                {loadingInv && <RefreshCcw size={11} className="text-gray-400 animate-spin"/>}
                            </div>
                            <AuditLogModal recordId={selInvoice?.unico} disabled={!selInvoice}/>
                        </div>
                        <div className="overflow-auto flex-1">
                            <table className="min-w-full text-left">
                                <thead className="bg-gray-100 border-b border-gray-200 text-gray-700 sticky top-0 z-10">
                                    <tr className="fos-grid-thead">
                                        {["Invoice","Inv.Date","Days","%","Due Date","Amount","Incomes","Credits","Debits","Balance","Void","Acumulative"].map(h=>(
                                            <th key={h} className="p-2 border-r border-gray-200 last:border-r-0 whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 fos-grid-tbody">
                                    {(invoices as any[]).map((inv: any) => {
                                        const isSel     = selInvoice?.unico === inv.unico;
                                        const isVoid    = inv.void;
                                        const isOverdue = !isVoid && parseFloat(inv.balance??0) > 0 && new Date(inv.date_due) < new Date();
                                        return (
                                            <tr key={inv.unico} onClick={()=>setSelInvoice(inv)}
                                                className={cn("cursor-pointer transition-colors",
                                                    isSel ? "!bg-blue-50 ring-1 ring-inset ring-blue-200" : isOverdue ? "bg-red-50 hover:bg-red-100" : "hover:bg-gray-50",
                                                    isVoid && "opacity-45")}>
                                                <td className="p-2 border-r border-gray-100 font-bold text-blue-700">{inv.invoice_no}</td>
                                                <td className="p-2 border-r border-gray-100">{fmtDate(inv.arec_date)}</td>
                                                <td className="p-2 border-r border-gray-100 text-right">{inv.days}</td>
                                                <td className="p-2 border-r border-gray-100 text-right">{inv.percen}</td>
                                                <td className="p-2 border-r border-gray-100">{fmtDate(inv.date_due)}</td>
                                                <td className="p-2 border-r border-gray-100 text-right">{fmt(inv.ammount)}</td>
                                                <td className="p-2 border-r border-gray-100 text-right text-blue-700">{fmt(inv.in_ammount)}</td>
                                                <td className="p-2 border-r border-gray-100 text-right text-green-600">{fmt(inv.cre_ammount)}</td>
                                                <td className="p-2 border-r border-gray-100 text-right text-red-500">{fmt(inv.deb_ammount)}</td>
                                                <td className={cn("p-2 border-r border-gray-100 text-right font-bold", isOverdue?"text-red-600":"text-orange-600")}>{fmt(inv.balance)}</td>
                                                <td className="p-2 border-r border-gray-100 text-center">{isVoid?<Check size={11} className="text-red-400 mx-auto"/>:"—"}</td>
                                                <td className="p-2 text-right">{fmt(inv.acumulative_balance)}</td>
                                            </tr>
                                        );
                                    })}
                                    {!loadingInv && !selCustomer && <tr><td colSpan={12} className="p-8 text-center text-gray-400 italic text-xs">Select a customer in Tab 1</td></tr>}
                                    {!loadingInv && selCustomer && (invoices as any[]).length === 0 && <tr><td colSpan={12} className="p-8 text-center text-gray-400 italic text-xs">No invoices found</td></tr>}
                                </tbody>
                            </table>
                        </div>
                        {/* Totals bar */}
                        <div className="h-8 border-t border-gray-200 bg-gray-50 flex items-center gap-4 px-3 shrink-0 text-xs">
                            {[{l:"Payments",v:invTotals.payments,c:"text-blue-700"},{l:"Credits",v:invTotals.credits,c:"text-green-600"},{l:"Debits",v:invTotals.debits,c:"text-red-500"},{l:"Inv. Balance",v:invTotals.invBal,c:"text-orange-600"},{l:"Books Balance",v:invTotals.booksBal,c:"text-gray-800"}].map(f=>(
                                <div key={f.l} className="flex items-center gap-1"><span className="text-[9px] font-black text-gray-400 uppercase">{f.l}:</span><span className={cn("font-bold",f.c)}>{fmt(f.v)}</span></div>
                            ))}
                        </div>
                    </div>

                    {/* Applied payments + income combo */}
                    <div className="flex gap-1.5 overflow-hidden" style={{flex:"1 1 45%",minHeight:0}}>
                        {/* Applied payments sub-grid */}
                        <div className="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex-1 min-h-0">
                            <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 shrink-0 rounded-t-lg">
                                <div className="flex items-center gap-2">
                                    <DollarSign size={15} className="text-[#FB7506]"/>
                                    <span className="fos-grid-header-text">Applied Payments {selInvoice ? `— Inv. ${selInvoice.invoice_no}` : ""}</span>
                                    {loadingApplied && <RefreshCcw size={11} className="text-gray-400 animate-spin"/>}
                                </div>
                                <div className="flex gap-1">
                                    <Btn icon={Plus}   label="Apply Pay"    color="green" sm onClick={()=>{ if(!selInvoice){setError("Select an invoice.");return;} if(!selIncome){setError("Select an income.");return;} setApplyModal({mode:"add"}); }} disabled={!selInvoice||!selIncome||!perms.canCreate}/>
                                    <Btn icon={Pencil} label="Edit Apply"   color="blue"  sm onClick={()=>{ if(!selApply)return; setApplyModal({mode:"edit"}); }}   disabled={!selApply||!perms.canEdit}/>
                                    <Btn icon={Trash2} label="Delete Apply" color="red"   sm onClick={()=>{ if(!selApply)return; setApplyModal({mode:"delete"}); }} disabled={!selApply||!perms.canDelete}/>
                                </div>
                            </div>
                            <div className="overflow-auto flex-1">
                                <table className="min-w-full text-left">
                                    <thead className="bg-gray-100 border-b border-gray-200 fos-grid-thead text-gray-700 sticky top-0">
                                        <tr><th className="p-2 border-r border-gray-200">Income</th><th className="p-2 text-right">Payment</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 fos-grid-tbody">
                                        {(applied as any[]).map((a: any) => {
                                            const isSel = selApply?.unico === a.unico;
                                            return (
                                                <tr key={a.unico} onClick={()=>setSelApply(a)} className={cn("cursor-pointer transition-colors", isSel?"!bg-blue-50 ring-1 ring-inset ring-blue-200":"hover:bg-gray-50")}>
                                                    <td className="p-2 border-r border-gray-100">{t(a.dato)}</td>
                                                    <td className="p-2 text-right font-bold text-blue-700">{fmt(a.in_ammount)}</td>
                                                </tr>
                                            );
                                        })}
                                        {!loadingApplied && (applied as any[]).length === 0 && <tr><td colSpan={2} className="p-4 text-center text-gray-300 italic text-xs">No payments applied</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Income combo + actions */}
                        <div className="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden w-72 shrink-0">
                            <div className="h-10 bg-[#374151] flex items-center pl-3 shrink-0 rounded-t-lg">
                                <DollarSign size={15} className="text-[#FB7506] mr-2"/>
                                <span className="fos-grid-header-text">Incomes w/ Balance</span>
                            </div>
                            <div className="p-2 flex flex-col gap-2 flex-1">
                                {/* Income list */}
                                <div className="overflow-auto flex-1 border border-gray-200 rounded">
                                    {(incomes as any[]).map((inc: any) => {
                                        const isSel = selIncome?.unico === inc.unico;
                                        return (
                                            <div key={inc.unico} onClick={()=>setSelIncome(inc)}
                                                className={cn("px-2 py-1.5 cursor-pointer border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors", isSel && "!bg-blue-50 font-bold")}>
                                                <div className="text-xs font-medium text-gray-800 truncate">{t(inc.dato)}</div>
                                                <div className="flex justify-between text-[10px]">
                                                    <span className="text-gray-400">{t(inc.bank)}</span>
                                                    <span className="text-blue-700 font-bold">{fmt(inc.in_balance)}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {!loadingIncomes && (incomes as any[]).length === 0 && <div className="p-3 text-center text-gray-300 italic text-xs">No incomes with balance</div>}
                                </div>
                                {/* Actions */}
                                <div className="flex flex-col gap-1 shrink-0">
                                    <button onClick={()=>setActiveTab("payments")} disabled={!selIncome}
                                        className="w-full py-1.5 text-xs font-black uppercase text-center bg-gray-100 hover:bg-gray-200 disabled:opacity-40 rounded border transition-colors">
                                        View Payment
                                    </button>
                                    <button onClick={handlePayAll} disabled={!selIncome||payingAll}
                                        className="w-full py-1.5 text-xs font-black uppercase text-center bg-[#FB7506] hover:bg-orange-600 disabled:opacity-40 text-white rounded transition-colors flex items-center justify-center gap-1.5">
                                        {payingAll?<RefreshCcw size={11} className="animate-spin"/>:<CheckCircle size={11}/>}
                                        {payingAll?"Payment in Progress...":"Pay All Invoices w/ Balance"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── TAB 3: CUSTOMER PAYMENTS ──────────────────────────────────── */}
            {activeTab === "payments" && (
                <div className="flex flex-col flex-1 overflow-hidden p-1.5 gap-1.5">
                    {/* Toolbar */}
                    <div className="bg-gray-100 border border-gray-200 rounded-lg px-2 py-1.5 flex flex-wrap gap-1 shrink-0">
                        <Btn icon={Plus}       label="Add"          color="green"  onClick={()=>{ if(!perms.canCreate){setError(PERMISSION_MSGS.create);return;} setNewPayModal({mode:"add"}); }} disabled={!selCustomer||!perms.canCreate}/>
                        <Btn icon={Pencil}     label="Edit"         color="blue"   onClick={()=>{ if(!selPayment){setError("Payment empty.");return;} setNewPayModal({mode:"edit",income:selPayment}); }} disabled={!selPayment}/>
                        <Btn icon={Trash2}     label="Delete"       color="red"    onClick={()=>{ if(!selPayment){setError("Payment empty.");return;} setNewPayModal({mode:"delete",income:selPayment}); }} disabled={!selPayment}/>
                        <div className="w-px h-5 bg-gray-300"/>
                        <Btn icon={RotateCcw}  label="Void Payment" color="amber"  onClick={async()=>{
                            if(!selPayment){setError("Payment empty.");return;}
                            if(!perms.canEdit){setError(PERMISSION_MSGS.edit);return;}
                            if(!confirm("Do you want to VOID this payment?"))return;
                            try{const r=await fetch(`/api/customer-payments/payment/${selPayment.unico}/void`,{method:"PUT"});const d=await r.json();if(!d.success)throw new Error(d.error);logAction("Edit",selPayment.unico,"Void");setSelPayment(null);refetchPay();refetchInv();refetchIncomes();}catch(e:any){setError((e as any).message);}
                        }} disabled={!selPayment||!perms.canEdit}/>
                        <Btn icon={Printer}    label="Print"        color="gray"   onClick={async()=>{ if(!selPayment){setError("Payment empty.");return;} const d=await cpFetch(`/api/customer-payments/payment/${selPayment.unico}/report`); setError(`Report: ${d.records?.length??0} record(s) — print coming soon.`); }} disabled={!selPayment||!perms.canReport}/>
                        <Btn icon={RotateCcw}  label="Cash Back"    color="purple" onClick={()=>{ if(!selPayment){setError("Payment empty.");return;} setCashbackModal(true); }} disabled={!selPayment||!perms.canCreate}/>
                    </div>
                    {/* Payments grid */}
                    <div className="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden" style={{flex:"1 1 55%",minHeight:0}}>
                        <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-0 shrink-0 rounded-t-lg">
                            <div className="flex items-center gap-2">
                                <DollarSign size={15} className="text-[#FB7506]"/>
                                <span className="fos-grid-header-text">Customer Payments {selCustomer?`— ${t(selCustomer.customer)}`:""}</span>
                                {loadingPay && <RefreshCcw size={11} className="text-gray-400 animate-spin"/>}
                            </div>
                            <AuditLogModal recordId={selPayment?.unico} disabled={!selPayment}/>
                        </div>
                        <div className="overflow-auto flex-1">
                            <table className="min-w-full text-left">
                                <thead className="bg-gray-100 border-b border-gray-200 text-gray-700 sticky top-0 z-10">
                                    <tr className="fos-grid-thead">{["Date","Amount","Applied","Unapplied","Deposit","Check/Doc","Card","Approval","Void"].map(h=><th key={h} className="p-2 border-r border-gray-200 last:border-r-0 whitespace-nowrap">{h}</th>)}</tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 fos-grid-tbody">
                                    {(paymentsHistory as any[]).map((p:any)=>{
                                        const isSel=selPayment?.unico===p.unico;
                                        return <tr key={p.unico} onClick={()=>setSelPayment(p)} className={cn("cursor-pointer transition-colors",isSel?"!bg-blue-50 ring-1 ring-inset ring-blue-200":"hover:bg-gray-50",p.void&&"opacity-45")}>
                                            <td className="p-2 border-r border-gray-100">{fmtDate(p.in_date)}</td>
                                            <td className="p-2 border-r border-gray-100 text-right font-bold">{fmt(p.in_ammount)}</td>
                                            <td className="p-2 border-r border-gray-100 text-right text-blue-700">{fmt(p.in_total)}</td>
                                            <td className="p-2 border-r border-gray-100 text-right text-orange-600">{fmt(p.in_balance)}</td>
                                            <td className="p-2 border-r border-gray-100 text-right">{fmt(p.deposit)}</td>
                                            <td className="p-2 border-r border-gray-100">{t(p.bank_doc)}</td>
                                            <td className="p-2 border-r border-gray-100">{t(p.card)}</td>
                                            <td className="p-2 border-r border-gray-100">{t(p.approval)}</td>
                                            <td className="p-2 text-center">{p.void?<Check size={11} className="text-red-400 mx-auto"/>:"—"}</td>
                                        </tr>;
                                    })}
                                    {!loadingPay && !selCustomer && <tr><td colSpan={9} className="p-8 text-center text-gray-400 italic text-xs">Select a customer in Tab 1</td></tr>}
                                    {!loadingPay && selCustomer && (paymentsHistory as any[]).length===0 && <tr><td colSpan={9} className="p-8 text-center text-gray-400 italic text-xs">No payments found</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {/* Payment invoices sub-grid */}
                    <div className="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden" style={{flex:"1 1 45%",minHeight:0}}>
                        <div className="h-10 bg-[#374151] flex items-center pl-3 shrink-0 rounded-t-lg">
                            <FileText size={15} className="text-[#FB7506] mr-2"/>
                            <span className="fos-grid-header-text">Applied Invoices {selPayment?`— ${fmtDate(selPayment.in_date)}`:""}</span>
                            {loadingPayInv && <RefreshCcw size={11} className="text-gray-400 animate-spin ml-2"/>}
                        </div>
                        <div className="overflow-auto flex-1">
                            <table className="min-w-full text-left">
                                <thead className="bg-gray-100 border-b border-gray-200 fos-grid-thead text-gray-700 sticky top-0 z-10">
                                    <tr>{["Invoice","Date","Due-Date","Amount","Credits","Debits","Payment","T.Payments"].map(h=><th key={h} className="p-2 border-r border-gray-200 last:border-r-0 whitespace-nowrap">{h}</th>)}</tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 fos-grid-tbody">
                                    {(payInvoices as any[]).map((p:any,i:number)=>(
                                        <tr key={i} className="hover:bg-gray-50">
                                            <td className="p-2 border-r border-gray-100 font-bold text-blue-700">{p.invoice_no}</td>
                                            <td className="p-2 border-r border-gray-100">{fmtDate(p.ar_date)}</td>
                                            <td className="p-2 border-r border-gray-100">{fmtDate(p.date_due)}</td>
                                            <td className="p-2 border-r border-gray-100 text-right">{fmt(p.ammount)}</td>
                                            <td className="p-2 border-r border-gray-100 text-right text-green-600">{fmt(p.credits)}</td>
                                            <td className="p-2 border-r border-gray-100 text-right text-red-500">{fmt(p.debits)}</td>
                                            <td className="p-2 border-r border-gray-100 text-right text-blue-700 font-bold">{fmt(p.payment)}</td>
                                            <td className="p-2 text-right">{fmt(p.payments)}</td>
                                        </tr>
                                    ))}
                                    {!loadingPayInv && !selPayment && <tr><td colSpan={8} className="p-4 text-center text-gray-300 italic text-xs">Select a payment</td></tr>}
                                    {!loadingPayInv && selPayment && (payInvoices as any[]).length===0 && <tr><td colSpan={8} className="p-4 text-center text-gray-300 italic text-xs">No invoices applied</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ── TAB 4: CREDITS / DEBITS ───────────────────────────────────── */}
            {activeTab === "crdb" && (
                <div className="flex flex-col flex-1 overflow-hidden p-1.5 gap-1.5">
                    {/* Toolbar */}
                    <div className="bg-gray-100 border border-gray-200 rounded-lg px-2 py-1.5 flex flex-wrap gap-1 shrink-0">
                        <Btn icon={RefreshCcw} label="Refresh"      color="gray"   onClick={()=>{ setSelCrDbDate(null); setSelCrDb(null); refetchCrdbDates(); }}/>
                        <Btn icon={Pencil}     label="Edit Cr/Db"   color="blue"   onClick={()=>{
                            if(!selCustomer){setError("Customer empty.");return;}
                            if(!selCrDb){setError("Document empty.");return;}
                            if(selCrDb.automatic){setError("Automatic Document. You can't edit/delete.");return;}
                            setCrdbModal({mode:"edit"});
                        }} disabled={!selCrDb||!perms.canEdit}/>
                        <Btn icon={Trash2}     label="Delete Cr/Db" color="red"    onClick={()=>{
                            if(!selCustomer){setError("Customer empty.");return;}
                            if(!selCrDb){setError("Document empty.");return;}
                            if(selCrDb.automatic){setError("Automatic Document. You can't edit/delete.");return;}
                            setCrdbModal({mode:"delete"});
                        }} disabled={!selCrDb||!perms.canDelete}/>
                        <Btn icon={Printer}    label="Print Material" color="gray" onClick={()=>{
                            if(!selCrDb){setError("Select a CR/DB record first.");return;}
                            if(!perms.canReport){setError(PERMISSION_MSGS.report);return;}
                            setCrdbReportModal(true);
                        }} disabled={!selCrDb||!perms.canReport}/>
                    </div>
                    {/* Two-column layout */}
                    <div className="flex gap-1.5 flex-1 overflow-hidden min-h-0">
                        {/* Left: Date picker */}
                        <div className="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden w-32 shrink-0">
                            <div className="h-10 bg-[#374151] flex items-center pl-2 shrink-0 rounded-t-lg">
                                <Calendar size={14} className="text-[#FB7506] mr-1.5"/>
                                <span className="fos-grid-header-text text-[10px]">Dates</span>
                                {loadingCrdbDates && <RefreshCcw size={9} className="text-gray-400 animate-spin ml-1"/>}
                            </div>
                            <div className="overflow-auto flex-1">
                                <table className="min-w-full text-left">
                                    <thead className="bg-gray-100 border-b border-gray-200 fos-grid-thead text-gray-700 sticky top-0">
                                        <tr><th className="p-2 border-r border-gray-200">Date</th><th className="p-2 text-right">#</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 fos-grid-tbody">
                                        {(crdbDates as any[]).map((d:any)=>{
                                            const dKey = d.cddate ?? d.cd_date;
                                            const isSel = selCrDbDate === dKey;
                                            return <tr key={dKey} onClick={()=>{setSelCrDbDate(dKey);setSelCrDb(null);}} className={cn("cursor-pointer transition-colors",isSel?"!bg-blue-50 ring-1 ring-inset ring-blue-200":"hover:bg-gray-50")}>
                                                <td className="p-2 border-r border-gray-100 text-[10px]">{fmtDate(d.cd_date||d.cddate)}</td>
                                                <td className="p-2 text-right text-[10px]">{d.records}</td>
                                            </tr>;
                                        })}
                                        {!loadingCrdbDates && !selCustomer && <tr><td colSpan={2} className="p-2 text-center text-gray-300 italic text-[9px]">Select customer</td></tr>}
                                        {!loadingCrdbDates && selCustomer && (crdbDates as any[]).length===0 && <tr><td colSpan={2} className="p-2 text-center text-gray-300 italic text-[9px]">No dates</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        {/* Right: CR/DB History */}
                        <div className="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex-1 min-h-0">
                            <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-0 shrink-0 rounded-t-lg">
                                <div className="flex items-center gap-2">
                                    <Banknote size={15} className="text-[#FB7506]"/>
                                    <span className="fos-grid-header-text">Cr/Db History {selCrDbDate?`— ${fmtDate(selCrDbDate)}`:""}</span>
                                    {loadingCrdb && <RefreshCcw size={11} className="text-gray-400 animate-spin"/>}
                                </div>
                                <AuditLogModal recordId={selCrDb?.unico} disabled={!selCrDb}/>
                            </div>
                            <div className="overflow-auto flex-1">
                                <table className="min-w-full text-left">
                                    <thead className="bg-gray-100 border-b border-gray-200 fos-grid-thead text-gray-700 sticky top-0 z-10">
                                        <tr>{["Type","Invoice","Debits","Credits","OverCredits","Auto","Reason","Details"].map(h=><th key={h} className="p-2 border-r border-gray-200 last:border-r-0 whitespace-nowrap">{h}</th>)}</tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 fos-grid-tbody">
                                        {(crdbHistory as any[]).map((c:any)=>{
                                            const isSel=selCrDb?.unico===c.unico;
                                            return <tr key={c.unico} onClick={()=>setSelCrDb(c)} className={cn("cursor-pointer transition-colors",isSel?"!bg-blue-50 ring-1 ring-inset ring-blue-200":"hover:bg-gray-50")}>
                                                <td className="p-2 border-r border-gray-100"><span className={cn("font-black text-[10px]",c.type==="C"?"text-green-600":"text-red-500")}>{c.type}</span></td>
                                                <td className="p-2 border-r border-gray-100 font-bold text-blue-700">{c.invoice_no}</td>
                                                <td className="p-2 border-r border-gray-100 text-right text-red-500">{c.type==="D"?fmt(c.cd_ammount):"—"}</td>
                                                <td className="p-2 border-r border-gray-100 text-right text-green-600">{c.type==="C"?fmt(c.cd_ammount):"—"}</td>
                                                <td className="p-2 border-r border-gray-100 text-right">{fmt(c.overcredits)}</td>
                                                <td className="p-2 border-r border-gray-100 text-center">{c.automatic?<Check size={11} className="text-blue-400 mx-auto"/>:"—"}</td>
                                                <td className="p-2 border-r border-gray-100">{t(c.reason)}</td>
                                                <td className="p-2">{t(c.details)}</td>
                                            </tr>;
                                        })}
                                        {!loadingCrdb && !selCrDbDate && <tr><td colSpan={8} className="p-8 text-center text-gray-400 italic text-xs">Select a date on the left</td></tr>}
                                        {!loadingCrdb && selCrDbDate && (crdbHistory as any[]).length===0 && <tr><td colSpan={8} className="p-8 text-center text-gray-400 italic text-xs">No records for this date</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── TAB 5: STATEMENT ──────────────────────────────────────────── */}
            {activeTab === "statement" && (
                <div className="flex flex-col flex-1 overflow-hidden p-1.5 gap-1.5">
                    {/* Date filters shared between both grids */}
                    <div className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-1.5 flex flex-wrap items-center gap-3 shrink-0 text-xs">
                        <Btn icon={RefreshCcw} label="Refresh" color="gray" onClick={()=>{refetchStmt();refetchStmtBal();}}/>
                        <div className="flex items-center gap-2">
                            <label className="text-[9px] font-black text-gray-500 uppercase">Start Date</label>
                            <input type="date" value={stmtFrom} onChange={e=>setStmtFrom(e.target.value)} className="fos-input py-1 w-36"/>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-[9px] font-black text-gray-500 uppercase">End Date</label>
                            <input type="date" value={stmtTo} onChange={e=>setStmtTo(e.target.value)} className="fos-input py-1 w-36"/>
                        </div>
                    </div>
                    {/* Statement summary grid */}
                    <div className="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden" style={{flex:"1 1 40%",minHeight:0}}>
                        <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 shrink-0 rounded-t-lg">
                            <div className="flex items-center gap-2"><FileText size={15} className="text-[#FB7506]"/><span className="fos-grid-header-text">Statement {selCustomer?`— ${t(selCustomer.customer)}`:""}</span>{loadingStmt&&<RefreshCcw size={11} className="text-gray-400 animate-spin"/>}</div>
                            <Btn icon={Printer} label="Print" color="gray" sm onClick={()=>setError("Print statement — coming soon")} disabled={!selCustomer||!perms.canReport}/>
                        </div>
                        <div className="overflow-auto flex-1">
                            <table className="min-w-full text-left"><thead className="bg-gray-100 border-b border-gray-200 fos-grid-thead text-gray-700 sticky top-0 z-10"><tr>{["Type","Date","Doc.","Debits","Credits","Balance"].map(h=><th key={h} className="p-2 border-r border-gray-200 last:border-r-0 whitespace-nowrap">{h}</th>)}</tr></thead>
                            <tbody className="divide-y divide-gray-100 fos-grid-tbody">
                                {(stmtData as any[]).map((r:any,i:number)=><tr key={i} className="hover:bg-gray-50"><td className="p-2 border-r border-gray-100 font-bold">{t(r.type)}</td><td className="p-2 border-r border-gray-100">{fmtDate(r.fecha||r.date)}</td><td className="p-2 border-r border-gray-100">{r.invoice_no}</td><td className="p-2 border-r border-gray-100 text-right text-red-500">{fmt(r.debits)}</td><td className="p-2 border-r border-gray-100 text-right text-green-600">{fmt(r.credits)}</td><td className="p-2 text-right font-bold text-orange-600">{fmt(r.balance)}</td></tr>)}
                                {!loadingStmt&&!selCustomer&&<tr><td colSpan={6} className="p-6 text-center text-gray-300 italic text-xs">Select a customer</td></tr>}
                                {!loadingStmt&&selCustomer&&(stmtData as any[]).length===0&&<tr><td colSpan={6} className="p-6 text-center text-gray-300 italic text-xs">No records</td></tr>}
                            </tbody></table>
                        </div>
                    </div>
                    {/* Statement balance grid */}
                    <div className="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden" style={{flex:"1 1 60%",minHeight:0}}>
                        <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 shrink-0 rounded-t-lg">
                            <div className="flex items-center gap-2"><BarChart2 size={15} className="text-[#FB7506]"/><span className="fos-grid-header-text">Statement with Balance</span>{loadingStmtBal&&<RefreshCcw size={11} className="text-gray-400 animate-spin"/>}</div>
                            <div className="flex items-center gap-2">
                                <select value={stmtDestination} onChange={e=>setStmtDestination(parseInt(e.target.value))} className="bg-gray-700 text-white text-[10px] font-bold border-none outline-none rounded px-2 py-0.5">
                                    <option value={1}>PRINT</option><option value={2}>EMAIL</option><option value={3}>FAX</option>
                                </select>
                                <Btn icon={Printer} label="Print"     color="gray"  sm onClick={()=>setError("Print statement balance — coming soon")} disabled={!selCustomer||!perms.canReport}/>
                                <Btn icon={Users}   label="Print All" color="amber" sm onClick={async()=>{ if(!confirm("Print statements for all customers?"))return; setPrintAllProgress("Loading customers..."); try{const d=await cpFetch("/api/customer-payments/reports/all-statements");setPrintAllProgress(`Done: ${d.records?.length??0} statements generated.`);setTimeout(()=>setPrintAllProgress(null),3000);}catch(e:any){setError((e as any).message);setPrintAllProgress(null);} }} disabled={!perms.canReport}/>
                                <Btn icon={Search}  label="By Salesman" color="gray" sm onClick={()=>setSalesmanModal(true)} disabled={!perms.canReport}/>
                                <Btn icon={Calendar} label="Print Cut"  color="gray" sm onClick={()=>setCutDateModal(true)}  disabled={!selCustomer||!perms.canReport}/>
                            </div>
                        </div>
                        {printAllProgress && <div className="h-6 bg-blue-50 border-b border-blue-200 flex items-center px-3 text-xs font-bold text-blue-700 shrink-0"><RefreshCcw size={10} className="animate-spin mr-2"/>{printAllProgress}</div>}
                        <div className="overflow-auto flex-1">
                            <table className="min-w-full text-left"><thead className="bg-gray-100 border-b border-gray-200 fos-grid-thead text-gray-700 sticky top-0 z-10"><tr>{["Type","Date","Doc.","Due Date","Amount","Payments","Debits","Credits","Balance"].map(h=><th key={h} className="p-2 border-r border-gray-200 last:border-r-0 whitespace-nowrap">{h}</th>)}</tr></thead>
                            <tbody className="divide-y divide-gray-100 fos-grid-tbody">
                                {(stmtBalData as any[]).map((r:any,i:number)=><tr key={i} className="hover:bg-gray-50"><td className="p-2 border-r border-gray-100 font-bold">{t(r.type)}</td><td className="p-2 border-r border-gray-100">{fmtDate(r.fecha||r.date)}</td><td className="p-2 border-r border-gray-100">{r.invoice_no}</td><td className="p-2 border-r border-gray-100">{fmtDate(r.due_date)}</td><td className="p-2 border-r border-gray-100 text-right">{fmt(r.ammount)}</td><td className="p-2 border-r border-gray-100 text-right text-blue-700">{fmt(r.payments)}</td><td className="p-2 border-r border-gray-100 text-right text-red-500">{fmt(r.debits)}</td><td className="p-2 border-r border-gray-100 text-right text-green-600">{fmt(r.credits)}</td><td className="p-2 text-right font-bold text-orange-600">{fmt(r.balance)}</td></tr>)}
                                {!loadingStmtBal&&!selCustomer&&<tr><td colSpan={9} className="p-6 text-center text-gray-300 italic text-xs">Select a customer</td></tr>}
                                {!loadingStmtBal&&selCustomer&&(stmtBalData as any[]).length===0&&<tr><td colSpan={9} className="p-6 text-center text-gray-300 italic text-xs">No records</td></tr>}
                            </tbody></table>
                        </div>
                    </div>
                </div>
            )}

            {/* ── TAB 6: CORPORATE PAYMENTS ─────────────────────────────────── */}
            {activeTab === "corporate" && (
                <div className="flex flex-col flex-1 overflow-hidden p-1.5 gap-1.5">
                    {/* Date filter */}
                    <div className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-1.5 flex items-center gap-3 shrink-0 text-xs">
                        <label className="text-[9px] font-black text-gray-500 uppercase">Date</label>
                        <input type="date" value={corpDate} onChange={e=>{ setCorpDate(e.target.value); setSelCorpIncome(null); setSelCorpPayment(null); }} className="fos-input py-1 w-36"/>
                        {loadingCorpInc && <RefreshCcw size={11} className="text-gray-400 animate-spin"/>}
                    </div>
                    {/* Corp Incomes grid */}
                    <div className="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden" style={{flex:"1 1 33%",minHeight:0}}>
                        <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 shrink-0 rounded-t-lg">
                            <div className="flex items-center gap-2"><Banknote size={15} className="text-[#FB7506]"/><span className="fos-grid-header-text">Corp. Payments</span></div>
                            <div className="flex gap-1">
                                <Btn icon={Plus}   label="Add"    color="green" sm onClick={()=>setCorpPayModal({mode:"add"})}    disabled={!perms.canCreate}/>
                                <Btn icon={Pencil} label="Edit"   color="blue"  sm onClick={()=>{ if(!selCorpIncome)return; setCorpPayModal({mode:"edit"}); }}   disabled={!selCorpIncome}/>
                                <Btn icon={Trash2} label="Delete" color="red"   sm onClick={()=>{ if(!selCorpIncome)return; setCorpPayModal({mode:"delete"}); }} disabled={!selCorpIncome}/>
                            </div>
                        </div>
                        <div className="overflow-auto flex-1">
                            <table className="min-w-full text-left"><thead className="bg-gray-100 border-b border-gray-200 fos-grid-thead text-gray-700 sticky top-0 z-10"><tr>{["Date","Customer","Bank-Doc","Amount","Applied","Balance"].map(h=><th key={h} className="p-2 border-r border-gray-200 last:border-r-0 whitespace-nowrap">{h}</th>)}</tr></thead>
                            <tbody className="divide-y divide-gray-100 fos-grid-tbody">
                                {(corpIncomes as any[]).map((c:any)=>{const isSel=selCorpIncome?.unico===c.unico;return<tr key={c.unico} onClick={()=>{setSelCorpIncome(c);setSelCorpPayment(null);}} className={cn("cursor-pointer transition-colors",isSel?"!bg-blue-50 ring-1 ring-inset ring-blue-200":"hover:bg-gray-50")}><td className="p-2 border-r border-gray-100">{fmtDate(c.pay_date)}</td><td className="p-2 border-r border-gray-100 font-bold">{t(c.cust_code)}</td><td className="p-2 border-r border-gray-100">{t(c.bank_doc)}</td><td className="p-2 border-r border-gray-100 text-right font-bold">{fmt(c.pay_amount)}</td><td className="p-2 border-r border-gray-100 text-right text-blue-700">{fmt(c.pay_applied)}</td><td className="p-2 text-right text-orange-600 font-bold">{fmt(c.pay_balance)}</td></tr>;})}
                                {!loadingCorpInc&&(corpIncomes as any[]).length===0&&<tr><td colSpan={6} className="p-6 text-center text-gray-300 italic text-xs">No corporate payments for this date</td></tr>}
                            </tbody></table>
                        </div>
                    </div>
                    {/* Customer Payments (Detallecontrol3) */}
                    <div className="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden" style={{flex:"1 1 33%",minHeight:0}}>
                        <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 shrink-0 rounded-t-lg">
                            <div className="flex items-center gap-2"><DollarSign size={15} className="text-[#FB7506]"/><span className="fos-grid-header-text">Customer Payments {selCorpIncome?`— ${t(selCorpIncome.cust_code)}`:""}</span>{loadingCorpPay&&<RefreshCcw size={11} className="text-gray-400 animate-spin"/>}</div>
                            <div className="flex gap-1">
                                <button disabled title="Coming soon" className="px-2 py-1 text-[10px] text-gray-400 font-black uppercase rounded bg-gray-200 opacity-40 cursor-not-allowed">Add</button>
                                <button disabled title="Coming soon" className="px-2 py-1 text-[10px] text-gray-400 font-black uppercase rounded bg-gray-200 opacity-40 cursor-not-allowed">Edit</button>
                                <button disabled title="Coming soon" className="px-2 py-1 text-[10px] text-gray-400 font-black uppercase rounded bg-gray-200 opacity-40 cursor-not-allowed">Delete</button>
                                <Btn icon={Search} label="View" color="gray" sm onClick={()=>setError(selCorpPayment?"View payment — coming soon":"There isn't a Customer payment note...")} disabled={false}/>
                            </div>
                        </div>
                        <div className="overflow-auto flex-1">
                            <table className="min-w-full text-left"><thead className="bg-gray-100 border-b border-gray-200 fos-grid-thead text-gray-700 sticky top-0 z-10"><tr>{["Date","Customer","Bank-Doc","Payment","Applied","UnApply","Deposit"].map(h=><th key={h} className="p-2 border-r border-gray-200 last:border-r-0 whitespace-nowrap">{h}</th>)}</tr></thead>
                            <tbody className="divide-y divide-gray-100 fos-grid-tbody">
                                {(corpPayments as any[]).map((p:any)=>{const isSel=selCorpPayment?.unico===p.unico;return<tr key={p.unico} onClick={()=>setSelCorpPayment(p)} className={cn("cursor-pointer transition-colors",isSel?"!bg-blue-50 ring-1 ring-inset ring-blue-200":"hover:bg-gray-50")}><td className="p-2 border-r border-gray-100">{fmtDate(p.pay_date)}</td><td className="p-2 border-r border-gray-100 font-bold">{t(p.cust_code)}</td><td className="p-2 border-r border-gray-100">{t(p.bank_doc)}</td><td className="p-2 border-r border-gray-100 text-right font-bold text-blue-700">{fmt(p.payment)}</td><td className="p-2 border-r border-gray-100 text-right">{fmt(p.applied)}</td><td className="p-2 border-r border-gray-100 text-right text-orange-600">{fmt(p.unapply)}</td><td className="p-2 text-right">{fmt(p.deposit)}</td></tr>;})}
                                {!loadingCorpPay&&!selCorpIncome&&<tr><td colSpan={7} className="p-4 text-center text-gray-300 italic text-xs">Select a corporate payment</td></tr>}
                                {!loadingCorpPay&&selCorpIncome&&(corpPayments as any[]).length===0&&<tr><td colSpan={7} className="p-4 text-center text-gray-300 italic text-xs">No customer payments</td></tr>}
                            </tbody></table>
                        </div>
                    </div>
                    {/* Invoice Applied Payments (Detallecontrol2) */}
                    <div className="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden" style={{flex:"1 1 33%",minHeight:0}}>
                        <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 shrink-0 rounded-t-lg">
                            <div className="flex items-center gap-2"><FileText size={15} className="text-[#FB7506]"/><span className="fos-grid-header-text">Invoice Applied Payments</span>{loadingCorpInv&&<RefreshCcw size={11} className="text-gray-400 animate-spin"/>}</div>
                            <div className="flex gap-1">
                                <Btn icon={Plus}   label="Add Invoice"    color="green" sm onClick={()=>{ if(!selCorpIncome){setError("Select a corporate payment.");return;} if(parseFloat(selCorpIncome.pay_balance??0)<=0){setError("Corporate Payment Balance is 0.");return;} setCorpInvModal(true); }} disabled={!selCorpIncome||!perms.canCreate}/>
                                <button disabled title="Coming soon" className="px-2 py-1 text-[10px] text-gray-400 font-black uppercase rounded bg-gray-200 opacity-40 cursor-not-allowed">Edit</button>
                                <Btn icon={Trash2} label="Delete" color="red" sm onClick={()=>setError("Delete corp invoice — coming soon")} disabled={!selCorpPayment}/>
                            </div>
                        </div>
                        <div className="overflow-auto flex-1">
                            <table className="min-w-full text-left"><thead className="bg-gray-100 border-b border-gray-200 fos-grid-thead text-gray-700 sticky top-0 z-10"><tr>{["Date","Customer","Bank-Doc","Applied","Invoice","Due Date"].map(h=><th key={h} className="p-2 border-r border-gray-200 last:border-r-0 whitespace-nowrap">{h}</th>)}</tr></thead>
                            <tbody className="divide-y divide-gray-100 fos-grid-tbody">
                                {(corpInvoices as any[]).map((c:any,i:number)=><tr key={i} className="hover:bg-gray-50"><td className="p-2 border-r border-gray-100">{fmtDate(c.pay_date)}</td><td className="p-2 border-r border-gray-100 font-bold">{t(c.cust_code)}</td><td className="p-2 border-r border-gray-100">{t(c.bank_doc)}</td><td className="p-2 border-r border-gray-100 text-right text-blue-700 font-bold">{fmt(c.in_ammount)}</td><td className="p-2 border-r border-gray-100 font-bold">{c.invoice_no}</td><td className="p-2">{fmtDate(c.date_due)}</td></tr>)}
                                {!loadingCorpInv&&!selCorpPayment&&<tr><td colSpan={6} className="p-4 text-center text-gray-300 italic text-xs">Select a customer payment</td></tr>}
                                {!loadingCorpInv&&selCorpPayment&&(corpInvoices as any[]).length===0&&<tr><td colSpan={6} className="p-4 text-center text-gray-300 italic text-xs">No invoices applied</td></tr>}
                            </tbody></table>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="h-7 bg-gray-100 border-t px-4 flex items-center justify-between text-[9px] font-bold text-gray-500 uppercase tracking-tight shrink-0">
                <div className="flex gap-4"><span>Server: Production</span><span className="text-gray-300">|</span><span>Database: FullPot</span></div>
                <span className="text-[#FB7506]">FOS A/R V.1.0.0</span>
            </div>

            {/* ── Modals ─────────────────────────────────────────────────────── */}
            {custEditModal && selCustomer && (
                <CustomerEditModal customer={selCustomer} onClose={()=>setCustEditModal(false)}
                    onSaved={()=>{ logAction("Edit",selCustomer.unico,"STATEMENT"); refetchCust(); }}/>
            )}
            {invSearchModal && (
                <InvoiceSearchModal onClose={()=>setInvSearchModal(false)} onFound={handleInvoiceFound}/>
            )}
            {newPayModal && selCustomer && (
                <NewPaymentModal mode={newPayModal.mode} income={newPayModal.income} customerUq={selCustomer.unico} customerName={t(selCustomer.customer)}
                    onClose={()=>setNewPayModal(null)}
                    onSaved={(unico: string|null)=>{ if(unico) logAction(newPayModal.mode==="add"?"Insert":"Edit", unico); else logAction("Delete", newPayModal.income?.unico||""); refetchInv(); refetchIncomes(); refetchCust(); }}/>
            )}
            {applyModal && selInvoice && (
                <ApplyPaymentModal mode={applyModal.mode} apply={selApply} invoice={selInvoice} income={selIncome} customerName={t(selCustomer?.customer)}
                    onClose={()=>setApplyModal(null)}
                    onSaved={()=>{ refetchApplied(); refetchInv(); refetchIncomes(); refetchCust(); }}/>
            )}
            {pendingRptModal && selCustomer && (
                <PendingInvoicesReportModal customerUq={selCustomer.unico} onClose={()=>setPendingRptModal(false)}/>
            )}
            {creditModal && creditRequests.length > 0 && (
                <ApproveCreditModal requests={creditRequests} onClose={()=>setCreditModal(false)}
                    onAction={()=>{ logAction("Insert","","CREDIT ACTION"); setCreditModal(false); }}/>
            )}
            {/* ── Part 2 modals ─────────────────────────────────────────────── */}
            {cashbackModal && selPayment && selCustomer && (
                <CashBackModal payment={selPayment} customerName={t(selCustomer.customer)}
                    onClose={()=>setCashbackModal(false)}
                    onSaved={(unico:string)=>{ logAction("Insert",unico,"CashBack"); refetchPay(); refetchIncomes(); refetchCust(); }}/>
            )}
            {crdbModal && selCustomer && (
                <CrDbModal mode={crdbModal.mode} crdb={selCrDb} invoice={selInvoice}
                    customerName={t(selCustomer.customer)} accRecUq={selInvoice?.unico}
                    onClose={()=>setCrdbModal(null)}
                    onSaved={(unico:string)=>{
                        const action = crdbModal.mode==="add"?"Insert":crdbModal.mode==="edit"?"Edit":"Delete";
                        if(action!=="Delete") logAction(action as any, unico);
                        refetchCrdb(); refetchCrdbDates(); refetchInv(); refetchCust();
                        setCrdbModal(null);
                    }}/>
            )}
            {crdbReportModal && selCrDb && (
                <CrDbReportModal invoiceUq={selCrDb.invoice_uq ?? selCrDb.unico} onClose={()=>setCrdbReportModal(false)}/>
            )}
            {/* ── Part 3 modals ─────────────────────────────────────────────── */}
            {salesmanModal && (
                <SalesmanSelectorModal destination={stmtDestination} onClose={()=>setSalesmanModal(false)}
                    onConfirm={async (salesmanUq: string)=>{ setError("Print by salesman — coming soon (print implementation pending)"); }}/>
            )}
            {cutDateModal && selCustomer && (
                <CutDateModal customerUq={selCustomer.unico} onClose={()=>setCutDateModal(false)}/>
            )}
            {corpPayModal && selCustomer && (
                <CorpPaymentModal mode={corpPayModal.mode} income={selCorpIncome}
                    customerName={t(selCustomer.customer)} customerUq={selCustomer.unico}
                    onClose={()=>setCorpPayModal(null)}
                    onSaved={(unico:string)=>{ logAction(corpPayModal.mode==="add"?"Insert":"Edit", unico); refetchCorpInc(); setSelCorpIncome(null); }}/>
            )}
            {corpInvModal && selCorpIncome && (
                <CorpInvoiceModal corpIncome={selCorpIncome} customerUq={selCustomer?.unico ?? ""}
                    onClose={()=>setCorpInvModal(false)}
                    onSaved={(unico:string)=>{ logAction("Insert", unico); refetchCorpInv(); refetchCorpInc(); }}/>
            )}
        </div>
    );
}
