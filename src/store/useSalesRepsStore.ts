import { create } from "zustand";

export type ActiveTab = "customers" | "product-classes" | "vendors" | "warehouses" | "cities" | "salesmen";

interface SalesRepsState {
    search: string;
    setSearch: (search: string) => void;
    selectedUq: string | null;
    setSelectedUq: (uq: string | null) => void;
    activeTab: ActiveTab | null;
    setActiveTab: (tab: ActiveTab | null) => void;
    tabLoaded: Partial<Record<ActiveTab, boolean>>;
    setTabLoaded: (tabLoaded: Partial<Record<ActiveTab, boolean>>) => void;
    mobilePanel: "list" | "detail";
    setMobilePanel: (panel: "list" | "detail") => void;
    // Modals
    activeModal: ActiveTab | null;
    setActiveModal: (modal: ActiveTab | null) => void;
}

export const useSalesRepsStore = create<SalesRepsState>((set) => ({
    search: "",
    setSearch: (search) => set({ search }),
    selectedUq: null,
    setSelectedUq: (selectedUq) => set({ selectedUq }),
    activeTab: "customers",
    setActiveTab: (activeTab) => set({ activeTab }),
    tabLoaded: {},
    setTabLoaded: (tabLoaded) => set((state) => ({ tabLoaded: { ...state.tabLoaded, ...tabLoaded } })),
    mobilePanel: "list",
    setMobilePanel: (mobilePanel) => set({ mobilePanel }),
    activeModal: null,
    setActiveModal: (activeModal) => set({ activeModal }),
}));
