"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, Download, Pencil, Trash2, History, ClipboardList, Calendar, AlignJustify } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQCContext } from "../../context/QCContext";
const EMPTY_ARR: any[] = [];

const t = (v: any) => String(v ?? "").trim();
const fmtDate = (v: any) => {
    if (!v) return "";
    const d = new Date(v);
    return isNaN(d.getTime()) ? t(v).split("T")[0] : d.toISOString().split("T")[0];
};
const fmtUSD = (v: any) => v != null && v !== "" ? `$ ${Number(v).toFixed(2)}` : "";

function toInputDate(v: any): string {
    if (!v) return "";
    const d = new Date(v);
    if (isNaN(d.getTime())) return t(v).split("T")[0];
    return d.toISOString().split("T")[0];
}

const qcPost = (url: string, body: any) =>
    fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        .then(r => r.json());

const toastConfirm = (msg: string, fn: () => void) =>
    toast(msg, { duration: 10000, action: { label: "Confirm", onClick: fn }, cancel: { label: "Cancel", onClick: () => {} } });

// ── Action Menu ───────────────────────────────────────────────────────────────
function ActionMenu({ onEdit, onDelete, hasSelection, canEdit, canDelete }: any) {
    const [open, setOpen] = useState(false);
    const [pos,  setPos]  = useState({ top: 0, right: 0 });
    const btnRef          = useRef<HTMLButtonElement>(null);
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);
    useEffect(() => {
        if (!open) return;
        const h = (e: MouseEvent) => {
            if (btnRef.current && !btnRef.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, [open]);
    const toggle = () => {
        if (!open && btnRef.current) {
            const r = btnRef.current.getBoundingClientRect();
            setPos({ top: r.bottom + 4, right: window.innerWidth - r.right });
        }
        setOpen(v => !v);
    };
    return (
        <>
            <button ref={btnRef} onClick={toggle}
                className={cn("h-full w-10 flex items-center justify-center hover:bg-gray-100 transition-colors shrink-0", open ? "flex-row gap-[5px]" : "flex-col gap-[5px]")}>
                {open ? (
                    <><span className="block h-5 w-[2px] bg-[#FB7506] rounded-full"/><span className="block h-5 w-[2px] bg-[#FB7506] rounded-full"/><span className="block h-5 w-[2px] bg-[#FB7506] rounded-full"/></>
                ) : (
                    <><span className="block w-5 h-[2px] bg-[#FB7506] rounded-full"/><span className="block w-5 h-[2px] bg-[#FB7506] rounded-full"/><span className="block w-5 h-[2px] bg-[#FB7506] rounded-full"/></>
                )}
            </button>
            {mounted && open && createPortal(
                <div style={{ position: "fixed", top: pos.top, right: pos.right, zIndex: 100, minWidth: 220 }}
                    className="bg-white border border-gray-200 shadow-xl rounded-sm py-1 overflow-hidden">
                    <button disabled={!hasSelection || !canEdit}
                        onClick={() => { onEdit?.(); setOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-[14px] font-semibold uppercase hover:bg-[#FB7506]/10 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-3 text-[#FB7506]">
                        <Pencil size={16}/> Edit QC Credit
                    </button>
                    <button disabled={!hasSelection || !canDelete}
                        onClick={() => { onDelete?.(); setOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-[14px] font-semibold uppercase hover:bg-[#FB7506]/10 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-3 text-red-500">
                        <Trash2 size={16}/> Delete QC Credit
                    </button>
                </div>,
                document.body
            )}
        </>
    );
}

interface Props {
    onEditQC?: (lot: any, credit: any) => void;
}

export default function QCHistoryTab({ onEditQC }: Props) {
    const { canEdit, canDelete } = useQCContext();

    const [selDate,   setSelDate]   = useState<any>(null);
    const [selRow,    setSelRow]    = useState<any>(null);
    const [mobileDate, setMobileDate] = useState("");

    const { data: dateRows = EMPTY_ARR, isFetching: loadingDates, refetch: refetchDates } = useQuery({
        queryKey: ["qc-history-dates"],
        queryFn:  () => qcPost("/api/qc/history/dates", { dateFilter: 1 }),
        staleTime: 0,
        select:   (d: any) => d.data ?? [],
    });

    const { data: historyRows = EMPTY_ARR, isFetching: loadingHistory } = useQuery({
        queryKey: ["qc-history-list", selDate?.crdate],
        queryFn:  () => qcPost("/api/qc/history/list", { dateFilter: 1, crDate: selDate.crdate, growerUq: "%" }),
        enabled:  !!selDate?.crdate,
        staleTime: 0,
        select:   (d: any) => d.data ?? [],
    });

    // Auto-select first date when list loads
    useEffect(() => {
        const list = dateRows as any[];
        if (list.length > 0 && !selDate) {
            setSelDate(list[0]);
            setMobileDate(toInputDate(list[0].crdate));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [(dateRows as any[]).length]);

    // Auto-select first history row when date changes
    useEffect(() => {
        const list = historyRows as any[];
        setSelRow(list.length > 0 ? list[0] : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selDate?.crdate, (historyRows as any[]).length]);

    const handleMobileDateChange = (val: string) => {
        setMobileDate(val);
        const found = (dateRows as any[]).find(d => toInputDate(d.crdate) === val);
        if (found) setSelDate(found);
        else if (val) setSelDate({ crdate: val });
        setSelRow(null);
    };

    const handleEdit = () => {
        if (!selRow) { toast.error("Select a QC credit row first."); return; }
        const lot = {
            unico:       selRow.pk_box_uq ?? selRow.unico,
            lote:        selRow.lote,
            description: selRow.description,
            awbcode:     selRow.awbcode,
            grower:      selRow.grower,
            flower_cost: 0, f_cost_x_u: 0, c_cost_x_u: 0, stock: 0, qty_transit: 0, total_units: 0,
        };
        const credit = {
            unico:             selRow.unico,
            reason_uq:         selRow.reason_uq        ?? "",
            cr_date:           selRow.cr_date,
            cr_boxes:          selRow.cr_boxes,
            cr_units:          selRow.cr_units,
            cr_amount:         selRow.cr_amount,
            notes:             selRow.notes,
            apply_freight:     selRow.apply_freight    ?? false,
            apply_farm:        selRow.apply_farm       ?? false,
            apply_labor:       selRow.apply_labor      ?? false,
            apply_replacement: selRow.apply_replacement ?? false,
            sent:              selRow.sent             ?? false,
            warning:           selRow.warning          ?? false,
            suggested_value:   0,
            percentage:        0,
        };
        onEditQC?.(lot, credit);
    };

    const handleDelete = () => {
        if (!selRow) { toast.error("Select a QC credit row first."); return; }
        toastConfirm("Delete this QC credit?", async () => {
            const d = await qcPost("/api/qc/credits/delete", { unico: selRow.unico });
            if (!d.success) { toast.error(d.error || "Error deleting QC credit."); return; }
            toast.success("QC credit deleted.");
            setSelRow(null);
        });
    };

    return (
        <div className="flex flex-col h-full gap-1.5">

            {/* ── Top header bar — gray bg, title + icons ─────── */}
            <div className="flex items-stretch bg-[#F5F3F3] rounded-lg border border-[#DBD9D9] shadow-sm overflow-hidden shrink-0 h-9">
                <div className="flex items-center gap-2 px-3 flex-1 min-w-0">
                    <History size={14} className="text-[#FB7506] shrink-0"/>
                    <span className="text-[#4F4F4F] text-[14px] font-bold uppercase tracking-tight truncate">QC History</span>
                </div>
                <button onClick={() => refetchDates()} title="Refresh"
                    className="px-3 border-l border-[#DBD9D9] text-green-500 hover:text-green-600 shrink-0">
                    <RefreshCw size={14} className={loadingDates ? "animate-spin" : ""}/>
                </button>
                <button title="Log" className="px-3 border-l border-[#DBD9D9] text-gray-400 hover:text-[#FB7506] shrink-0">
                    <ClipboardList size={14}/>
                </button>
                <ActionMenu
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    hasSelection={!!selRow}
                    canEdit={canEdit} canDelete={canDelete}
                />
            </div>

            {/* ── Mobile: date picker ──────────────────────────── */}
            <div className="md:hidden bg-[#F5F3F3] rounded-lg border border-[#DBD9D9] px-3 py-2 flex items-center gap-2 shrink-0">
                <Calendar size={13} className="text-[#FB7506] shrink-0"/>
                <span className="text-[11px] font-bold text-[#4F4F4F] uppercase shrink-0">Date</span>
                <input type="date" value={mobileDate} onChange={e => handleMobileDateChange(e.target.value)}
                    className="fos-input py-1 flex-1 text-[11px]"/>
            </div>

            {/* ── Content: left dates + right credits ─────────── */}
            <div className="flex flex-col md:flex-row gap-2 flex-1 min-h-0">

                {/* Left: date panel (hidden on mobile) */}
                <div className="hidden md:flex w-52 flex-col bg-white rounded-lg border border-[#DBD9D9] shadow-sm overflow-hidden shrink-0">
                    {/* Date list header */}
                    <div className="h-8 bg-white border-b border-[#DBD9D9] flex items-center gap-2 px-3 shrink-0">
                        <Calendar size={12} className="text-[#FB7506]"/>
                        <span className="text-[#4F4F4F] text-[11px] font-bold uppercase tracking-tight">QC Dates</span>
                    </div>
                    <div className="overflow-auto flex-1">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-white border-b border-[#DBD9D9] text-[#4F4F4F] text-[11px] font-bold uppercase sticky top-0">
                                <tr className="divide-x divide-[#DBD9D9]">
                                    <th className="p-2">QC Date</th>
                                    <th className="p-2 text-right">Credits</th>
                                </tr>
                            </thead>
                            <tbody className="fos-grid-tbody divide-y divide-[#DBD9D9]">
                                {loadingDates && <tr><td colSpan={2} className="p-4 text-center text-gray-400">Loading...</td></tr>}
                                {(dateRows as any[]).map((d: any, i: number) => (
                                    <tr key={i} onClick={() => { setSelDate(d); setSelRow(null); setMobileDate(toInputDate(d.crdate)); }}
                                        className={cn("cursor-pointer transition-colors divide-x divide-[#DBD9D9]",
                                            selDate?.crdate === d.crdate ? "bg-[#FB7506]/10 font-bold" : "hover:bg-gray-50")}>
                                        <td className="p-2 whitespace-nowrap">{fmtDate(d.crdate)}</td>
                                        <td className="p-2 text-right">{d.records}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right: history grid */}
                <div className="flex flex-col flex-1 bg-white rounded-lg border border-[#DBD9D9] shadow-sm overflow-hidden min-h-0">
                    {/* Grid header */}
                    <div className="h-9 border-b border-[#DBD9D9] flex items-center px-3 shrink-0 bg-white">
                        <History size={13} className="text-[#FB7506] shrink-0 mr-2"/>
                        <span className="text-[#4F4F4F] text-[13px] font-bold uppercase tracking-tight truncate flex-1">QC Credit Records</span>
                        {!loadingHistory && selDate && (historyRows as any[]).length > 0 && (
                            <span className="bg-[#FB7506]/10 text-[#FB7506] text-[10px] font-bold rounded-full px-2 py-0.5 whitespace-nowrap mr-2">
                                {(historyRows as any[]).length}
                            </span>
                        )}
                        <button title="Download" className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                            <Download size={13}/>
                        </button>
                        <button title="Log" className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-[#FB7506] transition-colors">
                            <AlignJustify size={13}/>
                        </button>
                    </div>

                    {/* Grid — white headers */}
                    <div className="overflow-auto flex-1">
                        <table className="min-w-full text-xs text-left">
                            <thead className="bg-white border-b border-[#DBD9D9] text-[#4F4F4F] text-[11px] font-bold uppercase sticky top-0 z-10">
                                <tr className="divide-x divide-[#DBD9D9]">{["QC Date","Invoice Date","QC Boxes","QC Units","Qc Amount","Reason","Notes","Lot","AWBcode","Description","Box Qty"].map(h => (
                                    <th key={h} className="p-2 whitespace-nowrap">{h}</th>
                                ))}</tr>
                            </thead>
                            <tbody className="fos-grid-tbody divide-y divide-[#DBD9D9]">
                                {!selDate && <tr><td colSpan={11} className="p-6 text-center text-gray-400">Select a date on the left.</td></tr>}
                                {selDate && loadingHistory && <tr><td colSpan={11} className="p-6 text-center text-gray-400">Loading...</td></tr>}
                                {selDate && !loadingHistory && (historyRows as any[]).length === 0 && <tr><td colSpan={11} className="p-6 text-center text-gray-400">No QC records for this date.</td></tr>}
                                {(historyRows as any[]).map((row: any, i: number) => (
                                    <tr key={row.unico ?? i} onClick={() => setSelRow(row)}
                                        className={cn("cursor-pointer transition-colors divide-x divide-[#DBD9D9]", selRow?.unico === row.unico ? "!bg-[#FB7506]/10" : "hover:bg-gray-50")}>
                                        <td className="p-2 whitespace-nowrap">{fmtDate(row.cr_date)}</td>
                                        <td className="p-2 whitespace-nowrap">{fmtDate(row.invoice_no || row.awbdate)}</td>
                                        <td className="p-2 text-right">{row.cr_boxes}</td>
                                        <td className="p-2 text-right">{row.cr_units}</td>
                                        <td className="p-2 text-right font-bold text-orange-500">{fmtUSD(row.cr_amount)}</td>
                                        <td className="p-2 font-bold text-green-600 whitespace-nowrap">{t(row.reason)}</td>
                                        <td className="p-2 text-blue-500 max-w-[160px] truncate">{t(row.notes)}</td>
                                        <td className="p-2 text-right">{row.lote}</td>
                                        <td className="p-2 font-mono whitespace-nowrap">{t(row.awbcode)}</td>
                                        <td className="p-2 max-w-[180px] truncate">{t(row.description)}</td>
                                        <td className="p-2 text-right">{row.box_qty}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
