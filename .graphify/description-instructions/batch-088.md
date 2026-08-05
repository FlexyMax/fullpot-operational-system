# Node Description Batch 89 of 139

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

- "action_route_qb_table": "QB_TABLE" | kind=code-symbol | source=src/app/api/flexy2qb/[tab]/[action]/route.ts:L23 | neighbors=[route.ts]
- "add_exports_dir": "dir" | kind=code-symbol | source=add_exports.js:L4 | neighbors=[add_exports.js]
- "add_exports_files": "files" | kind=code-symbol | source=add_exports.js:L5 | neighbors=[add_exports.js]
- "add_exports_fs": "fs" | kind=code-symbol | source=add_exports.js:L1 | neighbors=[add_exports.js]
- "add_exports_path": "path" | kind=code-symbol | source=add_exports.js:L2 | neighbors=[add_exports.js]
- "add_route_post": "POST()" | kind=code-symbol | source=src/app/api/sales/cart/add/route.ts:L6 | neighbors=[route.ts]
- "airlines_route_get": "GET()" | kind=code-symbol | source=src/app/api/freights/airlines/route.ts:L11 | neighbors=[route.ts]
- "all_route_get": "GET()" | kind=code-symbol | source=src/app/api/masters/items/products/all/route.ts:L6 | neighbors=[route.ts]
- "all_statements_route_get": "GET()" | kind=code-symbol | source=src/app/api/customer-payments/reports/all-statements/route.ts:L4 | neighbors=[route.ts]
- "alternative_route_post": "POST()" | kind=code-symbol | source=src/app/api/masters/items/products/alternative/route.ts:L6 | neighbors=[route.ts]
- "alternatives_route_get": "GET()" | kind=code-symbol | source=src/app/api/masters/items/products/[unico]/alternatives/route.ts:L4 | neighbors=[route.ts]
- "ap_types_route_get": "GET()" | kind=code-symbol | source=src/app/api/accounts-payable/ap-types/route.ts:L4 | neighbors=[route.ts]
- "app_layout_geistmono": "geistMono" | kind=code-symbol | source=src/app/layout.tsx:L10 | neighbors=[layout.tsx]
- "app_layout_geistsans": "geistSans" | kind=code-symbol | source=src/app/layout.tsx:L5 | neighbors=[layout.tsx]
- "app_layout_metadata": "metadata" | kind=code-symbol | source=src/app/layout.tsx:L17 | neighbors=[layout.tsx]
- "app_layout_rootlayout": "RootLayout()" | kind=code-symbol | source=src/app/layout.tsx:L22 | neighbors=[layout.tsx]
- "app_page": "page.tsx" | kind=code-symbol | source=src/app/page.tsx:L1 | neighbors=[RootPage()]
- "app_page_rootpage": "RootPage()" | kind=code-symbol | source=src/app/page.tsx:L3 | neighbors=[page.tsx]
- "apply_route_post": "POST()" | kind=code-symbol | source=src/app/api/customer-payments/apply/route.ts:L4 | neighbors=[route.ts]
- "approve_route_post": "POST()" | kind=code-symbol | source=src/app/api/payment-authorizations/approve/route.ts:L7 | neighbors=[route.ts]
- "assigned_route_get": "GET()" | kind=code-symbol | source=src/app/api/masters/items/po-prices/assigned/route.ts:L4 | neighbors=[route.ts]
- "atpda_route_get": "GET()" | kind=code-symbol | source=src/app/api/freights/atpda/route.ts:L10 | neighbors=[route.ts]
- "attach_candidates_route_get": "GET()" | kind=code-symbol | source=src/app/api/pbook2invoice/attach-candidates/route.ts:L4 | neighbors=[route.ts]
- "attach_invoice_route_post": "POST()" | kind=code-symbol | source=src/app/api/pbook2invoice/attach-invoice/route.ts:L6 | neighbors=[route.ts]
- "available_route_get": "GET()" | kind=code-symbol | source=src/app/api/masters/items/warehouses-bogo/available/route.ts:L4 | neighbors=[route.ts]
- "awb_by_date_route_get": "GET()" | kind=code-symbol | source=src/app/api/inventory-entry/awb-by-date/route.ts:L4 | neighbors=[route.ts]
- "awb_cporder_route_columns": "COLUMNS" | kind=code-symbol | source=src/app/api/inventory-entry/reports/awb-cporder/route.tsx:L11 | neighbors=[route.tsx]
- "awb_cporder_route_fmti": "fmtI()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/awb-cporder/route.tsx:L8 | neighbors=[route.tsx]
- "awb_dates_route_get": "GET()" | kind=code-symbol | source=src/app/api/inventory-entry/awb-dates/route.ts:L6 | neighbors=[route.ts]
- "awb_full_route_columns": "COLUMNS" | kind=code-symbol | source=src/app/api/inventory-entry/reports/awb-full/route.tsx:L12 | neighbors=[route.tsx]
- "awb_full_route_fmt": "fmt()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/awb-full/route.tsx:L8 | neighbors=[route.tsx]
- "awb_full_route_fmti": "fmtI()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/awb-full/route.tsx:L9 | neighbors=[route.tsx]
- "awb_route_get": "GET()" | kind=code-symbol | source=src/app/api/scan-in/awb/route.ts:L8 | neighbors=[route.ts]
- "awb_search_route_get": "GET()" | kind=code-symbol | source=src/app/api/inventory-entry/awb-search/route.ts:L6 | neighbors=[route.ts]
- "awb_setup_route_get": "GET()" | kind=code-symbol | source=src/app/api/inventory-entry/awb-setup/route.ts:L10 | neighbors=[route.ts]
- "awb_setup_route_post": "POST()" | kind=code-symbol | source=src/app/api/inventory-entry/awb-setup/route.ts:L21 | neighbors=[route.ts]
- "awb_setup_route_str": "str()" | kind=code-symbol | source=src/app/api/inventory-entry/awb-setup/route.ts:L7 | neighbors=[route.ts]
- "awbcode_route_delete": "DELETE()" | kind=code-symbol | source=src/app/api/awbs/[awbcode]/route.ts:L6 | neighbors=[route.ts]
- "awbcode_route_get": "GET()" | kind=code-symbol | source=src/app/api/awbs/template/[awbcode]/route.ts:L6 | neighbors=[route.ts]
- "awbcode_route_put": "PUT()" | kind=code-symbol | source=src/app/api/awbs/[awbcode]/route.ts:L13 | neighbors=[route.ts]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-088.json

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
