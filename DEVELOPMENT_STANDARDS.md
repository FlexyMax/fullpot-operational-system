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
   if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
   ```

3. **Fail informatively:** Return HTTP 400 for business rule violations, 500 for DB errors.

4. **Never expose:** `password`, `userid`, binary fields (logo, photo) in GET responses.

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
