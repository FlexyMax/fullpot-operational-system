"use client";

import { useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    ArrowLeft, RefreshCcw, Loader2, Search, X,
    Users, FileText, Trash2, Check, Lock,
    ChevronDown, Printer, Plus, Edit2,
    Tractor, UserCog, Calendar, Package,
    ShoppingCart, ClipboardList,
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
    const d = new Date(s); return isNaN(d.getTime()) ? s : d.toLocaleDateString("en-US");
};
const bool = (v: any) => v === true || v === 1 || String(v).toLowerCase() === "true";

const DAYS = ["%", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const WEEK_COLS: [string, string][] = [["MON","Mon"],["TUE","Tue"],["WED","Wed"],["THU","Thu"],["FRI","Fri"],["SAT","Sat"],["SUN","Sun"]];

// ─── Sub-components ────────────────────────────────────────────────────────────
function Th({ children, className }: { children: any; className?: string }) {
    return (
        <th className={cn("p-2 text-left font-bold whitespace-nowrap text-gray-700 border-l border-gray-200 first:border-l-0 bg-gray-100", className)}>
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

function FieldRow({ label, value, className }: { label: string; value?: string; className?: string }) {
    return (
        <div className={cn("flex items-center gap-1 min-w-0", className)}>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide shrink-0">{label}:</span>
            <span className="text-[11px] text-gray-800 truncate">{value || "—"}</span>
        </div>
    );
}

function OBar({ children, className }: { children: any; className?: string }) {
    return (
        <div className={cn("h-9 bg-[#FB7506] flex items-center justify-between px-3 shrink-0", className)}>
            {children}
        </div>
    );
}

function HBtn({ icon: Icon, label, onClick, disabled, variant = "default" }: any) {
    return (
        <button onClick={onClick} disabled={disabled}
            className={cn(
                "flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded border transition-all disabled:opacity-40 whitespace-nowrap",
                variant === "danger"  && "bg-red-600 hover:bg-red-500 border-transparent text-white",
                variant === "success" && "bg-green-600 hover:bg-green-500 border-transparent text-white",
                variant === "dark"    && "bg-gray-700 hover:bg-gray-600 border-transparent text-white",
                variant === "default" && "bg-white hover:bg-gray-100 border-white/30 text-gray-800",
            )}
        >
            {Icon && <Icon size={10} />}{label}
        </button>
    );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function StandingOrdersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const qc = useQueryClient();
    const { canEdit, canDelete } = usePagePermissions("standing-orders");

    const [myOrders,          setMyOrders]          = useState(false);
    const [dayFilter,         setDayFilter]          = useState("%");
    const [textSearch,        setTextSearch]         = useState("");
    const [selectedUnico,     setSelectedUnico]      = useState<string | null>(null);
    const [selectedLineUnico, setSelectedLineUnico]  = useState<string | null>(null);
    const [listKey,           setListKey]            = useState(0);
    const [detailKey,         setDetailKey]          = useState(0);
    const [working,           setWorking]            = useState(false);

    // ── Orders list ───────────────────────────────────────────────────────────
    const { data: ordersRaw = [], isFetching: loadingOrders } = useQuery({
        queryKey: ["so-orders", listKey],
        queryFn: async () => {
            const r = await fetch("/api/standing-orders/orders?customer_uq=%&mode=all");
            const j = await r.json();
            if (!r.ok) throw new Error(j.error || "Failed");
            return norm(Array.isArray(j) ? j : []);
        },
    });

    const orders = useMemo(() => {
        let filtered = ordersRaw as any[];
        if (dayFilter !== "%") {
            filtered = filtered.filter((o: any) =>
                t(o.SO_DAY ?? o.DAY ?? "").toUpperCase() === dayFilter
            );
        }
        if (textSearch.trim()) {
            const q = textSearch.toLowerCase();
            filtered = filtered.filter((o: any) =>
                t(o.CUSTOMER).toLowerCase().includes(q) ||
                t(o.SORDER_NO ?? o.SO_NO ?? o.ORDER_NO ?? "").includes(q) ||
                t(o.SALESMAN ?? o.SALESMAN_NAME ?? "").toLowerCase().includes(q)
            );
        }
        return filtered;
    }, [ordersRaw, dayFilter, textSearch]);

    // ── Order detail ──────────────────────────────────────────────────────────
    const { data: detail, isFetching: loadingDetail } = useQuery({
        queryKey: ["so-detail", selectedUnico, detailKey],
        enabled: !!selectedUnico,
        queryFn: async () => {
            const r = await fetch(`/api/standing-orders/detail/${selectedUnico}`);
            const j = await r.json();
            if (!r.ok) throw new Error(j.error || "Failed");
            return {
                header:  normOne(j.header),
                lines:   norm(j.lines   ?? []),
                vendors: norm(j.vendors ?? []),
            };
        },
    });

    // ── Actions ───────────────────────────────────────────────────────────────
    const handleDeleteOrder = useCallback(() => {
        if (!selectedUnico) return;
        toast("Delete this standing order?", {
            duration: 8000,
            action: {
                label: "Delete",
                onClick: async () => {
                    setWorking(true);
                    try {
                        const r = await fetch(`/api/standing-orders/header/${selectedUnico}`, { method: "DELETE" });
                        const j = await r.json();
                        if (!r.ok || !j.success) throw new Error(j.error || "Failed");
                        toast.success("Order deleted");
                        setSelectedUnico(null);
                        setListKey(k => k + 1);
                    } catch (e: any) { toast.error(e.message); }
                    finally { setWorking(false); }
                },
            },
            cancel: { label: "Cancel", onClick: () => {} },
        });
    }, [selectedUnico]);

    const handleToFarm = useCallback(async () => {
        if (!selectedUnico) return;
        setWorking(true);
        try {
            const r = await fetch("/api/standing-orders/to-farm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ unico: selectedUnico }),
            });
            const j = await r.json();
            if (!r.ok || !j.success) throw new Error(j.error || "Failed");
            toast.success("Sent to farm");
            setDetailKey(k => k + 1);
        } catch (e: any) { toast.error(e.message); }
        finally { setWorking(false); }
    }, [selectedUnico]);

    const handleDeleteLine = useCallback(() => {
        if (!selectedLineUnico) return;
        toast("Delete this order line?", {
            duration: 8000,
            action: {
                label: "Delete",
                onClick: async () => {
                    setWorking(true);
                    try {
                        const r = await fetch(`/api/standing-orders/line/${selectedLineUnico}`, { method: "DELETE" });
                        const j = await r.json();
                        if (!r.ok || !j.success) throw new Error(j.error || "Failed");
                        toast.success("Line deleted");
                        setSelectedLineUnico(null);
                        setDetailKey(k => k + 1);
                    } catch (e: any) { toast.error(e.message); }
                    finally { setWorking(false); }
                },
            },
            cancel: { label: "Cancel", onClick: () => {} },
        });
    }, [selectedLineUnico]);

    if (status === "loading") return null;
    if (status === "unauthenticated") { router.push("/login"); return null; }

    const h = detail?.header;
    const lines   = detail?.lines   ?? [];
    const vendors = detail?.vendors ?? [];

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
                        <span className="font-bold text-xs uppercase tracking-tight">Standing Orders</span>
                    </div>
                    {(working || loadingDetail) && <Loader2 size={14} className="animate-spin text-[#FB7506] ml-2" />}
                </div>
                <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest">
                    {h && (
                        <span className="text-gray-400">Order: <span className="text-[#FB7506]">{t(h.SORDER_NO ?? h.SO_NO)}</span></span>
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

            {/* ── Filter / action bar ──────────────────────────────────────── */}
            <div className="h-10 bg-white border border-gray-200 flex items-center px-3 gap-2 shrink-0 shadow-sm mx-2 mt-2 rounded-lg overflow-x-auto">
                {/* My / All Orders toggle */}
                <div className="flex items-center bg-gray-100 rounded p-0.5 shrink-0">
                    {([["false","All Orders"],["true","My Orders"]] as const).map(([v, label]) => (
                        <button key={v} onClick={() => setMyOrders(v === "true")}
                            className={cn(
                                "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest transition-all",
                                (myOrders ? "true" : "false") === v
                                    ? "bg-[#FB7506] text-white shadow-sm"
                                    : "text-gray-500 hover:text-gray-800"
                            )}
                        >{label}</button>
                    ))}
                </div>

                {/* Day filter */}
                <div className="flex items-center gap-1 shrink-0">
                    <select value={dayFilter} onChange={e => setDayFilter(e.target.value)}
                        className="text-[10px] font-black uppercase tracking-widest border border-gray-200 rounded px-2 py-1 bg-white text-gray-700 cursor-pointer"
                    >
                        <option value="%">All Days</option>
                        {DAYS.slice(1).map(d => <option key={d} value={d}>{d[0] + d.slice(1).toLowerCase()}</option>)}
                    </select>
                    {dayFilter !== "%" && (
                        <button onClick={() => setDayFilter("%")} className="text-gray-400 hover:text-gray-600">
                            <X size={12} />
                        </button>
                    )}
                </div>

                <div className="w-px h-5 bg-gray-200 shrink-0" />

                {/* Text search */}
                <div className="flex items-center bg-gray-100 rounded px-2 py-1 gap-1 w-44 shrink-0">
                    <Search size={11} className="text-gray-400 shrink-0" />
                    <input value={textSearch} onChange={e => setTextSearch(e.target.value)}
                        placeholder="Search..." className="text-[11px] text-gray-700 placeholder-gray-400 outline-none flex-1 min-w-0 bg-transparent"
                    />
                    {textSearch && <button onClick={() => setTextSearch("")}><X size={11} className="text-gray-400 hover:text-gray-600" /></button>}
                </div>

                <button onClick={() => setListKey(k => k + 1)} disabled={loadingOrders}
                    className="flex items-center gap-1 px-2 py-1 text-[10px] font-black uppercase tracking-widest bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-600 rounded transition-all shrink-0"
                >
                    <RefreshCcw size={10} className={loadingOrders ? "animate-spin" : ""} /> Refresh
                </button>

                <div className="w-px h-5 bg-gray-200 shrink-0" />

                <button onClick={() => {}} className="flex items-center gap-1 px-2 py-1 text-[10px] font-black uppercase tracking-widest bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-600 rounded transition-all shrink-0">
                    <UserCog size={10} /> Change Cust.
                </button>
                <button onClick={() => {}} className="flex items-center gap-1 px-2 py-1 text-[10px] font-black uppercase tracking-widest bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-600 rounded transition-all shrink-0">
                    <UserCog size={10} /> Change Salesman
                </button>

                <div className="w-px h-5 bg-gray-200 shrink-0" />

                <button onClick={() => {}} disabled={!canEdit}
                    className="flex items-center gap-1 px-2 py-1 text-[10px] font-black uppercase tracking-widest bg-green-600 hover:bg-green-500 text-white rounded disabled:opacity-40 transition-all shrink-0"
                >
                    <Plus size={10} /> Add Order
                </button>
                <button onClick={() => {}} disabled={!selectedUnico}
                    className="flex items-center gap-1 px-2 py-1 text-[10px] font-black uppercase tracking-widest bg-gray-700 hover:bg-gray-600 text-white rounded disabled:opacity-40 transition-all shrink-0"
                >
                    <FileText size={10} /> View Order
                </button>

                <span className="ml-auto text-[10px] text-gray-400 font-bold shrink-0">
                    {orders.length} / {(ordersRaw as any[]).length} orders
                </span>
            </div>

            {/* ── Main split: left list + right detail ─────────────────────── */}
            <div className="flex flex-1 overflow-hidden px-2 pb-2 pt-2 gap-2 min-h-0">

                {/* Left: Orders list */}
                <div className="flex flex-col w-[480px] shrink-0 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="h-9 bg-[#374151] flex items-center px-3 gap-2 shrink-0 rounded-t-lg">
                        <ClipboardList size={13} className="text-[#FB7506]" />
                        <span className="font-black text-[10px] uppercase tracking-widest text-white">Orders List</span>
                        {loadingOrders && <RefreshCcw size={10} className="animate-spin text-gray-400" />}
                    </div>
                    <div className="flex-1 overflow-auto">
                        <table className="min-w-full text-xs text-left">
                            <thead className="sticky top-0 z-10">
                                <tr>
                                    <Th>Customer</Th>
                                    <Th className="text-right">Order</Th>
                                    <Th>Day</Th>
                                    <Th>Start</Th>
                                    <Th>End</Th>
                                    <Th>Salesman</Th>
                                    <Th>Cargo</Th>
                                    <Th className="text-center">Active</Th>
                                    <Th className="text-right">Factor</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((o: any, i: number) => {
                                    const uq  = t(o.UNICO ?? o.SO_UQ ?? "");
                                    const sel = selectedUnico === uq;
                                    return (
                                        <tr key={i} onClick={() => { setSelectedUnico(sel ? null : uq); setSelectedLineUnico(null); }}
                                            className={cn("border-b cursor-pointer transition-colors text-gray-600",
                                                sel ? "!bg-blue-100 ring-2 ring-inset ring-blue-300" : "odd:bg-white even:bg-gray-50 hover:bg-blue-50")}
                                        >
                                            <Td className="font-medium max-w-[160px] truncate">{t(o.CUSTOMER)}</Td>
                                            <Td className="text-right font-semibold text-blue-700">{t(o.SORDER_NO ?? o.SO_NO ?? o.ORDER_NO)}</Td>
                                            <Td className="text-[#FB7506] font-bold">{t(o.SO_DAY ?? o.DAY)}</Td>
                                            <Td>{fmtDate(o.SO_STDATE ?? o.START_DATE)}</Td>
                                            <Td>{fmtDate(o.SO_ENDATE ?? o.END_DATE)}</Td>
                                            <Td className="max-w-[100px] truncate">{t(o.SALESMAN ?? o.SALESMAN_NAME)}</Td>
                                            <Td className="max-w-[80px] truncate">{t(o.CARGO_AGENCY ?? o.AGENCY)}</Td>
                                            <Td className="text-center">{bool(o.ACTIVE) ? <Check size={11} className="text-green-600 inline" /> : ""}</Td>
                                            <Td className="text-right">{t(o.FACTOR ?? "1")}</Td>
                                        </tr>
                                    );
                                })}
                                {!loadingOrders && orders.length === 0 && (
                                    <tr><td colSpan={9} className="p-10 text-center text-gray-400 italic">No standing orders found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right: Order detail */}
                <div className="flex-1 flex flex-col overflow-hidden min-h-0 min-w-0">
                    {!selectedUnico ? (
                        <div className="flex-1 flex items-center justify-center bg-white rounded-lg border border-gray-200 shadow-sm">
                            <div className="text-center text-gray-400">
                                <ClipboardList size={36} className="mx-auto mb-3 opacity-30" />
                                <p className="text-sm font-bold uppercase tracking-widest">Select an order</p>
                                <p className="text-xs mt-1">Click a row on the left to view details</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full overflow-hidden gap-1.5 min-h-0">

                            {/* ── Customer info ──────────────────────────────── */}
                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden shrink-0">
                                <div className="bg-green-800 px-3 py-1.5 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Users size={13} className="text-white/70" />
                                        <span className="text-[11px] font-black text-white uppercase tracking-widest">
                                            Customer — {t(h?.CUSTOMER ?? h?.CUSTOMER_NAME ?? "...")}
                                        </span>
                                    </div>
                                    <button className="flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded text-[10px] font-black text-white uppercase tracking-widest border border-white/20 transition-all">
                                        <Search size={10} /> Customer Search
                                    </button>
                                </div>
                                <div className="grid grid-cols-4 gap-x-6 gap-y-1.5 px-4 py-2">
                                    <FieldRow label="E-mail"       value={t(h?.EMAIL)} className="col-span-2" />
                                    <FieldRow label="Phone"        value={t(h?.PHONE)} />
                                    <FieldRow label="Fax"          value={t(h?.FAX)} />
                                    <FieldRow label="Contact"      value={t(h?.CONTACT)} className="col-span-2" />
                                    <FieldRow label="Credit Hold"  value={bool(h?.CREDIT_HOLD) ? "YES" : "No"} />
                                    <FieldRow label="Credit Limit" value={h?.CREDIT_LIMIT != null ? fmt(h.CREDIT_LIMIT) : undefined} />
                                    <FieldRow label="Hold Rea."    value={t(h?.HOLD_REA ?? h?.HOLD_REASON)} className="col-span-2" />
                                    <FieldRow label="T. Bal."      value={h?.TOTAL_BAL != null ? fmt(h.TOTAL_BAL) : undefined} className="col-span-2" />
                                </div>
                            </div>

                            {/* ── S.O. Header ────────────────────────────────── */}
                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden shrink-0">
                                <OBar>
                                    <div className="flex items-center gap-1.5">
                                        <Lock size={12} className="text-white/70" />
                                        <span className="font-black text-[10px] text-white uppercase tracking-widest">S.O. Header</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <HBtn icon={Calendar} label="Set Weeks" onClick={() => {}} />
                                        <HBtn icon={Printer}  label="Print"     onClick={() => {}} />
                                        <div className="w-px h-4 bg-white/20" />
                                        <HBtn icon={Plus}     label="New Order"    onClick={() => {}} disabled={!canEdit} variant="default" />
                                        <HBtn icon={Edit2}    label="Edit Order"   onClick={() => {}} disabled={!selectedUnico || !canEdit} variant="default" />
                                        <HBtn icon={Trash2}   label="Delete Order" onClick={handleDeleteOrder} disabled={!selectedUnico || !canDelete || working} variant="danger" />
                                        <div className="w-px h-4 bg-white/20" />
                                        <button onClick={handleToFarm} disabled={!selectedUnico || working}
                                            className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest bg-red-600 hover:bg-red-500 text-white rounded disabled:opacity-40 transition-all whitespace-nowrap"
                                        >
                                            <Tractor size={10} /> SO to Farm
                                        </button>
                                    </div>
                                </OBar>
                                <div className="px-4 py-2 grid grid-cols-6 gap-x-6 gap-y-1.5 text-[11px]">
                                    <div className="col-span-6 flex items-center gap-6 pb-1 border-b border-gray-100">
                                        <FieldRow label="Order No." value={t(h?.SORDER_NO ?? h?.SO_NO)} />
                                        <FieldRow label="Active"    value={bool(h?.ACTIVE) ? "Yes" : "No"} />
                                        <FieldRow label="Factor"    value={t(h?.FACTOR ?? "1")} />
                                        <FieldRow label="Add Date"  value={fmtDate(h?.SO_DATE)} />
                                        <FieldRow label="Salesman"  value={t(h?.SALESMAN ?? h?.SALESMAN_NAME)} />
                                    </div>
                                    {/* Week Day toggles */}
                                    <div className="col-span-6 flex items-center gap-0 bg-green-800 rounded px-3 py-1">
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest mr-3">Week Day:</span>
                                        {WEEK_COLS.map(([key, label]) => (
                                            <label key={key} className="flex items-center gap-1 mr-4 cursor-pointer">
                                                <div className={cn("w-3 h-3 rounded-sm border border-white/60", bool(h?.[key]) ? "bg-white" : "bg-transparent")} />
                                                <span className="text-[10px] font-bold text-white">{label}:</span>
                                            </label>
                                        ))}
                                    </div>
                                    <FieldRow label="Terms"       value={t(h?.TERMS ?? h?.TERMS_NAME)} className="col-span-2" />
                                    <FieldRow label="Start Date"  value={fmtDate(h?.SO_STDATE ?? h?.START_DATE)} />
                                    <FieldRow label="End Date"    value={fmtDate(h?.SO_ENDATE ?? h?.END_DATE)} />
                                    <div className="col-span-2" />
                                    <FieldRow label="Ship"        value={t(h?.SHIP_NAME)} className="col-span-2" />
                                    <FieldRow label="Address"     value={t(h?.SHIP_ADDRESS)} className="col-span-4" />
                                    <FieldRow label="City"        value={t(h?.SHIP_CITY)} className="col-span-2" />
                                    <FieldRow label="State"       value={t(h?.SHIP_STATE)} />
                                    <FieldRow label="Zip"         value={t(h?.SHIP_ZIP)} />
                                    <FieldRow label="Phone"       value={t(h?.SHIP_PHONE)} />
                                    <FieldRow label="Fax"         value={t(h?.SHIP_FAX)} />
                                    <FieldRow label="Warehouse"   value={t(h?.WAREHOUSE ?? h?.WHOUSE)} className="col-span-3" />
                                    <FieldRow label="Cargo A."    value={t(h?.CARGO_AGENCY ?? h?.CARGO ?? h?.AGENCY)} className="col-span-3" />
                                    {t(h?.INSTRUCTIONS) && (
                                        <div className="col-span-6 flex items-start gap-1">
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide shrink-0 mt-0.5">Details:</span>
                                            <span className="text-[11px] text-gray-700 whitespace-pre-wrap">{t(h.INSTRUCTIONS)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ── S.O. Details ────────────────────────────────── */}
                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[180px] flex-1">
                                <OBar>
                                    <div className="flex items-center gap-1.5">
                                        <Lock size={12} className="text-white/70" />
                                        <span className="font-black text-[10px] text-white uppercase tracking-widest">S.O. Details</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <button className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest bg-red-600 hover:bg-red-500 text-white rounded transition-all whitespace-nowrap">
                                            <Package size={10} /> Box Composition
                                        </button>
                                        <HBtn icon={ShoppingCart} label="Foods" onClick={() => {}} />
                                        <div className="w-px h-4 bg-white/20" />
                                        <HBtn icon={Plus}   label="Add Ord.Line"    onClick={() => {}} disabled={!canEdit} />
                                        <HBtn icon={Edit2}  label="Edit Ord.Line"   onClick={() => {}} disabled={!selectedLineUnico || !canEdit} />
                                        <HBtn icon={Trash2} label="Delete Ord.Line" onClick={handleDeleteLine} disabled={!selectedLineUnico || !canDelete || working} variant="danger" />
                                    </div>
                                </OBar>
                                <div className="flex-1 overflow-auto">
                                    <table className="min-w-full text-xs text-left">
                                        <thead className="sticky top-0 z-10">
                                            <tr>
                                                <Th>Product</Th><Th>Case</Th>
                                                <Th className="text-right">Box Qty</Th>
                                                <Th className="text-right">Purchase</Th>
                                                <Th className="text-right">BxCase</Th>
                                                <Th className="text-right">UxBunch</Th>
                                                <Th className="text-right">TotalUnits</Th>
                                                <Th className="text-right">Price</Th>
                                                <Th className="text-right">Ext.Price</Th>
                                                <Th>BoxId</Th><Th>UPC</Th>
                                                <Th className="text-center">Food</Th>
                                                <Th className="text-center">Active</Th>
                                                <Th className="text-center">PxStem</Th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {lines.map((l: any, i: number) => {
                                                const uq  = t(l.UNICO ?? l.SO_BOX_UQ ?? "");
                                                const sel = selectedLineUnico === uq;
                                                return (
                                                    <tr key={i} onClick={() => setSelectedLineUnico(sel ? null : uq)}
                                                        className={cn("border-b cursor-pointer transition-colors text-gray-600",
                                                            sel ? "!bg-blue-100 ring-2 ring-inset ring-blue-300" : "odd:bg-white even:bg-gray-50 hover:bg-blue-50")}
                                                    >
                                                        <Td className="max-w-[200px] truncate font-medium">{t(l.PRODUCT ?? l.DESCRIPTION ?? l.DETAILS)}</Td>
                                                        <Td>{t(l.CASE_SH ?? l.CASE ?? l.CASE_UQ)}</Td>
                                                        <Td className="text-right">{fmtI(l.QTY_SORDER ?? l.BOX_QTY)}</Td>
                                                        <Td className="text-right">{fmtI(l.PACKS_BOX ?? l.PURCHASE)}</Td>
                                                        <Td className="text-right">{fmtI(l.PACKS_X_CASE ?? l.BXCASE)}</Td>
                                                        <Td className="text-right">{fmtI(l.UP_X_PACK ?? l.UXBUNCH)}</Td>
                                                        <Td className="text-right">{fmtI(l.TOTAL_UNITS)}</Td>
                                                        <Td className="text-right font-semibold">{fmt(l.SO_PRICE ?? l.PRICE)}</Td>
                                                        <Td className="text-right font-semibold">{fmt(l.EXT_PRICE ?? l.EXTPRICE)}</Td>
                                                        <Td>{t(l.PCCODE ?? l.BOXID ?? l.BOX_ID)}</Td>
                                                        <Td>{t(l.UPC)}</Td>
                                                        <Td className="text-center">{bool(l.FOOD) ? <Check size={10} className="text-green-600 inline" /> : ""}</Td>
                                                        <Td className="text-center">{bool(l.ACTIVE) ? <Check size={10} className="text-green-600 inline" /> : ""}</Td>
                                                        <Td className="text-center">{bool(l.STEM_PACK ?? l.PXSTEM) ? <Check size={10} className="text-green-600 inline" /> : ""}</Td>
                                                    </tr>
                                                );
                                            })}
                                            {loadingDetail && <tr><td colSpan={14} className="p-6 text-center text-gray-400 italic"><Loader2 size={12} className="animate-spin inline mr-1" />Loading...</td></tr>}
                                            {!loadingDetail && lines.length === 0 && (
                                                <tr><td colSpan={14} className="p-6 text-center text-gray-400 italic">No order lines</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* ── Vendors Orders ──────────────────────────────── */}
                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden shrink-0 h-[160px] flex flex-col">
                                <OBar>
                                    <div className="flex items-center gap-1.5">
                                        <Lock size={12} className="text-white/70" />
                                        <span className="font-black text-[10px] text-white uppercase tracking-widest">Vendors Orders</span>
                                    </div>
                                    <HBtn icon={Printer} label="Print" onClick={() => {}} />
                                </OBar>
                                <div className="flex-1 overflow-auto">
                                    <table className="min-w-full text-xs text-left">
                                        <thead className="sticky top-0 z-10">
                                            <tr>
                                                <Th>Vendor</Th>
                                                <Th className="text-right">Qty Order</Th>
                                                <Th className="text-right">Qty Conf.</Th>
                                                <Th className="text-right">Diff</Th>
                                                <Th className="text-right">Price</Th>
                                                <Th>Ship Day</Th>
                                                <Th className="text-right">ShipDays</Th>
                                                <Th>Details</Th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {vendors.map((v: any, i: number) => (
                                                <tr key={i} className="border-b odd:bg-white even:bg-gray-50 hover:bg-blue-50 text-gray-600">
                                                    <Td className="font-medium">{t(v.VENDOR ?? v.GROWER ?? v.VENDOR_NAME)}</Td>
                                                    <Td className="text-right">{fmtI(v.QTY_ORDER ?? v.ORDERED)}</Td>
                                                    <Td className="text-right">{fmtI(v.QTY_CONFIRMED ?? v.QTY_CONF ?? v.CONFIRMED)}</Td>
                                                    <Td className={cn("text-right font-bold", parseInt(v.DIFF ?? 0) !== 0 ? "text-red-600" : "")}>{fmtI(v.DIFF)}</Td>
                                                    <Td className="text-right">{fmt(v.PRICE ?? v.SO_PRICE)}</Td>
                                                    <Td className="text-[#FB7506] font-bold">{t(v.SHIP_DAY)}</Td>
                                                    <Td className="text-right">{fmtI(v.SHIP_DAYS ?? v.SHIPDAYS)}</Td>
                                                    <Td className="max-w-[200px] truncate">{t(v.DETAILS ?? v.NOTES)}</Td>
                                                </tr>
                                            ))}
                                            {!loadingDetail && vendors.length === 0 && (
                                                <tr><td colSpan={8} className="p-4 text-center text-gray-400 italic">No vendor orders</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
