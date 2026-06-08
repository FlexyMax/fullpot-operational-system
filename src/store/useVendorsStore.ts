import { create } from "zustand";

type ModalVendorTab = "main" | "contacts" | "settings" | "qb";

interface VendorsState {
    search: string;
    setSearch: (search: string) => void;
    selectedUq: string | null;
    setSelectedUq: (uq: string | null) => void;
    expandedVendorUnico: string | null;
    setExpandedVendorUnico: (uq: string | null) => void;
    
    stmtModal: boolean;
    setStmtModal: (open: boolean) => void;
    pendingModal: boolean;
    setPendingModal: (open: boolean) => void;
    classesModal: boolean;
    setClassesModal: (open: boolean) => void;
    
    modalOpen: boolean;
    setModalOpen: (open: boolean) => void;
    modalMode: "add" | "edit";
    setModalMode: (mode: "add" | "edit") => void;
    modalTab: ModalVendorTab;
    setModalTab: (tab: ModalVendorTab) => void;
    
    docModal: boolean;
    setDocModal: (open: boolean) => void;
    
    wsModal: boolean;
    setWsModal: (open: boolean) => void;
    
    grpModal: boolean;
    setGrpModal: (open: boolean) => void;

    deleteModal: { type: string, id: string, name: string } | null;
    setDeleteModal: (modal: { type: string, id: string, name: string } | null) => void;
}

export const useVendorsStore = create<VendorsState>((set) => ({
    search: "",
    setSearch: (search) => set({ search }),
    selectedUq: null,
    setSelectedUq: (selectedUq) => set({ selectedUq }),
    expandedVendorUnico: null,
    setExpandedVendorUnico: (expandedVendorUnico) => set({ expandedVendorUnico }),
    
    stmtModal: false,
    setStmtModal: (stmtModal) => set({ stmtModal }),
    pendingModal: false,
    setPendingModal: (pendingModal) => set({ pendingModal }),
    classesModal: false,
    setClassesModal: (classesModal) => set({ classesModal }),
    
    modalOpen: false,
    setModalOpen: (modalOpen) => set({ modalOpen }),
    modalMode: "add",
    setModalMode: (modalMode) => set({ modalMode }),
    modalTab: "main",
    setModalTab: (modalTab) => set({ modalTab }),
    
    docModal: false,
    setDocModal: (docModal) => set({ docModal }),
    
    wsModal: false,
    setWsModal: (wsModal) => set({ wsModal }),
    
    grpModal: false,
    setGrpModal: (grpModal) => set({ grpModal }),

    deleteModal: null,
    setDeleteModal: (deleteModal) => set({ deleteModal }),
}));
