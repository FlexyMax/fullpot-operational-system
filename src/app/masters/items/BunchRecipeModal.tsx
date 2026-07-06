"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Save, RefreshCcw, XCircle, BookOpen, Check, ChevronDown, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import PanelGrid from "@/components/ui/PanelGrid";
import { AuditLogModal } from "@/components/AuditLogModal";
import { PanelGridTable, PanelGridThead, PanelGridTh, PanelGridTbody, PanelGridTr, PanelGridTd } from "@/components/ui/PanelGridTable";

// ─── local combobox ────────────────────────────────────────────────────────────
interface CbOption { key: string; label: string; sublabel?: string; }

function Combobox({ options, value, inputValue, onInputChange, onSelect, onClear, placeholder, loading = false, label, required = false }: {
    options:       CbOption[];
    value:         string;
    inputValue:    string;
    onInputChange: (v: string) => void;
    onSelect:      (key: string, label: string) => void;
    onClear:       () => void;
    placeholder?:  string;
    loading?:      boolean;
    label:         string;
    required?:     boolean;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    const filtered = inputValue.trim()
        ? options.filter(o => {
            const words = inputValue.trim().toLowerCase().split(/\s+/);
            const hay   = `${o.label} ${o.sublabel ?? ""}`.toLowerCase();
            return words.every(w => hay.includes(w));
          })
        : options;

    return (
        <div className="flex flex-col gap-0.5" ref={ref}>
            <label className="text-[9px] font-black text-gray-400 uppercase">
                {label}{required ? " *" : ""}
                {loading && <RefreshCcw size={8} className="inline ml-1 animate-spin text-gray-300" />}
            </label>
            <div className="relative">
                <div className={cn("fos-input flex items-center gap-1 py-1 text-xs cursor-text", open && "border-[#FB7506]/60", value && "border-green-400")}>
                    {value && (
                        <button type="button" onMouseDown={e => { e.preventDefault(); onClear(); setOpen(false); }}
                            className="shrink-0 text-gray-300 hover:text-red-400 transition-colors">
                            <X size={9} />
                        </button>
                    )}
                    <input
                        readOnly={!!value}
                        value={value ? inputValue : inputValue}
                        placeholder={value ? "" : (placeholder ?? "Select…")}
                        onChange={e => { onInputChange(e.target.value); if (!open) setOpen(true); }}
                        className={cn("flex-1 min-w-0 bg-transparent outline-none", value ? "text-gray-800 font-medium cursor-default" : "text-gray-700")}
                    />
                    {value && <Check size={9} className="shrink-0 text-green-500" />}
                    <button type="button" onMouseDown={e => { e.preventDefault(); setOpen(o => !o); }}
                        className="shrink-0 text-gray-400 hover:text-[#FB7506] transition-colors pl-0.5">
                        <ChevronDown size={11} className={cn("transition-transform", open && "rotate-180")} />
                    </button>
                </div>

                {open && (
                    <div className="absolute z-30 top-full left-0 right-0 mt-0.5 border border-gray-200 rounded-lg bg-white shadow-2xl overflow-hidden" style={{ maxHeight: "200px" }}>
                        {!value && (
                            <div className="border-b border-gray-100 px-2 py-1.5">
                                <input autoFocus
                                    value={inputValue} placeholder="Type to filter…"
                                    onChange={e => onInputChange(e.target.value)}
                                    className="w-full text-[11px] outline-none bg-transparent placeholder:text-gray-300"
                                />
                            </div>
                        )}
                        <div className="overflow-y-auto" style={{ maxHeight: value ? "200px" : "160px" }}>
                            {!required && (
                                <div onMouseDown={() => { onClear(); setOpen(false); }}
                                    className="px-3 py-1.5 text-[10px] text-gray-400 italic cursor-pointer hover:bg-gray-50 border-b border-gray-50">
                                    — {placeholder ?? "None"} —
                                </div>
                            )}
                            {filtered.slice(0, 200).map(o => (
                                <div key={o.key} onMouseDown={() => { onSelect(o.key, o.label); setOpen(false); }}
                                    className={cn("px-3 py-2 cursor-pointer hover:bg-[#FB7506]/10 border-b border-gray-50 last:border-0", value === o.key && "bg-[#FB7506]/5")}>
                                    <div className={cn("text-[11px] leading-tight", value === o.key ? "font-semibold text-[#FB7506]" : "text-gray-800")}>{o.label}</div>
                                    {o.sublabel && <div className="text-[9px] text-gray-400 leading-tight mt-0.5">{o.sublabel}</div>}
                                </div>
                            ))}
                            {filtered.length === 0 && (
                                <div className="px-3 py-3 text-[10px] text-gray-400 italic text-center">No matches</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── modal ─────────────────────────────────────────────────────────────────────
const EMPTY_ARR: any[] = [];
const t  = (v: any) => String(v ?? "").trim();
const sF = async (url: string) => { const r = await fetch(url); const j = await r.json(); if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`); return j; };

const EMPTY_FORM = {
    variety_uq: "", var_text: "",
    grade_uq:   "", grade_text:  "",
    color_uq:   "", color_text:  "",
    grower_uq:  "", grower_text: "",
    unit: "", unit_text: "",
    qty: 1, notes: "",
};

interface Props { product: any; onClose: () => void; }

export default function BunchRecipeModal({ product, onClose }: Props) {
    const [selRow,   setSelRow]   = useState<any>(null);
    const [formMode, setFormMode] = useState<"add" | "edit" | null>(null);
    const [form,     setForm]     = useState<any>({ ...EMPTY_FORM });
    const [saving,   setSaving]   = useState(false);
    const [err,      setErr]      = useState<string | null>(null);

    const S = (patch: Partial<typeof EMPTY_FORM>) => setForm((p: any) => ({ ...p, ...patch }));

    const { data: rows = EMPTY_ARR, isFetching: loadRows, refetch: refetchRows } =
        useQuery({ queryKey: ["bunch-recipe", product.unico], queryFn: () => sF(`/api/masters/items/products/${product.unico}/bunch-recipe`), staleTime: 0 });

    const { data: grades  = EMPTY_ARR } = useQuery({ queryKey: ["items-grades"],  queryFn: () => sF("/api/masters/items/grades"),             staleTime: 600000 });
    const { data: colors  = EMPTY_ARR } = useQuery({ queryKey: ["items-colors"],  queryFn: () => sF("/api/masters/items/colors"),             staleTime: 600000 });
    const { data: growers = EMPTY_ARR } = useQuery({ queryKey: ["items-growers"], queryFn: () => sF("/api/masters/items/lookups/growers"),     staleTime: 600000 });
    const { data: lookups }             = useQuery({ queryKey: ["items-look"],     queryFn: () => sF("/api/masters/items/lookups"),            staleTime: 600000 });
    const units: any[] = (lookups as any)?.units ?? EMPTY_ARR;

    const { data: allVarieties = EMPTY_ARR, isFetching: loadVar } = useQuery({
        queryKey: ["var-recipes-all"],
        queryFn:  () => sF("/api/masters/items/lookups/varieties-for-recipes?search=%25"),
        staleTime: 300000,
    });

    // Combobox option lists
    const varOptions: CbOption[]    = (allVarieties as any[]).map(v => ({
        key: v.unico, label: t(v.variety) + (t(v.color) ? ` · ${t(v.color)}` : ""), sublabel: `${t(v.subclase)} · ${t(v.clase)}`,
    }));
    const gradeOptions: CbOption[]  = (grades as any[]).map(g => ({ key: g.unico, label: t(g.grado) }));
    const colorOptions: CbOption[]  = (colors as any[]).map(c => ({ key: c.unico, label: t(c.color) }));
    const unitOptions: CbOption[]   = (units  as any[]).map(u => ({ key: t(u.unit), label: t(u.unit) }));
    const growerOptions: CbOption[] = (growers as any[]).map(g => ({ key: g.unico, label: t(g.grower) }));

    const openAdd = () => { setForm({ ...EMPTY_FORM }); setErr(null); setFormMode("add"); };

    const openEdit = async () => {
        if (!selRow) return;
        setErr(null);
        try {
            const full = await sF(`/api/masters/items/products/bunch-recipe/${selRow.unico}`);
            const varMatch = (allVarieties as any[]).find((v: any) => v.unico === t(full?.variety_uq));
            const gradeMatch = (grades as any[]).find((g: any) => g.unico === t(full?.grade_uq));
            const colorMatch = (colors as any[]).find((c: any) => c.unico === t(full?.color_uq));
            setForm({
                variety_uq: t(full?.variety_uq),
                var_text:   varMatch ? `${t(varMatch.variety)}${t(varMatch.color) ? ` · ${t(varMatch.color)}` : ""}` : t(selRow.variety),
                grade_uq:   t(full?.grade_uq),
                grade_text: gradeMatch ? t(gradeMatch.grado) : t(selRow.grade),
                color_uq:   t(full?.color_uq),
                color_text: colorMatch ? t(colorMatch.color) : t(selRow.color),
                grower_uq: "", grower_text: "",
                unit: t(full?.unit ?? selRow.unit), unit_text: t(full?.unit ?? selRow.unit),
                qty:   full?.variety_qty ?? selRow.variety_qty ?? 1,
                notes: t(full?.notes),
            });
            setFormMode("edit");
        } catch (e: any) { toast.error(e.message); }
    };

    const cancel = () => { setFormMode(null); setErr(null); };

    const save = async () => {
        if (!form.variety_uq) { setErr("Select a variety."); return; }
        if (!form.grade_uq)   { setErr("Select a grade."); return; }
        if (!form.color_uq)   { setErr("Select a color."); return; }
        if (!form.unit)        { setErr("Select a unit."); return; }
        if (!form.qty || form.qty <= 0) { setErr("Qty must be greater than 0."); return; }
        setSaving(true); setErr(null);
        try {
            if (formMode === "add") {
                const r = await fetch(`/api/masters/items/products/${product.unico}/bunch-recipe`, {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ variety_uq: form.variety_uq, qty: form.qty, grade_uq: form.grade_uq || null, color_uq: form.color_uq || null, notes: form.notes, unit: form.unit }),
                });
                const d = await r.json();
                if (!d.success) throw new Error(d.error);
                toast.success("Row added.");
            } else {
                const r = await fetch(`/api/masters/items/products/bunch-recipe/${selRow.unico}`, {
                    method: "PUT", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ product_uq: product.unico, variety_uq: form.variety_uq, qty: form.qty, grade_uq: form.grade_uq || null, color_uq: form.color_uq || null, notes: form.notes, unit: form.unit }),
                });
                const d = await r.json();
                if (!d.success) throw new Error(d.error);
                toast.success("Row updated.");
            }
            setFormMode(null); setSelRow(null); refetchRows();
        } catch (e: any) { setErr(e.message); toast.error(e.message); }
        finally { setSaving(false); }
    };

    const deleteRow = async () => {
        if (!selRow) return;
        setSaving(true); setErr(null);
        try {
            const r = await fetch(`/api/masters/items/products/bunch-recipe/${selRow.unico}`, { method: "DELETE" });
            const d = await r.json();
            if (!d.success) throw new Error(d.error);
            toast.success("Row deleted."); setSelRow(null); setFormMode(null); refetchRows();
        } catch (e: any) { setErr(e.message); toast.error(e.message); }
        finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full sm:max-w-3xl flex flex-col" style={{ maxHeight: "92vh" }}>

                {/* Header */}
                <div className="h-10 bg-[#374151] rounded-t-xl flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-2 min-w-0">
                        <BookOpen size={14} className="text-[#FB7506] shrink-0" />
                        <span className="font-black text-[10px] uppercase tracking-widest text-white truncate">
                            Bunch Recipe — {t(product.description)}
                        </span>
                        {err && <span className="text-amber-400 text-[9px] font-bold ml-2 shrink-0">{err}</span>}
                    </div>
                    <button onClick={onClose} className="shrink-0"><XCircle size={15} className="text-gray-400 hover:text-white" /></button>
                </div>

                {/* Product info bar */}
                <div className="bg-gray-50 border-b border-[#DBD9D9] px-3 py-2 shrink-0 grid grid-cols-3 sm:grid-cols-6 gap-2 text-[10px]">
                    {[
                        { l: "Bunches/Case", v: product.up_x_case },
                        { l: "Units/Bunch",  v: product.up_x_pack },
                        { l: "Units/Case",   v: product.total_units },
                        { l: "Price/Stem",   v: product.stem_pack ? "✓" : "—" },
                        { l: "Box Code",     v: product.boxcode },
                        { l: "EDI Code",     v: product.old_code },
                    ].map(x => (
                        <div key={x.l}>
                            <div className="text-[9px] font-black text-gray-400 uppercase">{x.l}</div>
                            <div className="font-bold text-gray-700">{t(x.v) || "—"}</div>
                        </div>
                    ))}
                </div>

                {/* Grid */}
                <PanelGrid
                    icon={BookOpen}
                    title="Composition Detail"
                    recordCount={rows.length}
                    onRefresh={refetchRows}
                    refreshing={loadRows}
                    headerRight={<AuditLogModal recordId={selRow?.unico} disabled={!selRow} />}
                    menuItems={[
                        { label: "Add",    icon: Plus,   color: "green", onClick: openAdd },
                        { label: "Modify", icon: Pencil, color: "blue",  onClick: openEdit,  disabled: !selRow },
                        { label: "Delete", icon: Trash2, color: "red",   onClick: deleteRow, disabled: !selRow },
                    ]}
                    className="flex-1 min-h-0 rounded-none border-x-0"
                >
                    <PanelGridTable>
                        <PanelGridThead>
                            <PanelGridTh>Variety — Subclass — Class</PanelGridTh>
                            <PanelGridTh>Color</PanelGridTh>
                            <PanelGridTh>Grade</PanelGridTh>
                            <PanelGridTh className="w-20" align="right">Qty/Bunch</PanelGridTh>
                            <PanelGridTh className="w-20">Unit</PanelGridTh>
                            <PanelGridTh className="w-12 text-center">Flower</PanelGridTh>
                        </PanelGridThead>
                        <PanelGridTbody>
                            {rows.map((r: any) => (
                                <PanelGridTr key={r.unico} selected={selRow?.unico === r.unico}
                                    onClick={() => setSelRow(selRow?.unico === r.unico ? null : r)}>
                                    <PanelGridTd className="font-medium">{t(r.variety)}</PanelGridTd>
                                    <PanelGridTd className="text-gray-500 text-[10px]">{t(r.color)}</PanelGridTd>
                                    <PanelGridTd className="text-gray-500 text-[10px]">{t(r.grade)}</PanelGridTd>
                                    <PanelGridTd align="right">{r.variety_qty}</PanelGridTd>
                                    <PanelGridTd className="text-[10px]">{t(r.unit)}</PanelGridTd>
                                    <PanelGridTd className="text-center">{r.isflower ? <Check size={10} className="text-green-500 mx-auto" /> : "—"}</PanelGridTd>
                                </PanelGridTr>
                            ))}
                            {!loadRows && rows.length === 0 && (
                                <PanelGridTr onClick={() => {}}>
                                    <PanelGridTd colSpan={6} className="text-center text-gray-300 italic text-xs py-6">
                                        No composition — use Add to start
                                    </PanelGridTd>
                                </PanelGridTr>
                            )}
                        </PanelGridTbody>
                    </PanelGridTable>
                </PanelGrid>

                {/* Add / Edit form */}
                {formMode && (
                    <div className="border-t border-[#DBD9D9] px-3 sm:px-4 py-3 bg-gray-50 shrink-0 space-y-3">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                            {formMode === "add" ? "Add" : "Modify"} Variety
                        </p>

                        {/* Row 1: Variety (full width) */}
                        <Combobox
                            label="Variety — Subclass — Class"
                            required
                            loading={loadVar}
                            options={varOptions}
                            value={form.variety_uq}
                            inputValue={form.var_text}
                            placeholder="Search variety, subclass or class…"
                            onInputChange={v => S({ var_text: v, variety_uq: "", color_uq: "", color_text: "" })}
                            onSelect={(key, label) => {
                                const match = (allVarieties as any[]).find((v: any) => v.unico === key);
                                S({ variety_uq: key, var_text: label, color_uq: t(match?.color_uq), color_text: t(match?.color) });
                            }}
                            onClear={() => S({ variety_uq: "", var_text: "", color_uq: "", color_text: "" })}
                        />

                        {/* Row 2: Grade, Color, Qty, Unit */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <Combobox
                                label="Grade"
                                required
                                options={gradeOptions}
                                value={form.grade_uq}
                                inputValue={form.grade_text}
                                placeholder="Select grade…"
                                onInputChange={v => S({ grade_text: v, grade_uq: "" })}
                                onSelect={(key, label) => S({ grade_uq: key, grade_text: label })}
                                onClear={() => S({ grade_uq: "", grade_text: "" })}
                            />
                            <Combobox
                                label="Color"
                                required
                                options={colorOptions}
                                value={form.color_uq}
                                inputValue={form.color_text}
                                placeholder="Select color…"
                                onInputChange={v => S({ color_text: v, color_uq: "" })}
                                onSelect={(key, label) => S({ color_uq: key, color_text: label })}
                                onClear={() => S({ color_uq: "", color_text: "" })}
                            />
                            <div className="flex flex-col gap-0.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase">Qty / Bunch *</label>
                                <input type="number" min="0.01" step="0.01" value={form.qty}
                                    onChange={e => S({ qty: parseFloat(e.target.value) || 0 })}
                                    className="fos-input text-xs py-1 text-right" />
                            </div>
                            <Combobox
                                label="Unit"
                                required
                                options={unitOptions}
                                value={form.unit}
                                inputValue={form.unit_text}
                                placeholder="Select unit…"
                                onInputChange={v => S({ unit_text: v, unit: "" })}
                                onSelect={(key, label) => S({ unit: key, unit_text: label })}
                                onClear={() => S({ unit: "", unit_text: "" })}
                            />
                        </div>

                        {/* Row 3: Vendor + Notes */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <Combobox
                                label={`Vendor / Grower`}
                                options={growerOptions}
                                value={form.grower_uq}
                                inputValue={form.grower_text}
                                placeholder="None (pending SP update)"
                                onInputChange={v => S({ grower_text: v, grower_uq: "" })}
                                onSelect={(key, label) => S({ grower_uq: key, grower_text: label })}
                                onClear={() => S({ grower_uq: "", grower_text: "" })}
                            />
                            <div className="flex flex-col gap-0.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase">Instructions / Notes</label>
                                <textarea value={form.notes} rows={3} onChange={e => S({ notes: e.target.value })}
                                    className="fos-input text-xs py-1 resize-none" />
                            </div>
                        </div>

                    </div>
                )}

                {/* Footer */}
                <div className="flex justify-end gap-2 px-4 py-2 border-t border-[#DBD9D9] bg-gray-50 rounded-b-xl shrink-0">
                    {formMode ? (
                        <>
                            <button onClick={cancel}
                                className="px-3 py-1.5 rounded border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100">
                                Cancel
                            </button>
                            <button onClick={save} disabled={saving}
                                className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-[#FB7506] hover:bg-orange-600 text-white text-xs font-black disabled:opacity-50">
                                {saving ? <RefreshCcw size={11} className="animate-spin" /> : <Save size={11} />}
                                {saving ? "Saving..." : formMode === "add" ? "Add Row" : "Save Changes"}
                            </button>
                        </>
                    ) : (
                        <button onClick={onClose}
                            className="px-4 py-1.5 rounded border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100">
                            Close
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
