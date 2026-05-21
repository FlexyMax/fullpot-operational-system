"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface Flexy2QBState {
  // Packing Box (Purchases2QB)
  lcPack_uq: string;
  setLcPack_uq: (val: string) => void;
  llBillReady: boolean;
  setLlBillReady: (val: boolean) => void;

  // OCharges
  lcOchargesType: string;
  setLcOchargesType: (val: string) => void;
  lcBillID: string;
  setLcBillID: (val: string) => void;

  // Vendor Credits
  lcVendorCreditId: string;
  setLcVendorCreditId: (val: string) => void;
  llVendorCreditReady: boolean;
  setLlVendorCreditReady: (val: boolean) => void;
  llVendorSentByDate: boolean;
  setLlVendorSentByDate: (val: boolean) => void;

  // Invoices (Sales2QB)
  lcInvoiceID: string;
  setLcInvoiceID: (val: string) => void;
  ldInvoiceDate: Date | null;
  setLdInvoiceDate: (val: Date | null) => void;
  llInvoiceReady: boolean;
  setLlInvoiceReady: (val: boolean) => void;
  llCustomerReady: boolean;
  setLlCustomerReady: (val: boolean) => void;

  // Customer Credits
  lcCustomerCreditId: string;
  setLcCustomerCreditId: (val: string) => void;
  llCustomerCreditReady: boolean;
  setLlCustomerCreditReady: (val: boolean) => void;
  ldCustomerCreditDate: Date | null;
  setLdCustomerCreditDate: (val: Date | null) => void;
  llCustomerSentByDate: boolean;
  setLlCustomerSentByDate: (val: boolean) => void;

  // Payments
  lcPaymentID: string;
  setLcPaymentID: (val: string) => void;
  llPaymentReady: boolean;
  setLlPaymentReady: (val: boolean) => void;
  llPaymentSentByDate: boolean;
  setLlPaymentSentByDate: (val: boolean) => void;

  // Permission gate — set by page.tsx once perms load
  canWrite: boolean;
  setCanWrite: (val: boolean) => void;

  // Trigger for refreshing tables after actions
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const Flexy2QBContext = createContext<Flexy2QBState | undefined>(undefined);

export function Flexy2QBProvider({ children }: { children: ReactNode }) {
  const [lcPack_uq, setLcPack_uq] = useState("");
  const [llBillReady, setLlBillReady] = useState(false);

  const [lcOchargesType, setLcOchargesType] = useState("");
  const [lcBillID, setLcBillID] = useState("");

  const [lcVendorCreditId, setLcVendorCreditId] = useState("");
  const [llVendorCreditReady, setLlVendorCreditReady] = useState(false);
  const [llVendorSentByDate, setLlVendorSentByDate] = useState(false);

  const [lcInvoiceID, setLcInvoiceID] = useState("");
  const [ldInvoiceDate, setLdInvoiceDate] = useState<Date | null>(null);
  const [llInvoiceReady, setLlInvoiceReady] = useState(false);
  const [llCustomerReady, setLlCustomerReady] = useState(false);

  const [lcCustomerCreditId, setLcCustomerCreditId] = useState("");
  const [llCustomerCreditReady, setLlCustomerCreditReady] = useState(false);
  const [ldCustomerCreditDate, setLdCustomerCreditDate] = useState<Date | null>(null);
  const [llCustomerSentByDate, setLlCustomerSentByDate] = useState(false);

  const [lcPaymentID, setLcPaymentID] = useState("");
  const [llPaymentReady, setLlPaymentReady] = useState(false);
  const [llPaymentSentByDate, setLlPaymentSentByDate] = useState(false);

  const [canWrite,      setCanWrite]      = useState(true); // fail open; page.tsx sets real value
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = React.useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return (
    <Flexy2QBContext.Provider
      value={{
        lcPack_uq, setLcPack_uq,
        llBillReady, setLlBillReady,
        lcOchargesType, setLcOchargesType,
        lcBillID, setLcBillID,
        lcVendorCreditId, setLcVendorCreditId,
        llVendorCreditReady, setLlVendorCreditReady,
        llVendorSentByDate, setLlVendorSentByDate,
        lcInvoiceID, setLcInvoiceID,
        ldInvoiceDate, setLdInvoiceDate,
        llInvoiceReady, setLlInvoiceReady,
        llCustomerReady, setLlCustomerReady,
        lcCustomerCreditId, setLcCustomerCreditId,
        llCustomerCreditReady, setLlCustomerCreditReady,
        ldCustomerCreditDate, setLdCustomerCreditDate,
        llCustomerSentByDate, setLlCustomerSentByDate,
        lcPaymentID, setLcPaymentID,
        llPaymentReady, setLlPaymentReady,
        llPaymentSentByDate, setLlPaymentSentByDate,
        canWrite, setCanWrite,
        refreshTrigger, triggerRefresh,
      }}
    >
      {children}
    </Flexy2QBContext.Provider>
  );
}

export function useFlexy2QBContext() {
  const context = useContext(Flexy2QBContext);
  if (context === undefined) {
    throw new Error("useFlexy2QBContext must be used within a Flexy2QBProvider");
  }
  return context;
}
