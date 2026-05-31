"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const t = (v: any) => String(v ?? "").trim();
const fmtDate = (v: any) => {
    if (!v) return "";
    const s = String(v).trim();
    const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso) return new Date(+iso[1], +iso[2] - 1, +iso[3]).toLocaleDateString("en-US");
    const d = new Date(s);
    return isNaN(d.getTime()) ? s : d.toLocaleDateString("en-US");
};

interface WeekRow { week: number; unico: string | null; active: boolean; }

interface Props {
    soUnico:  string;
    header:   any;
    onClose:  () => void;
    onSaved:  () => void;
}

const ODD_WEEKS  = [1,3,5,7,9,11,13,15,17,19,21,23,25,27,29,31,33,35,37,39,41,43,45,47,49,51,53];
const EVEN_WEEKS = [2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40,42,44,46,48,50,52];

export function SetWeeksModal({ soUnico, header, onClose, onSaved }: Props) {
    const [weeks,   setWeeks]   = useState<WeekRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving,  setSaving]  = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const r = await fetch(`/api/standing-orders/weeks?so_uq=${soUnico}`);
                const j = await r.json();
                if (!r.ok) throw new Error(j.error || "Failed");
                setWeeks(j);
            } catch (e: any) {
                toast.error("Failed to load weeks: " + e.message);
            } finally {
                setLoading(false);
            }
        })();
    }, [soUnico]);

    const toggle = (week: number) => {
        setWeeks(w => w.map(r => r.week === week ? { ...r, active: !r.active } : r));
    };

    const setGroup = async (odd: boolean, active: boolean) => {
        // Update local state immediately
        setWeeks(w => w.map(r => (r.week % 2 === (odd ? 1 : 0)) ? { ...r, active } : r));
        // Persist to DB
        try {
            await fetch("/api/standing-orders/weeks", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bulk: true, so_uq: soUnico, active, odd }),
            });
        } catch { /* UI already updated, ignore */ }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Save each week that has a unico (it exists in DB) individually
            const updates = weeks.filter(w => w.unico);
            await Promise.all(updates.map(w =>
                fetch("/api/standing-orders/weeks", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ bulk: false, unico: w.unico, active: w.active }),
                })
            ));
            toast.success("Weeks saved");
            onSaved();
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setSaving(false);
        }
    };

    const WeekCheck = ({ w }: { w: number }) => {
        const row = weeks.find(r => r.week === w);
        return (
            <div className="flex flex-col items-center gap-0.5">
                <span className={cn("text-[9px] font-black",
                    w % 2 === 1 ? "text-gray-700" : "text-blue-700")}
                >
                    {String(w).padStart(2, "0")}
                </span>
                <button
                    onClick={() => toggle(w)}
                    disabled={!row?.unico}
                    className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                        row?.active
                            ? "bg-blue-600 border-blue-600"
                            : "bg-white border-gray-300",
                        !row?.unico && "opacity-30 cursor-not-allowed"
                    )}
                >
                    {row?.active && <Check size={10} className="text-white" strokeWidth={3} />}
                </button>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden">

                {/* Header */}
                <div className="bg-[#374151] px-4 py-3 flex items-center justify-between shrink-0">
                    <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">SO Weeks Edit</p>
                        <p className="text-[13px] font-black text-white uppercase">{t(header?.CUSTOMER)}</p>
                    </div>
                    <button onClick={onClose} className="text-white/60 hover:text-white"><X size={14} /></button>
                </div>

                {/* Info row */}
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 text-[11px] shrink-0">
                    <div><span className="font-bold text-gray-500">Order No.</span><span className="ml-2 text-gray-800">{t(header?.SORDER_NO)}</span></div>
                    <div><span className="font-bold text-gray-500">Week Day</span><span className="ml-2 text-gray-800">{t(header?.SO_DAY)}</span></div>
                    <div><span className="font-bold text-gray-500">Factor</span><span className="ml-2 text-gray-800">{t(header?.APPLYFOR ?? "1")}</span></div>
                    <div><span className="font-bold text-gray-500">Active</span>
                        <span className={cn("ml-2 font-bold", (header?.ACTIVE === true || header?.ACTIVE === 1) ? "text-green-600" : "text-red-500")}>
                            {(header?.ACTIVE === true || header?.ACTIVE === 1) ? "Yes" : "No"}
                        </span>
                    </div>
                    <div><span className="font-bold text-gray-500">Start</span><span className="ml-2 text-gray-800">{fmtDate(header?.SO_STDATE)}</span></div>
                    <div><span className="font-bold text-gray-500">End</span><span className="ml-2 text-gray-800">{fmtDate(header?.SO_ENDATE)}</span></div>
                    <div className="col-span-2"><span className="font-bold text-gray-500">Ship to</span><span className="ml-2 text-gray-800">{t(header?.SHIP_NAME)}</span></div>
                </div>

                {/* Weeks grid */}
                <div className="p-4 space-y-4">
                    <p className="text-[11px] font-black text-[#FB7506] uppercase tracking-widest">Weeks</p>

                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 size={18} className="animate-spin text-gray-400" />
                            <span className="ml-2 text-[11px] text-gray-500">Loading weeks...</span>
                        </div>
                    ) : (
                        <>
                            {/* Odd weeks row */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <button onClick={() => setGroup(true, true)}
                                    className="px-2 py-1 text-[10px] font-black bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded uppercase tracking-wide shrink-0">
                                    All
                                </button>
                                <div className="flex items-center gap-1 flex-wrap flex-1">
                                    {ODD_WEEKS.map(w => <WeekCheck key={w} w={w} />)}
                                </div>
                                <button onClick={() => setGroup(true, false)}
                                    className="px-2 py-1 text-[10px] font-black bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded uppercase tracking-wide shrink-0">
                                    Uncheck
                                </button>
                            </div>

                            {/* Even weeks row */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <button onClick={() => setGroup(false, true)}
                                    className="px-2 py-1 text-[10px] font-black bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded uppercase tracking-wide shrink-0">
                                    All
                                </button>
                                <div className="flex items-center gap-1 flex-wrap flex-1">
                                    {EVEN_WEEKS.map(w => <WeekCheck key={w} w={w} />)}
                                </div>
                                <button onClick={() => setGroup(false, false)}
                                    className="px-2 py-1 text-[10px] font-black bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded uppercase tracking-wide shrink-0">
                                    Uncheck
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="h-11 bg-gray-50 border-t border-gray-200 flex items-center justify-end px-4 gap-2 shrink-0">
                    <button onClick={onClose}
                        className="px-3 py-1.5 text-[11px] font-bold text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving || loading}
                        className="px-4 py-1.5 text-[11px] font-black text-white bg-[#FB7506] hover:bg-orange-500 rounded disabled:opacity-40 flex items-center gap-1 transition-colors">
                        {saving ? <Loader2 size={10} className="animate-spin" /> : <Check size={10} />}
                        Save Weeks
                    </button>
                </div>
            </div>
        </div>
    );
}
