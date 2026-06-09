import { create } from "zustand";

interface CompanyState {
    selCompanyUnico: string | null;
    activeGrid: "company" | null;
    companySearch: string;
    mobileCompanyOpen: boolean;

    setSelCompanyUnico: (unico: string | null) => void;
    clearSelection: () => void;
    setCompanySearch: (search: string) => void;
    setMobileCompanyOpen: (open: boolean) => void;
}

export const useCompanyStore = create<CompanyState>((set) => ({
    selCompanyUnico: null,
    activeGrid: null,
    companySearch: "",
    mobileCompanyOpen: false,

    setSelCompanyUnico: (unico) => set({ selCompanyUnico: unico, activeGrid: unico ? "company" : null }),
    clearSelection: () => set({ activeGrid: null, selCompanyUnico: null }),
    setCompanySearch: (search) => set({ companySearch: search }),
    setMobileCompanyOpen: (open) => set({ mobileCompanyOpen: open }),
}));
