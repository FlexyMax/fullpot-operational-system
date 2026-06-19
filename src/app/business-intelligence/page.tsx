"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { LineChart, Search, Loader2, XCircle, Play, Database } from "lucide-react";
import { toast } from "sonner";
import { useAuditLog } from "@/lib/audit";
import { usePagePermissions, PERMISSION_MSGS } from "@/lib/permissions";
import AppHeader from "@/components/layout/AppHeader";
import AppFooter from "@/components/layout/AppFooter";

import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule, type ColDef, type GridApi, type GridReadyEvent } from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

const EMPTY_ARR: any[] = [];

interface BIReport {
    unico: string;
    storeProcedure: string;
    title: string;
    description: string | null;
}

interface BIReportData {
    columns: string[];
    rows: Record<string, unknown>[];
    rowCount: number;
}

interface BIPivotConfig {
    rowGroupCols: string[];
    pivotCols: string[];
}

const PIVOT_STORAGE_PREFIX = "bi-pivot-config:";

function loadPivotConfig(reportKey: string): BIPivotConfig | null {
    try {
        const raw = localStorage.getItem(PIVOT_STORAGE_PREFIX + reportKey);
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

function savePivotConfig(reportKey: string, config: BIPivotConfig) {
    try { localStorage.setItem(PIVOT_STORAGE_PREFIX + reportKey, JSON.stringify(config)); } catch { /* localStorage unavailable — skip persistence */ }
}

const formatHeaderName = (col: string) => col.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const MONEY_RE = /sale|cost|price|charge|freight|handling|credit|debit|profit|return|commi|balance|amount|ammount|discount|fee|total|net|gross/i;

function defaultRange() {
    const end   = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    const iso = (d: Date) => d.toISOString().split("T")[0];
    return { fechaInicio: iso(start), fechaFin: iso(end) };
}

const biFetch = async (url: string) => {
    const r = await fetch(url);
    const j = await r.json();
    if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`);
    return j;
};

export default function BusinessIntelligencePage() {
    const { status } = useSession();
    const router = useRouter();
    const { logAction } = useAuditLog("business-intelligence", "flower_store_procedures");
    const perms = usePagePermissions("business-intelligence");

    const [selectedUnico, setSelectedUnico] = useState<string | null>(null);
    const [search, setSearch]               = useState("");
    const [range, setRange]                 = useState(defaultRange());
    const [reportData, setReportData]       = useState<BIReportData | null>(null);
    const gridApiRef = useRef<GridApi | null>(null);

    useEffect(() => { if (status === "unauthenticated") router.push("/login"); }, [status, router]);

    const { data: reports = EMPTY_ARR, isFetching: loadingReports } = useQuery<BIReport[]>({
        queryKey:  ["bi-reports"],
        queryFn:   () => biFetch("/api/bi/reports"),
        staleTime: 5 * 60 * 1000,
    });

    useEffect(() => {
        if ((reports as BIReport[]).length > 0 && !selectedUnico) {
            setSelectedUnico((reports as BIReport[])[0].unico);
        }
    }, [reports, selectedUnico]);

    const selectedReport = (reports as BIReport[]).find((r) => r.unico === selectedUnico) || null;

    const runReport = useMutation({
        mutationFn: async () => {
            if (!selectedUnico) throw new Error("Select a report first.");
            const res = await fetch(`/api/bi/reports/${selectedUnico}/data`, {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify(range),
            });
            const j = await res.json();
            if (!res.ok) throw new Error(j?.error || `HTTP ${res.status}`);
            return j as BIReportData;
        },
        onSuccess: (data) => {
            setReportData(data);
            if (selectedUnico) {
                logAction("Insert", selectedUnico, `${range.fechaInicio} to ${range.fechaFin} (${data.rowCount} rows)`);
            }
            toast.success(`${data.rowCount.toLocaleString()} rows loaded.`);
        },
        onError: (e: any) => toast.error(e.message),
    });

    const filteredReports = useMemo(() => {
        if (!search.trim()) return reports as BIReport[];
        const term = search.toLowerCase();
        return (reports as BIReport[]).filter((r) => r.title.toLowerCase().includes(term));
    }, [reports, search]);

    const savedConfig = useMemo(
        () => (selectedUnico ? loadPivotConfig(selectedUnico) : null),
        [selectedUnico]
    );

    const columnDefs: ColDef[] = useMemo(() => {
        if (!reportData) return [];
        return reportData.columns.map((col) => {
            const sample    = reportData.rows[0]?.[col];
            const isNumeric = typeof sample === "number";
            return {
                field:          col,
                headerName:     formatHeaderName(col),
                enableRowGroup: true,
                enablePivot:    true,
                enableValue:    isNumeric,
                aggFunc:        isNumeric ? "sum" : undefined,
                rowGroup:       savedConfig?.rowGroupCols.includes(col) ?? false,
                pivot:          savedConfig?.pivotCols.includes(col) ?? false,
                valueFormatter: isNumeric
                    ? (p: any) => (p.value == null ? "" : MONEY_RE.test(col) ? `$${Number(p.value).toFixed(2)}` : Number(p.value).toLocaleString())
                    : undefined,
            };
        });
    }, [reportData, savedConfig]);

    const persistConfig = useCallback(() => {
        if (!selectedUnico || !gridApiRef.current) return;
        const api = gridApiRef.current;
        savePivotConfig(selectedUnico, {
            rowGroupCols: api.getRowGroupColumns().map((c) => c.getColId()),
            pivotCols:    api.getPivotColumns().map((c) => c.getColId()),
        });
    }, [selectedUnico]);

    const onGridReady = useCallback((e: GridReadyEvent) => { gridApiRef.current = e.api; }, []);

    if (status === "loading" || loadingReports) {
        return <div className="flex items-center justify-center h-screen"><Loader2 size={24} className="animate-spin text-[#FB7506]" /></div>;
    }
    if (status === "unauthenticated") return null;

    if (!perms.loading && !perms.canAccess) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4 text-center px-8">
                <XCircle size={48} className="text-red-400" />
                <p className="text-sm text-gray-600 max-w-md">{PERMISSION_MSGS.access}</p>
                <button onClick={() => router.push("/menu")} className="px-4 py-2 rounded bg-gray-600 text-white text-sm font-bold">Go Back</button>
            </div>
        );
    }

    return (
        <div className="h-[100dvh] bg-[#f4f6f8] flex flex-col font-sans text-[#333] overflow-hidden">
            <AppHeader title="Business Intelligence" icon={LineChart} />

            {/* Toolbar */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex flex-col md:flex-row md:items-end gap-3 shrink-0 shadow-sm">
                <div className="flex-1 min-w-0">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Report</label>
                    <div className="relative mt-1 mb-1.5">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                        <input
                            type="text"
                            placeholder="Search reports..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-gray-50 text-gray-800 text-[11px] border border-gray-200 outline-none rounded pl-8 pr-3 py-2 w-full focus:ring-1 focus:ring-[#FB7506]"
                        />
                    </div>
                    <select
                        value={selectedUnico ?? ""}
                        onChange={(e) => { setSelectedUnico(e.target.value); setReportData(null); }}
                        className="w-full border border-gray-200 rounded px-3 py-2 text-[12px] font-bold text-gray-800 bg-white"
                    >
                        {filteredReports.map((r) => <option key={r.unico} value={r.unico}>{r.title}</option>)}
                    </select>
                </div>

                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">From</label>
                    <input
                        type="date"
                        value={range.fechaInicio}
                        onChange={(e) => setRange((r) => ({ ...r, fechaInicio: e.target.value }))}
                        className="mt-1 border border-gray-200 rounded px-3 py-2 text-[12px] font-bold text-gray-800 w-full md:w-auto"
                    />
                </div>
                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">To</label>
                    <input
                        type="date"
                        value={range.fechaFin}
                        onChange={(e) => setRange((r) => ({ ...r, fechaFin: e.target.value }))}
                        className="mt-1 border border-gray-200 rounded px-3 py-2 text-[12px] font-bold text-gray-800 w-full md:w-auto"
                    />
                </div>

                <button
                    onClick={() => runReport.mutate()}
                    disabled={!selectedUnico || runReport.isPending}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-[#FB7506] hover:bg-orange-600 text-white text-[12px] font-black uppercase tracking-wide rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                    {runReport.isPending ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                    Run Report
                </button>
            </div>

            {runReport.isPending && (
                <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 text-[11px] font-bold text-blue-700 shrink-0">
                    Running {selectedReport?.title} — large date ranges can take a while...
                </div>
            )}

            <main className="flex-1 overflow-hidden p-3">
                {!reportData ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-3">
                        <Database size={40} />
                        <p className="text-[11px] font-black uppercase tracking-widest">Select a report and date range, then Run Report</p>
                    </div>
                ) : (
                    <div className="h-full flex flex-col gap-2">
                        <div className="text-[11px] font-bold text-gray-500 shrink-0">
                            {reportData.rowCount.toLocaleString()} rows — drag fields into Row Groups / Pivot Columns / Values from the Columns panel
                        </div>
                        <div className="ag-theme-quartz flex-1" style={{ width: "100%" }}>
                            <AgGridReact
                                theme="legacy"
                                rowData={reportData.rows}
                                columnDefs={columnDefs}
                                pivotMode={true}
                                sideBar={["columns", "filters"]}
                                defaultColDef={{ resizable: true, sortable: true, filter: true }}
                                animateRows={false}
                                suppressAggFuncInHeader={false}
                                onGridReady={onGridReady}
                                onColumnRowGroupChanged={persistConfig}
                                onColumnPivotChanged={persistConfig}
                                onColumnValueChanged={persistConfig}
                            />
                        </div>
                    </div>
                )}
            </main>

            <AppFooter areaLabel="Business Intelligence" />
        </div>
    );
}
