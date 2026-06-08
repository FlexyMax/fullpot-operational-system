"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
const EMPTY_ARR: any[] = [];

// SP: sp_AR_accouts_rec_dashboard(@lcCustomerType)
// Returns 20 rows with columns: cust_code, Customer_uq, AR15, AR30, AR45,
//   AR60, AR75, AR90, AR105, AR120, ARGT120, AR_Total

const fmt = (v: any) =>
    Number(v || 0) >= 1000
        ? `$${(Number(v) / 1000).toFixed(0)}k`
        : `$${Number(v || 0).toFixed(0)}`;

const CUSTOMER_TYPES = [
    { id: "C", label: "CUSTOMERS" },
    { id: "S", label: "SALES" },
    { id: "I", label: "INTERNAL" },
    { id: "A", label: "ALL" },
];

export default function DashboardTab() {
    const [customerType, setCustomerType] = useState<string>("A");

    const { data: dashboardData = EMPTY_ARR, isFetching } = useQuery({
        queryKey: ["flexy2qb-dashboard", customerType],
        queryFn: async () => {
            const r = await fetch("/api/flexy2qb/dashboard/get", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ lcCustomerType: customerType }),
            });
            const json = await r.json();
            return json.data || [];
        },
    });

    // Each row is one customer — map to chart entries
    const chartData = (dashboardData as any[]).map(row => ({
        name: String(row.cust_code || "").split(" - ")[0].trim(), // keep short label
        fullName: String(row.cust_code || ""),
        balance: Number(row.AR_Total) || 0,
    }));

    const totalAR = (dashboardData as any[]).reduce((s, r) => s + (Number(r.AR_Total) || 0), 0);

    return (
        <div className="flex flex-col h-full gap-3">

            {/* ── Filter bar ──────────────────────────────────────────── */}
            <div className="bg-white px-4 py-2.5 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between shrink-0">
                <div className="flex items-center gap-6">
                    {CUSTOMER_TYPES.map(t => (
                        <label key={t.id} className="flex items-center gap-1.5 cursor-pointer group select-none">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${customerType === t.id ? "border-[#FB7506] bg-[#FB7506]" : "border-gray-300 group-hover:border-[#FB7506]"}`}>
                                {customerType === t.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                            <input type="radio" name="customerType" value={t.id} checked={customerType === t.id} onChange={e => setCustomerType(e.target.value)} className="hidden" />
                            <span className="text-[11px] font-black uppercase tracking-wider text-gray-600">{t.label}</span>
                        </label>
                    ))}
                </div>
                <div className="flex items-center gap-3">
                    {!isFetching && dashboardData.length > 0 && (
                        <span className="text-[11px] font-bold text-gray-500">
                            Total AR: <span className="text-[#FB7506] font-black">${totalAR.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </span>
                    )}
                    {isFetching && <RefreshCcw size={14} className="text-[#FB7506] animate-spin" />}
                </div>
            </div>

            {/* ── Chart ───────────────────────────────────────────────── */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex flex-col" style={{ minHeight: 320 }}>
                <p className="text-center text-sm font-bold text-gray-700 mb-1">A/R Top 20 Customer&apos;s Balance</p>
                <div className="flex-1 w-full" style={{ minHeight: 260 }}>
                    {isFetching ? (
                        <div className="flex h-full items-center justify-center text-sm text-gray-400 font-medium">Loading...</div>
                    ) : chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 80 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 9, fill: "#6b7280" }}
                                    axisLine={false}
                                    tickLine={false}
                                    angle={-40}
                                    textAnchor="end"
                                    interval={0}
                                />
                                <YAxis
                                    tick={{ fontSize: 10, fill: "#6b7280" }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={fmt}
                                    label={{ value: "Balance ($)", angle: -90, position: "insideLeft", offset: 10, style: { fontSize: 10, fill: "#9ca3af" } }}
                                />
                                <Tooltip
                                    cursor={{ fill: "#f3f4f6" }}
                                    formatter={(value: any) => [`$${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2 })}`, "Balance"]}
                                    labelFormatter={(_: any, payload: any) => payload?.[0]?.payload?.fullName || ""}
                                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", fontSize: 11 }}
                                />
                                <Legend wrapperStyle={{ fontSize: 11 }} />
                                <Bar dataKey="balance" name="Balance" fill="#93c5fd" radius={[3, 3, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-full items-center justify-center text-sm text-gray-400 font-medium">No data available</div>
                    )}
                </div>
            </div>

            {/* ── Summary table ───────────────────────────────────────── */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-auto flex-1 min-h-0">
                <table className="min-w-full text-xs text-left">
                    <thead className="bg-[#374151] text-white font-bold sticky top-0">
                        <tr>
                            {["Customer","AR15","AR30","AR45","AR60","AR75","AR90","AR105","AR120","AR>120","Total AR"].map(h => (
                                <th key={h} className="p-2 border-r border-gray-600/50 whitespace-nowrap">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {isFetching ? (
                            <tr><td colSpan={11} className="p-8 text-center text-gray-400">Loading...</td></tr>
                        ) : (dashboardData as any[]).length === 0 ? (
                            <tr><td colSpan={11} className="p-8 text-center text-gray-400 italic">No data available</td></tr>
                        ) : (
                            (dashboardData as any[]).map((row, i) => (
                                <tr key={i} className="border-b odd:bg-white even:bg-gray-50 hover:bg-blue-50">
                                    <td className="p-2 border-r border-gray-100 font-medium max-w-[180px] truncate">{row.cust_code}</td>
                                    {["AR15","AR30","AR45","AR60","AR75","AR90","AR105","AR120","ARGT120","AR_Total"].map(k => (
                                        <td key={k} className={`p-2 border-r border-gray-100 text-right ${k === "AR_Total" ? "font-black text-[#FB7506]" : ""}`}>
                                            ${Number(row[k] || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
