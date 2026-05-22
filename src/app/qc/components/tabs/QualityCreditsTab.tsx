"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Download, Menu, Plus, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQCContext } from "../../context/QCContext";

const t = (v: any) => String(v ?? "").trim();
const fmtDate = (v: any) => {
    if (!v) return "";
    const d = new Date(v);
    return isNaN(d.getTime()) ? t(v).split("T")[0] : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};
const fmtUSD = (v: any) => v != null && v !== "" ? `$ ${Number(v).toFixed(2)}` : "";

const qcPost = (url: string, body: any) =>
    fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        .then(r => r.json());

const toastConfirm = (msg: string, fn: () => void) =>
    toast(msg, { duration: 10000, action: { label: "Confirm", onClick: fn }, cancel: { label: "Cancel", onClick: () => {} } });

function colorNum(val: any, color: string) {
    const n = Number(val ?? 0);
    if (!n) return <span className="text-gray-400">0</span>;
    return <span className={color + " font-bold"}>{n}</span>;
}

const PAGE = 10;

// ── Action Menu ───────────────────────────────────────────────────────────────
function ActionMenu({ onAdd, onEdit, onDelete, hasSelection, canCreate, canEdit, canDelete }: any) {
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
    const items = [
        { label: "Add QC Credit",    icon: Plus,   color: "text-green-600",  onClick: onAdd,    disabled: !canCreate },
        { label: "Edit QC Credit",   icon: Pencil, color: "text-[#FB7506]",  onClick: onEdit,   disabled: !hasSelection || !canEdit },
        { label: "Delete QC Credit", icon: Trash2, color: "text-red-500",    onClick: onDelete, disabled: !hasSelection || !canDelete },
    ];
    return (
        <>
            <button ref={btnRef} onClick={toggle}
                className="h-full bg-[#FB7506] hover:bg-orange-500 text-white px-6 flex items-center justify-center shrink-0 transition-colors">
                <Menu size={16}/>
            </button>
            {mounted && open && createPortal(
                <div style={{ position: "fixed", top: pos.top, right: pos.right, zIndex: 9999 }}
                    className="w-52 bg-white border border-gray-200 shadow-xl rounded-lg py-1 text-[11px]">
                    {items.map((item, i) => (
                        <button key={i} disabled={item.disabled}
                            onClick={() => { item.onClick?.(); setOpen(false); }}
                            className={cn("w-full text-left px-4 py-2.5 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 font-semibold", item.color)}>
                            <item.icon size={14}/>{item.label}
                        </button>
                    ))}
                </div>,
                document.body
            )}
        </>
    );
}

interface Props {
    onAddQC?:  (row: any) => void;
    onEditQC?: (row: any, credit: any) => void;
}

export default function QualityCreditsTab({ onAddQC, onEditQC }: Props) {
    const qc = useQueryClient();
    const { canCreate, canEdit, canDelete, setLcPackBoxID, setLcQCID, refreshTrigger, triggerRefresh } = useQCContext();

    const [search,     setSearch]    = useState("");
    const [searchKey,  setSearchKey] = useState(0);
    const [page,       setPage]      = useState(1);
    const [selRow,     setSelRow]    = useState<any>(null);
    const [selCredit,  setSelCredit] = useState<any>(null);

    // QC inventory search
    const { data: qcResp, isFetching: loadingSearch } = useQuery({
        queryKey: ["qc-credits-search", searchKey, search],
        queryFn:  () => qcPost("/api/qc/credits/search", { search: search || "%" }),
        enabled:  searchKey > 0,
        staleTime: 0,
        select:   (d: any) => d,
    });
    const allRows  = (qcResp as any)?.data ?? [];
    const total    = allRows.length;
    const totPages = Math.max(1, Math.ceil(total / PAGE));
    const rows     = allRows.slice((page - 1) * PAGE, page * PAGE);

    // Credits by lot
    const { data: creditRows = [], isFetching: loadingCredits } = useQuery({
        queryKey: ["qc-credits-by-box", selRow?.unico, refreshTrigger],
        queryFn:  () => qcPost("/api/qc/credits/by-box", { pkboxUq: selRow.unico }),
        enabled:  !!selRow?.unico,
        staleTime: 0,
        select:   (d: any) => d.data ?? [],
    });

    const deleteCredit = useMutation({
        mutationFn: (unico: string) => qcPost("/api/qc/credits/delete", { unico }),
        onSuccess: (d) => {
            if (!d.success) { toast.error(d.error || "Error"); return; }
            toast.success("QC credit deleted.");
            triggerRefresh();
            qc.invalidateQueries({ queryKey: ["qc-credits-by-box", selRow?.unico] });
            setSelCredit(null);
        },
    });

    const handleSelectRow = (row: any) => {
        setSelRow(row);
        setLcPackBoxID(row.unico);
        setSelCredit(null);
    };

    return (
        <div className="flex flex-col h-full gap-1.5">

            {/* ── Top header ─────────────────────────────────── */}
            <div className="flex items-stretch bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden shrink-0">
                <div className="h-9 bg-[#374151] flex items-center px-3 flex-1">
                    <span className="text-white text-[10px] font-black uppercase tracking-widest">QC Stock Search</span>
                </div>
                <input value={search} onChange={e => setSearch(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && (setPage(1), setSearchKey(k => k + 1))}
                    placeholder="Search" className="px-3 text-[11px] outline-none border-l border-gray-200 flex-1 max-w-xs"/>
                <button onClick={() => { setPage(1); setSearchKey(k => k + 1); }}
                    className="px-3 text-green-500 hover:text-green-600 border-l border-gray-200 shrink-0">
                    <RefreshCw size={14} className={loadingSearch ? "animate-spin" : ""}/>
                </button>
            </div>

            {/* ── Main QC inventory grid ──────────────────────── */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col overflow-hidden flex-[3] min-h-0">
                {/* Toolbar */}
                <div className="h-9 border-b border-gray-200 flex items-center px-3 gap-4 shrink-0 bg-white justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-gray-400">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        <input placeholder="Search..." className="outline-none text-[11px] w-32 text-black placeholder-gray-400"/>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-gray-500">
                        <button className="flex items-center gap-1 hover:text-black font-semibold"><Download size={11}/> Download</button>
                        {!loadingSearch && searchKey > 0 && <span>{total.toLocaleString()} Records</span>}
                        {totPages > 1 && (
                            <div className="flex items-center gap-1">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="p-0.5 rounded hover:bg-gray-100 disabled:opacity-30">‹</button>
                                <span>Page <b>{page}</b> of {totPages}</span>
                                <button onClick={() => setPage(p => Math.min(totPages, p + 1))} disabled={page >= totPages} className="p-0.5 rounded hover:bg-gray-100 disabled:opacity-30">›</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Grid */}
                <div className="overflow-auto flex-1">
                    <table className="min-w-full text-xs text-left">
                        <thead className="bg-white border-b sticky top-0 z-10 fos-grid-thead text-gray-700">
                            <tr>
                                {["Description","Grower","Lot","Box Qty","Qty Transit","Qty Sold","Qty Adjust","Stock","Invoice Date","AvailableDate","AWBcode","Flo. U. Cost","Land. Cost x U","Total Cost x U","UnitsBo"].map(h => (
                                    <th key={h} className="p-2 border-r border-gray-100 last:border-r-0 whitespace-nowrap font-bold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="fos-grid-tbody divide-y divide-gray-100">
                            {searchKey === 0 && <tr><td colSpan={15} className="p-8 text-center text-gray-400">Enter a search term and press Enter or click the refresh button.</td></tr>}
                            {searchKey > 0 && loadingSearch && <tr><td colSpan={15} className="p-6 text-center text-gray-400">Loading...</td></tr>}
                            {searchKey > 0 && !loadingSearch && rows.length === 0 && <tr><td colSpan={15} className="p-6 text-center text-gray-400">No results.</td></tr>}
                            {(rows as any[]).map((row: any) => (
                                <tr key={row.unico} onClick={() => handleSelectRow(row)}
                                    className={cn("cursor-pointer transition-colors", selRow?.unico === row.unico ? "!bg-blue-50 ring-1 ring-inset ring-blue-300" : "hover:bg-gray-50")}>
                                    <td className="p-2 max-w-[200px] truncate font-medium">{t(row.description)}</td>
                                    <td className="p-2 whitespace-nowrap truncate max-w-[130px]">{t(row.grower)}</td>
                                    <td className="p-2 text-right">{row.lote}</td>
                                    <td className="p-2 text-right">{colorNum(row.box_qty, "text-orange-500")}</td>
                                    <td className="p-2 text-right">{colorNum(row.qty_transit, "text-orange-500")}</td>
                                    <td className="p-2 text-right">{colorNum(row.qty_sale, "text-orange-500")}</td>
                                    <td className="p-2 text-right">{colorNum(row.qty_adj, "text-purple-500")}</td>
                                    <td className="p-2 text-right">{colorNum(row.stock, "text-green-500")}</td>
                                    <td className="p-2 whitespace-nowrap">{fmtDate(row.InvoiceDate)}</td>
                                    <td className="p-2 whitespace-nowrap">{fmtDate(row.AvailableDate)}</td>
                                    <td className="p-2 font-mono whitespace-nowrap">{t(row.awbcode)}</td>
                                    <td className="p-2 text-right text-orange-500 font-bold">{fmtUSD(row.flower_cost || row.f_cost_x_u)}</td>
                                    <td className="p-2 text-right text-green-600 font-bold">{fmtUSD(row.c_cost_x_u)}</td>
                                    <td className="p-2 text-right text-blue-600 font-bold">{fmtUSD(row.t_cost_x_u)}</td>
                                    <td className="p-2 text-right">{row.tunits_x_box}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Quality Credits by Lot ──────────────────────── */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col overflow-hidden flex-[2] min-h-0">
                {/* Header + action menu */}
                <div className="flex items-stretch shrink-0 h-9">
                    <div className="bg-[#374151] flex items-center px-3 flex-1">
                        <span className="text-white text-[10px] font-black uppercase tracking-widest">Quality Credits by Lot</span>
                    </div>
                    <ActionMenu
                        onAdd={() => { if (!selRow) { toast.error("Select a lot first."); return; } onAddQC?.(selRow); }}
                        onEdit={() => { if (!selCredit) { toast.error("Select a QC credit from the grid below first."); return; } onEditQC?.(selRow, selCredit); }}
                        onDelete={() => { if (!selCredit) { toast.error("Select a QC credit from the grid below first."); return; } toastConfirm("Delete this QC credit?", () => deleteCredit.mutate(selCredit.unico)); }}
                        hasSelection={!!selCredit}
                        canCreate={canCreate} canEdit={canEdit} canDelete={canDelete}
                    />
                </div>

                {/* Toolbar */}
                <div className="h-9 border-b border-gray-200 flex items-center px-3 gap-4 shrink-0 bg-white justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-gray-400">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        <input placeholder="Search..." className="outline-none text-[11px] w-32 text-black placeholder-gray-400"/>
                    </div>
                    <button className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-black font-semibold"><Download size={11}/> Download</button>
                </div>

                {/* Credits grid */}
                <div className="overflow-auto flex-1">
                    <table className="min-w-full text-xs text-left">
                        <thead className="bg-white border-b sticky top-0 z-10 fos-grid-thead text-gray-700">
                            <tr>{["QC Date","QC Boxes","QC Amount","Reason","Notes","QC Units","Apply Vendor","Apply Freight","Apply Labor","Apply Replace"].map(h => (
                                <th key={h} className="p-2 border-r border-gray-100 last:border-r-0 whitespace-nowrap font-bold">{h}</th>
                            ))}</tr>
                        </thead>
                        <tbody className="fos-grid-tbody divide-y divide-gray-100">
                            {!selRow && <tr><td colSpan={10} className="p-6 text-center text-gray-400">Select a lot from the grid above.</td></tr>}
                            {selRow && loadingCredits && <tr><td colSpan={10} className="p-4 text-center text-gray-400">Loading...</td></tr>}
                            {selRow && !loadingCredits && (creditRows as any[]).length === 0 && <tr><td colSpan={10} className="p-4 text-center text-gray-400">No QC credits for this lot.</td></tr>}
                            {(creditRows as any[]).map((row: any) => (
                                <tr key={row.unico} onClick={() => { setSelCredit(row); setLcQCID(row.unico); }}
                                    className={cn("cursor-pointer transition-colors", selCredit?.unico === row.unico ? "!bg-blue-50 ring-1 ring-inset ring-blue-300" : "hover:bg-gray-50")}>
                                    <td className="p-2 whitespace-nowrap">{fmtDate(row.cr_date)}</td>
                                    <td className="p-2 text-right">{colorNum(row.cr_boxes, "text-orange-500")}</td>
                                    <td className="p-2 text-right font-bold text-orange-500">{fmtUSD(row.cr_amount)}</td>
                                    <td className="p-2 font-bold text-green-600 whitespace-nowrap">{t(row.reason)}</td>
                                    <td className="p-2 text-blue-500 max-w-[180px] truncate">{t(row.notes)}</td>
                                    <td className="p-2 text-right">{row.cr_units}</td>
                                    <td className="p-2">{row.apply_farm ? "Yes" : "No"}</td>
                                    <td className="p-2">{row.apply_freight ? "Yes" : "No"}</td>
                                    <td className="p-2">{row.apply_labor ? "Yes" : "No"}</td>
                                    <td className="p-2">{row.apply_replacement ? "Yes" : "No"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
