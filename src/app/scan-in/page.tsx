"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    ScanLine, Loader2, PackageSearch, CheckCircle2, XCircle,
    Package, List, FileText, AlignJustify, Receipt,
    Play, StopCircle, RotateCcw, Plus, Pencil, Trash2,
    ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { usePagePermissions } from "@/lib/permissions";
import AppHeader from "@/components/layout/AppHeader";
import AppFooter from "@/components/layout/AppFooter";
import PanelGrid from "@/components/ui/PanelGrid";
import { PanelGridTable, PanelGridThead, PanelGridTh, PanelGridTbody, PanelGridTr, PanelGridTd } from "@/components/ui/PanelGridTable";
import { AuditLogModal } from "@/components/AuditLogModal";
import { useScanInStore } from "@/store/useScanInStore";
import type { ScanInTabId } from "@/store/useScanInStore";
import { DelayedBoxModal } from "@/components/scan-in/DelayedBoxModal";

const t    = (v: unknown) => String(v ?? "").trim();
const fmtN = (v: unknown) => { const n = Number(v ?? 0); return isNaN(n) ? "—" : n.toLocaleString("en-US"); };

function StatBox({ label, value, color = "gray" }: { label: string; value: unknown; color?: string }) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center rounded px-4 py-1.5 min-w-[90px] shrink-0",
            color === "orange" && "bg-[#FB7506]/10 border border-[#FB7506]/30",
            color === "green"  && "bg-green-50 border border-green-200",
            color === "blue"   && "bg-blue-50 border border-blue-200",
            color === "gray"   && "bg-gray-100 border border-gray-200",
        )}>
            <span className={cn("text-[18px] font-black tabular-nums leading-none",
                color === "orange" && "text-[#FB7506]",
                color === "green"  && "text-green-700",
                color === "blue"   && "text-blue-700",
                color === "gray"   && "text-gray-700",
            )}>{fmtN(value)}</span>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide text-center mt-0.5">{label}</span>
        </div>
    );
}

const TABS: { id: ScanInTabId; icon: typeof List; label: string }[] = [
    { id: "pending",   icon: List,          label: "Pending"   },
    { id: "recepted",  icon: CheckCircle2,  label: "Recepted"  },
    { id: "scan-list", icon: AlignJustify,  label: "Scan List" },
    { id: "no-scan",   icon: XCircle,       label: "No Scan"   },
    { id: "invoices",  icon: Receipt,       label: "Invoices"  },
];

export default function ScanInPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { canCreate, canDelete } = usePagePermissions("scan-in");

    const {
        activeAwb, setActiveAwb,
        totals, setTotals,
        scanning, setScanning,
        lastScan, setLastScan,
        selectedLot, setSelectedLot,
        activeTab, setActiveTab,
        pendingSelRow, setPendingSelRow,
        receptedSelRow, setReceptedSelRow,
        scanListSelRow, setScanListSelRow,
        noScanSelRow, setNoScanSelRow,
        invoiceSelRow, setInvoiceSelRow,
        viewKey, refresh, reset,
    } = useScanInStore();

    const [awbInput,    setAwbInput]    = useState("");
    const [awbLoading,  setAwbLoading]  = useState(false);
    const [scanInput,   setScanInput]   = useState("");
    const [processing,  setProcessing]  = useState(false);
    const [confirming,  setConfirming]  = useState(false);
    const [batching,    setBatching]    = useState(false);

    // Tab data
    const [pendingData,  setPendingData]  = useState<any[]>([]);
    const [receptedData, setReceptedData] = useState<any[]>([]);
    const [scanListData, setScanListData] = useState<any[]>([]);
    const [noScanData,   setNoScanData]   = useState<any[]>([]);
    const [invoiceData,  setInvoiceData]  = useState<any[]>([]);
    const [delayedData,  setDelayedData]  = useState<any[]>([]);

    const [tabLoading,     setTabLoading]     = useState(false);
    const [delayedLoading, setDelayedLoading] = useState(false);

    // Delayed box modal state
    const [delayedModal, setDelayedModal] = useState<{
        open: boolean;
        mode: "add" | "edit";
        pkBoxUq: string;
        initial?: { unico: string; reason_uq: string; qty: number; notes: string };
    }>({ open: false, mode: "add", pkBoxUq: "" });

    const [confirmOpen, setConfirmOpen] = useState(false);

    const awbInputRef  = useRef<HTMLInputElement>(null);
    const scanInputRef = useRef<HTMLInputElement>(null);

    // Auto-focus
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!activeAwb) awbInputRef.current?.focus();
            else if (scanning) scanInputRef.current?.focus();
        }, 100);
        return () => clearTimeout(timer);
    }, [activeAwb, scanning]);

    // Keep focus on scan input while scanning
    useEffect(() => {
        if (!scanning) return;
        const refocus = () => setTimeout(() => scanInputRef.current?.focus(), 10);
        document.addEventListener("click", refocus);
        return () => document.removeEventListener("click", refocus);
    }, [scanning]);

    // Load tab data when AWB or tab changes
    useEffect(() => {
        if (!activeAwb) return;
        loadTabData(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeAwb, activeTab, viewKey]);

    // Load delayed boxes when selectedLot changes
    useEffect(() => {
        if (!selectedLot?.pkbox_uq) { setDelayedData([]); return; }
        loadDelayed(t(selectedLot.pkbox_uq));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedLot]);

    const loadTabData = useCallback(async (tab: ScanInTabId) => {
        if (!activeAwb) return;
        setTabLoading(true);
        try {
            const endpointMap: Record<ScanInTabId, string> = {
                "pending":   `/api/scan-in/pending?awb=${encodeURIComponent(activeAwb)}`,
                "recepted":  `/api/scan-in/recepted?awb=${encodeURIComponent(activeAwb)}`,
                "scan-list": `/api/scan-in/scan-list?awb=${encodeURIComponent(activeAwb)}`,
                "no-scan":   `/api/scan-in/no-scan-list?awb=${encodeURIComponent(activeAwb)}`,
                "invoices":  `/api/scan-in/invoices?awb=${encodeURIComponent(activeAwb)}`,
            };
            const res = await fetch(endpointMap[tab]);
            if (!res.ok) { toast.error("Failed to load tab data"); return; }
            const data = await res.json();
            if (tab === "pending")   { setPendingData(data);  setPendingSelRow(null); setSelectedLot(null); }
            if (tab === "recepted")  { setReceptedData(data); setReceptedSelRow(null); }
            if (tab === "scan-list") { setScanListData(data); setScanListSelRow(null); }
            if (tab === "no-scan")   { setNoScanData(data);   setNoScanSelRow(null); }
            if (tab === "invoices")  { setInvoiceData(data);  setInvoiceSelRow(null); }
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setTabLoading(false);
        }
    }, [activeAwb, setPendingSelRow, setReceptedSelRow, setScanListSelRow, setNoScanSelRow, setInvoiceSelRow, setSelectedLot]);

    const loadDelayed = async (pkBoxUq: string) => {
        setDelayedLoading(true);
        try {
            const res = await fetch(`/api/scan-in/delayed?pk_box_uq=${encodeURIComponent(pkBoxUq)}`);
            if (!res.ok) return;
            setDelayedData(await res.json());
        } catch { /* silent */ }
        finally { setDelayedLoading(false); }
    };

    // Load AWB
    const handleLoadAwb = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        const code = awbInput.trim().toUpperCase();
        if (!code) return;
        setAwbLoading(true);
        try {
            const res = await fetch(`/api/scan-in/awb?code=${encodeURIComponent(code)}`);
            const json = await res.json();
            if (!res.ok) { toast.error(json.error || "AWB not found"); awbInputRef.current?.select(); return; }
            setActiveAwb(json.awbcode);
            setTotals({ totalPieces: json.totalPieces, readPieces: json.readPieces });
            setActiveTab("pending");
            toast.success(`AWB ${json.awbcode} loaded — ${json.totalPieces} total pieces`);
        } catch (e: any) { toast.error(e.message); }
        finally { setAwbLoading(false); }
    }, [awbInput, setActiveAwb, setTotals, setActiveTab]);

    // Scan a barcode
    const handleScan = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        const barcode = scanInput.trim().toUpperCase();
        if (!barcode || !activeAwb || processing) return;
        const toScan = (totals?.totalPieces ?? 0) - (totals?.readPieces ?? 0);
        if (toScan <= 0) return;
        setScanInput("");
        setProcessing(true);
        try {
            const res = await fetch("/api/scan-in/scan", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ awb: activeAwb, barcode }),
            });
            const json = await res.json();
            if (!res.ok) {
                setLastScan({ ok: false, msg: json.error || "Scan failed" });
                toast.error(json.error || "Scan failed");
            } else {
                setLastScan({ ok: true, msg: json.message || "Scanned" });
                if (json.totals) setTotals(json.totals);
                // Refresh current tab data silently
                loadTabData(activeTab);
            }
        } catch (e: any) {
            setLastScan({ ok: false, msg: e.message });
            toast.error(e.message);
        } finally {
            setProcessing(false);
            setTimeout(() => scanInputRef.current?.focus(), 50);
        }
    }, [scanInput, activeAwb, processing, totals, activeTab, setLastScan, setTotals, loadTabData]);

    // Confirm AWB
    const handleConfirm = async () => {
        if (!activeAwb) return;
        setConfirming(true);
        try {
            const res = await fetch("/api/scan-in/confirm", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ awb: activeAwb }),
            });
            const json = await res.json();
            if (!res.ok) { toast.error(json.error || "Confirm failed"); return; }
            toast.success(json.message || "AWB confirmed");
            refresh();
        } catch (e: any) { toast.error(e.message); }
        finally { setConfirming(false); setConfirmOpen(false); }
    };

    // Supervisor batch scan
    const handleBatchScan = async () => {
        if (!activeAwb || !canDelete) return;
        setBatching(true);
        try {
            const res = await fetch("/api/scan-in/batch-scan", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ awb: activeAwb }),
            });
            const json = await res.json();
            if (!res.ok) { toast.error(json.error || "Batch scan failed"); return; }
            toast.success(`Batch scan complete — ${json.scanned} boxes scanned`);
            if (json.errors?.length) toast.warning(`${json.errors.length} errors occurred`);
            // Re-load AWB totals
            const totalsRes = await fetch(`/api/scan-in/awb?code=${encodeURIComponent(activeAwb)}`);
            if (totalsRes.ok) {
                const td = await totalsRes.json();
                setTotals({ totalPieces: td.totalPieces, readPieces: td.readPieces });
            }
            refresh();
        } catch (e: any) { toast.error(e.message); }
        finally { setBatching(false); }
    };

    const handleCloseAwb = () => {
        reset();
        setAwbInput("");
        setScanInput("");
        setTimeout(() => awbInputRef.current?.focus(), 100);
    };

    const toScan = (totals?.totalPieces ?? 0) - (totals?.readPieces ?? 0);

    const handleDeleteDelayed = async (unico: string) => {
        if (!window.confirm("Delete this delayed box record?")) return;
        try {
            const res = await fetch(`/api/scan-in/delayed?unico=${encodeURIComponent(unico)}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) { toast.error(json.error || "Delete failed"); return; }
            toast.success("Deleted");
            if (selectedLot?.pkbox_uq) loadDelayed(t(selectedLot.pkbox_uq));
        } catch (e: any) { toast.error(e.message); }
    };

    if (status === "loading") return null;
    if (status === "unauthenticated") { router.push("/login"); return null; }

    return (
        <div className="flex flex-col h-[100dvh] bg-[#f4f6f8] overflow-hidden font-sans text-[#333]">
            <AppHeader title="AWB Reception" icon={ScanLine} />
            <main className="flex-1 overflow-hidden flex flex-col min-h-0">

                {/* Phase 1: AWB input */}
                {!activeAwb ? (
                    <div className="flex-1 flex items-center justify-center p-4">
                        <div className="bg-white border border-[#DBD9D9] rounded-xl shadow-xl w-full max-w-md p-8">
                            <div className="text-center mb-8">
                                <PackageSearch size={48} className="mx-auto text-[#FB7506] mb-4" />
                                <h2 className="text-xl font-black uppercase tracking-tight text-[#374151]">
                                    AWB Reception / Scan IN
                                </h2>
                                <p className="text-gray-500 mt-2 text-sm font-medium">
                                    Enter or scan the AWB code to begin reception.
                                </p>
                            </div>
                            <form onSubmit={handleLoadAwb} className="flex flex-col gap-4">
                                <input
                                    ref={awbInputRef}
                                    type="text"
                                    value={awbInput}
                                    onChange={(e) => setAwbInput(e.target.value.toUpperCase())}
                                    placeholder="AWB Code..."
                                    className="w-full bg-[#F5F3F3] border-2 border-[#DBD9D9] rounded-xl px-6 py-4 text-2xl font-black text-center placeholder:text-gray-300 focus:outline-none focus:border-[#FB7506] focus:bg-white transition-all uppercase"
                                    autoFocus
                                    autoComplete="off"
                                />
                                <button
                                    type="submit"
                                    disabled={awbLoading || !awbInput.trim()}
                                    className="w-full bg-[#374151] hover:bg-[#4B5563] disabled:opacity-50 text-white font-black uppercase tracking-widest py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm">
                                    {awbLoading ? <Loader2 size={18} className="animate-spin" /> : <><Play size={16} /> Load AWB</>}
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Action bar */}
                        <div className="bg-[#F5F3F3] border-b border-[#DBD9D9] px-3 py-2 shrink-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                {/* AWB info */}
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="flex flex-col shrink-0">
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">AWB</span>
                                        <span className="text-[15px] font-black text-[#FB7506]">{activeAwb}</span>
                                    </div>
                                    <div className="w-px h-8 bg-gray-200 shrink-0" />
                                    <StatBox label="Total Pieces" value={totals?.totalPieces ?? 0} color="blue" />
                                    <StatBox label="Scanned"      value={totals?.readPieces  ?? 0} color="green" />
                                    <StatBox label="To Scan"      value={toScan}                   color={toScan === 0 ? "green" : "orange"} />
                                </div>

                                {/* Buttons */}
                                <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                                    {/* Begin / End Scan */}
                                    <button
                                        onClick={() => { setScanning(!scanning); setLastScan(null); }}
                                        className={cn(
                                            "flex items-center gap-1.5 px-3 h-7 text-[10px] font-black uppercase tracking-widest rounded transition-colors border",
                                            scanning
                                                ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                                                : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                        )}
                                    >
                                        {scanning ? <><StopCircle size={11} /> End Scan</> : <><Play size={11} /> Begin Scan</>}
                                    </button>

                                    {/* Confirm */}
                                    {canCreate && (
                                        <button
                                            onClick={() => setConfirmOpen(true)}
                                            disabled={confirming}
                                            className="flex items-center gap-1.5 px-3 h-7 text-[10px] font-black uppercase tracking-widest rounded transition-colors border bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 disabled:opacity-50"
                                        >
                                            {confirming ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle2 size={11} />}
                                            Confirm
                                        </button>
                                    )}

                                    {/* Supervisor Batch */}
                                    {canDelete && (
                                        <button
                                            onClick={handleBatchScan}
                                            disabled={batching}
                                            className="flex items-center gap-1.5 px-3 h-7 text-[10px] font-black uppercase tracking-widest rounded transition-colors border bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 disabled:opacity-50"
                                        >
                                            {batching ? <Loader2 size={11} className="animate-spin" /> : <ShieldCheck size={11} />}
                                            Batch
                                        </button>
                                    )}

                                    {/* Close AWB */}
                                    <button
                                        onClick={handleCloseAwb}
                                        className="flex items-center gap-1.5 px-3 h-7 text-[10px] font-black uppercase tracking-widest rounded transition-colors border bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                                    >
                                        <RotateCcw size={11} /> Close
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Scan input bar */}
                        {scanning && (
                            <div className="shrink-0 bg-[#374151] px-3 py-2 border-b border-[#4B5563]">
                                <div className="flex items-center gap-3">
                                    <form onSubmit={handleScan} className="flex-1">
                                        <input
                                            ref={scanInputRef}
                                            type="text"
                                            value={scanInput}
                                            onChange={(e) => setScanInput(e.target.value.toUpperCase())}
                                            disabled={toScan <= 0 || processing}
                                            placeholder={toScan <= 0 ? "ALL BOXES RECEIVED ✓" : "Scan barcode..."}
                                            className={cn(
                                                "w-full rounded-xl px-5 py-2.5 text-xl font-black text-center uppercase transition-all focus:outline-none border-2",
                                                toScan <= 0
                                                    ? "bg-green-100 border-green-300 text-green-700 placeholder:text-green-500 cursor-not-allowed"
                                                    : "bg-white border-[#FB7506]/40 focus:border-[#FB7506] placeholder:text-gray-300 text-[#333]"
                                            )}
                                            autoComplete="off"
                                            autoFocus
                                        />
                                    </form>
                                    {processing && <Loader2 size={18} className="animate-spin text-[#FB7506] shrink-0" />}
                                    {lastScan && !processing && (
                                        <div className={cn(
                                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black border shrink-0",
                                            lastScan.ok
                                                ? "bg-green-900/30 text-green-300 border-green-700"
                                                : "bg-red-900/30 text-red-300 border-red-700"
                                        )}>
                                            {lastScan.ok ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                                            <span className="max-w-[200px] truncate">{lastScan.msg}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Tab bar */}
                        <div className="bg-gray-100 border-b border-gray-200 px-2 pt-1.5 flex items-end gap-1 shrink-0 overflow-x-auto">
                            {TABS.map(({ id, icon: Icon, label }) => (
                                <button key={id}
                                    onClick={() => setActiveTab(id)}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest whitespace-nowrap rounded-t-md transition-all border border-b-0 shrink-0",
                                        activeTab === id
                                            ? "bg-white border-gray-200 text-[#374151] shadow-sm"
                                            : "bg-transparent border-transparent text-gray-500 hover:bg-white/60"
                                    )}>
                                    <Icon size={11} />{label}
                                </button>
                            ))}
                            {tabLoading && <Loader2 size={12} className="animate-spin text-gray-400 ml-2 self-center" />}
                        </div>

                        {/* Tab content */}
                        <div className="flex-1 overflow-hidden flex flex-col min-h-0 px-2 pb-2 pt-2 gap-2">

                            {/* PENDING TAB */}
                            {activeTab === "pending" && (
                                <>
                                    <PanelGrid
                                        icon={List}
                                        title="Pending Reception"
                                        recordCount={pendingData.length}
                                        onRefresh={() => loadTabData("pending")}
                                        headerRight={<AuditLogModal recordId={undefined} disabled />}
                                        className={cn("overflow-hidden", selectedLot ? "h-1/2 shrink-0" : "flex-1")}
                                    >
                                        <PanelGridTable>
                                            <PanelGridThead>
                                                <PanelGridTh>Cust.PO</PanelGridTh>
                                                <PanelGridTh>Grower</PanelGridTh>
                                                <PanelGridTh>Box Date</PanelGridTh>
                                                <PanelGridTh>Lot</PanelGridTh>
                                                <PanelGridTh>Product</PanelGridTh>
                                                <PanelGridTh align="right">Box Qty</PanelGridTh>
                                                <PanelGridTh align="right">Confirmed</PanelGridTh>
                                                <PanelGridTh align="right">Scanned</PanelGridTh>
                                            </PanelGridThead>
                                            <PanelGridTbody>
                                                {pendingData.length === 0 && (
                                                    <tr><td colSpan={8} className="p-10 text-center text-gray-400 italic">No pending lots</td></tr>
                                                )}
                                                {pendingData.map((row, i) => (
                                                    <PanelGridTr key={i}
                                                        selected={pendingSelRow === i}
                                                        onClick={() => {
                                                            setPendingSelRow(i);
                                                            setSelectedLot(row);
                                                        }}>
                                                        <PanelGridTd className="font-mono font-bold text-[#FB7506]">{t(row.cporder_no)}</PanelGridTd>
                                                        <PanelGridTd>{t(row.grower)}</PanelGridTd>
                                                        <PanelGridTd className="font-mono text-gray-500">{t(row.box_date)}</PanelGridTd>
                                                        <PanelGridTd className="font-bold text-[#FB7506]">{t(row.lote)}</PanelGridTd>
                                                        <PanelGridTd className="max-w-[180px] truncate" title={t(row.description)}>{t(row.description)}</PanelGridTd>
                                                        <PanelGridTd align="right" className="font-bold">{fmtN(row.total_pieces)}</PanelGridTd>
                                                        <PanelGridTd align="right">{fmtN(row.qty_confirmed)}</PanelGridTd>
                                                        <PanelGridTd align="right" className="font-black text-[#FB7506]">{fmtN(row.read_pieces)}</PanelGridTd>
                                                    </PanelGridTr>
                                                ))}
                                            </PanelGridTbody>
                                        </PanelGridTable>
                                    </PanelGrid>

                                    {/* Delayed boxes sub-panel */}
                                    {selectedLot && (
                                        <PanelGrid
                                            icon={Package}
                                            title={`Delayed Boxes — ${t(selectedLot.lote)}`}
                                            recordCount={delayedData.length}
                                            onRefresh={() => selectedLot?.pkbox_uq && loadDelayed(t(selectedLot.pkbox_uq))}
                                            headerRight={
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => setDelayedModal({ open: true, mode: "add", pkBoxUq: t(selectedLot.pkbox_uq) })}
                                                        className="flex items-center gap-1 px-2.5 h-7 text-[10px] font-black uppercase tracking-widest rounded border bg-[#374151] text-white hover:bg-[#4B5563] transition-colors"
                                                        title="Add delayed box"
                                                    >
                                                        <Plus size={11} /> Add
                                                    </button>
                                                    <AuditLogModal recordId={undefined} disabled />
                                                </div>
                                            }
                                            className="flex-1 min-h-0"
                                        >
                                            {delayedLoading ? (
                                                <div className="flex items-center justify-center p-6 text-gray-400 gap-2">
                                                    <Loader2 size={14} className="animate-spin" /> Loading...
                                                </div>
                                            ) : (
                                                <PanelGridTable>
                                                    <PanelGridThead>
                                                        <PanelGridTh>Reason</PanelGridTh>
                                                        <PanelGridTh align="right">Qty</PanelGridTh>
                                                        <PanelGridTh>Add Date</PanelGridTh>
                                                        <PanelGridTh>Notes</PanelGridTh>
                                                        <PanelGridTh align="center">Actions</PanelGridTh>
                                                    </PanelGridThead>
                                                    <PanelGridTbody>
                                                        {delayedData.length === 0 && (
                                                            <tr><td colSpan={5} className="p-8 text-center text-gray-400 italic">No delayed boxes for this lot</td></tr>
                                                        )}
                                                        {delayedData.map((d, i) => (
                                                            <PanelGridTr key={i}>
                                                                <PanelGridTd>{t(d.reason)}</PanelGridTd>
                                                                <PanelGridTd align="right" className="font-bold">{fmtN(d.qty)}</PanelGridTd>
                                                                <PanelGridTd className="font-mono text-gray-500">{t(d.add_date)}</PanelGridTd>
                                                                <PanelGridTd className="max-w-[200px] truncate" title={t(d.notes)}>{t(d.notes)}</PanelGridTd>
                                                                <PanelGridTd align="center">
                                                                    <div className="flex items-center justify-center gap-1">
                                                                        <button
                                                                            onClick={() => setDelayedModal({
                                                                                open: true,
                                                                                mode: "edit",
                                                                                pkBoxUq: t(selectedLot.pkbox_uq),
                                                                                initial: {
                                                                                    unico:      t(d.unico),
                                                                                    reason_uq:  t(d.reason_uq ?? d.unico),
                                                                                    qty:        Number(d.qty ?? 0),
                                                                                    notes:      t(d.notes),
                                                                                },
                                                                            })}
                                                                            className="p-1 rounded hover:bg-blue-50 text-blue-500 transition-colors"
                                                                            title="Edit"
                                                                        >
                                                                            <Pencil size={12} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteDelayed(t(d.unico))}
                                                                            className="p-1 rounded hover:bg-red-50 text-red-500 transition-colors"
                                                                            title="Delete"
                                                                        >
                                                                            <Trash2 size={12} />
                                                                        </button>
                                                                    </div>
                                                                </PanelGridTd>
                                                            </PanelGridTr>
                                                        ))}
                                                    </PanelGridTbody>
                                                </PanelGridTable>
                                            )}
                                        </PanelGrid>
                                    )}
                                </>
                            )}

                            {/* RECEPTED TAB */}
                            {activeTab === "recepted" && (
                                <PanelGrid
                                    icon={CheckCircle2}
                                    title="Recepted"
                                    recordCount={receptedData.length}
                                    onRefresh={() => loadTabData("recepted")}
                                    headerRight={<AuditLogModal recordId={undefined} disabled />}
                                    className="flex-1"
                                >
                                    <PanelGridTable>
                                        <PanelGridThead>
                                            <PanelGridTh>Packing</PanelGridTh>
                                            <PanelGridTh>Invoice</PanelGridTh>
                                            <PanelGridTh>AWB</PanelGridTh>
                                            <PanelGridTh>Box Date</PanelGridTh>
                                            <PanelGridTh>Grower</PanelGridTh>
                                            <PanelGridTh>Farm</PanelGridTh>
                                            <PanelGridTh>Lot</PanelGridTh>
                                            <PanelGridTh>Product</PanelGridTh>
                                            <PanelGridTh align="right">Total Boxes</PanelGridTh>
                                            <PanelGridTh align="right">Total Pcs</PanelGridTh>
                                            <PanelGridTh align="right">Stock Pcs</PanelGridTh>
                                            <PanelGridTh align="right">Scanned</PanelGridTh>
                                        </PanelGridThead>
                                        <PanelGridTbody>
                                            {receptedData.length === 0 && (
                                                <tr><td colSpan={12} className="p-10 text-center text-gray-400 italic">No recepted lots yet</td></tr>
                                            )}
                                            {receptedData.map((row, i) => (
                                                <PanelGridTr key={i} selected={receptedSelRow === i} onClick={() => setReceptedSelRow(i)}>
                                                    <PanelGridTd className="font-mono font-bold text-[#FB7506]">{t(row.packing_no)}</PanelGridTd>
                                                    <PanelGridTd className="font-bold text-[#FB7506]">{t(row.invoice_no)}</PanelGridTd>
                                                    <PanelGridTd className="font-mono font-bold text-[#FB7506]">{t(row.awbcode)}</PanelGridTd>
                                                    <PanelGridTd className="font-mono text-gray-500">{t(row.box_date)}</PanelGridTd>
                                                    <PanelGridTd>{t(row.grower)}</PanelGridTd>
                                                    <PanelGridTd className="font-bold text-[#FB7506]">{t(row.farm)}</PanelGridTd>
                                                    <PanelGridTd className="font-bold text-[#FB7506]">{t(row.pkbox_uq)}</PanelGridTd>
                                                    <PanelGridTd className="max-w-[160px] truncate" title={t(row.description)}>{t(row.description)}</PanelGridTd>
                                                    <PanelGridTd align="right" className="font-bold">{fmtN(row.total_boxes)}</PanelGridTd>
                                                    <PanelGridTd align="right">{fmtN(row.total_pieces)}</PanelGridTd>
                                                    <PanelGridTd align="right">{fmtN(row.stock_pieces)}</PanelGridTd>
                                                    <PanelGridTd align="right" className="font-black text-[#FB7506]">{fmtN(row.read_pieces)}</PanelGridTd>
                                                </PanelGridTr>
                                            ))}
                                        </PanelGridTbody>
                                    </PanelGridTable>
                                </PanelGrid>
                            )}

                            {/* SCAN LIST TAB */}
                            {activeTab === "scan-list" && (
                                <PanelGrid
                                    icon={AlignJustify}
                                    title="Scan List"
                                    recordCount={scanListData.length}
                                    onRefresh={() => loadTabData("scan-list")}
                                    headerRight={<AuditLogModal recordId={undefined} disabled />}
                                    className="flex-1"
                                >
                                    <PanelGridTable>
                                        <PanelGridThead>
                                            <PanelGridTh>Grower</PanelGridTh>
                                            <PanelGridTh>Farm</PanelGridTh>
                                            <PanelGridTh>AWB</PanelGridTh>
                                            <PanelGridTh>AWB Date</PanelGridTh>
                                            <PanelGridTh>Lot</PanelGridTh>
                                            <PanelGridTh>Product</PanelGridTh>
                                            <PanelGridTh>Case</PanelGridTh>
                                            <PanelGridTh align="right">Box Qty</PanelGridTh>
                                            <PanelGridTh align="right">Box No</PanelGridTh>
                                            <PanelGridTh align="right">Qty In</PanelGridTh>
                                        </PanelGridThead>
                                        <PanelGridTbody>
                                            {scanListData.length === 0 && (
                                                <tr><td colSpan={10} className="p-10 text-center text-gray-400 italic">No scans yet</td></tr>
                                            )}
                                            {scanListData.map((row, i) => (
                                                <PanelGridTr key={i} selected={scanListSelRow === i} onClick={() => setScanListSelRow(i)}>
                                                    <PanelGridTd>{t(row.grower)}</PanelGridTd>
                                                    <PanelGridTd className="font-bold text-[#FB7506]">{t(row.farm)}</PanelGridTd>
                                                    <PanelGridTd className="font-mono font-bold text-[#FB7506]">{t(row.awbcode)}</PanelGridTd>
                                                    <PanelGridTd className="font-mono text-gray-500">{t(row.awbdate)}</PanelGridTd>
                                                    <PanelGridTd className="font-bold text-[#FB7506]">{t(row.lote)}</PanelGridTd>
                                                    <PanelGridTd className="max-w-[160px] truncate" title={t(row.description)}>{t(row.description)}</PanelGridTd>
                                                    <PanelGridTd>{t(row.case_sh)}</PanelGridTd>
                                                    <PanelGridTd align="right" className="font-bold">{fmtN(row.box_qty)}</PanelGridTd>
                                                    <PanelGridTd align="right">{fmtN(row.box_no)}</PanelGridTd>
                                                    <PanelGridTd align="right" className="font-black text-[#FB7506]">{fmtN(row.qty_in)}</PanelGridTd>
                                                </PanelGridTr>
                                            ))}
                                        </PanelGridTbody>
                                    </PanelGridTable>
                                </PanelGrid>
                            )}

                            {/* NO SCAN TAB */}
                            {activeTab === "no-scan" && (
                                <PanelGrid
                                    icon={XCircle}
                                    title="No Scan List"
                                    recordCount={noScanData.length}
                                    onRefresh={() => loadTabData("no-scan")}
                                    headerRight={<AuditLogModal recordId={undefined} disabled />}
                                    className="flex-1"
                                >
                                    <PanelGridTable>
                                        <PanelGridThead>
                                            <PanelGridTh>Grower</PanelGridTh>
                                            <PanelGridTh>Farm</PanelGridTh>
                                            <PanelGridTh>AWB</PanelGridTh>
                                            <PanelGridTh>AWB Date</PanelGridTh>
                                            <PanelGridTh>Lot</PanelGridTh>
                                            <PanelGridTh>Product</PanelGridTh>
                                            <PanelGridTh>Case</PanelGridTh>
                                            <PanelGridTh align="right">Box Qty</PanelGridTh>
                                            <PanelGridTh align="right">Box No</PanelGridTh>
                                            <PanelGridTh align="right">Qty In</PanelGridTh>
                                        </PanelGridThead>
                                        <PanelGridTbody>
                                            {noScanData.length === 0 && (
                                                <tr><td colSpan={10} className="p-10 text-center text-gray-400 italic">No unscanned boxes</td></tr>
                                            )}
                                            {noScanData.map((row, i) => (
                                                <PanelGridTr key={i} selected={noScanSelRow === i} onClick={() => setNoScanSelRow(i)}>
                                                    <PanelGridTd>{t(row.grower)}</PanelGridTd>
                                                    <PanelGridTd className="font-bold text-[#FB7506]">{t(row.farm)}</PanelGridTd>
                                                    <PanelGridTd className="font-mono font-bold text-[#FB7506]">{t(row.awbcode)}</PanelGridTd>
                                                    <PanelGridTd className="font-mono text-gray-500">{t(row.awbdate)}</PanelGridTd>
                                                    <PanelGridTd className="font-bold text-[#FB7506]">{t(row.lote)}</PanelGridTd>
                                                    <PanelGridTd className="max-w-[160px] truncate" title={t(row.description)}>{t(row.description)}</PanelGridTd>
                                                    <PanelGridTd>{t(row.case_sh)}</PanelGridTd>
                                                    <PanelGridTd align="right" className="font-bold">{fmtN(row.box_qty)}</PanelGridTd>
                                                    <PanelGridTd align="right">{fmtN(row.box_no)}</PanelGridTd>
                                                    <PanelGridTd align="right">{fmtN(row.qty_in)}</PanelGridTd>
                                                </PanelGridTr>
                                            ))}
                                        </PanelGridTbody>
                                    </PanelGridTable>
                                </PanelGrid>
                            )}

                            {/* INVOICES TAB */}
                            {activeTab === "invoices" && (
                                <PanelGrid
                                    icon={FileText}
                                    title="Invoices"
                                    recordCount={invoiceData.length}
                                    onRefresh={() => loadTabData("invoices")}
                                    headerRight={<AuditLogModal recordId={undefined} disabled />}
                                    className="flex-1"
                                >
                                    <PanelGridTable>
                                        <PanelGridThead>
                                            <PanelGridTh>AWB Date</PanelGridTh>
                                            <PanelGridTh>Grower</PanelGridTh>
                                            <PanelGridTh>Lot</PanelGridTh>
                                            <PanelGridTh>Customer</PanelGridTh>
                                            <PanelGridTh>Invoice</PanelGridTh>
                                            <PanelGridTh>Inv Date</PanelGridTh>
                                            <PanelGridTh>Status</PanelGridTh>
                                            <PanelGridTh>Product</PanelGridTh>
                                            <PanelGridTh align="right">Qty</PanelGridTh>
                                            <PanelGridTh>Carrier</PanelGridTh>
                                        </PanelGridThead>
                                        <PanelGridTbody>
                                            {invoiceData.length === 0 && (
                                                <tr><td colSpan={10} className="p-10 text-center text-gray-400 italic">No invoices found</td></tr>
                                            )}
                                            {invoiceData.map((row, i) => (
                                                <PanelGridTr key={i} selected={invoiceSelRow === i} onClick={() => setInvoiceSelRow(i)}>
                                                    <PanelGridTd className="font-mono text-gray-500">{t(row.awbdate)}</PanelGridTd>
                                                    <PanelGridTd>{t(row.grower)}</PanelGridTd>
                                                    <PanelGridTd className="font-bold text-[#FB7506]">{t(row.lote)}</PanelGridTd>
                                                    <PanelGridTd>{t(row.customer)}</PanelGridTd>
                                                    <PanelGridTd className="font-bold text-[#FB7506]">{t(row.invoice_no)}</PanelGridTd>
                                                    <PanelGridTd className="font-mono text-gray-500">{t(row.invoice_date)}</PanelGridTd>
                                                    <PanelGridTd>
                                                        <span className={cn(
                                                            "px-1.5 py-0.5 rounded text-[9px] font-black uppercase",
                                                            t(row.invoice_status).toUpperCase() === "PAID" ? "bg-green-100 text-green-700" :
                                                            "bg-yellow-100 text-yellow-700"
                                                        )}>
                                                            {t(row.invoice_status)}
                                                        </span>
                                                    </PanelGridTd>
                                                    <PanelGridTd className="max-w-[160px] truncate" title={t(row.description)}>{t(row.description)}</PanelGridTd>
                                                    <PanelGridTd align="right" className="font-bold">{fmtN(row.invoice_pieces)}</PanelGridTd>
                                                    <PanelGridTd>{t(row.carrier)}</PanelGridTd>
                                                </PanelGridTr>
                                            ))}
                                        </PanelGridTbody>
                                    </PanelGridTable>
                                </PanelGrid>
                            )}
                        </div>
                    </>
                )}
            </main>

            {/* Confirm dialog */}
            {confirmOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[300] p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden">
                        <div className="bg-[#374151] text-white px-4 py-3 flex items-center gap-2">
                            <CheckCircle2 size={14} className="text-[#FB7506]" />
                            <span className="font-black text-[11px] uppercase tracking-widest">Confirm AWB Reception</span>
                        </div>
                        <div className="p-5 text-sm text-gray-700">
                            <p>Confirm reception of AWB <span className="font-black text-[#FB7506]">{activeAwb}</span>?</p>
                            {toScan > 0 && (
                                <p className="mt-2 text-yellow-600 font-bold text-xs">
                                    Warning: {toScan} boxes have not been scanned yet.
                                </p>
                            )}
                        </div>
                        <div className="bg-[#F5F3F3] border-t border-[#DBD9D9] px-4 py-3 flex justify-end gap-2">
                            <button onClick={() => setConfirmOpen(false)}
                                className="px-4 py-1.5 rounded border border-[#DBD9D9] text-xs font-black uppercase text-gray-600 hover:bg-gray-200 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleConfirm} disabled={confirming}
                                className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase transition-colors flex items-center gap-1.5 disabled:opacity-50">
                                {confirming && <Loader2 size={11} className="animate-spin" />}
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delayed box modal */}
            {delayedModal.open && (
                <DelayedBoxModal
                    mode={delayedModal.mode}
                    pkBoxUq={delayedModal.pkBoxUq}
                    initial={delayedModal.initial}
                    onClose={() => setDelayedModal((p) => ({ ...p, open: false }))}
                    onSaved={() => {
                        if (selectedLot?.pkbox_uq) loadDelayed(t(selectedLot.pkbox_uq));
                    }}
                />
            )}

            <AppFooter areaLabel="Warehouse" />
        </div>
    );
}
