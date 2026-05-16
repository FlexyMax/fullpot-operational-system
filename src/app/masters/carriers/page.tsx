"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    ArrowLeft, Save, X, RefreshCcw, Truck, Plus, Pencil, Trash2,
    ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight,
    Mail, Check, AlertCircle, XCircle, Settings, Menu, Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuditLog } from "@/lib/audit";
import { AuditLogModal } from "@/components/AuditLogModal";
import { formatMoney, parseMoney, normalizeToISODate, formatDateEST } from "@/lib/dates";

const t   = (v: any) => String(v ?? "").trim();
const sF  = async (url: string) => { const r = await fetch(url); const j = await r.json(); if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`); return j; };

const EMPTY: any = {
    unico:"", active:true, carrier:"", carriercode:"", contact:"", address:"",
    city:"", state:"", zip:"", country:"", phone_1:"", phone_2:"",
    fax_1:"", fax_2:"", email:"", ship_account:"", cut_off:"",
    product_uq:"", freight_charge:0, twf_id:"", send_twf:false,
    username:"", password:"", isairline:false, chk_account:false,
    chk_zone:false, lenght_acc:"", barcode:"", cfs_code:"", internal_delivery:false,
};

type Mode = "view" | "add" | "edit";

// ─── Appsmith-style MENU ──────────────────────────────────────────────────────
function GridMenu({ items }: { items: { label:string; icon:any; color:string; onClick:()=>void; disabled?:boolean }[] }) {
    const [open, setOpen] = useState(false);
    const C: Record<string,{icon:string;text:string}> = {
        green:  {icon:"text-green-600",  text:"text-green-700"},
        blue:   {icon:"text-blue-500",   text:"text-gray-800"},
        red:    {icon:"text-red-500",    text:"text-gray-800"},
        gray:   {icon:"text-gray-400",   text:"text-gray-400"},
        amber:  {icon:"text-amber-500",  text:"text-gray-800"},
    };
    return (
        <div className="relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setOpen(o => !o)}
                className="h-10 bg-[#FB7506] hover:bg-orange-600 text-white w-24 flex items-center justify-center transition-colors rounded-tr-lg" title="Menu">
                <Menu size={20} />
            </button>
            {open && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-2xl z-50 overflow-hidden"
                    onMouseLeave={() => setOpen(false)}>
                    {items.map((item, i) => {
                        const c = C[item.color] || C.gray;
                        return (
                            <button key={i} onClick={() => { item.onClick(); setOpen(false); }}
                                disabled={!!item.disabled}
                                className={cn("w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors", i < items.length-1 && "border-b border-gray-100")}>
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

// ─── Field helper ──────────────────────────────────────────────────────────────
function F({ label, value, onChange, readOnly, type="text", span2=false, children }: any) {
    return (
        <div className={cn("flex flex-col gap-0.5", span2 && "col-span-2")}>
            <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">{label}</label>
            <div className="flex items-center gap-1">
                <input type={type} value={value||""} readOnly={!!readOnly}
                    onChange={e => onChange?.(e.target.value)}
                    className={cn("fos-input h-10 text-sm flex-1", readOnly && "bg-gray-50 text-gray-600 cursor-default")} />
                {children}
            </div>
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function CarriersDefinitionPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const qc     = useQueryClient();
    const { logAction } = useAuditLog("carriers-definition", "flower_carriers");

    const [mode,        setMode]        = useState<Mode>("view");
    const [currentIdx,  setCurrentIdx]  = useState(0);
    const [form,        setForm]        = useState<any>(EMPTY);
    const [formError,   setFormError]   = useState<string | null>(null);
    const [saveMsg,     setSaveMsg]     = useState<string | null>(null);
    const [saving,      setSaving]      = useState(false);
    const [activeTab,   setActiveTab]   = useState<"invoices"|"customers">("invoices");
    const [othersModal, setOthersModal] = useState(false);
    const [otherForm,   setOtherForm]   = useState({ internal_delivery: false });
    const [tabEnabled,  setTabEnabled]  = useState(false);
    const [carrSearch,  setCarrSearch]  = useState("");
    const [mobileOpen,  setMobileOpen]  = useState(false);

    useEffect(() => { if (status === "unauthenticated") router.push("/login"); }, [status, router]);

    // ── Queries ────────────────────────────────────────────────────────────────
    const { data: carriers = [], isFetching: loadingList } = useQuery({
        queryKey: ["carr-list"],
        queryFn:  () => sF("/api/masters/carriers"),
    });

    const { data: products = [] } = useQuery({
        queryKey: ["carr-products"],
        queryFn:  () => sF("/api/masters/carriers/lookups"),
        staleTime: 1000*60*10,
    });

    const selUnico = (carriers as any[])[currentIdx]?.unico;

    const { data: invoices = [], isFetching: loadingInv } = useQuery({
        queryKey: ["carr-inv", selUnico],
        queryFn:  () => sF(`/api/masters/carriers/${selUnico}/invoices`),
        enabled:  !!selUnico && tabEnabled && activeTab === "invoices",
        retry: false,
    });

    const { data: customers = [], isFetching: loadingCust } = useQuery({
        queryKey: ["carr-cust", selUnico],
        queryFn:  () => sF(`/api/masters/carriers/${selUnico}/customers`),
        enabled:  !!selUnico && tabEnabled && activeTab === "customers",
        retry: false,
    });

    // Auto-select first on load
    useEffect(() => {
        if ((carriers as any[]).length > 0) loadCarrier(0);
    }, [carriers]);

    const list = carriers as any[];
    const filteredList = useMemo(() => {
        if (!carrSearch.trim()) return list;
        const q = carrSearch.toLowerCase();
        return list.filter((c: any) => t(c.carrier).toLowerCase().includes(q));
    }, [list, carrSearch]);

    const loadCarrier = async (idx: number) => {
        if (!list[idx]) return;
        setCurrentIdx(idx);
        try {
            const d = await sF(`/api/masters/carriers/${list[idx].unico}`);
            if (d) setForm({
                unico:             t(d.unico),
                active:            Boolean(d.active),
                carrier:           t(d.carrier),
                carriercode:       t(d.carriercode),
                contact:           t(d.contact),
                address:           t(d.address),
                city:              t(d.city),
                state:             t(d.state),
                zip:               t(d.zip),
                country:           t(d.country),
                phone_1:           t(d.phone_1),
                phone_2:           t(d.phone_2),
                fax_1:             t(d.fax_1),
                fax_2:             t(d.fax_2),
                email:             t(d.email),
                ship_account:      t(d.ship_account),
                cut_off:           d.cut_off ? String(d.cut_off).substring(0,5) : "",
                product_uq:        t(d.product_uq),
                freight_charge:    d.freight_charge || 0,
                twf_id:            t(d.twf_id),
                send_twf:          Boolean(d.send_twf),
                username:          t(d.username),
                password:          t(d.password),
                isairline:         Boolean(d.isairline),
                chk_account:       Boolean(d.chk_account),
                chk_zone:          Boolean(d.chk_zone),
                lenght_acc:        t(d.lenght_acc),
                barcode:           t(d.barcode),
                cfs_code:          t(d.cfs_code),
                internal_delivery: Boolean(d.internal_delivery),
            });
            setFormError(null); setTabEnabled(false);
        } catch {}
    };

    // Navigation
    const goFirst = () => loadCarrier(0);
    const goPrev  = () => loadCarrier(Math.max(0, currentIdx - 1));
    const goNext  = () => loadCarrier(Math.min(list.length - 1, currentIdx + 1));
    const goLast  = () => loadCarrier(list.length - 1);

    const validate = () => {
        if (!form.carriercode.trim()) return "Carrier code is empty.!";
        if (!form.carrier.trim())     return "Carrier is empty.!";
        if (!form.contact.trim())     return "Contact name is empty.!";
        if (!form.phone_1.trim())     return "Main phone is empty.!";
        if (!form.fax_1.trim())       return "Main fax is empty.!";
        return null;
    };

    const handleSave = async () => {
        const err = validate(); if (err) { setFormError(err); return; }
        setSaving(true); setFormError(null);
        try {
            if (mode === "add") {
                const res  = await fetch("/api/masters/carriers", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
                const data = await res.json(); if (!data.success) throw new Error(data.error);
                logAction("Insert", data.unico);
            } else {
                const res  = await fetch(`/api/masters/carriers/${form.unico}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
                const data = await res.json(); if (!data.success) throw new Error(data.error);
                logAction("Edit", form.unico);
            }
            await qc.invalidateQueries({ queryKey: ["carr-list"] });
            setSaveMsg(mode === "add" ? "Carrier created." : "Carrier updated.");
            setTimeout(() => setSaveMsg(null), 3000);
            setMode("view");
        } catch (e: any) { setFormError(e.message); }
        finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (!selUnico || !confirm(`Delete carrier "${t(form.carrier)}"?`)) return;
        setSaving(true);
        try {
            const res  = await fetch(`/api/masters/carriers/${selUnico}`, { method:"DELETE" });
            const data = await res.json(); if (!data.success) throw new Error(data.error);
            logAction("Delete", selUnico);
            await qc.invalidateQueries({ queryKey: ["carr-list"] });
            setCurrentIdx(0);
        } catch (e: any) { setFormError(e.message); }
        finally { setSaving(false); }
    };

    const handleOthersSave = async () => {
        setSaving(true);
        try {
            const res  = await fetch(`/api/masters/carriers/${selUnico}/others`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(otherForm) });
            const data = await res.json(); if (!data.success) throw new Error(data.error);
            logAction("Edit", selUnico!, "Others");
            setOthersModal(false);
            await loadCarrier(currentIdx);
        } catch (e: any) { setFormError(e.message); }
        finally { setSaving(false); }
    };

    const isEditing = mode !== "view";

    if (status === "loading") return null;

    return (
        <div className="flex flex-col h-screen bg-[#f4f6f8] overflow-hidden font-sans text-[#333]">

            {/* Header */}
            <div className="h-10 bg-[#374151] flex items-center justify-between px-4 shrink-0 text-white">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.push("/menu")} className="hover:bg-white/10 p-1 rounded transition-colors"><ArrowLeft size={16} /></button>
                    <Truck size={14} className="text-[#FB7506]" />
                    <span className="font-black text-xs uppercase tracking-widest">Carriers Definition</span>
                </div>
                <span className="text-gray-400 text-[10px] font-bold">User: <span className="text-white">{session?.user?.name}</span></span>
            </div>

            {/* Main layout */}
            <div className="flex flex-col lg:flex-row flex-1 gap-2 p-2 overflow-y-auto lg:overflow-hidden">

                {/* ── Left: Carrier List ──────────────────────────────────── */}
                <div className="hidden lg:flex w-[240px] shrink-0 flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 border-b border-black/10 shrink-0 rounded-t-lg">
                        <div className="flex items-center gap-2">
                            <Truck size={16} className="text-[#FB7506]" />
                            <span className="fos-grid-header-text">Carriers</span>
                        </div>
                        {loadingList && <RefreshCcw size={16} className="text-gray-400 animate-spin" />}
                    </div>
                    <div className="p-2 border-b border-gray-100 shrink-0">
                        <div className="relative">
                            <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="text" value={carrSearch} onChange={e => setCarrSearch(e.target.value)}
                                placeholder="Search carriers..." className="w-full pl-7 pr-2 h-9 text-sm border border-gray-200 rounded outline-none focus:ring-1 focus:ring-[#FB7506]" />
                        </div>
                    </div>
                    <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
                        {filteredList.map((c: any, i: number) => (
                            <div key={c.unico} onClick={() => { if (!isEditing) { loadCarrier(list.indexOf(c)); } }}
                                className={cn("flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors text-xs",
                                    list.indexOf(c) === currentIdx ? "bg-blue-50 border-l-[3px] border-l-blue-500 font-semibold text-blue-800" : "hover:bg-gray-50 border-l-[3px] border-l-transparent text-gray-700",
                                    isEditing && "cursor-not-allowed opacity-60")}>
                                <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", c.active ? "bg-green-400" : "bg-gray-300")} />
                                <span className="truncate">{t(c.carrier)}</span>
                                {c.isairline && <span className="text-[8px] text-blue-400 font-bold shrink-0">✈</span>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Right: Form + Tabs ────────────────────────────────────── */}
                <div className="flex-1 flex flex-col min-w-0 gap-2 lg:overflow-hidden">

                    {/* Form card */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col overflow-hidden shrink-0">
                        {/* Form header */}
                        <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 border-b border-black/10 rounded-t-lg">
                            <div className="flex items-center gap-2 min-w-0">
                                <Truck size={16} className="text-[#FB7506]" />
                                <span className="fos-grid-header-text truncate">
                                    {mode === "add" ? "New Carrier" : t(form.carrier) || "Carrier Details"}
                                </span>
                                <AuditLogModal recordId={selUnico} disabled={!selUnico} />
                                {formError && <span className="flex items-center gap-1 text-amber-400 text-[10px] font-bold ml-1 truncate"><AlertCircle size={12} />{formError}</span>}
                                {saveMsg   && <span className="flex items-center gap-1 text-green-400 text-[10px] font-bold ml-1"><Check size={12} />{saveMsg}</span>}
                            </div>
                            <div className="flex items-center">
                                {/* Navigation (view only) */}
                                {!isEditing && (
                                    <div className="flex items-center border-r border-white/20">
                                        {[
                                            { icon: ChevronsLeft,  fn: goFirst, disabled: currentIdx === 0 },
                                            { icon: ChevronLeft,   fn: goPrev,  disabled: currentIdx === 0 },
                                            { icon: ChevronRight,  fn: goNext,  disabled: currentIdx >= list.length - 1 },
                                            { icon: ChevronsRight, fn: goLast,  disabled: currentIdx >= list.length - 1 },
                                        ].map(({ icon: Icon, fn, disabled }, idx) => (
                                            <button key={idx} onClick={fn} disabled={disabled}
                                                className="w-8 h-10 flex items-center justify-center text-white hover:bg-white/10 disabled:opacity-30 transition-colors">
                                                <Icon size={13} />
                                            </button>
                                        ))}
                                        <span className="text-[9px] text-gray-400 font-bold px-2">{list.length > 0 ? `${currentIdx+1}/${list.length}` : "0"}</span>
                                    </div>
                                )}
                                {/* Save/Cancel (edit mode) */}
                                {isEditing && (
                                    <div className="flex items-center gap-1.5 px-2 border-r border-white/20">
                                        <button onClick={handleSave} disabled={saving}
                                            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-1.5 rounded text-xs font-black uppercase tracking-wider transition-all">
                                            {saving ? <RefreshCcw size={14} className="animate-spin" /> : <Save size={14} />}{saving ? "Saving..." : "Save"}
                                        </button>
                                        <button onClick={() => { if (list[currentIdx]) loadCarrier(currentIdx); else setForm(EMPTY); setMode("view"); setFormError(null); }}
                                            className="flex items-center gap-1.5 bg-gray-500 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-xs font-black uppercase tracking-wider transition-all">
                                            <X size={14} /> Cancel
                                        </button>
                                    </div>
                                )}
                                <GridMenu items={[
                                    { label:"Add Carrier",      icon:Plus,     color:"green", onClick:() => { setForm({...EMPTY}); setFormError(null); setMode("add"); } },
                                    { label:"Edit Carrier",     icon:Pencil,   color:"blue",  onClick:() => { if (list[currentIdx]) setMode("edit"); }, disabled:!selUnico||isEditing },
                                    { label:"Delete Carrier",   icon:Trash2,   color:"red",   onClick:handleDelete, disabled:!selUnico||isEditing },
                                    { label:"Other Settings",   icon:Settings, color:"amber", onClick:() => { if(!selUnico){setFormError("Carrier is empty.");return;} setOtherForm({internal_delivery:Boolean(form.internal_delivery)}); setOthersModal(true); }, disabled:isEditing||!selUnico },
                                ]} />
                            </div>
                        </div>

                        {/* Form fields */}
                        <div className="p-3">
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
                                <F label="Unique"    value={form.unico}       readOnly />
                                <F label="Code *"    value={form.carriercode} readOnly={!isEditing} onChange={(v:string)=>setForm((p:any)=>({...p,carriercode:v}))} />
                                <F label="Carrier *" value={form.carrier}     readOnly={!isEditing} onChange={(v:string)=>setForm((p:any)=>({...p,carrier:v}))} span2 />
                                <F label="Contact *" value={form.contact}     readOnly={!isEditing} onChange={(v:string)=>setForm((p:any)=>({...p,contact:v}))} span2 />
                                <F label="Address"   value={form.address}     readOnly={!isEditing} onChange={(v:string)=>setForm((p:any)=>({...p,address:v}))} span2 />
                                <F label="City"      value={form.city}        readOnly={!isEditing} onChange={(v:string)=>setForm((p:any)=>({...p,city:v}))} />
                                <F label="Country"   value={form.country}     readOnly={!isEditing} onChange={(v:string)=>setForm((p:any)=>({...p,country:v}))} />
                                <F label="State"     value={form.state}       readOnly={!isEditing} onChange={(v:string)=>setForm((p:any)=>({...p,state:v.substring(0,4)}))} />
                                <F label="Zip"       value={form.zip}         readOnly={!isEditing} onChange={(v:string)=>setForm((p:any)=>({...p,zip:v}))} />
                                <F label="Phone *"   value={form.phone_1}     readOnly={!isEditing} onChange={(v:string)=>setForm((p:any)=>({...p,phone_1:v}))} />
                                <F label="Phone 2"   value={form.phone_2}     readOnly={!isEditing} onChange={(v:string)=>setForm((p:any)=>({...p,phone_2:v}))} />
                                <F label="Fax *"     value={form.fax_1}       readOnly={!isEditing} onChange={(v:string)=>setForm((p:any)=>({...p,fax_1:v}))} />
                                <F label="Fax 2"     value={form.fax_2}       readOnly={!isEditing} onChange={(v:string)=>setForm((p:any)=>({...p,fax_2:v}))} />

                                {/* Email with mailto icon */}
                                <div className="flex flex-col gap-0.5 col-span-2">
                                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">E-mail</label>
                                    <div className="flex items-center gap-1">
                                        <input type="email" value={form.email||""} readOnly={!isEditing}
                                            onChange={e=>setForm((p:any)=>({...p,email:e.target.value}))}
                                            className={cn("fos-input h-10 text-sm flex-1", !isEditing&&"bg-gray-50 text-gray-600")} />
                                        {!isEditing && form.email && (
                                            <button onClick={()=>window.open('mailto:'+form.email)} title="Send email"
                                                className="text-[#FB7506] hover:text-orange-600 transition-colors">
                                                <Mail size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <F label="Ship Account" value={form.ship_account} readOnly={!isEditing} onChange={(v:string)=>setForm((p:any)=>({...p,ship_account:v}))} />

                                {/* Cut Off (time) */}
                                <div className="flex flex-col gap-0.5">
                                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Cut Off</label>
                                    <input type="time" value={form.cut_off||""} disabled={!isEditing}
                                        onChange={e=>setForm((p:any)=>({...p,cut_off:e.target.value}))}
                                        className={cn("fos-input h-10 text-sm", !isEditing&&"bg-gray-50 text-gray-600")} />
                                </div>

                                {/* Charge combo */}
                                <div className="flex flex-col gap-0.5 col-span-2">
                                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Charge</label>
                                    <div className="flex items-center gap-1">
                                        <select value={form.product_uq||""} disabled={!isEditing}
                                            onChange={e=>setForm((p:any)=>({...p,product_uq:e.target.value}))}
                                            className={cn("fos-input h-10 text-sm flex-1", !isEditing&&"bg-gray-50 text-gray-400")}>
                                            <option value="">— None —</option>
                                            {(products as any[]).map((p:any) => (
                                                <option key={p.unico} value={p.unico}>{t(p.description)}</option>
                                            ))}
                                        </select>
                                        {isEditing && (
                                            <button onClick={()=>setForm((p:any)=>({...p,product_uq:""}))} title="Clear"
                                                className="text-gray-400 hover:text-red-500 transition-colors">
                                                <XCircle size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <F label="F.Charge"    value={String(form.freight_charge)} type="number" readOnly={!isEditing} onChange={(v:string)=>setForm((p:any)=>({...p,freight_charge:parseFloat(v)||0}))} />

                                {/* TWF Code + disabled button */}
                                <div className="flex flex-col gap-0.5">
                                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">T.W.F. Code</label>
                                    <div className="flex gap-1">
                                        <input value={form.twf_id||""} readOnly={!isEditing}
                                            onChange={e=>setForm((p:any)=>({...p,twf_id:e.target.value}))}
                                            className={cn("fos-input h-10 text-sm flex-1", !isEditing&&"bg-gray-50 text-gray-600")} />
                                        <button disabled title="TWF integration not available in web version"
                                            className="px-2 h-10 bg-gray-100 border border-gray-200 rounded text-xs text-gray-400 cursor-not-allowed">TWF</button>
                                    </div>
                                </div>

                                <F label="Web User" value={form.username} readOnly={!isEditing} onChange={(v:string)=>setForm((p:any)=>({...p,username:v}))} />
                                <F label="Password" value={form.password} type="password" readOnly={!isEditing} onChange={(v:string)=>setForm((p:any)=>({...p,password:v}))} />

                                {/* Checkboxes row */}
                                <div className="col-span-2 sm:col-span-3 lg:col-span-6 flex flex-wrap items-center gap-4 pt-1 border-t border-gray-100">
                                    {mode !== "add" && (
                                        <label className="flex items-center gap-1.5 cursor-pointer">
                                            <input type="checkbox" checked={Boolean(form.active)} disabled={mode !== "edit"}
                                                onChange={e=>setForm((p:any)=>({...p,active:e.target.checked}))}
                                                className="w-4 h-4 accent-[#FB7506]" />
                                            <span className="text-sm font-semibold text-gray-600">Active</span>
                                        </label>
                                    )}
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input type="checkbox" checked={Boolean(form.isairline)} disabled={!isEditing}
                                            onChange={e=>setForm((p:any)=>({...p,isairline:e.target.checked}))}
                                            className="w-4 h-4 accent-[#FB7506]" />
                                        <span className="text-sm font-semibold text-gray-600">Airline ✈</span>
                                    </label>
                                    <label className="flex items-center gap-1.5">
                                        <input type="checkbox" checked={Boolean(form.chk_account)} disabled={!isEditing}
                                            onChange={e=>setForm((p:any)=>({...p,chk_account:e.target.checked}))}
                                            className="w-4 h-4 accent-[#FB7506]" />
                                        <span className="text-sm font-semibold text-gray-600">Chk Account</span>
                                    </label>
                                    <label className="flex items-center gap-1.5">
                                        <input type="checkbox" checked={Boolean(form.chk_zone)} disabled={!isEditing}
                                            onChange={e=>setForm((p:any)=>({...p,chk_zone:e.target.checked}))}
                                            className="w-4 h-4 accent-[#FB7506]" />
                                        <span className="text-sm font-semibold text-gray-600">Chk Zone</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Bottom Tabs ──────────────────────────────────────── */}
                    <div className="flex-1 flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden min-h-0">
                        <div className="h-10 bg-[#374151] flex items-end px-2 gap-0.5 shrink-0">
                            {(["invoices","customers"] as const).map(tab => (
                                <button key={tab} onClick={() => { setActiveTab(tab); setTabEnabled(true); }}
                                    className={cn("flex items-center gap-1.5 px-4 h-8 text-[10px] font-black uppercase tracking-wider rounded-t transition-all",
                                        activeTab===tab ? "bg-[#f4f6f8] text-[#FB7506]" : "text-gray-400 hover:text-white hover:bg-white/10")}>
                                    {tab === "invoices" ? "Invoices" : "Customers"}
                                </button>
                            ))}
                            {(loadingInv || loadingCust) && <RefreshCcw size={12} className="text-gray-400 animate-spin ml-2 self-center" />}
                        </div>

                        <div className="overflow-auto flex-1">
                            {!tabEnabled ? (
                                <div className="h-full flex items-center justify-center text-gray-300 text-xs font-bold uppercase">Click a tab to load data</div>
                            ) : activeTab === "invoices" ? (
                                <table className="min-w-full text-left">
                                    <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
                                        <tr>{["Customer","Invoice","Date","Amount","Credits","Debits"].map(h => <th key={h} className="p-2 whitespace-nowrap border-r border-gray-100 last:border-r-0 fos-grid-thead text-gray-500">{h}</th>)}</tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {(invoices as any[]).length === 0 ? (
                                            <tr><td colSpan={6} className="p-6 text-center text-gray-300 italic fos-grid-tbody">No invoices</td></tr>
                                        ) : (invoices as any[]).map((r:any,i:number) => (
                                            <tr key={i} className="hover:bg-gray-50/80">
                                                <td className="p-2 border-r border-gray-50 truncate max-w-[160px] fos-grid-tbody">{t(r.customer)}</td>
                                                <td className="p-2 border-r border-gray-50 font-mono fos-grid-tbody">{t(r.invoice_no)}</td>
                                                <td className="p-2 border-r border-gray-50 whitespace-nowrap fos-grid-tbody">{formatDateEST(normalizeToISODate(r.invoice_date))}</td>
                                                <td className="p-2 border-r border-gray-50 text-right fos-grid-tbody">{formatMoney(r.total_invoice)}</td>
                                                <td className="p-2 border-r border-gray-50 text-right text-green-600 fos-grid-tbody">{formatMoney(r.total_credits)}</td>
                                                <td className="p-2 text-right text-red-500 fos-grid-tbody">{formatMoney(r.total_debits)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <table className="min-w-full text-left">
                                    <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
                                        <tr>{["Customer","Shipto","Address","City","State","Zip","Account"].map(h => <th key={h} className="p-2 whitespace-nowrap border-r border-gray-100 last:border-r-0 fos-grid-thead text-gray-500">{h}</th>)}</tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {(customers as any[]).length === 0 ? (
                                            <tr><td colSpan={7} className="p-6 text-center text-gray-300 italic fos-grid-tbody">No customers</td></tr>
                                        ) : (customers as any[]).map((r:any,i:number) => (
                                            <tr key={i} className="hover:bg-gray-50/80">
                                                <td className="p-2 border-r border-gray-50 truncate max-w-[140px] fos-grid-tbody">{t(r.customer)}</td>
                                                <td className="p-2 border-r border-gray-50 truncate max-w-[120px] fos-grid-tbody">{t(r.name)}</td>
                                                <td className="p-2 border-r border-gray-50 truncate max-w-[140px] fos-grid-tbody">{t(r.address1)}</td>
                                                <td className="p-2 border-r border-gray-50 fos-grid-tbody">{t(r.city)}</td>
                                                <td className="p-2 border-r border-gray-50 fos-grid-tbody">{t(r.state)}</td>
                                                <td className="p-2 border-r border-gray-50 fos-grid-tbody">{t(r.zip)}</td>
                                                <td className="p-2 fos-grid-tbody">{t(r.account)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile floating carrier button */}
            <button onClick={() => setMobileOpen(true)}
                className="lg:hidden fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#FB7506] hover:bg-orange-600 text-white shadow-lg flex items-center justify-center transition-all hover:scale-105">
                <Truck size={24} />
            </button>

            {/* Footer */}
            <div className="h-8 bg-gray-100 border-t px-4 flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-tight shrink-0">
                <div className="flex gap-4"><span>Server: Production</span><span className="text-gray-300">|</span><span>Database: FullPot</span></div>
                <span className="text-[#FB7506]">FOS Masters V.2.0.1</span>
            </div>

            {/* ── Mobile Carrier List Modal ───────────────────────────── */}
            {mobileOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setMobileOpen(false)}>
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden"
                        onClick={e => e.stopPropagation()}>
                        <div className="h-10 bg-[#374151] flex items-center justify-between px-3 rounded-t-lg">
                            <div className="flex items-center gap-2">
                                <Truck size={16} className="text-[#FB7506]" />
                                <span className="fos-grid-header-text">Select Carrier</span>
                            </div>
                            <button onClick={() => setMobileOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="p-3 border-b">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="text" placeholder="Search..." value={carrSearch}
                                    onChange={e => setCarrSearch(e.target.value)}
                                    className="fos-input h-10 text-sm pl-9 pr-3 w-full" />
                            </div>
                        </div>
                        <div className="overflow-y-auto flex-1">
                            {filteredList.length === 0 ? (
                                <div className="p-6 text-center text-gray-400 text-sm">No carriers found</div>
                            ) : filteredList.map((c: any, i: number) => (
                                <button key={c.unico} onClick={() => { setCurrentIdx(i); setMobileOpen(false); }}
                                    className={cn("w-full flex items-center gap-2 px-4 py-3 text-left transition-colors border-b border-gray-50 last:border-b-0",
                                        i === currentIdx ? "bg-orange-50 text-[#FB7506] font-bold" : "text-gray-700 hover:bg-gray-50")}>
                                    <span className="text-[10px] text-gray-400 font-mono w-8 shrink-0">{c.carriercode}</span>
                                    <span className="text-sm truncate flex-1">{t(c.carrier)}</span>
                                    {c.isairline && <span className="text-[10px] text-blue-400 font-bold shrink-0">✈</span>}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Other Settings Modal ──────────────────────────────────── */}
            {othersModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm overflow-hidden">
                        <div className="h-10 bg-[#374151] flex items-center justify-between px-3 rounded-t-lg">
                            <div className="flex items-center gap-2">
                                <Settings size={16} className="text-[#FB7506]" />
                                <span className="fos-grid-header-text">Other Settings</span>
                            </div>
                            <button onClick={() => setOthersModal(false)} className="text-gray-400 hover:text-white transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="p-5">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" checked={otherForm.internal_delivery}
                                    onChange={e => setOtherForm(p => ({...p, internal_delivery:e.target.checked}))}
                                    className="w-5 h-5 accent-[#FB7506]" />
                                <div>
                                    <p className="text-sm font-bold text-gray-800">Internal Delivery</p>
                                    <p className="text-xs text-gray-400">Mark as internal/own delivery service</p>
                                </div>
                            </label>
                        </div>
                        <div className="flex justify-end gap-3 px-4 py-3 bg-gray-50 border-t">
                            <button onClick={() => setOthersModal(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
                            <button onClick={handleOthersSave} disabled={saving}
                                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#FB7506] hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-black uppercase tracking-wider transition-all">
                                {saving ? <RefreshCcw size={14} className="animate-spin" /> : <Save size={14} />}
                                {saving ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
