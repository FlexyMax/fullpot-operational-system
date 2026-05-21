"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCcw, Calendar, CheckCircle, XCircle, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { TabTable } from "../TabTable";
import { useFlexy2QBContext } from "../../context/Flexy2QBContext";

export default function CustomerPaymentsTab() {
  const qc = useQueryClient();
  const { refreshTrigger, triggerRefresh } = useFlexy2QBContext();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [subTab, setSubTab] = useState<"not-ready" | "ready" | "sent">("not-ready");

  const { data: dates = [], isFetching: loadingDates } = useQuery({
    queryKey: ["flexy2qb-payments-dates"],
    queryFn: async () => {
      const r = await fetch("/api/flexy2qb/payments/dates", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });
      const json = await r.json();
      return json.data || [];
    }
  });

  const { data: notReady = [], isFetching: loadingNotReady } = useQuery({
    queryKey: ["flexy2qb-payments-not-ready", selectedDate, refreshTrigger],
    queryFn: async () => {
      const r = await fetch("/api/flexy2qb/payments/not-ready", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ldin_date: selectedDate })
      });
      const json = await r.json();
      return json.data || [];
    },
    enabled: !!selectedDate && subTab === "not-ready"
  });

  const { data: readyData = [], isFetching: loadingReady } = useQuery({
    queryKey: ["flexy2qb-payments-ready", refreshTrigger],
    queryFn: async () => {
      const r = await fetch("/api/flexy2qb/payments/ready", { method: "POST", body: "{}" });
      const json = await r.json();
      return json.data || [];
    },
    enabled: subTab === "ready"
  });

  const { data: sentData = [], isFetching: loadingSent } = useQuery({
    queryKey: ["flexy2qb-payments-sent", selectedDate, refreshTrigger],
    queryFn: async () => {
      const r = await fetch("/api/flexy2qb/payments/sent", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ldin_date: selectedDate })
      });
      const json = await r.json();
      return json.data || [];
    },
    enabled: !!selectedDate && subTab === "sent"
  });

  const markReady = useMutation({
    mutationFn: async ({ lcincome_uq, llready }: any) => {
      const r = await fetch("/api/flexy2qb/payments/update-ready", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lcincome_uq, llready, llByReadyByDate: false })
      });
      return r.json();
    },
    onSuccess: () => triggerRefresh()
  });

  const sendToQb = useMutation({
    mutationFn: async ({ lcincome_uq, llready }: any) => {
      const r = await fetch("/api/flexy2qb/payments/send", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lcincome_uq, llready, llByReadyByDate: false })
      });
      return r.json();
    },
    onSuccess: () => triggerRefresh()
  });

  return (
    <div className="flex h-full gap-2">
      {/* ── LEFT: Date Panel ─────────────────────── */}
      <div className="w-[280px] flex flex-col gap-2 shrink-0">
        <div className="flex-1 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="h-8 bg-[#374151] flex items-center justify-between px-3 shrink-0">
            <div className="flex items-center gap-2">
              <Calendar size={13} className="text-[#FB7506]" />
              <span className="font-black text-[10px] uppercase tracking-widest text-white">Dates</span>
            </div>
            {loadingDates && <RefreshCcw size={10} className="text-gray-400 animate-spin" />}
          </div>
          <div className="overflow-y-auto flex-1">
            <table className="min-w-full text-xs text-left">
              <thead className="bg-gray-100 border-b text-gray-700 font-bold sticky top-0">
                <tr>
                  <th className="p-2">Payment Date</th>
                  <th className="p-2 text-right">Payments</th>
                </tr>
              </thead>
              <tbody>
                {dates.map((d: any, i: number) => {
                  const dateStr = d.indate || d.in_date;
                  const dateDisp = new Date(dateStr).toLocaleDateString('en-US');
                  const active = selectedDate === dateStr;
                  return (
                    <tr key={i} onClick={() => setSelectedDate(dateStr)} className={cn("border-b cursor-pointer transition-colors", active ? "!bg-blue-100 ring-2 ring-inset ring-blue-300" : "hover:bg-blue-50")}>
                      <td className="p-2 font-medium">{dateDisp}</td>
                      <td className="p-2 text-right text-gray-500">{d.Payments || 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Data Tabs ─────────────────────── */}
      <div className="flex-1 flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="h-9 bg-[#374151] flex items-end px-2 shrink-0 gap-0.5">
          {[
            { id: "not-ready", label: "NOT READY" },
            { id: "ready", label: "READY TO QB" },
            { id: "sent", label: "SENT TO QB" },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id as any)}
              className={cn("px-4 h-7 text-[9px] font-black uppercase tracking-widest rounded-t transition-all", subTab === t.id ? "bg-white text-[#FB7506]" : "text-gray-400 hover:text-white hover:bg-white/10")}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 p-2 bg-[#f4f6f8] flex flex-col">
          {subTab === "not-ready" && (
            <div className="flex flex-col h-full gap-2">
              <span className="text-[11px] font-black uppercase text-gray-500 tracking-widest">Data in Flexymax Not Ready</span>
              <TabTable
                loading={loadingNotReady}
                rows={notReady}
                empty={selectedDate ? "No pending data for this date" : "Select a date to view data"}
                columns={[
                  { key: "in_number", label: "Payment No" },
                  { key: "customer", label: "Customer" },
                  { key: "in_amount", label: "Amount", className: "text-right font-semibold" },
                ]}
                actions={(row) => (
                  <button onClick={() => markReady.mutate({ lcincome_uq: row.unico, llready: true })} title="Mark Ready" className="text-green-600 hover:bg-green-100 p-1 rounded"><CheckCircle size={14} /></button>
                )}
              />
            </div>
          )}

          {subTab === "ready" && (
            <div className="flex flex-col h-full gap-2">
              <span className="text-[11px] font-black uppercase text-gray-500 tracking-widest">Data Ready To QBooks</span>
              <TabTable
                loading={loadingReady}
                rows={readyData}
                empty="No data ready"
                columns={[
                  { key: "in_number", label: "Payment No" },
                  { key: "Customer", label: "Customer" },
                  { key: "Amount", label: "Amount", className: "text-right font-semibold" },
                ]}
                actions={(row) => (
                  <>
                    <button onClick={() => sendToQb.mutate({ lcincome_uq: row.unico, llready: true })} title="Send to QB" className="text-blue-600 hover:bg-blue-100 p-1 rounded"><Send size={14} /></button>
                    <button onClick={() => markReady.mutate({ lcincome_uq: row.unico, llready: false })} title="Unmark Ready" className="text-red-600 hover:bg-red-100 p-1 rounded"><XCircle size={14} /></button>
                  </>
                )}
              />
            </div>
          )}

          {subTab === "sent" && (
            <div className="flex flex-col h-full gap-2">
              <span className="text-[11px] font-black uppercase text-gray-500 tracking-widest">Data Sent To QBooks</span>
              <TabTable
                loading={loadingSent}
                rows={sentData}
                empty={selectedDate ? "No data sent for this date" : "Select a date"}
                columns={[
                  { key: "in_number", label: "Payment No" },
                  { key: "customer", label: "Customer" },
                  { key: "in_amount", label: "Amount", className: "text-right font-semibold" },
                ]}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
