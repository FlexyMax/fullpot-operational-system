"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useQuery, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import {
    Plus, Pencil, Trash2, Save, X, RefreshCcw, Search, Check, XCircle,
    Layers, Box, ClipboardList, Calendar, ChevronDown, Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuditLog } from "@/lib/audit";
import { usePagePermissions, PERMISSION_MSGS } from "@/lib/permissions";

const t  = (v: any) => String(v ?? "").trim();
const n2 = (v: any) => parseFloat(v ?? 0).toFixed(2);
const sF = async (url: string) => { const r = await fetch(url); const j = await r.json(); if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`); return j; };
const NO_COMP = "There isn't a selected component. / No hay componente seleccionado.";
const PAGE_SIZE = 50;
const nextPage  = (last: any) => (last.page ?? 1) * (last.pageSize ?? PAGE_SIZE) < (last.total ?? 0) ? (last.page ?? 1) + 1 : undefined;
const getPages  = (data: any) => data?.pages?.flatMap((p: any) => p.records ?? p) ?? [];
const getTotal  = (data: any) => data?.pages?.[0]?.total ?? 0;

function useSentinel(onVisible: () => void, enabled: boolean) {
    const ref = useRef<HTMLDivElement>(null);
    const cb  = useCallback(() => { if (enabled) onVisible(); }, [onVisible, enabled]);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) cb(); }, { threshold: 0.1 });
        obs.observe(el);
        return () => obs.disconnect();
    }, [cb]);
    return ref;
}

// ─── Toolbar button ───────────────────────────────────────────────────────────
function Btn({ icon:Icon, label, color="gray", onClick, disabled=false, sm=false }: any) {
    const cls: Record<string,string> = { green:"bg-green-600 hover:bg-green-700", blue:"bg-blue-600 hover:bg-blue-700", red:"bg-red-600 hover:bg-red-700", gray:"bg-gray-600 hover:bg-gray-700", amber:"bg-amber-500 hover:bg-amber-600", purple:"bg-purple-600 hover:bg-purple-700" };
    return (
        <button onClick={onClick} disabled={disabled}
            className={cn("flex items-center gap-1.5 text-white font-black uppercase tracking-wide rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0",
                sm ? "px-2.5 py-1 text-[10px]" : "px-3 py-1.5 text-xs", cls[color]||cls.gray)}>
            {Icon && <Icon size={sm?11:13}/>}{label}
        </button>
    );
}

// ─── Simple mini-grid ─────────────────────────────────────────────────────────
function MiniGrid({ cols, rows, selUnico, onSelect, loading, empty, sentinel }: any) {
    return (
        <div className="overflow-auto flex-1">
            <table className="min-w-full text-left">
                <thead className="bg-gray-100 border-b border-gray-200 text-gray-700 sticky top-0 z-10">
                    <tr className="fos-grid-thead">{cols.map((c: any) => <th key={c.key} className={cn("p-2 whitespace-nowrap border-r border-gray-200 last:border-r-0", c.className)}>{c.label}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-100 fos-grid-tbody">
                    {loading
                        ? <tr><td colSpan={cols.length} className="p-4 text-center text-gray-300 italic text-xs">Loading...</td></tr>
                        : rows.length === 0
                            ? <tr><td colSpan={cols.length} className="p-4 text-center text-gray-300 italic text-xs">{empty}</td></tr>
                            : rows.map((r: any, i: number) => {
                                const isSel = selUnico && selUnico === r.unico;
                                return (
                                    <tr key={r.unico||i} onClick={() => onSelect?.(r)}
                                        className={cn("cursor-pointer transition-colors", isSel ? "!bg-blue-50 ring-1 ring-inset ring-blue-200" : "hover:bg-gray-50/80")}>
                                        {cols.map((c: any) => (
                                            <td key={c.key} className={cn("p-2 border-r border-gray-100 last:border-r-0", c.className)}>
                                                {c.render ? c.render(r[c.key], r) : t(r[c.key])}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })
                    }
                    {sentinel && <tr><td colSpan={cols.length} className="p-0">{sentinel}</td></tr>}
                </tbody>
            </table>
        </div>
    );
}

// ─── VarietyDefinitionModal ───────────────────────────────────────────────────
const EMPTY_VD = { subcla_uq:"", variety_sh:"", variety:"", color_uq:"", display:true, changecolor:false, expi_days:0, nac_days:0, details:"", variety_oldcode:"", tolerance:0, active:true, mix:false };

function VarietyDefinitionModal({ mode, form, setForm, onSave, onDelete, onClose, saving, error }: any) {
    const isDelete = mode === "delete";
    const isEdit   = mode === "edit";

    const { data: subclasses = [] } = useQuery({ queryKey:["vd-sc"], queryFn:()=>sF("/api/masters/items/subclasses?class_uq=%&search=%"), staleTime:60000 });
    const { data: colors     = [] } = useQuery({ queryKey:["items-co"], queryFn:()=>sF("/api/masters/items/colors"), staleTime:60000 });

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 sm:p-4">
            <div className="bg-white rounded-t-xl sm:rounded-xl shadow-2xl w-full sm:max-w-lg flex flex-col h-[85vh] sm:h-[80vh]">
                <div className="h-10 bg-[#374151] rounded-t-xl flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-2">
                        <Layers size={13} className="text-[#FB7506]"/>
                        <span className="font-black text-[10px] uppercase tracking-widest text-white">
                            {mode==="add"?"New":mode==="edit"?"Edit":"Delete"} Variety
                        </span>
                        {error && <span className="text-amber-400 text-[9px] font-bold ml-2 truncate">{error}</span>}
                    </div>
                    <button onClick={onClose}><XCircle size={15} className="text-gray-400 hover:text-white"/></button>
                </div>

                <div className="overflow-y-auto flex-1 p-4 space-y-3 text-xs">
                    {isDelete ? (
                        <div className="flex flex-col items-center gap-3 py-2">
                            <Trash2 size={28} className="text-red-400"/>
                            <p className="text-sm text-gray-600 text-center">Delete variety <strong>{t(form.variety)}</strong>?</p>
                        </div>
                    ) : (
                        <>
                            {/* Class - Subclass */}
                            <div className="flex flex-col gap-0.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase">Class — Subclass *</label>
                                <select value={form.subcla_uq||""} onChange={e=>setForm((p:any)=>({...p,subcla_uq:e.target.value}))} className="fos-input text-xs py-1">
                                    <option value="">— Select —</option>
                                    {(subclasses as any[]).map((s:any)=><option key={s.unico} value={s.unico}>{t(s.display||`${s.clase} — ${s.subclase}`)}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="flex flex-col gap-0.5">
                                    <label className="text-[9px] font-black text-gray-400 uppercase">Code * (4)</label>
                                    <input maxLength={4} value={form.variety_sh||""} onChange={e=>setForm((p:any)=>({...p,variety_sh:e.target.value}))} className="fos-input text-xs py-1"/>
                                </div>
                                <div className="flex flex-col gap-0.5 col-span-2">
                                    <label className="text-[9px] font-black text-gray-400 uppercase">Variety Name *</label>
                                    <input value={form.variety||""} onChange={e=>setForm((p:any)=>({...p,variety:e.target.value}))} className="fos-input text-xs py-1"/>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col gap-0.5">
                                    <label className="text-[9px] font-black text-gray-400 uppercase">Color *</label>
                                    <select value={form.color_uq||""} onChange={e=>setForm((p:any)=>({...p,color_uq:e.target.value}))} className="fos-input text-xs py-1">
                                        <option value="">— None —</option>
                                        {(colors as any[]).map((c:any)=><option key={c.unico} value={c.unico}>{t(c.color)}</option>)}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <label className="text-[9px] font-black text-gray-400 uppercase">EDI Code</label>
                                    <input value={form.variety_oldcode||""} onChange={e=>setForm((p:any)=>({...p,variety_oldcode:e.target.value}))} className="fos-input text-xs py-1"/>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {[{l:"Expir. Days",k:"expi_days"},{l:"Local Days",k:"nac_days"},{l:"PO Tolerance %",k:"tolerance"}].map(f=>(
                                    <div key={f.k} className="flex flex-col gap-0.5">
                                        <label className="text-[9px] font-black text-gray-400 uppercase">{f.l}</label>
                                        <input type="number" min="0" value={form[f.k]||0} onChange={e=>setForm((p:any)=>({...p,[f.k]:parseInt(e.target.value)||0}))} className="fos-input text-xs py-1"/>
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase">Notes</label>
                                <textarea value={form.details||""} rows={2} onChange={e=>setForm((p:any)=>({...p,details:e.target.value}))} className="fos-input text-xs py-1 resize-none"/>
                            </div>
                            <div className="flex flex-wrap gap-4 border-t border-gray-100 pt-2">
                                {[{k:"display",l:"Show in Product"},{k:"changecolor",l:"Change Color"},{k:"mix",l:"Mix"},
                                  ...(isEdit ? [{k:"active",l:"Active"}] : [])].map(f=>(
                                    <label key={f.k} className="flex items-center gap-1.5 cursor-pointer">
                                        <input type="checkbox" checked={!!form[f.k]} onChange={e=>setForm((p:any)=>({...p,[f.k]:e.target.checked}))} className="w-3.5 h-3.5 accent-[#FB7506]"/>
                                        <span className="text-xs font-semibold text-gray-600">{f.l}</span>
                                    </label>
                                ))}
                            </div>
                        </>
                    )}
                </div>
                <div className="flex justify-end gap-2 px-4 py-3 bg-gray-50 border-t rounded-b-xl shrink-0">
                    <button onClick={onClose} className="px-3 py-1.5 rounded border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
                    <button onClick={isDelete ? onDelete : onSave} disabled={saving}
                        className={cn("flex items-center gap-1.5 px-4 py-1.5 rounded text-white text-xs font-black uppercase disabled:opacity-50",
                            isDelete ? "bg-red-600 hover:bg-red-700" : "bg-[#FB7506] hover:bg-orange-600")}>
                        {saving ? <RefreshCcw size={12} className="animate-spin"/> : isDelete ? <Trash2 size={12}/> : <Save size={12}/>}
                        {saving ? "..." : isDelete ? "Delete" : mode==="add" ? "Create" : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── SubclassBOGOModal ────────────────────────────────────────────────────────
function SubclassBOGOModal({ subclaUq, onClose, onSaved }: { subclaUq: string; onClose: ()=>void; onSaved: ()=>void }) {
    const [form,   setForm]   = useState({ bogo: false, bogo_days: 0, bogo_percent: 0 });
    const [saving, setSaving] = useState(false);
    const [err,    setErr]    = useState<string|null>(null);

    const { data: info } = useQuery({ queryKey:["bogo-sc", subclaUq], queryFn:()=>sF(`/api/masters/items/subclass-bogo/${subclaUq}`), enabled:!!subclaUq });

    useEffect(() => {
        if (info) setForm({ bogo: info.bogo === 1 || info.bogo === true, bogo_days: info.bogo_days ?? 0, bogo_percent: info.bogo_percent ?? 0 });
    }, [info]);

    const save = async () => {
        setSaving(true); setErr(null);
        try {
            const res = await fetch(`/api/masters/items/subclass-bogo/${subclaUq}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
            const d = await res.json();
            if (!d.success) throw new Error(d.error);
            onSaved(); onClose();
        } catch(e:any){ setErr(e.message); }
        finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 sm:p-4">
            <div className="bg-white rounded-t-xl sm:rounded-xl shadow-2xl w-full sm:w-72 max-h-[85vh]">
                <div className="h-10 bg-[#374151] rounded-t-xl flex items-center justify-between px-4">
                    <span className="font-black text-[10px] uppercase tracking-widest text-white">SubClass BOGO Setup</span>
                    <button onClick={onClose}><XCircle size={15} className="text-gray-400 hover:text-white"/></button>
                </div>
                <div className="p-4 space-y-3 text-xs">
                    {info && (
                        <div className="bg-gray-50 rounded p-2 text-[10px]">
                            <div><span className="text-gray-400 font-bold">Class: </span>{t(info.clase)}</div>
                            <div><span className="text-gray-400 font-bold">SubClass: </span>{t(info.subclase)}</div>
                        </div>
                    )}
                    {err && <p className="text-red-500 text-[9px] font-bold">{err}</p>}
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.bogo} onChange={e=>setForm(p=>({...p,bogo:e.target.checked}))} className="w-4 h-4 accent-[#FB7506]"/>
                        <span className="font-semibold">BOGO</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-0.5">
                            <label className="text-[9px] font-black text-gray-400 uppercase">BOGO Days</label>
                            <input type="number" min="0" value={form.bogo_days} onChange={e=>setForm(p=>({...p,bogo_days:parseInt(e.target.value)||0}))} className="fos-input text-xs py-1"/>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <label className="text-[9px] font-black text-gray-400 uppercase">BOGO %</label>
                            <input type="number" min="0" step="0.01" value={form.bogo_percent} onChange={e=>setForm(p=>({...p,bogo_percent:parseFloat(e.target.value)||0}))} className="fos-input text-xs py-1"/>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-2 px-4 py-3 bg-gray-50 border-t rounded-b-xl">
                    <button onClick={onClose} className="px-3 py-1.5 rounded border text-xs font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
                    <button onClick={save} disabled={saving} className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-[#FB7506] hover:bg-orange-600 text-white text-xs font-black disabled:opacity-50">
                        {saving ? <RefreshCcw size={12} className="animate-spin"/> : <Save size={12}/>}{saving ? "..." : "OK"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── WarehouseBOGOModal ───────────────────────────────────────────────────────
function WarehouseBOGOModal({ initialSalesmanUq, onClose, logAction }: { initialSalesmanUq?: string; onClose: ()=>void; logAction: any }) {
    const [leftSel,    setLeftSel]    = useState<any>(null);
    const [midSel,     setMidSel]     = useState<any>(null);
    const [rightSel,   setRightSel]   = useState<any>(null);
    const [salesmanUq, setSalesmanUq] = useState(initialSalesmanUq || "");
    const [working,    setWorking]    = useState(false);
    const [err,        setErr]        = useState<string|null>(null);

    const { data: available = [], isFetching: loadL, refetch: refL } = useQuery({ queryKey:["wbogo-avail"], queryFn:()=>sF("/api/masters/items/warehouses-bogo/available"), staleTime:0 });
    const { data: assigned  = [], isFetching: loadM, refetch: refM } = useQuery({ queryKey:["wbogo-asgn"],  queryFn:()=>sF("/api/masters/items/warehouses-bogo"),           staleTime:0 });
    const { data: subclasses= [], isFetching: loadR, refetch: refR } = useQuery({ queryKey:["wbogo-sub", midSel?.unico], queryFn:()=>sF(`/api/masters/items/warehouses-bogo/${midSel.unico}/subclasses`), enabled:!!midSel?.unico, staleTime:0 });
    const { data: salesmen  = [] } = useQuery({ queryKey:["bogo-sales"], queryFn:()=>sF("/api/masters/items/lookups/salesmen"), staleTime:60000 });

    const addWarehouse = async () => {
        if (!leftSel) { setErr("Warehouse empty."); return; }
        if (!salesmanUq) { setErr("Salesman empty."); return; }
        setWorking(true); setErr(null);
        try {
            const res = await fetch("/api/masters/items/warehouses-bogo", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ warehouse_uq: leftSel.unico, salesman_uq: salesmanUq }) });
            const d = await res.json();
            if (!d.success) throw new Error(d.error);
            logAction("Insert", d.unico, "BOGO WH");
            refL(); refM(); setLeftSel(null);
        } catch(e:any){ setErr(e.message); }
        finally { setWorking(false); }
    };

    const removeWarehouse = async () => {
        if (!midSel) return;
        setWorking(true); setErr(null);
        try {
            const res = await fetch(`/api/masters/items/warehouses-bogo/${midSel.unico}`, { method:"DELETE" });
            const d = await res.json();
            if (!d.success) throw new Error(d.error);
            logAction("Delete", midSel.unico, "BOGO WH");
            refL(); refM(); setMidSel(null);
        } catch(e:any){ setErr(e.message); }
        finally { setWorking(false); }
    };

    const removeSubclass = async () => {
        if (!rightSel) return;
        setWorking(true); setErr(null);
        try {
            const res = await fetch(`/api/masters/items/warehouses-bogo/subclass/${rightSel.unico}`, { method:"DELETE" });
            const d = await res.json();
            if (!d.success) throw new Error(d.error);
            refR(); setRightSel(null);
        } catch(e:any){ setErr(e.message); }
        finally { setWorking(false); }
    };

    const listCls  = "flex-1 border border-gray-200 rounded overflow-auto min-h-[200px]";
    const itemCls  = (sel: boolean) => cn("px-2 py-1 text-[10px] cursor-pointer border-b border-gray-50 hover:bg-gray-50", sel && "bg-blue-50 font-bold");
    const emptyLbl = (l: boolean, msg: string) => !l && <div className="p-2 text-center text-[10px] text-gray-300 italic">{msg}</div>;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 sm:p-4">
            <div className="bg-white rounded-t-xl sm:rounded-xl shadow-2xl w-full sm:max-w-3xl flex flex-col h-[85vh] sm:h-[80vh]">
                <div className="h-10 bg-[#374151] rounded-t-xl flex items-center justify-between px-4 shrink-0">
                    <span className="font-black text-[10px] uppercase tracking-widest text-white">BOGO Warehouse Selection</span>
                    {err && <span className="text-amber-300 text-[9px] font-bold ml-3 truncate">{err}</span>}
                    <button onClick={onClose}><XCircle size={15} className="text-gray-400 hover:text-white"/></button>
                </div>
                <div className="flex gap-2 p-3 flex-1 overflow-hidden">
                    {/* List 1 — Available */}
                    <div className="flex-1 flex flex-col gap-1.5">
                        <span className="text-[9px] font-black text-gray-500 uppercase h-5 flex items-center gap-1">
                            Available {loadL && <RefreshCcw size={8} className="animate-spin text-gray-400"/>}
                        </span>
                        <div className={listCls}>
                            {(available as any[]).map((w:any)=>(
                                <div key={w.unico} onClick={()=>setLeftSel(w)} className={itemCls(leftSel?.unico===w.unico)}>{t(w.warehouse)}</div>
                            ))}
                            {emptyLbl(!loadL, "No warehouses")}
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <label className="text-[8px] font-black text-gray-400 uppercase">Salesman</label>
                            <select value={salesmanUq} onChange={e=>setSalesmanUq(e.target.value)} className="fos-input text-[10px] py-0.5">
                                <option value="">— Select —</option>
                                {(salesmen as any[]).map((s:any)=><option key={s.unico} value={s.unico}>{t(s.salesman_name)}</option>)}
                            </select>
                        </div>
                    </div>
                    {/* Center 1 */}
                    <div className="flex flex-col items-center justify-center gap-2 pt-6">
                        <button onClick={addWarehouse} disabled={!leftSel||!salesmanUq||working}
                            className="bg-[#FB7506] hover:bg-orange-600 disabled:opacity-40 text-white text-[9px] font-black px-2 py-1.5 rounded">Add ►</button>
                        <button onClick={removeWarehouse} disabled={!midSel||working}
                            className="bg-gray-600 hover:bg-gray-700 disabled:opacity-40 text-white text-[9px] font-black px-2 py-1.5 rounded">◄ Remove</button>
                    </div>
                    {/* List 2 — Assigned */}
                    <div className="flex-1 flex flex-col gap-1.5">
                        <span className="text-[9px] font-black text-gray-500 uppercase h-5 flex items-center gap-1">
                            Assigned to BOGO {loadM && <RefreshCcw size={8} className="animate-spin text-gray-400"/>}
                        </span>
                        <div className={listCls}>
                            {(assigned as any[]).map((w:any)=>(
                                <div key={w.unico} onClick={()=>setMidSel(w)} className={itemCls(midSel?.unico===w.unico)}>
                                    <div className="font-medium">{t(w.warehouse)}</div>
                                    <div className="text-gray-400">{t(w.salesman)}</div>
                                </div>
                            ))}
                            {emptyLbl(!loadM, "None assigned")}
                        </div>
                    </div>
                    {/* Center 2 */}
                    <div className="flex flex-col items-center justify-center gap-2 pt-6">
                        <button onClick={removeSubclass} disabled={!rightSel||working}
                            className="bg-gray-600 hover:bg-gray-700 disabled:opacity-40 text-white text-[9px] font-black px-2 py-1.5 rounded">◄ Remove</button>
                    </div>
                    {/* List 3 — Subclasses */}
                    <div className="flex-1 flex flex-col gap-1.5">
                        <span className="text-[9px] font-black text-gray-500 uppercase h-5 flex items-center gap-1">
                            Subclass by WH {loadR && <RefreshCcw size={8} className="animate-spin text-gray-400"/>}
                        </span>
                        <div className={listCls}>
                            {(subclasses as any[]).map((s:any)=>(
                                <div key={s.unico} onClick={()=>setRightSel(s)} className={itemCls(rightSel?.unico===s.unico)}>{t(s.subclass||s.subclase)}</div>
                            ))}
                            {!midSel && <div className="p-2 text-center text-[10px] text-gray-300 italic">Select warehouse</div>}
                            {midSel && emptyLbl(!loadR, "No subclasses")}
                        </div>
                    </div>
                </div>
                <div className="flex justify-end px-4 py-3 bg-gray-50 border-t rounded-b-xl shrink-0">
                    <button onClick={onClose} className="px-3 py-1.5 rounded border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100">Close</button>
                </div>
            </div>
        </div>
    );
}

// ─── PreBookDateModal (inline — Tab3 reuse) ───────────────────────────────────
function PreBookDateModal({ title, productDesc, showDeletePrior, showChangeCase, onConfirm, onClose }: any) {
    const today = new Date().toISOString().split("T")[0];
    const [dateFrom, setDateFrom] = useState(today);
    const [dateTo,   setDateTo]   = useState(today);
    const [delPrior, setDelPrior] = useState(false);
    const [chgCase,  setChgCase]  = useState(false);
    const [err,      setErr]      = useState<string|null>(null);

    const confirm = () => {
        if (!dateFrom||!dateTo) { setErr("Invalid date."); return; }
        if (dateTo < dateFrom)  { setErr("Invalid date range."); return; }
        onConfirm({ date_from: dateFrom, date_to: dateTo, delete_prior: delPrior, change_case: chgCase });
    };
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 sm:p-4">
            <div className="bg-white rounded-t-xl sm:rounded-xl shadow-2xl w-full sm:w-80 max-h-[85vh]">
                <div className="h-10 bg-[#374151] rounded-t-xl flex items-center justify-between px-4">
                    <div className="flex items-center gap-2"><Calendar size={13} className="text-[#FB7506]"/><span className="font-black text-[10px] uppercase text-white">{title}</span></div>
                    <button onClick={onClose}><XCircle size={15} className="text-gray-400 hover:text-white"/></button>
                </div>
                <div className="p-4 space-y-3 text-xs">
                    <div><span className="text-[9px] font-black text-gray-400 uppercase">Product / Variety</span><p className="text-gray-600 mt-0.5">{productDesc}</p></div>
                    {err && <p className="text-red-500 text-[9px] font-bold">{err}</p>}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-0.5"><label className="text-[9px] font-black text-gray-400 uppercase">Date From *</label><input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} className="fos-input text-xs py-1"/></div>
                        <div className="flex flex-col gap-0.5"><label className="text-[9px] font-black text-gray-400 uppercase">Date To *</label><input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} className="fos-input text-xs py-1"/></div>
                    </div>
                    {showDeletePrior && <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={delPrior} onChange={e=>setDelPrior(e.target.checked)} className="w-3.5 h-3.5 accent-[#FB7506]"/><span>Delete Prior Recipe</span></label>}
                    {showChangeCase  && <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={chgCase}  onChange={e=>setChgCase(e.target.checked)}  className="w-3.5 h-3.5 accent-[#FB7506]"/><span>Change Case</span></label>}
                </div>
                <div className="flex justify-end gap-2 px-4 py-3 bg-gray-50 border-t rounded-b-xl">
                    <button onClick={onClose} className="px-3 py-1.5 rounded border text-xs font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
                    <button onClick={confirm} className="px-4 py-1.5 rounded bg-[#FB7506] hover:bg-orange-600 text-white text-xs font-black">Confirm</button>
                </div>
            </div>
        </div>
    );
}

// ─── Tab 3 Props ──────────────────────────────────────────────────────────────
interface Tab3Props {
    selSubclass:   any;
    selVariety:    any;
    setSelVariety: (v: any) => void;
}

// ─── Tab 3 Main ───────────────────────────────────────────────────────────────
export default function Tab3({ selSubclass, selVariety, setSelVariety }: Tab3Props) {
    // Fetch varieties for the left panel based on selSubclass
    const { data: varieties = [], isFetching: loadingVr, refetch: refetchVr } = useQuery({
        queryKey: ["tab3-vr", selSubclass?.unico],
        queryFn:  () => sF(`/api/masters/items/varieties?subclass_uq=${selSubclass.unico}&search=%`),
        enabled:  !!selSubclass?.unico,
        staleTime: 30000,
    });
    useEffect(() => {
        if ((varieties as any[]).length > 0 && !selVariety) setSelVariety((varieties as any[])[0]);
        else if (!(varieties as any[]).length) setSelVariety(null);
    }, [varieties]);
    const { logAction } = useAuditLog("items-setup", "flower_varieties");
    const perms         = usePagePermissions("items-setup");

    const [compSearch,   setCompSearch]   = useState("");
    const [debSearch,    setDebSearch]    = useState("");
    const [selComponent, setSelComponent] = useState<any>(null);
    const [error,        setError]        = useState<string|null>(null);

    // Modal state
    const [varietyModal, setVarietyModal] = useState<{mode:"add"|"edit"|"delete"}|null>(null);
    const [varietyForm,  setVarietyForm]  = useState<any>({...EMPTY_VD});
    const [saving,       setSaving]       = useState(false);
    const [formError,    setFormError]    = useState<string|null>(null);
    const [showBOGO,     setShowBOGO]     = useState(false);
    const [showBogoWH,   setShowBogoWH]   = useState(false);
    const [showPrebook,  setShowPrebook]  = useState<"recipe"|"upc"|"sales"|null>(null);
    const [prebookOpen,  setPrebookOpen]  = useState<"recipe"|"upc"|"sales"|null>(null);

    useEffect(() => { const t = setTimeout(()=>setDebSearch(compSearch), 300); return ()=>clearTimeout(t); }, [compSearch]);

    const { data: compPages, isFetching: loadComp, fetchNextPage: fetchMoreComp, hasNextPage: hasMoreComp, isFetchingNextPage: fetchingMoreComp, refetch: refetchComp } =
        useInfiniteQuery({ queryKey:["tab3-comp", debSearch], queryFn:({pageParam})=>sF(`/api/masters/items/components?search=${encodeURIComponent(debSearch||"%")}&page=${pageParam}&pageSize=${PAGE_SIZE}`), initialPageParam:1, getNextPageParam: nextPage, staleTime:30000 });
    const components = getPages(compPages);
    const compTotal  = getTotal(compPages);
    const compSentinel = useSentinel(() => fetchMoreComp(), !!(hasMoreComp && !fetchingMoreComp));

    const doCrud = async (endpoint: string, method: string, body: any, onSuccess: (d: any)=>void) => {
        setSaving(true); setFormError(null);
        try {
            const res  = await fetch(endpoint, { method, headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            onSuccess(data);
        } catch(e:any) { setFormError(e.message); }
        finally { setSaving(false); }
    };

    const openVarietyModal = async (mode: "add"|"edit"|"delete") => {
        if (mode !== "add" && !selVariety) { setError("Select a variety first."); return; }
        if (mode === "add"    && !perms.canCreate) { setError(PERMISSION_MSGS.create); return; }
        if (mode === "edit"   && !perms.canEdit)   { setError(PERMISSION_MSGS.edit);   return; }
        if (mode === "delete" && !perms.canDelete) { setError(PERMISSION_MSGS.delete); return; }

        if (mode === "edit" && selVariety) {
            // Fetch full variety data for the form
            try {
                const data = await sF(`/api/masters/items/varieties/${selVariety.unico}`);
                setVarietyForm({ ...EMPTY_VD, ...data, subcla_uq: data.subcla_uq || "" });
            } catch { setVarietyForm({ ...EMPTY_VD, ...selVariety, subcla_uq: selVariety.subcla_uq || "" }); }
        } else if (mode === "delete") {
            setVarietyForm({ ...EMPTY_VD, ...selVariety });
        } else {
            setVarietyForm({ ...EMPTY_VD, subcla_uq: selSubclass?.unico || "" });
        }
        setFormError(null); setVarietyModal({ mode });
    };

    const saveVariety = () => {
        if (!varietyForm.variety?.trim())    { setFormError("Variety name is empty."); return; }
        if (!varietyForm.variety_sh?.trim()) { setFormError("Variety code is empty."); return; }
        if (!varietyForm.subcla_uq)          { setFormError("Subclass is empty."); return; }
        if (varietyModal?.mode === "add") {
            doCrud("/api/masters/items/varieties", "POST", varietyForm, d => { logAction("Insert", d.unico); refetchVr(); setVarietyModal(null); });
        } else {
            doCrud(`/api/masters/items/varieties/${selVariety?.unico}`, "PUT", varietyForm, () => { logAction("Edit", selVariety?.unico); refetchVr(); setVarietyModal(null); });
        }
    };
    const deleteVariety = () => doCrud(`/api/masters/items/varieties/${selVariety?.unico}`, "DELETE", {}, () => { logAction("Delete", selVariety?.unico); setSelVariety(null); refetchVr(); setVarietyModal(null); });

    const requireComp = (fn: ()=>void) => { if (!selComponent) { setError(NO_COMP); return; } fn(); };

    const handleBogoClean = async () => {
        if (!confirm("Do you want to clean all BOGO settings?")) return;
        try {
            const res = await fetch("/api/masters/items/subclass-bogo/clean-all", { method:"PUT" });
            const d = await res.json();
            if (!d.success) throw new Error(d.error);
            logAction("Edit", "", "BOGO Cleaner");
            refetchComp();
        } catch(e:any){ setError((e as any).message); }
    };

    return (
        <div className="flex flex-col flex-1 overflow-hidden">
            {/* Toolbar */}
            <div className="bg-gray-100 border-b border-gray-200 px-2 py-1 shrink-0 space-y-1">
                <div className="flex flex-wrap items-center gap-1">
                    {/* CRUD */}
                    <Btn icon={Plus}   label="Insert" color="green"  onClick={()=>openVarietyModal("add")}    disabled={!perms.canCreate}/>
                    <Btn icon={Pencil} label="Update" color="blue"   onClick={()=>openVarietyModal("edit")}   disabled={!selVariety||!perms.canEdit}/>
                    <Btn icon={Trash2} label="Delete" color="red"    onClick={()=>openVarietyModal("delete")} disabled={!selVariety||!perms.canDelete}/>
                    <div className="w-px h-5 bg-gray-300 mx-0.5"/>
                    {/* BOGO */}
                    <Btn label="BOGO"         color="amber" onClick={()=>requireComp(()=>setShowBOGO(true))}  disabled={!selComponent}/>
                    <Btn label="BOGO WH"      color="amber" onClick={()=>requireComp(()=>setShowBogoWH(true))} disabled={!selComponent}/>
                    <Btn label="BOGO Cleaner" color="red"   onClick={handleBogoClean}/>
                    <div className="w-px h-5 bg-gray-300 mx-0.5"/>
                    {/* Shared modals (coming soon until Tab1 modals are wired) */}
                    <Btn icon={Layers} label="Bouquet"      color="amber" onClick={()=>setError("Bouquet Composition — Coming soon")} disabled={!selVariety}/>
                    <Btn icon={Box}    label="Box"           color="amber" onClick={()=>setError("Box Composition — Coming soon")}     disabled={!selVariety}/>
                    <Btn icon={ClipboardList} label="Update Stock" color="gray" onClick={()=>setError("Update Stock — use Tab 2")}/>
                    {/* Prebook dropdowns */}
                    {(["recipe","upc","sales"] as const).map(type=>{
                        const labels: Record<string,string> = { recipe:"Recipe→Prebook", upc:"UPC→Prebook", sales:"Sales→Prebook" };
                        return (
                            <div key={type} className="relative">
                                <button onClick={()=>setPrebookOpen(p=>p===type?null:type)} disabled={!selVariety}
                                    className="flex items-center gap-0.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-40 text-white text-[9px] font-black uppercase px-2 py-1 rounded">
                                    <Calendar size={9}/> {labels[type]} <ChevronDown size={8}/>
                                </button>
                                {prebookOpen===type && (
                                    <div className="absolute top-full left-0 mt-0.5 bg-white border border-gray-200 rounded shadow-lg z-20 w-48 text-xs">
                                        <button onClick={()=>{setPrebookOpen(null);setShowPrebook(type);}} className="w-full text-left px-3 py-2 hover:bg-gray-50 font-semibold">
                                            {type==="recipe"?"Fill Recipe in Prebooks":type==="upc"?"Fill UPC Info in Prebooks":"Fill Sales Info in Prebooks"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Error bar */}
            {error && (
                <div className="px-3 py-1 bg-amber-50 border-b border-amber-200 flex items-center gap-2 shrink-0">
                    <span className="text-amber-700 text-[9px] font-bold flex-1">{error}</span>
                    <button onClick={()=>setError(null)}><X size={10} className="text-amber-500 hover:text-amber-700"/></button>
                </div>
            )}

            {/* Two-panel layout */}
            <div className="flex-1 flex gap-1.5 p-1.5 overflow-hidden">
                {/* Left: Varieties by Subclass */}
                <div className="w-2/5 bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col overflow-hidden">
                    <div className="h-10 bg-[#374151] flex items-center px-3 shrink-0">
                        <Layers size={15} className="text-[#FB7506] mr-2"/>
                        <span className="fos-grid-header-text">
                            Varieties {selSubclass ? `— ${t(selSubclass.subclase)}` : ""}
                        </span>
                        {loadingVr && <RefreshCcw size={11} className="text-gray-400 animate-spin ml-2"/>}
                    </div>
                    <MiniGrid
                        cols={[
                            { key:"variety",     label:"Variety",  className:"font-medium" },
                            { key:"color",       label:"Color",    className:"text-gray-500" },
                            { key:"active",      label:"Active",   className:"text-center", render:(v:any)=>v?<Check size={9} className="text-green-500 mx-auto"/>:"—" },
                            { key:"variety_sh",  label:"Code",     className:"text-gray-400" },
                            { key:"changecolor", label:"CC",       className:"text-center", render:(v:any)=>v?<Check size={9} className="text-blue-400 mx-auto"/>:"—" },
                        ]}
                        rows={varieties}
                        selUnico={selVariety?.unico}
                        onSelect={setSelVariety}
                        loading={loadingVr}
                        empty={selSubclass ? "No varieties" : "Select a subclass in Tab 1"}
                    />
                </div>

                {/* Right: Components search */}
                <div className="flex-1 bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col overflow-hidden">
                    <div className="h-10 bg-[#374151] flex items-center px-3 gap-2 shrink-0">
                        <Search size={15} className="text-[#FB7506]"/>
                        <span className="fos-grid-header-text">Components / Search</span>
                        {(loadComp||fetchingMoreComp) && <RefreshCcw size={11} className="text-gray-400 animate-spin"/>}
                        {compTotal > 0 && <span className="text-gray-400 text-[10px] ml-1">{components.length}/{compTotal}</span>}
                    </div>
                    <div className="p-1.5 border-b border-gray-100 shrink-0">
                        <div className="relative">
                            <Search size={9} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"/>
                            <input value={compSearch} onChange={e=>setCompSearch(e.target.value)}
                                placeholder="Search: Class  Subclass  Color  Variety  Item  Component"
                                className="w-full pl-6 pr-2 py-0.5 text-[10px] border border-gray-200 rounded outline-none focus:ring-1 focus:ring-[#FB7506]"/>
                        </div>
                    </div>
                    <MiniGrid
                        cols={[
                            { key:"clase",        label:"Class",      className:"text-gray-500 text-[9px]" },
                            { key:"subclase",     label:"Subclass",   className:"text-gray-500 text-[9px]" },
                            { key:"bogo",         label:"Bogo",       className:"text-center text-[9px]", render:(v:any)=>t(v)==="Yes"?<Check size={9} className="text-green-500 mx-auto"/>:"—" },
                            { key:"bogo_days",    label:"BogoDays",   className:"text-right text-[9px]" },
                            { key:"bogo_percent", label:"Bogo%",      className:"text-right text-[9px]", render:(v:any)=>n2(v) },
                            { key:"variety",      label:"Variety / Component", className:"font-medium" },
                            { key:"color",        label:"Color",      className:"text-gray-500" },
                            { key:"tolerance",    label:"Tolerance",  className:"text-right text-[9px]" },
                            { key:"variety_live", label:"Live",       className:"text-right text-[9px]" },
                        ]}
                        rows={components}
                        selUnico={selComponent?.unico}
                        onSelect={setSelComponent}
                        loading={loadComp && components.length === 0}
                        empty={debSearch ? "No results" : "Type to search components"}
                        sentinel={<div ref={compSentinel} className="h-1"/>}
                    />
                </div>
            </div>

            {/* ── Modals ──────────────────────────────────────────────────── */}
            {varietyModal && (
                <VarietyDefinitionModal
                    mode={varietyModal.mode} form={varietyForm} setForm={setVarietyForm}
                    onSave={saveVariety} onDelete={deleteVariety}
                    onClose={()=>{setVarietyModal(null);setFormError(null);}}
                    saving={saving} error={formError}/>
            )}

            {showBOGO && selComponent && (
                <SubclassBOGOModal
                    subclaUq={selComponent.subcla_uq}
                    onClose={()=>setShowBOGO(false)}
                    onSaved={()=>{ logAction("Edit", selComponent.subcla_uq, "BOGO"); refetchComp(); }}/>
            )}

            {showBogoWH && (
                <WarehouseBOGOModal
                    initialSalesmanUq={selComponent?.salesman_uq}
                    onClose={()=>setShowBogoWH(false)}
                    logAction={logAction}/>
            )}

            {showPrebook && selVariety && (
                <PreBookDateModal
                    title={showPrebook==="recipe"?"Fill Recipe in Prebooks":showPrebook==="upc"?"Fill UPC Info in Prebooks":"Fill Sales Info in Prebooks"}
                    productDesc={t(selVariety.variety)}
                    showDeletePrior={showPrebook==="recipe"}
                    showChangeCase={showPrebook==="recipe"}
                    onConfirm={()=>{ setShowPrebook(null); setError("Coming soon — SP not yet available in database."); }}
                    onClose={()=>setShowPrebook(null)}/>
            )}
        </div>
    );
}
