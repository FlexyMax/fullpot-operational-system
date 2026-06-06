"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Plus, Pencil, Trash2, Save, X, RefreshCcw,
    Copy, Zap, Building2, Cloud, MapPin, Check, AlertCircle,
    XCircle, Search, ChevronLeft, Menu, Download, Truck
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import PanelGrid from "@/components/ui/PanelGrid";
import { PanelGridTable, PanelGridThead, PanelGridTh, PanelGridTbody, PanelGridTr, PanelGridTd } from "@/components/ui/PanelGridTable";
import { GridMenu } from "@/components/GridMenu";

import { cn } from "@/lib/utils";
import { AppFooter } from "@/components/layout/AppFooter";
import { useAuditLog } from "@/lib/audit";
import { usePagePermissions, PERMISSION_MSGS } from "@/lib/permissions";
import { AuditLogModal } from "@/components/AuditLogModal";
import { EntityListModal } from "@/components/EntityListModal";
import { EntityFormModal } from "@/components/EntityFormModal";

// --- Helpers ---
const t       = (v: any) => String(v ?? "").trim();
const ff      = async (url: string) => { const r = await fetch(url); const j = await r.json(); if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`); return j; };

// --- Empty forms ---
const EMPTY_WH   = { wp_name:"", cargo:false, send_xml:false, charge:false, address:"", city:"", state:"", zipcode:"", country:"", phone:"", fax:"", email:"", grower_uq:"", handling_kg:0, send_to_whouse:false };
const EMPTY_FR   = { wphysical_uq:"", season_uq:"", city_uq:"", freight:0, freight_kg:0 };
const EMPTY_HA   = { wphysical_uq:"", season_uq:"", handling:0 };
const EMPTY_AT   = { wphysical_uq:"", season_uq:"", city_uq:"", tariff:0 };
const EMPTY_SE   = { season:"", sh_season:"", startdate:"", enddate:"", activedate:"", desacdate:"", publicate:false, increment:0, bypercent:false };
const EMPTY_CI   = { country_iso:"", city:"", buyer_email:"" };
const EMPTY_AL   = { cod_linea:"", airline:"", address:"", city:"", country:"", phone:"", fax:"", email:"", contact:"" };

// --- Main Page ---
export default function FreightsSetupPage() {
    const { status } = useSession();
    const router = useRouter();
    const qc     = useQueryClient();
    const { logAction } = useAuditLog("freights-setup", "flower_warehouses_physical");
    const perms = usePagePermissions("freights-setup");

    // Selection state
    const [selWh,  setSelWh]  = useState<any>(null);
    const [selFr,  setSelFr]  = useState<any>(null);
    const [selHa,  setSelHa]  = useState<any>(null);
    const [selAt,  setSelAt]  = useState<any>(null);
    const [selSe,  setSelSe]  = useState<any>(null);

    // Modal state
    const [whModal,  setWhModal]  = useState<{ mode:"add"|"edit"|"delete" } | null>(null);
    const [frModal,  setFrModal]  = useState<{ mode:"add"|"edit"|"delete" } | null>(null);
    const [haModal,  setHaModal]  = useState<{ mode:"add"|"edit"|"delete" } | null>(null);
    const [atModal,  setAtModal]  = useState<{ mode:"add"|"edit"|"delete" } | null>(null);
    const [copyModal, setCopyModal] = useState(false);

    // Seasons form state
    const [seFormOpen, setSeFormOpen] = useState(false);
    const [seFormMode, setSeFormMode] = useState<"add"|"edit">("add");
    const [seForm, setSeForm] = useState<any>(EMPTY_SE);
    const [seError, setSeError] = useState<string|null>(null);
    const [seSaving, setSeSaving] = useState(false);

    // Cities / Airlines list + form state
    const [ciSetup, setCiSetup] = useState(false);
    const [ciFormOpen, setCiFormOpen] = useState(false);
    const [ciFormMode, setCiFormMode] = useState<"add"|"edit">("add");
    const [ciSel, setCiSel] = useState<any>(null);
    const [ciForm, setCiForm] = useState<any>(EMPTY_CI);
    const [ciError, setCiError] = useState<string|null>(null);
    const [ciSaving, setCiSaving] = useState(false);

    const [alSetup, setAlSetup] = useState(false);
    const [alFormOpen, setAlFormOpen] = useState(false);
    const [alFormMode, setAlFormMode] = useState<"add"|"edit">("add");
    const [alSel, setAlSel] = useState<any>(null);
    const [alForm, setAlForm] = useState<any>(EMPTY_AL);
    const [alError, setAlError] = useState<string|null>(null);
    const [alSaving, setAlSaving] = useState(false);

    // Form state
    const [whForm, setWhForm] = useState<any>(EMPTY_WH);
    const [frForm, setFrForm] = useState<any>(EMPTY_FR);
    const [haForm, setHaForm] = useState<any>(EMPTY_HA);
    const [atForm, setAtForm] = useState<any>(EMPTY_AT);
    const [error,  setError]  = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // Search
    const [whSearch, setWhSearch] = useState("");

    useEffect(() => { if (status === "unauthenticated") router.push("/login"); }, [status, router]);

    // --- Queries ---
    const { data: warehouses = [], isFetching: loadingWh }  = useQuery({ queryKey: ["fr-wh"],       queryFn: () => ff("/api/freights/warehouses") });
    const { data: freights   = [], isFetching: loadingFr, refetch: refetchFr }  = useQuery({ queryKey: ["fr-fr", selWh?.unico], queryFn: () => ff(`/api/freights/rates?warehouse=${selWh.unico}`),    enabled: !!selWh?.unico, retry: false });
    const { data: handling   = [], isFetching: loadingHa, refetch: refetchHa }  = useQuery({ queryKey: ["fr-ha", selWh?.unico], queryFn: () => ff(`/api/freights/handling?warehouse=${selWh.unico}`), enabled: !!selWh?.unico, retry: false });
    const { data: atpda      = [], isFetching: loadingAt, refetch: refetchAt }  = useQuery({ queryKey: ["fr-at", selWh?.unico], queryFn: () => ff(`/api/freights/atpda?warehouse=${selWh.unico}`),    enabled: !!selWh?.unico, retry: false });
    const { data: seasons    = [], refetch: refetchSe }  = useQuery({ queryKey: ["fr-se"], queryFn: () => ff("/api/freights/seasons") });
    const { data: cities     = [] }  = useQuery({ queryKey: ["fr-ci"], queryFn: () => ff("/api/freights/cities") });
    const { data: airlines   = [] }  = useQuery({ queryKey: ["fr-al"], queryFn: () => ff("/api/freights/airlines") });
    const { data: whDetail, isFetching: loadingDetail } = useQuery({ queryKey: ["fr-wh-detail", selWh?.unico], queryFn: () => ff(`/api/freights/warehouses/${selWh.unico}`), enabled: !!selWh?.unico });

    // Filtered warehouses
    const filteredWh = (warehouses as any[]).filter((w: any) => {
        if (!whSearch.trim()) return true;
        const q = whSearch.toLowerCase();
        return t(w.wp_name).toLowerCase().includes(q) || t(w.city).toLowerCase().includes(q);
    });

    // --- Tabs ---
    const [activeTab, setActiveTab] = useState<"freight"|"handling"|"atpda">("freight");

    // --- Detail form mode ---
    const [mode, setMode] = useState<"view"|"add"|"edit">("view");
    const [form, setForm] = useState<any>({});
    const [detailType, setDetailType] = useState<"wh"|"fr"|"ha"|"at"|null>(null);

    // Load detail when selection changes
    useEffect(() => {
        if (whDetail) {
            setWhForm(whDetail);
            setForm(whDetail);
            setDetailType("wh");
            setMode("view");
        }
    }, [whDetail]);

    // --- CRUD handlers ---
    const save = async () => {
        setSaving(true); setError(null);
        try {
            let url = "", method = "POST", body = {};
            if (detailType === "wh") {
                url = mode === "add" ? "/api/freights/warehouses" : `/api/freights/warehouses/${selWh?.unico}`;
                method = mode === "add" ? "POST" : "PUT";
                body = whForm;
            } else if (detailType === "fr") {
                url = mode === "add" ? "/api/freights/rates" : `/api/freights/rates/${selFr?.unico}`;
                method = mode === "add" ? "POST" : "PUT";
                body = frForm;
            } else if (detailType === "ha") {
                url = mode === "add" ? "/api/freights/handling" : `/api/freights/handling/${selHa?.unico}`;
                method = mode === "add" ? "POST" : "PUT";
                body = haForm;
            } else if (detailType === "at") {
                url = mode === "add" ? "/api/freights/atpda" : `/api/freights/atpda/${selAt?.unico}`;
                method = mode === "add" ? "POST" : "PUT";
                body = atForm;
            }
            const res = await fetch(url, { method, headers:{"Content-Type":"application/json"}, body: JSON.stringify(body) });
            const data = await res.json(); if (!data.success) throw new Error(data.error);
            logAction(mode === "add" ? "Insert" : "Edit", data.unico || selWh?.unico);
            setMode("view");
            await qc.invalidateQueries({ queryKey: ["fr-wh"] });
            if (detailType === "fr") await refetchFr();
            if (detailType === "ha") await refetchHa();
            if (detailType === "at") await refetchAt();
        } catch (e: any) { setError(e.message); }
        finally { setSaving(false); }
    };

    const deleteItem = async (type: string, unico: string) => {
        setSaving(true); setError(null);
        try {
            const res = await fetch(`/api/freights/${type}/${unico}`, { method:"DELETE" });
            const data = await res.json(); if (!data.success) throw new Error(data.error);
            logAction("Delete", unico);
            await qc.invalidateQueries({ queryKey: ["fr-wh"] });
            if (type === "rates") { setSelFr(null); await refetchFr(); }
            if (type === "handling") { setSelHa(null); await refetchHa(); }
            if (type === "atpda") { setSelAt(null); await refetchAt(); }
        } catch (e: any) { setError(e.message); }
        finally { setSaving(false); }
    };

    // --- Field definitions for detail form ---
    const whFields = [
        { k:"wp_name", l:"Warehouse Name", r:true },
        { k:"address", l:"Address" },
        { k:"city",    l:"City" },
        { k:"state",   l:"State" },
        { k:"zipcode", l:"Zip" },
        { k:"country", l:"Country" },
        { k:"phone",   l:"Phone" },
        { k:"fax",     l:"Fax" },
        { k:"email",   l:"Email", t:"email" },
        { k:"handling_kg", l:"Handling/KG", t:"number" },
    ];
    const whChecks = [
        { k:"cargo", l:"Cargo" },
        { k:"send_xml", l:"Send XML" },
        { k:"charge", l:"Charge" },
        { k:"send_to_whouse", l:"Send to WH" },
    ];

    const frFields = [
        { k:"freight", l:"Freight", t:"number" },
        { k:"freight_kg", l:"Freight/KG", t:"number" },
    ];
    const haFields = [
        { k:"handling", l:"Handling", t:"number" },
    ];
    const atFields = [
        { k:"tariff", l:"Tariff %", t:"number" },
    ];

    const getFields = () => {
        if (detailType === "wh") return whFields;
        if (detailType === "fr") return frFields;
        if (detailType === "ha") return haFields;
        if (detailType === "at") return atFields;
        return [];
    };
    const checkFields = detailType === "wh" ? whChecks : [];

    if (status === "loading") return null;

    return (
        <div className="flex flex-col h-[100dvh] bg-[#f4f6f8] overflow-hidden font-sans text-[#333]">

            <AppHeader title="Freights" />

            {/* Search toolbar */}
            <div className="bg-white border-b border-gray-200 px-3 py-2 flex items-center gap-2 shrink-0 shadow-sm flex-wrap">
                <div className="relative">
                    <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={whSearch} onChange={e => setWhSearch(e.target.value)}
                        placeholder="Search warehouses..." className="pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded outline-none focus:ring-1 focus:ring-[#FB7506] w-52" />
                </div>
                <button onClick={() => qc.invalidateQueries({ queryKey: ["fr-wh"] })} className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 border border-gray-200 px-2.5 py-1 rounded text-[10px] font-black uppercase transition-all">
                    <RefreshCcw size={10} className={loadingWh ? "animate-spin" : ""} /> Refresh
                </button>
                <GridMenu items={[
                    { label: "Add Warehouse", icon: Plus, color: "green", onClick: () => { setWhForm({...EMPTY_WH}); setError(null); setDetailType("wh"); setMode("add"); }, disabled: !perms.canCreate },
                    { label: "Edit Warehouse", icon: Pencil, color: "orange", onClick: () => { if(selWh && whDetail){ setWhForm(whDetail); setError(null); setDetailType("wh"); setMode("edit"); } }, disabled: !selWh || !perms.canEdit },
                    { label: "Delete Warehouse", icon: Trash2, color: "red", onClick: () => { if(selWh && confirm(`Delete "${t(selWh.wp_name)}"?`)) deleteItem("warehouses", selWh.unico); }, disabled: !selWh || !perms.canDelete },
                    { separator: true },
                    { label: "Seasons Setup", icon: Cloud, color: "blue", onClick: () => setSeFormOpen(true) },
                    { label: "Cities Setup", icon: MapPin, color: "blue", onClick: () => setCiSetup(true) },
                    { label: "Airlines Setup", icon: Truck, color: "blue", onClick: () => setAlSetup(true) },
                    { separator: true },
                    { label: "Copy Rates", icon: Copy, color: "gray", onClick: () => { if(!selWh){setError("Select a warehouse first.");return;} setCopyModal(true); }, disabled: !selWh },
                ]} />
                <AuditLogModal recordId={selWh?.unico} disabled={!selWh?.unico} />
                {error && <span className="text-amber-600 text-[10px] font-bold flex items-center gap-1 ml-2"><AlertCircle size={11} />{error}</span>}
            </div>

            {/* Main layout */}
            <div className="flex flex-col lg:flex-row flex-1 gap-2 p-2 overflow-y-auto lg:overflow-hidden">

                {/* --- Left: Warehouse List PanelGrid --- */}
                <PanelGrid
                    title="Warehouses"
                    icon={Building2}
                    recordCount={filteredWh.length}
                    refreshing={loadingWh}
                    headerRight={<AuditLogModal recordId={selWh?.unico} disabled={!selWh?.unico} bareButton />}
                    menuItems={[
                        { label: "Add Warehouse", icon: Plus, color: "green", onClick: () => { setWhForm({...EMPTY_WH}); setError(null); setDetailType("wh"); setMode("add"); }, disabled: !perms.canCreate },
                        { label: "Edit Warehouse", icon: Pencil, color: "orange", onClick: () => { if(selWh && whDetail){ setWhForm(whDetail); setError(null); setDetailType("wh"); setMode("edit"); } }, disabled: !selWh || !perms.canEdit },
                        { label: "Delete Warehouse", icon: Trash2, color: "orange", onClick: () => { if(selWh && confirm(`Delete "${t(selWh.wp_name)}"?`)) deleteItem("warehouses", selWh.unico); }, disabled: !selWh || !perms.canDelete },
                    ]}
                    className="hidden lg:flex w-[240px] shrink-0"
                >
                    <div className="overflow-y-auto flex-1">
                        <PanelGridTable>
                            <PanelGridThead>
                                <PanelGridTh>Warehouse</PanelGridTh>
                                <PanelGridTh>City</PanelGridTh>
                                <PanelGridTh align="center">Cargo</PanelGridTh>
                            </PanelGridThead>
                            <PanelGridTbody>
                                {filteredWh.map((w: any) => (
                                    <PanelGridTr key={w.unico} selected={selWh?.unico === w.unico}
                                        onClick={() => { setSelWh(w); setSelFr(null); setSelHa(null); setSelAt(null); }}>
                                        <PanelGridTd className="font-semibold max-w-[140px] truncate">{t(w.wp_name)}</PanelGridTd>
                                        <PanelGridTd className="max-w-[100px] truncate">{t(w.city)}</PanelGridTd>
                                        <PanelGridTd align="center">{w.cargo ? <Check size={10} className="text-green-500 mx-auto" /> : "\u2014"}</PanelGridTd>
                                    </PanelGridTr>
                                ))}
                            </PanelGridTbody>
                        </PanelGridTable>
                    </div>
                </PanelGrid>

                {/* --- Right: Detail + Tabs --- */}
                <div className="flex-1 flex flex-col min-w-0 gap-2 lg:overflow-hidden">

                    {/* Detail form card */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col overflow-hidden shrink-0">
                        {/* Form header bar */}
                        <div className="h-10 bg-[#374151] flex items-center px-3 gap-2 shrink-0">
                            <Building2 size={14} className="text-[#FB7506] shrink-0" />
                            <span className="text-white text-xs font-black uppercase tracking-wider truncate">
                                {mode === "add" ? `New ${detailType === "wh" ? "Warehouse" : "Rate"}` : t(whForm.wp_name) || "Warehouse Details"}
                            </span>

                            <div className="flex-1" />

                            {error && <span className="flex items-center gap-1 text-amber-400 text-[10px] font-bold ml-1 truncate"><AlertCircle size={12} />{error}</span>}

                            {mode !== "view" && (
                                <div className="flex items-center gap-1.5 px-2 border-r border-white/20">
                                    <button onClick={save} disabled={saving}
                                        className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-1.5 rounded text-xs font-black uppercase tracking-wider transition-all">
                                        {saving ? <RefreshCcw size={14} className="animate-spin" /> : <Save size={14} />}{saving ? "Saving..." : "Save"}
                                    </button>
                                    <button onClick={() => { setMode("view"); setError(null); if(whDetail) setWhForm(whDetail); }}
                                        className="flex items-center gap-1.5 bg-gray-500 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-xs font-black uppercase tracking-wider transition-all">
                                        <X size={14} />Cancel
                                    </button>
                                </div>
                            )}

                            <AuditLogModal recordId={selWh?.unico} disabled={!selWh?.unico} />
                        </div>

                        {/* Form fields */}
                        <div className="p-3">
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 text-xs">
                                {getFields().map((f: any) => (
                                    <div key={f.k} className={cn("flex flex-col gap-0.5", f.r && "col-span-2")}>
                                        <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">{f.l}</label>
                                        <input type={f.t || "text"} value={form[f.k] ?? ""} readOnly={mode === "view"}
                                            onChange={e => {
                                                const v = f.t === "number" ? parseFloat(e.target.value) || 0 : e.target.value;
                                                setForm((p: any) => ({...p, [f.k]: v}));
                                                if (detailType === "wh") setWhForm((p: any) => ({...p, [f.k]: v}));
                                            }}
                                            className={cn("fos-input h-10 text-sm", mode === "view" && "bg-gray-50 text-gray-600 cursor-default")} />
                                    </div>
                                ))}
                                {checkFields.length > 0 && (
                                    <div className="flex flex-wrap gap-4 pt-3 mt-1 border-t border-gray-100 col-span-full">
                                        {checkFields.map((c: any) => (
                                            <label key={c.k} className={cn("flex items-center gap-2", mode !== "view" && "cursor-pointer")}>
                                                <input type="checkbox" checked={!!form[c.k]}
                                                    disabled={mode === "view"}
                                                    onChange={e => mode !== "view" && setForm((p: any) => ({...p, [c.k]: e.target.checked}))}
                                                    className="w-4 h-4 accent-[#FB7506]" />
                                                <span className="text-xs font-semibold text-gray-600">{c.l}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tabs area */}
                    <div className="flex flex-col flex-1 overflow-hidden">
                        {/* Tab bar */}
                        <div className="bg-[#374151] flex items-end px-2 gap-0.5 shrink-0 h-9">
                            {([
                                { id:"freight",  label:"Freight Rates", icon:Zap },
                                { id:"handling", label:"Handling",      icon:Building2 },
                                { id:"atpda",    label:"ATPDA",         icon:MapPin },
                            ] as const).map(tab => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                    className={cn("flex items-center gap-1.5 px-4 h-7 text-[10px] font-black uppercase tracking-wider rounded-t transition-all",
                                        activeTab === tab.id ? "bg-[#f4f6f8] text-[#FB7506]" : "text-gray-400 hover:text-white hover:bg-white/10")}>
                                    <tab.icon size={11} />{tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab content */}
                        <div className="flex-1 overflow-hidden bg-[#f4f6f8] p-2 flex flex-col gap-2">

                            {/* --- FREIGHT RATES TAB --- */}
                            {activeTab === "freight" && (
                                <PanelGrid
                                    title="Freight Rates"
                                    icon={Zap}
                                    recordCount={(freights as any[]).length}
                                    refreshing={loadingFr}
                                    onRefresh={() => { if (selWh) refetchFr(); }}
                                    headerRight={<AuditLogModal recordId={selFr?.unico} disabled={!selFr?.unico} bareButton />}
                                    menuItems={[
                                        { label: "Add Rate", icon: Plus, color: "green", onClick: () => { if(!selWh){setError("Select a warehouse first.");return;} setFrForm({...EMPTY_FR, wphysical_uq: selWh.unico}); setError(null); setFrModal({mode:"add"}); }, disabled: !selWh || !perms.canCreate },
                                        { label: "Edit Rate", icon: Pencil, color: "orange", onClick: async() => { if(!selFr) return; try { const d = await ff(`/api/freights/rates/${selFr.unico}`); setFrForm({ wphysical_uq: d.wphysical_uq||selWh?.unico, season_uq: d.season_uq||"", city_uq: d.city_uq||"", freight: d.freight||0, freight_kg: d.freight_kg||0 }); setError(null); setFrModal({mode:"edit"}); } catch(e:any){setError(e.message);} }, disabled: !selFr || !perms.canEdit },
                                        { label: "Delete Rate", icon: Trash2, color: "orange", onClick: () => { if(selFr){setError(null);setFrModal({mode:"delete"});} }, disabled: !selFr || !perms.canDelete },
                                        { separator: true },
                                        { label: "Copy Rates", icon: Copy, color: "gray", onClick: () => { if(!selWh){setError("Select a warehouse first.");return;} setCopyModal(true); }, disabled: !selWh },
                                    ]}
                                    className="flex-1 min-h-0 flex flex-col"
                                >
                                    <div className="overflow-auto flex-1">
                                        <PanelGridTable>
                                            <PanelGridThead>
                                                <PanelGridTh>Season</PanelGridTh>
                                                <PanelGridTh>City</PanelGridTh>
                                                <PanelGridTh align="right">Freight</PanelGridTh>
                                                <PanelGridTh align="right">FreightKG</PanelGridTh>
                                            </PanelGridThead>
                                            <PanelGridTbody>
                                                {(freights as any[]).length === 0 ? (
                                                    <PanelGridTr><PanelGridTd className="text-center text-gray-400 py-6" colSpan={4}>{selWh ? "No freight rates" : "Select a warehouse"}</PanelGridTd></PanelGridTr>
                                                ) : (freights as any[]).map((r: any) => (
                                                    <PanelGridTr key={r.unico} selected={selFr?.unico === r.unico} onClick={() => setSelFr(r)}>
                                                        <PanelGridTd>{t(r.season)}</PanelGridTd>
                                                        <PanelGridTd>{t(r.city)}</PanelGridTd>
                                                        <PanelGridTd align="right">{parseFloat(r.freight||0).toFixed(2)}</PanelGridTd>
                                                        <PanelGridTd align="right">{parseFloat(r.freight_kg||0).toFixed(2)}</PanelGridTd>
                                                    </PanelGridTr>
                                                ))}
                                            </PanelGridTbody>
                                        </PanelGridTable>
                                    </div>
                                </PanelGrid>
                            )}

                            {/* --- HANDLING TAB --- */}
                            {activeTab === "handling" && (
                                <PanelGrid
                                    title="Handling"
                                    icon={Building2}
                                    recordCount={(handling as any[]).length}
                                    refreshing={loadingHa}
                                    onRefresh={() => { if (selWh) refetchHa(); }}
                                    headerRight={<AuditLogModal recordId={selHa?.unico} disabled={!selHa?.unico} bareButton />}
                                    menuItems={[
                                        { label: "Add Rate", icon: Plus, color: "green", onClick: () => { if(!selWh){setError("Select a warehouse first.");return;} setHaForm({...EMPTY_HA, wphysical_uq: selWh.unico}); setError(null); setHaModal({mode:"add"}); }, disabled: !selWh || !perms.canCreate },
                                        { label: "Edit Rate", icon: Pencil, color: "orange", onClick: async() => { if(!selHa) return; try { const d = await ff(`/api/freights/handling/${selHa.unico}`); setHaForm({ wphysical_uq: d.wphysical_uq||selWh?.unico, season_uq: d.season_uq||"", handling: d.handling||0 }); setError(null); setHaModal({mode:"edit"}); } catch(e:any){setError(e.message);} }, disabled: !selHa || !perms.canEdit },
                                        { label: "Delete Rate", icon: Trash2, color: "orange", onClick: () => { if(selHa){setError(null);setHaModal({mode:"delete"});} }, disabled: !selHa || !perms.canDelete },
                                    ]}
                                    className="flex-1 min-h-0 flex flex-col"
                                >
                                    <div className="overflow-auto flex-1">
                                        <PanelGridTable>
                                            <PanelGridThead>
                                                <PanelGridTh>Season</PanelGridTh>
                                                <PanelGridTh align="right">HandlingFB</PanelGridTh>
                                            </PanelGridThead>
                                            <PanelGridTbody>
                                                {(handling as any[]).length === 0 ? (
                                                    <PanelGridTr><PanelGridTd className="text-center text-gray-400 py-6" colSpan={2}>{selWh ? "No handling rates" : "Select a warehouse"}</PanelGridTd></PanelGridTr>
                                                ) : (handling as any[]).map((r: any) => (
                                                    <PanelGridTr key={r.unico} selected={selHa?.unico === r.unico} onClick={() => setSelHa(r)}>
                                                        <PanelGridTd>{t(r.season)}</PanelGridTd>
                                                        <PanelGridTd align="right">{parseFloat(r.handling||0).toFixed(4)}</PanelGridTd>
                                                    </PanelGridTr>
                                                ))}
                                            </PanelGridTbody>
                                        </PanelGridTable>
                                    </div>
                                </PanelGrid>
                            )}

                            {/* --- ATPDA TAB --- */}
                            {activeTab === "atpda" && (
                                <PanelGrid
                                    title="ATPDA"
                                    icon={MapPin}
                                    recordCount={(atpda as any[]).length}
                                    refreshing={loadingAt}
                                    onRefresh={() => { if (selWh) refetchAt(); }}
                                    headerRight={<AuditLogModal recordId={selAt?.unico} disabled={!selAt?.unico} bareButton />}
                                    menuItems={[
                                        { label: "Add Tariff", icon: Plus, color: "green", onClick: () => { if(!selWh){setError("Select a warehouse first.");return;} setAtForm({...EMPTY_AT, wphysical_uq: selWh.unico}); setError(null); setAtModal({mode:"add"}); }, disabled: !selWh || !perms.canCreate },
                                        { label: "Edit Tariff", icon: Pencil, color: "orange", onClick: async() => { if(!selAt) return; try { const d = await ff(`/api/freights/atpda/${selAt.unico}`); setAtForm({ wphysical_uq: d.wphysical_uq||selWh?.unico, season_uq: d.season_uq||"", city_uq: d.city_uq||"", tariff: d.tariff||0 }); setError(null); setAtModal({mode:"edit"}); } catch(e:any){setError(e.message);} }, disabled: !selAt || !perms.canEdit },
                                        { label: "Delete Tariff", icon: Trash2, color: "orange", onClick: () => { if(selAt){setError(null);setAtModal({mode:"delete"});} }, disabled: !selAt || !perms.canDelete },
                                    ]}
                                    className="flex-1 min-h-0 flex flex-col"
                                >
                                    <div className="overflow-auto flex-1">
                                        <PanelGridTable>
                                            <PanelGridThead>
                                                <PanelGridTh>Season</PanelGridTh>
                                                <PanelGridTh>City</PanelGridTh>
                                                <PanelGridTh align="right">Tariff%</PanelGridTh>
                                            </PanelGridThead>
                                            <PanelGridTbody>
                                                {(atpda as any[]).length === 0 ? (
                                                    <PanelGridTr><PanelGridTd className="text-center text-gray-400 py-6" colSpan={3}>{selWh ? "No ATPDA tariffs" : "Select a warehouse"}</PanelGridTd></PanelGridTr>
                                                ) : (atpda as any[]).map((r: any) => (
                                                    <PanelGridTr key={r.unico} selected={selAt?.unico === r.unico} onClick={() => setSelAt(r)}>
                                                        <PanelGridTd>{t(r.season)}</PanelGridTd>
                                                        <PanelGridTd>{t(r.city)}</PanelGridTd>
                                                        <PanelGridTd align="right">{parseFloat(r.tariff||0).toFixed(2)}%</PanelGridTd>
                                                    </PanelGridTr>
                                                ))}
                                            </PanelGridTbody>
                                        </PanelGridTable>
                                    </div>
                                </PanelGrid>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <AppFooter areaLabel="Masters" />

            {/* --- Inline Modals (same pattern as carriers) --- */}

            {/* Freight Rate Modal */}
            {frModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
                        <PanelGrid title={`${frModal.mode === "add" ? "Add" : frModal.mode === "edit" ? "Edit" : "Delete"} Freight Rate`} icon={Zap}
                            headerRight={<button onClick={() => { setFrModal(null); setError(null); }} className="text-gray-400 hover:text-white transition-colors"><X size={16} /></button>}>
                            <div className="p-4 space-y-3">
                                {error && <div className="bg-red-50 border border-red-200 rounded px-3 py-2 text-xs text-red-600 font-bold">{error}</div>}
                                {frModal.mode === "delete" ? (
                                    <p className="text-sm text-gray-600">Delete this freight rate?</p>
                                ) : (
                                    <>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[11px] font-black text-gray-500 uppercase">Season</label>
                                            <select value={frForm.season_uq} onChange={e => setFrForm((p:any) => ({...p, season_uq: e.target.value}))} className="fos-input h-10 text-sm">
                                                <option value="">Select...</option>
                                                {(seasons as any[]).map((s:any) => <option key={s.unico} value={s.unico}>{t(s.season)}</option>)}
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[11px] font-black text-gray-500 uppercase">City</label>
                                            <select value={frForm.city_uq} onChange={e => setFrForm((p:any) => ({...p, city_uq: e.target.value}))} className="fos-input h-10 text-sm">
                                                <option value="">Select...</option>
                                                {(cities as any[]).map((c:any) => <option key={c.unico} value={c.unico}>{t(c.city)}</option>)}
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[11px] font-black text-gray-500 uppercase">Freight</label>
                                            <input type="number" value={frForm.freight} onChange={e => setFrForm((p:any) => ({...p, freight: parseFloat(e.target.value)||0}))} className="fos-input h-10 text-sm" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[11px] font-black text-gray-500 uppercase">Freight/KG</label>
                                            <input type="number" value={frForm.freight_kg} onChange={e => setFrForm((p:any) => ({...p, freight_kg: parseFloat(e.target.value)||0}))} className="fos-input h-10 text-sm" />
                                        </div>
                                    </>
                                )}
                                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                                    <button onClick={() => { setFrModal(null); setError(null); }} className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-800">Cancel</button>
                                    <button onClick={async () => {
                                        setSaving(true); setError(null);
                                        try {
                                            if (frModal.mode === "delete") { await deleteItem("rates", selFr!.unico); }
                                            else {
                                                const url = frModal.mode === "add" ? "/api/freights/rates" : `/api/freights/rates/${selFr?.unico}`;
                                                const res = await fetch(url, { method: frModal.mode === "add" ? "POST" : "PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify(frForm) });
                                                const data = await res.json(); if (!data.success) throw new Error(data.error);
                                                logAction(frModal.mode === "add" ? "Insert" : "Edit", data.unico || selFr?.unico);
                                            }
                                            setFrModal(null); await refetchFr();
                                        } catch(e:any){setError(e.message);} finally{setSaving(false);}
                                    }} disabled={saving} className="flex items-center gap-1.5 bg-[#FB7506] hover:bg-orange-600 disabled:opacity-50 text-white px-4 py-2 rounded text-xs font-black uppercase tracking-wider">
                                        {saving ? <RefreshCcw size={14} className="animate-spin" /> : <Save size={14} />}{saving ? "Saving..." : frModal.mode === "delete" ? "Delete" : "Save"}
                                    </button>
                                </div>
                            </div>
                        </PanelGrid>
                    </div>
                </div>
            )}

            {/* Handling Modal */}
            {haModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
                        <PanelGrid title={`${haModal.mode === "add" ? "Add" : haModal.mode === "edit" ? "Edit" : "Delete"} Handling Rate`} icon={Building2}
                            headerRight={<button onClick={() => { setHaModal(null); setError(null); }} className="text-gray-400 hover:text-white transition-colors"><X size={16} /></button>}>
                            <div className="p-4 space-y-3">
                                {error && <div className="bg-red-50 border border-red-200 rounded px-3 py-2 text-xs text-red-600 font-bold">{error}</div>}
                                {haModal.mode === "delete" ? (
                                    <p className="text-sm text-gray-600">Delete this handling rate?</p>
                                ) : (
                                    <>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[11px] font-black text-gray-500 uppercase">Season</label>
                                            <select value={haForm.season_uq} onChange={e => setHaForm((p:any) => ({...p, season_uq: e.target.value}))} className="fos-input h-10 text-sm">
                                                <option value="">Select...</option>
                                                {(seasons as any[]).map((s:any) => <option key={s.unico} value={s.unico}>{t(s.season)}</option>)}
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[11px] font-black text-gray-500 uppercase">Handling</label>
                                            <input type="number" value={haForm.handling} onChange={e => setHaForm((p:any) => ({...p, handling: parseFloat(e.target.value)||0}))} className="fos-input h-10 text-sm" />
                                        </div>
                                    </>
                                )}
                                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                                    <button onClick={() => { setHaModal(null); setError(null); }} className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-800">Cancel</button>
                                    <button onClick={async () => {
                                        setSaving(true); setError(null);
                                        try {
                                            if (haModal.mode === "delete") { await deleteItem("handling", selHa!.unico); }
                                            else {
                                                const url = haModal.mode === "add" ? "/api/freights/handling" : `/api/freights/handling/${selHa?.unico}`;
                                                const res = await fetch(url, { method: haModal.mode === "add" ? "POST" : "PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify(haForm) });
                                                const data = await res.json(); if (!data.success) throw new Error(data.error);
                                                logAction(haModal.mode === "add" ? "Insert" : "Edit", data.unico || selHa?.unico);
                                            }
                                            setHaModal(null); await refetchHa();
                                        } catch(e:any){setError(e.message);} finally{setSaving(false);}
                                    }} disabled={saving} className="flex items-center gap-1.5 bg-[#FB7506] hover:bg-orange-600 disabled:opacity-50 text-white px-4 py-2 rounded text-xs font-black uppercase tracking-wider">
                                        {saving ? <RefreshCcw size={14} className="animate-spin" /> : <Save size={14} />}{saving ? "Saving..." : haModal.mode === "delete" ? "Delete" : "Save"}
                                    </button>
                                </div>
                            </div>
                        </PanelGrid>
                    </div>
                </div>
            )}

            {/* ATPDA Modal */}
            {atModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
                        <PanelGrid title={`${atModal.mode === "add" ? "Add" : atModal.mode === "edit" ? "Edit" : "Delete"} ATPDA Tariff`} icon={MapPin}
                            headerRight={<button onClick={() => { setAtModal(null); setError(null); }} className="text-gray-400 hover:text-white transition-colors"><X size={16} /></button>}>
                            <div className="p-4 space-y-3">
                                {error && <div className="bg-red-50 border border-red-200 rounded px-3 py-2 text-xs text-red-600 font-bold">{error}</div>}
                                {atModal.mode === "delete" ? (
                                    <p className="text-sm text-gray-600">Delete this ATPDA tariff?</p>
                                ) : (
                                    <>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[11px] font-black text-gray-500 uppercase">Season</label>
                                            <select value={atForm.season_uq} onChange={e => setAtForm((p:any) => ({...p, season_uq: e.target.value}))} className="fos-input h-10 text-sm">
                                                <option value="">Select...</option>
                                                {(seasons as any[]).map((s:any) => <option key={s.unico} value={s.unico}>{t(s.season)}</option>)}
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[11px] font-black text-gray-500 uppercase">City</label>
                                            <select value={atForm.city_uq} onChange={e => setAtForm((p:any) => ({...p, city_uq: e.target.value}))} className="fos-input h-10 text-sm">
                                                <option value="">Select...</option>
                                                {(cities as any[]).map((c:any) => <option key={c.unico} value={c.unico}>{t(c.city)}</option>)}
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[11px] font-black text-gray-500 uppercase">Tariff %</label>
                                            <input type="number" value={atForm.tariff} onChange={e => setAtForm((p:any) => ({...p, tariff: parseFloat(e.target.value)||0}))} className="fos-input h-10 text-sm" />
                                        </div>
                                    </>
                                )}
                                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                                    <button onClick={() => { setAtModal(null); setError(null); }} className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-800">Cancel</button>
                                    <button onClick={async () => {
                                        setSaving(true); setError(null);
                                        try {
                                            if (atModal.mode === "delete") { await deleteItem("atpda", selAt!.unico); }
                                            else {
                                                const url = atModal.mode === "add" ? "/api/freights/atpda" : `/api/freights/atpda/${selAt?.unico}`;
                                                const res = await fetch(url, { method: atModal.mode === "add" ? "POST" : "PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify(atForm) });
                                                const data = await res.json(); if (!data.success) throw new Error(data.error);
                                                logAction(atModal.mode === "add" ? "Insert" : "Edit", data.unico || selAt?.unico);
                                            }
                                            setAtModal(null); await refetchAt();
                                        } catch(e:any){setError(e.message);} finally{setSaving(false);}
                                    }} disabled={saving} className="flex items-center gap-1.5 bg-[#FB7506] hover:bg-orange-600 disabled:opacity-50 text-white px-4 py-2 rounded text-xs font-black uppercase tracking-wider">
                                        {saving ? <RefreshCcw size={14} className="animate-spin" /> : <Save size={14} />}{saving ? "Saving..." : atModal.mode === "delete" ? "Delete" : "Save"}
                                    </button>
                                </div>
                            </div>
                        </PanelGrid>
                    </div>
                </div>
            )}

            {/* Copy Rates Modal */}
            {copyModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
                        <PanelGrid title="Copy Rates from Warehouse" icon={Copy}
                            headerRight={<button onClick={() => setCopyModal(false)} className="text-gray-400 hover:text-white transition-colors"><X size={16} /></button>}>
                            <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
                                {(warehouses as any[]).filter((w:any) => w.unico !== selWh?.unico).map((w:any) => (
                                    <button key={w.unico} onClick={async () => {
                                        setSaving(true); setError(null);
                                        try {
                                            const res = await fetch("/api/freights/copy", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ from: w.unico, to: selWh!.unico }) });
                                            const data = await res.json(); if (!data.success) throw new Error(data.error);
                                            logAction("Insert", selWh!.unico, "Copy Freight Rates");
                                            setCopyModal(false);
                                            await refetchFr(); await refetchHa(); await refetchAt();
                                        } catch(e:any){setError(e.message);} finally{setSaving(false);}
                                    }} disabled={saving} className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-50 last:border-b-0 transition-colors">
                                        <span className="text-sm font-semibold text-gray-700">{t(w.wp_name)}</span>
                                        <span className="text-[10px] text-gray-400 ml-2">{t(w.city)}</span>
                                    </button>
                                ))}
                            </div>
                        </PanelGrid>
                    </div>
                </div>
            )}

            {/* Seasons Modal */}
            {seFormOpen && (
                <EntityFormModal
                    open={true}
                    title={seFormMode === "add" ? "New Season" : "Edit Season"}
                    icon={Cloud}
                    form={seForm}
                    fields={[
                        {k:"season",l:"Season *"},{k:"sh_season",l:"Short Season"},
                        {k:"startdate",l:"Start Date",type:"date"},{k:"enddate",l:"End Date",type:"date"},
                        {k:"activedate",l:"Active Date",type:"date"},{k:"desacdate",l:"Deactivate Date",type:"date"},
                        {k:"increment",l:"Increment %",type:"number"},
                    ]}
                    checkFields={[{k:"publicate",l:"Publish"},{k:"bypercent",l:"By Percent"}]}
                    onChange={(k, v) => setSeForm((p: any) => ({...p, [k]: v}))}
                    onSave={async () => {
                        if (!seForm.season.trim()) { setSeError("Season Name is required."); return; }
                        setSeSaving(true); setSeError(null);
                        try {
                            if (seFormMode === "add") {
                                const res = await fetch("/api/freights/seasons", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(seForm) });
                                const d = await res.json(); if (!d.success) throw new Error(d.error);
                                logAction("Insert", d.unico || "season", "Season");
                            } else if (selSe) {
                                const res = await fetch(`/api/freights/seasons/${selSe.unico}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(seForm) });
                                const d = await res.json(); if (!d.success) throw new Error(d.error);
                                logAction("Edit", selSe.unico, "Season");
                            }
                            setSeFormOpen(false); setSeForm(EMPTY_SE);
                            await qc.invalidateQueries({ queryKey: ["fr-se"] });
                        } catch (e: any) { setSeError(e.message); }
                        finally { setSeSaving(false); }
                    }}
                    onClose={() => { setSeFormOpen(false); setSeError(null); }}
                    saving={seSaving}
                    error={seError}
                />
            )}

            {/* Cities List Modal */}
            <EntityListModal
                open={ciSetup}
                title="Cities"
                icon={MapPin}
                searchPlaceholder="Search cities..."
                listUrl="/api/freights/cities"
                renderItem={(r) => ({ primary: r.city, secondary: r.country_iso })}
                onClose={() => { setCiSetup(false); setCiSel(null); }}
                onSelect={(r) => setCiSel(r)}
                onAdd={() => { setCiForm({...EMPTY_CI}); setCiFormMode("add"); setCiError(null); setCiFormOpen(true); }}
                onEdit={(r) => { setCiForm({ city: t(r.city), country_iso: t(r.country_iso), buyer_email: t(r.buyer_email) }); setCiFormMode("edit"); setCiError(null); setCiFormOpen(true); }}
                onDelete={async (r) => {
                    setCiSaving(true); setCiError(null);
                    try {
                        await fetch(`/api/freights/cities/${r.unico}`, { method:"DELETE" });
                        logAction("Delete", r.unico, "City");
                        setCiSel(null);
                    } catch(e:any){setCiError(e.message);} finally{setCiSaving(false);}
                }}
            />
            <EntityFormModal
                open={ciFormOpen}
                title={ciFormMode === "add" ? "New City" : "Edit City"}
                icon={MapPin}
                recordId={ciSel?.unico}
                subtitle={ciFormMode === "edit" && ciSel ? ciSel.city : undefined}
                form={ciForm}
                fields={[{k:"city",l:"City *"},{k:"country_iso",l:"Country ISO"},{k:"buyer_email",l:"Buyer Email"}]}
                onChange={(k, v) => setCiForm((p: any) => ({...p, [k]: v}))}
                onSave={async () => {
                    setCiSaving(true); setCiError(null);
                    try {
                        const url = ciFormMode === "add" ? "/api/freights/cities" : `/api/freights/cities/${ciSel?.unico}`;
                        const res = await fetch(url, { method: ciFormMode === "add" ? "POST" : "PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify(ciForm) });
                        const data = await res.json(); if (!data.success) throw new Error(data.error);
                        logAction(ciFormMode === "add" ? "Insert" : "Edit", data.unico || ciSel?.unico, "City");
                        setCiFormOpen(false); await qc.invalidateQueries({ queryKey: ["fr-ci"] });
                    } catch(e:any){setCiError(e.message);} finally{setCiSaving(false);}
                }}
                onClose={() => { setCiFormOpen(false); setCiError(null); }}
                saving={ciSaving}
                error={ciError}
            />

            {/* Airlines List Modal */}
            <EntityListModal
                open={alSetup}
                title="Airlines"
                icon={Cloud}
                searchPlaceholder="Search airlines..."
                listUrl="/api/freights/airlines"
                renderItem={(r) => ({ primary: r.airline, secondary: r.cod_linea })}
                onClose={() => { setAlSetup(false); setAlSel(null); }}
                onSelect={(r) => setAlSel(r)}
                onAdd={() => { setAlForm({...EMPTY_AL}); setAlFormMode("add"); setAlError(null); setAlFormOpen(true); }}
                onEdit={(r) => { setAlForm({ cod_linea: t(r.cod_linea), airline: t(r.airline), address: t(r.address), city: t(r.city), country: t(r.country), phone: t(r.phone), fax: t(r.fax), email: t(r.email), contact: t(r.contact) }); setAlFormMode("edit"); setAlError(null); setAlFormOpen(true); }}
                onDelete={async (r) => {
                    setAlSaving(true); setAlError(null);
                    try {
                        await fetch(`/api/freights/airlines/${r.unico}`, { method:"DELETE" });
                        logAction("Delete", r.unico, "Airline");
                        setAlSel(null);
                    } catch(e:any){setAlError(e.message);} finally{setAlSaving(false);}
                }}
            />
            <EntityFormModal
                open={alFormOpen}
                title={alFormMode === "add" ? "New Airline" : "Edit Airline"}
                icon={Cloud}
                recordId={alSel?.unico}
                subtitle={alFormMode === "edit" && alSel ? alSel.airline : undefined}
                form={alForm}
                fields={[{k:"cod_linea",l:"Code"},{k:"airline",l:"Airline *"},{k:"contact",l:"Contact"},{k:"address",l:"Address"},{k:"city",l:"City"},{k:"country",l:"Country"},{k:"phone",l:"Phone"},{k:"fax",l:"Fax"},{k:"email",l:"Email"}]}
                onChange={(k, v) => setAlForm((p: any) => ({...p, [k]: v}))}
                onSave={async () => {
                    setAlSaving(true); setAlError(null);
                    try {
                        const url = alFormMode === "add" ? "/api/freights/airlines" : `/api/freights/airlines/${alSel?.unico}`;
                        const res = await fetch(url, { method: alFormMode === "add" ? "POST" : "PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify(alForm) });
                        const data = await res.json(); if (!data.success) throw new Error(data.error);
                        logAction(alFormMode === "add" ? "Insert" : "Edit", data.unico || alSel?.unico, "Airline");
                        setAlFormOpen(false); await qc.invalidateQueries({ queryKey: ["fr-al"] });
                    } catch(e:any){setAlError(e.message);} finally{setAlSaving(false);}
                }}
                onClose={() => { setAlFormOpen(false); setAlError(null); }}
                saving={alSaving}
                error={alError}
            />
        </div>
    );
}
