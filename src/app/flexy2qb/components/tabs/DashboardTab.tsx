"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCcw } from "lucide-react";
import { TabTable } from "../TabTable";

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

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Filters */}
      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-[11px] font-black uppercase text-gray-500 tracking-widest">Customer Type:</span>
          <div className="flex gap-2">
            {[
              { id: "A", label: "All" },
              { id: "R", label: "Regular" },
              { id: "S", label: "Special" },
            ].map(t => (
              <label key={t.id} className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="customerType"
                  value={t.id}
                  checked={customerType === t.id}
                  onChange={(e) => setCustomerType(e.target.value)}
                  className="accent-[#FB7506]"
                />
                <span className="text-xs text-gray-700">{t.label}</span>
              </label>
            ))}
          </div>
        </div>
        {isFetching && <RefreshCcw size={14} className="text-[#FB7506] animate-spin" />}
      </div>

      {/* Chart placeholder (since no chart library specified) */}
      <div className="flex-1 bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex flex-col">
        <span className="text-[11px] font-black uppercase text-gray-500 tracking-widest mb-2">AR Dashboard Data</span>
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
  );
}
