"use client";
import { useState, useEffect } from "react";
import { X, Boxes, RefreshCcw, Check } from "lucide-react";
import { toast } from "sonner";

const t = (v: any) => String(v ?? "").trim();
const fmt2 = (v: any) => parseFloat(v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmt4 = (v: any) => parseFloat(v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 });

const EMPTY = {
    product_uq: "", product_desc: "", case_uq: "", cporder_no: "",
    box_qty: 0, packs_box: 0, packs_units: 0, stem_pack: false,
    lote: 0, cut_point: 2, box_id: "",
    price_x_u: 0, f_cost_x_u: 0,
    freight_cost: 0, duties_cost: 0, broker_cost: 0, handling_cost: 0, charge_cost: 0,
    inventory_notes: "",
};

// Same VFP calc used elsewhere: units/box = stem_pack ? packs_box*packs_units : packs_box
const calc = (f: any) => {
    const unitsXBox  = f.stem_pack ? (f.packs_box || 0) * (f.packs_units || 0) : (f.packs_box || 0);
    const totalUnits = unitsXBox * (f.box_qty || 0);
    const tCharges   = ((f.freight_cost || 0) + (f.duties_cost || 0) + (f.broker_cost || 0) +
                        (f.handling_cost || 0) + (f.charge_cost || 0)) * (f.box_qty || 0);
    const cCostXU    = totalUnits > 0 ? tCharges / totalUnits : 0;
    return { ...f, units_x_box: unitsXBox, total_units: totalUnits, t_charges: tCharges, c_cost_x_u: cCostXU, t_cost_x_u: cCostXU + (f.f_cost_x_u || 0) };
};

interface Props {
    open: boolean;
    onClose: () => void;
    boxUnico: string;
    cases: any[];
    userId: string;
    onSuccess: () => void;
}

export function ModalEditBox({ open, onClose, boxUnico, cases, userId, onSuccess }: Props) {
    const [form,    setForm]    = useState<any>(EMPTY);
    const [loading, setLoading] = useState(false);
    const [saving,  setSaving]  = useState(false);

    useEffect(() => {
        if (!open || !boxUnico) return;
        setLoading(true);
        fetch(`/api/inventory-entry/boxes/${boxUnico}`)
            .then(r => r.json())
            .then(d => {
                if (!d) return;
                const f: any = {};
                for (const [k, v] of Object.entries(d)) f[k.toLowerCase()] = v;
                setForm(calc({
                    product_uq:      t(f.box_pack_uq ?? f.product_uq),
                    product_desc:    t(f.description ?? ""),
                    case_uq:         t(f.case_uq),
                    cporder_no:      t(f.cporder_no),
                    box_qty:         parseInt(f.box_qty ?? 0) || 0,
                    packs_box:       parseInt(f.packs_box ?? 0) || 0,
                    packs_units:     parseInt(f.up_x_pack ?? 0) || 0,
                    stem_pack:       Boolean(f.stem_pack),
                    lote:            parseInt(f.lote ?? 0) || 0,
                    cut_point:       parseInt(f.cut_point ?? 2) || 2,
                    box_id:          t(f.box_id),
                    price_x_u:       parseFloat(f.price_x_u ?? 0) || 0,
                    f_cost_x_u:      parseFloat(f.f_cost_x_u ?? 0) || 0,
                    freight_cost:    parseFloat(f.freight_cost ?? 0) || 0,
                    duties_cost:     parseFloat(f.duties_cost ?? 0) || 0,
                    broker_cost:     parseFloat(f.broker_cost ?? 0) || 0,
                    handling_cost:   parseFloat(f.handling_cost ?? 0) || 0,
                    charge_cost:     parseFloat(f.charge_cost ?? 0) || 0,
                    inventory_notes: t(f.inventory_notes),
                }));
            })
            .catch(e => toast.error(e.message))
            .finally(() => setLoading(false));
    }, [open, boxUnico]);

    if (!open) return null;

    const setF = (key: string, val: any) => setForm((p: any) => calc({ ...p, [key]: val }));

    // VFP "boxes.scx" cmbcases.Valid: switching Case reapplies that case's default per-box charges
    // (freight/handling/duties/broker) — distinct from WHControl's case-change, which rescales bunches/case.
    const handleCaseChange = (caseUq: string) => {
        const newCase = cases.find((c: any) => t(c.UNICO) === caseUq);
        setForm((p: any) => calc({
            ...p,
            case_uq:       caseUq,
            freight_cost:  parseFloat(newCase?.FREIGHT ?? 0) || 0,
            handling_cost: parseFloat(newCase?.HANDLING ?? 0) || 0,
            duties_cost:   parseFloat(newCase?.DUTIES ?? 0) || 0,
            broker_cost:   parseFloat(newCase?.BROKER ?? 0) || 0,
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/inventory-entry/boxes/${boxUnico}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, user_uq: userId }),
            });
            const d = await res.json();
            if (!d.success) throw new Error(d.error || "Update failed");
            toast.success("Box updated.");
            onSuccess();
            onClose();
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setSaving(false);
        }
    };

    const fLabel = "text-[10px] font-black text-gray-500 uppercase tracking-wider";
    const fInput = "fos-input h-7 text-xs";

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden" style={{ maxHeight: "90vh" }} onClick={e => e.stopPropagation()}>
                <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 rounded-t-lg shrink-0">
                    <div className="flex items-center gap-2">
                        <Boxes size={16} className="text-[#FB7506]" />
                        <span className="font-black text-[10px] text-white uppercase tracking-widest">Edit Box — Lot {form.lote || boxUnico}</span>
                        {loading && <RefreshCcw size={11} className="text-gray-400 animate-spin ml-1" />}
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={16} /></button>
                </div>

                <div className="overflow-y-auto p-4 space-y-3">
                    <div className="bg-gray-50 rounded p-2 text-xs text-gray-600 border border-gray-100">
                        Product: <span className="font-bold text-gray-800">{t(form.product_desc) || form.product_uq}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-2 text-xs">
                        <div className="flex flex-col gap-0.5">
                            <label className={fLabel}>Case *</label>
                            <select value={form.case_uq} onChange={e => handleCaseChange(e.target.value)} className={fInput}>
                                <option value="">-- Case --</option>
                                {cases.map((c: any) => (
                                    <option key={t(c.UNICO)} value={t(c.UNICO)}>{t(c.CASE ?? c.DESCRIPTION ?? c.UNICO)}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <label className={fLabel}>C.POrder #</label>
                            <input value={form.cporder_no} onChange={e => setF("cporder_no", e.target.value.substring(0, 10))} className={fInput} maxLength={10} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <label className={fLabel}>Box Qty *</label>
                            <input type="number" value={form.box_qty} onChange={e => setF("box_qty", parseInt(e.target.value) || 0)} className={fInput + " text-right font-bold"} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <label className={fLabel}>Cut Point (0-4)</label>
                            <input type="number" min={0} max={4} value={form.cut_point} onChange={e => setF("cut_point", Math.max(0, Math.min(4, parseInt(e.target.value) || 0)))} className={fInput + " text-right"} />
                        </div>

                        <div className="flex flex-col gap-0.5">
                            <label className={fLabel}>Bunches x Case</label>
                            <input type="number" value={form.packs_box} onChange={e => setF("packs_box", parseInt(e.target.value) || 0)} className={fInput + " text-right"} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <label className={fLabel}>Stems x Bunch</label>
                            <input type="number" value={form.packs_units} onChange={e => setF("packs_units", parseInt(e.target.value) || 0)} className={fInput + " text-right"} disabled={!form.stem_pack} />
                        </div>
                        <div className="flex flex-col gap-0.5 justify-end">
                            <label className="flex items-center gap-2 cursor-pointer h-7">
                                <input type="checkbox" checked={Boolean(form.stem_pack)} onChange={e => setF("stem_pack", e.target.checked)} className="w-4 h-4 accent-[#FB7506]" />
                                <span className="text-xs font-semibold text-gray-700">Stem Pack</span>
                            </label>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <label className={fLabel}>Cust. Code / Box Id.</label>
                            <input value={form.box_id} onChange={e => setF("box_id", e.target.value.substring(0, 20))} className={fInput} maxLength={20} />
                        </div>

                        <div className="flex flex-col gap-0.5">
                            <label className={fLabel}>Units / Box</label>
                            <input readOnly value={form.units_x_box} className={fInput + " text-right bg-gray-50"} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <label className={fLabel}>Total Units</label>
                            <input readOnly value={form.total_units} className={fInput + " text-right bg-gray-50 font-bold text-green-700"} />
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Pricing</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-2 text-xs">
                            <div className="flex flex-col gap-0.5">
                                <label className={fLabel}>Price / Unit</label>
                                <input type="number" step="0.0001" value={form.price_x_u} onChange={e => setF("price_x_u", parseFloat(e.target.value) || 0)} className={fInput + " text-right"} />
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <label className={fLabel}>F Cost x U.</label>
                                <input type="number" step="0.0001" value={form.f_cost_x_u} onChange={e => setF("f_cost_x_u", parseFloat(e.target.value) || 0)} className={fInput + " text-right"} />
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <label className={fLabel}>C Cost x U.</label>
                                <input readOnly value={fmt4(form.c_cost_x_u)} className={fInput + " text-right bg-gray-50"} />
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <label className={fLabel}>T Cost x U.</label>
                                <input readOnly value={fmt4(form.t_cost_x_u)} className={fInput + " text-right bg-gray-50"} />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Charges per Box</p>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-x-3 gap-y-2 text-xs">
                            {[
                                { key: "freight_cost",  label: "Freight x Bx" },
                                { key: "duties_cost",   label: "Duties x Bx" },
                                { key: "broker_cost",   label: "Broker x Bx" },
                                { key: "handling_cost", label: "Handling x Bx" },
                                { key: "charge_cost",   label: "Other x Bx" },
                            ].map(f => (
                                <div key={f.key} className="flex flex-col gap-0.5">
                                    <label className={fLabel}>{f.label}</label>
                                    <input type="number" step="0.01" value={form[f.key]}
                                        onChange={e => setF(f.key, parseFloat(e.target.value) || 0)}
                                        className={fInput + " text-right"} />
                                </div>
                            ))}
                            <div className="flex flex-col gap-0.5">
                                <label className={fLabel}>T. Charges</label>
                                <input readOnly value={fmt2(form.t_charges)} className={fInput + " text-right bg-gray-50 font-bold text-red-700"} />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-0.5">
                        <label className={fLabel}>Inventory Notes</label>
                        <textarea value={form.inventory_notes} onChange={e => setF("inventory_notes", e.target.value.substring(0, 250))}
                            rows={2} className="fos-input text-xs resize-none py-1" maxLength={250} />
                    </div>

                </div>

                <div className="flex justify-end gap-2 px-4 py-3 bg-gray-50 border-t shrink-0">
                    <button onClick={onClose} className="px-4 py-2 rounded border border-gray-200 text-xs font-black uppercase text-gray-600 hover:bg-gray-100 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving}
                        className="flex items-center gap-2 px-5 py-2 rounded bg-[#FB7506] hover:bg-orange-600 disabled:opacity-40 text-white text-xs font-black uppercase tracking-wider transition-all">
                        {saving ? <RefreshCcw size={12} className="animate-spin" /> : <Check size={12} />}
                        {saving ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}
