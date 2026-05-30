"use client";
import { useState, useEffect, useCallback } from "react";
import { X, Plane, RefreshCcw, Plus, Pencil, Trash2, Save, Check, Search } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const t = (v: any) => String(v ?? "").trim();
const today = () => new Date().toISOString().split("T")[0];
const num = (v: any) => { const n = parseFloat(String(v ?? 0)); return isNaN(n) ? 0 : n; };
const fmt2 = (v: any) => parseFloat(v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface Props {
    open: boolean;
    onClose: () => void;
    airlines: any[];
    userId: string;
    defaultDate?: string;
    defaultAwbcode?: string;
}

const EMPTY_FORM = {
    awbcode: "", date_invo: today(), airline_uq: "",
    freight_x_bx: 0, duties_x_bx: 0, broker_x_bx: 0,
    handling_x_bx: 0, ocharges_x_bx: 0,
    origin_uq: "", dest_uq: "",
};

export function ModalAWBSetup({ open, onClose, airlines, userId, defaultDate, defaultAwbcode }: Props) {
    const [searchAwb,  setSearchAwb]  = useState(defaultAwbcode ?? "");
    const [searchDate, setSearchDate] = useState(defaultDate ?? today());
    const [rows,       setRows]       = useState<any[]>([]);
    const [loading,    setLoading]    = useState(false);
    const [selUnico,   setSelUnico]   = useState("");

    const [mode,    setMode]    = useState<"list" | "edit">("list");
    const [form,    setForm]    = useState({ ...EMPTY_FORM });
    const [saving,  setSaving]  = useState(false);
    const [error,   setError]   = useState<string | null>(null);
    const [delConf, setDelConf] = useState(false);

    const doSearch = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/inventory-entry/awb-setup?awbcode=${encodeURIComponent(searchAwb)}&date=${searchDate}`);
            const d = await res.json();
            if (d.error) throw new Error(d.error);
            setRows((Array.isArray(d) ? d : []).map((r: any) => {
                const n: any = {};
                for (const [k, v] of Object.entries(r)) n[k.toUpperCase()] = v;
                return n;
            }));
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setLoading(false);
        }
    }, [searchAwb, searchDate]);

    useEffect(() => { if (open) doSearch(); }, [open]);

    const openEdit = async (unico?: string) => {
        setError(null);
        if (!unico) {
            setForm({ ...EMPTY_FORM, awbcode: searchAwb, date_invo: searchDate });
            setSelUnico("");
        } else {
            setSelUnico(unico);
            const res = await fetch(`/api/inventory-entry/awb-setup/${unico}`);
            const d = await res.json();
            if (!d) { toast.error("Record not found"); return; }
            const fill: any = {};
            for (const [k, v] of Object.entries(d)) fill[k.toLowerCase()] = v;
            setForm({
                awbcode:        t(fill.awbcode),
                date_invo:      fill.date_invo ? new Date(fill.date_invo).toISOString().split("T")[0] : today(),
                airline_uq:     t(fill.airline_uq),
                freight_x_bx:   num(fill.freight_x_bx),
                duties_x_bx:    num(fill.duties_x_bx),
                broker_x_bx:    num(fill.broker_x_bx),
                handling_x_bx:  num(fill.handling_x_bx),
                ocharges_x_bx:  num(fill.ocharges_x_bx),
                origin_uq:      t(fill.origin_uq),
                dest_uq:        t(fill.dest_uq),
            });
        }
        setMode("edit");
    };

    const handleSave = async () => {
        if (!t(form.awbcode)) { setError("AWB Code is required."); return; }
        setSaving(true); setError(null);
        try {
            let res: Response;
            if (selUnico) {
                res = await fetch(`/api/inventory-entry/awb-setup/${selUnico}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...form, user_uq: userId }),
                });
            } else {
                res = await fetch("/api/inventory-entry/awb-setup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...form, user_uq: userId }),
                });
            }
            const d = await res.json();
            if (!d.success) throw new Error(d.error || "Save failed");
            toast.success(selUnico ? "AWB setup updated." : "AWB setup created.");
            setMode("list");
            doSearch();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selUnico) return;
        if (!delConf) { setDelConf(true); return; }
        setSaving(true);
        try {
            const res = await fetch(`/api/inventory-entry/awb-setup/${selUnico}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_uq: userId }),
            });
            const d = await res.json();
            if (!d.success) throw new Error(d.error || "Delete failed");
            toast.success("AWB setup deleted.");
            setDelConf(false);
            setMode("list");
            doSearch();
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setSaving(false);
        }
    };

    if (!open) return null;

    const setF = (key: string, val: any) => setForm(p => ({ ...p, [key]: val }));
    const fLabel = "text-[10px] font-black text-gray-500 uppercase tracking-wider";
    const fInput = "fos-input h-7 text-xs";

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden" style={{ maxHeight: "85vh" }} onClick={e => e.stopPropagation()}>
                <div className="h-10 bg-[#374151] flex items-center justify-between pl-3 pr-2 rounded-t-lg shrink-0">
                    <div className="flex items-center gap-2">
                        <Plane size={16} className="text-[#FB7506]" />
                        <span className="font-black text-[10px] text-white uppercase tracking-widest">AWB Setup</span>
                    </div>
                    <div className="flex items-center gap-1">
                        {mode === "list" && (
                            <button onClick={() => openEdit()} className="flex items-center gap-1 px-2 py-1 bg-[#FB7506] hover:bg-orange-600 text-white text-[10px] font-bold rounded transition-colors">
                                <Plus size={11} /> New
                            </button>
                        )}
                        {mode === "edit" && (
                            <button onClick={() => { setMode("list"); setDelConf(false); }} className="flex items-center gap-1 px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white text-[10px] font-bold rounded transition-colors">
                                ← List
                            </button>
                        )}
                        <button onClick={onClose} className="ml-1 text-gray-400 hover:text-white transition-colors"><X size={16} /></button>
                    </div>
                </div>

                {mode === "list" && (
                    <>
                        <div className="p-3 border-b shrink-0 flex gap-2">
                            <input value={searchAwb} onChange={e => setSearchAwb(e.target.value)} onKeyDown={e => e.key === "Enter" && doSearch()}
                                className={fInput + " flex-1"} placeholder="AWB code..." />
                            <input type="date" value={searchDate} onChange={e => setSearchDate(e.target.value)}
                                className={fInput + " w-36"} />
                            <button onClick={doSearch} className="px-3 py-1 bg-gray-700 text-white text-xs font-bold rounded hover:bg-gray-800 flex items-center gap-1 shrink-0">
                                {loading ? <RefreshCcw size={11} className="animate-spin" /> : <Search size={11} />}
                                Search
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto min-h-0">
                            <table className="w-full text-xs">
                                <thead className="bg-gray-100 sticky top-0">
                                    <tr>
                                        {["AWB Code","Date","Airline","Freight","Duties","Broker","Handling","Other","Origin","Dest",""].map(h => (
                                            <th key={h} className="p-2 text-left font-bold text-gray-700 border-r border-gray-200 whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.length === 0 ? (
                                        <tr><td colSpan={11} className="p-4 text-center text-gray-400 italic">{loading ? "" : "No AWB setups found"}</td></tr>
                                    ) : rows.map((row: any, i: number) => (
                                        <tr key={i} className="border-b border-gray-100 odd:bg-white even:bg-gray-50">
                                            <td className="p-2 border-r border-gray-100 font-mono font-bold">{t(row.AWBCODE)}</td>
                                            <td className="p-2 border-r border-gray-100">{t(row.DATE_INVO ?? row.AWBDATE ?? "").substring(0, 10)}</td>
                                            <td className="p-2 border-r border-gray-100">{t(row.AIRLINE ?? row.AIRLINE_UQ ?? "")}</td>
                                            <td className="p-2 border-r border-gray-100 text-right">{fmt2(row.FREIGHT_X_BX)}</td>
                                            <td className="p-2 border-r border-gray-100 text-right">{fmt2(row.DUTIES_X_BX)}</td>
                                            <td className="p-2 border-r border-gray-100 text-right">{fmt2(row.BROKER_X_BX)}</td>
                                            <td className="p-2 border-r border-gray-100 text-right">{fmt2(row.HANDLING_X_BX)}</td>
                                            <td className="p-2 border-r border-gray-100 text-right">{fmt2(row.OCHARGES_X_BX)}</td>
                                            <td className="p-2 border-r border-gray-100">{t(row.ORIGIN ?? row.ORIGIN_UQ ?? "")}</td>
                                            <td className="p-2 border-r border-gray-100">{t(row.DEST ?? row.DEST_UQ ?? "")}</td>
                                            <td className="p-2">
                                                <button onClick={() => openEdit(t(row.UNICO))}
                                                    className="p-1 text-gray-500 hover:text-[#FB7506] transition-colors">
                                                    <Pencil size={11} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-4 py-2 bg-gray-50 border-t shrink-0">
                            <span className="text-[10px] text-gray-400">{rows.length} record(s)</span>
                        </div>
                    </>
                )}

                {mode === "edit" && (
                    <>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                                <div className="flex flex-col gap-0.5">
                                    <label className={fLabel}>AWB Code *</label>
                                    <input value={form.awbcode} onChange={e => setF("awbcode", e.target.value)} className={fInput + " font-mono"} />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <label className={fLabel}>Date</label>
                                    <input type="date" value={form.date_invo} onChange={e => setF("date_invo", e.target.value)} className={fInput} />
                                </div>
                                <div className="col-span-2 flex flex-col gap-0.5">
                                    <label className={fLabel}>Airline</label>
                                    <select value={form.airline_uq} onChange={e => setF("airline_uq", e.target.value)} className={fInput}>
                                        <option value="">-- None --</option>
                                        {airlines.map((a: any) => (
                                            <option key={t(a.UNICO)} value={t(a.UNICO)}>{t(a.AIRLINE ?? a.DESCRIPTION ?? a.UNICO)}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="border-t pt-2">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Charges per Box</p>
                                <div className="grid grid-cols-3 gap-x-3 gap-y-2">
                                    {[
                                        { key: "freight_x_bx",  label: "Freight x Bx" },
                                        { key: "duties_x_bx",   label: "Duties x Bx" },
                                        { key: "broker_x_bx",   label: "Broker x Bx" },
                                        { key: "handling_x_bx", label: "Handling x Bx" },
                                        { key: "ocharges_x_bx", label: "Other x Bx" },
                                    ].map(f => (
                                        <div key={f.key} className="flex flex-col gap-0.5">
                                            <label className={fLabel}>{f.label}</label>
                                            <input type="number" step="0.01" value={(form as any)[f.key]}
                                                onChange={e => setF(f.key, num(e.target.value))}
                                                className={fInput + " text-right"} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="border-t pt-2 grid grid-cols-2 gap-x-3 gap-y-2">
                                <div className="flex flex-col gap-0.5">
                                    <label className={fLabel}>Origin Code</label>
                                    <input value={form.origin_uq} onChange={e => setF("origin_uq", e.target.value)} className={fInput + " font-mono"} />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <label className={fLabel}>Destination Code</label>
                                    <input value={form.dest_uq} onChange={e => setF("dest_uq", e.target.value)} className={fInput + " font-mono"} />
                                </div>
                            </div>
                            {error && <p className="text-xs text-red-500 bg-red-50 rounded p-2">{error}</p>}
                            {delConf && (
                                <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2 font-bold">
                                    Click Delete again to confirm permanent deletion.
                                </div>
                            )}
                        </div>
                        <div className="flex items-center justify-between gap-2 px-4 py-3 bg-gray-50 border-t shrink-0">
                            {selUnico ? (
                                <button onClick={handleDelete} disabled={saving}
                                    className="flex items-center gap-1 px-3 py-2 rounded bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-xs font-black uppercase transition-all">
                                    {saving && delConf ? <RefreshCcw size={11} className="animate-spin" /> : <Trash2 size={11} />}
                                    {delConf ? "Confirm Delete" : "Delete"}
                                </button>
                            ) : <span />}
                            <div className="flex gap-2">
                                <button onClick={() => { setMode("list"); setDelConf(false); }}
                                    className="px-4 py-2 rounded border border-gray-200 text-xs font-black uppercase text-gray-600 hover:bg-gray-100 transition-colors">
                                    Cancel
                                </button>
                                <button onClick={handleSave} disabled={saving}
                                    className="flex items-center gap-2 px-5 py-2 rounded bg-[#FB7506] hover:bg-orange-600 disabled:opacity-40 text-white text-xs font-black uppercase tracking-wider transition-all">
                                    {saving && !delConf ? <RefreshCcw size={12} className="animate-spin" /> : <Save size={12} />}
                                    {saving && !delConf ? "Saving..." : selUnico ? "Update" : "Create"}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
