## Design Documents — READ BEFORE WRITING SPs OR ROUTES

The project has mandatory design documents. Read them before writing any SP, API route, or component:

| Document | Purpose |
|---|---|
| `DEVELOPMENT_STANDARDS.md` | Route patterns, audit logging, permissions, auto-select, React Query rules |
| `DESIGN_SYSTEM.md` | Visual tokens, component patterns, layout rules |
| `MISSING_SPS.md` | Which SPs are missing or use direct SQL workarounds — check before creating new ones |
| `AccountsPayable.md` | AP page spec with verified SP parameter names |
| `CLAUDE.md` (this file) | SP authorization, design checklist, graphify |

### SP CRUD architecture (sp_NC_* naming convention)

```sql
-- Standard new SP template:
CREATE PROCEDURE [dbo].[sp_NC_<table>_insert]
    -- params ...
AS BEGIN
    SET NOCOUNT ON;
    DECLARE @lcunico   char(8)       = LEFT(NEWID(), 8);  -- PK generation
    DECLARE @llerror   bit           = 0;
    DECLARE @lcmessage varchar(1000) = '';

    -- ... INSERT / UPDATE / DELETE ...
    IF @@ROWCOUNT >= 1 SET @lcmessage = 'Transaction OK';
    ELSE BEGIN SET @llerror = 1; SET @lcmessage = 'SQL command error, try again'; END

    SELECT @lcunico AS unico, @lcmessage AS Message, @llerror AS Error;
END
```

Route error check (db.ts auto-throws on lowercase `error=1`; NC_ SPs use uppercase so route must check explicitly):
```ts
const row = result.recordset?.[0];
if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
return NextResponse.json({ success: true, unico: row?.unico, message: row?.Message });
```

---

## Stored Procedure (SP) Authorization Rule — MANDATORY

Before creating, modifying, or deleting ANY stored procedure in any database (fullpot, sistema, or other):

1. **STOP and ask for authorization.** Do NOT execute any CREATE/ALTER/DROP PROCEDURE without explicit approval.
2. **Explain clearly:**
   - Which SP will be modified (full name + DB)
   - What the current behavior is
   - What the change will do and why
   - Any risk or side effect (e.g., callers, triggers, cross-DB dependencies)
3. **Wait for confirmation** before running the script.

This rule applies even when the change seems minor (e.g., fixing column order, adding a comment, adding TRY/CATCH). SP modifications affect the production database directly and cannot be undone without a backup.

Exception: if the user explicitly says "ejecuta" / "go ahead" / "run it" for a specific SP change that was already explained and approved in the same conversation turn, proceed.

---

## Design Standards — CHECK BEFORE EVERY CODE CHANGE

Before writing or editing ANY component, modal, or page, verify compliance with the app design standards stored in memory (`feedback_panel_grid_design`). Key rules:

1. **PanelGrid is mandatory for ALL grids** — in pages AND inside modals. No custom table headers ever.
2. **Download = `onDownload` prop** on PanelGrid, never a `menuItems` entry.
3. **AuditLogModal in `headerRight`** of every PanelGrid — never `onLog={() => {}}`.
4. **Modals with grids**: dark header → `<PanelGrid className="flex-1 min-h-0 rounded-none border-x-0 border-b-0">` → footer.
5. **Action buttons in headerRight**: use `h-7` height.
6. **Row selection**: every grid must have `selRow` state + `onClick` + orange highlight `!bg-[#FB7506]/10`.

If adding a new grid or modal, run through this checklist before committing.

---

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
