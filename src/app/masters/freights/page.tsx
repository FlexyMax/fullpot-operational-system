"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    ArrowLeft, Plus, Pencil, Trash2, Save, X, RefreshCcw,
    Copy, Zap, Building2, Cloud, MapPin, Check, AlertCircle,
    XCircle, Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuditLog } from "@/lib/audit";
import { AuditLogModal } from "@/components/AuditLogModal";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const t       = (v: any) => String(v ?? "").trim();
const ff      = async (url: string) => { const r = await fetch(url); const j = await r.json(); if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`); return j; };

// ─── Empty forms ──────────────────────────────────────────────────────────────
const EMPTY_WH   = { wp_name:"", cargo:false, send_xml:false, charge:false, address:"", city:"", state:"", zipcode:"", country:"", phone:"", fax:"", email:"", grower_uq:"", handling_kg:0, send_to_whouse:false };
const EMPTY_FR   = { wphysical_uq:"", season_uq:"", city_uq:"", freight:0, freight_kg:0 };
const EMPTY_HA   = { wphysical_uq:"", season_uq:"", handling:0 };
const EMPTY_AT   = { wphysical_uq:"", season_uq:"", city_uq:"", tariff:0 };
const EMPTY_SE   = { season:"", sh_season:"", startdate:"", enddate:"", activedate:"", desacdate:"", publicate:false, increment:0, bypercent:false };
const EMPTY_CI   = { country_iso:"", city:"", buyer_email:"" };
const EMPTY_AL   = { cod_linea:"", airline:"", address:"", city:"", country:"", phone:"", fax:"", email:"", contact:"" };

// ─── Shared mini-components ───────────────────────────────────────────────────
function GridHeader({ icon: Icon, title, loading, children, recordId }: any) {
    return (
        <div className="h-8 bg-[#374151] flex items-center justify-between px-2 shrink-0">
            <div className="flex items-center gap-1.5">
                <Icon size={12} className="text-[#FB7506]" />
                <span className="font-black text-[9px] uppercase tracking-widest text-white">{title}</span>
                <AuditLogModal recordId={recordId} disabled={!recordId} />
                {loading && <RefreshCcw size={9} className="text-gray-400 animate-spin" />}
            </div>
            <div className="flex items-center gap-1">{children}</div>
        </div>
    );
}

function GBtn({ onClick, disabled, color, icon: Icon, label }: any) {
    const colors: Record<string,string> = {
        green:  "bg-green-600 hover:bg-green-700",
        blue:   "bg-blue-600 hover:bg-blue-700",
        red:    "bg-red-600 hover:bg-red-700",
        gray:   "bg-gray-600 hover:bg-gray-500",
        amber:  "bg-amber-500 hover:bg-amber-600",
    };
    return (
        <button onClick={onClick} disabled={!!disabled}
            className={cn("flex items-center gap-0.5 text-white px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wide transition-all disabled:opacity-40", colors[color]||colors.gray)}>
            {Icon && <Icon size={8} />}{label}
        </button>
    );
}

function MiniTable({ cols, rows, selUnico, onSelect, onDblClick, empty }: any) {
    return (
        <div className="overflow-auto flex-1">
            <table className="min-w-full text-[10px] text-left">
                <thead className="bg-gray-100 border-b text-gray-700 font-bold sticky top-0 z-10">
                    <tr>{cols.map((c: any) => <th key={c.key} className={cn("p-1.5 whitespace-nowrap border-r border-gray-200 last:border-r-0", c.className)}>{c.label}</th>)}</tr>
                </thead>
                <tbody>
                    {rows.length === 0 ? (
                        <tr><td colSpan={cols.length} className="p-4 text-center text-gray-400 italic text-xs">{empty}</td></tr>
                    ) : rows.map((r: any, i: number) => {
                        const isSel = selUnico && (selUnico === r.unico);
                        return (
                            <tr key={r.unico||i} onClick={() => onSelect?.(r)}
                                onDoubleClick={() => onDblClick?.(r)}
                                className={cn("border-b cursor-pointer transition-colors", isSel ? "!bg-blue-100 ring-2 ring-inset ring-blue-300" : "odd:bg-white even:bg-gray-50 hover:bg-blue-50")}>
                                {cols.map((c: any) => (
                                    <td key={c.key} className={cn("p-1.5 border-r border-gray-100 last:border-r-0", c.className)}>
                                        {c.render ? c.render(r[c.key], r) : t(r[c.key])}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FreightsSetupPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const qc     = useQueryClient();
    const { logAction } = useAuditLog("freights-setup", "flower_warehouses_physical");

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
    const [seSetup,  setSeSetup]  = useState(false);
    const [ciSetup,  setCiSetup]  = useState(false);
    const [alSetup,  setAlSetup]  = useState(false);
    const [copyModal, setCopyModal] = useState(false);

    // Form state
    const [whForm, setWhForm] = useState<any>(EMPTY_WH);
    const [frForm, setFrForm] = useState<any>(EMPTY_FR);
    const [haForm, setHaForm] = useState<any>(EMPTY_HA);
    const [atForm, setAtForm] = useState<any>(EMPTY_AT);
    const [error,  setError]  = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => { if (status === "unauthenticated") router.push("/login"); }, [status, router]);

    // ── Queries ───────────────────────────────────────────────────────────────
    const { data: warehouses = [], isFetching: loadingWh }  = useQuery({ queryKey: ["fr-wh"],       queryFn: () => ff("/api/freights/warehouses") });
    const { data: freights   = [], isFetching: loadingFr, refetch: refetchFr }  = useQuery({ queryKey: ["fr-fr", selWh?.unico], queryFn: () => ff(`/api/freights/rates?warehouse=${selWh.unico}`),    enabled: !!selWh?.unico, retry: false });
    const { data: handling   = [], isFetching: loadingHa, refetch: refetchHa }  = useQuery({ queryKey: ["fr-ha", selWh?.unico], queryFn: () => ff(`/api/freights/handling?warehouse=${selWh.unico}`), enabled: !!selWh?.unico, retry: false });
    const { data: atpda      = [], isFetching: loadingAt, refetch: refetchAt }  = useQuery({ queryKey: ["fr-at", selWh?.unico], queryFn: () => ff(`/api/freights/atpda?warehouse=${selWh.unico}`),    enabled: !!selWh?.unico, retry: false });
    const { data: lookups }  = useQuery({ queryKey: ["fr-look"], queryFn: () => ff("/api/freights/lookups"), staleTime: 1000*60*5 });

    // Auto-select first records
    useEffect(() => { if ((warehouses as any[]).length > 0 && !selWh) setSelWh((warehouses as any[])[0]); }, [warehouses]);
    useEffect(() => { if ((freights  as any[]).length > 0) setSelFr((freights  as any[])[0]); else setSelFr(null); }, [freights]);
    useEffect(() => { if ((handling  as any[]).length > 0) setSelHa((handling  as any[])[0]); else setSelHa(null); }, [handling]);
    useEffect(() => { if ((atpda     as any[]).length > 0) setSelAt((atpda     as any[])[0]); else setSelAt(null); }, [atpda]);

    const seasons = (lookups?.seasons || []) as any[];
    const cities  = (lookups?.cities  || []) as any[];
    const growers = (lookups?.growers || []) as any[];

    // ── Warehouse CRUD ────────────────────────────────────────────────────────
    const saveWh = async () => {
        if (!whForm.wp_name.trim()) { setError("Warehouse Name is required."); return; }
        setSaving(true); setError(null);
        try {
            if (whModal?.mode === "add") {
                const res = await fetch("/api/freights/warehouse", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(whForm) });
                const d   = await res.json(); if (!d.success) throw new Error(d.error);
                logAction("Insert", d.unico);
            } else if (whModal?.mode === "edit") {
                const res = await fetch(`/api/freights/warehouse/${selWh.unico}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(whForm) });
                const d   = await res.json(); if (!d.success) throw new Error(d.error);
                logAction("Edit", selWh.unico);
            } else {
                const res = await fetch(`/api/freights/warehouse/${selWh.unico}`, { method:"DELETE" });
                const d   = await res.json(); if (!d.success) throw new Error(d.error);
                logAction("Delete", selWh.unico);
                setSelWh(null);
            }
            await qc.invalidateQueries({ queryKey: ["fr-wh"] });
            setWhModal(null);
        } catch (e: any) { setError(e.message); }
        finally { setSaving(false); }
    };

    // ── Freight CRUD ──────────────────────────────────────────────────────────
    const saveFr = async () => {
        if (!frForm.season_uq) { setError("Season is required."); return; }
        if (!frForm.city_uq)   { setError("City is required.");   return; }
        if (parseFloat(frForm.freight||0) + parseFloat(frForm.freight_kg||0) <= 0) { setError("Freight value required."); return; }
        setSaving(true); setError(null);
        try {
            const body = { ...frForm, wphysical_uq: selWh?.unico };
            if (frModal?.mode === "add") {
                const res = await fetch("/api/freights/rates", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
                const d   = await res.json(); if (!d.success) throw new Error(d.error);
                logAction("Insert", d.unico);
            } else if (frModal?.mode === "edit") {
                const res = await fetch(`/api/freights/rates/${selFr.unico}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
                const d   = await res.json(); if (!d.success) throw new Error(d.error);
                logAction("Edit", selFr.unico);
            } else {
                const res = await fetch(`/api/freights/rates/${selFr.unico}`, { method:"DELETE" });
                const d   = await res.json(); if (!d.success) throw new Error(d.error);
                logAction("Delete", selFr.unico);
                setSelFr(null);
            }
            await refetchFr(); setFrModal(null);
        } catch (e: any) { setError(e.message); }
        finally { setSaving(false); }
    };

    // ── Handling CRUD ─────────────────────────────────────────────────────────
    const saveHa = async () => {
        if (!haForm.season_uq) { setError("Season is required."); return; }
        setSaving(true); setError(null);
        try {
            const body = { ...haForm, wphysical_uq: selWh?.unico };
            if (haModal?.mode === "add") {
                const res = await fetch("/api/freights/handling", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
                const d   = await res.json(); if (!d.success) throw new Error(d.error);
                logAction("Insert", d.unico);
            } else if (haModal?.mode === "edit") {
                const res = await fetch(`/api/freights/handling/${selHa.unico}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
                const d   = await res.json(); if (!d.success) throw new Error(d.error);
                logAction("Edit", selHa.unico);
            } else {
                const res = await fetch(`/api/freights/handling/${selHa.unico}`, { method:"DELETE" });
                const d   = await res.json(); if (!d.success) throw new Error(d.error);
                logAction("Delete", selHa.unico);
                setSelHa(null);
            }
            await refetchHa(); setHaModal(null);
        } catch (e: any) { setError(e.message); }
        finally { setSaving(false); }
    };

    // ── ATPDA CRUD ────────────────────────────────────────────────────────────
    const saveAt = async () => {
        if (!atForm.season_uq) { setError("Season is required."); return; }
        if (!atForm.city_uq)   { setError("City is required.");   return; }
        setSaving(true); setError(null);
        try {
            const body = { ...atForm, wphysical_uq: selWh?.unico };
            if (atModal?.mode === "add") {
                const res = await fetch("/api/freights/atpda", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
                const d   = await res.json(); if (!d.success) throw new Error(d.error);
                logAction("Insert", d.unico);
            } else if (atModal?.mode === "edit") {
                const res = await fetch(`/api/freights/atpda/${selAt.unico}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
                const d   = await res.json(); if (!d.success) throw new Error(d.error);
                logAction("Edit", selAt.unico);
            } else {
                const res = await fetch(`/api/freights/atpda/${selAt.unico}`, { method:"DELETE" });
                const d   = await res.json(); if (!d.success) throw new Error(d.error);
                logAction("Delete", selAt.unico);
                setSelAt(null);
            }
            await refetchAt(); setAtModal(null);
        } catch (e: any) { setError(e.message); }
        finally { setSaving(false); }
    };

    // ── Copy Freights ─────────────────────────────────────────────────────────
    const [copySourceSeason, setCopySourceSeason] = useState("");
    const [copyTargetSeason, setCopyTargetSeason] = useState("");
    const doCopy = async () => {
        if (!copySourceSeason) { setError("Source season is required."); return; }
        setSaving(true); setError(null);
        try {
            const res = await fetch("/api/freights/rates/copy", { method:"POST", headers:{"Content-Type":"application/json"},
                body:JSON.stringify({ wphysical_uq: selWh?.unico, season_uq_from: copySourceSeason, season_uq_to: copyTargetSeason }) });
            const d = await res.json(); if (!d.success) throw new Error(d.error);
            await refetchFr(); setCopyModal(false); setCopySourceSeason(""); setCopyTargetSeason("");
        } catch (e: any) { setError(e.message); }
        finally { setSaving(false); }
    };

    // ── Update AWBs ───────────────────────────────────────────────────────────
    const updateAwbs = async () => {
        if (!selFr) { setError("Select a freight rate first."); return; }
        if (!confirm("Are you sure you want to update AWB Freight Rates?")) return;
        setSaving(true); setError(null);
        try {
            const res = await fetch(`/api/freights/rates/${selFr.unico}/update-awb`, { method:"PUT" });
            const d = await res.json(); if (!d.success) throw new Error(d.error);
            logAction("Edit", selFr.unico, "Update AWB Freight Rates");
        } catch (e: any) { setError(e.message); }
        finally { setSaving(false); }
    };

    if (status === "loading") return null;

    return (
        <div className="flex flex-col h-screen bg-[#f4f6f8] overflow-hidden font-sans text-[#333]">

            {/* Header */}
            <div className="h-12 bg-[#374151] flex items-center justify-between px-4 shrink-0 text-white">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push("/menu")} className="hover:bg-white/10 p-1.5 rounded transition-colors"><ArrowLeft size={18} /></button>
                    <div className="flex items-center gap-2">
                        <span className="font-black text-xs uppercase tracking-widest text-[#FB7506]">FOS</span>
                        <div className="w-px h-4 bg-white/20 mx-2" />
                        <Building2 size={14} className="text-[#FB7506]" />
                        <span className="font-bold text-xs uppercase tracking-tight">Freights & Handling Setup</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setCiSetup(true)} className="flex items-center gap-1 bg-gray-600 hover:bg-gray-500 text-white px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all"><MapPin size={10} /> Cities</button>
                    <button onClick={() => setAlSetup(true)} className="flex items-center gap-1 bg-gray-600 hover:bg-gray-500 text-white px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all"><Cloud size={10} /> Airlines</button>
                    <button onClick={() => setSeSetup(true)} className="flex items-center gap-1 bg-[#FB7506] hover:bg-orange-600 text-white px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all"><Zap size={10} /> Seasons</button>
                    <span className="text-gray-400 text-[10px] font-bold">User: <span className="text-white">{session?.user?.name}</span></span>
                </div>
            </div>

            {error && (
                <div className="bg-amber-50 border-b border-amber-200 px-4 py-1.5 flex items-center gap-2 shrink-0">
                    <AlertCircle size={13} className="text-amber-500" />
                    <span className="text-xs text-amber-700 font-bold">{error}</span>
                    <button onClick={() => setError(null)} className="ml-auto text-amber-400 hover:text-amber-600"><XCircle size={14} /></button>
                </div>
            )}

            {/* Main 2-row grid layout */}
            <div className="flex-1 p-2 grid grid-rows-2 gap-2 overflow-hidden">

                {/* Row 1: Warehouses + Seasons */}
                <div className="grid gap-2 overflow-hidden" style={{ gridTemplateColumns: "43% 57%" }}>

                    {/* Physical Warehouses */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col overflow-hidden">
                        <GridHeader icon={Building2} title="Physical Warehouses" loading={loadingWh} recordId={selWh?.unico}>
                            <GBtn onClick={() => { setWhForm({...EMPTY_WH}); setError(null); setWhModal({mode:"add"}); }} color="green" icon={Plus} label="Add" />
                            <GBtn onClick={() => { if(!selWh) return; setWhForm({ wp_name:t(selWh.wp_name), cargo:!!selWh.cargo, send_xml:!!selWh.send_xml, charge:!!selWh.charge, address:t(selWh.address), city:t(selWh.city), state:t(selWh.state), zipcode:t(selWh.zipcode), country:t(selWh.country), phone:t(selWh.phone), fax:t(selWh.fax), email:t(selWh.email), grower_uq:t(selWh.grower_uq), handling_kg:selWh.handling_kg||0, send_to_whouse:!!selWh.send_to_whouse }); setError(null); setWhModal({mode:"edit"}); }} disabled={!selWh} color="blue" icon={Pencil} label="Edit" />
                            <GBtn onClick={() => { if(selWh){setError(null);setWhModal({mode:"delete"});} }} disabled={!selWh} color="red" icon={Trash2} label="Del" />
                        </GridHeader>
                        <MiniTable
                            cols={[{ key:"wp_name", label:"Warehouse" }]}
                            rows={warehouses}
                            selUnico={selWh?.unico}
                            onSelect={(r: any) => { setSelWh(r); setSelFr(null); setSelHa(null); setSelAt(null); setError(null); }}
                            empty="No warehouses"
                        />
                    </div>

                    {/* Seasons (reference grid) */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col overflow-hidden">
                        <GridHeader icon={Zap} title="Seasons" recordId={selSe?.unico}>
                            <GBtn onClick={() => setSeSetup(true)} color="amber" icon={Zap} label="Manage" />
                        </GridHeader>
                        <MiniTable
                            cols={[
                                { key:"season",     label:"Season" },
                                { key:"startdate2", label:"From",   className:"text-center" },
                                { key:"enddate2",   label:"To",     className:"text-center" },
                                { key:"active",     label:"Active", className:"text-center",
                                  render: (v: any) => v==="Yes"||v===true ? <Check size={10} className="text-green-500 mx-auto" /> : "—" },
                            ]}
                            rows={seasons}
                            selUnico={selSe?.unico}
                            onSelect={setSelSe}
                            empty="No seasons"
                        />
                    </div>
                </div>

                {/* Row 2: Freights + Handling + ATPDA */}
                <div className="grid gap-2 overflow-hidden" style={{ gridTemplateColumns: "43% 28% 29%" }}>

                    {/* Freights */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col overflow-hidden">
                        <GridHeader icon={Cloud} title={`Freights${selWh ? ` — ${t(selWh.wp_name)}` : ""}`} loading={loadingFr} recordId={selFr?.unico}>
                            <GBtn onClick={() => { if(!selWh){setError("Select a warehouse first.");return;} setFrForm({...EMPTY_FR}); setError(null); setFrModal({mode:"add"}); }} disabled={!selWh} color="green" icon={Plus} label="Add" />
                            <GBtn onClick={() => { if(!selFr) return; setFrForm({ wphysical_uq:t(selFr.wphysical_uq||selWh?.unico), season_uq:t(selFr.season_uq), city_uq:t(selFr.city_uq), freight:selFr.freight||0, freight_kg:selFr.freight_kg||0 }); setError(null); setFrModal({mode:"edit"}); }} disabled={!selFr} color="blue" icon={Pencil} label="Edit" />
                            <GBtn onClick={() => { if(selFr){setError(null);setFrModal({mode:"delete"});} }} disabled={!selFr} color="red" icon={Trash2} label="Del" />
                            <GBtn onClick={() => { if(!selWh){setError("Select a warehouse first.");return;} if(!confirm("Copy freights from another season?")) return; setCopyModal(true); }} disabled={!selWh} color="gray" icon={Copy} label="Copy" />
                            <GBtn onClick={updateAwbs} disabled={!selFr} color="amber" icon={Zap} label="AWBs" />
                        </GridHeader>
                        <MiniTable
                            cols={[
                                { key:"season",     label:"Season" },
                                { key:"city",       label:"City" },
                                { key:"freight",    label:"FreightFB", className:"text-right", render: (v: any) => parseFloat(v||0).toFixed(4) },
                                { key:"freight_kg", label:"FreightKG", className:"text-right", render: (v: any) => parseFloat(v||0).toFixed(2) },
                            ]}
                            rows={freights}
                            selUnico={selFr?.unico}
                            onSelect={setSelFr}
                            empty={selWh ? "No freight rates" : "Select a warehouse"}
                        />
                    </div>

                    {/* Handling */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col overflow-hidden">
                        <GridHeader icon={Building2} title="Handling" loading={loadingHa} recordId={selHa?.unico}>
                            <GBtn onClick={() => { if(!selWh){setError("Select a warehouse first.");return;} setHaForm({...EMPTY_HA}); setError(null); setHaModal({mode:"add"}); }} disabled={!selWh} color="green" icon={Plus} label="Add" />
                            <GBtn onClick={() => { if(!selHa) return; setHaForm({ wphysical_uq:t(selHa.wphysical_uq||selWh?.unico), season_uq:t(selHa.season_uq), handling:selHa.handling||0 }); setError(null); setHaModal({mode:"edit"}); }} disabled={!selHa} color="blue" icon={Pencil} label="Edit" />
                            <GBtn onClick={() => { if(selHa){setError(null);setHaModal({mode:"delete"});} }} disabled={!selHa} color="red" icon={Trash2} label="Del" />
                        </GridHeader>
                        <MiniTable
                            cols={[
                                { key:"season",   label:"Season" },
                                { key:"handling", label:"HandlingFB", className:"text-right", render: (v: any) => parseFloat(v||0).toFixed(4) },
                            ]}
                            rows={handling}
                            selUnico={selHa?.unico}
                            onSelect={setSelHa}
                            empty={selWh ? "No handling rates" : "Select a warehouse"}
                        />
                    </div>

                    {/* ATPDA */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col overflow-hidden">
                        <GridHeader icon={MapPin} title="ATPDA" loading={loadingAt} recordId={selAt?.unico}>
                            <GBtn onClick={() => { if(!selWh){setError("Select a warehouse first.");return;} setAtForm({...EMPTY_AT}); setError(null); setAtModal({mode:"add"}); }} disabled={!selWh} color="green" icon={Plus} label="Add" />
                            <GBtn onClick={() => { if(!selAt) return; setAtForm({ wphysical_uq:t(selAt.wphysical_uq||selWh?.unico), season_uq:t(selAt.season_uq), city_uq:t(selAt.city_uq), tariff:selAt.tariff||0 }); setError(null); setAtModal({mode:"edit"}); }} disabled={!selAt} color="blue" icon={Pencil} label="Edit" />
                            <GBtn onClick={() => { if(selAt){setError(null);setAtModal({mode:"delete"});} }} disabled={!selAt} color="red" icon={Trash2} label="Del" />
                        </GridHeader>
                        <MiniTable
                            cols={[
                                { key:"season", label:"Season" },
                                { key:"city",   label:"City" },
                                { key:"tariff", label:"Tariff%", className:"text-right", render: (v: any) => parseFloat(v||0).toFixed(2)+"%" },
                            ]}
                            rows={atpda}
                            selUnico={selAt?.unico}
                            onSelect={setSelAt}
                            empty={selWh ? "No ATPDA tariffs" : "Select a warehouse"}
                        />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="h-8 bg-gray-100 border-t px-4 flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-tight shrink-0">
                <div className="flex gap-4"><span>Server: Production</span><span className="text-gray-300">|</span><span>Database: FullPot</span></div>
                <span className="text-[#FB7506]">FOS Masters V.2.0.1</span>
            </div>

            {/* ── Warehouse Modal ────────────────────────────────────────── */}
            {whModal && (
                <SimpleModal title={`${whModal.mode === "add" ? "Add" : whModal.mode === "edit" ? "Edit" : "Delete"} Warehouse`}
                    onSave={saveWh} onClose={() => { setWhModal(null); setError(null); }} saving={saving} error={error}
                    isDelete={whModal.mode === "delete"} deleteMsg={`Delete warehouse "${t(selWh?.wp_name)}"?`}>
                    {whModal.mode !== "delete" && (
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <FField label="Warehouse Name *" value={whForm.wp_name} onChange={(v:string)=>setWhForm((p:any)=>({...p,wp_name:v}))} />
                            <FField label="Address" value={whForm.address} onChange={(v:string)=>setWhForm((p:any)=>({...p,address:v}))} />
                            <FField label="City" value={whForm.city} onChange={(v:string)=>setWhForm((p:any)=>({...p,city:v}))} />
                            <FField label="State" value={whForm.state} onChange={(v:string)=>setWhForm((p:any)=>({...p,state:v}))} />
                            <FField label="Zip" value={whForm.zipcode} onChange={(v:string)=>setWhForm((p:any)=>({...p,zipcode:v}))} />
                            <FField label="Country" value={whForm.country} onChange={(v:string)=>setWhForm((p:any)=>({...p,country:v}))} />
                            <FField label="Phone" value={whForm.phone} onChange={(v:string)=>setWhForm((p:any)=>({...p,phone:v}))} />
                            <FField label="Fax"   value={whForm.fax}   onChange={(v:string)=>setWhForm((p:any)=>({...p,fax:v}))} />
                            <FField label="Email" value={whForm.email} onChange={(v:string)=>setWhForm((p:any)=>({...p,email:v}))} span2 />
                            <FField label="Handling KG" value={String(whForm.handling_kg)} type="number" onChange={(v:string)=>setWhForm((p:any)=>({...p,handling_kg:parseFloat(v)||0}))} />
                            <div className="flex flex-col gap-0.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Grower</label>
                                <select value={whForm.grower_uq} onChange={e=>setWhForm((p:any)=>({...p,grower_uq:e.target.value}))} className="fos-input text-xs py-1">
                                    <option value="">— None —</option>
                                    {growers.map((g:any) => <option key={g.unico} value={g.unico}>{t(g.grower)}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-wrap gap-3 col-span-2 pt-1">
                                {[["cargo","Cargo"],["send_xml","Send XML"],["charge","Charge"],["send_to_whouse","Send to Whouse"]].map(([k,l])=>(
                                    <label key={k} className="flex items-center gap-1.5 cursor-pointer">
                                        <input type="checkbox" checked={!!whForm[k]} onChange={e=>setWhForm((p:any)=>({...p,[k]:e.target.checked}))} className="w-3.5 h-3.5 accent-[#FB7506]" />
                                        <span className="text-[10px] font-semibold">{l}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </SimpleModal>
            )}

            {/* ── Freight Modal ──────────────────────────────────────────── */}
            {frModal && (
                <SimpleModal title={`${frModal.mode === "add" ? "Add" : frModal.mode === "edit" ? "Edit" : "Delete"} Freight Rate`}
                    onSave={saveFr} onClose={() => { setFrModal(null); setError(null); }} saving={saving} error={error}
                    isDelete={frModal.mode === "delete"} deleteMsg="Delete this freight rate?">
                    {frModal.mode !== "delete" && (
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="flex flex-col gap-0.5"><label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Season *</label>
                                <select value={frForm.season_uq} onChange={e=>setFrForm((p:any)=>({...p,season_uq:e.target.value}))} className="fos-input text-xs py-1">
                                    <option value="">— Select —</option>
                                    {seasons.map((s:any)=><option key={s.unico} value={s.unico}>{t(s.season)}</option>)}
                                </select></div>
                            <div className="flex flex-col gap-0.5"><label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">City *</label>
                                <select value={frForm.city_uq} onChange={e=>setFrForm((p:any)=>({...p,city_uq:e.target.value}))} className="fos-input text-xs py-1">
                                    <option value="">— Select —</option>
                                    {cities.map((c:any)=><option key={c.unico} value={c.unico}>{t(c.city)}</option>)}
                                </select></div>
                            <FField label="Freight FB (4 dec)" value={String(frForm.freight)} type="number" onChange={(v:string)=>setFrForm((p:any)=>({...p,freight:parseFloat(v)||0}))} />
                            <FField label="Freight KG (2 dec)" value={String(frForm.freight_kg)} type="number" onChange={(v:string)=>setFrForm((p:any)=>({...p,freight_kg:parseFloat(v)||0}))} />
                        </div>
                    )}
                </SimpleModal>
            )}

            {/* ── Handling Modal ─────────────────────────────────────────── */}
            {haModal && (
                <SimpleModal title={`${haModal.mode === "add" ? "Add" : haModal.mode === "edit" ? "Edit" : "Delete"} Handling Rate`}
                    onSave={saveHa} onClose={() => { setHaModal(null); setError(null); }} saving={saving} error={error}
                    isDelete={haModal.mode === "delete"} deleteMsg="Delete this handling rate?">
                    {haModal.mode !== "delete" && (
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="flex flex-col gap-0.5"><label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Season *</label>
                                <select value={haForm.season_uq} onChange={e=>setHaForm((p:any)=>({...p,season_uq:e.target.value}))} className="fos-input text-xs py-1">
                                    <option value="">— Select —</option>
                                    {seasons.map((s:any)=><option key={s.unico} value={s.unico}>{t(s.season)}</option>)}
                                </select></div>
                            <FField label="Handling FB (4 dec)" value={String(haForm.handling)} type="number" onChange={(v:string)=>setHaForm((p:any)=>({...p,handling:parseFloat(v)||0}))} />
                        </div>
                    )}
                </SimpleModal>
            )}

            {/* ── ATPDA Modal ────────────────────────────────────────────── */}
            {atModal && (
                <SimpleModal title={`${atModal.mode === "add" ? "Add" : atModal.mode === "edit" ? "Edit" : "Delete"} ATPDA Tariff`}
                    onSave={saveAt} onClose={() => { setAtModal(null); setError(null); }} saving={saving} error={error}
                    isDelete={atModal.mode === "delete"} deleteMsg="Delete this ATPDA tariff?">
                    {atModal.mode !== "delete" && (
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="flex flex-col gap-0.5"><label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Season *</label>
                                <select value={atForm.season_uq} onChange={e=>setAtForm((p:any)=>({...p,season_uq:e.target.value}))} className="fos-input text-xs py-1">
                                    <option value="">— Select —</option>
                                    {seasons.map((s:any)=><option key={s.unico} value={s.unico}>{t(s.season)}</option>)}
                                </select></div>
                            <div className="flex flex-col gap-0.5"><label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">City *</label>
                                <select value={atForm.city_uq} onChange={e=>setAtForm((p:any)=>({...p,city_uq:e.target.value}))} className="fos-input text-xs py-1">
                                    <option value="">— Select —</option>
                                    {cities.map((c:any)=><option key={c.unico} value={c.unico}>{t(c.city)}</option>)}
                                </select></div>
                            <FField label="Tariff %" value={String(atForm.tariff)} type="number" onChange={(v:string)=>setAtForm((p:any)=>({...p,tariff:parseFloat(v)||0}))} />
                        </div>
                    )}
                </SimpleModal>
            )}

            {/* ── Copy Freights Modal ────────────────────────────────────── */}
            {copyModal && (
                <SimpleModal title="Copy Freights — Select Source Season" onSave={doCopy} onClose={()=>{setCopyModal(false);setError(null);setCopySourceSeason("");setCopyTargetSeason("");}} saving={saving} error={error}>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="flex flex-col gap-0.5"><label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Source Season *</label>
                            <select value={copySourceSeason} onChange={e=>setCopySourceSeason(e.target.value)} className="fos-input text-xs py-1">
                                <option value="">— From —</option>
                                {seasons.map((s:any)=><option key={s.unico} value={s.unico}>{t(s.season)}</option>)}
                            </select></div>
                        <div className="flex flex-col gap-0.5"><label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Target Season *</label>
                            <select value={copyTargetSeason} onChange={e=>setCopyTargetSeason(e.target.value)} className="fos-input text-xs py-1">
                                <option value="">— To —</option>
                                {seasons.map((s:any)=><option key={s.unico} value={s.unico}>{t(s.season)}</option>)}
                            </select></div>
                    </div>
                </SimpleModal>
            )}

            {/* ── Seasons Setup Modal ────────────────────────────────────── */}
            {seSetup && <SetupModal title="Seasons Setup" onClose={()=>{setSeSetup(false); qc.invalidateQueries({queryKey:["fr-look"]});}} listUrl="/api/freights/seasons" detailUrl="/api/freights/seasons" emptyForm={EMPTY_SE} cols={[{key:"season",label:"Season"},{key:"startdate2",label:"From"},{key:"enddate2",label:"To"},{key:"active",label:"Active",render:(v:any)=>v==="Yes"||v===true?"✓":"—"}]} formFields={[{k:"season",l:"Season Name *"},{k:"sh_season",l:"Short Code"},{k:"startdate",l:"Start Date",type:"date"},{k:"enddate",l:"End Date",type:"date"},{k:"activedate",l:"Active Date",type:"date"},{k:"desacdate",l:"Deact. Date",type:"date"},{k:"increment",l:"Increment",type:"number"}]} checkFields={[{k:"publicate",l:"Publish"},{k:"bypercent",l:"By Percent"}]} />}

            {/* ── Cities Setup Modal ─────────────────────────────────────── */}
            {ciSetup && <SetupModal title="Cities Setup" onClose={()=>{setCiSetup(false); qc.invalidateQueries({queryKey:["fr-look"]});}} listUrl="/api/freights/cities" detailUrl="/api/freights/cities" emptyForm={EMPTY_CI} cols={[{key:"city",label:"City"}]} formFields={[{k:"city",l:"City *"},{k:"country_iso",l:"Country ISO"},{k:"buyer_email",l:"Buyer Email"}]} checkFields={[]} />}

            {/* ── Airlines Setup Modal ───────────────────────────────────── */}
            {alSetup && <SetupModal title="Airlines Setup" onClose={()=>{setAlSetup(false); qc.invalidateQueries({queryKey:["fr-look"]});}} listUrl="/api/freights/airlines" detailUrl="/api/freights/airlines" emptyForm={EMPTY_AL} cols={[{key:"airline",label:"Airline"},{key:"cod_linea",label:"Code"}]} formFields={[{k:"cod_linea",l:"Code"},{k:"airline",l:"Airline *"},{k:"address",l:"Address"},{k:"city",l:"City"},{k:"country",l:"Country"},{k:"phone",l:"Phone"},{k:"fax",l:"Fax"},{k:"email",l:"Email"},{k:"contact",l:"Contact"}]} checkFields={[]} />}
        </div>
    );
}

// ─── Reusable helpers ─────────────────────────────────────────────────────────
function FField({ label, value, onChange, type="text", span2=false }: any) {
    return (
        <div className={cn("flex flex-col gap-0.5", span2 && "col-span-2")}>
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
            <input type={type} value={value||""} onChange={e=>onChange(e.target.value)} className="fos-input text-xs py-1" />
        </div>
    );
}

function SimpleModal({ title, onSave, onClose, saving, error, isDelete=false, deleteMsg="", children }: any) {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                <div className="h-10 bg-[#374151] rounded-t-xl flex items-center justify-between px-4">
                    <span className="font-black text-[11px] uppercase tracking-widest text-white">{title}</span>
                    <button onClick={onClose}><XCircle size={16} className="text-gray-400 hover:text-white" /></button>
                </div>
                <div className="p-4">
                    {isDelete ? (
                        <div className="flex flex-col items-center gap-4 py-2">
                            <Trash2 size={28} className="text-red-500" />
                            <p className="text-sm text-gray-600 text-center">{deleteMsg}</p>
                            {error && <p className="text-xs text-red-500 font-bold">{error}</p>}
                        </div>
                    ) : (
                        <>{error && <p className="text-xs text-red-500 font-bold mb-3">{error}</p>}{children}</>
                    )}
                </div>
                <div className="flex justify-end gap-3 px-4 py-3 bg-gray-50 border-t rounded-b-xl">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
                    <button onClick={onSave} disabled={saving} className={cn("flex items-center gap-2 px-5 py-2 rounded-lg text-white text-sm font-black uppercase tracking-wider transition-all disabled:opacity-50", isDelete ? "bg-red-600 hover:bg-red-700" : "bg-[#FB7506] hover:bg-orange-600")}>
                        {saving ? <RefreshCcw size={14} className="animate-spin" /> : isDelete ? <Trash2 size={14} /> : <Save size={14} />}
                        {saving ? "..." : isDelete ? "Delete" : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Generic Setup Modal (Seasons / Cities / Airlines) ────────────────────────
function SetupModal({ title, onClose, listUrl, detailUrl, emptyForm, cols, formFields, checkFields }: any) {
    const t2 = (v: any) => String(v ?? "").trim();
    const [rows,    setRows]    = useState<any[]>([]);
    const [selRow,  setSelRow]  = useState<any>(null);
    const [mode,    setMode]    = useState<"view"|"add"|"edit">("view");
    const [form,    setForm]    = useState<any>(emptyForm);
    const [search,  setSearch]  = useState("");
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState<string|null>(null);
    const [saving,  setSaving]  = useState(false);

    const load = useCallback(async (q: string) => {
        setLoading(true);
        try { const d = await ff(`${listUrl}?search=${encodeURIComponent(q||"%")}`); setRows(d); if (d.length>0) setSelRow(d[0]); }
        catch { /* ignore */ }
        finally { setLoading(false); }
    }, [listUrl]);

    useEffect(() => { load("%"); }, []);

    const save = async () => {
        setSaving(true); setError(null);
        try {
            if (mode === "add") {
                await fetch(detailUrl, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
            } else if (mode === "edit" && selRow) {
                await fetch(`${detailUrl}/${selRow.unico}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
            }
            await load(search); setMode("view");
        } catch (e: any) { setError(e.message); }
        finally { setSaving(false); }
    };

    const del = async () => {
        if (!selRow || !confirm(`Delete "${t2(selRow[cols[0].key])}"?`)) return;
        setSaving(true);
        try { await fetch(`${detailUrl}/${selRow.unico}`, { method:"DELETE" }); setSelRow(null); await load(search); }
        catch (e: any) { setError(e.message); }
        finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col">
                <div className="h-10 bg-[#374151] rounded-t-xl flex items-center justify-between px-4 shrink-0">
                    <span className="font-black text-[11px] uppercase tracking-widest text-white">{title}</span>
                    <button onClick={onClose}><XCircle size={16} className="text-gray-400 hover:text-white" /></button>
                </div>
                <div className="flex flex-1 overflow-hidden gap-0">
                    {/* Left: list */}
                    <div className="w-56 border-r border-gray-200 flex flex-col shrink-0">
                        <div className="p-2 border-b border-gray-100 flex items-center gap-1.5 shrink-0">
                            <div className="relative flex-1">
                                <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="text" value={search} onChange={e=>{setSearch(e.target.value);load(e.target.value);}} placeholder="Search..." className="w-full pl-7 pr-2 py-1 text-xs border border-gray-200 rounded outline-none focus:ring-1 focus:ring-[#FB7506]" />
                            </div>
                        </div>
                        <div className="overflow-auto flex-1 text-xs">
                            {rows.map((r: any, i: number) => (
                                <div key={r.unico||i} onClick={() => { setSelRow(r); setMode("view"); }}
                                    className={cn("px-3 py-2 border-b cursor-pointer transition-colors", selRow?.unico===r.unico ? "!bg-blue-100" : "hover:bg-blue-50")}>
                                    {cols.map((c: any) => <span key={c.key} className="mr-2">{c.render?c.render(r[c.key],r):t2(r[c.key])}</span>)}
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-1 p-2 border-t border-gray-100 shrink-0">
                            <button onClick={()=>{setForm({...emptyForm});setMode("add");setError(null);}} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1 rounded text-[9px] font-black uppercase"><Plus size={9} className="inline" /> Add</button>
                            <button onClick={()=>{if(selRow){const f:any={};formFields.forEach((ff2:any)=>{f[ff2.k]=t2(selRow[ff2.k]);});checkFields.forEach((cf:any)=>{f[cf.k]=!!selRow[cf.k];});setForm(f);setMode("edit");setError(null);}}} disabled={!selRow} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white py-1 rounded text-[9px] font-black uppercase"><Pencil size={9} className="inline" /> Edit</button>
                            <button onClick={del} disabled={!selRow} className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white py-1 rounded text-[9px] font-black uppercase"><Trash2 size={9} className="inline" /> Del</button>
                        </div>
                    </div>
                    {/* Right: form */}
                    <div className="flex-1 p-4 overflow-auto">
                        {mode === "view" ? (
                            <div className="h-full flex items-center justify-center text-gray-300 text-xs font-bold uppercase">Select a record or click Add</div>
                        ) : (
                            <div className="space-y-3 text-xs">
                                {error && <p className="text-xs text-red-500 font-bold">{error}</p>}
                                <div className="grid grid-cols-2 gap-3">
                                    {formFields.map((f: any) => (
                                        <div key={f.k} className="flex flex-col gap-0.5">
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{f.l}</label>
                                            <input type={f.type||"text"} value={form[f.k]||""} onChange={e=>setForm((p:any)=>({...p,[f.k]:e.target.value}))} className="fos-input text-xs py-1" />
                                        </div>
                                    ))}
                                </div>
                                {checkFields.length > 0 && (
                                    <div className="flex flex-wrap gap-3 pt-1">
                                        {checkFields.map((c: any) => (
                                            <label key={c.k} className="flex items-center gap-1.5 cursor-pointer">
                                                <input type="checkbox" checked={!!form[c.k]} onChange={e=>setForm((p:any)=>({...p,[c.k]:e.target.checked}))} className="w-3.5 h-3.5 accent-[#FB7506]" />
                                                <span className="text-[10px] font-semibold">{c.l}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                                <div className="flex gap-2 pt-2">
                                    <button onClick={save} disabled={saving} className="flex items-center gap-1.5 bg-[#FB7506] hover:bg-orange-600 disabled:opacity-50 text-white px-4 py-2 rounded text-xs font-black uppercase">
                                        {saving ? <RefreshCcw size={12} className="animate-spin" /> : <Save size={12} />}{saving?"...":"Save"}
                                    </button>
                                    <button onClick={()=>{setMode("view");setError(null);}} className="px-4 py-2 rounded border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
