"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCcw, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { TabTable } from "../TabTable";
import { TopActionBar } from "../TopActionBar";
import { useFlexy2QBContext } from "../../context/Flexy2QBContext";
import { toast } from "sonner";

export default function CustomerPaymentsTab() {
  const qc = useQueryClient();
  const { refreshTrigger, triggerRefresh } = useFlexy2QBContext();
  const { canWrite } = useFlexy2QBContext();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [subTab, setSubTab] = useState<"not-ready" | "ready" | "sent">("not-ready");

  const [selectedNotReadyIdx, setSelectedNotReadyIdx] = useState<number | undefined>();
  const [selectedReadyIdx, setSelectedReadyIdx] = useState<number | undefined>();
  const [selectedSentIdx, setSelectedSentIdx] = useState<number | undefined>();

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

  const handleMutationResponse = (res: any) => {
    if (res.error) toast.error(res.message || "An error occurred");
    else {
      toast.success(res.message || "Action successful");
      triggerRefresh();
    }
  };

  const markReady = useMutation({
    mutationFn: async ({ lcincome_uq, llready, llByReadyByDate }: any) => {
      const r = await fetch("/api/flexy2qb/payments/update-ready", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lcincome_uq, llready, llByReadyByDate })
      });
      return r.json();
    },
    onSuccess: handleMutationResponse
  });

  const sendToQb = useMutation({
    mutationFn: async ({ lcincome_uq, llready, llByReadyByDate }: any) => {
      const r = await fetch("/api/flexy2qb/payments/send", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lcincome_uq, llready, llByReadyByDate })
      });
      return r.json();
    },
    onSuccess: handleMutationResponse
  });

  return (
    <div className="flex h-full gap-2">
      {/* â”€â”€ LEFT: Date Panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="w-[280px] flex flex-col gap-2 shrink-0">
        <div className="flex-1 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="h-10 bg-[#374151] flex items-center justify-between px-3 shrink-0">
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
                  const dateDisp = dateStr ? new Date(dateStr).toLocaleDateString('en-US') : "";
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

      {/* â”€â”€ RIGHT: Data Tabs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="flex-1 flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="h-10 bg-[#374151] flex items-end px-2 shrink-0 gap-0.5 rounded-t-lg">
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
                title="Data in Flexymax Not Ready" 
                actions={[
                  { label: "Ready By Payment", colorClass: "text-green-600", onClick: () => {
                    if(selectedNotReadyIdx === undefined || !notReady[selectedNotReadyIdx]) return toast.error("Select a row first");
                    const row = notReady[selectedNotReadyIdx];
                    markReady.mutate({ lcincome_uq: row.unico, llready: true, llByReadyByDate: false });
                  }},
                  { label: "Ready By Date", colorClass: "text-green-600", onClick: () => {
                    if(!selectedDate) return toast.error("Select a date first");
                    markReady.mutate({ lcincome_uq: selectedDate, llready: true, llByReadyByDate: true });
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
                  { key: "in_number", label: "Payment No" },
                  { key: "customer", label: "Customer" },
                  { key: "bank_doc", label: "Bank Doc" },
                  { key: "payment_method", label: "Pay Method" },
                  { key: "in_amount", label: "Amount", className: "text-right font-semibold" },
                ]}
              />
            </div>
          )}

          {subTab === "ready" && (
            <div className="flex flex-col h-full bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <TopActionBar disabled={!canWrite} 
                title="Data Ready To QBooks" 
                actions={[
                  { label: "Payment Mark as Not Ready", colorClass: "text-red-500", onClick: () => {
                    if(selectedReadyIdx === undefined || !readyData[selectedReadyIdx]) return toast.error("Select a row first");
                    const row = readyData[selectedReadyIdx];
                    markReady.mutate({ lcincome_uq: row.unico, llready: false, llByReadyByDate: false });
                  }},
                  { label: "Mark as Not Ready By Date", colorClass: "text-red-500", onClick: () => {
                    if(!selectedDate) return toast.error("Select a date first");
                    markReady.mutate({ lcincome_uq: selectedDate, llready: false, llByReadyByDate: true });
                  }},
                  { label: "Sent By Payment", colorClass: "text-blue-600", onClick: () => {
                    if(selectedReadyIdx === undefined || !readyData[selectedReadyIdx]) return toast.error("Select a row first");
                    const row = readyData[selectedReadyIdx];
                    sendToQb.mutate({ lcincome_uq: row.unico, llready: true, llByReadyByDate: false });
                  }},
                  { label: "Sent By Date", colorClass: "text-blue-600", onClick: () => {
                    if(!selectedDate) return toast.error("Select a date first");
                    sendToQb.mutate({ lcincome_uq: selectedDate, llready: true, llByReadyByDate: true });
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
                  { key: "in_number", label: "Payment No" },
                  { key: "Customer", label: "Customer" },
                  { key: "bank_doc", label: "Bank Doc" },
                  { key: "payment_method", label: "Pay Method" },
                  { key: "Amount", label: "Amount", className: "text-right font-semibold" },
                ]}
              />
            </div>
          )}

          {subTab === "sent" && (
            <div className="flex flex-col h-full bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <TopActionBar disabled={!canWrite} 
                title="Data Sent To QBooks" 
                actions={[
                  { label: "Mark as Not Sent", colorClass: "text-red-500", onClick: () => {
                    if(selectedSentIdx === undefined || !sentData[selectedSentIdx]) return toast.error("Select a row first");
                    const row = sentData[selectedSentIdx];
                    sendToQb.mutate({ lcincome_uq: row.unico, llready: false, llByReadyByDate: false });
                  }},
                  { label: "Mark as Not Sent By Date", colorClass: "text-red-500", onClick: () => {
                    if(!selectedDate) return toast.error("Select a date first");
                    sendToQb.mutate({ lcincome_uq: selectedDate, llready: false, llByReadyByDate: true });
                  }}
                ]} 
              />
              <TabTable
                showToolbar
                loading={loadingSent}
                rows={sentData}
                selectedIdx={selectedSentIdx}
                onSelectIdx={setSelectedSentIdx}
                empty={selectedDate ? "No data sent for this date" : "Select a date"}
                columns={[
                  { key: "in_number", label: "Payment No" },
                  { key: "customer", label: "Customer" },
                  { key: "bank_doc", label: "Bank Doc" },
                  { key: "payment_method", label: "Pay Method" },
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


