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
    ShoppingCart, Flower2, Layers, Tag, ScanLine, MapPin,
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
import { ModalScanHistory }          from "@/components/inventory-entry/ModalScanHistory";
import { ModalFilterGrowers }        from "@/components/inventory-entry/ModalFilterGrowers";
import { ModalFilterCustomers }      from "@/components/inventory-entry/ModalFilterCustomers";
import { ModalBoxPO }                from "@/components/inventory-entry/ModalBoxPO";
import { ModalAddPOToInventory }     from "@/components/inventory-entry/ModalAddPOToInventory";
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
import { ModalEditBox }              from "@/components/inventory-entry/ModalEditBox";
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

// ─── Toolbar button (visible, above-the-grid actions — counterpart to GridMenu's dropdown items) ──
function TBtn({ icon: Icon, label, onClick, disabled, color = "default" }: {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    label: string; onClick: () => void; disabled?: boolean;
    color?: "default" | "green" | "orange" | "red" | "blue" | "amber" | "purple";
}) {
    return (
        <button onClick={onClick} disabled={disabled}
            className={cn(
                "flex items-center gap-1.5 px-3 h-7 rounded-md text-[14px] font-semibold uppercase tracking-wide border transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap shrink-0",
                color === "default" && "bg-white hover:bg-gray-50 border-[#DBD9D9] text-[#4F4F4F]",
                color === "green"   && "bg-green-600 hover:bg-green-700 border-transparent text-white",
                color === "orange"  && "bg-[#FB7506] hover:bg-orange-600 border-transparent text-white",
                color === "red"     && "bg-[#FB7506]/10 hover:bg-[#FB7506]/20 border-[#FB7506]/30 text-[#FB7506]",
                color === "blue"    && "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700",
                color === "amber"   && "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-600",
                color === "purple"  && "bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700",
            )}
        >
            <Icon size={14} />{label}
        </button>
    );
}

// ─── Empty forms ──────────────────────────────────────────────────────────────
const EMPTY_PACKING: any = {
    unico: "", grower_uq: "", packing_no: "", invoice_date: today(),
    invoice_no: "", airline_code: "", awbnumber: "", details: "",
    porder_no: 0, wphysical_uq: "", available_date: today(),
    consolidated: false,
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
    "update-product":  { table: "flower_products",            ext: "Update Product List FlexyMaxApp" },
    "add-po":          { table: "flower_packing_box",          ext: "Add P.O. to Inventory FlexyMaxApp" },
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

    // ── Box edit modal ────────────────────────────────────────────────────────
    const [modalEditBox, setModalEditBox] = useState(false);

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
    const [modalAddPO,       setModalAddPO]       = useState(false);
    const [selPOLine,        setSelPOLine]        = useState<any>(null);
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

    // ── Products List "Change Structure" / "Change to Prices Mode" inline-edit ─
    const [prodEditMode, setProdEditMode] = useState<"structure" | "prices" | null>(null);

    // ── AWB Search tab's bottom detail panel + scan history modal ──────────────
    const [awbDetailTab,    setAwbDetailTab]    = useState<"warehouse" | "invoice" | "adjusts">("warehouse");
    const [modalScanHistory, setModalScanHistory] = useState(false);

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

    // AWB Search tab's bottom Warehouse/Invoice/Adjusts panel, scoped to the selected box
    const { data: whData, isFetching: loadingWH } = useQuery({
        queryKey: ["ie-warehouse", lcpk_box_uq],
        queryFn:  () => fetch(`/api/inventory-entry/warehouse?pk_box_uq=${lcpk_box_uq}`).then(r => r.json()),
        enabled:  !!lcpk_box_uq && activeTab === "awbsearch",
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


    const { data: awbSearchData, isFetching: loadingSearch } = useQuery<{ rows: any[]; total: number }>({
        queryKey: ["ie-awb-search", awbSearchQ, awbSearchPage],
        queryFn:  () => fetch(`/api/inventory-entry/awb-search?page=${awbSearchPage}&pageSize=${AWB_PAGE_SIZE}&search=${encodeURIComponent(awbSearchQ)}`).then(r => r.json()),
        enabled:  activeTab === "awbsearch" && !!tabLoaded.awbsearch,
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

    // Horizontal scroll containers for Tab 1's grids — reset to the left on every
    // selection change so the newly-selected row is always fully visible from column 1.
    const dateScrollRef    = useRef<HTMLDivElement>(null);
    const awbListScrollRef = useRef<HTMLDivElement>(null);
    const vendorsScrollRef = useRef<HTMLDivElement>(null);
    const boxesScrollRef   = useRef<HTMLDivElement>(null);
    const resetScroll = (ref: React.RefObject<HTMLDivElement | null>) => { if (ref.current) ref.current.scrollLeft = 0; };

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
            resetScroll(dateScrollRef);
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
        resetScroll(awbListScrollRef);
    };

    const handleSelectPacking = (row: any) => {
        const id = t(row.PACK_UQ ?? row.UNICO);
        setLcpack_uq(id);
        setLcpk_box_uq("");
        qc.invalidateQueries({ queryKey: ["ie-packing-details", id] });
        resetScroll(vendorsScrollRef);
    };

    const handleSelectBox = (row: any) => { setLcpk_box_uq(t(row.UNICO)); resetScroll(boxesScrollRef); };

    // Cascade: selecting a row at one level auto-selects the first row at every level below it
    useEffect(() => {
        if (awbByDate.length > 0 && !lcawbcode) handleSelectAwb(awbByDate[0]);
    }, [awbByDate]);

    useEffect(() => {
        if (packingXAwb.length > 0 && !lcpack_uq) handleSelectPacking(packingXAwb[0]);
    }, [packingXAwb]);

    useEffect(() => {
        if (packingDetails.length > 0 && !lcpk_box_uq) handleSelectBox(packingDetails[0]);
    }, [packingDetails]);

    // "Locate" (AWB Search tab) — jump to AWB's Packings with this exact date/AWB/packing/box pre-selected
    const handleLocateBox = (row: any) => {
        const rawDate = t(row.BOX_DATE ?? row.AVAILABLE_DATE ?? "");
        const code = t(row.AWBCODE);
        if (!rawDate || !code) { toast.error("This row is missing date/AWB info."); return; }
        const parsed = new Date(rawDate);
        const date = isNaN(parsed.getTime()) ? rawDate.substring(0, 10) : parsed.toISOString().split("T")[0];
        setLddate(date);
        setLcawb(code);
        setLcawbcode(code);
        setLcpack_uq(t(row.PACK_UQ));
        setLcpk_box_uq(t(row.UNICO));
        setActiveTab("awbpackings");
        setTabLoaded(prev => ({ ...prev, awbpackings: true }));
    };

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
    const handleOpenEditBox = (boxUnicoOverride?: string) => {
        const editUnico = boxUnicoOverride || lcpk_box_uq;
        if (!editUnico) { toast.error("Select a box first."); return; }
        if (!perms.canEdit) { toast.error("Not authorized."); return; }
        if (editUnico !== lcpk_box_uq) setLcpk_box_uq(editUnico);
        setModalEditBox(true);
    };

    const handleAddBox = () => {
        if (!lcpack_uq) { toast.error("Select a packing first."); return; }
        if (!perms.canCreate) { toast.error("Not authorized."); return; }
        setActiveTab("products");
        setTabLoaded(prev => ({ ...prev, products: true }));
        toast.info("Search and select a product below, then click \"Add to Packing\".");
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

    // ── Products List inline-edit field save (Change Structure / Change to Prices Mode) ──
    const handleProdFieldSave = async (unico: string, field: string, value: any) => {
        try {
            const res = await fetch(`/api/inventory-entry/products/${unico}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ field, value }),
            });
            const d = await res.json();
            if (!d.success) throw new Error(d.error || "Update failed");
            setProdAccRows(prev => prev.map((r: any) => t(r.UNICO) === unico ? { ...r, [field.toUpperCase()]: value } : r));
            logAction("Edit", unico, AUDIT_MAP["update-product"].ext);
        } catch (e: any) {
            toast.error(e.message);
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
    const isPackingOpen = t(selPacking?.STATUS).toUpperCase() === "OPEN";

    // Growers actually present on this AWB's packings (mirrors VFP's "Vendors by AWB" combobox scope)
    const scopedGrowersSeen = new Map<string, any>();
    for (const r of packingXAwb as any[]) {
        const uq = t(r.GROWER_UQ);
        if (uq && !scopedGrowersSeen.has(uq)) scopedGrowersSeen.set(uq, { UNICO: uq, GROWER: t(r.GROWER) });
    }
    const scopedGrowers = Array.from(scopedGrowersSeen.values()).sort((a, b) => a.GROWER.localeCompare(b.GROWER));

    // Customers actually present on this AWB's boxes, and which packing(s) each belongs to
    // (mirrors VFP's "Customer by AWB" combobox scope, sp_flower_packing_awb_customers).
    const scopedCustomersSeen = new Map<string, any>();
    const packCustomerMap = new Map<string, Set<string>>();
    for (const r of boxesDetail as any[]) {
        const cUq = t(r.CUSTOMER_UQ);
        const pUq = t(r.PACK_UQ);
        if (cUq && !scopedCustomersSeen.has(cUq)) scopedCustomersSeen.set(cUq, { UNICO: cUq, CUSTOMER: t(r.CUSTOMER) });
        if (cUq && pUq) {
            if (!packCustomerMap.has(pUq)) packCustomerMap.set(pUq, new Set());
            packCustomerMap.get(pUq)!.add(cUq);
        }
    }
    const scopedCustomers = Array.from(scopedCustomersSeen.values()).sort((a, b) => a.CUSTOMER.localeCompare(b.CUSTOMER));

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
                    <div className="h-14 lg:h-10 bg-[#F5F3F3] border-b border-[#DBD9D9] flex items-end px-2 shrink-0 gap-0.5 overflow-x-auto">
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
                        <div className="flex flex-col gap-2">

                            {/* Row 1: Date Picker + AWB List — side by side on large screens, stacked below that */}
                            <div className="flex flex-col lg:flex-row gap-2 shrink-0 lg:max-h-[280px]">
                                {/* Date Picker */}
                                <div className="w-full lg:w-[30%] flex flex-col bg-white rounded-lg border border-[#DBD9D9] shadow-sm overflow-hidden shrink-0 max-h-[240px] lg:max-h-none">
                                    <div className="h-10 bg-white border-b border-[#DBD9D9] flex items-center justify-between pl-3 pr-0 shrink-0">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <Calendar size={14} className="text-[#FB7506] shrink-0" />
                                            <span className="text-[14px] font-bold uppercase tracking-tight text-[#4F4F4F] truncate">
                                                Date Picker <span className="text-gray-400">({(awbDates as any[]).length})</span>
                                            </span>
                                            {loadingDates && <RefreshCcw size={10} className="text-gray-400 animate-spin shrink-0" />}
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
                                    <div ref={dateScrollRef} className="flex-1 overflow-y-auto">
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
                                                            onClick={() => { setLddate(d); setLcawb("%"); setLcawbcode(""); setLcpack_uq(""); setLcpk_box_uq(""); resetScroll(dateScrollRef); }}
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
                                <div className="flex-1 flex flex-col bg-white rounded-lg border border-[#DBD9D9] shadow-sm overflow-hidden min-w-0 max-h-[240px] lg:max-h-none">
                                    <div className="h-10 bg-white border-b border-[#DBD9D9] flex items-center justify-between pl-3 pr-0 shrink-0">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <Plane size={14} className="text-[#FB7506] shrink-0" />
                                            <span className="text-[14px] font-bold uppercase tracking-tight text-[#4F4F4F] truncate">
                                                AWB List &mdash; {lddate} <span className="text-gray-400">({(awbByDate as any[]).length})</span>
                                            </span>
                                            {loadingAwb && <RefreshCcw size={10} className="text-gray-400 animate-spin shrink-0" />}
                                        </div>
                                        <GridMenu items={[
                                            { label: "Total By Whouse", icon: BarChart2, color: "blue", onClick: () => setModalWhTotals(true) },
                                            { label: "AWB Report", icon: FileText, color: "gray", onClick: () => openReport(`/api/inventory-entry/reports/awb-full?awb=${encodeURIComponent(lcawbcode)}`), disabled: !lcawbcode },
                                            { label: "WH Instructions", icon: FileText, color: "gray", onClick: () => openReport(`/api/inventory-entry/reports/wh-instructions?date=${lddate}&awb=${encodeURIComponent(lcawbcode)}`), disabled: !lcawbcode },
                                        ]} />
                                    </div>
                                    <div ref={awbListScrollRef} className="flex-1 overflow-auto">
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
                                </div>
                            </div>

                            {/* Vendors toolbar — common per-packing actions surfaced as buttons (full set still in the grid's menu) */}
                            <div className="sticky top-0 z-10 flex items-center gap-1.5 px-2 h-14 lg:h-9 bg-[#F5F3F3] border border-[#DBD9D9] rounded-lg shrink-0 shadow-sm overflow-x-auto">
                                <TBtn icon={Plus}        label="Add Packing"  color="green"  onClick={() => handleOpenPackingModal("add")} disabled={!lcawbcode || !perms.canCreate} />
                                <TBtn icon={Pencil}      label="Edit Packing" color="default" onClick={() => handleOpenPackingModal("edit")} disabled={!lcpack_uq || !perms.canEdit} />
                                <TBtn icon={Trash2}      label="Delete Packing" color="red" onClick={() => handleDeletePacking()} disabled={!lcpack_uq || !perms.canDelete} />
                                <div className="w-px h-5 bg-[#DBD9D9] shrink-0 mx-0.5" />
                                <TBtn icon={Check}       label="Open"          color="green"  onClick={() => packAction("open", "Open")} disabled={!lcpack_uq || !perms.canEdit} />
                                <TBtn icon={X}           label="Close"        color="amber"  onClick={() => packAction("close", "Close")} disabled={!lcpack_uq || !perms.canEdit} />
                                <TBtn icon={Pencil}      label="Change AWB"   color="blue"   onClick={() => handleOpenChangeAwb()} disabled={!perms.canEdit || !lcpack_uq} />
                                <TBtn icon={ArrowRight}  label="Send to WH"   color="orange" onClick={() => { if (!lcpack_uq) { toast.error("Select a packing first."); return; } setModalSendWH(true); }} />
                                <TBtn icon={BarChart2}   label="WH Totals"    color="blue"   onClick={() => setModalWhTotals(true)} />
                                <TBtn icon={Copy}        label="Copy"         color="blue"   onClick={() => { if (!lcpack_uq) { toast.error("Select a packing first."); return; } setModalCopy(true); }} disabled={!lcpack_uq} />
                                <div className="w-px h-5 bg-[#DBD9D9] shrink-0 mx-0.5" />
                                <TBtn icon={Flower2}     label="Filter Grower" color="purple" onClick={() => setModalFiltGrowers(true)} />
                                <TBtn icon={ShoppingCart} label="Filter Cust." color="purple" onClick={() => setModalFiltCust(true)} />
                            </div>

                            {/* Row 2: Vendors / Packings */}
                            <div className="flex flex-col bg-white rounded-lg border border-[#DBD9D9] shadow-sm overflow-hidden shrink-0 max-h-[320px]">
                                <div className="h-10 bg-white border-b border-[#DBD9D9] flex items-center justify-between pl-3 pr-0 shrink-0 gap-2 overflow-x-auto">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <Package size={14} className="text-[#FB7506] shrink-0" />
                                        <span className="text-[14px] font-bold uppercase tracking-tight text-[#4F4F4F] truncate">
                                            Vendors{lcawbcode ? ` — ${lcawbcode}` : ""} <span className="text-gray-400">({(packingXAwb as any[]).length})</span>
                                        </span>
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
                                    </div>
                                    <GridMenu items={[
                                        { label: "AWB Cust. PO", icon: FileText, color: "gray", onClick: () => openReport(`/api/inventory-entry/reports/awb-cporder?date=${lddate}&awb=${encodeURIComponent(lcawbcode || "%")}&pack_uq=${encodeURIComponent(lcpack_uq)}`), disabled: !lcpack_uq },
                                        { label: "Packing", icon: FileText, color: "gray", onClick: () => openReport(`/api/inventory-entry/reports/packing-arrived?date=${lddate}&awb=${encodeURIComponent(lcawbcode || "%")}&pack_uq=${encodeURIComponent(lcpack_uq)}&wphysical_uq=%25`), disabled: !lcpack_uq },
                                        { label: "COff", icon: FileText, color: "gray", onClick: () => openReport(`/api/inventory-entry/reports/cut-off?date=${lddate}&awb=${encodeURIComponent(lcawbcode || "%")}&pack_uq=${encodeURIComponent(lcpack_uq)}`), disabled: !lcpack_uq, separator: true },
                                        { label: "Label Laser", icon: Tag, color: "gray", onClick: () => openReport(`/api/inventory-entry/reports/label-laser?pack_uq=${encodeURIComponent(lcpack_uq)}`), disabled: !lcpack_uq },
                                        { label: "PDF Label", icon: Tag, color: "gray", onClick: () => handleSendLabel(), disabled: !lcpack_uq },
                                        { label: "Z300", icon: Tag, color: "gray", onClick: () => openReport(`/api/inventory-entry/reports/label-zebra?pack_uq=${encodeURIComponent(lcpack_uq)}&box_uq=%25`), disabled: !lcpack_uq },
                                        { label: "Z 4M", icon: Tag, color: "gray", onClick: () => openReport(`/api/inventory-entry/reports/label-zebra4m?pack_uq=${encodeURIComponent(lcpack_uq)}&box_uq=%25`), disabled: !lcpack_uq },
                                        { label: "RPK", icon: Tag, color: "gray", onClick: () => openReport(`/api/inventory-entry/reports/label-zebra-repacking?date=${lddate}&awbcode=${encodeURIComponent(lcawbcode || "%")}&pack_uq=${encodeURIComponent(lcpack_uq)}&box_uq=%25`), disabled: !lcpack_uq, separator: true },
                                        { label: "Header 2", icon: Pencil, color: "gray", onClick: () => { if (!lcpack_uq) { toast.error("Select a packing first."); return; } setModalHeader2(true); } },
                                        { label: "AWB Setup", icon: Plane, color: "purple", onClick: () => setModalAWBSetup(true) },
                                    ]} />
                                </div>
                                <div ref={vendorsScrollRef} className="flex-1 overflow-auto">
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
                                            // SP already filters by lcawb — apply the Grower/Customer toolbar filters client-side on top
                                            const filtered = (packingXAwb as any[]).filter(r => {
                                                if (filterGrowerUq && t(r.GROWER_UQ) !== filterGrowerUq) return false;
                                                if (filterCustomer && !packCustomerMap.get(packingId(r))?.has(filterCustomer)) return false;
                                                return true;
                                            });
                                            if (filtered.length === 0 && !loadingPacking) return (
                                                <tr><td colSpan={17} className="p-4 text-center text-gray-400 italic">
                                                    {!lcawbcode ? "Select a date" : (filterGrowerUq || filterCustomer) ? "No packings match the current filter" : "No packings for this AWB"}
                                                </td></tr>
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

                            {/* Boxes Detail toolbar — common per-box actions surfaced as buttons (full set still in the grid's menu) */}
                            <div className="sticky top-0 z-10 flex items-center gap-1.5 px-2 h-14 lg:h-9 bg-[#F5F3F3] border border-[#DBD9D9] rounded-lg shrink-0 shadow-sm overflow-x-auto">
                                <TBtn icon={Plus}        label="Add Box"      color="green"  onClick={() => handleAddBox()} />
                                <TBtn icon={Warehouse}   label="WHControl"    color="blue"   onClick={() => { if (!lcpk_box_uq) { toast.error("Select a box first."); return; } setModalBoxWHCtrl(true); }} disabled={!lcpk_box_uq} />
                                <TBtn icon={ArrowRight}  label="Move Box"     color="blue"   onClick={() => { if (!lcpk_box_uq) { toast.error("Select a box first."); return; } setModalBoxMove(true); }} disabled={!lcpk_box_uq} />
                                <TBtn icon={Warehouse}   label="WH Transfer"  color="blue"   onClick={() => { if (!lcpk_box_uq) { toast.error("Select a box first."); return; } setModalTransfer(true); }} disabled={!lcpk_box_uq} />
                                <TBtn icon={ClipboardList} label="Add from PO" color="green" onClick={() => { if (!lcpack_uq) { toast.error("Select a packing first."); return; } setModalBoxPO(true); }} disabled={!lcpack_uq} />
                                <div className="w-px h-5 bg-[#DBD9D9] shrink-0 mx-0.5" />
                                <TBtn icon={Layers}      label="Composition"  color="purple" onClick={() => { if (!lcpk_box_uq) { toast.error("Select a box first."); return; } setModalComposition(true); }} disabled={!lcpk_box_uq} />
                                <TBtn icon={FileText}    label="Notes"        color="purple" onClick={() => { if (!lcpk_box_uq) { toast.error("Select a box first."); return; } setModalNotes(true); }} disabled={!lcpk_box_uq} />
                                <TBtn icon={changePricesMode ? Check : Pencil} label={changePricesMode ? `Done — Prices (${Object.keys(priceEdits).length})` : "Change Prices"}
                                    color={changePricesMode ? "green" : "blue"} onClick={handleToggleChangePrices} disabled={savingPrices} />
                                <div className="w-px h-5 bg-[#DBD9D9] shrink-0 mx-0.5" />
                                <TBtn icon={Trash2}      label="Selection"    color="red"    onClick={() => { if (!lcpack_uq) { toast.error("Select a packing first."); return; } setModalDelDetails(true); }} disabled={!lcpack_uq} />
                            </div>

                            {/* Row 3: Boxes Detail */}
                            <div className="flex flex-col bg-white rounded-lg border border-[#DBD9D9] shadow-sm overflow-hidden shrink-0 h-[320px]">
                                <div className="h-10 bg-white border-b border-[#DBD9D9] flex items-center justify-between pl-3 pr-0 shrink-0 gap-2 overflow-x-auto">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <Boxes size={14} className="text-[#FB7506] shrink-0" />
                                        <span className="text-[14px] font-bold uppercase tracking-tight text-[#4F4F4F] truncate">
                                            Boxes Detail{selPacking ? ` — ${t(selPacking.GROWER)}` : ""} <span className="text-gray-400">({(packingDetails as any[]).length})</span>
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
                                        <AuditLogModal recordId={lcpk_box_uq} disabled={!lcpk_box_uq} size="sm" />
                                        <GridMenu items={[
                                            { label: "Edit Box", icon: Pencil, color: "gray", onClick: () => handleOpenEditBox(), disabled: !lcpk_box_uq },
                                            { label: "Delete Box", icon: Trash2, color: "red", onClick: () => handleDeleteBox(), separator: true },
                                            { label: "Transform Inventory", icon: ArrowRight, color: "orange", onClick: () => { if (!lcpk_box_uq) { toast.error("Select a box first."); return; } setModalTransform(true); }, separator: true },
                                            { label: "RePacking", icon: Package, color: "blue", onClick: () => { if (!lcpk_box_uq) { toast.error("Select a box first."); return; } setModalRepacking(true); }, separator: true },
                                            { label: "Zebra by Lot", icon: Tag, color: "gray", onClick: () => { if (!lcpk_box_uq) { toast.error("Select a box first."); return; } openReport(`/api/inventory-entry/reports/label-zebra?pack_uq=${encodeURIComponent(lcpack_uq)}&box_uq=${encodeURIComponent(lcpk_box_uq)}`); } },
                                            { label: "Meto by Lot", icon: Tag, color: "gray", onClick: () => { if (!lcpk_box_uq) { toast.error("Select a box first."); return; } openReport(`/api/inventory-entry/reports/label-meto?pack_uq=${encodeURIComponent(lcpack_uq)}&box_uq=${encodeURIComponent(lcpk_box_uq)}`); } },
                                        ]} />
                                    </div>
                                </div>
                                <div ref={boxesScrollRef} className="flex-1 overflow-auto">
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
                                                        <tr key={i} onClick={() => handleSelectBox(row)} onDoubleClick={() => handleOpenEditBox(t(row.UNICO))}
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
                                <div className="h-16 lg:h-10 bg-white border-b border-[#DBD9D9] flex items-center justify-between px-3 shrink-0 gap-2 overflow-x-auto">
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
                                        <div className="w-px h-5 bg-[#DBD9D9] mx-0.5 shrink-0" />
                                        <button
                                            onClick={() => setProdEditMode(m => m === "structure" ? null : "structure")}
                                            disabled={prodEditMode === "prices"}
                                            className="flex items-center gap-1.5 h-7 px-3 bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white rounded-md text-[12px] font-bold uppercase tracking-wide transition-colors shrink-0">
                                            {prodEditMode === "structure" ? "Done — Structure" : "Change Structure"}
                                        </button>
                                        <button
                                            onClick={() => setProdEditMode(m => m === "prices" ? null : "prices")}
                                            disabled={prodEditMode === "structure"}
                                            className="flex items-center gap-1.5 h-7 px-3 bg-[#FB7506]/10 hover:bg-[#FB7506]/20 border border-[#FB7506]/30 disabled:opacity-40 text-[#FB7506] rounded-md text-[12px] font-bold uppercase tracking-wide transition-colors shrink-0">
                                            {prodEditMode === "prices" ? "Done — Prices" : "Change to Prices Mode"}
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (!lcpack_uq) { toast.error("Select a packing in AWB's Packings first."); return; }
                                                if (!isPackingOpen) { toast.error("This packing is closed."); return; }
                                                if (!selectedProduct) { toast.error("Select a product first."); return; }
                                                setModalAddProdPack(true);
                                            }}
                                            disabled={!!lcpack_uq && !isPackingOpen}
                                            className="flex items-center gap-1.5 h-7 px-3 bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-md text-[14px] font-semibold uppercase tracking-wide transition-colors shrink-0">
                                            <Plus size={14} /> Add to Packing
                                        </button>
                                    </div>
                                </div>

                                {/* Selected Packing Info */}
                                <div className="h-10 bg-[#F5F3F3] border-b border-[#DBD9D9] flex items-center gap-4 px-3 shrink-0 overflow-x-auto whitespace-nowrap">
                                    {selPacking ? (
                                        <>
                                            <span className="text-[11px] shrink-0"><span className="font-bold text-gray-400 uppercase">Vendor:</span> <span className="font-bold text-[#4F4F4F]">{t(selPacking.GROWER)}</span></span>
                                            <span className="text-[11px] shrink-0"><span className="font-bold text-gray-400 uppercase">AWB:</span> <span className="font-bold text-[#4F4F4F]">{t(selPacking.AWBCODE)}</span></span>
                                            <span className="text-[11px] shrink-0"><span className="font-bold text-gray-400 uppercase">Packing No:</span> <span className="font-bold text-[#4F4F4F]">{t(selPacking.PACKING_NO)}</span></span>
                                            <span className="text-[11px] shrink-0"><span className="font-bold text-gray-400 uppercase">Invoice No:</span> <span className="font-bold text-[#4F4F4F]">{t(selPacking.INVOICE_NO)}</span></span>
                                            <span className="text-[11px] shrink-0"><span className="font-bold text-gray-400 uppercase">Date:</span> <span className="font-bold text-[#4F4F4F]">{t(selPacking.BOX_DATE ?? selPacking.DATE_INVO ?? "").substring(0, 12)}</span></span>
                                            <span className="text-[11px] shrink-0"><span className="font-bold text-gray-400 uppercase">Total Boxes:</span> <span className="font-bold text-[#4F4F4F]">{t(selPacking.TOTAL_BOXES)}</span></span>
                                            <span className="text-[11px] shrink-0"><span className="font-bold text-gray-400 uppercase">Total $ Warehouse:</span> <span className="font-bold text-[#4F4F4F]">{fmt2(selPacking.TOTAL_COST ?? selPacking.FLOWER_COST ?? 0)}</span></span>
                                            <span className={cn("text-[11px] font-black uppercase tracking-wide px-2 py-0.5 rounded ml-auto shrink-0",
                                                isPackingOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600")}>
                                                {isPackingOpen ? "Open" : "Closed"}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-[11px] text-gray-400 italic">No packing selected — pick one on the AWB&apos;s Packings tab</span>
                                    )}
                                </div>

                                {/* Grid */}
                                <div className="flex-1 overflow-auto">
                                    <table className="min-w-full text-xs text-left whitespace-nowrap">
                                        <thead className="bg-[#4F4F4F] text-white text-[11px] font-bold uppercase sticky top-0 z-10">
                                            <tr className="divide-x divide-[#DBD9D9]/30">
                                                {["Description","Class","Stems/Bunch","Bunches/Case","Units","Sales Price","PriceByS","Case"].map(h => (
                                                    <th key={h} className="p-2 whitespace-nowrap">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#DBD9D9]">
                                            {prodAccRows.length === 0 && !loadingProds ? (
                                                <tr><td colSpan={8} className="p-4 text-center text-gray-400 italic">No products found</td></tr>
                                            ) : (prodAccRows as any[]).map((row: any, i: number) => {
                                                const unico = t(row.UNICO);
                                                const editCellInput = "w-16 h-6 text-right text-xs border border-[#FB7506]/40 rounded px-1 bg-white focus:outline-none focus:ring-1 focus:ring-[#FB7506]";
                                                return (
                                                <tr key={i} onClick={() => setSelectedProduct(row)}
                                                    className={cn("cursor-pointer transition-colors divide-x divide-[#DBD9D9]", t(selectedProduct?.UNICO) === unico ? "!bg-[#FB7506]/10" : "hover:bg-gray-50")}>
                                                    <td className="p-2 max-w-[280px] truncate">{t(row.DESCRIPTION ?? row.DESC ?? row.PRODUCT_DESC ?? row.PRODUCT ?? "")}</td>
                                                    <td className="p-2">{t(row.CLASS ?? row.CLASE ?? "")}</td>
                                                    <td className="p-2 text-right" onClick={e => e.stopPropagation()}>
                                                        {prodEditMode === "structure" ? (
                                                            <input type="number" defaultValue={row.UP_X_PACK ?? 0} className={editCellInput}
                                                                onBlur={e => { const v = parseInt(e.target.value) || 0; if (v !== row.UP_X_PACK) handleProdFieldSave(unico, "up_x_pack", v); }} />
                                                        ) : t(row.UP_X_PACK ?? "")}
                                                    </td>
                                                    <td className="p-2 text-right" onClick={e => e.stopPropagation()}>
                                                        {prodEditMode === "structure" ? (
                                                            <input type="number" defaultValue={row.UP_X_CASE ?? 0} className={editCellInput}
                                                                onBlur={e => { const v = parseInt(e.target.value) || 0; if (v !== row.UP_X_CASE) handleProdFieldSave(unico, "up_x_case", v); }} />
                                                        ) : t(row.UP_X_CASE ?? "")}
                                                    </td>
                                                    <td className="p-2 text-right">{t(row.TOTAL_UNITS ?? row.UNITS ?? "")}</td>
                                                    <td className="p-2 text-right" onClick={e => e.stopPropagation()}>
                                                        {prodEditMode === "prices" ? (
                                                            <input type="number" step="0.01" defaultValue={row.SALES_PRICE ?? 0} className={editCellInput}
                                                                onBlur={e => { const v = parseFloat(e.target.value) || 0; if (v !== row.SALES_PRICE) handleProdFieldSave(unico, "sales_price", v); }} />
                                                        ) : fmt2(row.SALES_PRICE ?? row.PRICE ?? row.UNIT_PRICE ?? 0)}
                                                    </td>
                                                    <td className="p-2 text-center" onClick={e => e.stopPropagation()}>
                                                        <input type="checkbox" checked={Boolean(row.STEM_PACK)} disabled={prodEditMode !== "prices"}
                                                            onChange={e => handleProdFieldSave(unico, "stem_pack", e.target.checked)}
                                                            className="w-3.5 h-3.5 accent-[#FB7506] disabled:opacity-50" />
                                                    </td>
                                                    <td className="p-2">{t(row.CASE_NAME ?? row.CASE ?? row.PACK ?? "")}</td>
                                                </tr>
                                                );
                                            })}
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
                                <div className="h-16 lg:h-10 bg-white border-b border-[#DBD9D9] flex items-center justify-between px-3 shrink-0 gap-2 overflow-x-auto">
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
                        <div className="flex flex-col gap-2 h-full min-h-0">
                            <div className="flex flex-col bg-white rounded-lg border border-[#DBD9D9] shadow-sm overflow-hidden flex-1 min-h-0">

                                {/* Header */}
                                <div className="h-16 lg:h-10 bg-white border-b border-[#DBD9D9] flex items-center justify-between px-3 shrink-0 gap-2 overflow-x-auto">
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
                                        <div className="w-px h-5 bg-[#DBD9D9] mx-0.5 shrink-0" />
                                        <button onClick={() => { if (!lcpk_box_uq) { toast.error("Select a box first."); return; } openReport(`/api/inventory-entry/reports/box-history?box_uq=${encodeURIComponent(lcpk_box_uq)}`); }}
                                            className="flex items-center gap-1.5 h-7 px-3 bg-white hover:bg-gray-50 text-[#4F4F4F] border border-[#DBD9D9] rounded-md text-[14px] font-semibold uppercase tracking-wide transition-colors shrink-0">
                                            <FileText size={14} /> History
                                        </button>
                                        <button onClick={() => { if (!lcpk_box_uq) { toast.error("Select a box first."); return; } setModalScanHistory(true); }}
                                            className="flex items-center gap-1.5 h-7 px-3 bg-white hover:bg-gray-50 text-[#4F4F4F] border border-[#DBD9D9] rounded-md text-[14px] font-semibold uppercase tracking-wide transition-colors shrink-0">
                                            <ScanLine size={14} /> Scan History
                                        </button>
                                        <button onClick={() => { const sel = (awbAccRows as any[]).find(r => t(r.UNICO) === lcpk_box_uq); if (!sel) { toast.error("Select a box first."); return; } handleLocateBox(sel); }}
                                            className="flex items-center gap-1.5 h-7 px-3 bg-[#FB7506]/10 hover:bg-[#FB7506]/20 border border-[#FB7506]/30 text-[#FB7506] rounded-md text-[14px] font-semibold uppercase tracking-wide transition-colors shrink-0">
                                            <MapPin size={14} /> Locate
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
                                                <tr><td colSpan={10} className="p-4 text-center text-gray-400 italic">No boxes found</td></tr>
                                            ) : (awbAccRows as any[]).map((row: any, i: number) => {
                                                const stk = Number(row.STOCK ?? 0);
                                                const sel = lcpk_box_uq === t(row.UNICO);
                                                return (
                                                <tr key={i} onClick={() => setLcpk_box_uq(t(row.UNICO))} onDoubleClick={() => handleLocateBox(row)}
                                                    className={cn("cursor-pointer transition-colors divide-x divide-[#DBD9D9]", sel ? "!bg-[#FB7506]/10" : "hover:bg-gray-50")}>
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

                            {/* Bottom detail panel: Warehouse / Invoice / Adjusts for the selected box */}
                            <div className="flex flex-col bg-white rounded-lg border border-[#DBD9D9] shadow-sm overflow-hidden shrink-0 h-[240px]">
                                <div className="h-9 bg-[#F5F3F3] border-b border-[#DBD9D9] flex items-center gap-1 px-2 shrink-0">
                                    {([
                                        { key: "warehouse", label: "Warehouse" },
                                        { key: "invoice",   label: "Invoice" },
                                        { key: "adjusts",   label: "Adjusts" },
                                    ] as const).map(t2 => (
                                        <button key={t2.key} onClick={() => setAwbDetailTab(t2.key)}
                                            className={cn("h-7 px-3 rounded-md text-[12px] font-bold uppercase tracking-wide transition-colors",
                                                awbDetailTab === t2.key ? "bg-white text-[#FB7506] shadow-sm border border-[#DBD9D9]" : "text-[#4F4F4F] hover:bg-white/60")}>
                                            {t2.label}
                                        </button>
                                    ))}
                                    {loadingWH && <RefreshCcw size={11} className="animate-spin text-gray-400 ml-1" />}
                                    {!lcpk_box_uq && <span className="text-[11px] text-gray-400 italic ml-2">Select a box above</span>}
                                </div>
                                <div className="flex-1 overflow-auto">
                                    {awbDetailTab === "warehouse" && (
                                        <table className="min-w-full text-xs text-left whitespace-nowrap">
                                            <thead className="bg-[#4F4F4F] text-white text-[11px] font-bold uppercase sticky top-0 z-10">
                                                <tr className="divide-x divide-[#DBD9D9]/30">
                                                    {["Warehouse","AWB","Lote","W-Stock","Q-Hold","Days","Price","Type","Product"].map(h => (
                                                        <th key={h} className="p-2 whitespace-nowrap">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#DBD9D9]">
                                                {whStock.length === 0 ? (
                                                    <tr><td colSpan={9} className="p-4 text-center text-gray-400 italic">No warehouse stock for this box</td></tr>
                                                ) : (whStock as any[]).map((row: any, i: number) => (
                                                    <tr key={i} className="divide-x divide-[#DBD9D9] hover:bg-gray-50">
                                                        <td className="p-2 max-w-[160px] truncate">{t(row.WAREHOUSE ?? "")}</td>
                                                        <td className="p-2">{t(row.AWBCODE ?? "")}</td>
                                                        <td className="p-2">{t(row.LOTE ?? "")}</td>
                                                        <td className="p-2 text-right">{t(row.WH_STOCK ?? "")}</td>
                                                        <td className="p-2 text-right">{t(row.QTY_HOLD ?? "")}</td>
                                                        <td className="p-2 text-right">{t(row.DAYS ?? "")}</td>
                                                        <td className="p-2 text-right">{fmt4(row.PRICE_X_UNIT ?? 0)}</td>
                                                        <td className="p-2">{t(row.INV_TYPE ?? "")}</td>
                                                        <td className="p-2 max-w-[200px] truncate">{t(row.DESCRIPTION ?? "")}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                    {awbDetailTab === "invoice" && (
                                        <table className="min-w-full text-xs text-left whitespace-nowrap">
                                            <thead className="bg-[#4F4F4F] text-white text-[11px] font-bold uppercase sticky top-0 z-10">
                                                <tr className="divide-x divide-[#DBD9D9]/30">
                                                    {["Invoice","Date","Customer","Lote","Case","Qty","Units","Price","Ext.Price","Status","Void"].map(h => (
                                                        <th key={h} className="p-2 whitespace-nowrap">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#DBD9D9]">
                                                {whInvoices.length === 0 ? (
                                                    <tr><td colSpan={11} className="p-4 text-center text-gray-400 italic">No invoices for this box</td></tr>
                                                ) : (whInvoices as any[]).map((row: any, i: number) => (
                                                    <tr key={i} className="divide-x divide-[#DBD9D9] hover:bg-gray-50">
                                                        <td className="p-2 font-semibold text-[#FB7506]">{t(row.INVOICE_NO ?? "")}</td>
                                                        <td className="p-2">{t(row.INVOICE_DATE ?? "")}</td>
                                                        <td className="p-2 max-w-[140px] truncate">{t(row.CUSTOMER ?? "")}</td>
                                                        <td className="p-2">{t(row.LOTE ?? "")}</td>
                                                        <td className="p-2">{t(row.CASE_SH ?? "")}</td>
                                                        <td className="p-2 text-right">{t(row.BOX_QTY ?? "")}</td>
                                                        <td className="p-2 text-right">{t(row.TOTAL_UNITS ?? "")}</td>
                                                        <td className="p-2 text-right">{fmt4(row.PRICE ?? 0)}</td>
                                                        <td className="p-2 text-right">{fmt2(row.EXT_PRICE ?? 0)}</td>
                                                        <td className={cn("p-2", row.STATUS === "Closed" ? "text-red-500" : "text-green-600")}>{t(row.STATUS ?? "")}</td>
                                                        <td className="p-2">{t(row.VOID ?? "")}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                    {awbDetailTab === "adjusts" && (
                                        <table className="min-w-full text-xs text-left whitespace-nowrap">
                                            <thead className="bg-[#4F4F4F] text-white text-[11px] font-bold uppercase sticky top-0 z-10">
                                                <tr className="divide-x divide-[#DBD9D9]/30">
                                                    {["Date","Boxes","Amount","Reason","Notes"].map(h => (
                                                        <th key={h} className="p-2 whitespace-nowrap">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#DBD9D9]">
                                                {whAdjusts.length === 0 ? (
                                                    <tr><td colSpan={5} className="p-4 text-center text-gray-400 italic">No adjustments for this box</td></tr>
                                                ) : (whAdjusts as any[]).map((row: any, i: number) => (
                                                    <tr key={i} className="divide-x divide-[#DBD9D9] hover:bg-gray-50">
                                                        <td className="p-2">{t(row.ADJ_DATE ?? "")}</td>
                                                        <td className="p-2 text-right">{t(row.QTYBOXES ?? "")}</td>
                                                        <td className="p-2 text-right">{fmt2(row.AMOUNT ?? 0)}</td>
                                                        <td className="p-2">{t(row.REASON ?? "")}</td>
                                                        <td className="p-2 max-w-[240px] truncate text-gray-500">{t(row.NOTES ?? "")}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ══ Tab 5: PO List ══ */}
                    {activeTab === "polist" && (
                        <div className="flex flex-col gap-2 h-full">
                            <div className="flex flex-col bg-white rounded-lg border border-[#DBD9D9] shadow-sm overflow-hidden shrink-0 max-h-[300px]">
                                <div className="h-10 bg-white border-b border-[#DBD9D9] flex items-center justify-between px-3 shrink-0 gap-2">
                                    <div className="flex items-center gap-2 shrink-0">
                                        <ShoppingCart size={14} className="text-[#FB7506]" />
                                        <span className="text-[14px] font-bold uppercase tracking-tight text-[#4F4F4F]">
                                            Purchase Orders <span className="text-gray-400">({poRows.length})</span>
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                                        <input type="date" value={ldship_date} onChange={e => { setLdship_date(e.target.value); setPoGrower(""); }}
                                            className="h-7 text-[12px] border border-[#DBD9D9] rounded-md px-1.5 bg-white shrink-0" />
                                        <button onClick={() => { qc.invalidateQueries({ queryKey: ["ie-po-summary", ldship_date] }); if (poGrower) qc.invalidateQueries({ queryKey: ["ie-po-grower", poGrower, ldship_date] }); }}
                                            className="flex items-center gap-1.5 h-7 px-3 bg-white hover:bg-gray-50 border border-[#DBD9D9] text-[#4F4F4F] rounded-md text-[14px] font-semibold uppercase tracking-wide transition-colors shrink-0">
                                            <RefreshCcw size={14} className={loadingPO ? "animate-spin" : ""} /> Refresh
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-auto">
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
                                                const sel = poGrower === uq;
                                                return (
                                                <tr key={i} onClick={() => { setPoGrower(uq); setSelPOLine(null); }}
                                                    className={cn("cursor-pointer transition-colors divide-x divide-[#DBD9D9]", sel ? "!bg-[#FB7506]/10" : "hover:bg-gray-50")}>
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
                                </div>
                            </div>

                            {/* Detail: P.O. lines for the selected grower */}
                            <div className="flex flex-col bg-white rounded-lg border border-[#DBD9D9] shadow-sm overflow-hidden flex-1 min-h-0">
                                <div className="h-10 bg-white border-b border-[#DBD9D9] flex items-center justify-between px-3 shrink-0 gap-2 overflow-x-auto">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <ClipboardList size={14} className="text-[#FB7506] shrink-0" />
                                        <span className="text-[14px] font-bold uppercase tracking-tight text-[#4F4F4F] truncate">
                                            P.O. Lines{poGrower ? ` — ${t(poRows.find((r: any) => t(r.GROWER_UQ ?? r.GRO_UQ ?? r.VENDOR_UQ ?? r.GROW_UQ ?? "") === poGrower)?.GROWER)}` : ""} <span className="text-gray-400">({(poByGrower as any[]).length})</span>
                                        </span>
                                        {poGrower && (
                                            <button onClick={() => { setPoGrower(""); setSelPOLine(null); }} className="text-gray-400 hover:text-gray-700 shrink-0">
                                                <X size={13} />
                                            </button>
                                        )}
                                    </div>
                                    <button onClick={() => { if (!selPOLine) { toast.error("Select a P.O. line first."); return; } setModalAddPO(true); }}
                                        className="flex items-center gap-1.5 h-7 px-3 bg-green-600 hover:bg-green-500 text-white rounded-md text-[14px] font-semibold uppercase tracking-wide transition-colors shrink-0">
                                        <Plus size={14} /> Add P.O
                                    </button>
                                </div>
                                <div className="flex-1 overflow-auto">
                                    <table className="min-w-full text-xs text-left whitespace-nowrap">
                                        <thead className="bg-[#4F4F4F] text-white text-[11px] font-bold uppercase sticky top-0 z-10">
                                            <tr className="divide-x divide-[#DBD9D9]/30">
                                                {["Farm","P.Order","S.Order","Customer","Case","Description","T.Units","Ordered","Confirm","Diff","Ship"].map((h, hi) => (
                                                    <th key={h} className={cn("p-2 whitespace-nowrap", hi >= 6 ? "text-center w-16" : "")}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#DBD9D9]">
                                            {!poGrower ? (
                                                <tr><td colSpan={11} className="p-4 text-center text-gray-400 italic">Select a vendor above to see its P.O. lines</td></tr>
                                            ) : loadingPOG ? (
                                                <tr><td colSpan={11} className="p-4 text-center"><RefreshCcw size={14} className="animate-spin mx-auto text-gray-400" /></td></tr>
                                            ) : (poByGrower as any[]).length === 0 ? (
                                                <tr><td colSpan={11} className="p-4 text-center text-gray-400 italic">No orders</td></tr>
                                            ) : (poByGrower as any[]).map((row: any, i: number) => {
                                                const sel = selPOLine && t(selPOLine.PORDER_UQ) === t(row.PORDER_UQ) && t(selPOLine.SORDER_NO) === t(row.SORDER_NO);
                                                return (
                                                <tr key={i} onClick={() => setSelPOLine(row)}
                                                    className={cn("cursor-pointer transition-colors divide-x divide-[#DBD9D9]", sel ? "!bg-[#FB7506]/10" : "hover:bg-gray-50")}>
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
                                                );
                                            })}
                                        </tbody>
                                    </table>
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
                packingNo={t(selPacking?.PACKING_NO)}
                invoiceNo={t(selPacking?.INVOICE_NO)}
                grower={t(selPacking?.GROWER)}
                userId={(session?.user as any)?.id || ""}
                onSuccess={(newUnico) => { handleRefresh(); if (newUnico) setLcpack_uq(newUnico); logAction("Insert", newUnico || lcpack_uq, AUDIT_MAP["copy-packing"].ext); }}
            />

            {/* ─── Scan History Modal (AWB Search) ──────────────────────────────────── */}
            <ModalScanHistory
                open={modalScanHistory}
                onClose={() => setModalScanHistory(false)}
                boxUnico={lcpk_box_uq}
                lote={t((awbAccRows as any[]).find(r => t(r.UNICO) === lcpk_box_uq)?.LOTE)}
            />

            {/* ─── Filter Growers Modal ─────────────────────────────────────────────── */}
            <ModalFilterGrowers
                open={modalFiltGrowers}
                onClose={() => setModalFiltGrowers(false)}
                growers={scopedGrowers}
                currentGrowerUq={filterGrowerUq}
                onApply={uq => setFilterGrowerUq(uq)}
            />

            {/* ─── Filter Customers Modal ───────────────────────────────────────────── */}
            <ModalFilterCustomers
                open={modalFiltCust}
                onClose={() => setModalFiltCust(false)}
                customers={scopedCustomers}
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

            {/* ─── Add P.O. to Inventory Modal (PO List tab) ────────────────────────── */}
            <ModalAddPOToInventory
                open={modalAddPO}
                onClose={() => setModalAddPO(false)}
                poLine={selPOLine}
                defaultDate={ldship_date}
                userId={(session?.user as any)?.id || ""}
                onSuccess={() => {
                    setSelPOLine(null);
                    qc.invalidateQueries({ queryKey: ["ie-po-summary", ldship_date] });
                    if (poGrower) qc.invalidateQueries({ queryKey: ["ie-po-grower", poGrower, ldship_date] });
                    logAction("Insert", t(selPOLine?.PORDER_UQ), AUDIT_MAP["add-po"].ext);
                }}
            />

            {/* ─── Edit Box Modal ───────────────────────────────────────────────────── */}
            <ModalEditBox
                open={modalEditBox}
                onClose={() => setModalEditBox(false)}
                boxUnico={lcpk_box_uq}
                cases={cases}
                userId={(session?.user as any)?.id || ""}
                onSuccess={() => { refetchBoxes(); qc.invalidateQueries({ queryKey: ["ie-packing-details", lcpack_uq] }); logAction("Edit", lcpk_box_uq, AUDIT_MAP["update-box"].ext); }}
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
