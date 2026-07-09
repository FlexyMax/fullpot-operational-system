import { create } from "zustand";

export type AwbTabId = "vendors" | "charges" | "boxes" | "by-date" | "varieties";

const todayStr = () => new Date().toISOString().split("T")[0];

interface AwbState {
    // Filter bar
    dateFrom:   string;
    dateTo:     string;
    airline:    string;
    awbSearch:  string;
    searchKey:  number;

    // Selection
    selAwb:     any | null;
    selVendor:  any | null;
    selCharge:  any | null;
    selByDate:  any | null;
    selBox:     any | null;
    selVariety: any | null;
    activeTab:  AwbTabId;

    // Setters
    setDateFrom:     (d: string) => void;
    setDateTo:       (d: string) => void;
    setAirline:      (a: string) => void;
    setAwbSearch:    (s: string) => void;
    triggerSearch:   () => void;
    setSelAwb:       (row: any | null) => void;
    setSelVendor:    (row: any | null) => void;
    setSelCharge:    (row: any | null) => void;
    setSelByDate:    (row: any | null) => void;
    setSelBox:       (row: any | null) => void;
    setSelVariety:   (row: any | null) => void;
    setActiveTab:    (tab: AwbTabId) => void;
    clearSelections: () => void;
}

export const useAwbStore = create<AwbState>((set) => ({
    dateFrom:   todayStr(),
    dateTo:     todayStr(),
    airline:    "%",
    awbSearch:  "",
    searchKey:  0,

    selAwb:     null,
    selVendor:  null,
    selCharge:  null,
    selByDate:  null,
    selBox:     null,
    selVariety: null,
    activeTab:  "vendors",

    setDateFrom:   (d)   => set({ dateFrom: d }),
    setDateTo:     (d)   => set({ dateTo: d }),
    setAirline:    (a)   => set({ airline: a }),
    setAwbSearch:  (s)   => set({ awbSearch: s }),
    triggerSearch: ()    => set(s => ({ searchKey: s.searchKey + 1, selAwb: null, selVendor: null, selCharge: null, selByDate: null, selBox: null, selVariety: null })),
    setSelAwb:     (row) => set({ selAwb: row, selVendor: null, selCharge: null, selBox: null, selVariety: null }),
    setSelVendor:  (row) => set({ selVendor: row }),
    setSelCharge:  (row) => set({ selCharge: row }),
    setSelByDate:  (row) => set({ selByDate: row }),
    setSelBox:     (row) => set({ selBox: row }),
    setSelVariety: (row) => set({ selVariety: row }),
    setActiveTab:  (tab) => set({ activeTab: tab }),
    clearSelections: ()  => set({ selAwb: null, selVendor: null, selCharge: null, selByDate: null, selBox: null, selVariety: null }),
}));
