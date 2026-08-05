import { create } from "zustand";

interface VendorCrDbState {
    activeTab:        "list" | "history";
    selectedDate:     string | null;   // ISO YYYY-MM-DD from date picker
    selectedGrowerUq: string | null;   // "" = ALL vendors
    selectedUnico:    string | null;   // selected cr/db record PK
    historyGrowerUq:  string | null;
    historyFrom:      string;
    historyTo:        string;

    setActiveTab:        (tab: "list" | "history") => void;
    setSelectedDate:     (date: string | null) => void;
    setSelectedGrowerUq: (uq: string | null) => void;
    setSelectedUnico:    (unico: string | null) => void;
    setHistoryGrowerUq:  (uq: string | null) => void;
    setHistoryFrom:      (date: string) => void;
    setHistoryTo:        (date: string) => void;
}

function isoToday() {
    return new Date().toISOString().split("T")[0];
}
function iso30DaysAgo() {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
}

export const useVendorCrDbStore = create<VendorCrDbState>((set) => ({
    activeTab:        "list",
    selectedDate:     null,
    selectedGrowerUq: null,
    selectedUnico:    null,
    historyGrowerUq:  null,
    historyFrom:      iso30DaysAgo(),
    historyTo:        isoToday(),

    setActiveTab:        (tab)   => set({ activeTab: tab }),
    setSelectedDate:     (date)  => set({ selectedDate: date, selectedGrowerUq: null, selectedUnico: null }),
    setSelectedGrowerUq: (uq)    => set({ selectedGrowerUq: uq, selectedUnico: null }),
    setSelectedUnico:    (unico) => set({ selectedUnico: unico }),
    setHistoryGrowerUq:  (uq)    => set({ historyGrowerUq: uq }),
    setHistoryFrom:      (date)  => set({ historyFrom: date }),
    setHistoryTo:        (date)  => set({ historyTo: date }),
}));
