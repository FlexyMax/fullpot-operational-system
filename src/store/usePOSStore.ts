import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface POSState {
    // Persisted across navigations
    salesmanUq:          string;
    salesmanName:        string;
    userUq:              string;  // sp_flower_salesman_uq → user_uq (needed by several SPs)
    physicalWarehouseUq: string;  // sp_flower_salesman_uq → wphysical_uq (default warehouse for stock)
    activeInvoiceUq:     string | null;
    invoiceDate:         string; // YYYY-MM-DD

    setSalesmanInfo:    (uq: string, name: string, userUq: string, physicalUq: string) => void;
    setActiveInvoiceUq: (uq: string | null) => void;
    setInvoiceDate:     (date: string)      => void;
    clearInvoice:       () => void;
}

export const usePOSStore = create<POSState>()(
    persist(
        (set) => ({
            salesmanUq:          "",
            salesmanName:        "",
            userUq:              "",
            physicalWarehouseUq: "",
            activeInvoiceUq:     null,
            invoiceDate:         new Date().toISOString().split("T")[0],

            setSalesmanInfo:    (uq, name, userUq, physicalUq) =>
                set({ salesmanUq: uq, salesmanName: name, userUq, physicalWarehouseUq: physicalUq }),
            setActiveInvoiceUq: (uq)   => set({ activeInvoiceUq: uq }),
            setInvoiceDate:     (date) => set({ invoiceDate: date }),
            clearInvoice:       ()     => set({ activeInvoiceUq: null }),
        }),
        { name: 'pos-storage' }
    )
);
