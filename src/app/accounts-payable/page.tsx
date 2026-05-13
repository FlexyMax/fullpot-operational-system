"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    ArrowLeft, RefreshCcw, Search, Calendar, DollarSign,
    FileText, CreditCard, ClipboardList, BookOpen, Plus,
    Pencil, Trash2, Check, XCircle, AlertCircle, CheckCircle,
    ChevronRight
} from "lucide-react";
import { useAPStore } from "@/store/useAPStore";
import { cn } from "@/lib/utils";
import { formatDateEST, formatMoney, parseMoney, todayEST, currentYearEST, dateInputToEST } from "@/lib/dates";

// ─── fetch helpers ───────────────────────────────────────────────────────────
const apFetch = (url: string) => fetch(url).then(r => r.json());

// ─── Zod schemas for modals ──────────────────────────────────────────────────
const crdbSchema = z.object({
    type:         z.enum(["C", "D"] as const),
    cd_date:      z.string().min(1, "Date is required"),
    reason_uq:    z.string().min(1, "Reason is required"),
    cd_ammount:   z.number().min(0, "Amount required"),
    retention_no: z.string().optional(),
    details:      z.string().optional(),
});
type CrdbForm = z.infer<typeof crdbSchema>;

const pobSchema = z.object({
    po_no:      z.string().min(1, "PO No. required"),
    cost:       z.number().min(0, "Cost required"),
    ap_type_uq: z.string().min(1, "Account Type required"),
});
type PobForm = z.infer<typeof pobSchema>;

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AccountsPayablePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const qc = useQueryClient();

    const {
        selectedYear, selectedDate, selectedUnico,
        setYear, setDate, setUnico,
    } = useAPStore();

    const [activeTab, setActiveTab] = useState<"terms" | "po" | "prebooks" | "credits">("terms");
    const [crdbModal, setCrdbModal]  = useState<{ open: boolean; mode: "Add" | "Edit" | "Delete"; type: "C" | "D"; row?: any } | null>(null);
    const [pobModal,  setPobModal]   = useState<{ open: boolean; row?: any } | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
    }, [status, router]);

    // ── Queries ──────────────────────────────────────────────────────────────
    const { data: years = [] } = useQuery({
        queryKey: ["ap-years"],
        queryFn:  () => apFetch("/api/accounts-payable/years"),
    });

    const { data: dates = [], isFetching: loadingDates } = useQuery({
        queryKey: ["ap-dates", selectedYear],
        queryFn:  () => apFetch(`/api/accounts-payable/dates?year=${selectedYear}`),
        enabled:  !!selectedYear,
    });

    const { data: invoices = [], isFetching: loadingInvoices } = useQuery({
        queryKey: ["ap-invoices", selectedDate],
        queryFn:  () => apFetch(`/api/accounts-payable/invoices?date=${selectedDate}`),
        enabled:  !!selectedDate,
    });

    const { data: invoice } = useQuery({
        queryKey: ["ap-invoice", selectedUnico],
        queryFn:  () => apFetch(`/api/accounts-payable/invoice?unico=${selectedUnico}`),
        enabled:  !!selectedUnico,
    });

    const { data: tabTerms    = [], isFetching: loadingTerms    } = useQuery({ queryKey: ["ap-terms",    selectedUnico], queryFn: () => apFetch(`/api/accounts-payable/details?unico=${selectedUnico}`),  enabled: !!selectedUnico && activeTab === "terms"    });
    const { data: tabPobs     = [], isFetching: loadingPobs     } = useQuery({ queryKey: ["ap-pobs",     selectedUnico], queryFn: () => apFetch(`/api/accounts-payable/pobs?unico=${selectedUnico}`),    enabled: !!selectedUnico && activeTab === "po"       });
    const { data: tabPrebooks = [], isFetching: loadingPrebooks } = useQuery({ queryKey: ["ap-prebooks", selectedUnico], queryFn: () => apFetch(`/api/accounts-payable/prebooks?unico=${selectedUnico}`), enabled: !!selectedUnico && activeTab === "prebooks" });
    const { data: tabCredits  = [], isFetching: loadingCredits  } = useQuery({ queryKey: ["ap-credits",  selectedUnico], queryFn: () => apFetch(`/api/accounts-payable/credits?unico=${selectedUnico}`),  enabled: !!selectedUnico && activeTab === "credits"  });

    const { data: reasons  = [] } = useQuery({ queryKey: ["ap-reasons"],  queryFn: () => apFetch("/api/accounts-payable/reasons")  });
    const { data: apTypes  = [] } = useQuery({ queryKey: ["ap-types"],    queryFn: () => apFetch("/api/accounts-payable/ap-types")  });

    // ── Mutations ────────────────────────────────────────────────────────────
    const crdbAdd = useMutation({
        mutationFn: (body: any) => fetch("/api/accounts-payable/crdb", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["ap-credits", selectedUnico] }); setCrdbModal(null); },
    });
    const crdbEdit = useMutation({
        mutationFn: (body: any) => fetch("/api/accounts-payable/crdb", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["ap-credits", selectedUnico] }); setCrdbModal(null); },
    });
    const crdbDelete = useMutation({
        mutationFn: (unico: string) => fetch(`/api/accounts-payable/crdb?unico=${unico}`, { method: "DELETE" }).then(r => r.json()),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["ap-credits", selectedUnico] }); setCrdbModal(null); },
    });

    const pobAdd = useMutation({
        mutationFn: (body: any) => fetch("/api/accounts-payable/pob", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["ap-pobs", selectedUnico] }); },
    });
    const pobEdit = useMutation({
        mutationFn: (body: any) => fetch("/api/accounts-payable/pob", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["ap-pobs", selectedUnico] }); },
    });
    const pobDelete = useMutation({
        mutationFn: (unico: string) => fetch(`/api/accounts-payable/pob?unico=${unico}`, { method: "DELETE" }).then(r => r.json()),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["ap-pobs", selectedUnico] }); },
    });
    const pobApprove = useMutation({
        mutationFn: (ap_uq: string) => fetch("/api/accounts-payable/pob/approve", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ap_uq }) }).then(r => r.json()),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["ap-invoice", selectedUnico] }); },
    });

    // ── Helpers ──────────────────────────────────────────────────────────────
    const selectedInvoice = invoices.find((inv: any) => inv.unico === selectedUnico);

    if (status === "loading") return null;

    return (
        <div className="flex flex-col h-screen bg-[#f4f6f8] overflow-hidden font-sans text-[#333]">

            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="h-12 bg-[#374151] flex items-center justify-between px-4 shrink-0 text-white">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push("/menu")} className="hover:bg-white/10 p-1.5 rounded transition-colors">
                        <ArrowLeft size={18} />
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="font-black text-xs uppercase tracking-widest text-[#FB7506]">FOS</span>
                        <div className="w-px h-4 bg-white/20 mx-2" />
                        <span className="font-bold text-xs uppercase tracking-tight">Accounts Payable</span>
                    </div>
                </div>
                <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400">User:</span>
                        <span>{session?.user?.name || "OPERATOR"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400">Status:</span>
                        <span className="text-green-500 font-black">Online</span>
                    </div>
                </div>
            </div>

            {/* ── Toolbar ─────────────────────────────────────────────────── */}
            <div className="h-10 bg-white border-b border-gray-200 flex items-center px-4 gap-3 shrink-0 shadow-sm">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Year:</span>
                    <select
                        value={selectedYear}
                        onChange={e => setYear(parseInt(e.target.value))}
                        className="bg-gray-100 border border-gray-200 text-gray-700 text-[11px] font-black rounded px-2 py-1 outline-none focus:ring-1 focus:ring-[#FB7506]"
                    >
                        {years.length > 0
                            ? years.map((y: any) => <option key={y.ap_year} value={y.ap_year}>{y.ap_year}</option>)
                            : [currentYearEST(), currentYearEST() - 1].map(y => <option key={y} value={y}>{y}</option>)
                        }
                    </select>
                </div>
                <div className="w-px h-5 bg-gray-200" />
                <button
                    onClick={() => { qc.invalidateQueries({ queryKey: ["ap-dates"] }); qc.invalidateQueries({ queryKey: ["ap-invoices"] }); }}
                    className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest text-gray-600 transition-all"
                >
                    <RefreshCcw size={11} /> Refresh
                </button>
                <div className="ml-auto flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {selectedInvoice && (
                        <>
                            <span className="text-gray-300">|</span>
                            <span>Vendor: <span className="text-gray-700">{selectedInvoice.grower}</span></span>
                            <span className="text-gray-300">|</span>
                            <span>Invoice: <span className="text-[#FB7506]">{selectedInvoice.invoice_no}</span></span>
                        </>
                    )}
                </div>
            </div>

            {/* ── Main Layout ─────────────────────────────────────────────── */}
            <div className="flex flex-1 overflow-hidden gap-2 p-2">

                {/* ── LEFT: Date Panel ────────────────────────────────────── */}
                <div className="w-[220px] shrink-0 flex flex-col gap-2">
                    <div className="flex flex-col flex-1 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        <div className="h-8 bg-[#374151] flex items-center justify-between px-3 shrink-0">
                            <div className="flex items-center gap-2">
                                <Calendar size={13} className="text-[#FB7506]" />
                                <span className="font-black text-[10px] uppercase tracking-widest text-white">Dates</span>
                            </div>
                            {loadingDates && <RefreshCcw size={10} className="text-gray-400 animate-spin" />}
                        </div>
                        <div className="bg-[#F0F2F5] px-2 py-0.5 text-[9px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-200 text-right">
                            {dates.length} records
                        </div>
                        <div className="overflow-y-auto flex-1">
                            <table className="w-full text-[10px]">
                                <thead className="sticky top-0 bg-white z-10">
                                    <tr className="border-b border-gray-100">
                                        <th className="text-left px-2 py-1.5 font-black text-gray-400 uppercase tracking-tight">Date</th>
                                        <th className="text-center font-black text-gray-400 uppercase tracking-tight">Inv</th>
                                        <th className="text-right pr-2 font-black text-gray-400 uppercase tracking-tight">Amt</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dates.length === 0 ? (
                                        <tr><td colSpan={3} className="py-8 text-center text-gray-300 italic font-bold uppercase text-[9px]">No dates</td></tr>
                                    ) : dates.map((d: any, i: number) => {
                                        const ds = d.ap_date ? String(d.ap_date).split("T")[0] : "";
                                        const active = selectedDate === ds;
                                        return (
                                            <tr key={i} onClick={() => setDate(ds)} className={cn("cursor-pointer border-b border-gray-50 h-7", active ? "bg-orange-50" : "hover:bg-gray-50")}>
                                                <td className={cn("px-2 font-bold", active ? "text-[#FB7506]" : "text-gray-700")}>{ds}</td>
                                                <td className="text-center text-gray-500 font-bold">{d.records || 0}</td>
                                                <td className="text-right pr-2 font-black text-gray-700">{formatMoney(d.total_amount)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT: Invoices + Tabs ───────────────────────────────── */}
                <div className="flex-1 flex flex-col gap-2 min-w-0 overflow-hidden">

                    {/* Invoice List */}
                    <div className="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden" style={{ height: "42%" }}>
                        <div className="h-8 bg-[#374151] flex items-center justify-between px-3 shrink-0">
                            <div className="flex items-center gap-2">
                                <FileText size={13} className="text-[#FB7506]" />
                                <span className="font-black text-[10px] uppercase tracking-widest text-white">
                                    Invoices {selectedDate ? `— ${selectedDate}` : ""}
                                </span>
                            </div>
                            {loadingInvoices && <RefreshCcw size={10} className="text-gray-400 animate-spin" />}
                        </div>
                        <div className="bg-[#F0F2F5] px-2 py-0.5 text-[9px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-200 text-right">
                            {invoices.length} records
                        </div>
                        <div className="overflow-auto flex-1">
                            <table className="w-full text-[10px] whitespace-nowrap">
                                <thead className="sticky top-0 bg-white z-10">
                                    <tr className="border-b border-gray-100">
                                        <th className="px-2 py-1.5 text-left font-black text-gray-400 uppercase tracking-tight">Vendor</th>
                                        <th className="px-2 font-black text-gray-400 uppercase tracking-tight">Invoice</th>
                                        <th className="px-2 text-right font-black text-gray-400 uppercase tracking-tight">Estimated</th>
                                        <th className="px-2 text-right font-black text-gray-400 uppercase tracking-tight">Amount</th>
                                        <th className="px-2 text-right font-black text-gray-400 uppercase tracking-tight">Credits</th>
                                        <th className="px-2 text-right font-black text-gray-400 uppercase tracking-tight">Debits</th>
                                        <th className="px-2 text-right font-black text-gray-400 uppercase tracking-tight">Balance</th>
                                        <th className="px-2 font-black text-gray-400 uppercase tracking-tight">Control</th>
                                        <th className="px-2 font-black text-gray-400 uppercase tracking-tight">AP Date</th>
                                        <th className="px-2 font-black text-gray-400 uppercase tracking-tight">Phone</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {!selectedDate ? (
                                        <tr><td colSpan={10} className="py-10 text-center text-gray-300 italic font-bold uppercase text-[9px]">Select a date to view invoices</td></tr>
                                    ) : invoices.length === 0 ? (
                                        <tr><td colSpan={10} className="py-10 text-center text-gray-300 italic font-bold uppercase text-[9px]">No invoices for this date</td></tr>
                                    ) : invoices.map((inv: any, i: number) => {
                                        const active = selectedUnico === inv.unico;
                                        return (
                                            <tr key={inv.unico || i} onClick={() => setUnico(inv.unico)} className={cn("cursor-pointer border-b border-gray-50 h-7 transition-colors", active ? "bg-orange-50 font-black" : "hover:bg-gray-50")}>
                                                <td className={cn("px-2 font-bold truncate max-w-[160px] uppercase", active ? "text-[#FB7506]" : "text-gray-800")}>{inv.grower}</td>
                                                <td className="px-2 font-black text-blue-700">{inv.invoice_no}</td>
                                                <td className="px-2 text-right text-gray-600">{formatMoney(inv.estimated)}</td>
                                                <td className="px-2 text-right font-black text-gray-900">{formatMoney(inv.amount)}</td>
                                                <td className="px-2 text-right text-green-600">{formatMoney(inv.credits)}</td>
                                                <td className="px-2 text-right text-red-500">{formatMoney(inv.debits)}</td>
                                                <td className="px-2 text-right font-black text-[#FB7506]">{formatMoney(inv.total_balance)}</td>
                                                <td className="px-2 text-gray-500">{formatDateEST(inv.control_date)}</td>
                                                <td className="px-2 text-gray-500">{formatDateEST(inv.ap_date)}</td>
                                                <td className="px-2 text-gray-400">{inv.phone_1}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Detail Tabs */}
                    <div className="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex-1 min-h-0">
                        {/* Tab Bar */}
                        <div className="h-9 bg-[#374151] flex items-end px-2 shrink-0 gap-0.5">
                            {([
                                { id: "terms",    label: "Terms",            icon: BookOpen      },
                                { id: "po",       label: "PO",               icon: ClipboardList },
                                { id: "prebooks", label: "Prebooks",         icon: FileText      },
                                { id: "credits",  label: "Credits & Debits", icon: CreditCard    },
                            ] as const).map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "flex items-center gap-1.5 px-4 h-7 text-[10px] font-black uppercase tracking-wider rounded-t transition-all",
                                        activeTab === tab.id
                                            ? "bg-[#f4f6f8] text-[#FB7506] border-b-2 border-[#FB7506]"
                                            : "text-gray-400 hover:text-white hover:bg-white/10"
                                    )}
                                >
                                    <tab.icon size={11} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 overflow-auto bg-[#f4f6f8]">
                            {!selectedUnico ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-2">
                                    <FileText size={32} className="opacity-20" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Select an invoice to view details</p>
                                </div>
                            ) : (
                                <>
                                    {/* TERMS TAB */}
                                    {activeTab === "terms" && (
                                        <TabTable
                                            loading={loadingTerms}
                                            rows={tabTerms}
                                            empty="No payment terms found"
                                            columns={[
                                                { key: "date_due",    label: "Date",     render: (v: any) => formatDateEST(v) },
                                                { key: "days",        label: "Days",     className: "text-center" },
                                                { key: "percen",      label: "%",        className: "text-right", render: (v: any) => `${parseMoney(v).toFixed(1)}%` },
                                                { key: "ammount",     label: "Amount",   className: "text-right", render: (v: any) => formatMoney(v) },
                                                { key: "out_ammount", label: "Payments", className: "text-right", render: (v: any) => formatMoney(v) },
                                                { key: "cre_ammount", label: "Credits",  className: "text-right text-green-600", render: (v: any) => formatMoney(v) },
                                                { key: "deb_ammount", label: "Debits",   className: "text-right text-red-500",   render: (v: any) => formatMoney(v) },
                                                { key: "balance",     label: "Balance",  className: "text-right font-black text-[#FB7506]", render: (v: any) => formatMoney(v) },
                                            ]}
                                        />
                                    )}

                                    {/* PO TAB */}
                                    {activeTab === "po" && (
                                        <div className="flex flex-col h-full">
                                            <div className="flex items-center justify-between px-3 py-1.5 bg-white border-b border-gray-200 shrink-0">
                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{tabPobs.length} PO records</span>
                                                <button
                                                    onClick={() => setPobModal({ open: true })}
                                                    className="flex items-center gap-1.5 bg-[#FB7506] hover:bg-orange-600 text-white px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest transition-all"
                                                >
                                                    <Pencil size={10} /> Update POs
                                                </button>
                                            </div>
                                            <TabTable
                                                loading={loadingPobs}
                                                rows={tabPobs}
                                                empty="No PO records"
                                                columns={[
                                                    { key: "ap_type",   label: "Acc. Type" },
                                                    { key: "ap_date",   label: "AP Date",  render: (v: any) => formatDateEST(v) },
                                                    { key: "ammount",   label: "Amount",   className: "text-right", render: (v: any) => formatMoney(v) },
                                                    { key: "porder_no", label: "PO" },
                                                    { key: "po_date",   label: "PO Date",  render: (v: any) => formatDateEST(v) },
                                                    { key: "cost",      label: "Cost",     className: "text-right font-black text-[#FB7506]", render: (v: any) => formatMoney(v) },
                                                ]}
                                            />
                                        </div>
                                    )}

                                    {/* PREBOOKS TAB */}
                                    {activeTab === "prebooks" && (
                                        <TabTable
                                            loading={loadingPrebooks}
                                            rows={tabPrebooks}
                                            empty="No prebook records"
                                            columns={[
                                                { key: "grower",       label: "Vendor" },
                                                { key: "ap_type",      label: "Type" },
                                                { key: "invoice_date", label: "Inv. Date",  render: (v: any) => formatDateEST(v) },
                                                { key: "invoice_no",   label: "Invoice" },
                                                { key: "amount",       label: "Amount",    className: "text-right", render: (v: any) => formatMoney(v) },
                                                { key: "customer",     label: "Customer" },
                                                { key: "pbook_no",     label: "PB No" },
                                                { key: "cporder_no",   label: "Cust PO" },
                                                { key: "pb_date",      label: "Delivery",  render: (v: any) => formatDateEST(v) },
                                                { key: "notes",        label: "Notes" },
                                            ]}
                                        />
                                    )}

                                    {/* CREDITS & DEBITS TAB */}
                                    {activeTab === "credits" && (
                                        <div className="flex flex-col h-full">
                                            <div className="flex items-center justify-between px-3 py-1.5 bg-white border-b border-gray-200 shrink-0">
                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{tabCredits.length} records</span>
                                                <div className="flex gap-2">
                                                    <button onClick={() => setCrdbModal({ open: true, mode: "Add", type: "C" })} className="flex items-center gap-1 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest transition-all">
                                                        <Plus size={9} /> Credit
                                                    </button>
                                                    <button onClick={() => setCrdbModal({ open: true, mode: "Add", type: "D" })} className="flex items-center gap-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest transition-all">
                                                        <Plus size={9} /> Debit
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="overflow-auto flex-1">
                                                <table className="w-full text-[10px] whitespace-nowrap">
                                                    <thead className="sticky top-0 bg-white z-10">
                                                        <tr className="border-b border-gray-100">
                                                            <th className="px-2 py-1.5 text-left font-black text-gray-400 uppercase tracking-tight w-8" />
                                                            <th className="px-2 text-left font-black text-gray-400 uppercase tracking-tight">Type</th>
                                                            <th className="px-2 font-black text-gray-400 uppercase tracking-tight">Date</th>
                                                            <th className="px-2 font-black text-gray-400 uppercase tracking-tight">Reason</th>
                                                            <th className="px-2 text-right font-black text-gray-400 uppercase tracking-tight">Amount</th>
                                                            <th className="px-2 font-black text-gray-400 uppercase tracking-tight">Doc. No</th>
                                                            <th className="px-2 font-black text-gray-400 uppercase tracking-tight">Auto No</th>
                                                            <th className="px-2 font-black text-gray-400 uppercase tracking-tight">Comments</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {loadingCredits ? (
                                                            <tr><td colSpan={8} className="py-8 text-center text-gray-300 font-bold">Loading...</td></tr>
                                                        ) : tabCredits.length === 0 ? (
                                                            <tr><td colSpan={8} className="py-8 text-center text-gray-300 italic font-bold uppercase text-[9px]">No credits or debits</td></tr>
                                                        ) : tabCredits.map((cr: any, i: number) => (
                                                            <tr key={i} className="border-b border-gray-50 h-7 hover:bg-gray-50 group">
                                                                <td className="px-2">
                                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <button onClick={() => setCrdbModal({ open: true, mode: "Edit", type: cr.type, row: cr })} className="text-blue-400 hover:text-blue-600"><Pencil size={10} /></button>
                                                                        <button onClick={() => setCrdbModal({ open: true, mode: "Delete", type: cr.type, row: cr })} className="text-red-400 hover:text-red-600"><Trash2 size={10} /></button>
                                                                    </div>
                                                                </td>
                                                                <td className="px-2">
                                                                    <span className={cn("px-1.5 py-0.5 rounded text-[8px] font-black uppercase", cr.type === "C" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600")}>
                                                                        {cr.type === "C" ? "Credit" : "Debit"}
                                                                    </span>
                                                                </td>
                                                                <td className="px-2 text-gray-600">{formatDateEST(cr.cd_date)}</td>
                                                                <td className="px-2 text-gray-700 font-bold truncate max-w-[140px]">{cr.reason}</td>
                                                                <td className={cn("px-2 text-right font-black", cr.type === "C" ? "text-green-600" : "text-red-500")}>{formatMoney(cr.cd_amount)}</td>
                                                                <td className="px-2 text-gray-500">{cr.retention_no}</td>
                                                                <td className="px-2 text-gray-400">{cr.cd_no}</td>
                                                                <td className="px-2 text-gray-500 truncate max-w-[180px]">{cr.cd_details}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="h-8 bg-gray-100 border-t px-4 flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-tight shrink-0">
                <div className="flex items-center gap-4">
                    <span>Server: Production</span>
                    <span className="text-gray-300">|</span>
                    <span>Database: FullPot</span>
                </div>
                <span className="text-[#FB7506]">FOS Terminal V.2.0.1</span>
            </div>

            {/* ── MODALS ──────────────────────────────────────────────────── */}
            {crdbModal?.open && (
                <CreditDebitModal
                    mode={crdbModal.mode}
                    type={crdbModal.type}
                    row={crdbModal.row}
                    invoice={selectedInvoice}
                    reasons={reasons}
                    todayEST={todayEST()}
                    onClose={() => setCrdbModal(null)}
                    onAdd={(data: CrdbForm) => crdbAdd.mutate({ ...data, acc_pay_uq: selectedUnico })}
                    onEdit={(data: CrdbForm) => crdbEdit.mutate({ ...data, unico: crdbModal.row?.unico })}
                    onDelete={() => crdbDelete.mutate(crdbModal.row?.unico)}
                    saving={crdbAdd.isPending || crdbEdit.isPending || crdbDelete.isPending}
                />
            )}

            {pobModal?.open && selectedUnico && (
                <POModal
                    apUq={selectedUnico}
                    invoice={invoice}
                    pobs={tabPobs}
                    apTypes={apTypes}
                    onClose={() => setPobModal(null)}
                    onAdd={(data: PobForm) => pobAdd.mutateAsync({ ...data, ap_uq: selectedUnico })}
                    onEdit={(data: PobForm & { unico: string }) => pobEdit.mutateAsync(data)}
                    onDelete={(unico: string) => pobDelete.mutateAsync(unico)}
                    onApprove={() => pobApprove.mutate(selectedUnico)}
                    saving={pobAdd.isPending || pobEdit.isPending || pobDelete.isPending}
                />
            )}
        </div>
    );
}

// ─── Reusable Table Component ─────────────────────────────────────────────────
function TabTable({ rows, columns, loading, empty }: {
    rows: any[];
    columns: { key: string; label: string; className?: string; render?: (v: any, row: any) => any }[];
    loading: boolean;
    empty: string;
}) {
    return (
        <div className="overflow-auto h-full">
            <table className="w-full text-[10px] whitespace-nowrap">
                <thead className="sticky top-0 bg-white z-10">
                    <tr className="border-b border-gray-100">
                        {columns.map(c => (
                            <th key={c.key} className={cn("px-2 py-1.5 font-black text-gray-400 uppercase tracking-tight text-left", c.className)}>
                                {c.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan={columns.length} className="py-8 text-center text-gray-300 font-bold">Loading...</td></tr>
                    ) : rows.length === 0 ? (
                        <tr><td colSpan={columns.length} className="py-8 text-center text-gray-300 italic font-bold uppercase text-[9px]">{empty}</td></tr>
                    ) : rows.map((row, i) => (
                        <tr key={i} className="border-b border-gray-50 h-7 hover:bg-gray-50">
                            {columns.map(c => (
                                <td key={c.key} className={cn("px-2 text-gray-700", c.className)}>
                                    {c.render ? c.render(row[c.key], row) : row[c.key] ?? ""}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ─── Credit/Debit Modal ───────────────────────────────────────────────────────
function CreditDebitModal({ mode, type: initType, row, invoice, reasons, todayEST, onClose, onAdd, onEdit, onDelete, saving }: any) {
    const { register, handleSubmit, watch, formState: { errors } } = useForm<CrdbForm>({
        resolver: zodResolver(crdbSchema),
        defaultValues: {
            type:         row?.type || initType,
            cd_date:      row?.cd_date ? String(row.cd_date).split("T")[0] : todayEST,
            reason_uq:    row?.reason_uq || "",
            cd_ammount:   parseMoney(row?.cd_amount) || undefined,
            retention_no: row?.retention_no || "",
            details:      row?.cd_details || "",
        },
    });

    const isDelete = mode === "Delete";

    const onSubmit = (data: CrdbForm) => {
        if (mode === "Add")    onAdd(data);
        if (mode === "Edit")   onEdit(data);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="h-10 bg-[#374151] flex items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <CreditCard size={14} className="text-[#FB7506]" />
                        <span className="font-black text-[11px] uppercase tracking-widest text-white">
                            {mode} {initType === "C" ? "Credit" : "Debit"}
                        </span>
                    </div>
                    <button onClick={onClose}><XCircle size={16} className="text-gray-400 hover:text-white" /></button>
                </div>

                <div className="p-5">
                    {isDelete ? (
                        <div className="flex flex-col items-center gap-4 py-4">
                            <AlertCircle size={36} className="text-red-400" />
                            <p className="text-sm font-bold text-gray-700 text-center">Delete this {initType === "C" ? "credit" : "debit"} record?</p>
                            <p className="text-[10px] text-gray-400 text-center">This action cannot be undone.</p>
                            <div className="flex gap-3 mt-2">
                                <button onClick={onClose} className="px-4 py-2 rounded border text-[11px] font-black text-gray-600 hover:bg-gray-50">Cancel</button>
                                <button onClick={onDelete} disabled={saving} className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white text-[11px] font-black uppercase tracking-widest">
                                    {saving ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <FormField label="Vendor" error={null}>
                                    <input value={invoice?.grower || ""} readOnly className="fos-input bg-gray-50 cursor-not-allowed" />
                                </FormField>
                                <FormField label="Invoice No." error={null}>
                                    <input value={invoice?.invoice_no || ""} readOnly className="fos-input bg-gray-50 cursor-not-allowed" />
                                </FormField>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <FormField label="Type" error={errors.type?.message}>
                                    <select {...register("type")} disabled={mode === "Edit"} className="fos-input">
                                        <option value="C">Credit</option>
                                        <option value="D">Debit</option>
                                    </select>
                                </FormField>
                                <FormField label="Date" error={errors.cd_date?.message}>
                                    <input type="date" {...register("cd_date")} max={todayEST} className="fos-input" />
                                </FormField>
                            </div>
                            <FormField label="Reason" error={errors.reason_uq?.message}>
                                <select {...register("reason_uq")} className="fos-input">
                                    <option value="">— Select reason —</option>
                                    {reasons.map((r: any) => <option key={r.unico} value={r.unico}>{r.reason}</option>)}
                                </select>
                            </FormField>
                            <div className="grid grid-cols-2 gap-3">
                                <FormField label="Amount" error={errors.cd_ammount?.message}>
                                    <input type="number" step="0.01" min="0" {...register("cd_ammount", { valueAsNumber: true })} className="fos-input text-right" />
                                </FormField>
                                <FormField label="Doc. Number" error={null}>
                                    <input {...register("retention_no")} className="fos-input" />
                                </FormField>
                            </div>
                            <FormField label="Comments" error={null}>
                                <textarea {...register("details")} rows={2} className="fos-input resize-none" />
                            </FormField>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={onClose} className="px-4 py-2 rounded border text-[11px] font-black text-gray-600 hover:bg-gray-50">Cancel</button>
                                <button type="submit" disabled={saving} className="px-5 py-2 rounded bg-[#FB7506] hover:bg-orange-600 text-white text-[11px] font-black uppercase tracking-widest">
                                    {saving ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── PO Modal ─────────────────────────────────────────────────────────────────
function POModal({ apUq, invoice, pobs, apTypes, onClose, onAdd, onEdit, onDelete, onApprove, saving }: any) {
    const [mode, setMode] = useState<"view" | "add" | "edit">("view");
    const [selectedPob, setSelectedPob] = useState<any>(null);
    const [pobSearch, setPobSearch] = useState("");
    const [pobResult, setPobResult] = useState<any>(null);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<PobForm>({
        resolver: zodResolver(pobSchema),
        defaultValues: { po_no: "", cost: undefined, ap_type_uq: "" },
    });

    const searchPO = async (no: string) => {
        if (!no) return;
        const res = await fetch(`/api/accounts-payable/pob/search?po_no=${no}`).then(r => r.json());
        setPobResult(res);
        if (!res) { setValue("po_no", ""); }
    };

    const onSubmit = async (data: PobForm) => {
        if (!pobResult) return;
        if (mode === "add")  { await onAdd({ pob_uq: pobResult.unico, cost: data.cost, ap_type_uq: data.ap_type_uq }); setMode("view"); reset(); }
        if (mode === "edit") { await onEdit({ unico: selectedPob.unico, pob_uq: pobResult?.unico || selectedPob.pob_uq, cost: data.cost, ap_type_uq: data.ap_type_uq }); setMode("view"); reset(); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
                <div className="h-10 bg-[#374151] flex items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <ClipboardList size={14} className="text-[#FB7506]" />
                        <span className="font-black text-[11px] uppercase tracking-widest text-white">PO by Account</span>
                        {invoice?.approved && <span className="ml-2 bg-green-500 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Approved</span>}
                    </div>
                    <button onClick={onClose}><XCircle size={16} className="text-gray-400 hover:text-white" /></button>
                </div>

                {/* Invoice Summary */}
                <div className="grid grid-cols-5 border-b border-gray-100 bg-gray-50">
                    {[
                        { label: "Vendor",     value: invoice?.grower || "—" },
                        { label: "Invoice No", value: invoice?.invoice_no || "—" },
                        { label: "Amount",     value: formatMoney(invoice?.ammount) },
                        { label: "Total PO",   value: formatMoney(invoice?.total_cost) },
                        { label: "Balance",    value: formatMoney(invoice?.balance) },
                    ].map(f => (
                        <div key={f.label} className="p-2 border-r border-gray-100 last:border-r-0">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{f.label}</p>
                            <p className="font-black text-[11px] text-gray-800 truncate">{f.value}</p>
                        </div>
                    ))}
                </div>

                {/* PO Grid */}
                <div className="max-h-40 overflow-auto border-b border-gray-100">
                    <table className="w-full text-[10px] whitespace-nowrap">
                        <thead className="sticky top-0 bg-white">
                            <tr className="border-b border-gray-100">
                                {["Acc. Type", "AP Date", "Amount", "PO", "PO Date", "Cost"].map(h => (
                                    <th key={h} className="px-3 py-1.5 text-left font-black text-gray-400 uppercase tracking-tight">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {pobs.length === 0 ? (
                                <tr><td colSpan={6} className="py-6 text-center text-gray-300 italic text-[9px] font-bold uppercase">No PO records</td></tr>
                            ) : pobs.map((p: any, i: number) => (
                                <tr key={i} onClick={() => setSelectedPob(p)} className={cn("cursor-pointer border-b border-gray-50 h-7", selectedPob?.unico === p.unico ? "bg-orange-50" : "hover:bg-gray-50")}>
                                    <td className="px-3 text-gray-700">{p.ap_type}</td>
                                    <td className="px-3 text-gray-600">{formatDateEST(p.ap_date)}</td>
                                    <td className="px-3 text-right">{formatMoney(p.ammount)}</td>
                                    <td className="px-3 font-bold text-blue-700">{p.porder_no}</td>
                                    <td className="px-3 text-gray-600">{formatDateEST(p.po_date)}</td>
                                    <td className="px-3 text-right font-black text-[#FB7506]">{formatMoney(p.cost)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Form */}
                {mode !== "view" && (
                    <form onSubmit={handleSubmit(onSubmit)} className="p-4 border-b border-gray-100 bg-orange-50/30">
                        <div className="grid grid-cols-3 gap-3">
                            <FormField label="PO No." error={errors.po_no?.message}>
                                <input
                                    {...register("po_no")}
                                    onBlur={e => searchPO(e.target.value)}
                                    className="fos-input"
                                    placeholder="Enter and tab to search"
                                />
                                {pobSearch && !pobResult && <p className="text-[9px] text-red-500 mt-0.5 font-bold">PO not found</p>}
                            </FormField>
                            <FormField label="Cost" error={errors.cost?.message}>
                                <input type="number" step="0.01" min="0" {...register("cost", { valueAsNumber: true })} className="fos-input text-right" />
                            </FormField>
                            <FormField label="Account Type" error={errors.ap_type_uq?.message}>
                                <select {...register("ap_type_uq")} className="fos-input">
                                    <option value="">— Select —</option>
                                    {apTypes.map((t: any) => <option key={t.unico} value={t.unico}>{t.ap_type}</option>)}
                                </select>
                            </FormField>
                        </div>
                    </form>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between px-4 py-3 bg-white">
                    <div className="flex gap-2">
                        {mode === "view" && (
                            <>
                                <button onClick={() => { setMode("add"); reset(); }} className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 border border-gray-200 px-3 py-1.5 rounded text-[10px] font-black uppercase text-gray-700 transition-all"><Plus size={10} /> Add</button>
                                {selectedPob && (
                                    <>
                                        <button onClick={() => { setMode("edit"); reset({ po_no: selectedPob.porder_no, cost: parseMoney(selectedPob.cost), ap_type_uq: selectedPob.ap_type_uq }); }} className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded text-[10px] font-black uppercase text-blue-700 transition-all"><Pencil size={10} /> Modify</button>
                                        <button onClick={() => { if (confirm("Delete this PO record?")) onDelete(selectedPob.unico); }} className="flex items-center gap-1 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded text-[10px] font-black uppercase text-red-600 transition-all"><Trash2 size={10} /> Delete</button>
                                    </>
                                )}
                                {!invoice?.approved && (
                                    <button onClick={onApprove} className="flex items-center gap-1 bg-green-50 hover:bg-green-100 border border-green-200 px-3 py-1.5 rounded text-[10px] font-black uppercase text-green-700 transition-all"><CheckCircle size={10} /> Approve</button>
                                )}
                            </>
                        )}
                        {mode !== "view" && (
                            <>
                                <button type="button" onClick={() => setMode("view")} className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 border border-gray-200 px-3 py-1.5 rounded text-[10px] font-black uppercase text-gray-700 transition-all"><XCircle size={10} /> Revert</button>
                                <button onClick={handleSubmit(onSubmit)} disabled={saving} className="flex items-center gap-1 bg-[#FB7506] hover:bg-orange-600 px-3 py-1.5 rounded text-[10px] font-black uppercase text-white transition-all"><Check size={10} /> {saving ? "Saving..." : "Save"}</button>
                            </>
                        )}
                    </div>
                    <button onClick={onClose} className="px-4 py-1.5 rounded border text-[11px] font-black text-gray-600 hover:bg-gray-50">Close</button>
                </div>
            </div>
        </div>
    );
}

// ─── FormField helper ─────────────────────────────────────────────────────────
function FormField({ label, error, children }: { label: string; error: string | null | undefined; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
            {children}
            {error && <p className="text-[9px] text-red-500 font-bold">{error}</p>}
        </div>
    );
}
