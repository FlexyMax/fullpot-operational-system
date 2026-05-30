"use client";

import { useState, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    ArrowLeft, Building2, RefreshCcw, Plus, Pencil, Trash2,
    Search, X, Save, ChevronRight, ChevronLeft,
    FileText, AlertCircle, Calendar, Check,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { GridMenu } from "@/components/GridMenu";
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
const today = () => new Date().toISOString().split("T")[0];
const firstOfYear = () => `${new Date().getFullYear()}-01-01`;

// ─── Empty form ───────────────────────────────────────────────────────────────
const EMPTY_FORM: any = {
    unico: "", grower: "", farm: "", source: "", nit_ruc: "", active: true,
    officeadd1: "", officeadd2: "", farm_add1: "", farm_add2: "",
    fob: "", city: "", country: "",
    phone_1: "", phone_2: "", fax_1: "", fax_2: "", celular: "",
    email_1: "", email_2: "", msn_yahoo: "",
    manager: "", secretary: "", production: "", salesman: "",
    ship_days: 0, old_code: 0, international: false,
    bank: "", bank_account: "", change_password: false,
    chk_boxes: false, chk_stems: false, qb_flower: false, qb_freight: false,
    apply_freight: false, flower_cost: false, auto_packing: false,
    duties: false, broker: false,
    commission: 0, fuel_discount: 0, sales_factor: 0,
    handling: 0, ocharges: 0, pack_disc: 0, pack_return: 0,
    whouse_farm_id: "", text_invoice: "", text_packing: "",
    flower_system: false, send_file_warehouse: false, special_contributor: false,
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

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function VendorsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const qc     = useQueryClient();
    const perms  = usePagePermissions("vendors");
    const { logAction } = useAuditLog("vendors", "flower_growers");

    // ── State ─────────────────────────────────────────────────────────────────
    const [search,      setSearch]      = useState("");
    const [selectedUq,  setSelectedUq]  = useState<string | null>(null);
    const [activeTab,   setActiveTab]   = useState<ActiveTab>("statement");
    const [tabLoaded,   setTabLoaded]   = useState<Partial<Record<ActiveTab, boolean>>>({});
    const [mobilePanel, setMobilePanel] = useState<"list" | "detail">("list");

    // Statement date range
    const [stmtFrom, setStmtFrom] = useState(firstOfYear());
    const [stmtTo,   setStmtTo]   = useState(today());
    const [stmtKey,  setStmtKey]  = useState(0); // increment to force refetch

    // Vendor Setup modal
    const [modalOpen,  setModalOpen]  = useState(false);
    const [modalMode,  setModalMode]  = useState<"add" | "edit">("add");
    const [modalTab,   setModalTab]   = useState<ModalVendorTab>("main");
    const [form,       setForm]       = useState<any>(EMPTY_FORM);
    const [saving,     setSaving]     = useState(false);
    const [formError,  setFormError]  = useState<string | null>(null);

    // Document modal
    const [docModal,   setDocModal]   = useState(false);
    const [docMode,    setDocMode]    = useState<"add" | "edit">("add");
    const [docForm,    setDocForm]    = useState<any>(EMPTY_DOC);
    const [docSaving,  setDocSaving]  = useState(false);
    const [docError,   setDocError]   = useState<string | null>(null);
    const [selDocUq,   setSelDocUq]   = useState<string | null>(null);

    // Groups modal
    const [grpModal,   setGrpModal]   = useState(false);
    const [grpForm,    setGrpForm]    = useState({ unico: "", growertype: "" });
    const [grpMode,    setGrpMode]    = useState<"add" | "edit">("add");
    const [grpSaving,  setGrpSaving]  = useState(false);
    const [grpError,   setGrpError]   = useState<string | null>(null);
    const [selGrpUq,   setSelGrpUq]   = useState<string | null>(null);

    // ── Queries ───────────────────────────────────────────────────────────────
    const { data: vendorsList = [], isFetching: loadingList, refetch: refetchList } = useQuery({
        queryKey: ["vendors-list"],
        queryFn:  () => fetch("/api/vendors").then(r => r.json()).then(d => norm(Array.isArray(d) ? d : [])),
        staleTime: 0,
    });

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
        enabled:  !!selectedUq && activeTab === "statement" && !!tabLoaded["statement"],
        staleTime: 0,
    });
    const stmtRows    = norm(stmtData?.statement ?? []);
    const pendingRows = norm(stmtData?.pending   ?? []);

    // Documents
    const { data: docsList = [], isFetching: loadingDocs, refetch: refetchDocs } = useQuery({
        queryKey: ["vendors-documents", selectedUq],
        queryFn:  () => fetch(`/api/vendors/documents?grower_uq=${selectedUq}`).then(r => r.json()).then(d => norm(Array.isArray(d) ? d : [])),
        enabled:  !!selectedUq && activeTab === "documents" && !!tabLoaded["documents"],
        staleTime: 0,
    });

    // Classes
    const { data: assignedClasses = [], isFetching: loadingClassA, refetch: refetchClassA } = useQuery({
        queryKey: ["vendors-classes-assigned", selectedUq],
        queryFn:  () => fetch(`/api/vendors/classes?grower_uq=${selectedUq}`).then(r => r.json()).then(d => norm(Array.isArray(d) ? d : [])),
        enabled:  !!selectedUq && activeTab === "classes" && !!tabLoaded["classes"],
        staleTime: 0,
    });
    const { data: availableClasses = [], isFetching: loadingClassB, refetch: refetchClassB } = useQuery({
        queryKey: ["vendors-classes-available", selectedUq],
        queryFn:  () => fetch(`/api/vendors/classes?grower_uq=${selectedUq}&not_in=1`).then(r => r.json()).then(d => norm(Array.isArray(d) ? d : [])),
        enabled:  !!selectedUq && activeTab === "classes" && !!tabLoaded["classes"],
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

    // ── Tab click ─────────────────────────────────────────────────────────────
    const handleTabClick = (tab: ActiveTab) => {
        setActiveTab(tab);
        setTabLoaded(prev => ({ ...prev, [tab]: true }));
    };

    // ── Row select ────────────────────────────────────────────────────────────
    const handleSelectRow = (row: any) => {
        const uq = t(row.UNICO);
        setSelectedUq(uq);
        setTabLoaded({ [activeTab]: true });
        setMobilePanel("detail");
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
                production:             t(fill.production),
                salesman:               t(fill.salesman),
                ship_days:              parseInt(fill.ship_days ?? 0) || 0,
                old_code:               parseInt(fill.old_code ?? 0) || 0,
                international:          Boolean(fill.international),
                bank:                   t(fill.bank),
                bank_account:           t(fill.bank_account),
                change_password:        Boolean(fill.change_password),
                chk_boxes:              Boolean(fill.chk_boxes),
                chk_stems:              Boolean(fill.chk_stems),
                qb_flower:              Boolean(fill.qb_flower),
                qb_freight:             Boolean(fill.qb_freight),
                apply_freight:          Boolean(fill.apply_freight),
                flower_cost:            Boolean(fill.flower_cost),
                auto_packing:           Boolean(fill.auto_packing),
                duties:                 Boolean(fill.duties),
                broker:                 Boolean(fill.broker),
                commission:             parseFloat(fill.commission ?? 0) || 0,
                fuel_discount:          parseFloat(fill.fuel_discount ?? 0) || 0,
                sales_factor:           parseFloat(fill.sales_factor ?? 0) || 0,
                handling:               parseFloat(fill.handling ?? 0) || 0,
                ocharges:               parseFloat(fill.ocharges ?? 0) || 0,
                pack_disc:              parseFloat(fill.pack_disc ?? 0) || 0,
                pack_return:            parseFloat(fill.pack_return ?? 0) || 0,
                whouse_farm_id:         t(fill.whouse_farm_id),
                text_invoice:           t(fill.text_invoice),
                text_packing:           t(fill.text_packing),
                flower_system:          Boolean(fill.flower_system),
                send_file_warehouse:    Boolean(fill.send_file_warehouse),
                special_contributor:    Boolean(fill.special_contributor),
                clave:                  t(fill.clave),
                terms_uq:               t(fill.terms_uq),
                agency_uq:              t(fill.agency_uq),
                group_uq:               t(fill.group_uq),
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
        if (!confirm(`Delete vendor "${name}"? This action cannot be undone.`)) return;
        try {
            const res = await fetch(`/api/vendors/${selectedUq}`, { method: "DELETE" });
            const d = await res.json();
            if (!d.success) throw new Error(d.error || "Delete failed");
            logAction("Delete", selectedUq);
            toast.success("Vendor deleted.");
            setSelectedUq(null);
            qc.invalidateQueries({ queryKey: ["vendors-list"] });
        } catch (e: any) {
            toast.error(e.message);
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
                date_from: fill.ldfrom ? new Date(fill.ldfrom).toISOString().split("T")[0] : firstOfYear(),
                date_to:   fill.ldto   ? new Date(fill.ldto).toISOString().split("T")[0]   : today(),
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
        if (!confirm("Delete this document?")) return;
        try {
            const res = await fetch(`/api/vendors/documents/${selDocUq}`, { method: "DELETE" });
            const d = await res.json();
            if (!d.success) throw new Error(d.error || "Delete failed");
            logAction("Delete", selDocUq, "DeleteDocument");
            toast.success("Document deleted.");
            setSelDocUq(null);
            qc.invalidateQueries({ queryKey: ["vendors-documents", selectedUq] });
        } catch (e: any) {
            toast.error(e.message);
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
        if (!confirm("Delete this group?")) return;
        try {
            const res = await fetch(`/api/vendors/groups/${selGrpUq}`, { method: "DELETE" });
            const d = await res.json();
            if (!d.success) throw new Error(d.error || "Delete failed");
            toast.success("Group deleted.");
            setSelGrpUq(null);
            setGrpForm({ unico: "", growertype: "" });
            setGrpMode("add");
            qc.invalidateQueries({ queryKey: ["vendors-groups"] });
            qc.invalidateQueries({ queryKey: ["vendors-lookups"] });
        } catch (e: any) {
            toast.error(e.message);
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
        <div className="flex flex-col h-screen bg-[#f4f6f8] overflow-hidden font-sans text-[#333]">

            {/* ── Page Header ── */}
            <div className="h-10 bg-[#374151] flex items-center justify-between px-3 md:px-4 shrink-0 text-white">
                <div className="flex items-center gap-2 md:gap-3">
                    {mobilePanel === "detail" ? (
                        <button onClick={() => setMobilePanel("list")} className="md:hidden hover:bg-white/10 p-1 rounded transition-colors">
                            <ArrowLeft size={16} />
                        </button>
                    ) : (
                        <button onClick={() => router.push("/menu")} className="hover:bg-white/10 p-1 rounded transition-colors">
                            <ArrowLeft size={16} />
                        </button>
                    )}
                    <button onClick={() => router.push("/menu")} className="hidden md:flex hover:bg-white/10 p-1 rounded transition-colors">
                        <ArrowLeft size={16} />
                    </button>
                    <Building2 size={14} className="text-[#FB7506] hidden md:block" />
                    <span className="font-black text-xs uppercase tracking-widest">
                        {mobilePanel === "detail" && selectedUq ? (selName || "Vendor") : "Vendors / Growers"}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-[10px] font-bold hidden sm:block">
                        User: <span className="text-white">{session?.user?.name}</span>
                    </span>
                    <button
                        onClick={() => { setGrpForm({ unico: "", growertype: "" }); setGrpMode("add"); setSelGrpUq(null); setGrpError(null); setGrpModal(true); }}
                        className="hidden md:flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded text-[10px] font-black uppercase tracking-wide transition-colors">
                        <Building2 size={12} /> Groups
                    </button>
                </div>
            </div>

            {/* ── Main Layout ── */}
            <div className="flex flex-col md:flex-row flex-1 gap-2 p-2 overflow-hidden min-h-0">

                {/* ── Left: Vendors List ── */}
                <div className={cn(
                    "flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden min-h-0",
                    "md:w-[30%] md:shrink-0 md:flex",
                    mobilePanel === "list" ? "flex flex-1" : "hidden md:flex"
                )}>
                    <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-0 shrink-0 rounded-t-lg">
                        <div className="flex items-center gap-2">
                            <Building2 size={16} className="text-[#FB7506]" />
                            <span className="font-black text-[10px] text-gray-100 uppercase tracking-widest">Vendors</span>
                            {loadingList && <RefreshCcw size={12} className="animate-spin text-gray-400" />}
                        </div>
                        <GridMenu items={[
                            { label: "Add",     icon: Plus,        color: "green", onClick: handleAdd,    disabled: !perms.canCreate },
                            { label: "Edit",    icon: Pencil,      color: "orange", onClick: handleEdit,  disabled: !selectedUq || !perms.canEdit },
                            { label: "Delete",  icon: Trash2,      color: "red",   onClick: handleDelete, disabled: !selectedUq || !perms.canDelete },
                            { separator: true } as any,
                            { label: "Refresh", icon: RefreshCcw,  color: "gray",  onClick: () => refetchList() },
                            { label: "Reports", icon: FileText,    color: "blue",  onClick: () => toast.info("Reports coming soon."), disabled: !perms.canReport },
                        ]} />
                    </div>

                    {/* Search */}
                    <div className="p-2 border-b border-gray-100 shrink-0">
                        <div className="relative">
                            <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Search vendors..."
                                className="w-full pl-7 pr-2 h-8 text-xs border border-gray-200 rounded outline-none focus:ring-1 focus:ring-[#FB7506]" />
                        </div>
                    </div>

                    {/* Grid header */}
                    <div className="bg-gray-100 border-b border-gray-200 shrink-0">
                        <div className="grid grid-cols-[1fr_40px] px-2 py-1.5 md:hidden">
                            <span className="font-black text-[10px] text-gray-600 uppercase tracking-wide">Vendor</span>
                            <span className="font-black text-[10px] text-gray-600 uppercase tracking-wide text-center">Act.</span>
                        </div>
                        <div className="hidden md:grid px-2 py-1.5" style={{ gridTemplateColumns: "55px 1fr 45px 55px 80px 65px 44px" }}>
                            <span className="font-black text-[10px] text-gray-600 uppercase tracking-wide">Code</span>
                            <span className="font-black text-[10px] text-gray-600 uppercase tracking-wide">Vendor</span>
                            <span className="font-black text-[10px] text-gray-600 uppercase tracking-wide">FOB</span>
                            <span className="font-black text-[10px] text-gray-600 uppercase tracking-wide">SalesRep</span>
                            <span className="font-black text-[10px] text-gray-600 uppercase tracking-wide">City</span>
                            <span className="font-black text-[10px] text-gray-600 uppercase tracking-wide">Country</span>
                            <span className="font-black text-[10px] text-gray-600 uppercase tracking-wide text-center">Act.</span>
                        </div>
                    </div>

                    {/* List rows */}
                    <div className="overflow-y-auto flex-1 divide-y divide-gray-50 text-gray-800">
                        {filteredList.length === 0 && !loadingList ? (
                            <div className="p-6 text-center text-gray-300 text-xs italic">
                                {search ? "No results" : "No vendors found"}
                            </div>
                        ) : filteredList.map((row: any, i: number) => {
                            const uq = t(row.UNICO);
                            const selected = selectedUq === uq;
                            const rowBase = cn("cursor-pointer transition-colors text-xs px-2 py-1.5",
                                selected ? "!bg-blue-50 ring-1 ring-inset ring-blue-200" : "hover:bg-gray-50");
                            return (
                                <div key={uq || i} onClick={() => handleSelectRow(row)}>
                                    {/* Mobile row */}
                                    <div className={cn(rowBase, "grid grid-cols-[1fr_40px] md:hidden")}>
                                        <div className="min-w-0">
                                            <p className={cn("truncate font-semibold text-xs", selected ? "text-blue-800" : "text-gray-800")}>{t(row.GROWER)}</p>
                                            <p className="text-[10px] text-gray-400 truncate">{t(row.FARM)} {t(row.CITY) && `· ${t(row.CITY)}`}</p>
                                        </div>
                                        <span className="text-center self-center">
                                            {Boolean(row.ACTIVE) ? <span className="text-green-600 font-black text-[10px]">✓</span> : <span className="text-gray-300 text-[10px]">—</span>}
                                        </span>
                                    </div>
                                    {/* Desktop row */}
                                    <div className={cn(rowBase, "hidden md:grid")} style={{ gridTemplateColumns: "55px 1fr 45px 55px 80px 65px 44px" }}>
                                        <span className="truncate text-gray-500 text-[11px] self-center font-mono">{t(row.FARM)}</span>
                                        <span className={cn("truncate font-semibold text-[11px] self-center", selected ? "text-blue-800" : "text-gray-800")}>{t(row.GROWER)}</span>
                                        <span className="truncate text-gray-500 text-[11px] self-center">{t(row.FOB)}</span>
                                        <span className="truncate text-gray-500 text-[11px] self-center">{t(row.SALES_PERSON)}</span>
                                        <span className="truncate text-gray-500 text-[11px] self-center">{t(row.CITY)}</span>
                                        <span className="truncate text-gray-500 text-[11px] self-center">{t(row.COUNTRY)}</span>
                                        <span className="text-center self-center">
                                            {Boolean(row.ACTIVE) ? <span className="text-green-600 font-black text-[10px]">YES</span> : <span className="text-gray-400 text-[10px]">—</span>}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="px-3 py-1.5 border-t border-gray-100 shrink-0 bg-gray-50">
                        <span className="text-[10px] text-gray-400 font-bold">{filteredList.length} record{filteredList.length !== 1 ? "s" : ""}</span>
                    </div>
                </div>

                {/* ── Right: Detail tabs ── */}
                <div className={cn(
                    "flex flex-col min-w-0 min-h-0 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden",
                    "md:flex md:flex-1",
                    mobilePanel === "detail" ? "flex flex-1" : "hidden md:flex"
                )}>
                    {/* Tab bar */}
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

                    {/* Vendor name header */}
                    {selectedUq && (
                        <div className="bg-white border-b border-gray-200 px-4 py-2 shrink-0 flex items-center justify-between">
                            <span className="font-black text-lg text-[#374151] uppercase tracking-tight">
                                {selName || "—"}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                {selRec && t(selRec.FARM) ? `Farm: ${t(selRec.FARM)}` : ""}{selRec && t(selRec.CITY) ? ` · ${t(selRec.CITY)}` : ""}
                            </span>
                        </div>
                    )}

                    {/* Tab content */}
                    <div className="flex-1 overflow-hidden min-h-0 flex flex-col">
                        {!selectedUq ? (
                            <div className="flex-1 flex items-center justify-center text-gray-300 text-sm font-bold uppercase tracking-wide">
                                <div className="text-center">
                                    <Building2 size={40} className="mx-auto mb-3 opacity-30" />
                                    <p>Select a vendor</p>
                                </div>
                            </div>
                        ) : !tabLoaded[activeTab] ? (
                            <div className="flex-1 flex items-center justify-center text-gray-300 text-xs font-bold uppercase">
                                Click a tab to load data
                            </div>
                        ) : (
                            <>
                                {/* ── Tab: Statement ── */}
                                {activeTab === "statement" && (
                                    <div className="flex flex-col flex-1 min-h-0">
                                        {/* Date filters */}
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

                                        <div className="flex-1 overflow-auto flex flex-col md:flex-row gap-0 min-h-0">
                                            {/* Statement balance table */}
                                            <div className="flex flex-col md:flex-1 min-h-0" style={{ minHeight: "200px" }}>
                                                <div className="bg-gray-100 border-b border-r border-gray-200 px-3 py-1.5 shrink-0">
                                                    <span className="font-black text-[10px] text-gray-600 uppercase tracking-wide">
                                                        Statement Balance ({stmtRows.length})
                                                    </span>
                                                </div>
                                                <div className="flex-1 overflow-auto border-r border-gray-100">
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
                                                                    <td className="px-2 py-1.5 border-r border-gray-50 truncate max-w-[90px]">{t(row.INVOICE_NO ?? "")}</td>
                                                                    <td className="px-2 py-1.5 border-r border-gray-50 truncate max-w-[70px]">{t(row.PORDER_NO ?? "")}</td>
                                                                    <td className="px-2 py-1.5 border-r border-gray-50 whitespace-nowrap">{fmtDate(row.INVOICE_DATE ?? "")}</td>
                                                                    <td className="px-2 py-1.5 border-r border-gray-50 text-right font-mono">{fmt(row.AMMOUNT ?? 0)}</td>
                                                                    <td className="px-2 py-1.5 border-r border-gray-50 text-right font-mono">{fmt(row.PAYMENTS ?? 0)}</td>
                                                                    <td className="px-2 py-1.5 border-r border-gray-50 text-right font-mono">{fmt(row.CREDITS ?? 0)}</td>
                                                                    <td className="px-2 py-1.5 border-r border-gray-50 text-right font-mono">{fmt(row.DEBITS ?? 0)}</td>
                                                                    <td className={cn("px-2 py-1.5 border-r border-gray-50 text-right font-mono font-bold",
                                                                        parseFloat(row.TOTAL_BALANCE ?? 0) > 0 ? "text-red-600" : "text-green-700")}>
                                                                        {fmt(row.TOTAL_BALANCE ?? 0)}
                                                                    </td>
                                                                    <td className="px-2 py-1.5 border-r border-gray-50 whitespace-nowrap">{fmtDate(row.DUE_DATE ?? "")}</td>
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

                                            {/* Pending invoices table */}
                                            <div className="flex flex-col md:w-[42%] shrink-0 min-h-0" style={{ minHeight: "200px" }}>
                                                <div className="bg-gray-100 border-b border-gray-200 px-3 py-1.5 shrink-0">
                                                    <span className="font-black text-[10px] text-gray-600 uppercase tracking-wide">
                                                        Pending Invoices ({pendingRows.length})
                                                    </span>
                                                </div>
                                                <div className="flex-1 overflow-auto">
                                                    <table className="min-w-full text-left">
                                                        <thead className="bg-gray-100 border-b border-gray-200 sticky top-0 z-10">
                                                            <tr>
                                                                {["AP Date", "Invoice", "Boxes", "Stems", "Amount"].map(h => (
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
                                                                    <td className="px-2 py-1.5 border-r border-gray-50 whitespace-nowrap">{fmtDate(row.AP_DATE ?? row.INVOICE_DATE ?? row.DATE ?? row.FECHA)}</td>
                                                                    <td className="px-2 py-1.5 border-r border-gray-50 truncate max-w-[80px]">{t(row.AP_NUMBER ?? row.INVOICE_NO ?? row.INVOICE ?? row.REF ?? "")}</td>
                                                                    <td className="px-2 py-1.5 border-r border-gray-50 text-right font-mono">{t(row.BOXES ?? row.TOTAL_BOXES ?? "")}</td>
                                                                    <td className="px-2 py-1.5 border-r border-gray-50 text-right font-mono">{t(row.STEMS ?? row.TOTAL_STEMS ?? "")}</td>
                                                                    <td className="px-2 py-1.5 text-right font-mono font-bold text-red-600">{fmt(row.AMOUNT ?? row.TOTAL_BALANCE ?? row.TOTAL ?? row.BALANCE ?? 0)}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ── Tab: Documents ── */}
                                {activeTab === "documents" && (
                                    <div className="flex flex-col flex-1 min-h-0">
                                        <div className="h-9 bg-gray-50 border-b border-gray-200 flex items-center justify-between px-3 shrink-0">
                                            <span className="font-black text-[10px] text-gray-600 uppercase tracking-wide">
                                                Documents ({(docsList as any[]).length})
                                            </span>
                                            <div className="flex items-center gap-1">
                                                {loadingDocs && <RefreshCcw size={12} className="animate-spin text-gray-400" />}
                                                <button onClick={handleOpenAddDoc}
                                                    className="flex items-center gap-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-[10px] font-black uppercase tracking-wide transition-colors">
                                                    <Plus size={12} /> Add
                                                </button>
                                                <button onClick={handleOpenEditDoc} disabled={!selDocUq}
                                                    className="flex items-center gap-1 px-2 py-1 bg-[#FB7506] hover:bg-orange-600 disabled:opacity-40 text-white rounded text-[10px] font-black uppercase tracking-wide transition-colors">
                                                    <Pencil size={12} /> Edit
                                                </button>
                                                <button onClick={handleDeleteDoc} disabled={!selDocUq}
                                                    className="flex items-center gap-1 px-2 py-1 bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white rounded text-[10px] font-black uppercase tracking-wide transition-colors">
                                                    <Trash2 size={12} /> Del
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex-1 overflow-auto">
                                            <table className="min-w-full text-left">
                                                <thead className="bg-gray-100 border-b border-gray-200 sticky top-0 z-10">
                                                    <tr>
                                                        {["Document", "Date From", "Date To"].map(h => (
                                                            <th key={h} className="px-2 py-1.5 font-black text-[10px] text-gray-600 uppercase tracking-wide whitespace-nowrap border-r border-gray-200 last:border-r-0">{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50 text-xs">
                                                    {loadingDocs ? (
                                                        <tr><td colSpan={3} className="p-4 text-center"><RefreshCcw size={14} className="animate-spin mx-auto text-gray-400" /></td></tr>
                                                    ) : (docsList as any[]).length === 0 ? (
                                                        <tr><td colSpan={3} className="p-6 text-center text-gray-300 italic">No documents</td></tr>
                                                    ) : (docsList as any[]).map((row: any, i: number) => {
                                                        const uq = t(row.UNICO);
                                                        const sel = selDocUq === uq;
                                                        return (
                                                            <tr key={i} onClick={() => setSelDocUq(sel ? null : uq)}
                                                                className={cn("cursor-pointer transition-colors", sel ? "!bg-blue-50 ring-1 ring-inset ring-blue-200" : "hover:bg-gray-50")}>
                                                                <td className="px-2 py-1.5 border-r border-gray-50 truncate max-w-[240px]">{t(row.DOCUMENT)}</td>
                                                                <td className="px-2 py-1.5 border-r border-gray-50 whitespace-nowrap">{fmtDate(row.LDFROM ?? row.DATE_FROM)}</td>
                                                                <td className="px-2 py-1.5 whitespace-nowrap">{fmtDate(row.LDTO ?? row.DATE_TO)}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* ── Tab: Classes ── */}
                                {activeTab === "classes" && (
                                    <div className="flex-1 min-h-0 p-2 overflow-hidden">
                                        <DualPanel
                                            assignedRows={assignedClasses as any[]}
                                            availableRows={availableClasses as any[]}
                                            assignedCols={[{ key: "CLASS", label: "Class" }, { key: "DESCRIPTION", label: "Description" }]}
                                            availableCols={[{ key: "CLASS", label: "Class" }, { key: "DESCRIPTION", label: "Description" }]}
                                            onAdd={handleAddClass}
                                            onRemove={handleRemoveClass}
                                            loading={loadingClassA || loadingClassB}
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

            {/* ─── Vendor Setup Modal ──────────────────────────────────────────────── */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
                    onClick={() => setModalOpen(false)}>
                    <div className="bg-white rounded-t-2xl sm:rounded-lg shadow-2xl w-full sm:max-w-5xl h-[95vh] sm:max-h-[92vh] flex flex-col overflow-hidden"
                        onClick={e => e.stopPropagation()}>

                        {/* Modal header */}
                        <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-0 rounded-t-lg shrink-0">
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
                        <div className="bg-[#374151] flex items-end px-2 gap-0.5 shrink-0 overflow-x-auto scrollbar-none">
                            {([
                                { key: "main",     label: "Main Info" },
                                { key: "contacts", label: "Contacts" },
                                { key: "settings", label: "Settings" },
                                { key: "qb",       label: "QB / Charges" },
                            ] as { key: ModalVendorTab; label: string }[]).map(tab => (
                                <button key={tab.key} onClick={() => setModalTab(tab.key)}
                                    className={cn(
                                        "px-3 h-7 text-[10px] font-black uppercase tracking-wider rounded-t transition-all whitespace-nowrap shrink-0",
                                        modalTab === tab.key ? "bg-white text-[#FB7506]" : "text-gray-400 hover:text-white hover:bg-white/10"
                                    )}>
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Modal scrollable content */}
                        <div className="flex-1 overflow-y-auto p-3 md:p-4">

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
                                                <option key={t(r.UNICO ?? r.TERMS_UQ)} value={t(r.UNICO ?? r.TERMS_UQ)}>
                                                    {t(r.TERMS ?? r.DESCRIPTION ?? r.UNICO)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <label className={fLabel}>Agency</label>
                                        <select value={t(form.agency_uq)} onChange={e => setField("agency_uq", e.target.value)} className={fInput}>
                                            <option value="">-- None --</option>
                                            {agencies.map((r: any) => (
                                                <option key={t(r.UNICO ?? r.AGENCY_UQ)} value={t(r.UNICO ?? r.AGENCY_UQ)}>
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
                                                <option key={t(r.UNICO ?? r.GROUP_UQ)} value={t(r.UNICO ?? r.GROUP_UQ)}>
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
        </div>
    );
}
