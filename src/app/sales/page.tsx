"use client";

import { useState, useCallback, useEffect, useRef, type CSSProperties } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    RefreshCcw, Loader2, Plus, Minus, Trash2, Edit2, Check,
    Search, X, Lock, Unlock, FileText, Printer, CreditCard,
    RotateCcw, Scan, Users, Package, ChevronRight,
    AlertCircle, CheckCircle, XCircle, ClipboardList,
    ShoppingCart, History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { toast } from "sonner";
import { usePagePermissions } from "@/lib/permissions";
import { useAuditLog } from "@/lib/audit";
import { usePOSStore } from "@/store/usePOSStore";
import PanelGrid from "@/components/ui/PanelGrid";
import { PanelGridTable, PanelGridThead, PanelGridTh, PanelGridTbody, PanelGridTr, PanelGridTd } from "@/components/ui/PanelGridTable";
import { MobileActionBar } from "@/components/layout/MobileActionBar";
const EMPTY_ARR: any[] = [];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const t       = (v: any) => String(v ?? "").trim();
const norm    = (rows: any[]) => rows.map(r => { const n: any = {}; for (const [k,v] of Object.entries(r)) n[k.toUpperCase()] = v; return n; });
const normOne = (r: any) => { if (!r) return null; const n: any = {}; for (const [k,v] of Object.entries(r)) n[k.toUpperCase()] = v; return n; };
// SP returns prices as dollar-formatted strings like "$1.89" — strip $ before parsing
const parseMoney = (v: any) => parseFloat(String(v ?? "0").replace(/[$,\s]/g, "")) || 0;
const fmt        = (v: any) => parseMoney(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtI    = (v: any) => { const n = parseInt(v ?? 0); return isNaN(n) ? "" : n.toLocaleString("en-US"); };
const fmtDate = (v: any) => {
    if (!v) return "";
    const s = t(v);
    const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso) return new Date(+iso[1], +iso[2]-1, +iso[3]).toLocaleDateString("en-US");
    const d = new Date(s); return isNaN(d.getTime()) ? s : d.toLocaleDateString("en-US");
};
const DEFAULT_THUMB = "https://flexymax.nyc3.digitaloceanspaces.com/FlexyMaxApp/FlexyMaxImages/NoImageAvailable2.png";

// Convert VFP integer color → subtle row style: 3px left border + 6% background tint
// Matches the inventory-entry approach so colors inform without overwhelming
const vfpRowStyle = (c: any): CSSProperties | undefined => {
    const n = parseInt(c ?? 0);
    if (!n || n <= 0) return undefined;
    const r = n & 0xFF; const g = (n >> 8) & 0xFF; const b = (n >> 16) & 0xFF;
    const rgb = `${r},${g},${b}`;
    return {
        borderLeftColor:  `rgb(${rgb})`,
        borderLeftWidth:  "3px",
        borderLeftStyle:  "solid",
        backgroundColor:  `rgba(${rgb},0.06)`,
    };
};
const bool = (v: any) => v === true || v === 1 || String(v).toLowerCase() === "true";

// ─── Sub-components ───────────────────────────────────────────────────────────
function ActionBtn({ icon: Icon, label, onClick, disabled, variant = "default", size = "md" }: any) {
    return (
        <button onClick={onClick} disabled={disabled}
            className={cn(
                "flex items-center gap-1 font-black uppercase tracking-widest rounded transition-all disabled:opacity-40 whitespace-nowrap shrink-0",
                size === "sm" ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-1 text-[10px]",
                variant === "danger"      && "bg-red-600 hover:bg-red-500 text-white",
                variant === "success"     && "bg-green-600 hover:bg-green-500 text-white",
                variant === "warning"     && "bg-amber-500 hover:bg-amber-400 text-white",
                variant === "default"     && "bg-white hover:bg-gray-100 border border-gray-200 text-gray-700",
                variant === "dark"        && "bg-[#374151] hover:bg-gray-600 text-white",
                variant === "orange"      && "bg-[#FB7506] hover:bg-orange-500 text-white",
                variant === "bar"         && "bg-white/10 hover:bg-white/20 border border-white/20 text-white",
                variant === "bar-danger"  && "bg-red-500/70 hover:bg-red-500 border border-red-400/40 text-white",
            )}
        >
            {Icon && <Icon size={size === "sm" ? 9 : 11} />}
            {label}
        </button>
    );
}
function StatusBadge({ printed, voided }: { printed: boolean; voided: boolean }) {
    if (voided)  return <span className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded bg-red-100 text-red-700 border border-red-200">Voided</span>;
    if (printed) return <span className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded bg-gray-200 text-gray-600 border border-gray-300">Closed</span>;
    return <span className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded bg-green-100 text-green-700 border border-green-200">Open</span>;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SalesPage() {
    const { status } = useSession();
    const router = useRouter();
    const qc = useQueryClient();
    const { canDelete } = usePagePermissions("sales");
    const { logAction } = useAuditLog("sales", "pos_invoices");

    const {
        salesmanUq, salesmanName, userUq, physicalWarehouseUq,
        activeInvoiceUq, invoiceDate,
        setSalesmanInfo, setActiveInvoiceUq, setInvoiceDate,
    } = usePOSStore();

    const [mainTab,            setMainTab]            = useState<"invoice"|"stock"|"history">("invoice");
    const [myInvoices,         setMyInvoices]         = useState(true);
    const [stockSearch,        setStockSearch]        = useState("");
    const [appliedStockSearch, setAppliedStockSearch] = useState("");
    const [stockSortCol,       setStockSortCol]       = useState("");
    const [stockSortDir,       setStockSortDir]       = useState<"ASC"|"DESC">("ASC");
    const [stockPage,          setStockPage]          = useState(1);
    const [stockRows,          setStockRows]          = useState<any[]>([]);
    const [stockTotal,         setStockTotal]         = useState(0);
    const [stockLoading,       setStockLoading]       = useState(false);
    const [stockHasMore,       setStockHasMore]       = useState(true);
    const [working,            setWorking]            = useState(false);
    const [listKey,            setListKey]            = useState(0);
    const [detailKey,          setDetailKey]          = useState(0);
    const [listSearch,         setListSearch]         = useState("");
    const [activeBar,          setActiveBar]          = useState<"invoice" | null>(null);
    const [listModal,          setListModal]          = useState(false);

    // Customer Call List modal state
    const [ccModal,            setCcModal]            = useState(false);
    const [ccStep,             setCcStep]             = useState<1|2|3>(1);
    const [ccSearch,           setCcSearch]           = useState("");
    const [ccCustomers,        setCcCustomers]        = useState<any[]>([]);
    const [ccTotal,            setCcTotal]            = useState(0);
    const [,                   _setCcPage]            = useState(1);
    const [ccLoading,          setCcLoading]          = useState(false);
    const [ccSelectedCustomer, setCcSelectedCustomer] = useState<any>(null);
    const [ccShiptos,          setCcShiptos]          = useState<any[]>([]);
    const [ccSelectedShipto,   setCcSelectedShipto]   = useState<any>(null);
    const [ccCarriers,         setCcCarriers]         = useState<any[]>([]);
    const [ccSelectedCarrier,  setCcSelectedCarrier]  = useState<any>(null);
    const [ccDate,             setCcDate]             = useState(new Date().toISOString().split("T")[0]);
    const [ccCreating,         setCcCreating]         = useState(false);

    // Barcode scan modal
    const [scanModal,          setScanModal]          = useState(false);
    const [scanInput,          setScanInput]          = useState("");
    const [scanLog,            setScanLog]            = useState<{ barcode: string; msg: string; ok: boolean }[]>([]);
    const [scanning,           setScanning]           = useState(false);
    const scanInputRef = useRef<HTMLInputElement>(null);

    // History tab
    const [histCustSearch,     setHistCustSearch]     = useState("");
    const [histCustUq,         setHistCustUq]         = useState("%");
    const [histFrom,           setHistFrom]           = useState(new Date(Date.now()-30*86400000).toISOString().split("T")[0]);
    const [histTo,             setHistTo]             = useState(new Date().toISOString().split("T")[0]);
    const [histInvoiceUq,      setHistInvoiceUq]      = useState<string|null>(null);
    const [histSubTab,         setHistSubTab]         = useState<"details"|"credits"|"statement">("details");
    const [histView,           setHistView]           = useState<"invoices"|"statement">("invoices");

    const sentinelRef = useRef<HTMLDivElement>(null);

    // Edit line modal
    const [editLineModal,  setEditLineModal]  = useState(false);
    const [editLine,       setEditLine]       = useState<any>(null);
    const [editLineForm,   setEditLineForm]   = useState({ box_qty: "1", units_x_box: "1", price: "0" });
    const [savingLine,     setSavingLine]     = useState(false);

    // Product images cache: product_uq → signed URL
    const [productImages,  setProductImages]  = useState<Record<string, string>>({});

    // Stock image/detail modal
    const [stockImageModal, setStockImageModal] = useState<{ row: any; source: "stock" | "lines" } | null>(null);
    const [stockImageForm,  setStockImageForm]  = useState({ box_qty: "1", price: "0.00" });
    const [liveStockRow,    setLiveStockRow]    = useState<any>(null);
    const [modalImages,     setModalImages]     = useState<string[]>([]);
    const [modalImgIdx,     setModalImgIdx]     = useState(0);

    // ── Init: load salesman info (unico, user_uq, wphysical_uq) ──────────────
    useEffect(() => {
        if (status !== "authenticated") return;
        if (salesmanUq) return; // already loaded
        fetch("/api/pos/salesman").then(r => r.json()).then(j => {
            if (j?.unico) {
                setSalesmanInfo(
                    t(j.unico),
                    t(j.salesman_name ?? j.salesman_fname ?? ""),
                    t(j.user_uq  ?? ""),
                    t(j.wphysical_uq ?? "%"),
                );
            }
        }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, salesmanUq]);

    const openEditLine = (line: any) => {
        setEditLine(line);
        setEditLineForm({
            box_qty:    String(line.BOX_QTY   ?? 1),
            units_x_box:String(line.UNITS_X_BOX ?? 1),
            price:      String(parseMoney(line.PRICE ?? line.PRICE_X_U ?? 0)),
        });
        setEditLineModal(true);
    };

    const handleSaveLine = async () => {
        if (!editLine) return;
        setSavingLine(true);
        try {
            const r = await fetch("/api/pos/invoice/line/update", {
                method: "PUT", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    inv_box_uq:  t(editLine.UNICO),
                    box_qty:     parseInt(editLineForm.box_qty)    || 1,
                    units_x_box: parseInt(editLineForm.units_x_box) || 1,
                    price:       parseFloat(editLineForm.price)    || 0,
                    approved:    false,
                }),
            });
            const j = await r.json();
            if (!r.ok || !j.success) throw new Error(j.error || "Failed");
            toast.success("Line updated");
            setEditLineModal(false);
            setDetailKey(k => k + 1);
        } catch (e: any) { toast.error(e.message); }
        finally { setSavingLine(false); }
    };

    if (status === "loading") return null;
    if (status === "unauthenticated") { router.push("/login"); return null; }

    // ── Queries ───────────────────────────────────────────────────────────────
    const listSalesmanUq = myInvoices ? salesmanUq : "%";

    const { data: invoiceList = EMPTY_ARR, isFetching: loadingList } = useQuery({
        queryKey: ["pos-list", listSalesmanUq, invoiceDate, listKey],
        enabled:  !!salesmanUq,
        queryFn:  async () => {
            const r = await fetch(`/api/pos/invoices?date=${invoiceDate}&salesman_uq=${listSalesmanUq}`);
            const j = await r.json();
            return norm(Array.isArray(j) ? j : []);
        },
    });

    const { data: invoiceHeader, isFetching: loadingHeader } = useQuery({
        queryKey: ["pos-header", activeInvoiceUq, detailKey],
        enabled:  !!activeInvoiceUq,
        queryFn:  async () => {
            const r = await fetch(`/api/pos/invoice/header?uq=${activeInvoiceUq}`);
            const j = await r.json();
            return normOne(j);
        },
    });

    const { data: invoiceLines = EMPTY_ARR, isFetching: loadingLines } = useQuery({
        queryKey: ["pos-lines", activeInvoiceUq, salesmanUq, detailKey],
        enabled:  !!activeInvoiceUq,
        queryFn:  async () => {
            const r = await fetch(`/api/pos/invoice/details?uq=${activeInvoiceUq}&salesman_uq=${salesmanUq}`);
            const j = await r.json();
            return norm(Array.isArray(j) ? j : []);
        },
    });

    // When switching to history tab, auto-fill customer from active invoice header
    useEffect(() => {
        if (mainTab === "history" && h?.CUSTOMER_UQ && histCustUq === "%") {
            setHistCustUq(t(h.CUSTOMER_UQ));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mainTab]);

    const { data: histInvoices = EMPTY_ARR, isFetching: loadingHistList } = useQuery({
        queryKey: ["pos-hist-list", histCustUq, histFrom, histTo, salesmanUq],
        enabled:  mainTab === "history" && !!salesmanUq,
        queryFn:  async () => {
            const p = new URLSearchParams({
                customer_uq:  histCustUq,
                start_date:   histFrom,
                end_date:     histTo,
                salesman_uq:  salesmanUq,
            });
            const r = await fetch(`/api/pos/history/invoices?${p}`);
            const j = await r.json();
            return norm(Array.isArray(j) ? j : []);
        },
    });

    const { data: histDetails = EMPTY_ARR } = useQuery({
        queryKey: ["pos-hist-detail", histInvoiceUq, histSubTab, histCustUq, salesmanUq],
        enabled:  !!histInvoiceUq && mainTab === "history",
        queryFn:  async () => {
            if (histSubTab === "details") {
                const p = new URLSearchParams({ invoice_uq: histInvoiceUq!, salesman_uq: salesmanUq });
                const j = await fetch(`/api/pos/history/details?${p}`).then(r => r.json());
                return norm(Array.isArray(j) ? j : []);
            }
            if (histSubTab === "credits") {
                const j = await fetch(`/api/pos/history/credits?invoice_uq=${histInvoiceUq}`).then(r => r.json());
                return norm(Array.isArray(j) ? j : []);
            }
            if (histSubTab === "statement") {
                const p = new URLSearchParams({ customer_uq: histCustUq, start_date: histFrom, end_date: histTo });
                const j = await fetch(`/api/pos/history/statement?${p}`).then(r => r.json());
                return Array.isArray(j) ? norm(j) : j ? [normOne(j)] : [];
            }
            return [];
        },
    });

    const { data: histStatement = EMPTY_ARR, isFetching: loadingStatement } = useQuery({
        queryKey: ["pos-hist-statement", histCustUq, histFrom, histTo],
        enabled:  mainTab === "history" && histView === "statement",
        queryFn:  async () => {
            const p = new URLSearchParams({ customer_uq: histCustUq, start_date: histFrom, end_date: histTo });
            const j = await fetch(`/api/pos/history/statement?${p}`).then(r => r.json());
            return Array.isArray(j) ? norm(j) : [];
        },
    });

    // ── Load product images whenever lines or stock change ────────────────────
    useEffect(() => {
        const lines   = (invoiceLines as any[]).map((l: any) => t(l.PRODUCT_UQ));
        const stocks  = stockRows.map((s: any) => t(s.PRODUCT_UQ ?? s.BOX_PACK_UQ ?? ""));
        const missing = [...new Set([...lines, ...stocks])].filter(u => u && !productImages[u]);
        if (!missing.length) return;
        fetch("/api/products/images", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productUqs: missing }),
        }).then(r => r.json()).then(j => {
            if (j.images) setProductImages(prev => ({ ...prev, ...j.images }));
        }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [invoiceLines, stockRows]);

    // ── Stock (manual paginated fetch, infinite scroll) ───────────────────────
    const loadStock = useCallback(async (page: number, search: string, sortCol: string, sortDir: string, reset: boolean) => {
        setStockLoading(true);
        try {
            const p = new URLSearchParams({
                page: String(page), size: "50", search,
                sort_col: sortCol, sort_dir: sortDir,
                salesman_uq:  salesmanUq          || "%",
                physical_uq:  physicalWarehouseUq || "%",
            });
            const r = await fetch(`/api/pos/stock?${p}`);
            const j = await r.json();
            const rows: any[] = norm(j.rows ?? []);
            setStockTotal(j.total ?? 0);
            setStockRows(prev => reset ? rows : [...prev, ...rows]);
            setStockHasMore(rows.length === 50);
            setStockPage(page);
        } catch { /* ignore */ }
        finally { setStockLoading(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [salesmanUq, physicalWarehouseUq]);

    useEffect(() => {
        if (mainTab === "stock") loadStock(1, appliedStockSearch, stockSortCol, stockSortDir, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mainTab, appliedStockSearch, stockSortCol, stockSortDir, detailKey, physicalWarehouseUq]);

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el || mainTab !== "stock") return;
        const obs = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && !stockLoading && stockHasMore)
                loadStock(stockPage + 1, appliedStockSearch, stockSortCol, stockSortDir, false);
        }, { threshold: 0.1 });
        obs.observe(el);
        return () => obs.disconnect();
    }, [mainTab, stockLoading, stockHasMore, stockPage, appliedStockSearch, stockSortCol, stockSortDir, loadStock]);

    const toggleStockSort = (col: string) => {
        if (stockSortCol === col) {
            setStockSortDir(d => d === "ASC" ? "DESC" : "ASC");
        } else {
            setStockSortCol(col);
            setStockSortDir("ASC");
        }
    };

    const h = invoiceHeader;
    const isOpen   = h && !bool(h.PRINTED) && !bool(h.VOID);
    const isClosed = h && bool(h.PRINTED) && !bool(h.VOID);
    // ── Invoice actions ───────────────────────────────────────────────────────
    const invoiceAction = useCallback(async (endpoint: string, body: any, successMsg: string, auditLabel?: string) => {
        setWorking(true);
        try {
            const r = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
            const j = await r.json();
            if (!r.ok || !j.success) throw new Error(j.error || "Failed");
            toast.success(successMsg);
            if (auditLabel && activeInvoiceUq) logAction("Edit", activeInvoiceUq, `${auditLabel}: ${successMsg}`);
            setDetailKey(k => k+1);
            setListKey(k => k+1);
        } catch(e: any) { toast.error(e.message); }
        finally { setWorking(false); }
    }, [activeInvoiceUq, logAction]);

    const handleCloseInvoice = () => invoiceAction("/api/pos/invoice/close", { uq: activeInvoiceUq }, "Invoice closed", "Close");
    const handleOpenInvoice  = () => invoiceAction("/api/pos/invoice/open",  { uq: activeInvoiceUq, salesman_uq: salesmanUq }, "Invoice reopened", "Open");
    const handleVoidInvoice  = () => {
        toast("Void this invoice?", { duration: 8000,
            action: { label: "Void", onClick: () => invoiceAction("/api/pos/invoice/void", { uq: activeInvoiceUq, reason: "Voided" }, "Invoice voided", "Void") },
            cancel: { label: "Cancel", onClick: () => {} },
        });
    };
    const handleDeleteInvoice = () => {
        toast("Delete this invoice permanently?", { duration: 8000,
            action: { label: "Delete", onClick: async () => {
                setWorking(true);
                try {
                    const r = await fetch("/api/pos/invoice/delete", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ uq: activeInvoiceUq }) });
                    const j = await r.json();
                    if (!r.ok || !j.success) throw new Error(j.error || "Failed");
                    toast.success("Invoice deleted");
                    logAction("Delete", activeInvoiceUq!, "Delete Invoice");
                    setActiveInvoiceUq(null);
                    setActiveBar(null);
                    setListKey(k => k+1);
                } catch(e: any) { toast.error(e.message); }
                finally { setWorking(false); }
            }},
            cancel: { label: "Cancel", onClick: () => {} },
        });
    };

    const handleAddLine = useCallback(async (stockRow: any) => {
        if (!activeInvoiceUq) { toast.error("Select an invoice first"); return; }
        if (!isOpen) { toast.error("Invoice is closed or voided"); return; }
        setWorking(true);
        try {
            const r = await fetch("/api/pos/invoice/line", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    invoice_uq: activeInvoiceUq,
                    pk_sto_uq:  t(stockRow.UNICO),
                    product_uq: t(stockRow.PRODUCT_UQ ?? stockRow.BOX_PACK_UQ ?? ""),
                    box_qty:    1,
                    price:      parseFloat(stockRow.PRICE_X_UNIT ?? stockRow.SALES_PRICE ?? 0),
                }),
            });
            const j = await r.json();
            if (!r.ok || !j.success) throw new Error(j.error || "Failed");
            toast.success("Line added");
            setDetailKey(k => k+1);
            setMainTab("invoice");
        } catch(e: any) { toast.error(e.message); }
        finally { setWorking(false); }
    }, [activeInvoiceUq, isOpen]);

    // Fetches fresh stock row for one UNICO and patches stockRows in place
    const fetchLiveStock = useCallback(async (stockUq: string) => {
        try {
            const r = await fetch(`/api/pos/stock/uq?stock_uq=${encodeURIComponent(stockUq)}`);
            if (!r.ok) return null;
            const j = await r.json();
            const fresh = j.row;
            if (!fresh) return null;
            setLiveStockRow(fresh);
            setStockRows((prev: any[]) =>
                prev.map((row: any) => t(row.UNICO) === stockUq ? { ...row, ...fresh } : row)
            );
            return fresh;
        } catch { return null; }
    }, []);

    // Resolves the stock UNICO for a given row (stock mode: UNICO directly; lines mode: PK_STO_UQ)
    const resolveStockUq = useCallback((row: any, source: "stock" | "lines"): string => {
        return source === "stock" ? t(row.UNICO) : t(row.PK_STO_UQ ?? "");
    }, []);

    // Opens the product detail modal: fetches live stock + all product images
    const openStockModal = useCallback((row: any, source: "stock" | "lines", form: { box_qty: string; price: string }) => {
        setLiveStockRow(null);
        setModalImages([]);
        setModalImgIdx(0);
        setStockImageModal({ row, source });
        setStockImageForm(form);
        const stockUq  = resolveStockUq(row, source);
        if (stockUq) fetchLiveStock(stockUq);
        const productUq = t(row.PRODUCT_UQ ?? row.BOX_PACK_UQ ?? "");
        if (productUq) {
            fetch(`/api/products/images/product?uq=${encodeURIComponent(productUq)}`)
                .then(r => r.json())
                .then(j => { if (j.images?.length) setModalImages(j.images); })
                .catch(() => {});
        }
    }, [resolveStockUq, fetchLiveStock]);

    const handleAddLineFromModal = useCallback(async () => {
        const s = stockImageModal?.row;
        if (!s) return;
        if (!activeInvoiceUq) { toast.error("Select an invoice first"); return; }
        if (!isOpen) { toast.error("Invoice is closed or voided"); return; }
        const qty = parseInt(stockImageForm.box_qty) || 1;
        const price = parseFloat(stockImageForm.price) || 0;
        setWorking(true);
        try {
            const r = await fetch("/api/pos/invoice/line", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    invoice_uq: activeInvoiceUq,
                    pk_sto_uq:  t(s.UNICO),
                    product_uq: t(s.PRODUCT_UQ ?? s.BOX_PACK_UQ ?? ""),
                    box_qty:    qty,
                    price,
                }),
            });
            const j = await r.json();
            if (!r.ok || !j.success) throw new Error(j.error || "Failed");
            toast.success("Line added");
            setDetailKey(k => k+1);
            setMainTab("invoice");
            const stockUq = resolveStockUq(s, "stock");
            if (stockUq) fetchLiveStock(stockUq);
            setStockImageModal(null);
        } catch(e: any) { toast.error(e.message); }
        finally { setWorking(false); }
    }, [stockImageModal, stockImageForm, activeInvoiceUq, isOpen, resolveStockUq, fetchLiveStock]);

    const handleUpdateLineFromModal = useCallback(async () => {
        const l = stockImageModal?.row;
        if (!l) return;
        setSavingLine(true);
        try {
            const r = await fetch("/api/pos/invoice/line/update", {
                method: "PUT", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    inv_box_uq:  t(l.UNICO),
                    box_qty:     parseInt(stockImageForm.box_qty) || 1,
                    units_x_box: parseInt(l.UNITS_X_BOX) || 1,
                    price:       parseFloat(stockImageForm.price) || 0,
                    approved:    false,
                }),
            });
            const j = await r.json();
            if (!r.ok || !j.success) throw new Error(j.error || "Failed");
            toast.success("Line updated");
            setDetailKey(k => k + 1);
            const stockUq = resolveStockUq(l, "lines");
            if (stockUq) fetchLiveStock(stockUq);
            setStockImageModal(null);
        } catch(e: any) { toast.error(e.message); }
        finally { setSavingLine(false); }
    }, [stockImageModal, stockImageForm, resolveStockUq, fetchLiveStock]);

    const handleDeleteLine = useCallback((lineUnico: string) => {
        toast("Delete this line?", { duration: 8000,
            action: { label: "Delete", onClick: async () => {
                setWorking(true);
                try {
                    const r = await fetch("/api/pos/invoice/line/delete", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ unico: lineUnico }) });
                    const j = await r.json();
                    if (!r.ok || !j.success) throw new Error(j.error || "Failed");
                    toast.success("Line deleted");
                    setDetailKey(k => k+1);
                } catch(e: any) { toast.error(e.message); }
                finally { setWorking(false); }
            }},
            cancel: { label: "Cancel", onClick: () => {} },
        });
    }, []);

    // ── Barcode scan ──────────────────────────────────────────────────────────
    const handleBarcodeScan = useCallback(async () => {
        const code = scanInput.trim().toUpperCase();
        if (!code || !activeInvoiceUq) return;
        setScanning(true);
        setScanInput("");
        try {
            const r = await fetch("/api/pos/invoice/line/barcode", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ invoice_uq: activeInvoiceUq, barcode: code }),
            });
            const j = await r.json();
            const ok = r.ok && j.success;
            setScanLog(prev => [{ barcode: code, msg: j.warning || (ok ? "Added" : (j.error || "Failed")), ok }, ...prev.slice(0,19)]);
            if (ok) { setDetailKey(k => k+1); }
            else toast.error(j.error || "Scan failed");
        } catch(e: any) {
            setScanLog(prev => [{ barcode: code, msg: e.message, ok: false }, ...prev.slice(0,19)]);
        } finally {
            setScanning(false);
            scanInputRef.current?.focus();
        }
    }, [activeInvoiceUq, scanInput]);

    // ── Customer Call List (new invoice) ──────────────────────────────────────
    const openCcModal = () => { setCcModal(true); setCcStep(1); setCcSearch(""); setCcCustomers([]); setCcSelectedCustomer(null); setCcSelectedShipto(null); setCcSelectedCarrier(null); };
    const closeCcModal = () => setCcModal(false);

    const loadCcCustomers = useCallback(async (search: string, page = 1, append = false) => {
        setCcLoading(true);
        try {
            const r = await fetch(`/api/pos/customers?page=${page}&size=50&search=${encodeURIComponent(search)}&user_uq=${encodeURIComponent(userUq || "")}`);
            const j = await r.json();
            const rows = norm(Array.isArray(j.rows) ? j.rows : []);
            setCcTotal(j.total ?? 0);
            setCcCustomers(prev => append ? [...prev, ...rows] : rows);
            _setCcPage(page);
        } catch { /* ignore */ }
        finally { setCcLoading(false); }
    }, []);

    useEffect(() => {
        if (ccModal && ccStep === 1) {
            const t = setTimeout(() => loadCcCustomers(ccSearch), ccSearch ? 350 : 0);
            return () => clearTimeout(t);
        }
    }, [ccModal, ccStep, ccSearch, loadCcCustomers]);

    const selectCcCustomer = async (cust: any) => {
        setCcSelectedCustomer(cust);
        setCcStep(2);
        const r = await fetch(`/api/pos/shiptos?customer_uq=${t(cust.UNICO ?? cust.CUSTOMER_UQ)}`);
        const j = await r.json();
        const rows = norm(Array.isArray(j) ? j : []);
        setCcShiptos(rows);
        const def = rows.find((s: any) => bool(s.SHIPTO_DEFAULT ?? s.DEFAULT)) ?? rows[0];
        if (def) setCcSelectedShipto(def);
    };

    const selectCcShipto = async (shipto: any) => {
        setCcSelectedShipto(shipto);
        setCcStep(3);
        const custUq  = t(ccSelectedCustomer?.UNICO ?? ccSelectedCustomer?.CUSTOMER_UQ ?? "");
        const shiptoUq = t(shipto.UNICO ?? "");
        const r = await fetch(`/api/pos/shipto-carriers?customer_uq=${custUq}&shipto_uq=${shiptoUq}`);
        const j = await r.json();
        const rows = norm(Array.isArray(j) ? j : []);
        setCcCarriers(rows);
        const def = rows[0];
        if (def) setCcSelectedCarrier(def);
    };

    const handleCreateInvoice = async () => {
        if (!ccSelectedCustomer || !salesmanUq) return;
        setCcCreating(true);
        try {
            const r = await fetch("/api/pos/invoice/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customer_uq: t(ccSelectedCustomer.UNICO ?? ccSelectedCustomer.CUSTOMER_UQ),
                    salesman_uq: salesmanUq,
                    date:        ccDate,
                }),
            });
            const j = await r.json();
            if (!r.ok || !j.success) throw new Error(j.error || "Failed");
            toast.success("Invoice created");
            setActiveInvoiceUq(j.unico);
            setInvoiceDate(ccDate);
            setListKey(k => k+1);
            setDetailKey(k => k+1);
            setMainTab("invoice");
            closeCcModal();
        } catch(e: any) { toast.error(e.message); }
        finally { setCcCreating(false); }
    };

    const goToHistory = useCallback(() => {
        if (h?.CUSTOMER_UQ) setHistCustUq(t(h.CUSTOMER_UQ));
        if (h?.CUSTOMER) setHistCustSearch(t(h.CUSTOMER));
        const today = new Date();
        const to = today.toISOString().split("T")[0];
        const from30 = new Date(today); from30.setDate(from30.getDate() - 30);
        setHistFrom(from30.toISOString().split("T")[0]);
        setHistTo(to);
        setHistInvoiceUq(null);
        setMainTab("history");
    }, [h]);

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col bg-[#f4f6f8] font-sans text-[#333] xl:h-[100dvh] xl:overflow-hidden">

            <AppHeader
                title="P.O.S."
                icon={ShoppingCart}
                extraRight={
                    (working || loadingHeader || loadingLines) ? (
                        <Loader2 size={13} className="animate-spin text-[#FB7506]" />
                    ) : null
                }
            />

            {/* ── Main area ────────────────────────────────────────────── */}
            <div className="flex flex-col xl:flex-1 xl:overflow-hidden xl:min-h-0 px-2 pb-2 pt-2 gap-2">

                {/* Top-level tab bar */}
                <div className="bg-white h-10 px-3 flex items-stretch shrink-0 rounded-md overflow-x-auto border border-gray-200">
                    {(["invoice", "stock", "history"] as const).map(tab => (
                        <button key={tab} onClick={() => setMainTab(tab)}
                            className={cn(
                                "px-4 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-b-2 flex items-center",
                                mainTab === tab ? "text-[#374151] border-[#FB7506]" : "text-gray-400 hover:text-gray-700 border-transparent"
                            )}
                        >
                            {tab === "invoice" && "Invoice"}
                            {tab === "stock"   && "Available Stock"}
                            {tab === "history" && "Invoice History"}
                        </button>
                    ))}
                </div>

                {/* ── TAB 1: Invoice ────────────────────────────────────── */}
                {mainTab === "invoice" && (
                <div className="flex flex-col xl:flex-row xl:flex-1 xl:overflow-hidden xl:min-h-0 gap-2">

                {/* LEFT: Invoice list — desktop only */}
                <div className="hidden xl:flex xl:flex-col bg-white rounded-md border border-black overflow-hidden xl:w-[300px] xl:shrink-0 xl:flex-none">
                    {/* List header */}
                    <div className="bg-[#374151] px-3 h-10 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                            <ClipboardList size={12} className="text-[#FB7506]" />
                            <span className="font-black text-[10px] text-white uppercase tracking-widest">Invoices</span>
                            {loadingList && <RefreshCcw size={10} className="animate-spin text-gray-400" />}
                        </div>
                        <input type="date" value={invoiceDate} onChange={e => { setInvoiceDate(e.target.value); setListKey(k=>k+1); }}
                            className="text-[10px] font-bold bg-white/10 text-white rounded px-1.5 py-0.5 border border-white/20 focus:outline-none focus:border-[#FB7506]"
                        />
                    </div>

                    {/* My / All toggle + New Invoice */}
                    <div className="px-2 py-1.5 border-b border-gray-100 shrink-0 flex flex-col gap-1.5">
                        <div className="flex items-center bg-gray-100 rounded p-0.5">
                            <button onClick={() => setMyInvoices(true)}
                                className={cn("flex-1 py-1 rounded text-[10px] font-black uppercase tracking-widest transition-all",
                                    myInvoices ? "bg-[#FB7506] text-white shadow-sm" : "text-gray-500 hover:text-gray-800")}>
                                My Invoices
                            </button>
                            <button onClick={() => setMyInvoices(false)}
                                className={cn("flex-1 py-1 rounded text-[10px] font-black uppercase tracking-widest transition-all",
                                    !myInvoices ? "bg-[#FB7506] text-white shadow-sm" : "text-gray-500 hover:text-gray-800")}>
                                All
                            </button>
                        </div>
                        <button onClick={openCcModal}
                            className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-black uppercase tracking-widest bg-green-600 hover:bg-green-500 text-white rounded transition-all">
                            <Plus size={11} /> New Invoice
                        </button>
                    </div>
                    {/* Search */}
                    <div className="px-2 py-1.5 border-b border-gray-100 shrink-0">
                        <div className="flex items-center gap-1.5 bg-gray-100 rounded px-2 py-1">
                            <Search size={11} className="text-gray-400 shrink-0" />
                            <input
                                value={listSearch} onChange={e => setListSearch(e.target.value)}
                                placeholder="Customer or invoice #..."
                                className="flex-1 text-[11px] bg-transparent focus:outline-none text-gray-700 placeholder-gray-400"
                            />
                            {listSearch && <button onClick={() => setListSearch("")}><X size={10} className="text-gray-400 hover:text-gray-600" /></button>}
                        </div>
                    </div>

                    {/* Invoice list — card style */}
                    <div className="flex-1 overflow-auto min-h-0 p-2 flex flex-col gap-1.5">
                        {(invoiceList as any[]).length === 0 && !loadingList && (
                            <div className="p-6 text-center text-gray-400 italic text-[11px]">No invoices for this date</div>
                        )}
                        {(invoiceList as any[])
                          .filter((inv: any) => {
                              if (!listSearch.trim()) return true;
                              const q = listSearch.toLowerCase();
                              return t(inv.CUSTOMER).toLowerCase().includes(q) ||
                                     t(inv.INVOICE_NO).toString().includes(q);
                          })
                          .map((inv: any, i: number) => {
                            const sel  = t(inv.UNICO) === activeInvoiceUq;
                            const bg   = vfpRowStyle(inv.BACK_COLOR ?? inv.BACKCOLOR);
                            const voi  = bool(inv.VOID);
                            const closed = bool(inv.PRINTED);
                            return (
                                <div key={i} onClick={() => { setActiveInvoiceUq(t(inv.UNICO)); setDetailKey(k=>k+1); setHistCustUq(t(inv.CUSTOMER_UQ ?? "%")); setHistInvoiceUq(null); setActiveBar("invoice"); }}
                                    className={cn(
                                        "border-2 rounded-xl p-2.5 cursor-pointer transition-all",
                                        sel ? "border-[#FB7506] bg-orange-50 shadow-md" : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                                    )}
                                    style={!sel && bg ? bg : undefined}
                                >
                                    <div className="flex items-center justify-between gap-1">
                                        <span className={cn("font-black text-[13px]", sel ? "text-[#FB7506]" : "text-blue-700")}>
                                            #{t(inv.INVOICE_NO)}
                                        </span>
                                        <StatusBadge printed={closed} voided={voi} />
                                    </div>
                                    <p className="text-[11px] font-semibold text-gray-700 truncate mt-0.5">{t(inv.CUSTOMER)}</p>
                                    <p className="text-[9px] text-gray-400 mt-0.5">{fmtDate(inv.INVOICE_DATE ?? inv.SHIP_DATE)}</p>
                                    {sel && h && (
                                        <div className="flex items-center gap-3 mt-1.5 pt-1.5 border-t border-orange-200">
                                            <span className="text-[9px] text-gray-500">Cases: <span className="font-black text-gray-800">{fmtI(h.TOTAL_CASES)}</span></span>
                                            <span className="text-[9px] text-gray-500">Total: <span className="font-black text-green-700">${fmt(h.TOTAL_INVOICE)}</span></span>
                                            {parseFloat(h.INVOICE_BALANCE ?? 0) > 0 && (
                                                <span className="text-[9px] text-gray-500">Bal: <span className="font-black text-red-600">${fmt(h.INVOICE_BALANCE)}</span></span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* RIGHT: Invoice detail */}
                <div className="flex flex-col overflow-hidden h-[calc(100svh-7.5rem)] xl:flex-1 xl:min-h-0 xl:min-w-0">
                    {!activeInvoiceUq ? (
                        <div className="flex items-center justify-center bg-white rounded-md border border-black h-full">
                            <div className="text-center text-gray-400 px-6">
                                <ShoppingCart size={48} className="mx-auto mb-4 opacity-20" />
                                <p className="text-sm font-bold uppercase tracking-widest">No invoice selected</p>
                                <p className="text-xs mt-1">Select an invoice to view details</p>
                                <button onClick={() => setListModal(true)}
                                    className="xl:hidden mt-5 flex items-center gap-2 mx-auto px-5 py-2.5 bg-[#374151] hover:bg-gray-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-md">
                                    <ClipboardList size={14} />Select Invoice
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col flex-1 min-h-0 xl:min-w-0 gap-2">
                            {/* Invoice Header card */}
                            <div className="bg-white rounded-md border border-black overflow-hidden shrink-0">
                                {/* Action bar */}
                                <div className="bg-[#374151] h-12 xl:h-10 px-3 flex items-center gap-1.5 shrink-0 overflow-x-auto scrollbar-none">
                                    <ShoppingCart size={12} className="text-[#FB7506] shrink-0" />
                                    <span className="font-black text-[10px] text-white uppercase tracking-widest shrink-0">Invoice</span>
                                    <div className="w-px h-4 bg-white/20 shrink-0 mx-1" />
                                    {isOpen && <>
                                        <ActionBtn icon={Lock}    label="Close"       onClick={handleCloseInvoice} disabled={working} variant="bar" />
                                        <ActionBtn icon={XCircle} label="Void"        onClick={handleVoidInvoice}  disabled={working} variant="orange" />
                                        {canDelete && <ActionBtn icon={Trash2} label="Delete" onClick={handleDeleteInvoice} disabled={working} variant="orange" />}
                                        <ActionBtn icon={Edit2}   label="Edit Header" onClick={() => {}} variant="bar" />
                                    </>}
                                    {isClosed && <>
                                        <ActionBtn icon={Unlock}     label="Open"      onClick={handleOpenInvoice}  disabled={working} variant="bar" />
                                        <div className="w-px h-4 bg-white/20 shrink-0" />
                                        <ActionBtn icon={Printer}    label="Print"     onClick={() => {}} variant="bar" />
                                        <ActionBtn icon={FileText}   label="Pick List" onClick={() => {}} variant="bar" />
                                        <ActionBtn icon={CreditCard} label="Payment"   onClick={() => {}} variant="bar" />
                                    </>}
                                    <div className="ml-auto flex items-center gap-1 shrink-0">
                                        <button onClick={goToHistory} className="text-white hover:text-[#FB7506] transition-all p-1" title="Invoice History">
                                            <History size={15} />
                                        </button>
                                        <button className="text-white hover:text-[#FB7506] transition-all p-1" title="Transaction Log">
                                            <RotateCcw size={15} />
                                        </button>
                                    </div>
                                </div>
                                {/* Header fields */}
                                {h && (
                                    <div className="px-4 py-2.5 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 text-[11px]">
                                        <div className="col-span-2 sm:col-span-4 flex items-center gap-3 pb-1.5 border-b border-gray-100">
                                            <span className="font-black text-[14px] text-blue-700">Invoice #{t(h.INVOICE_NO)}</span>
                                            <StatusBadge printed={bool(h.PRINTED)} voided={bool(h.VOID)} />
                                            <span className="text-gray-500 text-[11px]">{fmtDate(h.INVOICE_DATE)}</span>
                                            {loadingHeader && <Loader2 size={11} className="animate-spin text-gray-400 ml-auto" />}
                                        </div>
                                        <div className="col-span-2"><span className="font-bold text-gray-500">Customer:</span> <span className="font-black text-gray-800">{t(h.CUSTOMER)}</span></div>
                                        <div><span className="font-bold text-gray-500">Sales Rep:</span> <span>{t(h.SALESMAN_NAME)}</span></div>
                                        <div><span className="font-bold text-gray-500">Carrier:</span> <span>{t(h.CARRIER)}</span></div>
                                        <div><span className="font-bold text-gray-500">Ship to:</span> <span>{t(h.SHIP_NAME)}</span></div>
                                        <div><span className="font-bold text-gray-500">Address:</span> <span className="truncate">{t(h.SHIP_ADDRESS)} {t(h.SHIP_CITY)}, {t(h.SHIP_STATE)} {t(h.SHIP_ZIP)}</span></div>
                                        <div><span className="font-bold text-gray-500">PO#:</span> <span>{t(h.CPORDER_NO)}</span></div>
                                        <div><span className="font-bold text-gray-500">Zone:</span> <span>{t(h.ZONE)}</span></div>
                                        <div className="col-span-2 sm:col-span-4 flex gap-6 pt-1.5 border-t border-gray-100">
                                            <div><span className="font-bold text-gray-500">Cases:</span> <span className="font-black text-gray-800">{fmtI(h.TOTAL_CASES)}</span></div>
                                            <div><span className="font-bold text-gray-500">Total:</span> <span className="font-black text-green-700">${fmt(h.TOTAL_INVOICE)}</span></div>
                                            <div><span className="font-bold text-gray-500">Balance:</span> <span className={cn("font-black", parseFloat(h.INVOICE_BALANCE ?? 0) > 0 ? "text-red-600" : "text-green-600")}>${fmt(h.INVOICE_BALANCE)}</span></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Invoice Lines */}
                            <div className="flex-1 flex flex-col bg-white rounded-md border border-black overflow-hidden min-h-0">
                                {/* Lines action bar */}
                                <div className="bg-[#374151] h-12 xl:h-10 px-3 flex items-center gap-1.5 shrink-0">
                                    <ClipboardList size={12} className="text-[#FB7506] shrink-0" />
                                    <span className="font-black text-[10px] text-white uppercase tracking-widest shrink-0">Invoice Lines</span>
                                    {isOpen && <>
                                        <div className="w-px h-4 bg-white/20 shrink-0 mx-1" />
                                        <ActionBtn icon={Plus} label="+ Add from Stock" onClick={() => setMainTab("stock")} size="sm" variant="success" />
                                        <ActionBtn icon={Scan} label="Barcode" onClick={() => { setScanModal(true); setTimeout(() => scanInputRef.current?.focus(), 100); }} size="sm" variant="bar" />
                                    </>}
                                </div>
                                {/* Lines table */}
                                <div className="flex-1 overflow-auto min-h-0">
                                        <PanelGridTable>
                                            <PanelGridThead>
                                                <PanelGridTh>{""}</PanelGridTh>
                                                <PanelGridTh>Farm</PanelGridTh>
                                                <PanelGridTh>Description</PanelGridTh>
                                                <PanelGridTh>Vendor</PanelGridTh>
                                                <PanelGridTh align="right">BoxQty</PanelGridTh>
                                                <PanelGridTh align="right">UxBox</PanelGridTh>
                                                <PanelGridTh align="right">Price</PanelGridTh>
                                                <PanelGridTh align="right">T.Units</PanelGridTh>
                                                <PanelGridTh align="right">Ext.Price</PanelGridTh>
                                                <PanelGridTh align="right">GPM%</PanelGridTh>
                                                <PanelGridTh>Case</PanelGridTh>
                                                <PanelGridTh>Lot</PanelGridTh>
                                                <PanelGridTh>AWB</PanelGridTh>
                                                <PanelGridTh>Days</PanelGridTh>
                                                <PanelGridTh align="center">Ready</PanelGridTh>
                                                <PanelGridTh align="center">Appr.</PanelGridTh>
                                                {isOpen && <PanelGridTh>{""}</PanelGridTh>}
                                            </PanelGridThead>
                                            <PanelGridTbody>
                                                {loadingLines && <PanelGridTr><PanelGridTd colSpan={16} className="py-6 text-center italic"><Loader2 size={13} className="animate-spin inline mr-1" />Loading...</PanelGridTd></PanelGridTr>}
                                                {!loadingLines && (invoiceLines as any[]).length === 0 && <PanelGridTr><PanelGridTd colSpan={16} className="py-8 text-center italic">No lines — add from Available Stock</PanelGridTd></PanelGridTr>}
                                                {(invoiceLines as any[]).map((l: any, i: number) => (
                                                    <PanelGridTr key={i} style={vfpRowStyle(l.BACK_COLOR ?? l.BACKCOLOR)}>
                                                        <PanelGridTd>
                                                            <img
                                                                src={productImages[t(l.PRODUCT_UQ)] || DEFAULT_THUMB}
                                                                alt="" width={32} height={32}
                                                                className={cn("w-8 h-8 object-cover rounded border border-gray-200 shrink-0 transition-all", isOpen && "cursor-pointer hover:opacity-80 hover:ring-2 hover:ring-[#FB7506]")}
                                                                onError={e => { (e.target as HTMLImageElement).src = DEFAULT_THUMB; }}
                                                                onClick={isOpen ? () => openStockModal(l, "lines", { box_qty: String(l.BOX_QTY ?? 1), price: String(parseMoney(l.PRICE ?? 0)) }) : undefined}
                                                            />
                                                        </PanelGridTd>
                                                        <PanelGridTd className="font-bold text-[#FB7506]">{t(l.FARM)}</PanelGridTd>
                                                        <PanelGridTd className="max-w-[200px] truncate font-medium">{t(l.DESCRIPTION)}</PanelGridTd>
                                                        <PanelGridTd className="max-w-[100px] truncate">{t(l.GROWER)}</PanelGridTd>
                                                        <PanelGridTd align="right" className="font-semibold">{fmtI(l.BOX_QTY)}</PanelGridTd>
                                                        <PanelGridTd align="right">{fmtI(l.UNITS_X_BOX)}</PanelGridTd>
                                                        <PanelGridTd align="right" className="font-semibold">${fmt(l.PRICE)}</PanelGridTd>
                                                        <PanelGridTd align="right">{fmtI(l.TOTAL_UNITS)}</PanelGridTd>
                                                        <PanelGridTd align="right" className="font-bold text-green-700">{t(l.EXT_PRICE)}</PanelGridTd>
                                                        <PanelGridTd align="right" className={cn("font-bold", parseMoney(l.GPM) < 0 ? "text-red-600" : "")}>{fmt(l.GPM)}%</PanelGridTd>
                                                        <PanelGridTd>{t(l.CASE_NAME ?? l.CASE_SH)}</PanelGridTd>
                                                        <PanelGridTd>{t(l.LOTE)}</PanelGridTd>
                                                        <PanelGridTd className="font-mono text-blue-700">{t(l.AWBCODE)}</PanelGridTd>
                                                        <PanelGridTd>{fmtI(l.DAYS)}</PanelGridTd>
                                                        <PanelGridTd align="center">{bool(l.READY_TRAN) ? <Check size={11} className="text-green-600 inline" /> : ""}</PanelGridTd>
                                                        <PanelGridTd align="center">{bool(l.APPROVED) ? <CheckCircle size={11} className="text-green-600 inline" /> : <AlertCircle size={11} className="text-amber-500 inline" />}</PanelGridTd>
                                                        {isOpen && <PanelGridTd>
                                                            <div className="flex items-center gap-1">
                                                                <button onClick={() => openEditLine(l)} disabled={working} className="text-blue-400 hover:text-blue-600 disabled:opacity-40 p-0.5" title="Edit"><Edit2 size={11} /></button>
                                                                <button onClick={() => handleDeleteLine(t(l.UNICO))} disabled={working} className="text-red-400 hover:text-red-600 disabled:opacity-40 p-0.5" title="Delete"><Trash2 size={11} /></button>
                                                            </div>
                                                        </PanelGridTd>}
                                                    </PanelGridTr>
                                                ))}
                                            </PanelGridTbody>
                                        </PanelGridTable>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                </div>
                )}

                {/* ── TAB 2: Available Stock ────────────────────────────── */}
                {mainTab === "stock" && (
                <div className="flex flex-col xl:flex-1 xl:overflow-hidden xl:min-h-0 gap-2 h-[calc(100svh-7.5rem)] xl:h-auto">
                    {activeInvoiceUq && h && (
                        <>
                            {/* Mobile: invoice summary card */}
                            <div className="xl:hidden bg-white border border-gray-200 rounded-xl p-3 shrink-0 shadow-sm">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <ShoppingCart size={14} className="text-[#FB7506] shrink-0" />
                                        <span className="font-black text-[14px] text-blue-700 shrink-0">Invoice #{t(h.INVOICE_NO)}</span>
                                        <StatusBadge printed={bool(h.PRINTED)} voided={bool(h.VOID)} />
                                    </div>
                                    <span className="text-[10px] text-gray-400 shrink-0">{fmtDate(h.INVOICE_DATE)}</span>
                                </div>
                                <p className="font-semibold text-[12px] text-gray-700 mt-1 truncate">{t(h.CUSTOMER)}</p>
                                <div className="flex items-center gap-4 mt-1.5">
                                    <span className="text-[11px] text-gray-500">Cases: <span className="font-black text-gray-800">{fmtI(h.TOTAL_CASES)}</span></span>
                                    <span className="text-[11px] text-gray-500">Total: <span className="font-black text-green-700">${fmt(h.TOTAL_INVOICE)}</span></span>
                                </div>
                            </div>
                            {/* Desktop: dark bar */}
                            <div className="hidden xl:flex bg-[#374151] h-10 px-3 items-center gap-4 shrink-0 rounded-md overflow-x-auto scrollbar-none">
                                <span className="text-white font-black text-[10px] uppercase tracking-widest shrink-0">Invoice #{t(h.INVOICE_NO)}</span>
                                <span className="text-white/70 text-[10px] shrink-0 max-w-[200px] truncate">{t(h.CUSTOMER)}</span>
                                <span className="text-white/50 text-[10px] shrink-0">{fmtDate(h.INVOICE_DATE)}</span>
                                <div className="w-px h-4 bg-white/20 shrink-0" />
                                <span className="text-white/70 text-[10px] shrink-0">Cases: <span className="text-white font-black">{fmtI(h.TOTAL_CASES)}</span></span>
                                <span className="text-white/70 text-[10px] shrink-0">Total: <span className="text-green-400 font-black">${fmt(h.TOTAL_INVOICE)}</span></span>
                                <StatusBadge printed={bool(h.PRINTED)} voided={bool(h.VOID)} />
                            </div>
                        </>
                    )}
                    <div className="flex flex-col bg-white rounded-md border border-black overflow-hidden flex-1 min-h-0">
                        <div className="bg-[#374151] h-12 xl:h-10 px-3 flex items-center gap-2 shrink-0">
                            <Package size={12} className="text-[#FB7506] shrink-0" />
                            <span className="font-black text-[10px] text-white uppercase tracking-widest shrink-0">Available Stock</span>
                            <span className="text-[10px] text-white/50 font-bold shrink-0">{stockRows.length}/{stockTotal}</span>
                            <div className="flex items-center gap-1 bg-white/10 border border-white/20 rounded px-2 py-1 ml-2">
                                <Search size={10} className="text-white/50 shrink-0" />
                                <input value={stockSearch} onChange={e => setStockSearch(e.target.value)}
                                    onKeyDown={e => { if (e.key === "Enter") { setAppliedStockSearch(stockSearch); setStockPage(1); }}}
                                    placeholder="Search stock..." className="text-[10px] focus:outline-none w-36 bg-transparent text-white placeholder-white/40 font-bold" />
                                {stockSearch && <button onClick={() => { setStockSearch(""); setAppliedStockSearch(""); }}><X size={10} className="text-white/60" /></button>}
                            </div>
                        </div>
                        {/* ── Mobile cards (below xl) ── */}
                        <div className="xl:hidden flex-1 overflow-auto min-h-0 p-2 flex flex-col gap-2">
                            {stockLoading && stockRows.length === 0 && (
                                <div className="flex items-center justify-center py-12 text-gray-400 italic text-[11px]">
                                    <Loader2 size={14} className="animate-spin mr-1" />Loading...
                                </div>
                            )}
                            {!stockLoading && stockRows.length === 0 && (
                                <div className="flex items-center justify-center py-12 text-gray-400 italic text-[11px]">No stock available</div>
                            )}
                            {stockRows.map((s: any, i: number) => (
                                <div key={i} className="bg-white border border-gray-200 rounded-xl flex gap-3 p-3 shadow-sm"
                                    style={vfpRowStyle(s.BACK_COLOR ?? s.BACKCOLOR)}>
                                    <img
                                        src={productImages[t(s.PRODUCT_UQ ?? s.BOX_PACK_UQ ?? "")] || DEFAULT_THUMB}
                                        alt="" width={72} height={72}
                                        className="w-[72px] h-[72px] object-cover rounded-lg border border-gray-200 shrink-0 cursor-pointer hover:opacity-80 hover:ring-2 hover:ring-[#FB7506] transition-all"
                                        onError={e => { (e.target as HTMLImageElement).src = DEFAULT_THUMB; }}
                                        onClick={() => openStockModal(s, "stock", { box_qty: "1", price: fmt(s.PRICE_X_UNIT ?? 0) })}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="font-black text-[13px] text-gray-800 leading-snug line-clamp-2 flex-1">{t(s.DESCRIPTION)}</p>
                                            {isOpen && (
                                                <button onClick={() => handleAddLine(s)} disabled={working}
                                                    className="shrink-0 flex items-center gap-1 px-3 py-1.5 text-[10px] font-black bg-[#FB7506] hover:bg-orange-500 text-white rounded-lg disabled:opacity-40 transition-all">
                                                    <Plus size={11} />Add
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="font-black text-[11px] text-[#FB7506]">{t(s.FARM)}</span>
                                            <span className="text-[10px] text-gray-400 truncate">{t(s.GROWER)}</span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                            <span className="text-[13px] font-black text-green-700">${fmt(s.PRICE_X_UNIT)}</span>
                                            <span className="text-[10px] text-gray-500">Stock: <span className="font-black text-gray-800">{fmtI(s.WH_STOCK)}</span></span>
                                            <span className="text-[10px] text-gray-500">Days: <span className="font-bold">{fmtI(s.DAYS)}</span></span>
                                            <span className="text-[10px] text-gray-400 font-mono">{fmtDate(s.BOX_DATE)}</span>
                                            <span className={cn("text-[10px] font-bold", parseFloat(s.GPROFIT ?? 0) < 0 ? "text-red-500" : "text-gray-400")}>
                                                GPM {fmt(s.GPROFIT)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={sentinelRef} className="flex items-center justify-center py-4 text-[10px] text-gray-400">
                                {stockLoading && stockRows.length > 0 && <><Loader2 size={12} className="animate-spin mr-1" />Loading more...</>}
                                {!stockLoading && !stockHasMore && stockRows.length > 0 && <span className="italic">All {stockTotal.toLocaleString()} items loaded</span>}
                            </div>
                        </div>

                        {/* ── Desktop table (xl+) ── */}
                        <div className="hidden xl:block xl:flex-1 xl:overflow-auto xl:min-h-0">
                            <PanelGridTable>
                                <PanelGridThead>
                                    {[
                                        { col: "", label: "" },
                                        { col: "", label: isOpen ? "Add" : "" },
                                        { col: "description",  label: "Description" },
                                        { col: "farm",         label: "Farm" },
                                        { col: "grower",       label: "Vendor" },
                                        { col: "box_date",     label: "Date" },
                                        { col: "days",         label: "Days" },
                                        { col: "awbcode",      label: "AWB" },
                                        { col: "bunches_case", label: "Bch/Case" },
                                        { col: "units_bunch",  label: "U/Bch" },
                                        { col: "tunits_x_box", label: "U/Box" },
                                        { col: "total_units",  label: "T.Units" },
                                        { col: "price_x_unit", label: "Price" },
                                        { col: "wh_stock",     label: "Stock" },
                                        { col: "case_sh",      label: "Case" },
                                        { col: "gprofit",      label: "GPM%" },
                                        { col: "box_id",       label: "BoxID" },
                                    ].map(({ col, label }) => (
                                        <PanelGridTh key={col + label}
                                            className={cn(col && "cursor-pointer hover:bg-gray-50 select-none")}
                                            onClick={col ? () => toggleStockSort(col) : undefined}>
                                            {label}{stockSortCol === col && <span className="ml-1">{stockSortDir === "ASC" ? "↑" : "↓"}</span>}
                                        </PanelGridTh>
                                    ))}
                                </PanelGridThead>
                                <PanelGridTbody>
                                    {stockLoading && stockRows.length === 0 && <PanelGridTr><PanelGridTd colSpan={17} className="py-8 text-center italic"><Loader2 size={13} className="animate-spin inline mr-1" />Loading...</PanelGridTd></PanelGridTr>}
                                    {!stockLoading && stockRows.length === 0 && <PanelGridTr><PanelGridTd colSpan={17} className="py-8 text-center italic">No stock available</PanelGridTd></PanelGridTr>}
                                    {stockRows.map((s: any, i: number) => (
                                        <PanelGridTr key={i} style={vfpRowStyle(s.BACK_COLOR ?? s.BACKCOLOR)}>
                                            <PanelGridTd>
                                                <img
                                                    src={productImages[t(s.PRODUCT_UQ ?? s.BOX_PACK_UQ ?? "")] || DEFAULT_THUMB}
                                                    alt="" width={32} height={32}
                                                    className="w-8 h-8 object-cover rounded border border-gray-200 shrink-0 cursor-pointer hover:opacity-80 hover:ring-2 hover:ring-[#FB7506] transition-all"
                                                    onError={e => { (e.target as HTMLImageElement).src = DEFAULT_THUMB; }}
                                                    onClick={() => openStockModal(s, "stock", { box_qty: "1", price: fmt(s.PRICE_X_UNIT ?? 0) })}
                                                />
                                            </PanelGridTd>
                                            <PanelGridTd>
                                                {isOpen && <button onClick={() => handleAddLine(s)} disabled={working} className="flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-black bg-[#FB7506] hover:bg-orange-500 text-white rounded disabled:opacity-40"><Plus size={9} />Add</button>}
                                            </PanelGridTd>
                                            <PanelGridTd className="max-w-[200px] truncate font-medium">{t(s.DESCRIPTION)}</PanelGridTd>
                                            <PanelGridTd className="font-bold text-[#FB7506]">{t(s.FARM)}</PanelGridTd>
                                            <PanelGridTd className="max-w-[100px] truncate">{t(s.GROWER)}</PanelGridTd>
                                            <PanelGridTd>{fmtDate(s.BOX_DATE)}</PanelGridTd>
                                            <PanelGridTd align="right">{fmtI(s.DAYS)}</PanelGridTd>
                                            <PanelGridTd className="font-mono text-blue-700">{t(s.AWBCODE)}</PanelGridTd>
                                            <PanelGridTd align="right">{fmtI(s.BUNCHES_CASE)}</PanelGridTd>
                                            <PanelGridTd align="right">{fmtI(s.UNITS_BUNCH)}</PanelGridTd>
                                            <PanelGridTd align="right" className="font-semibold">{fmtI(s.TUNITS_X_BOX)}</PanelGridTd>
                                            <PanelGridTd align="right">{fmtI(s.TOTAL_UNITS)}</PanelGridTd>
                                            <PanelGridTd align="right" className="font-black text-green-700">${fmt(s.PRICE_X_UNIT)}</PanelGridTd>
                                            <PanelGridTd align="right" className="font-bold">{fmtI(s.WH_STOCK)}</PanelGridTd>
                                            <PanelGridTd>{t(s.CASE_SH ?? s.CASE_NAME)}</PanelGridTd>
                                            <PanelGridTd align="right" className={cn("font-bold", parseFloat(s.GPROFIT ?? 0) < 0 ? "text-red-600" : "")}>{fmt(s.GPROFIT)}%</PanelGridTd>
                                            <PanelGridTd className="font-mono text-[10px]">{t(s.BOX_ID)}</PanelGridTd>
                                        </PanelGridTr>
                                    ))}
                                    <PanelGridTr>
                                        <PanelGridTd colSpan={17}>
                                            <div ref={sentinelRef} className="flex items-center justify-center py-3 text-[10px] text-gray-400">
                                                {stockLoading && stockRows.length > 0 && <><Loader2 size={12} className="animate-spin mr-1" />Loading more...</>}
                                                {!stockLoading && !stockHasMore && stockRows.length > 0 && <span className="italic">All {stockTotal.toLocaleString()} items loaded</span>}
                                            </div>
                                        </PanelGridTd>
                                    </PanelGridTr>
                                </PanelGridTbody>
                            </PanelGridTable>
                        </div>
                    </div>
                </div>
                )}

                {/* ── TAB 3: Invoice History ─────────────────────────────── */}
                {mainTab === "history" && (
                <div className="flex flex-col xl:flex-1 xl:overflow-hidden xl:min-h-0 gap-2 h-[calc(100svh-7.5rem)] xl:h-auto">

                    {/* Filter card — mobile */}
                    <div className="xl:hidden bg-white border border-gray-200 rounded-xl p-3 shrink-0 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <History size={14} className="text-[#FB7506] shrink-0" />
                            <span className="font-black text-[12px] text-gray-800 uppercase tracking-widest flex-1 truncate">
                                {histCustSearch || "All Customers"}
                            </span>
                            <button onClick={() => qc.invalidateQueries({ queryKey: ["pos-hist-list", histCustUq, histFrom, histTo, salesmanUq] })}
                                className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-black bg-[#374151] hover:bg-gray-600 text-white rounded-lg transition-all shrink-0">
                                <Search size={10} />Search
                            </button>
                        </div>
                        <input value={histCustSearch} onChange={e => setHistCustSearch(e.target.value)}
                            placeholder="All customers..."
                            className="w-full text-[12px] bg-gray-100 text-gray-800 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#FB7506] placeholder-gray-400 font-semibold mb-2" />
                        <div className="flex items-center gap-2">
                            <div className="flex-1 flex flex-col gap-0.5">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">From</span>
                                <input type="date" value={histFrom} onChange={e => setHistFrom(e.target.value)}
                                    className="text-[11px] bg-gray-100 text-gray-700 border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#FB7506] font-bold w-full" />
                            </div>
                            <div className="flex-1 flex flex-col gap-0.5">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">To</span>
                                <input type="date" value={histTo} onChange={e => setHistTo(e.target.value)}
                                    className="text-[11px] bg-gray-100 text-gray-700 border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#FB7506] font-bold w-full" />
                            </div>
                        </div>
                    </div>

                    {/* Filter bar — desktop */}
                    <div className="hidden xl:flex bg-[#374151] h-10 px-3 items-center gap-3 shrink-0 rounded-md overflow-x-auto scrollbar-none">
                        <span className="text-[10px] font-black text-white/60 uppercase tracking-widest shrink-0">Customer:</span>
                        <input value={histCustSearch} onChange={e => setHistCustSearch(e.target.value)}
                            placeholder="All customers"
                            className="text-[10px] bg-white/10 text-white border border-white/20 rounded px-2 py-1 focus:outline-none w-40 placeholder-white/40 font-bold" />
                        <span className="text-[10px] font-black text-white/60 uppercase tracking-widest shrink-0">From:</span>
                        <input type="date" value={histFrom} onChange={e => setHistFrom(e.target.value)} className="text-[10px] bg-white/10 text-white border border-white/20 rounded px-2 py-1 focus:outline-none font-bold" />
                        <span className="text-[10px] font-black text-white/60 uppercase tracking-widest shrink-0">To:</span>
                        <input type="date" value={histTo} onChange={e => setHistTo(e.target.value)} className="text-[10px] bg-white/10 text-white border border-white/20 rounded px-2 py-1 focus:outline-none font-bold" />
                        <button onClick={() => qc.invalidateQueries({ queryKey: ["pos-hist-list", histCustUq, histFrom, histTo, salesmanUq] })}
                            className="flex items-center gap-1 px-2 py-1 text-[10px] font-black bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded transition-all">
                            <Search size={10} />Search
                        </button>
                    </div>

                    {/* Mobile: INVOICES / STATEMENT sub-tabs */}
                    <div className="xl:hidden flex items-center bg-gray-100 rounded-lg p-0.5 shrink-0">
                        <button onClick={() => setHistView("invoices")}
                            className={cn("flex-1 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all",
                                histView === "invoices" ? "bg-white text-[#374151] shadow-sm" : "text-gray-400")}>
                            Invoices {(histInvoices as any[]).length > 0 && `(${(histInvoices as any[]).length})`}
                        </button>
                        <button onClick={() => setHistView("statement")}
                            className={cn("flex-1 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all",
                                histView === "statement" ? "bg-white text-[#374151] shadow-sm" : "text-gray-400")}>
                            Statement
                        </button>
                    </div>

                    {/* Mobile: expandable invoice cards */}
                    {histView === "invoices" && (
                    <div className="xl:hidden flex-1 overflow-auto flex flex-col gap-2 min-h-0">
                        {!loadingHistList && (histInvoices as any[]).length === 0 && (
                            <div className="p-8 text-center text-gray-400 italic text-[11px]">No invoices found</div>
                        )}
                        {(histInvoices as any[]).map((inv: any, i: number) => {
                            const isExpanded = histInvoiceUq === t(inv.UNICO);
                            const custName   = t(inv.CUSTOMER) || t(inv.SALESMAN_CUSTOMER) || "";
                            const total      = parseMoney(inv.AMMOUNT) || parseMoney(inv.TOTAL_INVOICE) || 0;
                            const paid       = parseMoney(inv.IN_AMMOUNT);
                            const balance    = total > 0 ? Math.max(0, total - paid) : 0;
                            return (
                                <div key={i} className={cn(
                                    "bg-white rounded-xl overflow-hidden transition-all shadow-sm border-l-4",
                                    isExpanded ? "border-l-[#FB7506] border border-[#FB7506]" : balance > 0 ? "border-l-red-400 border border-gray-200" : "border-l-green-400 border border-gray-200"
                                )}>
                                    <div className="p-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-baseline gap-2 flex-wrap">
                                                    <span className="font-black text-[15px] text-blue-700">#{t(inv.INVOICE_NO)}</span>
                                                    <span className="text-[10px] text-gray-400 font-semibold">{fmtDate(inv.INVOICE_DATE)}</span>
                                                </div>
                                                {custName && <p className="text-[12px] font-semibold text-gray-700 truncate mt-0.5">{custName}</p>}
                                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                    {total > 0 && (
                                                        <span className="text-[11px] font-black text-green-700 bg-green-50 px-2 py-0.5 rounded-lg border border-green-200">
                                                            ${fmt(total)}
                                                        </span>
                                                    )}
                                                    {balance > 0 && (
                                                        <span className="text-[11px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-lg border border-red-200">
                                                            Bal ${fmt(balance)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <button onClick={() => setHistInvoiceUq(isExpanded ? null : t(inv.UNICO))}
                                                className={cn(
                                                    "shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all mt-0.5",
                                                    isExpanded ? "bg-[#FB7506] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                                )}>
                                                {isExpanded ? <Minus size={16} /> : <Plus size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                    {/* Expanded: Details / Credits only */}
                                    {isExpanded && (
                                        <div className="border-t border-orange-200 bg-orange-50/40">
                                            <div className="flex items-center gap-1 px-3 py-2 border-b border-orange-200">
                                                {(["details","credits"] as const).map(sub => (
                                                    <button key={sub} onClick={() => setHistSubTab(sub)}
                                                        className={cn("px-3 py-1 text-[10px] font-black uppercase rounded-lg transition-all",
                                                            histSubTab === sub ? "bg-[#FB7506] text-white" : "bg-white text-gray-400 hover:text-gray-700 border border-gray-200")}>
                                                        {sub}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="max-h-[40dvh] overflow-y-auto">
                                                {(histDetails as any[]).length === 0 && (
                                                    <p className="p-4 text-center text-gray-400 italic text-[11px]">No data</p>
                                                )}
                                                {histSubTab === "details" && (histDetails as any[]).map((r: any, j: number) => (
                                                    <div key={j} className="flex items-center gap-3 px-3 py-2 border-b border-orange-100">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-[12px] text-gray-800 truncate">{t(r.DESCRIPTION)}</p>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <span className="font-bold text-[11px] text-[#FB7506]">{t(r.FARM)}</span>
                                                                <span className="text-[10px] text-gray-400 truncate">{t(r.GROWER ?? r.VENDOR)}</span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right shrink-0">
                                                            <p className="font-black text-[13px] text-green-700">${fmt(r.EXT_PRICE)}</p>
                                                            <p className="text-[10px] text-gray-400">{fmtI(r.BOX_QTY)} × ${fmt(r.PRICE ?? r.PRICE_X_U)}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                                {histSubTab === "credits" && (histDetails as any[]).map((r: any, j: number) => (
                                                    <div key={j} className="flex items-center gap-3 px-3 py-2 border-b border-orange-100">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-[12px] text-gray-800 truncate">{t(r.DESCRIPTION)}</p>
                                                            <p className="text-[10px] text-gray-400 truncate">{t(r.REASON)}</p>
                                                        </div>
                                                        <span className="font-black text-[13px] text-red-600 shrink-0">${fmt(r.CR_REQUEST ?? r.AMOUNT)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    )}

                    {/* Mobile: Statement cards */}
                    {histView === "statement" && (
                    <div className="xl:hidden flex-1 overflow-auto flex flex-col gap-2 min-h-0">
                        {loadingStatement && (
                            <div className="flex items-center justify-center py-10 text-gray-400 text-[11px]">
                                <Loader2 size={14} className="animate-spin mr-2" />Loading statement...
                            </div>
                        )}
                        {!loadingStatement && (histStatement as any[]).length === 0 && (
                            <div className="p-8 text-center text-gray-400 italic text-[11px]">No transactions found</div>
                        )}
                        {(histStatement as any[]).map((r: any, i: number) => (
                            <div key={i} className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="text-[10px] font-black text-gray-400 uppercase">{t(r.TYPE)}</span>
                                        <span className="font-bold text-[12px] text-blue-700">#{t(r.INVOICE_NO)}</span>
                                    </div>
                                    <span className="text-[10px] text-gray-400 shrink-0">{t(r.FECHA ?? r.DATE)}</span>
                                </div>
                                <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                                    {parseMoney(r.DEBITS) !== 0 && (
                                        <span className="text-[11px] text-gray-500">Deb: <span className="font-black text-gray-700">${fmt(r.DEBITS)}</span></span>
                                    )}
                                    {parseMoney(r.CREDITS) !== 0 && (
                                        <span className="text-[11px] text-gray-500">Cred: <span className="font-black text-green-700">${fmt(r.CREDITS)}</span></span>
                                    )}
                                    <span className="text-[11px] text-gray-500">Bal: <span className={cn("font-black", parseMoney(r.BALANCE ?? 0) > 0 ? "text-red-600" : "text-green-600")}>${fmt(r.BALANCE)}</span></span>
                                </div>
                                {(parseMoney(r.T0_30) || parseMoney(r.T30_60) || parseMoney(r.T60_90)) && (
                                    <div className="flex items-center gap-3 mt-1 text-[9px] text-gray-400">
                                        {parseMoney(r.T0_30)   > 0 && <span>0-30: <span className="font-bold text-gray-600">${fmt(r.T0_30)}</span></span>}
                                        {parseMoney(r.T30_60)  > 0 && <span>30-60: <span className="font-bold text-gray-600">${fmt(r.T30_60)}</span></span>}
                                        {parseMoney(r.T60_90)  > 0 && <span>60-90: <span className="font-bold text-gray-600">${fmt(r.T60_90)}</span></span>}
                                        {parseMoney(r.T90_120 ?? r.T120) > 0 && <span>90+: <span className="font-bold text-red-500">${fmt(r.T90_120 ?? r.T120)}</span></span>}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    )}

                    {/* Desktop: two-panel layout */}
                    <div className="hidden xl:flex xl:flex-1 xl:overflow-hidden xl:min-h-0 gap-2">
                        <PanelGrid title="History" icon={History} recordCount={(histInvoices as any[]).length} className="w-[320px] shrink-0">
                            {(histInvoices as any[]).map((inv: any, i: number) => (
                                <div key={i} onClick={() => setHistInvoiceUq(t(inv.UNICO))}
                                    className={cn("px-3 py-2 border-b cursor-pointer transition-colors text-[11px]",
                                        histInvoiceUq === t(inv.UNICO) ? "bg-blue-100" : "hover:bg-blue-50")}>
                                    <div className="flex justify-between">
                                        <span className="font-bold text-blue-700">#{t(inv.INVOICE_NO)}</span>
                                        <span className="text-gray-500">{fmtDate(inv.INVOICE_DATE)}</span>
                                    </div>
                                    <p className="truncate text-gray-700">{t(inv.CUSTOMER)}</p>
                                    <div className="flex justify-between text-[10px] text-gray-500 mt-0.5">
                                        <span>${fmt(inv.TOTAL_INVOICE)}</span>
                                        <span>Bal: ${fmt(inv.TOTAL_BALANCE)}</span>
                                    </div>
                                </div>
                            ))}
                            {!loadingHistList && (histInvoices as any[]).length === 0 && <p className="p-6 text-center text-gray-400 italic text-[11px]">No invoices found</p>}
                        </PanelGrid>
                        <PanelGrid
                            title="Invoice Detail"
                            icon={FileText}
                            className="flex-1 min-w-0"
                            headerRight={
                                <div className="flex items-center gap-1">
                                    {(["details","credits","statement"] as const).map(sub => (
                                        <button key={sub} onClick={() => setHistSubTab(sub)}
                                            className={cn("px-2 py-0.5 text-[10px] font-black uppercase rounded transition-all",
                                                histSubTab === sub ? "bg-[#FB7506] text-white" : "text-gray-400 hover:text-white")}>
                                            {sub}
                                        </button>
                                    ))}
                                </div>
                            }
                        >
                            {!histInvoiceUq && <p className="p-6 text-center text-gray-400 italic text-[11px]">Select an invoice</p>}
                            {histInvoiceUq && (histDetails as any[]).length === 0 && <p className="p-6 text-center text-gray-400 italic text-[11px]">No data</p>}
                            {histInvoiceUq && histSubTab === "details" && (histDetails as any[]).length > 0 && (
                                <PanelGridTable>
                                    <PanelGridThead>
                                        <PanelGridTh>Product</PanelGridTh><PanelGridTh>Farm</PanelGridTh><PanelGridTh>Vendor</PanelGridTh>
                                        <PanelGridTh align="right">BoxQty</PanelGridTh><PanelGridTh align="right">UxBox</PanelGridTh>
                                        <PanelGridTh align="right">Price</PanelGridTh><PanelGridTh align="right">T.Units</PanelGridTh>
                                        <PanelGridTh align="right">Ext.Price</PanelGridTh><PanelGridTh align="right">Credits</PanelGridTh>
                                        <PanelGridTh>Case</PanelGridTh><PanelGridTh>AWB</PanelGridTh><PanelGridTh>Lot</PanelGridTh>
                                    </PanelGridThead>
                                    <PanelGridTbody>
                                        {(histDetails as any[]).map((r: any, i: number) => (
                                            <PanelGridTr key={i}>
                                                <PanelGridTd className="max-w-[200px] truncate font-medium">{t(r.DESCRIPTION)}</PanelGridTd>
                                                <PanelGridTd className="font-bold text-[#FB7506]">{t(r.FARM)}</PanelGridTd>
                                                <PanelGridTd className="max-w-[100px] truncate">{t(r.GROWER ?? r.VENDOR)}</PanelGridTd>
                                                <PanelGridTd align="right">{fmtI(r.BOX_QTY)}</PanelGridTd>
                                                <PanelGridTd align="right">{fmtI(r.UNITS_X_BOX)}</PanelGridTd>
                                                <PanelGridTd align="right" className="font-semibold">${fmt(r.PRICE ?? r.PRICE_X_U)}</PanelGridTd>
                                                <PanelGridTd align="right">{fmtI(r.TOTAL_UNITS)}</PanelGridTd>
                                                <PanelGridTd align="right" className="font-bold text-green-700">${fmt(r.EXT_PRICE)}</PanelGridTd>
                                                <PanelGridTd align="right" className="text-red-600">{fmt(r.CREDITS)}</PanelGridTd>
                                                <PanelGridTd>{t(r.CASE_SH ?? r.CASE_NAME)}</PanelGridTd>
                                                <PanelGridTd className="font-mono text-blue-700">{t(r.AWBCODE ?? r.AWB)}</PanelGridTd>
                                                <PanelGridTd>{t(r.LOTE ?? r.LOT)}</PanelGridTd>
                                            </PanelGridTr>
                                        ))}
                                    </PanelGridTbody>
                                </PanelGridTable>
                            )}
                            {histInvoiceUq && histSubTab === "credits" && (histDetails as any[]).length > 0 && (
                                <PanelGridTable>
                                    <PanelGridThead>
                                        <PanelGridTh>Product</PanelGridTh><PanelGridTh>Reason</PanelGridTh>
                                        <PanelGridTh align="right">Units</PanelGridTh><PanelGridTh align="right">Amount</PanelGridTh>
                                        <PanelGridTh>Details</PanelGridTh>
                                    </PanelGridThead>
                                    <PanelGridTbody>
                                        {(histDetails as any[]).map((r: any, i: number) => (
                                            <PanelGridTr key={i}>
                                                <PanelGridTd className="max-w-[180px] truncate font-medium">{t(r.DESCRIPTION)}</PanelGridTd>
                                                <PanelGridTd>{t(r.REASON)}</PanelGridTd>
                                                <PanelGridTd align="right">{fmtI(r.CR_UNITS)}</PanelGridTd>
                                                <PanelGridTd align="right" className="font-bold text-red-600">${fmt(r.CR_REQUEST ?? r.AMOUNT)}</PanelGridTd>
                                                <PanelGridTd className="max-w-[200px] truncate">{t(r.DETAILS)}</PanelGridTd>
                                            </PanelGridTr>
                                        ))}
                                    </PanelGridTbody>
                                </PanelGridTable>
                            )}
                            {histSubTab === "statement" && (histDetails as any[]).length > 0 && (
                                <PanelGridTable>
                                    <PanelGridThead>
                                        <PanelGridTh>Date</PanelGridTh><PanelGridTh>Type</PanelGridTh><PanelGridTh>Invoice</PanelGridTh>
                                        <PanelGridTh align="right">Debits</PanelGridTh><PanelGridTh align="right">Credits</PanelGridTh>
                                        <PanelGridTh align="right">Balance</PanelGridTh>
                                        <PanelGridTh align="right">0-30</PanelGridTh><PanelGridTh align="right">30-60</PanelGridTh>
                                        <PanelGridTh align="right">60-90</PanelGridTh><PanelGridTh align="right">90+</PanelGridTh>
                                    </PanelGridThead>
                                    <PanelGridTbody>
                                        {(histDetails as any[]).map((r: any, i: number) => (
                                            <PanelGridTr key={i}>
                                                <PanelGridTd>{t(r.FECHA ?? r.DATE)}</PanelGridTd>
                                                <PanelGridTd>{t(r.TYPE)}</PanelGridTd>
                                                <PanelGridTd className="font-bold text-blue-700">{t(r.INVOICE_NO)}</PanelGridTd>
                                                <PanelGridTd align="right">${fmt(r.DEBITS)}</PanelGridTd>
                                                <PanelGridTd align="right" className="text-green-700">${fmt(r.CREDITS)}</PanelGridTd>
                                                <PanelGridTd align="right" className={cn("font-bold", parseFloat(r.BALANCE ?? 0) > 0 ? "text-red-600" : "text-green-600")}>${fmt(r.BALANCE)}</PanelGridTd>
                                                <PanelGridTd align="right">${fmt(r.T0_30)}</PanelGridTd>
                                                <PanelGridTd align="right">${fmt(r.T30_60)}</PanelGridTd>
                                                <PanelGridTd align="right">${fmt(r.T60_90)}</PanelGridTd>
                                                <PanelGridTd align="right">${fmt(r.T90_120 ?? r.T120)}</PanelGridTd>
                                            </PanelGridTr>
                                        ))}
                                    </PanelGridTbody>
                                </PanelGridTable>
                            )}
                        </PanelGrid>
                    </div>
                </div>
                )}

            </div>

            {/* ── Customer Call List Modal ──────────────────────────────── */}
            {ccModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="bg-[#374151] px-4 py-2.5 flex items-center justify-between shrink-0 rounded-t-lg">
                            <div className="flex items-center gap-3">
                                <Users size={14} className="text-[#FB7506]" />
                                <span className="font-black text-[11px] text-white uppercase tracking-widest">New Invoice</span>
                                {/* Step indicators */}
                                {([1,2,3] as const).map(s => (
                                    <div key={s} onClick={() => s < ccStep && setCcStep(s)}
                                        className={cn("flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase",
                                            ccStep === s ? "bg-[#FB7506] text-white" : s < ccStep ? "bg-white/20 text-white cursor-pointer hover:bg-white/30" : "bg-white/10 text-white/40")}>
                                        {s === 1 && <><Users size={9} />Customer</>}
                                        {s === 2 && <><Package size={9} />Ship-To</>}
                                        {s === 3 && <><ChevronRight size={9} />Confirm</>}
                                    </div>
                                ))}
                            </div>
                            <button onClick={closeCcModal} className="text-white/60 hover:text-white"><X size={14} /></button>
                        </div>

                        {/* Step 1 — Customer list */}
                        {ccStep === 1 && (
                            <>
                                <div className="px-4 py-2 border-b border-gray-100 flex items-center gap-2 shrink-0">
                                    <Search size={12} className="text-gray-400" />
                                    <input value={ccSearch} onChange={e => setCcSearch(e.target.value)}
                                        placeholder="Search customers by name, code..."
                                        className="flex-1 text-[12px] focus:outline-none" autoFocus />
                                    {ccLoading && <Loader2 size={12} className="animate-spin text-gray-400" />}
                                    <span className="text-[10px] text-gray-400">{ccCustomers.length}/{ccTotal}</span>
                                </div>
                                <div className="flex-1 overflow-auto min-h-0">
                                    <PanelGridTable>
                                        <PanelGridThead>
                                            <PanelGridTh>Customer</PanelGridTh>
                                            <PanelGridTh>Contact</PanelGridTh>
                                            <PanelGridTh>City</PanelGridTh>
                                            <PanelGridTh>Phone</PanelGridTh>
                                            <PanelGridTh>Last Sale</PanelGridTh>
                                        </PanelGridThead>
                                        <PanelGridTbody>
                                            {ccCustomers.map((c: any, i: number) => (
                                                <PanelGridTr key={i} onClick={() => selectCcCustomer(c)}>
                                                    <PanelGridTd className="font-medium text-gray-800">{t(c.CUST_CODE ?? c.CUSTOMER ?? c.CUST_NAME)}</PanelGridTd>
                                                    <PanelGridTd>{t(c.CONTACT ?? c.CONTACT_NAME)}</PanelGridTd>
                                                    <PanelGridTd>{t(c.CITY)}, {t(c.STATE)}</PanelGridTd>
                                                    <PanelGridTd>{t(c.PHONE_1 ?? c.PHONE)}</PanelGridTd>
                                                    <PanelGridTd className="text-gray-500">{fmtDate(c.LAST_SALE ?? c.LAST_INVOICE)}</PanelGridTd>
                                                </PanelGridTr>
                                            ))}
                                            {!ccLoading && ccCustomers.length === 0 && (
                                                <PanelGridTr><PanelGridTd colSpan={5} className="p-8 text-center text-gray-400 italic">Type to search customers</PanelGridTd></PanelGridTr>
                                            )}
                                        </PanelGridTbody>
                                    </PanelGridTable>
                                </div>
                            </>
                        )}

                        {/* Step 2 — Ship-to list */}
                        {ccStep === 2 && (
                            <>
                                <div className="px-4 py-2 border-b border-gray-100 shrink-0">
                                    <p className="text-[11px] font-bold text-gray-700">Customer: <span className="text-[#FB7506]">{t(ccSelectedCustomer?.CUST_CODE ?? ccSelectedCustomer?.CUSTOMER)}</span></p>
                                    <p className="text-[10px] text-gray-500">Select a ship-to address</p>
                                </div>
                                <div className="flex-1 overflow-auto min-h-0">
                                    {ccShiptos.length === 0 && <p className="p-8 text-center text-gray-400 italic text-[11px]">No ship-to addresses found</p>}
                                    {ccShiptos.map((s: any, i: number) => (
                                        <div key={i} onClick={() => selectCcShipto(s)}
                                            className="px-4 py-2.5 border-b cursor-pointer hover:bg-blue-50 transition-colors">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-[12px] text-gray-800">{t(s.NAME ?? s.SHIP_NAME)}</span>
                                                {bool(s.SHIPTO_DEFAULT ?? s.DEFAULT) && <span className="text-[9px] font-black bg-green-100 text-green-700 px-1.5 py-0.5 rounded">DEFAULT</span>}
                                            </div>
                                            <p className="text-[11px] text-gray-600">{t(s.ADDRESS1 ?? s.SHIP_ADDRESS)}, {t(s.CITY)}, {t(s.STATE)} {t(s.ZIP)}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="h-11 border-t border-gray-200 flex items-center justify-between px-4 shrink-0">
                                    <ActionBtn label="← Back" onClick={() => setCcStep(1)} />
                                    <ActionBtn label="Skip Ship-To →" onClick={() => setCcStep(3)} variant="orange" />
                                </div>
                            </>
                        )}

                        {/* Step 3 — Confirm */}
                        {ccStep === 3 && (
                            <>
                                <div className="flex-1 overflow-auto p-4 space-y-4">
                                    <div className="bg-gray-50 border border-gray-200 rounded p-3 space-y-2 text-[12px]">
                                        <p className="font-black text-[10px] text-gray-500 uppercase tracking-widest">Invoice Summary</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div><span className="text-gray-500 font-bold">Customer:</span> <span className="font-black">{t(ccSelectedCustomer?.CUST_CODE ?? ccSelectedCustomer?.CUSTOMER)}</span></div>
                                            <div><span className="text-gray-500 font-bold">Sales Rep:</span> <span>{salesmanName}</span></div>
                                            {ccSelectedShipto && <>
                                                <div><span className="text-gray-500 font-bold">Ship To:</span> <span>{t(ccSelectedShipto.NAME ?? ccSelectedShipto.SHIP_NAME)}</span></div>
                                                <div><span className="text-gray-500 font-bold">Address:</span> <span>{t(ccSelectedShipto.ADDRESS1 ?? ccSelectedShipto.SHIP_ADDRESS)}</span></div>
                                            </>}
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-gray-500 font-bold">Invoice Date:</span>
                                            <input type="date" value={ccDate} onChange={e => setCcDate(e.target.value)}
                                                className="border border-gray-300 rounded px-2 py-1 text-[11px] focus:outline-none focus:ring-2 focus:ring-[#FB7506]" />
                                        </div>
                                        {ccCarriers.length > 0 && (
                                            <div>
                                                <span className="text-gray-500 font-bold">Carrier:</span>
                                                <select value={t(ccSelectedCarrier?.UNICO ?? "")} onChange={e => setCcSelectedCarrier(ccCarriers.find((c:any) => t(c.UNICO)===e.target.value))}
                                                    className="ml-2 border border-gray-300 rounded px-2 py-1 text-[11px] focus:outline-none">
                                                    <option value="">— none —</option>
                                                    {ccCarriers.map((c: any, i: number) => <option key={i} value={t(c.UNICO)}>{t(c.CARRIER ?? c.CARRIER_NAME)}</option>)}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="h-11 border-t border-gray-200 flex items-center justify-between px-4 shrink-0">
                                    <ActionBtn label="← Back" onClick={() => setCcStep(2)} />
                                    <button onClick={handleCreateInvoice} disabled={ccCreating}
                                        className="flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-black text-white bg-green-600 hover:bg-green-500 rounded disabled:opacity-40 transition-all">
                                        {ccCreating ? <Loader2 size={11} className="animate-spin" /> : <Plus size={11} />}
                                        Create Invoice
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* ── Barcode Scan Modal ────────────────────────────────────── */}
            {scanModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg flex flex-col overflow-hidden">
                        <div className="bg-[#374151] px-4 py-2.5 flex items-center justify-between shrink-0 rounded-t-lg">
                            <div className="flex items-center gap-2">
                                <Scan size={13} className="text-[#FB7506]" />
                                <span className="font-black text-[11px] text-white uppercase tracking-widest">Barcode Scan</span>
                                {h && <span className="text-[10px] text-gray-400">Invoice #{t(h.INVOICE_NO)}</span>}
                            </div>
                            <button onClick={() => setScanModal(false)} className="text-white/60 hover:text-white"><X size={14} /></button>
                        </div>
                        <div className="p-4 space-y-3">
                            <div className="flex gap-2">
                                <input ref={scanInputRef} value={scanInput}
                                    onChange={e => setScanInput(e.target.value.toUpperCase())}
                                    onKeyDown={e => { if (e.key === "Enter") handleBarcodeScan(); }}
                                    placeholder="Scan or type barcode, then Enter..."
                                    className="flex-1 font-mono font-bold text-[13px] border-2 border-[#FB7506] rounded px-3 py-2 focus:outline-none uppercase"
                                    autoComplete="off" spellCheck={false} />
                                <button onClick={handleBarcodeScan} disabled={scanning || !scanInput}
                                    className="px-3 py-2 bg-[#FB7506] hover:bg-orange-500 text-white rounded font-black text-[10px] uppercase disabled:opacity-40">
                                    {scanning ? <Loader2 size={14} className="animate-spin" /> : <Scan size={14} />}
                                </button>
                            </div>
                            {/* Scan log */}
                            <div className="border border-gray-200 rounded max-h-52 overflow-auto">
                                {scanLog.length === 0 && <p className="p-4 text-center text-gray-400 italic text-[11px]">Scan log will appear here</p>}
                                {scanLog.map((entry, i) => (
                                    <div key={i} className={cn("px-3 py-1.5 border-b flex items-center gap-2 text-[11px]", entry.ok ? "bg-green-50" : "bg-red-50")}>
                                        {entry.ok ? <Check size={11} className="text-green-600 shrink-0" /> : <X size={11} className="text-red-600 shrink-0" />}
                                        <span className="font-mono font-bold text-gray-800">{entry.barcode}</span>
                                        <span className="text-gray-600">{entry.msg}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Edit Line Modal ───────────────────────────────────────── */}
            {editLineModal && editLine && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm flex flex-col overflow-hidden">
                        <div className="bg-[#374151] px-4 py-2.5 flex items-center justify-between shrink-0 rounded-t-lg">
                            <span className="font-black text-[11px] text-white uppercase tracking-widest">Edit Line</span>
                            <button onClick={() => setEditLineModal(false)} className="text-white/60 hover:text-white"><X size={14} /></button>
                        </div>
                        <div className="p-4 space-y-3">
                            <p className="text-[11px] font-bold text-gray-700 truncate">{t(editLine.DESCRIPTION)}</p>
                            {[
                                { label: "Box Qty",   key: "box_qty",     type: "number" },
                                { label: "Units/Box", key: "units_x_box", type: "number" },
                                { label: "Price",     key: "price",       type: "number", step: "0.01" },
                            ].map(({ label, key, type, step }) => (
                                <div key={key}>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">{label}</label>
                                    <input type={type} step={step} value={(editLineForm as any)[key]}
                                        onChange={e => setEditLineForm(p => ({ ...p, [key]: e.target.value }))}
                                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-[12px] focus:outline-none focus:ring-2 focus:ring-[#FB7506]"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="h-11 border-t border-gray-200 flex items-center justify-end px-4 gap-2 shrink-0">
                            <button onClick={() => setEditLineModal(false)} className="px-3 py-1.5 text-[11px] font-bold text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50">Cancel</button>
                            <button onClick={handleSaveLine} disabled={savingLine}
                                className="px-4 py-1.5 text-[11px] font-black text-white bg-[#FB7506] hover:bg-orange-500 rounded disabled:opacity-40 flex items-center gap-1">
                                {savingLine ? <Loader2 size={10} className="animate-spin" /> : <Check size={10} />}
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* ── Stock / Line Product Detail Modal ────────────────────────── */}
            {stockImageModal && (() => {
                const s        = stockImageModal.row;
                const isLines  = stockImageModal.source === "lines";
                const uq       = t(s.PRODUCT_UQ ?? s.BOX_PACK_UQ ?? "");
                const img      = modalImages[modalImgIdx] || productImages[uq] || DEFAULT_THUMB;
                const qtyNum   = parseInt(stockImageForm.box_qty) || 0;
                // liveStockRow is fetched fresh from sp_inventory_stock_uq when modal opens
                const liveWh   = liveStockRow ? parseInt(liveStockRow.WH_STOCK ?? liveStockRow.wh_stock ?? 0) : null;
                const whStock  = liveWh ?? (isLines ? null : parseInt(s.WH_STOCK ?? 0));
                const maxQty   = isLines
                    ? (whStock !== null ? whStock + parseInt(s.BOX_QTY || 0) : Math.max(parseInt(s.BOX_QTY || 0) + 5, 10))
                    : (whStock ?? 0);
                const currentBoxQty = isLines ? parseInt(s.BOX_QTY || 0) : 0;
                const awb      = t(s.AWBCODE);
                const caseName = t(s.CASE_SH ?? s.CASE_NAME ?? s.CASE_NAME);
                const gprofit  = parseFloat(s.GPROFIT ?? s.GPM ?? 0);
                return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                         onClick={() => setStockImageModal(null)}>
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col"
                             onClick={e => e.stopPropagation()}>
                            {/* Header */}
                            <div className="bg-[#0d1b2a] px-4 py-3 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 bg-[#FB7506] rounded-lg flex items-center justify-center shrink-0">
                                        <Package size={15} className="text-white" />
                                    </div>
                                    <span className="font-black text-[12px] text-white uppercase tracking-widest">Product Detail</span>
                                </div>
                                <button onClick={() => setStockImageModal(null)}
                                    className="text-white/50 hover:text-white text-lg font-light leading-none">—</button>
                            </div>
                            {/* Main image */}
                            <div className="w-full bg-gray-50 shrink-0" style={{ aspectRatio: "4/3" }}>
                                <img src={img} alt={t(s.DESCRIPTION)}
                                     className="w-full h-full object-contain"
                                     onError={e => { (e.target as HTMLImageElement).src = DEFAULT_THUMB; }} />
                            </div>
                            {/* Thumbnail strip — shown only when multiple images */}
                            {modalImages.length > 1 && (
                                <div className="flex gap-2 px-3 py-2 overflow-x-auto shrink-0 bg-gray-50 border-t border-gray-100">
                                    {modalImages.map((url, i) => (
                                        <button key={i} onClick={() => setModalImgIdx(i)}
                                            className={cn("shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all",
                                                modalImgIdx === i ? "border-[#FB7506] ring-1 ring-[#FB7506]" : "border-gray-200 hover:border-gray-400")}>
                                            <img src={url} alt="" className="w-full h-full object-cover"
                                                 onError={e => { (e.target as HTMLImageElement).src = DEFAULT_THUMB; }} />
                                        </button>
                                    ))}
                                </div>
                            )}
                            {/* Info */}
                            <div className="px-4 pt-3 pb-0">
                                <h2 className="font-black text-[15px] text-gray-900 leading-snug">{t(s.DESCRIPTION)}</h2>
                                <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide mt-0.5">
                                    {t(s.FARM)}{t(s.GROWER) ? ` / ${t(s.GROWER)}` : ""}
                                </p>
                                {/* Price display */}
                                <div className="mt-2 mb-2">
                                    <span className="text-[30px] font-black text-[#FB7506] leading-none">${stockImageForm.price}</span>
                                </div>
                                {/* Badges row */}
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                    <span className="px-2.5 py-0.5 text-[10px] font-black text-green-700 bg-green-100 rounded-full border border-green-200">
                                        AVAIL: {whStock !== null ? fmtI(whStock) : "…"}
                                    </span>
                                    <span className="px-2.5 py-0.5 text-[10px] font-black text-gray-600 bg-gray-100 rounded-full border border-gray-200">
                                        PACK: {fmtI(s.TUNITS_X_BOX ?? s.UNITS_X_BOX)}
                                    </span>
                                    {(s.DAYS || s.BOX_DATE) && (
                                        <span className="px-2.5 py-0.5 text-[10px] font-black text-blue-600 bg-blue-50 rounded-full border border-blue-200">
                                            {fmtI(s.DAYS)}d · {fmtDate(s.BOX_DATE)}
                                        </span>
                                    )}
                                    {awb && (
                                        <span className="px-2.5 py-0.5 text-[10px] font-black text-purple-600 bg-purple-50 rounded-full border border-purple-200">
                                            AWB {awb}
                                        </span>
                                    )}
                                    {caseName && (
                                        <span className="px-2.5 py-0.5 text-[10px] font-black text-amber-700 bg-amber-50 rounded-full border border-amber-200">
                                            {caseName}
                                        </span>
                                    )}
                                    <span className={cn("px-2.5 py-0.5 text-[10px] font-black rounded-full border",
                                        gprofit < 0 ? "text-red-600 bg-red-50 border-red-200" : "text-gray-600 bg-gray-100 border-gray-200")}>
                                        GPM {fmt(gprofit)}%
                                    </span>
                                </div>
                                {/* Qty + Price inputs */}
                                <div className="border-t border-gray-100 pt-3 flex gap-3 mb-3">
                                    <div className="flex-1">
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Box Qty</label>
                                        <select value={stockImageForm.box_qty}
                                            onChange={e => setStockImageForm(p => ({ ...p, box_qty: e.target.value }))}
                                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[14px] font-bold focus:outline-none focus:ring-2 focus:ring-[#FB7506] bg-gray-50 text-center">
                                            {Array.from({ length: maxQty - (isLines ? 0 : 1) + 1 }, (_, i) => {
                                                const v = i + (isLines ? 0 : 1);
                                                return (
                                                    <option key={v} value={String(v)}>
                                                        {v}{v === currentBoxQty && isLines ? " (current)" : ""}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Price / Unit</label>
                                        <input type="number" step="0.01" min="0" value={stockImageForm.price}
                                            onChange={e => setStockImageForm(p => ({ ...p, price: e.target.value }))}
                                            readOnly={!isOpen}
                                            className={cn("w-full border rounded-xl px-3 py-2.5 text-[14px] font-bold focus:outline-none focus:ring-2 focus:ring-[#FB7506] text-center",
                                                isOpen ? "border-gray-200 bg-gray-50" : "border-gray-100 bg-gray-100 text-gray-400 cursor-default")} />
                                    </div>
                                </div>
                            </div>
                            {/* Action button */}
                            <div className="px-4 pb-4 shrink-0">
                                {isLines ? (
                                    <button onClick={handleUpdateLineFromModal} disabled={savingLine}
                                        className="w-full flex items-center justify-center gap-2 py-3.5 text-[14px] font-black text-white bg-[#FB7506] hover:bg-orange-500 active:bg-orange-600 rounded-xl disabled:opacity-40 transition-colors">
                                        {savingLine ? <Loader2 size={16} className="animate-spin" /> : <Edit2 size={16} />}
                                        Update Line
                                    </button>
                                ) : isOpen ? (
                                    <button onClick={handleAddLineFromModal} disabled={working || qtyNum < 1}
                                        className="w-full flex items-center justify-center gap-2 py-3.5 text-[14px] font-black text-white bg-[#22c55e] hover:bg-green-400 active:bg-green-600 rounded-xl disabled:opacity-40 transition-colors">
                                        {working ? <Loader2 size={16} className="animate-spin" /> : <ShoppingCart size={16} />}
                                        Add to Invoice
                                    </button>
                                ) : (
                                    <button onClick={() => setStockImageModal(null)}
                                        className="w-full flex items-center justify-center gap-2 py-3.5 text-[14px] font-black text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                                        Close
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* ── Invoice List Modal (mobile) ──────────────────────────── */}
            {listModal && mainTab === "invoice" && (
                <div className="xl:hidden fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                    onClick={() => setListModal(false)}>
                    <div className="bg-[#f4f6f8] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90dvh] flex flex-col overflow-hidden"
                        onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="bg-[#374151] px-4 h-12 flex items-center justify-between shrink-0 rounded-t-2xl">
                            <div className="flex items-center gap-2">
                                <ClipboardList size={12} className="text-[#FB7506]" />
                                <span className="font-black text-[11px] text-white uppercase tracking-widest">Invoices</span>
                                {loadingList && <RefreshCcw size={10} className="animate-spin text-gray-400" />}
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="date" value={invoiceDate}
                                    onChange={e => { setInvoiceDate(e.target.value); setListKey(k=>k+1); }}
                                    className="text-[10px] font-bold bg-white/10 text-white rounded px-1.5 py-0.5 border border-white/20 focus:outline-none" />
                                <button onClick={() => setListModal(false)}>
                                    <X size={18} className="text-white/60 hover:text-white" />
                                </button>
                            </div>
                        </div>
                        {/* Date chips */}
                        <div className="overflow-x-auto scrollbar-none shrink-0 px-2 py-1.5 bg-white border-b border-gray-100">
                            <div className="flex gap-1">
                                {Array.from({ length: 30 }, (_, i) => {
                                    const d = new Date();
                                    d.setDate(d.getDate() - 14 + i);
                                    const ds = d.toISOString().split("T")[0];
                                    const isToday = ds === new Date().toISOString().split("T")[0];
                                    const isSel = ds === invoiceDate;
                                    const label = d.toLocaleDateString("en-US", { weekday: "short", month: "numeric", day: "numeric" });
                                    return (
                                        <button key={ds}
                                            onClick={() => { setInvoiceDate(ds); setListKey(k => k + 1); }}
                                            className={cn(
                                                "shrink-0 px-2 py-1 rounded text-[9px] font-black whitespace-nowrap transition-all",
                                                isSel ? "bg-[#FB7506] text-white shadow-sm" :
                                                isToday ? "bg-gray-800 text-white" :
                                                "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                            )}>
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        {/* Controls */}
                        <div className="px-3 py-2 bg-white border-b border-gray-100 shrink-0 flex flex-col gap-2">
                            <div className="flex items-center bg-gray-100 rounded p-0.5">
                                <button onClick={() => setMyInvoices(true)}
                                    className={cn("flex-1 py-1 rounded text-[10px] font-black uppercase tracking-widest transition-all",
                                        myInvoices ? "bg-[#FB7506] text-white shadow-sm" : "text-gray-500 hover:text-gray-800")}>
                                    My Invoices
                                </button>
                                <button onClick={() => setMyInvoices(false)}
                                    className={cn("flex-1 py-1 rounded text-[10px] font-black uppercase tracking-widest transition-all",
                                        !myInvoices ? "bg-[#FB7506] text-white shadow-sm" : "text-gray-500 hover:text-gray-800")}>
                                    All
                                </button>
                            </div>
                            <button onClick={() => { openCcModal(); setListModal(false); }}
                                className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-black uppercase tracking-widest bg-green-600 hover:bg-green-500 text-white rounded transition-all">
                                <Plus size={11} /> New Invoice
                            </button>
                            <div className="flex items-center gap-1.5 bg-gray-100 rounded px-2 py-1">
                                <Search size={11} className="text-gray-400 shrink-0" />
                                <input value={listSearch} onChange={e => setListSearch(e.target.value)}
                                    placeholder="Customer or invoice #..."
                                    className="flex-1 text-[11px] bg-transparent focus:outline-none text-gray-700 placeholder-gray-400" />
                                {listSearch && <button onClick={() => setListSearch("")}><X size={10} className="text-gray-400 hover:text-gray-600" /></button>}
                            </div>
                        </div>
                        {/* Invoice cards */}
                        <div className="flex-1 overflow-auto p-3 flex flex-col gap-2">
                            {(invoiceList as any[]).length === 0 && !loadingList && (
                                <div className="p-6 text-center text-gray-400 italic text-[11px]">No invoices for this date</div>
                            )}
                            {(invoiceList as any[])
                                .filter((inv: any) => {
                                    if (!listSearch.trim()) return true;
                                    const q = listSearch.toLowerCase();
                                    return t(inv.CUSTOMER).toLowerCase().includes(q) || t(inv.INVOICE_NO).toString().includes(q);
                                })
                                .map((inv: any, i: number) => {
                                    const sel = t(inv.UNICO) === activeInvoiceUq;
                                    const bg  = vfpRowStyle(inv.BACK_COLOR ?? inv.BACKCOLOR);
                                    const voi = bool(inv.VOID);
                                    const closed = bool(inv.PRINTED);
                                    return (
                                        <div key={i}
                                            onClick={() => {
                                                setActiveInvoiceUq(t(inv.UNICO));
                                                setDetailKey(k => k+1);
                                                setHistCustUq(t(inv.CUSTOMER_UQ ?? "%"));
                                                setHistInvoiceUq(null);
                                                setActiveBar("invoice");
                                                setListModal(false);
                                            }}
                                            className={cn(
                                                "border-2 rounded-xl p-3 cursor-pointer transition-all",
                                                sel ? "border-[#FB7506] bg-orange-50 shadow-md" : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                                            )}
                                            style={!sel && bg ? bg : undefined}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <span className={cn("font-black text-[15px]", sel ? "text-[#FB7506]" : "text-blue-700")}>
                                                    #{t(inv.INVOICE_NO)}
                                                </span>
                                                <StatusBadge printed={closed} voided={voi} />
                                            </div>
                                            <p className="text-[13px] font-semibold text-gray-700 mt-0.5 truncate">{t(inv.CUSTOMER)}</p>
                                            <p className="text-[10px] text-gray-400 mt-0.5">{fmtDate(inv.INVOICE_DATE ?? inv.SHIP_DATE)}</p>
                                            {sel && h && (
                                                <div className="flex items-center gap-4 mt-2 pt-2 border-t border-orange-200">
                                                    <span className="text-[11px] text-gray-500">Cases: <span className="font-black text-gray-800">{fmtI(h.TOTAL_CASES)}</span></span>
                                                    <span className="text-[11px] text-gray-500">Total: <span className="font-black text-green-700">${fmt(h.TOTAL_INVOICE)}</span></span>
                                                    {parseFloat(h.INVOICE_BALANCE ?? 0) > 0 && (
                                                        <span className="text-[11px] text-gray-500">Bal: <span className="font-black text-red-600">${fmt(h.INVOICE_BALANCE)}</span></span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Mobile Action Bar ────────────────────────────────────── */}
            <MobileActionBar
                activeGrid={mainTab === "invoice" ? activeBar : null}
                onClearSelection={() => setActiveBar(null)}
                items={[
                    { grid: "invoice", label: isOpen ? "Close" : "Open", icon: isOpen ? Lock : Unlock, onClick: isOpen ? handleCloseInvoice : handleOpenInvoice, disabled: working || !activeInvoiceUq },
                    { grid: "invoice", label: "Void", icon: XCircle, color: "red", onClick: handleVoidInvoice, disabled: working || !activeInvoiceUq || bool(h?.VOID) },
                    { grid: "invoice", label: "Delete", icon: Trash2, color: "red", onClick: handleDeleteInvoice, disabled: working || !activeInvoiceUq || !canDelete },
                    { grid: "invoice", label: "Print", icon: Printer, color: "blue", onClick: () => window.open(`/api/pos/invoice/print?uq=${activeInvoiceUq}`, "_blank"), disabled: !activeInvoiceUq },
                ]}
            />
            {/* ── Mobile FABs (Invoice tab only) ───────────────────────── */}
            {mainTab === "invoice" && (
            <>
                {/* Open invoice list */}
                <button onClick={() => setListModal(true)}
                    className="xl:hidden fixed bottom-36 right-4 z-50 w-12 h-12 rounded-full bg-[#374151] hover:bg-gray-600 active:bg-gray-700 text-white shadow-lg flex items-center justify-center transition-all">
                    <ClipboardList size={20} />
                </button>
                {/* New invoice */}
                <button onClick={() => { setCcModal(true); setCcStep(1); setCcSearch(""); }}
                    className="xl:hidden fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full bg-green-600 hover:bg-green-500 active:bg-green-700 text-white shadow-lg flex items-center justify-center transition-all">
                    <Plus size={24} />
                </button>
            </>
            )}

            <AppFooter areaLabel="Terminal" />
        </div>
    );
}
