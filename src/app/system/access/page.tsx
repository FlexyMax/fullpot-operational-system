"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    ArrowLeft, Search, Pencil, Check, X, XCircle, RefreshCcw,
    Users, Shield, Copy, Save, AlertCircle, CheckSquare, Square,
    Building2, LayoutGrid, UserCheck, ChevronRight
} from "lucide-react";
import { useAuditLog } from "@/lib/audit";
import { AuditLogModal } from "@/components/AuditLogModal";
import { cn } from "@/lib/utils";

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
    const { data: session, status } = useSession();
    const router = useRouter();
    const qc = useQueryClient();
    const { logAction } = useAuditLog("access-definition", "usuarios_accesos");

    const [selectedUnico,  setSelectedUnico]  = useState<string | null>(null);
    const [searchTerm,     setSearchTerm]     = useState("");
    const [editMode,         setEditMode]         = useState(false);
    const [mobileUsersOpen,  setMobileUsersOpen]  = useState(false);
    const [filterCompany,    setFilterCompany]    = useState("");
    const [filterModule,   setFilterModule]   = useState("");
    const [localPerms,     setLocalPerms]     = useState<any[]>([]);
    const [copyModal,      setCopyModal]      = useState<{ mode: "from" | "to" } | null>(null);
    const [saving,         setSaving]         = useState(false);
    const [editError,      setEditError]      = useState<string | null>(null);
    const [saveMsg,        setSaveMsg]        = useState<string | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
    }, [status, router]);

    // ── Queries ───────────────────────────────────────────────────────────────
    const { data: users = [], isFetching: loadingUsers } = useQuery({
        queryKey: ["sys-users"],
        queryFn:  () => sysFetch("/api/system/access/users"),
    });

    const { data: selectedUser } = useQuery({
        queryKey: ["sys-user", selectedUnico],
        queryFn:  () => sysFetch(`/api/system/access/user?unico=${selectedUnico}`),
        enabled:  !!selectedUnico,
    });

    const { data: permissions = [], isFetching: loadingPerms, refetch: refetchPerms } = useQuery({
        queryKey: ["sys-perms", selectedUnico],
        queryFn:  () => sysFetch(`/api/system/access/permissions?unico=${selectedUnico}`),
        enabled:  !!selectedUnico,
        retry:    false,
    });

    const { data: modules   = [] } = useQuery({ queryKey: ["sys-modules"],    queryFn: () => sysFetch("/api/system/access/modules")    });
    const { data: companies = [] } = useQuery({ queryKey: ["sys-companies"],  queryFn: () => sysFetch("/api/system/access/companies")  });

    // ── Sync permissions to local state ──────────────────────────────────────
    useEffect(() => {
        setLocalPerms(permissions);
        setEditMode(false);
        setFilterCompany(""); setFilterModule("");
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
            setEditError("User isn't active.");
            return;
        }
        setEditError(null);
        try {
            await fetch("/api/system/access/initialize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ unico: selectedUnico, nivel: selectedUser.nivel }),
            });
            await refetchPerms();
            setEditMode(true);
        } catch (e: any) {
            setEditError(e.message);
        }
    };

    const handleCancel = () => {
        setLocalPerms(permissions);
        setEditMode(false);
        setEditError(null);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/system/access/permissions", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(localPerms),
            });
            const data = await res.json();
            if (data.success) {
                logAction("Edit", selectedUnico!);
                setSaveMsg(`Saved ${data.updated} records.`);
                setTimeout(() => setSaveMsg(null), 3000);
                setEditMode(false);
                refetchPerms();
            }
        } catch (e: any) {
            setEditError(e.message);
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
        setEditError(null);
    };

    if (status === "loading") return null;

    return (
        <div className="flex flex-col min-h-screen lg:h-screen bg-[#f4f6f8] lg:overflow-hidden font-sans text-[#333]">

            {/* Header */}
            <div className="h-12 bg-[#374151] flex items-center justify-between px-4 shrink-0 text-white">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push("/menu")} className="hover:bg-white/10 p-1.5 rounded transition-colors">
                        <ArrowLeft size={18} />
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="font-black text-xs uppercase tracking-widest text-[#FB7506]">FOS</span>
                        <div className="w-px h-4 bg-white/20 mx-2" />
                        <Shield size={14} className="text-[#FB7506]" />
                        <span className="font-bold text-xs uppercase tracking-tight">System Access Management</span>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-gray-400">User: <span className="text-white">{session?.user?.name}</span></span>
                    <span className="text-green-500 font-black">● Online</span>
                </div>
            </div>


            {/* Main layout */}
            <div className="flex flex-col lg:flex-row flex-1 gap-2 p-2 overflow-y-auto lg:overflow-hidden">

                {/* ── Left: User List ──────────────────────────────────────── */}
                <div className="hidden lg:flex w-[260px] shrink-0 flex-col gap-2">
                    <div className="flex flex-col flex-1 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 border-b border-black/10 shrink-0 rounded-t-lg">
                            <div className="flex items-center gap-2">
                                <Users size={16} className="text-[#FB7506]" />
                                <span className="fos-grid-header-text">Users</span>
                            </div>
                            {loadingUsers && <RefreshCcw size={16} className="text-gray-400 animate-spin" />}
                        </div>
                        <div className="p-2 border-b border-gray-100 shrink-0">
                            <div className="relative">
                                <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    placeholder="Search users..."
                                    className="w-full pl-7 pr-2 h-9 text-sm border border-gray-200 rounded outline-none focus:ring-1 focus:ring-[#FB7506]"
                                />
                            </div>
                        </div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider px-2 py-0.5 bg-gray-50 border-b text-right">
                            {filteredUsers.length} users
                        </div>
                        <div className="overflow-y-auto flex-1">
                            {(filteredUsers as any[]).map((u: any) => {
                                const isActive   = u.activo;
                                const isSelected = selectedUnico === u.unico;
                                return (
                                    <div
                                        key={u.unico}
                                        onClick={() => handleSelectUser(u.unico)}
                                        className={cn(
                                            "px-3 py-2 border-b border-gray-50 cursor-pointer transition-colors flex items-center gap-2",
                                            editMode ? "cursor-not-allowed opacity-60" : "",
                                            isSelected ? "!bg-blue-100 ring-2 ring-inset ring-blue-300" : "hover:bg-blue-50"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-1.5 h-1.5 rounded-full shrink-0",
                                            isActive ? "bg-green-400" : "bg-gray-300"
                                        )} />
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-gray-800 truncate">
                                                {String(u.full_name || "").trim()}
                                            </p>
                                            <p className="text-[9px] text-gray-400 truncate">
                                                {String(u.usuario || "").trim()} · {String(u.nivel || "").trim()}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ── Right: User Card + Filters + Grid ────────────────────── */}
                <div className="flex-1 flex flex-col gap-2 min-w-0 lg:overflow-hidden">

                    {/* User Card */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm shrink-0">
                        <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 border-b border-black/10 rounded-t-lg">
                            {/* Left: title + status badge */}
                            <div className="flex items-center gap-2">
                                <UserCheck size={16} className="text-[#FB7506]" />
                                <span className="fos-grid-header-text">User Information</span>
                                <AuditLogModal recordId={selectedUnico} disabled={!selectedUnico} />
                                {selectedUser && (
                                    <span className={cn(
                                        "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                                        selectedUser.activo ? "bg-green-500 text-white" : "bg-red-500 text-white"
                                    )}>
                                        {selectedUser.activo ? "Active" : "Inactive"}
                                    </span>
                                )}
                                {editError && (
                                    <span className="flex items-center gap-1 text-amber-400 text-[10px] font-bold ml-1">
                                        <AlertCircle size={12} />{editError}
                                    </span>
                                )}
                                {saveMsg && (
                                    <span className="flex items-center gap-1 text-green-400 text-[10px] font-bold ml-1">
                                        <Check size={12} />{saveMsg}
                                    </span>
                                )}
                            </div>
                            {/* Right: Edit -or- Save + Cancel */}
                            <div className="flex items-center gap-1.5 pr-2">
                                {!editMode ? (
                                    <button
                                        onClick={handleEdit}
                                        disabled={!selectedUnico}
                                        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-3 py-1.5 rounded text-xs font-black uppercase tracking-wider transition-all"
                                    >
                                        <Pencil size={14} /> Edit
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-1.5 rounded text-xs font-black uppercase tracking-wider transition-all"
                                        >
                                            {saving ? <RefreshCcw size={14} className="animate-spin" /> : <Save size={14} />}
                                            {saving ? "Saving..." : "Save"}
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            className="flex items-center gap-1.5 bg-gray-500 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-xs font-black uppercase tracking-wider transition-all"
                                        >
                                            <X size={14} /> Cancel
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                        {!selectedUser ? (
                            <div className="p-4 text-xs text-gray-400 italic text-center">Select a user from the list</div>
                        ) : (
                            <div className="p-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                                {[
                                    { label: "Code",       value: selectedUser.unico },
                                    { label: "Username",   value: String(selectedUser.usuario || "").trim() },
                                    { label: "First Name", value: String(selectedUser.nombres || "").trim() },
                                    { label: "Last Name",  value: String(selectedUser.apellidos || "").trim() },
                                    { label: "Level",      value: String(selectedUser.nivel || "").trim() },
                                    { label: "Password",   value: "••••••••" },
                                ].map(f => (
                                    <div key={f.label} className="flex flex-col gap-0.5">
                                        <span className="text-[11px] font-black text-gray-500 uppercase tracking-wider">{f.label}</span>
                                        <span className="font-semibold text-gray-700 truncate">{f.value || "—"}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Filter Bar */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm shrink-0 px-3 py-2 flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                            <Building2 size={16} className="text-gray-400" />
                            <select
                                value={filterCompany}
                                onChange={e => setFilterCompany(e.target.value)}
                                className="fos-input w-44 h-10 text-sm"
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
                                className="fos-input w-44 h-10 text-sm"
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
                                onClick={() => { setFilterCompany(""); setFilterModule(""); }}
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
                    <div className="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex-1 min-h-[300px] lg:min-h-0">
                        <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 border-b border-black/10 shrink-0 rounded-t-lg">
                            <div className="flex items-center gap-2">
                                <Shield size={16} className="text-[#FB7506]" />
                                <span className="fos-grid-header-text">Screen Permissions</span>
                                <AuditLogModal recordId={selectedUnico} disabled={!selectedUnico} />
                                {loadingPerms && <RefreshCcw size={16} className="text-gray-400 animate-spin" />}
                            </div>
                            {!editMode && selectedUnico && (
                                <div className="flex gap-2 pr-2">
                                    <button
                                        onClick={() => setCopyModal({ mode: "from" })}
                                        className="flex items-center gap-1.5 bg-gray-600 hover:bg-gray-500 text-white px-3 py-1.5 rounded text-xs font-black uppercase tracking-wider transition-all"
                                    >
                                        <Copy size={14} /> Copy From
                                    </button>
                                    <button
                                        onClick={() => setCopyModal({ mode: "to" })}
                                        className="flex items-center gap-1.5 bg-gray-600 hover:bg-gray-500 text-white px-3 py-1.5 rounded text-xs font-black uppercase tracking-wider transition-all"
                                    >
                                        <Copy size={14} /> Copy To
                                    </button>
                                </div>
                            )}
                        </div>

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

                        <div className="overflow-auto flex-1">
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
                                <table className="min-w-full text-xs text-left">
                                    <thead className="bg-gray-100 border-b text-gray-700 font-bold sticky top-0 z-10">
                                        <tr>
                                            {PERM_FIELDS.map(f => (
                                                <th key={f} className="p-2 text-center border-r border-gray-200 whitespace-nowrap">
                                                    {PERM_LABELS[f]}
                                                </th>
                                            ))}
                                            <th className="p-2 border-r border-gray-200 whitespace-nowrap">Screen</th>
                                            <th className="p-2 border-r border-gray-200 whitespace-nowrap">Module</th>
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
                                                        "border-b transition-colors",
                                                        dimmed ? "opacity-40" : "odd:bg-white even:bg-gray-50 hover:bg-blue-50"
                                                    )}
                                                >
                                                    {PERM_FIELDS.map(field => {
                                                        const checked  = Boolean(local[field]);
                                                        const disabled = !editMode ||
                                                            (isVisitor && (field === "crear" || field === "editar" || field === "borrar"));
                                                        return (
                                                            <td key={field} className="p-1.5 text-center border-r border-gray-100">
                                                                <button
                                                                    onClick={() => togglePerm(p.unico, field)}
                                                                    disabled={disabled}
                                                                    className={cn(
                                                                        "w-5 h-5 rounded flex items-center justify-center mx-auto transition-all",
                                                                        disabled ? "cursor-default" : "cursor-pointer hover:scale-110",
                                                                        checked
                                                                            ? "bg-green-500 text-white"
                                                                            : "bg-white border border-gray-300 text-transparent"
                                                                    )}
                                                                >
                                                                    <Check size={11} />
                                                                </button>
                                                            </td>
                                                        );
                                                    })}
                                                    <td className="p-2 border-r border-gray-100 truncate max-w-[180px] font-medium">
                                                        {String(p.pantalla || "").trim()}
                                                    </td>
                                                    <td className="p-2 border-r border-gray-100 truncate max-w-[150px] text-gray-500">
                                                        {String(p.modulo || "").trim()}
                                                    </td>
                                                    <td className="p-2 truncate max-w-[120px] text-gray-400">
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
                </div>
            </div>

            {/* Mobile floating button — opens user list */}
            <button
                onClick={() => setMobileUsersOpen(true)}
                className="lg:hidden fixed bottom-6 right-6 z-40 w-12 h-12 bg-[#FB7506] hover:bg-orange-600 text-white rounded-full shadow-xl flex items-center justify-center transition-all active:scale-95"
                title="Select User"
            >
                <Users size={20} />
            </button>

            {/* Mobile user list modal */}
            {mobileUsersOpen && (
                <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
                        <div className="h-10 bg-[#374151] flex items-center justify-between px-4 border-b border-black/10 shrink-0">
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
                                            "px-4 py-3 border-b border-gray-50 flex items-center gap-3 cursor-pointer transition-colors",
                                            isSelected ? "bg-blue-50" : "hover:bg-gray-50"
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

            {/* Footer */}
            <div className="h-8 bg-gray-100 border-t px-4 flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-tight shrink-0">
                <div className="flex items-center gap-4">
                    <span>Server: Production</span>
                    <span className="text-gray-300">|</span>
                    <span>Database: Sistema</span>
                </div>
                <span className="text-[#FB7506]">FOS System Management V.2.0.1</span>
            </div>

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
    const [error,    setError]      = useState<string | null>(null);
    const [result,   setResult]     = useState<string | null>(null);
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
        if (!targetUq) { setError(mode === "from" ? "Source user is empty." : "Target user is empty."); return; }
        setLoading(true); setError(null);
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
                setResult(data.message || "Access copied successfully.");
                setTimeout(() => onCopied(), 1500);
            } else {
                setError(data.error || "Copy failed.");
            }
        } catch (e: any) { setError(e.message); }
        finally { setLoading(false); }
    };

    const currentName = `${String(currentUser.nombres || "").trim()} ${String(currentUser.apellidos || "").trim()}`;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 border-b border-black/10 shrink-0">
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
                                                setSearch(""); setDdOpen(false); setError(null);
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

                    {error  && <p className="text-xs text-red-500 font-bold flex items-center gap-1"><AlertCircle size={12} />{error}</p>}
                    {result && <p className="text-xs text-green-600 font-bold flex items-center gap-1"><Check size={12} />{result}</p>}

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
