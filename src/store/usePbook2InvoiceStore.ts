import { create } from "zustand";

type DateMode = "delivery" | "shipping";
type BottomTabId = "invoiced" | "assigned" | "purchase" | "stockom" | "similar";

interface Pbook2InvoiceState {
    dateMode: DateMode;
    setDateMode: (mode: DateMode) => void;
    selectedDate: string | null;
    setSelectedDate: (date: string | null) => void;
    selectedCustUq: string;
    setSelectedCustUq: (uq: string) => void;
    productSearch: string;
    setProductSearch: (v: string) => void;
    appliedSearch: string;
    setAppliedSearch: (v: string) => void;
    selectedUnico: string | null;
    setSelectedUnico: (uq: string | null) => void;
    activeTab: BottomTabId;
    setActiveTab: (tab: BottomTabId) => void;
    datesKey: number;
    bumpDatesKey: () => void;
    linesKey: number;
    bumpLinesKey: () => void;
    working: boolean;
    setWorking: (v: boolean) => void;

    modalUpdateLine: { open: boolean; tab: "details" | "notes" };
    setModalUpdateLine: (v: { open: boolean; tab: "details" | "notes" }) => void;
    modalChangePO: boolean;
    setModalChangePO: (v: boolean) => void;
    modalUnassign: any;
    setModalUnassign: (v: any) => void;
    modalAttach: boolean;
    setModalAttach: (v: boolean) => void;
    modalPartial: boolean;
    setModalPartial: (v: boolean) => void;
    reportModalUrl: string | null;
    setReportModalUrl: (v: string | null) => void;
    modalInvoicesByCustomer: boolean;
    setModalInvoicesByCustomer: (v: boolean) => void;
}

export const usePbook2InvoiceStore = create<Pbook2InvoiceState>((set) => ({
    dateMode: "delivery",
    setDateMode: (mode) => set({ dateMode: mode }),
    selectedDate: null,
    setSelectedDate: (date) => set({ selectedDate: date }),
    selectedCustUq: "%",
    setSelectedCustUq: (uq) => set({ selectedCustUq: uq }),
    productSearch: "",
    setProductSearch: (v) => set({ productSearch: v }),
    appliedSearch: "",
    setAppliedSearch: (v) => set({ appliedSearch: v }),
    selectedUnico: null,
    setSelectedUnico: (uq) => set({ selectedUnico: uq }),
    activeTab: "invoiced",
    setActiveTab: (tab) => set({ activeTab: tab }),
    datesKey: 0,
    bumpDatesKey: () => set((s) => ({ datesKey: s.datesKey + 1 })),
    linesKey: 0,
    bumpLinesKey: () => set((s) => ({ linesKey: s.linesKey + 1 })),
    working: false,
    setWorking: (v) => set({ working: v }),

    modalUpdateLine: { open: false, tab: "details" },
    setModalUpdateLine: (v) => set({ modalUpdateLine: v }),
    modalChangePO: false,
    setModalChangePO: (v) => set({ modalChangePO: v }),
    modalUnassign: null,
    setModalUnassign: (v) => set({ modalUnassign: v }),
    modalAttach: false,
    setModalAttach: (v) => set({ modalAttach: v }),
    modalPartial: false,
    setModalPartial: (v) => set({ modalPartial: v }),
    reportModalUrl: null,
    setReportModalUrl: (v) => set({ reportModalUrl: v }),
    modalInvoicesByCustomer: false,
    setModalInvoicesByCustomer: (v) => set({ modalInvoicesByCustomer: v }),
}));
