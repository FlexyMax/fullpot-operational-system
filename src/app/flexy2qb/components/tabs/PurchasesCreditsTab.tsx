"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { RefreshCcw, Calendar, Check, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { TabTable } from "../TabTable";
import { TopActionBar } from "../TopActionBar";
import { MobileActionBar } from "@/components/layout/MobileActionBar";
import { useFlexy2QBStore } from "@/store/flexy2qb/useFlexy2QBStore";
import { toast } from "sonner";

const EMPTY_ARR: any[] = [];
const SUB_TABS = [
    { id: "not-ready", label: "NOT READY" },
    { id: "ready", label: "READY TO QB" },
    { id: "sent", label: "SENT TO QB" },
] as const;

export default function PurchasesCreditsTab() {
    const { canWrite, refreshTrigger, triggerRefresh, activeGrid, setActiveGrid } = useFlexy2QBStore();
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [subTab, setSubTab] = useState<"not-ready" | "ready" | "sent">("not-ready");
    const [selNR, setSelNR] = useState<number | undefined>();
    const [selReady, setSelReady] = useState<number | undefined>();
    const [selSent, setSelSent] = useState<number | undefined>();

    const switchSubTab = (t: "not-ready" | "ready" | "sent") => {
        setSubTab(t); setSelNR(undefined); setSelReady(undefined); setSelSent(undefined); setActiveGrid(null);
    };

    const { data: years = EMPTY_ARR } = useQuery({
        queryKey: ["f2qb-pcr-years"],
        queryFn: async () => (await (await fetch("/api/flexy2qb/purchases-credits/years", { method: "POST", body: "{}" })).json()).data || [],
    });
    const { data: dates = EMPTY_ARR, isFetching: loadingDates } = useQuery({
        queryKey: ["f2qb-pcr-dates", selectedYear],
        queryFn: async () => (await (await fetch("/api/flexy2qb/purchases-credits/dates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lnYears: selectedYear }) })).json()).data || [],
        enabled: !!selectedYear,
    });
    const { data: notReady = EMPTY_ARR, isFetching: loadingNR } = useQuery({
        queryKey: ["f2qb-pcr-nr", selectedDate, refreshTrigger],
        queryFn: async () => (await (await fetch("/api/flexy2qb/purchases-credits/not-ready", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ldcr_date: selectedDate }) })).json()).data || [],
        enabled: !!selectedDate && subTab === "not-ready",
    });
    const { data: readyData = EMPTY_ARR, isFetching: loadingReady } = useQuery({
        queryKey: ["f2qb-pcr-ready", refreshTrigger],
        queryFn: async () => (await (await fetch("/api/flexy2qb/purchases-credits/ready", { method: "POST", body: "{}" })).json()).data || [],
        enabled: subTab === "ready",
    });
    const { data: sentData = EMPTY_ARR, isFetching: loadingSent } = useQuery({
        queryKey: ["f2qb-pcr-sent", selectedDate, refreshTrigger],
        queryFn: async () => (await (await fetch("/api/flexy2qb/purchases-credits/sent", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ldcr_date: selectedDate }) })).json()).data || [],
        enabled: !!selectedDate && subTab === "sent",
    });

    const onMutate = (res: any) => {
        if (res.error) toast.error(res.message || "Error"); else { toast.success(res.message || "Success"); triggerRefresh(); }
    };
    const markReady = useMutation({ mutationFn: async (p: any) => (await (await fetch("/api/flexy2qb/purchases-credits/update-ready", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p) })).json()), onSuccess: onMutate });
    const sendToQb = useMutation({ mutationFn: async (p: any) => (await (await fetch("/api/flexy2qb/purchases-credits/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p) })).json()), onSuccess: onMutate });

    const mobileItems = [
        { grid: "not-ready", label: "Mark Ready", icon: Check, color: "green", onClick: () => { if (selNR === undefined) return toast.error("Select a row"); markReady.mutate({ lccr_uq: notReady[selNR!]?.unico, llready: true }); }, disabled: !canWrite || selNR === undefined },
        { grid: "ready", label: "Send", icon: ArrowRight, color: "blue", onClick: () => { if (selReady === undefined) return toast.error("Select a row"); sendToQb.mutate({ lccr_uq: readyData[selReady!]?.unico, llready: true, llSendByDate: false }); }, disabled: !canWrite || selReady === undefined },
        { grid: "ready", label: "Unmark", icon: X, color: "red", onClick: () => { if (selReady === undefined) return toast.error("Select a row"); markReady.mutate({ lccr_uq: readyData[selReady!]?.unico, llready: false }); }, disabled: !canWrite || selReady === undefined },
    ];

    return (
        <div className="flex flex-col md:flex-row h-full gap-2">
            <div className="w-full md:w-[280px] flex flex-col gap-2 shrink-0 md:h-full h-36">
                <div className="hidden md:flex bg-white p-2 rounded-lg border border-gray-200 shadow-sm items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Year</span>
                    <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="bg-gray-100 border-none text-[11px] font-black rounded px-2 py-1 outline-none">
                        {years.map((y: any) => <option key={String(y.year || y.lnYear || Object.values(y)[0])} value={String(y.year || y.lnYear || Object.values(y)[0])}>{String(y.year || y.lnYear || Object.values(y)[0])}</option>)}
                    </select>
                </div>
                <div className="flex-1 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-0">
                    <div className="h-10 bg-[#374151] flex items-center justify-between px-3 shrink-0">
                        <div className="flex items-center gap-2"><Calendar size={13} className="text-[#FB7506]" /><span className="font-black text-[10px] uppercase tracking-widest text-white">Dates</span></div>
                        {loadingDates && <RefreshCcw size={10} className="text-gray-400 animate-spin" />}
                    </div>
                    <div className="overflow-y-auto flex-1">
                        <table className="min-w-full text-xs text-left">
                            <thead className="bg-gray-100 border-b text-gray-700 font-bold sticky top-0">
                                <tr><th className="p-2">Credit Date</th><th className="p-2 text-right">Credits</th></tr>
                            </thead>
                            <tbody>
                                {dates.map((d: any, i: number) => {
                                    const ds = d.cddate || d.cd_date;
                                    const active = selectedDate === ds;
                                    return <tr key={i} onClick={() => setSelectedDate(ds)} className={cn("border-b cursor-pointer transition-colors", active ? "!bg-blue-100 ring-2 ring-inset ring-blue-300" : "hover:bg-blue-50")}><td className="p-2 font-medium">{new Date(ds).toLocaleDateString("en-US")}</td><td className="p-2 text-right text-gray-500">{d.Credits || 0}</td></tr>;
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden min-h-0">
                <div className="bg-white border-b border-gray-200 flex items-end px-2 shrink-0 gap-0.5 h-9">
                    {SUB_TABS.map(t => (
                        <button key={t.id} onClick={() => switchSubTab(t.id as any)}
                            className={cn("px-3 h-full text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap", subTab === t.id ? "text-[#FB7506] border-b-2 border-[#FB7506]" : "text-gray-400 hover:text-gray-600")}>
                            {t.label}
                        </button>
                    ))}
                </div>

                <div className="flex-1 bg-[#f4f6f8] flex flex-col p-2 min-h-0">
                    {subTab === "not-ready" && (
                        <div className="flex flex-col h-full bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                            <div className="hidden md:block">
                                <TopActionBar disabled={!canWrite} title="Data in Flexymax Not Ready" actions={[
                                    { label: "Mark Ready", colorClass: "text-green-600", onClick: () => { if (selNR === undefined || !notReady[selNR]) return toast.error("Select a row first"); markReady.mutate({ lccr_uq: notReady[selNR].unico, llready: true }); } },
                                ]} />
                            </div>
                            <div className="md:hidden h-10 bg-[#374151] flex items-center px-3 shrink-0"><span className="text-white text-[11px] font-bold uppercase tracking-wide">Not Ready</span></div>
                            <TabTable showToolbar loading={loadingNR} rows={notReady} selectedIdx={selNR}
                                onSelectIdx={i => { const s = selNR === i; setSelNR(s ? undefined : i); setActiveGrid(s ? null : "not-ready"); }}
                                empty={selectedDate ? "No pending data" : "Select a date"} columns={[{ key: "invoice_no", label: "Invoice" }, { key: "grower", label: "Grower" }, { key: "cr_amount", label: "Amount", className: "text-right font-semibold" }]} />
                        </div>
                    )}
                    {subTab === "ready" && (
                        <div className="flex flex-col h-full bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                            <div className="hidden md:block">
                                <TopActionBar disabled={!canWrite} title="Data Ready To QBooks" actions={[
                                    { label: "Send to QB", colorClass: "text-blue-600", onClick: () => { if (selReady === undefined || !readyData[selReady]) return toast.error("Select a row first"); sendToQb.mutate({ lccr_uq: readyData[selReady].unico, llready: true, llSendByDate: false }); } },
                                    { label: "Unmark Ready", colorClass: "text-red-500", onClick: () => { if (selReady === undefined || !readyData[selReady]) return toast.error("Select a row first"); markReady.mutate({ lccr_uq: readyData[selReady].unico, llready: false }); } },
                                ]} />
                            </div>
                            <div className="md:hidden h-10 bg-[#374151] flex items-center px-3 shrink-0"><span className="text-white text-[11px] font-bold uppercase tracking-wide">Ready to QB</span></div>
                            <TabTable showToolbar loading={loadingReady} rows={readyData} selectedIdx={selReady}
                                onSelectIdx={i => { const s = selReady === i; setSelReady(s ? undefined : i); setActiveGrid(s ? null : "ready"); }}
                                empty="No data ready" columns={[{ key: "invoice_no", label: "Invoice" }, { key: "grower", label: "Grower" }, { key: "cr_amount", label: "Amount", className: "text-right font-semibold" }]} />
                        </div>
                    )}
                    {subTab === "sent" && (
                        <div className="flex flex-col h-full bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                            <div className="hidden md:block">
                                <TopActionBar disabled={!canWrite} title="Data Sent To QBooks" actions={[]} />
                            </div>
                            <div className="md:hidden h-10 bg-[#374151] flex items-center px-3 shrink-0"><span className="text-white text-[11px] font-bold uppercase tracking-wide">Sent to QB</span></div>
                            <TabTable showToolbar loading={loadingSent} rows={sentData} selectedIdx={selSent}
                                onSelectIdx={i => { const s = selSent === i; setSelSent(s ? undefined : i); setActiveGrid(s ? null : "sent"); }}
                                empty={selectedDate ? "No data sent" : "Select a date"} columns={[{ key: "invoice_no", label: "Invoice" }, { key: "grower", label: "Grower" }, { key: "cr_amount", label: "Amount", className: "text-right font-semibold" }]} />
                        </div>
                    )}
                </div>
            </div>

            <MobileActionBar activeGrid={activeGrid} items={mobileItems} onClearSelection={() => { setActiveGrid(null); setSelNR(undefined); setSelReady(undefined); setSelSent(undefined); }} />
        </div>
    );
}
