"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Plus, Pencil, Trash2, Save, X, RefreshCcw,
    Download, Upload, LayoutGrid, Monitor, FileText,
    Check, AlertCircle, ChevronRight, Search, XCircle, Menu, Minus
} from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { GridMenu } from "@/components/GridMenu";
import { useAuditLog } from "@/lib/audit";
import { usePagePermissions, PERMISSION_MSGS } from "@/lib/permissions";
import { AuditLogModal } from "@/components/AuditLogModal";
import { cn } from "@/lib/utils";
import { useModuleStore } from "@/store/system/useModuleStore";
import PanelGrid from "@/components/ui/PanelGrid";
import { PanelGridTable, PanelGridThead, PanelGridTh, PanelGridTbody, PanelGridTr, PanelGridTd } from "@/components/ui/PanelGridTable";


const EMPTY_ARR: any[] = [];
const CLASSES   = ["Empresas", "Sistema", "Otros"];
const t         = (v: any) => String(v ?? "").trim();
const sysFetch  = async (url: string) => { const r = await fetch(url); const j = await r.json(); if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`); return j; };

type ModForm = { unico: string; nombre: string; clase: string; orden: string; image: string; descripcion: string; dsn: string; active: boolean; web: boolean; };
type ScreenForm = { unico: string; modulo_uq: string; nombre: string; orden: string; run_pantalla: string; executable: string; image: string; path: string; menu: boolean; web_form: string; descripcion: string; };
type ReportForm = { unico: string; panta_uq: string; nombre: string; titulo: string; path: string; descripcion: string; fecha_desde: boolean; fecha_hasta: boolean; numero_desde: boolean; numero_hasta: boolean; actual: boolean; comprimido: boolean; detallado: boolean; exportar: boolean; };

const EMPTY_MOD:    ModForm    = { unico: "", nombre: "", clase: "", orden: "0", image: "", descripcion: "", dsn: "", active: true, web: true };
const EMPTY_SCREEN: ScreenForm = { unico: "", modulo_uq: "", nombre: "", orden: "0", run_pantalla: "", executable: "", image: "", path: "", menu: true, web_form: "", descripcion: "" };
const EMPTY_REPORT: ReportForm = { unico: "", panta_uq: "", nombre: "", titulo: "", path: "", descripcion: "", fecha_desde: false, fecha_hasta: false, numero_desde: false, numero_hasta: false, actual: true, comprimido: false, detallado: false, exportar: false };

export default function ModuleScreenSetupPage() {
    const { status } = useSession();
    const router  = useRouter();
    const qc      = useQueryClient();
    const { logAction } = useAuditLog("module-screen-setup", "modulo");
    const perms = usePagePermissions("module-screen-setup");
    const importRef = useRef<HTMLInputElement>(null);

    const { 
        selModUnico, setSelModUnico, selScrUnico, setSelScrUnico, activeGrid, clearSelection, modSearch, setModSearch,
        mobileModOpen, setMobileModOpen
    } = useModuleStore();

    const [modFormModal,   setModFormModal]   = useState<{mode:"add"|"edit"}|null>(null);
    const [modForm,        setModForm]        = useState<ModForm>(EMPTY_MOD);
    const [saving,         setSaving]         = useState(false);
    const [deleteModDlg,   setDeleteModDlg]   = useState(false);
    
    const [screenModal,    setScreenModal]    = useState<{ mode: "add"|"edit" } | null>(null);
    const [screenForm,     setScreenForm]     = useState<ScreenForm>(EMPTY_SCREEN);
    const [savingScreen,   setSavingScreen]   = useState(false);
    const [deleteScrDlg,   setDeleteScrDlg]   = useState(false);
    
    const [reportModal,    setReportModal]    = useState<{ mode: "add"|"edit" } | null>(null);
    const [reportForm,     setReportForm]     = useState<ReportForm>(EMPTY_REPORT);
    const [savingReport,   setSavingReport]   = useState(false);
    const [deleteRptDlg,   setDeleteRptDlg]   = useState(false);

    useEffect(() => { if (status === "unauthenticated") router.push("/login"); }, [status, router]);

    // "" Queries """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
    const { data: modules = EMPTY_ARR, isFetching: loadingMods } = useQuery({ queryKey: ["sys-mods"], queryFn: () => sysFetch("/api/system/modules") });
    const { data: screens = EMPTY_ARR, isFetching: loadingScr, refetch: refetchScr } = useQuery({ queryKey: ["sys-scr", selModUnico], queryFn: () => sysFetch(`/api/system/modules/${selModUnico}/screens`), enabled: !!selModUnico, retry: false });
    const { data: reports = EMPTY_ARR, isFetching: loadingRpt, refetch: refetchRpt } = useQuery({ queryKey: ["sys-rpt", selScrUnico], queryFn: () => sysFetch(`/api/system/screens/${selScrUnico}/reports`), enabled: !!selScrUnico && !!screenModal, retry: false });

    // Auto-select
    useEffect(() => {
        if ((modules as any[]).length > 0 && !selModUnico) setSelModUnico((modules as any[])[0].unico);
    }, [modules, selModUnico, setSelModUnico]);

    useEffect(() => {
        if ((screens as any[]).length > 0) setSelScrUnico((screens as any[])[0].unico);
        else setSelScrUnico(null);
    }, [screens, setSelScrUnico]);

    const selMod = (modules as any[]).find((m: any) => m.unico === selModUnico);

    // "" Module CRUD """""""""""""""""""""""""""""""""""""""""""""""""""""""""""
    const validateMod = () => {
        if (!modForm.nombre.trim()) return "Module name is required.";
        if (!modForm.clase.trim())  return "Class is required.";
        if (!modForm.image.trim())  return "Icon image is required.";
        return null;
    };

    const saveMod = async () => {
        const err = validateMod(); if (err) { toast.error(err); return; }
        setSaving(true);
        try {
            let unico = selModUnico;
            if (modFormModal?.mode === "add") {
                const res  = await fetch("/api/system/modules", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(modForm) });
                const data = await res.json(); if (!data.success) throw new Error(data.error); unico = data.unico;
            } else {
                const res  = await fetch(`/api/system/modules/${unico}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(modForm) });
                const data = await res.json(); if (!data.success) throw new Error(data.error);
            }
            logAction(modFormModal?.mode === "add" ? "Insert" : "Edit", unico!);
            await qc.invalidateQueries({ queryKey: ["sys-mods"] });
            setSelModUnico(unico); setModFormModal(null);
            toast.success(modFormModal?.mode === "add" ? "Module created." : "Module updated.");
        } catch (e: any) { toast.error(e.message); }
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
            toast.success("Module deleted.");
        } catch (e: any) { toast.error(e.message); setDeleteModDlg(false); }
        finally { setSaving(false); }
    };

    // "" Screen CRUD """""""""""""""""""""""""""""""""""""""""""""""""""""""""""
    const validateScreen = () => {
        if (!screenForm.nombre?.trim()) return "Screen title is required.";
        if (!selModUnico) return "Module is required.";
        const hasWebForm = screenForm.web_form.trim();
        if (!hasWebForm && !screenForm.run_pantalla.trim()) return "Screen component or route is required.";
        if (!hasWebForm && !screenForm.executable.trim()) return "Program/module folder is required.";
        return null;
    };

    const saveScreen = async () => {
        const err = validateScreen(); if (err) { toast.error(err); return; }
        setSavingScreen(true);
        try {
            const body = { ...screenForm, modulo_uq: selModUnico };
            if (screenModal?.mode === "add") {
                const res  = await fetch("/api/system/screens", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
                const data = await res.json(); if (!data.success) throw new Error(data.error);
                logAction("Insert", data.unico || selModUnico!, "Screen");
            } else {
                const res  = await fetch(`/api/system/screens/${screenForm.unico}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
                const data = await res.json(); if (!data.success) throw new Error(data.error);
                logAction("Edit", screenForm.unico, "Screen");
            }
            await refetchScr(); setScreenModal(null);
            toast.success(screenModal?.mode === "add" ? "Screen created." : "Screen updated.");
        } catch (e: any) { toast.error(e.message); }
        finally { setSavingScreen(false); }
    };

    const deleteScreen = async () => {
        if (!selScrUnico) return;
        setSavingScreen(true);
        try {
            const res  = await fetch(`/api/system/screens/${selScrUnico}`, { method: "DELETE" });
            const data = await res.json(); if (!data.success) throw new Error(data.error);
            logAction("Delete", selScrUnico!, "Screen");
            await refetchScr(); setSelScrUnico(null); setDeleteScrDlg(false);
            toast.success("Screen deleted.");
        } catch (e: any) { toast.error(e.message); setDeleteScrDlg(false); }
        finally { setSavingScreen(false); }
    };

    // "" Report CRUD """""""""""""""""""""""""""""""""""""""""""""""""""""""""""
    const saveReport = async () => {
        if (!reportForm.nombre.trim()) { toast.error("Report name is required."); return; }
        setSavingReport(true);
        try {
            const body = { ...reportForm, panta_uq: selScrUnico };
            if (reportModal?.mode === "add") {
                const res  = await fetch("/api/system/reports", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
                const data = await res.json(); if (!data.success) throw new Error(data.error);
                logAction("Insert", data.unico || selScrUnico!, "Report");
            } else {
                const res  = await fetch(`/api/system/reports/${reportForm.unico}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
                const data = await res.json(); if (!data.success) throw new Error(data.error);
                logAction("Edit", reportForm.unico, "Report");
            }
            await refetchRpt(); setReportModal(null);
            toast.success("Report saved.");
        } catch (e: any) { toast.error(e.message); }
        finally { setSavingReport(false); }
    };

    const deleteReport = async () => {
        setSavingReport(true);
        try {
            const res  = await fetch(`/api/system/reports/${reportForm.unico}`, { method: "DELETE" });
            const data = await res.json(); if (!data.success) throw new Error(data.error);
            logAction("Delete", reportForm.unico, "Report");
            await refetchRpt(); setDeleteRptDlg(false); setReportModal(null);
            toast.success("Report deleted.");
        } catch (e: any) { toast.error(e.message); setDeleteRptDlg(false); }
        finally { setSavingReport(false); }
    };

    // "" Export/Import """""""""""""""""""""""""""""""""""""""""""""""""""""""""""
    const exportAll = async () => {
        try {
            const data = await sysFetch("/api/system/modules/export");
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `modules-export-${new Date().toISOString().split("T")[0]}.json` });
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
            toast.success(`Exported: ${data.modules?.length} modules, ${data.screens?.length} screens, ${data.reports?.length} reports`);
        } catch(e:any) { toast.error(e.message); }
    };

    const exportModule = async () => {
        if (!selModUnico) return;
        try {
            const data = await sysFetch(`/api/system/modules/${selModUnico}/export`);
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `module-${t(selMod?.nombre).replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.json` });
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
        } catch(e:any) { toast.error(e.message); }
    };

    const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        try {
            const text = await file.text(); const json = JSON.parse(text);
            if (!confirm("Import and update Modules, Screens and Reports? Existing records will be updated.")) return;
            const res  = await fetch("/api/system/modules/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(json) });
            const data = await res.json();
            if (data.success) {
                const { modules: m, screens: s, reports: r } = data.imported;
                logAction("Insert", selModUnico || "import", "JSON Import");
                toast.success(`Imported: ${m} modules, ${s} screens, ${r} reports`);
                await qc.invalidateQueries({ queryKey: ["sys-mods"] });
            } else { toast.error(data.error); }
        } catch (e:any) { toast.error("Error reading file: " + e.message); }
        e.target.value = "";
    };

    const filteredMods = useMemo(() => {
        if (!modSearch.trim()) return modules as any[];
        const q = modSearch.toLowerCase();
        return (modules as any[]).filter((m: any) => t(m.nombre).toLowerCase().includes(q) || t(m.clase).toLowerCase().includes(q));
    }, [modules, modSearch]);

    // Handlers
    const handleAddModule = () => {
        if (!perms.canCreate) { toast.error(PERMISSION_MSGS.create); return; }
        setModForm({...EMPTY_MOD}); setModFormModal({mode:"add"});
    };
    const handleEditModule = () => {
        if (!perms.canEdit) { toast.error(PERMISSION_MSGS.edit); return; }
        if (selMod) {
            setModForm({ unico: t(selMod.unico), nombre: t(selMod.nombre), clase: t(selMod.clase), orden: String(selMod.orden ?? 0), image: t(selMod.image), descripcion: t(selMod.descripcion), dsn: t(selMod.dsn), active: Boolean(selMod.active), web: Boolean(selMod.web) });
            setModFormModal({mode:"edit"});
        }
    };
    const handleRemoveModule = () => {
        if (!perms.canDelete) { toast.error(PERMISSION_MSGS.delete); return; }
        if (selModUnico) setDeleteModDlg(true);
    };

    const handleAddScreen = () => {
        if (!perms.canCreate) { toast.error(PERMISSION_MSGS.create); return; }
        if (!selModUnico) return;
        setScreenForm({...EMPTY_SCREEN, modulo_uq: selModUnico});
        setScreenModal({ mode: "add" });
    };
    const handleEditScreen = () => {
        if (!perms.canEdit) { toast.error(PERMISSION_MSGS.edit); return; }
        if (!selScrUnico) return;
        const s = (screens as any[]).find((x: any) => x.unico === selScrUnico);
        if (s) {
            setScreenForm({ unico: t(s.unico), modulo_uq: t(s.modulo_uq), nombre: t(s.nombre), orden: String(s.orden??0), run_pantalla: t(s.run_pantalla), executable: t(s.executable), image: t(s.image), path: t(s.path), menu: Boolean(s.menu), web_form: t(s.web_form), descripcion: t(s.descripcion) });
            setScreenModal({ mode: "edit" });
        }
    };
    const handleRemoveScreen = () => {
        if (!perms.canDelete) { toast.error(PERMISSION_MSGS.delete); return; }
        if (selScrUnico) setDeleteScrDlg(true);
    };

    if (status === "loading") return null;

    return (
        <div className="flex flex-col h-[100dvh] bg-[#f4f6f8] overflow-hidden font-sans text-[#333]">
            <AppHeader title="Modules" />

            <div className="flex flex-col flex-1 p-2 gap-2 overflow-hidden">
                {/* TOP GRID: Modules (60%) */}
                <div className="flex-1 lg:flex-[6] min-h-0 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                    <PanelGrid
                        title="Modules"
                        icon={LayoutGrid}
                        recordCount={filteredMods.length}
                        refreshing={loadingMods}
                        searchValue={modSearch}
                        onSearchChange={setModSearch}
                        headerRight={<AuditLogModal recordId={selModUnico} disabled={!selModUnico} />}
                        menuItems={[
                            { label: "Add Module", icon: Plus, color: "green", onClick: handleAddModule, disabled: !perms.canCreate },
                            { label: "Edit Module", icon: Pencil, color: "orange", onClick: handleEditModule, disabled: !selModUnico || !perms.canEdit },
                            { label: "Delete Module", icon: Trash2, color: "red", onClick: handleRemoveModule, disabled: !selModUnico || !perms.canDelete },
                            { label: "Export All", icon: Download, color: "gray", onClick: exportAll },
                            { label: "Export Module", icon: Download, color: "gray", onClick: exportModule, disabled: !selModUnico },
                            { label: "Import JSON", icon: Upload, color: "gray", onClick: () => importRef.current?.click() },
                        ]}
                        className="flex-1 min-h-0"
                    >
                        <PanelGridTable>
                            <PanelGridThead>
                                    <PanelGridTh>Code</PanelGridTh>
                                    <PanelGridTh>Module Name</PanelGridTh>
                                    <PanelGridTh>Class</PanelGridTh>
                                    <PanelGridTh>Order</PanelGridTh>
                                    <PanelGridTh>Icon</PanelGridTh>
                                    <PanelGridTh>DSN</PanelGridTh>
                                    <PanelGridTh className="text-center">Active</PanelGridTh>
                                    <PanelGridTh className="text-center">Web</PanelGridTh>
                            </PanelGridThead>
                            <PanelGridTbody>
                                {filteredMods.map((m: any) => {
                                    const isSel = activeGrid === "module" && selModUnico === m.unico;
                                    return (
                                        <PanelGridTr key={m.unico} selected={isSel} onClick={() => isSel ? clearSelection() : setSelModUnico(m.unico)} onDoubleClick={handleEditModule}>
                                            <PanelGridTd className="font-mono font-semibold text-[#FB7506]">{t(m.unico)}</PanelGridTd>
                                            <PanelGridTd className="font-semibold text-blue-700">{t(m.nombre)}</PanelGridTd>
                                            <PanelGridTd className="text-gray-500">{t(m.clase)}</PanelGridTd>
                                            <PanelGridTd>{m.orden}</PanelGridTd>
                                            <PanelGridTd className="text-gray-400">{t(m.image)}</PanelGridTd>
                                            <PanelGridTd className="text-gray-400">{t(m.dsn)}</PanelGridTd>
                                            <PanelGridTd className="text-center">{m.active ? <Check size={14} className="mx-auto text-green-500" /> : <Minus size={14} className="mx-auto text-gray-300" />}</PanelGridTd>
                                            <PanelGridTd className="text-center">{m.web ? <Check size={14} className="mx-auto text-green-500" /> : <Minus size={14} className="mx-auto text-gray-300" />}</PanelGridTd>
                                        </PanelGridTr>
                                    );
                                })}
                            </PanelGridTbody>
                        </PanelGridTable>
                    </PanelGrid>
                </div>

                {/* BOTTOM GRID: Screens (40%) */}
                <div className="flex-1 lg:flex-[4] min-h-0 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                    <PanelGrid
                        title={`Screens${selMod ? ' - ' + t(selMod.nombre) : ''}`}
                        icon={Monitor}
                        recordCount={(screens as any[]).length}
                        refreshing={loadingScr}
                        onRefresh={() => refetchScr()}
                        headerRight={<AuditLogModal recordId={selScrUnico} disabled={!selScrUnico} />}
                        menuItems={[
                            { label: "Add Screen", icon: Plus, color: "green", onClick: handleAddScreen, disabled: !selModUnico || !perms.canCreate },
                            { label: "Edit Screen", icon: Pencil, color: "orange", onClick: handleEditScreen, disabled: !selScrUnico || !perms.canEdit },
                            { label: "Remove Screen", icon: Trash2, color: "red", onClick: handleRemoveScreen, disabled: !selScrUnico || !perms.canDelete },
                        ]}
                        className="flex-1 min-h-0"
                    >
                        {!selModUnico ? (
                            <div className="h-full flex items-center justify-center text-gray-300 text-xs font-bold uppercase tracking-widest">Select a module</div>
                        ) : (screens as any[]).length === 0 ? (
                            <div className="h-32 flex items-center justify-center text-gray-400 text-xs italic">{loadingScr ? "Loading..." : "No screens in this module"}</div>
                        ) : (
                            <PanelGridTable>
                                <PanelGridThead>
                                        <PanelGridTh>Code</PanelGridTh>
                                        <PanelGridTh>Title</PanelGridTh>
                                        <PanelGridTh>Route</PanelGridTh>
                                        <PanelGridTh>Component</PanelGridTh>
                                        <PanelGridTh>Module folder</PanelGridTh>
                                        <PanelGridTh>Icon</PanelGridTh>
                                        <PanelGridTh className="text-center">Ord</PanelGridTh>
                                        <PanelGridTh className="text-center">Menu</PanelGridTh>
                                </PanelGridThead>
                                <PanelGridTbody>
                                    {(screens as any[]).map((s: any) => {
                                        const isSel = activeGrid === "screen" && selScrUnico === s.unico;
                                        return (
                                            <PanelGridTr key={s.unico} selected={isSel} onClick={() => isSel ? setSelScrUnico(null) : setSelScrUnico(s.unico)} onDoubleClick={handleEditScreen}>
                                                <PanelGridTd className="font-mono font-semibold text-[#FB7506]">{t(s.unico)}</PanelGridTd>
                                                <PanelGridTd className="font-semibold text-blue-700">{t(s.nombre)}</PanelGridTd>
                                                <PanelGridTd className="text-blue-600">{t(s.web_form)}</PanelGridTd>
                                                <PanelGridTd className="text-gray-500">{t(s.run_pantalla)}</PanelGridTd>
                                                <PanelGridTd className="text-gray-400">{t(s.executable)}</PanelGridTd>
                                                <PanelGridTd className="text-gray-400">{t(s.image)}</PanelGridTd>
                                                <PanelGridTd className="text-center">{s.orden}</PanelGridTd>
                                                <PanelGridTd className="text-center">{s.menu ? <Check size={14} className="mx-auto text-green-500" /> : <Minus size={14} className="mx-auto text-gray-300" />}</PanelGridTd>
                                            </PanelGridTr>
                                        );
                                    })}
                                </PanelGridTbody>
                            </PanelGridTable>
                        )}
                    </PanelGrid>
                </div>
            </div>

            <AppFooter areaLabel="System Management" database="Sistema" />

            <input type="file" ref={importRef} accept=".json" className="hidden" onChange={handleImportFile} />

            {/* "" Module Form Modal """"""""""""""""""""""""""""""""""""""" */}
            {modFormModal && (
                <ModuleFormModal mode={modFormModal.mode} form={modForm} setForm={setModForm} onSave={saveMod} onClose={() => setModFormModal(null)} saving={saving} />
            )}

            {/* "" Screen Modal """""""""""""""""""""""""""""""""""""""""""""" */}
            {screenModal && (
                <ScreenFormModal mode={screenModal.mode} form={screenForm} setForm={setScreenForm} saving={savingScreen} modName={selMod ? t(selMod.nombre) : ""} reports={reports as any[]} loadingRpt={loadingRpt} onSave={saveScreen} onClose={() => setScreenModal(null)} onAddReport={() => { setReportForm({...EMPTY_REPORT, panta_uq: selScrUnico||""}); setReportModal({ mode: "add" }); }} onEditReport={(r: any) => { setReportForm({ unico: t(r.unico), panta_uq: t(r.panta_uq), nombre: t(r.nombre), titulo: t(r.titulo), path: t(r.path), descripcion: t(r.descripcion), fecha_desde: Boolean(r.fecha_desde), fecha_hasta: Boolean(r.fecha_hasta), numero_desde: Boolean(r.numero_desde), numero_hasta: Boolean(r.numero_hasta), actual: Boolean(r.actual), comprimido: Boolean(r.comprimido), detallado: Boolean(r.detallado), exportar: Boolean(r.exportar) }); setReportModal({ mode: "edit" }); }} onDeleteReport={(r: any) => { setReportForm(r); setDeleteRptDlg(true); }} />
            )}

            {/* "" Report Modal """"""""""""""""""""""""""""""""""""""""""""""" */}
            {reportModal && (
                <ReportFormModal mode={reportModal.mode} form={reportForm} setForm={setReportForm} saving={savingReport} onSave={saveReport} onClose={() => setReportModal(null)} />
            )}

            {/* "" Confirm dialogs """""""""""""""""""""""""""""""""""""""""""" */}
            {deleteModDlg && <ConfirmDelete title="Delete Module" msg={`Delete module "${t(modForm.nombre)}"? All screens must be removed first.`} onConfirm={deleteMod} onCancel={() => setDeleteModDlg(false)} saving={saving} />}
            {deleteScrDlg && <ConfirmDelete title="Remove Screen" msg={`Remove screen "${t(screenForm.nombre)}"? All reports must be removed first.`} onConfirm={deleteScreen} onCancel={() => setDeleteScrDlg(false)} saving={savingScreen} />}
            {deleteRptDlg && <ConfirmDelete title="Delete Report" msg={`Delete report "${t(reportForm.nombre)}"?`} onConfirm={deleteReport} onCancel={() => setDeleteRptDlg(false)} saving={savingReport} />}
            
            {/* ─── Mobile Action Bar (Bottom) ────────────────────────────────────────────── */}
            <div className={cn(
                "md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-in-out pb-4 pt-2 px-2",
                activeGrid ? "translate-y-0" : "translate-y-full"
            )}>
                <div className="flex items-center gap-1 overflow-x-auto px-4 scrollbar-none justify-center">
                    <div className="flex flex-col items-center justify-center gap-1 text-gray-400 shrink-0 mr-1">
                        {activeGrid === "screen" ? <Monitor size={20} className="text-blue-500 opacity-80" /> : <LayoutGrid size={20} className="text-[#FB7506] opacity-80" />}
                        <span className="text-[8px] font-black uppercase tracking-wider">{activeGrid === "screen" ? "Screen" : "Module"}</span>
                    </div>

                    <div className="w-px h-8 bg-gray-200 shrink-0 mx-2" />

                    <button onClick={activeGrid === "screen" ? handleEditScreen : handleEditModule} disabled={!perms.canEdit}
                        className="flex flex-col items-center gap-1 text-gray-600 disabled:opacity-50 transition-colors hover:text-[#FB7506] min-w-[56px] shrink-0">
                        <Pencil size={20} className={perms.canEdit ? "text-[#FB7506]" : "text-gray-400"} />
                        <span className="text-[9px] font-black uppercase tracking-wider">Edit</span>
                    </button>

                    <div className="w-px h-8 bg-gray-200 shrink-0 mx-2" />

                    <button onClick={activeGrid === "screen" ? handleRemoveScreen : handleRemoveModule} disabled={!perms.canDelete}
                        className="flex flex-col items-center gap-1 text-gray-600 disabled:opacity-50 transition-colors hover:text-red-600 min-w-[56px] shrink-0">
                        <Trash2 size={20} className={perms.canDelete ? "text-red-500" : "text-gray-400"} />
                        <span className="text-[9px] font-black uppercase tracking-wider">Delete</span>
                    </button>
                    
                    <div className="w-px h-8 bg-gray-200 shrink-0 mx-2" />

                    <button onClick={activeGrid === "screen" ? () => setSelScrUnico(null) : clearSelection}
                        className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-800 transition-colors min-w-[56px] shrink-0 pr-2">
                        <X size={20} />
                        <span className="text-[9px] font-black uppercase tracking-wider">Close</span>
                    </button>
                </div>
            </div>

            {/* ─── Mobile FAB (Add) ──────────────────────────────────────────────────────── */}
            <div className={cn("md:hidden fixed bottom-6 right-6 z-40 transition-all duration-300", activeGrid ? "opacity-0 translate-y-8 pointer-events-none" : "opacity-100 translate-y-0")}>
                {perms.canCreate && (
                    <button onClick={handleAddModule}
                        className="bg-[#01b763] hover:bg-[#01a056] text-white w-14 h-14 rounded-full shadow-[0_4px_12px_rgba(1,183,99,0.4)] flex items-center justify-center transition-transform transform active:scale-95">
                        <Plus size={28} />
                    </button>
                )}
            </div>
        </div>
    );
}


// """ Module Form Modal """"""""""""""""""""""""""""""""""""""""""""""""""""""""
function ModuleFormModal({ mode, form, setForm, onSave, onClose, saving }: any) {
    if (!mode) return null;
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 border-b border-black/10 shrink-0">
                    <div className="flex items-center gap-2">
                        <LayoutGrid size={16} className="text-[#FB7506]" />
                        <span className="fos-grid-header-text">{mode === "add" ? "New Module" : "Edit Module"}</span>
                    </div>
                    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors">
                        <X size={16} />
                    </button>
                </div>
                <div className="overflow-y-auto flex-1 p-4">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                        {[
                            { label: "Code",    key: "unico",  readonly: mode === "edit" },
                            { label: "Order",   key: "orden",  readonly: false, type: "number" },
                            { label: "Icon",    key: "image",  readonly: false },
                            { label: "DSN",     key: "dsn",    readonly: false },
                        ].map(f => (
                            <div key={f.key} className="flex flex-col gap-0.5">
                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">{f.label}</label>
                                <input type={f.type||"text"} value={(form as any)[f.key]||""} readOnly={f.readonly}
                                    onChange={e => setForm((prev: any) => ({...prev, [f.key]: e.target.value}))}
                                    className={cn("fos-input h-10 text-sm", f.readonly && "bg-gray-50 text-gray-500")} />
                            </div>
                        ))}
                        <div className="flex flex-col gap-0.5">
                            <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Class</label>
                            <select value={form.clase} onChange={e => setForm((p: any) => ({...p, clase: e.target.value}))} className="fos-input h-10 text-sm">
                                <option value="">-</option>
                                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center gap-4 pt-3">
                            {["active","web"].map(k => (
                                <label key={k} className="flex items-center gap-1.5 cursor-pointer">
                                    <input type="checkbox" checked={Boolean((form as any)[k])}
                                        disabled={k === "active" && mode === "add"}
                                        onChange={e => setForm((p: any) => ({...p, [k]: e.target.checked}))}
                                        className="w-4 h-4 accent-[#FB7506]" />
                                    <span className="text-xs font-semibold text-gray-600 uppercase">{k}</span>
                                </label>
                            ))}
                        </div>
                        <div className="flex flex-col gap-0.5 col-span-2">
                            <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Module Name</label>
                            <input value={form.nombre}
                                onChange={e => setForm((p: any) => ({...p, nombre: e.target.value}))}
                                className="fos-input h-10 text-sm" />
                        </div>
                        <div className="flex flex-col gap-0.5 col-span-2">
                            <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Description</label>
                            <input value={form.descripcion}
                                onChange={e => setForm((p: any) => ({...p, descripcion: e.target.value}))}
                                className="fos-input h-10 text-sm" />
                        </div>
                    </div>
                </div>
                <div className="shrink-0 p-4 bg-white border-t border-gray-100">
                    <button onClick={onSave} disabled={saving}
                        className="w-full h-12 bg-[#FB7506] hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2">
                        {saving ? <RefreshCcw size={16} className="animate-spin" /> : <Save size={16} />}
                        {saving ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// """ Screen Form Modal """"""""""""""""""""""""""""""""""""""""""""""""""""""""
function ScreenFormModal({ mode, form, setForm, saving, modName, reports, loadingRpt, onSave, onClose, onAddReport, onEditReport, onDeleteReport }: any) {
    const [selRpt, setSelRpt] = useState<string | null>(null);
    const hasWebForm = form.web_form.trim();
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 border-b border-black/10 shrink-0">
                    <div className="flex items-center gap-2">
                        <Monitor size={16} className="text-[#FB7506]" />
                        <span className="fos-grid-header-text">{mode === "add" ? "Add Screen" : "Edit Screen"}</span>
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
                        <div className="flex flex-col gap-0.5 col-span-2">
                            <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Title</label>
                            <input value={form.nombre} onChange={e => setForm((p: any) => ({...p, nombre: e.target.value}))} className="fos-input h-10 text-sm" />
                        </div>

                        <div className="col-span-2 grid grid-cols-3 gap-3">
                            <div className="flex flex-col gap-0.5 col-span-2">
                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Route (Web App) - overrides below</label>
                                <input value={form.web_form} onChange={e => setForm((p: any) => ({...p, web_form: e.target.value}))} className="fos-input h-10 text-sm text-blue-600 font-medium" placeholder="/sales or /masters/items" />
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Order</label>
                                <input type="number" value={form.orden} onChange={e => setForm((p: any) => ({...p, orden: e.target.value}))} className="fos-input h-10 text-sm" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-0.5">
                            <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Component (Desktop)</label>
                            <input disabled={hasWebForm} value={form.run_pantalla} onChange={e => setForm((p: any) => ({...p, run_pantalla: e.target.value}))} className="fos-input h-10 text-sm" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Program / Module folder</label>
                            <input disabled={hasWebForm} value={form.executable} onChange={e => setForm((p: any) => ({...p, executable: e.target.value}))} className="fos-input h-10 text-sm" />
                        </div>
                        <div className="flex flex-col gap-0.5 col-span-2">
                            <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Icon</label>
                            <input value={form.image} onChange={e => setForm((p: any) => ({...p, image: e.target.value}))} className="fos-input h-10 text-sm" />
                        </div>

                        <div className="flex flex-col gap-0.5 col-span-2">
                            <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Description</label>
                            <input value={form.descripcion} onChange={e => setForm((p: any) => ({...p, descripcion: e.target.value}))} className="fos-input h-10 text-sm" />
                        </div>
                        <div className="flex items-center gap-1.5 pt-2 col-span-2">
                            <input type="checkbox" id="scrmenu" checked={Boolean(form.menu)} onChange={e => setForm((p: any) => ({...p, menu: e.target.checked}))} className="w-4 h-4 accent-[#FB7506]" />
                            <label htmlFor="scrmenu" className="text-xs font-semibold text-gray-600 uppercase cursor-pointer">Visible in Menu</label>
                        </div>
                    </div>

                    {mode === "edit" && (
                        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col min-h-0">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                    <FileText size={16} className="text-[#FB7506]" /> Reports
                                </h3>
                                <div className="flex gap-2">
                                    <button onClick={onAddReport} className="text-[10px] uppercase font-black tracking-wider bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded transition-colors flex items-center gap-1">
                                        <Plus size={12} /> Add
                                    </button>
                                </div>
                            </div>
                            <div className="border border-gray-200 rounded overflow-auto max-h-[200px]">
                                {loadingRpt ? (
                                    <div className="p-4 text-center text-xs text-gray-400 animate-pulse">Loading...</div>
                                ) : reports.length === 0 ? (
                                    <div className="p-4 text-center text-xs text-gray-400">No reports configured.</div>
                                ) : (
                                    <table className="min-w-full text-xs text-left">
                                        <thead className="bg-gray-50 border-b">
                                            <tr className="text-gray-500 uppercase tracking-wider">
                                                <th className="p-2 font-black">Title</th>
                                                <th className="p-2 font-black border-l">Path</th>
                                                <th className="p-2 font-black border-l text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reports.map((r: any) => (
                                                <tr key={r.unico} onClick={() => setSelRpt(r.unico)} onDoubleClick={() => onEditReport(r)}
                                                    className={cn("border-b cursor-pointer transition-colors", selRpt === r.unico ? "bg-blue-50" : "hover:bg-gray-50")}>
                                                    <td className="p-2 font-semibold text-gray-700 truncate max-w-[150px]">{t(r.titulo)}</td>
                                                    <td className="p-2 text-gray-500 border-l truncate max-w-[200px]">{t(r.path)}</td>
                                                    <td className="p-1 border-l text-center">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <button onClick={(e) => { e.stopPropagation(); onEditReport(r); }} className="p-1 text-blue-500 hover:bg-blue-100 rounded" title="Edit"><Pencil size={12} /></button>
                                                            <button onClick={(e) => { e.stopPropagation(); onDeleteReport(r); }} className="p-1 text-red-500 hover:bg-red-100 rounded" title="Delete"><Trash2 size={12} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="shrink-0 p-4 bg-white border-t border-gray-100">
                    <button onClick={onSave} disabled={saving}
                        className="w-full h-12 bg-[#FB7506] hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2">
                        {saving ? <RefreshCcw size={16} className="animate-spin" /> : <Save size={16} />}
                        {saving ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// """ Report Form Modal """"""""""""""""""""""""""""""""""""""""""""""""""""""""
function ReportFormModal({ mode, form, setForm, saving, onSave, onClose }: any) {
    if (!mode) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
                <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 border-b border-black/10 shrink-0">
                    <div className="flex items-center gap-2">
                        <FileText size={16} className="text-[#FB7506]" />
                        <span className="fos-grid-header-text">{mode === "add" ? "Add Report" : "Edit Report"}</span>
                    </div>
                    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors">
                        <X size={16} />
                    </button>
                </div>
                <div className="p-4 space-y-3 text-xs overflow-y-auto max-h-[80vh]">
                    <div className="flex flex-col gap-0.5">
                        <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Report Internal Name</label>
                        <input value={form.nombre} onChange={e => setForm((p: any) => ({...p, nombre: e.target.value}))} className="fos-input h-10 text-sm" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Display Title</label>
                        <input value={form.titulo} onChange={e => setForm((p: any) => ({...p, titulo: e.target.value}))} className="fos-input h-10 text-sm" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">File Path (.FRX)</label>
                        <input value={form.path} onChange={e => setForm((p: any) => ({...p, path: e.target.value}))} className="fos-input h-10 text-sm" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Description</label>
                        <input value={form.descripcion} onChange={e => setForm((p: any) => ({...p, descripcion: e.target.value}))} className="fos-input h-10 text-sm" />
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                        <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider mb-2 block">Parameters / Options</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-2">
                            {["fecha_desde", "fecha_hasta", "numero_desde", "numero_hasta", "actual", "comprimido", "detallado", "exportar"].map(k => (
                                <label key={k} className="flex items-center gap-1.5 cursor-pointer">
                                    <input type="checkbox" checked={Boolean((form as any)[k])} onChange={e => setForm((p: any) => ({...p, [k]: e.target.checked}))} className="w-4 h-4 accent-[#FB7506]" />
                                    <span className="text-[10px] font-semibold text-gray-600 uppercase truncate" title={k.replace("_"," ")}>{k.replace("_"," ")}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="shrink-0 p-4 bg-gray-50 border-t border-gray-100">
                    <button onClick={onSave} disabled={saving} className="w-full h-12 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2">
                        {saving ? <RefreshCcw size={16} className="animate-spin" /> : <Save size={16} />} Save
                    </button>
                </div>
            </div>
        </div>
    );
}

// """ Confirm Delete Dialog """""""""""""""""""""""""""""""""""""""""""""""""
function ConfirmDelete({ title, msg, onConfirm, onCancel, saving }: any) {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                <div className="h-10 bg-red-50 flex items-center pl-3 pr-2 border-b border-red-100 shrink-0">
                    <span className="text-red-600 font-bold tracking-wide text-sm flex items-center gap-2">
                        <AlertCircle size={16} />
                        {title}
                    </span>
                </div>
                <div className="p-5 text-sm text-gray-700 font-medium">
                    {msg}
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
                    <button onClick={onCancel} disabled={saving} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50 uppercase tracking-wider">
                        Cancel
                    </button>
                    <button onClick={onConfirm} disabled={saving} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded shadow-sm flex items-center gap-2 text-sm font-bold transition-all disabled:opacity-50 uppercase tracking-wider">
                        {saving ? <RefreshCcw size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
