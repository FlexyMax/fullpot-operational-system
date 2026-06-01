"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Loader2, Search, Plus, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const t = (v: any) => String(v ?? "").trim();
const fmt = (v: any) => parseFloat(v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const PAGE_SIZE = 50;

interface Props {
    soUnico: string;
    cases:   any[];
    onClose: () => void;
    onAdded: () => void;
}

interface Product {
    unico:       string;
    description: string;
    case_sh:     string;
    case_uq:     string;
    up_x_pack:   number;
    up_x_case:   number;
    up_x_invo:   number;
    sales_price: number;
    stem_pack:   boolean;
    boxcode:     string;
    upc:         string;
    customer:    string;
}

const inp = "border border-gray-300 rounded px-2 py-1.5 text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-400";

function mapProduct(p: any): Product {
    return {
        unico:       t(p.unico        ?? p.UNICO),
        description: t(p.description  ?? p.DESCRIPTION),
        case_sh:     t(p.case_sh      ?? p.CASE_SH),
        case_uq:     t(p.case_uq      ?? p.CASE_UQ ?? ""),
        up_x_pack:   Number(p.up_x_pack  ?? p.UP_X_PACK  ?? 1),
        up_x_case:   Number(p.up_x_case  ?? p.UP_X_CASE  ?? 1),
        up_x_invo:   Number(p.up_x_invo  ?? p.UP_X_INVO  ?? 1),
        sales_price: Number(p.sales_price ?? p.SALES_PRICE ?? 0),
        stem_pack:   p.stem_pack === true || p.stem_pack === 1,
        boxcode:     t(p.boxcode ?? p.BOXCODE ?? p.boxcode2 ?? ""),
        upc:         t(p.upc ?? p.UPC ?? ""),
        customer:    t(p.customer ?? p.CUSTOMER ?? ""),
    };
}

export function ProductsListModal({ soUnico, cases, onClose, onAdded }: Props) {
    const [search,   setSearch]   = useState("");
    const [products, setProducts] = useState<Product[]>([]);
    const [total,    setTotal]    = useState(0);
    const [page,     setPage]     = useState(1);
    const [loading,  setLoading]  = useState(false);
    const [hasMore,  setHasMore]  = useState(true);
    const [selected, setSelected] = useState<Product | null>(null);
    const [adding,   setAdding]   = useState(false);
    const [addForm,  setAddForm]  = useState({ qty: "1", price: "0", packs_box: "1", units_pack: "1", case_uq: "" });

    const timerRef    = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const sentinelRef = useRef<HTMLDivElement>(null);
    const searchRef   = useRef(search);
    searchRef.current = search;

    const af = <K extends keyof typeof addForm>(k: K, v: string) =>
        setAddForm(p => ({ ...p, [k]: v }));

    const loadPage = useCallback(async (q: string, pg: number, reset: boolean) => {
        setLoading(true);
        try {
            const url = `/api/standing-orders/products?page=${pg}&size=${PAGE_SIZE}&q=${encodeURIComponent(q)}`;
            const r = await fetch(url);
            const j = await r.json();
            const rows: Product[] = (j.rows ?? []).map(mapProduct);
            const tot = j.total ?? 0;
            setTotal(tot);
            setProducts(prev => reset ? rows : [...prev, ...rows]);
            setHasMore(rows.length === PAGE_SIZE);
            setPage(pg);
        } catch { /* ignore */ }
        finally { setLoading(false); }
    }, []);

    // Initial load
    useEffect(() => { loadPage("", 1, true); }, [loadPage]);

    // Infinite scroll sentinel
    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;
        const obs = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && !loading && hasMore) {
                loadPage(searchRef.current, page + 1, false);
            }
        }, { threshold: 0.1 });
        obs.observe(el);
        return () => obs.disconnect();
    }, [loading, hasMore, page, loadPage]);

    const handleSearch = (val: string) => {
        setSearch(val);
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            setProducts([]);
            setHasMore(true);
            loadPage(val, 1, true);
        }, 350);
    };

    const selectProduct = (p: Product) => {
        setSelected(p);
        const packs = p.up_x_pack > 0 ? Math.round(p.up_x_case / p.up_x_pack) : 1;
        setAddForm({
            qty:        "1",
            price:      String(p.sales_price),
            packs_box:  String(packs || 1),
            units_pack: String(p.up_x_pack || 1),
            case_uq:    p.case_uq,
        });
    };

    const handleAdd = async () => {
        if (!selected) return;
        setAdding(true);
        try {
            const r = await fetch("/api/standing-orders/line", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sorder_uq:  soUnico,
                    product_uq: selected.unico,
                    case_uq:    addForm.case_uq,
                    qty_sorder: parseInt(addForm.qty)        || 1,
                    packs_box:  parseInt(addForm.packs_box)  || 1,
                    units_pack: parseInt(addForm.units_pack) || 1,
                    so_price:   parseFloat(addForm.price)    || 0,
                    stem_pack:  selected.stem_pack,
                    active: true, details: "", pccode: "", upc: selected.upc,
                    food: false, food_uq: "", cporder_no: "", upc_text: "",
                    retail_price: 0, boxcode2: "", color_breakdown: "",
                    upc_notes: "", additional_notes: "",
                }),
            });
            const j = await r.json();
            if (!r.ok || !j.success) throw new Error(j.error || "Failed");
            toast.success(`"${selected.description.slice(0, 40)}" added`);
            onAdded();
            setSelected(null);
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setAdding(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="h-10 bg-[#374151] flex items-center justify-between px-4 shrink-0 rounded-t-lg">
                    <span className="font-black text-[11px] text-white uppercase tracking-widest">
                        Products List
                        {total > 0 && <span className="ml-2 font-normal text-gray-400">({total.toLocaleString()} total)</span>}
                    </span>
                    <button onClick={onClose} className="text-white/60 hover:text-white"><X size={14} /></button>
                </div>

                {/* Search */}
                <div className="px-3 py-2 border-b border-gray-200 flex items-center gap-2 shrink-0">
                    <Search size={12} className="text-gray-400 shrink-0" />
                    <input
                        value={search}
                        onChange={e => handleSearch(e.target.value)}
                        placeholder="Search by description, code..."
                        className="flex-1 text-[11px] focus:outline-none"
                        autoFocus
                    />
                    {loading && page === 1 && <Loader2 size={12} className="animate-spin text-gray-400 shrink-0" />}
                    <span className="text-[10px] text-gray-400 shrink-0">{products.length} loaded</span>
                </div>

                {/* Grid — scrollable with infinite scroll */}
                <div className="flex-1 overflow-auto min-h-0">
                    <table className="min-w-full text-[11px] text-left">
                        <thead className="sticky top-0 z-10">
                            <tr className="bg-gray-100 text-gray-700">
                                <th className="px-2 py-1.5 font-bold border-b border-gray-200 min-w-[220px]">Description</th>
                                <th className="px-2 py-1.5 font-bold border-b border-gray-200 text-right">St/Bch</th>
                                <th className="px-2 py-1.5 font-bold border-b border-gray-200 text-right">Bch/Case</th>
                                <th className="px-2 py-1.5 font-bold border-b border-gray-200 text-right">Un/Invo</th>
                                <th className="px-2 py-1.5 font-bold border-b border-gray-200 text-right">Price</th>
                                <th className="px-2 py-1.5 font-bold border-b border-gray-200">Case</th>
                                <th className="px-2 py-1.5 font-bold border-b border-gray-200 hidden sm:table-cell">BoxCode</th>
                                <th className="px-2 py-1.5 font-bold border-b border-gray-200 hidden sm:table-cell">UPC</th>
                                <th className="px-2 py-1.5 font-bold border-b border-gray-200 hidden lg:table-cell">Customer</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((p, i) => {
                                const sel = selected?.unico === p.unico;
                                return (
                                    <tr key={i} onClick={() => selectProduct(p)}
                                        className={cn(
                                            "border-b cursor-pointer transition-colors",
                                            sel ? "!bg-blue-100 ring-2 ring-inset ring-blue-400" : "odd:bg-white even:bg-gray-50 hover:bg-blue-50"
                                        )}
                                    >
                                        <td className="px-2 py-1 font-medium max-w-[220px] truncate">{p.description}</td>
                                        <td className="px-2 py-1 text-right">{p.up_x_pack}</td>
                                        <td className="px-2 py-1 text-right">{p.up_x_pack > 0 ? Math.round(p.up_x_case / p.up_x_pack) : p.up_x_case}</td>
                                        <td className="px-2 py-1 text-right">{p.up_x_invo}</td>
                                        <td className="px-2 py-1 text-right font-semibold">{fmt(p.sales_price)}</td>
                                        <td className="px-2 py-1">{p.case_sh}</td>
                                        <td className="px-2 py-1 text-[10px] text-gray-500 hidden sm:table-cell">{p.boxcode}</td>
                                        <td className="px-2 py-1 text-[10px] text-gray-500 hidden sm:table-cell">{p.upc}</td>
                                        <td className="px-2 py-1 text-[10px] text-gray-400 max-w-[100px] truncate hidden lg:table-cell">{p.customer}</td>
                                    </tr>
                                );
                            })}
                            {/* Infinite scroll sentinel */}
                            <tr>
                                <td colSpan={9}>
                                    <div ref={sentinelRef} className="flex items-center justify-center py-4">
                                        {loading && page > 1 && <Loader2 size={14} className="animate-spin text-gray-400" />}
                                        {!loading && !hasMore && products.length > 0 && (
                                            <span className="text-[10px] text-gray-400 italic">All {total.toLocaleString()} products loaded</span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Add panel — shown when a product is selected */}
                {selected && (
                    <div className="border-t-2 border-[#FB7506] bg-orange-50 px-4 py-3 shrink-0">
                        <div className="flex items-start gap-3 flex-wrap">
                            <div className="flex-1 min-w-0">
                                <p className="text-[9px] font-black text-[#FB7506] uppercase tracking-widest mb-0.5">Selected</p>
                                <p className="text-[12px] font-bold text-gray-800 truncate">{selected.description}</p>
                            </div>
                            <div className="flex items-end gap-2 flex-wrap shrink-0">
                                <div>
                                    <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5">Case</label>
                                    <select value={addForm.case_uq} onChange={e => af("case_uq", e.target.value)} className={`${inp} w-36`}>
                                        <option value="">— select —</option>
                                        {cases.map((c, i) => (
                                            <option key={i} value={t(c.unico ?? c.UNICO)}>
                                                {t(c.case_name ?? c.CASE_NAME)} ({t(c.case_sh ?? c.CASE_SH)})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5">Qty</label>
                                    <input type="number" value={addForm.qty} onChange={e => af("qty", e.target.value)} className={`${inp} w-16`} min="1" />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5">Bx/Case</label>
                                    <input type="number" value={addForm.packs_box} onChange={e => af("packs_box", e.target.value)} className={`${inp} w-16`} min="1" />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5">Un/Bch</label>
                                    <input type="number" value={addForm.units_pack} onChange={e => af("units_pack", e.target.value)} className={`${inp} w-16`} min="1" />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5">Price</label>
                                    <input type="number" step="0.01" value={addForm.price} onChange={e => af("price", e.target.value)} className={`${inp} w-20`} />
                                </div>
                                <button onClick={handleAdd} disabled={adding}
                                    className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-black text-white bg-[#FB7506] hover:bg-orange-500 rounded disabled:opacity-40 transition-colors self-end">
                                    {adding ? <Loader2 size={10} className="animate-spin" /> : <Plus size={10} />}
                                    Add to Order
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="h-10 bg-gray-50 border-t border-gray-200 flex items-center justify-end px-4 shrink-0 rounded-b-lg">
                    <button onClick={onClose}
                        className="px-4 py-1.5 text-[11px] font-black text-white bg-[#374151] hover:bg-gray-600 rounded flex items-center gap-1 transition-colors">
                        <Check size={10} /> Close
                    </button>
                </div>
            </div>
        </div>
    );
}
