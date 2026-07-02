"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { RotateCcw, XCircle, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchRecordAudit } from "@/lib/audit";
import { PanelGridTable, PanelGridThead, PanelGridTh, PanelGridTbody, PanelGridTr, PanelGridTd } from "@/components/ui/PanelGridTable";

interface Props {
    recordId: string | null | undefined;
    disabled?: boolean;
    /** Size variant: 'sm' for grid toolbars, 'md' for standalone (default) */
    size?: "sm" | "md";
    /** Bare icon style: no background, white→orange hover (matches PanelGrid icons) */
    bareButton?: boolean;
}

export function AuditLogModal({ recordId, disabled, size = "sm", bareButton = false }: Props) {
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
                    "flex items-center justify-center transition-all",
                    bareButton
                        ? "p-1 text-white hover:text-[#FB7506]"
                        : size === "sm"
                            ? "p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700 rounded"
                            : "p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded",
                    disabled && "opacity-40 cursor-not-allowed"
                )}
            >
                <RotateCcw size={iconSize} />
            </button>

            {/* ── Modal (portal to document.body to escape stacking contexts) ── */}
            {open && createPortal(
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
                        {/* Header */}
                        <div className="h-10 bg-[#333030] rounded-t-xl flex items-center justify-between px-4 shrink-0">
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
                                <PanelGridTable>
                                    <PanelGridThead>
                                        <PanelGridTh>Event</PanelGridTh>
                                        <PanelGridTh>Event Date</PanelGridTh>
                                        <PanelGridTh>Ext-Event</PanelGridTh>
                                        <PanelGridTh>User Name</PanelGridTh>
                                        <PanelGridTh>App Table</PanelGridTh>
                                    </PanelGridThead>
                                    <PanelGridTbody>
                                        {rows.map((r: any, i: number) => (
                                            <PanelGridTr key={i}>
                                                <PanelGridTd>
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
                                                </PanelGridTd>
                                                <PanelGridTd className="font-mono whitespace-nowrap">
                                                    {String(r.Event_Date ?? "").trim()}
                                                </PanelGridTd>
                                                <PanelGridTd className="truncate max-w-[220px]">
                                                    {String(r.Ext_Event ?? "").trim()}
                                                </PanelGridTd>
                                                <PanelGridTd className="font-medium whitespace-nowrap">
                                                    {String(r.UserName ?? "").trim()}
                                                </PanelGridTd>
                                                <PanelGridTd className="text-gray-400">
                                                    {String(r.App_Table ?? "").trim()}
                                                </PanelGridTd>
                                            </PanelGridTr>
                                        ))}
                                    </PanelGridTbody>
                                </PanelGridTable>
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
                </div>,
                document.body
            )}
        </>
    );
}
