"use client";

import { useState, useRef, useEffect } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Award, Search } from "lucide-react";
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

const PAGE_SIZE = 50;

interface Props {
    onAddQC?:  (row: any) => void;
    onEditQC?: (row: any, credit: any) => void;
}

export default function QualityCreditsTab({ onAddQC, onEditQC }: Props) {
    const qc = useQueryClient();
    const { canCreate, canEdit, canDelete, setLcPackBoxID, setLcQCID, refreshTrigger, triggerRefresh } = useQCContext();

    const [search,    setSearch]    = useState("");
    const [searchKey, setSearchKey] = useState(1);
    const [selRow,    setSelRow]    = useState<any>(null);
    const [selCredit, setSelCredit] = useState<any>(null);

    const sentinelRef = useRef<HTMLDivElement>(null);

    const {
        data: qcData,
        isFetching: loadingSearch,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
    } = useInfiniteQuery({
        queryKey: ["qc-credits-search", searchKey, search],
        queryFn: ({ pageParam }: { pageParam: number }) =>
            qcPost("/api/qc/credits/search", { search: search || "%", pageNo: pageParam, pageSize: PAGE_SIZE }),
        initialPageParam: 1,
        getNextPageParam: (lastPage: any, allPages) => {
            const total  = lastPage?.data?.[0]?.QueryTotalRecords ?? 0;
            const loaded = allPages.reduce((acc: number, p: any) => acc + (p?.data?.length ?? 0), 0);
            return loaded < total ? allPages.length + 1 : undefined;
        },
        staleTime: 0,
    });

    const allRows     = qcData?.pages.flatMap((p: any) => p?.data ?? []) ?? [];
    const totalRecords = qcData?.pages[0]?.data?.[0]?.QueryTotalRecords ?? 0;

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;
        const obs = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage)
                fetchNextPage();
        }, { rootMargin: "150px" });
        obs.observe(el);
        return () => obs.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const { data: creditRows = EMPTY_ARR, isFetching: loadingCredits, refetch: refetchCredits } = useQuery({
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

    const countLabel: string | number | undefined = allRows.length > 0
        ? (totalRecords && totalRecords !== allRows.length ? `${allRows.length} / ${totalRecords}` : allRows.length)
        : undefined;

    return (
        <div className="flex flex-col h-full gap-1.5">

            {/* ── Main QC inventory grid ──────────────────────── */}
            <PanelGrid
                title="QC Stock Search"
                icon={Search}
                recordCount={countLabel}
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search lots, AWB, farm..."
                onRefresh={() => { setSearchKey(k => k + 1); }}
                refreshing={loadingSearch}
                onDownload={() => {}}
                headerRight={<AuditLogModal recordId={selRow?.unico} disabled={!selRow}/>}
                className="flex-[3] min-h-0 shadow-sm"
            >
                <table className="min-w-full text-xs text-left">
                    <thead className="bg-[#4F4F4F] border-b border-[#DBD9D9] text-white text-[11px] font-bold uppercase sticky top-0 z-10">
                        <tr className="divide-x divide-[#DBD9D9]/30">
                            {["Description","Grower","Lot","Box Qty","Qty Transit","Qty Sold","Qty Adjust","Stock","Invoice Date","AvailableDate","AWBcode","Flo. U. Cost","Land. Cost x U","Total Cost x U","UnitsBo"].map(h => (
                                <th key={h} className="p-2 whitespace-nowrap">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="fos-grid-tbody divide-y divide-[#DBD9D9]">
                        {loadingSearch && allRows.length === 0 && <tr><td colSpan={15} className="p-6 text-center text-gray-400">Loading...</td></tr>}
                        {!loadingSearch && allRows.length === 0 && <tr><td colSpan={15} className="p-6 text-center text-gray-400">No results.</td></tr>}
                        {(allRows as any[]).map((row: any) => (
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
                <div ref={sentinelRef} className="h-4 flex items-center justify-center py-2 text-[10px] text-gray-400">
                    {isFetchingNextPage && "Loading more..."}
                </div>
            </PanelGrid>

            {/* ── Quality Credits by Lot ──────────────────────── */}
            <PanelGrid
                title="Quality Credits by Lot"
                icon={Award}
                recordCount={(creditRows as any[]).length > 0 ? (creditRows as any[]).length : undefined}
                onRefresh={() => refetchCredits()}
                refreshing={loadingCredits}
                onDownload={() => {}}
                menuItems={[
                    { label: "Add QC Credit",    icon: Plus,   color: "green",  onClick: () => { if (!selRow) { toast.error("Select a lot first."); return; } onAddQC?.(selRow); },             disabled: !canCreate },
                    { label: "Edit QC Credit",   icon: Pencil, color: "orange", onClick: () => { if (!selCredit) { toast.error("Select a QC credit first."); return; } onEditQC?.(selRow, selCredit); }, disabled: !canEdit || !selCredit },
                    { label: "Delete QC Credit", icon: Trash2, color: "red",    onClick: () => { if (!selCredit) { toast.error("Select a QC credit first."); return; } toastConfirm("Delete this QC credit?", () => deleteCredit.mutate(selCredit.unico)); }, disabled: !canDelete || !selCredit },
                ]}
                headerRight={<AuditLogModal recordId={selCredit?.unico} disabled={!selCredit}/>}
                className="flex-[2] min-h-0 shadow-sm"
            >
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
            </PanelGrid>
        </div>
    );
}
