"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    RefreshCcw, Calendar,
    FileText, CreditCard, ClipboardList, BookOpen, Plus,
    Pencil, Trash2, Check, XCircle, AlertCircle, CheckCircle,
    ChevronRight, ChevronLeft, Search, Download, Printer,
    BarChart2, Clock
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { MobileActionBar } from "@/components/layout/MobileActionBar";
import { useAuditLog } from "@/lib/audit";
import { usePagePermissions, PERMISSION_MSGS } from "@/lib/permissions";
import { AuditLogModal } from "@/components/AuditLogModal";
import { useAPStore } from "@/store/useAPStore";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import PanelGrid from "@/components/ui/PanelGrid";
import { PanelGridTable, PanelGridThead, PanelGridTh, PanelGridTbody, PanelGridTr, PanelGridTd } from "@/components/ui/PanelGridTable";
import { formatDateEST, formatMoney, parseMoney, todayEST, currentYearEST, normalizeToISODate } from "@/lib/dates";
const EMPTY_ARR: any[] = [];

// ─── fetch helpers ───────────────────────────────────────────────────────────
const apFetch = async (url: string) => {
    const r = await fetch(url);
    const json = await r.json();
    if (!r.ok) throw new Error(json?.error || `HTTP ${r.status}`);
    return json;
};

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

const invoiceSchema = z.object({
    ldap_date:        z.string().min(1, "Date required"),
    lcsupplier_uq:    z.string().min(1, "Vendor required"),
    lcinvoice_no:     z.string().min(1, "Invoice # required"),
    lcterms_uq:       z.string().optional(),
    lnestimated:      z.number().min(0).optional(),
    lntaxes:          z.number().min(0).optional(),
    lnamount:         z.number().min(0, "Amount required"),
    lnporder_no:      z.number().int().optional(),
    lcdescription:    z.string().optional(),
    llautomatic:      z.boolean().optional(),
    llindirect:       z.boolean().optional(),
    llautomatic_cost: z.boolean().optional(),
});
type InvoiceForm = z.infer<typeof invoiceSchema>;

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AccountsPayablePage() {
    const { status } = useSession();
    const router = useRouter();
    const qc = useQueryClient();
    const { logAction } = useAuditLog("accounts-payable", "flower_accounts_pay");
    const perms = usePagePermissions("accounts-payable");

    const {
        selectedYear, selectedDate, selectedUnico,
        setYear, setDate, setUnico,
    } = useAPStore();

    const [activeTab,        setActiveTab]        = useState<"terms" | "po" | "prebooks" | "credits">("terms");
    const [crdbModal,        setCrdbModal]        = useState<{ open: boolean; mode: "Add" | "Edit" | "Delete"; type: "C" | "D"; row?: any } | null>(null);
    const [pobModal,         setPobModal]         = useState<{ open: boolean; row?: any } | null>(null);
    const [calMonth,         setCalMonth]         = useState(() => new Date().getMonth() + 1);
    const [calYear,          setCalYear]          = useState(currentYearEST);
    const [selectedTermIdx,  setSelectedTermIdx]  = useState(0);
    const [selectedPobIdx,   setSelectedPobIdx]   = useState(0);
    const [selectedPbkIdx,   setSelectedPbkIdx]   = useState(0);
    const [selectedCrdbIdx,  setSelectedCrdbIdx]  = useState(0);
    const [activeBar,        setActiveBar]        = useState<"invoices" | "po" | "credits" | null>(null);
    const [invoiceModal,     setInvoiceModal]     = useState<{ open: boolean; mode: "Add" | "Edit" | "Delete" } | null>(null);
    const [searchModal,      setSearchModal]      = useState(false);
    const [summaryModal,     setSummaryModal]     = useState(false);
    const [pendingAPModal,   setPendingAPModal]   = useState(false);
    const [pendingUnico,     setPendingUnico]     = useState<string | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
    }, [status, router]);

    // ── Queries ──────────────────────────────────────────────────────────────
    const { data: years = EMPTY_ARR } = useQuery({
        queryKey: ["ap-years"],
        queryFn:  () => apFetch("/api/accounts-payable/years"),
    });

    const { data: dates = EMPTY_ARR, isFetching: loadingDates, error: datesError } = useQuery({
        queryKey: ["ap-dates", selectedYear],
        queryFn:  () => apFetch(`/api/accounts-payable/dates?year=${selectedYear}`),
        enabled:  !!selectedYear,
        retry: false,
    });

    const { data: invoices = EMPTY_ARR, isFetching: loadingInvoices } = useQuery({
        queryKey: ["ap-invoices", selectedDate],
        queryFn:  () => apFetch(`/api/accounts-payable/invoices?date=${selectedDate}`),
        enabled:  !!selectedDate,
        retry: false,
    });

    const { data: invoice } = useQuery({
        queryKey: ["ap-invoice", selectedUnico],
        queryFn:  () => apFetch(`/api/accounts-payable/invoice?unico=${selectedUnico}`),
        enabled:  !!selectedUnico,
    });

    const { data: tabTerms = EMPTY_ARR, isFetching: loadingTerms    } = useQuery({ queryKey: ["ap-terms",    selectedUnico], queryFn: () => apFetch(`/api/accounts-payable/details?unico=${selectedUnico}`),  enabled: !!selectedUnico && activeTab === "terms"    });
    const { data: tabPobs = EMPTY_ARR, isFetching: loadingPobs     } = useQuery({ queryKey: ["ap-pobs",     selectedUnico], queryFn: () => apFetch(`/api/accounts-payable/pobs?unico=${selectedUnico}`),    enabled: !!selectedUnico && activeTab === "po"       });
    const { data: tabPrebooks = EMPTY_ARR, isFetching: loadingPrebooks } = useQuery({ queryKey: ["ap-prebooks", selectedUnico], queryFn: () => apFetch(`/api/accounts-payable/prebooks?unico=${selectedUnico}`), enabled: !!selectedUnico && activeTab === "prebooks" });
    const { data: tabCredits = EMPTY_ARR, isFetching: loadingCredits  } = useQuery({ queryKey: ["ap-credits",  selectedUnico], queryFn: () => apFetch(`/api/accounts-payable/credits?unico=${selectedUnico}`),  enabled: !!selectedUnico && activeTab === "credits"  });

    const { data: reasons = EMPTY_ARR } = useQuery({ queryKey: ["ap-reasons"],   queryFn: () => apFetch("/api/accounts-payable/reasons")   });
    const { data: apTypes = EMPTY_ARR } = useQuery({ queryKey: ["ap-types"],    queryFn: () => apFetch("/api/accounts-payable/ap-types")   });
    const { data: growers = EMPTY_ARR } = useQuery({ queryKey: ["ap-growers"],  queryFn: () => apFetch("/api/accounts-payable/growers")    });
    const { data: termsList = EMPTY_ARR } = useQuery({ queryKey: ["ap-terms-list"], queryFn: () => apFetch("/api/accounts-payable/terms")   });

    // ── Mutations ────────────────────────────────────────────────────────────
    const crdbAdd = useMutation({
        mutationFn: async (body: any) => { const r = await fetch("/api/accounts-payable/crdb", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()); if (!r.success) throw new Error(r.error || "Failed to add"); return r; },
        onSuccess: (d) => { toast.success("Credit/Debit added."); logAction("Insert", d?.unico || selectedUnico || "", "Credit/Debit"); qc.invalidateQueries({ queryKey: ["ap-credits", selectedUnico] }); setCrdbModal(null); },
        onError: (e: any) => toast.error(e.message),
    });
    const crdbEdit = useMutation({
        mutationFn: async (body: any) => { const r = await fetch("/api/accounts-payable/crdb", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()); if (!r.success) throw new Error(r.error || "Failed to update"); return r; },
        onSuccess: (_d, vars: any) => { toast.success("Credit/Debit updated."); logAction("Edit", vars?.unico || selectedUnico || "", "Credit/Debit"); qc.invalidateQueries({ queryKey: ["ap-credits", selectedUnico] }); setCrdbModal(null); },
        onError: (e: any) => toast.error(e.message),
    });
    const crdbDelete = useMutation({
        mutationFn: async (unico: string) => { const r = await fetch(`/api/accounts-payable/crdb?unico=${unico}`, { method: "DELETE" }).then(r => r.json()); if (!r.success) throw new Error(r.error || "Failed to delete"); return r; },
        onSuccess: (_d, unico) => { toast.success("Credit/Debit deleted."); logAction("Delete", unico, "Credit/Debit"); qc.invalidateQueries({ queryKey: ["ap-credits", selectedUnico] }); setCrdbModal(null); },
        onError: (e: any) => toast.error(e.message),
    });

    const pobAdd = useMutation({
        mutationFn: async (body: any) => { const r = await fetch("/api/accounts-payable/pob", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()); if (!r.success) throw new Error(r.error || "Failed to add PO"); return r; },
        onSuccess: (d) => { toast.success("PO record added."); logAction("Insert", d?.unico || selectedUnico || "", "PO"); qc.invalidateQueries({ queryKey: ["ap-pobs", selectedUnico] }); },
        onError: (e: any) => toast.error(e.message),
    });
    const pobEdit = useMutation({
        mutationFn: async (body: any) => { const r = await fetch("/api/accounts-payable/pob", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()); if (!r.success) throw new Error(r.error || "Failed to update PO"); return r; },
        onSuccess: (_d, vars: any) => { toast.success("PO record updated."); logAction("Edit", vars?.unico || selectedUnico || "", "PO"); qc.invalidateQueries({ queryKey: ["ap-pobs", selectedUnico] }); },
        onError: (e: any) => toast.error(e.message),
    });
    const pobDelete = useMutation({
        mutationFn: async (unico: string) => { const r = await fetch(`/api/accounts-payable/pob?unico=${unico}`, { method: "DELETE" }).then(r => r.json()); if (!r.success) throw new Error(r.error || "Failed to delete PO"); return r; },
        onSuccess: (_d, unico) => { toast.success("PO record deleted."); logAction("Delete", unico, "PO"); qc.invalidateQueries({ queryKey: ["ap-pobs", selectedUnico] }); },
        onError: (e: any) => toast.error(e.message),
    });
    const pobApprove = useMutation({
        mutationFn: async (ap_uq: string) => { const r = await fetch("/api/accounts-payable/pob/approve", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ap_uq }) }).then(r => r.json()); if (!r.success) throw new Error(r.error || "Failed to approve"); return r; },
        onSuccess: (_d, ap_uq) => { toast.success("PO cost approved."); logAction("Edit", ap_uq, "Approve PO Cost"); qc.invalidateQueries({ queryKey: ["ap-invoice", selectedUnico] }); },
        onError: (e: any) => toast.error(e.message),
    });

    const invoiceAdd = useMutation({
        mutationFn: async (body: any) => { const r = await fetch("/api/accounts-payable/invoice", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()); if (!r.success) throw new Error(r.error || "Failed to create invoice"); return r; },
        onSuccess: (data) => { toast.success("Invoice created."); logAction("Insert", data?.unico || selectedUnico || ""); qc.invalidateQueries({ queryKey: ["ap-invoices", selectedDate] }); setInvoiceModal(null); },
        onError: (e: any) => toast.error(e.message),
    });
    const invoiceEdit = useMutation({
        mutationFn: async (body: any) => { const r = await fetch("/api/accounts-payable/invoice", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()); if (!r.success) throw new Error(r.error || "Failed to update invoice"); return r; },
        onSuccess: () => { toast.success("Invoice updated."); logAction("Edit", selectedUnico || ""); qc.invalidateQueries({ queryKey: ["ap-invoices", selectedDate] }); setInvoiceModal(null); },
        onError: (e: any) => toast.error(e.message),
    });
    const invoiceDelete = useMutation({
        mutationFn: async (unico: string) => { const r = await fetch(`/api/accounts-payable/invoice?unico=${unico}`, { method: "DELETE" }).then(r => r.json()); if (!r.success) throw new Error(r.error || "Failed to delete invoice"); return r; },
        onSuccess: (_d, unico) => { toast.success("Invoice deleted."); logAction("Delete", unico); qc.invalidateQueries({ queryKey: ["ap-invoices", selectedDate] }); setUnico(null); setInvoiceModal(null); },
        onError: (e: any) => toast.error(e.message),
    });

    // ── Fetch full crdb record before opening Edit modal ─────────────────────
    const handleEditCrdb = async (row: any) => {
        try {
            const full = await apFetch(`/api/accounts-payable/crdb?unico=${row.unico}`);
            setCrdbModal({ open: true, mode: "Edit", type: row.type, row: { ...row, ...(full || {}) } });
        } catch {
            // Fallback: open with list data (reason_uq might be missing)
            setCrdbModal({ open: true, mode: "Edit", type: row.type, row });
        }
    };

    // ── Auto-selection cascades ───────────────────────────────────────────────
    useEffect(() => {
        if (invoices.length > 0) {
            if (pendingUnico) {
                const found = invoices.find((inv: any) => inv.unico === pendingUnico);
                setUnico(found ? pendingUnico : invoices[0].unico);
                setPendingUnico(null);
            } else {
                setUnico(invoices[0].unico);
            }
        }
    }, [invoices]);

    useEffect(() => {
        setSelectedTermIdx(0);
        setSelectedPobIdx(0);
        setSelectedPbkIdx(0);
        setSelectedCrdbIdx(0);
    }, [selectedUnico]);

    // ── Helpers ──────────────────────────────────────────────────────────────
    const selectedInvoice = invoices.find((inv: any) => inv.unico === selectedUnico);

    const exportToCSV = () => {
        if (!invoices.length) return;
        const headers = ['Vendor','Invoice','Estimated','Amount','Credits','Debits','Balance','Control Date','AP Date','Phone'];
        const rows = invoices.map((inv: any) => [
            String(inv.grower || "").trim(),
            String(inv.invoice_no || "").trim(),
            parseMoney(inv.estimated).toFixed(2),
            parseMoney(inv.amount).toFixed(2),
            parseMoney(inv.credits).toFixed(2),
            parseMoney(inv.debits).toFixed(2),
            parseMoney(inv.total_balance).toFixed(2),
            formatDateEST(normalizeToISODate(inv.control_Date ?? inv.control_date)),
            formatDateEST(normalizeToISODate(inv.ap_date)),
            String(inv.phone_1 || "").trim(),
        ]);
        const csv = [headers, ...rows]
            .map(row => row.map((c: string) => `"${String(c).replace(/"/g, '""')}"`).join(','))
            .join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url  = URL.createObjectURL(blob);
        const a    = Object.assign(document.createElement('a'), { href: url, download: `AP_Invoices_${selectedDate || 'export'}.csv` });
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleLocate = (result: any) => {
        const date = normalizeToISODate(result.ap_date);
        setPendingUnico(result.unico);
        setDate(date);
        setSearchModal(false);
    };

    if (status === "loading") return null;

    return (
        <div className="flex flex-col h-[100dvh] bg-[#f4f6f8] overflow-hidden font-sans text-[#333]">

            <AppHeader title="Accounts Payable" />

            {/* ── Toolbar ─────────────────────────────────────────────────── */}
            <div className="bg-[#F5F3F3] border border-[#DBD9D9] rounded-lg flex flex-wrap items-center px-4 py-2.5 gap-x-3 gap-y-1.5 shrink-0 shadow-sm mx-2 mt-2">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Year:</span>
                    <select
                        value={selectedYear}
                        onChange={e => { const y = parseInt(e.target.value); setYear(y); setCalYear(y); }}
                        className="bg-white border border-gray-200 text-gray-700 text-[14px] font-semibold rounded px-2 h-7 outline-none focus:ring-1 focus:ring-[#FB7506]"
                    >
                        {years.length > 0
                            ? years.map((y: any) => {
                                const yr = y.ap_year ?? y.year ?? y.lnyear ?? Number(Object.values(y)[0]);
                                return <option key={yr} value={yr}>{yr}</option>;
                              })
                            : [currentYearEST(), currentYearEST()-1, currentYearEST()-2].map(y => <option key={y} value={y}>{y}</option>)
                        }
                    </select>
                </div>
                <div className="w-px h-5 bg-gray-200" />
                <button
                    onClick={() => { qc.invalidateQueries({ queryKey: ["ap-dates"] }); qc.invalidateQueries({ queryKey: ["ap-invoices"] }); }}
                    className="flex items-center gap-1.5 bg-white hover:bg-gray-100 border border-gray-200 px-3 h-7 rounded text-[14px] font-semibold uppercase text-gray-600 transition-all"
                >
                    <RefreshCcw size={11} /> Refresh
                </button>
                <div className="w-px h-5 bg-gray-200" />
                <button
                    onClick={() => setSummaryModal(true)}
                    className="flex items-center gap-1.5 bg-white hover:bg-gray-100 border border-gray-200 px-3 h-7 rounded text-[14px] font-semibold uppercase text-gray-600 transition-all"
                    title="Vendor Summary Report"
                >
                    <BarChart2 size={11} /> Summary
                </button>
                <button
                    onClick={() => setPendingAPModal(true)}
                    className="flex items-center gap-1.5 bg-white hover:bg-gray-100 border border-gray-200 px-3 h-7 rounded text-[14px] font-semibold uppercase text-gray-600 transition-all"
                    title="Pending Accounts Payable Report"
                >
                    <Clock size={11} /> Pending AP
                </button>
                <div className="hidden sm:flex ml-auto items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
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
            <div className="flex flex-col lg:flex-row flex-1 gap-2 p-2 overflow-auto">

                {/* ── LEFT: Date Panel (desktop only) ─────────────────────── */}
                <div className="hidden lg:flex w-[260px] shrink-0">
                    <PanelGrid
                        title="Dates"
                        icon={Calendar}
                        recordCount={dates.length}
                        refreshing={loadingDates}
                        className="flex-1"
                    >
                        {datesError && (
                            <div className="p-3 m-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                                <p className="font-bold mb-1">Error</p>
                                <p className="break-all font-normal">{(datesError as Error).message}</p>
                            </div>
                        )}
                        <PanelGridTable>
                            <PanelGridThead>
                                <PanelGridTh>Date</PanelGridTh>
                                <PanelGridTh align="center">Inv</PanelGridTh>
                                <PanelGridTh align="right">Amount</PanelGridTh>
                            </PanelGridThead>
                            <PanelGridTbody>
                                {dates.length === 0 && !datesError ? (
                                    <PanelGridTr><PanelGridTd colSpan={3} className="py-8 text-center text-gray-400 italic">No dates</PanelGridTd></PanelGridTr>
                                ) : dates.map((d: any, i: number) => {
                                    const ds = normalizeToISODate(d.ap_date);
                                    return (
                                        <PanelGridTr key={i} selected={selectedDate === ds} onClick={() => setDate(ds)}>
                                            <PanelGridTd className="font-medium">{formatDateEST(ds)}</PanelGridTd>
                                            <PanelGridTd align="center">{d.records || 0}</PanelGridTd>
                                            <PanelGridTd align="right" className="font-semibold">{formatMoney(d.total_amount)}</PanelGridTd>
                                        </PanelGridTr>
                                    );
                                })}
                            </PanelGridTbody>
                        </PanelGridTable>
                    </PanelGrid>
                </div>

                {/* ── CALENDAR: Mobile only ───────────────────────────────── */}
                <div className="lg:hidden shrink-0">
                    <APCalendar
                        dates={dates}
                        selectedDate={selectedDate}
                        onSelect={setDate}
                        calYear={calYear}
                        calMonth={calMonth}
                        onMonthChange={(delta: number) => {
                            let m = calMonth + delta;
                            let y = calYear;
                            if (m > 12) { m = 1;  y++; }
                            if (m < 1)  { m = 12; y--; }
                            setCalMonth(m);
                            setCalYear(y);
                        }}
                    />
                </div>

                {/* ── RIGHT: Invoices + Tabs ───────────────────────────────── */}
                <div className="flex-1 flex flex-col gap-2 min-w-0 lg:overflow-hidden">

                    {/* Invoice List */}
                    <PanelGrid
                        title={`Invoices${selectedDate ? ` — ${selectedDate}` : ""}`}
                        icon={FileText}
                        recordCount={invoices.length}
                        refreshing={loadingInvoices}
                        headerRight={
                            <div className="flex items-center gap-0.5">
                                <button onClick={() => setSearchModal(true)} title="Search" className="p-1.5 text-gray-400 hover:text-[#FB7506] hover:bg-gray-100 rounded transition-colors"><Search size={13} /></button>
                                <button onClick={exportToCSV} disabled={!invoices.length || !perms.canReport} title="Export CSV" className="p-1.5 text-gray-400 hover:text-[#FB7506] hover:bg-gray-100 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"><Download size={13} /></button>
                                <AuditLogModal recordId={selectedUnico} disabled={!selectedUnico} bareButton />
                            </div>
                        }
                        menuItems={[
                            { label: "Add Invoice", icon: Plus, color: "green", onClick: () => { if (!perms.canCreate) { toast.error(PERMISSION_MSGS.create); return; } setInvoiceModal({ open: true, mode: "Add" }); }, disabled: !perms.canCreate },
                            { label: "Edit Invoice", icon: Pencil, color: "orange", onClick: () => { if (!perms.canEdit) { toast.error(PERMISSION_MSGS.edit); return; } selectedUnico && setInvoiceModal({ open: true, mode: "Edit" }); }, disabled: !selectedUnico || !perms.canEdit },
                            { label: "Delete Invoice", icon: Trash2, color: "red", onClick: () => { if (!perms.canDelete) { toast.error(PERMISSION_MSGS.delete); return; } selectedUnico && setInvoiceModal({ open: true, mode: "Delete" }); }, disabled: !selectedUnico || !perms.canDelete },
                        ]}
                        className="min-h-[200px] max-h-[45vh] lg:max-h-none lg:h-[50%]"
                    >
                        <PanelGridTable>
                            <PanelGridThead>
                                <PanelGridTh>Vendor</PanelGridTh>
                                <PanelGridTh>Invoice</PanelGridTh>
                                <PanelGridTh align="right">Estimated</PanelGridTh>
                                <PanelGridTh align="right">Amount</PanelGridTh>
                                <PanelGridTh align="right" className="text-green-700">Credits</PanelGridTh>
                                <PanelGridTh align="right" className="text-red-600">Debits</PanelGridTh>
                                <PanelGridTh align="right">Balance</PanelGridTh>
                                <PanelGridTh>Control</PanelGridTh>
                                <PanelGridTh>AP Date</PanelGridTh>
                                <PanelGridTh className="hidden lg:table-cell">Phone</PanelGridTh>
                            </PanelGridThead>
                            <PanelGridTbody>
                                {!selectedDate ? (
                                    <PanelGridTr><PanelGridTd colSpan={10} className="py-10 text-center text-gray-400 italic">Select a date to view invoices</PanelGridTd></PanelGridTr>
                                ) : invoices.length === 0 ? (
                                    <PanelGridTr><PanelGridTd colSpan={10} className="py-10 text-center text-gray-400 italic">No invoices for this date</PanelGridTd></PanelGridTr>
                                ) : (<>
                                    {invoices.map((inv: any, i: number) => (
                                        <PanelGridTr key={inv.unico || i} selected={selectedUnico === inv.unico} onClick={() => { const desel = selectedUnico === inv.unico; setUnico(desel ? null : inv.unico); setSelectedPobIdx(-1); setSelectedCrdbIdx(-1); setActiveBar(desel ? null : "invoices"); }}>
                                            <PanelGridTd className="font-medium max-w-[180px] truncate">{String(inv.grower || "").trim()}</PanelGridTd>
                                            <PanelGridTd className="font-semibold text-[#FB7506]">{String(inv.invoice_no || "").trim()}</PanelGridTd>
                                            <PanelGridTd align="right">{formatMoney(inv.estimated)}</PanelGridTd>
                                            <PanelGridTd align="right" className="font-semibold">{formatMoney(inv.amount)}</PanelGridTd>
                                            <PanelGridTd align="right" className="text-green-600">{formatMoney(inv.credits)}</PanelGridTd>
                                            <PanelGridTd align="right" className="text-red-500">{formatMoney(inv.debits)}</PanelGridTd>
                                            <PanelGridTd align="right" className="font-semibold text-orange-600">{formatMoney(inv.total_balance)}</PanelGridTd>
                                            <PanelGridTd>{formatDateEST(normalizeToISODate(inv.control_Date ?? inv.control_date))}</PanelGridTd>
                                            <PanelGridTd>{formatDateEST(normalizeToISODate(inv.ap_date))}</PanelGridTd>
                                            <PanelGridTd className="hidden lg:table-cell text-gray-400">{String(inv.phone_1 || "").trim()}</PanelGridTd>
                                        </PanelGridTr>
                                    ))}
                                    <tr className="border-t-2 border-gray-300 bg-gray-50">
                                        <td className="px-2 py-1.5 text-[10px] font-black text-gray-600 uppercase tracking-wider whitespace-nowrap" colSpan={2}>
                                            TOTALS ({invoices.length} invoices)
                                        </td>
                                        <td className="px-2 py-1.5 text-[11px] font-black text-right text-gray-700">{formatMoney(invoices.reduce((s: number, inv: any) => s + parseMoney(inv.estimated), 0))}</td>
                                        <td className="px-2 py-1.5 text-[11px] font-black text-right text-gray-700">{formatMoney(invoices.reduce((s: number, inv: any) => s + parseMoney(inv.amount), 0))}</td>
                                        <td className="px-2 py-1.5 text-[11px] font-black text-right text-green-600">{formatMoney(invoices.reduce((s: number, inv: any) => s + parseMoney(inv.credits), 0))}</td>
                                        <td className="px-2 py-1.5 text-[11px] font-black text-right text-red-500">{formatMoney(invoices.reduce((s: number, inv: any) => s + parseMoney(inv.debits), 0))}</td>
                                        <td className="px-2 py-1.5 text-[11px] font-black text-right text-orange-600">{formatMoney(invoices.reduce((s: number, inv: any) => s + parseMoney(inv.total_balance), 0))}</td>
                                        <td colSpan={3} />
                                    </tr>
                                </>)}
                            </PanelGridTbody>
                        </PanelGridTable>
                    </PanelGrid>

                    {/* Detail Tabs */}
                    <div className="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex-1 min-h-[300px] lg:min-h-0">
                        {/* Tab Bar */}
                        <div className="h-10 bg-[#F5F3F3] border-b border-[#DBD9D9] flex items-end px-2 shrink-0 gap-0.5">
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
                                            ? "bg-white text-[#FB7506] border-b-2 border-[#FB7506]"
                                            : "text-gray-500 hover:text-[#FB7506] hover:bg-white/60"
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
                                        <PanelGridTable>
                                            <PanelGridThead>
                                                <PanelGridTh>Date</PanelGridTh>
                                                <PanelGridTh align="center">Days</PanelGridTh>
                                                <PanelGridTh align="right">%</PanelGridTh>
                                                <PanelGridTh align="right">Amount</PanelGridTh>
                                                <PanelGridTh align="right">Payments</PanelGridTh>
                                                <PanelGridTh align="right" className="text-green-700">Credits</PanelGridTh>
                                                <PanelGridTh align="right" className="text-red-600">Debits</PanelGridTh>
                                                <PanelGridTh align="right" className="text-[#FB7506]">Balance</PanelGridTh>
                                            </PanelGridThead>
                                            <PanelGridTbody>
                                                {loadingTerms ? (
                                                    <PanelGridTr><PanelGridTd colSpan={8} className="py-8 text-center text-gray-400">Loading...</PanelGridTd></PanelGridTr>
                                                ) : tabTerms.length === 0 ? (
                                                    <PanelGridTr><PanelGridTd colSpan={8} className="py-8 text-center text-gray-400 italic">No payment terms found</PanelGridTd></PanelGridTr>
                                                ) : tabTerms.map((row: any, i: number) => (
                                                    <PanelGridTr key={i} selected={i === selectedTermIdx} onClick={() => setSelectedTermIdx(i)}>
                                                        <PanelGridTd>{formatDateEST(row.date_due)}</PanelGridTd>
                                                        <PanelGridTd align="center">{row.days}</PanelGridTd>
                                                        <PanelGridTd align="right">{parseMoney(row.percen).toFixed(1)}%</PanelGridTd>
                                                        <PanelGridTd align="right">{formatMoney(row.ammount)}</PanelGridTd>
                                                        <PanelGridTd align="right">{formatMoney(row.out_ammount)}</PanelGridTd>
                                                        <PanelGridTd align="right" className="text-green-600">{formatMoney(row.cre_ammount)}</PanelGridTd>
                                                        <PanelGridTd align="right" className="text-red-500">{formatMoney(row.deb_ammount)}</PanelGridTd>
                                                        <PanelGridTd align="right" className="font-black text-[#FB7506]">{formatMoney(row.balance)}</PanelGridTd>
                                                    </PanelGridTr>
                                                ))}
                                            </PanelGridTbody>
                                        </PanelGridTable>
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
                                            <div className="overflow-auto flex-1">
                                                <PanelGridTable>
                                                    <PanelGridThead>
                                                        <PanelGridTh>Acc. Type</PanelGridTh>
                                                        <PanelGridTh>AP Date</PanelGridTh>
                                                        <PanelGridTh align="right">Amount</PanelGridTh>
                                                        <PanelGridTh>PO</PanelGridTh>
                                                        <PanelGridTh>PO Date</PanelGridTh>
                                                        <PanelGridTh align="right" className="text-[#FB7506]">Cost</PanelGridTh>
                                                    </PanelGridThead>
                                                    <PanelGridTbody>
                                                        {loadingPobs ? (
                                                            <PanelGridTr><PanelGridTd colSpan={6} className="py-8 text-center text-gray-400">Loading...</PanelGridTd></PanelGridTr>
                                                        ) : tabPobs.length === 0 ? (
                                                            <PanelGridTr><PanelGridTd colSpan={6} className="py-8 text-center text-gray-400 italic">No PO records</PanelGridTd></PanelGridTr>
                                                        ) : tabPobs.map((row: any, i: number) => (
                                                            <PanelGridTr key={i} selected={i === selectedPobIdx} onClick={() => { const desel = selectedPobIdx === i; setSelectedPobIdx(desel ? -1 : i); setActiveBar(desel ? null : "po"); }}>
                                                                <PanelGridTd>{row.ap_type}</PanelGridTd>
                                                                <PanelGridTd>{formatDateEST(row.ap_date)}</PanelGridTd>
                                                                <PanelGridTd align="right">{formatMoney(row.ammount)}</PanelGridTd>
                                                                <PanelGridTd>{row.porder_no}</PanelGridTd>
                                                                <PanelGridTd>{formatDateEST(row.po_date)}</PanelGridTd>
                                                                <PanelGridTd align="right" className="font-black text-[#FB7506]">{formatMoney(row.cost)}</PanelGridTd>
                                                            </PanelGridTr>
                                                        ))}
                                                    </PanelGridTbody>
                                                </PanelGridTable>
                                            </div>
                                        </div>
                                    )}

                                    {/* PREBOOKS TAB */}
                                    {activeTab === "prebooks" && (
                                        <PanelGridTable>
                                            <PanelGridThead>
                                                <PanelGridTh>Vendor</PanelGridTh>
                                                <PanelGridTh>Type</PanelGridTh>
                                                <PanelGridTh>Inv. Date</PanelGridTh>
                                                <PanelGridTh>Invoice</PanelGridTh>
                                                <PanelGridTh align="right">Amount</PanelGridTh>
                                                <PanelGridTh>Customer</PanelGridTh>
                                                <PanelGridTh>PB No</PanelGridTh>
                                                <PanelGridTh>Cust PO</PanelGridTh>
                                                <PanelGridTh>Delivery</PanelGridTh>
                                                <PanelGridTh>Notes</PanelGridTh>
                                            </PanelGridThead>
                                            <PanelGridTbody>
                                                {loadingPrebooks ? (
                                                    <PanelGridTr><PanelGridTd colSpan={10} className="py-8 text-center text-gray-400">Loading...</PanelGridTd></PanelGridTr>
                                                ) : tabPrebooks.length === 0 ? (
                                                    <PanelGridTr><PanelGridTd colSpan={10} className="py-8 text-center text-gray-400 italic">No prebook records</PanelGridTd></PanelGridTr>
                                                ) : tabPrebooks.map((row: any, i: number) => (
                                                    <PanelGridTr key={i} selected={i === selectedPbkIdx} onClick={() => setSelectedPbkIdx(i)}>
                                                        <PanelGridTd className="max-w-[140px] truncate">{row.grower}</PanelGridTd>
                                                        <PanelGridTd>{row.ap_type}</PanelGridTd>
                                                        <PanelGridTd>{formatDateEST(row.invoice_date)}</PanelGridTd>
                                                        <PanelGridTd>{row.invoice_no}</PanelGridTd>
                                                        <PanelGridTd align="right">{formatMoney(row.amount)}</PanelGridTd>
                                                        <PanelGridTd className="max-w-[120px] truncate">{row.customer}</PanelGridTd>
                                                        <PanelGridTd>{row.pbook_no}</PanelGridTd>
                                                        <PanelGridTd>{row.cporder_no}</PanelGridTd>
                                                        <PanelGridTd>{formatDateEST(row.pb_date)}</PanelGridTd>
                                                        <PanelGridTd className="max-w-[160px] truncate">{row.notes}</PanelGridTd>
                                                    </PanelGridTr>
                                                ))}
                                            </PanelGridTbody>
                                        </PanelGridTable>
                                    )}

                                    {/* CREDITS & DEBITS TAB */}
                                    {activeTab === "credits" && (
                                        <div className="flex flex-col h-full">
                                            <div className="flex items-center justify-between px-3 py-1.5 bg-white border-b border-gray-200 shrink-0">
                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{tabCredits.length} records</span>
                                                <div className="flex gap-2">
                                                    <button onClick={() => { if (!perms.canCreate) { toast.error(PERMISSION_MSGS.create); return; } setCrdbModal({ open: true, mode: "Add", type: "C" }); }} disabled={!perms.canCreate} className="flex items-center gap-1 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-50">
                                                        <Plus size={9} /> Credit
                                                    </button>
                                                    <button onClick={() => { if (!perms.canCreate) { toast.error(PERMISSION_MSGS.create); return; } setCrdbModal({ open: true, mode: "Add", type: "D" }); }} disabled={!perms.canCreate} className="flex items-center gap-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-50">
                                                        <Plus size={9} /> Debit
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="overflow-auto flex-1">
                                                <PanelGridTable>
                                                    <PanelGridThead>
                                                        <PanelGridTh className="w-14">{""}</PanelGridTh>
                                                        <PanelGridTh>Type</PanelGridTh>
                                                        <PanelGridTh>Date</PanelGridTh>
                                                        <PanelGridTh>Reason</PanelGridTh>
                                                        <PanelGridTh align="right">Amount</PanelGridTh>
                                                        <PanelGridTh>Doc. No</PanelGridTh>
                                                        <PanelGridTh>Auto No</PanelGridTh>
                                                        <PanelGridTh>Comments</PanelGridTh>
                                                    </PanelGridThead>
                                                    <PanelGridTbody>
                                                        {loadingCredits ? (
                                                            <PanelGridTr><PanelGridTd colSpan={8} className="py-8 text-center text-gray-400">Loading...</PanelGridTd></PanelGridTr>
                                                        ) : tabCredits.length === 0 ? (
                                                            <PanelGridTr><PanelGridTd colSpan={8} className="py-8 text-center text-gray-400 italic">No credits or debits</PanelGridTd></PanelGridTr>
                                                        ) : tabCredits.map((cr: any, i: number) => (
                                                            <PanelGridTr key={i} selected={i === selectedCrdbIdx} onClick={() => { const desel = selectedCrdbIdx === i; setSelectedCrdbIdx(desel ? -1 : i); setActiveBar(desel ? null : "credits"); }}>
                                                                <PanelGridTd className="w-14">
                                                                    <div className="flex gap-1">
                                                                        <button onClick={e => { e.stopPropagation(); if (!perms.canEdit) { toast.error(PERMISSION_MSGS.edit); return; } handleEditCrdb(cr); }} className="p-1 rounded text-blue-500 hover:text-blue-700 hover:bg-blue-100 transition-colors" title="Edit"><Pencil size={12} /></button>
                                                                        <button onClick={e => { e.stopPropagation(); if (!perms.canDelete) { toast.error(PERMISSION_MSGS.delete); return; } setCrdbModal({ open: true, mode: "Delete", type: cr.type, row: cr }); }} className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete"><Trash2 size={12} /></button>
                                                                    </div>
                                                                </PanelGridTd>
                                                                <PanelGridTd>
                                                                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold", cr.type === "C" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600")}>
                                                                        {cr.type === "C" ? "Credit" : "Debit"}
                                                                    </span>
                                                                </PanelGridTd>
                                                                <PanelGridTd>{formatDateEST(cr.cd_date)}</PanelGridTd>
                                                                <PanelGridTd className="font-medium max-w-[150px] truncate">{cr.reason}</PanelGridTd>
                                                                <PanelGridTd align="right" className={cn("font-semibold", cr.type === "C" ? "text-green-600" : "text-red-500")}>{formatMoney(cr.cd_amount)}</PanelGridTd>
                                                                <PanelGridTd>{cr.retention_no}</PanelGridTd>
                                                                <PanelGridTd className="text-gray-400">{cr.cd_no}</PanelGridTd>
                                                                <PanelGridTd className="max-w-[200px] truncate">{cr.cd_details}</PanelGridTd>
                                                            </PanelGridTr>
                                                        ))}
                                                    </PanelGridTbody>
                                                </PanelGridTable>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <AppFooter areaLabel="Terminal" />

            {/* ── Floating Search Button (mobile only, when a date is selected) ─── */}
            {selectedDate && (
                <button
                    onClick={() => setSearchModal(true)}
                    className="md:hidden fixed bottom-40 right-4 z-30 w-14 h-14 bg-white border-2 border-gray-200 text-gray-600 rounded-full shadow-lg flex items-center justify-center transition-all hover:bg-gray-50"
                >
                    <Search size={22} />
                </button>
            )}

            {/* ── Floating Add Button (mobile only, when a date is selected) ─── */}
            {selectedDate && (
                <button
                    onClick={() => { if (!perms.canCreate) { toast.error(PERMISSION_MSGS.create); return; } setInvoiceModal({ open: true, mode: "Add" }); }}
                    className="md:hidden fixed bottom-24 right-4 z-30 w-14 h-14 bg-[#FB7506] hover:bg-orange-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all"
                >
                    <Plus size={24} />
                </button>
            )}

            {/* ── Mobile Action Bar ────────────────────────────────────────────── */}
            <MobileActionBar
                activeGrid={activeBar}
                items={[
                    { grid: "invoices", label: "Edit",     icon: Pencil, color: "orange", onClick: () => { if (!perms.canEdit)   { toast.error(PERMISSION_MSGS.edit);   return; } selectedUnico && setInvoiceModal({ open: true, mode: "Edit" });   }, disabled: !selectedUnico || !perms.canEdit   },
                    { grid: "invoices", label: "Delete",   icon: Trash2, color: "red",    onClick: () => { if (!perms.canDelete) { toast.error(PERMISSION_MSGS.delete); return; } selectedUnico && setInvoiceModal({ open: true, mode: "Delete" }); }, disabled: !selectedUnico || !perms.canDelete },
                    { grid: "po",       label: "Update POs", icon: Pencil, color: "orange", onClick: () => setPobModal({ open: true }), disabled: !selectedUnico || !perms.canEdit },
                    { grid: "credits",  label: "Credit",   icon: Plus,   color: "green",  onClick: () => { if (!perms.canCreate) { toast.error(PERMISSION_MSGS.create); return; } setCrdbModal({ open: true, mode: "Add", type: "C" }); }, disabled: !selectedUnico || !perms.canCreate },
                    { grid: "credits",  label: "Debit",    icon: Plus,   color: "red",    onClick: () => { if (!perms.canCreate) { toast.error(PERMISSION_MSGS.create); return; } setCrdbModal({ open: true, mode: "Add", type: "D" }); }, disabled: !selectedUnico || !perms.canCreate },
                    { grid: "credits",  label: "Edit",     icon: Pencil, color: "orange", onClick: () => { if (!perms.canEdit)   { toast.error(PERMISSION_MSGS.edit);   return; } selectedCrdbIdx >= 0 && handleEditCrdb(tabCredits[selectedCrdbIdx]); }, disabled: selectedCrdbIdx < 0 || tabCredits.length === 0 || !perms.canEdit   },
                    { grid: "credits",  label: "Delete",   icon: Trash2, color: "red",    onClick: () => { if (!perms.canDelete) { toast.error(PERMISSION_MSGS.delete); return; } selectedCrdbIdx >= 0 && tabCredits[selectedCrdbIdx] && setCrdbModal({ open: true, mode: "Delete", type: tabCredits[selectedCrdbIdx].type, row: tabCredits[selectedCrdbIdx] }); }, disabled: selectedCrdbIdx < 0 || tabCredits.length === 0 || !perms.canDelete },
                ]}
                onClearSelection={() => {
                    if (activeBar === "invoices") setUnico(null);
                    if (activeBar === "po") setSelectedPobIdx(-1);
                    if (activeBar === "credits") setSelectedCrdbIdx(-1);
                    setActiveBar(null);
                }}
            />

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

            {searchModal && (
                <APSearchModal
                    growers={growers}
                    onClose={() => setSearchModal(false)}
                    onLocate={handleLocate}
                />
            )}

            {summaryModal && (
                <VendorSummaryModal onClose={() => setSummaryModal(false)} />
            )}

            {pendingAPModal && (
                <PendingAPModal onClose={() => setPendingAPModal(false)} />
            )}

            {invoiceModal?.open && (
                invoiceModal.mode === "Delete" ? (
                    <DeleteDialog
                        title="Delete Invoice"
                        message={`Delete invoice ${String(selectedInvoice?.invoice_no || "").trim()} from ${String(selectedInvoice?.grower || "").trim()}? This cannot be undone.`}
                        onCancel={() => setInvoiceModal(null)}
                        onConfirm={() => invoiceDelete.mutate(selectedUnico!)}
                        saving={invoiceDelete.isPending}
                    />
                ) : (
                    <InvoiceModal
                        mode={invoiceModal.mode}
                        invoice={invoiceModal.mode === "Edit" ? invoice : null}
                        growers={growers}
                        termsList={termsList}
                        selectedDate={selectedDate}
                        onClose={() => setInvoiceModal(null)}
                        onSave={(data: InvoiceForm) =>
                            invoiceModal.mode === "Add"
                                ? invoiceAdd.mutate(data)
                                : invoiceEdit.mutate({ ...data, lcunico: selectedUnico })
                        }
                        saving={invoiceAdd.isPending || invoiceEdit.isPending}
                    />
                )
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

// ─── Shared Utilities ────────────────────────────────────────────────────────
const COMPANY_HEADER = `
  <div style="text-align:center;margin-bottom:16px">
    <div style="font-size:18px;font-weight:bold">FULL POT</div>
    <div style="font-size:11px">Phone: (954)568 4467 / . Fax:(954)568 4463 /</div>
    <div style="font-size:11px">1516 SW 13 CT - POMPANO BEACH, FL - USA - e-mail: sales@fullpot.com</div>
    <hr style="border:1px solid #000;margin:6px 0"/>
    <hr style="border:1px solid #000;margin:6px 0"/>
  </div>`;

const PRINT_CSS = `
  body{font-family:Arial,sans-serif;font-size:11px;margin:20px;color:#000}
  table{width:100%;border-collapse:collapse;margin-top:8px}
  th{background:#e5e7eb;border:1px solid #9ca3af;padding:4px 8px;font-weight:bold;text-align:left}
  td{border:1px solid #d1d5db;padding:4px 8px}
  .tr{text-align:right} .tc{text-align:center}
  .total{font-weight:bold;background:#f9fafb}
  .vendor-hdr{font-size:13px;font-weight:bold;margin:18px 0 4px}
  .vendor-info{margin-bottom:8px;font-size:11px;line-height:1.6}
  @media print{@page{margin:1.5cm}}`;

function printReport(title: string, bodyHtml: string) {
    const w = window.open('', '_blank');
    if (!w) { alert('Please allow popups to print reports.'); return; }
    const dateStr = new Date().toLocaleString('en-US');
    w.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
      <style>${PRINT_CSS}</style></head><body>
      ${COMPANY_HEADER}
      <div style="text-align:center;font-size:14px;font-weight:bold;margin-bottom:12px">${title}</div>
      <div style="font-size:11px;margin-bottom:12px">Date ${dateStr} &nbsp;&nbsp;&nbsp; Page 1</div>
      ${bodyHtml}
    </body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 600);
}

// ─── Vendor Combobox (incremental search for report modals) ──────────────────
function VendorCombobox({ growers, value, onChange, allowAll = true }: {
    growers:  any[];
    value:    string;           // grower_uq or "%"
    onChange: (uq: string, name: string) => void;
    allowAll?: boolean;
}) {
    const [input,   setInput]   = useState("");
    const [open,    setOpen]    = useState(false);
    const [display, setDisplay] = useState(allowAll ? "— All Vendors —" : "");

    const filtered = useMemo(() => {
        if (!input.trim()) return growers.slice(0, 100);
        const q = input.toLowerCase();
        return growers.filter((g: any) =>
            String(g.grower || "").toLowerCase().includes(q)
        ).slice(0, 100);
    }, [input, growers]);

    const select = (g: any) => {
        const name = String(g.grower || "").trim();
        setDisplay(name); setInput(""); setOpen(false);
        onChange(g.grower_uq || g.unico, name);
    };
    const clearAll = () => {
        if (!allowAll) return;
        setDisplay("— All Vendors —"); setInput(""); setOpen(false);
        onChange("%", "");
    };

    return (
        <div className="relative flex-1 min-w-[200px]">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Vendor</label>
            <div
                className="fos-input flex items-center justify-between cursor-pointer gap-2"
                onClick={() => setOpen(o => !o)}
            >
                <span className={cn("truncate text-xs", value === "%" ? "text-gray-400" : "text-gray-700 font-medium")}>
                    {display}
                </span>
                <ChevronRight size={12} className={cn("text-gray-400 shrink-0 transition-transform", open && "rotate-90")} />
            </div>
            {open && (
                <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-lg shadow-xl mt-0.5 flex flex-col max-h-64">
                    <div className="p-2 border-b border-gray-100 shrink-0">
                        <input
                            autoFocus
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Type to filter vendors..."
                            className="fos-input text-xs"
                            onClick={e => e.stopPropagation()}
                        />
                    </div>
                    <div className="overflow-auto flex-1">
                        {allowAll && (
                            <div onMouseDown={clearAll} className="px-3 py-2 text-xs text-gray-400 italic hover:bg-blue-50 cursor-pointer border-b border-gray-50">
                                — All Vendors —
                            </div>
                        )}
                        {filtered.map((g: any) => (
                            <div
                                key={g.grower_uq || g.unico}
                                onMouseDown={() => select(g)}
                                className="px-3 py-2 text-xs text-gray-700 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-b-0"
                            >
                                {String(g.grower || "").trim()}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Report Filter Bar (shared) ───────────────────────────────────────────────
function ReportFilterBar({ growers, growerUq, onVendorChange, dateFrom, setDateFrom, dateTo, setDateTo, onRun, loading, allowAll = true }: any) {
    return (
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex flex-wrap items-end gap-3 shrink-0">
            <VendorCombobox growers={growers} value={growerUq} onChange={onVendorChange} allowAll={allowAll} />
            <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">From</label>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="fos-input w-36" />
            </div>
            <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">To</label>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="fos-input w-36" />
            </div>
            <button
                onClick={onRun}
                disabled={loading}
                className="flex items-center gap-1.5 bg-[#FB7506] hover:bg-orange-600 disabled:opacity-50 text-white px-4 py-1.5 rounded text-xs font-black uppercase tracking-wider transition-all h-[34px]"
            >
                {loading ? <RefreshCcw size={12} className="animate-spin" /> : <Search size={12} />}
                Run
            </button>
        </div>
    );
}

// ─── Vendor Summary Modal ─────────────────────────────────────────────────────
function VendorSummaryModal({ onClose }: { onClose: () => void }) {
    const today    = todayEST();
    const yearStart = `${currentYearEST()}-01-01`;

    const [growerUq,  setGrowerUq]  = useState("%");
    const [dateFrom,  setDateFrom]  = useState(yearStart);
    const [dateTo,    setDateTo]    = useState(today);
    const [rows,      setRows]      = useState<any[]>([]);
    const [loading,   setLoading]   = useState(false);
    const [error,     setError]     = useState<string | null>(null);
    const [ranOnce,   setRanOnce]   = useState(false);

    const { data: growers = EMPTY_ARR } = useQuery({
        queryKey: ["rpt-growers-balance"],
        queryFn:  () => apFetch("/api/accounts-payable/reports/balance"),
        staleTime: 1000 * 60 * 5,
    });

    const run = async () => {
        setLoading(true); setError(null);
        try {
            const data = await apFetch(
                `/api/accounts-payable/reports/summary?grower_uq=${growerUq}&from=${dateFrom}&to=${dateTo}`
            );
            setRows(Array.isArray(data) ? data : []);
            setRanOnce(true);
        } catch (e: any) { setError(e.message); }
        finally { setLoading(false); }
    };

    // Verified field names: ammount, cre_ammount, deb_ammount, total_balance, email_1
    const totalAmount  = rows.reduce((s, r) => s + parseMoney(r.ammount), 0);
    const totalCredits = rows.reduce((s, r) => s + parseMoney(r.cre_ammount), 0);
    const totalDebits  = rows.reduce((s, r) => s + parseMoney(r.deb_ammount), 0);
    const totalBalance = rows.reduce((s, r) => s + parseMoney(r.total_balance), 0);

    const handleExportCSV = () => {
        const headers = ['Vendor', 'Contact', 'Phone', 'Fax', 'E-Mail', 'Amount', 'Credits', 'Debits', 'Balance'];
        const dataRows = rows.map((r: any) => [
            String(r.grower ?? "").trim(), String(r.contact ?? "").trim(), String(r.phone_1 ?? "").trim(),
            String(r.fax_1 ?? "").trim(), String(r.email_1 ?? "").trim(),
            parseMoney(r.ammount).toFixed(2), parseMoney(r.cre_ammount).toFixed(2),
            parseMoney(r.deb_ammount).toFixed(2), parseMoney(r.total_balance).toFixed(2),
        ]);
        const totals = ['Total Payable', '', '', '', '', totalAmount.toFixed(2), totalCredits.toFixed(2), totalDebits.toFixed(2), totalBalance.toFixed(2)];
        const csv = [headers, ...dataRows, totals].map(row => row.map((c: string) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = Object.assign(document.createElement('a'), { href: url, download: `VendorSummary_${dateFrom}_${dateTo}.csv` });
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handlePrint = () => {
        const thead = `<tr><th>Vendor</th><th>Contact</th><th>Phone</th><th>Fax</th><th>E-Mail</th>
          <th class="tr">Amount</th><th class="tr">Credits</th><th class="tr">Debits</th><th class="tr">Balance</th></tr>`;
        const tbody = rows.map(r => `
          <tr>
            <td>${String(r.grower ?? "").trim()}</td>
            <td>${String(r.contact ?? "").trim()}</td>
            <td>${String(r.phone_1 ?? "").trim()}</td>
            <td>${String(r.fax_1 ?? "").trim()}</td>
            <td>${String(r.email_1 ?? "").trim()}</td>
            <td class="tr">${parseMoney(r.ammount).toFixed(2)}</td>
            <td class="tr">${parseMoney(r.cre_ammount).toFixed(2)}</td>
            <td class="tr">${parseMoney(r.deb_ammount).toFixed(2)}</td>
            <td class="tr">${parseMoney(r.total_balance).toFixed(2)}</td>
          </tr>`).join('');
        const tfoot = `<tr class="total">
          <td colspan="5" style="text-align:right;font-weight:bold">Total Payable</td>
          <td class="tr">${totalAmount.toFixed(2)}</td>
          <td class="tr">${totalCredits.toFixed(2)}</td>
          <td class="tr">${totalDebits.toFixed(2)}</td>
          <td class="tr">${totalBalance.toFixed(2)}</td></tr>`;
        printReport("VENDORS SUMMARY", `<table><thead>${thead}</thead><tbody>${tbody}${tfoot}</tbody></table>`);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[88vh]">
                <div className="h-10 bg-[#374151] flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-2">
                        <BarChart2 size={14} className="text-[#FB7506]" />
                        <span className="font-black text-[11px] uppercase tracking-widest text-white">Vendor Summary</span>
                    </div>
                    <button onClick={onClose}><XCircle size={16} className="text-gray-400 hover:text-white" /></button>
                </div>

                <ReportFilterBar {...{ growers, growerUq, onVendorChange: (uq: string) => setGrowerUq(uq), dateFrom, setDateFrom, dateTo, setDateTo, onRun: run, loading, allowAll: true }} />

                {error && <p className="text-xs text-red-500 px-4 py-2 font-bold">{error}</p>}

                <div className="overflow-auto flex-1">
                    {!ranOnce ? (
                        <div className="h-40 flex flex-col items-center justify-center text-gray-300 gap-2">
                            <BarChart2 size={32} className="opacity-30" />
                            <p className="text-xs font-bold uppercase tracking-widest">Set filters and click Run</p>
                        </div>
                    ) : rows.length === 0 ? (
                        <div className="h-40 flex items-center justify-center text-gray-400 text-xs font-bold italic">No data for selected criteria</div>
                    ) : (
                        <table className="min-w-full text-xs text-left">
                            <thead className="bg-gray-100 border-b text-gray-700 font-bold sticky top-0 z-10">
                                <tr>
                                    <th className="p-2 whitespace-nowrap">Vendor</th>
                                    <th className="p-2 border-l border-gray-200">Contact</th>
                                    <th className="p-2 border-l border-gray-200">Phone</th>
                                    <th className="p-2 border-l border-gray-200">Fax</th>
                                    <th className="p-2 border-l border-gray-200">E-Mail</th>
                                    <th className="p-2 border-l border-gray-200 text-right">Amount</th>
                                    <th className="p-2 border-l border-gray-200 text-right text-green-700">Credits</th>
                                    <th className="p-2 border-l border-gray-200 text-right text-red-600">Debits</th>
                                    <th className="p-2 border-l border-gray-200 text-right">Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((r, i) => (
                                    <tr key={i} className="border-b odd:bg-white even:bg-gray-50 hover:bg-blue-50 transition-colors">
                                        <td className="p-2 font-medium truncate max-w-[160px]">{String(r.grower ?? "").trim()}</td>
                                        <td className="p-2 border-l border-gray-100">{String(r.contact ?? "").trim()}</td>
                                        <td className="p-2 border-l border-gray-100 whitespace-nowrap">{String(r.phone_1 ?? "").trim()}</td>
                                        <td className="p-2 border-l border-gray-100">{String(r.fax_1 ?? "").trim()}</td>
                                        <td className="p-2 border-l border-gray-100 truncate max-w-[140px]">{String(r.email_1 ?? "").trim()}</td>
                                        <td className="p-2 border-l border-gray-100 text-right">{formatMoney(r.ammount)}</td>
                                        <td className="p-2 border-l border-gray-100 text-right text-green-600">{formatMoney(r.cre_ammount)}</td>
                                        <td className="p-2 border-l border-gray-100 text-right text-red-500">{formatMoney(r.deb_ammount)}</td>
                                        <td className="p-2 border-l border-gray-100 text-right font-semibold text-orange-600">{formatMoney(r.total_balance)}</td>
                                    </tr>
                                ))}
                                <tr className="border-t-2 border-gray-300 bg-gray-50 font-black">
                                    <td colSpan={5} className="p-2 text-right text-gray-700">Total Payable</td>
                                    <td className="p-2 border-l border-gray-200 text-right">{formatMoney(totalAmount)}</td>
                                    <td className="p-2 border-l border-gray-200 text-right text-green-600">{formatMoney(totalCredits)}</td>
                                    <td className="p-2 border-l border-gray-200 text-right text-red-500">{formatMoney(totalDebits)}</td>
                                    <td className="p-2 border-l border-gray-200 text-right text-orange-600">{formatMoney(totalBalance)}</td>
                                </tr>
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-t shrink-0">
                    <span className="text-[10px] font-bold text-gray-400">{ranOnce ? `${rows.length} vendors` : ""}</span>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-100">Close</button>
                        <button onClick={handleExportCSV} disabled={!rows.length}
                            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white text-sm font-black uppercase tracking-wider transition-all">
                            <Download size={14} /> CSV
                        </button>
                        <button onClick={handlePrint} disabled={!rows.length}
                            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#374151] hover:bg-gray-600 disabled:opacity-40 text-white text-sm font-black uppercase tracking-wider transition-all">
                            <Printer size={14} /> Print
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Pending AP Modal ─────────────────────────────────────────────────────────
function PendingAPModal({ onClose }: { onClose: () => void }) {
    const today     = todayEST();
    const yearStart = `${currentYearEST()}-01-01`;

    const [growerUq,   setGrowerUq]   = useState("");   // empty = no selection yet
    const [growerName, setGrowerName] = useState("");
    const [dateFrom,   setDateFrom]   = useState(yearStart);
    const [dateTo,     setDateTo]     = useState(today);
    const [rows,       setRows]       = useState<any[]>([]);
    const [loading,    setLoading]    = useState(false);
    const [error,      setError]      = useState<string | null>(null);
    const [ranOnce,    setRanOnce]    = useState(false);

    const { data: growers = EMPTY_ARR } = useQuery({
        queryKey: ["rpt-growers-balance"],
        queryFn:  () => apFetch("/api/accounts-payable/reports/balance"),
        staleTime: 1000 * 60 * 5,
    });

    const run = async () => {
        if (!growerUq) { setError("Please select a vendor to view their pending invoices."); return; }
        setLoading(true); setError(null);
        try {
            const data = await apFetch(
                `/api/accounts-payable/reports/pending?grower_uq=${growerUq}&from=${dateFrom}&to=${dateTo}`
            );
            setRows(Array.isArray(data) ? data : []);
            setRanOnce(true);
        } catch (e: any) { setError(e.message); }
        finally { setLoading(false); }
    };

    // Group rows by grower_uq (verified field name)
    const grouped = useMemo(() => {
        const map = new Map<string, { info: any; invoices: any[] }>();
        rows.forEach(r => {
            const key = r.grower_uq || r.acc_pay_uq || String(r.grower || "");
            if (!map.has(key)) map.set(key, { info: r, invoices: [] });
            map.get(key)!.invoices.push(r);
        });
        return Array.from(map.values());
    }, [rows]);

    // Verified field names: ammount, cre_ammount, deb_ammount, total_balance
    const grandTotal = rows.reduce((s, r) => s + parseMoney(r.total_balance), 0);

    const handleExportCSV = () => {
        const headers = ['Vendor', 'Invoice', 'Date', 'Amount', 'Credits', 'Debits', 'Balance'];
        const dataRows = rows.map((r: any) => [
            String(r.grower ?? "").trim(), String(r.invoice_no ?? "").trim(),
            formatDateEST(normalizeToISODate(r.ap_date)),
            parseMoney(r.ammount).toFixed(2), parseMoney(r.cre_ammount).toFixed(2),
            parseMoney(r.deb_ammount).toFixed(2), parseMoney(r.total_balance).toFixed(2),
        ]);
        const totals = ['Grand Total', '', '', '', '', '', grandTotal.toFixed(2)];
        const csv = [headers, ...dataRows, totals].map(row => row.map((c: string) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = Object.assign(document.createElement('a'), { href: url, download: `PendingAP_${dateFrom}_${dateTo}.csv` });
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handlePrint = () => {
        const sections = grouped.map(({ info, invoices }) => {
            const vendorRows = invoices.map(inv => `
              <tr>
                <td>${String(inv.invoice_no ?? "").trim()}</td>
                <td>${formatDateEST(normalizeToISODate(inv.ap_date))}</td>
                <td class="tr">${parseMoney(inv.ammount).toFixed(2)}</td>
                <td class="tr">${parseMoney(inv.cre_ammount).toFixed(2)}</td>
                <td class="tr">${parseMoney(inv.deb_ammount).toFixed(2)}</td>
                <td class="tr">${parseMoney(inv.total_balance).toFixed(2)}</td>
              </tr>`).join('');
            const vendorTotal = invoices.reduce((s, r) => s + parseMoney(r.total_balance), 0);
            return `
              <div class="vendor-hdr">Vendor &nbsp; ${String(info.grower ?? "").trim()}</div>
              <div class="vendor-info">
                Phones &nbsp; ${String(info.phone_1 ?? "").trim()} &nbsp;&nbsp;
                <strong>Fax</strong> &nbsp; ${String(info.fax_1 ?? "").trim()} &nbsp;&nbsp;
                Contact &nbsp; ${String(info.contact ?? "").trim()}
              </div>
              <table>
                <thead><tr><th>Invoice</th><th>Date</th><th class="tr">Amount</th><th class="tr">Credits</th><th class="tr">Debits</th><th class="tr">Balance</th></tr></thead>
                <tbody>${vendorRows}
                  <tr class="total"><td colspan="5" style="text-align:right">Total ${String(info.grower ?? "").trim()}</td>
                    <td class="tr">${vendorTotal.toFixed(2)}</td></tr>
                </tbody></table>`;
        }).join('<div style="margin:16px 0;border-top:1px solid #e5e7eb"></div>');
        const footer = `<div style="margin-top:24px;text-align:right;font-size:13px;font-weight:bold">Grand Total Payable &nbsp;&nbsp; ${grandTotal.toFixed(2)}</div>`;
        printReport("PENDING ACCOUNTS PAYABLE", sections + footer);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[88vh]">
                <div className="h-10 bg-[#374151] flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-2">
                        <Clock size={14} className="text-[#FB7506]" />
                        <span className="font-black text-[11px] uppercase tracking-widest text-white">Pending Accounts Payable</span>
                    </div>
                    <button onClick={onClose}><XCircle size={16} className="text-gray-400 hover:text-white" /></button>
                </div>

                <ReportFilterBar {...{
                    growers,
                    growerUq,
                    onVendorChange: (uq: string, name: string) => { setGrowerUq(uq); setGrowerName(name); setError(null); },
                    dateFrom, setDateFrom, dateTo, setDateTo,
                    onRun: run, loading,
                    allowAll: false,
                }} />

                {error && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border-b border-amber-200 shrink-0">
                        <AlertCircle size={14} className="text-amber-500 shrink-0" />
                        <p className="text-xs text-amber-700 font-bold">{error}</p>
                    </div>
                )}

                <div className="overflow-auto flex-1 p-4 bg-gray-50">
                    {!ranOnce ? (
                        <div className="h-40 flex flex-col items-center justify-center text-gray-300 gap-2">
                            <Clock size={32} className="opacity-30" />
                            <p className="text-xs font-bold uppercase tracking-widest">Select a vendor and click Run</p>
                        </div>
                    ) : rows.length === 0 ? (
                        <div className="h-40 flex items-center justify-center text-gray-400 text-xs font-bold italic">No pending invoices found</div>
                    ) : (
                        <div className="space-y-6">
                            {grouped.map(({ info, invoices }, gi) => {
                                const vendorTotal = invoices.reduce((s, r) => s + parseMoney(r.total_balance), 0);
                                return (
                                    <div key={gi} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                                        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                                            <div className="font-black text-sm text-gray-800">{String(info.grower ?? "").trim()}</div>
                                            <div className="text-xs text-gray-500 flex gap-4 mt-0.5">
                                                {info.phone_1?.trim() && <span>📞 {info.phone_1.trim()}</span>}
                                                {info.fax_1?.trim()   && <span>📠 {info.fax_1.trim()}</span>}
                                                {info.contact?.trim() && <span>👤 {info.contact.trim()}</span>}
                                            </div>
                                        </div>
                                        <table className="min-w-full text-xs text-left">
                                            <thead className="bg-gray-100 border-b text-gray-700 font-bold">
                                                <tr>
                                                    <th className="p-2">Invoice</th>
                                                    <th className="p-2 border-l border-gray-200">Date</th>
                                                    <th className="p-2 border-l border-gray-200 text-right">Amount</th>
                                                    <th className="p-2 border-l border-gray-200 text-right text-green-700">Credits</th>
                                                    <th className="p-2 border-l border-gray-200 text-right text-red-600">Debits</th>
                                                    <th className="p-2 border-l border-gray-200 text-right">Balance</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {invoices.map((inv, ii) => (
                                                    <tr key={ii} className="border-b odd:bg-white even:bg-gray-50">
                                                        <td className="p-2 font-semibold text-[#FB7506]">{String(inv.invoice_no ?? "").trim()}</td>
                                                        <td className="p-2 border-l border-gray-100">{formatDateEST(normalizeToISODate(inv.ap_date))}</td>
                                                        <td className="p-2 border-l border-gray-100 text-right">{formatMoney(inv.ammount)}</td>
                                                        <td className="p-2 border-l border-gray-100 text-right text-green-600">{formatMoney(inv.cre_ammount)}</td>
                                                        <td className="p-2 border-l border-gray-100 text-right text-red-500">{formatMoney(inv.deb_ammount)}</td>
                                                        <td className="p-2 border-l border-gray-100 text-right font-semibold text-orange-600">{formatMoney(inv.total_balance)}</td>
                                                    </tr>
                                                ))}
                                                <tr className="border-t border-gray-300 bg-orange-50 font-black">
                                                    <td colSpan={5} className="p-2 text-right text-gray-700 text-xs">Total {String(info.grower ?? "").trim()}</td>
                                                    <td className="p-2 border-l border-gray-200 text-right text-orange-600">{formatMoney(vendorTotal)}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                );
                            })}
                            <div className="flex justify-end">
                                <div className="bg-[#374151] text-white px-6 py-3 rounded-lg flex items-center gap-4">
                                    <span className="text-sm font-black uppercase tracking-wider">Total Payable</span>
                                    <span className="text-xl font-black text-[#FB7506]">{formatMoney(grandTotal)}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-t shrink-0">
                    <span className="text-[10px] font-bold text-gray-400">
                        {ranOnce ? `${grouped.length} vendor${grouped.length !== 1 ? 's' : ''} · ${rows.length} invoices` : ""}
                    </span>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-100">Close</button>
                        <button onClick={handleExportCSV} disabled={!rows.length}
                            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white text-sm font-black uppercase tracking-wider transition-all">
                            <Download size={14} /> CSV
                        </button>
                        <button onClick={handlePrint} disabled={!rows.length}
                            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#374151] hover:bg-gray-600 disabled:opacity-40 text-white text-sm font-black uppercase tracking-wider transition-all">
                            <Printer size={14} /> Print
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── AP Search Modal ─────────────────────────────────────────────────────────
function APSearchModal({ growers, onClose, onLocate }: {
    growers: any[];
    onClose: () => void;
    onLocate: (result: any) => void;
}) {
    const [farmInput,   setFarmInput]   = useState("");  // text shown in input
    const [farmSend,    setFarmSend]    = useState("");  // value sent to SP (farm code or typed text)
    const [ddOpen,      setDdOpen]      = useState(false);
    const [invoiceNo,   setInvoiceNo]   = useState("");
    const [results,   setResults]   = useState<any[]>([]);
    const [loading,   setLoading]   = useState(false);
    const [searched,  setSearched]  = useState(false);
    const [selected,  setSelected]  = useState<any>(null);
    const [error,     setError]     = useState<string | null>(null);

    // Filtered vendors for dropdown
    const filteredGrowers = useMemo(() => {
        if (!farmInput.trim()) return growers.slice(0, 80);
        const q = farmInput.toLowerCase();
        return growers.filter((g: any) =>
            String(g.grower || "").toLowerCase().includes(q) ||
            String(g.farm   || "").toLowerCase().includes(q)
        ).slice(0, 80);
    }, [farmInput, growers]);

    const handleFarmInput = (text: string) => {
        setFarmInput(text);
        setFarmSend("");     // clear until user picks from the list
        setDdOpen(true);
    };

    const handleFarmSelect = (g: any) => {
        const name = String(g.grower || "").trim();
        const code = String(g.farm   || "").trim();
        setFarmInput(name);
        setFarmSend(code);
        setError(null);
        setDdOpen(false);
    };

    const handleSearch = async () => {
        setDdOpen(false);
        if (!farmSend.trim()) { setError("Select a vendor from the list before searching."); return; }
        setLoading(true); setError(null); setSelected(null);
        try {
            const params = new URLSearchParams();
            if (farmSend.trim())  params.set("farm",       farmSend.trim());
            if (invoiceNo.trim()) params.set("invoice_no", invoiceNo.trim());
            const data = await apFetch(`/api/accounts-payable/search?${params}`);
            setResults(Array.isArray(data) ? data : []);
            setSearched(true);
            if (Array.isArray(data) && data.length > 0) setSelected(data[0]);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setFarmInput(""); setFarmSend(""); setInvoiceNo(""); setResults([]);
        setSearched(false); setSelected(null); setError(null); setDdOpen(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[85vh]">

                {/* Header */}
                <div className="h-10 bg-[#374151] flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-2">
                        <Search size={14} className="text-[#FB7506]" />
                        <span className="font-black text-[11px] uppercase tracking-widest text-white">AP Search</span>
                    </div>
                    <button onClick={onClose}><XCircle size={16} className="text-gray-400 hover:text-white transition-colors" /></button>
                </div>

                {/* Search Bar */}
                <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 shrink-0">
                    <div className="flex items-end gap-3 flex-wrap">
                        <div className="flex flex-col gap-1 flex-1 min-w-[220px] relative">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                Vendor {farmSend && farmSend !== farmInput && (
                                    <span className="text-[#FB7506] normal-case font-normal ml-1">code: {farmSend}</span>
                                )}
                            </label>
                            <input
                                type="text"
                                value={farmInput}
                                onChange={e => handleFarmInput(e.target.value)}
                                onFocus={() => setDdOpen(true)}
                                onBlur={() => setTimeout(() => setDdOpen(false), 180)}
                                onKeyDown={e => e.key === "Enter" && handleSearch()}
                                placeholder="Type name or farm code..."
                                className="fos-input"
                                autoFocus
                                autoComplete="off"
                            />
                            {ddOpen && filteredGrowers.length > 0 && (
                                <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-lg shadow-xl max-h-52 overflow-auto mt-0.5">
                                    {filteredGrowers.map((g: any) => (
                                        <div
                                            key={g.unico}
                                            onMouseDown={() => handleFarmSelect(g)}
                                            className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-b-0"
                                        >
                                            <span className="font-black text-gray-400 w-12 shrink-0 uppercase">
                                                {String(g.farm || "").trim()}
                                            </span>
                                            <span className="text-gray-700 truncate">
                                                {String(g.grower || "").trim()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Invoice No.</label>
                            <input
                                type="text"
                                value={invoiceNo}
                                onChange={e => setInvoiceNo(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleSearch()}
                                placeholder="Invoice number..."
                                className="fos-input"
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            disabled={loading || !farmSend.trim()}
                            className="flex items-center gap-1.5 bg-[#FB7506] hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded text-xs font-black uppercase tracking-wider transition-all h-[34px]"
                        >
                            {loading ? <RefreshCcw size={12} className="animate-spin" /> : <Search size={12} />}
                            Search
                        </button>
                        <button
                            onClick={handleClear}
                            className="flex items-center gap-1.5 bg-gray-200 hover:bg-gray-300 text-gray-600 px-4 py-1.5 rounded text-xs font-black uppercase tracking-wider transition-all h-[34px]"
                        >
                            <XCircle size={12} /> Clear
                        </button>
                    </div>
                    {error && <p className="text-xs text-red-500 mt-2 font-bold">{error}</p>}
                </div>

                {/* Results Count */}
                {searched && (
                    <div className="px-4 py-1.5 bg-white border-b border-gray-100 shrink-0">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                            {results.length} {results.length === 1 ? "result" : "results"} found
                        </span>
                    </div>
                )}

                {/* Results Table */}
                <div className="overflow-auto flex-1">
                    {!searched ? (
                        <div className="h-40 flex flex-col items-center justify-center text-gray-300 gap-2">
                            <Search size={32} className="opacity-30" />
                            <p className="text-xs font-bold uppercase tracking-widest">Enter search criteria above</p>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="h-40 flex flex-col items-center justify-center text-gray-300 gap-2">
                            <AlertCircle size={32} className="opacity-30" />
                            <p className="text-xs font-bold uppercase tracking-widest">No invoices found</p>
                        </div>
                    ) : (
                        <table className="min-w-full text-xs text-left">
                            <thead className="bg-gray-100 border-b text-gray-700 font-bold sticky top-0 z-10">
                                <tr>
                                    {["Vendor","Invoice","Estimated","Amount","Credits","Debits","Balance","Control Date","AP Date","Phone"].map(h => (
                                        <th key={h} className="p-2 whitespace-nowrap border-r border-gray-200 last:border-r-0">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((inv: any, i: number) => (
                                    <tr
                                        key={inv.unico || i}
                                        onClick={() => setSelected(inv)}
                                        onDoubleClick={() => onLocate(inv)}
                                        className={cn(
                                            "border-b cursor-pointer transition-colors",
                                            selected?.unico === inv.unico
                                                ? "!bg-blue-100 ring-2 ring-inset ring-blue-300"
                                                : "odd:bg-white even:bg-gray-50 hover:bg-blue-50"
                                        )}
                                    >
                                        <td className="p-2 border-r border-gray-100 font-medium truncate max-w-[180px]">{String(inv.grower || "").trim()}</td>
                                        <td className="p-2 border-r border-gray-100 font-semibold text-[#FB7506]">{String(inv.invoice_no || "").trim()}</td>
                                        <td className="p-2 border-r border-gray-100 text-right">{formatMoney(inv.estimated)}</td>
                                        <td className="p-2 border-r border-gray-100 text-right font-semibold">{formatMoney(inv.amount)}</td>
                                        <td className="p-2 border-r border-gray-100 text-right text-green-600">{formatMoney(inv.credits)}</td>
                                        <td className="p-2 border-r border-gray-100 text-right text-red-500">{formatMoney(inv.debits)}</td>
                                        <td className="p-2 border-r border-gray-100 text-right font-semibold text-orange-600">{formatMoney(inv.total_balance)}</td>
                                        <td className="p-2 border-r border-gray-100">{formatDateEST(normalizeToISODate(inv.control_Date ?? inv.control_date))}</td>
                                        <td className="p-2 border-r border-gray-100">{formatDateEST(normalizeToISODate(inv.ap_date))}</td>
                                        <td className="p-2">{String(inv.phone_1 || "").trim()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200 shrink-0">
                    <p className="text-[10px] text-gray-400 font-bold">
                        {selected ? `Selected: ${String(selected.invoice_no || "").trim()} — ${String(selected.grower || "").trim()}` : "Click a row to select, double-click to locate"}
                    </p>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                            Cancel
                        </button>
                        <button
                            onClick={() => selected && onLocate(selected)}
                            disabled={!selected}
                            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#FB7506] hover:bg-orange-600 disabled:opacity-40 text-white text-sm font-black uppercase tracking-wider transition-all"
                        >
                            <ChevronRight size={14} /> Locate
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Delete Confirmation Dialog ──────────────────────────────────────────────
function DeleteDialog({ title, message, onCancel, onConfirm, saving }: {
    title: string;
    message: string;
    onCancel: () => void;
    onConfirm: () => void;
    saving: boolean;
}) {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 flex flex-col items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                        <Trash2 size={24} className="text-red-600" />
                    </div>
                    <div className="text-center">
                        <h3 className="font-black text-gray-900 text-base mb-1">{title}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
                    </div>
                </div>
                <div className="flex border-t border-gray-100">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors border-r border-gray-100"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={saving}
                        className="flex-1 py-3 text-sm font-black text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                        {saving ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Invoice Add / Edit Modal ─────────────────────────────────────────────────
function InvoiceModal({ mode, invoice, growers, termsList, selectedDate, onClose, onSave, saving }: {
    mode: "Add" | "Edit";
    invoice: any;
    growers: any[];
    termsList: any[];
    selectedDate: string | null;
    onClose: () => void;
    onSave: (data: InvoiceForm) => void;
    saving: boolean;
}) {
    const { register, handleSubmit, formState: { errors } } = useForm<InvoiceForm>({
        resolver: zodResolver(invoiceSchema),
        defaultValues: {
            ldap_date:        invoice ? normalizeToISODate(invoice.ap_date) : (selectedDate || todayEST()),
            lcsupplier_uq:    invoice?.supplier_uq || "",
            lcinvoice_no:     invoice ? String(invoice.invoice_no || "").trim() : "",
            lcterms_uq:       invoice?.terms_uq    || "",
            lnestimated:      parseMoney(invoice?.estimated) || undefined,
            lntaxes:          parseMoney(invoice?.taxes)     || undefined,
            lnamount:         parseMoney(invoice?.amount)    || undefined,
            lnporder_no:      invoice?.porder_no   ?? undefined,
            lcdescription:    String(invoice?.description || invoice?.detail || "").trim(),
            llautomatic:      invoice?.automatic === "Yes" || invoice?.llautomatic || false,
            llindirect:       invoice?.llindirect  || false,
            llautomatic_cost: invoice?.llautomatic_cost || false,
        },
    });

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                {/* Header */}
                <div className="h-10 bg-[#374151] flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-2">
                        <FileText size={14} className="text-[#FB7506]" />
                        <span className="font-black text-[11px] uppercase tracking-widest text-white">
                            {mode === "Add" ? "New Invoice" : "Edit Invoice"}
                        </span>
                    </div>
                    <button onClick={onClose}><XCircle size={16} className="text-gray-400 hover:text-white transition-colors" /></button>
                </div>

                <form onSubmit={handleSubmit(onSave)} className="p-5 space-y-4">
                    {/* Row 1: Date + Invoice # */}
                    <div className="grid grid-cols-2 gap-3">
                        <FormField label="AP Date" error={errors.ldap_date?.message}>
                            <input type="date" {...register("ldap_date")} className="fos-input" />
                        </FormField>
                        <FormField label="Invoice #" error={errors.lcinvoice_no?.message}>
                            <input {...register("lcinvoice_no")} placeholder="Invoice number" className="fos-input" />
                        </FormField>
                    </div>

                    {/* Row 2: Vendor */}
                    <FormField label="Vendor" error={errors.lcsupplier_uq?.message}>
                        <select {...register("lcsupplier_uq")} className="fos-input">
                            <option value="">— Select vendor —</option>
                            {growers.map((g: any) => (
                                <option key={g.unico} value={g.unico}>
                                    {String(g.grower || "").trim()}
                                </option>
                            ))}
                        </select>
                    </FormField>

                    {/* Row 3: Terms + PO No. */}
                    <div className="grid grid-cols-2 gap-3">
                        <FormField label="Terms" error={null}>
                            <select {...register("lcterms_uq")} className="fos-input">
                                <option value="">— Select terms —</option>
                                {termsList.map((t: any) => (
                                    <option key={t.UNICO} value={t.UNICO}>
                                        {String(t.CONDITION || "").trim()}
                                    </option>
                                ))}
                            </select>
                        </FormField>
                        <FormField label="PO No." error={null}>
                            <input type="number" min="0" {...register("lnporder_no", { valueAsNumber: true })} className="fos-input" placeholder="0" />
                        </FormField>
                    </div>

                    {/* Row 4: Estimated + Taxes + Amount */}
                    <div className="grid grid-cols-3 gap-3">
                        <FormField label="Estimated" error={null}>
                            <input type="number" step="0.01" min="0" {...register("lnestimated", { valueAsNumber: true })} className="fos-input text-right" placeholder="0.00" />
                        </FormField>
                        <FormField label="Taxes" error={null}>
                            <input type="number" step="0.01" min="0" {...register("lntaxes", { valueAsNumber: true })} className="fos-input text-right" placeholder="0.00" />
                        </FormField>
                        <FormField label="Amount" error={errors.lnamount?.message}>
                            <input type="number" step="0.01" min="0" {...register("lnamount", { valueAsNumber: true })} className="fos-input text-right font-semibold" placeholder="0.00" />
                        </FormField>
                    </div>

                    {/* Row 5: Description */}
                    <FormField label="Description / Detail" error={null}>
                        <textarea {...register("lcdescription")} rows={2} className="fos-input resize-none" placeholder="Notes or details..." />
                    </FormField>

                    {/* Row 6: Flags */}
                    <div className="flex gap-6 pt-1">
                        {([
                            { name: "llautomatic"    as const, label: "Automatic" },
                            { name: "llindirect"     as const, label: "Indirect"  },
                            { name: "llautomatic_cost" as const, label: "Auto Cost" },
                        ]).map(f => (
                            <label key={f.name} className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" {...register(f.name)} className="w-4 h-4 accent-[#FB7506] cursor-pointer" />
                                <span className="text-xs font-bold text-gray-600">{f.label}</span>
                            </label>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving} className="px-6 py-2 rounded-lg bg-[#FB7506] hover:bg-orange-600 text-white text-sm font-black uppercase tracking-wider transition-all disabled:opacity-50 flex items-center gap-2">
                            {saving ? <><RefreshCcw size={14} className="animate-spin" /> Saving...</> : <><Check size={14} /> {mode === "Add" ? "Create" : "Save Changes"}</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Mobile Calendar Component ───────────────────────────────────────────────
const MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];
const DAYS   = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function APCalendar({ dates, selectedDate, onSelect, calYear, calMonth, onMonthChange }: {
    dates: any[];
    selectedDate: string | null;
    onSelect: (date: string) => void;
    calYear: number;
    calMonth: number;
    onMonthChange: (delta: number) => void;
}) {
    const dateMap = useMemo(() => {
        const map = new Map<string, number>();
        dates.forEach((d: any) => {
            const ds = normalizeToISODate(d.ap_date);
            if (ds) map.set(ds, d.records || 1);
        });
        return map;
    }, [dates]);

    const firstDay    = new Date(calYear, calMonth - 1, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth, 0).getDate();
    const today       = todayEST();

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="h-10 bg-[#374151] flex items-center justify-between px-4 shrink-0">
                <button onClick={() => onMonthChange(-1)} className="text-white hover:text-orange-400 p-1 rounded transition-colors">
                    <ChevronLeft size={16} />
                </button>
                <span className="font-bold text-sm text-white">{MONTHS[calMonth - 1]} {calYear}</span>
                <button onClick={() => onMonthChange(1)} className="text-white hover:text-orange-400 p-1 rounded transition-colors">
                    <ChevronRight size={16} />
                </button>
            </div>
            <div className="p-3">
                <div className="grid grid-cols-7 mb-1">
                    {DAYS.map(d => (
                        <div key={d} className="text-center text-[11px] font-bold text-gray-400 py-1">{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-0.5">
                    {Array.from({ length: firstDay }, (_, i) => <div key={`e${i}`} />)}
                    {Array.from({ length: daysInMonth }, (_, i) => {
                        const day     = i + 1;
                        const dateStr = `${calYear}-${String(calMonth).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                        const count   = dateMap.get(dateStr);
                        const hasData = count !== undefined;
                        const isSelected = selectedDate === dateStr;
                        const isToday    = dateStr === today;
                        return (
                            <div
                                key={day}
                                onClick={() => hasData && onSelect(dateStr)}
                                className={cn(
                                    "flex flex-col items-center justify-start p-1 rounded min-h-[44px] transition-colors",
                                    hasData ? "cursor-pointer" : "cursor-default",
                                    isSelected ? "bg-blue-500" : hasData ? "bg-green-50 hover:bg-green-100" : "",
                                    isToday && !isSelected ? "ring-2 ring-inset ring-blue-400" : ""
                                )}
                            >
                                <span className={cn(
                                    "text-xs leading-none mb-0.5",
                                    isSelected ? "text-white font-bold" :
                                    isToday    ? "text-blue-600 font-bold" :
                                    hasData    ? "text-gray-700 font-semibold" : "text-gray-300"
                                )}>
                                    {day}
                                </span>
                                {hasData && (
                                    <div className={cn(
                                        "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                                        isSelected ? "bg-white text-blue-600" : "bg-green-500 text-white"
                                    )}>
                                        {count}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// ─── Credit/Debit Modal ───────────────────────────────────────────────────────
function CreditDebitModal({ mode, type: initType, row, invoice, reasons, todayEST, onClose, onAdd, onEdit, onDelete, saving }: any) {
    const { register, handleSubmit, formState: { errors } } = useForm<CrdbForm>({
        resolver: zodResolver(crdbSchema),
        defaultValues: {
            type:         row?.type || initType,
            cd_date:      row?.cd_date ? normalizeToISODate(row.cd_date) : todayEST,
            reason_uq:    row?.reason_uq || "",
            cd_ammount:   parseMoney(row?.cd_amount ?? row?.cd_ammount) || undefined,
            retention_no: String(row?.retention_no || "").trim(),
            details:      String(row?.cd_details || "").trim(),
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
function POModal({ invoice, pobs, apTypes, onClose, onAdd, onEdit, onDelete, onApprove, saving }: any) {
    const [mode, setMode] = useState<"view" | "add" | "edit">("view");
    const [selectedPob, setSelectedPob] = useState<any>(null);
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
                    <table className="min-w-full text-xs text-left">
                        <thead className="bg-gray-100 border-b text-gray-700 font-bold sticky top-0 z-10">
                            <tr>
                                {["Acc. Type", "AP Date", "Amount", "PO", "PO Date", "Cost"].map(h => (
                                    <th key={h} className="p-2 whitespace-nowrap border-r border-gray-200 last:border-r-0">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {pobs.length === 0 ? (
                                <tr><td colSpan={6} className="p-6 text-center text-gray-400 italic">No PO records</td></tr>
                            ) : pobs.map((p: any, i: number) => (
                                <tr key={i} onClick={() => setSelectedPob(p)} className={cn(
                                    "border-b text-gray-600 cursor-pointer transition-colors",
                                    selectedPob?.unico === p.unico ? "!bg-[#FB7506]/10" : "odd:bg-white even:bg-gray-50 hover:bg-gray-50"
                                )}>
                                    <td className="p-2 border-r border-gray-100">{p.ap_type}</td>
                                    <td className="p-2 border-r border-gray-100">{formatDateEST(p.ap_date)}</td>
                                    <td className="p-2 border-r border-gray-100 text-right">{formatMoney(p.ammount)}</td>
                                    <td className="p-2 border-r border-gray-100 font-semibold text-[#FB7506]">{p.porder_no}</td>
                                    <td className="p-2 border-r border-gray-100">{formatDateEST(p.po_date)}</td>
                                    <td className="p-2 text-right font-semibold text-orange-600">{formatMoney(p.cost)}</td>
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
                                {!pobResult && <p className="text-[9px] text-red-500 mt-0.5 font-bold">PO not found</p>}
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
