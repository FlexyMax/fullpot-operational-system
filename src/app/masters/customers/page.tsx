"use client";

import { useEffect, useState, useMemo, useRef, useCallback, Fragment } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Search, Plus, Minus, Pencil, Trash2, Save, X, RefreshCcw,
    Download, Users, Truck, FileText, MessageSquare, Check,
    AlertCircle, Copy, Star, XCircle
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { useAuditLog } from "@/lib/audit";
import { usePagePermissions, PERMISSION_MSGS } from "@/lib/permissions";
import { AuditLogModal } from "@/components/AuditLogModal";
import { cn } from "@/lib/utils";
import { GridMenu } from "@/components/GridMenu";
import { useCustomersStore } from "@/store/useCustomersStore";
import PanelGrid from "@/components/ui/PanelGrid";
import { PanelGridTable, PanelGridThead, PanelGridTh, PanelGridTbody, PanelGridTr, PanelGridTd } from "@/components/ui/PanelGridTable";
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
    const { status } = useSession();
    const router = useRouter();
    const qc = useQueryClient();
    const { logAction } = useAuditLog("customers-setup", "flower_customers");
    const perms = usePagePermissions("customers-setup");

    // ── Customer list state (infinite scroll) ────────────────────────────────
    const [custList,       setCustList]       = useState<any[]>([]);
    const [custPage,       setCustPage]       = useState(1);
    const [hasMoreCusts,   setHasMoreCusts]   = useState(true);
    const [loadingList,    setLoadingList]    = useState(false);
    const [loadingMore,    setLoadingMore]    = useState(false);
    const [totalRecords,   setTotalRecords]   = useState(0);
    const custGridRef = useRef<HTMLDivElement>(null);

    const {
        search, setSearch, selCust, setSelCust, selShipto, setSelShipto,
        selCarrier, setSelCarrier, selWebUser, setSelWebUser, selMessage, setSelMessage,
        activeExpTab, setActiveExpTab, custModal, setCustModal, shiptoModal, setShiptoModal,
        carrierModal, setCarrierModal, webUserModal, setWebUserModal, msgModal, setMsgModal,
        stmtModal, setStmtModal, custModalTab, setCustModalTab, expandedCustUnico, setExpandedCustUnico,
        expandedShiptoUnico, setExpandedShiptoUnico
    } = useCustomersStore();
    
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
        enabled:  !!selCust?.unico && expandedCustUnico !== null && activeExpTab === "webusers",
    });

    const { data: messages = [], isFetching: loadingMsgs, refetch: refetchMsgs } = useQuery({
        queryKey: ["cust-msgs", selCust?.unico],
        queryFn:  () => apiFetch(`/api/masters/customers/${selCust.unico}/messages`),
        enabled:  !!selCust?.unico && expandedCustUnico !== null && activeExpTab === "messages",
    });

    const { data: lookups } = useQuery({
        queryKey: ["cust-lookups"],
        queryFn:  () => apiFetch("/api/masters/customers/lookups"),
        staleTime: 1000 * 60 * 10,
    });

    useEffect(() => {
        if (!custModal || custModal.mode === "add" || !selCust) return;
        const c = selCust;
        let updates: any = {};
        
        if (!custForm.salesman_uq && c.salesman && lookups?.webSalesmen?.length) {
            const m = lookups.webSalesmen.find((s:any) => String(s.salesman||"").trim() === String(c.salesman||"").trim());
            if (m && String(m.unico) !== String(custForm.salesman_uq)) updates.salesman_uq = String(m.unico);
        }
        if (!custForm.terms_uq && c.terms && lookups?.terms?.length) {
            const m = lookups.terms.find((tt:any) => String(tt.CONDITION||"").trim() === String(c.terms||"").trim());
            if (m && String(m.UNICO) !== String(custForm.terms_uq)) updates.terms_uq = String(m.UNICO);
        }
        if (!custForm.rc_uq && c.company && lookups?.companies?.length) {
            const m = lookups.companies.find((comp:any) => String(comp.company||"").trim() === String(c.company||"").trim());
            if (m && String(m.unico) !== String(custForm.rc_uq)) updates.rc_uq = String(m.unico);
        }
        
        if (Object.keys(updates).length > 0) {
            setCustForm((p:any) => ({...p, ...updates}));
        }
    }, [custModal, selCust, lookups, custForm.salesman_uq, custForm.terms_uq, custForm.rc_uq]);

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

    const selectCustomer = (c: any) => { setSelCust(c); setSelShipto(null); setSelCarrier(null); setSelWebUser(null); setFormError(null); setExpandedShiptoUnico(null); setActiveExpTab("shipto"); };

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
            logAction(custModal?.mode === "add" ? "Insert" : "Edit", unico!);
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
            logAction("Delete", selCust.unico);
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
                logAction("Insert", data.unico || selCust.unico, "ShipTo");
            } else if (shiptoModal?.mode === "edit") {
                const res  = await fetch(`/api/masters/customers/shipto/${selShipto.unico}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(shiptoForm) });
                const data = await res.json(); if (!data.success) throw new Error(data.error);
                logAction("Edit", selShipto.unico, "ShipTo");
            } else {
                const res  = await fetch(`/api/masters/customers/shipto/${selShipto.unico}`, { method:"DELETE" });
                const data = await res.json(); if (!data.success) throw new Error(data.error);
                logAction("Delete", selShipto.unico, "ShipTo");
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
                logAction("Insert", data.unico || selCust.unico, "Carrier");
            } else if (carrierModal?.mode === "edit") {
                const res  = await fetch(`/api/masters/customers/carrier/${selCarrier.unico}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({...carrierForm, shipto_uq: selShipto?.unico||""}) });
                const data = await res.json(); if (!data.success) throw new Error(data.error);
                logAction("Edit", selCarrier.unico, "Carrier");
            } else {
                const res  = await fetch(`/api/masters/customers/carrier/${selCarrier.unico}`, { method:"DELETE" });
                const data = await res.json(); if (!data.success) throw new Error(data.error);
                logAction("Delete", selCarrier.unico, "Carrier");
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
            logAction("Edit", selCarrier.unico, "Default Carrier");
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
                logAction("Insert", data.unico || selCust.unico, "WebUser");
            } else if (webUserModal?.mode === "edit") {
                const res  = await fetch(`/api/masters/customers/web-user/${selWebUser.unico}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(webUserForm) });
                const data = await res.json(); if (!data.success) throw new Error(data.error);
                logAction("Edit", selWebUser.unico, "WebUser");
            } else {
                const res  = await fetch(`/api/masters/customers/web-user/${selWebUser.unico}`, { method:"DELETE" });
                const data = await res.json(); if (!data.success) throw new Error(data.error);
                logAction("Delete", selWebUser.unico, "WebUser");
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
            logAction("Insert", data.unico || selCust.unico, "Message");
            await refetchMsgs(); setMsgModal(false); setMsgForm({ comments:"", deadline:"", user_to:"" });
        } catch (e: any) { setFormError(e.message); }
        finally { setSaving(false); }
    };

    const copyFromBilling = async () => {
        try {
            const res  = await fetch(`/api/masters/customers/${selCust.unico}/shipto-copy`, { method:"POST" });
            const data = await res.json(); if (!data.success) throw new Error(data.error);
            logAction("Insert", selCust.unico, "Copy Bill To ShipTo");
            await refetchShiptos();
        } catch (e: any) { setFormError(e.message); }
    };

    if (status === "loading") return null;

    return (
        <div className="flex flex-col h-[100dvh] bg-[#f4f6f8] overflow-hidden font-sans text-[#333]">

            <AppHeader title="Customers" />

            {/* Search toolbar */}
            <div className="bg-white border-b border-gray-200 px-3 py-2 flex items-center gap-2 shrink-0 shadow-sm flex-wrap">
                <div className="relative">
                    <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && refetchList()}
                        placeholder="Search customers..." className="pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded outline-none focus:ring-1 focus:ring-[#FB7506] w-80" />
                </div>
                {formError && <span className="text-amber-600 text-[10px] font-bold flex items-center gap-1 ml-2"><AlertCircle size={11} />{formError}</span>}
            </div>

            {/* Customer Grid — PanelGrid */}
            <PanelGrid
                title="Customers"
                icon={Users}
                recordCount={`${custList.length} / ${totalRecords > 0 ? totalRecords : custList.length}`}
                onRefresh={refetchList}
                refreshing={loadingList}
                headerRight={
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => { setStmtEnabled(false); setStmtModal(true); }}
                            disabled={!selCust}
                            className={cn(
                                "flex items-center gap-1.5 px-2 py-1 text-xs font-bold transition-all rounded",
                                selCust ? "text-gray-300 hover:text-white hover:bg-white/10" : "text-gray-500 opacity-40 cursor-not-allowed"
                            )}
                            title="View Statement"
                        >
                            <FileText size={14} /> Statement
                        </button>
                        <AuditLogModal recordId={selCust?.unico} disabled={!selCust?.unico} bareButton />
                    </div>
                }
                menuItems={[
                    { label: "Add Customer", icon: Plus, color: "green", onClick: () => { setCustForm({...EMPTY_CUST}); setFormError(null); setCustModalTab("general"); setCustModal({ mode:"add" }); }, disabled: !perms.canCreate },
                    { label: "Edit Customer", icon: Pencil, color: "orange", onClick: async () => { 
                        if (!selCust) return; 
                        let c = selCust; 
                        
                        try {
                            const res = await fetch(`/api/masters/customers/${c.unico}`);
                            if (res.ok) {
                                const details = await res.json();
                                if (details && typeof details === 'object') {
                                    c = { ...c, ...details };
                                }
                            }
                        } catch(e) {}
                        
                        let s_uq = "";
                        if (c.salesman_uq && String(c.salesman_uq)!=="0") s_uq = String(c.salesman_uq).trim();
                        else if (c.saleman_uq && String(c.saleman_uq)!=="0") s_uq = String(c.saleman_uq).trim();
                        else if (c.salesman_name) s_uq = lookups?.salesmen?.find((s:any) => String(s.salesman_name||"").trim() === String(c.salesman_name||"").trim())?.unico || "";

                        let t_uq = "";
                        if (c.terms_uq && String(c.terms_uq)!=="0") t_uq = String(c.terms_uq).trim();
                        else if (c.terms && String(c.terms)!=="0") {
                            if (lookups?.terms?.some((tt:any) => String(tt.UNICO).trim() === String(c.terms).trim())) {
                                t_uq = String(c.terms).trim();
                            } else {
                                t_uq = lookups?.terms?.find((tt:any) => String(tt.CONDITION||"").trim() === String(c.terms||"").trim())?.UNICO || "";
                            }
                        }

                        let r_uq = "";
                        if (c.rc_uq && String(c.rc_uq)!=="0") r_uq = String(c.rc_uq).trim();
                        else if (c.company) r_uq = lookups?.companies?.find((comp:any) => String(comp.company||"").trim() === String(c.company||"").trim())?.unico || "";
                        
                        
                        const isYes = (v: any) => String(v||"").trim().toLowerCase() === "yes" || v === true || v === 1;
                        
                        setCustForm({ old_code:c.old_code||"", edi_code:t(c.edi_code), fobmiami:isYes(c.fobmiami), inventory_from_invoice:isYes(c.inventory_from_invoice), dex:isYes(c.dex), auto_charge:isYes(c.auto_charge), credithold:isYes(c.credithold), internal_customer:isYes(c.internal_customer), active:isYes(c.active), customer:t(c.customer), dba:t(c.dba), contact:t(c.contact), purchaser:t(c.purchaser), address1:t(c.address1), address2:t(c.address2), city:t(c.city), state:t(c.state), zip:t(c.zip), country:t(c.country), phone_1:t(c.phone_1), phone_2:t(c.phone_2), fax_1:t(c.fax_1), fax_2:t(c.fax_2), email:t(c.email), terms_uq:t_uq, calls:t(c.calls)||"NNNNNN", subregion_uq:t(c.subregion_uq), salesman_uq:s_uq, group_uq:t(c.group_uq), rc_uq:r_uq, pickremark:t(c.pickremark), julian_from:t(c.julian_from), reasonhold:t(c.reasonhold), credit_limit:c.credit_limit||0, insurance_for:c.insurance_for||0, price_margin:c.price_margin||0, dry_discount:c.dry_discount||0, sales_web_uq:t(c.sales_web_uq), custsince:c.custsince?normalizeToISODate(c.custsince):"", ap_contact:t(c.ap_contact), ap_email:t(c.ap_email), ap_msn:t(c.ap_msn), ap_phone:t(c.ap_phone), ap_fax:t(c.ap_fax), website:t(c.website), statement_print:isYes(c.statement_print), inspection:isYes(c.inspection), gpm:c.gpm||0, availability_by:t(c.availability_by)||"NONE", availability_to:t(c.availability_to), invoice_by:t(c.invoice_by)||"EMAIL", extension:c.extension||0, commission_days:c.commission_days||0, resale_tax:c.resale_tax||0, ccard_name:t(c.ccard_name), ccard_on_file:t(c.ccard_on_file), ccard_expiration_month:t(c.ccard_expiration_month), ccard_expiration_year:t(c.ccard_expiration_year), tax_id:t(c.tax_id), international:isYes(c.international), collection:isYes(c.collection), check_price_override:isYes(c.check_price_override) }); 
                        setFormError(null); 
                        setCustModalTab("general"); 
                        setCustModal({ mode:"edit" }); 
                    }, disabled: !selCust || !perms.canEdit },
                    { label: "Delete Customer", icon: Trash2, color: "orange", onClick: () => { if (selCust) { setFormError(null); setCustModal({ mode:"delete" }); } }, disabled: !selCust || !perms.canDelete },
                    { separator: true },
                    { label: "Export CSV", icon: Download, color: "gray", onClick: exportCSV, disabled: !perms.canReport },
                ]}
                className="mx-2 mt-2 mb-3 flex-1 flex flex-col min-h-0"
                onScroll={handleCustScroll}
            >
                <div>
                    <PanelGridTable>
                        <PanelGridThead>
                            <PanelGridTh className="w-6">{""}</PanelGridTh>
                            <PanelGridTh>Code</PanelGridTh>
                            <PanelGridTh>Customer</PanelGridTh>
                            <PanelGridTh align="center">Active</PanelGridTh>
                            <PanelGridTh align="center">Hold</PanelGridTh>
                            <PanelGridTh>Salesman</PanelGridTh>
                            <PanelGridTh className="hidden md:table-cell">Address</PanelGridTh>
                            <PanelGridTh className="hidden md:table-cell">City</PanelGridTh>
                            <PanelGridTh className="hidden lg:table-cell">State</PanelGridTh>
                            <PanelGridTh className="hidden lg:table-cell">Country</PanelGridTh>
                            <PanelGridTh className="hidden xl:table-cell">Phone</PanelGridTh>
                            <PanelGridTh className="hidden xl:table-cell">Fax</PanelGridTh>
                            <PanelGridTh className="hidden xl:table-cell">Email</PanelGridTh>
                            <PanelGridTh className="hidden xl:table-cell">Contact</PanelGridTh>
                            <PanelGridTh className="hidden xl:table-cell">Group</PanelGridTh>
                            <PanelGridTh className="hidden xl:table-cell">Since</PanelGridTh>
                            <PanelGridTh>Terms</PanelGridTh>
                        </PanelGridThead>
                        <PanelGridTbody>
                            {custList.map((c: any) => {
                                const isSel = selCust?.unico === c.unico;
                                const isExp = expandedCustUnico === c.unico;
                                return (
                                    <Fragment key={c.unico}>
                                        <PanelGridTr selected={isSel} onClick={() => selectCustomer(c)}>
                                            <PanelGridTd className="w-6 pl-1 pr-0">
                                                <button onClick={e => { e.stopPropagation(); if (isExp) { setExpandedCustUnico(null); } else { selectCustomer(c); setExpandedCustUnico(c.unico); } }}
                                                    className="p-0.5 rounded hover:bg-gray-200 transition-colors">
                                                    {isExp ? <Minus size={11} className="text-[#FB7506]" /> : <Plus size={11} className="text-gray-400" />}
                                                </button>
                                            </PanelGridTd>
                                            <PanelGridTd className="font-mono text-[10px]">{t(c.old_code)}</PanelGridTd>
                                            <PanelGridTd className="font-semibold max-w-[180px] truncate">{t(c.customer)}</PanelGridTd>
                                            <PanelGridTd align="center">{(String(c.active||"").trim().toLowerCase() === "yes" || c.active === true || c.active === 1) ? <Check size={10} className="text-green-500 mx-auto" /> : <X size={10} className="text-gray-300 mx-auto" />}</PanelGridTd>
                                            <PanelGridTd align="center">{(String(c.credithold||"").trim().toLowerCase() === "yes" || c.credithold === true || c.credithold === 1) ? <span className="text-red-500 font-black text-[9px]">HOLD</span> : "\u2014"}</PanelGridTd>
                                            <PanelGridTd className="max-w-[120px] truncate text-gray-500">{t(c.salesman_name)}</PanelGridTd>
                                            <PanelGridTd className="hidden md:table-cell max-w-[140px] truncate">{t(c.address1)}</PanelGridTd>
                                            <PanelGridTd className="hidden md:table-cell">{t(c.city)}</PanelGridTd>
                                            <PanelGridTd className="hidden lg:table-cell">{t(c.state)}</PanelGridTd>
                                            <PanelGridTd className="hidden lg:table-cell">{t(c.country)}</PanelGridTd>
                                            <PanelGridTd className="hidden xl:table-cell whitespace-nowrap">{t(c.phone_1)}</PanelGridTd>
                                            <PanelGridTd className="hidden xl:table-cell whitespace-nowrap text-gray-400">{t(c.fax_1)}</PanelGridTd>
                                            <PanelGridTd className="hidden xl:table-cell max-w-[140px] truncate text-gray-400">{t(c.email)}</PanelGridTd>
                                            <PanelGridTd className="hidden xl:table-cell max-w-[100px] truncate">{t(c.contact)}</PanelGridTd>
                                            <PanelGridTd className="hidden xl:table-cell text-gray-400">{t(c.groupname)}</PanelGridTd>
                                            <PanelGridTd className="hidden xl:table-cell whitespace-nowrap text-gray-400">{t(c.custsince)?.split("T")[0]}</PanelGridTd>
                                            <PanelGridTd className="text-gray-400 whitespace-nowrap">{t(c.terms)}</PanelGridTd>
                                        </PanelGridTr>
                                        {isExp && (
                                            <tr>
                                                <td colSpan={17} className="p-0 border-b border-gray-200">
                                                    <div className="bg-gray-50">
                                                        {/* ── Tab bar ── */}
                                                        <div className="flex items-end px-4 pt-1.5 gap-1 border-b border-gray-200">
                                                            {([
                                                                { id:"shipto",    label:"Ship-to",   icon:Truck },
                                                                { id:"webusers",  label:"Web Users", icon:Users },
                                                                { id:"messages",  label:"Messages",  icon:MessageSquare },
                                                            ] as const).map(tab => (
                                                                <button key={tab.id} onClick={e => { e.stopPropagation(); setActiveExpTab(tab.id); }}
                                                                    className={cn("flex items-center gap-1.5 px-3 h-7 text-[10px] font-black uppercase tracking-wider transition-all border-b-2",
                                                                        activeExpTab === tab.id ? "border-[#FB7506] text-[#FB7506]" : "border-transparent text-gray-400 hover:text-gray-600")}>
                                                                    <tab.icon size={10} />{tab.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                        {/* ── Ship-to tab ── */}
                                                        {activeExpTab === "shipto" && (
                                                            <div className="pl-4 pr-2 py-2 flex flex-col gap-2">
                                                                <PanelGrid
                                                                    title="Ship-to Addresses"
                                                                    icon={Truck}
                                                                    recordCount={(shiptos as any[]).length}
                                                                    onRefresh={() => { if (selCust) refetchShiptos(); }}
                                                                    refreshing={loadingShiptos}
                                                                    headerRight={<AuditLogModal recordId={selShipto?.unico} disabled={!selShipto?.unico} bareButton />}
                                                                    menuItems={[
                                                                        { label: "Add Address", icon: Plus, color: "green", onClick: () => { setShiptoForm({...EMPTY_SHIPTO}); setFormError(null); setShiptoModal({ mode:"add" }); }, disabled: !selCust || !perms.canCreate },
                                                                        { label: "Edit Address", icon: Pencil, color: "orange", onClick: () => { if(!selShipto) return; setShiptoForm({...selShipto, dc_uq:t(selShipto.dc_uq), route_uq:t(selShipto.route_uq)}); setFormError(null); setShiptoModal({ mode:"edit" }); }, disabled: !selShipto || !perms.canEdit },
                                                                        { label: "Delete Address", icon: Trash2, color: "orange", onClick: () => { if(selShipto) { setFormError(null); setShiptoModal({ mode:"delete" }); } }, disabled: !selShipto || !perms.canDelete },
                                                                        { separator: true },
                                                                        { label: "Copy from Billing", icon: Copy, color: "gray", onClick: copyFromBilling, disabled: !selCust },
                                                                    ]}
                                                                >
                                                                    <PanelGridTable>
                                                                        <PanelGridThead>
                                                                            <PanelGridTh className="w-6">{""}</PanelGridTh>
                                                                            <PanelGridTh>#</PanelGridTh>
                                                                            <PanelGridTh>Name</PanelGridTh>
                                                                            <PanelGridTh className="hidden sm:table-cell">Address</PanelGridTh>
                                                                            <PanelGridTh>City</PanelGridTh>
                                                                            <PanelGridTh className="hidden md:table-cell">State</PanelGridTh>
                                                                            <PanelGridTh className="hidden md:table-cell">Zip</PanelGridTh>
                                                                            <PanelGridTh className="hidden lg:table-cell">Country</PanelGridTh>
                                                                            <PanelGridTh className="hidden lg:table-cell">Contact</PanelGridTh>
                                                                            <PanelGridTh className="hidden xl:table-cell">Phone</PanelGridTh>
                                                                            <PanelGridTh>Zone</PanelGridTh>
                                                                            <PanelGridTh className="hidden sm:table-cell">Route</PanelGridTh>
                                                                            <PanelGridTh align="center">24h</PanelGridTh>
                                                                            <PanelGridTh align="center">Truck</PanelGridTh>
                                                                        </PanelGridThead>
                                                                        <PanelGridTbody>
                                                                            {(shiptos as any[]).length === 0
                                                                                ? <tr><td colSpan={14} className="p-6 text-center text-gray-300 text-xs">{loadingShiptos ? "Loading..." : "No ship-to addresses"}</td></tr>
                                                                                : (shiptos as any[]).map((s: any) => {
                                                                                    const isShiptoSel = selShipto?.unico === s.unico;
                                                                                    const isShiptoExp = expandedShiptoUnico === s.unico;
                                                                                    return (
                                                                                        <Fragment key={s.unico}>
                                                                                            <PanelGridTr selected={isShiptoSel} onClick={() => setSelShipto(s)}>
                                                                                                <PanelGridTd className="w-6 pl-1 pr-0">
                                                                                                    <button onClick={e => { e.stopPropagation(); if (isShiptoExp) { setExpandedShiptoUnico(null); } else { setSelShipto(s); setExpandedShiptoUnico(s.unico); } }}
                                                                                                        className="p-0.5 rounded hover:bg-gray-200 transition-colors">
                                                                                                        {isShiptoExp ? <Minus size={11} className="text-[#FB7506]" /> : <Plus size={11} className="text-gray-400" />}
                                                                                                    </button>
                                                                                                </PanelGridTd>
                                                                                                <PanelGridTd className="font-mono">{s.shipto}</PanelGridTd>
                                                                                                <PanelGridTd className="font-medium max-w-[140px] truncate">{t(s.name)}</PanelGridTd>
                                                                                                <PanelGridTd className="hidden sm:table-cell max-w-[140px] truncate">{t(s.address1)}</PanelGridTd>
                                                                                                <PanelGridTd>{t(s.city)}</PanelGridTd>
                                                                                                <PanelGridTd className="hidden md:table-cell">{t(s.state)}</PanelGridTd>
                                                                                                <PanelGridTd className="hidden md:table-cell">{t(s.zip)}</PanelGridTd>
                                                                                                <PanelGridTd className="hidden lg:table-cell">{t(s.country)}</PanelGridTd>
                                                                                                <PanelGridTd className="hidden lg:table-cell max-w-[100px] truncate">{t(s.contact)}</PanelGridTd>
                                                                                                <PanelGridTd className="hidden xl:table-cell whitespace-nowrap">{t(s.phone)}</PanelGridTd>
                                                                                                <PanelGridTd>{t(s.zone)}</PanelGridTd>
                                                                                                <PanelGridTd className="hidden sm:table-cell">{t(s.route)}</PanelGridTd>
                                                                                                <PanelGridTd align="center">{s.hours24 ? <Check size={10} className="text-green-500 mx-auto" /> : "—"}</PanelGridTd>
                                                                                                <PanelGridTd align="center">{s.truck_days||0}</PanelGridTd>
                                                                                            </PanelGridTr>
                                                                                            {isShiptoExp && (
                                                                                                <tr>
                                                                                                    <td colSpan={14} className="p-0 border-b border-gray-200">
                                                                                                        <div className="pl-6 pr-2 py-2 bg-gray-100">
                                                                                                            <PanelGrid
                                                                                                                title="Carriers by Ship-to"
                                                                                                                icon={Truck}
                                                                                                                recordCount={(carriers as any[]).length}
                                                                                                                headerRight={<AuditLogModal recordId={selCarrier?.unico} disabled={!selCarrier?.unico} bareButton />}
                                                                                                                menuItems={[
                                                                                                                    { label: "Add Carrier", icon: Plus, color: "green", onClick: () => { setCarrierForm({...EMPTY_CARRIER}); setFormError(null); setCarrierModal({ mode:"add" }); }, disabled: !selCust || !perms.canCreate },
                                                                                                                    { label: "Edit Carrier", icon: Pencil, color: "orange", onClick: () => { if(!selCarrier) return; setCarrierForm({carrier_uq:t(selCarrier.carrier_uq), account:t(selCarrier.account), zone:t(selCarrier.zone), mon:!!selCarrier.mon, tue:!!selCarrier.tue, wed:!!selCarrier.wed, thu:!!selCarrier.thu, fri:!!selCarrier.fri, sat:!!selCarrier.sat, sun:!!selCarrier.sun}); setFormError(null); setCarrierModal({ mode:"edit" }); }, disabled: !selCarrier || !perms.canEdit },
                                                                                                                    { label: "Delete Carrier", icon: Trash2, color: "orange", onClick: () => { if(selCarrier) { setFormError(null); setCarrierModal({ mode:"delete" }); } }, disabled: !selCarrier || !perms.canDelete },
                                                                                                                    { separator: true },
                                                                                                                    { label: "Set Default", icon: Star, color: "gray", onClick: setDefaultCarrier, disabled: !selCarrier },
                                                                                                                ]}
                                                                                                            >
                                                                                                                <PanelGridTable>
                                                                                                                    <PanelGridThead>
                                                                                                                        <PanelGridTh>Carrier</PanelGridTh>
                                                                                                                        <PanelGridTh>Account</PanelGridTh>
                                                                                                                        <PanelGridTh className="hidden sm:table-cell">Ship-to</PanelGridTh>
                                                                                                                        <PanelGridTh align="center">Zone</PanelGridTh>
                                                                                                                        <PanelGridTh align="center">Default</PanelGridTh>
                                                                                                                        <PanelGridTh align="center">Mon</PanelGridTh>
                                                                                                                        <PanelGridTh align="center">Tue</PanelGridTh>
                                                                                                                        <PanelGridTh align="center">Wed</PanelGridTh>
                                                                                                                        <PanelGridTh align="center">Thu</PanelGridTh>
                                                                                                                        <PanelGridTh align="center">Fri</PanelGridTh>
                                                                                                                        <PanelGridTh align="center">Sat</PanelGridTh>
                                                                                                                        <PanelGridTh align="center">Sun</PanelGridTh>
                                                                                                                    </PanelGridThead>
                                                                                                                    <PanelGridTbody>
                                                                                                                        {(carriers as any[]).length === 0
                                                                                                                            ? <tr><td colSpan={12} className="p-6 text-center text-gray-300 text-xs">{loadingCarriers ? "Loading..." : "No carriers"}</td></tr>
                                                                                                                            : (carriers as any[]).map((car: any) => {
                                                                                                                                const isCarSel = selCarrier?.unico === car.unico;
                                                                                                                                return (
                                                                                                                                    <PanelGridTr key={car.unico} selected={isCarSel} onClick={() => setSelCarrier(car)}>
                                                                                                                                        <PanelGridTd className="font-medium">{t(car.carrier)}</PanelGridTd>
                                                                                                                                        <PanelGridTd>{t(car.account)}</PanelGridTd>
                                                                                                                                        <PanelGridTd className="hidden sm:table-cell max-w-[100px] truncate">{t(car.ship_name)}</PanelGridTd>
                                                                                                                                        <PanelGridTd align="center">{t(car.zone)}</PanelGridTd>
                                                                                                                                        {["defa_carrier","mon","tue","wed","thu","fri","sat","sun"].map(d => (
                                                                                                                                            <PanelGridTd key={d} align="center">
                                                                                                                                                {car[d] ? <Check size={10} className={d==="defa_carrier"?"text-amber-500 mx-auto":"text-green-500 mx-auto"} /> : <span className="text-gray-200">{"—"}</span>}
                                                                                                                                            </PanelGridTd>
                                                                                                                                        ))}
                                                                                                                                    </PanelGridTr>
                                                                                                                                );
                                                                                                                            })
                                                                                                                        }
                                                                                                                    </PanelGridTbody>
                                                                                                                </PanelGridTable>
                                                                                                            </PanelGrid>
                                                                                                        </div>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            )}
                                                                                        </Fragment>
                                                                                    );
                                                                                })
                                                                            }
                                                                        </PanelGridTbody>
                                                                    </PanelGridTable>
                                                                </PanelGrid>
                                                            </div>
                                                        )}

                                                        {/* ── Web Users tab ── */}
                                                        {activeExpTab === "webusers" && (
                                                            <div className="px-4 py-2 flex flex-col gap-2">
                                                                <PanelGrid
                                                                    title="Web Users / Portal"
                                                                    icon={Users}
                                                                    recordCount={(webUsers as any[]).length}
                                                                    headerRight={<AuditLogModal recordId={selWebUser?.unico} disabled={!selWebUser?.unico} bareButton />}
                                                                    menuItems={[
                                                                        { label: "Add User", icon: Plus, color: "green", onClick: () => { setWebUserForm({...EMPTY_WEBUSER}); setFormError(null); setWebUserModal({ mode:"add" }); }, disabled: !selCust || !perms.canCreate },
                                                                        { label: "Edit User", icon: Pencil, color: "orange", onClick: () => { if(!selWebUser) return; setWebUserForm({fname:t(selWebUser.fname),lname:t(selWebUser.lname),username:t(selWebUser.username),password:t(selWebUser.password),active:!!selWebUser.active,makeinvoice:!!selWebUser.makeinvoice,makeprebook:!!selWebUser.makeprebook,makecredit:!!selWebUser.makecredit,viewaccount:!!selWebUser.viewaccount,viewproducts:!!selWebUser.viewproducts,viewhistory:!!selWebUser.viewhistory,email:t(selWebUser.email),phone:t(selWebUser.phone)}); setFormError(null); setWebUserModal({ mode:"edit" }); }, disabled: !selWebUser || !perms.canEdit },
                                                                        { label: "Delete User", icon: Trash2, color: "orange", onClick: () => { if(selWebUser) { setFormError(null); setWebUserModal({ mode:"delete" }); } }, disabled: !selWebUser || !perms.canDelete },
                                                                    ]}
                                                                >
                                                                    <div className="overflow-auto">
                                                                        {(webUsers as any[]).length === 0 ? <div className="h-32 flex items-center justify-center text-gray-400 text-xs italic">{loadingWebUsers ? "Loading..." : "No web users"}</div> : (
                                                                            <PanelGridTable>
                                                                                <PanelGridThead>
                                                                                    <PanelGridTh>User</PanelGridTh>
                                                                                    <PanelGridTh>Login</PanelGridTh>
                                                                                    <PanelGridTh align="center">Active</PanelGridTh>
                                                                                    <PanelGridTh align="center">Invoices</PanelGridTh>
                                                                                    <PanelGridTh align="center">Prebooks</PanelGridTh>
                                                                                    <PanelGridTh align="center">Credits</PanelGridTh>
                                                                                    <PanelGridTh align="center">Accounts</PanelGridTh>
                                                                                    <PanelGridTh align="center">Products</PanelGridTh>
                                                                                    <PanelGridTh align="center">History</PanelGridTh>
                                                                                    <PanelGridTh className="hidden md:table-cell">Phone</PanelGridTh>
                                                                                    <PanelGridTh className="hidden md:table-cell">Email</PanelGridTh>
                                                                                </PanelGridThead>
                                                                                <PanelGridTbody>
                                                                                    {(webUsers as any[]).map((u: any) => {
                                                                                        const isSel = selWebUser?.unico === u.unico;
                                                                                        const yn = (v: any) => v ? <Check size={10} className="text-green-500" /> : <span className="text-gray-200">{"—"}</span>;
                                                                                        return (
                                                                                            <PanelGridTr key={u.unico} selected={isSel} onClick={() => setSelWebUser(u)}>
                                                                                                <PanelGridTd className="font-medium">{t(u.fullname)}</PanelGridTd>
                                                                                                <PanelGridTd className="font-mono text-[10px]">{t(u.username)}</PanelGridTd>
                                                                                                <PanelGridTd align="center">{yn(u.active)}</PanelGridTd>
                                                                                                <PanelGridTd align="center">{yn(u.makeinvoice)}</PanelGridTd>
                                                                                                <PanelGridTd align="center">{yn(u.makeprebook)}</PanelGridTd>
                                                                                                <PanelGridTd align="center">{yn(u.makecredit)}</PanelGridTd>
                                                                                                <PanelGridTd align="center">{yn(u.viewaccount)}</PanelGridTd>
                                                                                                <PanelGridTd align="center">{yn(u.viewproducts)}</PanelGridTd>
                                                                                                <PanelGridTd align="center">{yn(u.viewhistory)}</PanelGridTd>
                                                                                                <PanelGridTd className="hidden md:table-cell">{t(u.phone)}</PanelGridTd>
                                                                                                <PanelGridTd className="hidden md:table-cell text-gray-400 truncate max-w-[140px]">{t(u.email)}</PanelGridTd>
                                                                                            </PanelGridTr>
                                                                                        );
                                                                                    })}
                                                                                </PanelGridTbody>
                                                                            </PanelGridTable>
                                                                        )}
                                                                    </div>
                                                                </PanelGrid>
                                                            </div>
                                                        )}
                                                        {/* ── Messages tab ── */}
                                                        {activeExpTab === "messages" && (
                                                            <div className="px-4 py-2 flex flex-col gap-2">
                                                                <PanelGrid
                                                                    title="Messages & Comments"
                                                                    icon={MessageSquare}
                                                                    recordCount={(messages as any[]).length}
                                                                    headerRight={<AuditLogModal recordId={selMessage?.unico} disabled={!selMessage?.unico} bareButton />}
                                                                    menuItems={[
                                                                        { label: "Add Message", icon: Plus, color: "green", onClick: () => { setMsgForm({ comments:"", deadline:"", user_to:"" }); setFormError(null); setMsgModal(true); }, disabled: !selCust || !perms.canCreate },
                                                                    ]}
                                                                >
                                                                    <div className="overflow-auto">
                                                                        {(messages as any[]).length === 0 ? <div className="h-32 flex items-center justify-center text-gray-400 text-xs italic">{loadingMsgs ? "Loading..." : "No messages"}</div> : (
                                                                            <PanelGridTable>
                                                                                <PanelGridThead>
                                                                                    <PanelGridTh>Message</PanelGridTh>
                                                                                    <PanelGridTh>Date</PanelGridTh>
                                                                                    <PanelGridTh>Deadline</PanelGridTh>
                                                                                    <PanelGridTh>Taken By</PanelGridTh>
                                                                                    <PanelGridTh>To</PanelGridTh>
                                                                                </PanelGridThead>
                                                                                <PanelGridTbody>
                                                                                    {(messages as any[]).map((m: any, i: number) => {
                                                                                        const isSel = selMessage?.unico === m.unico;
                                                                                        return (
                                                                                            <PanelGridTr key={m.unico||i} selected={isSel} onClick={() => setSelMessage(m)}>
                                                                                                <PanelGridTd className="truncate max-w-[300px]">{t(m.grid_message)}</PanelGridTd>
                                                                                                <PanelGridTd className="whitespace-nowrap text-gray-500">{formatDateEST(normalizeToISODate(m.add_date))}</PanelGridTd>
                                                                                                <PanelGridTd className="whitespace-nowrap text-gray-500">{formatDateEST(normalizeToISODate(m.deadline))}</PanelGridTd>
                                                                                                <PanelGridTd>{t(m.taken_by)}</PanelGridTd>
                                                                                                <PanelGridTd>{t(m.user_destination)}</PanelGridTd>
                                                                                            </PanelGridTr>
                                                                                        );
                                                                                    })}
                                                                                </PanelGridTbody>
                                                                            </PanelGridTable>
                                                                        )}
                                                                    </div>
                                                                </PanelGrid>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                );
                            })}
                        </PanelGridTbody>
                    </PanelGridTable>
                </div>
            </PanelGrid>


            {/* ─── Mobile Action Bar (Bottom) ────────────────────────────────────────────── */}
            <div className={cn(
                "md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-in-out pb-4 pt-2 px-2",
                selCust ? "translate-y-0" : "translate-y-full"
            )}>
                <div className="flex items-center gap-1 overflow-x-auto px-4 scrollbar-none">
                    <button onClick={() => { if(selCust) { setCustForm({...selCust, creditlimit:selCust.creditlimit||0}); setFormError(null); setCustModal({mode:"edit"}); } }} disabled={!perms.canEdit || !selCust}
                        className="flex flex-col items-center gap-1 text-gray-600 disabled:opacity-50 transition-colors hover:text-[#FB7506] min-w-[56px] shrink-0">
                        <Pencil size={20} className={perms.canEdit ? "text-[#FB7506]" : "text-gray-400"} />
                        <span className="text-[9px] font-black uppercase tracking-wider">Edit</span>
                    </button>

                    <div className="w-px h-8 bg-gray-200 shrink-0 mx-2" />

                    <button onClick={() => { if (selCust && expandedCustUnico === selCust.unico) { setExpandedCustUnico(null); } else if(selCust) { setExpandedCustUnico(selCust.unico); } }} 
                        className="flex flex-col items-center gap-1 text-gray-600 transition-colors hover:text-blue-500 min-w-[56px] shrink-0">
                        {selCust && expandedCustUnico === selCust.unico ? <Minus size={20} className="text-blue-500" /> : <Plus size={20} className="text-blue-500" />}
                        <span className="text-[9px] font-black uppercase tracking-wider">{selCust && expandedCustUnico === selCust.unico ? "Collapse" : "Expand"}</span>
                    </button>

                    <button onClick={() => { setStmtEnabled(true); setStmtModal(true); const d = new Date(); d.setDate(d.getDate() - 30); setStmtFrom(normalizeToISODate(d)); setStmtTo(todayEST()); }} disabled={!perms.canReport}
                        className="flex flex-col items-center gap-1 text-gray-600 disabled:opacity-50 transition-colors hover:text-blue-500 min-w-[56px] shrink-0">
                        <FileText size={20} className={perms.canReport ? "text-blue-500" : "text-gray-400"} />
                        <span className="text-[9px] font-black uppercase tracking-wider">Stmt</span>
                    </button>

                    <div className="w-px h-8 bg-gray-200 shrink-0 mx-2" />

                    <button onClick={() => { setFormError(null); setCustModal({mode:"delete"}); }} disabled={!perms.canDelete}
                        className="flex flex-col items-center gap-1 text-gray-600 disabled:opacity-50 transition-colors hover:text-red-600 min-w-[56px] shrink-0">
                        <Trash2 size={20} className={perms.canDelete ? "text-red-500" : "text-gray-400"} />
                        <span className="text-[9px] font-black uppercase tracking-wider">Delete</span>
                    </button>
                    
                    <button onClick={() => { setSelCust(null); setExpandedCustUnico(null); }}
                        className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-800 transition-colors min-w-[56px] shrink-0 pr-2">
                        <X size={20} />
                        <span className="text-[9px] font-black uppercase tracking-wider">Close</span>
                    </button>
                </div>
            </div>

            {/* ─── Mobile FAB (Add) ──────────────────────────────────────────────────────── */}
            <div className={cn("md:hidden fixed bottom-6 right-6 z-40 transition-all duration-300", selCust ? "opacity-0 translate-y-8 pointer-events-none" : "opacity-100 translate-y-0")}>
                {perms.canCreate && (
                    <button onClick={() => { setCustForm({...EMPTY_CUST, terms:"2"}); setFormError(null); setCustModal({mode:"add"}); }}
                        className="bg-[#01b763] hover:bg-[#01a056] text-white w-14 h-14 rounded-full shadow-[0_4px_12px_rgba(1,183,99,0.4)] flex items-center justify-center transition-transform transform active:scale-95">
                        <Plus size={28} />
                    </button>
                )}
            </div>

            <AppFooter areaLabel="Masters" />

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
            {/* ── STATEMENT MODAL ───────────────────────────────────────── */}
            {stmtModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="h-12 bg-[#374151] flex items-center justify-between pl-4 pr-3 shrink-0">
                            <div className="flex items-center gap-2 min-w-0">
                                <FileText size={18} className="text-[#FB7506]" />
                                <span className="font-black text-xs uppercase tracking-widest text-white truncate">
                                    Statement — {t(selCust?.customer)}
                                </span>
                                {loadingStmt && <RefreshCcw size={14} className="text-gray-400 animate-spin ml-2" />}
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <input type="date" value={stmtFrom} onChange={e => setStmtFrom(e.target.value)} className="bg-gray-700 border-none outline-none text-white text-xs rounded px-2 h-7" />
                                    <span className="text-gray-400 text-[10px] font-bold uppercase">to</span>
                                    <input type="date" value={stmtTo} onChange={e => setStmtTo(e.target.value)} className="bg-gray-700 border-none outline-none text-white text-xs rounded px-2 h-7" />
                                    <button onClick={() => { setStmtEnabled(true); refetchStmt(); }} className="h-7 px-3 bg-[#FB7506] hover:bg-orange-600 text-white rounded text-xs font-bold transition-colors">Load</button>
                                </div>
                                <button onClick={() => setStmtModal(false)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="overflow-auto flex-1 bg-white">
                            {!stmtEnabled ? <div className="h-40 flex items-center justify-center text-gray-400 text-sm font-bold uppercase">Select date range and click Load</div>
                            : (statement as any[]).length === 0 ? <div className="h-40 flex items-center justify-center text-gray-400 text-sm italic">{loadingStmt ? "Loading..." : "No statement records"}</div>
                            : (
                                <PanelGridTable>
                                    <PanelGridThead>
                                        <PanelGridTh>Type</PanelGridTh>
                                        <PanelGridTh>Doc No.</PanelGridTh>
                                        <PanelGridTh>Date</PanelGridTh>
                                        <PanelGridTh>Due Date</PanelGridTh>
                                        <PanelGridTh align="right">Amount</PanelGridTh>
                                        <PanelGridTh align="right">Payments</PanelGridTh>
                                        <PanelGridTh align="right">Debits</PanelGridTh>
                                        <PanelGridTh align="right">Credits</PanelGridTh>
                                        <PanelGridTh align="right">Balance</PanelGridTh>
                                    </PanelGridThead>
                                    <PanelGridTbody>
                                        {(statement as any[]).map((row: any, i: number) => (
                                            <PanelGridTr key={i}>
                                                <PanelGridTd className="font-medium">{t(row.type)}</PanelGridTd>
                                                <PanelGridTd className="font-mono">{t(row.invoice_no)}</PanelGridTd>
                                                <PanelGridTd className="whitespace-nowrap text-gray-500">{formatDateEST(normalizeToISODate(row.fecha||row.date))}</PanelGridTd>
                                                <PanelGridTd className="whitespace-nowrap text-gray-500">{formatDateEST(normalizeToISODate(row.due_date))}</PanelGridTd>
                                                <PanelGridTd align="right" className="text-blue-700">{formatMoney(row.ammount)}</PanelGridTd>
                                                <PanelGridTd align="right" className="text-green-600">{formatMoney(row.payments)}</PanelGridTd>
                                                <PanelGridTd align="right" className="text-red-500">{formatMoney(row.debits)}</PanelGridTd>
                                                <PanelGridTd align="right" className="text-blue-600">{formatMoney(row.credits)}</PanelGridTd>
                                                <PanelGridTd align="right" className="font-semibold text-[#FB7506]">{formatMoney(row.balance)}</PanelGridTd>
                                            </PanelGridTr>
                                        ))}
                                    </PanelGridTbody>
                                </PanelGridTable>
                            )}
                        </div>
                    </div>
                </div>
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
            <select value={String(form[key]||"")} onChange={e => setForm((p:any)=>({...p,[key]:e.target.value}))} className="fos-input text-xs py-1">
                <option value="">— Select —</option>
                {(items||[]).map((it:any) => <option key={it[valKey]} value={String(it[valKey])}>{t(it[labelKey])}</option>)}
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
                    <div className="flex flex-col gap-3 pb-3 border-b border-gray-100">
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-12 sm:col-span-5">
                                {F("Customer Name *","customer")}
                            </div>
                            <div className="col-span-12 sm:col-span-3">
                                {F("DBA","dba")}
                            </div>
                            <div className="col-span-6 sm:col-span-2">
                                {F("Account No.","old_code",{type:"number"})}
                            </div>
                            <div className="col-span-6 sm:col-span-2">
                                {F("EDI Code","edi_code")}
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="grid grid-cols-1 gap-3">
                                {F("Contact","contact")}
                                {F("Purchaser","purchaser")}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 pb-1.5 justify-end">
                                {Cb("FOB Miami","fobmiami")}
                                {Cb("Credit Hold","credithold")}
                                {Cb("Active","active", mode==="add")}
                                {Cb("Auto Charge","auto_charge")}
                                {Cb("Inventory","inventory_from_invoice")}
                                {Cb("Internal","internal_customer")}
                            </div>
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
                        <div className="flex flex-col gap-3">
                            <div className="grid grid-cols-1 gap-3">
                                {F("Address 1 *","address1")} {F("Address 2","address2")}
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {F("City *","city")} {F("State *","state",{placeholder:"FL"})} {F("Zip *","zip")} {F("Country *","country")}
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {F("Phone 1 *","phone_1")} {F("Phone 2","phone_2")} {F("Fax 1 *","fax_1")} {F("Fax 2","fax_2")}
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                {F("Email","email")} {F("Website","website")}
                            </div>
                            <div className="grid grid-cols-1">
                                {F("Pick Remark","pickremark")}
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {Sel("Salesman *","salesman_uq",lookups.salesmen||[],"unico","salesman_name")}
                                {Sel("Web Salesman","sales_web_uq",lookups.webSalesmen||[],"unico","salesman_name")}
                                {Sel("Group *","group_uq",lookups.groups||[],"unico","groupname")}
                                {Sel("Customer For *","rc_uq",lookups.companies||[],"unico","company")}
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {Sel("Subregion","subregion_uq",lookups.subregions||[],"unico","subregion")}
                                {Sel("Terms *","terms_uq",lookups.terms||[],"UNICO","CONDITION")}
                                {F("Customer Since","custsince",{type:"date"})}
                                {F("Reason Hold","reasonhold")}
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
                                {F("Credit Limit","credit_limit",{type:"number"})} {F("GPM%","gpm",{type:"number"})}
                                {/* Calls (Mon-Sat) */}
                                <div className="col-span-2 flex flex-col gap-1 pl-2">
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
                        </div>
                    )}

                    {activeTab === "financial" && (
                        <div className="flex flex-col gap-3">
                            <div className="grid grid-cols-1 gap-3">
                                {F("AP Contact","ap_contact")} {F("AP Email","ap_email")}
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {F("AP Phone","ap_phone")} {F("AP Fax","ap_fax")} {F("AP MSN","ap_msn")} {F("Tax ID","tax_id")}
                                {F("CC Name","ccard_name")} {F("CC On File","ccard_on_file")} {F("CC Exp Month","ccard_expiration_month")} {F("CC Exp Year","ccard_expiration_year")}
                                {F("Resale Tax","resale_tax",{type:"number"})} {F("Commission Days","commission_days",{type:"number"})} {F("Ins. For","insurance_for",{type:"number"})} {F("Price Margin%","price_margin",{type:"number"})}
                                {F("Dry Discount%","dry_discount",{type:"number"})} {F("Extension","extension")}
                            </div>
                            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 pb-1 border-t border-gray-100">
                                {Cb("Statement Print","statement_print")} {Cb("Inspection","inspection")}
                                {Cb("International","international")} {Cb("Collection","collection")}
                                {Cb("Check Price Override","check_price_override")} {Cb("DEX","dex")}
                            </div>
                        </div>
                    )}

                    {activeTab === "delivery" && (
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-4 sm:col-span-3">
                                {F("Availability By","availability_by",{options:["NONE","EMAIL","FAX","PHONE"]})}
                            </div>
                            <div className="col-span-8 sm:col-span-9">
                                {F("Availability To (Email/Fax)","availability_to")}
                            </div>
                            <div className="col-span-4 sm:col-span-3">
                                {F("Invoice By","invoice_by",{options:["EMAIL","FAX","MAIL","NONE"]})}
                            </div>
                            <div className="col-span-8 sm:col-span-9">
                                {F("Fax 2","fax_2")}
                            </div>
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
