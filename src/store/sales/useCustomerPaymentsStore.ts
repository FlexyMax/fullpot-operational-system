import { create } from "zustand";

interface CustomerPaymentsState {
    // Tabs & Grid controls
    activeTab: "customer" | "invoices" | "payments" | "crdb" | "statement" | "corporate";
    activeGrid: "customer" | "invoices" | "payments" | "crdb" | "statement" | "corporate" | "corp-invoice" | null;
    
    // Selections
    selCustomerUq: string | null;
    selInvoiceUq: string | null;
    selPaymentUq: string | null;
    selCrdbUq: string | null;

    // Search and Filters
    customerSearch: string;
    customerFilterMode: "ALL" | "BAL>0" | "BAL=0";

    // Actions
    setActiveTab: (tab: "customer" | "invoices" | "payments" | "crdb" | "statement" | "corporate") => void;
    setActiveGrid: (grid: "customer" | "invoices" | "payments" | "crdb" | "statement" | "corporate" | "corp-invoice" | null) => void;
    setSelCustomerUq: (uq: string | null) => void;
    setSelInvoiceUq: (uq: string | null) => void;
    setSelPaymentUq: (uq: string | null) => void;
    setSelCrdbUq: (uq: string | null) => void;
    
    setCustomerSearch: (search: string) => void;
    setCustomerFilterMode: (mode: "ALL" | "BAL>0" | "BAL=0") => void;
    
    clearSelection: () => void;
}

export const useCustomerPaymentsStore = create<CustomerPaymentsState>((set) => ({
    activeTab: "customer",
    activeGrid: null,
    
    selCustomerUq: null,
    selInvoiceUq: null,
    selPaymentUq: null,
    selCrdbUq: null,

    customerSearch: "",
    customerFilterMode: "ALL",

    setActiveTab: (tab) => set({ activeTab: tab, activeGrid: ["statement","corporate"].includes(tab) ? null : tab }),
    setActiveGrid: (grid) => set({ activeGrid: grid }),
    
    setSelCustomerUq: (uq) => set({ selCustomerUq: uq, activeGrid: uq ? "customer" : null, selInvoiceUq: null, selPaymentUq: null, selCrdbUq: null }),
    setSelInvoiceUq: (uq) => set({ selInvoiceUq: uq, activeGrid: uq ? "invoices" : null }),
    setSelPaymentUq: (uq) => set({ selPaymentUq: uq, activeGrid: uq ? "payments" : null }),
    setSelCrdbUq: (uq) => set({ selCrdbUq: uq, activeGrid: uq ? "crdb" : null }),

    setCustomerSearch: (search) => set({ customerSearch: search }),
    setCustomerFilterMode: (mode) => set({ customerFilterMode: mode }),

    clearSelection: () => set({ activeGrid: null, selCustomerUq: null, selInvoiceUq: null, selPaymentUq: null, selCrdbUq: null }),
}));
