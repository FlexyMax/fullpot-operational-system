"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    Truck, Loader2, PackageSearch, ScanLine,
    CheckCircle2, XCircle, ArrowRight, List, Package,
    Play, RotateCcw, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { usePagePermissions } from "@/lib/permissions";
import AppHeader from "@/components/layout/AppHeader";
import AppFooter from "@/components/layout/AppFooter";
import PanelGrid from "@/components/ui/PanelGrid";
import { PanelGridTable, PanelGridThead, PanelGridTh, PanelGridTbody, PanelGridTr, PanelGridTd } from "@/components/ui/PanelGridTable";
import { AuditLogModal } from "@/components/AuditLogModal";
import { useScanOutStore } from "@/store/useScanOutStore";
import type { ScanOutItem, ScanOutOrder } from "@/store/useScanOutStore";

const t   = (v: any) => String(v ?? "").trim();
const fmtN = (v: any) => { const n = Number(v ?? 0); return isNaN(n) ? "—" : n.toLocaleString("en-US"); };

function StatBox({ label, value, color = "gray" }: { label: string; value: any; color?: string }) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center rounded px-4 py-1.5 min-w-[90px] shrink-0",
            color === "orange" && "bg-[#FB7506]/10 border border-[#FB7506]/30",
            color === "green"  && "bg-green-50 border border-green-200",
            color === "blue"   && "bg-blue-50 border border-blue-200",
            color === "gray"   && "bg-gray-100 border border-gray-200",
            color === "red"    && "bg-red-50 border border-red-200",
        )}>
            <span className={cn("text-[18px] font-black tabular-nums leading-none",
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

// ─── Barcode match validation ──────────────────────────────────────────────────
// compuesto: "<3-vendor><lote>" e.g. "CGR6620"
// vendor label: "<3-vendor><5-digit lote><3-digit seq>" e.g. "CGR06620009"
function vendorMatchesCompuesto(vendorCode: string, compuesto: string): boolean {
    const vendor3   = compuesto.slice(0, 3);
    const loteRaw   = compuesto.slice(3);
    const expected  = vendor3 + loteRaw.padStart(5, "0"); // 8 chars
    const prefix    = vendorCode.slice(0, 8);
    return prefix.toUpperCase() === expected.toUpperCase();
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ScanOutPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { canCreate } = usePagePermissions("scan-out");

    const {
        activeOrder, setActiveOrder,
        currentStep, setCurrentStep,
        invoiceBarcode, setInvoiceBarcode,
        scanHistory, addScanItem, updateScanItem,
        activeTab, setActiveTab,
        histSelRow, setHistSelRow,
        detailSelRow, setDetailSelRow,
        reset,
    } = useScanOutStore();

    const [orderInput,   setOrderInput]   = useState("");
    const [orderLoading, setOrderLoading] = useState(false);
    const [scanInput,    setScanInput]    = useState("");
    const [processing,   setProcessing]   = useState(false);

    // Stored from verify step — needed for confirm
    const pkBoxUqRef  = useRef("");
    const compuestoRef = useRef("");

    const orderInputRef = useRef<HTMLInputElement>(null);
    const scanInputRef  = useRef<HTMLInputElement>(null);

    // Auto-focus scan input when order is active
    useEffect(() => {
        const timer = setTimeout(() => {
            if (activeOrder) scanInputRef.current?.focus();
            else orderInputRef.current?.focus();
        }, 100);
        return () => clearTimeout(timer);
    }, [activeOrder, currentStep]);

    // Keep focus on scan input while in scan phase
    useEffect(() => {
        if (!activeOrder) return;
        const refocus = () => setTimeout(() => scanInputRef.current?.focus(), 10);
        document.addEventListener("click", refocus);
        return () => document.removeEventListener("click", refocus);
    }, [activeOrder]);

    // ── Load order ────────────────────────────────────────────────────────────
    const handleStartScan = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        const inv = orderInput.trim();
        if (!inv) return;
        setOrderLoading(true);
        try {
            const r = await fetch(`/api/scan-out/order?invoice_no=${encodeURIComponent(inv)}`);
            const j = await r.json();
            if (!r.ok) { toast.error(j.error || "Order not found"); orderInputRef.current?.select(); return; }
            setActiveOrder(j as ScanOutOrder);
            setCurrentStep("invoice");
            setInvoiceBarcode("");
            setScanInput("");
            toast.success(`Order ${inv} loaded — ${j.toScan} boxes to scan`);
        } catch (e: any) { toast.error(e.message); }
        finally { setOrderLoading(false); }
    }, [orderInput, setActiveOrder, setCurrentStep, setInvoiceBarcode]);

    const handleEndScan = () => {
        reset();
        setOrderInput("");
        setScanInput("");
        pkBoxUqRef.current  = "";
        compuestoRef.current = "";
        setTimeout(() => orderInputRef.current?.focus(), 100);
    };

    const handleCancelPair = () => {
        setCurrentStep("invoice");
        setInvoiceBarcode("");
        pkBoxUqRef.current  = "";
        compuestoRef.current = "";
        setScanInput("");
        toast.info("Cancelled — scan Invoice Label again");
    };

    // ── Refresh order data ─────────────────────────────────────────────────────
    const refreshOrder = useCallback(async (orderNo: string) => {
        try {
            const r = await fetch(`/api/scan-out/order?invoice_no=${encodeURIComponent(orderNo)}`);
            const j = await r.json();
            if (r.ok) setActiveOrder(j as ScanOutOrder);
        } catch { /* silent */ }
    }, [setActiveOrder]);

    // ── Scan handler ──────────────────────────────────────────────────────────
    const handleScan = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        const barcode = scanInput.trim().toUpperCase();
        if (!barcode || !activeOrder || activeOrder.toScan === 0 || processing) return;
        setScanInput("");

        // ── Step 1: Invoice Label ─────────────────────────────────────────────
        if (currentStep === "invoice") {
            setProcessing(true);
            try {
                const r = await fetch("/api/scan-out/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ invoice_uq: barcode, invoice_no: activeOrder.orderNo }),
                });
                const j = await r.json();
                if (!r.ok) { toast.error(j.error || "Invoice label not found"); return; }
                // Store for next step
                pkBoxUqRef.current   = j.pk_box_uq;
                compuestoRef.current = j.compuesto;
                setInvoiceBarcode(barcode);
                setCurrentStep("vendor");
                toast.info(`Invoice label OK: ${barcode} — now scan Vendor label`);
            } catch (e: any) { toast.error(e.message); }
            finally { setProcessing(false); }
            return;
        }

        // ── Step 2: Vendor Label ──────────────────────────────────────────────
        const compuesto = compuestoRef.current;
        if (!vendorMatchesCompuesto(barcode, compuesto)) {
            const expected = compuesto.slice(0, 3) + compuesto.slice(3).padStart(5, "0");
            toast.error(`Vendor label mismatch. Expected prefix: ${expected}`);
            return;
        }

        const lnbox = parseInt(barcode.slice(-3), 10);
        if (isNaN(lnbox)) { toast.error("Invalid vendor label — cannot read box number"); return; }

        // Add pending entry to history
        const item: ScanOutItem = {
            id:             Math.random().toString(36).slice(2),
            invoiceBarcode,
            vendorBarcode:  barcode,
            status:         "pending",
            message:        "Confirming...",
            timestamp:      new Date(),
        };
        addScanItem(item);
        setActiveTab("history");

        setProcessing(true);
        try {
            const r = await fetch("/api/scan-out/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    pk_box_uq:      pkBoxUqRef.current,
                    invoice_box_uq: invoiceBarcode,
                    lnbox,
                    invoice_no:     activeOrder.orderNo,
                }),
            });
            const j = await r.json();

            if (!r.ok) {
                updateScanItem(item.id, { status: "error", message: j.error || "Scan-out failed" });
                toast.error(j.error || "Scan-out failed");
            } else {
                updateScanItem(item.id, { status: "success", message: j.message || "Box scanned out" });
                toast.success(j.message || "Box scanned out");
                // Update order totals from summary
                if (j.totals) {
                    setActiveOrder({ ...activeOrder, ...j.totals });
                }
                // Refresh full order for items grid
                await refreshOrder(activeOrder.orderNo);
            }
        } catch (e: any) {
            updateScanItem(item.id, { status: "error", message: e.message });
            toast.error(e.message);
        } finally {
            setProcessing(false);
            // Always reset for next pair
            setCurrentStep("invoice");
            setInvoiceBarcode("");
            pkBoxUqRef.current   = "";
            compuestoRef.current = "";
        }
    }, [scanInput, activeOrder, currentStep, invoiceBarcode, processing,
        setInvoiceBarcode, setCurrentStep, addScanItem, updateScanItem,
        setActiveOrder, setActiveTab, refreshOrder]);

    if (status === "loading") return null;
    if (status === "unauthenticated") { router.push("/login"); return null; }

    return (
        <div className="flex flex-col h-[100dvh] bg-[#f4f6f8] overflow-hidden font-sans text-[#333]">
            <AppHeader title="Scan Out" icon={Truck} />
            <main className="flex-1 overflow-hidden flex flex-col min-h-0">

                {/* ── Phase 1: Order selection ─────────────────────────────────── */}
                {!activeOrder ? (
                    <div className="flex-1 flex items-center justify-center p-4">
                        <div className="bg-white border border-[#DBD9D9] rounded-xl shadow-xl w-full max-w-md p-8">
                            <div className="text-center mb-8">
                                <PackageSearch size={48} className="mx-auto text-[#FB7506] mb-4" />
                                <h2 className="text-xl font-black uppercase tracking-tight text-[#374151]">
                                    Select Order to Scan Out
                                </h2>
                                <p className="text-gray-500 mt-2 text-sm font-medium">
                                    Enter or scan the Invoice / Order No to begin.
                                </p>
                            </div>
                            <form onSubmit={handleStartScan} className="flex flex-col gap-4">
                                <input
                                    ref={orderInputRef}
                                    type="text"
                                    value={orderInput}
                                    onChange={(e) => setOrderInput(e.target.value.toUpperCase())}
                                    placeholder="Order No..."
                                    className="w-full bg-[#F5F3F3] border-2 border-[#DBD9D9] rounded-xl px-6 py-4 text-2xl font-black text-center placeholder:text-gray-300 focus:outline-none focus:border-[#FB7506] focus:bg-white transition-all uppercase"
                                    autoFocus
                                    autoComplete="off"
                                />
                                <button
                                    type="submit"
                                    disabled={orderLoading || !orderInput.trim()}
                                    className="w-full bg-[#374151] hover:bg-[#4B5563] disabled:opacity-50 text-white font-black uppercase tracking-widest py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm">
                                    {orderLoading ? <Loader2 size={18} className="animate-spin" /> : <><Play size={16} /> Start Scan</>}
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* ── Stats / order bar ──────────────────────────────────── */}
                        <div className="bg-[#F5F3F3] border-b border-[#DBD9D9] px-3 py-2 shrink-0 overflow-x-auto">
                            <div className="flex items-center gap-3 min-w-max">
                                {/* Order info */}
                                <div className="flex flex-col shrink-0">
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Order</span>
                                    <span className="text-[15px] font-black text-[#FB7506]">{activeOrder.orderNo}</span>
                                </div>
                                <div className="flex flex-col shrink-0 max-w-[140px]">
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Customer</span>
                                    <span className="text-[11px] font-bold text-gray-700 truncate">{activeOrder.customer}</span>
                                </div>
                                <div className="flex flex-col shrink-0 max-w-[100px]">
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Carrier</span>
                                    <span className="text-[11px] font-bold text-gray-700 truncate">{activeOrder.destination}</span>
                                </div>
                                <div className="w-px h-10 bg-gray-200 mx-1" />
                                <StatBox label="Scanned"  value={activeOrder.scanned} color="green"  />
                                <StatBox label="To Scan"  value={activeOrder.toScan}  color={activeOrder.toScan === 0 ? "green" : "orange"} />
                                <StatBox label="Total"    value={activeOrder.total}   color="gray"   />
                                <div className="ml-auto shrink-0">
                                    <button onClick={handleEndScan}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded transition-colors uppercase tracking-widest">
                                        <RotateCcw size={11} /> End Scan
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ── Scan step indicator ────────────────────────────────── */}
                        <div className="bg-[#F5F3F3] border-b border-[#DBD9D9] px-3 py-2 shrink-0 flex flex-wrap items-center gap-3">
                            {/* Step pills */}
                            <div className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded border text-[11px] font-bold transition-all",
                                currentStep === "invoice"
                                    ? "border-blue-400 bg-blue-50 text-blue-700"
                                    : invoiceBarcode
                                    ? "border-green-400 bg-green-50 text-green-700"
                                    : "border-gray-200 bg-white text-gray-400"
                            )}>
                                <ScanLine size={12} />
                                <span>1. Invoice Label</span>
                                {invoiceBarcode && <CheckCircle2 size={11} className="text-green-500" />}
                            </div>
                            <ArrowRight size={14} className="text-gray-300 shrink-0" />
                            <div className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded border text-[11px] font-bold transition-all",
                                currentStep === "vendor"
                                    ? "border-[#FB7506] bg-[#FB7506]/10 text-[#FB7506]"
                                    : "border-gray-200 bg-white text-gray-400"
                            )}>
                                <PackageSearch size={12} />
                                <span>2. Vendor Label</span>
                            </div>

                            {/* Invoice barcode badge */}
                            {invoiceBarcode && currentStep === "vendor" && (
                                <div className="flex items-center gap-2 ml-2">
                                    <span className="bg-green-50 border border-green-200 px-2.5 py-1 rounded-full text-[10px] font-bold text-green-700 flex items-center gap-1">
                                        <ScanLine size={10} className="text-green-600" />
                                        Invoice: <span className="font-mono text-[#FB7506]">{invoiceBarcode}</span>
                                    </span>
                                    <button onClick={handleCancelPair} className="text-[10px] text-gray-400 hover:text-red-500 font-bold transition-colors flex items-center gap-0.5">
                                        <X size={10} /> Cancel
                                    </button>
                                </div>
                            )}

                            {processing && <Loader2 size={14} className="animate-spin text-[#FB7506] ml-auto shrink-0" />}
                        </div>

                        {/* ── Scan input ────────────────────────────────────────── */}
                        <div className={cn(
                            "shrink-0 px-3 py-2 border-b border-[#DBD9D9]",
                            activeOrder.toScan === 0 ? "bg-green-50" : "bg-white"
                        )}>
                            <form onSubmit={handleScan}>
                                <input
                                    ref={scanInputRef}
                                    type="text"
                                    value={scanInput}
                                    onChange={(e) => setScanInput(e.target.value.toUpperCase())}
                                    disabled={activeOrder.toScan === 0 || processing}
                                    placeholder={
                                        activeOrder.toScan === 0 ? "ORDER FULLY SCANNED ✓" :
                                        currentStep === "invoice" ? "Scan INVOICE label..." :
                                        "Scan VENDOR label..."
                                    }
                                    className={cn(
                                        "w-full rounded-xl px-6 py-3 text-xl sm:text-2xl font-black text-center uppercase transition-all focus:outline-none border-2",
                                        activeOrder.toScan === 0
                                            ? "bg-green-50 border-green-200 text-green-700 placeholder:text-green-400 cursor-not-allowed"
                                            : currentStep === "invoice"
                                            ? "border-blue-200 focus:border-blue-500 placeholder:text-gray-200 text-[#333]"
                                            : "border-[#FB7506]/40 focus:border-[#FB7506] placeholder:text-gray-200 text-[#333]"
                                    )}
                                    autoComplete="off"
                                />
                            </form>
                        </div>

                        {/* ── Tabs + Grids ──────────────────────────────────────── */}
                        <div className="bg-gray-100 border-b border-gray-200 px-2 pt-1.5 flex items-end gap-1 shrink-0">
                            {([["history", List, "Scan History"], ["details", Package, "Order Detail"]] as const).map(([id, Icon, label]) => (
                                <button key={id} onClick={() => setActiveTab(id as any)}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest whitespace-nowrap rounded-t-md transition-all border border-b-0",
                                        activeTab === id
                                            ? "bg-white border-gray-200 text-[#374151] shadow-sm"
                                            : "bg-transparent border-transparent text-gray-500 hover:bg-white/60"
                                    )}>
                                    <Icon size={11} />{label}
                                </button>
                            ))}
                            <span className="ml-auto text-[10px] text-gray-400 font-bold px-2 shrink-0">
                                {activeTab === "history" ? scanHistory.length : activeOrder.items?.length ?? 0}
                            </span>
                        </div>

                        <div className="flex-1 overflow-hidden px-2 pb-2 pt-2 min-h-0">

                            {/* Scan History grid */}
                            {activeTab === "history" && (
                                <PanelGrid icon={List} title="Scan History"
                                    recordCount={scanHistory.length}
                                    headerRight={<AuditLogModal recordId={undefined} disabled />}
                                    className="h-full">
                                    <PanelGridTable>
                                        <PanelGridThead>
                                            <PanelGridTh>Invoice Label</PanelGridTh>
                                            <PanelGridTh>Vendor Label</PanelGridTh>
                                            <PanelGridTh>Status</PanelGridTh>
                                            <PanelGridTh>Message</PanelGridTh>
                                            <PanelGridTh align="right">Time</PanelGridTh>
                                        </PanelGridThead>
                                        <PanelGridTbody>
                                            {scanHistory.length === 0 && (
                                                <tr><td colSpan={5} className="p-10 text-center text-gray-400 italic">No scans yet for this order</td></tr>
                                            )}
                                            {scanHistory.map((item, i) => (
                                                <PanelGridTr key={item.id} selected={histSelRow === i} onClick={() => setHistSelRow(i)}>
                                                    <PanelGridTd className="font-mono font-bold text-[#FB7506]">{item.invoiceBarcode}</PanelGridTd>
                                                    <PanelGridTd className="font-mono font-bold text-[#FB7506]">{item.vendorBarcode}</PanelGridTd>
                                                    <PanelGridTd>
                                                        <span className={cn(
                                                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase border",
                                                            item.status === "pending" && "bg-blue-50 text-blue-600 border-blue-200",
                                                            item.status === "success" && "bg-green-50 text-green-700 border-green-200",
                                                            item.status === "error"   && "bg-red-50 text-red-600 border-red-200",
                                                        )}>
                                                            {item.status === "success" && <CheckCircle2 size={9} />}
                                                            {item.status === "error"   && <XCircle size={9} />}
                                                            {item.status}
                                                        </span>
                                                    </PanelGridTd>
                                                    <PanelGridTd className={cn("max-w-[250px] truncate", item.status === "error" ? "text-red-600 font-bold" : "")}
                                                        title={item.message}>{item.message}</PanelGridTd>
                                                    <PanelGridTd align="right" className="font-mono text-gray-400 text-[11px]">
                                                        {item.timestamp.toLocaleTimeString([], { hour12: false })}
                                                    </PanelGridTd>
                                                </PanelGridTr>
                                            ))}
                                        </PanelGridTbody>
                                    </PanelGridTable>
                                </PanelGrid>
                            )}

                            {/* Order Detail grid */}
                            {activeTab === "details" && (
                                <PanelGrid icon={Package} title="Order Detail"
                                    recordCount={activeOrder.items?.length ?? 0}
                                    headerRight={<AuditLogModal recordId={undefined} disabled />}
                                    className="h-full">
                                    <PanelGridTable>
                                        <PanelGridThead>
                                            <PanelGridTh>Farm</PanelGridTh>
                                            <PanelGridTh align="right">Lot</PanelGridTh>
                                            <PanelGridTh>Description</PanelGridTh>
                                            <PanelGridTh align="right">Box Qty</PanelGridTh>
                                            <PanelGridTh align="right">Scanned</PanelGridTh>
                                            <PanelGridTh>AWB</PanelGridTh>
                                            <PanelGridTh>Grower</PanelGridTh>
                                        </PanelGridThead>
                                        <PanelGridTbody>
                                            {(!activeOrder.items || activeOrder.items.length === 0) && (
                                                <tr><td colSpan={7} className="p-10 text-center text-gray-400 italic">No items</td></tr>
                                            )}
                                            {(activeOrder.items ?? []).map((row: any, i: number) => {
                                                const boxQty  = Number(row.box_qty ?? 0);
                                                const qtyOut  = Number(row.qty_out ?? 0);
                                                const complete = qtyOut >= boxQty && boxQty > 0;
                                                return (
                                                    <PanelGridTr key={i} selected={detailSelRow === i} onClick={() => setDetailSelRow(i)}
                                                        className={complete ? "!bg-green-50 hover:!bg-green-100" : ""}>
                                                        <PanelGridTd className="font-bold text-[#FB7506]">{t(row.farm)}</PanelGridTd>
                                                        <PanelGridTd align="right" className="font-mono font-bold text-[#FB7506]">{t(row.lote)}</PanelGridTd>
                                                        <PanelGridTd className="max-w-[200px] truncate" title={t(row.description)}>{t(row.description)}</PanelGridTd>
                                                        <PanelGridTd align="right" className="font-bold">{fmtN(row.box_qty)}</PanelGridTd>
                                                        <PanelGridTd align="right" className={cn("font-black", complete ? "text-green-600" : "text-[#FB7506]")}>{fmtN(row.qty_out)}</PanelGridTd>
                                                        <PanelGridTd className="font-mono font-bold text-[#FB7506]">{t(row.awbcode)}</PanelGridTd>
                                                        <PanelGridTd className="text-gray-500">{t(row.grower)}</PanelGridTd>
                                                    </PanelGridTr>
                                                );
                                            })}
                                        </PanelGridTbody>
                                    </PanelGridTable>
                                </PanelGrid>
                            )}

                        </div>
                    </>
                )}
            </main>
            <AppFooter areaLabel="Dispatch" />
        </div>
    );
}
