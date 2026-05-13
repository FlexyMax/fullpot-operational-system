import { create } from "zustand";
import { currentYearEST, todayEST } from "@/lib/dates";

interface APState {
    selectedYear:     number;
    selectedDate:     string | null;   // YYYY-MM-DD
    selectedUnico:    string | null;   // PK of selected invoice
    selectedGrowerUq: string | null;
    selectedCrdbUq:   string | null;

    setYear:          (year: number) => void;
    setDate:          (date: string | null) => void;
    setUnico:         (unico: string | null) => void;
    setGrowerUq:      (uq: string | null) => void;
    setCrdbUq:        (uq: string | null) => void;
    resetSelection:   () => void;
}

export const useAPStore = create<APState>((set) => ({
    selectedYear:     currentYearEST(),
    selectedDate:     null,
    selectedUnico:    null,
    selectedGrowerUq: null,
    selectedCrdbUq:   null,

    setYear:      (year)  => set({ selectedYear: year, selectedDate: null, selectedUnico: null }),
    setDate:      (date)  => set({ selectedDate: date, selectedUnico: null }),
    setUnico:     (unico) => set({ selectedUnico: unico }),
    setGrowerUq:  (uq)    => set({ selectedGrowerUq: uq }),
    setCrdbUq:    (uq)    => set({ selectedCrdbUq: uq }),
    resetSelection: ()    => set({ selectedDate: null, selectedUnico: null, selectedGrowerUq: null, selectedCrdbUq: null }),
}));
