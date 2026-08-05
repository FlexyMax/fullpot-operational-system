# Node Description Batch 103 of 139

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

- "open_route_post": "POST()" | kind=code-symbol | source=src/app/api/sales/invoice/open/route.ts:L6 | neighbors=[route.ts]
- "order_route_get": "GET()" | kind=code-symbol | source=src/app/api/scan-out/order/route.ts:L7 | neighbors=[route.ts]
- "orders_route_get": "GET()" | kind=code-symbol | source=src/app/api/standing-orders/orders/route.ts:L6 | neighbors=[route.ts]
- "others_route_put": "PUT()" | kind=code-symbol | source=src/app/api/masters/carriers/[unico]/others/route.ts:L7 | neighbors=[route.ts]
- "outcome_details_route_delete": "DELETE()" | kind=code-symbol | source=src/app/api/payment-authorizations/outcome-details/route.ts:L56 | neighbors=[route.ts]
- "outcome_details_route_get": "GET()" | kind=code-symbol | source=src/app/api/payment-authorizations/outcome-details/route.ts:L7 | neighbors=[route.ts]
- "outcome_details_route_post": "POST()" | kind=code-symbol | source=src/app/api/payment-authorizations/outcome-details/route.ts:L21 | neighbors=[route.ts]
- "outcome_details_route_put": "PUT()" | kind=code-symbol | source=src/app/api/payment-authorizations/outcome-details/route.ts:L38 | neighbors=[route.ts]
- "outcomes_route_get": "GET()" | kind=code-symbol | source=src/app/api/payment-authorizations/outcomes/route.ts:L4 | neighbors=[route.ts]
- "pack_uq_route_delete": "DELETE()" | kind=code-symbol | source=src/app/api/inventory-entry/packings/[pack_uq]/route.ts:L50 | neighbors=[route.ts]
- "pack_uq_route_get": "GET()" | kind=code-symbol | source=src/app/api/inventory-entry/packings/[pack_uq]/route.ts:L14 | neighbors=[route.ts]
- "pack_uq_route_int": "int()" | kind=code-symbol | source=src/app/api/inventory-entry/packings/[pack_uq]/route.ts:L11 | neighbors=[route.ts]
- "pack_uq_route_p": "P" | kind=code-symbol | source=src/app/api/inventory-entry/packings/[pack_uq]/route.ts:L8 | neighbors=[route.ts]
- "pack_uq_route_str": "str()" | kind=code-symbol | source=src/app/api/inventory-entry/packings/[pack_uq]/route.ts:L10 | neighbors=[route.ts]
- "packing_arrived_route_columns": "COLUMNS" | kind=code-symbol | source=src/app/api/inventory-entry/reports/packing-arrived/route.tsx:L12 | neighbors=[route.tsx]
- "packing_arrived_route_fmt": "fmt()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/packing-arrived/route.tsx:L8 | neighbors=[route.tsx]
- "packing_arrived_route_fmti": "fmtI()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/packing-arrived/route.tsx:L9 | neighbors=[route.tsx]
- "packing_box_by_awb_route_get": "GET()" | kind=code-symbol | source=src/app/api/inventory-entry/packing-box-by-awb/route.ts:L4 | neighbors=[route.ts]
- "packing_invoices_route_columns": "COLUMNS" | kind=code-symbol | source=src/app/api/inventory-entry/reports/packing-invoices/route.tsx:L16 | neighbors=[route.tsx]
- "packing_invoices_route_fmtdate": "fmtDate()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/packing-invoices/route.tsx:L9 | neighbors=[route.tsx]
- "packing_invoices_route_fmti": "fmtI()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/packing-invoices/route.tsx:L8 | neighbors=[route.tsx]
- "packing_route_get": "GET()" | kind=code-symbol | source=src/app/api/awbs/[awbcode]/packing/route.ts:L4 | neighbors=[route.ts]
- "packing_x_awb_route_get": "GET()" | kind=code-symbol | source=src/app/api/inventory-entry/packing-x-awb/route.ts:L4 | neighbors=[route.ts]
- "packings_route_int": "int()" | kind=code-symbol | source=src/app/api/inventory-entry/packings/route.ts:L10 | neighbors=[route.ts]
- "packings_route_str": "str()" | kind=code-symbol | source=src/app/api/inventory-entry/packings/route.ts:L9 | neighbors=[route.ts]
- "packs_route_get": "GET()" | kind=code-symbol | source=src/app/api/masters/items/varieties/[unico]/packs/route.ts:L6 | neighbors=[route.ts]
- "packs_route_post": "POST()" | kind=code-symbol | source=src/app/api/masters/items/varieties/[unico]/packs/route.ts:L16 | neighbors=[route.ts]
- "packunico_route_delete": "DELETE()" | kind=code-symbol | source=src/app/api/masters/items/varieties/[unico]/packs/[packUnico]/route.ts:L26 | neighbors=[route.ts]
- "packunico_route_put": "PUT()" | kind=code-symbol | source=src/app/api/masters/items/varieties/[unico]/packs/[packUnico]/route.ts:L6 | neighbors=[route.ts]
- "partial_candidates_route_get": "GET()" | kind=code-symbol | source=src/app/api/pbook2invoice/partial-candidates/route.ts:L4 | neighbors=[route.ts]
- "partial_invoice_route_post": "POST()" | kind=code-symbol | source=src/app/api/pbook2invoice/partial-invoice/route.ts:L6 | neighbors=[route.ts]
- "pay_all_route_post": "POST()" | kind=code-symbol | source=src/app/api/customer-payments/pay-all/route.ts:L4 | neighbors=[route.ts]
- "payment_authorizations_page_contact_skip_det": "CONTACT_SKIP_DET" | kind=code-symbol | source=src/app/payment-authorizations/page.tsx:L36 | neighbors=[page.tsx]
- "payment_authorizations_page_empty_arr": "EMPTY_ARR" | kind=code-symbol | source=src/app/payment-authorizations/page.tsx:L25 | neighbors=[page.tsx]
- "payment_authorizations_page_id_skip_modal": "ID_SKIP_MODAL" | kind=code-symbol | source=src/app/payment-authorizations/page.tsx:L35 | neighbors=[page.tsx]
- "payment_authorizations_page_modal": "Modal()" | kind=code-symbol | source=src/app/payment-authorizations/page.tsx:L58 | neighbors=[page.tsx]
- "payment_authorizations_page_modaladdpayment": "ModalAddPayment()" | kind=code-symbol | source=src/app/payment-authorizations/page.tsx:L667 | neighbors=[page.tsx]
- "payment_authorizations_page_modalcreatebank": "ModalCreateBank()" | kind=code-symbol | source=src/app/payment-authorizations/page.tsx:L607 | neighbors=[page.tsx]
- "payment_authorizations_page_modaleditpayment": "ModalEditPayment()" | kind=code-symbol | source=src/app/payment-authorizations/page.tsx:L746 | neighbors=[page.tsx]
- "payment_authorizations_page_norm": "norm()" | kind=code-symbol | source=src/app/payment-authorizations/page.tsx:L32 | neighbors=[page.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-102.json

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
