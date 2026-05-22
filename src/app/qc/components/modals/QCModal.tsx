"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { LogOut, Save, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

const today = () => new Date().toISOString().split("T")[0];

const qcPost = (url: string, body: any) =>
    fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        .then(r => r.json());

interface QCModalProps {
    mode:    "add" | "edit";
    lot:     any;    // row from sp_flower_inventory_quality_control
    credit?: any;    // row from sp_flower_packing_quality_credits (edit mode)
    onClose: () => void;
    onSaved: () => void;
}

interface QCForm {
    reasonUq:         string;
    crDate:           string;
    crUnitsBox:       number;
    crTotalUnits:     number;
    crBoxes:          number;
    replacementCost:  number;
    laborCost:        number;
    fumigationCost:   number;
    amount:           number;
    percentage:       number;
    notes:            string;
    // Checkboxes
    calculate:        boolean;
    freightApply:     boolean;
    farmApply:        boolean;
    laborApply:       boolean;
    replacementApply: boolean;
    fumigation:       boolean;
    vendorCredit:     boolean;
    pending:          boolean;
    invAdjusts:       boolean;
    sent:             boolean;
    usda:             boolean;
    reject:           boolean;
    warning:          boolean;
    showPercent:      boolean;
    // Computed readonly
    suggested:    number;
    farmCost:     number;
    landingCost:  number;
}

function blankForm(): QCForm {
    return {
        reasonUq: "", crDate: today(), crUnitsBox: 0, crTotalUnits: 0, crBoxes: 0,
        replacementCost: 0, laborCost: 0, fumigationCost: 0, amount: 0, percentage: 100, notes: "",
        calculate: false, freightApply: false, farmApply: false, laborApply: false,
        replacementApply: false, fumigation: false, vendorCredit: true, pending: false,
        invAdjusts: false, sent: false, usda: false, reject: false, warning: false, showPercent: false,
        suggested: 0, farmCost: 0, landingCost: 0,
    };
}

function fromCredit(_lot: any, c: any): QCForm {
    return {
        reasonUq:         c.reason_uq        ?? "",
        crDate:           c.cr_date?.split("T")[0] ?? today(),
        crUnitsBox:       Number(c.cr_units_box)   || 0,
        crTotalUnits:     Number(c.cr_units)        || 0,
        crBoxes:          Number(c.cr_boxes)        || 0,
        replacementCost:  Number(c.replacement)     || 0,
        laborCost:        Number(c.labor_cost)      || 0,
        fumigationCost:   Number(c.lnfumigation_cost || c.fumigation_cost || 0),
        amount:           Number(c.cr_amount)       || 0,
        percentage:       Number(c.percentage)      || 100,
        notes:            c.notes                   ?? "",
        calculate:        false,
        freightApply:     !!c.apply_freight,
        farmApply:        !!c.apply_farm,
        laborApply:       !!c.apply_labor,
        replacementApply: !!c.apply_replacement,
        fumigation:       false,
        vendorCredit:     false,
        pending:          false,
        invAdjusts:       !!c.comments,
        sent:             !!c.sent,
        usda:             !!c.llchecked || !!c.checked,
        reject:           false,
        warning:          !!c.warning,
        showPercent:      !!c.show_porcentage,
        suggested:        Number(c.suggested_value) || 0,
        farmCost:         0,
        landingCost:      0,
    };
}

function calcQC(form: QCForm, lot: any) {
    const crTotalUnits = form.calculate ? form.crUnitsBox * form.crBoxes : form.crTotalUnits;
    const fCost = Number(lot?.flower_cost || lot?.f_cost_x_u || 0);
    const cCost = Number(lot?.c_cost_x_u  || 0);
    const lnfarm        = form.farmApply        ? fCost * crTotalUnits             : 0;
    const lnfreight     = form.freightApply     ? cCost * crTotalUnits             : 0;
    const lnlabor       = form.laborApply       ? form.laborCost * crTotalUnits    : 0;
    const lnreplacement = form.replacementApply ? form.replacementCost * crTotalUnits : 0;
    const lnfumigation  = form.fumigation       ? form.fumigationCost              : 0;
    const suggested     = lnfarm + lnfreight + lnlabor + lnreplacement + lnfumigation;
    const amount        = form.vendorCredit ? (suggested * (form.percentage || 100) / 100) : form.amount;
    return { crTotalUnits, suggested, farmCost: lnfarm, landingCost: lnfreight, amount };
}

// ── Input styled like the original ───────────────────────────────────────────
function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-sm text-gray-500">{label}{required && " *"}</span>
            {children}
        </div>
    );
}

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
    return <input {...props} className={`w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-green-400 focus:ring-1 focus:ring-green-300 ${props.readOnly || props.disabled ? "bg-gray-100 text-gray-500" : "bg-white"} ${props.className || ""}`}/>;
}

function CBRow({ label, checked, onChange, disabled }: { label: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
    return (
        <label className={`flex items-center gap-2 cursor-pointer select-none text-sm ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}>
            <div onClick={() => !disabled && onChange(!checked)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${checked ? "bg-green-600 border-green-600" : "border-gray-300"}`}>
                {checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
            <span className="text-gray-700 font-medium">{label}</span>
        </label>
    );
}

// ── Info row ─────────────────────────────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value: any }) {
    return (
        <div className="flex gap-1">
            <span className="text-green-600 font-bold text-sm">{label}:</span>
            <span className="text-gray-800 text-sm">{value ?? "—"}</span>
        </div>
    );
}

export default function QCModal({ mode, lot, credit, onClose, onSaved }: QCModalProps) {
    const isEdit = mode === "edit";
    const [form,   setForm]   = useState<QCForm>(() => isEdit && credit ? fromCredit(lot, credit) : blankForm());
    const [saving, setSaving] = useState(false);
    const [error,  setError]  = useState<string | null>(null);

    const { data: reasons = [] } = useQuery({
        queryKey: ["qc-reasons"],
        queryFn:  () => qcPost("/api/qc/lookup/reasons", {}),
        staleTime: 300000,
        select:   (d: any) => d.data ?? [],
    });

    // Auto-recalculate when relevant fields change
    useEffect(() => {
        const c = calcQC(form, lot);
        setForm(prev => ({
            ...prev,
            crTotalUnits: c.crTotalUnits,
            suggested:    c.suggested,
            farmCost:     c.farmCost,
            landingCost:  c.landingCost,
            amount:       prev.vendorCredit ? c.amount : prev.amount,
        }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.calculate, form.freightApply, form.farmApply, form.laborApply,
        form.replacementApply, form.fumigation, form.vendorCredit,
        form.crUnitsBox, form.crBoxes, form.laborCost,
        form.replacementCost, form.fumigationCost, form.percentage]);

    const set    = (key: keyof QCForm, val: any) => setForm(p => ({ ...p, [key]: val }));
    const setNum = (key: keyof QCForm, val: string) => set(key, parseFloat(val) || 0);

    const save = async () => {
        if (!form.reasonUq) { setError("Credit Reason is required."); return; }
        if (!form.crDate)   { setError("Date is required."); return; }
        if (!form.crBoxes)  { setError("CR Boxes is required."); return; }
        setSaving(true); setError(null);
        try {
            const payload = {
                pkboxUq: lot.unico, unico: credit?.unico,
                reasonUq: form.reasonUq, crDate: form.crDate,
                crBoxes: form.crBoxes, crTotalUnits: form.crTotalUnits,
                crUnitsBox: form.crUnitsBox, crUnitsBunch: 0,
                amount: form.amount, notes: form.notes,
                laborApply: form.laborApply, laborCost: form.laborCost,
                replacementApply: form.replacementApply, replacementCost: form.replacementCost,
                freightApply: form.freightApply, farmApply: form.farmApply,
                percentage: form.percentage, suggested: form.suggested,
                pending: form.pending, warning: form.warning,
                invAdjusts: form.invAdjusts, sent: form.sent,
                fumigation: form.fumigation, fumigationCost: form.fumigationCost,
                usda: form.usda, showPercent: form.showPercent,
            };
            const url = isEdit ? "/api/qc/credits/update" : "/api/qc/credits/insert";
            const d   = await qcPost(url, payload);
            if (!d.success) throw new Error(d.error);
            toast.success(isEdit ? "QC credit updated." : "QC credit added.");
            onSaved(); onClose();
        } catch (e: any) { setError(e.message); }
        finally { setSaving(false); }
    };

    const title = isEdit ? "Vendor PO - Update" : `Vendor PO - ${lot?.lote ?? ""} | ${(lot?.description ?? "").substring(0, 35)}`;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-4 flex flex-col">

                {/* ── Header ─────────────────────────────────── */}
                <div className="bg-[#374151] rounded-t-2xl flex items-center justify-between px-4 py-3 shrink-0">
                    <span className="text-white text-sm font-bold truncate">{title}</span>
                    <button onClick={onClose} className="text-gray-400 hover:text-white ml-2 shrink-0">
                        <LogOut size={18}/>
                    </button>
                </div>

                {/* ── Lot info ────────────────────────────────── */}
                <div className="px-5 pt-4 pb-3 grid grid-cols-2 gap-x-6 gap-y-1 border-b">
                    <InfoRow label="Vendor"            value={lot?.grower}/>
                    <InfoRow label="City"              value={lot?.city ?? lot?.farm}/>
                    <InfoRow label="Product"           value={lot?.description}/>
                    <div/>
                    <InfoRow label="Price x Stem"      value={lot?.sprice_x_unit ?? lot?.price_x_u}/>
                    <InfoRow label="Case"              value={lot?.case_sh ?? lot?.case_name}/>
                    <InfoRow label="Lot"               value={lot?.lote}/>
                    <InfoRow label="Qty In"            value={lot?.qty_whouse ?? lot?.box_qty}/>
                    <InfoRow label="Units x Box"       value={lot?.tunits_x_box}/>
                    <InfoRow label="Bunches x Box"     value={lot?.up_x_pack ?? lot?.pbbunches_case}/>
                    <InfoRow label="Units x Bunch"     value={lot?.units_x_bunch ?? lot?.cr_units_bunch}/>
                    <InfoRow label="Landing Cost x Unit" value={lot?.c_cost_x_u}/>
                    <InfoRow label="Flower Cost x Unit"  value={lot?.flower_cost ?? lot?.f_cost_x_u}/>
                    <InfoRow label="Total Cost x Unit"   value={lot?.t_cost_x_u}/>
                </div>

                {error && <div className="mx-5 mt-3 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-semibold">{error}</div>}

                {/* ── Form ────────────────────────────────────── */}
                <div className="px-5 py-4 space-y-4">

                    {/* Row 1: Date + Reason */}
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="QC Credit Date" required>
                            <Input type="date" value={form.crDate} onChange={e => set("crDate", e.target.value)}/>
                        </Field>
                        <Field label="Credit Reasons List" required>
                            <select value={form.reasonUq} onChange={e => set("reasonUq", e.target.value)}
                                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-green-400 bg-white">
                                <option value="">— Select —</option>
                                {(reasons as any[]).map((r: any) => (
                                    <option key={r.unico ?? r.UNICO} value={r.unico ?? r.UNICO}>{r.reason ?? r.description ?? r.DESCRIPTION}</option>
                                ))}
                            </select>
                        </Field>
                    </div>

                    {/* Row 2: Top checkboxes */}
                    <div className="flex gap-8">
                        <CBRow label="Inventory Adjusts" checked={form.invAdjusts} onChange={v => set("invAdjusts", v)}/>
                        <CBRow label="Vendor Credit"     checked={form.vendorCredit} onChange={v => set("vendorCredit", v)}/>
                    </div>

                    {/* Row 3: CR fields */}
                    <div className="grid grid-cols-3 gap-3">
                        <Field label="CR Units x Box" required>
                            <Input type="number" step="1" value={form.crUnitsBox} onChange={e => setNum("crUnitsBox", e.target.value)}/>
                        </Field>
                        <Field label="CR Boxes" required>
                            <Input type="number" step="1" value={form.crBoxes} onChange={e => setNum("crBoxes", e.target.value)}/>
                        </Field>
                        <Field label="CR Total Units" required>
                            <Input type="number" value={form.crTotalUnits} readOnly/>
                        </Field>
                    </div>

                    {/* Row 4: Cost inputs */}
                    <div className="grid grid-cols-3 gap-3">
                        <Field label="Labor Cost x Unit">
                            <Input type="number" step="0.01" value={form.laborCost} onChange={e => setNum("laborCost", e.target.value)}/>
                        </Field>
                        <Field label="Fumigation">
                            <Input type="number" step="0.01" value={form.fumigationCost} onChange={e => setNum("fumigationCost", e.target.value)}/>
                        </Field>
                        <Field label="Replacement Cost x Unit">
                            <Input type="number" step="0.01" value={form.replacementCost} onChange={e => setNum("replacementCost", e.target.value)}/>
                        </Field>
                    </div>

                    {/* Row 5: Computed costs */}
                    <div className="grid grid-cols-3 gap-3">
                        <Field label="QC Landing Cost">
                            <Input type="number" value={form.landingCost.toFixed(2)} readOnly/>
                        </Field>
                        <div/>
                        <Field label="QC Farm Cost">
                            <Input type="number" value={form.farmCost.toFixed(2)} readOnly/>
                        </Field>
                    </div>

                    {/* Row 6: 2-column checkbox grid */}
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                        <CBRow label="Cost Farm"    checked={form.farmApply}        onChange={v => set("farmApply", v)}/>
                        <CBRow label="Pending"      checked={form.pending}          onChange={v => set("pending", v)}/>
                        <CBRow label="Landing Cost" checked={form.freightApply}     onChange={v => set("freightApply", v)}/>
                        <CBRow label="Warning"      checked={form.warning}          onChange={v => set("warning", v)}/>
                        <CBRow label="Labor"        checked={form.laborApply}       onChange={v => set("laborApply", v)}/>
                        <CBRow label="Check USDA"   checked={form.usda}             onChange={v => set("usda", v)}/>
                        <CBRow label="Fumigation"   checked={form.fumigation}       onChange={v => set("fumigation", v)}/>
                        <CBRow label="Reject"       checked={form.reject}           onChange={v => set("reject", v)}/>
                        <CBRow label="Replacement"  checked={form.replacementApply} onChange={v => set("replacementApply", v)}/>
                        <CBRow label="Sent"         checked={form.sent}             onChange={v => set("sent", v)}/>
                        <CBRow label="Calculate"    checked={form.calculate}        onChange={v => set("calculate", v)}/>
                        <CBRow label="Show %"       checked={form.showPercent}      onChange={v => set("showPercent", v)}/>
                    </div>

                    {/* Row 7: Suggested + % + Amount */}
                    <div className="grid grid-cols-3 gap-3">
                        <Field label="Suggested QC Amount">
                            <Input type="number" value={form.suggested.toFixed(2)} readOnly/>
                        </Field>
                        <Field label="QC %">
                            <Input type="number" value={form.percentage} onChange={e => setNum("percentage", e.target.value)} readOnly={form.vendorCredit}/>
                        </Field>
                        <Field label="Credit Amount" required>
                            <Input type="number" step="0.01" value={form.amount}
                                onChange={e => setNum("amount", e.target.value)}
                                readOnly={form.vendorCredit}
                                className={form.vendorCredit ? "" : "border-green-300 focus:border-green-500"}/>
                        </Field>
                    </div>

                    {/* Notes */}
                    <textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={3}
                        placeholder="Notes..."
                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-green-400 resize-none"/>

                </div>

                {/* ── Submit button ────────────────────────────── */}
                <div className="px-5 pb-5 shrink-0">
                    <button onClick={save} disabled={saving}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-black transition-colors">
                        {saving ? <RefreshCcw size={16} className="animate-spin"/> : <Save size={16}/>}
                        {saving ? "Saving..." : isEdit ? "Update" : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}
