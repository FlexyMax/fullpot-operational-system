import { create } from "zustand";

interface PaymentAuthorizationsState {
    lcgrower_uq:    string;
    lcgrower:       string;
    lcoutcome_uq:   string;
    lcapd_uq:       string;
    lcap_uq:        string;
    ldPaymentsFrom: string;
    lnclose:        number;
    llbalance:      "pos" | "zero" | "all";

    setGrowerUq:        (uq: string, name?: string) => void;
    setOutcomeUq:       (uq: string) => void;
    setApdUq:           (uq: string) => void;
    setApUq:            (uq: string) => void;
    setLdPaymentsFrom:  (date: string) => void;
    setLnclose:         (n: number) => void;
    setLlbalance:       (b: "pos" | "zero" | "all") => void;
    reset:              () => void;
}

const currentYearStart = `${new Date().getFullYear()}-01-01`;

const defaults = {
    lcgrower_uq:    "",
    lcgrower:       "",
    lcoutcome_uq:   "",
    lcapd_uq:       "",
    lcap_uq:        "",
    ldPaymentsFrom: currentYearStart,
    lnclose:        -1,
    llbalance:      "pos" as const,
};

export const usePaymentAuthorizationsStore = create<PaymentAuthorizationsState>((set) => ({
    ...defaults,

    setGrowerUq:       (uq, name = "") => set({ lcgrower_uq: uq, lcgrower: name, lcoutcome_uq: "", lcapd_uq: "", lcap_uq: "" }),
    setOutcomeUq:      (uq)            => set({ lcoutcome_uq: uq }),
    setApdUq:          (uq)            => set({ lcapd_uq: uq }),
    setApUq:           (uq)            => set({ lcap_uq: uq }),
    setLdPaymentsFrom: (date)          => set({ ldPaymentsFrom: date }),
    setLnclose:        (n)             => set({ lnclose: n }),
    setLlbalance:      (b)             => set({ llbalance: b }),
    reset:             ()              => set(defaults),
}));
