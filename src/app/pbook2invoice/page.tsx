"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    ArrowLeft, RefreshCcw, FileText, Loader2,
    Search, X, RotateCcw, Receipt, List, ShoppingCart,
    Lock, Trash2, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { usePagePermissions } from "@/lib/permissions";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const t       = (v: any) => String(v ?? "").trim();
const norm    = (rows: any[]) => rows.map(r => { const n: any = {}; for (const [k, v] of Object.entries(r)) n[k.toUpperCase()] = v; return n; });
const normOne = (r: any) => { if (!r) return null; const n: any = {}; for (const [k, v] of Object.entries(r)) n[k.toUpperCase()] = v; return n; };
const fmt     = (v: any) => parseFloat(v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtI    = (v: any) => { const n = parseInt(v ?? 0); return isNaN(n) ? "" : n.toLocaleString("en-US"); };
const fmtDate = (v: any) => {
    if (!v) return "";
    const s = String(v).trim();
    const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso) return new Date(+iso[1], +iso[2] - 1, +iso[3]).toLocaleDateString("en-US");
    const d = new Date(s);
    return isNaN(d.getTime()) ? s : d.toLocaleDateString("en-US");
};
const vfpColor = (c: any) => {
    const n = parseInt(c ?? 0);
    if (!n || n < 0) return undefined;
    const r = n & 0xFF; const g = (n >> 8) & 0xFF; const b = (n >> 16) & 0xFF;
    return `rgb(${r},${g},${b})`;
};

const BOTTOM_TABS = ["Invoiced Prebooks", "Assigned Stock", "Purchase", "Stock OM", "Similar Products"];

// ─── Shared table cell components ─────────────────────────────────────────────
function Th({ children, className }: { children: any; className?: string }) {
    return (
        <th className={cn("px-2 py-1 text-left text-[11px] font-semibold text-gray-600 bg-gray-100 border-b border-gray-200 whitespace-nowrap", className)}>
            {children}
        </th>
    );
}
function Td({ children, className }: { children: any; className?: string }) {
    return (
        <td className={cn("px-2 py-0.5 text-[11px] text-gray-700 whitespace-nowrap border-b border-gray-100", className)}>
            {children}
        </td>
    );
}

// ─── Action button ─────────────────────────────────────────────────────────────
function ActionBtn({ icon: Icon, label, onClick, disabled, variant }: any) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "flex items-center gap-1 px-2 py-0.5 text-[11px] rounded border transition disabled:opacity-40 disabled:cursor-not-allowed",
                variant === "danger"  && "text-red-700 border-red-200 hover:bg-red-50",
                variant === "warning" && "text-amber-700 border-amber-200 hover:bg-amber-50",
                variant === "success" && "text-green-700 border-green-200 hover:bg-green-50",
                (!variant || variant === "default") && "text-gray-700 border-gray-200 hover:bg-gray-50",
            )}
        >
            <Icon size={12} /> {label}
        </button>
    );
}

// ─── Bottom tab components ─────────────────────────────────────────────────────
function InvoicedTab({ rows }: { rows: any[] }) {
    return (
        <table className="w-full">
            <thead className="sticky top-0 z-10">
                <tr>
                    <Th>Lot</Th><Th>Invoice Date</Th><Th>Invoice</Th>
                    <Th className="text-right">Boxes</Th><Th className="text-right">UxCase</Th>
                    <Th className="text-right">Price</Th><Th className="text-right">Total Units</Th>
                    <Th className="text-right">Value</Th><Th>Vendor</Th><Th>Warehouse</Th>
                    <Th>Case</Th><Th className="text-right">Unit Cost</Th>
                    <Th className="text-right">Days</Th><Th>Status</Th><Th>Sold Product</Th>
                </tr>
            </thead>
            <tbody>
                {rows.map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                        <Td>{t(r.LOT)}</Td>
                        <Td>{fmtDate(r.INVOICE_DATE ?? r.INV_DATE ?? r.LDINV_DATE)}</Td>
                        <Td>{t(r.INVOICE ?? r.INVOICE_NO)}</Td>
                        <Td className="text-right">{fmtI(r.BOXES)}</Td>
                        <Td className="text-right">{fmtI(r.UNITS_X_CASE ?? r.UXCASE ?? r.UNITS_X_BOX)}</Td>
                        <Td className="text-right">{fmt(r.PRICE)}</Td>
                        <Td className="text-right">{fmtI(r.TOTAL_UNITS)}</Td>
                        <Td className="text-right">{fmt(r.VALUE)}</Td>
                        <Td>{t(r.VENDOR ?? r.GROWER)}</Td>
                        <Td>{t(r.WAREHOUSE ?? r.WHOUSE)}</Td>
                        <Td>{t(r.CASE_SH ?? r.CASE)}</Td>
                        <Td className="text-right">{fmt(r.UNIT_COST)}</Td>
                        <Td className="text-right">{fmtI(r.DAYS)}</Td>
                        <Td>{t(r.STATUS)}</Td>
                        <Td>{t(r.SOLD_PRODUCT)}</Td>
                    </tr>
                ))}
                {rows.length === 0 && <tr><td colSpan={15} className="text-center text-[11px] text-gray-400 py-3">No invoiced prebooks</td></tr>}
            </tbody>
        </table>
    );
}

function AssignedStockTab({ rows }: { rows: any[] }) {
    return (
        <table className="w-full">
            <thead className="sticky top-0 z-10">
                <tr>
                    <Th>Lot</Th><Th>Product</Th><Th>Vendor</Th>
                    <Th className="text-right">Boxes</Th><Th className="text-right">UxCase</Th>
                    <Th>Warehouse</Th><Th>Status</Th>
                </tr>
            </thead>
            <tbody>
                {rows.map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                        <Td>{t(r.LOT ?? r.PCCODE)}</Td>
                        <Td>{t(r.PRODUCT ?? r.DESCRIPTION)}</Td>
                        <Td>{t(r.VENDOR ?? r.GROWER)}</Td>
                        <Td className="text-right">{fmtI(r.BOXES ?? r.QTY_BOXES)}</Td>
                        <Td className="text-right">{fmtI(r.UNITS_X_CASE ?? r.UNITS_X_BOX)}</Td>
                        <Td>{t(r.WAREHOUSE ?? r.WHOUSE)}</Td>
                        <Td>{t(r.STATUS)}</Td>
                    </tr>
                ))}
                {rows.length === 0 && <tr><td colSpan={7} className="text-center text-[11px] text-gray-400 py-3">No assigned stock</td></tr>}
            </tbody>
        </table>
    );
}

function PurchaseTab({ rows }: { rows: any[] }) {
    return (
        <table className="w-full">
            <thead className="sticky top-0 z-10">
                <tr>
                    <Th>PO No.</Th><Th>Product</Th><Th>Vendor</Th>
                    <Th className="text-right">Boxes</Th><Th className="text-right">UxCase</Th>
                    <Th className="text-right">Cost</Th><Th>Status</Th>
                </tr>
            </thead>
            <tbody>
                {rows.map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                        <Td>{t(r.PO_NO ?? r.PURCHASE_NO ?? r.SORDER_NO)}</Td>
                        <Td>{t(r.PRODUCT ?? r.DESCRIPTION)}</Td>
                        <Td>{t(r.VENDOR ?? r.GROWER)}</Td>
                        <Td className="text-right">{fmtI(r.BOXES ?? r.QTY_BOXES)}</Td>
                        <Td className="text-right">{fmtI(r.UNITS_X_CASE ?? r.UNITS_X_BOX)}</Td>
                        <Td className="text-right">{fmt(r.COST ?? r.UNIT_COST)}</Td>
                        <Td>{t(r.STATUS)}</Td>
                    </tr>
                ))}
                {rows.length === 0 && <tr><td colSpan={7} className="text-center text-[11px] text-gray-400 py-3">No purchase records</td></tr>}
            </tbody>
        </table>
    );
}

function StockOmTab({ rows, loading }: { rows: any[]; loading: boolean }) {
    return (
        <table className="w-full">
            <thead className="sticky top-0 z-10">
                <tr>
                    <Th>Lot</Th><Th>Product</Th><Th>Vendor</Th>
                    <Th className="text-right">Boxes</Th><Th className="text-right">UxCase</Th>
                    <Th className="text-right">Cost</Th><Th>Warehouse</Th><Th className="text-right">Days</Th>
                </tr>
            </thead>
            <tbody>
                {loading && (
                    <tr><td colSpan={8} className="text-center text-[11px] text-gray-400 py-3">
                        <Loader2 size={13} className="animate-spin inline mr-1" />Loading...
                    </td></tr>
                )}
                {!loading && rows.map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                        <Td>{t(r.LOT ?? r.PCCODE)}</Td>
                        <Td>{t(r.PRODUCT ?? r.DESCRIPTION)}</Td>
                        <Td>{t(r.VENDOR ?? r.GROWER)}</Td>
                        <Td className="text-right">{fmtI(r.BOXES ?? r.QTY_BOXES)}</Td>
                        <Td className="text-right">{fmtI(r.UNITS_X_CASE ?? r.UNITS_X_BOX)}</Td>
                        <Td className="text-right">{fmt(r.COST ?? r.UNIT_COST)}</Td>
                        <Td>{t(r.WAREHOUSE ?? r.WHOUSE)}</Td>
                        <Td className="text-right">{fmtI(r.DAYS ?? r.AGE)}</Td>
                    </tr>
                ))}
                {!loading && rows.length === 0 && <tr><td colSpan={8} className="text-center text-[11px] text-gray-400 py-3">No open market stock — click Stock OM to load</td></tr>}
            </tbody>
        </table>
    );
}

function SimilarTab({ rows }: { rows: any[] }) {
    return (
        <table className="w-full">
            <thead className="sticky top-0 z-10">
                <tr>
                    <Th>Lot</Th><Th>Product</Th><Th>Vendor</Th>
                    <Th className="text-right">Boxes</Th><Th className="text-right">UxCase</Th>
                    <Th className="text-right">Cost</Th><Th>Warehouse</Th><Th className="text-right">Days</Th>
                </tr>
            </thead>
            <tbody>
                {rows.map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                        <Td>{t(r.LOT ?? r.PCCODE)}</Td>
                        <Td>{t(r.PRODUCT ?? r.DESCRIPTION)}</Td>
                        <Td>{t(r.VENDOR ?? r.GROWER)}</Td>
                        <Td className="text-right">{fmtI(r.BOXES ?? r.QTY_BOXES)}</Td>
                        <Td className="text-right">{fmtI(r.UNITS_X_CASE ?? r.UNITS_X_BOX)}</Td>
                        <Td className="text-right">{fmt(r.COST ?? r.UNIT_COST)}</Td>
                        <Td>{t(r.WAREHOUSE ?? r.WHOUSE)}</Td>
                        <Td className="text-right">{fmtI(r.DAYS ?? r.AGE)}</Td>
                    </tr>
                ))}
                {rows.length === 0 && <tr><td colSpan={8} className="text-center text-[11px] text-gray-400 py-3">No similar products</td></tr>}
            </tbody>
        </table>
    );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function Pbook2InvoicePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const qc = useQueryClient();
    const { canEdit, canDelete } = usePagePermissions("pbook2invoice");

    const [dateMode,          setDateMode]          = useState<"delivery" | "shipping">("delivery");
    const [selectedDate,      setSelectedDate]      = useState<string | null>(null);
    const [selectedCustUq,    setSelectedCustUq]    = useState<string>("%");
    const [productSearch,     setProductSearch]     = useState("");
    const [appliedSearch,     setAppliedSearch]     = useState("");
    const [selectedUnico,     setSelectedUnico]     = useState<string | null>(null);
    const [activeBottomTab,   setActiveBottomTab]   = useState(0);
    const [datesKey,          setDatesKey]          = useState(0);
    const [linesKey,          setLinesKey]          = useState(0);
    const [working,           setWorking]           = useState(false);

    // ── Dates ─────────────────────────────────────────────────────────────────
    const { data: datesData, isLoading: loadingDates } = useQuery({
        queryKey: ["pb2inv-dates", datesKey],
        queryFn: async () => {
            const r = await fetch("/api/pbook2invoice/dates");
            const j = await r.json();
            if (!r.ok) throw new Error(j.error || "Failed");
            return { delivery: norm(j.delivery ?? []), shipping: norm(j.shipping ?? []) };
        },
    });
    const dateRows = (dateMode === "delivery" ? datesData?.delivery : datesData?.shipping) ?? [];

    // ── Customers ─────────────────────────────────────────────────────────────
    const { data: customers = [], isLoading: loadingCustomers } = useQuery({
        queryKey: ["pb2inv-customers", selectedDate, dateMode],
        enabled: !!selectedDate,
        queryFn: async () => {
            const r = await fetch(`/api/pbook2invoice/customers?date=${selectedDate}&mode=${dateMode}`);
            const j = await r.json();
            if (!r.ok) throw new Error(j.error || "Failed");
            return norm(Array.isArray(j) ? j : []);
        },
    });

    // ── Lines ─────────────────────────────────────────────────────────────────
    const { data: lines = [], isLoading: loadingLines } = useQuery({
        queryKey: ["pb2inv-lines", selectedDate, selectedCustUq, dateMode, appliedSearch, linesKey],
        enabled: !!selectedDate,
        queryFn: async () => {
            const p = new URLSearchParams({
                date: selectedDate!,
                customer_uq: selectedCustUq,
                mode: dateMode,
                product: appliedSearch || "%",
            });
            const r = await fetch(`/api/pbook2invoice/lines?${p}`);
            const j = await r.json();
            if (!r.ok) throw new Error(j.error || "Failed");
            return norm(Array.isArray(j) ? j : []);
        },
    });

    // ── Detail (5 sub-datasets) ───────────────────────────────────────────────
    const { data: detail } = useQuery({
        queryKey: ["pb2inv-detail", selectedUnico],
        enabled: !!selectedUnico,
        queryFn: async () => {
            const r = await fetch(`/api/pbook2invoice/detail/${selectedUnico}`);
            const j = await r.json();
            if (!r.ok) throw new Error(j.error || "Failed");
            return {
                detail:       normOne(j.detail),
                invoiced:     norm(j.invoiced ?? []),
                purchase:     norm(j.purchase ?? []),
                stockAssigned: norm(j.stockAssigned ?? []),
                stockSimilar:  norm(j.stockSimilar ?? []),
            };
        },
    });

    // ── Stock OM (manual trigger) ─────────────────────────────────────────────
    const { data: stockOm = [], isLoading: loadingStockOm, refetch: fetchStockOm } = useQuery({
        queryKey: ["pb2inv-stockom", selectedUnico],
        enabled: false,
        queryFn: async () => {
            const line = (lines as any[]).find((l: any) => t(l.UNICO ?? l.PBOOK_BOX_UQ) === selectedUnico);
            const product_uq = t(line?.PRODUCT_UQ ?? line?.UNICO ?? selectedUnico ?? "");
            const r = await fetch(`/api/pbook2invoice/stock-om?unico=${selectedUnico}&product_uq=${product_uq}`);
            const j = await r.json();
            if (!r.ok) throw new Error(j.error || "Failed");
            return norm(Array.isArray(j) ? j : []);
        },
    });

    // ── Actions ───────────────────────────────────────────────────────────────
    const handleMakeInvoice = useCallback(async () => {
        if (!selectedUnico) { toast.error("Select a prebook line first"); return; }
        setWorking(true);
        try {
            const r = await fetch("/api/pbook2invoice/make-invoice", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pbook_uq: selectedUnico }),
            });
            const j = await r.json();
            if (!r.ok || !j.success) throw new Error(j.error || "Failed to create invoice");
            toast.success("Invoice created successfully");
            setLinesKey(k => k + 1);
            setDatesKey(k => k + 1);
            qc.invalidateQueries({ queryKey: ["pb2inv-detail", selectedUnico] });
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setWorking(false);
        }
    }, [selectedUnico, qc]);

    const handleVoidLine = useCallback(() => {
        if (!selectedUnico) { toast.error("Select a prebook line first"); return; }
        toast("Void this prebook line?", {
            duration: 8000,
            action: {
                label: "Void",
                onClick: async () => {
                    setWorking(true);
                    try {
                        const r = await fetch("/api/pbook2invoice/void-line", {
                            method: "DELETE",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ unico: selectedUnico, boxes_delete: 1 }),
                        });
                        const j = await r.json();
                        if (!r.ok || !j.success) throw new Error(j.error || "Failed");
                        toast.success("Line voided");
                        setSelectedUnico(null);
                        setLinesKey(k => k + 1);
                        setDatesKey(k => k + 1);
                    } catch (e: any) {
                        toast.error(e.message);
                    } finally {
                        setWorking(false);
                    }
                },
            },
            cancel: { label: "Cancel", onClick: () => {} },
        });
    }, [selectedUnico]);

    const handleResetInv = useCallback(() => {
        if (!selectedDate) { toast.error("Select a date first"); return; }
        toast("Reset invoice data for this date?", {
            duration: 8000,
            action: {
                label: "Reset",
                onClick: async () => {
                    setWorking(true);
                    try {
                        const r = await fetch("/api/pbook2invoice/reset", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ date: selectedDate, mode: dateMode }),
                        });
                        const j = await r.json();
                        if (!r.ok || !j.success) throw new Error(j.error || "Failed");
                        toast.success(`Reset complete (${j.records ?? 0} records)`);
                        setLinesKey(k => k + 1);
                        setDatesKey(k => k + 1);
                    } catch (e: any) {
                        toast.error(e.message);
                    } finally {
                        setWorking(false);
                    }
                },
            },
            cancel: { label: "Cancel", onClick: () => {} },
        });
    }, [selectedDate, dateMode]);

    const selectDate = (dateStr: string) => {
        setSelectedDate(dateStr);
        setSelectedCustUq("%");
        setSelectedUnico(null);
    };

    const selectCustomer = (uq: string) => {
        setSelectedCustUq(uq);
        setSelectedUnico(null);
    };

    const switchMode = (mode: "delivery" | "shipping") => {
        setDateMode(mode);
        setSelectedDate(null);
        setSelectedCustUq("%");
        setSelectedUnico(null);
    };

    if (status === "loading") return (
        <div className="flex items-center justify-center h-screen">
            <Loader2 className="animate-spin text-blue-500" size={28} />
        </div>
    );
    if (status === "unauthenticated") { router.push("/login"); return null; }

    return (
        <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">

            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="flex items-center gap-3 px-4 py-2 bg-white border-b shadow-sm shrink-0">
                <button onClick={() => router.push("/menu")} className="p-1 rounded hover:bg-gray-100">
                    <ArrowLeft size={18} />
                </button>
                <FileText size={18} className="text-blue-600" />
                <h1 className="text-base font-semibold text-gray-800">Prebook to Invoice</h1>
                {working && <Loader2 size={15} className="animate-spin text-blue-400 ml-1" />}
                <div className="ml-auto">
                    <button
                        onClick={() => { setDatesKey(k => k + 1); setLinesKey(k => k + 1); }}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 border rounded hover:bg-gray-50"
                    >
                        <RefreshCcw size={13} /> Refresh
                    </button>
                </div>
            </div>

            {/* ── Top panels: dates + customers ───────────────────────────── */}
            <div className="flex gap-2 px-3 pt-2 pb-1 shrink-0 h-56">

                {/* Dates panel */}
                <div className="flex-1 flex flex-col bg-white rounded border shadow-sm overflow-hidden min-w-0">
                    <div className="flex items-center gap-1 px-2 py-1 border-b bg-blue-50 shrink-0">
                        <button
                            onClick={() => switchMode("delivery")}
                            className={cn("px-2 py-0.5 text-[11px] rounded font-medium transition",
                                dateMode === "delivery" ? "bg-blue-600 text-white" : "text-blue-700 hover:bg-blue-100")}
                        >
                            Delivery Date
                        </button>
                        <button
                            onClick={() => switchMode("shipping")}
                            className={cn("px-2 py-0.5 text-[11px] rounded font-medium transition",
                                dateMode === "shipping" ? "bg-blue-600 text-white" : "text-blue-700 hover:bg-blue-100")}
                        >
                            Shipping Date
                        </button>
                        {loadingDates && <Loader2 size={12} className="animate-spin text-blue-400 ml-auto" />}
                    </div>
                    <div className="overflow-auto flex-1">
                        <table className="w-full">
                            <thead className="sticky top-0 z-10">
                                <tr>
                                    <Th>{dateMode === "delivery" ? "Del. Date" : "Ship. Date"}</Th>
                                    <Th className="text-right">Prebks</Th>
                                    <Th className="text-right">T.Box</Th>
                                    <Th className="text-right">T.Purch</Th>
                                    <Th className="text-right">T.Ship</Th>
                                    <Th className="text-right">Invoice</Th>
                                    <Th className="text-right">Ext.Price</Th>
                                    <Th className="text-right">Cost</Th>
                                    <Th className="text-right">GP%</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {dateRows.map((row: any, i: number) => {
                                    const raw = t(row.PB_DATE ?? row.DELIVERY_DATE ?? row.SHIP_DATE ?? row.WHOUSE_DATE ?? "");
                                    const dateKey = raw.substring(0, 10);
                                    const bg = vfpColor(row.BACK_COLOR ?? row.BACKCOLOR);
                                    const sel = selectedDate === dateKey;
                                    return (
                                        <tr key={i} onClick={() => selectDate(dateKey)}
                                            className={cn("cursor-pointer hover:bg-blue-50 transition-colors", sel && "ring-1 ring-inset ring-blue-500 bg-blue-50")}
                                            style={!sel && bg ? { backgroundColor: bg } : undefined}
                                        >
                                            <Td className={sel ? "font-semibold text-blue-700" : ""}>{fmtDate(raw)}</Td>
                                            <Td className="text-right">{fmtI(row.PREBOOKS ?? row.PREBOOK_COUNT)}</Td>
                                            <Td className="text-right">{fmtI(row.T_BOX ?? row.TOTAL_BOX)}</Td>
                                            <Td className="text-right">{fmtI(row.T_PURCHASE ?? row.TOTAL_PURCHASE)}</Td>
                                            <Td className="text-right">{fmtI(row.T_SHIP ?? row.TOTAL_SHIP)}</Td>
                                            <Td className="text-right">{fmtI(row.INVOICE ?? row.INVOICED)}</Td>
                                            <Td className="text-right">{fmt(row.EXT_PRICE ?? row.EXTPRICE)}</Td>
                                            <Td className="text-right">{fmt(row.COST)}</Td>
                                            <Td className="text-right">{fmt(row.G_PROFIT_PCT ?? row.GPROFIT_PCT ?? row.GP_PCT)}%</Td>
                                        </tr>
                                    );
                                })}
                                {!loadingDates && dateRows.length === 0 && (
                                    <tr><td colSpan={9} className="text-center text-[11px] text-gray-400 py-4">No dates available</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Customers panel */}
                <div className="w-72 flex flex-col bg-white rounded border shadow-sm overflow-hidden shrink-0">
                    <div className="flex items-center gap-1 px-2 py-1 border-b bg-gray-50 shrink-0">
                        <span className="text-[11px] font-semibold text-gray-700">Customers</span>
                        {loadingCustomers && <Loader2 size={12} className="animate-spin text-gray-400 ml-auto" />}
                    </div>
                    <div className="overflow-auto flex-1">
                        <table className="w-full">
                            <thead className="sticky top-0 z-10">
                                <tr>
                                    <Th>Customer</Th>
                                    <Th className="text-right">Prebks</Th>
                                    <Th className="text-right">T.Box</Th>
                                    <Th className="text-right">Invoice</Th>
                                    <Th className="text-right">GP%</Th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr onClick={() => selectCustomer("%")}
                                    className={cn("cursor-pointer hover:bg-blue-50 transition-colors",
                                        selectedCustUq === "%" && "bg-blue-50 ring-1 ring-inset ring-blue-500")}
                                >
                                    <Td className={cn("font-medium", selectedCustUq === "%" && "text-blue-700")}>— All —</Td>
                                    <Td>{""}</Td><Td>{""}</Td><Td>{""}</Td><Td>{""}</Td>
                                </tr>
                                {customers.map((row: any, i: number) => {
                                    const uq = t(row.CUSTOMER_UQ ?? row.UNICO ?? "");
                                    const sel = selectedCustUq === uq;
                                    const bg = vfpColor(row.BACK_COLOR ?? row.BACKCOLOR);
                                    return (
                                        <tr key={i} onClick={() => selectCustomer(uq)}
                                            className={cn("cursor-pointer hover:bg-blue-50 transition-colors", sel && "bg-blue-50 ring-1 ring-inset ring-blue-500")}
                                            style={!sel && bg ? { backgroundColor: bg } : undefined}
                                        >
                                            <Td className={cn("font-medium", sel && "text-blue-700")}>{t(row.CUSTOMER ?? row.CUSTOMER_NAME)}</Td>
                                            <Td className="text-right">{fmtI(row.PREBOOKS ?? row.PREBOOK_COUNT)}</Td>
                                            <Td className="text-right">{fmtI(row.T_BOX ?? row.TOTAL_BOX)}</Td>
                                            <Td className="text-right">{fmtI(row.INVOICE ?? row.INVOICED)}</Td>
                                            <Td className="text-right">{fmt(row.G_PROFIT_PCT ?? row.GP_PCT)}%</Td>
                                        </tr>
                                    );
                                })}
                                {!loadingCustomers && !selectedDate && (
                                    <tr><td colSpan={5} className="text-center text-[11px] text-gray-400 py-3">Select a date</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ── Action button bar ────────────────────────────────────────── */}
            <div className="flex items-center gap-1 px-3 py-1 bg-white border-y shrink-0 flex-wrap">
                <ActionBtn icon={RotateCcw} label="Reset Inv." onClick={handleResetInv} disabled={!selectedDate || working} variant="warning" />
                <ActionBtn icon={Receipt}   label="Invoice"    onClick={() => {}} disabled={!selectedUnico} variant="default" />
                <ActionBtn icon={List}      label="Pick List"  onClick={() => {}} disabled={!selectedDate}  variant="default" />
                <span className="w-px h-4 bg-gray-200 mx-0.5" />
                <ActionBtn icon={Trash2}    label="Void Line"  onClick={handleVoidLine} disabled={!selectedUnico || !canDelete || working} variant="danger" />
                <span className="w-px h-4 bg-gray-200 mx-0.5" />
                <ActionBtn
                    icon={ShoppingCart} label="Stock OM"
                    onClick={() => { setActiveBottomTab(3); if (selectedUnico) fetchStockOm(); }}
                    disabled={!selectedUnico} variant="default"
                />
            </div>

            {/* ── Lines grid ───────────────────────────────────────────────── */}
            <div className="flex flex-col flex-1 overflow-hidden px-3 pt-1 pb-0 min-h-0">
                {/* Lines toolbar */}
                <div className="flex items-center gap-2 mb-1 shrink-0">
                    <Lock size={12} className="text-gray-400" />
                    <span className="text-[11px] font-semibold text-gray-700">Closed Prebook Boxes</span>
                    <div className="flex items-center border rounded bg-white px-2 py-0.5 gap-1 ml-2 w-48">
                        <Search size={11} className="text-gray-400 shrink-0" />
                        <input
                            value={productSearch}
                            onChange={e => setProductSearch(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") setAppliedSearch(productSearch); }}
                            placeholder="Search product..."
                            className="text-[11px] outline-none flex-1 min-w-0"
                        />
                        {productSearch && (
                            <button onClick={() => { setProductSearch(""); setAppliedSearch(""); }}>
                                <X size={11} className="text-gray-400 hover:text-gray-600" />
                            </button>
                        )}
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        {loadingLines && <Loader2 size={13} className="animate-spin text-blue-400" />}
                        <span className="text-[11px] text-gray-400">{(lines as any[]).length} rows</span>
                        <button
                            onClick={handleMakeInvoice}
                            disabled={!selectedUnico || !canEdit || working}
                            className="flex items-center gap-1 px-2 py-1 text-[11px] bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <Check size={12} /> Make Invoice
                        </button>
                    </div>
                </div>

                {/* Lines table */}
                <div className="flex-1 overflow-auto bg-white rounded border shadow-sm min-h-0">
                    <table className="w-full">
                        <thead className="sticky top-0 z-10">
                            <tr>
                                <Th>PO.No</Th>
                                <Th>SO.No</Th>
                                <Th>CustPO</Th>
                                <Th>Invoice</Th>
                                <Th>Description</Th>
                                <Th>Case</Th>
                                <Th className="text-right">UxPack</Th>
                                <Th className="text-right">PxCase</Th>
                                <Th className="text-right">UxCase</Th>
                                <Th className="text-right">QtySOrd</Th>
                                <Th className="text-right">QtyPOrd</Th>
                                <Th className="text-right">To Inv.</Th>
                                <Th className="text-right">S.Price</Th>
                                <Th>Ship Date</Th>
                                <Th>Customer</Th>
                                <Th className="text-right">Quality</Th>
                                <Th>WHouse</Th>
                                <Th>BoxId</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {(lines as any[]).map((row: any, i: number) => {
                                const unico = t(row.UNICO ?? row.PBOOK_BOX_UQ ?? "");
                                const sel = selectedUnico === unico;
                                const toInv = parseFloat(row.TO_INVOICE ?? 0);
                                const bg = vfpColor(row.BACK_COLOR ?? row.BACKCOLOR);
                                return (
                                    <tr key={i}
                                        onClick={() => setSelectedUnico(sel ? null : unico)}
                                        className={cn("cursor-pointer hover:bg-blue-50 transition-colors",
                                            sel && "bg-blue-100 ring-1 ring-inset ring-blue-500")}
                                        style={!sel && bg ? { backgroundColor: bg } : undefined}
                                    >
                                        <Td>{t(row.SORDER_NO ?? row.PO_NO)}</Td>
                                        <Td>{t(row.PBOOK_NO ?? row.SO_NO)}</Td>
                                        <Td>{t(row.CPORDER_NO ?? row.CUST_PO)}</Td>
                                        <Td>{t(row.INVOICE_NO ?? row.INVOICE)}</Td>
                                        <Td className="max-w-[140px] truncate">{t(row.DESCRIPTION ?? row.PRODUCT)}</Td>
                                        <Td>{t(row.CASE_SH ?? row.CASE)}</Td>
                                        <Td className="text-right">{fmtI(row.UP_X_PACK)}</Td>
                                        <Td className="text-right">{fmtI(row.PACKS_X_CASE)}</Td>
                                        <Td className="text-right">{fmtI(row.UNITS_X_BOX ?? row.UNITS_X_CASE)}</Td>
                                        <Td className="text-right">{fmtI(row.QTY_ORDER ?? row.QTY_SORDER)}</Td>
                                        <Td className="text-right">{fmtI(row.QTY_PORDER)}</Td>
                                        <Td className={cn("text-right font-semibold", toInv > 0 && "text-red-600")}>{fmtI(row.TO_INVOICE)}</Td>
                                        <Td className="text-right">{fmt(row.SO_PRICE ?? row.PRICE)}</Td>
                                        <Td>{fmtDate(row.PB_DATE ?? row.SHIP_DATE)}</Td>
                                        <Td>{t(row.CUSTOMER)}</Td>
                                        <Td className="text-right">{fmtI(row.BOXES_ADJUST ?? row.QUALITY)}</Td>
                                        <Td>{t(row.WAREHOUSE ?? row.WHOUSE)}</Td>
                                        <Td>{t(row.PCCODE ?? row.BOX_ID)}</Td>
                                    </tr>
                                );
                            })}
                            {!loadingLines && !selectedDate && (
                                <tr><td colSpan={18} className="text-center text-[11px] text-gray-400 py-8">Select a date to load prebook lines</td></tr>
                            )}
                            {!loadingLines && selectedDate && (lines as any[]).length === 0 && (
                                <tr><td colSpan={18} className="text-center text-[11px] text-gray-400 py-8">No prebook lines found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Bottom tabs panel ────────────────────────────────────────── */}
            <div className="flex flex-col bg-white border-t shadow-sm shrink-0 h-44">
                <div className="flex items-center gap-0 px-2 pt-1 border-b shrink-0">
                    {BOTTOM_TABS.map((tab, i) => (
                        <button key={i}
                            onClick={() => {
                                setActiveBottomTab(i);
                                if (i === 3 && selectedUnico) fetchStockOm();
                            }}
                            className={cn(
                                "px-3 py-1 text-[11px] font-medium border-b-2 transition-colors",
                                activeBottomTab === i
                                    ? "border-blue-500 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                    {!selectedUnico && (
                        <span className="ml-auto text-[10px] text-gray-400 pr-2">Select a line to see details</span>
                    )}
                </div>
                <div className="flex-1 overflow-auto">
                    {activeBottomTab === 0 && <InvoicedTab    rows={detail?.invoiced     ?? []} />}
                    {activeBottomTab === 1 && <AssignedStockTab rows={detail?.stockAssigned ?? []} />}
                    {activeBottomTab === 2 && <PurchaseTab    rows={detail?.purchase      ?? []} />}
                    {activeBottomTab === 3 && <StockOmTab     rows={stockOm} loading={loadingStockOm} />}
                    {activeBottomTab === 4 && <SimilarTab     rows={detail?.stockSimilar  ?? []} />}
                </div>
            </div>

        </div>
    );
}
