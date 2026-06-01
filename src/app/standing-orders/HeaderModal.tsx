"use client";

import { useState, useRef, useEffect } from "react";
import { X, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

const t = (v: any) => String(v ?? "").trim();
const DAYS = ["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"];

function toISODate(v: any): string {
    if (!v) return "";
    const s = String(v).trim();
    const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
    const d = new Date(s);
    return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

interface Lookups {
    customers:     any[];
    salesmen:      any[];
    warehouses:    any[];
    terms:         any[];
    cargoAgencies: any[];
    carriers:      any[];
}

interface Props {
    mode:    "new" | "edit";
    header?: any;
    lookups: Lookups;
    onClose: () => void;
    onSaved: (unico?: string) => void;
}

function LabelInput({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5">{label}</label>
            {children}
        </div>
    );
}

const inp = "w-full border border-gray-300 rounded px-2 py-1.5 text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-400";

export function HeaderModal({ mode, header, lookups, onClose, onSaved }: Props) {
    const isEdit = mode === "edit";

    const findUq = (list: any[], nameKey: string, nameVal: string, uqKey: string) => {
        const v = t(nameVal);
        if (!v) return "";
        return t(list.find(x => t(x[nameKey]) === v || t(x[nameKey]).startsWith(v))?.[uqKey] ?? "");
    };

    const uniqueWarehouses = (() => {
        const m = new Map<string, any>();
        for (const w of lookups.warehouses) if (!m.has(w.whouse_uq)) m.set(w.whouse_uq, w);
        return Array.from(m.values());
    })();

    const initForm = () => ({
        customer_uq:  isEdit ? t(header?.CUSTOMER_UQ ?? "") : "",
        salesman_uq:  isEdit ? (t(header?.SALESMAN_UQ) || findUq(lookups.salesmen, "salesman_name", header?.SALESMAN_NAME ?? "", "unico")) : "",
        terms_uq:     isEdit ? (t(header?.TERMS_UQ) || findUq(lookups.terms, "CONDITION", header?.CONDITION ?? "", "UNICO")) : "",
        day:          isEdit ? (t(header?.SO_DAY).trim() || "MONDAY") : "MONDAY",
        start_date:   isEdit ? toISODate(header?.SO_STDATE) : new Date().toISOString().slice(0, 10),
        end_date:     isEdit ? toISODate(header?.SO_ENDATE) : "2125-12-31",
        cargo_uq:     isEdit ? t(header?.CARGO_UQ ?? "") : "",
        carrier_uq:   isEdit ? t(header?.CARRIER_UQ ?? "") : "",
        whouse_uq:    isEdit ? t(header?.WHOUSE_UQ ?? "") : "",
        factor:       isEdit ? String(header?.APPLYFOR ?? 1) : "1",
        cporder_no:   isEdit ? t(header?.CPORDER_NO) : "",
        instructions: isEdit ? t(header?.INSTRUCTIONS) : "",
        ship_name:    isEdit ? t(header?.SHIP_NAME) : "",
        ship_address: isEdit ? t(header?.SHIP_ADDRESS) : "",
        ship_city:    isEdit ? t(header?.SHIP_CITY) : "",
        ship_state:   isEdit ? t(header?.SHIP_STATE) : "",
        ship_zip:     isEdit ? t(header?.SHIP_ZIP) : "",
        ship_phone:   isEdit ? t(header?.SHIP_PHONE) : "",
        ship_fax:     isEdit ? t(header?.SHIP_FAX) : "",
        active:       isEdit ? (header?.ACTIVE === true || header?.ACTIVE === 1) : true,
        shipto_uq:    isEdit ? t(header?.SHIPTO_UQ ?? "") : "",
        weeks_no:     "0",
        grower_uq:    "",
        ship_day:     "",
    });

    const [form,           setForm]           = useState(initForm);
    const [customerSearch, setCustomerSearch] = useState(isEdit ? t(header?.CUSTOMER) : "");
    const [showCustDrop,   setShowCustDrop]   = useState(false);
    const [shiptos,        setShiptos]        = useState<any[]>([]);
    const [shiptoLoading,  setShiptoLoading]  = useState(false);
    const [saving,         setSaving]         = useState(false);
    const custRef = useRef<HTMLDivElement>(null);

    const f = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
        setForm(p => ({ ...p, [k]: v }));

    // Re-hydrate salesman_uq when lookups arrive (salesman lookup needed for name→uq matching)
    useEffect(() => {
        if (!isEdit) return;
        setForm(prev => ({
            ...prev,
            salesman_uq: prev.salesman_uq || (t(header?.SALESMAN_UQ) || findUq(lookups.salesmen, "salesman_name", header?.SALESMAN_NAME ?? "", "unico")),
            terms_uq:    prev.terms_uq    || (t(header?.TERMS_UQ)    || findUq(lookups.terms,    "CONDITION",     header?.CONDITION     ?? "", "UNICO")),
        }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lookups.salesmen.length, lookups.terms.length]);

    // Load ship-to list when customer changes
    useEffect(() => {
        if (!form.customer_uq) { setShiptos([]); return; }
        let active = true;
        setShiptoLoading(true);
        fetch(`/api/standing-orders/shiptos?customer_uq=${encodeURIComponent(form.customer_uq)}`)
            .then(r => r.json())
            .then(j => { if (active) setShiptos(Array.isArray(j) ? j : []); })
            .catch(() => { if (active) setShiptos([]); })
            .finally(() => { if (active) setShiptoLoading(false); });
        return () => { active = false; };
    }, [form.customer_uq]);

    // Auto-select default ship-to when list loads (new order only)
    useEffect(() => {
        if (isEdit || shiptos.length === 0) return;
        const def = shiptos.find(s => s.shipto_default === true || s.shipto_default === 1) ?? shiptos[0];
        if (def) applyShipto(def);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shiptos]);

    const applyShipto = (s: any) => {
        setForm(p => ({
            ...p,
            shipto_uq:    t(s.unico),
            ship_name:    t(s.name),
            ship_address: t(s.address1),
            ship_city:    t(s.city),
            ship_state:   t(s.state),
            ship_zip:     t(s.zip),
            ship_phone:   t(s.phone),
            ship_fax:     t(s.fax),
            carrier_uq:   t(s.carrier_uq ?? ""),
        }));
    };

    const filteredCusts = customerSearch.length >= 1
        ? lookups.customers
            .filter(c => t(c.CUST_CODE ?? "").toLowerCase().includes(customerSearch.toLowerCase())
                      || t(c.old_code  ?? "").toLowerCase().includes(customerSearch.toLowerCase()))
            .slice(0, 80)
        : [];

    useEffect(() => {
        const h = (e: MouseEvent) => { if (custRef.current && !custRef.current.contains(e.target as Node)) setShowCustDrop(false); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    const handleSave = async () => {
        if (!form.customer_uq) { toast.error("Customer is required"); return; }
        setSaving(true);
        try {
            const body = {
                customer_uq:  form.customer_uq,
                terms_uq:     form.terms_uq,
                salesman_uq:  form.salesman_uq,
                start_date:   form.start_date,
                end_date:     form.end_date,
                carrier_uq:   form.carrier_uq,
                cargo_uq:     form.cargo_uq,
                whouse_uq:    form.whouse_uq,
                day:          form.day,
                cporder_no:   form.cporder_no,
                ship_name:    form.ship_name,
                ship_address: form.ship_address,
                ship_city:    form.ship_city,
                ship_state:   form.ship_state,
                ship_zip:     form.ship_zip,
                ship_fax:     form.ship_fax,
                ship_phone:   form.ship_phone,
                instructions: form.instructions,
                active:       form.active,
                factor:       parseInt(form.factor) || 1,
                shipto_uq:    form.shipto_uq,
                weeks_no:     parseInt(form.weeks_no) || 0,
                grower_uq:    form.grower_uq,
                ship_day:     form.ship_day,
            };
            const url    = isEdit ? `/api/standing-orders/header/${t(header?.UNICO)}` : "/api/standing-orders/header";
            const method = isEdit ? "PUT" : "POST";
            const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
            const j = await r.json();
            if (!r.ok || !j.success) throw new Error(j.error || "Failed");
            toast.success(isEdit ? "Order updated" : "Order created");
            onSaved(j.unico);
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="h-10 bg-[#374151] flex items-center justify-between px-4 shrink-0 rounded-t-lg">
                    <span className="font-black text-[11px] text-white uppercase tracking-widest">
                        {isEdit ? `Edit Order #${t(header?.SORDER_NO)}` : "New Standing Order"}
                    </span>
                    <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
                        <X size={14} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 text-[11px]">

                    {/* Customer combobox */}
                    <div ref={custRef} className="relative">
                        <LabelInput label="Customer *">
                            <input
                                value={customerSearch}
                                onChange={e => {
                                    setCustomerSearch(e.target.value);
                                    setShowCustDrop(true);
                                    if (!e.target.value) f("customer_uq", "");
                                }}
                                onFocus={() => setShowCustDrop(true)}
                                placeholder="Type to search customers..."
                                className={inp}
                            />
                        </LabelInput>
                        {form.customer_uq && (
                            <span className="text-[9px] text-green-600 font-bold">✓ {form.customer_uq}</span>
                        )}
                        {showCustDrop && filteredCusts.length > 0 && (
                            <div className="absolute z-20 top-full left-0 right-0 bg-white border border-gray-200 rounded shadow-xl max-h-44 overflow-y-auto">
                                {filteredCusts.map((c, i) => (
                                    <div key={i}
                                        onClick={() => {
                                            setCustomerSearch(t(c.CUST_CODE));
                                            f("customer_uq", t(c.unico));
                                            setShowCustDrop(false);
                                        }}
                                        className="px-2 py-1 hover:bg-blue-50 cursor-pointer border-b border-gray-100 text-[10px] flex gap-2"
                                    >
                                        <span className="font-bold">{t(c.CUST_CODE)}</span>
                                        <span className="text-gray-400">{t(c.old_code)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Salesman / Day / Terms */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <LabelInput label="Salesman">
                            <select value={form.salesman_uq} onChange={e => f("salesman_uq", e.target.value)} className={inp}>
                                <option value="">— select —</option>
                                {lookups.salesmen.filter(s => t(s.unico) !== "%").map((s, i) => (
                                    <option key={i} value={t(s.unico)}>{t(s.salesman_name)}</option>
                                ))}
                            </select>
                        </LabelInput>
                        <LabelInput label="Day">
                            <select value={form.day} onChange={e => f("day", e.target.value)} className={inp}>
                                {DAYS.map(d => <option key={d} value={d}>{d[0] + d.slice(1).toLowerCase()}</option>)}
                            </select>
                        </LabelInput>
                        <LabelInput label="Terms">
                            <select value={form.terms_uq} onChange={e => f("terms_uq", e.target.value)} className={inp}>
                                <option value="">— select —</option>
                                {lookups.terms.map((tm, i) => (
                                    <option key={i} value={t(tm.UNICO)}>{t(tm.CONDITION)}</option>
                                ))}
                            </select>
                        </LabelInput>
                    </div>

                    {/* Dates / Factor / CP Order */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <LabelInput label="Start Date">
                            <input type="date" value={form.start_date} onChange={e => f("start_date", e.target.value)} className={inp} />
                        </LabelInput>
                        <LabelInput label="End Date">
                            <input type="date" value={form.end_date} onChange={e => f("end_date", e.target.value)} className={inp} />
                        </LabelInput>
                        <LabelInput label="Factor">
                            <input type="number" value={form.factor} onChange={e => f("factor", e.target.value)} className={inp} />
                        </LabelInput>
                        <LabelInput label="CP Order No">
                            <input type="text" value={form.cporder_no} onChange={e => f("cporder_no", e.target.value)} className={inp} />
                        </LabelInput>
                    </div>

                    {/* Warehouse / Cargo Agency / Carrier */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <LabelInput label="Warehouse">
                            <select value={form.whouse_uq} onChange={e => f("whouse_uq", e.target.value)} className={inp}>
                                <option value="">— select —</option>
                                {uniqueWarehouses.map((w, i) => (
                                    <option key={i} value={t(w.whouse_uq)}>{t(w.warehouse)}</option>
                                ))}
                            </select>
                        </LabelInput>
                        <LabelInput label="Cargo Agency">
                            <select value={form.cargo_uq} onChange={e => f("cargo_uq", e.target.value)} className={inp}>
                                <option value="">— select —</option>
                                {lookups.cargoAgencies.filter(a => t(a.unico) !== "%").map((a, i) => (
                                    <option key={i} value={t(a.unico)}>{t(a.agency)}</option>
                                ))}
                            </select>
                        </LabelInput>
                        <LabelInput label="Carrier">
                            <select value={form.carrier_uq} onChange={e => f("carrier_uq", e.target.value)} className={inp}>
                                <option value="">— select —</option>
                                {lookups.carriers.map((c, i) => (
                                    <option key={i} value={t(c.unico)}>{t(c.carrier)}</option>
                                ))}
                            </select>
                        </LabelInput>
                    </div>

                    {/* Instructions */}
                    <LabelInput label="Instructions">
                        <textarea value={form.instructions} onChange={e => f("instructions", e.target.value)} rows={2}
                            className={`${inp} resize-none`} />
                    </LabelInput>

                    {/* Ship To */}
                    <div className="border border-gray-200 rounded p-3 space-y-2">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Ship To</p>
                            {shiptoLoading && <Loader2 size={11} className="animate-spin text-gray-400" />}
                        </div>

                        <LabelInput label="Select Ship-To">
                            <select
                                value={form.shipto_uq}
                                onChange={e => {
                                    const s = shiptos.find(x => t(x.unico) === e.target.value);
                                    if (s) applyShipto(s);
                                    else f("shipto_uq", e.target.value);
                                }}
                                disabled={!form.customer_uq}
                                className={inp}
                            >
                                <option value="">
                                    {shiptoLoading ? "Loading..." : form.customer_uq ? "— select ship-to —" : "— select customer first —"}
                                </option>
                                {shiptos.map((s, i) => (
                                    <option key={i} value={t(s.unico)}>
                                        {t(s.name)} {t(s.shipto) ? `(${t(s.shipto)})` : ""}
                                    </option>
                                ))}
                            </select>
                        </LabelInput>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <LabelInput label="Name">
                                <input type="text" value={form.ship_name} onChange={e => f("ship_name", e.target.value)} className={inp} />
                            </LabelInput>
                            <LabelInput label="Address">
                                <input type="text" value={form.ship_address} onChange={e => f("ship_address", e.target.value)} className={inp} />
                            </LabelInput>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <LabelInput label="City">
                                <input type="text" value={form.ship_city} onChange={e => f("ship_city", e.target.value)} className={inp} />
                            </LabelInput>
                            <LabelInput label="State">
                                <input type="text" value={form.ship_state} onChange={e => f("ship_state", e.target.value)} className={inp} />
                            </LabelInput>
                            <LabelInput label="Zip">
                                <input type="text" value={form.ship_zip} onChange={e => f("ship_zip", e.target.value)} className={inp} />
                            </LabelInput>
                            <LabelInput label="Phone">
                                <input type="text" value={form.ship_phone} onChange={e => f("ship_phone", e.target.value)} className={inp} />
                            </LabelInput>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <LabelInput label="Fax">
                                <input type="text" value={form.ship_fax} onChange={e => f("ship_fax", e.target.value)} className={inp} />
                            </LabelInput>
                        </div>
                    </div>

                    {/* Active (edit only) */}
                    {isEdit && (
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={form.active} onChange={e => f("active", e.target.checked)}
                                className="w-3.5 h-3.5 rounded accent-[#FB7506]" />
                            <span className="text-[11px] font-bold text-gray-700">Active</span>
                        </label>
                    )}
                </div>

                {/* Footer */}
                <div className="h-11 bg-gray-50 border-t border-gray-200 flex items-center justify-end px-4 gap-2 shrink-0 rounded-b-lg">
                    <button onClick={onClose}
                        className="px-3 py-1.5 text-[11px] font-bold text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving}
                        className="px-4 py-1.5 text-[11px] font-black text-white bg-[#FB7506] hover:bg-orange-500 rounded disabled:opacity-40 flex items-center gap-1 transition-colors">
                        {saving ? <Loader2 size={10} className="animate-spin" /> : <Check size={10} />}
                        {isEdit ? "Save Changes" : "Create Order"}
                    </button>
                </div>
            </div>
        </div>
    );
}
