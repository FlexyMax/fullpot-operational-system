"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    RefreshCcw, CreditCard, Minus, Plus, Pencil, Trash2,
    Search, Printer, GitMerge, History, CalendarDays,
    Building2, List
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { AuditLogModal } from "@/components/AuditLogModal";
import { useAuditLog } from "@/lib/audit";
import { usePagePermissions, PERMISSION_MSGS } from "@/lib/permissions";
import { useVendorCrDbStore } from "@/store/useVendorCrDbStore";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import PanelGrid from "@/components/ui/PanelGrid";
import {
    PanelGridTable, PanelGridThead, PanelGridTh,
    PanelGridTbody, PanelGridTr, PanelGridTd,
} from "@/components/ui/PanelGridTable";
import { formatDateEST, formatMoney, todayEST, normalizeToISODate } from "@/lib/dates";

const EMPTY_ARR: any[] = [];

const apiFetch = async (url: string) => {
    const r = await fetch(url);
    const j = await r.json();
    if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`);
    return j;
};

const apiPost = async (url: string, body: any) => {
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json();
    if (!j.success) throw new Error(j.error || "Error");
    return j;
};
const apiPut = async (url: string, body: any) => {
    const r = await fetch(url, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json();
    if (!j.success) throw new Error(j.error || "Error");
    return j;
};
const apiDelete = async (url: string) => {
    const r = await fetch(url, { method: "DELETE" });
    const j = await r.json();
    if (!j.success) throw new Error(j.error || "Error");
    return j;
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function VendorCreditDebitsPage() {
    const { status } = useSession();
    const router = useRouter();
    const qc = useQueryClient();
    const { logAction } = useAuditLog("vendor-credits-debits", "flower_accounts_pay_crdb");
    const perms = usePagePermissions("vendor-credits-debits");

    const {
        activeTab, setActiveTab,
        selectedDate, setSelectedDate,
        selectedGrowerUq, setSelectedGrowerUq,
        selectedUnico, setSelectedUnico,
        historyGrowerUq, setHistoryGrowerUq,
        historyFrom, setHistoryFrom,
        historyTo, setHistoryTo,
    } = useVendorCrDbStore();

    const [crdbModal,          setCrdbModal]          = useState<{ open: boolean; mode: "Add" | "Edit" | "Delete"; type: "C" | "D" } | null>(null);
    const [editRow,            setEditRow]            = useState<any>(null);
    const [searchModal,        setSearchModal]        = useState(false);
    const [splitModal,         setSplitModal]         = useState(false);
    const [auditOpen,          setAuditOpen]          = useState(false);
    const [selRow,             setSelRow]             = useState<any>(null);
    const [selHistRow,         setSelHistRow]         = useState<any>(null);
    const [historyVendorFilter, setHistoryVendorFilter] = useState<string>("");

    useEffect(() => { if (status === "unauthenticated") router.push("/login"); }, [status, router]);

    // ── Queries ──────────────────────────────────────────────────────────────
    const { data: dates = EMPTY_ARR, isFetching: loadingDates, refetch: refetchDates } = useQuery({
        queryKey: ["vcrdb-dates"],
        queryFn:  () => apiFetch("/api/vendor-credits-debits/dates"),
    });

    const { data: vendors = EMPTY_ARR, isFetching: loadingVendors } = useQuery({
        queryKey: ["vcrdb-vendors", selectedDate],
        queryFn:  () => apiFetch(`/api/vendor-credits-debits/vendors?date=${selectedDate}`),
        enabled:  !!selectedDate,
    });

    const { data: list = EMPTY_ARR, isFetching: loadingList, refetch: refetchList } = useQuery({
        queryKey: ["vcrdb-list", selectedDate, selectedGrowerUq],
        queryFn:  () => apiFetch(`/api/vendor-credits-debits/list?date=${selectedDate}&grower_uq=${selectedGrowerUq ?? ""}`),
        enabled:  !!selectedDate,
    });

    const { data: reasons = EMPTY_ARR } = useQuery({
        queryKey: ["vcrdb-reasons"],
        queryFn:  () => apiFetch("/api/vendor-credits-debits/reasons"),
    });

    // Always fetch ALL vendors for history — vendor filtering is done client-side from the results
    const { data: history = EMPTY_ARR, isFetching: loadingHistory, refetch: refetchHistory } = useQuery({
        queryKey: ["vcrdb-history", historyFrom, historyTo],
        queryFn:  () => apiFetch(`/api/vendor-credits-debits/history?grower_uq=&from=${historyFrom}&to=${historyTo}`),
        enabled:  activeTab === "history",
    });

    // Unique vendors from history results (SP returns grower name, not grower_uq — use name as key)
    const historyVendors = useMemo(() => {
        const seen = new Set<string>();
        for (const row of history) {
            const name = String(row.grower ?? row.farm ?? row.lcfarm ?? "").trim();
            if (name) seen.add(name);
        }
        return Array.from(seen).sort((a, b) => a.localeCompare(b));
    }, [history]);

    const filteredHistory = historyVendorFilter
        ? history.filter((row: any) => String(row.grower ?? row.farm ?? row.lcfarm ?? "").trim() === historyVendorFilter)
        : history;

    // ── Auto-selections ──────────────────────────────────────────────────────
    useEffect(() => { if (dates.length > 0 && !selectedDate) { const d = normalizeToISODate(dates[0].cd_date ?? dates[0].ldcd_date ?? Object.values(dates[0])[0]); setSelectedDate(d); } }, [dates]);
    useEffect(() => { if (list.length > 0) { setSelRow(list[0]); setSelectedUnico(list[0].unico ?? list[0].ap_uq ?? null); } else { setSelRow(null); setSelectedUnico(null); } }, [list]);

    // ── Mutations ────────────────────────────────────────────────────────────
    const insertMut = useMutation({
        mutationFn: (body: any) => apiPost("/api/vendor-credits-debits", body),
        onSuccess: (d) => {
            toast.success("Record added.");
            logAction("Insert", d.unico || "");
            qc.invalidateQueries({ queryKey: ["vcrdb-list"] });
            qc.invalidateQueries({ queryKey: ["vcrdb-dates"] });
            setCrdbModal(null);
        },
        onError: (e: any) => toast.error(e.message),
    });

    const updateMut = useMutation({
        mutationFn: (body: any) => apiPut(`/api/vendor-credits-debits/${body.unico}`, body),
        onSuccess: (_d, vars: any) => {
            toast.success("Record updated.");
            logAction("Edit", vars.unico || "");
            qc.invalidateQueries({ queryKey: ["vcrdb-list"] });
            setCrdbModal(null);
        },
        onError: (e: any) => toast.error(e.message),
    });

    const deleteMut = useMutation({
        mutationFn: (unico: string) => apiDelete(`/api/vendor-credits-debits/${unico}`),
        onSuccess: (_d, unico) => {
            toast.success("Record deleted.");
            logAction("Delete", unico);
            qc.invalidateQueries({ queryKey: ["vcrdb-list"] });
            qc.invalidateQueries({ queryKey: ["vcrdb-dates"] });
            setCrdbModal(null);
        },
        onError: (e: any) => toast.error(e.message),
    });

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleRefresh = () => {
        refetchDates();
        refetchList();
    };

    const handleEditRow = async (row: any) => {
        try {
            const full = await apiFetch(`/api/vendor-credits-debits/${row.unico}`);
            setEditRow({ ...row, ...(full || {}) });
        } catch {
            setEditRow(row);
        }
        setCrdbModal({ open: true, mode: "Edit", type: row.type ?? row.lctype ?? "C" });
    };

    const handleLocate = (result: any) => {
        const d = normalizeToISODate(result.cd_date ?? result.ap_date ?? result.ldcd_date);
        setSelectedDate(d);
        setSearchModal(false);
        setTimeout(() => {
            setSelRow(result);
            setSelectedUnico(result.unico ?? result.ap_uq ?? null);
        }, 400);
    };

    const handlePrint = () => {
        if (!list.length) return;
        const rows = list.map((r: any) => `
            <tr>
                <td class="tc">${r.type === "C" ? "Credit" : "Debit"}</td>
                <td>${formatDateEST(normalizeToISODate(r.cd_date))}</td>
                <td>${r.invoice_no ?? r.lcinvoice_no ?? ""}</td>
                <td>${r.reason ?? r.lcreason ?? ""}</td>
                <td class="tr">${formatMoney(r.cd_amount ?? r.lncd_amount)}</td>
                <td>${r.cd_details ?? r.lcdetails ?? ""}</td>
            </tr>`).join("");
        printReport("Vendor Credits / Debits", `
            <table>
                <thead><tr><th>Type</th><th>Date</th><th>Invoice</th><th>Reason</th><th class="tr">Amount</th><th>Details</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>`);
    };

    if (status === "loading") return null;

    return (
        <div className="flex flex-col h-[100dvh] bg-[#f4f6f8] overflow-hidden font-sans text-[#333]">

            <AppHeader title="Vendor Credits / Debits" />

            {/* ── Toolbar ─────────────────────────────────────────────────── */}
            <div className="bg-[#F5F3F3] border border-[#DBD9D9] rounded-lg flex flex-wrap items-center px-4 py-2.5 gap-x-2 gap-y-1.5 shrink-0 shadow-sm mx-2 mt-2">
                <button onClick={handleRefresh} className="flex items-center gap-1.5 bg-white hover:bg-gray-100 border border-gray-200 px-3 h-7 rounded text-[13px] font-semibold uppercase text-gray-600 transition-all">
                    <RefreshCcw size={11} /> Refresh
                </button>
                <div className="w-px h-5 bg-gray-200" />
                <button onClick={() => setSearchModal(true)} className="flex items-center gap-1.5 bg-white hover:bg-gray-100 border border-gray-200 px-3 h-7 rounded text-[13px] font-semibold uppercase text-gray-600 transition-all">
                    <Search size={11} /> Search
                </button>
                <div className="w-px h-5 bg-gray-200" />
                <button
                    onClick={() => { if (!perms.canCreate) { toast.error(PERMISSION_MSGS.create); return; } setEditRow(null); setCrdbModal({ open: true, mode: "Add", type: "D" }); }}
                    className="flex items-center gap-1.5 bg-white hover:bg-gray-100 border border-gray-200 px-3 h-7 rounded text-[13px] font-semibold uppercase text-red-600 transition-all"
                >
                    <Minus size={11} /> Add Debit
                </button>
                <button
                    onClick={() => { if (!perms.canCreate) { toast.error(PERMISSION_MSGS.create); return; } setEditRow(null); setCrdbModal({ open: true, mode: "Add", type: "C" }); }}
                    className="flex items-center gap-1.5 bg-white hover:bg-gray-100 border border-gray-200 px-3 h-7 rounded text-[13px] font-semibold uppercase text-green-700 transition-all"
                >
                    <Plus size={11} /> Add Credit
                </button>
                <div className="w-px h-5 bg-gray-200" />
                <button
                    onClick={() => { if (!perms.canEdit) { toast.error(PERMISSION_MSGS.edit); return; } if (!selRow) { toast.info("Select a record first."); return; } handleEditRow(selRow); }}
                    disabled={!selRow}
                    className="flex items-center gap-1.5 bg-white hover:bg-gray-100 border border-gray-200 px-3 h-7 rounded text-[13px] font-semibold uppercase text-gray-600 transition-all disabled:opacity-40"
                >
                    <Pencil size={11} /> Edit
                </button>
                <button
                    onClick={() => { if (!perms.canDelete) { toast.error(PERMISSION_MSGS.delete); return; } if (!selRow) { toast.info("Select a record first."); return; } setEditRow(selRow); setCrdbModal({ open: true, mode: "Delete", type: selRow.type ?? "C" }); }}
                    disabled={!selRow}
                    className="flex items-center gap-1.5 bg-white hover:bg-gray-100 border border-gray-200 px-3 h-7 rounded text-[13px] font-semibold uppercase text-red-500 transition-all disabled:opacity-40"
                >
                    <Trash2 size={11} /> Delete
                </button>
                <div className="w-px h-5 bg-gray-200" />
                <button
                    onClick={() => { if (!selRow) { toast.info("Select a record first."); return; } setSplitModal(true); }}
                    disabled={!selRow}
                    className="flex items-center gap-1.5 bg-white hover:bg-gray-100 border border-gray-200 px-3 h-7 rounded text-[13px] font-semibold uppercase text-gray-600 transition-all disabled:opacity-40"
                >
                    <GitMerge size={11} /> PO Split
                </button>
                <button onClick={handlePrint} className="flex items-center gap-1.5 bg-white hover:bg-gray-100 border border-gray-200 px-3 h-7 rounded text-[13px] font-semibold uppercase text-gray-600 transition-all">
                    <Printer size={11} /> Print
                </button>

                {/* ── Tabs ────────────────────────────────────────────────── */}
                <div className="ml-auto flex items-center bg-white border border-gray-200 rounded overflow-hidden h-7">
                    <button
                        onClick={() => setActiveTab("list")}
                        className={cn("px-3 h-full text-[12px] font-semibold uppercase flex items-center gap-1.5 transition-all",
                            activeTab === "list" ? "bg-[#FB7506] text-white" : "text-gray-600 hover:bg-gray-100")}
                    >
                        <List size={11} /> List
                    </button>
                    <div className="w-px h-4 bg-gray-200" />
                    <button
                        onClick={() => setActiveTab("history")}
                        className={cn("px-3 h-full text-[12px] font-semibold uppercase flex items-center gap-1.5 transition-all",
                            activeTab === "history" ? "bg-[#FB7506] text-white" : "text-gray-600 hover:bg-gray-100")}
                    >
                        <History size={11} /> History
                    </button>
                </div>
            </div>

            {/* ── Tab: List ────────────────────────────────────────────────── */}
            {activeTab === "list" && (
                <div className="flex flex-1 gap-2 p-2 overflow-hidden">

                    {/* Dates panel */}
                    <div className="w-[200px] shrink-0 flex flex-col">
                        <PanelGrid
                            title="Dates"
                            icon={CalendarDays}
                            recordCount={dates.length}
                            refreshing={loadingDates}
                            className="flex-1"
                        >
                            <PanelGridTable>
                                <PanelGridThead>
                                    <PanelGridTh>Date</PanelGridTh>
                                    <PanelGridTh align="center">Recs</PanelGridTh>
                                </PanelGridThead>
                                <PanelGridTbody>
                                    {dates.length === 0 ? (
                                        <PanelGridTr><PanelGridTd colSpan={2} className="py-8 text-center text-gray-400 italic">No dates</PanelGridTd></PanelGridTr>
                                    ) : dates.map((d: any, i: number) => {
                                        const ds = normalizeToISODate(d.cd_date ?? d.ldcd_date ?? Object.values(d)[0]);
                                        return (
                                            <PanelGridTr key={i} selected={selectedDate === ds} onClick={() => setSelectedDate(ds)}>
                                                <PanelGridTd className="font-medium">{formatDateEST(ds)}</PanelGridTd>
                                                <PanelGridTd align="center">{d.records ?? d.lnrecords ?? 0}</PanelGridTd>
                                            </PanelGridTr>
                                        );
                                    })}
                                </PanelGridTbody>
                            </PanelGridTable>
                        </PanelGrid>
                    </div>

                    {/* Vendors panel */}
                    <div className="w-[220px] shrink-0 flex flex-col">
                        <PanelGrid
                            title="Vendors"
                            icon={Building2}
                            recordCount={vendors.length}
                            refreshing={loadingVendors}
                            className="flex-1"
                        >
                            <PanelGridTable>
                                <PanelGridThead>
                                    <PanelGridTh>Vendor</PanelGridTh>
                                    <PanelGridTh align="right">Amount</PanelGridTh>
                                </PanelGridThead>
                                <PanelGridTbody>
                                    {vendors.length === 0 ? (
                                        selectedDate ? <PanelGridTr><PanelGridTd colSpan={2} className="py-6 text-center text-gray-400 italic">No vendors</PanelGridTd></PanelGridTr> : null
                                    ) : vendors.map((v: any, i: number) => {
                                        const uq = v.grower_uq ?? v.lcgrower_uq ?? v.unico;
                                        const name = v.grower ?? v.lcfarm ?? v.farm ?? "";
                                        return (
                                            <PanelGridTr key={i} selected={selectedGrowerUq === uq} onClick={() => setSelectedGrowerUq(uq)}
                                                className={selectedGrowerUq === uq ? "!bg-[#FB7506]/10" : undefined}>
                                                <PanelGridTd className="font-medium truncate max-w-[120px]">{name}</PanelGridTd>
                                                <PanelGridTd align="right">{formatMoney(v.total_amount ?? v.lntotal_amount)}</PanelGridTd>
                                            </PanelGridTr>
                                        );
                                    })}
                                </PanelGridTbody>
                            </PanelGridTable>
                        </PanelGrid>
                    </div>

                    {/* Main credits/debits grid */}
                    <div className="flex-1 flex flex-col min-w-0">
                        <PanelGrid
                            title="Credits / Debits"
                            icon={CreditCard}
                            recordCount={list.length}
                            refreshing={loadingList}
                            headerRight={
                                <AuditLogModal recordId={selRow?.unico ?? selRow?.ap_uq ?? null} bareButton />
                            }
                            menuItems={[
                                { label: "Add Credit", icon: Plus, color: "green", onClick: () => { if (!perms.canCreate) { toast.error(PERMISSION_MSGS.create); return; } setEditRow(null); setCrdbModal({ open: true, mode: "Add", type: "C" }); } },
                                { label: "Add Debit", icon: Minus, color: "red", onClick: () => { if (!perms.canCreate) { toast.error(PERMISSION_MSGS.create); return; } setEditRow(null); setCrdbModal({ open: true, mode: "Add", type: "D" }); } },
                                { separator: true },
                                { label: "Edit", icon: Pencil, color: "orange", onClick: () => { if (selRow) handleEditRow(selRow); else toast.info("Select a record."); }, disabled: !selRow },
                                { label: "Delete", icon: Trash2, color: "red", onClick: () => { if (selRow) { setEditRow(selRow); setCrdbModal({ open: true, mode: "Delete", type: selRow.type ?? "C" }); } else toast.info("Select a record."); }, disabled: !selRow },
                                { separator: true },
                                { label: "PO Credit Split", icon: GitMerge, color: "blue", onClick: () => { if (selRow) setSplitModal(true); else toast.info("Select a record."); }, disabled: !selRow },
                                { label: "Print", icon: Printer, color: "gray", onClick: handlePrint },
                            ]}
                            className="flex-1"
                        >
                            {!selectedDate ? (
                                <div className="flex items-center justify-center h-32 text-gray-400 italic text-sm">Select a date to view records.</div>
                            ) : (
                                <PanelGridTable>
                                    <PanelGridThead>
                                        <PanelGridTh>Type</PanelGridTh>
                                        <PanelGridTh>Date</PanelGridTh>
                                        <PanelGridTh>Vendor</PanelGridTh>
                                        <PanelGridTh>Invoice</PanelGridTh>
                                        <PanelGridTh>Reason</PanelGridTh>
                                        <PanelGridTh align="right">Amount</PanelGridTh>
                                        <PanelGridTh>Details</PanelGridTh>
                                        <PanelGridTh align="center">Ref</PanelGridTh>
                                    </PanelGridThead>
                                    <PanelGridTbody>
                                        {list.length === 0 ? (
                                            <PanelGridTr><PanelGridTd colSpan={8} className="py-8 text-center text-gray-400 italic">No credits or debits for this date.</PanelGridTd></PanelGridTr>
                                        ) : list.map((row: any) => {
                                            const unico = row.unico ?? row.ap_uq;
                                            const isSelected = selRow?.unico === unico || selRow?.ap_uq === unico;
                                            const isCredit = (row.type ?? row.lctype) === "C";
                                            return (
                                                <PanelGridTr
                                                    key={unico}
                                                    selected={isSelected}
                                                    onClick={() => { const desel = isSelected; setSelRow(desel ? null : row); setSelectedUnico(desel ? null : unico); }}
                                                    className={isSelected ? "!bg-[#FB7506]/10" : undefined}
                                                >
                                                    <PanelGridTd>
                                                        <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold",
                                                            isCredit ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600")}>
                                                            {isCredit ? "Credit" : "Debit"}
                                                        </span>
                                                    </PanelGridTd>
                                                    <PanelGridTd>{formatDateEST(normalizeToISODate(row.cd_date ?? row.ldcd_date))}</PanelGridTd>
                                                    <PanelGridTd className="font-medium max-w-[140px] truncate">{row.grower ?? row.farm ?? row.lcfarm}</PanelGridTd>
                                                    <PanelGridTd className="text-[#FB7506] font-semibold">{row.invoice_no ?? row.lcinvoice_no}</PanelGridTd>
                                                    <PanelGridTd className="max-w-[140px] truncate">{row.reason ?? row.lcreason}</PanelGridTd>
                                                    <PanelGridTd align="right" className={cn("font-semibold", isCredit ? "text-green-600" : "text-red-500")}>
                                                        {formatMoney(row.cd_amount ?? row.lncd_ammount)}
                                                    </PanelGridTd>
                                                    <PanelGridTd className="max-w-[180px] truncate text-gray-500">{row.cd_details ?? row.lcdetails}</PanelGridTd>
                                                    <PanelGridTd align="center" className="text-gray-400 text-[11px]">{row.cd_no ?? row.lccd_no}</PanelGridTd>
                                                </PanelGridTr>
                                            );
                                        })}
                                    </PanelGridTbody>
                                </PanelGridTable>
                            )}
                        </PanelGrid>
                    </div>
                </div>
            )}

            {/* ── Tab: History ─────────────────────────────────────────────── */}
            {activeTab === "history" && (
                <div className="flex flex-1 gap-2 p-2 overflow-hidden">

                    {/* History filters sidebar */}
                    <div className="w-[280px] shrink-0 flex flex-col gap-2">
                        {/* Vendors derived from history results for selected date range */}
                        <PanelGrid title="Vendors" icon={Building2} recordCount={historyVendors.length}
                            refreshing={loadingHistory} className="flex-1 min-h-0">
                            <PanelGridTable>
                                <PanelGridThead><PanelGridTh>Vendor</PanelGridTh></PanelGridThead>
                                <PanelGridTbody>
                                    <PanelGridTr selected={historyVendorFilter === ""} onClick={() => { setHistoryVendorFilter(""); setSelHistRow(null); }}
                                        className={historyVendorFilter === "" ? "!bg-[#FB7506]/10" : undefined}>
                                        <PanelGridTd className="font-bold text-[#FB7506]">ALL Vendors</PanelGridTd>
                                    </PanelGridTr>
                                    {historyVendors.map((name, i) => (
                                        <PanelGridTr key={i} selected={historyVendorFilter === name}
                                            onClick={() => { setHistoryVendorFilter(name); setSelHistRow(null); }}
                                            className={historyVendorFilter === name ? "!bg-[#FB7506]/10" : undefined}>
                                            <PanelGridTd className="font-medium">{name}</PanelGridTd>
                                        </PanelGridTr>
                                    ))}
                                </PanelGridTbody>
                            </PanelGridTable>
                        </PanelGrid>
                        <div className="bg-white border border-[#DBD9D9] rounded-lg p-3 flex flex-col gap-2 shrink-0">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date Range</p>
                            <label className="flex flex-col gap-0.5">
                                <span className="text-[11px] text-gray-500 font-semibold">From</span>
                                <input type="date" value={historyFrom} onChange={e => setHistoryFrom(e.target.value)}
                                    className="border border-gray-200 rounded px-2 py-1 text-[13px] outline-none focus:ring-1 focus:ring-[#FB7506]" />
                            </label>
                            <label className="flex flex-col gap-0.5">
                                <span className="text-[11px] text-gray-500 font-semibold">To</span>
                                <input type="date" value={historyTo} onChange={e => setHistoryTo(e.target.value)}
                                    className="border border-gray-200 rounded px-2 py-1 text-[13px] outline-none focus:ring-1 focus:ring-[#FB7506]" />
                            </label>
                            <button onClick={() => { setHistoryVendorFilter(""); setSelHistRow(null); refetchHistory(); }}
                                className="bg-[#FB7506] hover:bg-orange-600 text-white text-[12px] font-bold uppercase rounded px-3 py-1.5 transition-all">
                                Search
                            </button>
                        </div>
                    </div>

                    {/* History grid */}
                    <div className="flex-1 flex flex-col min-w-0">
                        <PanelGrid
                            title="History"
                            icon={History}
                            recordCount={filteredHistory.length}
                            refreshing={loadingHistory}
                            headerRight={<AuditLogModal recordId={selHistRow !== null ? (filteredHistory[selHistRow]?.unico ?? null) : null} bareButton />}
                            className="flex-1"
                        >
                            <PanelGridTable>
                                <PanelGridThead>
                                    <PanelGridTh>Type</PanelGridTh>
                                    <PanelGridTh>Date</PanelGridTh>
                                    <PanelGridTh>Vendor</PanelGridTh>
                                    <PanelGridTh>Invoice</PanelGridTh>
                                    <PanelGridTh>Reason</PanelGridTh>
                                    <PanelGridTh align="right">Amount</PanelGridTh>
                                    <PanelGridTh>Details</PanelGridTh>
                                </PanelGridThead>
                                <PanelGridTbody>
                                    {filteredHistory.length === 0 ? (
                                        <PanelGridTr><PanelGridTd colSpan={7} className="py-8 text-center text-gray-400 italic">No history records found.</PanelGridTd></PanelGridTr>
                                    ) : filteredHistory.map((row: any, i: number) => {
                                        const isCredit = (row.type ?? row.lctype) === "C";
                                        const isSelected = selHistRow === i;
                                        return (
                                            <PanelGridTr key={i} selected={isSelected} onClick={() => setSelHistRow(isSelected ? null : i)}
                                                className={isSelected ? "!bg-[#FB7506]/10" : undefined}>
                                                <PanelGridTd>
                                                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold",
                                                        isCredit ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600")}>
                                                        {isCredit ? "Credit" : "Debit"}
                                                    </span>
                                                </PanelGridTd>
                                                <PanelGridTd>{formatDateEST(normalizeToISODate(row.cd_date ?? row.ldcd_date))}</PanelGridTd>
                                                <PanelGridTd className="font-medium max-w-[140px] truncate">{row.grower ?? row.farm ?? row.lcfarm}</PanelGridTd>
                                                <PanelGridTd className="text-[#FB7506] font-semibold">{row.invoice_no ?? row.lcinvoice_no}</PanelGridTd>
                                                <PanelGridTd className="max-w-[140px] truncate">{row.reason ?? row.lcreason}</PanelGridTd>
                                                <PanelGridTd align="right" className={cn("font-semibold", isCredit ? "text-green-600" : "text-red-500")}>
                                                    {formatMoney(row.cd_amount ?? row.cd_ammount ?? row.lncd_ammount)}
                                                </PanelGridTd>
                                                <PanelGridTd className="max-w-[180px] truncate text-gray-500">{row.cd_details ?? row.lcdetails}</PanelGridTd>
                                            </PanelGridTr>
                                        );
                                    })}
                                </PanelGridTbody>
                            </PanelGridTable>
                        </PanelGrid>
                    </div>
                </div>
            )}

            <AppFooter areaLabel="Vendor Credits/Debits" />

            {/* ── MODALS ────────────────────────────────────────────────────── */}
            {crdbModal?.open && (
                <CrDbModal
                    mode={crdbModal.mode}
                    type={crdbModal.type}
                    row={editRow}
                    reasons={reasons}
                    selectedDate={selectedDate}
                    selectedGrowerUq={selectedGrowerUq}
                    onClose={() => { setCrdbModal(null); setEditRow(null); }}
                    onSave={(body: any) => {
                        if (crdbModal.mode === "Add") insertMut.mutate(body);
                        else if (crdbModal.mode === "Edit") updateMut.mutate({ ...body, unico: editRow?.unico });
                        else deleteMut.mutate(editRow?.unico);
                    }}
                    saving={insertMut.isPending || updateMut.isPending || deleteMut.isPending}
                />
            )}

            {searchModal && (
                <SearchModal onClose={() => setSearchModal(false)} onLocate={handleLocate} />
            )}

            {splitModal && selRow && (
                <PoCreditSplitModal
                    unico={selRow.unico ?? selRow.ap_uq}
                    onClose={() => setSplitModal(false)}
                />
            )}
        </div>
    );
}

// ─── Cr/Db Modal (Add / Edit / Delete) ───────────────────────────────────────
function CrDbModal({ mode, type, row, reasons, selectedDate, selectedGrowerUq, onClose, onSave, saving }: {
    mode: "Add" | "Edit" | "Delete";
    type: "C" | "D";
    row: any;
    reasons: any[];
    selectedDate: string | null;
    selectedGrowerUq: string | null;
    onClose: () => void;
    onSave: (body: any) => void;
    saving: boolean;
}) {
    const [formType,     setFormType]     = useState<"C" | "D">(row?.type ?? row?.lctype ?? type);
    const [date,         setDate]         = useState<string>(row ? normalizeToISODate(row.cd_date ?? row.ldcd_date) ?? selectedDate ?? todayEST() : selectedDate ?? todayEST());
    const [reasonUq,     setReasonUq]     = useState(row?.reason_uq ?? row?.lcreason_uq ?? "");
    const [accPayUq,     setAccPayUq]     = useState(row?.acc_pay_uq ?? row?.lcacc_pay_uq ?? "");
    const [amount,       setAmount]       = useState(row ? String(row.cd_amount ?? row.lncd_ammount ?? "") : "");
    const [details,      setDetails]      = useState(row?.cd_details ?? row?.lcdetails ?? "");
    const [growerUq,     setGrowerUq]     = useState(row?.grower_uq ?? row?.lcgrower_uq ?? selectedGrowerUq ?? "");
    const [growerQ,      setGrowerQ]      = useState(row?.grower ?? row?.farm ?? "");
    const [growerOpen,   setGrowerOpen]   = useState(false);

    const { data: invoices = EMPTY_ARR } = useQuery({
        queryKey: ["vcrdb-invoices", growerUq, formType, accPayUq],
        queryFn:  () => apiFetch(`/api/vendor-credits-debits/invoices?grower_uq=${growerUq}&type=${formType}&acc_pay_uq=${accPayUq}`),
        enabled:  !!growerUq,
    });

    const { data: growerResults = EMPTY_ARR } = useQuery({
        queryKey: ["vcrdb-growers-modal", growerQ],
        queryFn:  () => apiFetch(`/api/vendor-credits-debits/growers?q=${encodeURIComponent(growerQ)}`),
        enabled:  growerOpen && growerQ.length > 1,
    });

    const handleSubmit = () => {
        if (!reasonUq) { toast.error("Reason is required."); return; }
        if (!amount || isNaN(parseFloat(amount))) { toast.error("Valid amount required."); return; }
        onSave({
            lctype:       formType,
            ldcd_date:    date,
            lcacc_pay_uq: accPayUq,
            lcreason_uq:  reasonUq,
            lncd_ammount: parseFloat(amount),
            lcdetails:    details,
        });
    };

    const title = mode === "Add" ? `Add ${type === "C" ? "Credit" : "Debit"}` : mode === "Edit" ? "Edit Record" : "Delete Record";
    const isDelete = mode === "Delete";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden">
                {/* Header */}
                <div className="bg-[#2B2B2B] text-white px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CreditCard size={16} className="text-[#FB7506]" />
                        <span className="font-bold text-[15px] uppercase tracking-wide">{title}</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-xl leading-none">×</button>
                </div>

                {/* Body */}
                <div className="p-5 flex flex-col gap-3 overflow-y-auto max-h-[70vh]">
                    {isDelete ? (
                        <p className="text-gray-700 text-[14px]">
                            Are you sure you want to delete this{" "}
                            <strong>{row?.type === "C" ? "credit" : "debit"}</strong> of{" "}
                            <strong className="text-red-500">{formatMoney(row?.cd_amount ?? row?.lncd_ammount)}</strong>?
                            This action cannot be undone.
                        </p>
                    ) : (
                        <>
                            {/* Type */}
                            <div className="flex gap-2">
                                {(["C", "D"] as const).map(t => (
                                    <button key={t} type="button"
                                        onClick={() => { if (mode === "Add") setFormType(t); }}
                                        disabled={mode === "Edit"}
                                        className={cn("flex-1 py-1.5 rounded border font-semibold text-[13px] transition-all",
                                            formType === t ? (t === "C" ? "bg-green-600 text-white border-green-600" : "bg-red-500 text-white border-red-500")
                                                           : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                                        )}>
                                        {t === "C" ? "Credit" : "Debit"}
                                    </button>
                                ))}
                            </div>

                            {/* Vendor */}
                            <div className="flex flex-col gap-1 relative">
                                <label className="text-[11px] font-semibold text-gray-500 uppercase">Vendor</label>
                                <input
                                    value={growerQ}
                                    onChange={e => { setGrowerQ(e.target.value); setGrowerOpen(true); }}
                                    onFocus={() => setGrowerOpen(true)}
                                    placeholder="Type to search vendor…"
                                    className="border border-gray-200 rounded px-2 py-1.5 text-[13px] outline-none focus:ring-1 focus:ring-[#FB7506]"
                                />
                                {growerOpen && growerResults.length > 0 && (
                                    <div className="absolute z-20 top-full left-0 right-0 bg-white border border-gray-200 rounded shadow-lg max-h-36 overflow-y-auto">
                                        {growerResults.map((g: any, i: number) => (
                                            <button key={i} type="button"
                                                className="w-full text-left px-3 py-1.5 text-[13px] hover:bg-[#FB7506]/10 transition-colors"
                                                onClick={() => { setGrowerUq(g.grower_uq ?? g.lcgrower_uq); setGrowerQ(g.grower ?? g.farm ?? g.lcfarm); setGrowerOpen(false); }}>
                                                {g.grower ?? g.farm ?? g.lcfarm}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Date */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[11px] font-semibold text-gray-500 uppercase">Date</label>
                                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                                    className="border border-gray-200 rounded px-2 py-1.5 text-[13px] outline-none focus:ring-1 focus:ring-[#FB7506]" />
                            </div>

                            {/* Invoice */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[11px] font-semibold text-gray-500 uppercase">Invoice</label>
                                <select value={accPayUq} onChange={e => setAccPayUq(e.target.value)}
                                    className="border border-gray-200 rounded px-2 py-1.5 text-[13px] outline-none focus:ring-1 focus:ring-[#FB7506] bg-white">
                                    <option value="">— No invoice —</option>
                                    {invoices.map((inv: any, i: number) => (
                                        <option key={i} value={inv.unico ?? inv.lcunico}>
                                            {inv.invoice_no ?? inv.lcinvoice_no} — {formatMoney(inv.amount ?? inv.lnamount)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Reason */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[11px] font-semibold text-gray-500 uppercase">Reason <span className="text-red-500">*</span></label>
                                <select value={reasonUq} onChange={e => setReasonUq(e.target.value)}
                                    className="border border-gray-200 rounded px-2 py-1.5 text-[13px] outline-none focus:ring-1 focus:ring-[#FB7506] bg-white">
                                    <option value="">— Select reason —</option>
                                    {reasons.map((r: any, i: number) => (
                                        <option key={i} value={r.reason_uq ?? r.lcunico ?? r.unico}>{r.reason ?? r.lcreason ?? r.description}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Amount */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[11px] font-semibold text-gray-500 uppercase">Amount <span className="text-red-500">*</span></label>
                                <input type="text" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="border border-gray-200 rounded px-2 py-1.5 text-[13px] outline-none focus:ring-1 focus:ring-[#FB7506]" />
                            </div>

                            {/* Details */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[11px] font-semibold text-gray-500 uppercase">Details / Comments</label>
                                <textarea value={details} onChange={e => setDetails(e.target.value)} rows={3}
                                    className="border border-gray-200 rounded px-2 py-1.5 text-[13px] outline-none focus:ring-1 focus:ring-[#FB7506] resize-none" />
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 border-t border-gray-200 px-5 py-3 flex justify-end gap-2">
                    <button onClick={onClose} disabled={saving}
                        className="px-4 py-1.5 rounded border border-gray-300 text-[13px] font-semibold text-gray-600 hover:bg-gray-100 transition-all disabled:opacity-50">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={saving}
                        className={cn("px-5 py-1.5 rounded text-[13px] font-bold text-white transition-all disabled:opacity-50",
                            isDelete ? "bg-red-500 hover:bg-red-600" : "bg-[#FB7506] hover:bg-orange-600")}>
                        {saving ? "Saving…" : isDelete ? "Delete" : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Search Modal ─────────────────────────────────────────────────────────────
function SearchModal({ onClose, onLocate }: { onClose: () => void; onLocate: (row: any) => void }) {
    const [farm,      setFarm]      = useState("");
    const [invoiceNo, setInvoiceNo] = useState("");
    const [poNo,      setPoNo]      = useState("");
    const [results,   setResults]   = useState<any[]>([]);
    const [selIdx,    setSelIdx]    = useState<number | null>(null);
    const [loading,   setLoading]   = useState(false);

    const handleSearch = async () => {
        setLoading(true);
        setSelIdx(null);
        try {
            const params = new URLSearchParams();
            if (farm)      params.set("farm",       farm);
            if (invoiceNo) params.set("invoice_no", invoiceNo);
            if (poNo)      params.set("po_no",      poNo);
            const data = await apiFetch(`/api/vendor-credits-debits/search?${params}`);
            setResults(Array.isArray(data) ? data : []);
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden max-h-[80vh]">
                <div className="bg-[#2B2B2B] text-white px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Search size={16} className="text-[#FB7506]" />
                        <span className="font-bold text-[15px] uppercase tracking-wide">Search Credits / Debits</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">×</button>
                </div>

                <div className="p-4 flex flex-col gap-3 flex-1 overflow-hidden">
                    {/* Filter row */}
                    <div className="flex gap-3 shrink-0">
                        <div className="flex flex-col gap-1 flex-1">
                            <label className="text-[11px] font-semibold text-gray-500 uppercase">Farm / Vendor</label>
                            <input value={farm} onChange={e => setFarm(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearch()}
                                placeholder="Farm name…"
                                className="border border-gray-200 rounded px-2 py-1.5 text-[13px] outline-none focus:ring-1 focus:ring-[#FB7506]" />
                        </div>
                        <div className="flex flex-col gap-1 flex-1">
                            <label className="text-[11px] font-semibold text-gray-500 uppercase">Invoice #</label>
                            <input value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearch()}
                                placeholder="Invoice number…"
                                className="border border-gray-200 rounded px-2 py-1.5 text-[13px] outline-none focus:ring-1 focus:ring-[#FB7506]" />
                        </div>
                        <div className="flex flex-col gap-1 w-32">
                            <label className="text-[11px] font-semibold text-gray-500 uppercase">PO #</label>
                            <input value={poNo} onChange={e => setPoNo(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearch()}
                                type="text" inputMode="numeric" placeholder="PO no…"
                                className="border border-gray-200 rounded px-2 py-1.5 text-[13px] outline-none focus:ring-1 focus:ring-[#FB7506]" />
                        </div>
                        <div className="flex items-end">
                            <button onClick={handleSearch} disabled={loading}
                                className="bg-[#FB7506] hover:bg-orange-600 text-white px-4 py-1.5 rounded font-bold text-[13px] transition-all disabled:opacity-50 flex items-center gap-1.5">
                                <Search size={12} /> Search
                            </button>
                        </div>
                    </div>

                    {/* Results grid */}
                    <div className="flex-1 overflow-auto min-h-0">
                        <PanelGrid title="Results" icon={List} recordCount={results.length} refreshing={loading} className="h-full">
                            <PanelGridTable>
                                <PanelGridThead>
                                    <PanelGridTh>Type</PanelGridTh>
                                    <PanelGridTh>Date</PanelGridTh>
                                    <PanelGridTh>Vendor</PanelGridTh>
                                    <PanelGridTh>Invoice</PanelGridTh>
                                    <PanelGridTh>PO</PanelGridTh>
                                    <PanelGridTh align="right">Amount</PanelGridTh>
                                </PanelGridThead>
                                <PanelGridTbody>
                                    {results.length === 0 ? (
                                        <PanelGridTr><PanelGridTd colSpan={6} className="py-8 text-center text-gray-400 italic">No results. Use filters above.</PanelGridTd></PanelGridTr>
                                    ) : results.map((row: any, i: number) => {
                                        const isCredit = (row.type ?? row.lctype) === "C";
                                        return (
                                            <PanelGridTr key={i} selected={selIdx === i} onClick={() => setSelIdx(selIdx === i ? null : i)}
                                                className={selIdx === i ? "!bg-[#FB7506]/10" : undefined}>
                                                <PanelGridTd>
                                                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold",
                                                        isCredit ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600")}>
                                                        {isCredit ? "Credit" : "Debit"}
                                                    </span>
                                                </PanelGridTd>
                                                <PanelGridTd>{formatDateEST(normalizeToISODate(row.cd_date ?? row.ldcd_date))}</PanelGridTd>
                                                <PanelGridTd className="font-medium">{row.grower ?? row.farm ?? row.lcfarm}</PanelGridTd>
                                                <PanelGridTd className="text-[#FB7506] font-semibold">{row.invoice_no ?? row.lcinvoice_no}</PanelGridTd>
                                                <PanelGridTd>{row.po_no ?? row.lnpo_no}</PanelGridTd>
                                                <PanelGridTd align="right" className={cn("font-semibold", isCredit ? "text-green-600" : "text-red-500")}>
                                                    {formatMoney(row.cd_amount ?? row.lncd_ammount)}
                                                </PanelGridTd>
                                            </PanelGridTr>
                                        );
                                    })}
                                </PanelGridTbody>
                            </PanelGridTable>
                        </PanelGrid>
                    </div>
                </div>

                <div className="bg-gray-50 border-t border-gray-200 px-5 py-3 flex justify-end gap-2">
                    <button onClick={onClose}
                        className="px-4 py-1.5 rounded border border-gray-300 text-[13px] font-semibold text-gray-600 hover:bg-gray-100 transition-all">
                        Close
                    </button>
                    <button
                        onClick={() => selIdx !== null && onLocate(results[selIdx])}
                        disabled={selIdx === null}
                        className="px-5 py-1.5 rounded bg-[#FB7506] hover:bg-orange-600 text-white text-[13px] font-bold transition-all disabled:opacity-40">
                        Locate
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── PO Credit Split Modal ────────────────────────────────────────────────────
function PoCreditSplitModal({ unico, onClose }: { unico: string; onClose: () => void }) {
    const qc = useQueryClient();
    const [selDistIdx, setSelDistIdx] = useState<number | null>(null);
    const [distForm,   setDistForm]   = useState<{ poNo: string; amount: string } | null>(null);
    const [distMode,   setDistMode]   = useState<"add" | "edit" | null>(null);
    const [poLookup,   setPoLookup]   = useState("");
    const [poResult,   setPoResult]   = useState<any>(null);

    const { data, isFetching, refetch } = useQuery({
        queryKey: ["vcrdb-dists", unico],
        queryFn:  () => apiFetch(`/api/vendor-credits-debits/${unico}/distributions`),
    });

    const header = data?.header ?? null;
    const dists: any[] = data?.distributions ?? EMPTY_ARR;

    const addDist = useMutation({
        mutationFn: (body: any) => apiPost(`/api/vendor-credits-debits/${unico}/distributions`, body),
        onSuccess: () => { toast.success("Distribution added."); qc.invalidateQueries({ queryKey: ["vcrdb-dists", unico] }); setDistForm(null); setDistMode(null); },
        onError: (e: any) => toast.error(e.message),
    });

    const editDist = useMutation({
        mutationFn: ({ dUnico, body }: { dUnico: string; body: any }) => apiPut(`/api/vendor-credits-debits/${unico}/distributions/${dUnico}`, body),
        onSuccess: () => { toast.success("Distribution updated."); qc.invalidateQueries({ queryKey: ["vcrdb-dists", unico] }); setDistForm(null); setDistMode(null); },
        onError: (e: any) => toast.error(e.message),
    });

    const delDist = useMutation({
        mutationFn: (dUnico: string) => apiDelete(`/api/vendor-credits-debits/${unico}/distributions/${dUnico}`),
        onSuccess: () => { toast.success("Distribution deleted."); qc.invalidateQueries({ queryKey: ["vcrdb-dists", unico] }); setSelDistIdx(null); },
        onError: (e: any) => toast.error(e.message),
    });

    const lookupPO = async () => {
        if (!poLookup || isNaN(parseInt(poLookup))) { toast.error("Enter a valid PO number."); return; }
        try {
            const res = await apiFetch(`/api/vendor-credits-debits/po-search?no=${poLookup}`);
            setPoResult(res);
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    const handleDistSave = () => {
        if (!distForm?.amount || isNaN(parseFloat(distForm.amount))) { toast.error("Valid amount required."); return; }
        if (!poResult?.unico && !distForm?.poNo) { toast.error("PO is required."); return; }
        const body = {
            lcpob_uq:     poResult?.unico ?? "",
            lncredit_pob: parseFloat(distForm.amount),
        };
        if (distMode === "add") {
            addDist.mutate(body);
        } else {
            const selRow = dists[selDistIdx!];
            editDist.mutate({ dUnico: selRow.unico ?? selRow.ap_uq, body });
        }
    };

    const saving = addDist.isPending || editDist.isPending || delDist.isPending;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden max-h-[85vh]">
                {/* Header */}
                <div className="bg-[#2B2B2B] text-white px-5 py-3 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        <GitMerge size={16} className="text-[#FB7506]" />
                        <span className="font-bold text-[15px] uppercase tracking-wide">PO Credit Split</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">×</button>
                </div>

                {/* Header info */}
                {header && (
                    <div className="bg-gray-50 border-b border-gray-200 px-5 py-2.5 shrink-0 flex flex-wrap gap-x-6 gap-y-1 text-[12px]">
                        <span><span className="font-semibold text-gray-500 uppercase text-[10px]">Vendor: </span>{header.grower ?? header.farm ?? "—"}</span>
                        <span><span className="font-semibold text-gray-500 uppercase text-[10px]">Invoice: </span><span className="text-[#FB7506] font-semibold">{header.invoice_no ?? "—"}</span></span>
                        <span><span className="font-semibold text-gray-500 uppercase text-[10px]">Type: </span>{header.type === "C" ? "Credit" : header.type === "D" ? "Debit" : header.type ?? "—"}</span>
                        <span><span className="font-semibold text-gray-500 uppercase text-[10px]">Amount: </span><span className="font-bold">{formatMoney(header.cd_amount ?? header.lncd_ammount)}</span></span>
                        <span><span className="font-semibold text-gray-500 uppercase text-[10px]">Date: </span>{formatDateEST(normalizeToISODate(header.cd_date ?? header.ldcd_date))}</span>
                    </div>
                )}

                {/* Distributions grid */}
                <div className="flex-1 overflow-auto min-h-0">
                    <PanelGrid
                        title="Distributions"
                        icon={GitMerge}
                        recordCount={dists.length}
                        refreshing={isFetching}
                        className="rounded-none border-x-0 border-b-0 flex-1 min-h-0"
                        menuItems={[
                            { label: "Add", icon: Plus, color: "green", onClick: () => { setDistForm({ poNo: "", amount: "" }); setDistMode("add"); setPoResult(null); setPoLookup(""); } },
                            { label: "Edit", icon: Pencil, color: "orange", onClick: () => { if (selDistIdx === null) { toast.info("Select a distribution."); return; } const r = dists[selDistIdx]; setDistForm({ poNo: String(r.po_no ?? r.lnpo_no ?? ""), amount: String(r.credit_pob ?? r.lncredit_pob ?? "") }); setDistMode("edit"); }, disabled: selDistIdx === null },
                            { label: "Delete", icon: Trash2, color: "red", onClick: () => { if (selDistIdx === null) { toast.info("Select a distribution."); return; } const r = dists[selDistIdx]; if (confirm("Delete this distribution?")) delDist.mutate(r.unico ?? r.ap_uq); }, disabled: selDistIdx === null },
                        ]}
                        headerRight={
                            <div className="flex gap-1">
                                <button onClick={() => { setDistForm({ poNo: "", amount: "" }); setDistMode("add"); setPoResult(null); setPoLookup(""); }}
                                    className="flex items-center gap-1 bg-white border border-gray-200 text-green-700 hover:bg-green-50 px-2 h-7 rounded text-[11px] font-semibold uppercase transition-all">
                                    <Plus size={10} /> Add
                                </button>
                                <button onClick={() => { if (selDistIdx !== null) { const r = dists[selDistIdx]; setDistForm({ poNo: String(r.po_no ?? r.lnpo_no ?? ""), amount: String(r.credit_pob ?? r.lncredit_pob ?? "") }); setDistMode("edit"); } else toast.info("Select a distribution."); }}
                                    disabled={selDistIdx === null}
                                    className="flex items-center gap-1 bg-white border border-gray-200 text-orange-500 hover:bg-orange-50 px-2 h-7 rounded text-[11px] font-semibold uppercase transition-all disabled:opacity-40">
                                    <Pencil size={10} /> Edit
                                </button>
                                <button onClick={() => { if (selDistIdx !== null) { const r = dists[selDistIdx]; if (confirm("Delete this distribution?")) delDist.mutate(r.unico ?? r.ap_uq); } else toast.info("Select a distribution."); }}
                                    disabled={selDistIdx === null || saving}
                                    className="flex items-center gap-1 bg-white border border-gray-200 text-red-500 hover:bg-red-50 px-2 h-7 rounded text-[11px] font-semibold uppercase transition-all disabled:opacity-40">
                                    <Trash2 size={10} /> Del
                                </button>
                            </div>
                        }
                    >
                        <PanelGridTable>
                            <PanelGridThead>
                                <PanelGridTh>PO #</PanelGridTh>
                                <PanelGridTh>Vendor</PanelGridTh>
                                <PanelGridTh align="right">Amount Applied</PanelGridTh>
                            </PanelGridThead>
                            <PanelGridTbody>
                                {dists.length === 0 ? (
                                    <PanelGridTr><PanelGridTd colSpan={3} className="py-8 text-center text-gray-400 italic">No distributions yet.</PanelGridTd></PanelGridTr>
                                ) : dists.map((d: any, i: number) => (
                                    <PanelGridTr key={i} selected={selDistIdx === i} onClick={() => setSelDistIdx(selDistIdx === i ? null : i)}
                                        className={selDistIdx === i ? "!bg-[#FB7506]/10" : undefined}>
                                        <PanelGridTd className="text-[#FB7506] font-semibold">{d.po_no ?? d.lnpo_no}</PanelGridTd>
                                        <PanelGridTd>{d.grower ?? d.farm ?? d.lcfarm}</PanelGridTd>
                                        <PanelGridTd align="right" className="font-semibold">{formatMoney(d.credit_pob ?? d.lncredit_pob)}</PanelGridTd>
                                    </PanelGridTr>
                                ))}
                            </PanelGridTbody>
                        </PanelGridTable>
                    </PanelGrid>
                </div>

                {/* Distribution form (inline) */}
                {distMode && distForm && (
                    <div className="border-t border-gray-200 bg-gray-50 px-5 py-4 flex flex-col gap-3 shrink-0">
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{distMode === "add" ? "Add Distribution" : "Edit Distribution"}</p>
                        {/* PO Lookup */}
                        <div className="flex gap-2 items-end">
                            <div className="flex flex-col gap-1 flex-1">
                                <label className="text-[11px] font-semibold text-gray-500 uppercase">PO Number</label>
                                <input type="text" inputMode="numeric" value={poLookup} onChange={e => setPoLookup(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && lookupPO()}
                                    placeholder="Enter PO #…"
                                    className="border border-gray-200 rounded px-2 py-1.5 text-[13px] outline-none focus:ring-1 focus:ring-[#FB7506]" />
                            </div>
                            <button onClick={lookupPO} className="bg-gray-700 hover:bg-gray-800 text-white px-3 py-1.5 rounded text-[12px] font-bold transition-all flex items-center gap-1.5">
                                <Search size={11} /> Lookup
                            </button>
                        </div>
                        {poResult && (
                            <div className="bg-blue-50 border border-blue-200 rounded px-3 py-2 text-[12px] text-blue-800 font-medium">
                                PO {poResult.po_no ?? poResult.lnpo_no} — {poResult.grower ?? poResult.farm ?? poResult.lcfarm} — {formatMoney(poResult.cost ?? poResult.lncost)}
                            </div>
                        )}
                        <div className="flex gap-2 items-end">
                            <div className="flex flex-col gap-1 flex-1">
                                <label className="text-[11px] font-semibold text-gray-500 uppercase">Amount to Apply</label>
                                <input type="text" inputMode="decimal" value={distForm.amount} onChange={e => setDistForm(f => ({ ...f!, amount: e.target.value }))}
                                    placeholder="0.00"
                                    className="border border-gray-200 rounded px-2 py-1.5 text-[13px] outline-none focus:ring-1 focus:ring-[#FB7506]" />
                            </div>
                            <button onClick={handleDistSave} disabled={saving}
                                className="bg-[#FB7506] hover:bg-orange-600 text-white px-4 py-1.5 rounded text-[13px] font-bold transition-all disabled:opacity-50">
                                {saving ? "Saving…" : "Save"}
                            </button>
                            <button onClick={() => { setDistForm(null); setDistMode(null); }}
                                className="border border-gray-300 text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded text-[13px] font-semibold transition-all">
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="bg-gray-50 border-t border-gray-200 px-5 py-3 flex justify-end shrink-0">
                    <button onClick={onClose}
                        className="px-5 py-1.5 rounded border border-gray-300 text-[13px] font-semibold text-gray-600 hover:bg-gray-100 transition-all">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Print Utility ────────────────────────────────────────────────────────────
const PRINT_CSS = `
  body{font-family:Arial,sans-serif;font-size:11px;margin:20px;color:#000}
  table{width:100%;border-collapse:collapse;margin-top:8px}
  th{background:#e5e7eb;border:1px solid #9ca3af;padding:4px 8px;font-weight:bold;text-align:left}
  td{border:1px solid #d1d5db;padding:4px 8px}
  .tr{text-align:right} .tc{text-align:center}
  @media print{@page{margin:1.5cm}}`;

function printReport(title: string, bodyHtml: string) {
    const w = window.open("", "_blank");
    if (!w) { alert("Please allow popups to print reports."); return; }
    w.document.write(`<!DOCTYPE html><html><head><title>${title}</title><style>${PRINT_CSS}</style></head><body>
      <div style="text-align:center;margin-bottom:12px">
        <div style="font-size:18px;font-weight:bold">FULL POT</div>
        <div style="font-size:11px">1516 SW 13 CT - POMPANO BEACH, FL - USA</div>
        <hr style="border:1px solid #000;margin:6px 0"/>
      </div>
      <div style="text-align:center;font-size:14px;font-weight:bold;margin-bottom:12px">${title}</div>
      <div style="font-size:10px;margin-bottom:8px">Printed: ${new Date().toLocaleString("en-US")}</div>
      ${bodyHtml}
    </body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 600);
}
