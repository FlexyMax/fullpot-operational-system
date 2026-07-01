"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
    XCircle, Loader2, DollarSign, FileText, Users, CreditCard,
    Plus, Trash2, Check, CheckCheck, Printer, BarChart2,
    Calendar, Building2, AlertCircle, RefreshCcw, Pencil,
} from "lucide-react";
import PanelGrid from "@/components/ui/PanelGrid";
import { PanelGridTable, PanelGridThead, PanelGridTh, PanelGridTbody, PanelGridTr, PanelGridTd, PanelGridTfoot } from "@/components/ui/PanelGridTable";
import { MobileActionBar } from "@/components/layout/MobileActionBar";
import { ReportModal } from "@/components/reports/ReportModal";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuditLog } from "@/lib/audit";
import { usePagePermissions, PERMISSION_MSGS } from "@/lib/permissions";
import { usePaymentAuthorizationsStore } from "@/store/usePaymentAuthorizationsStore";
import AppHeader from "@/components/layout/AppHeader";
import AppFooter from "@/components/layout/AppFooter";

const EMPTY_ARR: any[] = [];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const t       = (v: any) => String(v ?? "").trim();
const fmt     = (v: any) => parseFloat(v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (v: any) => { if (!v) return ""; const d = new Date(v); return isNaN(d.getTime()) ? t(v) : d.toLocaleDateString("en-US", { timeZone: "America/New_York" }); };
const today   = () => new Date().toISOString().split("T")[0];
const norm    = (rows: any[]) => rows.map(r => { const n: any = {}; for (const [k, v] of Object.entries(r)) n[k.toUpperCase()] = v; return n; });

const paFetch = async (url: string) => {
    const r = await fetch(url);
    let j: any;
    try { j = await r.json(); } catch { throw new Error(`HTTP ${r.status}`); }
    if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`);
    return j;
};

const toastConfirm = (msg: string, onConfirm: () => void) => {
    toast(msg, {
        duration: 10000,
        action: { label: "Confirm", onClick: onConfirm },
        cancel:  { label: "Cancel",  onClick: () => {} },
    });
};

// ─── Modal wrapper ─────────────────────────────────────────────────────────────
function Modal({ title, icon: Icon, onClose, children, footer, size = "md" }: any) {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 sm:p-4">
            <div className={cn(
                "bg-white rounded-t-xl sm:rounded-xl shadow-2xl w-full flex flex-col h-[85vh] sm:h-auto sm:max-h-[88vh]",
                size === "sm" ? "sm:max-w-lg" : size === "lg" ? "sm:max-w-3xl" : size === "xl" ? "sm:max-w-5xl" : "sm:max-w-2xl"
            )}>
                <div className="h-10 bg-[#374151] rounded-t-xl flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-2">
                        {Icon && <Icon size={15} className="text-[#FB7506]" />}
                        <span className="text-white text-[11px] font-black uppercase tracking-widest truncate">{title}</span>
                    </div>
                    <button onClick={onClose}><XCircle size={16} className="text-gray-400 hover:text-white" /></button>
                </div>
                <div className="overflow-y-auto flex-1 p-4">{children}</div>
                {footer && <div className="flex justify-end gap-2 px-4 py-3 bg-gray-50 border-t rounded-b-xl shrink-0">{footer}</div>}
            </div>
        </div>
    );
}

// ─── ModalReports — filter form only; calls onOpen(url) with the PDF endpoint ──
function ModalReports({ growers, defaultGrower, defaultGrowerName, onClose, onOpen }: {
    growers: any[];
    defaultGrower: string;
    defaultGrowerName: string;
    onClose: () => void;
    onOpen: (url: string) => void;
}) {
    const [option,   setOption]   = useState<"pending" | "summary">("pending");
    const [growerUq, setGrowerUq] = useState(defaultGrower);
    const [dateFrom, setDateFrom] = useState(today());
    const [dateTo,   setDateTo]   = useState(today());

    const growerName = growers.find(g => t(g.UNICO) === growerUq)
        ? t(growers.find(g => t(g.UNICO) === growerUq)?.GROWER ?? "")
        : defaultGrowerName;

    const generate = () => {
        const base = `grower_uq=${encodeURIComponent(growerUq)}&grower_name=${encodeURIComponent(growerName)}`;
        const url = option === "pending"
            ? `/api/payment-authorizations/reports/pending?${base}&date_from=${dateFrom}&date_to=${dateTo}`
            : `/api/payment-authorizations/reports/summary?${base}&ldfrom=${dateFrom}&ldto=${dateTo}&lnoption=1`;
        onClose();
        onOpen(url);
    };

    return (
        <Modal title="Vendor Reports" icon={Printer} onClose={onClose} size="sm"
            footer={
                <>
                    <button onClick={onClose} className="px-4 py-2 rounded border text-sm font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
                    <button onClick={generate} className="px-4 py-2 rounded bg-[#FB7506] text-white text-sm font-bold hover:bg-orange-600">Generate PDF</button>
                </>
            }>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Report Type</label>
                    <div className="flex gap-4">
                        {(["pending", "summary"] as const).map(o => (
                            <label key={o} className="flex items-center gap-1.5 text-xs cursor-pointer">
                                <input type="radio" checked={option === o} onChange={() => setOption(o)} className="accent-orange-500" />
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
                    <label className="text-[10px] font-bold text-gray-500 uppercase">From</label>
                    <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="border rounded px-2 py-1 text-xs" />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">To</label>
                    <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="border rounded px-2 py-1 text-xs" />
                </div>
            </div>
        </Modal>
    );
}

// ─── ModalPaymentsReport — filter form only; calls onOpen(url) with PDF endpoint
function ModalPaymentsReport({ growers, defaultGrower, defaultGrowerName, onClose, onOpen }: {
    growers: any[];
    defaultGrower: string;
    defaultGrowerName: string;
    onClose: () => void;
    onOpen: (url: string) => void;
}) {
    const [option,   setOption]   = useState<"detail" | "resume">("detail");
    const [growerUq, setGrowerUq] = useState(defaultGrower);
    const [dateFrom, setDateFrom] = useState(today());
    const [dateTo,   setDateTo]   = useState(today());

    const growerName = growers.find(g => t(g.UNICO) === growerUq)
        ? t(growers.find(g => t(g.UNICO) === growerUq)?.GROWER ?? "")
        : defaultGrowerName;

    const generate = () => {
        const base = `grower_uq=${encodeURIComponent(growerUq)}&grower_name=${encodeURIComponent(growerName)}&payments_from=${dateFrom}&payments_to=${dateTo}`;
        const url = option === "resume"
            ? `/api/payment-authorizations/reports/payments-resume?${base}`
            : `/api/payment-authorizations/reports/payments?${base}`;
        onClose();
        onOpen(url);
    };

    return (
        <Modal title="Payments Report" icon={DollarSign} onClose={onClose} size="sm"
            footer={
                <>
                    <button onClick={onClose} className="px-4 py-2 rounded border text-sm font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
                    <button onClick={generate} className="px-4 py-2 rounded bg-[#FB7506] text-white text-sm font-bold hover:bg-orange-600">Generate PDF</button>
                </>
            }>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Report Type</label>
                    <div className="flex gap-4">
                        {(["detail", "resume"] as const).map(o => (
                            <label key={o} className="flex items-center gap-1.5 text-xs cursor-pointer">
                                <input type="radio" checked={option === o} onChange={() => setOption(o)} className="accent-orange-500" />
                                {o === "detail" ? "Payments Detail" : "Payments Resume"}
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
                    <label className="text-[10px] font-bold text-gray-500 uppercase">From</label>
                    <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="border rounded px-2 py-1 text-xs" />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">To</label>
                    <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="border rounded px-2 py-1 text-xs" />
                </div>
            </div>
        </Modal>
    );
}

// ─── ModalDateToHistory ───────────────────────────────────────────────────────
// SP: sp_flower_growers_pending_invoices_report2 (ws_growers_accounts_history.frx)
// lnoption: 1=balance=0, 2=balance<>0, 3=all
function ModalDateToHistory({ growerUq, growerName, onClose, onOpen }: {
    growerUq: string; growerName: string;
    onClose: () => void; onOpen: (url: string) => void;
}) {
    const startOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0];
    const [dateFrom, setDateFrom] = useState(startOfYear);
    const [dateTo,   setDateTo]   = useState(today());
    const [balance,  setBalance]  = useState<"zero" | "nonzero" | "all">("nonzero");

    const generate = () => {
        const lnoption = balance === "zero" ? 1 : balance === "nonzero" ? 2 : 3;
        const url = `/api/payment-authorizations/reports/summary?grower_uq=${encodeURIComponent(growerUq)}&grower_name=${encodeURIComponent(growerName)}&ldfrom=${dateFrom}&ldto=${dateTo}&lnoption=${lnoption}`;
        onClose();
        onOpen(url);
    };

    return (
        <Modal title="Vendor Invoice History" icon={Calendar} onClose={onClose} size="sm"
            footer={
                <>
                    <button onClick={onClose} className="px-4 py-2 rounded border text-sm font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
                    <button onClick={generate} className="px-4 py-2 rounded bg-[#FB7506] text-white text-sm font-bold hover:bg-orange-600">
                        Generate PDF
                    </button>
                </>
            }>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Vendor</label>
                    <p className="text-xs font-semibold text-gray-700">{growerName || growerUq || "All Vendors"}</p>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Invoice Date From</label>
                    <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="border rounded px-2 py-1 text-sm w-full" />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Invoice Date To</label>
                    <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="border rounded px-2 py-1 text-sm w-full" />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Balance Filter</label>
                    <div className="flex gap-4">
                        {(["zero", "nonzero", "all"] as const).map(b => (
                            <label key={b} className="flex items-center gap-1.5 text-xs cursor-pointer">
                                <input type="radio" checked={balance === b} onChange={() => setBalance(b)} className="accent-orange-500" />
                                {b === "zero" ? "Paid (= 0)" : b === "nonzero" ? "Pending (≠ 0)" : "All"}
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    );
}

// ─── ModalCRDB — Credits / Debits per AP invoice ──────────────────────────────
// SPs: sp_flower_accounts_pay_credits_debits (list), sp_flower_accounts_pay_cr_insert/update/delete
function ModalCRDB({ invoiceUq, invoiceNo, growerName, onClose, onOpen, logAction, perms }: {
    invoiceUq: string; invoiceNo: string; growerName: string;
    onClose: () => void; onOpen: (url: string) => void;
    logAction: (action: "Edit" | "Insert" | "Delete", uq: string, detail?: string) => void;
    perms: { canCreate: boolean; canEdit: boolean; canDelete: boolean; canReport: boolean };
}) {
    const qc = useQueryClient();
    const [mode,        setMode]        = useState<"list" | "form">("list");
    const [editUq,      setEditUq]      = useState<string | null>(null);
    const [formType,    setFormType]    = useState<"C" | "D">("C");
    const [formDate,    setFormDate]    = useState(today());
    const [formReason,  setFormReason]  = useState("");
    const [formAmount,  setFormAmount]  = useState("0.00");
    const [formDetails, setFormDetails] = useState("");
    const [saving,      setSaving]      = useState(false);

    const { data: crdbList = EMPTY_ARR, isFetching, refetch } = useQuery({
        queryKey: ["pa-crdb", invoiceUq],
        queryFn:  () => paFetch(`/api/payment-authorizations/crdb?invoice_uq=${encodeURIComponent(invoiceUq)}`).then(d => norm(Array.isArray(d) ? d : [])),
        enabled:  !!invoiceUq,
        staleTime: 0,
    });

    const { data: reasonsList = EMPTY_ARR } = useQuery({
        queryKey: ["pa-crdb-reasons"],
        queryFn:  () => paFetch("/api/payment-authorizations/crdb-reasons").then(d => norm(Array.isArray(d) ? d : [])),
        staleTime: 10 * 60 * 1000,
    });

    const openAdd = (type: "C" | "D") => {
        if (!perms.canCreate) { toast.error(PERMISSION_MSGS.create); return; }
        setEditUq(null);
        setFormType(type);
        setFormDate(today());
        setFormReason(t(reasonsList[0]?.UNICO ?? ""));
        setFormAmount("0.00");
        setFormDetails("");
        setMode("form");
    };

    const openEdit = (row: any) => {
        if (!perms.canEdit) { toast.error(PERMISSION_MSGS.edit); return; }
        const matched = reasonsList.find((r: any) => t(r.REASON).toLowerCase() === t(row.REASON).toLowerCase());
        const d = new Date(t(row.CD_DATE));
        setEditUq(t(row.UNICO));
        setFormType(t(row.TYPE) as "C" | "D");
        setFormDate(isNaN(d.getTime()) ? today() : d.toLocaleDateString("en-CA"));
        setFormReason(t(matched?.UNICO ?? ""));
        setFormAmount(t(row.CD_AMOUNT));
        setFormDetails(t(row.CD_DETAILS));
        setMode("form");
    };

    const handleSave = async () => {
        if (!formReason) { toast.warning("Select a reason."); return; }
        if (!parseFloat(formAmount)) { toast.warning("Enter an amount greater than 0."); return; }
        setSaving(true);
        try {
            const body = { type: formType, cd_date: formDate, acc_pay_uq: invoiceUq, reason_uq: formReason, amount: formAmount, details: formDetails };
            const r = editUq
                ? await fetch("/api/payment-authorizations/crdb", { method: "PUT",  headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, unico: editUq }) }).then(x => x.json())
                : await fetch("/api/payment-authorizations/crdb", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(x => x.json());
            if (!r.success) throw new Error(r.error || "Failed");
            logAction(editUq ? "Edit" : "Insert", editUq ?? t(r.data?.unico ?? ""), `${formType === "C" ? "Credit" : "Debit"} on invoice ${invoiceNo}`);
            toast.success(editUq ? "Record updated." : "Record added.");
            qc.invalidateQueries({ queryKey: ["pa-crdb", invoiceUq] });
            qc.invalidateQueries({ queryKey: ["pa-invoices"] });
            setMode("list");
        } catch (e: any) { toast.error(e.message); }
        finally { setSaving(false); }
    };

    const handleDelete = (crdb_uq: string) => {
        if (!perms.canDelete) { toast.error(PERMISSION_MSGS.delete); return; }
        toastConfirm("Delete this credit/debit?", async () => {
            try {
                const r = await fetch("/api/payment-authorizations/crdb", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ crdb_uq }) }).then(x => x.json());
                if (!r.success) throw new Error(r.error || "Failed to delete");
                logAction("Delete", crdb_uq, `Delete CRDB on invoice ${invoiceNo}`);
                toast.success("Deleted.");
                qc.invalidateQueries({ queryKey: ["pa-crdb", invoiceUq] });
                qc.invalidateQueries({ queryKey: ["pa-invoices"] });
            } catch (e: any) { toast.error(e.message); }
        });
    };

    const typeBadge = (type: string) => t(type) === "C"
        ? <span className="inline-flex px-1.5 py-0.5 rounded text-[9px] font-black bg-green-100 text-green-700">CREDIT</span>
        : <span className="inline-flex px-1.5 py-0.5 rounded text-[9px] font-black bg-red-100 text-red-600">DEBIT</span>;

    return (
        <Modal title={`Credits / Debits — Invoice ${invoiceNo}`} icon={CreditCard} onClose={onClose} size="xl"
            footer={
                mode === "form" ? (
                    <>
                        <button onClick={() => setMode("list")} className="px-4 py-2 rounded border text-sm font-bold text-gray-600 hover:bg-gray-100">Back</button>
                        <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 rounded bg-green-600 text-white text-sm font-bold hover:bg-green-700 disabled:opacity-50">
                            {saving && <Loader2 size={12} className="animate-spin" />}Save
                        </button>
                    </>
                ) : (
                    <button onClick={onClose} className="px-4 py-2 rounded border text-sm font-bold text-gray-600 hover:bg-gray-100">Close</button>
                )
            }>

            {mode === "form" ? (
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-6">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Type</label>
                        {(["C", "D"] as const).map(tp => (
                            <label key={tp} className="flex items-center gap-1.5 text-xs cursor-pointer">
                                <input type="radio" checked={formType === tp} onChange={() => setFormType(tp)} className="accent-orange-500" />
                                <span className={tp === "C" ? "text-green-700 font-bold" : "text-red-600 font-bold"}>{tp === "C" ? "Credit" : "Debit"}</span>
                            </label>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Date</label>
                            <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} className="border rounded px-2 py-1 text-sm" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Amount</label>
                            <input type="number" step="0.01" min="0" value={formAmount} onChange={e => setFormAmount(e.target.value)} className="border rounded px-2 py-1 text-sm text-right" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Reason</label>
                        <select value={formReason} onChange={e => setFormReason(e.target.value)} className="border rounded px-2 py-1 text-sm">
                            <option value="">— Select —</option>
                            {reasonsList.map((r: any) => <option key={t(r.UNICO)} value={t(r.UNICO)}>{t(r.REASON)}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Details / Notes</label>
                        <input type="text" value={formDetails} onChange={e => setFormDetails(e.target.value)} maxLength={100} className="border rounded px-2 py-1 text-sm" />
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 justify-between">
                        <span className="text-xs text-gray-500">{growerName}</span>
                        <div className="flex gap-2">
                            {perms.canCreate && (
                                <>
                                    <button onClick={() => openAdd("C")} className="flex items-center gap-1 px-3 h-7 rounded bg-green-600 text-white text-[11px] font-bold hover:bg-green-700"><Plus size={11} />Credit</button>
                                    <button onClick={() => openAdd("D")} className="flex items-center gap-1 px-3 h-7 rounded bg-red-500 text-white text-[11px] font-bold hover:bg-red-600"><Plus size={11} />Debit</button>
                                </>
                            )}
                            <button onClick={() => refetch()} title="Refresh" className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700">
                                <RefreshCcw size={13} className={isFetching ? "animate-spin" : ""} />
                            </button>
                        </div>
                    </div>
                    <PanelGridTable>
                        <PanelGridThead>
                            <PanelGridTh align="center">#</PanelGridTh>
                            <PanelGridTh>Type</PanelGridTh>
                            <PanelGridTh>Date</PanelGridTh>
                            <PanelGridTh>Reason</PanelGridTh>
                            <PanelGridTh align="right">Amount</PanelGridTh>
                            <PanelGridTh>Details</PanelGridTh>
                            <PanelGridTh className="w-20">{""}</PanelGridTh>
                        </PanelGridThead>
                        <PanelGridTbody>
                            {isFetching && crdbList.length === 0 ? (
                                <PanelGridTr><PanelGridTd colSpan={7} className="py-8 text-center text-gray-400 italic">Loading…</PanelGridTd></PanelGridTr>
                            ) : crdbList.length === 0 ? (
                                <PanelGridTr><PanelGridTd colSpan={7} className="py-8 text-center text-gray-400 italic">No credits or debits on this invoice</PanelGridTd></PanelGridTr>
                            ) : crdbList.map((row: any, i: number) => (
                                <PanelGridTr key={i}>
                                    <PanelGridTd align="center" className="text-gray-400 text-[10px]">{t(row.CD_NO)}</PanelGridTd>
                                    <PanelGridTd>{typeBadge(row.TYPE)}</PanelGridTd>
                                    <PanelGridTd>{fmtDate(row.CD_DATE)}</PanelGridTd>
                                    <PanelGridTd>{t(row.REASON)}</PanelGridTd>
                                    <PanelGridTd align="right" className={cn("font-semibold", t(row.TYPE) === "C" ? "text-green-600" : "text-red-500")}>{fmt(row.CD_AMOUNT)}</PanelGridTd>
                                    <PanelGridTd className="text-gray-500 text-[10px]">{t(row.CD_DETAILS)}</PanelGridTd>
                                    <PanelGridTd>
                                        <div className="flex gap-1 justify-end">
                                            {perms.canReport && (
                                                <button onClick={() => onOpen(`/api/payment-authorizations/reports/crdb?crdb_uq=${encodeURIComponent(t(row.UNICO))}&type=${encodeURIComponent(t(row.TYPE))}`)}
                                                    title="PDF" className="p-1 text-gray-400 hover:text-orange-500 transition-colors"><Printer size={11} /></button>
                                            )}
                                            {perms.canEdit && (
                                                <button onClick={() => openEdit(row)} title="Edit"
                                                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"><Pencil size={11} /></button>
                                            )}
                                            {perms.canDelete && (
                                                <button onClick={() => handleDelete(t(row.UNICO))} title="Delete"
                                                    className="p-1 text-red-300 hover:text-red-600 transition-colors"><Trash2 size={11} /></button>
                                            )}
                                        </div>
                                    </PanelGridTd>
                                </PanelGridTr>
                            ))}
                        </PanelGridTbody>
                        {crdbList.length > 0 && (
                            <PanelGridTfoot>
                                <tr>
                                    <td colSpan={4} className="px-2 py-2 text-[10px] font-black text-gray-600 uppercase tracking-wide">
                                        {crdbList.length} record(s)
                                    </td>
                                    <td className="px-2 py-2 text-right text-[11px] font-black">
                                        <span className="text-green-600 mr-3">CR {fmt(crdbList.filter((r: any) => t(r.TYPE) === "C").reduce((s: number, r: any) => s + (parseFloat(r.CD_AMOUNT) || 0), 0))}</span>
                                        <span className="text-red-500">DB {fmt(crdbList.filter((r: any) => t(r.TYPE) === "D").reduce((s: number, r: any) => s + (parseFloat(r.CD_AMOUNT) || 0), 0))}</span>
                                    </td>
                                    <td colSpan={2} />
                                </tr>
                            </PanelGridTfoot>
                        )}
                    </PanelGridTable>
                </div>
            )}
        </Modal>
    );
}

// ─── ModalAddPayment ──────────────────────────────────────────────────────────
function ModalAddPayment({ banks, supplierUq, onClose, onSaved }: any) {
    const [bankUq,   setBankUq]   = useState("");
    const [amount,   setAmount]   = useState("0.00");
    const [total,    setTotal]    = useState("0.00");
    const [details,  setDetails]  = useState("");
    const [payDoc,   setPayDoc]   = useState("0");
    const [saving,   setSaving]   = useState(false);

    const handleSave = async () => {
        if (!bankUq)     { toast.warning("Select a bank."); return; }
        if (!supplierUq) { toast.warning("No vendor selected."); return; }
        setSaving(true);
        try {
            const r = await fetch("/api/payment-authorizations/outcomes/insert", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bank_uq: bankUq, supplier_uq: supplierUq, out_ammount: parseFloat(amount) || 0, out_total: parseFloat(total) || 0, details, pay_doc: parseInt(payDoc) || 0 }),
            }).then(r => r.json());
            if (!r.success) throw new Error(r.error || "Failed to create payment");
            toast.success("Payment authorization created.");
            onSaved(r.data);
        } catch (e: any) { toast.error(e.message); }
        finally { setSaving(false); }
    };

    return (
        <Modal title="New Payment Authorization" icon={DollarSign} onClose={onClose} size="sm"
            footer={
                <>
                    <button onClick={onClose} className="px-4 py-2 rounded border text-sm font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
                    <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 rounded bg-green-600 text-white text-sm font-bold hover:bg-green-700 disabled:opacity-50">
                        {saving && <Loader2 size={12} className="animate-spin" />}Save
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
                    <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="border rounded px-2 py-1 text-sm text-right" />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Total</label>
                    <input type="number" step="0.01" value={total} onChange={e => setTotal(e.target.value)} className="border rounded px-2 py-1 text-sm text-right" />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Pay Doc #</label>
                    <input type="number" value={payDoc} onChange={e => setPayDoc(e.target.value)} className="border rounded px-2 py-1 text-sm text-right" />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Details / Notes</label>
                    <input type="text" value={details} onChange={e => setDetails(e.target.value)} maxLength={100} className="border rounded px-2 py-1 text-sm" />
                </div>
            </div>
        </Modal>
    );
}

function ModalEditPayment({ uq, banks, onClose, onSaved }: { uq: string; banks: any[]; onClose: () => void; onSaved: () => void }) {
    const [loading,   setLoading]   = useState(true);
    const [saving,    setSaving]    = useState(false);
    const [bankUq,    setBankUq]    = useState("");
    const [outDate,   setOutDate]   = useState("");
    const [amount,    setAmount]    = useState("0.00");
    const [total,     setTotal]     = useState("0.00");
    const [details,   setDetails]   = useState("");
    const [payDoc,    setPayDoc]    = useState("0");

    useEffect(() => {
        fetch(`/api/payment-authorizations/outcomes/${encodeURIComponent(uq)}`)
            .then(r => r.json())
            .then((d: any) => {
                if (d) {
                    setBankUq(t(d.BANK_UQ ?? d.bank_uq ?? ""));
                    const raw = d.OUT_DATE ?? d.out_date ?? "";
                    const parsed = raw ? new Date(raw) : null;
                    setOutDate(parsed && !isNaN(parsed.getTime()) ? parsed.toLocaleDateString("en-CA") : "");
                    setAmount(String(parseFloat(d.OUT_AMMOUNT ?? d.out_ammount ?? "0") || 0));
                    setTotal(String(parseFloat(d.OUT_TOTAL ?? d.out_total ?? "0") || 0));
                    setDetails(t(d.DETAILS ?? d.details ?? ""));
                    setPayDoc(String(parseInt(d.PAY_DOC ?? d.pay_doc ?? "0") || 0));
                }
            })
            .catch((e: any) => toast.error(e.message))
            .finally(() => setLoading(false));
    }, [uq]);

    const handleSave = async () => {
        if (!bankUq)  { toast.warning("Select a bank."); return; }
        if (!outDate) { toast.warning("Select a date."); return; }
        setSaving(true);
        try {
            const r = await fetch(`/api/payment-authorizations/outcomes/${encodeURIComponent(uq)}`, {
                method: "PUT", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bank_uq: bankUq, out_date: outDate, out_ammount: parseFloat(amount) || 0, out_total: parseFloat(total) || 0, details, pay_doc: parseInt(payDoc) || 0 }),
            }).then(r => r.json());
            if (!r.success) throw new Error(r.error || "Failed to update payment");
            toast.success("Payment updated.");
            onSaved();
        } catch (e: any) { toast.error(e.message); }
        finally { setSaving(false); }
    };

    return (
        <Modal title="Edit Payment Authorization" icon={Pencil} onClose={onClose} size="sm"
            footer={
                <>
                    <button onClick={onClose} className="px-4 py-2 rounded border text-sm font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
                    <button onClick={handleSave} disabled={saving || loading} className="flex items-center gap-1.5 px-4 py-2 rounded bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-50">
                        {saving && <Loader2 size={12} className="animate-spin" />}Save
                    </button>
                </>
            }>
            {loading ? (
                <div className="flex items-center gap-2 text-gray-400 text-xs py-4"><Loader2 size={14} className="animate-spin" />Loading…</div>
            ) : (
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Bank</label>
                        <select value={bankUq} onChange={e => setBankUq(e.target.value)} className="border rounded px-2 py-1 text-sm">
                            <option value="">— Select Bank —</option>
                            {banks.map((b: any) => <option key={t(b.UNICO)} value={t(b.UNICO)}>{t(b.BANK)}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Date</label>
                        <input type="date" value={outDate} onChange={e => setOutDate(e.target.value)} className="border rounded px-2 py-1 text-sm" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Amount</label>
                        <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="border rounded px-2 py-1 text-sm text-right" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Total</label>
                        <input type="number" step="0.01" value={total} onChange={e => setTotal(e.target.value)} className="border rounded px-2 py-1 text-sm text-right" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Pay Doc #</label>
                        <input type="number" value={payDoc} onChange={e => setPayDoc(e.target.value)} className="border rounded px-2 py-1 text-sm text-right" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Details / Notes</label>
                        <input type="text" value={details} onChange={e => setDetails(e.target.value)} maxLength={100} className="border rounded px-2 py-1 text-sm" />
                    </div>
                </div>
            )}
        </Modal>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PaymentAuthorizationsPage() {
    const { status }  = useSession();
    const router      = useRouter();
    const qc          = useQueryClient();
    const { logAction } = useAuditLog("payment-authorizations", "flower_accounts_outcome");
    const perms       = usePagePermissions("payment-authorizations");
    const store       = usePaymentAuthorizationsStore();

    // ── UI state ──────────────────────────────────────────────────────────────
    const [activeTab,          setActiveTab]          = useState<"vendors" | "invoices" | "payments">("vendors");
    const [activeBar,          setActiveBar]          = useState<"invoices" | "payments" | null>(null);
    const [invoiceBalFilter,   setInvoiceBalFilter]   = useState<"pos" | "zero" | "all">("pos");
    const [vendorSearch,       setVendorSearch]       = useState("");
    const [vendorBalFilter,    setVendorBalFilter]    = useState<"A" | "B" | "N">("B");
    const [vendorMode,         setVendorMode]         = useState<"all" | "quarterly">("all");
    const [quarterDetail,        setQuarterDetail]        = useState<any[]>([]);
    const [quarterDetailModal,   setQuarterDetailModal]   = useState(false);
    const [loadingQDetail,       setLoadingQDetail]       = useState(false);
    const [quarterSummaryModal,  setQuarterSummaryModal]  = useState(false);
    const [qSumSel,              setQSumSel]              = useState<{ uq: string; name: string } | null>(null);
    const [qSumDetail,           setQSumDetail]           = useState<any[]>([]);
    const [loadingQSumDetail,    setLoadingQSumDetail]    = useState(false);

    // Row selections
    const [selInvoiceRow,  setSelInvoiceRow]  = useState<any>(null);
    const [selOutcomeRow,  setSelOutcomeRow]  = useState<any>(null);
    const [selDetailRow,   setSelDetailRow]   = useState<any>(null);

    // Modals
    const [reportsModal,        setReportsModal]        = useState(false);
    const [paymentsReportModal, setPaymentsReportModal] = useState(false);
    const [dateHistoryModal,    setDateHistoryModal]    = useState(false);
    const [addPaymentModal,     setAddPaymentModal]     = useState(false);
    const [editPaymentModal,    setEditPaymentModal]    = useState(false);
    const [crdbModal,           setCrdbModal]           = useState(false);
    const [reportModalUrl,      setReportModalUrl]      = useState<string | null>(null);

    // ── Auth guard ────────────────────────────────────────────────────────────
    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
    }, [status, router]);

    useEffect(() => { setActiveBar(null); }, [activeTab]);

    // ── Queries ───────────────────────────────────────────────────────────────
    const { data: growersList = EMPTY_ARR } = useQuery({
        queryKey: ["pa-growers"],
        queryFn:  () => paFetch("/api/payment-authorizations/growers?all=0").then(d => norm(Array.isArray(d) ? d : [])),
        staleTime: 5 * 60 * 1000,
    });
    const { data: banksList = EMPTY_ARR } = useQuery({
        queryKey: ["pa-banks"],
        queryFn:  () => paFetch("/api/payment-authorizations/banks").then(d => norm(Array.isArray(d) ? d : [])),
        staleTime: 5 * 60 * 1000,
    });

    const { data: vendorsList = EMPTY_ARR, isFetching: loadingVendors, refetch: refetchVendors } = useQuery({
        queryKey: ["pa-vendors"],
        queryFn:  () => paFetch("/api/payment-authorizations/vendors?grower=").then(d => norm(Array.isArray(d) ? d : [])),
        staleTime: 0,
    });
    const { data: vendorsSummary = EMPTY_ARR, isFetching: loadingVendorsSummary, refetch: refetchVendorsSummary } = useQuery({
        queryKey: ["pa-vendors-summary"],
        queryFn:  () => paFetch("/api/payment-authorizations/vendors-summary").then(d => norm(Array.isArray(d) ? d : [])),
        staleTime: 0,
    });

    const { data: invoicesList = EMPTY_ARR, isFetching: loadingInvoices, refetch: refetchInvoices } = useQuery({
        queryKey: ["pa-invoices", store.lcgrower_uq, invoiceBalFilter],
        queryFn:  () => paFetch(`/api/payment-authorizations/invoices?supplier_uq=${encodeURIComponent(store.lcgrower_uq)}&balance=${invoiceBalFilter}`).then(d => norm(Array.isArray(d) ? d : [])),
        enabled:  !!store.lcgrower_uq,
        staleTime: 0,
    });

    const { data: outcomesList = EMPTY_ARR, isFetching: loadingOutcomes, refetch: refetchOutcomes } = useQuery({
        queryKey: ["pa-outcomes", store.lcgrower_uq, store.ldPaymentsFrom, store.lnclose],
        queryFn:  () => paFetch(`/api/payment-authorizations/outcomes?grower_uq=${encodeURIComponent(store.lcgrower_uq)}&ldfrom=${store.ldPaymentsFrom || "2000-01-01"}&lnclose=${store.lnclose}`).then(d => norm(Array.isArray(d) ? d : [])),
        enabled:  !!store.lcgrower_uq,
        staleTime: 0,
    });

    const { data: outcomeDetails = EMPTY_ARR, isFetching: loadingDetails } = useQuery({
        queryKey: ["pa-outcome-details", store.lcapd_uq],
        queryFn:  () => paFetch(`/api/payment-authorizations/outcome-details?acc_payd_uq=${encodeURIComponent(store.lcapd_uq)}`).then(d => norm(Array.isArray(d) ? d : [])),
        enabled:  !!store.lcapd_uq,
        staleTime: 0,
    });

    const { data: paymentInvoices = EMPTY_ARR, isFetching: loadingPayInv } = useQuery({
        queryKey: ["pa-payment-invoices", store.lcoutcome_uq],
        queryFn:  () => paFetch(`/api/payment-authorizations/payment-invoices?payment_uq=${encodeURIComponent(store.lcoutcome_uq)}`).then(d => norm(Array.isArray(d) ? d : [])),
        enabled:  !!store.lcoutcome_uq,
        staleTime: 0,
    });

    // ── Mutations ─────────────────────────────────────────────────────────────
    const approveMutation = useMutation({
        mutationFn: async ({ unico, approved }: { unico: string; approved: boolean }) => {
            const r = await fetch("/api/payment-authorizations/approve", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ unico, approved }),
            }).then(r => r.json());
            if (!r.success) throw new Error(r.error || "Failed to update approval");
            return r;
        },
        onSuccess: (_, vars) => {
            logAction("Edit", vars.unico, vars.approved ? "Approve AP Payment Authorization" : "UnApprove AP Payment Authorization");
            toast.success(vars.approved ? "Invoice approved." : "Invoice un-approved.");
            qc.invalidateQueries({ queryKey: ["pa-invoices", store.lcgrower_uq, invoiceBalFilter] });
        },
        onError: (e: any) => toast.error(e.message),
    });

    const closePaymentMutation = useMutation({
        mutationFn: async (payment_uq: string) => {
            const r = await fetch("/api/payment-authorizations/outcomes/close", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ payment_uq }),
            }).then(r => r.json());
            if (!r.success) throw new Error(r.error || "Failed to close payment");
            return r;
        },
        onSuccess: (_, payment_uq) => {
            logAction("Edit", payment_uq, "Close/AutoPay Payment Authorization");
            toast.success("Payment closed.");
            qc.invalidateQueries({ queryKey: ["pa-outcomes", store.lcgrower_uq, store.ldPaymentsFrom, store.lnclose] });
        },
        onError: (e: any) => toast.error(e.message),
    });

    const deleteDetailMutation = useMutation({
        mutationFn: async (unico: string) => {
            const r = await fetch("/api/payment-authorizations/outcome-details", {
                method: "DELETE", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ unico }),
            }).then(r => r.json());
            if (!r.success) throw new Error(r.error || "Failed to delete detail");
            return r;
        },
        onSuccess: (_, unico) => {
            logAction("Delete", unico, "Delete Payment Detail");
            toast.success("Detail deleted.");
            setSelDetailRow(null);
            qc.invalidateQueries({ queryKey: ["pa-outcome-details", store.lcapd_uq] });
        },
        onError: (e: any) => toast.error(e.message),
    });

    const deletePaymentMutation = useMutation({
        mutationFn: async (unico: string) => {
            const r = await fetch(`/api/payment-authorizations/outcomes/${encodeURIComponent(unico)}`, {
                method: "DELETE",
            }).then(r => r.json());
            if (!r.success) throw new Error(r.error || "Failed to delete payment");
            return r;
        },
        onSuccess: (_, unico) => {
            logAction("Delete", unico, "Delete Payment Authorization");
            toast.success("Payment deleted.");
            setSelOutcomeRow(null);
            store.setOutcomeUq("");
            qc.invalidateQueries({ queryKey: ["pa-outcomes", store.lcgrower_uq, store.ldPaymentsFrom, store.lnclose] });
        },
        onError: (e: any) => toast.error(e.message),
    });

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleApprove = (approved: boolean) => {
        if (!store.lcap_uq) { toast.warning("Select an invoice."); return; }
        if (!perms.canEdit) { toast.error(PERMISSION_MSGS.edit); return; }
        approveMutation.mutate({ unico: store.lcap_uq, approved });
    };

    const handleClosePayment = () => {
        if (!store.lcoutcome_uq) { toast.warning("Select a payment."); return; }
        if (!perms.canEdit) { toast.error(PERMISSION_MSGS.edit); return; }
        toastConfirm("Auto-pay / close this payment?", () => closePaymentMutation.mutate(store.lcoutcome_uq));
    };

    const handleSelectInvoice = (row: any, uq: string) => {
        const desel = store.lcap_uq === uq;
        store.setApUq(desel ? "" : uq);
        store.setApdUq(desel ? "" : uq);
        setSelInvoiceRow(desel ? null : row);
        setActiveBar(desel ? null : "invoices");
    };

    const handleSelectOutcome = (row: any, uq: string) => {
        const desel = store.lcoutcome_uq === uq;
        store.setOutcomeUq(desel ? "" : uq);
        setSelOutcomeRow(desel ? null : row);
        setActiveBar(desel ? null : "payments");
    };

    // ── Computed ──────────────────────────────────────────────────────────────
    const activeVendorData   = vendorMode === "all" ? vendorsList : vendorsSummary;
    const loadingVendorData  = vendorMode === "all" ? loadingVendors : loadingVendorsSummary;

    const getVendorRow = (row: any) => {
        if (vendorMode === "all") {
            const inv = parseFloat(row.TOTAL_INVOICE)  || 0;
            const cre = parseFloat(row.TOTAL_CREDITS)  || 0;
            const deb = parseFloat(row.TOTAL_DEBITS)   || 0;
            const net = inv - cre - deb;
            const pay = parseFloat(row.TOTAL_PAYMENTS) || 0;
            const bal = parseFloat(row.TOTAL_INV_BAL)  || 0;
            return { inv, cre, deb, net, pay, bal };
        } else {
            return {
                inv: parseFloat(row.TOTAL_INVOICE)   || 0,
                cre: parseFloat(row.TOTAL_CREDITS)   || 0,
                deb: parseFloat(row.TOTAL_DEBITS)    || 0,
                net: parseFloat(row.TOTAL_INV_BAL)   || 0,
                pay: parseFloat(row.TOTAL_PAYMENTS)  || 0,
                bal: parseFloat(row.TOTAL_BOOKS_BAL) || 0,
            };
        }
    };

    const filteredVendors = useMemo(() => activeVendorData.filter((row: any) => {
        if (vendorSearch && !t(row.GROWER).toUpperCase().includes(vendorSearch.toUpperCase())) return false;
        if (vendorBalFilter !== "A") {
            const { bal } = getVendorRow(row);
            if (vendorBalFilter === "B" && bal <= 0) return false;
            if (vendorBalFilter === "N" && bal >  0) return false;
        }
        return true;
    }), [activeVendorData, vendorSearch, vendorBalFilter, vendorMode]);

    const vendorTotals = useMemo(() => filteredVendors.reduce((acc: any, r: any) => {
        const { inv, cre, deb, net, pay, bal } = getVendorRow(r);
        return { inv: acc.inv + inv, cre: acc.cre + cre, deb: acc.deb + deb, net: acc.net + net, pay: acc.pay + pay, bal: acc.bal + bal };
    }, { inv: 0, cre: 0, deb: 0, net: 0, pay: 0, bal: 0 }), [filteredVendors]);

    const invTotals = useMemo(() => invoicesList.reduce((acc: any, r: any) => ({
        ammount:  acc.ammount  + (parseFloat(r.AMMOUNT)     || 0),
        credits:  acc.credits  + (parseFloat(r.CRE_AMMOUNT) || 0),
        debits:   acc.debits   + (parseFloat(r.DEB_AMMOUNT) || 0),
        payments: acc.payments + (parseFloat(r.OUT_AMMOUNT) || 0),
        balance:  acc.balance  + (parseFloat(r.BALANCE)     || 0),
    }), { ammount: 0, credits: 0, debits: 0, payments: 0, balance: 0 }), [invoicesList]);

    // ── Balance filter buttons (shared style) ─────────────────────────────────
    const BalBtn = ({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) => (
        <button onClick={onClick} className={cn("px-3 h-7 text-[14px] font-semibold uppercase rounded transition-colors",
            active ? "bg-[#FB7506] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
            {label}
        </button>
    );

    if (status === "loading") return (
        <div className="flex items-center justify-center h-screen">
            <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
    );

    return (
        <div className="flex flex-col h-[100dvh] bg-[#f4f6f8] overflow-hidden font-sans text-[#333]">

            <AppHeader title="Payment Authorizations" icon={DollarSign} useBack
                extraRight={store.lcgrower ? <span className="text-xs text-white/70 hidden sm:inline">{store.lcgrower}</span> : undefined}
            />

            {/* ── Tabs ──────────────────────────────────────────────────────── */}
            <div className="flex bg-white border-b shrink-0">
                {([
                    { key: "vendors",  label: "Vendors",         icon: Users      },
                    { key: "invoices", label: "Vendor Invoices", icon: FileText   },
                    { key: "payments", label: "Payments",        icon: CreditCard },
                ] as const).map(({ key, label, icon: Icon }) => (
                    <button key={key} onClick={() => setActiveTab(key)}
                        className={cn("flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors",
                            activeTab === key ? "border-[#FB7506] text-[#FB7506]" : "border-transparent text-gray-500 hover:text-gray-700")}>
                        <Icon size={13} />{label}
                    </button>
                ))}
            </div>

            {/* ── Tab Content ───────────────────────────────────────────────── */}
            <div className="flex-1 overflow-hidden p-2 min-h-0">

                {/* ═══════════════════ TAB 1: VENDORS ═══════════════════ */}
                {activeTab === "vendors" && (
                    <PanelGrid
                        title={vendorMode === "quarterly" ? "Vendors — Last 4 Months" : "Vendors"}
                        icon={Building2}
                        recordCount={filteredVendors.length}
                        refreshing={loadingVendorData}
                        onRefresh={() => vendorMode === "all" ? refetchVendors() : refetchVendorsSummary()}
                        searchValue={vendorSearch}
                        onSearchChange={setVendorSearch}
                        headerRight={
                            <div className="flex gap-2">
                                <BalBtn active={vendorBalFilter === "B"} onClick={() => setVendorBalFilter("B")} label="Bal +" />
                                <BalBtn active={vendorBalFilter === "N"} onClick={() => setVendorBalFilter("N")} label="Bal=0" />
                                <BalBtn active={vendorBalFilter === "A"} onClick={() => setVendorBalFilter("A")} label="All" />
                            </div>
                        }
                        menuItems={[
                            { label: "All Vendors",     icon: Users,     color: "gray", onClick: () => { setVendorMode("all"); refetchVendors(); } },
                            { label: "4 Months View",   icon: BarChart2, color: "blue", onClick: () => { refetchVendorsSummary(); setQuarterSummaryModal(true); } },
                            { separator: true },
                            { label: "History",         icon: Calendar,  color: "gray", onClick: () => setDateHistoryModal(true) },
                        ]}
                        className="h-full flex flex-col min-h-0"
                    >
                        <PanelGridTable>
                            <PanelGridThead>
                                <PanelGridTh>Vendor</PanelGridTh>
                                <PanelGridTh align="right">T.Invoice</PanelGridTh>
                                <PanelGridTh align="right">T.Credits</PanelGridTh>
                                <PanelGridTh align="right">T.Debits</PanelGridTh>
                                <PanelGridTh align="right">Net Invoice</PanelGridTh>
                                <PanelGridTh align="right">Payments</PanelGridTh>
                                <PanelGridTh align="right">Inv-Bal</PanelGridTh>
                            </PanelGridThead>
                            <PanelGridTbody>
                                {filteredVendors.length === 0 ? (
                                    <PanelGridTr><PanelGridTd colSpan={7} className="py-10 text-center text-gray-400 italic">
                                        {loadingVendorData ? "Loading…" : "No vendors found"}
                                    </PanelGridTd></PanelGridTr>
                                ) : filteredVendors.map((row: any, i: number) => {
                                    const uq  = t(row.UNICO);
                                    const sel = store.lcgrower_uq === uq;
                                    const { inv, cre, deb, net, pay, bal } = getVendorRow(row);
                                    return (
                                        <PanelGridTr key={i} selected={sel}
                                            onClick={() => { store.setGrowerUq(uq, t(row.GROWER)); setSelInvoiceRow(null); setSelOutcomeRow(null); setInvoiceBalFilter("pos"); }}>
                                            <PanelGridTd className="font-medium min-w-[180px]">
                                                <span className="text-[#FB7506] font-bold mr-1.5">{t(row.CODE ?? row.VENDOR_CODE ?? "")}</span>
                                                {t(row.GROWER)}
                                            </PanelGridTd>
                                            <PanelGridTd align="right">{fmt(inv)}</PanelGridTd>
                                            <PanelGridTd align="right" className="text-green-600">{fmt(cre)}</PanelGridTd>
                                            <PanelGridTd align="right" className="text-red-500">{fmt(deb)}</PanelGridTd>
                                            <PanelGridTd align="right" className="font-semibold">{fmt(net)}</PanelGridTd>
                                            <PanelGridTd align="right" className="text-blue-700">{fmt(pay)}</PanelGridTd>
                                            <PanelGridTd align="right" className={cn("font-bold", bal > 0 ? "text-orange-600" : "")}>{fmt(bal)}</PanelGridTd>
                                        </PanelGridTr>
                                    );
                                })}
                            </PanelGridTbody>
                            {filteredVendors.length > 0 && (
                                <PanelGridTfoot>
                                    <tr>
                                        <td className="px-2 py-2 text-[10px] font-black text-gray-600 uppercase tracking-wide">
                                            TOTALS ({filteredVendors.length})
                                        </td>
                                        <td className="px-2 py-2 text-right font-black text-[11px]">{fmt(vendorTotals.inv)}</td>
                                        <td className="px-2 py-2 text-right font-black text-[11px] text-green-600">{fmt(vendorTotals.cre)}</td>
                                        <td className="px-2 py-2 text-right font-black text-[11px] text-red-500">{fmt(vendorTotals.deb)}</td>
                                        <td className="px-2 py-2 text-right font-black text-[11px]">{fmt(vendorTotals.net)}</td>
                                        <td className="px-2 py-2 text-right font-black text-[11px] text-blue-700">{fmt(vendorTotals.pay)}</td>
                                        <td className="px-2 py-2 text-right font-black text-[11px] text-orange-600">{fmt(vendorTotals.bal)}</td>
                                    </tr>
                                </PanelGridTfoot>
                            )}
                        </PanelGridTable>
                    </PanelGrid>
                )}

                {/* ═══════════════════ TAB 2: INVOICES ═══════════════════ */}
                {activeTab === "invoices" && (
                    <div className="flex flex-col h-full gap-2">
                        <PanelGrid
                            title={store.lcgrower ? `Vendor Invoices — ${store.lcgrower}` : "Vendor Invoices"}
                            icon={FileText}
                            recordCount={invoicesList.length}
                            refreshing={loadingInvoices || approveMutation.isPending}
                            onRefresh={refetchInvoices}
                            headerRight={
                                <div className="flex gap-2">
                                    <BalBtn active={invoiceBalFilter === "pos"}  onClick={() => { setInvoiceBalFilter("pos");  setSelInvoiceRow(null); store.setApUq(""); store.setApdUq(""); }} label="Bal +" />
                                    <BalBtn active={invoiceBalFilter === "zero"} onClick={() => { setInvoiceBalFilter("zero"); setSelInvoiceRow(null); store.setApUq(""); store.setApdUq(""); }} label="Bal=0" />
                                    <BalBtn active={invoiceBalFilter === "all"}  onClick={() => { setInvoiceBalFilter("all");  setSelInvoiceRow(null); store.setApUq(""); store.setApdUq(""); }} label="All" />
                                </div>
                            }
                            menuItems={[
                                { label: "Approve",         icon: Check,      color: "green", onClick: () => handleApprove(true),  disabled: !selInvoiceRow || !perms.canEdit },
                                { label: "Un-Approve",      icon: XCircle,    color: "gray",  onClick: () => handleApprove(false), disabled: !selInvoiceRow || !perms.canEdit },
                                { separator: true },
                                { label: "Credits/Debits",  icon: CreditCard, color: "blue",  onClick: () => {
                                    if (!selInvoiceRow) { toast.warning("Select an invoice first."); return; }
                                    setCrdbModal(true);
                                }, disabled: !selInvoiceRow },
                                { separator: true },
                                { label: "Reports",         icon: Printer,    color: "gray",  onClick: () => setReportsModal(true), disabled: !perms.canReport },
                                { label: "History",         icon: Calendar,   color: "gray",  onClick: () => setDateHistoryModal(true) },
                            ]}
                            className="flex-1 flex flex-col min-h-0"
                        >
                            {!store.lcgrower_uq ? (
                                <div className="flex-1 flex items-center justify-center gap-2 text-gray-400 text-xs p-8">
                                    <AlertCircle size={14} /> Select a vendor from the Vendors tab
                                </div>
                            ) : (
                                <PanelGridTable>
                                    <PanelGridThead>
                                        <PanelGridTh>Invoice</PanelGridTh>
                                        <PanelGridTh align="right">PO</PanelGridTh>
                                        <PanelGridTh>Inv.Date</PanelGridTh>
                                        <PanelGridTh align="right">Days</PanelGridTh>
                                        <PanelGridTh align="right">%</PanelGridTh>
                                        <PanelGridTh>Due Date</PanelGridTh>
                                        <PanelGridTh align="right">Amount</PanelGridTh>
                                        <PanelGridTh align="right">Payments</PanelGridTh>
                                        <PanelGridTh align="right">Credits</PanelGridTh>
                                        <PanelGridTh align="right">Debits</PanelGridTh>
                                        <PanelGridTh align="right">Balance</PanelGridTh>
                                        <PanelGridTh align="center">Approved</PanelGridTh>
                                        <PanelGridTh align="center">Pay</PanelGridTh>
                                        <PanelGridTh align="right">Accum.Bal</PanelGridTh>
                                    </PanelGridThead>
                                    <PanelGridTbody>
                                        {invoicesList.length === 0 ? (
                                            <PanelGridTr><PanelGridTd colSpan={14} className="py-10 text-center text-gray-400 italic">No invoices found</PanelGridTd></PanelGridTr>
                                        ) : invoicesList.map((row: any) => {
                                            const uq       = t(row.UNICO);
                                            const sel      = store.lcap_uq === uq;
                                            const bal      = parseFloat(row.BALANCE) || 0;
                                            const approved = row.APPROVED == null ? "—" : t(row.APPROVED);
                                            return (
                                                <PanelGridTr key={uq} selected={sel} onClick={() => handleSelectInvoice(row, uq)}>
                                                    <PanelGridTd className="font-bold text-[#FB7506]">{t(row.INVOICE_NO)}</PanelGridTd>
                                                    <PanelGridTd align="right" className="text-[#FB7506] font-medium">{t(row.PORDER_NO) === "0" ? "" : t(row.PORDER_NO)}</PanelGridTd>
                                                    <PanelGridTd>{fmtDate(row.APDATE)}</PanelGridTd>
                                                    <PanelGridTd align="right">{t(row.DAYS)}</PanelGridTd>
                                                    <PanelGridTd align="right">{t(row.PERCEN)}</PanelGridTd>
                                                    <PanelGridTd>{fmtDate(row.DATE_DUE)}</PanelGridTd>
                                                    <PanelGridTd align="right">{fmt(row.AMMOUNT)}</PanelGridTd>
                                                    <PanelGridTd align="right" className="text-blue-700">{fmt(row.OUT_AMMOUNT)}</PanelGridTd>
                                                    <PanelGridTd align="right" className="text-green-600">{fmt(row.CRE_AMMOUNT)}</PanelGridTd>
                                                    <PanelGridTd align="right" className="text-red-500">{fmt(row.DEB_AMMOUNT)}</PanelGridTd>
                                                    <PanelGridTd align="right" className={cn("font-bold", bal > 0 ? "text-orange-600" : "text-green-600")}>{fmt(row.BALANCE)}</PanelGridTd>
                                                    <PanelGridTd align="center" className={cn("font-bold", approved === "Yes" ? "text-green-600" : "text-gray-400")}>{approved}</PanelGridTd>
                                                    <PanelGridTd align="center">{row.PAY ? <Check size={12} className="text-green-500 inline" /> : ""}</PanelGridTd>
                                                    <PanelGridTd align="right" className="font-semibold text-gray-600">{fmt(row.ACCUMULATED)}</PanelGridTd>
                                                </PanelGridTr>
                                            );
                                        })}
                                    </PanelGridTbody>
                                    {invoicesList.length > 0 && (
                                        <PanelGridTfoot>
                                            <tr>
                                                <td className="px-2 py-2 text-[10px] font-black text-gray-600 uppercase tracking-wide" colSpan={6}>
                                                    TOTALS ({invoicesList.length} invoices)
                                                </td>
                                                <td className="px-2 py-2 text-right font-black text-[11px]">{fmt(invTotals.ammount)}</td>
                                                <td className="px-2 py-2 text-right font-black text-[11px] text-blue-700">{fmt(invTotals.payments)}</td>
                                                <td className="px-2 py-2 text-right font-black text-[11px] text-green-600">{fmt(invTotals.credits)}</td>
                                                <td className="px-2 py-2 text-right font-black text-[11px] text-red-600">{fmt(invTotals.debits)}</td>
                                                <td className="px-2 py-2 text-right font-black text-[11px] text-orange-600">{fmt(invTotals.balance)}</td>
                                                <td colSpan={3} />
                                            </tr>
                                        </PanelGridTfoot>
                                    )}
                                </PanelGridTable>
                            )}
                        </PanelGrid>

                        {/* Outcome details mini-grid */}
                        {store.lcgrower_uq && (
                            <PanelGrid
                                title={selInvoiceRow ? `Applied Payments — ${t(selInvoiceRow.INVOICE_NO)}` : "Applied Payments"}
                                icon={CreditCard}
                                refreshing={loadingDetails || deleteDetailMutation.isPending}
                                className="h-36 shrink-0 flex flex-col"
                            >
                                <PanelGridTable>
                                    <PanelGridThead>
                                        <PanelGridTh>Outcome Ref</PanelGridTh>
                                        <PanelGridTh align="right">Amount</PanelGridTh>
                                        <PanelGridTh align="right">Pay Doc</PanelGridTh>
                                        <PanelGridTh className="w-8">{""}</PanelGridTh>
                                    </PanelGridThead>
                                    <PanelGridTbody>
                                        {!store.lcapd_uq ? (
                                            <PanelGridTr><PanelGridTd colSpan={4} className="py-4 text-center text-gray-400 italic">Select an invoice to see applied payments</PanelGridTd></PanelGridTr>
                                        ) : outcomeDetails.length === 0 ? (
                                            <PanelGridTr><PanelGridTd colSpan={4} className="py-4 text-center text-gray-400 italic">No payment records</PanelGridTd></PanelGridTr>
                                        ) : outcomeDetails.map((row: any, i: number) => (
                                            <PanelGridTr key={i} selected={selDetailRow === row}
                                                onClick={() => setSelDetailRow(selDetailRow === row ? null : row)}>
                                                <PanelGridTd className="font-bold text-[#FB7506]">{t(row.DATO ?? row.OUT_DOCUMENT ?? row.UNICO)}</PanelGridTd>
                                                <PanelGridTd align="right" className="text-blue-700 font-medium">{fmt(row.OUT_AMMOUNT)}</PanelGridTd>
                                                <PanelGridTd align="right">{t(row.PAY_DOC) === "0" ? "" : t(row.PAY_DOC)}</PanelGridTd>
                                                <PanelGridTd>
                                                    <button
                                                        onClick={e => { e.stopPropagation(); if (!perms.canDelete) { toast.error(PERMISSION_MSGS.delete); return; } toastConfirm("Delete this payment detail?", () => deleteDetailMutation.mutate(t(row.UNICO))); }}
                                                        className="p-1 text-red-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                                                        title="Delete">
                                                        <Trash2 size={10} />
                                                    </button>
                                                </PanelGridTd>
                                            </PanelGridTr>
                                        ))}
                                    </PanelGridTbody>
                                </PanelGridTable>
                            </PanelGrid>
                        )}
                    </div>
                )}

                {/* ═══════════════════ TAB 3: PAYMENTS ═══════════════════ */}
                {activeTab === "payments" && (
                    <div className="flex flex-col h-full gap-2">
                        <PanelGrid
                            title={store.lcgrower ? `Payments — ${store.lcgrower}` : "Payments"}
                            icon={CreditCard}
                            recordCount={outcomesList.length}
                            refreshing={loadingOutcomes || closePaymentMutation.isPending || deletePaymentMutation.isPending}
                            onRefresh={refetchOutcomes}
                            headerRight={
                                <div className="flex items-center gap-2">
                                    <input type="date" value={store.ldPaymentsFrom}
                                        onChange={e => { store.setLdPaymentsFrom(e.target.value); setSelOutcomeRow(null); }}
                                        className="bg-white text-gray-700 border border-gray-300 text-[14px] font-semibold rounded px-2 h-7 outline-none cursor-pointer"
                                    />
                                    <div className="flex gap-2">
                                        {([[-1, "All"], [0, "Pending"], [1, "Paid"]] as const).map(([val, lbl]) => (
                                            <BalBtn key={val} active={store.lnclose === val}
                                                onClick={() => { store.setLnclose(val); setSelOutcomeRow(null); }}
                                                label={lbl} />
                                        ))}
                                    </div>
                                </div>
                            }
                            menuItems={[
                                { label: "Add Payment",    icon: Plus,       color: "green",  onClick: () => { if (!perms.canCreate) { toast.error(PERMISSION_MSGS.create); return; } setAddPaymentModal(true); }, disabled: !store.lcgrower_uq || !perms.canCreate },
                                { label: "Edit Payment",   icon: Pencil,     color: "blue",   onClick: () => { if (!perms.canEdit) { toast.error(PERMISSION_MSGS.edit); return; } setEditPaymentModal(true); }, disabled: !selOutcomeRow || !perms.canEdit },
                                { label: "Delete Payment", icon: Trash2,     color: "red",    onClick: () => { if (!perms.canDelete) { toast.error(PERMISSION_MSGS.delete); return; } toastConfirm("Delete this payment authorization?", () => deletePaymentMutation.mutate(store.lcoutcome_uq)); }, disabled: !selOutcomeRow || !perms.canDelete },
                                { label: "Auto Pay",       icon: CheckCheck, color: "blue",   onClick: handleClosePayment, disabled: !selOutcomeRow || !perms.canEdit },
                                { separator: true },
                                { label: "Payment PDF",    icon: Printer,    color: "gray",   onClick: () => {
                                    if (!store.lcoutcome_uq) { toast.warning("Select a payment."); return; }
                                    setReportModalUrl(`/api/payment-authorizations/reports/payment-single?outcome_uq=${encodeURIComponent(store.lcoutcome_uq)}`);
                                }, disabled: !selOutcomeRow || !perms.canReport },
                                { label: "Reports",        icon: FileText,   color: "gray",   onClick: () => setPaymentsReportModal(true), disabled: !perms.canReport },
                                { separator: true },
                                { label: "History",        icon: Calendar,   color: "gray",   onClick: () => setDateHistoryModal(true) },
                            ]}
                            className="flex-1 flex flex-col min-h-0"
                        >
                            {!store.lcgrower_uq ? (
                                <div className="flex-1 flex items-center justify-center gap-2 text-gray-400 text-xs p-8">
                                    <AlertCircle size={14} /> Select a vendor from the Vendors tab
                                </div>
                            ) : outcomesList.length === 0 && !loadingOutcomes ? (
                                <div className="flex-1 flex items-center justify-center gap-2 text-gray-400 text-xs p-8">
                                    <AlertCircle size={14} /> No payments found for selected filters
                                </div>
                            ) : (
                                <PanelGridTable>
                                    <PanelGridThead>
                                        <PanelGridTh>Farm</PanelGridTh>
                                        <PanelGridTh>Bank</PanelGridTh>
                                        <PanelGridTh>Date</PanelGridTh>
                                        <PanelGridTh>Document</PanelGridTh>
                                        <PanelGridTh align="right">Amount</PanelGridTh>
                                        <PanelGridTh>Status</PanelGridTh>
                                    </PanelGridThead>
                                    <PanelGridTbody>
                                        {outcomesList.map((row: any) => {
                                            const uq     = t(row.UNICO);
                                            const sel    = store.lcoutcome_uq === uq;
                                            const status = t(row.STATUS).toUpperCase();
                                            const isPaid = status.includes("CLOSE") || status.includes("PAID");
                                            return (
                                                <PanelGridTr key={uq} selected={sel} onClick={() => handleSelectOutcome(row, uq)}>
                                                    <PanelGridTd className="font-medium">{t(row.FARM)}</PanelGridTd>
                                                    <PanelGridTd>{t(row.BANK)}</PanelGridTd>
                                                    <PanelGridTd>{fmtDate(row.OUT_DATE)}</PanelGridTd>
                                                    <PanelGridTd className="font-bold text-[#FB7506]">{t(row.OUT_DOCUMENT)}</PanelGridTd>
                                                    <PanelGridTd align="right" className="font-semibold">{fmt(row.OUT_AMMOUNT)}</PanelGridTd>
                                                    <PanelGridTd className={cn("font-semibold", isPaid ? "text-green-600" : "text-amber-600")}>{t(row.STATUS)}</PanelGridTd>
                                                </PanelGridTr>
                                            );
                                        })}
                                    </PanelGridTbody>
                                </PanelGridTable>
                            )}
                        </PanelGrid>

                        {/* Payment invoices mini-grid */}
                        <PanelGrid
                            title={selOutcomeRow ? `Invoices — ${t(selOutcomeRow.OUT_DOCUMENT)}` : "Invoices"}
                            icon={FileText}
                            refreshing={loadingPayInv}
                            className="h-40 shrink-0 flex flex-col"
                        >
                            <PanelGridTable>
                                <PanelGridThead>
                                    <PanelGridTh>Invoice</PanelGridTh>
                                    <PanelGridTh>Inv.Date</PanelGridTh>
                                    <PanelGridTh>Due Date</PanelGridTh>
                                    <PanelGridTh align="right">Amount</PanelGridTh>
                                    <PanelGridTh align="right">Payment</PanelGridTh>
                                    <PanelGridTh align="right">Balance</PanelGridTh>
                                </PanelGridThead>
                                <PanelGridTbody>
                                    {!store.lcoutcome_uq ? (
                                        <PanelGridTr><PanelGridTd colSpan={6} className="py-4 text-center text-gray-400 italic">Select a payment to view its invoices</PanelGridTd></PanelGridTr>
                                    ) : paymentInvoices.length === 0 ? (
                                        <PanelGridTr><PanelGridTd colSpan={6} className="py-4 text-center text-gray-400 italic">No invoices linked to this payment</PanelGridTd></PanelGridTr>
                                    ) : paymentInvoices.map((row: any, i: number) => {
                                        const amt = parseFloat(row.AMMOUNT)     || 0;
                                        const pay = parseFloat(row.OUT_AMMOUNT) || 0;
                                        const bal = parseFloat(row.LINE_BALANCE ?? row.BALANCE ?? (amt - pay).toFixed(2)) || (amt - pay);
                                        return (
                                            <PanelGridTr key={i}>
                                                <PanelGridTd className="font-bold text-[#FB7506]">{t(row.INVOICE_NO)}</PanelGridTd>
                                                <PanelGridTd>{fmtDate(row.INVOICE_DATE ?? row.APDATE)}</PanelGridTd>
                                                <PanelGridTd>{fmtDate(row.DATE_DUE ?? row.DUE_DATE)}</PanelGridTd>
                                                <PanelGridTd align="right">{fmt(amt)}</PanelGridTd>
                                                <PanelGridTd align="right" className="text-blue-700 font-medium">{fmt(pay)}</PanelGridTd>
                                                <PanelGridTd align="right" className="font-bold">{fmt(bal)}</PanelGridTd>
                                            </PanelGridTr>
                                        );
                                    })}
                                </PanelGridTbody>
                            </PanelGridTable>
                        </PanelGrid>
                    </div>
                )}
            </div>

            <AppFooter areaLabel="Vendor AP" />

            {/* ── Mobile FAB: Add Payment ────────────────────────────────────── */}
            {activeTab === "payments" && store.lcgrower_uq && (
                <button
                    onClick={() => { if (!perms.canCreate) { toast.error(PERMISSION_MSGS.create); return; } setAddPaymentModal(true); }}
                    className="md:hidden fixed bottom-24 right-4 z-30 w-14 h-14 bg-[#FB7506] hover:bg-orange-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all">
                    <Plus size={24} />
                </button>
            )}

            {/* ── Mobile Action Bar ──────────────────────────────────────────── */}
            <MobileActionBar
                activeGrid={activeBar}
                items={[
                    { grid: "invoices", label: "Approve",    icon: Check,       color: "green", onClick: () => handleApprove(true),  disabled: !selInvoiceRow || !perms.canEdit },
                    { grid: "invoices", label: "Un-Approve", icon: XCircle,     color: "gray",  onClick: () => handleApprove(false), disabled: !selInvoiceRow || !perms.canEdit },
                    { grid: "payments", label: "Auto Pay",   icon: CheckCheck,  color: "blue",  onClick: handleClosePayment, disabled: !selOutcomeRow || !perms.canEdit },
                    { grid: "payments", label: "Edit",       icon: Pencil,      color: "blue",  onClick: () => { if (!perms.canEdit) { toast.error(PERMISSION_MSGS.edit); return; } setEditPaymentModal(true); }, disabled: !selOutcomeRow || !perms.canEdit },
                    { grid: "payments", label: "Delete",     icon: Trash2,      color: "red",   onClick: () => { if (!perms.canDelete) { toast.error(PERMISSION_MSGS.delete); return; } toastConfirm("Delete this payment authorization?", () => deletePaymentMutation.mutate(store.lcoutcome_uq)); }, disabled: !selOutcomeRow || !perms.canDelete },
                    { grid: "payments", label: "Pay PDF",    icon: Printer,     color: "gray",  onClick: () => store.lcoutcome_uq && setReportModalUrl(`/api/payment-authorizations/reports/payment-single?outcome_uq=${encodeURIComponent(store.lcoutcome_uq)}`), disabled: !selOutcomeRow },
                ]}
                onClearSelection={() => {
                    if (activeBar === "invoices") { setSelInvoiceRow(null); store.setApUq(""); store.setApdUq(""); }
                    if (activeBar === "payments") { setSelOutcomeRow(null); store.setOutcomeUq(""); }
                    setActiveBar(null);
                }}
            />

            {/* ── Modals ─────────────────────────────────────────────────────── */}
            {reportsModal && (
                <ModalReports
                    growers={growersList}
                    defaultGrower={store.lcgrower_uq}
                    defaultGrowerName={store.lcgrower}
                    onClose={() => setReportsModal(false)}
                    onOpen={url => setReportModalUrl(url)}
                />
            )}
            {paymentsReportModal && (
                <ModalPaymentsReport
                    growers={growersList}
                    defaultGrower={store.lcgrower_uq}
                    defaultGrowerName={store.lcgrower}
                    onClose={() => setPaymentsReportModal(false)}
                    onOpen={url => setReportModalUrl(url)}
                />
            )}
            {dateHistoryModal && (
                <ModalDateToHistory
                    growerUq={store.lcgrower_uq}
                    growerName={store.lcgrower}
                    onClose={() => setDateHistoryModal(false)}
                    onOpen={url => setReportModalUrl(url)}
                />
            )}
            {crdbModal && selInvoiceRow && (
                <ModalCRDB
                    invoiceUq={store.lcap_uq}
                    invoiceNo={t(selInvoiceRow.INVOICE_NO)}
                    growerName={store.lcgrower}
                    onClose={() => setCrdbModal(false)}
                    onOpen={url => setReportModalUrl(url)}
                    logAction={logAction}
                    perms={perms}
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
                        qc.invalidateQueries({ queryKey: ["pa-outcomes", store.lcgrower_uq, store.ldPaymentsFrom, store.lnclose] });
                    }}
                />
            )}
            {editPaymentModal && selOutcomeRow && (
                <ModalEditPayment
                    uq={store.lcoutcome_uq}
                    banks={banksList}
                    onClose={() => setEditPaymentModal(false)}
                    onSaved={() => {
                        logAction("Edit", store.lcoutcome_uq, "Edit Payment Authorization");
                        setEditPaymentModal(false);
                        qc.invalidateQueries({ queryKey: ["pa-outcomes", store.lcgrower_uq, store.ldPaymentsFrom, store.lnclose] });
                    }}
                />
            )}

            {/* 4 Months Summary modal — with drill-down to vendor detail */}
            {quarterSummaryModal && (
                <Modal
                    title={qSumSel ? `4 Months Detail — ${qSumSel.name}` : "4 Months View — All Vendors"}
                    icon={BarChart2}
                    onClose={() => { setQuarterSummaryModal(false); setQSumSel(null); setQSumDetail([]); }}
                    size="xl"
                    footer={
                        qSumSel ? (
                            <button onClick={() => { setQSumSel(null); setQSumDetail([]); }}
                                className="px-4 py-2 rounded border text-sm font-bold text-gray-600 hover:bg-gray-100">← Back</button>
                        ) : (
                            <button onClick={() => { setQuarterSummaryModal(false); }}
                                className="px-4 py-2 rounded border text-sm font-bold text-gray-600 hover:bg-gray-100">Close</button>
                        )
                    }>
                    {qSumSel ? (
                        loadingQSumDetail ? (
                            <div className="flex items-center gap-2 text-gray-400 text-xs py-4"><Loader2 size={14} className="animate-spin" />Loading detail…</div>
                        ) : qSumDetail.length === 0 ? (
                            <p className="text-xs text-gray-400 italic py-4">No invoices found for this vendor in the last 4 months.</p>
                        ) : (
                            <div className="overflow-auto">
                                <PanelGridTable>
                                    <PanelGridThead>
                                        {Object.keys(qSumDetail[0]).map(c => <PanelGridTh key={c}>{c.replace(/_/g, " ")}</PanelGridTh>)}
                                    </PanelGridThead>
                                    <PanelGridTbody>
                                        {qSumDetail.map((row, i) => (
                                            <PanelGridTr key={i}>
                                                {Object.keys(qSumDetail[0]).map(c => <PanelGridTd key={c}>{t(row[c])}</PanelGridTd>)}
                                            </PanelGridTr>
                                        ))}
                                    </PanelGridTbody>
                                </PanelGridTable>
                            </div>
                        )
                    ) : loadingVendorsSummary ? (
                        <div className="flex items-center gap-2 text-gray-400 text-xs py-4"><Loader2 size={14} className="animate-spin" />Loading…</div>
                    ) : vendorsSummary.length === 0 ? (
                        <p className="text-xs text-gray-400 italic py-4">No records found for the last 4 months.</p>
                    ) : (
                        <div className="overflow-auto">
                            <p className="text-[10px] text-gray-400 italic mb-2">Click a vendor to see invoice detail</p>
                            <PanelGridTable>
                                <PanelGridThead>
                                    {Object.keys(vendorsSummary[0]).map(c => <PanelGridTh key={c}>{c.replace(/_/g, " ")}</PanelGridTh>)}
                                </PanelGridThead>
                                <PanelGridTbody>
                                    {(vendorsSummary as any[]).map((row, i) => (
                                        <PanelGridTr key={i} className="cursor-pointer" onClick={async () => {
                                            const uq   = t(row.UNICO ?? row.GROWER_UQ ?? row.unico ?? "");
                                            const name = t(row.GROWER ?? row.SUPPLIER ?? row.NAME ?? "");
                                            if (!uq) return;
                                            setQSumSel({ uq, name });
                                            setLoadingQSumDetail(true);
                                            try {
                                                const d = await paFetch(`/api/payment-authorizations/vendors-summary-detail?grower_uq=${encodeURIComponent(uq)}`);
                                                setQSumDetail(norm(Array.isArray(d) ? d : []));
                                            } catch (e: any) { toast.error(e.message); setQSumSel(null); }
                                            finally { setLoadingQSumDetail(false); }
                                        }}>
                                            {Object.keys(vendorsSummary[0]).map(c => <PanelGridTd key={c}>{t(row[c])}</PanelGridTd>)}
                                        </PanelGridTr>
                                    ))}
                                </PanelGridTbody>
                            </PanelGridTable>
                        </div>
                    )}
                </Modal>
            )}

            {/* 4 Months Detail modal */}
            {quarterDetailModal && (
                <Modal title={`4 Months Detail — ${store.lcgrower}`} icon={BarChart2} onClose={() => setQuarterDetailModal(false)} size="xl"
                    footer={<button onClick={() => setQuarterDetailModal(false)} className="px-4 py-2 rounded border text-sm font-bold text-gray-600 hover:bg-gray-100">Close</button>}>
                    {loadingQDetail ? (
                        <div className="flex items-center gap-2 text-gray-400 text-xs"><Loader2 size={14} className="animate-spin" />Loading…</div>
                    ) : quarterDetail.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">No detail records found.</p>
                    ) : (
                        <div className="overflow-auto">
                            <PanelGridTable>
                                <PanelGridThead>
                                    {Object.keys(quarterDetail[0]).map(c => <PanelGridTh key={c}>{c}</PanelGridTh>)}
                                </PanelGridThead>
                                <PanelGridTbody>
                                    {quarterDetail.map((row, i) => (
                                        <PanelGridTr key={i}>
                                            {Object.keys(quarterDetail[0]).map(c => <PanelGridTd key={c}>{t(row[c])}</PanelGridTd>)}
                                        </PanelGridTr>
                                    ))}
                                </PanelGridTbody>
                            </PanelGridTable>
                        </div>
                    )}
                </Modal>
            )}

            {/* PDF Report viewer */}
            <ReportModal url={reportModalUrl} onClose={() => setReportModalUrl(null)} />
        </div>
    );
}
