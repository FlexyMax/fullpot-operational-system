"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Save, RefreshCcw, XCircle, BookOpen, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import PanelGrid from "@/components/ui/PanelGrid";
import { AuditLogModal } from "@/components/AuditLogModal";
import { PanelGridTable, PanelGridThead, PanelGridTh, PanelGridTbody, PanelGridTr, PanelGridTd } from "@/components/ui/PanelGridTable";

const EMPTY_ARR: any[] = [];
const t  = (v: any) => String(v ?? "").trim();
const sF = async (url: string) => { const r = await fetch(url); const j = await r.json(); if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`); return j; };

const EMPTY_FORM = { variety_uq: "", grade_uq: "", color_uq: "", qty: 1, unit: "", notes: "" };

interface Props {
    product: any;
    onClose: () => void;
}

export default function BunchRecipeModal({ product, onClose }: Props) {
    const qc = useQueryClient();
    const [selRow,    setSelRow]    = useState<any>(null);
    const [formMode,  setFormMode]  = useState<"add" | null>(null);
    const [form,      setForm]      = useState<any>({ ...EMPTY_FORM });
    const [saving,    setSaving]    = useState(false);
    const [err,       setErr]       = useState<string | null>(null);
    const [varSearch, setVarSearch] = useState("");
    const [debVar,    setDebVar]    = useState("");

    useEffect(() => { const t = setTimeout(() => setDebVar(varSearch), 300); return () => clearTimeout(t); }, [varSearch]);

    const { data: rows = EMPTY_ARR, isFetching: loadRows, refetch: refetchRows } =
        useQuery({ queryKey: ["bunch-recipe", product.unico], queryFn: () => sF(`/api/masters/items/products/${product.unico}/bunch-recipe`), staleTime: 0 });

    const { data: grades  = EMPTY_ARR } = useQuery({ queryKey: ["items-grades"],  queryFn: () => sF("/api/masters/items/grades"),          staleTime: 600000 });
    const { data: colors  = EMPTY_ARR } = useQuery({ queryKey: ["items-colors"],  queryFn: () => sF("/api/masters/items/colors"),          staleTime: 600000 });
    const { data: lookups }             = useQuery({ queryKey: ["items-look"],     queryFn: () => sF("/api/masters/items/lookups"),         staleTime: 600000 });
    const units: any[] = (lookups as any)?.units ?? EMPTY_ARR;

    const { data: varieties = EMPTY_ARR, isFetching: loadVar } = useQuery({
        queryKey: ["var-recipes", debVar],
        queryFn:  () => sF(`/api/masters/items/lookups/varieties-for-recipes?search=${encodeURIComponent(debVar || "%")}`),
        staleTime: 30000,
    });

    const S = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

    const openAdd = () => { setForm({ ...EMPTY_FORM }); setVarSearch(""); setErr(null); setFormMode("add"); };
    const cancel  = () => { setFormMode(null); setErr(null); };

    const save = async () => {
        if (!form.variety_uq) { setErr("Select a variety."); return; }
        setSaving(true); setErr(null);
        try {
            const r = await fetch(`/api/masters/items/products/${product.unico}/bunch-recipe`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const d = await r.json();
            if (!d.success) throw new Error(d.error);
            toast.success("Row added.");
            setFormMode(null); refetchRows();
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
            toast.success("Row deleted."); setSelRow(null); refetchRows();
        } catch (e: any) { setErr(e.message); toast.error(e.message); }
        finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col" style={{ maxHeight: "88vh" }}>
                {/* Header */}
                <div className="h-10 bg-[#374151] rounded-t-xl flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-2">
                        <BookOpen size={14} className="text-[#FB7506]" />
                        <span className="font-black text-[10px] uppercase tracking-widest text-white">Bunch Recipe — {t(product.description)}</span>
                        {err && <span className="text-amber-400 text-[9px] font-bold ml-2 truncate max-w-[200px]">{err}</span>}
                    </div>
                    <button onClick={onClose}><XCircle size={15} className="text-gray-400 hover:text-white" /></button>
                </div>

                {/* Product info bar */}
                <div className="bg-gray-50 border-b border-[#DBD9D9] px-4 py-2 shrink-0 grid grid-cols-6 gap-3 text-[10px]">
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
                        { label: "Delete", icon: Trash2, color: "red",   onClick: deleteRow, disabled: !selRow },
                    ]}
                    className="flex-1 min-h-0 rounded-none border-x-0"
                >
                    <PanelGridTable>
                        <PanelGridThead>
                            <PanelGridTh>Variety / Component</PanelGridTh>
                            <PanelGridTh>Color</PanelGridTh>
                            <PanelGridTh>Grade</PanelGridTh>
                            <PanelGridTh className="w-20" align="right">Qty/Bunch</PanelGridTh>
                            <PanelGridTh className="w-24">Unit</PanelGridTh>
                            <PanelGridTh>Flower</PanelGridTh>
                        </PanelGridThead>
                        <PanelGridTbody>
                            {rows.map((r: any) => (
                                <PanelGridTr key={r.unico} selected={selRow?.unico === r.unico}
                                    onClick={() => setSelRow(selRow?.unico === r.unico ? null : r)}>
                                    <PanelGridTd className="font-medium">{t(r.variety)}</PanelGridTd>
                                    <PanelGridTd className="text-gray-500">{t(r.color)}</PanelGridTd>
                                    <PanelGridTd className="text-gray-500">{t(r.grade)}</PanelGridTd>
                                    <PanelGridTd align="right">{r.variety_qty}</PanelGridTd>
                                    <PanelGridTd>{t(r.unit)}</PanelGridTd>
                                    <PanelGridTd className="text-center">{r.isflower ? <Check size={10} className="text-green-500 mx-auto" /> : "—"}</PanelGridTd>
                                </PanelGridTr>
                            ))}
                            {!loadRows && rows.length === 0 && (
                                <PanelGridTr onClick={() => {}}><PanelGridTd colSpan={6} className="text-center text-gray-300 italic text-xs py-4">No composition rows — click Add to start</PanelGridTd></PanelGridTr>
                            )}
                        </PanelGridTbody>
                    </PanelGridTable>
                </PanelGrid>

                {/* Add form */}
                {formMode === "add" && (
                    <div className="border-t border-[#DBD9D9] px-4 py-3 bg-gray-50 shrink-0 space-y-2">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Add Variety</p>

                        {/* Variety search */}
                        <div className="flex flex-col gap-0.5">
                            <label className="text-[9px] font-black text-gray-400 uppercase">Variety *</label>
                            <div className="flex gap-1.5 items-center">
                                <input
                                    placeholder="Type to search varieties..."
                                    value={varSearch}
                                    onChange={e => { setVarSearch(e.target.value); S("variety_uq", ""); }}
                                    className="fos-input text-xs py-1 flex-1"
                                />
                                {loadVar && <RefreshCcw size={10} className="animate-spin text-gray-400 shrink-0" />}
                            </div>
                            {varSearch && varieties.length > 0 && !form.variety_uq && (
                                <div className="border border-gray-200 rounded bg-white shadow-lg max-h-36 overflow-y-auto text-xs z-10">
                                    {(varieties as any[]).map((v: any) => (
                                        <div key={v.unico}
                                            onClick={() => { S("variety_uq", v.unico); S("color_uq", v.color_uq || ""); setVarSearch(t(v.dato || `${v.variety} – ${v.subclase} – ${v.clase}`)); }}
                                            className="px-3 py-1.5 cursor-pointer hover:bg-[#FB7506]/10 border-b border-gray-50 last:border-0">
                                            <span className="font-semibold">{t(v.variety)}</span>
                                            <span className="text-gray-400 ml-1.5">{t(v.subclase)} · {t(v.clase)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-5 gap-2">
                            <div className="flex flex-col gap-0.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase">Grade</label>
                                <select value={form.grade_uq} onChange={e => S("grade_uq", e.target.value)} className="fos-input text-xs py-1">
                                    <option value="">— Any —</option>
                                    {(grades as any[]).map((g: any) => <option key={g.unico} value={g.unico}>{t(g.grado)}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase">Color</label>
                                <select value={form.color_uq} onChange={e => S("color_uq", e.target.value)} className="fos-input text-xs py-1">
                                    <option value="">— Any —</option>
                                    {(colors as any[]).map((c: any) => <option key={c.unico} value={c.unico}>{t(c.color)}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase">Qty / Bunch *</label>
                                <input type="number" min="0" step="0.01" value={form.qty}
                                    onChange={e => S("qty", parseFloat(e.target.value) || 0)}
                                    className="fos-input text-xs py-1 text-right" />
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase">Unit</label>
                                <select value={form.unit} onChange={e => S("unit", e.target.value)} className="fos-input text-xs py-1">
                                    <option value="">— None —</option>
                                    {(units as any[]).map((u: any) => <option key={u.unico} value={t(u.unit)}>{t(u.unit)}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase">Notes</label>
                                <input value={form.notes} onChange={e => S("notes", e.target.value)} className="fos-input text-xs py-1" />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                            <button onClick={cancel} className="px-3 py-1.5 rounded border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
                            <button onClick={save} disabled={saving || !form.variety_uq}
                                className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-[#FB7506] hover:bg-orange-600 text-white text-xs font-black disabled:opacity-50">
                                {saving ? <RefreshCcw size={11} className="animate-spin" /> : <Save size={11} />}
                                {saving ? "Saving..." : "Add Row"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="flex justify-end px-4 py-2 border-t border-[#DBD9D9] bg-gray-50 rounded-b-xl shrink-0">
                    <button onClick={onClose} className="px-4 py-1.5 rounded border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100">Close</button>
                </div>
            </div>
        </div>
    );
}
