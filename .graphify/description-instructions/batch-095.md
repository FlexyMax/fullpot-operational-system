# Node Description Batch 96 of 139

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

- "freights_page_ffield": "FField()" | kind=code-symbol | source=src/app/masters/freights/page.tsx:L42 | neighbors=[page.tsx]
- "freights_page_setupmodal": "SetupModal()" | kind=code-symbol | source=src/app/masters/freights/page.tsx:L86 | neighbors=[page.tsx]
- "freights_page_simplemodal": "SimpleModal()" | kind=code-symbol | source=src/app/masters/freights/page.tsx:L51 | neighbors=[page.tsx]
- "future_stock_route_get": "GET()" | kind=code-symbol | source=src/app/api/standing-orders/future-stock/route.ts:L4 | neighbors=[route.ts]
- "gen_invoices_route_post": "POST()" | kind=code-symbol | source=src/app/api/pbook2invoice/gen-invoices/route.ts:L8 | neighbors=[route.ts]
- "get_alt_sp_config": "config" | kind=code-symbol | source=get_alt_sp.js:L3 | neighbors=[get_alt_sp.js]
- "get_alt_sp_main": "main()" | kind=code-symbol | source=get_alt_sp.js:L4 | neighbors=[get_alt_sp.js]
- "get_alt_sp_sql": "sql" | kind=code-symbol | source=get_alt_sp.js:L2 | neighbors=[get_alt_sp.js]
- "get_bi_catalog_config": "config" | kind=code-symbol | source=get_bi_catalog.js:L3 | neighbors=[get_bi_catalog.js]
- "get_bi_catalog_main": "main()" | kind=code-symbol | source=get_bi_catalog.js:L5 | neighbors=[get_bi_catalog.js]
- "get_bi_catalog_sql": "sql" | kind=code-symbol | source=get_bi_catalog.js:L2 | neighbors=[get_bi_catalog.js]
- "get_pantalla_config": "config" | kind=code-symbol | source=get_pantalla.js:L3 | neighbors=[get_pantalla.js]
- "get_pantalla_main": "main()" | kind=code-symbol | source=get_pantalla.js:L5 | neighbors=[get_pantalla.js]
- "get_pantalla_sql": "sql" | kind=code-symbol | source=get_pantalla.js:L2 | neighbors=[get_pantalla.js]
- "get_prod_sp_config": "config" | kind=code-symbol | source=get_prod_sp.js:L3 | neighbors=[get_prod_sp.js]
- "get_prod_sp_main": "main()" | kind=code-symbol | source=get_prod_sp.js:L4 | neighbors=[get_prod_sp.js]
- "get_prod_sp_sql": "sql" | kind=code-symbol | source=get_prod_sp.js:L2 | neighbors=[get_prod_sp.js]
- "get_sp_def_config": "config" | kind=code-symbol | source=get_sp_def.js:L3 | neighbors=[get_sp_def.js]
- "get_sp_def_main": "main()" | kind=code-symbol | source=get_sp_def.js:L4 | neighbors=[get_sp_def.js]
- "get_sp_def_sql": "sql" | kind=code-symbol | source=get_sp_def.js:L2 | neighbors=[get_sp_def.js]
- "get_sp_def2_config": "config" | kind=code-symbol | source=get_sp_def2.js:L3 | neighbors=[get_sp_def2.js]
- "get_sp_def2_main": "main()" | kind=code-symbol | source=get_sp_def2.js:L4 | neighbors=[get_sp_def2.js]
- "get_sp_def2_sql": "sql" | kind=code-symbol | source=get_sp_def2.js:L2 | neighbors=[get_sp_def2.js]
- "get_sp_defs_config": "config" | kind=code-symbol | source=get_sp_defs.js:L3 | neighbors=[get_sp_defs.js]
- "get_sp_defs_main": "main()" | kind=code-symbol | source=get_sp_defs.js:L11 | neighbors=[get_sp_defs.js]
- "get_sp_defs_sps": "SPS" | kind=code-symbol | source=get_sp_defs.js:L4 | neighbors=[get_sp_defs.js]
- "get_sp_defs_sql": "sql" | kind=code-symbol | source=get_sp_defs.js:L2 | neighbors=[get_sp_defs.js]
- "grades_route_get": "GET()" | kind=code-symbol | source=src/app/api/masters/items/grades/route.ts:L6 | neighbors=[route.ts]
- "grades_route_post": "POST()" | kind=code-symbol | source=src/app/api/masters/items/grades/route.ts:L17 | neighbors=[route.ts]
- "groups_route_get": "GET()" | kind=code-symbol | source=src/app/api/vendors/groups/route.ts:L7 | neighbors=[route.ts]
- "groups_route_post": "POST()" | kind=code-symbol | source=src/app/api/vendors/groups/route.ts:L19 | neighbors=[route.ts]
- "grower_route_delete": "DELETE()" | kind=code-symbol | source=src/app/api/masters/items/products/quota/grower/route.ts:L27 | neighbors=[route.ts]
- "grower_route_post": "POST()" | kind=code-symbol | source=src/app/api/masters/items/products/quota/grower/route.ts:L9 | neighbors=[route.ts]
- "grower_terms_route_get": "GET()" | kind=code-symbol | source=src/app/api/accounts-payable/grower-terms/route.ts:L4 | neighbors=[route.ts]
- "growers_route_get": "GET()" | kind=code-symbol | source=src/app/api/payment-authorizations/growers/route.ts:L4 | neighbors=[route.ts]
- "handling_route_get": "GET()" | kind=code-symbol | source=src/app/api/freights/handling/route.ts:L10 | neighbors=[route.ts]
- "header_route_get": "GET()" | kind=code-symbol | source=src/app/api/pos/invoice/header/route.ts:L8 | neighbors=[route.ts]
- "header_route_post": "POST()" | kind=code-symbol | source=src/app/api/standing-orders/header/route.ts:L10 | neighbors=[route.ts]
- "hold_no_sales_route": "route.ts" | kind=code-symbol | source=src/app/api/customer-payments/hold-no-sales/route.ts:L1 | neighbors=[POST()]
- "hold_no_sales_route_post": "POST()" | kind=code-symbol | source=src/app/api/customer-payments/hold-no-sales/route.ts:L4 | neighbors=[route.ts]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-095.json

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
