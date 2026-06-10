"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Calendar, Check, X, ArrowRight, Clock, CheckCircle2, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import PanelGrid from "@/components/ui/PanelGrid";
import { PanelGridTable, PanelGridThead, PanelGridTh, PanelGridTbody, PanelGridTr, PanelGridTd } from "@/components/ui/PanelGridTable";
import { MobileActionBar } from "@/components/layout/MobileActionBar";
import { useFlexy2QBStore } from "@/store/flexy2qb/useFlexy2QBStore";
import { toast } from "sonner";

const EMPTY_ARR: any[] = [];
const SUB_TABS = [
    { id: "not-ready", label: "NOT READY" },
    { id: "ready",     label: "READY TO QB" },
    { id: "sent",      label: "SENT TO QB" },
] as const;

const filterRows = (rows: any[], term: string) =>
    !term ? rows : rows.filter((r: any) => Object.values(r).some(v => String(v ?? "").toLowerCase().includes(term.toLowerCase())));

export default function PurchasesOChargesTab() {
    const { canWrite, refreshTrigger, triggerRefresh, activeGrid, setActiveGrid } = useFlexy2QBStore();
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [subTab, setSubTab] = useState<"not-ready" | "ready" | "sent">("not-ready");
    const [selNR, setSelNR] = useState<number | undefined>();
    const [selReady, setSelReady] = useState<number | undefined>();
    const [selSent, setSelSent] = useState<number | undefined>();
    const [searchNR, setSearchNR] = useState("");
    const [searchReady, setSearchReady] = useState("");
    const [searchSent, setSearchSent] = useState("");

    const switchSubTab = (t: "not-ready" | "ready" | "sent") => {
        setSubTab(t); setSelNR(undefined); setSelReady(undefined); setSelSent(undefined);
        setActiveGrid(null); setSearchNR(""); setSearchReady(""); setSearchSent("");
    };

    const { data: years = EMPTY_ARR } = useQuery({ queryKey: ["f2qb-och-years"], queryFn: async () => (await (await fetch("/api/flexy2qb/ocharges/years", { method: "POST", body: "{}" })).json()).data || [] });
    const { data: dates = EMPTY_ARR, isFetching: loadingDates } = useQuery({ queryKey: ["f2qb-och-dates", selectedYear], queryFn: async () => (await (await fetch("/api/flexy2qb/ocharges/dates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lnYears: selectedYear }) })).json()).data || [], enabled: !!selectedYear });
    const { data: notReady = EMPTY_ARR, isFetching: loadingNR } = useQuery({ queryKey: ["f2qb-och-nr", selectedDate, refreshTrigger], queryFn: async () => (await (await fetch("/api/flexy2qb/ocharges/not-ready", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ldawb_date: selectedDate }) })).json()).data || [], enabled: !!selectedDate && subTab === "not-ready" });
    const { data: readyData = EMPTY_ARR, isFetching: loadingReady } = useQuery({ queryKey: ["f2qb-och-ready", refreshTrigger], queryFn: async () => (await (await fetch("/api/flexy2qb/ocharges/ready", { method: "POST", body: "{}" })).json()).data || [], enabled: subTab === "ready" });
    const { data: sentData = EMPTY_ARR, isFetching: loadingSent } = useQuery({ queryKey: ["f2qb-och-sent", selectedDate, refreshTrigger], queryFn: async () => (await (await fetch("/api/flexy2qb/ocharges/sent", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ldawb_date: selectedDate }) })).json()).data || [], enabled: !!selectedDate && subTab === "sent" });

    const fNR    = useMemo(() => filterRows(notReady, searchNR),    [notReady, searchNR]);
    const fReady = useMemo(() => filterRows(readyData, searchReady), [readyData, searchReady]);
    const fSent  = useMemo(() => filterRows(sentData, searchSent),   [sentData, searchSent]);

    const onMutate = (res: any) => { if (res.error) toast.error(res.message || "Error"); else { toast.success(res.message || "Success"); triggerRefresh(); } };
    const markReady = useMutation({ mutationFn: async (p: any) => (await (await fetch("/api/flexy2qb/ocharges/update-ready", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p) })).json()), onSuccess: onMutate });
    const sendToQb  = useMutation({ mutationFn: async (p: any) => (await (await fetch("/api/flexy2qb/ocharges/send",         { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p) })).json()), onSuccess: onMutate });

    const yrOpts: { v: string }[] = years.map((y: any) => { const v = String(y.year || y.lnYear || Object.values(y)[0]); return { v }; });

    const mobileItems = [
        { grid: "not-ready", label: "Mark Ready", icon: Check,      color: "green", onClick: () => { if (selNR === undefined) return toast.error("Select a row"); markReady.mutate({ lcCharge_uq: notReady[selNR!]?.unico, llready: true, llUpdateByDate: false }); },                    disabled: !canWrite || selNR === undefined },
        { grid: "ready",     label: "Send",        icon: ArrowRight, color: "blue",  onClick: () => { if (selReady === undefined) return toast.error("Select a row"); sendToQb.mutate({ lcCharge_uq: readyData[selReady!]?.unico, llready: true, llByReadyByDate: false }); },              disabled: !canWrite || selReady === undefined },
        { grid: "ready",     label: "Unmark",      icon: X,          color: "red",   onClick: () => { if (selReady === undefined) return toast.error("Select a row"); markReady.mutate({ lcCharge_uq: readyData[selReady!]?.unico, llready: false, llUpdateByDate: false }); },             disabled: !canWrite || selReady === undefined },
    ];

    return (
        <div className="flex flex-col md:flex-row h-full gap-2">
            <div className="w-full md:w-[220px] shrink-0 md:h-full h-40 min-h-0 flex flex-col">
                <PanelGrid title="Dates" icon={Calendar} refreshing={loadingDates}
                    headerRight={<select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}
                        className="bg-white/10 text-white border border-white/20 text-[10px] font-black rounded px-2 py-1 outline-none">
                        {yrOpts.map((y: { v: string }) => <option key={y.v} value={y.v}>{y.v}</option>)}
                    </select>}
                    className="flex-1 flex flex-col min-h-0">
                    <PanelGridTable>
                        <PanelGridThead><PanelGridTh>AWB Date</PanelGridTh><PanelGridTh align="right">Charges</PanelGridTh></PanelGridThead>
                        <PanelGridTbody>
                            {dates.map((d: any, i: number) => {
                                const ds = d.awbdate || d.awb_date;
                                return <PanelGridTr key={i} selected={selectedDate === ds} onClick={() => setSelectedDate(ds)}>
                                    <PanelGridTd>{new Date(ds).toLocaleDateString("en-US")}</PanelGridTd>
                                    <PanelGridTd align="right">{d.AWBCharges || 0}</PanelGridTd>
                                </PanelGridTr>;
                            })}
                        </PanelGridTbody>
                    </PanelGridTable>
                </PanelGrid>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                <div className="bg-white border-b border-gray-200 flex items-end px-2 shrink-0 gap-0.5 h-9">
                    {SUB_TABS.map(t => (
                        <button key={t.id} onClick={() => switchSubTab(t.id as any)}
                            className={cn("px-3 h-full text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                subTab === t.id ? "text-[#FB7506] border-b-2 border-[#FB7506]" : "text-gray-400 hover:text-gray-600")}>
                            {t.label}
                        </button>
                    ))}
                </div>
                <div className="flex-1 overflow-hidden p-1.5 bg-[#f4f6f8] min-h-0">
                    {subTab === "not-ready" && (
                        <PanelGrid title="Not Ready" icon={Clock} recordCount={fNR.length} refreshing={loadingNR}
                            searchValue={searchNR} onSearchChange={setSearchNR}
                            menuItems={[
                                { label: "Mark Ready", icon: Check, color: "green", onClick: () => { if (selNR === undefined || !notReady[selNR]) return toast.error("Select a row first"); markReady.mutate({ lcCharge_uq: notReady[selNR].unico, llready: true, llUpdateByDate: false }); }, disabled: !canWrite || selNR === undefined },
                            ]}
                            className="h-full flex flex-col">
                            <PanelGridTable>
                                <PanelGridThead><PanelGridTh>AWB Code</PanelGridTh><PanelGridTh>Grower</PanelGridTh><PanelGridTh>Bill No</PanelGridTh><PanelGridTh align="right">Total</PanelGridTh></PanelGridThead>
                                <PanelGridTbody>
                                    {loadingNR ? <tr><td colSpan={4} className="p-8 text-center text-xs text-gray-400">Loading...</td></tr>
                                    : fNR.length === 0 ? <tr><td colSpan={4} className="p-8 text-center text-xs text-gray-400 italic">{selectedDate ? "No pending data" : "Select a date"}</td></tr>
                                    : fNR.map((row: any, i: number) => (
                                        <PanelGridTr key={i} selected={selNR === i} onClick={() => { const s = selNR === i; setSelNR(s ? undefined : i); setActiveGrid(s ? null : "not-ready"); }}>
                                            <PanelGridTd>{row.awbcode}</PanelGridTd><PanelGridTd>{row.grower}</PanelGridTd><PanelGridTd>{row.Bill_No}</PanelGridTd><PanelGridTd align="right">{row.total_invoice}</PanelGridTd>
                                        </PanelGridTr>
                                    ))}
                                </PanelGridTbody>
                            </PanelGridTable>
                        </PanelGrid>
                    )}
                    {subTab === "ready" && (
                        <PanelGrid title="Ready to QB" icon={CheckCircle2} recordCount={fReady.length} refreshing={loadingReady}
                            searchValue={searchReady} onSearchChange={setSearchReady}
                            menuItems={[
                                { label: "Send to QB", icon: ArrowRight, color: "blue", onClick: () => { if (selReady === undefined || !readyData[selReady]) return toast.error("Select a row first"); sendToQb.mutate({ lcCharge_uq: readyData[selReady].unico, llready: true, llByReadyByDate: false }); }, disabled: !canWrite || selReady === undefined },
                                { label: "Unmark Ready", icon: X, color: "red", onClick: () => { if (selReady === undefined || !readyData[selReady]) return toast.error("Select a row first"); markReady.mutate({ lcCharge_uq: readyData[selReady].unico, llready: false, llUpdateByDate: false }); }, disabled: !canWrite || selReady === undefined },
                            ]}
                            className="h-full flex flex-col">
                            <PanelGridTable>
                                <PanelGridThead><PanelGridTh>AWB Code</PanelGridTh><PanelGridTh>Vendor</PanelGridTh><PanelGridTh>Bill No</PanelGridTh><PanelGridTh align="right">Amount</PanelGridTh></PanelGridThead>
                                <PanelGridTbody>
                                    {loadingReady ? <tr><td colSpan={4} className="p-8 text-center text-xs text-gray-400">Loading...</td></tr>
                                    : fReady.length === 0 ? <tr><td colSpan={4} className="p-8 text-center text-xs text-gray-400 italic">No data ready</td></tr>
                                    : fReady.map((row: any, i: number) => (
                                        <PanelGridTr key={i} selected={selReady === i} onClick={() => { const s = selReady === i; setSelReady(s ? undefined : i); setActiveGrid(s ? null : "ready"); }}>
                                            <PanelGridTd>{row.AWBCode}</PanelGridTd><PanelGridTd>{row.Vendor}</PanelGridTd><PanelGridTd>{row.Bill_No}</PanelGridTd><PanelGridTd align="right">{row.Amount}</PanelGridTd>
                                        </PanelGridTr>
                                    ))}
                                </PanelGridTbody>
                            </PanelGridTable>
                        </PanelGrid>
                    )}
                    {subTab === "sent" && (
                        <PanelGrid title="Sent to QB" icon={CheckCheck} recordCount={fSent.length} refreshing={loadingSent}
                            searchValue={searchSent} onSearchChange={setSearchSent}
                            className="h-full flex flex-col">
                            <PanelGridTable>
                                <PanelGridThead><PanelGridTh>AWB Code</PanelGridTh><PanelGridTh>Grower</PanelGridTh><PanelGridTh>Bill No</PanelGridTh><PanelGridTh align="right">Total</PanelGridTh></PanelGridThead>
                                <PanelGridTbody>
                                    {loadingSent ? <tr><td colSpan={4} className="p-8 text-center text-xs text-gray-400">Loading...</td></tr>
                                    : fSent.length === 0 ? <tr><td colSpan={4} className="p-8 text-center text-xs text-gray-400 italic">{selectedDate ? "No data sent" : "Select a date"}</td></tr>
                                    : fSent.map((row: any, i: number) => (
                                        <PanelGridTr key={i} selected={selSent === i} onClick={() => { const s = selSent === i; setSelSent(s ? undefined : i); setActiveGrid(s ? null : "sent"); }}>
                                            <PanelGridTd>{row.awbcode}</PanelGridTd><PanelGridTd>{row.grower}</PanelGridTd><PanelGridTd>{row.Bill_No}</PanelGridTd><PanelGridTd align="right">{row.total_invoice}</PanelGridTd>
                                        </PanelGridTr>
                                    ))}
                                </PanelGridTbody>
                            </PanelGridTable>
                        </PanelGrid>
                    )}
                </div>
            </div>

            <MobileActionBar activeGrid={activeGrid} items={mobileItems} onClearSelection={() => { setActiveGrid(null); setSelNR(undefined); setSelReady(undefined); setSelSent(undefined); }} />
        </div>
    );
}
