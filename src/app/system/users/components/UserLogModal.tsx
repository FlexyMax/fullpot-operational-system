import React, { useState } from "react";
import { X, Calendar, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useUserStore } from "@/store/system/useUserStore";
import { PanelGridTable, PanelGridThead, PanelGridTh, PanelGridTbody, PanelGridTr, PanelGridTd } from "@/components/ui/PanelGridTable";
import { todayEST } from "@/lib/dates";

const apiFetch = async (url: string) => { const r = await fetch(url); const j = await r.json(); if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`); return j; };

export function UserLogModal() {
    const { isLogModalOpen, setLogModalOpen, selectedRow } = useUserStore();
    const [logFrom, setLogFrom] = useState(() => {
        const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().split("T")[0];
    });
    const [logTo, setLogTo] = useState(todayEST);
    const [logEnabled, setLogEnabled] = useState(false);

    const { data: logData = [], isFetching, refetch } = useQuery({
        queryKey: ["sys-user-log", selectedRow?.unico, logFrom, logTo],
        queryFn:  () => apiFetch(`/api/system/users/${selectedRow?.unico}/log?from=${logFrom}&to=${logTo}`),
        enabled:  !!selectedRow?.unico && logEnabled && isLogModalOpen,
        retry:    false,
    });

    if (!isLogModalOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden max-h-[85vh]">
                <div className="h-10 bg-[#374151] flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-[#FB7506]" />
                        <span className="fos-grid-header-text">User Activity Log - {selectedRow?.username}</span>
                    </div>
                    <button onClick={() => setLogModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                        <X size={16} />
                    </button>
                </div>
                
                <div className="p-3 border-b flex items-center gap-4 bg-gray-50 shrink-0">
                    <div className="flex items-center gap-2">
                        <input type="date" value={logFrom} onChange={e => setLogFrom(e.target.value)} className="fos-input h-8 text-xs w-32" />
                        <span className="text-gray-400 text-xs">→</span>
                        <input type="date" value={logTo} onChange={e => setLogTo(e.target.value)} className="fos-input h-8 text-xs w-32" />
                        <button onClick={() => { setLogEnabled(true); refetch(); }} className="flex items-center gap-1.5 bg-[#FB7506] hover:bg-orange-600 text-white px-3 h-8 rounded text-xs font-black uppercase tracking-wider transition-all">
                            <Filter size={14} /> Filter
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto bg-white p-0">
                    {!logEnabled ? (
                        <div className="h-40 flex flex-col items-center justify-center text-gray-300 gap-2">
                            <Calendar size={32} className="opacity-20" />
                            <p className="text-xs font-bold uppercase tracking-widest">Select date range and click Filter</p>
                        </div>
                    ) : logData.length === 0 ? (
                        <div className="h-40 flex items-center justify-center text-gray-400 text-xs font-bold italic">
                            {isFetching ? "Loading activity..." : "No activity found for selected dates"}
                        </div>
                    ) : (
                        <PanelGridTable>
                            <PanelGridThead>
                                <PanelGridTh>Date</PanelGridTh>
                                <PanelGridTh>Action</PanelGridTh>
                                <PanelGridTh>Screen</PanelGridTh>
                                <PanelGridTh>Module</PanelGridTh>
                                <PanelGridTh>Company</PanelGridTh>
                            </PanelGridThead>
                            <PanelGridTbody>
                                {(logData as any[]).map((row: any, i: number) => (
                                    <PanelGridTr key={i}>
                                        <PanelGridTd className="text-gray-600">
                                            {row.fecha ? new Date(row.fecha).toLocaleString("en-US", { timeZone: "America/New_York" }) : ""}
                                        </PanelGridTd>
                                        <PanelGridTd className="font-semibold text-blue-700">
                                            {String(row.accion || "").trim()}
                                        </PanelGridTd>
                                        <PanelGridTd className="truncate max-w-[180px]">
                                            {String(row.pantalla || "").trim()}
                                        </PanelGridTd>
                                        <PanelGridTd className="truncate max-w-[140px] text-gray-500">
                                            {String(row.modulo || "").trim()}
                                        </PanelGridTd>
                                        <PanelGridTd className="text-gray-400">
                                            {String(row.empresa || "").trim()}
                                        </PanelGridTd>
                                    </PanelGridTr>
                                ))}
                            </PanelGridTbody>
                        </PanelGridTable>
                    )}
                </div>
            </div>
        </div>
    );
}
