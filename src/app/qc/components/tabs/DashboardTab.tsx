"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { cn } from "@/lib/utils";

const qcFetch = (url: string, body: any) =>
    fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        .then(r => r.json());

const fmt = (v: any) => Number(v || 0) >= 1000 ? `$${(Number(v) / 1000).toFixed(0)}k` : `$${Number(v || 0).toFixed(0)}`;

const CLASSES = [
    { id: "A", label: "All" },
    { id: "B", label: "Boxes" },
    { id: "V", label: "Volume" },
    { id: "C", label: "Cost" },
];

const SUB_TABS = ["Boxes", "Volume", "Cost"] as const;
type SubTab = typeof SUB_TABS[number];

export default function DashboardTab() {
    const [year,    setYear]    = useState(new Date().getFullYear());
    const [selClass,setSelClass]= useState("A");
    const [subTab,  setSubTab]  = useState<SubTab>("Boxes");

    const { data: years = [] } = useQuery({
        queryKey: ["qc-years"],
        queryFn: () => qcFetch("/api/qc/dashboard/years", {}),
        staleTime: 300000,
        select: (d: any) => d.data ?? [],
    });

    const { data: dashboard = [], isFetching } = useQuery({
        queryKey: ["qc-dashboard", year, selClass],
        queryFn: () => qcFetch("/api/qc/dashboard/list", { lnYear: year, lcClass: selClass }),
        select: (d: any) => d.data ?? [],
    });

    // Build chart data from rows — key changes by sub-tab
    const dataKey: Record<SubTab, string> = { Boxes: "boxes", Volume: "volume", Cost: "cost" };
    const chartData = (dashboard as any[]).map(r => ({
        name:   String(r.description || r.awbcode || r.name || "").substring(0, 18),
        boxes:  Number(r.boxes  || r.qty_boxes    || 0),
        volume: Number(r.volume || r.total_units  || 0),
        cost:   Number(r.cost   || r.total_cost   || 0),
        full:   r,
    }));

    return (
        <div className="flex flex-col h-full gap-3">
            {/* Filters */}
            <div className="bg-white px-4 py-2.5 rounded-lg border border-gray-200 shadow-sm flex items-center gap-6 shrink-0">
                <div className="flex items-center gap-2 text-xs">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Year</label>
                    <select value={year} onChange={e => setYear(Number(e.target.value))} className="fos-input py-1 w-24">
                        {(years as any[]).length
                            ? (years as any[]).map((y: any) => <option key={y.year ?? y} value={y.year ?? y}>{y.year ?? y}</option>)
                            : Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => <option key={y} value={y}>{y}</option>)
                        }
                    </select>
                </div>
                <div className="flex items-center gap-4">
                    {CLASSES.map(c => (
                        <label key={c.id} className="flex items-center gap-1.5 cursor-pointer select-none">
                            <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-colors ${selClass === c.id ? "border-[#FB7506] bg-[#FB7506]" : "border-gray-300 hover:border-[#FB7506]"}`}>
                                {selClass === c.id && <div className="w-1 h-1 rounded-full bg-white"/>}
                            </div>
                            <input type="radio" value={c.id} checked={selClass === c.id} onChange={e => setSelClass(e.target.value)} className="hidden"/>
                            <span className="text-[11px] font-bold text-gray-600">{c.label}</span>
                        </label>
                    ))}
                </div>
                {isFetching && <RefreshCcw size={13} className="text-[#FB7506] animate-spin ml-auto"/>}
            </div>

            {/* Sub-tabs */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex-1 flex flex-col overflow-hidden">
                <div className="flex border-b shrink-0">
                    {SUB_TABS.map(t => (
                        <button key={t} onClick={() => setSubTab(t)} className={cn("px-5 py-2 text-[11px] font-bold uppercase tracking-wide transition-colors", subTab === t ? "border-b-2 border-[#FB7506] text-[#FB7506]" : "text-gray-500 hover:text-gray-800")}>
                            {t}
                        </button>
                    ))}
                </div>

                <div className="flex-1 p-4 min-h-0">
                    {isFetching ? (
                        <div className="flex h-full items-center justify-center text-sm text-gray-400">Loading...</div>
                    ) : chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 80 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb"/>
                                <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#6b7280" }} axisLine={false} tickLine={false} angle={-40} textAnchor="end" interval={0}/>
                                <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} tickFormatter={subTab === "Cost" ? fmt : undefined}/>
                                <Tooltip
                                    cursor={{ fill: "#f3f4f6" }}
                                    formatter={(v: any) => [subTab === "Cost" ? `$${Number(v).toLocaleString("en-US", { minimumFractionDigits: 2 })}` : Number(v).toLocaleString(), subTab]}
                                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", fontSize: 11 }}
                                />
                                <Legend wrapperStyle={{ fontSize: 11 }}/>
                                <Bar dataKey={dataKey[subTab]} name={subTab} fill={subTab === "Cost" ? "#f97316" : subTab === "Volume" ? "#60a5fa" : "#4ade80"} radius={[3, 3, 0, 0]}/>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-full items-center justify-center text-sm text-gray-400">No data available</div>
                    )}
                </div>
            </div>
        </div>
    );
}
