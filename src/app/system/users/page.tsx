"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Users, Plus, Pencil, Trash2, Calendar, Check, AlertCircle, XCircle } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import PanelGrid from "@/components/ui/PanelGrid";
import { PanelGridTable, PanelGridThead, PanelGridTh, PanelGridTbody, PanelGridTr, PanelGridTd } from "@/components/ui/PanelGridTable";
import { useUserStore } from "@/store/system/useUserStore";
import { UserUpsertModal } from "./components/UserUpsertModal";
import { UserLogModal } from "./components/UserLogModal";
import { usePagePermissions } from "@/lib/permissions";
import { cn } from "@/lib/utils";

const apiFetch = async (url: string) => { const r = await fetch(url); const j = await r.json(); if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`); return j; };

export default function UsersDefinitionPage() {
    const { status } = useSession();
    const router = useRouter();
    const qc = useQueryClient();
    const perms = usePagePermissions("users-definition");

    const {
        searchTerm, setSearchTerm, selectedRow, setSelectedRow,
        setUpsertModalOpen, setLogModalOpen, setMode
    } = useUserStore();

    const [deleteDialog, setDeleteDialog] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [delError, setDelError] = useState<string | null>(null);
    const [saveMsg, setSaveMsg] = useState<string | null>(null);

    useEffect(() => { if (status === "unauthenticated") router.push("/login"); }, [status, router]);

    const { data: users = [], isFetching } = useQuery({
        queryKey: ["sys-users-list"],
        queryFn: () => apiFetch("/api/system/users"),
    });

    const filteredUsers = useMemo(() => {
        if (!searchTerm.trim()) return users as any[];
        const q = searchTerm.toLowerCase();
        return (users as any[]).filter(u =>
            String(u.apellidos || "").toLowerCase().includes(q) ||
            String(u.nombres   || "").toLowerCase().includes(q) ||
            String(u.username  || "").toLowerCase().includes(q)
        );
    }, [users, searchTerm]);

    const handleSelect = (row: any) => {
        if (selectedRow?.unico === row.unico) setSelectedRow(null);
        else setSelectedRow(row);
    };

    const handleAdd = () => {
        setMode("add");
        setUpsertModalOpen(true);
    };

    const handleEdit = () => {
        if (!selectedRow) return;
        setMode("edit");
        setUpsertModalOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedRow) return;
        setDeleting(true); setDelError(null);
        try {
            const res = await fetch(`/api/system/users/${selectedRow.unico}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.error || "Delete failed");
            
            await qc.invalidateQueries({ queryKey: ["sys-users-list"] });
            setSelectedRow(null);
            setDeleteDialog(false);
            setSaveMsg("User deleted successfully.");
            setTimeout(() => setSaveMsg(null), 3000);
        } catch (e: any) {
            setDelError(e.message);
        } finally {
            setDeleting(false);
        }
    };

    if (status === "loading") return null;

    return (
        <div className="flex flex-col h-[100dvh] bg-[#f4f6f8] overflow-hidden font-sans text-[#333]">
            <AppHeader title="Users" />

            {/* Search toolbar */}
            <div className="bg-white border-b border-gray-200 px-3 py-2 flex items-center gap-2 shrink-0 shadow-sm flex-wrap">
                <div className="relative">
                    <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search users..." className="pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded outline-none focus:ring-1 focus:ring-[#FB7506] w-80" />
                </div>
                {saveMsg && <span className="text-green-600 text-[10px] font-bold flex items-center gap-1 ml-2"><Check size={11} />{saveMsg}</span>}
            </div>

            <PanelGrid
                title="System Users"
                icon={Users}
                recordCount={filteredUsers.length}
                refreshing={isFetching}
                menuItems={[
                    { label: "New User", icon: Plus, color: "green", onClick: handleAdd, disabled: !perms.canCreate },
                    { label: "Edit User", icon: Pencil, color: "orange", onClick: handleEdit, disabled: !selectedRow || !perms.canEdit },
                    { label: "Delete User", icon: Trash2, color: "orange", onClick: () => setDeleteDialog(true), disabled: !selectedRow || !perms.canDelete },
                    { separator: true },
                    { label: "Activity Log", icon: Calendar, color: "blue", onClick: () => setLogModalOpen(true), disabled: !selectedRow },
                ]}
                className="mx-2 mt-2 mb-3 flex-1 flex flex-col min-h-0"
            >
                <div className="overflow-auto flex-1">
                    <PanelGridTable>
                        <PanelGridThead>
                            <PanelGridTh>Code</PanelGridTh>
                            <PanelGridTh>ID / Cédula</PanelGridTh>
                            <PanelGridTh>Name</PanelGridTh>
                            <PanelGridTh>Username</PanelGridTh>
                            <PanelGridTh>E-mail</PanelGridTh>
                            <PanelGridTh className="hidden md:table-cell">Position</PanelGridTh>
                            <PanelGridTh className="hidden sm:table-cell">Level</PanelGridTh>
                            <PanelGridTh className="text-center">Active</PanelGridTh>
                        </PanelGridThead>
                        <PanelGridTbody>
                            {filteredUsers.length === 0 ? (
                                <tr><td colSpan={8} className="p-6 text-center text-gray-300 text-xs">No users found</td></tr>
                            ) : filteredUsers.map((u: any) => {
                                const isSelected = selectedRow?.unico === u.unico;
                                return (
                                    <PanelGridTr
                                        key={u.unico}
                                        selected={isSelected}
                                        onClick={() => handleSelect(u)}
                                        className="cursor-pointer"
                                    >
                                        <PanelGridTd className="font-mono text-[10px]">{u.unico}</PanelGridTd>
                                        <PanelGridTd>{String(u.cedula || "")}</PanelGridTd>
                                        <PanelGridTd className="font-semibold max-w-[180px] truncate">{String(u.apellidos || "").trim()}, {String(u.nombres || "").trim()}</PanelGridTd>
                                        <PanelGridTd className="text-gray-600">{String(u.username || "")}</PanelGridTd>
                                        <PanelGridTd className="text-gray-500">{String(u.correo || "")}</PanelGridTd>
                                        <PanelGridTd className="hidden md:table-cell text-gray-500">{String(u.cargo || "")}</PanelGridTd>
                                        <PanelGridTd className="hidden sm:table-cell text-gray-500">{String(u.nivel || "")}</PanelGridTd>
                                        <PanelGridTd className="text-center">
                                            {u.activo ? <Check size={10} className="text-green-500 mx-auto" /> : "—"}
                                        </PanelGridTd>
                                    </PanelGridTr>
                                );
                            })}
                        </PanelGridTbody>
                    </PanelGridTable>
                </div>
            </PanelGrid>

            <AppFooter areaLabel="System Management" database="Sistema" />

            {/* Mobile Add Button */}
            <div className={cn("md:hidden fixed bottom-6 right-6 z-40 transition-all duration-300", selectedRow ? "opacity-0 translate-y-8 pointer-events-none" : "opacity-100 translate-y-0")}>
                <button onClick={handleAdd} disabled={!perms.canCreate} className="w-12 h-12 bg-[#FB7506] hover:bg-orange-600 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95 disabled:opacity-50">
                    <Plus size={24} />
                </button>
            </div>

            {/* Slide-up Action Bar for Mobile Selection */}
            <div className={cn("md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-in-out pb-4 pt-2 px-2", selectedRow ? "translate-y-0" : "translate-y-full")}>
                <div className="flex items-center justify-around">
                    <button onClick={handleEdit} disabled={!perms.canEdit} className="flex flex-col items-center gap-1 p-2 text-orange-600 disabled:opacity-30">
                        <Pencil size={20} /><span className="text-[10px] font-bold uppercase">Edit</span>
                    </button>
                    <button onClick={() => setDeleteDialog(true)} disabled={!perms.canDelete} className="flex flex-col items-center gap-1 p-2 text-red-600 disabled:opacity-30">
                        <Trash2 size={20} /><span className="text-[10px] font-bold uppercase">Delete</span>
                    </button>
                    <button onClick={() => setLogModalOpen(true)} className="flex flex-col items-center gap-1 p-2 text-blue-600">
                        <Calendar size={20} /><span className="text-[10px] font-bold uppercase">Log</span>
                    </button>
                </div>
            </div>

            <UserUpsertModal onSaved={() => {
                qc.invalidateQueries({ queryKey: ["sys-users-list"] });
                setSaveMsg("User saved successfully.");
                setTimeout(() => setSaveMsg(null), 3000);
            }} />
            <UserLogModal />

            {deleteDialog && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
                        <div className="p-6 flex flex-col items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center"><Trash2 size={24} className="text-red-600" /></div>
                            <div className="text-center">
                                <h3 className="font-black text-gray-900 text-base mb-1">Delete User?</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Delete <strong>{selectedRow?.apellidos}, {selectedRow?.nombres}</strong>?<br/>This cannot be undone.
                                </p>
                                {delError && <p className="text-xs text-red-500 mt-2 font-bold">{delError}</p>}
                            </div>
                        </div>
                        <div className="flex border-t border-gray-100">
                            <button onClick={() => { setDeleteDialog(false); setDelError(null); }} className="flex-1 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 border-r border-gray-100">Cancel</button>
                            <button onClick={handleDelete} disabled={deleting} className="flex-1 py-3 text-sm font-black text-red-600 hover:bg-red-50 disabled:opacity-50">
                                {deleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
