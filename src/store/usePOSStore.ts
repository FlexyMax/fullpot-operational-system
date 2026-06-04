import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface POSState {
    // Persisted across navigations
    salesmanUq:      string;
    salesmanName:    string;
    activeInvoiceUq: string | null;
    invoiceDate:     string; // YYYY-MM-DD

    setSalesmanUq:      (uq: string)      => void;
    setSalesmanName:    (name: string)    => void;
    setActiveInvoiceUq: (uq: string | null) => void;
    setInvoiceDate:     (date: string)    => void;
    clearInvoice:       () => void;
}

export const usePOSStore = create<POSState>()(
    persist(
        (set) => ({
            salesmanUq:      "",
            salesmanName:    "",
            activeInvoiceUq: null,
            invoiceDate:     new Date().toISOString().split("T")[0],

            setSalesmanUq:      (uq)   => set({ salesmanUq: uq }),
            setSalesmanName:    (name) => set({ salesmanName: name }),
            setActiveInvoiceUq: (uq)   => set({ activeInvoiceUq: uq }),
            setInvoiceDate:     (date) => set({ invoiceDate: date }),
            clearInvoice:       ()     => set({ activeInvoiceUq: null }),
        }),
        { name: 'pos-storage' }
    )
);
