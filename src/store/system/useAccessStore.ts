import { create } from "zustand";

type CopyModal = { mode: "from" | "to" } | null;

interface AccessState {
    selectedUnico:   string | null;
    searchTerm:      string;
    filterCompany:   string;
    filterModule:    string;
    mobileUsersOpen: boolean;
    copyModal:       CopyModal;

    setSelectedUnico:   (unico: string | null) => void;
    setSearchTerm:      (term: string) => void;
    setFilterCompany:   (uq: string) => void;
    setFilterModule:    (uq: string) => void;
    setMobileUsersOpen: (open: boolean) => void;
    setCopyModal:       (modal: CopyModal) => void;
    clearFilters:       () => void;
}

export const useAccessStore = create<AccessState>((set) => ({
    selectedUnico:   null,
    searchTerm:      "",
    filterCompany:   "",
    filterModule:    "",
    mobileUsersOpen: false,
    copyModal:       null,

    setSelectedUnico:   (unico) => set({ selectedUnico: unico }),
    setSearchTerm:      (term) => set({ searchTerm: term }),
    setFilterCompany:   (uq) => set({ filterCompany: uq }),
    setFilterModule:    (uq) => set({ filterModule: uq }),
    setMobileUsersOpen: (open) => set({ mobileUsersOpen: open }),
    setCopyModal:       (modal) => set({ copyModal: modal }),
    clearFilters:       () => set({ filterCompany: "", filterModule: "" }),
}));
