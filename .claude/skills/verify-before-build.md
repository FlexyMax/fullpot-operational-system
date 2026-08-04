---
name: verify-before-build
description: Pre-flight checklist before writing SPs, API routes, or numeric UI fields. Run this BEFORE writing any new code to avoid multi-iteration fixes.
---

# Verify Before Build

Run each check that applies to the current task. Do NOT skip — this is what causes 4-iteration bugs.

---

## 1. Writing a Stored Procedure that references a table?

Query the real columns first. Use the project's node + mssql (run from the project root):

```js
// check-cols.js  (delete after use)
const sql = require('mssql');
const cfg = { user:'azure', password:'FullPot1516sql$$$', server:'flexymaxfpsql.public.9a4b26c7b85f.database.windows.net', port:3342, database:'fullpot', options:{encrypt:true,trustServerCertificate:true} };
sql.connect(cfg).then(p =>
  p.request().query("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'YOUR_TABLE' ORDER BY ORDINAL_POSITION")
).then(r => { r.recordset.forEach(c => console.log(c.COLUMN_NAME, c.DATA_TYPE)); process.exit(0); })
 .catch(e => { console.error(e.message); process.exit(1); });
```

```bash
node check-cols.js   # run from project root (mssql is in node_modules)
```

**Never assume column names.** Common traps in this codebase:
- `warehouse` → actual: `wp_name`
- `description` may not exist
- Spanish aliases: `clase` not `class`, `pack` not `case_name`

---

## 2. Creating a new API route with dynamic params?

This project runs **Next.js 15** — `params` is a `Promise`. Check before writing:

```bash
# Find an existing dynamic route as reference:
find src/app/api -name "route.ts" | xargs grep -l "await params" | head -3
```

**Correct pattern** (always):
```ts
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    ...
}
```

**Never** use `{ params }: { params: { id: string } }` — that was Next.js 14 and causes a TypeScript build error.

---

## 3. Adding a numeric input field in React?

**Never use `<input type="number">`** — the browser returns `""` for `e.target.value` on incomplete values like `"0."`, silently eating decimals.

**Always use:**
```tsx
<input
    type="text"
    inputMode="decimal"
    value={formValue}          // keep as string in state
    onChange={e => setValue(e.target.value)}
/>
```

Store as `string` in form state. Parse only when saving:
```ts
const body = { amount: parseFloat(formValue) || 0 };
```

---

## 4. Before committing any SP change

- [ ] Checked actual column names (step 1)
- [ ] SP uses `SET NOCOUNT ON`
- [ ] SP returns `unico / Message / Error` recordset (NC_ pattern)
- [ ] Route checks `if (row?.Error)` explicitly (db.ts auto-throw only fires on lowercase `error`)
- [ ] Audit log call added: `serverAuditLog(PANTA, "Insert"|"Edit"|"Delete", "table_name", unico).catch(() => {})`

---

## 5. Before committing a new route file

- [ ] `params` typed as `Promise<{...}>` and awaited
- [ ] `npx tsc --noEmit` passes with zero errors
