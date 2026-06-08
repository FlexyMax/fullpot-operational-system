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
import { AppFooter } from "@/components/layout/AppFooter";
import { GridMenu } from "@/components/GridMenu";
import PanelGrid from "@/components/ui/PanelGrid";
import { PanelGridTable, PanelGridThead, PanelGridTh, PanelGridTbody, PanelGridTr, PanelGridTd } from "@/components/ui/PanelGridTable";
import { cn } from "@/lib/utils";

import { useAuditLog } from "@/lib/audit";
import { usePagePermissions, PERMISSION_MSGS } from "@/lib/permissions";
import { AuditLogModal } from "@/components/AuditLogModal";
import { toast } from "sonner";
import { useFreightsStore } from "@/store/useFreightsStore";

const EMPTY_ARR: any[] = [];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const t       = (v: any) => String(v ?? "").trim();
const ff      = async (url: string) => { const r = await fetch(url); const j = await r.json(); if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`); return j; };

// ─── Empty forms ─────────────────────────────────────────────────────────────
const EMPTY_WH   = { wp_name:"", cargo:false, send_xml:false, charge:false, address:"", city:"", state:"", zipcode:"", country:"", phone:"", fax:"", email:"", grower_uq:"", handling_kg:0, send_to_whouse:false };
const EMPTY_FR   = { wphysical_uq:"", season_uq:"", city_uq:"", freight:0, freight_kg:0 };
const EMPTY_HA   = { wphysical_uq:"", season_uq:"", handling:0 };
const EMPTY_AT   = { wphysical_uq:"", season_uq:"", city_uq:"", tariff:0 };
const EMPTY_SE   = { season:"", sh_season:"", startdate:"", enddate:"", activedate:"", desacdate:"", publicate:false, increment:0, bypercent:false };
const EMPTY_CI   = { country_iso:"", city:"", buyer_email:"" };
const EMPTY_AL   = { cod_linea:"", airline:"", address:"", city:"", country:"", phone:"", fax:"", email:"", contact:"" };

// ─── Simple Forms ────────────────────────────────────────────────────────────
function FField({ label, value, onChange, type="text", span2 }: any) {
    return (
        <div className={cn("flex flex-col gap-0.5", span2 && "col-span-2")}>
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
            <input type={type} value={value} onChange={e=>onChange(e.target.value)} className="fos-input h-10 text-sm" />
        </div>
    );
}

function SimpleModal({ title, icon: Icon, children, onSave, onClose, saving, isDelete, deleteMsg }: any) {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[70] p-4 items-center">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                <div className="h-10 bg-[#374151] flex items-center justify-between px-4 border-b border-black/10 rounded-t-xl">
                    <div className="flex items-center gap-2">
                        {Icon && <Icon size={16} className="text-[#FB7506]" />}
                        <span className="font-black text-[11px] uppercase tracking-widest text-white">{title}</span>
                    </div>
                    <button onClick={onClose}><X size={16} className="text-gray-400 hover:text-white" /></button>
                </div>
                <div className="p-4 overflow-y-auto max-h-[70vh]">
                    {isDelete ? (
                        <div className="flex flex-col items-center gap-4 py-2">
                            <Trash2 size={28} className="text-red-500" />
                            <p className="text-sm text-gray-600 text-center">{deleteMsg}</p>
                        </div>
                    ) : (
                        <>{children}</>
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



function SetupModal({ title, icon: Icon, onClose, listUrl, detailUrl, emptyForm, cols, formFields, checkFields, growers = [] }: any) {
    const t2 = (v: any) => String(v ?? "").trim();
    const [rows,     setRows]     = useState<any[]>([]);
    const [selRow,   setSelRow]   = useState<any>(null);
    const [mode,     setMode]     = useState<"view"|"add"|"edit"|"delete">("view");
    const [form,     setForm]     = useState<any>(emptyForm);
    const [search,   setSearch]   = useState("");
    const [loading,  setLoading]  = useState(false);
    const [saving,   setSaving]   = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const d = await ff(`${listUrl}?search=${encodeURIComponent(search||"%")}`);
            setRows(d);
            if (d.length > 0 && !selRow) setSelRow(d[0]);
        } catch { /* ignore */ }
        finally { setLoading(false); }
    }, [listUrl, search]);

    useEffect(() => { load(); }, [load]);

    useEffect(() => {
        if (selRow && mode === "view") {
            const f: any = {};
            formFields.forEach((ff2: any) => { f[ff2.k] = t2(selRow[ff2.k]||""); });
            checkFields.forEach((cf: any)  => { f[cf.k]  = !!selRow[cf.k];   });
            if (title === "Warehouses") {
                f.handling_kg = selRow.handling_kg || 0;
                f.grower_uq = selRow.grower_uq || "";
            }
            setForm(f);
        }
    }, [selRow, mode]);

    const openAdd = () => {
        setForm({...emptyForm}); setMode("add");
    };
    const openEdit = () => {
        if (!selRow) return;
        const f: any = {};
        formFields.forEach((ff2: any) => { f[ff2.k] = t2(selRow[ff2.k]||""); });
        checkFields.forEach((cf: any)  => { f[cf.k]  = !!selRow[cf.k];    });
        if (title === "Warehouses") {
            f.handling_kg = selRow.handling_kg || 0;
            f.grower_uq = selRow.grower_uq || "";
        }
        setForm(f); setMode("edit");
    };

    const save = async () => {
        setSaving(true);
        try {
            if (mode === "add") {
                await fetch(detailUrl, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
            } else if (mode === "edit" && selRow) {
                await fetch(`${detailUrl}/${selRow.unico}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
            }
            await load(); setMode("view");
            toast.success("Saved successfully");
        } catch (e: any) { toast.error(e.message); }
        finally { setSaving(false); }
    };

    const del = async () => {
        if (!selRow) return;
        setSaving(true);
        try { 
            await fetch(`${detailUrl}/${selRow.unico}`, { method:"DELETE" }); 
            setSelRow(null); 
            await load(); 
            setMode("view");
            toast.success("Deleted successfully");
        }
        catch (e: any) { toast.error(e.message); }
        finally { setSaving(false); }
    };

    if (mode === "delete") {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
                    <div className="p-6 flex flex-col items-center gap-4 text-center">
                        <Trash2 size={48} className="text-red-500" />
                        <h3 className="text-lg font-bold text-gray-800">Delete Record?</h3>
                        <p className="text-sm text-gray-500">Are you sure you want to delete <strong>{t2(selRow?.[cols[0]?.key])}</strong>? This action cannot be undone.</p>
                    </div>
                    <div className="flex gap-2 p-4 bg-gray-50 rounded-b-xl border-t border-gray-100">
                        <button onClick={() => setMode("view")} className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                        <button onClick={del} disabled={saving} className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-bold text-white flex items-center justify-center gap-2">
                            {saving ? <RefreshCcw size={16} className="animate-spin" /> : <Trash2 size={16} />}
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-full max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                {mode === "view" ? (
                    <div className="flex flex-col h-full overflow-hidden relative">
                        <button onClick={onClose} className="absolute top-2 right-24 z-[100] text-gray-400 hover:text-white p-1 rounded-full"><X size={18}/></button>
                        
                        <PanelGrid
                            title={title}
                            icon={Icon || Building2}
                            recordCount={rows.length}
                            onRefresh={() => load()}
                            refreshing={loading}
                            menuItems={[
                                { label:"Add Record", icon:Plus, color:"green", onClick:openAdd },
                                { label:"Edit Selected", icon:Pencil, color:"blue", onClick:openEdit, disabled:!selRow },
                                { label:"Delete Selected", icon:Trash2, color:"red", onClick:() => setMode("delete"), disabled:!selRow }
                            ]}
                            className="flex flex-col h-full border-0 rounded-none shadow-none"
                        >
                            {/* Toolbar under header */}
                            <div className="px-4 py-2 border-b border-gray-200 bg-gray-50 flex shrink-0">
                                <div className="relative flex-1 max-w-xs">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input type="text" value={search} onChange={e => { setSearch(e.target.value); }} placeholder="Search..."
                                        className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded outline-none focus:ring-1 focus:ring-[#FB7506]" />
                                </div>
                            </div>
                            <div className="h-full overflow-auto">
                                <PanelGridTable>
                                    <PanelGridThead>
                                        {cols.map((c: any) => <PanelGridTh key={c.key}>{c.label}</PanelGridTh>)}
                                    </PanelGridThead>
                                    <PanelGridTbody>
                                        {rows.length === 0 ? (
                                            <PanelGridTr><PanelGridTd colSpan={cols.length} className="p-4 text-center text-gray-300 italic text-xs">No records found.</PanelGridTd></PanelGridTr>
                                        ) : rows.map((r: any, i: number) => (
                                            <PanelGridTr key={r.unico||i} selected={selRow?.unico === r.unico} onClick={() => { if(selRow?.unico === r.unico) setSelRow(null); else setSelRow(r); }}>
                                                {cols.map((c: any) => (
                                                    <PanelGridTd key={c.key}>{c.render ? c.render(r[c.key], r) : t2(r[c.key])}</PanelGridTd>
                                                ))}
                                            </PanelGridTr>
                                        ))}
                                    </PanelGridTbody>
                                </PanelGridTable>
                            </div>
                        </PanelGrid>
                    </div>
                ) : (
                    <div className="flex flex-col h-full">
                        <div className="h-12 bg-[#374151] flex items-center justify-between px-5 shrink-0 border-b border-black/10">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setMode("view")} className="text-gray-400 hover:text-white transition-colors">
                                    <ChevronLeft size={20} />
                                </button>
                                <span className="font-black text-[13px] uppercase tracking-widest text-white">
                                    {mode === "add" ? `New ${title}` : `Edit ${title}: ${t2(selRow?.[cols[0]?.key])}`}
                                </span>
                            </div>
                            <button onClick={() => setMode("view")}><X size={18} className="text-gray-400 hover:text-white" /></button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
                            <div className="max-w-2xl mx-auto space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                                    {formFields.map((f: any) => (
                                        <div key={f.k} className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{f.l}</label>
                                            <input type={f.type||"text"} value={form[f.k]||""}
                                                onChange={e => setForm((p: any) => ({...p, [f.k]: e.target.value}))}
                                                className="fos-input h-10 text-sm" />
                                        </div>
                                    ))}
                                    {title === "Warehouses" && (
                                        <>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Handling KG</label>
                                                <input type="number" value={form.handling_kg||0} onChange={e=>setForm((p:any)=>({...p,handling_kg:parseFloat(e.target.value)||0}))} className="fos-input h-10 text-sm" />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Grower</label>
                                                <select value={form.grower_uq||""} onChange={e=>setForm((p:any)=>({...p,grower_uq:e.target.value}))} className="fos-input h-10 text-sm">
                                                    <option value="">— None —</option>
                                                    {growers.map((g:any) => <option key={g.unico} value={g.unico}>{t2(g.grower)}</option>)}
                                                </select>
                                            </div>
                                        </>
                                    )}
                                </div>
                                {checkFields.length > 0 && (
                                    <div className="flex flex-wrap gap-6 pt-4 border-t border-gray-200">
                                        {checkFields.map((c: any) => (
                                            <label key={c.k} className="flex items-center gap-2.5 cursor-pointer">
                                                <input type="checkbox" checked={!!form[c.k]}
                                                    onChange={e => setForm((p: any) => ({...p, [c.k]: e.target.checked}))}
                                                    className="w-4 h-4 accent-[#FB7506] rounded border-gray-300" />
                                                <span className="text-xs font-bold text-gray-700">{c.l}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 px-6 py-4 bg-white border-t border-gray-200 shrink-0">
                            <button onClick={() => setMode("view")} className="px-6 py-2.5 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                            <button onClick={save} disabled={saving} className="flex items-center gap-2 px-8 py-2.5 rounded-lg text-white text-sm font-black uppercase tracking-wider transition-all disabled:opacity-50 bg-[#FB7506] hover:bg-orange-600 shadow-sm">
                                {saving ? <RefreshCcw size={16} className="animate-spin" /> : <Save size={16} />}
                                {saving ? "Saving..." : mode === "add" ? "Create" : "Save"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function FreightsSetupPage() {
    const { status } = useSession();
    const router = useRouter();
    const qc     = useQueryClient();
    const { logAction } = useAuditLog("freights-setup", "flower_warehouses_physical");
    const perms = usePagePermissions("freights-setup");
    const store = useFreightsStore();

    // Form states
    const [frForm, setFrForm] = useState<any>(EMPTY_FR);
    const [haForm, setHaForm] = useState<any>(EMPTY_HA);
    const [atForm, setAtForm] = useState<any>(EMPTY_AT);
    const [saving, setSaving] = useState(false);

    useEffect(() => { if (status === "unauthenticated") router.push("/login"); }, [status, router]);

    // Queries
    const { data: warehouses = EMPTY_ARR }  = useQuery({ queryKey: ["fr-wh"], queryFn: () => ff("/api/freights/warehouses") });
    const { data: freights = EMPTY_ARR, isFetching: loadingFr, refetch: refetchFr }  = useQuery({ queryKey: ["fr-fr", store.selWh?.unico], queryFn: () => ff(`/api/freights/rates?warehouse=${store.selWh?.unico}`), enabled: !!store.selWh?.unico, retry: false });
    const { data: handling = EMPTY_ARR, isFetching: loadingHa, refetch: refetchHa }  = useQuery({ queryKey: ["fr-ha", store.selWh?.unico], queryFn: () => ff(`/api/freights/handling?warehouse=${store.selWh?.unico}`), enabled: !!store.selWh?.unico, retry: false });
    const { data: atpda = EMPTY_ARR, isFetching: loadingAt, refetch: refetchAt }  = useQuery({ queryKey: ["fr-at", store.selWh?.unico], queryFn: () => ff(`/api/freights/atpda?warehouse=${store.selWh?.unico}`), enabled: !!store.selWh?.unico, retry: false });
    const { data: lookups = {seasons:EMPTY_ARR,cities:EMPTY_ARR,airlines:EMPTY_ARR,growers:EMPTY_ARR} }  = useQuery({ queryKey: ["fr-look"], queryFn: () => ff("/api/freights/lookups"), staleTime: 1000*60*5 });

    // Auto-select warehouse
    useEffect(() => { 
        if ((warehouses as any[]).length > 0 && !store.selWh) store.setSelWh((warehouses as any[])[0]); 
        if (warehouses.length > 0 && store.selWh && !warehouses.find((w:any) => w.unico === store.selWh.unico)) {
            store.setSelWh(warehouses[0]);
        }
    }, [warehouses, store.selWh]);

    const seasons = (lookups?.seasons || []) as any[];
    const cities  = (lookups?.cities  || []) as any[];
    const growers = (lookups?.growers || []) as any[];

    // ── Freight CRUD
    const saveFr = async () => {
        if (!frForm.season_uq) { toast.error("Season is required."); return; }
        if (!frForm.city_uq)   { toast.error("City is required.");   return; }
        if (parseFloat(frForm.freight||0) + parseFloat(frForm.freight_kg||0) <= 0) { toast.error("Freight value required."); return; }
        setSaving(true);
        try {
            const body = { ...frForm, wphysical_uq: store.selWh?.unico };
            if (store.frModal?.mode === "add") {
                const res = await fetch("/api/freights/rates", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
                const d   = await res.json(); if (!d.success) throw new Error(d.error);
                logAction("Insert", d.unico);
            } else if (store.frModal?.mode === "edit") {
                const res = await fetch(`/api/freights/rates/${store.selFr.unico}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
                const d   = await res.json(); if (!d.success) throw new Error(d.error);
                logAction("Edit", store.selFr.unico);
            } else {
                const res = await fetch(`/api/freights/rates/${store.selFr.unico}`, { method:"DELETE" });
                const d   = await res.json(); if (!d.success) throw new Error(d.error);
                logAction("Delete", store.selFr.unico);
                store.setSelFr(null);
            }
            await refetchFr(); store.setFrModal(null);
            toast.success("Saved successfully");
        } catch (e: any) { toast.error(e.message); }
        finally { setSaving(false); }
    };

    // ── Handling CRUD
    const saveHa = async () => {
        if (!haForm.season_uq) { toast.error("Season is required."); return; }
        setSaving(true);
        try {
            const body = { ...haForm, wphysical_uq: store.selWh?.unico };
            if (store.haModal?.mode === "add") {
                const res = await fetch("/api/freights/handling", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
                const d   = await res.json(); if (!d.success) throw new Error(d.error);
                logAction("Insert", d.unico);
            } else if (store.haModal?.mode === "edit") {
                const res = await fetch(`/api/freights/handling/${store.selHa.unico}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
                const d   = await res.json(); if (!d.success) throw new Error(d.error);
                logAction("Edit", store.selHa.unico);
            } else {
                const res = await fetch(`/api/freights/handling/${store.selHa.unico}`, { method:"DELETE" });
                const d   = await res.json(); if (!d.success) throw new Error(d.error);
                logAction("Delete", store.selHa.unico);
                store.setSelHa(null);
            }
            await refetchHa(); store.setHaModal(null);
            toast.success("Saved successfully");
        } catch (e: any) { toast.error(e.message); }
        finally { setSaving(false); }
    };

    // ── ATPDA CRUD
    const saveAt = async () => {
        if (!atForm.season_uq) { toast.error("Season is required."); return; }
        if (!atForm.city_uq)   { toast.error("City is required.");   return; }
        setSaving(true);
        try {
            const body = { ...atForm, wphysical_uq: store.selWh?.unico };
            if (store.atModal?.mode === "add") {
                const res = await fetch("/api/freights/atpda", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
                const d   = await res.json(); if (!d.success) throw new Error(d.error);
                logAction("Insert", d.unico);
            } else if (store.atModal?.mode === "edit") {
                const res = await fetch(`/api/freights/atpda/${store.selAt.unico}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
                const d   = await res.json(); if (!d.success) throw new Error(d.error);
                logAction("Edit", store.selAt.unico);
            } else {
                const res = await fetch(`/api/freights/atpda/${store.selAt.unico}`, { method:"DELETE" });
                const d   = await res.json(); if (!d.success) throw new Error(d.error);
                logAction("Delete", store.selAt.unico);
                store.setSelAt(null);
            }
            await refetchAt(); store.setAtModal(null);
            toast.success("Saved successfully");
        } catch (e: any) { toast.error(e.message); }
        finally { setSaving(false); }
    };

    // ── Copy Freights
    const [copySourceSeason, setCopySourceSeason] = useState("");
    const [copyTargetSeason, setCopyTargetSeason] = useState("");
    const doCopy = async () => {
        if (!copySourceSeason) { toast.error("Source season is required."); return; }
        setSaving(true);
        try {
            const res = await fetch("/api/freights/rates/copy", { method:"POST", headers:{"Content-Type":"application/json"},
                body:JSON.stringify({ wphysical_uq: store.selWh?.unico, season_uq_from: copySourceSeason, season_uq_to: copyTargetSeason }) });
            const d = await res.json(); if (!d.success) throw new Error(d.error);
            logAction("Insert", store.selWh?.unico || "", "Copy Freight Rates");
            await refetchFr(); store.setCopyModal(false); setCopySourceSeason(""); setCopyTargetSeason("");
            toast.success("Rates copied successfully");
        } catch (e: any) { toast.error(e.message); }
        finally { setSaving(false); }
    };

    const updateAwbs = async () => {
        if (!store.selFr) { toast.error("Select a freight rate first."); return; }
        
        toast("Are you sure you want to update AWB Freight Rates?", {
            duration: 10000,
            action: {
                label: "Confirm",
                onClick: async () => {
                    setSaving(true);
                    try {
                        const res = await fetch(`/api/freights/rates/${store.selFr!.unico}/update-awb`, { method:"PUT" });
                        const d = await res.json(); if (!d.success) throw new Error(d.error);
                        logAction("Edit", store.selFr!.unico, "Update AWB Freight Rates");
                        toast.success("AWBs updated");
                    } catch (e: any) { toast.error(e.message); }
                    finally { setSaving(false); }
                }
            },
            cancel: { label: "Cancel", onClick: () => {} }
        });
    };

    if (status === "loading") return null;

    return (
        <div className="flex flex-col h-[100dvh] bg-[#f4f6f8] overflow-hidden font-sans text-[#333]">

            <AppHeader title="Freights" />

            {/* Top Toolbar */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-6 shrink-0 shadow-sm flex-wrap">
                <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider"><Building2 size={14} className="inline mr-1 text-[#FB7506]" /> Warehouse:</label>
                    <select 
                        value={store.selWh?.unico || ""} 
                        onChange={(e) => {
                            const wh = warehouses.find((w: any) => w.unico === e.target.value);
                            store.setSelWh(wh || null);
                            store.setSelFr(null);
                            store.setSelHa(null);
                            store.setSelAt(null);
                        }}
                        className="border border-gray-300 rounded px-3 py-1.5 text-sm font-semibold outline-none focus:ring-1 focus:ring-[#FB7506] shadow-sm bg-gray-50 min-w-[200px]"
                    >
                        {warehouses.map((w: any) => (
                            <option key={w.unico} value={w.unico}>{w.wp_name}</option>
                        ))}
                    </select>
                </div>
                
                <div className="flex items-center gap-2 border-l border-gray-200 pl-6">
                    <button onClick={() => store.setWarehousesModal(true)} className="px-4 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 rounded text-xs font-bold text-gray-700 transition-colors shadow-sm flex items-center gap-1.5"><Building2 size={13} className="text-gray-400" /> Warehouses</button>
                    <button onClick={() => store.setCitiesModal(true)} className="px-4 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 rounded text-xs font-bold text-gray-700 transition-colors shadow-sm flex items-center gap-1.5"><MapPin size={13} className="text-gray-400" /> Cities</button>
                    <button onClick={() => store.setAirlinesModal(true)} className="px-4 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 rounded text-xs font-bold text-gray-700 transition-colors shadow-sm flex items-center gap-1.5"><Cloud size={13} className="text-gray-400" /> Airlines</button>
                    <button onClick={() => store.setSeasonsModal(true)} className="px-4 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 rounded text-xs font-bold text-gray-700 transition-colors shadow-sm flex items-center gap-1.5"><Zap size={13} className="text-gray-400" /> Seasons</button>
                </div>
            </div>

            {/* Main Grids Layout */}
            <div className="flex-1 p-2 overflow-y-auto lg:overflow-hidden flex flex-col lg:grid lg:grid-cols-3 gap-2 md:pb-2 pb-20">
                
                {/* ─── FREIGHTS ───────────────────────────────────────────────────────────── */}
                <PanelGrid
                    title={`Freights${store.selWh ? ` — ${t(store.selWh.wp_name)}` : ""}`}
                    icon={Cloud}
                    recordCount={freights.length}
                    onRefresh={() => refetchFr()}
                    refreshing={loadingFr}
                    menuItems={[
                        { label:"Add Rate",      icon:Plus,   color:"green", onClick:() => { if(!store.selWh){toast.error("Select a warehouse first.");return;} setFrForm({...EMPTY_FR}); store.setFrModal({mode:"add"}); }, disabled:!store.selWh || !perms.canCreate },
                        { label:"Edit Selected", icon:Pencil, color:"blue",  onClick:async() => { if(!store.selFr) return; try { const d = await ff(`/api/freights/rates/${store.selFr.unico}`); setFrForm({ wphysical_uq: d.wphysical_uq||store.selWh?.unico, season_uq: d.season_uq||"", city_uq: d.city_uq||"", freight: d.freight||0, freight_kg: d.freight_kg||0 }); store.setFrModal({mode:"edit"}); } catch(e:any){toast.error(e.message);} }, disabled:!store.selFr || !perms.canEdit },
                        { label:"Delete Selected",icon:Trash2, color:"red",  onClick:() => { if(store.selFr){store.setFrModal({mode:"delete"});} }, disabled:!store.selFr || !perms.canDelete },
                        { label:"Copy From...",  icon:Copy,   color:"gray",  onClick:() => { if(!store.selWh){toast.error("Select a warehouse first.");return;} store.setCopyModal(true); }, disabled:!store.selWh },
                        { label:"Update AWBs",   icon:Zap,    color:"orange", onClick:updateAwbs, disabled:!store.selFr },
                    ]}
                    className="flex flex-col min-h-[300px] lg:min-h-0"
                >
                    <div className="h-full overflow-auto">
                        <PanelGridTable>
                            <PanelGridThead>
                                <PanelGridTh>Season</PanelGridTh>
                                <PanelGridTh>City</PanelGridTh>
                                <PanelGridTh className="text-right">FreightFB</PanelGridTh>
                                <PanelGridTh className="text-right">FreightKG</PanelGridTh>
                            </PanelGridThead>
                            <PanelGridTbody>
                                {freights.length === 0 ? (
                                    <PanelGridTr><PanelGridTd colSpan={4} className="p-4 text-center text-gray-300 italic text-xs">{store.selWh ? "No freight rates" : "Select a warehouse"}</PanelGridTd></PanelGridTr>
                                ) : freights.map((r: any) => (
                                    <PanelGridTr key={r.unico} selected={store.selFr?.unico === r.unico} onClick={() => { if(store.selFr?.unico === r.unico) store.setSelFr(null); else { store.setSelFr(r); store.setSelHa(null); store.setSelAt(null); } }}>
                                        <PanelGridTd>{t(r.season)}</PanelGridTd>
                                        <PanelGridTd>{t(r.city)}</PanelGridTd>
                                        <PanelGridTd className="text-right">{parseFloat(r.freight||0).toFixed(4)}</PanelGridTd>
                                        <PanelGridTd className="text-right">{parseFloat(r.freight_kg||0).toFixed(2)}</PanelGridTd>
                                    </PanelGridTr>
                                ))}
                            </PanelGridTbody>
                        </PanelGridTable>
                    </div>
                </PanelGrid>

                {/* ─── HANDLING ───────────────────────────────────────────────────────────── */}
                <PanelGrid
                    title="Handling"
                    icon={Building2}
                    recordCount={handling.length}
                    onRefresh={() => refetchHa()}
                    refreshing={loadingHa}
                    menuItems={[
                        { label:"Add Rate",      icon:Plus,   color:"green", onClick:() => { if(!store.selWh){toast.error("Select a warehouse first.");return;} setHaForm({...EMPTY_HA}); store.setHaModal({mode:"add"}); }, disabled:!store.selWh || !perms.canCreate },
                        { label:"Edit Selected", icon:Pencil, color:"blue",  onClick:async() => { if(!store.selHa) return; try { const d = await ff(`/api/freights/handling/${store.selHa.unico}`); setHaForm({ wphysical_uq: d.wphysical_uq||store.selWh?.unico, season_uq: d.season_uq||"", handling: d.handling||0 }); store.setHaModal({mode:"edit"}); } catch(e:any){toast.error(e.message);} }, disabled:!store.selHa || !perms.canEdit },
                        { label:"Delete Selected",icon:Trash2, color:"red", onClick:() => { if(store.selHa){store.setHaModal({mode:"delete"});} }, disabled:!store.selHa || !perms.canDelete },
                    ]}
                    className="flex flex-col min-h-[300px] lg:min-h-0"
                >
                    <div className="h-full overflow-auto">
                        <PanelGridTable>
                            <PanelGridThead>
                                <PanelGridTh>Season</PanelGridTh>
                                <PanelGridTh className="text-right">HandlingFB</PanelGridTh>
                            </PanelGridThead>
                            <PanelGridTbody>
                                {handling.length === 0 ? (
                                    <PanelGridTr><PanelGridTd colSpan={2} className="p-4 text-center text-gray-300 italic text-xs">{store.selWh ? "No handling rates" : "Select a warehouse"}</PanelGridTd></PanelGridTr>
                                ) : handling.map((r: any) => (
                                    <PanelGridTr key={r.unico} selected={store.selHa?.unico === r.unico} onClick={() => { if(store.selHa?.unico === r.unico) store.setSelHa(null); else { store.setSelHa(r); store.setSelFr(null); store.setSelAt(null); } }}>
                                        <PanelGridTd>{t(r.season)}</PanelGridTd>
                                        <PanelGridTd className="text-right">{parseFloat(r.handling||0).toFixed(4)}</PanelGridTd>
                                    </PanelGridTr>
                                ))}
                            </PanelGridTbody>
                        </PanelGridTable>
                    </div>
                </PanelGrid>

                {/* ─── ATPDA ───────────────────────────────────────────────────────────── */}
                <PanelGrid
                    title="ATPDA"
                    icon={MapPin}
                    recordCount={atpda.length}
                    onRefresh={() => refetchAt()}
                    refreshing={loadingAt}
                    menuItems={[
                        { label:"Add Tariff",    icon:Plus,   color:"green", onClick:() => { if(!store.selWh){toast.error("Select a warehouse first.");return;} setAtForm({...EMPTY_AT}); store.setAtModal({mode:"add"}); }, disabled:!store.selWh || !perms.canCreate },
                        { label:"Edit Selected", icon:Pencil, color:"blue",  onClick:async() => { if(!store.selAt) return; try { const d = await ff(`/api/freights/atpda/${store.selAt.unico}`); setAtForm({ wphysical_uq: d.wphysical_uq||store.selWh?.unico, season_uq: d.season_uq||"", city_uq: d.city_uq||"", tariff: d.tariff||0 }); store.setAtModal({mode:"edit"}); } catch(e:any){toast.error(e.message);} }, disabled:!store.selAt || !perms.canEdit },
                        { label:"Delete Selected",icon:Trash2, color:"red", onClick:() => { if(store.selAt){store.setAtModal({mode:"delete"});} }, disabled:!store.selAt || !perms.canDelete },
                    ]}
                    className="flex flex-col min-h-[300px] lg:min-h-0"
                >
                    <div className="h-full overflow-auto">
                        <PanelGridTable>
                            <PanelGridThead>
                                <PanelGridTh>Season</PanelGridTh>
                                <PanelGridTh>City</PanelGridTh>
                                <PanelGridTh className="text-right">Tariff%</PanelGridTh>
                            </PanelGridThead>
                            <PanelGridTbody>
                                {atpda.length === 0 ? (
                                    <PanelGridTr><PanelGridTd colSpan={3} className="p-4 text-center text-gray-300 italic text-xs">{store.selWh ? "No ATPDA tariffs" : "Select a warehouse"}</PanelGridTd></PanelGridTr>
                                ) : atpda.map((r: any) => (
                                    <PanelGridTr key={r.unico} selected={store.selAt?.unico === r.unico} onClick={() => { if(store.selAt?.unico === r.unico) store.setSelAt(null); else { store.setSelAt(r); store.setSelFr(null); store.setSelHa(null); } }}>
                                        <PanelGridTd>{t(r.season)}</PanelGridTd>
                                        <PanelGridTd>{t(r.city)}</PanelGridTd>
                                        <PanelGridTd className="text-right">{parseFloat(r.tariff||0).toFixed(2)}%</PanelGridTd>
                                    </PanelGridTr>
                                ))}
                            </PanelGridTbody>
                        </PanelGridTable>
                    </div>
                </PanelGrid>
            </div>

            <AppFooter areaLabel="Masters" />

            {/* ─── Mobile Action Bar (Bottom) ────────────────────────────────────────────── */}
            <div className={cn(
                "md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-in-out pb-4 pt-2 px-2",
                (store.selFr || store.selHa || store.selAt) ? "translate-y-0" : "translate-y-full"
            )}>
                <div className="flex justify-around items-center max-w-sm mx-auto">
                    <button onClick={() => { 
                        if (store.selFr) {
                            ff(`/api/freights/rates/${store.selFr.unico}`).then(d => {
                                setFrForm({ wphysical_uq: d.wphysical_uq||store.selWh?.unico, season_uq: d.season_uq||"", city_uq: d.city_uq||"", freight: d.freight||0, freight_kg: d.freight_kg||0 });
                                store.setFrModal({mode:"edit"});
                            }).catch(e => toast.error(e.message));
                        } else if (store.selHa) {
                            ff(`/api/freights/handling/${store.selHa.unico}`).then(d => {
                                setHaForm({ wphysical_uq: d.wphysical_uq||store.selWh?.unico, season_uq: d.season_uq||"", handling: d.handling||0 });
                                store.setHaModal({mode:"edit"});
                            }).catch(e => toast.error(e.message));
                        } else if (store.selAt) {
                            ff(`/api/freights/atpda/${store.selAt.unico}`).then(d => {
                                setAtForm({ wphysical_uq: d.wphysical_uq||store.selWh?.unico, season_uq: d.season_uq||"", city_uq: d.city_uq||"", tariff: d.tariff||0 });
                                store.setAtModal({mode:"edit"});
                            }).catch(e => toast.error(e.message));
                        }
                    }} disabled={!perms.canEdit}
                        className="flex flex-col items-center gap-1 text-gray-600 disabled:opacity-50 transition-colors hover:text-[#FB7506] min-w-[56px] shrink-0">
                        <Pencil size={20} className={perms.canEdit ? "text-[#FB7506]" : "text-gray-400"} />
                        <span className="text-[9px] font-black uppercase tracking-wider">Edit</span>
                    </button>
                    
                    {store.selFr && (
                        <button onClick={updateAwbs} disabled={!perms.canEdit}
                            className="flex flex-col items-center gap-1 text-gray-600 transition-colors hover:text-amber-500 min-w-[56px] shrink-0">
                            <Zap size={20} className="text-amber-500" />
                            <span className="text-[9px] font-black uppercase tracking-wider">Update AWBs</span>
                        </button>
                    )}

                    <button onClick={() => {
                        if (store.selFr) store.setFrModal({mode:"delete"});
                        else if (store.selHa) store.setHaModal({mode:"delete"});
                        else if (store.selAt) store.setAtModal({mode:"delete"});
                    }} disabled={!perms.canDelete}
                        className="flex flex-col items-center gap-1 text-gray-600 disabled:opacity-50 transition-colors hover:text-red-500 min-w-[56px] shrink-0">
                        <Trash2 size={20} className={perms.canDelete ? "text-red-500" : "text-gray-400"} />
                        <span className="text-[9px] font-black uppercase tracking-wider">Delete</span>
                    </button>
                    
                    <div className="w-[1px] h-8 bg-gray-200 mx-1"></div>
                    
                    <button onClick={() => { store.setSelFr(null); store.setSelHa(null); store.setSelAt(null); }}
                        className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-800 transition-colors min-w-[56px] shrink-0 pr-2">
                        <X size={20} />
                        <span className="text-[9px] font-black uppercase tracking-wider">Close</span>
                    </button>
                </div>
            </div>

            {/* ─── Modals ───────────────────────────────────────────────────────────── */}
            {store.frModal && (
                <SimpleModal title={`${store.frModal.mode === "add" ? "Add" : store.frModal.mode === "edit" ? "Edit" : "Delete"} Freight Rate`} icon={Cloud}
                    onSave={saveFr} onClose={() => { store.setFrModal(null); }} saving={saving}
                    isDelete={store.frModal.mode === "delete"} deleteMsg={`Delete freight rate for ${t(store.selFr?.season)} / ${t(store.selFr?.city)}?`}>
                    {store.frModal.mode !== "delete" && (
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="flex flex-col gap-0.5 col-span-2">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Season *</label>
                                <select value={frForm.season_uq} onChange={e=>setFrForm((p:any)=>({...p,season_uq:e.target.value}))} className="fos-input h-10 text-sm">
                                    <option value="">— Select Season —</option>
                                    {seasons.map((s:any) => <option key={s.unico} value={s.unico}>{t(s.season)}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-0.5 col-span-2">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">City *</label>
                                <select value={frForm.city_uq} onChange={e=>setFrForm((p:any)=>({...p,city_uq:e.target.value}))} className="fos-input h-10 text-sm">
                                    <option value="">— Select City —</option>
                                    {cities.map((c:any) => <option key={c.unico} value={c.unico}>{t(c.city)}</option>)}
                                </select>
                            </div>
                            <FField label="Freight FB" value={String(frForm.freight)} type="number" onChange={(v:string)=>setFrForm((p:any)=>({...p,freight:parseFloat(v)||0}))} />
                            <FField label="Freight KG" value={String(frForm.freight_kg)} type="number" onChange={(v:string)=>setFrForm((p:any)=>({...p,freight_kg:parseFloat(v)||0}))} />
                        </div>
                    )}
                </SimpleModal>
            )}

            {store.haModal && (
                <SimpleModal title={`${store.haModal.mode === "add" ? "Add" : store.haModal.mode === "edit" ? "Edit" : "Delete"} Handling Rate`} icon={Building2}
                    onSave={saveHa} onClose={() => { store.setHaModal(null); }} saving={saving}
                    isDelete={store.haModal.mode === "delete"} deleteMsg={`Delete handling rate for ${t(store.selHa?.season)}?`}>
                    {store.haModal.mode !== "delete" && (
                        <div className="grid grid-cols-1 gap-3 text-xs">
                            <div className="flex flex-col gap-0.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Season *</label>
                                <select value={haForm.season_uq} onChange={e=>setHaForm((p:any)=>({...p,season_uq:e.target.value}))} className="fos-input h-10 text-sm">
                                    <option value="">— Select Season —</option>
                                    {seasons.map((s:any) => <option key={s.unico} value={s.unico}>{t(s.season)}</option>)}
                                </select>
                            </div>
                            <FField label="Handling FB" value={String(haForm.handling)} type="number" onChange={(v:string)=>setHaForm((p:any)=>({...p,handling:parseFloat(v)||0}))} />
                        </div>
                    )}
                </SimpleModal>
            )}

            {store.atModal && (
                <SimpleModal title={`${store.atModal.mode === "add" ? "Add" : store.atModal.mode === "edit" ? "Edit" : "Delete"} ATPDA Tariff`} icon={MapPin}
                    onSave={saveAt} onClose={() => { store.setAtModal(null); }} saving={saving}
                    isDelete={store.atModal.mode === "delete"} deleteMsg={`Delete ATPDA tariff for ${t(store.selAt?.season)} / ${t(store.selAt?.city)}?`}>
                    {store.atModal.mode !== "delete" && (
                        <div className="grid grid-cols-1 gap-3 text-xs">
                            <div className="flex flex-col gap-0.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Season *</label>
                                <select value={atForm.season_uq} onChange={e=>setAtForm((p:any)=>({...p,season_uq:e.target.value}))} className="fos-input h-10 text-sm">
                                    <option value="">— Select Season —</option>
                                    {seasons.map((s:any) => <option key={s.unico} value={s.unico}>{t(s.season)}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">City *</label>
                                <select value={atForm.city_uq} onChange={e=>setAtForm((p:any)=>({...p,city_uq:e.target.value}))} className="fos-input h-10 text-sm">
                                    <option value="">— Select City —</option>
                                    {cities.map((c:any) => <option key={c.unico} value={c.unico}>{t(c.city)}</option>)}
                                </select>
                            </div>
                            <FField label="Tariff %" value={String(atForm.tariff)} type="number" onChange={(v:string)=>setAtForm((p:any)=>({...p,tariff:parseFloat(v)||0}))} />
                        </div>
                    )}
                </SimpleModal>
            )}

            {store.copyModal && (
                <SimpleModal title="Copy Freight Rates" icon={Copy} onSave={doCopy} onClose={() => store.setCopyModal(false)} saving={saving}>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="bg-blue-50 text-blue-800 p-3 rounded-lg border border-blue-100 text-xs">
                            This will copy all freight rates from the source season to the target season for warehouse <strong>{t(store.selWh?.wp_name)}</strong>.
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-600">Source Season (Copy From)</label>
                            <select value={copySourceSeason} onChange={e=>setCopySourceSeason(e.target.value)} className="fos-input py-2">
                                <option value="">— Select Season —</option>
                                {seasons.map((s:any) => <option key={s.unico} value={s.unico}>{t(s.season)}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-600">Target Season (Copy To)</label>
                            <select value={copyTargetSeason} onChange={e=>setCopyTargetSeason(e.target.value)} className="fos-input py-2">
                                <option value="">— Select Season —</option>
                                {seasons.map((s:any) => <option key={s.unico} value={s.unico}>{t(s.season)}</option>)}
                            </select>
                        </div>
                    </div>
                </SimpleModal>
            )}

            {/* Aux Modals */}
            {store.warehousesModal && (
                <SetupModal title="Warehouses" onClose={() => store.setWarehousesModal(false)}
                    listUrl="/api/freights/warehouses" detailUrl="/api/freights/warehouse" emptyForm={EMPTY_WH}
                    cols={[{ key:"wp_name", label:"Warehouse" }, { key:"city", label:"City" }, { key:"state", label:"State" }, { key:"country", label:"Country" }, { key:"phone", label:"Phone" }]}
                    formFields={[
                        { k:"wp_name", l:"Warehouse Name", type:"text" },
                        { k:"address", l:"Address", type:"text" },
                        { k:"city", l:"City", type:"text" },
                        { k:"state", l:"State", type:"text" },
                        { k:"zipcode", l:"Zip", type:"text" },
                        { k:"country", l:"Country", type:"text" },
                        { k:"phone", l:"Phone", type:"text" },
                        { k:"fax", l:"Fax", type:"text" },
                        { k:"email", l:"Email", type:"text" }
                    ]}
                    checkFields={[
                        { k:"cargo", l:"Cargo" },
                        { k:"send_xml", l:"Send XML" },
                        { k:"charge", l:"Charge" },
                        { k:"send_to_whouse", l:"Send to Whouse" }
                    ]}
                    growers={growers}
                />
            )}

            {store.citiesModal && (
                <SetupModal title="Cities" onClose={() => store.setCitiesModal(false)}
                    listUrl="/api/freights/cities" detailUrl="/api/freights/cities" emptyForm={EMPTY_CI}
                    cols={[{ key:"city", label:"City" }, { key:"country_iso", label:"Country ISO" }, { key:"buyer_email", label:"Buyer Email" }]}
                    formFields={[
                        { k:"city", l:"City", type:"text" },
                        { k:"country_iso", l:"Country ISO", type:"text" },
                        { k:"buyer_email", l:"Buyer Email", type:"email" }
                    ]}
                    checkFields={[]}
                />
            )}

            {store.airlinesModal && (
                <SetupModal title="Airlines" onClose={() => store.setAirlinesModal(false)}
                    listUrl="/api/freights/airlines" detailUrl="/api/freights/airlines" emptyForm={EMPTY_AL}
                    cols={[{ key:"airline", label:"Airline" }, { key:"cod_linea", label:"Code" }, { key:"city", label:"City" }, { key:"phone", label:"Phone" }, { key:"email", label:"Email" }]}
                    formFields={[
                        { k:"airline", l:"Airline Name", type:"text" },
                        { k:"cod_linea", l:"Line Code", type:"text" },
                        { k:"address", l:"Address", type:"text" },
                        { k:"city", l:"City", type:"text" },
                        { k:"country", l:"Country", type:"text" },
                        { k:"phone", l:"Phone", type:"text" },
                        { k:"fax", l:"Fax", type:"text" },
                        { k:"email", l:"Email", type:"email" },
                        { k:"contact", l:"Contact", type:"text" }
                    ]}
                    checkFields={[]}
                />
            )}

            {store.seasonsModal && (
                <SetupModal title="Seasons" onClose={() => store.setSeasonsModal(false)}
                    listUrl="/api/freights/seasons" detailUrl="/api/freights/seasons" emptyForm={EMPTY_SE}
                    cols={[{ key:"season", label:"Season" }, { key:"sh_season", label:"Short Name" }, { key:"startdate", label:"Start Date", render: (v:any)=>v?.split('T')[0]||'' }, { key:"enddate", label:"End Date", render: (v:any)=>v?.split('T')[0]||'' }]}
                    formFields={[
                        { k:"season", l:"Season Name", type:"text" },
                        { k:"sh_season", l:"Short Name", type:"text" },
                        { k:"startdate", l:"Start Date", type:"date" },
                        { k:"enddate", l:"End Date", type:"date" },
                        { k:"activedate", l:"Active Date", type:"date" },
                        { k:"desacdate", l:"Desac Date", type:"date" },
                        { k:"increment", l:"Increment", type:"number" }
                    ]}
                    checkFields={[
                        { k:"publicate", l:"Publicate" },
                        { k:"bypercent", l:"By Percent" }
                    ]}
                />
            )}

        </div>
    );
}
