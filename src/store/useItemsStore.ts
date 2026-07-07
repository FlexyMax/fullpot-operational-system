import { create } from "zustand";

interface ItemsState {
    // ── Page ──────────────────────────────────────────────────────────────────
    activeTab: 1 | 2 | 3;
    setActiveTab: (tab: 1 | 2 | 3) => void;

    // ── Tab1 (Hierarchy) ──────────────────────────────────────────────────────
    t1ClassSearch:    string;
    setT1ClassSearch: (s: string) => void;
    t1SelSubclass:    any | null;
    setT1SelSubclass: (v: any | null) => void;
    t1SelVariety:     any | null;
    setT1SelVariety:  (v: any | null) => void;
    t1SelGrade:       any | null;
    setT1SelGrade:    (v: any | null) => void;
    t1SelColor:       any | null;
    setT1SelColor:    (v: any | null) => void;
    t1SelCase:        any | null;
    setT1SelCase:     (v: any | null) => void;

    // ── Tab2 (All Products) ───────────────────────────────────────────────────
    t2Search:        string;
    setT2Search:     (s: string) => void;
    t2SelProduct:    any | null;
    setT2SelProduct: (p: any | null) => void;

    // ── Tab3 (Varieties / Components) ─────────────────────────────────────────
    t3Search:           string;
    setT3Search:        (s: string) => void;
    t3SelComponent:     any | null;
    setT3SelComponent:  (c: any | null) => void;
}

export const useItemsStore = create<ItemsState>((set) => ({
    // ── Page ──────────────────────────────────────────────────────────────────
    activeTab:    1,
    setActiveTab: (activeTab) => set({ activeTab }),

    // ── Tab1 ──────────────────────────────────────────────────────────────────
    t1ClassSearch:    "",
    setT1ClassSearch: (t1ClassSearch)  => set({ t1ClassSearch }),
    t1SelSubclass:    null,
    setT1SelSubclass: (t1SelSubclass)  => set({ t1SelSubclass }),
    t1SelVariety:     null,
    setT1SelVariety:  (t1SelVariety)   => set({ t1SelVariety }),
    t1SelGrade:       null,
    setT1SelGrade:    (t1SelGrade)     => set({ t1SelGrade }),
    t1SelColor:       null,
    setT1SelColor:    (t1SelColor)     => set({ t1SelColor }),
    t1SelCase:        null,
    setT1SelCase:     (t1SelCase)      => set({ t1SelCase }),

    // ── Tab2 ──────────────────────────────────────────────────────────────────
    t2Search:        "",
    setT2Search:     (t2Search)        => set({ t2Search }),
    t2SelProduct:    null,
    setT2SelProduct: (t2SelProduct)    => set({ t2SelProduct }),

    // ── Tab3 ──────────────────────────────────────────────────────────────────
    t3Search:          "",
    setT3Search:       (t3Search)       => set({ t3Search }),
    t3SelComponent:    null,
    setT3SelComponent: (t3SelComponent) => set({ t3SelComponent }),
}));
