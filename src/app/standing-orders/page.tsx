"use client";

import { useState, useMemo } from "react";
import { useSession }        from "next-auth/react";
import { useRouter }         from "next/navigation";
import { useQuery }          from "@tanstack/react-query";
import {
    ArrowLeft, RefreshCcw, Loader2, Search, X,
    Check, Plus, ClipboardList,
} from "lucide-react";
import { cn }                    from "@/lib/utils";
import { usePagePermissions }    from "@/lib/permissions";
import { HeaderModal }           from "./HeaderModal";
import { OrderDetailModal }      from "./OrderDetailModal";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const t    = (v: any) => String(v ?? "").trim();
const norm = (rows: any[]) => rows.map(r => { const n: any = {}; for (const [k, v] of Object.entries(r)) n[k.toUpperCase()] = v; return n; });
const bool = (v: any) => v === true || v === 1 || String(v).toLowerCase() === "true";
const fmtDate = (v: any) => {
    if (!v) return "";
    const s = String(v).trim();
    const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso) return new Date(+iso[1], +iso[2] - 1, +iso[3]).toLocaleDateString("en-US");
    const d = new Date(s); return isNaN(d.getTime()) ? s : d.toLocaleDateString("en-US");
};

const DAYS = ["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"];

function Th({ children, className }: { children: any; className?: string }) {
    return <th className={cn("px-3 py-2 text-left font-bold whitespace-nowrap text-gray-600 border-b border-gray-200 bg-gray-50 sticky top-0 z-10 text-[11px]", className)}>{children}</th>;
}
function Td({ children, className }: { children: any; className?: string }) {
    return <td className={cn("px-3 py-2 whitespace-nowrap text-[12px]", className)}>{children}</td>;
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function StandingOrdersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { canEdit, canDelete } = usePagePermissions("standing-orders");

    const [dayFilter,      setDayFilter]    = useState("%");
    const [textSearch,     setTextSearch]   = useState("");
    const [myOrders,       setMyOrders]     = useState(false);
    const [listKey,        setListKey]      = useState(0);
    const [selectedUnico,  setSelectedUnico] = useState<string | null>(null);
    const [selectedRow,    setSelectedRow]  = useState<any>(null);
    const [showModal,      setShowModal]    = useState(false); // true = mobile modal, false = desktop panel
    const [newOrderModal,  setNewOrderModal] = useState(false);

    // ── Lookups ───────────────────────────────────────────────────────────────
    const { data: lookups } = useQuery({
        queryKey: ["so-lookups"],
        queryFn: async () => {
            const r = await fetch("/api/standing-orders/lookups");
            const j = await r.json();
            if (!r.ok) throw new Error(j.error || "Failed");
            return {
                customers:     j.customers     ?? [],
                salesmen:      j.salesmen      ?? [],
                warehouses:    j.warehouses    ?? [],
                terms:         j.terms         ?? [],
                cases:         j.cases         ?? [],
                cargoAgencies: j.cargoAgencies ?? [],
                carriers:      j.carriers      ?? [],
                mySalesmanUq:  j.mySalesmanUq  ?? "",
            };
        },
        staleTime: 10 * 60 * 1000,
    });

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
        let f = ordersRaw as any[];
        if (myOrders && lookups?.mySalesmanUq) {
            const mySqUpper = t(lookups.mySalesmanUq).toUpperCase();
            f = f.filter((o: any) => t(o.SALESMAN_UQ ?? "").toUpperCase() === mySqUpper);
        }
        if (dayFilter !== "%")
            f = f.filter((o: any) => t(o.SO_DAY ?? "").toUpperCase().trim() === dayFilter);
        if (textSearch.trim()) {
            const q = textSearch.toLowerCase();
            f = f.filter((o: any) =>
                t(o.CUSTOMER).toLowerCase().includes(q) ||
                t(o.SORDER_NO ?? "").toString().includes(q) ||
                t(o.SALESMAN_NAME ?? "").toLowerCase().includes(q)
            );
        }
        return f;
    }, [ordersRaw, dayFilter, textSearch, myOrders, lookups?.mySalesmanUq]);

    const modalLookups = {
        customers:     lookups?.customers     ?? [],
        salesmen:      lookups?.salesmen      ?? [],
        warehouses:    lookups?.warehouses    ?? [],
        terms:         lookups?.terms         ?? [],
        cases:         lookups?.cases         ?? [],
        cargoAgencies: lookups?.cargoAgencies ?? [],
        carriers:      lookups?.carriers      ?? [],
    };

    if (status === "loading") return null;
    if (status === "unauthenticated") { router.push("/login"); return null; }

    const handleRowClick = (uq: string, row: any) => {
        setSelectedUnico(uq);
        setSelectedRow(row);
        // On mobile (< 1280px) open as modal; on desktop show as inline panel
        const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1280;
        setShowModal(!isDesktop);
    };

    const handleClose = () => {
        setSelectedUnico(null);
        setSelectedRow(null);
        setShowModal(false);
    };

    return (
        <div className="flex flex-col h-screen bg-[#f4f6f8] overflow-hidden font-sans text-[#333]">

            {/* ── Dark top bar ─────────────────────────────────────────────── */}
            <div className="h-12 bg-[#374151] flex items-center justify-between px-4 shrink-0 text-white">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.push("/menu")} className="hover:bg-white/10 p-1.5 rounded transition-colors">
                        <ArrowLeft size={18} />
                    </button>
                    <span className="font-black text-xs uppercase tracking-widest text-[#FB7506]">FOS</span>
                    <div className="w-px h-4 bg-white/20" />
                    <span className="font-bold text-xs uppercase tracking-tight">Standing Orders</span>
                </div>
                <div className="hidden sm:flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-gray-400">User: <span className="text-white">{session?.user?.name || "OPERATOR"}</span></span>
                    <span className="text-green-500">● Online</span>
                </div>
            </div>

            {/* ── Filter + New Order bar ────────────────────────────────────── */}
            <div className="bg-white border-b border-gray-200 px-3 py-2 flex flex-wrap items-center gap-2 shrink-0 shadow-sm">
                {/* All / My Orders */}
                <div className="flex items-center bg-gray-100 rounded p-0.5 shrink-0">
                    <button onClick={() => setMyOrders(false)}
                        className={cn("px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest transition-all",
                            !myOrders ? "bg-[#FB7506] text-white shadow-sm" : "text-gray-500 hover:text-gray-800")}>
                        All Orders
                    </button>
                    <button onClick={() => setMyOrders(true)}
                        className={cn("px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest transition-all",
                            myOrders ? "bg-[#FB7506] text-white shadow-sm" : "text-gray-500 hover:text-gray-800")}>
                        My Orders
                    </button>
                </div>

                {/* Day filter */}
                <div className="flex items-center gap-1 shrink-0">
                    <select value={dayFilter} onChange={e => setDayFilter(e.target.value)}
                        className="text-[10px] font-black uppercase tracking-widest border border-gray-200 rounded px-2 py-1.5 bg-white text-gray-700 cursor-pointer">
                        <option value="%">All Days</option>
                        {DAYS.map(d => <option key={d} value={d}>{d[0] + d.slice(1).toLowerCase()}</option>)}
                    </select>
                    {dayFilter !== "%" && <button onClick={() => setDayFilter("%")} className="text-gray-400 hover:text-gray-600"><X size={12} /></button>}
                </div>

                {/* Search */}
                <div className="flex items-center bg-gray-100 rounded px-2 py-1.5 gap-1.5 flex-1 min-w-[140px] max-w-xs">
                    <Search size={11} className="text-gray-400 shrink-0" />
                    <input value={textSearch} onChange={e => setTextSearch(e.target.value)}
                        placeholder="Customer, order #, salesman..."
                        className="text-[11px] text-gray-700 placeholder-gray-400 outline-none flex-1 min-w-0 bg-transparent"
                    />
                    {textSearch && <button onClick={() => setTextSearch("")}><X size={11} className="text-gray-400 hover:text-gray-600" /></button>}
                </div>

                <button onClick={() => setListKey(k => k + 1)} disabled={loadingOrders}
                    className="flex items-center gap-1 px-2 py-1.5 text-[10px] font-black uppercase tracking-widest bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-600 rounded transition-all shrink-0">
                    <RefreshCcw size={10} className={loadingOrders ? "animate-spin" : ""} /> Refresh
                </button>

                <span className="text-[10px] text-gray-400 font-bold shrink-0 hidden sm:block">
                    {orders.length} / {(ordersRaw as any[]).length}
                </span>

                {canEdit && (
                    <button onClick={() => setNewOrderModal(true)}
                        className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-black uppercase tracking-widest bg-green-600 hover:bg-green-500 text-white rounded transition-all shrink-0">
                        <Plus size={12} /> New Order
                    </button>
                )}
            </div>

            {/* ── Main area ────────────────────────────────────────────────── */}
            <div className="flex flex-col xl:flex-row flex-1 overflow-hidden px-2 pb-2 pt-2 gap-2 min-h-0">

                {/* Orders list — always visible on all screen sizes */}
                <div className="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex-1 xl:flex-none xl:w-[420px] xl:shrink-0">
                    <div className="h-9 bg-[#374151] flex items-center px-3 gap-2 shrink-0 rounded-t-lg">
                        <ClipboardList size={13} className="text-[#FB7506]" />
                        <span className="font-black text-[10px] uppercase tracking-widest text-white">Orders List</span>
                        {loadingOrders && <Loader2 size={10} className="animate-spin text-gray-400" />}
                        <span className="ml-auto text-[10px] text-gray-400 font-bold">
                            {orders.length}/{(ordersRaw as any[]).length}
                        </span>
                    </div>
                    <div className="flex-1 overflow-auto">
                        <table className="min-w-full text-left">
                            <thead>
                                <tr>
                                    <Th>Customer</Th>
                                    <Th className="text-right">Order #</Th>
                                    <Th>Day</Th>
                                    <Th className="hidden sm:table-cell">Start</Th>
                                    <Th className="hidden sm:table-cell">End</Th>
                                    <Th className="hidden xl:table-cell">Salesman</Th>
                                    <Th className="hidden xl:table-cell">Cargo</Th>
                                    <Th className="text-center">Act.</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((o: any, i: number) => {
                                    const uq  = t(o.UNICO ?? "");
                                    const sel = selectedUnico === uq;
                                    return (
                                        <tr key={i}
                                            onClick={() => handleRowClick(uq, o)}
                                            className={cn(
                                                "border-b cursor-pointer transition-colors text-gray-700",
                                                sel ? "!bg-blue-100 ring-2 ring-inset ring-blue-300" : "odd:bg-white even:bg-gray-50 hover:bg-blue-50 active:bg-blue-100"
                                            )}
                                        >
                                            <Td className="font-medium max-w-[140px] truncate">{t(o.CUSTOMER)}</Td>
                                            <Td className="text-right font-bold text-blue-700">{t(o.SORDER_NO)}</Td>
                                            <Td className="font-bold text-[#FB7506]">{t(o.SO_DAY).trim()}</Td>
                                            <Td className="hidden sm:table-cell text-gray-500">{fmtDate(o.SO_STDATE)}</Td>
                                            <Td className="hidden sm:table-cell text-gray-500">{fmtDate(o.SO_ENDATE)}</Td>
                                            <Td className="hidden xl:table-cell max-w-[90px] truncate">{t(o.SALESMAN_NAME)}</Td>
                                            <Td className="hidden xl:table-cell max-w-[80px] truncate">{t(o.AGENCY)}</Td>
                                            <Td className="text-center">{bool(o.ACTIVE) ? <Check size={11} className="text-green-500 inline" /> : ""}</Td>
                                        </tr>
                                    );
                                })}
                                {!loadingOrders && orders.length === 0 && (
                                    <tr><td colSpan={8} className="py-16 text-center text-gray-400 italic text-sm">
                                        {textSearch || dayFilter !== "%" || myOrders ? "No orders match filters" : "No standing orders found"}
                                    </td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Desktop inline detail panel (xl+, panel mode) */}
                {selectedUnico && selectedRow && lookups && !showModal && (
                    <div className="hidden xl:flex flex-1 min-h-0 min-w-0">
                        <OrderDetailModal
                            mode="panel"
                            soUnico={selectedUnico}
                            orderRow={selectedRow}
                            lookups={modalLookups}
                            canEdit={canEdit}
                            canDelete={canDelete}
                            onClose={handleClose}
                            onRefreshList={() => setListKey(k => k + 1)}
                        />
                    </div>
                )}

                {/* Desktop placeholder when no order selected */}
                {(!selectedUnico || showModal) && (
                    <div className="hidden xl:flex flex-1 items-center justify-center bg-white rounded-lg border border-gray-200 shadow-sm min-h-0">
                        <div className="text-center text-gray-400">
                            <ClipboardList size={36} className="mx-auto mb-3 opacity-30" />
                            <p className="text-sm font-bold uppercase tracking-widest">Select an order</p>
                            <p className="text-xs mt-1">Click a row to view details</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile modal (< xl) */}
            {showModal && selectedUnico && selectedRow && lookups && (
                <OrderDetailModal
                    mode="modal"
                    soUnico={selectedUnico}
                    orderRow={selectedRow}
                    lookups={modalLookups}
                    canEdit={canEdit}
                    canDelete={canDelete}
                    onClose={handleClose}
                    onRefreshList={() => setListKey(k => k + 1)}
                />
            )}

            {/* New Order modal */}
            {newOrderModal && lookups && (
                <HeaderModal
                    mode="new"
                    lookups={modalLookups}
                    onClose={() => setNewOrderModal(false)}
                    onSaved={(unico) => {
                        setNewOrderModal(false);
                        setListKey(k => k + 1);
                        if (unico) {
                            setTimeout(() => {
                                const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1280;
                                setSelectedUnico(unico);
                                setSelectedRow({ UNICO: unico, SORDER_NO: "", CUSTOMER: "" });
                                setShowModal(!isDesktop);
                            }, 400);
                        }
                    }}
                />
            )}
        </div>
    );
}
