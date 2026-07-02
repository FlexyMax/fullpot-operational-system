"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, ChevronDown, Download, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import PanelGrid from "@/components/ui/PanelGrid";
import { AuditLogModal } from "@/components/AuditLogModal";
const EMPTY_ARR: any[] = [];

const t = (v: any) => String(v ?? "").trim();

const qcPost = (url: string, body: any) =>
    fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        .then(r => r.json());

const STEP = 50;

function colorVal(val: any, type: "orange" | "green" | "purple" | "blue") {
    if (!val || val === 0) return <span className="text-gray-400">0</span>;
    const cls = { orange: "text-orange-500 font-bold", green: "text-green-500 font-bold", purple: "text-purple-500 font-bold", blue: "text-blue-500 font-bold" };
    return <span className={cls[type]}>{val}</span>;
}

export default function TransitBoxesTab() {
    const [year,         setYear]         = useState(new Date().getFullYear());
    const [search,       setSearch]       = useState("");
    const [visibleCount, setVisibleCount] = useState(STEP);

    const sentinelRef = useRef<HTMLDivElement>(null);

    const { data: years = EMPTY_ARR } = useQuery({
        queryKey: ["qc-transit-years"],
        queryFn:  () => qcPost("/api/qc/transit/years", {}),
        staleTime: 300000,
        select:   (d: any) => d.data ?? [],
    });

    const { data: transitResp, isFetching: loading, refetch } = useQuery({
        queryKey: ["qc-transit-list", year, search],
        queryFn:  () => qcPost("/api/qc/transit/list", { lnYear: year, search: search || "%" }),
        staleTime: 0,
        select:   (d: any) => d,
    });

    const allRows = (transitResp as any)?.data ?? [];
    const rows    = allRows.slice(0, visibleCount);
    const hasMore = visibleCount < allRows.length;

    useEffect(() => { setVisibleCount(STEP); }, [year, search, allRows.length]);

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

    const countLabel: string | number | undefined = allRows.length > 0
        ? (rows.length !== allRows.length ? `${rows.length} / ${allRows.length}` : allRows.length)
        : undefined;

    return (
        <PanelGrid
            title="Boxes in Transit Delivery Date"
            icon={Truck}
            recordCount={countLabel}
            onRefresh={() => refetch()}
            refreshing={loading}
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search..."
            menuItems={[{ label: "Download CSV", icon: Download, color: "orange", onClick: () => {} }]}
            headerRight={
                <div className="flex items-center gap-1">
                <AuditLogModal recordId={null} disabled/>
                <div className="relative flex items-center mr-2">
                    <select value={year} onChange={e => setYear(Number(e.target.value))}
                        className="fos-input py-1 text-[11px] w-24 pr-8 appearance-none">
                        {(years as any[]).length
                            ? (years as any[]).map((y: any) => <option key={y.year ?? y} value={y.year ?? y}>{y.year ?? y}</option>)
                            : Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => <option key={y} value={y}>{y}</option>)
                        }
                    </select>
                    <div className="absolute right-1 flex items-center gap-0.5 pointer-events-none">
                        <X size={9} className="text-gray-400"/>
                        <ChevronDown size={9} className="text-gray-400"/>
                    </div>
                </div>
                </div>
            }
            className="h-full shadow-sm"
        >
            <table className="min-w-full text-xs text-left">
                <thead className="bg-[#4F4F4F] border-b border-[#DBD9D9] text-white text-[11px] font-bold uppercase sticky top-0 z-10">
                    <tr className="divide-x divide-[#DBD9D9]/30">
                        {["AvailableDate","InvoiceDate","Warehouse","AWBcode","Lot","Case","BoxQty","QtyTransit","QtyHold","Qty Adjust","Stock","Units Box","Total Units","Market","Description","AP Invoice","AP Amt"].map(h => (
                            <th key={h} className="p-2 whitespace-nowrap">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="fos-grid-tbody divide-y divide-[#DBD9D9]">
                    {loading && rows.length === 0 && <tr><td colSpan={17} className="p-8 text-center text-gray-400">Loading...</td></tr>}
                    {!loading && allRows.length === 0 && <tr><td colSpan={17} className="p-8 text-center text-gray-400">No transit boxes for the selected year.</td></tr>}
                    {(rows as any[]).map((row: any, i: number) => (
                        <tr key={row.unico ?? i}
                            style={{ backgroundColor: row.backColor || undefined }}
                            className="hover:bg-gray-50 transition-colors divide-x divide-[#DBD9D9]">
                            <td className="p-2 whitespace-nowrap">{t(row.AvailableDate)?.split("T")[0]}</td>
                            <td className="p-2 whitespace-nowrap">{t(row.box_date)?.split("T")[0]}</td>
                            <td className="p-2 whitespace-nowrap truncate max-w-[100px]">{t(row.Warehouse)}</td>
                            <td className="p-2 font-mono whitespace-nowrap">{t(row.awbcode)}</td>
                            <td className="p-2 text-right">{row.lote}</td>
                            <td className="p-2">{t(row.case_sh)}</td>
                            <td className="p-2 text-right">{colorVal(row.box_qty, "orange")}</td>
                            <td className="p-2 text-right">{colorVal(row.qty_transit, "orange")}</td>
                            <td className="p-2 text-right">{colorVal(row.qty_hold, "blue")}</td>
                            <td className="p-2 text-right">{colorVal(row.qty_adj, "purple")}</td>
                            <td className="p-2 text-right">{colorVal(row.stock, "green")}</td>
                            <td className="p-2 text-right">{row.tunits_x_box}</td>
                            <td className="p-2 text-right">{row.total_units}</td>
                            <td className="p-2">{t(row.market)}</td>
                            <td className="p-2 max-w-[200px] truncate">{t(row.description)}</td>
                            <td className="p-2 whitespace-nowrap">{t(row.APInvoice)}</td>
                            <td className="p-2 text-right">{row.APAmount ? `$${Number(row.APAmount).toFixed(2)}` : ""}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div ref={sentinelRef} className="h-4 flex items-center justify-center py-2 text-[10px] text-gray-400">
                {hasMore && !loading && "Loading more..."}
            </div>
        </PanelGrid>
    );
}
