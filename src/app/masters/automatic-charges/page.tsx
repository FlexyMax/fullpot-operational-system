"use client";

import { useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Plus, Pencil, Trash2, Users, Leaf, RefreshCcw,
    Tag, X, Save, ChevronRight, ChevronLeft, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuditLog } from "@/lib/audit";
import { usePagePermissions, PERMISSION_MSGS } from "@/lib/permissions";
import { AuditLogModal } from "@/components/AuditLogModal";
import AppHeader from "@/components/layout/AppHeader";
import AppFooter from "@/components/layout/AppFooter";
import PanelGrid from "@/components/ui/PanelGrid";
import {
    PanelGridTable, PanelGridThead, PanelGridTh,
    PanelGridTbody, PanelGridTr, PanelGridTd,
} from "@/components/ui/PanelGridTable";
import { useAutoChargesStore } from "@/store/useAutoChargesStore";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const EMPTY_ARR: any[] = [];
const t       = (v: any) => String(v ?? "").trim();
const fmt     = (v: any) => parseFloat(v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (v: any) => { if (!v) return "—"; const d = new Date(v); return isNaN(d.getTime()) ? t(v).slice(0,10) : d.toLocaleDateString("en-US", { month:"short", day:"2-digit", year:"numeric" }); };
const today   = () => new Date().toISOString().split("T")[0];
const PANTA   = "1E2123EC";

// ─── Shared modal shell ────────────────────────────────────────────────────────
function FosModal({ title, icon: Icon, onClose, children, footer, size = "md" }: any) {
    const widths: Record<string, string> = { sm:"max-w-md", md:"max-w-lg", lg:"max-w-2xl", xl:"max-w-4xl" };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2">
            <div className={cn("flex flex-col bg-white rounded-xl shadow-2xl w-full max-h-[94dvh]", widths[size])}>
                <div className="flex items-center gap-3 px-4 h-12 bg-[#374151] rounded-t-xl shrink-0">
                    {Icon && <Icon className="w-4 h-4 text-[#FB7506]" />}
                    <h2 className="text-sm font-bold text-white uppercase tracking-wide flex-1 truncate">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 min-h-0">{children}</div>
                {footer && <div className="flex items-center justify-end gap-2 px-4 py-3 border-t bg-gray-50 rounded-b-xl shrink-0">{footer}</div>}
            </div>
        </div>
    );
}
function SaveBtn({ saving, onClick }: any) {
    return (
        <button onClick={onClick} disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#FB7506] hover:bg-orange-600 text-white text-xs font-bold disabled:opacity-50 transition-colors">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? "Saving…" : "Save"}
        </button>
    );
}
function CancelBtn({ onClick }: any) {
    return (
        <button onClick={onClick} className="px-4 py-2 rounded-md border border-gray-300 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
            Cancel
        </button>
    );
}

// ─── Dual-list modal (shared by customers and growers) ─────────────────────────
interface DualListProps {
    chargeUnico: string;
    chargeDesc:  string;
    title:       string;
    icon:        any;
    baseUrl:     string;            // e.g. /api/masters/automatic-charges/UNICO/customers
    labelKey:    string;            // field to display in each row (e.g. "customer" or "grower")
    addAllLabel?: string;
    onClose:     () => void;
}
function DualListModal({ chargeUnico, chargeDesc, title, icon: Icon, baseUrl, labelKey, addAllLabel = "Add All", onClose }: DualListProps) {
    const qc = useQueryClient();
    const [selAvail,  setSelAvail]  = useState<any | null>(null);
    const [selAssign, setSelAssign] = useState<any | null>(null);
    const [qAvail,    setQAvail]    = useState("");
    const [qAssign,   setQAssign]   = useState("");
    const [saving,    setSaving]    = useState(false);
    const [error,     setError]     = useState<string | null>(null);

    const { data: available = EMPTY_ARR, refetch: refetchAvail, isFetching: fetchingAvail } = useQuery<any[]>({
        queryKey: [baseUrl, "not-in", qAvail],
        queryFn:  () => fetch(`${baseUrl}?type=not-in&q=${encodeURIComponent(qAvail)}`).then(r => r.json()),
        staleTime: 0,
    });
    const { data: assigned = EMPTY_ARR, refetch: refetchAssign, isFetching: fetchingAssign } = useQuery<any[]>({
        queryKey: [baseUrl, "in", qAssign],
        queryFn:  () => fetch(`${baseUrl}?type=in&q=${encodeURIComponent(qAssign)}`).then(r => r.json()),
        staleTime: 0,
    });

    const refetchBoth = useCallback(() => { refetchAvail(); refetchAssign(); setSelAvail(null); setSelAssign(null); }, []);

    const add = async () => {
        if (!selAvail || saving) return;
        setSaving(true); setError(null);
        try {
            const body = labelKey === "customer" ? { customer_uq: t(selAvail.unico) } : { grower_uq: t(selAvail.unico) };
            const res  = await fetch(baseUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
            const d    = await res.json();
            if (!d.success) throw new Error(d.error ?? "Error adding");
            refetchBoth();
        } catch (e: any) { setError(e.message); }
        finally { setSaving(false); }
    };

    const remove = async () => {
        if (!selAssign || saving) return;
        setSaving(true); setError(null);
        try {
            const res = await fetch(`${baseUrl}/${t(selAssign.unico)}`, { method: "DELETE" });
            const d   = await res.json();
            if (!d.success) throw new Error(d.error ?? "Error removing");
            refetchBoth();
        } catch (e: any) { setError(e.message); }
        finally { setSaving(false); }
    };

    const addAll = async () => {
        if (saving) return;
        toast(`Add ALL to "${chargeDesc}"?`, {
            action:  { label: "Confirm", onClick: async () => {
                setSaving(true); setError(null);
                try {
                    const res = await fetch(baseUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ insertAll: true }) });
                    const d   = await res.json();
                    if (!d.success) throw new Error(d.error ?? "Error adding all");
                    refetchBoth();
                    toast.success("All records added.");
                } catch (e: any) { setError(e.message); }
                finally { setSaving(false); }
            }},
            cancel:  { label: "Cancel", onClick: () => {} },
            duration: 8000,
        });
    };

    const Row = ({ row, sel, onSel }: any) => (
        <div onClick={() => onSel(sel?.unico === row.unico ? null : row)}
            className={cn("px-3 py-1.5 text-xs cursor-pointer select-none border-b border-gray-100 hover:bg-orange-50 transition-colors",
                sel?.unico === row.unico && "!bg-[#FB7506]/10 font-semibold text-[#FB7506]")}>
            {t(row[labelKey])}
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2">
            <div className="flex flex-col bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90dvh]">
                {/* Header */}
                <div className="flex items-center gap-3 px-4 h-12 bg-[#374151] rounded-t-xl shrink-0">
                    <Icon className="w-4 h-4 text-[#FB7506]" />
                    <h2 className="text-sm font-bold text-white uppercase tracking-wide flex-1 truncate">{title} — {chargeDesc}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
                </div>

                {/* Body */}
                <div className="flex flex-1 min-h-0 overflow-hidden">
                    {/* Available */}
                    <div className="flex flex-col flex-1 border-r min-h-0">
                        <div className="flex items-center justify-between px-3 h-8 bg-gray-100 border-b shrink-0">
                            <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">
                                Available ({available.length})
                            </span>
                            {fetchingAvail && <Loader2 className="w-3 h-3 animate-spin text-gray-400" />}
                        </div>
                        <div className="px-2 py-1.5 border-b shrink-0">
                            <input value={qAvail} onChange={e => setQAvail(e.target.value)} placeholder="Search…"
                                className="w-full text-xs border rounded px-2 h-7 outline-none focus:border-orange-400" />
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {available.map((r: any) => <Row key={r.unico} row={r} sel={selAvail} onSel={setSelAvail} />)}
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col items-center justify-center gap-2 w-16 px-1 shrink-0">
                        <button onClick={add} disabled={!selAvail || saving} title="Add selected"
                            className="w-8 h-8 rounded-full bg-green-500 hover:bg-green-600 disabled:opacity-40 text-white flex items-center justify-center transition-colors">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <button onClick={remove} disabled={!selAssign || saving} title="Remove selected"
                            className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white flex items-center justify-center transition-colors">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button onClick={addAll} disabled={saving} title={addAllLabel}
                            className="w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white flex items-center justify-center transition-colors text-[9px] font-bold">
                            ALL
                        </button>
                    </div>

                    {/* Assigned */}
                    <div className="flex flex-col flex-1 min-h-0">
                        <div className="flex items-center justify-between px-3 h-8 bg-gray-100 border-b shrink-0">
                            <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">
                                Assigned ({assigned.length})
                            </span>
                            {fetchingAssign && <Loader2 className="w-3 h-3 animate-spin text-gray-400" />}
                        </div>
                        <div className="px-2 py-1.5 border-b shrink-0">
                            <input value={qAssign} onChange={e => setQAssign(e.target.value)} placeholder="Search…"
                                className="w-full text-xs border rounded px-2 h-7 outline-none focus:border-orange-400" />
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {assigned.map((r: any) => <Row key={r.unico} row={r} sel={selAssign} onSel={setSelAssign} />)}
                        </div>
                    </div>
                </div>

                {/* Error + Footer */}
                {error && <p className="px-4 py-2 text-xs text-red-600 bg-red-50 border-t">{error}</p>}
                <div className="flex justify-end px-4 py-3 border-t bg-gray-50 rounded-b-xl shrink-0">
                    <button onClick={onClose} className="px-4 py-2 rounded-md border border-gray-300 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Add / Edit modal ──────────────────────────────────────────────────────────
function ChargeFormModal({ mode, charge, onClose, onSaved }: any) {
    const isEdit = mode === "edit";
    const blank  = { product_uq: "", start_date: today(), end_date: today(), unit_price: "0", porcentage: "0", fbox: true, active: true };
    const [form, setForm] = useState<any>(isEdit ? {
        product_uq: t(charge?.product_uq ?? charge?.PRODUCT_UQ ?? ""),
        start_date: t(charge?.startdate  ?? charge?.STARTDATE  ?? "").slice(0, 10) || today(),
        end_date:   t(charge?.enddate    ?? charge?.ENDDATE    ?? "").slice(0, 10) || today(),
        unit_price: String(parseFloat(charge?.unit_price ?? charge?.UNIT_PRICE ?? 0)),
        porcentage: String(parseFloat(charge?.porcentage ?? charge?.PORCENTAGE ?? 0)),
        fbox:       t(charge?.fbox    ?? charge?.FBOX    ?? "").toUpperCase() === "YES" || Boolean(charge?.fbox),
        active:     t(charge?.active_charge ?? charge?.ACTIVE_CHARGE ?? "").toUpperCase() === "YES" || true,
    } : blank);
    const [saving, setSaving] = useState(false);
    const [error,  setError]  = useState<string | null>(null);

    const { data: products = EMPTY_ARR } = useQuery<any[]>({
        queryKey: ["auto-charges-products"],
        queryFn:  () => fetch("/api/masters/automatic-charges/products").then(r => r.json()),
        staleTime: 60_000,
    });

    const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

    const handlePrice = (v: string) => {
        set("unit_price", v);
        if (parseFloat(v) > 0) set("porcentage", "0");
    };
    const handlePct = (v: string) => {
        set("porcentage", v);
        if (parseFloat(v) > 0) set("unit_price", "0");
    };

    const save = async () => {
        if (!form.product_uq)                       { setError("Product is required."); return; }
        if (!form.start_date || !form.end_date)     { setError("Start and End dates are required."); return; }
        if (form.start_date > form.end_date)        { setError("Start date must be ≤ End date."); return; }
        if (parseFloat(form.unit_price) === 0 && parseFloat(form.porcentage) === 0)
                                                    { setError("Enter a Unit Price or an Invoice %."); return; }
        setSaving(true); setError(null);
        try {
            const body = {
                product_uq: form.product_uq,
                start_date: form.start_date,
                end_date:   form.end_date,
                unit_price: parseFloat(form.unit_price) || 0,
                porcentage: parseFloat(form.porcentage) || 0,
                fbox:       form.fbox,
                active:     form.active,
            };
            const url    = isEdit ? `/api/masters/automatic-charges/${t(charge?.unico ?? charge?.UNICO)}` : "/api/masters/automatic-charges";
            const method = isEdit ? "PUT" : "POST";
            const res    = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
            const d      = await res.json();
            if (!d.success) throw new Error(d.error ?? "Error saving");
            toast.success(isEdit ? "Charge updated." : "Charge added.");
            onSaved();
            onClose();
        } catch (e: any) { setError(e.message); }
        finally { setSaving(false); }
    };

    const lbl = "text-[10px] font-black text-gray-500 uppercase tracking-wider";
    return (
        <FosModal title={isEdit ? "Edit Automatic Charge" : "Add Automatic Charge"} icon={Tag} onClose={onClose} size="sm"
            footer={<><CancelBtn onClick={onClose} /><SaveBtn saving={saving} onClick={save} /></>}>
            {error && <p className="mb-3 text-xs text-red-600 font-semibold bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>}
            <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Product */}
                <div className="col-span-2 flex flex-col gap-0.5">
                    <label className={lbl}>Product *</label>
                    <select value={form.product_uq} onChange={e => set("product_uq", e.target.value)} className="fos-input h-10 sm:h-9">
                        <option value="">— Select Product —</option>
                        {(products as any[]).map((p: any) => (
                            <option key={t(p.unico)} value={t(p.unico)}>
                                {t(p.old_code) ? `[${t(p.old_code)}] ` : ""}{t(p.description)}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Dates */}
                <div className="flex flex-col gap-0.5">
                    <label className={lbl}>Start Date *</label>
                    <input type="date" value={form.start_date} onChange={e => set("start_date", e.target.value)} className="fos-input h-10 sm:h-9" />
                </div>
                <div className="flex flex-col gap-0.5">
                    <label className={lbl}>End Date *</label>
                    <input type="date" value={form.end_date} onChange={e => set("end_date", e.target.value)} className="fos-input h-10 sm:h-9" />
                </div>

                {/* Price / % — mutually exclusive */}
                <div className="flex flex-col gap-0.5">
                    <label className={lbl}>Unit Price</label>
                    <input type="text" inputMode="decimal" value={form.unit_price}
                        onChange={e => handlePrice(e.target.value)} className="fos-input h-10 sm:h-9" />
                </div>
                <div className="flex flex-col gap-0.5">
                    <label className={lbl}>Invoice %</label>
                    <input type="text" inputMode="decimal" value={form.porcentage}
                        onChange={e => handlePct(e.target.value)} className="fos-input h-10 sm:h-9" />
                </div>

                {/* Checkboxes */}
                <div className="flex items-center gap-2 pt-1">
                    <input type="checkbox" id="fbox" checked={Boolean(form.fbox)} onChange={e => set("fbox", e.target.checked)} className="accent-[#FB7506] w-4 h-4" />
                    <label htmlFor="fbox" className="text-xs font-semibold cursor-pointer">Per Full Box (FB)</label>
                </div>
                <div className="flex items-center gap-2 pt-1">
                    <input type="checkbox" id="active" checked={Boolean(form.active)} onChange={e => set("active", e.target.checked)} className="accent-[#FB7506] w-4 h-4" />
                    <label htmlFor="active" className="text-xs font-semibold cursor-pointer">Active</label>
                </div>
            </div>
        </FosModal>
    );
}

// ─── Delete confirmation modal ─────────────────────────────────────────────────
function DeleteModal({ charge, onClose, onDeleted }: any) {
    const [saving, setSaving] = useState(false);

    const confirm = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/masters/automatic-charges/${t(charge.unico ?? charge.UNICO)}`, { method: "DELETE" });
            const d   = await res.json();
            if (!d.success) throw new Error(d.error ?? "Error deleting");
            toast.success("Charge deleted.");
            onDeleted();
            onClose();
        } catch (e: any) { toast.error((e as any).message); setSaving(false); }
    };

    return (
        <FosModal title="Delete Charge Template" icon={Trash2} onClose={onClose} size="sm"
            footer={<>
                <CancelBtn onClick={onClose} />
                <button onClick={confirm} disabled={saving}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-bold disabled:opacity-50 transition-colors">
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    {saving ? "Deleting…" : "Delete"}
                </button>
            </>}>
            <p className="text-sm text-gray-700">
                Delete charge <span className="font-bold text-[#FB7506]">{t(charge.description ?? charge.DESCRIPTION)}</span>?
                <br />
                <span className="text-xs text-gray-500 mt-1 block">This will also remove all customer and vendor assignments.</span>
            </p>
        </FosModal>
    );
}

// ─── Badges ───────────────────────────────────────────────────────────────────
function YesNoBadge({ value }: { value: string | boolean }) {
    const isYes = typeof value === "boolean" ? value : t(value).toUpperCase() === "YES";
    return (
        <span className={cn("inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold",
            isYes ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>
            {isYes ? "YES" : "NO"}
        </span>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AutomaticChargesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const perms  = usePagePermissions("automatic-charges");
    const store  = useAutoChargesStore();
    useAuditLog("automatic-charges", "flower_invoice_automatic_charges_template");
    const qc     = useQueryClient();

    if (status === "unauthenticated") { router.replace("/login"); return null; }

    const [modal,    setModal]    = useState<"add" | "edit" | "delete" | null>(null);
    const [custModal, setCustModal] = useState(false);
    const [growModal, setGrowModal] = useState(false);

    const { data: charges = EMPTY_ARR, isFetching, refetch } = useQuery<any[]>({
        queryKey: ["auto-charges", store.searchKey],
        queryFn:  () => fetch("/api/masters/automatic-charges").then(r => r.json()),
        staleTime: 0,
    });

    const selRow    = store.selRow;
    const selUnico  = t(selRow?.unico ?? selRow?.UNICO ?? "");
    const selDesc   = t(selRow?.description ?? selRow?.DESCRIPTION ?? "");

    const onSaved = () => { store.triggerSearch(); };

    const menuItems = [
        {
            label: "Add Charge", icon: Plus,
            onClick: () => {
                if (!perms.canCreate) return toast.error(PERMISSION_MSGS.create);
                setModal("add");
            },
        },
        {
            label: "Edit", icon: Pencil,
            onClick: () => {
                if (!selRow) return toast.error("Select a charge first.");
                if (!perms.canEdit) return toast.error(PERMISSION_MSGS.edit);
                setModal("edit");
            },
            disabled: !selRow,
        },
        {
            label: "Delete", icon: Trash2,
            onClick: () => {
                if (!selRow) return toast.error("Select a charge first.");
                if (!perms.canDelete) return toast.error(PERMISSION_MSGS.delete);
                setModal("delete");
            },
            disabled: !selRow,
        },
        {
            label: "Manage Customers", icon: Users,
            onClick: () => {
                if (!selRow) return toast.error("Select a charge first.");
                setCustModal(true);
            },
            disabled: !selRow,
        },
        {
            label: "Manage Vendors", icon: Leaf,
            onClick: () => {
                if (!selRow) return toast.error("Select a charge first.");
                setGrowModal(true);
            },
            disabled: !selRow,
        },
    ];

    return (
        <div className="flex flex-col h-dvh bg-gray-50">
            <AppHeader title="Invoice Automatic Charges" icon={Tag} showBack backHref="/menu" />

            <main className="flex-1 min-h-0 p-3 sm:p-4 flex flex-col">
                <PanelGrid
                    title="Charge Templates"
                    icon={Tag}
                    recordCount={charges.length}
                    onRefresh={() => store.triggerSearch()}
                    headerRight={
                        <AuditLogModal recordId={selUnico || null} />
                    }
                    menuItems={menuItems}
                    className="flex-1 min-h-0"
                >
                    <PanelGridTable>
                        <PanelGridThead>
                            <tr>
                                <PanelGridTh>Active</PanelGridTh>
                                <PanelGridTh>Product</PanelGridTh>
                                <PanelGridTh>Code</PanelGridTh>
                                <PanelGridTh>Start</PanelGridTh>
                                <PanelGridTh>End</PanelGridTh>
                                <PanelGridTh className="text-right">U.Price</PanelGridTh>
                                <PanelGridTh className="text-right">Invoice%</PanelGridTh>
                                <PanelGridTh>Per FB</PanelGridTh>
                                <PanelGridTh>Prod.Active</PanelGridTh>
                            </tr>
                        </PanelGridThead>
                        <PanelGridTbody>
                            {isFetching && charges.length === 0 ? (
                                <tr><td colSpan={9} className="py-8 text-center text-xs text-gray-400">
                                    <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1" /> Loading…
                                </td></tr>
                            ) : charges.length === 0 ? (
                                <tr><td colSpan={9} className="py-8 text-center text-xs text-gray-400">No charge templates found.</td></tr>
                            ) : (charges as any[]).map((row: any) => {
                                const isSelected = t(row.unico) === selUnico;
                                return (
                                    <PanelGridTr key={t(row.unico)}
                                        onClick={() => store.setSelRow(isSelected ? null : row)}
                                        className={isSelected ? "!bg-[#FB7506]/10" : ""}>
                                        <PanelGridTd><YesNoBadge value={row.active_charge} /></PanelGridTd>
                                        <PanelGridTd className="font-medium max-w-[200px] truncate">{t(row.description)}</PanelGridTd>
                                        <PanelGridTd className="text-[#FB7506] font-mono font-bold">{t(row.old_code)}</PanelGridTd>
                                        <PanelGridTd>{fmtDate(row.startdate)}</PanelGridTd>
                                        <PanelGridTd>{fmtDate(row.enddate)}</PanelGridTd>
                                        <PanelGridTd className="text-right font-mono">
                                            {parseFloat(row.unit_price) > 0 ? `$${fmt(row.unit_price)}` : "—"}
                                        </PanelGridTd>
                                        <PanelGridTd className="text-right font-mono">
                                            {parseFloat(row.porcentage) > 0 ? `${parseFloat(row.porcentage)}%` : "—"}
                                        </PanelGridTd>
                                        <PanelGridTd><YesNoBadge value={row.fbox} /></PanelGridTd>
                                        <PanelGridTd><YesNoBadge value={row.active_product} /></PanelGridTd>
                                    </PanelGridTr>
                                );
                            })}
                        </PanelGridTbody>
                    </PanelGridTable>
                </PanelGrid>
            </main>

            <AppFooter />

            {/* Modals */}
            {modal === "add" && (
                <ChargeFormModal mode="add" onClose={() => setModal(null)} onSaved={onSaved} />
            )}
            {modal === "edit" && selRow && (
                <ChargeFormModal mode="edit" charge={selRow} onClose={() => setModal(null)} onSaved={onSaved} />
            )}
            {modal === "delete" && selRow && (
                <DeleteModal charge={selRow} onClose={() => setModal(null)} onDeleted={onSaved} />
            )}
            {custModal && selRow && (
                <DualListModal
                    chargeUnico={selUnico}
                    chargeDesc={selDesc}
                    title="Manage Customers"
                    icon={Users}
                    baseUrl={`/api/masters/automatic-charges/${selUnico}/customers`}
                    labelKey="customer"
                    addAllLabel="Add All Customers"
                    onClose={() => setCustModal(false)}
                />
            )}
            {growModal && selRow && (
                <DualListModal
                    chargeUnico={selUnico}
                    chargeDesc={selDesc}
                    title="Manage Vendors"
                    icon={Leaf}
                    baseUrl={`/api/masters/automatic-charges/${selUnico}/growers`}
                    labelKey="grower"
                    addAllLabel="Add All Vendors"
                    onClose={() => setGrowModal(false)}
                />
            )}
        </div>
    );
}
