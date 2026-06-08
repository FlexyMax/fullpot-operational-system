import { create } from "zustand";

interface FreightsState {
    selWh: any | null;
    setSelWh: (wh: any | null) => void;
    
    selFr: any | null;
    setSelFr: (fr: any | null) => void;
    
    selHa: any | null;
    setSelHa: (ha: any | null) => void;
    
    selAt: any | null;
    setSelAt: (at: any | null) => void;
    
    warehousesModal: boolean;
    setWarehousesModal: (open: boolean) => void;
    
    frModal: { mode: "add" | "edit" | "delete" } | null;
    setFrModal: (modal: { mode: "add" | "edit" | "delete" } | null) => void;
    
    haModal: { mode: "add" | "edit" | "delete" } | null;
    setHaModal: (modal: { mode: "add" | "edit" | "delete" } | null) => void;
    
    atModal: { mode: "add" | "edit" | "delete" } | null;
    setAtModal: (modal: { mode: "add" | "edit" | "delete" } | null) => void;
    
    copyModal: boolean;
    setCopyModal: (open: boolean) => void;
    
    citiesModal: boolean;
    setCitiesModal: (open: boolean) => void;
    
    airlinesModal: boolean;
    setAirlinesModal: (open: boolean) => void;
    
    seasonsModal: boolean;
    setSeasonsModal: (open: boolean) => void;
}

export const useFreightsStore = create<FreightsState>((set) => ({
    selWh: null,
    setSelWh: (selWh) => set({ selWh }),
    
    selFr: null,
    setSelFr: (selFr) => set({ selFr }),
    
    selHa: null,
    setSelHa: (selHa) => set({ selHa }),
    
    selAt: null,
    setSelAt: (selAt) => set({ selAt }),
    
    warehousesModal: false,
    setWarehousesModal: (warehousesModal) => set({ warehousesModal }),
    
    frModal: null,
    setFrModal: (frModal) => set({ frModal }),
    
    haModal: null,
    setHaModal: (haModal) => set({ haModal }),
    
    atModal: null,
    setAtModal: (atModal) => set({ atModal }),
    
    copyModal: false,
    setCopyModal: (copyModal) => set({ copyModal }),
    
    citiesModal: false,
    setCitiesModal: (citiesModal) => set({ citiesModal }),
    
    airlinesModal: false,
    setAirlinesModal: (airlinesModal) => set({ airlinesModal }),
    
    seasonsModal: false,
    setSeasonsModal: (seasonsModal) => set({ seasonsModal }),
}));
