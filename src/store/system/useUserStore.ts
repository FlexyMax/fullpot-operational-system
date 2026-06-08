import { create } from "zustand";

interface UserState {
    searchTerm: string;
    selectedRow: any | null;
    isUpsertModalOpen: boolean;
    isLogModalOpen: boolean;
    mode: "add" | "edit";
    
    setSearchTerm: (t: string) => void;
    setSelectedRow: (row: any | null) => void;
    setUpsertModalOpen: (open: boolean) => void;
    setLogModalOpen: (open: boolean) => void;
    setMode: (mode: "add" | "edit") => void;
}

export const useUserStore = create<UserState>((set) => ({
    searchTerm: "",
    selectedRow: null,
    isUpsertModalOpen: false,
    isLogModalOpen: false,
    mode: "add",

    setSearchTerm: (t) => set({ searchTerm: t }),
    setSelectedRow: (row) => set({ selectedRow: row }),
    setUpsertModalOpen: (open) => set({ isUpsertModalOpen: open }),
    setLogModalOpen: (open) => set({ isLogModalOpen: open }),
    setMode: (mode) => set({ mode }),
}));
