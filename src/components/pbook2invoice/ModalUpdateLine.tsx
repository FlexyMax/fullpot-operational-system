"use client";
import { useState, useEffect } from "react";
import { X, RefreshCw, RefreshCcw, Check, StickyNote } from "lucide-react";
import { toast } from "sonner";

const t = (v: any) => String(v ?? "").trim();
const num = (v: any) => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };
const int = (v: any) => { const n = parseInt(v, 10); return isNaN(n) ? 0 : n; };

interface Props {
    open: boolean;
    onClose: () => void;
    unico: string;
    initialTab?: "details" | "notes";
    onSuccess: () => void;
}

const FIELD_KEYS = [
    "product_uq", "case_uq", "qty_order", "packs_x_case", "up_x_pack", "units_x_box",
    "so_price", "pccode", "upc", "food", "cut_point", "details", "not_found",
    "retail_price", "upc_text", "food_uq", "boxcode2", "color_breakdown",
    "upc_notes", "additional_notes", "shiplist_notes",
] as const;

export function ModalUpdateLine({ open, onClose, unico, initialTab = "details", onSuccess }: Props) {
    const [tab,      setTab]      = useState<"details" | "notes">(initialTab);
    const [loading,  setLoading]  = useState(false);
    const [saving,   setSaving]   = useState(false);
    const [error,    setError]    = useState<string | null>(null);
    const [header,   setHeader]   = useState<any>(null);
    const [form,     setForm]     = useState<Record<string, any>>({});

    useEffect(() => {
        if (!open || !unico) return;
        setTab(initialTab);
        setLoading(true);
        setError(null);
        fetch(`/api/pbook2invoice/lines/${unico}`)
            .then(r => r.json())
            .then(d => {
                if (!d) { setError("Line not found."); return; }
                setHeader(d);
                const f: Record<string, any> = {};
                for (const k of FIELD_KEYS) f[k] = d[k];
                setForm(f);
            })
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, unico]);

    if (!open) return null;

    const set = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }));

    const handleSave = async () => {
        setSaving(true); setError(null);
        try {
            const unitsXBox = int(form.packs_x_case) * int(form.up_x_pack);
            const res = await fetch(`/api/pbook2invoice/lines/${unico}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, units_x_box: unitsXBox }),
            });
            const d = await res.json();
            if (!d.success) throw new Error(d.error || "Save failed");
            toast.success("Prebook line updated.");
            onSuccess();
            onClose();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 rounded-t-lg shrink-0">
                    <div className="flex items-center gap-2">
                        <RefreshCw size={16} className="text-[#FB7506]" />
                        <span className="font-black text-[10px] text-white uppercase tracking-widest">Update Prebook Line</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={16} /></button>
                </div>

                {loading ? (
                    <div className="flex items-center gap-2 text-gray-400 text-xs p-6 justify-center"><RefreshCcw size={14} className="animate-spin" /> Loading...</div>
                ) : !header ? (
                    <div className="p-6 text-center text-sm text-red-500">{error || "Not found"}</div>
                ) : (
                    <>
                        {/* Header info — read-only context */}
                        <div className="grid grid-cols-3 gap-2 px-4 py-3 bg-gray-50 border-b text-[11px]">
                            <div><span className="text-gray-400">Pbook</span><div className="font-semibold text-gray-700">{t(header.pbook_no)}</div></div>
                            <div><span className="text-gray-400">Cust. PO</span><div className="font-semibold text-gray-700">{t(header.cporder_no) || "—"}</div></div>
                            <div><span className="text-gray-400">Delivery</span><div className="font-semibold text-gray-700">{t(header.pb_date)}</div></div>
                            <div className="col-span-3"><span className="text-gray-400">Customer</span><div className="font-semibold text-gray-700">{t(header.customer)}</div></div>
                            <div className="col-span-3"><span className="text-gray-400">Product</span><div className="font-semibold text-gray-700">{t(header.description)}</div></div>
                        </div>

                        {/* Tabs */}
                        <div className="flex items-center gap-1 px-3 pt-2 bg-gray-50 border-b">
                            <button onClick={() => setTab("details")}
                                className={`flex items-center gap-1.5 px-3 h-8 text-[11px] font-bold uppercase tracking-wide rounded-t transition-colors ${tab === "details" ? "bg-white text-[#FB7506] border border-b-0 border-[#DBD9D9]" : "text-gray-500 hover:text-[#FB7506]"}`}
                            >
                                <RefreshCw size={12} /> Details
                            </button>
                            <button onClick={() => setTab("notes")}
                                className={`flex items-center gap-1.5 px-3 h-8 text-[11px] font-bold uppercase tracking-wide rounded-t transition-colors ${tab === "notes" ? "bg-white text-[#FB7506] border border-b-0 border-[#DBD9D9]" : "text-gray-500 hover:text-[#FB7506]"}`}
                            >
                                <StickyNote size={12} /> Notes
                            </button>
                        </div>

                        <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
                            {header.void ? (
                                <p className="text-xs text-red-600 bg-red-50 rounded p-2">This line was voided — it can no longer be updated.</p>
                            ) : tab === "details" ? (
                                <div className="grid grid-cols-2 gap-3">
                                    <Field label="Case" value={t(header.case_sh)} readOnly />
                                    <Field label="Box Qty" value={form.qty_order} onChange={v => set("qty_order", int(v))} type="number" />
                                    <Field label="Bunches/Case" value={form.packs_x_case} onChange={v => set("packs_x_case", int(v))} type="number" />
                                    <Field label="Units/Bunch" value={form.up_x_pack} onChange={v => set("up_x_pack", int(v))} type="number" />
                                    <Field label="Price" value={form.so_price} onChange={v => set("so_price", num(v))} type="number" step="0.01" />
                                    <Field label="Retail Price" value={form.retail_price} onChange={v => set("retail_price", num(v))} type="number" step="0.01" />
                                    <Field label="Cust. Product Code / Box Id" value={form.pccode} onChange={v => set("pccode", v)} />
                                    <Field label="U.P.C." value={form.upc} onChange={v => set("upc", v)} />
                                    <Field label="UPC Text" value={form.upc_text} onChange={v => set("upc_text", v)} />
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <TextField label="Instructions / Remarks" value={form.details} onChange={v => set("details", v)} />
                                    <TextField label="Break Down Colors" value={form.color_breakdown} onChange={v => set("color_breakdown", v)} />
                                    <TextField label="UPC Notes" value={form.upc_notes} onChange={v => set("upc_notes", v)} />
                                    <TextField label="Additional Instructions" value={form.additional_notes} onChange={v => set("additional_notes", v)} />
                                    <TextField label="Ship List" value={form.shiplist_notes} onChange={v => set("shiplist_notes", v)} />
                                </div>
                            )}
                            {error && <p className="text-xs text-red-500 bg-red-50 rounded p-2">{error}</p>}
                        </div>
                    </>
                )}

                <div className="flex justify-end gap-2 px-4 py-3 bg-gray-50 border-t shrink-0">
                    <button onClick={onClose} className="px-4 py-2 rounded border border-gray-200 text-xs font-black uppercase text-gray-600 hover:bg-gray-100 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving || loading || !header || header.void}
                        className="flex items-center gap-2 px-5 py-2 rounded bg-[#FB7506] hover:bg-orange-600 disabled:opacity-40 text-white text-xs font-black uppercase tracking-wider transition-all">
                        {saving ? <RefreshCcw size={12} className="animate-spin" /> : <Check size={12} />}
                        {saving ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}

interface FieldProps {
    label: string;
    value: string | number | null | undefined;
    onChange?: (value: string) => void;
    readOnly?: boolean;
    type?: string;
    step?: string;
}

function Field({ label, value, onChange, readOnly, type = "text", step }: FieldProps) {
    return (
        <label className="block">
            <span className="text-[10px] font-bold text-gray-400 uppercase">{label}</span>
            <input
                type={type} step={step} value={value ?? ""} readOnly={readOnly}
                onChange={e => onChange?.(e.target.value)}
                className={`fos-input text-xs w-full mt-0.5 ${readOnly ? "bg-gray-100 text-gray-500" : ""}`}
            />
        </label>
    );
}

interface TextFieldProps {
    label: string;
    value: string | null | undefined;
    onChange: (value: string) => void;
}

function TextField({ label, value, onChange }: TextFieldProps) {
    return (
        <label className="block">
            <span className="text-[10px] font-bold text-gray-400 uppercase">{label}</span>
            <textarea
                value={value ?? ""} rows={2} maxLength={250}
                onChange={e => onChange(e.target.value.substring(0, 250))}
                className="fos-input text-xs w-full mt-0.5 resize-none"
            />
        </label>
    );
}
