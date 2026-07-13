"use client";

import { useState } from "react";
import { X, Loader2, Check, CalendarRange } from "lucide-react";
import { toast } from "sonner";

const t = (v: any) => String(v ?? "").trim();

const fmtDate = (v: any) => {
    if (!v) return "";
    const d = new Date(v);
    return isNaN(d.getTime()) ? t(v) : d.toLocaleDateString("en-US");
};

interface Props {
    soUnico:      string;
    orderNo:      string | number;
    seasons:      any[];
    currentUq:    string;
    salesmanUq:   string;
    onClose:      () => void;
    onSaved:      () => void;
}

export function ChangeSeasonModal({ soUnico, orderNo, seasons, currentUq, salesmanUq, onClose, onSaved }: Props) {
    const [seasonUq, setSeasonUq] = useState(currentUq);
    const [saving,   setSaving]   = useState(false);

    const handleSave = async () => {
        if (!seasonUq) { toast.error("Please select a season"); return; }
        setSaving(true);
        try {
            const r = await fetch("/api/standing-orders/change-season", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ so_uq: soUnico, season_uq: seasonUq, salesman_uq: salesmanUq }),
            });
            const j = await r.json();
            if (!r.ok || !j.success) throw new Error(j.error || "Failed");
            toast.success("Season updated");
            onSaved();
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setSaving(false);
        }
    };

    // Active seasons first; already ordered by enddate DESC from SP
    const activeSeasons  = seasons.filter(s => t(s.active) === "Yes");
    const inactiveSeasons = seasons.filter(s => t(s.active) !== "Yes");

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden" style={{ maxHeight: "94dvh" }}>

                {/* Header */}
                <div className="h-10 bg-[#374151] flex items-center justify-between px-4 shrink-0 rounded-t-xl">
                    <div className="flex items-center gap-2 min-w-0">
                        <CalendarRange size={14} className="text-white/70 shrink-0" />
                        <span className="fos-grid-header-text truncate">
                            Change Season — Order #{orderNo}
                        </span>
                    </div>
                    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors shrink-0">
                        <X size={15} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 space-y-3 overflow-y-auto flex-1">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Season</label>
                        <select
                            value={seasonUq}
                            onChange={e => setSeasonUq(e.target.value)}
                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="">— select —</option>
                            {activeSeasons.length > 0 && (
                                <optgroup label="Active">
                                    {activeSeasons.map((s, i) => (
                                        <option key={i} value={t(s.unico)}>
                                            {t(s.season)}  ({fmtDate(s.startdate2 ?? s.startdate)} – {fmtDate(s.enddate2 ?? s.enddate)})
                                        </option>
                                    ))}
                                </optgroup>
                            )}
                            {inactiveSeasons.length > 0 && (
                                <optgroup label="Inactive">
                                    {inactiveSeasons.map((s, i) => (
                                        <option key={i} value={t(s.unico)}>
                                            {t(s.season)}  ({fmtDate(s.startdate2 ?? s.startdate)} – {fmtDate(s.enddate2 ?? s.enddate)})
                                        </option>
                                    ))}
                                </optgroup>
                            )}
                        </select>
                    </div>
                </div>

                {/* Footer */}
                <div className="h-10 bg-[#F5F3F3] border-t border-[#DBD9D9] flex items-center justify-end px-4 gap-2 shrink-0 rounded-b-xl">
                    <button onClick={onClose}
                        className="h-7 px-3 text-[11px] font-bold text-gray-600 bg-white border border-[#DBD9D9] rounded hover:bg-gray-50">
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving}
                        className="h-7 px-4 text-[11px] font-black text-white bg-[#FB7506] hover:bg-orange-500 rounded disabled:opacity-40 flex items-center gap-1">
                        {saving ? <Loader2 size={10} className="animate-spin" /> : <Check size={10} />}
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
