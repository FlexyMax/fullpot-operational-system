import { create } from "zustand";

export type ScanOutStep = "invoice" | "vendor";
export type ScanOutTabId = "history" | "details";

export interface ScanOutItem {
    id:             string;
    invoiceBarcode: string;
    vendorBarcode:  string;
    status:         "pending" | "success" | "error";
    message:        string;
    timestamp:      Date;
}

export interface ScanOutOrder {
    orderNo:     string;
    scanned:     number;
    toScan:      number;
    total:       number;
    customer:    string;
    destination: string;
    items:       any[];
}

interface ScanOutState {
    activeOrder:    ScanOutOrder | null;
    currentStep:    ScanOutStep;
    invoiceBarcode: string;
    scanHistory:    ScanOutItem[];
    activeTab:      ScanOutTabId;
    histSelRow:     number | null;
    detailSelRow:   number | null;

    setActiveOrder:    (o: ScanOutOrder | null) => void;
    setCurrentStep:    (s: ScanOutStep) => void;
    setInvoiceBarcode: (s: string) => void;
    addScanItem:       (item: ScanOutItem) => void;
    updateScanItem:    (id: string, patch: Partial<ScanOutItem>) => void;
    setActiveTab:      (t: ScanOutTabId) => void;
    setHistSelRow:     (i: number | null) => void;
    setDetailSelRow:   (i: number | null) => void;
    reset:             () => void;
}

const INITIAL: Pick<ScanOutState, "activeOrder" | "currentStep" | "invoiceBarcode" | "scanHistory" | "activeTab" | "histSelRow" | "detailSelRow"> = {
    activeOrder:    null,
    currentStep:    "invoice",
    invoiceBarcode: "",
    scanHistory:    [],
    activeTab:      "history",
    histSelRow:     null,
    detailSelRow:   null,
};

export const useScanOutStore = create<ScanOutState>()((set) => ({
    ...INITIAL,

    setActiveOrder:    (o) => set({ activeOrder: o }),
    setCurrentStep:    (s) => set({ currentStep: s }),
    setInvoiceBarcode: (s) => set({ invoiceBarcode: s }),

    addScanItem: (item) => set((st) => ({
        scanHistory: [item, ...st.scanHistory.slice(0, 49)],
    })),

    updateScanItem: (id, patch) => set((st) => ({
        scanHistory: st.scanHistory.map((s) => s.id === id ? { ...s, ...patch } : s),
    })),

    setActiveTab:    (t) => set({ activeTab: t }),
    setHistSelRow:   (i) => set({ histSelRow: i }),
    setDetailSelRow: (i) => set({ detailSelRow: i }),

    reset: () => set(INITIAL),
}));
