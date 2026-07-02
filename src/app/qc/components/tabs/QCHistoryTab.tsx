"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, Pencil, Trash2, History, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import PanelGrid from "@/components/ui/PanelGrid";
import { AuditLogModal } from "@/components/AuditLogModal";
import { useQCContext } from "../../context/QCContext";
const EMPTY_ARR: any[] = [];

const t = (v: any) => String(v ?? "").trim();
const fmtDate = (v: any) => {
    if (!v) return "";
    const d = new Date(v);
    return isNaN(d.getTime()) ? t(v).split("T")[0] : d.toISOString().split("T")[0];
};
const fmtUSD = (v: any) => v != null && v !== "" ? `$ ${Number(v).toFixed(2)}` : "";

function toISO(v: any): string {
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

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_LABELS  = ["Su","Mo","Tu","We","Th","Fr","Sa"];
const todayISO    = new Date().toISOString().split("T")[0];

// ── Month calendar with green circle badges (matches accounts-payable standard) ─
function QCCalendar({ dates, selectedDate, onSelect }: {
    dates: any[];
    selectedDate: string | null;
    onSelect: (iso: string) => void;
}) {
    const now = new Date();
    const [viewYear,  setViewYear]  = useState(now.getFullYear());
    const [viewMonth, setViewMonth] = useState(now.getMonth());

    // Jump to the month of the most recent date when dates load
    useEffect(() => {
        if (dates.length > 0) {
            const iso = toISO(dates[0].crdate);
            if (iso) {
                const d = new Date(iso + "T00:00:00");
                if (!isNaN(d.getTime())) { setViewMonth(d.getMonth()); setViewYear(d.getFullYear()); }
            }
        }
    }, [dates.length]);

    const countMap = useMemo(() => {
        const m: Record<string, number> = {};
        for (const row of dates) {
            const iso = toISO(row.crdate);
            if (iso) m[iso] = Number(row.records ?? 1);
        }
        return m;
    }, [dates]);

    const prevM = () => viewMonth === 0 ? (setViewMonth(11), setViewYear(y => y - 1)) : setViewMonth(m => m - 1);
    const nextM = () => viewMonth === 11 ? (setViewMonth(0),  setViewYear(y => y + 1)) : setViewMonth(m => m + 1);

    const firstDOW   = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMon  = new Date(viewYear, viewMonth + 1, 0).getDate();

    return (
        <div className="bg-white border border-[#DBD9D9] rounded-md overflow-hidden shrink-0">
            {/* Header */}
            <div className="h-10 bg-[#374151] flex items-center justify-between px-3 shrink-0">
                <button onClick={prevM} className="text-white hover:text-orange-400 p-1 rounded transition-colors">
                    <ChevronLeft size={14}/>
                </button>
                <span className="font-bold text-[12px] text-white">{MONTH_NAMES[viewMonth]} {viewYear}</span>
                <button onClick={nextM} className="text-white hover:text-orange-400 p-1 rounded transition-colors">
                    <ChevronRight size={14}/>
                </button>
            </div>
            {/* Day headers */}
            <div className="grid grid-cols-7 px-1 pt-1.5 pb-0.5">
                {DAY_LABELS.map(d => (
                    <div key={d} className="text-center text-[9px] font-bold text-gray-400">{d}</div>
                ))}
            </div>
            {/* Day cells */}
            <div className="grid grid-cols-7 gap-0.5 px-1 pb-2">
                {Array.from({ length: firstDOW }, (_, i) => <div key={`e${i}`}/>)}
                {Array.from({ length: daysInMon }, (_, i) => {
                    const day   = i + 1;
                    const iso   = `${viewYear}-${String(viewMonth + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                    const count = countMap[iso];
                    const hasDat = count !== undefined && count > 0;
                    const isSel  = selectedDate === iso;
                    const isTod  = iso === todayISO;
                    return (
                        <div key={day} onClick={() => hasDat && onSelect(iso)}
                            className={cn(
                                "flex flex-col items-center justify-start py-1 rounded min-h-[40px] transition-colors",
                                hasDat ? "cursor-pointer" : "cursor-default",
                                isSel ? "bg-blue-500" : hasDat ? "bg-green-50 hover:bg-green-100" : "",
                                isTod && !isSel ? "ring-2 ring-inset ring-blue-400" : "",
                            )}>
                            <span className={cn(
                                "text-[10px] leading-none mb-0.5",
                                isSel ? "text-white font-bold" : isTod ? "text-blue-600 font-bold" : hasDat ? "text-gray-700 font-semibold" : "text-gray-300",
                            )}>{day}</span>
                            {hasDat && (
                                <div className={cn(
                                    "w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold",
                                    isSel ? "bg-white text-blue-600" : "bg-green-500 text-white",
                                )}>{count}</div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

interface Props {
    onEditQC?: (lot: any, credit: any) => void;
}

export default function QCHistoryTab({ onEditQC }: Props) {
    const { canEdit, canDelete } = useQCContext();

    const [selDate, setSelDate] = useState<any>(null);
    const [selRow,  setSelRow]  = useState<any>(null);

    const { data: dateRows = EMPTY_ARR, isFetching: loadingDates, refetch: refetchDates } = useQuery({
        queryKey: ["qc-history-dates"],
        queryFn:  () => qcPost("/api/qc/history/dates", { dateFilter: 1 }),
        staleTime: 0,
        select:   (d: any) => d.data ?? [],
    });

    const { data: historyRows = EMPTY_ARR, isFetching: loadingHistory, refetch: refetchHistory } = useQuery({
        queryKey: ["qc-history-list", selDate?.crdate],
        queryFn:  () => qcPost("/api/qc/history/list", { dateFilter: 1, crDate: selDate.crdate, growerUq: "%" }),
        enabled:  !!selDate?.crdate,
        staleTime: 0,
        select:   (d: any) => d.data ?? [],
    });

    useEffect(() => {
        const list = dateRows as any[];
        if (list.length > 0 && !selDate) setSelDate(list[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [(dateRows as any[]).length]);

    useEffect(() => {
        const list = historyRows as any[];
        setSelRow(list.length > 0 ? list[0] : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selDate?.crdate, (historyRows as any[]).length]);

    const handleSelectDate = (iso: string) => {
        const found = (dateRows as any[]).find(d => toISO(d.crdate) === iso);
        setSelDate(found ?? { crdate: iso });
        setSelRow(null);
    };

    const handleEdit = () => {
        if (!selRow) { toast.error("Select a QC credit row first."); return; }
        const lot = {
            unico: selRow.pk_box_uq ?? selRow.unico, lote: selRow.lote, description: selRow.description,
            awbcode: selRow.awbcode, grower: selRow.grower,
            flower_cost: 0, f_cost_x_u: 0, c_cost_x_u: 0, stock: 0, qty_transit: 0, total_units: 0,
        };
        const credit = {
            unico: selRow.unico, reason_uq: selRow.reason_uq ?? "", cr_date: selRow.cr_date,
            cr_boxes: selRow.cr_boxes, cr_units: selRow.cr_units, cr_amount: selRow.cr_amount,
            notes: selRow.notes, apply_freight: selRow.apply_freight ?? false,
            apply_farm: selRow.apply_farm ?? false, apply_labor: selRow.apply_labor ?? false,
            apply_replacement: selRow.apply_replacement ?? false,
            sent: selRow.sent ?? false, warning: selRow.warning ?? false,
            suggested_value: 0, percentage: 0,
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

            {/* ── Mobile: month calendar with green badges ─────── */}
            <div className="md:hidden">
                <QCCalendar
                    dates={dateRows as any[]}
                    selectedDate={selDate ? toISO(selDate.crdate) : null}
                    onSelect={handleSelectDate}
                />
            </div>

            {/* ── Desktop: left dates list + right credits ──────── */}
            <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-1.5">

                {/* Left: QC Dates panel (desktop only) */}
                <PanelGrid
                    title="QC Dates"
                    icon={Calendar}
                    recordCount={(dateRows as any[]).length > 0 ? (dateRows as any[]).length : undefined}
                    onRefresh={() => refetchDates()}
                    refreshing={loadingDates}
                    headerRight={<AuditLogModal recordId={null} disabled/>}
                    className="hidden md:flex w-52 shrink-0 shadow-sm"
                >
                    <table className="w-full text-xs text-left">
                        <thead className="bg-[#4F4F4F] border-b border-[#DBD9D9] text-white text-[11px] font-bold uppercase sticky top-0">
                            <tr className="divide-x divide-[#DBD9D9]/30">
                                <th className="p-2">QC Date</th>
                                <th className="p-2 text-right">Credits</th>
                            </tr>
                        </thead>
                        <tbody className="fos-grid-tbody divide-y divide-[#DBD9D9]">
                            {loadingDates && <tr><td colSpan={2} className="p-4 text-center text-gray-400">Loading...</td></tr>}
                            {(dateRows as any[]).map((d: any, i: number) => (
                                <tr key={i} onClick={() => { setSelDate(d); setSelRow(null); }}
                                    className={cn("cursor-pointer transition-colors divide-x divide-[#DBD9D9]",
                                        selDate?.crdate === d.crdate ? "bg-[#FB7506]/10 font-bold" : "hover:bg-gray-50")}>
                                    <td className="p-2 whitespace-nowrap">{fmtDate(d.crdate)}</td>
                                    <td className="p-2 text-right">{d.records}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </PanelGrid>

                {/* Right: QC Credit Records */}
                <PanelGrid
                    title="QC Credit Records"
                    icon={History}
                    recordCount={!loadingHistory && selDate && (historyRows as any[]).length > 0 ? (historyRows as any[]).length : undefined}
                    onRefresh={() => refetchHistory()}
                    refreshing={loadingHistory}
                    onDownload={() => {}}
                    menuItems={[
                        { label: "Edit QC Credit",   icon: Pencil, color: "orange", onClick: handleEdit,   disabled: !canEdit   || !selRow },
                        { label: "Delete QC Credit", icon: Trash2, color: "red",    onClick: handleDelete, disabled: !canDelete || !selRow },
                    ]}
                    headerRight={<AuditLogModal recordId={selRow?.unico} disabled={!selRow}/>}
                    className="flex-1 min-w-0 shadow-sm"
                >
                    <table className="min-w-full text-xs text-left">
                        <thead className="bg-[#4F4F4F] border-b border-[#DBD9D9] text-white text-[11px] font-bold uppercase sticky top-0 z-10">
                            <tr className="divide-x divide-[#DBD9D9]/30">{["QC Date","Invoice Date","QC Boxes","QC Units","Qc Amount","Reason","Notes","Lot","AWBcode","Description","Box Qty"].map(h => (
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
                </PanelGrid>
            </div>
        </div>
    );
}
