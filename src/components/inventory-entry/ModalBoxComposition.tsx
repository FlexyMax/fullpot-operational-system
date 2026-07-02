"use client";
import { useState, useEffect } from "react";
import { X, Layers, RefreshCcw, Check, Search, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import PanelGrid from "@/components/ui/PanelGrid";

const t = (v: any) => String(v ?? "").trim();
const int = (v: any) => { const n = parseInt(String(v ?? 0), 10); return isNaN(n) ? 0 : n; };
const num = (v: any) => { const n = parseFloat(String(v ?? 0)); return isNaN(n) ? 0 : n; };
const fmt2 = (v: any) => parseFloat(v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const norm = (rows: any[]) => rows.map(r => { const n: any = {}; for (const [k, v] of Object.entries(r)) n[k.toUpperCase()] = v; return n; });

const EMPTY_ROW = { product_uq: "", description: "", bunches_x_case: 0, units_x_bunch: 0, grow_price: 0, salesprice: 0 };

interface Props {
    open: boolean;
    onClose: () => void;
    boxUnico: string;
    boxLabel: string;
    onSuccess: () => void;
}

export function ModalBoxComposition({ open, onClose, boxUnico, boxLabel, onSuccess }: Props) {
    const [rows,        setRows]        = useState<any[]>([]);
    const [loading,     setLoading]     = useState(false);
    const [saving,      setSaving]      = useState(false);
    const [delCompUnico, setDelCompUnico] = useState("");

    const [adding,     setAdding]     = useState(false);
    const [prodSearch, setProdSearch] = useState("");
    const [prodRows,   setProdRows]   = useState<any[]>([]);
    const [searching,  setSearching]  = useState(false);
    const [newRow,     setNewRow]     = useState({ ...EMPTY_ROW });

    const loadRows = () => {
        if (!boxUnico) return;
        setLoading(true);
        fetch(`/api/inventory-entry/boxes/${boxUnico}/composition`)
            .then(r => r.json())
            .then(d => setRows(norm(Array.isArray(d) ? d : [])))
            .catch(() => setRows([]))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (!open) { setAdding(false); setProdRows([]); setProdSearch(""); setNewRow({ ...EMPTY_ROW }); setDelCompUnico(""); return; }
        loadRows();
    }, [open, boxUnico]);

    if (!open) return null;

    const doSearchProducts = async () => {
        if (!prodSearch.trim()) return;
        setSearching(true);
        try {
            const r = await fetch(`/api/inventory-entry/products?page=1&pageSize=20&search=${encodeURIComponent(prodSearch)}`);
            const d = await r.json();
            setProdRows(norm(d.rows ?? []));
        } catch {
            setProdRows([]);
        } finally {
            setSearching(false);
        }
    };

    const pickProduct = (p: any) => {
        setNewRow({
            product_uq:     t(p.UNICO),
            description:    t(p.DESCRIPTION),
            bunches_x_case: int(p.UP_X_CASE ?? 0),
            units_x_bunch:  int(p.UP_X_PACK ?? 0),
            grow_price:     0,
            salesprice:     num(p.SALES_PRICE ?? 0),
        });
        setProdRows([]);
        setProdSearch(t(p.DESCRIPTION));
    };

    const handleAdd = async () => {
        if (!newRow.product_uq) { toast.error("Select a product first."); return; }
        setSaving(true);
        try {
            const res = await fetch(`/api/inventory-entry/boxes/${boxUnico}/composition`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newRow),
            });
            const d = await res.json();
            if (!d.success) throw new Error(d.error || "Add failed");
            toast.success("Composition row added.");
            setAdding(false);
            setNewRow({ ...EMPTY_ROW });
            setProdSearch("");
            loadRows();
            onSuccess();
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (compUnico: string) => {
        if (delCompUnico !== compUnico) {
            setDelCompUnico(compUnico);
            toast.warning("Click the delete button again to confirm removal.");
            setTimeout(() => setDelCompUnico(""), 4000);
            return;
        }
        setDelCompUnico("");
        try {
            const res = await fetch(`/api/inventory-entry/boxes/${boxUnico}/composition/${compUnico}`, { method: "DELETE" });
            const d = await res.json();
            if (!d.success) throw new Error(d.error || "Delete failed");
            toast.success("Composition row removed.");
            loadRows();
            onSuccess();
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    const fLabel = "text-[10px] font-black text-gray-500 uppercase tracking-wider";
    const fInput = "fos-input h-7 text-xs";

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden" style={{ maxHeight: "85vh" }} onClick={e => e.stopPropagation()}>
                <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 rounded-t-lg shrink-0">
                    <div className="flex items-center gap-2">
                        <Layers size={16} className="text-[#FB7506]" />
                        <span className="font-black text-[10px] text-white uppercase tracking-widest">Composition — {boxLabel || boxUnico}</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={16} /></button>
                </div>

                <PanelGrid
                    title="Composition Rows"
                    icon={Layers}
                    recordCount={rows.length}
                    onRefresh={loadRows}
                    refreshing={loading}
                    headerRight={
                        !adding ? (
                            <button onClick={() => setAdding(true)}
                                className="flex items-center gap-1 h-7 px-2 text-[10px] font-bold bg-green-600 hover:bg-green-500 text-white rounded transition-colors">
                                <Plus size={12} /> Add Product
                            </button>
                        ) : undefined
                    }
                    className="flex-1 min-h-0 rounded-none border-x-0 border-b-0"
                >
                    <table className="w-full text-xs">
                        <thead className="bg-gray-100 sticky top-0">
                            <tr>
                                {["Description","Bunch/Case","Units/Bunch","Grow $","Sale $","Total Sale",""].map(h => (
                                    <th key={h} className="p-2 text-left font-bold text-gray-700 border-r border-gray-200 whitespace-nowrap last:border-r-0">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length === 0 && !loading ? (
                                <tr><td colSpan={7} className="p-4 text-center text-gray-400 italic">No composition rows.</td></tr>
                            ) : rows.map((r: any, i: number) => (
                                <tr key={i} className="border-b border-gray-100 odd:bg-white even:bg-gray-50">
                                    <td className="p-2 border-r border-gray-100 max-w-[180px] truncate">{t(r.DESCRIPTION)}</td>
                                    <td className="p-2 border-r border-gray-100 text-right">{t(r.STEM_PACK ?? r.BUNCHES_X_CASE ?? "")}</td>
                                    <td className="p-2 border-r border-gray-100 text-right">{t(r.UNITS_X_BUNCH)}</td>
                                    <td className="p-2 border-r border-gray-100 text-right">{fmt2(r.GROW_PRICE)}</td>
                                    <td className="p-2 border-r border-gray-100 text-right">{fmt2(r.SALESPRICE)}</td>
                                    <td className="p-2 border-r border-gray-100 text-right font-semibold">{fmt2(r.TOTAL_SALE)}</td>
                                    <td className="p-2 text-center">
                                        <button onClick={() => handleDelete(t(r.UNICO ?? r.COMPOSITION_UQ))}
                                            className={delCompUnico === t(r.UNICO ?? r.COMPOSITION_UQ) ? "text-red-600 animate-pulse" : "text-red-400 hover:text-red-600"}>
                                            <Trash2 size={13} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </PanelGrid>

                {adding && (
                    <div className="p-3 border-t bg-gray-50 shrink-0 space-y-2">
                        <div className="relative">
                            {searching
                                ? <RefreshCcw size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
                                : <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />}
                            <input
                                value={prodSearch}
                                onChange={e => { setProdSearch(e.target.value); setNewRow(p => ({ ...p, product_uq: "" })); }}
                                onKeyDown={e => e.key === "Enter" && doSearchProducts()}
                                className={fInput + " pl-6 w-full"}
                                placeholder="Search product to add..."
                                autoFocus
                            />
                        </div>
                        {prodRows.length > 0 && (
                            <div className="max-h-32 overflow-y-auto border border-gray-200 rounded bg-white">
                                {prodRows.map((p: any, i: number) => (
                                    <div key={i} onClick={() => pickProduct(p)}
                                        className="px-2 py-1 text-xs cursor-pointer hover:bg-[#FB7506]/10 border-b border-gray-50 last:border-0 truncate">
                                        {t(p.DESCRIPTION)}
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="grid grid-cols-4 gap-2">
                            <div className="flex flex-col gap-0.5">
                                <label className={fLabel}>Bunch/Case</label>
                                <input type="number" value={newRow.bunches_x_case} onChange={e => setNewRow(p => ({ ...p, bunches_x_case: int(e.target.value) }))} className={fInput + " text-right"} />
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <label className={fLabel}>Units/Bunch</label>
                                <input type="number" value={newRow.units_x_bunch} onChange={e => setNewRow(p => ({ ...p, units_x_bunch: int(e.target.value) }))} className={fInput + " text-right"} />
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <label className={fLabel}>Grow $</label>
                                <input type="number" step="0.01" value={newRow.grow_price} onChange={e => setNewRow(p => ({ ...p, grow_price: num(e.target.value) }))} className={fInput + " text-right"} />
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <label className={fLabel}>Sale $</label>
                                <input type="number" step="0.01" value={newRow.salesprice} onChange={e => setNewRow(p => ({ ...p, salesprice: num(e.target.value) }))} className={fInput + " text-right"} />
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-t shrink-0">
                    {adding ? (
                        <>
                            <button onClick={() => setAdding(false)} className="px-4 py-2 rounded border border-gray-200 text-xs font-black uppercase text-gray-600 hover:bg-gray-100 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleAdd} disabled={saving || !newRow.product_uq}
                                className="flex items-center gap-1.5 px-5 py-2 rounded bg-[#FB7506] hover:bg-orange-600 disabled:opacity-40 text-white text-xs font-black uppercase tracking-wider transition-all">
                                {saving ? <RefreshCcw size={11} className="animate-spin" /> : <Check size={11} />}
                                Add Row
                            </button>
                        </>
                    ) : (
                        <button onClick={onClose} className="ml-auto px-4 py-2 rounded border border-gray-200 text-xs font-black uppercase text-gray-600 hover:bg-gray-100 transition-colors">
                            Close
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
