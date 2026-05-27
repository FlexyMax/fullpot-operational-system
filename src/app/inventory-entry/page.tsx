"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    ArrowLeft, Package, RefreshCcw, Plus, Pencil, Trash2,
    Search, X, Save, ChevronDown, Calendar, FileText,
    AlertCircle, Check, Copy, ArrowRight, Warehouse,
    ClipboardList, Boxes, BarChart2, Plane,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { GridMenu } from "@/components/GridMenu";
import { usePagePermissions } from "@/lib/permissions";
import { useAuditLog } from "@/lib/audit";

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
const colorFromInt = (n: any) => {
    if (n == null) return undefined;
    const num = Number(n);
    if (isNaN(num) || num === 0) return undefined;
    const b = num & 0xFF;
    const g = (num >> 8) & 0xFF;
    const r = (num >> 16) & 0xFF;
    return `rgb(${r}, ${g}, ${b})`;
};

// ─── Empty forms ──────────────────────────────────────────────────────────────
const EMPTY_PACKING: any = {
    unico: "", grower_uq: "", packing_no: "", invoice_date: today(),
    invoice_no: "", awbcode: "", airline_uq: "", details: "",
    porder_no: 0, wphysical_uq: "", available_date: today(),
    inhouse: false, consolidated: false,
};

const EMPTY_BOX: any = {
    unico: "", product_uq: "", product_desc: "", case_uq: "", customer_uq: "",
    cporder_no: "", box_qty: 0, up_x_case: 0, bunches_x_case: 0,
    units_x_bunch: 0, total_units: 0, lote: 0, cut_point: "",
    price: 0, t_price: 0, f_cost_x_u: 0, f_cost: 0,
    c_cost_x_u: 0, t_cost: 0,
    freight_x_bx: 0, duties_x_bx: 0, broker_x_bx: 0,
    handling_x_bx: 0, ocharges_x_bx: 0, t_charges: 0,
    confir_box: false, sold_boxes: false,
    remarks: "", cust_product_code: "",
};

const calcBox = (f: any) => {
    const totalUnits = (f.box_qty || 0) * (f.up_x_case || 0);
    return {
        ...f,
        total_units: totalUnits,
        t_price:     (f.box_qty || 0) * (f.price || 0),
        f_cost:      (f.f_cost_x_u || 0) * totalUnits,
        t_cost:      (f.c_cost_x_u || 0) * totalUnits,
        t_charges:   ((f.freight_x_bx || 0) + (f.duties_x_bx || 0) +
                      (f.broker_x_bx  || 0) + (f.handling_x_bx || 0) +
                      (f.ocharges_x_bx || 0)) * (f.box_qty || 0),
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

    // ── Change AWB modal ──────────────────────────────────────────────────────
    const [modalChgAwb, setModalChgAwb] = useState(false);
    const [chgAwbForm,  setChgAwbForm]  = useState({ awbcode: "", airline_uq: "", date_invo: today() });
    const [chgAwbSaving, setChgAwbSaving] = useState(false);

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

    const { data: awbByDate = [], isFetching: loadingAwb, refetch: refetchAwb } = useQuery({
        queryKey: ["ie-awb-by-date", lddate],
        queryFn:  () => fetch(`/api/inventory-entry/awb-by-date?date=${lddate}`).then(r => r.json()).then(d => norm(Array.isArray(d) ? d : [])),
        staleTime: 0,
        enabled:  !!lddate,
    });

    const { data: packingXAwb = [], isFetching: loadingPacking, refetch: refetchPacking } = useQuery({
        queryKey: ["ie-packing-x-awb", lcawb, lddate],
        queryFn:  () => fetch(`/api/inventory-entry/packing-x-awb?awb=${encodeURIComponent(lcawb)}&date=${lddate}`).then(r => r.json()).then(d => norm(Array.isArray(d) ? d : [])),
        staleTime: 0,
    });

    const { data: boxesDetail = [], isFetching: loadingBoxes, refetch: refetchBoxes } = useQuery({
        queryKey: ["ie-boxes", lcawbcode],
        queryFn:  () => fetch(`/api/inventory-entry/packing-box-by-awb?awbcode=${encodeURIComponent(lcawbcode)}`).then(r => r.json()).then(d => norm(Array.isArray(d) ? d : [])),
        enabled:  !!lcawbcode,
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

    const { data: plDetails = [], isFetching: loadingPL } = useQuery({
        queryKey: ["ie-pldetails", lcpack_uq],
        queryFn:  () => fetch(`/api/inventory-entry/packings/${lcpack_uq}/details`).then(r => r.json()).then(d => norm(Array.isArray(d) ? d : [])),
        enabled:  !!lcpack_uq && activeTab === "plcontrol" && !!tabLoaded.plcontrol,
        staleTime: 0,
    });

    // PL Control tab: all packings for the current date
    const { data: plControlAll = [], isFetching: loadingPLC } = useQuery({
        queryKey: ["ie-plcontrol-all", lddate],
        queryFn:  () => fetch(`/api/inventory-entry/packing-x-awb?awb=%25&date=${lddate}`).then(r => r.json()).then(d => norm(Array.isArray(d) ? d : [])),
        enabled:  activeTab === "plcontrol" && !!tabLoaded.plcontrol,
        staleTime: 0,
    });

    const { data: adjustsOnly = [], isFetching: loadingAdj } = useQuery({
        queryKey: ["ie-adjusts", lcpk_box_uq],
        queryFn:  () => fetch(`/api/inventory-entry/warehouse?pk_box_uq=${lcpk_box_uq}`).then(r => r.json()).then(d => norm(d.adjusts ?? [])),
        enabled:  false,  // adjusts tab removed
        staleTime: 0,
    });

    const { data: awbSearchResults = [], isFetching: loadingSearch } = useQuery({
        queryKey: ["ie-awb-search", awbSearchQ, lddate],
        queryFn:  () => fetch(`/api/inventory-entry/awb-search?awb=${encodeURIComponent(awbSearchQ)}&date=${lddate}`).then(r => r.json()).then(d => norm(Array.isArray(d) ? d : [])),
        enabled:  !!awbSearchQ && activeTab === "awbsearch" && !!tabLoaded.awbsearch,
        staleTime: 0,
    });

    const { data: poSummary, isFetching: loadingPO } = useQuery({
        queryKey: ["ie-po-summary", ldship_date],
        queryFn:  () => fetch(`/api/inventory-entry/purchase-orders?ship_date=${ldship_date}`).then(r => r.json()),
        enabled:  activeTab === "polist" && !!tabLoaded.polist,
        staleTime: 0,
    });
    const poRows = useMemo(() => norm(poSummary?.summary ?? []), [poSummary]);

    const { data: poByGrower = [], isFetching: loadingPOG } = useQuery({
        queryKey: ["ie-po-grower", poGrower, ldship_date],
        queryFn:  () => fetch(`/api/inventory-entry/purchase-orders?ship_date=${ldship_date}&grower_uq=${poGrower}`).then(r => r.json()).then(d => norm(d.byGrower ?? [])),
        enabled:  !!poGrower,
        staleTime: 0,
    });

    const { data: awbDates = [], isFetching: loadingDates } = useQuery({
        queryKey: ["ie-awb-dates"],
        queryFn:  () => fetch("/api/inventory-entry/awb-dates").then(r => r.json()).then(d => norm(Array.isArray(d) ? d : [])),
        staleTime: 1000 * 60 * 5,
    });

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
    };

    const handleSelectAwb = (row: any) => {
        const code = t(row.AWBCODE);
        setLcawbcode(code);
        setLcawb(code);
        setLcpack_uq("");
        setLcpk_box_uq("");
        qc.invalidateQueries({ queryKey: ["ie-packing-x-awb"] });
        qc.invalidateQueries({ queryKey: ["ie-boxes"] });
    };

    const handleSelectPacking = (row: any) => {
        setLcpack_uq(t(row.PACK_UQ));
        setLcpk_box_uq("");
        qc.invalidateQueries({ queryKey: ["ie-boxes", t(row.AWBCODE ?? lcawbcode)] });
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
                setPackForm({
                    unico:          t(fill.unico),
                    grower_uq:      t(fill.grower_uq),
                    packing_no:     t(fill.packing_no),
                    invoice_date:   fill.date_invo ? new Date(fill.date_invo).toISOString().split("T")[0] : today(),
                    invoice_no:     t(fill.invoice_no),
                    awbcode:        t(fill.awbcode),
                    airline_uq:     t(fill.airline_uq ?? fill.pob_uq),
                    details:        t(fill.details),
                    porder_no:      parseInt(fill.porder_no ?? 0) || 0,
                    wphysical_uq:   t(fill.wphysical_uq),
                    available_date: fill.available_date ? new Date(fill.available_date).toISOString().split("T")[0] : today(),
                    inhouse:        Boolean(fill.inhouse),
                    consolidated:   Boolean(fill.consolidated),
                });
            } catch (e: any) { toast.error(e.message); return; }
        } else {
            if (!perms.canCreate) { toast.error("Not authorized."); return; }
            setPackForm({ ...EMPTY_PACKING, awbcode: lcawbcode });
        }
        setPackError(null);
        setModalPackingMode(mode);
        setModalPacking(true);
    };

    const handleSavePacking = async () => {
        if (!t(packForm.grower_uq)) { setPackError("Vendor is required."); return; }
        setPackSaving(true); setPackError(null);
        try {
            const payload = { ...packForm, user_uq: (session?.user as any)?.id || "" };
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
    const handleOpenBoxModal = async (mode: "add" | "edit") => {
        if (mode === "edit") {
            if (!lcpk_box_uq) { toast.error("Select a box first."); return; }
            if (!perms.canEdit) { toast.error("Not authorized."); return; }
            try {
                const r = await fetch(`/api/inventory-entry/boxes/${lcpk_box_uq}`);
                const d = await r.json();
                if (!d) { toast.error("Box not found."); return; }
                const fill: any = {};
                for (const [k, v] of Object.entries(d)) fill[k.toLowerCase()] = v;
                setBoxForm({
                    unico:             t(fill.unico),
                    product_uq:        t(fill.product_uq),
                    product_desc:      t(fill.description ?? fill.product_desc ?? ""),
                    case_uq:           t(fill.case_uq),
                    customer_uq:       t(fill.customer_uq),
                    cporder_no:        t(fill.cporder_no),
                    box_qty:           parseInt(fill.box_qty ?? 0) || 0,
                    up_x_case:         parseInt(fill.up_x_case ?? 0) || 0,
                    bunches_x_case:    parseInt(fill.bunches_x_case ?? 0) || 0,
                    units_x_bunch:     parseInt(fill.units_x_bunch ?? 0) || 0,
                    total_units:       parseInt(fill.total_units ?? 0) || 0,
                    lote:              parseInt(fill.lote ?? 0) || 0,
                    cut_point:         t(fill.cut_point),
                    price:             parseFloat(fill.price ?? 0) || 0,
                    t_price:           parseFloat(fill.t_price ?? 0) || 0,
                    f_cost_x_u:        parseFloat(fill.f_cost_x_u ?? 0) || 0,
                    f_cost:            parseFloat(fill.f_cost ?? 0) || 0,
                    c_cost_x_u:        parseFloat(fill.c_cost_x_u ?? 0) || 0,
                    t_cost:            parseFloat(fill.t_cost ?? 0) || 0,
                    freight_x_bx:      parseFloat(fill.freight_x_bx ?? 0) || 0,
                    duties_x_bx:       parseFloat(fill.duties_x_bx ?? 0) || 0,
                    broker_x_bx:       parseFloat(fill.broker_x_bx ?? 0) || 0,
                    handling_x_bx:     parseFloat(fill.handling_x_bx ?? 0) || 0,
                    ocharges_x_bx:     parseFloat(fill.ocharges_x_bx ?? 0) || 0,
                    t_charges:         parseFloat(fill.t_charges ?? 0) || 0,
                    confir_box:        Boolean(fill.confir_box),
                    sold_boxes:        Boolean(fill.sold_boxes),
                    remarks:           t(fill.remarks),
                    cust_product_code: t(fill.cust_prod_code ?? fill.cust_product_code),
                });
            } catch (e: any) { toast.error(e.message); return; }
        } else {
            if (!lcpack_uq) { toast.error("Select a packing first."); return; }
            if (!perms.canCreate) { toast.error("Not authorized."); return; }
            setBoxForm({ ...EMPTY_BOX });
        }
        setBoxError(null);
        setModalBoxMode(mode);
        setModalBox(true);
    };

    const setBoxField = (key: string, val: any) => setBoxForm((p: any) => calcBox({ ...p, [key]: val }));

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
        } catch (e: any) { toast.error(e.message); }
    };

    // ── Change AWB ────────────────────────────────────────────────────────────
    const handleSaveChangeAwb = async () => {
        if (!t(chgAwbForm.awbcode)) { toast.error("AWB code is required."); return; }
        setChgAwbSaving(true);
        try {
            const res = await fetch(`/api/inventory-entry/packings/${lcpack_uq}/change-awb`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...chgAwbForm, user_uq: (session?.user as any)?.id || "" }),
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

    // ── Shared row style ──────────────────────────────────────────────────────
    const rowStyle = (color: string) => {
        const c = t(color).toLowerCase();
        if (!c || c === "white" || c === "#ffffff") return {};
        return { backgroundColor: c.startsWith("#") ? c : undefined };
    };

    // ── Guards ────────────────────────────────────────────────────────────────
    if (status === "loading") return null;
    if (status === "unauthenticated") { router.push("/login"); return null; }

    const selPacking = (packingXAwb as any[]).find(r => t(r.PACK_UQ) === lcpack_uq);
    const selBox     = (boxesDetail as any[]).find(r => t(r.UNICO) === lcpk_box_uq);

    const fLabel = "text-[10px] font-black text-gray-500 uppercase tracking-wider";
    const fInput = "fos-input h-7 text-xs";

    return (
        <div className="flex flex-col min-h-screen lg:h-screen bg-[#f4f6f8] lg:overflow-hidden font-sans text-[#333]">

            {/* ── Page Header ── */}
            <div className="h-12 bg-[#374151] flex items-center justify-between px-4 shrink-0 text-white">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push("/menu")} className="hover:bg-white/10 p-1.5 rounded transition-colors">
                        <ArrowLeft size={18} />
                    </button>
                    <div className="flex items-center gap-2">
                        <Package size={16} className="text-[#FB7506]" />
                        <span className="font-black text-xs uppercase tracking-widest">Inventory Entry</span>
                    </div>
                </div>
                <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400">User:</span>
                        <span>{session?.user?.name || "OPERATOR"}</span>
                    </div>
                </div>
            </div>

            {/* ── Main Layout ── */}
            <div className="flex flex-col flex-1 gap-1 p-1 overflow-hidden">

                {/* ── Tab Container ── */}
                <div className="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex-1">

                    {/* ── Tab bar ── */}
                    <div className="h-10 bg-[#374151] flex items-end px-2 shrink-0 gap-0.5 overflow-x-auto no-scrollbar">
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
                                    "flex items-center gap-1.5 px-4 h-8 text-[10px] font-black uppercase tracking-wider rounded-t transition-all whitespace-nowrap shrink-0",
                                    activeTab === tab.key ? "bg-[#f4f6f8] text-[#FB7506] border-b-2 border-[#FB7506]" : "text-gray-400 hover:text-white hover:bg-white/10"
                                )}>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* ── Tab Content ── */}
                    <div className="flex-1 overflow-auto bg-[#f4f6f8] p-2 relative">

                    {/* ══ Tab 1: AWB's Packings ══ */}
                    {activeTab === "awbpackings" && (
                        <div className="flex flex-col gap-2 h-full">

                            {/* Row 1: Date Picker + AWB List */}
                            <div className="flex gap-2 shrink-0" style={{ height: "32%" }}>
                                {/* Date Picker */}
                                <div className="w-[30%] flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden shrink-0">
                                    <div className="h-10 bg-[#374151] flex items-center justify-between px-3 shrink-0">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={13} className="text-[#FB7506]" />
                                            <span className="font-black text-[10px] uppercase tracking-widest text-white">Date Picker</span>
                                        </div>
                                        {loadingDates && <RefreshCcw size={10} className="text-gray-400 animate-spin" />}
                                    </div>
                                    <div className="flex-1 overflow-y-auto">
                                        <table className="w-full text-[10px] leading-tight">
                                            <thead className="bg-gray-100 text-gray-700 font-bold sticky top-0 z-10">
                                                <tr>
                                                    {["G.Ship Date","AWBs","Pcs","Dly"].map(h => (
                                                        <th key={h} className="p-2 border-r border-gray-600/50 whitespace-nowrap">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
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
                                                            className={cn("cursor-pointer border-b border-gray-100 transition-colors", sel ? "!bg-blue-100 ring-2 ring-inset ring-blue-300" : dly > 0 ? "bg-red-50 hover:bg-red-100" : "odd:bg-white even:bg-gray-50 hover:bg-blue-50")}>
                                                            <td className={cn("p-2 border-r border-gray-100 font-mono whitespace-nowrap", sel ? "text-blue-700 font-bold" : dly > 0 ? "text-red-700" : "text-gray-700")}>{displayDate}</td>
                                                            <td className="p-2 border-r border-gray-100 text-right">{t(row.RECORDS ?? row.AWBS ?? row.AWB_COUNT ?? "")}</td>
                                                            <td className="p-2 border-r border-gray-100 text-right">{t(row.PIECES ?? "")}</td>
                                                            <td className={cn("p-2 text-right font-bold", dly > 0 ? "text-red-600" : "text-gray-300")}>{dly || ""}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* AWB List */}
                                <div className="flex-1 flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden min-w-0">
                                    <div className="h-10 bg-[#374151] flex items-center justify-between px-3 shrink-0">
                                        <div className="flex items-center gap-2">
                                            <Plane size={13} className="text-[#FB7506]" />
                                            <span className="font-black text-[10px] uppercase tracking-widest text-white">AWB List &mdash; {lddate}</span>
                                        </div>
                                        {loadingAwb && <RefreshCcw size={10} className="text-gray-400 animate-spin" />}
                                    </div>
                                    <div className="flex-1 overflow-auto">
                                        <table className="min-w-full text-xs text-left">
                                            <thead className="bg-gray-100 text-gray-700 font-bold sticky top-0 z-10">
                                                <tr>
                                                    {["AWB","Rec.","WHStatus","Pieces","FBoxes","Delayed","InWHouse"].map(h => (
                                                        <th key={h} className="p-2 border-r border-gray-600/50 whitespace-nowrap">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(awbByDate as any[]).length === 0 && !loadingAwb ? (
                                                    <tr><td colSpan={7} className="p-4 text-center text-gray-400 italic">No AWBs for this date</td></tr>
                                                ) : (awbByDate as any[]).map((row: any, i: number) => {
                                                    const code = t(row.AWBCODE);
                                                    const sel  = lcawbcode === code;
                                                    const dly  = Number(row.DELAYED ?? 0);
                                                    return (
                                                        <tr key={i} onClick={() => handleSelectAwb(row)}
                                                            className={cn("border-b cursor-pointer transition-colors", sel ? "!bg-blue-100 ring-2 ring-inset ring-blue-300" : "odd:bg-white even:bg-gray-50 hover:bg-blue-50")}>
                                                            <td className={cn("p-2 border-r border-gray-100 font-mono font-bold", sel ? "text-blue-700" : "")}>{code}</td>
                                                            <td className="p-2 border-r border-gray-100 text-right">{t(row.RECORDS)}</td>
                                                            <td className={cn("p-2 border-r border-gray-100 text-center font-bold text-[10px]", t(row.WHSTATUS) === "WH" ? "text-green-600" : t(row.WHSTATUS) === "CHECK" ? "text-blue-500" : "text-gray-500")}>{t(row.WHSTATUS)}</td>
                                                            <td className="p-2 border-r border-gray-100 text-right">{t(row.BOXES ?? row.PIECES ?? "")}</td>
                                                            <td className="p-2 border-r border-gray-100 text-right">{t(row.FULL_BOXES ?? "")}</td>
                                                            <td className={cn("p-2 border-r border-gray-100 text-right font-bold", dly > 0 ? "text-red-500" : "text-gray-300")}>{dly || ""}</td>
                                                            <td className="p-2 text-right">{t(row.QTY_TRANSFER ?? row.IN_WHOUSE ?? "")}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="px-3 py-1 border-t border-gray-200 bg-gray-50 shrink-0">
                                        <span className="text-[10px] font-bold text-gray-400">{(awbByDate as any[]).length} AWBs</span>
                                    </div>
                                </div>
                            </div>

                            {/* Toolbar 1 */}
                            <div className="shrink-0 flex items-center gap-1 bg-white rounded-lg border border-gray-200 shadow-sm px-2 py-1 overflow-x-auto">
                                {[
                                    { label: "AWB Cust. PO", icon: FileText },
                                    { label: "Label Laser", icon: FileText },
                                    { label: "Packing", icon: Package },
                                    { label: "Send to Whouse", icon: ArrowRight, active: true },
                                    { label: "COff", icon: FileText },
                                    { label: "PDF Label", icon: FileText },
                                    { label: "Z300", icon: FileText },
                                    { label: "Z 4M", icon: FileText },
                                    { label: "RPK", icon: FileText },
                                    { label: "Copy", icon: Copy },
                                ].map((btn, idx) => (
                                    <button key={idx} onClick={() => toast.info(`${btn.label} — coming soon.`)}
                                        className={cn(
                                            "flex items-center gap-1 px-2 py-1 text-[9px] font-bold rounded border whitespace-nowrap shrink-0 transition-colors",
                                            btn.active
                                                ? "bg-blue-700 text-white border-blue-800 hover:bg-blue-800"
                                                : "bg-gray-50 text-gray-700 border-gray-300 hover:bg-white"
                                        )}>
                                        {btn.icon && <btn.icon size={10} />}
                                        {btn.label}
                                    </button>
                                ))}
                            </div>

                            {/* Row 2: Vendors / Packings */}
                            <div className="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden shrink-0" style={{ height: "28%" }}>
                                <div className="h-10 bg-[#374151] flex items-center justify-between px-3 shrink-0">
                                    <div className="flex items-center gap-2">
                                        <Package size={13} className="text-[#FB7506]" />
                                        <span className="font-black text-[10px] uppercase tracking-widest text-white">Vendors{lcawbcode ? ` — ${lcawbcode}` : ""}</span>
                                        {loadingPacking && <RefreshCcw size={10} className="text-gray-400 animate-spin" />}
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400">{(packingXAwb as any[]).length} records</span>
                                </div>
                                <div className="flex-1 overflow-auto">
                                    <table className="min-w-full text-xs text-left whitespace-nowrap">
                                        <thead className="bg-gray-100 text-gray-700 font-bold sticky top-0 z-10">
                                            <tr>
                                                {["Vendor","FullBxs","Pieces","Delayed","T.Units","T.Cost","T.Charge","Invoice","Packing","PWHouse","WHStatus","Available","Status","Offer","COT","Received","Comments"].map(h => (
                                                    <th key={h} className="p-2 border-r border-gray-600/50 whitespace-nowrap">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(packingXAwb as any[]).length === 0 && !loadingPacking ? (
                                                <tr><td colSpan={17} className="p-4 text-center text-gray-400 italic">{lcawbcode ? "No packings for this AWB" : "Select an AWB"}</td></tr>
                                            ) : (packingXAwb as any[]).map((row: any, i: number) => {
                                                const uq   = t(row.PACK_UQ);
                                                const sel  = lcpack_uq === uq;
                                                const st   = t(row.STATUS ?? row.PSTATUS ?? "");
                                                const whst = t(row.WHSTATUS ?? "");
                                                const avail = t(row.AVAILABLE_DATE ?? row.AVAILABLE ?? "").substring(0, 10);
                                                return (
                                                    <tr key={i} onClick={() => handleSelectPacking(row)}
                                                        className={cn("border-b cursor-pointer transition-colors", sel ? "!bg-blue-100 ring-2 ring-inset ring-blue-300" : "odd:bg-white even:bg-gray-50 hover:bg-blue-50")}>
                                                        <td className={cn("p-2 border-r border-gray-100 font-semibold max-w-[120px] truncate", sel ? "text-blue-700" : "")}>{t(row.GROWER)}</td>
                                                        <td className="p-2 border-r border-gray-100 text-right font-mono">{t(row.TOTAL_BOXES ?? row.FULL_BOXES ?? "")}</td>
                                                        <td className="p-2 border-r border-gray-100 text-right">{t(row.TOTAL_PIECES)}</td>
                                                        <td className={cn("p-2 border-r border-gray-100 text-right font-bold", Number(row.DELAYED ?? 0) > 0 ? "text-red-500" : "text-gray-300")}>{t(row.DELAYED ?? "") || ""}</td>
                                                        <td className="p-2 border-r border-gray-100 text-right">{t(row.TOTAL_UNITS)}</td>
                                                        <td className="p-2 border-r border-gray-100 text-right font-mono">{fmt2(row.TOTAL_COST ?? row.FLOWER_COST ?? 0)}</td>
                                                        <td className="p-2 border-r border-gray-100 text-right font-mono">{fmt2(row.T_CHARGE ?? row.TOTAL_CHARGE ?? 0)}</td>
                                                        <td className="p-2 border-r border-gray-100 font-mono text-[10px]">{t(row.INVOICE_NO)}</td>
                                                        <td className="p-2 border-r border-gray-100 font-mono font-bold">{t(row.PACKING_NO)}</td>
                                                        <td className="p-2 border-r border-gray-100 text-[10px]">{t(row.WHOUSE ?? row.WPHYSICAL ?? row.PWHOUSE ?? row.WP_NAME ?? "")}</td>
                                                        <td className={cn("p-2 border-r border-gray-100 text-[10px] font-bold", whst === "WH" ? "text-green-600" : whst === "CHECK" ? "text-blue-500" : "text-gray-500")}>{whst}</td>
                                                        <td className="p-2 border-r border-gray-100 text-[10px]">{avail}</td>
                                                        <td className={cn("p-2 border-r border-gray-100 text-[10px] font-bold", st === "CLOSED" ? "text-red-500" : st === "OPEN" ? "text-green-600" : "text-gray-400")}>{st}</td>
                                                        <td className="p-2 border-r border-gray-100 text-[10px]">{t(row.OFFER ?? "")}</td>
                                                        <td className="p-2 border-r border-gray-100 text-[10px]">{t(row.CUTOFF ?? row.COT ?? "").substring(0, 10)}</td>
                                                        <td className="p-2 border-r border-gray-100 text-[10px]">{t(row.RECEIVED ?? "")}</td>
                                                        <td className="p-2 text-[10px] text-gray-500 max-w-[120px] truncate">{t(row.DETAILS ?? row.COMMENTS ?? "")}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Toolbar 2 */}
                            <div className="shrink-0 flex items-center gap-1 bg-white rounded-lg border border-gray-200 shadow-sm px-2 py-1 overflow-x-auto">
                                <span className="text-[10px] font-black text-[#FB7506] uppercase tracking-wide truncate max-w-[160px]">
                                    {selBox ? t(selBox.DESCRIPTION ?? selBox.PRODUCT ?? selBox.VARIETY ?? "") : selPacking ? t(selPacking.GROWER) : ""}
                                </span>
                                <div className="w-px h-3 bg-gray-300 mx-1" />
                                {[
                                    { label: "Transform Inventory", icon: ArrowRight, color: "green" },
                                    { label: "Change Prices", icon: Pencil, color: "gray" },
                                    { label: "RePacking", icon: Package, color: "orange" },
                                    { label: "WHControl", icon: Warehouse, color: "green" },
                                ].map((btn, idx) => (
                                    <button key={idx} onClick={() => toast.info(`${btn.label} — coming soon.`)}
                                        className="flex items-center gap-1 px-2 py-1 text-[9px] font-bold rounded border bg-gray-50 text-gray-700 border-gray-300 hover:bg-white whitespace-nowrap shrink-0 transition-colors">
                                        {btn.icon && <btn.icon size={10} />}
                                        {btn.label}
                                    </button>
                                ))}
                                <div className="w-px h-3 bg-gray-300 mx-1" />
                                <span className="text-[9px] font-bold text-gray-500">From Label:</span>
                                <input className="w-8 h-5 text-[9px] border border-gray-300 rounded px-1 bg-white" defaultValue="0" readOnly />
                                <span className="text-[9px] font-bold text-gray-500">To Label:</span>
                                <input className="w-8 h-5 text-[9px] border border-gray-300 rounded px-1 bg-white" defaultValue="0" readOnly />
                                <div className="w-px h-3 bg-gray-300 mx-1" />
                                {[
                                    { label: "Zebra by Lot", icon: FileText },
                                    { label: "Meto by Lot", icon: FileText },
                                    { label: "Selection", icon: FileText },
                                ].map((btn, idx) => (
                                    <button key={idx} onClick={() => toast.info(`${btn.label} — coming soon.`)}
                                        className="flex items-center gap-1 px-2 py-1 text-[9px] font-bold rounded border bg-gray-50 text-gray-700 border-gray-300 hover:bg-white whitespace-nowrap shrink-0 transition-colors">
                                        {btn.icon && <btn.icon size={10} />}
                                        {btn.label}
                                    </button>
                                ))}
                            </div>

                            {/* Row 3: Boxes Detail */}
                            <div className="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex-1 min-h-0">
                                <div className="h-10 bg-[#374151] flex items-center justify-between px-3 shrink-0">
                                    <div className="flex items-center gap-2">
                                        <Boxes size={13} className="text-[#FB7506]" />
                                        <span className="font-black text-[10px] uppercase tracking-widest text-white">
                                            Boxes Detail{selPacking ? ` — ${t(selPacking.GROWER)}` : ""}
                                        </span>
                                        {loadingBoxes && <RefreshCcw size={10} className="text-gray-400 animate-spin" />}
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400">
                                        {(boxesDetail as any[]).filter((r: any) => !lcpack_uq || t(r.PACK_UQ) === lcpack_uq).length} boxes
                                    </span>
                                </div>
                                <div className="flex-1 overflow-auto">
                                    <table className="min-w-full text-xs text-left whitespace-nowrap">
                                        <thead className="bg-gray-100 text-gray-700 font-bold sticky top-0 z-10">
                                            <tr>
                                                {["Dly","Rdy","Lot","Pcs","Stock","BxCase","UxBunch","T.Units","U.Price","Case","Description","Customer","BoxId","PB","Std.","C.POrder","C.Cost","T.Cost","S.U.Price","Days","FCost","CCost","TCost"].map(h => (
                                                    <th key={h} className="p-2 border-r border-gray-600/50 whitespace-nowrap">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {!lcawbcode ? (
                                                <tr><td colSpan={23} className="p-4 text-center text-gray-400 italic">Select an AWB to view boxes</td></tr>
                                            ) : (boxesDetail as any[]).filter((r: any) => !lcpack_uq || t(r.PACK_UQ) === lcpack_uq).length === 0 && !loadingBoxes ? (
                                                <tr><td colSpan={23} className="p-4 text-center text-gray-400 italic">No boxes</td></tr>
                                            ) : (boxesDetail as any[])
                                                .filter((r: any) => !lcpack_uq || t(r.PACK_UQ) === lcpack_uq)
                                                .map((row: any, i: number) => {
                                                    const uq   = t(row.UNICO);
                                                    const sel  = lcpk_box_uq === uq;
                                                    const desc = t(row.DESCRIPTION ?? row.PRODUCT ?? row.VARIETY ?? "");
                                                    const dly  = Number(row.DELAYED ?? 0);
                                                    const rdy  = Boolean(row.READY_TRAN) ? "OK" : "";
                                                    const stk  = Number(row.STOCK ?? row.WH_STOCK ?? 0);
                                                    return (
                                                        <tr key={i} onClick={() => handleSelectBox(row)}
                                                            className={cn("border-b cursor-pointer transition-colors", sel ? "!bg-blue-100 ring-2 ring-inset ring-blue-300" : "odd:bg-white even:bg-gray-50 hover:bg-blue-50")}
                                                            style={{ backgroundColor: colorFromInt(row.BACKCOLOR), color: colorFromInt(row.FORECOLOR) }}>
                                                            <td className={cn("p-2 border-r border-gray-100 text-center font-bold text-[10px]", dly > 0 ? "text-red-600" : "text-gray-300")}>{dly || ""}</td>
                                                            <td className={cn("p-2 border-r border-gray-100 text-[10px] font-bold", rdy ? "text-green-600" : "text-gray-300")}>{rdy}</td>
                                                            <td className="p-2 border-r border-gray-100 font-mono">{t(row.LOTE ?? row.BOXNUM ?? "")}</td>
                                                            <td className="p-2 border-r border-gray-100 text-right">{t(row.TOTAL_PIECES ?? row.PIECES ?? row.BOXNUM ?? "")}</td>
                                                            <td className={cn("p-2 border-r border-gray-100 text-right font-semibold", stk < 0 ? "text-red-500" : stk > 0 ? "text-green-600" : "text-gray-300")}>{stk || ""}</td>
                                                            <td className="p-2 border-r border-gray-100 text-right">{t(row.BOX_QTY ?? "")}</td>
                                                            <td className="p-2 border-r border-gray-100 text-right">{t(row.UP_X_PACK ?? row.UP_X_CASE ?? row.TUNITS_X_BOX ?? "")}</td>
                                                            <td className="p-2 border-r border-gray-100 text-right font-semibold">{t(row.TOTAL_UNITS)}</td>
                                                            <td className="p-2 border-r border-gray-100 text-right font-mono">{fmt4(row.PRICE_X_U ?? row.PRICE ?? row.U_PRICE ?? 0)}</td>
                                                            <td className="p-2 border-r border-gray-100 text-[10px]">{t(row.CASE_SH ?? row.CASE_NAME ?? row.CASE ?? "")}</td>
                                                            <td className={cn("p-2 border-r border-gray-100 font-semibold max-w-[150px] truncate", sel ? "text-blue-700" : "")} title={desc}>{desc}</td>
                                                            <td className="p-2 border-r border-gray-100 max-w-[60px] truncate text-[10px]">{t(row.CUSTOMER ?? "")}</td>
                                                            <td className="p-2 border-r border-gray-100 text-right text-[10px]">{t(row.BOXID ?? row.BOX_ID ?? "")}</td>
                                                            <td className="p-2 border-r border-gray-100 text-center text-[10px]">{Boolean(row.PB) ? "Y" : ""}</td>
                                                            <td className="p-2 border-r border-gray-100 text-center text-[10px]">{Boolean(row.STD) ? "Y" : ""}</td>
                                                            <td className="p-2 border-r border-gray-100 text-[10px]">{t(row.CPORDER_NO ?? row.SORDER_NO ?? "")}</td>
                                                            <td className="p-2 border-r border-gray-100 text-right font-mono">{fmt4(row.C_COST_X_U ?? 0)}</td>
                                                            <td className="p-2 border-r border-gray-100 text-right font-mono">{fmt2(row.TOTAL_COST ?? row.T_COST_X_U ?? row.T_COST ?? row.TCOST ?? 0)}</td>
                                                            <td className="p-2 border-r border-gray-100 text-right font-mono">{fmt4(row.SPRICE_X_UNIT ?? row.S_U_PRICE ?? row.PRICE ?? 0)}</td>
                                                            <td className={cn("p-2 border-r border-gray-100 text-right", Number(row.DAYS ?? 0) < 0 ? "text-red-500" : "text-gray-500")}>{t(row.DAYS ?? "")}</td>
                                                            <td className="p-2 border-r border-gray-100 text-right font-mono">{fmt2(row.F_FCOST_X_U ?? row.F_COST_X_U ?? row.FCOST ?? 0)}</td>
                                                            <td className="p-2 border-r border-gray-100 text-right font-mono">{fmt2(row.C_COST_X_U ?? row.CCOST ?? 0)}</td>
                                                            <td className="p-2 text-right font-mono font-bold">{fmt2(row.TOTAL_COST ?? row.T_COST_X_U ?? row.TCOST ?? row.T_COST ?? 0)}</td>
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
                        <div className="flex-1 flex items-center justify-center text-gray-300 text-sm font-bold uppercase tracking-widest">
                            Products List — coming soon
                        </div>
                    )}

                    {/* ══ Tab 3: PL Control ══ */}
                    {activeTab === "plcontrol" && (
                        <div className="flex flex-col gap-2 h-full">
                            <div className="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex-1 min-h-0">
                                <div className="bg-[#374151] px-3 py-1 flex items-center justify-between shrink-0">
                                    <span className="font-black text-[10px] text-gray-100 uppercase tracking-widest">Packing List Control — {lddate}</span>
                                    <div className="flex items-center gap-2">
                                        {loadingPLC && <RefreshCcw size={10} className="animate-spin text-gray-400" />}
                                        <span className="text-[9px] font-bold text-gray-400">{(plControlAll as any[]).length} pkgs</span>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-auto">
                                    <table className="min-w-full text-xs whitespace-nowrap">
                                        <thead className="bg-gray-100 border-b border-gray-200 sticky top-0 z-10">
                                            <tr>
                                                {["Ctrl","Grower","Airline","AWB","Date","Invoice","Packing","Pcs","Total$","Whouse","Details","St."].map(h => (
                                                    <th key={h} className="px-2 py-1 font-black text-[9px] text-gray-600 uppercase border-r border-gray-200 last:border-r-0">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(plControlAll as any[]).length === 0 ? (
                                                <tr><td colSpan={12} className="p-4 text-center text-gray-300 italic">No packings for this date</td></tr>
                                            ) : (plControlAll as any[]).map((row: any, i: number) => {
                                                const uq  = t(row.PACK_UQ);
                                                const sel = lcpack_uq === uq;
                                                const st  = t(row.STATUS ?? row.PSTATUS ?? "");
                                                return (
                                                    <tr key={i} onClick={() => handleSelectPacking(row)}
                                                        className={cn("cursor-pointer border-b border-gray-50 transition-colors", sel ? "bg-blue-100 font-semibold" : "hover:bg-gray-50")}>
                                                        <td className="px-2 py-0.5 border-r border-gray-100 text-[9px] font-bold text-orange-600">{t(row.GROWER_CONTROL ?? row.CTRL ?? "")}</td>
                                                        <td className={cn("px-2 py-0.5 border-r border-gray-100 font-semibold max-w-[100px] truncate", sel ? "text-blue-700" : "")}>{t(row.GROWER)}</td>
                                                        <td className="px-2 py-0.5 border-r border-gray-100 text-[9px]">{t(row.AIRLINE ?? row.AIRLINE_UQ ?? "")}</td>
                                                        <td className="px-2 py-0.5 border-r border-gray-100 font-mono text-[9px]">{t(row.AWBCODE)}</td>
                                                        <td className="px-2 py-0.5 border-r border-gray-100 text-[9px]">{t(row.BOX_DATE ?? row.DATE_INVO ?? "").substring(0, 10)}</td>
                                                        <td className="px-2 py-0.5 border-r border-gray-100">{t(row.INVOICE_NO)}</td>
                                                        <td className="px-2 py-0.5 border-r border-gray-100 font-mono font-bold">{t(row.PACKING_NO)}</td>
                                                        <td className="px-2 py-0.5 border-r border-gray-100 text-right">{t(row.TOTAL_PIECES)}</td>
                                                        <td className="px-2 py-0.5 border-r border-gray-100 text-right font-mono">{fmt2(row.TOTAL_INVOICE ?? row.TOTAL_COST ?? 0)}</td>
                                                        <td className="px-2 py-0.5 border-r border-gray-100 text-[9px]">{t(row.WHOUSE ?? row.WPHYSICAL ?? row.PWHOUSE ?? "")}</td>
                                                        <td className="px-2 py-0.5 border-r border-gray-100 text-[9px] text-gray-400 max-w-[100px] truncate">{t(row.DETAILS ?? row.COMMENTS ?? "")}</td>
                                                        <td className={cn("px-2 py-0.5 text-[9px] font-bold", st === "CLOSED" ? "text-red-500" : st === "OPEN" ? "text-green-600" : "text-gray-400")}>{st}</td>
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
                        <div className="flex flex-col gap-2 h-full">
                            <div className="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex-1 min-h-0">
                                <div className="bg-gray-50 border-b border-gray-200 px-2 py-1 shrink-0">
                                    <div className="flex items-center gap-2">
                                        <input type="text" value={awbSearchInput} onChange={e => setAwbSearchInput(e.target.value)}
                                            onKeyDown={e => e.key === "Enter" && setAwbSearchQ(awbSearchInput)}
                                            placeholder="AWB code or PO#..."
                                            className="flex-1 h-7 text-xs border border-gray-200 rounded px-2 outline-none focus:ring-1 focus:ring-[#FB7506]" />
                                        <button onClick={() => setAwbSearchQ(awbSearchInput)}
                                            className="flex items-center gap-1 h-7 px-3 bg-[#FB7506] hover:bg-orange-600 text-white rounded text-[10px] font-black uppercase tracking-wide transition-colors">
                                            <Search size={11} /> Search
                                        </button>
                                        {loadingSearch && <RefreshCcw size={13} className="animate-spin text-gray-400" />}
                                    </div>
                                </div>
                                <div className="flex-1 overflow-auto">
                                    <table className="min-w-full text-xs">
                                        <thead className="bg-gray-100 border-b border-gray-200 sticky top-0 z-10">
                                            <tr>
                                                {["Packing","Invoice","AWB","Date","Grower","Boxes","Units"].map(h => (
                                                    <th key={h} className="px-2 py-1 font-black text-[9px] text-gray-600 uppercase border-r border-gray-200 last:border-r-0 whitespace-nowrap">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {awbSearchResults.length === 0 ? (
                                                <tr><td colSpan={7} className="p-4 text-center text-gray-300 italic text-[10px]">{awbSearchQ ? "No results" : "Enter AWB to search"}</td></tr>
                                            ) : (awbSearchResults as any[]).map((row: any, i: number) => (
                                                <tr key={i} className="hover:bg-gray-50 cursor-pointer border-b border-gray-50" onClick={() => handleSelectPacking(row)}>
                                                    <td className="px-2 py-1 border-r border-gray-100 font-mono">{t(row.PACKING_NO)}</td>
                                                    <td className="px-2 py-1 border-r border-gray-100">{t(row.INVOICE_NO)}</td>
                                                    <td className="px-2 py-1 border-r border-gray-100 font-mono">{t(row.AWBCODE)}</td>
                                                    <td className="px-2 py-1 border-r border-gray-100">{t(row.BOX_DATE ?? "").substring(0, 10)}</td>
                                                    <td className="px-2 py-1 border-r border-gray-100 font-semibold max-w-[120px] truncate">{t(row.GROWER)}</td>
                                                    <td className="px-2 py-1 border-r border-gray-100 text-right">{t(row.TOTAL_BOXES)}</td>
                                                    <td className="px-2 py-1 text-right">{t(row.TOTAL_UNITS)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ══ Tab 5: PO List ══ */}
                    {activeTab === "polist" && (
                        <div className="flex flex-col gap-2 h-full">
                            <div className="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex-1 min-h-0">
                                <div className="bg-gray-50 border-b border-gray-200 px-2 py-1 shrink-0 flex items-center gap-2">
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Ship Date</span>
                                    <input type="date" value={ldship_date} onChange={e => { setLdship_date(e.target.value); setPoGrower(""); }}
                                        className="h-7 text-xs border border-gray-200 rounded px-1.5 outline-none focus:ring-1 focus:ring-[#FB7506]" />
                                    {(loadingPO || loadingPOG) && <RefreshCcw size={12} className="animate-spin text-gray-400" />}
                                    {poGrower && (
                                        <button onClick={() => setPoGrower("")} className="text-[10px] text-[#FB7506] hover:text-orange-700 font-black">
                                            &larr; Back to Summary
                                        </button>
                                    )}
                                </div>
                                <div className="flex-1 overflow-auto">
                                    {!poGrower ? (
                                        <table className="min-w-full text-xs">
                                            <thead className="bg-gray-100 border-b border-gray-200 sticky top-0 z-10">
                                                <tr>
                                                    {["Grower","Ship Date","POrders","Shipped","Arrived","Amount"].map(h => (
                                                        <th key={h} className="px-2 py-1 font-black text-[9px] text-gray-600 uppercase border-r border-gray-200 last:border-r-0 whitespace-nowrap">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {poRows.length === 0 ? (
                                                    <tr><td colSpan={6} className="p-4 text-center text-gray-300 italic">No purchase orders for this date</td></tr>
                                                ) : (poRows as any[]).map((row: any, i: number) => (
                                                    <tr key={i} onClick={() => setPoGrower(t(row.GROWER_UQ))}
                                                        className="cursor-pointer hover:bg-gray-50 border-b border-gray-50">
                                                        <td className="px-2 py-1 border-r border-gray-100 font-semibold max-w-[120px] truncate">{t(row.GROWER)}</td>
                                                        <td className="px-2 py-1 border-r border-gray-100">{t(row.SHIP_DATE ?? "").substring(0, 10)}</td>
                                                        <td className="px-2 py-1 border-r border-gray-100 text-right">{t(row.QTY_PORDER)}</td>
                                                        <td className="px-2 py-1 border-r border-gray-100 text-right">{t(row.QTY_SHIP)}</td>
                                                        <td className="px-2 py-1 border-r border-gray-100 text-right">{t(row.QTY_ARRIVED)}</td>
                                                        <td className="px-2 py-1 text-right font-mono">{fmt2(row.EXT_PRICE)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <table className="min-w-full text-xs whitespace-nowrap">
                                            <thead className="bg-gray-100 border-b border-gray-200 sticky top-0 z-10">
                                                <tr>
                                                    {["Farm","P.Order","S.Order","Customer","Case","Description","T.Units","Ordered","Confirm","Diff","Ship"].map(h => (
                                                        <th key={h} className="px-2 py-1 font-black text-[9px] text-gray-600 uppercase border-r border-gray-200 last:border-r-0">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loadingPOG ? (
                                                    <tr><td colSpan={11} className="p-4 text-center"><RefreshCcw size={14} className="animate-spin mx-auto text-gray-400" /></td></tr>
                                                ) : (poByGrower as any[]).length === 0 ? (
                                                    <tr><td colSpan={11} className="p-3 text-center text-gray-300 italic">No orders</td></tr>
                                                ) : (poByGrower as any[]).map((row: any, i: number) => (
                                                    <tr key={i} className="hover:bg-gray-50 border-b border-gray-50">
                                                        <td className="px-2 py-0.5 border-r border-gray-100 text-[9px] font-bold text-gray-500">{t(row.FARM ?? row.GROWER ?? "")}</td>
                                                        <td className="px-2 py-0.5 border-r border-gray-100 font-mono font-bold">{t(row.PORDER_NO)}</td>
                                                        <td className="px-2 py-0.5 border-r border-gray-100 font-mono text-gray-500">{t(row.SORDER_NO ?? "")}</td>
                                                        <td className="px-2 py-0.5 border-r border-gray-100 max-w-[100px] truncate">{t(row.CUSTOMER ?? "")}</td>
                                                        <td className="px-2 py-0.5 border-r border-gray-100 text-[9px]">{t(row.CASE_NAME ?? row.PACK ?? "")}</td>
                                                        <td className="px-2 py-0.5 border-r border-gray-100 font-semibold max-w-[160px] truncate">{t(row.DESCRIPTION ?? row.VARIETY ?? "")}</td>
                                                        <td className="px-2 py-0.5 border-r border-gray-100 text-right">{t(row.TOTAL_UNITS ?? "")}</td>
                                                        <td className="px-2 py-0.5 border-r border-gray-100 text-right font-semibold">{t(row.QTY_PORDER ?? "")}</td>
                                                        <td className="px-2 py-0.5 border-r border-gray-100 text-right text-green-600">{t(row.QTY_CONFIRM ?? "")}</td>
                                                        <td className="px-2 py-0.5 border-r border-gray-100 text-right text-orange-500">{t(row.QTY_DIFF ?? "")}</td>
                                                        <td className="px-2 py-0.5 text-right text-blue-600 font-semibold">{t(row.QTY_SHIP ?? "")}</td>
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
                                <div className="flex flex-col gap-0.5 items-start">
                                    <label className={fLabel}>Inhouse</label>
                                    <input type="checkbox" checked={Boolean(packForm.inhouse)} onChange={e => setPackForm((p: any) => ({ ...p, inhouse: e.target.checked }))} className="w-5 h-5 mt-1 accent-[#FB7506]" />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <label className={fLabel}>Packing No.</label>
                                    <input value={t(packForm.packing_no)} onChange={e => setPackForm((p: any) => ({ ...p, packing_no: e.target.value }))} className={fInput} />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <label className={fLabel}>AWB Code</label>
                                    <input value={t(packForm.awbcode)} onChange={e => setPackForm((p: any) => ({ ...p, awbcode: e.target.value }))} className={fInput} />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <label className={fLabel}>Airline</label>
                                    <select value={t(packForm.airline_uq)} onChange={e => setPackForm((p: any) => ({ ...p, airline_uq: e.target.value }))} className={fInput}>
                                        <option value="">-- None --</option>
                                        {airlines.map((a: any) => (
                                            <option key={t(a.UNICO)} value={t(a.UNICO)}>{t(a.AIRLINE ?? a.DESCRIPTION ?? a.UNICO)}</option>
                                        ))}
                                    </select>
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
                                <div className="sm:col-span-2 flex flex-col gap-0.5">
                                    <label className={fLabel}>Product *</label>
                                    <div className="flex gap-1">
                                        <input value={t(boxForm.product_desc || boxForm.product_uq)} readOnly
                                            className={fInput + " flex-1 bg-gray-50 cursor-not-allowed"} placeholder="Select product..." />
                                        <input value={t(boxForm.product_uq)} onChange={e => setBoxField("product_uq", e.target.value)}
                                            className={fInput + " w-20 font-mono"} placeholder="UQ" />
                                    </div>
                                </div>
                                {/* C.POrder */}
                                <div className="flex flex-col gap-0.5">
                                    <label className={fLabel}>C.POrder #</label>
                                    <input value={t(boxForm.cporder_no)} onChange={e => setBoxField("cporder_no", e.target.value)} className={fInput} />
                                </div>
                                {/* Box Qty */}
                                <div className="flex flex-col gap-0.5">
                                    <label className={fLabel}>Box Qty *</label>
                                    <input type="number" value={boxForm.box_qty} onChange={e => setBoxField("box_qty", parseInt(e.target.value) || 0)} className={fInput + " text-right font-bold"} />
                                </div>
                                {/* Units x case */}
                                <div className="flex flex-col gap-0.5">
                                    <label className={fLabel}>Units x Case</label>
                                    <input type="number" value={boxForm.up_x_case} onChange={e => setBoxField("up_x_case", parseInt(e.target.value) || 0)} className={fInput + " text-right"} />
                                </div>
                                {/* Bunches x case */}
                                <div className="flex flex-col gap-0.5">
                                    <label className={fLabel}>Bunches x Case</label>
                                    <input type="number" value={boxForm.bunches_x_case} onChange={e => setBoxField("bunches_x_case", parseInt(e.target.value) || 0)} className={fInput + " text-right"} />
                                </div>
                                {/* Stems x Bunch */}
                                <div className="flex flex-col gap-0.5">
                                    <label className={fLabel}>Stems x Bunch</label>
                                    <input type="number" value={boxForm.units_x_bunch} onChange={e => setBoxField("units_x_bunch", parseInt(e.target.value) || 0)} className={fInput + " text-right"} />
                                </div>
                                {/* Total Units (readonly) */}
                                <div className="flex flex-col gap-0.5">
                                    <label className={fLabel}>Total Units</label>
                                    <input readOnly value={boxForm.total_units} className={fInput + " text-right bg-gray-50 font-bold text-green-700"} />
                                </div>
                                {/* Lote */}
                                <div className="flex flex-col gap-0.5">
                                    <label className={fLabel}>Lote</label>
                                    <input type="number" value={boxForm.lote} onChange={e => setBoxField("lote", parseInt(e.target.value) || 0)} className={fInput + " text-right"} />
                                </div>
                                {/* Cut point */}
                                <div className="flex flex-col gap-0.5">
                                    <label className={fLabel}>Cut Point</label>
                                    <input value={t(boxForm.cut_point)} onChange={e => setBoxField("cut_point", e.target.value)} className={fInput} />
                                </div>
                            </div>

                            {/* Price fields */}
                            <div className="border-t border-gray-100 pt-2">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Pricing</p>
                                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-x-3 gap-y-2 text-xs">
                                    <div className="flex flex-col gap-0.5">
                                        <label className={fLabel}>Price / Stem</label>
                                        <input type="number" step="0.0001" value={boxForm.price} onChange={e => setBoxField("price", parseFloat(e.target.value) || 0)} className={fInput + " text-right"} />
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
                                        <label className={fLabel}>F. Cost</label>
                                        <input readOnly value={fmt2(boxForm.f_cost)} className={fInput + " text-right bg-gray-50"} />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <label className={fLabel}>C Cost x U.</label>
                                        <input type="number" step="0.0001" value={boxForm.c_cost_x_u} onChange={e => setBoxField("c_cost_x_u", parseFloat(e.target.value) || 0)} className={fInput + " text-right"} />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <label className={fLabel}>T. Cost</label>
                                        <input readOnly value={fmt2(boxForm.t_cost)} className={fInput + " text-right bg-gray-50"} />
                                    </div>
                                </div>
                            </div>

                            {/* Charges */}
                            <div className="border-t border-gray-100 pt-2">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Charges per Box</p>
                                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-x-3 gap-y-2 text-xs">
                                    {[
                                        { key: "freight_x_bx",  label: "Freight x Bx" },
                                        { key: "duties_x_bx",   label: "Duties x Bx" },
                                        { key: "broker_x_bx",   label: "Broker x Bx" },
                                        { key: "handling_x_bx", label: "Handling x Bx" },
                                        { key: "ocharges_x_bx", label: "Other x Bx" },
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
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-2 text-xs">
                                    <div className="sm:col-span-2 flex flex-col gap-0.5">
                                        <label className={fLabel}>Inventory Remarks</label>
                                        <textarea value={t(boxForm.remarks)} onChange={e => setBoxField("remarks", e.target.value)}
                                            rows={2} className="fos-input text-xs resize-none py-1" />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <label className={fLabel}>Cust. Product Code</label>
                                        <input value={t(boxForm.cust_product_code)} onChange={e => setBoxField("cust_product_code", e.target.value)} className={fInput} />
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 mt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={Boolean(boxForm.confir_box)} onChange={e => setBoxField("confir_box", e.target.checked)} className="w-4 h-4 accent-[#FB7506]" />
                                        <span className="text-xs font-semibold text-gray-700">Confirmed Box</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={Boolean(boxForm.sold_boxes)} onChange={e => setBoxField("sold_boxes", e.target.checked)} className="w-4 h-4 accent-[#FB7506]" />
                                        <span className="text-xs font-semibold text-gray-700">Sold Boxes</span>
                                    </label>
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
                                <label className={fLabel}>New AWB Code *</label>
                                <input value={chgAwbForm.awbcode} onChange={e => setChgAwbForm(p => ({ ...p, awbcode: e.target.value }))} className={fInput} />
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <label className={fLabel}>Airline</label>
                                <select value={chgAwbForm.airline_uq} onChange={e => setChgAwbForm(p => ({ ...p, airline_uq: e.target.value }))} className={fInput}>
                                    <option value="">-- None --</option>
                                    {airlines.map((a: any) => (
                                        <option key={t(a.UNICO)} value={t(a.UNICO)}>{t(a.AIRLINE ?? a.DESCRIPTION ?? a.UNICO)}</option>
                                    ))}
                                </select>
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
        </div>
    );
}
