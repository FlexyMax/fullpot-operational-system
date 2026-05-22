"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface QCState {
  // Global IDs
  lcLogRecordID:     string; setLcLogRecordID:     (v: string)  => void;
  lcPackBoxID:       string; setLcPackBoxID:       (v: string)  => void;
  lcQCID:            string; setLcQCID:            (v: string)  => void;
  lcWarehouse_uq:    string; setLcWarehouse_uq:    (v: string)  => void;

  // Operation modes: 'C' = Insert, 'E' = Edit, 'R' = Read
  lcOperationStock:  string; setLcOperationStock:  (v: string)  => void;
  lcOperationQC:     string; setLcOperationQC:     (v: string)  => void;

  // Misc
  lnBoxQty:          number; setLnBoxQty:          (v: number)  => void;

  // Permission flags (set by page.tsx from perms)
  canCreate: boolean; setCanCreate: (v: boolean) => void;
  canEdit:   boolean; setCanEdit:   (v: boolean) => void;
  canDelete: boolean; setCanDelete: (v: boolean) => void;

  // Global refresh trigger
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const QCContext = createContext<QCState | undefined>(undefined);

export function QCProvider({ children }: { children: ReactNode }) {
  const [lcLogRecordID,   setLcLogRecordID]   = useState("");
  const [lcPackBoxID,     setLcPackBoxID]     = useState("");
  const [lcQCID,          setLcQCID]          = useState("");
  const [lcWarehouse_uq,  setLcWarehouse_uq]  = useState("");
  const [lcOperationStock,setLcOperationStock]= useState("R");
  const [lcOperationQC,   setLcOperationQC]   = useState("R");
  const [lnBoxQty,        setLnBoxQty]        = useState(0);
  const [canCreate,       setCanCreate]       = useState(true);
  const [canEdit,         setCanEdit]         = useState(true);
  const [canDelete,       setCanDelete]       = useState(true);
  const [refreshTrigger,  setRefreshTrigger]  = useState(0);

  const triggerRefresh = useCallback(() => setRefreshTrigger(p => p + 1), []);

  return (
    <QCContext.Provider value={{
      lcLogRecordID, setLcLogRecordID,
      lcPackBoxID,   setLcPackBoxID,
      lcQCID,        setLcQCID,
      lcWarehouse_uq,setLcWarehouse_uq,
      lcOperationStock, setLcOperationStock,
      lcOperationQC,    setLcOperationQC,
      lnBoxQty,      setLnBoxQty,
      canCreate,     setCanCreate,
      canEdit,       setCanEdit,
      canDelete,     setCanDelete,
      refreshTrigger, triggerRefresh,
    }}>
      {children}
    </QCContext.Provider>
  );
}

export function useQCContext() {
  const ctx = useContext(QCContext);
  if (!ctx) throw new Error("useQCContext must be used within QCProvider");
  return ctx;
}
