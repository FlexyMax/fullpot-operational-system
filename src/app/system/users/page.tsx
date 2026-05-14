"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    ArrowLeft, Search, Plus, Trash2, Pencil, Save, X,
    RefreshCcw, Users, Camera, Check, AlertCircle,
    Calendar, Filter, ChevronRight, UserCircle2, XCircle
} from "lucide-react";
import { useAuditLog } from "@/lib/audit";
import { AuditLogModal } from "@/components/AuditLogModal";
import { cn } from "@/lib/utils";
import { todayEST, formatDateEST, normalizeToISODate } from "@/lib/dates";

// ─── Constants ────────────────────────────────────────────────────────────────
const LEVELS = ["ADMINISTRADOR", "DIGITADOR 1", "DIGITADOR 2", "VISITANTE"];

const EMPTY_FORM = {
    unico: "", cedula: "", nombres: "", apellidos: "", username: "",
    clave: "", nivel: "", cargo: "", correo: "", image: "",
    activo: true, windows_usuario: "", windows_password: "",
};

type UserForm = typeof EMPTY_FORM;
type Mode = "view" | "add" | "edit";

const sysFetch = async (url: string) => {
    const r = await fetch(url);
    const json = await r.json();
    if (!r.ok) throw new Error(json?.error || `HTTP ${r.status}`);
    return json;
};

const generateUsername = (nombres: string, apellidos: string) => {
    const first = nombres.trim().charAt(0).toLowerCase();
    const last  = apellidos.trim().replace(/\s/g, "").substring(0, 9).toLowerCase();
    return first + last;
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function UsersDefinitionPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const qc     = useQueryClient();
    const { logAction } = useAuditLog("users-definition", "usuarios");

    const [selectedUnico,  setSelectedUnico]  = useState<string | null>(null);
    const [mode,           setMode]           = useState<Mode>("view");
    const [form,           setForm]           = useState<UserForm>(EMPTY_FORM);
    const [formError,      setFormError]      = useState<string | null>(null);
    const [saveMsg,        setSaveMsg]        = useState<string | null>(null);
    const [saving,         setSaving]         = useState(false);
    const [searchTerm,     setSearchTerm]     = useState("");
    const [mobileOpen,     setMobileOpen]     = useState(false);
    const [photoPreview,   setPhotoPreview]   = useState<string | null>(null);
    const [photoFile,      setPhotoFile]      = useState<File | null>(null);
    const [logFrom,        setLogFrom]        = useState(() => {
        const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().split("T")[0];
    });
    const [logTo,          setLogTo]          = useState(todayEST);
    const [logEnabled,     setLogEnabled]     = useState(false);
    const [deleteDialog,   setDeleteDialog]   = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
    }, [status, router]);

    // ── Queries ───────────────────────────────────────────────────────────────
    const { data: users = [], isFetching: loadingUsers } = useQuery({
        queryKey: ["sys-users-list"],
        queryFn:  () => sysFetch("/api/system/users"),
    });

    const { data: logData = [], isFetching: loadingLog, refetch: refetchLog } = useQuery({
        queryKey: ["sys-user-log", selectedUnico, logFrom, logTo],
        queryFn:  () => sysFetch(`/api/system/users/${selectedUnico}/log?from=${logFrom}&to=${logTo}`),
        enabled:  !!selectedUnico && logEnabled,
        retry:    false,
    });

    // ── Auto-select first user ─────────────────────────────────────────────────
    useEffect(() => {
        if ((users as any[]).length > 0 && !selectedUnico) {
            handleSelectUser((users as any[])[0].unico);
        }
    }, [users]);

    // ── Select user ───────────────────────────────────────────────────────────
    const handleSelectUser = (unico: string) => {
        if (mode !== "view") return;
        const u = (users as any[]).find(x => x.unico === unico);
        if (!u) return;
        setSelectedUnico(unico);
        setForm({
            unico:            u.unico            ?? "",
            cedula:           String(u.cedula    || "").trim(),
            nombres:          String(u.nombres   || "").trim(),
            apellidos:        String(u.apellidos || "").trim(),
            username:         String(u.username  || "").trim(),
            clave:            String(u.clave     || "").trim(),
            nivel:            String(u.nivel     || "").trim(),
            cargo:            String(u.cargo     || "").trim(),
            correo:           String(u.correo    || "").trim(),
            image:            String(u.image     || "").trim(),
            activo:           Boolean(u.activo),
            windows_usuario:  String(u.windows_usuario  || "").trim(),
            windows_password: String(u.windows_password || "").trim(),
        });
        setPhotoPreview(null);
        setPhotoFile(null);
        setFormError(null);
        setLogEnabled(false);
        setMobileOpen(false);
    };

    // ── Mode handlers ─────────────────────────────────────────────────────────
    const handleAdd = () => {
        setForm({ ...EMPTY_FORM });
        setPhotoPreview(null); setPhotoFile(null);
        setMode("add"); setFormError(null);
    };

    const handleEdit = () => {
        if (!selectedUnico) return;
        setMode("edit"); setFormError(null);
    };

    const handleCancel = () => {
        if (mode === "add") {
            if (selectedUnico) handleSelectUser(selectedUnico);
            else setForm(EMPTY_FORM);
        } else {
            if (selectedUnico) handleSelectUser(selectedUnico);
        }
        setMode("view"); setFormError(null); setPhotoFile(null); setPhotoPreview(null);
    };

    // ── Validation ────────────────────────────────────────────────────────────
    const validate = (): string | null => {
        if (!form.nombres.trim())   return "First name is required.";
        if (!form.apellidos.trim()) return "Last name is required.";
        if (!form.username.trim())  return "Username for the system is required.";
        if (!form.clave.trim())     return "Password is required.";
        if (!form.image.trim())     return "Image is required.";
        if (!form.nivel.trim())     return "Level is required.";
        return null;
    };

    // ── Save ──────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        const err = validate();
        if (err) { setFormError(err); return; }
        setSaving(true); setFormError(null);
        try {
            let unico = selectedUnico;
            if (mode === "add") {
                const res  = await fetch("/api/system/users", {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form),
                });
                const data = await res.json();
                if (!data.success) throw new Error(data.error || "Create failed");
                unico = data.unico;
                logAction("Insert", unico!);
            } else {
                const res  = await fetch(`/api/system/users/${unico}`, {
                    method: "PUT", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form),
                });
                const data = await res.json();
                if (!data.success) throw new Error(data.error || "Update failed");
            }

            // Upload photo if selected
            if (photoFile && unico) {
                const fd = new FormData();
                fd.append("photo", photoFile);
                await fetch(`/api/system/users/${unico}/photo`, { method: "POST", body: fd });
            }

            await qc.invalidateQueries({ queryKey: ["sys-users-list"] });
            setSelectedUnico(unico);
            if (mode === "edit") logAction("Edit", unico!);
            setSaveMsg(mode === "add" ? "User created." : "User updated.");
            setTimeout(() => setSaveMsg(null), 3000);
            setMode("view");
            setPhotoFile(null);
        } catch (e: any) {
            setFormError(e.message);
        } finally {
            setSaving(false);
        }
    };

    // ── Delete ────────────────────────────────────────────────────────────────
    const handleDelete = async () => {
        if (!selectedUnico) return;
        setSaving(true);
        try {
            const res  = await fetch(`/api/system/users/${selectedUnico}`, { method: "DELETE" });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            await qc.invalidateQueries({ queryKey: ["sys-users-list"] });
            logAction("Delete", selectedUnico!);
            setSelectedUnico(null);
            setForm(EMPTY_FORM);
            setDeleteDialog(false);
            setSaveMsg("User deleted.");
            setTimeout(() => setSaveMsg(null), 3000);
        } catch (e: any) {
            setFormError(e.message);
            setDeleteDialog(false);
        } finally {
            setSaving(false);
        }
    };

    // ── Photo ─────────────────────────────────────────────────────────────────
    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
    };

    // ── Filtered users ────────────────────────────────────────────────────────
    const filteredUsers = useMemo(() => {
        if (!searchTerm.trim()) return users as any[];
        const q = searchTerm.toLowerCase();
        return (users as any[]).filter(u =>
            String(u.apellidos || "").toLowerCase().includes(q) ||
            String(u.nombres   || "").toLowerCase().includes(q) ||
            String(u.username  || "").toLowerCase().includes(q)
        );
    }, [users, searchTerm]);

    const isEditing = mode === "edit" || mode === "add";

    // ── Photo URL ─────────────────────────────────────────────────────────────
    const photoSrc = photoPreview
        ? photoPreview
        : selectedUnico
            ? `/api/system/users/${selectedUnico}/photo`
            : null;

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
                        <Users size={14} className="text-[#FB7506]" />
                        <span className="font-bold text-xs uppercase tracking-tight">User Setup</span>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-gray-400">User: <span className="text-white">{session?.user?.name}</span></span>
                    <span className="text-green-500 font-black">● Online</span>
                </div>
            </div>

            {/* Main layout */}
            <div className="flex flex-col lg:flex-row flex-1 gap-2 p-2 overflow-y-auto lg:overflow-hidden">

                {/* ── Left: User List (desktop) ────────────────────────────── */}
                <div className="hidden lg:flex w-[240px] shrink-0 flex-col gap-2">
                    <div className="flex flex-col flex-1 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        <div className="h-8 bg-[#374151] flex items-center justify-between px-3 shrink-0">
                            <div className="flex items-center gap-2">
                                <Users size={13} className="text-[#FB7506]" />
                                <span className="font-black text-[10px] uppercase tracking-widest text-white">Users</span>
                            </div>
                            {loadingUsers && <RefreshCcw size={10} className="text-gray-400 animate-spin" />}
                        </div>
                        <div className="p-2 border-b border-gray-100 shrink-0">
                            <div className="relative">
                                <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                    placeholder="Search users..." className="w-full pl-7 pr-2 py-1 text-xs border border-gray-200 rounded outline-none focus:ring-1 focus:ring-[#FB7506]" />
                            </div>
                        </div>
                        <div className="text-[9px] font-black text-gray-400 uppercase px-2 py-0.5 bg-gray-50 border-b text-right">
                            {filteredUsers.length} users
                        </div>
                        <div className="overflow-y-auto flex-1">
                            {filteredUsers.map((u: any) => {
                                const isSelected = selectedUnico === u.unico;
                                return (
                                    <div key={u.unico} onClick={() => handleSelectUser(u.unico)}
                                        className={cn(
                                            "px-3 py-2 border-b border-gray-50 flex items-center gap-2 transition-colors",
                                            isEditing ? "cursor-not-allowed opacity-60" : "cursor-pointer",
                                            isSelected ? "!bg-blue-100 ring-2 ring-inset ring-blue-300" : "hover:bg-blue-50"
                                        )}>
                                        <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", u.activo ? "bg-green-400" : "bg-gray-300")} />
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-gray-800 truncate">
                                                {String(u.apellidos || "").trim()}, {String(u.nombres || "").trim()}
                                            </p>
                                            <p className="text-[9px] text-gray-400 truncate">{String(u.username || "").trim()} · {String(u.nivel || "").trim()}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ── Right: Form + Log ─────────────────────────────────────── */}
                <div className="flex-1 flex flex-col gap-2 min-w-0 lg:overflow-hidden">

                    {/* User Form Card */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm shrink-0">
                        {/* Form header bar */}
                        <div className="h-9 bg-[#374151] flex items-center justify-between px-3 rounded-t-lg">
                            <div className="flex items-center gap-2">
                                <Users size={13} className="text-[#FB7506]" />
                                <span className="font-black text-[10px] uppercase tracking-widest text-white">
                                    {mode === "add" ? "New User" : "User Information"}
                                </span>
                                <AuditLogModal recordId={selectedUnico} disabled={!selectedUnico} />
                                {mode === "view" && form.unico && (
                                    <span className={cn(
                                        "text-[8px] font-black uppercase px-2 py-0.5 rounded",
                                        form.activo ? "bg-green-500 text-white" : "bg-red-500 text-white"
                                    )}>
                                        {form.activo ? "Active" : "Inactive"}
                                    </span>
                                )}
                                {formError && (
                                    <span className="flex items-center gap-1 text-amber-400 text-[9px] font-bold ml-1">
                                        <AlertCircle size={11} />{formError}
                                    </span>
                                )}
                                {saveMsg && (
                                    <span className="flex items-center gap-1 text-green-400 text-[9px] font-bold ml-1">
                                        <Check size={11} />{saveMsg}
                                    </span>
                                )}
                            </div>
                            {/* Action buttons */}
                            <div className="flex items-center gap-1.5">
                                {mode === "view" ? (
                                    <>
                                        <button onClick={handleAdd}
                                            className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all">
                                            <Plus size={10} /> Add
                                        </button>
                                        <button onClick={handleEdit} disabled={!selectedUnico}
                                            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all">
                                            <Pencil size={10} /> Edit
                                        </button>
                                        <button onClick={() => { if (selectedUnico) setDeleteDialog(true); }} disabled={!selectedUnico}
                                            className="flex items-center gap-1 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all">
                                            <Trash2 size={10} /> Delete
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={handleSave} disabled={saving}
                                            className="flex items-center gap-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all">
                                            {saving ? <RefreshCcw size={10} className="animate-spin" /> : <Save size={10} />}
                                            {saving ? "Saving..." : "Save"}
                                        </button>
                                        <button onClick={handleCancel}
                                            className="flex items-center gap-1 bg-gray-500 hover:bg-gray-600 text-white px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all">
                                            <X size={10} /> Cancel
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Form body */}
                        <div className="p-3 flex gap-4">
                            {/* Photo column */}
                            <div className="flex flex-col items-center gap-2 shrink-0 w-20">
                                <div className="w-20 h-20 rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center">
                                    {photoSrc ? (
                                        <img src={photoSrc} alt="User" className="w-full h-full object-cover"
                                            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                                    ) : (
                                        <UserCircle2 size={40} className="text-gray-300" />
                                    )}
                                </div>
                                {isEditing && (
                                    <>
                                        <button onClick={() => fileRef.current?.click()}
                                            className="flex items-center gap-1 bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-[8px] font-black uppercase tracking-wide w-full justify-center transition-all">
                                            <Camera size={9} /> Photo
                                        </button>
                                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
                                    </>
                                )}
                            </div>

                            {/* Fields grid */}
                            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2 text-xs">
                                {[
                                    { label: "Code",       key: "unico",    readonly: true },
                                    { label: "ID / Cédula",key: "cedula",   readonly: false },
                                    { label: "First Name", key: "nombres",  readonly: false },
                                    { label: "Last Name",  key: "apellidos",readonly: false },
                                    { label: "Username",   key: "username", readonly: false },
                                    { label: "Password",   key: "clave",    readonly: false, type: "password" },
                                    { label: "Position",   key: "cargo",    readonly: false },
                                    { label: "E-mail",     key: "correo",   readonly: false },
                                    { label: "W. User",    key: "windows_usuario",  readonly: false },
                                    { label: "W. Password",key: "windows_password", readonly: false },
                                    { label: "Image",      key: "image",    readonly: false },
                                ].map(f => (
                                    <div key={f.key} className="flex flex-col gap-0.5">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{f.label}</label>
                                        <input
                                            type={f.type || "text"}
                                            value={(form as any)[f.key] || ""}
                                            readOnly={!isEditing || f.readonly}
                                            onChange={e => {
                                                const val = e.target.value;
                                                setForm(prev => {
                                                    const next = { ...prev, [f.key]: val };
                                                    if (f.key === "apellidos" && mode === "add") {
                                                        next.username = generateUsername(prev.nombres, val);
                                                    }
                                                    if (f.key === "nombres" && mode === "add") {
                                                        next.username = generateUsername(val, prev.apellidos);
                                                    }
                                                    return next;
                                                });
                                            }}
                                            className={cn(
                                                "fos-input text-xs py-1",
                                                (!isEditing || f.readonly) && "bg-gray-50 text-gray-500 cursor-default"
                                            )}
                                        />
                                    </div>
                                ))}

                                {/* Level + Active */}
                                <div className="flex flex-col gap-0.5">
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Level</label>
                                    {isEditing ? (
                                        <select value={form.nivel}
                                            onChange={e => setForm(prev => ({ ...prev, nivel: e.target.value }))}
                                            className="fos-input text-xs py-1">
                                            <option value="">— Select —</option>
                                            {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                                        </select>
                                    ) : (
                                        <input readOnly value={form.nivel} className="fos-input text-xs py-1 bg-gray-50 text-gray-500" />
                                    )}
                                </div>

                                <div className="flex flex-col gap-0.5 justify-center">
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Active</label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={Boolean(form.activo)}
                                            disabled={!isEditing || mode === "add"}
                                            onChange={e => setForm(prev => ({ ...prev, activo: e.target.checked }))}
                                            className="w-4 h-4 accent-[#FB7506]" />
                                        <span className={cn("text-xs font-semibold", form.activo ? "text-green-600" : "text-gray-400")}>
                                            {form.activo ? "Yes" : "No"}
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Activity Log */}
                    <div className="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex-1 min-h-[200px] lg:min-h-0">
                        <div className="h-9 bg-[#374151] flex items-center justify-between px-3 shrink-0">
                            <div className="flex items-center gap-2">
                                <Calendar size={13} className="text-[#FB7506]" />
                                <span className="font-black text-[10px] uppercase tracking-widest text-white">User Activity Log</span>
                                <AuditLogModal recordId={selectedUnico} disabled={!selectedUnico} />
                                {loadingLog && <RefreshCcw size={10} className="text-gray-400 animate-spin" />}
                            </div>
                            {/* Date filters — view mode only */}
                            {mode === "view" && (
                                <div className="flex items-center gap-2">
                                    <input type="date" value={logFrom} onChange={e => setLogFrom(e.target.value)}
                                        className="bg-gray-700 text-white text-[9px] border-none outline-none rounded px-1.5 py-0.5 w-28" />
                                    <span className="text-gray-500 text-[9px]">→</span>
                                    <input type="date" value={logTo} onChange={e => setLogTo(e.target.value)}
                                        className="bg-gray-700 text-white text-[9px] border-none outline-none rounded px-1.5 py-0.5 w-28" />
                                    <button onClick={() => { setLogEnabled(true); refetchLog(); }}
                                        className="flex items-center gap-1 bg-[#FB7506] hover:bg-orange-600 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider transition-all">
                                        <Filter size={9} /> Filter
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="overflow-auto flex-1">
                            {!logEnabled ? (
                                <div className="h-32 flex flex-col items-center justify-center text-gray-300 gap-2">
                                    <Calendar size={28} className="opacity-20" />
                                    <p className="text-xs font-bold uppercase tracking-widest">Select date range and click Filter</p>
                                </div>
                            ) : logData.length === 0 ? (
                                <div className="h-32 flex items-center justify-center text-gray-400 text-xs font-bold italic">
                                    {loadingLog ? "Loading activity..." : "No activity found for selected dates"}
                                </div>
                            ) : (
                                <table className="min-w-full text-xs text-left">
                                    <thead className="bg-gray-100 border-b text-gray-700 font-bold sticky top-0 z-10">
                                        <tr>
                                            <th className="p-2 whitespace-nowrap">Date</th>
                                            <th className="p-2 border-l border-gray-200 whitespace-nowrap">Action</th>
                                            <th className="p-2 border-l border-gray-200 whitespace-nowrap">Screen</th>
                                            <th className="p-2 border-l border-gray-200 whitespace-nowrap">Module</th>
                                            <th className="p-2 border-l border-gray-200 whitespace-nowrap">Company</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(logData as any[]).map((row: any, i: number) => (
                                            <tr key={i} className="border-b odd:bg-white even:bg-gray-50 hover:bg-blue-50 transition-colors">
                                                <td className="p-2 whitespace-nowrap text-gray-600">
                                                    {row.fecha ? new Date(row.fecha).toLocaleString("en-US", { timeZone: "America/New_York" }) : ""}
                                                </td>
                                                <td className="p-2 border-l border-gray-100 font-semibold text-blue-700 whitespace-nowrap">
                                                    {String(row.accion || "").trim()}
                                                </td>
                                                <td className="p-2 border-l border-gray-100 truncate max-w-[180px]">
                                                    {String(row.pantalla || "").trim()}
                                                </td>
                                                <td className="p-2 border-l border-gray-100 truncate max-w-[140px] text-gray-500">
                                                    {String(row.modulo || "").trim()}
                                                </td>
                                                <td className="p-2 border-l border-gray-100 text-gray-400">
                                                    {String(row.empresa || "").trim()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        <div className="px-3 py-1.5 bg-gray-50 border-t text-[9px] font-bold text-gray-400 uppercase tracking-widest text-right">
                            {logEnabled ? `${(logData as any[]).length} records` : ""}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="h-8 bg-gray-100 border-t px-4 flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-tight shrink-0">
                <div className="flex items-center gap-4">
                    <span>Server: Production</span>
                    <span className="text-gray-300">|</span>
                    <span>Database: Sistema</span>
                </div>
                <span className="text-[#FB7506]">FOS User Management V.2.0.1</span>
            </div>

            {/* Mobile floating button */}
            <button onClick={() => setMobileOpen(true)}
                className="lg:hidden fixed bottom-6 right-6 z-40 w-12 h-12 bg-[#FB7506] hover:bg-orange-600 text-white rounded-full shadow-xl flex items-center justify-center transition-all active:scale-95">
                <Users size={20} />
            </button>

            {/* Mobile user list */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex flex-col">
                    <div className="bg-white flex flex-col max-h-[80vh] mt-auto rounded-t-2xl overflow-hidden">
                        <div className="h-12 bg-[#374151] flex items-center justify-between px-4 shrink-0 rounded-t-2xl">
                            <span className="font-black text-sm uppercase tracking-widest text-white">Select User</span>
                            <button onClick={() => setMobileOpen(false)}><XCircle size={20} className="text-gray-400 hover:text-white" /></button>
                        </div>
                        <div className="p-3 border-b shrink-0">
                            <div className="relative">
                                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                    placeholder="Search..." autoFocus
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#FB7506]" />
                            </div>
                        </div>
                        <div className="overflow-y-auto flex-1">
                            {filteredUsers.map((u: any) => (
                                <div key={u.unico} onClick={() => handleSelectUser(u.unico)}
                                    className="px-4 py-3 border-b flex items-center gap-3 cursor-pointer hover:bg-gray-50">
                                    <div className={cn("w-2 h-2 rounded-full shrink-0", u.activo ? "bg-green-400" : "bg-gray-300")} />
                                    <div>
                                        <p className="text-sm font-semibold">{String(u.apellidos || "").trim()}, {String(u.nombres || "").trim()}</p>
                                        <p className="text-xs text-gray-400">{String(u.username || "").trim()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Delete confirmation */}
            {deleteDialog && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                        <div className="p-6 flex flex-col items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                                <Trash2 size={24} className="text-red-600" />
                            </div>
                            <div className="text-center">
                                <h3 className="font-black text-gray-900 text-base mb-1">Delete User?</h3>
                                <p className="text-sm text-gray-500">
                                    Delete <strong>{form.apellidos.trim()}, {form.nombres.trim()}</strong>?
                                    This cannot be undone.
                                </p>
                                {formError && <p className="text-xs text-red-500 mt-2 font-bold">{formError}</p>}
                            </div>
                        </div>
                        <div className="flex border-t border-gray-100">
                            <button onClick={() => { setDeleteDialog(false); setFormError(null); }}
                                className="flex-1 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 border-r border-gray-100">Cancel</button>
                            <button onClick={handleDelete} disabled={saving}
                                className="flex-1 py-3 text-sm font-black text-red-600 hover:bg-red-50 disabled:opacity-50">
                                {saving ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
