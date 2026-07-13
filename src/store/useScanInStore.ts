import { create } from "zustand";

export type ScanInTabId = "pending" | "recepted" | "scan-list" | "no-scan" | "invoices";

export interface ScanInTotals {
    totalPieces: number;
    readPieces: number;
}

interface ScanInState {
    activeAwb: string;
    totals: ScanInTotals | null;
    scanning: boolean;
    lastScan: { ok: boolean; msg: string } | null;
    selectedLot: any | null;
    activeTab: ScanInTabId;
    pendingSelRow: number | null;
    receptedSelRow: number | null;
    scanListSelRow: number | null;
    noScanSelRow: number | null;
    invoiceSelRow: number | null;
    viewKey: number;

    setActiveAwb: (awb: string) => void;
    setTotals: (t: ScanInTotals | null) => void;
    setScanning: (v: boolean) => void;
    setLastScan: (v: { ok: boolean; msg: string } | null) => void;
    setSelectedLot: (lot: any | null) => void;
    setActiveTab: (t: ScanInTabId) => void;
    setPendingSelRow: (i: number | null) => void;
    setReceptedSelRow: (i: number | null) => void;
    setScanListSelRow: (i: number | null) => void;
    setNoScanSelRow: (i: number | null) => void;
    setInvoiceSelRow: (i: number | null) => void;
    refresh: () => void;
    reset: () => void;
}

const INITIAL: Pick<ScanInState,
    "activeAwb" | "totals" | "scanning" | "lastScan" | "selectedLot" |
    "activeTab" | "pendingSelRow" | "receptedSelRow" | "scanListSelRow" |
    "noScanSelRow" | "invoiceSelRow" | "viewKey"
> = {
    activeAwb: "",
    totals: null,
    scanning: false,
    lastScan: null,
    selectedLot: null,
    activeTab: "pending",
    pendingSelRow: null,
    receptedSelRow: null,
    scanListSelRow: null,
    noScanSelRow: null,
    invoiceSelRow: null,
    viewKey: 0,
};

export const useScanInStore = create<ScanInState>()((set) => ({
    ...INITIAL,

    setActiveAwb:      (awb) => set({ activeAwb: awb }),
    setTotals:         (t)   => set({ totals: t }),
    setScanning:       (v)   => set({ scanning: v }),
    setLastScan:       (v)   => set({ lastScan: v }),
    setSelectedLot:    (lot) => set({ selectedLot: lot }),
    setActiveTab:      (t)   => set({ activeTab: t }),
    setPendingSelRow:  (i)   => set({ pendingSelRow: i }),
    setReceptedSelRow: (i)   => set({ receptedSelRow: i }),
    setScanListSelRow: (i)   => set({ scanListSelRow: i }),
    setNoScanSelRow:   (i)   => set({ noScanSelRow: i }),
    setInvoiceSelRow:  (i)   => set({ invoiceSelRow: i }),
    refresh:           ()    => set((st) => ({ viewKey: st.viewKey + 1 })),
    reset:             ()    => set(INITIAL),
}));
