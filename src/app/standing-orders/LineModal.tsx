"use client";

import { useState, useRef, useEffect } from "react";
import { X, Loader2, Check, Search } from "lucide-react";
import { toast } from "sonner";

const t = (v: any) => String(v ?? "").trim();

interface Props {
    mode:     "new" | "edit";
    soUnico:  string;
    line?:    any;
    cases:    any[];
    onClose:  () => void;
    onSaved:  () => void;
}

function LabelInput({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5">{label}</label>
            {children}
        </div>
    );
}

const inp = "w-full border border-gray-300 rounded px-2 py-1.5 text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-400";

export function LineModal({ mode, soUnico, line, cases, onClose, onSaved }: Props) {
    const isEdit = mode === "edit";

    const [form, setForm] = useState({
        product_uq:       isEdit ? t(line?.BOX_PACK_UQ ?? "") : "",
        product_name:     isEdit ? t(line?.DESCRIPTION ?? "") : "",
        case_uq:          isEdit ? t(line?.CASE_UQ ?? "") : "",
        cporder_no:       isEdit ? t(line?.CPORDER_NO ?? "") : "",
        qty_sorder:       isEdit ? String(line?.QTY_SORDER ?? 1) : "1",
        packs_box:        isEdit ? String(line?.BUNCHES_CASE ?? 1) : "1",
        units_pack:       isEdit ? String(line?.UNITS_BUNCH ?? 1) : "1",
        so_price:         isEdit ? String(line?.SO_PRICE ?? 0) : "0",
        details:          isEdit ? t(line?.DETAILS ?? "") : "",
        pccode:           isEdit ? t(line?.PCCODE ?? "") : "",
        upc:              isEdit ? t(line?.UPC ?? "") : "",
        food:             isEdit ? (line?.FOOD === true || line?.FOOD === 1) : false,
        stem_pack:        isEdit ? (line?.STEM_PACK === true || line?.STEM_PACK === 1) : false,
        active:           isEdit ? (line?.ACTIVE !== false && line?.ACTIVE !== 0) : true,
        food_uq:          "",
        upc_text:         "",
        retail_price:     "0",
        boxcode2:         "",
        color_breakdown:  "",
        upc_notes:        "",
        additional_notes: "",
    });

    const [productSearch,  setProductSearch]  = useState(isEdit ? t(line?.DESCRIPTION ?? "") : "");
    const [productResults, setProductResults] = useState<any[]>([]);
    const [searchLoading,  setSearchLoading]  = useState(false);
    const [showDrop,       setShowDrop]       = useState(false);
    const [saving,         setSaving]         = useState(false);
    const dropRef    = useRef<HTMLDivElement>(null);
    const timerRef   = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const f = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
        setForm(p => ({ ...p, [k]: v }));

    useEffect(() => {
        const h = (e: MouseEvent) => { if (dropRef.current && !dropRef.current.contains(e.target as Node)) setShowDrop(false); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    const handleProductSearch = (val: string) => {
        setProductSearch(val);
        setShowDrop(true);
        clearTimeout(timerRef.current);
        if (val.length < 2) { setProductResults([]); return; }
        timerRef.current = setTimeout(async () => {
            setSearchLoading(true);
            try {
                const r = await fetch(`/api/standing-orders/products?q=${encodeURIComponent(val)}`);
                const j = await r.json();
                setProductResults(Array.isArray(j) ? j : []);
            } catch {
                setProductResults([]);
            } finally {
                setSearchLoading(false);
            }
        }, 300);
    };

    const selectProduct = (p: any) => {
        const upxpack = Number(p.up_x_pack ?? p.UP_X_PACK ?? 1);
        const upxcase = Number(p.up_x_case ?? p.UP_X_CASE ?? 1);
        const packsBox = upxpack > 0 ? Math.round(upxcase / upxpack) : 1;
        setForm(prev => ({
            ...prev,
            product_uq:  t(p.unico ?? p.UNICO),
            product_name: t(p.description ?? p.DESCRIPTION),
            case_uq:     t(p.case_uq ?? p.CASE_UQ ?? ""),
            units_pack:  String(upxpack || 1),
            packs_box:   String(packsBox || 1),
            so_price:    String(p.sales_price ?? p.SALES_PRICE ?? 0),
            pccode:      t(p.boxcode ?? p.BOXCODE ?? ""),
            upc:         t(p.upc ?? p.UPC ?? ""),
            stem_pack:   p.stem_pack === true || p.stem_pack === 1 || p.STEM_PACK === true,
        }));
        setProductSearch(t(p.description ?? p.DESCRIPTION));
        setShowDrop(false);
    };

    const handleSave = async () => {
        if (!isEdit && !form.product_uq) { toast.error("Product is required"); return; }
        setSaving(true);
        try {
            const body = {
                sorder_uq:        soUnico,
                cporder_no:       form.cporder_no,
                product_uq:       form.product_uq,
                case_uq:          form.case_uq,
                qty_sorder:       parseInt(form.qty_sorder) || 1,
                packs_box:        parseInt(form.packs_box) || 1,
                units_pack:       parseInt(form.units_pack) || 1,
                so_price:         parseFloat(form.so_price) || 0,
                details:          form.details,
                pccode:           form.pccode,
                upc:              form.upc,
                food:             form.food,
                stem_pack:        form.stem_pack,
                active:           form.active,
                food_uq:          form.food_uq,
                upc_text:         form.upc_text,
                retail_price:     parseFloat(form.retail_price) || 0,
                boxcode2:         form.boxcode2,
                color_breakdown:  form.color_breakdown,
                upc_notes:        form.upc_notes,
                additional_notes: form.additional_notes,
            };

            const r = isEdit
                ? await fetch(`/api/standing-orders/line/${t(line?.UNICO)}`, {
                      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
                  })
                : await fetch("/api/standing-orders/line", {
                      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
                  });

            const j = await r.json();
            if (!r.ok || !j.success) throw new Error(j.error || "Failed");
            toast.success(isEdit ? "Line updated" : "Line added");
            onSaved();
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="h-10 bg-[#374151] flex items-center justify-between px-4 shrink-0 rounded-t-lg">
                    <span className="font-black text-[11px] text-white uppercase tracking-widest">
                        {isEdit ? "Edit Order Line" : "Add Order Line"}
                    </span>
                    <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
                        <X size={14} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 text-[11px]">

                    {/* Product search */}
                    <div ref={dropRef} className="relative">
                        <LabelInput label={isEdit ? "Product" : "Product *"}>
                            <div className="flex items-center gap-1 border border-gray-300 rounded px-2 py-1.5 focus-within:ring-2 focus-within:ring-blue-400">
                                <Search size={11} className="text-gray-400 shrink-0" />
                                <input
                                    value={productSearch}
                                    onChange={e => handleProductSearch(e.target.value)}
                                    placeholder="Type to search products..."
                                    disabled={isEdit}
                                    className="flex-1 text-[11px] focus:outline-none bg-transparent disabled:text-gray-500"
                                />
                                {searchLoading && <Loader2 size={10} className="animate-spin text-gray-400 shrink-0" />}
                            </div>
                        </LabelInput>
                        {form.product_uq && (
                            <span className="text-[9px] text-green-600 font-bold">✓ {form.product_uq}</span>
                        )}
                        {showDrop && productResults.length > 0 && (
                            <div className="absolute z-20 top-full left-0 right-0 bg-white border border-gray-200 rounded shadow-xl max-h-44 overflow-y-auto">
                                {productResults.map((p, i) => (
                                    <div key={i} onClick={() => selectProduct(p)}
                                        className="px-2 py-1 hover:bg-blue-50 cursor-pointer border-b border-gray-100 text-[10px] flex gap-2">
                                        <span className="font-bold">{t(p.description ?? p.DESCRIPTION)}</span>
                                        <span className="text-gray-400">{t(p.short ?? p.SHORT)} · {t(p.case_sh ?? p.CASE_SH)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Case + Qty + Packs/Box + Units/Pack */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div className="col-span-2">
                            <LabelInput label="Case">
                                <select value={form.case_uq} onChange={e => f("case_uq", e.target.value)} className={inp}>
                                    <option value="">— select —</option>
                                    {cases.map((c, i) => (
                                        <option key={i} value={t(c.unico ?? c.UNICO)}>
                                            {t(c.case_name ?? c.CASE_NAME)} ({t(c.case_sh ?? c.CASE_SH)})
                                        </option>
                                    ))}
                                </select>
                            </LabelInput>
                        </div>
                        <LabelInput label="Qty">
                            <input type="number" value={form.qty_sorder} onChange={e => f("qty_sorder", e.target.value)} className={inp} />
                        </LabelInput>
                        <LabelInput label="Bx/Case">
                            <input type="number" value={form.packs_box} onChange={e => f("packs_box", e.target.value)} className={inp} />
                        </LabelInput>
                    </div>

                    {/* Units/Pack + Price + PC Code + UPC */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <LabelInput label="Un/Bunch">
                            <input type="number" value={form.units_pack} onChange={e => f("units_pack", e.target.value)} className={inp} />
                        </LabelInput>
                        <LabelInput label="Price">
                            <input type="number" step="0.01" value={form.so_price} onChange={e => f("so_price", e.target.value)} className={inp} />
                        </LabelInput>
                        <LabelInput label="PC Code">
                            <input type="text" value={form.pccode} onChange={e => f("pccode", e.target.value)} className={inp} />
                        </LabelInput>
                        <LabelInput label="UPC">
                            <input type="text" value={form.upc} onChange={e => f("upc", e.target.value)} className={inp} />
                        </LabelInput>
                    </div>

                    {/* Details */}
                    <LabelInput label="Details">
                        <input type="text" value={form.details} onChange={e => f("details", e.target.value)} className={inp} />
                    </LabelInput>

                    {/* Checkboxes */}
                    <div className="flex items-center gap-5 flex-wrap">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={form.food} onChange={e => f("food", e.target.checked)}
                                className="w-3.5 h-3.5 rounded accent-[#FB7506]" />
                            <span className="text-[11px] font-bold text-gray-700">Food</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={form.stem_pack} onChange={e => f("stem_pack", e.target.checked)}
                                className="w-3.5 h-3.5 rounded accent-[#FB7506]" />
                            <span className="text-[11px] font-bold text-gray-700">Stem Pack</span>
                        </label>
                        {isEdit && (
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={form.active} onChange={e => f("active", e.target.checked)}
                                    className="w-3.5 h-3.5 rounded accent-[#FB7506]" />
                                <span className="text-[11px] font-bold text-gray-700">Active</span>
                            </label>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="h-11 bg-gray-50 border-t border-gray-200 flex items-center justify-end px-4 gap-2 shrink-0 rounded-b-lg">
                    <button onClick={onClose}
                        className="px-3 py-1.5 text-[11px] font-bold text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving}
                        className="px-4 py-1.5 text-[11px] font-black text-white bg-[#FB7506] hover:bg-orange-500 rounded disabled:opacity-40 flex items-center gap-1 transition-colors">
                        {saving ? <Loader2 size={10} className="animate-spin" /> : <Check size={10} />}
                        {isEdit ? "Save Changes" : "Add Line"}
                    </button>
                </div>
            </div>
        </div>
    );
}
