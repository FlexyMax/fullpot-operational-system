"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { XCircle, ClipboardList, RefreshCcw } from "lucide-react";

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

    // Close on Escape
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">

                {/* Header */}
                <div className="h-10 bg-[#374151] rounded-t-xl flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-2">
                        <ClipboardList size={14} className="text-[#FB7506]" />
                        <span className="font-black text-[11px] uppercase tracking-widest text-white">
                            Record Log — {recordId}
                        </span>
                        {isFetching && <RefreshCcw size={11} className="text-gray-400 animate-spin ml-2" />}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => refetch()}
                            title="Refresh"
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <RefreshCcw size={14} />
                        </button>
                        <button onClick={onClose}>
                            <XCircle size={16} className="text-gray-400 hover:text-white transition-colors" />
                        </button>
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-auto min-h-0">
                    <table className="w-full text-[11px] border-collapse">
                        <thead className="sticky top-0 bg-[#F3F4F6] z-10">
                            <tr>
                                <th className="text-left px-3 py-2 font-bold text-gray-600 border-b border-gray-200 whitespace-nowrap">Event</th>
                                <th className="text-left px-3 py-2 font-bold text-gray-600 border-b border-gray-200 whitespace-nowrap">Date</th>
                                <th className="text-left px-3 py-2 font-bold text-gray-600 border-b border-gray-200 whitespace-nowrap">Detail</th>
                                <th className="text-left px-3 py-2 font-bold text-gray-600 border-b border-gray-200 whitespace-nowrap">User</th>
                                <th className="text-left px-3 py-2 font-bold text-gray-600 border-b border-gray-200 whitespace-nowrap">Table</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length === 0 && !isFetching && (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-gray-400">No log entries found</td>
                                </tr>
                            )}
                            {data.map((row, i) => (
                                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                    <td className="px-3 py-1.5 border-b border-gray-100 font-semibold text-blue-700">{row.Event}</td>
                                    <td className="px-3 py-1.5 border-b border-gray-100 font-mono text-gray-600 whitespace-nowrap">{row.Event_Date}</td>
                                    <td className="px-3 py-1.5 border-b border-gray-100 text-gray-700">{row.Ext_Event}</td>
                                    <td className="px-3 py-1.5 border-b border-gray-100 text-gray-600">{row.UserName}</td>
                                    <td className="px-3 py-1.5 border-b border-gray-100 text-gray-500 font-mono">{row.App_Table}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

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
