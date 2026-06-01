"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    ArrowLeft, RefreshCcw, FileText, Loader2,
    Search, X, RotateCcw, Receipt, List, ShoppingCart,
    Lock, Trash2, Check, Calendar, Users,
    Package, BookOpen, ClipboardList,
    FilePen, Paperclip, StickyNote, RefreshCw,
    UserCog, Scissors, Plus, Copy, Printer, Minus,
    FileX, Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { usePagePermissions } from "@/lib/permissions";
import { GridMenu } from "@/components/GridMenu";

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

const BOTTOM_TABS = [
    { id: "invoiced",  label: "Invoiced Prebooks",    icon: Receipt      },
    { id: "assigned",  label: "Assigned Stock",       icon: Package      },
    { id: "purchase",  label: "Purchase",             icon: ClipboardList },
    { id: "stockom",   label: "Stock OM",             icon: ShoppingCart },
    { id: "similar",   label: "Similar Products",     icon: BookOpen     },
] as const;
type BottomTabId = typeof BOTTOM_TABS[number]["id"];

// ─── Table cell helpers ────────────────────────────────────────────────────────
function Th({ children, className }: { children: any; className?: string }) {
    return (
        <th className={cn("p-2 text-left font-bold whitespace-nowrap text-gray-700 border-l border-gray-200 first:border-l-0", className)}>
            {children}
        </th>
    );
}
function Td({ children, className }: { children: any; className?: string }) {
    return (
        <td className={cn("p-2 whitespace-nowrap border-l border-gray-100 first:border-l-0", className)}>
            {children}
        </td>
    );
}

// ─── Toolbar button ────────────────────────────────────────────────────────────
function TBtn({ icon: Icon, label, onClick, disabled, variant = "default" }: any) {
    return (
        <button onClick={onClick} disabled={disabled}
            className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest border transition-all disabled:opacity-40 disabled:cursor-not-allowed",
                variant === "danger"  && "bg-red-50 hover:bg-red-100 border-red-200 text-red-600",
                variant === "warning" && "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-600",
                variant === "success" && "bg-green-600 hover:bg-green-700 border-transparent text-white",
                variant === "default" && "bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-600",
            )}
        >
            <Icon size={11} />{label}
        </button>
    );
}

// ─── Sub-header button for tab panels ─────────────────────────────────────────
function SBtn({ icon: Icon, label, onClick, disabled }: any) {
    return (
        <button onClick={onClick} disabled={disabled}
            className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest bg-white/10 hover:bg-white/20 text-white rounded border border-white/20 disabled:opacity-40 transition-all whitespace-nowrap"
        >
            {Icon && <Icon size={10} />}{label}
        </button>
    );
}

// ─── Bottom tab sub-components ─────────────────────────────────────────────────
function InvoicedTab({ rows }: { rows: any[] }) {
    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 px-3 py-1 bg-green-800 shrink-0">
                <span className="font-black text-[10px] text-white uppercase tracking-widest">Invoiced Prebooks</span>
                <SBtn icon={X}       label="Close"     onClick={() => {}} />
                <SBtn icon={Printer} label="Invoice"   onClick={() => {}} />
                <SBtn icon={Printer} label="Pick List" onClick={() => {}} />
                <div className="ml-auto"><Lock size={11} className="text-white/60" /></div>
            </div>
            <div className="flex-1 overflow-auto">
                <table className="min-w-full text-xs text-left">
                    <thead className="bg-gray-100 border-b text-gray-700 font-bold sticky top-0 z-10">
                        <tr>
                            <Th>Lot</Th><Th>InvoiceDate</Th><Th>Invoice</Th>
                            <Th className="text-right">Boxes</Th><Th className="text-right">UxCase</Th>
                            <Th className="text-right">Price</Th><Th className="text-right">TotalUnits</Th>
                            <Th className="text-right">Value</Th><Th>Vendor</Th><Th>Warehouse</Th>
                            <Th>Case</Th><Th className="text-right">UnitCost</Th>
                            <Th className="text-right">Days</Th><Th>Status</Th><Th>SoldProduct</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r, i) => (
                            <tr key={i} className="border-b odd:bg-white even:bg-gray-50 hover:bg-blue-50 text-gray-600">
                                <Td>{t(r.LOT)}</Td>
                                <Td>{fmtDate(r.INVOICE_DATE ?? r.INV_DATE ?? r.LDINV_DATE)}</Td>
                                <Td className="font-semibold text-blue-700">{t(r.INVOICE ?? r.INVOICE_NO)}</Td>
                                <Td className="text-right">{fmt(r.BOXES)}</Td>
                                <Td className="text-right">{fmtI(r.UNITS_X_CASE ?? r.UXCASE ?? r.UNITS_X_BOX)}</Td>
                                <Td className="text-right">{fmt(r.PRICE)}</Td>
                                <Td className="text-right">{fmt(r.TOTAL_UNITS)}</Td>
                                <Td className="text-right font-semibold">{fmt(r.VALUE)}</Td>
                                <Td>{t(r.VENDOR ?? r.GROWER)}</Td>
                                <Td>{t(r.WAREHOUSE ?? r.WHOUSE)}</Td>
                                <Td>{t(r.CASE_SH ?? r.CASE)}</Td>
                                <Td className="text-right">{fmt(r.UNIT_COST)}</Td>
                                <Td className="text-right">{fmtI(r.DAYS)}</Td>
                                <Td>{t(r.STATUS)}</Td>
                                <Td>{t(r.SOLD_PRODUCT)}</Td>
                            </tr>
                        ))}
                        {rows.length === 0 && <tr><td colSpan={15} className="p-6 text-center text-gray-400 italic">No invoiced prebooks</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function AssignedStockTab({ rows }: { rows: any[] }) {
    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-900 shrink-0">
                <span className="font-black text-[10px] text-white uppercase tracking-widest">Preassigned Stock</span>
                <div className="ml-auto flex gap-2">
                    <SBtn icon={Plus}  label="Assign to Prebook box" onClick={() => {}} />
                    <SBtn icon={Minus} label="Unassign Lot"          onClick={() => {}} />
                </div>
            </div>
            <div className="flex-1 overflow-auto">
                <table className="min-w-full text-xs text-left">
                    <thead className="bg-gray-100 border-b text-gray-700 font-bold sticky top-0 z-10">
                        <tr>
                            <Th>Customer</Th><Th>Warehouse</Th><Th>Vendor</Th>
                            <Th className="text-right">Stock</Th><Th className="text-right">UxPack</Th>
                            <Th className="text-right">PxCase</Th><Th className="text-right">UxCase</Th>
                            <Th>Lote</Th><Th>Date</Th><Th className="text-right">Days</Th>
                            <Th>Awb</Th><Th className="text-right">UnitPrice</Th>
                            <Th className="text-right">BoxValue</Th><Th className="text-right">TotalValue</Th>
                            <Th className="text-right">UnitCost</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r, i) => (
                            <tr key={i} className="border-b odd:bg-white even:bg-gray-50 hover:bg-blue-50 text-gray-600">
                                <Td>{t(r.CUSTOMER)}</Td>
                                <Td>{t(r.WAREHOUSE ?? r.WHOUSE)}</Td>
                                <Td>{t(r.VENDOR ?? r.GROWER)}</Td>
                                <Td className="text-right">{fmtI(r.STOCK ?? r.BOXES ?? r.QTY_BOXES)}</Td>
                                <Td className="text-right">{fmtI(r.UP_X_PACK ?? r.UXPACK)}</Td>
                                <Td className="text-right">{fmtI(r.PACKS_X_CASE ?? r.PXCASE)}</Td>
                                <Td className="text-right">{fmtI(r.UNITS_X_CASE ?? r.UNITS_X_BOX ?? r.UXCASE)}</Td>
                                <Td>{t(r.LOTE ?? r.LOT ?? r.PCCODE)}</Td>
                                <Td>{fmtDate(r.DATE ?? r.PACK_DATE)}</Td>
                                <Td className="text-right">{fmtI(r.DAYS ?? r.AGE)}</Td>
                                <Td>{t(r.AWB)}</Td>
                                <Td className="text-right">{fmt(r.UNIT_PRICE ?? r.UNITPRICE)}</Td>
                                <Td className="text-right">{fmt(r.BOX_VALUE ?? r.BOXVALUE)}</Td>
                                <Td className="text-right font-semibold">{fmt(r.TOTAL_VALUE ?? r.TOTALVALUE)}</Td>
                                <Td className="text-right">{fmt(r.UNIT_COST ?? r.UNITCOST)}</Td>
                            </tr>
                        ))}
                        {rows.length === 0 && <tr><td colSpan={15} className="p-6 text-center text-gray-400 italic">No assigned stock</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function PurchaseTab({ rows }: { rows: any[] }) {
    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-700 shrink-0">
                <span className="font-black text-[10px] text-white uppercase tracking-widest">Purchase by Prebook Box</span>
            </div>
            <div className="flex-1 overflow-auto">
                <table className="min-w-full text-xs text-left">
                    <thead className="bg-gray-100 border-b text-gray-700 font-bold sticky top-0 z-10">
                        <tr>
                            <Th>PO No.</Th><Th>Product</Th><Th>Vendor</Th>
                            <Th className="text-right">Boxes</Th><Th className="text-right">UxCase</Th>
                            <Th className="text-right">Cost</Th><Th>Status</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r, i) => (
                            <tr key={i} className="border-b odd:bg-white even:bg-gray-50 hover:bg-blue-50 text-gray-600">
                                <Td className="font-semibold">{t(r.PO_NO ?? r.PURCHASE_NO ?? r.SORDER_NO)}</Td>
                                <Td>{t(r.PRODUCT ?? r.DESCRIPTION)}</Td>
                                <Td>{t(r.VENDOR ?? r.GROWER)}</Td>
                                <Td className="text-right">{fmtI(r.BOXES ?? r.QTY_BOXES)}</Td>
                                <Td className="text-right">{fmtI(r.UNITS_X_CASE ?? r.UNITS_X_BOX)}</Td>
                                <Td className="text-right">{fmt(r.COST ?? r.UNIT_COST)}</Td>
                                <Td>{t(r.STATUS)}</Td>
                            </tr>
                        ))}
                        {rows.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-gray-400 italic">No purchase records</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function StockOmTab({ rows, loading }: { rows: any[]; loading: boolean }) {
    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-700 shrink-0">
                <span className="font-black text-[10px] text-white uppercase tracking-widest">Stock Open Market</span>
                <div className="ml-auto">
                    <SBtn icon={Plus} label="Assign to Prebook box" onClick={() => {}} />
                </div>
            </div>
            <div className="flex-1 overflow-auto">
                <table className="min-w-full text-xs text-left">
                    <thead className="bg-gray-100 border-b text-gray-700 font-bold sticky top-0 z-10">
                        <tr>
                            <Th>Customer</Th><Th>Warehouse</Th><Th>Vendor</Th>
                            <Th>Case</Th><Th className="text-right">UxPack</Th><Th className="text-right">PxCase</Th><Th className="text-right">UxCase</Th>
                            <Th>Lote</Th><Th className="text-right">Days</Th><Th>Awb</Th>
                            <Th className="text-right">Stock</Th><Th className="text-right">UnitPrice</Th>
                            <Th className="text-right">BoxValue</Th><Th className="text-right">TotalValue</Th>
                            <Th className="text-right">UnitCost</Th><Th>Date</Th>
                            <Th className="text-right">GPM</Th><Th>BoxId</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && <tr><td colSpan={18} className="p-6 text-center text-gray-400 italic"><Loader2 size={14} className="animate-spin inline mr-2" />Loading...</td></tr>}
                        {!loading && rows.map((r, i) => (
                            <tr key={i} className="border-b odd:bg-white even:bg-gray-50 hover:bg-blue-50 text-gray-600">
                                <Td>{t(r.CUSTOMER)}</Td>
                                <Td>{t(r.WAREHOUSE ?? r.WHOUSE)}</Td>
                                <Td>{t(r.VENDOR ?? r.GROWER)}</Td>
                                <Td>{t(r.CASE_SH ?? r.CASE)}</Td>
                                <Td className="text-right">{fmtI(r.UP_X_PACK ?? r.UXPACK)}</Td>
                                <Td className="text-right">{fmtI(r.PACKS_X_CASE ?? r.PXCASE)}</Td>
                                <Td className="text-right">{fmtI(r.UNITS_X_CASE ?? r.UNITS_X_BOX)}</Td>
                                <Td>{t(r.LOTE ?? r.LOT ?? r.PCCODE)}</Td>
                                <Td className="text-right">{fmtI(r.DAYS ?? r.AGE)}</Td>
                                <Td>{t(r.AWB)}</Td>
                                <Td className="text-right">{fmtI(r.STOCK ?? r.BOXES)}</Td>
                                <Td className="text-right">{fmt(r.UNIT_PRICE ?? r.UNITPRICE)}</Td>
                                <Td className="text-right">{fmt(r.BOX_VALUE ?? r.BOXVALUE)}</Td>
                                <Td className="text-right font-semibold">{fmt(r.TOTAL_VALUE ?? r.TOTALVALUE)}</Td>
                                <Td className="text-right">{fmt(r.UNIT_COST ?? r.UNITCOST)}</Td>
                                <Td>{fmtDate(r.DATE ?? r.PACK_DATE)}</Td>
                                <Td className="text-right">{fmt(r.GPM ?? r.GP_M)}</Td>
                                <Td>{t(r.BOX_ID ?? r.BOXID ?? r.PCCODE)}</Td>
                            </tr>
                        ))}
                        {!loading && rows.length === 0 && <tr><td colSpan={18} className="p-6 text-center text-gray-400 italic">Click Stock OM to load open market stock</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function SimilarTab({ rows }: { rows: any[] }) {
    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 px-3 py-1 bg-red-700 shrink-0">
                <span className="font-black text-[10px] text-white uppercase tracking-widest">Stock Open Market and Similar Products</span>
                <div className="ml-auto">
                    <SBtn icon={Plus} label="Assign to Prebook box" onClick={() => {}} />
                </div>
            </div>
            <div className="flex-1 overflow-auto">
                <table className="min-w-full text-xs text-left">
                    <thead className="bg-gray-100 border-b text-gray-700 font-bold sticky top-0 z-10">
                        <tr>
                            <Th>Customer</Th><Th>Warehouse</Th><Th>Vendor</Th>
                            <Th>Case</Th><Th className="text-right">UxPack</Th><Th className="text-right">PxCase</Th><Th className="text-right">UxCase</Th>
                            <Th>lote</Th><Th className="text-right">Days</Th><Th>Awb</Th>
                            <Th className="text-right">Stock</Th><Th className="text-right">UnitPrice</Th>
                            <Th className="text-right">BoxValue</Th><Th className="text-right">TotalValue</Th>
                            <Th>Description</Th><Th className="text-right">UnitCost</Th><Th className="text-right">G</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r, i) => (
                            <tr key={i} className="border-b odd:bg-white even:bg-gray-50 hover:bg-blue-50 text-gray-600">
                                <Td>{t(r.CUSTOMER)}</Td>
                                <Td>{t(r.WAREHOUSE ?? r.WHOUSE)}</Td>
                                <Td>{t(r.VENDOR ?? r.GROWER)}</Td>
                                <Td>{t(r.CASE_SH ?? r.CASE)}</Td>
                                <Td className="text-right">{fmtI(r.UP_X_PACK ?? r.UXPACK)}</Td>
                                <Td className="text-right">{fmtI(r.PACKS_X_CASE ?? r.PXCASE)}</Td>
                                <Td className="text-right">{fmtI(r.UNITS_X_CASE ?? r.UNITS_X_BOX)}</Td>
                                <Td>{t(r.LOTE ?? r.LOT ?? r.PCCODE)}</Td>
                                <Td className="text-right">{fmtI(r.DAYS ?? r.AGE)}</Td>
                                <Td>{t(r.AWB)}</Td>
                                <Td className="text-right">{fmtI(r.STOCK ?? r.BOXES)}</Td>
                                <Td className="text-right">{fmt(r.UNIT_PRICE ?? r.UNITPRICE)}</Td>
                                <Td className="text-right">{fmt(r.BOX_VALUE ?? r.BOXVALUE)}</Td>
                                <Td className="text-right font-semibold">{fmt(r.TOTAL_VALUE ?? r.TOTALVALUE)}</Td>
                                <Td className="max-w-[180px] truncate">{t(r.DESCRIPTION ?? r.PRODUCT)}</Td>
                                <Td className="text-right">{fmt(r.UNIT_COST ?? r.UNITCOST)}</Td>
                                <Td className="text-right">{fmt(r.G ?? r.GP_PCT)}</Td>
                            </tr>
                        ))}
                        {rows.length === 0 && <tr><td colSpan={17} className="p-6 text-center text-gray-400 italic">No similar products</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function Pbook2InvoicePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const qc = useQueryClient();
    const { canEdit, canDelete } = usePagePermissions("pbook2invoice");

    const [dateMode,        setDateMode]        = useState<"delivery" | "shipping">("delivery");
    const [selectedDate,    setSelectedDate]    = useState<string | null>(null);
    const [selectedCustUq,  setSelectedCustUq]  = useState<string>("%");
    const [productSearch,   setProductSearch]   = useState("");
    const [appliedSearch,   setAppliedSearch]   = useState("");
    const [selectedUnico,   setSelectedUnico]   = useState<string | null>(null);
    const [activeTab,       setActiveTab]       = useState<BottomTabId>("invoiced");
    const [datesKey,        setDatesKey]        = useState(0);
    const [linesKey,        setLinesKey]        = useState(0);
    const [working,         setWorking]         = useState(false);

    // ── Dates ─────────────────────────────────────────────────────────────────
    const { data: datesData, isFetching: loadingDates } = useQuery({
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
    const { data: customers = [], isFetching: loadingCustomers } = useQuery({
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
    const { data: lines = [], isFetching: loadingLines } = useQuery({
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

    // ── Detail ────────────────────────────────────────────────────────────────
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

    // ── Stock OM ──────────────────────────────────────────────────────────────
    const { data: stockOm = [], isFetching: loadingStockOm, refetch: fetchStockOm } = useQuery({
        queryKey: ["pb2inv-stockom", selectedUnico],
        enabled: false,
        queryFn: async () => {
            const line = (lines as any[]).find((l: any) => t(l.UNICO ?? l.PBOOK_BOX_UQ) === selectedUnico);
            const product_uq = t(line?.PRODUCT_UQ ?? selectedUnico ?? "");
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
            if (!r.ok || !j.success) throw new Error(j.error || "Failed");
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

    const switchMode = (mode: "delivery" | "shipping") => {
        setDateMode(mode);
        setSelectedDate(null);
        setSelectedCustUq("%");
        setSelectedUnico(null);
    };

    const selectDate = (dateStr: string) => {
        setSelectedDate(dateStr);
        setSelectedCustUq("%");
        setSelectedUnico(null);
    };

    const selectCustomer = (uq: string) => {
        setSelectedCustUq(uq);
        setSelectedUnico(null);
    };

    if (status === "loading") return null;
    if (status === "unauthenticated") { router.push("/login"); return null; }

    const selectedLine = (lines as any[]).find((l: any) => t(l.UNICO ?? l.PBOOK_BOX_UQ) === selectedUnico);

    return (
        <div className="flex flex-col h-screen bg-[#f4f6f8] overflow-hidden font-sans text-[#333]">

            {/* ── Dark header ─────────────────────────────────────────────── */}
            <div className="h-12 bg-[#374151] flex items-center justify-between px-4 shrink-0 text-white">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push("/menu")} className="hover:bg-white/10 p-1.5 rounded transition-colors">
                        <ArrowLeft size={18} />
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="font-black text-xs uppercase tracking-widest text-[#FB7506]">FOS</span>
                        <div className="w-px h-4 bg-white/20 mx-2" />
                        <span className="font-bold text-xs uppercase tracking-tight">Prebook to Invoice</span>
                    </div>
                    {working && <Loader2 size={14} className="animate-spin text-[#FB7506] ml-2" />}
                </div>
                <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest">
                    {selectedLine && (
                        <>
                            <span className="text-gray-400">Customer: <span className="text-white">{t(selectedLine.CUSTOMER)}</span></span>
                            <span className="text-gray-400">PO: <span className="text-[#FB7506]">{t(selectedLine.SORDER_NO ?? selectedLine.PO_NO)}</span></span>
                        </>
                    )}
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

            {/* ── TOP PANELS: Dates (left) + Customers (right) ────────────── */}
            <div className="flex gap-2 px-2 pt-2 shrink-0 h-80">

                {/* Dates panel */}
                <div className="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden w-[540px] shrink-0">
                    <div className="h-10 bg-[#374151] flex items-center justify-between px-3 shrink-0 rounded-t-lg">
                        <div className="flex items-center gap-2">
                            <Calendar size={13} className="text-[#FB7506]" />
                            <span className="font-black text-[10px] uppercase tracking-widest text-white">
                                Date Picker [Closed Prebooks]
                            </span>
                            {loadingDates && <RefreshCcw size={10} className="text-gray-400 animate-spin" />}
                        </div>
                        <div className="flex items-center gap-1">
                            {(["delivery", "shipping"] as const).map(m => (
                                <button key={m} onClick={() => switchMode(m)}
                                    className={cn(
                                        "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest transition-all",
                                        dateMode === m
                                            ? "bg-[#FB7506] text-white"
                                            : "text-gray-400 hover:text-white hover:bg-white/10"
                                    )}
                                >
                                    {m === "delivery" ? "Delivery" : "Arrival"}
                                </button>
                            ))}
                            <button onClick={() => setDatesKey(k => k + 1)}
                                className="ml-1 flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white text-[10px] font-black px-2 py-0.5 rounded transition-all"
                            >
                                <RefreshCcw size={10} /> Refresh
                            </button>
                        </div>
                    </div>
                    <div className="overflow-y-auto flex-1">
                        <table className="min-w-full text-xs text-left">
                            <thead className="bg-gray-100 border-b text-gray-700 font-bold sticky top-0 z-10">
                                <tr>
                                    <th className="p-2">{dateMode === "delivery" ? "Delivery Date" : "Arrival Date"}</th>
                                    <th className="p-2 text-right border-l border-gray-200">Prebks</th>
                                    <th className="p-2 text-right border-l border-gray-200">T.Box</th>
                                    <th className="p-2 text-right border-l border-gray-200">T.Purch</th>
                                    <th className="p-2 text-right border-l border-gray-200">T.Ship</th>
                                    <th className="p-2 text-right border-l border-gray-200">Invoice</th>
                                    <th className="p-2 text-right border-l border-gray-200">Ext.Price</th>
                                    <th className="p-2 text-right border-l border-gray-200">Cost</th>
                                    <th className="p-2 text-right border-l border-gray-200">G.Profit%</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dateRows.length === 0 && !loadingDates && (
                                    <tr><td colSpan={9} className="p-6 text-center text-gray-400 italic">No dates available</td></tr>
                                )}
                                {dateRows.map((row: any, i: number) => {
                                    const raw = t(row.PB_DATE ?? row.WHOUSE_DATE ?? "");
                                    const dateKey = raw.substring(0, 10);
                                    const sel = selectedDate === dateKey;
                                    const bg = vfpColor(row.COLOR);
                                    return (
                                        <tr key={i} onClick={() => selectDate(dateKey)}
                                            className={cn("border-b cursor-pointer transition-colors",
                                                sel ? "!bg-blue-100 ring-2 ring-inset ring-blue-300" : "odd:bg-white even:bg-gray-50 hover:bg-blue-50")}
                                            style={!sel && bg ? { backgroundColor: bg } : undefined}
                                            title={t(row.TOOLTIP)}
                                        >
                                            <td className="p-2 font-medium">{fmtDate(raw)}</td>
                                            <td className="p-2 text-right border-l border-gray-100">{fmtI(row.RECORDS)}</td>
                                            <td className="p-2 text-right border-l border-gray-100">{fmtI(row.QTY_ORDER)}</td>
                                            <td className="p-2 text-right border-l border-gray-100">{fmtI(row.QTY_PORDER)}</td>
                                            <td className="p-2 text-right border-l border-gray-100">{fmtI(row.QTY_SHIP)}</td>
                                            <td className="p-2 text-right border-l border-gray-100 font-semibold">{fmtI(row.QTY_INVOICE)}</td>
                                            <td className="p-2 text-right border-l border-gray-100">{fmt(row.TOTAL_SALE)}</td>
                                            <td className="p-2 text-right border-l border-gray-100">{fmt(row.TOTAL_PURCHASE)}</td>
                                            <td className="p-2 text-right border-l border-gray-100">{fmt(row.PROFIT)}%</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Customers panel */}
                <div className="flex-1 flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden min-w-0">
                    <div className="h-10 bg-[#374151] flex items-center justify-between px-3 shrink-0 rounded-t-lg">
                        <div className="flex items-center gap-2">
                            <Users size={13} className="text-[#FB7506]" />
                            <span className="font-black text-[10px] uppercase tracking-widest text-white">
                                Customers {selectedDate ? `— ${fmtDate(selectedDate)}` : ""}
                            </span>
                            {loadingCustomers && <RefreshCcw size={10} className="text-gray-400 animate-spin" />}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button onClick={handleMakeInvoice} disabled={!selectedDate || working}
                                className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest bg-red-600 hover:bg-red-500 text-white rounded disabled:opacity-40 transition-all whitespace-nowrap"
                            >
                                <Check size={10} /> Make Invoices
                            </button>
                            <button onClick={() => {}} disabled={!selectedDate}
                                className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest bg-white/10 hover:bg-white/20 text-white rounded border border-white/20 disabled:opacity-40 transition-all whitespace-nowrap"
                            >
                                <Printer size={10} /> Without Invoice
                            </button>
                            <button onClick={() => {}} disabled={!selectedDate}
                                className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest bg-white/10 hover:bg-white/20 text-white rounded border border-white/20 disabled:opacity-40 transition-all whitespace-nowrap"
                            >
                                <Link2 size={10} /> Invoices
                            </button>
                        </div>
                    </div>
                    <div className="overflow-auto flex-1">
                        <table className="min-w-full text-xs text-left">
                            <thead className="bg-gray-100 border-b text-gray-700 font-bold sticky top-0 z-10">
                                <tr>
                                    <th className="p-2">Customer</th>
                                    <th className="p-2 text-right border-l border-gray-200">Prebks</th>
                                    <th className="p-2 text-right border-l border-gray-200">CrLimit</th>
                                    <th className="p-2 text-right border-l border-gray-200">T.Box</th>
                                    <th className="p-2 text-right border-l border-gray-200">T.Purch</th>
                                    <th className="p-2 text-right border-l border-gray-200">T.Ship</th>
                                    <th className="p-2 text-right border-l border-gray-200">Invoice</th>
                                    <th className="p-2 text-right border-l border-gray-200">Ext.Price</th>
                                    <th className="p-2 text-right border-l border-gray-200">Cost</th>
                                    <th className="p-2 text-right border-l border-gray-200">G.Profit%</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr onClick={() => selectCustomer("%")}
                                    className={cn("border-b cursor-pointer transition-colors",
                                        selectedCustUq === "%" ? "!bg-blue-100 ring-2 ring-inset ring-blue-300" : "bg-white hover:bg-blue-50")}
                                >
                                    <td className="p-2 font-bold text-gray-500 italic">ALL</td>
                                    <td className="p-2 border-l border-gray-100" /><td className="p-2 border-l border-gray-100" />
                                    <td className="p-2 border-l border-gray-100" /><td className="p-2 border-l border-gray-100" />
                                    <td className="p-2 border-l border-gray-100" /><td className="p-2 border-l border-gray-100" />
                                    <td className="p-2 border-l border-gray-100" /><td className="p-2 border-l border-gray-100" />
                                    <td className="p-2 border-l border-gray-100" />
                                </tr>
                                {!selectedDate && <tr><td colSpan={10} className="p-4 text-center text-gray-400 italic">Select a date</td></tr>}
                                {(customers as any[]).filter((row: any) => t(row.CUSTOMER_UQ ?? "") !== "%").map((row: any, i: number) => {
                                    const uq = t(row.CUSTOMER_UQ ?? "");
                                    const sel = selectedCustUq === uq;
                                    const bg = vfpColor(row.COLOR);
                                    return (
                                        <tr key={i} onClick={() => selectCustomer(uq)}
                                            className={cn("border-b cursor-pointer transition-colors text-gray-600",
                                                sel ? "!bg-blue-100 ring-2 ring-inset ring-blue-300" : "odd:bg-white even:bg-gray-50 hover:bg-blue-50")}
                                            style={!sel && bg ? { backgroundColor: bg } : undefined}
                                            title={t(row.TOOLTIP)}
                                        >
                                            <td className="p-2 font-medium">{t(row.CUSTOMER)}</td>
                                            <td className="p-2 text-right border-l border-gray-100">{fmtI(row.RECORDS)}</td>
                                            <td className="p-2 text-right border-l border-gray-100">{fmt(row.CREDIT_LIMIT)}</td>
                                            <td className="p-2 text-right border-l border-gray-100">{fmtI(row.QTY_ORDER)}</td>
                                            <td className="p-2 text-right border-l border-gray-100">{fmtI(row.QTY_PORDER)}</td>
                                            <td className="p-2 text-right border-l border-gray-100">{fmtI(row.QTY_SHIP)}</td>
                                            <td className="p-2 text-right border-l border-gray-100 font-semibold">{fmtI(row.QTY_INVOICE)}</td>
                                            <td className="p-2 text-right border-l border-gray-100">{fmt(row.TOTAL_SALE)}</td>
                                            <td className="p-2 text-right border-l border-gray-100">{fmt(row.TOTAL_PURCHASE)}</td>
                                            <td className="p-2 text-right border-l border-gray-100">{fmt(row.PROFIT)}%</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ── ACTION BUTTON BAR (below top panels, full width) ─────────── */}
            <div className="h-9 bg-white border border-gray-200 flex items-center px-3 gap-1 shrink-0 shadow-sm overflow-x-auto mx-2 rounded-lg mt-2">
                <TBtn icon={FilePen}      label="Change PO"      onClick={() => {}} disabled={!selectedUnico} />
                <TBtn icon={Paperclip}    label="Attach Invoice"  onClick={() => {}} disabled={!selectedUnico} />
                <div className="w-px h-5 bg-gray-200 mx-0.5 shrink-0" />
                <TBtn icon={RotateCcw}    label="Reset Inv."      onClick={handleResetInv} disabled={!selectedDate || working} variant="warning" />
                <TBtn icon={Receipt}      label="Invoice"         onClick={() => {}} disabled={!selectedUnico} />
                <TBtn icon={List}         label="Pick List"       onClick={() => {}} disabled={!selectedDate} />
                <TBtn icon={StickyNote}   label="Notes"           onClick={() => {}} disabled={!selectedUnico} />
                <TBtn icon={ShoppingCart} label="Stock OM"        onClick={() => { setActiveTab("stockom"); if (selectedUnico) fetchStockOm(); }} disabled={!selectedUnico} />
                <div className="w-px h-5 bg-gray-200 mx-0.5 shrink-0" />
                <TBtn icon={Search}       label="Search"          onClick={() => {}} />
                <TBtn icon={RefreshCw}    label="Update"          onClick={() => { setLinesKey(k => k + 1); }} disabled={!selectedDate} />
                <TBtn icon={UserCog}      label="Change Cust."    onClick={() => {}} disabled={!selectedUnico} />
                <div className="w-px h-5 bg-gray-200 mx-0.5 shrink-0" />
                <TBtn icon={Trash2}       label="Void Line"       onClick={handleVoidLine} disabled={!selectedUnico || !canDelete || working} variant="danger" />
                <TBtn icon={Scissors}     label="Partial Invoice" onClick={() => {}} disabled={!selectedUnico} />
            </div>

            {/* ── LINES + TABS (full width, flex-1) ───────────────────────── */}
            <div className="flex flex-col flex-1 overflow-hidden px-2 pb-2 pt-0 gap-0 min-h-0">

                {/* Orange header bar — "Closed Prebook box by date and customer" */}
                <div className="h-9 bg-[#FB7506] flex items-center justify-between px-3 shrink-0 mt-2 rounded-t-lg">
                    <div className="flex items-center gap-2">
                        <Lock size={13} className="text-white" />
                        <span className="font-black text-[10px] uppercase tracking-widest text-white">
                            Closed Prebook box by date and customer
                        </span>
                        {loadingLines && <RefreshCcw size={10} className="text-white/70 animate-spin" />}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center bg-white rounded px-2 py-0.5 gap-1 w-56">
                            <Search size={11} className="text-gray-400 shrink-0" />
                            <input
                                value={productSearch}
                                onChange={e => setProductSearch(e.target.value)}
                                onKeyDown={e => { if (e.key === "Enter") setAppliedSearch(productSearch); }}
                                placeholder="Search product..."
                                className="text-[11px] text-gray-700 placeholder-gray-400 outline-none flex-1 min-w-0 bg-transparent"
                            />
                            {productSearch && (
                                <button onClick={() => { setProductSearch(""); setAppliedSearch(""); }}>
                                    <X size={11} className="text-gray-400 hover:text-gray-700" />
                                </button>
                            )}
                        </div>
                        <span className="text-[9px] font-black text-white/70 whitespace-nowrap">{(lines as any[]).length} rows</span>
                        <button onClick={() => {}}
                            className="flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap"
                        >
                            <List size={11} /> Prebook Line
                        </button>
                        <button onClick={() => {}} disabled={!selectedDate}
                            className="flex items-center gap-1.5 bg-white hover:bg-gray-100 text-gray-700 px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed transition-all whitespace-nowrap"
                        >
                            <Copy size={11} /> Gen. Invoices
                        </button>
                        <button onClick={handleMakeInvoice} disabled={!selectedUnico || !canEdit || working}
                            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed transition-all whitespace-nowrap"
                        >
                            <Check size={11} /> Make Invoice
                        </button>
                    </div>
                </div>

                {/* Lines table */}
                <div className="flex-1 overflow-auto bg-white border border-t-0 border-gray-200 shadow-sm min-h-0 rounded-b-lg">
                    <table className="min-w-full text-xs text-left">
                        <thead className="bg-gray-100 border-b text-gray-700 font-bold sticky top-0 z-10">
                            <tr>
                                <th className="p-2 whitespace-nowrap">PO.No</th>
                                <th className="p-2 whitespace-nowrap border-l border-gray-200">SO.No</th>
                                <th className="p-2 whitespace-nowrap border-l border-gray-200">CustPO</th>
                                <th className="p-2 whitespace-nowrap border-l border-gray-200">Invoice</th>
                                <th className="p-2 whitespace-nowrap border-l border-gray-200">Description</th>
                                <th className="p-2 whitespace-nowrap border-l border-gray-200">Case</th>
                                <th className="p-2 whitespace-nowrap text-right border-l border-gray-200">UxPack</th>
                                <th className="p-2 whitespace-nowrap text-right border-l border-gray-200">PxCase</th>
                                <th className="p-2 whitespace-nowrap text-right border-l border-gray-200">UxCase</th>
                                <th className="p-2 whitespace-nowrap text-right border-l border-gray-200">Qty_SOrder</th>
                                <th className="p-2 whitespace-nowrap text-right border-l border-gray-200">Qty_POrder</th>
                                <th className="p-2 whitespace-nowrap text-right border-l border-gray-200 text-red-600">To_invoice</th>
                                <th className="p-2 whitespace-nowrap text-right border-l border-gray-200">S.Price</th>
                                <th className="p-2 whitespace-nowrap border-l border-gray-200">C.Ship-Date</th>
                                <th className="p-2 whitespace-nowrap border-l border-gray-200">Customer</th>
                                <th className="p-2 whitespace-nowrap text-right border-l border-gray-200">Quality</th>
                                <th className="p-2 whitespace-nowrap border-l border-gray-200">WHouse</th>
                                <th className="p-2 whitespace-nowrap border-l border-gray-200">BoxId</th>
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
                                        className={cn("border-b cursor-pointer transition-colors text-gray-600",
                                            sel ? "!bg-blue-100 ring-2 ring-inset ring-blue-300" : "odd:bg-white even:bg-gray-50 hover:bg-blue-50")}
                                        style={!sel && bg ? { backgroundColor: bg } : undefined}
                                    >
                                        <td className="p-2 whitespace-nowrap">{t(row.SORDER_NO ?? row.PO_NO)}</td>
                                        <td className="p-2 whitespace-nowrap border-l border-gray-100 font-semibold text-blue-700">{t(row.PBOOK_NO ?? row.SO_NO)}</td>
                                        <td className="p-2 whitespace-nowrap border-l border-gray-100">{t(row.CPORDER_NO ?? row.CUST_PO)}</td>
                                        <td className="p-2 whitespace-nowrap border-l border-gray-100">{t(row.INVOICE_NO ?? row.INVOICE)}</td>
                                        <td className="p-2 whitespace-nowrap border-l border-gray-100 max-w-[160px] truncate">{t(row.DESCRIPTION ?? row.PRODUCT)}</td>
                                        <td className="p-2 whitespace-nowrap border-l border-gray-100">{t(row.CASE_SH ?? row.CASE)}</td>
                                        <td className="p-2 whitespace-nowrap border-l border-gray-100 text-right">{fmtI(row.UP_X_PACK)}</td>
                                        <td className="p-2 whitespace-nowrap border-l border-gray-100 text-right">{fmtI(row.PACKS_X_CASE)}</td>
                                        <td className="p-2 whitespace-nowrap border-l border-gray-100 text-right">{fmtI(row.UNITS_X_BOX ?? row.UNITS_X_CASE)}</td>
                                        <td className="p-2 whitespace-nowrap border-l border-gray-100 text-right">{fmtI(row.QTY_ORDER ?? row.QTY_SORDER)}</td>
                                        <td className="p-2 whitespace-nowrap border-l border-gray-100 text-right">{fmtI(row.QTY_PORDER)}</td>
                                        <td className={cn("p-2 whitespace-nowrap border-l border-gray-100 text-right font-bold", toInv > 0 ? "text-red-600" : "")}>{fmtI(row.TO_INVOICE)}</td>
                                        <td className="p-2 whitespace-nowrap border-l border-gray-100 text-right font-semibold">{fmt(row.SO_PRICE ?? row.PRICE)}</td>
                                        <td className="p-2 whitespace-nowrap border-l border-gray-100">{fmtDate(row.PB_DATE ?? row.SHIP_DATE)}</td>
                                        <td className="p-2 whitespace-nowrap border-l border-gray-100 font-medium">{t(row.CUSTOMER)}</td>
                                        <td className="p-2 whitespace-nowrap border-l border-gray-100 text-right">{fmtI(row.BOXES_ADJUST ?? row.QUALITY)}</td>
                                        <td className="p-2 whitespace-nowrap border-l border-gray-100">{t(row.WAREHOUSE ?? row.WHOUSE)}</td>
                                        <td className="p-2 whitespace-nowrap border-l border-gray-100 text-gray-400">{t(row.PCCODE ?? row.BOX_ID)}</td>
                                    </tr>
                                );
                            })}
                            {!loadingLines && !selectedDate && (
                                <tr><td colSpan={18} className="p-10 text-center text-gray-400 italic">Select a date to load prebook lines</td></tr>
                            )}
                            {!loadingLines && selectedDate && (lines as any[]).length === 0 && (
                                <tr><td colSpan={18} className="p-10 text-center text-gray-400 italic">No prebook lines found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ── Bottom detail tabs ──────────────────────────────────── */}
                <div className="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden h-[230px] shrink-0 mt-1">
                    <div className="h-10 bg-[#374151] flex items-end px-2 shrink-0 gap-0.5">
                        {BOTTOM_TABS.map(tab => (
                            <button key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    if (tab.id === "stockom" && selectedUnico) fetchStockOm();
                                }}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 h-7 text-[10px] font-black uppercase tracking-wider rounded-t transition-all",
                                    activeTab === tab.id
                                        ? "bg-[#f4f6f8] text-[#FB7506] border-b-2 border-[#FB7506]"
                                        : "text-gray-400 hover:text-white hover:bg-white/10"
                                )}
                            >
                                <tab.icon size={11} />
                                {tab.label}
                            </button>
                        ))}
                        {!selectedUnico && (
                            <span className="ml-auto text-[9px] font-black text-gray-500 uppercase tracking-widest self-center pr-2">
                                Select a line to see details
                            </span>
                        )}
                    </div>
                    <div className="flex-1 overflow-hidden flex flex-col bg-[#f4f6f8]">
                        {activeTab === "invoiced"  && <InvoicedTab      rows={detail?.invoiced      ?? []} />}
                        {activeTab === "assigned"  && <AssignedStockTab rows={detail?.stockAssigned ?? []} />}
                        {activeTab === "purchase"  && <PurchaseTab      rows={detail?.purchase      ?? []} />}
                        {activeTab === "stockom"   && <StockOmTab       rows={stockOm} loading={loadingStockOm} />}
                        {activeTab === "similar"   && <SimilarTab       rows={detail?.stockSimilar  ?? []} />}
                    </div>
                </div>

            </div>
        </div>
    );
}
