"use client";

import { useEffect, useState, useRef, Fragment } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    Building2, Plus, Pencil, Trash2, Save, X, RefreshCcw,
    AlertCircle, Camera, Check, XCircle
} from "lucide-react";

import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import PanelGrid from "@/components/ui/PanelGrid";
import { PanelGridTable, PanelGridThead, PanelGridTbody, PanelGridTh, PanelGridTr, PanelGridTd } from "@/components/ui/PanelGridTable";
import { ConfirmDelete } from "@/components/ConfirmDelete";
import { cn } from "@/lib/utils";
import { useAuditLog } from "@/lib/audit";
import { usePagePermissions } from "@/lib/permissions";
import { useCompanyStore } from "@/store/system/useCompanyStore";

const EMPTY_ARR: any[] = [];
const t = (v: any) => String(v ?? "").trim();
const sysFetch = async (url: string) => {
    const r = await fetch(url);
    const j = await r.json();
    if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`);
    return j;
};

const EMPTY_COMPANY = {
    unico:"", ruc:"", nombre:"", pais:"", ciudad:"", direccion:"",
    telefono1:"", telefono2:"", fax1:"", fax2:"", apostal:"",
    email:"", image:"", basedatos:"", datapath:"", servidor:"",
    dsn:"", active:true, website:"",
};

export default function CompaniesPage() {
    const { status } = useSession();
    const router = useRouter();
    const qc = useQueryClient();
    const { logAction } = useAuditLog("companies-definition", "empresas");
    const perms = usePagePermissions("companies-definition");

    const {
        selCompanyUnico, setSelCompanyUnico, activeGrid, clearSelection,
        companySearch, setCompanySearch
    } = useCompanyStore();

    const [formModal, setFormModal] = useState<{mode:"add"|"edit"}|null>(null);
    const [form, setForm] = useState<any>(EMPTY_COMPANY);
    const [saving, setSaving] = useState(false);
    const [deleteDlg, setDeleteDlg] = useState(false);

    useEffect(() => { if (status === "unauthenticated") router.push("/login"); }, [status, router]);

    // "" Queries """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
    const { data: companies = EMPTY_ARR, isFetching: loadingCompanies } = useQuery({ 
        queryKey: ["sys-companies"], 
        queryFn: () => sysFetch("/api/system/companies") 
    });

    // Auto-select
    useEffect(() => {
        if ((companies as any[]).length > 0 && !selCompanyUnico) setSelCompanyUnico((companies as any[])[0].unico);
    }, [companies, selCompanyUnico, setSelCompanyUnico]);

    const selCompany = (companies as any[]).find((c: any) => c.unico === selCompanyUnico);

    // "" CRUD """"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
    const validate = () => {
        if (!form.nombre?.trim()) return "Company name is required.";
        if (!form.basedatos?.trim()) return "Data Base Company is required.";
        if (!form.servidor?.trim()) return "Server name is required.";
        if (!form.dsn?.trim()) return "DSN name is required.";
        return null;
    };

    const saveCompany = async (formData: any, logoFile: File | null) => {
        const err = validate(); if (err) { toast.error(err); return; }
        setSaving(true);
        try {
            let unico = selCompanyUnico;
            if (formModal?.mode === "add") {
                const res = await fetch("/api/system/companies", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
                const data = await res.json(); if (!data.success) throw new Error(data.error); unico = data.unico;
            } else {
                const res = await fetch(`/api/system/companies/${unico}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
                const data = await res.json(); if (!data.success) throw new Error(data.error);
            }

            // Upload logo if selected
            if (logoFile && unico) {
                const fd = new FormData(); fd.append("logo", logoFile);
                await fetch(`/api/system/companies/${unico}/logo`, { method:"POST", body:fd });
            }

            logAction(formModal?.mode === "add" ? "Insert" : "Edit", unico!);
            await qc.invalidateQueries({ queryKey: ["sys-companies"] });
            setSelCompanyUnico(unico); setFormModal(null);
            toast.success(formModal?.mode === "add" ? "Company created." : "Company updated.");
        } catch (e: any) { toast.error(e.message); }
        finally { setSaving(false); }
    };

    const deleteCompany = async () => {
        if (!selCompanyUnico) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/system/companies/${selCompanyUnico}`, { method: "DELETE" });
            const data = await res.json(); if (!data.success) throw new Error(data.error);
            logAction("Delete", selCompanyUnico!);
            await qc.invalidateQueries({ queryKey: ["sys-companies"] });
            setSelCompanyUnico(null); setForm(EMPTY_COMPANY); setDeleteDlg(false);
            toast.success("Company deleted.");
        } catch (e: any) { toast.error(e.message); setDeleteDlg(false); }
        finally { setSaving(false); }
    };

    // "" Handlers """"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
    const handleAdd = () => { setForm({ ...EMPTY_COMPANY }); setFormModal({ mode: "add" }); };
    
    const handleEdit = async () => {
        if (!selCompanyUnico) return;
        try {
            const data = await sysFetch(`/api/system/companies/${selCompanyUnico}`);
            if (data) {
                setForm({
                    unico: t(data.unico), ruc: t(data.ruc), nombre: t(data.nombre), pais: t(data.pais),
                    ciudad: t(data.ciudad), direccion: t(data.direccion), telefono1: t(data.telefono1),
                    telefono2: t(data.telefono2), fax1: t(data.fax1), fax2: t(data.fax2), apostal: t(data.apostal),
                    email: t(data.email), image: t(data.image), basedatos: t(data.basedatos),
                    datapath: t(data.datapath), servidor: t(data.servidor), dsn: t(data.dsn),
                    active: Boolean(data.active), website: t(data.website),
                });
                setFormModal({ mode: "edit" });
            }
        } catch (e: any) { toast.error(e.message); }
    };

    const handleRemove = () => { if (selCompanyUnico) setDeleteDlg(true); };

    // "" Filter """"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
    const filteredCompanies = (companies as any[]).filter(c => {
        if (!companySearch) return true;
        const q = companySearch.toLowerCase();
        return (c.nombre || "").toLowerCase().includes(q) || (c.ruc || "").toLowerCase().includes(q);
    });

    if (status === "loading") return null;

    return (
        <div className="flex flex-col h-[100dvh] bg-[#f4f6f8] overflow-hidden font-sans text-[#333]">
            <AppHeader title="Companies" />

            <div className="flex flex-1 overflow-hidden p-2">
                <PanelGrid
                    title="Companies"
                    icon={Building2}
                    recordCount={filteredCompanies.length}
                    refreshing={loadingCompanies}
                    searchValue={companySearch}
                    onSearchChange={setCompanySearch}
                    menuItems={[
                        { label: "Add Company", icon: Plus, color: "green", onClick: handleAdd, disabled: !perms.canCreate },
                        { label: "Edit Company", icon: Pencil, color: "orange", onClick: handleEdit, disabled: !selCompanyUnico || !perms.canEdit },
                        { label: "Delete Company", icon: Trash2, color: "red", onClick: handleRemove, disabled: !selCompanyUnico || !perms.canDelete, separator: true }
                    ]}
                    className="flex-1"
                >
                    <div className="h-full overflow-auto">
                        <PanelGridTable>
                            <PanelGridThead>
                                <PanelGridTh>Code</PanelGridTh>
                                <PanelGridTh>R.U.C.</PanelGridTh>
                                <PanelGridTh>Company</PanelGridTh>
                                <PanelGridTh>Country</PanelGridTh>
                                <PanelGridTh>City</PanelGridTh>
                                <PanelGridTh>Phone</PanelGridTh>
                                <PanelGridTh>E-mail</PanelGridTh>
                                <PanelGridTh>Active</PanelGridTh>
                            </PanelGridThead>
                            <PanelGridTbody>
                                {filteredCompanies.map((c: any) => {
                                    const isSel = activeGrid === "company" && selCompanyUnico === c.unico;
                                    return (
                                        <PanelGridTr key={c.unico} selected={isSel} onClick={() => isSel ? clearSelection() : setSelCompanyUnico(c.unico)} onDoubleClick={handleEdit}>
                                            <PanelGridTd className="font-semibold text-gray-800">{t(c.unico)}</PanelGridTd>
                                            <PanelGridTd className="text-gray-500">{t(c.ruc)}</PanelGridTd>
                                            <PanelGridTd className="font-semibold text-blue-700">{t(c.nombre)}</PanelGridTd>
                                            <PanelGridTd className="text-gray-500">{t(c.pais)}</PanelGridTd>
                                            <PanelGridTd className="text-gray-500">{t(c.ciudad)}</PanelGridTd>
                                            <PanelGridTd className="text-gray-500">{t(c.telefono1)}</PanelGridTd>
                                            <PanelGridTd className="text-blue-600">{t(c.email)}</PanelGridTd>
                                            <PanelGridTd>
                                                {c.active ? <Check size={14} className="text-green-500" /> : <span className="text-gray-400 text-[10px] font-bold">No</span>}
                                            </PanelGridTd>
                                        </PanelGridTr>
                                    );
                                })}
                            </PanelGridTbody>
                        </PanelGridTable>
                    </div>
                </PanelGrid>
            </div>

            {/* ─── Mobile Action Bar (Bottom) ────────────────────────────────────────────── */}
            <div className={cn(
                "md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-in-out pb-4 pt-2 px-2",
                activeGrid === "company" ? "translate-y-0" : "translate-y-full"
            )}>
                <div className="flex items-center gap-1 overflow-x-auto px-4 scrollbar-none justify-center">
                    <button onClick={handleEdit} disabled={!perms.canEdit}
                        className="flex flex-col items-center gap-1 text-gray-600 disabled:opacity-50 transition-colors hover:text-[#FB7506] min-w-[56px] shrink-0">
                        <Pencil size={20} className={perms.canEdit ? "text-[#FB7506]" : "text-gray-400"} />
                        <span className="text-[9px] font-black uppercase tracking-wider">Edit</span>
                    </button>

                    <div className="w-px h-8 bg-gray-200 shrink-0 mx-2" />

                    <button onClick={handleRemove} disabled={!perms.canDelete}
                        className="flex flex-col items-center gap-1 text-gray-600 disabled:opacity-50 transition-colors hover:text-red-600 min-w-[56px] shrink-0">
                        <Trash2 size={20} className={perms.canDelete ? "text-red-500" : "text-gray-400"} />
                        <span className="text-[9px] font-black uppercase tracking-wider">Delete</span>
                    </button>
                    
                    <div className="w-px h-8 bg-gray-200 shrink-0 mx-2" />

                    <button onClick={clearSelection}
                        className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-800 transition-colors min-w-[56px] shrink-0 pr-2">
                        <X size={20} />
                        <span className="text-[9px] font-black uppercase tracking-wider">Close</span>
                    </button>
                </div>
            </div>

            {/* ─── Mobile FAB (Add) ──────────────────────────────────────────────────────── */}
            <div className={cn("md:hidden fixed bottom-6 right-6 z-40 transition-all duration-300", activeGrid === "company" ? "opacity-0 translate-y-8 pointer-events-none" : "opacity-100 translate-y-0")}>
                {perms.canCreate && (
                    <button onClick={handleAdd}
                        className="bg-[#01b763] hover:bg-[#01a056] text-white w-14 h-14 rounded-full shadow-[0_4px_12px_rgba(1,183,99,0.4)] flex items-center justify-center transition-transform transform active:scale-95">
                        <Plus size={28} />
                    </button>
                )}
            </div>

            <AppFooter areaLabel="System Management" database="Sistema" />

            {/* Modals */}
            <CompanyFormModal mode={formModal?.mode} form={form} setForm={setForm} onSave={saveCompany} onClose={() => setFormModal(null)} saving={saving} />
            {deleteDlg && <ConfirmDelete title="Delete Company" msg={`Delete company "${t(selCompany?.nombre)}"?`} onConfirm={deleteCompany} onCancel={() => setDeleteDlg(false)} saving={saving} />}
        </div>
    );
}

// """ Company Form Modal """""""""""""""""""""""""""""""""""""""""""""""""""""""
function CompanyFormModal({ mode, form, setForm, onSave, onClose, saving }: any) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);

    useEffect(() => {
        if (!mode) {
            setLogoPreview(null);
            setLogoFile(null);
        }
    }, [mode]);

    if (!mode) return null;

    const logoSrc = logoPreview ? logoPreview : (form.unico ? `/api/system/companies/${form.unico}/logo` : null);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 border-b border-black/10 shrink-0">
                    <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-[#FB7506]" />
                        <span className="font-black text-[11px] uppercase tracking-widest text-white">{mode === "add" ? "New Company" : "Edit Company"}</span>
                    </div>
                    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors">
                        <X size={16} />
                    </button>
                </div>
                <div className="overflow-y-auto flex-1 p-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
                        <F label="Code" value={form.unico} readOnly />
                        <F label="R.U.C." value={form.ruc} onChange={v => setForm((p:any) => ({...p, ruc:v}))} />
                        <F label="Company *" value={form.nombre} onChange={v => setForm((p:any) => ({...p, nombre:v}))} span2 />

                        <div className="col-span-2 sm:col-span-3 lg:col-span-4 flex flex-col gap-0.5">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Address</label>
                            <textarea value={form.direccion || ""} rows={2}
                                onChange={e => setForm((p:any) => ({...p, direccion:e.target.value}))}
                                className="fos-input resize-none" />
                        </div>

                        <F label="Country" value={form.pais} onChange={v => setForm((p:any)=>({...p,pais:v}))} />
                        <F label="City" value={form.ciudad} onChange={v => setForm((p:any)=>({...p,ciudad:v}))} />
                        <F label="Phone" value={form.telefono1} onChange={v => setForm((p:any)=>({...p,telefono1:v}))} />
                        <F label="Phone 2" value={form.telefono2} onChange={v => setForm((p:any)=>({...p,telefono2:v}))} />
                        <F label="Fax" value={form.fax1} onChange={v => setForm((p:any)=>({...p,fax1:v}))} />
                        <F label="Fax 2" value={form.fax2} onChange={v => setForm((p:any)=>({...p,fax2:v}))} />
                        <F label="E-mail" value={form.email} onChange={v => setForm((p:any)=>({...p,email:v}))} span2 />
                        <F label="Web Site" value={form.website} onChange={v => setForm((p:any)=>({...p,website:v}))} span2 />
                        <F label="Data Path" value={form.datapath} onChange={v => setForm((p:any)=>({...p,datapath:v}))} span2 />

                        <div className="flex flex-col gap-0.5">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">D Base *</label>
                            <div className="flex gap-1">
                                <input value={form.basedatos || ""}
                                    onChange={e => setForm((p:any)=>({...p,basedatos:e.target.value}))}
                                    className="fos-input text-xs py-1 flex-1 min-w-0" />
                                <button disabled title="Not available in web version" className="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-[9px] text-gray-400 cursor-not-allowed">…</button>
                            </div>
                        </div>

                        <F label="P.O. Box" value={form.apostal} onChange={v => setForm((p:any)=>({...p,apostal:v}))} />

                        <div className="flex flex-col gap-0.5">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Server *</label>
                            <div className="flex gap-1">
                                <input value={form.servidor || ""}
                                    onChange={e => setForm((p:any)=>({...p,servidor:e.target.value}))}
                                    className="fos-input text-xs py-1 flex-1 min-w-0" />
                                <button disabled title="Not available in web version" className="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-[9px] text-gray-400 cursor-not-allowed">…</button>
                            </div>
                        </div>

                        <F label="DSN *" value={form.dsn} onChange={v => setForm((p:any)=>({...p,dsn:v}))} />

                        <div className="flex flex-col gap-0.5 justify-end">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Active</label>
                            <label className="flex items-center gap-2 cursor-pointer h-[28px]">
                                <input type="checkbox" checked={Boolean(form.active)}
                                    onChange={e => setForm((p:any) => ({...p, active:e.target.checked}))}
                                    className="w-4 h-4 accent-[#FB7506]" />
                                <span className={cn("text-xs font-semibold", form.active ? "text-green-600" : "text-gray-400")}>
                                    {form.active ? "Yes" : "No"}
                                </span>
                            </label>
                        </div>

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
                                <button onClick={() => fileRef.current?.click()}
                                    className="flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-[9px] font-black uppercase tracking-wide transition-all">
                                    <Camera size={10} /> Insert Picture
                                </button>
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
                <div className="h-14 bg-gray-50 border-t border-gray-200 flex items-center justify-end px-4 gap-3 shrink-0">
                    <button onClick={onClose} className="px-4 py-2 rounded border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                        Cancel
                    </button>
                    <button onClick={() => onSave(form, logoFile)} disabled={saving} className="flex items-center gap-2 px-6 py-2 rounded bg-[#FB7506] hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider transition-all">
                        {saving ? <RefreshCcw size={14} className="animate-spin" /> : <Save size={14} />}
                        {saving ? "..." : "Save"}
                    </button>
                </div>
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
