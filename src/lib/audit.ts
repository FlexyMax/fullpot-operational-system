"use client";

import { useEffect } from "react";

// ─── Pantalla unico mapping (from sistema.pantalla table, verified 2026-05-14) ─
export const PANTA: Record<string, string> = {
    "accounts-payable":    "XD6Z7067",  // APP A-P
    "customers-setup":     "XD6Z7045",  // APP Customer Center
    "sales":               "XD6Z7051",  // APP Sales Orders
    "companies-definition": "52961672",  // COMPANY SETUP
    "module-screen-setup": "52961702",  // MODULES SETUP
    "users-definition":    "YK618352",  // SYSTEM USER SETUP
    "access-definition":   "52961680",  // USER ACCESS
    "customer-payments":   "XD6Z7054",  // APP A-R
    "flexy2qb":            "XD6Y7055",  // Flexy2QB (APP A-R)
    "awbs":                "52961702",  // fallback — register ventas_awbs in pantalla table to get real UQ
    "qc":                  "52961702",  // fallback — register QC in pantalla table to get real UQ
    "freights-setup":      "52961702",  // fallback — register dedicated pantalla record
    "items-setup":            "52961702",  // fallback — register dedicated pantalla record
    "payment-authorizations": "52961702",  // fallback — register in pantalla table to get real UQ
    "sales-reps":             "52961702",  // fallback — register in pantalla table to get real UQ
    "vendors":                "52961702",  // fallback — register in pantalla table to get real UQ
    "inventory-entry":        "52961702",  // fallback — register in pantalla table to get real UQ
    "business-intelligence":  "7331ED65",  // BUSINESS INTELLIGENCE (APP A-R)
    // Add new pages here as they are registered in the pantalla table
};

// ─── Fire-and-forget service functions ───────────────────────────────────────

/** Log entry into a page (called on component mount) */
export async function auditEnter(pantaUq: string, tabla: string, extAccion = "N/A") {
    try {
        await fetch("/api/audit/enter", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ panta_uq: pantaUq, tabla, ext_accion: extAccion }),
        });
    } catch (e) { console.warn("[audit/enter]", e); }
}

/** Log exit from a page (called on component unmount — uses sendBeacon for reliability) */
export function auditExit(pantaUq: string, tabla: string, extAccion = "N/A") {
    const payload = JSON.stringify({ panta_uq: pantaUq, tabla, ext_accion: extAccion });
    try {
        const blob = new Blob([payload], { type: "application/json" });
        if (typeof navigator !== "undefined" && navigator.sendBeacon) {
            if (!navigator.sendBeacon("/api/audit/exit", blob)) {
                // Fallback with keepalive
                fetch("/api/audit/exit", { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true }).catch(() => {});
            }
        } else {
            fetch("/api/audit/exit", { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true }).catch(() => {});
        }
    } catch (e) { console.warn("[audit/exit]", e); }
}

/** Log a CRUD operation — call after each successful Insert / Edit / Delete */
export async function auditLog(
    pantaUq: string,
    accion: "Insert" | "Edit" | "Delete",
    tabla: string,
    registro: string,
    extAccion = "N/A"
) {
    try {
        await fetch("/api/audit/log", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ panta_uq: pantaUq, accion, tabla, registro, ext_accion: extAccion }),
        });
    } catch (e) { console.warn("[audit/log]", e); }
}

/** Fetch audit history for a specific record (for the AuditLogModal) */
export async function fetchRecordAudit(recordId: string) {
    const r = await fetch(`/api/audit/record/${recordId}`);
    if (!r.ok) throw new Error("Audit fetch failed");
    return r.json();
}

// ─── React hook ───────────────────────────────────────────────────────────────

/**
 * useAuditLog — drop into any page to automatically log entry/exit
 * and get a `logAction` function for CRUD operations.
 *
 * @param pageKey  - key from PANTA map (e.g. 'customers-setup')
 * @param tabla    - main table of the page (e.g. 'flower_customers')
 */
export function useAuditLog(pageKey: string, tabla: string) {
    const pantaUq = PANTA[pageKey] ?? "        ";

    useEffect(() => {
        auditEnter(pantaUq, tabla);
        return () => auditExit(pantaUq, tabla);
    }, []);   // only on mount/unmount

    const logAction = (
        accion: "Insert" | "Edit" | "Delete",
        registro: string,
        extAccion = "N/A"
    ) => auditLog(pantaUq, accion, tabla, registro, extAccion);

    return { logAction };
}
