"use client";

import { useState, useRef, useEffect } from "react";
import { X, Loader2, Plus, Trash2, Search, Check } from "lucide-react";
import { toast } from "sonner";

const t = (v: any) => String(v ?? "").trim();
const fmt  = (v: any) => parseFloat(v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtI = (v: any) => { const n = parseInt(v ?? 0); return isNaN(n) ? "" : n.toString(); };

interface Props {
    lineUnico:   string;
    lineDesc:    string;
    soPrice:     number;
    onClose:     () => void;
}

interface CompRow {
    unico:        string;
    description:  string;
    bunches_case: number;
    up_x_pack:    number;
    porcentage:   number;
    so_price:     number;
}

const inp = "w-full border border-gray-300 rounded px-2 py-1.5 text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-400";

export function BoxCompositionModal({ lineUnico, lineDesc, soPrice, onClose }: Props) {
    const [rows,           setRows]           = useState<CompRow[]>([]);
    const [loading,        setLoading]        = useState(true);
    const [adding,         setAdding]         = useState(false);
    const [deleting,       setDeleting]       = useState<string | null>(null);

    // Add-row form
    const [productSearch,  setProductSearch]  = useState("");
    const [productResults, setProductResults] = useState<any[]>([]);
    const [searchLoading,  setSearchLoading]  = useState(false);
    const [showDrop,       setShowDrop]       = useState(false);
    const [addForm,        setAddForm]        = useState({
        product_uq:   "",
        product_name: "",
        bunches_case: "1",
        up_x_pack:    "1",
        porcentage:   "0",
        so_price:     String(soPrice || 0),
    });

    const dropRef  = useRef<HTMLDivElement>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const af = <K extends keyof typeof addForm>(k: K, v: string) =>
        setAddForm(p => ({ ...p, [k]: v }));

    // Load composition rows
    useEffect(() => {
        (async () => {
            try {
                const r = await fetch(`/api/standing-orders/box-composition/${lineUnico}`);
                const j = await r.json();
                if (!r.ok) throw new Error(j.error || "Failed");
                setRows((Array.isArray(j) ? j : []).map((x: any) => ({
                    unico:        t(x.unico        ?? x.UNICO),
                    description:  t(x.description  ?? x.DESCRIPTION),
                    bunches_case: parseInt(x.bunches_case ?? x.BUNCHES_CASE ?? 1),
                    up_x_pack:    parseInt(x.up_x_pack    ?? x.UP_X_PACK    ?? 1),
                    porcentage:   parseFloat(x.porcentage  ?? x.PORCENTAGE  ?? 0),
                    so_price:     parseFloat(x.so_price    ?? x.SO_PRICE    ?? 0),
                })));
            } catch (e: any) {
                toast.error("Failed to load composition: " + e.message);
            } finally {
                setLoading(false);
            }
        })();
    }, [lineUnico]);

    // Close product dropdown on outside click
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
            } catch { setProductResults([]); }
            finally { setSearchLoading(false); }
        }, 300);
    };

    const selectProduct = (p: any) => {
        const upxpack = Number(p.up_x_pack ?? p.UP_X_PACK ?? 1);
        const upxcase = Number(p.up_x_case ?? p.UP_X_CASE ?? 1);
        const bunchesCase = upxpack > 0 ? Math.round(upxcase / upxpack) : 1;
        setAddForm(prev => ({
            ...prev,
            product_uq:   t(p.unico ?? p.UNICO),
            product_name: t(p.description ?? p.DESCRIPTION),
            bunches_case: String(bunchesCase || 1),
            up_x_pack:    String(upxpack || 1),
            so_price:     String(p.sales_price ?? p.SALES_PRICE ?? prev.so_price),
        }));
        setProductSearch(t(p.description ?? p.DESCRIPTION));
        setShowDrop(false);
    };

    const handleAdd = async () => {
        if (!addForm.product_uq) { toast.error("Product is required"); return; }
        setAdding(true);
        try {
            const r = await fetch(`/api/standing-orders/box-composition/${lineUnico}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    product_uq:   addForm.product_uq,
                    bunches_case: parseInt(addForm.bunches_case) || 1,
                    up_x_pack:    parseInt(addForm.up_x_pack)    || 1,
                    porcentage:   parseFloat(addForm.porcentage) || 0,
                    so_price:     parseFloat(addForm.so_price)   || 0,
                }),
            });
            const j = await r.json();
            if (!r.ok || !j.success) throw new Error(j.error || "Failed");
            // Reload rows
            const r2 = await fetch(`/api/standing-orders/box-composition/${lineUnico}`);
            const j2 = await r2.json();
            setRows((Array.isArray(j2) ? j2 : []).map((x: any) => ({
                unico:        t(x.unico        ?? x.UNICO),
                description:  t(x.description  ?? x.DESCRIPTION),
                bunches_case: parseInt(x.bunches_case ?? x.BUNCHES_CASE ?? 1),
                up_x_pack:    parseInt(x.up_x_pack    ?? x.UP_X_PACK    ?? 1),
                porcentage:   parseFloat(x.porcentage  ?? x.PORCENTAGE  ?? 0),
                so_price:     parseFloat(x.so_price    ?? x.SO_PRICE    ?? 0),
            })));
            // Reset form
            setAddForm({ product_uq: "", product_name: "", bunches_case: "1", up_x_pack: "1", porcentage: "0", so_price: String(soPrice || 0) });
            setProductSearch("");
            toast.success("Product added");
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (unico: string) => {
        setDeleting(unico);
        try {
            const r = await fetch(`/api/standing-orders/box-composition/${unico}`, { method: "DELETE" });
            const j = await r.json();
            if (!r.ok || !j.success) throw new Error(j.error || "Failed");
            setRows(prev => prev.filter(x => x.unico !== unico));
            toast.success("Row deleted");
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setDeleting(null);
        }
    };

    const totalPct = rows.reduce((s, r) => s + r.porcentage, 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="bg-[#374151] px-4 py-3 flex items-center justify-between shrink-0">
                    <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Box Composition</p>
                        <p className="text-[13px] font-black text-white uppercase truncate max-w-[460px]">{lineDesc}</p>
                    </div>
                    <button onClick={onClose} className="text-white/60 hover:text-white"><X size={14} /></button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">

                    {/* Existing rows */}
                    <div>
                        <p className="text-[10px] font-black text-[#FB7506] uppercase tracking-widest mb-2">Composition</p>
                        {loading ? (
                            <div className="flex items-center gap-2 py-4 text-gray-400">
                                <Loader2 size={14} className="animate-spin" />
                                <span className="text-[11px]">Loading...</span>
                            </div>
                        ) : (
                            <div className="overflow-auto rounded border border-gray-200">
                                <table className="min-w-full text-[11px]">
                                    <thead>
                                        <tr className="bg-gray-100 text-gray-700">
                                            <th className="px-3 py-1.5 text-left font-bold">Product</th>
                                            <th className="px-3 py-1.5 text-right font-bold">Bx/Case</th>
                                            <th className="px-3 py-1.5 text-right font-bold">Un/Pack</th>
                                            <th className="px-3 py-1.5 text-right font-bold">%</th>
                                            <th className="px-3 py-1.5 text-right font-bold">Price</th>
                                            <th className="px-3 py-1.5 text-center font-bold w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((row, i) => (
                                            <tr key={i} className="border-t border-gray-100 odd:bg-white even:bg-gray-50">
                                                <td className="px-3 py-1.5 font-medium">{row.description || row.unico}</td>
                                                <td className="px-3 py-1.5 text-right">{fmtI(row.bunches_case)}</td>
                                                <td className="px-3 py-1.5 text-right">{fmtI(row.up_x_pack)}</td>
                                                <td className="px-3 py-1.5 text-right font-semibold">{row.porcentage.toFixed(1)}%</td>
                                                <td className="px-3 py-1.5 text-right font-semibold">{fmt(row.so_price)}</td>
                                                <td className="px-3 py-1.5 text-center">
                                                    <button
                                                        onClick={() => handleDelete(row.unico)}
                                                        disabled={deleting === row.unico}
                                                        className="text-red-400 hover:text-red-600 disabled:opacity-40"
                                                    >
                                                        {deleting === row.unico
                                                            ? <Loader2 size={11} className="animate-spin" />
                                                            : <Trash2 size={11} />}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {rows.length === 0 && (
                                            <tr><td colSpan={6} className="px-3 py-6 text-center text-gray-400 italic">No composition rows</td></tr>
                                        )}
                                        {rows.length > 0 && (
                                            <tr className="border-t-2 border-gray-300 bg-gray-100 font-black">
                                                <td className="px-3 py-1.5 text-gray-600">Total</td>
                                                <td /><td />
                                                <td className={`px-3 py-1.5 text-right ${Math.abs(totalPct - 100) < 0.1 ? "text-green-600" : "text-red-500"}`}>
                                                    {totalPct.toFixed(1)}%
                                                </td>
                                                <td /><td />
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Add row form */}
                    <div className="border border-gray-200 rounded p-3 space-y-3">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Add Product</p>

                        {/* Product search */}
                        <div ref={dropRef} className="relative">
                            <div className="flex items-center gap-1 border border-gray-300 rounded px-2 py-1.5 focus-within:ring-2 focus-within:ring-blue-400">
                                <Search size={11} className="text-gray-400 shrink-0" />
                                <input
                                    value={productSearch}
                                    onChange={e => handleProductSearch(e.target.value)}
                                    placeholder="Search product..."
                                    className="flex-1 text-[11px] focus:outline-none bg-transparent"
                                />
                                {searchLoading && <Loader2 size={10} className="animate-spin text-gray-400" />}
                            </div>
                            {addForm.product_uq && (
                                <span className="text-[9px] text-green-600 font-bold">✓ {addForm.product_uq}</span>
                            )}
                            {showDrop && productResults.length > 0 && (
                                <div className="absolute z-20 top-full left-0 right-0 bg-white border border-gray-200 rounded shadow-xl max-h-44 overflow-y-auto">
                                    {productResults.map((p, i) => (
                                        <div key={i} onClick={() => selectProduct(p)}
                                            className="px-2 py-1 hover:bg-blue-50 cursor-pointer border-b border-gray-100 text-[10px] flex gap-2">
                                            <span className="font-bold">{t(p.description ?? p.DESCRIPTION)}</span>
                                            <span className="text-gray-400">{t(p.short ?? p.SHORT)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Numeric fields */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5">Bx/Case</label>
                                <input type="number" value={addForm.bunches_case} onChange={e => af("bunches_case", e.target.value)} className={inp} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5">Un/Pack</label>
                                <input type="number" value={addForm.up_x_pack} onChange={e => af("up_x_pack", e.target.value)} className={inp} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5">%</label>
                                <input type="number" step="0.1" value={addForm.porcentage} onChange={e => af("porcentage", e.target.value)} className={inp} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5">Price</label>
                                <input type="number" step="0.01" value={addForm.so_price} onChange={e => af("so_price", e.target.value)} className={inp} />
                            </div>
                        </div>

                        <button onClick={handleAdd} disabled={adding || !addForm.product_uq}
                            className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-black text-white bg-[#FB7506] hover:bg-orange-500 rounded disabled:opacity-40 transition-colors">
                            {adding ? <Loader2 size={10} className="animate-spin" /> : <Plus size={10} />}
                            Add to Composition
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="h-11 bg-gray-50 border-t border-gray-200 flex items-center justify-end px-4 shrink-0">
                    <button onClick={onClose}
                        className="px-4 py-1.5 text-[11px] font-black text-white bg-[#374151] hover:bg-gray-600 rounded flex items-center gap-1 transition-colors">
                        <Check size={10} /> Done
                    </button>
                </div>
            </div>
        </div>
    );
}
