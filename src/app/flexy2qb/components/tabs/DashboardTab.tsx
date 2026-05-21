"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCcw } from "lucide-react";
import { TabTable } from "../TabTable";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function DashboardTab() {
  const [customerType, setCustomerType] = useState<string>("A");

  const { data: dashboardData = [], isFetching } = useQuery({
    queryKey: ["flexy2qb-dashboard", customerType],
    queryFn: async () => {
      const r = await fetch("/api/flexy2qb/dashboard/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lcCustomerType: customerType })
      });
      const json = await r.json();
      return json.data || [];
    }
  });

  const chartData = dashboardData.length > 0 ? [
    { name: 'Current', amount: Number(dashboardData[0].Current_) || 0, color: '#10b981' },
    { name: '30 Days', amount: Number(dashboardData[0].Over_30) || 0, color: '#f59e0b' },
    { name: '60 Days', amount: Number(dashboardData[0].Over_60) || 0, color: '#ea580c' },
    { name: '90+ Days', amount: Number(dashboardData[0].Over_90) || 0, color: '#dc2626' },
    { name: 'Unapplied', amount: Number(dashboardData[0].Unapplied) || 0, color: '#3b82f6' },
  ] : [];

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Filters */}
      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-[11px] font-black uppercase text-gray-500 tracking-widest">Customer Type:</span>
          <div className="flex gap-4">
            {[
              { id: "A", label: "All" },
              { id: "R", label: "Regular" },
              { id: "S", label: "Special" },
            ].map(t => (
              <label key={t.id} className="flex items-center gap-1.5 cursor-pointer group">
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${customerType === t.id ? 'border-[#FB7506] bg-[#FB7506]' : 'border-gray-300 group-hover:border-[#FB7506]'}`}>
                  {customerType === t.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <input
                  type="radio"
                  name="customerType"
                  value={t.id}
                  checked={customerType === t.id}
                  onChange={(e) => setCustomerType(e.target.value)}
                  className="hidden"
                />
                <span className="text-xs font-semibold text-gray-700">{t.label}</span>
              </label>
            ))}
          </div>
        </div>
        {isFetching && <RefreshCcw size={14} className="text-[#FB7506] animate-spin" />}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        {/* Chart */}
        <div className="flex-1 bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex flex-col min-h-[300px]">
          <span className="text-[11px] font-black uppercase text-gray-500 tracking-widest mb-4">AR Distribution</span>
          <div className="flex-1 w-full min-h-0">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 600, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#6b7280' }} 
                    axisLine={false} 
                    tickLine={false}
                    tickFormatter={(val) => `$${val >= 1000 ? (val / 1000) + 'k' : val}`}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f3f4f6' }}
                    formatter={(value: any) => [`$${Number(value || 0).toFixed(2)}`, 'Amount']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-400 font-medium">
                {isFetching ? "Loading..." : "No data available"}
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="flex-[1.5] bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex flex-col min-h-[300px]">
          <span className="text-[11px] font-black uppercase text-gray-500 tracking-widest mb-2">AR Summary Details</span>
          <TabTable
            loading={isFetching}
            rows={dashboardData}
            empty="No dashboard data found"
            columns={[
              { key: "Total_AR", label: "Total AR", render: (v) => `$${Number(v || 0).toFixed(2)}`, className: "text-right font-black text-[#FB7506]" },
              { key: "Current_", label: "Current", render: (v) => `$${Number(v || 0).toFixed(2)}`, className: "text-right" },
              { key: "Over_30", label: "30 Days", render: (v) => `$${Number(v || 0).toFixed(2)}`, className: "text-right" },
              { key: "Over_60", label: "60 Days", render: (v) => `$${Number(v || 0).toFixed(2)}`, className: "text-right text-orange-600" },
              { key: "Over_90", label: "90+ Days", render: (v) => `$${Number(v || 0).toFixed(2)}`, className: "text-right text-red-600" },
              { key: "Unapplied", label: "Unapplied", render: (v) => `$${Number(v || 0).toFixed(2)}`, className: "text-right text-blue-600" },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

