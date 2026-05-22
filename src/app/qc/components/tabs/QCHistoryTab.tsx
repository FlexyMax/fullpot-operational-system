"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, Download, Menu, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQCContext } from "../../context/QCContext";

const t = (v: any) => String(v ?? "").trim();
const fmtDate = (v: any) => {
    if (!v) return "";
    const d = new Date(v);
    return isNaN(d.getTime()) ? t(v).split("T")[0] : d.toISOString().split("T")[0];
};
const fmtUSD = (v: any) => v != null && v !== "" ? `$ ${Number(v).toFixed(2)}` : "";

const qcPost = (url: string, body: any) =>
    fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        .then(r => r.json());

const toastConfirm = (msg: string, fn: () => void) =>
    toast(msg, { duration: 10000, action: { label: "Confirm", onClick: fn }, cancel: { label: "Cancel", onClick: () => {} } });

const DATE_PAGE = 20;

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
                className="bg-[#FB7506] hover:bg-orange-500 text-white px-6 h-full flex items-center justify-center transition-colors shrink-0">
                <Menu size={16}/>
            </button>
            {mounted && open && createPortal(
                <div style={{ position: "fixed", top: pos.top, right: pos.right, zIndex: 9999 }}
                    className="w-48 bg-white border border-gray-200 shadow-xl rounded-lg py-1 text-[11px]">
                    <button disabled={!hasSelection || !canEdit}
                        onClick={() => { onEdit?.(); setOpen(false); }}
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 font-semibold text-[#FB7506]">
                        <Pencil size={13}/> Edit QCCredit
                    </button>
                    <button disabled={!hasSelection || !canDelete}
                        onClick={() => { onDelete?.(); setOpen(false); }}
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 font-semibold text-red-500">
                        <Trash2 size={13}/> Delete QC Credit
                    </button>
                </div>,
                document.body
            )}
        </>
    );
}

export default function QCHistoryTab() {
    const { canEdit, canDelete } = useQCContext();

    const [selDate,   setSelDate]   = useState<any>(null);
    const [selRow,    setSelRow]    = useState<any>(null);
    const [datePage,  setDatePage]  = useState(1);

    const { data: dateRows = [], isFetching: loadingDates, refetch: refetchDates } = useQuery({
        queryKey: ["qc-history-dates"],
        queryFn:  () => qcPost("/api/qc/history/dates", { dateFilter: 1 }),
        staleTime: 0,
        select:   (d: any) => d.data ?? [],
    });

    const { data: historyRows = [], isFetching: loadingHistory } = useQuery({
        queryKey: ["qc-history-list", selDate?.crdate],
        queryFn:  () => qcPost("/api/qc/history/list", { dateFilter: 1, crDate: selDate.crdate, growerUq: "%" }),
        enabled:  !!selDate?.crdate,
        staleTime: 0,
        select:   (d: any) => d.data ?? [],
    });

    const totalDatePages = Math.max(1, Math.ceil((dateRows as any[]).length / DATE_PAGE));
    const pagedDates     = (dateRows as any[]).slice((datePage - 1) * DATE_PAGE, datePage * DATE_PAGE);

    const handleDelete = () => {
        if (!selRow) return;
        toastConfirm("Delete this QC credit?", async () => {
            const d = await qcPost("/api/qc/credits/delete", { unico: selRow.unico });
            if (!d.success) { toast.error(d.error || "Error"); return; }
            toast.success("QC credit deleted.");
            setSelRow(null);
        });
    };

    return (
        <div className="flex flex-col h-full gap-1.5">

            {/* ── Top header row ─────────────────────────────── */}
            <div className="flex items-stretch bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden shrink-0 h-9">
                <div className="bg-[#374151] flex items-center px-3 flex-1">
                    <span className="text-white text-[10px] font-black uppercase tracking-widest">QC Stock Search</span>
                </div>
                <button onClick={() => refetchDates()} className="px-3 border-l border-gray-200 text-green-500 hover:text-green-600 shrink-0">
                    <RefreshCw size={14} className={loadingDates ? "animate-spin" : ""}/>
                </button>
                <ActionMenu
                    onEdit={() => toast.info("Open edit modal for: " + selRow?.unico)}
                    onDelete={handleDelete}
                    hasSelection={!!selRow}
                    canEdit={canEdit} canDelete={canDelete}
                />
            </div>

            {/* ── Content: left dates + right credits ────────── */}
            <div className="flex gap-2 flex-1 min-h-0">

                {/* Left: date panel */}
                <div className="w-52 flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden shrink-0">
                    {/* Pagination */}
                    <div className="h-8 border-b border-gray-200 flex items-center justify-between px-2 bg-gray-50 text-[10px] text-gray-500 shrink-0">
                        <button onClick={() => setDatePage(p => Math.max(1, p - 1))} disabled={datePage <= 1} className="p-0.5 rounded hover:bg-gray-200 disabled:opacity-30">‹</button>
                        <span>Page <b>{datePage}</b> of {totalDatePages}</span>
                        <button onClick={() => setDatePage(p => Math.min(totalDatePages, p + 1))} disabled={datePage >= totalDatePages} className="p-0.5 rounded hover:bg-gray-200 disabled:opacity-30">›</button>
                    </div>

                    <div className="overflow-auto flex-1">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-white border-b sticky top-0">
                                <tr className="fos-grid-thead text-gray-700">
                                    <th className="p-2 font-bold">QC Date</th>
                                    <th className="p-2 font-bold text-right">Credits</th>
                                </tr>
                            </thead>
                            <tbody className="fos-grid-tbody divide-y divide-gray-100">
                                {loadingDates && <tr><td colSpan={2} className="p-4 text-center text-gray-400">Loading...</td></tr>}
                                {pagedDates.map((d: any, i: number) => (
                                    <tr key={i} onClick={() => { setSelDate(d); setSelRow(null); }}
                                        className={cn("cursor-pointer transition-colors",
                                            selDate?.crdate === d.crdate ? "bg-gray-200 font-bold" : "hover:bg-gray-50")}>
                                        <td className="p-2 whitespace-nowrap">{fmtDate(d.crdate)}</td>
                                        <td className="p-2 text-right">{d.records}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right: history grid */}
                <div className="flex flex-col flex-1 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    {/* Toolbar */}
                    <div className="h-9 border-b border-gray-200 flex items-center px-3 gap-4 shrink-0 bg-white justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-gray-400">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                            <input placeholder="Search..." className="outline-none text-[11px] w-40 text-black placeholder-gray-400"/>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-gray-500">
                            <button className="flex items-center gap-1 hover:text-black font-semibold"><Download size={11}/> Download</button>
                            {!loadingHistory && selDate && <span>{(historyRows as any[]).length} Records</span>}
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="overflow-auto flex-1">
                        <table className="min-w-full text-xs text-left">
                            <thead className="bg-white border-b sticky top-0 z-10 fos-grid-thead text-gray-700">
                                <tr>{["QC Date","Invoice Date","QC Boxes","QC Units","Qc Amount","Reason","Notes","Lot","AWBcode","Description","Box Qty"].map(h => (
                                    <th key={h} className="p-2 border-r border-gray-100 last:border-r-0 whitespace-nowrap font-bold">{h}</th>
                                ))}</tr>
                            </thead>
                            <tbody className="fos-grid-tbody divide-y divide-gray-100">
                                {!selDate && <tr><td colSpan={11} className="p-6 text-center text-gray-400">Select a date on the left.</td></tr>}
                                {selDate && loadingHistory && <tr><td colSpan={11} className="p-6 text-center text-gray-400">Loading...</td></tr>}
                                {selDate && !loadingHistory && (historyRows as any[]).length === 0 && <tr><td colSpan={11} className="p-6 text-center text-gray-400">No QC records for this date.</td></tr>}
                                {(historyRows as any[]).map((row: any, i: number) => (
                                    <tr key={row.unico ?? i} onClick={() => setSelRow(row)}
                                        className={cn("cursor-pointer transition-colors", selRow?.unico === row.unico ? "!bg-blue-50 ring-1 ring-inset ring-blue-300" : "hover:bg-gray-50")}>
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
