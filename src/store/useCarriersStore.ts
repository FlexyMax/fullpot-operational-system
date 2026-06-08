import { create } from "zustand";

interface CarriersState {
    carrSearch: string;
    setCarrSearch: (search: string) => void;
    currentIdx: number;
    setCurrentIdx: (idx: number) => void;
    
    mode: "add" | "edit";
    setMode: (mode: "add" | "edit") => void;
    
    formModal: boolean;
    setFormModal: (open: boolean) => void;
    
    invModal: boolean;
    setInvModal: (open: boolean) => void;
    
    custModal: boolean;
    setCustModal: (open: boolean) => void;
    
    othersModal: boolean;
    setOthersModal: (open: boolean) => void;
    
    deleteModal: { id: string, name: string } | null;
    setDeleteModal: (modal: { id: string, name: string } | null) => void;
}

export const useCarriersStore = create<CarriersState>((set) => ({
    carrSearch: "",
    setCarrSearch: (carrSearch) => set({ carrSearch }),
    currentIdx: 0,
    setCurrentIdx: (currentIdx) => set({ currentIdx }),
    
    mode: "edit",
    setMode: (mode) => set({ mode }),
    
    formModal: false,
    setFormModal: (formModal) => set({ formModal }),
    
    invModal: false,
    setInvModal: (invModal) => set({ invModal }),
    
    custModal: false,
    setCustModal: (custModal) => set({ custModal }),
    
    othersModal: false,
    setOthersModal: (othersModal) => set({ othersModal }),
    
    deleteModal: null,
    setDeleteModal: (deleteModal) => set({ deleteModal }),
}));
