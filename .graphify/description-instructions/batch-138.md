# Node Description Batch 139 of 139

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

- "warehouses_route_delete": "DELETE()" | kind=code-symbol | source=src/app/api/sales-reps/warehouses/route.ts:L39 | neighbors=[route.ts]
- "warehouses_route_get": "GET()" | kind=code-symbol | source=src/app/api/sales-reps/warehouses/route.ts:L4 | neighbors=[route.ts]
- "warehouses_route_post": "POST()" | kind=code-symbol | source=src/app/api/sales-reps/warehouses/route.ts:L24 | neighbors=[route.ts]
- "web_route_p": "P" | kind=code-symbol | source=src/app/api/vendors/[unico]/web/route.ts:L6 | neighbors=[route.ts]
- "web_users_route_get": "GET()" | kind=code-symbol | source=src/app/api/masters/customers/[unico]/web-users/route.ts:L4 | neighbors=[route.ts]
- "weeks_route_get": "GET()" | kind=code-symbol | source=src/app/api/standing-orders/weeks/route.ts:L7 | neighbors=[route.ts]
- "weeks_route_put": "PUT()" | kind=code-symbol | source=src/app/api/standing-orders/weeks/route.ts:L31 | neighbors=[route.ts]
- "wh_control_route_int": "int()" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/wh-control/route.ts:L10 | neighbors=[route.ts]
- "wh_control_route_p": "P" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/wh-control/route.ts:L7 | neighbors=[route.ts]
- "wh_control_route_put": "PUT()" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/wh-control/route.ts:L12 | neighbors=[route.ts]
- "wh_control_route_str": "str()" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/wh-control/route.ts:L9 | neighbors=[route.ts]
- "wh_instructions_route_columns": "COLUMNS" | kind=code-symbol | source=src/app/api/inventory-entry/reports/wh-instructions/route.tsx:L22 | neighbors=[route.tsx]
- "whouse_totals_route_get": "GET()" | kind=code-symbol | source=src/app/api/inventory-entry/whouse-totals/route.ts:L7 | neighbors=[route.ts]
- "whouse_totals_route_str": "str()" | kind=code-symbol | source=src/app/api/inventory-entry/whouse-totals/route.ts:L4 | neighbors=[route.ts]
- "without_invoice_route_columns": "COLUMNS" | kind=code-symbol | source=src/app/api/pbook2invoice/reports/without-invoice/route.tsx:L12 | neighbors=[route.tsx]
- "without_invoice_route_fmti": "fmtI()" | kind=code-symbol | source=src/app/api/pbook2invoice/reports/without-invoice/route.tsx:L8 | neighbors=[route.tsx]
- "years_route_get": "GET()" | kind=code-symbol | source=src/app/api/accounts-payable/years/route.ts:L4 | neighbors=[route.ts]
- "pbook2invoice_sp_nc_prebook_box_to_invoice_box": "sp_NC_prebook_box_to_invoice_box.sql" | kind=code-symbol | source=sql/pbook2invoice/sp_NC_prebook_box_to_invoice_box.sql:L1
- "pbook2invoice_sp_nc_prebook_customers_by_date_closed": "sp_NC_prebook_customers_by_date_closed.sql" | kind=code-symbol | source=sql/pbook2invoice/sp_NC_prebook_customers_by_date_closed.sql:L1
- "pbook2invoice_sp_nc_prebook_to_invoice_dates": "sp_NC_prebook_to_invoice_dates.sql" | kind=code-symbol | source=sql/pbook2invoice/sp_NC_prebook_to_invoice_dates.sql:L1
- "pbook2invoice_udf_nc_prebook_box_purchase_control": "udf_NC_prebook_box_purchase_control.sql" | kind=code-symbol | source=sql/pbook2invoice/udf_NC_prebook_box_purchase_control.sql:L1
- "rewrite_modules": "rewrite_modules.js" | kind=code-symbol | source=rewrite_modules.js:L1

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-138.json

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
