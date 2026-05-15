"use client";

import { useState } from "react";
import { RotateCcw, XCircle, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchRecordAudit } from "@/lib/audit";

interface Props {
    recordId: string | null | undefined;
    disabled?: boolean;
    /** Size variant: 'sm' for grid toolbars, 'md' for standalone (default) */
    size?: "sm" | "md";
}

export function AuditLogModal({ recordId, disabled, size = "sm" }: Props) {
    const iconSize = size === "sm" ? 16 : 18;
    const [open,    setOpen]    = useState(false);
    const [rows,    setRows]    = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState<string | null>(null);

    const handleOpen = async () => {
        if (!recordId || disabled) return;
        setOpen(true);
        setLoading(true);
        setError(null);
        try {
            const data = await fetchRecordAudit(recordId);
            setRows(Array.isArray(data) ? data : []);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* ── Toolbar button ─────────────────────────────────────── */}
            <button
                onClick={handleOpen}
                disabled={!!disabled}
                title="View audit history"
                className={cn(
                    "flex items-center justify-center rounded transition-all",
                    size === "sm"
                        ? "w-7 h-7 bg-gray-600/80 hover:bg-gray-500 text-white"
                        : "p-1.5 text-gray-300 hover:text-white hover:bg-white/10",
                    disabled && "opacity-40 cursor-not-allowed"
                )}
            >
                <RotateCcw size={iconSize} />
            </button>

            {/* ── Modal ──────────────────────────────────────────────── */}
            {open && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
                        {/* Header */}
                        <div className="h-10 bg-[#374151] rounded-t-xl flex items-center justify-between px-4 shrink-0">
                            <div className="flex items-center gap-2">
                                <RotateCcw size={14} className="text-[#FB7506]" />
                                <span className="font-black text-[11px] uppercase tracking-widest text-white">
                                    Log Record — {recordId}
                                </span>
                                {loading && <RefreshCcw size={11} className="text-gray-400 animate-spin ml-2" />}
                            </div>
                            <button onClick={() => setOpen(false)}>
                                <XCircle size={16} className="text-gray-400 hover:text-white transition-colors" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="overflow-auto flex-1">
                            {error ? (
                                <div className="p-6 text-center text-red-500 text-sm font-bold">{error}</div>
                            ) : loading ? (
                                <div className="p-8 text-center text-gray-400 text-sm">Loading log records...</div>
                            ) : rows.length === 0 ? (
                                <div className="p-8 text-center text-gray-400 text-sm italic">
                                    No log records found for this entry.
                                </div>
                            ) : (
                                <table className="min-w-full text-xs text-left">
                                    <thead className="bg-gray-100 border-b text-gray-700 font-bold sticky top-0 z-10">
                                        <tr>
                                            <th className="p-2 whitespace-nowrap border-r border-gray-200">Event</th>
                                            <th className="p-2 whitespace-nowrap border-r border-gray-200">Event Date</th>
                                            <th className="p-2 whitespace-nowrap border-r border-gray-200">Ext-Event</th>
                                            <th className="p-2 whitespace-nowrap border-r border-gray-200">User Name</th>
                                            <th className="p-2 whitespace-nowrap">App Table</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((r: any, i: number) => (
                                            <tr key={i} className="border-b odd:bg-white even:bg-gray-50 hover:bg-blue-50 transition-colors text-gray-700">
                                                <td className="p-2 border-r border-gray-100">
                                                    <span className={cn(
                                                        "px-1.5 py-0.5 rounded text-[9px] font-black uppercase",
                                                        String(r.Event).trim() === "Insert"   ? "bg-green-100 text-green-700" :
                                                        String(r.Event).trim() === "Delete"   ? "bg-red-100 text-red-600"   :
                                                        String(r.Event).trim() === "Edit"     ? "bg-blue-100 text-blue-700"  :
                                                        String(r.Event).trim() === "Entrada"  ? "bg-purple-100 text-purple-700" :
                                                        String(r.Event).trim() === "Salida"   ? "bg-gray-100 text-gray-500" :
                                                        "bg-orange-100 text-orange-700"
                                                    )}>
                                                        {String(r.Event ?? "").trim()}
                                                    </span>
                                                </td>
                                                <td className="p-2 border-r border-gray-100 font-mono text-[10px] whitespace-nowrap">
                                                    {String(r.Event_Date ?? "").trim()}
                                                </td>
                                                <td className="p-2 border-r border-gray-100 truncate max-w-[220px]">
                                                    {String(r.Ext_Event ?? "").trim()}
                                                </td>
                                                <td className="p-2 border-r border-gray-100 font-medium whitespace-nowrap">
                                                    {String(r.UserName ?? "").trim()}
                                                </td>
                                                <td className="p-2 text-gray-400 text-[10px]">
                                                    {String(r.App_Table ?? "").trim()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-2 bg-gray-50 border-t rounded-b-xl flex items-center justify-between shrink-0">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                {rows.length} Records
                            </span>
                            <button
                                onClick={() => setOpen(false)}
                                className="px-4 py-1.5 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
