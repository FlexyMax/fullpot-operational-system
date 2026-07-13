"use client";

import { useState, useEffect } from "react";
import { X, Loader2, BarChart2 } from "lucide-react";
import PanelGrid from "@/components/ui/PanelGrid";
import { PanelGridTable, PanelGridThead, PanelGridTh, PanelGridTbody, PanelGridTr, PanelGridTd } from "@/components/ui/PanelGridTable";

const t   = (v: any) => String(v ?? "").trim();
const fmt = (v: any) => parseFloat(v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface StockRow {
    available_date: string;
    farm:           string;
    clase:          string;
    subclase:       string;
    description:    string;
    units_case:     number;
    unit_price:     number;
}

interface Props { onClose: () => void; }

export function FutureStockModal({ onClose }: Props) {
    const [rows,    setRows]    = useState<StockRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search,  setSearch]  = useState("");

    useEffect(() => {
        (async () => {
            try {
                const r = await fetch("/api/standing-orders/future-stock");
                const j = await r.json();
                if (!r.ok) throw new Error(j.error || "Failed");
                setRows(Array.isArray(j) ? j.map((x: any) => ({
                    available_date: t(x.available_date ?? x.AVAILABLE_DATE),
                    farm:           t(x.farm           ?? x.FARM),
                    clase:          t(x.clase          ?? x.CLASE),
                    subclase:       t(x.subclase       ?? x.SUBCLASE),
                    description:    t(x.description    ?? x.DESCRIPTION),
                    units_case:     Number(x.units_case  ?? x.UNITS_CASE  ?? 0),
                    unit_price:     Number(x.unit_price  ?? x.UNIT_PRICE  ?? 0),
                })) : []);
            } catch {
                setRows([]);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const filtered = search.trim()
        ? rows.filter(r =>
            r.description.toLowerCase().includes(search.toLowerCase()) ||
            r.farm.toLowerCase().includes(search.toLowerCase()) ||
            r.clase.toLowerCase().includes(search.toLowerCase())
          )
        : rows;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden" style={{ maxHeight: "94dvh" }}>

                {/* Dark header */}
                <div className="h-10 bg-[#374151] rounded-t-xl flex items-center justify-between pl-3 pr-2 shrink-0 border-b border-black/10">
                    <div className="flex items-center gap-2">
                        <BarChart2 size={14} className="text-[#FB7506]" />
                        <span className="fos-grid-header-text">SO Future Stock — Availability</span>
                        {loading && <Loader2 size={11} className="animate-spin text-white/50" />}
                    </div>
                    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors">
                        <X size={15} />
                    </button>
                </div>

                {/* Grid — fills remaining space */}
                <PanelGrid
                    title=""
                    recordCount={filtered.length}
                    searchValue={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Filter by description, farm, class..."
                    className="flex-1 min-h-0 rounded-none border-x-0 border-b-0"
                >
                    <PanelGridTable>
                        <PanelGridThead>
                            <PanelGridTh>Avail. Date</PanelGridTh>
                            <PanelGridTh>Farm</PanelGridTh>
                            <PanelGridTh>Class</PanelGridTh>
                            <PanelGridTh>Subclass</PanelGridTh>
                            <PanelGridTh>Description</PanelGridTh>
                            <PanelGridTh align="right">Un/Case</PanelGridTh>
                            <PanelGridTh align="right">Unit Price</PanelGridTh>
                        </PanelGridThead>
                        <PanelGridTbody>
                            {filtered.map((row, i) => (
                                <PanelGridTr key={i} selected={false} onClick={() => {}}>
                                    <PanelGridTd className="font-semibold text-green-700 whitespace-nowrap">{row.available_date}</PanelGridTd>
                                    <PanelGridTd className="font-bold text-[#FB7506]">{row.farm}</PanelGridTd>
                                    <PanelGridTd>{row.clase}</PanelGridTd>
                                    <PanelGridTd>{row.subclase}</PanelGridTd>
                                    <PanelGridTd className="font-medium min-w-[220px]">{row.description}</PanelGridTd>
                                    <PanelGridTd align="right">{row.units_case.toLocaleString()}</PanelGridTd>
                                    <PanelGridTd align="right" className="font-semibold">{fmt(row.unit_price)}</PanelGridTd>
                                </PanelGridTr>
                            ))}
                            {!loading && filtered.length === 0 && (
                                <PanelGridTr selected={false} onClick={() => {}}>
                                    <PanelGridTd colSpan={7} align="center" className="text-gray-400 italic py-8">No availability data</PanelGridTd>
                                </PanelGridTr>
                            )}
                        </PanelGridTbody>
                    </PanelGridTable>
                </PanelGrid>

                {/* Footer */}
                <div className="h-10 bg-[#F5F3F3] border-t border-[#DBD9D9] flex items-center justify-end px-4 shrink-0 rounded-b-xl">
                    <button onClick={onClose}
                        className="h-7 px-4 text-[11px] font-bold uppercase tracking-wide text-[#4F4F4F] bg-white hover:bg-gray-50 border border-[#DBD9D9] rounded-md transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
