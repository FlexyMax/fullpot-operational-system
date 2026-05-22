"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Pencil, Trash2, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQCContext } from "../../context/QCContext";

const t   = (v: any) => String(v ?? "").trim();
const fmt = (v: any) => parseFloat(v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const qcPost = (url: string, body: any) =>
    fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        .then(r => r.json());

const toastConfirm = (msg: string, onConfirm: () => void) =>
    toast(msg, { duration: 10000, action: { label: "Confirm", onClick: onConfirm }, cancel: { label: "Cancel", onClick: () => {} } });

interface Props {
    onAddQC?:  (row: any) => void;
    onEditQC?: (row: any, credit: any) => void;
}

export default function QualityCreditsTab({ onAddQC, onEditQC }: Props) {
    const qc = useQueryClient();
    const { canCreate, canEdit, canDelete, setLcPackBoxID, setLcQCID, refreshTrigger, triggerRefresh } = useQCContext();

    const [search,     setSearch]    = useState("");
    const [searchKey,  setSearchKey] = useState(0);
    const [selRow,     setSelRow]    = useState<any>(null);
    const [selCredit,  setSelCredit] = useState<any>(null);

    // Left: inventory QC search
    const { data: qcRows = [], isFetching: loadingSearch } = useQuery({
        queryKey: ["qc-inventory-search", searchKey, search],
        queryFn: () => qcPost("/api/qc/credits/search", { search: search || "%" }),
        enabled: searchKey > 0,
        staleTime: 0,
        select: (d: any) => d.data ?? [],
    });

    // Right: credits by selected lot
    const { data: creditRows = [], isFetching: loadingCredits } = useQuery({
        queryKey: ["qc-credits-by-box", selRow?.unico, refreshTrigger],
        queryFn: () => qcPost("/api/qc/credits/by-box", { pkboxUq: selRow.unico }),
        enabled: !!selRow?.unico,
        staleTime: 0,
        select: (d: any) => d.data ?? [],
    });

    const deleteCredit = useMutation({
        mutationFn: (unico: string) => qcPost("/api/qc/credits/delete", { unico }),
        onSuccess: (d) => {
            if (!d.success) { toast.error(d.error || "Error deleting QC credit."); return; }
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
        qc.invalidateQueries({ queryKey: ["qc-credits-by-box", row.unico] });
    };

    return (
        <div className="flex h-full gap-2">
            {/* ── Left: QC stock search ──────────────────────── */}
            <div className="flex-1 flex flex-col gap-2">
                {/* Search bar */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm px-3 py-2 flex items-center gap-2 shrink-0">
                    <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && setSearchKey(k => k + 1)}
                        placeholder="Description / AWB code..." className="fos-input py-1 flex-1"/>
                    <button onClick={() => setSearchKey(k => k + 1)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FB7506] hover:bg-orange-600 text-white text-xs font-black rounded">
                        {loadingSearch ? <RefreshCcw size={11} className="animate-spin"/> : <Search size={11}/>} QC Stock Search
                    </button>
                </div>

                {/* QC inventory grid */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col overflow-hidden flex-1">
                    <div className="h-8 bg-[#374151] flex items-center justify-between px-3 shrink-0">
                        <span className="text-white text-[10px] font-black uppercase tracking-widest">QC Stock</span>
                        <div className="flex items-center gap-2">
                            {!loadingSearch && searchKey > 0 && <span className="text-gray-400 text-[10px]">{(qcRows as any[]).length} records</span>}
                            {selRow && canCreate && (
                                <button onClick={() => onAddQC?.(selRow)}
                                    className="flex items-center gap-1 text-[10px] font-bold bg-green-600 hover:bg-green-700 text-white px-2 py-0.5 rounded">
                                    <Plus size={10}/> Add QC Credit
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="overflow-auto flex-1">
                        <table className="min-w-full text-xs text-left">
                            <thead className="bg-gray-100 border-b fos-grid-thead text-gray-700 sticky top-0">
                                <tr>{["Description","Grower","AWBCode","Lote","Invoice","Customer","Whouse","Box Qty","Stock","Total Units","Total Credits","F.Cost","C.Cost","T.Cost","Price"].map(h => (
                                    <th key={h} className="p-1.5 border-r border-gray-200 last:border-r-0 whitespace-nowrap">{h}</th>
                                ))}</tr>
                            </thead>
                            <tbody className="fos-grid-tbody divide-y divide-gray-100">
                                {searchKey === 0 && <tr><td colSpan={15} className="p-6 text-center text-gray-400">Search for a lot to manage QC credits.</td></tr>}
                                {searchKey > 0 && loadingSearch && <tr><td colSpan={15} className="p-6 text-center text-gray-400">Loading...</td></tr>}
                                {searchKey > 0 && !loadingSearch && (qcRows as any[]).length === 0 && <tr><td colSpan={15} className="p-6 text-center text-gray-400">No results.</td></tr>}
                                {(qcRows as any[]).map((row: any) => (
                                    <tr key={row.unico} onClick={() => handleSelectRow(row)}
                                        className={cn("cursor-pointer transition-colors", selRow?.unico === row.unico ? "!bg-blue-100 ring-2 ring-inset ring-blue-300" : "hover:bg-blue-50")}>
                                        <td className="p-1.5 max-w-[160px] truncate">{t(row.description)}</td>
                                        <td className="p-1.5 whitespace-nowrap">{t(row.grower)}</td>
                                        <td className="p-1.5 font-bold text-[#FB7506]">{t(row.awbcode)}</td>
                                        <td className="p-1.5 text-right">{row.lote}</td>
                                        <td className="p-1.5 whitespace-nowrap">{t(row.invoice_no)}</td>
                                        <td className="p-1.5 whitespace-nowrap">{t(row.customer)}</td>
                                        <td className="p-1.5 whitespace-nowrap">{t(row.whouse)}</td>
                                        <td className="p-1.5 text-right">{row.box_qty}</td>
                                        <td className="p-1.5 text-right font-bold">{row.stock}</td>
                                        <td className="p-1.5 text-right">{row.total_units}</td>
                                        <td className="p-1.5 text-right text-red-600 font-bold">{fmt(row.total_pcredits)}</td>
                                        <td className="p-1.5 text-right">{fmt(row.flower_cost)}</td>
                                        <td className="p-1.5 text-right">{fmt(row.c_cost_x_u)}</td>
                                        <td className="p-1.5 text-right">{fmt(row.t_cost_x_u)}</td>
                                        <td className="p-1.5 text-right">{fmt(row.price_x_u)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ── Right: credits by lot ──────────────────────── */}
            <div className="w-[420px] flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden shrink-0">
                <div className="h-8 bg-[#374151] flex items-center justify-between px-3 shrink-0">
                    <span className="text-white text-[10px] font-black uppercase tracking-widest">Quality Credits by Lot</span>
                    {!loadingCredits && selRow && <span className="text-gray-400 text-[10px]">{(creditRows as any[]).length} credits</span>}
                </div>
                <div className="overflow-auto flex-1">
                    <table className="min-w-full text-xs text-left">
                        <thead className="bg-gray-100 border-b fos-grid-thead text-gray-700 sticky top-0">
                            <tr>{["CR Date","CR Boxes","CR Units","CR Amount","Reason","Notes","Actions"].map(h => (
                                <th key={h} className="p-1.5 border-r border-gray-200 last:border-r-0 whitespace-nowrap">{h}</th>
                            ))}</tr>
                        </thead>
                        <tbody className="fos-grid-tbody divide-y divide-gray-100">
                            {!selRow && <tr><td colSpan={7} className="p-6 text-center text-gray-400">Select a lot on the left.</td></tr>}
                            {selRow && loadingCredits && <tr><td colSpan={7} className="p-6 text-center text-gray-400">Loading...</td></tr>}
                            {selRow && !loadingCredits && (creditRows as any[]).length === 0 && <tr><td colSpan={7} className="p-6 text-center text-gray-400">No QC credits for this lot.</td></tr>}
                            {(creditRows as any[]).map((row: any) => (
                                <tr key={row.unico} onClick={() => { setSelCredit(row); setLcQCID(row.unico); }}
                                    className={cn("cursor-pointer transition-colors", selCredit?.unico === row.unico ? "!bg-blue-100 ring-2 ring-inset ring-blue-300" : "hover:bg-blue-50")}>
                                    <td className="p-1.5 whitespace-nowrap">{t(row.cr_date)?.split("T")[0]}</td>
                                    <td className="p-1.5 text-right">{row.cr_boxes}</td>
                                    <td className="p-1.5 text-right">{row.cr_units}</td>
                                    <td className="p-1.5 text-right font-bold text-red-600">{fmt(row.cr_amount)}</td>
                                    <td className="p-1.5 whitespace-nowrap">{t(row.reason)}</td>
                                    <td className="p-1.5 max-w-[80px] truncate">{t(row.notes)}</td>
                                    <td className="p-1.5">
                                        <div className="flex gap-1">
                                            {canEdit && (
                                                <button onClick={e => { e.stopPropagation(); onEditQC?.(selRow, row); }}
                                                    className="text-amber-500 hover:text-amber-700" title="Edit QC">
                                                    <Pencil size={12}/>
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button onClick={e => {
                                                    e.stopPropagation();
                                                    toastConfirm("Delete this QC credit?", () => deleteCredit.mutate(row.unico));
                                                }} className="text-red-500 hover:text-red-700" title="Delete QC">
                                                    <Trash2 size={12}/>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
