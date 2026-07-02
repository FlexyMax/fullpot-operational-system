"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Download, Plus, Pencil, Trash2, Search, Award, AlignJustify } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQCContext } from "../../context/QCContext";
const EMPTY_ARR: any[] = [];

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

const STEP = 25;

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
                className={cn("h-full w-10 flex items-center justify-center hover:bg-gray-100 shrink-0 transition-colors", open ? "flex-row gap-[5px]" : "flex-col gap-[5px]")}>
                {open ? (
                    <><span className="block h-5 w-[2px] bg-[#FB7506] rounded-full"/><span className="block h-5 w-[2px] bg-[#FB7506] rounded-full"/><span className="block h-5 w-[2px] bg-[#FB7506] rounded-full"/></>
                ) : (
                    <><span className="block w-5 h-[2px] bg-[#FB7506] rounded-full"/><span className="block w-5 h-[2px] bg-[#FB7506] rounded-full"/><span className="block w-5 h-[2px] bg-[#FB7506] rounded-full"/></>
                )}
            </button>
            {mounted && open && createPortal(
                <div style={{ position: "fixed", top: pos.top, right: pos.right, zIndex: 100, minWidth: 220 }}
                    className="bg-white border border-gray-200 shadow-xl rounded-sm py-1 overflow-hidden">
                    {items.map((item, i) => (
                        <button key={i} disabled={item.disabled}
                            onClick={() => { item.onClick?.(); setOpen(false); }}
                            className={cn("w-full text-left px-4 py-2.5 text-[14px] font-semibold uppercase hover:bg-[#FB7506]/10 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-3", item.color)}>
                            <item.icon size={16}/>{item.label}
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

    const [search,       setSearch]       = useState("");
    const [searchKey,    setSearchKey]    = useState(1); // starts at 1 → auto-runs on mount
    const [visibleCount, setVisibleCount] = useState(STEP);
    const [selRow,       setSelRow]       = useState<any>(null);
    const [selCredit,    setSelCredit]    = useState<any>(null);

    const sentinelRef = useRef<HTMLDivElement>(null);

    // QC inventory search — runs immediately on mount (searchKey starts at 1)
    const { data: qcResp, isFetching: loadingSearch } = useQuery({
        queryKey: ["qc-credits-search", searchKey, search],
        queryFn:  () => qcPost("/api/qc/credits/search", { search: search || "%" }),
        staleTime: 0,
        select:   (d: any) => d,
    });
    const allRows = (qcResp as any)?.data ?? [];
    const rows    = allRows.slice(0, visibleCount);
    const hasMore = visibleCount < allRows.length;

    // Reset visible when data changes
    useEffect(() => { setVisibleCount(STEP); }, [searchKey, search]);

    // Infinite scroll for search results
    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;
        const obs = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore)
                setVisibleCount(v => Math.min(v + STEP, allRows.length));
        }, { rootMargin: "150px" });
        obs.observe(el);
        return () => obs.disconnect();
    }, [hasMore, allRows.length]);

    // Credits by lot
    const { data: creditRows = EMPTY_ARR, isFetching: loadingCredits } = useQuery({
        queryKey: ["qc-credits-by-box", selRow?.unico, refreshTrigger],
        queryFn:  () => qcPost("/api/qc/credits/by-box", { pkboxUq: selRow.unico }),
        enabled:  !!selRow?.unico,
        staleTime: 0,
        select:   (d: any) => d.data ?? [],
    });

    useEffect(() => {
        const list = creditRows as any[];
        if (list.length > 0) {
            setSelCredit(list[0]);
            setLcQCID(list[0].unico);
        } else {
            setSelCredit(null);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selRow?.unico, (creditRows as any[]).length]);

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

            {/* ── Top search bar ──────────────────────────────── */}
            <div className="flex items-stretch bg-white rounded-lg border border-[#DBD9D9] shadow-sm overflow-hidden shrink-0">
                <div className="h-9 bg-white flex items-center gap-2 px-3 flex-1">
                    <Search size={14} className="text-[#FB7506] shrink-0"/>
                    <span className="text-[#4F4F4F] text-[14px] font-bold uppercase tracking-tight truncate">QC Stock Search</span>
                </div>
                <input value={search} onChange={e => setSearch(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && (setVisibleCount(STEP), setSearchKey(k => k + 1))}
                    placeholder="Search" className="px-3 text-[11px] outline-none border-l border-[#DBD9D9] flex-1 max-w-xs"/>
                <button onClick={() => { setVisibleCount(STEP); setSearchKey(k => k + 1); }}
                    className="px-3 text-green-500 hover:text-green-600 border-l border-[#DBD9D9] shrink-0">
                    <RefreshCw size={14} className={loadingSearch ? "animate-spin" : ""}/>
                </button>
            </div>

            {/* ── Main QC inventory grid ──────────────────────── */}
            <div className="bg-white rounded-lg border border-[#DBD9D9] shadow-sm flex flex-col overflow-hidden flex-[3] min-h-0">
                {/* Grid header */}
                <div className="h-9 border-b border-[#DBD9D9] flex items-center px-3 shrink-0 bg-white">
                    <Search size={13} className="text-[#FB7506] shrink-0 mr-2"/>
                    <span className="text-[#4F4F4F] text-[13px] font-bold uppercase tracking-tight truncate flex-1">QC Stock Results</span>
                    {!loadingSearch && allRows.length > 0 && (
                        <span className="bg-[#FB7506]/10 text-[#FB7506] text-[10px] font-bold rounded-full px-2 py-0.5 whitespace-nowrap mr-2">
                            {rows.length.toLocaleString()} / {allRows.length.toLocaleString()}
                        </span>
                    )}
                    <button title="Download" className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                        <Download size={13}/>
                    </button>
                    <button title="Log" className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-[#FB7506] transition-colors">
                        <AlignJustify size={13}/>
                    </button>
                    <button onClick={() => { setVisibleCount(STEP); setSearchKey(k => k + 1); }} title="Refresh"
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-[#FB7506] transition-colors">
                        <RefreshCw size={13} className={loadingSearch ? "animate-spin" : ""}/>
                    </button>
                </div>

                {/* Grid with infinite scroll */}
                <div className="overflow-auto flex-1">
                    <table className="min-w-full text-xs text-left">
                        <thead className="bg-[#4F4F4F] border-b border-[#DBD9D9] text-white text-[11px] font-bold uppercase sticky top-0 z-10">
                            <tr className="divide-x divide-[#DBD9D9]/30">
                                {["Description","Grower","Lot","Box Qty","Qty Transit","Qty Sold","Qty Adjust","Stock","Invoice Date","AvailableDate","AWBcode","Flo. U. Cost","Land. Cost x U","Total Cost x U","UnitsBo"].map(h => (
                                    <th key={h} className="p-2 whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="fos-grid-tbody divide-y divide-[#DBD9D9]">
                            {loadingSearch && rows.length === 0 && <tr><td colSpan={15} className="p-6 text-center text-gray-400">Loading...</td></tr>}
                            {!loadingSearch && allRows.length === 0 && <tr><td colSpan={15} className="p-6 text-center text-gray-400">No results.</td></tr>}
                            {(rows as any[]).map((row: any) => (
                                <tr key={row.unico} onClick={() => handleSelectRow(row)}
                                    className={cn("cursor-pointer transition-colors divide-x divide-[#DBD9D9]", selRow?.unico === row.unico ? "!bg-[#FB7506]/10" : "hover:bg-gray-50")}>
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
                    {/* Infinite scroll sentinel */}
                    <div ref={sentinelRef} className="h-4 flex items-center justify-center py-2 text-[10px] text-gray-400">
                        {hasMore && !loadingSearch && "Loading more..."}
                    </div>
                </div>
            </div>

            {/* ── Quality Credits by Lot ──────────────────────── */}
            <div className="bg-white rounded-lg border border-[#DBD9D9] shadow-sm flex flex-col overflow-hidden flex-[2] min-h-0">
                <div className="flex items-stretch shrink-0 h-9 border-b border-[#DBD9D9]">
                    <div className="bg-white flex items-center gap-2 px-3 flex-1">
                        <Award size={14} className="text-[#FB7506] shrink-0"/>
                        <span className="text-[#4F4F4F] text-[14px] font-bold uppercase tracking-tight truncate">Quality Credits by Lot</span>
                    </div>
                    <ActionMenu
                        onAdd={() => { if (!selRow) { toast.error("Select a lot first."); return; } onAddQC?.(selRow); }}
                        onEdit={() => { if (!selCredit) { toast.error("Select a QC credit from the grid below first."); return; } onEditQC?.(selRow, selCredit); }}
                        onDelete={() => { if (!selCredit) { toast.error("Select a QC credit from the grid below first."); return; } toastConfirm("Delete this QC credit?", () => deleteCredit.mutate(selCredit.unico)); }}
                        hasSelection={!!selCredit}
                        canCreate={canCreate} canEdit={canEdit} canDelete={canDelete}
                    />
                </div>

                <div className="h-9 border-b border-[#DBD9D9] flex items-center px-3 shrink-0 bg-white">
                    {(creditRows as any[]).length > 0 && (
                        <span className="bg-[#FB7506]/10 text-[#FB7506] text-[10px] font-bold rounded-full px-2 py-0.5 whitespace-nowrap mr-2">
                            {(creditRows as any[]).length}
                        </span>
                    )}
                    <span className="flex-1"/>
                    <button title="Download" className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                        <Download size={13}/>
                    </button>
                    <button title="Log" className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-[#FB7506] transition-colors">
                        <AlignJustify size={13}/>
                    </button>
                </div>

                <div className="overflow-auto flex-1">
                    <table className="min-w-full text-xs text-left">
                        <thead className="bg-[#4F4F4F] border-b border-[#DBD9D9] text-white text-[11px] font-bold uppercase sticky top-0 z-10">
                            <tr className="divide-x divide-[#DBD9D9]/30">{["","QC Date","QC Boxes","QC Amount","Reason","Notes","QC Units","Apply Vendor","Apply Freight","Apply Labor","Apply Replace"].map(h => (
                                <th key={h} className="p-2 whitespace-nowrap">{h}</th>
                            ))}</tr>
                        </thead>
                        <tbody className="fos-grid-tbody divide-y divide-[#DBD9D9]">
                            {!selRow && <tr><td colSpan={11} className="p-6 text-center text-gray-400">Select a lot from the grid above.</td></tr>}
                            {selRow && loadingCredits && <tr><td colSpan={11} className="p-4 text-center text-gray-400">Loading...</td></tr>}
                            {selRow && !loadingCredits && (creditRows as any[]).length === 0 && <tr><td colSpan={11} className="p-4 text-center text-gray-400">No QC credits for this lot.</td></tr>}
                            {(creditRows as any[]).map((row: any) => (
                                <tr key={row.unico} onClick={() => { setSelCredit(row); setLcQCID(row.unico); }}
                                    className={cn("cursor-pointer transition-colors divide-x divide-[#DBD9D9]", selCredit?.unico === row.unico ? "!bg-[#FB7506]/10" : "hover:bg-gray-50")}>
                                    <td className="p-1" onClick={e => e.stopPropagation()}>
                                        <div className="flex gap-1">
                                            {canEdit && (
                                                <button onClick={() => { setSelCredit(row); setLcQCID(row.unico); onEditQC?.(selRow, row); }}
                                                    className="text-[#FB7506] hover:text-orange-700" title="Edit QC Credit">
                                                    <Pencil size={12}/>
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button onClick={() => toastConfirm("Delete this QC credit?", () => deleteCredit.mutate(row.unico))}
                                                    className="text-red-500 hover:text-red-700" title="Delete QC Credit">
                                                    <Trash2 size={12}/>
                                                </button>
                                            )}
                                        </div>
                                    </td>
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
