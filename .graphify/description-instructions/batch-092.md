# Node Description Batch 93 of 139

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

- "composition_uq_route_p": "P" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/composition/[composition_uq]/route.ts:L7 | neighbors=[route.ts]
- "composition_uq_route_str": "str()" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/composition/[composition_uq]/route.ts:L9 | neighbors=[route.ts]
- "confirm_route_post": "POST()" | kind=code-symbol | source=src/app/api/scan-out/confirm/route.ts:L11 | neighbors=[route.ts]
- "context_flexy2qbcontext_flexy2qbcontext": "Flexy2QBContext" | kind=code-symbol | source=src/app/flexy2qb/context/Flexy2QBContext.tsx:L63 | neighbors=[Flexy2QBContext.tsx]
- "context_flexy2qbcontext_flexy2qbprovider": "Flexy2QBProvider()" | kind=code-symbol | source=src/app/flexy2qb/context/Flexy2QBContext.tsx:L65 | neighbors=[Flexy2QBContext.tsx]
- "context_flexy2qbcontext_flexy2qbstate": "Flexy2QBState" | kind=code-symbol | source=src/app/flexy2qb/context/Flexy2QBContext.tsx:L5 | neighbors=[Flexy2QBContext.tsx]
- "context_flexy2qbcontext_useflexy2qbcontext": "useFlexy2QBContext()" | kind=code-symbol | source=src/app/flexy2qb/context/Flexy2QBContext.tsx:L127 | neighbors=[Flexy2QBContext.tsx]
- "context_qccontext_qccontext": "QCContext" | kind=code-symbol | source=src/app/qc/context/QCContext.tsx:L29 | neighbors=[QCContext.tsx]
- "context_qccontext_qcstate": "QCState" | kind=code-symbol | source=src/app/qc/context/QCContext.tsx:L5 | neighbors=[QCContext.tsx]
- "copy_route_p": "P" | kind=code-symbol | source=src/app/api/inventory-entry/packings/[pack_uq]/copy/route.ts:L7 | neighbors=[route.ts]
- "cor_pay_uq_route_get": "GET()" | kind=code-symbol | source=src/app/api/customer-payments/corporate-invoices/[cor_pay_uq]/route.ts:L5 | neighbors=[route.ts]
- "cor_pay_uq_route_p": "P" | kind=code-symbol | source=src/app/api/customer-payments/corporate-invoices/[cor_pay_uq]/route.ts:L3 | neighbors=[route.ts]
- "corporate_income_route_post": "POST()" | kind=code-symbol | source=src/app/api/customer-payments/corporate-income/route.ts:L4 | neighbors=[route.ts]
- "corporate_incomes_route_get": "GET()" | kind=code-symbol | source=src/app/api/customer-payments/corporate-incomes/route.ts:L4 | neighbors=[route.ts]
- "corporate_invoice_route_post": "POST()" | kind=code-symbol | source=src/app/api/customer-payments/corporate-invoice/route.ts:L4 | neighbors=[route.ts]
- "countries_route_get": "GET()" | kind=code-symbol | source=src/app/api/masters/items/lookups/countries/route.ts:L4 | neighbors=[route.ts]
- "crdb_reasons_route_get": "GET()" | kind=code-symbol | source=src/app/api/payment-authorizations/crdb-reasons/route.ts:L7 | neighbors=[route.ts]
- "crdb_route_delete": "DELETE()" | kind=code-symbol | source=src/app/api/payment-authorizations/crdb/route.ts:L64 | neighbors=[route.tsx]
- "crdb_route_get": "GET()" | kind=code-symbol | source=src/app/api/payment-authorizations/reports/crdb/route.tsx:L12 | neighbors=[route.tsx]
- "crdb_route_post": "POST()" | kind=code-symbol | source=src/app/api/payment-authorizations/crdb/route.ts:L22 | neighbors=[route.tsx]
- "crdb_route_put": "PUT()" | kind=code-symbol | source=src/app/api/payment-authorizations/crdb/route.ts:L43 | neighbors=[route.tsx]
- "create_route_int": "int()" | kind=code-symbol | source=src/app/api/masters/customers/create/route.ts:L8 | neighbors=[route.ts]
- "credit_requests_route_get": "GET()" | kind=code-symbol | source=src/app/api/customer-payments/credit-requests/route.ts:L4 | neighbors=[route.ts]
- "credits_route_get": "GET()" | kind=code-symbol | source=src/app/api/pos/history/credits/route.ts:L8 | neighbors=[route.ts]
- "customer_payments_ar_corporate_income_sps": "ar_corporate_income_sps.sql" | kind=code-symbol | source=sql/customer-payments/ar_corporate_income_sps.sql:L1 | neighbors=[e5fdd2c docs(standards): SP return form…]
- "customer_payments_ar_payment_detail_sps": "ar_payment_detail_sps.sql" | kind=code-symbol | source=sql/customer-payments/ar_payment_detail_sps.sql:L1 | neighbors=[e5fdd2c docs(standards): SP return form…]
- "customer_payments_page_crdbcalendar": "CrDbCalendar()" | kind=code-symbol | source=src/app/sales/customer-payments/page.tsx:L282 | neighbors=[page.tsx]
- "customer_payments_page_customerpaymentspage": "CustomerPaymentsPage()" | kind=code-symbol | source=src/app/sales/customer-payments/page.tsx:L360 | neighbors=[page.tsx]
- "customer_payments_page_cutdatemodal": "CutDateModal()" | kind=code-symbol | source=src/app/sales/customer-payments/page.tsx:L43 | neighbors=[page.tsx]
- "customer_payments_page_day_labels": "DAY_LABELS" | kind=code-symbol | source=src/app/sales/customer-payments/page.tsx:L280 | neighbors=[page.tsx]
- "customer_payments_page_month_names": "MONTH_NAMES" | kind=code-symbol | source=src/app/sales/customer-payments/page.tsx:L279 | neighbors=[page.tsx]
- "customer_payments_page_sendallmodal": "SendAllModal()" | kind=code-symbol | source=src/app/sales/customer-payments/page.tsx:L67 | neighbors=[page.tsx]
- "customer_payments_page_statementpreviewmodal": "StatementPreviewModal()" | kind=code-symbol | source=src/app/sales/customer-payments/page.tsx:L228 | neighbors=[page.tsx]
- "customer_search_candidates_route_get": "GET()" | kind=code-symbol | source=src/app/api/pbook2invoice/customer-search-candidates/route.ts:L4 | neighbors=[route.ts]
- "customer_uq_route_get": "GET()" | kind=code-symbol | source=src/app/api/customer-payments/statement/[customer_uq]/route.ts:L5 | neighbors=[route.ts]
- "customer_uq_route_p": "P" | kind=code-symbol | source=src/app/api/customer-payments/statement/[customer_uq]/route.ts:L3 | neighbors=[route.ts]
- "customers_for_statement_route_get": "GET()" | kind=code-symbol | source=src/app/api/customer-payments/customers-for-statement/route.ts:L4 | neighbors=[route.ts]
- "customers_page_apifetch": "apiFetch()" | kind=code-symbol | source=src/app/masters/customers/page.tsx:L28 | neighbors=[page.tsx]
- "customers_page_avail_opts": "AVAIL_OPTS" | kind=code-symbol | source=src/app/masters/customers/page.tsx:L31 | neighbors=[page.tsx]
- "customers_page_call_opts": "CALL_OPTS" | kind=code-symbol | source=src/app/masters/customers/page.tsx:L30 | neighbors=[page.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-092.json

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
