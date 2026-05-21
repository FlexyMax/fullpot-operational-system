"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    Search,
    ShoppingCart,
    Store,
    ShoppingBag,
    Package,
    ClipboardList,
    LayoutGrid,
    Plus,
    Trash2,
    CreditCard,
    ArrowLeft,
    Box,
    Users,
    ArrowRight,
    Database,
    History,
    DollarSign,
    Pencil,
    XCircle,
    MoreVertical,
    List,
    RefreshCcw,
    FileText,
    Check,
    Calendar,
    Unlock,
    Lock,
    Menu,
    PlusCircle,
    ArrowDownUp
} from "lucide-react";
import { usePOSStore } from "@/store/usePOSStore";
import { cn } from "@/lib/utils";
import { useAuditLog } from "@/lib/audit";
import "./sales.css";

export default function SalesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { logAction } = useAuditLog("sales", "flower_invoice");
    const {
        cart,
        activeInvoice,
        addToCart,
        removeFromCart,
        updateQuantity,
        setActiveInvoice
    } = usePOSStore();

    // States
    const [activeTab, setActiveTab] = useState<'sales' | 'terminal' | 'inventory' | 'history' | 'po_history'>('sales');

    // Tab Definitions
    const tabs = [
        { id: 'sales', label: 'Sales Center', icon: LayoutGrid },
        { id: 'terminal', label: 'Invoice', icon: Store },
        { id: 'inventory', label: 'Available Stock', icon: Database },
        { id: 'history', label: 'Invoice History', icon: History },
        { id: 'po_history', label: 'PO History', icon: ClipboardList }
    ];

    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [products, setProducts] = useState<any[]>([]);
    const [stockPage, setStockPage] = useState(1);
    const [hasMoreStock, setHasMoreStock] = useState(true);
    const [customers, setCustomers] = useState<any[]>([]);
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

    // Sales Center States
    const [salesDates, setSalesDates] = useState<any[]>([]);
    const [salesByRep, setSalesByRep] = useState<any[]>([]);
    const [ordersList, setOrdersList] = useState<any[]>([]);

    const [selectedSalesDate, setSelectedSalesDate] = useState<string | null>(null);
    const [selectedSalesRep, setSelectedSalesRep] = useState<any | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
    const [loadingSalesCenter, setLoadingSalesCenter] = useState(false);

    // Invoice History States
    const [invoiceHistory, setInvoiceHistory] = useState<any[]>([]);
    const [historyFilters, setHistoryFilters] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        customer_uq: '%'
    });
    const [selectedHistoryInvoice, setSelectedHistoryInvoice] = useState<any | null>(null);
    const [historyDetailTab, setHistoryDetailTab] = useState('details'); // details, credits, returns, statement
    const [selectedHistoryDetailItem, setSelectedHistoryDetailItem] = useState<any | null>(null);
    const [historyDetails, setHistoryDetails] = useState<any[]>([]);
    const [historyCredits, setHistoryCredits] = useState<any[]>([]);
    const [historyReturns, setHistoryReturns] = useState<any[]>([]);
    const [historyStatement, setHistoryStatement] = useState<any | null>(null);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [isHistoryCustomerModalOpen, setIsHistoryCustomerModalOpen] = useState(false);
    const [selectedHistoryCustomer, setSelectedHistoryCustomer] = useState<any | null>(null);
    const [historyCustomers, setHistoryCustomers] = useState<any[]>([]);
    const [historyCustomerPage, setHistoryCustomerPage] = useState(1);
    const [historyCustomerHasMore, setHistoryCustomerHasMore] = useState(true);
    const [historyCustomerSearch, setHistoryCustomerSearch] = useState('');
    const [historyCustomerTotal, setHistoryCustomerTotal] = useState(0);

    // Auth & Basic Protection
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        if (status === "authenticated") {
            fetchStock(1, "");
            fetchSalesDates();
        }
    }, [status]);

    useEffect(() => {
        if (activeTab === 'inventory' && products.length === 0) {
            fetchStock(1, "");
        }
    }, [activeTab]);

    // Sales Center Fetches
    const fetchSalesDates = async () => {
        try {
            const res = await fetch(`/api/sales/dates?year=${new Date().getFullYear()}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setSalesDates(data);

                // Auto select today or nearest date
                if (data.length > 0) {
                    const todayStr = new Date().toISOString().split('T')[0];
                    const exactMatch = data.find(d => String(d.ship_date).includes(todayStr));
                    const selected = exactMatch ? todayStr : data[0].ship_date.split('T')[0];
                    handleSelectSalesDate(selected);
                }
            }
        } catch (error) {
            console.error("Error fetching sales dates:", error);
        }
    };

    const handleSelectSalesDate = async (dateStr: string) => {
        setSelectedSalesDate(dateStr);
        setSelectedSalesRep(null);
        setOrdersList([]);
        setLoadingSalesCenter(true);
        try {
            const res = await fetch(`/api/sales/reps?date=${dateStr}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setSalesByRep(data);
                if (data.length > 0) {
                    handleSelectSalesRep(data[0], dateStr);
                }
            }
        } catch (error) {
            console.error("Error fetching sales by rep:", error);
        } finally {
            setLoadingSalesCenter(false);
        }
    };

    const handleSelectSalesRep = async (rep: any, dateOverride?: string) => {
        setSelectedSalesRep(rep);
        setOrdersList([]);
        setLoadingSalesCenter(true);
        try {
            const dateToUse = dateOverride || selectedSalesDate;
            if (!dateToUse) return;
            const res = await fetch(`/api/sales/orders?date=${dateToUse}&sales_rep_uq=${rep.sales_cus_uq || '%'}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setOrdersList(data);
            }
        } catch (error) {
            console.error("Error fetching orders list:", error);
        } finally {
            setLoadingSalesCenter(false);
        }
    };

    const fetchStock = async (page: number = 1, query: string = "") => {
        if (page === 1) {
            setLoading(true);
            setProducts([]);
        }
        try {
            const res = await fetch(`/api/sales/stock?search=${query}&page=${page}&pageSize=50`);
            const data = await res.json();
            if (data.success) {
                const newItems = data.stock || [];
                if (page === 1) {
                    setProducts(newItems);
                } else {
                    setProducts(prev => [...prev, ...newItems]);
                }
                setHasMoreStock(newItems.length === 50);
                setStockPage(page);
            } else {
                if (page === 1) setProducts([]);
                setHasMoreStock(false);
            }
        } catch (err) {
            console.error("Error fetching stock:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleStockScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 100 && !loading && hasMoreStock) {
            fetchStock(stockPage + 1, searchTerm);
        }
    };

    const searchCustomers = async (query: string) => {
        if (query.length < 2) {
            setCustomers([]);
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`/api/customers/search?search=${query}`);
            const data = await res.json();
            if (data.success) setCustomers(data.customers || []);
        } catch (err) {
            console.error("Failed to fetch customers", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchInvoiceHistory = async () => {
        if (!selectedHistoryCustomer) {
            setInvoiceHistory([]);
            return;
        }
        setLoadingHistory(true);
        try {
            const startStr = new Date(historyFilters.startDate).toISOString();
            const endStr = new Date(historyFilters.endDate).toISOString();
            const cust = selectedHistoryCustomer?.unico || historyFilters.customer_uq;
            const res = await fetch(`/api/pos/history/invoices?customer_uq=${cust}&start_date=${startStr}&end_date=${endStr}`);
            const data = await res.json();
            setInvoiceHistory(data || []);
        } catch (err) {
            console.error('Error fetching invoice history:', err);
        } finally {
            setLoadingHistory(false);
        }
    };

    const fetchHistorySubData = async () => {
        if (!selectedHistoryInvoice) return;
        const invUq = selectedHistoryInvoice.unico;
        try {
            if (historyDetailTab === 'details') {
                const res = await fetch(`/api/pos/history/details?invoice_uq=${invUq}`);
                const data = await res.json();
                setHistoryDetails(data || []);
            } else if (historyDetailTab === 'credits') {
                const res = await fetch(`/api/pos/history/credits?invoice_uq=${invUq}`);
                const data = await res.json();
                setHistoryCredits(data || []);
            } else if (historyDetailTab === 'returns') {
                const res = await fetch(`/api/pos/history/returns?invoice_uq=${invUq}`);
                const data = await res.json();
                setHistoryReturns(data || []);
            } else if (historyDetailTab === 'statement') {
                const res = await fetch(`/api/pos/history/statement?customer_uq=${selectedHistoryInvoice.customer_uq}`);
                const data = await res.json();
                setHistoryStatement(data || null);
            }
        } catch (err) {
            console.error(`Error fetching history sub-data (${historyDetailTab}):`, err);
        }
    };

    useEffect(() => {
        if (selectedHistoryInvoice) {
            fetchHistorySubData();
        }
    }, [selectedHistoryInvoice, historyDetailTab]);

    const fetchHistoryCustomers = async (page = 1, isLoadMore = false, searchTerm = historyCustomerSearch) => {
        if (!isLoadMore) setLoadingCustomers(true);
        try {
            const res = await fetch(`/api/customers/search?search=${searchTerm}&page=${page}`);
            const data = await res.json();
            const newData = data.success ? data.customers : [];

            if (newData.length > 0 && newData[0].TotalRows !== undefined) {
                setHistoryCustomerTotal(newData[0].TotalRows);
            } else if (!isLoadMore) {
                setHistoryCustomerTotal(0);
            }

            if (isLoadMore) {
                setHistoryCustomers(prev => [...prev, ...newData]);
            } else {
                setHistoryCustomers(newData);
            }
            setHistoryCustomerHasMore(newData.length === 50);
            setHistoryCustomerPage(page);
        } catch (err) {
            console.error('Error fetching history customers:', err);
        } finally {
            setLoadingCustomers(false);
        }
    };

    const [loadingCustomers, setLoadingCustomers] = useState(false);

    const handleMenuAction = (action: string, invoice: any) => {
        console.log("Action: ", action, invoice);
    };

    const parseMoney = (val: any) => {
        if (!val) return 0;
        if (typeof val === 'number') return val;
        return parseFloat(String(val).replace(/[$,]/g, '')) || 0;
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        try {
            return dateStr.split('T')[0];
        } catch {
            return dateStr;
        }
    };

    const handleOpenInvoice = async (customer: any) => {
        setLoading(true);
        try {
            const res = await fetch("/api/sales/invoice/open", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customer_uq: customer.unico,
                    ship_date: new Date().toISOString().split('T')[0]
                }),
            });
            const data = await res.json();
            if (data.success) {
                logAction("Insert", data.invoice.unico, "Open Invoice");
                setActiveInvoice({
                    id: data.invoice.unico,
                    customerName: customer.name,
                    date: new Date().toISOString()
                });
                setIsCustomerModalOpen(false);
                fetchStock(1, "");
            } else {
                console.error(data.message || "Failed to open invoice");
            }
        } catch (err) {
            console.error("Server connection failed", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = async (product: any) => {
        if (!activeInvoice) {
            setIsCustomerModalOpen(true);
            return;
        }

        try {
            const res = await fetch("/api/sales/cart/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    invoice_uq: activeInvoice.id,
                    product_uq: product.product_uq,
                    stock_uq: product.unico,
                    box_qty: 1,
                    price: product.price
                }),
            });
            const data = await res.json();
            if (data.success) {
                addToCart({
                    id: data.line?.unico || product.unico,
                    name: product.name || product.product_name,
                    price: product.price,
                    quantity: 1
                });
            }
        } catch (err) {
            console.error("Add item failed:", err);
        }
    };

    if (status === "loading") return null;

    return (
        <div className="flex flex-col h-screen bg-[#fcfcfc] overflow-hidden font-sans text-[#333]">
            {/* Top Toolbar (Original POS Style) */}
            <div className="h-12 bg-[#374151] flex items-center justify-between px-4 shrink-0 text-white">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/menu')}
                        className="hover:bg-white/10 p-1.5 rounded transition-colors"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="font-black text-xs uppercase tracking-widest text-[#FB7506]">FOS</span>
                        <div className="w-px h-4 bg-white/20 mx-2" />
                        <span className="font-bold text-xs uppercase tracking-tight">Sales & Billing Terminal</span>
                    </div>
                </div>

                <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400">Terminal:</span>
                        <span>{session?.user?.name || "REPRESENTATIVE"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400">Status:</span>
                        <span className="text-green-500 font-black">Online</span>
                    </div>
                </div>
            </div>

            {/* Global Navigation Tabs (Flexymax Style) */}
            <div className="flex bg-white h-12 shadow-sm shrink-0 mt-0 overflow-x-auto whitespace-nowrap border-b relative">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-6 h-full font-bold text-[11px] tracking-[0.1em] transition-all border-b-2 ${isActive
                                ? 'border-[#FB7506] text-[#FB7506] bg-orange-50/50'
                                : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                                }`}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? 'text-[#FB7506]' : 'text-gray-400'}`} />
                            {tab.label.toUpperCase()}
                        </button>
                    );
                })}
                <div className="ml-auto flex items-center pr-4">
                    <button className="flex items-center gap-2 text-[#FB7506] font-bold text-[11px] uppercase tracking-[0.1em] hover:text-orange-600 transition-colors">
                        <LayoutGrid className="w-4 h-4" />
                        Main Menu
                    </button>
                </div>
            </div>

            {/* Main Layout Grid */}
            <div className="flex-1 flex flex-col p-2 gap-2 overflow-hidden bg-[#f4f6f8]">

                {activeTab === 'sales' && (
                    <div className="flex flex-row gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full overflow-hidden">

                        {/* LEFT: SELECT YEAR / DATES (30% Width) */}
                        <div className="w-[30%] flex flex-col gap-2 min-h-0">
                            <div className="pos-grid-container flex flex-col flex-1 shadow-sm border-gray-300">
                                <div className="pos-grid-header h-10 bg-[#374151]">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-[#FB7506]" />
                                        <span className="font-black text-[11px] uppercase tracking-widest text-white">SELECT YEAR</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <select className="bg-gray-700 text-white text-[9px] uppercase font-bold border-none outline-none rounded px-1.5 py-0.5" defaultValue="2026">
                                            <option value="2026">2026</option>
                                            <option value="2025">2025</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="bg-[#F0F2F5] flex justify-end px-2 py-0.5 text-[9px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-200">
                                    {salesDates.length} Records
                                </div>
                                <div className="pos-table-container custom-scrollbar overflow-y-auto">
                                    <table className="pos-table min-w-full">
                                        <thead>
                                            <tr>
                                                <th className="w-[60%]">DATE</th>
                                                <th className="text-center">INVOICE</th>
                                                <th className="text-center leading-none flex-col flex h-full justify-center">
                                                    <span>TOTAL</span>
                                                    <span>BOXES</span>
                                                </th>
                                                <th className="text-right pr-2">T.SOLD</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {salesDates.length === 0 ? (
                                                <tr><td colSpan={4} className="py-20 text-center text-gray-300 font-bold uppercase italic">No records found</td></tr>
                                            ) : (
                                                salesDates.map((dateObj, i) => {
                                                    const dateStr = dateObj.ship_date ? dateObj.ship_date.split('T')[0] : '';
                                                    const isActive = selectedSalesDate === dateStr;
                                                    return (
                                                        <tr
                                                            key={i}
                                                            onClick={() => handleSelectSalesDate(dateStr)}
                                                            className={cn("cursor-pointer h-8", isActive && "selected bg-orange-50 font-black")}
                                                        >
                                                            <td className={cn("font-bold uppercase pl-2", isActive ? "text-[#FB7506]" : "text-gray-700")}>
                                                                {dateStr}
                                                            </td>
                                                            <td className="text-center font-bold text-gray-500">{dateObj.orders || dateObj.total_orders || 0}</td>
                                                            <td className="text-center font-bold text-gray-500">{dateObj.total_boxes || 0}</td>
                                                            <td className="text-right font-black text-[#FB7506] pr-2">
                                                                ${parseMoney(dateObj.amount || dateObj.total_amount).toFixed(2)}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: REPS & ORDERS (70% Width, Split Horizontally) */}
                        <div className="w-[70%] flex flex-col gap-3 min-h-0 overflow-hidden">

                            {/* TOP: SALES BY CUSTOMER (40% Height) */}
                            <div className="flex-[0.4] pos-grid-container flex flex-col shadow-sm border-gray-300 min-h-0 overflow-hidden">
                                <div className="pos-grid-header h-10 bg-[#374151]">
                                    <div className="flex items-center gap-2">
                                        <Users size={14} className="text-[#FB7506]" />
                                        <span className="font-black text-[11px] uppercase tracking-widest text-white">SALES BY CUSTOMER ({salesByRep.length})</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={10} />
                                            <input type="text" placeholder="Search customer..." className="bg-gray-700 text-white text-[9px] border-none outline-none rounded pl-7 pr-2 py-0.5 placeholder:text-gray-500 w-40" />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-[#F0F2F5] flex justify-end px-2 py-0.5 text-[9px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-200">
                                    {salesByRep.length} Records
                                </div>
                                <div className="pos-table-container custom-scrollbar overflow-auto">
                                    <table className="pos-table min-w-full text-[10px] whitespace-nowrap">
                                        <thead className="sticky top-0 z-10">
                                            <tr>
                                                <th className="pl-2">SALESREP</th>
                                                <th className="text-right">T.PIECES</th>
                                                <th className="text-right">T.SOLD</th>
                                                <th className="text-right">T.PAYMENTS</th>
                                                <th className="text-right">T.CREDITS</th>
                                                <th className="text-right">T.DEBITS</th>
                                                <th className="text-right">BALANCE</th>
                                                <th className="text-right">T.F.BOXES</th>
                                                <th className="text-right">T.COST</th>
                                                <th className="text-right pr-2">GPM%</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {/* Summary Row like in image */}
                                            <tr className="bg-orange-50/50 font-black border-b border-gray-200 text-gray-900 h-8">
                                                <td className="pl-2 uppercase">* ALL SALESMEN *</td>
                                                <td className="text-right text-blue-700">{salesByRep.reduce((v, r) => v + (r.total_orders || 0), 0)}</td>
                                                <td className="text-right">${salesByRep.reduce((v, r) => v + parseMoney(r.amount || r.total_amount), 0).toFixed(2)}</td>
                                                <td className="text-right text-gray-500">$0.00</td>
                                                <td className="text-right text-gray-500">$0.00</td>
                                                <td className="text-right text-gray-500">$0.00</td>
                                                <td className="text-right">${salesByRep.reduce((v, r) => v + parseMoney(r.amount || r.total_amount), 0).toFixed(2)}</td>
                                                <td className="text-right text-gray-500">0.00</td>
                                                <td className="text-right text-gray-500">$0.00</td>
                                                <td className="text-right text-green-600 pr-2">0.00%</td>
                                            </tr>
                                            {salesByRep.length === 0 ? (
                                                <tr><td colSpan={10} className="py-10 text-center text-gray-300 font-bold uppercase italic">No reps selected</td></tr>
                                            ) : (
                                                salesByRep.map((rep, i) => {
                                                    const isActive = selectedSalesRep?.sales_cus_uq === rep.sales_cus_uq;
                                                    return (
                                                        <tr
                                                            key={i}
                                                            onClick={() => handleSelectSalesRep(rep)}
                                                            className={cn("cursor-pointer h-8 align-middle", isActive && "selected bg-orange-50 font-black")}
                                                        >
                                                            <td className={cn("uppercase pl-2", isActive ? "text-[#FB7506]" : "text-gray-700")}>
                                                                {rep.Salesman || rep.sales_name || 'Unknown'}
                                                            </td>
                                                            <td className="text-right text-gray-600 px-2 font-bold">{rep.orders || rep.total_orders || 0}</td>
                                                            <td className="text-right font-black text-[#FB7506] px-2">
                                                                ${parseMoney(rep.amount || rep.total_amount).toFixed(2)}
                                                            </td>
                                                            <td className="text-right text-gray-400 font-medium px-2">$0.00</td>
                                                            <td className="text-right text-gray-400 font-medium px-2">$0.00</td>
                                                            <td className="text-right text-gray-400 font-medium px-2">$0.00</td>
                                                            <td className="text-right text-gray-700 font-bold px-2">${parseMoney(rep.amount || rep.total_amount).toFixed(2)}</td>
                                                            <td className="text-right text-gray-500 font-medium px-2">0.00</td>
                                                            <td className="text-right text-gray-400 font-medium px-2">$0.00</td>
                                                            <td className="text-right text-green-600 font-black pr-2">40.00%</td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* BOTTOM: ORDERS BY SALES REP (60% Height) */}
                            <div className="flex-[0.6] pos-grid-container flex flex-col shadow-sm border-gray-300 min-h-0 overflow-hidden">
                                <div className="pos-grid-header h-10 bg-[#374151]">
                                    <div className="flex items-center gap-2">
                                        <Box size={14} className="text-[#FB7506]" />
                                        <span className="font-black text-[11px] uppercase tracking-widest text-white">ORDERS BY SALES REP. ({ordersList.length})</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={10} />
                                            <input type="text" placeholder="Search orders..." className="bg-gray-700 text-white text-[9px] border-none outline-none rounded pl-7 pr-2 py-0.5 placeholder:text-gray-500 w-32" />
                                        </div>
                                        <button className="bg-[#FB7506] hover:bg-orange-600 px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest text-white transition-all shadow-sm flex items-center gap-1 active:scale-95">
                                            <Plus size={10} /> NEW ORDER
                                        </button>
                                        <button className="bg-gray-700 hover:bg-gray-600 p-1.5 rounded transition-colors border border-gray-600">
                                            <RefreshCcw size={12} className="text-white" />
                                        </button>
                                        <button className="bg-orange-500 hover:bg-orange-600 p-1.5 rounded transition-colors">
                                            <List size={12} className="text-white" />
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-[#F0F2F5] flex justify-end px-2 py-0.5 text-[9px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-200">
                                    {ordersList.length} Records
                                </div>
                                <div className="pos-table-container custom-scrollbar overflow-auto">
                                    <table className="pos-table min-w-full text-[10px] whitespace-nowrap">
                                        <thead className="sticky top-0 z-10">
                                            <tr>
                                                <th className="text-center w-8">VIEW</th>
                                                <th>WAREHOUSE</th>
                                                <th>INVOICE NO</th>
                                                <th>CUSTOMER</th>
                                                <th>SHIP NAME</th>
                                                <th>CARRIER</th>
                                                <th className="text-right">T.INVOICE</th>
                                                <th className="text-center">T.PIECES</th>
                                                <th className="text-center">DISPATCH</th>
                                                <th className="text-center">E-MAIL</th>
                                                <th className="text-center">PRINTED</th>
                                                <th className="text-center">LABELED</th>
                                                <th className="text-center pr-2">VOID</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ordersList.length === 0 ? (
                                                <tr><td colSpan={13} className="py-20 text-center text-gray-300 font-bold uppercase italic">No orders found for this representative</td></tr>
                                            ) : (
                                                ordersList.map((order, i) => {
                                                    const isActive = selectedOrder?.unico === order.unico;
                                                    return (
                                                        <tr
                                                            key={order.unico || i}
                                                            onClick={() => setSelectedOrder(order)}
                                                            className={cn("cursor-pointer h-8 transition-colors", isActive && "selected bg-orange-50 font-black")}
                                                        >
                                                            <td className="text-center">
                                                                <FileText size={12} className="text-[#FB7506] mx-auto hover:scale-110" />
                                                            </td>
                                                            <td className="font-bold text-gray-500 uppercase">{order.warehouse || 'MIAMI'}</td>
                                                            <td className="font-black text-gray-900">{order.invoice_no || order.Invoice_No || 'N/A'}</td>
                                                            <td className="font-bold text-gray-700 truncate max-w-[150px] uppercase">{order.customer_name || order.Customer}</td>
                                                            <td className="font-medium text-gray-500 truncate max-w-[150px] uppercase">{order.ship_name || order.customer_name}</td>
                                                            <td className="font-medium text-gray-400 uppercase">{order.carrier || 'PICK UP'}</td>
                                                            <td className="text-right font-black text-gray-900 px-2">${parseMoney(order.total_amount || order.Total_Amount).toFixed(2)}</td>
                                                            <td className="text-center font-bold text-gray-600">{order.boxes || 0}</td>
                                                            <td className="text-center font-black text-green-600">{order.dispatch || 0}</td>
                                                            <td className="text-center"><input type="checkbox" className="w-3 h-3 grayscale cursor-not-allowed" /></td>
                                                            <td className="text-center"><input type="checkbox" defaultChecked={true} className="w-3 h-3 accent-green-600" /></td>
                                                            <td className="text-center"><input type="checkbox" defaultChecked={true} className="w-3 h-3 accent-blue-600" /></td>
                                                            <td className="text-center pr-2"><XCircle size={12} className="text-gray-300 hover:text-red-400 mx-auto" /></td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'terminal' && (
                    <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full overflow-hidden">

                        {/* 1. Bold Customer Summary Bar */}
                        <div className="bg-[#374151] rounded-md p-2 flex items-center justify-between shadow-md shrink-0 border border-gray-600">
                            <div className="flex items-center gap-4 px-2">
                                <Users className="w-5 h-5 text-[#FB7506]" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest leading-none">Customer</span>
                                    <span className="text-sm font-black text-white uppercase tracking-tight">
                                        {activeInvoice?.customerName || "SELECT CUSTOMER"}
                                    </span>
                                </div>
                                <div className="w-px h-6 bg-gray-600 mx-2" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest leading-none">Terms</span>
                                    <span className="text-xs font-bold text-green-400 uppercase tracking-tight">PREPAID</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button className="bg-[#FB7506] hover:bg-orange-600 text-white px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm border border-white/10">
                                    <History size={14} /> Open Actions
                                </button>
                                <button className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-md transition-colors border border-gray-600">
                                    <MoreVertical size={14} />
                                </button>
                            </div>
                        </div>

                        {/* 2. THREE BOXES HEADER */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 h-24 shrink-0">
                            {/* Box 1: Invoice Info */}
                            <div className="pos-grid-container flex flex-col shadow-sm">
                                <div className="pos-grid-header h-7">
                                    <div className="flex items-center gap-2">
                                        <Box size={14} className="text-[#FB7506]" />
                                        <span className="font-bold text-[11px] uppercase tracking-tight">Invoice Info</span>
                                    </div>
                                </div>
                                <div className="p-2 flex-1 flex flex-col justify-center space-y-1">
                                    <div className="flex flex-col">
                                        <span className="font-black text-sm uppercase text-gray-800">
                                            {activeInvoice ? `INV: ${activeInvoice.id}` : "NO ACTIVE INVOICE"}
                                        </span>
                                        <span className={cn(
                                            "font-bold text-[10px]",
                                            activeInvoice ? "text-[#FB7506]" : "text-gray-400"
                                        )}>
                                            {activeInvoice ? "OPEN" : "PENDING"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Box 2: Customer Info */}
                            <div
                                onClick={() => setIsCustomerModalOpen(true)}
                                className="pos-grid-container flex flex-col shadow-sm cursor-pointer hover:border-[#FB7506] transition-all"
                            >
                                <div className="pos-grid-header h-7">
                                    <div className="flex items-center gap-2">
                                        <Users size={14} className="text-[#FB7506]" />
                                        <span className="font-bold text-[11px] uppercase tracking-tight">Shipping Details</span>
                                    </div>
                                </div>
                                <div className="p-2 flex-1 flex flex-col justify-center">
                                    <span className="font-black text-xs uppercase text-gray-800">
                                        Miami Warehouse / Pick Up
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase mt-1">
                                        {activeInvoice ? "Click to change" : "Click to select"}
                                    </span>
                                </div>
                            </div>

                            {/* Box 3: Balance & Credits */}
                            <div className="pos-grid-container flex flex-col shadow-sm bg-orange-50/30">
                                <div className="pos-grid-header h-7">
                                    <div className="flex items-center gap-2">
                                        <DollarSign size={14} className="text-[#FB7506]" />
                                        <span className="font-bold text-[11px] uppercase tracking-tight">Balance & Summary</span>
                                    </div>
                                </div>
                                <div className="p-2 flex-1 flex flex-col justify-center items-end">
                                    <span className="text-2xl font-black text-[#FB7506] tracking-tighter">
                                        ${cart.reduce((s, i) => s + (i.price * i.quantity), 0).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 3. Invoice Details Table */}
                        <div className="pos-grid-container flex flex-col flex-1 min-h-0 bg-white shadow-sm border-[2px] border-gray-100">
                            <div className="pos-grid-header h-8">
                                <div className="flex items-center gap-2">
                                    <ShoppingCart size={14} className="text-[#FB7506]" />
                                    <span className="text-[11px] font-black uppercase tracking-tight">Invoice Details ({cart.length})</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="bg-white/10 hover:bg-white/20 p-1 rounded"><Pencil size={12} /></button>
                                    <button className="bg-[#FB7506] px-3 h-6 flex items-center justify-center rounded text-[9px] font-black uppercase tracking-widest">Menu</button>
                                </div>
                            </div>
                            <div className="pos-table-container">
                                <table className="pos-table text-xs">
                                    <thead>
                                        <tr>
                                            <th className="w-10 text-center">Del</th>
                                            <th>Description</th>
                                            <th className="text-center w-20">Boxes</th>
                                            <th className="text-right w-24">Price</th>
                                            <th className="text-right w-24">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cart.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="py-20 text-center text-gray-300 font-black uppercase tracking-[.2em] italic">
                                                    Invoice is empty
                                                </td>
                                            </tr>
                                        ) : (
                                            cart.map((item, i) => (
                                                <tr key={item.id} className="hover:bg-blue-50/50">
                                                    <td className="text-center">
                                                        <button
                                                            onClick={() => removeFromCart(item.id)}
                                                            className="text-red-400 hover:text-red-600 transition-colors"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </td>
                                                    <td className="font-bold text-gray-700">{item.name}</td>
                                                    <td className="text-center">
                                                        <input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                                                            className="w-12 text-center bg-gray-100 rounded font-black text-xs h-6 border-none outline-none focus:ring-1 focus:ring-[#FB7506]"
                                                        />
                                                    </td>
                                                    <td className="text-right font-bold text-gray-500">${item.price.toFixed(2)}</td>
                                                    <td className="text-right font-black text-[#FB7506]">${(item.price * item.quantity).toFixed(2)}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="h-12 bg-gray-50 border-t flex items-center justify-between px-4 shrink-0">
                                <div className="flex items-center gap-6">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Lines</span>
                                        <span className="font-black text-sm">{cart.length}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Boxes</span>
                                        <span className="font-black text-sm">{cart.reduce((s, i) => s + i.quantity, 0)}</span>
                                    </div>
                                </div>
                                <button className="bg-[#FB7506] hover:bg-orange-600 text-white px-6 h-8 rounded font-black text-[10px] uppercase tracking-widest shadow-lg shadow-orange-500/20 transition-all active:scale-95 flex items-center gap-2">
                                    <CreditCard size={14} />
                                    Process Order
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'inventory' && (
                    <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full overflow-hidden">

                        {/* Header Control Bar (Dark) */}
                        <div className="bg-[#374151] rounded-md p-1.5 flex items-center justify-between shadow-md shrink-0 border border-gray-600">
                            <div className="flex items-center gap-3 px-2">
                                <Database className="w-4 h-4 text-[#FB7506]" />
                                <span className="text-[11px] font-black text-white uppercase tracking-widest">
                                    AVAILABLE STOCK ({products.length}) - MIAMI - ALL
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <select className="bg-gray-700 text-white text-[10px] uppercase font-bold border border-gray-500 rounded px-2 py-1 outline-none">
                                    <option>MIAMI</option>
                                </select>
                                <select className="bg-gray-700 text-white text-[10px] uppercase font-bold border border-gray-500 rounded px-2 py-1 outline-none">
                                    <option>All Virtual</option>
                                </select>
                                <div className="flex gap-1 ml-2">
                                    <button className="bg-gray-700 hover:bg-gray-600 p-1.5 rounded transition-colors border border-gray-600">
                                        <RefreshCcw size={12} className="text-white" />
                                    </button>
                                    <button className="bg-gray-700 hover:bg-gray-600 p-1.5 rounded transition-colors border border-gray-600">
                                        <History size={12} className="text-white" />
                                    </button>
                                    <button className="bg-[#FB7506] hover:bg-orange-600 p-1.5 rounded transition-colors shadow-sm">
                                        <List size={12} className="text-white" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Search & Stats Bar */}
                        <div className="flex items-center justify-between px-1 shrink-0">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                                <input
                                    type="text"
                                    placeholder="Search stock..."
                                    className="bg-white border border-gray-300 text-gray-700 rounded-md pl-8 pr-4 py-1 text-[11px] font-bold w-64 outline-none focus:ring-1 focus:ring-[#FB7506] transition-all"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        fetchStock(1, e.target.value);
                                    }}
                                />
                            </div>
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                {products.length} Records <span className="mx-1 text-gray-300">|</span> Page 1 of 1
                            </div>
                        </div>

                        {/* Inventory Grid Table (Dense) */}
                        <div className="pos-grid-container flex flex-col flex-1 min-h-0 bg-white shadow-sm border-gray-300 overflow-hidden">
                            <div
                                className="pos-table-container custom-scrollbar overflow-auto"
                                onScroll={handleStockScroll}
                            >
                                <table className="pos-table min-w-[1800px] text-[10px] whitespace-nowrap">
                                    <thead className="sticky top-0 z-10">
                                        <tr>
                                            <th className="w-10 text-center">ADD</th>
                                            <th className="min-w-[250px]">DESCRIPTION</th>
                                            <th>CUST.</th>
                                            <th>FARM-LOT</th>
                                            <th className="text-center">STOCK</th>
                                            <th className="text-right">P.UNIT</th>
                                            <th className="text-center">DAYS</th>
                                            <th className="text-center">WAREHOUSE</th>
                                            <th>GROWER</th>
                                            <th>BOXDATE</th>
                                            <th>AWB CODE</th>
                                            <th className="text-center">PACKS/BOX</th>
                                            <th className="text-center">U.PACK</th>
                                            <th className="text-center">U.BOX</th>
                                            <th className="text-center">T.UNITS</th>
                                            <th className="text-center">CASE</th>
                                            <th className="text-center">CASE_SH</th>
                                            <th className="text-center pr-2">BORD.</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.length === 0 ? (
                                            <tr>
                                                <td colSpan={18} className="py-20 text-center text-gray-300 italic font-bold uppercase tracking-widest">
                                                    {loading ? "LOAD STOCK DATA..." : "NO DATA AVAILABLE"}
                                                </td>
                                            </tr>
                                        ) : (
                                            products.map((p, i) => {
                                                // Dynamic color based on index or property if available
                                                const rowColorClass =
                                                    i % 5 === 0 ? "bg-[#EF4444] text-white" : // Red row (urgent/low)
                                                        i % 3 === 0 ? "bg-[#22C55E] text-white" : // Green row (high)
                                                            "bg-white text-gray-700"; // Standard row

                                                return (
                                                    <tr key={i} className="h-7 border-b border-gray-100 group">
                                                        <td className="text-center">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleAddItem(p);
                                                                }}
                                                                className="w-5 h-5 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center hover:bg-[#FB7506] hover:text-white transition-all mx-auto border border-gray-200"
                                                            >
                                                                <Plus size={10} />
                                                            </button>
                                                        </td>
                                                        <td className={cn("font-bold px-2 flex items-center gap-1 h-full min-h-[28px]", rowColorClass)}>
                                                            {p.name || p.product_name}
                                                            {i % 4 === 0 && <span className="text-[8px] font-normal opacity-70 ml-1">(Cut Off: )</span>}
                                                        </td>
                                                        <td className="text-[9px] text-gray-500 font-bold px-2">{i % 10 === 0 ? '5039 FULLPO / FULL P' : '0 /'}</td>
                                                        <td className="text-gray-600 font-bold px-2">{p.lot || 'MTR 33668'}</td>
                                                        <td className="text-center font-black text-gray-900">{p.available_stock || 0}</td>
                                                        <td className="text-right font-black text-[#FB7506] px-2">${(p.price || 0).toFixed(2)}</td>
                                                        <td className="text-center font-bold text-gray-400">{20 + i}</td>
                                                        <td className="text-center bg-[#22C55E] text-white font-black text-[9px] px-2 uppercase tracking-tight shadow-inner">
                                                            {p.warehouse || 'MIAMI'}
                                                        </td>
                                                        <td className="text-gray-500 font-bold px-2 truncate max-w-[150px]">{(p as any).grower || 'MONTEROSA'}</td>
                                                        <td className="text-gray-400 font-bold px-2">Feb {10 + (i % 20)} 2026</td>
                                                        <td className="text-gray-500 font-bold px-2">{i % 2 === 0 ? '40008749076' : '00002112028'}</td>
                                                        <td className="text-center text-gray-600 px-1">1</td>
                                                        <td className="text-center text-gray-600 px-1">1</td>
                                                        <td className="text-center text-gray-600 px-1">1</td>
                                                        <td className="text-center font-bold text-blue-600">{(p.available_stock || 0) * 100}</td>
                                                        <td className="text-center font-bold text-gray-400">BOX</td>
                                                        <td className="text-center font-bold text-gray-400">BD</td>
                                                        <td className="text-center text-gray-400 pr-2">FP#{4000 + i}</td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'history' && (
                    <div className="flex flex-col gap-4 h-full pb-10 lg:pb-0 overflow-y-auto w-full">
                        {/* 2. Three Column Header Layout (History Tab) */}
                        <div className="flex flex-row overflow-x-auto lg:overflow-x-visible lg:grid lg:grid-cols-3 gap-3 shrink-0 pb-2 scrollbar-none snap-x w-full">
                            {/* Box 1: History Filters & Date Range */}
                            <div className="bg-white shadow-sm border flex flex-col min-h-[160px] min-w-[300px] lg:min-w-0 snap-center rounded-md overflow-hidden">
                                <div className="pos-grid-header">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-orange-500" />
                                        <span className="text-white text-[13px] font-bold uppercase tracking-[0.1em]">Date range Filters</span>
                                    </div>
                                </div>
                                <div className="p-3 space-y-3 flex-1 flex flex-col justify-center">
                                    <div className="flex flex-col">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            value={historyFilters.startDate}
                                            onChange={(e) => setHistoryFilters({ ...historyFilters, startDate: e.target.value })}
                                            className="bg-gray-50 border px-3 py-2 rounded-md text-[13px] font-bold outline-none focus:ring-2 focus:ring-orange-500/20 w-full"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">End Date</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="date"
                                                value={historyFilters.endDate}
                                                onChange={(e) => setHistoryFilters({ ...historyFilters, endDate: e.target.value })}
                                                className="flex-1 bg-gray-50 border px-3 py-2 rounded-md text-[13px] font-bold outline-none focus:ring-2 focus:ring-orange-500/20"
                                            />
                                            <button
                                                onClick={fetchInvoiceHistory}
                                                className="bg-orange-500 text-white px-4 py-2 rounded-md font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 shadow-sm transition-all flex items-center gap-2"
                                            >
                                                {loadingHistory ? <RefreshCcw size={14} className="animate-spin" /> : <Search size={14} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Box 2: Customer Details */}
                            <div className="bg-white shadow-sm border flex flex-col min-h-[160px] min-w-[300px] lg:min-w-0 snap-center rounded-md overflow-hidden">
                                <div className="pos-grid-header">
                                    <div className="flex items-center gap-2">
                                        <Users size={18} className="text-orange-500" />
                                        <span className="text-white text-[13px] font-bold uppercase tracking-[0.1em]">Customer Details</span>
                                    </div>
                                </div>
                                <div className="p-3 flex-1 flex flex-col justify-center gap-3">
                                    <div className="flex flex-col">
                                        <span className="text-gray-400 uppercase text-[10px] font-black tracking-widest">Select Customer</span>
                                        <div
                                            onClick={() => {
                                                setIsHistoryCustomerModalOpen(true);
                                                fetchHistoryCustomers(1, false);
                                            }}
                                            className="mt-1 w-full bg-white border-2 border-orange-500/30 pl-3 pr-4 py-2 rounded-md text-[12px] font-black outline-none hover:border-orange-500 hover:shadow-md transition-all cursor-pointer flex items-center justify-between group shadow-sm min-h-[42px]"
                                        >
                                            <span className={selectedHistoryCustomer ? "text-blue-900 truncate pr-2" : "text-gray-400"}>
                                                {selectedHistoryCustomer ?
                                                    `${selectedHistoryCustomer.cust_name || selectedHistoryCustomer.customer_name || 'Selected'}`
                                                    : "Click to Select..."}
                                            </span>
                                            <Search className="w-4 h-4 text-orange-400 group-hover:text-orange-600 transition-colors shrink-0" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-gray-400 uppercase text-[10px] font-black tracking-widest">Customer Code</span>
                                        <span className="text-[#009B4D] font-black text-[15px]">{selectedHistoryCustomer?.cust_code || (invoiceHistory.length > 0 ? invoiceHistory[0].cust_code : '-')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Box 3: Account Summary */}
                            <div className="bg-white shadow-sm border flex flex-col min-h-[160px] min-w-[300px] lg:min-w-0 snap-center rounded-md overflow-hidden">
                                <div className="pos-grid-header">
                                    <div className="flex items-center gap-2">
                                        <DollarSign size={18} className="text-orange-500" />
                                        <span className="text-white text-[13px] font-bold uppercase tracking-[0.1em]">Account Summary</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            className="bg-transparent border-none text-white hover:text-[#FB7506] transition-all p-1 shadow-none"
                                            onClick={fetchInvoiceHistory}
                                            title="Refresh Summary"
                                        >
                                            <RefreshCcw size={16} className={loadingHistory ? "animate-spin" : ""} />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-center">
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-gray-900 font-black uppercase text-[12px]">Balance:</span>
                                        <span className="text-blue-900 font-black text-[16px]">
                                            $ {(Number(invoiceHistory[0]?.total_inv_bal) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-gray-400 font-black uppercase text-[12px]">Unapply:</span>
                                        <span className="text-gray-600 font-black text-[16px]">
                                            $ {(Number(invoiceHistory[0]?.total_unapply) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-baseline mt-1 pt-1 border-t">
                                        <span className="text-[#009B4D] font-black uppercase text-[13px]">Total Account:</span>
                                        <span className="text-[#009B4D] font-black text-[18px]">
                                            $ {(Number(invoiceHistory[0]?.total_books_bal) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main History Area */}
                        <div className="flex-1 flex flex-col gap-4 overflow-hidden min-h-[500px]">
                            {/* TOP: Main Invoice Grid */}
                            <div className="pos-grid-container h-1/2 flex flex-col rounded-md overflow-hidden">
                                <div className="pos-grid-header">
                                    <div className="flex items-center gap-2">
                                        <History className="w-4 h-4 text-orange-500" />
                                        <span className="text-white text-[13px] font-bold uppercase tracking-[0.1em]">Invoice History ({invoiceHistory.length})</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            className="bg-transparent border-none text-white hover:text-[#FB7506] transition-all hover:rotate-180 duration-500 p-1 shadow-none"
                                            onClick={fetchInvoiceHistory}
                                            title="Refresh"
                                        >
                                            <RefreshCcw size={16} className={loadingHistory ? "animate-spin" : ""} />
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-white border-b p-2 text-right text-[10px] text-gray-500 font-bold">
                                    {invoiceHistory.length} Invoices Found
                                </div>
                                <div className="pos-table-container flex-1 overflow-auto bg-white min-h-[200px]">
                                    <table className="pos-table whitespace-nowrap min-w-full">
                                        <thead className="sticky top-0 z-20">
                                            <tr className="border-b-2">
                                                <th className="w-10 text-center font-black text-gray-500 uppercase tracking-tighter py-2 px-2 border">View</th>
                                                <th className="w-10 text-center font-black text-gray-500 uppercase tracking-tighter py-2 px-2 border">QB</th>
                                                <th className="font-black text-gray-500 uppercase tracking-tighter py-2 px-2 border">Invoice_date</th>
                                                <th className="font-black text-gray-500 uppercase tracking-tighter py-2 px-2 border">InvoiceNo</th>
                                                <th className="font-black text-gray-500 uppercase tracking-tighter py-2 px-2 border">Carrier</th>
                                                <th className="text-center font-black text-gray-500 uppercase tracking-tighter py-2 px-2 border">Void</th>
                                                <th className="text-center font-black text-gray-500 uppercase tracking-tighter py-2 px-2 border">Printed</th>
                                                <th className="font-black text-gray-500 uppercase tracking-tighter py-2 px-2 border">PO No</th>
                                                <th className="font-black text-gray-500 uppercase tracking-tighter py-2 px-2 border">SO No</th>
                                                <th className="text-right font-black text-gray-500 uppercase tracking-tighter py-2 px-2 border">T.Invoice</th>
                                                <th className="text-right font-black text-gray-500 uppercase tracking-tighter py-2 px-2 border">T.Balance</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loadingHistory ? (
                                                <tr><td colSpan={11} className="p-10 text-center font-bold text-gray-400">Loading history...</td></tr>
                                            ) : invoiceHistory.length === 0 ? (
                                                <tr><td colSpan={11} className="p-10 text-center font-bold text-gray-400">No invoices found for this range.</td></tr>
                                            ) : (
                                                invoiceHistory.map((inv, i) => (
                                                    <tr
                                                        key={inv.unico || i}
                                                        onClick={() => setSelectedHistoryInvoice(inv)}
                                                        className={`border-b hover:bg-blue-50 cursor-pointer h-8 transition-colors group ${selectedHistoryInvoice?.unico === inv.unico ? '!bg-blue-100 ring-2 ring-inset ring-blue-300 z-10 relative' : ''}`}
                                                    >
                                                        <td className="px-2 text-center sticky left-0 z-20 group-hover:bg-blue-50">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); /* loadOrderIntoTerminal(inv) */ }}
                                                                className={`p-1.5 rounded flex items-center justify-center transition-all mx-auto ${inv.printed ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-orange-100 text-orange-600 hover:bg-orange-200'}`}
                                                            >
                                                                <FileText className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                        <td className="px-2 text-center">
                                                            <div className={`w-3.5 h-3.5 mx-auto border border-gray-300 flex items-center justify-center ${inv.qb ? 'bg-green-500 border-green-600' : 'bg-white'}`}>
                                                                {inv.qb && <Check size={10} className="text-white" />}
                                                            </div>
                                                        </td>
                                                        <td className="px-3 text-gray-500">{formatDate(inv.invoice_date)}</td>
                                                        <td className="px-3 font-black text-blue-700">{inv.invoice_no}</td>
                                                        <td className="px-3 text-gray-600 uppercase italic font-bold">{inv.carrier}</td>
                                                        <td className="px-2 text-center">
                                                            <div className={`w-3.5 h-3.5 mx-auto border border-gray-300 flex items-center justify-center ${inv.void ? 'bg-[#FB7506] border-[#FB7506]' : 'bg-white'}`}>
                                                                {inv.void && <Check size={10} className="text-white" />}
                                                            </div>
                                                        </td>
                                                        <td className="px-2 text-center">
                                                            <div className={`w-3.5 h-3.5 mx-auto border border-gray-300 flex items-center justify-center ${inv.printed ? 'bg-[#009B4D] border-[#009B4D]' : 'bg-white'}`}>
                                                                {inv.printed && <Check size={10} className="text-white" />}
                                                            </div>
                                                        </td>
                                                        <td className="px-3 font-bold">{inv.po_no || inv.po_number || ''}</td>
                                                        <td className="px-3 font-bold">{inv.so_no || inv.so_number || ''}</td>
                                                        <td className="px-3 text-right font-black text-orange-600">
                                                            $ {parseMoney(inv.total_invoice || inv.total_amount).toFixed(2)}
                                                        </td>
                                                        <td className="px-3 text-right font-black text-gray-900">
                                                            $ {parseMoney(inv.total_balance || inv.balance).toFixed(2)}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* BOTTOM: Sub-tabs (Items, Credits, etc) */}
                            <div className="pos-grid-container h-1/2 flex flex-col rounded-md overflow-hidden bg-white">
                                <div className="pos-grid-header px-0 border-b border-gray-600">
                                    <div className="flex h-full">
                                        {[
                                            { id: 'details', label: 'Invoice Items', icon: Package },
                                            { id: 'credits', label: 'Credits History', icon: CreditCard },
                                            { id: 'returns', label: 'Returns', icon: RefreshCcw },
                                            { id: 'statement', label: 'Statement', icon: FileText }
                                        ].map(subTab => (
                                            <button
                                                key={subTab.id}
                                                onClick={() => setHistoryDetailTab(subTab.id)}
                                                className={`px-4 flex items-center gap-2 text-[13px] font-bold uppercase transition-all relative h-full ${historyDetailTab === subTab.id
                                                    ? 'text-white bg-white/10'
                                                    : 'text-white/50 hover:text-white hover:bg-white/5'
                                                    }`}
                                            >
                                                <subTab.icon className="w-4 h-4" />
                                                {subTab.label}
                                                {historyDetailTab === subTab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500"></div>}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex-1 overflow-auto bg-gray-50/30">
                                    {!selectedHistoryInvoice ? (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-300">
                                            <History className="w-12 h-12 mb-2 opacity-20" />
                                            <p className="text-xs font-bold uppercase tracking-widest">Select an invoice to view details</p>
                                        </div>
                                    ) : (
                                        <>
                                            {historyDetailTab === 'details' && (
                                                <div className="pos-table-container h-[450px] min-h-[450px] max-h-[450px] flex-none lg:flex-1 lg:min-h-0 lg:max-h-none overflow-auto">
                                                    <table className="pos-table whitespace-nowrap">
                                                        <thead className="sticky top-0 z-20">
                                                            <tr className="border-b-2">
                                                                <th className="w-10 text-center font-black text-gray-500 uppercase tracking-tighter py-2 px-2 border">Log</th>
                                                                <th className="font-black text-gray-500 uppercase tracking-tighter py-2 px-2 border">Description</th>
                                                                <th className="font-black text-gray-500 uppercase tracking-tighter py-2 px-2 border">Lot</th>
                                                                <th className="text-center font-black text-gray-500 uppercase tracking-tighter py-2 px-2 border">BoxQty</th>
                                                                <th className="text-center font-black text-gray-500 uppercase tracking-tighter py-2 px-2 border">UxBox</th>
                                                                <th className="text-right font-black text-gray-500 uppercase tracking-tighter py-2 px-2 border">Price</th>
                                                                <th className="text-center font-black text-gray-500 uppercase tracking-tighter py-2 px-2 border">Total Units</th>
                                                                <th className="text-right font-black text-gray-500 uppercase tracking-tighter py-2 px-2 border">Ext price</th>
                                                                <th className="font-black text-gray-500 uppercase tracking-tighter py-2 px-2 border">Grower</th>
                                                                <th className="text-center font-black text-gray-500 uppercase tracking-tighter py-2 px-2 border">Days</th>
                                                                <th className="font-black text-gray-500 uppercase tracking-tighter py-2 px-2 border">Awbcode</th>
                                                                <th className="text-center font-black text-gray-500 uppercase tracking-tighter py-2 px-2 border">Inventory</th>
                                                                <th className="font-black text-gray-500 uppercase tracking-tighter py-2 px-2 border">Awb Date</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-black/5 border-b">
                                                            {historyDetails.length === 0 ? (
                                                                <tr><td colSpan={13} className="p-8 text-center text-gray-400 font-bold uppercase tracking-widest text-[10px]">No record matching your criteria</td></tr>
                                                            ) : (
                                                                historyDetails.map((item, idx) => (
                                                                    <tr
                                                                        key={idx}
                                                                        onClick={() => setSelectedHistoryDetailItem(item)}
                                                                        className={`hover:bg-blue-50/50 h-8 transition-colors border-b group cursor-pointer ${selectedHistoryDetailItem?.unico === item.unico ? '!bg-blue-100 ring-2 ring-inset ring-blue-300 z-10 relative' : ''}`}
                                                                    >
                                                                        <td className="px-2 text-center">
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    // setLogModal
                                                                                }}
                                                                                className="bg-transparent border-none text-gray-400 hover:text-orange-400 transition-all p-1 shadow-none"
                                                                                title="View Item Transaction Log"
                                                                            >
                                                                                <History size={14} />
                                                                            </button>
                                                                        </td>
                                                                        <td className="px-4 font-bold text-gray-700 uppercase truncate max-w-[200px]" title={item.description || item.product_name}>{item.description || item.product_name}</td>
                                                                        <td className="px-4 font-black text-gray-400">{item.lote}</td>
                                                                        <td className="px-4 text-center font-black text-blue-700">{item.box_qty}</td>
                                                                        <td className="px-4 text-center font-bold text-gray-400 group-hover:text-gray-600 transition-colors">{item.units_x_box || item.ux_box || item.units_per_box}</td>
                                                                        <td className="px-4 text-right font-black text-orange-600">$ {parseMoney(item.price).toFixed(2)}</td>
                                                                        <td className="px-4 text-center font-bold text-blue-900">{item.total_units || ((item.box_qty || 0) * (item.units_x_box || item.ux_box || item.units_per_box || 0))}</td>
                                                                        <td className="px-4 text-right font-black text-orange-600">$ {parseMoney(item.ext_price || ((item.box_qty || 0) * (item.price || 0))).toFixed(2)}</td>
                                                                        <td className="px-4 font-bold text-gray-700 uppercase truncate max-w-[150px]">{item.grower || item.farm_history}</td>
                                                                        <td className="px-4 text-center font-black text-blue-600">{item.days}</td>
                                                                        <td className="px-4 font-bold text-gray-700">{item.awbcode || item.awb_code}</td>
                                                                        <td className="px-4 text-center">
                                                                            <div className={`w-3.5 h-3.5 mx-auto border flex items-center justify-center ${item.inv_track || item.inventory ? 'bg-cyan-500 border-cyan-600 shadow-sm' : 'bg-white opacity-40'}`}>
                                                                                {(item.inv_track || item.inventory) && <Check size={10} className="text-white" />}
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-4 font-bold text-gray-500 italic uppercase underline decoration-gray-100 underline-offset-2">{item.awbdate}</td>
                                                                    </tr>
                                                                ))
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}

                                            {historyDetailTab === 'credits' && (
                                                <table className="pos-table">
                                                    <thead className="sticky top-0 z-20 bg-white">
                                                        <tr className="border-b-2 bg-white">
                                                            <th className="font-black text-gray-500 uppercase tracking-tighter py-2 px-4 border bg-white">Date</th>
                                                            <th className="font-black text-gray-500 uppercase tracking-tighter py-2 px-4 border bg-white">Description</th>
                                                            <th className="text-right font-black text-gray-500 uppercase tracking-tighter py-2 px-4 border bg-white">Amount</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-black/5">
                                                        {historyCredits.length === 0 ? (
                                                            <tr><td colSpan={3} className="p-8 text-center text-gray-400 font-bold uppercase text-[10px]">No credits applied to this invoice.</td></tr>
                                                        ) : (
                                                            historyCredits.map((credit, idx) => (
                                                                <tr key={idx} className="hover:bg-gray-50 h-8 transition-colors">
                                                                    <td className="px-4 font-bold text-gray-500">{formatDate(credit.fecha)}</td>
                                                                    <td className="px-4 font-bold text-gray-700">{credit.motivo || 'Credit Adjustment'}</td>
                                                                    <td className="px-4 text-right font-black text-red-600">-${Number(credit.ammount).toFixed(2)}</td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            )}

                                            {historyDetailTab === 'returns' && (
                                                <div className="p-10 text-center text-gray-300 font-bold uppercase italic text-[10px]">
                                                    Returns data placeholder (Waiting implementation)
                                                </div>
                                            )}

                                            {historyDetailTab === 'statement' && (
                                                <div className="p-6">
                                                    <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl border p-8">
                                                        <div className="flex justify-between items-start mb-8 border-b pb-8">
                                                            <div>
                                                                <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Account Statement</h2>
                                                                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Customer Balance Overview</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Balance</div>
                                                                <div className="text-3xl font-black text-blue-600">
                                                                    ${historyStatement?.reduce((sum: number, row: any) => sum + (Number(row.balance) || 0), 0).toFixed(2) || '0.00'}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <table className="w-full text-left text-[11px] border-collapse">
                                                            <thead>
                                                                <tr className="border-b text-gray-400 font-black uppercase tracking-tighter h-8">
                                                                    <th className="py-2">Date</th>
                                                                    <th className="py-2">Document</th>
                                                                    <th className="py-2 text-right">Charges</th>
                                                                    <th className="py-2 text-right">Payments</th>
                                                                    <th className="py-2 text-right">Balance</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-black/5">
                                                                {historyStatement?.map((row: any, idx: number) => (
                                                                    <tr key={idx} className="h-8 hover:bg-gray-50">
                                                                        <td className="py-2 text-gray-500 font-bold">{formatDate(row.fecha)}</td>
                                                                        <td className="py-2 font-black text-gray-700">{row.invoice_no}</td>
                                                                        <td className="py-2 text-right font-bold text-gray-700">${Number(row.ammount).toFixed(2)}</td>
                                                                        <td className="py-2 text-right font-bold text-green-600">${Number(row.payments).toFixed(2)}</td>
                                                                        <td className="py-2 text-right font-black text-blue-600">${Number(row.balance).toFixed(2)}</td>
                                                                    </tr>
                                                                ))}
                                                                {!historyStatement && (
                                                                    <tr><td colSpan={5} className="py-10 text-center text-gray-400 font-bold">Loading statement...</td></tr>
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </div>

            {/* MODALS */}
            <CustomerSearchModal
                isOpen={isCustomerModalOpen}
                onClose={() => setIsCustomerModalOpen(false)}
                onSelect={handleOpenInvoice}
                customers={customers}
                onSearch={searchCustomers}
                loading={loading}
            />

            {/* Notification Bar / Footer */}
            <div className="h-8 bg-gray-100 border-t px-4 flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-tight">
                <div className="flex items-center gap-4">
                    <span>Server: Production</span>
                    <span className="text-gray-300">|</span>
                    <span>Database: FullPot</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[#FB7506]">FOS Terminal V.2.0.1</span>
                </div>
            </div>
        </div>
    );
}

// Sub-component: Customer Search Modal
function CustomerSearchModal({ isOpen, onClose, onSelect, customers, onSearch, loading }: any) {
    if (!isOpen) return null;

    return (
        <div className="pos-modal">
            <div className="pos-modal-content max-w-xl">
                <div className="pos-grid-header">
                    <div className="flex items-center gap-2">
                        <Users size={16} />
                        <span className="font-bold text-[13px] uppercase tracking-tight">Select Customer</span>
                    </div>
                    <button onClick={onClose} className="text-white hover:text-orange-500 transition-colors">
                        <XCircle size={20} />
                    </button>
                </div>
                <div className="p-4 flex flex-col gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            autoFocus
                            type="text"
                            placeholder="Type customer name or code..."
                            className="w-full pl-10 pr-4 py-2 border rounded font-bold text-sm outline-none focus:ring-2 focus:ring-[#FB7506]"
                            onChange={(e) => onSearch(e.target.value)}
                        />
                    </div>
                    <div className="h-64 overflow-auto border rounded bg-gray-50">
                        {loading && customers.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-gray-400 text-xs font-bold animate-pulse">
                                SEARCHING CUSTOMERS...
                            </div>
                        ) : customers.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-gray-400 text-xs font-bold uppercase italic">
                                Type to search customers
                            </div>
                        ) : (
                            <div className="divide-y">
                                {customers.map((c: any) => (
                                    <div
                                        key={c.unico}
                                        onClick={() => onSelect(c)}
                                        className="p-3 hover:bg-[#FB750610] cursor-pointer flex items-center justify-between group transition-colors"
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-black text-xs text-gray-800 uppercase group-hover:text-[#FB7506]">{c.name}</span>
                                            <span className="text-[10px] font-bold text-gray-400">{c.unico}</span>
                                        </div>
                                        <ArrowRight size={16} className="text-gray-200 group-hover:text-[#FB7506] group-hover:translate-x-1 transition-all" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
