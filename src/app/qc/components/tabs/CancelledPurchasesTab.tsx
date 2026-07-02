"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, XCircle, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import PanelGrid from "@/components/ui/PanelGrid";
import { AuditLogModal } from "@/components/AuditLogModal";
const EMPTY_ARR: any[] = [];

const t = (v: any) => String(v ?? "").trim();

function fmtDate(v: any) {
    if (!v) return "";
    const d = new Date(v);
    if (isNaN(d.getTime())) return t(v).split("T")[0];
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function toISO(v: any): string {
    if (!v) return "";
    const d = new Date(v);
    if (isNaN(d.getTime())) return t(v).split("T")[0];
    return d.toISOString().split("T")[0];
}

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_LABELS  = ["Su","Mo","Tu","We","Th","Fr","Sa"];
const todayISO    = new Date().toISOString().split("T")[0];

function CancelCalendar({ dates, selectedDate, onSelect }: {
    dates: any[];
    selectedDate: string | null;
    onSelect: (iso: string) => void;
}) {
    const now = new Date();
    const [viewYear,  setViewYear]  = useState(now.getFullYear());
    const [viewMonth, setViewMonth] = useState(now.getMonth());

    useEffect(() => {
        if (dates.length > 0) {
            const iso = toISO(dates[0].cancel_date ?? dates[0].canceldate);
            if (iso) {
                const d = new Date(iso + "T00:00:00");
                if (!isNaN(d.getTime())) { setViewMonth(d.getMonth()); setViewYear(d.getFullYear()); }
            }
        }
    }, [dates.length]);

    const countMap = useMemo(() => {
        const m: Record<string, number> = {};
        for (const row of dates) {
            const iso = toISO(row.cancel_date ?? row.canceldate);
            if (iso) m[iso] = Number(row.records ?? 1);
        }
        return m;
    }, [dates]);

    const prevM = () => viewMonth === 0 ? (setViewMonth(11), setViewYear(y => y - 1)) : setViewMonth(m => m - 1);
    const nextM = () => viewMonth === 11 ? (setViewMonth(0),  setViewYear(y => y + 1)) : setViewMonth(m => m + 1);

    const firstDOW  = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMon = new Date(viewYear, viewMonth + 1, 0).getDate();

    return (
        <div className="bg-white border border-[#DBD9D9] rounded-md overflow-hidden shrink-0">
            <div className="h-10 bg-[#374151] flex items-center justify-between px-3 shrink-0">
                <button onClick={prevM} className="text-white hover:text-orange-400 p-1 rounded transition-colors"><ChevronLeft size={14}/></button>
                <span className="font-bold text-[12px] text-white">{MONTH_NAMES[viewMonth]} {viewYear}</span>
                <button onClick={nextM} className="text-white hover:text-orange-400 p-1 rounded transition-colors"><ChevronRight size={14}/></button>
            </div>
            <div className="grid grid-cols-7 px-1 pt-1.5 pb-0.5">
                {DAY_LABELS.map(d => <div key={d} className="text-center text-[9px] font-bold text-gray-400">{d}</div>)}
            </div>
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
                            <span className={cn("text-[10px] leading-none mb-0.5",
                                isSel ? "text-white font-bold" : isTod ? "text-blue-600 font-bold" : hasDat ? "text-gray-700 font-semibold" : "text-gray-300",
                            )}>{day}</span>
                            {hasDat && (
                                <div className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold",
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

const CANCEL_PAGE = 25;

export default function CancelledPurchasesTab() {
    const [selDate,    setSelDate]    = useState<any>(null);
    const [cancelPage, setCancelPage] = useState(1);

    const qcPost = (url: string, body: any) =>
        fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
            .then(r => r.json());

    const { data: dateRows = EMPTY_ARR, isFetching: loadingDates } = useQuery({
        queryKey: ["qc-cancel-dates"],
        queryFn:  () => qcPost("/api/qc/cancellations/dates", {}),
        staleTime: 0,
        select:   (d: any) => d.data ?? [],
    });

    useEffect(() => {
        const list = dateRows as any[];
        if (list.length > 0 && !selDate) setSelDate(list[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [(dateRows as any[]).length]);

    const { data: cancelRows = EMPTY_ARR, isFetching: loadingCancel } = useQuery({
        queryKey: ["qc-cancel-list", selDate?.canceldate],
        queryFn:  () => qcPost("/api/qc/cancellations/list", { cancelDate: selDate.canceldate }),
        enabled:  !!selDate?.canceldate,
        staleTime: 0,
        select:   (d: any) => d.data ?? [],
    });

    const handleSelectDate = (iso: string) => {
        const found = (dateRows as any[]).find(d => toISO(d.cancel_date ?? d.canceldate) === iso);
        setSelDate(found ?? { canceldate: iso, cancel_date: iso });
        setCancelPage(1);
    };

    const totalCancelPages = Math.max(1, Math.ceil((cancelRows as any[]).length / CANCEL_PAGE));
    const pagedCancels     = (cancelRows as any[]).slice((cancelPage - 1) * CANCEL_PAGE, cancelPage * CANCEL_PAGE);

    const pagination = totalCancelPages > 1 ? (
        <div className="flex items-center gap-1 text-[10px] text-gray-500 mr-1">
            <button onClick={() => setCancelPage(p => Math.max(1, p - 1))} disabled={cancelPage <= 1} className="p-0.5 rounded hover:bg-gray-100 disabled:opacity-30">‹</button>
            <span><b>{cancelPage}</b>/{totalCancelPages}</span>
            <button onClick={() => setCancelPage(p => Math.min(totalCancelPages, p + 1))} disabled={cancelPage >= totalCancelPages} className="p-0.5 rounded hover:bg-gray-100 disabled:opacity-30">›</button>
        </div>
    ) : null;

    return (
        <div className="flex flex-col md:flex-row h-full gap-1.5">

            {/* ── Mobile: month calendar with green badges ─────── */}
            <div className="md:hidden">
                <CancelCalendar
                    dates={dateRows as any[]}
                    selectedDate={selDate ? toISO(selDate.cancel_date ?? selDate.canceldate) : null}
                    onSelect={handleSelectDate}
                />
            </div>

            {/* ── Desktop: left date list ───────────────────────── */}
            <PanelGrid
                title="Cancellations Date"
                icon={Calendar}
                recordCount={(dateRows as any[]).length > 0 ? (dateRows as any[]).length : undefined}
                onRefresh={() => {}}
                refreshing={loadingDates}
                headerRight={<AuditLogModal recordId={null} disabled/>}
                className="hidden md:flex w-56 shrink-0 shadow-sm"
            >
                <table className="w-full text-xs text-left">
                    <thead className="bg-[#4F4F4F] border-b border-[#DBD9D9] text-white text-[11px] font-bold uppercase sticky top-0">
                        <tr className="divide-x divide-[#DBD9D9]/30">
                            <th className="p-2">Date</th>
                            <th className="p-2 text-right">Cancellations</th>
                        </tr>
                    </thead>
                    <tbody className="fos-grid-tbody divide-y divide-[#DBD9D9]">
                        {loadingDates && <tr><td colSpan={2} className="p-4 text-center text-gray-400">Loading...</td></tr>}
                        {!loadingDates && (dateRows as any[]).length === 0 && <tr><td colSpan={2} className="p-4 text-center text-gray-400">No data</td></tr>}
                        {(dateRows as any[]).map((d: any, i: number) => (
                            <tr key={i}
                                onClick={() => { setSelDate(d); setCancelPage(1); }}
                                className={cn("cursor-pointer transition-colors divide-x divide-[#DBD9D9]",
                                    selDate?.canceldate === d.canceldate ? "bg-[#FB7506]/10 font-bold" : "hover:bg-gray-50")}>
                                <td className="p-2 whitespace-nowrap">{fmtDate(d.cancel_date)}</td>
                                <td className="p-2 text-right">{d.records}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </PanelGrid>

            {/* ── Right: cancellations grid ─────────────────────── */}
            <PanelGrid
                title="Purchase Cancellations by Date"
                icon={XCircle}
                recordCount={!loadingCancel && selDate && (cancelRows as any[]).length > 0 ? (cancelRows as any[]).length : undefined}
                onRefresh={() => {}}
                menuItems={[{ label: "Download CSV", icon: Download, color: "orange", onClick: () => {} }]}
                headerRight={
                    <div className="flex items-center gap-1">
                        {pagination}
                        <AuditLogModal recordId={null} disabled/>
                    </div>
                }
                className="flex-1 min-h-0 shadow-sm"
            >
                <table className="min-w-full text-xs text-left">
                    <thead className="bg-[#4F4F4F] border-b border-[#DBD9D9] text-white text-[11px] font-bold uppercase sticky top-0 z-10">
                        <tr className="divide-x divide-[#DBD9D9]/30">
                            {["Reason","Customer","Pbook No","C.PO No","PB Date","WH Date","Description","SO. Price","Qty Order","Bunches/Case","UxPack","Grower"].map(h => (
                                <th key={h} className="p-2 whitespace-nowrap">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="fos-grid-tbody divide-y divide-[#DBD9D9]">
                        {!selDate && <tr><td colSpan={12} className="p-6 text-center text-gray-400">Select a date on the left.</td></tr>}
                        {selDate && loadingCancel && <tr><td colSpan={12} className="p-6 text-center text-gray-400">Loading...</td></tr>}
                        {selDate && !loadingCancel && pagedCancels.length === 0 && <tr><td colSpan={12} className="p-6 text-center text-gray-400">No cancellations for this date.</td></tr>}
                        {pagedCancels.map((row: any, i: number) => (
                            <tr key={row.unico ?? i} className="hover:bg-gray-50 transition-colors divide-x divide-[#DBD9D9]">
                                <td className="p-2 font-bold text-purple-600 whitespace-nowrap">{t(row.reason)}</td>
                                <td className="p-2 whitespace-nowrap truncate max-w-[120px]">{t(row.customer)}</td>
                                <td className="p-2 whitespace-nowrap">{t(row.pbook_no)}</td>
                                <td className="p-2 whitespace-nowrap">{t(row.cporder_no)}</td>
                                <td className="p-2 whitespace-nowrap">{fmtDate(row.pb_date)}</td>
                                <td className="p-2 whitespace-nowrap">{fmtDate(row.whouse_date)}</td>
                                <td className="p-2 max-w-[160px] truncate">{t(row.description)}</td>
                                <td className="p-2 text-right font-bold text-[#FB7506] whitespace-nowrap">
                                    {row.so_price != null ? `$${Number(row.so_price).toFixed(2)}` : ""}
                                </td>
                                <td className="p-2 text-right">{row.qty_order}</td>
                                <td className="p-2 text-right">{row.pbbunches_case}</td>
                                <td className="p-2 text-right">{row.up_x_pack}</td>
                                <td className="p-2 whitespace-nowrap truncate max-w-[100px]">{t(row.grower)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </PanelGrid>
        </div>
    );
}
