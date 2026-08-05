# Node Description Batch 94 of 139

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

- "customers_page_carriermodal": "CarrierModal()" | kind=code-symbol | source=src/app/masters/customers/page.tsx:L1223 | neighbors=[page.tsx]
- "customers_page_confirmdlg": "ConfirmDlg()" | kind=code-symbol | source=src/app/masters/customers/page.tsx:L1345 | neighbors=[page.tsx]
- "customers_page_customermodal": "CustomerModal()" | kind=code-symbol | source=src/app/masters/customers/page.tsx:L975 | neighbors=[page.tsx]
- "customers_page_empty_arr": "EMPTY_ARR" | kind=code-symbol | source=src/app/masters/customers/page.tsx:L26 | neighbors=[page.tsx]
- "customers_page_empty_carrier": "EMPTY_CARRIER" | kind=code-symbol | source=src/app/masters/customers/page.tsx:L35 | neighbors=[page.tsx]
- "customers_page_empty_cust": "EMPTY_CUST" | kind=code-symbol | source=src/app/masters/customers/page.tsx:L33 | neighbors=[page.tsx]
- "customers_page_empty_shipto": "EMPTY_SHIPTO" | kind=code-symbol | source=src/app/masters/customers/page.tsx:L34 | neighbors=[page.tsx]
- "customers_page_empty_webuser": "EMPTY_WEBUSER" | kind=code-symbol | source=src/app/masters/customers/page.tsx:L36 | neighbors=[page.tsx]
- "customers_page_inv_opts": "INV_OPTS" | kind=code-symbol | source=src/app/masters/customers/page.tsx:L32 | neighbors=[page.tsx]
- "customers_page_msgmodal": "MsgModal()" | kind=code-symbol | source=src/app/masters/customers/page.tsx:L1309 | neighbors=[page.tsx]
- "customers_page_shiptomodal": "ShiptoModal()" | kind=code-symbol | source=src/app/masters/customers/page.tsx:L1170 | neighbors=[page.tsx]
- "customers_page_webusermodal": "WebUserModal()" | kind=code-symbol | source=src/app/masters/customers/page.tsx:L1265 | neighbors=[page.tsx]
- "customers_route_get": "GET()" | kind=code-symbol | source=src/app/api/sales-reps/reports/customers/route.tsx:L43 | neighbors=[route.tsx]
- "customers_route_labels": "LABELS" | kind=code-symbol | source=src/app/api/sales-reps/reports/customers/route.tsx:L18 | neighbors=[route.tsx]
- "customers_route_put": "PUT()" | kind=code-symbol | source=src/app/api/sales-reps/customers/route.ts:L16 | neighbors=[route.tsx]
- "customers_route_skip": "SKIP" | kind=code-symbol | source=src/app/api/sales-reps/reports/customers/route.tsx:L11 | neighbors=[route.tsx]
- "customers_route_widths": "WIDTHS" | kind=code-symbol | source=src/app/api/sales-reps/reports/customers/route.tsx:L31 | neighbors=[route.tsx]
- "cut_off_route_columns": "COLUMNS" | kind=code-symbol | source=src/app/api/inventory-entry/reports/cut-off/route.tsx:L11 | neighbors=[route.tsx]
- "cut_off_route_fmt": "fmt()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/cut-off/route.tsx:L8 | neighbors=[route.tsx]
- "cut_off_route_fmti": "fmtI()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/cut-off/route.tsx:L9 | neighbors=[route.tsx]
- "data_route_bodyschema": "bodySchema" | kind=code-symbol | source=src/app/api/bi/reports/[unico]/data/route.ts:L13 | neighbors=[route.ts]
- "data_route_p": "P" | kind=code-symbol | source=src/app/api/bi/reports/[unico]/data/route.ts:L18 | neighbors=[route.ts]
- "date_to_history_route_post": "POST()" | kind=code-symbol | source=src/app/api/payment-authorizations/date-to-history/route.ts:L7 | neighbors=[route.ts]
- "dates_route_get": "GET()" | kind=code-symbol | source=src/app/api/sales/dates/route.ts:L6 | neighbors=[route.ts]
- "debug_route_get": "GET()" | kind=code-symbol | source=src/app/api/vendors/debug/route.ts:L27 | neighbors=[route.ts]
- "debug_route_sps": "SPS" | kind=code-symbol | source=src/app/api/vendors/debug/route.ts:L4 | neighbors=[route.ts]
- "default_route_put": "PUT()" | kind=code-symbol | source=src/app/api/masters/customers/carrier/[unico]/default/route.ts:L4 | neighbors=[route.ts]
- "delayed_route_columns": "COLUMNS" | kind=code-symbol | source=src/app/api/inventory-entry/reports/delayed/route.tsx:L11 | neighbors=[route.ts]
- "delayed_route_delete": "DELETE()" | kind=code-symbol | source=src/app/api/scan-in/delayed/route.ts:L82 | neighbors=[route.ts]
- "delayed_route_fmti": "fmtI()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/delayed/route.tsx:L8 | neighbors=[route.ts]
- "delayed_route_post": "POST()" | kind=code-symbol | source=src/app/api/scan-in/delayed/route.ts:L27 | neighbors=[route.ts]
- "delayed_route_put": "PUT()" | kind=code-symbol | source=src/app/api/scan-in/delayed/route.ts:L55 | neighbors=[route.ts]
- "delete_route_delete": "DELETE()" | kind=code-symbol | source=src/app/api/sales/cart/delete/route.ts:L6 | neighbors=[route.ts]
- "details_route_get": "GET()" | kind=code-symbol | source=src/app/api/sales/invoice/details/route.ts:L6 | neighbors=[route.ts]
- "details_route_p": "P" | kind=code-symbol | source=src/app/api/inventory-entry/packings/[pack_uq]/details/route.ts:L4 | neighbors=[route.ts]
- "discounts_route_delete": "DELETE()" | kind=code-symbol | source=src/app/api/customer-payments/discounts/route.ts:L19 | neighbors=[route.ts]
- "discounts_route_post": "POST()" | kind=code-symbol | source=src/app/api/customer-payments/discounts/route.ts:L4 | neighbors=[route.ts]
- "documents_route_get": "GET()" | kind=code-symbol | source=src/app/api/vendors/documents/route.ts:L7 | neighbors=[route.ts]
- "documents_route_post": "POST()" | kind=code-symbol | source=src/app/api/vendors/documents/route.ts:L19 | neighbors=[route.ts]
- "duties_route_get": "GET()" | kind=code-symbol | source=src/app/api/awbs/reports/duties/route.tsx:L11 | neighbors=[route.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-093.json

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
