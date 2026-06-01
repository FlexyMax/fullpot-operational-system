"use client";

import { useState, useRef, useEffect } from "react";
import { X, Loader2, Check, Search } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const t = (v: any) => String(v ?? "").trim();

interface Props {
    soUnico:   string;
    orderNo:   string | number;
    customers: any[];
    carriers:  any[];
    onClose:   () => void;
    onSaved:   () => void;
}

const inp = "w-full border border-gray-300 rounded px-2 py-1.5 text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-400";

export function ChangeCustomerModal({ soUnico, orderNo, customers, carriers, onClose, onSaved }: Props) {
    const [custSearch,   setCustSearch]   = useState("");
    const [showDrop,     setShowDrop]     = useState(false);
    const [customerUq,   setCustomerUq]   = useState("");
    const [shiptos,      setShiptos]      = useState<any[]>([]);
    const [shiptoUq,     setShiptoUq]     = useState("");
    const [carrierUq,    setCarrierUq]    = useState("");
    const [stLoading,    setStLoading]    = useState(false);
    const [saving,       setSaving]       = useState(false);
    const custRef = useRef<HTMLDivElement>(null);

    const filtered = custSearch.length >= 1
        ? customers.filter(c =>
            t(c.CUST_CODE ?? "").toLowerCase().includes(custSearch.toLowerCase()) ||
            t(c.old_code  ?? "").toLowerCase().includes(custSearch.toLowerCase()))
            .slice(0, 60)
        : [];

    useEffect(() => {
        const h = (e: MouseEvent) => { if (custRef.current && !custRef.current.contains(e.target as Node)) setShowDrop(false); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    useEffect(() => {
        if (!customerUq) { setShiptos([]); setShiptoUq(""); return; }
        let active = true;
        setStLoading(true);
        fetch(`/api/standing-orders/shiptos?customer_uq=${encodeURIComponent(customerUq)}`)
            .then(r => r.json())
            .then(j => {
                if (!active) return;
                const list = Array.isArray(j) ? j : [];
                setShiptos(list);
                const def = list.find((s: any) => s.shipto_default === true || s.shipto_default === 1) ?? list[0];
                if (def) { setShiptoUq(t(def.unico)); setCarrierUq(t(def.carrier_uq ?? "")); }
            })
            .catch(() => { if (active) setShiptos([]); })
            .finally(() => { if (active) setStLoading(false); });
        return () => { active = false; };
    }, [customerUq]);

    const handleSave = async () => {
        if (!shiptoUq) { toast.error("Please select a ship-to"); return; }
        setSaving(true);
        try {
            const r = await fetch("/api/standing-orders/change-customer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ so_uq: soUnico, shipto_uq: shiptoUq, carrier_uq: carrierUq }),
            });
            const j = await r.json();
            if (!r.ok || !j.success) throw new Error(j.error || "Failed");
            toast.success("Customer/Ship-to updated");
            onSaved();
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
                <div className="h-10 bg-[#374151] flex items-center justify-between px-4 shrink-0 rounded-t-lg">
                    <span className="font-black text-[11px] text-white uppercase tracking-widest">
                        Change Customer — Order #{orderNo}
                    </span>
                    <button onClick={onClose} className="text-white/60 hover:text-white"><X size={14} /></button>
                </div>
                <div className="p-4 space-y-3 text-[11px]">

                    {/* Customer search */}
                    <div ref={custRef} className="relative">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Customer</label>
                        <div className="flex items-center gap-1 border border-gray-300 rounded px-2 py-1.5 focus-within:ring-2 focus-within:ring-blue-400">
                            <Search size={11} className="text-gray-400 shrink-0" />
                            <input
                                value={custSearch}
                                onChange={e => { setCustSearch(e.target.value); setShowDrop(true); if (!e.target.value) { setCustomerUq(""); setShiptos([]); } }}
                                onFocus={() => setShowDrop(true)}
                                placeholder="Search customers..."
                                className="flex-1 text-[11px] focus:outline-none bg-transparent"
                            />
                        </div>
                        {customerUq && <span className="text-[9px] text-green-600 font-bold">✓ {customerUq}</span>}
                        {showDrop && filtered.length > 0 && (
                            <div className="absolute z-20 top-full left-0 right-0 bg-white border border-gray-200 rounded shadow-xl max-h-44 overflow-y-auto">
                                {filtered.map((c, i) => (
                                    <div key={i} onClick={() => { setCustSearch(t(c.CUST_CODE)); setCustomerUq(t(c.unico)); setShowDrop(false); }}
                                        className="px-2 py-1 hover:bg-blue-50 cursor-pointer border-b border-gray-100 text-[10px] flex gap-2">
                                        <span className="font-bold">{t(c.CUST_CODE)}</span>
                                        <span className="text-gray-400">{t(c.old_code)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Ship-to */}
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">
                            Ship-To {stLoading && <Loader2 size={9} className="animate-spin inline ml-1" />}
                        </label>
                        <select value={shiptoUq} onChange={e => {
                            setShiptoUq(e.target.value);
                            const s = shiptos.find((x: any) => t(x.unico) === e.target.value);
                            if (s) setCarrierUq(t(s.carrier_uq ?? ""));
                        }} className={inp} disabled={!customerUq || stLoading}>
                            <option value="">— {customerUq ? "select ship-to" : "select customer first"} —</option>
                            {shiptos.map((s: any, i: number) => (
                                <option key={i} value={t(s.unico)}>
                                    {t(s.name)} {t(s.shipto) ? `(${t(s.shipto)})` : ""}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Carrier */}
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Carrier</label>
                        <select value={carrierUq} onChange={e => setCarrierUq(e.target.value)} className={inp}>
                            <option value="">— select —</option>
                            {carriers.map((c: any, i: number) => (
                                <option key={i} value={t(c.unico)}>{t(c.carrier)}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="h-11 bg-gray-50 border-t border-gray-200 flex items-center justify-end px-4 gap-2 shrink-0 rounded-b-lg">
                    <button onClick={onClose}
                        className="px-3 py-1.5 text-[11px] font-bold text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50">
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving || !shiptoUq}
                        className="px-4 py-1.5 text-[11px] font-black text-white bg-[#FB7506] hover:bg-orange-500 rounded disabled:opacity-40 flex items-center gap-1">
                        {saving ? <Loader2 size={10} className="animate-spin" /> : <Check size={10} />}
                        Change Customer
                    </button>
                </div>
            </div>
        </div>
    );
}
