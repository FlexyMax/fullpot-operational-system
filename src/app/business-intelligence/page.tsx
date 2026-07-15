"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LineChart, Search, Loader2, XCircle, Play, Database, Save, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useAuditLog } from "@/lib/audit";
import { usePagePermissions, PERMISSION_MSGS } from "@/lib/permissions";
import AppHeader from "@/components/layout/AppHeader";
import AppFooter from "@/components/layout/AppFooter";

import { AgGridReact } from "ag-grid-react";
import {
    ModuleRegistry,
    AllCommunityModule,
    type ColDef,
    type GridApi,
    type GridReadyEvent,
    type ColumnState,
    type FilterModel,
    type ValueFormatterParams,
} from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

const EMPTY_REPORTS: BIReport[] = [];
const EMPTY_CONFIGS: BISavedConfig[] = [];

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

interface BISavedConfig {
    unico: string;
    user_uq: string;
    report_uq: string;
    name: string;
    config_json: string;
    created_at: string;
    updated_at: string;
}

interface BIConfigJson {
    range: { fechaInicio: string; fechaFin: string };
    columnState: ColumnState[];
    filterModel: FilterModel | null;
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

const apiPost = async (url: string, body: unknown) => {
    const r = await fetch(url, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
    });
    const j = await r.json();
    if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`);
    return j;
};

const apiPut = async (url: string, body: unknown) => {
    const r = await fetch(url, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
    });
    const j = await r.json();
    if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`);
    return j;
};

const apiDelete = async (url: string) => {
    const r = await fetch(url, { method: "DELETE" });
    const j = await r.json();
    if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`);
    return j;
};

function applyConfigToGrid(api: GridApi, config: BIConfigJson) {
    if (config.columnState?.length) {
        api.applyColumnState({ state: config.columnState, applyOrder: true });
    }
    api.setFilterModel(config.filterModel ?? null);
}

export default function BusinessIntelligencePage() {
    const { status } = useSession();
    const router = useRouter();
    const { logAction } = useAuditLog("business-intelligence", "flower_store_procedures");
    const perms = usePagePermissions("business-intelligence");
    const queryClient = useQueryClient();

    const [selectedUnico, setSelectedUnico] = useState<string | null>(null);
    const [search, setSearch]               = useState("");
    const [range, setRange]                 = useState(defaultRange());
    const [reportData, setReportData]       = useState<BIReportData | null>(null);
    const [configName, setConfigName]       = useState("");
    const [selectedConfigUnico, setSelectedConfigUnico] = useState<string | null>(null);
    const gridApiRef = useRef<GridApi | null>(null);
    const pendingConfigRef = useRef<BIConfigJson | null>(null);

    useEffect(() => { if (status === "unauthenticated") router.push("/login"); }, [status, router]);

    const { data: reports = EMPTY_REPORTS, isFetching: loadingReports } = useQuery<BIReport[]>({
        queryKey:  ["bi-reports"],
        queryFn:   () => biFetch("/api/bi/reports"),
        staleTime: 5 * 60 * 1000,
    });

    // Initialize first report once data is loaded. The list is fetched
    // asynchronously, so the initial selection must happen after data arrives.
    const didInitReport = useRef(false);
    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        if (reports.length > 0 && !selectedUnico && !didInitReport.current) {
            didInitReport.current = true;
            setSelectedUnico(reports[0].unico);
        }
    }, [reports, selectedUnico]);
    /* eslint-enable react-hooks/set-state-in-effect */

    const selectedReport = reports.find((r) => r.unico === selectedUnico) || null;

    const { data: savedConfigs = EMPTY_CONFIGS, isFetching: loadingSavedConfigs } = useQuery<BISavedConfig[]>({
        queryKey:  ["bi-saved-configs", selectedUnico],
        queryFn:   () => biFetch(`/api/bi/saved-configs?report_uq=${encodeURIComponent(selectedUnico ?? "")}`),
        enabled:   !!selectedUnico,
        staleTime: 30 * 1000,
    });

    const { data: allSavedConfigs = EMPTY_CONFIGS } = useQuery<BISavedConfig[]>({
        queryKey:  ["bi-saved-configs-all"],
        queryFn:   () => biFetch("/api/bi/saved-configs"),
        staleTime: 30 * 1000,
    });

    const reportsWithConfigs = useMemo(
        () => new Set(allSavedConfigs.map((c) => c.report_uq)),
        [allSavedConfigs]
    );

    const runReport = useMutation({
        mutationFn: async (reportUq?: string) => {
            const targetUq = reportUq || selectedUnico;
            if (!targetUq) throw new Error("Select a report first.");
            const res = await fetch(`/api/bi/reports/${targetUq}/data`, {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify(range),
            });
            const j = await res.json();
            if (!res.ok) throw new Error(j?.error || `HTTP ${res.status}`);
            return { data: j as BIReportData, targetUq };
        },
        onSuccess: ({ data, targetUq }) => {
            setReportData(data);
            logAction("Insert", targetUq, `${range.fechaInicio} to ${range.fechaFin} (${data.rowCount} rows)`);
            const pending = pendingConfigRef.current;
            if (pending && gridApiRef.current) {
                applyConfigToGrid(gridApiRef.current, pending);
                pendingConfigRef.current = null;
            }
            toast.success(`${data.rowCount.toLocaleString()} rows loaded.`);
        },
        onError: (e: Error) => toast.error(e.message),
    });

    const saveConfig = useMutation({
        mutationFn: async () => {
            if (!selectedUnico) throw new Error("Select a report first.");
            if (!configName.trim()) throw new Error("Enter a name for the configuration.");
            const api = gridApiRef.current;
            const payload: BIConfigJson = {
                range,
                columnState: api ? api.getColumnState() : [],
                filterModel: api ? api.getFilterModel() : null,
            };
            const body = { report_uq: selectedUnico, name: configName.trim(), config_json: JSON.stringify(payload) };
            if (selectedConfigUnico) {
                return apiPut(`/api/bi/saved-configs/${selectedConfigUnico}`, body);
            }
            return apiPost("/api/bi/saved-configs", body);
        },
        onSuccess: (data: { unico?: string; message?: string }) => {
            queryClient.invalidateQueries({ queryKey: ["bi-saved-configs", selectedUnico] });
            if (data.unico && !selectedConfigUnico) setSelectedConfigUnico(data.unico);
            toast.success(data.message || "Configuration saved.");
        },
        onError: (e: Error) => toast.error(e.message),
    });

    const deleteConfig = useMutation({
        mutationFn: async () => {
            if (!selectedConfigUnico) throw new Error("Select a configuration to delete.");
            return apiDelete(`/api/bi/saved-configs/${selectedConfigUnico}`);
        },
        onSuccess: (data: { message?: string }) => {
            queryClient.invalidateQueries({ queryKey: ["bi-saved-configs", selectedUnico] });
            setSelectedConfigUnico(null);
            setConfigName("");
            toast.success(data.message || "Configuration deleted.");
        },
        onError: (e: Error) => toast.error(e.message),
    });

    const loadConfig = useCallback((config: BISavedConfig) => {
        let parsed: BIConfigJson;
        try {
            parsed = JSON.parse(config.config_json);
        } catch {
            toast.error("Invalid saved configuration.");
            return;
        }
        setSelectedConfigUnico(config.unico);
        setConfigName(config.name);
        if (parsed.range?.fechaInicio && parsed.range?.fechaFin) {
            setRange(parsed.range);
        }
        if (config.report_uq !== selectedUnico) {
            setSelectedUnico(config.report_uq);
            setReportData(null);
        }
        pendingConfigRef.current = parsed;
        runReport.mutate(config.report_uq);
    }, [selectedUnico, runReport]);

    const onSelectReportChange = (unico: string) => {
        setSelectedUnico(unico);
        setReportData(null);
        setSelectedConfigUnico(null);
        setConfigName("");
        pendingConfigRef.current = null;
    };

    const onSelectConfigChange = (unico: string) => {
        if (!unico) {
            setSelectedConfigUnico(null);
            setConfigName("");
            return;
        }
        const config = savedConfigs.find((c) => c.unico === unico);
        if (config) loadConfig(config);
    };

    const filteredReports = useMemo(() => {
        if (!search.trim()) return reports;
        const term = search.toLowerCase();
        return reports.filter((r) => r.title.toLowerCase().includes(term));
    }, [reports, search]);

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
                valueFormatter: isNumeric
                    ? (p: ValueFormatterParams) => (p.value == null ? "" : MONEY_RE.test(col) ? `$${Number(p.value).toFixed(2)}` : Number(p.value).toLocaleString())
                    : undefined,
            };
        });
    }, [reportData]);

    const onGridReady = useCallback((e: GridReadyEvent) => {
        gridApiRef.current = e.api;
        const pending = pendingConfigRef.current;
        if (pending) {
            applyConfigToGrid(e.api, pending);
            pendingConfigRef.current = null;
        }
    }, []);

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

            {/* Report toolbar */}
            <div className="bg-white border-b border-gray-200 px-4 py-2 flex flex-col md:flex-row md:items-end gap-2 shrink-0 shadow-sm">
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
                        onChange={(e) => onSelectReportChange(e.target.value)}
                        className="w-full border border-gray-200 rounded px-3 py-2 text-[12px] font-bold text-gray-800 bg-white"
                    >
                        {filteredReports.map((r) => (
                            <option key={r.unico} value={r.unico}>
                                {r.title}{reportsWithConfigs.has(r.unico) ? "  ✓ saved" : ""}
                            </option>
                        ))}
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
                    onClick={() => runReport.mutate(undefined)}
                    disabled={!selectedUnico || runReport.isPending}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-[#FB7506] hover:bg-orange-600 text-white text-[12px] font-black uppercase tracking-wide rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                    {runReport.isPending ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                    Run Report
                </button>
            </div>

            {/* Saved configs toolbar */}
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-1.5 flex flex-col md:flex-row md:items-end gap-2 shrink-0">
                <div className="flex-1 min-w-0">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Configuration Name</label>
                    <input
                        type="text"
                        placeholder="My custom cube..."
                        value={configName}
                        onChange={(e) => setConfigName(e.target.value)}
                        className="mt-1 bg-white text-gray-800 text-[11px] border border-gray-200 outline-none rounded px-3 py-2 w-full focus:ring-1 focus:ring-[#FB7506]"
                    />
                </div>

                <div className="min-w-[220px]">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Saved Cubes</label>
                    <select
                        value={selectedConfigUnico ?? ""}
                        onChange={(e) => onSelectConfigChange(e.target.value)}
                        disabled={loadingSavedConfigs}
                        className="mt-1 w-full border border-gray-200 rounded px-3 py-2 text-[12px] font-bold text-gray-800 bg-white disabled:opacity-50"
                    >
                        <option value="">{loadingSavedConfigs ? "Loading..." : savedConfigs.length === 0 ? "No saved cubes for this report" : "Select a saved cube"}</option>
                        {savedConfigs.map((c) => (
                            <option key={c.unico} value={c.unico}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={() => saveConfig.mutate()}
                    disabled={!selectedUnico || !configName.trim() || saveConfig.isPending}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#FB7506] hover:bg-orange-600 text-white text-[11px] font-black uppercase tracking-wide rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                    {saveConfig.isPending ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                    {selectedConfigUnico ? "Update" : "Save"}
                </button>

                <button
                    onClick={() => {
                        setSelectedConfigUnico(null);
                        setConfigName("");
                    }}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 text-[11px] font-black uppercase tracking-wide rounded transition-colors shrink-0"
                >
                    <Plus size={12} />
                    New
                </button>

                <button
                    onClick={() => deleteConfig.mutate()}
                    disabled={!selectedConfigUnico || deleteConfig.isPending}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 text-[11px] font-black uppercase tracking-wide rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                    {deleteConfig.isPending ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                    Delete
                </button>
            </div>

            {runReport.isPending && (
                <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 text-[11px] font-bold text-blue-700 shrink-0">
                    Running {selectedReport?.title} — large date ranges can take a while...
                </div>
            )}

            <main className="flex-1 overflow-y-auto p-2">
                {!reportData ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-3">
                        <Database size={40} />
                        <p className="text-[11px] font-black uppercase tracking-widest">Select a report and date range, then Run Report</p>
                    </div>
                ) : (
                    <div className="h-full flex flex-col gap-1.5">
                        <div className="text-[11px] font-bold text-gray-500 shrink-0">
                            {reportData.rowCount.toLocaleString()} rows — drag fields into Row Groups / Pivot Columns / Values from the Columns panel
                        </div>
                        <div className="ag-theme-quartz flex-1 min-h-[80vh]" style={{ width: "100%" }}>
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
                            />
                        </div>
                    </div>
                )}
            </main>

            <AppFooter areaLabel="Business Intelligence" />
        </div>
    );
}
