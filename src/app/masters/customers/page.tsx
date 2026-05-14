"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    ArrowLeft, Search, Plus, Pencil, Trash2, Save, X, RefreshCcw,
    Download, Users, Truck, FileText, MessageSquare, Check,
    AlertCircle, Copy, Star, XCircle, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { todayEST, formatDateEST, formatMoney, parseMoney, normalizeToISODate } from "@/lib/dates";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const t       = (v: any) => String(v ?? "").trim();
const apiFetch = async (url: string) => { const r = await fetch(url); const j = await r.json(); if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`); return j; };

const CALL_OPTS    = ["N","Y","M","A","T"];
const AVAIL_OPTS   = ["NONE","EMAIL","FAX","PHONE"];
const INV_OPTS     = ["EMAIL","FAX","MAIL","NONE"];
const EMPTY_CUST = { old_code:"", edi_code:"", fobmiami:false, inventory_from_invoice:false, dex:false, auto_charge:false, credithold:false, internal_customer:false, active:true, customer:"", dba:"", contact:"", purchaser:"", address1:"", address2:"", city:"", state:"", zip:"", country:"", phone_1:"", phone_2:"", fax_1:"", fax_2:"", email:"", terms_uq:"", calls:"NNNNNN", subregion_uq:"", salesman_uq:"", group_uq:"", rc_uq:"", pickremark:"", julian_from:"", reasonhold:"", credit_limit:0, insurance_for:0, price_margin:0, dry_discount:0, sales_web_uq:"", custsince:"", ap_contact:"", ap_email:"", ap_msn:"", ap_phone:"", ap_fax:"", website:"", statement_print:false, inspection:false, gpm:0, availability_by:"NONE", availability_to:"", invoice_by:"EMAIL", extension:0, commission_days:0, resale_tax:0, ccard_name:"", ccard_on_file:"", ccard_expiration_month:"", ccard_expiration_year:"", tax_id:"", international:false, collection:false, check_price_override:false };
const EMPTY_SHIPTO = { shipto:0, name:"", address1:"", address2:"", city:"", state:"", zip:"", country:"", contact:"", phone:"", fax:"", zone:"", region:"", district:"", dc_uq:"", route_uq:"", hours24:false, truck_days:0, edi_code:"", glnumber:"", duns:"", tax_percentage:0 };
const EMPTY_CARRIER = { carrier_uq:"", account:"", zone:"", mon:false, tue:false, wed:false, thu:false, fri:false, sat:false, sun:false };
const EMPTY_WEBUSER = { fname:"", lname:"", username:"", password:"", active:true, makeinvoice:false, makeprebook:false, makecredit:false, viewaccount:false, viewproducts:false, viewhistory:false, email:"", phone:"" };

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CustomersSetupPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const qc = useQueryClient();

    // ── Customer list state (infinite scroll) ────────────────────────────────
    const [custList,       setCustList]       = useState<any[]>([]);
    const [custPage,       setCustPage]       = useState(1);
    const [hasMoreCusts,   setHasMoreCusts]   = useState(true);
    const [loadingList,    setLoadingList]    = useState(false);
    const [loadingMore,    setLoadingMore]    = useState(false);
    const [totalRecords,   setTotalRecords]   = useState(0);
    const custGridRef = useRef<HTMLDivElement>(null);

    const [search,         setSearch]         = useState("");
    const [selCust,        setSelCust]        = useState<any>(null);
    const [selShipto,      setSelShipto]      = useState<any>(null);
    const [selCarrier,     setSelCarrier]     = useState<any>(null);
    const [selWebUser,     setSelWebUser]     = useState<any>(null);
    const [selMessage,     setSelMessage]     = useState<any>(null);
    const [activeTab,      setActiveTab]      = useState<"shipto"|"statement"|"webusers"|"messages">("shipto");
    const [custModal,      setCustModal]      = useState<{ mode:"add"|"edit"|"delete" } | null>(null);
    const [shiptoModal,    setShiptoModal]    = useState<{ mode:"add"|"edit"|"delete" } | null>(null);
    const [carrierModal,   setCarrierModal]   = useState<{ mode:"add"|"edit"|"delete" } | null>(null);
    const [webUserModal,   setWebUserModal]   = useState<{ mode:"add"|"edit"|"delete" } | null>(null);
    const [msgModal,       setMsgModal]       = useState(false);
    const [custForm,       setCustForm]       = useState<any>(EMPTY_CUST);
    const [shiptoForm,     setShiptoForm]     = useState<any>(EMPTY_SHIPTO);
    const [carrierForm,    setCarrierForm]    = useState<any>(EMPTY_CARRIER);
    const [webUserForm,    setWebUserForm]    = useState<any>(EMPTY_WEBUSER);
    const [msgForm,        setMsgForm]        = useState({ comments:"", deadline:"", user_to:"" });
    const [formError,      setFormError]      = useState<string | null>(null);
    const [saving,         setSaving]         = useState(false);
    const [stmtFrom,       setStmtFrom]       = useState(todayEST());
    const [stmtTo,         setStmtTo]         = useState(todayEST());
    const [stmtEnabled,    setStmtEnabled]    = useState(false);
    const [custModalTab,   setCustModalTab]   = useState<"general"|"financial"|"delivery">("general");

    useEffect(() => { if (status === "unauthenticated") router.push("/login"); }, [status, router]);

    // ── Customer list fetch (supports infinite scroll) ────────────────────────
    const fetchCustomers = useCallback(async (page: number, q: string, append: boolean) => {
        if (page === 1) setLoadingList(true); else setLoadingMore(true);
        try {
            const param = q.trim() ? q.trim() : "%";
            const data  = await apiFetch(`/api/masters/customers?search=${encodeURIComponent(param)}&page=${page}`);
            const rows  = data.customers ?? [];
            if (append) {
                setCustList(prev => [...prev, ...rows]);
            } else {
                setCustList(rows);
                if (rows.length > 0) selectCustomer(rows[0]);
                else setSelCust(null);
            }
            setCustPage(page);
            setHasMoreCusts(data.hasMore ?? false);
            setTotalRecords(data.totalRecords ?? 0);
        } catch { /* silent */ }
        finally { setLoadingList(false); setLoadingMore(false); }
    }, []);

    // Reset & reload when search changes
    useEffect(() => {
        setCustList([]); setCustPage(1); setHasMoreCusts(true);
        fetchCustomers(1, search, false);
    }, [search, fetchCustomers]);

    const refetchList = () => { setCustList([]); fetchCustomers(1, search, false); };

    // Infinite scroll handler
    const handleCustScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 80 && !loadingMore && hasMoreCusts) {
            fetchCustomers(custPage + 1, search, true);
        }
    };

    // ── Queries ───────────────────────────────────────────────────────────────

    const { data: shiptos = [], isFetching: loadingShiptos, refetch: refetchShiptos } = useQuery({
        queryKey: ["cust-shiptos", selCust?.unico],
        queryFn:  () => apiFetch(`/api/masters/customers/${selCust.unico}/shiptos`),
        enabled:  !!selCust?.unico,
    });

    const { data: carriers = [], isFetching: loadingCarriers, refetch: refetchCarriers } = useQuery({
        queryKey: ["cust-carriers", selCust?.unico, selShipto?.unico],
        queryFn:  () => apiFetch(`/api/masters/customers/carrier?cust_uq=${selCust.unico}&shipto_uq=${selShipto?.unico||""}`),
        enabled:  !!selCust?.unico,
    });

    const { data: statement = [], isFetching: loadingStmt, refetch: refetchStmt } = useQuery({
        queryKey: ["cust-stmt", selCust?.unico, stmtFrom, stmtTo],
        queryFn:  () => apiFetch(`/api/masters/customers/${selCust.unico}/statement?from=${stmtFrom}&to=${stmtTo}`),
        enabled:  !!selCust?.unico && stmtEnabled,
        retry:    false,
    });

    const { data: webUsers = [], isFetching: loadingWebUsers, refetch: refetchWebUsers } = useQuery({
        queryKey: ["cust-webusers", selCust?.unico],
        queryFn:  () => apiFetch(`/api/masters/customers/${selCust.unico}/web-users`),
        enabled:  !!selCust?.unico && activeTab === "webusers",
    });

    const { data: messages = [], isFetching: loadingMsgs, refetch: refetchMsgs } = useQuery({
        queryKey: ["cust-msgs", selCust?.unico],
        queryFn:  () => apiFetch(`/api/masters/customers/${selCust.unico}/messages`),
        enabled:  !!selCust?.unico && activeTab === "messages",
    });

    const { data: lookups } = useQuery({
        queryKey: ["cust-lookups"],
        queryFn:  () => apiFetch("/api/masters/customers/lookups"),
        staleTime: 1000 * 60 * 10,
    });

    // ── Cascade auto-selection: customer → shipto → carrier ──────────────────
    // Auto-select first ship-to when shiptos load for selected customer
    useEffect(() => {
        if ((shiptos as any[]).length > 0) setSelShipto((shiptos as any[])[0]);
        else setSelShipto(null);
    }, [shiptos]);

    // Auto-select first carrier when carriers load
    useEffect(() => {
        if ((carriers as any[]).length > 0) setSelCarrier((carriers as any[])[0]);
        else setSelCarrier(null);
    }, [carriers]);

    // Auto-select first web user when tab opens
    useEffect(() => {
        if ((webUsers as any[]).length > 0) setSelWebUser((webUsers as any[])[0]);
        else setSelWebUser(null);
    }, [webUsers]);

    const selectCustomer = (c: any) => { setSelCust(c); setSelShipto(null); setSelCarrier(null); setSelWebUser(null); setFormError(null); };

    // ── Export CSV ────────────────────────────────────────────────────────────
    const exportCSV = () => {
        const headers = ["Code","Customer","Active","Hold","Salesman","Address","City","State","Country","Phone","Fax","Email","Contact","Group","Since","Terms"];
        const rows = custList.map((c: any) => [t(c.old_code),t(c.customer),(c.active==="Yes"||c.active===true)?"Yes":"No",(c.credithold==="Yes"||c.credithold===true)?"Yes":"No",t(c.salesman_name),t(c.address1),t(c.city),t(c.state),t(c.country),t(c.phone_1),t(c.fax_1),t(c.email),t(c.contact),t(c.groupname),t(c.custsince),t(c.terms)]);
        const csv = [headers,...rows].map(r=>r.map((v:any)=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
        const a = Object.assign(document.createElement("a"),{href:URL.createObjectURL(new Blob([csv],{type:"text/csv"})),download:`customers-${todayEST()}.csv`});
        document.body.appendChild(a);a.click();document.body.removeChild(a);
    };

    // ── Customer CRUD ─────────────────────────────────────────────────────────
    const validateCust = () => {
        if (!custForm.customer.trim()) return "Customer name is required.";
        if (!custForm.address1.trim()) return "Address is required.";
        if (!custForm.city.trim())     return "City is required.";
        if (!custForm.state.trim())    return "State is required.";
        if (!custForm.zip.trim())      return "Zip code is required.";
        if (!custForm.country.trim())  return "Country is required.";
        if (!custForm.phone_1.trim())  return "Phone number is required.";
        if (!custForm.fax_1.trim())    return "Fax number is required.";
        if (!custForm.terms_uq?.trim() && !custForm.terms?.trim()) return "Terms is required.";
        if (!custForm.salesman_uq?.trim()) return "Salesman is required.";
        if (!custForm.group_uq?.trim())    return "Group is required.";
        if (!custForm.rc_uq?.trim())       return "Customer For (Company) is required.";
        if (custForm.credithold && !custForm.reasonhold?.trim()) return "Reason hold is required when credit hold is active.";
        return null;
    };

    const saveCust = async () => {
        const err = validateCust(); if (err) { setFormError(err); return; }
        setSaving(true); setFormError(null);
        try {
            let unico = selCust?.unico;
            if (custModal?.mode === "add") {
                const res  = await fetch("/api/masters/customers/create", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(custForm) });
                const data = await res.json(); if (!data.success) throw new Error(data.error); unico = data.unico;
            } else {
                const res  = await fetch(`/api/masters/customers/${unico}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(custForm) });
                const data = await res.json(); if (!data.success) throw new Error(data.error);
            }
            await qc.invalidateQueries({ queryKey: ["cust-list"] });
            setCustModal(null);
        } catch (e: any) { setFormError(e.message); }
        finally { setSaving(false); }
    };

    const deleteCust = async () => {
        setSaving(true);
        try {
            const res  = await fetch(`/api/masters/customers/${selCust.unico}`, { method:"DELETE" });
            const data = await res.json(); if (!data.success) throw new Error(data.error);
            setSelCust(null);
            await qc.invalidateQueries({ queryKey: ["cust-list"] });
            setCustModal(null);
        } catch (e: any) { setFormError(e.message); }
        finally { setSaving(false); }
    };

    // ── Ship-to CRUD ──────────────────────────────────────────────────────────
    const saveShipto = async () => {
        setSaving(true); setFormError(null);
        try {
            if (shiptoModal?.mode === "add") {
                const res  = await fetch("/api/masters/customers/shipto", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({...shiptoForm, cust_uq: selCust.unico}) });
                const data = await res.json(); if (!data.success) throw new Error(data.error);
            } else if (shiptoModal?.mode === "edit") {
                const res  = await fetch(`/api/masters/customers/shipto/${selShipto.unico}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(shiptoForm) });
                const data = await res.json(); if (!data.success) throw new Error(data.error);
            } else {
                const res  = await fetch(`/api/masters/customers/shipto/${selShipto.unico}`, { method:"DELETE" });
                const data = await res.json(); if (!data.success) throw new Error(data.error);
                setSelShipto(null);
            }
            await refetchShiptos(); setShiptoModal(null);
        } catch (e: any) { setFormError(e.message); }
        finally { setSaving(false); }
    };

    // ── Carrier CRUD ──────────────────────────────────────────────────────────
    const saveCarrier = async () => {
        setSaving(true); setFormError(null);
        try {
            if (carrierModal?.mode === "add") {
                const res  = await fetch("/api/masters/customers/carrier", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({...carrierForm, customer_uq: selCust.unico, shipto_uq: selShipto?.unico||""}) });
                const data = await res.json(); if (!data.success) throw new Error(data.error);
            } else if (carrierModal?.mode === "edit") {
                const res  = await fetch(`/api/masters/customers/carrier/${selCarrier.unico}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({...carrierForm, shipto_uq: selShipto?.unico||""}) });
                const data = await res.json(); if (!data.success) throw new Error(data.error);
            } else {
                const res  = await fetch(`/api/masters/customers/carrier/${selCarrier.unico}`, { method:"DELETE" });
                const data = await res.json(); if (!data.success) throw new Error(data.error);
                setSelCarrier(null);
            }
            await refetchCarriers(); setCarrierModal(null);
        } catch (e: any) { setFormError(e.message); }
        finally { setSaving(false); }
    };

    const setDefaultCarrier = async () => {
        if (!selCarrier) return;
        try {
            await fetch(`/api/masters/customers/carrier/${selCarrier.unico}/default`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ customer_uq: selCust.unico }) });
            await refetchCarriers();
        } catch {}
    };

    // ── Web User CRUD ─────────────────────────────────────────────────────────
    const saveWebUser = async () => {
        setSaving(true); setFormError(null);
        try {
            if (webUserModal?.mode === "add") {
                const res  = await fetch("/api/masters/customers/web-user", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({...webUserForm, customer_uq: selCust.unico}) });
                const data = await res.json(); if (!data.success) throw new Error(data.error);
            } else if (webUserModal?.mode === "edit") {
                const res  = await fetch(`/api/masters/customers/web-user/${selWebUser.unico}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(webUserForm) });
                const data = await res.json(); if (!data.success) throw new Error(data.error);
            } else {
                const res  = await fetch(`/api/masters/customers/web-user/${selWebUser.unico}`, { method:"DELETE" });
                const data = await res.json(); if (!data.success) throw new Error(data.error);
                setSelWebUser(null);
            }
            await refetchWebUsers(); setWebUserModal(null);
        } catch (e: any) { setFormError(e.message); }
        finally { setSaving(false); }
    };

    // ── Message CRUD ──────────────────────────────────────────────────────────
    const saveMsg = async () => {
        if (!msgForm.comments.trim()) { setFormError("Comment text is required."); return; }
        setSaving(true); setFormError(null);
        try {
            const res  = await fetch(`/api/masters/customers/${selCust.unico}/messages`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(msgForm) });
            const data = await res.json(); if (!data.success) throw new Error(data.error);
            await refetchMsgs(); setMsgModal(false); setMsgForm({ comments:"", deadline:"", user_to:"" });
        } catch (e: any) { setFormError(e.message); }
        finally { setSaving(false); }
    };

    const copyFromBilling = async () => {
        try {
            const res  = await fetch(`/api/masters/customers/${selCust.unico}/shipto-copy`, { method:"POST" });
            const data = await res.json(); if (!data.success) throw new Error(data.error);
            await refetchShiptos();
        } catch (e: any) { setFormError(e.message); }
    };

    if (status === "loading") return null;

    return (
        <div className="flex flex-col h-screen bg-[#f4f6f8] overflow-hidden font-sans text-[#333]">

            {/* Header */}
            <div className="h-12 bg-[#374151] flex items-center justify-between px-4 shrink-0 text-white">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push("/menu")} className="hover:bg-white/10 p-1.5 rounded transition-colors"><ArrowLeft size={18} /></button>
                    <div className="flex items-center gap-2">
                        <span className="font-black text-xs uppercase tracking-widest text-[#FB7506]">FOS</span>
                        <div className="w-px h-4 bg-white/20 mx-2" />
                        <Users size={14} className="text-[#FB7506]" />
                        <span className="font-bold text-xs uppercase tracking-tight">Customers Setup</span>
                    </div>
                </div>
                <span className="text-gray-400 text-[10px] font-bold">User: <span className="text-white">{session?.user?.name}</span></span>
            </div>

            {/* Search toolbar */}
            <div className="bg-white border-b border-gray-200 px-3 py-2 flex items-center gap-2 shrink-0 shadow-sm flex-wrap">
                <div className="relative">
                    <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && refetchList()}
                        placeholder="Search customers..." className="pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded outline-none focus:ring-1 focus:ring-[#FB7506] w-52" />
                </div>
                <button onClick={() => refetchList()} className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 border border-gray-200 px-2.5 py-1 rounded text-[10px] font-black uppercase transition-all">
                    <RefreshCcw size={10} className={loadingList ? "animate-spin" : ""} /> Refresh
                </button>
                <button onClick={exportCSV} className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 border border-gray-200 px-2.5 py-1 rounded text-[10px] font-black uppercase transition-all">
                    <Download size={10} /> CSV
                </button>
                <div className="w-px h-5 bg-gray-200" />
                <button onClick={() => { setCustForm({...EMPTY_CUST}); setFormError(null); setCustModalTab("general"); setCustModal({ mode:"add" }); }}
                    className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-2.5 py-1 rounded text-[10px] font-black uppercase transition-all">
                    <Plus size={10} /> Add
                </button>
                <button onClick={() => { if (!selCust) return; const c = selCust; setCustForm({ old_code:c.old_code||"", edi_code:t(c.edi_code), fobmiami:!!c.fobmiami, inventory_from_invoice:!!c.inventory_from_invoice, dex:!!c.dex, auto_charge:!!c.auto_charge, credithold:!!c.credithold, internal_customer:!!c.internal_customer, active:!!c.active, customer:t(c.customer), dba:t(c.dba), contact:t(c.contact), purchaser:t(c.purchaser), address1:t(c.address1), address2:t(c.address2), city:t(c.city), state:t(c.state), zip:t(c.zip), country:t(c.country), phone_1:t(c.phone_1), phone_2:t(c.phone_2), fax_1:t(c.fax_1), fax_2:t(c.fax_2), email:t(c.email), terms_uq:t(c.terms_uq||c.terms), calls:t(c.calls)||"NNNNNN", subregion_uq:t(c.subregion_uq), salesman_uq:t(c.salesman_uq), group_uq:t(c.group_uq), rc_uq:t(c.rc_uq), pickremark:t(c.pickremark), julian_from:t(c.julian_from), reasonhold:t(c.reasonhold), credit_limit:c.credit_limit||0, insurance_for:c.insurance_for||0, price_margin:c.price_margin||0, dry_discount:c.dry_discount||0, sales_web_uq:t(c.sales_web_uq), custsince:c.custsince?normalizeToISODate(c.custsince):"", ap_contact:t(c.ap_contact), ap_email:t(c.ap_email), ap_msn:t(c.ap_msn), ap_phone:t(c.ap_phone), ap_fax:t(c.ap_fax), website:t(c.website), statement_print:!!c.statement_print, inspection:!!c.inspection, gpm:c.gpm||0, availability_by:t(c.availability_by)||"NONE", availability_to:t(c.availability_to), invoice_by:t(c.invoice_by)||"EMAIL", extension:c.extension||0, commission_days:c.commission_days||0, resale_tax:c.resale_tax||0, ccard_name:t(c.ccard_name), ccard_on_file:t(c.ccard_on_file), ccard_expiration_month:t(c.ccard_expiration_month), ccard_expiration_year:t(c.ccard_expiration_year), tax_id:t(c.tax_id), international:!!c.international, collection:!!c.collection, check_price_override:!!c.check_price_override }); setFormError(null); setCustModalTab("general"); setCustModal({ mode:"edit" }); }}
                    disabled={!selCust}
                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-2.5 py-1 rounded text-[10px] font-black uppercase transition-all">
                    <Pencil size={10} /> Edit
                </button>
                <button onClick={() => { if (selCust) { setFormError(null); setCustModal({ mode:"delete" }); } }} disabled={!selCust}
                    className="flex items-center gap-1 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white px-2.5 py-1 rounded text-[10px] font-black uppercase transition-all">
                    <Trash2 size={10} /> Delete
                </button>
                {formError && <span className="text-amber-600 text-[10px] font-bold flex items-center gap-1 ml-2"><AlertCircle size={11} />{formError}</span>}
                <span className="ml-auto text-[10px] text-gray-400 font-bold">
                    {custList.length}{totalRecords > 0 ? ` / ${totalRecords}` : ""} customers
                    {loadingMore && <span className="ml-2 text-[#FB7506]">Loading...</span>}
                </span>
            </div>

            {/* Customer Grid */}
            <div className="bg-white border-b border-gray-200 shadow-sm shrink-0" style={{ height: "170px" }}>
                <div className="overflow-auto h-full" onScroll={handleCustScroll}>
                    <table className="min-w-full text-xs text-left">
                        <thead className="bg-gray-100 border-b text-gray-700 font-bold sticky top-0 z-10">
                            <tr>
                                {["Code","Customer","Active","Hold","Salesman","Address","City","State","Country","Phone","Fax","Email","Contact","Group","Since","Terms"].map(h => (
                                    <th key={h} className="p-1.5 whitespace-nowrap border-r border-gray-200 last:border-r-0">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {custList.map((c: any) => {
                                const isSel = selCust?.unico === c.unico;
                                return (
                                    <tr key={c.unico} onClick={() => selectCustomer(c)}
                                        className={cn("border-b cursor-pointer transition-colors", isSel ? "!bg-blue-100 ring-2 ring-inset ring-blue-300" : "odd:bg-white even:bg-gray-50 hover:bg-blue-50")}>
                                        <td className="p-1.5 border-r border-gray-100 font-mono text-[10px]">{t(c.old_code)}</td>
                                        <td className="p-1.5 border-r border-gray-100 font-semibold truncate max-w-[180px]">{t(c.customer)}</td>
                                        <td className="p-1.5 border-r border-gray-100 text-center">{(c.active==="Yes"||c.active===true) ? <Check size={10} className="text-green-500 mx-auto" /> : <X size={10} className="text-gray-300 mx-auto" />}</td>
                                        <td className="p-1.5 border-r border-gray-100 text-center">{(c.credithold==="Yes"||c.credithold===true) ? <span className="text-red-500 font-black text-[9px]">HOLD</span> : "—"}</td>
                                        <td className="p-1.5 border-r border-gray-100 truncate max-w-[120px] text-gray-500">{t(c.salesman_name)}</td>
                                        <td className="p-1.5 border-r border-gray-100 truncate max-w-[140px]">{t(c.address1)}</td>
                                        <td className="p-1.5 border-r border-gray-100">{t(c.city)}</td>
                                        <td className="p-1.5 border-r border-gray-100">{t(c.state)}</td>
                                        <td className="p-1.5 border-r border-gray-100">{t(c.country)}</td>
                                        <td className="p-1.5 border-r border-gray-100 whitespace-nowrap">{t(c.phone_1)}</td>
                                        <td className="p-1.5 border-r border-gray-100 whitespace-nowrap text-gray-400">{t(c.fax_1)}</td>
                                        <td className="p-1.5 border-r border-gray-100 truncate max-w-[140px] text-gray-400">{t(c.email)}</td>
                                        <td className="p-1.5 border-r border-gray-100 truncate max-w-[100px]">{t(c.contact)}</td>
                                        <td className="p-1.5 border-r border-gray-100 text-gray-400">{t(c.groupname)}</td>
                                        <td className="p-1.5 border-r border-gray-100 whitespace-nowrap text-gray-400">{t(c.custsince)?.split("T")[0]}</td>
                                        <td className="p-1.5 text-gray-400 whitespace-nowrap">{t(c.terms)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Tabs area */}
            <div className="flex flex-col flex-1 overflow-hidden">
                {/* Tab bar */}
                <div className="bg-[#374151] flex items-end px-2 gap-0.5 shrink-0 h-9">
                    {([
                        { id:"shipto",    label:"Ship-to Detail", icon:Truck },
                        { id:"statement", label:"Statement",       icon:FileText },
                        { id:"webusers",  label:"Web Users",       icon:Users },
                        { id:"messages",  label:"Messages",        icon:MessageSquare },
                    ] as const).map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={cn("flex items-center gap-1.5 px-4 h-7 text-[10px] font-black uppercase tracking-wider rounded-t transition-all",
                                activeTab === tab.id ? "bg-[#f4f6f8] text-[#FB7506]" : "text-gray-400 hover:text-white hover:bg-white/10")}>
                            <tab.icon size={11} />{tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab content */}
                <div className="flex-1 overflow-hidden bg-[#f4f6f8] p-2 flex flex-col gap-2">

                    {/* ── SHIP-TO TAB ───────────────────────────────────────── */}
                    {activeTab === "shipto" && (
                        <>
                            {/* Ship-to grid */}
                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex-1 min-h-0 flex flex-col">
                                <div className="h-9 bg-[#374151] flex items-center justify-between px-3 shrink-0">
                                    <div className="flex items-center gap-2">
                                        <Truck size={13} className="text-[#FB7506]" />
                                        <span className="font-black text-[10px] uppercase tracking-widest text-white">Ship-to Addresses</span>
                                        {loadingShiptos && <RefreshCcw size={10} className="text-gray-400 animate-spin" />}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <button onClick={() => { setShiptoForm({...EMPTY_SHIPTO}); setFormError(null); setShiptoModal({ mode:"add" }); }} disabled={!selCust}
                                            className="flex items-center gap-1 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase">
                                            <Plus size={9} /> Add
                                        </button>
                                        <button onClick={() => { if(!selShipto) return; setShiptoForm({...selShipto, dc_uq:t(selShipto.dc_uq), route_uq:t(selShipto.route_uq)}); setFormError(null); setShiptoModal({ mode:"edit" }); }} disabled={!selShipto}
                                            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase">
                                            <Pencil size={9} /> Edit
                                        </button>
                                        <button onClick={() => { if(selShipto) { setFormError(null); setShiptoModal({ mode:"delete" }); } }} disabled={!selShipto}
                                            className="flex items-center gap-1 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase">
                                            <Trash2 size={9} /> Delete
                                        </button>
                                        <button onClick={copyFromBilling} disabled={!selCust}
                                            className="flex items-center gap-1 bg-gray-600 hover:bg-gray-500 disabled:opacity-40 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase">
                                            <Copy size={9} /> Copy Bill
                                        </button>
                                    </div>
                                </div>
                                <div className="overflow-auto flex-1">
                                    <table className="min-w-full text-xs">
                                        <thead className="bg-gray-100 border-b text-gray-700 font-bold sticky top-0 z-10">
                                            <tr>{["#","Name","Address","City","State","Zip","Country","Contact","Phone","Zone","Route","24h","Truck"].map(h => <th key={h} className="p-1.5 whitespace-nowrap border-r border-gray-200 last:border-r-0">{h}</th>)}</tr>
                                        </thead>
                                        <tbody>
                                            {!selCust ? <tr><td colSpan={13} className="p-6 text-center text-gray-300 text-xs">Select a customer</td></tr>
                                            : (shiptos as any[]).map((s: any) => {
                                                const isSel = selShipto?.unico === s.unico;
                                                return (
                                                    <tr key={s.unico} onClick={() => setSelShipto(s)}
                                                        className={cn("border-b cursor-pointer transition-colors", isSel ? "!bg-blue-100 ring-2 ring-inset ring-blue-300" : "odd:bg-white even:bg-gray-50 hover:bg-blue-50")}>
                                                        <td className="p-1.5 border-r border-gray-100 font-mono">{s.shipto}</td>
                                                        <td className="p-1.5 border-r border-gray-100 font-medium truncate max-w-[140px]">{t(s.name)}</td>
                                                        <td className="p-1.5 border-r border-gray-100 truncate max-w-[140px]">{t(s.address1)}</td>
                                                        <td className="p-1.5 border-r border-gray-100">{t(s.city)}</td>
                                                        <td className="p-1.5 border-r border-gray-100">{t(s.state)}</td>
                                                        <td className="p-1.5 border-r border-gray-100">{t(s.zip)}</td>
                                                        <td className="p-1.5 border-r border-gray-100">{t(s.country)}</td>
                                                        <td className="p-1.5 border-r border-gray-100 truncate max-w-[100px]">{t(s.contact)}</td>
                                                        <td className="p-1.5 border-r border-gray-100 whitespace-nowrap">{t(s.phone)}</td>
                                                        <td className="p-1.5 border-r border-gray-100">{t(s.zone)}</td>
                                                        <td className="p-1.5 border-r border-gray-100">{t(s.route)}</td>
                                                        <td className="p-1.5 border-r border-gray-100 text-center">{s.hours24 ? <Check size={10} className="text-green-500 mx-auto" /> : "—"}</td>
                                                        <td className="p-1.5">{s.truck_days||0}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Carriers grid */}
                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex-1 min-h-0 flex flex-col">
                                <div className="h-9 bg-[#374151] flex items-center justify-between px-3 shrink-0">
                                    <div className="flex items-center gap-2">
                                        <Truck size={13} className="text-[#FB7506]" />
                                        <span className="font-black text-[10px] uppercase tracking-widest text-white">Carriers by Ship-to</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <button onClick={() => { setCarrierForm({...EMPTY_CARRIER}); setFormError(null); setCarrierModal({ mode:"add" }); }} disabled={!selCust}
                                            className="flex items-center gap-1 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase">
                                            <Plus size={9} /> Add
                                        </button>
                                        <button onClick={() => { if(!selCarrier) return; setCarrierForm({carrier_uq:t(selCarrier.carrier_uq), account:t(selCarrier.account), zone:t(selCarrier.zone), mon:!!selCarrier.mon, tue:!!selCarrier.tue, wed:!!selCarrier.wed, thu:!!selCarrier.thu, fri:!!selCarrier.fri, sat:!!selCarrier.sat, sun:!!selCarrier.sun}); setFormError(null); setCarrierModal({ mode:"edit" }); }} disabled={!selCarrier}
                                            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase">
                                            <Pencil size={9} /> Edit
                                        </button>
                                        <button onClick={() => { if(selCarrier) { setFormError(null); setCarrierModal({ mode:"delete" }); } }} disabled={!selCarrier}
                                            className="flex items-center gap-1 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase">
                                            <Trash2 size={9} /> Delete
                                        </button>
                                        <button onClick={setDefaultCarrier} disabled={!selCarrier}
                                            className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase">
                                            <Star size={9} /> Default
                                        </button>
                                    </div>
                                </div>
                                <div className="overflow-auto flex-1">
                                    <table className="min-w-full text-xs">
                                        <thead className="bg-gray-100 border-b text-gray-700 font-bold sticky top-0 z-10">
                                            <tr>{["Carrier","Account","Ship-to","Zone","Default","Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(h => <th key={h} className="p-1.5 whitespace-nowrap border-r border-gray-200 last:border-r-0 text-center">{h}</th>)}</tr>
                                        </thead>
                                        <tbody>
                                            {(carriers as any[]).map((c: any) => {
                                                const isSel = selCarrier?.unico === c.unico;
                                                return (
                                                    <tr key={c.unico} onClick={() => setSelCarrier(c)}
                                                        className={cn("border-b cursor-pointer", isSel ? "!bg-blue-100 ring-2 ring-inset ring-blue-300" : "odd:bg-white even:bg-gray-50 hover:bg-blue-50")}>
                                                        <td className="p-1.5 border-r border-gray-100 font-medium">{t(c.carrier)}</td>
                                                        <td className="p-1.5 border-r border-gray-100">{t(c.account)}</td>
                                                        <td className="p-1.5 border-r border-gray-100 truncate max-w-[100px]">{t(c.ship_name)}</td>
                                                        <td className="p-1.5 border-r border-gray-100 text-center">{t(c.zone)}</td>
                                                        {["defa_carrier","mon","tue","wed","thu","fri","sat","sun"].map(d => (
                                                            <td key={d} className="p-1.5 border-r border-gray-100 text-center last:border-r-0">
                                                                {c[d] ? <Check size={10} className={d==="defa_carrier"?"text-amber-500 mx-auto":"text-green-500 mx-auto"} /> : <span className="text-gray-200">—</span>}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ── STATEMENT TAB ─────────────────────────────────────── */}
                    {activeTab === "statement" && (
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
                            <div className="h-9 bg-[#374151] flex items-center justify-between px-3 shrink-0">
                                <div className="flex items-center gap-2">
                                    <FileText size={13} className="text-[#FB7506]" />
                                    <span className="font-black text-[10px] uppercase tracking-widest text-white">Account Statement</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="date" value={stmtFrom} onChange={e => setStmtFrom(e.target.value)} className="bg-gray-700 text-white text-[9px] border-none outline-none rounded px-1.5 py-0.5 w-28" />
                                    <span className="text-gray-500 text-[9px]">→</span>
                                    <input type="date" value={stmtTo} onChange={e => setStmtTo(e.target.value)} className="bg-gray-700 text-white text-[9px] border-none outline-none rounded px-1.5 py-0.5 w-28" />
                                    <button onClick={() => { setStmtEnabled(true); refetchStmt(); }} className="flex items-center gap-1 bg-[#FB7506] hover:bg-orange-600 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase"><RefreshCcw size={9} /> Load</button>
                                </div>
                            </div>
                            <div className="overflow-auto flex-1">
                                {!stmtEnabled ? <div className="h-32 flex items-center justify-center text-gray-300 text-xs font-bold uppercase">Select date range and click Load</div>
                                : (statement as any[]).length === 0 ? <div className="h-32 flex items-center justify-center text-gray-400 text-xs italic">{loadingStmt ? "Loading..." : "No statement records"}</div>
                                : (
                                    <table className="min-w-full text-xs">
                                        <thead className="bg-gray-100 border-b text-gray-700 font-bold sticky top-0 z-10">
                                            <tr>{["Type","Doc No.","Date","Due Date","Amount","Payments","Debits","Credits","Balance"].map(h => <th key={h} className="p-2 border-r border-gray-200 last:border-r-0 text-right first:text-left">{h}</th>)}</tr>
                                        </thead>
                                        <tbody>
                                            {(statement as any[]).map((row: any, i: number) => (
                                                <tr key={i} className="border-b odd:bg-white even:bg-gray-50">
                                                    <td className="p-2 border-r border-gray-100 font-medium">{t(row.type)}</td>
                                                    <td className="p-2 border-r border-gray-100 font-mono">{t(row.invoice_no)}</td>
                                                    <td className="p-2 border-r border-gray-100 whitespace-nowrap">{formatDateEST(normalizeToISODate(row.fecha||row.date))}</td>
                                                    <td className="p-2 border-r border-gray-100 whitespace-nowrap">{formatDateEST(normalizeToISODate(row.due_date))}</td>
                                                    <td className="p-2 border-r border-gray-100 text-right">{formatMoney(row.ammount)}</td>
                                                    <td className="p-2 border-r border-gray-100 text-right text-green-600">{formatMoney(row.payments)}</td>
                                                    <td className="p-2 border-r border-gray-100 text-right text-red-500">{formatMoney(row.debits)}</td>
                                                    <td className="p-2 border-r border-gray-100 text-right text-blue-600">{formatMoney(row.credits)}</td>
                                                    <td className="p-2 text-right font-semibold text-orange-600">{formatMoney(row.balance)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── WEB USERS TAB ────────────────────────────────────── */}
                    {activeTab === "webusers" && (
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
                            <div className="h-9 bg-[#374151] flex items-center justify-between px-3 shrink-0">
                                <div className="flex items-center gap-2"><Users size={13} className="text-[#FB7506]" /><span className="font-black text-[10px] uppercase tracking-widest text-white">Web Users / Portal</span></div>
                                <div className="flex items-center gap-1.5">
                                    <button onClick={() => { setWebUserForm({...EMPTY_WEBUSER}); setFormError(null); setWebUserModal({ mode:"add" }); }} disabled={!selCust} className="flex items-center gap-1 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase"><Plus size={9} /> Add</button>
                                    <button onClick={() => { if(!selWebUser) return; setWebUserForm({fname:t(selWebUser.fname),lname:t(selWebUser.lname),username:t(selWebUser.username),password:t(selWebUser.password),active:!!selWebUser.active,makeinvoice:!!selWebUser.makeinvoice,makeprebook:!!selWebUser.makeprebook,makecredit:!!selWebUser.makecredit,viewaccount:!!selWebUser.viewaccount,viewproducts:!!selWebUser.viewproducts,viewhistory:!!selWebUser.viewhistory,email:t(selWebUser.email),phone:t(selWebUser.phone)}); setFormError(null); setWebUserModal({ mode:"edit" }); }} disabled={!selWebUser} className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase"><Pencil size={9} /> Edit</button>
                                    <button onClick={() => { if(selWebUser) { setFormError(null); setWebUserModal({ mode:"delete" }); } }} disabled={!selWebUser} className="flex items-center gap-1 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase"><Trash2 size={9} /> Delete</button>
                                </div>
                            </div>
                            <div className="overflow-auto flex-1">
                                {(webUsers as any[]).length === 0 ? <div className="h-32 flex items-center justify-center text-gray-400 text-xs italic">{loadingWebUsers ? "Loading..." : "No web users"}</div> : (
                                    <table className="min-w-full text-xs">
                                        <thead className="bg-gray-100 border-b text-gray-700 font-bold sticky top-0 z-10">
                                            <tr>{["User","Login","Active","Invoices","Prebooks","Credits","Accounts","Products","History","Phone","Email"].map(h => <th key={h} className="p-2 border-r border-gray-200 last:border-r-0">{h}</th>)}</tr>
                                        </thead>
                                        <tbody>
                                            {(webUsers as any[]).map((u: any) => {
                                                const isSel = selWebUser?.unico === u.unico;
                                                const yn = (v: any) => v ? <Check size={10} className="text-green-500" /> : <span className="text-gray-200">—</span>;
                                                return (
                                                    <tr key={u.unico} onClick={() => setSelWebUser(u)} className={cn("border-b cursor-pointer", isSel ? "!bg-blue-100" : "odd:bg-white even:bg-gray-50 hover:bg-blue-50")}>
                                                        <td className="p-2 border-r border-gray-100 font-medium">{t(u.fullname)}</td>
                                                        <td className="p-2 border-r border-gray-100 font-mono text-[10px]">{t(u.username)}</td>
                                                        <td className="p-2 border-r border-gray-100 text-center">{yn(u.active)}</td>
                                                        <td className="p-2 border-r border-gray-100 text-center">{yn(u.makeinvoice)}</td>
                                                        <td className="p-2 border-r border-gray-100 text-center">{yn(u.makeprebook)}</td>
                                                        <td className="p-2 border-r border-gray-100 text-center">{yn(u.makecredit)}</td>
                                                        <td className="p-2 border-r border-gray-100 text-center">{yn(u.viewaccount)}</td>
                                                        <td className="p-2 border-r border-gray-100 text-center">{yn(u.viewproducts)}</td>
                                                        <td className="p-2 border-r border-gray-100 text-center">{yn(u.viewhistory)}</td>
                                                        <td className="p-2 border-r border-gray-100">{t(u.phone)}</td>
                                                        <td className="p-2 text-gray-400 truncate max-w-[140px]">{t(u.email)}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── MESSAGES TAB ─────────────────────────────────────── */}
                    {activeTab === "messages" && (
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
                            <div className="h-9 bg-[#374151] flex items-center justify-between px-3 shrink-0">
                                <div className="flex items-center gap-2"><MessageSquare size={13} className="text-[#FB7506]" /><span className="font-black text-[10px] uppercase tracking-widest text-white">Messages & Comments</span></div>
                                <button onClick={() => { setMsgForm({ comments:"", deadline:"", user_to:"" }); setFormError(null); setMsgModal(true); }} disabled={!selCust} className="flex items-center gap-1 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase"><Plus size={9} /> Add</button>
                            </div>
                            <div className="overflow-auto flex-1">
                                {(messages as any[]).length === 0 ? <div className="h-32 flex items-center justify-center text-gray-400 text-xs italic">{loadingMsgs ? "Loading..." : "No messages"}</div> : (
                                    <table className="min-w-full text-xs">
                                        <thead className="bg-gray-100 border-b text-gray-700 font-bold sticky top-0 z-10">
                                            <tr>{["Message","Date","Deadline","Taken By","To"].map(h => <th key={h} className="p-2 border-r border-gray-200 last:border-r-0">{h}</th>)}</tr>
                                        </thead>
                                        <tbody>
                                            {(messages as any[]).map((m: any, i: number) => (
                                                <tr key={m.unico||i} className="border-b odd:bg-white even:bg-gray-50">
                                                    <td className="p-2 border-r border-gray-100 truncate max-w-[300px]">{t(m.grid_message)}</td>
                                                    <td className="p-2 border-r border-gray-100 whitespace-nowrap">{formatDateEST(normalizeToISODate(m.add_date))}</td>
                                                    <td className="p-2 border-r border-gray-100 whitespace-nowrap">{formatDateEST(normalizeToISODate(m.deadline))}</td>
                                                    <td className="p-2 border-r border-gray-100">{t(m.taken_by)}</td>
                                                    <td className="p-2">{t(m.user_destination)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="h-8 bg-gray-100 border-t px-4 flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-tight shrink-0">
                <div className="flex gap-4"><span>Server: Production</span><span className="text-gray-300">|</span><span>Database: FullPot</span></div>
                <span className="text-[#FB7506]">FOS Masters V.2.0.1</span>
            </div>

            {/* ── CUSTOMER MODAL ─────────────────────────────────────────── */}
            {custModal && (
                custModal.mode === "delete" ? (
                    <ConfirmDlg title="Delete Customer" msg={`Delete "${t(selCust?.customer)}"? All ship-tos must be removed first.`}
                        error={formError} saving={saving} onConfirm={deleteCust} onCancel={() => { setCustModal(null); setFormError(null); }} />
                ) : (
                    <CustomerModal mode={custModal.mode} form={custForm} setForm={setCustForm} error={formError} saving={saving}
                        activeTab={custModalTab} setActiveTab={setCustModalTab}
                        lookups={lookups||{}} onSave={saveCust} onClose={() => { setCustModal(null); setFormError(null); }} />
                )
            )}

            {/* ── SHIP-TO MODAL ─────────────────────────────────────────── */}
            {shiptoModal && (
                shiptoModal.mode === "delete" ? (
                    <ConfirmDlg title="Delete Ship-to" msg={`Delete ship-to "${t(selShipto?.name)}"? All carriers must be removed first.`}
                        error={formError} saving={saving} onConfirm={saveShipto} onCancel={() => { setShiptoModal(null); setFormError(null); }} />
                ) : (
                    <ShiptoModal mode={shiptoModal.mode} form={shiptoForm} setForm={setShiptoForm} error={formError} saving={saving}
                        lookups={lookups||{}} onSave={saveShipto} onClose={() => { setShiptoModal(null); setFormError(null); }} />
                )
            )}

            {/* ── CARRIER MODAL ─────────────────────────────────────────── */}
            {carrierModal && (
                carrierModal.mode === "delete" ? (
                    <ConfirmDlg title="Delete Carrier" msg={`Delete carrier "${t(selCarrier?.carrier)}"?`}
                        error={formError} saving={saving} onConfirm={saveCarrier} onCancel={() => { setCarrierModal(null); setFormError(null); }} />
                ) : (
                    <CarrierModal mode={carrierModal.mode} form={carrierForm} setForm={setCarrierForm} error={formError} saving={saving}
                        carriers={lookups?.carriers||[]} onSave={saveCarrier} onClose={() => { setCarrierModal(null); setFormError(null); }} />
                )
            )}

            {/* ── WEB USER MODAL ────────────────────────────────────────── */}
            {webUserModal && (
                webUserModal.mode === "delete" ? (
                    <ConfirmDlg title="Delete Web User" msg={`Delete user "${t(selWebUser?.fullname)}"?`}
                        error={formError} saving={saving} onConfirm={saveWebUser} onCancel={() => { setWebUserModal(null); setFormError(null); }} />
                ) : (
                    <WebUserModal mode={webUserModal.mode} form={webUserForm} setForm={setWebUserForm} error={formError} saving={saving}
                        onSave={saveWebUser} onClose={() => { setWebUserModal(null); setFormError(null); }} />
                )
            )}

            {/* ── MESSAGE MODAL ─────────────────────────────────────────── */}
            {msgModal && (
                <MsgModal form={msgForm} setForm={setMsgForm} error={formError} saving={saving}
                    users={[]} onSave={saveMsg} onClose={() => { setMsgModal(false); setFormError(null); }} />
            )}
        </div>
    );
}

// ─── Customer Modal (3-tab form) ──────────────────────────────────────────────
function CustomerModal({ mode, form, setForm, error, saving, activeTab, setActiveTab, lookups, onSave, onClose }: any) {
    const F = (label: string, key: string, opts?: { type?: string; readonly?: boolean; options?: string[]; placeholder?: string }) => (
        <div className="flex flex-col gap-0.5">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
            {opts?.options ? (
                <select value={form[key]||""} onChange={e => setForm((p:any)=>({...p,[key]:e.target.value}))} className="fos-input text-xs py-1">
                    <option value="">—</option>
                    {opts.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
            ) : (
                <input type={opts?.type||"text"} value={form[key]??""} readOnly={!!opts?.readonly}
                    onChange={e => setForm((p:any)=>({...p,[key]:e.target.value}))}
                    placeholder={opts?.placeholder}
                    className={cn("fos-input text-xs py-1", opts?.readonly && "bg-gray-50 text-gray-500")} />
            )}
        </div>
    );
    const Cb = (label: string, key: string, disabled?: boolean) => (
        <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={!!form[key]} disabled={disabled}
                onChange={e => setForm((p:any)=>({...p,[key]:e.target.checked}))} className="w-3.5 h-3.5 accent-[#FB7506]" />
            <span className="text-[10px] font-semibold text-gray-600">{label}</span>
        </label>
    );
    const Sel = (label: string, key: string, items: any[], valKey: string, labelKey: string) => (
        <div className="flex flex-col gap-0.5">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
            <select value={form[key]||""} onChange={e => setForm((p:any)=>({...p,[key]:e.target.value}))} className="fos-input text-xs py-1">
                <option value="">— Select —</option>
                {(items||[]).map((it:any) => <option key={it[valKey]} value={it[valKey]}>{t(it[labelKey])}</option>)}
            </select>
        </div>
    );

    const calls = form.calls || "NNNNNN";
    const setCall = (i: number, v: string) => {
        const arr = (calls+"NNNNNN").split("").slice(0,6);
        arr[i] = v;
        setForm((p:any)=>({...p, calls: arr.join("")}));
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col">
                <div className="h-10 bg-[#374151] rounded-t-xl flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-2">
                        <Users size={14} className="text-[#FB7506]" />
                        <span className="font-black text-[11px] uppercase tracking-widest text-white">{mode==="add"?"New Customer":"Edit Customer"}</span>
                        {error && <span className="text-amber-400 text-[9px] font-bold ml-2 max-w-xs truncate">{error}</span>}
                    </div>
                    <button onClick={onClose}><XCircle size={16} className="text-gray-400 hover:text-white" /></button>
                </div>

                <div className="overflow-y-auto flex-1 p-4 space-y-4">
                    {/* Header row */}
                    <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 gap-3 pb-3 border-b border-gray-100">
                        {F("Customer Name *","customer")}
                        {F("DBA","dba")}
                        {F("Account No.","old_code",{type:"number"})}
                        {F("EDI Code","edi_code")}
                        {F("Contact","contact")}
                        {F("Purchaser","purchaser")}
                        <div className="flex flex-col gap-1.5 justify-end">
                            {Cb("FOB Miami","fobmiami")}
                            {Cb("Credit Hold","credithold")}
                            {Cb("Active","active", mode==="add")}
                            {Cb("Auto Charge","auto_charge")}
                            {Cb("Inventory","inventory_from_invoice")}
                            {Cb("Internal","internal_customer")}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 gap-0.5">
                        {(["general","financial","delivery"] as const).map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)}
                                className={cn("px-4 py-1.5 text-[10px] font-black uppercase tracking-wider transition-colors rounded-t",
                                    activeTab===tab ? "bg-[#FB7506] text-white" : "text-gray-400 hover:text-gray-700 hover:bg-gray-50")}>
                                {tab==="general"?"General":tab==="financial"?"Financial":"Delivery"}
                            </button>
                        ))}
                    </div>

                    {activeTab === "general" && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {F("Address 1 *","address1")} {F("Address 2","address2")} {F("City *","city")}
                            {F("State *","state",{placeholder:"FL"})} {F("Zip *","zip")} {F("Country *","country")}
                            {F("Phone 1 *","phone_1")} {F("Phone 2","phone_2")} {F("Fax 1 *","fax_1")}
                            {F("Fax 2","fax_2")} {F("Email","email")} {F("Website","website")}
                            {Sel("Salesman *","salesman_uq",lookups.salesmen||[],"unico","salesman_name")}
                            {Sel("Web Salesman","sales_web_uq",lookups.webSalesmen||[],"unico","salesman_name")}
                            {Sel("Group *","group_uq",lookups.groups||[],"unico","groupname")}
                            {Sel("Customer For *","rc_uq",lookups.companies||[],"unico","company")}
                            {Sel("Subregion","subregion_uq",lookups.subregions||[],"unico","subregion")}
                            {Sel("Terms *","terms_uq",lookups.terms||[],"unico","CONDITION")}
                            {F("Customer Since","custsince",{type:"date"})}
                            {F("Reason Hold","reasonhold")} {F("Pick Remark","pickremark")}
                            <div className="grid grid-cols-2 gap-2">
                                {F("Credit Limit","credit_limit",{type:"number"})} {F("GPM%","gpm",{type:"number"})}
                            </div>
                            {/* Calls (Mon-Sat) */}
                            <div className="col-span-2 sm:col-span-3 flex flex-col gap-1">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Call Days (Mon–Sat)</label>
                                <div className="flex gap-2">
                                    {["Mon","Tue","Wed","Thu","Fri","Sat"].map((day,i) => (
                                        <div key={day} className="flex flex-col items-center gap-0.5">
                                            <span className="text-[8px] text-gray-400 font-bold">{day}</span>
                                            <select value={calls[i]||"N"} onChange={e=>setCall(i,e.target.value)} className="fos-input text-xs py-0.5 w-10 text-center">
                                                {["N","Y","M","A","T"].map(o=><option key={o} value={o}>{o}</option>)}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "financial" && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {F("AP Contact","ap_contact")} {F("AP Email","ap_email")} {F("AP Phone","ap_phone")}
                            {F("AP Fax","ap_fax")} {F("AP MSN","ap_msn")} {F("Tax ID","tax_id")}
                            {F("CC Name","ccard_name")} {F("CC On File","ccard_on_file")}
                            {F("CC Exp Month","ccard_expiration_month")} {F("CC Exp Year","ccard_expiration_year")}
                            {F("Resale Tax","resale_tax",{type:"number"})} {F("Commission Days","commission_days",{type:"number"})}
                            {F("Ins. For","insurance_for",{type:"number"})} {F("Price Margin%","price_margin",{type:"number"})}
                            {F("Dry Discount%","dry_discount",{type:"number"})} {F("Extension","extension")}
                            <div className="flex flex-wrap gap-3 col-span-2 sm:col-span-3 pt-1">
                                {Cb("Statement Print","statement_print")} {Cb("Inspection","inspection")}
                                {Cb("International","international")} {Cb("Collection","collection")}
                                {Cb("Check Price Override","check_price_override")} {Cb("DEX","dex")}
                            </div>
                        </div>
                    )}

                    {activeTab === "delivery" && (
                        <div className="grid grid-cols-2 gap-3">
                            {F("Availability By","availability_by",{options:["NONE","EMAIL","FAX","PHONE"]})}
                            {F("Availability To (Email/Fax)","availability_to")}
                            {F("Invoice By","invoice_by",{options:["EMAIL","FAX","MAIL","NONE"]})}
                            {F("Fax 2","fax_2")}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 px-4 py-3 bg-gray-50 border-t rounded-b-xl shrink-0">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
                    <button onClick={onSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#FB7506] hover:bg-orange-600 disabled:opacity-40 text-white text-sm font-black uppercase tracking-wider transition-all">
                        {saving ? <RefreshCcw size={14} className="animate-spin" /> : <Save size={14} />}{saving ? "Saving..." : mode==="add"?"Create":"Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Ship-to Modal ─────────────────────────────────────────────────────────────
function ShiptoModal({ mode, form, setForm, error, saving, lookups, onSave, onClose }: any) {
    const F = (label: string, key: string, opts?: any) => (
        <div className="flex flex-col gap-0.5">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
            <input type={opts?.type||"text"} value={form[key]??""} onChange={e => setForm((p:any)=>({...p,[key]:e.target.value}))} className="fos-input text-xs py-1" />
        </div>
    );
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
                <div className="h-10 bg-[#374151] rounded-t-xl flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-2"><Truck size={14} className="text-[#FB7506]" /><span className="font-black text-[11px] uppercase tracking-widest text-white">{mode==="add"?"Add Ship-to":"Edit Ship-to"}</span>{error && <span className="text-amber-400 text-[9px] font-bold ml-2">{error}</span>}</div>
                    <button onClick={onClose}><XCircle size={16} className="text-gray-400 hover:text-white" /></button>
                </div>
                <div className="overflow-y-auto flex-1 p-4 grid grid-cols-2 gap-3 text-xs">
                    {F("Ship-to #","shipto",{type:"number"})} {F("Name","name")}
                    {F("Address 1","address1")} {F("Address 2","address2")}
                    {F("City","city")} {F("State","state")} {F("Zip","zip")} {F("Country","country")}
                    {F("Contact","contact")} {F("Phone","phone")} {F("Fax","fax")}
                    {F("Zone","zone")} {F("Region","region")} {F("District","district")}
                    <div className="flex flex-col gap-0.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">DC</label>
                        <select value={form.dc_uq||""} onChange={e=>setForm((p:any)=>({...p,dc_uq:e.target.value}))} className="fos-input text-xs py-1">
                            <option value="">— None —</option>
                            {(lookups.dcs||[]).map((d:any) => <option key={d.unico} value={d.unico}>{t(d.dcname)}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Route</label>
                        <select value={form.route_uq||""} onChange={e=>setForm((p:any)=>({...p,route_uq:e.target.value}))} className="fos-input text-xs py-1">
                            <option value="">— None —</option>
                            {(lookups.routes||[]).map((r:any) => <option key={r.unico} value={r.unico}>{t(r.route)}</option>)}
                        </select>
                    </div>
                    {F("Truck Days","truck_days",{type:"number"})} {F("EDI Code","edi_code")}
                    {F("GL Number","glnumber")} {F("DUNS","duns")} {F("Tax %","tax_percentage",{type:"number"})}
                    <label className="flex items-center gap-2 col-span-2 cursor-pointer">
                        <input type="checkbox" checked={!!form.hours24} onChange={e=>setForm((p:any)=>({...p,hours24:e.target.checked}))} className="w-4 h-4 accent-[#FB7506]" />
                        <span className="text-xs font-semibold">24-hour operation</span>
                    </label>
                </div>
                <div className="flex justify-end gap-3 px-4 py-3 bg-gray-50 border-t rounded-b-xl shrink-0">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
                    <button onClick={onSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#FB7506] hover:bg-orange-600 disabled:opacity-40 text-white text-sm font-black uppercase tracking-wider transition-all">
                        {saving ? <RefreshCcw size={14} className="animate-spin" /> : <Save size={14} />}{saving ? "..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Carrier Modal ────────────────────────────────────────────────────────────
function CarrierModal({ mode, form, setForm, error, saving, carriers, onSave, onClose }: any) {
    const DAYS = ["mon","tue","wed","thu","fri","sat","sun"];
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="h-10 bg-[#374151] rounded-t-xl flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-2"><Truck size={14} className="text-[#FB7506]" /><span className="font-black text-[11px] uppercase tracking-widest text-white">{mode==="add"?"Add Carrier":"Edit Carrier"}</span>{error && <span className="text-amber-400 text-[9px] font-bold ml-2">{error}</span>}</div>
                    <button onClick={onClose}><XCircle size={16} className="text-gray-400 hover:text-white" /></button>
                </div>
                <div className="p-4 space-y-3 text-xs">
                    <div className="flex flex-col gap-0.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Carrier</label>
                        <select value={form.carrier_uq||""} onChange={e=>setForm((p:any)=>({...p,carrier_uq:e.target.value}))} className="fos-input">
                            <option value="">— Select carrier —</option>
                            {(carriers||[]).map((c:any) => <option key={c.unico} value={c.unico}>{t(c.carrier)} ({t(c.carriercode)})</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-0.5"><label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Account</label><input value={form.account||""} onChange={e=>setForm((p:any)=>({...p,account:e.target.value}))} className="fos-input" /></div>
                        <div className="flex flex-col gap-0.5"><label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Zone</label><input value={form.zone||""} onChange={e=>setForm((p:any)=>({...p,zone:e.target.value}))} className="fos-input" /></div>
                    </div>
                    <div className="flex flex-wrap gap-3 pt-1">
                        {DAYS.map(d => (
                            <label key={d} className="flex items-center gap-1.5 cursor-pointer">
                                <input type="checkbox" checked={!!form[d]} onChange={e=>setForm((p:any)=>({...p,[d]:e.target.checked}))} className="w-3.5 h-3.5 accent-[#FB7506]" />
                                <span className="text-[10px] font-semibold uppercase">{d.charAt(0).toUpperCase()+d.slice(1)}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div className="flex justify-end gap-3 px-4 py-3 bg-gray-50 border-t rounded-b-xl">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
                    <button onClick={onSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#FB7506] hover:bg-orange-600 disabled:opacity-40 text-white text-sm font-black uppercase tracking-wider transition-all">
                        {saving ? <RefreshCcw size={14} className="animate-spin" /> : <Save size={14} />}{saving ? "..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Web User Modal ───────────────────────────────────────────────────────────
function WebUserModal({ mode, form, setForm, error, saving, onSave, onClose }: any) {
    const PERMS = [
        {key:"makeinvoice",label:"Make Invoice"},{key:"makeprebook",label:"Make Prebook"},
        {key:"makecredit",label:"Make Credit"},{key:"viewaccount",label:"View Account"},
        {key:"viewproducts",label:"View Products"},{key:"viewhistory",label:"View History"},
    ];
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="h-10 bg-[#374151] rounded-t-xl flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-2"><Users size={14} className="text-[#FB7506]" /><span className="font-black text-[11px] uppercase tracking-widest text-white">{mode==="add"?"Add Web User":"Edit Web User"}</span>{error && <span className="text-amber-400 text-[9px] font-bold ml-2">{error}</span>}</div>
                    <button onClick={onClose}><XCircle size={16} className="text-gray-400 hover:text-white" /></button>
                </div>
                <div className="p-4 space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                        {[{k:"fname",l:"First Name"},{k:"lname",l:"Last Name"},{k:"username",l:"Username"},{k:"password",l:"Password"},{k:"email",l:"Email"},{k:"phone",l:"Phone"}].map(f => (
                            <div key={f.k} className="flex flex-col gap-0.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{f.l}</label>
                                <input type={f.k==="password"?"password":"text"} value={form[f.k]||""} onChange={e=>setForm((p:any)=>({...p,[f.k]:e.target.value}))} className="fos-input" />
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-3 pt-1">
                        <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={!!form.active} onChange={e=>setForm((p:any)=>({...p,active:e.target.checked}))} className="w-3.5 h-3.5 accent-[#FB7506]" /><span className="text-[10px] font-semibold">Active</span></label>
                        {PERMS.map(p => (
                            <label key={p.key} className="flex items-center gap-1.5 cursor-pointer">
                                <input type="checkbox" checked={!!form[p.key]} onChange={e=>setForm((pv:any)=>({...pv,[p.key]:e.target.checked}))} className="w-3.5 h-3.5 accent-[#FB7506]" />
                                <span className="text-[10px] font-semibold">{p.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div className="flex justify-end gap-3 px-4 py-3 bg-gray-50 border-t rounded-b-xl">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
                    <button onClick={onSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#FB7506] hover:bg-orange-600 disabled:opacity-40 text-white text-sm font-black uppercase tracking-wider transition-all">
                        {saving ? <RefreshCcw size={14} className="animate-spin" /> : <Save size={14} />}{saving ? "..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Message Modal ────────────────────────────────────────────────────────────
function MsgModal({ form, setForm, error, saving, users, onSave, onClose }: any) {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="h-10 bg-[#374151] rounded-t-xl flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-2"><MessageSquare size={14} className="text-[#FB7506]" /><span className="font-black text-[11px] uppercase tracking-widest text-white">Add Comment</span>{error && <span className="text-amber-400 text-[9px] font-bold ml-2">{error}</span>}</div>
                    <button onClick={onClose}><XCircle size={16} className="text-gray-400 hover:text-white" /></button>
                </div>
                <div className="p-4 space-y-3 text-xs">
                    <div className="flex flex-col gap-0.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Comment *</label>
                        <textarea value={form.comments} onChange={e=>setForm((p:any)=>({...p,comments:e.target.value}))} rows={4} className="fos-input resize-none" placeholder="Enter comment or message..." />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-0.5">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Deadline</label>
                            <input type="date" value={form.deadline} onChange={e=>setForm((p:any)=>({...p,deadline:e.target.value}))} className="fos-input" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">User To</label>
                            <input value={form.user_to} onChange={e=>setForm((p:any)=>({...p,user_to:e.target.value}))} className="fos-input" placeholder="Username" />
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-3 px-4 py-3 bg-gray-50 border-t rounded-b-xl">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
                    <button onClick={onSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#FB7506] hover:bg-orange-600 disabled:opacity-40 text-white text-sm font-black uppercase tracking-wider transition-all">
                        {saving ? <RefreshCcw size={14} className="animate-spin" /> : <Save size={14} />}{saving ? "..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Confirm Delete Dialog ────────────────────────────────────────────────────
function ConfirmDlg({ title, msg, onConfirm, onCancel, saving, error }: any) {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
                <div className="p-6 flex flex-col items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center"><Trash2 size={24} className="text-red-600" /></div>
                    <div className="text-center">
                        <h3 className="font-black text-gray-900 text-base mb-1">{title}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">{msg}</p>
                        {error && <p className="text-xs text-red-500 mt-2 font-bold">{error}</p>}
                    </div>
                </div>
                <div className="flex border-t border-gray-100">
                    <button onClick={onCancel} className="flex-1 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 border-r border-gray-100">Cancel</button>
                    <button onClick={onConfirm} disabled={saving} className="flex-1 py-3 text-sm font-black text-red-600 hover:bg-red-50 disabled:opacity-50">{saving ? "..." : "Delete"}</button>
                </div>
            </div>
        </div>
    );
}
