"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
    ShoppingCart, Package, Users, LogOut, Search, Loader2,
    AlertCircle, Store, Settings, BarChart2, Receipt, DollarSign,
    Truck, ClipboardList, ScanLine, Building2, Grid3x3,
    ChevronRight, Landmark, Calendar, Plane
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuItem {
    id: string;
    module: string;
    app_page: string;
    access: any;
    modulo_nombre: string;
}

function getRoute(appPage: string): string | null {
    const p = appPage.toUpperCase();
    // Payment Authorizations must be checked FIRST — before any generic PAYMENT catch
    if (p.includes('PAYMENT AUTH') || p.includes('AUTHORIZ') || p.includes('VENDOR PAY') || p.includes('AP PAY') || p.includes('GROWERS PAY') || p.includes('VENTAS_GROWERS_PAY')) return '/payment-authorizations';
    if (p.includes('SALESMAN') || p.includes('SALES REP') || p.includes('SALES REPS') || p.includes('VENDEDOR')) return '/sales-reps';
    if (p.includes('SALES') || p.includes('P.O.S') || p.includes('BILLING')) return '/sales';
    if (p.includes('ACCOUNTS PAY') || p.includes('A/P') || p.includes('A-P') || p.includes('PAYABLE')) return '/accounts-payable';
    if (p.includes('USER SETUP') || p.includes('USERS DEF') || p.includes('USER DEF')) return '/system/users';
    if (p.includes('MODULE') || p.includes('SCREEN SETUP') || p.includes('MODULO') || p.includes('PANTALLA') || p.includes('SISTEMA MODULOS') || p.includes('SISTEMA PANTALLAS')) return '/system/modules';
    if (p.includes('CUSTOMER') || p.includes('CLIENTES') || p.includes('CUSTOMERS SETUP')) return '/masters/customers';
    if (p.includes('FREIGHT') || p.includes('HANDLING SETUP') || p.includes('FLETE')) return '/masters/freights';
    if (p.includes('CARRIER') || p.includes('AEROLINEA') || p.includes('CARRIERS DEF')) return '/masters/carriers';
    if (p.includes('RECEIVABLE') || p.includes('A/R') || p.includes('A-R') || p.includes('CUSTOMER PAY') || p.includes('PAYMENT') || p.includes('INCOME')) return '/sales/customer-payments';
    if (p.includes('ITEM') || p.includes('PRODUCT') || p.includes('VARIETY') || p.includes('VARIEDAD') || p.includes('ITEM SETUP') || p.includes('PRODUCTO')) return '/masters/items';
    if (p.includes('USUARIO') || p.includes('USER ACCESS') || p.includes('ACCESO') || p.includes('ACCESS DEF')) return '/system/access';
    if (p.includes('COMPAN') || p.includes('EMPRESA') || p.includes('COMPANY SETUP')) return '/system/companies';
    if (p.includes('AWB') || p.includes('GUIA') || p.includes('AIRWAY') || p.includes('VENTAS_AWB')) return '/awbs';
    if (p.includes('SCAN')) return '/scan';
    if (p.includes('FLEXY2QB') || p.includes('QUICKBOOKS') || p.includes('QB')) return '/flexy2qb';
    if (p.includes('QUALITY') || p.includes('CALIDAD') || p.includes(' QC') || p === 'QC') return '/qc';
    return null;
}

function getIcon(appPage: string) {
    const n = (appPage || '').toUpperCase();
    if (n.includes('SALES') || n.includes('BILLING')) return ShoppingCart;
    if (n.includes('P.O.S') || n.includes('POS') || n.includes('TERMINAL')) return Store;
    if (n.includes('PAYABLE') || n.includes('A/P')) return Receipt;
    if (n.includes('RECEIVABLE') || n.includes('A/R')) return Landmark;
    if (n.includes('INVENTORY') || n.includes('STOCK') || n.includes('ITEM') || n.includes('PRODUCT') || n.includes('VARIETY')) return Package;
    if (n.includes('CUSTOMER') || n.includes('CLIENT')) return Users;
    if (n.includes('REPORT') || n.includes('ANALYTIC')) return BarChart2;
    if (n.includes('PURCHASE') || n.includes('PREBOOK')) return ClipboardList;
    if (n.includes('SHIPPING') || n.includes('CARRIER') || n.includes('DISPATCH')) return Truck;
    if (n.includes('SETUP') || n.includes('CONFIG') || n.includes('ADMIN') || n.includes('SETTING')) return Settings;
    if (n.includes('SCAN') || n.includes('QR')) return ScanLine;
    if (n.includes('GROWER') || n.includes('VENDOR') || n.includes('SUPPLIER') || n.includes('FARM')) return Building2;
    if (n.includes('AWB') || n.includes('AIRWAY') || n.includes('GUIA')) return Plane;
    if (n.includes('PAYMENT') || n.includes('CASH')) return DollarSign;
    if (n.includes('USUARIO') || n.includes('USER') || n.includes('ACCESS') || n.includes('ACCESO')) return Users;
    return Grid3x3;
}

function getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
}

export default function MenuPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [menuData, setMenuData] = useState<Record<string, MenuItem[]>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated" && session?.user) {
            fetchMenu();
        }
    }, [status, session]);

    const fetchMenu = async () => {
        try {
            const res = await fetch(`/api/user/menu?userId=${(session?.user as any).id}`);
            const data = await res.json();
            if (data.success) {
                const grouped = (data.menu as MenuItem[]).reduce((acc, item) => {
                    const mod = item.module || "General";
                    if (!acc[mod]) acc[mod] = [];
                    acc[mod].push(item);
                    return acc;
                }, {} as Record<string, MenuItem[]>);
                setMenuData(grouped);
            } else {
                setError(data.message || "Failed to load menu");
            }
        } catch {
            setError("Server connection failed.");
        } finally {
            setLoading(false);
        }
    };

    const filteredMenu = Object.entries(menuData).reduce((acc, [mod, items]) => {
        if (!searchTerm) { acc[mod] = items; return acc; }
        const term = searchTerm.toLowerCase();
        const filtered = items.filter(i =>
            i.app_page.toLowerCase().includes(term) ||
            mod.toLowerCase().includes(term)
        );
        if (filtered.length > 0) acc[mod] = filtered;
        return acc;
    }, {} as Record<string, MenuItem[]>);

    const totalModules = Object.values(menuData).flat().length;
    const availableModules = Object.values(menuData).flat().filter(i => getRoute(i.app_page)).length;

    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen bg-[#f4f6f8] flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-[#FB7506] animate-spin" />
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                    Loading workspace...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f4f6f8] flex flex-col font-sans text-[#333]">

            {/* Header — consistent with Sales & Billing */}
            <header className="h-12 bg-[#374151] flex items-center justify-between px-6 shrink-0 text-white">
                <div className="flex items-center gap-3">
                    <span className="font-black text-xs uppercase tracking-widest text-[#FB7506]">FOS</span>
                    <div className="w-px h-4 bg-white/20" />
                    <span className="font-bold text-xs uppercase tracking-tight">FullPot Operational System</span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                        <input
                            type="text"
                            placeholder="Search modules..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="bg-gray-700 text-white text-[11px] border-none outline-none rounded pl-8 pr-3 py-1.5 placeholder:text-gray-500 w-44 focus:ring-1 focus:ring-[#FB7506] transition-all"
                        />
                    </div>
                    <div className="w-px h-4 bg-white/20" />
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-gray-400">User:</span>
                        <span>{session?.user?.name || 'OPERATOR'}</span>
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="flex items-center gap-2 bg-white/10 hover:bg-red-500/20 hover:text-red-400 px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                        <LogOut size={12} />
                        Logout
                    </button>
                </div>
            </header>

            {/* Info Bar */}
            <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0 shadow-sm">
                <div>
                    <p className="font-black text-sm text-gray-800">
                        {getGreeting()},{' '}
                        <span className="text-[#FB7506]">
                            {(session?.user?.name || 'User').split(' ')[0]}
                        </span>
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5 flex items-center gap-1.5">
                        <Calendar size={10} />
                        {today}
                    </p>
                </div>

                <div className="flex items-center gap-5">
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total Modules</span>
                        <span className="text-xl font-black text-gray-700 leading-tight">{totalModules}</span>
                    </div>
                    <div className="w-px h-8 bg-gray-100" />
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Available</span>
                        <span className="text-xl font-black text-[#FB7506] leading-tight">{availableModules}</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 p-6 max-w-7xl mx-auto w-full">

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 mb-6">
                        <AlertCircle className="text-red-500 shrink-0" size={16} />
                        <p className="text-xs font-bold text-red-600">{error}</p>
                    </div>
                )}

                {Object.entries(filteredMenu).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-gray-300">
                        <Search size={36} className="mb-3" />
                        <p className="text-[11px] font-black uppercase tracking-widest">
                            No modules match your search
                        </p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {Object.entries(filteredMenu).map(([moduleName, items]) => (
                            <section key={moduleName}>

                                {/* Section Header */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-1 h-4 bg-[#FB7506] rounded-full shrink-0" />
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] whitespace-nowrap">
                                        {moduleName}
                                    </span>
                                    <div className="flex-1 h-px bg-gray-200" />
                                    <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest whitespace-nowrap">
                                        {items.length} {items.length === 1 ? 'module' : 'modules'}
                                    </span>
                                </div>

                                {/* Module Tiles */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                                    {items.map((item, idx) => {
                                        const route = getRoute(item.app_page);
                                        const isAvailable = !!route;
                                        const Icon = getIcon(item.app_page);

                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => route && router.push(route)}
                                                disabled={!isAvailable}
                                                className={cn(
                                                    "group relative flex flex-col items-start gap-3 p-4 rounded-xl border bg-white text-left transition-all duration-200",
                                                    isAvailable
                                                        ? "border-gray-200 shadow-sm hover:border-[#FB7506] hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                                                        : "border-gray-100 cursor-not-allowed opacity-55"
                                                )}
                                            >
                                                {/* Available dot */}
                                                {isAvailable && (
                                                    <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-green-400 rounded-full" />
                                                )}

                                                {/* Icon */}
                                                <div className={cn(
                                                    "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200",
                                                    isAvailable
                                                        ? "bg-orange-50 text-[#FB7506] group-hover:bg-[#FB7506] group-hover:text-white"
                                                        : "bg-gray-100 text-gray-300"
                                                )}>
                                                    <Icon size={20} />
                                                </div>

                                                {/* Label */}
                                                <div className="w-full min-w-0">
                                                    <p className={cn(
                                                        "font-black text-[11px] uppercase tracking-tight leading-tight truncate",
                                                        isAvailable ? "text-gray-800" : "text-gray-400"
                                                    )}>
                                                        {item.app_page}
                                                    </p>

                                                    {isAvailable ? (
                                                        <div className="flex items-center gap-0.5 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                                                            <span className="text-[9px] font-black text-[#FB7506] uppercase tracking-widest">Open</span>
                                                            <ChevronRight size={10} className="text-[#FB7506]" />
                                                        </div>
                                                    ) : (
                                                        <span className="inline-block mt-1.5 text-[8px] font-black uppercase tracking-widest bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">
                                                            Coming soon
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                            </section>
                        ))}
                    </div>
                )}
            </main>

            {/* Footer — consistent with Sales & Billing */}
            <footer className="h-8 bg-gray-100 border-t border-gray-200 px-6 flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-tight shrink-0">
                <div className="flex items-center gap-4">
                    <span>Server: Production</span>
                    <span className="text-gray-300">|</span>
                    <span>Database: FullPot</span>
                </div>
                <span className="text-[#FB7506]">FOS Operational System V.2.0.1</span>
            </footer>

        </div>
    );
}
