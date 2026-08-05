"use client";

/**
 * Page-level Permission System
 * ─────────────────────────────────────────────────────────────────────────────
 * Each screen in FOS maps to a `panta_uq` (unico from the `pantalla` table in
 * SISTEMA database). The `usuarios_accesos` table stores what each user can do
 * on each screen.
 *
 * Permission fields (all boolean):
 *   acceso   - can access the screen at all
 *   crear    - can add / create records           → controls Add buttons
 *   editar   - can modify existing records        → controls Edit buttons
 *   borrar   - can delete records                 → controls Delete buttons
 *   consultar - can query / view data             → controls visibility of data
 *   reportes  - can print / export               → controls Print/CSV/Export buttons
 *
 * Standard denial messages (matches VFP originals):
 *   canCreate  = false → PERMISSION_MSGS.create
 *   canEdit    = false → PERMISSION_MSGS.edit
 *   canDelete  = false → PERMISSION_MSGS.delete
 *   canReport  = false → PERMISSION_MSGS.report
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * PANTALLA MAP
 * Maps a readable page key to the `panta_uq` stored in `pantalla` table.
 * These were verified against the SISTEMA DB on 2026-05-16.
 *
 * To register a new page:
 *   1. Add a row to the `pantalla` table in SISTEMA (via Module & Screen Setup)
 *   2. Add the mapping here: "page-key": "UNICO8CH"
 *   3. Add the same key to PANTA in lib/audit.ts
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

// ─── Pantalla unico map (verified against SISTEMA DB) ─────────────────────────
export const SCREEN_PANTA: Record<string, string> = {
    // ── Sales & Commerce ───────────────────────────────────────────────────
    "sales":                "XD6Z7051",  // APP Sales Orders
    "accounts-payable":     "XD6Z7067",  // APP A-P
    "accounts-receivable":  "XD6Z7054",  // APP A-R

    // ── Accounts Receivable ────────────────────────────────────────────────
    "customer-payments":    "XD6Z7054",  // APP A-R
    "flexy2qb":             "XD6Y7055",  // Flexy2QB (APP A-R)

    // ── Air Waybills ──────────────────────────────────────────────────────
    "awbs":                 "57BF4FC7",  // APP AWBS

    // ── Quality Control ────────────────────────────────────────────────
    "qc":                   "XD6Z7053",  // APP QC

    // ── Masters ────────────────────────────────────────────────────────────
    "customers-setup":      "HWCM1581",  // CUSTOMERS DEFINITION
    "carriers-definition":  "XD6Z7048",  // APP Carriers Center
    "freights-setup":       "XD6Z7048",  // APP Carriers Center (shared, closest match)
    "items-setup":          "52961700",  // INVENTORY CONTROL (closest match — register dedicated record if needed)

    // ── System Management ──────────────────────────────────────────────────
    "module-screen-setup":  "52961702",  // MODULES SETUP
    "users-definition":     "YK618352",  // SYSTEM USER SETUP
    "access-definition":    "52961680",  // USER ACCESS
    "companies-definition": "52961672",  // COMPANY SETUP

    "payment-authorizations": "B3728C98",  // APP Payment Authorizations

    "sales-reps":             "XD6Z7062",  // APP Salesmen

    "vendors":                "XD6Z7046",  // APP Vendors Center

    "inventory-entry":        "XD6Z7050",  // APP Inventory

    "business-intelligence":  "7331ED65",  // BUSINESS INTELLIGENCE (APP A-R)

    "standing-orders":        "XD6Z7064",  // APP Standing Orders
    "scan":                   "912BB18D",  // APP Physical Scan
    "scan-out":               "XD6Z7058",  // APP Scan Out
    "scan-in":                "CC10436A",  // APP Scan IN AWB

    "automatic-charges":    "1E2123EC",  // INVOICE AUTOMATIC CHARGES (APP Sales)

    // Add new pages here after registering in Module & Screen Setup
};

// ─── Standard denial messages ──────────────────────────────────────────────────
export const PERMISSION_MSGS = {
    create:  "You are not authorized to create new records in this screen. / Usted no está autorizado a crear registros en esta pantalla.",
    edit:    "You are not authorized to modify records in this screen. / Usted no está autorizado a modificar registros en esta pantalla.",
    delete:  "You are not authorized to delete records in this screen. / Usted no está autorizado a borrar registros en esta pantalla.",
    report:  "Access Denied. / Acceso Denegado.",
    access:  "You are not authorized to access this screen. / Usted no está autorizado a acceder a esta pantalla.",
} as const;

// ─── Permission type ───────────────────────────────────────────────────────────
export interface PagePermissions {
    canAccess:  boolean;
    canCreate:  boolean;
    canEdit:    boolean;
    canDelete:  boolean;
    canQuery:   boolean;
    canReport:  boolean;
    loading:    boolean;
    /** Raw source for debugging: "usuarios_accesos" | "not_found_default_full" | etc. */
    source?:    string;
}

const FULL_ACCESS: PagePermissions = {
    canAccess: true, canCreate: true, canEdit: true,
    canDelete: true, canQuery: true, canReport: true,
    loading: false, source: "default_full",
};

// ─── Hook ───────────────────────────────────────────────────────────────────────
/**
 * usePagePermissions — React hook to get the current user's permissions for a page.
 *
 * @param pageKey  - Key from SCREEN_PANTA map (e.g. "customers-setup")
 * @returns PagePermissions object with boolean flags + loading state
 *
 * Usage:
 * ```tsx
 * const perms = usePagePermissions("customers-setup");
 *
 * // In GridMenu:
 * { label:"Add", ..., disabled: !perms.canCreate }
 *
 * // Show denial message:
 * if (!perms.canCreate) setError(PERMISSION_MSGS.create);
 * ```
 *
 * Behavior when no record found (new page not yet in usuarios_accesos):
 * Returns full access (fail open) to prevent accidental lockouts.
 * Register the page in Module & Screen Setup to enforce real permissions.
 */
export function usePagePermissions(pageKey: string): PagePermissions {
    const pantaUq = SCREEN_PANTA[pageKey];
    const { data: session } = useSession();
    // Include user ID in the key so cache is scoped per user, not shared across sessions
    const userId = (session?.user as any)?.id ?? "";

    const { data, isLoading } = useQuery({
        queryKey:  ["page-perms", pageKey, pantaUq, userId],
        queryFn:   () => fetch(`/api/system/permissions?panta_uq=${pantaUq || ""}`).then(r => r.json()),
        staleTime: 1000 * 60 * 5,   // 5 minutes — permissions don't change often
        retry:     false,
        enabled:   !!userId,         // Don't query until user is resolved
    });

    if (isLoading || !data) return { ...FULL_ACCESS, loading: true };

    return {
        canAccess:  Boolean(data.acceso),
        canCreate:  Boolean(data.crear),
        canEdit:    Boolean(data.editar),
        canDelete:  Boolean(data.borrar),
        canQuery:   Boolean(data.consultar),
        canReport:  Boolean(data.reportes),
        loading:    false,
        source:     data.source,
    };
}
