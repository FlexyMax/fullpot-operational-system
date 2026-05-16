"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    ArrowLeft, Save, X, RefreshCcw, Building2,
    ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight,
    Camera, Check, AlertCircle, XCircle, Plus, Pencil,
    Trash2, Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuditLog } from "@/lib/audit";
import { AuditLogModal } from "@/components/AuditLogModal";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const t   = (v: any) => String(v ?? "").trim();
const sF  = async (url: string) => { const r = await fetch(url); const j = await r.json(); if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`); return j; };

const EMPTY = {
    unico:"", ruc:"", nombre:"", pais:"", ciudad:"", direccion:"",
    telefono1:"", telefono2:"", fax1:"", fax2:"", apostal:"",
    email:"", image:"", basedatos:"", datapath:"", servidor:"",
    dsn:"", active:true, website:"",
};

type Mode = "view" | "add" | "edit";

// ─── GridMenu (Appsmith style) ────────────────────────────────────────────────
function GridMenu({ items }: { items: { label: string; icon: any; color: string; onClick: () => void; disabled?: boolean }[] }) {
    const [open, setOpen] = useState(false);
    const COLORS: Record<string,{icon:string;text:string}> = {
        green:  {icon:"text-green-600", text:"text-green-700"},
        blue:   {icon:"text-blue-500",  text:"text-gray-800"},
        red:    {icon:"text-red-500",   text:"text-gray-400"},
        gray:   {icon:"text-gray-400",  text:"text-gray-400"},
    };
    return (
        <div className="relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setOpen(o => !o)}
                className="h-10 bg-[#FB7506] hover:bg-orange-600 text-white w-24 flex items-center justify-center transition-colors rounded-tr-lg"
                title="Menu">
                <Menu size={20} />
            </button>
            {open && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-2xl z-50 overflow-hidden"
                    onMouseLeave={() => setOpen(false)}>
                    {items.map((item, i) => {
                        const c = COLORS[item.color] || COLORS.gray;
                        return (
                            <button key={i} onClick={() => { item.onClick(); setOpen(false); }}
                                disabled={!!item.disabled}
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
export default function CompaniesDefinitionPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const qc     = useQueryClient();
    const { logAction } = useAuditLog("companies-definition", "empresas");
    const fileRef = useRef<HTMLInputElement>(null);

    const [mode,        setMode]       = useState<Mode>("view");
    const [currentIdx,  setCurrentIdx] = useState(0);
    const [form,        setForm]       = useState<any>(EMPTY);
    const [formError,   setFormError]  = useState<string | null>(null);
    const [saveMsg,     setSaveMsg]    = useState<string | null>(null);
    const [saving,      setSaving]     = useState(false);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [logoFile,    setLogoFile]   = useState<File | null>(null);

    useEffect(() => { if (status === "unauthenticated") router.push("/login"); }, [status, router]);

    // ── Queries ───────────────────────────────────────────────────────────────
    const { data: companies = [], isFetching: loadingList } = useQuery({
        queryKey: ["sys-companies-list"],
        queryFn:  () => sF("/api/system/companies"),
    });

    // Auto-select first company on load
    useEffect(() => {
        if ((companies as any[]).length > 0) loadCompany(0);
    }, [companies]);

    const loadCompany = async (idx: number) => {
        const list = companies as any[];
        if (!list[idx]) return;
        setCurrentIdx(idx);
        try {
            const data = await sF(`/api/system/companies/${list[idx].unico}`);
            if (data) setForm({
                unico:     t(data.unico),
                ruc:       t(data.ruc),
                nombre:    t(data.nombre),
                pais:      t(data.pais),
                ciudad:    t(data.ciudad),
                direccion: t(data.direccion),
                telefono1: t(data.telefono1),
                telefono2: t(data.telefono2),
                fax1:      t(data.fax1),
                fax2:      t(data.fax2),
                apostal:   t(data.apostal),
                email:     t(data.email),
                image:     t(data.image),
                basedatos: t(data.basedatos),
                datapath:  t(data.datapath),
                servidor:  t(data.servidor),
                dsn:       t(data.dsn),
                active:    Boolean(data.active),
                website:   t(data.website),
            });
            setLogoPreview(null); setLogoFile(null); setFormError(null);
        } catch {}
    };

    // ── Navigation ────────────────────────────────────────────────────────────
    const list = companies as any[];
    const goFirst = () => loadCompany(0);
    const goPrev  = () => loadCompany(Math.max(0, currentIdx - 1));
    const goNext  = () => loadCompany(Math.min(list.length - 1, currentIdx + 1));
    const goLast  = () => loadCompany(list.length - 1);

    // ── Validation ────────────────────────────────────────────────────────────
    const validate = () => {
        if (!form.nombre.trim())    return "Company name is empty.";
        if (!form.basedatos.trim()) return "Data Base Company is empty.";
        if (!form.servidor.trim())  return "Server name is empty.";
        if (!form.dsn.trim())       return "DSN name is empty.";
        return null;
    };

    // ── Save ──────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        const err = validate(); if (err) { setFormError(err); return; }
        setSaving(true); setFormError(null);
        try {
            let unico = form.unico;
            if (mode === "add") {
                const res  = await fetch("/api/system/companies", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
                const data = await res.json(); if (!data.success) throw new Error(data.error);
                unico = data.unico;
                logAction("Insert", unico);
            } else {
                const res  = await fetch(`/api/system/companies/${unico}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
                const data = await res.json(); if (!data.success) throw new Error(data.error);
                logAction("Edit", unico);
            }
            // Upload logo if selected
            if (logoFile && unico) {
                const fd = new FormData(); fd.append("logo", logoFile);
                await fetch(`/api/system/companies/${unico}/logo`, { method:"POST", body:fd });
            }
            await qc.invalidateQueries({ queryKey: ["sys-companies-list"] });
            setSaveMsg(mode === "add" ? "Company created." : "Company updated.");
            setTimeout(() => setSaveMsg(null), 3000);
            setMode("view"); setLogoFile(null);
        } catch (e: any) { setFormError(e.message); }
        finally { setSaving(false); }
    };

    const handleCancel = () => {
        if (list[currentIdx]) loadCompany(currentIdx);
        else setForm(EMPTY);
        setMode("view"); setFormError(null); setLogoFile(null); setLogoPreview(null);
    };

    const selectedUnico = list[currentIdx]?.unico || null;
    const isEditing     = mode !== "view";
    const logoSrc       = logoPreview ? logoPreview : (selectedUnico ? `/api/system/companies/${selectedUnico}/logo` : null);

    if (status === "loading") return null;

    return (
        <div className="flex flex-col h-screen bg-[#f4f6f8] overflow-hidden font-sans text-[#333]">

            {/* Header */}
            <div className="h-10 bg-[#374151] flex items-center justify-between px-4 shrink-0 text-white">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.push("/menu")} className="hover:bg-white/10 p-1 rounded transition-colors"><ArrowLeft size={16} /></button>
                    <Building2 size={14} className="text-[#FB7506]" />
                    <span className="font-black text-xs uppercase tracking-widest">Companies Definition</span>
                </div>
                <span className="text-gray-400 text-[10px] font-bold">User: <span className="text-white">{session?.user?.name}</span></span>
            </div>

            {/* Main layout */}
            <div className="flex flex-1 overflow-hidden gap-2 p-2">

                {/* ── Left: Company List ──────────────────────────────────── */}
                <div className="w-56 shrink-0 flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="h-8 bg-[#374151] flex items-center justify-between px-3 shrink-0">
                        <div className="flex items-center gap-2">
                            <Building2 size={12} className="text-[#FB7506]" />
                            <span className="font-black text-[10px] uppercase tracking-widest text-white">Companies</span>
                        </div>
                        {loadingList && <RefreshCcw size={10} className="text-gray-400 animate-spin" />}
                    </div>
                    <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
                        {list.map((c: any, i: number) => (
                            <div key={c.unico} onClick={() => { if (!isEditing) loadCompany(i); }}
                                className={cn("flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-colors text-sm",
                                    i === currentIdx ? "bg-blue-50 border-l-[3px] border-l-blue-500 font-semibold text-blue-800" : "hover:bg-gray-50 border-l-[3px] border-l-transparent text-gray-700",
                                    isEditing && "cursor-not-allowed opacity-60")}>
                                <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", c.active ? "bg-green-400" : "bg-gray-300")} />
                                {t(c.nombre)}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Right: Form ─────────────────────────────────────────── */}
                <div className="flex-1 flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden min-w-0">

                    {/* Form header bar */}
                    <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 shrink-0 rounded-t-lg">
                        <div className="flex items-center gap-2 min-w-0">
                            <Building2 size={14} className="text-[#FB7506]" />
                            <span className="font-black text-[11px] uppercase tracking-widest text-white truncate">
                                {mode === "add" ? "New Company" : t(form.nombre) || "Company Details"}
                            </span>
                            <AuditLogModal recordId={selectedUnico} disabled={!selectedUnico} />
                            {formError && <span className="flex items-center gap-1 text-amber-400 text-[9px] font-bold ml-2 truncate"><AlertCircle size={10} />{formError}</span>}
                            {saveMsg   && <span className="flex items-center gap-1 text-green-400 text-[9px] font-bold ml-2"><Check size={10} />{saveMsg}</span>}
                        </div>
                        <div className="flex items-center">
                            {/* Navigation buttons (view mode only) */}
                            {!isEditing && (
                                <div className="flex items-center border-r border-white/20">
                                    {[
                                        { icon: ChevronsLeft,  fn: goFirst, title: "First",    disabled: currentIdx === 0 },
                                        { icon: ChevronLeft,   fn: goPrev,  title: "Previous", disabled: currentIdx === 0 },
                                        { icon: ChevronRight,  fn: goNext,  title: "Next",     disabled: currentIdx >= list.length - 1 },
                                        { icon: ChevronsRight, fn: goLast,  title: "Last",     disabled: currentIdx >= list.length - 1 },
                                    ].map(({ icon: Icon, fn, title, disabled }) => (
                                        <button key={title} onClick={fn} disabled={disabled} title={title}
                                            className="w-8 h-10 flex items-center justify-center text-white hover:bg-white/10 disabled:opacity-30 transition-colors">
                                            <Icon size={14} />
                                        </button>
                                    ))}
                                    <span className="text-[9px] text-gray-400 font-bold px-2">{list.length > 0 ? `${currentIdx + 1} / ${list.length}` : "0"}</span>
                                </div>
                            )}
                            {/* Save / Cancel in edit mode */}
                            {isEditing && (
                                <div className="flex items-center gap-1 px-2 border-r border-white/20">
                                    <button onClick={handleSave} disabled={saving}
                                        className="flex items-center gap-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all">
                                        {saving ? <RefreshCcw size={10} className="animate-spin" /> : <Save size={10} />}{saving ? "..." : "Save"}
                                    </button>
                                    <button onClick={handleCancel}
                                        className="flex items-center gap-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all">
                                        <X size={10} /> Cancel
                                    </button>
                                </div>
                            )}
                            {/* MENU button */}
                            <GridMenu items={[
                                { label: "Add Company",   icon: Plus,   color: "green", onClick: () => { setForm({...EMPTY}); setLogoPreview(null); setLogoFile(null); setMode("add"); setFormError(null); } },
                                { label: "Edit Company",  icon: Pencil, color: "blue",  onClick: () => { if (list[currentIdx]) setMode("edit"); }, disabled: !selectedUnico || isEditing },
                                { label: "Delete",        icon: Trash2, color: "gray",  onClick: () => setFormError("Instruction isn't enabled. / Instrucción no disponible."), disabled: true },
                            ]} />
                        </div>
                    </div>

                    {/* Form body */}
                    <div className="overflow-auto flex-1 p-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">

                            {/* Code */}
                            <F label="Code" value={form.unico} readOnly />

                            {/* RUC */}
                            <F label="R.U.C." value={form.ruc} readOnly={!isEditing}
                                onChange={v => setForm((p:any) => ({...p, ruc:v}))} />

                            {/* Company Name — spans 2 */}
                            <F label="Company *" value={form.nombre} readOnly={!isEditing}
                                onChange={v => setForm((p:any) => ({...p, nombre:v}))} span2 />

                            {/* Address — spans full */}
                            <div className="col-span-2 sm:col-span-3 lg:col-span-4 flex flex-col gap-0.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Address</label>
                                <textarea value={form.direccion} readOnly={!isEditing} rows={2}
                                    onChange={e => setForm((p:any) => ({...p, direccion:e.target.value}))}
                                    className={cn("fos-input resize-none", !isEditing && "bg-gray-50 text-gray-600")} />
                            </div>

                            <F label="Country" value={form.pais}     readOnly={!isEditing} onChange={v => setForm((p:any)=>({...p,pais:v}))} />
                            <F label="City"    value={form.ciudad}   readOnly={!isEditing} onChange={v => setForm((p:any)=>({...p,ciudad:v}))} />
                            <F label="Phone"   value={form.telefono1}readOnly={!isEditing} onChange={v => setForm((p:any)=>({...p,telefono1:v}))} />
                            <F label="Phone 2" value={form.telefono2}readOnly={!isEditing} onChange={v => setForm((p:any)=>({...p,telefono2:v}))} />
                            <F label="Fax"     value={form.fax1}     readOnly={!isEditing} onChange={v => setForm((p:any)=>({...p,fax1:v}))} />
                            <F label="Fax 2"   value={form.fax2}     readOnly={!isEditing} onChange={v => setForm((p:any)=>({...p,fax2:v}))} />
                            <F label="E-mail"  value={form.email}    readOnly={!isEditing} onChange={v => setForm((p:any)=>({...p,email:v}))} span2 />
                            <F label="Web Site" value={form.website} readOnly={!isEditing} onChange={v => setForm((p:any)=>({...p,website:v}))} span2 />
                            <F label="Data Path" value={form.datapath}readOnly={!isEditing} onChange={v => setForm((p:any)=>({...p,datapath:v}))} span2 />

                            {/* D Base + disabled button */}
                            <div className="flex flex-col gap-0.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">D Base *</label>
                                <div className="flex gap-1">
                                    <input value={form.basedatos} readOnly={!isEditing}
                                        onChange={e => setForm((p:any)=>({...p,basedatos:e.target.value}))}
                                        className={cn("fos-input text-xs py-1 flex-1 min-w-0", !isEditing && "bg-gray-50 text-gray-600")} />
                                    <button disabled title="Not available in web version" className="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-[9px] text-gray-400 cursor-not-allowed">…</button>
                                </div>
                            </div>

                            <F label="P.O. Box" value={form.apostal}  readOnly={!isEditing} onChange={v => setForm((p:any)=>({...p,apostal:v}))} />

                            {/* Server + disabled button */}
                            <div className="flex flex-col gap-0.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Server *</label>
                                <div className="flex gap-1">
                                    <input value={form.servidor} readOnly={!isEditing}
                                        onChange={e => setForm((p:any)=>({...p,servidor:e.target.value}))}
                                        className={cn("fos-input text-xs py-1 flex-1 min-w-0", !isEditing && "bg-gray-50 text-gray-600")} />
                                    <button disabled title="Not available in web version" className="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-[9px] text-gray-400 cursor-not-allowed">…</button>
                                </div>
                            </div>

                            <F label="DSN *" value={form.dsn} readOnly={!isEditing} onChange={v => setForm((p:any)=>({...p,dsn:v}))} />

                            {/* Active */}
                            <div className="flex flex-col gap-0.5 justify-end">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Active</label>
                                <label className="flex items-center gap-2 cursor-pointer h-[28px]">
                                    <input type="checkbox" checked={Boolean(form.active)}
                                        disabled={mode !== "edit"}
                                        onChange={e => setForm((p:any) => ({...p, active:e.target.checked}))}
                                        className="w-4 h-4 accent-[#FB7506]" />
                                    <span className={cn("text-xs font-semibold", form.active ? "text-green-600" : "text-gray-400")}>
                                        {form.active ? "Yes" : "No"}
                                    </span>
                                </label>
                            </div>

                            {/* Logo */}
                            <div className="col-span-2 flex items-start gap-3 pt-2 border-t border-gray-100">
                                <div className="w-20 h-20 rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center shrink-0">
                                    {logoSrc ? (
                                        <img src={logoSrc} alt="Logo" className="w-full h-full object-contain"
                                            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                                    ) : (
                                        <Building2 size={32} className="text-gray-200" />
                                    )}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Logo</span>
                                    {isEditing && (
                                        <button onClick={() => fileRef.current?.click()}
                                            className="flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-[9px] font-black uppercase tracking-wide transition-all">
                                            <Camera size={10} /> Insert Picture
                                        </button>
                                    )}
                                    <input ref={fileRef} type="file" accept="image/*" className="hidden"
                                        onChange={e => {
                                            const f = e.target.files?.[0];
                                            if (!f) return;
                                            setLogoFile(f); setLogoPreview(URL.createObjectURL(f));
                                        }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="h-8 bg-gray-100 border-t px-4 flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-tight shrink-0">
                <div className="flex gap-4"><span>Server: Production</span><span className="text-gray-300">|</span><span>Database: Sistema</span></div>
                <span className="text-[#FB7506]">FOS System Management V.2.0.1</span>
            </div>
        </div>
    );
}

// ─── Field helper ─────────────────────────────────────────────────────────────
function F({ label, value, onChange, readOnly, span2 }: {
    label: string; value: string; onChange?: (v: string) => void;
    readOnly?: boolean; span2?: boolean;
}) {
    return (
        <div className={cn("flex flex-col gap-0.5", span2 && "col-span-2")}>
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
            <input type="text" value={value || ""} readOnly={!!readOnly}
                onChange={e => onChange?.(e.target.value)}
                className={cn("fos-input text-xs py-1", readOnly && "bg-gray-50 text-gray-600 cursor-default")} />
        </div>
    );
}
