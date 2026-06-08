"use client";

import { useEffect, useState, useMemo, useCallback, Fragment } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Building2, RefreshCcw, Plus, Minus, Pencil, Trash2,
    Search, X, Save, ChevronRight, ChevronLeft, ChevronDown,
    FileText, AlertCircle, Calendar, Check,
    Download, Globe, Settings2,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";

import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { GridMenu } from "@/components/GridMenu";
import PanelGrid from "@/components/ui/PanelGrid";
import { PanelGridTable, PanelGridThead, PanelGridTh, PanelGridTbody, PanelGridTr, PanelGridTd } from "@/components/ui/PanelGridTable";
import { usePagePermissions } from "@/lib/permissions";
import { useAuditLog } from "@/lib/audit";
import { AppFooter } from "@/components/layout/AppFooter";
import { useVendorsStore } from "@/store/useVendorsStore";

// ─── Confirm Delete Dialog ────────────────────────────────────────────────────
function ConfirmDlg({ title, msg, onConfirm, onCancel, saving, error }: any) {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-6 flex flex-col items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center"><Trash2 size={24} className="text-red-600" /></div>
                    <div className="text-center">
                        <h3 className="font-black text-gray-900 text-base mb-1">{title}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">{msg}</p>
                        {error && <p className="text-xs text-red-500 mt-2 font-bold">{error}</p>}
                    </div>
                </div>
                <div className="flex border-t border-gray-100">
                    <button onClick={onCancel} className="flex-1 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 border-r border-gray-100 transition-colors">Cancel</button>
                    <button onClick={onConfirm} disabled={saving} className="flex-1 py-3 text-sm font-black text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors">{saving ? "..." : "Delete"}</button>
                </div>
            </div>
        </div>
    );
}

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
    const s = String(v).trim();
    if (!s) return "";
    // ISO date: parse date part only to avoid UTC→local timezone shift
    const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso) return new Date(+iso[1], +iso[2] - 1, +iso[3]).toLocaleDateString("en-US");
    const d = new Date(s);
    return isNaN(d.getTime()) ? s : d.toLocaleDateString("en-US");
};
const today = () => new Date().toISOString().split("T")[0];
const firstOfYear = () => `${new Date().getFullYear()}-01-01`;

// ─── Empty form ───────────────────────────────────────────────────────────────
const EMPTY_FORM: any = {
    unico: "", grower: "", farm: "", source: "", nit_ruc: "", active: true,
    officeadd1: "", officeadd2: "", farm_add1: "", farm_add2: "",
    fob: "", city: "", country: "",
    phone_1: "", phone_2: "", fax_1: "", fax_2: "", celular: "",
    email_1: "", email_2: "", msn_yahoo: "",
    manager: "", secretary: "", production: false, salesman: "",
    ship_days: 0, old_code: "", international: false,
    bank: "", bank_account: "", change_password: false,
    chk_boxes: false, chk_stems: false, qb_flower: false, qb_freight: false,
    apply_freight: false, auto_packing: false,
    duties: false, broker: false, handling: false, ocharges: false,
    commission: 0, fuel_discount: 0, sales_factor: 0,
    pack_disc: 0, pack_return: 0,
    whouse_farm_id: "", text_invoice: "", text_packing: "",
    flower_system: false, send_file_warehouse: false, special_contributor: false,
    inventory_from_products: false,
    clave: "", terms_uq: "", agency_uq: "", group_uq: "",
};

const EMPTY_DOC = { unico: "", document: "", date_from: firstOfYear(), date_to: today() };

type ActiveTab = "statement" | "documents" | "classes";
type ModalVendorTab = "main" | "contacts" | "settings" | "qb";

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
            {/* Available Panel (Left) */}
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

            {/* Action Buttons (Center) */}
            <div className="flex md:flex-col flex-row items-center justify-center gap-2 shrink-0 px-1 py-1 md:py-0 w-24">
                <button onClick={handleAdd} disabled={!selAvailable || busy}
                    className="w-full flex items-center justify-center gap-1 px-2 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white rounded text-[10px] font-black uppercase tracking-wide transition-colors">
                    Add <ChevronRight size={12} className="hidden md:block" />
                </button>
                <button onClick={handleRemove} disabled={!selAssigned || busy}
                    className="w-full flex items-center justify-center gap-1 px-2 py-1.5 bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white rounded text-[10px] font-black uppercase tracking-wide transition-colors">
                    <ChevronLeft size={12} className="hidden md:block" /> Remove
                </button>
            </div>

            {/* Assigned Panel (Right) */}
            <div className="flex-1 flex flex-col min-h-0 min-w-0" style={{ minHeight: "200px" }}>
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
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function VendorsPage() {
    const { status } = useSession();
    const router = useRouter();
    const qc     = useQueryClient();
    const perms  = usePagePermissions("vendors");
    const { logAction } = useAuditLog("vendors", "flower_growers");

    // ── State ─────────────────────────────────────────────────────────────────
    const {
        search, setSearch, selectedUq, setSelectedUq, expandedVendorUnico, setExpandedVendorUnico,
        stmtModal, setStmtModal, pendingModal, setPendingModal, classesModal, setClassesModal,
        modalOpen, setModalOpen, modalMode, setModalMode, modalTab, setModalTab,
        docModal, setDocModal, wsModal, setWsModal, grpModal, setGrpModal,
        deleteModal, setDeleteModal
    } = useVendorsStore();

    // Statement date range
    const [stmtFrom, setStmtFrom] = useState(firstOfYear());
    const [stmtTo,   setStmtTo]   = useState(today());
    const [stmtKey,  setStmtKey]  = useState(0); // increment to force refetch

    // Vendor Setup modal
    const [form,       setForm]       = useState<any>(EMPTY_FORM);
    const [saving,     setSaving]     = useState(false);
    const [formError,  setFormError]  = useState<string | null>(null);

    // Document modal
    const [docMode,    setDocMode]    = useState<"add" | "edit">("add");
    const [docForm,    setDocForm]    = useState<any>(EMPTY_DOC);
    const [docSaving,  setDocSaving]  = useState(false);
    const [docError,   setDocError]   = useState<string | null>(null);
    const [selDocUq,   setSelDocUq]   = useState<string | null>(null);

    // Groups modal
    const [grpForm,    setGrpForm]    = useState({ unico: "", growertype: "" });
    const [grpMode,    setGrpMode]    = useState<"add" | "edit">("add");
    const [grpSaving,  setGrpSaving]  = useState(false);
    const [grpError,   setGrpError]   = useState<string | null>(null);
    const [selGrpUq,   setSelGrpUq]   = useState<string | null>(null);

    // ── Queries ───────────────────────────────────────────────────────────────
    const [vendorsPage, setVendorsPage] = useState(1);
    const [vendorsList, setVendorsList] = useState<any[]>([]);
    const [hasMoreVendors, setHasMoreVendors] = useState(true);
    const [loadingList, setLoadingList] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [totalVendors, setTotalVendors] = useState(0);

    const fetchVendors = useCallback(async (page: number, q: string, append: boolean) => {
        if (page === 1) setLoadingList(true); else setLoadingMore(true);
        try {
            const param = q.trim() ? q.trim() : "%";
            const res  = await fetch(`/api/vendors?search=${encodeURIComponent(param)}&page=${page}&limit=100`);
            const json = await res.json();
            const rows = norm(Array.isArray(json) ? json : (json.data ?? []));
            if (append) {
                setVendorsList(prev => [...prev, ...rows]);
            } else {
                setVendorsList(rows);
                if (rows.length > 0) setSelectedUq(t(rows[0].UNICO));
                else setSelectedUq(null);
            }
            setVendorsPage(page);
            setHasMoreVendors(rows.length === 100);
            setTotalVendors(json.totalCount || rows.length);
        } catch { /* silent */ }
        finally { setLoadingList(false); setLoadingMore(false); }
    }, []);

    // Reset & reload when search changes
    useEffect(() => {
        setVendorsList([]); setVendorsPage(1); setHasMoreVendors(true);
        fetchVendors(1, search, false);
    }, [search, fetchVendors]);

    const refetchList = () => { setVendorsList([]); fetchVendors(1, search, false); };

    // Infinite scroll handler
    const handleVendorScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 80 && !loadingMore && hasMoreVendors) {
            fetchVendors(vendorsPage + 1, search, true);
        }
    };

    const { data: lookups } = useQuery({
        queryKey: ["vendors-lookups"],
        queryFn:  () => fetch("/api/vendors/lookups").then(r => r.json()),
        staleTime: 1000 * 60 * 10,
    });

    const terms    = norm(lookups?.terms    ?? []);
    const agencies = norm(lookups?.agencies ?? []);
    const cities   = norm(lookups?.cities   ?? []);
    const groups   = norm(lookups?.groups   ?? []);

    // Statement
    const { data: stmtData, isFetching: loadingStmt, refetch: refetchStmt } = useQuery({
        queryKey: ["vendors-statement", selectedUq, stmtFrom, stmtTo, stmtKey],
        queryFn:  () => fetch(`/api/vendors/statement?grower_uq=${selectedUq}&date_from=${stmtFrom}&date_to=${stmtTo}`)
            .then(r => r.json()),
        enabled:  !!selectedUq && (stmtModal || pendingModal),
        staleTime: 0,
    });
    const stmtRows    = norm(stmtData?.statement ?? []);
    const pendingRows = norm(stmtData?.pending   ?? []);

    // Documents
    const { data: docsList = [], isFetching: loadingDocs, refetch: refetchDocs } = useQuery({
        queryKey: ["vendors-documents", selectedUq],
        queryFn:  () => fetch(`/api/vendors/documents?grower_uq=${selectedUq}`).then(r => r.json()).then(d => norm(Array.isArray(d) ? d : [])),
        enabled:  !!selectedUq && expandedVendorUnico === selectedUq,
        staleTime: 0,
    });
    // Classes
    const { data: assignedClasses = [], isFetching: loadingClassA, refetch: refetchClassA } = useQuery({
        queryKey: ["vendors-classes-assigned", selectedUq],
        queryFn:  () => fetch(`/api/vendors/classes?grower_uq=${selectedUq}`).then(r => r.json()).then(d => norm(Array.isArray(d) ? d : [])),
        enabled:  !!selectedUq && classesModal,
        staleTime: 0,
    });
    const { data: availableClasses = [], isFetching: loadingClassB, refetch: refetchClassB } = useQuery({
        queryKey: ["vendors-classes-available", selectedUq],
        queryFn:  () => fetch(`/api/vendors/classes?grower_uq=${selectedUq}&not_in=1`).then(r => r.json()).then(d => norm(Array.isArray(d) ? d : [])),
        enabled:  !!selectedUq && classesModal,
        staleTime: 0,
    });

    // Groups list (for groups modal)
    const { data: groupsList = [], refetch: refetchGroups } = useQuery({
        queryKey: ["vendors-groups"],
        queryFn:  () => fetch("/api/vendors/groups").then(r => r.json()).then(d => norm(Array.isArray(d) ? d : [])),
        enabled:  grpModal,
        staleTime: 0,
    });

    // ── Filtered list ─────────────────────────────────────────────────────────
    const filteredList = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return vendorsList as any[];
        return (vendorsList as any[]).filter(r =>
            t(r.GROWER).toLowerCase().includes(q) ||
            t(r.FARM).toLowerCase().includes(q) ||
            t(r.CITY).toLowerCase().includes(q) ||
            t(r.COUNTRY).toLowerCase().includes(q)
        );
    }, [vendorsList, search]);



    // ── Row select ────────────────────────────────────────────────────────────
    const handleSelectRow = (row: any) => {
        const uq = t(row.UNICO);
        setSelectedUq(uq);
    };

    // ── Add vendor ────────────────────────────────────────────────────────────
    const handleAdd = () => {
        if (!perms.canCreate) { toast.error("You are not authorized to create new records."); return; }
        setForm({ ...EMPTY_FORM });
        setFormError(null);
        setModalTab("main");
        setModalMode("add");
        setModalOpen(true);
    };

    // ── Edit vendor ───────────────────────────────────────────────────────────
    const handleEdit = async () => {
        if (!selectedUq) { toast.error("Select a vendor first."); return; }
        if (!perms.canEdit) { toast.error("You are not authorized to modify records."); return; }
        try {
            const r = await fetch(`/api/vendors/${selectedUq}`);
            const d = await r.json();
            if (!d) { toast.error("Vendor not found."); return; }
            const fill: any = {};
            for (const [k, v] of Object.entries(d)) fill[k.toLowerCase()] = v;
            setForm({
                ...EMPTY_FORM,
                ...fill,
                unico:                  t(fill.unico),
                grower:                 t(fill.grower),
                farm:                   t(fill.farm),
                source:                 t(fill.source),
                nit_ruc:                t(fill.nit_ruc),
                active:                 Boolean(fill.active),
                officeadd1:             t(fill.officeadd1),
                officeadd2:             t(fill.officeadd2),
                farm_add1:              t(fill.farm_add1),
                farm_add2:              t(fill.farm_add2),
                fob:                    t(fill.fob),
                city:                   t(fill.city),
                country:                t(fill.country),
                phone_1:                t(fill.phone_1),
                phone_2:                t(fill.phone_2),
                fax_1:                  t(fill.fax_1),
                fax_2:                  t(fill.fax_2),
                celular:                t(fill.celular),
                email_1:                t(fill.email_1),
                email_2:                t(fill.email_2),
                msn_yahoo:              t(fill.msn_yahoo),
                manager:                t(fill.manager),
                secretary:              t(fill.secretary),
                production:             Boolean(fill.production),
                salesman:               t(fill.sales_person ?? fill.salesman ?? ""),
                ship_days:              parseInt(fill.ship_days ?? 0) || 0,
                old_code:               t(fill.edi_code ?? fill.old_code ?? ""),
                international:          Boolean(fill.international),
                bank:                   t(fill.bankname ?? fill.bank ?? ""),
                bank_account:           t(fill.bank_account),
                change_password:        Boolean(fill.change_password),
                chk_boxes:              Boolean(fill.web_confirm_boxes ?? fill.chk_boxes),
                chk_stems:              Boolean(fill.web_confirm_stems ?? fill.chk_stems),
                qb_flower:              Boolean(fill.qb_flower),
                qb_freight:             Boolean(fill.qb_freight),
                apply_freight:          Boolean(fill.apply_freight),
                auto_packing:           Boolean(fill.auto_packing),
                duties:                 Boolean(fill.duties),
                broker:                 Boolean(fill.broker),
                handling:               Boolean(fill.handling),
                ocharges:               Boolean(fill.ocharges),
                commission:             parseFloat(fill.con_comi ?? fill.commission ?? 0) || 0,
                fuel_discount:          parseFloat(fill.fuel ?? fill.fuel_discount ?? 0) || 0,
                sales_factor:           parseFloat(fill.sales_factor ?? 0) || 0,
                pack_disc:              parseFloat(fill.pack_p_ret ?? fill.pack_disc ?? 0) || 0,
                pack_return:            parseFloat(fill.pack_return ?? 0) || 0,
                whouse_farm_id:         t(fill.whouse_farm_id),
                text_invoice:           t(fill.text_invoice),
                text_packing:           t(fill.text_label ?? fill.text_packing ?? ""),
                flower_system:          Boolean(fill.flower_sys ?? fill.flower_system),
                send_file_warehouse:    Boolean(fill.send_file ?? fill.send_file_warehouse),
                special_contributor:    Boolean(fill.special_contributor ?? fill.special),
                inventory_from_products: Boolean(fill.inventory_from_products),
                clave:                  t(fill.password ?? fill.clave ?? ""),
                terms_uq:               t(fill.terms_uq ?? fill.terms ?? ""),
                agency_uq:              t(fill.type_uq ?? fill.agency_uq ?? fill.type ?? ""),
                group_uq:               t(fill.cargo_uq ?? fill.group_uq ?? fill.cargo_airline ?? ""),
            });
            setFormError(null);
            setModalTab("main");
            setModalMode("edit");
            setModalOpen(true);
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    // ── Delete vendor ─────────────────────────────────────────────────────────
    const handleDelete = async () => {
        if (!selectedUq) { toast.error("Select a vendor first."); return; }
        if (!perms.canDelete) { toast.error("You are not authorized to delete records."); return; }
        const rec = (vendorsList as any[]).find(r => t(r.UNICO) === selectedUq);
        const name = t(rec?.GROWER || selectedUq);
        setDeleteModal({ type: "vendor", id: selectedUq, name });
    };

    const confirmDeleteVendor = async () => {
        if (!deleteModal || deleteModal.type !== "vendor") return;
        setSaving(true);
        try {
            const res = await fetch(`/api/vendors/${deleteModal.id}`, { method: "DELETE" });
            const d = await res.json();
            if (!d.success) throw new Error(d.error || "Delete failed");
            logAction("Delete", deleteModal.id);
            toast.success("Vendor deleted.");
            setSelectedUq(null);
            setDeleteModal(null);
            qc.invalidateQueries({ queryKey: ["vendors-list"] });
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setSaving(false);
        }
    };

    // ── Save vendor modal ─────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!t(form.grower)) { setFormError("Grower / Name is required."); setModalTab("main"); return; }
        setSaving(true); setFormError(null);
        try {
            let unico = form.unico;
            if (modalMode === "add") {
                const res = await fetch("/api/vendors", {
                    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
                });
                const d = await res.json();
                if (!d.success && d.error) throw new Error(d.error);
                unico = d.unico;
                logAction("Insert", unico || "NEW");
                toast.success("Vendor created.");
                setSelectedUq(unico || null);
            } else {
                const res = await fetch(`/api/vendors/${unico}`, {
                    method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
                });
                const d = await res.json();
                if (!d.success) throw new Error(d.error || "Update failed");
                logAction("Edit", unico);
                toast.success("Vendor updated.");
            }
            qc.invalidateQueries({ queryKey: ["vendors-list"] });
            setModalOpen(false);
        } catch (e: any) {
            setFormError(e.message);
        } finally {
            setSaving(false);
        }
    };

    // ── Document handlers ─────────────────────────────────────────────────────
    const handleOpenAddDoc = () => {
        setDocForm({ ...EMPTY_DOC });
        setDocError(null);
        setDocMode("add");
        setDocModal(true);
    };

    const handleOpenEditDoc = async () => {
        if (!selDocUq) { toast.error("Select a document first."); return; }
        try {
            const r = await fetch(`/api/vendors/documents/${selDocUq}`);
            const d = await r.json();
            if (!d) { toast.error("Document not found."); return; }
            const fill: any = {};
            for (const [k, v] of Object.entries(d)) fill[k.toLowerCase()] = v;
            setDocForm({
                unico:     t(fill.unico),
                document:  t(fill.document),
                date_from: (fill.date_from ?? fill.ldfrom) ? String(fill.date_from ?? fill.ldfrom).match(/^(\d{4}-\d{2}-\d{2})/)?.[1] ?? firstOfYear() : firstOfYear(),
                date_to:   (fill.date_to ?? fill.ldto)   ? String(fill.date_to ?? fill.ldto).match(/^(\d{4}-\d{2}-\d{2})/)?.[1] ?? today() : today(),
            });
            setDocError(null);
            setDocMode("edit");
            setDocModal(true);
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    const handleSaveDoc = async () => {
        if (!t(docForm.document)) { setDocError("Document name is required."); return; }
        setDocSaving(true); setDocError(null);
        try {
            if (docMode === "add") {
                const res = await fetch("/api/vendors/documents", {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ grower_uq: selectedUq, ...docForm }),
                });
                const d = await res.json();
                if (!d.success) throw new Error(d.error || "Insert failed");
                logAction("Insert", d.unico || "DOC", "AddDocument");
                toast.success("Document added.");
            } else {
                const res = await fetch(`/api/vendors/documents/${docForm.unico}`, {
                    method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(docForm),
                });
                const d = await res.json();
                if (!d.success) throw new Error(d.error || "Update failed");
                logAction("Edit", docForm.unico, "EditDocument");
                toast.success("Document updated.");
            }
            qc.invalidateQueries({ queryKey: ["vendors-documents", selectedUq] });
            setDocModal(false);
            setSelDocUq(null);
        } catch (e: any) {
            setDocError(e.message);
        } finally {
            setDocSaving(false);
        }
    };

    const handleDeleteDoc = async () => {
        if (!selDocUq) { toast.error("Select a document first."); return; }
        const rec = (docsList as any[]).find(r => t(r.unico) === selDocUq);
        const name = t(rec?.document || selDocUq);
        setDeleteModal({ type: "document", id: selDocUq, name });
    };

    const confirmDeleteDoc = async () => {
        if (!deleteModal || deleteModal.type !== "document") return;
        setSaving(true);
        try {
            const res = await fetch(`/api/vendors/documents/${deleteModal.id}`, { method: "DELETE" });
            const d = await res.json();
            if (!d.success) throw new Error(d.error || "Delete failed");
            logAction("Delete", deleteModal.id, "DeleteDocument");
            toast.success("Document deleted.");
            setSelDocUq(null);
            setDeleteModal(null);
            qc.invalidateQueries({ queryKey: ["vendors-documents", selectedUq] });
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setSaving(false);
        }
    };

    // ── Class handlers ────────────────────────────────────────────────────────
    const handleAddClass = async (row: any) => {
        const res = await fetch("/api/vendors/classes", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ grower_uq: selectedUq, class_uq: t(row.UNICO ?? row.unico) }),
        });
        const d = await res.json();
        if (!d.success) throw new Error(d.error || "Add failed");
        logAction("Insert", t(row.UNICO ?? row.unico), "AddClass");
        toast.success("Class added.");
        qc.invalidateQueries({ queryKey: ["vendors-classes-assigned", selectedUq] });
        qc.invalidateQueries({ queryKey: ["vendors-classes-available", selectedUq] });
    };

    const handleRemoveClass = async (row: any) => {
        const res = await fetch("/api/vendors/classes", {
            method: "DELETE", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ unico: t(row.UNICO ?? row.unico) }),
        });
        const d = await res.json();
        if (!d.success) throw new Error(d.error || "Remove failed");
        logAction("Delete", t(row.UNICO ?? row.unico), "RemoveClass");
        toast.success("Class removed.");
        qc.invalidateQueries({ queryKey: ["vendors-classes-assigned", selectedUq] });
        qc.invalidateQueries({ queryKey: ["vendors-classes-available", selectedUq] });
    };

    // ── Groups CRUD ───────────────────────────────────────────────────────────
    const handleSaveGroup = async () => {
        if (!t(grpForm.growertype)) { setGrpError("Group name is required."); return; }
        setGrpSaving(true); setGrpError(null);
        try {
            if (grpMode === "add") {
                const res = await fetch("/api/vendors/groups", {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ growertype: grpForm.growertype }),
                });
                const d = await res.json();
                if (!d.success) throw new Error(d.error || "Insert failed");
                toast.success("Group created.");
            } else {
                const res = await fetch(`/api/vendors/groups/${grpForm.unico}`, {
                    method: "PUT", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ growertype: grpForm.growertype }),
                });
                const d = await res.json();
                if (!d.success) throw new Error(d.error || "Update failed");
                toast.success("Group updated.");
            }
            qc.invalidateQueries({ queryKey: ["vendors-groups"] });
            qc.invalidateQueries({ queryKey: ["vendors-lookups"] });
            setGrpForm({ unico: "", growertype: "" });
            setGrpMode("add");
            setSelGrpUq(null);
        } catch (e: any) {
            setGrpError(e.message);
        } finally {
            setGrpSaving(false);
        }
    };

    const handleDeleteGroup = async () => {
        if (!selGrpUq) { toast.error("Select a group first."); return; }
        const rec = (groupsList as any[]).find(r => t(r.unico) === selGrpUq);
        const name = t(rec?.growertype || selGrpUq);
        setDeleteModal({ type: "group", id: selGrpUq, name });
    };

    const confirmDeleteGroup = async () => {
        if (!deleteModal || deleteModal.type !== "group") return;
        setSaving(true);
        try {
            const res = await fetch(`/api/vendors/groups/${deleteModal.id}`, { method: "DELETE" });
            const d = await res.json();
            if (!d.success) throw new Error(d.error || "Delete failed");
            toast.success("Group deleted.");
            setSelGrpUq(null);
            setGrpForm({ unico: "", growertype: "" });
            setGrpMode("add");
            setDeleteModal(null);
            qc.invalidateQueries({ queryKey: ["vendors-groups"] });
            qc.invalidateQueries({ queryKey: ["vendors-lookups"] });
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setSaving(false);
        }
    };

    // ── Form field helper ─────────────────────────────────────────────────────
    const setField = (key: string, val: any) => setForm((p: any) => ({ ...p, [key]: val }));

    // ── Loading guard ─────────────────────────────────────────────────────────
    if (status === "loading") return null;
    if (status === "unauthenticated") { router.push("/login"); return null; }

    const selRec  = (vendorsList as any[]).find(r => t(r.UNICO) === selectedUq);
    const selName = selRec ? t(selRec.GROWER) : "";

    const TABS: { key: ActiveTab; label: string }[] = [
        { key: "statement",  label: "Statement" },
        { key: "documents",  label: "Documents" },
        { key: "classes",    label: "Class" },
    ];

    const fInput = "fos-input h-8 text-xs";
    const fLabel = "text-[10px] font-black text-gray-500 uppercase tracking-wider";
    return (
        <div className="flex flex-col h-[100dvh] bg-[#f4f6f8] overflow-hidden font-sans text-[#333]">
            <AppHeader title="Vendors" />

            <div className="flex-1 overflow-hidden p-2 flex flex-col min-h-0">
                <PanelGrid
                    icon={Building2}
                    title="Vendors"
                    recordCount={`${vendorsList.length} / ${totalVendors}`}
                    onScroll={handleVendorScroll}
                    refreshing={loadingList}
                    onRefresh={refetchList}
                    searchValue={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search vendors..."
                    menuItems={[
                        { label: "Add",     icon: Plus,        color: "green", onClick: handleAdd,    disabled: !perms.canCreate },
                        { label: "Edit",    icon: Pencil,      color: "orange", onClick: handleEdit,  disabled: !selectedUq || !perms.canEdit },
                        { label: "Delete",  icon: Trash2,      color: "red",   onClick: handleDelete, disabled: !selectedUq || !perms.canDelete },
                        { separator: true } as any,
                        { label: "Groups",  icon: Building2,   color: "blue",  onClick: () => { setGrpForm({ unico: "", growertype: "" }); setGrpMode("add"); setSelGrpUq(null); setGrpError(null); setGrpModal(true); } },
                        { label: "CSV",     icon: Download,    color: "gray",  onClick: () => {
                            if (!filteredList.length) return;
                            const headers = ["Code","Vendor","FOB","SalesRep","City","Country","Active","Phone","Fax","Email"];
                            const rows2 = filteredList.map((r: any) => [
                                t(r.FARM), t(r.GROWER), t(r.FOB), t(r.SALES_PERSON), t(r.CITY), t(r.COUNTRY),
                                r.ACTIVE ? "Yes" : "No", t(r.PHONE_1), t(r.FAX_1), t(r.EMAIL_1)
                            ]);
                            const csv = [headers, ...rows2].map(row => row.map((v: string) => `"${v.replace(/"/g,'""')}"`).join(",")).join("\n");
                            const blob = new Blob([csv], { type: "text/csv" });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a"); a.href = url; a.download = "vendors.csv"; a.click();
                            URL.revokeObjectURL(url);
                        }},
                    ]}
                    headerRight={
                        <div className="flex items-center gap-1.5 h-full px-2 overflow-x-auto scrollbar-none shrink-0">
                            <button onClick={() => setStmtModal(true)} disabled={!selectedUq}
                                className="flex items-center gap-1.5 h-6 px-2.5 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded text-[10px] font-black uppercase tracking-wider transition-colors whitespace-nowrap">
                                <FileText size={12} /> Statement
                            </button>
                            <button onClick={() => setPendingModal(true)} disabled={!selectedUq}
                                className="flex items-center gap-1.5 h-6 px-2.5 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded text-[10px] font-black uppercase tracking-wider transition-colors whitespace-nowrap">
                                <AlertCircle size={12} /> Pending Invoices
                            </button>
                            <button onClick={() => setClassesModal(true)} disabled={!selectedUq}
                                className="flex items-center gap-1.5 h-6 px-2.5 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded text-[10px] font-black uppercase tracking-wider transition-colors whitespace-nowrap">
                                <Settings2 size={12} /> Classes
                            </button>
                            <button onClick={() => setWsModal(true)} disabled={!selectedUq}
                                className="flex items-center gap-1.5 h-6 px-2.5 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded text-[10px] font-black uppercase tracking-wider transition-colors whitespace-nowrap">
                                <Globe size={12} /> Web
                            </button>
                        </div>
                    }
                >
                    <PanelGridTable>
                        <PanelGridThead>
                                <PanelGridTh className="w-6">{""}</PanelGridTh>
                                <PanelGridTh>Code</PanelGridTh>
                                <PanelGridTh>Vendor</PanelGridTh>
                                <PanelGridTh>Company</PanelGridTh>
                                <PanelGridTh>Address</PanelGridTh>
                                <PanelGridTh>City</PanelGridTh>
                                <PanelGridTh>Country</PanelGridTh>
                                <PanelGridTh className="text-center">Act.</PanelGridTh>
                        </PanelGridThead>
                        <PanelGridTbody>
                            {vendorsList.length === 0 && !loadingList ? (
                                <tr>
                                    <PanelGridTd colSpan={8} className="text-center italic text-gray-400">
                                        {search ? "No results" : "No vendors found"}
                                    </PanelGridTd>
                                </tr>
                            ) : vendorsList.map((row: any, i: number) => {
                                const uq = t(row.UNICO);
                                const selected = selectedUq === uq;
                                const isExp = expandedVendorUnico === uq;

                                return (
                                    <Fragment key={uq || i}>
                                        <PanelGridTr selected={selected} onClick={() => handleSelectRow(row)}>
                                            <PanelGridTd className="w-6 pl-1 pr-0">
                                                <button 
                                                    className="p-0.5 rounded hover:bg-gray-200 transition-colors"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (isExp) {
                                                            setExpandedVendorUnico(null);
                                                        } else {
                                                            handleSelectRow(row);
                                                            setExpandedVendorUnico(uq);
                                                        }
                                                    }}
                                                >
                                                    {isExp ? <Minus size={11} className="text-[#FB7506]" /> : <Plus size={11} className="text-gray-400" />}
                                                </button>
                                            </PanelGridTd>
                                            <PanelGridTd className="font-mono">{t(row.FARM)}</PanelGridTd>
                                            <PanelGridTd className="font-bold">{t(row.GROWER)}</PanelGridTd>
                                            <PanelGridTd>{t(row.SOURCE)}</PanelGridTd>
                                            <PanelGridTd>{t(row.OFFICEADD1)}</PanelGridTd>
                                            <PanelGridTd>{t(row.CITY)}</PanelGridTd>
                                            <PanelGridTd>{t(row.COUNTRY)}</PanelGridTd>
                                            <PanelGridTd className="text-center">
                                                {Boolean(row.ACTIVE) ? <span className="text-green-600 font-black text-[10px]">YES</span> : <span className="text-gray-400 text-[10px]">—</span>}
                                            </PanelGridTd>
                                        </PanelGridTr>
                                        
                                        {isExp && (
                                            <tr>
                                                <td colSpan={8} className="p-0 border-b border-gray-200">
                                                    <div className="pl-6 pr-2 py-2 bg-gray-100">
                                                        <PanelGrid
                                                            title="Documents"
                                                            icon={FileText}
                                                            recordCount={(docsList as any[]).length}
                                                            refreshing={loadingDocs}
                                                            menuItems={[
                                                                { label: "Add Document", icon: Plus, color: "green", onClick: handleOpenAddDoc },
                                                                { label: "Edit Document", icon: Pencil, color: "orange", onClick: handleOpenEditDoc, disabled: !selDocUq },
                                                                { label: "Delete Document", icon: Trash2, color: "red", onClick: handleDeleteDoc, disabled: !selDocUq },
                                                            ]}
                                                        >
                                                            <PanelGridTable>
                                                                <PanelGridThead>
                                                                        <PanelGridTh>Document</PanelGridTh>
                                                                        <PanelGridTh>Date From</PanelGridTh>
                                                                        <PanelGridTh>Date To</PanelGridTh>
                                                                </PanelGridThead>
                                                                <PanelGridTbody>
                                                                    {loadingDocs ? (
                                                                        <tr><td colSpan={3} className="p-4 text-center"><RefreshCcw size={14} className="animate-spin mx-auto text-gray-400" /></td></tr>
                                                                    ) : (docsList as any[]).length === 0 ? (
                                                                        <tr><td colSpan={3} className="p-4 text-center text-gray-300 italic text-[10px]">No documents found</td></tr>
                                                                    ) : (docsList as any[]).map((doc: any, j: number) => {
                                                                        const duq = t(doc.UNICO);
                                                                        const dsel = selDocUq === duq;
                                                                        return (
                                                                            <PanelGridTr key={j} selected={dsel} onClick={() => setSelDocUq(dsel ? null : duq)}>
                                                                                <PanelGridTd className="max-w-[200px] truncate font-semibold text-gray-700">{t(doc.DOCUMENT)}</PanelGridTd>
                                                                                <PanelGridTd>{fmtDate(doc.DATE_FROM ?? doc.LDFROM)}</PanelGridTd>
                                                                                <PanelGridTd>{fmtDate(doc.DATE_TO ?? doc.LDTO)}</PanelGridTd>
                                                                            </PanelGridTr>
                                                                        );
                                                                    })}
                                                                </PanelGridTbody>
                                                            </PanelGridTable>
                                                        </PanelGrid>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                );
                            })}
                        </PanelGridTbody>
                    </PanelGridTable>
                </PanelGrid>
            </div>
            
            <AppFooter />

            {/* ─── Statement Modal ─────────────────────────────────────────────────── */}
            {stmtModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setStmtModal(false)}>
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden"
                        onClick={e => e.stopPropagation()}>
                        <div className="h-10 bg-[#374151] flex items-center justify-between px-3 shrink-0 rounded-t-lg">
                            <div className="flex items-center gap-2">
                                <FileText size={16} className="text-[#FB7506]" />
                                <span className="font-black text-[11px] uppercase tracking-widest text-white">
                                Statement — {(vendorsList as any[]).find((r: any) => t(r.UNICO) === selectedUq)?.GROWER}
                            </span>
                            </div>
                            <button onClick={() => setStmtModal(false)} className="text-gray-400 hover:text-white transition-colors"><X size={16} /></button>
                        </div>
                        
                        <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex flex-wrap items-center gap-2 shrink-0">
                            <Calendar size={14} className="text-gray-400" />
                            <div className="flex items-center gap-1">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wide">From</label>
                                <input type="date" value={stmtFrom} onChange={e => setStmtFrom(e.target.value)}
                                    className="h-7 text-xs border border-gray-200 rounded px-1.5 outline-none focus:ring-1 focus:ring-[#FB7506]" />
                            </div>
                            <div className="flex items-center gap-1">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wide">To</label>
                                <input type="date" value={stmtTo} onChange={e => setStmtTo(e.target.value)}
                                    className="h-7 text-xs border border-gray-200 rounded px-1.5 outline-none focus:ring-1 focus:ring-[#FB7506]" />
                            </div>
                            <button
                                onClick={() => setStmtKey(k => k + 1)}
                                className="flex items-center gap-1 px-2 py-1 bg-[#FB7506] hover:bg-orange-600 text-white rounded text-[10px] font-black uppercase tracking-wide transition-colors">
                                {loadingStmt ? <RefreshCcw size={12} className="animate-spin" /> : <RefreshCcw size={12} />}
                                Load
                            </button>
                            {loadingStmt && <RefreshCcw size={12} className="animate-spin text-gray-400" />}
                        </div>

                        <div className="flex-1 overflow-auto flex flex-col min-h-0 bg-white">
                            <table className="min-w-full text-left">
                                <thead className="bg-gray-100 border-b border-gray-200 sticky top-0 z-10">
                                    <tr>
                                        {["Invoice", "PO", "Inv.Date", "Amount", "Payments", "Credits", "Debits", "Balance", "Due Date", "Accum.Bal"].map(h => (
                                            <th key={h} className="px-2 py-1.5 font-black text-[10px] text-gray-600 uppercase tracking-wide whitespace-nowrap border-r border-gray-200 last:border-r-0">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 text-xs">
                                    {loadingStmt ? (
                                        <tr><td colSpan={10} className="p-4 text-center"><RefreshCcw size={14} className="animate-spin mx-auto text-gray-400" /></td></tr>
                                    ) : stmtRows.length === 0 ? (
                                        <tr><td colSpan={10} className="p-6 text-center text-gray-300 italic">No statement records</td></tr>
                                    ) : stmtRows.map((row: any, i: number) => (
                                        <tr key={i} className="hover:bg-gray-50">
                                            <td className="px-2 py-1.5 border-r border-gray-50 font-mono truncate max-w-[90px]">{t(row.INVOICE_NO ?? "")}</td>
                                            <td className="px-2 py-1.5 border-r border-gray-50 truncate max-w-[70px]">{row.PORDER_NO ? t(row.PORDER_NO) : ""}</td>
                                            <td className="px-2 py-1.5 border-r border-gray-50 whitespace-nowrap">{fmtDate(row.DATE_ORDER ?? row.INVOICE_DATE ?? "")}</td>
                                            <td className="px-2 py-1.5 border-r border-gray-50 text-right font-mono">{fmt(row.AMMOUNT ?? 0)}</td>
                                            <td className="px-2 py-1.5 border-r border-gray-50 text-right font-mono">{fmt(row.PAYMENTS ?? 0)}</td>
                                            <td className="px-2 py-1.5 border-r border-gray-50 text-right font-mono">{fmt(row.CREDITS ?? 0)}</td>
                                            <td className="px-2 py-1.5 border-r border-gray-50 text-right font-mono">{fmt(row.DEBITS ?? 0)}</td>
                                            <td className={cn("px-2 py-1.5 border-r border-gray-50 text-right font-mono font-bold",
                                                parseFloat(row.TOTAL_BALANCE ?? 0) > 0 ? "text-red-600" : "text-green-700")}>
                                                {fmt(row.TOTAL_BALANCE ?? 0)}
                                            </td>
                                            <td className="px-2 py-1.5 border-r border-gray-50 whitespace-nowrap">{t(row.DUE_DATE ?? "")}</td>
                                            <td className={cn("px-2 py-1.5 text-right font-mono font-bold",
                                                parseFloat(row.ACCUMULATED ?? 0) > 0 ? "text-red-600" : "text-green-700")}>
                                                {fmt(row.ACCUMULATED ?? 0)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Pending Invoices Modal ────────────────────────────────────────── */}
            {pendingModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setPendingModal(false)}>
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[70vh] flex flex-col overflow-hidden"
                        onClick={e => e.stopPropagation()}>
                        <div className="h-10 bg-[#374151] flex items-center justify-between px-3 shrink-0 rounded-t-lg">
                            <div className="flex items-center gap-2">
                                <AlertCircle size={16} className="text-[#FB7506]" />
                                <span className="font-black text-[11px] uppercase tracking-widest text-white">
                                Pending Invoices — {(vendorsList as any[]).find((r: any) => t(r.UNICO) === selectedUq)?.GROWER}
                            </span>
                            </div>
                            <button onClick={() => setPendingModal(false)} className="text-gray-400 hover:text-white transition-colors"><X size={16} /></button>
                        </div>
                        <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex items-center gap-2 shrink-0">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-wide">Showing pending invoices up to today</span>
                            {loadingStmt && <RefreshCcw size={12} className="animate-spin text-gray-400 ml-auto" />}
                        </div>
                        <div className="flex-1 overflow-auto bg-white">
                            <table className="min-w-full text-left">
                                <thead className="bg-gray-100 border-b border-gray-200 sticky top-0 z-10">
                                    <tr>
                                        {["Invoice", "Inv.Date", "Amount", "Payments", "Balance"].map(h => (
                                            <th key={h} className="px-2 py-1.5 font-black text-[10px] text-gray-600 uppercase tracking-wide whitespace-nowrap border-r border-gray-200 last:border-r-0">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 text-xs">
                                    {loadingStmt ? (
                                        <tr><td colSpan={5} className="p-4 text-center"><RefreshCcw size={14} className="animate-spin mx-auto text-gray-400" /></td></tr>
                                    ) : pendingRows.length === 0 ? (
                                        <tr><td colSpan={5} className="p-6 text-center text-gray-300 italic">No pending invoices</td></tr>
                                    ) : pendingRows.map((row: any, i: number) => (
                                        <tr key={i} className="hover:bg-gray-50">
                                            <td className="px-2 py-1.5 border-r border-gray-50 font-mono truncate max-w-[90px]">{t(row.INVOICE_NO ?? "")}</td>
                                            <td className="px-2 py-1.5 border-r border-gray-50 whitespace-nowrap">{fmtDate(row.DATE_ORDER ?? row.INVOICE_DATE ?? "")}</td>
                                            <td className="px-2 py-1.5 border-r border-gray-50 text-right font-mono">{fmt(row.AMMOUNT ?? 0)}</td>
                                            <td className="px-2 py-1.5 border-r border-gray-50 text-right font-mono">{fmt(row.PAYMENTS ?? 0)}</td>
                                            <td className={cn("px-2 py-1.5 text-right font-mono font-bold", parseFloat(row.TOTAL_BALANCE ?? 0) > 0 ? "text-red-600" : "text-green-700")}>{fmt(row.TOTAL_BALANCE ?? 0)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Classes Modal ──────────────────────────────────────────────────── */}
            {classesModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setClassesModal(false)}>
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[70vh] flex flex-col overflow-hidden"
                        onClick={e => e.stopPropagation()}>
                        <div className="h-10 bg-[#374151] flex items-center justify-between px-3 shrink-0 rounded-t-lg">
                            <div className="flex items-center gap-2">
                                <Settings2 size={16} className="text-[#FB7506]" />
                                <span className="font-black text-[11px] uppercase tracking-widest text-white">
                                Vendor Classes — {(vendorsList as any[]).find((r: any) => t(r.UNICO) === selectedUq)?.GROWER}
                            </span>
                            </div>
                            <button onClick={() => setClassesModal(false)} className="text-gray-400 hover:text-white transition-colors"><X size={16} /></button>
                        </div>
                        <div className="flex-1 min-h-0 p-2 overflow-hidden bg-white">
                            <DualPanel
                                assignedRows={assignedClasses as any[]}
                                availableRows={availableClasses as any[]}
                                assignedCols={[{ key: "CLASE", label: "Class" }]}
                                availableCols={[{ key: "CLASE", label: "Class" }]}
                                onAdd={handleAddClass}
                                onRemove={handleRemoveClass}
                                loading={loadingClassA || loadingClassB}
                                assignedKey="UNICO"
                                availableKey="UNICO"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Vendor Setup Modal ──────────────────────────────────────────────── */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
                    onClick={() => setModalOpen(false)}>
                    <div className="bg-white rounded-t-2xl sm:rounded-lg shadow-2xl w-full sm:max-w-5xl sm:max-h-[80vh] flex flex-col overflow-hidden"
                        onClick={e => e.stopPropagation()}>

                        {/* Modal header */}
                        <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-3 rounded-t-lg shrink-0">
                            <div className="flex items-center gap-2">
                                <Building2 size={16} className="text-[#FB7506]" />
                                <span className="font-black text-[10px] text-white uppercase tracking-widest">
                                    {modalMode === "add" ? "New Vendor" : `Edit: ${t(form.grower)}`}
                                </span>
                                {formError && (
                                    <span className="flex items-center gap-1 text-amber-400 text-[10px] font-bold ml-2 truncate">
                                        <AlertCircle size={12} />{formError}
                                    </span>
                                )}
                            </div>
                            <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        {/* Modal inner tabs */}
                        <div className="flex border-b border-gray-200 px-2 pt-2 bg-gray-50 shrink-0 overflow-x-auto scrollbar-none">
                            {([
                                { key: "main",     label: "Main Info" },
                                { key: "contacts", label: "Contacts" },
                                { key: "settings", label: "Settings" },
                                { key: "qb",       label: "QB / Charges" },
                            ] as { key: ModalVendorTab; label: string }[]).map(tab => (
                                <button key={tab.key} onClick={() => setModalTab(tab.key)}
                                    className={cn(
                                        "px-4 py-2 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors whitespace-nowrap shrink-0",
                                        modalTab === tab.key ? "border-[#FB7506] text-[#FB7506] bg-white" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
                                    )}>
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Modal scrollable content */}
                        <div className="flex-1 overflow-y-auto p-3 md:p-4 min-h-0">

                            {/* ── Tab 1: Main Info ── */}
                            {modalTab === "main" && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-2 text-xs">
                                    <div className="col-span-2 sm:col-span-2 lg:col-span-3 flex flex-col gap-0.5">
                                        <label className={fLabel}>Grower / Name *</label>
                                        <input value={t(form.grower)} onChange={e => setField("grower", e.target.value)} className={fInput} />
                                    </div>
                                    <div className="flex flex-col gap-0.5 items-start">
                                        <label className={fLabel}>Active</label>
                                        <div className="flex items-center gap-2 h-8">
                                            <input type="checkbox" checked={Boolean(form.active)} onChange={e => setField("active", e.target.checked)} className="w-5 h-5 accent-[#FB7506]" />
                                        </div>
                                    </div>
                                    <div className="col-span-2 flex flex-col gap-0.5">
                                        <label className={fLabel}>Farm</label>
                                        <input value={t(form.farm)} onChange={e => setField("farm", e.target.value)} className={fInput} />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <label className={fLabel}>Source / Origin</label>
                                        <input value={t(form.source)} onChange={e => setField("source", e.target.value)} className={fInput} />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <label className={fLabel}>NIT / RUC</label>
                                        <input value={t(form.nit_ruc)} onChange={e => setField("nit_ruc", e.target.value)} className={fInput} />
                                    </div>
                                    <div className="col-span-2 flex flex-col gap-0.5">
                                        <label className={fLabel}>Office Address 1</label>
                                        <input value={t(form.officeadd1)} onChange={e => setField("officeadd1", e.target.value)} className={fInput} />
                                    </div>
                                    <div className="col-span-2 flex flex-col gap-0.5">
                                        <label className={fLabel}>Office Address 2</label>
                                        <input value={t(form.officeadd2)} onChange={e => setField("officeadd2", e.target.value)} className={fInput} />
                                    </div>
                                    <div className="col-span-2 flex flex-col gap-0.5">
                                        <label className={fLabel}>Farm Address 1</label>
                                        <input value={t(form.farm_add1)} onChange={e => setField("farm_add1", e.target.value)} className={fInput} />
                                    </div>
                                    <div className="col-span-2 flex flex-col gap-0.5">
                                        <label className={fLabel}>Farm Address 2</label>
                                        <input value={t(form.farm_add2)} onChange={e => setField("farm_add2", e.target.value)} className={fInput} />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <label className={fLabel}>FOB</label>
                                        <input value={t(form.fob)} onChange={e => setField("fob", e.target.value)} className={fInput} />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <label className={fLabel}>City</label>
                                        <input value={t(form.city)} onChange={e => setField("city", e.target.value)} className={fInput} />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <label className={fLabel}>Country</label>
                                        <input value={t(form.country)} onChange={e => setField("country", e.target.value)} className={fInput} />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <label className={fLabel}>Terms</label>
                                        <select value={t(form.terms_uq)} onChange={e => setField("terms_uq", e.target.value)} className={fInput}>
                                            <option value="">-- None --</option>
                                            {terms.map((r: any) => (
                                                <option key={t(r.UNICO)} value={t(r.UNICO)}>
                                                    {t(r.CONDITION ?? r.TERMS ?? r.DESCRIPTION ?? r.UNICO)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <label className={fLabel}>Agency</label>
                                        <select value={t(form.agency_uq)} onChange={e => setField("agency_uq", e.target.value)} className={fInput}>
                                            <option value="">-- None --</option>
                                            {agencies.filter((r: any) => t(r.UNICO) !== "%").map((r: any) => (
                                                <option key={t(r.UNICO)} value={t(r.UNICO)}>
                                                    {t(r.AGENCY ?? r.DESCRIPTION ?? r.UNICO)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <label className={fLabel}>Group / Type</label>
                                        <select value={t(form.group_uq)} onChange={e => setField("group_uq", e.target.value)} className={fInput}>
                                            <option value="">-- None --</option>
                                            {groups.map((r: any) => (
                                                <option key={t(r.UNICO)} value={t(r.UNICO)}>
                                                    {t(r.GROWERTYPE ?? r.DESCRIPTION ?? r.UNICO)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* ── Tab 2: Contacts ── */}
                            {modalTab === "contacts" && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-2 text-xs">
                                    <div className="flex flex-col gap-0.5">
                                        <label className={fLabel}>Phone 1</label>
                                        <input value={t(form.phone_1)} onChange={e => setField("phone_1", e.target.value)} className={fInput} />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <label className={fLabel}>Phone 2</label>
                                        <input value={t(form.phone_2)} onChange={e => setField("phone_2", e.target.value)} className={fInput} />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <label className={fLabel}>Fax 1</label>
                                        <input value={t(form.fax_1)} onChange={e => setField("fax_1", e.target.value)} className={fInput} />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <label className={fLabel}>Fax 2</label>
                                        <input value={t(form.fax_2)} onChange={e => setField("fax_2", e.target.value)} className={fInput} />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <label className={fLabel}>Cellular</label>
                                        <input value={t(form.celular)} onChange={e => setField("celular", e.target.value)} className={fInput} />
                                    </div>
                                    <div className="col-span-2 sm:col-span-2 flex flex-col gap-0.5">
                                        <label className={fLabel}>Email 1</label>
                                        <input type="email" value={t(form.email_1)} onChange={e => setField("email_1", e.target.value)} className={fInput} />
                                    </div>
                                    <div className="col-span-2 sm:col-span-2 flex flex-col gap-0.5">
                                        <label className={fLabel}>Email 2</label>
                                        <input type="email" value={t(form.email_2)} onChange={e => setField("email_2", e.target.value)} className={fInput} />
                                    </div>
                                    <div className="col-span-2 flex flex-col gap-0.5">
                                        <label className={fLabel}>MSN / Yahoo / Skype</label>
                                        <input value={t(form.msn_yahoo)} onChange={e => setField("msn_yahoo", e.target.value)} className={fInput} />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <label className={fLabel}>Manager</label>
                                        <input value={t(form.manager)} onChange={e => setField("manager", e.target.value)} className={fInput} />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <label className={fLabel}>Secretary</label>
                                        <input value={t(form.secretary)} onChange={e => setField("secretary", e.target.value)} className={fInput} />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <label className={fLabel}>Production Contact</label>
                                        <input value={t(form.production)} onChange={e => setField("production", e.target.value)} className={fInput} />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <label className={fLabel}>Salesman (Internal)</label>
                                        <input value={t(form.salesman)} onChange={e => setField("salesman", e.target.value)} className={fInput} />
                                    </div>
                                </div>
                            )}

                            {/* ── Tab 3: Settings ── */}
                            {modalTab === "settings" && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-2 text-xs">
                                        <div className="flex flex-col gap-0.5">
                                            <label className={fLabel}>EDI Code</label>
                                            <input type="number" value={form.old_code} onChange={e => setField("old_code", parseInt(e.target.value) || 0)} className={fInput + " text-right"} />
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <label className={fLabel}>Ship Days</label>
                                            <input type="number" value={form.ship_days} onChange={e => setField("ship_days", parseInt(e.target.value) || 0)} className={fInput + " text-right"} />
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <label className={fLabel}>Bank</label>
                                            <input value={t(form.bank)} onChange={e => setField("bank", e.target.value)} className={fInput} />
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <label className={fLabel}>Bank Account</label>
                                            <input value={t(form.bank_account)} onChange={e => setField("bank_account", e.target.value)} className={fInput} />
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <label className={fLabel}>WHouse Farm ID</label>
                                            <input value={t(form.whouse_farm_id)} onChange={e => setField("whouse_farm_id", e.target.value)} className={fInput} />
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <label className={fLabel}>Web Password (Clave)</label>
                                            <input type="password" value={t(form.clave)} onChange={e => setField("clave", e.target.value)} className={fInput} />
                                        </div>
                                    </div>

                                    {/* Checkboxes */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-1 gap-y-0 border-t border-gray-100 pt-2">
                                        {[
                                            { key: "international",       label: "International" },
                                            { key: "flower_system",       label: "Flower System" },
                                            { key: "send_file_warehouse", label: "Send File to Warehouse" },
                                            { key: "special_contributor", label: "Special Contributor" },
                                            { key: "change_password",     label: "Change Password" },
                                            { key: "chk_boxes",           label: "Check Boxes" },
                                            { key: "chk_stems",           label: "Check Stems" },
                                            { key: "auto_packing",        label: "Auto Packing" },
                                        ].map(f => (
                                            <label key={f.key} className="flex items-center gap-1.5 cursor-pointer py-1 px-1 rounded hover:bg-gray-50">
                                                <input type="checkbox" checked={Boolean(form[f.key])}
                                                    onChange={e => setField(f.key, e.target.checked)}
                                                    className="w-4 h-4 accent-[#FB7506] shrink-0" />
                                                <span className="text-[11px] font-semibold text-gray-700 leading-tight">{f.label}</span>
                                            </label>
                                        ))}
                                    </div>

                                    {/* Text areas */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-gray-100 pt-2">
                                        <div className="flex flex-col gap-0.5">
                                            <label className={fLabel}>Invoice Text</label>
                                            <textarea value={t(form.text_invoice)} onChange={e => setField("text_invoice", e.target.value)}
                                                rows={3} className="fos-input text-xs resize-none py-1" />
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <label className={fLabel}>Packing Text</label>
                                            <textarea value={t(form.text_packing)} onChange={e => setField("text_packing", e.target.value)}
                                                rows={3} className="fos-input text-xs resize-none py-1" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── Tab 4: QB / Charges ── */}
                            {modalTab === "qb" && (
                                <div className="space-y-4">
                                    {/* Checkboxes */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-1 gap-y-0">
                                        {[
                                            { key: "qb_flower",      label: "QB Flower" },
                                            { key: "qb_freight",     label: "QB Freight" },
                                            { key: "apply_freight",  label: "Apply Freight" },
                                            { key: "flower_cost",    label: "Flower Cost" },
                                            { key: "duties",         label: "Duties" },
                                            { key: "broker",         label: "Broker" },
                                        ].map(f => (
                                            <label key={f.key} className="flex items-center gap-1.5 cursor-pointer py-1 px-1 rounded hover:bg-gray-50">
                                                <input type="checkbox" checked={Boolean(form[f.key])}
                                                    onChange={e => setField(f.key, e.target.checked)}
                                                    className="w-4 h-4 accent-[#FB7506] shrink-0" />
                                                <span className="text-[11px] font-semibold text-gray-700 leading-tight">{f.label}</span>
                                            </label>
                                        ))}
                                    </div>

                                    {/* Numeric fields */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-2 border-t border-gray-100 pt-2 text-xs">
                                        {[
                                            { key: "commission",    label: "Commission %",    step: "0.01" },
                                            { key: "fuel_discount", label: "Fuel Discount %", step: "0.01" },
                                            { key: "sales_factor",  label: "Sales Factor",    step: "0.0001" },
                                            { key: "handling",      label: "Handling",         step: "0.01" },
                                            { key: "ocharges",      label: "Other Charges",   step: "0.01" },
                                            { key: "pack_disc",     label: "Pack Discount %", step: "0.01" },
                                            { key: "pack_return",   label: "Pack Return %",   step: "0.01" },
                                        ].map(f => (
                                            <div key={f.key} className="flex flex-col gap-0.5">
                                                <label className={fLabel}>{f.label}</label>
                                                <input type="number" step={f.step} value={form[f.key] ?? 0}
                                                    onChange={e => setField(f.key, parseFloat(e.target.value) || 0)}
                                                    className={fInput + " text-right"} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal footer */}
                        <div className="flex justify-end gap-2 px-4 py-3 bg-gray-50 border-t shrink-0">
                            <button onClick={() => setModalOpen(false)}
                                className="px-4 py-2 rounded border border-gray-200 text-xs font-black uppercase text-gray-600 hover:bg-gray-100 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleSave} disabled={saving}
                                className="flex items-center gap-2 px-5 py-2 rounded bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white text-xs font-black uppercase tracking-wider transition-all">
                                {saving ? <RefreshCcw size={12} className="animate-spin" /> : <Save size={12} />}
                                {saving ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Document Modal ────────────────────────────────────────────────────── */}
            {docModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setDocModal(false)}>
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-md flex flex-col overflow-hidden"
                        onClick={e => e.stopPropagation()}>
                        <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 rounded-t-lg shrink-0">
                            <div className="flex items-center gap-2">
                                <FileText size={16} className="text-[#FB7506]" />
                                <span className="font-black text-[10px] text-white uppercase tracking-widest">
                                    {docMode === "add" ? "Add Document" : "Edit Document"}
                                </span>
                            </div>
                            <button onClick={() => setDocModal(false)} className="text-gray-400 hover:text-white transition-colors"><X size={16} /></button>
                        </div>

                        <div className="p-4 space-y-3">
                            {docError && (
                                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded p-2">
                                    <AlertCircle size={14} className="text-red-500 shrink-0" />
                                    <span className="text-xs text-red-600">{docError}</span>
                                </div>
                            )}
                            <div className="flex flex-col gap-0.5">
                                <label className={fLabel}>Document Name *</label>
                                <input value={t(docForm.document)} onChange={e => setDocForm((p: any) => ({ ...p, document: e.target.value }))}
                                    className={fInput} placeholder="e.g. Phytosanitary Certificate" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-0.5">
                                    <label className={fLabel}>Date From</label>
                                    <input type="date" value={docForm.date_from}
                                        onChange={e => setDocForm((p: any) => ({ ...p, date_from: e.target.value }))}
                                        className={fInput} />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <label className={fLabel}>Date To</label>
                                    <input type="date" value={docForm.date_to}
                                        onChange={e => setDocForm((p: any) => ({ ...p, date_to: e.target.value }))}
                                        className={fInput} />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 px-4 py-3 bg-gray-50 border-t shrink-0">
                            <button onClick={() => setDocModal(false)}
                                className="px-4 py-2 rounded border border-gray-200 text-xs font-black uppercase text-gray-600 hover:bg-gray-100 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleSaveDoc} disabled={docSaving}
                                className="flex items-center gap-2 px-5 py-2 rounded bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white text-xs font-black uppercase tracking-wider transition-all">
                                {docSaving ? <RefreshCcw size={12} className="animate-spin" /> : <Save size={12} />}
                                {docSaving ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Groups Modal ─────────────────────────────────────────────────────── */}
            {/* ─── Web Settings Modal ─────────────────────────────────────────── */}
            {wsModal && selectedUq && (() => {
                const rec = (vendorsList as any[]).find((r: any) => t(r.UNICO) === selectedUq) ?? {};
                return (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setWsModal(false)}>
                        <div className="bg-white rounded-lg shadow-2xl w-full max-w-md flex flex-col overflow-hidden"
                            onClick={e => e.stopPropagation()}>
                            <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 rounded-t-lg shrink-0">
                                <div className="flex items-center gap-2">
                                    <Globe size={16} className="text-[#FB7506]" />
                                    <span className="font-black text-[10px] text-white uppercase tracking-widest">
                                        Web Settings — {t(rec.GROWER ?? "")}
                                    </span>
                                </div>
                                <button onClick={() => setWsModal(false)} className="text-gray-400 hover:text-white transition-colors"><X size={16} /></button>
                            </div>
                            <div className="p-4 space-y-3 text-xs overflow-y-auto">
                                <div className="bg-gray-50 rounded p-3 border border-gray-100 space-y-2">
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { label: "Flower System",       field: "FLOWER_SYSTEM" },
                                            { label: "Send File Warehouse", field: "SEND_FILE_WAREHOUSE" },
                                            { label: "Web Confirm Boxes",   field: "WEB_CONFIRM_BOXES" },
                                            { label: "Web Confirm Stems",   field: "WEB_CONFIRM_STEMS" },
                                            { label: "Auto Packing",        field: "AUTO_PACKING" },
                                            { label: "Special Contributor", field: "SPECIAL_CONTRIBUTOR" },
                                            { label: "International",       field: "INTERNATIONAL" },
                                        ].map(({ label, field }) => (
                                            <div key={field} className="flex items-center justify-between gap-2">
                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">{label}</span>
                                                <span className={cn("text-[10px] font-black", rec[field] ? "text-green-600" : "text-gray-300")}>
                                                    {rec[field] ? "YES" : "NO"}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">WH Farm ID</span>
                                        <span className="font-mono text-gray-800 text-xs">{t(rec.WHOUSE_FARM_ID ?? "") || "—"}</span>
                                    </div>
                                    <div className="flex flex-col gap-0.5 mt-1">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Password</span>
                                        <span className="font-mono text-gray-800 text-xs">{t(rec.CLAVE ?? "") || "—"}</span>
                                    </div>
                                </div>
                                <p className="text-[10px] text-gray-400 italic">To edit these settings, use the vendor Setup form (Edit button).</p>
                            </div>
                            <div className="flex justify-end px-4 py-3 bg-gray-50 border-t shrink-0">
                                <button onClick={() => setWsModal(false)}
                                    className="px-4 py-2 rounded border border-gray-200 text-xs font-black uppercase text-gray-600 hover:bg-gray-100 transition-colors">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {grpModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setGrpModal(false)}>
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden"
                        onClick={e => e.stopPropagation()}>
                        <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 rounded-t-lg shrink-0">
                            <div className="flex items-center gap-2">
                                <Building2 size={16} className="text-[#FB7506]" />
                                <span className="font-black text-[10px] text-white uppercase tracking-widest">Vendor Groups / Types</span>
                            </div>
                            <button onClick={() => setGrpModal(false)} className="text-gray-400 hover:text-white transition-colors"><X size={16} /></button>
                        </div>

                        {/* Add / Edit form */}
                        <div className="p-3 border-b border-gray-200 shrink-0">
                            {grpError && (
                                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded p-2 mb-2">
                                    <AlertCircle size={14} className="text-red-500 shrink-0" />
                                    <span className="text-xs text-red-600">{grpError}</span>
                                </div>
                            )}
                            <div className="flex gap-2 items-end">
                                <div className="flex-1 flex flex-col gap-0.5">
                                    <label className={fLabel}>{grpMode === "add" ? "New Group Name" : "Edit Group Name"}</label>
                                    <input value={grpForm.growertype} onChange={e => setGrpForm(p => ({ ...p, growertype: e.target.value }))}
                                        className={fInput} placeholder="Group name..." />
                                </div>
                                <button onClick={handleSaveGroup} disabled={grpSaving}
                                    className="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white rounded text-[10px] font-black uppercase tracking-wide transition-colors h-8">
                                    {grpSaving ? <RefreshCcw size={12} className="animate-spin" /> : <Save size={12} />}
                                    {grpMode === "add" ? "Add" : "Update"}
                                </button>
                                {grpMode === "edit" && (
                                    <button onClick={() => { setGrpForm({ unico: "", growertype: "" }); setGrpMode("add"); setSelGrpUq(null); }}
                                        className="flex items-center gap-1 px-2 py-2 bg-gray-200 hover:bg-gray-300 text-gray-600 rounded text-[10px] font-black uppercase tracking-wide transition-colors h-8">
                                        <X size={12} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Groups list */}
                        <div className="flex-1 overflow-auto">
                            <table className="min-w-full text-left">
                                <thead className="bg-gray-100 border-b border-gray-200 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-3 py-1.5 font-black text-[10px] text-gray-600 uppercase tracking-wide">Group Name</th>
                                        <th className="px-2 py-1.5 w-16 text-center font-black text-[10px] text-gray-600 uppercase tracking-wide">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 text-xs">
                                    {(groupsList as any[]).length === 0 ? (
                                        <tr><td colSpan={2} className="p-4 text-center text-gray-300 italic">No groups</td></tr>
                                    ) : (groupsList as any[]).map((row: any, i: number) => {
                                        const uq = t(row.UNICO);
                                        const sel = selGrpUq === uq;
                                        return (
                                            <tr key={i} onClick={() => setSelGrpUq(sel ? null : uq)}
                                                className={cn("cursor-pointer transition-colors", sel ? "!bg-blue-50 ring-1 ring-inset ring-blue-200" : "hover:bg-gray-50")}>
                                                <td className="px-3 py-1.5">{t(row.GROWERTYPE)}</td>
                                                <td className="px-2 py-1 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button onClick={e => { e.stopPropagation(); setGrpForm({ unico: uq, growertype: t(row.GROWERTYPE) }); setGrpMode("edit"); setSelGrpUq(uq); }}
                                                            className="p-1 text-orange-500 hover:bg-orange-50 rounded transition-colors" title="Edit">
                                                            <Pencil size={12} />
                                                        </button>
                                                        <button onClick={e => { e.stopPropagation(); setSelGrpUq(uq); handleDeleteGroup(); }}
                                                            className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors" title="Delete">
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteModal && (
                <ConfirmDlg
                    title={`Delete ${deleteModal.type.charAt(0).toUpperCase() + deleteModal.type.slice(1)}`}
                    msg={`Are you sure you want to delete "${deleteModal.name}"? This action cannot be undone.`}
                    saving={saving}
                    onConfirm={deleteModal.type === "vendor" ? confirmDeleteVendor : deleteModal.type === "document" ? confirmDeleteDoc : confirmDeleteGroup}
                    onCancel={() => setDeleteModal(null)}
                />
            )}
        </div>
    );
}
