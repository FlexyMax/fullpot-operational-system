"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    ArrowLeft, RefreshCcw, Search, Check, XCircle, Save, X, Trash2,
    Plus, Pencil, AlertCircle, Users, FileText, CreditCard, Menu,
    ChevronRight, Printer, Mail, BarChart2, DollarSign, CheckCircle,
    Bell
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
                        <Btn icon={CreditCard}    label="Insert Cr/Db" color="blue"   onClick={()=>setError("Credits/Debits — Tab 4 (Part 2)")} disabled={!selCustomer||!perms.canCreate}/>
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

            {/* ── TABS 3-6: STUBS (Part 2 & 3) ─────────────────────────────── */}
            {(activeTab === "payments" || activeTab === "crdb" || activeTab === "statement" || activeTab === "corporate") && (
                <div className="flex-1 flex items-center justify-center text-gray-400 text-sm italic">
                    {activeTab === "payments" ? "Customer Payments (Tab 3)" : activeTab === "crdb" ? "Credits / Debits (Tab 4)" : activeTab === "statement" ? "Statement (Tab 5)" : "Corporate Payments (Tab 6)"} — Coming in Part {activeTab === "corporate" ? "3" : "2"}
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
        </div>
    );
}
