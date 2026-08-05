# Node Description Batch 105 of 139

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

- "pbook2invoice_page_td": "Td()" | kind=code-symbol | source=src/app/pbook2invoice/page.tsx:L78 | neighbors=[page.tsx]
- "pbook2invoice_page_th": "Th()" | kind=code-symbol | source=src/app/pbook2invoice/page.tsx:L71 | neighbors=[page.tsx]
- "pbook2invoice_page_vfprowstyle": "vfpRowStyle()" | kind=code-symbol | source=src/app/pbook2invoice/page.tsx:L49 | neighbors=[page.tsx]
- "pending_invoices_route_post": "POST()" | kind=code-symbol | source=src/app/api/customer-payments/reports/pending-invoices/route.ts:L4 | neighbors=[route.ts]
- "pending_route_get": "GET()" | kind=code-symbol | source=src/app/api/scan-in/pending/route.ts:L7 | neighbors=[route.ts]
- "permissions_route_get": "GET()" | kind=code-symbol | source=src/app/api/system/permissions/route.ts:L23 | neighbors=[route.ts]
- "permissions_route_put": "PUT()" | kind=code-symbol | source=src/app/api/system/access/permissions/route.ts:L21 | neighbors=[route.ts]
- "photo_route_post": "POST()" | kind=code-symbol | source=src/app/api/system/users/[unico]/photo/route.ts:L47 | neighbors=[route.ts]
- "photo_route_txt": "txt()" | kind=code-symbol | source=src/app/api/system/users/[unico]/photo/route.ts:L6 | neighbors=[route.ts]
- "physical_route_get": "GET()" | kind=code-symbol | source=src/app/api/sales/warehouses/physical/route.ts:L6 | neighbors=[route.ts]
- "physical_warehouses_route_get": "GET()" | kind=code-symbol | source=src/app/api/sales-reps/physical-warehouses/route.ts:L4 | neighbors=[route.ts]
- "pick_list_route_columns": "COLUMNS" | kind=code-symbol | source=src/app/api/pbook2invoice/reports/pick-list/route.tsx:L13 | neighbors=[route.tsx]
- "pick_list_route_fmti": "fmtI()" | kind=code-symbol | source=src/app/api/pbook2invoice/reports/pick-list/route.tsx:L8 | neighbors=[route.tsx]
- "ping_route_get": "GET()" | kind=code-symbol | source=src/app/api/db/ping/route.ts:L4 | neighbors=[route.ts]
- "pl_control_route_get": "GET()" | kind=code-symbol | source=src/app/api/inventory-entry/pl-control/route.ts:L7 | neighbors=[route.ts]
- "po_entries_route_int": "int()" | kind=code-symbol | source=src/app/api/inventory-entry/po-entries/route.ts:L8 | neighbors=[route.ts]
- "po_entries_route_post": "POST()" | kind=code-symbol | source=src/app/api/inventory-entry/po-entries/route.ts:L12 | neighbors=[route.ts]
- "po_entries_route_str": "str()" | kind=code-symbol | source=src/app/api/inventory-entry/po-entries/route.ts:L7 | neighbors=[route.ts]
- "po_prices_route_post": "POST()" | kind=code-symbol | source=src/app/api/masters/items/po-prices/route.ts:L6 | neighbors=[route.ts]
- "po_route_get": "GET()" | kind=code-symbol | source=src/app/api/pos/history/po/route.ts:L6 | neighbors=[route.ts]
- "pob_route_delete": "DELETE()" | kind=code-symbol | source=src/app/api/accounts-payable/pob/route.ts:L55 | neighbors=[route.ts]
- "pob_route_get": "GET()" | kind=code-symbol | source=src/app/api/accounts-payable/pob/route.ts:L8 | neighbors=[route.ts]
- "pob_route_post": "POST()" | kind=code-symbol | source=src/app/api/accounts-payable/pob/route.ts:L19 | neighbors=[route.ts]
- "pob_route_put": "PUT()" | kind=code-symbol | source=src/app/api/accounts-payable/pob/route.ts:L37 | neighbors=[route.ts]
- "pobs_route_get": "GET()" | kind=code-symbol | source=src/app/api/accounts-payable/pobs/route.ts:L4 | neighbors=[route.ts]
- "postcss_config": "postcss.config.mjs" | kind=code-symbol | source=postcss.config.mjs:L1 | neighbors=[config]
- "postcss_config_config": "config" | kind=code-symbol | source=postcss.config.mjs:L1 | neighbors=[postcss.config.mjs]
- "prebooks_route_get": "GET()" | kind=code-symbol | source=src/app/api/accounts-payable/prebooks/route.ts:L4 | neighbors=[route.ts]
- "price_route_p": "P" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/price/route.ts:L7 | neighbors=[route.ts]
- "price_route_str": "str()" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/price/route.ts:L9 | neighbors=[route.ts]
- "print_composition_route_bouquet_cols": "BOUQUET_COLS" | kind=code-symbol | source=src/app/api/masters/items/products/[unico]/print-composition/route.tsx:L10 | neighbors=[route.tsx]
- "print_composition_route_combo_cols": "COMBO_COLS" | kind=code-symbol | source=src/app/api/masters/items/products/[unico]/print-composition/route.tsx:L19 | neighbors=[route.tsx]
- "product_classes_route_delete": "DELETE()" | kind=code-symbol | source=src/app/api/sales-reps/product-classes/route.ts:L40 | neighbors=[route.ts]
- "product_classes_route_get": "GET()" | kind=code-symbol | source=src/app/api/sales-reps/product-classes/route.ts:L4 | neighbors=[route.ts]
- "product_classes_route_post": "POST()" | kind=code-symbol | source=src/app/api/sales-reps/product-classes/route.ts:L25 | neighbors=[route.ts]
- "product_route_get": "GET()" | kind=code-symbol | source=src/app/api/products/images/product/route.ts:L8 | neighbors=[route.ts]
- "products_route_columns": "COLUMNS" | kind=code-symbol | source=src/app/api/inventory-entry/reports/products/route.tsx:L12 | neighbors=[route.ts]
- "products_route_fmt": "fmt()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/products/route.tsx:L8 | neighbors=[route.ts]
- "products_route_fmti": "fmtI()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/products/route.tsx:L9 | neighbors=[route.ts]
- "products_route_int": "int()" | kind=code-symbol | source=src/app/api/masters/items/products/route.ts:L28 | neighbors=[route.ts]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-104.json

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
