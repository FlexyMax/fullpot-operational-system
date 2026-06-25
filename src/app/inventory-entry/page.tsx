"use client";

import { useState, useMemo, useCallback, useEffect, useRef, type CSSProperties } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Package, RefreshCcw, Plus, Pencil, Trash2,
    Search, X, Save, ChevronDown, Calendar, FileText,
    AlertCircle, Check, Copy, ArrowRight, Warehouse,
    ClipboardList, Boxes, BarChart2, Plane,
    ShoppingCart, Flower2, Layers,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import AppFooter from "@/components/layout/AppFooter";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { GridMenu } from "@/components/GridMenu";
import { usePagePermissions } from "@/lib/permissions";
import { useAuditLog } from "@/lib/audit";
import { ModalBoxMove }              from "@/components/inventory-entry/ModalBoxMove";
import { ModalSelectPWarehouse }     from "@/components/inventory-entry/ModalSelectPWarehouse";
import { ModalWhouseTotals }         from "@/components/inventory-entry/ModalWhouseTotals";
import { ModalSendToWhouse }         from "@/components/inventory-entry/ModalSendToWhouse";
import { ModalHeaderCopy }           from "@/components/inventory-entry/ModalHeaderCopy";
import { ModalFilterGrowers }        from "@/components/inventory-entry/ModalFilterGrowers";
import { ModalFilterCustomers }      from "@/components/inventory-entry/ModalFilterCustomers";
import { ModalBoxPO }                from "@/components/inventory-entry/ModalBoxPO";
import { ModalBoxWHControl }         from "@/components/inventory-entry/ModalBoxWHControl";
import { ModalAWBSetup }             from "@/components/inventory-entry/ModalAWBSetup";
import { ModalDeletePackingDetails } from "@/components/inventory-entry/ModalDeletePackingDetails";
import { ModalHeader2 }              from "@/components/inventory-entry/ModalHeader2";
import { ModalWarehouseTransfer }    from "@/components/inventory-entry/ModalWarehouseTransfer";
import { ModalBoxNotes }             from "@/components/inventory-entry/ModalBoxNotes";
import { ModalBoxComposition }       from "@/components/inventory-entry/ModalBoxComposition";
import { ModalBoxTransform }         from "@/components/inventory-entry/ModalBoxTransform";
import { ModalBoxRepacking }         from "@/components/inventory-entry/ModalBoxRepacking";
import { ModalAddProductToPacking }  from "@/components/inventory-entry/ModalAddProductToPacking";
import { ModalAvailableDate }        from "@/components/inventory-entry/ModalAvailableDate";
import { AuditLogModal }             from "@/components/AuditLogModal";
const EMPTY_ARR: any[] = [];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const t   = (v: any) => String(v ?? "").trim();
const norm = (rows: any[]) => rows.map(r => {
    const n: any = {};
    for (const [k, v] of Object.entries(r)) n[k.toUpperCase()] = v;
    return n;
});
const fmt2 = (v: any) => parseFloat(v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmt4 = (v: any) => parseFloat(v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
const today = () => new Date().toISOString().split("T")[0];
const fmtDate = (v: any): string => {
    const s = t(v);
    if (!s) return "";
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.substring(0, 10);
    const d = new Date(s);
    return isNaN(d.getTime()) ? s.trim() : d.toISOString().substring(0, 10);
};
// VFP stores colors as R + G*256 + B*65536 (low byte = Red, high byte = Blue)
const colorFromInt = (n: any) => {
    if (n == null) return undefined;
    const num = Number(n);
    if (isNaN(num) || num === 0) return undefined;
    const r = num & 0xFF;
    const g = (num >> 8) & 0xFF;
    const b = (num >> 16) & 0xFF;
    return `rgb(${r}, ${g}, ${b})`;
};
// Subtle tint for web: left border + very faint background
const subtleColorFromInt = (n: any): CSSProperties | undefined => {
    const c = colorFromInt(n);
    if (!c) return undefined;
    const rgb = c.replace("rgb(", "").replace(")", "").split(",").map(v => parseInt(v.trim()));
    return {
        borderLeftColor: c,
        borderLeftWidth: "3px",
        borderLeftStyle: "solid",
        backgroundColor: `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.06)`,
    };
};

// ─── Empty forms ──────────────────────────────────────────────────────────────
const EMPTY_PACKING: any = {
    unico: "", grower_uq: "", packing_no: "", invoice_date: today(),
    invoice_no: "", airline_code: "", awbnumber: "", details: "",
    porder_no: 0, wphysical_uq: "", available_date: today(),
    consolidated: false,
};

const EMPTY_BOX: any = {
    unico: "", product_uq: "", product_desc: "", case_uq: "",
    cporder_no: "", box_qty: 0, packs_box: 0, packs_units: 0, stem_pack: false,
    lote: 0, cut_point: 2, box_id: "",
    price_x_u: 0, f_cost_x_u: 0,
    freight_cost: 0, duties_cost: 0, broker_cost: 0, handling_cost: 0, charge_cost: 0,
    inventory_notes: "",
};

// VFP calc: units/box = stem_pack ? packs_box*packs_units : packs_box; cost/unit derived from charges, not stored directly
const calcBox = (f: any) => {
    const unitsXBox  = f.stem_pack ? (f.packs_box || 0) * (f.packs_units || 0) : (f.packs_box || 0);
    const totalUnits = unitsXBox * (f.box_qty || 0);
    const tCharges   = ((f.freight_cost || 0) + (f.duties_cost || 0) + (f.broker_cost || 0) +
                        (f.handling_cost || 0) + (f.charge_cost || 0)) * (f.box_qty || 0);
    const cCostXU    = totalUnits > 0 ? tCharges / totalUnits : 0;
    return {
        ...f,
        units_x_box: unitsXBox,
        total_units: totalUnits,
        t_charges:   tCharges,
        c_cost_x_u:  cCostXU,
        t_cost_x_u:  cCostXU + (f.f_cost_x_u || 0),
        t_price:     totalUnits * (f.price_x_u || 0),
    };
};

type LeftTab = "awbpackings" | "products" | "plcontrol" | "awbsearch" | "polist";

// ─── Audit helper ─────────────────────────────────────────────────────────────
const AUDIT_MAP: Record<string, { table: string; ext: string }> = {
    "insert-packing":  { table: "flower_packing",             ext: "Insert Packing List FlexyMaxApp" },
    "update-packing":  { table: "flower_packing",             ext: "Update Packing List FlexyMaxApp" },
    "delete-packing":  { table: "flower_packing",             ext: "Delete Packing List FlexyMaxApp" },
    "open-packing":    { table: "flower_packing",             ext: "Open Packing FlexyMaxApp" },
    "close-packing":   { table: "flower_packing",             ext: "Close Packing FlexyMaxApp" },
    "copy-packing":    { table: "flower_packing",             ext: "Copy Packing FlexyMaxApp" },
    "change-awb":      { table: "flower_packing",             ext: "Change AWB FlexyMaxApp" },
    "insert-box":      { table: "flower_packing_box",         ext: "Insert Inventory Box FlexyMaxApp" },
    "update-box":      { table: "flower_packing_box",         ext: "Update Inventory Box FlexyMaxApp" },
    "delete-box":      { table: "flower_packing_box",         ext: "Delete Inventory Box FlexyMaxApp" },
    "copy-box":        { table: "flower_packing_box",         ext: "Copy Inventory Box FlexyMaxApp" },
    "move-box":        { table: "flower_packing_box",         ext: "Move Inventory Box FlexyMaxApp" },
    "transfer-box":    { table: "flower_packing_box",         ext: "Transfer Inventory Box FlexyMaxApp" },
    "repacking":       { table: "flower_packing_box",         ext: "Repacking Inventory Box FlexyMaxApp" },
    "transform":       { table: "flower_packing_box",         ext: "Transform Inventory Box FlexyMaxApp" },
    "to-whouse":       { table: "flower_packing_stock",       ext: "Send Packing to Warehouse FlexyMaxApp" },
    "change-prices":   { table: "flower_packing_box",         ext: "Update Box Prices FlexyMaxApp" },
    "whcontrol":       { table: "flower_packing_box",         ext: "Update WH Control FlexyMaxApp" },
    "box-notes":       { table: "flower_packing_box",         ext: "Update Box Notes FlexyMaxApp" },
    "box-composition": { table: "flower_packing_box_bunches_composition", ext: "Update Box Composition FlexyMaxApp" },
    "available-date":  { table: "flower_packing",             ext: "Update Available Date FlexyMaxApp" },
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function InventoryEntryPage() {
    const { data: session, status } = useSession();
    const router  = useRouter();
    const qc      = useQueryClient();
    const perms   = usePagePermissions("inventory-entry");
    const { logAction } = useAuditLog("inventory-entry", "flower_packing");

    // ── Core state ────────────────────────────────────────────────────────────
    const [lddate,       setLddate]       = useState(today());
    const [lcawbInput,   setLcawbInput]   = useState("");
    const [lcawb,        setLcawb]        = useState("%");
    const [lcgrower_uq,  setLcgrower_uq]  = useState("");
    const [lcawbcode,    setLcawbcode]    = useState("");   // selected AWB from left Tab1
    const [lcpack_uq,    setLcpack_uq]    = useState("");   // selected packing (right upper)
    const [lcpk_box_uq,  setLcpk_box_uq]  = useState("");   // selected box (right lower)
    const [activeTab,    setActiveTab]    = useState<LeftTab>("awbpackings");
    const [tabLoaded,    setTabLoaded]    = useState<Partial<Record<LeftTab, boolean>>>({ awbpackings: true });

    // PO List tab
    const [ldship_date,  setLdship_date]  = useState(today());
    const [poGrower,     setPoGrower]     = useState("");   // clicked grower in PO summary

    // AWB Search tab
    const [awbSearchInput, setAwbSearchInput] = useState("");
    const [awbSearchQ,     setAwbSearchQ]     = useState("");  // committed query
    const [awbSearchPage,  setAwbSearchPage]  = useState(1);
    const [awbAccRows,     setAwbAccRows]     = useState<any[]>([]);
    const [awbTotal,       setAwbTotal]       = useState(0);
    const AWB_PAGE_SIZE = 50;

    // Products tab
    const [prodSearchInput, setProdSearchInput] = useState("");
    const [prodSearch,      setProdSearch]      = useState("");   // committed query
    const [prodPage,        setProdPage]        = useState(1);
    const [prodAccRows,     setProdAccRows]     = useState<any[]>([]);
    const [prodTotal,       setProdTotal]       = useState(0);
    const PROD_PAGE_SIZE = 50;

    // ── Packing modal ─────────────────────────────────────────────────────────
    const [modalPacking,     setModalPacking]     = useState(false);
    const [modalPackingMode, setModalPackingMode] = useState<"add" | "edit">("add");
    const [packForm,         setPackForm]         = useState<any>(EMPTY_PACKING);
    const [packSaving,       setPackSaving]       = useState(false);
    const [packError,        setPackError]        = useState<string | null>(null);

    // ── Box modal ─────────────────────────────────────────────────────────────
    const [modalBox,     setModalBox]     = useState(false);
    const [modalBoxMode, setModalBoxMode] = useState<"add" | "edit">("add");
    const [boxForm,      setBoxForm]      = useState<any>(EMPTY_BOX);
    const [boxSaving,    setBoxSaving]    = useState(false);
    const [boxError,     setBoxError]     = useState<string | null>(null);
    const [prodPickQuery,      setProdPickQuery]      = useState("");
    const [prodPickResults,    setProdPickResults]    = useState<any[]>([]);
    const [prodPickSearching,  setProdPickSearching]  = useState(false);

    // ── Change AWB modal ──────────────────────────────────────────────────────
    const [modalChgAwb, setModalChgAwb] = useState(false);
    const [chgAwbForm,  setChgAwbForm]  = useState({ airline_code: "", awbnumber: "", date_invo: today() });
    const [chgAwbSaving, setChgAwbSaving] = useState(false);

    // ── New modals ────────────────────────────────────────────────────────────
    const [modalBoxMove,     setModalBoxMove]     = useState(false);
    const [modalSelectPWH,   setModalSelectPWH]   = useState(false);
    const [modalWhTotals,    setModalWhTotals]    = useState(false);
    const [modalSendWH,      setModalSendWH]      = useState(false);
    const [modalCopy,        setModalCopy]        = useState(false);
    const [modalFiltGrowers, setModalFiltGrowers] = useState(false);
    const [modalFiltCust,    setModalFiltCust]    = useState(false);
    const [modalBoxPO,       setModalBoxPO]       = useState(false);
    const [modalBoxWHCtrl,   setModalBoxWHCtrl]   = useState(false);
    const [modalAWBSetup,    setModalAWBSetup]    = useState(false);
    const [modalDelDetails,  setModalDelDetails]  = useState(false);
    const [modalHeader2,     setModalHeader2]     = useState(false);
    const [modalTransfer,    setModalTransfer]    = useState(false);
    const [modalNotes,        setModalNotes]        = useState(false);
    const [modalComposition,  setModalComposition]  = useState(false);
    const [modalTransform,    setModalTransform]    = useState(false);
    const [modalRepacking,    setModalRepacking]    = useState(false);
    const [modalAvailDate,    setModalAvailDate]    = useState(false);
    const [modalAddProdPack,  setModalAddProdPack]  = useState(false);
    const [selectedProduct,   setSelectedProduct]   = useState<any>(null);

    // ── Change Prices inline-edit mode (Boxes Detail grid) ────────────────────
    const [changePricesMode, setChangePricesMode] = useState(false);
    const [priceEdits,       setPriceEdits]       = useState<Record<string, number>>({});
    const [savingPrices,     setSavingPrices]     = useState(false);

    // ── Filter state ──────────────────────────────────────────────────────────
    const [filterGrowerUq,  setFilterGrowerUq]  = useState("");
    const [filterCustomer,  setFilterCustomer]  = useState("");

    // ── Queries ───────────────────────────────────────────────────────────────
    const { data: lookups } = useQuery({
        queryKey: ["ie-lookups"],
        queryFn:  () => fetch("/api/inventory-entry/lookups").then(r => r.json()),
        staleTime: 1000 * 60 * 10,
    });
    const growers    = useMemo(() => norm(lookups?.growers    ?? []), [lookups]);
    const cases      = useMemo(() => norm(lookups?.cases      ?? []), [lookups]);
    const warehouses = useMemo(() => norm(lookups?.warehouses ?? []), [lookups]);
    const airlines   = useMemo(() => norm(lookups?.airlines   ?? []), [lookups]);

    const { data: awbByDate = EMPTY_ARR, isFetching: loadingAwb, refetch: refetchAwb } = useQuery({
        queryKey: ["ie-awb-by-date", lddate],
        queryFn:  () => fetch(`/api/inventory-entry/awb-by-date?date=${lddate}`).then(r => r.json()).then(d => norm(Array.isArray(d) ? d : [])),
        staleTime: 0,
        enabled:  !!lddate,
    });

    const { data: packingXAwb = EMPTY_ARR, isFetching: loadingPacking, refetch: refetchPacking } = useQuery({
        queryKey: ["ie-packing-x-awb", lcawb, lddate],
        queryFn:  () => fetch(`/api/inventory-entry/packing-x-awb?awb=${encodeURIComponent(lcawb)}&date=${lddate}`).then(r => r.json()).then(d => norm(Array.isArray(d) ? d : [])),
        staleTime: 0,
    });

    const { data: boxesDetail = EMPTY_ARR, isFetching: loadingBoxes, refetch: refetchBoxes } = useQuery({
        queryKey: ["ie-boxes", lcawbcode],
        queryFn:  () => fetch(`/api/inventory-entry/packing-box-by-awb?awbcode=${encodeURIComponent(lcawbcode)}`).then(r => r.json()).then(d => norm(Array.isArray(d) ? d : [])),
        enabled:  !!lcawbcode,
        staleTime: 0,
    });

    const { data: packingDetails = EMPTY_ARR, isFetching: loadingPackingDetails } = useQuery({
        queryKey: ["ie-packing-details", lcpack_uq],
        queryFn:  () => fetch(`/api/inventory-entry/packings/${lcpack_uq}/details`).then(r => r.json()).then(d => norm(Array.isArray(d) ? d : [])),
        enabled:  !!lcpack_uq,
        staleTime: 0,
    });

    const { data: whData, isFetching: loadingWH } = useQuery({
        queryKey: ["ie-warehouse", lcpk_box_uq],
        queryFn:  () => fetch(`/api/inventory-entry/warehouse?pk_box_uq=${lcpk_box_uq}`).then(r => r.json()),
        enabled:  false,  // warehouse tab removed
        staleTime: 0,
    });
    const whStock    = useMemo(() => norm(whData?.stock    ?? []), [whData]);
    const whAdjusts  = useMemo(() => norm(whData?.adjusts  ?? []), [whData]);
    const whInvoices = useMemo(() => norm(whData?.invoices ?? []), [whData]);

    const { data: plDetails = EMPTY_ARR, isFetching: loadingPL } = useQuery({
        queryKey: ["ie-pldetails", lcpack_uq],
        queryFn:  () => fetch(`/api/inventory-entry/packings/${lcpack_uq}/details`).then(r => r.json()).then(d => norm(Array.isArray(d) ? d : [])),
        enabled:  !!lcpack_uq && activeTab === "plcontrol" && !!tabLoaded.plcontrol,
        staleTime: 0,
    });

    // PL Control tab: all packings for the current date
    const { data: plControlAll = EMPTY_ARR, isFetching: loadingPLC, refetch: refetchPLC } = useQuery({
        queryKey: ["ie-plcontrol-all", lddate],
        queryFn:  () => fetch(`/api/inventory-entry/pl-control?date=${lddate}`).then(r => r.json()).then(d => norm(Array.isArray(d) ? d : [])),
        enabled:  activeTab === "plcontrol",
        staleTime: 0,
    });

    const { data: adjustsOnly = EMPTY_ARR, isFetching: loadingAdj } = useQuery({
        queryKey: ["ie-adjusts", lcpk_box_uq],
        queryFn:  () => fetch(`/api/inventory-entry/warehouse?pk_box_uq=${lcpk_box_uq}`).then(r => r.json()).then(d => norm(d.adjusts ?? [])),
        enabled:  false,  // adjusts tab removed
        staleTime: 0,
    });

    const { data: awbSearchData, isFetching: loadingSearch } = useQuery<{ rows: any[]; total: number }>({
        queryKey: ["ie-awb-search", awbSearchQ, awbSearchPage],
        queryFn:  () => fetch(`/api/inventory-entry/awb-search?page=${awbSearchPage}&pageSize=${AWB_PAGE_SIZE}&search=${encodeURIComponent(awbSearchQ)}`).then(r => r.json()),
        enabled:  activeTab === "awbsearch" && awbSearchQ.length > 0,
        staleTime: 0,
    });
    useEffect(() => {
        if (!awbSearchData) return;
        const incoming = norm(awbSearchData.rows ?? []);
        const total = Number(awbSearchData.total ?? 0);
        setAwbTotal(total);
        setAwbAccRows(prev => awbSearchPage === 1 ? incoming : [...prev, ...incoming]);
    }, [awbSearchData]);
    const awbSearchHasMore = awbAccRows.length < awbTotal;

    const { data: poSummary, isFetching: loadingPO } = useQuery({
        queryKey: ["ie-po-summary", ldship_date],
        queryFn:  () => fetch(`/api/inventory-entry/purchase-orders?ship_date=${ldship_date}`).then(r => r.json()),
        enabled:  activeTab === "polist" && !!tabLoaded.polist,
        staleTime: 0,
    });
    const poRows = useMemo(() => norm(poSummary?.summary ?? []), [poSummary]);

    const { data: poByGrower = EMPTY_ARR, isFetching: loadingPOG } = useQuery({
        queryKey: ["ie-po-grower", poGrower, ldship_date],
        queryFn:  () => fetch(`/api/inventory-entry/purchase-orders?ship_date=${ldship_date}&grower_uq=${poGrower}`).then(r => r.json()).then(d => norm(d.byGrower ?? [])),
        enabled:  !!poGrower,
        staleTime: 0,
    });

    const { data: awbDates = EMPTY_ARR, isFetching: loadingDates, refetch: refetchDates } = useQuery({
        queryKey: ["ie-awb-dates"],
        queryFn:  () => fetch("/api/inventory-entry/awb-dates").then(r => r.json()).then(d => norm(Array.isArray(d) ? d : [])),
        staleTime: 1000 * 60 * 5,
    });

    const { data: prodData, isFetching: loadingProds } = useQuery({
        queryKey: ["ie-products", prodSearch, prodPage],
        queryFn:  () => fetch(`/api/inventory-entry/products?page=${prodPage}&pageSize=${PROD_PAGE_SIZE}&search=${encodeURIComponent(prodSearch)}`).then(r => r.json()),
        enabled:  activeTab === "products",
        staleTime: 0,
    });
    useEffect(() => {
        if (!prodData) return;
        const incoming = norm((prodData as any).rows ?? []);
        const total = Number((prodData as any).total ?? 0);
        setProdTotal(total);
        setProdAccRows(prev => prodPage === 1 ? incoming : [...prev, ...incoming]);
    }, [prodData]);
    const prodHasMore = prodAccRows.length < prodTotal;

    // Infinite scroll sentinels
    const prodSentinelRef = useRef<HTMLDivElement>(null);
    const awbSentinelRef  = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!prodSentinelRef.current) return;
        const obs = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && prodHasMore && !loadingProds) {
                setProdPage(p => p + 1);
            }
        }, { threshold: 0.1 });
        obs.observe(prodSentinelRef.current);
        return () => obs.disconnect();
    }, [prodHasMore, loadingProds]);

    useEffect(() => {
        if (!awbSentinelRef.current) return;
        const obs = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && awbSearchHasMore && !loadingSearch) {
                setAwbSearchPage(p => p + 1);
            }
        }, { threshold: 0.1 });
        obs.observe(awbSentinelRef.current);
        return () => obs.disconnect();
    }, [awbSearchHasMore, loadingSearch]);

    // Auto-select first available date if current lddate has no data
    useEffect(() => {
        if (awbDates.length > 0) {
            const match = awbDates.some((r: any) => {
                const d = t(r.DATE_INVO ?? r.AWBDATE ?? "").substring(0, 10);
                return d === lddate;
            });
            if (!match) {
                const first = awbDates[0] as any;
                const d = t(first.DATE_INVO ?? first.AWBDATE ?? "").substring(0, 10);
                if (d) setLddate(d);
            }
        }
    }, [awbDates]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const openReport = (path: string) => window.open(path, "_blank");

    const handleTabClick = (tab: LeftTab) => {
        setActiveTab(tab);
        setTabLoaded(prev => ({ ...prev, [tab]: true }));
    };

    const handleSearch = () => {
        setLcawb(lcawbInput || "%");
        qc.invalidateQueries({ queryKey: ["ie-packing-x-awb"] });
    };

    const handleRefresh = () => {
        refetchAwb();
        refetchPacking();
        if (lcawbcode) refetchBoxes();
        qc.invalidateQueries({ queryKey: ["ie-packing-details"] });
        qc.invalidateQueries({ queryKey: ["ie-plcontrol-all"] });
    };

    const handleSelectAwb = (row: any) => {
        const code = t(row.AWBCODE);
        setLcawbcode(code);
        setLcawb(code);   // pass specific AWB to SP — server-side filter, no client AWBCODE filter needed
        setLcpack_uq("");
        setLcpk_box_uq("");
    };

    const handleSelectPacking = (row: any) => {
        const id = t(row.PACK_UQ ?? row.UNICO);
        setLcpack_uq(id);
        setLcpk_box_uq("");
        qc.invalidateQueries({ queryKey: ["ie-packing-details", id] });
    };

    const handleSelectBox = (row: any) => setLcpk_box_uq(t(row.UNICO));

    // ── Packing actions ───────────────────────────────────────────────────────
    const packAction = useCallback(async (action: string, label: string) => {
        if (!lcpack_uq) { toast.error("Select a packing first."); return; }
        try {
            const res = await fetch(`/api/inventory-entry/packings/${lcpack_uq}/action`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, awbcode: lcawbcode }),
            });
            const d = await res.json();
            if (!d.success) throw new Error(d.error || `${label} failed`);
            const info = AUDIT_MAP[`${action}-packing`];
            if (info) logAction(label as any, lcpack_uq, info.ext);
            toast.success(`${label} successful.`);
            handleRefresh();
        } catch (e: any) { toast.error(e.message); }
    }, [lcpack_uq, lcawbcode]);

    const handleSendLabel = async () => {
        if (!lcpack_uq) { toast.error("Select a packing first."); return; }
        if (!confirm("Do you want to resend the label?")) return;
        try {
            const res = await fetch(`/api/inventory-entry/packings/${lcpack_uq}/send-label`, { method: "POST" });
            const d = await res.json();
            if (!d.success) throw new Error(d.error || "Send Label failed");
            logAction("Edit", lcpack_uq, "Send Label FlexyMaxApp");
            toast.success("Label marked as sent.");
        } catch (e: any) { toast.error(e.message); }
    };

    const handleDeletePacking = async () => {
        if (!lcpack_uq) { toast.error("Select a packing first."); return; }
        if (!perms.canDelete) { toast.error("You are not authorized to delete records."); return; }
        if (!confirm("Delete this packing? This action cannot be undone.")) return;
        try {
            const res = await fetch(`/api/inventory-entry/packings/${lcpack_uq}`, {
                method: "DELETE", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_uq: (session?.user as any)?.id || "" }),
            });
            const d = await res.json();
            if (!d.success) throw new Error(d.error || "Delete failed");
            logAction("Delete", lcpack_uq, AUDIT_MAP["delete-packing"].ext);
            toast.success("Packing deleted.");
            setLcpack_uq(""); setLcpk_box_uq("");
            handleRefresh();
        } catch (e: any) { toast.error(e.message); }
    };

    // ── Open packing modal ────────────────────────────────────────────────────
    const handleOpenPackingModal = async (mode: "add" | "edit") => {
        if (mode === "edit") {
            if (!lcpack_uq) { toast.error("Select a packing first."); return; }
            if (!perms.canEdit) { toast.error("Not authorized."); return; }
            try {
                const r = await fetch(`/api/inventory-entry/packings/${lcpack_uq}`);
                const d = await r.json();
                if (!d) { toast.error("Packing not found."); return; }
                const fill: any = {};
                for (const [k, v] of Object.entries(d)) fill[k.toLowerCase()] = v;
                const awbcode = t(fill.awbcode);
                setPackForm({
                    unico:          t(fill.unico),
                    grower_uq:      t(fill.grower_uq),
                    packing_no:     t(fill.packing_no),
                    invoice_date:   fill.date_invo ? new Date(fill.date_invo).toISOString().split("T")[0] : today(),
                    invoice_no:     t(fill.invoice_no),
                    airline_code:   awbcode.substring(0, 3),
                    awbnumber:      awbcode.substring(3),
                    details:        t(fill.details),
                    porder_no:      parseInt(fill.porder_no ?? 0) || 0,
                    wphysical_uq:   t(fill.wphysical_uq),
                    available_date: fill.available_date ? new Date(fill.available_date).toISOString().split("T")[0] : today(),
                    consolidated:   Boolean(fill.consolidated),
                });
            } catch (e: any) { toast.error(e.message); return; }
        } else {
            if (!perms.canCreate) { toast.error("Not authorized."); return; }
            const code = t(lcawbcode);
            setPackForm({ ...EMPTY_PACKING, airline_code: code.substring(0, 3), awbnumber: code.substring(3) });
        }
        setPackError(null);
        setModalPackingMode(mode);
        setModalPacking(true);
    };

    const handleSavePacking = async () => {
        if (!t(packForm.grower_uq)) { setPackError("Vendor is required."); return; }
        if ((packForm.airline_code + packForm.awbnumber).length !== 11) { setPackError("AWB code must be 3-letter airline code + 8-digit number."); return; }
        setPackSaving(true); setPackError(null);
        try {
            const payload = {
                grower_uq:      packForm.grower_uq,
                packing_no:     packForm.packing_no,
                invoice_no:     packForm.invoice_no,
                awbcode:        packForm.airline_code + packForm.awbnumber,
                invoice_date:   packForm.invoice_date,
                details:        packForm.details,
                porder_no:      packForm.porder_no,
                wphysical_uq:   packForm.wphysical_uq,
                available_date: packForm.available_date,
                consolidated:   packForm.consolidated,
            };
            let unico = packForm.unico;
            if (modalPackingMode === "add") {
                const res = await fetch("/api/inventory-entry/packings", {
                    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
                });
                const d = await res.json();
                if (!d.success) throw new Error(d.error || "Insert failed");
                unico = d.unico;
                logAction("Insert", unico || "NEW", AUDIT_MAP["insert-packing"].ext);
                toast.success("Packing created.");
                setLcpack_uq(unico || "");
            } else {
                const res = await fetch(`/api/inventory-entry/packings/${unico}`, {
                    method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
                });
                const d = await res.json();
                if (!d.success) throw new Error(d.error || "Update failed");
                logAction("Edit", unico, AUDIT_MAP["update-packing"].ext);
                toast.success("Packing updated.");
            }
            setModalPacking(false);
            handleRefresh();
        } catch (e: any) { setPackError(e.message); }
        finally { setPackSaving(false); }
    };

    // ── Box actions ───────────────────────────────────────────────────────────
    const handleOpenBoxModal = async (mode: "add" | "edit", boxUnicoOverride?: string) => {
        const editUnico = boxUnicoOverride || lcpk_box_uq;
        if (mode === "edit") {
            if (!editUnico) { toast.error("Select a box first."); return; }
            if (!perms.canEdit) { toast.error("Not authorized."); return; }
            try {
                const r = await fetch(`/api/inventory-entry/boxes/${editUnico}`);
                const d = await r.json();
                if (!d) { toast.error("Box not found."); return; }
                const fill: any = {};
                for (const [k, v] of Object.entries(d)) fill[k.toLowerCase()] = v;
                setBoxForm(calcBox({
                    unico:            t(fill.unico),
                    product_uq:       t(fill.box_pack_uq ?? fill.product_uq),
                    product_desc:     t(fill.description ?? fill.product_desc ?? ""),
                    case_uq:          t(fill.case_uq),
                    cporder_no:       t(fill.cporder_no),
                    box_qty:          parseInt(fill.box_qty ?? 0) || 0,
                    packs_box:        parseInt(fill.packs_box ?? 0) || 0,
                    packs_units:      parseInt(fill.up_x_pack ?? 0) || 0,
                    stem_pack:        Boolean(fill.stem_pack),
                    lote:             parseInt(fill.lote ?? 0) || 0,
                    cut_point:        parseInt(fill.cut_point ?? 2) || 2,
                    box_id:           t(fill.box_id),
                    price_x_u:        parseFloat(fill.price_x_u ?? 0) || 0,
                    f_cost_x_u:       parseFloat(fill.f_cost_x_u ?? 0) || 0,
                    freight_cost:     parseFloat(fill.freight_cost ?? 0) || 0,
                    duties_cost:      parseFloat(fill.duties_cost ?? 0) || 0,
                    broker_cost:      parseFloat(fill.broker_cost ?? 0) || 0,
                    handling_cost:    parseFloat(fill.handling_cost ?? 0) || 0,
                    charge_cost:      parseFloat(fill.charge_cost ?? 0) || 0,
                    inventory_notes:  t(fill.inventory_notes),
                }));
                setProdPickQuery(t(fill.description ?? ""));
            } catch (e: any) { toast.error(e.message); return; }
        } else {
            if (!lcpack_uq) { toast.error("Select a packing first."); return; }
            if (!perms.canCreate) { toast.error("Not authorized."); return; }
            setBoxForm({ ...EMPTY_BOX });
            setProdPickQuery("");
        }
        setProdPickResults([]);
        setBoxError(null);
        setModalBoxMode(mode);
        setModalBox(true);
    };

    const setBoxField = (key: string, val: any) => setBoxForm((p: any) => calcBox({ ...p, [key]: val }));

    const doProdPickSearch = async () => {
        if (!prodPickQuery.trim()) return;
        setProdPickSearching(true);
        try {
            const r = await fetch(`/api/inventory-entry/products?page=1&pageSize=20&search=${encodeURIComponent(prodPickQuery)}`);
            const d = await r.json();
            setProdPickResults(norm((d.rows ?? []) as any[]));
        } catch {
            setProdPickResults([]);
        } finally {
            setProdPickSearching(false);
        }
    };

    const pickBoxProduct = (p: any) => {
        setBoxForm((prev: any) => calcBox({
            ...prev,
            product_uq:   t(p.UNICO),
            product_desc: t(p.DESCRIPTION),
            case_uq:      t(p.CASE_UQ) || prev.case_uq,
            packs_box:    parseInt(p.UP_X_CASE) || 0,
            packs_units:  parseInt(p.UP_X_PACK) || 0,
            stem_pack:    Boolean(p.STEM_PACK),
            price_x_u:    parseFloat(p.SALES_PRICE) || 0,
        }));
        setProdPickResults([]);
        setProdPickQuery(t(p.DESCRIPTION));
    };

    const handleSaveBox = async () => {
        if (!t(boxForm.product_uq)) { setBoxError("Product is required."); return; }
        if (!boxForm.box_qty)       { setBoxError("Box Qty is required."); return; }
        setBoxSaving(true); setBoxError(null);
        try {
            const payload = { ...boxForm, pack_uq: lcpack_uq, user_uq: (session?.user as any)?.id || "" };
            let unico = boxForm.unico;
            if (modalBoxMode === "add") {
                const res = await fetch("/api/inventory-entry/boxes", {
                    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
                });
                const d = await res.json();
                if (!d.success) throw new Error(d.error || "Insert failed");
                unico = d.unico;
                logAction("Insert", unico || "NEW", AUDIT_MAP["insert-box"].ext);
                toast.success("Box added.");
                setLcpk_box_uq(unico || "");
            } else {
                const res = await fetch(`/api/inventory-entry/boxes/${unico}`, {
                    method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
                });
                const d = await res.json();
                if (!d.success) throw new Error(d.error || "Update failed");
                logAction("Edit", unico, AUDIT_MAP["update-box"].ext);
                toast.success("Box updated.");
            }
            setModalBox(false);
            refetchBoxes();
            qc.invalidateQueries({ queryKey: ["ie-packing-details", lcpack_uq] });
        } catch (e: any) { setBoxError(e.message); }
        finally { setBoxSaving(false); }
    };

    const handleDeleteBox = async () => {
        if (!lcpk_box_uq) { toast.error("Select a box first."); return; }
        if (!perms.canDelete) { toast.error("Not authorized."); return; }
        if (!confirm("Delete this box?")) return;
        try {
            const res = await fetch(`/api/inventory-entry/boxes/${lcpk_box_uq}`, {
                method: "DELETE", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_uq: (session?.user as any)?.id || "" }),
            });
            const d = await res.json();
            if (!d.success) throw new Error(d.error || "Delete failed");
            logAction("Delete", lcpk_box_uq, AUDIT_MAP["delete-box"].ext);
            toast.success("Box deleted.");
            setLcpk_box_uq("");
            refetchBoxes();
            qc.invalidateQueries({ queryKey: ["ie-packing-details", lcpack_uq] });
        } catch (e: any) { toast.error(e.message); }
    };

    // ── Change AWB ────────────────────────────────────────────────────────────
    const handleOpenChangeAwb = async () => {
        if (!lcpack_uq) { toast.error("Select a packing first."); return; }
        try {
            const r = await fetch(`/api/inventory-entry/packings/${lcpack_uq}`);
            const d = await r.json();
            const fill: any = {};
            for (const [k, v] of Object.entries(d ?? {})) fill[k.toLowerCase()] = v;
            const awbcode = t(fill.awbcode);
            setChgAwbForm({
                airline_code: awbcode.substring(0, 3),
                awbnumber:    awbcode.substring(3),
                date_invo:    fill.date_invo ? new Date(fill.date_invo).toISOString().split("T")[0] : today(),
            });
        } catch {
            setChgAwbForm({ airline_code: "", awbnumber: "", date_invo: today() });
        }
        setModalChgAwb(true);
    };

    const handleSaveChangeAwb = async () => {
        if ((chgAwbForm.airline_code + chgAwbForm.awbnumber).length !== 11) { toast.error("Select an airline and enter the 8-digit AWB number."); return; }
        setChgAwbSaving(true);
        try {
            const res = await fetch(`/api/inventory-entry/packings/${lcpack_uq}/change-awb`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    awbcode:   chgAwbForm.airline_code + chgAwbForm.awbnumber,
                    date_invo: chgAwbForm.date_invo,
                    user_uq:   (session?.user as any)?.id || "",
                }),
            });
            const d = await res.json();
            if (!d.success) throw new Error(d.error || "Change AWB failed");
            logAction("Edit", lcpack_uq, AUDIT_MAP["change-awb"].ext);
            toast.success("AWB changed.");
            setModalChgAwb(false);
            handleRefresh();
        } catch (e: any) { toast.error(e.message); }
        finally { setChgAwbSaving(false); }
    };

    // ── Change Prices (inline edit on Boxes Detail grid) ──────────────────────
    const handleToggleChangePrices = () => {
        if (changePricesMode) {
            handleSaveChangedPrices();
        } else {
            setPriceEdits({});
            setChangePricesMode(true);
        }
    };

    const handleSaveChangedPrices = async () => {
        const entries = Object.entries(priceEdits);
        if (entries.length === 0) { setChangePricesMode(false); return; }
        setSavingPrices(true);
        try {
            for (const [unico, price_x_unit] of entries) {
                const res = await fetch(`/api/inventory-entry/boxes/${unico}/price`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ price_x_unit, user_uq: (session?.user as any)?.id || "" }),
                });
                const d = await res.json();
                if (!d.success) throw new Error(d.error || `Price update failed for ${unico}`);
                logAction("Edit", unico, AUDIT_MAP["change-prices"].ext);
            }
            toast.success(`${entries.length} price(s) updated.`);
            setPriceEdits({});
            setChangePricesMode(false);
            qc.invalidateQueries({ queryKey: ["ie-packing-details", lcpack_uq] });
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setSavingPrices(false);
        }
    };

    // ── Shared row style ──────────────────────────────────────────────────────
    const rowStyle = (color: string) => {
        const c = t(color).toLowerCase();
        if (!c || c === "white" || c === "#ffffff") return {};
        return { backgroundColor: c.startsWith("#") ? c : undefined };
    };

    // ── Guards ────────────────────────────────────────────────────────────────
    if (status === "loading") return null;
    if (status === "unauthenticated") { router.push("/login"); return null; }

    const packingId = (r: any) => t(r.PACK_UQ ?? r.UNICO);
    const selPacking = (packingXAwb as any[]).find(r => packingId(r) === lcpack_uq);
    const selBox     = (packingDetails as any[]).find(r => t(r.UNICO) === lcpk_box_uq);

    const fLabel = "text-[10px] font-black text-gray-500 uppercase tracking-wider";
    const fInput = "fos-input h-7 text-xs";

    return (
        <div className="flex flex-col h-[100dvh] bg-[#FBF9F8] overflow-hidden font-sans text-[#333]">

            <AppHeader title="Inventory Entry" />

            {/* ── Main Layout ── */}
            <div className="flex flex-col flex-1 gap-2 p-2 overflow-hidden">

                {/* ── Tab Container ── */}
                <div className="flex flex-col bg-white rounded-lg border border-[#DBD9D9] shadow-sm overflow-hidden flex-1">

                    {/* ── Tab bar ── */}
                    <div className="h-10 bg-[#F5F3F3] border-b border-[#DBD9D9] flex items-end px-2 shrink-0 gap-0.5">
                        {([
                            { key: "awbpackings", label: "AWB's Packings" },
                            { key: "products",    label: "Products List" },
                            { key: "plcontrol",   label: "PL Control" },
                            { key: "awbsearch",   label: "AWB Search" },
                            { key: "polist",      label: "PO List" },
                        ] as const).map(tab => (
                            <button key={tab.key}
                                onClick={() => { setActiveTab(tab.key as LeftTab); setTabLoaded(prev => ({ ...prev, [tab.key]: true })); }}
                                className={cn(
                                    "flex items-center gap-1.5 px-4 h-8 text-[12px] font-bold uppercase tracking-wide rounded-t transition-all whitespace-nowrap shrink-0",
                                    activeTab === tab.key ? "bg-white text-[#FB7506] border-b-2 border-[#FB7506]" : "text-gray-500 hover:text-[#FB7506] hover:bg-white/60"
                                )}>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* ── Tab Content ── */}
                    <div className="flex-1 overflow-auto bg-[#FBF9F8] p-2 relative">

                    {/* ══ Tab 1: AWB's Packings ══ */}
                    {activeTab === "awbpackings" && (
                        <div className="flex flex-col gap-2 h-full">

                            {/* Row 1: Date Picker + AWB List */}
                            <div className="flex gap-2 shrink-0" style={{ height: "28%" }}>
                                {/* Date Picker */}
                                <div className="w-[30%] flex flex-col bg-white rounded-lg border border-[#DBD9D9] shadow-sm overflow-hidden shrink-0">
                                    <div className="h-10 bg-white border-b border-[#DBD9D9] flex items-center justify-between pl-3 pr-0 shrink-0">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-[#FB7506]" />
                                            <span className="text-[14px] font-bold uppercase tracking-tight text-[#4F4F4F]">Date Picker</span>
                                            {loadingDates && <RefreshCcw size={10} className="text-gray-400 animate-spin" />}
                                        </div>
                                        <div className="flex items-center gap-1 pr-1">
                                            <button onClick={() => refetchDates()}
                                                className="flex items-center gap-1 h-7 px-2 text-[12px] font-semibold text-[#4F4F4F] hover:bg-gray-100 rounded-md transition-colors">
                                                <RefreshCcw size={12} /> Refresh
                                            </button>
                                            <GridMenu items={[
                                                { label: "Packing Date", icon: FileText, color: "gray", onClick: () => openReport(`/api/inventory-entry/reports/packing-arrived?date=${lddate}&awb=%25&pack_uq=%25&wphysical_uq=%25`) },
                                                { label: "AWB Cust. PO", icon: FileText, color: "gray", onClick: () => openReport(`/api/inventory-entry/reports/awb-cporder?date=${lddate}&awb=%25&pack_uq=%25`) },
                                                { label: "Products", icon: FileText, color: "gray", onClick: () => openReport(`/api/inventory-entry/reports/products?date=${lddate}&awb=%25&grower_uq=%25`) },
                                                { label: "NS Summary", icon: FileText, color: "gray", onClick: () => openReport(`/api/inventory-entry/reports/no-scanned-summary`) },
                                                { label: "No Scanned", icon: FileText, color: "gray", onClick: () => openReport(`/api/inventory-entry/reports/no-scanned?date=${lddate}`) },
                                                { label: "Delayed", icon: FileText, color: "gray", onClick: () => openReport(`/api/inventory-entry/reports/delayed?date=${lddate}`) },
                                            ]} />
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto">
                                        <table className="w-full text-xs">
                                            <thead className="bg-[#4F4F4F] text-white text-[11px] font-bold uppercase sticky top-0 z-10">
                                                <tr className="divide-x divide-[#DBD9D9]/30">
                                                    {["G.Ship Date","AWBs","Pcs","Dly"].map(h => (
                                                        <th key={h} className="p-2 whitespace-nowrap">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#DBD9D9]">
                                                {(awbDates as any[]).length === 0 ? (
                                                    <tr><td colSpan={4} className="p-4 text-center text-gray-400 italic">No dates</td></tr>
                                                ) : (awbDates as any[]).map((row: any, i: number) => {
                                                    const d = t(row.DATE_INVO ?? row.AWBDATE ?? "").substring(0, 10);
                                                    const displayDate = t(row.AWBDATE ?? row.DATE_INVO ?? "");
                                                    const sel = lddate === d;
                                                    const dly = Number(row.DELAYED ?? 0);
                                                    return (
                                                        <tr key={i}
                                                            onClick={() => { setLddate(d); setLcawb("%"); setLcawbcode(""); setLcpack_uq(""); setLcpk_box_uq(""); }}
                                                            className={cn("cursor-pointer transition-colors divide-x divide-[#DBD9D9]", sel ? "!bg-[#FB7506]/10" : dly > 0 ? "bg-red-50 hover:bg-red-100" : "hover:bg-gray-50")}>
                                                            <td className={cn("p-2 whitespace-nowrap", dly > 0 && !sel ? "text-red-700" : "text-gray-700")}>{displayDate}</td>
                                                            <td className="p-2 text-right">{t(row.RECORDS ?? row.AWBS ?? row.AWB_COUNT ?? "")}</td>
                                                            <td className="p-2 text-right">{t(row.PIECES ?? "")}</td>
                                                            <td className={cn("p-2 text-right", dly > 0 ? "text-red-600" : "text-gray-300")}>{dly || ""}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* AWB List */}
                                <div className="flex-1 flex flex-col bg-white rounded-lg border border-[#DBD9D9] shadow-sm overflow-hidden min-w-0">
                                    <div className="h-10 bg-white border-b border-[#DBD9D9] flex items-center justify-between pl-3 pr-0 shrink-0">
                                        <div className="flex items-center gap-2">
                                            <Plane size={14} className="text-[#FB7506]" />
                                            <span className="text-[14px] font-bold uppercase tracking-tight text-[#4F4F4F]">AWB List &mdash; {lddate}</span>
                                            {loadingAwb && <RefreshCcw size={10} className="text-gray-400 animate-spin" />}
                                        </div>
                                        <GridMenu items={[
                                            { label: "Total By Whouse", icon: BarChart2, color: "blue", onClick: () => setModalWhTotals(true) },
                                            { label: "AWB Report", icon: FileText, color: "gray", onClick: () => openReport(`/api/inventory-entry/reports/awb-full?awb=${encodeURIComponent(lcawbcode)}`), disabled: !lcawbcode },
                                            { label: "WH Instructions", icon: FileText, color: "gray", onClick: () => openReport(`/api/inventory-entry/reports/wh-instructions?date=${lddate}&awb=${encodeURIComponent(lcawbcode)}`), disabled: !lcawbcode },
                                        ]} />
                                    </div>
                                    <div className="flex-1 overflow-auto">
                                        <table className="min-w-full text-xs text-left">
                                            <thead className="bg-[#4F4F4F] text-white text-[11px] font-bold uppercase sticky top-0 z-10">
                                                <tr className="divide-x divide-[#DBD9D9]/30">
                                                    {["AWB","Rec.","WHStatus","Pieces","FBoxes","Delayed","InWHouse"].map(h => (
                                                        <th key={h} className="p-2 whitespace-nowrap">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#DBD9D9]">
                                                {(awbByDate as any[]).length === 0 && !loadingAwb ? (
                                                    <tr><td colSpan={7} className="p-4 text-center text-gray-400 italic">No AWBs for this date</td></tr>
                                                ) : (awbByDate as any[]).map((row: any, i: number) => {
                                                    const code = t(row.AWBCODE);
                                                    const sel  = lcawbcode === code;
                                                    const dly  = Number(row.DELAYED ?? 0);
                                                    return (
                                                        <tr key={i} onClick={() => handleSelectAwb(row)}
                                                            className={cn("cursor-pointer transition-colors divide-x divide-[#DBD9D9]", sel ? "!bg-[#FB7506]/10" : "hover:bg-gray-50")}>
                                                            <td className="p-2 font-semibold text-[#FB7506]">{code}</td>
                                                            <td className="p-2 text-right">{t(row.RECORDS)}</td>
                                                            <td className={cn("p-2 text-center", t(row.WHSTATUS) === "WH" ? "text-green-600" : t(row.WHSTATUS) === "CHECK" ? "text-blue-500" : "text-gray-500")}>{t(row.WHSTATUS)}</td>
                                                            <td className="p-2 text-right">{t(row.BOXES ?? row.PIECES ?? "")}</td>
                                                            <td className="p-2 text-right">{t(row.FULL_BOXES ?? "")}</td>
                                                            <td className={cn("p-2 text-right", dly > 0 ? "text-red-500" : "text-gray-300")}>{dly || ""}</td>
                                                            <td className="p-2 text-right">{t(row.QTY_TRANSFER ?? row.IN_WHOUSE ?? "")}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="px-3 py-1 border-t border-[#DBD9D9] bg-[#F5F3F3] shrink-0">
                                        <span className="text-[10px] font-bold text-gray-500">{(awbByDate as any[]).length} AWBs</span>
                                    </div>
                                </div>
                            </div>

                            {/* Row 2: Vendors / Packings */}
                            <div className="flex flex-col bg-white rounded-lg border border-[#DBD9D9] shadow-sm overflow-hidden shrink-0" style={{ height: "24%" }}>
                                <div className="h-10 bg-white border-b border-[#DBD9D9] flex items-center justify-between pl-3 pr-0 shrink-0 gap-2">
                                    <div className="flex items-center gap-2 shrink-0 min-w-0">
                                        <Package size={14} className="text-[#FB7506] shrink-0" />
                                        <span className="text-[14px] font-bold uppercase tracking-tight text-[#4F4F4F] truncate">Vendors{lcawbcode ? ` — ${lcawbcode}` : ""}</span>
                                        {loadingPacking && <RefreshCcw size={10} className="text-gray-400 animate-spin shrink-0" />}
                                        {filterGrowerUq && (
                                            <span className="text-[10px] text-[#FB7506] font-bold border border-[#FB7506]/30 rounded px-1.5 py-0.5 bg-[#FB7506]/10 shrink-0">
                                                Grower ✓
                                            </span>
                                        )}
                                        {filterCustomer && (
                                            <span className="text-[10px] text-[#FB7506] font-bold border border-[#FB7506]/30 rounded px-1.5 py-0.5 bg-[#FB7506]/10 shrink-0">
                                                Cust ✓
                                            </span>
                                        )}
                                        <span className="text-[10px] font-bold text-gray-400 shrink-0">{(packingXAwb as any[]).length} records</span>
                                    </div>
                                    <GridMenu items={[
                                        { label: "Send to Whouse", icon: ArrowRight, color: "orange", onClick: () => { if (!lcpack_uq) { toast.error("Select a packing first."); return; } setModalSendWH(true); } },
                                        { label: "Open", icon: Check, color: "green", onClick: () => packAction("open", "Open"), disabled: !lcpack_uq || !perms.canEdit },
                                        { label: "Close", icon: X, color: "amber", onClick: () => packAction("close", "Close"), disabled: !lcpack_uq || !perms.canEdit },
                                        { label: "Change AWB", icon: Pencil, color: "blue", onClick: () => handleOpenChangeAwb(), disabled: !perms.canEdit || !lcpack_uq },
                                        { label: "WH Totals", icon: BarChart2, color: "blue", onClick: () => setModalWhTotals(true) },
                                        { label: "Copy", icon: Copy, color: "blue", onClick: () => { if (!lcpack_uq) { toast.error("Select a packing first."); return; } setModalCopy(true); }, separator: true },
                                        { label: "AWB Cust. PO", icon: FileText, color: "gray", onClick: () => openReport(`/api/inventory-entry/reports/awb-cporder?date=${lddate}&awb=${encodeURIComponent(lcawbcode || "%")}&pack_uq=${encodeURIComponent(lcpack_uq)}`), disabled: !lcpack_uq },
                                        { label: "Label Laser", icon: FileText, color: "gray", onClick: () => openReport(`/api/inventory-entry/reports/label-laser?pack_uq=${encodeURIComponent(lcpack_uq)}`), disabled: !lcpack_uq },
                                        { label: "Packing", icon: Package, color: "gray", onClick: () => openReport(`/api/inventory-entry/reports/packing-arrived?date=${lddate}&awb=${encodeURIComponent(lcawbcode || "%")}&pack_uq=${encodeURIComponent(lcpack_uq)}&wphysical_uq=%25`), disabled: !lcpack_uq },
                                        { label: "COff", icon: FileText, color: "gray", onClick: () => openReport(`/api/inventory-entry/reports/cut-off?date=${lddate}&awb=${encodeURIComponent(lcawbcode || "%")}&pack_uq=${encodeURIComponent(lcpack_uq)}`), disabled: !lcpack_uq },
                                        { label: "PDF Label", icon: FileText, color: "gray", onClick: () => handleSendLabel(), disabled: !lcpack_uq },
                                        { label: "Z300", icon: FileText, color: "gray", onClick: () => openReport(`/api/inventory-entry/reports/label-zebra?pack_uq=${encodeURIComponent(lcpack_uq)}&box_uq=%25`), disabled: !lcpack_uq },
                                        { label: "Z 4M", icon: FileText, color: "gray", onClick: () => openReport(`/api/inventory-entry/reports/label-zebra4m?pack_uq=${encodeURIComponent(lcpack_uq)}&box_uq=%25`), disabled: !lcpack_uq },
                                        { label: "RPK", icon: FileText, color: "gray", onClick: () => openReport(`/api/inventory-entry/reports/label-zebra-repacking?date=${lddate}&awbcode=${encodeURIComponent(lcawbcode || "%")}&pack_uq=${encodeURIComponent(lcpack_uq)}&box_uq=%25`), disabled: !lcpack_uq },
                                        { label: "Header 2", icon: FileText, color: "gray", onClick: () => { if (!lcpack_uq) { toast.error("Select a packing first."); return; } setModalHeader2(true); }, separator: true },
                                        { label: "Filter Grower", icon: Flower2, color: "purple", onClick: () => setModalFiltGrowers(true) },
                                        { label: "Filter Cust.", icon: ShoppingCart, color: "purple", onClick: () => setModalFiltCust(true) },
                                        { label: "AWB Setup", icon: Plane, color: "purple", onClick: () => setModalAWBSetup(true), separator: true },
                                        { label: "Del Details", icon: Trash2, color: "red", onClick: () => { if (!lcpack_uq) { toast.error("Select a packing first."); return; } setModalDelDetails(true); } },
                                    ]} />
                                </div>
                                <div className="flex-1 overflow-auto">
                                    <table className="min-w-full text-xs text-left whitespace-nowrap">
                                        <thead className="bg-[#4F4F4F] text-white text-[11px] font-bold uppercase sticky top-0 z-10">
                                            <tr className="divide-x divide-[#DBD9D9]/30">
                                                {["Vendor","FullBxs","Pieces","Delayed","T.Units","T.Cost","T.Charge","Invoice","Packing","PWHouse","WHStatus","Available","Status","Offer","COT","Received","Comments"].map(h => (
                                                    <th key={h} className="p-2 whitespace-nowrap">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#DBD9D9]">
                                            {(() => {
                                            const filtered = packingXAwb as any[];  // SP already filters by lcawb
                                            if (filtered.length === 0 && !loadingPacking) return (
                                                <tr><td colSpan={17} className="p-4 text-center text-gray-400 italic">{lcawbcode ? "No packings for this AWB" : "Select a date"}</td></tr>
                                            );
                                            return filtered.map((row: any, i: number) => {
                                                const uq   = packingId(row);
                                                const sel  = lcpack_uq === uq;
                                                const st   = t(row.STATUS ?? row.PSTATUS ?? "");
                                                const whst = t(row.WHSTATUS ?? "");
                                                const avail = t(row.AVAILABLE_DATE ?? row.AVAILABLE ?? "").substring(0, 10);
                                                return (
                                                    <tr key={i} onClick={() => handleSelectPacking(row)}
                                                        className={cn("cursor-pointer transition-colors divide-x divide-[#DBD9D9]", sel ? "!bg-[#FB7506]/10" : "hover:bg-gray-50")}
                                                        style={!sel ? subtleColorFromInt(row.COLOR) : undefined}>
                                                        <td className="p-2 max-w-[120px] truncate font-medium">{t(row.GROWER)}</td>
                                                        <td className="p-2 text-right">{t(row.TOTAL_BOXES ?? row.FULL_BOXES ?? "")}</td>
                                                        <td className="p-2 text-right">{t(row.TOTAL_PIECES)}</td>
                                                        <td className={cn("p-2 text-right", Number(row.DELAYED ?? 0) > 0 ? "text-red-500" : "text-gray-300")}>{t(row.DELAYED ?? "") || ""}</td>
                                                        <td className="p-2 text-right">{t(row.TOTAL_UNITS)}</td>
                                                        <td className="p-2 text-right">{fmt2(row.TOTAL_COST ?? row.FLOWER_COST ?? 0)}</td>
                                                        <td className="p-2 text-right">{fmt2(row.T_CHARGE ?? row.TOTAL_CHARGE ?? 0)}</td>
                                                        <td className="p-2">{t(row.INVOICE_NO)}</td>
                                                        <td className="p-2">{t(row.PACKING_NO)}</td>
                                                        <td className="p-2">{t(row.WHOUSE ?? row.WPHYSICAL ?? row.PWHOUSE ?? row.WP_NAME ?? "")}</td>
                                                        <td className={cn("p-2", whst === "WH" ? "text-green-600" : whst === "CHECK" ? "text-blue-500" : "text-gray-500")}>{whst}</td>
                                                        <td className="p-2">{avail}</td>
                                                        <td className={cn("p-2", st === "CLOSED" ? "text-red-500" : st === "OPEN" ? "text-green-600" : "text-gray-400")}>{st}</td>
                                                        <td className="p-2">{t(row.OFFER ?? "")}</td>
                                                        <td className="p-2">{t(row.CUTOFF ?? row.COT ?? "").substring(0, 10)}</td>
                                                        <td className="p-2">{t(row.RECEIVED ?? "")}</td>
                                                        <td className="p-2 text-gray-500 max-w-[120px] truncate">{t(row.DETAILS ?? row.COMMENTS ?? "")}</td>
                                                    </tr>
                                                );
                                            });
                                        })()}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Row 3: Boxes Detail */}
                            <div className="flex flex-col bg-white rounded-lg border border-[#DBD9D9] shadow-sm overflow-hidden flex-1 min-h-0">
                                <div className="h-10 bg-white border-b border-[#DBD9D9] flex items-center justify-between pl-3 pr-0 shrink-0 gap-2">
                                    <div className="flex items-center gap-2 shrink-0 min-w-0">
                                        <Boxes size={14} className="text-[#FB7506] shrink-0" />
                                        <span className="text-[14px] font-bold uppercase tracking-tight text-[#4F4F4F] truncate">
                                            Boxes Detail{selPacking ? ` — ${t(selPacking.GROWER)}` : ""}
                                        </span>
                                        {loadingPackingDetails && <RefreshCcw size={10} className="text-gray-400 animate-spin shrink-0" />}
                                        <span className="text-[11px] font-bold text-[#FB7506] uppercase tracking-wide truncate max-w-[160px]">
                                            {selBox ? t(selBox.DESCRIPTION ?? selBox.PRODUCT ?? selBox.VARIETY ?? "") : selPacking ? t(selPacking.GROWER) : ""}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 pr-2">
                                        <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap">From Label:</span>
                                        <input className="w-10 h-7 text-[11px] border border-[#DBD9D9] rounded px-1.5 bg-white" defaultValue="0" readOnly />
                                        <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap">To Label:</span>
                                        <input className="w-10 h-7 text-[11px] border border-[#DBD9D9] rounded px-1.5 bg-white" defaultValue="0" readOnly />
                                        <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap">
                                            {(packingDetails as any[]).length} boxes
                                        </span>
                                        {changePricesMode && (
                                            <button onClick={handleToggleChangePrices} disabled={savingPrices}
                                                className="flex items-center gap-1.5 h-7 px-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-md text-[12px] font-bold uppercase tracking-wide transition-colors shrink-0">
                                                {savingPrices ? <RefreshCcw size={12} className="animate-spin" /> : <Check size={12} />}
                                                {savingPrices ? "Saving..." : `OK (${Object.keys(priceEdits).length})`}
                                            </button>
                                        )}
                                        <AuditLogModal recordId={lcpk_box_uq} disabled={!lcpk_box_uq} size="sm" />
                                        <GridMenu items={[
                                            { label: "Add Box", icon: Plus, color: "green", onClick: () => handleOpenBoxModal("add") },
                                            { label: "Edit Box", icon: Pencil, color: "green", onClick: () => handleOpenBoxModal("edit"), separator: true },
                                            { label: "Transform Inventory", icon: ArrowRight, color: "orange", onClick: () => { if (!lcpk_box_uq) { toast.error("Select a box first."); return; } setModalTransform(true); } },
                                            { label: "Change Prices", icon: Pencil, color: "blue", onClick: handleToggleChangePrices },
                                            { label: "RePacking", icon: Package, color: "blue", onClick: () => { if (!lcpk_box_uq) { toast.error("Select a box first."); return; } setModalRepacking(true); }, separator: true },
                                            { label: "WHControl", icon: Warehouse, color: "blue", onClick: () => { if (!lcpk_box_uq) { toast.error("Select a box first."); return; } setModalBoxWHCtrl(true); } },
                                            { label: "Move Box", icon: ArrowRight, color: "blue", onClick: () => { if (!lcpk_box_uq) { toast.error("Select a box first."); return; } setModalBoxMove(true); } },
                                            { label: "WH Transfer", icon: Warehouse, color: "blue", onClick: () => { if (!lcpk_box_uq) { toast.error("Select a box first."); return; } setModalTransfer(true); } },
                                            { label: "Add from PO", icon: ClipboardList, color: "green", onClick: () => { if (!lcpack_uq) { toast.error("Select a packing first."); return; } setModalBoxPO(true); }, separator: true },
                                            { label: "Notes", icon: FileText, color: "purple", onClick: () => { if (!lcpk_box_uq) { toast.error("Select a box first."); return; } setModalNotes(true); } },
                                            { label: "Composition", icon: Layers, color: "purple", onClick: () => { if (!lcpk_box_uq) { toast.error("Select a box first."); return; } setModalComposition(true); }, separator: true },
                                            { label: "Zebra by Lot", icon: FileText, color: "gray", onClick: () => { if (!lcpk_box_uq) { toast.error("Select a box first."); return; } openReport(`/api/inventory-entry/reports/label-zebra?pack_uq=${encodeURIComponent(lcpack_uq)}&box_uq=${encodeURIComponent(lcpk_box_uq)}`); } },
                                            { label: "Meto by Lot", icon: FileText, color: "gray", onClick: () => { if (!lcpk_box_uq) { toast.error("Select a box first."); return; } openReport(`/api/inventory-entry/reports/label-meto?pack_uq=${encodeURIComponent(lcpack_uq)}&box_uq=${encodeURIComponent(lcpk_box_uq)}`); } },
                                            { label: "Selection", icon: Trash2, color: "red", onClick: () => { if (!lcpack_uq) { toast.error("Select a packing first."); return; } setModalDelDetails(true); } },
                                        ]} />
                                    </div>
                                </div>
                                <div className="flex-1 overflow-auto">
                                    <table className="min-w-full text-xs text-left whitespace-nowrap">
                                        <thead className="bg-[#4F4F4F] text-white text-[11px] font-bold uppercase sticky top-0 z-10">
                                            <tr className="divide-x divide-[#DBD9D9]/30">
                                                {["Dly","Rdy","Lot","Pcs","Stock","BxCase","UxBunch","T.Units","U.Price","Case","Description","Customer","BoxId","PB","Std.","C.POrder","C.Cost","T.Cost","S.U.Price","Days","FCost","CCost","TCost"].map(h => (
                                                    <th key={h} className="p-2 whitespace-nowrap">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#DBD9D9]">
                                            {!lcpack_uq ? (
                                                <tr><td colSpan={23} className="p-4 text-center text-gray-400 italic">Select a vendor to view boxes</td></tr>
                                            ) : (packingDetails as any[]).length === 0 && !loadingPackingDetails ? (
                                                <tr><td colSpan={23} className="p-4 text-center text-gray-400 italic">No boxes</td></tr>
                                            ) : (packingDetails as any[]).map((row: any, i: number) => {
                                                    const uq   = t(row.UNICO);
                                                    const sel  = lcpk_box_uq === uq;
                                                    const desc = t(row.DESCRIPTION ?? row.PRODUCT ?? row.VARIETY ?? "");
                                                    const dly  = Number(row.DELAYED ?? 0);
                                                    const rdy  = Boolean(row.READY_TRAN) ? "OK" : "";
                                                    const stk  = Number(row.STOCK ?? row.WH_STOCK ?? 0);
                                                    return (
                                                        <tr key={i} onClick={() => handleSelectBox(row)} onDoubleClick={() => { handleSelectBox(row); handleOpenBoxModal("edit", t(row.UNICO)); }}
                                                            className={cn("cursor-pointer transition-colors divide-x divide-[#DBD9D9]", sel ? "!bg-[#FB7506]/10" : "hover:bg-gray-50")}
                                                            style={!sel ? subtleColorFromInt(row.BACKCOLOR) : undefined}>
                                                            <td className={cn("p-2 text-center", dly > 0 ? "text-red-600" : "text-gray-300")}>{dly || ""}</td>
                                                            <td className={cn("p-2", rdy ? "text-green-600" : "text-gray-300")}>{rdy}</td>
                                                            <td className="p-2">{t(row.LOTE ?? row.BOXNUM ?? "")}</td>
                                                            <td className="p-2 text-right">{t(row.TOTAL_PIECES ?? row.PIECES ?? row.BOXNUM ?? "")}</td>
                                                            <td className={cn("p-2 text-right", stk < 0 ? "text-red-500" : stk > 0 ? "text-green-600" : "text-gray-300")}>{stk || ""}</td>
                                                            <td className="p-2 text-right">{t(row.BOX_QTY ?? "")}</td>
                                                            <td className="p-2 text-right">{t(row.UP_X_PACK ?? row.UP_X_CASE ?? row.TUNITS_X_BOX ?? "")}</td>
                                                            <td className="p-2 text-right">{t(row.TOTAL_UNITS)}</td>
                                                            <td className="p-2 text-right">{fmt4(row.PRICE_X_U ?? row.PRICE ?? row.U_PRICE ?? 0)}</td>
                                                            <td className="p-2">{t(row.CASE_SH ?? row.CASE_NAME ?? row.CASE ?? "")}</td>
                                                            <td className="p-2 max-w-[150px] truncate" title={desc}>{desc}</td>
                                                            <td className="p-2 max-w-[60px] truncate">{t(row.CUSTOMER ?? "")}</td>
                                                            <td className="p-2 text-right">{t(row.BOXID ?? row.BOX_ID ?? "")}</td>
                                                            <td className="p-2 text-center">{Boolean(row.PB) ? "Y" : ""}</td>
                                                            <td className="p-2 text-center">{Boolean(row.STD) ? "Y" : ""}</td>
                                                            <td className="p-2">{t(row.CPORDER_NO ?? row.SORDER_NO ?? "")}</td>
                                                            <td className="p-2 text-right">{fmt4(row.C_COST_X_U ?? 0)}</td>
                                                            <td className="p-2 text-right">{fmt2(row.TOTAL_COST ?? row.T_COST_X_U ?? row.T_COST ?? row.TCOST ?? 0)}</td>
                                                            <td className="p-1 text-right" onClick={e => changePricesMode && e.stopPropagation()}>
                                                                {changePricesMode ? (
                                                                    <input
                                                                        type="number" step="0.0001" defaultValue={row.SPRICE_X_UNIT ?? row.S_U_PRICE ?? row.PRICE ?? 0}
                                                                        onChange={e => setPriceEdits(p => ({ ...p, [uq]: parseFloat(e.target.value) || 0 }))}
                                                                        className="w-20 h-6 text-xs text-right border border-[#FB7506] rounded px-1 bg-orange-50"
                                                                    />
                                                                ) : fmt4(row.SPRICE_X_UNIT ?? row.S_U_PRICE ?? row.PRICE ?? 0)}
                                                            </td>
                                                            <td className={cn("p-2 text-right", Number(row.DAYS ?? 0) < 0 ? "text-red-500" : "text-gray-500")}>{t(row.DAYS ?? "")}</td>
                                                            <td className="p-2 text-right">{fmt2(row.F_FCOST_X_U ?? row.F_COST_X_U ?? row.FCOST ?? 0)}</td>
                                                            <td className="p-2 text-right">{fmt2(row.C_COST_X_U ?? row.CCOST ?? 0)}</td>
                                                            <td className="p-2 text-right">{fmt2(row.TOTAL_COST ?? row.T_COST_X_U ?? row.TCOST ?? row.T_COST ?? 0)}</td>
                                                        </tr>
                                                    );
                                                })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        </div>
                    )}

                    {/* ══ Tab 2: Products List ══ */}
                    {activeTab === "products" && (
                        <div className="flex flex-col h-full min-h-0">
                            <div className="flex flex-col bg-white rounded-lg border border-[#DBD9D9] shadow-sm overflow-hidden flex-1 min-h-0">

                                {/* Header */}
                                <div className="h-10 bg-white border-b border-[#DBD9D9] flex items-center justify-between px-3 shrink-0 gap-2">
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Flower2 size={14} className="text-[#FB7506]" />
                                        <span className="text-[14px] font-bold uppercase tracking-tight text-[#4F4F4F]">Products List</span>
                                        {loadingProds && <RefreshCcw size={10} className="animate-spin text-gray-400" />}
                                        {prodTotal > 0 && (
                                            <span className="text-[10px] font-bold text-gray-400 ml-2">
                                                {prodAccRows.length} / {prodTotal} records
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <div className="flex items-center bg-[#F5F3F3] border border-[#DBD9D9] rounded px-2 py-1 gap-1 w-48">
                                            <Search size={11} className="text-gray-400 shrink-0" />
                                            <input
                                                type="text"
                                                value={prodSearchInput}
                                                onChange={e => setProdSearchInput(e.target.value)}
                                                onKeyDown={e => { if (e.key === "Enter") { setProdAccRows([]); setProdSearch(prodSearchInput); setProdPage(1); } }}
                                                placeholder="Search products..."
                                                className="text-[11px] text-gray-700 placeholder-gray-400 outline-none flex-1 min-w-0 bg-transparent"
                                            />
                                            {prodSearch && (
                                                <button onClick={() => { setProdAccRows([]); setProdSearch(""); setProdSearchInput(""); setProdPage(1); }}>
                                                    <X size={11} className="text-gray-400 hover:text-gray-700" />
                                                </button>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => { setProdAccRows([]); setProdSearch(prodSearchInput); setProdPage(1); }}
                                            className="flex items-center gap-1.5 h-7 px-3 bg-[#FB7506] hover:bg-orange-500 text-white rounded-md text-[14px] font-semibold uppercase tracking-wide transition-colors shrink-0">
                                            <Search size={14} /> Search
                                        </button>
                                        <button
                                            onClick={() => { if (!lcpack_uq) { toast.error("Select a packing in AWB's Packings first."); return; } if (!selectedProduct) { toast.error("Select a product first."); return; } setModalAddProdPack(true); }}
                                            className="flex items-center gap-1.5 h-7 px-3 bg-green-600 hover:bg-green-500 text-white rounded-md text-[14px] font-semibold uppercase tracking-wide transition-colors shrink-0">
                                            <Plus size={14} /> Add to Packing
                                        </button>
                                    </div>
                                </div>

                                {/* Grid */}
                                <div className="flex-1 overflow-auto">
                                    <table className="min-w-full text-xs text-left whitespace-nowrap">
                                        <thead className="bg-[#4F4F4F] text-white text-[11px] font-bold uppercase sticky top-0 z-10">
                                            <tr className="divide-x divide-[#DBD9D9]/30">
                                                {["Description","Class","Subclass","Variety","Color","Grade","Stems/Bunch","Bunches/Case","Units","Sales Price","Case"].map(h => (
                                                    <th key={h} className="p-2 whitespace-nowrap">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#DBD9D9]">
                                            {prodAccRows.length === 0 && !loadingProds ? (
                                                <tr><td colSpan={11} className="p-4 text-center text-gray-400 italic">No products found</td></tr>
                                            ) : (prodAccRows as any[]).map((row: any, i: number) => (
                                                <tr key={i} onClick={() => setSelectedProduct(row)}
                                                    className={cn("cursor-pointer transition-colors divide-x divide-[#DBD9D9]", t(selectedProduct?.UNICO) === t(row.UNICO) ? "!bg-[#FB7506]/10" : "hover:bg-gray-50")}>
                                                    <td className="p-2 max-w-[200px] truncate">{t(row.DESCRIPTION ?? row.DESC ?? row.PRODUCT_DESC ?? row.PRODUCT ?? "")}</td>
                                                    <td className="p-2">{t(row.CLASS ?? row.CLASE ?? "")}</td>
                                                    <td className="p-2">{t(row.SUBCLASS ?? row.SUBCLASE ?? "")}</td>
                                                    <td className="p-2">{t(row.VARIETY ?? row.VARIEDAD ?? "")}</td>
                                                    <td className="p-2">{t(row.COLOR ?? "")}</td>
                                                    <td className="p-2">{t(row.GRADE ?? row.GRADO ?? "")}</td>
                                                    <td className="p-2 text-right">{t(row.STEMS_BUNCH ?? row.STEMS_X_BUNCH ?? row.BUNCHES_X_CASE ?? "")}</td>
                                                    <td className="p-2 text-right">{t(row.BUNCHES_CASE ?? row.BUNCHES_X_CASE ?? row.UP_X_CASE ?? "")}</td>
                                                    <td className="p-2 text-right">{t(row.TOTAL_UNITS ?? row.UNITS ?? "")}</td>
                                                    <td className="p-2 text-right">{fmt2(row.SALES_PRICE ?? row.PRICE ?? row.UNIT_PRICE ?? 0)}</td>
                                                    <td className="p-2">{t(row.CASE_NAME ?? row.CASE ?? row.PACK ?? "")}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {/* sentinel — triggers next page when scrolled into view */}
                                    <div ref={prodSentinelRef} className="h-1" />
                                    {loadingProds && (
                                        <div className="flex justify-center py-2">
                                            <RefreshCcw size={14} className="animate-spin text-gray-400" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ══ Tab 3: PL Control ══ */}
                    {activeTab === "plcontrol" && (
                        <div className="flex flex-col gap-2 h-full">
                            <div className="flex flex-col bg-white rounded-lg border border-[#DBD9D9] shadow-sm overflow-hidden flex-1 min-h-0">
                                <div className="h-10 bg-white border-b border-[#DBD9D9] flex items-center justify-between px-3 shrink-0 gap-2">
                                    <div className="flex items-center gap-2 shrink-0">
                                        <ClipboardList size={14} className="text-[#FB7506]" />
                                        <span className="text-[14px] font-bold uppercase tracking-tight text-[#4F4F4F]">Packing List Control</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                                        <input type="date" value={lddate} onChange={e => setLddate(e.target.value)}
                                            className="h-7 text-[12px] border border-[#DBD9D9] rounded-md px-1.5 bg-white shrink-0" />
                                        <button onClick={handleRefresh}
                                            className="flex items-center gap-1.5 h-7 px-3 bg-white hover:bg-gray-50 border border-[#DBD9D9] text-[#4F4F4F] rounded-md text-[14px] font-semibold uppercase tracking-wide transition-colors shrink-0">
                                            <RefreshCcw size={14} className={loadingPLC ? "animate-spin" : ""} /> Refresh
                                        </button>
                                        <div className="w-px h-5 bg-[#DBD9D9] mx-0.5 shrink-0" />
                                        <button onClick={() => { if (!lcpack_uq) { toast.error("Select a packing first."); return; } setModalAvailDate(true); }} disabled={!lcpack_uq || !perms.canEdit}
                                            className="flex items-center gap-1.5 h-7 px-3 bg-[#FB7506] hover:bg-orange-500 disabled:opacity-40 text-white rounded-md text-[14px] font-semibold uppercase tracking-wide transition-colors shrink-0">
                                            Update Available
                                        </button>
                                        <button onClick={() => packAction("open", "Open")} disabled={!lcpack_uq || !perms.canEdit}
                                            className="flex items-center gap-1.5 h-7 px-3 bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white rounded-md text-[14px] font-semibold uppercase tracking-wide transition-colors shrink-0">
                                            <Check size={14} /> Open
                                        </button>
                                        <button onClick={() => packAction("close", "Close")} disabled={!lcpack_uq || !perms.canEdit}
                                            className="flex items-center gap-1.5 h-7 px-3 bg-[#FB7506]/10 hover:bg-[#FB7506]/20 border border-[#FB7506]/30 disabled:opacity-40 text-[#FB7506] rounded-md text-[14px] font-semibold uppercase tracking-wide transition-colors shrink-0">
                                            <X size={14} /> Close
                                        </button>
                                        <span className="text-[10px] font-bold text-gray-400 ml-2 shrink-0">{(plControlAll as any[]).length} pkgs</span>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-auto">
                                    <table className="min-w-full text-xs text-left whitespace-nowrap">
                                        <thead className="bg-[#4F4F4F] text-white text-[11px] font-bold uppercase sticky top-0 z-10">
                                            <tr className="divide-x divide-[#DBD9D9]/30">
                                                {["Ctrl","Grower","Airline","AWB","Date","Invoice","Packing","Pcs","Total$","Whouse","Details","St."].map(h => (
                                                    <th key={h} className="p-2 whitespace-nowrap">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#DBD9D9]">
                                            {(plControlAll as any[]).length === 0 ? (
                                                <tr><td colSpan={12} className="p-4 text-center text-gray-400 italic">No packings for this date</td></tr>
                                            ) : (plControlAll as any[]).map((row: any, i: number) => {
                                                const uq  = packingId(row);
                                                const sel = lcpack_uq === uq;
                                                const st  = t(row.STATUS ?? row.PSTATUS ?? "");
                                                return (
                                                    <tr key={i} onClick={() => handleSelectPacking(row)}
                                                        className={cn("cursor-pointer transition-colors divide-x divide-[#DBD9D9]", sel ? "!bg-[#FB7506]/10" : "hover:bg-gray-50")}
                                                        style={!sel ? subtleColorFromInt(row.COLOR) : undefined}>
                                                        <td className="p-2 text-[#FB7506] font-semibold">{t(row.GROWER_CONTROL ?? row.CTRL ?? "")}</td>
                                                        <td className="p-2 max-w-[100px] truncate font-medium">{t(row.GROWER)}</td>
                                                        <td className="p-2">{t(row.AIRLINE ?? row.AIRLINE_UQ ?? "")}</td>
                                                        <td className="p-2">{t(row.AWBCODE)}</td>
                                                        <td className="p-2">{t(row.BOX_DATE ?? row.DATE_INVO ?? "").substring(0, 10)}</td>
                                                        <td className="p-2">{t(row.INVOICE_NO)}</td>
                                                        <td className="p-2">{t(row.PACKING_NO)}</td>
                                                        <td className="p-2 text-right">{t(row.TOTAL_PIECES)}</td>
                                                        <td className="p-2 text-right">{fmt2(row.TOTAL_INVOICE ?? row.TOTAL_COST ?? 0)}</td>
                                                        <td className="p-2">{t(row.WHOUSE ?? row.WPHYSICAL ?? row.PWHOUSE ?? "")}</td>
                                                        <td className="p-2 text-gray-400 max-w-[100px] truncate">{t(row.DETAILS ?? row.COMMENTS ?? "")}</td>
                                                        <td className={cn("p-2", st === "CLOSED" ? "text-red-500" : st === "OPEN" ? "text-green-600" : "text-gray-400")}>{st}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ══ Tab 4: AWB Search ══ */}
                    {activeTab === "awbsearch" && (
                        <div className="flex flex-col h-full min-h-0">
                            <div className="flex flex-col bg-white rounded-lg border border-[#DBD9D9] shadow-sm overflow-hidden flex-1 min-h-0">

                                {/* Header */}
                                <div className="h-10 bg-white border-b border-[#DBD9D9] flex items-center justify-between px-3 shrink-0 gap-2">
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Search size={14} className="text-[#FB7506]" />
                                        <span className="text-[14px] font-bold uppercase tracking-tight text-[#4F4F4F]">Packing Box Search</span>
                                        {loadingSearch && <RefreshCcw size={10} className="animate-spin text-gray-400" />}
                                        {awbTotal > 0 && (
                                            <span className="text-[10px] font-bold text-gray-400 ml-2">
                                                {awbAccRows.length} / {awbTotal} records
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <div className="flex items-center bg-[#F5F3F3] border border-[#DBD9D9] rounded px-2 py-1 gap-1 w-48">
                                            <Search size={11} className="text-gray-400 shrink-0" />
                                            <input type="text" value={awbSearchInput}
                                                onChange={e => setAwbSearchInput(e.target.value)}
                                                onKeyDown={e => { if (e.key === "Enter") { setAwbAccRows([]); setAwbSearchQ(awbSearchInput); setAwbSearchPage(1); } }}
                                                placeholder="AWB code, PO#, product..."
                                                className="text-[11px] text-gray-700 placeholder-gray-400 outline-none flex-1 min-w-0 bg-transparent" />
                                            {awbSearchQ && (
                                                <button onClick={() => { setAwbAccRows([]); setAwbTotal(0); setAwbSearchQ(""); setAwbSearchInput(""); setAwbSearchPage(1); }}>
                                                    <X size={11} className="text-gray-400 hover:text-gray-700" />
                                                </button>
                                            )}
                                        </div>
                                        <button onClick={() => { setAwbAccRows([]); setAwbSearchQ(awbSearchInput); setAwbSearchPage(1); }}
                                            className="flex items-center gap-1.5 h-7 px-3 bg-[#FB7506] hover:bg-orange-500 text-white rounded-md text-[14px] font-semibold uppercase tracking-wide transition-colors shrink-0">
                                            <Search size={14} /> Search
                                        </button>
                                        <button onClick={() => toast.info("Invoices — coming soon.")}
                                            className="flex items-center gap-1.5 h-7 px-3 bg-white hover:bg-gray-50 text-[#4F4F4F] border border-[#DBD9D9] rounded-md text-[14px] font-semibold uppercase tracking-wide transition-colors shrink-0">
                                            <FileText size={14} /> Invoices
                                        </button>
                                    </div>
                                </div>

                                {/* Grid */}
                                <div className="flex-1 overflow-auto">
                                    <table className="min-w-full text-xs text-left whitespace-nowrap">
                                        <thead className="bg-[#4F4F4F] text-white text-[11px] font-bold uppercase sticky top-0 z-10">
                                            <tr className="divide-x divide-[#DBD9D9]/30">
                                                {["Lot","AWB","Date","Grower","Description","Case","Qty","Units","Price","Stock"].map(h => (
                                                    <th key={h} className="p-2 whitespace-nowrap">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#DBD9D9]">
                                            {awbAccRows.length === 0 && !loadingSearch ? (
                                                <tr><td colSpan={10} className="p-4 text-center text-gray-400 italic">Type to search — AWB code, lot#, or product name</td></tr>
                                            ) : (awbAccRows as any[]).map((row: any, i: number) => {
                                                const stk = Number(row.STOCK ?? 0);
                                                return (
                                                <tr key={i} className="cursor-pointer transition-colors hover:bg-gray-50 divide-x divide-[#DBD9D9]"
                                                    onClick={() => handleSelectPacking(row)}>
                                                    <td className="p-2">{t(row.LOTE ?? "")}</td>
                                                    <td className="p-2 font-semibold text-[#FB7506]">{t(row.AWBCODE)}</td>
                                                    <td className="p-2">{fmtDate(row.BOX_DATE ?? row.AVAILABLE_DATE ?? "")}</td>
                                                    <td className="p-2 max-w-[100px] truncate">{t(row.GROWER ?? "")}</td>
                                                    <td className="p-2 max-w-[180px] truncate">{t(row.DESCRIPTION ?? "")}</td>
                                                    <td className="p-2">{t(row.CASE_SH ?? row.CASE_NAME ?? "")}</td>
                                                    <td className="p-2 text-right">{t(row.BOX_QTY ?? "")}</td>
                                                    <td className="p-2 text-right">{t(row.TOTAL_UNITS ?? "")}</td>
                                                    <td className="p-2 text-right">{fmt4(row.PRICE_X_U ?? 0)}</td>
                                                    <td className={cn("p-2 text-right", stk < 0 ? "text-red-500" : stk > 0 ? "text-green-600" : "text-gray-300")}>{stk || ""}</td>
                                                </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                    <div ref={awbSentinelRef} className="h-1" />
                                    {loadingSearch && (
                                        <div className="flex justify-center py-2">
                                            <RefreshCcw size={14} className="animate-spin text-gray-400" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ══ Tab 5: PO List ══ */}
                    {activeTab === "polist" && (
                        <div className="flex flex-col gap-2 h-full">
                            <div className="flex flex-col bg-white rounded-lg border border-[#DBD9D9] shadow-sm overflow-hidden flex-1 min-h-0">
                                <div className="h-10 bg-white border-b border-[#DBD9D9] flex items-center justify-between px-3 shrink-0 gap-2">
                                    <div className="flex items-center gap-2 shrink-0">
                                        <ShoppingCart size={14} className="text-[#FB7506]" />
                                        <span className="text-[14px] font-bold uppercase tracking-tight text-[#4F4F4F]">Purchase Orders</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                                        <input type="date" value={ldship_date} onChange={e => { setLdship_date(e.target.value); setPoGrower(""); }}
                                            className="h-7 text-[12px] border border-[#DBD9D9] rounded-md px-1.5 bg-white shrink-0" />
                                        <button onClick={() => { qc.invalidateQueries({ queryKey: ["ie-po-summary", ldship_date] }); if (poGrower) qc.invalidateQueries({ queryKey: ["ie-po-grower", poGrower, ldship_date] }); }}
                                            className="flex items-center gap-1.5 h-7 px-3 bg-white hover:bg-gray-50 border border-[#DBD9D9] text-[#4F4F4F] rounded-md text-[14px] font-semibold uppercase tracking-wide transition-colors shrink-0">
                                            <RefreshCcw size={14} className={loadingPO ? "animate-spin" : ""} /> Refresh
                                        </button>
                                        <select value={poGrower} onChange={e => setPoGrower(e.target.value)}
                                            className="h-7 text-[12px] border border-[#DBD9D9] rounded-md px-1.5 bg-white max-w-[140px] shrink-0">
                                            <option value="">All Vendors</option>
                                            {poRows.map((r: any, i: number) => {
                                                const uq = t(r.GROWER_UQ ?? r.GRO_UQ ?? r.VENDOR_UQ ?? r.GROW_UQ ?? "") || String(i);
                                                return <option key={uq} value={uq}>{t(r.GROWER ?? r.GROWER_NAME ?? r.VENDOR ?? "")}</option>;
                                            })}
                                        </select>
                                        {poGrower && (
                                            <button onClick={() => setPoGrower("")}
                                                className="text-[12px] text-[#FB7506] hover:text-orange-600 font-semibold shrink-0">
                                                &larr; Back
                                            </button>
                                        )}
                                        <button onClick={() => toast.info("Add P.O to Inventory — coming soon (needs a destination-packing design, see \"Add from PO\" on the AWB's Packings tab for the equivalent per-PO flow).")}
                                            className="flex items-center gap-1.5 h-7 px-3 bg-green-600 hover:bg-green-500 text-white rounded-md text-[14px] font-semibold uppercase tracking-wide transition-colors shrink-0">
                                            <Plus size={14} /> Add P.O
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-auto">
                                    {!poGrower ? (
                                        <table className="min-w-full text-xs text-left">
                                            <thead className="bg-[#4F4F4F] text-white text-[11px] font-bold uppercase sticky top-0 z-10">
                                                <tr className="divide-x divide-[#DBD9D9]/30">
                                                    {["Grower","Ship Date","POrders","Shipped","Arrived","Amount"].map(h => (
                                                        <th key={h} className="p-2 whitespace-nowrap">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#DBD9D9]">
                                                {poRows.length === 0 ? (
                                                    <tr><td colSpan={6} className="p-4 text-center text-gray-400 italic">No purchase orders for this date</td></tr>
                                                ) : (poRows as any[]).map((row: any, i: number) => {
                                                    const uq = t(row.GROWER_UQ ?? row.GRO_UQ ?? row.VENDOR_UQ ?? row.GROW_UQ ?? "") || String(i);
                                                    return (
                                                    <tr key={i} onClick={() => setPoGrower(uq)}
                                                        className="cursor-pointer transition-colors hover:bg-gray-50 divide-x divide-[#DBD9D9]">
                                                        <td className="p-2 max-w-[120px] truncate font-medium">{t(row.GROWER)}</td>
                                                        <td className="p-2">{t(row.SHIP_DATE ?? "").substring(0, 10)}</td>
                                                        <td className="p-2 text-right">{t(row.QTY_PORDER)}</td>
                                                        <td className="p-2 text-right">{t(row.QTY_SHIP)}</td>
                                                        <td className="p-2 text-right">{t(row.QTY_ARRIVED)}</td>
                                                        <td className="p-2 text-right">{fmt2(row.EXT_PRICE)}</td>
                                                    </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <table className="min-w-full text-xs text-left whitespace-nowrap">
                                            <thead className="bg-[#4F4F4F] text-white text-[11px] font-bold uppercase sticky top-0 z-10">
                                                <tr className="divide-x divide-[#DBD9D9]/30">
                                                    {["Farm","P.Order","S.Order","Customer","Case","Description","T.Units","Ordered","Confirm","Diff","Ship"].map((h, hi) => (
                                                        <th key={h} className={cn("p-2 whitespace-nowrap", hi >= 6 ? "text-center w-16" : "")}>{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#DBD9D9]">
                                                {loadingPOG ? (
                                                    <tr><td colSpan={11} className="p-4 text-center"><RefreshCcw size={14} className="animate-spin mx-auto text-gray-400" /></td></tr>
                                                ) : (poByGrower as any[]).length === 0 ? (
                                                    <tr><td colSpan={11} className="p-4 text-center text-gray-400 italic">No orders</td></tr>
                                                ) : (poByGrower as any[]).map((row: any, i: number) => (
                                                    <tr key={i} className="transition-colors hover:bg-gray-50 divide-x divide-[#DBD9D9]">
                                                        <td className="p-2 text-gray-500 w-12">{t(row.FARM ?? "")}</td>
                                                        <td className="p-2">{t(row.PORDER ?? row.PORDER_NO ?? "")}</td>
                                                        <td className="p-2 text-gray-500">{t(row.SORDER_NO ?? "")}</td>
                                                        <td className="p-2 max-w-[130px] truncate">{t(row.CUSTOMER ?? "")}</td>
                                                        <td className="p-2">{t(row.CASE_NAME ?? row.PACK ?? "")}</td>
                                                        <td className="p-2 max-w-[180px] truncate">{t(row.DESCRIPTION ?? row.VARIETY ?? "")}</td>
                                                        <td className="p-2 text-center w-16">{t(row.TOTAL_UNITS ?? "")}</td>
                                                        <td className="p-2 text-center w-16">{t(row.QTY_PORDER ?? "")}</td>
                                                        <td className="p-2 text-center w-16 text-green-600">{t(row.QTY_CONFIRM ?? "")}</td>
                                                        <td className="p-2 text-center w-16 text-[#FB7506]">{t(row.QTY_DIFF ?? "")}</td>
                                                        <td className="p-2 text-center w-16 text-blue-600">{t(row.QTY_SHIP ?? "")}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>

            {/* ─── Packing Header Modal ──────────────────────────────────────────────── */}
            {modalPacking && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setModalPacking(false)}>
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
                        onClick={e => e.stopPropagation()}>

                        <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-0 rounded-t-lg shrink-0">
                            <div className="flex items-center gap-2">
                                <Package size={16} className="text-[#FB7506]" />
                                <span className="font-black text-[10px] text-white uppercase tracking-widest">
                                    {modalPackingMode === "add" ? "New Packing" : "Edit Packing"}
                                </span>
                                {packError && (
                                    <span className="flex items-center gap-1 text-amber-400 text-[10px] font-bold ml-2 truncate">
                                        <AlertCircle size={12} />{packError}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1.5 px-2">
                                <button onClick={handleSavePacking} disabled={packSaving}
                                    className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-1.5 rounded text-xs font-black uppercase tracking-wider transition-all">
                                    {packSaving ? <RefreshCcw size={14} className="animate-spin" /> : <Save size={14} />}
                                    {packSaving ? "Saving..." : "Save"}
                                </button>
                                <button onClick={() => setModalPacking(false)}
                                    className="flex items-center gap-1.5 bg-gray-500 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-xs font-black uppercase tracking-wider transition-all">
                                    <X size={14} /> Cancel
                                </button>
                            </div>
                        </div>

                        <div className="overflow-y-auto flex-1 p-4">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 text-xs">
                                <div className="sm:col-span-2 flex flex-col gap-0.5">
                                    <label className={fLabel}>Vendor *</label>
                                    <select value={t(packForm.grower_uq)} onChange={e => setPackForm((p: any) => ({ ...p, grower_uq: e.target.value }))} className={fInput}>
                                        <option value="">-- Select Vendor --</option>
                                        {growers.map((g: any) => (
                                            <option key={t(g.UNICO)} value={t(g.UNICO)}>{t(g.GROWER ?? g.DESCRIPTION ?? g.UNICO)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <label className={fLabel}>Packing No.</label>
                                    <input value={t(packForm.packing_no)} onChange={e => setPackForm((p: any) => ({ ...p, packing_no: e.target.value }))} className={fInput} />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <label className={fLabel}>Airline</label>
                                    <select value={t(packForm.airline_code)} onChange={e => setPackForm((p: any) => ({ ...p, airline_code: e.target.value }))} className={fInput}>
                                        <option value="">-- None --</option>
                                        {airlines.map((a: any) => (
                                            <option key={t(a.COD_LINEA)} value={t(a.COD_LINEA)}>{t(a.AIRLINE ?? a.COD_LINEA)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <label className={fLabel}>AWB Number (8 digits)</label>
                                    <input value={t(packForm.awbnumber)} onChange={e => setPackForm((p: any) => ({ ...p, awbnumber: e.target.value.replace(/\D/g, "").substring(0, 8) }))} className={fInput + " font-mono"} maxLength={8} />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <label className={fLabel}>Invoice No.</label>
                                    <input value={t(packForm.invoice_no)} onChange={e => setPackForm((p: any) => ({ ...p, invoice_no: e.target.value }))} className={fInput} />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <label className={fLabel}>Invoice Date</label>
                                    <input type="date" value={packForm.invoice_date} onChange={e => setPackForm((p: any) => ({ ...p, invoice_date: e.target.value }))} className={fInput} />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <label className={fLabel}>PO No.</label>
                                    <input type="number" value={packForm.porder_no} onChange={e => setPackForm((p: any) => ({ ...p, porder_no: parseInt(e.target.value) || 0 }))} className={fInput + " text-right"} />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <label className={fLabel}>Physical Warehouse</label>
                                    <select value={t(packForm.wphysical_uq)} onChange={e => setPackForm((p: any) => ({ ...p, wphysical_uq: e.target.value }))} className={fInput}>
                                        <option value="">-- None --</option>
                                        {warehouses.map((w: any) => (
                                            <option key={t(w.UNICO)} value={t(w.UNICO)}>{t(w.WAREHOUSE ?? w.DESCRIPTION ?? w.UNICO)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <label className={fLabel}>Available Date</label>
                                    <input type="date" value={packForm.available_date} onChange={e => setPackForm((p: any) => ({ ...p, available_date: e.target.value }))} className={fInput} />
                                </div>
                                <div className="flex flex-col gap-0.5 items-start">
                                    <label className={fLabel}>Consolidated</label>
                                    <input type="checkbox" checked={Boolean(packForm.consolidated)} onChange={e => setPackForm((p: any) => ({ ...p, consolidated: e.target.checked }))} className="w-5 h-5 mt-1 accent-[#FB7506]" />
                                </div>
                                <div className="sm:col-span-3 flex flex-col gap-0.5">
                                    <label className={fLabel}>Details</label>
                                    <textarea value={t(packForm.details)} onChange={e => setPackForm((p: any) => ({ ...p, details: e.target.value }))}
                                        rows={2} className="fos-input text-xs resize-none py-1" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Box Entry Modal ──────────────────────────────────────────────────── */}
            {modalBox && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
                    onClick={() => setModalBox(false)}>
                    <div className="bg-white rounded-t-2xl sm:rounded-lg shadow-2xl w-full sm:max-w-4xl h-[95vh] sm:max-h-[92vh] flex flex-col overflow-hidden"
                        onClick={e => e.stopPropagation()}>

                        <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-0 rounded-t-lg shrink-0">
                            <div className="flex items-center gap-2">
                                <Boxes size={16} className="text-[#FB7506]" />
                                <span className="font-black text-[10px] text-white uppercase tracking-widest">
                                    {modalBoxMode === "add" ? "Add Box — Inventory Entry" : "Edit Box"}
                                </span>
                                {boxError && (
                                    <span className="flex items-center gap-1 text-amber-400 text-[10px] font-bold ml-2 truncate">
                                        <AlertCircle size={12} />{boxError}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1.5 px-2">
                                <button onClick={handleSaveBox} disabled={boxSaving}
                                    className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-1.5 rounded text-xs font-black uppercase tracking-wider transition-all">
                                    {boxSaving ? <RefreshCcw size={14} className="animate-spin" /> : <Save size={14} />}
                                    {boxSaving ? "Saving..." : "Save"}
                                </button>
                                <button onClick={() => setModalBox(false)}
                                    className="flex items-center gap-1.5 bg-gray-500 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-xs font-black uppercase tracking-wider transition-all">
                                    <X size={14} /> Cancel
                                </button>
                            </div>
                        </div>

                        <div className="overflow-y-auto flex-1 p-3 md:p-4 space-y-3">
                            {/* Readonly context */}
                            <div className="flex items-center gap-4 bg-gray-50 rounded px-3 py-1.5 border border-gray-100 text-xs">
                                <span className="text-gray-500 font-bold">Packing: <span className="text-gray-800">{selPacking ? t(selPacking.PACKING_NO) : lcpack_uq}</span></span>
                                <span className="text-gray-500 font-bold">AWB: <span className="font-mono text-gray-800">{lcawbcode}</span></span>
                                <span className="text-gray-500 font-bold">Vendor: <span className="text-gray-800">{selPacking ? t(selPacking.GROWER) : ""}</span></span>
                            </div>

                            {/* Main fields grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-2 text-xs">
                                {/* Case */}
                                <div className="flex flex-col gap-0.5">
                                    <label className={fLabel}>Case *</label>
                                    <select value={t(boxForm.case_uq)} onChange={e => setBoxField("case_uq", e.target.value)} className={fInput}>
                                        <option value="">-- Case --</option>
                                        {cases.map((c: any) => (
                                            <option key={t(c.UNICO)} value={t(c.UNICO)}>{t(c.CASE ?? c.DESCRIPTION ?? c.UNICO)}</option>
                                        ))}
                                    </select>
                                </div>
                                {/* Product */}
                                <div className="sm:col-span-2 flex flex-col gap-0.5 relative">
                                    <label className={fLabel}>Product *</label>
                                    <div className="flex gap-1">
                                        <input
                                            value={prodPickQuery}
                                            onChange={e => { setProdPickQuery(e.target.value); setBoxField("product_uq", ""); }}
                                            onKeyDown={e => e.key === "Enter" && doProdPickSearch()}
                                            className={fInput + " flex-1"} placeholder="Search product..." />
                                        <button onClick={doProdPickSearch} type="button"
                                            className="h-7 px-2 bg-gray-700 hover:bg-gray-800 text-white rounded flex items-center gap-1 shrink-0">
                                            {prodPickSearching ? <RefreshCcw size={11} className="animate-spin" /> : <Search size={11} />}
                                        </button>
                                    </div>
                                    {prodPickResults.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 z-10 mt-0.5 max-h-40 overflow-y-auto border border-gray-200 rounded bg-white shadow-lg">
                                            {prodPickResults.map((p: any, i: number) => (
                                                <div key={i} onClick={() => pickBoxProduct(p)}
                                                    className="px-2 py-1 text-xs cursor-pointer hover:bg-blue-50 border-b border-gray-50 last:border-0 truncate">
                                                    {t(p.DESCRIPTION)}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {/* C.POrder */}
                                <div className="flex flex-col gap-0.5">
                                    <label className={fLabel}>C.POrder #</label>
                                    <input value={t(boxForm.cporder_no)} onChange={e => setBoxField("cporder_no", e.target.value.substring(0, 10))} className={fInput} maxLength={10} />
                                </div>
                                {/* Box Qty */}
                                <div className="flex flex-col gap-0.5">
                                    <label className={fLabel}>Box Qty *</label>
                                    <input type="number" value={boxForm.box_qty} onChange={e => setBoxField("box_qty", parseInt(e.target.value) || 0)} className={fInput + " text-right font-bold"} />
                                </div>
                                {/* Bunches x Case */}
                                <div className="flex flex-col gap-0.5">
                                    <label className={fLabel}>Bunches x Case</label>
                                    <input type="number" value={boxForm.packs_box} onChange={e => setBoxField("packs_box", parseInt(e.target.value) || 0)} className={fInput + " text-right"} />
                                </div>
                                {/* Stems x Bunch */}
                                <div className="flex flex-col gap-0.5">
                                    <label className={fLabel}>Stems x Bunch</label>
                                    <input type="number" value={boxForm.packs_units} onChange={e => setBoxField("packs_units", parseInt(e.target.value) || 0)} className={fInput + " text-right"} disabled={!boxForm.stem_pack} />
                                </div>
                                {/* Stem Pack toggle */}
                                <div className="flex flex-col gap-0.5 justify-end">
                                    <label className="flex items-center gap-2 cursor-pointer h-7">
                                        <input type="checkbox" checked={Boolean(boxForm.stem_pack)} onChange={e => setBoxField("stem_pack", e.target.checked)} className="w-4 h-4 accent-[#FB7506]" />
                                        <span className="text-xs font-semibold text-gray-700">Stem Pack</span>
                                    </label>
                                </div>
                                {/* Units/Box + Total Units (readonly) */}
                                <div className="flex flex-col gap-0.5">
                                    <label className={fLabel}>Units / Box</label>
                                    <input readOnly value={boxForm.units_x_box} className={fInput + " text-right bg-gray-50"} />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <label className={fLabel}>Total Units</label>
                                    <input readOnly value={boxForm.total_units} className={fInput + " text-right bg-gray-50 font-bold text-green-700"} />
                                </div>
                                {/* Lote (read-only, auto-generated) */}
                                {modalBoxMode === "edit" && (
                                    <div className="flex flex-col gap-0.5">
                                        <label className={fLabel}>Lote</label>
                                        <input readOnly value={boxForm.lote} className={fInput + " text-right bg-gray-50"} />
                                    </div>
                                )}
                                {/* Cut point */}
                                <div className="flex flex-col gap-0.5">
                                    <label className={fLabel}>Cut Point (0-4)</label>
                                    <input type="number" min={0} max={4} value={boxForm.cut_point} onChange={e => setBoxField("cut_point", Math.max(0, Math.min(4, parseInt(e.target.value) || 0)))} className={fInput + " text-right"} />
                                </div>
                                {/* Box Id / Cust Product Code */}
                                <div className="flex flex-col gap-0.5">
                                    <label className={fLabel}>Cust. Product Code / Box Id.</label>
                                    <input value={t(boxForm.box_id)} onChange={e => setBoxField("box_id", e.target.value.substring(0, 20))} className={fInput} maxLength={20} />
                                </div>
                            </div>

                            {/* Price fields */}
                            <div className="border-t border-gray-100 pt-2">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Pricing</p>
                                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-x-3 gap-y-2 text-xs">
                                    <div className="flex flex-col gap-0.5">
                                        <label className={fLabel}>Price / Unit</label>
                                        <input type="number" step="0.0001" value={boxForm.price_x_u} onChange={e => setBoxField("price_x_u", parseFloat(e.target.value) || 0)} className={fInput + " text-right"} />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <label className={fLabel}>T. Price</label>
                                        <input readOnly value={fmt2(boxForm.t_price)} className={fInput + " text-right bg-gray-50 font-bold"} />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <label className={fLabel}>F Cost x U.</label>
                                        <input type="number" step="0.0001" value={boxForm.f_cost_x_u} onChange={e => setBoxField("f_cost_x_u", parseFloat(e.target.value) || 0)} className={fInput + " text-right"} />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <label className={fLabel}>C Cost x U.</label>
                                        <input readOnly value={fmt4(boxForm.c_cost_x_u)} className={fInput + " text-right bg-gray-50"} title="Total charges / total units" />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <label className={fLabel}>T. Cost x U.</label>
                                        <input readOnly value={fmt4(boxForm.t_cost_x_u)} className={fInput + " text-right bg-gray-50"} />
                                    </div>
                                </div>
                            </div>

                            {/* Charges */}
                            <div className="border-t border-gray-100 pt-2">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Charges per Box</p>
                                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-x-3 gap-y-2 text-xs">
                                    {[
                                        { key: "freight_cost",  label: "Freight x Bx" },
                                        { key: "duties_cost",   label: "Duties x Bx" },
                                        { key: "broker_cost",   label: "Broker x Bx" },
                                        { key: "handling_cost", label: "Handling x Bx" },
                                        { key: "charge_cost",   label: "Other x Bx" },
                                    ].map(f => (
                                        <div key={f.key} className="flex flex-col gap-0.5">
                                            <label className={fLabel}>{f.label}</label>
                                            <input type="number" step="0.01" value={boxForm[f.key]}
                                                onChange={e => setBoxField(f.key, parseFloat(e.target.value) || 0)}
                                                className={fInput + " text-right"} />
                                        </div>
                                    ))}
                                    <div className="flex flex-col gap-0.5">
                                        <label className={fLabel}>T. Charges</label>
                                        <input readOnly value={fmt2(boxForm.t_charges)} className={fInput + " text-right bg-gray-50 font-bold text-red-700"} />
                                    </div>
                                </div>
                            </div>

                            {/* Extra fields */}
                            <div className="border-t border-gray-100 pt-2">
                                <div className="flex flex-col gap-0.5">
                                    <label className={fLabel}>Inventory Notes</label>
                                    <textarea value={t(boxForm.inventory_notes)} onChange={e => setBoxField("inventory_notes", e.target.value.substring(0, 250))}
                                        rows={2} className="fos-input text-xs resize-none py-1" maxLength={250} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Change AWB Modal ─────────────────────────────────────────────────── */}
            {modalChgAwb && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setModalChgAwb(false)}>
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm flex flex-col overflow-hidden"
                        onClick={e => e.stopPropagation()}>
                        <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 rounded-t-lg shrink-0">
                            <div className="flex items-center gap-2">
                                <Plane size={16} className="text-[#FB7506]" />
                                <span className="font-black text-[10px] text-white uppercase tracking-widest">Change AWB</span>
                            </div>
                            <button onClick={() => setModalChgAwb(false)} className="text-gray-400 hover:text-white transition-colors"><X size={16} /></button>
                        </div>
                        <div className="p-4 space-y-3">
                            <div className="bg-gray-50 rounded p-2 text-xs text-gray-600 border border-gray-100">
                                Current AWB: <span className="font-mono font-bold text-gray-800">{lcawbcode}</span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <label className={fLabel}>Airline *</label>
                                <select value={chgAwbForm.airline_code} onChange={e => setChgAwbForm(p => ({ ...p, airline_code: e.target.value }))} className={fInput}>
                                    <option value="">-- None --</option>
                                    {airlines.map((a: any) => (
                                        <option key={t(a.COD_LINEA)} value={t(a.COD_LINEA)}>{t(a.AIRLINE ?? a.COD_LINEA)}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <label className={fLabel}>New AWB Number (8 digits) *</label>
                                <input value={chgAwbForm.awbnumber} onChange={e => setChgAwbForm(p => ({ ...p, awbnumber: e.target.value.replace(/\D/g, "").substring(0, 8) }))} className={fInput + " font-mono"} maxLength={8} />
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <label className={fLabel}>Invoice Date</label>
                                <input type="date" value={chgAwbForm.date_invo} onChange={e => setChgAwbForm(p => ({ ...p, date_invo: e.target.value }))} className={fInput} />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 px-4 py-3 bg-gray-50 border-t shrink-0">
                            <button onClick={() => setModalChgAwb(false)}
                                className="px-4 py-2 rounded border border-gray-200 text-xs font-black uppercase text-gray-600 hover:bg-gray-100 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleSaveChangeAwb} disabled={chgAwbSaving}
                                className="flex items-center gap-2 px-5 py-2 rounded bg-[#FB7506] hover:bg-orange-600 disabled:opacity-40 text-white text-xs font-black uppercase tracking-wider transition-all">
                                {chgAwbSaving ? <RefreshCcw size={12} className="animate-spin" /> : <Check size={12} />}
                                {chgAwbSaving ? "Saving..." : "Change"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Box Move Modal ───────────────────────────────────────────────────── */}
            <ModalBoxMove
                open={modalBoxMove}
                onClose={() => setModalBoxMove(false)}
                boxUnico={lcpk_box_uq}
                currentPackUq={lcpack_uq}
                userId={(session?.user as any)?.id || ""}
                onSuccess={() => { refetchBoxes(); logAction("Edit", lcpk_box_uq, AUDIT_MAP["move-box"].ext); }}
            />

            {/* ─── Select Physical Warehouse Modal ─────────────────────────────────── */}
            <ModalSelectPWarehouse
                open={modalSelectPWH}
                onClose={() => setModalSelectPWH(false)}
                warehouses={warehouses}
                onSelect={w => toast.info(`Warehouse selected: ${t(w.WHOUSE ?? w.UNICO)}`)}
            />

            {/* ─── Warehouse Totals Modal ───────────────────────────────────────────── */}
            <ModalWhouseTotals
                open={modalWhTotals}
                onClose={() => setModalWhTotals(false)}
                lddate={lddate}
                warehouses={warehouses}
            />

            {/* ─── Send to Warehouse Modal ──────────────────────────────────────────── */}
            <ModalSendToWhouse
                open={modalSendWH}
                onClose={() => setModalSendWH(false)}
                packUq={lcpack_uq}
                warehouses={warehouses}
                userId={(session?.user as any)?.id || ""}
                onSuccess={() => { handleRefresh(); logAction("Edit", lcpack_uq, AUDIT_MAP["to-whouse"].ext); }}
            />

            {/* ─── Header Copy Modal ────────────────────────────────────────────────── */}
            <ModalHeaderCopy
                open={modalCopy}
                onClose={() => setModalCopy(false)}
                packUq={lcpack_uq}
                userId={(session?.user as any)?.id || ""}
                onSuccess={(newUnico) => { handleRefresh(); if (newUnico) setLcpack_uq(newUnico); logAction("Insert", newUnico || lcpack_uq, AUDIT_MAP["copy-packing"].ext); }}
            />

            {/* ─── Filter Growers Modal ─────────────────────────────────────────────── */}
            <ModalFilterGrowers
                open={modalFiltGrowers}
                onClose={() => setModalFiltGrowers(false)}
                growers={growers}
                currentGrowerUq={filterGrowerUq}
                onApply={uq => setFilterGrowerUq(uq)}
            />

            {/* ─── Filter Customers Modal ───────────────────────────────────────────── */}
            <ModalFilterCustomers
                open={modalFiltCust}
                onClose={() => setModalFiltCust(false)}
                currentCustomer={filterCustomer}
                onApply={c => setFilterCustomer(c)}
            />

            {/* ─── Add Box from PO Modal ────────────────────────────────────────────── */}
            <ModalBoxPO
                open={modalBoxPO}
                onClose={() => setModalBoxPO(false)}
                packUq={lcpack_uq}
                ldship_date={lddate}
                userId={(session?.user as any)?.id || ""}
                onSuccess={() => { refetchBoxes(); logAction("Insert", lcpack_uq, AUDIT_MAP["insert-box"].ext); }}
            />

            {/* ─── Box WH Control Modal ─────────────────────────────────────────────── */}
            <ModalBoxWHControl
                open={modalBoxWHCtrl}
                onClose={() => setModalBoxWHCtrl(false)}
                boxUnico={lcpk_box_uq}
                cases={cases}
                userId={(session?.user as any)?.id || ""}
                onSuccess={() => { refetchBoxes(); logAction("Edit", lcpk_box_uq, AUDIT_MAP["whcontrol"].ext); }}
            />

            {/* ─── AWB Setup Modal ──────────────────────────────────────────────────── */}
            <ModalAWBSetup
                open={modalAWBSetup}
                onClose={() => setModalAWBSetup(false)}
                userId={(session?.user as any)?.id || ""}
                defaultDate={lddate}
                defaultAwbcode={lcawbcode}
            />

            {/* ─── Delete Packing Details Modal ─────────────────────────────────────── */}
            <ModalDeletePackingDetails
                open={modalDelDetails}
                onClose={() => setModalDelDetails(false)}
                packUq={lcpack_uq}
                packingDetails={packingDetails}
                userId={(session?.user as any)?.id || ""}
                onSuccess={() => { refetchBoxes(); qc.invalidateQueries({ queryKey: ["ie-packing-details", lcpack_uq] }); }}
            />

            {/* ─── Header 2 Modal ───────────────────────────────────────────────────── */}
            <ModalHeader2
                open={modalHeader2}
                onClose={() => setModalHeader2(false)}
                packUq={lcpack_uq}
                warehouses={warehouses}
                airlines={airlines}
                userId={(session?.user as any)?.id || ""}
                onSuccess={() => { handleRefresh(); logAction("Edit", lcpack_uq, AUDIT_MAP["update-packing"].ext); }}
            />

            {/* ─── Warehouse Transfer Modal ─────────────────────────────────────────── */}
            <ModalWarehouseTransfer
                open={modalTransfer}
                onClose={() => setModalTransfer(false)}
                boxUnico={lcpk_box_uq}
                warehouses={warehouses}
                userId={(session?.user as any)?.id || ""}
                onSuccess={() => { refetchBoxes(); logAction("Edit", lcpk_box_uq, AUDIT_MAP["transfer-box"].ext); }}
            />

            {/* ─── Box Notes Modal ──────────────────────────────────────────────────── */}
            <ModalBoxNotes
                open={modalNotes}
                onClose={() => setModalNotes(false)}
                boxUnico={lcpk_box_uq}
                onSuccess={() => { qc.invalidateQueries({ queryKey: ["ie-packing-details", lcpack_uq] }); logAction("Edit", lcpk_box_uq, AUDIT_MAP["box-notes"].ext); }}
            />

            {/* ─── Box Composition Modal ────────────────────────────────────────────── */}
            <ModalBoxComposition
                open={modalComposition}
                onClose={() => setModalComposition(false)}
                boxUnico={lcpk_box_uq}
                boxLabel={selBox ? t(selBox.DESCRIPTION ?? selBox.PRODUCT ?? "") : ""}
                onSuccess={() => { qc.invalidateQueries({ queryKey: ["ie-packing-details", lcpack_uq] }); logAction("Edit", lcpk_box_uq, AUDIT_MAP["box-composition"].ext); }}
            />

            {/* ─── Transform Inventory Modal ────────────────────────────────────────── */}
            <ModalBoxTransform
                open={modalTransform}
                onClose={() => setModalTransform(false)}
                boxUnico={lcpk_box_uq}
                boxLabel={selBox ? t(selBox.DESCRIPTION ?? selBox.PRODUCT ?? "") : ""}
                growers={growers}
                warehouses={warehouses}
                userId={(session?.user as any)?.id || ""}
                onSuccess={() => { refetchBoxes(); qc.invalidateQueries({ queryKey: ["ie-packing-details", lcpack_uq] }); logAction("Edit", lcpk_box_uq, AUDIT_MAP["transform"].ext); }}
            />

            {/* ─── RePacking Modal ──────────────────────────────────────────────────── */}
            <ModalBoxRepacking
                open={modalRepacking}
                onClose={() => setModalRepacking(false)}
                boxUnico={lcpk_box_uq}
                boxLabel={selBox ? t(selBox.DESCRIPTION ?? selBox.PRODUCT ?? "") : ""}
                growers={growers}
                warehouses={warehouses}
                cases={cases}
                userId={(session?.user as any)?.id || ""}
                onSuccess={() => { refetchBoxes(); qc.invalidateQueries({ queryKey: ["ie-packing-details", lcpack_uq] }); logAction("Edit", lcpk_box_uq, AUDIT_MAP["repacking"].ext); }}
            />

            {/* ─── Add Product to Packing Modal ─────────────────────────────────────── */}
            <ModalAddProductToPacking
                open={modalAddProdPack}
                onClose={() => setModalAddProdPack(false)}
                packUq={lcpack_uq}
                product={selectedProduct}
                cases={cases}
                userId={(session?.user as any)?.id || ""}
                onSuccess={() => { qc.invalidateQueries({ queryKey: ["ie-packing-details", lcpack_uq] }); logAction("Insert", lcpack_uq, AUDIT_MAP["insert-box"].ext); }}
            />

            {/* ─── Update Available Date Modal ──────────────────────────────────────── */}
            <ModalAvailableDate
                open={modalAvailDate}
                onClose={() => setModalAvailDate(false)}
                packUq={lcpack_uq}
                userId={(session?.user as any)?.id || ""}
                onSuccess={() => { refetchPLC(); qc.invalidateQueries({ queryKey: ["ie-packing-x-awb"] }); logAction("Edit", lcpack_uq, AUDIT_MAP["available-date"].ext); }}
            />

            <AppFooter areaLabel="Inventory" />
        </div>
    );
}
