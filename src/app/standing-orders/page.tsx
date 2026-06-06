"use client";

import { useState, useMemo } from "react";
import { useSession }        from "next-auth/react";
import { useRouter }         from "next/navigation";
import { useQuery }          from "@tanstack/react-query";
import {
    RefreshCcw, Loader2, Search, X,
    Check, Plus, ClipboardList,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { cn }                    from "@/lib/utils";
import { usePagePermissions }    from "@/lib/permissions";
import { HeaderModal }           from "./HeaderModal";
import { OrderDetailModal }      from "./OrderDetailModal";
import PanelGrid from "@/components/ui/PanelGrid";
import { PanelGridTable, PanelGridThead, PanelGridTh, PanelGridTbody, PanelGridTr, PanelGridTd } from "@/components/ui/PanelGridTable";

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
    const { status } = useSession();
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
        <div className="flex flex-col h-[100dvh] bg-[#f4f6f8] overflow-hidden font-sans text-[#333]">

            <AppHeader title="Standing Orders" />

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
                <PanelGrid
                    title="Orders List"
                    icon={ClipboardList}
                    recordCount={orders.length}
                    onRefresh={() => setListKey(k => k + 1)}
                    refreshing={loadingOrders}
                    className="flex-1 xl:flex-none xl:w-[420px] xl:shrink-0"
                >
                    <PanelGridTable>
                        <PanelGridThead>
                            <PanelGridTh>Customer</PanelGridTh>
                            <PanelGridTh align="right">Order #</PanelGridTh>
                            <PanelGridTh>Day</PanelGridTh>
                            <PanelGridTh className="hidden sm:table-cell">Start</PanelGridTh>
                            <PanelGridTh className="hidden sm:table-cell">End</PanelGridTh>
                            <PanelGridTh className="hidden xl:table-cell">Salesman</PanelGridTh>
                            <PanelGridTh className="hidden xl:table-cell">Cargo</PanelGridTh>
                            <PanelGridTh align="center">Act.</PanelGridTh>
                        </PanelGridThead>
                        <PanelGridTbody>
                            {orders.map((o: any, i: number) => {
                                const uq  = t(o.UNICO ?? "");
                                const sel = selectedUnico === uq;
                                return (
                                    <PanelGridTr key={i}
                                        selected={sel}
                                        onClick={() => handleRowClick(uq, o)}
                                    >
                                        <PanelGridTd className="font-medium max-w-[140px] truncate">{t(o.CUSTOMER)}</PanelGridTd>
                                        <PanelGridTd align="right" className="font-bold text-blue-700">{t(o.SORDER_NO)}</PanelGridTd>
                                        <PanelGridTd className="font-bold text-[#FB7506]">{t(o.SO_DAY).trim()}</PanelGridTd>
                                        <PanelGridTd className="hidden sm:table-cell text-gray-500">{fmtDate(o.SO_STDATE)}</PanelGridTd>
                                        <PanelGridTd className="hidden sm:table-cell text-gray-500">{fmtDate(o.SO_ENDATE)}</PanelGridTd>
                                        <PanelGridTd className="hidden xl:table-cell max-w-[90px] truncate">{t(o.SALESMAN_NAME)}</PanelGridTd>
                                        <PanelGridTd className="hidden xl:table-cell max-w-[80px] truncate">{t(o.AGENCY)}</PanelGridTd>
                                        <PanelGridTd align="center">{bool(o.ACTIVE) ? <Check size={11} className="text-green-500 inline" /> : ""}</PanelGridTd>
                                    </PanelGridTr>
                                );
                            })}
                            {!loadingOrders && orders.length === 0 && (
                                <tr><td colSpan={8} className="py-16 text-center text-gray-400 italic text-sm">
                                    {textSearch || dayFilter !== "%" || myOrders ? "No orders match filters" : "No standing orders found"}
                                </td></tr>
                            )}
                        </PanelGridTbody>
                    </PanelGridTable>
                </PanelGrid>

                {/* Desktop inline detail panel (xl+, panel mode) */}
                {selectedUnico && selectedRow && lookups && !showModal && (
                    <div className="hidden xl:flex xl:flex-col flex-1 min-h-0 min-w-0">
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
