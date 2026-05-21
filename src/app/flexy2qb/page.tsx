"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, LayoutDashboard, ShoppingCart, Truck, CreditCard,
  DollarSign, BarChart2, Briefcase, FileText
} from "lucide-react";
import { useAuditLog } from "@/lib/audit";
import { usePagePermissions } from "@/lib/permissions";
import { Flexy2QBProvider } from "./context/Flexy2QBContext";
import { cn } from "@/lib/utils";

// Tabs
import DashboardTab from "./components/tabs/DashboardTab";
import Purchases2QBTab from "./components/tabs/Purchases2QBTab";
import PurchasesOChargesTab from "./components/tabs/PurchasesOChargesTab";
import PurchasesCreditsTab from "./components/tabs/PurchasesCreditsTab";
import Sales2QBTab from "./components/tabs/Sales2QBTab";
import SalesCosts2QBTab from "./components/tabs/SalesCosts2QBTab";
import SalesCreditsTab from "./components/tabs/SalesCreditsTab";
import CustomerPaymentsTab from "./components/tabs/CustomerPaymentsTab";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "purchases2qb", label: "Purchases2QB", icon: ShoppingCart },
  { id: "purchases-ocharges", label: "Purchases OCharges", icon: Truck },
  { id: "purchases-credits", label: "Purchases Credits", icon: CreditCard },
  { id: "sales2qb", label: "Sales2QB", icon: DollarSign },
  { id: "sales-costs", label: "Sales Costs", icon: BarChart2 },
  { id: "sales-credits", label: "Sales Credits", icon: Briefcase },
  { id: "customer-payments", label: "Customer Payments", icon: FileText },
] as const;

export default function Flexy2QBPageWrapper() {
  return (
    <Flexy2QBProvider>
      <Flexy2QBPage />
    </Flexy2QBProvider>
  );
}

function Flexy2QBPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { logAction } = useAuditLog("flexy2qb", "flexy_to_qb");
  const perms = usePagePermissions("flexy2qb");

  const [activeTab, setActiveTab] = useState<string>("dashboard");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  if (status === "loading") return null;

  return (
    <div className="flex flex-col min-h-screen lg:h-screen bg-[#f4f6f8] lg:overflow-hidden font-sans text-[#333]">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="h-12 bg-[#374151] flex items-center justify-between px-4 shrink-0 text-white">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/menu")} className="hover:bg-white/10 p-1.5 rounded transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <span className="font-black text-xs uppercase tracking-widest text-[#FB7506]">FOS</span>
            <div className="w-px h-4 bg-white/20 mx-2" />
            <span className="font-bold text-xs uppercase tracking-tight">Flexy To QuickBooks</span>
          </div>
        </div>
        <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">User:</span>
            <span>{session?.user?.name || "OPERATOR"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Status:</span>
            <span className="text-green-500 font-black">Online</span>
          </div>
        </div>
      </div>

      {/* ── Main Layout ─────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 gap-2 p-2 overflow-hidden">
        {/* Detail Tabs */}
        <div className="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex-1">
          {/* Tab Bar */}
          <div className="h-10 bg-[#374151] flex items-end px-2 shrink-0 gap-0.5 overflow-x-auto no-scrollbar">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 px-4 h-8 text-[10px] font-black uppercase tracking-wider rounded-t transition-all whitespace-nowrap",
                  activeTab === tab.id
                    ? "bg-[#f4f6f8] text-[#FB7506] border-b-2 border-[#FB7506]"
                    : "text-gray-400 hover:text-white hover:bg-white/10"
                )}
              >
                <tab.icon size={12} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-auto bg-[#f4f6f8] p-2 relative">
            {activeTab === "dashboard" && <DashboardTab />}
            {activeTab === "purchases2qb" && <Purchases2QBTab />}
            {activeTab === "purchases-ocharges" && <PurchasesOChargesTab />}
            {activeTab === "purchases-credits" && <PurchasesCreditsTab />}
            {activeTab === "sales2qb" && <Sales2QBTab />}
            {activeTab === "sales-costs" && <SalesCosts2QBTab />}
            {activeTab === "sales-credits" && <SalesCreditsTab />}
            {activeTab === "customer-payments" && <CustomerPaymentsTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
