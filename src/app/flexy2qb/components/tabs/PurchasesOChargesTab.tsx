"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCcw, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { TabTable } from "../TabTable";
import { TopActionBar } from "../TopActionBar";
import { useFlexy2QBContext } from "../../context/Flexy2QBContext";
import { toast } from "sonner";

export default function PurchasesOChargesTab() {
  const qc = useQueryClient();
  const { refreshTrigger, triggerRefresh } = useFlexy2QBContext();
  const { canWrite } = useFlexy2QBContext();
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [subTab, setSubTab] = useState<"not-ready" | "ready" | "sent">("not-ready");

  const [selectedNotReadyIdx, setSelectedNotReadyIdx] = useState<number | undefined>();
  const [selectedReadyIdx, setSelectedReadyIdx] = useState<number | undefined>();
  const [selectedSentIdx, setSelectedSentIdx] = useState<number | undefined>();

  const { data: years = [] } = useQuery({
    queryKey: ["flexy2qb-ocharges-years"],
    queryFn: async () => {
      const r = await fetch("/api/flexy2qb/ocharges/years", { method: "POST", body: "{}" });
      const json = await r.json();
      return json.data || [];
    }
  });

  const { data: dates = [], isFetching: loadingDates } = useQuery({
    queryKey: ["flexy2qb-ocharges-dates", selectedYear],
    queryFn: async () => {
      const r = await fetch("/api/flexy2qb/ocharges/dates", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lnYears: selectedYear })
      });
      const json = await r.json();
      return json.data || [];
    },
    enabled: !!selectedYear
  });

  const { data: notReady = [], isFetching: loadingNotReady } = useQuery({
    queryKey: ["flexy2qb-ocharges-not-ready", selectedDate, refreshTrigger],
    queryFn: async () => {
      const r = await fetch("/api/flexy2qb/ocharges/not-ready", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ldawb_date: selectedDate })
      });
      const json = await r.json();
      return json.data || [];
    },
    enabled: !!selectedDate && subTab === "not-ready"
  });

  const { data: readyData = [], isFetching: loadingReady } = useQuery({
    queryKey: ["flexy2qb-ocharges-ready", refreshTrigger],
    queryFn: async () => {
      const r = await fetch("/api/flexy2qb/ocharges/ready", { method: "POST", body: "{}" });
      const json = await r.json();
      return json.data || [];
    },
    enabled: subTab === "ready"
  });

  const { data: sentData = [], isFetching: loadingSent } = useQuery({
    queryKey: ["flexy2qb-ocharges-sent", selectedDate, refreshTrigger],
    queryFn: async () => {
      const r = await fetch("/api/flexy2qb/ocharges/sent", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ldawb_date: selectedDate })
      });
      const json = await r.json();
      return json.data || [];
    },
    enabled: !!selectedDate && subTab === "sent"
  });

  const handleMutationResponse = (res: any) => {
    if (res.error) toast.error(res.message || "An error occurred");
    else {
      toast.success(res.message || "Action successful");
      triggerRefresh();
    }
  };

  const markReady = useMutation({
    mutationFn: async ({ lcCharge_uq, llready }: any) => {
      const r = await fetch("/api/flexy2qb/ocharges/update-ready", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lcCharge_uq, llready, llUpdateByDate: false })
      });
      return r.json();
    },
    onSuccess: handleMutationResponse
  });

  const sendToQb = useMutation({
    mutationFn: async ({ lcCharge_uq, llready }: any) => {
      const r = await fetch("/api/flexy2qb/ocharges/send", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lcCharge_uq, llready, llByReadyByDate: false })
      });
      return r.json();
    },
    onSuccess: handleMutationResponse
  });

  return (
    <div className="flex h-full gap-2">
      {/* â”€â”€ LEFT: Date Panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
                  <th className="p-2 text-right">Charges</th>
                </tr>
              </thead>
              <tbody>
                {dates.map((d: any, i: number) => {
                  const dateStr = d.awbdate || d.awb_date;
                  const dateDisp = new Date(dateStr).toLocaleDateString('en-US');
                  const active = selectedDate === dateStr;
                  return (
                    <tr key={i} onClick={() => setSelectedDate(dateStr)} className={cn("border-b cursor-pointer transition-colors", active ? "!bg-blue-100 ring-2 ring-inset ring-blue-300" : "hover:bg-blue-50")}>
                      <td className="p-2 font-medium">{dateDisp}</td>
                      <td className="p-2 text-right text-gray-500">{d.AWBCharges || 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* â”€â”€ RIGHT: Data Tabs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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

        <div className="flex-1 bg-[#f4f6f8] flex flex-col p-2 min-h-0">
          {subTab === "not-ready" && (
            <div className="flex flex-col h-full bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <TopActionBar disabled={!canWrite} 
                title="Data in Flexymax Not Ready To Transfer" 
                actions={[
                  { label: "Mark Ready", colorClass: "text-green-600", onClick: () => {
                    if(selectedNotReadyIdx === undefined || !notReady[selectedNotReadyIdx]) return toast.error("Select a row first");
                    const row = notReady[selectedNotReadyIdx];
                    markReady.mutate({ lcCharge_uq: row.unico, llready: true });
                  }}
                ]} 
              />
              <TabTable
                showToolbar
                loading={loadingNotReady}
                rows={notReady}
                selectedIdx={selectedNotReadyIdx}
                onSelectIdx={setSelectedNotReadyIdx}
                empty={selectedDate ? "No pending data for this date" : "Select a date to view data"}
                columns={[
                  { key: "awbcode", label: "AWB Code" },
                  { key: "grower", label: "Grower" },
                  { key: "Bill_No", label: "Bill No" },
                  { key: "total_invoice", label: "Total", className: "text-right font-semibold" },
                ]}
              />
            </div>
          )}

          {subTab === "ready" && (
            <div className="flex flex-col h-full bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <TopActionBar disabled={!canWrite} 
                title="Data Ready To QBooks" 
                actions={[
                  { label: "Send to QB", colorClass: "text-blue-600", onClick: () => {
                    if(selectedReadyIdx === undefined || !readyData[selectedReadyIdx]) return toast.error("Select a row first");
                    const row = readyData[selectedReadyIdx];
                    sendToQb.mutate({ lcCharge_uq: row.unico, llready: true });
                  }},
                  { label: "Unmark Ready", colorClass: "text-red-500", onClick: () => {
                    if(selectedReadyIdx === undefined || !readyData[selectedReadyIdx]) return toast.error("Select a row first");
                    const row = readyData[selectedReadyIdx];
                    markReady.mutate({ lcCharge_uq: row.unico, llready: false });
                  }}
                ]} 
              />
              <TabTable
                showToolbar
                loading={loadingReady}
                rows={readyData}
                selectedIdx={selectedReadyIdx}
                onSelectIdx={setSelectedReadyIdx}
                empty="No data ready"
                columns={[
                  { key: "AWBCode", label: "AWB Code" },
                  { key: "Vendor", label: "Vendor" },
                  { key: "Bill_No", label: "Bill No" },
                  { key: "Amount", label: "Amount", className: "text-right font-semibold" },
                ]}
              />
            </div>
          )}

          {subTab === "sent" && (
            <div className="flex flex-col h-full bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <TopActionBar disabled={!canWrite} 
                title="Data Sent To QBooks" 
                actions={[]} 
              />
              <TabTable
                showToolbar
                loading={loadingSent}
                rows={sentData}
                selectedIdx={selectedSentIdx}
                onSelectIdx={setSelectedSentIdx}
                empty={selectedDate ? "No data sent for this date" : "Select a date"}
                columns={[
                  { key: "awbcode", label: "AWB Code" },
                  { key: "grower", label: "Grower" },
                  { key: "Bill_No", label: "Bill No" },
                  { key: "total_invoice", label: "Total", className: "text-right font-semibold" },
                ]}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


