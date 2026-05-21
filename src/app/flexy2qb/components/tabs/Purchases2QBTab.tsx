"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCcw, Calendar, CheckCircle, XCircle, Send, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { TabTable } from "../TabTable";
import { useFlexy2QBContext } from "../../context/Flexy2QBContext";

export default function Purchases2QBTab() {
  const qc = useQueryClient();
  const { lcPack_uq, setLcPack_uq, llBillReady, setLlBillReady, refreshTrigger, triggerRefresh } = useFlexy2QBContext();
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [subTab, setSubTab] = useState<"not-ready" | "ready" | "sent" | "tpo">("not-ready");

  const { data: years = [] } = useQuery({
    queryKey: ["flexy2qb-purchases-years"],
    queryFn: async () => {
      const r = await fetch("/api/flexy2qb/purchases/years", { method: "POST", body: "{}" });
      const json = await r.json();
      return json.data || [];
    }
  });

  const { data: dates = [], isFetching: loadingDates } = useQuery({
    queryKey: ["flexy2qb-purchases-dates", selectedYear],
    queryFn: async () => {
      const r = await fetch("/api/flexy2qb/purchases/dates", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lnYear: selectedYear })
      });
      const json = await r.json();
      return json.data || [];
    },
    enabled: !!selectedYear
  });

  const { data: notReady = [], isFetching: loadingNotReady } = useQuery({
    queryKey: ["flexy2qb-purchases-not-ready", selectedDate, refreshTrigger],
    queryFn: async () => {
      const r = await fetch("/api/flexy2qb/purchases/not-ready", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ldawb_date: selectedDate, pageNo: 1, pageSize: 500 })
      });
      const json = await r.json();
      return json.data || [];
    },
    enabled: !!selectedDate && subTab === "not-ready"
  });

  const { data: readyData = [], isFetching: loadingReady } = useQuery({
    queryKey: ["flexy2qb-purchases-ready", refreshTrigger],
    queryFn: async () => {
      const r = await fetch("/api/flexy2qb/purchases/ready", { method: "POST", body: "{}" });
      const json = await r.json();
      return json.data || [];
    },
    enabled: subTab === "ready"
  });

  const { data: sentData = [], isFetching: loadingSent } = useQuery({
    queryKey: ["flexy2qb-purchases-sent", selectedDate, refreshTrigger],
    queryFn: async () => {
      const r = await fetch("/api/flexy2qb/purchases/sent", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ldawb_date: selectedDate })
      });
      const json = await r.json();
      return json.data || [];
    },
    enabled: !!selectedDate && subTab === "sent"
  });

  const { data: tpoData = [], isFetching: loadingTpo } = useQuery({
    queryKey: ["flexy2qb-purchases-tpo", refreshTrigger],
    queryFn: async () => {
      const r = await fetch("/api/flexy2qb/purchases/tpo", { method: "POST", body: "{}" });
      const json = await r.json();
      return json.data || [];
    },
    enabled: subTab === "tpo"
  });

  const markReady = useMutation({
    mutationFn: async ({ lcpacking_box, lcawbcode, llready }: any) => {
      const r = await fetch("/api/flexy2qb/purchases/update-ready", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lcpacking_box, lcawbcode, llready })
      });
      return r.json();
    },
    onSuccess: () => triggerRefresh()
  });

  const markReadyInvoice = useMutation({
    mutationFn: async ({ lcpacking_uq, llready }: any) => {
      const r = await fetch("/api/flexy2qb/purchases/update-ready-invoice", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lcpacking_uq, llready })
      });
      return r.json();
    },
    onSuccess: () => triggerRefresh()
  });

  const sendToQb = useMutation({
    mutationFn: async ({ lcawbcode_aux, llready, llByReadyByDate }: any) => {
      const r = await fetch("/api/flexy2qb/purchases/send", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lcawbcode_aux, llready, llByReadyByDate })
      });
      return r.json();
    },
    onSuccess: () => triggerRefresh()
  });

  const downloadCSV = () => {
    if (!tpoData.length) return;
    const headers = Object.keys(tpoData[0]);
    const csv = [headers, ...tpoData.map((r: any) => headers.map(h => `"${String(r[h] || "").replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: 'Bills2TPO.csv' });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full gap-2">
      {/* ── LEFT: Date Panel ─────────────────────── */}
      <div className="w-[280px] flex flex-col gap-2 shrink-0">
        <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
          <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Year</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-gray-100 border-none text-[11px] font-black rounded px-2 py-1 outline-none"
          >
            {years.map((y: any) => (
              <option key={y.year || y.lnYear || Object.values(y)[0] as string} value={y.year || y.lnYear || Object.values(y)[0] as string}>
                {y.year || y.lnYear || Object.values(y)[0] as string}
              </option>
            ))}
          </select>
        </div>
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
                  <th className="p-2">AWB Date</th>
                  <th className="p-2 text-right">Bills</th>
                </tr>
              </thead>
              <tbody>
                {dates.map((d: any, i: number) => {
                  // Standardize date field extraction based on exact DB returns
                  const dateStr = d.awbdate || d.awb_date;
                  const dateDisp = new Date(dateStr).toLocaleDateString('en-US');
                  const active = selectedDate === dateStr;
                  return (
                    <tr key={i} onClick={() => setSelectedDate(dateStr)} className={cn("border-b cursor-pointer transition-colors", active ? "!bg-blue-100 ring-2 ring-inset ring-blue-300" : "hover:bg-blue-50")}>
                      <td className="p-2 font-medium">{dateDisp}</td>
                      <td className="p-2 text-right text-gray-500">{d.AWBills || d.records || 0}</td>
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
            { id: "tpo", label: "READY FOR TPO" },
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
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-gray-500 tracking-widest">Data in Flexymax Not Ready To Transfer To QBooks</span>
              </div>
              <TabTable
                loading={loadingNotReady}
                rows={notReady}
                empty={selectedDate ? "No pending data for this date" : "Select a date to view data"}
                columns={[
                  { key: "awbcode", label: "AWB Code" },
                  { key: "grower", label: "Grower" },
                  { key: "invoice_no", label: "Invoice" },
                  { key: "total_units", label: "Units", className: "text-right" },
                  { key: "total_cost", label: "Cost", className: "text-right font-semibold" },
                ]}
                actions={(row) => (
                  <>
                    <button onClick={() => markReady.mutate({ lcpacking_box: row.pack_uq, lcawbcode: row.awbcode, llready: true })} title="Mark Ready" className="text-green-600 hover:bg-green-100 p-1 rounded"><CheckCircle size={14} /></button>
                    <button onClick={() => markReadyInvoice.mutate({ lcpacking_uq: row.pack_uq, llready: true })} title="Mark by Invoice" className="text-blue-600 hover:bg-blue-100 p-1 rounded"><Send size={14} /></button>
                  </>
                )}
              />
            </div>
          )}

          {subTab === "ready" && (
            <div className="flex flex-col h-full gap-2">
              <span className="text-[11px] font-black uppercase text-gray-500 tracking-widest">Data in Flexymax Ready To QBooks</span>
              <TabTable
                loading={loadingReady}
                rows={readyData}
                empty="No data ready"
                columns={[
                  { key: "awbcode", label: "AWB Code" },
                  { key: "Vendor", label: "Vendor" },
                  { key: "Bill_No", label: "Bill No" },
                  { key: "Amount", label: "Amount", className: "text-right font-semibold" },
                ]}
                actions={(row) => (
                  <>
                    <button onClick={() => sendToQb.mutate({ lcawbcode_aux: row.awbcode, llready: true, llByReadyByDate: false })} title="Send to QB" className="text-blue-600 hover:bg-blue-100 p-1 rounded"><Send size={14} /></button>
                    <button onClick={() => markReady.mutate({ lcpacking_box: row.packing_uq, lcawbcode: row.awbcode, llready: false })} title="Unmark Ready" className="text-red-600 hover:bg-red-100 p-1 rounded"><XCircle size={14} /></button>
                  </>
                )}
              />
            </div>
          )}

          {subTab === "sent" && (
            <div className="flex flex-col h-full gap-2">
              <span className="text-[11px] font-black uppercase text-gray-500 tracking-widest">Flexymax Data Sent To QBooks</span>
              <TabTable
                loading={loadingSent}
                rows={sentData}
                empty={selectedDate ? "No data sent for this date" : "Select a date"}
                columns={[
                  { key: "awbcode", label: "AWB Code" },
                  { key: "grower", label: "Grower" },
                  { key: "invoice_no", label: "Invoice" },
                  { key: "total_cost", label: "Cost", className: "text-right font-semibold" },
                ]}
              />
            </div>
          )}

          {subTab === "tpo" && (
            <div className="flex flex-col h-full gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-gray-500 tracking-widest">Data Ready To Transaction PRO Online</span>
                <button onClick={downloadCSV} className="flex items-center gap-1.5 bg-[#FB7506] text-white px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest"><Download size={12}/> CSV</button>
              </div>
              <TabTable
                loading={loadingTpo}
                rows={tpoData}
                empty="No TPO data ready"
                columns={[
                  { key: "RefNumber", label: "Ref Number" },
                  { key: "Vendor", label: "Vendor" },
                  { key: "TxnDate", label: "Txn Date" },
                  { key: "DueDate", label: "Due Date" },
                ]}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
