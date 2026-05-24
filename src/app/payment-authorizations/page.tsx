"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    ArrowLeft, RefreshCcw, XCircle, Loader2,
    DollarSign, FileText, Users, CreditCard,
    Plus, Pencil, Trash2, Check, CheckCheck,
    Printer, BarChart2, Calendar, Building2,
    ChevronDown, AlertCircle,
} from "lucide-react";
import { GridMenu } from "@/components/GridMenu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuditLog } from "@/lib/audit";
import { usePagePermissions, PERMISSION_MSGS } from "@/lib/permissions";
import { usePaymentAuthorizationsStore } from "@/store/usePaymentAuthorizationsStore";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const t       = (v: any) => String(v ?? "").trim();
const fmt     = (v: any) => parseFloat(v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (v: any) => { if (!v) return ""; const d = new Date(v); return isNaN(d.getTime()) ? t(v) : d.toLocaleDateString("en-US"); };
const today   = () => new Date().toISOString().split("T")[0];
const norm    = (rows: any[]) => rows.map(r => { const n: any = {}; for (const [k, v] of Object.entries(r)) n[k.toUpperCase()] = v; return n; });

const paFetch = async (url: string) => {
    const r = await fetch(url);
    const j = await r.json();
    if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`);
    return j;
};

const toastConfirm = (msg: string, onConfirm: () => void) => {
    toast(msg, {
        duration: 10000,
        action:  { label: "Confirm", onClick: onConfirm },
        cancel:  { label: "Cancel",  onClick: () => {} },
    });
};

// ─── Modal wrapper ─────────────────────────────────────────────────────────────
function Modal({ title, icon: Icon, onClose, children, footer, size = "md" }: any) {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 sm:p-4">
            <div className={cn(
                "bg-white rounded-t-xl sm:rounded-xl shadow-2xl w-full flex flex-col h-[85vh] sm:h-auto sm:max-h-[88vh]",
                size === "sm"  ? "sm:max-w-lg"  :
                size === "lg"  ? "sm:max-w-3xl" :
                size === "xl"  ? "sm:max-w-5xl" : "sm:max-w-2xl"
            )}>
                <div className="h-10 bg-[#374151] rounded-t-xl flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-2">
                        {Icon && <Icon size={15} className="text-[#FB7506]"/>}
                        <span className="fos-grid-header-text truncate">{title}</span>
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
    const cls: Record<string, string> = {
        green:  "bg-green-600 hover:bg-green-700",
        blue:   "bg-blue-600 hover:bg-blue-700",
        red:    "bg-red-600 hover:bg-red-700",
        gray:   "bg-gray-600 hover:bg-gray-700",
        amber:  "bg-amber-500 hover:bg-amber-600",
        orange: "bg-[#FB7506] hover:bg-orange-600",
        teal:   "bg-teal-600 hover:bg-teal-700",
        purple: "bg-purple-600 hover:bg-purple-700",
    } as Record<string, string>;
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "inline-flex items-center gap-1.5 text-white font-semibold rounded px-2 py-1 text-[11px] transition-colors",
                cls[color] ?? cls.gray,
                disabled && "opacity-40 cursor-not-allowed pointer-events-none"
            )}
        >
            {Icon && <Icon size={12}/>}
            {label}
        </button>
    );
}

// ─── ModalReports ─────────────────────────────────────────────────────────────
function ModalReports({ growers, defaultGrower, onClose }: { growers: any[]; defaultGrower: string; onClose: () => void }) {
    const [option,    setOption]    = useState<"pending" | "summary">("pending");
    const [growerUq,  setGrowerUq]  = useState(defaultGrower);
    const [dateFrom,  setDateFrom]  = useState(today());
    const [dateTo,    setDateTo]    = useState(today());
    const [loading,   setLoading]   = useState(false);
    const [results,   setResults]   = useState<any[]>([]);

    const generate = async () => {
        setLoading(true);
        try {
            let url = "";
            if (option === "pending") {
                url = `/api/payment-authorizations/reports/pending?grower_uq=${encodeURIComponent(growerUq)}&date_from=${dateFrom}&date_to=${dateTo}`;
            } else {
                url = `/api/payment-authorizations/reports/summary?grower_uq=${encodeURIComponent(growerUq)}&ldfrom=${dateFrom}&ldto=${dateTo}&lnoption=1`;
            }
            const data = await paFetch(url);
            setResults(norm(Array.isArray(data) ? data : []));
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setLoading(false);
        }
    };

    const cols = results.length > 0 ? Object.keys(results[0]) : [];

    return (
        <Modal title="Vendor's Reports" icon={Printer} onClose={onClose} size="xl"
            footer={<button onClick={onClose} className="px-4 py-2 rounded border text-sm font-bold text-gray-600 hover:bg-gray-100">Close</button>}>
            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Report Type</label>
                        <div className="flex gap-3">
                            {(["pending", "summary"] as const).map(o => (
                                <label key={o} className="flex items-center gap-1.5 text-xs cursor-pointer">
                                    <input type="radio" checked={option === o} onChange={() => setOption(o)} className="accent-orange-500"/>
                                    {o === "pending" ? "Pending Invoices" : "AP Summary"}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Vendor</label>
                        <select value={growerUq} onChange={e => setGrowerUq(e.target.value)} className="border rounded px-2 py-1 text-xs">
                            <option value="">— All —</option>
                            {growers.map((g: any) => <option key={t(g.UNICO)} value={t(g.UNICO)}>{t(g.GROWER ?? g.SUPPLIER ?? g.NAME)}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Invoice From</label>
                        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="border rounded px-2 py-1 text-xs"/>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Invoice To</label>
                        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="border rounded px-2 py-1 text-xs"/>
                    </div>
                    <Btn icon={Printer} label="Generate Report" color="orange" onClick={generate} disabled={loading}/>
                </div>
                {loading && <div className="flex items-center gap-2 text-gray-400 text-xs"><Loader2 size={14} className="animate-spin"/>Generating…</div>}
                {results.length > 0 && (
                    <div className="overflow-auto">
                        <table className="min-w-full text-xs">
                            <thead className="bg-[#374151] text-white sticky top-0">
                                <tr>{cols.map(c => <th key={c} className="p-2 border-r border-gray-600 last:border-r-0 whitespace-nowrap">{c}</th>)}</tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {results.map((row, i) => (
                                    <tr key={i} className="hover:bg-gray-50">
                                        {cols.map(c => <td key={c} className="p-2 border-r border-gray-100 last:border-r-0 whitespace-nowrap">{t(row[c])}</td>)}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </Modal>
    );
}

// ─── ModalPaymentsReport ──────────────────────────────────────────────────────
function ModalPaymentsReport({ growers, defaultGrower, onClose }: { growers: any[]; defaultGrower: string; onClose: () => void }) {
    const [growerUq,  setGrowerUq]  = useState(defaultGrower);
    const [dateFrom,  setDateFrom]  = useState(today());
    const [dateTo,    setDateTo]    = useState(today());
    const [loading,   setLoading]   = useState(false);
    const [results,   setResults]   = useState<any[]>([]);

    const generate = async () => {
        setLoading(true);
        try {
            const url = `/api/payment-authorizations/reports/payments?grower_uq=${encodeURIComponent(growerUq)}&payments_from=${dateFrom}&payments_to=${dateTo}`;
            const data = await paFetch(url);
            setResults(norm(Array.isArray(data) ? data : []));
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal title="Payments Report" icon={DollarSign} onClose={onClose} size="xl"
            footer={<button onClick={onClose} className="px-4 py-2 rounded border text-sm font-bold text-gray-600 hover:bg-gray-100">Close</button>}>
            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Vendor</label>
                        <select value={growerUq} onChange={e => setGrowerUq(e.target.value)} className="border rounded px-2 py-1 text-xs">
                            <option value="">— All —</option>
                            {growers.map((g: any) => <option key={t(g.UNICO)} value={t(g.UNICO)}>{t(g.GROWER ?? g.SUPPLIER ?? g.NAME)}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Date From</label>
                        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="border rounded px-2 py-1 text-xs"/>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Date To</label>
                        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="border rounded px-2 py-1 text-xs"/>
                    </div>
                    <Btn icon={Printer} label="Generate" color="orange" onClick={generate} disabled={loading}/>
                </div>
                {loading && <div className="flex items-center gap-2 text-gray-400 text-xs"><Loader2 size={14} className="animate-spin"/>Loading…</div>}
                {results.length > 0 && (
                    <div className="overflow-auto">
                        <table className="min-w-full text-xs">
                            <thead className="bg-[#374151] text-white sticky top-0">
                                <tr>{["OUT_DATE","OUT_DOCUMENT","STATUS","BANK","GROWER","FARM","TOTAL_PAYMENT"].map(c => (
                                    <th key={c} className="p-2 border-r border-gray-600 last:border-r-0 whitespace-nowrap">{c}</th>
                                ))}</tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {results.map((row, i) => (
                                    <tr key={i} className="hover:bg-gray-50">
                                        {["OUT_DATE","OUT_DOCUMENT","STATUS","BANK","GROWER","FARM","TOTAL_PAYMENT"].map(c => (
                                            <td key={c} className="p-2 border-r border-gray-100 last:border-r-0 whitespace-nowrap">
                                                {c.includes("DATE") ? fmtDate(row[c]) : c === "TOTAL_PAYMENT" ? fmt(row[c]) : t(row[c])}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </Modal>
    );
}

// ─── ModalDateToHistory ───────────────────────────────────────────────────────
function ModalDateToHistory({ onClose }: { onClose: () => void }) {
    const [dateFrom, setDateFrom] = useState(today());
    const [dateTo,   setDateTo]   = useState(today());
    const [balance,  setBalance]  = useState<"zero" | "nonzero" | "all">("all");

    const handleOk = () => {
        toast.info("History move functionality requires server-side configuration. Date range selected: " + dateFrom + " – " + dateTo);
        onClose();
    };

    return (
        <Modal title="Select Date / Move to History" icon={Calendar} onClose={onClose} size="sm"
            footer={
                <>
                    <button onClick={onClose} className="px-4 py-2 rounded border text-sm font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
                    <button onClick={handleOk} className="px-4 py-2 rounded bg-[#FB7506] text-white text-sm font-bold hover:bg-orange-600">OK</button>
                </>
            }>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Invoice Date From</label>
                    <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="border rounded px-2 py-1 text-sm w-full"/>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Invoice Date To</label>
                    <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="border rounded px-2 py-1 text-sm w-full"/>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Balance Filter</label>
                    <div className="flex gap-4">
                        {(["zero","nonzero","all"] as const).map(b => (
                            <label key={b} className="flex items-center gap-1.5 text-xs cursor-pointer">
                                <input type="radio" checked={balance === b} onChange={() => setBalance(b)} className="accent-orange-500"/>
                                {b === "zero" ? "Equal 0" : b === "nonzero" ? "<> 0" : "All"}
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    );
}

// ─── ModalPaymentDate ─────────────────────────────────────────────────────────
function ModalPaymentDate({ growers, defaultGrower, onClose, logAction }: any) {
    const [growerUq,     setGrowerUq]     = useState(defaultGrower);
    const [paymentDate,  setPaymentDate]  = useState(today());
    const [invoices,     setInvoices]     = useState<any[]>([]);
    const [selInvoices,  setSelInvoices]  = useState<Set<string>>(new Set());
    const [loading,      setLoading]      = useState(false);
    const [saving,       setSaving]       = useState(false);

    const loadInvoices = useCallback(async () => {
        if (!growerUq) return;
        setLoading(true);
        try {
            const data = await paFetch(`/api/payment-authorizations/invoices?supplier_uq=${encodeURIComponent(growerUq)}&balance=pos`);
            setInvoices(norm(Array.isArray(data) ? data : []));
        } catch (e: any) {
            toast.error(e.message);
        } finally { setLoading(false); }
    }, [growerUq]);

    useEffect(() => { loadInvoices(); }, [loadInvoices]);

    const toggleAll = () => {
        if (selInvoices.size === invoices.length) setSelInvoices(new Set());
        else setSelInvoices(new Set(invoices.map(r => t(r.ACC_PAY_UQ))));
    };

    const toggleOne = (uq: string) => {
        const s = new Set(selInvoices);
        s.has(uq) ? s.delete(uq) : s.add(uq);
        setSelInvoices(s);
    };

    const handleSave = async () => {
        if (selInvoices.size === 0) { toast.warning("Select at least one invoice."); return; }
        setSaving(true);
        try {
            // sp_flower_accounts_pay_update_payment_date is NOT FOUND in this database.
            // Notify user and log the attempt.
            toast.error("sp_flower_accounts_pay_update_payment_date is not available in this database. Contact your DBA.");
        } finally { setSaving(false); }
    };

    return (
        <Modal title="Check Payment Date" icon={Calendar} onClose={onClose} size="lg"
            footer={
                <>
                    <button onClick={onClose} className="px-4 py-2 rounded border text-sm font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
                    <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded bg-[#FB7506] text-white text-sm font-bold hover:bg-orange-600 disabled:opacity-50">
                        {saving ? "Saving…" : "Save"}
                    </button>
                </>
            }>
            <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-3 items-end">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Vendor</label>
                        <select value={growerUq} onChange={e => { setGrowerUq(e.target.value); setSelInvoices(new Set()); }} className="border rounded px-2 py-1 text-xs">
                            <option value="">— Select —</option>
                            {growers.map((g: any) => <option key={t(g.UNICO)} value={t(g.UNICO)}>{t(g.GROWER ?? g.SUPPLIER)}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Payment Date</label>
                        <input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} className="border rounded px-2 py-1 text-xs"/>
                    </div>
                    <Btn icon={CheckCheck} label="Check All" color="blue" onClick={toggleAll}/>
                </div>
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded p-2 text-[11px] text-amber-700">
                    <AlertCircle size={12}/>
                    The update SP for payment date is not available in this database. Selection is for reference only.
                </div>
                {loading && <div className="flex items-center gap-2 text-gray-400 text-xs"><Loader2 size={14} className="animate-spin"/>Loading…</div>}
                {invoices.length > 0 && (
                    <div className="overflow-auto max-h-64">
                        <table className="min-w-full text-xs">
                            <thead className="bg-[#374151] text-white sticky top-0">
                                <tr>
                                    <th className="p-2 w-8"></th>
                                    {["Vendor","Invoice","AP_DATE","DATE_DUE","DAYS","AMMOUNT","BALANCE"].map(h => (
                                        <th key={h} className="p-2 border-r border-gray-600 last:border-r-0 whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {invoices.map(row => {
                                    const uq = t(row.ACC_PAY_UQ);
                                    return (
                                        <tr key={uq} className={cn("cursor-pointer hover:bg-orange-50", selInvoices.has(uq) && "bg-orange-100")} onClick={() => toggleOne(uq)}>
                                            <td className="p-2 text-center"><input type="checkbox" readOnly checked={selInvoices.has(uq)} className="accent-orange-500"/></td>
                                            <td className="p-2 border-r border-gray-100 whitespace-nowrap">{t(row.SUPPLIER_UQ)}</td>
                                            <td className="p-2 border-r border-gray-100 whitespace-nowrap">{t(row.INVOICE_NO)}</td>
                                            <td className="p-2 border-r border-gray-100 whitespace-nowrap">{fmtDate(row.AP_DATE)}</td>
                                            <td className="p-2 border-r border-gray-100 whitespace-nowrap">{fmtDate(row.DATE_DUE)}</td>
                                            <td className="p-2 border-r border-gray-100 whitespace-nowrap text-right">{t(row.DAYS)}</td>
                                            <td className="p-2 border-r border-gray-100 whitespace-nowrap text-right">{fmt(row.AMMOUNT)}</td>
                                            <td className="p-2 whitespace-nowrap text-right">{fmt(row.BALANCE)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </Modal>
    );
}

// ─── ModalAddPayment ──────────────────────────────────────────────────────────
function ModalAddPayment({ banks, supplierUq, onClose, onSaved }: any) {
    const [bankUq,     setBankUq]     = useState("");
    const [amount,     setAmount]     = useState("0.00");
    const [total,      setTotal]      = useState("0.00");
    const [details,    setDetails]    = useState("");
    const [payDoc,     setPayDoc]     = useState("0");
    const [saving,     setSaving]     = useState(false);

    const handleSave = async () => {
        if (!bankUq)      { toast.warning("Select a bank.");  return; }
        if (!supplierUq)  { toast.warning("No vendor selected."); return; }
        setSaving(true);
        try {
            const res = await fetch("/api/payment-authorizations/outcomes/insert", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    bank_uq:     bankUq,
                    supplier_uq: supplierUq,
                    out_ammount: parseFloat(amount) || 0,
                    out_total:   parseFloat(total)  || 0,
                    details,
                    pay_doc:     parseInt(payDoc)   || 0,
                }),
            });
            const d = await res.json();
            if (!d.success) throw new Error(d.error);
            toast.success("Payment created.");
            onSaved(d.data);
        } catch (e: any) {
            toast.error(e.message);
        } finally { setSaving(false); }
    };

    return (
        <Modal title="Payment Authorization" icon={DollarSign} onClose={onClose} size="sm"
            footer={
                <>
                    <button onClick={onClose} className="px-4 py-2 rounded border text-sm font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
                    <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded bg-green-600 text-white text-sm font-bold hover:bg-green-700 disabled:opacity-50">
                        {saving ? "Saving…" : "OK"}
                    </button>
                </>
            }>
            <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Bank</label>
                    <select value={bankUq} onChange={e => setBankUq(e.target.value)} className="border rounded px-2 py-1 text-sm">
                        <option value="">— Select Bank —</option>
                        {banks.map((b: any) => <option key={t(b.UNICO)} value={t(b.UNICO)}>{t(b.BANK)}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Amount</label>
                    <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="border rounded px-2 py-1 text-sm text-right"/>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Total</label>
                    <input type="number" step="0.01" value={total} onChange={e => setTotal(e.target.value)} className="border rounded px-2 py-1 text-sm text-right"/>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Pay Doc #</label>
                    <input type="number" value={payDoc} onChange={e => setPayDoc(e.target.value)} className="border rounded px-2 py-1 text-sm text-right"/>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Details</label>
                    <input type="text" value={details} onChange={e => setDetails(e.target.value)} maxLength={100} className="border rounded px-2 py-1 text-sm"/>
                </div>
            </div>
        </Modal>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PaymentAuthorizationsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const qc     = useQueryClient();
    const { logAction } = useAuditLog("payment-authorizations", "flower_accounts_outcome");
    const perms  = usePagePermissions("payment-authorizations");

    const store = usePaymentAuthorizationsStore();

    // ── Local UI state ────────────────────────────────────────────────────
    const [activeTab,           setActiveTab]           = useState<"vendors" | "invoices" | "payments">("vendors");
    const [selectedBankUq,      setSelectedBankUq]      = useState("");
    const [vendorSearch,        setVendorSearch]        = useState("");
    const [quarterDetailModal,  setQuarterDetailModal]  = useState(false);
    const [quarterDetail,       setQuarterDetail]       = useState<any[]>([]);
    const [loadingQDetail,      setLoadingQDetail]      = useState(false);

    // Row selections
    const [selVendorRow,        setSelVendorRow]        = useState<any>(null);
    const [selInvoiceRow,       setSelInvoiceRow]       = useState<any>(null);
    const [selOutcomeRow,       setSelOutcomeRow]       = useState<any>(null);
    const [selDetailRow,        setSelDetailRow]        = useState<any>(null);
    const [selPayInvRow,        setSelPayInvRow]        = useState<any>(null);

    // Modals
    const [reportsModal,        setReportsModal]        = useState(false);
    const [paymentsReportModal, setPaymentsReportModal] = useState(false);
    const [dateHistoryModal,    setDateHistoryModal]    = useState(false);
    const [paymentDateModal,    setPaymentDateModal]    = useState(false);
    const [addPaymentModal,     setAddPaymentModal]     = useState(false);

    // ── Auth guard ────────────────────────────────────────────────────────
    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
    }, [status, router]);

    // ─── Data queries ─────────────────────────────────────────────────────

    const { data: growersList = [] } = useQuery({
        queryKey: ["pa-growers"],
        queryFn:  () => paFetch("/api/payment-authorizations/growers?all=0").then(d => norm(Array.isArray(d) ? d : [])),
        staleTime: 5 * 60 * 1000,
    });

    const { data: banksList = [] } = useQuery({
        queryKey: ["pa-banks"],
        queryFn:  () => paFetch("/api/payment-authorizations/banks").then(d => norm(Array.isArray(d) ? d : [])),
        staleTime: 5 * 60 * 1000,
    });

    // Tab 1 — Vendors
    const { data: vendorsList = [], isFetching: loadingVendors, refetch: refetchVendors } = useQuery({
        queryKey: ["pa-vendors", store.lcgrower_uq],
        queryFn:  () => paFetch(`/api/payment-authorizations/vendors?grower=${encodeURIComponent(store.lcgrower_uq)}`).then(d => norm(Array.isArray(d) ? d : [])),
        staleTime: 0,
    });

    const { data: vendorsSummary = [], isFetching: loadingVendorsSummary, refetch: refetchVendorsSummary } = useQuery({
        queryKey: ["pa-vendors-summary"],
        queryFn:  () => paFetch("/api/payment-authorizations/vendors-summary").then(d => norm(Array.isArray(d) ? d : [])),
        staleTime: 0,
    });

    // Tab 2 — Invoices
    const { data: invoicesList = [], isFetching: loadingInvoices, refetch: refetchInvoices } = useQuery({
        queryKey: ["pa-invoices", store.lcgrower_uq, store.llbalance],
        queryFn:  () => paFetch(`/api/payment-authorizations/invoices?supplier_uq=${encodeURIComponent(store.lcgrower_uq)}&balance=${store.llbalance}`).then(d => norm(Array.isArray(d) ? d : [])),
        enabled:  !!store.lcgrower_uq,
        staleTime: 0,
    });

    // Tab 3 — Payments / Outcomes
    const { data: outcomesList = [], isFetching: loadingOutcomes, refetch: refetchOutcomes } = useQuery({
        queryKey: ["pa-outcomes", store.lcgrower_uq, store.ldPaymentsFrom, store.lnclose],
        queryFn:  () => paFetch(`/api/payment-authorizations/outcomes?grower_uq=${encodeURIComponent(store.lcgrower_uq)}&ldfrom=${store.ldPaymentsFrom || "2000-01-01"}&lnclose=${store.lnclose}`).then(d => norm(Array.isArray(d) ? d : [])),
        enabled:  !!store.lcgrower_uq,
        staleTime: 0,
    });

    const { data: outcomeDetails = [], isFetching: loadingDetails } = useQuery({
        queryKey: ["pa-outcome-details", store.lcapd_uq],
        queryFn:  () => paFetch(`/api/payment-authorizations/outcome-details?acc_payd_uq=${encodeURIComponent(store.lcapd_uq)}`).then(d => norm(Array.isArray(d) ? d : [])),
        enabled:  !!store.lcapd_uq,
        staleTime: 0,
    });

    const { data: paymentInvoices = [], isFetching: loadingPayInv } = useQuery({
        queryKey: ["pa-payment-invoices", store.lcoutcome_uq],
        queryFn:  () => paFetch(`/api/payment-authorizations/payment-invoices?payment_uq=${encodeURIComponent(store.lcoutcome_uq)}`).then(d => norm(Array.isArray(d) ? d : [])),
        enabled:  !!store.lcoutcome_uq,
        staleTime: 0,
    });

    // ─── Mutations ────────────────────────────────────────────────────────

    const handleApprove = async (approve: boolean) => {
        if (!store.lcap_uq) { toast.warning("Select an invoice."); return; }
        if (!perms.canEdit) { toast.error(PERMISSION_MSGS.edit); return; }
        try {
            const res = await fetch("/api/payment-authorizations/approve", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ unico: store.lcap_uq, approved: approve }),
            });
            const d = await res.json();
            if (!d.success) throw new Error(d.error);
            logAction("Edit", store.lcap_uq, approve ? "Approve AP Payment Authorization" : "UnApprove AP Payment Authorization");
            toast.success(approve ? "Invoice approved." : "Invoice un-approved.");
            refetchInvoices();
        } catch (e: any) { toast.error(e.message); }
    };

    const handleClosePayment = async () => {
        if (!store.lcoutcome_uq) { toast.warning("Select a payment."); return; }
        if (!perms.canEdit) { toast.error(PERMISSION_MSGS.edit); return; }
        toastConfirm("Auto-pay / close this payment?", async () => {
            try {
                const res = await fetch("/api/payment-authorizations/outcomes/close", {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ payment_uq: store.lcoutcome_uq }),
                });
                const d = await res.json();
                if (!d.success) throw new Error(d.error);
                logAction("Edit", store.lcoutcome_uq, "Close/AutoPay Payment Authorization");
                toast.success("Payment closed.");
                refetchOutcomes();
            } catch (e: any) { toast.error(e.message); }
        });
    };

    const handleDeleteDetail = async (row: any) => {
        if (!row) return;
        if (!perms.canDelete) { toast.error(PERMISSION_MSGS.delete); return; }
        const unico = t(row.UNICO);
        toastConfirm("Delete this payment detail?", async () => {
            try {
                const res = await fetch("/api/payment-authorizations/outcome-details", {
                    method: "DELETE", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ unico }),
                });
                const d = await res.json();
                if (!d.success) throw new Error(d.error);
                logAction("Delete", unico, "Delete Payment Detail");
                toast.success("Detail deleted.");
                setSelDetailRow(null);
                qc.invalidateQueries({ queryKey: ["pa-outcome-details", store.lcapd_uq] });
            } catch (e: any) { toast.error(e.message); }
        });
    };

    // ─── Invoice totals ───────────────────────────────────────────────────
    const invTotals = invoicesList.reduce((acc: any, r: any) => ({
        ammount:    acc.ammount    + (parseFloat(r.AMMOUNT)     || 0),
        credits:    acc.credits    + (parseFloat(r.CRE_AMMOUNT) || 0),
        payments:   acc.payments   + (parseFloat(r.OUT_AMMOUNT) || 0),
        balance:    acc.balance    + (parseFloat(r.BALANCE)     || 0),
    }), { ammount: 0, credits: 0, payments: 0, balance: 0 });

    // ─── Render ────────────────────────────────────────────────────────────
    if (status === "loading") {
        return <div className="flex items-center justify-center h-screen"><Loader2 size={24} className="animate-spin text-gray-400"/></div>;
    }

    return (
        <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">

            {/* ── Page Header ───────────────────────────────────────────────── */}
            <div className="h-10 bg-[#374151] flex items-center gap-3 px-4 shrink-0">
                <button onClick={() => router.back()} className="text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft size={16}/>
                </button>
                <DollarSign size={15} className="text-[#FB7506]"/>
                <span className="fos-grid-header-text">Payment Authorizations — Vendor AP</span>
                {store.lcgrower && (
                    <span className="text-xs text-gray-300 ml-2">{store.lcgrower}</span>
                )}
            </div>

            {/* ── Tabs ──────────────────────────────────────────────────────── */}
            <div className="flex gap-0 border-b bg-white shrink-0">
                {([
                    { key: "vendors",  label: "Vendors",          icon: Users },
                    { key: "invoices", label: "Vendor Invoices",  icon: FileText },
                    { key: "payments", label: "Payments",         icon: CreditCard },
                ] as const).map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={cn(
                            "flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors",
                            activeTab === key
                                ? "border-[#FB7506] text-[#FB7506]"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                        )}
                    >
                        <Icon size={13}/>{label}
                    </button>
                ))}
            </div>

            {/* ── Tab Content ───────────────────────────────────────────────── */}
            <div className="flex-1 overflow-auto p-3 flex flex-col gap-3 min-h-0">

                {/* ════════════════════ TAB 1: VENDORS ════════════════════ */}
                {activeTab === "vendors" && (
                    <div className="flex flex-col h-full min-h-0">
                        <div className="bg-white rounded-b border shadow-sm flex-1 flex flex-col min-h-0">

                            {/* Header row matching VFP: icon + title + search + action buttons */}
                            <div className="h-10 bg-[#374151] flex items-center gap-2 pl-3 pr-0 shrink-0 rounded-t-lg">
                                <Building2 size={15} className="text-[#FB7506]"/>
                                <span className="fos-grid-header-text">Vendors</span>
                                <input
                                    type="text"
                                    placeholder="Search vendor…"
                                    value={vendorSearch}
                                    onChange={e => setVendorSearch(e.target.value)}
                                    className="ml-2 h-6 text-xs px-2 rounded border border-gray-500 bg-[#4b5563] text-white placeholder-gray-400 focus:outline-none focus:border-orange-400 w-48"
                                />
                                <div className="ml-auto">
                                    <GridMenu items={[
                                        { label: "Refresh",          icon: RefreshCcw, color: "gray",   onClick: () => refetchVendorsSummary() },
                                        { label: "History",          icon: Calendar,   color: "gray",   onClick: () => setDateHistoryModal(true) },
                                        { label: "4 Months",         icon: BarChart2,  color: "blue",   onClick: () => refetchVendorsSummary() },
                                        { label: "4 Months Detail",  icon: FileText,   color: "blue",   onClick: async () => {
                                            if (!store.lcgrower_uq) { toast.warning("Select a vendor first."); return; }
                                            setLoadingQDetail(true);
                                            try {
                                                const d = await paFetch(`/api/payment-authorizations/vendors-summary-detail?grower_uq=${encodeURIComponent(store.lcgrower_uq)}`);
                                                setQuarterDetail(norm(Array.isArray(d) ? d : []));
                                                setQuarterDetailModal(true);
                                            } catch (e: any) { toast.error(e.message); }
                                            finally { setLoadingQDetail(false); }
                                        }, disabled: !store.lcgrower_uq },
                                    ]} />
                                </div>
                            </div>

                            {/* Table — matches VFP columns: Vendor | T.Invoice | T.Credits | T.Debits | Net Invoice | Payments | Inv-Bal */}
                            {loadingVendorsSummary
                                ? <div className="flex items-center gap-2 text-gray-400 text-xs p-4"><Loader2 size={14} className="animate-spin"/>Loading…</div>
                                : (
                                    <div className="overflow-auto flex-1">
                                        <table className="min-w-full text-left text-xs">
                                            <thead className="bg-[#374151] border-b fos-grid-thead text-white sticky top-0">
                                                <tr>
                                                    {["Vendor","T.Invoice","T.Credits","T.Debits","Net Invoice","Payments","Inv-Bal"].map(h => (
                                                        <th key={h} className="p-2 border-r border-gray-600 last:border-r-0 whitespace-nowrap">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="fos-grid-tbody divide-y divide-gray-100">
                                                {vendorsSummary
                                                    .filter((row: any) => !vendorSearch || t(row.GROWER).toUpperCase().includes(vendorSearch.toUpperCase()))
                                                    .map((row: any, i: number) => {
                                                        const uq  = t(row.UNICO);
                                                        const sel = store.lcgrower_uq === uq;
                                                        return (
                                                            <tr key={i}
                                                                className={cn("cursor-pointer hover:bg-orange-50", sel && "bg-orange-100 font-semibold")}
                                                                onClick={() => { store.setGrowerUq(uq, t(row.GROWER)); setSelVendorRow(row); setSelInvoiceRow(null); setSelOutcomeRow(null); }}
                                                            >
                                                                <td className="p-2 border-r border-gray-100 whitespace-nowrap">{t(row.GROWER)}</td>
                                                                <td className="p-2 border-r border-gray-100 whitespace-nowrap text-right">{fmt(row.TOTAL_INVOICE)}</td>
                                                                <td className="p-2 border-r border-gray-100 whitespace-nowrap text-right">{fmt(row.TOTAL_CREDITS)}</td>
                                                                <td className="p-2 border-r border-gray-100 whitespace-nowrap text-right">{fmt(row.TOTAL_DEBITS)}</td>
                                                                <td className="p-2 border-r border-gray-100 whitespace-nowrap text-right">{fmt(row.TOTAL_INV_BAL)}</td>
                                                                <td className="p-2 border-r border-gray-100 whitespace-nowrap text-right">{fmt(row.TOTAL_PAYMENTS)}</td>
                                                                <td className={cn("p-2 whitespace-nowrap text-right font-bold",
                                                                    parseFloat(row.TOTAL_BOOKS_BAL) > 0 ? "text-red-600" : "")}>
                                                                    {fmt(row.TOTAL_BOOKS_BAL)}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                )
                            }
                        </div>

                        {/* 4 Months Detail modal */}
                        {quarterDetailModal && (
                            <Modal title={`4 Months Detail — ${store.lcgrower}`} icon={FileText} onClose={() => setQuarterDetailModal(false)} size="xl"
                                footer={<button onClick={() => setQuarterDetailModal(false)} className="px-4 py-2 rounded border text-sm font-bold text-gray-600 hover:bg-gray-100">Close</button>}>
                                {loadingQDetail
                                    ? <div className="flex items-center gap-2 text-gray-400 text-xs"><Loader2 size={14} className="animate-spin"/>Loading…</div>
                                    : quarterDetail.length === 0
                                        ? <p className="text-xs text-gray-400">No detail records found.</p>
                                        : (
                                            <div className="overflow-auto">
                                                <table className="min-w-full text-xs">
                                                    <thead className="bg-[#374151] text-white sticky top-0">
                                                        <tr>{Object.keys(quarterDetail[0]).map(c => (
                                                            <th key={c} className="p-2 border-r border-gray-600 last:border-r-0 whitespace-nowrap">{c}</th>
                                                        ))}</tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {quarterDetail.map((row, i) => (
                                                            <tr key={i} className="hover:bg-gray-50">
                                                                {Object.keys(quarterDetail[0]).map(c => (
                                                                    <td key={c} className="p-2 border-r border-gray-100 last:border-r-0 whitespace-nowrap">{t(row[c])}</td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )
                                }
                            </Modal>
                        )}
                    </div>
                )}

                {/* ════════════════════ TAB 2: INVOICES ════════════════════ */}
                {activeTab === "invoices" && (
                    <div className="flex flex-col gap-3 h-full">

                        {/* Filters */}
                        <div className="bg-white rounded border shadow-sm p-3 flex flex-wrap gap-4 items-center shrink-0">
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Vendor</label>
                                <select value={store.lcgrower_uq} onChange={e => { store.setGrowerUq(e.target.value, growersList.find((g: any) => t(g.UNICO) === e.target.value)?.GROWER ?? ""); setSelInvoiceRow(null); }}
                                    className="border rounded px-2 py-1 text-xs min-w-48">
                                    <option value="">— Select Vendor —</option>
                                    {growersList.map((g: any) => <option key={t(g.UNICO)} value={t(g.UNICO)}>{t(g.GROWER ?? g.SUPPLIER)}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Balance Filter</label>
                                <div className="flex gap-3">
                                    {([["pos", "Bal > 0"], ["zero", "Bal = 0"], ["all", "All"]] as const).map(([val, lbl]) => (
                                        <label key={val} className="flex items-center gap-1.5 text-xs cursor-pointer">
                                            <input type="radio" checked={store.llbalance === val} onChange={() => { store.setLlbalance(val); setSelInvoiceRow(null); }} className="accent-orange-500"/>
                                            {lbl}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <Btn icon={RefreshCcw} label="Refresh" color="gray" onClick={() => refetchInvoices()} disabled={!store.lcgrower_uq}/>
                        </div>

                        {/* Invoices table */}
                        <div className="bg-white rounded-b border shadow-sm overflow-auto flex-1 flex flex-col min-h-0">
                            <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-0 shrink-0 rounded-t-lg">
                                <div className="flex items-center gap-2">
                                    <FileText size={15} className="text-[#FB7506]"/>
                                    <span className="fos-grid-header-text">Vendor Invoices</span>
                                    {selInvoiceRow && (
                                        <span className="text-xs text-gray-300 ml-2">{t(selInvoiceRow.INVOICE_NO)}</span>
                                    )}
                                </div>
                                <GridMenu items={[
                                    { label: "Approve",   icon: Check,      color: "green",  onClick: () => handleApprove(true),  disabled: !selInvoiceRow || !perms.canEdit },
                                    { label: "UnApp",     icon: XCircle,    color: "gray",   onClick: () => handleApprove(false), disabled: !selInvoiceRow || !perms.canEdit },
                                    { label: "Chk Pay Date", icon: Calendar, color: "blue",  onClick: () => setPaymentDateModal(true) },
                                    { label: "Pending Invoices Report", icon: Printer, color: "gray", onClick: () => setReportsModal(true), disabled: !perms.canReport },
                                ]} />
                            </div>
                            {!store.lcgrower_uq
                                ? <div className="flex items-center gap-2 text-gray-400 text-xs p-4"><AlertCircle size={14}/>Select a vendor to load invoices.</div>
                                : loadingInvoices
                                    ? <div className="flex items-center gap-2 text-gray-400 text-xs p-4"><Loader2 size={14} className="animate-spin"/>Loading…</div>
                                    : (
                                        <div className="overflow-auto flex-1">
                                            <table className="min-w-full text-left text-xs">
                                                <thead className="bg-[#374151] border-b fos-grid-thead text-white sticky top-0">
                                                    <tr>{["Invoice No","AP Date","Due Date","Days","Amount","Payments","Credits","Debits","Balance","Pay"].map(h => (
                                                        <th key={h} className="p-2 border-r border-gray-600 last:border-r-0 whitespace-nowrap">{h}</th>
                                                    ))}</tr>
                                                </thead>
                                                <tbody className="fos-grid-tbody divide-y divide-gray-100">
                                                    {invoicesList.map((row: any) => {
                                                        const uq  = t(row.UNICO);
                                                        const sel = store.lcap_uq === uq;
                                                        return (
                                                            <tr key={uq} className={cn("cursor-pointer hover:bg-orange-50", sel && "bg-orange-100 font-semibold")}
                                                                onClick={() => { store.setApUq(uq); store.setApdUq(t(row.ACC_PAY_UQ)); setSelInvoiceRow(row); }}>
                                                                <td className="p-2 border-r border-gray-100 whitespace-nowrap">{t(row.INVOICE_NO)}</td>
                                                                <td className="p-2 border-r border-gray-100 whitespace-nowrap">{fmtDate(row.AP_DATE)}</td>
                                                                <td className="p-2 border-r border-gray-100 whitespace-nowrap">{fmtDate(row.DATE_DUE)}</td>
                                                                <td className="p-2 border-r border-gray-100 whitespace-nowrap text-right">{t(row.DAYS)}</td>
                                                                <td className="p-2 border-r border-gray-100 whitespace-nowrap text-right">{fmt(row.AMMOUNT)}</td>
                                                                <td className="p-2 border-r border-gray-100 whitespace-nowrap text-right">{fmt(row.OUT_AMMOUNT)}</td>
                                                                <td className="p-2 border-r border-gray-100 whitespace-nowrap text-right">{fmt(row.CRE_AMMOUNT)}</td>
                                                                <td className="p-2 border-r border-gray-100 whitespace-nowrap text-right">{fmt(row.DEB_AMMOUNT)}</td>
                                                                <td className={cn("p-2 border-r border-gray-100 whitespace-nowrap text-right font-bold",
                                                                    parseFloat(row.BALANCE) > 0 ? "text-red-600" : "text-green-600")}>
                                                                    {fmt(row.BALANCE)}
                                                                </td>
                                                                <td className="p-2 whitespace-nowrap text-center">
                                                                    {row.PAY ? <Check size={12} className="text-green-500 inline"/> : ""}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )
                            }
                            {/* Totals footer */}
                            {invoicesList.length > 0 && (
                                <div className="flex items-center gap-6 px-3 py-2 bg-gray-50 border-t text-xs font-bold shrink-0">
                                    <span>Total Invoice: <span className="text-blue-700">{fmt(invTotals.ammount)}</span></span>
                                    <span>Credits: <span className="text-green-700">{fmt(invTotals.credits)}</span></span>
                                    <span>Payments: <span className="text-orange-700">{fmt(invTotals.payments)}</span></span>
                                    <span>Balance: <span className={invTotals.balance > 0 ? "text-red-600" : "text-green-700"}>{fmt(invTotals.balance)}</span></span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ════════════════════ TAB 3: PAYMENTS ════════════════════ */}
                {activeTab === "payments" && (
                    <div className="flex flex-col gap-3 h-full">

                        {/* Payments filters */}
                        <div className="bg-white rounded border shadow-sm p-3 flex flex-wrap gap-4 items-center shrink-0">
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Vendor</label>
                                <select value={store.lcgrower_uq} onChange={e => { store.setGrowerUq(e.target.value, growersList.find((g: any) => t(g.UNICO) === e.target.value)?.GROWER ?? ""); setSelOutcomeRow(null); }}
                                    className="border rounded px-2 py-1 text-xs min-w-48">
                                    <option value="">— Select Vendor —</option>
                                    {growersList.map((g: any) => <option key={t(g.UNICO)} value={t(g.UNICO)}>{t(g.GROWER ?? g.SUPPLIER)}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Bank</label>
                                <select value={selectedBankUq} onChange={e => setSelectedBankUq(e.target.value)} className="border rounded px-2 py-1 text-xs min-w-36">
                                    <option value="">— All Banks —</option>
                                    {banksList.map((b: any) => <option key={t(b.UNICO)} value={t(b.UNICO)}>{t(b.BANK)}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Payments From</label>
                                <input type="date" value={store.ldPaymentsFrom} onChange={e => store.setLdPaymentsFrom(e.target.value)} className="border rounded px-2 py-1 text-xs"/>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Status</label>
                                <div className="flex gap-3">
                                    {([[0,"Open"],[1,"Closed"]] as const).map(([val, lbl]) => (
                                        <label key={val} className="flex items-center gap-1.5 text-xs cursor-pointer">
                                            <input type="radio" checked={store.lnclose === val} onChange={() => { store.setLnclose(val); setSelOutcomeRow(null); }} className="accent-orange-500"/>
                                            {lbl}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-3 flex-1 min-h-0">

                            {/* Outcomes (payments) */}
                            <div className="bg-white rounded-b border shadow-sm flex flex-col min-h-0 lg:w-1/2">
                                <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-0 shrink-0 rounded-t-lg">
                                    <div className="flex items-center gap-2">
                                        <CreditCard size={15} className="text-[#FB7506]"/>
                                        <span className="fos-grid-header-text">Payments</span>
                                    </div>
                                    <GridMenu items={[
                                        { label: "Add",          icon: Plus,      color: "green",  onClick: () => { if (!perms.canCreate) { toast.error(PERMISSION_MSGS.create); return; } setAddPaymentModal(true); }, disabled: !store.lcgrower_uq || !perms.canCreate },
                                        { label: "Auto Pay",     icon: CheckCheck, color: "blue",  onClick: handleClosePayment, disabled: !selOutcomeRow || !perms.canEdit },
                                        { label: "History",      icon: Calendar,  color: "gray",   onClick: () => setDateHistoryModal(true) },
                                        { label: "Reports",      icon: Printer,   color: "blue",   onClick: () => setPaymentsReportModal(true), disabled: !perms.canReport },
                                    ]} />
                                </div>
                                {!store.lcgrower_uq
                                    ? <div className="flex items-center gap-2 text-gray-400 text-xs p-4"><AlertCircle size={14}/>Select a vendor.</div>
                                    : loadingOutcomes
                                        ? <div className="flex items-center gap-2 text-gray-400 text-xs p-4"><Loader2 size={14} className="animate-spin"/>Loading…</div>
                                        : (
                                            <div className="overflow-auto flex-1">
                                                <table className="min-w-full text-left text-xs">
                                                    <thead className="bg-[#374151] border-b fos-grid-thead text-white sticky top-0">
                                                        <tr>{["Date","Document","Status","Bank","Vendor","Farm","Amount","Total","Balance","Pay Doc"].map(h => (
                                                            <th key={h} className="p-2 border-r border-gray-600 last:border-r-0 whitespace-nowrap">{h}</th>
                                                        ))}</tr>
                                                    </thead>
                                                    <tbody className="fos-grid-tbody divide-y divide-gray-100">
                                                        {outcomesList.map((row: any) => {
                                                            const uq  = t(row.UNICO);
                                                            const sel = store.lcoutcome_uq === uq;
                                                            return (
                                                                <tr key={uq} className={cn("cursor-pointer hover:bg-orange-50", sel && "bg-orange-100 font-semibold")}
                                                                    onClick={() => { store.setOutcomeUq(uq); setSelOutcomeRow(row); }}>
                                                                    <td className="p-2 border-r border-gray-100 whitespace-nowrap">{fmtDate(row.OUT_DATE)}</td>
                                                                    <td className="p-2 border-r border-gray-100 whitespace-nowrap">{t(row.OUT_DOCUMENT)}</td>
                                                                    <td className="p-2 border-r border-gray-100 whitespace-nowrap">{t(row.STATUS)}</td>
                                                                    <td className="p-2 border-r border-gray-100 whitespace-nowrap">{t(row.BANK)}</td>
                                                                    <td className="p-2 border-r border-gray-100 whitespace-nowrap">{t(row.GROWER)}</td>
                                                                    <td className="p-2 border-r border-gray-100 whitespace-nowrap">{t(row.FARM)}</td>
                                                                    <td className="p-2 border-r border-gray-100 whitespace-nowrap text-right">{fmt(row.OUT_AMMOUNT)}</td>
                                                                    <td className="p-2 border-r border-gray-100 whitespace-nowrap text-right">{fmt(row.OUT_TOTAL)}</td>
                                                                    <td className="p-2 border-r border-gray-100 whitespace-nowrap text-right font-bold">{fmt(row.OUT_BALANCE)}</td>
                                                                    <td className="p-2 whitespace-nowrap text-right">{t(row.PAY_DOC)}</td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )
                                }
                            </div>

                            {/* Right panel: Payment Invoices + Outcome Details */}
                            <div className="flex flex-col gap-3 flex-1 min-h-0">

                                {/* Payment Invoices */}
                                <div className="bg-white rounded-b border shadow-sm flex flex-col min-h-0" style={{ maxHeight: "45%" }}>
                                    <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-0 shrink-0 rounded-t-lg">
                                        <div className="flex items-center gap-2">
                                            <FileText size={15} className="text-[#FB7506]"/>
                                            <span className="fos-grid-header-text">Payment Invoices</span>
                                        </div>
                                    </div>
                                    {loadingPayInv
                                        ? <div className="flex items-center gap-2 text-gray-400 text-xs p-3"><Loader2 size={14} className="animate-spin"/>Loading…</div>
                                        : (
                                            <div className="overflow-auto flex-1">
                                                <table className="min-w-full text-left text-xs">
                                                    <thead className="bg-[#374151] border-b fos-grid-thead text-white sticky top-0">
                                                        <tr>{["Invoice No","Invoice Date","Line Value","Payment","Credits","Notes"].map(h => (
                                                            <th key={h} className="p-2 border-r border-gray-600 last:border-r-0 whitespace-nowrap">{h}</th>
                                                        ))}</tr>
                                                    </thead>
                                                    <tbody className="fos-grid-tbody divide-y divide-gray-100">
                                                        {paymentInvoices.map((row: any, i: number) => (
                                                            <tr key={i} className={cn("cursor-pointer hover:bg-orange-50", selPayInvRow === row && "bg-orange-100")}
                                                                onClick={() => setSelPayInvRow(row)}>
                                                                <td className="p-2 border-r border-gray-100 whitespace-nowrap">{t(row.INVOICE_NO)}</td>
                                                                <td className="p-2 border-r border-gray-100 whitespace-nowrap">{fmtDate(row.INVOICE_DATE)}</td>
                                                                <td className="p-2 border-r border-gray-100 whitespace-nowrap text-right">{fmt(row.LINE_VALUE)}</td>
                                                                <td className="p-2 border-r border-gray-100 whitespace-nowrap text-right">{fmt(row.PAYMENT)}</td>
                                                                <td className="p-2 border-r border-gray-100 whitespace-nowrap text-right">{fmt(row.LINE_CREDITS)}</td>
                                                                <td className="p-2 whitespace-nowrap">{t(row.DATO)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )
                                    }
                                </div>

                                {/* Outcome Details (AP x Outcome) */}
                                <div className="bg-white rounded-b border shadow-sm flex flex-col flex-1 min-h-0">
                                    <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-0 shrink-0 rounded-t-lg">
                                        <div className="flex items-center gap-2">
                                            <DollarSign size={15} className="text-[#FB7506]"/>
                                            <span className="fos-grid-header-text">Payment Details</span>
                                        </div>
                                        <GridMenu items={[
                                            { label: "Delete Detail", icon: Trash2, color: "red", onClick: () => handleDeleteDetail(selDetailRow), disabled: !selDetailRow || !perms.canDelete },
                                        ]} />
                                    </div>
                                    {loadingDetails
                                        ? <div className="flex items-center gap-2 text-gray-400 text-xs p-3"><Loader2 size={14} className="animate-spin"/>Loading…</div>
                                        : (
                                            <div className="overflow-auto flex-1">
                                                <table className="min-w-full text-left text-xs">
                                                    <thead className="bg-[#374151] border-b fos-grid-thead text-white sticky top-0">
                                                        <tr>{["Amount","Pay Doc","Outcome","Notes"].map(h => (
                                                            <th key={h} className="p-2 border-r border-gray-600 last:border-r-0 whitespace-nowrap">{h}</th>
                                                        ))}</tr>
                                                    </thead>
                                                    <tbody className="fos-grid-tbody divide-y divide-gray-100">
                                                        {outcomeDetails.map((row: any, i: number) => (
                                                            <tr key={i} className={cn("cursor-pointer hover:bg-orange-50", selDetailRow === row && "bg-orange-100")}
                                                                onClick={() => setSelDetailRow(row)}>
                                                                <td className="p-2 border-r border-gray-100 whitespace-nowrap text-right">{fmt(row.OUT_AMMOUNT)}</td>
                                                                <td className="p-2 border-r border-gray-100 whitespace-nowrap text-right">{t(row.PAY_DOC)}</td>
                                                                <td className="p-2 border-r border-gray-100 whitespace-nowrap">{t(row.OUTCOME_UQ)}</td>
                                                                <td className="p-2 whitespace-nowrap">{t(row.DATO)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Modals ────────────────────────────────────────────────────── */}
            {reportsModal && (
                <ModalReports
                    growers={growersList}
                    defaultGrower={store.lcgrower_uq}
                    onClose={() => setReportsModal(false)}
                />
            )}
            {paymentsReportModal && (
                <ModalPaymentsReport
                    growers={growersList}
                    defaultGrower={store.lcgrower_uq}
                    onClose={() => setPaymentsReportModal(false)}
                />
            )}
            {dateHistoryModal && (
                <ModalDateToHistory onClose={() => setDateHistoryModal(false)}/>
            )}
            {paymentDateModal && (
                <ModalPaymentDate
                    growers={growersList}
                    defaultGrower={store.lcgrower_uq}
                    onClose={() => setPaymentDateModal(false)}
                    logAction={logAction}
                />
            )}
            {addPaymentModal && (
                <ModalAddPayment
                    banks={banksList}
                    supplierUq={store.lcgrower_uq}
                    onClose={() => setAddPaymentModal(false)}
                    onSaved={(data: any) => {
                        setAddPaymentModal(false);
                        logAction("Insert", t(data?.unico ?? data?.UNICO ?? ""), "Insert Payment Authorization");
                        refetchOutcomes();
                    }}
                />
            )}
        </div>
    );
}
