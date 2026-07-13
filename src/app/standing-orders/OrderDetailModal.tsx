"use client";

import { useState, useCallback, useEffect } from "react";
import { useStandingOrdersStore } from "@/stores/useStandingOrdersStore";
import { useQuery } from "@tanstack/react-query";
import {
    X, Loader2, Check, Trash2, Edit2, Plus,
    Calendar, CalendarRange, Package, ShoppingCart, FileText,
    UserCog, Tractor, Printer, Lock, ClipboardList,
} from "lucide-react";
import { GridMenu } from "@/components/GridMenu";
import { cn } from "@/lib/utils";
import PanelGrid from "@/components/ui/PanelGrid";
import { PanelGridTable, PanelGridThead, PanelGridTh, PanelGridTbody, PanelGridTr, PanelGridTd } from "@/components/ui/PanelGridTable";
import { toast } from "sonner";
import { HeaderModal }         from "./HeaderModal";
import { LineModal }           from "./LineModal";
import { SetWeeksModal }       from "./SetWeeksModal";
import { BoxCompositionModal } from "./BoxCompositionModal";
import { ProductsListModal }   from "./ProductsListModal";
import { FutureStockModal }    from "./FutureStockModal";
import { ChangeSalesmanModal } from "./ChangeSalesmanModal";
import { ChangeCustomerModal } from "./ChangeCustomerModal";
import { ChangeSeasonModal }   from "./ChangeSeasonModal";
import { ReportModal }          from "@/components/reports/ReportModal";
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
interface Lookups { customers:any[]; salesmen:any[]; warehouses:any[]; terms:any[]; cases:any[]; cargoAgencies:any[]; carriers:any[]; seasons:any[]; }
interface Props {
    lookups:    Lookups;
    canEdit:    boolean;
    canDelete:  boolean;
    canReport?: boolean;
    mode?:      "modal" | "panel";
}

export function OrderDetailModal({ lookups, canEdit, canDelete, canReport = true, mode = "modal" }: Props) {
    const {
        selectedUnico: soUnico,
        selectedRow:   orderRow,
        detailKey,
        selectedLineUnico,
        setSelectedLineUnico,
        refreshList,
        refreshDetail,
        clearSelection,
    } = useStandingOrdersStore();

    const [working, setWorking] = useState(false);

    // Sub-modal states
    const [headerModal,       setHeaderModal]       = useState<"closed"|"edit">("closed");
    const [lineModal,         setLineModal]         = useState<"closed"|"new"|"edit">("closed");
    const [weeksModal,        setWeeksModal]        = useState(false);
    const [boxCompModal,      setBoxCompModal]      = useState(false);
    const [productsModal,     setProductsModal]     = useState(false);
    const [futureStockModal,  setFutureStockModal]  = useState(false);
    const [changeSalesmanModal, setChangeSalesmanModal] = useState(false);
    const [changeCustomerModal, setChangeCustomerModal] = useState(false);
    const [changeSeasonModal,   setChangeSeasonModal]   = useState(false);
    const [reportUrl,           setReportUrl]           = useState<string | null>(null);

    // ── Detail query
    const { data: detail, isFetching: loadingDetail } = useQuery({
        queryKey: ["so-detail", soUnico, detailKey],
        enabled: !!soUnico,
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

    // Auto-select first line when detail loads and nothing is selected yet
    useEffect(() => {
        if (lines.length > 0 && !selectedLineUnico) {
            setSelectedLineUnico(t(lines[0].UNICO));
        }
    }, [lines, selectedLineUnico, setSelectedLineUnico]);

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
                    refreshList();
                    clearSelection();
                } catch (e: any) { toast.error(e.message); }
                finally { setWorking(false); }
            }},
            cancel: { label: "Cancel", onClick: () => {} },
        });
    }, [soUnico, clearSelection, refreshList]);

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
            refreshDetail();
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
                    refreshDetail();
                } catch (e: any) { toast.error(e.message); }
                finally { setWorking(false); }
            }},
            cancel: { label: "Cancel", onClick: () => {} },
        });
    }, [selectedLineUnico]);

    if (!soUnico) return null;

    const inner = (
        <div className={cn(
            "bg-white flex flex-col overflow-hidden",
            mode === "modal"
                ? "rounded-lg shadow-2xl w-full max-w-5xl max-h-[96vh]"
                : "w-full h-full rounded-lg border border-[#DBD9D9] shadow-sm"
        )}>

                {/* ── Panel header (white) ─────────────────────────────── */}
                <div className="h-10 bg-white border-b border-[#DBD9D9] flex items-center justify-between pl-3 pr-2 shrink-0">
                    <div className="flex items-center gap-2 min-w-0">
                        <FileText size={14} className="text-[#FB7506] shrink-0" />
                        <span className="font-bold text-[12px] text-[#374151] uppercase tracking-widest shrink-0">
                            Order #{t(orderRow?.SORDER_NO ?? h?.SORDER_NO)}
                        </span>
                        <span className="text-[11px] font-semibold text-gray-500 truncate hidden sm:block">
                            — {t(orderRow?.CUSTOMER ?? h?.CUSTOMER ?? "Loading...")}
                        </span>
                        {loadingDetail && <Loader2 size={11} className="animate-spin text-gray-400 shrink-0" />}
                    </div>
                    <button onClick={clearSelection} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors shrink-0"><X size={15} /></button>
                </div>

                {/* ── Action bar (gray container) ──────────────────────── */}
                <div className="bg-[#F5F3F3] border-b border-[#DBD9D9] px-3 py-1.5 flex items-center gap-1.5 shrink-0 overflow-x-auto">
                    <ABtn icon={Edit2}   label="Edit Order"     onClick={() => setHeaderModal("edit")}  disabled={!canEdit || loadingDetail} />
                    <ABtn icon={Calendar} label="Set Weeks"     onClick={() => setWeeksModal(true)} />
                    <ABtn icon={Printer}  label="Print"         onClick={() => setReportUrl(`/api/standing-orders/report?unico=${soUnico}`)} disabled={!canReport} />
                    <div className="w-px h-5 bg-[#DBD9D9] mx-0.5 shrink-0" />
                    <ABtn icon={UserCog}      label="Change Cust."    onClick={() => setChangeCustomerModal(true)} />
                    <ABtn icon={UserCog}      label="Change Sales."   onClick={() => setChangeSalesmanModal(true)} />
                    <ABtn icon={CalendarRange} label="Change Season"  onClick={() => setChangeSeasonModal(true)} />
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
                    <PanelGrid
                        title="S.O. Details"
                        icon={ClipboardList}
                        recordCount={lines.length}
                        refreshing={loadingDetail}
                        headerRight={
                            <ABtn icon={Plus} label="Add Line" onClick={() => setProductsModal(true)} disabled={!canEdit} variant="green" />
                        }
                        menuItems={[
                            { label: "Edit Line",    icon: Edit2,       color: "orange", onClick: () => setLineModal("edit"),       disabled: !selectedLineUnico || !canEdit },
                            { label: "Box Comp.",    icon: Package,     color: "blue",   onClick: () => setBoxCompModal(true),      disabled: !selectedLineUnico },
                            { label: "Future Stock", icon: FileText,    color: "blue",   onClick: () => setFutureStockModal(true), separator: true },
                            { label: "Del. Line",    icon: Trash2,      color: "red",    onClick: handleDeleteLine,                disabled: !selectedLineUnico || !canDelete || working },
                        ]}
                        className="rounded-lg"
                    >
                        <PanelGridTable>
                            <PanelGridThead>
                                <PanelGridTh>Product</PanelGridTh>
                                <PanelGridTh>Case</PanelGridTh>
                                <PanelGridTh align="right">Qty</PanelGridTh>
                                <PanelGridTh align="right">Purch.</PanelGridTh>
                                <PanelGridTh align="right">Bx/Cs</PanelGridTh>
                                <PanelGridTh align="right">Un/Bch</PanelGridTh>
                                <PanelGridTh align="right">Price</PanelGridTh>
                                <PanelGridTh align="right">Ext.</PanelGridTh>
                                <PanelGridTh>BoxId</PanelGridTh>
                                <PanelGridTh align="center">Food</PanelGridTh>
                                <PanelGridTh align="center">Act</PanelGridTh>
                            </PanelGridThead>
                            <PanelGridTbody>
                                {lines.map((l: any, i: number) => {
                                    const uq  = t(l.UNICO ?? "");
                                    const sel = selectedLineUnico === uq;
                                    return (
                                        <PanelGridTr key={i} selected={sel} onClick={() => setSelectedLineUnico(sel ? null : uq)}>
                                            <PanelGridTd className="max-w-[180px] truncate font-medium">{t(l.DESCRIPTION ?? l.DETAILS)}</PanelGridTd>
                                            <PanelGridTd className="text-[#FB7506] font-bold">{t(l.CASE_SH)}</PanelGridTd>
                                            <PanelGridTd align="right">{fmtI(l.QTY_SORDER)}</PanelGridTd>
                                            <PanelGridTd align="right">{fmtI(l.QTY_PORDER)}</PanelGridTd>
                                            <PanelGridTd align="right">{fmtI(l.BUNCHES_CASE)}</PanelGridTd>
                                            <PanelGridTd align="right">{fmtI(l.UNITS_BUNCH)}</PanelGridTd>
                                            <PanelGridTd align="right" className="font-semibold">{fmt(l.SO_PRICE)}</PanelGridTd>
                                            <PanelGridTd align="right" className="font-semibold">{fmt(l.EXT_PRICE)}</PanelGridTd>
                                            <PanelGridTd className="text-[#FB7506] font-bold">{t(l.PCCODE)}</PanelGridTd>
                                            <PanelGridTd align="center">{bool(l.FOOD)   ? <Check size={10} className="text-green-600 inline" /> : ""}</PanelGridTd>
                                            <PanelGridTd align="center">{bool(l.ACTIVE) ? <Check size={10} className="text-green-600 inline" /> : ""}</PanelGridTd>
                                        </PanelGridTr>
                                    );
                                })}
                                {!loadingDetail && lines.length === 0 && (
                                    <PanelGridTr selected={false} onClick={() => {}}>
                                        <PanelGridTd colSpan={11} align="center" className="text-gray-400 italic py-6">No order lines</PanelGridTd>
                                    </PanelGridTr>
                                )}
                            </PanelGridTbody>
                        </PanelGridTable>
                    </PanelGrid>

                    {/* Vendors */}
                    <PanelGrid
                        title="Vendors Orders"
                        icon={Lock}
                        recordCount={selectedLineUnico ? (vendors as any[]).length : undefined}
                        refreshing={loadingVendors}
                        className="rounded-lg"
                    >
                        {!selectedLineUnico && (
                            <p className="text-[11px] text-gray-400 italic px-3 py-4">Select a line above to see vendor orders</p>
                        )}
                        {selectedLineUnico && (
                            <PanelGridTable>
                                <PanelGridThead>
                                    <PanelGridTh>Vendor</PanelGridTh>
                                    <PanelGridTh align="right">Qty Ord.</PanelGridTh>
                                    <PanelGridTh align="right">Qty Conf.</PanelGridTh>
                                    <PanelGridTh align="right">Diff</PanelGridTh>
                                    <PanelGridTh align="right">Price</PanelGridTh>
                                    <PanelGridTh>Ship Day</PanelGridTh>
                                    <PanelGridTh>Details</PanelGridTh>
                                </PanelGridThead>
                                <PanelGridTbody>
                                    {(vendors as any[]).map((v: any, i: number) => (
                                        <PanelGridTr key={i} selected={false} onClick={() => {}}>
                                            <PanelGridTd className="font-medium">{t(v.GROWER ?? v.VENDOR)}</PanelGridTd>
                                            <PanelGridTd align="right">{fmtI(v.QTY_ORDER)}</PanelGridTd>
                                            <PanelGridTd align="right">{fmtI(v.QTY_CONFIRMED)}</PanelGridTd>
                                            <PanelGridTd align="right" className={cn("font-bold", parseInt(v.QTY_DIFF ?? 0) !== 0 ? "text-red-600" : "")}>{fmtI(v.QTY_DIFF)}</PanelGridTd>
                                            <PanelGridTd align="right">{fmt(v.PO_PRICE)}</PanelGridTd>
                                            <PanelGridTd className="font-bold text-[#FB7506]">{t(v.SHIP_DAY).trim()}</PanelGridTd>
                                            <PanelGridTd className="max-w-[200px] truncate">{t(v.DETAILS)}</PanelGridTd>
                                        </PanelGridTr>
                                    ))}
                                    {!loadingVendors && (vendors as any[]).length === 0 && (
                                        <PanelGridTr selected={false} onClick={() => {}}>
                                            <PanelGridTd colSpan={7} align="center" className="text-gray-400 italic py-4">No vendor orders</PanelGridTd>
                                        </PanelGridTr>
                                    )}
                                </PanelGridTbody>
                            </PanelGridTable>
                        )}
                    </PanelGrid>
                </div>{/* end scrollable content */}
        </div>
    );

    const subModals = (
        <>
        {/* ── Sub-modals (z-50 > z-40 of this modal) ──────────────────────── */}
        {headerModal === "edit" && h && (
            <HeaderModal mode="edit" header={h} lookups={modalLookups}
                onClose={() => setHeaderModal("closed")}
                onSaved={() => { setHeaderModal("closed"); refreshDetail(); refreshList(); }}
            />
        )}
        {lineModal !== "closed" && (
            <LineModal mode={lineModal} soUnico={soUnico}
                line={lineModal === "edit" ? selectedLine : undefined}
                cases={lookups.cases}
                onClose={() => setLineModal("closed")}
                onSaved={() => { setLineModal("closed"); refreshDetail(); }}
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
                onAdded={() => refreshDetail()}
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
                onSaved={() => { setChangeSalesmanModal(false); refreshDetail(); refreshList(); }}
            />
        )}
        {changeCustomerModal && h && (
            <ChangeCustomerModal
                soUnico={soUnico} orderNo={t(h.SORDER_NO)}
                customers={lookups.customers} carriers={lookups.carriers}
                onClose={() => setChangeCustomerModal(false)}
                onSaved={() => { setChangeCustomerModal(false); refreshDetail(); refreshList(); }}
            />
        )}
        {changeSeasonModal && h && (
            <ChangeSeasonModal
                soUnico={soUnico} orderNo={t(h.SORDER_NO)}
                seasons={lookups.seasons ?? []}
                currentUq={t(h.PBSEASON_UQ ?? "")}
                salesmanUq={t(h.SALESMAN_UQ ?? "")}
                onClose={() => setChangeSeasonModal(false)}
                onSaved={() => { setChangeSeasonModal(false); refreshDetail(); }}
            />
        )}
        {reportUrl && <ReportModal url={reportUrl} onClose={() => setReportUrl(null)} />}
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
