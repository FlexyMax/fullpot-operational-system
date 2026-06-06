"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Save, Truck, Plus, Pencil, Trash2, Mail, Check, AlertCircle, XCircle, X, RefreshCcw, Settings, Menu, Search, Download
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import PanelGrid from "@/components/ui/PanelGrid";
import { PanelGridTable, PanelGridThead, PanelGridTh, PanelGridTbody, PanelGridTr, PanelGridTd } from "@/components/ui/PanelGridTable";
import { GridMenu } from "@/components/GridMenu";
import { cn } from "@/lib/utils";
import { useAuditLog } from "@/lib/audit";
import { usePagePermissions, PERMISSION_MSGS } from "@/lib/permissions";
import { AuditLogModal } from "@/components/AuditLogModal";
import { EntityFormModal } from "@/components/EntityFormModal";
import { formatMoney, formatDateEST } from "@/lib/dates";

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

// --- Main Page ---
export default function CarriersDefinitionPage() {
    const { status } = useSession();
    const router = useRouter();
    const qc     = useQueryClient();
    const { logAction } = useAuditLog("carriers-definition", "flower_carriers");
    const perms = usePagePermissions("carriers-definition");

    const [mode,        setMode]        = useState<Mode>("view");
    const [currentIdx,  setCurrentIdx]  = useState(0);
    const [form,        setForm]        = useState<any>(EMPTY);
    const [formError,   setFormError]   = useState<string | null>(null);
    const [saveMsg,     setSaveMsg]     = useState<string | null>(null);
    const [saving,      setSaving]      = useState(false);
    const [activeTab,   setActiveTab]   = useState<"invoices"|"customers">("invoices");
    const [othersModal,  setOthersModal]  = useState(false);
    const [otherForm,    setOtherForm]    = useState<any>({internal_delivery:false});
    const [mobileOpen,   setMobileOpen]   = useState(false);
    const [modalOpen,    setModalOpen]    = useState(false);

    const [list, setList]       = useState<any[]>([]);
    const [loadingList, setLoadingList] = useState(true);
    const [carrSearch, setCarrSearch] = useState("");

    // Tab data
    const [carrInvoices, setCarrInvoices]   = useState<any[]>([]);
    const [loadingInvoices, setLoadingInvoices] = useState(false);
    const [carrCustomers, setCarrCustomers]  = useState<any[]>([]);
    const [loadingCustomers, setLoadingCustomers] = useState(false);

    // Scroll refs
    const invoiceScrollRef = useRef<HTMLDivElement>(null);
    const customerScrollRef = useRef<HTMLDivElement>(null);
    const invoicePageRef    = useRef(1);
    const customerPageRef   = useRef(1);
    const invoiceHasMoreRef = useRef(true);
    const customerHasMoreRef = useRef(true);
    const invoiceLoadingRef  = useRef(false);
    const customerLoadingRef = useRef(false);

    const selUnico = form.unico || null;

    // --- Filtered list ---
    const filteredList = useMemo(() => {
        if (!carrSearch.trim()) return list;
        const q = carrSearch.toLowerCase();
        return list.filter((c: any) =>
            t(c.carrier).toLowerCase().includes(q) ||
            t(c.carriercode).toLowerCase().includes(q)
        );
    }, [list, carrSearch]);

    // --- Data loading ---
    const refetchList = async () => {
        setLoadingList(true);
        try {
            const data = await sF("/api/masters/carriers?minimal=1");
            setList(Array.isArray(data) ? data : []);
            if (data.length > 0 && currentIdx < data.length) {
                loadCarrier(currentIdx, data);
            }
        } catch (e: any) { setFormError(e.message); }
        finally { setLoadingList(false); }
    };

    const loadCarrier = async (idx: number, listOverride?: any[]) => {
        const src = listOverride || list;
        if (idx < 0 || idx >= src.length) return;
        setCurrentIdx(idx);
        const c = src[idx];
        try {
            const full = await sF(`/api/masters/carriers/${c.unico}`);
            setForm(full);
            setMode("view");
            setFormError(null);
            setSaveMsg(null);
            // Reset tabs
            setCarrInvoices([]);
            setCarrCustomers([]);
            invoicePageRef.current = 1;
            customerPageRef.current = 1;
            invoiceHasMoreRef.current = true;
            customerHasMoreRef.current = true;
            if (activeTab === "invoices") loadInvoices(c.unico, 1, true);
            else loadCustomers(c.unico, 1, true);
        } catch (e: any) { setFormError(e.message); }
    };

    const loadInvoices = async (unico: string, page: number, reset: boolean) => {
        if (invoiceLoadingRef.current || (!reset && !invoiceHasMoreRef.current)) return;
        invoiceLoadingRef.current = true;
        setLoadingInvoices(true);
        try {
            const data = await sF(`/api/masters/carriers/${unico}/invoices?page=${page}&pageSize=30`);
            const items = Array.isArray(data) ? data : [];
            if (items.length < 30) invoiceHasMoreRef.current = false;
            setCarrInvoices(prev => reset ? items : [...prev, ...items]);
            invoicePageRef.current = page;
        } catch { /* silent */ }
        finally { invoiceLoadingRef.current = false; setLoadingInvoices(false); }
    };

    const loadCustomers = async (unico: string, page: number, reset: boolean) => {
        if (customerLoadingRef.current || (!reset && !customerHasMoreRef.current)) return;
        customerLoadingRef.current = true;
        setLoadingCustomers(true);
        try {
            const data = await sF(`/api/masters/carriers/${unico}/customers?page=${page}&pageSize=30`);
            const items = Array.isArray(data) ? data : [];
            if (items.length < 30) customerHasMoreRef.current = false;
            setCarrCustomers(prev => reset ? items : [...prev, ...items]);
            customerPageRef.current = page;
        } catch { /* silent */ }
        finally { customerLoadingRef.current = false; setLoadingCustomers(false); }
    };

    const handleInvoiceScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const el = e.currentTarget;
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20 && selUnico) {
            loadInvoices(selUnico, invoicePageRef.current + 1, false);
        }
    };

    const handleCustomerScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const el = e.currentTarget;
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20 && selUnico) {
            loadCustomers(selUnico, customerPageRef.current + 1, false);
        }
    };

    // --- Navigation ---
    const goFirst = () => { if (list.length) loadCarrier(0); };
    const goPrev  = () => { if (currentIdx > 0) loadCarrier(currentIdx - 1); };
    const goNext  = () => { if (currentIdx < list.length - 1) loadCarrier(currentIdx + 1); };
    const goLast  = () => { if (list.length) loadCarrier(list.length - 1); };

    // --- CRUD ---
    const handleSave = async () => {
        setSaving(true); setFormError(null); setSaveMsg(null);
        try {
            const url = mode === "add" ? "/api/masters/carriers" : `/api/masters/carriers/${selUnico}`;
            const method = mode === "add" ? "POST" : "PUT";
            const res = await fetch(url, { method, headers:{"Content-Type":"application/json"}, body: JSON.stringify(form) });
            const data = await res.json(); if (!data.success) throw new Error(data.error);
            logAction(mode === "add" ? "Insert" : "Edit", data.unico || selUnico);
            setSaveMsg("Saved!");
            await refetchList();
            if (mode === "add" && data.unico) {
                const newIdx = list.findIndex((c: any) => c.unico === data.unico);
                if (newIdx >= 0) loadCarrier(newIdx);
            }
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

    const handleEdit = () => { if (list[currentIdx]) setMode("edit"); };
    const handleAdd  = () => { setForm({...EMPTY}); setFormError(null); setMode("add"); };

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

    // --- Effects ---
    useEffect(() => { if (status === "authenticated") refetchList(); }, [status]);

    useEffect(() => {
        if (!selUnico) return;
        if (activeTab === "invoices" && carrInvoices.length === 0) loadInvoices(selUnico, 1, true);
        if (activeTab === "customers" && carrCustomers.length === 0) loadCustomers(selUnico, 1, true);
    }, [activeTab, selUnico]);

    if (status === "loading") return null;

    return (
        <div className="flex flex-col h-[100dvh] bg-[#f4f6f8] overflow-hidden font-sans text-[#333]">

            <AppHeader title="Carriers" />

            {/* Search toolbar */}
            <div className="bg-white border-b border-gray-200 px-3 py-2 flex items-center gap-2 shrink-0 shadow-sm flex-wrap">
                <div className="relative">
                    <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={carrSearch} onChange={e => setCarrSearch(e.target.value)}
                        placeholder="Search carriers..." className="pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded outline-none focus:ring-1 focus:ring-[#FB7506] w-52" />
                </div>
                <button onClick={() => refetchList()} className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 border border-gray-200 px-2.5 py-1 rounded text-[10px] font-black uppercase transition-all">
                    <RefreshCcw size={10} className={loadingList ? "animate-spin" : ""} /> Refresh
                </button>
                <GridMenu items={[
                    { label: "Add Carrier", icon: Plus, color: "green", onClick: () => { setForm({...EMPTY}); setFormError(null); setMode("add"); }, disabled: !perms.canCreate },
                    { label: "Edit Carrier", icon: Pencil, color: "orange", onClick: () => { if (list[currentIdx]) setMode("edit"); }, disabled: !selUnico || isEditing || !perms.canEdit },
                    { label: "Delete Carrier", icon: Trash2, color: "red", onClick: handleDelete, disabled: !selUnico || isEditing || !perms.canDelete },
                    { separator: true },
                    { label: "Other Settings", icon: Settings, color: "orange", onClick: () => { if(!selUnico){setFormError("Carrier is empty.");return;} setOtherForm({internal_delivery:Boolean(form.internal_delivery)}); setOthersModal(true); }, disabled: isEditing || !selUnico },
                ]} />
                <AuditLogModal recordId={selUnico} disabled={!selUnico} />
                {formError && <span className="text-amber-600 text-[10px] font-bold flex items-center gap-1 ml-2"><AlertCircle size={11} />{formError}</span>}
                {saveMsg && <span className="text-green-600 text-[10px] font-bold flex items-center gap-1 ml-2"><Check size={11} />{saveMsg}</span>}
            </div>

            {/* Main layout */}
            <div className="flex flex-col lg:flex-row flex-1 gap-2 p-2 overflow-y-auto lg:overflow-hidden">

                {/* --- Left: Carrier List PanelGrid --- */}
                <PanelGrid
                    title="Carriers"
                    icon={Truck}
                    recordCount={filteredList.length}
                    refreshing={loadingList}
                    headerRight={<AuditLogModal recordId={selUnico} disabled={!selUnico} bareButton />}
                    menuItems={[
                        { label: "Add Carrier", icon: Plus, color: "green", onClick: () => { setForm({...EMPTY}); setFormError(null); setMode("add"); }, disabled: !perms.canCreate },
                        { label: "Edit Carrier", icon: Pencil, color: "orange", onClick: () => { if (list[currentIdx]) setMode("edit"); }, disabled: !selUnico || isEditing || !perms.canEdit },
                        { label: "Delete Carrier", icon: Trash2, color: "orange", onClick: handleDelete, disabled: !selUnico || isEditing || !perms.canDelete },
                    ]}
                    className="hidden lg:flex w-[240px] shrink-0"
                >
                    <div className="overflow-y-auto flex-1">
                        <PanelGridTable>
                            <PanelGridThead>
                                <PanelGridTh>Code</PanelGridTh>
                                <PanelGridTh>Carrier</PanelGridTh>
                                <PanelGridTh align="center">Active</PanelGridTh>
                                <PanelGridTh align="center">Air</PanelGridTh>
                            </PanelGridThead>
                            <PanelGridTbody>
                                {filteredList.map((c: any) => (
                                    <PanelGridTr key={c.unico} selected={list.indexOf(c) === currentIdx}
                                        onClick={() => { if (!isEditing) loadCarrier(list.indexOf(c)); }}>
                                        <PanelGridTd className="font-mono text-[10px]">{t(c.carriercode)}</PanelGridTd>
                                        <PanelGridTd className="font-semibold max-w-[140px] truncate">{t(c.carrier)}</PanelGridTd>
                                        <PanelGridTd align="center">{c.active ? <Check size={10} className="text-green-500 mx-auto" /> : <XCircle size={10} className="text-gray-300 mx-auto" />}</PanelGridTd>
                                        <PanelGridTd align="center">{c.isairline ? <span className="text-[10px] text-blue-400 font-bold">{"\u2708"}</span> : "\u2014"}</PanelGridTd>
                                    </PanelGridTr>
                                ))}
                            </PanelGridTbody>
                        </PanelGridTable>
                    </div>
                </PanelGrid>

                {/* --- Right: Form + Tabs --- */}
                <div className="flex-1 flex flex-col min-w-0 gap-2 lg:overflow-hidden">

                    {/* Form card — EntityFormModal */}
                    <EntityFormModal
                        open={true}
                        title={mode === "add" ? "New Carrier" : t(form.carrier) || "Carrier Details"}
                        icon={Truck}
                        recordId={form.unico || null}
                        subtitle={form.carriercode || undefined}
                        form={form}
                        fields={[
                            { k:"unico", l:"Unique", disabled:true },
                            { k:"carriercode", l:"Code *" },
                            { k:"carrier", l:"Carrier *" },
                            { k:"contact", l:"Contact *" },
                            { k:"address", l:"Address" },
                            { k:"city", l:"City" },
                            { k:"country", l:"Country" },
                            { k:"state", l:"State" },
                            { k:"zip", l:"Zip" },
                            { k:"phone_1", l:"Phone *" },
                            { k:"phone_2", l:"Phone 2" },
                            { k:"fax_1", l:"Fax *" },
                            { k:"fax_2", l:"Fax 2" },
                            { k:"email", l:"E-mail" },
                            { k:"ship_account", l:"Ship Account" },
                            { k:"cut_off", l:"Cut Off" },
                        ]}
                        checkFields={[
                            { k:"active", l:"Active" },
                            { k:"isairline", l:"Airline" },
                            { k:"send_twf", l:"Send TWF" },
                            { k:"chk_account", l:"Chk Account" },
                            { k:"chk_zone", l:"Chk Zone" },
                        ]}
                        onChange={(key, val) => setForm((p: any) => ({ ...p, [key]: key === "state" ? String(val).substring(0, 4) : val }))}
                        onSave={handleSave}
                        onClose={() => { if (list[currentIdx]) loadCarrier(currentIdx); else setForm(EMPTY); setMode("view"); setFormError(null); }}
                        saving={saving}
                        error={formError}
                        success={saveMsg}
                        readOnly={!isEditing}
                        onEdit={handleEdit}
                        onAdd={handleAdd}
                        onDelete={handleDelete}
                        onFirst={goFirst}
                        onPrev={goPrev}
                        onNext={goNext}
                        onLast={goLast}
                        canPrev={currentIdx > 0}
                        canNext={currentIdx < list.length - 1}
                        position={list.length > 0 ? `${currentIdx + 1}/${list.length}` : "0"}
                        extraContent={
                            form.email && !isEditing ? (
                                <button onClick={() => window.open('mailto:' + form.email)} title="Send email"
                                    className="text-[#FB7506] hover:text-orange-600 transition-colors">
                                    <Mail size={16} />
                                </button>
                            ) : null
                        }
                        className="shrink-0"
                    />

                    {/* Tabs area */}
                    <div className="flex flex-col flex-1 overflow-hidden">
                        {/* Tab bar */}
                        <div className="bg-[#374151] flex items-end px-2 gap-0.5 shrink-0 h-9">
                            {([
                                { id:"invoices",  label:"Invoices",  icon:Download },
                                { id:"customers", label:"Customers", icon:Truck },
                            ] as const).map(tab => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                    className={cn("flex items-center gap-1.5 px-4 h-7 text-[10px] font-black uppercase tracking-wider rounded-t transition-all",
                                        activeTab === tab.id ? "bg-[#f4f6f8] text-[#FB7506]" : "text-gray-400 hover:text-white hover:bg-white/10")}>
                                    <tab.icon size={11} />{tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab content */}
                        <div className="flex-1 overflow-hidden bg-[#f4f6f8] p-2 flex flex-col gap-2">

                            {/* --- INVOICES TAB --- */}
                            {activeTab === "invoices" && (
                                <PanelGrid
                                    title="Invoices"
                                    icon={Download}
                                    recordCount={carrInvoices.length}
                                    refreshing={loadingInvoices}
                                    onRefresh={() => { if (selUnico) loadInvoices(selUnico, 1, true); }}
                                    headerRight={<AuditLogModal recordId={selUnico} disabled={!selUnico} bareButton />}
                                    className="flex-1 min-h-0 flex flex-col"
                                >
                                    <div className="overflow-auto flex-1" ref={invoiceScrollRef} onScroll={handleInvoiceScroll}>
                                        <PanelGridTable>
                                            <PanelGridThead>
                                                <PanelGridTh>Invoice #</PanelGridTh>
                                                <PanelGridTh>Date</PanelGridTh>
                                                <PanelGridTh>Customer</PanelGridTh>
                                                <PanelGridTh align="right">Amount</PanelGridTh>
                                                <PanelGridTh className="hidden md:table-cell">AWB</PanelGridTh>
                                                <PanelGridTh className="hidden lg:table-cell">Boxes</PanelGridTh>
                                            </PanelGridThead>
                                            <PanelGridTbody>
                                                {carrInvoices.length === 0 ? (
                                                    <PanelGridTr><PanelGridTd className="text-center text-gray-400 py-6" colSpan={6}>{loadingInvoices ? "Loading..." : "No invoices found"}</PanelGridTd></PanelGridTr>
                                                ) : carrInvoices.map((inv: any) => (
                                                    <PanelGridTr key={inv.unico}>
                                                        <PanelGridTd className="font-mono text-[10px]">{t(inv.invoice)}</PanelGridTd>
                                                        <PanelGridTd>{formatDateEST(inv.invoicedate)}</PanelGridTd>
                                                        <PanelGridTd className="max-w-[160px] truncate">{t(inv.customer_name)}</PanelGridTd>
                                                        <PanelGridTd align="right">{formatMoney(inv.total)}</PanelGridTd>
                                                        <PanelGridTd className="hidden md:table-cell font-mono text-[10px]">{t(inv.awb)}</PanelGridTd>
                                                        <PanelGridTd className="hidden lg:table-cell">{inv.boxes ?? "\u2014"}</PanelGridTd>
                                                    </PanelGridTr>
                                                ))}
                                            </PanelGridTbody>
                                        </PanelGridTable>
                                    </div>
                                </PanelGrid>
                            )}

                            {/* --- CUSTOMERS TAB --- */}
                            {activeTab === "customers" && (
                                <PanelGrid
                                    title="Customers"
                                    icon={Truck}
                                    recordCount={carrCustomers.length}
                                    refreshing={loadingCustomers}
                                    onRefresh={() => { if (selUnico) loadCustomers(selUnico, 1, true); }}
                                    headerRight={<AuditLogModal recordId={selUnico} disabled={!selUnico} bareButton />}
                                    className="flex-1 min-h-0 flex flex-col"
                                >
                                    <div className="overflow-auto flex-1" ref={customerScrollRef} onScroll={handleCustomerScroll}>
                                        <PanelGridTable>
                                            <PanelGridThead>
                                                <PanelGridTh>Customer</PanelGridTh>
                                                <PanelGridTh>Ship-To</PanelGridTh>
                                                <PanelGridTh className="hidden sm:table-cell">Account</PanelGridTh>
                                                <PanelGridTh className="hidden md:table-cell">Zone</PanelGridTh>
                                            </PanelGridThead>
                                            <PanelGridTbody>
                                                {carrCustomers.length === 0 ? (
                                                    <PanelGridTr><PanelGridTd className="text-center text-gray-400 py-6" colSpan={4}>{loadingCustomers ? "Loading..." : "No customers found"}</PanelGridTd></PanelGridTr>
                                                ) : carrCustomers.map((cust: any) => (
                                                    <PanelGridTr key={cust.unico}>
                                                        <PanelGridTd className="font-semibold max-w-[180px] truncate">{t(cust.customer_name)}</PanelGridTd>
                                                        <PanelGridTd className="max-w-[160px] truncate">{t(cust.shipto_name)}</PanelGridTd>
                                                        <PanelGridTd className="hidden sm:table-cell font-mono text-[10px]">{t(cust.account)}</PanelGridTd>
                                                        <PanelGridTd className="hidden md:table-cell">{t(cust.zone)}</PanelGridTd>
                                                    </PanelGridTr>
                                                ))}
                                            </PanelGridTbody>
                                        </PanelGridTable>
                                    </div>
                                </PanelGrid>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile FAB */}
            <button onClick={() => setMobileOpen(true)}
                className="lg:hidden fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#FB7506] hover:bg-orange-600 text-white shadow-lg flex items-center justify-center transition-all hover:scale-105">
                <Truck size={24} />
            </button>

            <AppFooter areaLabel="Masters" />

            {/* Mobile Carrier List Modal */}
            {mobileOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setMobileOpen(false)}>
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden"
                        onClick={e => e.stopPropagation()}>
                        <PanelGrid
                            title="Select Carrier"
                            icon={Truck}
                            searchValue={carrSearch}
                            onSearchChange={setCarrSearch}
                            searchPlaceholder="Search..."
                            recordCount={filteredList.length}
                            headerRight={
                                <button onClick={() => setMobileOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                                    <X size={16} />
                                </button>
                            }
                        >
                            <div className="overflow-y-auto flex-1">
                                {filteredList.length === 0 ? (
                                    <div className="p-6 text-center text-gray-400 text-sm">No carriers found</div>
                                ) : filteredList.map((c: any) => (
                                    <button key={c.unico} onClick={() => { const realIdx = list.findIndex((x: any) => x.unico === c.unico); loadCarrier(realIdx >= 0 ? realIdx : 0); setMobileOpen(false); }}
                                        className={cn("w-full flex items-center gap-2 px-4 py-3 text-left transition-colors border-b border-gray-50 last:border-b-0",
                                            list[currentIdx]?.unico === c.unico ? "bg-orange-50 text-[#FB7506] font-bold" : "text-gray-700 hover:bg-gray-50")}>
                                        <span className="text-[10px] text-gray-400 font-mono w-8 shrink-0">{c.carriercode}</span>
                                        <span className="text-sm truncate flex-1">{t(c.carrier)}</span>
                                        {c.isairline && <span className="text-[10px] text-blue-400 font-bold shrink-0">{"\u2708"}</span>}
                                    </button>
                                ))}
                            </div>
                        </PanelGrid>
                    </div>
                </div>
            )}

            {/* Other Settings Modal */}
            {othersModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm overflow-hidden">
                        <PanelGrid
                            title="Other Settings"
                            icon={Settings}
                            headerRight={
                                <button onClick={() => setOthersModal(false)} className="text-gray-400 hover:text-white transition-colors">
                                    <X size={16} />
                                </button>
                            }
                        >
                            <div className="p-4 space-y-4">
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input type="checkbox" checked={otherForm.internal_delivery} onChange={e => setOtherForm((p:any) => ({...p, internal_delivery: e.target.checked}))} className="accent-[#FB7506] w-4 h-4" />
                                    Internal Delivery
                                </label>
                                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                                    <button onClick={() => setOthersModal(false)} className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-800 transition-colors">Cancel</button>
                                    <button onClick={handleOthersSave} disabled={saving}
                                        className="flex items-center gap-1.5 bg-[#FB7506] hover:bg-orange-600 disabled:opacity-50 text-white px-4 py-2 rounded text-xs font-black uppercase tracking-wider transition-all">
                                        {saving ? <RefreshCcw size={14} className="animate-spin" /> : <Save size={14} />}{saving ? "Saving..." : "Save"}
                                    </button>
                                </div>
                            </div>
                        </PanelGrid>
                    </div>
                </div>
            )}
        </div>
    );
}
