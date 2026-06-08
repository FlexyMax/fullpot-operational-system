"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    X, Loader2, Check, Trash2, Edit2, Plus,
    Calendar, Package, ShoppingCart, FileText,
    UserCog, Tractor, Printer, Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { HeaderModal }         from "./HeaderModal";
import { LineModal }           from "./LineModal";
import { SetWeeksModal }       from "./SetWeeksModal";
import { BoxCompositionModal } from "./BoxCompositionModal";
import { ProductsListModal }   from "./ProductsListModal";
import { FutureStockModal }    from "./FutureStockModal";
import { ChangeSalesmanModal } from "./ChangeSalesmanModal";
import { ChangeCustomerModal } from "./ChangeCustomerModal";
const EMPTY_ARR: any[] = [];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const t    = (v: any) => String(v ?? "").trim();
const norm = (rows: any[]) => rows.map(r => { const n: any = {}; for (const [k,v] of Object.entries(r)) n[k.toUpperCase()] = v; return n; });
const normOne = (r: any) => { if (!r) return null; const n: any = {}; for (const [k,v] of Object.entries(r)) n[k.toUpperCase()] = v; return n; };
const fmt  = (v: any) => parseFloat(v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtI = (v: any) => { const n = parseInt(v ?? 0); return isNaN(n) ? "" : n.toLocaleString("en-US"); };
const fmtDate = (v: any) => {
    if (!v) return "";
    const s = String(v).trim();
    const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso) return new Date(+iso[1], +iso[2]-1, +iso[3]).toLocaleDateString("en-US");
    const d = new Date(s); return isNaN(d.getTime()) ? s : d.toLocaleDateString("en-US");
};
const bool = (v: any) => v === true || v === 1 || String(v).toLowerCase() === "true";

const WEEK_COLS: [string,string][] = [["MON","Mon"],["TUE","Tue"],["WED","Wed"],["THU","Thu"],["FRI","Fri"],["SAT","Sat"],["SUN","Sun"]];

function Th({ children, className }: { children: any; className?: string }) {
    return <th className={cn("p-2 text-left font-bold whitespace-nowrap text-gray-700 border-l border-gray-200 first:border-l-0 bg-gray-100 sticky top-0 z-10", className)}>{children}</th>;
}
function Td({ children, className }: { children: any; className?: string }) {
    return <td className={cn("p-2 whitespace-nowrap border-l border-gray-100 first:border-l-0", className)}>{children}</td>;
}
function FieldRow({ label, value, className }: { label: string; value?: string; className?: string }) {
    return (
        <div className={cn("flex items-center gap-1 min-w-0", className)}>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide shrink-0">{label}:</span>
            <span className="text-[11px] text-gray-800 truncate">{value || "—"}</span>
        </div>
    );
}
function ABtn({ icon: Icon, label, onClick, disabled, variant = "default" }: any) {
    return (
        <button onClick={onClick} disabled={disabled}
            className={cn(
                "flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded border transition-all disabled:opacity-40 whitespace-nowrap shrink-0",
                variant === "danger"  && "bg-red-600 hover:bg-red-500 border-transparent text-white",
                variant === "green"   && "bg-green-600 hover:bg-green-500 border-transparent text-white",
                variant === "default" && "bg-white hover:bg-gray-100 border-white/30 text-gray-800",
            )}
        >{Icon && <Icon size={10} />}{label}</button>
    );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Lookups { customers:any[]; salesmen:any[]; warehouses:any[]; terms:any[]; cases:any[]; cargoAgencies:any[]; carriers:any[]; }
interface Props {
    soUnico:       string;
    orderRow:      any;   // normalized (uppercase keys) row from orders list
    lookups:       Lookups;
    canEdit:       boolean;
    canDelete:     boolean;
    mode?:         "modal" | "panel";  // modal = fixed overlay (mobile), panel = inline (desktop)
    onClose:       () => void;
    onRefreshList: () => void;
}

export function OrderDetailModal({ soUnico, orderRow, lookups, canEdit, canDelete, mode = "modal", onClose, onRefreshList }: Props) {
    const [detailKey,         setDetailKey]        = useState(0);
    const [selectedLineUnico, setSelectedLineUnico] = useState<string | null>(null);
    const [working,           setWorking]           = useState(false);

    // Sub-modal states
    const [headerModal,       setHeaderModal]       = useState<"closed"|"edit">("closed");
    const [lineModal,         setLineModal]         = useState<"closed"|"new"|"edit">("closed");
    const [weeksModal,        setWeeksModal]        = useState(false);
    const [boxCompModal,      setBoxCompModal]      = useState(false);
    const [productsModal,     setProductsModal]     = useState(false);
    const [futureStockModal,  setFutureStockModal]  = useState(false);
    const [changeSalesmanModal, setChangeSalesmanModal] = useState(false);
    const [changeCustomerModal, setChangeCustomerModal] = useState(false);

    // ── Detail query
    const { data: detail, isFetching: loadingDetail } = useQuery({
        queryKey: ["so-detail", soUnico, detailKey],
        queryFn: async () => {
            const r = await fetch(`/api/standing-orders/detail/${soUnico}`);
            const j = await r.json();
            if (!r.ok) throw new Error(j.error || "Failed");
            return { header: normOne(j.header), lines: norm(j.lines ?? []) };
        },
    });

    // ── Vendors query
    const { data: vendors = EMPTY_ARR, isFetching: loadingVendors } = useQuery({
        queryKey: ["so-vendors", selectedLineUnico],
        enabled: !!selectedLineUnico,
        queryFn: async () => {
            const r = await fetch(`/api/standing-orders/line-growers/${selectedLineUnico}`);
            const j = await r.json();
            if (!r.ok) throw new Error(j.error || "Failed");
            return norm(Array.isArray(j) ? j : []);
        },
    });

    const h     = detail?.header;
    const lines = detail?.lines ?? [];
    const selectedLine = selectedLineUnico ? lines.find((l: any) => t(l.UNICO) === selectedLineUnico) : null;

    const modalLookups = { customers: lookups.customers, salesmen: lookups.salesmen, warehouses: lookups.warehouses, terms: lookups.terms, cargoAgencies: lookups.cargoAgencies, carriers: lookups.carriers };

    // ── Handlers
    const handleDeleteOrder = useCallback(() => {
        toast("Delete this standing order?", {
            duration: 8000,
            action: { label: "Delete", onClick: async () => {
                setWorking(true);
                try {
                    const r = await fetch(`/api/standing-orders/header/${soUnico}`, { method: "DELETE" });
                    const j = await r.json();
                    if (!r.ok || !j.success) throw new Error(j.error || "Failed");
                    toast.success("Order deleted");
                    onRefreshList();
                    onClose();
                } catch (e: any) { toast.error(e.message); }
                finally { setWorking(false); }
            }},
            cancel: { label: "Cancel", onClick: () => {} },
        });
    }, [soUnico, onClose, onRefreshList]);

    const handleToFarm = useCallback(async () => {
        setWorking(true);
        try {
            const r = await fetch("/api/standing-orders/to-farm", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ unico: soUnico }),
            });
            const j = await r.json();
            if (!r.ok || !j.success) throw new Error(j.error || "Failed");
            toast.success("Sent to farm");
            setDetailKey(k => k + 1);
        } catch (e: any) { toast.error(e.message); }
        finally { setWorking(false); }
    }, [soUnico]);

    const handleDeleteLine = useCallback(() => {
        if (!selectedLineUnico) return;
        toast("Delete this order line?", {
            duration: 8000,
            action: { label: "Delete", onClick: async () => {
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
            }},
            cancel: { label: "Cancel", onClick: () => {} },
        });
    }, [selectedLineUnico]);

    const inner = (
        <div className={cn(
            "bg-white flex flex-col overflow-hidden",
            mode === "modal"
                ? "rounded-lg shadow-2xl w-full max-w-5xl max-h-[96vh]"
                : "w-full h-full rounded-lg border border-gray-200 shadow-sm"
        )}>

                {/* ── Dark header ─────────────────────────────────────── */}
                <div className="bg-[#374151] px-4 py-2.5 flex items-center justify-between shrink-0 rounded-t-lg">
                    <div className="flex items-center gap-3 min-w-0">
                        <span className="font-black text-[11px] text-white uppercase tracking-widest shrink-0">
                            Order #{t(orderRow?.SORDER_NO ?? h?.SORDER_NO)}
                        </span>
                        <span className="text-[11px] font-bold text-[#FB7506] truncate">
                            {t(orderRow?.CUSTOMER ?? h?.CUSTOMER ?? "Loading...")}
                        </span>
                        {loadingDetail && <Loader2 size={11} className="animate-spin text-white/50 shrink-0" />}
                    </div>
                    <button onClick={onClose} className="text-white/60 hover:text-white shrink-0 ml-2"><X size={15} /></button>
                </div>

                {/* ── Orange action bar ───────────────────────────────── */}
                <div className="bg-[#FB7506] px-3 py-1.5 flex items-center gap-1.5 shrink-0 overflow-x-auto">
                    <ABtn icon={Edit2}   label="Edit Order"     onClick={() => setHeaderModal("edit")}  disabled={!canEdit || loadingDetail} />
                    <ABtn icon={Trash2}  label="Delete"         onClick={handleDeleteOrder}              disabled={!canDelete || working} variant="danger" />
                    <div className="w-px h-4 bg-white/30 shrink-0" />
                    <ABtn icon={Calendar} label="Set Weeks"     onClick={() => setWeeksModal(true)} />
                    <ABtn icon={Printer}  label="Print"         onClick={() => {}} />
                    <div className="w-px h-4 bg-white/30 shrink-0" />
                    <ABtn icon={UserCog}  label="Change Cust."  onClick={() => setChangeCustomerModal(true)} />
                    <ABtn icon={UserCog}  label="Change Sales."  onClick={() => setChangeSalesmanModal(true)} />
                    <div className="w-px h-4 bg-white/30 shrink-0" />
                    <button onClick={handleToFarm} disabled={working}
                        className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest bg-red-600 hover:bg-red-500 text-white rounded border-transparent disabled:opacity-40 transition-all whitespace-nowrap shrink-0">
                        <Tractor size={10} /> SO to Farm
                    </button>
                </div>

                {/* ── Scrollable content ──────────────────────────────── */}
                <div className="flex-1 overflow-y-auto min-h-0 space-y-2 p-3">

                    {/* Customer info */}
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 px-4 py-2">
                            <FieldRow label="Salesman"  value={t(h?.SALESMAN_NAME)}         className="col-span-2" />
                            <FieldRow label="Terms"     value={t(h?.CONDITION)}             className="col-span-2" />
                            <FieldRow label="Day"       value={t(h?.SO_DAY).trim()} />
                            <FieldRow label="Warehouse" value={t(h?.WAREHOUSE)}             className="col-span-2" />
                            <FieldRow label="Cargo"     value={t(h?.AGENCY)} />
                            <FieldRow label="Factor"    value={t(h?.APPLYFOR ?? "1")} />
                            <FieldRow label="FOB Miami" value={bool(h?.FOBMIAMI) ? "Yes" : "No"} />
                            <FieldRow label="Active"    value={bool(h?.ACTIVE) ? "Yes" : "No"} />
                            <FieldRow label="Instructions" value={t(h?.INSTRUCTIONS)}       className="col-span-4" />
                        </div>
                    </div>

                    {/* Order fields */}
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden p-3 space-y-2">
                        <div className="flex items-center gap-6 pb-1.5 border-b border-gray-100 flex-wrap text-[11px]">
                            <FieldRow label="Order No."  value={t(h?.SORDER_NO)} />
                            <FieldRow label="CP Order"   value={t(h?.CPORDER_NO)} />
                            <FieldRow label="Add Date"   value={fmtDate(h?.SO_DATE)} />
                        </div>
                        <div className="flex items-center gap-0 bg-green-800 rounded px-3 py-1 flex-wrap overflow-x-auto">
                            <span className="text-[10px] font-black text-white uppercase tracking-widest mr-3 shrink-0">Week Day:</span>
                            {WEEK_COLS.map(([key, label]) => (
                                <label key={key} className="flex items-center gap-1 mr-3 shrink-0">
                                    <div className={cn("w-3 h-3 rounded-sm border border-white/50 shrink-0", bool(h?.[key]) ? "bg-white" : "bg-transparent")} />
                                    <span className="text-[10px] font-bold text-white">{label}</span>
                                </label>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 text-[11px]">
                            <FieldRow label="Start Date"  value={fmtDate(h?.SO_STDATE)} />
                            <FieldRow label="End Date"    value={fmtDate(h?.SO_ENDATE)} />
                            <div /><div />
                            <FieldRow label="Ship"        value={t(h?.SHIP_NAME)}    className="col-span-2" />
                            <FieldRow label="Address"     value={t(h?.SHIP_ADDRESS)} className="col-span-2" />
                            <FieldRow label="City"        value={t(h?.SHIP_CITY)} />
                            <FieldRow label="State"       value={t(h?.SHIP_STATE)} />
                            <FieldRow label="Zip"         value={t(h?.SHIP_ZIP)} />
                            <FieldRow label="Phone"       value={t(h?.SHIP_PHONE)} />
                        </div>
                    </div>

                    {/* S.O. Details */}
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        {/* Detail toolbar */}
                        <div className="bg-[#FB7506] px-3 py-1.5 flex items-center justify-between gap-2 flex-wrap overflow-x-auto">
                            <div className="flex items-center gap-1.5 shrink-0">
                                <Lock size={11} className="text-white/70" />
                                <span className="font-black text-[10px] text-white uppercase tracking-widest">S.O. Details</span>
                            </div>
                            <div className="flex items-center gap-1 flex-wrap">
                                <button onClick={() => setBoxCompModal(true)} disabled={!selectedLineUnico}
                                    className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest bg-red-600 hover:bg-red-500 text-white rounded disabled:opacity-40 whitespace-nowrap">
                                    <Package size={10} /> Box Comp.
                                </button>
                                <button onClick={() => setProductsModal(true)}
                                    className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest bg-white hover:bg-gray-100 border-white/30 text-gray-800 rounded whitespace-nowrap">
                                    <ShoppingCart size={10} /> Products
                                </button>
                                <button onClick={() => setFutureStockModal(true)}
                                    className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest bg-white hover:bg-gray-100 border-white/30 text-gray-800 rounded whitespace-nowrap">
                                    <FileText size={10} /> Future Stock
                                </button>
                                <div className="w-px h-4 bg-white/30 shrink-0" />
                                <ABtn icon={Plus}   label="Add Line"    onClick={() => setLineModal("new")}  disabled={!canEdit} />
                                <ABtn icon={Edit2}  label="Edit Line"   onClick={() => setLineModal("edit")} disabled={!selectedLineUnico || !canEdit} />
                                <ABtn icon={Trash2} label="Del. Line"   onClick={handleDeleteLine}           disabled={!selectedLineUnico || !canDelete || working} variant="danger" />
                            </div>
                        </div>
                        {/* Lines table */}
                        <div className="overflow-auto max-h-[280px]">
                            <table className="min-w-full text-xs text-left">
                                <thead>
                                    <tr>
                                        <Th>Product</Th><Th>Case</Th>
                                        <Th className="text-right">Qty</Th>
                                        <Th className="text-right">Purch.</Th>
                                        <Th className="text-right">Bx/Cs</Th>
                                        <Th className="text-right">Un/Bch</Th>
                                        <Th className="text-right">Price</Th>
                                        <Th className="text-right">Ext.</Th>
                                        <Th>BoxId</Th>
                                        <Th className="text-center">Food</Th>
                                        <Th className="text-center">Act</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lines.map((l: any, i: number) => {
                                        const uq = t(l.UNICO ?? "");
                                        const sel = selectedLineUnico === uq;
                                        return (
                                            <tr key={i} onClick={() => setSelectedLineUnico(sel ? null : uq)}
                                                className={cn("border-b cursor-pointer transition-colors text-gray-600",
                                                    sel ? "!bg-blue-100 ring-2 ring-inset ring-blue-300" : "odd:bg-white even:bg-gray-50 hover:bg-blue-50")}
                                            >
                                                <Td className="max-w-[180px] truncate font-medium">{t(l.DESCRIPTION ?? l.DETAILS)}</Td>
                                                <Td>{t(l.CASE_SH)}</Td>
                                                <Td className="text-right">{fmtI(l.QTY_SORDER)}</Td>
                                                <Td className="text-right">{fmtI(l.QTY_PORDER)}</Td>
                                                <Td className="text-right">{fmtI(l.BUNCHES_CASE)}</Td>
                                                <Td className="text-right">{fmtI(l.UNITS_BUNCH)}</Td>
                                                <Td className="text-right font-semibold">{fmt(l.SO_PRICE)}</Td>
                                                <Td className="text-right font-semibold">{fmt(l.EXT_PRICE)}</Td>
                                                <Td>{t(l.PCCODE)}</Td>
                                                <Td className="text-center">{bool(l.FOOD) ? <Check size={10} className="text-green-600 inline" /> : ""}</Td>
                                                <Td className="text-center">{bool(l.ACTIVE) ? <Check size={10} className="text-green-600 inline" /> : ""}</Td>
                                            </tr>
                                        );
                                    })}
                                    {loadingDetail && <tr><td colSpan={11} className="p-4 text-center text-gray-400 italic"><Loader2 size={12} className="animate-spin inline mr-1" />Loading...</td></tr>}
                                    {!loadingDetail && lines.length === 0 && (
                                        <tr><td colSpan={11} className="p-4 text-center text-gray-400 italic">No order lines</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Vendors */}
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="bg-[#FB7506] px-3 py-1.5 flex items-center gap-2 shrink-0">
                            <Lock size={11} className="text-white/70" />
                            <span className="font-black text-[10px] text-white uppercase tracking-widest">Vendors Orders</span>
                            {loadingVendors && <Loader2 size={10} className="animate-spin text-white/60" />}
                            {!selectedLineUnico && <span className="text-[9px] text-white/60 font-bold ml-1">— select a line above</span>}
                        </div>
                        <div className="overflow-auto max-h-[160px]">
                            <table className="min-w-full text-xs text-left">
                                <thead>
                                    <tr>
                                        <Th>Vendor</Th>
                                        <Th className="text-right">Qty Ord.</Th>
                                        <Th className="text-right">Qty Conf.</Th>
                                        <Th className="text-right">Diff</Th>
                                        <Th className="text-right">Price</Th>
                                        <Th>Ship Day</Th>
                                        <Th>Details</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(vendors as any[]).map((v: any, i: number) => (
                                        <tr key={i} className="border-b odd:bg-white even:bg-gray-50 text-gray-600">
                                            <Td className="font-medium">{t(v.GROWER ?? v.VENDOR)}</Td>
                                            <Td className="text-right">{fmtI(v.QTY_ORDER)}</Td>
                                            <Td className="text-right">{fmtI(v.QTY_CONFIRMED)}</Td>
                                            <Td className={cn("text-right font-bold", parseInt(v.QTY_DIFF ?? 0) !== 0 ? "text-red-600" : "")}>{fmtI(v.QTY_DIFF)}</Td>
                                            <Td className="text-right">{fmt(v.PO_PRICE)}</Td>
                                            <Td className="font-bold text-[#FB7506]">{t(v.SHIP_DAY).trim()}</Td>
                                            <Td className="max-w-[200px] truncate">{t(v.DETAILS)}</Td>
                                        </tr>
                                    ))}
                                    {!loadingVendors && (vendors as any[]).length === 0 && (
                                        <tr><td colSpan={7} className="p-4 text-center text-gray-400 italic">
                                            {selectedLineUnico ? "No vendor orders" : "Select a line to see vendors"}
                                        </td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>{/* end scrollable content */}
        </div>
    );

    const subModals = (
        <>
        {/* ── Sub-modals (z-50 > z-40 of this modal) ──────────────────────── */}
        {headerModal === "edit" && h && (
            <HeaderModal mode="edit" header={h} lookups={modalLookups}
                onClose={() => setHeaderModal("closed")}
                onSaved={() => { setHeaderModal("closed"); setDetailKey(k => k+1); onRefreshList(); }}
            />
        )}
        {lineModal !== "closed" && (
            <LineModal mode={lineModal} soUnico={soUnico}
                line={lineModal === "edit" ? selectedLine : undefined}
                cases={lookups.cases}
                onClose={() => setLineModal("closed")}
                onSaved={() => { setLineModal("closed"); setDetailKey(k => k+1); }}
            />
        )}
        {weeksModal && h && (
            <SetWeeksModal soUnico={soUnico} header={h}
                onClose={() => setWeeksModal(false)}
                onSaved={() => setWeeksModal(false)}
            />
        )}
        {boxCompModal && selectedLineUnico && selectedLine && (
            <BoxCompositionModal
                lineUnico={selectedLineUnico}
                lineDesc={t(selectedLine.DESCRIPTION ?? selectedLine.DETAILS ?? "")}
                soPrice={parseFloat(selectedLine.SO_PRICE ?? 0)}
                onClose={() => setBoxCompModal(false)}
            />
        )}
        {productsModal && (
            <ProductsListModal soUnico={soUnico} cases={lookups.cases}
                onClose={() => setProductsModal(false)}
                onAdded={() => setDetailKey(k => k+1)}
            />
        )}
        {futureStockModal && (
            <FutureStockModal onClose={() => setFutureStockModal(false)} />
        )}
        {changeSalesmanModal && h && (
            <ChangeSalesmanModal
                soUnico={soUnico} orderNo={t(h.SORDER_NO)}
                salesmen={lookups.salesmen} currentUq={t(h.SALESMAN_UQ ?? "")}
                onClose={() => setChangeSalesmanModal(false)}
                onSaved={() => { setChangeSalesmanModal(false); setDetailKey(k=>k+1); onRefreshList(); }}
            />
        )}
        {changeCustomerModal && h && (
            <ChangeCustomerModal
                soUnico={soUnico} orderNo={t(h.SORDER_NO)}
                customers={lookups.customers} carriers={lookups.carriers}
                onClose={() => setChangeCustomerModal(false)}
                onSaved={() => { setChangeCustomerModal(false); setDetailKey(k=>k+1); onRefreshList(); }}
            />
        )}
        </>
    );

    if (mode === "panel") {
        return <>{inner}{subModals}</>;
    }

    return (
        <>
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-2 sm:p-4">
            {inner}
        </div>
        {subModals}
        </>
    );
}
