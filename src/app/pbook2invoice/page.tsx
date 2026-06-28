"use client";

import { useState, useCallback, useEffect, type CSSProperties } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    RefreshCcw, FileText, Loader2,
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
import AppHeader from "@/components/layout/AppHeader";
import AppFooter from "@/components/layout/AppFooter";
import { ModalUpdateLine } from "@/components/pbook2invoice/ModalUpdateLine";
import { ModalChangePO } from "@/components/pbook2invoice/ModalChangePO";
import { ModalUnassignStock } from "@/components/pbook2invoice/ModalUnassignStock";
import { ModalAttachInvoice } from "@/components/pbook2invoice/ModalAttachInvoice";
import { ModalPartialInvoice } from "@/components/pbook2invoice/ModalPartialInvoice";
import { ReportModal } from "@/components/reports/ReportModal";
import { ModalInvoicesByCustomer } from "@/components/pbook2invoice/ModalInvoicesByCustomer";
import { usePbook2InvoiceStore } from "@/store/usePbook2InvoiceStore";
const EMPTY_ARR: any[] = [];

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
// Subtle 6%-tint + colored left border, matching POS's vfpRowStyle (not a solid fill)
const vfpRowStyle = (c: any): CSSProperties | undefined => {
    const n = parseInt(c ?? 0);
    if (!n || n <= 0) return undefined;
    const r = n & 0xFF; const g = (n >> 8) & 0xFF; const b = (n >> 16) & 0xFF;
    const rgb = `${r},${g},${b}`;
    return {
        borderLeftColor: `rgb(${rgb})`,
        borderLeftWidth: "3px",
        borderLeftStyle: "solid",
        backgroundColor: `rgba(${rgb},0.06)`,
    };
};

const BOTTOM_TABS = [
    { id: "invoiced",  label: "Invoiced Prebooks",    icon: Receipt      },
    { id: "assigned",  label: "Assigned Stock",       icon: Package      },
    { id: "purchase",  label: "Purchase",             icon: ClipboardList },
    { id: "stockom",   label: "Stock OM",             icon: ShoppingCart },
    { id: "similar",   label: "Similar Products",     icon: BookOpen     },
] as const;

// ─── Table cell helpers ────────────────────────────────────────────────────────
function Th({ children, className }: { children: any; className?: string }) {
    return (
        <th className={cn("p-2 text-left font-bold whitespace-nowrap border-r border-[#DBD9D9]/30 last:border-r-0", className)}>
            {children}
        </th>
    );
}
function Td({ children, className }: { children: any; className?: string }) {
    return (
        <td className={cn("p-2 whitespace-nowrap border-r border-[#DBD9D9] last:border-r-0", className)}>
            {children}
        </td>
    );
}

// ─── Toolbar button ────────────────────────────────────────────────────────────
function TBtn({ icon: Icon, label, onClick, disabled, variant = "default" }: any) {
    return (
        <button onClick={onClick} disabled={disabled}
            className={cn(
                "flex items-center gap-1.5 px-3 h-7 rounded-md text-[14px] font-semibold uppercase tracking-wide border transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap shrink-0",
                variant === "danger"  && "bg-[#FB7506]/10 hover:bg-[#FB7506]/20 border-[#FB7506]/30 text-[#FB7506]",
                variant === "warning" && "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-600",
                variant === "success" && "bg-green-600 hover:bg-green-700 border-transparent text-white",
                variant === "default" && "bg-white hover:bg-gray-50 border-[#DBD9D9] text-[#4F4F4F]",
            )}
        >
            <Icon size={14} />{label}
        </button>
    );
}

// ─── Sub-header button for tab panels ─────────────────────────────────────────
function SBtn({ icon: Icon, label, onClick, disabled }: any) {
    return (
        <button onClick={onClick} disabled={disabled}
            className="flex items-center gap-1.5 px-3 h-7 text-[14px] font-semibold uppercase tracking-wide bg-white hover:bg-gray-50 text-[#4F4F4F] rounded-md border border-[#DBD9D9] disabled:opacity-40 transition-all whitespace-nowrap"
        >
            {Icon && <Icon size={14} />}{label}
        </button>
    );
}

// ─── Bottom tab sub-components ─────────────────────────────────────────────────
function InvoicedTab({ rows }: { rows: any[] }) {
    return (
        <div>
            <div className="flex items-center gap-2 px-3 h-10 bg-white border-b border-[#DBD9D9] shrink-0">
                <Receipt size={14} className="text-[#FB7506] shrink-0"/>
                <span className="font-bold text-[14px] text-[#4F4F4F] uppercase tracking-tight">Invoiced Prebooks</span>
                <SBtn icon={X}       label="Close"     onClick={() => {}} />
                <SBtn icon={Printer} label="Invoice"   onClick={() => {}} />
                <SBtn icon={Printer} label="Pick List" onClick={() => {}} />
                <div className="ml-auto"><Lock size={11} className="text-gray-400" /></div>
            </div>
            <div className="h-[230px] overflow-y-auto">
                <table className="min-w-full text-xs text-left">
                    <thead className="bg-[#4F4F4F] text-white text-[11px] font-bold uppercase sticky top-0 z-10">
                        <tr>
                            <Th>Lot</Th><Th>InvoiceDate</Th><Th>Invoice</Th>
                            <Th className="text-right">Boxes</Th><Th className="text-right">UxCase</Th>
                            <Th className="text-right">Price</Th><Th className="text-right">TotalUnits</Th>
                            <Th className="text-right">Value</Th><Th>Vendor</Th><Th>Warehouse</Th>
                            <Th>Case</Th><Th className="text-right">UnitCost</Th>
                            <Th className="text-right">Days</Th><Th>Status</Th><Th>SoldProduct</Th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DBD9D9]">
                        {rows.map((r, i) => (
                            <tr key={i} className="hover:bg-gray-50 text-gray-600">
                                <Td>{t(r.LOTE)}</Td>
                                <Td>{fmtDate(r.INVOICE_DATE)}</Td>
                                <Td className="font-semibold text-blue-700">{t(r.INVOICE_NO)}</Td>
                                <Td className="text-right">{fmt(r.BOX_QTY)}</Td>
                                <Td className="text-right">{fmtI(r.UNITS_X_BOX)}</Td>
                                <Td className="text-right">{fmt(r.PRICE)}</Td>
                                <Td className="text-right">{fmt(r.TOTAL_UNITS)}</Td>
                                <Td className="text-right font-semibold">{fmt(r.EXT_PRICE)}</Td>
                                <Td>{t(r.GROWER)}</Td>
                                <Td>{t(r.WP_NAME)}</Td>
                                <Td>{t(r.CASE_SH)}</Td>
                                <Td className="text-right">{fmt(r.FARM_UNIT_PRICE)}</Td>
                                <Td className="text-right">{fmtI(r.DAYS)}</Td>
                                <Td>{t(r.STATUS)}</Td>
                                <Td>{t(r.DESCRIPTION)}</Td>
                            </tr>
                        ))}
                        {rows.length === 0 && <tr><td colSpan={15} className="p-6 text-center text-gray-400 italic">No invoiced prebooks</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function AssignedStockTab({ rows, onUnassign }: { rows: any[]; onUnassign: (row: any) => void }) {
    const [selected, setSelected] = useState<string | null>(null);
    const selRow = rows.find(r => t(r.UNICO) === selected);
    return (
        <div>
            <div className="flex items-center gap-2 px-3 h-10 bg-white border-b border-[#DBD9D9] shrink-0">
                <Package size={14} className="text-[#FB7506] shrink-0"/>
                <span className="font-bold text-[14px] text-[#4F4F4F] uppercase tracking-tight">Preassigned Stock</span>
                <div className="ml-auto flex gap-2">
                    <SBtn icon={Plus}  label="Assign to Prebook box" onClick={() => {}} />
                    <SBtn icon={Minus} label="Unassign Lot" disabled={!selRow} onClick={() => selRow && onUnassign(selRow)} />
                </div>
            </div>
            <div className="h-[230px] overflow-y-auto">
                <table className="min-w-full text-xs text-left">
                    <thead className="bg-[#4F4F4F] text-white text-[11px] font-bold uppercase sticky top-0 z-10">
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
                    <tbody className="divide-y divide-[#DBD9D9]">
                        {rows.map((r, i) => {
                            const uq = t(r.UNICO);
                            const sel = selected === uq;
                            return (
                                <tr key={i} onClick={() => setSelected(sel ? null : uq)}
                                    className={cn("cursor-pointer transition-colors", sel ? "!bg-[#FB7506]/10" : "hover:bg-gray-50 text-gray-600")}>
                                    <Td>{t(r.CUSTOMER)}</Td>
                                    <Td>{t(r.WAREHOUSE)}</Td>
                                    <Td>{t(r.GROWER)}</Td>
                                    <Td className="text-right">{fmtI(r.WH_STOCK)}</Td>
                                    <Td className="text-right">{fmtI(r.UP_X_PACK)}</Td>
                                    <Td className="text-right">{fmtI(r.PACKS_BOX)}</Td>
                                    <Td className="text-right">{fmtI(r.TUNITS_X_BOX)}</Td>
                                    <Td>{t(r.LOTE)}</Td>
                                    <Td>{fmtDate(r.BOX_DATE)}</Td>
                                    <Td className="text-right">{fmtI(r.DAYS)}</Td>
                                    <Td>{t(r.AWBCODE)}</Td>
                                    <Td className="text-right">{fmt(r.PRICE_X_UNIT)}</Td>
                                    <Td className="text-right">{fmt(r.BOXVALUE)}</Td>
                                    <Td className="text-right font-semibold">{fmt(r.STOCKVALUE)}</Td>
                                    <Td className="text-right">{fmt(r.FARM_UNIT_PRICE)}</Td>
                                </tr>
                            );
                        })}
                        {rows.length === 0 && <tr><td colSpan={15} className="p-6 text-center text-gray-400 italic">No assigned stock</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function PurchaseTab({ rows }: { rows: any[] }) {
    return (
        <div>
            <div className="flex items-center gap-2 px-3 h-10 bg-white border-b border-[#DBD9D9] shrink-0">
                <ClipboardList size={14} className="text-[#FB7506] shrink-0"/>
                <span className="font-bold text-[14px] text-[#4F4F4F] uppercase tracking-tight">Purchase by Prebook Box</span>
            </div>
            <div className="h-[230px] overflow-y-auto">
                <table className="min-w-full text-xs text-left">
                    <thead className="bg-[#4F4F4F] text-white text-[11px] font-bold uppercase sticky top-0 z-10">
                        <tr>
                            <Th>PO No.</Th><Th>Product</Th><Th>Vendor</Th>
                            <Th className="text-right">Boxes</Th><Th className="text-right">UxCase</Th>
                            <Th className="text-right">Cost</Th><Th>Status</Th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DBD9D9]">
                        {rows.map((r, i) => (
                            <tr key={i} className="hover:bg-gray-50 text-gray-600">
                                <Td className="font-semibold">{t(r.CPO_NUMBER ?? r.SORDER_NO)}</Td>
                                <Td>{t(r.DESCRIPTION)}</Td>
                                <Td>{t(r.GROWER)}</Td>
                                <Td className="text-right">{fmtI(r.QTY_PORDER)}</Td>
                                <Td className="text-right">{fmtI(r.TUNITS_X_BOX)}</Td>
                                <Td className="text-right">{fmt(r.PO_PRICE)}</Td>
                                <Td>{r.ACTIVE ? "Active" : "Inactive"}</Td>
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
        <div>
            <div className="flex items-center gap-2 px-3 h-10 bg-white border-b border-[#DBD9D9] shrink-0">
                <ShoppingCart size={14} className="text-[#FB7506] shrink-0"/>
                <span className="font-bold text-[14px] text-[#4F4F4F] uppercase tracking-tight">Stock Open Market</span>
                <div className="ml-auto">
                    <SBtn icon={Plus} label="Assign to Prebook box" onClick={() => {}} />
                </div>
            </div>
            <div className="h-[230px] overflow-y-auto">
                <table className="min-w-full text-xs text-left">
                    <thead className="bg-[#4F4F4F] text-white text-[11px] font-bold uppercase sticky top-0 z-10">
                        <tr>
                            <Th>Warehouse</Th><Th>Vendor</Th>
                            <Th>Case</Th><Th className="text-right">UxPack</Th><Th className="text-right">PxCase</Th><Th className="text-right">UxCase</Th>
                            <Th>Lote</Th><Th className="text-right">Days</Th><Th>Awb</Th>
                            <Th className="text-right">Stock</Th><Th className="text-right">UnitPrice</Th>
                            <Th className="text-right">BoxValue</Th><Th className="text-right">TotalValue</Th>
                            <Th className="text-right">UnitCost</Th><Th>Date</Th>
                            <Th className="text-right">GPM</Th><Th>BoxId</Th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DBD9D9]">
                        {loading && <tr><td colSpan={17} className="p-6 text-center text-gray-400 italic"><Loader2 size={14} className="animate-spin inline mr-2" />Loading...</td></tr>}
                        {!loading && rows.map((r, i) => (
                            <tr key={i} className="hover:bg-gray-50 text-gray-600">
                                <Td>{t(r.WAREHOUSE)}</Td>
                                <Td>{t(r.GROWER)}</Td>
                                <Td>{t(r.CASE_SH)}</Td>
                                <Td className="text-right">{fmtI(r.UP_X_PACK)}</Td>
                                <Td className="text-right">{fmtI(r.PACKS_BOX)}</Td>
                                <Td className="text-right">{fmtI(r.TUNITS_X_BOX)}</Td>
                                <Td>{t(r.LOTE)}</Td>
                                <Td className="text-right">{fmtI(r.DAYS)}</Td>
                                <Td>{t(r.AWBCODE)}</Td>
                                <Td className="text-right">{fmtI(r.WH_STOCK)}</Td>
                                <Td className="text-right">{fmt(r.PRICE_X_UNIT)}</Td>
                                <Td className="text-right">{fmt(r.BOXVALUE)}</Td>
                                <Td className="text-right font-semibold">{fmt(r.STOCKVALUE)}</Td>
                                <Td className="text-right">{fmt(r.FARM_UNIT_PRICE)}</Td>
                                <Td>{fmtDate(r.BOX_DATE)}</Td>
                                <Td className="text-right">{fmt(r.GPM)}</Td>
                                <Td>{t(r.BOX_ID)}</Td>
                            </tr>
                        ))}
                        {!loading && rows.length === 0 && <tr><td colSpan={17} className="p-6 text-center text-gray-400 italic">Click Stock OM to load open market stock</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function SimilarTab({ rows }: { rows: any[] }) {
    return (
        <div>
            <div className="flex items-center gap-2 px-3 h-10 bg-white border-b border-[#DBD9D9] shrink-0">
                <BookOpen size={14} className="text-[#FB7506] shrink-0"/>
                <span className="font-bold text-[14px] text-[#4F4F4F] uppercase tracking-tight">Stock Open Market and Similar Products</span>
                <div className="ml-auto">
                    <SBtn icon={Plus} label="Assign to Prebook box" onClick={() => {}} />
                </div>
            </div>
            <div className="h-[230px] overflow-y-auto">
                <table className="min-w-full text-xs text-left">
                    <thead className="bg-[#4F4F4F] text-white text-[11px] font-bold uppercase sticky top-0 z-10">
                        <tr>
                            <Th>Warehouse</Th><Th>Vendor</Th>
                            <Th>Case</Th><Th className="text-right">UxPack</Th><Th className="text-right">PxCase</Th><Th className="text-right">UxCase</Th>
                            <Th>lote</Th><Th className="text-right">Days</Th><Th>Awb</Th>
                            <Th className="text-right">Stock</Th><Th className="text-right">UnitPrice</Th>
                            <Th className="text-right">BoxValue</Th><Th className="text-right">TotalValue</Th>
                            <Th>Description</Th><Th className="text-right">UnitCost</Th><Th className="text-right">GPM</Th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DBD9D9]">
                        {rows.map((r, i) => (
                            <tr key={i} className="hover:bg-gray-50 text-gray-600">
                                <Td>{t(r.WAREHOUSE)}</Td>
                                <Td>{t(r.GROWER)}</Td>
                                <Td>{t(r.CASE_SH)}</Td>
                                <Td className="text-right">{fmtI(r.UP_X_PACK)}</Td>
                                <Td className="text-right">{fmtI(r.PACKS_BOX)}</Td>
                                <Td className="text-right">{fmtI(r.TUNITS_X_BOX)}</Td>
                                <Td>{t(r.LOTE)}</Td>
                                <Td className="text-right">{fmtI(r.DAYS)}</Td>
                                <Td>{t(r.AWBCODE)}</Td>
                                <Td className="text-right">{fmtI(r.WH_STOCK)}</Td>
                                <Td className="text-right">{fmt(r.PRICE_X_UNIT)}</Td>
                                <Td className="text-right">{fmt(r.BOXVALUE)}</Td>
                                <Td className="text-right font-semibold">{fmt(r.STOCKVALUE)}</Td>
                                <Td className="max-w-[180px] truncate">{t(r.DESCRIPTION)}</Td>
                                <Td className="text-right">{fmt(r.FARM_UNIT_PRICE)}</Td>
                                <Td className="text-right">{fmt(r.GPM)}</Td>
                            </tr>
                        ))}
                        {rows.length === 0 && <tr><td colSpan={16} className="p-6 text-center text-gray-400 italic">No similar products</td></tr>}
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

    const {
        dateMode, setDateMode,
        selectedDate, setSelectedDate,
        selectedCustUq, setSelectedCustUq,
        productSearch, setProductSearch,
        appliedSearch, setAppliedSearch,
        selectedUnico, setSelectedUnico,
        activeTab, setActiveTab,
        datesKey, bumpDatesKey,
        linesKey, bumpLinesKey,
        working, setWorking,
        modalUpdateLine, setModalUpdateLine,
        modalChangePO, setModalChangePO,
        modalUnassign, setModalUnassign,
        modalAttach, setModalAttach,
        modalPartial, setModalPartial,
        reportModalUrl, setReportModalUrl,
        modalInvoicesByCustomer, setModalInvoicesByCustomer,
    } = usePbook2InvoiceStore();

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

    // ── Auto-select closest date to today on first load or after mode switch ──
    useEffect(() => {
        if (selectedDate || dateRows.length === 0) return;
        const today = new Date().toISOString().slice(0, 10);
        let bestKey = "";
        let bestDiff = Infinity;
        for (const row of dateRows) {
            const key = t(row.PB_DATE ?? row.WHOUSE_DATE ?? "").substring(0, 10);
            if (!key) continue;
            const diff = Math.abs(new Date(key).getTime() - new Date(today).getTime());
            if (diff < bestDiff) { bestDiff = diff; bestKey = key; }
        }
        if (bestKey) {
            setSelectedDate(bestKey);
            setSelectedCustUq("%");
            setSelectedUnico(null);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dateRows]);

    // ── Customers ─────────────────────────────────────────────────────────────
    const { data: customers = EMPTY_ARR, isFetching: loadingCustomers } = useQuery({
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
    const { data: lines = EMPTY_ARR, isFetching: loadingLines } = useQuery({
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
    const selectedLine = (lines as any[]).find((l: any) => t(l.UNICO ?? l.PBOOK_BOX_UQ) === selectedUnico);

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
    const { data: stockOm = EMPTY_ARR, isFetching: loadingStockOm, refetch: fetchStockOm } = useQuery({
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
        const pbook_uq = t(selectedLine?.PBOOK_UQ);
        if (!pbook_uq) { toast.error("Select a prebook line first"); return; }
        setWorking(true);
        try {
            const r = await fetch("/api/pbook2invoice/make-invoice", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pbook_uq }),
            });
            const j = await r.json();
            if (!r.ok || !j.success) throw new Error(j.error || "Failed");
            toast.success("Invoice created successfully");
            bumpLinesKey();
            bumpDatesKey();
            qc.invalidateQueries({ queryKey: ["pb2inv-detail", selectedUnico] });
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setWorking(false);
        }
    }, [selectedLine, selectedUnico, qc]);

    const handleMakeInvoicesBulk = useCallback(async () => {
        if (!selectedDate) { toast.error("Select a date first"); return; }
        if (!selectedCustUq || selectedCustUq === "%") { toast.error("Select a specific customer first"); return; }
        setWorking(true);
        try {
            const r = await fetch("/api/pbook2invoice/make-invoices-bulk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ customer_uq: selectedCustUq, date: selectedDate, mode: dateMode }),
            });
            const j = await r.json();
            if (!r.ok || !j.success) throw new Error(j.error || "Failed");
            toast.success(j.message || "Invoices created successfully");
            bumpLinesKey();
            bumpDatesKey();
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setWorking(false);
        }
    }, [selectedDate, selectedCustUq, dateMode]);

    const handleGenInvoices = useCallback(async () => {
        const pbook_uq = t(selectedLine?.PBOOK_UQ);
        if (!pbook_uq) { toast.error("Select a prebook line first"); return; }
        setWorking(true);
        try {
            const r = await fetch("/api/pbook2invoice/gen-invoices", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pbook_uq }),
            });
            const j = await r.json();
            if (!r.ok || !j.success) throw new Error(j.error || "Failed");
            toast.success("Invoice header generated");
            bumpLinesKey();
            bumpDatesKey();
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setWorking(false);
        }
    }, [selectedLine]);

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
                            body: JSON.stringify({ unico: selectedUnico }),
                        });
                        const j = await r.json();
                        if (!r.ok || !j.success) throw new Error(j.error || "Failed");
                        toast.success("Line voided");
                        setSelectedUnico(null);
                        bumpLinesKey();
                        bumpDatesKey();
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
        const pbook_uq = t(selectedLine?.PBOOK_UQ);
        if (!pbook_uq) { toast.error("Select a prebook line first"); return; }
        toast("Unlink this prebook from its invoice number?", {
            duration: 8000,
            action: {
                label: "Reset",
                onClick: async () => {
                    setWorking(true);
                    try {
                        const r = await fetch("/api/pbook2invoice/reset", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ pbook_uq }),
                        });
                        const j = await r.json();
                        if (!r.ok || !j.success) throw new Error(j.error || "Failed");
                        toast.success("Invoice number reset");
                        bumpLinesKey();
                        bumpDatesKey();
                    } catch (e: any) {
                        toast.error(e.message);
                    } finally {
                        setWorking(false);
                    }
                },
            },
            cancel: { label: "Cancel", onClick: () => {} },
        });
    }, [selectedLine]);

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

    return (
        <div className="flex flex-col min-h-screen bg-[#FBF9F8] font-sans text-[#333]">

            {/* ── Dark header ─────────────────────────────────────────────── */}
            <AppHeader title="Prebook to Invoice" extraRight={working ? <Loader2 size={14} className="animate-spin text-white/60" /> : undefined} />

            {/* ── Date Picker (left) + Customers (right) — side by side, no nesting ── */}
            <div className="flex flex-col lg:flex-row gap-2 mx-2 mt-2 shrink-0 lg:max-h-[280px]">

                {/* Left: Date Picker */}
                <div className="flex flex-col bg-white rounded-lg border border-[#DBD9D9] shadow-sm overflow-hidden flex-1 lg:flex-[0.9] min-w-0">
                    <div className="h-10 bg-white border-b border-[#DBD9D9] flex items-center px-3 shrink-0 rounded-t-lg">
                        <Calendar size={15} className="text-[#FB7506]" />
                        <span className="text-[14px] font-bold uppercase tracking-tight text-[#4F4F4F] ml-2">
                            Date Picker [Closed Prebooks]
                        </span>
                        {loadingDates && <RefreshCcw size={10} className="text-gray-400 animate-spin ml-2" />}
                    </div>
                    <div className="h-10 bg-[#F5F3F3] border-b border-[#DBD9D9] flex items-center justify-end px-3 gap-1.5 shrink-0 overflow-x-auto">
                        {(["delivery", "shipping"] as const).map(m => (
                            <button key={m} onClick={() => switchMode(m)}
                                className={cn(
                                    "px-3 h-7 rounded-md text-[14px] font-semibold uppercase tracking-wide transition-all shrink-0",
                                    dateMode === m
                                        ? "bg-[#FB7506] text-white"
                                        : "text-gray-500 hover:text-[#FB7506] hover:bg-white"
                                )}
                            >
                                {m === "delivery" ? "Delivery" : "Arrival"}
                            </button>
                        ))}
                        <button onClick={() => bumpDatesKey()}
                            className="flex items-center gap-1.5 bg-white hover:bg-gray-50 border border-[#DBD9D9] text-[#4F4F4F] text-[14px] font-semibold px-3 h-7 rounded-md transition-all shrink-0"
                        >
                            <RefreshCcw size={14} /> Refresh
                        </button>
                    </div>
                    <div className="bg-white border-b border-[#DBD9D9] p-1 text-right text-[10px] text-gray-400 font-bold italic pr-4 shrink-0">
                        {dateRows.length} Records
                    </div>
                    <div className="overflow-y-auto flex-1">
                        <table className="min-w-full text-xs text-left">
                            <thead className="bg-[#4F4F4F] text-white text-[11px] font-bold uppercase sticky top-0 z-10">
                                <tr className="divide-x divide-[#DBD9D9]/30">
                                    <th className="p-2">{dateMode === "delivery" ? "Delivery Date" : "Arrival Date"}</th>
                                    <th className="p-2 text-right">Prebks</th>
                                    <th className="p-2 text-right">T.Box</th>
                                    <th className="p-2 text-right">T.Purch</th>
                                    <th className="p-2 text-right">T.Ship</th>
                                    <th className="p-2 text-right">Invoice</th>
                                    <th className="p-2 text-right">Ext.Price</th>
                                    <th className="p-2 text-right">Cost</th>
                                    <th className="p-2 text-right">G.Profit%</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#DBD9D9]">
                                {dateRows.length === 0 && !loadingDates && (
                                    <tr><td colSpan={9} className="p-6 text-center text-gray-400 italic">No dates available</td></tr>
                                )}
                                {dateRows.map((row: any, i: number) => {
                                    const raw = t(row.PB_DATE ?? row.WHOUSE_DATE ?? "");
                                    const dateKey = raw.substring(0, 10);
                                    const sel = selectedDate === dateKey;
                                    const rowStyle = vfpRowStyle(row.COLOR);
                                    return (
                                        <tr key={i} onClick={() => selectDate(dateKey)}
                                            className={cn("cursor-pointer transition-colors divide-x divide-[#DBD9D9]",
                                                sel ? "!bg-[#FB7506]/10" : "hover:bg-gray-50")}
                                            style={!sel ? rowStyle : undefined}
                                            title={t(row.TOOLTIP)}
                                        >
                                            <td className="p-2 font-medium">{fmtDate(raw)}</td>
                                            <td className="p-2 text-right">{fmtI(row.RECORDS)}</td>
                                            <td className="p-2 text-right">{fmtI(row.QTY_ORDER)}</td>
                                            <td className="p-2 text-right">{fmtI(row.QTY_PORDER)}</td>
                                            <td className="p-2 text-right">{fmtI(row.QTY_SHIP)}</td>
                                            <td className="p-2 text-right font-semibold">{fmtI(row.QTY_INVOICE)}</td>
                                            <td className="p-2 text-right">{fmt(row.TOTAL_SALE)}</td>
                                            <td className="p-2 text-right">{fmt(row.TOTAL_PURCHASE)}</td>
                                            <td className="p-2 text-right">{fmt(row.PROFIT)}%</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right: Customers for the selected date */}
                <div className="flex flex-col bg-white rounded-lg border border-[#DBD9D9] shadow-sm overflow-hidden flex-1 lg:flex-[1.1] min-w-0">
                    <div className="h-10 bg-white border-b border-[#DBD9D9] flex items-center px-3 shrink-0 rounded-t-lg min-w-0">
                        <Users size={15} className="text-[#FB7506] shrink-0" />
                        <span className="text-[14px] font-bold uppercase tracking-tight text-[#4F4F4F] truncate ml-2">
                            {selectedDate ? `Customers — ${fmtDate(selectedDate)}` : "Customers"}
                        </span>
                        {loadingCustomers && <RefreshCcw size={10} className="text-gray-400 animate-spin shrink-0 ml-2" />}
                    </div>
                    <div className="h-10 bg-[#F5F3F3] border-b border-[#DBD9D9] flex items-center justify-end px-3 gap-1.5 shrink-0 overflow-x-auto">
                        <button onClick={handleMakeInvoicesBulk} disabled={!selectedDate || selectedCustUq === "%" || working}
                            className="flex items-center gap-1.5 px-3 h-7 text-[14px] font-semibold uppercase tracking-wide bg-green-600 hover:bg-green-500 text-white rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-all whitespace-nowrap shrink-0"
                        >
                            <Check size={14} /> Make Invoices
                        </button>
                        <button onClick={() => setReportModalUrl(`/api/pbook2invoice/reports/without-invoice?customer_uq=${encodeURIComponent(selectedCustUq)}&date=${selectedDate}&mode=${dateMode}`)} disabled={!selectedDate}
                            className="flex items-center gap-1 px-3 h-7 text-[14px] font-semibold uppercase tracking-wide bg-white hover:bg-gray-50 border border-[#DBD9D9] text-[#4F4F4F] rounded-md disabled:opacity-40 transition-all whitespace-nowrap shrink-0"
                        >
                            <Printer size={14} /> Without Invoice
                        </button>
                        <button onClick={() => setModalInvoicesByCustomer(true)} disabled={!selectedDate || selectedCustUq === "%"}
                            className="flex items-center gap-1 px-3 h-7 text-[14px] font-semibold uppercase tracking-wide bg-white hover:bg-gray-50 border border-[#DBD9D9] text-[#4F4F4F] rounded-md disabled:opacity-40 transition-all whitespace-nowrap shrink-0"
                        >
                            <Link2 size={14} /> Invoices
                        </button>
                    </div>
                    <div className="bg-white border-b border-[#DBD9D9] p-1 text-right text-[10px] text-gray-400 font-bold italic pr-4 shrink-0">
                        {(customers as any[]).filter((row: any) => t(row.CUSTOMER_UQ ?? "") !== "%").length} Records
                    </div>
                    <div className="overflow-y-auto flex-1">
                        <table className="min-w-full text-xs text-left">
                            <thead className="bg-[#4F4F4F] text-white text-[11px] font-bold uppercase sticky top-0 z-10">
                                <tr className="divide-x divide-[#DBD9D9]/30">
                                    <th className="p-2">Customer</th>
                                    <th className="p-2 text-right">Prebks</th>
                                    <th className="p-2 text-right">CrLimit</th>
                                    <th className="p-2 text-right">T.Box</th>
                                    <th className="p-2 text-right">T.Purch</th>
                                    <th className="p-2 text-right">T.Ship</th>
                                    <th className="p-2 text-right">Invoice</th>
                                    <th className="p-2 text-right">Ext.Price</th>
                                    <th className="p-2 text-right">Cost</th>
                                    <th className="p-2 text-right">G.Profit%</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#DBD9D9]">
                                {!selectedDate && (
                                    <tr><td colSpan={10} className="p-6 text-center text-gray-400 italic">Select a date on the left</td></tr>
                                )}
                                {selectedDate && (
                                    <tr onClick={() => selectCustomer("%")}
                                        className={cn("cursor-pointer transition-colors divide-x divide-[#DBD9D9]",
                                            selectedCustUq === "%" ? "!bg-[#FB7506]/10" : "bg-white hover:bg-gray-50")}
                                    >
                                        <td className="p-2 font-bold text-gray-500 italic">ALL</td>
                                        <td className="p-2" /><td className="p-2" />
                                        <td className="p-2" /><td className="p-2" />
                                        <td className="p-2" /><td className="p-2" />
                                        <td className="p-2" /><td className="p-2" />
                                        <td className="p-2" />
                                    </tr>
                                )}
                                {(customers as any[]).filter((row: any) => t(row.CUSTOMER_UQ ?? "") !== "%").map((row: any, j: number) => {
                                    const uq = t(row.CUSTOMER_UQ ?? "");
                                    const selCust = selectedCustUq === uq;
                                    const custRowStyle = vfpRowStyle(row.COLOR);
                                    return (
                                        <tr key={j} onClick={() => selectCustomer(uq)}
                                            className={cn("cursor-pointer transition-colors text-gray-600 divide-x divide-[#DBD9D9]",
                                                selCust ? "!bg-[#FB7506]/10" : "hover:bg-gray-50")}
                                            style={!selCust ? custRowStyle : undefined}
                                            title={t(row.TOOLTIP)}
                                        >
                                            <td className="p-2 font-medium">{t(row.CUSTOMER)}</td>
                                            <td className="p-2 text-right">{fmtI(row.RECORDS)}</td>
                                            <td className="p-2 text-right">{fmt(row.CREDIT_LIMIT)}</td>
                                            <td className="p-2 text-right">{fmtI(row.QTY_ORDER)}</td>
                                            <td className="p-2 text-right">{fmtI(row.QTY_PORDER)}</td>
                                            <td className="p-2 text-right">{fmtI(row.QTY_SHIP)}</td>
                                            <td className="p-2 text-right font-semibold">{fmtI(row.QTY_INVOICE)}</td>
                                            <td className="p-2 text-right">{fmt(row.TOTAL_SALE)}</td>
                                            <td className="p-2 text-right">{fmt(row.TOTAL_PURCHASE)}</td>
                                            <td className="p-2 text-right">{fmt(row.PROFIT)}%</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ── ACTION BUTTON BAR — sticks to the top once scrolled past the Date/Customer row, so the grids below keep the buttons in reach ── */}
            <div className="sticky top-0 z-20 h-11 bg-[#F5F3F3] border border-[#DBD9D9] flex items-center px-3 gap-1.5 shrink-0 shadow-sm overflow-x-auto mx-2 rounded-lg mt-2">
                <TBtn icon={RefreshCw}    label="Update"          onClick={() => setModalUpdateLine({ open: true, tab: "details" })} disabled={!selectedUnico} />
                <TBtn icon={Trash2}       label="Void Line"       onClick={handleVoidLine} disabled={!selectedUnico || !canDelete || working} variant="danger" />
                <div className="w-px h-5 bg-[#DBD9D9] mx-0.5 shrink-0" />
                <div className="flex items-center bg-white border border-[#DBD9D9] rounded px-2 py-1 gap-1 w-56 shrink-0">
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
                <TBtn icon={List}   label="Prebook Line"  onClick={() => {}} />
                <TBtn icon={Copy}   label="Gen. Invoices"  onClick={handleGenInvoices} disabled={!selectedUnico || working} />
                <TBtn icon={Check}  label="Make Invoice"   onClick={handleMakeInvoice} disabled={!selectedUnico || !canEdit || working} variant="success" />
            </div>

            {/* ── Closed Prebook box by date and customer (Lines) — separate panel, not nested in any grid ── */}
            <div className="flex flex-col bg-white rounded-lg border border-[#DBD9D9] shadow-sm overflow-hidden mx-2 mt-2 h-[432px] shrink-0">
                <div className="h-10 bg-white border-b border-[#DBD9D9] flex items-center px-3 shrink-0 min-w-0">
                    <Lock size={15} className="text-[#FB7506] shrink-0" />
                    <span className="text-[14px] font-bold uppercase tracking-tight text-[#4F4F4F] truncate ml-2">
                        Closed Prebook box by date and customer
                    </span>
                    {loadingLines && <RefreshCcw size={10} className="text-gray-400 animate-spin shrink-0 ml-2" />}
                </div>
                <div className="h-10 bg-[#F5F3F3] border-b border-[#DBD9D9] flex items-center justify-end px-3 gap-2 shrink-0 overflow-x-auto">
                    <GridMenu items={[
                        { label: "Change PO",       icon: FilePen,     color: "blue",   onClick: () => setModalChangePO(true), disabled: !selectedUnico },
                        { label: "Attach Invoice",  icon: Paperclip,   color: "blue",   onClick: () => setModalAttach(true), disabled: !selectedUnico },
                        { label: "Partial Invoice", icon: Scissors,    color: "blue",   onClick: () => setModalPartial(true), disabled: !selectedUnico, separator: true },
                        { label: "Reset Inv.",      icon: RotateCcw,   color: "amber",  onClick: handleResetInv, disabled: !selectedUnico || working },
                        { label: "Notes",           icon: StickyNote,  color: "purple", onClick: () => setModalUpdateLine({ open: true, tab: "notes" }), disabled: !selectedUnico },
                        { label: "Stock OM",        icon: ShoppingCart, color: "purple", onClick: () => { setActiveTab("stockom"); if (selectedUnico) fetchStockOm(); }, disabled: !selectedUnico, separator: true },
                        { label: "Pick List",       icon: List,        color: "gray",   onClick: () => setReportModalUrl(`/api/pbook2invoice/reports/pick-list?invoice_uq=${encodeURIComponent(t(selectedLine?.INVOICE_UQ))}`), disabled: !t(selectedLine?.INVOICE_UQ) || !parseInt(selectedLine?.INVOICE_NO ?? 0) },
                        { label: "Invoice",         icon: Receipt,     color: "gray",   onClick: () => {}, disabled: !selectedUnico, separator: true },
                        { label: "Search",          icon: Search,      color: "gray",   onClick: () => {} },
                        { label: "Change Cust.",    icon: UserCog,     color: "gray",   onClick: () => {}, disabled: !selectedUnico },
                    ]} />
                </div>
                <div className="bg-white border-b border-[#DBD9D9] p-1 text-right text-[10px] text-gray-400 font-bold italic pr-4 shrink-0">
                    {(lines as any[]).length} Records
                </div>

                <div className="flex-1 overflow-auto">
                    <table className="min-w-full text-xs text-left">
                        <thead className="bg-[#4F4F4F] text-white text-[11px] font-bold uppercase sticky top-0 z-10">
                            <tr className="divide-x divide-[#DBD9D9]/30">
                                <th className="p-2 whitespace-nowrap">PO.No</th>
                                <th className="p-2 whitespace-nowrap">SO.No</th>
                                <th className="p-2 whitespace-nowrap">CustPO</th>
                                <th className="p-2 whitespace-nowrap">Invoice</th>
                                <th className="p-2 whitespace-nowrap">Description</th>
                                <th className="p-2 whitespace-nowrap">Case</th>
                                <th className="p-2 whitespace-nowrap text-right">UxPack</th>
                                <th className="p-2 whitespace-nowrap text-right">PxCase</th>
                                <th className="p-2 whitespace-nowrap text-right">UxCase</th>
                                <th className="p-2 whitespace-nowrap text-right">Qty_SOrder</th>
                                <th className="p-2 whitespace-nowrap text-right">Qty_POrder</th>
                                <th className="p-2 whitespace-nowrap text-right">To_invoice</th>
                                <th className="p-2 whitespace-nowrap text-right">S.Price</th>
                                <th className="p-2 whitespace-nowrap">C.Ship-Date</th>
                                <th className="p-2 whitespace-nowrap">Customer</th>
                                <th className="p-2 whitespace-nowrap text-right">Quality</th>
                                <th className="p-2 whitespace-nowrap">WHouse</th>
                                <th className="p-2 whitespace-nowrap">BoxId</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#DBD9D9]">
                            {(lines as any[]).map((row: any, i: number) => {
                                const unico = t(row.UNICO ?? row.PBOOK_BOX_UQ ?? "");
                                const sel = selectedUnico === unico;
                                const toInv = parseFloat(row.TO_INVOICE ?? 0);
                                const rowStyle = vfpRowStyle(row.BACK_COLOR ?? row.BACKCOLOR);
                                return (
                                    <tr key={i}
                                        onClick={() => setSelectedUnico(sel ? null : unico)}
                                        className={cn("cursor-pointer transition-colors text-gray-600 divide-x divide-[#DBD9D9]",
                                            sel ? "!bg-[#FB7506]/10" : "hover:bg-gray-50")}
                                        style={!sel ? rowStyle : undefined}
                                    >
                                        <td className="p-2 whitespace-nowrap">{t(row.SORDER_NO ?? row.PO_NO)}</td>
                                        <td className="p-2 whitespace-nowrap font-semibold text-blue-700">{t(row.PBOOK_NO ?? row.SO_NO)}</td>
                                        <td className="p-2 whitespace-nowrap">{t(row.CPORDER_NO ?? row.CUST_PO)}</td>
                                        <td className="p-2 whitespace-nowrap">{t(row.INVOICE_NO ?? row.INVOICE)}</td>
                                        <td className="p-2 whitespace-nowrap max-w-[160px] truncate">{t(row.DESCRIPTION ?? row.PRODUCT)}</td>
                                        <td className="p-2 whitespace-nowrap">{t(row.CASE_SH ?? row.CASE)}</td>
                                        <td className="p-2 whitespace-nowrap text-right">{fmtI(row.UP_X_PACK)}</td>
                                        <td className="p-2 whitespace-nowrap text-right">{fmtI(row.PACKS_X_CASE)}</td>
                                        <td className="p-2 whitespace-nowrap text-right">{fmtI(row.UNITS_X_BOX ?? row.UNITS_X_CASE)}</td>
                                        <td className="p-2 whitespace-nowrap text-right">{fmtI(row.QTY_ORDER ?? row.QTY_SORDER)}</td>
                                        <td className="p-2 whitespace-nowrap text-right">{fmtI(row.QTY_PORDER)}</td>
                                        <td className={cn("p-2 whitespace-nowrap text-right font-bold", toInv > 0 ? "text-red-600" : "")}>{fmtI(row.TO_INVOICE)}</td>
                                        <td className="p-2 whitespace-nowrap text-right font-semibold">{fmt(row.SO_PRICE ?? row.PRICE)}</td>
                                        <td className="p-2 whitespace-nowrap">{fmtDate(row.PB_DATE ?? row.SHIP_DATE)}</td>
                                        <td className="p-2 whitespace-nowrap font-medium">{t(row.CUSTOMER)}</td>
                                        <td className="p-2 whitespace-nowrap text-right">{fmtI(row.BOXES_ADJUST ?? row.QUALITY)}</td>
                                        <td className="p-2 whitespace-nowrap">{t(row.WAREHOUSE ?? row.WHOUSE)}</td>
                                        <td className="p-2 whitespace-nowrap text-gray-400">{t(row.PCCODE ?? row.BOX_ID)}</td>
                                    </tr>
                                );
                            })}
                            {!loadingLines && (lines as any[]).length === 0 && (
                                <tr><td colSpan={18} className="p-10 text-center text-gray-400 italic">No prebook lines found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Detail tabs for the selected line — separate panel, not nested in any grid ── */}
            <div className="flex flex-col bg-white rounded-lg border border-[#DBD9D9] shadow-sm overflow-hidden mx-2 mt-2 mb-2 shrink-0">
                <div className="h-10 bg-[#F5F3F3] border-b border-[#DBD9D9] flex items-end px-2 gap-0.5 shrink-0">
                    {BOTTOM_TABS.map(tab => (
                        <button key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id);
                                if (tab.id === "stockom" && selectedUnico) fetchStockOm();
                            }}
                            className={cn(
                                "flex items-center gap-1.5 px-3 h-8 text-[10px] font-black uppercase tracking-wider rounded-t transition-all",
                                activeTab === tab.id
                                    ? "bg-white text-[#FB7506] border-b-2 border-[#FB7506]"
                                    : "text-gray-500 hover:text-[#FB7506] hover:bg-white/60"
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
                <div>
                    {activeTab === "invoiced"  && <InvoicedTab      rows={detail?.invoiced      ?? []} />}
                    {activeTab === "assigned"  && <AssignedStockTab rows={detail?.stockAssigned ?? []} onUnassign={row => setModalUnassign(row)} />}
                    {activeTab === "purchase"  && <PurchaseTab      rows={detail?.purchase      ?? []} />}
                    {activeTab === "stockom"   && <StockOmTab       rows={stockOm} loading={loadingStockOm} />}
                    {activeTab === "similar"   && <SimilarTab       rows={detail?.stockSimilar  ?? []} />}
                </div>
            </div>

            <AppFooter areaLabel="Prebook to Invoice" />

            <ModalUpdateLine
                open={modalUpdateLine.open}
                initialTab={modalUpdateLine.tab}
                unico={selectedUnico ?? ""}
                onClose={() => setModalUpdateLine({ ...modalUpdateLine, open: false })}
                onSuccess={() => { bumpLinesKey(); qc.invalidateQueries({ queryKey: ["pb2inv-detail", selectedUnico] }); }}
            />

            <ModalChangePO
                open={modalChangePO}
                onClose={() => setModalChangePO(false)}
                pbookUq={t(selectedLine?.PBOOK_UQ)}
                currentPo={t(selectedLine?.CPORDER_NO)}
                onSuccess={() => { bumpLinesKey(); bumpDatesKey(); }}
            />

            <ModalUnassignStock
                open={!!modalUnassign}
                onClose={() => setModalUnassign(null)}
                row={modalUnassign}
                onSuccess={() => qc.invalidateQueries({ queryKey: ["pb2inv-detail", selectedUnico] })}
            />

            <ModalAttachInvoice
                open={modalAttach}
                onClose={() => setModalAttach(false)}
                pbookUq={t(selectedLine?.PBOOK_UQ)}
                onSuccess={() => { bumpLinesKey(); bumpDatesKey(); }}
            />

            <ModalPartialInvoice
                open={modalPartial}
                onClose={() => setModalPartial(false)}
                pbookUq={t(selectedLine?.PBOOK_UQ)}
                onSuccess={() => { bumpLinesKey(); bumpDatesKey(); }}
            />

            <ReportModal url={reportModalUrl} onClose={() => setReportModalUrl(null)} />

            <ModalInvoicesByCustomer
                open={modalInvoicesByCustomer}
                onClose={() => setModalInvoicesByCustomer(false)}
                customerUq={selectedCustUq}
                date={selectedDate ?? ""}
            />
        </div>
    );
}
