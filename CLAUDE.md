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

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
