"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    RefreshCcw, Search, XCircle, Save, Trash2,
    Plus, Pencil, Printer, BarChart2, Calendar, Plane, FileText,
    Package, DollarSign, Loader2, X, Upload,
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
import { useAwbStore } from "@/store/useAwbStore";
import { ReportModal } from "@/components/reports/ReportModal";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const EMPTY_ARR: any[] = [];
const t       = (v: any) => String(v ?? "").trim();
const fmt     = (v: any) => parseFloat(v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (v: any) => { if (!v) return ""; const d = new Date(v); return isNaN(d.getTime()) ? t(v) : d.toLocaleDateString("en-US"); };
const today   = () => new Date().toISOString().split("T")[0];

const norm = (records: any[]) => records.map(r => {
    const n: any = {};
    for (const [k, v] of Object.entries(r)) n[k.toUpperCase()] = v;
    return n;
});

const awbFetch = async (url: string) => {
    const r = await fetch(url);
    const j = await r.json();
    if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`);
    return j;
};

const toastConfirm = (message: string, onConfirm: () => void) => {
    toast(message, {
        duration: 10000,
        action:  { label: "Confirm", onClick: onConfirm },
        cancel:  { label: "Cancel",  onClick: () => {} },
    });
};

// ─── Standard Modal Shell ─────────────────────────────────────────────────────
function FosModal({ title, icon: Icon, onClose, children, footer, size = "md", zIndex = 50 }: {
    title: string; icon?: any; onClose: () => void;
    children: React.ReactNode; footer?: React.ReactNode;
    size?: "sm" | "md" | "lg" | "xl"; zIndex?: number;
}) {
    const maxW = { sm: "sm:max-w-lg", md: "sm:max-w-2xl", lg: "sm:max-w-3xl", xl: "sm:max-w-5xl" }[size];
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4" style={{ zIndex }}>
            <div className={cn("bg-white rounded-xl shadow-2xl w-full flex flex-col", maxW)} style={{ maxHeight: "94dvh" }}>
                <div className="h-11 sm:h-10 bg-[#374151] rounded-t-xl flex items-center justify-between pl-3 pr-2 border-b border-black/10 shrink-0">
                    <div className="flex items-center gap-2 min-w-0">
                        {Icon && <Icon size={16} className="text-[#FB7506] shrink-0" />}
                        <span className="fos-grid-header-text truncate">{title}</span>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 sm:w-7 sm:h-7 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors shrink-0">
                        <X size={18} className="sm:hidden" /><X size={16} className="hidden sm:block" />
                    </button>
                </div>
                <div className="overflow-y-auto flex-1 p-3 sm:p-4">{children}</div>
                {footer && (
                    <div className="shrink-0 px-3 sm:px-4 py-3 bg-white border-t border-gray-100 flex gap-2">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

function SaveBtn({ saving, onClick }: { saving: boolean; onClick: () => void }) {
    return (
        <button onClick={onClick} disabled={saving}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded bg-[#FB7506] hover:bg-orange-600 text-white text-sm font-black disabled:opacity-50 transition-colors">
            {saving ? <RefreshCcw size={13} className="animate-spin" /> : <Save size={13} />}
            {saving ? "Saving..." : "Save"}
        </button>
    );
}

function CancelBtn({ onClick }: { onClick: () => void }) {
    return (
        <button onClick={onClick} className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 rounded border text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors">
            Cancel
        </button>
    );
}

// ─── SupplierCombobox ─────────────────────────────────────────────────────────
function SupplierCombobox({ suppliers, value, onChange }: { suppliers: any[]; value: string; onChange: (uq: string) => void }) {
    const [search,  setSearch]  = useState("");
    const [open,    setOpen]    = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const selected = (suppliers as any[]).find((s: any) => (s.UNICO ?? s.unico) === value);
    const display  = selected ? t(selected.GROWER ?? selected.grower ?? selected.SUPPLIER ?? selected.supplier) : "";

    const filtered = search.trim()
        ? (suppliers as any[]).filter((s: any) => t(s.GROWER ?? s.grower ?? s.SUPPLIER ?? s.supplier ?? "").toLowerCase().includes(search.toLowerCase()))
        : (suppliers as any[]);

    useEffect(() => {
        if (!open) return;
        const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, [open]);

    const pick = (uq: string) => { onChange(uq); setSearch(""); setOpen(false); };

    return (
        <div ref={ref} className="relative">
            <input
                type="text"
                value={open ? search : display}
                placeholder={display || "Search supplier…"}
                onFocus={() => { setSearch(""); setOpen(true); }}
                onChange={e => { setSearch(e.target.value); setOpen(true); }}
                className="fos-input h-10 sm:h-9 w-full text-xs"
            />
            {open && (
                <div className="absolute z-50 left-0 right-0 top-full mt-0.5 bg-white border border-gray-300 rounded shadow-lg max-h-52 overflow-y-auto text-xs">
                    {filtered.length === 0 ? (
                        <div className="px-3 py-2 text-gray-400 italic">No results</div>
                    ) : filtered.map((s: any) => {
                        const uq   = s.UNICO ?? s.unico;
                        const name = t(s.GROWER ?? s.grower ?? s.SUPPLIER ?? s.supplier ?? "");
                        return (
                            <div key={uq} onMouseDown={() => pick(uq)}
                                className={cn("px-3 py-1.5 cursor-pointer hover:bg-[#FB7506]/10",
                                    uq === value ? "bg-[#FB7506]/15 font-semibold text-[#FB7506]" : "text-gray-700")}>
                                {name}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ─── Modal 1: AWB Charges (per AWB) ──────────────────────────────────────────
function AwbsChargesModal({ mode, charge, awbcode, airline, onClose, onSaved }: any) {
    const isEdit = mode === "edit";
    const blank = { supplier_uq: "", ap_type_uq: "", invoice_date: today(), invoice_no: "", description: "", freight: 0, total_boxes: 0, full_boxes: 0, weight: 0 };
    const [form, setForm] = useState<any>(isEdit ? {
        supplier_uq:  charge?.SUPPLIER_UQ  ?? "",
        ap_type_uq:   charge?.AP_TYPE_UQ   ?? "",
        invoice_date: charge?.INVOICE_DATE?.split("T")[0] ?? today(),
        invoice_no:   charge?.INVOICE_NO   ?? "",
        description:  charge?.DESCRIPTION  ?? "",
        freight:      charge?.FREIGHT      ?? 0,
        total_boxes:  charge?.TOTAL_BOXES  ?? charge?.AUTO_FB  ?? 0,
        full_boxes:   charge?.FULL_BOXES   ?? 0,
        weight:       charge?.TOTAL_WEIGHT ?? charge?.WEIGHT   ?? 0,
    } : blank);
    const [saving,    setSaving]    = useState(false);
    const [error,     setError]     = useState<string | null>(null);
    const [scanning,  setScanning]  = useState(false);
    const [scanError, setScanError] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const { data: suppliers   = EMPTY_ARR } = useQuery({ queryKey: ["awb-suppliers"],    queryFn: () => awbFetch("/api/awbs/lookups/suppliers"),    staleTime: 60000, select: (d: any) => d.records ?? [] });
    const { data: chargeTypes = EMPTY_ARR } = useQuery({ queryKey: ["awb-chargetypes"],  queryFn: () => awbFetch("/api/awbs/lookups/charge-types"), staleTime: 60000, select: (d: any) => d.records ?? [] });

    // Edit mode: SP doesn't return ap_type_uq or supplier_uq — reverse-lookup once lookups load
    useEffect(() => {
        if (!isEdit) return;
        const updates: any = {};
        if (!form.ap_type_uq && charge?.AP_TYPE && (chargeTypes as any[]).length > 0) {
            const found = (chargeTypes as any[]).find((c: any) =>
                t(c.type_name ?? c.TYPE_NAME ?? c.AP_TYPE ?? "").trim().toLowerCase() === t(charge.AP_TYPE ?? "").trim().toLowerCase()
            );
            if (found) updates.ap_type_uq = t(found.UNICO ?? found.unico);
        }
        if (!form.supplier_uq && charge?.GROWER && (suppliers as any[]).length > 0) {
            const found = (suppliers as any[]).find((s: any) =>
                t(s.GROWER ?? s.grower ?? "").trim().toLowerCase() === t(charge.GROWER ?? "").trim().toLowerCase()
            );
            if (found) updates.supplier_uq = t(found.UNICO ?? found.unico);
        }
        if (Object.keys(updates).length > 0) setForm((p: any) => ({ ...p, ...updates }));
    }, [chargeTypes, suppliers]);

    const F = (key: string, num = false) => num
        ? { type: "number" as const, step: "0.01", value: form[key] ?? 0, onChange: (e: any) => setForm((p: any) => ({ ...p, [key]: parseFloat(e.target.value) || 0 })) }
        : { value: form[key] ?? "", onChange: (e: any) => setForm((p: any) => ({ ...p, [key]: e.target.value })) };

    const fuzzySupplier = (name: string): string => {
        if (!name) return "";
        const n = name.toLowerCase().trim();
        for (const s of suppliers as any[]) {
            const g = t(s.GROWER ?? s.grower ?? "").toLowerCase();
            if (g === n) return t(s.UNICO ?? s.unico);
        }
        const words = n.split(/\s+/).filter((w: string) => w.length > 2);
        let best = "", bestScore = 0;
        for (const s of suppliers as any[]) {
            const g     = t(s.GROWER ?? s.grower ?? "").toLowerCase();
            const score = words.filter((w: string) => g.includes(w)).length;
            if (score > bestScore) { bestScore = score; best = t(s.UNICO ?? s.unico); }
        }
        return bestScore >= 1 ? best : "";
    };

    const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (fileRef.current) fileRef.current.value = "";
        if (!file) return;
        setScanning(true);
        setScanError(null);
        try {
            const fd = new FormData();
            fd.append("file", file);
            fd.append("awbcode", awbcode);
            const res  = await fetch("/api/awbs/charges/scan-invoice", { method: "POST", body: fd });
            const json = await res.json();
            if (!json.success) throw new Error(json.error ?? "Scan failed");
            const d = json.data;
            const supplierMatch = fuzzySupplier(d.vendor_name ?? "");
            setForm((p: any) => ({
                ...p,
                ...(d.amount       != null  ? { freight:      d.amount }       : {}),
                ...(d.invoice_no            ? { invoice_no:   d.invoice_no }   : {}),
                ...(d.invoice_date          ? { invoice_date: d.invoice_date } : {}),
                ...(d.description           ? { description:  d.description }  : {}),
                ...(supplierMatch           ? { supplier_uq:  supplierMatch }  : {}),
            }));
            toast.success("Invoice scanned — review and confirm the fields.");
        } catch (err: any) {
            setScanError(err.message);
        } finally {
            setScanning(false);
        }
    };

    const save = async () => {
        if (!form.supplier_uq) { setError("Supplier is required."); return; }
        if (!form.ap_type_uq)  { setError("Charge type is required."); return; }
        if (!form.invoice_no)  { setError("Invoice is required."); return; }
        setSaving(true); setError(null);
        try {
            const body = {
                ...form,
                awbcode,
                awc_date: today(),
                duties: 0, o_charges: 0, handling: 0, broker: 0, oc_ammount: 0,
            };
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

    const lbl = "text-[10px] font-black text-gray-500 uppercase tracking-wider";
    return (
        <FosModal title={`${isEdit ? "Edit" : "Add"} AWB Charge — ${awbcode}`} icon={DollarSign} onClose={onClose} size="sm"
            footer={<><CancelBtn onClick={onClose} /><SaveBtn saving={saving} onClick={save} /></>}>
            {/* ── PDF Invoice Scanner ── */}
            <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleScan} />
            <button type="button" onClick={() => fileRef.current?.click()} disabled={scanning}
                className="flex items-center justify-center gap-2 w-full mb-3 rounded-md border-2 border-dashed border-orange-300 bg-orange-50 hover:bg-orange-100 text-orange-600 text-xs font-bold h-9 transition-colors disabled:opacity-60">
                {scanning
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Scanning Invoice...</>
                    : <><Upload className="w-3.5 h-3.5" /> Read Invoice PDF</>}
            </button>
            {scanError && <p className="mb-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-1.5">{scanError}</p>}
            {error && <p className="mb-3 text-xs text-red-600 font-semibold bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>}
            <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex flex-col gap-0.5">
                    <label className={lbl}>Airline</label>
                    <input readOnly value={airline ?? ""} className="fos-input h-10 sm:h-9 bg-gray-50 text-[#FB7506] font-bold" />
                </div>
                <div className="flex flex-col gap-0.5">
                    <label className={lbl}>AWBCode</label>
                    <input readOnly value={awbcode ?? ""} className="fos-input h-10 sm:h-9 bg-gray-50 text-[#FB7506] font-bold" />
                </div>
                <div className="col-span-2 flex flex-col gap-0.5">
                    <label className={lbl}>Supplier *</label>
                    <SupplierCombobox suppliers={suppliers as any[]} value={form.supplier_uq}
                        onChange={uq => setForm((p: any) => ({ ...p, supplier_uq: uq }))} />
                </div>
                <div className="col-span-2 flex flex-col gap-0.5">
                    <label className={lbl}>Charge Type *</label>
                    <select {...F("ap_type_uq")} className="fos-input h-10 sm:h-9">
                        <option value="">— Select Type —</option>
                        {(chargeTypes as any[]).map((c: any) => <option key={c.UNICO ?? c.unico} value={c.UNICO ?? c.unico}>{t(c.type_name ?? c.TYPE_NAME ?? c.AP_TYPE ?? c.DESCRIPTION ?? c.description)}</option>)}
                    </select>
                </div>
                <div className="col-span-2 flex flex-col gap-0.5"><label className={lbl}>Amount *</label><input {...F("freight", true)} className="fos-input h-10 sm:h-9" /></div>
                <div className="flex flex-col gap-0.5"><label className={lbl}>Invoice Date</label><input type="date" {...F("invoice_date")} className="fos-input h-10 sm:h-9" /></div>
                <div className="flex flex-col gap-0.5"><label className={lbl}>Invoice No. *</label><input {...F("invoice_no")} className="fos-input h-10 sm:h-9" /></div>
                <div className="flex flex-col gap-0.5"><label className={lbl}>Full Boxes</label><input {...F("full_boxes", true)} className="fos-input h-10 sm:h-9" /></div>
                <div className="flex flex-col gap-0.5"><label className={lbl}>Total Boxes</label><input {...F("total_boxes", true)} className="fos-input h-10 sm:h-9" /></div>
                <div className="col-span-2 flex flex-col gap-0.5"><label className={lbl}>Weight</label><input {...F("weight", true)} className="fos-input h-10 sm:h-9" /></div>
                <div className="col-span-2 flex flex-col gap-0.5"><label className={lbl}>Notes / Comments</label><input {...F("description")} className="fos-input h-10 sm:h-9" /></div>
            </div>
        </FosModal>
    );
}

// ─── Modal 2: AWB Freight Charges (by date) ───────────────────────────────────
function AwbsFreightsModal({ mode, charge, airline, onClose, onSaved }: any) {
    const isEdit = mode === "edit";
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

    const { data: suppliers   = EMPTY_ARR } = useQuery({ queryKey: ["awb-suppliers"],         queryFn: () => awbFetch("/api/awbs/lookups/suppliers"),         staleTime: 60000, select: (d: any) => d.records ?? [] });
    const { data: chargeTypes = EMPTY_ARR } = useQuery({ queryKey: ["awb-chargetypes-date"],   queryFn: () => awbFetch("/api/awbs/lookups/charge-types-date"), staleTime: 60000, select: (d: any) => d.records ?? [] });

    const F = (key: string, num = false) => num
        ? { type: "number" as const, step: "0.01", value: form[key] ?? 0, onChange: (e: any) => setForm((p: any) => ({ ...p, [key]: parseFloat(e.target.value) || 0 })) }
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

    const lbl = "text-[10px] font-black text-gray-500 uppercase tracking-wider";
    return (
        <FosModal title={`${isEdit ? "Edit" : "Add"} Freight Charge by Date`} icon={Plane} onClose={onClose} size="sm"
            footer={<><CancelBtn onClick={onClose} /><SaveBtn saving={saving} onClick={save} /></>}>
            {error && <p className="mb-3 text-xs text-red-600 font-semibold bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>}
            <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="col-span-2 flex flex-col gap-0.5">
                    <label className={lbl}>Charge Type *</label>
                    <select {...F("ap_type_uq")} className="fos-input h-10 sm:h-9">
                        <option value="">— Select Charge —</option>
                        {(chargeTypes as any[]).map((c: any) => <option key={c.UNICO ?? c.unico} value={c.UNICO ?? c.unico}>{t(c.type_name ?? c.TYPE_NAME ?? c.AP_TYPE ?? c.DESCRIPTION ?? c.description)}</option>)}
                    </select>
                </div>
                <div className="col-span-2 flex flex-col gap-0.5">
                    <label className={lbl}>Supplier *</label>
                    <SupplierCombobox suppliers={suppliers as any[]} value={form.supplier_uq}
                        onChange={uq => setForm((p: any) => ({ ...p, supplier_uq: uq }))} />
                </div>
                <div className="flex flex-col gap-0.5"><label className={lbl}>O. Charges *</label><input {...F("ocharges", true)} className="fos-input h-10 sm:h-9" /></div>
                <div className="flex flex-col gap-0.5"><label className={lbl}>Duties</label><input {...F("duties", true)} className="fos-input h-10 sm:h-9" /></div>
                <div className="flex flex-col gap-0.5"><label className={lbl}>Total Boxes</label><input {...F("total_box", true)} className="fos-input h-10 sm:h-9" /></div>
                <div className="flex flex-col gap-0.5"><label className={lbl}>Invoice *</label><input {...F("invoice_no")} className="fos-input h-10 sm:h-9" /></div>
                <div className="flex flex-col gap-0.5"><label className={lbl}>Charge Date</label><input type="date" {...F("charge_date")} className="fos-input h-10 sm:h-9" /></div>
                <div className="flex flex-col gap-0.5"><label className={lbl}>Apply From</label><input type="date" {...F("apply_from")} className="fos-input h-10 sm:h-9" /></div>
                <div className="flex flex-col gap-0.5"><label className={lbl}>Apply To</label><input type="date" {...F("apply_to")} className="fos-input h-10 sm:h-9" /></div>
                <div className="flex flex-col gap-0.5">
                    <label className={lbl}>Airline</label>
                    <input readOnly value={airline ?? ""} className="fos-input h-10 sm:h-9 bg-gray-50 text-gray-500" />
                </div>
                <div className="col-span-2 flex flex-col gap-0.5"><label className={lbl}>Notes</label><textarea {...F("notes")} rows={2} className="fos-input py-1.5 resize-none" /></div>
            </div>
        </FosModal>
    );
}

// ─── Modal 3: AWB Invoice Charges (per packing, has internal PanelGrid) ───────
function AwbsInvoiceChargesModal({ packUq, awbcode, onClose, onSaved }: any) {
    const [selCharge, setSelCharge] = useState<any>(null);
    const [editMode,  setEditMode]  = useState<"add" | "edit" | null>(null);
    const [form, setForm] = useState<any>({ ap_type_uq: "", supplier_uq: "", amount: 0, description: "", invoice_no: "", invoice_date: today() });
    const [saving, setSaving] = useState(false);
    const [error,  setError]  = useState<string | null>(null);
    const qc = useQueryClient();

    const { data: suppliers   = EMPTY_ARR } = useQuery({ queryKey: ["awb-suppliers"],    queryFn: () => awbFetch("/api/awbs/lookups/suppliers"),    staleTime: 60000, select: (d: any) => d.records ?? [] });
    const { data: chargeTypes = EMPTY_ARR } = useQuery({ queryKey: ["awb-chargetypes"],  queryFn: () => awbFetch("/api/awbs/lookups/charge-types"), staleTime: 60000, select: (d: any) => d.records ?? [] });

    const ctMap = Object.fromEntries((chargeTypes as any[]).map((c: any) => [t(c.UNICO ?? c.unico), t(c.type_name ?? c.TYPE_NAME ?? c.AP_TYPE ?? c.DESCRIPTION ?? c.description)]));
    const spMap = Object.fromEntries((suppliers   as any[]).map((s: any) => [t(s.UNICO ?? s.unico), t(s.GROWER ?? s.grower)]));

    const { data: charges = EMPTY_ARR, isFetching } = useQuery({
        queryKey: ["awb-invoice-charges", packUq],
        queryFn:  () => awbFetch(`/api/awbs/invoice-charges?pack_uq=${encodeURIComponent(packUq)}`),
        enabled:  !!packUq,
        select:   (d: any) => norm(d.records ?? []),
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
        toastConfirm("Delete this invoice charge?", async () => {
            try {
                const res = await fetch(`/api/awbs/invoice-charges/${row.UNICO}`, { method: "DELETE" });
                const d   = await res.json();
                if (!d.success) throw new Error(d.error);
                toast.success("Charge deleted.");
                onSaved(row.UNICO, "delete");
                qc.invalidateQueries({ queryKey: ["awb-invoice-charges", packUq] });
                if (selCharge?.UNICO === row.UNICO) { setSelCharge(null); setEditMode(null); }
            } catch (e: any) { toast.error((e as any).message); }
        });
    };

    const lbl = "text-[10px] font-black text-gray-500 uppercase tracking-wider";
    return (
        <FosModal title={`Invoice Charges — AWB ${awbcode}`} icon={FileText} onClose={onClose} size="xl"
            footer={<>
                <CancelBtn onClick={onClose} />
                {editMode && <SaveBtn saving={saving} onClick={save} />}
            </>}>
            {error && <p className="mb-3 text-xs text-red-600 font-semibold bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>}
            <div className="flex flex-col lg:flex-row gap-4 min-h-[340px]">
                {/* Form panel */}
                <div className="lg:w-64 xl:w-72 shrink-0 space-y-2 text-xs border-b lg:border-b-0 lg:border-r border-gray-200 pb-4 lg:pb-0 lg:pr-4">
                    <div className="flex flex-col gap-0.5">
                        <label className={lbl}>AWBCode</label>
                        <input readOnly value={awbcode} className="fos-input h-9 bg-gray-50 text-[#FB7506] font-bold" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <label className={lbl}>Charge Type *</label>
                        <select value={form.ap_type_uq} onChange={e => setForm((p: any) => ({ ...p, ap_type_uq: e.target.value }))} className="fos-input h-9">
                            <option value="">— Select —</option>
                            {(chargeTypes as any[]).map((c: any) => <option key={c.UNICO ?? c.unico} value={c.UNICO ?? c.unico}>{t(c.type_name ?? c.TYPE_NAME ?? c.AP_TYPE ?? c.DESCRIPTION ?? c.description)}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <label className={lbl}>Supplier *</label>
                        <select value={form.supplier_uq} onChange={e => setForm((p: any) => ({ ...p, supplier_uq: e.target.value }))} className="fos-input h-9">
                            <option value="">— Select —</option>
                            {(suppliers as any[]).map((s: any) => <option key={s.UNICO ?? s.unico} value={s.UNICO ?? s.unico}>{t(s.GROWER ?? s.grower ?? s.SUPPLIER ?? s.supplier)}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <label className={lbl}>Amount *</label>
                        <input type="number" step="0.01" value={form.amount} onChange={e => setForm((p: any) => ({ ...p, amount: parseFloat(e.target.value) || 0 }))} className="fos-input h-9" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <label className={lbl}>Invoice *</label>
                        <input value={form.invoice_no} onChange={e => setForm((p: any) => ({ ...p, invoice_no: e.target.value }))} className="fos-input h-9" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <label className={lbl}>Invoice Date</label>
                        <input type="date" value={form.invoice_date} onChange={e => setForm((p: any) => ({ ...p, invoice_date: e.target.value }))} className="fos-input h-9" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <label className={lbl}>Description</label>
                        <input value={form.description} onChange={e => setForm((p: any) => ({ ...p, description: e.target.value }))} className="fos-input h-9" />
                    </div>
                    <div className="flex gap-2 pt-1">
                        <button onClick={openAdd} className="flex items-center gap-1 px-3 h-7 text-[11px] uppercase font-black tracking-wider bg-green-500 hover:bg-green-600 text-white rounded transition-colors">
                            <Plus size={12} /> Add
                        </button>
                        <button onClick={loadTemplate} className="flex items-center gap-1 px-3 h-7 text-[11px] uppercase font-black tracking-wider bg-teal-600 hover:bg-teal-700 text-white rounded transition-colors">
                            <FileText size={12} /> Template
                        </button>
                    </div>
                </div>

                {/* Grid panel — PanelGrid inside modal */}
                <div className="flex-1 min-w-0 flex flex-col min-h-[240px]">
                    <PanelGrid
                        title="Invoice Charges"
                        icon={DollarSign}
                        recordCount={(charges as any[]).length || undefined}
                        refreshing={isFetching}
                        className="flex-1 min-h-0 rounded-none border-x-0 border-b-0"
                    >
                        <PanelGridTable>
                            <PanelGridThead>
                                <PanelGridTh>AWBCode</PanelGridTh>
                                <PanelGridTh>Type</PanelGridTh>
                                <PanelGridTh>Supplier</PanelGridTh>
                                <PanelGridTh align="right">Amount</PanelGridTh>
                                <PanelGridTh>Invoice</PanelGridTh>
                                <PanelGridTh>Inv. Date</PanelGridTh>
                                <PanelGridTh>Description</PanelGridTh>
                                <PanelGridTh align="center">{null}</PanelGridTh>
                            </PanelGridThead>
                            <PanelGridTbody>
                                {(charges as any[]).map((row: any) => (
                                    <PanelGridTr key={row.UNICO} selected={selCharge?.UNICO === row.UNICO} onClick={() => openEdit(row)}>
                                        <PanelGridTd className="font-bold text-[#FB7506]">{t(row.AWBCODE)}</PanelGridTd>
                                        <PanelGridTd>{ctMap[t(row.AP_TYPE_UQ)] || t(row.AP_TYPE_UQ)}</PanelGridTd>
                                        <PanelGridTd>{spMap[t(row.SUPPLIER_UQ)] || t(row.SUPPLIER_UQ)}</PanelGridTd>
                                        <PanelGridTd align="right">{fmt(row.FREIGHT)}</PanelGridTd>
                                        <PanelGridTd>{t(row.INVOICE_NO)}</PanelGridTd>
                                        <PanelGridTd>{fmtDate(row.INVOICE_DATE)}</PanelGridTd>
                                        <PanelGridTd>{t(row.DESCRIPTION)}</PanelGridTd>
                                        <PanelGridTd align="center">
                                            <button onClick={e => { e.stopPropagation(); del(row); }} className="p-1 text-red-500 hover:bg-red-100 rounded">
                                                <Trash2 size={12} />
                                            </button>
                                        </PanelGridTd>
                                    </PanelGridTr>
                                ))}
                                {!(charges as any[]).length && (
                                    <PanelGridTr selected={false} onClick={() => {}}>
                                        <PanelGridTd colSpan={8} align="center" className="text-gray-400 italic py-6">
                                            {isFetching ? "Loading..." : "No invoice charges."}
                                        </PanelGridTd>
                                    </PanelGridTr>
                                )}
                            </PanelGridTbody>
                        </PanelGridTable>
                    </PanelGrid>
                </div>
            </div>
        </FosModal>
    );
}

// ─── Modal 4: Box Inventory Entry ─────────────────────────────────────────────
function AwbsBoxesModal({ box, onClose, onSaved }: any) {
    const [form, setForm] = useState<any>({
        box_qty:         parseInt(box?.BOX_QTY        ?? 0),
        case_uq:         box?.CASE_UQ     ?? "",
        f_cost_x_u:      parseFloat(box?.F_COST_X_U   ?? 0),
        price_x_u:       parseFloat(box?.PRICE_X_U    ?? 0),
        freight_cost:    parseFloat(box?.FREIGHT_COST  ?? 0),
        handling_cost:   parseFloat(box?.HANDLING_COST ?? 0),
        duties_cost:     parseFloat(box?.DUTIES_COST   ?? 0),
        broker_cost:     parseFloat(box?.BROKER_COST   ?? 0),
        charge_cost:     parseFloat(box?.CHARGE_COST   ?? 0),
        units_x_box:     parseInt(box?.TUNITS_X_BOX   ?? 0),
        customer_uq:     box?.CUSTOMER_UQ ?? "",
        customer_num:    box?.CUSTOMER    ?? 0,
        cporder_no:      box?.CPORDER_NO  ?? "",
        product_uq:      box?.PRO_PACK_UQ ?? "",
        cut:             box?.CUT_POINT   ?? 0,
        packs_box:       box?.PACKS_BOX   ?? 0,
        packs_units:     box?.PACKS_UNITS ?? 0,
        box_id:          box?.BOX_ID      ?? "",
        inventory_notes: "",
    });
    const [saving, setSaving] = useState(false);
    const [error,  setError]  = useState<string | null>(null);

    const { data: cases = EMPTY_ARR } = useQuery({
        queryKey: ["awb-cases"],
        queryFn:  () => awbFetch("/api/awbs/lookups/cases"),
        staleTime: 300000,
        select: (d: any) => d.records ?? [],
    });

    const totalUnits = (form.box_qty || 0) * (form.units_x_box || 0);

    const Fn = (key: string) => ({
        type: "number" as const, step: "0.01",
        value: form[key] ?? 0,
        onChange: (e: any) => setForm((p: any) => ({ ...p, [key]: parseFloat(e.target.value) || 0 })),
    });

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

    const lbl  = "text-[10px] font-black text-gray-500 uppercase tracking-wider mb-0.5";
    const ro   = "fos-input h-10 sm:h-8 bg-gray-50 text-gray-600 text-xs";
    const edit = "fos-input h-10 sm:h-8 text-xs";
    const roOr = "fos-input h-10 sm:h-8 bg-gray-50 text-[#FB7506] font-bold text-xs";
    const bold = "fos-input h-10 sm:h-8 bg-gray-50 font-bold text-gray-800 text-xs";

    const Lbl = ({ children }: any) => <label className={lbl}>{children}</label>;
    const RoField = ({ label, value, className = ro }: any) => (
        <div className="flex flex-col">
            <Lbl>{label}</Lbl>
            <input readOnly value={value ?? ""} className={className} />
        </div>
    );

    return (
        <FosModal
            title={`Box ${t(box?.BOXNUM ?? box?.UNICO)}${box?.DESCRIPTION ? ` · ${t(box.DESCRIPTION).trim()}` : ""}`}
            icon={Package} onClose={onClose} size="lg"
            footer={<><CancelBtn onClick={onClose} /><SaveBtn saving={saving} onClick={save} /></>}>
            {error && <p className="mb-3 text-xs text-red-600 font-semibold bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-2 text-xs">
                {/* Row 1: AWBCode | Lote | Stock | Confir.Box */}
                <RoField label="AWBCode"    value={t(box?.AWBCODE)}          className={roOr} />
                <RoField label="Lote"       value={t(box?.LOTE)}             className={ro} />
                <RoField label="Stock"      value={box?.STOCK ?? 0}          className={ro} />
                <RoField label="Confir.Box" value={box?.QTY_CONFIRMED ?? 0}  className={ro} />

                {/* Row 2: Vendor (2 cols) | Case (dropdown) | Box Date */}
                <div className="col-span-2 flex flex-col">
                    <Lbl>Vendor</Lbl>
                    <input readOnly value={t(box?.GROWER ?? "")} className={ro} />
                </div>
                <div className="flex flex-col">
                    <Lbl>Case</Lbl>
                    <select value={form.case_uq} onChange={e => setForm((p: any) => ({ ...p, case_uq: e.target.value }))} className={edit}>
                        <option value="">— Select —</option>
                        {(cases as any[]).map((c: any) => <option key={c.unico} value={c.unico}>{t(c.case_name)}</option>)}
                    </select>
                </div>
                <RoField label="Box Date" value={fmtDate(box?.BOX_DATE)} className={ro} />

                {/* Row 3: Customer | Units x Box | Box Qty | Total Units */}
                <RoField label="Customer"    value={t(box?.CUSTOMER)}        className={ro} />
                <RoField label="Units x Box" value={box?.TUNITS_X_BOX ?? 0}  className={ro} />
                <div className="flex flex-col">
                    <Lbl>Box Qty</Lbl>
                    <input {...Fn("box_qty")} step="1" className={edit} />
                </div>
                <RoField label="Total Units" value={totalUnits} className={bold} />

                {/* Divider */}
                <div className="col-span-2 sm:col-span-4 border-t border-gray-200 mt-1" />

                {/* Row 4: Per-box cost breakdown */}
                <RoField label="Freight x Bx"  value={fmt(box?.FREIGHT_COST)}  className={ro} />
                <RoField label="Handling x Bx" value={fmt(box?.HANDLING_COST)} className={ro} />
                <RoField label="Duties x Bx"   value={fmt(box?.DUTIES_COST)}   className={ro} />
                <RoField label="Broker x Bx"   value={fmt(box?.BROKER_COST)}   className={ro} />

                {/* Row 5: Totals */}
                <RoField label="T.Charges"  value={fmt(box?.TOTAL_CHARGE)} className={bold} />
                <RoField label="C.Cost x U" value={fmt(box?.C_COST_X_U)}  className={ro} />
                <div className="flex flex-col">
                    <Lbl>F.Cost x U</Lbl>
                    <input {...Fn("f_cost_x_u")} className={edit} />
                </div>
                <RoField label="T.Cost x U" value={fmt(box?.T_COST_X_U)} className={bold} />

                {/* Row 6: Bottom totals */}
                <RoField label="F.Cost"  value={fmt(box?.FLOWER_COST)} className={ro} />
                <RoField label="T.Cost"  value={fmt(box?.TOTAL_COST)}  className={bold} />
                <div className="flex flex-col">
                    <Lbl>Price x U</Lbl>
                    <input {...Fn("price_x_u")} className={edit} />
                </div>
                <RoField label="T.Price" value={fmt(box?.TOTAL_SALE)} className={ro} />

                {/* Notes */}
                <div className="col-span-2 sm:col-span-4 flex flex-col">
                    <Lbl>Notes</Lbl>
                    <input value={form.inventory_notes} onChange={e => setForm((p: any) => ({ ...p, inventory_notes: e.target.value }))} className={edit} />
                </div>
            </div>
        </FosModal>
    );
}

// ─── Modal 5: Set MPF ─────────────────────────────────────────────────────────
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

    const lbl = "text-[10px] font-black text-gray-500 uppercase tracking-wider";
    return (
        <FosModal title={`Set MPF — ${awbcode}`} icon={Package} onClose={onClose} size="sm"
            footer={<><CancelBtn onClick={onClose} /><SaveBtn saving={saving} onClick={save} /></>}>
            {error && <p className="mb-3 text-xs text-red-600 font-semibold bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>}
            <div className="space-y-3 text-xs">
                <div className="flex flex-col gap-0.5"><label className={lbl}>AWBCode</label><input readOnly value={awbcode} className="fos-input h-9 bg-gray-50 text-[#FB7506] font-bold" /></div>
                <div className="flex flex-col gap-0.5"><label className={lbl}>Entry Code *</label><input value={form.entry_code} onChange={e => setForm(p => ({ ...p, entry_code: e.target.value }))} className="fos-input h-9" /></div>
                <div className="flex flex-col gap-0.5"><label className={lbl}>MPF *</label><input type="number" step="0.01" value={form.mpf} onChange={e => setForm(p => ({ ...p, mpf: parseFloat(e.target.value) || 0 }))} className="fos-input h-9" /></div>
            </div>
        </FosModal>
    );
}

// ─── Modal 6: Change AWB Date ─────────────────────────────────────────────────
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

    const lbl = "text-[10px] font-black text-gray-500 uppercase tracking-wider";
    return (
        <FosModal title={`Change Date — AWB ${awbcode}`} icon={Calendar} onClose={onClose} size="sm"
            footer={<><CancelBtn onClick={onClose} /><SaveBtn saving={saving} onClick={save} /></>}>
            {error && <p className="mb-3 text-xs text-red-600 font-semibold bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>}
            <div className="flex flex-col gap-0.5 text-xs">
                <label className={lbl}>New Date *</label>
                <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="fos-input h-9" />
            </div>
        </FosModal>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
type TabId = "vendors" | "charges" | "boxes" | "by-date" | "varieties";

const TABS: { id: TabId; label: string }[] = [
    { id: "vendors",   label: "Vendors x AWB" },
    { id: "charges",   label: "Charges by AWB" },
    { id: "boxes",     label: "Boxes x AWB" },
    { id: "by-date",   label: "Charges by Date" },
    { id: "varieties", label: "Varieties" },
];

export default function AwbsPage() {
    // ── Auth + audit + permissions ───────────────────────────────────────────
    const { status } = useSession();
    const router     = useRouter();
    const qc         = useQueryClient();
    const { logAction } = useAuditLog("awbs", "flower_awbs");
    const perms          = usePagePermissions("awbs");

    // ── Pending scroll after AWB search ─────────────────────────────────────
    const pendingScrollRef = useRef<string | null>(null);

    // ── Zustand store ────────────────────────────────────────────────────────
    const {
        dateFrom, dateTo, airline, awbSearch, searchKey,
        selAwb, selVendor, selCharge, selByDate, selBox, selVariety, activeTab,
        setDateFrom, setDateTo, setAirline, setAwbSearch, triggerSearch,
        setSelAwb, setSelVendor, setSelCharge, setSelByDate, setSelBox, setSelVariety, setActiveTab,
    } = useAwbStore();

    // ── AWB# active filter (set on Go, cleared on date Search) ──────────────
    const [activeAwbFilter, setActiveAwbFilter] = useState("");

    // ── Modal state ──────────────────────────────────────────────────────────
    const [chargesModal,        setChargesModal]        = useState<{ mode: "add" | "edit" } | null>(null);
    const [freightsModal,       setFreightsModal]       = useState<{ mode: "add" | "edit" } | null>(null);
    const [invoiceChargesModal, setInvoiceChargesModal] = useState(false);
    const [boxesModal,          setBoxesModal]          = useState(false);
    const [mpfModal,            setMpfModal]            = useState(false);
    const [changeDateModal,     setChangeDateModal]     = useState(false);
    const [reportUrl,           setReportUrl]           = useState<string | null>(null);

    // ── Redirect ─────────────────────────────────────────────────────────────
    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
    }, [status, router]);

    // ── Auto-load on page entry ───────────────────────────────────────────────
    const autoLoaded = useRef(false);
    useEffect(() => {
        if (status === "authenticated" && !autoLoaded.current && searchKey === 0) {
            autoLoaded.current = true;
            triggerSearch();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]);

    // ── Queries — ALL hooks before any early return ──────────────────────────
    const { data: airlines = EMPTY_ARR } = useQuery({
        queryKey: ["awb-airlines"],
        queryFn:  () => awbFetch("/api/awbs/airlines"),
        staleTime: 300000,
        enabled:  status === "authenticated",
        select:   (d: any) => norm(d.records ?? []),
    });

    const { data: awbs = EMPTY_ARR, isFetching: loadingAwbs, refetch: refetchAwbs } = useQuery({
        queryKey: ["awb-list", searchKey, dateFrom, dateTo, airline],
        queryFn:  () => awbFetch(`/api/awbs/list?from=${dateFrom}&to=${dateTo}&airline=${encodeURIComponent(airline)}`),
        enabled:  status === "authenticated" && searchKey > 0,
        select:   (d: any) => norm(d.records ?? []),
        staleTime: 0,
    });

    // ── Filter grid to matched AWB when an AWB# search is active ────────────
    const displayedAwbs = activeAwbFilter
        ? (awbs as any[]).filter(r => t(r.AWBCODE).toUpperCase().includes(activeAwbFilter))
        : (awbs as any[]);

    // ── Auto-select first record after grid loads ─────────────────────────────
    useEffect(() => {
        if (displayedAwbs.length > 0 && !selAwb) {
            const first = displayedAwbs[0];
            setSelAwb(first);
            ["awb-packing", "awb-charges", "awb-boxes", "awb-varieties"].forEach(key =>
                qc.invalidateQueries({ queryKey: [key, first.AWBCODE] })
            );
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [awbs]);

    // ── Scroll to the AWB row after an AWB# search ────────────────────────────
    useEffect(() => {
        if (!pendingScrollRef.current || loadingAwbs) return;
        const el = document.getElementById(`awb-row-${pendingScrollRef.current}`);
        if (el) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
        pendingScrollRef.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [awbs, loadingAwbs]);

    const { data: vendors = EMPTY_ARR, isFetching: loadingVendors, refetch: refetchVendors } = useQuery({
        queryKey: ["awb-packing", selAwb?.AWBCODE],
        queryFn:  () => awbFetch(`/api/awbs/${encodeURIComponent(selAwb!.AWBCODE)}/packing`),
        enabled:  !!selAwb?.AWBCODE,
        select:   (d: any) => norm(d.records ?? []),
        staleTime: 0,
    });

    const { data: chargesTab = EMPTY_ARR, isFetching: loadingCharges, refetch: refetchCharges } = useQuery({
        queryKey: ["awb-charges", selAwb?.AWBCODE],
        queryFn:  () => awbFetch(`/api/awbs/${encodeURIComponent(selAwb!.AWBCODE)}/charges`),
        enabled:  !!selAwb?.AWBCODE,
        select:   (d: any) => norm(d.records ?? []),
        staleTime: 0,
    });

    const { data: boxes = EMPTY_ARR, isFetching: loadingBoxes, refetch: refetchBoxes } = useQuery({
        queryKey: ["awb-boxes", selAwb?.AWBCODE],
        queryFn:  () => awbFetch(`/api/awbs/${encodeURIComponent(selAwb!.AWBCODE)}/boxes`),
        enabled:  !!selAwb?.AWBCODE,
        select:   (d: any) => norm(d.records ?? []),
        staleTime: 0,
    });

    const { data: byDate = EMPTY_ARR, isFetching: loadingByDate, refetch: refetchByDate } = useQuery({
        queryKey: ["awb-by-date", dateFrom, dateTo],
        queryFn:  () => awbFetch(`/api/awbs/charges-by-date?from=${dateFrom}&to=${dateTo}`),
        enabled:  status === "authenticated" && searchKey > 0,
        select:   (d: any) => norm(d.records ?? []),
        staleTime: 0,
    });

    const { data: varieties = EMPTY_ARR, isFetching: loadingVarieties, refetch: refetchVarieties } = useQuery({
        queryKey: ["awb-varieties", selAwb?.AWBCODE],
        queryFn:  () => awbFetch(`/api/awbs/${encodeURIComponent(selAwb!.AWBCODE)}/varieties`),
        enabled:  !!selAwb?.AWBCODE,
        select:   (d: any) => norm(d.records ?? []),
        staleTime: 0,
    });

    // ── Page-level lookups for name resolution in grids ───────────────────────
    const { data: chargeTypesDate = EMPTY_ARR } = useQuery({
        queryKey: ["awb-chargetypes-date"],
        queryFn:  () => awbFetch("/api/awbs/lookups/charge-types-date"),
        staleTime: 60000,
        enabled:  status === "authenticated",
        select:   (d: any) => d.records ?? [],
    });
    const { data: suppliersAll = EMPTY_ARR } = useQuery({
        queryKey: ["awb-suppliers"],
        queryFn:  () => awbFetch("/api/awbs/lookups/suppliers"),
        staleTime: 60000,
        enabled:  status === "authenticated",
        select:   (d: any) => d.records ?? [],
    });

    // ── Guards ───────────────────────────────────────────────────────────────
    if (status === "loading") {
        return <div className="flex items-center justify-center h-screen"><Loader2 size={24} className="animate-spin text-[#FB7506]" /></div>;
    }
    if (status === "unauthenticated") return null;
    if (!perms.loading && !perms.canAccess) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4 text-center px-8">
                <XCircle size={48} className="text-red-400" />
                <p className="text-sm text-gray-600 max-w-md">{PERMISSION_MSGS.access}</p>
                <button onClick={() => router.back()} className="px-4 py-2 rounded bg-gray-600 text-white text-sm font-bold">Go Back</button>
            </div>
        );
    }

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleSearch = () => {
        if (!perms.canQuery) { toast.error(PERMISSION_MSGS.access); return; }
        setActiveAwbFilter("");
        setAwbSearch("");
        triggerSearch();
    };

    const handleAwbSearch = async () => {
        if (!awbSearch.trim()) return;
        try {
            const d = await awbFetch(`/api/awbs/search?q=${encodeURIComponent(awbSearch)}`);
            const records: any[] = norm(d.records ?? []);
            if (!records.length) { toast.error("AWB not found."); return; }
            const awbCode = awbSearch.trim().toUpperCase();
            const toDate  = (v: any) => v ? new Date(v).toISOString().split("T")[0] : today();
            const minDate = toDate(records[0].AWBDATE_MIN);
            const maxDate = toDate(records[0].AWBDATE_MAX);
            setDateFrom(minDate);
            setDateTo(maxDate);
            setActiveAwbFilter(awbCode);
            setSelAwb({ ...records[0], AWBCODE: awbCode });
            pendingScrollRef.current = awbCode;
            triggerSearch();
            ["awb-packing", "awb-charges", "awb-boxes", "awb-varieties"].forEach(key =>
                qc.invalidateQueries({ queryKey: [key, awbCode] })
            );
        } catch (e: any) { toast.error((e as any).message); }
    };

    const handleSelectAwb = (row: any) => {
        if (selAwb?.AWBCODE === row.AWBCODE) { setSelAwb(null); return; }
        setSelAwb(row);
        ["awb-packing", "awb-charges", "awb-boxes", "awb-varieties"].forEach(key =>
            qc.invalidateQueries({ queryKey: [key, row.AWBCODE] })
        );
    };

    const handleDeleteAwb = () => {
        if (!selAwb) return;
        if (!perms.canDelete) { toast.error(PERMISSION_MSGS.delete); return; }
        toastConfirm(`Delete AWB ${selAwb.AWBCODE}? This cannot be undone.`, async () => {
            try {
                const res = await fetch(`/api/awbs/${encodeURIComponent(selAwb.AWBCODE)}`, { method: "DELETE" });
                const d   = await res.json();
                if (!d.success) throw new Error(d.error);
                logAction("Delete", selAwb.AWBCODE, `AWB ${selAwb.AWBCODE}`);
                toast.success("AWB deleted.");
                setSelAwb(null);
                triggerSearch();
            } catch (e: any) { toast.error((e as any).message); }
        });
    };

    const handleDeleteCharge = (row: any) => {
        if (!perms.canDelete) { toast.error(PERMISSION_MSGS.delete); return; }
        toastConfirm("Delete this charge?", async () => {
            try {
                const res = await fetch(`/api/awbs/charges/${row.UNICO}`, { method: "DELETE" });
                const d   = await res.json();
                if (!d.success) throw new Error(d.error);
                logAction("Delete", row.UNICO, `AWB charge — AWB ${selAwb?.AWBCODE}`);
                toast.success("Charge deleted.");
                qc.invalidateQueries({ queryKey: ["awb-charges", selAwb?.AWBCODE] });
                refetchAwbs();
                setSelCharge(null);
            } catch (e: any) { toast.error((e as any).message); }
        });
    };

    const handleDeleteByDate = (row: any) => {
        if (!perms.canDelete) { toast.error(PERMISSION_MSGS.delete); return; }
        toastConfirm("Delete this freight charge?", async () => {
            try {
                const res = await fetch(`/api/awbs/charges-by-date/${row.UNICO}`, { method: "DELETE" });
                const d   = await res.json();
                if (!d.success) throw new Error(d.error);
                logAction("Delete", row.UNICO, "AWB freight charge by date");
                toast.success("Charge deleted.");
                qc.invalidateQueries({ queryKey: ["awb-by-date", dateFrom, dateTo] });
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
                logAction("Insert", selAwb.AWBCODE, `Varieties — AWB ${selAwb.AWBCODE}`);
                toast.success("Variety added.");
                qc.invalidateQueries({ queryKey: ["awb-varieties", selAwb.AWBCODE] });
            } catch (e: any) { toast.error((e as any).message); }
        });
    };

    const handleDeleteVariety = (row: any) => {
        if (!perms.canDelete) { toast.error(PERMISSION_MSGS.delete); return; }
        toastConfirm("Delete this variety?", async () => {
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

    const handleReport = (type: "products" | "duties" | "charges") => {
        if (!selAwb) return;
        if (!perms.canReport) { toast.error(PERMISSION_MSGS.report); return; }
        const awbcode = encodeURIComponent(selAwb.AWBCODE);
        if (type === "charges") {
            setReportUrl(`/api/awbs/reports/charges?awbcode=${awbcode}`);
            return;
        }
        const grower = encodeURIComponent(type === "duties" ? (selVendor?.GROWER_UQ ?? "") : "%");
        const date   = encodeURIComponent(t(selAwb.DATE_INVO ?? selAwb.BOX_DATE ?? dateFrom));
        setReportUrl(`/api/awbs/reports/${type}?date_invo=${date}&awbcode=${awbcode}&grower_uq=${grower}`);
    };

    const emptyMsg = (msg: string) => (
        <PanelGridTr selected={false} onClick={() => {}}>
            <PanelGridTd colSpan={20} align="center" className="text-gray-400 italic py-8">{msg}</PanelGridTd>
        </PanelGridTr>
    );

    // Name maps for by-date grid (sp_flower_awb_charges_by_date returns UQs only)
    const ctDateMap = Object.fromEntries((chargeTypesDate as any[]).map((c: any) => [t(c.UNICO ?? c.unico), t(c.type_name ?? c.TYPE_NAME ?? c.AP_TYPE ?? c.DESCRIPTION ?? c.description)]));
    const spAllMap  = Object.fromEntries((suppliersAll  as any[]).map((s: any) => [t(s.UNICO ?? s.unico), t(s.GROWER ?? s.grower)]));

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col h-[100dvh] bg-[#f4f6f8] overflow-hidden font-sans text-[#333]">
            <AppHeader title="AWBs — Air Waybill Costs" icon={Plane} useBack />

            {/* Filter bar */}
            <div className="bg-white border-b border-gray-200 px-3 py-2 flex flex-wrap items-center gap-x-2 gap-y-2 shrink-0">
                {/* Date range */}
                <div className="flex items-center gap-1 text-xs">
                    <label className="text-[10px] font-black text-gray-400 uppercase whitespace-nowrap">From</label>
                    <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="fos-input h-9 sm:h-8 w-[7.5rem] sm:w-36 text-xs" />
                </div>
                <div className="flex items-center gap-1 text-xs">
                    <label className="text-[10px] font-black text-gray-400 uppercase whitespace-nowrap">To</label>
                    <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="fos-input h-9 sm:h-8 w-[7.5rem] sm:w-36 text-xs" />
                </div>
                {/* Airline — hidden on very small screens, visible from sm */}
                <div className="hidden sm:flex items-center gap-1 text-xs">
                    <label className="text-[10px] font-black text-gray-400 uppercase whitespace-nowrap">Airline</label>
                    <select value={airline} onChange={e => setAirline(e.target.value)} className="fos-input h-8 w-40 text-xs">
                        <option value="%">— All —</option>
                        {(airlines as any[]).map((a: any) => (
                            <option key={a.UNICO ?? a.COD_LINEA} value={a.COD_LINEA ?? a.AIRLINE}>
                                {t(a.AIRLINE)} ({t(a.COD_LINEA)})
                            </option>
                        ))}
                    </select>
                </div>
                <button onClick={handleSearch} disabled={loadingAwbs}
                    className="flex items-center gap-1.5 px-3 h-9 sm:h-8 text-xs text-white font-black uppercase tracking-wide rounded bg-[#FB7506] hover:bg-orange-600 transition-colors disabled:opacity-50">
                    {loadingAwbs ? <RefreshCcw size={13} className="animate-spin" /> : <Search size={13} />}
                    {loadingAwbs ? "Loading..." : "Search"}
                </button>
                {/* Airline on mobile — shown inline below dates */}
                <div className="flex sm:hidden items-center gap-1 text-xs w-full">
                    <label className="text-[10px] font-black text-gray-400 uppercase whitespace-nowrap">Airline</label>
                    <select value={airline} onChange={e => setAirline(e.target.value)} className="fos-input h-9 flex-1 text-xs">
                        <option value="%">— All —</option>
                        {(airlines as any[]).map((a: any) => (
                            <option key={a.UNICO ?? a.COD_LINEA} value={a.COD_LINEA ?? a.AIRLINE}>
                                {t(a.AIRLINE)} ({t(a.COD_LINEA)})
                            </option>
                        ))}
                    </select>
                </div>
                {/* AWB# search */}
                <div className="flex items-center gap-1 text-xs sm:ml-auto w-full sm:w-auto">
                    <label className="text-[10px] font-black text-gray-400 uppercase whitespace-nowrap">AWB #</label>
                    <input value={awbSearch} onChange={e => setAwbSearch(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleAwbSearch()}
                        placeholder="Search AWB..." className="fos-input h-9 sm:h-8 flex-1 sm:w-36 text-xs" />
                    <button onClick={handleAwbSearch} disabled={!awbSearch.trim()}
                        className="flex items-center gap-1 px-3 h-9 sm:h-8 text-xs text-white font-bold rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-40 transition-colors">
                        <Search size={12} /> Go
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-h-0 p-2 gap-2 overflow-hidden">

                {/* AWB List — PanelGrid */}
                <div className="shrink-0 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col" style={{ maxHeight: "clamp(180px, 34vh, 320px)" }}>
                    <PanelGrid
                        title={selAwb ? `AWBs — ${t(selAwb.AWBCODE)} · ${t(selAwb.AIRLINE)} · ${fmtDate(selAwb.BOX_DATE)}` : "AWBs"}
                        icon={Plane}
                        recordCount={displayedAwbs.length || undefined}
                        refreshing={loadingAwbs}
                        onRefresh={() => refetchAwbs()}
                        headerRight={<AuditLogModal recordId={selAwb?.AWBCODE} disabled={!selAwb} />}
                        menuItems={[
                            { label: "Products",      icon: Printer,   color: "gray", onClick: () => handleReport("products"), disabled: !selAwb },
                            { label: "AWB Charges",   icon: FileText,  color: "gray", onClick: () => handleReport("charges"),  disabled: !selAwb },
                            { label: "Credits/Duties",icon: BarChart2, color: "gray", onClick: () => handleReport("duties"),   disabled: !selAwb },
                            { separator: true },
                            { label: "Set MPF",       icon: Package,   color: "blue", onClick: () => { if (!perms.canEdit) { toast.error(PERMISSION_MSGS.edit); return; } setMpfModal(true); }, disabled: !selAwb || !perms.canEdit },
                        ]}
                        className="flex-1 min-h-0"
                    >
                        <PanelGridTable>
                            <PanelGridThead>
                                <PanelGridTh>AWBCode</PanelGridTh>
                                <PanelGridTh>Airline</PanelGridTh>
                                <PanelGridTh>Air Code</PanelGridTh>
                                <PanelGridTh>Box Date</PanelGridTh>
                                <PanelGridTh>Inv Date</PanelGridTh>
                                <PanelGridTh align="right">Boxes</PanelGridTh>
                                <PanelGridTh align="right">F.Boxes</PanelGridTh>
                                <PanelGridTh align="right">Units</PanelGridTh>
                                <PanelGridTh align="right">Charge</PanelGridTh>
                                <PanelGridTh align="right">Handling</PanelGridTh>
                                <PanelGridTh align="right">Freight</PanelGridTh>
                                <PanelGridTh align="right">Duties</PanelGridTh>
                                <PanelGridTh align="right">Broker</PanelGridTh>
                                <PanelGridTh align="right">T.Charge</PanelGridTh>
                                <PanelGridTh align="right">F.Cost</PanelGridTh>
                                <PanelGridTh align="right">G.Cost</PanelGridTh>
                                <PanelGridTh align="right">P.Credits</PanelGridTh>
                                <PanelGridTh align="right">P.Debits</PanelGridTh>
                                <PanelGridTh align="right">Net Cost</PanelGridTh>
                                <PanelGridTh align="right">G.Sale</PanelGridTh>
                                <PanelGridTh align="right">S.Credits</PanelGridTh>
                                <PanelGridTh align="right">S.Debits</PanelGridTh>
                                <PanelGridTh align="right">Net Sale</PanelGridTh>
                                <PanelGridTh align="right">S.Price</PanelGridTh>
                                <PanelGridTh align="right">Profit</PanelGridTh>
                                <PanelGridTh align="right">Profit/U</PanelGridTh>
                            </PanelGridThead>
                            <PanelGridTbody>
                                {displayedAwbs.map((row: any) => (
                                    <PanelGridTr key={row.AWBCODE} id={`awb-row-${row.AWBCODE}`} selected={selAwb?.AWBCODE === row.AWBCODE} onClick={() => handleSelectAwb(row)}>
                                        <PanelGridTd className="font-bold text-[#FB7506]">{t(row.AWBCODE)}</PanelGridTd>
                                        <PanelGridTd>{t(row.AIRLINE)}</PanelGridTd>
                                        <PanelGridTd>{t(row.AIRCODE)}</PanelGridTd>
                                        <PanelGridTd>{fmtDate(row.BOX_DATE)}</PanelGridTd>
                                        <PanelGridTd>{fmtDate(row.DATE_INVO)}</PanelGridTd>
                                        <PanelGridTd align="right">{row.TOTAL_BOXES}</PanelGridTd>
                                        <PanelGridTd align="right">{row.TOTAL_FBOXES}</PanelGridTd>
                                        <PanelGridTd align="right">{row.TOTAL_UNITS}</PanelGridTd>
                                        <PanelGridTd align="right">{fmt(row.CHARGE_COST)}</PanelGridTd>
                                        <PanelGridTd align="right">{fmt(row.HANDLING_COST)}</PanelGridTd>
                                        <PanelGridTd align="right">{fmt(row.FREIGHT_COST)}</PanelGridTd>
                                        <PanelGridTd align="right">{fmt(row.DUTIES_COST)}</PanelGridTd>
                                        <PanelGridTd align="right">{fmt(row.BROKER_COST)}</PanelGridTd>
                                        <PanelGridTd align="right" className="font-bold">{fmt(row.TOTAL_CHARGE)}</PanelGridTd>
                                        <PanelGridTd align="right">{fmt(row.FLOWER_COST)}</PanelGridTd>
                                        <PanelGridTd align="right">{fmt(row.GROSS_COST)}</PanelGridTd>
                                        <PanelGridTd align="right">{fmt(row.TOTAL_PCREDITS)}</PanelGridTd>
                                        <PanelGridTd align="right">{fmt(row.TOTAL_PDEBITS)}</PanelGridTd>
                                        <PanelGridTd align="right" className="font-bold">{fmt(row.NET_COST)}</PanelGridTd>
                                        <PanelGridTd align="right">{fmt(row.GROSS_SALE)}</PanelGridTd>
                                        <PanelGridTd align="right">{fmt(row.TOTAL_SCREDITS)}</PanelGridTd>
                                        <PanelGridTd align="right">{fmt(row.TOTAL_SDEBITS)}</PanelGridTd>
                                        <PanelGridTd align="right" className="font-bold">{fmt(row.NET_SALE)}</PanelGridTd>
                                        <PanelGridTd align="right">{fmt(row.SPRICE_X_UNIT)}</PanelGridTd>
                                        <PanelGridTd align="right" className="font-semibold">{fmt(row.PROFIT)}</PanelGridTd>
                                        <PanelGridTd align="right" className="font-semibold">{fmt(row.PROFIT_X_UNIT)}</PanelGridTd>
                                    </PanelGridTr>
                                ))}
                                {!displayedAwbs.length && searchKey === 0 && emptyMsg("Set filters and click Search to load AWBs.")}
                                {!displayedAwbs.length && searchKey > 0 && !loadingAwbs && emptyMsg(activeAwbFilter ? `AWB "${activeAwbFilter}" not found in results.` : "No AWBs found for the selected filters.")}
                            </PanelGridTbody>
                        </PanelGridTable>
                    </PanelGrid>
                </div>

                {/* Tab bar + Tab content */}
                <div className="flex-1 min-h-0 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
                    <div className="h-12 sm:h-10 bg-[#F5F3F3] border-b border-gray-200 flex items-end px-2 gap-0.5 shrink-0 overflow-x-auto pb-0">
                        {TABS.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex items-center px-3 h-9 sm:h-8 text-[11px] font-bold uppercase tracking-wide rounded-t transition-all whitespace-nowrap shrink-0",
                                    activeTab === tab.id
                                        ? "bg-white text-[#FB7506] border-t-2 border-x border-b-white border-[#FB7506] -mb-px"
                                        : "text-gray-500 hover:text-[#FB7506] hover:bg-white/60"
                                )}>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab content */}
                    <div className="flex-1 min-h-0 overflow-hidden">

                        {/* Tab 1: Vendors x AWB */}
                        {activeTab === "vendors" && (
                            <PanelGrid
                                title="Vendor Invoices x AWB"
                                icon={FileText}
                                recordCount={(vendors as any[]).length || undefined}
                                refreshing={loadingVendors}
                                onRefresh={() => refetchVendors()}
                                headerRight={<AuditLogModal recordId={selVendor?.PACK_UQ} disabled={!selVendor} />}
                                menuItems={[
                                    { label: "Add Invoice Charge", icon: Plus,    color: "green", onClick: () => { if (!perms.canCreate) { toast.error(PERMISSION_MSGS.create); return; } setInvoiceChargesModal(true); }, disabled: !selVendor || !perms.canCreate },
                                    { label: "Print",              icon: Printer,  color: "gray",  onClick: () => { if (!selAwb || !selVendor || !perms.canReport) { toast.error(PERMISSION_MSGS.report); return; } const date = encodeURIComponent(t(selAwb.DATE_INVO ?? selAwb.BOX_DATE ?? dateFrom)); setReportUrl(`/api/awbs/reports/products?date_invo=${date}&awbcode=${encodeURIComponent(selAwb.AWBCODE)}&grower_uq=${encodeURIComponent(selVendor.GROWER_UQ ?? "%")}`); }, disabled: !selVendor || !perms.canReport },
                                ]}
                                className="flex-1 min-h-0 h-full rounded-none border-0"
                            >
                                <PanelGridTable>
                                    <PanelGridThead>
                                        <PanelGridTh>Pack UQ</PanelGridTh>
                                        <PanelGridTh>Packing No</PanelGridTh>
                                        <PanelGridTh>Invoice No</PanelGridTh>
                                        <PanelGridTh>AWBCode</PanelGridTh>
                                        <PanelGridTh>Box Date</PanelGridTh>
                                        <PanelGridTh>Inv Date</PanelGridTh>
                                        <PanelGridTh>Grower</PanelGridTh>
                                        <PanelGridTh>Farm</PanelGridTh>
                                        <PanelGridTh align="right">Boxes</PanelGridTh>
                                        <PanelGridTh align="right">Units</PanelGridTh>
                                        <PanelGridTh align="right">Charge</PanelGridTh>
                                        <PanelGridTh align="right">Handling</PanelGridTh>
                                        <PanelGridTh align="right">Freight</PanelGridTh>
                                    </PanelGridThead>
                                    <PanelGridTbody>
                                        {(vendors as any[]).map((row: any) => (
                                            <PanelGridTr key={row.PACK_UQ} selected={selVendor?.PACK_UQ === row.PACK_UQ} onClick={() => selVendor?.PACK_UQ === row.PACK_UQ ? setSelVendor(null) : setSelVendor(row)}>
                                                <PanelGridTd className="font-mono text-[#FB7506] font-bold">{t(row.PACK_UQ)}</PanelGridTd>
                                                <PanelGridTd className="font-semibold">{t(row.PACKING_NO)}</PanelGridTd>
                                                <PanelGridTd>{t(row.INVOICE_NO)}</PanelGridTd>
                                                <PanelGridTd className="font-bold text-[#FB7506]">{t(row.AWBCODE)}</PanelGridTd>
                                                <PanelGridTd>{fmtDate(row.BOX_DATE)}</PanelGridTd>
                                                <PanelGridTd>{fmtDate(row.DATE_INVO)}</PanelGridTd>
                                                <PanelGridTd>{t(row.GROWER)}</PanelGridTd>
                                                <PanelGridTd>{t(row.FARM)}</PanelGridTd>
                                                <PanelGridTd align="right">{row.TOTAL_BOXES}</PanelGridTd>
                                                <PanelGridTd align="right">{row.TOTAL_UNITS}</PanelGridTd>
                                                <PanelGridTd align="right">{fmt(row.CHARGE_COST)}</PanelGridTd>
                                                <PanelGridTd align="right">{fmt(row.HANDLING_COST)}</PanelGridTd>
                                                <PanelGridTd align="right">{fmt(row.FREIGHT_COST)}</PanelGridTd>
                                            </PanelGridTr>
                                        ))}
                                        {!selAwb && emptyMsg("Select an AWB from the grid above.")}
                                        {selAwb && !(vendors as any[]).length && !loadingVendors && emptyMsg("No vendor invoices for this AWB.")}
                                    </PanelGridTbody>
                                </PanelGridTable>
                            </PanelGrid>
                        )}

                        {/* Tab 2: Charges by AWB */}
                        {activeTab === "charges" && (
                            <PanelGrid
                                title="AWB Direct Cost — Prorate by AWB"
                                icon={DollarSign}
                                recordCount={(chargesTab as any[]).length || undefined}
                                refreshing={loadingCharges}
                                onRefresh={() => refetchCharges()}
                                headerRight={<AuditLogModal recordId={selCharge?.UNICO} disabled={!selCharge} />}
                                menuItems={[
                                    { label: "Add",    icon: Plus,   color: "green",  onClick: () => { if (!perms.canCreate) { toast.error(PERMISSION_MSGS.create); return; } setSelCharge(null); setChargesModal({ mode: "add" }); }, disabled: !selAwb || !perms.canCreate },
                                    { label: "Edit",   icon: Pencil, color: "orange", onClick: () => { if (!perms.canEdit)   { toast.error(PERMISSION_MSGS.edit);   return; } setChargesModal({ mode: "edit" }); }, disabled: !selCharge || !perms.canEdit },
                                    { label: "Delete", icon: Trash2, color: "red",    onClick: () => handleDeleteCharge(selCharge), disabled: !selCharge || !perms.canDelete },
                                ]}
                                className="flex-1 min-h-0 h-full rounded-none border-0"
                            >
                                <PanelGridTable>
                                    <PanelGridThead>
                                        <PanelGridTh className="font-bold text-[#FB7506]">AWBCode</PanelGridTh>
                                        <PanelGridTh>Airline</PanelGridTh>
                                        <PanelGridTh>Date</PanelGridTh>
                                        <PanelGridTh>Vendor</PanelGridTh>
                                        <PanelGridTh>Type</PanelGridTh>
                                        <PanelGridTh>Inv. Date</PanelGridTh>
                                        <PanelGridTh>Invoice</PanelGridTh>
                                        <PanelGridTh align="right">Amount</PanelGridTh>
                                        <PanelGridTh align="right">T.Boxes</PanelGridTh>
                                        <PanelGridTh align="right">Full Boxes</PanelGridTh>
                                        <PanelGridTh align="right">Weight</PanelGridTh>
                                        <PanelGridTh>Description</PanelGridTh>
                                    </PanelGridThead>
                                    <PanelGridTbody>
                                        {(chargesTab as any[]).map((row: any) => (
                                            <PanelGridTr key={row.UNICO} selected={selCharge?.UNICO === row.UNICO} onClick={() => selCharge?.UNICO === row.UNICO ? setSelCharge(null) : setSelCharge(row)} onDoubleClick={() => { if (perms.canEdit) setChargesModal({ mode: "edit" }); }}>
                                                <PanelGridTd className="font-bold text-[#FB7506]">{t(row.AWBCODE)}</PanelGridTd>
                                                <PanelGridTd>{t(row.AIRLINE)}</PanelGridTd>
                                                <PanelGridTd>{fmtDate(row.AWC_DATE)}</PanelGridTd>
                                                <PanelGridTd>{t(row.GROWER)}</PanelGridTd>
                                                <PanelGridTd>{t(row.AP_TYPE)}</PanelGridTd>
                                                <PanelGridTd>{fmtDate(row.INVOICE_DATE)}</PanelGridTd>
                                                <PanelGridTd>{t(row.INVOICE_NO)}</PanelGridTd>
                                                <PanelGridTd align="right" className="font-semibold">{fmt(row.FREIGHT)}</PanelGridTd>
                                                <PanelGridTd align="right">{row.AUTO_FB ?? row.TOTAL_BOXES}</PanelGridTd>
                                                <PanelGridTd align="right">{row.FULL_BOXES}</PanelGridTd>
                                                <PanelGridTd align="right">{fmt(row.TOTAL_WEIGHT)}</PanelGridTd>
                                                <PanelGridTd>{t(row.DESCRIPTION)}</PanelGridTd>
                                            </PanelGridTr>
                                        ))}
                                        {!selAwb && emptyMsg("Select an AWB from the grid above.")}
                                        {selAwb && !(chargesTab as any[]).length && !loadingCharges && emptyMsg("No charges for this AWB.")}
                                    </PanelGridTbody>
                                </PanelGridTable>
                            </PanelGrid>
                        )}

                        {/* Tab 3: Boxes x AWB */}
                        {activeTab === "boxes" && (
                            <PanelGrid
                                title="Boxes x AWB"
                                icon={Package}
                                recordCount={(boxes as any[]).length || undefined}
                                refreshing={loadingBoxes}
                                onRefresh={() => refetchBoxes()}
                                headerRight={<AuditLogModal recordId={selBox?.UNICO} disabled={!selBox} />}
                                menuItems={[
                                    { label: "Edit", icon: Pencil, color: "orange", onClick: () => { if (!perms.canEdit) { toast.error(PERMISSION_MSGS.edit); return; } setBoxesModal(true); }, disabled: !selBox || !perms.canEdit },
                                ]}
                                className="flex-1 min-h-0 h-full rounded-none border-0"
                            >
                                <PanelGridTable>
                                    <PanelGridThead>
                                        <PanelGridTh>Code</PanelGridTh>
                                        <PanelGridTh>Ready</PanelGridTh>
                                        <PanelGridTh>Order</PanelGridTh>
                                        <PanelGridTh>Sel</PanelGridTh>
                                        <PanelGridTh>Lote</PanelGridTh>
                                        <PanelGridTh>Market</PanelGridTh>
                                        <PanelGridTh>P.Order</PanelGridTh>
                                        <PanelGridTh>Customer</PanelGridTh>
                                        <PanelGridTh align="right">Qty</PanelGridTh>
                                        <PanelGridTh>Box Date</PanelGridTh>
                                        <PanelGridTh align="right">Days</PanelGridTh>
                                        <PanelGridTh align="right">Box Qty</PanelGridTh>
                                        <PanelGridTh>BoxNum</PanelGridTh>
                                        <PanelGridTh align="right">Units</PanelGridTh>
                                        <PanelGridTh align="right">F.Cost</PanelGridTh>
                                        <PanelGridTh align="right">FC.Cost</PanelGridTh>
                                    </PanelGridThead>
                                    <PanelGridTbody>
                                        {(boxes as any[]).map((row: any) => (
                                            <PanelGridTr key={row.UNICO} selected={selBox?.UNICO === row.UNICO} onClick={() => selBox?.UNICO === row.UNICO ? setSelBox(null) : setSelBox(row)} onDoubleClick={() => { if (perms.canEdit) setBoxesModal(true); }}>
                                                <PanelGridTd className="font-mono text-[#FB7506] font-bold">{t(row.UNICO)}</PanelGridTd>
                                                <PanelGridTd>{t(row.READY_TRAN)}</PanelGridTd>
                                                <PanelGridTd>{t(row.SORDER_NO)}</PanelGridTd>
                                                <PanelGridTd>{t(row.SEL)}</PanelGridTd>
                                                <PanelGridTd>{t(row.LOTE)}</PanelGridTd>
                                                <PanelGridTd>{t(row.MARKET)}</PanelGridTd>
                                                <PanelGridTd>{t(row.PODER_NO)}</PanelGridTd>
                                                <PanelGridTd>{t(row.CUSTOMER)}</PanelGridTd>
                                                <PanelGridTd align="right">{row.QTY_TRANSIT}</PanelGridTd>
                                                <PanelGridTd>{fmtDate(row.BOX_DATE)}</PanelGridTd>
                                                <PanelGridTd align="right">{row.DAYS}</PanelGridTd>
                                                <PanelGridTd align="right">{row.BOX_QTY}</PanelGridTd>
                                                <PanelGridTd>{t(row.BOXNUM)}</PanelGridTd>
                                                <PanelGridTd align="right">{row.TOTAL_UNITS}</PanelGridTd>
                                                <PanelGridTd align="right">{fmt(row.F_COST_X_U)}</PanelGridTd>
                                                <PanelGridTd align="right">{fmt(row.F_FCOST_X_U)}</PanelGridTd>
                                            </PanelGridTr>
                                        ))}
                                        {!selAwb && emptyMsg("Select an AWB from the grid above.")}
                                        {selAwb && !(boxes as any[]).length && !loadingBoxes && emptyMsg("No boxes for this AWB.")}
                                    </PanelGridTbody>
                                </PanelGridTable>
                            </PanelGrid>
                        )}

                        {/* Tab 4: Charges by Date */}
                        {activeTab === "by-date" && (
                            <PanelGrid
                                title="AWB Direct Cost — Prorate by Date"
                                icon={Calendar}
                                recordCount={(byDate as any[]).length || undefined}
                                refreshing={loadingByDate}
                                onRefresh={() => refetchByDate()}
                                headerRight={<AuditLogModal recordId={selByDate?.UNICO} disabled={!selByDate} />}
                                menuItems={[
                                    { label: "Add",    icon: Plus,   color: "green",  onClick: () => { if (!perms.canCreate) { toast.error(PERMISSION_MSGS.create); return; } setSelByDate(null); setFreightsModal({ mode: "add" }); }, disabled: !perms.canCreate },
                                    { label: "Edit",   icon: Pencil, color: "orange", onClick: () => { if (!perms.canEdit)   { toast.error(PERMISSION_MSGS.edit);   return; } setFreightsModal({ mode: "edit" }); }, disabled: !selByDate || !perms.canEdit },
                                    { label: "Delete", icon: Trash2, color: "red",    onClick: () => handleDeleteByDate(selByDate), disabled: !selByDate || !perms.canDelete },
                                ]}
                                className="flex-1 min-h-0 h-full rounded-none border-0"
                            >
                                <PanelGridTable>
                                    <PanelGridThead>
                                        <PanelGridTh>Code</PanelGridTh>
                                        <PanelGridTh>AP Type</PanelGridTh>
                                        <PanelGridTh>Supplier</PanelGridTh>
                                        <PanelGridTh>Charge Date</PanelGridTh>
                                        <PanelGridTh>Apply From</PanelGridTh>
                                        <PanelGridTh>Apply To</PanelGridTh>
                                        <PanelGridTh align="right">Total Box</PanelGridTh>
                                        <PanelGridTh align="right">Duties</PanelGridTh>
                                        <PanelGridTh align="right">O.Charges</PanelGridTh>
                                        <PanelGridTh>Invoice</PanelGridTh>
                                        <PanelGridTh>Notes</PanelGridTh>
                                        <PanelGridTh>Timestamp</PanelGridTh>
                                    </PanelGridThead>
                                    <PanelGridTbody>
                                        {(byDate as any[]).map((row: any) => (
                                            <PanelGridTr key={row.UNICO} selected={selByDate?.UNICO === row.UNICO} onClick={() => selByDate?.UNICO === row.UNICO ? setSelByDate(null) : setSelByDate(row)} onDoubleClick={() => { if (perms.canEdit) setFreightsModal({ mode: "edit" }); }}>
                                                <PanelGridTd className="font-mono text-[#FB7506] font-bold">{t(row.UNICO)}</PanelGridTd>
                                                <PanelGridTd>{ctDateMap[t(row.AP_TYPE_UQ)] || t(row.AP_TYPE_UQ)}</PanelGridTd>
                                                <PanelGridTd>{spAllMap[t(row.SUPPLIER_UQ)] || t(row.SUPPLIER_UQ)}</PanelGridTd>
                                                <PanelGridTd>{fmtDate(row.CHARGE_DATE)}</PanelGridTd>
                                                <PanelGridTd>{fmtDate(row.APPLY_FROM)}</PanelGridTd>
                                                <PanelGridTd>{fmtDate(row.APPLY_TO)}</PanelGridTd>
                                                <PanelGridTd align="right">{row.TOTAL_BOX}</PanelGridTd>
                                                <PanelGridTd align="right">{fmt(row.DUTIES)}</PanelGridTd>
                                                <PanelGridTd align="right">{fmt(row.OCHARGES)}</PanelGridTd>
                                                <PanelGridTd>{t(row.INVOICE_NO)}</PanelGridTd>
                                                <PanelGridTd>{t(row.NOTES)}</PanelGridTd>
                                                <PanelGridTd className="text-gray-400">{fmtDate(row.TIMESTAMP)}</PanelGridTd>
                                            </PanelGridTr>
                                        ))}
                                        {!(byDate as any[]).length && !loadingByDate && emptyMsg("No charges by date in this period.")}
                                    </PanelGridTbody>
                                </PanelGridTable>
                            </PanelGrid>
                        )}

                        {/* Tab 5: Varieties */}
                        {activeTab === "varieties" && (
                            <PanelGrid
                                title="Varieties x AWB"
                                icon={BarChart2}
                                recordCount={(varieties as any[]).length || undefined}
                                refreshing={loadingVarieties}
                                onRefresh={() => refetchVarieties()}
                                headerRight={<AuditLogModal recordId={selVariety?.UNICO} disabled={!selVariety} />}
                                menuItems={[
                                    { label: "Add",    icon: Plus,   color: "green", onClick: handleAddVariety, disabled: !selAwb || !perms.canCreate },
                                    { label: "Delete", icon: Trash2, color: "red",   onClick: () => handleDeleteVariety(selVariety), disabled: !selVariety || !perms.canDelete },
                                ]}
                                className="flex-1 min-h-0 h-full rounded-none border-0"
                            >
                                <PanelGridTable>
                                    <PanelGridThead>
                                        <PanelGridTh className="font-bold text-[#FB7506]">AWBCode</PanelGridTh>
                                        <PanelGridTh>Vendor</PanelGridTh>
                                        <PanelGridTh>Product / Variety</PanelGridTh>
                                        <PanelGridTh align="right">Qty</PanelGridTh>
                                        <PanelGridTh align="right">Cost</PanelGridTh>
                                        <PanelGridTh>Tax Code</PanelGridTh>
                                        <PanelGridTh align="right">%</PanelGridTh>
                                        <PanelGridTh align="right">Duties</PanelGridTh>
                                        <PanelGridTh>Entry Code</PanelGridTh>
                                        <PanelGridTh align="right">MPF</PanelGridTh>
                                        <PanelGridTh>AWB Date</PanelGridTh>
                                    </PanelGridThead>
                                    <PanelGridTbody>
                                        {(varieties as any[]).map((row: any, i: number) => (
                                            <PanelGridTr key={row.UNICO ?? i} selected={selVariety?.UNICO === row.UNICO} onClick={() => selVariety?.UNICO === row.UNICO ? setSelVariety(null) : setSelVariety(row)}>
                                                <PanelGridTd className="font-bold text-[#FB7506]">{t(row.AWBCODE)}</PanelGridTd>
                                                <PanelGridTd>{t(row.GROWER)}</PanelGridTd>
                                                <PanelGridTd>{t(row.DESCRIPTION)}</PanelGridTd>
                                                <PanelGridTd align="right">{row.QTY}</PanelGridTd>
                                                <PanelGridTd align="right">{fmt(row.AMOUNT)}</PanelGridTd>
                                                <PanelGridTd>{t(row.TAX_CODE)}</PanelGridTd>
                                                <PanelGridTd align="right">{fmt(row.PORCENT)}</PanelGridTd>
                                                <PanelGridTd align="right">{fmt(row.REAL_AMOUNT)}</PanelGridTd>
                                                <PanelGridTd>{t(row.ENTRY_CODE)}</PanelGridTd>
                                                <PanelGridTd align="right">{fmt(row.MPF)}</PanelGridTd>
                                                <PanelGridTd>{fmtDate(row.AWBDATE)}</PanelGridTd>
                                            </PanelGridTr>
                                        ))}
                                        {!selAwb && emptyMsg("Select an AWB from the grid above.")}
                                        {selAwb && !(varieties as any[]).length && !loadingVarieties && emptyMsg("No varieties for this AWB.")}
                                    </PanelGridTbody>
                                </PanelGridTable>
                            </PanelGrid>
                        )}
                    </div>
                </div>
            </div>

            <AppFooter areaLabel="Logistics" />

            {/* ── Modals ──────────────────────────────────────────────────────── */}
            {chargesModal && selAwb && (
                <AwbsChargesModal
                    mode={chargesModal.mode}
                    charge={chargesModal.mode === "edit" ? selCharge : null}
                    awbcode={selAwb.AWBCODE}
                    airline={chargesModal.mode === "edit" ? (selCharge?.AIRLINE ?? selAwb.AIRLINE) : selAwb.AIRLINE}
                    onClose={() => setChargesModal(null)}
                    onSaved={(unico: string) => {
                        logAction(chargesModal.mode === "edit" ? "Edit" : "Insert", unico, `AWB ${selAwb.AWBCODE} charge`);
                        qc.invalidateQueries({ queryKey: ["awb-charges", selAwb.AWBCODE] });
                        refetchAwbs();
                    }}
                />
            )}
            {freightsModal && (
                <AwbsFreightsModal
                    mode={freightsModal.mode}
                    charge={freightsModal.mode === "edit" ? selByDate : null}
                    airline={selAwb?.AIRLINE ?? ""}
                    onClose={() => setFreightsModal(null)}
                    onSaved={(unico: string) => {
                        logAction(freightsModal.mode === "edit" ? "Edit" : "Insert", unico, "AWB freight charge by date");
                        qc.invalidateQueries({ queryKey: ["awb-by-date", dateFrom, dateTo] });
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
                        logAction("Edit", awbcode, "AWB date change");
                        triggerSearch();
                    }}
                />
            )}
            <ReportModal url={reportUrl} onClose={() => setReportUrl(null)} />
        </div>
    );
}
