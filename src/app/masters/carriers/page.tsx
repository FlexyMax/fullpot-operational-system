"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Save, X, RefreshCcw, Truck, Plus, Pencil, Trash2,
    Mail, AlertCircle, XCircle, Settings, FileText, Users,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import PanelGrid from "@/components/ui/PanelGrid";
import { PanelGridTable, PanelGridThead, PanelGridTh, PanelGridTbody, PanelGridTr, PanelGridTd } from "@/components/ui/PanelGridTable";
import { cn } from "@/lib/utils";
import { useAuditLog } from "@/lib/audit";
import { usePagePermissions } from "@/lib/permissions";
import { AuditLogModal } from "@/components/AuditLogModal";
import { formatMoney, normalizeToISODate, formatDateEST } from "@/lib/dates";

const t  = (v: any) => String(v ?? "").trim();
const sF = async (url: string) => {
    const r = await fetch(url);
    const j = await r.json();
    if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`);
    return j;
};

const EMPTY: any = {
    unico:"", active:true, carrier:"", carriercode:"", contact:"", address:"",
    city:"", state:"", zip:"", country:"", phone_1:"", phone_2:"",
    fax_1:"", fax_2:"", email:"", ship_account:"", cut_off:"",
    product_uq:"", freight_charge:0, twf_id:"", send_twf:false,
    username:"", password:"", isairline:false, chk_account:false,
    chk_zone:false, lenght_acc:"", barcode:"", cfs_code:"", internal_delivery:false,
};

type Mode = "add" | "edit";

function F({ label, value, onChange, type = "text", span2 = false, children }: any) {
    return (
        <div className={cn("flex flex-col gap-0.5", span2 && "col-span-2")}>
            <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">{label}</label>
            <div className="flex items-center gap-1">
                <input type={type} value={value ?? ""} onChange={e => onChange?.(e.target.value)}
                    className="fos-input h-10 text-sm flex-1" />
                {children}
            </div>
        </div>
    );
}

export default function CarriersDefinitionPage() {
    const { status } = useSession();
    const router     = useRouter();
    const qc         = useQueryClient();
    const { logAction } = useAuditLog("carriers-definition", "flower_carriers");
    const perms = usePagePermissions("carriers-definition");

    const [currentIdx,  setCurrentIdx]  = useState(0);
    const [form,        setForm]        = useState<any>(EMPTY);
    const [formError,   setFormError]   = useState<string | null>(null);
    const [saving,      setSaving]      = useState(false);
    const [mode,        setMode]        = useState<Mode>("edit");
    const [formModal,   setFormModal]   = useState(false);
    const [invModal,    setInvModal]    = useState(false);
    const [custModal,   setCustModal]   = useState(false);
    const [othersModal, setOthersModal] = useState(false);
    const [otherForm,   setOtherForm]   = useState({ internal_delivery: false });
    const [carrSearch,  setCarrSearch]  = useState("");
    const [invDateIni,  setInvDateIni]  = useState(() => { const d = new Date(); d.setDate(d.getDate() - 30); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; });
    const [invDateEnd,  setInvDateEnd]  = useState(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; });

    useEffect(() => { if (status === "unauthenticated") router.push("/login"); }, [status, router]);

    /* ── Queries ─────────────────────────────────────────────────────────── */
    const { data: carriers = [], isFetching: loadingList, refetch: refetchList } = useQuery({
        queryKey: ["carr-list"],
        queryFn:  () => sF("/api/masters/carriers"),
    });

    const { data: products = [] } = useQuery({
        queryKey: ["carr-products"],
        queryFn:  () => sF("/api/masters/carriers/lookups"),
        staleTime: 1000 * 60 * 10,
    });

    const list         = carriers as any[];
    const filteredList = useMemo(() => {
        if (!carrSearch.trim()) return list;
        const q = carrSearch.toLowerCase();
        return list.filter((c: any) =>
            t(c.carrier).toLowerCase().includes(q) ||
            t(c.carriercode).toLowerCase().includes(q)
        );
    }, [list, carrSearch]);

    const selUnico = list[currentIdx]?.unico ?? null;

    const { data: invoices  = [], isFetching: loadingInv  } = useQuery({
        queryKey: ["carr-inv",  selUnico, invDateIni, invDateEnd],
        queryFn:  () => sF(`/api/masters/carriers/${selUnico}/invoices?date_ini=${invDateIni}&date_end=${invDateEnd}`),
        enabled:  !!selUnico && invModal,
        retry: false,
    });

    const { data: customers = [], isFetching: loadingCust } = useQuery({
        queryKey: ["carr-cust", selUnico],
        queryFn:  () => sF(`/api/masters/carriers/${selUnico}/customers`),
        enabled:  !!selUnico && custModal,
        retry: false,
    });

    useEffect(() => { if (list.length > 0 && !form.unico) loadCarrier(0); }, [list]);

    /* ── Data load ───────────────────────────────────────────────────────── */
    const loadCarrier = async (idx: number) => {
        if (!list[idx]) return;
        setCurrentIdx(idx);
        try {
            const d = await sF(`/api/masters/carriers/${list[idx].unico}`);
            setForm({
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
                cut_off:           d.cut_off ? String(d.cut_off).substring(0, 5) : "",
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
            setFormError(null);
        } catch {
            setFormError("Failed to load carrier.");
        }
    };

    /* ── CRUD ────────────────────────────────────────────────────────────── */
    const validate = () => {
        if (!form.carriercode.trim()) return "Carrier code is empty.";
        if (!form.carrier.trim())     return "Carrier name is empty.";
        if (!form.contact.trim())     return "Contact name is empty.";
        if (!form.phone_1.trim())     return "Main phone is empty.";
        if (!form.fax_1.trim())       return "Main fax is empty.";
        return null;
    };

    const handleSave = async () => {
        const err = validate();
        if (err) { setFormError(err); return; }
        setSaving(true); setFormError(null);
        try {
            if (mode === "add") {
                const res  = await fetch("/api/masters/carriers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
                const data = await res.json();
                if (!data.success) throw new Error(data.error);
                logAction("Insert", data.unico);
            } else {
                const res  = await fetch(`/api/masters/carriers/${form.unico}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
                const data = await res.json();
                if (!data.success) throw new Error(data.error);
                logAction("Edit", form.unico);
            }
            await qc.invalidateQueries({ queryKey: ["carr-list"] });
            setFormModal(false);
        } catch (e: any) {
            setFormError(e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selUnico || !confirm(`Delete carrier "${t(form.carrier)}"?`)) return;
        setSaving(true);
        try {
            const res  = await fetch(`/api/masters/carriers/${selUnico}`, { method: "DELETE" });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            logAction("Delete", selUnico);
            await qc.invalidateQueries({ queryKey: ["carr-list"] });
            setCurrentIdx(0);
        } catch (e: any) {
            alert(e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleOthersSave = async () => {
        setSaving(true);
        try {
            const res  = await fetch(`/api/masters/carriers/${selUnico}/others`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(otherForm) });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            logAction("Edit", selUnico!, "Others");
            setOthersModal(false);
            await loadCarrier(currentIdx);
        } catch (e: any) {
            alert(e.message);
        } finally {
            setSaving(false);
        }
    };

    const openAdd = () => {
        setForm({ ...EMPTY });
        setMode("add");
        setFormError(null);
        setFormModal(true);
    };

    const openEdit = () => {
        if (!selUnico) return;
        setMode("edit");
        setFormError(null);
        setFormModal(true);
    };

    if (status === "loading") return null;

    return (
        <div className="flex flex-col h-[100dvh] bg-[#f4f6f8] overflow-hidden font-sans text-[#333]">
            <AppHeader title="Carriers" />

            {/* ── Full-page grid ─────────────────────────────────────────────── */}
            <div className="flex flex-1 min-h-0 p-2">
                <PanelGrid
                    className="flex-1"
                    title="Carriers"
                    icon={Truck}
                    recordCount={filteredList.length}
                    searchValue={carrSearch}
                    onSearchChange={setCarrSearch}
                    searchPlaceholder="Search carriers..."
                    onRefresh={() => refetchList()}
                    refreshing={loadingList}
                    headerRight={
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setInvModal(true)}
                                disabled={!selUnico}
                                title="Invoices"
                                className={cn(
                                    "flex items-center gap-1 px-2 h-7 rounded text-[10px] font-black uppercase tracking-wider transition-all",
                                    selUnico ? "bg-white/20 text-white hover:bg-white/30" : "text-gray-500 cursor-not-allowed opacity-40"
                                )}
                            >
                                <FileText size={12} />
                                <span className="hidden sm:inline">Invoices</span>
                            </button>
                            <button
                                onClick={() => setCustModal(true)}
                                disabled={!selUnico}
                                title="Customers"
                                className={cn(
                                    "flex items-center gap-1 px-2 h-7 rounded text-[10px] font-black uppercase tracking-wider transition-all",
                                    selUnico ? "bg-white/20 text-white hover:bg-white/30" : "text-gray-500 cursor-not-allowed opacity-40"
                                )}
                            >
                                <Users size={12} />
                                <span className="hidden sm:inline">Customers</span>
                            </button>
                            <AuditLogModal recordId={selUnico} disabled={!selUnico} />
                        </div>
                    }
                    menuItems={[
                        { label: "Add Carrier",    icon: Plus,     color: "green",  onClick: openAdd,                                                                                                       disabled: !perms.canCreate },
                        { label: "Edit Carrier",   icon: Pencil,   color: "blue",   onClick: openEdit,                                                                                                      disabled: !selUnico || !perms.canEdit },
                        { label: "Delete Carrier", icon: Trash2,   color: "red",    onClick: handleDelete,                                                                                                  disabled: !selUnico || !perms.canDelete },
                        { separator: true },
                        { label: "Invoices",       icon: FileText, color: "orange", onClick: () => setInvModal(true),                                                                                       disabled: !selUnico },
                        { label: "Customers",      icon: Users,    color: "orange", onClick: () => setCustModal(true),                                                                                      disabled: !selUnico },
                        { separator: true },
                        { label: "Other Settings", icon: Settings, color: "orange", onClick: () => { if (selUnico) { setOtherForm({ internal_delivery: Boolean(form.internal_delivery) }); setOthersModal(true); } }, disabled: !selUnico },
                    ]}
                >
                    <PanelGridTable>
                        <PanelGridThead>
                            <PanelGridTh className="w-5" align="center">{""}</PanelGridTh>
                            <PanelGridTh>Code</PanelGridTh>
                            <PanelGridTh>Carrier</PanelGridTh>
                            <PanelGridTh className="hidden md:table-cell">Contact</PanelGridTh>
                            <PanelGridTh className="hidden sm:table-cell">Phone</PanelGridTh>
                            <PanelGridTh className="hidden lg:table-cell">Fax</PanelGridTh>
                            <PanelGridTh className="hidden md:table-cell">City</PanelGridTh>
                            <PanelGridTh className="hidden xl:table-cell">Country</PanelGridTh>
                            <PanelGridTh align="center" className="hidden sm:table-cell">✈</PanelGridTh>
                        </PanelGridThead>
                        <PanelGridTbody>
                            {filteredList.length === 0 ? (
                                <PanelGridTr className="pointer-events-none">
                                    <PanelGridTd colSpan={9} align="center" className="py-10 text-gray-300 italic">No carriers found</PanelGridTd>
                                </PanelGridTr>
                            ) : filteredList.map((c: any) => {
                                const realIdx = list.findIndex((x: any) => x.unico === c.unico);
                                return (
                                    <PanelGridTr key={c.unico} selected={realIdx === currentIdx} onClick={() => loadCarrier(realIdx)}>
                                        <PanelGridTd align="center">
                                            <div className={cn("w-2 h-2 rounded-full mx-auto", c.active ? "bg-green-400" : "bg-gray-300")} />
                                        </PanelGridTd>
                                        <PanelGridTd className="font-mono font-bold">{t(c.carriercode)}</PanelGridTd>
                                        <PanelGridTd className="font-semibold">{t(c.carrier)}</PanelGridTd>
                                        <PanelGridTd className="hidden md:table-cell">{t(c.contact)}</PanelGridTd>
                                        <PanelGridTd className="hidden sm:table-cell font-mono">{t(c.phone_1)}</PanelGridTd>
                                        <PanelGridTd className="hidden lg:table-cell font-mono">{t(c.fax_1)}</PanelGridTd>
                                        <PanelGridTd className="hidden md:table-cell">{t(c.city)}</PanelGridTd>
                                        <PanelGridTd className="hidden xl:table-cell">{t(c.country)}</PanelGridTd>
                                        <PanelGridTd align="center" className="hidden sm:table-cell">
                                            {c.isairline ? <span className="text-blue-400 text-xs">✈</span> : null}
                                        </PanelGridTd>
                                    </PanelGridTr>
                                );
                            })}
                        </PanelGridTbody>
                    </PanelGridTable>
                </PanelGrid>
            </div>

            <AppFooter areaLabel="Masters" />

            {/* ─── Form Modal ──────────────────────────────────────────────────── */}
            {formModal && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
                        <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 shrink-0">
                            <div className="flex items-center gap-2 min-w-0">
                                <Truck size={16} className="text-[#FB7506]" />
                                <span className="fos-grid-header-text truncate">
                                    {mode === "add" ? "New Carrier" : t(form.carrier) || "Edit Carrier"}
                                </span>
                                {mode !== "add" && <AuditLogModal recordId={selUnico} disabled={!selUnico} />}
                                {formError && (
                                    <span className="flex items-center gap-1 text-amber-400 text-[10px] font-bold ml-1 truncate">
                                        <AlertCircle size={12} />{formError}
                                    </span>
                                )}
                            </div>
                            <button onClick={() => { setFormModal(false); setFormError(null); }} className="w-8 h-10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="p-3 overflow-y-auto flex-1">
                            <div className="grid grid-cols-2 gap-2.5">
                                {mode !== "add" && (
                                    <div className="flex flex-col gap-0.5">
                                        <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Unique</label>
                                        <input value={form.unico} readOnly className="fos-input h-10 text-sm bg-gray-50 text-gray-500 cursor-default" />
                                    </div>
                                )}
                                <F label="Code *"    value={form.carriercode} onChange={(v: string) => setForm((p: any) => ({ ...p, carriercode: v }))} />
                                <F label="Carrier *" value={form.carrier}     onChange={(v: string) => setForm((p: any) => ({ ...p, carrier: v }))}     span2 />
                                <F label="Contact *" value={form.contact}     onChange={(v: string) => setForm((p: any) => ({ ...p, contact: v }))}     span2 />
                                <F label="Address"   value={form.address}     onChange={(v: string) => setForm((p: any) => ({ ...p, address: v }))}     span2 />
                                <F label="City"      value={form.city}        onChange={(v: string) => setForm((p: any) => ({ ...p, city: v }))} />
                                <F label="Country"   value={form.country}     onChange={(v: string) => setForm((p: any) => ({ ...p, country: v }))} />
                                <F label="State"     value={form.state}       onChange={(v: string) => setForm((p: any) => ({ ...p, state: v.substring(0, 4) }))} />
                                <F label="Zip"       value={form.zip}         onChange={(v: string) => setForm((p: any) => ({ ...p, zip: v }))} />
                                <F label="Phone *"   value={form.phone_1}     onChange={(v: string) => setForm((p: any) => ({ ...p, phone_1: v }))} />
                                <F label="Phone 2"   value={form.phone_2}     onChange={(v: string) => setForm((p: any) => ({ ...p, phone_2: v }))} />
                                <F label="Fax *"     value={form.fax_1}       onChange={(v: string) => setForm((p: any) => ({ ...p, fax_1: v }))} />
                                <F label="Fax 2"     value={form.fax_2}       onChange={(v: string) => setForm((p: any) => ({ ...p, fax_2: v }))} />

                                <div className="flex flex-col gap-0.5 col-span-2">
                                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">E-mail</label>
                                    <div className="flex items-center gap-1">
                                        <input type="email" value={form.email ?? ""} onChange={e => setForm((p: any) => ({ ...p, email: e.target.value }))}
                                            className="fos-input h-10 text-sm flex-1" />
                                        {form.email && (
                                            <button onClick={() => window.open("mailto:" + form.email)} title="Send email" className="text-[#FB7506] hover:text-orange-600 transition-colors">
                                                <Mail size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <F label="Ship Account" value={form.ship_account} onChange={(v: string) => setForm((p: any) => ({ ...p, ship_account: v }))} />

                                <div className="flex flex-col gap-0.5">
                                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Cut Off</label>
                                    <input type="time" value={form.cut_off ?? ""} onChange={e => setForm((p: any) => ({ ...p, cut_off: e.target.value }))}
                                        className="fos-input h-10 text-sm" />
                                </div>

                                <div className="flex flex-col gap-0.5 col-span-2">
                                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Charge</label>
                                    <div className="flex items-center gap-1">
                                        <select value={form.product_uq ?? ""} onChange={e => setForm((p: any) => ({ ...p, product_uq: e.target.value }))}
                                            className="fos-input h-10 text-sm flex-1">
                                            <option value="">— None —</option>
                                            {(products as any[]).map((p: any) => (
                                                <option key={p.unico} value={p.unico}>{t(p.description)}</option>
                                            ))}
                                        </select>
                                        <button onClick={() => setForm((p: any) => ({ ...p, product_uq: "" }))} title="Clear" className="text-gray-400 hover:text-red-500 transition-colors">
                                            <XCircle size={16} />
                                        </button>
                                    </div>
                                </div>

                                <F label="F.Charge" value={String(form.freight_charge)} type="number" onChange={(v: string) => setForm((p: any) => ({ ...p, freight_charge: parseFloat(v) || 0 }))} />

                                <div className="flex flex-col gap-0.5">
                                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">T.W.F. Code</label>
                                    <div className="flex gap-1">
                                        <input value={form.twf_id ?? ""} onChange={e => setForm((p: any) => ({ ...p, twf_id: e.target.value }))}
                                            className="fos-input h-10 text-sm flex-1" />
                                        <button disabled title="TWF integration not available in web version"
                                            className="px-2 h-10 bg-gray-100 border border-gray-200 rounded text-xs text-gray-400 cursor-not-allowed">TWF</button>
                                    </div>
                                </div>

                                <F label="Web User" value={form.username} onChange={(v: string) => setForm((p: any) => ({ ...p, username: v }))} />
                                <F label="Password"  value={form.password}  type="password" onChange={(v: string) => setForm((p: any) => ({ ...p, password: v }))} />

                                <div className="col-span-2 flex flex-wrap items-center gap-4 pt-1 border-t border-gray-100">
                                    {mode !== "add" && (
                                        <label className="flex items-center gap-1.5 cursor-pointer">
                                            <input type="checkbox" checked={Boolean(form.active)} onChange={e => setForm((p: any) => ({ ...p, active: e.target.checked }))} className="w-4 h-4 accent-[#FB7506]" />
                                            <span className="text-sm font-semibold text-gray-600">Active</span>
                                        </label>
                                    )}
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input type="checkbox" checked={Boolean(form.isairline)} onChange={e => setForm((p: any) => ({ ...p, isairline: e.target.checked }))} className="w-4 h-4 accent-[#FB7506]" />
                                        <span className="text-sm font-semibold text-gray-600">Airline ✈</span>
                                    </label>
                                    <label className="flex items-center gap-1.5">
                                        <input type="checkbox" checked={Boolean(form.chk_account)} onChange={e => setForm((p: any) => ({ ...p, chk_account: e.target.checked }))} className="w-4 h-4 accent-[#FB7506]" />
                                        <span className="text-sm font-semibold text-gray-600">Chk Account</span>
                                    </label>
                                    <label className="flex items-center gap-1.5">
                                        <input type="checkbox" checked={Boolean(form.chk_zone)} onChange={e => setForm((p: any) => ({ ...p, chk_zone: e.target.checked }))} className="w-4 h-4 accent-[#FB7506]" />
                                        <span className="text-sm font-semibold text-gray-600">Chk Zone</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 px-4 py-3 bg-white border-t border-gray-100 shrink-0">
                            <button onClick={() => { setFormModal(false); setFormError(null); }} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleSave} disabled={saving}
                                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#FB7506] hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-black uppercase tracking-wider transition-all">
                                {saving ? <RefreshCcw size={14} className="animate-spin" /> : <Save size={14} />}
                                {saving ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Invoices Modal ──────────────────────────────────────────────── */}
            {invModal && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4" onClick={() => setInvModal(false)}>
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 shrink-0">
                            <div className="flex items-center gap-2">
                                <FileText size={16} className="text-[#FB7506]" />
                                <span className="fos-grid-header-text">Invoices — {t(form.carrier)}</span>
                                {loadingInv && <RefreshCcw size={12} className="text-gray-400 animate-spin ml-1" />}
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1.5 mr-2">
                                    <input type="date" value={invDateIni} onChange={e => setInvDateIni(e.target.value)} className="fos-input h-7 text-xs w-[110px]" />
                                    <span className="text-gray-400 text-[10px] font-bold uppercase">to</span>
                                    <input type="date" value={invDateEnd} onChange={e => setInvDateEnd(e.target.value)} className="fos-input h-7 text-xs w-[110px]" />
                                </div>
                                <button onClick={() => setInvModal(false)} className="w-8 h-10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="overflow-auto flex-1">
                            <PanelGridTable>
                                <PanelGridThead>
                                    <PanelGridTh>Customer</PanelGridTh>
                                    <PanelGridTh>Invoice</PanelGridTh>
                                    <PanelGridTh>Date</PanelGridTh>
                                    <PanelGridTh align="right">Amount</PanelGridTh>
                                    <PanelGridTh align="right">Credits</PanelGridTh>
                                    <PanelGridTh align="right">Debits</PanelGridTh>
                                </PanelGridThead>
                                <PanelGridTbody>
                                    {(invoices as any[]).length === 0 ? (
                                        <PanelGridTr className="pointer-events-none">
                                            <PanelGridTd colSpan={6} align="center" className="py-8 text-gray-300 italic text-sm">No invoices</PanelGridTd>
                                        </PanelGridTr>
                                    ) : (invoices as any[]).map((r: any, i: number) => (
                                        <PanelGridTr key={i}>
                                            <PanelGridTd className="truncate max-w-[160px]">{t(r.customer)}</PanelGridTd>
                                            <PanelGridTd className="font-mono">{t(r.invoice_no)}</PanelGridTd>
                                            <PanelGridTd className="whitespace-nowrap">{formatDateEST(normalizeToISODate(r.invoice_date))}</PanelGridTd>
                                            <PanelGridTd align="right">{formatMoney(r.total_invoice)}</PanelGridTd>
                                            <PanelGridTd align="right" className="text-green-600">{formatMoney(r.total_credits)}</PanelGridTd>
                                            <PanelGridTd align="right" className="text-red-500">{formatMoney(r.total_debits)}</PanelGridTd>
                                        </PanelGridTr>
                                    ))}
                                </PanelGridTbody>
                            </PanelGridTable>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Customers Modal ─────────────────────────────────────────────── */}
            {custModal && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4" onClick={() => setCustModal(false)}>
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 shrink-0">
                            <div className="flex items-center gap-2">
                                <Users size={16} className="text-[#FB7506]" />
                                <span className="fos-grid-header-text">Customers — {t(form.carrier)}</span>
                                {loadingCust && <RefreshCcw size={12} className="text-gray-400 animate-spin ml-1" />}
                            </div>
                            <button onClick={() => setCustModal(false)} className="w-8 h-10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="overflow-auto flex-1">
                            <PanelGridTable>
                                <PanelGridThead>
                                    <PanelGridTh>Customer</PanelGridTh>
                                    <PanelGridTh>Shipto</PanelGridTh>
                                    <PanelGridTh>Address</PanelGridTh>
                                    <PanelGridTh>City</PanelGridTh>
                                    <PanelGridTh>State</PanelGridTh>
                                    <PanelGridTh>Zip</PanelGridTh>
                                    <PanelGridTh>Account</PanelGridTh>
                                </PanelGridThead>
                                <PanelGridTbody>
                                    {(customers as any[]).length === 0 ? (
                                        <PanelGridTr className="pointer-events-none">
                                            <PanelGridTd colSpan={7} align="center" className="py-8 text-gray-300 italic text-sm">No customers</PanelGridTd>
                                        </PanelGridTr>
                                    ) : (customers as any[]).map((r: any, i: number) => (
                                        <PanelGridTr key={i}>
                                            <PanelGridTd className="truncate max-w-[140px]">{t(r.customer)}</PanelGridTd>
                                            <PanelGridTd className="truncate max-w-[120px]">{t(r.name)}</PanelGridTd>
                                            <PanelGridTd className="truncate max-w-[140px]">{t(r.address1)}</PanelGridTd>
                                            <PanelGridTd>{t(r.city)}</PanelGridTd>
                                            <PanelGridTd>{t(r.state)}</PanelGridTd>
                                            <PanelGridTd>{t(r.zip)}</PanelGridTd>
                                            <PanelGridTd>{t(r.account)}</PanelGridTd>
                                        </PanelGridTr>
                                    ))}
                                </PanelGridTbody>
                            </PanelGridTable>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Other Settings Modal ────────────────────────────────────────── */}
            {othersModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm overflow-hidden">
                        <div className="h-10 bg-[#374151] flex items-center justify-between px-3">
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
                                    onChange={e => setOtherForm(p => ({ ...p, internal_delivery: e.target.checked }))}
                                    className="w-5 h-5 accent-[#FB7506]" />
                                <div>
                                    <p className="text-sm font-bold text-gray-800">Internal Delivery</p>
                                    <p className="text-xs text-gray-400">Mark as internal/own delivery service</p>
                                </div>
                            </label>
                        </div>
                        <div className="flex justify-end gap-3 px-4 py-3 bg-gray-50 border-t">
                            <button onClick={() => setOthersModal(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-100">
                                Cancel
                            </button>
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
