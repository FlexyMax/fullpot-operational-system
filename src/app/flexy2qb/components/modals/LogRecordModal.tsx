"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { XCircle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import PanelGrid from "@/components/ui/PanelGrid";
import { PanelGridTable, PanelGridThead, PanelGridTh, PanelGridTbody, PanelGridTr, PanelGridTd } from "@/components/ui/PanelGridTable";

interface LogEntry {
    Event: string;
    Event_Date: string;
    Ext_Event: string;
    UserName: string;
    App_Table: string;
}

interface Props {
    recordId: string | null | undefined;
    onClose: () => void;
}

export function LogRecordModal({ recordId, onClose }: Props) {
    const open = !!recordId;

    const { data = [], isFetching, refetch } = useQuery<LogEntry[]>({
        queryKey: ["log-record", recordId],
        queryFn: async () => {
            if (!recordId) return [];
            const res = await fetch(`/api/audit/record/${encodeURIComponent(recordId)}`);
            if (!res.ok) throw new Error("Failed to load log");
            return res.json();
        },
        enabled: open,
    });

    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="h-10 bg-[#333030] rounded-t-xl flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-2">
                        <RotateCcw size={14} className="text-[#FB7506]" />
                        <span className="font-black text-[11px] uppercase tracking-widest text-white">
                            Log Record — {recordId}
                        </span>
                    </div>
                    <button onClick={onClose}>
                        <XCircle size={16} className="text-gray-400 hover:text-white transition-colors" />
                    </button>
                </div>

                {/* Grid */}
                <PanelGrid
                    title="Audit Log"
                    icon={RotateCcw}
                    recordCount={!isFetching && data.length > 0 ? data.length : undefined}
                    onRefresh={() => refetch()}
                    refreshing={isFetching}
                    className="flex-1 min-h-0 rounded-none border-x-0 border-b-0"
                >
                    {isFetching ? (
                        <div className="p-8 text-center text-gray-400 text-sm">Loading log records...</div>
                    ) : data.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm italic">No log entries found for this record.</div>
                    ) : (
                        <PanelGridTable>
                            <PanelGridThead>
                                <PanelGridTh>Event</PanelGridTh>
                                <PanelGridTh>Date</PanelGridTh>
                                <PanelGridTh>Detail</PanelGridTh>
                                <PanelGridTh>User</PanelGridTh>
                                <PanelGridTh>Table</PanelGridTh>
                            </PanelGridThead>
                            <PanelGridTbody>
                                {data.map((row, i) => (
                                    <PanelGridTr key={i}>
                                        <PanelGridTd>
                                            <span className={cn(
                                                "px-1.5 py-0.5 rounded text-[9px] font-black uppercase",
                                                String(row.Event).trim() === "Insert"  ? "bg-green-100 text-green-700"   :
                                                String(row.Event).trim() === "Delete"  ? "bg-red-100 text-red-600"       :
                                                String(row.Event).trim() === "Edit"    ? "bg-blue-100 text-blue-700"     :
                                                String(row.Event).trim() === "Entrada" ? "bg-purple-100 text-purple-700" :
                                                String(row.Event).trim() === "Salida"  ? "bg-gray-100 text-gray-500"     :
                                                "bg-orange-100 text-orange-700"
                                            )}>
                                                {String(row.Event ?? "").trim()}
                                            </span>
                                        </PanelGridTd>
                                        <PanelGridTd className="font-mono whitespace-nowrap">{String(row.Event_Date ?? "").trim()}</PanelGridTd>
                                        <PanelGridTd className="truncate max-w-[220px]">{String(row.Ext_Event ?? "").trim()}</PanelGridTd>
                                        <PanelGridTd className="font-medium whitespace-nowrap">{String(row.UserName ?? "").trim()}</PanelGridTd>
                                        <PanelGridTd className="text-gray-400">{String(row.App_Table ?? "").trim()}</PanelGridTd>
                                    </PanelGridTr>
                                ))}
                            </PanelGridTbody>
                        </PanelGridTable>
                    )}
                </PanelGrid>

                <div className="px-4 py-2 bg-gray-50 border-t rounded-b-xl flex items-center justify-between shrink-0">
                    <span className="text-[10px] text-gray-400">{data.length} entr{data.length === 1 ? "y" : "ies"}</span>
                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
