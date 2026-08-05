# Node Description Batch 138 of 139

Graphify is running in assistant/skill mode (no API key). You are the host
assistant (Claude Code / Codex / Gemini CLI). Read the prompt below and write
your JSON answer to the answer file.

## Prompt

You are documenting nodes in a knowledge graph.
For each entry below, write ONE concise factual plain-language sentence
describing what it is or does. Use only the provided context.
For a code symbol (kind=code-symbol — a function, class, or constant),
describe what the function/symbol does based on its name, source location
and neighbors — e.g. "Resolves the configured ontology profile from graphify.yaml.".
Write every description in English (en). Do not switch languages.
No marketing language.
Respond ONLY with a JSON object mapping each node id (as a string) to its
one-sentence description — no prose, no markdown fences.

- "varieties_route_post": "POST()" | kind=code-symbol | source=src/app/api/masters/items/varieties/route.ts:L21 | neighbors=[route.ts]
- "vendors_backup_activetab": "ActiveTab" | kind=code-symbol | source=vendors_backup.tsx:L65 | neighbors=[vendors_backup.tsx]
- "vendors_backup_dualpanel": "DualPanel()" | kind=code-symbol | source=vendors_backup.tsx:L69 | neighbors=[vendors_backup.tsx]
- "vendors_backup_empty_doc": "EMPTY_DOC" | kind=code-symbol | source=vendors_backup.tsx:L63 | neighbors=[vendors_backup.tsx]
- "vendors_backup_empty_form": "EMPTY_FORM" | kind=code-symbol | source=vendors_backup.tsx:L43 | neighbors=[vendors_backup.tsx]
- "vendors_backup_fmt": "fmt()" | kind=code-symbol | source=vendors_backup.tsx:L28 | neighbors=[vendors_backup.tsx]
- "vendors_backup_fmtdate": "fmtDate()" | kind=code-symbol | source=vendors_backup.tsx:L29 | neighbors=[vendors_backup.tsx]
- "vendors_backup_modalvendortab": "ModalVendorTab" | kind=code-symbol | source=vendors_backup.tsx:L66 | neighbors=[vendors_backup.tsx]
- "vendors_page_activetab": "ActiveTab" | kind=code-symbol | source=src/app/vendors/page.tsx:L91 | neighbors=[page.tsx]
- "vendors_page_confirmdlg": "ConfirmDlg()" | kind=code-symbol | source=src/app/vendors/page.tsx:L26 | neighbors=[page.tsx]
- "vendors_page_dualpanel": "DualPanel()" | kind=code-symbol | source=src/app/vendors/page.tsx:L95 | neighbors=[page.tsx]
- "vendors_page_empty_arr": "EMPTY_ARR" | kind=code-symbol | source=src/app/vendors/page.tsx:L23 | neighbors=[page.tsx]
- "vendors_page_empty_doc": "EMPTY_DOC" | kind=code-symbol | source=src/app/vendors/page.tsx:L89 | neighbors=[page.tsx]
- "vendors_page_empty_form": "EMPTY_FORM" | kind=code-symbol | source=src/app/vendors/page.tsx:L69 | neighbors=[page.tsx]
- "vendors_page_fmt": "fmt()" | kind=code-symbol | source=src/app/vendors/page.tsx:L54 | neighbors=[page.tsx]
- "vendors_page_fmtdate": "fmtDate()" | kind=code-symbol | source=src/app/vendors/page.tsx:L55 | neighbors=[page.tsx]
- "vendors_page_modalvendortab": "ModalVendorTab" | kind=code-symbol | source=src/app/vendors/page.tsx:L92 | neighbors=[page.tsx]
- "vendors_route_delete": "DELETE()" | kind=code-symbol | source=src/app/api/sales-reps/vendors/route.ts:L40 | neighbors=[route.ts]
- "vendors_route_get": "GET()" | kind=code-symbol | source=src/app/api/vendors/route.ts:L11 | neighbors=[route.ts]
- "vendors_route_int": "int()" | kind=code-symbol | source=src/app/api/vendors/route.ts:L8 | neighbors=[route.ts]
- "vendors_route_str": "str()" | kind=code-symbol | source=src/app/api/vendors/route.ts:L9 | neighbors=[route.ts]
- "vendors_summary_detail_route_get": "GET()" | kind=code-symbol | source=src/app/api/payment-authorizations/vendors-summary-detail/route.ts:L4 | neighbors=[route.ts]
- "vendors_summary_route_get": "GET()" | kind=code-symbol | source=src/app/api/payment-authorizations/vendors-summary/route.ts:L4 | neighbors=[route.ts]
- "verify_alt_sp_config": "config" | kind=code-symbol | source=verify_alt_sp.js:L3 | neighbors=[verify_alt_sp.js]
- "verify_alt_sp_main": "main()" | kind=code-symbol | source=verify_alt_sp.js:L4 | neighbors=[verify_alt_sp.js]
- "verify_alt_sp_sql": "sql" | kind=code-symbol | source=verify_alt_sp.js:L2 | neighbors=[verify_alt_sp.js]
- "verify_bi_exec_config": "config" | kind=code-symbol | source=verify_bi_exec.js:L3 | neighbors=[verify_bi_exec.js]
- "verify_bi_exec_sql": "sql" | kind=code-symbol | source=verify_bi_exec.js:L2 | neighbors=[verify_bi_exec.js]
- "verify_code_route_post": "POST()" | kind=code-symbol | source=src/app/api/auth/verify-code/route.ts:L4 | neighbors=[route.ts]
- "verify_route_post": "POST()" | kind=code-symbol | source=src/app/api/scan-out/verify/route.ts:L8 | neighbors=[route.ts]
- "views_route_get": "GET()" | kind=code-symbol | source=src/app/api/physical-scan/views/route.ts:L18 | neighbors=[route.ts]
- "views_route_view_map": "VIEW_MAP" | kind=code-symbol | source=src/app/api/physical-scan/views/route.ts:L6 | neighbors=[route.ts]
- "virtual_route_get": "GET()" | kind=code-symbol | source=src/app/api/sales/warehouses/virtual/route.ts:L6 | neighbors=[route.ts]
- "void_line_route_delete": "DELETE()" | kind=code-symbol | source=src/app/api/pbook2invoice/void-line/route.ts:L6 | neighbors=[route.ts]
- "void_route_p": "P" | kind=code-symbol | source=src/app/api/customer-payments/payment/[unico]/void/route.ts:L3 | neighbors=[route.ts]
- "void_route_post": "POST()" | kind=code-symbol | source=src/app/api/pos/invoice/void/route.ts:L7 | neighbors=[route.ts]
- "void_route_put": "PUT()" | kind=code-symbol | source=src/app/api/customer-payments/payment/[unico]/void/route.ts:L5 | neighbors=[route.ts]
- "warehouse_route_get": "GET()" | kind=code-symbol | source=src/app/api/inventory-entry/warehouse/route.ts:L6 | neighbors=[route.ts]
- "warehouses_bogo_route_get": "GET()" | kind=code-symbol | source=src/app/api/masters/items/warehouses-bogo/route.ts:L6 | neighbors=[route.ts]
- "warehouses_bogo_route_post": "POST()" | kind=code-symbol | source=src/app/api/masters/items/warehouses-bogo/route.ts:L15 | neighbors=[route.ts]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-137.json

Keep each description factual and concise (one sentence). No markdown, no prose
outside the JSON object. It is acceptable to omit a node if context is
insufficient — but include every node you can ground confidently.

Example answer format:
```json
{
  "node_id_1": "Resolves the configured ontology profile from graphify.yaml.",
  "node_id_2": "Colonel James Barclay, an antagonist in The Crooked Man."
}
```
