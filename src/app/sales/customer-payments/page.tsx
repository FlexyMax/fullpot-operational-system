"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    RefreshCcw, Search, Check, XCircle, Save, X, Trash2,
    Plus, Pencil, AlertCircle, Users, FileText, CreditCard,
    ChevronRight, Printer, Mail, BarChart2, DollarSign, CheckCircle,
    Bell, Banknote, Calendar, RotateCcw, Building2, LayoutGrid
} from "lucide-react";
import { GridMenu } from "@/components/GridMenu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuditLog } from "@/lib/audit";
import { AuditLogModal } from "@/components/AuditLogModal";
import { usePagePermissions, PERMISSION_MSGS } from "@/lib/permissions";
import AppHeader from "@/components/layout/AppHeader";
import AppFooter from "@/components/layout/AppFooter";
import PanelGrid from "@/components/ui/PanelGrid";
import { PanelGridTable, PanelGridThead, PanelGridTh, PanelGridTbody, PanelGridTr, PanelGridTd, PanelGridTfoot } from "@/components/ui/PanelGridTable";
import { MobileActionBar } from "@/components/layout/MobileActionBar";
import { ConfirmDelete } from "@/components/ConfirmDelete";
import { useCustomerPaymentsStore } from "@/store/sales/useCustomerPaymentsStore";

import { EMPTY_ARR, t, fmt, fmtDate, today, toastConfirm, cpFetch, Modal, Btn } from "./components/Shared";
import CustomerEditModal from "./components/CustomerEditModal";
import InvoiceSearchModal from "./components/InvoiceSearchModal";
import NewPaymentModal from "./components/NewPaymentModal";
import ApplyPaymentModal from "./components/ApplyPaymentModal";
import PendingInvoicesReportModal from "./components/PendingInvoicesReportModal";
import ApproveCreditModal from "./components/ApproveCreditModal";
import CashBackModal from "./components/CashBackModal";
import CrDbModal from "./components/CrDbModal";
import CrDbReportModal from "./components/CrDbReportModal";
import SalesmanSelectorModal from "./components/SalesmanSelectorModal";
import CorpPaymentModal from "./components/CorpPaymentModal";
import CorpInvoiceModal from "./components/CorpInvoiceModal";

// ─── CutDateModal ─────────────────────────────────────────────────────────────
function CutDateModal({ customerUq, onClose }: any) {
    const [cutDate, setCutDate] = useState(today());
    const [loading, setLoading] = useState(false);
    const run = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/customer-payments/reports/statement-cut", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({customer_uq:customerUq, cut_date:cutDate}) });
            const d = await res.json();
            toast(d.success ? "Statement cut report generated (print coming soon)." : d.error);
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

// ─── StatementPreviewModal ────────────────────────────────────────────────────
function StatementPreviewModal({ html, onClose, customer }: any) {
    const [sending, setSending] = useState(false);
    const sendEmail = async () => {
        if (!customer?.email && !customer?.ap_email) { toast.error("Customer has no email address."); return; }
        setSending(true);
        try {
            const res = await fetch("/api/customer-payments/reports/send-statement-email", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ customer_uq: customer.unico, email: customer.ap_email || customer.email, html }),
            });
            const d = await res.json();
            d.success ? toast.success("Statement sent by email.") : toast.error(d.error || "Failed to send email.");
        } catch (e: any) { toast.error(e.message); }
        finally { setSending(false); }
    };
    return (
        <Modal title="Statement Preview" icon={Printer} onClose={onClose} size="xl"
            footer={<div className="flex items-center gap-2">
                <button onClick={onClose} className="px-4 py-2 rounded border text-sm font-bold text-gray-600 hover:bg-gray-100">Close</button>
                <button onClick={sendEmail} disabled={sending} className="flex items-center gap-2 px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-black disabled:opacity-50">
                    {sending?<RefreshCcw size={13} className="animate-spin"/>:<Mail size={13}/>}Email
                </button>
                <button onClick={()=>toast.info("Fax service — coming soon")} className="flex items-center gap-2 px-4 py-2 rounded bg-gray-500 hover:bg-gray-600 text-white text-sm font-black">
                    <Printer size={13}/>Fax
                </button>
            </div>}>
            <div className="w-full overflow-auto" style={{height:"65vh"}}>
                <iframe srcDoc={html} className="border rounded" style={{minWidth:"700px",width:"100%",height:"65vh"}} title="Statement Preview"/>
            </div>
        </Modal>
    );
}

// Extracted CorpPaymentModal
// Extracted CorpInvoiceModal
// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function CustomerPaymentsPage() {
    const { data: session, status } = useSession();
    const router  = useRouter();
    const qc      = useQueryClient();
    const { logAction } = useAuditLog("customer-payments", "flower_accounts_income");
    const perms          = usePagePermissions("customer-payments");

    // ── Global state ───────────────────────────────────────────────────────────
    const store = useCustomerPaymentsStore();
    const activeTab = store.activeTab;
    const setActiveTab = store.setActiveTab;
    const [selCustomer,   setSelCustomer]   = useState<any>(null);
    const custSearch = store.customerSearch;
    const setCustSearch = store.setCustomerSearch;
    const custBalance = store.customerFilterMode;
    const setCustBalance = store.setCustomerFilterMode;
    const [balanceFilter, setBalanceFilter] = useState(true);    // true=Bal>0
    const [selInvoice,    setSelInvoice]    = useState<any>(null);
    const [selApply,      setSelApply]      = useState<any>(null);
    const [selIncome,     setSelIncome]     = useState<any>(null);
    const [payingAll,     setPayingAll]     = useState(false);
    const activeGrid = store.activeGrid;

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
    const [stmtDestination,  setStmtDestination]   = useState(2);
    const [salesmanModal,    setSalesmanModal]      = useState(false);
    const [cutDateModal,     setCutDateModal]       = useState(false);
    const [printAllProgress, setPrintAllProgress]  = useState<string|null>(null);
    const [stmtPreviewModal, setStmtPreviewModal]  = useState(false);
    const [stmtPreviewHtml,  setStmtPreviewHtml]   = useState("");
    const [stmtPreviewLoading, setStmtPreviewLoading] = useState(false);
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
    const { data: custPages, isFetching: loadingCust, fetchNextPage: fetchMoreCust, hasNextPage: hasMoreCust, isFetchingNextPage: fetchingMoreCust, refetch: refetchCust } = useInfiniteQuery({
        queryKey: ["cp-customers", custSearch, custBalance],
        queryFn:  ({ pageParam }) => cpFetch(`/api/customer-payments/customers?search=${encodeURIComponent(custSearch)}&balance=${custBalance}&page=${pageParam}&pageSize=50`),
        initialPageParam: 1,
        getNextPageParam: (last: any) => (last.page ?? 1) * (last.pageSize ?? 50) < (last.total ?? 0) ? (last.page ?? 1) + 1 : undefined,
        staleTime: 30000,
    });
    const customers     = custPages?.pages.flatMap((p: any) => p.records ?? []) ?? [];
    const custTotal     = custPages?.pages[0]?.total ?? 0;
    // Sentinel for infinite scroll
    const custScrollRef = useRef<HTMLDivElement>(null);
    const custSentRef   = useRef<HTMLDivElement>(null);
    const hasMoreCustRef = useRef(hasMoreCust);
    const fetchingMoreCustRef = useRef(fetchingMoreCust);
    hasMoreCustRef.current = hasMoreCust;
    fetchingMoreCustRef.current = fetchingMoreCust;
    useEffect(() => {
        const el = custSentRef.current;
        const root = custScrollRef.current;
        if (!el || !root) return;
        const obs = new IntersectionObserver(([e]) => {
            if (e.isIntersecting && hasMoreCustRef.current && !fetchingMoreCustRef.current) fetchMoreCust();
        }, { threshold: 0.1, rootMargin: "200px", root });
        obs.observe(el);
        return () => obs.disconnect();
    }, [fetchMoreCust]);
    const handleCustScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const root = e.currentTarget;
        if (!root) return;
        const { scrollTop, scrollHeight, clientHeight } = root;
        if (scrollHeight - scrollTop - clientHeight < 200 && hasMoreCustRef.current && !fetchingMoreCustRef.current) {
            fetchMoreCust();
        }
    }, [fetchMoreCust]);
    const { data: invoices = EMPTY_ARR, isFetching: loadingInv, refetch: refetchInv } = useQuery({
        queryKey: ["cp-invoices", selCustomer?.unico, balanceFilter],
        queryFn:  () => cpFetch(`/api/customer-payments/invoices/${selCustomer.unico}?balance=${balanceFilter}`),
        enabled:  !!selCustomer?.unico,
        staleTime: 0,
    });
    const { data: applied = EMPTY_ARR, isFetching: loadingApplied, refetch: refetchApplied } = useQuery({
        queryKey: ["cp-applied", selInvoice?.unico],
        queryFn:  () => cpFetch(`/api/customer-payments/applied/${selInvoice.unico}`),
        enabled:  !!selInvoice?.unico,
        staleTime: 0,
    });
    const { data: incomes = EMPTY_ARR, isFetching: loadingIncomes, refetch: refetchIncomes } = useQuery({
        queryKey: ["cp-incomes", selCustomer?.unico],
        queryFn:  () => cpFetch(`/api/customer-payments/incomes/${selCustomer.unico}`),
        enabled:  !!selCustomer?.unico,
        staleTime: 0,
    });

    // ── Tab 3 & 4 queries ─────────────────────────────────────────────────────
    const { data: paymentsHistory = EMPTY_ARR, isFetching: loadingPay, refetch: refetchPay } = useQuery({
        queryKey: ["cp-pay-hist", selCustomer?.unico],
        queryFn:  () => cpFetch(`/api/customer-payments/payment-history/${selCustomer.unico}`),
        enabled:  !!selCustomer?.unico && activeTab === "payments",
        staleTime: 0,
    });
    const { data: payInvoices = EMPTY_ARR, isFetching: loadingPayInv } = useQuery({
        queryKey: ["cp-pay-inv", selPayment?.unico],
        queryFn:  () => cpFetch(`/api/customer-payments/payment-invoices/${selPayment.unico}`),
        enabled:  !!selPayment?.unico,
        staleTime: 0,
    });
    const { data: crdbDates = EMPTY_ARR, isFetching: loadingCrdbDates, refetch: refetchCrdbDates } = useQuery({
        queryKey: ["cp-crdb-dates", selCustomer?.unico],
        queryFn:  () => cpFetch(`/api/customer-payments/crdb-dates/${selCustomer.unico}`),
        enabled:  !!selCustomer?.unico && activeTab === "crdb",
        staleTime: 0,
    });
    const { data: crdbHistory = EMPTY_ARR, isFetching: loadingCrdb, refetch: refetchCrdb } = useQuery({
        queryKey: ["cp-crdb-hist", selCustomer?.unico, selCrDbDate],
        queryFn:  () => cpFetch(`/api/customer-payments/crdb-history/${selCustomer.unico}?date=${selCrDbDate}`),
        enabled:  !!selCustomer?.unico && !!selCrDbDate && activeTab === "crdb",
        staleTime: 0,
    });

    // ── Tab 5 queries ─────────────────────────────────────────────────────────
    const { data: stmtData = EMPTY_ARR, isFetching: loadingStmt, refetch: refetchStmt } = useQuery({
        queryKey: ["cp-stmt", selCustomer?.unico, stmtFrom, stmtTo],
        queryFn:  () => cpFetch(`/api/customer-payments/statement/${selCustomer.unico}?from=${stmtFrom}&to=${stmtTo}`),
        enabled:  !!selCustomer?.unico && activeTab === "statement",
        staleTime: 0,
    });
    const { data: stmtBalData = EMPTY_ARR, isFetching: loadingStmtBal, refetch: refetchStmtBal } = useQuery({
        queryKey: ["cp-stmt-bal", selCustomer?.unico, stmtFrom, stmtTo],
        queryFn:  () => cpFetch(`/api/customer-payments/statement-balance/${selCustomer.unico}?from=${stmtFrom}&to=${stmtTo}`),
        enabled:  !!selCustomer?.unico && activeTab === "statement",
        staleTime: 0,
    });
    // ── Tab 6 queries ─────────────────────────────────────────────────────────
    const { data: corpIncomes = EMPTY_ARR, isFetching: loadingCorpInc, refetch: refetchCorpInc } = useQuery({
        queryKey: ["cp-corp-inc", corpDate],
        queryFn:  () => cpFetch(`/api/customer-payments/corporate-incomes?date=${corpDate}`),
        enabled:  activeTab === "corporate",
        staleTime: 0,
    });
    const { data: corpPayments = EMPTY_ARR, isFetching: loadingCorpPay, refetch: refetchCorpPay } = useQuery({
        queryKey: ["cp-corp-pay", selCorpIncome?.unico],
        queryFn:  () => cpFetch(`/api/customer-payments/corporate-payments/${selCorpIncome.unico}`),
        enabled:  !!selCorpIncome?.unico,
        staleTime: 0,
    });
    const { data: corpInvoices = EMPTY_ARR, isFetching: loadingCorpInv, refetch: refetchCorpInv } = useQuery({
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
        store.setSelCustomerUq(c?.unico || null);
        setSelCustomer(c);
        setSelInvoice(null);
        setSelApply(null);
        setSelIncome(null);
    };

    const refreshAll = () => { qc.resetQueries({ queryKey: ["cp-customers"] }); refetchInv(); refetchIncomes(); refetchApplied(); };

    const handlePayAll = () => {
        if (!selIncome)   { toast.error("Select an income first."); return; }
        if (!selCustomer) { toast.error("Select a customer first."); return; }
        toastConfirm("Apply this income to all invoices with balance?", async () => {
            setPayingAll(true);
            try {
                const res = await fetch("/api/customer-payments/pay-all", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ income_uq: selIncome.unico, customer_uq: selCustomer.unico }) });
                const d = await res.json();
                if (!d.success) throw new Error(d.error);
                toast.success(d.message);
                refetchInv(); refetchApplied(); refetchIncomes(); qc.resetQueries({ queryKey: ["cp-customers"] });
            } catch(e: any) { toast.error((e as any).message); }
            finally { setPayingAll(false); }
        }, "Apply All");
    };

    const handleInvoiceFound = (inv: any) => {
        const custMatch = (customers as any[]).find((c: any) => c.unico === inv.customer_uq);
        if (custMatch) selectCustomer(custMatch);
        if (parseFloat(inv.total_balance ?? 0) <= 0) setBalanceFilter(false);
        setActiveTab("invoices");
    };

    const handleHoldNoSales = () => toastConfirm("Put on hold customers with no sales?", async () => {
        const r = await fetch("/api/customer-payments/hold-no-sales", { method: "POST" });
        const d = await r.json();
        d.error ? toast.error(d.error) : toast.success("Done.");
    }, "Hold");

    const handlePrintAll = () => toastConfirm("Print statements for all customers?", async () => {
        setPrintAllProgress("Loading...");
        try { const d = await cpFetch("/api/customer-payments/reports/all-statements"); toast.success(`${d.records?.length ?? 0} statements generated.`); setPrintAllProgress(null); }
        catch (e: any) { toast.error((e as any).message); setPrintAllProgress(null); }
    }, "Print All");

    // parseMoney strips "$" and "," from the SP's pre-formatted money strings
    const parseMoney = (v: any) => parseFloat(String(v ?? "0").replace(/[$,]/g, "")) || 0;
    const totalRow = (customers as any[]).reduce((acc: any, c: any) => ({
        total_invoice:  acc.total_invoice  + parseMoney(c.total_invoice),
        total_credits:  acc.total_credits  + parseMoney(c.total_credits),
        total_debits:   acc.total_debits   + parseMoney(c.total_debits),
        total_in_cr_db: acc.total_in_cr_db + parseMoney(c.total_in_cr_db),
        total_incomes:  acc.total_incomes  + parseMoney(c.total_incomes),
        total_payments: acc.total_payments + parseMoney(c.total_payments),
        total_inv_bal:  acc.total_inv_bal  + parseMoney(c.total_inv_bal),
        total_unapply:  acc.total_unapply  + parseMoney(c.total_unapply),
        balance:        acc.balance        + parseFloat(c.total_books_bal || 0),
    }), { total_invoice:0, total_credits:0, total_debits:0, total_in_cr_db:0, total_incomes:0, total_payments:0, total_inv_bal:0, total_unapply:0, balance:0 });
    const invTotals = { amount: (invoices as any[]).reduce((s: number, i: any) => s + parseFloat(i.ammount||0), 0), payments: (invoices as any[]).reduce((s: number, i: any) => s + parseFloat(i.in_ammount||0), 0), credits: (invoices as any[]).reduce((s: number, i: any) => s + parseFloat(i.cre_ammount||0), 0), debits: (invoices as any[]).reduce((s: number, i: any) => s + parseFloat(i.deb_ammount||0), 0), invBal: (invoices as any[]).reduce((s: number, i: any) => s + parseFloat(i.balance||0), 0), booksBal: selCustomer?.total_books_bal ?? 0 };

    // Selected customer info bar — reused in Invoices, Payments, CR/DB, and Statement tabs
    const selCustBar = selCustomer ? (
        <div className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-1.5 shrink-0 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-[11px]">
            <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-[#FB7506] text-[12px]">{t(selCustomer.cust_code)}</span>
                <span className="font-bold text-gray-700">{t(selCustomer.customer)}</span>
                {t(selCustomer.hold)==="Yes" && <span className="text-red-500 font-black text-[9px] border border-red-300 rounded px-1 ml-1">HOLD</span>}
            </div>
            <div className="flex items-center gap-x-4 gap-y-0.5 flex-wrap ml-auto text-[11px]">
                <span className="text-gray-400">Cr.Limit: <span className="font-bold text-gray-600">{t(selCustomer.credit_limit)}</span></span>
                <span className="text-gray-400">G.Invoice: <span className="font-bold text-gray-600">{t(selCustomer.total_invoice)}</span></span>
                <span className="text-gray-400">T.Credits: <span className="font-bold text-green-600">{t(selCustomer.total_credits)}</span></span>
                <span className="text-gray-400">T.Debits: <span className="font-bold text-red-500">{t(selCustomer.total_debits)}</span></span>
                <span className="text-gray-400">N.Invoice: <span className="font-bold text-gray-600">{t(selCustomer.total_in_cr_db)}</span></span>
                <span className="text-gray-400">Payments: <span className="font-bold text-blue-700">{t(selCustomer.total_incomes)}</span></span>
                <span className="text-gray-400">Inv-Bal: <span className="font-bold text-orange-600">{t(selCustomer.total_inv_bal)}</span></span>
                <span className="text-gray-400">Unapply: <span className="font-bold text-gray-600">{t(selCustomer.total_unapply)}</span></span>
                <span className="text-gray-400">Book-Bal: <span className={cn("font-bold", parseFloat(String(selCustomer.total_books_bal||0))>0?"text-orange-600":"text-gray-600")}>{"$"+fmt(selCustomer.total_books_bal)}</span></span>
            </div>
        </div>
    ) : null;

    const TAB_COLORS: Record<string, string> = { customer:"text-gray-500 hover:text-gray-700 hover:bg-gray-50", invoices:"text-gray-500 hover:text-gray-700 hover:bg-gray-50", payments:"text-gray-500 hover:text-gray-700 hover:bg-gray-50", crdb:"text-gray-500 hover:text-gray-700 hover:bg-gray-50", statement:"text-gray-500 hover:text-gray-700 hover:bg-gray-50", corporate:"text-gray-500 hover:text-gray-700 hover:bg-gray-50" };
    const TAB_ACTIVE = "bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm";

    if (status === "loading") return null;

    return (
        <div className="flex flex-col h-[100dvh] bg-[#f4f6f8] overflow-hidden font-sans">

            {/* Header */}
            <AppHeader
                title="Customer Payments"
                icon={CreditCard}
                extraRight={
                    <button
                        onClick={() => creditCount > 0 && setCreditModal(true)}
                        disabled={creditCount === 0}
                        className="relative flex items-center gap-1.5 px-2 sm:px-3 h-7 bg-green-700 hover:bg-green-600 disabled:opacity-40 text-white text-[14px] font-semibold uppercase rounded transition-colors shrink-0"
                    >
                        <Bell size={12} />
                        <span className="hidden sm:inline">Approve Credits</span>
                        {creditCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                                {creditCount}
                            </span>
                        )}
                    </button>
                }
            />

            {/* Tab bar — scrollable on mobile */}
            <div className="h-12 bg-white flex items-end px-4 gap-2 shrink-0 overflow-x-auto scrollbar-none border-b border-gray-200">
                {(["customer","invoices","payments","crdb","statement","corporate"] as const).map(tab => (
                    <button key={tab} onClick={()=>setActiveTab(tab)}
                        className={cn("px-3 sm:px-4 h-8 text-[10px] font-black uppercase tracking-wider rounded-t transition-all whitespace-nowrap shrink-0",
                            activeTab===tab ? TAB_ACTIVE : TAB_COLORS[tab])}>
                        {tab==="customer"?"Customer":tab==="invoices"?"Invoices":tab==="payments"?"Payments":tab==="crdb"?"Cr / Db":tab==="statement"?"Statement":"Corporate"}
                    </button>
                ))}
            </div>

            {/* ── TAB 1: CUSTOMER ───────────────────────────────────────────── */}
            {activeTab === "customer" && (
                <div className="flex flex-col flex-1 overflow-hidden p-1.5 gap-1.5">
                    {/* Mobile-only global actions bar (above filter row) */}
                    <div className="md:hidden bg-white border-b border-gray-100 px-3 py-1.5 flex items-center gap-1.5 shrink-0 overflow-x-auto scrollbar-none">
                        {creditCount > 0 && (
                            <button onClick={()=>setCreditModal(true)}
                                className="relative flex items-center gap-1 px-2.5 py-1.5 text-[14px] font-semibold uppercase rounded border border-green-300 bg-green-50 text-green-700 whitespace-nowrap transition-colors shrink-0">
                                <Bell size={10}/>Approve Credits
                                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">{creditCount}</span>
                            </button>
                        )}
                        <button onClick={()=>setInvSearchModal(true)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-[14px] font-semibold uppercase rounded border border-gray-200 text-gray-600 hover:bg-gray-50 whitespace-nowrap transition-colors shrink-0">
                            <Search size={10}/>Inv Search
                        </button>
                        <button onClick={handleHoldNoSales}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-[14px] font-semibold uppercase rounded border border-gray-200 text-orange-500 hover:bg-orange-50 whitespace-nowrap transition-colors shrink-0">
                            <AlertCircle size={10}/>Hold No Sales
                        </button>
                        <div className="flex items-center shrink-0">
                            <button onClick={handlePrintAll} disabled={!perms.canReport}
                                className="flex items-center gap-1 px-2.5 py-1.5 text-[14px] font-semibold uppercase rounded-l border border-gray-200 text-gray-600 hover:bg-gray-50 whitespace-nowrap transition-colors disabled:opacity-40">
                                <Printer size={10}/>Print All
                            </button>
                            <select value={stmtDestination} onChange={e=>setStmtDestination(parseInt(e.target.value))}
                                className="h-[30px] text-[14px] font-semibold border border-l-0 border-gray-200 rounded-r px-1 outline-none bg-white text-gray-600">
                                <option value={1}>PRN</option><option value={2}>EMAIL</option><option value={3}>FAX</option>
                            </select>
                        </div>
                        <button onClick={()=>setSalesmanModal(true)} disabled={!perms.canReport}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-[14px] font-semibold uppercase rounded border border-gray-200 text-gray-600 hover:bg-gray-50 whitespace-nowrap transition-colors shrink-0 disabled:opacity-40">
                            <Users size={10}/>By Salesman
                        </button>
                    </div>

                    {/* Search / filter toolbar */}
                    <div className="bg-[#F5F3F3] border border-[#DBD9D9] rounded-lg px-3 py-2 flex items-center gap-2 shrink-0 shadow-sm flex-wrap">
                        <div className="relative flex-1 max-w-sm">
                            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="text" value={custSearch} onChange={e => setCustSearch(e.target.value)}
                                placeholder="Search customers..." className="pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded outline-none focus:ring-1 focus:ring-[#FB7506] w-full bg-white" />
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            {([{v:"ALL",l:"All"},{v:"BAL>0",l:"Bal > 0"},{v:"BAL=0",l:"Bal = 0"}] as const).map(opt=>(
                                <button key={opt.v} onClick={()=>setCustBalance(opt.v as any)}
                                    className={cn("px-3 h-7 text-[14px] font-semibold uppercase rounded border transition-colors",
                                        custBalance===opt.v ? "bg-[#FB7506] text-white border-[#FB7506]" : "border-gray-300 text-gray-500 hover:bg-gray-100 bg-white")}>
                                    {opt.l}
                                </button>
                            ))}
                        </div>
                        {/* Desktop-only global actions */}
                        <div className="hidden md:flex items-center gap-2 shrink-0 ml-auto">
                            <button onClick={()=>setInvSearchModal(true)}
                                className="flex items-center gap-1.5 px-3 h-7 text-[14px] font-semibold uppercase rounded border border-gray-200 text-gray-600 hover:bg-gray-50 whitespace-nowrap transition-colors bg-white">
                                <Search size={10}/>Inv Search
                            </button>
                            <button onClick={handleHoldNoSales}
                                className="flex items-center gap-1.5 px-3 h-7 text-[14px] font-semibold uppercase rounded border border-gray-200 text-orange-500 hover:bg-orange-50 whitespace-nowrap transition-colors bg-white">
                                <AlertCircle size={10}/>Hold No Sales
                            </button>
                            <div className="flex items-center h-7">
                                <button onClick={handlePrintAll} disabled={!perms.canReport}
                                    className="flex items-center gap-1.5 px-3 h-7 text-[14px] font-semibold uppercase rounded-l border border-gray-200 text-gray-600 hover:bg-gray-50 whitespace-nowrap transition-colors disabled:opacity-40 bg-white">
                                    <Printer size={10}/>Print All
                                </button>
                                <select value={stmtDestination} onChange={e=>setStmtDestination(parseInt(e.target.value))}
                                    className="h-7 text-[14px] font-semibold border border-l-0 border-gray-200 rounded-r px-2 outline-none bg-white text-gray-600">
                                    <option value={1}>PRN</option><option value={2}>EMAIL</option><option value={3}>FAX</option>
                                </select>
                            </div>
                            <button onClick={()=>setSalesmanModal(true)} disabled={!perms.canReport}
                                className="flex items-center gap-1.5 px-3 h-7 text-[14px] font-semibold uppercase rounded border border-gray-200 text-gray-600 hover:bg-gray-50 whitespace-nowrap transition-colors disabled:opacity-40 bg-white">
                                <Users size={10}/>By Salesman
                            </button>
                        </div>
                        {(loadingCust||fetchingMoreCust) && <RefreshCcw size={13} className="text-[#FB7506] animate-spin shrink-0"/>}
                    </div>

                    {/* Customer Grid — PanelGrid */}
                    <PanelGrid
                        title="Customers"
                        icon={Users}
                        recordCount={`${customers.length} / ${custTotal > 0 ? custTotal : customers.length}`}
                        onRefresh={refreshAll}
                        refreshing={loadingCust || fetchingMoreCust}
                        headerRight={<AuditLogModal recordId={selCustomer?.unico} disabled={!selCustomer} bareButton />}
                        className="mx-2 mt-2 mb-3 flex-1 flex flex-col min-h-0"
                        onScroll={handleCustScroll}
                    >
                            <PanelGridTable>
                                <PanelGridThead>
                                        <PanelGridTh>Customer</PanelGridTh>
                                        <PanelGridTh align="right">% Margin</PanelGridTh>
                                        <PanelGridTh align="right">Cr. Limit</PanelGridTh>
                                        <PanelGridTh align="right">G.Invoice</PanelGridTh>
                                        <PanelGridTh align="right">T.Credits</PanelGridTh>
                                        <PanelGridTh align="right">T.Debits</PanelGridTh>
                                        <PanelGridTh align="right">N.Invoice</PanelGridTh>
                                        <PanelGridTh align="right">Payments</PanelGridTh>
                                        <PanelGridTh align="right">Apply</PanelGridTh>
                                        <PanelGridTh align="right">Inv-Bal</PanelGridTh>
                                        <PanelGridTh align="right">Unapply</PanelGridTh>
                                        <PanelGridTh align="right">Book-Bal</PanelGridTh>
                                        <PanelGridTh>Stmt By</PanelGridTh>
                                        <PanelGridTh align="center">Hold</PanelGridTh>
                                </PanelGridThead>
                                <PanelGridTbody>
                                    {(customers as any[]).map((c: any) => {
                                        const isSel = selCustomer?.unico === c.unico;
                                        return (
                                            <PanelGridTr key={c.unico} onDoubleClick={()=>setActiveTab("invoices")} onClick={()=>{ if(isSel) selectCustomer(null); else selectCustomer(c); }} selected={isSel}>
                                                <PanelGridTd className="font-medium">
                                                    <div className="font-mono font-semibold text-[#FB7506]">{t(c.cust_code)}</div>
                                                    <div className="text-gray-500 text-[10px]">{t(c.customer)}</div>
                                                </PanelGridTd>
                                                {/* SP returns pre-formatted "$x,xxx.xx" strings for money — use t() directly */}
                                                <PanelGridTd align="right">{t(c.price_margin)}%</PanelGridTd>
                                                <PanelGridTd align="right">{t(c.credit_limit)}</PanelGridTd>
                                                <PanelGridTd align="right">{t(c.total_invoice)}</PanelGridTd>
                                                <PanelGridTd align="right" className="text-green-600">{t(c.total_credits)}</PanelGridTd>
                                                <PanelGridTd align="right" className="text-red-500">{t(c.total_debits)}</PanelGridTd>
                                                <PanelGridTd align="right" className="font-bold">{t(c.total_in_cr_db)}</PanelGridTd>
                                                <PanelGridTd align="right" className="text-blue-700">{t(c.total_incomes)}</PanelGridTd>
                                                <PanelGridTd align="right">{t(c.total_payments)}</PanelGridTd>
                                                <PanelGridTd align="right" className="font-bold text-orange-600">{t(c.total_inv_bal)}</PanelGridTd>
                                                <PanelGridTd align="right">{t(c.total_unapply)}</PanelGridTd>
                                                <PanelGridTd align="right" className="font-bold">{"$"+fmt(c.total_books_bal)}</PanelGridTd>
                                                <PanelGridTd className="text-gray-500">{t(c.statement_by)}</PanelGridTd>
                                                <PanelGridTd align="center">{t(c.hold)==="Yes"?<span className="text-red-500 font-black text-[9px]">HOLD</span>:"—"}</PanelGridTd>
                                            </PanelGridTr>
                                        );
                                    })}
                                    {/* Infinite scroll sentinel */}
                                    <tr><td colSpan={14} className="h-4 py-1">
                                        <div ref={custSentRef} className="h-4">
                                            {fetchingMoreCust ? (
                                                <div className="text-center py-1.5 text-[9px] text-gray-400"><RefreshCcw size={9} className="inline animate-spin mr-1"/>Loading more...</div>
                                            ) : (
                                                <span className="invisible">&nbsp;</span>
                                            )}
                                        </div>
                                    </td></tr>
                                    {!loadingCust && customers.length === 0 && <tr><td colSpan={14} className="p-8 text-center text-gray-400 italic text-xs">No customers found</td></tr>}
                                </PanelGridTbody>
                                {/* Totals row */}
                                {(customers as any[]).length > 0 && (
                                    <PanelGridTfoot>
                                        <tr className="text-[11px]">
                                            <td className="px-2 py-1 font-black">TOTALS ({custTotal} customers)</td>
                                            <td className="px-2 py-1"/>
                                            <td className="px-2 py-1"/>
                                            <td className="px-2 py-1 text-right font-black">{"$"+fmt(totalRow.total_invoice)}</td>
                                            <td className="px-2 py-1 text-right font-black text-green-600">{"$"+fmt(totalRow.total_credits)}</td>
                                            <td className="px-2 py-1 text-right font-black text-red-500">{"$"+fmt(totalRow.total_debits)}</td>
                                            <td className="px-2 py-1 text-right font-black">{"$"+fmt(totalRow.total_in_cr_db)}</td>
                                            <td className="px-2 py-1 text-right font-black text-blue-700">{"$"+fmt(totalRow.total_incomes)}</td>
                                            <td className="px-2 py-1 text-right font-black">{"$"+fmt(totalRow.total_payments)}</td>
                                            <td className="px-2 py-1 text-right font-black text-orange-600">{"$"+fmt(totalRow.total_inv_bal)}</td>
                                            <td className="px-2 py-1 text-right font-black">{"$"+fmt(totalRow.total_unapply)}</td>
                                            <td className="px-2 py-1 text-right font-black">{"$"+fmt(totalRow.balance)}</td>
                                            <td className="px-2 py-1"/>
                                            <td className="px-2 py-1"/>
                                        </tr>
                                    </PanelGridTfoot>
                                )}
                            </PanelGridTable>
                            {hasMoreCust && !fetchingMoreCust && (
                                <div className="text-center py-2">
                                    <button onClick={() => fetchMoreCust()} className="px-4 h-7 bg-[#FB7506] text-white text-[14px] font-semibold uppercase rounded hover:bg-orange-600 transition-colors">
                                        Load More
                                    </button>
                                </div>
                            )}
                        </PanelGrid>
                </div>
            )}

            {/* ── TAB 2: INVOICES ───────────────────────────────────────────── */}
            {activeTab === "invoices" && (
                <div className="flex flex-col flex-1 overflow-hidden p-1.5 gap-1.5">
                    {/* Balance filter bar */}
                    <div className="bg-gray-100 border border-gray-200 rounded-lg px-2 py-1 flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-black text-gray-500 uppercase">Filter:</span>
                        <label className="flex items-center gap-1 cursor-pointer text-xs font-bold">
                            <input type="radio" checked={balanceFilter} onChange={()=>setBalanceFilter(true)} className="accent-[#FB7506]"/>
                            <span className={cn(balanceFilter?"text-[#FB7506]":"text-gray-500")}>Bal &gt; 0</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer text-xs font-bold">
                            <input type="radio" checked={!balanceFilter} onChange={()=>setBalanceFilter(false)} className="accent-[#FB7506]"/>
                            <span className={cn(!balanceFilter?"text-[#FB7506]":"text-gray-500")}>Bal = 0</span>
                        </label>
                    </div>
                    {selCustBar}

                    {/* Invoices grid */}
                    <PanelGrid
                        title={`Invoices ${selCustomer ? `— ${t(selCustomer.customer)}` : ""}`}
                        icon={FileText}
                        recordCount={(invoices as any[]).length}
                        onRefresh={refreshAll}
                        refreshing={loadingInv}
                        headerRight={<AuditLogModal recordId={selInvoice?.unico} disabled={!selInvoice} bareButton />}
                        menuItems={[
                            { label: "Refresh", icon: RefreshCcw, color: "gray", onClick: refreshAll },
                            { label: "Inv. Search", icon: Search, color: "gray", onClick: ()=>setInvSearchModal(true) },
                            { label: "Email", icon: Mail, color: "gray", onClick: ()=>toast.info("Email invoice — Coming soon"), disabled: !selInvoice||!perms.canReport },
                            { label: "Invoice", icon: Printer, color: "gray", onClick: ()=>toast.info("Print invoice — Coming soon"), disabled: !selInvoice||!perms.canReport },
                            { label: "Reports", icon: BarChart2, color: "gray", onClick: ()=>setPendingRptModal(true), disabled: !selCustomer||!perms.canReport },
                            { label: "New Payment", icon: Plus, color: "green", onClick: ()=>{ if(!perms.canCreate){toast.error(PERMISSION_MSGS.create);return;} setNewPayModal({mode:"add"}); }, disabled: !selCustomer||!perms.canCreate },
                            { label: "Insert Cr/Db", icon: CreditCard, color: "blue", onClick: ()=>{ if(!perms.canCreate){toast.error(PERMISSION_MSGS.create);return;} if(!selInvoice){toast.error("Select an invoice first.");return;} setCrdbModal({mode:"add"}); }, disabled: !selCustomer||!selInvoice||!perms.canCreate },
                        ]}
                        className="flex-1 flex flex-col min-h-0"
                    >
                            <PanelGridTable>
                                <PanelGridThead>
                                        <PanelGridTh>Invoice</PanelGridTh>
                                        <PanelGridTh>Inv.Date</PanelGridTh>
                                        <PanelGridTh align="right">Days</PanelGridTh>
                                        <PanelGridTh align="right">%</PanelGridTh>
                                        <PanelGridTh>Due Date</PanelGridTh>
                                        <PanelGridTh align="right">Amount</PanelGridTh>
                                        <PanelGridTh align="right">Incomes</PanelGridTh>
                                        <PanelGridTh align="right">Credits</PanelGridTh>
                                        <PanelGridTh align="right">Debits</PanelGridTh>
                                        <PanelGridTh align="right">Balance</PanelGridTh>
                                        <PanelGridTh align="center">Void</PanelGridTh>
                                        <PanelGridTh align="right">Acumulative</PanelGridTh>
                                </PanelGridThead>
                                <PanelGridTbody>
                                    {(invoices as any[]).map((inv: any) => {
                                        const isSel     = selInvoice?.unico === inv.unico;
                                        const isVoid    = inv.void;
                                        const isOverdue = !isVoid && parseFloat(inv.balance??0) > 0 && new Date(inv.date_due) < new Date();
                                        return (
                                            <PanelGridTr key={inv.unico} onClick={()=>{ const isSel=selInvoice?.unico===inv.unico; setSelInvoice(isSel?null:inv); store.setSelInvoiceUq(isSel?null:inv?.unico||null); }}
                                                className={cn(isOverdue && !isSel && "bg-red-50 hover:bg-red-100", isVoid && "opacity-45")} selected={isSel}>
                                                <PanelGridTd className="font-mono font-semibold text-[#FB7506]">{inv.invoice_no}</PanelGridTd>
                                                <PanelGridTd>{fmtDate(inv.arec_date)}</PanelGridTd>
                                                <PanelGridTd align="right">{inv.days}</PanelGridTd>
                                                <PanelGridTd align="right">{inv.percen}</PanelGridTd>
                                                <PanelGridTd>{fmtDate(inv.date_due)}</PanelGridTd>
                                                <PanelGridTd align="right">{fmt(inv.ammount)}</PanelGridTd>
                                                <PanelGridTd align="right" className="text-blue-700">{fmt(inv.in_ammount)}</PanelGridTd>
                                                <PanelGridTd align="right" className="text-green-600">{fmt(inv.cre_ammount)}</PanelGridTd>
                                                <PanelGridTd align="right" className="text-red-500">{fmt(inv.deb_ammount)}</PanelGridTd>
                                                <PanelGridTd align="right" className={cn("font-bold", isOverdue?"text-red-600":"text-orange-600")}>{fmt(inv.balance)}</PanelGridTd>
                                                <PanelGridTd align="center">{isVoid?<Check size={11} className="text-red-400 mx-auto"/>:"—"}</PanelGridTd>
                                                <PanelGridTd align="right">{fmt(inv.acumulative_balance)}</PanelGridTd>
                                            </PanelGridTr>
                                        );
                                    })}
                                    {!loadingInv && !selCustomer && <tr><td colSpan={12} className="p-8 text-center text-gray-400 italic text-xs">Select a customer in Tab 1</td></tr>}
                                    {!loadingInv && selCustomer && (invoices as any[]).length === 0 && <tr><td colSpan={12} className="p-8 text-center text-gray-400 italic text-xs">No invoices found</td></tr>}
                                </PanelGridTbody>
                                {(invoices as any[]).length > 0 && (
                                    <PanelGridTfoot>
                                        <tr className="text-[11px]">
                                            <td className="px-2 py-1 font-black" colSpan={5}>TOTALS</td>
                                            <td className="px-2 py-1 text-right font-black">{fmt(invTotals.amount)}</td>
                                            <td className="px-2 py-1 text-right font-black text-blue-700">{fmt(invTotals.payments)}</td>
                                            <td className="px-2 py-1 text-right font-black text-green-600">{fmt(invTotals.credits)}</td>
                                            <td className="px-2 py-1 text-right font-black text-red-500">{fmt(invTotals.debits)}</td>
                                            <td className="px-2 py-1 text-right font-black text-orange-600">{fmt(invTotals.invBal)}</td>
                                            <td className="px-2 py-1"/>
                                            <td className={cn("px-2 py-1 text-right font-black", parseFloat(String(invTotals.booksBal||0))>0?"text-orange-600":"text-gray-800")}>{fmt(invTotals.booksBal)}</td>
                                        </tr>
                                    </PanelGridTfoot>
                                )}
                            </PanelGridTable>
                    </PanelGrid>

                    {/* Applied payments + income combo */}
                    <div className="flex gap-1.5 overflow-hidden flex-1 min-h-0">
                        {/* Applied payments sub-grid */}
                        {/* Applied payments sub-grid */}
                        <PanelGrid
                            title={`Applied Payments ${selInvoice ? `— Inv. ${selInvoice.invoice_no}` : ""}`}
                            icon={DollarSign}
                            recordCount={(applied as any[]).length}
                            refreshing={loadingApplied}
                            menuItems={[
                                { label: "Apply Pay", icon: Plus, color: "green", onClick: ()=>{ if(!selInvoice){toast.error("Select an invoice.");return;} if(!selIncome){toast.error("Select an income.");return;} setApplyModal({mode:"add"}); }, disabled: !selInvoice||!selIncome||!perms.canCreate },
                                { label: "Edit Apply", icon: Pencil, color: "orange", onClick: ()=>{ if(!selApply)return; setApplyModal({mode:"edit"}); }, disabled: !selApply||!perms.canEdit },
                                { label: "Delete Apply", icon: Trash2, color: "red", onClick: ()=>{ if(!selApply)return; setApplyModal({mode:"delete"}); }, disabled: !selApply||!perms.canDelete },
                            ]}
                            className="flex-1 flex flex-col min-h-0"
                        >
                                <PanelGridTable>
                                    <PanelGridThead>
                                        <PanelGridTh>Income</PanelGridTh><PanelGridTh align="right">Payment</PanelGridTh>
                                    </PanelGridThead>
                                    <PanelGridTbody>
                                        {(applied as any[]).map((a: any) => {
                                            const isSel = selApply?.unico === a.unico;
                                            return (
                                                <PanelGridTr key={a.unico} onClick={()=>setSelApply(a)} selected={isSel}>
                                                    <PanelGridTd>{t(a.dato)}</PanelGridTd>
                                                    <PanelGridTd align="right" className="font-bold text-blue-700">{fmt(a.in_ammount)}</PanelGridTd>
                                                </PanelGridTr>
                                            );
                                        })}
                                        {!loadingApplied && (applied as any[]).length === 0 && <tr><td colSpan={2} className="p-4 text-center text-gray-300 italic text-xs">No payments applied</td></tr>}
                                    </PanelGridTbody>
                                </PanelGridTable>
                        </PanelGrid>

                        {/* Income combo + actions */}
                        {/* Income combo + actions */}
                        <PanelGrid
                            title="Incomes w/ Balance"
                            icon={DollarSign}
                            recordCount={(incomes as any[]).length}
                            className="w-72 shrink-0 flex flex-col min-h-0"
                        >
                            <div className="p-2 flex flex-col gap-2 flex-1">
                                {/* Income list */}
                                <div className="overflow-auto flex-1 border border-gray-200 rounded">
                                    {(incomes as any[]).map((inc: any) => {
                                        const isSel = selIncome?.unico === inc.unico;
                                        return (
                                            <div key={inc.unico} onClick={()=>{setSelIncome(inc); store.setSelPaymentUq(inc?.unico || null);}}
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
                        </PanelGrid>
                    </div>
                </div>
            )}

            {/* ── TAB 3: CUSTOMER PAYMENTS ──────────────────────────────────── */}
            {activeTab === "payments" && (
                <div className="flex flex-col flex-1 overflow-hidden p-1.5 gap-1.5">
                    {selCustBar}
                    {/* Payments grid */}
                    <PanelGrid
                        title={`Customer Payments ${selCustomer?`— ${t(selCustomer.customer)}`:""}`}
                        icon={DollarSign}
                        recordCount={(paymentsHistory as any[]).length}
                        onRefresh={refetchPay}
                        refreshing={loadingPay}
                        headerRight={<AuditLogModal recordId={selPayment?.unico} disabled={!selPayment} bareButton />}
                        menuItems={[
                            { label: "Add", icon: Plus, color: "green", onClick: ()=>{ if(!perms.canCreate){toast.error(PERMISSION_MSGS.create);return;} setNewPayModal({mode:"add"}); }, disabled: !selCustomer||!perms.canCreate },
                            { label: "Edit", icon: Pencil, color: "orange", onClick: ()=>{ if(!selPayment){toast.error("Payment empty.");return;} setNewPayModal({mode:"edit",income:selPayment}); }, disabled: !selPayment },
                            { label: "Delete", icon: Trash2, color: "red", onClick: ()=>{ if(!selPayment){toast.error("Payment empty.");return;} setNewPayModal({mode:"delete",income:selPayment}); }, disabled: !selPayment },
                            { label: "Void Payment", icon: RotateCcw, color: "orange", onClick: ()=>{
                                if(!selPayment){toast.error("Payment empty.");return;}
                                if(!perms.canEdit){toast.error(PERMISSION_MSGS.edit);return;}
                                toastConfirm("Do you want to VOID this payment?", async()=>{
                                    try{const r=await fetch(`/api/customer-payments/payment/${selPayment.unico}/void`,{method:"PUT"});const d=await r.json();if(!d.success)throw new Error(d.error);logAction("Edit",selPayment.unico,"Void");toast.success("Payment voided.");setSelPayment(null);refetchPay();refetchInv();refetchIncomes();}catch(e:any){toast.error((e as any).message);}
                                }, "Void");
                            }, disabled: !selPayment||!perms.canEdit },
                            { label: "Print", icon: Printer, color: "gray", onClick: async()=>{ if(!selPayment){toast.error("Payment empty.");return;} const d=await cpFetch(`/api/customer-payments/payment/${selPayment.unico}/report`); toast.info(`Report: ${d.records?.length??0} record(s) — print coming soon.`); }, disabled: !selPayment||!perms.canReport },
                            { label: "Cash Back", icon: RotateCcw, color: "blue", onClick: ()=>{ if(!selPayment){toast.error("Payment empty.");return;} setCashbackModal(true); }, disabled: !selPayment||!perms.canCreate },
                        ]}
                        className="flex-[1.2] flex flex-col min-h-0"
                    >
                            <PanelGridTable>
                                <PanelGridThead>
                                        <PanelGridTh>Date</PanelGridTh>
                                        <PanelGridTh align="right">Amount</PanelGridTh>
                                        <PanelGridTh align="right">Applied</PanelGridTh>
                                        <PanelGridTh align="right">Unapplied</PanelGridTh>
                                        <PanelGridTh align="right">Deposit</PanelGridTh>
                                        <PanelGridTh>Check/Doc</PanelGridTh>
                                        <PanelGridTh>Card</PanelGridTh>
                                        <PanelGridTh>Approval</PanelGridTh>
                                        <PanelGridTh align="center">Void</PanelGridTh>
                                </PanelGridThead>
                                <PanelGridTbody>
                                    {(paymentsHistory as any[]).map((p:any)=>{
                                        const isSel=selPayment?.unico===p.unico;
                                        return <PanelGridTr key={p.unico} onClick={()=>{ const s=selPayment?.unico===p.unico; setSelPayment(s?null:p); store.setSelPaymentUq(s?null:p?.unico||null); }} className={cn(p.void&&"opacity-45")} selected={isSel}>
                                            <PanelGridTd>{fmtDate(p.in_date)}</PanelGridTd>
                                            <PanelGridTd align="right" className="font-bold">{fmt(p.in_ammount)}</PanelGridTd>
                                            <PanelGridTd align="right" className="text-blue-700">{fmt(p.in_total)}</PanelGridTd>
                                            <PanelGridTd align="right" className="text-orange-600">{fmt(p.in_balance)}</PanelGridTd>
                                            <PanelGridTd align="right">{fmt(p.deposit)}</PanelGridTd>
                                            <PanelGridTd>{t(p.bank_doc)}</PanelGridTd>
                                            <PanelGridTd>{t(p.card)}</PanelGridTd>
                                            <PanelGridTd>{t(p.approval)}</PanelGridTd>
                                            <PanelGridTd align="center">{p.void?<Check size={11} className="text-red-400 mx-auto"/>:"—"}</PanelGridTd>
                                        </PanelGridTr>;
                                    })}
                                    {!loadingPay && !selCustomer && <tr><td colSpan={9} className="p-8 text-center text-gray-400 italic text-xs">Select a customer in Tab 1</td></tr>}
                                    {!loadingPay && selCustomer && (paymentsHistory as any[]).length===0 && <tr><td colSpan={9} className="p-8 text-center text-gray-400 italic text-xs">No payments found</td></tr>}
                                </PanelGridTbody>
                            </PanelGridTable>
                    </PanelGrid>
                    {/* Payment invoices sub-grid */}
                    <PanelGrid
                        title={`Applied Invoices ${selPayment?`— ${fmtDate(selPayment.in_date)}`:""}`}
                        icon={FileText}
                        recordCount={(payInvoices as any[]).length}
                        refreshing={loadingPayInv}
                        className="flex-1 flex flex-col min-h-0"
                    >
                            <PanelGridTable>
                                <PanelGridThead>
                                        <PanelGridTh>Invoice</PanelGridTh>
                                        <PanelGridTh>Date</PanelGridTh>
                                        <PanelGridTh>Due-Date</PanelGridTh>
                                        <PanelGridTh align="right">Amount</PanelGridTh>
                                        <PanelGridTh align="right">Credits</PanelGridTh>
                                        <PanelGridTh align="right">Debits</PanelGridTh>
                                        <PanelGridTh align="right">Payment</PanelGridTh>
                                        <PanelGridTh align="right">T.Payments</PanelGridTh>
                                </PanelGridThead>
                                <PanelGridTbody>
                                    {(payInvoices as any[]).map((p:any,i:number)=>(
                                        <PanelGridTr key={i}>
                                            <PanelGridTd className="font-mono font-semibold text-[#FB7506]">{p.invoice_no}</PanelGridTd>
                                            <PanelGridTd>{fmtDate(p.ar_date)}</PanelGridTd>
                                            <PanelGridTd>{fmtDate(p.date_due)}</PanelGridTd>
                                            <PanelGridTd align="right">{fmt(p.ammount)}</PanelGridTd>
                                            <PanelGridTd align="right" className="text-green-600">{fmt(p.credits)}</PanelGridTd>
                                            <PanelGridTd align="right" className="text-red-500">{fmt(p.debits)}</PanelGridTd>
                                            <PanelGridTd align="right" className="text-blue-700 font-bold">{fmt(p.payment)}</PanelGridTd>
                                            <PanelGridTd align="right">{fmt(p.payments)}</PanelGridTd>
                                        </PanelGridTr>
                                    ))}
                                    {!loadingPayInv && !selPayment && <tr><td colSpan={8} className="p-4 text-center text-gray-300 italic text-xs">Select a payment</td></tr>}
                                    {!loadingPayInv && selPayment && (payInvoices as any[]).length===0 && <tr><td colSpan={8} className="p-4 text-center text-gray-300 italic text-xs">No invoices applied</td></tr>}
                                </PanelGridTbody>
                            </PanelGridTable>
                    </PanelGrid>
                </div>
            )}

            {/* ── TAB 4: CREDITS / DEBITS ───────────────────────────────────── */}
            {activeTab === "crdb" && (
                <div className="flex flex-col flex-1 overflow-hidden p-1.5 gap-1.5">
                    {selCustBar}
                    {/* Two-column layout */}
                    <div className="flex gap-1.5 flex-1 overflow-hidden min-h-0">
                        {/* Left: Date picker */}
                        {/* Left: Date picker */}
                        <PanelGrid
                            title="Dates"
                            icon={Calendar}
                            recordCount={(crdbDates as any[]).length}
                            onRefresh={refetchCrdbDates}
                            refreshing={loadingCrdbDates}
                            className="w-44 shrink-0 flex flex-col min-h-0"
                        >
                                <PanelGridTable>
                                    <PanelGridThead>
                                        <PanelGridTh>Date</PanelGridTh><PanelGridTh align="right">#</PanelGridTh>
                                    </PanelGridThead>
                                    <PanelGridTbody>
                                        {(crdbDates as any[]).map((d:any)=>{
                                            const dKey = d.cddate ?? d.cd_date;
                                            const isSel = selCrDbDate === dKey;
                                            return <PanelGridTr key={dKey} onClick={()=>{setSelCrDbDate(dKey);setSelCrDb(null);}} selected={isSel}>
                                                <PanelGridTd>{fmtDate(d.cd_date||d.cddate)}</PanelGridTd>
                                                <PanelGridTd align="right">{d.records}</PanelGridTd>
                                            </PanelGridTr>;
                                        })}
                                        {!loadingCrdbDates && !selCustomer && <tr><td colSpan={2} className="p-2 text-center text-gray-300 italic text-[9px]">Select customer</td></tr>}
                                        {!loadingCrdbDates && selCustomer && (crdbDates as any[]).length===0 && <tr><td colSpan={2} className="p-2 text-center text-gray-300 italic text-[9px]">No dates</td></tr>}
                                </PanelGridTbody>
                                </PanelGridTable>
                        </PanelGrid>
                        {/* Right: CR/DB History */}
                        <PanelGrid
                            title={`Cr/Db History ${selCrDbDate?`— ${fmtDate(selCrDbDate)}`:""}`}
                            icon={Banknote}
                            recordCount={(crdbHistory as any[]).length}
                            onRefresh={refetchCrdb}
                            refreshing={loadingCrdb}
                            headerRight={<AuditLogModal recordId={selCrDb?.unico} disabled={!selCrDb} bareButton />}
                            menuItems={[
                                { label: "Refresh", icon: RefreshCcw, color: "gray", onClick: ()=>{ setSelCrDbDate(null); setSelCrDb(null); refetchCrdbDates(); } },
                                { label: "Edit Cr/Db", icon: Pencil, color: "orange", onClick: ()=>{
                                    if(!selCustomer){toast.error("Customer empty.");return;}
                                    if(!selCrDb){toast.error("Document empty.");return;}
                                    if(selCrDb.automatic){toast.error("Automatic Document. You can't edit/delete.");return;}
                                    setCrdbModal({mode:"edit"});
                                }, disabled: !selCrDb||!perms.canEdit },
                                { label: "Delete Cr/Db", icon: Trash2, color: "red", onClick: ()=>{
                                    if(!selCustomer){toast.error("Customer empty.");return;}
                                    if(!selCrDb){toast.error("Document empty.");return;}
                                    if(selCrDb.automatic){toast.error("Automatic Document. You can't edit/delete.");return;}
                                    setCrdbModal({mode:"delete"});
                                }, disabled: !selCrDb||!perms.canDelete },
                                { label: "Print Material", icon: Printer, color: "gray", onClick: ()=>{
                                    if(!selCrDb){toast.error("Select a CR/DB record first.");return;}
                                    if(!perms.canReport){toast.error(PERMISSION_MSGS.report);return;}
                                    setCrdbReportModal(true);
                                }, disabled: !selCrDb||!perms.canReport },
                            ]}
                            className="flex-1 flex flex-col min-h-0"
                        >
                                <PanelGridTable>
                                <PanelGridThead>
                                        <PanelGridTh>Type</PanelGridTh>
                                        <PanelGridTh>Invoice</PanelGridTh>
                                        <PanelGridTh align="right">Debits</PanelGridTh>
                                        <PanelGridTh align="right">Credits</PanelGridTh>
                                        <PanelGridTh align="right">OverCredits</PanelGridTh>
                                        <PanelGridTh align="center">Auto</PanelGridTh>
                                        <PanelGridTh>Reason</PanelGridTh>
                                        <PanelGridTh>Details</PanelGridTh>
                                </PanelGridThead>
                                <PanelGridTbody>
                                    {(crdbHistory as any[]).map((c:any)=>{
                                        const isSel=selCrDb?.unico===c.unico;
                                        return <PanelGridTr key={c.unico} onClick={()=>{ const s=selCrDb?.unico===c.unico; setSelCrDb(s?null:c); store.setSelCrdbUq(s?null:c?.unico||null); }} selected={isSel}>
                                            <PanelGridTd><span className={cn("font-black text-[10px]",c.type==="C"?"text-green-600":"text-red-500")}>{c.type}</span></PanelGridTd>
                                            <PanelGridTd className="font-mono font-semibold text-[#FB7506]">{c.invoice_no}</PanelGridTd>
                                            <PanelGridTd align="right" className="text-red-500">{c.type==="D"?fmt(c.cd_ammount):"—"}</PanelGridTd>
                                            <PanelGridTd align="right" className="text-green-600">{c.type==="C"?fmt(c.cd_ammount):"—"}</PanelGridTd>
                                            <PanelGridTd align="right">{fmt(c.overcredits)}</PanelGridTd>
                                            <PanelGridTd align="center">{c.automatic?<Check size={11} className="text-blue-400 mx-auto"/>:"—"}</PanelGridTd>
                                            <PanelGridTd>{t(c.reason)}</PanelGridTd>
                                            <PanelGridTd>{t(c.details)}</PanelGridTd>
                                        </PanelGridTr>;
                                    })}
                                    {!loadingCrdb && !selCrDbDate && <tr><td colSpan={8} className="p-8 text-center text-gray-400 italic text-xs">Select a date on the left</td></tr>}
                                    {!loadingCrdb && selCrDbDate && (crdbHistory as any[]).length===0 && <tr><td colSpan={8} className="p-8 text-center text-gray-400 italic text-xs">No records for this date</td></tr>}
                                </PanelGridTbody>
                                </PanelGridTable>
                        </PanelGrid>
                    </div>
                </div>
            )}

            {/* ── TAB 5: STATEMENT ──────────────────────────────────────────── */}
            {activeTab === "statement" && (
                <div className="flex flex-col flex-1 overflow-hidden p-1.5 gap-1.5">
                    {selCustBar}
                    {/* Date filters shared between both grids */}
                    <div className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-1.5 flex flex-wrap items-center gap-3 shrink-0 text-xs">
                        <div className="flex items-center gap-2">
                            <label className="text-[9px] font-black text-gray-500 uppercase">Start Date</label>
                            <input type="date" value={stmtFrom} onChange={e=>setStmtFrom(e.target.value)} className="fos-input py-1 w-36"/>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-[9px] font-black text-gray-500 uppercase">End Date</label>
                            <input type="date" value={stmtTo} onChange={e=>setStmtTo(e.target.value)} className="fos-input py-1 w-36"/>
                        </div>
                        <button onClick={()=>{refetchStmt();refetchStmtBal();}}
                            className="p-1.5 rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:text-[#FB7506] transition-colors"
                            title="Refresh">
                            <RefreshCcw size={13}/>
                        </button>
                    </div>
                    {/* Statement summary grid */}
                    {/* Statement summary grid */}
                    <PanelGrid
                        title={`Statement ${selCustomer?`— ${t(selCustomer.customer)}`:""}`}
                        icon={FileText}
                        recordCount={(stmtData as any[]).length}
                        onRefresh={refetchStmt}
                        refreshing={loadingStmt}
                        menuItems={[
                                { label: "Print", icon: Printer, color: "gray", onClick: async()=>{
                                    if(!selCustomer) return;
                                    setStmtPreviewLoading(true); setStmtPreviewModal(true);
                                    try{
                                        const d = await cpFetch(`/api/customer-payments/reports/html-statement-balance/${selCustomer.unico}?from=${stmtFrom}&to=${stmtTo}`);
                                        setStmtPreviewHtml(d.html || "<p>No statement available.</p>");
                                    }catch(e:any){ toast.error(e.message); setStmtPreviewModal(false); }
                                    finally{ setStmtPreviewLoading(false); }
                                }, disabled: !selCustomer||!perms.canReport },
                                { label: "Print Cut", icon: Calendar, color: "gray", onClick: ()=>setCutDateModal(true), disabled: !selCustomer||!perms.canReport },
                            ]}
                        className="flex-[0.4] flex flex-col min-h-0"
                    >
                            <PanelGridTable>
                                <PanelGridThead>
                                        <PanelGridTh>Type</PanelGridTh>
                                        <PanelGridTh>Date</PanelGridTh>
                                        <PanelGridTh>Doc.</PanelGridTh>
                                        <PanelGridTh align="right">Debits</PanelGridTh>
                                        <PanelGridTh align="right">Credits</PanelGridTh>
                                        <PanelGridTh align="right">Balance</PanelGridTh>
                                </PanelGridThead>
                                <PanelGridTbody>
                                    {(stmtData as any[]).map((r:any,i:number)=><PanelGridTr key={i}>
                                        <PanelGridTd className="font-bold">{t(r.type)}</PanelGridTd>
                                        <PanelGridTd>{fmtDate(r.fecha||r.date)}</PanelGridTd>
                                        <PanelGridTd className="font-mono font-semibold text-[#FB7506]">{r.invoice_no}</PanelGridTd>
                                        <PanelGridTd align="right" className="text-red-500">{fmt(r.debits)}</PanelGridTd>
                                        <PanelGridTd align="right" className="text-green-600">{fmt(r.credits)}</PanelGridTd>
                                        <PanelGridTd align="right" className="font-bold text-orange-600">{fmt(r.balance)}</PanelGridTd>
                                    </PanelGridTr>)}
                                    {!loadingStmt&&!selCustomer&&<tr><td colSpan={6} className="p-6 text-center text-gray-300 italic text-xs">Select a customer</td></tr>}
                                    {!loadingStmt&&selCustomer&&(stmtData as any[]).length===0&&<tr><td colSpan={6} className="p-6 text-center text-gray-300 italic text-xs">No records</td></tr>}
                                </PanelGridTbody>
                            </PanelGridTable>
                    </PanelGrid>
                    {/* Statement balance grid */}
                    <PanelGrid
                        title="Statement with Balance"
                        icon={BarChart2}
                        recordCount={(stmtBalData as any[]).length}
                        onRefresh={refetchStmtBal}
                        refreshing={loadingStmtBal}
                        menuItems={[
                            { label: "Print", icon: Printer, color: "gray", onClick: async()=>{
                                if(!selCustomer) return;
                                setStmtPreviewLoading(true); setStmtPreviewModal(true);
                                try{
                                    const d = await cpFetch(`/api/customer-payments/reports/html-statement-balance/${selCustomer.unico}?from=${stmtFrom}&to=${stmtTo}`);
                                    setStmtPreviewHtml(d.html || "<p>No statement available.</p>");
                                }catch(e:any){ toast.error(e.message); setStmtPreviewModal(false); }
                                finally{ setStmtPreviewLoading(false); }
                            }, disabled: !selCustomer||!perms.canReport },
                        ]}
                        className="flex-[0.6] flex flex-col min-h-0"
                    >
                        {printAllProgress && <div className="h-6 bg-blue-50 border-b border-blue-200 flex items-center px-3 text-xs font-bold text-blue-700 shrink-0"><RefreshCcw size={10} className="animate-spin mr-2"/>{printAllProgress}</div>}
                        <div className="overflow-auto flex-1">
                            <PanelGridTable>
                                <PanelGridThead>
                                        <PanelGridTh>Type</PanelGridTh>
                                        <PanelGridTh>Date</PanelGridTh>
                                        <PanelGridTh>Doc.</PanelGridTh>
                                        <PanelGridTh>Due Date</PanelGridTh>
                                        <PanelGridTh align="right">Amount</PanelGridTh>
                                        <PanelGridTh align="right">Payments</PanelGridTh>
                                        <PanelGridTh align="right">Debits</PanelGridTh>
                                        <PanelGridTh align="right">Credits</PanelGridTh>
                                        <PanelGridTh align="right">Balance</PanelGridTh>
                                </PanelGridThead>
                                <PanelGridTbody>
                                    {(stmtBalData as any[]).map((r:any,i:number)=><PanelGridTr key={i}>
                                        <PanelGridTd className="font-bold">{t(r.type)}</PanelGridTd>
                                        <PanelGridTd>{fmtDate(r.fecha||r.date)}</PanelGridTd>
                                        <PanelGridTd className="font-mono font-semibold text-[#FB7506]">{r.invoice_no}</PanelGridTd>
                                        <PanelGridTd>{fmtDate(r.due_date)}</PanelGridTd>
                                        <PanelGridTd align="right">{fmt(r.ammount)}</PanelGridTd>
                                        <PanelGridTd align="right" className="text-blue-700">{fmt(r.payments)}</PanelGridTd>
                                        <PanelGridTd align="right" className="text-red-500">{fmt(r.debits)}</PanelGridTd>
                                        <PanelGridTd align="right" className="text-green-600">{fmt(r.credits)}</PanelGridTd>
                                        <PanelGridTd align="right" className="font-bold text-orange-600">{fmt(r.balance)}</PanelGridTd>
                                    </PanelGridTr>)}
                                    {!loadingStmtBal&&!selCustomer&&<tr><td colSpan={9} className="p-6 text-center text-gray-300 italic text-xs">Select a customer</td></tr>}
                                    {!loadingStmtBal&&selCustomer&&(stmtBalData as any[]).length===0&&<tr><td colSpan={9} className="p-6 text-center text-gray-300 italic text-xs">No records</td></tr>}
                                </PanelGridTbody>
                            </PanelGridTable>
                        </div>
                    </PanelGrid>
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
                    {/* Corp Incomes grid */}
                    <PanelGrid
                        title="Corp. Payments"
                        icon={Banknote}
                        recordCount={(corpIncomes as any[]).length}
                        onRefresh={refetchCorpInc}
                        refreshing={loadingCorpInc}
                        menuItems={[
                            { label: "Add", icon: Plus, color: "green", onClick: ()=>setCorpPayModal({mode:"add"}), disabled: !perms.canCreate },
                            { label: "Edit", icon: Pencil, color: "orange", onClick: ()=>{ if(!selCorpIncome)return; setCorpPayModal({mode:"edit"}); }, disabled: !selCorpIncome },
                            { label: "Delete", icon: Trash2, color: "red", onClick: ()=>{ if(!selCorpIncome)return; setCorpPayModal({mode:"delete"}); }, disabled: !selCorpIncome },
                        ]}
                        className="flex-[0.33] flex flex-col min-h-0"
                    >
                            <PanelGridTable>
                                <PanelGridThead>
                                        <PanelGridTh>Date</PanelGridTh>
                                        <PanelGridTh>Customer</PanelGridTh>
                                        <PanelGridTh>Bank-Doc</PanelGridTh>
                                        <PanelGridTh align="right">Amount</PanelGridTh>
                                        <PanelGridTh align="right">Applied</PanelGridTh>
                                        <PanelGridTh align="right">Balance</PanelGridTh>
                                </PanelGridThead>
                                <PanelGridTbody>
                                    {(corpIncomes as any[]).map((c:any)=>{
                                        const isSel=selCorpIncome?.unico===c.unico;
                                        return <PanelGridTr key={c.unico} onClick={()=>{ const s=selCorpIncome?.unico===c.unico; if(s){setSelCorpIncome(null);store.setActiveGrid(null);}else{setSelCorpIncome(c);setSelCorpPayment(null);store.setActiveGrid("corporate");} }} selected={isSel}>
                                            <PanelGridTd>{fmtDate(c.pay_date)}</PanelGridTd>
                                            <PanelGridTd className="font-mono font-semibold text-[#FB7506]">{t(c.cust_code)}</PanelGridTd>
                                            <PanelGridTd>{t(c.bank_doc)}</PanelGridTd>
                                            <PanelGridTd align="right" className="font-bold">{fmt(c.pay_amount)}</PanelGridTd>
                                            <PanelGridTd align="right" className="text-blue-700">{fmt(c.pay_applied)}</PanelGridTd>
                                            <PanelGridTd align="right" className="text-orange-600 font-bold">{fmt(c.pay_balance)}</PanelGridTd>
                                        </PanelGridTr>;
                                    })}
                                    {!loadingCorpInc&&(corpIncomes as any[]).length===0&&<tr><td colSpan={6} className="p-6 text-center text-gray-300 italic text-xs">No corporate payments for this date</td></tr>}
                                </PanelGridTbody>
                            </PanelGridTable>
                    </PanelGrid>
                    {/* Customer Payments (Detallecontrol3) */}
                    <PanelGrid
                        title={`Customer Payments ${selCorpIncome?`— ${t(selCorpIncome.cust_code)}`:""}`}
                        icon={DollarSign}
                        recordCount={(corpPayments as any[]).length}
                        onRefresh={refetchCorpPay}
                        refreshing={loadingCorpPay}
                        menuItems={[
                            { label: "Add", icon: Plus, color: "green", onClick: ()=>{}, disabled: true },
                            { label: "Edit", icon: Pencil, color: "orange", onClick: ()=>{}, disabled: true },
                            { label: "Delete", icon: Trash2, color: "red", onClick: ()=>{}, disabled: true },
                            { label: "View", icon: Search, color: "gray", onClick: ()=>selCorpPayment?toast.info("View payment — coming soon"):toast.error("There isn't a Customer payment note...") },
                        ]}
                        className="flex-[0.33] flex flex-col min-h-0"
                    >
                            <PanelGridTable>
                                <PanelGridThead>
                                        <PanelGridTh>Date</PanelGridTh>
                                        <PanelGridTh>Customer</PanelGridTh>
                                        <PanelGridTh>Bank-Doc</PanelGridTh>
                                        <PanelGridTh align="right">Payment</PanelGridTh>
                                        <PanelGridTh align="right">Applied</PanelGridTh>
                                        <PanelGridTh align="right">UnApply</PanelGridTh>
                                        <PanelGridTh align="right">Deposit</PanelGridTh>
                                </PanelGridThead>
                                <PanelGridTbody>
                                    {(corpPayments as any[]).map((p:any)=>{
                                        const isSel=selCorpPayment?.unico===p.unico;
                                        return <PanelGridTr key={p.unico} onClick={()=>{ const s=selCorpPayment?.unico===p.unico; if(s){setSelCorpPayment(null);store.setActiveGrid(null);}else{setSelCorpPayment(p);store.setActiveGrid("corp-invoice");} }} selected={isSel}>
                                            <PanelGridTd>{fmtDate(p.pay_date)}</PanelGridTd>
                                            <PanelGridTd className="font-mono font-semibold text-[#FB7506]">{t(p.cust_code)}</PanelGridTd>
                                            <PanelGridTd>{t(p.bank_doc)}</PanelGridTd>
                                            <PanelGridTd align="right" className="font-bold text-blue-700">{fmt(p.payment)}</PanelGridTd>
                                            <PanelGridTd align="right">{fmt(p.applied)}</PanelGridTd>
                                            <PanelGridTd align="right" className="text-orange-600">{fmt(p.unapply)}</PanelGridTd>
                                            <PanelGridTd align="right">{fmt(p.deposit)}</PanelGridTd>
                                        </PanelGridTr>;
                                    })}
                                    {!loadingCorpPay&&!selCorpIncome&&<tr><td colSpan={7} className="p-4 text-center text-gray-300 italic text-xs">Select a corporate payment</td></tr>}
                                    {!loadingCorpPay&&selCorpIncome&&(corpPayments as any[]).length===0&&<tr><td colSpan={7} className="p-4 text-center text-gray-300 italic text-xs">No customer payments</td></tr>}
                                </PanelGridTbody>
                            </PanelGridTable>
                    </PanelGrid>
                    {/* Invoice Applied Payments (Detallecontrol2) */}
                    <PanelGrid
                        title="Invoice Applied Payments"
                        icon={FileText}
                        recordCount={(corpInvoices as any[]).length}
                        onRefresh={refetchCorpInv}
                        refreshing={loadingCorpInv}
                        menuItems={[
                            { label: "Add Invoice", icon: Plus, color: "green", onClick: ()=>{ if(!selCorpIncome){toast.error("Select a corporate payment.");return;} if(parseFloat(selCorpIncome.pay_balance??0)<=0){toast.error("Corporate Payment Balance is 0.");return;} setCorpInvModal(true); }, disabled: !selCorpIncome||!perms.canCreate },
                            { label: "Edit", icon: Pencil, color: "orange", onClick: ()=>{}, disabled: true },
                            { label: "Delete", icon: Trash2, color: "red", onClick: ()=>toast.info("Delete corp invoice — coming soon"), disabled: !selCorpPayment },
                        ]}
                        className="flex-[0.33] flex flex-col min-h-0"
                    >
                            <PanelGridTable>
                                <PanelGridThead>
                                        <PanelGridTh>Date</PanelGridTh>
                                        <PanelGridTh>Customer</PanelGridTh>
                                        <PanelGridTh>Bank-Doc</PanelGridTh>
                                        <PanelGridTh align="right">Applied</PanelGridTh>
                                        <PanelGridTh>Invoice</PanelGridTh>
                                        <PanelGridTh>Due Date</PanelGridTh>
                                </PanelGridThead>
                                <PanelGridTbody>
                                    {(corpInvoices as any[]).map((c:any,i:number)=><PanelGridTr key={i}>
                                        <PanelGridTd>{fmtDate(c.pay_date)}</PanelGridTd>
                                        <PanelGridTd className="font-bold">{t(c.cust_code)}</PanelGridTd>
                                        <PanelGridTd>{t(c.bank_doc)}</PanelGridTd>
                                        <PanelGridTd align="right" className="text-blue-700 font-bold">{fmt(c.in_ammount)}</PanelGridTd>
                                        <PanelGridTd className="font-mono font-semibold text-[#FB7506]">{c.invoice_no}</PanelGridTd>
                                        <PanelGridTd>{fmtDate(c.date_due)}</PanelGridTd>
                                    </PanelGridTr>)}
                                    {!loadingCorpInv&&!selCorpPayment&&<tr><td colSpan={6} className="p-4 text-center text-gray-300 italic text-xs">Select a customer payment</td></tr>}
                                    {!loadingCorpInv&&selCorpPayment&&(corpInvoices as any[]).length===0&&<tr><td colSpan={6} className="p-4 text-center text-gray-300 italic text-xs">No invoices applied</td></tr>}
                                </PanelGridTbody>
                            </PanelGridTable>
                    </PanelGrid>
                </div>
            )}

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
                    onConfirm={async (salesmanUq: string)=>{ toast.info("Print by salesman — coming soon"); }}/>
            )}
            {cutDateModal && selCustomer && (
                <CutDateModal customerUq={selCustomer.unico} onClose={()=>setCutDateModal(false)}/>
            )}
            {stmtPreviewModal && (
                <StatementPreviewModal html={stmtPreviewHtml} onClose={()=>setStmtPreviewModal(false)} customer={selCustomer}/>
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
            <AppFooter areaLabel="Accounts Receivable" />

            {/* ── Mobile Action Bar ────────────────────────────────────────── */}
            <MobileActionBar
                activeGrid={activeGrid}
                onClearSelection={() => store.setActiveGrid(null)}
                items={[
                    { grid: "customer", label: "Edit Cust", icon: Pencil, color: "orange", onClick: () => { if(selCustomer) setCustEditModal(true) }, disabled: !selCustomer || !perms.canEdit },
                    { grid: "invoices", label: "New Pay", icon: Plus, color: "green", onClick: () => { if(!perms.canCreate){toast.error(PERMISSION_MSGS.create);return;} setNewPayModal({mode:"add"}); }, disabled: !selCustomer || !perms.canCreate },
                    { grid: "invoices", label: "Apply Pay", icon: DollarSign, color: "blue", onClick: () => { if(selInvoice && selIncome) setApplyModal({mode:"add"}) }, disabled: !selInvoice || !selIncome || !perms.canCreate },
                    { grid: "invoices", label: "Cr/Db", icon: CreditCard, color: "orange", onClick: () => { if(selInvoice) setCrdbModal({mode:"add"}) }, disabled: !selInvoice || !perms.canCreate },
                    { grid: "payments", label: "Add", icon: Plus, color: "green", onClick: () => { if(!perms.canCreate){toast.error(PERMISSION_MSGS.create);return;} setNewPayModal({mode:"add"}); }, disabled: !selCustomer || !perms.canCreate },
                    { grid: "payments", label: "Edit", icon: Pencil, color: "orange", onClick: () => { if(selPayment) setNewPayModal({mode:"edit", income:selPayment}) }, disabled: !selPayment || !perms.canEdit },
                    { grid: "payments", label: "Delete", icon: Trash2, color: "red", onClick: () => { if(selPayment) setNewPayModal({mode:"delete", income:selPayment}) }, disabled: !selPayment || !perms.canDelete },
                    { grid: "crdb", label: "Edit", icon: Pencil, color: "orange", onClick: () => { if(selCrDb) setCrdbModal({mode:"edit"}) }, disabled: !selCrDb || !perms.canEdit },
                    { grid: "crdb", label: "Delete", icon: Trash2, color: "red", onClick: () => { if(selCrDb) setCrdbModal({mode:"delete"}) }, disabled: !selCrDb || !perms.canDelete },
                    { grid: "corporate", label: "Add", icon: Plus, color: "green", onClick: () => setCorpPayModal({mode:"add"}), disabled: !perms.canCreate },
                    { grid: "corporate", label: "Edit", icon: Pencil, color: "orange", onClick: () => { if(selCorpIncome) setCorpPayModal({mode:"edit"}); }, disabled: !selCorpIncome || !perms.canEdit },
                    { grid: "corporate", label: "Delete", icon: Trash2, color: "red", onClick: () => { if(selCorpIncome) setCorpPayModal({mode:"delete"}); }, disabled: !selCorpIncome || !perms.canDelete },
                    { grid: "corp-invoice", label: "Add Inv", icon: Plus, color: "green", onClick: () => { if(selCorpIncome) setCorpInvModal(true); }, disabled: !selCorpIncome || !perms.canCreate },
                ]}
            />

        </div>
    );
}
