"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    ArrowLeft, RefreshCcw, Search, XCircle, Save, X, Trash2,
    Plus, Pencil, Printer, BarChart2, Calendar, Plane, FileText,
    Package, DollarSign, ChevronDown, Loader2, AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const t       = (v: any) => String(v ?? "").trim();
const fmt     = (v: any) => parseFloat(v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (v: any) => { if (!v) return ""; const d = new Date(v); return isNaN(d.getTime()) ? t(v) : d.toLocaleDateString("en-US"); };
const today   = () => new Date().toISOString().split("T")[0];

const toastConfirm = (message: string, onConfirm: () => void) => {
    toast(message, {
        duration: 10000,
        action:  { label: "Confirm", onClick: onConfirm },
        cancel:  { label: "Cancel",  onClick: () => {} },
    });
};

const awbFetch = async (url: string) => {
    const r = await fetch(url);
    const j = await r.json();
    if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`);
    return j;
};

// ─── Modal wrapper ─────────────────────────────────────────────────────────────
function Modal({ title, icon: Icon, onClose, children, footer, size = "md", error }: any) {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 sm:p-4">
            <div className={cn(
                "bg-white rounded-t-xl sm:rounded-xl shadow-2xl w-full flex flex-col h-[85vh] sm:h-auto sm:max-h-[88vh]",
                size === "sm"  ? "sm:max-w-lg"  :
                size === "lg"  ? "sm:max-w-3xl" :
                size === "xl"  ? "sm:max-w-5xl" : "sm:max-w-2xl"
            )}>
                <div className="h-10 bg-[#374151] rounded-t-xl flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-2">
                        {Icon && <Icon size={15} className="text-[#FB7506]"/>}
                        <span className="fos-grid-header-text truncate">{title}</span>
                        {error && <span className="text-amber-400 text-[10px] font-bold ml-2 truncate">{error}</span>}
                    </div>
                    <button onClick={onClose}><XCircle size={16} className="text-gray-400 hover:text-white"/></button>
                </div>
                <div className="overflow-y-auto flex-1 p-4">{children}</div>
                {footer && <div className="flex justify-end gap-2 px-4 py-3 bg-gray-50 border-t rounded-b-xl shrink-0">{footer}</div>}
            </div>
        </div>
    );
}

function Btn({ icon: Icon, label, color = "gray", onClick, disabled = false }: any) {
    const cls: Record<string, string> = {
        green:  "bg-green-600 hover:bg-green-700",
        blue:   "bg-blue-600 hover:bg-blue-700",
        red:    "bg-red-600 hover:bg-red-700",
        gray:   "bg-gray-600 hover:bg-gray-700",
        amber:  "bg-amber-500 hover:bg-amber-600",
        orange: "bg-[#FB7506] hover:bg-orange-600",
        teal:   "bg-teal-600 hover:bg-teal-700",
    };
    return (
        <button onClick={onClick} disabled={disabled}
            className={cn("flex items-center gap-1.5 px-3 py-1.5 text-xs text-white font-black uppercase tracking-wide rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0", cls[color] || cls.gray)}>
            {Icon && <Icon size={13}/>}{label}
        </button>
    );
}

// ─── Modal 1: AwbsChargesModal — Add / Edit charge by AWB ────────────────────
function AwbsChargesModal({ mode, charge, awbcode, onClose, onSaved }: any) {
    const isEdit = mode === "edit";
    const [form, setForm] = useState<any>(isEdit ? {
        supplier_uq:  charge?.SUPPLIER_UQ ?? "",
        ap_type_uq:   charge?.AP_TYPE_UQ  ?? "",
        duties:       charge?.DUTIES      ?? 0,
        o_charges:    charge?.O_CHARGES   ?? 0,
        apply_from:   charge?.APPLY_FROM?.split("T")[0] ?? "",
        apply_to:     charge?.APPLY_TO?.split("T")[0]   ?? "",
        charge_date:  charge?.AWC_DATE?.split("T")[0]   ?? today(),
        invoice_no:   charge?.INVOICE_NO  ?? "",
        description:  charge?.DESCRIPTION ?? "",
    } : {
        supplier_uq: "", ap_type_uq: "", duties: 0, o_charges: 0,
        apply_from: "", apply_to: "", charge_date: today(), invoice_no: "", description: "",
    });
    const [saving, setSaving] = useState(false);
    const [error,  setError]  = useState<string | null>(null);

    const { data: suppliers  = [] } = useQuery({ queryKey: ["awb-suppliers"],    queryFn: () => awbFetch("/api/awbs/lookups/suppliers"),    staleTime: 60000, select: (d: any) => d.records ?? [] });
    const { data: chargeTypes = [] } = useQuery({ queryKey: ["awb-chargetypes"], queryFn: () => awbFetch("/api/awbs/lookups/charge-types"), staleTime: 60000, select: (d: any) => d.records ?? [] });

    const F = (key: string, num = false) => num
        ? { type: "number", step: "0.01", value: form[key] ?? 0, onChange: (e: any) => setForm((p: any) => ({ ...p, [key]: parseFloat(e.target.value) || 0 })) }
        : { value: form[key] ?? "", onChange: (e: any) => setForm((p: any) => ({ ...p, [key]: e.target.value })) };

    const save = async () => {
        if (!form.supplier_uq) { setError("Supplier is required."); return; }
        if (!form.ap_type_uq)  { setError("Charge type is required."); return; }
        if (!form.invoice_no)  { setError("Invoice is required."); return; }
        setSaving(true); setError(null);
        try {
            const body = { ...form, awbcode };
            const url  = isEdit ? `/api/awbs/charges/${charge.UNICO}` : "/api/awbs/charges";
            const res  = await fetch(url, { method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
            const d    = await res.json();
            if (!d.success) throw new Error(d.error);
            toast.success(isEdit ? "Charge updated." : "Charge added.");
            onSaved();
            onClose();
        } catch (e: any) { setError(e.message); }
        finally { setSaving(false); }
    };

    return (
        <Modal title={`${isEdit ? "Edit" : "Add"} AWB Charge — ${awbcode}`} icon={DollarSign} onClose={onClose} size="sm" error={error}
            footer={<>
                <button onClick={onClose} className="px-4 py-2 rounded border text-sm font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
                <button onClick={save} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded bg-[#FB7506] hover:bg-orange-600 text-white text-sm font-black disabled:opacity-50">
                    {saving ? <RefreshCcw size={13} className="animate-spin"/> : <Save size={13}/>}{saving ? "Saving..." : "OK"}
                </button>
            </>}>
            <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="col-span-2 flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Supplier *</label>
                    <select {...F("supplier_uq")} className="fos-input py-1">
                        <option value="">— Select Supplier —</option>
                        {(suppliers as any[]).map((s: any) => <option key={s.UNICO ?? s.unico} value={s.UNICO ?? s.unico}>{t(s.GROWER ?? s.grower ?? s.SUPPLIER ?? s.supplier)}</option>)}
                    </select>
                </div>
                <div className="col-span-2 flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Charge Type *</label>
                    <select {...F("ap_type_uq")} className="fos-input py-1">
                        <option value="">— Select Type —</option>
                        {(chargeTypes as any[]).map((c: any) => <option key={c.UNICO ?? c.unico} value={c.UNICO ?? c.unico}>{t(c.DESCRIPTION ?? c.description)}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Duties</label>
                    <input {...F("duties", true)} className="fos-input py-1"/>
                </div>
                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">O. Charges</label>
                    <input {...F("o_charges", true)} className="fos-input py-1"/>
                </div>
                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Apply From</label>
                    <input type="date" {...F("apply_from")} className="fos-input py-1"/>
                </div>
                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Apply To</label>
                    <input type="date" {...F("apply_to")} className="fos-input py-1"/>
                </div>
                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Charge Date</label>
                    <input type="date" {...F("charge_date")} className="fos-input py-1"/>
                </div>
                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Invoice No. *</label>
                    <input {...F("invoice_no")} className="fos-input py-1"/>
                </div>
                <div className="col-span-2 flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Description</label>
                    <input {...F("description")} className="fos-input py-1"/>
                </div>
            </div>
        </Modal>
    );
}

// ─── Modal 2: AwbsFreightsModal — Add / Edit charge by date ──────────────────
function AwbsFreightsModal({ mode, charge, awbcode, airline, onClose, onSaved }: any) {
    const isEdit = mode === "edit";
    const [form, setForm] = useState<any>(isEdit ? {
        ap_type_uq:   charge?.AP_TYPE_UQ    ?? "",
        supplier_uq:  charge?.SUPPLIER_UQ   ?? "",
        freight:      charge?.OCHARGES      ?? 0,
        total_box:    charge?.TOTAL_BOX     ?? 0,
        full_boxes:   0,
        weight:       0,
        invoice_no:   charge?.INVOICE_NO    ?? "",
        invoice_date: charge?.CHARGE_DATE?.split("T")[0] ?? today(),
        notes:        charge?.NOTES         ?? "",
        apply_from:   charge?.APPLY_FROM?.split("T")[0]  ?? "",
        apply_to:     charge?.APPLY_TO?.split("T")[0]    ?? "",
    } : {
        ap_type_uq: "", supplier_uq: "", freight: 0, total_box: 0, full_boxes: 0,
        weight: 0, invoice_no: "", invoice_date: today(), notes: "", apply_from: "", apply_to: "",
    });
    const [saving, setSaving] = useState(false);
    const [error,  setError]  = useState<string | null>(null);

    const { data: suppliers   = [] } = useQuery({ queryKey: ["awb-suppliers"],        queryFn: () => awbFetch("/api/awbs/lookups/suppliers"),         staleTime: 60000, select: (d: any) => d.records ?? [] });
    const { data: chargeTypes = [] } = useQuery({ queryKey: ["awb-chargetypes-date"], queryFn: () => awbFetch("/api/awbs/lookups/charge-types-date"), staleTime: 60000, select: (d: any) => d.records ?? [] });

    const F = (key: string, num = false) => num
        ? { type: "number", step: "0.01", value: form[key] ?? 0, onChange: (e: any) => setForm((p: any) => ({ ...p, [key]: parseFloat(e.target.value) || 0 })) }
        : { value: form[key] ?? "", onChange: (e: any) => setForm((p: any) => ({ ...p, [key]: e.target.value })) };

    const save = async () => {
        if (!form.ap_type_uq)  { setError("Charge type is required."); return; }
        if (!form.supplier_uq) { setError("Supplier is required."); return; }
        if (!form.freight)     { setError("Amount is required."); return; }
        if (!form.invoice_no)  { setError("Invoice is required."); return; }
        if (!form.invoice_date){ setError("Invoice date is required."); return; }
        setSaving(true); setError(null);
        try {
            const url = isEdit ? `/api/awbs/charges-by-date/${charge.UNICO}` : "/api/awbs/charges-by-date";
            const res = await fetch(url, { method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
            const d   = await res.json();
            if (!d.success) throw new Error(d.error);
            toast.success(isEdit ? "Freight charge updated." : "Freight charge added.");
            onSaved();
            onClose();
        } catch (e: any) { setError(e.message); }
        finally { setSaving(false); }
    };

    return (
        <Modal title={`${isEdit ? "Edit" : "Add"} AWB Freight Charge`} icon={Plane} onClose={onClose} size="sm" error={error}
            footer={<>
                <button onClick={onClose} className="px-4 py-2 rounded border text-sm font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
                <button onClick={save} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded bg-[#FB7506] hover:bg-orange-600 text-white text-sm font-black disabled:opacity-50">
                    {saving ? <RefreshCcw size={13} className="animate-spin"/> : <Save size={13}/>}{saving ? "Saving..." : "OK"}
                </button>
            </>}>
            <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="col-span-2 flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Charge *</label>
                    <select {...F("ap_type_uq")} className="fos-input py-1">
                        <option value="">— Select Charge —</option>
                        {(chargeTypes as any[]).map((c: any) => <option key={c.UNICO ?? c.unico} value={c.UNICO ?? c.unico}>{t(c.DESCRIPTION ?? c.description)}</option>)}
                    </select>
                </div>
                <div className="col-span-2 flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Supplier *</label>
                    <select {...F("supplier_uq")} className="fos-input py-1">
                        <option value="">— Select Supplier —</option>
                        {(suppliers as any[]).map((s: any) => <option key={s.UNICO ?? s.unico} value={s.UNICO ?? s.unico}>{t(s.GROWER ?? s.grower ?? s.SUPPLIER ?? s.supplier)}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Amount *</label>
                    <input {...F("freight", true)} className="fos-input py-1"/>
                </div>
                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Total Boxes</label>
                    <input {...F("total_box", true)} className="fos-input py-1"/>
                </div>
                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Full Boxes</label>
                    <input {...F("full_boxes", true)} className="fos-input py-1"/>
                </div>
                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Weight</label>
                    <input {...F("weight", true)} className="fos-input py-1"/>
                </div>
                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Invoice *</label>
                    <input {...F("invoice_no")} className="fos-input py-1"/>
                </div>
                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Invoice Date *</label>
                    <input type="date" {...F("invoice_date")} className="fos-input py-1"/>
                </div>
                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Apply From</label>
                    <input type="date" {...F("apply_from")} className="fos-input py-1"/>
                </div>
                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Apply To</label>
                    <input type="date" {...F("apply_to")} className="fos-input py-1"/>
                </div>
                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Airline</label>
                    <input readOnly value={airline ?? ""} className="fos-input py-1 bg-gray-50 text-gray-500"/>
                </div>
                <div className="col-span-2 flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Notes / Comments</label>
                    <textarea {...F("notes")} rows={2} className="fos-input py-1 resize-none"/>
                </div>
            </div>
        </Modal>
    );
}

// ─── Modal 3: AwbsInvoiceChargesModal ────────────────────────────────────────
function AwbsInvoiceChargesModal({ packUq, awbcode, onClose, onSaved }: any) {
    const [selCharge, setSelCharge] = useState<any>(null);
    const [editMode,  setEditMode]  = useState<"add" | "edit" | null>(null);
    const [form, setForm] = useState<any>({ ap_type_uq: "", supplier_uq: "", freight: 0, total_boxes: 0, full_boxes: 0, weight: 0, description: "", invoice_no: "", invoice_date: today(), notes: "", grower_all: false });
    const [saving, setSaving] = useState(false);
    const [error,  setError]  = useState<string | null>(null);
    const qc = useQueryClient();

    const { data: suppliers   = [] } = useQuery({ queryKey: ["awb-suppliers"],    queryFn: () => awbFetch("/api/awbs/lookups/suppliers"),    staleTime: 60000, select: (d: any) => d.records ?? [] });
    const { data: chargeTypes = [] } = useQuery({ queryKey: ["awb-chargetypes"], queryFn: () => awbFetch("/api/awbs/lookups/charge-types"), staleTime: 60000, select: (d: any) => d.records ?? [] });
    const { data: charges = [], isFetching } = useQuery({
        queryKey: ["awb-invoice-charges", packUq],
        queryFn:  () => awbFetch(`/api/awbs/invoice-charges?pack_uq=${encodeURIComponent(packUq)}`),
        enabled:  !!packUq,
        select:   (d: any) => d.records ?? [],
    });

    const F = (key: string, num = false) => num
        ? { type: "number", step: "0.01", value: form[key] ?? 0, onChange: (e: any) => setForm((p: any) => ({ ...p, [key]: parseFloat(e.target.value) || 0 })) }
        : { value: form[key] ?? "", onChange: (e: any) => setForm((p: any) => ({ ...p, [key]: e.target.value })) };

    const openAdd = () => {
        setForm({ ap_type_uq: "", supplier_uq: "", freight: 0, total_boxes: 0, full_boxes: 0, weight: 0, description: "", invoice_no: "", invoice_date: today(), notes: "", grower_all: false });
        setSelCharge(null);
        setEditMode("add");
        setError(null);
    };

    const openEdit = (row: any) => {
        setForm({
            ap_type_uq:   row.AP_TYPE_UQ   ?? "",
            supplier_uq:  row.SUPPLIER_UQ  ?? "",
            freight:      row.FREIGHT      ?? 0,
            total_boxes:  row.TOTAL_BOXES  ?? 0,
            full_boxes:   row.FULL_BOXES   ?? 0,
            weight:       row.TOTAL_WEIGHT ?? 0,
            description:  row.DESCRIPTION  ?? "",
            invoice_no:   row.INVOICE_NO   ?? "",
            invoice_date: row.INVOICE_DATE?.split("T")[0] ?? today(),
            notes:        "",
            grower_all:   false,
        });
        setSelCharge(row);
        setEditMode("edit");
        setError(null);
    };

    const loadTemplate = async () => {
        try {
            const d = await awbFetch(`/api/awbs/template/${encodeURIComponent(awbcode)}`);
            if (d.records?.length) toast.success(`Template loaded: ${d.records.length} records.`);
            qc.invalidateQueries({ queryKey: ["awb-invoice-charges", packUq] });
        } catch (e: any) { toast.error(e.message); }
    };

    const save = async () => {
        if (!form.ap_type_uq)  { setError("Charge type is required."); return; }
        if (!form.supplier_uq) { setError("Supplier is required."); return; }
        if (!form.invoice_no)  { setError("Invoice is required."); return; }
        setSaving(true); setError(null);
        try {
            const body = { ...form, pack_uq: packUq, awbcode };
            const url  = editMode === "edit" ? `/api/awbs/invoice-charges/${selCharge.UNICO}` : "/api/awbs/invoice-charges";
            const res  = await fetch(url, { method: editMode === "edit" ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
            const d    = await res.json();
            if (!d.success) throw new Error(d.error);
            toast.success("Invoice charge saved.");
            qc.invalidateQueries({ queryKey: ["awb-invoice-charges", packUq] });
            setEditMode(null);
        } catch (e: any) { setError(e.message); }
        finally { setSaving(false); }
    };

    const del = async (row: any) => {
        toastConfirm(`Delete charge ${t(row.UNICO)}?`, async () => {
            try {
                const res = await fetch(`/api/awbs/invoice-charges/${row.UNICO}`, { method: "DELETE" });
                const d   = await res.json();
                if (!d.success) throw new Error(d.error);
                toast.success("Charge deleted.");
                qc.invalidateQueries({ queryKey: ["awb-invoice-charges", packUq] });
            } catch (e: any) { toast.error((e as any).message); }
        });
    };

    return (
        <Modal title={`AWB Invoice Charges — ${awbcode}`} icon={FileText} onClose={onClose} size="xl" error={error}
            footer={<>
                <button onClick={onClose} className="px-4 py-2 rounded border text-sm font-bold text-gray-600 hover:bg-gray-100">Close</button>
                {editMode && <button onClick={save} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded bg-[#FB7506] hover:bg-orange-600 text-white text-sm font-black disabled:opacity-50">
                    {saving ? <RefreshCcw size={13} className="animate-spin"/> : <Save size={13}/>}{saving ? "Saving..." : "OK"}
                </button>}
            </>}>
            <div className="flex gap-4 h-full min-h-0">
                {/* Left: form */}
                <div className="w-72 shrink-0 space-y-2 text-xs border-r pr-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[9px] font-black text-gray-400 uppercase">AWBCode:</span>
                        <span className="font-bold text-[#FB7506]">{awbcode}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase">Charge *</label>
                        <select value={form.ap_type_uq} onChange={e => setForm((p: any) => ({ ...p, ap_type_uq: e.target.value }))} className="fos-input py-1">
                            <option value="">— Select —</option>
                            {(chargeTypes as any[]).map((c: any) => <option key={c.UNICO ?? c.unico} value={c.UNICO ?? c.unico}>{t(c.DESCRIPTION ?? c.description)}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase">Supplier *</label>
                        <select value={form.supplier_uq} onChange={e => setForm((p: any) => ({ ...p, supplier_uq: e.target.value }))} className="fos-input py-1">
                            <option value="">— Select —</option>
                            {(suppliers as any[]).map((s: any) => <option key={s.UNICO ?? s.unico} value={s.UNICO ?? s.unico}>{t(s.GROWER ?? s.grower ?? s.SUPPLIER ?? s.supplier)}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase">Amount</label>
                        <input type="number" step="0.01" value={form.freight} onChange={e => setForm((p: any) => ({ ...p, freight: parseFloat(e.target.value) || 0 }))} className="fos-input py-1"/>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase">Invoice *</label>
                        <input value={form.invoice_no} onChange={e => setForm((p: any) => ({ ...p, invoice_no: e.target.value }))} className="fos-input py-1"/>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase">Invoice Date</label>
                        <input type="date" value={form.invoice_date} onChange={e => setForm((p: any) => ({ ...p, invoice_date: e.target.value }))} className="fos-input py-1"/>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase">Notes</label>
                        <textarea value={form.notes} onChange={e => setForm((p: any) => ({ ...p, notes: e.target.value }))} rows={2} className="fos-input py-1 resize-none"/>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={!!form.grower_all} onChange={e => setForm((p: any) => ({ ...p, grower_all: e.target.checked }))} className="w-4 h-4 accent-[#FB7506]"/>
                        <span className="text-xs font-semibold text-gray-600">All AWB Grower Invoices</span>
                    </label>
                    <div className="flex gap-2 pt-1">
                        <Btn icon={Plus}     label="Add"      color="green" onClick={openAdd}/>
                        <Btn icon={FileText} label="Template" color="teal"  onClick={loadTemplate}/>
                    </div>
                </div>
                {/* Right: grid */}
                <div className="flex-1 min-w-0 overflow-auto">
                    {isFetching ? <div className="flex items-center gap-2 text-gray-400 text-xs p-4"><Loader2 size={14} className="animate-spin"/>Loading...</div> : (
                        <table className="min-w-full text-left text-xs">
                            <thead className="bg-gray-100 border-b fos-grid-thead text-gray-700 sticky top-0">
                                <tr>{["AWBCode","Type","Date","Supplier","Freight","Boxes","Description","Invoice","Inv.Date","Actions"].map(h => <th key={h} className="p-2 border-r border-gray-200 last:border-r-0 whitespace-nowrap">{h}</th>)}</tr>
                            </thead>
                            <tbody className="fos-grid-tbody divide-y divide-gray-100">
                                {(charges as any[]).map((row: any) => (
                                    <tr key={row.UNICO} onClick={() => openEdit(row)}
                                        className={cn("cursor-pointer transition-colors", selCharge?.UNICO === row.UNICO ? "!bg-blue-50 ring-1 ring-inset ring-blue-200" : "hover:bg-gray-50")}>
                                        <td className="p-2 font-bold">{t(row.AWBCODE)}</td>
                                        <td className="p-2">{t(row.AP_TYPE_UQ)}</td>
                                        <td className="p-2 whitespace-nowrap">{fmtDate(row.AWC_DATE)}</td>
                                        <td className="p-2">{t(row.SUPPLIER_UQ)}</td>
                                        <td className="p-2 text-right">{fmt(row.FREIGHT)}</td>
                                        <td className="p-2 text-right">{row.TOTAL_BOXES}</td>
                                        <td className="p-2">{t(row.DESCRIPTION)}</td>
                                        <td className="p-2">{t(row.INVOICE_NO)}</td>
                                        <td className="p-2 whitespace-nowrap">{fmtDate(row.INVOICE_DATE)}</td>
                                        <td className="p-2">
                                            <button onClick={e => { e.stopPropagation(); del(row); }}
                                                className="text-red-500 hover:text-red-700"><Trash2 size={13}/></button>
                                        </td>
                                    </tr>
                                ))}
                                {!(charges as any[]).length && <tr><td colSpan={10} className="p-4 text-center text-gray-400">No records</td></tr>}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </Modal>
    );
}

// ─── Modal 4: AwbsBoxesModal — Inventory Entry ───────────────────────────────
function AwbsBoxesModal({ box, onClose, onSaved }: any) {
    const [form, setForm] = useState<any>({
        awbcode:     box?.AWBCODE    ?? "",
        description: box?.LOTE       ?? "",
        price:       parseFloat(box?.F_COST_X_U   ?? 0),
        f_cost_x_u:  parseFloat(box?.F_COST_X_U   ?? 0),
        c_cost_x_u:  parseFloat(box?.F_FCOST_X_U  ?? 0),
        t_charges:   0,
        flower_cost: 0,
        units_x_box: parseFloat(box?.TOTAL_UNITS  ?? 0),
        box_qty:     parseFloat(box?.BOX_QTY       ?? 0),
        lote:        parseFloat(box?.LOTE          ?? 0),
        combo_awb:   box?.AWBCODE    ?? "",
    });
    const [saving, setSaving] = useState(false);
    const [error,  setError]  = useState<string | null>(null);

    const F = (key: string, num = false) => num
        ? { type: "number", step: "0.01", value: form[key] ?? 0, onChange: (e: any) => setForm((p: any) => ({ ...p, [key]: parseFloat(e.target.value) || 0 })) }
        : { value: form[key] ?? "", onChange: (e: any) => setForm((p: any) => ({ ...p, [key]: e.target.value })) };

    const totalUnits = (form.units_x_box || 0) * (form.box_qty || 0);
    const tCostXU    = (form.f_cost_x_u || 0) + (form.c_cost_x_u || 0);
    const tCost      = tCostXU * totalUnits;

    const save = async () => {
        setSaving(true); setError(null);
        try {
            const res = await fetch(`/api/awbs/boxes/${box.UNICO}`, {
                method: "PUT", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, units_x_box: form.units_x_box, box_qty: form.box_qty }),
            });
            const d = await res.json();
            if (!d.success) throw new Error(d.error);
            toast.success("Box updated.");
            onSaved();
            onClose();
        } catch (e: any) { setError(e.message); }
        finally { setSaving(false); }
    };

    return (
        <Modal title={`Inventory Entry — Box ${t(box?.BOXNUM ?? box?.UNICO)}`} icon={Package} onClose={onClose} size="sm" error={error}
            footer={<>
                <button onClick={onClose} className="px-4 py-2 rounded border text-sm font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
                <button onClick={save} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded bg-[#FB7506] hover:bg-orange-600 text-white text-sm font-black disabled:opacity-50">
                    {saving ? <RefreshCcw size={13} className="animate-spin"/> : <Save size={13}/>}{saving ? "Saving..." : "OK"}
                </button>
            </>}>
            <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">AWBCode</label>
                    <input readOnly value={form.awbcode} className="fos-input py-1 bg-gray-50 text-gray-500 font-bold"/>
                </div>
                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Customer</label>
                    <input readOnly value={t(box?.CUSTOMER)} className="fos-input py-1 bg-gray-50 text-gray-500"/>
                </div>
                <div className="col-span-2 flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Case / Description</label>
                    <input {...F("description")} className="fos-input py-1"/>
                </div>
                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Price</label>
                    <input {...F("price", true)} className="fos-input py-1"/>
                </div>
                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">T. Price (calc.)</label>
                    <input readOnly value={fmt((form.price || 0) * totalUnits)} className="fos-input py-1 bg-gray-50 text-gray-500 font-bold"/>
                </div>
                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">F. Cost x U</label>
                    <input {...F("f_cost_x_u", true)} className="fos-input py-1"/>
                </div>
                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">C. Cost x U</label>
                    <input {...F("c_cost_x_u", true)} className="fos-input py-1"/>
                </div>
                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">T. Cost x U (calc.)</label>
                    <input readOnly value={fmt(tCostXU)} className="fos-input py-1 bg-gray-50 text-gray-500 font-bold"/>
                </div>
                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">T. Cost (calc.)</label>
                    <input readOnly value={fmt(tCost)} className="fos-input py-1 bg-gray-50 text-gray-500 font-bold"/>
                </div>
                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">T. Charges</label>
                    <input {...F("t_charges", true)} className="fos-input py-1"/>
                </div>
                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Flower Cost</label>
                    <input {...F("flower_cost", true)} className="fos-input py-1"/>
                </div>
                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Units x Box</label>
                    <input {...F("units_x_box", true)} className="fos-input py-1"/>
                </div>
                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Box Qty</label>
                    <input {...F("box_qty", true)} className="fos-input py-1"/>
                </div>
                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Total Units (calc.)</label>
                    <input readOnly value={totalUnits} className="fos-input py-1 bg-gray-50 text-gray-500 font-bold"/>
                </div>
                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Lote</label>
                    <input {...F("lote", true)} className="fos-input py-1"/>
                </div>
                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">AWB (Combo)</label>
                    <input {...F("combo_awb")} className="fos-input py-1"/>
                </div>
            </div>
        </Modal>
    );
}

// ─── Modal 5: AwbsVarietiesMpfModal — Set MPF ────────────────────────────────
function AwbsVarietiesMpfModal({ awbcode, onClose, onSaved }: any) {
    const [form,   setForm]   = useState({ entry_code: "", mpf: 0 });
    const [saving, setSaving] = useState(false);
    const [error,  setError]  = useState<string | null>(null);

    const save = async () => {
        if (!form.entry_code) { setError("Entry code is required."); return; }
        if (!form.mpf)        { setError("MPF value is required."); return; }
        setSaving(true); setError(null);
        try {
            const res = await fetch("/api/awbs/varieties/mpf", {
                method: "PUT", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ awbcode, ...form }),
            });
            const d = await res.json();
            if (!d.success) throw new Error(d.error);
            toast.success("MPF updated.");
            onSaved();
            onClose();
        } catch (e: any) { setError(e.message); }
        finally { setSaving(false); }
    };

    return (
        <Modal title={`Set MPF — ${awbcode}`} icon={Package} onClose={onClose} size="sm" error={error}
            footer={<>
                <button onClick={onClose} className="px-4 py-2 rounded border text-sm font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
                <button onClick={save} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded bg-[#FB7506] hover:bg-orange-600 text-white text-sm font-black disabled:opacity-50">
                    {saving ? <RefreshCcw size={13} className="animate-spin"/> : <Save size={13}/>}{saving ? "Saving..." : "OK"}
                </button>
            </>}>
            <div className="space-y-3 text-xs">
                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">AWBCode</label>
                    <input readOnly value={awbcode} className="fos-input py-1 bg-gray-50 text-gray-500 font-bold"/>
                </div>
                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Entry Code *</label>
                    <input value={form.entry_code} onChange={e => setForm(p => ({ ...p, entry_code: e.target.value }))} className="fos-input py-1"/>
                </div>
                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">MPF *</label>
                    <input type="number" step="0.01" value={form.mpf} onChange={e => setForm(p => ({ ...p, mpf: parseFloat(e.target.value) || 0 }))} className="fos-input py-1"/>
                </div>
            </div>
        </Modal>
    );
}

// ─── Change Date Modal ────────────────────────────────────────────────────────
function ChangeDateModal({ awbcode, currentDate, onClose, onSaved }: any) {
    const [newDate, setNewDate] = useState(currentDate?.split("T")[0] ?? today());
    const [saving,  setSaving]  = useState(false);
    const [error,   setError]   = useState<string | null>(null);

    const save = async () => {
        if (!newDate) { setError("Date is required."); return; }
        setSaving(true); setError(null);
        try {
            const res = await fetch(`/api/awbs/${encodeURIComponent(awbcode)}`, {
                method: "PUT", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ new_date: newDate }),
            });
            const d = await res.json();
            if (!d.success) throw new Error(d.error);
            toast.success("AWB date updated.");
            onSaved();
            onClose();
        } catch (e: any) { setError(e.message); }
        finally { setSaving(false); }
    };

    return (
        <Modal title={`Change AWB Date — ${awbcode}`} icon={Calendar} onClose={onClose} size="sm" error={error}
            footer={<>
                <button onClick={onClose} className="px-4 py-2 rounded border text-sm font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
                <button onClick={save} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded bg-[#FB7506] hover:bg-orange-600 text-white text-sm font-black disabled:opacity-50">
                    {saving ? <RefreshCcw size={13} className="animate-spin"/> : <Save size={13}/>}{saving ? "Saving..." : "Save"}
                </button>
            </>}>
            <div className="space-y-3 text-xs">
                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">New Date *</label>
                    <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="fos-input py-1.5"/>
                </div>
            </div>
        </Modal>
    );
}

// ─── Report Modal ─────────────────────────────────────────────────────────────
function ReportModal({ title, records, onClose }: any) {
    const cols = records?.length ? Object.keys(records[0]) : [];
    return (
        <Modal title={title} icon={BarChart2} onClose={onClose} size="xl"
            footer={<button onClick={onClose} className="px-4 py-2 rounded border text-sm font-bold text-gray-600 hover:bg-gray-100">Close</button>}>
            <div className="overflow-auto">
                <table className="min-w-full text-xs">
                    <thead className="bg-gray-100 border-b fos-grid-thead text-gray-700 sticky top-0">
                        <tr>{cols.map(c => <th key={c} className="p-2 border-r border-gray-200 last:border-r-0 whitespace-nowrap">{c}</th>)}</tr>
                    </thead>
                    <tbody className="fos-grid-tbody divide-y divide-gray-100">
                        {(records as any[]).map((row: any, i: number) => (
                            <tr key={i} className="hover:bg-gray-50">
                                {cols.map(c => <td key={c} className="p-2 whitespace-nowrap">{t(row[c])}</td>)}
                            </tr>
                        ))}
                        {!records?.length && <tr><td colSpan={cols.length || 1} className="p-4 text-center text-gray-400">No data</td></tr>}
                    </tbody>
                </table>
            </div>
        </Modal>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
type TabId = "vendors" | "charges" | "boxes" | "by-date" | "varieties";

export default function AwbsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const qc     = useQueryClient();

    // Filters
    const [ldDate,      setLdDate]      = useState(today());
    const [ldEndDate,   setLdEndDate]   = useState(today());
    const [lcAirline,   setLcAirline]   = useState("%");
    const [awbSearch,   setAwbSearch]   = useState("");
    const [searchKey,   setSearchKey]   = useState(0); // bump to re-run query

    // Selection
    const [selAwb,      setSelAwb]      = useState<any>(null);
    const [selVendor,   setSelVendor]   = useState<any>(null);
    const [selCharge,   setSelCharge]   = useState<any>(null);
    const [selByDate,   setSelByDate]   = useState<any>(null);
    const [selBox,      setSelBox]      = useState<any>(null);
    const [selVariety,  setSelVariety]  = useState<any>(null);

    // Tabs
    const [activeTab, setActiveTab] = useState<TabId>("vendors");

    // Modals
    const [chargesModal,        setChargesModal]        = useState<{ mode: "add" | "edit" } | null>(null);
    const [freightsModal,       setFreightsModal]       = useState<{ mode: "add" | "edit" } | null>(null);
    const [invoiceChargesModal, setInvoiceChargesModal] = useState(false);
    const [boxesModal,          setBoxesModal]          = useState(false);
    const [mpfModal,            setMpfModal]            = useState(false);
    const [changeDateModal,     setChangeDateModal]     = useState(false);
    const [reportModal,         setReportModal]         = useState<{ title: string; records: any[] } | null>(null);

    if (status === "unauthenticated") { router.push("/login"); return null; }
    if (status === "loading") return <div className="flex items-center justify-center h-screen"><Loader2 size={24} className="animate-spin text-[#FB7506]"/></div>;

    // ── Queries ──────────────────────────────────────────────────────────────
    const { data: airlines = [] } = useQuery({
        queryKey: ["awb-airlines"],
        queryFn:  () => awbFetch("/api/awbs/airlines"),
        staleTime: 300000,
        select:   (d: any) => d.records ?? [],
    });

    const { data: awbs = [], isFetching: loadingAwbs, refetch: refetchAwbs } = useQuery({
        queryKey: ["awb-list", searchKey],
        queryFn:  () => awbFetch(`/api/awbs/list?from=${ldDate}&to=${ldEndDate}&airline=${encodeURIComponent(lcAirline)}`),
        select:   (d: any) => d.records ?? [],
        staleTime: 0,
    });

    const { data: vendors = [], isFetching: loadingVendors } = useQuery({
        queryKey: ["awb-packing",   selAwb?.AWBCODE],
        queryFn:  () => awbFetch(`/api/awbs/${encodeURIComponent(selAwb.AWBCODE)}/packing`),
        enabled:  !!selAwb && activeTab === "vendors",
        select:   (d: any) => d.records ?? [],
    });

    const { data: chargesTab = [], isFetching: loadingCharges } = useQuery({
        queryKey: ["awb-charges",   selAwb?.AWBCODE],
        queryFn:  () => awbFetch(`/api/awbs/${encodeURIComponent(selAwb.AWBCODE)}/charges`),
        enabled:  !!selAwb && activeTab === "charges",
        select:   (d: any) => d.records ?? [],
    });

    const { data: boxes = [], isFetching: loadingBoxes } = useQuery({
        queryKey: ["awb-boxes",     selAwb?.AWBCODE],
        queryFn:  () => awbFetch(`/api/awbs/${encodeURIComponent(selAwb.AWBCODE)}/boxes`),
        enabled:  !!selAwb && activeTab === "boxes",
        select:   (d: any) => d.records ?? [],
    });

    const { data: byDate = [], isFetching: loadingByDate } = useQuery({
        queryKey: ["awb-by-date", ldDate, ldEndDate],
        queryFn:  () => awbFetch(`/api/awbs/charges-by-date?from=${ldDate}&to=${ldEndDate}`),
        enabled:  activeTab === "by-date",
        select:   (d: any) => d.records ?? [],
    });

    const { data: varieties = [], isFetching: loadingVarieties } = useQuery({
        queryKey: ["awb-varieties", selAwb?.AWBCODE],
        queryFn:  () => awbFetch(`/api/awbs/${encodeURIComponent(selAwb.AWBCODE)}/varieties`),
        enabled:  !!selAwb && activeTab === "varieties",
        select:   (d: any) => d.records ?? [],
    });

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleSearch = useCallback(() => {
        setSelAwb(null);
        setSearchKey(k => k + 1);
    }, []);

    const handleAwbSearch = useCallback(async () => {
        if (!awbSearch.trim()) return;
        try {
            const d = await awbFetch(`/api/awbs/search?q=${encodeURIComponent(awbSearch)}`);
            const records: any[] = d.records ?? [];
            if (!records.length) { toast.error("AWB not found."); return; }
            setSelAwb(records[0]);
            setActiveTab("vendors");
        } catch (e: any) { toast.error((e as any).message); }
    }, [awbSearch]);

    const handleSelectAwb = (row: any) => {
        setSelAwb(row);
        setSelVendor(null);
        setSelCharge(null);
        setSelByDate(null);
        setSelBox(null);
        setSelVariety(null);
        setActiveTab("vendors");
        // Invalidate all tab queries
        if (row?.AWBCODE) {
            qc.invalidateQueries({ queryKey: ["awb-packing",   row.AWBCODE] });
            qc.invalidateQueries({ queryKey: ["awb-charges",   row.AWBCODE] });
            qc.invalidateQueries({ queryKey: ["awb-boxes",     row.AWBCODE] });
            qc.invalidateQueries({ queryKey: ["awb-varieties", row.AWBCODE] });
        }
    };

    const handleDeleteAwb = () => {
        if (!selAwb) return;
        toastConfirm(`Delete AWB ${selAwb.AWBCODE}?`, async () => {
            try {
                const res = await fetch(`/api/awbs/${encodeURIComponent(selAwb.AWBCODE)}`, { method: "DELETE" });
                const d   = await res.json();
                if (!d.success) throw new Error(d.error);
                toast.success("AWB deleted.");
                setSelAwb(null);
                setSearchKey(k => k + 1);
            } catch (e: any) { toast.error((e as any).message); }
        });
    };

    const handleDeleteCharge = (row: any) => {
        toastConfirm(`Delete charge ${t(row.UNICO)}?`, async () => {
            try {
                const res = await fetch(`/api/awbs/charges/${row.UNICO}`, { method: "DELETE" });
                const d   = await res.json();
                if (!d.success) throw new Error(d.error);
                toast.success("Charge deleted.");
                qc.invalidateQueries({ queryKey: ["awb-charges", selAwb?.AWBCODE] });
                setSelCharge(null);
            } catch (e: any) { toast.error((e as any).message); }
        });
    };

    const handleDeleteByDate = (row: any) => {
        toastConfirm(`Delete freight charge ${t(row.UNICO)}?`, async () => {
            try {
                const res = await fetch(`/api/awbs/charges-by-date/${row.UNICO}`, { method: "DELETE" });
                const d   = await res.json();
                if (!d.success) throw new Error(d.error);
                toast.success("Charge deleted.");
                qc.invalidateQueries({ queryKey: ["awb-by-date", ldDate, ldEndDate] });
                setSelByDate(null);
            } catch (e: any) { toast.error((e as any).message); }
        });
    };

    const handleAddVariety = async () => {
        if (!selAwb) return;
        toastConfirm(`Add varieties for AWB ${selAwb.AWBCODE}?`, async () => {
            try {
                const res = await fetch("/api/awbs/varieties", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ awbcode: selAwb.AWBCODE }) });
                const d   = await res.json();
                if (!d.success) throw new Error(d.error);
                toast.success("Variety added.");
                qc.invalidateQueries({ queryKey: ["awb-varieties", selAwb.AWBCODE] });
            } catch (e: any) { toast.error((e as any).message); }
        });
    };

    const handleDeleteVariety = (row: any) => {
        toastConfirm(`Delete variety ${t(row.UNICO)}?`, async () => {
            try {
                const res = await fetch(`/api/awbs/varieties/${row.UNICO}`, { method: "DELETE" });
                const d   = await res.json();
                if (!d.success) throw new Error(d.error);
                toast.success("Variety deleted.");
                qc.invalidateQueries({ queryKey: ["awb-varieties", selAwb?.AWBCODE] });
                setSelVariety(null);
            } catch (e: any) { toast.error((e as any).message); }
        });
    };

    const handleReport = async (type: "products" | "duties") => {
        if (!selAwb) return;
        try {
            const grower = type === "duties" ? (selVendor?.GROWER_UQ ?? "") : "%";
            const url    = type === "products"
                ? `/api/awbs/reports/products?date_invo=${selAwb.DATE_INVO ?? selAwb.BOX_DATE ?? ldDate}&awbcode=${encodeURIComponent(selAwb.AWBCODE)}&grower_uq=${encodeURIComponent(grower)}`
                : `/api/awbs/reports/duties?date_invo=${selAwb.DATE_INVO ?? selAwb.BOX_DATE ?? ldDate}&awbcode=${encodeURIComponent(selAwb.AWBCODE)}&grower_uq=${encodeURIComponent(grower)}`;
            const d = await awbFetch(url);
            setReportModal({ title: type === "products" ? "Products Report" : "Credits Duties Report", records: d.records ?? [] });
        } catch (e: any) { toast.error((e as any).message); }
    };

    const handleVendorPrint = async () => {
        if (!selAwb || !selVendor) return;
        try {
            const d = await awbFetch(`/api/awbs/reports/products?date_invo=${selAwb.DATE_INVO ?? selAwb.BOX_DATE ?? ldDate}&awbcode=${encodeURIComponent(selAwb.AWBCODE)}&grower_uq=${encodeURIComponent(selVendor.GROWER_UQ ?? "%")}`);
            setReportModal({ title: `Products — ${t(selVendor.GROWER)}`, records: d.records ?? [] });
        } catch (e: any) { toast.error((e as any).message); }
    };

    const TABS: { id: TabId; label: string }[] = [
        { id: "vendors",   label: "Vendors x Awb" },
        { id: "charges",   label: "Charges Applied by Awb" },
        { id: "boxes",     label: "Boxes x AWB" },
        { id: "by-date",   label: "Charges Applied by Date" },
        { id: "varieties", label: "Varieties" },
    ];

    const TabLoading = ({ loading }: { loading: boolean }) =>
        loading ? <div className="flex items-center gap-2 text-gray-400 text-xs p-4"><Loader2 size={14} className="animate-spin"/>Loading...</div> : null;

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* ── Header ────────────────────────────────────────────────── */}
            <div className="bg-[#374151] px-4 py-2 flex items-center gap-3 shrink-0">
                <button onClick={() => router.back()} className="text-gray-400 hover:text-white"><ArrowLeft size={18}/></button>
                <Plane size={18} className="text-[#FB7506]"/>
                <span className="fos-grid-header-text text-sm">AWBs — Air Waybill Costs</span>
            </div>

            {/* ── Filter Bar ────────────────────────────────────────────── */}
            <div className="bg-white border-b px-4 py-2 flex flex-wrap items-center gap-3 shrink-0">
                <div className="flex items-center gap-1.5 text-xs">
                    <label className="text-[9px] font-black text-gray-400 uppercase">From</label>
                    <input type="date" value={ldDate} onChange={e => setLdDate(e.target.value)} className="fos-input py-1 w-36"/>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                    <label className="text-[9px] font-black text-gray-400 uppercase">To</label>
                    <input type="date" value={ldEndDate} onChange={e => setLdEndDate(e.target.value)} className="fos-input py-1 w-36"/>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Airline</label>
                    <select value={lcAirline} onChange={e => setLcAirline(e.target.value)} className="fos-input py-1 w-44">
                        <option value="%">— All Airlines —</option>
                        {(airlines as any[]).map((a: any) => (
                            <option key={a.UNICO ?? a.COD_LINEA} value={a.COD_LINEA ?? a.AIRLINE}>
                                {t(a.AIRLINE)} ({t(a.COD_LINEA)})
                            </option>
                        ))}
                    </select>
                </div>
                <Btn icon={Search} label="Search" color="orange" onClick={handleSearch}/>
                <div className="flex items-center gap-1.5 text-xs ml-auto">
                    <label className="text-[9px] font-black text-gray-400 uppercase">AWB #</label>
                    <input value={awbSearch} onChange={e => setAwbSearch(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleAwbSearch()}
                        placeholder="Search by code..." className="fos-input py-1 w-44"/>
                    <Btn icon={Search} label="Go" color="blue" onClick={handleAwbSearch}/>
                </div>
            </div>

            {/* ── Action Buttons ────────────────────────────────────────── */}
            <div className="bg-white border-b px-4 py-1.5 flex flex-wrap items-center gap-2 shrink-0">
                <Btn icon={Pencil}   label="Update"         color="amber"  disabled={!selAwb}/>
                <Btn icon={Trash2}   label="Delete"         color="red"    disabled={!selAwb} onClick={handleDeleteAwb}/>
                <Btn icon={Package}  label="Set MPF"        color="teal"   disabled={!selAwb} onClick={() => setMpfModal(true)}/>
                <Btn icon={Calendar} label="Change Awb Date" color="blue"  disabled={!selAwb} onClick={() => setChangeDateModal(true)}/>
                <div className="w-px h-5 bg-gray-200 mx-1"/>
                <Btn icon={Printer}  label="Products"       color="gray"   disabled={!selAwb} onClick={() => handleReport("products")}/>
                <Btn icon={BarChart2} label="Credits Duties" color="gray"  disabled={!selAwb} onClick={() => handleReport("duties")}/>
                {selAwb && (
                    <div className="ml-auto flex items-center gap-2 text-xs bg-blue-50 px-3 py-1 rounded border border-blue-200">
                        <Plane size={12} className="text-blue-500"/>
                        <span className="font-bold text-blue-700">{t(selAwb.AWBCODE)}</span>
                        <span className="text-gray-500">{t(selAwb.AIRLINE)}</span>
                        <span className="text-gray-400">{fmtDate(selAwb.BOX_DATE)}</span>
                    </div>
                )}
            </div>

            {/* ── Main Split: Grid + Tabs ───────────────────────────────── */}
            <div className="flex-1 flex flex-col min-h-0 p-3 gap-3">

                {/* Main AWB Grid */}
                <div className="bg-white rounded border shadow-sm overflow-auto" style={{ maxHeight: "35vh" }}>
                    {loadingAwbs ? (
                        <div className="flex items-center gap-2 text-gray-400 text-xs p-4"><Loader2 size={14} className="animate-spin"/>Loading AWBs...</div>
                    ) : (
                        <table className="min-w-full text-left text-xs">
                            <thead className="bg-gray-100 border-b fos-grid-thead text-gray-700 sticky top-0">
                                <tr>
                                    {["AWBCode","Airline","Air Code","Box Date","Inv Date","Boxes","Units","Charge","Handling","Freight","Duties","Broker","Total"].map(h => (
                                        <th key={h} className="p-2 border-r border-gray-200 last:border-r-0 whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="fos-grid-tbody divide-y divide-gray-100">
                                {(awbs as any[]).map((row: any) => (
                                    <tr key={row.AWBCODE} onClick={() => handleSelectAwb(row)}
                                        className={cn("cursor-pointer transition-colors", selAwb?.AWBCODE === row.AWBCODE ? "!bg-blue-50 ring-1 ring-inset ring-blue-200" : "hover:bg-gray-50")}>
                                        <td className="p-2 font-bold text-[#FB7506]">{t(row.AWBCODE)}</td>
                                        <td className="p-2">{t(row.AIRLINE)}</td>
                                        <td className="p-2">{t(row.AIRCODE)}</td>
                                        <td className="p-2 whitespace-nowrap">{fmtDate(row.BOX_DATE)}</td>
                                        <td className="p-2 whitespace-nowrap">{fmtDate(row.DATE_INVO)}</td>
                                        <td className="p-2 text-right">{row.TOTAL_BOXES}</td>
                                        <td className="p-2 text-right">{row.TOTAL_UNITS}</td>
                                        <td className="p-2 text-right">{fmt(row.CHARGE_COST)}</td>
                                        <td className="p-2 text-right">{fmt(row.HANDLING_COST)}</td>
                                        <td className="p-2 text-right">{fmt(row.FREIGHT_COST)}</td>
                                        <td className="p-2 text-right">{fmt(row.DUTIES_COST)}</td>
                                        <td className="p-2 text-right">{fmt(row.BROKER_COST)}</td>
                                        <td className="p-2 text-right font-bold">{fmt(row.TOTAL_CHARGE)}</td>
                                    </tr>
                                ))}
                                {!(awbs as any[]).length && (
                                    <tr><td colSpan={13} className="p-6 text-center text-gray-400">
                                        {searchKey === 0 ? "Click Search to load AWBs." : "No AWBs found."}
                                    </td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Tabs Section */}
                <div className="bg-white rounded border shadow-sm flex-1 flex flex-col min-h-0">
                    {/* Tab headers */}
                    <div className="flex border-b shrink-0">
                        {TABS.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={cn("px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors whitespace-nowrap",
                                    activeTab === tab.id
                                        ? "border-b-2 border-[#FB7506] text-[#FB7506]"
                                        : "text-gray-500 hover:text-gray-800")}>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab content */}
                    <div className="flex-1 overflow-auto p-2">

                        {/* ── Tab 1: Vendors x Awb ─────────────────────── */}
                        {activeTab === "vendors" && (
                            <div className="flex flex-col gap-2 h-full">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black text-gray-400 uppercase">Vendor Invoices x AWB</span>
                                    <Btn icon={Plus}    label="Add Invoice Charge" color="green" disabled={!selVendor} onClick={() => setInvoiceChargesModal(true)}/>
                                    <Btn icon={Printer} label="Print"              color="gray"  disabled={!selVendor} onClick={handleVendorPrint}/>
                                </div>
                                <TabLoading loading={loadingVendors}/>
                                {!loadingVendors && (
                                    <div className="overflow-auto flex-1">
                                        <table className="min-w-full text-left text-xs">
                                            <thead className="bg-gray-100 border-b fos-grid-thead text-gray-700 sticky top-0">
                                                <tr>{["Pack UQ","Packing No","Invoice No","AWBCode","Box Date","Inv Date","Grower","Farm","Boxes","Units","Charge","Handling","Freight"].map(h => (
                                                    <th key={h} className="p-2 border-r border-gray-200 last:border-r-0 whitespace-nowrap">{h}</th>
                                                ))}</tr>
                                            </thead>
                                            <tbody className="fos-grid-tbody divide-y divide-gray-100">
                                                {(vendors as any[]).map((row: any) => (
                                                    <tr key={row.PACK_UQ} onClick={() => setSelVendor(row)}
                                                        className={cn("cursor-pointer transition-colors", selVendor?.PACK_UQ === row.PACK_UQ ? "!bg-blue-50 ring-1 ring-inset ring-blue-200" : "hover:bg-gray-50")}>
                                                        <td className="p-2 font-mono text-[10px]">{t(row.PACK_UQ)}</td>
                                                        <td className="p-2 font-bold">{t(row.PACKING_NO)}</td>
                                                        <td className="p-2">{t(row.INVOICE_NO)}</td>
                                                        <td className="p-2 font-bold text-[#FB7506]">{t(row.AWBCODE)}</td>
                                                        <td className="p-2 whitespace-nowrap">{fmtDate(row.BOX_DATE)}</td>
                                                        <td className="p-2 whitespace-nowrap">{fmtDate(row.DATE_INVO)}</td>
                                                        <td className="p-2">{t(row.GROWER)}</td>
                                                        <td className="p-2">{t(row.FARM)}</td>
                                                        <td className="p-2 text-right">{row.TOTAL_BOXES}</td>
                                                        <td className="p-2 text-right">{row.TOTAL_UNITS}</td>
                                                        <td className="p-2 text-right">{fmt(row.CHARGE_COST)}</td>
                                                        <td className="p-2 text-right">{fmt(row.HANDLING_COST)}</td>
                                                        <td className="p-2 text-right">{fmt(row.FREIGHT_COST)}</td>
                                                    </tr>
                                                ))}
                                                {!selAwb && <tr><td colSpan={13} className="p-4 text-center text-gray-400">Select an AWB to view vendors.</td></tr>}
                                                {selAwb && !(vendors as any[]).length && !loadingVendors && <tr><td colSpan={13} className="p-4 text-center text-gray-400">No vendor invoices.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Tab 2: Charges Applied by Awb ────────────── */}
                        {activeTab === "charges" && (
                            <div className="flex flex-col gap-2 h-full">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black text-gray-400 uppercase">AWB's Direct Cost by Prorate by AWB</span>
                                    <Btn icon={Plus}   label="Add"    color="green" disabled={!selAwb} onClick={() => { setSelCharge(null); setChargesModal({ mode: "add" }); }}/>
                                    <Btn icon={Pencil} label="Edit"   color="amber" disabled={!selCharge} onClick={() => setChargesModal({ mode: "edit" })}/>
                                    <Btn icon={Trash2} label="Delete" color="red"   disabled={!selCharge} onClick={() => handleDeleteCharge(selCharge)}/>
                                </div>
                                <TabLoading loading={loadingCharges}/>
                                {!loadingCharges && (
                                    <div className="overflow-auto flex-1">
                                        <table className="min-w-full text-left text-xs">
                                            <thead className="bg-gray-100 border-b fos-grid-thead text-gray-700 sticky top-0">
                                                <tr>{["UNICO","OC Amount","Description","Date","O.Charges","Handling","Freight","Broker","Duties","Boxes","AP Type","Grower","AWBCode","Invoice"].map(h => (
                                                    <th key={h} className="p-2 border-r border-gray-200 last:border-r-0 whitespace-nowrap">{h}</th>
                                                ))}</tr>
                                            </thead>
                                            <tbody className="fos-grid-tbody divide-y divide-gray-100">
                                                {(chargesTab as any[]).map((row: any) => (
                                                    <tr key={row.UNICO} onClick={() => setSelCharge(row)}
                                                        className={cn("cursor-pointer transition-colors", selCharge?.UNICO === row.UNICO ? "!bg-blue-50 ring-1 ring-inset ring-blue-200" : "hover:bg-gray-50")}>
                                                        <td className="p-2 font-mono text-[10px]">{t(row.UNICO)}</td>
                                                        <td className="p-2 text-right">{fmt(row.OC_AMMOUNT)}</td>
                                                        <td className="p-2">{t(row.DESCRIPTION)}</td>
                                                        <td className="p-2 whitespace-nowrap">{fmtDate(row.AWC_DATE)}</td>
                                                        <td className="p-2 text-right">{fmt(row.O_CHARGES)}</td>
                                                        <td className="p-2 text-right">{fmt(row.HANDLING)}</td>
                                                        <td className="p-2 text-right">{fmt(row.FREIGHT)}</td>
                                                        <td className="p-2 text-right">{fmt(row.BROKER)}</td>
                                                        <td className="p-2 text-right">{fmt(row.DUTIES)}</td>
                                                        <td className="p-2 text-right">{row.TOTAL_BOXES}</td>
                                                        <td className="p-2">{t(row.AP_TYPE)}</td>
                                                        <td className="p-2">{t(row.GROWER)}</td>
                                                        <td className="p-2 font-bold text-[#FB7506]">{t(row.AWBCODE)}</td>
                                                        <td className="p-2">{t(row.INVOICE_NO)}</td>
                                                    </tr>
                                                ))}
                                                {!selAwb && <tr><td colSpan={14} className="p-4 text-center text-gray-400">Select an AWB to view charges.</td></tr>}
                                                {selAwb && !(chargesTab as any[]).length && !loadingCharges && <tr><td colSpan={14} className="p-4 text-center text-gray-400">No charges.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Tab 3: Boxes x AWB ───────────────────────── */}
                        {activeTab === "boxes" && (
                            <div className="flex flex-col gap-2 h-full">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black text-gray-400 uppercase">Boxes x AWB</span>
                                    <Btn icon={Pencil} label="Edit" color="amber" disabled={!selBox} onClick={() => setBoxesModal(true)}/>
                                </div>
                                <TabLoading loading={loadingBoxes}/>
                                {!loadingBoxes && (
                                    <div className="overflow-auto flex-1">
                                        <table className="min-w-full text-left text-xs">
                                            <thead className="bg-gray-100 border-b fos-grid-thead text-gray-700 sticky top-0">
                                                <tr>{["Ready","Order","UNICO","Sel","Lote","Market","P.Order","Customer","Qty","Box Date","Days","Box Qty","BoxNum","Units","F.Cost","FC.Cost"].map(h => (
                                                    <th key={h} className="p-2 border-r border-gray-200 last:border-r-0 whitespace-nowrap">{h}</th>
                                                ))}</tr>
                                            </thead>
                                            <tbody className="fos-grid-tbody divide-y divide-gray-100">
                                                {(boxes as any[]).map((row: any) => (
                                                    <tr key={row.UNICO} onClick={() => setSelBox(row)}
                                                        className={cn("cursor-pointer transition-colors", selBox?.UNICO === row.UNICO ? "!bg-blue-50 ring-1 ring-inset ring-blue-200" : "hover:bg-gray-50")}>
                                                        <td className="p-2">{t(row.READY_TRAN)}</td>
                                                        <td className="p-2">{t(row.SORDER_NO)}</td>
                                                        <td className="p-2 font-mono text-[10px]">{t(row.UNICO)}</td>
                                                        <td className="p-2">{t(row.SEL)}</td>
                                                        <td className="p-2">{t(row.LOTE)}</td>
                                                        <td className="p-2">{t(row.MARKET)}</td>
                                                        <td className="p-2">{t(row.PODER_NO)}</td>
                                                        <td className="p-2">{t(row.CUSTOMER)}</td>
                                                        <td className="p-2 text-right">{row.QTY_TRANSIT}</td>
                                                        <td className="p-2 whitespace-nowrap">{fmtDate(row.BOX_DATE)}</td>
                                                        <td className="p-2 text-right">{row.DAYS}</td>
                                                        <td className="p-2 text-right">{row.BOX_QTY}</td>
                                                        <td className="p-2">{t(row.BOXNUM)}</td>
                                                        <td className="p-2 text-right">{row.TOTAL_UNITS}</td>
                                                        <td className="p-2 text-right">{fmt(row.F_COST_X_U)}</td>
                                                        <td className="p-2 text-right">{fmt(row.F_FCOST_X_U)}</td>
                                                    </tr>
                                                ))}
                                                {!selAwb && <tr><td colSpan={16} className="p-4 text-center text-gray-400">Select an AWB to view boxes.</td></tr>}
                                                {selAwb && !(boxes as any[]).length && !loadingBoxes && <tr><td colSpan={16} className="p-4 text-center text-gray-400">No boxes.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Tab 4: Charges Applied by Date ───────────── */}
                        {activeTab === "by-date" && (
                            <div className="flex flex-col gap-2 h-full">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black text-gray-400 uppercase">AWB's Direct Cost Prorate by Date</span>
                                    <Btn icon={Plus}   label="Add"    color="green" onClick={() => { setSelByDate(null); setFreightsModal({ mode: "add" }); }}/>
                                    <Btn icon={Pencil} label="Edit"   color="amber" disabled={!selByDate} onClick={() => setFreightsModal({ mode: "edit" })}/>
                                    <Btn icon={Trash2} label="Delete" color="red"   disabled={!selByDate} onClick={() => handleDeleteByDate(selByDate)}/>
                                </div>
                                <TabLoading loading={loadingByDate}/>
                                {!loadingByDate && (
                                    <div className="overflow-auto flex-1">
                                        <table className="min-w-full text-left text-xs">
                                            <thead className="bg-gray-100 border-b fos-grid-thead text-gray-700 sticky top-0">
                                                <tr>{["UNICO","AP Type","Supplier","Charge Date","Apply From","Apply To","Total Box","Duties","O.Charges","Notes","Invoice","Timestamp"].map(h => (
                                                    <th key={h} className="p-2 border-r border-gray-200 last:border-r-0 whitespace-nowrap">{h}</th>
                                                ))}</tr>
                                            </thead>
                                            <tbody className="fos-grid-tbody divide-y divide-gray-100">
                                                {(byDate as any[]).map((row: any) => (
                                                    <tr key={row.UNICO} onClick={() => setSelByDate(row)}
                                                        className={cn("cursor-pointer transition-colors", selByDate?.UNICO === row.UNICO ? "!bg-blue-50 ring-1 ring-inset ring-blue-200" : "hover:bg-gray-50")}>
                                                        <td className="p-2 font-mono text-[10px]">{t(row.UNICO)}</td>
                                                        <td className="p-2">{t(row.AP_TYPE_UQ)}</td>
                                                        <td className="p-2">{t(row.SUPPLIER_UQ)}</td>
                                                        <td className="p-2 whitespace-nowrap">{fmtDate(row.CHARGE_DATE)}</td>
                                                        <td className="p-2 whitespace-nowrap">{fmtDate(row.APPLY_FROM)}</td>
                                                        <td className="p-2 whitespace-nowrap">{fmtDate(row.APPLY_TO)}</td>
                                                        <td className="p-2 text-right">{row.TOTAL_BOX}</td>
                                                        <td className="p-2 text-right">{fmt(row.DUTIES)}</td>
                                                        <td className="p-2 text-right">{fmt(row.OCHARGES)}</td>
                                                        <td className="p-2">{t(row.NOTES)}</td>
                                                        <td className="p-2">{t(row.INVOICE_NO)}</td>
                                                        <td className="p-2 whitespace-nowrap text-gray-400">{fmtDate(row.TIMESTAMP)}</td>
                                                    </tr>
                                                ))}
                                                {!(byDate as any[]).length && !loadingByDate && <tr><td colSpan={12} className="p-4 text-center text-gray-400">No charges by date.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Tab 5: Varieties ──────────────────────────── */}
                        {activeTab === "varieties" && (
                            <div className="flex flex-col gap-2 h-full">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black text-gray-400 uppercase">Varieties x AWB</span>
                                    <Btn icon={Plus}   label="Add"    color="green" disabled={!selAwb} onClick={handleAddVariety}/>
                                    <Btn icon={Trash2} label="Delete" color="red"   disabled={!selVariety} onClick={() => handleDeleteVariety(selVariety)}/>
                                </div>
                                <TabLoading loading={loadingVarieties}/>
                                {!loadingVarieties && (
                                    <div className="overflow-auto flex-1">
                                        <table className="min-w-full text-left text-xs">
                                            <thead className="bg-gray-100 border-b fos-grid-thead text-gray-700 sticky top-0">
                                                <tr>{Object.keys((varieties as any[])[0] ?? { UNICO: "", AWBCODE: "" }).map(h => (
                                                    <th key={h} className="p-2 border-r border-gray-200 last:border-r-0 whitespace-nowrap">{h}</th>
                                                ))}</tr>
                                            </thead>
                                            <tbody className="fos-grid-tbody divide-y divide-gray-100">
                                                {(varieties as any[]).map((row: any) => (
                                                    <tr key={row.UNICO} onClick={() => setSelVariety(row)}
                                                        className={cn("cursor-pointer transition-colors", selVariety?.UNICO === row.UNICO ? "!bg-blue-50 ring-1 ring-inset ring-blue-200" : "hover:bg-gray-50")}>
                                                        {Object.values(row).map((v: any, i: number) => (
                                                            <td key={i} className="p-2">{t(v)}</td>
                                                        ))}
                                                    </tr>
                                                ))}
                                                {!selAwb && <tr><td colSpan={5} className="p-4 text-center text-gray-400">Select an AWB to view varieties.</td></tr>}
                                                {selAwb && !(varieties as any[]).length && !loadingVarieties && <tr><td colSpan={5} className="p-4 text-center text-gray-400">No varieties.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Modals ────────────────────────────────────────────────── */}
            {chargesModal && selAwb && (
                <AwbsChargesModal
                    mode={chargesModal.mode}
                    charge={chargesModal.mode === "edit" ? selCharge : null}
                    awbcode={selAwb.AWBCODE}
                    onClose={() => setChargesModal(null)}
                    onSaved={() => qc.invalidateQueries({ queryKey: ["awb-charges", selAwb.AWBCODE] })}
                />
            )}
            {freightsModal && (
                <AwbsFreightsModal
                    mode={freightsModal.mode}
                    charge={freightsModal.mode === "edit" ? selByDate : null}
                    awbcode={selAwb?.AWBCODE ?? ""}
                    airline={selAwb?.AIRLINE ?? ""}
                    onClose={() => setFreightsModal(null)}
                    onSaved={() => qc.invalidateQueries({ queryKey: ["awb-by-date", ldDate, ldEndDate] })}
                />
            )}
            {invoiceChargesModal && selAwb && selVendor && (
                <AwbsInvoiceChargesModal
                    packUq={selVendor.PACK_UQ}
                    awbcode={selAwb.AWBCODE}
                    onClose={() => setInvoiceChargesModal(false)}
                    onSaved={() => qc.invalidateQueries({ queryKey: ["awb-packing", selAwb.AWBCODE] })}
                />
            )}
            {boxesModal && selBox && (
                <AwbsBoxesModal
                    box={selBox}
                    onClose={() => setBoxesModal(false)}
                    onSaved={() => { qc.invalidateQueries({ queryKey: ["awb-boxes", selAwb?.AWBCODE] }); setSelBox(null); }}
                />
            )}
            {mpfModal && selAwb && (
                <AwbsVarietiesMpfModal
                    awbcode={selAwb.AWBCODE}
                    onClose={() => setMpfModal(false)}
                    onSaved={() => qc.invalidateQueries({ queryKey: ["awb-varieties", selAwb.AWBCODE] })}
                />
            )}
            {changeDateModal && selAwb && (
                <ChangeDateModal
                    awbcode={selAwb.AWBCODE}
                    currentDate={selAwb.BOX_DATE}
                    onClose={() => setChangeDateModal(false)}
                    onSaved={() => setSearchKey(k => k + 1)}
                />
            )}
            {reportModal && (
                <ReportModal
                    title={reportModal.title}
                    records={reportModal.records}
                    onClose={() => setReportModal(null)}
                />
            )}
        </div>
    );
}
