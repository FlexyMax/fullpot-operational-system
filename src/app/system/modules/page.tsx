"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    ArrowLeft, Plus, Pencil, Trash2, Save, X, RefreshCcw,
    Download, Upload, LayoutGrid, Monitor, FileText,
    Check, AlertCircle, ChevronRight, Search, XCircle, Menu
} from "lucide-react";
import { useAuditLog } from "@/lib/audit";
import { AuditLogModal } from "@/components/AuditLogModal";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
const CLASSES   = ["Empresas", "Sistema", "Otros"];
const t         = (v: any) => String(v ?? "").trim();
const sysFetch  = async (url: string) => { const r = await fetch(url); const j = await r.json(); if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`); return j; };

type ModForm = { unico: string; nombre: string; clase: string; orden: string; image: string; descripcion: string; dsn: string; active: boolean; web: boolean; };
type ScreenForm = { unico: string; modulo_uq: string; nombre: string; orden: string; run_pantalla: string; executable: string; image: string; path: string; menu: boolean; web_form: string; descripcion: string; };
type ReportForm = { unico: string; panta_uq: string; nombre: string; titulo: string; path: string; descripcion: string; fecha_desde: boolean; fecha_hasta: boolean; numero_desde: boolean; numero_hasta: boolean; actual: boolean; comprimido: boolean; detallado: boolean; exportar: boolean; };

const EMPTY_MOD:    ModForm    = { unico: "", nombre: "", clase: "", orden: "0", image: "", descripcion: "", dsn: "", active: true, web: true };
const EMPTY_SCREEN: ScreenForm = { unico: "", modulo_uq: "", nombre: "", orden: "0", run_pantalla: "", executable: "", image: "", path: "", menu: true, web_form: "", descripcion: "" };
const EMPTY_REPORT: ReportForm = { unico: "", panta_uq: "", nombre: "", titulo: "", path: "", descripcion: "", fecha_desde: false, fecha_hasta: false, numero_desde: false, numero_hasta: false, actual: true, comprimido: false, detallado: false, exportar: false };

// ─── GridMenu (Appsmith style) ────────────────────────────────────────────────
function GridMenu({ items, disabled: globalDisabled }: {
    items: { label: string; icon: any; color: string; onClick: () => void; disabled?: boolean }[];
    disabled?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const ITEM_COLORS: Record<string, { icon: string; text: string }> = {
        green:  { icon: "text-green-600",  text: "text-green-700" },
        orange: { icon: "text-[#FB7506]", text: "text-gray-800" },
        red:    { icon: "text-red-500",    text: "text-gray-800" },
        blue:   { icon: "text-blue-600",   text: "text-gray-800" },
        gray:   { icon: "text-gray-500",   text: "text-gray-700" },
    };
    return (
        <div className="relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setOpen(o => !o)}
                className="h-10 bg-[#FB7506] hover:bg-orange-600 text-white w-24 flex items-center justify-center transition-colors border-none cursor-pointer shadow-inner rounded-tr-lg"
                title="Menu">
                <Menu size={20} />
            </button>
            {open && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-2xl z-50 overflow-hidden"
                    onMouseLeave={() => setOpen(false)}>
                    {items.map((item, i) => {
                        const c = ITEM_COLORS[item.color] || ITEM_COLORS.gray;
                        return (
                            <button key={i} onClick={() => { item.onClick(); setOpen(false); }}
                                disabled={!!item.disabled || !!globalDisabled}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors",
                                    i < items.length - 1 && "border-b border-gray-100"
                                )}>
                                <item.icon size={18} className={c.icon} />
                                <span className={cn("text-sm font-bold", c.text)}>{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ModuleScreenSetupPage() {
    const { data: session, status } = useSession();
    const router  = useRouter();
    const qc      = useQueryClient();
    const { logAction } = useAuditLog("module-screen-setup", "modulo");
    const importRef = useRef<HTMLInputElement>(null);

    const [selModUnico,    setSelModUnico]    = useState<string | null>(null);
    const [selScrUnico,    setSelScrUnico]    = useState<string | null>(null);
    const [modMode,        setModMode]        = useState<"view"|"add"|"edit">("view");
    const [modForm,        setModForm]        = useState<ModForm>(EMPTY_MOD);
    const [modError,       setModError]       = useState<string | null>(null);
    const [modMsg,         setModMsg]         = useState<string | null>(null);
    const [saving,         setSaving]         = useState(false);
    const [deleteModDlg,   setDeleteModDlg]   = useState(false);
    const [screenModal,    setScreenModal]    = useState<{ mode: "add"|"edit" } | null>(null);
    const [screenForm,     setScreenForm]     = useState<ScreenForm>(EMPTY_SCREEN);
    const [screenError,    setScreenError]    = useState<string | null>(null);
    const [savingScreen,   setSavingScreen]   = useState(false);
    const [deleteScrDlg,   setDeleteScrDlg]   = useState(false);
    const [reportModal,    setReportModal]    = useState<{ mode: "add"|"edit" } | null>(null);
    const [reportForm,     setReportForm]     = useState<ReportForm>(EMPTY_REPORT);
    const [reportError,    setReportError]    = useState<string | null>(null);
    const [savingReport,   setSavingReport]   = useState(false);
    const [deleteRptDlg,   setDeleteRptDlg]   = useState(false);
    const [modSearch,      setModSearch]      = useState("");
    const [importMsg,      setImportMsg]      = useState<string | null>(null);
    const [mobileModOpen,  setMobileModOpen]  = useState(false);

    useEffect(() => { if (status === "unauthenticated") router.push("/login"); }, [status, router]);

    // ── Queries ───────────────────────────────────────────────────────────────
    const { data: modules = [], isFetching: loadingMods } = useQuery({ queryKey: ["sys-mods"], queryFn: () => sysFetch("/api/system/modules") });
    const { data: screens = [], isFetching: loadingScr, refetch: refetchScr } = useQuery({ queryKey: ["sys-scr", selModUnico], queryFn: () => sysFetch(`/api/system/modules/${selModUnico}/screens`), enabled: !!selModUnico, retry: false });
    const { data: reports = [], isFetching: loadingRpt, refetch: refetchRpt } = useQuery({ queryKey: ["sys-rpt", selScrUnico], queryFn: () => sysFetch(`/api/system/screens/${selScrUnico}/reports`), enabled: !!selScrUnico && !!screenModal, retry: false });

    // ── Module selection ──────────────────────────────────────────────────────
    const selectModule = (m: any) => {
        if (modMode !== "view") return;
        setSelModUnico(m.unico);
        setSelScrUnico(null);
        setModForm({ unico: t(m.unico), nombre: t(m.nombre), clase: t(m.clase), orden: String(m.orden ?? 0), image: t(m.image), descripcion: t(m.descripcion), dsn: t(m.dsn), active: Boolean(m.active), web: Boolean(m.web) });
        setModError(null);
    };

    useEffect(() => {
        if ((modules as any[]).length > 0 && !selModUnico) selectModule((modules as any[])[0]);
    }, [modules]);

    // Auto-select first screen when screens load for selected module
    useEffect(() => {
        if ((screens as any[]).length > 0) setSelScrUnico((screens as any[])[0].unico);
        else setSelScrUnico(null);
    }, [screens]);

    // ── Module CRUD ───────────────────────────────────────────────────────────
    const validateMod = () => {
        if (!modForm.nombre.trim()) return "Module name is required.";
        if (!modForm.clase.trim())  return "Class is required.";
        if (!modForm.image.trim())  return "Icon image is required.";
        return null;
    };

    const saveMod = async () => {
        const err = validateMod(); if (err) { setModError(err); return; }
        setSaving(true); setModError(null);
        try {
            let unico = selModUnico;
            if (modMode === "add") {
                const res  = await fetch("/api/system/modules", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(modForm) });
                const data = await res.json(); if (!data.success) throw new Error(data.error); unico = data.unico;
            } else {
                const res  = await fetch(`/api/system/modules/${unico}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(modForm) });
                const data = await res.json(); if (!data.success) throw new Error(data.error);
            }
            logAction(modMode === "add" ? "Insert" : "Edit", unico!);
            await qc.invalidateQueries({ queryKey: ["sys-mods"] });
            setSelModUnico(unico); setModMode("view");
            setModMsg(modMode === "add" ? "Module created." : "Module updated.");
            setTimeout(() => setModMsg(null), 3000);
        } catch (e: any) { setModError(e.message); }
        finally { setSaving(false); }
    };

    const deleteMod = async () => {
        if (!selModUnico) return;
        setSaving(true);
        try {
            const res  = await fetch(`/api/system/modules/${selModUnico}`, { method: "DELETE" });
            const data = await res.json(); if (!data.success) throw new Error(data.error);
            logAction("Delete", selModUnico!);
            await qc.invalidateQueries({ queryKey: ["sys-mods"] });
            setSelModUnico(null); setModForm(EMPTY_MOD); setDeleteModDlg(false);
        } catch (e: any) { setModError(e.message); setDeleteModDlg(false); }
        finally { setSaving(false); }
    };

    // ── Screen CRUD ───────────────────────────────────────────────────────────
    const validateScreen = () => {
        if (!screenForm.nombre?.trim()) return "Screen title is required.";
        if (!selModUnico) return "Module is required.";
        const hasWebForm = screenForm.web_form.trim();
        if (!hasWebForm && !screenForm.run_pantalla.trim()) return "Screen component or route is required.";
        if (!hasWebForm && !screenForm.executable.trim()) return "Program/module folder is required.";
        return null;
    };

    const saveScreen = async () => {
        const err = validateScreen(); if (err) { setScreenError(err); return; }
        setSavingScreen(true); setScreenError(null);
        try {
            const body = { ...screenForm, modulo_uq: selModUnico };
            if (screenModal?.mode === "add") {
                const res  = await fetch("/api/system/screens", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
                const data = await res.json(); if (!data.success) throw new Error(data.error);
            } else {
                const res  = await fetch(`/api/system/screens/${screenForm.unico}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
                const data = await res.json(); if (!data.success) throw new Error(data.error);
            }
            await refetchScr(); setScreenModal(null);
        } catch (e: any) { setScreenError(e.message); }
        finally { setSavingScreen(false); }
    };

    const deleteScreen = async () => {
        if (!selScrUnico) return;
        setSavingScreen(true);
        try {
            const res  = await fetch(`/api/system/screens/${selScrUnico}`, { method: "DELETE" });
            const data = await res.json(); if (!data.success) throw new Error(data.error);
            await refetchScr(); setSelScrUnico(null); setDeleteScrDlg(false);
        } catch (e: any) { setScreenError(e.message); setDeleteScrDlg(false); }
        finally { setSavingScreen(false); }
    };

    // ── Report CRUD ───────────────────────────────────────────────────────────
    const saveReport = async () => {
        if (!reportForm.nombre.trim()) { setReportError("Report name is required."); return; }
        setSavingReport(true); setReportError(null);
        try {
            const body = { ...reportForm, panta_uq: selScrUnico };
            if (reportModal?.mode === "add") {
                const res  = await fetch("/api/system/reports", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
                const data = await res.json(); if (!data.success) throw new Error(data.error);
            } else {
                const res  = await fetch(`/api/system/reports/${reportForm.unico}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
                const data = await res.json(); if (!data.success) throw new Error(data.error);
            }
            await refetchRpt(); setReportModal(null);
        } catch (e: any) { setReportError(e.message); }
        finally { setSavingReport(false); }
    };

    const deleteReport = async () => {
        setSavingReport(true);
        try {
            const res  = await fetch(`/api/system/reports/${reportForm.unico}`, { method: "DELETE" });
            const data = await res.json(); if (!data.success) throw new Error(data.error);
            await refetchRpt(); setDeleteRptDlg(false); setReportModal(null);
        } catch (e: any) { setReportError(e.message); setDeleteRptDlg(false); }
        finally { setSavingReport(false); }
    };

    // ── Export ────────────────────────────────────────────────────────────────
    const exportAll = async () => {
        const data = await sysFetch("/api/system/modules/export");
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `modules-export-${new Date().toISOString().split("T")[0]}.json` });
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setModMsg(`Exported: ${data.modules?.length} modules, ${data.screens?.length} screens, ${data.reports?.length} reports`);
        setTimeout(() => setModMsg(null), 5000);
    };

    const exportModule = async () => {
        if (!selModUnico) return;
        const data = await sysFetch(`/api/system/modules/${selModUnico}/export`);
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `module-${t(modForm.nombre).replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.json` });
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
    };

    const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        const text = await file.text(); const json = JSON.parse(text);
        if (!confirm("Import and update Modules, Screens and Reports? Existing records will be updated.")) return;
        const res  = await fetch("/api/system/modules/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(json) });
        const data = await res.json();
        if (data.success) {
            const { modules: m, screens: s, reports: r } = data.imported;
            setImportMsg(`Applied changes: ${m} modules, ${s} screens, ${r} reports`);
            setTimeout(() => setImportMsg(null), 5000);
            await qc.invalidateQueries({ queryKey: ["sys-mods"] });
        } else { setModError(data.error); }
        e.target.value = "";
    };

    const filteredMods = useMemo(() => {
        if (!modSearch.trim()) return modules as any[];
        const q = modSearch.toLowerCase();
        return (modules as any[]).filter((m: any) => t(m.nombre).toLowerCase().includes(q) || t(m.clase).toLowerCase().includes(q));
    }, [modules, modSearch]);

    const isEditing = modMode !== "view";
    const selMod    = (modules as any[]).find((m: any) => m.unico === selModUnico);

    const handleAddScreen = () => {
        if (!selModUnico || isEditing) return;
        setScreenForm({...EMPTY_SCREEN, modulo_uq: selModUnico});
        setScreenError(null);
        setScreenModal({ mode: "add" });
    };
    const handleEditScreen = () => {
        if (!selScrUnico || isEditing) return;
        const s = (screens as any[]).find((x: any) => x.unico === selScrUnico);
        if (s) {
            setScreenForm({ unico: t(s.unico), modulo_uq: t(s.modulo_uq), nombre: t(s.nombre), orden: String(s.orden??0), run_pantalla: t(s.run_pantalla), executable: t(s.executable), image: t(s.image), path: t(s.path), menu: Boolean(s.menu), web_form: t(s.web_form), descripcion: t(s.descripcion) });
            setScreenError(null);
            setScreenModal({ mode: "edit" });
        }
    };
    const handleRemoveScreen = () => {
        if (selScrUnico) setDeleteScrDlg(true);
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
                        <LayoutGrid size={14} className="text-[#FB7506]" />
                        <span className="font-bold text-xs uppercase tracking-tight">Module & Screen Setup</span>
                    </div>
                </div>
                <span className="text-gray-400 text-[10px] font-bold">User: <span className="text-white">{session?.user?.name}</span></span>
            </div>

            {/* Main two-panel layout */}
            <div className="flex flex-col lg:flex-row flex-1 gap-2 p-2 overflow-y-auto lg:overflow-hidden">

                {/* ── LEFT: Module List ─────────────────────────────────────── */}
                <div className="hidden lg:flex w-[240px] shrink-0 flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 border-b border-black/10 shrink-0 rounded-t-lg">
                        <div className="flex items-center gap-2">
                            <LayoutGrid size={16} className="text-[#FB7506]" />
                            <span className="fos-grid-header-text">Modules</span>
                        </div>
                        {loadingMods && <RefreshCcw size={16} className="text-gray-400 animate-spin" />}
                    </div>
                    <div className="p-2 border-b border-gray-100 shrink-0">
                        <div className="relative">
                            <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="text" value={modSearch} onChange={e => setModSearch(e.target.value)}
                                placeholder="Filter modules..." className="w-full pl-7 pr-2 h-9 text-sm border border-gray-200 rounded outline-none focus:ring-1 focus:ring-[#FB7506]" />
                        </div>
                    </div>
                    <div className="overflow-y-auto flex-1">
                        {filteredMods.map((m: any) => {
                            const isSelected = selModUnico === m.unico;
                            return (
                                <div key={m.unico} onClick={() => selectModule(m)}
                                    className={cn("px-3 py-2 border-b border-gray-50 flex items-center gap-2 transition-colors",
                                        isEditing ? "cursor-not-allowed opacity-60" : "cursor-pointer",
                                        isSelected ? "!bg-blue-100 ring-2 ring-inset ring-blue-300" : "hover:bg-blue-50"
                                    )}>
                                    <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", m.active ? "bg-green-400" : "bg-gray-300")} />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-semibold text-gray-800 truncate">{t(m.nombre)}</p>
                                        <div className="flex items-center justify-between">
                                            <p className="text-[9px] text-gray-400">{t(m.clase)}</p>
                                            <span className="text-[8px] font-black bg-blue-100 text-blue-600 px-1 rounded">{m.screen_count || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── RIGHT: Form + Screens ─────────────────────────────────── */}
                <div className="flex-1 flex flex-col gap-2 min-w-0 lg:overflow-hidden">

                    {/* Module Form */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm shrink-0">
                        <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 border-b border-black/10 rounded-t-lg">
                            <div className="flex items-center gap-2 min-w-0">
                                <LayoutGrid size={16} className="text-[#FB7506] shrink-0" />
                                <span className="fos-grid-header-text shrink-0">
                                    {modMode === "add" ? "New Module" : "Module Details"}
                                </span>
                                <AuditLogModal recordId={selModUnico} disabled={!selModUnico} />
                                {modError && <span className="flex items-center gap-1 text-amber-400 text-[10px] font-bold ml-2 truncate"><AlertCircle size={12} />{modError}</span>}
                                {modMsg   && <span className="flex items-center gap-1 text-green-400 text-[10px] font-bold ml-2 truncate"><Check size={12} />{modMsg}</span>}
                                {importMsg && <span className="text-blue-400 text-[10px] font-bold ml-2 truncate">{importMsg}</span>}
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                                {modMode === "view" ? (
                                    <GridMenu
                                        items={[
                                            { label: "Add Module", icon: Plus, color: "green", onClick: () => { setModForm(EMPTY_MOD); setModMode("add"); setModError(null); } },
                                            { label: "Edit Module", icon: Pencil, color: "orange", onClick: () => { if (selModUnico) setModMode("edit"); }, disabled: !selModUnico },
                                            { label: "Delete Module", icon: Trash2, color: "red", onClick: () => { if (selModUnico) setDeleteModDlg(true); }, disabled: !selModUnico },
                                            { label: "Export All", icon: Download, color: "gray", onClick: exportAll },
                                            { label: "Export Module", icon: Download, color: "gray", onClick: exportModule, disabled: !selModUnico },
                                            { label: "Import JSON", icon: Upload, color: "gray", onClick: () => importRef.current?.click() },
                                        ]}
                                    />
                                ) : (<>
                                    <button onClick={saveMod} disabled={saving}
                                        className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-1.5 rounded text-xs font-black uppercase tracking-wider transition-all">
                                        {saving ? <RefreshCcw size={14} className="animate-spin" /> : <Save size={14} />}{saving ? "Saving..." : "Save"}
                                    </button>
                                    <button onClick={() => { setModMode("view"); setModError(null); if (selModUnico && selMod) selectModule(selMod); }}
                                        className="flex items-center gap-1.5 bg-gray-500 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-xs font-black uppercase tracking-wider transition-all">
                                        <X size={14} /> Cancel
                                    </button>
                                </>)}
                            </div>
                        </div>

                        <div className="p-3 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
                            {[
                                { label: "Code",    key: "unico",  readonly: true },
                                { label: "Order",   key: "orden",  readonly: false, type: "number" },
                                { label: "Icon",    key: "image",  readonly: false },
                                { label: "DSN",     key: "dsn",    readonly: false },
                            ].map(f => (
                                <div key={f.key} className="flex flex-col gap-0.5">
                                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">{f.label}</label>
                                    <input type={f.type||"text"} value={(modForm as any)[f.key]||""} readOnly={!isEditing || f.readonly}
                                        onChange={e => setModForm(prev => ({...prev, [f.key]: e.target.value}))}
                                        className={cn("fos-input h-10 text-sm", (!isEditing || f.readonly) && "bg-gray-50 text-gray-500")} />
                                </div>
                            ))}

                            <div className="flex flex-col gap-0.5">
                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Class</label>
                                {isEditing ? (
                                    <select value={modForm.clase} onChange={e => setModForm(p => ({...p, clase: e.target.value}))} className="fos-input h-10 text-sm">
                                        <option value="">—</option>
                                        {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                ) : (
                                    <input readOnly value={modForm.clase} className="fos-input h-10 text-sm bg-gray-50 text-gray-500" />
                                )}
                            </div>

                            <div className="flex items-center gap-4 pt-3">
                                {["active","web"].map(k => (
                                    <label key={k} className="flex items-center gap-1.5 cursor-pointer">
                                        <input type="checkbox" checked={Boolean((modForm as any)[k])}
                                            disabled={!isEditing || (k === "active" && modMode === "add")}
                                            onChange={e => setModForm(p => ({...p, [k]: e.target.checked}))}
                                            className="w-4 h-4 accent-[#FB7506]" />
                                        <span className="text-xs font-semibold text-gray-600 uppercase">{k}</span>
                                    </label>
                                ))}
                            </div>

                            <div className="flex flex-col gap-0.5 col-span-2 sm:col-span-4 lg:col-span-2">
                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Module Name</label>
                                <input value={modForm.nombre} readOnly={!isEditing}
                                    onChange={e => setModForm(p => ({...p, nombre: e.target.value}))}
                                    className={cn("fos-input h-10 text-sm", !isEditing && "bg-gray-50 text-gray-500")} />
                            </div>

                            <div className="flex flex-col gap-0.5 col-span-2 sm:col-span-4 lg:col-span-4">
                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Description</label>
                                <input value={modForm.descripcion} readOnly={!isEditing}
                                    onChange={e => setModForm(p => ({...p, descripcion: e.target.value}))}
                                    className={cn("fos-input h-10 text-sm", !isEditing && "bg-gray-50 text-gray-500")} />
                            </div>
                        </div>
                    </div>

                    {/* Screens Grid */}
                    <div className="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex-1 min-h-0">
                        <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 border-b border-black/10 shrink-0 rounded-t-lg">
                            <div className="flex items-center gap-2">
                                <Monitor size={16} className="text-[#FB7506]" />
                                <span className="fos-grid-header-text">
                                    Screens {selMod ? `— ${t(selMod.nombre)}` : ""}
                                </span>
                                <AuditLogModal recordId={selScrUnico} disabled={!selScrUnico} />
                                {loadingScr && <RefreshCcw size={16} className="text-gray-400 animate-spin" />}
                                {screenError && <span className="flex items-center gap-1 text-amber-400 text-[10px] font-bold ml-2"><AlertCircle size={12} />{screenError}</span>}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <GridMenu
                                    items={[
                                        { label: "Add Screen", icon: Plus, color: "green", onClick: handleAddScreen, disabled: !selModUnico || isEditing },
                                        { label: "Edit Screen", icon: Pencil, color: "orange", onClick: handleEditScreen, disabled: !selScrUnico || isEditing },
                                        { label: "Remove Screen", icon: Trash2, color: "red", onClick: handleRemoveScreen, disabled: !selScrUnico || isEditing },
                                    ]}
                                />
                            </div>
                        </div>
                        <div className="overflow-auto flex-1">
                            {!selModUnico ? (
                                <div className="h-full flex items-center justify-center text-gray-300 text-xs font-bold uppercase tracking-widest">Select a module</div>
                            ) : (screens as any[]).length === 0 ? (
                                <div className="h-32 flex items-center justify-center text-gray-400 text-xs italic">{loadingScr ? "Loading..." : "No screens in this module"}</div>
                            ) : (
                                <table className="min-w-full text-left">
                                    <thead className="bg-gray-100 border-b text-gray-700 sticky top-0 z-10">
                                        <tr className="fos-grid-thead">
                                            <th className="p-2">Title</th>
                                            <th className="p-2 border-l border-gray-200">Route</th>
                                            <th className="p-2 border-l border-gray-200">Component</th>
                                            <th className="p-2 border-l border-gray-200">Module folder</th>
                                            <th className="p-2 border-l border-gray-200">Icon</th>
                                            <th className="p-2 border-l border-gray-200 text-center">Ord</th>
                                            <th className="p-2 border-l border-gray-200 text-center">Menu</th>
                                        </tr>
                                    </thead>
                                    <tbody className="fos-grid-tbody">
                                        {(screens as any[]).map((s: any) => {
                                            const isSel = selScrUnico === s.unico;
                                            return (
                                                <tr key={s.unico} onClick={() => setSelScrUnico(s.unico)}
                                                    onDoubleClick={() => { setSelScrUnico(s.unico); setScreenForm({ unico: t(s.unico), modulo_uq: t(s.modulo_uq), nombre: t(s.nombre), orden: String(s.orden??0), run_pantalla: t(s.run_pantalla), executable: t(s.executable), image: t(s.image), path: t(s.path), menu: Boolean(s.menu), web_form: t(s.web_form), descripcion: t(s.descripcion) }); setScreenError(null); setScreenModal({ mode: "edit" }); }}
                                                    className={cn("border-b cursor-pointer transition-colors", isSel ? "!bg-blue-100 ring-2 ring-inset ring-blue-300" : "odd:bg-white even:bg-gray-50 hover:bg-blue-50")}>
                                                    <td className="p-2 font-medium truncate max-w-[180px]">{t(s.nombre)}</td>
                                                    <td className="p-2 border-l border-gray-100 text-blue-600 truncate max-w-[140px]">{t(s.web_form)}</td>
                                                    <td className="p-2 border-l border-gray-100 text-gray-500 truncate max-w-[120px]">{t(s.run_pantalla)}</td>
                                                    <td className="p-2 border-l border-gray-100 text-gray-400 truncate max-w-[100px]">{t(s.executable)}</td>
                                                    <td className="p-2 border-l border-gray-100 text-gray-400 truncate max-w-[80px]">{t(s.image)}</td>
                                                    <td className="p-2 border-l border-gray-100 text-center">{s.orden}</td>
                                                    <td className="p-2 border-l border-gray-100 text-center">
                                                        {s.menu ? <Check size={12} className="text-green-500 mx-auto" /> : <span className="text-gray-300">—</span>}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="h-8 bg-gray-100 border-t px-4 flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-tight shrink-0">
                <div className="flex gap-4"><span>Server: Production</span><span className="text-gray-300">|</span><span>Database: Sistema</span></div>
                <span className="text-[#FB7506]">FOS System Management V.2.0.1</span>
            </div>

            {/* Mobile floating button */}
            <button onClick={() => setMobileModOpen(true)}
                className="lg:hidden fixed bottom-6 right-6 z-40 w-12 h-12 bg-[#FB7506] hover:bg-orange-600 text-white rounded-full shadow-xl flex items-center justify-center transition-all active:scale-95"
                title="Select Module">
                <LayoutGrid size={20} />
            </button>

            {/* Mobile module list modal */}
            {mobileModOpen && (
                <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
                        <div className="h-10 bg-[#374151] flex items-center justify-between px-4 border-b border-black/10 shrink-0">
                            <div className="flex items-center gap-2">
                                <LayoutGrid size={16} className="text-[#FB7506]" />
                                <span className="fos-grid-header-text">Select Module</span>
                            </div>
                            <button onClick={() => setMobileModOpen(false)}
                                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="p-3 border-b border-gray-100 shrink-0">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="text" value={modSearch} onChange={e => setModSearch(e.target.value)}
                                    placeholder="Filter modules..."
                                    className="w-full pl-9 pr-3 h-10 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#FB7506]" />
                            </div>
                        </div>
                        <div className="overflow-y-auto flex-1">
                            {filteredMods.map((m: any) => {
                                const isSelected = selModUnico === m.unico;
                                return (
                                    <div key={m.unico} onClick={() => { selectModule(m); setMobileModOpen(false); }}
                                        className={cn("px-4 py-3 border-b border-gray-50 flex items-center gap-3 cursor-pointer transition-colors",
                                            isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                                        )}>
                                        <div className={cn("w-2 h-2 rounded-full shrink-0", m.active ? "bg-green-400" : "bg-gray-300")} />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-gray-800 truncate">{t(m.nombre)}</p>
                                            <p className="text-xs text-gray-400">{t(m.clase)}</p>
                                        </div>
                                        {isSelected && <Check size={16} className="text-blue-500 shrink-0" />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Screen Modal ────────────────────────────────────────────── */}
            {screenModal && (
                <ScreenFormModal
                    mode={screenModal.mode} form={screenForm} setForm={setScreenForm}
                    error={screenError} saving={savingScreen}
                    modName={selMod ? t(selMod.nombre) : ""}
                    reports={reports as any[]} loadingRpt={loadingRpt}
                    selRptUnico={null}
                    onSave={saveScreen} onClose={() => { setScreenModal(null); setScreenError(null); }}
                    onAddReport={() => { setReportForm({...EMPTY_REPORT, panta_uq: selScrUnico||""}); setReportError(null); setReportModal({ mode: "add" }); }}
                    onEditReport={(r: any) => { setReportForm({ unico: t(r.unico), panta_uq: t(r.panta_uq), nombre: t(r.nombre), titulo: t(r.titulo), path: t(r.path), descripcion: t(r.descripcion), fecha_desde: Boolean(r.fecha_desde), fecha_hasta: Boolean(r.fecha_hasta), numero_desde: Boolean(r.numero_desde), numero_hasta: Boolean(r.numero_hasta), actual: Boolean(r.actual), comprimido: Boolean(r.comprimido), detallado: Boolean(r.detallado), exportar: Boolean(r.exportar) }); setReportError(null); setReportModal({ mode: "edit" }); }}
                    onDeleteReport={(r: any) => { setReportForm(r); setDeleteRptDlg(true); }}
                />
            )}

            {/* ── Report Modal ─────────────────────────────────────────────── */}
            {reportModal && (
                <ReportFormModal mode={reportModal.mode} form={reportForm} setForm={setReportForm}
                    error={reportError} saving={savingReport}
                    onSave={saveReport} onClose={() => { setReportModal(null); setReportError(null); }} />
            )}

            {/* ── Confirm dialogs ──────────────────────────────────────────── */}
            {deleteModDlg && <ConfirmDelete title="Delete Module" msg={`Delete module "${t(modForm.nombre)}"? All screens must be removed first.`} onConfirm={deleteMod} onCancel={() => setDeleteModDlg(false)} saving={saving} error={modError} />}
            {deleteScrDlg && <ConfirmDelete title="Remove Screen" msg={`Remove screen "${t(screenForm.nombre)}"? All reports must be removed first.`} onConfirm={deleteScreen} onCancel={() => { setDeleteScrDlg(false); setScreenError(null); }} saving={savingScreen} error={screenError} />}
            {deleteRptDlg && <ConfirmDelete title="Delete Report" msg={`Delete report "${t(reportForm.nombre)}"?`} onConfirm={deleteReport} onCancel={() => { setDeleteRptDlg(false); setReportError(null); }} saving={savingReport} error={reportError} />}
        </div>
    );
}

// ─── Screen Form Modal ────────────────────────────────────────────────────────
function ScreenFormModal({ mode, form, setForm, error, saving, modName, reports, loadingRpt, onSave, onClose, onAddReport, onEditReport, onDeleteReport }: any) {
    const [selRpt, setSelRpt] = useState<string | null>(null);
    const hasWebForm = form.web_form.trim();
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 border-b border-black/10 shrink-0">
                    <div className="flex items-center gap-2">
                        <Monitor size={16} className="text-[#FB7506]" />
                        <span className="fos-grid-header-text">{mode === "add" ? "Add Screen" : "Edit Screen"}</span>
                        {error && <span className="text-amber-400 text-[10px] font-bold ml-2 truncate">{error}</span>}
                    </div>
                    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors">
                        <X size={16} />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                        {mode === "edit" && (
                            <div className="flex flex-col gap-0.5">
                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Code</label>
                                <input readOnly value={form.unico} className="fos-input h-10 text-sm bg-gray-50 text-gray-500" />
                            </div>
                        )}
                        <div className="flex flex-col gap-0.5">
                            <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Module</label>
                            <input readOnly value={modName} className="fos-input h-10 text-sm bg-gray-50 text-gray-500" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Title *</label>
                            <input value={form.nombre} onChange={e => setForm((p: any) => ({...p, nombre: e.target.value}))} className="fos-input h-10 text-sm" placeholder="Screen / menu title" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Order</label>
                            <input type="number" value={form.orden} onChange={e => setForm((p: any) => ({...p, orden: e.target.value}))} className="fos-input h-10 text-sm" />
                        </div>
                        <div className="flex flex-col gap-0.5 col-span-2">
                            <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Route (Web) {hasWebForm && <span className="text-blue-500 normal-case font-normal ml-1">← web form detected, VFP fields optional</span>}</label>
                            <input value={form.web_form} onChange={e => setForm((p: any) => ({...p, web_form: e.target.value}))} className="fos-input h-10 text-sm" placeholder="/system/users  or  customercare/page.aspx" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Component / Screen {!hasWebForm && "*"}</label>
                            <input value={form.run_pantalla} onChange={e => setForm((p: any) => ({...p, run_pantalla: e.target.value}))} className="fos-input h-10 text-sm" placeholder="VFP: Form.scx  |  React: ComponentName" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Program / Module folder {!hasWebForm && "*"}</label>
                            <input value={form.executable} onChange={e => setForm((p: any) => ({...p, executable: e.target.value}))} className="fos-input h-10 text-sm" placeholder="VFP: Program.exe  |  React: FolderName" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Icon {!hasWebForm && "*"}</label>
                            <input value={form.image} onChange={e => setForm((p: any) => ({...p, image: e.target.value}))} className="fos-input h-10 text-sm" placeholder="icon-name.png" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Path</label>
                            <input value={form.path} onChange={e => setForm((p: any) => ({...p, path: e.target.value}))} className="fos-input h-10 text-sm" />
                        </div>
                        <div className="flex flex-col gap-0.5 col-span-2">
                            <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Description</label>
                            <input value={form.descripcion} onChange={e => setForm((p: any) => ({...p, descripcion: e.target.value}))} className="fos-input h-10 text-sm" />
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                            <input type="checkbox" checked={form.menu} onChange={e => setForm((p: any) => ({...p, menu: e.target.checked}))} className="w-4 h-4 accent-[#FB7506]" id="scr-menu" />
                            <label htmlFor="scr-menu" className="text-sm font-semibold cursor-pointer">Show in menu</label>
                        </div>
                    </div>

                    {/* Reports sub-grid */}
                    {mode === "edit" && (
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 border-b border-black/10">
                                <div className="flex items-center gap-2">
                                    <FileText size={16} className="text-[#FB7506]" />
                                    <span className="fos-grid-header-text">Reports ({reports.length})</span>
                                </div>
                                <div className="flex gap-1.5">
                                    <button onClick={onAddReport} className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs font-black uppercase tracking-wider transition-all"><Plus size={14} /> Add</button>
                                    <button onClick={() => { const r = reports.find((x: any) => x.unico===selRpt); if(r) onEditReport(r); }} disabled={!selRpt} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-3 py-1.5 rounded text-xs font-black uppercase tracking-wider transition-all"><Pencil size={14} /> Edit</button>
                                    <button onClick={() => { const r = reports.find((x: any) => x.unico===selRpt); if(r) onDeleteReport(r); }} disabled={!selRpt} className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white px-3 py-1.5 rounded text-xs font-black uppercase tracking-wider transition-all"><Trash2 size={14} /> Delete</button>
                                </div>
                            </div>
                            <div className="max-h-40 overflow-auto">
                                {reports.length === 0 ? (
                                    <div className="p-4 text-center text-gray-400 text-xs italic">{loadingRpt ? "Loading..." : "No reports"}</div>
                                ) : (
                                    <table className="min-w-full text-xs">
                                        <thead className="bg-gray-100 border-b text-gray-700 font-bold sticky top-0">
                                            <tr>{["Name","Title","Active","Dates","Excel","Description"].map(h => <th key={h} className="p-1.5 text-left whitespace-nowrap border-r border-gray-200 last:border-r-0">{h}</th>)}</tr>
                                        </thead>
                                        <tbody>
                                            {reports.map((r: any) => (
                                                <tr key={r.unico} onClick={() => setSelRpt(r.unico)}
                                                    onDoubleClick={() => onEditReport(r)}
                                                    className={cn("border-b cursor-pointer transition-colors", selRpt===r.unico ? "!bg-blue-100" : "odd:bg-white even:bg-gray-50 hover:bg-blue-50")}>
                                                    <td className="p-1.5 border-r border-gray-100 font-medium">{t(r.nombre)}</td>
                                                    <td className="p-1.5 border-r border-gray-100 text-gray-500 truncate max-w-[120px]">{t(r.titulo)}</td>
                                                    <td className="p-1.5 border-r border-gray-100 text-center">{r.actual ? <Check size={10} className="text-green-500 mx-auto" /> : "—"}</td>
                                                    <td className="p-1.5 border-r border-gray-100 text-center">{(r.fecha_desde||r.fecha_hasta) ? <Check size={10} className="text-blue-500 mx-auto" /> : "—"}</td>
                                                    <td className="p-1.5 border-r border-gray-100 text-center">{r.exportar ? <Check size={10} className="text-orange-500 mx-auto" /> : "—"}</td>
                                                    <td className="p-1.5 text-gray-400 truncate max-w-[120px]">{t(r.descripcion)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 px-4 py-3 bg-gray-50 border-t shrink-0 rounded-b-xl">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
                    <button onClick={onSave} disabled={saving}
                        className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#FB7506] hover:bg-orange-600 disabled:opacity-40 text-white text-sm font-black uppercase tracking-wider transition-all">
                        {saving ? <RefreshCcw size={14} className="animate-spin" /> : <Save size={14} />}{saving ? "Saving..." : "Save Screen"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Report Form Modal ────────────────────────────────────────────────────────
function ReportFormModal({ mode, form, setForm, error, saving, onSave, onClose }: any) {
    const BOOL_FIELDS: Array<{ key: string; label: string }> = [
        { key: "fecha_desde", label: "Date From" }, { key: "fecha_hasta", label: "Date To" },
        { key: "numero_desde", label: "Num From" }, { key: "numero_hasta", label: "Num To" },
        { key: "actual", label: "Current" }, { key: "comprimido", label: "Compressed" },
        { key: "detallado", label: "Detailed" }, { key: "exportar", label: "Excel" },
    ];
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 border-b border-black/10 shrink-0">
                    <div className="flex items-center gap-2">
                        <FileText size={16} className="text-[#FB7506]" />
                        <span className="fos-grid-header-text">{mode === "add" ? "Add Report" : "Edit Report"}</span>
                        {error && <span className="text-amber-400 text-[10px] font-bold ml-2">{error}</span>}
                    </div>
                    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors">
                        <X size={16} />
                    </button>
                </div>
                <div className="p-4 space-y-3 text-xs">
                    {mode === "edit" && (
                        <div className="flex flex-col gap-0.5">
                            <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Code</label>
                            <input readOnly value={form.unico} className="fos-input h-10 text-sm bg-gray-50 text-gray-500" />
                        </div>
                    )}
                    {[{ key: "nombre", label: "Name *" }, { key: "titulo", label: "Title" }, { key: "path", label: "Path" }, { key: "descripcion", label: "Description" }].map(f => (
                        <div key={f.key} className="flex flex-col gap-0.5">
                            <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">{f.label}</label>
                            <input value={form[f.key]||""} onChange={e => setForm((p: any) => ({...p, [f.key]: e.target.value}))} className="fos-input h-10 text-sm" />
                        </div>
                    ))}
                    <div className="grid grid-cols-4 gap-2 pt-1">
                        {BOOL_FIELDS.map(f => (
                            <label key={f.key} className="flex items-center gap-1.5 cursor-pointer">
                                <input type="checkbox" checked={Boolean(form[f.key])} onChange={e => setForm((p: any) => ({...p, [f.key]: e.target.checked}))} className="w-4 h-4 accent-[#FB7506]" />
                                <span className="text-xs font-semibold text-gray-600">{f.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div className="flex justify-end gap-3 px-4 py-3 bg-gray-50 border-t rounded-b-xl">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
                    <button onClick={onSave} disabled={saving}
                        className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#FB7506] hover:bg-orange-600 disabled:opacity-40 text-white text-sm font-black uppercase tracking-wider transition-all">
                        {saving ? <RefreshCcw size={14} className="animate-spin" /> : <Save size={14} />}{saving ? "..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Confirm Delete Dialog ────────────────────────────────────────────────────
function ConfirmDelete({ title, msg, onConfirm, onCancel, saving, error }: any) {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
                <div className="p-6 flex flex-col items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                        <Trash2 size={24} className="text-red-600" />
                    </div>
                    <div className="text-center">
                        <h3 className="font-black text-gray-900 text-base mb-1">{title}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">{msg}</p>
                        {error && <p className="text-xs text-red-500 mt-2 font-bold">{error}</p>}
                    </div>
                </div>
                <div className="flex border-t border-gray-100">
                    <button onClick={onCancel} className="flex-1 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 border-r border-gray-100">Cancel</button>
                    <button onClick={onConfirm} disabled={saving} className="flex-1 py-3 text-sm font-black text-red-600 hover:bg-red-50 disabled:opacity-50">
                        {saving ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
}
