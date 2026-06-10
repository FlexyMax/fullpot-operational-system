"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, ShoppingCart, Truck, CreditCard,
  DollarSign, BarChart2, Briefcase, FileText
} from "lucide-react";
import { useAuditLog } from "@/lib/audit";
import { usePagePermissions, PERMISSION_MSGS } from "@/lib/permissions";
import { useFlexy2QBStore } from "@/store/flexy2qb/useFlexy2QBStore";
import { cn } from "@/lib/utils";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";

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
  { id: "purchases-ocharges", label: "Purch. OCharges", icon: Truck },
  { id: "purchases-credits", label: "Purch. Credits", icon: CreditCard },
  { id: "sales2qb", label: "Sales2QB", icon: DollarSign },
  { id: "sales-costs", label: "Sales Costs", icon: BarChart2 },
  { id: "sales-credits", label: "Sales Credits", icon: Briefcase },
  { id: "customer-payments", label: "Cust. Payments", icon: FileText },
] as const;

export default function Flexy2QBPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  useAuditLog("flexy2qb", "flexy_to_qb");
  const perms = usePagePermissions("flexy2qb");
  const store = useFlexy2QBStore();

  const [activeTab, setActiveTab] = useState<string>("dashboard");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (!perms.loading) store.setCanWrite(perms.canCreate || perms.canEdit);
  }, [perms.loading, perms.canCreate, perms.canEdit]);

  if (status === "loading") return (
    <div className="flex items-center justify-center h-screen">
      <span className="text-sm text-gray-400 animate-pulse">Loading...</span>
    </div>
  );
  if (status === "unauthenticated") return null;

  if (!perms.loading && !perms.canAccess) return (
    <div className="flex flex-col items-center justify-center h-screen gap-4 text-center px-8">
      <span className="text-4xl">🔒</span>
      <p className="text-sm text-gray-600 max-w-md">{PERMISSION_MSGS.access}</p>
      <button onClick={() => router.push("/menu")} className="px-4 py-2 rounded bg-gray-600 text-white text-sm font-bold">Go Back</button>
    </div>
  );

  return (
    <div className="flex flex-col h-[100dvh] bg-[#f4f6f8] overflow-hidden font-sans text-[#333]">
      <AppHeader title="Flexy To QuickBooks" />

      <div className="flex flex-col flex-1 gap-2 p-2 overflow-hidden">
        <div className="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex-1">
          {/* Tab Bar — white background like customer-payments */}
          <div className="bg-white border-b border-gray-200 flex items-end px-2 shrink-0 gap-0.5 overflow-x-auto no-scrollbar" style={{ height: 40 }}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); store.setActiveGrid(null); }}
                className={cn(
                  "flex items-center gap-1.5 px-3 h-full text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap shrink-0",
                  activeTab === tab.id
                    ? "text-[#FB7506] border-b-2 border-[#FB7506]"
                    : "text-gray-400 hover:text-gray-600"
                )}
              >
                <tab.icon size={11} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden bg-[#f4f6f8] p-2 relative flex flex-col">
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
      <AppFooter areaLabel="Terminal" />
    </div>
  );
}
