import { create } from "zustand";

interface StandingOrdersState {
    // ── Filters ───────────────────────────────────────────────────────────────
    dayFilter:  string;
    textSearch: string;
    myOrders:   boolean;

    // ── Orders list ───────────────────────────────────────────────────────────
    listKey: number;

    // ── Selected order ────────────────────────────────────────────────────────
    selectedUnico:   string | null;
    selectedRow:     any | null;
    showMobileModal: boolean;

    // ── New order modal ───────────────────────────────────────────────────────
    newOrderModal: boolean;

    // ── Detail panel ─────────────────────────────────────────────────────────
    detailKey:         number;
    selectedLineUnico: string | null;

    // ── Actions ───────────────────────────────────────────────────────────────
    setDayFilter:         (v: string) => void;
    setTextSearch:        (v: string) => void;
    setMyOrders:          (v: boolean) => void;
    selectOrder:          (unico: string, row: any, isMobile: boolean) => void;
    clearSelection:       () => void;
    refreshList:          () => void;
    refreshDetail:        () => void;
    setShowMobileModal:   (v: boolean) => void;
    setNewOrderModal:     (v: boolean) => void;
    setSelectedLineUnico: (v: string | null) => void;
}

export const useStandingOrdersStore = create<StandingOrdersState>()((set) => ({
    dayFilter:         "%",
    textSearch:        "",
    myOrders:          false,
    listKey:           0,
    selectedUnico:     null,
    selectedRow:       null,
    showMobileModal:   false,
    newOrderModal:     false,
    detailKey:         0,
    selectedLineUnico: null,

    setDayFilter:  (v) => set({ dayFilter: v }),
    setTextSearch: (v) => set({ textSearch: v }),
    setMyOrders:   (v) => set({ myOrders: v }),

    selectOrder: (unico, row, isMobile) => set({
        selectedUnico:     unico,
        selectedRow:       row,
        showMobileModal:   isMobile,
        selectedLineUnico: null,
    }),

    clearSelection: () => set({
        selectedUnico:     null,
        selectedRow:       null,
        showMobileModal:   false,
        selectedLineUnico: null,
    }),

    refreshList:   () => set((s) => ({ listKey:   s.listKey   + 1 })),
    refreshDetail: () => set((s) => ({ detailKey: s.detailKey + 1 })),

    setShowMobileModal:   (v) => set({ showMobileModal: v }),
    setNewOrderModal:     (v) => set({ newOrderModal: v }),
    setSelectedLineUnico: (v) => set({ selectedLineUnico: v }),
}));
