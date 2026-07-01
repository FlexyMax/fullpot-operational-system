"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Calendar, Check, X, ArrowRight, RotateCcw, Clock, CheckCircle2, CheckCheck, Download, ClipboardList } from "lucide-react";
import { MobileDateCalendar } from "@/components/ui/MobileDateCalendar";
import { cn } from "@/lib/utils";
import PanelGrid from "@/components/ui/PanelGrid";
import { PanelGridTable, PanelGridThead, PanelGridTh, PanelGridTbody, PanelGridTr, PanelGridTd } from "@/components/ui/PanelGridTable";
import { MobileActionBar } from "@/components/layout/MobileActionBar";
import { useFlexy2QBStore } from "@/store/flexy2qb/useFlexy2QBStore";
import { useAuditLog } from "@/lib/audit";
import { normalizeToISODate } from "@/lib/dates";
import { toast } from "sonner";
import { LogRecordModal } from "@/app/flexy2qb/components/modals/LogRecordModal";
import { downloadCSV } from "@/lib/csv";

const EMPTY_ARR: any[] = [];
const SUB_TABS = [
    { id: "not-ready", label: "NOT READY" },
    { id: "ready",     label: "READY TO QB" },
    { id: "sent",      label: "SENT TO QB" },
] as const;

const filterRows = (rows: any[], term: string) =>
    !term ? rows : rows.filter((r: any) => Object.values(r).some(v => String(v ?? "").toLowerCase().includes(term.toLowerCase())));

const fmtDate = (v: any) => {
    if (!v) return "";
    const iso = normalizeToISODate(v);
    if (!iso) return String(v);
    const [y, m, d] = iso.split("-");
    return `${m}/${d}/${y}`;
};

export default function Purchases2QBTab() {
    const { canWrite, refreshTrigger, triggerRefresh, activeGrid, setActiveGrid } = useFlexy2QBStore();
    const { logAction } = useAuditLog("flexy2qb", "flexy_to_qb");
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [subTab, setSubTab] = useState<"not-ready" | "ready" | "sent">("not-ready");
    const [selNR, setSelNR] = useState<number | undefined>();
    const [selReady, setSelReady] = useState<number | undefined>();
    const [selSent, setSelSent] = useState<number | undefined>();
    const [searchNR, setSearchNR] = useState("");
    const [searchReady, setSearchReady] = useState("");
    const [searchSent, setSearchSent] = useState("");
    const [logId, setLogId] = useState<string | null>(null);

    const switchSubTab = (t: "not-ready" | "ready" | "sent") => {
        setSubTab(t); setSelNR(undefined); setSelReady(undefined); setSelSent(undefined);
        setActiveGrid(null); setSearchNR(""); setSearchReady(""); setSearchSent("");
    };

    const { data: years = EMPTY_ARR } = useQuery({ queryKey: ["f2qb-purch-years"], queryFn: async () => (await (await fetch("/api/flexy2qb/purchases/years", { method: "POST", body: "{}" })).json()).data || [] });
    const { data: dates = EMPTY_ARR, isFetching: loadingDates } = useQuery({ queryKey: ["f2qb-purch-dates", selectedYear, refreshTrigger], queryFn: async () => (await (await fetch("/api/flexy2qb/purchases/dates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lnYear: selectedYear }) })).json()).data || [], enabled: !!selectedYear });
    const { data: notReady = EMPTY_ARR, isFetching: loadingNR } = useQuery({ queryKey: ["f2qb-purch-nr", selectedDate, refreshTrigger], queryFn: async () => (await (await fetch("/api/flexy2qb/purchases/not-ready", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ldawb_date: selectedDate, pageNo: 1, pageSize: 500 }) })).json()).data || [], enabled: !!selectedDate && subTab === "not-ready" });
    const { data: readyData = EMPTY_ARR, isFetching: loadingReady } = useQuery({ queryKey: ["f2qb-purch-ready", refreshTrigger], queryFn: async () => (await (await fetch("/api/flexy2qb/purchases/ready", { method: "POST", body: "{}" })).json()).data || [], enabled: subTab === "ready" });
    const { data: sentData = EMPTY_ARR, isFetching: loadingSent } = useQuery({ queryKey: ["f2qb-purch-sent", selectedDate, refreshTrigger], queryFn: async () => (await (await fetch("/api/flexy2qb/purchases/sent", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ldawb_date: selectedDate }) })).json()).data || [], enabled: !!selectedDate && subTab === "sent" });
    const { data: tpoData = EMPTY_ARR } = useQuery({ queryKey: ["f2qb-purch-tpo", refreshTrigger], queryFn: async () => (await (await fetch("/api/flexy2qb/purchases/tpo", { method: "POST", body: "{}" })).json()).data || [], enabled: subTab === "ready" });

    const fNR    = useMemo(() => filterRows(notReady, searchNR),    [notReady, searchNR]);
    const fReady = useMemo(() => filterRows(readyData, searchReady), [readyData, searchReady]);
    const fSent  = useMemo(() => filterRows(sentData, searchSent),   [sentData, searchSent]);

    // Reset date when year changes
    useEffect(() => { setSelectedDate(null); }, [selectedYear]);

    // Auto-select first date when dates load
    useEffect(() => {
        if (dates.length > 0 && !selectedDate) {
            const first = dates[0];
            const ds = first.awbdate || first.awb_date;
            setSelectedDate(normalizeToISODate(ds) || ds);
        }
    }, [dates]);

    // Auto-select first record in each sub-tab
    useEffect(() => {
        if (subTab === "not-ready" && notReady.length > 0 && selNR === undefined) {
            setSelNR(0); setActiveGrid("not-ready");
        }
    }, [notReady, subTab]);
    useEffect(() => {
        if (subTab === "ready" && readyData.length > 0 && selReady === undefined) {
            setSelReady(0); setActiveGrid("ready");
        }
    }, [readyData, subTab]);
    useEffect(() => {
        if (subTab === "sent" && sentData.length > 0 && selSent === undefined) {
            setSelSent(0); setActiveGrid("sent");
        }
    }, [sentData, subTab]);

    const onMutate = (res: any) => {
        if (!res.success) toast.error(res.error || "Error");
        else { toast.success(res.message || "Success"); triggerRefresh(); logAction("Edit", res.unico || ""); }
    };
    const markReady        = useMutation({ mutationFn: async (p: any) => (await (await fetch("/api/flexy2qb/purchases/update-ready",         { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p) })).json()), onSuccess: onMutate });
    const markReadyByDate   = useMutation({ mutationFn: async (p: any) => (await (await fetch("/api/flexy2qb/purchases/update-ready-date",    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p) })).json()), onSuccess: onMutate });
    const markReadyInvoice  = useMutation({ mutationFn: async (p: any) => (await (await fetch("/api/flexy2qb/purchases/update-ready-invoice", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p) })).json()), onSuccess: onMutate });
    const sendToQb          = useMutation({ mutationFn: async (p: any) => (await (await fetch("/api/flexy2qb/purchases/send",                 { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p) })).json()), onSuccess: onMutate });

    const downloadTPO   = () => { if (!tpoData.length)   { toast.error("No TPO data ready");   return; } downloadCSV(tpoData,   "Bills2TPO.csv"); };
    const downloadReady = () => { if (!readyData.length) { toast.error("No ready data");       return; } downloadCSV(readyData, "PurchasesReady2QB.csv"); };

    const yrOpts: { v: string }[] = years.map((y: any) => { const v = String(y.year || y.lnYear || Object.values(y)[0]); return { v }; });

    const mobileItems = [
        { grid: "not-ready", label: "Ready",     icon: Check,      color: "green", onClick: () => { if (selNR === undefined) return toast.error("Select a row"); markReadyInvoice.mutate({ lcpacking_uq: notReady[selNR!]?.pack_uq, llready: true }); },                                                         disabled: !canWrite || selNR === undefined },
        { grid: "not-ready", label: "By Date",   icon: Calendar,   color: "green", onClick: () => { if (!selectedDate) return toast.error("Select a date"); markReadyByDate.mutate({ ldAwbDate: selectedDate, llready: true }); },                                                                               disabled: !canWrite || !selectedDate },
        { grid: "ready",     label: "Not Ready", icon: X,          color: "red",   onClick: () => { if (selReady === undefined) return toast.error("Select a row"); markReadyInvoice.mutate({ lcpacking_uq: readyData[selReady!]?.packing_uq, llready: false }); },                                              disabled: !canWrite || selReady === undefined },
        { grid: "ready",     label: "By Date",   icon: Calendar,   color: "red",   onClick: () => { if (selReady === undefined) return toast.error("Select a row"); const d = readyData[selReady!]?.awbdate || readyData[selReady!]?.awb_date; if (!d) return toast.error("AWB date not in record"); markReadyByDate.mutate({ ldAwbDate: d, llready: false }); }, disabled: !canWrite || selReady === undefined },
        { grid: "ready",     label: "Send",      icon: ArrowRight, color: "blue",  onClick: () => { if (selReady === undefined) return toast.error("Select a row"); sendToQb.mutate({ lcawbcode_aux: readyData[selReady!]?.awbcode, llready: true, llByReadyByDate: false }); },                                 disabled: !canWrite || selReady === undefined },
        { grid: "ready",     label: "Send Date", icon: Calendar,   color: "blue",  onClick: () => { if (!selectedDate) return toast.error("Select a date"); sendToQb.mutate({ lcawbcode_aux: null, llready: true, llByReadyByDate: true }); },                                                                   disabled: !canWrite || !selectedDate },
        { grid: "sent",      label: "Not Sent",  icon: RotateCcw,  color: "red",   onClick: () => { if (selSent === undefined) return toast.error("Select a row"); sendToQb.mutate({ lcawbcode_aux: sentData[selSent!]?.awbcode, llready: false, llByReadyByDate: false }); },                                   disabled: !canWrite || selSent === undefined },
        { grid: "sent",      label: "By Date",   icon: Calendar,   color: "red",   onClick: () => { if (!selectedDate) return toast.error("Select a date"); sendToQb.mutate({ lcawbcode_aux: null, llready: false, llByReadyByDate: true }); },                                                                  disabled: !canWrite || !selectedDate },
    ];

    return (
        <div className="flex flex-col md:flex-row h-full gap-2">
            <div className="md:hidden mb-1">
                <MobileDateCalendar
                    dates={dates}
                    dateGetter={row => row.awbdate || row.date_invo}
                    countGetter={row => row.AWBills || 0}
                    selectedDate={selectedDate}
                    onSelect={setSelectedDate}
                    selectedYear={selectedYear}
                    yearOptions={yrOpts}
                    onYearChange={setSelectedYear}
                    loading={loadingDates}
                />
            </div>
            <div className="hidden md:flex md:w-[220px] shrink-0 md:h-full flex-col">
                <PanelGrid title="Dates" icon={Calendar} refreshing={loadingDates}
                    headerRight={<select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}
                        className="bg-white text-gray-700 border border-gray-300 text-[10px] font-black rounded px-2 py-1 outline-none">
                        {yrOpts.map((y: { v: string }) => <option key={y.v} value={y.v}>{y.v}</option>)}
                    </select>}
                    className="flex-1 flex flex-col min-h-0">
                    <PanelGridTable>
                        <PanelGridThead><PanelGridTh>AWB Date</PanelGridTh><PanelGridTh align="right">Bills</PanelGridTh></PanelGridThead>
                        <PanelGridTbody>
                            {dates.map((d: any, i: number) => {
                                const ds = d.awbdate || d.awb_date;
                                const norm = normalizeToISODate(ds) || ds;
                                return <PanelGridTr key={i} selected={selectedDate === norm} onClick={() => setSelectedDate(norm)}>
                                    <PanelGridTd>{fmtDate(ds)}</PanelGridTd>
                                    <PanelGridTd align="right">{d.AWBills || d.records || 0}</PanelGridTd>
                                </PanelGridTr>;
                            })}
                        </PanelGridTbody>
                    </PanelGridTable>
                </PanelGrid>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                <div className="bg-white border-b border-gray-200 flex items-end px-2 shrink-0 gap-0.5 h-11 md:h-9">
                    {SUB_TABS.map(t => (
                        <button key={t.id} onClick={() => switchSubTab(t.id as any)}
                            className={cn("px-4 md:px-3 h-full text-[11px] md:text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                subTab === t.id ? "text-[#FB7506] border-b-2 border-[#FB7506]" : "text-gray-400 hover:text-gray-600")}>
                            {t.label}
                        </button>
                    ))}
                </div>
                <div className="flex-1 overflow-hidden p-1.5 bg-[#f4f6f8] min-h-0">
                    {subTab === "not-ready" && (
                        <PanelGrid title="Not Ready" icon={Clock} recordCount={fNR.length} refreshing={loadingNR}
                            searchValue={searchNR} onSearchChange={setSearchNR}
                            onRefresh={triggerRefresh}
                            onLog={() => { if (selNR === undefined || !notReady[selNR]) return toast.error("Select a row first"); setLogId(notReady[selNR].pack_uq || notReady[selNR].unico); }}
                            menuItems={[
                                { label: "Ready By Invoice", icon: Check, color: "green", onClick: () => { if (selNR === undefined || !notReady[selNR]) return toast.error("Select a row first"); markReadyInvoice.mutate({ lcpacking_uq: notReady[selNR].pack_uq, llready: true }); }, disabled: !canWrite || selNR === undefined },
                                { label: "Ready By Date", icon: Calendar, color: "green", onClick: () => { if (!selectedDate) return toast.error("Select a date first"); markReadyByDate.mutate({ ldAwbDate: selectedDate, llready: true }); }, disabled: !canWrite || !selectedDate },
                            ]}
                            className="h-full flex flex-col">
                            <PanelGridTable>
                                <PanelGridThead><PanelGridTh>AWB Code</PanelGridTh><PanelGridTh>Grower</PanelGridTh><PanelGridTh>Invoice</PanelGridTh><PanelGridTh align="right">Units</PanelGridTh><PanelGridTh align="right">Cost</PanelGridTh></PanelGridThead>
                                <PanelGridTbody>
                                    {loadingNR ? <tr><td colSpan={5} className="p-8 text-center text-xs text-gray-400">Loading...</td></tr>
                                    : fNR.length === 0 ? <tr><td colSpan={5} className="p-8 text-center text-xs text-gray-400 italic">{selectedDate ? "No pending data" : "Select a date"}</td></tr>
                                    : fNR.map((row: any, i: number) => (
                                        <PanelGridTr key={i} selected={selNR === i} onClick={() => { const s = selNR === i; setSelNR(s ? undefined : i); setActiveGrid(s ? null : "not-ready"); }}>
                                            <PanelGridTd className="font-mono font-semibold text-[#FB7506]">{row.awbcode}</PanelGridTd><PanelGridTd>{row.grower}</PanelGridTd><PanelGridTd className="font-mono font-semibold text-[#FB7506]">{row.invoice_no}</PanelGridTd><PanelGridTd align="right">{row.total_units}</PanelGridTd><PanelGridTd align="right">{row.total_cost}</PanelGridTd>
                                        </PanelGridTr>
                                    ))}
                                </PanelGridTbody>
                            </PanelGridTable>
                        </PanelGrid>
                    )}
                    {subTab === "ready" && (
                        <PanelGrid title="Ready to QB" icon={CheckCircle2} recordCount={fReady.length} refreshing={loadingReady}
                            searchValue={searchReady} onSearchChange={setSearchReady}
                            onRefresh={triggerRefresh}
                            onLog={() => { if (selReady === undefined || !readyData[selReady]) return toast.error("Select a row first"); setLogId(readyData[selReady].packing_uq || readyData[selReady].unico); }}
                            headerRight={<><button onClick={downloadTPO} className="text-green-600 hover:text-green-500 transition-all p-1" title="Download TPO CSV (Bills2TPO)"><Download size={16} /></button><button onClick={downloadReady} className="text-gray-400 hover:text-[#FB7506] transition-all p-1" title="Download CSV"><Download size={16} /></button></>}
                            menuItems={[
                                { label: "Invoice Mark as Not Ready", icon: X, color: "red", onClick: () => { if (selReady === undefined || !readyData[selReady]) return toast.error("Select a row first"); markReadyInvoice.mutate({ lcpacking_uq: readyData[selReady].packing_uq, llready: false }); }, disabled: !canWrite || selReady === undefined },
                                { label: "Mark as Not Ready By Date", icon: Calendar, color: "red", onClick: () => { if (selReady === undefined || !readyData[selReady]) return toast.error("Select a row first"); const d = readyData[selReady].awbdate || readyData[selReady].awb_date; if (!d) return toast.error("AWB date not in record"); markReadyByDate.mutate({ ldAwbDate: d, llready: false }); }, disabled: !canWrite || selReady === undefined },
                                { separator: true },
                                { label: "Send By Invoice", icon: ArrowRight, color: "blue", onClick: () => { if (selReady === undefined || !readyData[selReady]) return toast.error("Select a row first"); sendToQb.mutate({ lcawbcode_aux: readyData[selReady].awbcode, llready: true, llByReadyByDate: false }); }, disabled: !canWrite || selReady === undefined },
                                { label: "Send By Date", icon: Calendar, color: "blue", onClick: () => { if (!selectedDate) return toast.error("Select a date first"); sendToQb.mutate({ lcawbcode_aux: null, llready: true, llByReadyByDate: true }); }, disabled: !canWrite || !selectedDate },
                            ]}
                            className="h-full flex flex-col">
                            <PanelGridTable>
                                <PanelGridThead><PanelGridTh>AWB Code</PanelGridTh><PanelGridTh>Vendor</PanelGridTh><PanelGridTh>Bill No</PanelGridTh><PanelGridTh align="right">Amount</PanelGridTh></PanelGridThead>
                                <PanelGridTbody>
                                    {loadingReady ? <tr><td colSpan={4} className="p-8 text-center text-xs text-gray-400">Loading...</td></tr>
                                    : fReady.length === 0 ? <tr><td colSpan={4} className="p-8 text-center text-xs text-gray-400 italic">No data ready</td></tr>
                                    : fReady.map((row: any, i: number) => (
                                        <PanelGridTr key={i} selected={selReady === i} onClick={() => { const s = selReady === i; setSelReady(s ? undefined : i); setActiveGrid(s ? null : "ready"); }}>
                                            <PanelGridTd className="font-mono font-semibold text-[#FB7506]">{row.awbcode}</PanelGridTd><PanelGridTd>{row.Vendor}</PanelGridTd><PanelGridTd className="font-mono font-semibold text-[#FB7506]">{row.Bill_No}</PanelGridTd><PanelGridTd align="right">{row.Amount}</PanelGridTd>
                                        </PanelGridTr>
                                    ))}
                                </PanelGridTbody>
                            </PanelGridTable>
                        </PanelGrid>
                    )}
                    {subTab === "sent" && (
                        <PanelGrid title="Sent to QB" icon={CheckCheck} recordCount={fSent.length} refreshing={loadingSent}
                            searchValue={searchSent} onSearchChange={setSearchSent}
                            onRefresh={triggerRefresh}
                            onLog={() => { if (selSent === undefined || !sentData[selSent]) return toast.error("Select a row first"); setLogId(sentData[selSent].pack_uq || sentData[selSent].unico); }}
                            menuItems={[
                                { label: "Mark as Not Sent", icon: RotateCcw, color: "red", onClick: () => { if (selSent === undefined || !sentData[selSent]) return toast.error("Select a row first"); sendToQb.mutate({ lcawbcode_aux: sentData[selSent].awbcode, llready: false, llByReadyByDate: false }); }, disabled: !canWrite || selSent === undefined },
                                { label: "Mark as Not Sent By Date", icon: Calendar, color: "red", onClick: () => { if (!selectedDate) return toast.error("Select a date first"); sendToQb.mutate({ lcawbcode_aux: null, llready: false, llByReadyByDate: true }); }, disabled: !canWrite || !selectedDate },
                            ]}
                            className="h-full flex flex-col">
                            <PanelGridTable>
                                <PanelGridThead><PanelGridTh>AWB Code</PanelGridTh><PanelGridTh>Grower</PanelGridTh><PanelGridTh>Invoice</PanelGridTh><PanelGridTh align="right">Cost</PanelGridTh></PanelGridThead>
                                <PanelGridTbody>
                                    {loadingSent ? <tr><td colSpan={4} className="p-8 text-center text-xs text-gray-400">Loading...</td></tr>
                                    : fSent.length === 0 ? <tr><td colSpan={4} className="p-8 text-center text-xs text-gray-400 italic">{selectedDate ? "No data sent" : "Select a date"}</td></tr>
                                    : fSent.map((row: any, i: number) => (
                                        <PanelGridTr key={i} selected={selSent === i} onClick={() => { const s = selSent === i; setSelSent(s ? undefined : i); setActiveGrid(s ? null : "sent"); }}>
                                            <PanelGridTd className="font-mono font-semibold text-[#FB7506]">{row.awbcode}</PanelGridTd><PanelGridTd>{row.grower}</PanelGridTd><PanelGridTd className="font-mono font-semibold text-[#FB7506]">{row.invoice_no}</PanelGridTd><PanelGridTd align="right">{row.total_cost}</PanelGridTd>
                                        </PanelGridTr>
                                    ))}
                                </PanelGridTbody>
                            </PanelGridTable>
                        </PanelGrid>
                    )}
                </div>
            </div>

            <MobileActionBar activeGrid={activeGrid} items={mobileItems} onClearSelection={() => { setActiveGrid(null); setSelNR(undefined); setSelReady(undefined); setSelSent(undefined); }} />
            <LogRecordModal recordId={logId} onClose={() => setLogId(null)} />
        </div>
    );
}
