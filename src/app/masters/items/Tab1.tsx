"use client";

import { useEffect, useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    ChevronRight, Plus, Pencil, Trash2, Save, X, RefreshCcw,
    Check, XCircle, Search, Tag, Layers, Box, Palette, Package, Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AuditLogModal } from "@/components/AuditLogModal";
import { useAuditLog } from "@/lib/audit";
import { usePagePermissions, PERMISSION_MSGS } from "@/lib/permissions";

const t   = (v: any) => String(v ?? "").trim();
const sF  = async (url: string) => { const r = await fetch(url); const j = await r.json(); if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`); return j; };

// ─── Inline CrudModal ─────────────────────────────────────────────────────────
function CrudModal({ title, icon: Icon, form, setForm, fields, onSave, onDelete, onClose, saving, error, mode }: any) {
    const isDelete = mode === "delete";
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 sm:p-4">
            <div className="bg-white rounded-t-xl sm:rounded-xl shadow-2xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto">
                <div className="h-10 bg-[#374151] rounded-t-xl flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-2">
                        <Icon size={15} className="text-[#FB7506]"/>
                        <span className="fos-grid-header-text">{mode === "add" ? "Add" : mode === "edit" ? "Edit" : "Delete"} — {title}</span>
                        {error && <span className="text-amber-400 text-[10px] font-bold ml-2 truncate">{error}</span>}
                    </div>
                    <button onClick={onClose}><XCircle size={16} className="text-gray-400 hover:text-white"/></button>
                </div>
                <div className="p-4">
                    {isDelete ? (
                        <div className="flex flex-col items-center gap-3 py-2">
                            <Trash2 size={28} className="text-red-400"/>
                            <p className="text-sm text-gray-600 text-center">Delete this record? This cannot be undone.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            {fields.map((f: any) => {
                                if (f.type === "checkbox") return (
                                    <label key={f.key} className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={!!form[f.key]} onChange={e=>setForm((p: any)=>({...p,[f.key]:e.target.checked}))} className="w-4 h-4 accent-[#FB7506]"/>
                                        <span className="text-xs font-semibold text-gray-600">{f.label}</span>
                                    </label>
                                );
                                return (
                                    <div key={f.key} className={cn("flex flex-col gap-0.5", f.span2 && "col-span-2")}>
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{f.label}</label>
                                        <input type={f.type||"text"} value={form[f.key]||""} readOnly={!!f.readOnly}
                                            onChange={e=>setForm((p: any)=>({...p,[f.key]:f.type==="number"?parseFloat(e.target.value)||0:e.target.value}))}
                                            className={cn("fos-input py-1.5", f.readOnly && "bg-gray-50 text-gray-500")}/>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                <div className="flex justify-end gap-2 px-4 py-3 bg-gray-50 border-t rounded-b-xl">
                    <button onClick={onClose} className="px-4 py-2 rounded border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
                    <button onClick={isDelete ? onDelete : onSave} disabled={saving}
                        className={cn("flex items-center gap-2 px-4 py-2 rounded text-white text-sm font-black uppercase disabled:opacity-50",
                            isDelete ? "bg-red-600 hover:bg-red-700" : "bg-[#FB7506] hover:bg-orange-600")}>
                        {saving ? <RefreshCcw size={13} className="animate-spin"/> : isDelete ? <Trash2 size={13}/> : <Save size={13}/>}
                        {saving ? "..." : isDelete ? "Delete" : mode==="add" ? "Create" : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Right-panel card ─────────────────────────────────────────────────────────
function RightCard({ icon: Icon, title, loading, recordId, menuItems, children }: any) {
    const [open, setOpen] = useState(false);
    const COLORS: Record<string,{icon:string;text:string}> = {
        green:{icon:"text-green-600",text:"text-green-700"}, blue:{icon:"text-blue-500",text:"text-gray-800"},
        red:{icon:"text-red-500",text:"text-gray-800"}, gray:{icon:"text-gray-500",text:"text-gray-700"},
    };
    return (
        <div className="flex flex-col overflow-hidden flex-1 min-h-0">
            <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-0 shrink-0">
                <div className="flex items-center gap-2">
                    <Icon size={15} className="text-[#FB7506]"/>
                    <span className="fos-grid-header-text">{title}</span>
                    <AuditLogModal recordId={recordId} disabled={!recordId}/>
                    {loading && <RefreshCcw size={11} className="text-gray-400 animate-spin"/>}
                </div>
                <div className="relative">
                    <button onClick={()=>setOpen(o=>!o)} className="h-10 bg-[#FB7506] hover:bg-orange-600 w-24 flex items-center justify-center rounded-tr-lg cursor-pointer">
                        <Menu size={20} className="text-white"/>
                    </button>
                    {open && <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-2xl z-50" onMouseLeave={()=>setOpen(false)}>
                        {menuItems.map((item: any, i: number) => {
                            const c = COLORS[item.color]||COLORS.gray;
                            return <button key={i} onClick={()=>{item.onClick();setOpen(false);}} disabled={!!item.disabled}
                                className={cn("w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 disabled:opacity-40 transition-colors", i<menuItems.length-1&&"border-b border-gray-100")}>
                                <item.icon size={18} className={c.icon}/>
                                <span className={cn("text-sm font-bold",c.text)}>{item.label}</span>
                            </button>;
                        })}
                    </div>}
                </div>
            </div>
            <div className="overflow-auto flex-1">{children}</div>
        </div>
    );
}

// ─── Empty forms ──────────────────────────────────────────────────────────────
const EMPTY_CLASS    = { clase:"", class_sh:"", display:true };
const EMPTY_SUBCLASS = { subclase:"", sub_sh:"", display:true, atpda_tax:0 };
const EMPTY_GRADE    = { grado:"", grade_sh:"", display:true, fnational:false };
const EMPTY_COLOR    = { color:"", color_sh:"", display:true, mix:false };
const EMPTY_CASE     = { case_name:"", case_sh:"", display:true, factor:1, case_high:0, case_long:0, case_wide:0, weight:0, cubic_feet:0, cases_pallet:0, boxtype:"", charges:0 };
const EMPTY_VARIETY  = { variety:"", variety_sh:"", color_uq:"", display:true, changecolor:false, active:true };

// ─── Tab1 Props ───────────────────────────────────────────────────────────────
interface Tab1Props {
    selSubclass:    any;
    setSelSubclass: (s: any) => void;
    selVariety:     any;
    setSelVariety:  (v: any) => void;
}

export default function Tab1({ selSubclass, setSelSubclass, selVariety, setSelVariety }: Tab1Props) {
    const qc = useQueryClient();
    const { logAction } = useAuditLog("items-setup", "flower_varieties");
    const perms         = usePagePermissions("items-setup");

    // ── Tree state ────────────────────────────────────────────────────────────
    const [expandedCl,  setExpandedCl]  = useState<Set<string>>(new Set());
    const [expandedSc,  setExpandedSc]  = useState<Set<string>>(new Set());
    const [expandedVr,  setExpandedVr]  = useState<Set<string>>(new Set());
    const [subclaMap,   setSubclaMap]   = useState<Record<string, any[]>>({});
    const [vrMap,       setVrMap]       = useState<Record<string, any[]>>({});
    const [productsMap, setProductsMap] = useState<Record<string, any[]>>({});
    const [loadingNode, setLoadingNode] = useState<Set<string>>(new Set());
    const [classSearch, setClassSearch] = useState("");

    // ── Queries ───────────────────────────────────────────────────────────────
    const { data: classes = [], isFetching: loadingCl, refetch: refetchCl } =
        useQuery({ queryKey:["t1-cl", classSearch], queryFn:()=>sF(`/api/masters/items/classes?search=${encodeURIComponent(classSearch||"%")}`), staleTime:30000 });
    const { data: grades  = [], isFetching: loadingGr, refetch: refetchGr } =
        useQuery({ queryKey:["t1-gr"], queryFn:()=>sF("/api/masters/items/grades"), staleTime:60000 });
    const { data: colors  = [], isFetching: loadingCo, refetch: refetchCo } =
        useQuery({ queryKey:["t1-co"], queryFn:()=>sF("/api/masters/items/colors"), staleTime:60000 });
    const { data: cases   = [], isFetching: loadingCs, refetch: refetchCs } =
        useQuery({ queryKey:["t1-cs"], queryFn:()=>sF("/api/masters/items/cases"), staleTime:60000 });

    // ── Modal state ───────────────────────────────────────────────────────────
    const [modal,   setModal]   = useState<{type:"class"|"subclass"|"grade"|"color"|"case"|"variety"; mode:"add"|"edit"|"delete"; target?: any}|null>(null);
    const [form,    setForm]    = useState<any>({});
    const [saving,  setSaving]  = useState(false);
    const [mError,  setMError]  = useState<string|null>(null);

    // ── Tree: expand class ─────────────────────────────────────────────────────
    const toggleClass = useCallback(async (cls: any) => {
        const unico = cls.unico;
        setExpandedCl(prev => { const s = new Set(prev); s.has(unico) ? s.delete(unico) : s.add(unico); return s; });
        if (!subclaMap[unico]) {
            setLoadingNode(p => new Set([...p, unico]));
            try {
                const data = await sF(`/api/masters/items/subclasses?class_uq=${encodeURIComponent(unico)}`);
                setSubclaMap(p => ({...p, [unico]: data}));
            } finally { setLoadingNode(p => { const s = new Set(p); s.delete(unico); return s; }); }
        }
    }, [subclaMap]);

    // ── Tree: expand subclass ──────────────────────────────────────────────────
    const toggleSubclass = useCallback(async (sub: any) => {
        const unico = sub.unico;
        const willExpand = !expandedSc.has(unico);
        setExpandedSc(prev => { const s = new Set(prev); s.has(unico) ? s.delete(unico) : s.add(unico); return s; });
        if (willExpand) {
            setSelSubclass(sub);
            setSelVariety(null);
        } else {
            setSelSubclass(null);
            setSelVariety(null);
        }
        if (willExpand && !vrMap[unico]) {
            setLoadingNode(p => new Set([...p, unico]));
            try {
                const data = await sF(`/api/masters/items/varieties?subclass_uq=${encodeURIComponent(unico)}`);
                setVrMap(p => ({...p, [unico]: data}));
            } finally { setLoadingNode(p => { const s = new Set(p); s.delete(unico); return s; }); }
        }
    }, [vrMap, expandedSc, setSelSubclass, setSelVariety]);

    // ── Tree: expand variety → products ────────────────────────────────────────
    const toggleVariety = useCallback(async (vr: any) => {
        const unico = vr.unico;
        const willExpand = !expandedVr.has(unico);
        setExpandedVr(prev => { const s = new Set(prev); s.has(unico) ? s.delete(unico) : s.add(unico); return s; });
        setSelVariety(vr);
        if (willExpand && !productsMap[unico]) {
            setLoadingNode(p => new Set([...p, unico]));
            try {
                const data = await sF(`/api/masters/items/products?variety_uq=${encodeURIComponent(unico)}`);
                setProductsMap(p => ({...p, [unico]: data}));
            } finally { setLoadingNode(p => { const s = new Set(p); s.delete(unico); return s; }); }
        }
    }, [productsMap, expandedVr, setSelVariety]);

    // ── CRUD save ─────────────────────────────────────────────────────────────
    const doSave = async () => {
        if (!modal) return;
        setSaving(true); setMError(null);
        const { type, mode, target } = modal;
        try {
            let url = "", method = "POST", body: any = form;
            if (type === "class") {
                if (mode === "add")    { url = "/api/masters/items/classes"; }
                else if (mode === "edit") { url = `/api/masters/items/classes/${target.unico}`; method = "PUT"; }
                else { url = `/api/masters/items/classes/${target.unico}`; method = "DELETE"; body = {}; }
            } else if (type === "subclass") {
                if (mode === "add")    { url = "/api/masters/items/subclasses"; body = {...form, class_uq: target?.classUnico}; }
                else if (mode === "edit") { url = `/api/masters/items/subclasses/${target.unico}`; method = "PUT"; }
                else { url = `/api/masters/items/subclasses/${target.unico}`; method = "DELETE"; body = {}; }
            } else if (type === "variety") {
                if (mode === "add")    { url = "/api/masters/items/varieties"; body = {...form, subcla_uq: target?.subclaUnico}; }
                else if (mode === "edit") { url = `/api/masters/items/varieties/${target.unico}`; method = "PUT"; body = {...form, subcla_uq: target.subcla_uq}; }
                else { url = `/api/masters/items/varieties/${target.unico}`; method = "DELETE"; body = {}; }
            } else if (type === "grade") {
                if (mode === "add")    { url = "/api/masters/items/grades"; }
                else if (mode === "edit") { url = `/api/masters/items/grades/${target.unico}`; method = "PUT"; }
                else { url = `/api/masters/items/grades/${target.unico}`; method = "DELETE"; body = {}; }
            } else if (type === "color") {
                if (mode === "add")    { url = "/api/masters/items/colors"; }
                else if (mode === "edit") { url = `/api/masters/items/colors/${target.unico}`; method = "PUT"; }
                else { url = `/api/masters/items/colors/${target.unico}`; method = "DELETE"; body = {}; }
            } else if (type === "case") {
                if (mode === "add")    { url = "/api/masters/items/cases"; }
                else if (mode === "edit") { url = `/api/masters/items/cases/${target.unico}`; method = "PUT"; }
                else { url = `/api/masters/items/cases/${target.unico}`; method = "DELETE"; body = {}; }
            }
            const res = await fetch(url, { method, headers:{"Content-Type":"application/json"}, body: method!=="DELETE"?JSON.stringify(body):undefined });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            const actionMap: Record<string, "Insert"|"Edit"|"Delete"> = { add:"Insert", edit:"Edit", delete:"Delete" };
            logAction(actionMap[mode], data.unico||target?.unico||"", `${type} ${mode}`);
            // Invalidate relevant caches
            if (type === "class")    { refetchCl(); if (mode==="delete") { setSubclaMap(p=>{const m={...p}; delete m[target.unico]; return m;}); } }
            if (type === "subclass") { const clUnico = target?.classUnico; if (clUnico) setSubclaMap(p=>({...p,[clUnico]:(p[clUnico]||[]).filter((s:any)=>s.unico!==target?.unico)})); setVrMap(p=>{const m={...p}; delete m[target?.unico]; return m;}); }
            if (type === "variety")  { const scUnico = target?.subclaUnico||target?.subcla_uq; if (scUnico) { const data2 = await sF(`/api/masters/items/varieties?subclass_uq=${scUnico}&search=%`); setVrMap(p=>({...p,[scUnico]:data2})); } }
            if (type === "grade")   refetchGr();
            if (type === "color")   refetchCo();
            if (type === "case")    refetchCs();
            setModal(null);
        } catch(e:any) { setMError(e.message); }
        finally { setSaving(false); }
    };

    const openModal = (type: typeof modal extends null ? never : NonNullable<typeof modal>["type"], mode: "add"|"edit"|"delete", target?: any, defaults?: any) => {
        if (mode==="add"    && !perms.canCreate) { setMError(PERMISSION_MSGS.create); return; }
        if (mode==="edit"   && !perms.canEdit)   { setMError(PERMISSION_MSGS.edit);   return; }
        if (mode==="delete" && !perms.canDelete) { setMError(PERMISSION_MSGS.delete); return; }
        setMError(null);
        setForm(mode==="add" ? (defaults||{}) : { ...target });
        setModal({ type, mode, target });
    };

    // ── Modal field definitions ────────────────────────────────────────────────
    const FIELDS: Record<string, any[]> = {
        class:    [{key:"clase",label:"Class Name *",span2:true},{key:"class_sh",label:"Code (4)"},{type:"checkbox",key:"display",label:"Show in Product"}],
        subclass: [{key:"subclase",label:"Subclass Name *",span2:true},{key:"sub_sh",label:"Code (4)"},{key:"atpda_tax",label:"ATPDA Tax",type:"number"},{type:"checkbox",key:"display",label:"Show in Product"}],
        variety:  [{key:"variety",label:"Variety Name *"},{key:"variety_sh",label:"Code (4)"},{type:"checkbox",key:"display",label:"Show in Product"},{type:"checkbox",key:"changecolor",label:"Change Color"},{type:"checkbox",key:"active",label:"Active"}],
        grade:    [{key:"grado",label:"Grade Name *"},{key:"grade_sh",label:"Code (4)"},{type:"checkbox",key:"display",label:"Show"},{type:"checkbox",key:"fnational",label:"National"}],
        color:    [{key:"color",label:"Color Name *"},{key:"color_sh",label:"Code (4)"},{type:"checkbox",key:"display",label:"Show"},{type:"checkbox",key:"mix",label:"Mix"}],
        case:     [{key:"case_name",label:"Case Name *",span2:true},{key:"case_sh",label:"Code"},{key:"factor",label:"Factor",type:"number"},{key:"weight",label:"Weight KG",type:"number"},{type:"checkbox",key:"display",label:"Show"}],
    };
    const ICONS: Record<string,any>  = { class:Tag, subclass:Tag, variety:Layers, grade:Layers, color:Palette, case:Box };

    // Filtered classes
    const filteredClasses = classSearch.trim()
        ? (classes as any[]).filter((c:any) => t(c.clase).toLowerCase().includes(classSearch.toLowerCase()))
        : classes as any[];

    return (
        <div className="flex gap-1.5 flex-1 p-1.5 overflow-hidden">
            {/* ── Left: Hierarchy Tree ────────────────────────────────────────── */}
            <div className="flex flex-col overflow-hidden bg-white rounded-lg border border-gray-200 shadow-sm" style={{width:"58%"}}>
                {/* Tree header */}
                <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-0 shrink-0">
                    <div className="flex items-center gap-2">
                        <Tag size={15} className="text-[#FB7506]"/>
                        <span className="fos-grid-header-text">Item Hierarchy</span>
                        {loadingCl && <RefreshCcw size={11} className="text-gray-400 animate-spin"/>}
                    </div>
                    <button onClick={()=>openModal("class","add",undefined,{...EMPTY_CLASS})} disabled={!perms.canCreate}
                        className="h-10 bg-[#FB7506] hover:bg-orange-600 disabled:opacity-40 text-white px-4 flex items-center gap-2 rounded-tr-lg cursor-pointer">
                        <Plus size={16}/><span className="text-xs font-black uppercase">Add Class</span>
                    </button>
                </div>
                {/* Search */}
                <div className="px-2 py-1.5 border-b border-gray-100 shrink-0">
                    <div className="relative">
                        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                        <input value={classSearch} onChange={e=>setClassSearch(e.target.value)} placeholder="Filter classes..."
                            className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-md outline-none focus:ring-1 focus:ring-[#FB7506]"/>
                    </div>
                </div>
                {/* Tree scroll */}
                <div className="overflow-y-auto flex-1 p-2 space-y-1.5">
                    {(filteredClasses as any[]).map((cls: any) => {
                        const isExpCl   = expandedCl.has(cls.unico);
                        const isLoadCl  = loadingNode.has(cls.unico);
                        const subclasses: any[] = subclaMap[cls.unico] || [];
                        return (
                            <div key={cls.unico} className="rounded-lg overflow-hidden border border-black/10">
                                {/* Class row */}
                                <div className={cn("h-12 bg-[#374151] flex items-center gap-2.5 px-3 cursor-pointer hover:bg-[#2d3748] transition-colors select-none",
                                    isExpCl && "rounded-b-none")}
                                    onClick={()=>toggleClass(cls)}>
                                    <ChevronRight size={14} className={cn("text-[#FB7506] transition-transform shrink-0", isExpCl && "rotate-90")}/>
                                    {isLoadCl ? <RefreshCcw size={13} className="text-[#FB7506] animate-spin shrink-0"/> : <Tag size={13} className="text-[#FB7506] shrink-0"/>}
                                    <div className="flex-1 min-w-0 flex items-baseline gap-2">
                                        <span className="text-white font-bold text-sm truncate">{t(cls.clase)}</span>
                                        <span className="text-gray-400 text-[10px] shrink-0">{t(cls.class_sh)}</span>
                                    </div>
                                    {isExpCl && subclasses.length > 0 && (
                                        <span className="text-[10px] text-gray-400 bg-black/20 px-2 py-0.5 rounded-full shrink-0">{subclasses.length} sub</span>
                                    )}
                                    {cls.display && <Check size={11} className="text-green-400 shrink-0"/>}
                                    {/* Class actions */}
                                    <div className="flex gap-1 shrink-0" onClick={e=>e.stopPropagation()}>
                                        <button onClick={()=>openModal("class","edit",cls)} className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white"><Pencil size={12}/></button>
                                        <button onClick={()=>openModal("class","delete",cls)} className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-red-400"><Trash2 size={12}/></button>
                                        <button onClick={()=>openModal("subclass","add",{classUnico:cls.unico},{...EMPTY_SUBCLASS})} className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-green-400"><Plus size={12}/></button>
                                    </div>
                                </div>
                                {/* Subclasses */}
                                {isExpCl && (
                                    <div className="bg-gray-50 border-t border-gray-700/20 divide-y divide-gray-200">
                                        {subclasses.length === 0 && !isLoadCl && (
                                            <div className="px-8 py-2 text-xs text-gray-400 italic">No subclasses</div>
                                        )}
                                        {subclasses.map((sub: any) => {
                                            const isExpSc  = expandedSc.has(sub.unico);
                                            const isLoadSc = loadingNode.has(sub.unico);
                                            const varieties: any[] = vrMap[sub.unico] || [];
                                            const isSel    = selSubclass?.unico === sub.unico;
                                            return (
                                                <div key={sub.unico}>
                                                    {/* Subclass row */}
                                                    <div className={cn("h-10 flex items-center gap-2 px-4 cursor-pointer select-none transition-colors",
                                                        isExpSc ? "bg-gray-700" : "hover:bg-gray-200",
                                                        isSel && !isExpSc && "bg-blue-50")}
                                                        onClick={()=>toggleSubclass(sub)}>
                                                        <ChevronRight size={12} className={cn("transition-transform shrink-0", isExpSc ? "text-[#FB7506] rotate-90" : "text-gray-400")}/>
                                                        {isLoadSc ? <RefreshCcw size={11} className="text-[#FB7506] animate-spin shrink-0"/> : <Layers size={11} className={isExpSc?"text-[#FB7506] shrink-0":"text-gray-400 shrink-0"}/>}
                                                        <div className="flex-1 min-w-0 flex items-baseline gap-2">
                                                            <span className={cn("font-semibold text-xs truncate", isExpSc?"text-white":"text-gray-700")}>{t(sub.subclase)}</span>
                                                            <span className={cn("text-[10px] shrink-0", isExpSc?"text-gray-300":"text-gray-400")}>{t(sub.sub_sh)}</span>
                                                        </div>
                                                        {isExpSc && varieties.length > 0 && <span className="text-[10px] text-gray-300 bg-black/20 px-2 py-0.5 rounded-full shrink-0">{varieties.length} var</span>}
                                                        <div className="flex gap-1 shrink-0" onClick={e=>e.stopPropagation()}>
                                                            <button onClick={()=>openModal("subclass","edit",{...sub,classUnico:cls.unico})} className={cn("p-1 rounded hover:bg-white/10", isExpSc?"text-gray-300":"text-gray-400")}><Pencil size={11}/></button>
                                                            <button onClick={()=>openModal("subclass","delete",{...sub,classUnico:cls.unico})} className={cn("p-1 rounded hover:bg-white/10", isExpSc?"text-gray-300":"text-red-400")}><Trash2 size={11}/></button>
                                                            <button onClick={()=>openModal("variety","add",{subclaUnico:sub.unico},{...EMPTY_VARIETY})} className={cn("p-1 rounded hover:bg-white/10", isExpSc?"text-gray-300":"text-green-500")}><Plus size={11}/></button>
                                                        </div>
                                                    </div>
                                                    {/* Varieties */}
                                                    {isExpSc && (
                                                        <div className="bg-white border-t border-gray-600/20">
                                                            {isLoadSc && <div className="px-12 py-2 flex items-center gap-2 text-xs text-gray-400"><RefreshCcw size={10} className="animate-spin"/>Loading varieties...</div>}
                                                            {!isLoadSc && varieties.length === 0 && (
                                                                <div className="px-12 py-2 text-xs text-gray-400 italic">No varieties</div>
                                                            )}
                                                            {varieties.map((vr: any) => {
                                                                const isSelVr  = selVariety?.unico === vr.unico;
                                                                const isExpVr  = expandedVr.has(vr.unico);
                                                                const isLoadVr = loadingNode.has(vr.unico);
                                                                const products: any[] = productsMap[vr.unico] || [];
                                                                return (
                                                                    <div key={vr.unico} className="border-b border-gray-100 last:border-b-0">
                                                                        {/* Variety row */}
                                                                        <div className={cn("h-9 flex items-center gap-2 px-8 cursor-pointer transition-colors select-none",
                                                                            isSelVr ? "bg-blue-50" : "hover:bg-gray-50")}
                                                                            onClick={()=>toggleVariety(vr)}>
                                                                            <ChevronRight size={11} className={cn("transition-transform shrink-0", isExpVr?"text-[#FB7506] rotate-90":"text-gray-300")}/>
                                                                            {isLoadVr ? <RefreshCcw size={10} className="text-[#FB7506] animate-spin shrink-0"/> : <div className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0"/>}
                                                                            <span className={cn("text-xs font-medium flex-1 truncate", isSelVr?"text-blue-700":"text-gray-700")}>{t(vr.variety)}</span>
                                                                            <span className="text-[10px] text-gray-400 shrink-0">{t(vr.color)}</span>
                                                                            {isExpVr && products.length > 0 && <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 rounded-full shrink-0">{products.length}</span>}
                                                                            {vr.active ? <Check size={10} className="text-green-500 shrink-0"/> : <span className="text-[10px] text-gray-300 shrink-0">off</span>}
                                                                            <AuditLogModal recordId={vr.unico} disabled={!vr.unico}/>
                                                                            <div className="flex gap-0.5 shrink-0" onClick={e=>e.stopPropagation()}>
                                                                                <button onClick={()=>openModal("variety","edit",{...vr,subcla_uq:sub.unico})} className="p-1 rounded hover:bg-gray-200 text-gray-300 hover:text-blue-500"><Pencil size={10}/></button>
                                                                                <button onClick={()=>openModal("variety","delete",{...vr,subcla_uq:sub.unico,subclaUnico:sub.unico})} className="p-1 rounded hover:bg-gray-200 text-gray-300 hover:text-red-500"><Trash2 size={10}/></button>
                                                                            </div>
                                                                        </div>
                                                                        {/* Products */}
                                                                        {isExpVr && (
                                                                            <div className="bg-gray-50 divide-y divide-gray-100 border-t border-gray-200">
                                                                                {isLoadVr && <div className="px-14 py-1.5 flex items-center gap-2 text-[10px] text-gray-400"><RefreshCcw size={9} className="animate-spin"/>Loading products...</div>}
                                                                                {!isLoadVr && products.length === 0 && <div className="px-14 py-1.5 text-[10px] text-gray-400 italic">No products</div>}
                                                                                {products.map((p: any) => (
                                                                                    <div key={p.unico} className="h-8 flex items-center gap-2 px-14">
                                                                                        <Package size={10} className="text-gray-300 shrink-0"/>
                                                                                        <span className="text-[11px] text-gray-600 flex-1 truncate font-medium">{t(p.description)}</span>
                                                                                        <span className="text-[10px] text-gray-400 shrink-0">{t(p.case_sh)}</span>
                                                                                        {p.active ? <Check size={9} className="text-green-400 shrink-0"/> : <span className="text-[9px] text-gray-300">off</span>}
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {!loadingCl && filteredClasses.length === 0 && (
                        <div className="p-8 text-center text-gray-400 text-sm italic">No classes found</div>
                    )}
                </div>
            </div>

            {/* ── Right: Grades + Colors + Cases ──────────────────────────────── */}
            <div className="flex flex-col gap-1.5 overflow-hidden" style={{width:"42%"}}>

                {/* Grades */}
                <RightCard icon={Layers} title="Grades" loading={loadingGr} recordId={undefined}
                    menuItems={[
                        { label:"Add Grade",   icon:Plus,   color:"green", onClick:()=>openModal("grade","add",undefined,{...EMPTY_GRADE}) },
                    ]}>
                    <table className="min-w-full text-left">
                        <thead className="bg-gray-100 border-b border-gray-200 text-gray-700 sticky top-0 z-10">
                            <tr className="fos-grid-thead">
                                <th className="p-2 border-r border-gray-200">Grade</th>
                                <th className="p-2 border-r border-gray-200 w-16">Code</th>
                                <th className="p-2 border-r border-gray-200 w-12 text-center">Show</th>
                                <th className="p-2 w-12 text-center">Nat.</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 fos-grid-tbody">
                            {(grades as any[]).map((g:any) => (
                                <tr key={g.unico} className="hover:bg-gray-50 cursor-pointer group">
                                    <td className="p-2 font-medium border-r border-gray-100">{t(g.grado)}</td>
                                    <td className="p-2 text-gray-500 border-r border-gray-100">{t(g.grade_sh)}</td>
                                    <td className="p-2 text-center border-r border-gray-100">{g.display?<Check size={11} className="text-green-500 mx-auto"/>:"—"}</td>
                                    <td className="p-2 text-center">{g.fnational?<Check size={11} className="text-blue-400 mx-auto"/>:"—"}</td>
                                </tr>
                            ))}
                            {!loadingGr && (grades as any[]).length===0 && <tr><td colSpan={4} className="p-4 text-center text-gray-300 italic text-xs">No grades</td></tr>}
                        </tbody>
                    </table>
                </RightCard>

                {/* Colors */}
                <RightCard icon={Palette} title="Colors" loading={loadingCo} recordId={undefined}
                    menuItems={[
                        { label:"Add Color", icon:Plus, color:"green", onClick:()=>openModal("color","add",undefined,{...EMPTY_COLOR}) },
                    ]}>
                    <table className="min-w-full text-left">
                        <thead className="bg-gray-100 border-b border-gray-200 text-gray-700 sticky top-0 z-10">
                            <tr className="fos-grid-thead">
                                <th className="p-2 border-r border-gray-200">Color</th>
                                <th className="p-2 border-r border-gray-200 w-16">Code</th>
                                <th className="p-2 border-r border-gray-200 w-12 text-center">Show</th>
                                <th className="p-2 w-12 text-center">Mix</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 fos-grid-tbody">
                            {(colors as any[]).map((c:any) => (
                                <tr key={c.unico} className="hover:bg-gray-50 cursor-pointer">
                                    <td className="p-2 font-medium border-r border-gray-100">{t(c.color)}</td>
                                    <td className="p-2 text-gray-500 border-r border-gray-100">{t(c.color_sh)}</td>
                                    <td className="p-2 text-center border-r border-gray-100">{c.display?<Check size={11} className="text-green-500 mx-auto"/>:"—"}</td>
                                    <td className="p-2 text-center">{c.mix?<Check size={11} className="text-blue-400 mx-auto"/>:"—"}</td>
                                </tr>
                            ))}
                            {!loadingCo && (colors as any[]).length===0 && <tr><td colSpan={4} className="p-4 text-center text-gray-300 italic text-xs">No colors</td></tr>}
                        </tbody>
                    </table>
                </RightCard>

                {/* Cases */}
                <RightCard icon={Box} title="Cases" loading={loadingCs} recordId={undefined}
                    menuItems={[
                        { label:"Add Case", icon:Plus, color:"green", onClick:()=>openModal("case","add",undefined,{...EMPTY_CASE}) },
                    ]}>
                    <table className="min-w-full text-left">
                        <thead className="bg-gray-100 border-b border-gray-200 text-gray-700 sticky top-0 z-10">
                            <tr className="fos-grid-thead">
                                <th className="p-2 border-r border-gray-200">Name</th>
                                <th className="p-2 border-r border-gray-200 w-16">Code</th>
                                <th className="p-2 border-r border-gray-200 w-16 text-right">Factor</th>
                                <th className="p-2 w-12 text-center">Show</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 fos-grid-tbody">
                            {(cases as any[]).map((c:any) => (
                                <tr key={c.unico} className="hover:bg-gray-50 cursor-pointer">
                                    <td className="p-2 font-medium border-r border-gray-100">{t(c.case_name)}</td>
                                    <td className="p-2 text-gray-500 border-r border-gray-100">{t(c.case_sh)}</td>
                                    <td className="p-2 text-right border-r border-gray-100">{parseFloat(c.factor||0).toFixed(2)}</td>
                                    <td className="p-2 text-center">{c.display?<Check size={11} className="text-green-500 mx-auto"/>:"—"}</td>
                                </tr>
                            ))}
                            {!loadingCs && (cases as any[]).length===0 && <tr><td colSpan={4} className="p-4 text-center text-gray-300 italic text-xs">No cases</td></tr>}
                        </tbody>
                    </table>
                </RightCard>
            </div>

            {/* ── Modal ──────────────────────────────────────────────────────── */}
            {modal && (
                <CrudModal
                    title={`${modal.type.charAt(0).toUpperCase()+modal.type.slice(1)}`}
                    icon={ICONS[modal.type]||Tag}
                    form={form} setForm={setForm}
                    mode={modal.mode}
                    fields={FIELDS[modal.type]||[]}
                    onSave={doSave}
                    onDelete={doSave}
                    onClose={()=>{setModal(null);setMError(null);}}
                    saving={saving} error={mError}/>
            )}
        </div>
    );
}
