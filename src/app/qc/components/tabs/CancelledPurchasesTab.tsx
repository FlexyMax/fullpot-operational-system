"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, XCircle, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import PanelGrid from "@/components/ui/PanelGrid";
const EMPTY_ARR: any[] = [];

const t = (v: any) => String(v ?? "").trim();

function fmtDate(v: any) {
    if (!v) return "";
    const d = new Date(v);
    if (isNaN(d.getTime())) return t(v).split("T")[0];
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function toInputDate(v: any): string {
    if (!v) return "";
    const d = new Date(v);
    if (isNaN(d.getTime())) return t(v).split("T")[0];
    return d.toISOString().split("T")[0];
}

const CANCEL_PAGE = 25;

export default function CancelledPurchasesTab() {
    const [selDate,    setSelDate]    = useState<any>(null);
    const [cancelPage, setCancelPage] = useState(1);
    const [mobileDate, setMobileDate] = useState("");

    const { data: dateRows = EMPTY_ARR, isFetching: loadingDates } = useQuery({
        queryKey: ["qc-cancel-dates"],
        queryFn:  () => fetch("/api/qc/cancellations/dates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) }).then(r => r.json()),
        staleTime: 0,
        select:   (d: any) => d.data ?? [],
    });

    useEffect(() => {
        const list = dateRows as any[];
        if (list.length > 0 && !selDate) {
            setSelDate(list[0]);
            setMobileDate(toInputDate(list[0].cancel_date ?? list[0].canceldate));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [(dateRows as any[]).length]);

    const { data: cancelRows = EMPTY_ARR, isFetching: loadingCancel } = useQuery({
        queryKey: ["qc-cancel-list", selDate?.canceldate],
        queryFn:  () => fetch("/api/qc/cancellations/list", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cancelDate: selDate.canceldate }) }).then(r => r.json()),
        enabled:  !!selDate?.canceldate,
        staleTime: 0,
        select:   (d: any) => d.data ?? [],
    });

    const totalCancelPages = Math.max(1, Math.ceil((cancelRows as any[]).length / CANCEL_PAGE));
    const pagedCancels     = (cancelRows as any[]).slice((cancelPage - 1) * CANCEL_PAGE, cancelPage * CANCEL_PAGE);

    const handleMobileDateChange = (val: string) => {
        setMobileDate(val);
        const found = (dateRows as any[]).find(d => toInputDate(d.cancel_date ?? d.canceldate) === val);
        if (found) { setSelDate(found); setCancelPage(1); }
        else if (val) { setSelDate({ canceldate: val, cancel_date: val }); setCancelPage(1); }
    };

    const pagination = totalCancelPages > 1 ? (
        <div className="flex items-center gap-1 text-[10px] text-gray-500 mr-1">
            <button onClick={() => setCancelPage(p => Math.max(1, p - 1))} disabled={cancelPage <= 1} className="p-0.5 rounded hover:bg-gray-100 disabled:opacity-30">‹</button>
            <span><b>{cancelPage}</b>/{totalCancelPages}</span>
            <button onClick={() => setCancelPage(p => Math.min(totalCancelPages, p + 1))} disabled={cancelPage >= totalCancelPages} className="p-0.5 rounded hover:bg-gray-100 disabled:opacity-30">›</button>
        </div>
    ) : null;

    return (
        <div className="flex flex-col md:flex-row h-full gap-1.5">

            {/* ── Mobile: date picker ───────────────────────────── */}
            <div className="md:hidden bg-[#F5F3F3] rounded-lg border border-[#DBD9D9] px-3 py-2 flex items-center gap-2 shrink-0">
                <Calendar size={13} className="text-[#FB7506] shrink-0"/>
                <span className="text-[11px] font-bold text-[#4F4F4F] uppercase shrink-0">Date</span>
                <input type="date" value={mobileDate} onChange={e => handleMobileDateChange(e.target.value)}
                    className="fos-input py-1 flex-1 text-[11px]"/>
            </div>

            {/* ── Desktop: left date list ───────────────────────── */}
            <div className="hidden md:flex w-56 flex-col bg-white rounded-md border border-[#DBD9D9] shadow-sm overflow-hidden shrink-0">
                <div className="h-10 bg-white border-b border-[#DBD9D9] flex items-center gap-2 px-3 shrink-0">
                    <Calendar size={14} className="text-[#FB7506]"/>
                    <span className="text-[#4F4F4F] text-[14px] font-bold uppercase tracking-tight truncate">Cancellations Date</span>
                </div>
                <div className="flex-1 overflow-auto">
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
                                    onClick={() => { setSelDate(d); setCancelPage(1); setMobileDate(toInputDate(d.cancel_date ?? d.canceldate)); }}
                                    className={cn("cursor-pointer transition-colors divide-x divide-[#DBD9D9]",
                                        selDate?.canceldate === d.canceldate ? "bg-[#FB7506]/10 font-bold" : "hover:bg-gray-50")}>
                                    <td className="p-2 whitespace-nowrap">{fmtDate(d.cancel_date)}</td>
                                    <td className="p-2 text-right">{d.records}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Right: cancellations grid ─────────────────────── */}
            <PanelGrid
                title="Purchase Cancellations by Date"
                icon={XCircle}
                recordCount={!loadingCancel && selDate && (cancelRows as any[]).length > 0 ? (cancelRows as any[]).length : undefined}
                menuItems={[{ label: "Download CSV", icon: Download, color: "orange", onClick: () => {} }]}
                headerRight={pagination}
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
