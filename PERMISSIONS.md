# FOS — Page-Level Permission System

## Overview

Each screen in FOS enforces row-level permissions stored in the `usuarios_accesos` table in the SISTEMA database. This system was migrated from the VFP legacy application where every screen inherited from a base class (`clas_sil.vcx / pantalla`) that read `c_user_access` on load.

---

## How It Works

### 1. Database Layer

**Table:** `usuarios_accesos` (SISTEMA DB)

| Column | Type | Description |
|--------|------|-------------|
| `unico` | char(8) | PK of the permissions record |
| `user_uq` | char(8) | FK → `usuarios.unico` (who) |
| `empresa_uq` | char(8) | FK → `empresas.unico` (which company) |
| `panta_uq` | char(8) | FK → `pantalla.unico` (which screen) |
| `acceso` | bit | Can access the screen |
| `crear` | bit | Can add/create records |
| `editar` | bit | Can edit/modify records |
| `borrar` | bit | Can delete records |
| `consultar` | bit | Can query/view data |
| `reportes` | bit | Can print/export |

**Important:** A user's permissions are set in the **System Access** screen (`/system/access`). When the Edit button is pressed there, the system calls `sp_sistema_accesos_insertar_otros` and (if ADMINISTRADOR) `sp_sistema_accesos_insertar_administrador` to ensure all current screens have a row in `usuarios_accesos` for that user.

---

### 2. API Endpoint

**`GET /api/system/permissions?panta_uq=XXXXXXXX`**

- Reads `user_uq` from the JWT session (never from the frontend request)
- Queries `usuarios_accesos WHERE user_uq = ? AND panta_uq = ?`
- Returns all 6 permission booleans

**Fail-open behavior:** If no record found (new page not yet registered), returns `true` for all permissions to prevent accidental lockouts. Register the page in Module & Screen Setup to enforce real permissions.

```json
{
  "acceso":    true,
  "crear":     true,
  "editar":    false,
  "borrar":    false,
  "consultar": true,
  "reportes":  true,
  "source":    "usuarios_accesos"
}
```

---

### 3. React Hook

**`usePagePermissions(pageKey: string): PagePermissions`**

Defined in `src/lib/permissions.ts`.

```tsx
import { usePagePermissions, PERMISSION_MSGS } from "@/lib/permissions";

export default function MyPage() {
    const perms = usePagePermissions("customers-setup");

    // Use in GridMenu:
    <GridMenu items={[
        { label:"Add",    disabled: !perms.canCreate  },
        { label:"Edit",   disabled: !perms.canEdit    },
        { label:"Delete", disabled: !perms.canDelete  },
        { label:"Export", disabled: !perms.canReport  },
    ]} />

    // Show denial message:
    const handleAdd = () => {
        if (!perms.canCreate) { setError(PERMISSION_MSGS.create); return; }
        // ... proceed
    };
}
```

**Returns `PagePermissions`:**

```ts
interface PagePermissions {
    canAccess:  boolean;  // acceso
    canCreate:  boolean;  // crear
    canEdit:    boolean;  // editar
    canDelete:  boolean;  // borrar
    canQuery:   boolean;  // consultar
    canReport:  boolean;  // reportes
    loading:    boolean;
    source?:    string;   // debug info
}
```

**Cache:** 5 minutes stale time — permissions don't change during normal usage.

---

### 4. Standard Denial Messages

Defined in `PERMISSION_MSGS` (matches VFP originals):

| Key | Message |
|-----|---------|
| `create` | "You are not authorized to create new records in this screen. / Usted no está autorizado a crear registros en esta pantalla." |
| `edit` | "You are not authorized to modify records in this screen. / Usted no está autorizado a modificar registros en esta pantalla." |
| `delete` | "You are not authorized to delete records in this screen. / Usted no está autorizado a borrar registros en esta pantalla." |
| `report` | "Access Denied. / Acceso Denegado." |
| `access` | "You are not authorized to access this screen. / Usted no está autorizado a acceder a esta pantalla." |

---

## Screen → Pantalla Mapping

Defined in `SCREEN_PANTA` in `src/lib/permissions.ts`.

| Page Key | `panta_uq` | Screen Name (pantalla table) |
|----------|-----------|------------------------------|
| `sales` | `XD6Z7051` | APP Sales Orders |
| `accounts-payable` | `XD6Z7067` | APP A-P |
| `accounts-receivable` | `XD6Z7054` | APP A-R |
| `customers-setup` | `HWCM1581` | CUSTOMERS DEFINITION |
| `carriers-definition` | `XD6Z7048` | APP Carriers Center |
| `freights-setup` | `XD6Z7048` | APP Carriers Center (shared) |
| `module-screen-setup` | `52961702` | MODULES SETUP |
| `users-definition` | `52961702` | fallback (see below) |
| `access-definition` | `52961702` | fallback (see below) |
| `companies-definition` | `52961702` | fallback (see below) |

> **Fallback pages** (`52961702`): Pages that don't yet have a dedicated row in the `pantalla` table use the MODULES SETUP screen as a proxy. To enforce real permissions, register each page in **Module & Screen Setup**, note the generated `unico`, and update the mapping.

---

## Pages Integrated (as of 2026-05-16)

| Page | File | Permission checks applied |
|------|------|--------------------------|
| Accounts Payable | `accounts-payable/page.tsx` | Add/Edit/Delete invoice, Cr/Db, POB; CSV export |
| Customers Setup | `masters/customers/page.tsx` | Customer, ShipTo, Carrier, WebUser, Message CRUD; CSV export |
| System Access | `system/access/page.tsx` | Edit permissions, Save |
| User Setup | `system/users/page.tsx` | Add/Edit/Delete user |
| Module & Screen Setup | `system/modules/page.tsx` | Module Add/Edit/Delete; Screen Add/Edit/Remove |
| Freights & Handling | `masters/freights/page.tsx` | Warehouse, Freight, Handling, ATPDA CRUD; Copy; Update AWBs |
| Companies Definition | `system/companies/page.tsx` | Add/Edit company |
| Carriers Definition | `masters/carriers/page.tsx` | Add/Edit/Delete carrier; Other Settings |

---

## Adding Permissions to a New Page

1. **Create the screen in Module & Screen Setup** — note the auto-generated `unico`
2. **Add the mapping** in `src/lib/permissions.ts`:
   ```ts
   export const SCREEN_PANTA: Record<string, string> = {
       "my-new-page": "XXXXXXXX",  // unico from pantalla table
   };
   ```
3. **Also update** `src/lib/audit.ts` PANTA map (audit uses the same unico)
4. **Use the hook** in the page:
   ```tsx
   const perms = usePagePermissions("my-new-page");
   ```
5. **Apply to buttons:**
   ```tsx
   <GridMenu items={[
       { label:"Add",    icon:Plus,   color:"green", onClick:handleAdd,    disabled: !perms.canCreate  },
       { label:"Edit",   icon:Pencil, color:"blue",  onClick:handleEdit,   disabled: !perms.canEdit    },
       { label:"Delete", icon:Trash2, color:"red",   onClick:handleDelete, disabled: !perms.canDelete  },
       { label:"Export", icon:Download,color:"gray", onClick:handleExport, disabled: !perms.canReport  },
   ]} />
   ```
6. **Run `sp_sistema_accesos_insertar_otros`** for all users via System Access → Edit button — this creates the permission rows for the new screen

---

## Permission Initialization

When an administrator presses **Edit** in the System Access screen:

1. `POST /api/system/access/initialize` is called
2. `sp_sistema_accesos_insertar_otros @lcuser_uq` runs — inserts rows for all screens in `pantalla` that don't yet have a row for this user
3. If the user is ADMINISTRADOR: `sp_sistema_accesos_insertar_administrador @lcuser_uq` also runs (grants full access)
4. The admin can then toggle individual permissions per screen

**This means:** After adding a new screen to the `pantalla` table, administrators must press Edit in System Access for each user to generate their permission rows.

---

## Security Notes

- `user_uq` is **always extracted from the JWT on the server side** — never trusted from the frontend request body
- The API endpoint requires a valid session (401 if not authenticated)
- Fail-open on DB errors: if `usuarios_accesos` query fails, full access is returned (logged to server console) — prevents users from being locked out due to DB issues
- The 5-minute cache means permission changes in System Access take up to 5 minutes to propagate to active sessions
