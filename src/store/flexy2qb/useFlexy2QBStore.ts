import { create } from "zustand";

interface Flexy2QBState {
    canWrite: boolean;
    setCanWrite: (v: boolean) => void;
    refreshTrigger: number;
    triggerRefresh: () => void;
    activeGrid: string | null;
    setActiveGrid: (grid: string | null) => void;
}

export const useFlexy2QBStore = create<Flexy2QBState>((set) => ({
    canWrite: true,
    setCanWrite: (v) => set({ canWrite: v }),
    refreshTrigger: 0,
    triggerRefresh: () => set((s) => ({ refreshTrigger: s.refreshTrigger + 1 })),
    activeGrid: null,
    setActiveGrid: (grid) => set({ activeGrid: grid }),
}));
