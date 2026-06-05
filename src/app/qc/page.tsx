"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useAuditLog } from "@/lib/audit";
import { usePagePermissions, PERMISSION_MSGS } from "@/lib/permissions";
import { QCProvider, useQCContext } from "./context/QCContext";
import { cn } from "@/lib/utils";
import {
    Package, Truck,
    XCircle, Award, History, Loader2
} from "lucide-react";
import AppHeader from "@/components/layout/AppHeader";
import AppFooter from "@/components/layout/AppFooter";

// Tabs (Dashboard removed — starts from Stock List)
import StockListTab        from "./components/tabs/StockListTab";
import TransitBoxesTab     from "./components/tabs/TransitBoxesTab";
import CancelledPurchasesTab from "./components/tabs/CancelledPurchasesTab";
import QualityCreditsTab   from "./components/tabs/QualityCreditsTab";
import QCHistoryTab        from "./components/tabs/QCHistoryTab";

// Modals
import QCModal             from "./components/modals/QCModal";
import BoxTransferModal    from "./components/modals/BoxTransferModal";

const TABS = [
    { id: "stock",        label: "Stock List",           icon: Package },
    { id: "transit",      label: "Transit Boxes",        icon: Truck },
    { id: "cancellations",label: "Cancelled Purchases",  icon: XCircle },
    { id: "credits",      label: "Quality Credits",      icon: Award },
    { id: "history",      label: "QC History",           icon: History },
] as const;

type TabId = typeof TABS[number]["id"];

export default function QCPageWrapper() {
    return (
        <QCProvider>
            <QCPage />
        </QCProvider>
    );
}

function QCPage() {
    const { data: session, status } = useSession();
    const router                    = useRouter();
    useAuditLog("qc", "flower_packing_qc");
    const perms = usePagePermissions("qc");
    const { setCanCreate, setCanEdit, setCanDelete } = useQCContext();

    const [activeTab, setActiveTab] = useState<TabId>("stock");

    // Modals
    const [qcModal,       setQcModal]       = useState<{ lot: any; credit?: any } | null>(null);
    const [qcModalMode,   setQcModalMode]   = useState<"add" | "edit">("add");
    const [transferModal, setTransferModal] = useState<{ lot: any; mode: "insert" | "edit" } | null>(null);

    // Auth redirect
    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
    }, [status, router]);

    // Thread permissions to context
    useEffect(() => {
        if (!perms.loading) {
            setCanCreate(perms.canCreate);
            setCanEdit(perms.canEdit);
            setCanDelete(perms.canDelete);
        }
    }, [perms.loading, perms.canCreate, perms.canEdit, perms.canDelete, setCanCreate, setCanEdit, setCanDelete]);

    if (status === "loading") return (
        <div className="flex items-center justify-center h-screen">
            <Loader2 size={24} className="animate-spin text-[#FB7506]"/>
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

    const handleAddQC = (lot: any) => {
        setQcModalMode("add");
        setQcModal({ lot });
    };

    const handleEditQC = (lot: any, credit: any) => {
        setQcModalMode("edit");
        setQcModal({ lot, credit });
    };

    const handleSendToWarehouse = (row: any) => {
        setTransferModal({ lot: row, mode: "insert" });
    };

    const handleEditTransfer = (row: any) => {
        setTransferModal({ lot: row, mode: "edit" });
    };

    return (
        <div className="flex flex-col h-[100dvh] bg-[#f4f6f8] font-sans text-[#333] overflow-hidden">

            {/* ── Header ──────────────────────────────────────────────── */}
            <AppHeader title="Quality Control" extraRight={perms.loading ? <Loader2 size={14} className="animate-spin text-white/60"/> : undefined} />

            {/* ── Main area ─────────────────────────────────────────── */}

            {/* ── Main area ─────────────────────────────────────────── */}
            <div className="flex flex-col flex-1 p-2 gap-2 overflow-hidden">
                <div className="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex-1">

                    {/* Tab bar */}
                    <div className="h-10 bg-[#374151] flex items-end px-2 shrink-0 gap-0.5 overflow-x-auto">
                        {TABS.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 h-8 text-[10px] font-black uppercase tracking-wider rounded-t transition-all whitespace-nowrap",
                                    activeTab === tab.id
                                        ? "bg-[#f4f6f8] text-[#FB7506] border-b-2 border-[#FB7506]"
                                        : "text-gray-400 hover:text-white hover:bg-white/10"
                                )}>
                                <tab.icon size={11}/>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab content */}
                    <div className="flex-1 overflow-auto bg-[#f4f6f8] p-2">
                        {activeTab === "stock"        && <StockListTab onSendToWarehouse={handleSendToWarehouse} onEditTransfer={handleEditTransfer} onAddQC={handleAddQC}/>}
                        {activeTab === "transit"      && <TransitBoxesTab/>}
                        {activeTab === "cancellations" && <CancelledPurchasesTab/>}
                        {activeTab === "credits"      && <QualityCreditsTab onAddQC={handleAddQC} onEditQC={handleEditQC}/>}
                        {activeTab === "history"      && <QCHistoryTab onEditQC={handleEditQC}/>}
                    </div>
                </div>
            </div>

            <AppFooter areaLabel="Quality Control" />

            {/* ── Modals ────────────────────────────────────────────── */}
            {qcModal && (
                <QCModal
                    mode={qcModalMode}
                    lot={qcModal.lot}
                    credit={qcModal.credit}
                    onClose={() => setQcModal(null)}
                    onSaved={() => setQcModal(null)}
                />
            )}
            {transferModal && (
                <BoxTransferModal
                    mode={transferModal.mode}
                    lot={transferModal.lot}
                    onClose={() => setTransferModal(null)}
                    onSaved={() => setTransferModal(null)}
                />
            )}
        </div>
    );
}
