import { create } from "zustand";

interface ModuleState {
    selModUnico: string | null;
    selScrUnico: string | null;
    modSearch: string;
    mobileModOpen: boolean;

    setSelModUnico: (unico: string | null) => void;
    setSelScrUnico: (unico: string | null) => void;
    setModSearch: (search: string) => void;
    setMobileModOpen: (open: boolean) => void;
}

export const useModuleStore = create<ModuleState>((set) => ({
    selModUnico: null,
    selScrUnico: null,
    modSearch: "",
    mobileModOpen: false,

    setSelModUnico: (unico) => set({ selModUnico: unico, selScrUnico: null }),
    setSelScrUnico: (unico) => set({ selScrUnico: unico }),
    setModSearch: (search) => set({ modSearch: search }),
    setMobileModOpen: (open) => set({ mobileModOpen: open }),
}));
