---
name: vfp-migration
description: Migration checklist for VFP / Sencha / Appsmith screens — run through every section before marking a page as complete.
---

# VFP / Appsmith Migration Checklist

Use this skill whenever migrating a screen from Visual FoxPro, Sencha, or Appsmith to the Next.js FOS app.
Work through every section in order. Do not skip items — each one maps to a real bug pattern found in production.

---

## PHASE 1 — Discovery (before writing any code)

### 1.1 Review original functionality

Before opening any editor, inspect the source system:

**VFP (.scx / .prg)**
- Open the `.scx` form in VFP or read the `.prg` to identify: buttons and their `Click` procedures, modal sub-forms called from each button, queries run on each event, reports (`.frx`) triggered.
- Document each action as: *trigger → data operation → visual result*.

**Appsmith / Sencha**
- Note: which tables/SPs each API call hits, what each button does, what each modal contains, what each report exports.

Deliverable: a plain list of *all* buttons + *all* modals + *all* reports the original screen has, before writing a single line of code.

### 1.2 Verify every SP exists before coding

For every data operation identified in 1.1, confirm the SP exists and get its real parameters:

```js
// inspect-sp.js  (delete after use — run: node inspect-sp.js)
const sql = require('mssql');
const cfg = {
  user: 'azure', password: 'FullPot1516sql$$$',
  server: 'flexymaxfpsql.public.9a4b26c7b85f.database.windows.net', port: 3342,
  database: 'fullpot', options: { encrypt: true, trustServerCertificate: true }
};
const SP_NAME = 'sp_your_sp_name_here';
sql.connect(cfg).then(async p => {
  // Full SP body
  const def = await p.request().query(
    `SELECT m.definition FROM sys.sql_modules m JOIN sys.objects o ON o.object_id = m.object_id WHERE o.name = '${SP_NAME}'`
  );
  console.log('\n--- DEFINITION ---\n', def.recordset[0]?.definition ?? 'NOT FOUND');
  // Parameter list
  const params = await p.request().query(
    `SELECT p.name, t.name AS type, p.max_length FROM sys.parameters p JOIN sys.types t ON t.user_type_id = p.user_type_id WHERE p.object_id = OBJECT_ID('${SP_NAME}') ORDER BY p.parameter_id`
  );
  console.log('\n--- PARAMETERS ---');
  params.recordset.forEach(r => console.log(r.name, r.type, r.max_length));
  process.exit(0);
}).catch(e => { console.error(e.message); process.exit(1); });
```

**Rules:**
- Never assume parameter names from column names or old code — always query `sys.parameters`.
- If a required SP is missing, stop. Do NOT write raw SQL. Ask the user to create the SP first.
- Watch for: `LIKE` vs `=` in WHERE clauses, special ALL-row values (often `'%'` for LIKE-based SPs), columns that exist in the table but are not returned by the SP.

### 1.3 Verify real column names

Use `verify-before-build` skill step 1 to check every table the page touches.

---

## PHASE 2 — SP & Route Standards

### 2.1 All transactions must use SPs — zero raw SQL in routes

Every INSERT / UPDATE / DELETE in an API route must call a stored procedure via `executeProcedure`.
If you see raw SQL (template literals with `INSERT INTO`, `UPDATE`, `DELETE FROM`), replace it.

```ts
// WRONG — never do this in a route:
await pool.request().query(`INSERT INTO flower_table (col) VALUES ('${val}')`);

// CORRECT:
const r = await executeProcedure('sp_flower_table_insert', { lcval: val });
```

### 2.2 CRUD SP return format

Every CRUD SP must return exactly this dataset (lowercase column names for non-NC_ SPs):

```sql
-- Standard SP (auto-thrown by db.ts on error=1):
SELECT unico = @lcUnico, message = @lcMessage, error = @llerror

-- NC_ SP (route must check Error explicitly — capital E):
SELECT @lcunico AS unico, @lcmessage AS Message, @llerror AS Error
```

Route pattern for **NC_ SPs**:
```ts
const row = result.recordset?.[0];
if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
return NextResponse.json({ success: true, unico: row?.unico, message: row?.Message });
```

Route pattern for **standard SPs** (db.ts auto-throws on lowercase `error=1`):
```ts
const row = result.recordset?.[0] || {};
if (row.error) return NextResponse.json({ success: false, error: row.message }, { status: 400 });
return NextResponse.json({ success: true, unico: String(row.unico || '').trim(), message: row.message });
```

### 2.3 Audit log after every successful CRUD

Every POST / PUT / DELETE route must call `serverAuditLog` immediately before the success return:

```ts
import { serverAuditLog } from "@/lib/serverAudit";
const PANTA = "XXXXXXXX"; // panta_uq for this page
const TABLA = "your_table_name";

// POST → Insert:
serverAuditLog(PANTA, "Insert", TABLA, row.unico).catch(() => {});

// PUT → Edit:
serverAuditLog(PANTA, "Edit", TABLA, body.lcunico).catch(() => {});

// DELETE → Delete:
serverAuditLog(PANTA, "Delete", TABLA, unico).catch(() => {});
```

And the client-side `logAction` in the page:
```ts
const { logAction } = useAuditLog("page-key", "table_name");
// After confirmed success:
logAction("Insert", data.unico);
logAction("Edit",   unico);
logAction("Delete", unico);
```

### 2.4 SPs with pagination → infinite scroll grids

If an SP has `@lnpage` / `@lnpagesize` / `@lnoffset` parameters, the grid must use React Query infinite scroll, not a plain `useQuery`:

```ts
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["resource", filters],
    queryFn: ({ pageParam = 1 }) =>
        fetch(`/api/resource?page=${pageParam}&pageSize=50`).then(r => r.json()),
    getNextPageParam: (last, pages) =>
        last.hasMore ? pages.length + 1 : undefined,
});
```

Never load all rows at once from a paginated SP — it defeats the SP design and causes timeouts on large tables.

---

## PHASE 3 — UI / Grid Standards

### 3.1 PanelGrid is mandatory for ALL grids

Every grid — on a page OR inside a modal — must use `PanelGrid` + `PanelGridTable`. No custom `<table>`, no custom `<thead>`, no div-based rows.

```tsx
import { PanelGrid } from "@/components/ui/PanelGrid";

<PanelGrid
    title="Records"
    count={rows.length}
    onSearch={setSearch}
    onRefresh={() => qc.invalidateQueries({ queryKey: ["key"] })}
    onDownload={handleExport}          // download button — use onDownload, NEVER menuItems
    headerRight={
        <>
            <AuditLogModal recordId={selRow?.unico} disabled={!selRow} />
            <button className="h-7 ...">Action</button>
        </>
    }
    menuItems={[
        { label: "Add",    icon: Plus,   color: "green", onClick: handleAdd,    disabled: !perms.canCreate },
        { label: "Edit",   icon: Pencil, color: "blue",  onClick: handleEdit,   disabled: !selRow || !perms.canEdit },
        { label: "Delete", icon: Trash2, color: "red",   onClick: handleDelete, disabled: !selRow || !perms.canDelete },
    ]}
>
    <PanelGridTable columns={["Code", "Name", "Amount"]}>
        {rows.map(row => (
            <tr
                key={row.unico}
                onClick={() => setSelRow(row)}
                className={cn("cursor-pointer hover:bg-white/5",
                    selRow?.unico === row.unico && "!bg-[#FB7506]/10")} // orange highlight
            >
                <td className="px-3 py-1 font-mono text-orange-400">{row.code}</td>
                <td className="px-3 py-1">{row.name}</td>
                <td className="px-3 py-1 text-right">{formatMoney(row.amount)}</td>
            </tr>
        ))}
    </PanelGridTable>
</PanelGrid>
```

Checklist for every grid:
- [ ] `PanelGrid` with `title` + `count` badge
- [ ] `onSearch` wired (filters rows client-side)
- [ ] `onRefresh` wired (invalidates React Query)
- [ ] `onDownload` for CSV/Excel export (not inside `menuItems`)
- [ ] `AuditLogModal` in `headerRight`
- [ ] 3-line hamburger menu via `menuItems` (orange icon — built into PanelGrid)
- [ ] `selRow` state with `onClick` + orange `!bg-[#FB7506]/10` highlight
- [ ] Auto-select first record on load (`useEffect` watching the data array)
- [ ] Code/ID column in orange monospace: `font-mono text-orange-400`

### 3.2 Modals with grids — special layout

Modals that contain a grid must follow this structure (no custom padding inside the grid):

```tsx
<Dialog>
    {/* Dark header */}
    <DialogHeader className="bg-[#1F2937] px-4 py-3 border-b border-white/10">
        <DialogTitle>Modal Title</DialogTitle>
    </DialogHeader>

    {/* Grid flush to edges — no padding, no rounded corners */}
    <div className="flex flex-col flex-1 min-h-0">
        <PanelGrid className="flex-1 min-h-0 rounded-none border-x-0 border-b-0" ...>
            ...
        </PanelGrid>
    </div>

    {/* Footer with action buttons */}
    <DialogFooter className="px-4 py-3 border-t border-white/10 bg-[#1F2937]">
        <Button onClick={onClose}>Close</Button>
        <Button onClick={handleSave} disabled={!perms.canEdit}>Save</Button>
    </DialogFooter>
</Dialog>
```

### 3.3 Action button bars — gray background

Any toolbar row with action buttons must use a gray/dark background, not white:

```tsx
<div className="flex items-center gap-2 px-3 py-2 bg-[#374151] border-b border-white/10">
    <Button size="sm" className="h-7">Action A</Button>
    <Button size="sm" className="h-7">Action B</Button>
</div>
```

Button height in toolbars: always `h-7`.

### 3.4 Sonner toasts for all user-facing alerts

Never use `alert()`, `setError()` displayed as inline `<span>`, or `console.log` for user feedback.

```tsx
import { toast } from "sonner";

// On success:
toast.success("Record saved.");

// On error:
toast.error(err.message || "Something went wrong.");

// On confirmation (destructive action):
// Use a confirm modal or toast with action button — not window.confirm()
```

### 3.5 Zustand store for page state

Every page with meaningful shared state (selected rows, open modals, active filters) must use a Zustand store:

```ts
// src/store/useMyPageStore.ts
import { create } from "zustand";
interface MyPageState {
    selRow:    any | null;
    setSelRow: (row: any | null) => void;
    isModalOpen: boolean;
    openModal:   () => void;
    closeModal:  () => void;
}
export const useMyPageStore = create<MyPageState>(set => ({
    selRow:      null,
    setSelRow:   row => set({ selRow: row }),
    isModalOpen: false,
    openModal:   () => set({ isModalOpen: true }),
    closeModal:  () => set({ isModalOpen: false }),
}));
```

Use `useState` only for purely local, ephemeral state (e.g., form field value while typing).

---

## PHASE 4 — Page Registration & Permissions

### 4.1 Register page in PANTA + SCREEN_PANTA

Every new page needs a panta_uq (get from Module & Screen Setup in the app):

```ts
// src/lib/permissions.ts
export const SCREEN_PANTA: Record<string, string> = {
    "my-page-key": "XXXXXXXX",
};

// src/lib/audit.ts
export const PANTA: Record<string, string> = {
    "my-page-key": "XXXXXXXX",
};
```

### 4.2 Every action button checks permissions

```tsx
const perms = usePagePermissions("my-page-key");

// In menuItems:
{ label: "Add",    disabled: !perms.canCreate }
{ label: "Edit",   disabled: !selRow || !perms.canEdit }
{ label: "Delete", disabled: !selRow || !perms.canDelete }
{ label: "Export", disabled: !perms.canReport }

// Guard inside handlers:
if (!perms.canCreate) { toast.error(PERMISSION_MSGS.create); return; }
```

### 4.3 Add menu routing

```ts
// src/app/menu/page.tsx — getRoute():
if (p.includes('MY SCREEN NAME')) return '/my-page-route';
```

---

## PHASE 5 — Responsive Layout

Every page must be usable on tablet-width (min 768px) without horizontal scroll.

- Use `min-w-0` on flex children that hold grids.
- Grids: `overflow-x-auto` on the table container — wide tables scroll internally.
- Panels: `flex flex-col` for vertical stacking on narrow viewports.
- No hard-coded pixel widths on outer containers — use `w-full`, `max-w-screen-xl`, or percentage.
- Test by narrowing the browser to ~768px and confirming no horizontal scrollbar appears on the `<body>`.

---

## PHASE 6 — Final Review Checklist

Run through this before declaring the migration complete:

### Original functionality
- [ ] Every VFP/Appsmith button has a Next.js equivalent
- [ ] Every VFP/Appsmith modal has a Next.js equivalent
- [ ] Every VFP/Appsmith report has a Next.js download (CSV/PDF)

### Data layer
- [ ] Zero raw SQL in routes — all via SPs
- [ ] SP parameters verified with `inspect-sp.js` (not guessed)
- [ ] SPs with pagination → infinite scroll grid
- [ ] Every CRUD SP returns `unico / message / error` dataset
- [ ] Every CRUD route calls `serverAuditLog` before success return

### UI standards
- [ ] All grids use `PanelGrid` (page grids + modal grids)
- [ ] Grid header has: icon, title, count badge, search, refresh, download, 3-line menu, AuditLogModal
- [ ] ID/code columns are orange monospace (`font-mono text-orange-400`)
- [ ] Selected row has orange highlight (`!bg-[#FB7506]/10`)
- [ ] Modals with grids: dark header → flush grid → footer
- [ ] Action button bars use gray background, `h-7` buttons
- [ ] All alerts use Sonner toasts (no `alert()`, no inline error spans)
- [ ] Zustand store for page-level state

### Permissions & routing
- [ ] Page key registered in `SCREEN_PANTA` and `PANTA`
- [ ] All action buttons respect `perms.can*`
- [ ] Menu routing added in `menu/page.tsx`
- [ ] `usePagePermissions` + `useAuditLog` called at top of page component
- [ ] `logAction` called client-side after every successful CRUD

### Responsive
- [ ] No horizontal scroll at 768px viewport width
- [ ] Wide grids use `overflow-x-auto` internally

---

## Quick Reference — SP Inspection Scripts

```js
// List all SPs matching a pattern
const r = await p.request().query(
  `SELECT name FROM sys.objects WHERE type = 'P' AND name LIKE '%flower_accounts%' ORDER BY name`
);

// Check if an SP exists
const r = await p.request().query(
  `SELECT 1 FROM sys.objects WHERE name = 'sp_your_sp' AND type = 'P'`
);

// Check table columns
const r = await p.request().query(
  `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'flower_table' ORDER BY ORDINAL_POSITION`
);
```
