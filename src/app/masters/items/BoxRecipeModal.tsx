"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Save, RefreshCcw, XCircle, Box, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import PanelGrid from "@/components/ui/PanelGrid";
import { AuditLogModal } from "@/components/AuditLogModal";
import { PanelGridTable, PanelGridThead, PanelGridTh, PanelGridTbody, PanelGridTr, PanelGridTd } from "@/components/ui/PanelGridTable";

const EMPTY_ARR: any[] = [];
const t   = (v: any) => String(v ?? "").trim();
const n2  = (v: any) => parseFloat(v ?? 0).toFixed(2);
const sF  = async (url: string) => { const r = await fetch(url); const j = await r.json(); if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`); return j; };

const EMPTY_FORM = { assproduct_uq: "", qty: 0, match_variety: false, porcentage: 0 };

interface Props {
    product: any;
    onClose: () => void;
}

export default function BoxRecipeModal({ product, onClose }: Props) {
    const [selRow,    setSelRow]    = useState<any>(null);
    const [formMode,  setFormMode]  = useState<"add" | "edit" | null>(null);
    const [form,      setForm]      = useState<any>({ ...EMPTY_FORM });
    const [saving,    setSaving]    = useState(false);
    const [err,       setErr]       = useState<string | null>(null);
    const [prodSearch, setProdSearch] = useState("");
    const [debProd,    setDebProd]    = useState("");

    useEffect(() => { const t = setTimeout(() => setDebProd(prodSearch), 300); return () => clearTimeout(t); }, [prodSearch]);

    const { data: rows = EMPTY_ARR, isFetching: loadRows, refetch: refetchRows } =
        useQuery({ queryKey: ["box-recipe", product.unico], queryFn: () => sF(`/api/masters/items/products/${product.unico}/box-recipe`), staleTime: 0 });

    const { data: products = EMPTY_ARR, isFetching: loadProds } = useQuery({
        queryKey: ["prods-solid", debProd],
        queryFn:  () => sF(`/api/masters/items/lookups/products-solid?search=${encodeURIComponent(debProd || "%")}`),
        staleTime: 60000,
    });

    const S = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

    const openAdd = () => { setForm({ ...EMPTY_FORM }); setProdSearch(""); setErr(null); setFormMode("add"); };
    const openEdit = () => {
        if (!selRow) return;
        setForm({ assproduct_uq: selRow.assproduct_uq, qty: selRow.bunches_case, match_variety: false, porcentage: selRow.porcentage ?? 0 });
        setProdSearch(t(selRow.description));
        setErr(null); setFormMode("edit");
    };
    const cancel = () => { setFormMode(null); setErr(null); };

    const save = async () => {
        if (!form.assproduct_uq) { setErr("Select a product."); return; }
        setSaving(true); setErr(null);
        try {
            if (formMode === "add") {
                const r = await fetch(`/api/masters/items/products/${product.unico}/box-recipe`, {
                    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
                });
                const d = await r.json();
                if (!d.success) throw new Error(d.error);
                toast.success("Row added.");
            } else {
                const r = await fetch(`/api/masters/items/products/box-recipe/${selRow.unico}`, {
                    method: "PUT", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...form, product_uq: product.unico }),
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
            const r = await fetch(`/api/masters/items/products/box-recipe/${selRow.unico}`, { method: "DELETE" });
            const d = await r.json();
            if (!d.success) throw new Error(d.error);
            toast.success("Row deleted."); setSelRow(null); setFormMode(null); refetchRows();
        } catch (e: any) { setErr(e.message); toast.error(e.message); }
        finally { setSaving(false); }
    };

    const byPct = !!(formMode && form.porcentage > 0);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col" style={{ maxHeight: "88vh" }}>
                {/* Header */}
                <div className="h-10 bg-[#374151] rounded-t-xl flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-2">
                        <Box size={14} className="text-[#FB7506]" />
                        <span className="font-black text-[10px] uppercase tracking-widest text-white">Box Recipe — {t(product.description)}</span>
                        {err && <span className="text-amber-400 text-[9px] font-bold ml-2 truncate max-w-[200px]">{err}</span>}
                    </div>
                    <button onClick={onClose}><XCircle size={15} className="text-gray-400 hover:text-white" /></button>
                </div>

                {/* Product info bar */}
                <div className="bg-gray-50 border-b border-[#DBD9D9] px-4 py-2 shrink-0 grid grid-cols-4 gap-3 text-[10px]">
                    {[
                        { l: "Bunches/Case", v: product.up_x_case },
                        { l: "Units/Bunch",  v: product.up_x_pack },
                        { l: "Units/Case",   v: product.total_units },
                        { l: "Price/Stem",   v: product.stem_pack ? "✓" : "—" },
                    ].map(x => (
                        <div key={x.l}>
                            <div className="text-[9px] font-black text-gray-400 uppercase">{x.l}</div>
                            <div className="font-bold text-gray-700">{t(x.v) || "—"}</div>
                        </div>
                    ))}
                </div>

                {/* Grid */}
                <PanelGrid
                    icon={Box}
                    title="Bunches Per Case"
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
                            <PanelGridTh>Product</PanelGridTh>
                            <PanelGridTh className="w-20" align="right">Bunches</PanelGridTh>
                            <PanelGridTh className="w-20" align="right">%</PanelGridTh>
                        </PanelGridThead>
                        <PanelGridTbody>
                            {rows.map((r: any) => (
                                <PanelGridTr key={r.unico} selected={selRow?.unico === r.unico}
                                    onClick={() => setSelRow(selRow?.unico === r.unico ? null : r)}>
                                    <PanelGridTd className="font-medium">{t(r.description)}</PanelGridTd>
                                    <PanelGridTd align="right">{r.bunches_case}</PanelGridTd>
                                    <PanelGridTd align="right" className="text-gray-500">{r.porcentage > 0 ? n2(r.porcentage) : "—"}</PanelGridTd>
                                </PanelGridTr>
                            ))}
                            {!loadRows && rows.length === 0 && (
                                <PanelGridTr onClick={() => {}}><PanelGridTd colSpan={3} className="text-center text-gray-300 italic text-xs py-4">No products — click Add to start</PanelGridTd></PanelGridTr>
                            )}
                        </PanelGridTbody>
                    </PanelGridTable>
                </PanelGrid>

                {/* Add / Edit form */}
                {formMode && (
                    <div className="border-t border-[#DBD9D9] px-4 py-3 bg-gray-50 shrink-0 space-y-2">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{formMode === "add" ? "Add" : "Modify"} Product</p>

                        {/* Product search */}
                        <div className="flex flex-col gap-0.5">
                            <label className="text-[9px] font-black text-gray-400 uppercase">Product *</label>
                            <div className="flex gap-1.5 items-center">
                                <input
                                    placeholder="Type to search products..."
                                    value={prodSearch}
                                    onChange={e => { setProdSearch(e.target.value); if (formMode === "add") S("assproduct_uq", ""); }}
                                    className="fos-input text-xs py-1 flex-1"
                                />
                                {loadProds && <RefreshCcw size={10} className="animate-spin text-gray-400 shrink-0" />}
                            </div>
                            {prodSearch && products.length > 0 && !form.assproduct_uq && formMode === "add" && (
                                <div className="border border-gray-200 rounded bg-white shadow-lg max-h-32 overflow-y-auto text-xs z-10">
                                    {(products as any[]).map((p: any) => (
                                        <div key={p.unico}
                                            onClick={() => { S("assproduct_uq", p.unico); setProdSearch(t(p.description)); }}
                                            className="px-3 py-1.5 cursor-pointer hover:bg-[#FB7506]/10 border-b border-gray-50 last:border-0">
                                            <span className="font-semibold">{t(p.description)}</span>
                                            <span className="text-gray-400 ml-1.5">{p.bunches_case}bch · {p.units_bunch}u</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <div className="flex flex-col gap-0.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase">Bunches/Case</label>
                                <input type="number" min="0" value={form.qty}
                                    onChange={e => S("qty", parseInt(e.target.value) || 0)}
                                    className="fos-input text-xs py-1 text-right" />
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase">% (optional)</label>
                                <input type="number" min="0" step="0.01" value={form.porcentage}
                                    onChange={e => S("porcentage", parseFloat(e.target.value) || 0)}
                                    className="fos-input text-xs py-1 text-right" />
                            </div>
                            <div className="flex flex-col gap-0.5 justify-end">
                                <label className="flex items-center gap-1.5 cursor-pointer">
                                    <input type="checkbox" checked={!!form.match_variety}
                                        onChange={e => S("match_variety", e.target.checked)}
                                        className="w-3.5 h-3.5 accent-[#FB7506]" />
                                    <span className="text-[9px] font-black text-gray-400 uppercase">Match Variety</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                            <button onClick={cancel} className="px-3 py-1.5 rounded border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
                            <button onClick={save} disabled={saving || !form.assproduct_uq}
                                className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-[#FB7506] hover:bg-orange-600 text-white text-xs font-black disabled:opacity-50">
                                {saving ? <RefreshCcw size={11} className="animate-spin" /> : <Save size={11} />}
                                {saving ? "Saving..." : formMode === "add" ? "Add Row" : "Save Changes"}
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
