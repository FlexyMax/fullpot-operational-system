# FOS — Development Standards for New Pages

> **These are MANDATORY requirements for every new page.** Not optional.
> Established 2026-05-16 after audit found 41 CRUD operations without audit trail.

---

## Quick Checklist — New Page

Before considering a page "done", verify:

- [ ] `useAuditLog` imported and called
- [ ] `usePagePermissions` imported and called
- [ ] Page key registered in `SCREEN_PANTA` (`src/lib/permissions.ts`)
- [ ] Page key registered in `PANTA` (`src/lib/audit.ts`)
- [ ] Every POST/PUT/DELETE success calls `logAction`
- [ ] Every Add/Edit/Delete/Export button uses `perms.can*`
- [ ] Menu routing added in `src/app/menu/page.tsx`
- [ ] Auto-select first record on load (all grids)

---

## Page Template — Copy/Paste Starting Point

```tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { /* lucide icons */ Menu, Plus, Pencil, Trash2, Save, X, RefreshCcw, AlertCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// ── REQUIRED: Audit + Permissions ───────────────────────────────────────────
import { useAuditLog } from "@/lib/audit";
import { AuditLogModal } from "@/components/AuditLogModal";
import { usePagePermissions, PERMISSION_MSGS } from "@/lib/permissions";

export default function MyNewPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const qc = useQueryClient();

    // ── REQUIRED: Both hooks at the top ───────────────────────────────────
    const { logAction } = useAuditLog("my-page-key", "my_table_name");
    const perms = usePagePermissions("my-page-key");

    // ... rest of state ...

    // ── CRUD example — ALWAYS call logAction on success ───────────────────
    const handleSave = async () => {
        // validate...
        try {
            if (mode === "add") {
                const res  = await fetch("/api/...", { method: "POST", ... });
                const data = await res.json();
                if (!data.success) throw new Error(data.error);
                logAction("Insert", data.unico);             // ← REQUIRED
            } else {
                const res  = await fetch(`/api/.../${unico}`, { method: "PUT", ... });
                const data = await res.json();
                if (!data.success) throw new Error(data.error);
                logAction("Edit", unico);                    // ← REQUIRED
            }
        } catch (e: any) { setError(e.message); }
    };

    const handleDelete = async () => {
        try {
            const res  = await fetch(`/api/.../${unico}`, { method: "DELETE" });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            logAction("Delete", unico);                      // ← REQUIRED
        } catch (e: any) { setError(e.message); }
    };

    // ── MENU — always pass perms.can* to disabled ─────────────────────────
    return (
        <div>
            {/* Header with AuditLogModal ← REQUIRED */}
            <div className="h-10 bg-[#374151] ...">
                <span>My Page</span>
                <AuditLogModal recordId={selectedUnico} disabled={!selectedUnico} />
                <GridMenu items={[
                    {
                        label: "Add Record",
                        icon: Plus,
                        color: "green",
                        onClick: () => {
                            if (!perms.canCreate) { setError(PERMISSION_MSGS.create); return; }
                            handleAdd();
                        },
                        disabled: !perms.canCreate,              // ← REQUIRED
                    },
                    {
                        label: "Edit Selected",
                        icon: Pencil,
                        color: "blue",
                        onClick: () => {
                            if (!perms.canEdit) { setError(PERMISSION_MSGS.edit); return; }
                            handleEdit();
                        },
                        disabled: !selectedUnico || !perms.canEdit,  // ← REQUIRED
                    },
                    {
                        label: "Delete Selected",
                        icon: Trash2,
                        color: "red",
                        onClick: () => {
                            if (!perms.canDelete) { setError(PERMISSION_MSGS.delete); return; }
                            handleDelete();
                        },
                        disabled: !selectedUnico || !perms.canDelete, // ← REQUIRED
                    },
                    {
                        label: "Export CSV",
                        icon: Download,
                        color: "gray",
                        onClick: handleExport,
                        disabled: !perms.canReport,              // ← REQUIRED
                    },
                ]} />
            </div>
        </div>
    );
}
```

---

## Step-by-Step: Registering a New Page

### 1. Add to `SCREEN_PANTA` in `src/lib/permissions.ts`

```ts
export const SCREEN_PANTA: Record<string, string> = {
    // ... existing entries ...
    "my-page-key": "XXXXXXXX",  // unico from pantalla table (get from Module & Screen Setup)
};
```

### 2. Add to `PANTA` in `src/lib/audit.ts`

```ts
export const PANTA: Record<string, string> = {
    // ... existing entries ...
    "my-page-key": "XXXXXXXX",  // same unico as above
};
```

### 3. Add menu routing in `src/app/menu/page.tsx`

```ts
function getRoute(appPage: string): string | null {
    const p = appPage.toUpperCase();
    // ... existing routes ...
    if (p.includes('MY MODULE') || p.includes('MI MODULO')) return '/path/to/page';
    return null;
}
```

### 4. Add icon mapping in menu (if needed)

```ts
function getIcon(appPage: string) {
    // ... existing entries ...
    if (n.includes('MY MODULE')) return MyIcon;
}
```

### 5. Initialize permissions for users

After adding the page to `pantalla` table, administrators must:
1. Go to **System Access** (`/system/access`)
2. Select each user
3. Press **Edit** button
4. This runs `sp_sistema_accesos_insertar_otros` which creates permission rows for the new screen
5. Adjust permissions per user as needed

---

## logAction — Usage Reference

```ts
const { logAction } = useAuditLog("page-key", "table_name");

// After INSERT:
logAction("Insert", newUnico);
logAction("Insert", newUnico, "Context Note");   // optional 3rd param

// After UPDATE:
logAction("Edit", existingUnico);
logAction("Edit", existingUnico, "Sub-operation name");

// After DELETE:
logAction("Delete", deletedUnico);

// For sub-operations (e.g. copying, approving):
logAction("Edit", unico, "Copy Freight Rates");
logAction("Edit", unico, "Approve PO Cost");
logAction("Insert", unico, "Copy Bill To ShipTo");
```

**Rules:**
- Always call AFTER confirming the API returned `success: true`
- Always use the `unico` of the affected record (8-char PK)
- The 3rd param (`ext_action`) is free-form text — use it to describe sub-operations
- Fire-and-forget: never await, never block UI on failure

---

## usePagePermissions — Usage Reference

```ts
const perms = usePagePermissions("page-key");

// perms has:
perms.canAccess   // can see the page
perms.canCreate   // can add records
perms.canEdit     // can modify records
perms.canDelete   // can delete records
perms.canQuery    // can query/search
perms.canReport   // can print/export
perms.loading     // true while fetching

// Standard denial messages:
PERMISSION_MSGS.create  → "You are not authorized to create..."
PERMISSION_MSGS.edit    → "You are not authorized to modify..."
PERMISSION_MSGS.delete  → "You are not authorized to delete..."
PERMISSION_MSGS.report  → "Access Denied."
PERMISSION_MSGS.access  → "You are not authorized to access..."
```

**Rules:**
- Always pass `disabled: !perms.canCreate/Edit/Delete/Report` to GridMenu items
- Show `PERMISSION_MSGS.*` when a user tries an unauthorized action
- `perms.loading` is `false` within ~200ms — no need for loading states in most cases
- Cache: 5 minutes. Changes in System Access take up to 5 min to propagate.

---

## Auto-Select First Record (All Grids)

Every page with a list must auto-select the first record on load.
Every sub-grid must auto-select its first record when the parent selection changes.

```ts
// Auto-select first item when list loads
useEffect(() => {
    if ((items as any[]).length > 0 && !selectedUnico) {
        setSelectedUnico((items as any[])[0].unico);
    }
}, [items]);

// Auto-select first child when parent changes (cascade)
useEffect(() => {
    if ((childItems as any[]).length > 0) setSelChild((childItems as any[])[0]);
    else setSelChild(null);
}, [childItems]);
```

---

## API Route Standards

Every API route that performs a write operation should:

1. **Return consistent shape:**
   ```json
   { "success": true, "unico": "XXXXXXXX", "message": "Record created." }
   { "success": false, "error": "Descriptive error message" }
   ```

2. **Check SP error flags:**
   ```ts
   const row = r.recordset[0];
   // Note: db.ts auto-throws when SP returns error=1, so this is a safety net
   if (row?.error) return NextResponse.json({ success: false, error: row.message }, { status: 400 });
   ```

3. **Fail informatively:** Return HTTP 400 for business rule violations, 500 for DB errors.

4. **Never expose:** `password`, `userid`, binary fields (logo, photo) in GET responses.

5. **Server-side audit log after every successful CRUD** — call `serverAuditLog` from `@/lib/serverAudit`
   immediately before the success `return`. Fire-and-forget (`.catch(() => {})`).

   ```ts
   import { serverAuditLog } from "@/lib/serverAudit";

   const PANTA = "XD6Z7067"; // panta_uq for this page (from PANTA map in audit.ts)
   const TABLA = "flower_accounts_pay"; // main table

   // POST — after SP succeeds:
   serverAuditLog(PANTA, "Insert", TABLA, row.unico).catch(() => {});

   // PUT — after SP succeeds:
   serverAuditLog(PANTA, "Edit", TABLA, body.lcunico).catch(() => {});

   // DELETE — after SP succeeds:
   serverAuditLog(PANTA, "Delete", TABLA, unico).catch(() => {});

   // Sub-operations (e.g. approve, copy):
   serverAuditLog(PANTA, "Edit", TABLA, ap_uq, "Approve PO Cost").catch(() => {});
   ```

   **Why server-side instead of (or in addition to) client-side `logAction`:**
   - Server-side fires even if the user closes the tab immediately after the CRUD
   - Cannot be skipped by a direct API call that bypasses the frontend
   - The client-side `logAction` (in `useAuditLog`) remains as a UX convenience — both coexist and both write to bitacora. The duplicate entries are acceptable; they simply show "Edit from browser + Edit from server" for the same record.

   **Reference implementation:** `src/app/api/accounts-payable/invoice/route.ts` (first page to use this pattern).

---

## Currently Implemented Pages (Reference)

| Page Key | Route | Table | panta_uq |
|----------|-------|-------|----------|
| `sales` | `/sales` | flower_invoice | XD6Z7051 |
| `accounts-payable` | `/accounts-payable` | flower_accounts_pay | XD6Z7067 |
| `customers-setup` | `/masters/customers` | flower_customers | HWCM1581 |
| `carriers-definition` | `/masters/carriers` | flower_carriers | XD6Z7048 |
| `freights-setup` | `/masters/freights` | flower_warehouses_physical | XD6Z7048 |
| `module-screen-setup` | `/system/modules` | modulo | 52961702 |
| `users-definition` | `/system/users` | usuarios | 52961702 |
| `access-definition` | `/system/access` | usuarios_accesos | 52961702 |
| `companies-definition` | `/system/companies` | empresas | 52961702 |
| `items-setup` | `/masters/items` | flower_products | 52961702 |
| `business-intelligence` | `/business-intelligence` | flower_store_procedures | 7331ED65 |

---

## File Structure for a New Page

```
src/
  app/
    api/
      [module]/
        [resource]/
          route.ts                   ← GET list, POST create
          [unico]/
            route.ts                 ← GET one, PUT update, DELETE
            [sub-resource]/
              route.ts               ← sub-resource endpoints
        lookups/
          route.ts                   ← all dropdowns in one call
    [module]/
      [page]/
        page.tsx                     ← main page (single file, inline sub-components)

  lib/
    permissions.ts                   ← add to SCREEN_PANTA
    audit.ts                         ← add to PANTA
```

> Keep pages as single `page.tsx` files with inline sub-components.
> Split into separate files only when the file exceeds ~1500 lines.

---

## React Query & Infinite Renders (CRITICAL)

**NEVER** use array literals `[]` or object literals `{}` as default values in `useQuery` destructuring if that data is used as a dependency in `useEffect`, `useMemo`, or passed to components that re-render based on reference equality.

When `data` is `undefined` (while fetching), `const { data = [] } = useQuery(...)` creates a **new array reference on every render**. This causes catastrophic infinite render loops ("Maximum update depth exceeded" / "Application error").

**DO THIS:**
```tsx
const EMPTY_ARR: any[] = []; // Define outside component or top of file

export default function MyPage() {
    const { data: myData = EMPTY_ARR } = useQuery(...);
}
```

**NEVER DO THIS:**
```tsx
export default function MyPage() {
    // ❌ FATAL ERROR: creates new array on every render while loading
    const { data: myData = [] } = useQuery(...); 
}
```

---

## Database Interactions & Store Procedures (CRITICAL)

**MANDATORY RULES FOR DB INTEGRATION:**

1. **ALL Database Interactions MUST use Store Procedures (SPs).** Direct SQL queries (e.g., `SELECT * FROM table`, `INSERT INTO table`) are strictly prohibited in API routes.
2. **Missing SPs:** If a required CRUD operation does not have an existing Store Procedure, DO NOT write a raw SQL query. You must stop and ask the user to provide or create the SP.
3. **Business Rules Validation in SPs:** All CRUD Store Procedures return business rule validations and errors. You must capture the returned dataset from the SP (checking `row.error` — lowercase — and `row.message`) to know if the operation was successful. Do NOT assume success just because the HTTP request or SQL execution didn't throw an exception.
4. **UI Notifications:** All success/error feedback for CRUD operations must be displayed to the user using **Sonner Toasts** (`toast.success` and `toast.error`). Do not use inline `<span>` elements, manual states (`setSaveMsg`), or native browser windows (`alert()`) for operation feedback.

---

## SP Authorization — REQUIRED Before Any SP Change

Before creating, modifying, or deleting any stored procedure:

1. **Explain the change** — SP name, DB, current behavior, proposed change, and reason
2. **Get explicit approval** from the user before executing any CREATE / ALTER / DROP PROCEDURE
3. **Document** — update the SQL file in `sql/[module]/` and add the change to the SP's history comment block

This applies to ALL changes, even minor ones (column order, adding comments, TRY/CATCH). SP changes hit production directly.

---

## SP Standards — Stored Procedure Rules (CRITICAL)

### Return Format

ALL CRUD SPs MUST return exactly this SELECT, in this column order:

```sql
SELECT unico = @lcUnico, message = @lcMessage, error = @llerror
```

Rules:
- **`unico` is ALWAYS the PK of the main table** (never NULL). For INSERT: the new record's unico. For UPDATE/DELETE: the input `@lcUnico` param.
- **`error`** = `0` (success) or `1` (failure). Type `bit`, initialized as `DECLARE @llerror bit = 0`.
- **`message`** = descriptive message. `'Transaction OK'` on success, `ERROR_MESSAGE()` on DB error, custom business rule message on validation failure.
- Column names are **lowercase** — routes read them as `row.unico`, `row.message`, `row.error`.

### SP Body Template

```sql
ALTER PROCEDURE [dbo].[sp_xxx_yyy_insert]
    @lcUnico  char(8),
    @lcNombre varchar(100)
AS
-- ================================================================
-- SP:    sp_xxx_yyy_insert
-- DB:    fullpot | Tabla: xxx_yyy
-- Desc:  Inserta un registro en xxx_yyy
-- Retorna: unico = nuevo registro, message = resultado, error = 0/1
-- Historia: YYYY-MM-DD  Descripcion del cambio
-- ================================================================
SET NOCOUNT ON
DECLARE @llerror bit = 0, @lcMessage varchar(1000) = ''
BEGIN TRY
    -- business logic here
    SET @lcMessage = 'Transaction OK'
END TRY
BEGIN CATCH
    SET @lcMessage = ERROR_MESSAGE()
    SET @llerror = 1
END CATCH
SELECT unico = @lcUnico, message = @lcMessage, error = @llerror
```

### Route Pattern — Checking SP Result

```ts
const r   = await executeProcedure("sp_xxx_yyy_insert", { ... });
const row = r.recordset?.[0] || {};
// Note: db.ts auto-throws when error=1 (before this line executes)
// This check handles edge cases where auto-throw doesn't trigger:
if (row.error) return NextResponse.json({ success: false, error: row.message }, { status: 400 });
return NextResponse.json({ success: true, unico: String(row.unico || "").trim(), message: row.message });
```

### Documentation Requirement

When creating or modifying any SP:
1. **Update/create the SQL file** in `sql/[module]/` (e.g., `sql/customer-payments/ar_payment_detail_sps.sql`)
2. **Add the header comment block** inside the SP body (after the parameters, before SET NOCOUNT)

### `executeProcedure` — DB Selection

```ts
executeProcedure("sp_name", params)        // → fullpot DB (operational)
executeProcedure("sp_name", params, true)  // → sistema DB (system setup)
```

**Cross-DB calls are NOT supported on Azure SQL PaaS.** `sp_sistema_bitacora_insert` (sistema DB) cannot be called from fullpot SPs. For AR pages, the audit trail is handled client-side via `logAction()` → `/api/audit/log`.
