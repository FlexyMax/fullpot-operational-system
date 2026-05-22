"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const t   = (v: any) => String(v ?? "").trim();
const fmt = (v: any) => parseFloat(v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const qcPost = (url: string, body: any) =>
    fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        .then(r => r.json());

export default function QCHistoryTab() {
    const [selDate, setSelDate] = useState<any>(null);
    const [selRow,  setSelRow]  = useState<any>(null);

    const { data: dateRows = [], isFetching: loadingDates } = useQuery({
        queryKey: ["qc-history-dates"],
        queryFn: () => qcPost("/api/qc/history/dates", { dateFilter: 1 }),
        staleTime: 0,
        select: (d: any) => d.data ?? [],
    });

    const { data: historyRows = [], isFetching: loadingHistory } = useQuery({
        queryKey: ["qc-history-list", selDate?.crdate],
        queryFn: () => qcPost("/api/qc/history/list", { dateFilter: 1, crDate: selDate.crdate, growerUq: "%" }),
        enabled: !!selDate?.crdate,
        staleTime: 0,
        select: (d: any) => d.data ?? [],
    });

    return (
        <div className="flex h-full gap-2">
            {/* Left: QC dates */}
            <div className="w-52 flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden shrink-0">
                <div className="h-8 bg-[#374151] flex items-center px-3 shrink-0">
                    <span className="text-white text-[10px] font-black uppercase tracking-widest">QC Dates</span>
                </div>
                <div className="overflow-auto flex-1">
                    <table className="min-w-full text-xs text-left">
                        <thead className="bg-gray-100 border-b fos-grid-thead text-gray-700 sticky top-0">
                            <tr><th className="p-1.5">CR Date</th><th className="p-1.5 text-right">Credits</th></tr>
                        </thead>
                        <tbody className="fos-grid-tbody divide-y divide-gray-100">
                            {loadingDates && <tr><td colSpan={2} className="p-4 text-center text-gray-400">Loading...</td></tr>}
                            {(dateRows as any[]).map((d: any, i: number) => (
                                <tr key={i} onClick={() => { setSelDate(d); setSelRow(null); }}
                                    className={cn("cursor-pointer", selDate?.crdate === d.crdate ? "!bg-blue-100 ring-2 ring-inset ring-blue-300" : "hover:bg-blue-50")}>
                                    <td className="p-1.5 whitespace-nowrap">{t(d.cr_date)?.split("T")[0]}</td>
                                    <td className="p-1.5 text-right">{d.records}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Right: history list */}
            <div className="flex-1 flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="h-8 bg-[#374151] flex items-center justify-between px-3 shrink-0">
                    <span className="text-white text-[10px] font-black uppercase tracking-widest">QC Stock Search</span>
                    {!loadingHistory && selDate && <span className="text-gray-400 text-[10px]">{(historyRows as any[]).length} records</span>}
                </div>
                <div className="overflow-auto flex-1">
                    <table className="min-w-full text-xs text-left">
                        <thead className="bg-gray-100 border-b fos-grid-thead text-gray-700 sticky top-0">
                            <tr>{["CR Date","Grower","AWBCode","Description","Lote","Invoice","Box Qty","CR Boxes","CR Units","CR Amount","Reason","Status","Warning","Sent"].map(h => (
                                <th key={h} className="p-1.5 border-r border-gray-200 last:border-r-0 whitespace-nowrap">{h}</th>
                            ))}</tr>
                        </thead>
                        <tbody className="fos-grid-tbody divide-y divide-gray-100">
                            {!selDate && <tr><td colSpan={14} className="p-6 text-center text-gray-400">Select a date on the left.</td></tr>}
                            {selDate && loadingHistory && <tr><td colSpan={14} className="p-6 text-center text-gray-400">Loading...</td></tr>}
                            {selDate && !loadingHistory && (historyRows as any[]).length === 0 && <tr><td colSpan={14} className="p-6 text-center text-gray-400">No QC records for this date.</td></tr>}
                            {(historyRows as any[]).map((row: any, i: number) => (
                                <tr key={row.unico ?? i} onClick={() => setSelRow(row)}
                                    className={cn("cursor-pointer transition-colors", selRow?.unico === row.unico ? "!bg-blue-100 ring-2 ring-inset ring-blue-300" : "hover:bg-blue-50")}>
                                    <td className="p-1.5 whitespace-nowrap">{t(row.cr_date)?.split("T")[0]}</td>
                                    <td className="p-1.5 whitespace-nowrap">{t(row.grower)}</td>
                                    <td className="p-1.5 font-bold text-[#FB7506]">{t(row.awbcode)}</td>
                                    <td className="p-1.5 max-w-[140px] truncate">{t(row.description)}</td>
                                    <td className="p-1.5 text-right">{row.lote}</td>
                                    <td className="p-1.5 whitespace-nowrap">{t(row.invoice_no)}</td>
                                    <td className="p-1.5 text-right">{row.box_qty}</td>
                                    <td className="p-1.5 text-right">{row.cr_boxes}</td>
                                    <td className="p-1.5 text-right">{row.cr_units}</td>
                                    <td className="p-1.5 text-right font-bold text-red-600">{fmt(row.cr_amount)}</td>
                                    <td className="p-1.5 whitespace-nowrap">{t(row.reason)}</td>
                                    <td className="p-1.5">{t(row.status)}</td>
                                    <td className="p-1.5 text-center">{row.warning ? "⚠" : ""}</td>
                                    <td className="p-1.5 text-center">{row.sent ? "✓" : ""}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
