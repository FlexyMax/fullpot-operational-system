import { create } from "zustand";

interface ModuleState {
    selModUnico: string | null;
    selScrUnico: string | null;
    activeGrid: "module" | "screen" | null;
    modSearch: string;
    mobileModOpen: boolean;

    setSelModUnico: (unico: string | null) => void;
    setSelScrUnico: (unico: string | null) => void;
    clearSelection: () => void;
    setModSearch: (search: string) => void;
    setMobileModOpen: (open: boolean) => void;
}

export const useModuleStore = create<ModuleState>((set) => ({
    selModUnico: null,
    selScrUnico: null,
    activeGrid: null,
    modSearch: "",
    mobileModOpen: false,

    setSelModUnico: (unico) => set({ selModUnico: unico, selScrUnico: null, activeGrid: unico ? "module" : null }),
    setSelScrUnico: (unico) => set({ selScrUnico: unico, activeGrid: unico ? "screen" : "module" }),
    clearSelection: () => set({ activeGrid: null, selModUnico: null, selScrUnico: null }),
    setModSearch: (search) => set({ modSearch: search }),
    setMobileModOpen: (open) => set({ mobileModOpen: open }),
}));
