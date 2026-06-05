"use client";

import { useState, useCallback, useEffect, useRef, type CSSProperties } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    ArrowLeft, RefreshCcw, Loader2, Plus, Trash2, Edit2, Check,
    Search, X, Lock, Unlock, FileText, Printer, CreditCard,
    RotateCcw, Scan, Users, Package, Calendar, ChevronRight,
    AlertCircle, CheckCircle, XCircle, ClipboardList, DollarSign,
    ShoppingCart, History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { toast } from "sonner";
import { usePagePermissions } from "@/lib/permissions";
import { usePOSStore } from "@/store/usePOSStore";

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
function Th({ children, className }: { children: any; className?: string }) {
    return <th className={cn("px-2 py-1.5 text-left font-bold whitespace-nowrap text-gray-700 border-l border-gray-200 first:border-l-0 bg-gray-100 sticky top-0 z-10 text-[11px]", className)}>{children}</th>;
}
function Td({ children, className }: { children: any; className?: string }) {
    return <td className={cn("px-2 py-1.5 whitespace-nowrap border-l border-gray-100 first:border-l-0 text-[12px]", className)}>{children}</td>;
}
function ActionBtn({ icon: Icon, label, onClick, disabled, variant = "default", size = "md" }: any) {
    return (
        <button onClick={onClick} disabled={disabled}
            className={cn(
                "flex items-center gap-1 font-black uppercase tracking-widest rounded transition-all disabled:opacity-40 whitespace-nowrap shrink-0",
                size === "sm" ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-1 text-[10px]",
                variant === "danger"   && "bg-red-600 hover:bg-red-500 text-white",
                variant === "success"  && "bg-green-600 hover:bg-green-500 text-white",
                variant === "warning"  && "bg-amber-500 hover:bg-amber-400 text-white",
                variant === "default"  && "bg-white hover:bg-gray-100 border border-gray-200 text-gray-700",
                variant === "dark"     && "bg-[#374151] hover:bg-gray-600 text-white",
                variant === "orange"   && "bg-[#FB7506] hover:bg-orange-500 text-white",
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
    const { data: session, status } = useSession();
    const router = useRouter();
    const qc = useQueryClient();
    const { canEdit, canDelete } = usePagePermissions("sales");

    const {
        salesmanUq, salesmanName, userUq, physicalWarehouseUq,
        activeInvoiceUq, invoiceDate,
        setSalesmanInfo, setActiveInvoiceUq, setInvoiceDate,
    } = usePOSStore();

    const [activeTab,          setActiveTab]          = useState<"lines"|"stock"|"history">("lines");
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

    // Customer Call List modal state
    const [ccModal,            setCcModal]            = useState(false);
    const [ccStep,             setCcStep]             = useState<1|2|3>(1);
    const [ccSearch,           setCcSearch]           = useState("");
    const [ccCustomers,        setCcCustomers]        = useState<any[]>([]);
    const [ccTotal,            setCcTotal]            = useState(0);
    const [ccPage,             setCcPage]             = useState(1);
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

    const sentinelRef = useRef<HTMLDivElement>(null);

    // Edit line modal
    const [editLineModal,  setEditLineModal]  = useState(false);
    const [editLine,       setEditLine]       = useState<any>(null);
    const [editLineForm,   setEditLineForm]   = useState({ box_qty: "1", units_x_box: "1", price: "0" });
    const [savingLine,     setSavingLine]     = useState(false);

    // Product images cache: product_uq → signed URL
    const [productImages,  setProductImages]  = useState<Record<string, string>>({});

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

    const { data: invoiceList = [], isFetching: loadingList } = useQuery({
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

    const { data: invoiceLines = [], isFetching: loadingLines } = useQuery({
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
        if (activeTab === "history" && h?.CUSTOMER_UQ && histCustUq === "%") {
            setHistCustUq(t(h.CUSTOMER_UQ));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    const { data: histInvoices = [], isFetching: loadingHistList } = useQuery({
        queryKey: ["pos-hist-list", histCustUq, histFrom, histTo, salesmanUq],
        enabled:  activeTab === "history" && !!salesmanUq,
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

    const { data: histDetails = [] } = useQuery({
        queryKey: ["pos-hist-detail", histInvoiceUq, histSubTab, histCustUq, salesmanUq],
        enabled:  !!histInvoiceUq && activeTab === "history",
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
        if (activeTab === "stock") loadStock(1, appliedStockSearch, stockSortCol, stockSortDir, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, appliedStockSearch, stockSortCol, stockSortDir, detailKey, physicalWarehouseUq]);

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el || activeTab !== "stock") return;
        const obs = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && !stockLoading && stockHasMore)
                loadStock(stockPage + 1, appliedStockSearch, stockSortCol, stockSortDir, false);
        }, { threshold: 0.1 });
        obs.observe(el);
        return () => obs.disconnect();
    }, [activeTab, stockLoading, stockHasMore, stockPage, appliedStockSearch, stockSortCol, stockSortDir, loadStock]);

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
    const isVoided = h && bool(h.VOID);

    // ── Invoice actions ───────────────────────────────────────────────────────
    const invoiceAction = useCallback(async (endpoint: string, body: any, successMsg: string) => {
        setWorking(true);
        try {
            const r = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
            const j = await r.json();
            if (!r.ok || !j.success) throw new Error(j.error || "Failed");
            toast.success(successMsg);
            setDetailKey(k => k+1);
            setListKey(k => k+1);
        } catch(e: any) { toast.error(e.message); }
        finally { setWorking(false); }
    }, []);

    const handleCloseInvoice = () => invoiceAction("/api/pos/invoice/close", { uq: activeInvoiceUq }, "Invoice closed");
    const handleOpenInvoice  = () => invoiceAction("/api/pos/invoice/open",  { uq: activeInvoiceUq, salesman_uq: salesmanUq }, "Invoice reopened");
    const handleVoidInvoice  = () => {
        toast("Void this invoice?", { duration: 8000,
            action: { label: "Void", onClick: () => invoiceAction("/api/pos/invoice/void", { uq: activeInvoiceUq, reason: "Voided" }, "Invoice voided") },
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
                    setActiveInvoiceUq(null);
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
            setActiveTab("lines");
        } catch(e: any) { toast.error(e.message); }
        finally { setWorking(false); }
    }, [activeInvoiceUq, isOpen]);

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
            setCcPage(page);
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
            setActiveTab("lines");
            closeCcModal();
        } catch(e: any) { toast.error(e.message); }
        finally { setCcCreating(false); }
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col h-[100dvh] bg-[#f4f6f8] overflow-hidden font-sans text-[#333]">

            <AppHeader
                title="P.O.S."
                icon={ShoppingCart}
                extraRight={
                    <>
                        {(working || loadingHeader || loadingLines) && (
                            <Loader2 size={13} className="animate-spin text-[#FB7506]" />
                        )}
                        <span className="hidden md:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                            <span className="text-white/50">Rep:</span>
                            <span className="text-white">{salesmanName || session?.user?.name}</span>
                        </span>
                        {h && (
                            <span className="hidden md:inline text-[#FB7506] text-[10px] font-black uppercase tracking-widest">
                                Invoice #{t(h.INVOICE_NO)}
                            </span>
                        )}
                    </>
                }
            />

            {/* ── Main split ───────────────────────────────────────────── */}
            <div className="flex flex-col xl:flex-row flex-1 overflow-hidden px-2 pb-2 pt-2 gap-2 min-h-0">

                {/* LEFT: Invoice list + date picker ────────────────────── */}
                <div className="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden xl:w-[300px] xl:shrink-0 xl:flex-none max-h-[40vh] xl:max-h-none">
                    {/* List header */}
                    <div className="bg-[#374151] px-3 py-2 flex items-center justify-between shrink-0 rounded-t-lg">
                        <div className="flex items-center gap-2">
                            <ClipboardList size={12} className="text-[#FB7506]" />
                            <span className="font-black text-[10px] text-white uppercase tracking-widest">Invoices</span>
                            {loadingList && <RefreshCcw size={10} className="animate-spin text-gray-400" />}
                        </div>
                        <div className="flex items-center gap-1">
                            <input type="date" value={invoiceDate} onChange={e => { setInvoiceDate(e.target.value); setListKey(k=>k+1); }}
                                className="text-[10px] font-bold bg-white/10 text-white rounded px-1.5 py-0.5 border border-white/20 focus:outline-none focus:border-[#FB7506]"
                            />
                        </div>
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

                    {/* Invoice list */}
                    <div className="flex-1 overflow-auto min-h-0">
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
                                <div key={i} onClick={() => { setActiveInvoiceUq(t(inv.UNICO)); setDetailKey(k=>k+1); setActiveTab("lines"); setHistCustUq(t(inv.CUSTOMER_UQ ?? "%")); setHistInvoiceUq(null); }}
                                    className={cn(
                                        "px-3 py-3 border-b cursor-pointer transition-all border-l-4",
                                        sel ? "bg-blue-50 border-l-[#FB7506]" : "border-l-transparent hover:bg-gray-50 hover:border-l-gray-300"
                                    )}
                                    style={!sel && bg ? bg : undefined}
                                >
                                    {/* Invoice # + status */}
                                    <div className="flex items-center justify-between gap-1 mb-1">
                                        <span className={cn("font-black text-[14px]", sel ? "text-[#FB7506]" : "text-blue-700")}>
                                            #{t(inv.INVOICE_NO)}
                                        </span>
                                        <StatusBadge printed={closed} voided={voi} />
                                    </div>
                                    {/* Customer */}
                                    <p className="text-[12px] font-semibold text-gray-800 truncate leading-snug">{t(inv.CUSTOMER)}</p>
                                    {/* Date */}
                                    <p className="text-[10px] text-gray-400 mt-0.5">{fmtDate(inv.INVOICE_DATE ?? inv.SHIP_DATE)}</p>
                                    {/* Cases + Total + Balance — from header when selected */}
                                    {sel && h && (
                                        <div className="flex items-center gap-3 mt-2 pt-2 border-t border-blue-200 flex-wrap">
                                            <div className="flex flex-col items-center leading-none">
                                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wide">Cases</span>
                                                <span className="text-[13px] font-black text-gray-800 mt-0.5">{fmtI(h.TOTAL_CASES)}</span>
                                            </div>
                                            <div className="w-px h-6 bg-gray-200" />
                                            <div className="flex flex-col items-center leading-none">
                                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wide">Total</span>
                                                <span className="text-[13px] font-black text-green-700 mt-0.5">${fmt(h.TOTAL_INVOICE)}</span>
                                            </div>
                                            {parseFloat(h.INVOICE_BALANCE ?? 0) > 0 && <>
                                                <div className="w-px h-6 bg-gray-200" />
                                                <div className="flex flex-col items-center leading-none">
                                                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wide">Balance</span>
                                                    <span className="text-[13px] font-black text-red-600 mt-0.5">${fmt(h.INVOICE_BALANCE)}</span>
                                                </div>
                                            </>}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* RIGHT: Invoice detail ───────────────────────────────── */}
                <div className="flex-1 flex flex-col min-h-0 min-w-0 gap-2">
                    {!activeInvoiceUq ? (
                        <div className="flex-1 flex items-center justify-center bg-white rounded-lg border border-gray-200 shadow-sm">
                            <div className="text-center text-gray-400">
                                <ShoppingCart size={40} className="mx-auto mb-3 opacity-20" />
                                <p className="text-sm font-bold uppercase tracking-widest">Select an invoice</p>
                                <p className="text-xs mt-1">Or create a new one</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* ── Invoice Header card ───────────────────── */}
                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden shrink-0">
                                {/* Orange action bar */}
                                <div className="bg-[#FB7506] px-3 py-1.5 flex items-center gap-1.5 flex-wrap overflow-x-auto">
                                    {isOpen && <ActionBtn icon={Lock}     label="Close"   onClick={handleCloseInvoice} disabled={working} />}
                                    {isClosed && <ActionBtn icon={Unlock} label="Open"    onClick={handleOpenInvoice}  disabled={working} />}
                                    {isOpen && <ActionBtn icon={XCircle}  label="Void"    onClick={handleVoidInvoice}  disabled={working} variant="danger" />}
                                    <ActionBtn icon={Trash2}  label="Delete"  onClick={handleDeleteInvoice}  disabled={working || !canDelete} variant="danger" />
                                    <div className="w-px h-4 bg-white/30 shrink-0" />
                                    <ActionBtn icon={Printer}  label="Print"   onClick={() => {}} />
                                    <ActionBtn icon={FileText} label="Pick List" onClick={() => {}} />
                                    <ActionBtn icon={CreditCard} label="Payment" onClick={() => {}} />
                                    <ActionBtn icon={Edit2}    label="Edit Header" onClick={() => {}} />
                                    <ActionBtn icon={RotateCcw} label="Log"    onClick={() => {}} />
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

                            {/* ── Tabs + content ────────────────────────── */}
                            <div className="flex-1 flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden min-h-0">
                                {/* Tab bar */}
                                <div className="bg-gray-100 border-b border-gray-200 px-2 pt-1.5 flex items-end gap-1 shrink-0 overflow-x-auto">
                                    {(["lines", "stock", "history"] as const).map(tab => (
                                        <button key={tab} onClick={() => setActiveTab(tab)}
                                            className={cn(
                                                "px-3 py-1.5 text-[10px] font-black uppercase tracking-widest whitespace-nowrap rounded-t-md transition-all border border-b-0",
                                                activeTab === tab ? "bg-white border-gray-200 text-[#FB7506] shadow-sm" : "bg-transparent border-transparent text-gray-500 hover:bg-white/60"
                                            )}
                                        >
                                            {tab === "lines"   && "Invoice Lines"}
                                            {tab === "stock"   && "Available Stock"}
                                            {tab === "history" && "Invoice History"}
                                        </button>
                                    ))}
                                    {/* Tab-specific toolbar */}
                                    <div className="ml-auto flex items-center gap-1 pb-1 pr-1 shrink-0">
                                        {activeTab === "lines" && isOpen && <>
                                            <ActionBtn icon={Plus}  label="Add from Stock" onClick={() => setActiveTab("stock")} size="sm" variant="orange" />
                                            <ActionBtn icon={Scan}  label="Barcode"  onClick={() => { setScanModal(true); setTimeout(() => scanInputRef.current?.focus(), 100); }} size="sm" variant="dark" />
                                        </>}
                                        {activeTab === "stock" && <>
                                            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded px-2 py-1">
                                                <Search size={10} className="text-gray-400" />
                                                <input value={stockSearch} onChange={e => setStockSearch(e.target.value)}
                                                    onKeyDown={e => { if (e.key === "Enter") { setAppliedStockSearch(stockSearch); setStockPage(1); }}}
                                                    placeholder="Search stock..." className="text-[10px] focus:outline-none w-28 bg-transparent" />
                                                {stockSearch && <button onClick={() => { setStockSearch(""); setAppliedStockSearch(""); }}><X size={10} className="text-gray-400" /></button>}
                                            </div>
                                            <span className="text-[10px] text-gray-400">{stockRows.length}/{stockTotal}</span>
                                        </>}
                                    </div>
                                </div>

                                {/* ── Invoice Lines ─────────────────────── */}
                                {activeTab === "lines" && (
                                    <div className="flex-1 overflow-auto min-h-0">
                                        <table className="min-w-full text-left">
                                            <thead>
                                                <tr>
                                                    <Th>{" "}</Th>
                                                    <Th>Farm</Th><Th>Description</Th><Th>Vendor</Th>
                                                    <Th className="text-right">BoxQty</Th>
                                                    <Th className="text-right">UxBox</Th>
                                                    <Th className="text-right">Price</Th>
                                                    <Th className="text-right">T.Units</Th>
                                                    <Th className="text-right">Ext.Price</Th>
                                                    <Th className="text-right">GPM%</Th>
                                                    <Th>Case</Th><Th>Lot</Th><Th>AWB</Th>
                                                    <Th>Days</Th>
                                                    <Th className="text-center">Ready</Th>
                                                    <Th className="text-center">Appr.</Th>
                                                    {isOpen && <Th>{" "}</Th>}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loadingLines && <tr><td colSpan={16} className="p-6 text-center text-gray-400 italic"><Loader2 size={13} className="animate-spin inline mr-1" />Loading...</td></tr>}
                                                {!loadingLines && (invoiceLines as any[]).length === 0 && <tr><td colSpan={16} className="p-8 text-center text-gray-400 italic">No lines — add from Available Stock</td></tr>}
                                                {(invoiceLines as any[]).map((l: any, i: number) => {
                                                    const bg = vfpRowStyle(l.BACK_COLOR ?? l.BACKCOLOR);
                                                    return (
                                                        <tr key={i} className={cn("border-b text-gray-600 hover:bg-blue-50 transition-colors", !bg && (i%2===0?"bg-white":"bg-gray-50"))}
                                                            style={bg ?? undefined}>
                                                            <Td>
                                                                <img
                                                                    src={productImages[t(l.PRODUCT_UQ)] || DEFAULT_THUMB}
                                                                    alt="" width={32} height={32}
                                                                    className="w-8 h-8 object-cover rounded border border-gray-200 shrink-0"
                                                                    onError={e => { (e.target as HTMLImageElement).src = DEFAULT_THUMB; }}
                                                                />
                                                            </Td>
                                                            <Td className="font-bold text-[#FB7506]">{t(l.FARM)}</Td>
                                                            <Td className="max-w-[200px] truncate font-medium">{t(l.DESCRIPTION)}</Td>
                                                            <Td className="max-w-[100px] truncate">{t(l.GROWER)}</Td>
                                                            <Td className="text-right font-semibold">{fmtI(l.BOX_QTY)}</Td>
                                                            <Td className="text-right">{fmtI(l.UNITS_X_BOX)}</Td>
                                                            <Td className="text-right font-semibold">${fmt(l.PRICE)}</Td>
                                                            <Td className="text-right">{fmtI(l.TOTAL_UNITS)}</Td>
                                                            <Td className="text-right font-bold text-green-700">{t(l.EXT_PRICE)}</Td>
                                                            <Td className={cn("text-right font-bold", parseMoney(l.GPM) < 0 ? "text-red-600" : "text-gray-700")}>{fmt(l.GPM)}%</Td>
                                                            <Td>{t(l.CASE_NAME ?? l.CASE_SH)}</Td>
                                                            <Td>{t(l.LOTE)}</Td>
                                                            <Td className="font-mono text-blue-700">{t(l.AWBCODE)}</Td>
                                                            <Td>{fmtI(l.DAYS)}</Td>
                                                            <Td className="text-center">{bool(l.READY_TRAN) ? <Check size={11} className="text-green-600 inline" /> : ""}</Td>
                                                            <Td className="text-center">{bool(l.APPROVED) ? <CheckCircle size={11} className="text-green-600 inline" /> : <AlertCircle size={11} className="text-amber-500 inline" />}</Td>
                                                            {isOpen && <Td>
                                                                <div className="flex items-center gap-1">
                                                                    <button onClick={() => openEditLine(l)} disabled={working}
                                                                        className="text-blue-400 hover:text-blue-600 disabled:opacity-40 p-0.5" title="Edit line">
                                                                        <Edit2 size={11} />
                                                                    </button>
                                                                    <button onClick={() => handleDeleteLine(t(l.UNICO))} disabled={working}
                                                                        className="text-red-400 hover:text-red-600 disabled:opacity-40 p-0.5" title="Delete line">
                                                                        <Trash2 size={11} />
                                                                    </button>
                                                                </div>
                                                            </Td>}
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* ── Available Stock ───────────────────── */}
                                {activeTab === "stock" && (
                                    <div className="flex-1 overflow-auto min-h-0">
                                        <table className="min-w-full text-left">
                                            <thead>
                                                <tr>
                                                    {[
                                                        { col: "", label: "" },
                                                        { col: "", label: isOpen ? "Add" : "" },
                                                        { col: "description", label: "Description" },
                                                        { col: "farm",        label: "Farm" },
                                                        { col: "grower",      label: "Vendor" },
                                                        { col: "box_date",    label: "Date" },
                                                        { col: "days",        label: "Days" },
                                                        { col: "awbcode",     label: "AWB" },
                                                        { col: "bunches_case",label: "Bch/Case" },
                                                        { col: "units_bunch", label: "U/Bch" },
                                                        { col: "tunits_x_box",label: "U/Box" },
                                                        { col: "total_units", label: "T.Units" },
                                                        { col: "price_x_unit",label: "Price" },
                                                        { col: "wh_stock",    label: "Stock" },
                                                        { col: "case_sh",     label: "Case" },
                                                        { col: "gprofit",     label: "GPM%" },
                                                        { col: "box_id",      label: "BoxID" },
                                                    ].map(({ col, label }) => (
                                                        <th key={label}
                                                            onClick={col ? () => toggleStockSort(col) : undefined}
                                                            className={cn("px-2 py-1.5 text-left font-bold whitespace-nowrap text-gray-700 border-l border-gray-200 first:border-l-0 bg-gray-100 sticky top-0 z-10 text-[11px]", col && "cursor-pointer hover:bg-gray-200 select-none")}>
                                                            {label}{stockSortCol === col && <span className="ml-1">{stockSortDir === "ASC" ? "↑" : "↓"}</span>}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {stockLoading && stockRows.length === 0 && <tr><td colSpan={16} className="p-8 text-center text-gray-400 italic"><Loader2 size={13} className="animate-spin inline mr-1" />Loading...</td></tr>}
                                                {!stockLoading && stockRows.length === 0 && <tr><td colSpan={16} className="p-8 text-center text-gray-400 italic">No stock available</td></tr>}
                                                {stockRows.map((s: any, i: number) => {
                                                    const bg = vfpRowStyle(s.BACK_COLOR ?? s.BACKCOLOR);
                                                    return (
                                                        <tr key={i} className={cn("border-b text-gray-600 hover:bg-blue-50 transition-colors", !bg && (i%2===0?"bg-white":"bg-gray-50"))}
                                                            style={bg ?? undefined}>
                                                            <Td>
                                                                <img
                                                                    src={productImages[t(s.PRODUCT_UQ ?? s.BOX_PACK_UQ ?? "")] || DEFAULT_THUMB}
                                                                    alt="" width={32} height={32}
                                                                    className="w-8 h-8 object-cover rounded border border-gray-200 shrink-0"
                                                                    onError={e => { (e.target as HTMLImageElement).src = DEFAULT_THUMB; }}
                                                                />
                                                            </Td>
                                                            <Td>
                                                                {isOpen && (
                                                                    <button onClick={() => handleAddLine(s)} disabled={working}
                                                                        className="flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-black bg-[#FB7506] hover:bg-orange-500 text-white rounded disabled:opacity-40">
                                                                        <Plus size={9} />Add
                                                                    </button>
                                                                )}
                                                            </Td>
                                                            <Td className="max-w-[200px] truncate font-medium">{t(s.DESCRIPTION)}</Td>
                                                            <Td className="font-bold text-[#FB7506]">{t(s.FARM)}</Td>
                                                            <Td className="max-w-[100px] truncate">{t(s.GROWER)}</Td>
                                                            <Td>{fmtDate(s.BOX_DATE)}</Td>
                                                            <Td className="text-right">{fmtI(s.DAYS)}</Td>
                                                            <Td className="font-mono text-blue-700">{t(s.AWBCODE)}</Td>
                                                            <Td className="text-right">{fmtI(s.BUNCHES_CASE)}</Td>
                                                            <Td className="text-right">{fmtI(s.UNITS_BUNCH)}</Td>
                                                            <Td className="text-right font-semibold">{fmtI(s.TUNITS_X_BOX)}</Td>
                                                            <Td className="text-right">{fmtI(s.TOTAL_UNITS)}</Td>
                                                            <Td className="text-right font-black text-green-700">${fmt(s.PRICE_X_UNIT)}</Td>
                                                            <Td className="text-right font-bold">{fmtI(s.WH_STOCK)}</Td>
                                                            <Td>{t(s.CASE_SH ?? s.CASE_NAME)}</Td>
                                                            <Td className={cn("text-right font-bold", parseFloat(s.GPROFIT ?? 0) < 0 ? "text-red-600" : "text-gray-700")}>{fmt(s.GPROFIT)}%</Td>
                                                            <Td className="font-mono text-[10px]">{t(s.BOX_ID)}</Td>
                                                        </tr>
                                                    );
                                                })}
                                                <tr><td colSpan={16}>
                                                    <div ref={sentinelRef} className="flex items-center justify-center py-3 text-[10px] text-gray-400">
                                                        {stockLoading && stockRows.length > 0 && <><Loader2 size={12} className="animate-spin mr-1" />Loading more...</>}
                                                        {!stockLoading && !stockHasMore && stockRows.length > 0 && <span className="italic">All {stockTotal.toLocaleString()} items loaded</span>}
                                                    </div>
                                                </td></tr>
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* ── Invoice History ───────────────────── */}
                                {activeTab === "history" && (
                                    <div className="flex flex-col flex-1 overflow-hidden min-h-0">
                                        {/* History filters */}
                                        <div className="px-3 py-2 flex flex-wrap items-center gap-2 border-b border-gray-100 shrink-0 bg-gray-50">
                                            <div className="flex items-center gap-1">
                                                <span className="text-[10px] font-bold text-gray-500">Customer:</span>
                                                <input value={histCustSearch} onChange={e => setHistCustSearch(e.target.value)}
                                                    placeholder="Search or leave blank for all"
                                                    className="text-[10px] border border-gray-200 rounded px-2 py-1 focus:outline-none w-44" />
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="text-[10px] font-bold text-gray-500">From:</span>
                                                <input type="date" value={histFrom} onChange={e => setHistFrom(e.target.value)} className="text-[10px] border border-gray-200 rounded px-2 py-1 focus:outline-none" />
                                                <span className="text-[10px] font-bold text-gray-500">To:</span>
                                                <input type="date" value={histTo}   onChange={e => setHistTo(e.target.value)}   className="text-[10px] border border-gray-200 rounded px-2 py-1 focus:outline-none" />
                                            </div>
                                            <button onClick={() => qc.invalidateQueries({ queryKey: ["pos-hist-list", histCustUq, histFrom, histTo, salesmanUq] })}
                                                className="flex items-center gap-1 px-2 py-1 text-[10px] font-black bg-[#374151] text-white rounded hover:bg-gray-600">
                                                <Search size={10} />Search
                                            </button>
                                        </div>
                                        {/* History list + detail split */}
                                        <div className="flex flex-1 overflow-hidden min-h-0 gap-2 p-2">
                                            {/* History invoice list */}
                                            <div className="w-[320px] shrink-0 border border-gray-200 rounded overflow-hidden flex flex-col">
                                                <div className="bg-[#374151] px-3 py-1.5 shrink-0">
                                                    <span className="font-black text-[10px] text-white uppercase tracking-widest">History</span>
                                                </div>
                                                <div className="flex-1 overflow-auto">
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
                                                </div>
                                            </div>
                                            {/* History detail */}
                                            <div className="flex-1 border border-gray-200 rounded overflow-hidden flex flex-col min-w-0">
                                                <div className="bg-[#374151] px-3 py-1.5 flex items-center gap-2 shrink-0">
                                                    {(["details","credits","statement"] as const).map(sub => (
                                                        <button key={sub} onClick={() => setHistSubTab(sub)}
                                                            className={cn("px-2 py-0.5 text-[10px] font-black uppercase rounded transition-all",
                                                                histSubTab === sub ? "bg-[#FB7506] text-white" : "text-gray-400 hover:text-white")}>
                                                            {sub}
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className="flex-1 overflow-auto min-h-0">
                                                    {!histInvoiceUq && <p className="p-6 text-center text-gray-400 italic text-[11px]">Select an invoice</p>}
                                                    {histInvoiceUq && (histDetails as any[]).length === 0 && <p className="p-6 text-center text-gray-400 italic text-[11px]">No data</p>}
                                                    {histInvoiceUq && histSubTab === "details" && (histDetails as any[]).length > 0 && (
                                                        <table className="min-w-full text-left">
                                                            <thead><tr>
                                                                <Th>Product</Th><Th>Farm</Th><Th>Vendor</Th>
                                                                <Th className="text-right">BoxQty</Th><Th className="text-right">UxBox</Th>
                                                                <Th className="text-right">Price</Th><Th className="text-right">T.Units</Th>
                                                                <Th className="text-right">Ext.Price</Th><Th className="text-right">Credits</Th>
                                                                <Th>Case</Th><Th>AWB</Th><Th>Lot</Th>
                                                            </tr></thead>
                                                            <tbody>
                                                                {(histDetails as any[]).map((r: any, i: number) => (
                                                                    <tr key={i} className={cn("border-b text-gray-600", i%2===0?"bg-white":"bg-gray-50")}>
                                                                        <Td className="max-w-[200px] truncate font-medium">{t(r.DESCRIPTION)}</Td>
                                                                        <Td className="font-bold text-[#FB7506]">{t(r.FARM)}</Td>
                                                                        <Td className="max-w-[100px] truncate">{t(r.GROWER ?? r.VENDOR)}</Td>
                                                                        <Td className="text-right">{fmtI(r.BOX_QTY)}</Td>
                                                                        <Td className="text-right">{fmtI(r.UNITS_X_BOX)}</Td>
                                                                        <Td className="text-right font-semibold">${fmt(r.PRICE ?? r.PRICE_X_U)}</Td>
                                                                        <Td className="text-right">{fmtI(r.TOTAL_UNITS)}</Td>
                                                                        <Td className="text-right font-bold text-green-700">${fmt(r.EXT_PRICE)}</Td>
                                                                        <Td className="text-right text-red-600">{fmt(r.CREDITS)}</Td>
                                                                        <Td>{t(r.CASE_SH ?? r.CASE_NAME)}</Td>
                                                                        <Td className="font-mono text-blue-700">{t(r.AWBCODE ?? r.AWB)}</Td>
                                                                        <Td>{t(r.LOTE ?? r.LOT)}</Td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    )}
                                                    {histInvoiceUq && histSubTab === "credits" && (histDetails as any[]).length > 0 && (
                                                        <table className="min-w-full text-left">
                                                            <thead><tr>
                                                                <Th>Product</Th><Th>Reason</Th>
                                                                <Th className="text-right">Units</Th><Th className="text-right">Amount</Th>
                                                                <Th>Details</Th>
                                                            </tr></thead>
                                                            <tbody>
                                                                {(histDetails as any[]).map((r: any, i: number) => (
                                                                    <tr key={i} className={cn("border-b text-gray-600", i%2===0?"bg-white":"bg-gray-50")}>
                                                                        <Td className="max-w-[180px] truncate font-medium">{t(r.DESCRIPTION)}</Td>
                                                                        <Td>{t(r.REASON)}</Td>
                                                                        <Td className="text-right">{fmtI(r.CR_UNITS)}</Td>
                                                                        <Td className="text-right font-bold text-red-600">${fmt(r.CR_REQUEST ?? r.AMOUNT)}</Td>
                                                                        <Td className="max-w-[200px] truncate">{t(r.DETAILS)}</Td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    )}
                                                    {histSubTab === "statement" && (histDetails as any[]).length > 0 && (
                                                        <table className="min-w-full text-left">
                                                            <thead><tr>
                                                                <Th>Date</Th><Th>Type</Th><Th>Invoice</Th>
                                                                <Th className="text-right">Debits</Th><Th className="text-right">Credits</Th>
                                                                <Th className="text-right">Balance</Th>
                                                                <Th className="text-right">0-30</Th><Th className="text-right">30-60</Th>
                                                                <Th className="text-right">60-90</Th><Th className="text-right">90+</Th>
                                                            </tr></thead>
                                                            <tbody>
                                                                {(histDetails as any[]).map((r: any, i: number) => (
                                                                    <tr key={i} className={cn("border-b text-gray-600", i%2===0?"bg-white":"bg-gray-50")}>
                                                                        <Td>{t(r.FECHA ?? r.DATE)}</Td>
                                                                        <Td>{t(r.TYPE)}</Td>
                                                                        <Td className="font-bold text-blue-700">{t(r.INVOICE_NO)}</Td>
                                                                        <Td className="text-right">${fmt(r.DEBITS)}</Td>
                                                                        <Td className="text-right text-green-700">${fmt(r.CREDITS)}</Td>
                                                                        <Td className={cn("text-right font-bold", parseFloat(r.BALANCE ?? 0) > 0 ? "text-red-600" : "text-green-600")}>${fmt(r.BALANCE)}</Td>
                                                                        <Td className="text-right">${fmt(r.T0_30)}</Td>
                                                                        <Td className="text-right">${fmt(r.T30_60)}</Td>
                                                                        <Td className="text-right">${fmt(r.T60_90)}</Td>
                                                                        <Td className="text-right">${fmt(r.T90_120 ?? r.T120)}</Td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
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
                                    <table className="min-w-full text-left text-[11px]">
                                        <thead className="sticky top-0 bg-gray-100 border-b">
                                            <tr>
                                                <th className="px-3 py-1.5 font-bold text-gray-700">Customer</th>
                                                <th className="px-3 py-1.5 font-bold text-gray-700">Contact</th>
                                                <th className="px-3 py-1.5 font-bold text-gray-700">City</th>
                                                <th className="px-3 py-1.5 font-bold text-gray-700">Phone</th>
                                                <th className="px-3 py-1.5 font-bold text-gray-700">Last Sale</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ccCustomers.map((c: any, i: number) => (
                                                <tr key={i} onClick={() => selectCcCustomer(c)}
                                                    className="border-b cursor-pointer hover:bg-blue-50 transition-colors odd:bg-white even:bg-gray-50">
                                                    <td className="px-3 py-1.5 font-medium text-gray-800">{t(c.CUST_CODE ?? c.CUSTOMER ?? c.CUST_NAME)}</td>
                                                    <td className="px-3 py-1.5 text-gray-600">{t(c.CONTACT ?? c.CONTACT_NAME)}</td>
                                                    <td className="px-3 py-1.5 text-gray-600">{t(c.CITY)}, {t(c.STATE)}</td>
                                                    <td className="px-3 py-1.5 text-gray-600">{t(c.PHONE_1 ?? c.PHONE)}</td>
                                                    <td className="px-3 py-1.5 text-gray-500">{fmtDate(c.LAST_SALE ?? c.LAST_INVOICE)}</td>
                                                </tr>
                                            ))}
                                            {!ccLoading && ccCustomers.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-400 italic">Type to search customers</td></tr>}
                                        </tbody>
                                    </table>
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
            <AppFooter areaLabel="Terminal" />
        </div>
    );
}
