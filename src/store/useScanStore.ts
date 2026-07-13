import { create } from "zustand";

export type ScanTabId =
    | "pending"
    | "in-transit"
    | "scanned-eq"
    | "scanned-bx"
    | "sys-not"
    | "sys-less"
    | "sys-eq"
    | "phy-less"
    | "phy-not";

interface ScanState {
    currentRack: string;
    activeTab:   ScanTabId;
    viewKey:     number;

    setCurrentRack: (v: string) => void;
    setActiveTab:   (v: ScanTabId) => void;
    refresh:        () => void;
}

export const useScanStore = create<ScanState>()((set) => ({
    currentRack: "RACK",
    activeTab:   "pending",
    viewKey:     0,

    setCurrentRack: (v) => set({ currentRack: v }),
    setActiveTab:   (v) => set({ activeTab: v }),
    refresh:        ()  => set((s) => ({ viewKey: s.viewKey + 1 })),
}));
