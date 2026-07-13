"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSession }       from "next-auth/react";
import { useRouter }        from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    RefreshCcw, Loader2, Scan,
    Check, X, Trash2, Keyboard, MapPin,
    Clock, Plane, Package, AlertTriangle, TrendingDown, BarChart2, CheckCircle,
} from "lucide-react";
import { cn }    from "@/lib/utils";
import { toast } from "sonner";
import { usePagePermissions } from "@/lib/permissions";
import AppHeader from "@/components/layout/AppHeader";
import AppFooter from "@/components/layout/AppFooter";
import { useScanStore, type ScanTabId } from "@/store/useScanStore";
import PanelGrid from "@/components/ui/PanelGrid";
import { PanelGridTable, PanelGridThead, PanelGridTh, PanelGridTbody, PanelGridTr, PanelGridTd } from "@/components/ui/PanelGridTable";
import { AuditLogModal } from "@/components/AuditLogModal";

const EMPTY_ARR: any[] = [];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const t      = (v: any) => String(v ?? "").trim();
const fmtN   = (v: any) => { const n = Number(v ?? 0); return isNaN(n) ? "—" : n.toLocaleString("en-US"); };
const fmtLot = (v: any) => String(v ?? "");
const fmtDate = (v: any) => {
    if (!v) return "";
    const s = t(v);
    const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso) return new Date(+iso[1], +iso[2]-1, +iso[3]).toLocaleDateString("en-US");
    const d = new Date(s); return isNaN(d.getTime()) ? s : d.toLocaleDateString("en-US");
};

const isRack = (s: string) => s.trim().length > 0 && s.trim().length <= 6;

function StatBox({ label, value, color = "gray" }: { label: string; value: any; color?: string }) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center rounded px-3 py-1.5 min-w-[80px] shrink-0",
            color === "orange" && "bg-[#FB7506]/10 border border-[#FB7506]/30",
            color === "green"  && "bg-green-50 border border-green-200",
            color === "blue"   && "bg-blue-50 border border-blue-200",
            color === "gray"   && "bg-gray-100 border border-gray-200",
            color === "red"    && "bg-red-50 border border-red-200",
        )}>
            <span className={cn("text-[16px] font-black tabular-nums leading-none",
                color === "orange" && "text-[#FB7506]",
                color === "green"  && "text-green-700",
                color === "blue"   && "text-blue-700",
                color === "gray"   && "text-gray-700",
                color === "red"    && "text-red-600",
            )}>{fmtN(value)}</span>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide text-center mt-0.5">{label}</span>
        </div>
    );
}

const TABS = [
    { id: "pending",    label: "Pending Scan",    color: "text-red-600",    view: "pending" },
    { id: "in-transit", label: "In Transit",      color: "text-blue-600",   view: "in-transit" },
    { id: "scanned-eq", label: "Scan = Physical", color: "text-green-600",  view: "scanned-equal" },
    { id: "scanned-bx", label: "Scanned Boxes",   color: "text-gray-700",   view: "scanned-boxes" },
    { id: "sys-not",    label: "Sys ≠ Phy",       color: "text-purple-600", view: "system-not-physical" },
    { id: "sys-less",   label: "Sys < Phy",       color: "text-orange-600", view: "system-less-physical" },
    { id: "sys-eq",     label: "Sys = Phy",       color: "text-teal-600",   view: "system-equal-physical" },
] as const;
const PAGE_SIZE = 50;

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PhysicalScanPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { canDelete } = usePagePermissions("scan");

    const { currentRack, setCurrentRack, activeTab, setActiveTab, viewKey, refresh: refreshAll } = useScanStore();

    const [scanning,       setScanning]      = useState(false);
    const [lastScan,       setLastScan]      = useState<{ ok: boolean; msg: string; warn?: boolean } | null>(null);
    const [pendingPage,    setPendingPage]   = useState(1);
    const [pendingRows,    setPendingRows]   = useState<any[]>([]);
    const [pendingTotal,   setPendingTotal]  = useState(0);
    const [pendingLoading, setPendingLoading]= useState(false);
    const [hasMore,        setHasMore]       = useState(true);
    const qc = useQueryClient();

    // Row selection per tab
    const [pendingSelRow, setPendingSelRow] = useState<number | null>(null);
    const [transitSelRow, setTransitSelRow] = useState<number | null>(null);
    const [scannedSelRow, setScannedSelRow] = useState<number | null>(null);
    const [sysNotSelRow,  setSysNotSelRow]  = useState<number | null>(null);
    const [viewSelRow,    setViewSelRow]    = useState<number | null>(null);

    // Sys ≠ Phy — paginated
    const [sysNotPage,    setSysNotPage]    = useState(1);
    const [sysNotRows,    setSysNotRows]    = useState<any[]>([]);
    const [sysNotLoading, setSysNotLoading] = useState(false);
    const [sysNotHasMore, setSysNotHasMore] = useState(true);
    const sysNotSentinel = useRef<HTMLDivElement>(null);

    // In Transit — paginated
    const [transitPage,    setTransitPage]    = useState(1);
    const [transitRows,    setTransitRows]    = useState<any[]>([]);
    const [transitLoading, setTransitLoading] = useState(false);
    const [transitHasMore, setTransitHasMore] = useState(true);
    const transitSentinel = useRef<HTMLDivElement>(null);

    // Scanned Boxes — paginated
    const [scannedPage,    setScannedPage]    = useState(1);
    const [scannedRows,    setScannedRows]    = useState<any[]>([]);
    const [scannedLoading, setScannedLoading] = useState(false);
    const [scannedHasMore, setScannedHasMore] = useState(true);
    const scannedSentinel = useRef<HTMLDivElement>(null);

    // Global scanner overlay
    const [scanBuffer,   setScanBuffer]   = useState("");
    const [manualActive, setManualActive] = useState(false);
    const scanBufferRef  = useRef("");
    const manualInputRef = useRef<HTMLInputElement>(null);
    const sentinelRef    = useRef<HTMLDivElement>(null);

    const setScanBuf = (v: string | ((p: string) => string)) => {
        const next = typeof v === "function" ? v(scanBufferRef.current) : v;
        scanBufferRef.current = next;
        setScanBuffer(next);
    };

    // ── Totals ────────────────────────────────────────────────────────────────
    const { data: totals } = useQuery({
        queryKey: ["scan-totals", viewKey],
        queryFn:  async () => { const r = await fetch("/api/physical-scan/totals"); return r.json(); },
        refetchInterval: 30000,
    });

    // ── Pending (paginated + infinite scroll) ─────────────────────────────────
    const loadPending = useCallback(async (page: number, reset: boolean) => {
        setPendingLoading(true);
        try {
            const r = await fetch(`/api/physical-scan/ready-to-scan?page=${page}&size=${PAGE_SIZE}`);
            const j = await r.json();
            const rows: any[] = j.rows ?? [];
            setPendingTotal(j.total ?? 0);
            setPendingRows(prev => reset ? rows : [...prev, ...rows]);
            setHasMore(rows.length === PAGE_SIZE);
            setPendingPage(page);
        } catch { /* ignore */ }
        finally { setPendingLoading(false); }
    }, []);

    useEffect(() => { loadPending(1, true); }, [loadPending, viewKey]);

    // ── Sys ≠ Phy (paginated) ─────────────────────────────────────────────────
    const loadSysNot = useCallback(async (page: number, reset: boolean) => {
        setSysNotLoading(true);
        try {
            const r = await fetch(`/api/physical-scan/sys-not-physical?page=${page}&size=${PAGE_SIZE}`);
            const j = await r.json();
            const rows: any[] = j.rows ?? [];
            setSysNotRows(prev => reset ? rows : [...prev, ...rows]);
            setSysNotHasMore(rows.length === PAGE_SIZE);
            setSysNotPage(page);
        } catch { /* ignore */ }
        finally { setSysNotLoading(false); }
    }, []);

    useEffect(() => {
        if (activeTab === "sys-not") loadSysNot(1, true);
    }, [activeTab, loadSysNot, viewKey]);

    useEffect(() => {
        if (activeTab !== "sys-not") return;
        const el = sysNotSentinel.current;
        if (!el) return;
        const obs = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && !sysNotLoading && sysNotHasMore)
                loadSysNot(sysNotPage + 1, false);
        }, { threshold: 0.1 });
        obs.observe(el);
        return () => obs.disconnect();
    }, [activeTab, sysNotLoading, sysNotHasMore, sysNotPage, loadSysNot]);

    // ── In Transit (paginated) ─────────────────────────────────────────────────
    const loadTransit = useCallback(async (page: number, reset: boolean) => {
        setTransitLoading(true);
        try {
            const r = await fetch(`/api/physical-scan/in-transit?page=${page}&size=${PAGE_SIZE}`);
            const j = await r.json();
            const rows: any[] = j.rows ?? [];
            setTransitRows(prev => reset ? rows : [...prev, ...rows]);
            setTransitHasMore(rows.length === PAGE_SIZE);
            setTransitPage(page);
        } catch { /* ignore */ }
        finally { setTransitLoading(false); }
    }, []);

    useEffect(() => {
        if (activeTab === "in-transit") loadTransit(1, true);
    }, [activeTab, loadTransit, viewKey]);

    useEffect(() => {
        if (activeTab !== "in-transit") return;
        const el = transitSentinel.current;
        if (!el) return;
        const obs = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && !transitLoading && transitHasMore)
                loadTransit(transitPage + 1, false);
        }, { threshold: 0.1 });
        obs.observe(el);
        return () => obs.disconnect();
    }, [activeTab, transitLoading, transitHasMore, transitPage, loadTransit]);

    // ── Scanned Boxes (paginated) ──────────────────────────────────────────────
    const loadScanned = useCallback(async (page: number, reset: boolean) => {
        setScannedLoading(true);
        try {
            const r = await fetch(`/api/physical-scan/scanned-boxes?page=${page}&size=${PAGE_SIZE}`);
            const j = await r.json();
            const rows: any[] = j.rows ?? [];
            setScannedRows(prev => reset ? rows : [...prev, ...rows]);
            setScannedHasMore(rows.length === PAGE_SIZE);
            setScannedPage(page);
        } catch { /* ignore */ }
        finally { setScannedLoading(false); }
    }, []);

    useEffect(() => {
        if (activeTab === "scanned-bx") loadScanned(1, true);
    }, [activeTab, loadScanned, viewKey]);

    useEffect(() => {
        if (activeTab !== "scanned-bx") return;
        const el = scannedSentinel.current;
        if (!el) return;
        const obs = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && !scannedLoading && scannedHasMore)
                loadScanned(scannedPage + 1, false);
        }, { threshold: 0.1 });
        obs.observe(el);
        return () => obs.disconnect();
    }, [activeTab, scannedLoading, scannedHasMore, scannedPage, loadScanned]);

    useEffect(() => {
        if (activeTab !== "pending") return;
        const el = sentinelRef.current;
        if (!el) return;
        const obs = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && !pendingLoading && hasMore)
                loadPending(pendingPage + 1, false);
        }, { threshold: 0.1 });
        obs.observe(el);
        return () => obs.disconnect();
    }, [activeTab, pendingLoading, hasMore, pendingPage, loadPending]);

    // ── Other tab views ───────────────────────────────────────────────────────
    const activeTabDef = TABS.find(tab => tab.id === activeTab)!;
    const { data: viewRows = EMPTY_ARR, isFetching: loadingView } = useQuery({
        queryKey: ["scan-view", activeTabDef.view, viewKey],
        enabled:  activeTab !== "pending" && activeTab !== "in-transit" && activeTab !== "scanned-bx" && activeTab !== "sys-not",
        queryFn:  async () => {
            const r = await fetch(`/api/physical-scan/views?v=${activeTabDef.view}`);
            const j = await r.json();
            return Array.isArray(j) ? j : [];
        },
    });

    // ── Optimistic row update ─────────────────────────────────────────────────
    const applyOptimisticScan = useCallback((code: string) => {
        if (code.length < 8) return;
        const farm = code.slice(0, 3).toUpperCase();
        const lote = parseInt(code.slice(3, 8), 10);
        const lotStr = String(lote).padStart(5, "0");
        setPendingRows(prev => prev.map(row => {
            if (t(row.farm).toUpperCase() === farm && Number(row.lote) === lote) {
                const newQPI = Number(row.QPI ?? 0) + 1;
                return { ...row, QPI: newQPI, Diff: Number(row.stock ?? 0) - newQPI, barcode: row.barcode || `${farm}${lotStr}` };
            }
            return row;
        }));
        qc.setQueryData(["scan-totals", viewKey], (old: any) => old ? {
            ...old,
            Total_QPI:     (old.Total_QPI     ?? 0) + 1,
            Total_To_read: (old.Total_To_read  ?? 0) - 1,
        } : old);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [qc, viewKey]);

    // ── Core scan logic ───────────────────────────────────────────────────────
    const processScan = useCallback(async (raw: string) => {
        const code = raw.trim().toUpperCase();
        if (!code) return;
        if (isRack(code)) {
            setCurrentRack(code);
            setLastScan({ ok: true, msg: `Rack → ${code}` });
            toast.success(`Rack set: ${code}`);
            return;
        }
        setScanning(true);
        try {
            const r = await fetch("/api/physical-scan/scan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ compuesto: code, rack: currentRack }),
            });
            const j = await r.json();
            if (!r.ok || !j.success) {
                const msg = j.error || "Scan failed";
                setLastScan({ ok: false, msg });
                toast.error(msg);
            } else if (j.warning) {
                setLastScan({ ok: true, msg: j.warning, warn: true });
                toast.warning(j.warning);
            } else {
                setLastScan({ ok: true, msg: `✓ ${code}` });
                toast.success(`Scanned: ${code}`);
                applyOptimisticScan(code);
            }
        } catch (e: any) {
            setLastScan({ ok: false, msg: e.message });
            toast.error(e.message);
        } finally {
            setScanning(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentRack, applyOptimisticScan]);

    // ── Global keyboard capture ───────────────────────────────────────────────
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (manualInputRef.current && document.activeElement === manualInputRef.current) return;
            const tag = (e.target as HTMLElement).tagName;
            if ((tag === "INPUT" || tag === "TEXTAREA") && document.activeElement !== manualInputRef.current) return;
            if (e.ctrlKey || e.altKey || e.metaKey) return;
            if (e.key === "Escape") { setScanBuf(""); setManualActive(false); return; }
            if (e.key === "Backspace") { e.preventDefault(); setScanBuf(p => p.slice(0, -1)); return; }
            if (e.key === "Enter") {
                const buf = scanBufferRef.current.trim();
                if (buf) { processScan(buf); setScanBuf(""); }
                return;
            }
            if (e.key.length === 1) { e.preventDefault(); setScanBuf(p => p + e.key.toUpperCase()); }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [processScan]);

    const handleManualSubmit = () => {
        const val = (manualInputRef.current?.value || "").trim();
        if (val) { processScan(val); if (manualInputRef.current) manualInputRef.current.value = ""; }
    };

    const handleDeleteAll = () => {
        toast("Delete ALL scanned records? This cannot be undone.", {
            duration: 10000,
            action: { label: "Delete All", onClick: async () => {
                try {
                    const r = await fetch("/api/physical-scan/scan", { method: "DELETE" });
                    const j = await r.json();
                    if (!r.ok || !j.success) throw new Error(j.error || "Failed");
                    toast.success("All scanned records deleted");
                    refreshAll();
                } catch (e: any) { toast.error(e.message); }
            }},
            cancel: { label: "Cancel", onClick: () => {} },
        });
    };

    if (status === "loading") return null;
    if (status === "unauthenticated") { router.push("/login"); return null; }

    const bufferIsRack = scanBuffer.length > 0 && isRack(scanBuffer);

    return (
        <div className="flex flex-col h-[100dvh] bg-[#f4f6f8] overflow-hidden font-sans text-[#333]">
            <AppHeader title="Physical Inventory Scan" icon={Scan} />
            <main className="flex-1 overflow-hidden flex flex-col min-h-0">

                {/* ── Stats bar ────────────────────────────────────────────────── */}
                <div className="bg-[#F5F3F3] border-b border-[#DBD9D9] px-3 py-2 shrink-0 overflow-x-auto">
                    <div className="flex items-center gap-2 min-w-max">
                        <StatBox label="Sys Stock"   value={totals?.Total_stock}     color="gray"   />
                        <StatBox label="Scanned Pcs" value={totals?.Total_stock_QPI} color="green"  />
                        <StatBox label="To Scan Pcs" value={totals?.Total_Stock_TO}  color="red"    />
                        <div className="w-px h-10 bg-gray-200 mx-1" />
                        <StatBox label="Ready Boxes" value={totals?.Total_ready}     color="gray"   />
                        <StatBox label="Box Scanned" value={totals?.Total_QPI}       color="blue"   />
                        <StatBox label="Box To Read" value={totals?.Total_To_read}   color="orange" />
                        <div className="w-px h-10 bg-gray-200 mx-1" />
                        <StatBox label="In Transit"  value={totals?.total_flight}    color="gray"   />
                        <StatBox label="Scan ND"     value={totals?.Total_QPI_ND}    color="blue"   />
                        <StatBox label="To Read ND"  value={totals?.Total_To_ND}     color="orange" />
                        <button onClick={refreshAll}
                            className="ml-2 flex items-center gap-1 px-2 py-1 text-[10px] font-black text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded border border-gray-200 shrink-0">
                            <RefreshCcw size={10} /> Refresh
                        </button>
                    </div>
                </div>

                {/* ── Scan control bar ─────────────────────────────────────────── */}
                <div className="bg-[#F5F3F3] border-b border-[#DBD9D9] px-3 py-2 flex flex-wrap items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded border border-gray-200 shrink-0">
                        <MapPin size={11} className="text-[#FB7506] shrink-0" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Rack:</span>
                        <span className="text-[12px] font-black font-mono text-gray-800">{currentRack}</span>
                    </div>
                    {lastScan && (
                        <div className={cn(
                            "flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-bold max-w-xs",
                            lastScan.ok && !lastScan.warn ? "bg-green-100 text-green-700 border border-green-200" :
                            lastScan.ok && lastScan.warn  ? "bg-orange-100 text-orange-700 border border-orange-200" :
                            "bg-red-100 text-red-700 border border-red-200"
                        )}>
                            {lastScan.ok ? <Check size={11} className="shrink-0" /> : <X size={11} className="shrink-0" />}
                            <span className="truncate">{lastScan.msg}</span>
                        </div>
                    )}
                    {scanning && <Loader2 size={14} className="animate-spin text-[#FB7506] shrink-0" />}
                    <button onClick={() => { setManualActive(a => !a); setTimeout(() => manualInputRef.current?.focus(), 50); }}
                        className={cn(
                            "ml-auto flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded transition-all shrink-0",
                            manualActive ? "bg-[#374151] text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-200"
                        )}>
                        <Keyboard size={11} /> Manual Scan
                    </button>
                    {canDelete && (
                        <button onClick={handleDeleteAll}
                            className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-black text-white bg-red-600 hover:bg-red-500 rounded transition-all shrink-0">
                            <Trash2 size={10} /> Delete All
                        </button>
                    )}
                </div>

                {/* ── Manual input ──────────────────────────────────────────────── */}
                {manualActive && (
                    <div className="bg-[#374151] px-4 py-2.5 flex items-center gap-3 shrink-0">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest shrink-0">Manual</span>
                        <input ref={manualInputRef}
                            onKeyDown={e => {
                                if (e.key === "Enter") { e.preventDefault(); handleManualSubmit(); }
                                if (e.key === "Escape") { setManualActive(false); }
                            }}
                            placeholder="Type barcode or rack code, then Enter..."
                            className="flex-1 bg-white/10 text-white font-mono text-[13px] font-bold rounded px-3 py-1.5 outline-none border border-white/20 focus:border-[#FB7506] placeholder-white/30 uppercase tracking-wider"
                            autoComplete="off" spellCheck={false}
                            onChange={e => { e.target.value = e.target.value.toUpperCase(); }}
                        />
                        <button onClick={handleManualSubmit}
                            className="px-3 py-1.5 text-[10px] font-black text-white bg-[#FB7506] hover:bg-orange-500 rounded transition-all shrink-0 flex items-center gap-1">
                            <Scan size={11} /> Scan
                        </button>
                        <button onClick={() => setManualActive(false)} className="text-white/50 hover:text-white">
                            <X size={14} />
                        </button>
                    </div>
                )}

                {/* ── Tabs ──────────────────────────────────────────────────────── */}
                <div className="bg-gray-100 border-b border-gray-200 px-2 pt-1.5 flex items-end gap-1 overflow-x-auto shrink-0">
                    {TABS.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "px-3 py-1.5 text-[10px] font-black uppercase tracking-widest whitespace-nowrap rounded-t-md transition-all border border-b-0",
                                activeTab === tab.id
                                    ? `bg-white border-gray-200 ${tab.color} shadow-sm`
                                    : "bg-transparent border-transparent text-gray-500 hover:bg-white/60 hover:text-gray-700"
                            )}
                        >{tab.label}</button>
                    ))}
                    {(activeTab === "scanned-eq" || activeTab === "sys-less" || activeTab === "sys-eq") && loadingView &&
                        <Loader2 size={11} className="animate-spin text-gray-400 ml-2 shrink-0" />}
                    <span className="ml-auto text-[10px] text-gray-400 font-bold px-2 shrink-0">
                        {activeTab === "pending"    ? `${pendingRows.length}/${pendingTotal}` :
                         activeTab === "sys-not"    ? `${sysNotRows.length}${sysNotHasMore ? "+" : ""}` :
                         activeTab === "in-transit" ? `${transitRows.length}${transitHasMore ? "+" : ""}` :
                         activeTab === "scanned-bx" ? `${scannedRows.length}${scannedHasMore ? "+" : ""}` :
                         `${viewRows.length}`}
                    </span>
                </div>

                {/* ── Grid area ─────────────────────────────────────────────────── */}
                <div className="flex-1 overflow-hidden px-2 pb-2 pt-2 min-h-0">

                    {/* Pending Scan */}
                    {activeTab === "pending" && (
                        <PanelGrid icon={Clock} title="Pending Scan"
                            recordCount={`${pendingRows.length}/${pendingTotal}`}
                            onRefresh={refreshAll} refreshing={pendingLoading && pendingPage === 1}
                            headerRight={<AuditLogModal recordId={t(pendingRows[pendingSelRow ?? -1]?.unico)} disabled={pendingSelRow === null} />}
                            className="h-full">
                            <PanelGridTable>
                                <PanelGridThead>
                                    <PanelGridTh>Barcode</PanelGridTh><PanelGridTh>Farm</PanelGridTh><PanelGridTh>AWB</PanelGridTh>
                                    <PanelGridTh align="right">Lot</PanelGridTh>
                                    <PanelGridTh align="right">Box Qty</PanelGridTh>
                                    <PanelGridTh align="right">Sold</PanelGridTh>
                                    <PanelGridTh align="right">Stock Sys</PanelGridTh>
                                    <PanelGridTh align="right">Open Inv</PanelGridTh>
                                    <PanelGridTh align="right">Available</PanelGridTh>
                                    <PanelGridTh align="right">Scanned</PanelGridTh>
                                    <PanelGridTh align="right">Diff</PanelGridTh>
                                    <PanelGridTh>Ship Date</PanelGridTh><PanelGridTh>Avail Date</PanelGridTh><PanelGridTh>Product</PanelGridTh>
                                </PanelGridThead>
                                <PanelGridTbody>
                                    {pendingLoading && pendingPage === 1 && (
                                        <tr><td colSpan={14} className="p-8 text-center text-gray-400 italic text-sm">
                                            <Loader2 size={14} className="animate-spin inline mr-2" />Loading...
                                        </td></tr>
                                    )}
                                    {pendingRows.map((r, i) => {
                                        const diff = Number(r.Diff ?? r.diff ?? 0);
                                        return (
                                            <PanelGridTr key={i} selected={pendingSelRow === i} onClick={() => setPendingSelRow(i)}>
                                                <PanelGridTd className="font-mono font-bold text-[#FB7506]">{t(r.barcode)}</PanelGridTd>
                                                <PanelGridTd className="font-bold text-[#FB7506]">{t(r.farm)}</PanelGridTd>
                                                <PanelGridTd className="font-mono font-bold text-[#FB7506]">{t(r.awbcode)}</PanelGridTd>
                                                <PanelGridTd align="right" className="font-bold text-[#FB7506]">{fmtLot(r.lote)}</PanelGridTd>
                                                <PanelGridTd align="right" className="font-semibold">{fmtN(r.box_qty)}</PanelGridTd>
                                                <PanelGridTd align="right">{fmtN(r.qty_sale)}</PanelGridTd>
                                                <PanelGridTd align="right">{fmtN(r.stock)}</PanelGridTd>
                                                <PanelGridTd align="right">{fmtN(r.OBox)}</PanelGridTd>
                                                <PanelGridTd align="right">{fmtN(r.available)}</PanelGridTd>
                                                <PanelGridTd align="right" className="font-bold text-green-700">{fmtN(r.QPI)}</PanelGridTd>
                                                <PanelGridTd align="right" className={cn("font-black", diff < 0 ? "text-red-600" : diff > 0 ? "text-orange-600" : "text-green-600")}>{diff}</PanelGridTd>
                                                <PanelGridTd className="text-gray-500">{t(r.Grower_Ship_date)}</PanelGridTd>
                                                <PanelGridTd className="text-gray-500">{t(r.Avail_date)}</PanelGridTd>
                                                <PanelGridTd className="max-w-[200px] truncate">{t(r.description)}</PanelGridTd>
                                            </PanelGridTr>
                                        );
                                    })}
                                    {!pendingLoading && pendingRows.length === 0 && (
                                        <tr><td colSpan={14} className="p-10 text-center text-gray-400 italic">No pending lots</td></tr>
                                    )}
                                    <tr><td colSpan={14}>
                                        <div ref={sentinelRef} className="flex items-center justify-center py-3 text-[10px] text-gray-400">
                                            {pendingLoading && pendingPage > 1 && <><Loader2 size={12} className="animate-spin mr-2" />Loading more...</>}
                                            {!pendingLoading && !hasMore && pendingRows.length > 0 && <span className="italic">All {pendingRows.length} records loaded</span>}
                                        </div>
                                    </td></tr>
                                </PanelGridTbody>
                            </PanelGridTable>
                        </PanelGrid>
                    )}

                    {/* In Transit */}
                    {activeTab === "in-transit" && (
                        <PanelGrid icon={Plane} title="In Transit"
                            recordCount={`${transitRows.length}${transitHasMore ? "+" : ""}`}
                            onRefresh={refreshAll} refreshing={transitLoading && transitPage === 1}
                            headerRight={<AuditLogModal recordId={undefined} disabled />}
                            className="h-full">
                            <PanelGridTable>
                                <PanelGridThead>
                                    <PanelGridTh>Barcode</PanelGridTh><PanelGridTh>Farm</PanelGridTh><PanelGridTh>AWB</PanelGridTh>
                                    <PanelGridTh align="right">Lot</PanelGridTh>
                                    <PanelGridTh align="right">Box Qty</PanelGridTh>
                                    <PanelGridTh align="right">Sold</PanelGridTh>
                                    <PanelGridTh align="right">Stock Sys</PanelGridTh>
                                    <PanelGridTh align="right">Open Inv</PanelGridTh>
                                    <PanelGridTh align="right">Available</PanelGridTh>
                                    <PanelGridTh align="right">Scanned</PanelGridTh>
                                    <PanelGridTh>Ship Date</PanelGridTh><PanelGridTh>Avail Date</PanelGridTh><PanelGridTh>Product</PanelGridTh>
                                </PanelGridThead>
                                <PanelGridTbody>
                                    {transitLoading && transitPage === 1 && (
                                        <tr><td colSpan={13} className="p-8 text-center text-gray-400 italic">
                                            <Loader2 size={14} className="animate-spin inline mr-2" />Loading...
                                        </td></tr>
                                    )}
                                    {transitRows.map((r, i) => (
                                        <PanelGridTr key={i} selected={transitSelRow === i} onClick={() => setTransitSelRow(i)}>
                                            <PanelGridTd className="font-mono font-bold text-[#FB7506]">{t(r.barcode)}</PanelGridTd>
                                            <PanelGridTd className="font-bold text-[#FB7506]">{t(r.farm)}</PanelGridTd>
                                            <PanelGridTd className="font-mono font-bold text-[#FB7506]">{t(r.awbcode)}</PanelGridTd>
                                            <PanelGridTd align="right" className="font-bold text-[#FB7506]">{fmtLot(r.lote)}</PanelGridTd>
                                            <PanelGridTd align="right" className="font-semibold">{fmtN(r.box_qty)}</PanelGridTd>
                                            <PanelGridTd align="right">{fmtN(r.qty_sale)}</PanelGridTd>
                                            <PanelGridTd align="right">{fmtN(r.stock)}</PanelGridTd>
                                            <PanelGridTd align="right">{fmtN(r.OBox)}</PanelGridTd>
                                            <PanelGridTd align="right">{fmtN(r.available)}</PanelGridTd>
                                            <PanelGridTd align="right" className="font-bold text-green-700">{fmtN(r.QPI)}</PanelGridTd>
                                            <PanelGridTd className="text-gray-500">{t(r.Grower_Ship_date)}</PanelGridTd>
                                            <PanelGridTd className="text-gray-500">{t(r.Avail_date)}</PanelGridTd>
                                            <PanelGridTd className="max-w-[200px] truncate">{t(r.description)}</PanelGridTd>
                                        </PanelGridTr>
                                    ))}
                                    {!transitLoading && transitRows.length === 0 && (
                                        <tr><td colSpan={13} className="p-10 text-center text-gray-400 italic">No records</td></tr>
                                    )}
                                    <tr><td colSpan={13}>
                                        <div ref={transitSentinel} className="flex items-center justify-center py-3 text-[10px] text-gray-400">
                                            {transitLoading && transitPage > 1 && <><Loader2 size={12} className="animate-spin mr-1" />Loading more...</>}
                                            {!transitLoading && !transitHasMore && transitRows.length > 0 && <span className="italic">All {transitRows.length} records loaded</span>}
                                        </div>
                                    </td></tr>
                                </PanelGridTbody>
                            </PanelGridTable>
                        </PanelGrid>
                    )}

                    {/* Scan = Physical */}
                    {activeTab === "scanned-eq" && (
                        <PanelGrid icon={CheckCircle} title="Scan = Physical"
                            recordCount={viewRows.length}
                            onRefresh={refreshAll} refreshing={loadingView}
                            headerRight={<AuditLogModal recordId={undefined} disabled />}
                            className="h-full">
                            <PanelGridTable>
                                <PanelGridThead>
                                    <PanelGridTh>Barcode</PanelGridTh><PanelGridTh>Farm</PanelGridTh><PanelGridTh>AWB</PanelGridTh>
                                    <PanelGridTh align="right">Lot</PanelGridTh>
                                    <PanelGridTh align="right">Box Qty</PanelGridTh>
                                    <PanelGridTh align="right">Sold</PanelGridTh>
                                    <PanelGridTh align="right">Stock Sys</PanelGridTh>
                                    <PanelGridTh align="right">Open Inv</PanelGridTh>
                                    <PanelGridTh align="right">Available</PanelGridTh>
                                    <PanelGridTh align="right">Scanned</PanelGridTh>
                                    <PanelGridTh>Ship Date</PanelGridTh><PanelGridTh>Avail Date</PanelGridTh><PanelGridTh>Product</PanelGridTh>
                                </PanelGridThead>
                                <PanelGridTbody>
                                    {viewRows.map((r: any, i: number) => (
                                        <PanelGridTr key={i} selected={viewSelRow === i} onClick={() => setViewSelRow(i)}>
                                            <PanelGridTd className="font-mono font-bold text-[#FB7506]">{t(r.barcode)}</PanelGridTd>
                                            <PanelGridTd className="font-bold text-[#FB7506]">{t(r.farm)}</PanelGridTd>
                                            <PanelGridTd className="font-mono font-bold text-[#FB7506]">{t(r.awbcode)}</PanelGridTd>
                                            <PanelGridTd align="right" className="font-bold text-[#FB7506]">{fmtLot(r.lote)}</PanelGridTd>
                                            <PanelGridTd align="right" className="font-semibold">{fmtN(r.box_qty)}</PanelGridTd>
                                            <PanelGridTd align="right">{fmtN(r.qty_sale)}</PanelGridTd>
                                            <PanelGridTd align="right">{fmtN(r.stock)}</PanelGridTd>
                                            <PanelGridTd align="right">{fmtN(r.OBox)}</PanelGridTd>
                                            <PanelGridTd align="right">{fmtN(r.available)}</PanelGridTd>
                                            <PanelGridTd align="right" className="font-bold text-green-700">{fmtN(r.QPI)}</PanelGridTd>
                                            <PanelGridTd className="text-gray-500">{t(r.Grower_Ship_date)}</PanelGridTd>
                                            <PanelGridTd className="text-gray-500">{t(r.Avail_date)}</PanelGridTd>
                                            <PanelGridTd className="max-w-[200px] truncate">{t(r.description)}</PanelGridTd>
                                        </PanelGridTr>
                                    ))}
                                    {!loadingView && viewRows.length === 0 && (
                                        <tr><td colSpan={13} className="p-10 text-center text-gray-400 italic">No records</td></tr>
                                    )}
                                </PanelGridTbody>
                            </PanelGridTable>
                        </PanelGrid>
                    )}

                    {/* Scanned Boxes */}
                    {activeTab === "scanned-bx" && (
                        <PanelGrid icon={Package} title="Scanned Boxes"
                            recordCount={`${scannedRows.length}${scannedHasMore ? "+" : ""}`}
                            onRefresh={refreshAll} refreshing={scannedLoading && scannedPage === 1}
                            headerRight={<AuditLogModal recordId={t(scannedRows[scannedSelRow ?? -1]?.ID)} disabled={scannedSelRow === null} />}
                            className="h-full">
                            <PanelGridTable>
                                <PanelGridThead>
                                    <PanelGridTh>AWB</PanelGridTh><PanelGridTh>AWB Date</PanelGridTh>
                                    <PanelGridTh align="right">Lot</PanelGridTh>
                                    <PanelGridTh align="right">Box #</PanelGridTh>
                                    <PanelGridTh>ID</PanelGridTh><PanelGridTh>Rack</PanelGridTh>
                                    <PanelGridTh>Grower</PanelGridTh><PanelGridTh>Product</PanelGridTh><PanelGridTh>Timestamp</PanelGridTh>
                                </PanelGridThead>
                                <PanelGridTbody>
                                    {scannedLoading && scannedPage === 1 && (
                                        <tr><td colSpan={9} className="p-8 text-center text-gray-400 italic">
                                            <Loader2 size={14} className="animate-spin inline mr-2" />Loading...
                                        </td></tr>
                                    )}
                                    {scannedRows.map((r, i) => (
                                        <PanelGridTr key={i} selected={scannedSelRow === i} onClick={() => setScannedSelRow(i)}>
                                            <PanelGridTd className="font-mono font-bold text-[#FB7506]">{t(r.awbcode)}</PanelGridTd>
                                            <PanelGridTd>{fmtDate(r.date_invo)}</PanelGridTd>
                                            <PanelGridTd align="right" className="font-bold text-[#FB7506]">{fmtLot(r.lote)}</PanelGridTd>
                                            <PanelGridTd align="right" className="font-bold text-[#FB7506]">{fmtN(r.box_no)}</PanelGridTd>
                                            <PanelGridTd className="font-mono text-[10px] font-bold text-[#FB7506]">{t(r.ID)}</PanelGridTd>
                                            <PanelGridTd className="font-mono font-bold text-[#FB7506]">{t(r.rack)}</PanelGridTd>
                                            <PanelGridTd className="max-w-[120px] truncate">{t(r.grower)}</PanelGridTd>
                                            <PanelGridTd className="max-w-[200px] truncate">{t(r.description)}</PanelGridTd>
                                            <PanelGridTd className="text-gray-400">{r.timestamp ? new Date(r.timestamp).toLocaleString("en-US") : "—"}</PanelGridTd>
                                        </PanelGridTr>
                                    ))}
                                    {!scannedLoading && scannedRows.length === 0 && (
                                        <tr><td colSpan={9} className="p-10 text-center text-gray-400 italic">No scanned boxes</td></tr>
                                    )}
                                    <tr><td colSpan={9}>
                                        <div ref={scannedSentinel} className="flex items-center justify-center py-3 text-[10px] text-gray-400">
                                            {scannedLoading && scannedPage > 1 && <><Loader2 size={12} className="animate-spin mr-1" />Loading more...</>}
                                            {!scannedLoading && !scannedHasMore && scannedRows.length > 0 && <span className="italic">All {scannedRows.length} records loaded</span>}
                                        </div>
                                    </td></tr>
                                </PanelGridTbody>
                            </PanelGridTable>
                        </PanelGrid>
                    )}

                    {/* Sys ≠ Physical */}
                    {activeTab === "sys-not" && (
                        <PanelGrid icon={AlertTriangle} title="Sys ≠ Physical"
                            recordCount={`${sysNotRows.length}${sysNotHasMore ? "+" : ""}`}
                            onRefresh={refreshAll} refreshing={sysNotLoading && sysNotPage === 1}
                            headerRight={<AuditLogModal recordId={undefined} disabled />}
                            className="h-full">
                            <PanelGridTable>
                                <PanelGridThead>
                                    <PanelGridTh>Farm</PanelGridTh><PanelGridTh>AWB</PanelGridTh>
                                    <PanelGridTh align="right">Lot</PanelGridTh>
                                    <PanelGridTh align="right">Box Qty</PanelGridTh>
                                    <PanelGridTh align="right">Transit</PanelGridTh>
                                    <PanelGridTh align="right">Sold</PanelGridTh>
                                    <PanelGridTh align="right">Stock</PanelGridTh>
                                    <PanelGridTh align="right">Un/Box</PanelGridTh>
                                    <PanelGridTh>Customer</PanelGridTh><PanelGridTh>Case</PanelGridTh>
                                    <PanelGridTh>Warehouse</PanelGridTh><PanelGridTh>Product</PanelGridTh>
                                </PanelGridThead>
                                <PanelGridTbody>
                                    {sysNotLoading && sysNotPage === 1 && (
                                        <tr><td colSpan={12} className="p-8 text-center text-gray-400 italic">
                                            <Loader2 size={14} className="animate-spin inline mr-2" />Loading...
                                        </td></tr>
                                    )}
                                    {sysNotRows.map((r, i) => (
                                        <PanelGridTr key={i} selected={sysNotSelRow === i} onClick={() => setSysNotSelRow(i)}>
                                            <PanelGridTd className="font-bold text-[#FB7506]">{t(r.farm)}</PanelGridTd>
                                            <PanelGridTd className="font-mono font-bold text-[#FB7506]">{t(r.awbcode)}</PanelGridTd>
                                            <PanelGridTd align="right" className="font-bold text-[#FB7506]">{fmtLot(r.lote)}</PanelGridTd>
                                            <PanelGridTd align="right" className="font-semibold">{fmtN(r.box_qty)}</PanelGridTd>
                                            <PanelGridTd align="right" className="text-orange-600">{fmtN(r.qty_transit)}</PanelGridTd>
                                            <PanelGridTd align="right">{fmtN(r.qty_sold)}</PanelGridTd>
                                            <PanelGridTd align="right" className="font-bold">{fmtN(r.stock)}</PanelGridTd>
                                            <PanelGridTd align="right">{fmtN(r.tunits_x_box)}</PanelGridTd>
                                            <PanelGridTd className="max-w-[90px] truncate">{t(r.customer)}</PanelGridTd>
                                            <PanelGridTd>{t(r.case_sh)}</PanelGridTd>
                                            <PanelGridTd className="max-w-[90px] truncate">{t(r.wp_name)}</PanelGridTd>
                                            <PanelGridTd className="max-w-[200px] truncate">{t(r.description)}</PanelGridTd>
                                        </PanelGridTr>
                                    ))}
                                    {!sysNotLoading && sysNotRows.length === 0 && (
                                        <tr><td colSpan={12} className="p-10 text-center text-gray-400 italic">No records</td></tr>
                                    )}
                                    <tr><td colSpan={12}>
                                        <div ref={sysNotSentinel} className="flex items-center justify-center py-3 text-[10px] text-gray-400">
                                            {sysNotLoading && sysNotPage > 1 && <><Loader2 size={12} className="animate-spin mr-1" />Loading more...</>}
                                            {!sysNotLoading && !sysNotHasMore && sysNotRows.length > 0 && <span className="italic">All {sysNotRows.length} records loaded</span>}
                                        </div>
                                    </td></tr>
                                </PanelGridTbody>
                            </PanelGridTable>
                        </PanelGrid>
                    )}

                    {/* Sys < Physical */}
                    {activeTab === "sys-less" && (
                        <PanelGrid icon={TrendingDown} title="Sys < Physical"
                            recordCount={viewRows.length}
                            onRefresh={refreshAll} refreshing={loadingView}
                            headerRight={<AuditLogModal recordId={undefined} disabled />}
                            className="h-full">
                            <PanelGridTable>
                                <PanelGridThead>
                                    <PanelGridTh>Barcode</PanelGridTh><PanelGridTh>Farm</PanelGridTh><PanelGridTh>AWB</PanelGridTh>
                                    <PanelGridTh align="right">Lot</PanelGridTh>
                                    <PanelGridTh>Box Date</PanelGridTh>
                                    <PanelGridTh align="right">Box Qty</PanelGridTh>
                                    <PanelGridTh align="right">Sold</PanelGridTh>
                                    <PanelGridTh align="right">Stock</PanelGridTh>
                                    <PanelGridTh align="right">Scanned</PanelGridTh>
                                    <PanelGridTh align="right">Open Inv</PanelGridTh>
                                    <PanelGridTh>Product</PanelGridTh>
                                </PanelGridThead>
                                <PanelGridTbody>
                                    {viewRows.map((r: any, i: number) => (
                                        <PanelGridTr key={i} selected={viewSelRow === i} onClick={() => setViewSelRow(i)}>
                                            <PanelGridTd className="font-mono font-bold text-[#FB7506]">{t(r.barcode)}</PanelGridTd>
                                            <PanelGridTd className="font-bold text-[#FB7506]">{t(r.farm)}</PanelGridTd>
                                            <PanelGridTd className="font-mono font-bold text-[#FB7506]">{t(r.awbcode)}</PanelGridTd>
                                            <PanelGridTd align="right" className="font-bold text-[#FB7506]">{fmtLot(r.lote)}</PanelGridTd>
                                            <PanelGridTd>{fmtDate(r.box_date)}</PanelGridTd>
                                            <PanelGridTd align="right" className="font-semibold">{fmtN(r.box_qty)}</PanelGridTd>
                                            <PanelGridTd align="right">{fmtN(r.qty_sale)}</PanelGridTd>
                                            <PanelGridTd align="right" className="font-bold">{fmtN(r.stock)}</PanelGridTd>
                                            <PanelGridTd align="right" className="font-bold text-green-700">{fmtN(r.QPI)}</PanelGridTd>
                                            <PanelGridTd align="right">{fmtN(r.OBox)}</PanelGridTd>
                                            <PanelGridTd className="max-w-[200px] truncate">{t(r.description)}</PanelGridTd>
                                        </PanelGridTr>
                                    ))}
                                    {!loadingView && viewRows.length === 0 && (
                                        <tr><td colSpan={11} className="p-10 text-center text-gray-400 italic">No records</td></tr>
                                    )}
                                </PanelGridTbody>
                            </PanelGridTable>
                        </PanelGrid>
                    )}

                    {/* Sys = Physical */}
                    {activeTab === "sys-eq" && (
                        <PanelGrid icon={BarChart2} title="Sys = Physical"
                            recordCount={viewRows.length}
                            onRefresh={refreshAll} refreshing={loadingView}
                            headerRight={<AuditLogModal recordId={undefined} disabled />}
                            className="h-full">
                            <PanelGridTable>
                                <PanelGridThead>
                                    <PanelGridTh>Barcode</PanelGridTh><PanelGridTh>Farm</PanelGridTh><PanelGridTh>AWB</PanelGridTh>
                                    <PanelGridTh align="right">Lot</PanelGridTh>
                                    <PanelGridTh>Box Date</PanelGridTh>
                                    <PanelGridTh align="right">Box Qty</PanelGridTh>
                                    <PanelGridTh align="right">Sold</PanelGridTh>
                                    <PanelGridTh align="right">Stock</PanelGridTh>
                                    <PanelGridTh align="right">Scanned</PanelGridTh>
                                    <PanelGridTh align="right">Open Inv</PanelGridTh>
                                    <PanelGridTh>Product</PanelGridTh>
                                </PanelGridThead>
                                <PanelGridTbody>
                                    {viewRows.map((r: any, i: number) => (
                                        <PanelGridTr key={i} selected={viewSelRow === i} onClick={() => setViewSelRow(i)}>
                                            <PanelGridTd className="font-mono font-bold text-[#FB7506]">{t(r.barcode)}</PanelGridTd>
                                            <PanelGridTd className="font-bold text-[#FB7506]">{t(r.farm)}</PanelGridTd>
                                            <PanelGridTd className="font-mono font-bold text-[#FB7506]">{t(r.awbcode)}</PanelGridTd>
                                            <PanelGridTd align="right" className="font-bold text-[#FB7506]">{fmtLot(r.lote)}</PanelGridTd>
                                            <PanelGridTd>{fmtDate(r.box_date)}</PanelGridTd>
                                            <PanelGridTd align="right" className="font-semibold">{fmtN(r.box_qty)}</PanelGridTd>
                                            <PanelGridTd align="right">{fmtN(r.qty_sale)}</PanelGridTd>
                                            <PanelGridTd align="right" className="font-bold">{fmtN(r.stock)}</PanelGridTd>
                                            <PanelGridTd align="right" className="font-bold text-green-700">{fmtN(r.QPI)}</PanelGridTd>
                                            <PanelGridTd align="right">{fmtN(r.OBox)}</PanelGridTd>
                                            <PanelGridTd className="max-w-[200px] truncate">{t(r.description)}</PanelGridTd>
                                        </PanelGridTr>
                                    ))}
                                    {!loadingView && viewRows.length === 0 && (
                                        <tr><td colSpan={11} className="p-10 text-center text-gray-400 italic">No records</td></tr>
                                    )}
                                </PanelGridTbody>
                            </PanelGridTable>
                        </PanelGrid>
                    )}

                </div>
            </main>

            <AppFooter areaLabel="Inventory" />

            {/* ── Global scan overlay ────────────────────────────────────────────── */}
            {scanBuffer && (
                <div className="fixed inset-0 z-50 flex items-end justify-center pb-10 pointer-events-none">
                    <div className={cn(
                        "pointer-events-auto rounded-2xl px-8 py-5 shadow-2xl border-2 min-w-[280px] text-center",
                        bufferIsRack ? "bg-[#374151] border-[#FB7506]" : "bg-[#374151] border-blue-400"
                    )}>
                        <p className={cn(
                            "text-[9px] font-black uppercase tracking-[0.2em] mb-2",
                            bufferIsRack ? "text-[#FB7506]" : "text-blue-400"
                        )}>
                            {bufferIsRack ? "▸ Rack Code" : "▸ Box Barcode"}
                        </p>
                        <p className="text-[36px] font-black font-mono tracking-[0.15em] text-white leading-none">
                            {scanBuffer}<span className="animate-pulse opacity-60">|</span>
                        </p>
                        <p className="text-[9px] text-gray-400 mt-3 font-bold uppercase tracking-widest">
                            Enter ↵ scan &nbsp;·&nbsp; ← backspace &nbsp;·&nbsp; Esc cancel
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
