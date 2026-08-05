# Node Description Batch 42 of 139

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
For an entity node (any other kind — e.g. a person, place, event, object),
describe what the entity is and its role, grounded in its type, its
relations (neighbors) and the provided citations/evidence — e.g.
"Lady Carfax, a wealthy heiress who disappears en route to Lausanne.".
Ground entity descriptions in the citations/evidence when present; do not
speculate beyond the context, so a node with no supporting context may be
left out of the reply.
Write every description in English (en). Do not switch languages.
No marketing language.
Respond ONLY with a JSON object mapping each node id (as a string) to its
one-sentence description — no prose, no markdown fences.

- "account_resume_route": "route.ts" | kind=code-symbol | source=src/app/api/customer-payments/account-resume/route.ts:L1 | neighbors=[GET(), db.ts, executeProcedure()]
- "airlines_route_post": "POST()" | kind=code-symbol | source=src/app/api/freights/airlines/route.ts:L21 | neighbors=[route.ts, genUq(), txt()]
- "all_route": "route.ts" | kind=code-symbol | source=src/app/api/masters/items/products/all/route.ts:L1 | neighbors=[GET(), db.ts, executeProcedure()]
- "all_statements_route": "route.ts" | kind=code-symbol | source=src/app/api/customer-payments/reports/all-statements/route.ts:L1 | neighbors=[GET(), db.ts, executeProcedure()]
- "alternatives_route": "route.ts" | kind=code-symbol | source=src/app/api/masters/items/products/[unico]/alternatives/route.ts:L1 | neighbors=[GET(), db.ts, executeProcedure()]
- "ap_types_route": "route.ts" | kind=code-symbol | source=src/app/api/accounts-payable/ap-types/route.ts:L1 | neighbors=[GET(), db.ts, executeProcedure()]
- "assigned_route": "route.ts" | kind=code-symbol | source=src/app/api/masters/items/po-prices/assigned/route.ts:L1 | neighbors=[GET(), db.ts, executeProcedure()]
- "atpda_route_post": "POST()" | kind=code-symbol | source=src/app/api/freights/atpda/route.ts:L21 | neighbors=[route.ts, num(), txt()]
- "attach_candidates_route": "route.ts" | kind=code-symbol | source=src/app/api/pbook2invoice/attach-candidates/route.ts:L1 | neighbors=[GET(), db.ts, executeProcedure()]
- "available_route": "route.ts" | kind=code-symbol | source=src/app/api/masters/items/warehouses-bogo/available/route.ts:L1 | neighbors=[GET(), db.ts, executeProcedure()]
- "awb_by_date_route": "route.ts" | kind=code-symbol | source=src/app/api/inventory-entry/awb-by-date/route.ts:L1 | neighbors=[GET(), db.ts, executeProcedure()]
- "awb_cporder_route_fmtdate": "fmtDate()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/awb-cporder/route.tsx:L9 | neighbors=[route.tsx, t(), GET()]
- "awb_cporder_route_get": "GET()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/awb-cporder/route.tsx:L25 | neighbors=[route.tsx, fmtDate(), t()]
- "awb_cporder_route_t": "t()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/awb-cporder/route.tsx:L7 | neighbors=[route.tsx, fmtDate(), GET()]
- "awb_dates_route": "route.ts" | kind=code-symbol | source=src/app/api/inventory-entry/awb-dates/route.ts:L1 | neighbors=[GET(), db.ts, executeProcedure()]
- "awb_full_route_t": "t()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/awb-full/route.tsx:L7 | neighbors=[route.tsx, fmtDate(), GET()]
- "awb_search_route": "route.ts" | kind=code-symbol | source=src/app/api/inventory-entry/awb-search/route.ts:L1 | neighbors=[GET(), db.ts, executeProcedure()]
- "awbcode_route": "route.ts" | kind=code-symbol | source=src/app/api/awbs/template/[awbcode]/route.ts:L1 | neighbors=[DELETE(), GET(), PUT()]
- "awbs_page_awbspage": "AwbsPage()" | kind=code-symbol | source=src/app/awbs/page.tsx:L738 | neighbors=[page.tsx, fmtDate(), t()]
- "balance_route": "route.ts" | kind=code-symbol | source=src/app/api/accounts-payable/reports/balance/route.ts:L1 | neighbors=[GET(), db.ts, executeProcedure()]
- "boxes_route_post": "POST()" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/route.ts:L12 | neighbors=[route.ts, bit(), num()]
- "by_bank_route": "route.ts" | kind=code-symbol | source=src/app/api/payment-authorizations/outcomes/by-bank/route.ts:L1 | neighbors=[GET(), db.ts, executeProcedure()]
- "carrier_route_post": "POST()" | kind=code-symbol | source=src/app/api/masters/customers/carrier/route.ts:L21 | neighbors=[route.ts, bit(), txt()]
- "charge_types_date_route": "route.ts" | kind=code-symbol | source=src/app/api/awbs/lookups/charge-types-date/route.ts:L1 | neighbors=[GET(), db.ts, executeProcedure()]
- "charge_types_route": "route.ts" | kind=code-symbol | source=src/app/api/awbs/lookups/charge-types/route.ts:L1 | neighbors=[GET(), db.ts, executeProcedure()]
- "check_modal_sps": "check-modal-sps.mjs" | kind=code-symbol | source=check-modal-sps.mjs:L1 | neighbors=[config, main(), sps]
- "cities_route_post": "POST()" | kind=code-symbol | source=src/app/api/sales-reps/cities/route.ts:L24 | neighbors=[route.ts, genUq(), txt()]
- "clean_all_route": "route.ts" | kind=code-symbol | source=src/app/api/masters/items/subclass-bogo/clean-all/route.ts:L1 | neighbors=[PUT(), db.ts, executeProcedure()]
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@6eb5e58d77882cb5108a5d10ba2b15590beb9a1d": "6eb5e58 fix(system-users): cast recordsets to any[] to satisfy TS index type" | kind=Commit | source=git | neighbors=[worktree-agent-a59e3078904cba68a, 7efdb5e fix(system-users): replace miss…, route.ts]
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@72f52297a187d50cf9fa05c99ae6c64b27ac15b4": "72f5229 docs(claude): add design document references + sp_NC_* CRUD SP template" | kind=Commit | source=git | neighbors=[085a822 fix(accounts-payable): mobile t…, worktree-agent-a59e3078904cba68a, 5949fec feat(audit): server-side bitaco…]
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@c3897b72905e291ae669f796be0a0ca3c31a6d30": "c3897b7 docs(standards): require SP authorization before any CREATE/ALTER/DROP" | kind=Commit | source=git | neighbors=[worktree-agent-a59e3078904cba68a, 3907ed7 feat(customer-payments): defaul…, e5fdd2c docs(standards): SP return form…]
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@f035be93ae76f1d2b169847b86849de344e87594": "f035be9 fix(ar): use invoice_uq (flower_invoice.unico) for invoice print/email" | kind=Commit | source=git | neighbors=[ba40c73 feat(ar): fix invoice print/ema…, master, page.tsx]
- "companies_route_post": "POST()" | kind=code-symbol | source=src/app/api/system/companies/route.ts:L35 | neighbors=[route.ts, bit(), txt()]
- "components_confirmdelete": "ConfirmDelete.tsx" | kind=code-symbol | source=src/components/ConfirmDelete.tsx:L1 | neighbors=[page.tsx, ConfirmDelete(), page.tsx]
- "components_confirmdelete_confirmdelete": "ConfirmDelete()" | kind=code-symbol | source=src/components/ConfirmDelete.tsx:L3 | neighbors=[page.tsx, ConfirmDelete.tsx, page.tsx]
- "corporate_incomes_route": "route.ts" | kind=code-symbol | source=src/app/api/customer-payments/corporate-incomes/route.ts:L1 | neighbors=[GET(), db.ts, executeProcedure()]
- "countries_route": "route.ts" | kind=code-symbol | source=src/app/api/masters/items/lookups/countries/route.ts:L1 | neighbors=[GET(), db.ts, executeProcedure()]
- "credit_requests_route": "route.ts" | kind=code-symbol | source=src/app/api/customer-payments/credit-requests/route.ts:L1 | neighbors=[GET(), db.ts, executeProcedure()]
- "customer_search_candidates_route": "route.ts" | kind=code-symbol | source=src/app/api/pbook2invoice/customer-search-candidates/route.ts:L1 | neighbors=[GET(), db.ts, executeProcedure()]
- "customers_for_statement_route": "route.ts" | kind=code-symbol | source=src/app/api/customer-payments/customers-for-statement/route.ts:L1 | neighbors=[GET(), db.ts, executeProcedure()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-041.json

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
