"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Search, Pencil, Check, X, XCircle, RefreshCcw,
    Users, Shield, Copy, Save, CheckSquare, Square,
    Building2, LayoutGrid, UserCheck, ChevronRight
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { toast } from "sonner";

import { useAuditLog } from "@/lib/audit";
import { usePagePermissions, PERMISSION_MSGS } from "@/lib/permissions";
import { AuditLogModal } from "@/components/AuditLogModal";
import { cn } from "@/lib/utils";
import { useAccessStore } from "@/store/system/useAccessStore";
import PanelGrid from "@/components/ui/PanelGrid";
const EMPTY_ARR: any[] = [];

// ─── Types ────────────────────────────────────────────────────────────────────
type PermField = "acceso" | "crear" | "editar" | "borrar" | "consultar" | "reportes";
const PERM_FIELDS: PermField[] = ["acceso", "crear", "editar", "borrar", "consultar", "reportes"];
const PERM_LABELS: Record<PermField, string> = {
    acceso: "Access", crear: "Create", editar: "Edit",
    borrar: "Delete", consultar: "Query", reportes: "Print",
};

// ─── Fetch helper ─────────────────────────────────────────────────────────────
const sysFetch = async (url: string) => {
    const r = await fetch(url);
    const json = await r.json();
    if (!r.ok) throw new Error(json?.error || `HTTP ${r.status}`);
    return json;
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SystemAccessPage() {
    const { status } = useSession();
    const router = useRouter();
    const qc = useQueryClient();
    const { logAction } = useAuditLog("access-definition", "usuarios_accesos");
    const perms = usePagePermissions("access-definition");

    const {
        selectedUnico, setSelectedUnico,
        searchTerm, setSearchTerm,
        filterCompany, setFilterCompany,
        filterModule, setFilterModule,
        mobileUsersOpen, setMobileUsersOpen,
        copyModal, setCopyModal,
        clearFilters,
    } = useAccessStore();

    const [editMode,    setEditMode]    = useState(false);
    const [localPerms,  setLocalPerms]  = useState<any[]>([]);
    const [saving,      setSaving]      = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
    }, [status, router]);

    // ── Queries ───────────────────────────────────────────────────────────────
    const { data: users = EMPTY_ARR, isFetching: loadingUsers } = useQuery({
        queryKey: ["sys-users"],
        queryFn:  () => sysFetch("/api/system/access/users"),
    });

    const { data: selectedUser } = useQuery({
        queryKey: ["sys-user", selectedUnico],
        queryFn:  () => sysFetch(`/api/system/access/user?unico=${selectedUnico}`),
        enabled:  !!selectedUnico,
    });

    const { data: permissions = EMPTY_ARR, isFetching: loadingPerms, refetch: refetchPerms } = useQuery({
        queryKey: ["sys-perms", selectedUnico],
        queryFn:  () => sysFetch(`/api/system/access/permissions?unico=${selectedUnico}`),
        enabled:  !!selectedUnico,
        retry:    false,
    });

    const { data: modules = EMPTY_ARR } = useQuery({ queryKey: ["sys-modules"],    queryFn: () => sysFetch("/api/system/access/modules")    });
    const { data: companies = EMPTY_ARR } = useQuery({ queryKey: ["sys-companies"],  queryFn: () => sysFetch("/api/system/access/companies")  });

    // ── Sync permissions to local state ──────────────────────────────────────
    useEffect(() => {
        setLocalPerms(permissions);
        setEditMode(false);
        clearFilters();
    }, [permissions]);

    // ── Auto-select first user ────────────────────────────────────────────────
    useEffect(() => {
        if (users.length > 0 && !selectedUnico) {
            setSelectedUnico(users[0].unico);
        }
    }, [users]);

    // ── Filtered lists ────────────────────────────────────────────────────────
    const filteredUsers = useMemo(() => {
        if (!searchTerm.trim()) return users;
        const q = searchTerm.toLowerCase();
        return (users as any[]).filter(u =>
            String(u.full_name || "").toLowerCase().includes(q) ||
            String(u.usuario   || "").toLowerCase().includes(q)
        );
    }, [users, searchTerm]);

    const filteredPerms = useMemo(() => {
        return localPerms.filter(p => {
            const co = !filterCompany || p.empresa_uq === filterCompany;
            const mo = !filterModule  || p.modulo_uq  === filterModule;
            return co && mo;
        });
    }, [localPerms, filterCompany, filterModule]);

    const isVisitor = String(selectedUser?.nivel ?? "").trim().toUpperCase() === "VISITANTE";

    // ── Edit mode ─────────────────────────────────────────────────────────────
    const handleEdit = async () => {
        if (!selectedUser) return;
        if (!selectedUser.activo) {
            toast.error("User isn't active.");
            return;
        }
        try {
            const res = await fetch("/api/system/access/initialize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ unico: selectedUnico, nivel: selectedUser.nivel }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                toast.error(data.error || "Failed to initialize permissions.");
                return;
            }
            logAction("Edit", selectedUnico!);
            await refetchPerms();
            setEditMode(true);
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    const handleCancel = () => {
        setLocalPerms(permissions);
        setEditMode(false);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/system/access/permissions", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rows: localPerms, targetUq: selectedUnico }),
            });
            const data = await res.json();
            if (data.success) {
                logAction("Edit", selectedUnico!);
                toast.success(`Saved ${data.updated} records.`);
                setEditMode(false);
                refetchPerms();
            } else {
                toast.error(data.error || "Save failed.");
            }
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setSaving(false);
        }
    };

    // ── Checkbox toggle ───────────────────────────────────────────────────────
    const togglePerm = (unico: string, field: PermField) => {
        if (!editMode) return;
        if (isVisitor && (field === "crear" || field === "editar" || field === "borrar")) return;
        setLocalPerms(prev =>
            prev.map(p => p.unico === unico ? { ...p, [field]: !p[field] } : p)
        );
    };

    // ── Column check/uncheck ──────────────────────────────────────────────────
    const checkColumn = (field: PermField, value: boolean) => {
        const unicosInView = new Set(filteredPerms.map(p => p.unico));
        setLocalPerms(prev =>
            prev.map(p => unicosInView.has(p.unico) ? { ...p, [field]: value } : p)
        );
    };

    const colAllChecked = (field: PermField) =>
        filteredPerms.length > 0 && filteredPerms.every(p => {
            const local = localPerms.find(lp => lp.unico === p.unico);
            return local?.[field];
        });

    // ── Select user ───────────────────────────────────────────────────────────
    const handleSelectUser = (unico: string) => {
        if (editMode) return;
        setSelectedUnico(unico);
    };

    if (status === "loading") return null;

    return (
        <div className="flex flex-col h-[100dvh] bg-[#FBF9F8] overflow-hidden font-sans text-[#333]">

            <AppHeader title="System Access" />


            {/* Main layout */}
            <div className="flex flex-col lg:flex-row flex-1 gap-2 p-2 overflow-y-auto lg:overflow-hidden">

                {/* ── Left: User List ──────────────────────────────────────── */}
                <div className="hidden lg:flex w-[260px] shrink-0 flex-col">
                    <PanelGrid
                        title="Users"
                        icon={Users}
                        recordCount={filteredUsers.length}
                        searchValue={searchTerm}
                        onSearchChange={setSearchTerm}
                        searchPlaceholder="Search users..."
                        refreshing={loadingUsers}
                        onRefresh={() => qc.invalidateQueries({ queryKey: ["sys-users"] })}
                        className="flex-1"
                    >
                        {(filteredUsers as any[]).map((u: any) => {
                            const isActive   = u.activo;
                            const isSelected = selectedUnico === u.unico;
                            return (
                                <div
                                    key={u.unico}
                                    onClick={() => handleSelectUser(u.unico)}
                                    className={cn(
                                        "px-3 py-2 border-b border-[#DBD9D9] cursor-pointer transition-colors flex items-center gap-2",
                                        editMode ? "cursor-not-allowed opacity-60" : "",
                                        isSelected ? "!bg-[#FB7506]/10" : "hover:bg-blue-50"
                                    )}
                                >
                                    <div className={cn(
                                        "w-1.5 h-1.5 rounded-full shrink-0",
                                        isActive ? "bg-green-400" : "bg-gray-300"
                                    )} />
                                    <div className="min-w-0">
                                        <p className="text-[13px] font-normal text-gray-800 truncate">
                                            {String(u.full_name || "").trim()}
                                        </p>
                                        <p className="text-[9px] text-gray-400 truncate">
                                            {String(u.usuario || "").trim()} · {String(u.nivel || "").trim()}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </PanelGrid>
                </div>

                {/* ── Right: User Card + Filters + Grid ────────────────────── */}
                <div className="flex-1 flex flex-col gap-2 min-w-0 lg:overflow-hidden">

                    {/* User Card */}
                    <div className="bg-white rounded-lg border border-[#DBD9D9] shadow-sm shrink-0">
                        <div className="h-10 bg-white flex items-center gap-2 pl-3 border-b border-[#DBD9D9] rounded-t-lg">
                            <UserCheck size={16} className="text-[#FB7506]" />
                            <span className="text-[14px] font-bold uppercase tracking-tight text-[#4F4F4F]">User Information</span>
                            {selectedUser && (
                                <span className={cn(
                                    "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                                    selectedUser.activo ? "bg-[#22C55E] text-white" : "bg-red-500 text-white"
                                )}>
                                    {selectedUser.activo ? "Active" : "Inactive"}
                                </span>
                            )}
                        </div>
                        {!selectedUser ? (
                            <div className="p-4 text-xs text-gray-400 italic text-center">Select a user from the list</div>
                        ) : (
                            <div className="p-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                                {[
                                    { label: "Code",       value: selectedUser.unico },
                                    { label: "Username",   value: String(selectedUser.usuario || "").trim() },
                                    { label: "First Name", value: String(selectedUser.nombres || "").trim() },
                                    { label: "Last Name",  value: String(selectedUser.apellidos || "").trim() },
                                    { label: "Level",      value: String(selectedUser.nivel || "").trim() },
                                    { label: "Password",   value: "••••••••" },
                                ].map(f => (
                                    <div key={f.label} className="flex flex-col gap-0.5">
                                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">{f.label}</span>
                                        <span className="text-[13px] font-normal text-gray-700 truncate">{f.value || "—"}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Filter Bar */}
                    <div className="bg-[#F5F3F3] rounded-lg border border-[#DBD9D9] shadow-sm shrink-0 px-3 py-2 flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                            <Building2 size={16} className="text-gray-400" />
                            <select
                                value={filterCompany}
                                onChange={e => setFilterCompany(e.target.value)}
                                className="fos-input w-44 h-10 text-sm bg-white"
                            >
                                <option value="">— All Companies —</option>
                                {(companies as any[]).map((c: any) => (
                                    <option key={c.UNICO} value={c.UNICO}>
                                        {String(c.NOMBRE || "").trim()}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <LayoutGrid size={16} className="text-gray-400" />
                            <select
                                value={filterModule}
                                onChange={e => setFilterModule(e.target.value)}
                                className="fos-input w-44 h-10 text-sm bg-white"
                            >
                                <option value="">— All Modules —</option>
                                {(modules as any[]).map((m: any) => (
                                    <option key={m.UNICO} value={m.UNICO}>
                                        {String(m.NOMBRE || "").trim()}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {(filterCompany || filterModule) && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-700 font-bold transition-colors"
                            >
                                <XCircle size={12} /> Clear filters
                            </button>
                        )}
                        <span className="ml-auto text-[10px] text-gray-400 font-bold">
                            {filteredPerms.length} / {localPerms.length} permissions
                        </span>
                    </div>

                    {/* Permissions Grid */}
                    <PanelGrid
                        title="Screen Permissions"
                        icon={Shield}
                        recordCount={filteredPerms.length}
                        refreshing={loadingPerms}
                        onRefresh={() => refetchPerms()}
                        headerRight={
                            <div className="flex items-center gap-1.5">
                                <AuditLogModal recordId={selectedUnico} disabled={!selectedUnico} />
                                {!editMode ? (
                                    <button
                                        onClick={handleEdit}
                                        disabled={!selectedUnico || !perms.canEdit}
                                        className="flex items-center gap-1.5 px-3 h-7 rounded-md font-semibold text-[14px] uppercase text-white transition-all shrink-0 bg-[#FB7506] hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <Pencil size={14} /> Edit
                                    </button>
                                ) : (
                                    <>
                                        <button onClick={handleSave} disabled={saving || !perms.canEdit}
                                            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 h-7 rounded-md font-semibold text-[14px] uppercase transition-all">
                                            {saving ? <RefreshCcw size={14} className="animate-spin" /> : <Save size={14} />}
                                            {saving ? "Saving..." : "Save"}
                                        </button>
                                        <button onClick={handleCancel}
                                            className="flex items-center gap-1.5 bg-gray-500 hover:bg-gray-600 text-white px-3 h-7 rounded-md font-semibold text-[14px] uppercase transition-all">
                                            <X size={14} /> Cancel
                                        </button>
                                    </>
                                )}
                            </div>
                        }
                        menuItems={!editMode && !!selectedUnico ? [
                            { label: "Copy From", icon: Copy, color: "blue", onClick: () => setCopyModal({ mode: "from" }) },
                            { label: "Copy To",   icon: Copy, color: "blue", onClick: () => setCopyModal({ mode: "to" }) },
                        ] : undefined}
                        className="flex-1 min-h-[300px] lg:min-h-0"
                    >
                        <div className="flex flex-col h-full">
                            {/* Check/Uncheck column buttons — edit mode only */}
                            {editMode && (
                                <div className="bg-blue-50 border-b border-blue-100 px-2 py-1.5 flex items-center gap-1 shrink-0 flex-wrap">
                                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-wider mr-2">Toggle column:</span>
                                    {PERM_FIELDS.map(field => {
                                        const allChecked = colAllChecked(field);
                                        const disabled   = isVisitor && (field === "crear" || field === "editar" || field === "borrar");
                                        return (
                                            <button
                                                key={field}
                                                onClick={() => !disabled && checkColumn(field, !allChecked)}
                                                disabled={disabled}
                                                className={cn(
                                                    "flex items-center gap-1 px-2 py-0.5 rounded text-xs font-black uppercase tracking-wider transition-all",
                                                    disabled ? "bg-gray-100 text-gray-300 cursor-not-allowed" :
                                                    allChecked ? "bg-blue-500 text-white hover:bg-blue-600" :
                                                    "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                                                )}
                                            >
                                                {allChecked ? <CheckSquare size={12} /> : <Square size={12} />}
                                                {PERM_LABELS[field]}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                            <div className="flex-1 overflow-auto min-h-0">
                                {!selectedUnico ? (
                                    <div className="h-40 flex flex-col items-center justify-center text-gray-300 gap-2">
                                        <Shield size={32} className="opacity-20" />
                                        <p className="text-xs font-bold uppercase tracking-widest">Select a user to view permissions</p>
                                    </div>
                                ) : filteredPerms.length === 0 ? (
                                    <div className="h-40 flex items-center justify-center text-gray-400 text-xs font-bold italic">
                                        {loadingPerms ? "Loading permissions..." : "No permissions found"}
                                    </div>
                                ) : (
                                    <table className="min-w-full text-[13px] font-normal text-left">
                                        <thead className="bg-[#4F4F4F] text-white font-bold text-[12px] uppercase sticky top-0 z-10">
                                            <tr>
                                                {PERM_FIELDS.map(f => (
                                                    <th key={f} className="p-2 text-center whitespace-nowrap">
                                                        {PERM_LABELS[f]}
                                                    </th>
                                                ))}
                                                <th className="p-2 whitespace-nowrap">Screen</th>
                                                <th className="p-2 whitespace-nowrap">Module</th>
                                                <th className="p-2 whitespace-nowrap">Company</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredPerms.map((p: any) => {
                                                const local     = localPerms.find(lp => lp.unico === p.unico) ?? p;
                                                const dimmed    = !local.acceso;
                                                return (
                                                    <tr
                                                        key={p.unico}
                                                        className={cn(
                                                            "border-b border-[#DBD9D9] transition-colors",
                                                            dimmed ? "opacity-40" : "bg-[#22C55E]/5 hover:bg-[#22C55E]/10"
                                                        )}
                                                    >
                                                        {PERM_FIELDS.map(field => {
                                                            const checked  = Boolean(local[field]);
                                                            const disabled = !editMode ||
                                                                (isVisitor && (field === "crear" || field === "editar" || field === "borrar"));
                                                            return (
                                                                <td key={field} className="p-1.5 text-center border-r border-[#DBD9D9]">
                                                                    <button
                                                                        onClick={() => togglePerm(p.unico, field)}
                                                                        disabled={disabled}
                                                                        className={cn(
                                                                            "w-5 h-5 rounded flex items-center justify-center mx-auto transition-all",
                                                                            disabled ? "cursor-default" : "cursor-pointer hover:scale-110",
                                                                            checked
                                                                                ? "bg-[#22C55E] text-white"
                                                                                : "bg-white border border-[#DBD9D9] text-transparent"
                                                                        )}
                                                                    >
                                                                        <Check size={11} />
                                                                    </button>
                                                                </td>
                                                            );
                                                        })}
                                                        <td className={cn("p-2 border-r border-[#DBD9D9] truncate max-w-[180px] font-normal", !dimmed && "text-[#22C55E]")}>
                                                            {String(p.pantalla || "").trim()}
                                                        </td>
                                                        <td className={cn("p-2 border-r border-[#DBD9D9] truncate max-w-[150px]", !dimmed ? "text-[#22C55E]" : "text-gray-500")}>
                                                            {String(p.modulo || "").trim()}
                                                        </td>
                                                        <td className={cn("p-2 truncate max-w-[120px]", !dimmed ? "text-[#22C55E]" : "text-gray-400")}>
                                                            {String(p.empresa || "").trim()}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </PanelGrid>
                </div>
            </div>

            {/* Mobile Action Bar — User Information + Screen Permissions actions */}
            <div className={cn(
                "lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-in-out pb-4 pt-2 px-2",
                selectedUnico ? "translate-y-0" : "translate-y-full"
            )}>
                <div className="flex items-center gap-1 overflow-x-auto px-4 scrollbar-none justify-center">
                    {!editMode ? (
                        <>
                            <button onClick={handleEdit} disabled={!selectedUnico || !perms.canEdit}
                                className="flex flex-col items-center gap-1 text-gray-600 disabled:opacity-50 transition-colors hover:text-[#FB7506] min-w-[56px] shrink-0">
                                <Pencil size={20} className={perms.canEdit ? "text-[#FB7506]" : "text-gray-400"} />
                                <span className="text-[9px] font-black uppercase tracking-wider">Edit</span>
                            </button>
                            <div className="w-px h-8 bg-gray-200 shrink-0 mx-2" />
                            <button onClick={() => setCopyModal({ mode: "from" })} disabled={!selectedUnico}
                                className="flex flex-col items-center gap-1 text-gray-600 disabled:opacity-50 transition-colors hover:text-gray-800 min-w-[56px] shrink-0">
                                <Copy size={20} className="text-gray-500" />
                                <span className="text-[9px] font-black uppercase tracking-wider">Copy From</span>
                            </button>
                            <button onClick={() => setCopyModal({ mode: "to" })} disabled={!selectedUnico}
                                className="flex flex-col items-center gap-1 text-gray-600 disabled:opacity-50 transition-colors hover:text-gray-800 min-w-[56px] shrink-0">
                                <Copy size={20} className="text-gray-500" />
                                <span className="text-[9px] font-black uppercase tracking-wider">Copy To</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={handleSave} disabled={saving || !perms.canEdit}
                                className="flex flex-col items-center gap-1 text-gray-600 disabled:opacity-50 transition-colors hover:text-green-600 min-w-[56px] shrink-0">
                                {saving ? <RefreshCcw size={20} className="text-green-500 animate-spin" /> : <Save size={20} className="text-green-500" />}
                                <span className="text-[9px] font-black uppercase tracking-wider">{saving ? "Saving" : "Save"}</span>
                            </button>
                            <div className="w-px h-8 bg-gray-200 shrink-0 mx-2" />
                            <button onClick={handleCancel}
                                className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-800 transition-colors min-w-[56px] shrink-0">
                                <X size={20} />
                                <span className="text-[9px] font-black uppercase tracking-wider">Cancel</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Mobile floating button — opens user list */}
            <button
                onClick={() => setMobileUsersOpen(true)}
                className={cn(
                    "lg:hidden fixed right-6 z-40 w-12 h-12 bg-[#FB7506] hover:bg-orange-600 text-white rounded-full shadow-xl flex items-center justify-center transition-all active:scale-95",
                    selectedUnico ? "bottom-24" : "bottom-6"
                )}
                title="Select User"
            >
                <Users size={20} />
            </button>

            {/* Mobile user list modal */}
            {mobileUsersOpen && (
                <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
                        <div className="h-10 bg-[#4F4F4F] flex items-center justify-between px-4 border-b border-black/10 shrink-0">
                            <div className="flex items-center gap-2">
                                <Users size={16} className="text-[#FB7506]" />
                                <span className="fos-grid-header-text">Select User</span>
                            </div>
                            <button onClick={() => setMobileUsersOpen(false)}
                                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="p-3 border-b border-gray-100 shrink-0">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    placeholder="Search users..."
                                    className="w-full pl-9 pr-3 h-10 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#FB7506]"
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="overflow-y-auto flex-1">
                            {(filteredUsers as any[]).map((u: any) => {
                                const isSelected = selectedUnico === u.unico;
                                return (
                                    <div
                                        key={u.unico}
                                        onClick={() => { handleSelectUser(u.unico); setMobileUsersOpen(false); }}
                                        className={cn(
                                            "px-4 py-3 border-b border-[#DBD9D9] flex items-center gap-3 cursor-pointer transition-colors",
                                            isSelected ? "bg-[#FB7506]/10" : "hover:bg-gray-50"
                                        )}
                                    >
                                        <div className={cn("w-2 h-2 rounded-full shrink-0", u.activo ? "bg-green-400" : "bg-gray-300")} />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-gray-800 truncate">{String(u.full_name || "").trim()}</p>
                                            <p className="text-xs text-gray-400">{String(u.usuario || "").trim()} · {String(u.nivel || "").trim()}</p>
                                        </div>
                                        {isSelected && <Check size={16} className="text-blue-500 shrink-0" />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            <AppFooter areaLabel="System Management" database="Sistema" />

            {/* ── Copy Modal ────────────────────────────────────────────────── */}
            {copyModal && selectedUser && (
                <CopyAccessModal
                    mode={copyModal.mode}
                    currentUser={selectedUser}
                    allUsers={users}
                    onClose={() => setCopyModal(null)}
                    onCopied={() => { refetchPerms(); setCopyModal(null); }}
                />
            )}
        </div>
    );
}

// ─── Copy Access Modal ────────────────────────────────────────────────────────
function CopyAccessModal({ mode, currentUser, allUsers, onClose, onCopied }: {
    mode:        "from" | "to";
    currentUser: any;
    allUsers:    any[];
    onClose:     () => void;
    onCopied:    () => void;
}) {
    const [targetUq, setTargetUq]   = useState("");
    const [loading,  setLoading]    = useState(false);
    const [search,   setSearch]     = useState("");
    const [ddOpen,   setDdOpen]     = useState(false);
    const [display,  setDisplay]    = useState("");

    const filtered = useMemo(() => {
        const others = allUsers.filter((u: any) => u.unico !== currentUser.unico);
        if (!search.trim()) return others.slice(0, 80);
        const q = search.toLowerCase();
        return others.filter((u: any) =>
            String(u.full_name || "").toLowerCase().includes(q) ||
            String(u.usuario   || "").toLowerCase().includes(q)
        ).slice(0, 80);
    }, [allUsers, search, currentUser.unico]);

    const handleConfirm = async () => {
        if (!targetUq) { toast.error(mode === "from" ? "Source user is empty." : "Target user is empty."); return; }
        setLoading(true);
        try {
            const body = mode === "from"
                ? { userfrom_uq: targetUq,            userto_uq:   currentUser.unico }
                : { userfrom_uq: currentUser.unico,   userto_uq:   targetUq          };
            const res  = await fetch("/api/system/access/copy", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (data.success) {
                toast.success(data.message || "Access copied successfully.");
                onCopied();
            } else {
                toast.error(data.error || "Copy failed.");
            }
        } catch (e: any) { toast.error(e.message); }
        finally { setLoading(false); }
    };

    const currentName = `${String(currentUser.nombres || "").trim()} ${String(currentUser.apellidos || "").trim()}`;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="h-10 bg-[#4F4F4F] flex items-center justify-between pl-3 pr-2 border-b border-black/10 shrink-0">
                    <div className="flex items-center gap-2">
                        <Copy size={16} className="text-[#FB7506]" />
                        <span className="fos-grid-header-text">
                            {mode === "from" ? "Copy Access From" : "Copy Access To"}
                        </span>
                    </div>
                    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors">
                        <X size={16} />
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    {/* Current user */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-[11px] font-black text-green-600 uppercase tracking-wider mb-1">Current User</p>
                        <p className="font-black text-sm text-gray-800">{currentName}</p>
                        <p className="text-xs text-gray-500">{String(currentUser.usuario || "").trim()}</p>
                    </div>

                    {/* Target user combobox */}
                    <div className="flex flex-col gap-1 relative">
                        <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">
                            {mode === "from" ? "Copy From (Source)" : "Copy To (Target)"}
                        </label>
                        <div
                            className="fos-input flex items-center justify-between cursor-pointer gap-2"
                            onClick={() => setDdOpen(o => !o)}
                        >
                            <span className={cn("truncate text-sm", !display ? "text-gray-400" : "text-gray-700 font-medium")}>
                                {display || "— Select user —"}
                            </span>
                            <ChevronRight size={12} className={cn("text-gray-400 shrink-0 transition-transform", ddOpen && "rotate-90")} />
                        </div>
                        {ddOpen && (
                            <div className="absolute top-full left-0 right-0 z-[200] bg-white border border-gray-200 rounded-lg shadow-2xl mt-0.5 flex flex-col max-h-56">
                                <div className="p-2 border-b border-gray-100 shrink-0">
                                    <input
                                        autoFocus
                                        type="text"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        placeholder="Type to filter..."
                                        className="fos-input h-10 text-sm"
                                        onClick={e => e.stopPropagation()}
                                    />
                                </div>
                                <div className="overflow-auto flex-1">
                                    {filtered.map((u: any) => (
                                        <div
                                            key={u.unico}
                                            onMouseDown={() => {
                                                setTargetUq(u.unico);
                                                setDisplay(String(u.full_name || "").trim());
                                                setSearch(""); setDdOpen(false);
                                            }}
                                            className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-b-0 flex items-center gap-2"
                                        >
                                            <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", u.activo ? "bg-green-400" : "bg-gray-300")} />
                                            <div>
                                                <p className="font-semibold text-gray-800">{String(u.full_name || "").trim()}</p>
                                                <p className="text-xs text-gray-400">{String(u.usuario || "").trim()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-2 pb-1">
                        <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                        <button
                            onClick={handleConfirm}
                            disabled={loading || !targetUq}
                            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#FB7506] hover:bg-orange-600 disabled:opacity-40 text-white text-sm font-black uppercase tracking-wider transition-all"
                        >
                            {loading ? <RefreshCcw size={14} className="animate-spin" /> : <Check size={14} />}
                            {loading ? "Copying..." : "Confirm"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
