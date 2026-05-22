"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { XCircle, Save, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const today = () => new Date().toISOString().split("T")[0];
const fmt   = (v: any) => parseFloat(v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const qcPost = (url: string, body: any) =>
    fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        .then(r => r.json());

interface QCModalProps {
    mode:    "add" | "edit";          // 'C' = add, 'E' = edit
    lot:     any;                     // selected row from TableQC (has f_cost_x_u, c_cost_x_u, stock, etc.)
    credit?: any;                     // existing credit row (edit mode)
    onClose: () => void;
    onSaved: () => void;
}

interface QCForm {
    reasonUq:        string;
    crDate:          string;
    crUnitsBox:      number;
    crTotalUnits:    number;
    crBoxes:         number;
    replacementCost: number;
    laborCost:       number;
    fumigationCost:  number;
    amount:          number;
    percentage:      number;
    notes:           string;
    // Checkboxes
    calculate:       boolean;
    freightApply:    boolean;
    farmApply:       boolean;
    laborApply:      boolean;
    replacementApply:boolean;
    fumigation:      boolean;
    vendorCredit:    boolean;
    pending:         boolean;
    invAdjusts:      boolean;
    sent:            boolean;
    usda:            boolean;
    reject:          boolean;
    warning:         boolean;
    showPercent:     boolean;
    // Computed (readonly)
    suggested:       number;
    farmCost:        number;
    landingCost:     number;
}

function blankForm(lot: any): QCForm {
    return {
        reasonUq: "", crDate: today(), crUnitsBox: 0, crTotalUnits: 0, crBoxes: 0,
        replacementCost: 0, laborCost: 0, fumigationCost: 0, amount: 0, percentage: 0, notes: "",
        calculate: false, freightApply: false, farmApply: false, laborApply: false,
        replacementApply: false, fumigation: false, vendorCredit: false, pending: false,
        invAdjusts: false, sent: false, usda: false, reject: false, warning: false, showPercent: false,
        suggested: 0, farmCost: 0, landingCost: 0,
    };
}

function fromCredit(lot: any, credit: any): QCForm {
    return {
        reasonUq:        credit.reason_uq    ?? "",
        crDate:          credit.cr_date?.split("T")[0] ?? today(),
        crUnitsBox:      Number(credit.cr_units_box)   || 0,
        crTotalUnits:    Number(credit.cr_units)        || 0,
        crBoxes:         Number(credit.cr_boxes)        || 0,
        replacementCost: Number(credit.replacement)     || 0,
        laborCost:       Number(credit.labor_cost)      || 0,
        fumigationCost:  Number(credit.lnfumigation_cost || 0),
        amount:          Number(credit.cr_amount)       || 0,
        percentage:      Number(credit.percentage)      || 0,
        notes:           credit.notes                   ?? "",
        calculate:       false,
        freightApply:    !!credit.apply_freight,
        farmApply:       !!credit.apply_farm,
        laborApply:      !!credit.apply_labor,
        replacementApply:!!credit.apply_replacement,
        fumigation:      false,
        vendorCredit:    false,
        pending:         false,
        invAdjusts:      false,
        sent:            !!credit.sent,
        usda:            false,
        reject:          false,
        warning:         !!credit.warning,
        showPercent:     false,
        suggested:       Number(credit.suggested_value) || 0,
        farmCost:        0,
        landingCost:     0,
    };
}

/** QC Calculator: recalculate derived fields whenever checkboxes/inputs change */
function calcQC(form: QCForm, lot: any): Pick<QCForm, "crTotalUnits" | "suggested" | "farmCost" | "landingCost" | "amount"> {
    const crTotalUnits = form.calculate ? form.crUnitsBox * form.crBoxes : form.crTotalUnits;
    const fCostXU  = Number(lot?.flower_cost  || lot?.f_cost_x_u  || 0);
    const cCostXU  = Number(lot?.c_cost_x_u   || 0);

    const lnfarm        = form.farmApply        ? fCostXU * crTotalUnits                    : 0;
    const lnfreight     = form.freightApply     ? cCostXU * crTotalUnits                    : 0;
    const lnlabor       = form.laborApply       ? form.laborCost * crTotalUnits              : 0;
    const lnreplacement = form.replacementApply ? form.replacementCost * crTotalUnits        : 0;
    const lnfumigation  = form.fumigation       ? form.fumigationCost                        : 0;

    const suggested = lnfarm + lnfreight + lnlabor + lnreplacement + lnfumigation;
    const amount    = form.vendorCredit ? (suggested * (form.percentage || 100) / 100) : form.amount;

    return { crTotalUnits, suggested, farmCost: lnfarm, landingCost: lnfreight, amount };
}

export default function QCModal({ mode, lot, credit, onClose, onSaved }: QCModalProps) {
    const isEdit = mode === "edit";
    const [form,   setForm]   = useState<QCForm>(() => isEdit && credit ? fromCredit(lot, credit) : blankForm(lot));
    const [saving, setSaving] = useState(false);
    const [error,  setError]  = useState<string | null>(null);

    // Reasons dropdown
    const { data: reasons = [] } = useQuery({
        queryKey: ["qc-reasons"],
        queryFn: () => qcPost("/api/qc/lookup/reasons", {}),
        staleTime: 300000,
        select: (d: any) => d.data ?? [],
    });

    // Recalculate whenever form changes
    useEffect(() => {
        const computed = calcQC(form, lot);
        setForm(prev => ({
            ...prev,
            crTotalUnits: computed.crTotalUnits,
            suggested:    computed.suggested,
            farmCost:     computed.farmCost,
            landingCost:  computed.landingCost,
            // Only override amount if vendorCredit checkbox is on
            amount: prev.vendorCredit ? computed.amount : prev.amount,
        }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.calculate, form.freightApply, form.farmApply, form.laborApply, form.replacementApply,
        form.fumigation, form.vendorCredit, form.crUnitsBox, form.crBoxes, form.laborCost,
        form.replacementCost, form.fumigationCost, form.percentage]);

    const set = (key: keyof QCForm, val: any) => setForm(prev => ({ ...prev, [key]: val }));
    const Num = (key: keyof QCForm) => ({
        type: "number", step: "0.01",
        value: (form[key] as number) ?? 0,
        onChange: (e: any) => set(key, parseFloat(e.target.value) || 0),
    });
    const Chk = (key: keyof QCForm) => ({
        type: "checkbox",
        checked: !!(form[key]),
        onChange: (e: any) => set(key, e.target.checked),
    });

    const save = async () => {
        if (!form.reasonUq) { setError("Reason is required."); return; }
        if (!form.crDate)   { setError("Date is required."); return; }
        if (!form.crBoxes)  { setError("CR Boxes is required."); return; }
        if (!form.amount && form.amount !== 0) { setError("Credit Amount is required."); return; }
        setSaving(true); setError(null);
        try {
            const payload = {
                pkboxUq:         lot.unico,
                unico:           credit?.unico,
                reasonUq:        form.reasonUq,
                crDate:          form.crDate,
                crBoxes:         form.crBoxes,
                crTotalUnits:    form.crTotalUnits,
                crUnitsBox:      form.crUnitsBox,
                crUnitsBunch:    0,
                amount:          form.amount,
                notes:           form.notes,
                laborApply:      form.laborApply,
                laborCost:       form.laborCost,
                replacementApply:form.replacementApply,
                replacementCost: form.replacementCost,
                freightApply:    form.freightApply,
                farmApply:       form.farmApply,
                percentage:      form.percentage,
                suggested:       form.suggested,
                pending:         form.pending,
                warning:         form.warning,
                invAdjusts:      form.invAdjusts,
                sent:            form.sent,
                fumigation:      form.fumigation,
                fumigationCost:  form.fumigationCost,
                usda:            form.usda,
                showPercent:     form.showPercent,
            };
            const url = isEdit ? "/api/qc/credits/update" : "/api/qc/credits/insert";
            const d   = await qcPost(url, payload);
            if (!d.success) throw new Error(d.error);
            toast.success(isEdit ? "QC credit updated." : "QC credit added.");
            onSaved();
            onClose();
        } catch (e: any) { setError(e.message); }
        finally { setSaving(false); }
    };

    const cb = (label: string, key: keyof QCForm, color?: string) => (
        <label className={cn("flex items-center gap-1.5 cursor-pointer select-none", color)}>
            <input {...Chk(key)} className="w-3.5 h-3.5 accent-[#FB7506]"/>
            <span className="text-[10px] font-semibold text-gray-600">{label}</span>
        </label>
    );

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col">
                {/* Header */}
                <div className="h-10 bg-[#374151] rounded-t-xl flex items-center justify-between px-4 shrink-0">
                    <span className="text-white text-[11px] font-black uppercase tracking-wide truncate">
                        {isEdit ? `Edit QC — ${lot?.lote} | ${lot?.description?.substring(0,40)}` : `Quality Credit — ${lot?.lote} | ${lot?.description?.substring(0,40)}`}
                    </span>
                    {error && <span className="text-amber-400 text-[10px] font-bold ml-2 truncate">{error}</span>}
                    <button onClick={onClose}><XCircle size={16} className="text-gray-400 hover:text-white"/></button>
                </div>

                <div className="overflow-y-auto flex-1 p-4 text-xs">
                    {/* Lot info */}
                    <div className="bg-gray-50 rounded p-2 grid grid-cols-4 gap-2 mb-4 border">
                        {[
                            { l:"AWBCode",  v: lot?.awbcode },
                            { l:"Grower",   v: lot?.grower },
                            { l:"Lote",     v: lot?.lote },
                            { l:"Stock",    v: lot?.stock },
                            { l:"F.Cost/U", v: `$${fmt(lot?.flower_cost || lot?.f_cost_x_u)}` },
                            { l:"C.Cost/U", v: `$${fmt(lot?.c_cost_x_u)}` },
                            { l:"T.Units",  v: lot?.total_units },
                            { l:"In Transit",v: lot?.qty_transit },
                        ].map(f => (
                            <div key={f.l}>
                                <span className="text-[9px] font-black text-gray-400 uppercase">{f.l}: </span>
                                <span className="font-bold text-gray-700">{f.v ?? "—"}</span>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {/* Column 1: Core fields */}
                        <div className="space-y-2">
                            <div className="flex flex-col gap-0.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase">Reason *</label>
                                <select value={form.reasonUq} onChange={e => set("reasonUq", e.target.value)} className="fos-input py-1">
                                    <option value="">— Select —</option>
                                    {(reasons as any[]).map((r: any) => <option key={r.unico ?? r.UNICO} value={r.unico ?? r.UNICO}>{r.reason ?? r.description ?? r.DESCRIPTION}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase">QC Credit Date *</label>
                                <input type="date" value={form.crDate} onChange={e => set("crDate", e.target.value)} className="fos-input py-1"/>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase">CR Units x Box *</label>
                                <input {...Num("crUnitsBox")} className="fos-input py-1"/>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase">CR Total Units *</label>
                                <input {...Num("crTotalUnits")} className="fos-input py-1"/>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase">CR Boxes *</label>
                                <input {...Num("crBoxes")} className="fos-input py-1"/>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase">Replacement Cost x Unit</label>
                                <input {...Num("replacementCost")} className="fos-input py-1"/>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase">Labor Cost x Unit</label>
                                <input {...Num("laborCost")} className="fos-input py-1"/>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase">Fumigation</label>
                                <input {...Num("fumigationCost")} className="fos-input py-1"/>
                            </div>
                        </div>

                        {/* Column 2: Calculated + amount */}
                        <div className="space-y-2">
                            <div className="flex flex-col gap-0.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase">Credit Amount *</label>
                                <input {...Num("amount")} className="fos-input py-1 font-bold text-red-600"/>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase">QC %</label>
                                <input {...Num("percentage")} className="fos-input py-1"/>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase">Notes</label>
                                <textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={3} className="fos-input py-1 resize-none"/>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase">Suggested QC Amount</label>
                                <input readOnly value={fmt(form.suggested)} className="fos-input py-1 bg-amber-50 text-amber-700 font-bold"/>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase">QC Farm Cost</label>
                                <input readOnly value={fmt(form.farmCost)} className="fos-input py-1 bg-gray-50 text-gray-500"/>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase">QC Landing Cost</label>
                                <input readOnly value={fmt(form.landingCost)} className="fos-input py-1 bg-gray-50 text-gray-500"/>
                            </div>
                        </div>

                        {/* Column 3: Checkboxes */}
                        <div className="space-y-1.5 border-l pl-4">
                            <p className="text-[9px] font-black text-gray-400 uppercase mb-2">Options</p>
                            {cb("Calculate (Units = Units/Box × Boxes)", "calculate", "text-blue-600")}
                            {cb("Landing Cost",   "freightApply",     "text-blue-500")}
                            {cb("Cost Farm",      "farmApply",        "text-green-600")}
                            {cb("Labor",          "laborApply",       "text-gray-600")}
                            {cb("Replacement",    "replacementApply", "text-gray-600")}
                            {cb("Fumigation",     "fumigation",       "text-gray-600")}
                            {cb("Vendor Credit (Amount = Suggested × %)", "vendorCredit", "text-[#FB7506]")}
                            <div className="border-t pt-1.5 mt-1 grid grid-cols-2 gap-1">
                                {cb("Pending",    "pending")}
                                {cb("Inv. Adjusts","invAdjusts")}
                                {cb("Sent",       "sent")}
                                {cb("Check USDA", "usda")}
                                {cb("Reject",     "reject")}
                                {cb("Warning",    "warning")}
                                {cb("Show %",     "showPercent")}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 px-4 py-3 bg-gray-50 border-t rounded-b-xl shrink-0">
                    <button onClick={onClose} className="px-4 py-2 rounded border text-sm font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
                    <button onClick={save} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded bg-[#FB7506] hover:bg-orange-600 text-white text-sm font-black disabled:opacity-50">
                        {saving ? <RefreshCcw size={13} className="animate-spin"/> : <Save size={13}/>}{saving ? "Saving..." : "OK"}
                    </button>
                </div>
            </div>
        </div>
    );
}
