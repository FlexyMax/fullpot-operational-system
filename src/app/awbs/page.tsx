"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    RefreshCcw, Search, XCircle, Save, Trash2,
    Plus, Pencil, Printer, BarChart2, Calendar, Plane, FileText,
    Package, DollarSign, Loader2
} from "lucide-react";
import { GridMenu } from "@/components/GridMenu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuditLog } from "@/lib/audit";
import { usePagePermissions, PERMISSION_MSGS } from "@/lib/permissions";
import AppHeader from "@/components/layout/AppHeader";
import AppFooter from "@/components/layout/AppFooter";
const EMPTY_ARR: any[] = [];

const t       = (v: any) => String(v ?? "").trim();
const fmt     = (v: any) => parseFloat(v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (v: any) => { if (!v) return ""; const d = new Date(v); return isNaN(d.getTime()) ? t(v) : d.toLocaleDateString("en-US"); };
const today   = () => new Date().toISOString().split("T")[0];

// Normalize record keys to UPPERCASE so frontend column references work
const norm = (records: any[]) => records.map(r => {
    const n: any = {};
    for (const [k, v] of Object.entries(r)) n[k.toUpperCase()] = v;
    return n;
});

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
            className={cn("flex items-center gap-1.5 px-3 h-7 text-[14px] text-white font-semibold uppercase tracking-wide rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0", cls[color] || cls.gray)}>
            {Icon && <Icon size={13}/>}{label}
        </button>
    );
}

// ─── Modal 1: AwbsChargesModal — Add / Edit charge by AWB ────────────────────
function AwbsChargesModal({ mode, charge, awbcode, onClose, onSaved }: any) {
    const isEdit = mode === "edit";
    const blank = { supplier_uq: "", ap_type_uq: "", awc_date: today(), invoice_date: today(), invoice_no: "", description: "", duties: 0, o_charges: 0, handling: 0, freight: 0, broker: 0, oc_ammount: 0, total_boxes: 0, full_boxes: 0, weight: 0 };
    const [form, setForm] = useState<any>(isEdit ? {
        supplier_uq:  charge?.SUPPLIER_UQ ?? "",
        ap_type_uq:   charge?.AP_TYPE_UQ  ?? "",
        awc_date:     charge?.AWC_DATE?.split("T")[0]    ?? today(),
        invoice_date: charge?.INVOICE_DATE?.split("T")[0] ?? today(),
        invoice_no:   charge?.INVOICE_NO   ?? "",
        description:  charge?.DESCRIPTION  ?? "",
        duties:       charge?.DUTIES       ?? 0,
        o_charges:    charge?.O_CHARGES    ?? 0,
        handling:     charge?.HANDLING     ?? 0,
        freight:      charge?.FREIGHT      ?? 0,
        broker:       charge?.BROKER       ?? 0,
        oc_ammount:   charge?.OC_AMMOUNT   ?? 0,
        total_boxes:  charge?.TOTAL_BOXES  ?? 0,
        full_boxes:   0,
        weight:       0,
    } : blank);
    const [saving, setSaving] = useState(false);
    const [error,  setError]  = useState<string | null>(null);

    const { data: suppliers = EMPTY_ARR } = useQuery({ queryKey: ["awb-suppliers"],    queryFn: () => awbFetch("/api/awbs/lookups/suppliers"),    staleTime: 60000, select: (d: any) => d.records ?? [] });
    const { data: chargeTypes = EMPTY_ARR } = useQuery({ queryKey: ["awb-chargetypes"], queryFn: () => awbFetch("/api/awbs/lookups/charge-types"), staleTime: 60000, select: (d: any) => d.records ?? [] });

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
            onSaved(isEdit ? charge.UNICO : (d.unico ?? ""));
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
                    <label className="text-[9px] font-black text-gray-400 uppercase">Charge Date</label>
                    <input type="date" {...F("awc_date")} className="fos-input py-1"/>
                </div>
                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Invoice Date</label>
                    <input type="date" {...F("invoice_date")} className="fos-input py-1"/>
                </div>
                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Invoice No. *</label>
                    <input {...F("invoice_no")} className="fos-input py-1"/>
                </div>
                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Total Boxes</label>
                    <input {...F("total_boxes", true)} className="fos-input py-1"/>
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
                    <label className="text-[9px] font-black text-gray-400 uppercase">Handling</label>
                    <input {...F("handling", true)} className="fos-input py-1"/>
                </div>
                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Freight</label>
                    <input {...F("freight", true)} className="fos-input py-1"/>
                </div>
                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Broker</label>
                    <input {...F("broker", true)} className="fos-input py-1"/>
                </div>
                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">OC Amount</label>
                    <input {...F("oc_ammount", true)} className="fos-input py-1"/>
                </div>
                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Full Boxes</label>
                    <input {...F("full_boxes", true)} className="fos-input py-1"/>
                </div>
                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Weight</label>
                    <input {...F("weight", true)} className="fos-input py-1"/>
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
function AwbsFreightsModal({ mode, charge, airline, onClose, onSaved }: any) {
    const isEdit = mode === "edit";
    // SP params: lcap_type_uq, lcsupplier_uq, ldcharge_date, ldfrom, ldto,
    //            lntotal_box, lnduties, lnocharges, lcnotes, lninvoice_no
    const blankF = { ap_type_uq: "", supplier_uq: "", charge_date: today(), apply_from: "", apply_to: "", total_box: 0, duties: 0, ocharges: 0, notes: "", invoice_no: "" };
    const [form, setForm] = useState<any>(isEdit ? {
        ap_type_uq:  charge?.AP_TYPE_UQ  ?? "",
        supplier_uq: charge?.SUPPLIER_UQ ?? "",
        charge_date: charge?.CHARGE_DATE?.split("T")[0] ?? today(),
        apply_from:  charge?.APPLY_FROM?.split("T")[0]  ?? "",
        apply_to:    charge?.APPLY_TO?.split("T")[0]    ?? "",
        total_box:   charge?.TOTAL_BOX   ?? 0,
        duties:      charge?.DUTIES      ?? 0,
        ocharges:    charge?.OCHARGES    ?? 0,
        notes:       charge?.NOTES       ?? "",
        invoice_no:  charge?.INVOICE_NO  ?? "",
    } : blankF);
    const [saving, setSaving] = useState(false);
    const [error,  setError]  = useState<string | null>(null);

    const { data: suppliers = EMPTY_ARR } = useQuery({ queryKey: ["awb-suppliers"],        queryFn: () => awbFetch("/api/awbs/lookups/suppliers"),         staleTime: 60000, select: (d: any) => d.records ?? [] });
    const { data: chargeTypes = EMPTY_ARR } = useQuery({ queryKey: ["awb-chargetypes-date"], queryFn: () => awbFetch("/api/awbs/lookups/charge-types-date"), staleTime: 60000, select: (d: any) => d.records ?? [] });

    const F = (key: string, num = false) => num
        ? { type: "number", step: "0.01", value: form[key] ?? 0, onChange: (e: any) => setForm((p: any) => ({ ...p, [key]: parseFloat(e.target.value) || 0 })) }
        : { value: form[key] ?? "", onChange: (e: any) => setForm((p: any) => ({ ...p, [key]: e.target.value })) };

    const save = async () => {
        if (!form.ap_type_uq)  { setError("Charge type is required."); return; }
        if (!form.supplier_uq) { setError("Supplier is required."); return; }
        if (!form.invoice_no)  { setError("Invoice is required."); return; }
        setSaving(true); setError(null);
        try {
            const url = isEdit ? `/api/awbs/charges-by-date/${charge.UNICO}` : "/api/awbs/charges-by-date";
            const res = await fetch(url, { method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
            const d   = await res.json();
            if (!d.success) throw new Error(d.error);
            toast.success(isEdit ? "Charge updated." : "Charge added.");
            onSaved(isEdit ? charge.UNICO : (d.unico ?? ""));
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
                    <label className="text-[9px] font-black text-gray-400 uppercase">O. Charges (Amount) *</label>
                    <input {...F("ocharges", true)} className="fos-input py-1"/>
                </div>
                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Duties</label>
                    <input {...F("duties", true)} className="fos-input py-1"/>
                </div>
                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Total Boxes</label>
                    <input {...F("total_box", true)} className="fos-input py-1"/>
                </div>
                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Invoice *</label>
                    <input {...F("invoice_no")} className="fos-input py-1"/>
                </div>
                <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Charge Date</label>
                    <input type="date" {...F("charge_date")} className="fos-input py-1"/>
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
    // SP params: lcpack_uq, lcawbcode, lcap_type_uq, ldinvoice_date,
    //            lnamount, lninvoice_no, lcsupplier_uq, lcdescription
    const [form, setForm] = useState<any>({ ap_type_uq: "", supplier_uq: "", amount: 0, description: "", invoice_no: "", invoice_date: today() });
    const [saving, setSaving] = useState(false);
    const [error,  setError]  = useState<string | null>(null);
    const qc = useQueryClient();

    const { data: suppliers = EMPTY_ARR } = useQuery({ queryKey: ["awb-suppliers"],    queryFn: () => awbFetch("/api/awbs/lookups/suppliers"),    staleTime: 60000, select: (d: any) => d.records ?? [] });
    const { data: chargeTypes = EMPTY_ARR } = useQuery({ queryKey: ["awb-chargetypes"], queryFn: () => awbFetch("/api/awbs/lookups/charge-types"), staleTime: 60000, select: (d: any) => d.records ?? [] });
    const { data: charges = EMPTY_ARR, isFetching } = useQuery({
        queryKey: ["awb-invoice-charges", packUq],
        queryFn:  () => awbFetch(`/api/awbs/invoice-charges?pack_uq=${encodeURIComponent(packUq)}`),
        enabled:  !!packUq,
        select:   (d: any) => d.records ?? [],
        staleTime: 0,
    });

    const openAdd = () => {
        setForm({ ap_type_uq: "", supplier_uq: "", amount: 0, description: "", invoice_no: "", invoice_date: today() });
        setSelCharge(null); setEditMode("add"); setError(null);
    };
    const openEdit = (row: any) => {
        setForm({ ap_type_uq: row.AP_TYPE_UQ ?? "", supplier_uq: row.SUPPLIER_UQ ?? "", amount: row.FREIGHT ?? 0, description: row.DESCRIPTION ?? "", invoice_no: row.INVOICE_NO ?? "", invoice_date: row.INVOICE_DATE?.split("T")[0] ?? today() });
        setSelCharge(row); setEditMode("edit"); setError(null);
    };
    const loadTemplate = async () => {
        try {
            await awbFetch(`/api/awbs/template/${encodeURIComponent(awbcode)}`);
            toast.success("Template applied.");
            qc.invalidateQueries({ queryKey: ["awb-invoice-charges", packUq] });
        } catch (e: any) { toast.error((e as any).message); }
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
            onSaved(editMode === "edit" ? selCharge.UNICO : (d.unico ?? ""), editMode ?? "add");
            qc.invalidateQueries({ queryKey: ["awb-invoice-charges", packUq] });
            setEditMode(null);
        } catch (e: any) { setError(e.message); }
        finally { setSaving(false); }
    };
    const del = (row: any) => {
        toastConfirm(`Delete charge?`, async () => {
            try {
                const res = await fetch(`/api/awbs/invoice-charges/${row.UNICO}`, { method: "DELETE" });
                const d   = await res.json();
                if (!d.success) throw new Error(d.error);
                toast.success("Charge deleted.");
                onSaved(row.UNICO, "delete");
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
                        <label className="text-[9px] font-black text-gray-400 uppercase">Amount *</label>
                        <input type="number" step="0.01" value={form.amount} onChange={e => setForm((p: any) => ({ ...p, amount: parseFloat(e.target.value) || 0 }))} className="fos-input py-1"/>
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
                        <label className="text-[9px] font-black text-gray-400 uppercase">Description</label>
                        <input value={form.description} onChange={e => setForm((p: any) => ({ ...p, description: e.target.value }))} className="fos-input py-1"/>
                    </div>
                    <div className="flex gap-2 pt-1">
                        <Btn icon={Plus}     label="Add"      color="green" onClick={openAdd}/>
                        <Btn icon={FileText} label="Template" color="teal"  onClick={loadTemplate}/>
                    </div>
                </div>
                <div className="flex-1 min-w-0 overflow-auto">
                    {isFetching ? <div className="flex items-center gap-2 text-gray-400 text-xs p-4"><Loader2 size={14} className="animate-spin"/>Loading...</div> : (
                        <table className="min-w-full text-left text-xs">
                            <thead className="bg-[#374151] border-b fos-grid-thead text-white sticky top-0">
                                <tr>{["AWBCode","Type","Date","Supplier","Freight","Boxes","Description","Invoice","Inv.Date",""].map(h => <th key={h} className="p-2 border-r border-gray-200 last:border-r-0 whitespace-nowrap">{h}</th>)}</tr>
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
                                        <td className="p-2"><button onClick={e => { e.stopPropagation(); del(row); }} className="text-red-500 hover:text-red-700"><Trash2 size={13}/></button></td>
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
    // SP sp_flower_packing_box_update_new params (verified):
    // @lcunico, @lccustomer_uq, @lncustomer, @lccporder_no, @lcproduct_uq,
    // @lccase_uq, @lncut, @lnbox_qty, @lnpacks_box, @lnpacks_units,
    // @lnunits_x_box, @lnfreight_cost, @lnhandling_cost, @lnduties_cost,
    // @lnbroker_cost, @lncharge_cost, @f_cost_x_u, @lnprice_x_u,
    // @lcbox_id, @lcinventory_notes
    const [form, setForm] = useState<any>({
        // Editable cost fields
        freight_cost:    parseFloat(box?.F_COST_X_U   ?? 0),
        handling_cost:   0,
        duties_cost:     0,
        broker_cost:     0,
        charge_cost:     0,
        f_cost_x_u:      parseFloat(box?.F_COST_X_U   ?? 0),
        price_x_u:       parseFloat(box?.F_FCOST_X_U  ?? 0),
        box_qty:         parseInt(box?.BOX_QTY         ?? 0),
        units_x_box:     parseInt(box?.TOTAL_UNITS     ?? 0),
        inventory_notes: "",
        // Pass-through from existing row (not shown in form)
        customer_uq:     box?.CUSTOMER_UQ  ?? "",
        customer_num:    box?.CUSTOMER_NUM ?? 0,
        cporder_no:      box?.CPORDER_NO   ?? box?.PODER_NO ?? "",
        product_uq:      box?.PRO_PACK_UQ  ?? box?.PRODUCT_UQ ?? "",
        case_uq:         box?.CASE_UQ      ?? "",
        cut:             box?.CUT          ?? 0,
        packs_box:       box?.PACKS_BOX    ?? 0,
        packs_units:     box?.PACKS_UNITS  ?? 0,
        box_id:          box?.BOXNUM       ?? "",
    });
    const [saving, setSaving] = useState(false);
    const [error,  setError]  = useState<string | null>(null);

    const totalUnits = (form.units_x_box || 0) * (form.box_qty || 0);
    const tCostXU    = (form.freight_cost || 0) + (form.handling_cost || 0) + (form.duties_cost || 0) + (form.broker_cost || 0) + (form.charge_cost || 0);

    const F = (key: string, num = false) => num
        ? { type: "number", step: "0.01", value: form[key] ?? 0, onChange: (e: any) => setForm((p: any) => ({ ...p, [key]: parseFloat(e.target.value) || 0 })) }
        : { value: form[key] ?? "", onChange: (e: any) => setForm((p: any) => ({ ...p, [key]: e.target.value })) };

    const save = async () => {
        setSaving(true); setError(null);
        try {
            const res = await fetch(`/api/awbs/boxes/${box.UNICO}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
            const d = await res.json();
            if (!d.success) throw new Error(d.error);
            toast.success("Box updated.");
            onSaved(box.UNICO);
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
                <div className="flex flex-col gap-0.5"><label className="text-[9px] font-black text-gray-400 uppercase">AWBCode</label><input readOnly value={t(box?.AWBCODE)} className="fos-input py-1 bg-gray-50 text-gray-500 font-bold"/></div>
                <div className="flex flex-col gap-0.5"><label className="text-[9px] font-black text-gray-400 uppercase">Customer</label><input readOnly value={t(box?.CUSTOMER)} className="fos-input py-1 bg-gray-50 text-gray-500"/></div>
                <div className="flex flex-col gap-0.5"><label className="text-[9px] font-black text-gray-400 uppercase">Box Qty</label><input {...F("box_qty", true)} className="fos-input py-1"/></div>
                <div className="flex flex-col gap-0.5"><label className="text-[9px] font-black text-gray-400 uppercase">Units x Box</label><input {...F("units_x_box", true)} className="fos-input py-1"/></div>
                <div className="flex flex-col gap-0.5"><label className="text-[9px] font-black text-gray-400 uppercase">Total Units (calc.)</label><input readOnly value={totalUnits} className="fos-input py-1 bg-gray-50 text-gray-500 font-bold"/></div>
                <div className="flex flex-col gap-0.5"><label className="text-[9px] font-black text-gray-400 uppercase">F. Cost x U</label><input {...F("f_cost_x_u", true)} className="fos-input py-1"/></div>
                <div className="flex flex-col gap-0.5"><label className="text-[9px] font-black text-gray-400 uppercase">Price x U</label><input {...F("price_x_u", true)} className="fos-input py-1"/></div>
                <div className="flex flex-col gap-0.5"><label className="text-[9px] font-black text-gray-400 uppercase">Freight Cost</label><input {...F("freight_cost", true)} className="fos-input py-1"/></div>
                <div className="flex flex-col gap-0.5"><label className="text-[9px] font-black text-gray-400 uppercase">Handling Cost</label><input {...F("handling_cost", true)} className="fos-input py-1"/></div>
                <div className="flex flex-col gap-0.5"><label className="text-[9px] font-black text-gray-400 uppercase">Duties Cost</label><input {...F("duties_cost", true)} className="fos-input py-1"/></div>
                <div className="flex flex-col gap-0.5"><label className="text-[9px] font-black text-gray-400 uppercase">Broker Cost</label><input {...F("broker_cost", true)} className="fos-input py-1"/></div>
                <div className="flex flex-col gap-0.5"><label className="text-[9px] font-black text-gray-400 uppercase">Charge Cost</label><input {...F("charge_cost", true)} className="fos-input py-1"/></div>
                <div className="flex flex-col gap-0.5"><label className="text-[9px] font-black text-gray-400 uppercase">Total Cost (calc.)</label><input readOnly value={fmt(tCostXU)} className="fos-input py-1 bg-gray-50 text-gray-500 font-bold"/></div>
                <div className="col-span-2 flex flex-col gap-0.5"><label className="text-[9px] font-black text-gray-400 uppercase">Notes</label><input {...F("inventory_notes")} className="fos-input py-1"/></div>
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
            const res = await fetch("/api/awbs/varieties/mpf", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ awbcode, ...form }) });
            const d = await res.json();
            if (!d.success) throw new Error(d.error);
            toast.success("MPF updated.");
            onSaved(awbcode);
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
                <div className="flex flex-col gap-0.5"><label className="text-[9px] font-black text-gray-400 uppercase">AWBCode</label><input readOnly value={awbcode} className="fos-input py-1 bg-gray-50 text-gray-500 font-bold"/></div>
                <div className="flex flex-col gap-0.5"><label className="text-[9px] font-black text-gray-400 uppercase">Entry Code *</label><input value={form.entry_code} onChange={e => setForm(p => ({ ...p, entry_code: e.target.value }))} className="fos-input py-1"/></div>
                <div className="flex flex-col gap-0.5"><label className="text-[9px] font-black text-gray-400 uppercase">MPF *</label><input type="number" step="0.01" value={form.mpf} onChange={e => setForm(p => ({ ...p, mpf: parseFloat(e.target.value) || 0 }))} className="fos-input py-1"/></div>
            </div>
        </Modal>
    );
}

// ─── Change AWB Date Modal ────────────────────────────────────────────────────
function ChangeDateModal({ awbcode, currentDate, onClose, onSaved }: any) {
    const [newDate, setNewDate] = useState(currentDate?.split("T")[0] ?? today());
    const [saving,  setSaving]  = useState(false);
    const [error,   setError]   = useState<string | null>(null);

    const save = async () => {
        if (!newDate) { setError("Date is required."); return; }
        setSaving(true); setError(null);
        try {
            const res = await fetch(`/api/awbs/${encodeURIComponent(awbcode)}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ new_date: newDate }) });
            const d = await res.json();
            if (!d.success) throw new Error(d.error);
            toast.success("AWB date updated.");
            onSaved(awbcode);
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
            <div className="flex flex-col gap-0.5 text-xs">
                <label className="text-[9px] font-black text-gray-400 uppercase">New Date *</label>
                <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="fos-input py-1.5"/>
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
                    <thead className="bg-[#374151] border-b fos-grid-thead text-white sticky top-0">
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
    // ── 1. Auth, audit, permissions — ALWAYS first, before any state or returns ─
    const { status } = useSession();
    const router = useRouter();
    const qc     = useQueryClient();
    const { logAction } = useAuditLog("awbs", "flower_awbs");
    const perms          = usePagePermissions("awbs");

    // ── 2. State ──────────────────────────────────────────────────────────────
    const [ldDate,    setLdDate]    = useState(today());
    const [ldEndDate, setLdEndDate] = useState(today());
    const [lcAirline, setLcAirline] = useState("%");
    const [awbSearch, setAwbSearch] = useState("");
    const [searchKey, setSearchKey] = useState(0);  // 0 = not yet searched

    const [selAwb,     setSelAwb]     = useState<any>(null);
    const [selVendor,  setSelVendor]  = useState<any>(null);
    const [selCharge,  setSelCharge]  = useState<any>(null);
    const [selByDate,  setSelByDate]  = useState<any>(null);
    const [selBox,     setSelBox]     = useState<any>(null);
    const [selVariety, setSelVariety] = useState<any>(null);
    const [activeTab,  setActiveTab]  = useState<TabId>("vendors");

    const [chargesModal,        setChargesModal]        = useState<{ mode: "add" | "edit" } | null>(null);
    const [freightsModal,       setFreightsModal]       = useState<{ mode: "add" | "edit" } | null>(null);
    const [invoiceChargesModal, setInvoiceChargesModal] = useState(false);
    const [boxesModal,          setBoxesModal]          = useState(false);
    const [mpfModal,            setMpfModal]            = useState(false);
    const [changeDateModal,     setChangeDateModal]     = useState(false);
    const [reportModal,         setReportModal]         = useState<{ title: string; records: any[] } | null>(null);

    // ── 3. Redirect — via useEffect, NOT early return before hooks ────────────
    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
    }, [status, router]);

    // ── 4. Data queries — ALL declared here, before any early returns ─────────
    const { data: airlines = EMPTY_ARR } = useQuery({
        queryKey: ["awb-airlines"],
        queryFn:  () => awbFetch("/api/awbs/airlines"),
        staleTime: 300000,
        enabled:  status === "authenticated",
        select:   (d: any) => norm(d.records ?? []),
    });

    // Main AWB grid: only fetches when searchKey > 0 (user pressed Search)
    const { data: awbs = EMPTY_ARR, isFetching: loadingAwbs } = useQuery({
        queryKey: ["awb-list", searchKey, ldDate, ldEndDate, lcAirline],
        queryFn:  () => awbFetch(`/api/awbs/list?from=${ldDate}&to=${ldEndDate}&airline=${encodeURIComponent(lcAirline)}`),
        enabled:  status === "authenticated" && searchKey > 0,
        select:   (d: any) => norm(d.records ?? []),
        staleTime: 0,
    });

    const { data: vendors = EMPTY_ARR, isFetching: loadingVendors } = useQuery({
        queryKey: ["awb-packing", selAwb?.AWBCODE],
        queryFn:  () => awbFetch(`/api/awbs/${encodeURIComponent(selAwb!.AWBCODE)}/packing`),
        enabled:  !!selAwb?.AWBCODE && activeTab === "vendors",
        select:   (d: any) => norm(d.records ?? []),
        staleTime: 0,
    });

    const { data: chargesTab = EMPTY_ARR, isFetching: loadingCharges } = useQuery({
        queryKey: ["awb-charges", selAwb?.AWBCODE],
        queryFn:  () => awbFetch(`/api/awbs/${encodeURIComponent(selAwb!.AWBCODE)}/charges`),
        enabled:  !!selAwb?.AWBCODE && activeTab === "charges",
        select:   (d: any) => norm(d.records ?? []),
        staleTime: 0,
    });

    const { data: boxes = EMPTY_ARR, isFetching: loadingBoxes } = useQuery({
        queryKey: ["awb-boxes", selAwb?.AWBCODE],
        queryFn:  () => awbFetch(`/api/awbs/${encodeURIComponent(selAwb!.AWBCODE)}/boxes`),
        enabled:  !!selAwb?.AWBCODE && activeTab === "boxes",
        select:   (d: any) => norm(d.records ?? []),
        staleTime: 0,
    });

    const { data: byDate = EMPTY_ARR, isFetching: loadingByDate } = useQuery({
        queryKey: ["awb-by-date", ldDate, ldEndDate],
        queryFn:  () => awbFetch(`/api/awbs/charges-by-date?from=${ldDate}&to=${ldEndDate}`),
        enabled:  status === "authenticated" && activeTab === "by-date",
        select:   (d: any) => norm(d.records ?? []),
        staleTime: 0,
    });

    const { data: varieties = EMPTY_ARR, isFetching: loadingVarieties } = useQuery({
        queryKey: ["awb-varieties", selAwb?.AWBCODE],
        queryFn:  () => awbFetch(`/api/awbs/${encodeURIComponent(selAwb!.AWBCODE)}/varieties`),
        enabled:  !!selAwb?.AWBCODE && activeTab === "varieties",
        select:   (d: any) => norm(d.records ?? []),
        staleTime: 0,
    });

    // ── 5. Guards — AFTER all hooks ───────────────────────────────────────────
    if (status === "loading") {
        return <div className="flex items-center justify-center h-screen"><Loader2 size={24} className="animate-spin text-[#FB7506]"/></div>;
    }
    if (status === "unauthenticated") return null;

    if (!perms.loading && !perms.canAccess) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4 text-center px-8">
                <XCircle size={48} className="text-red-400"/>
                <p className="text-sm text-gray-600 max-w-md">{PERMISSION_MSGS.access}</p>
                <button onClick={() => router.back()} className="px-4 py-2 rounded bg-gray-600 text-white text-sm font-bold">Go Back</button>
            </div>
        );
    }

    // ── 6. Event handlers ─────────────────────────────────────────────────────
    const handleSearch = () => {
        if (!perms.canQuery) { toast.error(PERMISSION_MSGS.access); return; }
        setSelAwb(null);
        setSearchKey(k => k + 1);
    };

    const handleAwbSearch = async () => {
        if (!awbSearch.trim()) return;
        try {
            const d = await awbFetch(`/api/awbs/search?q=${encodeURIComponent(awbSearch)}`);
            const records: any[] = d.records ?? [];
            if (!records.length) { toast.error("AWB not found."); return; }
            handleSelectAwb(records[0]);
        } catch (e: any) { toast.error((e as any).message); }
    };

    const handleSelectAwb = (row: any) => {
        setSelAwb(row);
        setSelVendor(null); setSelCharge(null); setSelByDate(null); setSelBox(null); setSelVariety(null);
        setActiveTab("vendors");
        qc.invalidateQueries({ queryKey: ["awb-packing",   row.AWBCODE] });
        qc.invalidateQueries({ queryKey: ["awb-charges",   row.AWBCODE] });
        qc.invalidateQueries({ queryKey: ["awb-boxes",     row.AWBCODE] });
        qc.invalidateQueries({ queryKey: ["awb-varieties", row.AWBCODE] });
    };

    const handleDeleteAwb = () => {
        if (!selAwb) return;
        if (!perms.canDelete) { toast.error(PERMISSION_MSGS.delete); return; }
        toastConfirm(`Delete AWB ${selAwb.AWBCODE}? This cannot be undone.`, async () => {
            try {
                const res = await fetch(`/api/awbs/${encodeURIComponent(selAwb.AWBCODE)}`, { method: "DELETE" });
                const d   = await res.json();
                if (!d.success) throw new Error(d.error);
                logAction("Delete", selAwb.AWBCODE, `AWB ${selAwb.AWBCODE} — ${t(selAwb.AIRLINE)}`);
                toast.success("AWB deleted.");
                setSelAwb(null);
                setSearchKey(k => k + 1);
            } catch (e: any) { toast.error((e as any).message); }
        });
    };

    const handleDeleteCharge = (row: any) => {
        if (!perms.canDelete) { toast.error(PERMISSION_MSGS.delete); return; }
        toastConfirm(`Delete charge?`, async () => {
            try {
                const res = await fetch(`/api/awbs/charges/${row.UNICO}`, { method: "DELETE" });
                const d   = await res.json();
                if (!d.success) throw new Error(d.error);
                logAction("Delete", row.UNICO, `AWB charge — AWB ${selAwb?.AWBCODE}`);
                toast.success("Charge deleted.");
                qc.invalidateQueries({ queryKey: ["awb-charges", selAwb?.AWBCODE] });
                setSelCharge(null);
            } catch (e: any) { toast.error((e as any).message); }
        });
    };

    const handleDeleteByDate = (row: any) => {
        if (!perms.canDelete) { toast.error(PERMISSION_MSGS.delete); return; }
        toastConfirm(`Delete freight charge?`, async () => {
            try {
                const res = await fetch(`/api/awbs/charges-by-date/${row.UNICO}`, { method: "DELETE" });
                const d   = await res.json();
                if (!d.success) throw new Error(d.error);
                logAction("Delete", row.UNICO, `AWB freight charge by date`);
                toast.success("Charge deleted.");
                qc.invalidateQueries({ queryKey: ["awb-by-date", ldDate, ldEndDate] });
                setSelByDate(null);
            } catch (e: any) { toast.error((e as any).message); }
        });
    };

    const handleAddVariety = () => {
        if (!selAwb) return;
        if (!perms.canCreate) { toast.error(PERMISSION_MSGS.create); return; }
        toastConfirm(`Add varieties for AWB ${selAwb.AWBCODE}?`, async () => {
            try {
                const res = await fetch("/api/awbs/varieties", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ awbcode: selAwb.AWBCODE }) });
                const d = await res.json();
                if (!d.success) throw new Error(d.error);
                logAction("Insert", selAwb.AWBCODE, `Varieties for AWB ${selAwb.AWBCODE}`);
                toast.success("Variety added.");
                qc.invalidateQueries({ queryKey: ["awb-varieties", selAwb.AWBCODE] });
            } catch (e: any) { toast.error((e as any).message); }
        });
    };

    const handleDeleteVariety = (row: any) => {
        if (!perms.canDelete) { toast.error(PERMISSION_MSGS.delete); return; }
        toastConfirm(`Delete variety?`, async () => {
            try {
                const res = await fetch(`/api/awbs/varieties/${row.UNICO}`, { method: "DELETE" });
                const d   = await res.json();
                if (!d.success) throw new Error(d.error);
                logAction("Delete", row.UNICO, `Variety — AWB ${selAwb?.AWBCODE}`);
                toast.success("Variety deleted.");
                qc.invalidateQueries({ queryKey: ["awb-varieties", selAwb?.AWBCODE] });
                setSelVariety(null);
            } catch (e: any) { toast.error((e as any).message); }
        });
    };

    const handleReport = async (type: "products" | "duties") => {
        if (!selAwb) return;
        if (!perms.canReport) { toast.error(PERMISSION_MSGS.report); return; }
        try {
            const grower = type === "duties" ? (selVendor?.GROWER_UQ ?? "") : "%";
            const date   = selAwb.DATE_INVO ?? selAwb.BOX_DATE ?? ldDate;
            const url    = type === "products"
                ? `/api/awbs/reports/products?date_invo=${date}&awbcode=${encodeURIComponent(selAwb.AWBCODE)}&grower_uq=${encodeURIComponent(grower)}`
                : `/api/awbs/reports/duties?date_invo=${date}&awbcode=${encodeURIComponent(selAwb.AWBCODE)}&grower_uq=${encodeURIComponent(grower)}`;
            const d = await awbFetch(url);
            setReportModal({ title: type === "products" ? "Products Report" : "Credits Duties Report", records: d.records ?? [] });
        } catch (e: any) { toast.error((e as any).message); }
    };

    const handleVendorPrint = async () => {
        if (!selAwb || !selVendor) return;
        if (!perms.canReport) { toast.error(PERMISSION_MSGS.report); return; }
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

    // ── 7. Render ─────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col h-[100dvh] bg-[#FBF9F8] overflow-hidden">

            {/* Header */}
            <AppHeader title="AWBs — Air Waybill Costs" icon={Plane} useBack extraRight={perms.loading ? <Loader2 size={14} className="animate-spin text-white/60"/> : undefined} />

            {/* Filter bar */}
            <div className="bg-[#F5F3F3] border border-[#DBD9D9] rounded-lg px-4 py-2.5 flex flex-wrap items-center gap-3 shrink-0 mx-2 mt-2">
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
                    <select value={lcAirline} onChange={e => setLcAirline(e.target.value)} className="fos-input py-1 w-48">
                        <option value="%">— All Airlines —</option>
                        {(airlines as any[]).map((a: any) => (
                            <option key={a.UNICO ?? a.COD_LINEA} value={a.COD_LINEA ?? a.AIRLINE}>
                                {t(a.AIRLINE)} ({t(a.COD_LINEA)})
                            </option>
                        ))}
                    </select>
                </div>
                <Btn icon={loadingAwbs ? RefreshCcw : Search} label={loadingAwbs ? "Loading..." : "Search"} color="orange" onClick={handleSearch} disabled={loadingAwbs}/>
                <div className="flex items-center gap-1.5 text-xs ml-auto">
                    <label className="text-[9px] font-black text-gray-400 uppercase">AWB #</label>
                    <input value={awbSearch} onChange={e => setAwbSearch(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleAwbSearch()}
                        placeholder="Search by code..." className="fos-input py-1 w-44"/>
                    <Btn icon={Search} label="Go" color="blue" onClick={handleAwbSearch} disabled={!awbSearch.trim()}/>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-h-0 p-3 gap-3">

                {/* AWB grid */}
                <div className="bg-white rounded-b border border-[#DBD9D9] shadow-sm overflow-auto" style={{ maxHeight: "35vh" }}>
                    <div className="h-10 bg-white flex items-center justify-between pl-3 pr-0 shrink-0 rounded-t-lg border-b border-[#DBD9D9]">
                        <div className="flex items-center gap-2">
                            <Plane size={15} className="text-[#FB7506]"/>
                            <span className="text-[#4F4F4F] text-[14px] font-bold uppercase">AWBs</span>
                            {selAwb && (
                                <span className="text-xs text-gray-500 ml-2">
                                    {t(selAwb.AWBCODE)} — {t(selAwb.AIRLINE)} — {fmtDate(selAwb.BOX_DATE)}
                                </span>
                            )}
                        </div>
                        <GridMenu items={[
                            { label: "Update", icon: Pencil, color: "orange", onClick: () => { if (!selAwb) { toast.error("Select an AWB."); return; } if (!perms.canEdit) { toast.error(PERMISSION_MSGS.edit); return; } /* open update modal */ }, disabled: !selAwb || !perms.canEdit },
                            { label: "Delete", icon: Trash2, color: "red", onClick: handleDeleteAwb, disabled: !selAwb || !perms.canDelete },
                            { label: "Set MPF", icon: Package, color: "blue", onClick: () => { if (!perms.canEdit) { toast.error(PERMISSION_MSGS.edit); return; } setMpfModal(true); }, disabled: !selAwb || !perms.canEdit },
                            { label: "Change Awb Date", icon: Calendar, color: "blue", onClick: () => { if (!perms.canEdit) { toast.error(PERMISSION_MSGS.edit); return; } setChangeDateModal(true); }, disabled: !selAwb || !perms.canEdit },
                            { label: "Products", icon: Printer, color: "gray", onClick: () => handleReport("products"), disabled: !selAwb || !perms.canReport },
                            { label: "Credits Duties", icon: BarChart2, color: "gray", onClick: () => handleReport("duties"), disabled: !selAwb || !perms.canReport },
                        ]} />
                    </div>
                    {loadingAwbs ? (
                        <div className="flex items-center gap-2 text-gray-400 text-xs p-4"><Loader2 size={14} className="animate-spin"/>Loading AWBs...</div>
                    ) : (
                        <table className="min-w-full text-left text-xs">
                            <thead className="bg-[#4F4F4F] border-b border-[#DBD9D9] text-white text-[11px] font-bold uppercase sticky top-0">
                                <tr>{["AWBCode","Airline","Air Code","Box Date","Inv Date","Boxes","Units","Charge","Handling","Freight","Duties","Broker","Total"].map(h => (
                                    <th key={h} className="p-2 whitespace-nowrap border-r border-[#DBD9D9]/30 last:border-r-0">{h}</th>
                                ))}</tr>
                            </thead>
                            <tbody className="fos-grid-tbody divide-y divide-[#DBD9D9]">
                                {(awbs as any[]).map((row: any) => (
                                    <tr key={row.AWBCODE} onClick={() => handleSelectAwb(row)}
                                        className={cn("cursor-pointer transition-colors divide-x divide-[#DBD9D9]", selAwb?.AWBCODE === row.AWBCODE ? "!bg-[#FB7506]/10" : "hover:bg-gray-50")}>
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
                                        {searchKey === 0 ? "Set filters and click Search to load AWBs." : "No AWBs found for the selected filters."}
                                    </td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Tabs */}
                <div className="bg-white rounded border border-[#DBD9D9] shadow-sm flex-1 flex flex-col min-h-0">
                    <div className="h-10 bg-[#F5F3F3] border-b border-[#DBD9D9] flex items-end px-2 gap-0.5 shrink-0 overflow-x-auto">
                        {TABS.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={cn("flex items-center px-4 h-8 text-xs font-bold uppercase tracking-wide rounded-t transition-all whitespace-nowrap",
                                    activeTab === tab.id ? "bg-white text-[#FB7506] border-b-2 border-[#FB7506]" : "text-gray-500 hover:text-[#FB7506] hover:bg-white/60")}>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-auto p-2">

                        {/* Tab 1: Vendors x Awb */}
                        {activeTab === "vendors" && (
                            <div className="flex flex-col h-full">
                                <div className="h-10 bg-white flex items-center justify-between pl-3 pr-0 shrink-0 rounded-t-lg border-b border-[#DBD9D9]">
                                    <div className="flex items-center gap-2">
                                        <FileText size={15} className="text-[#FB7506]"/>
                                        <span className="text-[#4F4F4F] text-[14px] font-bold uppercase">Vendor Invoices x AWB</span>
                                    </div>
                                    <GridMenu items={[
                                        { label: "Add Invoice Charge", icon: Plus, color: "green", onClick: () => { if (!perms.canCreate) { toast.error(PERMISSION_MSGS.create); return; } setInvoiceChargesModal(true); }, disabled: !selVendor || !perms.canCreate },
                                        { label: "Print", icon: Printer, color: "gray", onClick: handleVendorPrint, disabled: !selVendor || !perms.canReport },
                                    ]} />
                                </div>
                                <TabLoading loading={loadingVendors}/>
                                {!loadingVendors && (
                                    <div className="overflow-auto flex-1">
                                        <table className="min-w-full text-left text-xs">
                                            <thead className="bg-[#4F4F4F] border-b border-[#DBD9D9] text-white text-[11px] font-bold uppercase sticky top-0">
                                                <tr>{["Pack UQ","Packing No","Invoice No","AWBCode","Box Date","Inv Date","Grower","Farm","Boxes","Units","Charge","Handling","Freight"].map(h => (
                                                    <th key={h} className="p-2 whitespace-nowrap border-r border-[#DBD9D9]/30 last:border-r-0">{h}</th>
                                                ))}</tr>
                                            </thead>
                                            <tbody className="fos-grid-tbody divide-y divide-[#DBD9D9]">
                                                {(vendors as any[]).map((row: any) => (
                                                    <tr key={row.PACK_UQ} onClick={() => setSelVendor(row)}
                                                        className={cn("cursor-pointer transition-colors divide-x divide-[#DBD9D9]", selVendor?.PACK_UQ === row.PACK_UQ ? "!bg-[#FB7506]/10" : "hover:bg-gray-50")}>
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
                                                {!selAwb && <tr><td colSpan={13} className="p-4 text-center text-gray-400">Select an AWB from the grid above.</td></tr>}
                                                {selAwb && !(vendors as any[]).length && !loadingVendors && <tr><td colSpan={13} className="p-4 text-center text-gray-400">No vendor invoices for this AWB.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab 2: Charges Applied by Awb */}
                        {activeTab === "charges" && (
                            <div className="flex flex-col h-full">
                                <div className="h-10 bg-white flex items-center justify-between pl-3 pr-0 shrink-0 rounded-t-lg border-b border-[#DBD9D9]">
                                    <div className="flex items-center gap-2">
                                        <DollarSign size={15} className="text-[#FB7506]"/>
                                        <span className="text-[#4F4F4F] text-[14px] font-bold uppercase">AWB's Direct Cost by Prorate by AWB</span>
                                    </div>
                                    <GridMenu items={[
                                        { label: "Add", icon: Plus, color: "green", onClick: () => { if (!perms.canCreate) { toast.error(PERMISSION_MSGS.create); return; } setSelCharge(null); setChargesModal({ mode: "add" }); }, disabled: !selAwb || !perms.canCreate },
                                        { label: "Edit", icon: Pencil, color: "orange", onClick: () => { if (!perms.canEdit) { toast.error(PERMISSION_MSGS.edit); return; } setChargesModal({ mode: "edit" }); }, disabled: !selCharge || !perms.canEdit },
                                        { label: "Delete", icon: Trash2, color: "red", onClick: () => handleDeleteCharge(selCharge), disabled: !selCharge || !perms.canDelete },
                                    ]} />
                                </div>
                                <TabLoading loading={loadingCharges}/>
                                {!loadingCharges && (
                                    <div className="overflow-auto flex-1">
                                        <table className="min-w-full text-left text-xs">
                                            <thead className="bg-[#4F4F4F] border-b border-[#DBD9D9] text-white text-[11px] font-bold uppercase sticky top-0">
                                                <tr>{["UNICO","OC Amount","Description","Date","O.Charges","Handling","Freight","Broker","Duties","Boxes","AP Type","Grower","AWBCode","Invoice"].map(h => (
                                                    <th key={h} className="p-2 whitespace-nowrap border-r border-[#DBD9D9]/30 last:border-r-0">{h}</th>
                                                ))}</tr>
                                            </thead>
                                            <tbody className="fos-grid-tbody divide-y divide-[#DBD9D9]">
                                                {(chargesTab as any[]).map((row: any) => (
                                                    <tr key={row.UNICO} onClick={() => setSelCharge(row)}
                                                        className={cn("cursor-pointer transition-colors divide-x divide-[#DBD9D9]", selCharge?.UNICO === row.UNICO ? "!bg-[#FB7506]/10" : "hover:bg-gray-50")}>
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
                                                {!selAwb && <tr><td colSpan={14} className="p-4 text-center text-gray-400">Select an AWB from the grid above.</td></tr>}
                                                {selAwb && !(chargesTab as any[]).length && !loadingCharges && <tr><td colSpan={14} className="p-4 text-center text-gray-400">No charges for this AWB.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab 3: Boxes x AWB */}
                        {activeTab === "boxes" && (
                            <div className="flex flex-col h-full">
                                <div className="h-10 bg-white flex items-center justify-between pl-3 pr-0 shrink-0 rounded-t-lg border-b border-[#DBD9D9]">
                                    <div className="flex items-center gap-2">
                                        <Package size={15} className="text-[#FB7506]"/>
                                        <span className="text-[#4F4F4F] text-[14px] font-bold uppercase">Boxes x AWB</span>
                                    </div>
                                    <GridMenu items={[
                                        { label: "Edit", icon: Pencil, color: "orange", onClick: () => { if (!perms.canEdit) { toast.error(PERMISSION_MSGS.edit); return; } setBoxesModal(true); }, disabled: !selBox || !perms.canEdit },
                                    ]} />
                                </div>
                                <TabLoading loading={loadingBoxes}/>
                                {!loadingBoxes && (
                                    <div className="overflow-auto flex-1">
                                        <table className="min-w-full text-left text-xs">
                                            <thead className="bg-[#4F4F4F] border-b border-[#DBD9D9] text-white text-[11px] font-bold uppercase sticky top-0">
                                                <tr>{["Ready","Order","UNICO","Sel","Lote","Market","P.Order","Customer","Qty","Box Date","Days","Box Qty","BoxNum","Units","F.Cost","FC.Cost"].map(h => (
                                                    <th key={h} className="p-2 whitespace-nowrap border-r border-[#DBD9D9]/30 last:border-r-0">{h}</th>
                                                ))}</tr>
                                            </thead>
                                            <tbody className="fos-grid-tbody divide-y divide-[#DBD9D9]">
                                                {(boxes as any[]).map((row: any) => (
                                                    <tr key={row.UNICO} onClick={() => setSelBox(row)}
                                                        className={cn("cursor-pointer transition-colors divide-x divide-[#DBD9D9]", selBox?.UNICO === row.UNICO ? "!bg-[#FB7506]/10" : "hover:bg-gray-50")}>
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
                                                {!selAwb && <tr><td colSpan={16} className="p-4 text-center text-gray-400">Select an AWB from the grid above.</td></tr>}
                                                {selAwb && !(boxes as any[]).length && !loadingBoxes && <tr><td colSpan={16} className="p-4 text-center text-gray-400">No boxes for this AWB.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab 4: Charges Applied by Date */}
                        {activeTab === "by-date" && (
                            <div className="flex flex-col h-full">
                                <div className="h-10 bg-white flex items-center justify-between pl-3 pr-0 shrink-0 rounded-t-lg border-b border-[#DBD9D9]">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={15} className="text-[#FB7506]"/>
                                        <span className="text-[#4F4F4F] text-[14px] font-bold uppercase">AWB's Direct Cost Prorate by Date</span>
                                    </div>
                                    <GridMenu items={[
                                        { label: "Add", icon: Plus, color: "green", onClick: () => { if (!perms.canCreate) { toast.error(PERMISSION_MSGS.create); return; } setSelByDate(null); setFreightsModal({ mode: "add" }); }, disabled: !perms.canCreate },
                                        { label: "Edit", icon: Pencil, color: "orange", onClick: () => { if (!perms.canEdit) { toast.error(PERMISSION_MSGS.edit); return; } setFreightsModal({ mode: "edit" }); }, disabled: !selByDate || !perms.canEdit },
                                        { label: "Delete", icon: Trash2, color: "red", onClick: () => handleDeleteByDate(selByDate), disabled: !selByDate || !perms.canDelete },
                                    ]} />
                                </div>
                                <TabLoading loading={loadingByDate}/>
                                {!loadingByDate && (
                                    <div className="overflow-auto flex-1">
                                        <table className="min-w-full text-left text-xs">
                                            <thead className="bg-[#4F4F4F] border-b border-[#DBD9D9] text-white text-[11px] font-bold uppercase sticky top-0">
                                                <tr>{["UNICO","AP Type","Supplier","Charge Date","Apply From","Apply To","Total Box","Duties","O.Charges","Notes","Invoice","Timestamp"].map(h => (
                                                    <th key={h} className="p-2 whitespace-nowrap border-r border-[#DBD9D9]/30 last:border-r-0">{h}</th>
                                                ))}</tr>
                                            </thead>
                                            <tbody className="fos-grid-tbody divide-y divide-[#DBD9D9]">
                                                {(byDate as any[]).map((row: any) => (
                                                    <tr key={row.UNICO} onClick={() => setSelByDate(row)}
                                                        className={cn("cursor-pointer transition-colors divide-x divide-[#DBD9D9]", selByDate?.UNICO === row.UNICO ? "!bg-[#FB7506]/10" : "hover:bg-gray-50")}>
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
                                                {!(byDate as any[]).length && !loadingByDate && <tr><td colSpan={12} className="p-4 text-center text-gray-400">No charges by date in this period.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab 5: Varieties */}
                        {activeTab === "varieties" && (
                            <div className="flex flex-col h-full">
                                <div className="h-10 bg-white flex items-center justify-between pl-3 pr-0 shrink-0 rounded-t-lg border-b border-[#DBD9D9]">
                                    <div className="flex items-center gap-2">
                                        <BarChart2 size={15} className="text-[#FB7506]"/>
                                        <span className="text-[#4F4F4F] text-[14px] font-bold uppercase">Varieties x AWB</span>
                                    </div>
                                    <GridMenu items={[
                                        { label: "Add", icon: Plus, color: "green", onClick: handleAddVariety, disabled: !selAwb || !perms.canCreate },
                                        { label: "Delete", icon: Trash2, color: "red", onClick: () => handleDeleteVariety(selVariety), disabled: !selVariety || !perms.canDelete },
                                    ]} />
                                </div>
                                <TabLoading loading={loadingVarieties}/>
                                {!loadingVarieties && (
                                    <div className="overflow-auto flex-1">
                                        <table className="min-w-full text-left text-xs">
                                            <thead className="bg-[#4F4F4F] border-b border-[#DBD9D9] text-white text-[11px] font-bold uppercase sticky top-0">
                                                <tr>{Object.keys((varieties as any[])[0] ?? { UNICO: "", AWBCODE: "" }).map(h => (
                                                    <th key={h} className="p-2 whitespace-nowrap border-r border-[#DBD9D9]/30 last:border-r-0">{h}</th>
                                                ))}</tr>
                                            </thead>
                                            <tbody className="fos-grid-tbody divide-y divide-[#DBD9D9]">
                                                {(varieties as any[]).map((row: any, i: number) => (
                                                    <tr key={row.UNICO ?? i} onClick={() => setSelVariety(row)}
                                                        className={cn("cursor-pointer transition-colors divide-x divide-[#DBD9D9]", selVariety?.UNICO === row.UNICO ? "!bg-[#FB7506]/10" : "hover:bg-gray-50")}>
                                                        {Object.values(row).map((v: any, j: number) => <td key={j} className="p-2">{t(v)}</td>)}
                                                    </tr>
                                                ))}
                                                {!selAwb && <tr><td colSpan={5} className="p-4 text-center text-gray-400">Select an AWB from the grid above.</td></tr>}
                                                {selAwb && !(varieties as any[]).length && !loadingVarieties && <tr><td colSpan={5} className="p-4 text-center text-gray-400">No varieties for this AWB.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            {chargesModal && selAwb && (
                <AwbsChargesModal
                    mode={chargesModal.mode}
                    charge={chargesModal.mode === "edit" ? selCharge : null}
                    awbcode={selAwb.AWBCODE}
                    onClose={() => setChargesModal(null)}
                    onSaved={(unico: string) => {
                        logAction(chargesModal.mode === "edit" ? "Edit" : "Insert", unico, `AWB ${selAwb.AWBCODE} charge`);
                        qc.invalidateQueries({ queryKey: ["awb-charges", selAwb.AWBCODE] });
                    }}
                />
            )}
            {freightsModal && (
                <AwbsFreightsModal
                    mode={freightsModal.mode}
                    charge={freightsModal.mode === "edit" ? selByDate : null}
                    awbcode={selAwb?.AWBCODE ?? ""}
                    airline={selAwb?.AIRLINE ?? ""}
                    onClose={() => setFreightsModal(null)}
                    onSaved={(unico: string) => {
                        logAction(freightsModal.mode === "edit" ? "Edit" : "Insert", unico, `AWB freight charge by date`);
                        qc.invalidateQueries({ queryKey: ["awb-by-date", ldDate, ldEndDate] });
                    }}
                />
            )}
            {invoiceChargesModal && selAwb && selVendor && (
                <AwbsInvoiceChargesModal
                    packUq={selVendor.PACK_UQ}
                    awbcode={selAwb.AWBCODE}
                    onClose={() => setInvoiceChargesModal(false)}
                    onSaved={(unico: string, mode: string) => {
                        logAction(mode === "delete" ? "Delete" : mode === "edit" ? "Edit" : "Insert", unico, `Invoice charge — AWB ${selAwb.AWBCODE}`);
                        qc.invalidateQueries({ queryKey: ["awb-packing", selAwb.AWBCODE] });
                    }}
                />
            )}
            {boxesModal && selBox && (
                <AwbsBoxesModal
                    box={selBox}
                    onClose={() => setBoxesModal(false)}
                    onSaved={(unico: string) => {
                        logAction("Edit", unico, `Box ${t(selBox.BOXNUM)} — AWB ${selAwb?.AWBCODE}`);
                        qc.invalidateQueries({ queryKey: ["awb-boxes", selAwb?.AWBCODE] });
                        setSelBox(null);
                    }}
                />
            )}
            {mpfModal && selAwb && (
                <AwbsVarietiesMpfModal
                    awbcode={selAwb.AWBCODE}
                    onClose={() => setMpfModal(false)}
                    onSaved={(unico: string) => {
                        logAction("Edit", unico, `MPF — AWB ${selAwb.AWBCODE}`);
                        qc.invalidateQueries({ queryKey: ["awb-varieties", selAwb.AWBCODE] });
                    }}
                />
            )}
            {changeDateModal && selAwb && (
                <ChangeDateModal
                    awbcode={selAwb.AWBCODE}
                    currentDate={selAwb.BOX_DATE}
                    onClose={() => setChangeDateModal(false)}
                    onSaved={(awbcode: string) => {
                        logAction("Edit", awbcode, `AWB date change`);
                        setSearchKey(k => k + 1);
                    }}
                />
            )}
            {reportModal && (
                <ReportModal title={reportModal.title} records={reportModal.records} onClose={() => setReportModal(null)}/>
            )}
            <AppFooter areaLabel="Logistics" />
        </div>
    );
}
