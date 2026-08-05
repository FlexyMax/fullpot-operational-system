# Node Description Batch 91 of 139

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

- "carriers_page_empty": "EMPTY" | kind=code-symbol | source=src/app/masters/carriers/page.tsx:L55 | neighbors=[page.tsx]
- "carriers_page_empty_arr": "EMPTY_ARR" | kind=code-symbol | source=src/app/masters/carriers/page.tsx:L23 | neighbors=[page.tsx]
- "carriers_page_f": "F()" | kind=code-symbol | source=src/app/masters/carriers/page.tsx:L64 | neighbors=[page.tsx]
- "carriers_page_sf": "sF()" | kind=code-symbol | source=src/app/masters/carriers/page.tsx:L48 | neighbors=[page.tsx]
- "carriers_route_get": "GET()" | kind=code-symbol | source=src/app/api/masters/carriers/route.ts:L8 | neighbors=[route.ts]
- "carriers_route_post": "POST()" | kind=code-symbol | source=src/app/api/masters/carriers/route.ts:L26 | neighbors=[route.ts]
- "cases_route_get": "GET()" | kind=code-symbol | source=src/app/api/masters/items/cases/route.ts:L11 | neighbors=[route.ts]
- "cases_route_int": "int()" | kind=code-symbol | source=src/app/api/masters/items/cases/route.ts:L9 | neighbors=[route.ts]
- "cashback_route_post": "POST()" | kind=code-symbol | source=src/app/api/customer-payments/cashback/route.ts:L4 | neighbors=[route.ts]
- "change_awb_route_p": "P" | kind=code-symbol | source=src/app/api/inventory-entry/packings/[pack_uq]/change-awb/route.ts:L7 | neighbors=[route.ts]
- "change_awb_route_post": "POST()" | kind=code-symbol | source=src/app/api/inventory-entry/packings/[pack_uq]/change-awb/route.ts:L11 | neighbors=[route.ts]
- "change_awb_route_str": "str()" | kind=code-symbol | source=src/app/api/inventory-entry/packings/[pack_uq]/change-awb/route.ts:L9 | neighbors=[route.ts]
- "change_customer_route_post": "POST()" | kind=code-symbol | source=src/app/api/standing-orders/change-customer/route.ts:L9 | neighbors=[route.ts]
- "change_po_route_post": "POST()" | kind=code-symbol | source=src/app/api/pbook2invoice/change-po/route.ts:L6 | neighbors=[route.ts]
- "change_salesman_route_post": "POST()" | kind=code-symbol | source=src/app/api/standing-orders/change-salesman/route.ts:L9 | neighbors=[route.ts]
- "change_season_route_post": "POST()" | kind=code-symbol | source=src/app/api/standing-orders/change-season/route.ts:L9 | neighbors=[route.ts]
- "charge_types_date_route_get": "GET()" | kind=code-symbol | source=src/app/api/awbs/lookups/charge-types-date/route.ts:L4 | neighbors=[route.ts]
- "charge_types_route_get": "GET()" | kind=code-symbol | source=src/app/api/awbs/lookups/charge-types/route.ts:L4 | neighbors=[route.ts]
- "charges_by_date_route_get": "GET()" | kind=code-symbol | source=src/app/api/awbs/charges-by-date/route.ts:L4 | neighbors=[route.ts]
- "charges_by_date_route_post": "POST()" | kind=code-symbol | source=src/app/api/awbs/charges-by-date/route.ts:L18 | neighbors=[route.ts]
- "charges_route_get": "GET()" | kind=code-symbol | source=src/app/api/awbs/reports/charges/route.tsx:L10 | neighbors=[route.tsx]
- "charges_route_post": "POST()" | kind=code-symbol | source=src/app/api/awbs/charges/route.ts:L10 | neighbors=[route.tsx]
- "check_modal_sps_config": "config" | kind=code-symbol | source=check-modal-sps.mjs:L3 | neighbors=[check-modal-sps.mjs]
- "check_modal_sps_main": "main()" | kind=code-symbol | source=check-modal-sps.mjs:L38 | neighbors=[check-modal-sps.mjs]
- "check_modal_sps_sps": "sps" | kind=code-symbol | source=check-modal-sps.mjs:L15 | neighbors=[check-modal-sps.mjs]
- "cities_route_delete": "DELETE()" | kind=code-symbol | source=src/app/api/sales-reps/cities/route.ts:L39 | neighbors=[route.ts]
- "cities_route_get": "GET()" | kind=code-symbol | source=src/app/api/sales-reps/cities/route.ts:L4 | neighbors=[route.ts]
- "classes_route_delete": "DELETE()" | kind=code-symbol | source=src/app/api/vendors/classes/route.ts:L43 | neighbors=[route.ts]
- "classes_route_get": "GET()" | kind=code-symbol | source=src/app/api/vendors/classes/route.ts:L7 | neighbors=[route.ts]
- "classes_route_post": "POST()" | kind=code-symbol | source=src/app/api/vendors/classes/route.ts:L27 | neighbors=[route.ts]
- "clean_all_route_put": "PUT()" | kind=code-symbol | source=src/app/api/masters/items/subclass-bogo/clean-all/route.ts:L4 | neighbors=[route.ts]
- "close_route_post": "POST()" | kind=code-symbol | source=src/app/api/pos/invoice/close/route.ts:L7 | neighbors=[route.ts]
- "colors_route_get": "GET()" | kind=code-symbol | source=src/app/api/masters/items/colors/route.ts:L6 | neighbors=[route.ts]
- "colors_route_post": "POST()" | kind=code-symbol | source=src/app/api/masters/items/colors/route.ts:L15 | neighbors=[route.ts]
- "column_route_allowed": "ALLOWED" | kind=code-symbol | source=src/app/api/system/access/column/route.ts:L6 | neighbors=[route.ts]
- "column_route_put": "PUT()" | kind=code-symbol | source=src/app/api/system/access/column/route.ts:L8 | neighbors=[route.ts]
- "companies_page_companyformmodal": "CompanyFormModal()" | kind=code-symbol | source=src/app/system/companies/page.tsx:L276 | neighbors=[page.tsx]
- "companies_page_empty_arr": "EMPTY_ARR" | kind=code-symbol | source=src/app/system/companies/page.tsx:L24 | neighbors=[page.tsx]
- "companies_page_empty_company": "EMPTY_COMPANY" | kind=code-symbol | source=src/app/system/companies/page.tsx:L33 | neighbors=[page.tsx]
- "companies_page_f": "F()" | kind=code-symbol | source=src/app/system/companies/page.tsx:L403 | neighbors=[page.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-090.json

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
