"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    ArrowLeft, Plus, Pencil, Trash2, Save, X, RefreshCcw,
    Search, Check, AlertCircle, XCircle, Copy, Printer,
    Package, Tag, Palette, Box, Layers, Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuditLog } from "@/lib/audit";
import { AuditLogModal } from "@/components/AuditLogModal";
import { usePagePermissions, PERMISSION_MSGS } from "@/lib/permissions";
import Tab2 from "./Tab2";
import Tab3 from "./Tab3";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const t  = (v: any) => String(v ?? "").trim();
const sF = async (url: string) => { const r = await fetch(url); const j = await r.json(); if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`); return j; };

// ─── Empty forms ──────────────────────────────────────────────────────────────
const EMPTY_CLASS    = { clase:"", class_sh:"", display:true, isflower:true };
const EMPTY_SUBCLASS = { subclase:"", sub_sh:"", display:true, atpda_tax:0 };
const EMPTY_GRADE    = { grado:"", grade_sh:"", display:true, fnational:false };
const EMPTY_COLOR    = { color:"", color_sh:"", display:true, mix:false };
const EMPTY_CASE     = { case_name:"", case_sh:"", display:true, factor:1, case_high:0, case_long:0, case_wide:0, weight:0, cubic_feet:0, cases_pallet:0, fboxcode:"", boxtype:"", charges:0 };
const EMPTY_VARIETY  = { variety:"", variety_sh:"", color_uq:"", display:true, changecolor:false, active:true };
const EMPTY_PRODUCT  = {
    type_uq:"", dis_type:false, dis_class:true, dis_subcla:true, dis_variety:true,
    color_uq:"", dis_color:true, grade_uq:"", dis_grade:true, case_uq:"", dis_case:true,
    up_x_pack:1, pack_unit:"", stem_pack:false, up_x_case:1, min_pur_price:0,
    sales_price:0, inv_track:true, auto_description:true, web:false,
    mix_class:false, mix_subclass:false, mix_color:false, mix_grade:false,
    old_description:"", old_code:"", upc:"", boxcode:"", boxcode2:"",
    remarks:"", customer_uq:"", weight:0, retail_price:0, upc_text:"",
    color_breakdown:"", upc_notes:"", additional_notes:"", rotation:0,
    country_of_origin:"", shopify_name:"", shopify_color:"", shopify_size:"",
    shopify_subtype:"", shopify_variety:"", active:true,
};

// ─── Appsmith Menu ─────────────────────────────────────────────────────────────
function GridMenu({ items }: { items: { label:string; icon:any; color:string; onClick:()=>void; disabled?:boolean }[] }) {
    const [open, setOpen] = useState(false);
    const C: Record<string,{icon:string;text:string}> = {
        green:  {icon:"text-green-600", text:"text-green-700"},
        blue:   {icon:"text-blue-500",  text:"text-gray-800"},
        red:    {icon:"text-red-500",   text:"text-gray-800"},
        gray:   {icon:"text-gray-400",  text:"text-gray-400"},
        amber:  {icon:"text-amber-500", text:"text-gray-800"},
    };
    return (
        <div className="relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setOpen(o => !o)}
                className="h-7 bg-[#FB7506] hover:bg-orange-600 text-white w-16 flex items-center justify-center transition-colors rounded text-[8px]" title="Menu">
                <Menu size={14} />
            </button>
            {open && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-2xl z-50 overflow-hidden"
                    onMouseLeave={() => setOpen(false)}>
                    {items.map((item, i) => {
                        const c = C[item.color] || C.gray;
                        return (
                            <button key={i} onClick={() => { item.onClick(); setOpen(false); }}
                                disabled={!!item.disabled}
                                className={cn("w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors", i < items.length-1 && "border-b border-gray-100")}>
                                <item.icon size={16} className={c.icon} />
                                <span className={cn("text-sm font-bold", c.text)}>{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ─── Mini table with selection ─────────────────────────────────────────────────
function MiniTable({ cols, rows, selUnico, onSelect, loading, empty }: any) {
    return (
        <div className="overflow-auto flex-1">
            <table className="min-w-full text-[10px] text-left">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold sticky top-0 z-10">
                    <tr>{cols.map((c: any) => <th key={c.key} className={cn("p-1.5 whitespace-nowrap border-r border-gray-100 last:border-r-0", c.className)}>{c.label}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {loading ? (
                        <tr><td colSpan={cols.length} className="p-4 text-center text-gray-300 italic">Loading...</td></tr>
                    ) : rows.length === 0 ? (
                        <tr><td colSpan={cols.length} className="p-4 text-center text-gray-300 italic">{empty}</td></tr>
                    ) : rows.map((r: any, i: number) => {
                        const isSel = selUnico && selUnico === r.unico;
                        return (
                            <tr key={r.unico||i} onClick={() => onSelect?.(r)}
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

// ─── Panel header ──────────────────────────────────────────────────────────────
function PanelHeader({ icon: Icon, title, loading, recordId, children }: any) {
    return (
        <div className="h-7 bg-[#374151] flex items-center justify-between pl-2 pr-1 shrink-0">
            <div className="flex items-center gap-1.5">
                <Icon size={11} className="text-[#FB7506]" />
                <span className="font-black text-[9px] uppercase tracking-widest text-white">{title}</span>
                <AuditLogModal recordId={recordId} disabled={!recordId} />
                {loading && <RefreshCcw size={8} className="text-gray-400 animate-spin" />}
            </div>
            <div className="flex items-center gap-1">{children}</div>
        </div>
    );
}

// ─── CRUD Modal (generic) ──────────────────────────────────────────────────────
function CrudModal({ title, icon: Icon, form, setForm, fields, onSave, onDelete, onClose, saving, error, mode }: any) {
    const isDelete = mode === "delete";
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 sm:p-4">
            <div className="bg-white rounded-t-xl sm:rounded-xl shadow-2xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto">
                <div className="h-9 bg-[#374151] rounded-t-xl flex items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <Icon size={13} className="text-[#FB7506]" />
                        <span className="font-black text-[10px] uppercase tracking-widest text-white">
                            {mode === "add" ? "Add" : mode === "edit" ? "Edit" : "Delete"} — {title}
                        </span>
                        {error && <span className="text-amber-400 text-[9px] font-bold ml-1 truncate">{error}</span>}
                    </div>
                    <button onClick={onClose}><XCircle size={15} className="text-gray-400 hover:text-white" /></button>
                </div>
                <div className="p-4">
                    {isDelete ? (
                        <div className="flex flex-col items-center gap-3 py-2">
                            <Trash2 size={28} className="text-red-400" />
                            <p className="text-sm text-gray-600 text-center">Delete this record? This cannot be undone.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            {fields.map((f: any) => {
                                if (f.type === "checkbox") return (
                                    <label key={f.key} className="flex items-center gap-2 cursor-pointer col-span-1">
                                        <input type="checkbox" checked={!!form[f.key]} onChange={e => setForm((p: any) => ({...p, [f.key]: e.target.checked}))} className="w-3.5 h-3.5 accent-[#FB7506]" />
                                        <span className="text-xs font-semibold text-gray-600">{f.label}</span>
                                    </label>
                                );
                                return (
                                    <div key={f.key} className={cn("flex flex-col gap-0.5", f.span2 && "col-span-2")}>
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{f.label}</label>
                                        <input type={f.type||"text"} value={form[f.key]||""} readOnly={!!f.readOnly}
                                            onChange={e => setForm((p: any) => ({...p, [f.key]: f.type==="number" ? parseFloat(e.target.value)||0 : e.target.value}))}
                                            className={cn("fos-input text-xs py-1", f.readOnly && "bg-gray-50 text-gray-500")} />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                <div className="flex justify-end gap-2 px-4 py-3 bg-gray-50 border-t rounded-b-xl">
                    <button onClick={onClose} className="px-3 py-1.5 rounded border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
                    <button onClick={isDelete ? onDelete : onSave} disabled={saving}
                        className={cn("flex items-center gap-1.5 px-4 py-1.5 rounded text-white text-xs font-black uppercase tracking-wide disabled:opacity-50 transition-all",
                            isDelete ? "bg-red-600 hover:bg-red-700" : "bg-[#FB7506] hover:bg-orange-600")}>
                        {saving ? <RefreshCcw size={12} className="animate-spin" /> : isDelete ? <Trash2 size={12} /> : <Save size={12} />}
                        {saving ? "..." : isDelete ? "Delete" : mode === "add" ? "Create" : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Products Modal (full form) ────────────────────────────────────────────────
function ProductsModal({ mode, form, setForm, lookups, varietyName, onSave, onClose, saving, error }: any) {
    const [noteTab, setNoteTab] = useState("remarks");
    const totalUnits = form.stem_pack ? (form.up_x_case || 0) : (form.up_x_pack || 0) * (form.up_x_case || 0);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 sm:p-4">
            <div className="bg-white rounded-t-xl sm:rounded-xl shadow-2xl w-full sm:max-w-2xl flex flex-col h-[85vh] sm:h-[80vh]">
                <div className="h-9 bg-[#374151] rounded-t-xl flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-2">
                        <Package size={13} className="text-[#FB7506]" />
                        <span className="font-black text-[10px] uppercase tracking-widest text-white">
                            {mode === "add" ? "New Product" : mode === "copy" ? "Copy Product" : "Edit Product"} — {t(varietyName)}
                        </span>
                        {error && <span className="text-amber-400 text-[9px] ml-1 font-bold truncate">{error}</span>}
                    </div>
                    <button onClick={onClose}><XCircle size={15} className="text-gray-400 hover:text-white" /></button>
                </div>

                <div className="overflow-y-auto flex-1 p-4 space-y-3 text-xs">
                    {/* Combo row with dis_* checkboxes */}
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { label:"Type",     key:"type_uq",     dis:"dis_type",    items:lookups?.types||[],  valKey:"unico", labKey:"type" },
                            { label:"Grade",    key:"grade_uq",    dis:"dis_grade",   items:lookups?.grades||[], valKey:"unico", labKey:"grado" },
                            { label:"Case",     key:"case_uq",     dis:"dis_case",    items:lookups?.cases||[], valKey:"unico", labKey:"case_name" },
                        ].map(f => (
                            <div key={f.key} className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-1.5">
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{f.label}</label>
                                    <label className="flex items-center gap-0.5 cursor-pointer">
                                        <input type="checkbox" checked={!!form[f.dis]} onChange={e=>setForm((p:any)=>({...p,[f.dis]:e.target.checked}))} className="w-3 h-3 accent-[#FB7506]" />
                                        <span className="text-[8px] text-gray-400">Show</span>
                                    </label>
                                </div>
                                <select value={form[f.key]||""} onChange={e=>setForm((p:any)=>({...p,[f.key]:e.target.value}))} className="fos-input text-xs py-1">
                                    <option value="">— None —</option>
                                    {f.items.map((it:any) => <option key={it[f.valKey]} value={it[f.valKey]}>{t(it[f.labKey])}</option>)}
                                </select>
                            </div>
                        ))}
                    </div>

                    {/* Color */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Color</label>
                                <label className="flex items-center gap-0.5 cursor-pointer">
                                    <input type="checkbox" checked={!!form.dis_color} onChange={e=>setForm((p:any)=>({...p,dis_color:e.target.checked}))} className="w-3 h-3 accent-[#FB7506]" />
                                    <span className="text-[8px] text-gray-400">Show</span>
                                </label>
                            </div>
                            <select value={form.color_uq||""} onChange={e=>setForm((p:any)=>({...p,color_uq:e.target.value}))} className="fos-input text-xs py-1">
                                <option value="">— None —</option>
                                {(lookups?.colors||[]).map((c:any) => <option key={c.unico} value={c.unico}>{t(c.color)}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Quantities */}
                    <div className="border-t border-gray-100 pt-2 grid grid-cols-4 gap-2">
                        {[
                            { label:"Units/Pack *", key:"up_x_pack",   type:"number" },
                            { label:"Pack Unit *",  key:"pack_unit",   type:"select", items:lookups?.units||[], valKey:"unico", labKey:"unit" },
                            { label:"Packs/Case *", key:"up_x_case",   type:"number" },
                        ].map(f => (
                            <div key={f.key} className="flex flex-col gap-0.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{f.label}</label>
                                {f.type === "select" ? (
                                    <select value={form[f.key]||""} onChange={e=>setForm((p:any)=>({...p,[f.key]:e.target.value}))} className="fos-input text-xs py-1">
                                        <option value="">—</option>
                                        {(f.items||[]).map((it:any)=><option key={it[f.valKey!]} value={it[f.valKey!]}>{t(it[f.labKey!])}</option>)}
                                    </select>
                                ) : (
                                    <input type="number" value={form[f.key]||0} onChange={e=>setForm((p:any)=>({...p,[f.key]:parseInt(e.target.value)||0}))} className="fos-input text-xs py-1" />
                                )}
                            </div>
                        ))}
                        <div className="flex flex-col gap-0.5">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total Units</label>
                            <input readOnly value={totalUnits} className="fos-input text-xs py-1 bg-gray-50 text-gray-500 font-bold" />
                        </div>
                    </div>

                    {/* Prices & flags */}
                    <div className="grid grid-cols-4 gap-2">
                        <div className="flex flex-col gap-0.5">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Sales Price</label>
                            <input type="number" step="0.01" value={form.sales_price||0} onChange={e=>setForm((p:any)=>({...p,sales_price:parseFloat(e.target.value)||0}))} className="fos-input text-xs py-1" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Retail Price</label>
                            <input type="number" step="0.01" value={form.retail_price||0} onChange={e=>setForm((p:any)=>({...p,retail_price:parseFloat(e.target.value)||0}))} className="fos-input text-xs py-1" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Weight KG</label>
                            <input type="number" step="0.01" value={form.weight||0} onChange={e=>setForm((p:any)=>({...p,weight:parseFloat(e.target.value)||0}))} className="fos-input text-xs py-1" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Rotation</label>
                            <input type="number" value={form.rotation||0} onChange={e=>setForm((p:any)=>({...p,rotation:parseInt(e.target.value)||0}))} className="fos-input text-xs py-1" />
                        </div>
                    </div>

                    {/* Identifiers */}
                    <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-2">
                        {[{k:"old_code",l:"EDI Code"},{k:"boxcode",l:"Box Code"},{k:"boxcode2",l:"Item Number"},{k:"upc",l:"UPC"},{k:"upc_text",l:"UPC Text"}].map(f => (
                            <div key={f.k} className="flex flex-col gap-0.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{f.l}</label>
                                <input value={form[f.k]||""} onChange={e=>setForm((p:any)=>({...p,[f.k]:e.target.value}))} className="fos-input text-xs py-1" />
                            </div>
                        ))}
                    </div>

                    {/* Checkboxes row */}
                    <div className="flex flex-wrap gap-4 border-t border-gray-100 pt-2">
                        {[
                            {k:"stem_pack",l:"Price by Stem"},{k:"inv_track",l:"Inventory"},
                            {k:"auto_description",l:"Auto Description"},{k:"web",l:"Web Publish"},
                            ...(mode==="edit"?[{k:"active",l:"Active"}]:[]),
                        ].map(f => (
                            <label key={f.k} className="flex items-center gap-1.5 cursor-pointer">
                                <input type="checkbox" checked={!!form[f.k]} onChange={e=>setForm((p:any)=>({...p,[f.k]:e.target.checked}))} className="w-3.5 h-3.5 accent-[#FB7506]" />
                                <span className="text-xs font-semibold text-gray-600">{f.l}</span>
                            </label>
                        ))}
                    </div>

                    {/* Notes tabs */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="flex border-b border-gray-200 bg-gray-50">
                            {[{id:"remarks",l:"Instructions"},{id:"color_breakdown",l:"Colors"},{id:"upc_notes",l:"UPC Notes"},{id:"additional_notes",l:"Additional"}].map(tab => (
                                <button key={tab.id} onClick={() => setNoteTab(tab.id)}
                                    className={cn("flex-1 py-1.5 text-[9px] font-black uppercase tracking-wide transition-colors", noteTab===tab.id ? "bg-white text-[#FB7506] border-b-2 border-[#FB7506]" : "text-gray-400 hover:text-gray-600")}>
                                    {tab.l}
                                </button>
                            ))}
                        </div>
                        <textarea value={form[noteTab]||""} rows={2}
                            onChange={e=>setForm((p:any)=>({...p,[noteTab]:e.target.value}))}
                            className="w-full p-2 text-xs outline-none resize-none border-0 focus:ring-0" />
                    </div>
                </div>

                <div className="flex justify-end gap-2 px-4 py-3 bg-gray-50 border-t rounded-b-xl shrink-0">
                    <button onClick={onClose} className="px-3 py-1.5 rounded border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
                    <button onClick={onSave} disabled={saving}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-[#FB7506] hover:bg-orange-600 text-white text-xs font-black uppercase disabled:opacity-50">
                        {saving ? <RefreshCcw size={12} className="animate-spin" /> : <Save size={12} />}
                        {saving ? "..." : mode === "add" || mode === "copy" ? "Create" : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ItemsSetupPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const qc     = useQueryClient();
    const { logAction }  = useAuditLog("items-setup", "flower_products");
    const perms          = usePagePermissions("items-setup");

    const [activeTab, setActiveTab] = useState<1|2|3>(1);

    // ── Selection state (cascading) ───────────────────────────────────────────
    const [selClass,   setSelClass]   = useState<any>(null);
    const [selSubclass,setSelSubclass]= useState<any>(null);
    const [selVariety, setSelVariety] = useState<any>(null);
    const [selProduct, setSelProduct] = useState<any>(null);
    const [activeSubTab, setActiveSubTab] = useState<"subclass"|"grades"|"colors"|"cases">("subclass");

    // ── Search state ──────────────────────────────────────────────────────────
    const [classSearch,    setClassSearch]    = useState("");
    const [subclassSearch, setSubclassSearch] = useState("");
    const [varietySearch,  setVarietySearch]  = useState("");
    const [colorSearch,    setColorSearch]    = useState("");
    const [gradeSearch,    setGradeSearch]    = useState("");

    // ── Modal state ───────────────────────────────────────────────────────────
    const [classModal,    setClassModal]    = useState<{mode:"add"|"edit"|"delete"}|null>(null);
    const [subclassModal, setSubclassModal] = useState<{mode:"add"|"edit"|"delete"}|null>(null);
    const [gradeModal,    setGradeModal]    = useState<{mode:"add"|"edit"|"delete"}|null>(null);
    const [colorModal,    setColorModal]    = useState<{mode:"add"|"edit"|"delete"}|null>(null);
    const [caseModal,     setCaseModal]     = useState<{mode:"add"|"edit"|"delete"}|null>(null);
    const [varietyModal,  setVarietyModal]  = useState<{mode:"add"|"edit"|"delete"}|null>(null);
    const [productModal,  setProductModal]  = useState<{mode:"add"|"edit"|"copy"|"delete"}|null>(null);

    // ── Form state ────────────────────────────────────────────────────────────
    const [classForm,    setClassForm]    = useState<any>({...EMPTY_CLASS});
    const [subclassForm, setSubclassForm] = useState<any>({...EMPTY_SUBCLASS});
    const [gradeForm,    setGradeForm]    = useState<any>({...EMPTY_GRADE});
    const [colorForm,    setColorForm]    = useState<any>({...EMPTY_COLOR});
    const [caseForm,     setCaseForm]     = useState<any>({...EMPTY_CASE});
    const [varietyForm,  setVarietyForm]  = useState<any>({...EMPTY_VARIETY});
    const [productForm,  setProductForm]  = useState<any>({...EMPTY_PRODUCT});
    const [formError,    setFormError]    = useState<string|null>(null);
    const [saving,       setSaving]       = useState(false);

    useEffect(() => { if (status === "unauthenticated") router.push("/login"); }, [status, router]);

    // ── Queries ───────────────────────────────────────────────────────────────
    const { data: classes    = [], isFetching: loadingCl,   refetch: refetchCl   } = useQuery({ queryKey:["items-cl",  classSearch],               queryFn:()=>sF(`/api/masters/items/classes?search=${encodeURIComponent(classSearch||"%")}`), staleTime:30000 });
    const { data: subclasses = [], isFetching: loadingSc,   refetch: refetchSc   } = useQuery({ queryKey:["items-sc",  selClass?.unico,subclassSearch], queryFn:()=>sF(`/api/masters/items/subclasses?class_uq=${selClass?.unico}&search=${encodeURIComponent(subclassSearch||"%")}`), enabled:!!selClass?.unico });
    const { data: grades     = [], isFetching: loadingGr,   refetch: refetchGr   } = useQuery({ queryKey:["items-gr",  gradeSearch],                queryFn:()=>sF(`/api/masters/items/grades?search=${encodeURIComponent(gradeSearch||"%")}`),    staleTime:60000 });
    const { data: colors     = [], isFetching: loadingCo,   refetch: refetchCo   } = useQuery({ queryKey:["items-co"],                               queryFn:()=>sF("/api/masters/items/colors"),                                                    staleTime:60000 });
    const { data: cases      = [], isFetching: loadingCs,   refetch: refetchCs   } = useQuery({ queryKey:["items-cs"],                               queryFn:()=>sF("/api/masters/items/cases"),                                                     staleTime:60000 });
    const { data: varieties  = [], isFetching: loadingVr,   refetch: refetchVr   } = useQuery({ queryKey:["items-vr",  selSubclass?.unico,varietySearch], queryFn:()=>sF(`/api/masters/items/varieties?subclass_uq=${selSubclass?.unico}&search=${encodeURIComponent(varietySearch||"%")}`), enabled:!!selSubclass?.unico });
    const { data: products   = [], isFetching: loadingPr,   refetch: refetchPr   } = useQuery({ queryKey:["items-pr",  selVariety?.unico],           queryFn:()=>sF(`/api/masters/items/products?variety_uq=${selVariety?.unico}`), enabled:!!selVariety?.unico });
    const { data: lookups }  = useQuery({ queryKey:["items-look"], queryFn:()=>sF("/api/masters/items/lookups"), staleTime:1000*60*10 });

    // ── Cascading auto-select ─────────────────────────────────────────────────
    useEffect(() => { if ((classes as any[]).length > 0 && !selClass) setSelClass((classes as any[])[0]); }, [classes]);
    useEffect(() => { if ((subclasses as any[]).length > 0) setSelSubclass((subclasses as any[])[0]); else setSelSubclass(null); }, [subclasses]);
    useEffect(() => { if ((varieties as any[]).length > 0) setSelVariety((varieties as any[])[0]); else setSelVariety(null); }, [varieties]);
    useEffect(() => { if ((products as any[]).length > 0) setSelProduct((products as any[])[0]); else setSelProduct(null); }, [products]);

    // ── Filtered lists (client-side for colors) ───────────────────────────────
    const filteredColors = useMemo(() => {
        if (!colorSearch.trim()) return colors as any[];
        const q = colorSearch.toLowerCase();
        return (colors as any[]).filter((c: any) => t(c.color).toLowerCase().includes(q));
    }, [colors, colorSearch]);

    // ── Generic CRUD handler ──────────────────────────────────────────────────
    const doCrud = async (
        endpoint: string, method: string, body: any,
        onSuccess: (data: any) => void,
    ) => {
        setSaving(true); setFormError(null);
        try {
            const res  = await fetch(endpoint, { method, headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            onSuccess(data);
        } catch (e: any) { setFormError(e.message); }
        finally { setSaving(false); }
    };

    // ── Class CRUD ────────────────────────────────────────────────────────────
    const saveClass = () => {
        if (!classForm.clase.trim()) { setFormError("Class name is required."); return; }
        if (classModal?.mode === "add") {
            doCrud("/api/masters/items/classes", "POST", classForm, d => { logAction("Insert", d.unico, "Class"); refetchCl(); setClassModal(null); });
        } else if (classModal?.mode === "edit") {
            doCrud(`/api/masters/items/classes/${selClass.unico}`, "PUT", classForm, () => { logAction("Edit", selClass.unico, "Class"); refetchCl(); setClassModal(null); });
        }
    };
    const deleteClass = () => doCrud(`/api/masters/items/classes/${selClass?.unico}`, "DELETE", {}, () => { logAction("Delete", selClass?.unico, "Class"); setSelClass(null); refetchCl(); setClassModal(null); });

    // ── Subclass CRUD ─────────────────────────────────────────────────────────
    const saveSubclass = () => {
        if (!subclassForm.subclase.trim()) { setFormError("Subclass name is required."); return; }
        const body = { ...subclassForm, class_uq: selClass?.unico };
        if (subclassModal?.mode === "add") {
            doCrud("/api/masters/items/subclasses", "POST", body, d => { logAction("Insert", d.unico, "Subclass"); refetchSc(); setSubclassModal(null); });
        } else {
            doCrud(`/api/masters/items/subclasses/${selSubclass?.unico}`, "PUT", body, () => { logAction("Edit", selSubclass?.unico, "Subclass"); refetchSc(); setSubclassModal(null); });
        }
    };
    const deleteSubclass = () => doCrud(`/api/masters/items/subclasses/${selSubclass?.unico}`, "DELETE", {}, () => { logAction("Delete", selSubclass?.unico, "Subclass"); setSelSubclass(null); refetchSc(); setSubclassModal(null); });

    // ── Grade CRUD ────────────────────────────────────────────────────────────
    const saveGrade = () => {
        if (!gradeForm.grado.trim()) { setFormError("Grade name is required."); return; }
        if (gradeModal?.mode === "add") {
            doCrud("/api/masters/items/grades", "POST", gradeForm, d => { logAction("Insert", d.unico, "Grade"); refetchGr(); setGradeModal(null); });
        } else {
            doCrud(`/api/masters/items/grades/${/* selGrade */ ""}`, "PUT", gradeForm, () => { refetchGr(); setGradeModal(null); });
        }
    };

    // ── Color CRUD ────────────────────────────────────────────────────────────
    const saveColor = () => {
        if (!colorForm.color.trim()) { setFormError("Color name is required."); return; }
        if (colorModal?.mode === "add") {
            doCrud("/api/masters/items/colors", "POST", colorForm, d => { logAction("Insert", d.unico, "Color"); refetchCo(); setColorModal(null); });
        } else {
            // Need selColor state — simplified for now
            setColorModal(null);
        }
    };

    // ── Case CRUD ─────────────────────────────────────────────────────────────
    const saveCase = () => {
        if (!caseForm.case_name.trim()) { setFormError("Case name is required."); return; }
        if (caseModal?.mode === "add") {
            doCrud("/api/masters/items/cases", "POST", caseForm, d => { logAction("Insert", d.unico, "Case"); refetchCs(); setCaseModal(null); });
        } else {
            // Need selCase state
            setCaseModal(null);
        }
    };

    // ── Variety CRUD ──────────────────────────────────────────────────────────
    const saveVariety = () => {
        if (!varietyForm.variety.trim()) { setFormError("Variety name is required."); return; }
        const body = { ...varietyForm, subclass_uq: selSubclass?.unico, class_uq: selClass?.unico };
        if (varietyModal?.mode === "add") {
            doCrud("/api/masters/items/varieties", "POST", body, d => { logAction("Insert", d.unico, "Variety"); refetchVr(); setVarietyModal(null); });
        } else if (varietyModal?.mode === "edit") {
            doCrud(`/api/masters/items/varieties/${selVariety?.unico}`, "PUT", body, () => { logAction("Edit", selVariety?.unico, "Variety"); refetchVr(); setVarietyModal(null); });
        }
    };
    const deleteVariety = () => doCrud(`/api/masters/items/varieties/${selVariety?.unico}`, "DELETE", {}, () => { logAction("Delete", selVariety?.unico, "Variety"); setSelVariety(null); refetchVr(); setVarietyModal(null); });

    // ── Product CRUD ──────────────────────────────────────────────────────────
    const saveProduct = () => {
        if (!productForm.up_x_pack) { setFormError("Units per pack is required."); return; }
        if (!productForm.up_x_case) { setFormError("Packs per case is required."); return; }
        const body = { ...productForm, variety_uq: selVariety?.unico };
        if (productModal?.mode === "add" || productModal?.mode === "copy") {
            doCrud("/api/masters/items/products", "POST", body, d => { logAction("Insert", d.unico, productModal.mode==="copy"?"Copy Product":"Product"); refetchPr(); setProductModal(null); });
        } else {
            doCrud(`/api/masters/items/products/${selProduct?.unico}`, "PUT", body, () => { logAction("Edit", selProduct?.unico, "Product"); refetchPr(); setProductModal(null); });
        }
    };
    const deleteProduct = () => doCrud(`/api/masters/items/products/${selProduct?.unico}`, "DELETE", {}, () => { logAction("Delete", selProduct?.unico, "Product"); setSelProduct(null); refetchPr(); setProductModal(null); });

    const openProductModal = (mode: "add"|"edit"|"copy") => {
        if (!selVariety && mode === "add") { setFormError("Select a variety first."); return; }
        if (!selProduct && (mode === "edit" || mode === "copy")) { setFormError("Select a product first."); return; }
        if (!perms.canCreate && (mode==="add"||mode==="copy")) { setFormError(PERMISSION_MSGS.create); return; }
        if (!perms.canEdit && mode==="edit") { setFormError(PERMISSION_MSGS.edit); return; }
        setProductForm(mode === "add" ? {...EMPTY_PRODUCT, variety_uq:selVariety?.unico} : {...(selProduct || EMPTY_PRODUCT)});
        setFormError(null);
        setProductModal({ mode });
    };

    if (status === "loading") return null;

    return (
        <div className="flex flex-col h-screen bg-[#f4f6f8] overflow-hidden font-sans text-[#333]">

            {/* Header */}
            <div className="h-10 bg-[#374151] flex items-center justify-between px-4 shrink-0 text-white">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.push("/menu")} className="hover:bg-white/10 p-1 rounded"><ArrowLeft size={15} /></button>
                    <Package size={13} className="text-[#FB7506]" />
                    <span className="font-black text-xs uppercase tracking-widest">Items Setup</span>
                    {/* Top-level tab bar */}
                    <div className="flex items-end gap-0 ml-4">
                        {([1,2,3] as const).map(tab => (
                            <button key={tab} onClick={()=>setActiveTab(tab)}
                                className={cn("px-3 h-7 text-[8px] font-black uppercase tracking-wider rounded-t transition-all",
                                    activeTab===tab ? "bg-[#f4f6f8] text-[#FB7506]" : "text-gray-400 hover:text-white hover:bg-white/10")}>
                                {tab===1 ? "Tab 1 — Hierarchy" : tab===2 ? "Tab 2 — All Products" : "Tab 3 — Varieties / Components"}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {formError && <span className="flex items-center gap-1 text-amber-400 text-[9px] font-bold"><AlertCircle size={11}/>{formError}<button onClick={()=>setFormError(null)}><X size={10}/></button></span>}
                    <span className="text-gray-400 text-[10px]">User: <span className="text-white">{session?.user?.name}</span></span>
                </div>
            </div>

            {/* Tab 2 — All Products */}
            {activeTab === 2 && <Tab2 />}

            {/* Tab 3 — Varieties / Components */}
            {activeTab === 3 && (
                <Tab3
                    selSubclass={selSubclass}
                    selVariety={selVariety}
                    setSelVariety={setSelVariety}
                    varieties={varieties as any[]}
                    loadingVr={loadingVr}
                    refetchVr={refetchVr}
                />
            )}

            {/* Tab 1 — 2-row grid layout */}
            <div className={cn("flex-1 p-1.5 grid gap-1.5 overflow-hidden", activeTab !== 1 && "hidden")} style={{ gridTemplateRows:"45% 55%" }}>

                {/* Row 1: Classes + Sub-tabs */}
                <div className="grid gap-1.5 overflow-hidden" style={{ gridTemplateColumns:"40% 60%" }}>

                    {/* Classes panel */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col overflow-hidden">
                        <PanelHeader icon={Tag} title="Item Classes" loading={loadingCl} recordId={selClass?.unico}>
                            <GridMenu items={[
                                { label:"Add Class",    icon:Plus,   color:"green", onClick:()=>{ if(!perms.canCreate){setFormError(PERMISSION_MSGS.create);return;} setClassForm({...EMPTY_CLASS}); setFormError(null); setClassModal({mode:"add"}); }, disabled:!perms.canCreate },
                                { label:"Edit Class",   icon:Pencil, color:"blue",  onClick:()=>{ if(!perms.canEdit){setFormError(PERMISSION_MSGS.edit);return;} if(selClass){setClassForm({clase:t(selClass.clase),class_sh:t(selClass.class_sh),display:!!selClass.display,isflower:true});setFormError(null);setClassModal({mode:"edit"});} }, disabled:!selClass||!perms.canEdit },
                                { label:"Delete Class", icon:Trash2, color:"red",   onClick:()=>{ if(!perms.canDelete){setFormError(PERMISSION_MSGS.delete);return;} if(selClass){setFormError(null);setClassModal({mode:"delete"});} }, disabled:!selClass||!perms.canDelete },
                            ]} />
                        </PanelHeader>
                        <div className="p-1.5 border-b border-gray-100 shrink-0">
                            <div className="relative">
                                <Search size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="text" value={classSearch} onChange={e=>setClassSearch(e.target.value)} placeholder="Search classes..."
                                    className="w-full pl-6 pr-2 py-1 text-[10px] border border-gray-200 rounded outline-none focus:ring-1 focus:ring-[#FB7506]" />
                            </div>
                        </div>
                        <MiniTable
                            cols={[
                                { key:"clase",    label:"Class",        className:"font-medium" },
                                { key:"class_sh", label:"Code",         className:"text-gray-500" },
                                { key:"display",  label:"Show",         className:"text-center", render:(v:any)=>v?<Check size={9} className="text-green-500 mx-auto"/>:"—" },
                            ]}
                            rows={classes}
                            selUnico={selClass?.unico}
                            onSelect={(r:any) => { setSelClass(r); setSelSubclass(null); setSelVariety(null); setSelProduct(null); }}
                            loading={loadingCl}
                            empty="No classes"
                        />
                    </div>

                    {/* Sub-tabs panel */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col overflow-hidden">
                        {/* Tab bar */}
                        <div className="flex items-end px-1 gap-0.5 bg-[#374151] h-7 shrink-0">
                            {([
                                {id:"subclass",label:"Subclass by Class"},
                                {id:"grades",  label:"Grades"},
                                {id:"colors",  label:"Colors"},
                                {id:"cases",   label:"Cases"},
                            ] as const).map(tab => (
                                <button key={tab.id} onClick={() => setActiveSubTab(tab.id)}
                                    className={cn("px-3 h-5 text-[8px] font-black uppercase tracking-wider rounded-t transition-all",
                                        activeSubTab===tab.id ? "bg-[#f4f6f8] text-[#FB7506]" : "text-gray-400 hover:text-white hover:bg-white/10")}>
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Subclass tab */}
                        {activeSubTab === "subclass" && (
                            <>
                                <div className="h-6 bg-gray-700/50 flex items-center justify-between px-2 shrink-0">
                                    <div className="flex items-center gap-1">
                                        <AuditLogModal recordId={selSubclass?.unico} disabled={!selSubclass?.unico} />
                                        {loadingSc && <RefreshCcw size={8} className="text-gray-400 animate-spin" />}
                                    </div>
                                    <GridMenu items={[
                                        { label:"Add Subclass",    icon:Plus,   color:"green", onClick:()=>{ if(!perms.canCreate){setFormError(PERMISSION_MSGS.create);return;} setSubclassForm({...EMPTY_SUBCLASS});setFormError(null);setSubclassModal({mode:"add"}); } },
                                        { label:"Edit Subclass",   icon:Pencil, color:"blue",  onClick:()=>{ if(!selSubclass)return; setSubclassForm({subclase:t(selSubclass.subclase),sub_sh:t(selSubclass.sub_sh),display:!!selSubclass.display,atpda_tax:selSubclass.atpda_tax||0});setFormError(null);setSubclassModal({mode:"edit"}); }, disabled:!selSubclass },
                                        { label:"Delete Subclass", icon:Trash2, color:"red",   onClick:()=>{ if(selSubclass){setFormError(null);setSubclassModal({mode:"delete"});} }, disabled:!selSubclass },
                                    ]} />
                                </div>
                                <div className="p-1 border-b border-gray-100 shrink-0">
                                    <input type="text" value={subclassSearch} onChange={e=>setSubclassSearch(e.target.value)} placeholder="Search..." className="w-full px-2 py-0.5 text-[10px] border border-gray-200 rounded outline-none" />
                                </div>
                                <MiniTable
                                    cols={[{key:"subclase",label:"Subclass"},{key:"sub_sh",label:"Code"},{key:"display",label:"Show",className:"text-center",render:(v:any)=>v?<Check size={9} className="text-green-500 mx-auto"/>:"—"}]}
                                    rows={subclasses} selUnico={selSubclass?.unico}
                                    onSelect={(r:any)=>{setSelSubclass(r);setSelVariety(null);setSelProduct(null);}}
                                    loading={loadingSc} empty="Select a class"
                                />
                            </>
                        )}

                        {/* Grades tab */}
                        {activeSubTab === "grades" && (
                            <>
                                <div className="h-6 bg-gray-700/50 flex items-center justify-end px-2 shrink-0">
                                    <GridMenu items={[
                                        { label:"Add Grade",   icon:Plus,   color:"green", onClick:()=>{ setGradeForm({...EMPTY_GRADE});setFormError(null);setGradeModal({mode:"add"}); } },
                                        { label:"Edit Grade",  icon:Pencil, color:"blue",  onClick:()=>{ setFormError("Select a grade to edit."); }, disabled:true },
                                        { label:"Delete Grade",icon:Trash2, color:"red",   onClick:()=>{ setFormError("Select a grade to delete."); }, disabled:true },
                                    ]} />
                                </div>
                                <div className="p-1 border-b border-gray-100 shrink-0">
                                    <input type="text" value={gradeSearch} onChange={e=>setGradeSearch(e.target.value)} placeholder="Search grades..." className="w-full px-2 py-0.5 text-[10px] border border-gray-200 rounded outline-none" />
                                </div>
                                <MiniTable
                                    cols={[{key:"grado",label:"Grade"},{key:"grade_sh",label:"Code"},{key:"display",label:"Show",className:"text-center",render:(v:any)=>v?<Check size={9} className="text-green-500 mx-auto"/>:"—"}]}
                                    rows={grades} selUnico={null} onSelect={()=>{}}
                                    loading={loadingGr} empty="No grades"
                                />
                            </>
                        )}

                        {/* Colors tab */}
                        {activeSubTab === "colors" && (
                            <>
                                <div className="h-6 bg-gray-700/50 flex items-center justify-between px-2 shrink-0">
                                    <span className="text-[8px] text-gray-400 font-bold">{filteredColors.length} colors</span>
                                    <GridMenu items={[
                                        { label:"Add Color",   icon:Plus,   color:"green", onClick:()=>{ setColorForm({...EMPTY_COLOR});setFormError(null);setColorModal({mode:"add"}); } },
                                        { label:"Edit Color",  icon:Pencil, color:"blue",  onClick:()=>{ setFormError("Select a color to edit."); }, disabled:true },
                                        { label:"Delete Color",icon:Trash2, color:"red",   onClick:()=>{ setFormError("Select a color to delete."); }, disabled:true },
                                    ]} />
                                </div>
                                <div className="p-1 border-b border-gray-100 shrink-0">
                                    <input type="text" value={colorSearch} onChange={e=>setColorSearch(e.target.value)} placeholder="Search colors..." className="w-full px-2 py-0.5 text-[10px] border border-gray-200 rounded outline-none" />
                                </div>
                                <MiniTable
                                    cols={[{key:"color",label:"Color",className:"font-medium"},{key:"color_sh",label:"Code"},{key:"display",label:"Show",className:"text-center",render:(v:any)=>v?<Check size={9} className="text-green-500 mx-auto"/>:"—"},{key:"mix",label:"Mix",className:"text-center",render:(v:any)=>v?<Check size={9} className="text-blue-400 mx-auto"/>:"—"}]}
                                    rows={filteredColors} selUnico={null} onSelect={()=>{}}
                                    loading={loadingCo} empty="No colors"
                                />
                            </>
                        )}

                        {/* Cases tab */}
                        {activeSubTab === "cases" && (
                            <>
                                <div className="h-6 bg-gray-700/50 flex items-center justify-end px-2 shrink-0">
                                    <GridMenu items={[
                                        { label:"Add Case",   icon:Plus,   color:"green", onClick:()=>{ setCaseForm({...EMPTY_CASE});setFormError(null);setCaseModal({mode:"add"}); } },
                                        { label:"Edit Case",  icon:Pencil, color:"blue",  onClick:()=>{ setFormError("Select a case to edit."); }, disabled:true },
                                        { label:"Delete Case",icon:Trash2, color:"red",   onClick:()=>{ setFormError("Select a case to delete."); }, disabled:true },
                                    ]} />
                                </div>
                                <MiniTable
                                    cols={[{key:"case_name",label:"Name",className:"font-medium"},{key:"case_sh",label:"Code"},{key:"factor",label:"Factor",className:"text-right",render:(v:any)=>parseFloat(v||0).toFixed(2)},{key:"display",label:"Show",className:"text-center",render:(v:any)=>v?<Check size={9} className="text-green-500 mx-auto"/>:"—"}]}
                                    rows={cases} selUnico={null} onSelect={()=>{}}
                                    loading={loadingCs} empty="No cases"
                                />
                            </>
                        )}
                    </div>
                </div>

                {/* Row 2: Varieties + Products */}
                <div className="grid gap-1.5 overflow-hidden" style={{ gridTemplateRows:"40% 60%" }}>

                    {/* Varieties panel */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col overflow-hidden">
                        <PanelHeader icon={Layers} title={`Varieties${selSubclass ? ` — ${t(selSubclass.subclase)}` : ""}`} loading={loadingVr} recordId={selVariety?.unico}>
                            <GridMenu items={[
                                { label:"Add Variety",    icon:Plus,   color:"green", onClick:()=>{ if(!perms.canCreate){setFormError(PERMISSION_MSGS.create);return;} if(!selSubclass){setFormError("Select a subclass first.");return;} setVarietyForm({...EMPTY_VARIETY});setFormError(null);setVarietyModal({mode:"add"}); } },
                                { label:"Edit Variety",   icon:Pencil, color:"blue",  onClick:()=>{ if(!selVariety)return; setVarietyForm({variety:t(selVariety.variety),variety_sh:t(selVariety.variety_sh),color_uq:t(selVariety.color_uq),display:!!selVariety.display,changecolor:!!selVariety.changecolor,active:!!selVariety.active});setFormError(null);setVarietyModal({mode:"edit"}); }, disabled:!selVariety },
                                { label:"Delete Variety", icon:Trash2, color:"red",   onClick:()=>{ if(selVariety){setFormError(null);setVarietyModal({mode:"delete"});} }, disabled:!selVariety },
                            ]} />
                        </PanelHeader>
                        <div className="p-1 border-b border-gray-100 shrink-0">
                            <div className="relative">
                                <Search size={9} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="text" value={varietySearch} onChange={e=>setVarietySearch(e.target.value)} placeholder="Search varieties..."
                                    className="w-full pl-6 pr-2 py-0.5 text-[10px] border border-gray-200 rounded outline-none" />
                            </div>
                        </div>
                        <MiniTable
                            cols={[
                                { key:"variety",     label:"Variety",     className:"font-medium" },
                                { key:"color",       label:"Color",       className:"text-gray-500" },
                                { key:"active",      label:"Active",      className:"text-center", render:(v:any)=>v?<Check size={9} className="text-green-500 mx-auto"/>:"—" },
                                { key:"variety_sh",  label:"Code",        className:"text-gray-400" },
                                { key:"changecolor", label:"ChgColor",    className:"text-center", render:(v:any)=>v?<Check size={9} className="text-blue-400 mx-auto"/>:"—" },
                            ]}
                            rows={varieties}
                            selUnico={selVariety?.unico}
                            onSelect={(r:any) => { setSelVariety(r); setSelProduct(null); }}
                            loading={loadingVr}
                            empty={selSubclass ? "No varieties" : "Select a subclass"}
                        />
                    </div>

                    {/* Products panel */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col overflow-hidden">
                        <PanelHeader icon={Package} title={`Items by Variety${selVariety ? ` — ${t(selVariety.variety)}` : ""}`} loading={loadingPr} recordId={selProduct?.unico}>
                            <div className="flex items-center gap-1">
                                <button onClick={() => openProductModal("copy")} disabled={!selProduct || !perms.canCreate}
                                    className="flex items-center gap-0.5 bg-gray-600 hover:bg-gray-500 disabled:opacity-40 text-white px-1.5 py-0.5 rounded text-[8px] font-black uppercase">
                                    <Copy size={8}/> Copy
                                </button>
                                <button onClick={() => { if(!perms.canReport){setFormError(PERMISSION_MSGS.report);return;} alert("Print functionality coming soon."); }} disabled={!selProduct || !perms.canReport}
                                    className="flex items-center gap-0.5 bg-gray-600 hover:bg-gray-500 disabled:opacity-40 text-white px-1.5 py-0.5 rounded text-[8px] font-black uppercase">
                                    <Printer size={8}/> Print
                                </button>
                                <GridMenu items={[
                                    { label:"Add Product",    icon:Plus,   color:"green", onClick:()=>openProductModal("add"),    disabled:!selVariety||!perms.canCreate },
                                    { label:"Edit Product",   icon:Pencil, color:"blue",  onClick:()=>openProductModal("edit"),   disabled:!selProduct||!perms.canEdit },
                                    { label:"Delete Product", icon:Trash2, color:"red",   onClick:()=>{ if(selProduct&&perms.canDelete){setFormError(null);setProductModal({mode:"delete"});} }, disabled:!selProduct||!perms.canDelete },
                                    { label:"Bouquet Comp.", icon:Layers, color:"amber", onClick:()=>setFormError("Bouquet Composition — Coming soon"), disabled:!selProduct },
                                    { label:"Box Comp.",     icon:Box,    color:"amber", onClick:()=>setFormError("Box Composition — Coming soon"),     disabled:!selProduct },
                                ]} />
                            </div>
                        </PanelHeader>
                        <MiniTable
                            cols={[
                                { key:"description",  label:"Product",    className:"font-medium truncate max-w-[200px]" },
                                { key:"stem_pack",    label:"ByStem",     className:"text-center", render:(v:any)=>v?<Check size={9} className="text-green-500 mx-auto"/>:"—" },
                                { key:"up_x_case",    label:"Packs",      className:"text-right" },
                                { key:"up_x_pack",    label:"Units/Pack", className:"text-right" },
                                { key:"total_units",  label:"Total",      className:"text-right" },
                                { key:"case_sh",      label:"Case",       className:"text-gray-400" },
                                { key:"boxcode",      label:"BoxCode",    className:"text-gray-400 text-[9px]" },
                                { key:"upc",          label:"UPC",        className:"text-gray-400 text-[9px]" },
                                { key:"old_code",     label:"EDICode",    className:"text-gray-400 text-[9px]" },
                            ]}
                            rows={products}
                            selUnico={selProduct?.unico}
                            onSelect={setSelProduct}
                            loading={loadingPr}
                            empty={selVariety ? "No products" : "Select a variety"}
                        />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="h-7 bg-gray-100 border-t px-4 flex items-center justify-between text-[9px] font-bold text-gray-500 uppercase tracking-tight shrink-0">
                <div className="flex gap-4"><span>Server: Production</span><span className="text-gray-300">|</span><span>Database: FullPot</span></div>
                <span className="text-[#FB7506]">FOS Masters V.2.0.1</span>
            </div>

            {/* ── Modals ─────────────────────────────────────────────────── */}
            {classModal && (
                <CrudModal title="Class" icon={Tag} form={classForm} setForm={setClassForm} mode={classModal.mode}
                    fields={[{key:"clase",label:"Class Name *",span2:true},{key:"class_sh",label:"Code (4 chars)"},{type:"checkbox",key:"display",label:"Show in Product"}]}
                    onSave={saveClass} onDelete={deleteClass} onClose={()=>{setClassModal(null);setFormError(null);}} saving={saving} error={formError} />
            )}
            {subclassModal && (
                <CrudModal title="Subclass" icon={Tag} form={subclassForm} setForm={setSubclassForm} mode={subclassModal.mode}
                    fields={[{key:"subclase",label:"Subclass Name *",span2:true},{key:"sub_sh",label:"Code (4 chars)"},{key:"atpda_tax",label:"ATPDA Tax %",type:"number"},{type:"checkbox",key:"display",label:"Show in Product"}]}
                    onSave={saveSubclass} onDelete={deleteSubclass} onClose={()=>{setSubclassModal(null);setFormError(null);}} saving={saving} error={formError} />
            )}
            {gradeModal && (
                <CrudModal title="Grade" icon={Layers} form={gradeForm} setForm={setGradeForm} mode={gradeModal?.mode||"add"}
                    fields={[{key:"grado",label:"Grade Name *"},{key:"grade_sh",label:"Code (4 chars)"},{type:"checkbox",key:"display",label:"Show in Product"},{type:"checkbox",key:"fnational",label:"National"}]}
                    onSave={saveGrade} onDelete={()=>{}} onClose={()=>{setGradeModal(null);setFormError(null);}} saving={saving} error={formError} />
            )}
            {colorModal && (
                <CrudModal title="Color" icon={Palette} form={colorForm} setForm={setColorForm} mode={colorModal?.mode||"add"}
                    fields={[{key:"color",label:"Color Name *"},{key:"color_sh",label:"Code (4 chars)"},{type:"checkbox",key:"display",label:"Show in Product"},{type:"checkbox",key:"mix",label:"Mix Color"}]}
                    onSave={saveColor} onDelete={()=>{}} onClose={()=>{setColorModal(null);setFormError(null);}} saving={saving} error={formError} />
            )}
            {caseModal && (
                <CrudModal title="Case" icon={Box} form={caseForm} setForm={setCaseForm} mode={caseModal?.mode||"add"}
                    fields={[{key:"case_name",label:"Case Name *",span2:true},{key:"case_sh",label:"Code"},{key:"factor",label:"Factor",type:"number"},{key:"case_high",label:"Height",type:"number"},{key:"case_long",label:"Length",type:"number"},{key:"case_wide",label:"Width",type:"number"},{key:"weight",label:"Weight KG",type:"number"},{key:"cubic_feet",label:"Cubic Feet",type:"number"},{key:"cases_pallet",label:"Cases/Pallet",type:"number"},{key:"boxtype",label:"Box Type"},{type:"checkbox",key:"display",label:"Show in Product"}]}
                    onSave={saveCase} onDelete={()=>{}} onClose={()=>{setCaseModal(null);setFormError(null);}} saving={saving} error={formError} />
            )}
            {varietyModal && (
                <CrudModal title="Variety" icon={Layers} form={varietyForm} setForm={setVarietyForm} mode={varietyModal.mode}
                    fields={[{key:"variety",label:"Variety Name *"},{key:"variety_sh",label:"Code (4 chars)"},{type:"checkbox",key:"display",label:"Show in Product"},{type:"checkbox",key:"changecolor",label:"Change Color"},{type:"checkbox",key:"active",label:"Active"}]}
                    onSave={saveVariety} onDelete={deleteVariety} onClose={()=>{setVarietyModal(null);setFormError(null);}} saving={saving} error={formError} />
            )}
            {productModal && productModal.mode !== "delete" && (
                <ProductsModal
                    mode={productModal.mode}
                    form={productForm}
                    setForm={setProductForm}
                    lookups={lookups}
                    varietyName={selVariety?.variety}
                    onSave={saveProduct}
                    onClose={() => { setProductModal(null); setFormError(null); }}
                    saving={saving}
                    error={formError}
                />
            )}
            {productModal?.mode === "delete" && (
                <CrudModal title="Delete Product" icon={Package} form={productForm} setForm={setProductForm} mode="delete"
                    fields={[]} onSave={()=>{}} onDelete={deleteProduct}
                    onClose={()=>{setProductModal(null);setFormError(null);}} saving={saving} error={formError} />
            )}
        </div>
    );
}
