"use client";
import { useState, useEffect } from "react";
import { X, Package, RefreshCcw, Check } from "lucide-react";
import { toast } from "sonner";

const t = (v: any) => String(v ?? "").trim();
const int = (v: any) => { const n = parseInt(String(v ?? 0), 10); return isNaN(n) ? 0 : n; };

interface Props {
    open: boolean;
    onClose: () => void;
    boxUnico: string;
    cases: any[];
    userId: string;
    onSuccess: () => void;
}

const EMPTY = { case_uq: "", box_qty: 0, packs_box: 0, packs_units: 0, stem_pack: false };
const EMPTY_INFO = { lote: "", case_sh: "", description: "" };

export function ModalBoxWHControl({ open, onClose, boxUnico, cases, userId, onSuccess }: Props) {
    const [form,    setForm]    = useState({ ...EMPTY });
    const [info,    setInfo]    = useState({ ...EMPTY_INFO });
    const [loading, setLoading] = useState(false);
    const [saving,  setSaving]  = useState(false);
    // VFP "repacking.scx": lnramoscajafull = original packs_box / original case's factor — held fixed for
    // this editing session and reapplied whenever the user switches Case, so bunches/case rescales correctly.
    const [fullCaseBunches, setFullCaseBunches] = useState(0);

    useEffect(() => {
        if (!open || !boxUnico) return;
        setLoading(true);
        fetch(`/api/inventory-entry/boxes/${boxUnico}`)
            .then(r => r.json())
            .then(d => {
                if (!d) return;
                const f: any = {};
                for (const [k, v] of Object.entries(d)) f[k.toLowerCase()] = v;
                const packs_units = int(f.up_x_pack ?? f.units_x_bunch ?? f.packs_units ?? 0);
                const packs_box   = int(f.bunches_x_case ?? f.packs_box ?? 0);
                const box_factor  = parseFloat(f.box_factor ?? 1) || 1;
                setForm({
                    case_uq:    t(f.case_uq),
                    box_qty:    int(f.box_qty ?? f.qtyin ?? 0),
                    packs_box,
                    packs_units,
                    stem_pack:  Boolean(f.stem_pack) || packs_units > 0,
                });
                setFullCaseBunches(packs_box / box_factor);
                setInfo({
                    lote:        t(f.lote ?? ""),
                    case_sh:     t(f.case_sh ?? f.case_uq ?? ""),
                    description: t(f.description ?? f.product_desc ?? f.product ?? ""),
                });
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [open, boxUnico]);

    if (!open) return null;

    const setF = (key: string, val: any) => setForm(p => ({ ...p, [key]: val }));

    // Changing the case re-derives bunches/case from the case's conversion factor — same as VFP's
    // cmbcases.Valid: thisform.packs_case.Value = ROUND(lnramoscajafull * vr_cases.factor, 0)
    const handleCaseChange = (caseUq: string) => {
        const newCase = cases.find((c: any) => t(c.UNICO) === caseUq);
        const factor  = newCase ? parseFloat(newCase.FACTOR ?? newCase.factor ?? 1) || 1 : 1;
        setForm(p => ({ ...p, case_uq: caseUq, packs_box: Math.round(fullCaseBunches * factor) }));
    };

    // VFP calc: if stem_pack => units_x_box = packs_box * packs_units; else units_x_box = packs_box
    const units_x_box  = form.stem_pack ? form.packs_box * form.packs_units : form.packs_box;
    const total_units  = units_x_box * form.box_qty;

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/inventory-entry/boxes/${boxUnico}/wh-control`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    case_uq:    form.case_uq,
                    box_qty:    form.box_qty,
                    packs_box:  form.packs_box,
                    packs_units: form.packs_units,
                    user_uq:    userId,
                }),
            });
            const d = await res.json();
            if (!d.success) throw new Error(d.error || "Update failed");
            toast.success("Lot info updated.");
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
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 rounded-t-lg shrink-0">
                    <div className="flex items-center gap-2">
                        <Package size={16} className="text-[#FB7506]" />
                        <span className="font-black text-[10px] text-white uppercase tracking-widest">Update Lot Info</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={16} /></button>
                </div>
                <div className="p-4 space-y-3">
                    {loading && <div className="flex items-center gap-2 text-gray-400 text-xs"><RefreshCcw size={12} className="animate-spin" /> Loading...</div>}
                    {/* Read-only info */}
                    <div className="bg-gray-50 rounded p-2 text-xs text-gray-600 border border-gray-100 space-y-0.5">
                        {info.lote && <div>Lote: <span className="font-bold text-gray-800">{info.lote}</span></div>}
                        {info.case_sh && <div>Case: <span className="font-bold text-gray-800">{info.case_sh}</span></div>}
                        {info.description && <div>Description: <span className="font-bold text-gray-800">{info.description}</span></div>}
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <label className={fLabel}>Case</label>
                        <select value={form.case_uq} onChange={e => handleCaseChange(e.target.value)} className={fInput}>
                            <option value="">-- Case --</option>
                            {cases.map((c: any) => (
                                <option key={t(c.UNICO)} value={t(c.UNICO)}>{t(c.CASE ?? c.DESCRIPTION ?? c.UNICO)}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-0.5">
                            <label className={fLabel}>Box Qty (Qtyin)</label>
                            <input type="number" value={form.box_qty} onChange={e => setF("box_qty", int(e.target.value))} className={fInput + " text-right"} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <label className={fLabel}>Bunches / Case</label>
                            <input type="number" value={form.packs_box} onChange={e => setF("packs_box", int(e.target.value))} className={fInput + " text-right"} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <label className={fLabel}>Stems / Bunch</label>
                            <input type="number" value={form.packs_units} onChange={e => setF("packs_units", int(e.target.value))} className={fInput + " text-right"} />
                        </div>
                        <div className="flex flex-col gap-0.5 justify-end">
                            <label className="flex items-center gap-2 cursor-pointer h-7">
                                <input type="checkbox" checked={form.stem_pack} onChange={e => setF("stem_pack", e.target.checked)} className="w-4 h-4 accent-[#FB7506]" />
                                <span className="text-xs font-semibold text-gray-700">Stem Pack</span>
                            </label>
                        </div>
                    </div>
                    {/* Calculated totals */}
                    <div className="bg-blue-50 rounded p-2 text-xs text-blue-800 border border-blue-100 grid grid-cols-2 gap-1">
                        <div>Units/Box: <span className="font-bold">{units_x_box.toLocaleString()}</span></div>
                        <div>Total Units: <span className="font-bold">{total_units.toLocaleString()}</span></div>
                    </div>
                </div>
                <div className="flex justify-end gap-2 px-4 py-3 bg-gray-50 border-t shrink-0">
                    <button onClick={onClose} className="px-4 py-2 rounded border border-gray-200 text-xs font-black uppercase text-gray-600 hover:bg-gray-100 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving}
                        className="flex items-center gap-2 px-5 py-2 rounded bg-[#FB7506] hover:bg-orange-600 disabled:opacity-40 text-white text-xs font-black uppercase tracking-wider transition-all">
                        {saving ? <RefreshCcw size={12} className="animate-spin" /> : <Check size={12} />}
                        {saving ? "Saving..." : "Save Lot Info"}
                    </button>
                </div>
            </div>
        </div>
    );
}
