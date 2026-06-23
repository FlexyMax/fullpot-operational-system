"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    X, Loader2, Check, Trash2, Edit2, Plus,
    Calendar, Package, ShoppingCart, FileText,
    UserCog, Tractor, Printer, Lock, ClipboardList,
} from "lucide-react";
import { GridMenu } from "@/components/GridMenu";
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
    return <th className={cn("p-2 text-left font-bold whitespace-nowrap", className)}>{children}</th>;
}
function Td({ children, className }: { children: any; className?: string }) {
    return <td className={cn("p-2 whitespace-nowrap", className)}>{children}</td>;
}
function FieldRow({ label, value, className }: { label: string; value?: string; className?: string }) {
    return (
        <div className={cn("flex items-center gap-1.5 min-w-0", className)}>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide shrink-0">{label}:</span>
            <span className="text-[12px] text-[#333] truncate">{value || "—"}</span>
        </div>
    );
}
function ABtn({ icon: Icon, label, onClick, disabled, variant = "default" }: any) {
    return (
        <button onClick={onClick} disabled={disabled}
            className={cn(
                "flex items-center gap-1.5 h-7 px-3 text-[14px] font-semibold uppercase tracking-wide rounded-md border transition-all disabled:opacity-40 whitespace-nowrap shrink-0",
                variant === "danger"  && "bg-[#FB7506]/10 hover:bg-[#FB7506]/20 border-[#FB7506]/30 text-[#FB7506]",
                variant === "primary" && "bg-[#FB7506] hover:bg-orange-500 border-transparent text-white",
                variant === "green"   && "bg-green-600 hover:bg-green-500 border-transparent text-white",
                variant === "default" && "bg-white hover:bg-gray-50 border-[#DBD9D9] text-[#4F4F4F]",
            )}
        >{Icon && <Icon size={14} />}{label}</button>
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
                : "w-full h-full rounded-lg border border-[#DBD9D9] shadow-sm"
        )}>

                {/* ── Panel header ─────────────────────────────────────── */}
                <div className="h-10 bg-white border-b border-[#DBD9D9] flex items-center justify-between px-3 shrink-0 rounded-t-lg">
                    <div className="flex items-center gap-2 min-w-0">
                        <FileText size={14} className="text-[#FB7506] shrink-0" />
                        <span className="text-[14px] font-bold uppercase tracking-tight text-[#4F4F4F] shrink-0">
                            Order #{t(orderRow?.SORDER_NO ?? h?.SORDER_NO)}
                        </span>
                        <span className="text-[12px] font-semibold text-gray-500 truncate">
                            — {t(orderRow?.CUSTOMER ?? h?.CUSTOMER ?? "Loading...")}
                        </span>
                        {loadingDetail && <Loader2 size={11} className="animate-spin text-gray-400 shrink-0" />}
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 shrink-0 ml-2 p-1"><X size={16} /></button>
                </div>

                {/* ── Action bar (gray container) ──────────────────────── */}
                <div className="bg-[#F5F3F3] border-b border-[#DBD9D9] px-3 py-1.5 flex items-center gap-1.5 shrink-0 overflow-x-auto">
                    <ABtn icon={Edit2}   label="Edit Order"     onClick={() => setHeaderModal("edit")}  disabled={!canEdit || loadingDetail} />
                    <ABtn icon={Calendar} label="Set Weeks"     onClick={() => setWeeksModal(true)} />
                    <ABtn icon={Printer}  label="Print"         onClick={() => {}} />
                    <div className="w-px h-5 bg-[#DBD9D9] mx-0.5 shrink-0" />
                    <ABtn icon={UserCog}  label="Change Cust."  onClick={() => setChangeCustomerModal(true)} />
                    <ABtn icon={UserCog}  label="Change Sales."  onClick={() => setChangeSalesmanModal(true)} />
                    <div className="w-px h-5 bg-[#DBD9D9] mx-0.5 shrink-0" />
                    <ABtn icon={Tractor} label="SO to Farm"    onClick={handleToFarm} disabled={working} variant="primary" />
                    <ABtn icon={Trash2}  label="Delete"         onClick={handleDeleteOrder} disabled={!canDelete || working} variant="danger" />
                </div>

                {/* ── Scrollable content ──────────────────────────────── */}
                <div className="flex-1 overflow-y-auto min-h-0 space-y-2 p-3">

                    {/* Order info — consolidated single card */}
                    <div className="bg-white rounded-lg border border-[#DBD9D9] overflow-hidden p-3 space-y-2">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1.5">
                            <FieldRow label="CP Order"   value={t(h?.CPORDER_NO)} />
                            <FieldRow label="Add Date"   value={fmtDate(h?.SO_DATE)} />
                            <FieldRow label="Start Date" value={fmtDate(h?.SO_STDATE)} />
                            <FieldRow label="End Date"   value={fmtDate(h?.SO_ENDATE)} />
                            <FieldRow label="Salesman"  value={t(h?.SALESMAN_NAME)} className="col-span-2" />
                            <FieldRow label="Warehouse" value={t(h?.WAREHOUSE)}     className="col-span-2" />
                            <FieldRow label="Terms"     value={t(h?.CONDITION)} />
                            <FieldRow label="Cargo"     value={t(h?.AGENCY)} />
                            <FieldRow label="Factor"    value={t(h?.APPLYFOR ?? "1")} />
                            <FieldRow label="FOB Miami" value={bool(h?.FOBMIAMI) ? "Yes" : "No"} />
                            <FieldRow label="Active"    value={bool(h?.ACTIVE) ? "Yes" : "No"} className="col-span-3" />
                        </div>

                        <div className="flex items-center gap-2 bg-[#F5F3F3] border border-[#DBD9D9] rounded-md px-3 py-1.5 flex-wrap overflow-x-auto">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mr-1 shrink-0">Week Day:</span>
                            {WEEK_COLS.map(([key, label]) => (
                                <span key={key}
                                    className={cn("px-2 h-5 flex items-center rounded text-[10px] font-bold uppercase shrink-0",
                                        bool(h?.[key]) ? "bg-[#FB7506] text-white" : "text-gray-400")}>
                                    {label}
                                </span>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1.5">
                            <FieldRow label="Ship"    value={t(h?.SHIP_NAME)}    className="col-span-2" />
                            <FieldRow label="Address" value={t(h?.SHIP_ADDRESS)} className="col-span-2" />
                            <FieldRow label="City/State/Zip" value={[t(h?.SHIP_CITY), t(h?.SHIP_STATE)].filter(Boolean).join(", ") + (t(h?.SHIP_ZIP) ? ` ${t(h?.SHIP_ZIP)}` : "")} className="col-span-2" />
                            <FieldRow label="Phone"   value={t(h?.SHIP_PHONE)} className="col-span-2" />
                        </div>

                        {t(h?.INSTRUCTIONS) && (
                            <FieldRow label="Instructions" value={t(h?.INSTRUCTIONS)} />
                        )}
                    </div>

                    {/* S.O. Details */}
                    <div className="bg-white rounded-lg border border-[#DBD9D9] overflow-hidden">
                        {/* Detail header */}
                        <div className="h-10 bg-white border-b border-[#DBD9D9] flex items-center justify-between pl-3 pr-0 shrink-0">
                            <div className="flex items-center gap-2 shrink-0">
                                <ClipboardList size={14} className="text-[#FB7506]" />
                                <span className="text-[14px] font-bold uppercase tracking-tight text-[#4F4F4F]">S.O. Details</span>
                            </div>
                            <div className="flex items-center gap-2 pr-2 shrink-0">
                                <ABtn icon={Plus} label="Add Line" onClick={() => setLineModal("new")} disabled={!canEdit} variant="green" />
                                <GridMenu items={[
                                    { label: "Edit Line", icon: Edit2, color: "orange", onClick: () => setLineModal("edit"), disabled: !selectedLineUnico || !canEdit },
                                    { label: "Box Comp.", icon: Package, color: "blue", onClick: () => setBoxCompModal(true), disabled: !selectedLineUnico },
                                    { label: "Products", icon: ShoppingCart, color: "blue", onClick: () => setProductsModal(true) },
                                    { label: "Future Stock", icon: FileText, color: "blue", onClick: () => setFutureStockModal(true), separator: true },
                                    { label: "Del. Line", icon: Trash2, color: "red", onClick: handleDeleteLine, disabled: !selectedLineUnico || !canDelete || working },
                                ]} />
                            </div>
                        </div>
                        {/* Lines table */}
                        <div className="overflow-auto max-h-[280px]">
                            <table className="min-w-full text-xs text-left">
                                <thead className="bg-[#4F4F4F] text-white text-[11px] font-bold uppercase sticky top-0 z-10">
                                    <tr className="divide-x divide-[#DBD9D9]/30">
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
                                <tbody className="divide-y divide-[#DBD9D9]">
                                    {lines.map((l: any, i: number) => {
                                        const uq = t(l.UNICO ?? "");
                                        const sel = selectedLineUnico === uq;
                                        return (
                                            <tr key={i} onClick={() => setSelectedLineUnico(sel ? null : uq)}
                                                className={cn("cursor-pointer transition-colors text-gray-600 divide-x divide-[#DBD9D9]",
                                                    sel ? "!bg-[#FB7506]/10" : "hover:bg-gray-50")}
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
                    <div className="bg-white rounded-lg border border-[#DBD9D9] overflow-hidden">
                        <div className="h-10 bg-white border-b border-[#DBD9D9] flex items-center gap-2 px-3 shrink-0">
                            <Lock size={14} className="text-[#FB7506]" />
                            <span className="text-[14px] font-bold uppercase tracking-tight text-[#4F4F4F]">Vendors Orders</span>
                            {loadingVendors && <Loader2 size={10} className="animate-spin text-gray-400" />}
                            {!selectedLineUnico && <span className="text-[10px] text-gray-400 font-bold ml-1">— select a line above</span>}
                        </div>
                        <div className="overflow-auto max-h-[160px]">
                            <table className="min-w-full text-xs text-left">
                                <thead className="bg-[#4F4F4F] text-white text-[11px] font-bold uppercase sticky top-0 z-10">
                                    <tr className="divide-x divide-[#DBD9D9]/30">
                                        <Th>Vendor</Th>
                                        <Th className="text-right">Qty Ord.</Th>
                                        <Th className="text-right">Qty Conf.</Th>
                                        <Th className="text-right">Diff</Th>
                                        <Th className="text-right">Price</Th>
                                        <Th>Ship Day</Th>
                                        <Th>Details</Th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#DBD9D9]">
                                    {(vendors as any[]).map((v: any, i: number) => (
                                        <tr key={i} className="text-gray-600 hover:bg-gray-50 transition-colors divide-x divide-[#DBD9D9]">
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
