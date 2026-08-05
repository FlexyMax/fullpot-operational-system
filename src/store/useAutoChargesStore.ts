import { create } from "zustand";

interface AutoChargesState {
    searchKey:  number;
    selRow:     any | null;
    setSelRow:  (row: any | null) => void;
    triggerSearch: () => void;
    clearSel:   () => void;
}

export const useAutoChargesStore = create<AutoChargesState>((set) => ({
    searchKey:     0,
    selRow:        null,
    setSelRow:     (row) => set({ selRow: row }),
    triggerSearch: ()    => set((s) => ({ searchKey: s.searchKey + 1, selRow: null })),
    clearSel:      ()    => set({ selRow: null }),
}));
