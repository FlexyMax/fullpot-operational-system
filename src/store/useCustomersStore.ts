import { create } from "zustand";

interface CustomersState {
    search: string;
    setSearch: (search: string) => void;
    selCust: any | null;
    setSelCust: (cust: any | null) => void;
    selShipto: any | null;
    setSelShipto: (shipto: any | null) => void;
    selCarrier: any | null;
    setSelCarrier: (carrier: any | null) => void;
    selWebUser: any | null;
    setSelWebUser: (user: any | null) => void;
    selMessage: any | null;
    setSelMessage: (msg: any | null) => void;
    
    activeExpTab: "shipto" | "statement" | "webusers" | "messages";
    setActiveExpTab: (tab: "shipto" | "statement" | "webusers" | "messages") => void;
    
    custModal: { mode: "add" | "edit" | "delete" } | null;
    setCustModal: (modal: { mode: "add" | "edit" | "delete" } | null) => void;
    
    shiptoModal: { mode: "add" | "edit" | "delete" } | null;
    setShiptoModal: (modal: { mode: "add" | "edit" | "delete" } | null) => void;
    
    carrierModal: { mode: "add" | "edit" | "delete" } | null;
    setCarrierModal: (modal: { mode: "add" | "edit" | "delete" } | null) => void;
    
    webUserModal: { mode: "add" | "edit" | "delete" } | null;
    setWebUserModal: (modal: { mode: "add" | "edit" | "delete" } | null) => void;
    
    msgModal: boolean;
    setMsgModal: (open: boolean) => void;
    
    stmtModal: boolean;
    setStmtModal: (open: boolean) => void;
    
    custModalTab: "general" | "financial" | "delivery";
    setCustModalTab: (tab: "general" | "financial" | "delivery") => void;
    
    expandedCustUnico: string | null;
    setExpandedCustUnico: (unico: string | null) => void;
    
    expandedShiptoUnico: string | null;
    setExpandedShiptoUnico: (unico: string | null) => void;
}

export const useCustomersStore = create<CustomersState>((set) => ({
    search: "",
    setSearch: (search) => set({ search }),
    selCust: null,
    setSelCust: (selCust) => set({ selCust }),
    selShipto: null,
    setSelShipto: (selShipto) => set({ selShipto }),
    selCarrier: null,
    setSelCarrier: (selCarrier) => set({ selCarrier }),
    selWebUser: null,
    setSelWebUser: (selWebUser) => set({ selWebUser }),
    selMessage: null,
    setSelMessage: (selMessage) => set({ selMessage }),
    
    activeExpTab: "shipto",
    setActiveExpTab: (activeExpTab) => set({ activeExpTab }),
    
    custModal: null,
    setCustModal: (custModal) => set({ custModal }),
    
    shiptoModal: null,
    setShiptoModal: (shiptoModal) => set({ shiptoModal }),
    
    carrierModal: null,
    setCarrierModal: (carrierModal) => set({ carrierModal }),
    
    webUserModal: null,
    setWebUserModal: (webUserModal) => set({ webUserModal }),
    
    msgModal: false,
    setMsgModal: (msgModal) => set({ msgModal }),
    
    stmtModal: false,
    setStmtModal: (stmtModal) => set({ stmtModal }),
    
    custModalTab: "general",
    setCustModalTab: (custModalTab) => set({ custModalTab }),
    
    expandedCustUnico: null,
    setExpandedCustUnico: (expandedCustUnico) => set({ expandedCustUnico }),
    
    expandedShiptoUnico: null,
    setExpandedShiptoUnico: (expandedShiptoUnico) => set({ expandedShiptoUnico }),
}));
