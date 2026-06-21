"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useQuery, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import {
    Plus, Pencil, Trash2, Save, X, RefreshCcw, Search, Check, XCircle,
    Copy, Layers, Box, Shuffle, BookOpen, Users, Calendar, BarChart2,
    ClipboardList, Printer, Menu, ChevronDown, Package, Upload, ImageIcon
} from "lucide-react";
import { GridMenu } from "@/components/GridMenu";
import { cn } from "@/lib/utils";
import { useAuditLog } from "@/lib/audit";
import { usePagePermissions, PERMISSION_MSGS } from "@/lib/permissions";
const EMPTY_ARR: any[] = [];

const t  = (v: any) => String(v ?? "").trim();
const n2 = (v: any) => parseFloat(v ?? 0).toFixed(2);
const DEFAULT_THUMB = "https://flexymax.nyc3.digitaloceanspaces.com/FlexyMaxApp/FlexyMaxImages/NoImageAvailable2.png";
const sF = async (url: string) => { const r = await fetch(url); const j = await r.json(); if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`); return j; };
const NO_PROD = "There isn't a selected product. / No hay producto seleccionado.";
const PAGE_SIZE = 50;

// ─── Infinite scroll helper ───────────────────────────────────────────────────
function useSentinel(onVisible: () => void, enabled: boolean) {
    const ref = useRef<HTMLDivElement & HTMLTableRowElement>(null);
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

// Helper to parse paginated response and flatten pages
const getPages = (data: any) => data?.pages?.flatMap((p: any) => p.records ?? p) ?? [];
const getTotal = (data: any) => data?.pages?.[0]?.total ?? 0;
const nextPage  = (last: any) => (last.page ?? 1) * (last.pageSize ?? PAGE_SIZE) < (last.total ?? 0) ? (last.page ?? 1) + 1 : undefined;

// ─── Mini helpers ─────────────────────────────────────────────────────────────


function Btn({ icon:Icon, label, color="gray", onClick, disabled=false, sm=false }: any) {
    const cls: Record<string,string> = { green:"bg-green-600 hover:bg-green-700", blue:"bg-blue-600 hover:bg-blue-700", red:"bg-red-600 hover:bg-red-700", gray:"bg-gray-600 hover:bg-gray-700", amber:"bg-amber-500 hover:bg-amber-600", purple:"bg-purple-600 hover:bg-purple-700" };
    return (
        <button onClick={onClick} disabled={disabled}
            className={cn("flex items-center gap-1.5 text-white font-semibold uppercase tracking-wide disabled:opacity-40 disabled:cursor-not-allowed rounded transition-colors shrink-0",
                sm ? "px-2.5 h-6 text-[12px]" : "px-3 h-7 text-[14px]", cls[color]||cls.gray)}>
            {Icon && <Icon size={sm?11:13}/>}{label}
        </button>
    );
}

// ─── DualListModal (shared by Alternatives and Season Recipes) ────────────────
function DualListModal({ title, productDesc, productUq, availUrl, assignedUrl, onAdd, onRemove, onClose }: {
    title: string; productDesc: string; productUq: string;
    availUrl: (search: string, page: number) => string;
    assignedUrl: string;
    onAdd: (item: any) => Promise<void>;
    onRemove: (item: any) => Promise<void>;
    onClose: () => void;
}) {
    const [leftSel,  setLeftSel]  = useState<any>(null);
    const [rightSel, setRightSel] = useState<any>(null);
    const [search,   setSearch]   = useState("");
    const [working,  setWorking]  = useState(false);
    const [err,      setErr]      = useState<string|null>(null);

    const canSearch = search.length >= 2;

    const { data: availPages, isFetching: loadL, fetchNextPage: fetchMoreAvail, hasNextPage: hasMoreAvail, isFetchingNextPage: fetchingMoreAvail, refetch: refL } =
        useInfiniteQuery({ queryKey:["dual-avail", productUq, search], queryFn:({pageParam})=>sF(availUrl(search, pageParam as number)), initialPageParam:1, getNextPageParam: nextPage, staleTime:0, enabled: canSearch });
    const { data: assigned = EMPTY_ARR, isFetching: loadR, refetch: refR } =
        useQuery({ queryKey:["dual-asgn", productUq], queryFn:()=>sF(assignedUrl), staleTime:0 });

    const available = getPages(availPages);
    const availSentinel = useSentinel(() => fetchMoreAvail(), !!(hasMoreAvail && !fetchingMoreAvail && canSearch));

    const doAdd = async () => {
        if (!leftSel) return;
        setWorking(true); setErr(null);
        try { await onAdd(leftSel); refL(); refR(); setLeftSel(null); }
        catch(e:any){ setErr(e.message); }
        finally { setWorking(false); }
    };
    const doRemove = async () => {
        if (!rightSel) return;
        setWorking(true); setErr(null);
        try { await onRemove(rightSel); refL(); refR(); setRightSel(null); }
        catch(e:any){ setErr(e.message); }
        finally { setWorking(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 sm:p-4">
            <div className="bg-white rounded-t-xl sm:rounded-xl shadow-2xl w-full sm:max-w-2xl flex flex-col h-[85vh] sm:h-[80vh]">
                <div className="h-10 bg-[#374151] rounded-t-xl flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-2">
                        <Shuffle size={13} className="text-[#FB7506]"/>
                        <span className="font-black text-[10px] uppercase tracking-widest text-white">{title}</span>
                        {err && <span className="text-amber-300 text-[9px] font-bold ml-2 truncate">{err}</span>}
                    </div>
                    <button onClick={onClose}><XCircle size={15} className="text-gray-400 hover:text-white"/></button>
                </div>
                <div className="p-3 border-b border-gray-100 shrink-0">
                    <span className="text-xs font-bold text-gray-600">Product: </span>
                    <span className="text-xs text-gray-500">{productDesc}</span>
                </div>
                <div className="flex gap-2 p-3 flex-1 overflow-hidden" style={{minHeight:0}}>
                    {/* Left: Available — infinite scroll */}
                    <div className="flex-1 flex flex-col gap-1.5 min-h-0">
                        <div className="flex items-center gap-1 h-5">
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">
                                Available {canSearch && getTotal(availPages) > 0 && `(${available.length}/${getTotal(availPages)})`}
                            </span>
                            {(loadL||fetchingMoreAvail) && <RefreshCcw size={8} className="text-gray-400 animate-spin"/>}
                        </div>
                        <div className="relative">
                            <Search size={9} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"/>
                            <input value={search} onChange={e=>setSearch(e.target.value)}
                                placeholder="Type 2+ chars to search..."
                                className="w-full pl-5 pr-2 py-0.5 text-[10px] border border-gray-200 rounded outline-none focus:ring-1 focus:ring-[#FB7506]"/>
                        </div>
                        <div className="flex-1 border border-gray-200 rounded overflow-auto">
                            {available.map((r:any) => (
                                <div key={r.unico} onClick={()=>setLeftSel(r)}
                                    className={cn("px-2 py-1 text-xs cursor-pointer border-b border-gray-50 last:border-0 hover:bg-gray-50", leftSel?.unico===r.unico && "bg-blue-50 font-bold")}>
                                    {t(r.description)}
                                </div>
                            ))}
                            <div ref={availSentinel} className="h-1"/>
                            {!canSearch && <div className="p-3 text-center text-[10px] text-gray-300 italic">Type at least 2 characters to search</div>}
                            {canSearch && !loadL && available.length===0 && <div className="p-2 text-center text-[10px] text-gray-300 italic">No items</div>}
                        </div>
                    </div>
                    {/* Center: buttons */}
                    <div className="flex flex-col items-center justify-center gap-2 pt-10">
                        <button onClick={doAdd} disabled={!leftSel||working}
                            className="bg-[#FB7506] hover:bg-orange-600 disabled:opacity-40 text-white text-[9px] font-black px-3 py-1.5 rounded flex items-center gap-1">
                            Add <span>►</span>
                        </button>
                        <button onClick={doRemove} disabled={!rightSel||working}
                            className="bg-gray-600 hover:bg-gray-700 disabled:opacity-40 text-white text-[9px] font-black px-3 py-1.5 rounded flex items-center gap-1">
                            <span>◄</span> Remove
                        </button>
                    </div>
                    {/* Right: Assigned */}
<div className="flex-1 flex flex-col gap-1.5 min-h-0">
                        <div className="flex items-center gap-1 h-5">
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Assigned</span>
                            {loadR && <RefreshCcw size={8} className="text-gray-400 animate-spin"/>}
                        </div>
                        <div className="h-6"/>
                        <div className="flex-1 border border-gray-200 rounded overflow-auto">
                            {(assigned as any[]).map((r:any) => (
                                <div key={r.unico} onClick={()=>setRightSel(r)}
                                    className={cn("px-2 py-1 text-xs cursor-pointer border-b border-gray-50 last:border-0 hover:bg-gray-50", rightSel?.unico===r.unico && "bg-blue-50 font-bold")}>
                                    {t(r.description)}
                                </div>
                            ))}
                            {!loadR && (assigned as any[]).length===0 && <div className="p-2 text-center text-[10px] text-gray-300 italic">None assigned</div>}
                        </div>
                    </div>
                </div>
                <div className="flex justify-end px-4 py-3 bg-gray-50 border-t rounded-b-xl shrink-0">
                    <Btn icon={XCircle} label="Close" color="gray" onClick={onClose}/>
                </div>
            </div>
        </div>
    );
}

// ─── BuyersQuotasModal ────────────────────────────────────────────────────────
const EMPTY_QUOTA = { country: "", city: "", quota: 0, growers_all: false, growers_list: false };

function BuyersQuotasModal({ productUq, productDesc, onClose }: { productUq: string; productDesc: string; onClose: () => void }) {
    const [selQuota,   setSelQuota]   = useState<any>(null);
    const [quotaMode,  setQuotaMode]  = useState<"view"|"add"|"edit">("view");
    const [qForm,      setQForm]      = useState<any>({...EMPTY_QUOTA});
    const [selLeftGr,  setSelLeftGr]  = useState<any>(null);
    const [selRightGr, setSelRightGr] = useState<any>(null);
    const [saving,     setSaving]     = useState(false);
    const [err,        setErr]        = useState<string|null>(null);

    const { data: quotas = EMPTY_ARR, isFetching: loadQ, refetch: refQ } = useQuery({ queryKey:["bq-q",  productUq], queryFn:()=>sF(`/api/masters/items/products/${productUq}/quotas`), staleTime:0 });
    const { data: countries = EMPTY_ARR } = useQuery({ queryKey:["bq-countries"], queryFn:()=>sF("/api/masters/items/lookups/countries"), staleTime:60000 });
    const { data: cities = EMPTY_ARR, refetch: refCities } = useQuery({ queryKey:["bq-cities", qForm.country], queryFn:()=>sF(`/api/masters/items/lookups/cities?country=${encodeURIComponent(qForm.country)}`), enabled: !!qForm.country, staleTime:30000 });
    const { data: growersLeft = EMPTY_ARR, isFetching: loadGL, refetch: refGL } = useQuery({ queryKey:["bq-gl", productUq], queryFn:()=>sF(`/api/masters/items/products/quota/growers?product_uq=${productUq}`), staleTime:0 });
    const { data: growersRight = EMPTY_ARR, isFetching: loadGR, refetch: refGR } = useQuery({ queryKey:["bq-gr", selQuota?.unico], queryFn:()=>sF(`/api/masters/items/products/quota/growers-in/${selQuota.unico}`), enabled:!!selQuota?.unico, staleTime:0 });

    useEffect(() => { if ((quotas as any[]).length > 0 && !selQuota) setSelQuota((quotas as any[])[0]); }, [quotas]);

    const saveQuota = async () => {
        setSaving(true); setErr(null);
        try {
            const method = quotaMode==="add" ? "POST" : "PUT";
            const url    = quotaMode==="add" ? `/api/masters/items/products/${productUq}/quotas` : `/api/masters/items/products/quota/${selQuota?.unico}`;
            const res    = await fetch(url, { method, headers:{"Content-Type":"application/json"}, body:JSON.stringify(qForm) });
            const data   = await res.json();
            if (!data.success) throw new Error(data.error);
            refQ(); setQuotaMode("view");
        } catch(e:any){ setErr(e.message); }
        finally { setSaving(false); }
    };
    const deleteQuota = async () => {
        if (!selQuota || !confirm("Delete this quota?")) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/masters/items/products/quota/${selQuota.unico}`, { method:"DELETE" });
            const d = await res.json();
            if (!d.success) throw new Error(d.error);
            setSelQuota(null); refQ();
        } catch(e:any){ setErr(e.message); }
        finally { setSaving(false); }
    };
    const addGrower = async () => {
        if (!selQuota || !selLeftGr) return;
        try {
            const res = await fetch("/api/masters/items/products/quota/grower", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ fpbg_uq: selQuota.unico, grower_uq: selLeftGr.unico }) });
            const d = await res.json();
            if (!d.success) throw new Error(d.error);
            refGL(); refGR(); setSelLeftGr(null);
        } catch(e:any){ setErr(e.message); }
    };
    const removeGrower = async () => {
        if (!selQuota || !selRightGr) return;
        try {
            const res = await fetch("/api/masters/items/products/quota/grower", { method:"DELETE", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ fpbg_uq: selQuota.unico, grower_uq: selRightGr.grower_uq }) });
            const d = await res.json();
            if (!d.success) throw new Error(d.error);
            refGL(); refGR(); setSelRightGr(null);
        } catch(e:any){ setErr(e.message); }
    };

    const openAdd  = () => { setQForm({...EMPTY_QUOTA}); setQuotaMode("add"); };
    const openEdit = () => { if (!selQuota) return; setQForm({ country:t(selQuota.country), city:t(selQuota.city), quota:selQuota.quota||0, growers_all:!!selQuota.growers_all, growers_list:!!selQuota.growers_list }); setQuotaMode("edit"); };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 sm:p-4">
            <div className="bg-white rounded-t-xl sm:rounded-xl shadow-2xl w-full sm:max-w-3xl flex flex-col h-[85vh] sm:h-[80vh]">
                <div className="h-10 bg-[#374151] rounded-t-xl flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-2">
                        <Users size={13} className="text-[#FB7506]"/>
                        <span className="font-black text-[10px] uppercase tracking-widest text-white">Buyers Quotas — {productDesc}</span>
                        {err && <span className="text-amber-300 text-[9px] font-bold ml-2 truncate">{err}</span>}
                    </div>
                    <button onClick={onClose}><XCircle size={15} className="text-gray-400 hover:text-white"/></button>
                </div>
                <div className="flex gap-2 p-3 flex-1 overflow-hidden" style={{minHeight:0}}>
                    {/* Left: Quotas list + form */}
                    <div className="w-72 flex flex-col gap-1.5 shrink-0">
                        <div className="flex items-center justify-between h-6">
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Quotas</span>
                            <div className="flex gap-1">
                                <Btn icon={Plus}   label="Add"    color="green" sm onClick={openAdd}/>
                                <Btn icon={Pencil} label="Edit"   color="blue"  sm onClick={openEdit}  disabled={!selQuota}/>
                                <Btn icon={Trash2} label="Delete" color="red"   sm onClick={deleteQuota} disabled={!selQuota}/>
                            </div>
                        </div>
                        <div className="flex-1 border border-gray-200 rounded overflow-auto">
                            {(quotas as any[]).map((q:any) => (
                                <div key={q.unico} onClick={()=>setSelQuota(q)}
                                    className={cn("px-2 py-1.5 text-[10px] cursor-pointer border-b border-gray-50 last:border-0 hover:bg-gray-50", selQuota?.unico===q.unico && "bg-blue-50 font-bold")}>
                                    <div>{t(q.country)} — {t(q.city)}</div>
                                    <div className="text-gray-400">Quota: {q.quota}</div>
                                </div>
                            ))}
                            {!loadQ && (quotas as any[]).length===0 && <div className="p-2 text-center text-[10px] text-gray-300 italic">No quotas</div>}
                        </div>
                        {/* Add/Edit form */}
                        {(quotaMode==="add"||quotaMode==="edit") && (
                            <div className="border border-[#FB7506]/40 rounded p-2 bg-orange-50/30 space-y-1.5">
                                <span className="text-[9px] font-black uppercase text-[#FB7506]">{quotaMode==="add"?"New Quota":"Edit Quota"}</span>
                                <div className="grid grid-cols-2 gap-1.5">
                                    <div className="flex flex-col gap-0.5">
                                        <label className="text-[8px] font-black text-gray-400 uppercase">Country</label>
                                        <select value={qForm.country} onChange={e=>setQForm((p:any)=>({...p,country:e.target.value,city:""}))} className="fos-input text-[10px] py-0.5">
                                            <option value="">—</option>
                                            {(countries as any[]).map((c:any)=><option key={c.unico} value={c.country_iso||c.unico}>{t(c.country||c.country_name||c.unico)}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <label className="text-[8px] font-black text-gray-400 uppercase">City</label>
                                        <select value={qForm.city} onChange={e=>setQForm((p:any)=>({...p,city:e.target.value}))} className="fos-input text-[10px] py-0.5">
                                            <option value="">—</option>
                                            {(cities as any[]).map((c:any)=><option key={c.city} value={c.city}>{t(c.city)}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-0.5 col-span-2">
                                        <label className="text-[8px] font-black text-gray-400 uppercase">Quota</label>
                                        <input type="number" step="0.01" value={qForm.quota} onChange={e=>setQForm((p:any)=>({...p,quota:parseFloat(e.target.value)||0}))} className="fos-input text-[10px] py-0.5"/>
                                    </div>
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input type="checkbox" checked={!!qForm.growers_all} onChange={e=>setQForm((p:any)=>({...p,growers_all:e.target.checked}))} className="w-3 h-3 accent-[#FB7506]"/>
                                        <span className="text-[9px] text-gray-600">Growers All</span>
                                    </label>
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input type="checkbox" checked={!!qForm.growers_list} onChange={e=>setQForm((p:any)=>({...p,growers_list:e.target.checked}))} className="w-3 h-3 accent-[#FB7506]"/>
                                        <span className="text-[9px] text-gray-600">Growers List</span>
                                    </label>
                                </div>
                                <div className="flex gap-1 justify-end pt-1">
                                    <Btn icon={X}    label="Cancel" color="gray"  sm onClick={()=>setQuotaMode("view")}/>
                                    <Btn icon={Save} label="Save"   color="amber" sm onClick={saveQuota} disabled={saving}/>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Right: Growers dual list */}
                    <div className="flex-1 flex flex-col gap-1.5">
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 h-6 flex items-center">Growers {selQuota ? `— ${t(selQuota.country)} / ${t(selQuota.city)}` : "(select a quota)"}</span>
                        <div className="flex gap-2 flex-1">
                            <div className="flex-1 flex flex-col gap-1">
                                <span className="text-[8px] text-gray-400 uppercase font-bold">Available {loadGL && <RefreshCcw size={7} className="inline animate-spin"/>}</span>
                                <div className="flex-1 border border-gray-200 rounded overflow-auto">
                                    {(growersLeft as any[]).map((g:any) => (
                                        <div key={g.unico} onClick={()=>setSelLeftGr(g)}
                                            className={cn("px-2 py-1 text-[10px] cursor-pointer hover:bg-gray-50 border-b border-gray-50", selLeftGr?.unico===g.unico && "bg-blue-50 font-bold")}>
                                            {t(g.grower||g.farm)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-col items-center justify-center gap-2">
                                <button onClick={addGrower} disabled={!selLeftGr||!selQuota} className="bg-[#FB7506] hover:bg-orange-600 disabled:opacity-40 text-white text-[9px] font-black px-2 py-1 rounded">Add ►</button>
                                <button onClick={removeGrower} disabled={!selRightGr||!selQuota} className="bg-gray-600 hover:bg-gray-700 disabled:opacity-40 text-white text-[9px] font-black px-2 py-1 rounded">◄ Remove</button>
                            </div>
                            <div className="flex-1 flex flex-col gap-1">
                                <span className="text-[8px] text-gray-400 uppercase font-bold">Assigned {loadGR && <RefreshCcw size={7} className="inline animate-spin"/>}</span>
                                <div className="flex-1 border border-gray-200 rounded overflow-auto">
                                    {(growersRight as any[]).map((g:any) => (
                                        <div key={g.unico||g.grower_uq} onClick={()=>setSelRightGr(g)}
                                            className={cn("px-2 py-1 text-[10px] cursor-pointer hover:bg-gray-50 border-b border-gray-50", selRightGr?.unico===g.unico && "bg-blue-50 font-bold")}>
                                            {t(g.grower||g.farm)}
                                        </div>
                                    ))}
                                    {!selQuota && <div className="p-2 text-center text-[10px] text-gray-300 italic">Select a quota</div>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end px-4 py-3 bg-gray-50 border-t rounded-b-xl shrink-0">
                    <Btn icon={XCircle} label="Close" color="gray" onClick={onClose}/>
                </div>
            </div>
        </div>
    );
}

// ─── POPricesModal ────────────────────────────────────────────────────────────
function POPricesModal({ onClose }: { onClose: () => void }) {
    const [cityUq,      setCityUq]      = useState("");
    const [cityLabel,   setCityLabel]   = useState("");
    const [citySearch,  setCitySearch]  = useState("");
    const [cityOpen,    setCityOpen]    = useState(false);
    const [seasonUq,    setSeasonUq]    = useState("");
    const [leftSel,     setLeftSel]     = useState<any>(null);
    const [leftSearch,  setLeftSearch]  = useState("");
    const [saving,      setSaving]      = useState(false);
    const [err,         setErr]         = useState<string|null>(null);
    const [editPrice,   setEditPrice]   = useState<Record<string,string>>({});

    // City: incremental combobox with infinite scroll
    const { data: custPages, isFetching: loadCust, fetchNextPage: fetchMoreCust, hasNextPage: hasMoreCust, isFetchingNextPage: fetchingMoreCust } =
        useInfiniteQuery({ queryKey:["po-cust", citySearch], queryFn:({pageParam})=>sF(`/api/masters/items/lookups/customers?search=${encodeURIComponent(citySearch)}&page=${pageParam}&pageSize=${PAGE_SIZE}`), initialPageParam:1, getNextPageParam: nextPage, staleTime:30000, enabled: cityOpen || !!citySearch });
    const custList = getPages(custPages);
    const custSentinel = useSentinel(() => fetchMoreCust(), !!(hasMoreCust && !fetchingMoreCust));

    const { data: seasons = EMPTY_ARR } = useQuery({ queryKey:["po-seasons"], queryFn:()=>sF("/api/masters/items/lookups/seasons"), staleTime:60000 });

    // Available products: infinite scroll — require city+season AND min 2 chars OR explicit empty (load first page when user clears)
    const canSearchPO = !!(cityUq && seasonUq) && leftSearch.length >= 2;
    const { data: availPages, isFetching: loadL, fetchNextPage: fetchMoreAvail, hasNextPage: hasMoreAvail, isFetchingNextPage: fetchingMoreAvail, refetch: refL } =
        useInfiniteQuery({ queryKey:["po-avail", cityUq, seasonUq, leftSearch], queryFn:({pageParam})=>sF(`/api/masters/items/po-prices/available?city_uq=${cityUq}&season_uq=${seasonUq}&search=${encodeURIComponent(leftSearch||"%")}&page=${pageParam}&pageSize=${PAGE_SIZE}`), initialPageParam:1, getNextPageParam: nextPage, staleTime:0, enabled: canSearchPO });
    const available = getPages(availPages);
    const availSentinel = useSentinel(() => fetchMoreAvail(), !!(hasMoreAvail && !fetchingMoreAvail));

    const { data: assigned = EMPTY_ARR, isFetching: loadR, refetch: refR } =
        useQuery({ queryKey:["po-asgn", cityUq, seasonUq], queryFn:()=>sF(`/api/masters/items/po-prices/assigned?city_uq=${cityUq}&season_uq=${seasonUq}`), enabled: !!(cityUq && seasonUq), staleTime:0 });

    useEffect(() => {
        const m: Record<string,string> = {};
        (assigned as any[]).forEach((r:any) => { m[r.unico] = n2(r.unit_price ?? r.seasonprice); });
        setEditPrice(m);
    }, [assigned]);

    const doAdd = async () => {
        if (!leftSel || !cityUq || !seasonUq) return;
        setSaving(true); setErr(null);
        try {
            const res = await fetch("/api/masters/items/po-prices", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ city_uq:cityUq, season_uq:seasonUq, product_uq:leftSel.unico, price: parseFloat(String(leftSel.unit_price||0)) }) });
            const d = await res.json();
            if (!d.success) throw new Error(d.error);
            refL(); refR(); setLeftSel(null);
        } catch(e:any){ setErr(e.message); }
        finally { setSaving(false); }
    };
    const updatePrice = async (unico: string, price: string) => {
        try { await fetch(`/api/masters/items/po-prices/${unico}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ price: parseFloat(price)||0 }) }); } catch {}
    };
    const removeProduct = async (unico: string) => {
        try {
            const res = await fetch(`/api/masters/items/po-prices/${unico}`, { method:"DELETE" });
            const d = await res.json();
            if (!d.success) throw new Error(d.error);
            refL(); refR();
        } catch(e:any){ setErr((e as any).message); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 sm:p-4">
            <div className="bg-white rounded-t-xl sm:rounded-xl shadow-2xl w-full sm:max-w-3xl flex flex-col h-[85vh] sm:h-[80vh]">
                <div className="h-10 bg-[#374151] rounded-t-xl flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-2">
                        <ClipboardList size={13} className="text-[#FB7506]"/>
                        <span className="font-black text-[10px] uppercase tracking-widest text-white">PO Prices Setup</span>
                        {err && <span className="text-amber-300 text-[9px] font-bold ml-2 truncate">{err}</span>}
                    </div>
                    <button onClick={onClose}><XCircle size={15} className="text-gray-400 hover:text-white"/></button>
                </div>
                {/* Filters */}
                <div className="p-2 border-b flex gap-2 items-end shrink-0">
                    {/* City — incremental combobox */}
                    <div className="flex flex-col gap-0.5 relative w-56">
                        <label className="text-[8px] font-black text-gray-400 uppercase">City / Customer</label>
                        <div className="relative">
                            <input value={citySearch} onChange={e=>{setCitySearch(e.target.value);setCityOpen(true);}}
                                onFocus={()=>setCityOpen(true)} onBlur={()=>setTimeout(()=>setCityOpen(false),150)}
                                placeholder={cityLabel||"Search customer..."}
                                className="fos-input text-[10px] py-0.5 w-full pr-6"/>
                            {loadCust && <RefreshCcw size={8} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 animate-spin"/>}
                        </div>
                        {cityOpen && (
                            <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded shadow-lg z-30 max-h-48 overflow-auto text-[10px]">
                                {custList.map((c:any)=>(
                                    <div key={c.unico} onMouseDown={()=>{setCityUq(c.unico);setCityLabel(t(c.CUST_CODE));setCitySearch("");setCityOpen(false);}}
                                        className={cn("px-2 py-1 cursor-pointer hover:bg-blue-50 border-b border-gray-50", cityUq===c.unico&&"bg-blue-50 font-bold")}>
                                        {t(c.CUST_CODE)}
                                    </div>
                                ))}
                                <div ref={custSentinel} className="h-1"/>
                                {!loadCust && custList.length===0 && <div className="p-2 text-center text-gray-300 italic">No results</div>}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <label className="text-[8px] font-black text-gray-400 uppercase">Season</label>
                        <select value={seasonUq} onChange={e=>setSeasonUq(e.target.value)} className="fos-input text-[10px] py-0.5 w-36">
                            <option value="">— Select —</option>
                            {(seasons as any[]).map((s:any)=><option key={s.unico} value={s.unico}>{t(s.po_season||s.unico)}</option>)}
                        </select>
                    </div>
                </div>
                {/* Dual list */}
                <div className="flex gap-2 p-3 flex-1 overflow-hidden" style={{minHeight:0}}>
                    {/* Available — infinite scroll */}
                    <div className="flex-1 flex flex-col gap-1">
                        <div className="flex items-center gap-1 h-5">
                            <span className="text-[9px] font-black text-gray-500 uppercase">
                                Available {getTotal(availPages)>0 && `(${available.length}/${getTotal(availPages)})`}
                            </span>
                            {(loadL||fetchingMoreAvail) && <RefreshCcw size={8} className="text-gray-400 animate-spin"/>}
                        </div>
                        <div className="relative">
                            <Search size={9} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"/>
                            <input value={leftSearch} onChange={e=>setLeftSearch(e.target.value)} placeholder="Search..."
                                className="w-full pl-5 pr-2 py-0.5 text-[10px] border border-gray-200 rounded outline-none"/>
                        </div>
                        <div className="flex-1 border border-gray-200 rounded overflow-auto text-[10px]">
                            <table className="min-w-full"><thead className="bg-gray-50 sticky top-0"><tr>
                                <th className="px-2 py-0.5 text-left font-bold text-gray-500 border-b">Description</th>
                                <th className="px-2 py-0.5 text-right font-bold text-gray-500 border-b w-16">Price</th>
                            </tr></thead><tbody>
                            {available.map((r:any) => (
                                <tr key={r.unico} onClick={()=>setLeftSel(r)} className={cn("cursor-pointer border-b border-gray-50 hover:bg-gray-50", leftSel?.unico===r.unico && "bg-blue-50 font-bold")}>
                                    <td className="px-2 py-0.5">{t(r.description)}</td>
                                    <td className="px-2 py-0.5 text-right">{n2(r.unit_price)}</td>
                                </tr>
                            ))}
                            <tr ref={availSentinel}><td colSpan={2} className="h-1"/></tr>
                            {!(cityUq && seasonUq) && <tr><td colSpan={2} className="p-2 text-center text-gray-300 italic">Select city and season</td></tr>}
                            {(cityUq && seasonUq) && !canSearchPO && <tr><td colSpan={2} className="p-3 text-center text-gray-300 italic">Type 2+ chars to search</td></tr>}
                            {canSearchPO && !loadL && available.length===0 && <tr><td colSpan={2} className="p-2 text-center text-gray-300 italic">No products found</td></tr>}
                            </tbody></table>
                        </div>
                    </div>
                    {/* Center */}
                    <div className="flex flex-col items-center justify-center gap-2 pt-8">
                        <button onClick={doAdd} disabled={!leftSel||saving||!cityUq||!seasonUq}
                            className="bg-[#FB7506] hover:bg-orange-600 disabled:opacity-40 text-white text-[9px] font-black px-3 py-1.5 rounded">Add ►</button>
                    </div>
                    {/* Assigned with inline price editing */}
                    <div className="flex-1 flex flex-col gap-1">
                        <div className="flex items-center gap-1 h-5">
                            <span className="text-[9px] font-black text-gray-500 uppercase">Assigned (editable price)</span>
                            {loadR && <RefreshCcw size={8} className="text-gray-400 animate-spin"/>}
                        </div>
                        <div className="h-6"/>
                        <div className="flex-1 border border-gray-200 rounded overflow-auto text-[10px]">
                            <table className="min-w-full"><thead className="bg-gray-50 sticky top-0"><tr>
                                <th className="px-2 py-0.5 text-left font-bold text-gray-500 border-b">Description</th>
                                <th className="px-2 py-0.5 text-right font-bold text-gray-500 border-b w-20">Price/Unit</th>
                                <th className="px-1 py-0.5 border-b w-6"/>
                            </tr></thead><tbody>
                            {(assigned as any[]).map((r:any) => (
                                <tr key={r.unico} className="border-b border-gray-50 hover:bg-gray-50">
                                    <td className="px-2 py-0.5">{t(r.description)}</td>
                                    <td className="px-1 py-0.5">
                                        <input type="number" step="0.0001" value={editPrice[r.unico]??""} className="w-full text-right fos-input text-[10px] py-0 px-1"
                                            onChange={e=>setEditPrice(p=>({...p,[r.unico]:e.target.value}))}
                                            onBlur={()=>updatePrice(r.unico, editPrice[r.unico]??"")}/>
                                    </td>
                                    <td className="px-1">
                                        <button onClick={()=>removeProduct(r.unico)} className="text-red-400 hover:text-red-600"><X size={10}/></button>
                                    </td>
                                </tr>
                            ))}
                            {!loadR && !(cityUq && seasonUq) && <tr><td colSpan={3} className="p-2 text-center text-gray-300 italic">Select city and season</td></tr>}
                            </tbody></table>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end px-4 py-3 bg-gray-50 border-t rounded-b-xl shrink-0">
                    <Btn icon={XCircle} label="Close" color="gray" onClick={onClose}/>
                </div>
            </div>
        </div>
    );
}

// ─── UpdateStockModal ─────────────────────────────────────────────────────────
function UpdateStockModal({ onClose, logAction }: { onClose: () => void; logAction: (a:any,u:any,e?:any)=>void }) {
    const [search,    setSearch]    = useState("");
    const [debSearch, setDebSearch] = useState("");
    const [pricesMode, setPricesMode] = useState(false);
    const [editVals,   setEditVals]   = useState<Record<string, any>>({});
    const [saving,     setSaving]     = useState<string|null>(null);

    useEffect(() => { const timer = setTimeout(()=>setDebSearch(search),300); return()=>clearTimeout(timer); }, [search]);

    const { data: stockPages, isFetching: loading, fetchNextPage: fetchMoreStock, hasNextPage: hasMoreStock, isFetchingNextPage: fetchingMoreStock } =
        useInfiniteQuery({ queryKey:["upd-stk", debSearch], queryFn:({pageParam})=>sF(`/api/masters/items/products/update-stock?search=${encodeURIComponent(debSearch||"%")}&page=${pageParam}&pageSize=${PAGE_SIZE}`), initialPageParam:1, getNextPageParam: nextPage, staleTime:0 });
    const rows = getPages(stockPages);
    const stockSentinel = useSentinel(() => fetchMoreStock(), !!(hasMoreStock && !fetchingMoreStock));

    useEffect(() => {
        const m: Record<string,any> = {};
        rows.forEach((r:any) => {
            if (!editVals[r.unico]) // don't overwrite user edits
                m[r.unico] = { minimo:r.stock??r.minimo??0, maximo:r.maximum_stock??r.maximo??0, upc:t(r.upc), proyection_upc:t(r.proyection_upc), sales_price:r.sales_price??0 };
        });
        if (Object.keys(m).length > 0) setEditVals(p => ({...p, ...m}));
    }, [stockPages]);

    const saveRow = async (unico: string) => {
        setSaving(unico);
        try {
            const v = editVals[unico];
            const res = await fetch(`/api/masters/items/products/update-stock/${unico}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ minimo:v.minimo, maximo:v.maximo, upc:v.upc, proyection_upc:v.proyection_upc, sales_price:v.sales_price }) });
            const d = await res.json();
            if (!d.success) alert(d.error);
            else logAction("Edit", unico, "Update Stock");
        } catch {}
        finally { setSaving(null); }
    };

    const fieldCls = "fos-input text-[10px] py-0 px-1 w-full text-right";
    const roCls    = cn(fieldCls, "bg-gray-50 text-gray-400 cursor-default");

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 sm:p-4">
            <div className="bg-white rounded-t-xl sm:rounded-xl shadow-2xl w-full sm:max-w-3xl flex flex-col h-[85vh] sm:h-[80vh]">
                <div className="h-10 bg-[#374151] rounded-t-xl flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-2">
                        <ClipboardList size={13} className="text-[#FB7506]"/>
                        <span className="font-black text-[10px] uppercase tracking-widest text-white">Update UPC / Stocks</span>
                    </div>
                    <button onClick={onClose}><XCircle size={15} className="text-gray-400 hover:text-white"/></button>
                </div>
                <div className="p-2 border-b flex items-center gap-2 shrink-0">
                    <div className="relative flex-1">
                        <Search size={9} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"/>
                        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products..."
                            className="w-full pl-6 pr-2 py-1 text-[10px] border border-gray-200 rounded outline-none"/>
                    </div>
                    <button onClick={()=>setPricesMode(p=>!p)} className={cn("text-[9px] font-black uppercase px-2 py-1 rounded border transition-colors", pricesMode ? "bg-[#FB7506] text-white border-[#FB7506]" : "border-gray-300 text-gray-600 hover:bg-gray-50")}>
                        {pricesMode ? "Sale Mode" : "Prices Mode"}
                    </button>
                    {loading && <RefreshCcw size={11} className="text-gray-400 animate-spin"/>}
                </div>
                <div className="flex-1 overflow-auto p-2">
                    <table className="min-w-full text-[10px]">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-2 py-1 text-left font-bold text-gray-500 border-b min-w-[200px]">Description</th>
                                <th className="px-1 py-1 text-right font-bold text-gray-500 border-b w-16">Min</th>
                                <th className="px-1 py-1 text-right font-bold text-gray-500 border-b w-16">Max</th>
                                <th className="px-1 py-1 text-right font-bold text-gray-500 border-b w-28">UPC</th>
                                <th className="px-1 py-1 text-right font-bold text-gray-500 border-b w-28">Proj. UPC</th>
                                <th className="px-1 py-1 text-right font-bold text-gray-500 border-b w-20">Sales Price</th>
                                <th className="px-1 py-1 border-b w-8"/>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {(rows as any[]).map((r:any) => {
                                const v = editVals[r.unico] || {};
                                return (
                                    <tr key={r.unico} className="hover:bg-gray-50">
                                        <td className="px-2 py-0.5 font-medium truncate max-w-[200px]">{t(r.description)}</td>
                                        <td className="px-1 py-0.5"><input className={fieldCls} type="number" value={v.minimo??0} onChange={e=>setEditVals(p=>({...p,[r.unico]:{...p[r.unico],minimo:parseInt(e.target.value)||0}}))}/></td>
                                        <td className="px-1 py-0.5"><input className={fieldCls} type="number" value={v.maximo??0} onChange={e=>setEditVals(p=>({...p,[r.unico]:{...p[r.unico],maximo:parseInt(e.target.value)||0}}))}/></td>
                                        <td className="px-1 py-0.5"><input className={pricesMode?roCls:fieldCls} readOnly={pricesMode} value={v.upc??""} onChange={e=>setEditVals(p=>({...p,[r.unico]:{...p[r.unico],upc:e.target.value}}))}/></td>
                                        <td className="px-1 py-0.5"><input className={pricesMode?roCls:fieldCls} readOnly={pricesMode} value={v.proyection_upc??""} onChange={e=>setEditVals(p=>({...p,[r.unico]:{...p[r.unico],proyection_upc:e.target.value}}))}/></td>
                                        <td className="px-1 py-0.5"><input className={pricesMode?fieldCls:roCls} readOnly={!pricesMode} type="number" step="0.0001" value={v.sales_price??0} onChange={e=>setEditVals(p=>({...p,[r.unico]:{...p[r.unico],sales_price:parseFloat(e.target.value)||0}}))}/></td>
                                        <td className="px-1 py-0.5">
                                            <button onClick={()=>saveRow(r.unico)} disabled={saving===r.unico} className="text-[#FB7506] hover:text-orange-600 disabled:opacity-40">
                                                {saving===r.unico ? <RefreshCcw size={10} className="animate-spin"/> : <Save size={10}/>}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            <tr ref={stockSentinel}><td colSpan={7} className="h-1 py-0">
                                {fetchingMoreStock && <div className="text-center py-1 text-[9px] text-gray-400"><RefreshCcw size={9} className="inline animate-spin mr-1"/>Loading more...</div>}
                            </td></tr>
                            {!loading && rows.length===0 && <tr><td colSpan={7} className="p-4 text-center text-gray-300 italic">No products found</td></tr>}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-end px-4 py-3 bg-gray-50 border-t rounded-b-xl shrink-0">
                    <Btn icon={XCircle} label="Close" color="gray" onClick={onClose}/>
                </div>
            </div>
        </div>
    );
}

// ─── PreBookDateModal ─────────────────────────────────────────────────────────
function PreBookDateModal({ title, productDesc, showDeletePrior, showChangeCase, onConfirm, onClose }: {
    title: string; productDesc: string;
    showDeletePrior?: boolean; showChangeCase?: boolean;
    onConfirm: (data: any) => void;
    onClose: () => void;
}) {
    const today = new Date().toISOString().split("T")[0];
    const [dateFrom,     setDateFrom]     = useState(today);
    const [dateTo,       setDateTo]       = useState(today);
    const [deletePrior,  setDeletePrior]  = useState(false);
    const [changeCase,   setChangeCase]   = useState(false);
    const [err,          setErr]          = useState<string|null>(null);

    const confirm = () => {
        if (!dateFrom || !dateTo) { setErr("Invalid date."); return; }
        if (dateTo < dateFrom) { setErr("Invalid date range."); return; }
        onConfirm({ date_from: dateFrom, date_to: dateTo, delete_prior: deletePrior, change_case: changeCase });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 sm:p-4">
            <div className="bg-white rounded-t-xl sm:rounded-xl shadow-2xl w-full sm:w-80 max-h-[85vh]">
                <div className="h-10 bg-[#374151] rounded-t-xl flex items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <Calendar size={13} className="text-[#FB7506]"/>
                        <span className="font-black text-[10px] uppercase tracking-widest text-white">{title}</span>
                    </div>
                    <button onClick={onClose}><XCircle size={15} className="text-gray-400 hover:text-white"/></button>
                </div>
                <div className="p-4 space-y-3 text-xs">
                    <div><span className="text-[9px] font-black text-gray-400 uppercase">Product</span><p className="text-gray-600 mt-0.5">{productDesc}</p></div>
                    {err && <p className="text-red-500 text-[9px] font-bold">{err}</p>}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-0.5">
                            <label className="text-[9px] font-black text-gray-400 uppercase">Date From *</label>
                            <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} className="fos-input text-xs py-1"/>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <label className="text-[9px] font-black text-gray-400 uppercase">Date To *</label>
                            <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} className="fos-input text-xs py-1"/>
                        </div>
                    </div>
                    {showDeletePrior && <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={deletePrior} onChange={e=>setDeletePrior(e.target.checked)} className="w-3.5 h-3.5 accent-[#FB7506]"/><span>Delete Prior Recipe</span></label>}
                    {showChangeCase  && <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={changeCase}  onChange={e=>setChangeCase(e.target.checked)}  className="w-3.5 h-3.5 accent-[#FB7506]"/><span>Change Case</span></label>}
                </div>
                <div className="flex justify-end gap-2 px-4 py-3 bg-gray-50 border-t rounded-b-xl">
                    <Btn icon={X}    label="Cancel"  color="gray"  onClick={onClose}/>
                    <Btn icon={Check} label="Confirm" color="amber" onClick={confirm}/>
                </div>
            </div>
        </div>
    );
}

// ─── Products Modal (Tab 2 version — with cascading variety selector) ─────────
const EMPTY_PROD2 = { class_filter:"", subclass_filter:"", variety_uq:"", type_uq:"", dis_type:false, dis_class:true, dis_subcla:true, dis_variety:true, color_uq:"", dis_color:true, grade_uq:"", dis_grade:true, case_uq:"", dis_case:true, up_x_pack:1, pack_unit:"", stem_pack:false, up_x_case:1, min_pur_price:0, sales_price:0, inv_track:true, auto_description:true, web:false, mix_class:false, mix_subclass:false, mix_color:false, mix_grade:false, old_description:"", old_code:"", upc:"", boxcode:"", boxcode2:"", remarks:"", customer_uq:"", weight:0, retail_price:0, upc_text:"", color_breakdown:"", upc_notes:"", additional_notes:"", rotation:0, country_of_origin:"", shopify_name:"", shopify_color:"", shopify_size:"", shopify_subtype:"", shopify_variety:"", active:true };

function ProductsModalTab2({ mode, form, setForm, lookups, onSave, onClose, saving, error }: any) {
    const [noteTab, setNoteTab] = useState("remarks");
    const totalUnits = form.stem_pack ? (form.up_x_case||0) : (form.up_x_pack||0)*(form.up_x_case||0);

    const { data: classes = EMPTY_ARR } = useQuery({ queryKey:["pm2-cl"], queryFn:()=>sF("/api/masters/items/classes?search=%"), staleTime:60000 });
    const { data: subclasses = EMPTY_ARR } = useQuery({ queryKey:["pm2-sc", form.class_filter], queryFn:()=>sF(`/api/masters/items/subclasses?class_uq=${form.class_filter}&search=%`), enabled:!!form.class_filter, staleTime:60000 });
    const { data: varieties = EMPTY_ARR } = useQuery({ queryKey:["pm2-vr", form.subclass_filter], queryFn:()=>sF(`/api/masters/items/varieties?subclass_uq=${form.subclass_filter}&search=%`), enabled:!!form.subclass_filter, staleTime:60000 });

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 sm:p-4">
            <div className="bg-white rounded-t-xl sm:rounded-xl shadow-2xl w-full sm:max-w-2xl flex flex-col h-[85vh] sm:h-[80vh]">
                <div className="h-10 bg-[#374151] rounded-t-xl flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-2">
                        <Package size={13} className="text-[#FB7506]"/>
                        <span className="font-black text-[10px] uppercase tracking-widest text-white">
                            {mode==="add" ? "New Product" : mode==="copy" ? "Copy Product" : "Edit Product"}
                        </span>
                        {error && <span className="text-amber-400 text-[9px] ml-1 font-bold truncate">{error}</span>}
                    </div>
                    <button onClick={onClose}><XCircle size={15} className="text-gray-400 hover:text-white"/></button>
                </div>

                <div className="overflow-y-auto flex-1 p-4 space-y-3 text-xs">
                    {/* Variety selector (add/copy mode) */}
                    {(mode==="add"||mode==="copy") && (
                        <div className="border border-[#FB7506]/30 rounded p-2 bg-orange-50/30 grid grid-cols-3 gap-2">
                            <div className="flex flex-col gap-0.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase">Class *</label>
                                <select value={form.class_filter||""} onChange={e=>setForm((p:any)=>({...p,class_filter:e.target.value,subclass_filter:"",variety_uq:""}))} className="fos-input text-xs py-1">
                                    <option value="">— Select —</option>
                                    {(classes as any[]).map((c:any)=><option key={c.unico} value={c.unico}>{t(c.clase)}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase">Subclass *</label>
                                <select value={form.subclass_filter||""} onChange={e=>setForm((p:any)=>({...p,subclass_filter:e.target.value,variety_uq:""}))} disabled={!form.class_filter} className="fos-input text-xs py-1 disabled:opacity-50">
                                    <option value="">— Select —</option>
                                    {(subclasses as any[]).map((s:any)=><option key={s.unico} value={s.unico}>{t(s.subclase)}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase">Variety *</label>
                                <select value={form.variety_uq||""} onChange={e=>setForm((p:any)=>({...p,variety_uq:e.target.value}))} disabled={!form.subclass_filter} className="fos-input text-xs py-1 disabled:opacity-50">
                                    <option value="">— Select —</option>
                                    {(varieties as any[]).map((v:any)=><option key={v.unico} value={v.unico}>{t(v.variety)}</option>)}
                                </select>
                            </div>
                        </div>
                    )}
                    {mode==="edit" && (
                        <div className="text-xs text-gray-600 font-bold border-b border-gray-100 pb-1">{t(form.description)}</div>
                    )}

                    {/* Type / Grade / Case */}
                    <div className="grid grid-cols-3 gap-2">
                        {[{ label:"Type",key:"type_uq",dis:"dis_type",items:lookups?.types||[],vK:"unico",lK:"type" },{ label:"Grade",key:"grade_uq",dis:"dis_grade",items:lookups?.grades||[],vK:"unico",lK:"grado" },{ label:"Case",key:"case_uq",dis:"dis_case",items:lookups?.cases||[],vK:"unico",lK:"case_name" }].map(f=>(
                            <div key={f.key} className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-1.5">
                                    <label className="text-[9px] font-black text-gray-400 uppercase">{f.label}</label>
                                    <label className="flex items-center gap-0.5 cursor-pointer">
                                        <input type="checkbox" checked={!!form[f.dis]} onChange={e=>setForm((p:any)=>({...p,[f.dis]:e.target.checked}))} className="w-3 h-3 accent-[#FB7506]"/>
                                        <span className="text-[8px] text-gray-400">Show</span>
                                    </label>
                                </div>
                                <select value={form[f.key]||""} onChange={e=>setForm((p:any)=>({...p,[f.key]:e.target.value}))} className="fos-input text-xs py-1">
                                    <option value="">— None —</option>
                                    {f.items.map((it:any)=><option key={it[f.vK]} value={it[f.vK]}>{t(it[f.lK])}</option>)}
                                </select>
                            </div>
                        ))}
                    </div>
                    {/* Color */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase">Color</label>
                                <label className="flex items-center gap-0.5 cursor-pointer">
                                    <input type="checkbox" checked={!!form.dis_color} onChange={e=>setForm((p:any)=>({...p,dis_color:e.target.checked}))} className="w-3 h-3 accent-[#FB7506]"/>
                                    <span className="text-[8px] text-gray-400">Show</span>
                                </label>
                            </div>
                            <select value={form.color_uq||""} onChange={e=>setForm((p:any)=>({...p,color_uq:e.target.value}))} className="fos-input text-xs py-1">
                                <option value="">— None —</option>
                                {(lookups?.colors||[]).map((c:any)=><option key={c.unico} value={c.unico}>{t(c.color)}</option>)}
                            </select>
                        </div>
                    </div>
                    {/* Quantities */}
                    <div className="border-t border-gray-100 pt-2 grid grid-cols-4 gap-2">
                        {[{ label:"Units/Pack *",key:"up_x_pack",type:"number" },{ label:"Pack Unit *",key:"pack_unit",type:"select",items:lookups?.units||[],vK:"unico",lK:"unit" },{ label:"Packs/Case *",key:"up_x_case",type:"number" }].map(f=>(
                            <div key={f.key} className="flex flex-col gap-0.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase">{f.label}</label>
                                {f.type==="select"
                                    ? <select value={form[f.key]||""} onChange={e=>setForm((p:any)=>({...p,[f.key]:e.target.value}))} className="fos-input text-xs py-1"><option value="">—</option>{(f.items||[]).map((it:any)=><option key={it[f.vK!]} value={it[f.vK!]}>{t(it[f.lK!])}</option>)}</select>
                                    : <input type="number" value={form[f.key]||0} onChange={e=>setForm((p:any)=>({...p,[f.key]:parseInt(e.target.value)||0}))} className="fos-input text-xs py-1"/>}
                            </div>
                        ))}
                        <div className="flex flex-col gap-0.5"><label className="text-[9px] font-black text-gray-400 uppercase">Total Units</label><input readOnly value={totalUnits} className="fos-input text-xs py-1 bg-gray-50 text-gray-500 font-bold"/></div>
                    </div>
                    {/* Prices */}
                    <div className="grid grid-cols-4 gap-2">
                        {[{l:"Sales Price",k:"sales_price",s:0.01},{l:"Retail Price",k:"retail_price",s:0.01},{l:"Weight KG",k:"weight",s:0.01},{l:"Rotation",k:"rotation",s:1},{l:"Min Pur. Price",k:"min_pur_price",s:0.01}].map(f=>(
                            <div key={f.k} className="flex flex-col gap-0.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase">{f.l}</label>
                                <input type="number" step={f.s} value={form[f.k]||0} onChange={e=>setForm((p:any)=>({...p,[f.k]:parseFloat(e.target.value)||0}))} className="fos-input text-xs py-1"/>
                            </div>
                        ))}
                    </div>
                    {/* Identifiers */}
                    <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-2">
                        {[{k:"old_code",l:"EDI Code"},{k:"boxcode",l:"Box Code"},{k:"boxcode2",l:"Item Number"},{k:"upc",l:"UPC"},{k:"upc_text",l:"UPC Text"},{k:"country_of_origin",l:"Country of Origin"}].map(f=>(
                            <div key={f.k} className="flex flex-col gap-0.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase">{f.l}</label>
                                <input value={form[f.k]||""} onChange={e=>setForm((p:any)=>({...p,[f.k]:e.target.value}))} className="fos-input text-xs py-1"/>
                            </div>
                        ))}
                    </div>
                    {/* Checkboxes */}
                    <div className="flex flex-wrap gap-4 border-t border-gray-100 pt-2">
                        {[{k:"stem_pack",l:"Price by Stem"},{k:"inv_track",l:"Inventory"},{k:"auto_description",l:"Auto Description"},{k:"web",l:"Web Publish"},...(mode==="edit"?[{k:"active",l:"Active"}]:[])].map(f=>(
                            <label key={f.k} className="flex items-center gap-1.5 cursor-pointer">
                                <input type="checkbox" checked={!!form[f.k]} onChange={e=>setForm((p:any)=>({...p,[f.k]:e.target.checked}))} className="w-3.5 h-3.5 accent-[#FB7506]"/>
                                <span className="text-xs font-semibold text-gray-600">{f.l}</span>
                            </label>
                        ))}
                    </div>
                    {/* Notes */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="flex border-b border-gray-200 bg-gray-50">
                            {[{id:"remarks",l:"Instructions"},{id:"color_breakdown",l:"Colors"},{id:"upc_notes",l:"UPC Notes"},{id:"additional_notes",l:"Additional"}].map(tab=>(
                                <button key={tab.id} onClick={()=>setNoteTab(tab.id)} className={cn("flex-1 py-1.5 text-[9px] font-black uppercase tracking-wide transition-colors", noteTab===tab.id ? "bg-white text-[#FB7506] border-b-2 border-[#FB7506]" : "text-gray-400 hover:text-gray-600")}>{tab.l}</button>
                            ))}
                        </div>
                        <textarea value={form[noteTab]||""} rows={2} onChange={e=>setForm((p:any)=>({...p,[noteTab]:e.target.value}))} className="w-full p-2 text-xs outline-none resize-none border-0"/>
                    </div>
                </div>
                <div className="flex justify-end gap-2 px-4 py-3 bg-gray-50 border-t rounded-b-xl shrink-0">
                    <Btn icon={X}    label="Cancel" color="gray"  onClick={onClose}/>
                    <Btn icon={Save} label={mode==="add"||mode==="copy" ? "Create" : "Save"} color="amber" onClick={onSave} disabled={saving}/>
                </div>
            </div>
        </div>
    );
}

// ─── ImageModal ───────────────────────────────────────────────────────────────
function ImageModal({ product, onClose, onFirstImageChanged }: {
    product: any;
    onClose: () => void;
    onFirstImageChanged: (uq: string, url: string) => void;
}) {
    const [images,    setImages]    = useState<string[]>([]);
    const [selIdx,    setSelIdx]    = useState(0);
    const [loading,   setLoading]   = useState(true);
    const [file,      setFile]      = useState<File|null>(null);
    const [preview,   setPreview]   = useState<string|null>(null);
    const [uploading, setUploading] = useState(false);
    const [error,     setError]     = useState<string|null>(null);
    const [dragging,  setDragging]  = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const uq = t(product.unico);

    // Load all images for this product
    useEffect(() => {
        setLoading(true);
        fetch(`/api/products/images/product?uq=${encodeURIComponent(uq)}`)
            .then(r => r.json())
            .then(j => { setImages(j.images ?? []); setSelIdx(0); })
            .catch(() => setImages([]))
            .finally(() => setLoading(false));
    }, [uq]);

    const pickFile = (f: File) => {
        setFile(f); setError(null);
        const reader = new FileReader();
        reader.onload = e => setPreview(e.target?.result as string);
        reader.readAsDataURL(f);
    };

    const upload = async () => {
        if (!file) return;
        setUploading(true); setError(null);
        const fd = new FormData();
        fd.append("file", file);
        fd.append("product_uq", uq);
        try {
            const r = await fetch("/api/products/images/upload", { method: "POST", body: fd });
            const j = await r.json();
            if (!r.ok || !j.url) throw new Error(j.error || "Upload failed");
            const newImages = [...images, j.url];
            setImages(newImages);
            setSelIdx(newImages.length - 1);
            setFile(null); setPreview(null);
            if (newImages.length === 1 || j.number === 1)
                onFirstImageChanged(uq, j.url);
        } catch(e: any) { setError(e.message); }
        finally { setUploading(false); }
    };

    const displayed = preview || images[selIdx] || DEFAULT_THUMB;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
             onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[90vh]"
                 onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="bg-[#0d1b2a] px-4 py-3 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-[#FB7506] rounded-lg flex items-center justify-center shrink-0">
                            <ImageIcon size={15} className="text-white" />
                        </div>
                        <div>
                            <span className="font-black text-[12px] text-white uppercase tracking-widest">Product Images</span>
                            <p className="text-[10px] text-white/50 truncate max-w-[200px]">{t(product.description)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {!loading && <span className="text-[10px] text-white/40">{images.length} photo{images.length !== 1 ? "s" : ""}</span>}
                        <button onClick={onClose} className="text-white/50 hover:text-white text-lg font-light leading-none">—</button>
                    </div>
                </div>

                {/* Main image */}
                <div className="w-full bg-gray-50 shrink-0" style={{ aspectRatio: "4/3" }}>
                    {loading
                        ? <div className="w-full h-full flex items-center justify-center"><RefreshCcw size={20} className="animate-spin text-gray-300" /></div>
                        : <img src={displayed} alt={t(product.description)}
                               className="w-full h-full object-contain"
                               onError={e => { (e.target as HTMLImageElement).src = DEFAULT_THUMB; }} />
                    }
                </div>

                {/* Thumbnail strip */}
                {images.length > 0 && (
                    <div className="flex gap-2 px-3 py-2 overflow-x-auto shrink-0 bg-gray-50 border-t border-gray-100">
                        {images.map((url, i) => (
                            <button key={i} onClick={() => { setSelIdx(i); setPreview(null); setFile(null); }}
                                className={cn("shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all",
                                    selIdx === i && !preview ? "border-[#FB7506] ring-1 ring-[#FB7506]" : "border-gray-200 hover:border-gray-400")}>
                                <img src={url} alt="" className="w-full h-full object-cover"
                                     onError={e => { (e.target as HTMLImageElement).src = DEFAULT_THUMB; }} />
                            </button>
                        ))}
                    </div>
                )}

                {/* Upload area */}
                <div className="px-4 py-3 flex-1 overflow-y-auto">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Add New Image</p>
                    <div
                        className={cn("border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-colors",
                            dragging ? "border-[#FB7506] bg-orange-50" : "border-gray-200 hover:border-[#FB7506] hover:bg-orange-50/40")}
                        onClick={() => inputRef.current?.click()}
                        onDragOver={e => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) pickFile(f); }}>
                        <Upload size={16} className="mx-auto text-gray-400 mb-1" />
                        <p className="text-[10px] font-bold text-gray-500">{file ? file.name : "Click or drag image here"}</p>
                        <p className="text-[9px] text-gray-400 mt-0.5">JPG · PNG · WEBP — public-read · auto-numbered</p>
                        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                               onChange={e => { const f = e.target.files?.[0]; if (f) pickFile(f); }} />
                    </div>
                    {error && <p className="text-red-500 text-[10px] font-bold mt-2">{error}</p>}
                </div>

                {/* Footer */}
                <div className="px-4 pb-4 shrink-0">
                    <button onClick={upload} disabled={!file || uploading}
                        className="w-full flex items-center justify-center gap-2 py-3 text-[13px] font-black text-white bg-[#FB7506] hover:bg-orange-500 active:bg-orange-600 rounded-xl disabled:opacity-40 transition-colors">
                        {uploading ? <RefreshCcw size={15} className="animate-spin" /> : <Upload size={15} />}
                        {uploading ? "Uploading…" : `Upload as image #${images.length + 1}`}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Tab 2 Main ───────────────────────────────────────────────────────────────
export default function Tab2() {
    const qc = useQueryClient();
    const { logAction } = useAuditLog("items-setup", "flower_products");
    const perms         = usePagePermissions("items-setup");

    const [selProduct,   setSelProduct]   = useState<any>(null);
    const [searchText,   setSearchText]   = useState("");
    const [debSearch,    setDebSearch]    = useState("");
    const [productImages, setProductImages] = useState<Record<string, string>>({});
    const [imageModal,    setImageModal]    = useState<any>(null);
    const [productModal, setProductModal] = useState<{mode:"add"|"edit"|"copy"|"delete"}|null>(null);
    const [productForm,  setProductForm]  = useState<any>({...EMPTY_PROD2});
    const [saving,       setSaving]       = useState(false);
    const [formError,    setFormError]    = useState<string|null>(null);

    // Modal visibility flags
    const [showAlt,      setShowAlt]      = useState(false);
    const [showRecipe,   setShowRecipe]   = useState(false);
    const [showQuota,    setShowQuota]    = useState(false);
    const [showPO,       setShowPO]       = useState(false);
    const [showStock,    setShowStock]    = useState(false);
    const [showPrebook,  setShowPrebook]  = useState<"recipe"|"upc"|"sales"|null>(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebSearch(searchText), 400);
        return () => clearTimeout(timer);
    }, [searchText]);

    const { data: prodPages, isFetching: loadingP, fetchNextPage: fetchMoreProds, hasNextPage: hasMoreProds, isFetchingNextPage: fetchingMoreProds, refetch: refetchAll } =
        useInfiniteQuery({ queryKey:["items-tab2", debSearch], queryFn:({pageParam})=>sF(`/api/masters/items/products/all?page=${pageParam}&pageSize=${PAGE_SIZE}&search=${encodeURIComponent(debSearch)}`), initialPageParam:1, getNextPageParam: nextPage, staleTime:30000 });
    const { data: lookups } = useQuery({ queryKey:["items-look"], queryFn:()=>sF("/api/masters/items/lookups"), staleTime:600000 });

    const products     = getPages(prodPages);
    const totalRecords = getTotal(prodPages);
    const prodSentinel = useSentinel(() => fetchMoreProds(), !!(hasMoreProds && !fetchingMoreProds));

    // Batch-load images for visible products
    useEffect(() => {
        if (products.length === 0) return;
        const missing = products.map((p: any) => t(p.unico) as string).filter((uq: string) => uq && !productImages[uq]);
        if (missing.length === 0) return;
        fetch("/api/products/images", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productUqs: missing }),
        }).then(r => r.json()).then(j => {
            if (j.images) setProductImages(prev => ({ ...prev, ...j.images }));
        }).catch(() => {});
    }, [products]);

    // Auto-select first on page change
    useEffect(() => {
        if (products.length > 0) {
            const stillHere = products.find((p: any) => p.unico === selProduct?.unico);
            if (!stillHere) setSelProduct(products[0]);
        }
    }, [products]);

    const doCrud = async (endpoint: string, method: string, body: any, onSuccess: (data: any) => void) => {
        setSaving(true); setFormError(null);
        try {
            const res  = await fetch(endpoint, { method, headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            onSuccess(data);
        } catch(e:any) { setFormError(e.message); }
        finally { setSaving(false); }
    };

    const saveProduct = () => {
        if (!productForm.variety_uq && (productModal?.mode==="add"||productModal?.mode==="copy")) { setFormError("Select a variety first."); return; }
        if (!productForm.up_x_pack) { setFormError("Units per pack is required."); return; }
        const body = { ...productForm };
        if (productModal?.mode==="add"||productModal?.mode==="copy") {
            doCrud("/api/masters/items/products", "POST", body, d => { logAction("Insert", d.unico, productModal!.mode==="copy"?"Copy Product":"Product"); refetchAll(); setProductModal(null); });
        } else {
            doCrud(`/api/masters/items/products/${selProduct?.unico}`, "PUT", body, () => { logAction("Edit", selProduct?.unico, "Product"); refetchAll(); setProductModal(null); });
        }
    };
    const deleteProduct = () => doCrud(`/api/masters/items/products/${selProduct?.unico}`, "DELETE", {}, () => { logAction("Delete", selProduct?.unico, "Product"); setSelProduct(null); refetchAll(); setProductModal(null); });

    const openModal = (mode: "add"|"edit"|"copy") => {
        if (mode!=="add" && !selProduct) { setFormError(NO_PROD); return; }
        if ((mode==="add"||mode==="copy") && !perms.canCreate) { setFormError(PERMISSION_MSGS.create); return; }
        if (mode==="edit" && !perms.canEdit) { setFormError(PERMISSION_MSGS.edit); return; }
        // sp_NC_products_general_list returns class_uq/subclass_uq — use them to pre-fill cascade in Edit/Copy
        const f = mode==="add"
            ? {...EMPTY_PROD2}
            : { ...selProduct, class_filter: selProduct.class_uq ?? "", subclass_filter: selProduct.subclass_uq ?? "" };
        setProductForm(f); setFormError(null); setProductModal({mode});
    };

    const requireProduct = (fn: ()=>void) => { if (!selProduct) { setFormError(NO_PROD); return; } fn(); };

    const handlePrebook = async (type: "recipe"|"upc"|"sales", data: any) => {
        setShowPrebook(null);
        setFormError("This feature is coming soon — SP not yet available in database.");
    };

    const handleDirectAction = async (action: "default-charge"|"extended-recipe") => {
        if (!selProduct) { setFormError(NO_PROD); return; }
        if (!confirm(`Confirm: ${action.replace("-"," ")}?`)) return;
        setFormError(`Coming soon — sp_flower_products_${action.replace("-","_")} not found in database.`);
    };

    const handlePrint = async (type: "bouquet"|"box"|"extended") => {
        if (!selProduct) { setFormError(NO_PROD); return; }
        if (!perms.canReport) { setFormError(PERMISSION_MSGS.report); return; }
        if (type !== "bouquet") { setFormError(`${type} composition print — Coming soon (SP not found in DB).`); return; }
        try {
            const r = await fetch(`/api/masters/items/products/${selProduct.unico}/print-composition?type=bouquet`);
            const d = await r.json();
            alert(`Bouquet Composition: ${d.length ?? 0} record(s). Print functionality coming soon.`);
        } catch(e:any){ setFormError(e.message); }
    };

    // Dropdown state for toolbar dropdowns
    const [prebookOpen, setPrebookOpen] = useState<"recipe"|"upc"|"sales"|null>(null);
    const [printOpen,   setPrintOpen]   = useState(false);

    return (
        <div className="flex flex-col flex-1 overflow-hidden">
            {/* Toolbar */}
            <div className="bg-[#F5F3F3] border-b border-[#DBD9D9] px-2 py-1 shrink-0 space-y-1">
                {/* Row 1 */}
                <div className="flex flex-wrap items-center gap-1">
                    <Btn icon={Plus}    label="Add"    color="green"  onClick={()=>openModal("add")}    disabled={!perms.canCreate}/>
                    <Btn icon={Pencil}  label="Edit"   color="blue"   onClick={()=>openModal("edit")}   disabled={!selProduct||!perms.canEdit}/>
                    <Btn icon={Trash2}  label="Delete" color="red"    onClick={()=>{if(!selProduct){setFormError(NO_PROD);return;} if(!perms.canDelete){setFormError(PERMISSION_MSGS.delete);return;} setProductModal({mode:"delete"});}} disabled={!selProduct||!perms.canDelete}/>
                    <Btn icon={Copy}    label="Copy"   color="gray"   onClick={()=>openModal("copy")}   disabled={!selProduct||!perms.canCreate}/>
                    <div className="w-px h-5 bg-gray-300 mx-0.5"/>
                    <Btn icon={Layers}  label="Bouquet" color="amber"  onClick={()=>requireProduct(()=>setFormError("Bouquet Composition — Coming soon"))}  disabled={!selProduct}/>
                    <Btn icon={Box}     label="Box"     color="amber"  onClick={()=>requireProduct(()=>setFormError("Box Composition — Coming soon"))}        disabled={!selProduct}/>
                    <div className="w-px h-5 bg-gray-300 mx-0.5"/>
                    <Btn icon={Shuffle}      label="Alternatives" color="purple" onClick={()=>requireProduct(()=>setShowAlt(true))}    disabled={!selProduct}/>
                    <Btn icon={BookOpen}     label="Recipes"      color="purple" onClick={()=>requireProduct(()=>setShowRecipe(true))} disabled={!selProduct}/>
                    <Btn icon={Users}        label="Quotas"       color="purple" onClick={()=>requireProduct(()=>setShowQuota(true))}  disabled={!selProduct}/>
                </div>
                {/* Row 2 */}
                <div className="flex flex-wrap items-center gap-1">
                    {/* Recipe To Prebook */}
                    <div className="relative">
                        <button onClick={()=>setPrebookOpen(p=>p==="recipe"?null:"recipe")} disabled={!selProduct} className="flex items-center gap-0.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-40 text-white text-[9px] font-black uppercase px-2 py-1 rounded">
                            <Calendar size={9}/> Recipe→Prebook <ChevronDown size={8}/>
                        </button>
                        {prebookOpen==="recipe" && <div className="absolute top-full left-0 mt-0.5 bg-white border border-gray-200 rounded shadow-lg z-20 w-48 text-xs">
                            <button onClick={()=>{setPrebookOpen(null);requireProduct(()=>setShowPrebook("recipe"));}} className="w-full text-left px-3 py-2 hover:bg-gray-50 font-semibold border-b">Fill Recipe in Prebooks</button>
                        </div>}
                    </div>
                    {/* UPC To Prebook */}
                    <div className="relative">
                        <button onClick={()=>setPrebookOpen(p=>p==="upc"?null:"upc")} disabled={!selProduct} className="flex items-center gap-0.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-40 text-white text-[9px] font-black uppercase px-2 py-1 rounded">
                            <Calendar size={9}/> UPC→Prebook <ChevronDown size={8}/>
                        </button>
                        {prebookOpen==="upc" && <div className="absolute top-full left-0 mt-0.5 bg-white border border-gray-200 rounded shadow-lg z-20 w-44 text-xs">
                            <button onClick={()=>{setPrebookOpen(null);requireProduct(()=>setShowPrebook("upc"));}} className="w-full text-left px-3 py-2 hover:bg-gray-50 font-semibold border-b">Fill UPC Info in Prebooks</button>
                        </div>}
                    </div>
                    {/* Sales Info To Prebook */}
                    <div className="relative">
                        <button onClick={()=>setPrebookOpen(p=>p==="sales"?null:"sales")} disabled={!selProduct} className="flex items-center gap-0.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-40 text-white text-[9px] font-black uppercase px-2 py-1 rounded">
                            <Calendar size={9}/> Sales→Prebook <ChevronDown size={8}/>
                        </button>
                        {prebookOpen==="sales" && <div className="absolute top-full left-0 mt-0.5 bg-white border border-gray-200 rounded shadow-lg z-20 w-48 text-xs">
                            <button onClick={()=>{setPrebookOpen(null);requireProduct(()=>setShowPrebook("sales"));}} className="w-full text-left px-3 py-2 hover:bg-gray-50 font-semibold border-b">Fill Sales Info in Prebooks</button>
                        </div>}
                    </div>
                    <div className="w-px h-5 bg-gray-300 mx-0.5"/>
                    <Btn icon={ClipboardList} label="Update Stock" color="gray"   onClick={()=>{if(!perms.canEdit){setFormError(PERMISSION_MSGS.edit);return;} setShowStock(true);}} disabled={!perms.canEdit}/>
                    <Btn icon={BarChart2}     label="PO Prices"    color="gray"   onClick={()=>{if(!perms.canCreate){setFormError(PERMISSION_MSGS.create);return;} setShowPO(true);}}/>
                    <div className="w-px h-5 bg-gray-300 mx-0.5"/>
                    <Btn icon={Package}  label="Dflt Charge"  color="amber" onClick={()=>handleDirectAction("default-charge")}  disabled={!selProduct}/>
                    <Btn icon={Layers}   label="Ext. Recipe"  color="amber" onClick={()=>handleDirectAction("extended-recipe")}  disabled={!selProduct}/>
                    {/* Print Composition */}
                    <div className="relative">
                        <button onClick={()=>setPrintOpen(p=>!p)} disabled={!selProduct||!perms.canReport} className="flex items-center gap-0.5 bg-gray-600 hover:bg-gray-700 disabled:opacity-40 text-white text-[9px] font-black uppercase px-2 py-1 rounded">
                            <Printer size={9}/> Print Comp. <ChevronDown size={8}/>
                        </button>
                        {printOpen && <div className="absolute top-full left-0 mt-0.5 bg-white border border-gray-200 rounded shadow-lg z-20 w-44 text-xs" onMouseLeave={()=>setPrintOpen(false)}>
                            <button onClick={()=>{setPrintOpen(false);handlePrint("bouquet");}} className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b">Bouquet</button>
                            <button onClick={()=>{setPrintOpen(false);handlePrint("box");}}     className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b">Box</button>
                            <button onClick={()=>{setPrintOpen(false);handlePrint("extended");}} className="w-full text-left px-3 py-2 hover:bg-gray-50">Extended</button>
                        </div>}
                    </div>
                </div>
            </div>

            {/* Search + error */}
            <div className="px-2 py-1 border-b border-[#DBD9D9] bg-white flex items-center gap-2 shrink-0">
                <div className="relative flex-1 max-w-xs">
                    <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input value={searchText} onChange={e=>setSearchText(e.target.value)} placeholder="Search products (description, EDI code, class)..."
                        className="w-full pl-7 pr-2 py-1 text-[10px] bg-white border border-[#DBD9D9] rounded outline-none focus:ring-1 focus:ring-[#FB7506]"/>
                </div>
                {(loadingP||fetchingMoreProds) && <RefreshCcw size={11} className="text-gray-400 animate-spin"/>}
                <span className="text-[9px] text-gray-400 shrink-0">{products.length.toLocaleString()} / {totalRecords.toLocaleString()} products</span>
                {formError && (
                    <span className="flex items-center gap-1 text-amber-600 text-[9px] font-bold ml-1 min-w-0">
                        <span className="truncate max-w-[300px]">{formError}</span>
                        <button onClick={()=>setFormError(null)} className="ml-1 text-gray-400 hover:text-gray-600 shrink-0"><X size={10}/></button>
                    </span>
                )}
            </div>

            {/* Products Grid */}
            <div className="flex-1 overflow-auto">
                <table className="min-w-full text-left">
                    <thead className="bg-[#4F4F4F] text-white text-[11px] font-bold uppercase sticky top-0 z-10">
                        <tr>
                            <th className="px-2 py-2 whitespace-nowrap border-r border-[#DBD9D9]/30 text-center w-10">Img</th>
                            <th className="px-3 py-2 whitespace-nowrap border-r border-[#DBD9D9]/30 sticky left-0 bg-[#4F4F4F] min-w-[220px]">Description</th>
                            <th className="px-3 py-2 whitespace-nowrap border-r border-[#DBD9D9]/30 text-center w-16">PriceStem</th>
                            <th className="px-3 py-2 whitespace-nowrap border-r border-[#DBD9D9]/30 text-right w-16">Packs</th>
                            <th className="px-3 py-2 whitespace-nowrap border-r border-[#DBD9D9]/30 text-right w-18">Units/Pack</th>
                            <th className="px-3 py-2 whitespace-nowrap border-r border-[#DBD9D9]/30 text-right w-18">UnitsSale</th>
                            <th className="px-3 py-2 whitespace-nowrap border-r border-[#DBD9D9]/30 w-18">Case</th>
                            <th className="px-3 py-2 whitespace-nowrap border-r border-[#DBD9D9]/30 w-24">BoxCode</th>
                            <th className="px-3 py-2 whitespace-nowrap border-r border-[#DBD9D9]/30 w-24">EDICode</th>
                            <th className="px-3 py-2 whitespace-nowrap border-r border-[#DBD9D9]/30 w-32">UPC</th>
                            <th className="px-3 py-2 whitespace-nowrap border-r border-[#DBD9D9]/30 text-right w-18">Retail</th>
                            <th className="px-3 py-2 whitespace-nowrap border-r border-[#DBD9D9]/30 text-right w-18">Weight</th>
                            <th className="px-3 py-2 whitespace-nowrap border-r border-[#DBD9D9]/30 text-right w-18">Rotation</th>
                            <th className="px-3 py-2 whitespace-nowrap border-r border-[#DBD9D9]/30 text-center w-14">Web</th>
                            <th className="px-3 py-2 whitespace-nowrap border-r border-[#DBD9D9]/30 text-center w-14">Active</th>
                            <th className="px-3 py-2 whitespace-nowrap border-r border-[#DBD9D9]/30 text-center w-14">Inven.</th>
                            <th className="px-3 py-2 whitespace-nowrap w-32">Customer</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DBD9D9] fos-grid-tbody">
                        {products.map((p:any) => {
                            const isSel = selProduct?.unico === p.unico;
                            return (
                                <tr key={p.unico} onClick={()=>setSelProduct(p)} onDoubleClick={()=>openModal("edit")}
                                    className={cn("cursor-pointer transition-colors", isSel ? "!bg-[#FB7506]/10" : "hover:bg-gray-50/80")}>
                                    <td className="px-2 py-1 border-r border-[#DBD9D9] text-center w-10" onClick={e => e.stopPropagation()}>
                                        <img
                                            src={productImages[t(p.unico)] || DEFAULT_THUMB}
                                            alt="" width={28} height={28}
                                            className="w-7 h-7 object-cover rounded border border-[#DBD9D9] cursor-pointer hover:opacity-80 hover:ring-2 hover:ring-[#FB7506] transition-all inline-block"
                                            onError={e => { (e.target as HTMLImageElement).src = DEFAULT_THUMB; }}
                                            onClick={() => setImageModal(p)}
                                        />
                                    </td>
                                    <td className={cn("px-3 py-2 border-r border-[#DBD9D9] font-medium truncate max-w-[220px] sticky left-0", isSel ? "bg-[#FB7506]/10" : "bg-white")} title={t(p.description_uq||p.description)}>{t(p.description)}</td>
                                    <td className="px-3 py-2 border-r border-[#DBD9D9] text-center">{p.stem_pack ? <Check size={11} className="text-green-500 mx-auto"/> : "—"}</td>
                                    <td className="px-3 py-2 border-r border-[#DBD9D9] text-right">{t(p.up_x_case)}</td>
                                    <td className="px-3 py-2 border-r border-[#DBD9D9] text-right">{t(p.up_x_pack)}</td>
                                    <td className="px-3 py-2 border-r border-[#DBD9D9] text-right">{t(p.total_units)}</td>
                                    <td className="px-3 py-2 border-r border-[#DBD9D9] text-gray-500">{t(p.case_sh)}</td>
                                    <td className="px-3 py-2 border-r border-[#DBD9D9] text-gray-400">{t(p.boxcode)}</td>
                                    <td className="px-3 py-2 border-r border-[#DBD9D9] text-gray-400">{t(p.old_code)}</td>
                                    <td className="px-3 py-2 border-r border-[#DBD9D9] text-gray-400">{t(p.upc)}</td>
                                    <td className="px-3 py-2 border-r border-[#DBD9D9] text-right">{n2(p.retail_price)}</td>
                                    <td className="px-3 py-2 border-r border-[#DBD9D9] text-right">{n2(p.weight)}</td>
                                    <td className="px-3 py-2 border-r border-[#DBD9D9] text-right">{t(p.rotation)}</td>
                                    <td className="px-3 py-2 border-r border-[#DBD9D9] text-center">{p.web    ? <Check size={11} className="text-green-500 mx-auto"/> : "—"}</td>
                                    <td className="px-3 py-2 border-r border-[#DBD9D9] text-center">{p.active ? <Check size={11} className="text-green-500 mx-auto"/> : "—"}</td>
                                    <td className="px-3 py-2 border-r border-[#DBD9D9] text-center">{p.inv_track ? <Check size={11} className="text-blue-400 mx-auto"/> : "—"}</td>
                                    <td className="px-3 py-2 text-gray-400 truncate max-w-[128px]">{t(p.customer)}</td>
                                </tr>
                            );
                        })}
                        <tr ref={prodSentinel}>
                            <td colSpan={17} className="h-1 py-0">
                                {fetchingMoreProds && <div className="text-center py-1.5 text-[9px] text-gray-400"><RefreshCcw size={9} className="inline animate-spin mr-1"/>Loading more...</div>}
                            </td>
                        </tr>
                        {!loadingP && products.length === 0 && (
                            <tr><td colSpan={17} className="p-4 text-center text-gray-300 italic">No products found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Modals ──────────────────────────────────────────────────────── */}

            {productModal && productModal.mode !== "delete" && (
                <ProductsModalTab2 mode={productModal.mode} form={productForm} setForm={setProductForm}
                    lookups={lookups} onSave={saveProduct} onClose={()=>{setProductModal(null);setFormError(null);}} saving={saving} error={formError}/>
            )}
            {productModal?.mode === "delete" && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 sm:p-4">
                    <div className="bg-white rounded-t-xl sm:rounded-xl shadow-2xl w-full sm:w-80 max-h-[85vh]">
                        <div className="h-10 bg-[#374151] rounded-t-xl flex items-center justify-between px-4">
                            <span className="font-black text-[10px] uppercase tracking-widest text-white text-red-400">Delete Product</span>
                            <button onClick={()=>setProductModal(null)}><XCircle size={15} className="text-gray-400 hover:text-white"/></button>
                        </div>
                        <div className="p-4 flex flex-col items-center gap-3">
                            <Trash2 size={28} className="text-red-400"/>
                            <p className="text-sm text-gray-600 text-center">Delete <strong>{t(selProduct?.description)}</strong>? This cannot be undone.</p>
                            {formError && <p className="text-red-500 text-[9px]">{formError}</p>}
                        </div>
                        <div className="flex justify-end gap-2 px-4 py-3 bg-gray-50 border-t rounded-b-xl">
                            <Btn icon={X}     label="Cancel" color="gray" onClick={()=>setProductModal(null)}/>
                            <Btn icon={Trash2} label="Delete" color="red"  onClick={deleteProduct} disabled={saving}/>
                        </div>
                    </div>
                </div>
            )}

            {showAlt && selProduct && (
                <DualListModal title="Alternative Products" productDesc={t(selProduct.description)} productUq={selProduct.unico}
                    availUrl={(s,p)=>`/api/masters/items/products/alternatives/available?product_uq=${selProduct.unico}&search=${encodeURIComponent(s)}&page=${p}&pageSize=${PAGE_SIZE}`}
                    assignedUrl={`/api/masters/items/products/${selProduct.unico}/alternatives`}
                    onAdd={async (item)=>{ const r=await fetch("/api/masters/items/products/alternative",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({product_uq:selProduct.unico,alt_product_uq:item.unico})}); const d=await r.json(); if(!d.success) throw new Error(d.error); logAction("Edit",selProduct.unico,"Add Alternative"); }}
                    onRemove={async (item)=>{ const r=await fetch(`/api/masters/items/products/alternative/${item.unico}`,{method:"DELETE"}); const d=await r.json(); if(!d.success) throw new Error(d.error); logAction("Edit",selProduct.unico,"Remove Alternative"); }}
                    onClose={()=>setShowAlt(false)}/>
            )}

            {showRecipe && selProduct && (
                <DualListModal title="Season Recipes" productDesc={t(selProduct.description)} productUq={selProduct.unico}
                    availUrl={(s,p)=>`/api/masters/items/products/recipes/available?product_uq=${selProduct.unico}&search=${encodeURIComponent(s)}&page=${p}&pageSize=${PAGE_SIZE}`}
                    assignedUrl={`/api/masters/items/products/${selProduct.unico}/recipes`}
                    onAdd={async (item)=>{ const r=await fetch("/api/masters/items/products/recipe",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({product_uq:selProduct.unico,recipe_uq:item.unico})}); const d=await r.json(); if(!d.success) throw new Error(d.error); logAction("Edit",selProduct.unico,"Add Recipe"); }}
                    onRemove={async (item)=>{ const r=await fetch(`/api/masters/items/products/recipe/${item.unico}`,{method:"DELETE"}); const d=await r.json(); if(!d.success) throw new Error(d.error); logAction("Edit",selProduct.unico,"Remove Recipe"); }}
                    onClose={()=>setShowRecipe(false)}/>
            )}

            {showQuota && selProduct && (
                <BuyersQuotasModal productUq={selProduct.unico} productDesc={t(selProduct.description)} onClose={()=>setShowQuota(false)}/>
            )}

            {showPO && <POPricesModal onClose={()=>setShowPO(false)}/>}

            {showStock && <UpdateStockModal onClose={()=>setShowStock(false)} logAction={logAction}/>}

            {showPrebook && selProduct && (
                <PreBookDateModal
                    title={showPrebook==="recipe" ? "Fill Recipe in Prebooks" : showPrebook==="upc" ? "Fill UPC Info in Prebooks" : "Fill Sales Info in Prebooks"}
                    productDesc={t(selProduct.description)}
                    showDeletePrior={showPrebook==="recipe"}
                    showChangeCase={showPrebook==="recipe"}
                    onConfirm={(data)=>handlePrebook(showPrebook, data)}
                    onClose={()=>setShowPrebook(null)}/>
            )}

            {imageModal && (
                <ImageModal
                    product={imageModal}
                    onClose={() => setImageModal(null)}
                    onFirstImageChanged={(uq, url) => setProductImages(prev => ({ ...prev, [uq]: url }))}
                />
            )}
        </div>
    );
}
