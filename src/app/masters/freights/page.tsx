"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Plus, Pencil, Trash2, Save, X, RefreshCcw,
    Copy, Zap, Building2, Cloud, MapPin, Check, AlertCircle,
    XCircle, Search, ChevronLeft, Menu
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { GridMenu } from "@/components/GridMenu";

import { cn } from "@/lib/utils";
import { AppFooter } from "@/components/layout/AppFooter";
import { useAuditLog } from "@/lib/audit";
import { usePagePermissions, PERMISSION_MSGS } from "@/lib/permissions";
import { AuditLogModal } from "@/components/AuditLogModal";
import { EntityListModal } from "@/components/EntityListModal";
import { EntityFormModal } from "@/components/EntityFormModal";

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const t       = (v: any) => String(v ?? "").trim();
const ff      = async (url: string) => { const r = await fetch(url); const j = await r.json(); if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`); return j; };

// â”€â”€â”€ Empty forms â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const EMPTY_WH   = { wp_name:"", cargo:false, send_xml:false, charge:false, address:"", city:"", state:"", zipcode:"", country:"", phone:"", fax:"", email:"", grower_uq:"", handling_kg:0, send_to_whouse:false };
const EMPTY_FR   = { wphysical_uq:"", season_uq:"", city_uq:"", freight:0, freight_kg:0 };
const EMPTY_HA   = { wphysical_uq:"", season_uq:"", handling:0 };
const EMPTY_AT   = { wphysical_uq:"", season_uq:"", city_uq:"", tariff:0 };
const EMPTY_SE   = { season:"", sh_season:"", startdate:"", enddate:"", activedate:"", desacdate:"", publicate:false, increment:0, bypercent:false };
const EMPTY_CI   = { country_iso:"", city:"", buyer_email:"" };
const EMPTY_AL   = { cod_linea:"", airline:"", address:"", city:"", country:"", phone:"", fax:"", email:"", contact:"" };

// â”€â”€â”€ Shared mini-components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function GridHeader({ icon: Icon, title, loading, children, recordId, onRefresh }: any) {
    return (
        <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 border-b border-black/10 shrink-0">
            <div className="flex items-center gap-2">
                <Icon size={16} className="text-[#FB7506]" />
                <span className="fos-grid-header-text">{title}</span>
                <AuditLogModal recordId={recordId} disabled={!recordId} />
            </div>
            <div className="flex items-center gap-1">
                {onRefresh && (
                    <button onClick={onRefresh} disabled={loading} className="w-7 h-7 flex items-center justify-center text-white hover:bg-white/10 rounded transition-all disabled:opacity-40" title="Refresh">
                        {loading ? <RefreshCcw size={16} className="text-gray-400 animate-spin" /> : <RefreshCcw size={16} />}
                    </button>
                )}
                {children}
            </div>

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

// Icon color classes per type
const ITEM_COLORS: Record<string, { icon: string; text: string }> = {
    green: { icon: "text-green-600",  text: "text-green-700"  },
    blue:  { icon: "text-blue-500",   text: "text-gray-800"   },
    red:   { icon: "text-red-500",    text: "text-gray-800"   },
    gray:  { icon: "text-gray-500",   text: "text-gray-800"   },
    amber: { icon: "text-amber-500",  text: "text-gray-800"   },
};



function MiniTable({ cols, rows, selUnico, onSelect, onDblClick, empty }: any) {
    return (
        <div className="overflow-auto flex-1 max-h-[250px] lg:max-h-none">
            <table className="min-w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 fos-grid-thead sticky top-0 z-10">
                    <tr>{cols.map((c: any) => <th key={c.key} className={cn("p-1.5 whitespace-nowrap border-r border-gray-100 last:border-r-0", c.className)}>{c.label}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50 fos-grid-tbody">
                    {rows.length === 0 ? (
                        <tr><td colSpan={cols.length} className="p-4 text-center text-gray-300 italic text-xs">{empty}</td></tr>
                    ) : rows.map((r: any, i: number) => {
                        const isSel = selUnico && (selUnico === r.unico);
                        return (
                            <tr key={r.unico||i} onClick={() => onSelect?.(r)}
                                onDoubleClick={() => onDblClick?.(r)}
                                className={cn("cursor-pointer transition-colors", isSel ? "!bg-blue-50 ring-1 ring-inset ring-blue-200" : "hover:bg-gray-50/80")}>
                                {cols.map((c: any) => (
                                    <td key={c.key} className={cn("p-1.5 border-r border-gray-50 last:border-r-0", c.className)}>
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

// â”€â”€â”€ Main Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

    useEffect(() => { if (status === "unauthenticated") router.push("/login"); }, [status, router]);

    // â”€â”€ Queries â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

    // â”€â”€ Warehouse CRUD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

    // â”€â”€ Freight CRUD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

    // â”€â”€ Handling CRUD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

    // â”€â”€ ATPDA CRUD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

    // â”€â”€ Copy Freights â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const [copySourceSeason, setCopySourceSeason] = useState("");
    const [copyTargetSeason, setCopyTargetSeason] = useState("");
    const doCopy = async () => {
        if (!copySourceSeason) { setError("Source season is required."); return; }
        setSaving(true); setError(null);
        try {
            const res = await fetch("/api/freights/rates/copy", { method:"POST", headers:{"Content-Type":"application/json"},
                body:JSON.stringify({ wphysical_uq: selWh?.unico, season_uq_from: copySourceSeason, season_uq_to: copyTargetSeason }) });
            const d = await res.json(); if (!d.success) throw new Error(d.error);
            logAction("Insert", selWh?.unico || "", "Copy Freight Rates");
            await refetchFr(); setCopyModal(false); setCopySourceSeason(""); setCopyTargetSeason("");
        } catch (e: any) { setError(e.message); }
        finally { setSaving(false); }
    };

    // â”€â”€ Update AWBs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

    // â”€â”€ Cities CRUD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const loadCities = useCallback(async () => {
        try {
            const d = await ff("/api/freights/cities?search=%");
            return d;
        } catch { return []; }
    }, []);

    const saveCity = async () => {
        if (!ciForm.city.trim()) { setCiError("City is required."); return; }
        setCiSaving(true); setCiError(null);
        try {
            if (ciFormMode === "add") {
                const res = await fetch("/api/freights/cities", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(ciForm) });
                const d = await res.json(); if (!d.success) throw new Error(d.error);
                logAction("Insert", d.unico || "city", "City");
            } else {
                const res = await fetch(`/api/freights/cities/${ciSel.unico}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(ciForm) });
                const d = await res.json(); if (!d.success) throw new Error(d.error);
                logAction("Edit", ciSel.unico, "City");
            }
            setCiFormOpen(false); setCiSel(null); setCiForm(EMPTY_CI);
            await qc.invalidateQueries({ queryKey: ["fr-look"] });
        } catch (e: any) { setCiError(e.message); }
        finally { setCiSaving(false); }
    };

    const deleteCity = async (row: any) => {
        if (!confirm(`Delete city "${t(row.city)}"?`)) return;
        setCiSaving(true);
        try {
            await fetch(`/api/freights/cities/${row.unico}`, { method:"DELETE" });
            logAction("Delete", row.unico, "City");
            setCiSel(null);
            await qc.invalidateQueries({ queryKey: ["fr-look"] });
        } catch (e: any) { setCiError(e.message); }
        finally { setCiSaving(false); }
    };

    // â”€â”€ Airlines CRUD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const loadAirlines = useCallback(async () => {
        try {
            const d = await ff("/api/freights/airlines?search=%");
            return d;
        } catch { return []; }
    }, []);

    const saveAirline = async () => {
        if (!alForm.airline.trim()) { setAlError("Airline is required."); return; }
        setAlSaving(true); setAlError(null);
        try {
            if (alFormMode === "add") {
                const res = await fetch("/api/freights/airlines", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(alForm) });
                const d = await res.json(); if (!d.success) throw new Error(d.error);
                logAction("Insert", d.unico || "airline", "Airline");
            } else {
                const res = await fetch(`/api/freights/airlines/${alSel.unico}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(alForm) });
                const d = await res.json(); if (!d.success) throw new Error(d.error);
                logAction("Edit", alSel.unico, "Airline");
            }
            setAlFormOpen(false); setAlSel(null); setAlForm(EMPTY_AL);
            await qc.invalidateQueries({ queryKey: ["fr-look"] });
        } catch (e: any) { setAlError(e.message); }
        finally { setAlSaving(false); }
    };

    const deleteAirline = async (row: any) => {
        if (!confirm(`Delete airline "${t(row.airline)}"?`)) return;
        setAlSaving(true);
        try {
            await fetch(`/api/freights/airlines/${row.unico}`, { method:"DELETE" });
            logAction("Delete", row.unico, "Airline");
            setAlSel(null);
            await qc.invalidateQueries({ queryKey: ["fr-look"] });
        } catch (e: any) { setAlError(e.message); }
        finally { setAlSaving(false); }
    };

    // â”€â”€ Seasons CRUD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const saveSeason = async () => {
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
            await qc.invalidateQueries({ queryKey: ["fr-look"] });
        } catch (e: any) { setSeError(e.message); }
        finally { setSeSaving(false); }
    };

    const deleteSeason = async () => {
        if (!selSe || !confirm(`Delete season "${t(selSe.season)}"?`)) return;
        setSeSaving(true);
        try {
            await fetch(`/api/freights/seasons/${selSe.unico}`, { method:"DELETE" });
            logAction("Delete", selSe.unico, "Season");
            setSelSe(null);
            await qc.invalidateQueries({ queryKey: ["fr-look"] });
        } catch (e: any) { setSeError(e.message); }
        finally { setSeSaving(false); }
    };

    if (status === "loading") return null;

    return (
        <div className="flex flex-col h-[100dvh] bg-[#f4f6f8] overflow-hidden font-sans text-[#333]">

            <AppHeader title="Freights" />

            {error && (
                <div className="bg-amber-50 border-b border-amber-200 px-4 py-1.5 flex items-center gap-2 shrink-0">
                    <AlertCircle size={13} className="text-amber-500" />
                    <span className="text-xs text-amber-700 font-bold">{error}</span>
                    <button onClick={() => setError(null)} className="ml-auto text-amber-400 hover:text-amber-600"><XCircle size={14} /></button>
                </div>
            )}

            {/* Main layout â€” responsive: stacked on mobile, 2-row grid on lg+ */}
            <div className="flex-1 p-2 pr-3 overflow-y-auto lg:overflow-hidden">
                <div className="flex flex-col lg:grid lg:grid-rows-2 gap-2 lg:h-full">

                    {/* Row 1: Warehouses + Seasons */}
                    <div className="flex flex-col lg:grid gap-2 min-h-[200px] lg:min-h-0" style={{ gridTemplateColumns: "43fr 57fr" }}>

                    {/* Physical Warehouses */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col overflow-hidden">
                        <GridHeader icon={Building2} title="Physical Warehouses" loading={loadingWh} recordId={selWh?.unico} onRefresh={() => qc.invalidateQueries({ queryKey: ["fr-wh"] })}>
                            <GridMenu items={[
                                { label:"Add Warehouse", icon:Plus,   color:"green", onClick:() => { setWhForm({...EMPTY_WH}); setError(null); setWhModal({mode:"add"}); }, disabled:!perms.canCreate },
                                { label:"Edit Selected",  icon:Pencil, color:"blue",  onClick:() => { if(!selWh) return; setWhForm({ wp_name:t(selWh.wp_name), cargo:!!selWh.cargo, send_xml:!!selWh.send_xml, charge:!!selWh.charge, address:t(selWh.address), city:t(selWh.city), state:t(selWh.state), zipcode:t(selWh.zipcode), country:t(selWh.country), phone:t(selWh.phone), fax:t(selWh.fax), email:t(selWh.email), grower_uq:t(selWh.grower_uq), handling_kg:selWh.handling_kg||0, send_to_whouse:!!selWh.send_to_whouse }); setError(null); setWhModal({mode:"edit"}); }, disabled:!selWh || !perms.canEdit },
                                { label:"Delete Selected",icon:Trash2, color:"red",   onClick:() => { if(selWh){setError(null);setWhModal({mode:"delete"});} }, disabled:!selWh || !perms.canDelete },
                            ]} />
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
                            <GridMenu items={[
                                { label:"Add Season", icon:Plus, color:"green", onClick:() => { setSeForm({...EMPTY_SE}); setSeFormMode("add"); setSeError(null); setSeFormOpen(true); }, disabled:!perms.canCreate },
                                { label:"Edit Selected", icon:Pencil, color:"blue", onClick:() => { if(!selSe) return; setSeForm({ season:t(selSe.season), sh_season:t(selSe.sh_season), startdate:t(selSe.startdate), enddate:t(selSe.enddate), activedate:t(selSe.activedate), desacdate:t(selSe.desacdate), publicate:!!selSe.publicate, increment:selSe.increment||0, bypercent:!!selSe.bypercent }); setSeFormMode("edit"); setSeError(null); setSeFormOpen(true); }, disabled:!selSe || !perms.canEdit },
                                { label:"Delete Selected", icon:Trash2, color:"red", onClick:() => deleteSeason(), disabled:!selSe || !perms.canDelete },
                            ]} />
                        </GridHeader>
                        <MiniTable
                            cols={[
                                { key:"season",     label:"Season" },
                                { key:"startdate2", label:"From",   className:"text-center" },
                                { key:"enddate2",   label:"To",     className:"text-center" },
                                { key:"active",     label:"Active", className:"text-center",
                                  render: (v: any) => v==="Yes"||v===true ? <Check size={10} className="text-green-500 mx-auto" /> : "â€”" },
                            ]}
                            rows={seasons}
                            selUnico={selSe?.unico}
                            onSelect={setSelSe}
                            empty="No seasons"
                        />
                    </div>
                </div>

                    {/* Row 2: Freights + Handling + ATPDA */}
                    <div className="flex flex-col lg:grid gap-2 min-h-[200px] lg:min-h-0" style={{ gridTemplateColumns: "43fr 28fr 29fr" }}>

                    {/* Freights */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col overflow-hidden">
                        <GridHeader icon={Cloud} title={`Freights${selWh ? ` â€” ${t(selWh.wp_name)}` : ""}`} loading={loadingFr} recordId={selFr?.unico} onRefresh={() => refetchFr()}>
                            <GridMenu items={[
                                { label:"Add Rate",      icon:Plus,   color:"green", onClick:() => { if(!selWh){setError("Select a warehouse first.");return;} setFrForm({...EMPTY_FR}); setError(null); setFrModal({mode:"add"}); }, disabled:!selWh || !perms.canCreate },
                                { label:"Edit Selected", icon:Pencil, color:"blue",  onClick:async() => { if(!selFr) return; try { const d = await ff(`/api/freights/rates/${selFr.unico}`); setFrForm({ wphysical_uq: d.wphysical_uq||selWh?.unico, season_uq: d.season_uq||"", city_uq: d.city_uq||"", freight: d.freight||0, freight_kg: d.freight_kg||0 }); setError(null); setFrModal({mode:"edit"}); } catch(e:any){setError(e.message);} }, disabled:!selFr || !perms.canEdit },
                                { label:"Delete Selected",icon:Trash2, color:"red",  onClick:() => { if(selFr){setError(null);setFrModal({mode:"delete"});} }, disabled:!selFr || !perms.canDelete },
                                { label:"Copy From...",  icon:Copy,   color:"gray",  onClick:() => { if(!selWh){setError("Select a warehouse first.");return;} if(!confirm("Copy freights from another season?")) return; setCopyModal(true); }, disabled:!selWh },
                                { label:"Update AWBs",   icon:Zap,    color:"amber", onClick:updateAwbs, disabled:!selFr },
                            ]} />
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
                        <GridHeader icon={Building2} title="Handling" loading={loadingHa} recordId={selHa?.unico} onRefresh={() => refetchHa()}>
                            <GridMenu items={[
                                { label:"Add Rate",      icon:Plus,   color:"green", onClick:() => { if(!selWh){setError("Select a warehouse first.");return;} setHaForm({...EMPTY_HA}); setError(null); setHaModal({mode:"add"}); }, disabled:!selWh || !perms.canCreate },
                                { label:"Edit Selected", icon:Pencil, color:"blue",  onClick:async() => { if(!selHa) return; try { const d = await ff(`/api/freights/handling/${selHa.unico}`); setHaForm({ wphysical_uq: d.wphysical_uq||selWh?.unico, season_uq: d.season_uq||"", handling: d.handling||0 }); setError(null); setHaModal({mode:"edit"}); } catch(e:any){setError(e.message);} }, disabled:!selHa || !perms.canEdit },
                                { label:"Delete Selected",icon:Trash2, color:"red", onClick:() => { if(selHa){setError(null);setHaModal({mode:"delete"});} }, disabled:!selHa || !perms.canDelete },
                            ]} />
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
                        <GridHeader icon={MapPin} title="ATPDA" loading={loadingAt} recordId={selAt?.unico} onRefresh={() => refetchAt()}>
                            <GridMenu items={[
                                { label:"Add Tariff",    icon:Plus,   color:"green", onClick:() => { if(!selWh){setError("Select a warehouse first.");return;} setAtForm({...EMPTY_AT}); setError(null); setAtModal({mode:"add"}); }, disabled:!selWh || !perms.canCreate },
                                { label:"Edit Selected", icon:Pencil, color:"blue",  onClick:async() => { if(!selAt) return; try { const d = await ff(`/api/freights/atpda/${selAt.unico}`); setAtForm({ wphysical_uq: d.wphysical_uq||selWh?.unico, season_uq: d.season_uq||"", city_uq: d.city_uq||"", tariff: d.tariff||0 }); setError(null); setAtModal({mode:"edit"}); } catch(e:any){setError(e.message);} }, disabled:!selAt || !perms.canEdit },
                                { label:"Delete Selected",icon:Trash2, color:"red", onClick:() => { if(selAt){setError(null);setAtModal({mode:"delete"});} }, disabled:!selAt || !perms.canDelete },
                            ]} />
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
        </div>

        {/* Footer */}
            <div className="h-8 bg-gray-100 border-t px-3 sm:px-4 flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-tight shrink-0">
                <div className="flex gap-2 sm:gap-4"><span>Server: Production</span><span className="text-gray-300 hidden sm:inline">|</span><span className="hidden sm:inline">Database: FullPot</span></div>
                <span className="text-[#FB7506]">FOS Masters V.2.0.1</span>
            </div>

            {/* â”€â”€ Warehouse Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            {whModal && (
                <SimpleModal title={`${whModal.mode === "add" ? "Add" : whModal.mode === "edit" ? "Edit" : "Delete"} Warehouse`} icon={Building2}
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
                                <select value={whForm.grower_uq} onChange={e=>setWhForm((p:any)=>({...p,grower_uq:e.target.value}))} className="fos-input h-10 text-sm">
                                    <option value="">â€” None â€”</option>
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

            {/* â”€â”€ Freight Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            {frModal && (
                <SimpleModal title={`${frModal.mode === "add" ? "Add" : frModal.mode === "edit" ? "Edit" : "Delete"} Freight Rate`} icon={Zap}
                    onSave={saveFr} onClose={() => { setFrModal(null); setError(null); }} saving={saving} error={error}
                    isDelete={frModal.mode === "delete"} deleteMsg="Delete this freight rate?">
                    {frModal.mode !== "delete" && (
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="flex flex-col gap-0.5"><label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Season *</label>
                                <select value={frForm.season_uq} onChange={e=>setFrForm((p:any)=>({...p,season_uq:e.target.value}))} className="fos-input h-10 text-sm">
                                    <option value="">â€” Select â€”</option>
                                    {seasons.map((s:any)=><option key={s.unico} value={s.unico}>{t(s.season)}</option>)}
                                </select></div>
                            <div className="flex flex-col gap-0.5"><label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">City *</label>
                                <select value={frForm.city_uq} onChange={e=>setFrForm((p:any)=>({...p,city_uq:e.target.value}))} className="fos-input h-10 text-sm">
                                    <option value="">â€” Select â€”</option>
                                    {cities.map((c:any)=><option key={c.unico} value={c.unico}>{t(c.city)}</option>)}
                                </select></div>
                            <FField label="Freight FB (4 dec)" value={String(frForm.freight)} type="number" onChange={(v:string)=>setFrForm((p:any)=>({...p,freight:parseFloat(v)||0}))} />
                            <FField label="Freight KG (2 dec)" value={String(frForm.freight_kg)} type="number" onChange={(v:string)=>setFrForm((p:any)=>({...p,freight_kg:parseFloat(v)||0}))} />
                        </div>
                    )}
                </SimpleModal>
            )}

            {/* â”€â”€ Handling Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            {haModal && (
                <SimpleModal title={`${haModal.mode === "add" ? "Add" : haModal.mode === "edit" ? "Edit" : "Delete"} Handling Rate`} icon={Cloud}
                    onSave={saveHa} onClose={() => { setHaModal(null); setError(null); }} saving={saving} error={error}
                    isDelete={haModal.mode === "delete"} deleteMsg="Delete this handling rate?">
                    {haModal.mode !== "delete" && (
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="flex flex-col gap-0.5"><label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Season *</label>
                                <select value={haForm.season_uq} onChange={e=>setHaForm((p:any)=>({...p,season_uq:e.target.value}))} className="fos-input h-10 text-sm">
                                    <option value="">â€” Select â€”</option>
                                    {seasons.map((s:any)=><option key={s.unico} value={s.unico}>{t(s.season)}</option>)}
                                </select></div>
                            <FField label="Handling FB (4 dec)" value={String(haForm.handling)} type="number" onChange={(v:string)=>setHaForm((p:any)=>({...p,handling:parseFloat(v)||0}))} />
                        </div>
                    )}
                </SimpleModal>
            )}

            {/* â”€â”€ ATPDA Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            {atModal && (
                <SimpleModal title={`${atModal.mode === "add" ? "Add" : atModal.mode === "edit" ? "Edit" : "Delete"} ATPDA Tariff`} icon={MapPin}
                    onSave={saveAt} onClose={() => { setAtModal(null); setError(null); }} saving={saving} error={error}
                    isDelete={atModal.mode === "delete"} deleteMsg="Delete this ATPDA tariff?">
                    {atModal.mode !== "delete" && (
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="flex flex-col gap-0.5"><label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Season *</label>
                                <select value={atForm.season_uq} onChange={e=>setAtForm((p:any)=>({...p,season_uq:e.target.value}))} className="fos-input h-10 text-sm">
                                    <option value="">â€” Select â€”</option>
                                    {seasons.map((s:any)=><option key={s.unico} value={s.unico}>{t(s.season)}</option>)}
                                </select></div>
                            <div className="flex flex-col gap-0.5"><label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">City *</label>
                                <select value={atForm.city_uq} onChange={e=>setAtForm((p:any)=>({...p,city_uq:e.target.value}))} className="fos-input h-10 text-sm">
                                    <option value="">â€” Select â€”</option>
                                    {cities.map((c:any)=><option key={c.unico} value={c.unico}>{t(c.city)}</option>)}
                                </select></div>
                            <FField label="Tariff %" value={String(atForm.tariff)} type="number" onChange={(v:string)=>setAtForm((p:any)=>({...p,tariff:parseFloat(v)||0}))} />
                        </div>
                    )}
                </SimpleModal>
            )}

            {/* â”€â”€ Copy Freights Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            {copyModal && (
                <SimpleModal title="Copy Freights â€” Select Source Season" icon={Copy} onSave={doCopy} onClose={()=>{setCopyModal(false);setError(null);setCopySourceSeason("");setCopyTargetSeason("");}} saving={saving} error={error}>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="flex flex-col gap-0.5"><label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Source Season *</label>
                            <select value={copySourceSeason} onChange={e=>setCopySourceSeason(e.target.value)} className="fos-input h-10 text-sm">
                                <option value="">â€” From â€”</option>
                                {seasons.map((s:any)=><option key={s.unico} value={s.unico}>{t(s.season)}</option>)}
                            </select></div>
                        <div className="flex flex-col gap-0.5"><label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Target Season *</label>
                            <select value={copyTargetSeason} onChange={e=>setCopyTargetSeason(e.target.value)} className="fos-input h-10 text-sm">
                                <option value="">â€” To â€”</option>
                                {seasons.map((s:any)=><option key={s.unico} value={s.unico}>{t(s.season)}</option>)}
                            </select></div>
                    </div>
                </SimpleModal>
            )}

            {/* â”€â”€ Seasons Form Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <EntityFormModal
                open={seFormOpen}
                title={seFormMode === "add" ? "New Season" : "Edit Season"}
                icon={Zap}
                recordId={seFormMode === "edit" && selSe?.unico ? selSe.unico : null}
                subtitle={seFormMode === "edit" && selSe ? selSe.season : undefined}
                form={seForm}
                fields={[{k:"season",l:"Season Name *"},{k:"sh_season",l:"Short Code"},{k:"startdate",l:"Start Date",type:"date"},{k:"enddate",l:"End Date",type:"date"},{k:"activedate",l:"Active Date",type:"date"},{k:"desacdate",l:"Deact. Date",type:"date"},{k:"increment",l:"Increment",type:"number"}]}
                checkFields={[{k:"publicate",l:"Publish"},{k:"bypercent",l:"By Percent"}]}
                onChange={(k, v) => setSeForm((p: any) => ({...p, [k]: v}))}
                onSave={saveSeason}
                onClose={() => { setSeFormOpen(false); setSeError(null); }}
                saving={seSaving}
                error={seError}
            />

            {/* â”€â”€ Cities Setup Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            {/* â”€â”€ Cities List + Form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
                onDelete={deleteCity}
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
                onSave={saveCity}
                onClose={() => { setCiFormOpen(false); setCiError(null); }}
                saving={ciSaving}
                error={ciError}
            />

            {/* â”€â”€ Airlines Setup Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            {/* â”€â”€ Airlines List + Form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
                onDelete={deleteAirline}
            />
            <EntityFormModal
                open={alFormOpen}
                title={alFormMode === "add" ? "New Airline" : "Edit Airline"}
                icon={Cloud}
                recordId={alSel?.unico}
                subtitle={alFormMode === "edit" && alSel ? alSel.airline : undefined}
                form={alForm}
                fields={[{k:"cod_linea",l:"Code"},{k:"airline",l:"Airline *"},{k:"address",l:"Address"},{k:"city",l:"City"},{k:"country",l:"Country"},{k:"phone",l:"Phone"},{k:"fax",l:"Fax"},{k:"email",l:"Email"},{k:"contact",l:"Contact"}]}
                onChange={(k, v) => setAlForm((p: any) => ({...p, [k]: v}))}
                onSave={saveAirline}
                onClose={() => { setAlFormOpen(false); setAlError(null); }}
                saving={alSaving}
                error={alError}
            />

            {/* Floating action buttons */}
            <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
                <button onClick={() => setCiSetup(true)} className="flex items-center gap-2 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2.5 rounded-full shadow-lg text-xs font-black uppercase tracking-wider transition-all"><MapPin size={14} /> Cities</button>
                <button onClick={() => setAlSetup(true)} className="flex items-center gap-2 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2.5 rounded-full shadow-lg text-xs font-black uppercase tracking-wider transition-all"><Cloud size={14} /> Airlines</button>
            </div>
        </div>
    );
}

// â”€â”€â”€ Reusable helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function FField({ label, value, onChange, type="text", span2=false }: any) {
    return (
        <div className={cn("flex flex-col gap-0.5", span2 && "col-span-2")}>
            <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">{label}</label>
            <input type={type} value={value||""} onChange={e=>onChange(e.target.value)} className="fos-input h-10 text-sm" />
        </div>
    );
}

function SimpleModal({ title, icon: Icon, onSave, onClose, saving, error, isDelete=false, deleteMsg="", children }: any) {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                <div className="h-10 bg-[#374151] flex items-center justify-between px-4 border-b border-black/10">
                    <div className="flex items-center gap-2">
                        {Icon && <Icon size={16} className="text-[#FB7506]" />}
                        <span className="fos-grid-header-text">{title}</span>
                    </div>
                    <button onClick={onClose}><X size={16} className="text-gray-400 hover:text-white" /></button>
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

// â”€â”€â”€ MENU dropdown (Appsmith style: outline icons + bold text + separators) â”€â”€â”€
function MenuDropdown({ onAdd, onEdit, onDel, canEdit, canDel, menuOpen, setMenuOpen, saving }: any) {
    const items = [
        { label: "Add Record",      icon: Plus,   onClick: onAdd,  enabled: true,              color: "text-green-600",  text: "text-green-700" },
        { label: "Edit Selected",   icon: Pencil, onClick: onEdit, enabled: !!canEdit,          color: "text-[#FB7506]",  text: "text-gray-800"  },
        { label: "Delete Selected", icon: Trash2, onClick: onDel,  enabled: !!canDel && !saving, color: "text-red-500",   text: "text-gray-800"  },
    ];
    return (
        <div className="relative shrink-0">
            <button
                onClick={() => setMenuOpen((o: boolean) => !o)}
                className="flex items-center justify-center w-10 h-10 bg-[#FB7506] hover:bg-orange-600 text-white rounded-lg shadow-sm transition-all active:scale-95"
                title="Menu"
            >
                <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
                    <rect y="0"    width="18" height="2.5" rx="1.25" fill="white"/>
                    <rect y="5.75" width="18" height="2.5" rx="1.25" fill="white"/>
                    <rect y="11.5" width="18" height="2.5" rx="1.25" fill="white"/>
                </svg>
            </button>
            {menuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-56 bg-white border border-gray-200 rounded-lg shadow-2xl z-50 overflow-hidden">
                    {items.map((item, i) => (
                        <button key={i} onClick={() => { item.onClick(); setMenuOpen(false); }}
                            disabled={!item.enabled}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors",
                                i < items.length - 1 && "border-b border-gray-100"
                            )}>
                            <item.icon size={20} className={item.color} />
                            <span className={cn("text-sm font-bold", item.text)}>{item.label}</span>
                        </button>
                    ))}
                </div>
            )}
    </div>
);
}

// â”€â”€â”€ Generic Setup Modal â€” list + form + MENU button â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SetupModal({ title, onClose, listUrl, detailUrl, emptyForm, cols, formFields, checkFields }: any) {
    const t2 = (v: any) => String(v ?? "").trim();
    const [rows,     setRows]     = useState<any[]>([]);
    const [selRow,   setSelRow]   = useState<any>(null);
    const [mode,     setMode]     = useState<"view"|"add"|"edit">("view");
    const [form,     setForm]     = useState<any>(emptyForm);
    const [search,   setSearch]   = useState("");
    const [loading,  setLoading]  = useState(false);
    const [error,    setError]    = useState<string|null>(null);
    const [saving,   setSaving]   = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const load = useCallback(async (q: string) => {
        setLoading(true);
        try {
            const d = await ff(`${listUrl}?search=${encodeURIComponent(q||"%")}`);
            setRows(d);
            if (d.length > 0 && !selRow) setSelRow(d[0]);
        } catch { /* ignore */ }
        finally { setLoading(false); }
    }, [listUrl]);

    useEffect(() => { load("%"); }, []);

    // Auto-populate form when a row is selected (for readonly view)
    useEffect(() => {
        if (selRow && mode === "view") {
            const f: any = {};
            formFields.forEach((ff2: any) => { f[ff2.k] = t2(selRow[ff2.k]); });
            checkFields.forEach((cf: any)  => { f[cf.k]  = !!selRow[cf.k];   });
            setForm(f);
        }
    }, [selRow]);

    const openAdd = () => {
        setForm({...emptyForm}); setMode("add"); setError(null); setMenuOpen(false);
    };
    const openEdit = () => {
        if (!selRow) return;
        const f: any = {};
        formFields.forEach((ff2: any) => { f[ff2.k] = t2(selRow[ff2.k]); });
        checkFields.forEach((cf: any)  => { f[cf.k]  = !!selRow[cf.k];    });
        setForm(f); setMode("edit"); setError(null); setMenuOpen(false);
    };

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
        setMenuOpen(false); setSaving(true);
        try { await fetch(`${detailUrl}/${selRow.unico}`, { method:"DELETE" }); setSelRow(null); await load(search); }
        catch (e: any) { setError(e.message); }
        finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
            onClick={() => setMenuOpen(false)}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[70vh] flex flex-col"
                onClick={e => e.stopPropagation()}>

                {/* Dark header â€” title + close only */}
                <div className="h-10 bg-[#374151] rounded-t-xl flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="font-black text-[11px] uppercase tracking-widest text-white">{title}</span>
                        {loading && <RefreshCcw size={10} className="text-gray-400 animate-spin" />}
                    </div>
                    <button onClick={onClose}><XCircle size={16} className="text-gray-400 hover:text-white" /></button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Left: list â€” wider + taller items */}
                    <div className="w-80 border-r border-gray-100 flex flex-col shrink-0">
                        <div className="px-3 border-b border-gray-100 shrink-0" style={{ height: "44px", display:"flex", alignItems:"center" }}>
                            <div className="relative flex-1">
                                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="text" value={search}
                                    onChange={e => { setSearch(e.target.value); load(e.target.value); }}
                                    placeholder="Search..."
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-[#FB7506]" />
                            </div>
                        </div>
                        <div className="overflow-auto flex-1">
                            {rows.map((r: any, i: number) => (
                                <div key={r.unico||i}
                                    onClick={() => { setSelRow(r); if (mode !== "view") setMode("view"); }}
                                    onDoubleClick={() => { setSelRow(r); openEdit(); }}
                                    style={{ minHeight: "44px" }}
                                    className={cn(
                                        "flex items-center px-4 border-b border-gray-50 cursor-pointer transition-colors",
                                        selRow?.unico===r.unico
                                            ? "bg-blue-50 border-l-[3px] border-l-blue-500"
                                            : "hover:bg-gray-50 border-l-[3px] border-l-transparent"
                                    )}>
                                    <div className="flex items-baseline gap-2 min-w-0">
                                        <span className={cn("text-sm font-semibold truncate", selRow?.unico===r.unico ? "text-blue-800" : "text-gray-800")}>
                                            {t2(r[cols[0].key])}
                                        </span>
                                        {cols.slice(1).map((c: any) => (
                                            <span key={c.key} className="text-xs text-gray-400 shrink-0">
                                                {c.render ? c.render(r[c.key], r) : t2(r[c.key])}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: detail / form */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {!selRow && mode === "view" ? (
                            <>
                                {/* Empty state subheader still shows MENU */}
                                <div className="flex items-center justify-between px-4 border-b border-gray-100 shrink-0" style={{ height:"44px" }}>
                                    <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Select a record</span>
                                    <MenuDropdown onAdd={openAdd} onEdit={openEdit} onDel={del} canEdit={false} canDel={false} menuOpen={menuOpen} setMenuOpen={setMenuOpen} saving={saving} />
                                </div>
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-300 gap-2">
                                    <span className="text-4xl">â‰¡</span>
                                    <p className="text-xs font-bold uppercase tracking-widest">Use Menu to add a record</p>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* White subheader with record name + MENU */}
                                <div className="flex items-center justify-between px-4 border-b border-gray-100 shrink-0" style={{ height:"44px" }}>
                                    <span className="text-sm font-black text-gray-800">
                                        {mode === "add" ? "New Record" : mode === "edit" ? `Editing: ${t2(selRow?.[cols[0]?.key])}` : t2(selRow?.[cols[0]?.key])}
                                    </span>
                                    <MenuDropdown onAdd={openAdd} onEdit={openEdit} onDel={del} canEdit={!!selRow} canDel={!!selRow && !saving} menuOpen={menuOpen} setMenuOpen={setMenuOpen} saving={saving} />
                                </div>
                                <div className="overflow-auto p-4">
                                    {error && <p className="text-xs text-red-500 font-bold mb-3">{error}</p>}
                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                        {formFields.map((f: any) => (
                                            <div key={f.k} className="flex flex-col gap-0.5">
                                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{f.l}</label>
                                                <input type={f.type||"text"} value={form[f.k]||""}
                                                    readOnly={mode === "view"}
                                                    onChange={e => mode !== "view" && setForm((p: any) => ({...p, [f.k]: e.target.value}))}
                                                    className={cn("fos-input text-xs py-1.5", mode === "view" && "bg-gray-50 text-gray-600 cursor-default")} />
                                            </div>
                                        ))}
                                    </div>
                                    {checkFields.length > 0 && (
                                        <div className="flex flex-wrap gap-4 pt-3 mt-1 border-t border-gray-100">
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
                                {mode !== "view" && (
                                    <div className="shrink-0 border-t border-gray-100 bg-gray-50 px-4 py-3 flex gap-2 justify-end">
                                        <button onClick={() => { setMode("view"); setError(null); }}
                                            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-100">
                                            Cancel
                                        </button>
                                        <button onClick={save} disabled={saving}
                                            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#FB7506] hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-black uppercase tracking-wider">
                                            {saving ? <RefreshCcw size={14} className="animate-spin" /> : <Save size={14} />}
                                            {saving ? "Saving..." : mode === "add" ? "Create" : "Save"}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}

