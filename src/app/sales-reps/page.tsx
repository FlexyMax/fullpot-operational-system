"use client";

import { useState, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Users, RefreshCcw, Plus, Pencil, Trash2,
    Search, X, Save, ChevronRight, ChevronLeft,
    FileText, AlertCircle, Check,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { GridMenu } from "@/components/GridMenu";
import PanelGrid from "@/components/ui/PanelGrid";
import { PanelGridTable, PanelGridThead, PanelGridTh, PanelGridTbody, PanelGridTr, PanelGridTd } from "@/components/ui/PanelGridTable";
import { usePagePermissions } from "@/lib/permissions";
import { useAuditLog } from "@/lib/audit";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const t = (v: any) => String(v ?? "").trim();
const norm = (rows: any[]) => rows.map(r => {
    const n: any = {};
    for (const [k, v] of Object.entries(r)) n[k.toUpperCase()] = v;
    return n;
});
const fmt = (v: any) => parseFloat(v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (v: any) => {
    if (!v) return "";
    const d = new Date(v);
    return isNaN(d.getTime()) ? t(v) : d.toLocaleDateString("en-US");
};

// ─── Empty form ───────────────────────────────────────────────────────────────
const EMPTY_FORM: any = {
    unico: "", first_name: "", last_name: "", address: "", phone_1: "", phone_2: "",
    email_1: "", email_2: "", old_code: "", active: true, remote: false,
    superior_uq: "", user_uq: "", wphysical_uq: "",
    // Buyer Setup
    view_days: false, view_hold: false, view_lot: false, view_grower: false,
    move_hold: false, view_all_inv: false,
    commi_osales: 0, due_days: 0, autho_over: 0, commi_gsales: 0, lot_fifo_lifo: 0,
    // Permissions
    change_prices: false, view_flowercost: false, po_unreception: false,
    price_override: false, change_product: false, whouse_control: false,
    edit_all_inv: false, credit_override: false, view_all_customers: false,
    view_price_wo_fuel: false, autorize_transfer: false, cls_spcarriers: false,
    web: false, delete_lines: false, open_packing: false, limited_po: false,
    view_quotas: false, loc_autotran: false, open_invoice: false,
    print_customers: false, print_all_customers: false, view_pb_recipe: false,
    approve_override: false, make_payment: false, lock_production: false,
    view_qty_in: false, update_stock_invoice: false, pti_take_om: false,
    view_om: false, inventory_from_po: false, po_change_date: false,
    open_prebook: false, season_poprice: false, view_reports: false,
    reports_all_salesmen: false, invoice_add_charges: false, invoice_scan_sale: false,
    credit_all_inv: false, accept_returns: false, view_whouse: false,
    make_discounts: false, view_sales_price: false, prebook_check_stock: false,
    supervisor: false,
};

// Permission checkboxes in VFP 5-column order with exact VFP labels
const PERM_LABELS: [string, string][] = [
    ["view_days",            "View Days"],
    ["view_hold",            "View Hold"],
    ["change_prices",        "Change Inventory Prices"],
    ["view_flowercost",      "View Flower Cost"],
    ["lock_production",      "Lock Production"],
    ["view_lot",             "View Lot"],
    ["move_hold",            "Move Hold"],
    ["remote",               "Remote"],
    ["po_unreception",       "Unreceive PO"],
    ["view_qty_in",          "View Qty In"],
    ["view_grower",          "View Vendor"],
    ["price_override",       "Request Price Override"],
    ["change_product",       "Update Products"],
    ["whouse_control",       "WHouse Control"],
    ["update_stock_invoice", "Update Stock From Invoices"],
    ["credit_all_inv",       "CR All Invoices"],
    ["credit_override",      "Request Credit Override"],
    ["open_invoice",         "Open Invoices"],
    ["pti_take_om",          "Take OM in Invoices"],
    ["view_all_inv",         "View All Invoices"],
    ["view_all_customers",   "View All Customers"],
    ["autorize_transfer",    "Transfer Inventory"],
    ["open_packing",         "Open Packing"],
    ["inventory_from_po",    "Inventory From PO"],
    ["print_customers",      "Print Customers"],
    ["print_all_customers",  "Print All Customers"],
    ["view_price_wo_fuel",   "View Price W. Fuel"],
    ["view_pb_recipe",       "View PB Recipe"],
    ["edit_all_inv",         "Edit All Invoices"],
    ["view_reports",         "View Reports"],
    ["reports_all_salesmen", "Reports All Salesmen"],
    ["invoice_add_charges",  "Add Charges"],
    ["invoice_scan_sale",    "Scan to Sale"],
    ["limited_po",           "Limited PO"],
    ["view_quotas",          "View Quotas"],
    ["loc_autotran",         "Local Auto Transfer"],
    ["open_prebook",         "Open Prebook"],
    ["season_poprice",       "Season PO Price"],
    ["po_change_date",       "PO Change Date"],
    ["view_om",              "View OM"],
    ["accept_returns",       "Accept Returns"],
    ["view_whouse",          "View Warehouse"],
    ["make_discounts",       "Make Discounts"],
    ["view_sales_price",     "View Sales Price"],
    ["prebook_check_stock",  "Prebook Check Stock"],
    ["supervisor",           "Supervisor"],
    ["web",                  "Web Access"],
    ["delete_lines",         "Delete Lines"],
    ["cls_spcarriers",       "Close Sp. Carriers"],
    ["approve_override",     "Approve Override"],
    ["make_payment",         "Make Payment"],
];

type ActiveTab = "customers" | "product-classes" | "vendors" | "warehouses" | "cities" | "salesmen";

// ─── DualPanel component ──────────────────────────────────────────────────────
function DualPanel({
    assignedRows, availableRows, assignedCols, availableCols,
    onAdd, onRemove, loading, assignedKey, availableKey,
}: {
    assignedRows:   any[];
    availableRows:  any[];
    assignedCols:   { key: string; label: string }[];
    availableCols:  { key: string; label: string }[];
    onAdd:          (row: any) => Promise<void>;
    onRemove:       (row: any) => Promise<void>;
    loading:        boolean;
    assignedKey:    string;
    availableKey:   string;
}) {
    const [selAssigned,  setSelAssigned]  = useState<string | null>(null);
    const [selAvailable, setSelAvailable] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const handleAdd = async () => {
        const row = availableRows.find(r => t(r[availableKey]) === selAvailable);
        if (!row) return;
        setBusy(true);
        try { await onAdd(row); setSelAvailable(null); }
        finally { setBusy(false); }
    };

    const handleRemove = async () => {
        const row = assignedRows.find(r => t(r[assignedKey]) === selAssigned);
        if (!row) return;
        setBusy(true);
        try { await onRemove(row); setSelAssigned(null); }
        finally { setBusy(false); }
    };

    return (
        <div className="flex flex-col md:flex-row gap-2 h-full min-h-0">
            {/* Assigned */}
            <div className="flex-1 flex flex-col min-h-0 min-w-0 md:min-h-0" style={{ minHeight: "200px" }}>
                <div className="bg-gray-100 border-b border-gray-200 px-2 py-1">
                    <span className="font-black text-[10px] text-gray-600 uppercase tracking-wide">Assigned ({assignedRows.length})</span>
                </div>
                <div className="flex-1 overflow-auto">
                    <table className="min-w-full text-left">
                        <thead className="bg-gray-100 border-b border-gray-200 sticky top-0 z-10">
                            <tr>
                                {assignedCols.map(c => (
                                    <th key={c.key} className="px-2 py-1.5 font-black text-[10px] text-gray-600 uppercase tracking-wide whitespace-nowrap border-r border-gray-200 last:border-r-0">
                                        {c.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={assignedCols.length} className="p-4 text-center"><RefreshCcw size={14} className="animate-spin mx-auto text-gray-400" /></td></tr>
                            ) : assignedRows.length === 0 ? (
                                <tr><td colSpan={assignedCols.length} className="p-4 text-center text-gray-300 text-xs italic">None assigned</td></tr>
                            ) : assignedRows.map((row, i) => {
                                const rowKey = t(row[assignedKey]);
                                const selected = selAssigned === rowKey;
                                return (
                                    <tr key={i} onClick={() => setSelAssigned(selected ? null : rowKey)}
                                        className={cn("cursor-pointer text-xs transition-colors", selected ? "!bg-blue-50 ring-1 ring-inset ring-blue-200" : "hover:bg-gray-50")}>
                                        {assignedCols.map(c => (
                                            <td key={c.key} className="px-2 py-1.5 border-r border-gray-50 last:border-r-0 truncate max-w-[160px]">{t(row[c.key.toUpperCase()] ?? row[c.key])}</td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Buttons */}
            <div className="flex md:flex-col flex-row items-center justify-center gap-2 shrink-0 px-1 py-1 md:py-0">
                <button onClick={handleAdd} disabled={!selAvailable || busy}
                    className="flex items-center gap-1 px-2 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white rounded text-[10px] font-black uppercase tracking-wide transition-colors">
                    <ChevronLeft size={12} className="hidden md:block" /><ChevronLeft size={12} className="hidden md:block" />
                    <span className="md:hidden"><ChevronLeft size={12} /></span>
                    Add
                </button>
                <button onClick={handleRemove} disabled={!selAssigned || busy}
                    className="flex items-center gap-1 px-2 py-1.5 bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white rounded text-[10px] font-black uppercase tracking-wide transition-colors">
                    Remove
                    <ChevronRight size={12} className="hidden md:block" /><ChevronRight size={12} className="hidden md:block" />
                    <span className="md:hidden"><ChevronRight size={12} /></span>
                </button>
            </div>

            {/* Available */}
            <div className="flex-1 flex flex-col min-h-0 min-w-0" style={{ minHeight: "200px" }}>
                <div className="bg-gray-100 border-b border-gray-200 px-2 py-1">
                    <span className="font-black text-[10px] text-gray-600 uppercase tracking-wide">Available ({availableRows.length})</span>
                </div>
                <div className="flex-1 overflow-auto">
                    <table className="min-w-full text-left">
                        <thead className="bg-gray-100 border-b border-gray-200 sticky top-0 z-10">
                            <tr>
                                {availableCols.map(c => (
                                    <th key={c.key} className="px-2 py-1.5 font-black text-[10px] text-gray-600 uppercase tracking-wide whitespace-nowrap border-r border-gray-200 last:border-r-0">
                                        {c.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={availableCols.length} className="p-4 text-center"><RefreshCcw size={14} className="animate-spin mx-auto text-gray-400" /></td></tr>
                            ) : availableRows.length === 0 ? (
                                <tr><td colSpan={availableCols.length} className="p-4 text-center text-gray-300 text-xs italic">None available</td></tr>
                            ) : availableRows.map((row, i) => {
                                const rowKey = t(row[availableKey]);
                                const selected = selAvailable === rowKey;
                                return (
                                    <tr key={i} onClick={() => setSelAvailable(selected ? null : rowKey)}
                                        className={cn("cursor-pointer text-xs transition-colors", selected ? "!bg-blue-50 ring-1 ring-inset ring-blue-200" : "hover:bg-gray-50")}>
                                        {availableCols.map(c => (
                                            <td key={c.key} className="px-2 py-1.5 border-r border-gray-50 last:border-r-0 truncate max-w-[160px]">{t(row[c.key.toUpperCase()] ?? row[c.key])}</td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function SalesRepsPage() {
    const { status } = useSession();
    const router   = useRouter();
    const qc       = useQueryClient();
    const perms    = usePagePermissions("sales-reps");
    const { logAction } = useAuditLog("sales-reps", "flower_salesmen");

    // ── State ─────────────────────────────────────────────────────────────────
    const [search,       setSearch]       = useState("");
    const [selectedUq,   setSelectedUq]   = useState<string | null>(null);
    const [activeTab,    setActiveTab]    = useState<ActiveTab>("customers");
    const [tabLoaded,    setTabLoaded]    = useState<Partial<Record<ActiveTab, boolean>>>({});
    const [mobilePanel,  setMobilePanel]  = useState<"list" | "detail">("list");

    // Modal state
    const [modalOpen,    setModalOpen]    = useState(false);
    const [modalMode,    setModalMode]    = useState<"add" | "edit">("add");
    const [modalTab,     setModalTab]     = useState<"setup" | "buyer" | "others">("setup");
    const [form,         setForm]         = useState<any>(EMPTY_FORM);
    const [saving,       setSaving]       = useState(false);
    const [formError,    setFormError]    = useState<string | null>(null);

    // Customer reassign modal
    const [custModal,    setCustModal]    = useState(false);
    const [custSearch,   setCustSearch]   = useState("");
    const [selCustUq,    setSelCustUq]    = useState<string | null>(null);
    const [newSalesUq,   setNewSalesUq]   = useState<string | null>(null);
    const [custSaving,   setCustSaving]   = useState(false);

    // ── Queries ───────────────────────────────────────────────────────────────
    const { data: salesRepsList = [], isFetching: loadingList, refetch: refetchList } = useQuery({
        queryKey: ["sales-reps-list"],
        queryFn:  () => fetch("/api/sales-reps").then(r => r.json()).then(d => norm(Array.isArray(d) ? d : [])),
        staleTime: 0,
    });

    const { data: physicalWarehouses = [] } = useQuery({
        queryKey: ["sr-physical-warehouses"],
        queryFn:  () => fetch("/api/sales-reps/physical-warehouses").then(r => r.json()).then(d => norm(Array.isArray(d) ? d : [])),
        staleTime: 1000 * 60 * 10,
    });

    const { data: systemUsers = [] } = useQuery({
        queryKey: ["sr-system-users"],
        queryFn:  () => fetch("/api/sales-reps/system-users").then(r => r.json()).then(d => norm(Array.isArray(d) ? d : [])),
        staleTime: 1000 * 60 * 10,
    });

    // Tab 1 — Customers
    const { data: customers = [], isFetching: loadingCustomers, refetch: refetchCustomers } = useQuery({
        queryKey: ["sr-customers", selectedUq],
        queryFn:  () => fetch(`/api/sales-reps/customers?salesman_uq=${selectedUq}`).then(r => r.json()).then(d => norm(Array.isArray(d) ? d : [])),
        enabled:  !!selectedUq && activeTab === "customers" && !!tabLoaded["customers"],
        staleTime: 0,
    });

    // Salesman search (for customer reassign modal and new salesman select)
    const { data: salesmanSearch = [] } = useQuery({
        queryKey: ["sr-salesman-search"],
        queryFn:  () => fetch("/api/sales-reps/search?search=%").then(r => r.json()).then(d => norm(Array.isArray(d) ? d : [])),
        staleTime: 1000 * 60 * 5,
    });

    // Tab 2 — Product Classes
    const { data: assignedClasses = [], isFetching: loadingClassesA, refetch: refetchClassesA } = useQuery({
        queryKey: ["sr-classes-assigned", selectedUq],
        queryFn:  () => fetch(`/api/sales-reps/product-classes?salesman_uq=${selectedUq}`).then(r => r.json()).then(d => norm(Array.isArray(d) ? d : [])),
        enabled:  !!selectedUq && activeTab === "product-classes" && !!tabLoaded["product-classes"],
        staleTime: 0,
    });
    const { data: availableClasses = [], isFetching: loadingClassesB, refetch: refetchClassesB } = useQuery({
        queryKey: ["sr-classes-available", selectedUq],
        queryFn:  () => fetch(`/api/sales-reps/product-classes?salesman_uq=${selectedUq}&not_in=1`).then(r => r.json()).then(d => norm(Array.isArray(d) ? d : [])),
        enabled:  !!selectedUq && activeTab === "product-classes" && !!tabLoaded["product-classes"],
        staleTime: 0,
    });

    // Tab 3 — Vendors
    const { data: assignedVendors = [], isFetching: loadingVendorsA, refetch: refetchVendorsA } = useQuery({
        queryKey: ["sr-vendors-assigned", selectedUq],
        queryFn:  () => fetch(`/api/sales-reps/vendors?salesman_uq=${selectedUq}`).then(r => r.json()).then(d => norm(Array.isArray(d) ? d : [])),
        enabled:  !!selectedUq && activeTab === "vendors" && !!tabLoaded["vendors"],
        staleTime: 0,
    });
    const { data: availableVendors = [], isFetching: loadingVendorsB, refetch: refetchVendorsB } = useQuery({
        queryKey: ["sr-vendors-available", selectedUq],
        queryFn:  () => fetch(`/api/sales-reps/vendors?salesman_uq=${selectedUq}&not_in=1`).then(r => r.json()).then(d => norm(Array.isArray(d) ? d : [])),
        enabled:  !!selectedUq && activeTab === "vendors" && !!tabLoaded["vendors"],
        staleTime: 0,
    });

    // Tab 4 — Warehouses
    const { data: assignedWarehouses = [], isFetching: loadingWarehousesA, refetch: refetchWarehousesA } = useQuery({
        queryKey: ["sr-warehouses-assigned", selectedUq],
        queryFn:  () => fetch(`/api/sales-reps/warehouses?salesman_uq=${selectedUq}`).then(r => r.json()).then(d => norm(Array.isArray(d) ? d : [])),
        enabled:  !!selectedUq && activeTab === "warehouses" && !!tabLoaded["warehouses"],
        staleTime: 0,
    });
    const { data: availableWarehouses = [], isFetching: loadingWarehousesB, refetch: refetchWarehousesB } = useQuery({
        queryKey: ["sr-warehouses-available", selectedUq],
        queryFn:  () => fetch(`/api/sales-reps/warehouses?salesman_uq=${selectedUq}&not_in=1`).then(r => r.json()).then(d => norm(Array.isArray(d) ? d : [])),
        enabled:  !!selectedUq && activeTab === "warehouses" && !!tabLoaded["warehouses"],
        staleTime: 0,
    });

    // Tab 5 — Cities
    const { data: assignedCities = [], isFetching: loadingCitiesA, refetch: refetchCitiesA } = useQuery({
        queryKey: ["sr-cities-assigned", selectedUq],
        queryFn:  () => fetch(`/api/sales-reps/cities?salesman_uq=${selectedUq}`).then(r => r.json()).then(d => norm(Array.isArray(d) ? d : [])),
        enabled:  !!selectedUq && activeTab === "cities" && !!tabLoaded["cities"],
        staleTime: 0,
    });
    const { data: availableCities = [], isFetching: loadingCitiesB, refetch: refetchCitiesB } = useQuery({
        queryKey: ["sr-cities-available", selectedUq],
        queryFn:  () => fetch(`/api/sales-reps/cities?salesman_uq=${selectedUq}&not_in=1`).then(r => r.json()).then(d => norm(Array.isArray(d) ? d : [])),
        enabled:  !!selectedUq && activeTab === "cities" && !!tabLoaded["cities"],
        staleTime: 0,
    });

    // Tab 6 — Salesmen links
    const { data: assignedSalesmen = [], isFetching: loadingSalesmenA, refetch: refetchSalesmenA } = useQuery({
        queryKey: ["sr-salesmen-assigned", selectedUq],
        queryFn:  () => fetch(`/api/sales-reps/salesmen-links?salesman_uq=${selectedUq}`).then(r => r.json()).then(d => norm(Array.isArray(d) ? d : [])),
        enabled:  !!selectedUq && activeTab === "salesmen" && !!tabLoaded["salesmen"],
        staleTime: 0,
    });
    const { data: availableSalesmen = [], isFetching: loadingSalesmenB, refetch: refetchSalesmenB } = useQuery({
        queryKey: ["sr-salesmen-available", selectedUq],
        queryFn:  () => fetch(`/api/sales-reps/salesmen-links?salesman_uq=${selectedUq}&not_in=1`).then(r => r.json()).then(d => norm(Array.isArray(d) ? d : [])),
        enabled:  !!selectedUq && activeTab === "salesmen" && !!tabLoaded["salesmen"],
        staleTime: 0,
    });

    // ── Filtered list ─────────────────────────────────────────────────────────
    const filteredList = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return salesRepsList as any[];
        return (salesRepsList as any[]).filter(r =>
            t(r.FIRST_NAME).toLowerCase().includes(q) ||
            t(r.LAST_NAME).toLowerCase().includes(q) ||
            t(r.OLD_CODE).toLowerCase().includes(q) ||
            t(r.EMAIL_1).toLowerCase().includes(q)
        );
    }, [salesRepsList, search]);

    // ── Tab click ─────────────────────────────────────────────────────────────
    const handleTabClick = (tab: ActiveTab) => {
        setActiveTab(tab);
        setTabLoaded(prev => ({ ...prev, [tab]: true }));
    };

    // ── Row click (select salesman) ───────────────────────────────────────────
    const handleSelectRow = (row: any) => {
        const uq = t(row.UNICO);
        setSelectedUq(uq);
        setTabLoaded({ [activeTab]: true });
        setMobilePanel("detail");
    };

    // ── Open Add modal ────────────────────────────────────────────────────────
    const handleAdd = () => {
        if (!perms.canCreate) { toast.error("You are not authorized to create new records."); return; }
        setForm({ ...EMPTY_FORM });
        setFormError(null);
        setModalTab("setup");
        setModalMode("add");
        setModalOpen(true);
    };

    // ── Open Edit modal ───────────────────────────────────────────────────────
    const handleEdit = async () => {
        if (!selectedUq) { toast.error("Select a sales rep first."); return; }
        if (!perms.canEdit) { toast.error("You are not authorized to modify records."); return; }
        try {
            const r = await fetch(`/api/sales-reps/${selectedUq}`);
            const d = await r.json();
            if (!d) { toast.error("Sales rep not found."); return; }
            const fill: any = {};
            for (const [k, v] of Object.entries(d)) fill[k.toLowerCase()] = v;
            setForm({
                unico:                  t(fill.unico),
                first_name:             t(fill.salesman_fname),
                last_name:              t(fill.salesman_lname),
                address:                t(fill.address),
                phone_1:                t(fill.phone_1),
                phone_2:                t(fill.phone_2),
                email_1:                t(fill.email_1),
                email_2:                t(fill.email_2),
                old_code:               t(fill.old_code),
                active:                 Boolean(fill.active),
                remote:                 Boolean(fill.remote),
                superior_uq:            t(fill.superior_uq),
                user_uq:                t(fill.user_uq),
                wphysical_uq:           t(fill.wphysical_uq),
                view_hold:              Boolean(fill.view_hold),
                view_lot:               Boolean(fill.view_lot),
                view_grower:            Boolean(fill.view_grower),
                view_days:              Boolean(fill.view_days),
                move_hold:              Boolean(fill.move_hold),
                view_all_inv:           Boolean(fill.view_all_inv),
                commi_osales:           parseFloat(fill.commi_osales ?? 0) || 0,
                due_days:               parseInt(fill.due_days ?? 0, 10) || 0,
                autho_over:             parseFloat(fill.autho_over ?? 0) || 0,
                commi_gsales:           parseFloat(fill.commi_gsales ?? 0) || 0,
                lot_fifo_lifo:          parseInt(fill.lot_fifo_lifo ?? 0, 10) || 0,
                ...Object.fromEntries(PERM_LABELS.map(([k]) => [k, Boolean(fill[k])])),
            });
            setFormError(null);
            setModalTab("setup");
            setModalMode("edit");
            setModalOpen(true);
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    // ── Delete ────────────────────────────────────────────────────────────────
    const handleDelete = async () => {
        if (!selectedUq) { toast.error("Select a sales rep first."); return; }
        if (!perms.canDelete) { toast.error("You are not authorized to delete records."); return; }
        const rec = (salesRepsList as any[]).find(r => t(r.UNICO) === selectedUq);
        const name = rec ? `${t(rec.FIRST_NAME)} ${t(rec.LAST_NAME)}`.trim() : selectedUq;
        if (!confirm(`Delete sales rep "${name}"? This action cannot be undone.`)) return;
        try {
            const res = await fetch(`/api/sales-reps/${selectedUq}`, { method: "DELETE" });
            const d = await res.json();
            if (!d.success) throw new Error(d.error || "Delete failed");
            logAction("Delete", selectedUq);
            toast.success("Sales rep deleted.");
            setSelectedUq(null);
            qc.invalidateQueries({ queryKey: ["sales-reps-list"] });
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    // ── Save modal ────────────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!t(form.first_name)) { setFormError("First Name is required."); return; }
        if (!t(form.last_name))  { setFormError("Last Name is required."); return; }
        setSaving(true); setFormError(null);
        try {
            let unico = form.unico;
            if (modalMode === "add") {
                const res = await fetch("/api/sales-reps", {
                    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
                });
                const d = await res.json();
                if (!d.success) throw new Error(d.error || "Insert failed");
                unico = d.unico;
                logAction("Insert", unico || "NEW");
                toast.success("Sales rep created.");
                setSelectedUq(unico || null);
            } else {
                const res = await fetch(`/api/sales-reps/${unico}`, {
                    method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
                });
                const d = await res.json();
                if (!d.success) throw new Error(d.error || "Update failed");
                logAction("Edit", unico);
                toast.success("Sales rep updated.");
            }
            qc.invalidateQueries({ queryKey: ["sales-reps-list"] });
            setModalOpen(false);
        } catch (e: any) {
            setFormError(e.message);
        } finally {
            setSaving(false);
        }
    };

    // ── Customer tab handlers ─────────────────────────────────────────────────
    const filteredCustSearch = useMemo(() => {
        const q = custSearch.trim().toLowerCase();
        if (!q) return salesmanSearch as any[];
        return (salesmanSearch as any[]).filter(r =>
            t(r.FIRST_NAME).toLowerCase().includes(q) ||
            t(r.LAST_NAME).toLowerCase().includes(q)
        );
    }, [salesmanSearch, custSearch]);

    const handleReassignCustomer = async () => {
        if (!selCustUq || !newSalesUq) { toast.error("Select both a customer and a new salesman."); return; }
        setCustSaving(true);
        try {
            const res = await fetch("/api/sales-reps/customers", {
                method: "PUT", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ customer_uq: selCustUq, new_salesman_uq: newSalesUq }),
            });
            const d = await res.json();
            if (!d.success) throw new Error(d.error || "Reassign failed");
            logAction("Edit", selCustUq, "ReassignCustomer");
            toast.success("Customer reassigned.");
            setCustModal(false);
            setSelCustUq(null);
            setNewSalesUq(null);
            qc.invalidateQueries({ queryKey: ["sr-customers", selectedUq] });
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setCustSaving(false);
        }
    };

    // ── DualPanel handlers ────────────────────────────────────────────────────
    const invalidatePair = (tab: ActiveTab) => {
        qc.invalidateQueries({ queryKey: [`sr-${tab}-assigned`, selectedUq] });
        qc.invalidateQueries({ queryKey: [`sr-${tab}-available`, selectedUq] });
    };

    const handleAddClass = async (row: any) => {
        const res = await fetch("/api/sales-reps/product-classes", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ class_uq: t(row.UNICO ?? row.unico), salesman_uq: selectedUq }),
        });
        const d = await res.json();
        if (!d.success) throw new Error(d.error || "Add failed");
        logAction("Insert", t(row.UNICO ?? row.unico), "AddClass");
        toast.success("Product class added.");
        invalidatePair("product-classes");
    };
    const handleRemoveClass = async (row: any) => {
        const res = await fetch("/api/sales-reps/product-classes", {
            method: "DELETE", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ unico: t(row.UNICO ?? row.unico) }),
        });
        const d = await res.json();
        if (!d.success) throw new Error(d.error || "Remove failed");
        logAction("Delete", t(row.UNICO ?? row.unico), "RemoveClass");
        toast.success("Product class removed.");
        invalidatePair("product-classes");
    };

    const handleAddVendor = async (row: any) => {
        const res = await fetch("/api/sales-reps/vendors", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ grower_uq: t(row.UNICO ?? row.unico), salesman_uq: selectedUq }),
        });
        const d = await res.json();
        if (!d.success) throw new Error(d.error || "Add failed");
        logAction("Insert", t(row.UNICO ?? row.unico), "AddVendor");
        toast.success("Vendor added.");
        invalidatePair("vendors");
    };
    const handleRemoveVendor = async (row: any) => {
        const res = await fetch("/api/sales-reps/vendors", {
            method: "DELETE", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ unico: t(row.UNICO ?? row.unico) }),
        });
        const d = await res.json();
        if (!d.success) throw new Error(d.error || "Remove failed");
        logAction("Delete", t(row.UNICO ?? row.unico), "RemoveVendor");
        toast.success("Vendor removed.");
        invalidatePair("vendors");
    };

    const handleAddWarehouse = async (row: any) => {
        const res = await fetch("/api/sales-reps/warehouses", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ whouse_uq: t(row.UNICO ?? row.unico), salesman_uq: selectedUq }),
        });
        const d = await res.json();
        if (!d.success) throw new Error(d.error || "Add failed");
        logAction("Insert", t(row.UNICO ?? row.unico), "AddWarehouse");
        toast.success("Warehouse added.");
        invalidatePair("warehouses");
    };
    const handleRemoveWarehouse = async (row: any) => {
        const res = await fetch("/api/sales-reps/warehouses", {
            method: "DELETE", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ unico: t(row.UNICO ?? row.unico) }),
        });
        const d = await res.json();
        if (!d.success) throw new Error(d.error || "Remove failed");
        logAction("Delete", t(row.UNICO ?? row.unico), "RemoveWarehouse");
        toast.success("Warehouse removed.");
        invalidatePair("warehouses");
    };

    const handleAddCity = async (row: any) => {
        const res = await fetch("/api/sales-reps/cities", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ salesman_uq: selectedUq, city: t(row.CITY ?? row.city) }),
        });
        const d = await res.json();
        if (!d.success) throw new Error(d.error || "Add failed");
        logAction("Insert", t(row.CITY ?? row.city), "AddCity");
        toast.success("City added.");
        invalidatePair("cities");
    };
    const handleRemoveCity = async (row: any) => {
        const res = await fetch("/api/sales-reps/cities", {
            method: "DELETE", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ unico: t(row.UNICO ?? row.unico) }),
        });
        const d = await res.json();
        if (!d.success) throw new Error(d.error || "Remove failed");
        logAction("Delete", t(row.UNICO ?? row.unico), "RemoveCity");
        toast.success("City removed.");
        invalidatePair("cities");
    };

    const handleAddSalesman = async (row: any) => {
        const res = await fetch("/api/sales-reps/salesmen-links", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ salesman_uq: selectedUq, related_uq: t(row.UNICO ?? row.unico) }),
        });
        const d = await res.json();
        if (!d.success) throw new Error(d.error || "Add failed");
        logAction("Insert", t(row.UNICO ?? row.unico), "AddSalesman");
        toast.success("Salesman link added.");
        invalidatePair("salesmen");
    };
    const handleRemoveSalesman = async (row: any) => {
        const res = await fetch("/api/sales-reps/salesmen-links", {
            method: "DELETE", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ unico: t(row.UNICO ?? row.unico) }),
        });
        const d = await res.json();
        if (!d.success) throw new Error(d.error || "Remove failed");
        logAction("Delete", t(row.UNICO ?? row.unico), "RemoveSalesman");
        toast.success("Salesman link removed.");
        invalidatePair("salesmen");
    };

    // ── Form field helper ─────────────────────────────────────────────────────
    const setField = (key: string, val: any) => setForm((p: any) => ({ ...p, [key]: val }));

    // ── Loading guard ─────────────────────────────────────────────────────────
    if (status === "loading") return null;
    if (status === "unauthenticated") { router.push("/login"); return null; }

    const selRec = (salesRepsList as any[]).find(r => t(r.UNICO) === selectedUq);
    const selName = selRec ? `${t(selRec.FIRST_NAME)} ${t(selRec.LAST_NAME)}`.trim() : "";

    const TABS: { key: ActiveTab; label: string }[] = [
        { key: "customers",      label: "Customers" },
        { key: "product-classes", label: "Product Class" },
        { key: "vendors",        label: "Vendors" },
        { key: "warehouses",     label: "Warehouses" },
        { key: "cities",         label: "Cities" },
        { key: "salesmen",       label: "Salesmen" },
    ];

    return (
        <div className="flex flex-col h-[100dvh] bg-[#f4f6f8] overflow-hidden font-sans text-[#333]">

            <AppHeader title="Sales Reps" />

            {/* ── Main Layout ── */}
            <div className="flex flex-col md:flex-row flex-1 gap-2 p-2 overflow-hidden min-h-0">

                {/* ── Left: Sales Reps List ── */}
                {/* On mobile: show only when mobilePanel === "list" */}
                <div className={cn(
                    "flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden min-h-0",
                    "md:w-[32%] md:shrink-0 md:flex",
                    mobilePanel === "list" ? "flex flex-1" : "hidden md:flex"
                )}>
                    {/* List header — PanelGrid */}
                    <PanelGrid
                        title="Sales Reps"
                        icon={Users}
                        recordCount={filteredList.length}
                        onRefresh={() => refetchList()}
                        refreshing={loadingList}
                        menuItems={[
                            { label: "Add Rep", icon: Plus, color: "green", onClick: handleAdd, disabled: !perms.canCreate },
                            { label: "Edit Rep", icon: Pencil, color: "orange", onClick: handleEdit, disabled: !selectedUq || !perms.canEdit },
                            { label: "Delete Rep", icon: Trash2, color: "orange", onClick: handleDelete, disabled: !selectedUq || !perms.canDelete },
                            { separator: true },
                            { label: "Reports", icon: FileText, color: "gray", onClick: () => toast.info("Reports coming soon."), disabled: !perms.canReport },
                        ]}
                        className="flex-1 min-h-0 flex flex-col"
                    >

                    {/* Search */}
                    <div className="p-2 border-b border-gray-100 shrink-0">
                        <div className="relative">
                            <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text" value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Search reps..."
                                className="w-full pl-7 pr-2 h-8 text-xs border border-gray-200 rounded outline-none focus:ring-1 focus:ring-[#FB7506]"
                            />
                        </div>
                    </div>

                    {/* List rows */}
                    <div className="overflow-y-auto flex-1">
                        <PanelGridTable>
                            <PanelGridThead>
                                <PanelGridTh>Salesman</PanelGridTh>
                                <PanelGridTh className="hidden md:table-cell">Phone</PanelGridTh>
                                <PanelGridTh className="hidden md:table-cell">Whouse</PanelGridTh>
                                <PanelGridTh className="hidden md:table-cell">Email</PanelGridTh>
                                <PanelGridTh align="center">Act.</PanelGridTh>
                            </PanelGridThead>
                            <PanelGridTbody>
                                {filteredList.length === 0 && !loadingList ? (
                                    <tr><td colSpan={5} className="p-6 text-center text-gray-300 text-xs italic">
                                        {search ? "No results" : "No sales reps found"}
                                    </td></tr>
                                ) : filteredList.map((row: any, i: number) => {
                                    const uq = t(row.UNICO);
                                    const selected = selectedUq === uq;
                                    return (
                                        <PanelGridTr key={uq || i} selected={selected} onClick={() => handleSelectRow(row)}>
                                            <PanelGridTd className="font-semibold">{`${t(row.FIRST_NAME)} ${t(row.LAST_NAME)}`.trim()}</PanelGridTd>
                                            <PanelGridTd className="hidden md:table-cell text-gray-500">{t(row.PHONE_1)}</PanelGridTd>
                                            <PanelGridTd className="hidden md:table-cell text-gray-500">{t(row.WPHYSICAL_UQ ?? row.WAREHOUSE ?? "")}</PanelGridTd>
                                            <PanelGridTd className="hidden md:table-cell text-gray-400 truncate max-w-[120px]">{t(row.EMAIL_1)}</PanelGridTd>
                                            <PanelGridTd align="center">{Boolean(row.ACTIVE) ? <Check size={10} className="text-green-500 mx-auto" /> : <span className="text-gray-300">{"\u2014"}</span>}</PanelGridTd>
                                        </PanelGridTr>
                                    );
                                })}
                            </PanelGridTbody>
                        </PanelGridTable>
                    </div>
                    </PanelGrid>
                    <div className="px-3 py-1.5 border-t border-gray-100 shrink-0 bg-gray-50">
                        <span className="text-[10px] text-gray-400 font-bold">{filteredList.length} record{filteredList.length !== 1 ? "s" : ""}</span>
                    </div>
                </div>

                {/* ── Right: Detail tabs ── */}
                {/* On mobile: show only when mobilePanel === "detail" */}
                <div className={cn(
                    "flex flex-col min-w-0 min-h-0 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden",
                    "md:flex md:flex-1",
                    mobilePanel === "detail" ? "flex flex-1" : "hidden md:flex"
                )}>

                    {/* Tab bar — scrollable on small screens */}
                    <div className="h-10 bg-[#374151] flex items-end px-2 gap-0.5 shrink-0 overflow-x-auto scrollbar-none">
                        {TABS.map(tab => (
                            <button key={tab.key}
                                onClick={() => { if (selectedUq) handleTabClick(tab.key); }}
                                disabled={!selectedUq}
                                className={cn(
                                    "px-2 md:px-4 h-8 text-[9px] md:text-[10px] font-black uppercase tracking-wider rounded-t transition-all whitespace-nowrap shrink-0",
                                    !selectedUq && "opacity-40 cursor-not-allowed",
                                    activeTab === tab.key ? "bg-[#f4f6f8] text-[#FB7506]" : "text-gray-400 hover:text-white hover:bg-white/10"
                                )}>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Salesman name header */}
                    {selectedUq && (
                        <div className="bg-white border-b border-gray-200 px-4 py-2 shrink-0 flex items-center justify-between">
                            <span className="font-black text-lg text-[#374151] uppercase tracking-tight">
                                {selName || "—"}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                Salesman and {TABS.find(t => t.key === activeTab)?.label ?? ""} Definition
                            </span>
                        </div>
                    )}

                    {/* Tab content */}
                    <div className="flex-1 overflow-hidden min-h-0 flex flex-col">
                        {!selectedUq ? (
                            <div className="flex-1 flex items-center justify-center text-gray-300 text-sm font-bold uppercase tracking-wide">
                                <div className="text-center">
                                    <Users size={40} className="mx-auto mb-3 opacity-30" />
                                    <p>Select a sales rep</p>
                                </div>
                            </div>
                        ) : !tabLoaded[activeTab] ? (
                            <div className="flex-1 flex items-center justify-center text-gray-300 text-xs font-bold uppercase">
                                Click a tab to load data
                            </div>
                        ) : (
                            <>
                                {/* ── Tab 1: Customers ── */}
                                {activeTab === "customers" && (
                                    <div className="flex flex-col flex-1 min-h-0">
                                        <div className="h-9 bg-gray-50 border-b border-gray-200 flex items-center justify-between px-3 shrink-0">
                                            <span className="font-black text-[10px] text-gray-600 uppercase tracking-wide">
                                                Customers of {selName}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                {loadingCustomers && <RefreshCcw size={12} className="animate-spin text-gray-400" />}
                                                <button onClick={() => { setCustModal(true); setCustSearch(""); setSelCustUq(null); setNewSalesUq(null); }}
                                                    className="flex items-center gap-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-[10px] font-black uppercase tracking-wide transition-colors">
                                                    <Plus size={12} /> Reassign
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex-1 overflow-auto">
                                            <table className="min-w-full text-left">
                                                <thead className="bg-gray-100 border-b border-gray-200 sticky top-0 z-10">
                                                    <tr>
                                                        {["Customer", "City", "State", "Phone", "Contact", "Cr. Limit", "Hold"].map(h => (
                                                            <th key={h} className="px-2 py-1.5 font-black text-[10px] text-gray-600 uppercase tracking-wide whitespace-nowrap border-r border-gray-200 last:border-r-0">{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {loadingCustomers ? (
                                                        <tr><td colSpan={7} className="p-4 text-center"><RefreshCcw size={14} className="animate-spin mx-auto text-gray-400" /></td></tr>
                                                    ) : (customers as any[]).length === 0 ? (
                                                        <tr><td colSpan={7} className="p-6 text-center text-gray-300 text-xs italic">No customers assigned</td></tr>
                                                    ) : (customers as any[]).map((row: any, i: number) => (
                                                        <tr key={i} className="hover:bg-gray-50 text-xs">
                                                            <td className="px-2 py-1.5 border-r border-gray-50 truncate max-w-[160px]">{t(row.CUSTOMER ?? row.CUST_CODE)}</td>
                                                            <td className="px-2 py-1.5 border-r border-gray-50">{t(row.CITY)}</td>
                                                            <td className="px-2 py-1.5 border-r border-gray-50">{t(row.STATE)}</td>
                                                            <td className="px-2 py-1.5 border-r border-gray-50 whitespace-nowrap">{t(row.PHONE_1)}</td>
                                                            <td className="px-2 py-1.5 border-r border-gray-50 truncate max-w-[120px]">{t(row.CONTACT)}</td>
                                                            <td className="px-2 py-1.5 border-r border-gray-50 text-right font-mono">{fmt(row.CREDIT_LIMIT)}</td>
                                                            <td className="px-2 py-1.5 text-center">
                                                                {Boolean(row.CREDITHOLD) && <span className="text-red-500 font-black text-[10px]">HOLD</span>}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* ── Tab 2: Product Classes ── */}
                                {activeTab === "product-classes" && (
                                    <div className="flex-1 min-h-0 p-2 overflow-hidden">
                                        <DualPanel
                                            assignedRows={assignedClasses as any[]}
                                            availableRows={availableClasses as any[]}
                                            assignedCols={[{ key: "CLASS", label: "Class" }, { key: "SALESMAN_NAME", label: "Salesman" }]}
                                            availableCols={[{ key: "CLASS", label: "Class" }]}
                                            onAdd={handleAddClass}
                                            onRemove={handleRemoveClass}
                                            loading={loadingClassesA || loadingClassesB}
                                            assignedKey="UNICO"
                                            availableKey="UNICO"
                                        />
                                    </div>
                                )}

                                {/* ── Tab 3: Vendors ── */}
                                {activeTab === "vendors" && (
                                    <div className="flex-1 min-h-0 p-2 overflow-hidden">
                                        <DualPanel
                                            assignedRows={assignedVendors as any[]}
                                            availableRows={availableVendors as any[]}
                                            assignedCols={[{ key: "GROWER", label: "Grower" }, { key: "FARM", label: "Farm" }, { key: "CITY", label: "City" }, { key: "COUNTRY", label: "Country" }]}
                                            availableCols={[{ key: "GROWER", label: "Grower" }, { key: "FARM", label: "Farm" }, { key: "CITY", label: "City" }]}
                                            onAdd={handleAddVendor}
                                            onRemove={handleRemoveVendor}
                                            loading={loadingVendorsA || loadingVendorsB}
                                            assignedKey="UNICO"
                                            availableKey="UNICO"
                                        />
                                    </div>
                                )}

                                {/* ── Tab 4: Warehouses ── */}
                                {activeTab === "warehouses" && (
                                    <div className="flex-1 min-h-0 p-2 overflow-hidden">
                                        <DualPanel
                                            assignedRows={assignedWarehouses as any[]}
                                            availableRows={availableWarehouses as any[]}
                                            assignedCols={[{ key: "WAREHOUSE", label: "Warehouse" }, { key: "HANDLING_KG", label: "Handling KG" }]}
                                            availableCols={[{ key: "WAREHOUSE", label: "Warehouse" }]}
                                            onAdd={handleAddWarehouse}
                                            onRemove={handleRemoveWarehouse}
                                            loading={loadingWarehousesA || loadingWarehousesB}
                                            assignedKey="UNICO"
                                            availableKey="UNICO"
                                        />
                                    </div>
                                )}

                                {/* ── Tab 5: Cities ── */}
                                {activeTab === "cities" && (
                                    <div className="flex-1 min-h-0 p-2 overflow-hidden">
                                        <DualPanel
                                            assignedRows={assignedCities as any[]}
                                            availableRows={availableCities as any[]}
                                            assignedCols={[{ key: "CITY", label: "City" }, { key: "SALESMAN_NAME", label: "Salesman" }]}
                                            availableCols={[{ key: "CITY", label: "City" }]}
                                            onAdd={handleAddCity}
                                            onRemove={handleRemoveCity}
                                            loading={loadingCitiesA || loadingCitiesB}
                                            assignedKey="UNICO"
                                            availableKey="CITY"
                                        />
                                    </div>
                                )}

                                {/* ── Tab 6: Salesmen ── */}
                                {activeTab === "salesmen" && (
                                    <div className="flex-1 min-h-0 p-2 overflow-hidden">
                                        <DualPanel
                                            assignedRows={assignedSalesmen as any[]}
                                            availableRows={availableSalesmen as any[]}
                                            assignedCols={[{ key: "SALESMAN_NAME", label: "Salesman" }]}
                                            availableCols={[{ key: "SALESMAN_NAME", label: "Salesman" }]}
                                            onAdd={handleAddSalesman}
                                            onRemove={handleRemoveSalesman}
                                            loading={loadingSalesmenA || loadingSalesmenB}
                                            assignedKey="UNICO"
                                            availableKey="UNICO"
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── Salesman Detail Modal ─────────────────────────────────────────────── */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
                    onClick={() => setModalOpen(false)}>
                    <div className="bg-white rounded-t-2xl sm:rounded-lg shadow-2xl w-full sm:max-w-5xl h-[95vh] sm:max-h-[92vh] flex flex-col overflow-hidden"
                        onClick={e => e.stopPropagation()}>

                        {/* Modal header */}
                        <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-0 rounded-t-lg shrink-0">
                            <div className="flex items-center gap-2">
                                <Users size={16} className="text-[#FB7506]" />
                                <span className="font-black text-[10px] text-white uppercase tracking-widest">
                                    {modalMode === "add" ? "New Sales Rep" : `Edit: ${t(form.first_name)} ${t(form.last_name)}`}
                                </span>
                                {formError && (
                                    <span className="flex items-center gap-1 text-amber-400 text-[10px] font-bold ml-2 truncate">
                                        <AlertCircle size={12} />{formError}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1.5 px-2">
                                <button onClick={handleSave} disabled={saving}
                                    className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-1.5 rounded text-xs font-black uppercase tracking-wider transition-all">
                                    {saving ? <RefreshCcw size={14} className="animate-spin" /> : <Save size={14} />}
                                    {saving ? "Saving..." : "Save"}
                                </button>
                                <button onClick={() => setModalOpen(false)}
                                    className="flex items-center gap-1.5 bg-gray-500 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-xs font-black uppercase tracking-wider transition-all">
                                    <X size={14} /> Cancel
                                </button>
                            </div>
                        </div>

                        {/* Modal inner tabs */}
                        <div className="bg-[#374151] flex items-end px-2 gap-0.5 shrink-0">
                            {(["setup", "buyer", "others"] as const).map(tab => (
                                <button key={tab} onClick={() => setModalTab(tab)}
                                    className={cn(
                                        "px-4 h-7 text-[10px] font-black uppercase tracking-wider rounded-t transition-all",
                                        modalTab === tab ? "bg-white text-[#FB7506]" : "text-gray-400 hover:text-white hover:bg-white/10"
                                    )}>
                                    {tab === "setup" ? "Salesman Setup" : tab === "buyer" ? "Buyer Setup" : "Others"}
                                </button>
                            ))}
                        </div>

                        {/* ── Always-visible top fields ── */}
                        <div className="px-3 md:px-4 pt-3 pb-2 border-b border-gray-200 bg-gray-50 shrink-0">
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-x-3 gap-y-2 text-xs">
                                {/* Row 1 */}
                                <div className="flex flex-col gap-0.5">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">EDI Code</label>
                                    <input value={t(form.old_code)} onChange={e => setField("old_code", e.target.value)} className="fos-input h-8 text-xs" />
                                </div>
                                <div className="col-span-1 sm:col-span-2 lg:col-span-4 flex flex-col gap-0.5">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">User Name *</label>
                                    <select value={t(form.user_uq)} onChange={e => setField("user_uq", e.target.value)} className="fos-input h-8 text-xs">
                                        <option value="">-- None --</option>
                                        {(systemUsers as any[]).map((u: any) => (
                                            <option key={t(u.UNICO ?? u.unico)} value={t(u.UNICO ?? u.unico)}>
                                                {t(u.USUARIO ? `${u.NOMBRES} ${u.APELLIDOS} (${u.USUARIO})`.trim() : (u.NAME ?? u.USER_NAME ?? u.UNICO ?? u.unico))}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-0.5 items-center justify-end pb-1">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Active</label>
                                    <input type="checkbox" checked={Boolean(form.active)} onChange={e => setField("active", e.target.checked)} className="w-5 h-5 accent-[#FB7506]" />
                                </div>
                                {/* Row 2 */}
                                <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex flex-col gap-0.5">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">First Name *</label>
                                    <input value={t(form.first_name)} onChange={e => setField("first_name", e.target.value)} className="fos-input h-8 text-xs" />
                                </div>
                                <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex flex-col gap-0.5">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Last Name *</label>
                                    <input value={t(form.last_name)} onChange={e => setField("last_name", e.target.value)} className="fos-input h-8 text-xs" />
                                </div>
                                {/* Row 3 */}
                                <div className="col-span-2 sm:col-span-2 lg:col-span-4 flex flex-col gap-0.5">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Address 1</label>
                                    <input value={t(form.address)} onChange={e => setField("address", e.target.value)} className="fos-input h-8 text-xs" />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Phone 1</label>
                                    <input value={t(form.phone_1)} onChange={e => setField("phone_1", e.target.value)} className="fos-input h-8 text-xs" />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Phone 2</label>
                                    <input value={t(form.phone_2)} onChange={e => setField("phone_2", e.target.value)} className="fos-input h-8 text-xs" />
                                </div>
                                {/* Row 4 */}
                                <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex flex-col gap-0.5">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">E-mail *</label>
                                    <input type="email" value={t(form.email_1)} onChange={e => setField("email_1", e.target.value)} className="fos-input h-8 text-xs" />
                                </div>
                                <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex flex-col gap-0.5">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">E-mail 2</label>
                                    <input type="email" value={t(form.email_2)} onChange={e => setField("email_2", e.target.value)} className="fos-input h-8 text-xs" />
                                </div>
                                {/* Row 5 */}
                                <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex flex-col gap-0.5">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">P. Warehouse Default *</label>
                                    <select value={t(form.wphysical_uq)} onChange={e => setField("wphysical_uq", e.target.value)} className="fos-input h-8 text-xs">
                                        <option value="">-- None --</option>
                                        {(physicalWarehouses as any[]).map((w: any) => (
                                            <option key={t(w.UNICO ?? w.unico)} value={t(w.UNICO ?? w.unico)}>
                                                {t(w.WAREHOUSE ?? w.warehouse ?? w.DESCRIPTION ?? w.description ?? w.UNICO ?? w.unico)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex flex-col gap-0.5">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Superior</label>
                                    <select value={t(form.superior_uq)} onChange={e => setField("superior_uq", e.target.value)} className="fos-input h-8 text-xs">
                                        <option value="">-- None --</option>
                                        {(salesmanSearch as any[]).filter(r => t(r.UNICO) !== form.unico).map((r: any) => (
                                            <option key={t(r.UNICO)} value={t(r.UNICO)}>
                                                {`${t(r.FIRST_NAME)} ${t(r.LAST_NAME)}`.trim()}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Modal tab content */}
                        <div className="flex-1 overflow-y-auto p-3">

                            {/* ── Salesman Setup Tab: numeric fields + permission grid ── */}
                            {modalTab === "setup" && (
                                <div className="space-y-2">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                                        {[
                                            { key: "commi_osales",  label: "% Sales Commission",       step: "0.01", isFloat: true },
                                            { key: "due_days",      label: "Commission Due Days",       step: "1",    isFloat: false },
                                            { key: "autho_over",    label: "% G.Profit Override Level", step: "0.01", isFloat: true },
                                            { key: "commi_gsales",  label: "Comm. G.Sales %",           step: "0.01", isFloat: true },
                                            { key: "lot_fifo_lifo", label: "Fresh Override",            step: "1",    isFloat: false },
                                        ].map(f => (
                                            <div key={f.key} className="flex flex-col gap-0.5">
                                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-wide leading-tight">{f.label}</label>
                                                <input type="number" step={f.step} value={form[f.key] ?? 0}
                                                    onChange={e => setField(f.key, f.isFloat ? (parseFloat(e.target.value) || 0) : (parseInt(e.target.value) || 0))}
                                                    className="fos-input h-7 text-xs text-right" />
                                            </div>
                                        ))}
                                    </div>
                                    {/* Permission grid: 2 cols mobile → 3 sm → 4 md → 5 lg */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-1 gap-y-0 border-t border-gray-100 pt-2">
                                        {PERM_LABELS.map(([key, label]) => (
                                            <label key={key} className="flex items-center gap-1.5 cursor-pointer py-1 px-1 rounded hover:bg-gray-50">
                                                <input type="checkbox" checked={Boolean(form[key])}
                                                    onChange={e => setField(key, e.target.checked)}
                                                    className="w-4 h-4 md:w-3.5 md:h-3.5 accent-[#FB7506] shrink-0" />
                                                <span className="text-[11px] md:text-[10px] font-semibold text-gray-700 leading-tight">{label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ── Buyer Setup Tab ── */}
                            {modalTab === "buyer" && (
                                <p className="text-xs text-gray-400 italic text-center py-8">Buyer Setup — coming soon.</p>
                            )}

                            {/* ── Others Tab ── */}
                            {modalTab === "others" && (
                                <p className="text-xs text-gray-400 italic text-center py-8">Additional settings — coming soon.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Customer Reassign Modal ─────────────────────────────────────────────── */}
            {custModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setCustModal(false)}>
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
                        onClick={e => e.stopPropagation()}>

                        <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 rounded-t-lg shrink-0">
                            <div className="flex items-center gap-2">
                                <Users size={16} className="text-[#FB7506]" />
                                <span className="font-black text-[10px] text-white uppercase tracking-widest">Reassign Customer</span>
                            </div>
                            <button onClick={() => setCustModal(false)} className="text-gray-400 hover:text-white transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="flex flex-1 min-h-0 gap-2 p-3">
                            {/* Customers list */}
                            <div className="flex-1 flex flex-col min-h-0 border border-gray-200 rounded overflow-hidden">
                                <div className="bg-gray-100 border-b border-gray-200 px-2 py-1.5 shrink-0">
                                    <span className="font-black text-[10px] text-gray-600 uppercase tracking-wide">Select Customer</span>
                                </div>
                                <div className="flex-1 overflow-auto">
                                    <table className="min-w-full text-left">
                                        <thead className="bg-gray-100 border-b border-gray-200 sticky top-0 z-10">
                                            <tr>
                                                {["Customer", "City", "Phone"].map(h => (
                                                    <th key={h} className="px-2 py-1.5 font-black text-[10px] text-gray-600 uppercase tracking-wide whitespace-nowrap border-r border-gray-200 last:border-r-0">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {(customers as any[]).length === 0 ? (
                                                <tr><td colSpan={3} className="p-4 text-center text-gray-300 text-xs italic">No customers</td></tr>
                                            ) : (customers as any[]).map((row: any, i: number) => {
                                                const uq = t(row.UNICO);
                                                const sel = selCustUq === uq;
                                                return (
                                                    <tr key={i} onClick={() => setSelCustUq(sel ? null : uq)}
                                                        className={cn("cursor-pointer text-xs transition-colors", sel ? "!bg-blue-50 ring-1 ring-inset ring-blue-200" : "hover:bg-gray-50")}>
                                                        <td className="px-2 py-1.5 border-r border-gray-50 truncate max-w-[140px]">{t(row.CUSTOMER ?? row.CUST_CODE)}</td>
                                                        <td className="px-2 py-1.5 border-r border-gray-50">{t(row.CITY)}</td>
                                                        <td className="px-2 py-1.5">{t(row.PHONE_1)}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* New salesman */}
                            <div className="flex-1 flex flex-col min-h-0 border border-gray-200 rounded overflow-hidden">
                                <div className="bg-gray-100 border-b border-gray-200 px-2 py-1 shrink-0">
                                    <span className="font-black text-[10px] text-gray-600 uppercase tracking-wide">Select New Salesman</span>
                                </div>
                                <div className="p-2 border-b border-gray-100 shrink-0">
                                    <div className="relative">
                                        <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input type="text" placeholder="Search..." value={custSearch}
                                            onChange={e => setCustSearch(e.target.value)}
                                            className="w-full pl-6 pr-2 h-7 text-xs border border-gray-200 rounded outline-none focus:ring-1 focus:ring-[#FB7506]" />
                                    </div>
                                </div>
                                <div className="flex-1 overflow-auto">
                                    <table className="min-w-full text-left">
                                        <thead className="bg-gray-100 border-b border-gray-200 sticky top-0 z-10">
                                            <tr>
                                                <th className="px-2 py-1.5 font-black text-[10px] text-gray-600 uppercase tracking-wide">Name</th>
                                                <th className="px-2 py-1.5 font-black text-[10px] text-gray-600 uppercase tracking-wide">Code</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {filteredCustSearch.length === 0 ? (
                                                <tr><td colSpan={2} className="p-4 text-center text-gray-300 text-xs italic">No salesmen</td></tr>
                                            ) : filteredCustSearch.map((row: any, i: number) => {
                                                const uq = t(row.UNICO);
                                                const sel = newSalesUq === uq;
                                                return (
                                                    <tr key={i} onClick={() => setNewSalesUq(sel ? null : uq)}
                                                        className={cn("cursor-pointer text-xs transition-colors", sel ? "!bg-blue-50 ring-1 ring-inset ring-blue-200" : "hover:bg-gray-50")}>
                                                        <td className="px-2 py-1.5 border-r border-gray-50">{`${t(row.FIRST_NAME)} ${t(row.LAST_NAME)}`.trim()}</td>
                                                        <td className="px-2 py-1.5 font-mono text-gray-500">{t(row.OLD_CODE)}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 px-4 py-3 bg-gray-50 border-t shrink-0">
                            <button onClick={() => setCustModal(false)}
                                className="px-4 py-2 rounded border border-gray-200 text-xs font-black uppercase text-gray-600 hover:bg-gray-100 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleReassignCustomer} disabled={!selCustUq || !newSalesUq || custSaving}
                                className="flex items-center gap-2 px-5 py-2 rounded bg-[#FB7506] hover:bg-orange-600 disabled:opacity-40 text-white text-xs font-black uppercase tracking-wider transition-all">
                                {custSaving ? <RefreshCcw size={12} className="animate-spin" /> : <Check size={12} />}
                                {custSaving ? "Reassigning..." : "Reassign"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
