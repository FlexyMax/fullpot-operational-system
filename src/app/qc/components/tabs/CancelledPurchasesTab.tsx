"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const t   = (v: any) => String(v ?? "").trim();
const fmt = (v: any) => parseFloat(v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const qcPost = (url: string, body: any) =>
    fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        .then(r => r.json());

export default function CancelledPurchasesTab() {
    const [selDate,   setSelDate]   = useState<any>(null);
    const [selCancel, setSelCancel] = useState<any>(null);

    const { data: dateRows = [], isFetching: loadingDates } = useQuery({
        queryKey: ["qc-cancel-dates"],
        queryFn: () => qcPost("/api/qc/cancellations/dates", {}),
        staleTime: 0,
        select: (d: any) => d.data ?? [],
    });

    const { data: cancelRows = [], isFetching: loadingCancel } = useQuery({
        queryKey: ["qc-cancel-list", selDate?.canceldate],
        queryFn: () => qcPost("/api/qc/cancellations/list", { cancelDate: selDate.canceldate }),
        enabled: !!selDate?.canceldate,
        staleTime: 0,
        select: (d: any) => d.data ?? [],
    });

    return (
        <div className="flex h-full gap-2">
            {/* Left: dates */}
            <div className="w-52 flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden shrink-0">
                <div className="h-8 bg-[#374151] flex items-center px-3 shrink-0">
                    <span className="text-white text-[10px] font-black uppercase tracking-widest">Cancellation Dates</span>
                </div>
                <div className="overflow-auto flex-1">
                    <table className="min-w-full text-xs text-left">
                        <thead className="bg-gray-100 border-b fos-grid-thead text-gray-700 sticky top-0">
                            <tr><th className="p-1.5">Date</th><th className="p-1.5 text-right">Count</th></tr>
                        </thead>
                        <tbody className="fos-grid-tbody divide-y divide-gray-100">
                            {loadingDates && <tr><td colSpan={2} className="p-4 text-center text-gray-400">Loading...</td></tr>}
                            {(dateRows as any[]).map((d: any, i: number) => (
                                <tr key={i} onClick={() => { setSelDate(d); setSelCancel(null); }}
                                    className={cn("cursor-pointer", selDate?.canceldate === d.canceldate ? "!bg-blue-100 ring-2 ring-inset ring-blue-300" : "hover:bg-blue-50")}>
                                    <td className="p-1.5 whitespace-nowrap">{t(d.cancel_date)?.split("T")[0]}</td>
                                    <td className="p-1.5 text-right">{d.records}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Right: cancellations */}
            <div className="flex-1 flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="h-8 bg-[#374151] flex items-center justify-between px-3 shrink-0">
                    <span className="text-white text-[10px] font-black uppercase tracking-widest">Purchase Cancellations by Date</span>
                    {!loadingCancel && selDate && <span className="text-gray-400 text-[10px]">{(cancelRows as any[]).length} records</span>}
                </div>
                <div className="overflow-auto flex-1">
                    <table className="min-w-full text-xs text-left">
                        <thead className="bg-gray-100 border-b fos-grid-thead text-gray-700 sticky top-0">
                            <tr>{["Customer","PBook No","C/POrder","PB Date","Whouse Date","Description","Qty Order","Cancel Boxes","Unit Price","Grower","Reason","Notes","Transfer"].map(h => (
                                <th key={h} className="p-1.5 border-r border-gray-200 last:border-r-0 whitespace-nowrap">{h}</th>
                            ))}</tr>
                        </thead>
                        <tbody className="fos-grid-tbody divide-y divide-gray-100">
                            {!selDate && <tr><td colSpan={13} className="p-6 text-center text-gray-400">Select a date on the left.</td></tr>}
                            {selDate && loadingCancel && <tr><td colSpan={13} className="p-6 text-center text-gray-400">Loading...</td></tr>}
                            {selDate && !loadingCancel && (cancelRows as any[]).length === 0 && <tr><td colSpan={13} className="p-6 text-center text-gray-400">No cancellations for this date.</td></tr>}
                            {(cancelRows as any[]).map((row: any, i: number) => (
                                <tr key={row.unico ?? i} onClick={() => setSelCancel(row)}
                                    className={cn("cursor-pointer transition-colors", selCancel?.unico === row.unico ? "!bg-blue-100 ring-2 ring-inset ring-blue-300" : "hover:bg-blue-50")}>
                                    <td className="p-1.5 whitespace-nowrap">{t(row.customer)}</td>
                                    <td className="p-1.5 whitespace-nowrap">{t(row.pbook_no)}</td>
                                    <td className="p-1.5 whitespace-nowrap">{t(row.cporder_no)}</td>
                                    <td className="p-1.5 whitespace-nowrap">{t(row.pb_date)?.split("T")[0]}</td>
                                    <td className="p-1.5 whitespace-nowrap">{t(row.whouse_date)?.split("T")[0]}</td>
                                    <td className="p-1.5 max-w-[140px] truncate">{t(row.description)}</td>
                                    <td className="p-1.5 text-right">{row.qty_order}</td>
                                    <td className="p-1.5 text-right">{row.cancel_boxes}</td>
                                    <td className="p-1.5 text-right">{fmt(row.unit_price)}</td>
                                    <td className="p-1.5 whitespace-nowrap">{t(row.grower)}</td>
                                    <td className="p-1.5 whitespace-nowrap">{t(row.reason)}</td>
                                    <td className="p-1.5 max-w-[100px] truncate">{t(row.notes)}</td>
                                    <td className="p-1.5">{row.transfer ? "✓" : ""}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
