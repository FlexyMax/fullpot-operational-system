# Node Description Batch 44 of 139

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

- "modals_qcmodal_fromcredit": "fromCredit()" | kind=code-symbol | source=src/app/qc/components/modals/QCModal.tsx:L73 | neighbors=[QCModal.tsx, toDateStr(), today()]
- "modals_qcmodal_today": "today()" | kind=code-symbol | source=src/app/qc/components/modals/QCModal.tsx:L9 | neighbors=[QCModal.tsx, blankForm(), fromCredit()]
- "mpf_route": "route.ts" | kind=code-symbol | source=src/app/api/awbs/varieties/mpf/route.ts:L1 | neighbors=[db.ts, executeProcedure(), PUT()]
- "next_config": "next.config.ts" | kind=code-symbol | source=next.config.ts:L1 | neighbors=[27ff929 fix(build): add turbopackUseSys…, 91cba6d fix(config): remove turbopackUs…, nextConfig]
- "no_scanned_route_fmtdate": "fmtDate()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/no-scanned/route.tsx:L9 | neighbors=[route.tsx, t(), GET()]
- "no_scanned_route_get": "GET()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/no-scanned/route.tsx:L20 | neighbors=[route.tsx, fmtDate(), t()]
- "no_scanned_route_t": "t()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/no-scanned/route.tsx:L7 | neighbors=[route.tsx, fmtDate(), GET()]
- "no_scanned_summary_route_t": "t()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/no-scanned-summary/route.tsx:L6 | neighbors=[route.tsx, fmtDate(), GET()]
- "outcomes_route": "route.ts" | kind=code-symbol | source=src/app/api/payment-authorizations/outcomes/route.ts:L1 | neighbors=[db.ts, executeProcedure(), GET()]
- "packing_arrived_route_fmtdate": "fmtDate()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/packing-arrived/route.tsx:L10 | neighbors=[route.tsx, t(), GET()]
- "packing_arrived_route_get": "GET()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/packing-arrived/route.tsx:L30 | neighbors=[route.tsx, fmtDate(), t()]
- "packing_arrived_route_t": "t()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/packing-arrived/route.tsx:L7 | neighbors=[route.tsx, fmtDate(), GET()]
- "packing_box_by_awb_route": "route.ts" | kind=code-symbol | source=src/app/api/inventory-entry/packing-box-by-awb/route.ts:L1 | neighbors=[db.ts, executeProcedure(), GET()]
- "packing_route": "route.ts" | kind=code-symbol | source=src/app/api/awbs/[awbcode]/packing/route.ts:L1 | neighbors=[db.ts, executeProcedure(), GET()]
- "packing_x_awb_route": "route.ts" | kind=code-symbol | source=src/app/api/inventory-entry/packing-x-awb/route.ts:L1 | neighbors=[db.ts, executeProcedure(), GET()]
- "packings_route_post": "POST()" | kind=code-symbol | source=src/app/api/inventory-entry/packings/route.ts:L14 | neighbors=[route.ts, bit(), newUnico()]
- "partial_candidates_route": "route.ts" | kind=code-symbol | source=src/app/api/pbook2invoice/partial-candidates/route.ts:L1 | neighbors=[db.ts, executeProcedure(), GET()]
- "pay_all_route": "route.ts" | kind=code-symbol | source=src/app/api/customer-payments/pay-all/route.ts:L1 | neighbors=[db.ts, executeProcedure(), POST()]
- "payment_authorizations_page_modalcrdb": "ModalCRDB()" | kind=code-symbol | source=src/app/payment-authorizations/page.tsx:L271 | neighbors=[page.tsx, fmt(), today()]
- "payment_authorizations_page_modalpayinvoice": "ModalPayInvoice()" | kind=code-symbol | source=src/app/payment-authorizations/page.tsx:L493 | neighbors=[page.tsx, fmt(), t()]
- "payment_authorizations_page_modalpaymentsreport": "ModalPaymentsReport()" | kind=code-symbol | source=src/app/payment-authorizations/page.tsx:L146 | neighbors=[page.tsx, t(), today()]
- "payment_authorizations_page_modalreports": "ModalReports()" | kind=code-symbol | source=src/app/payment-authorizations/page.tsx:L80 | neighbors=[page.tsx, t(), today()]
- "payment_authorizations_page_paymentauthorizationspage": "PaymentAuthorizationsPage()" | kind=code-symbol | source=src/app/payment-authorizations/page.tsx:L857 | neighbors=[page.tsx, fmt(), t()]
- "payment_invoices_route": "route.ts" | kind=code-symbol | source=src/app/api/payment-authorizations/payment-invoices/route.ts:L1 | neighbors=[db.ts, executeProcedure(), GET()]
- "pbook2invoice_modalchangecustomer_fmtdate": "fmtDate()" | kind=code-symbol | source=src/components/pbook2invoice/ModalChangeCustomer.tsx:L7 | neighbors=[ModalChangeCustomer.tsx, t(), ModalChangeCustomer()]
- "pbook2invoice_modalchangecustomer_t": "t()" | kind=code-symbol | source=src/components/pbook2invoice/ModalChangeCustomer.tsx:L6 | neighbors=[ModalChangeCustomer.tsx, fmtDate(), ModalChangeCustomer()]
- "pbook2invoice_modalchangepo_modalchangepo": "ModalChangePO()" | kind=code-symbol | source=src/components/pbook2invoice/ModalChangePO.tsx:L16 | neighbors=[ModalChangePO.tsx, t(), page.tsx]
- "pbook2invoice_modalunassignstock_modalunassignstock": "ModalUnassignStock()" | kind=code-symbol | source=src/components/pbook2invoice/ModalUnassignStock.tsx:L15 | neighbors=[ModalUnassignStock.tsx, t(), page.tsx]
- "pbook2invoice_modalupdateline_modalupdateline": "ModalUpdateLine()" | kind=code-symbol | source=src/components/pbook2invoice/ModalUpdateLine.tsx:L25 | neighbors=[ModalUpdateLine.tsx, t(), page.tsx]
- "pbook2invoice_page_pbook2invoicepage": "Pbook2InvoicePage()" | kind=code-symbol | source=src/app/pbook2invoice/page.tsx:L433 | neighbors=[page.tsx, fmtDate(), t()]
- "pbook2invoice_page_t": "t()" | kind=code-symbol | source=src/app/pbook2invoice/page.tsx:L35 | neighbors=[page.tsx, InvoicedTab(), Pbook2InvoicePage()]
- "pending_invoices_route": "route.ts" | kind=code-symbol | source=src/app/api/customer-payments/reports/pending-invoices/route.ts:L1 | neighbors=[db.ts, executeProcedure(), POST()]
- "physical_warehouses_route": "route.ts" | kind=code-symbol | source=src/app/api/sales-reps/physical-warehouses/route.ts:L1 | neighbors=[db.ts, executeProcedure(), GET()]
- "pick_list_route_get": "GET()" | kind=code-symbol | source=src/app/api/pbook2invoice/reports/pick-list/route.tsx:L23 | neighbors=[route.tsx, fmtDate(), t()]
- "ping_route": "route.ts" | kind=code-symbol | source=src/app/api/db/ping/route.ts:L1 | neighbors=[db.ts, getSistemaPool(), GET()]
- "pl_control_route": "route.ts" | kind=code-symbol | source=src/app/api/inventory-entry/pl-control/route.ts:L1 | neighbors=[db.ts, executeProcedure(), GET()]
- "pobs_route": "route.ts" | kind=code-symbol | source=src/app/api/accounts-payable/pobs/route.ts:L1 | neighbors=[db.ts, executeProcedure(), GET()]
- "prebooks_route": "route.ts" | kind=code-symbol | source=src/app/api/accounts-payable/prebooks/route.ts:L1 | neighbors=[db.ts, executeProcedure(), GET()]
- "print_composition_route_get": "GET()" | kind=code-symbol | source=src/app/api/masters/items/products/[unico]/print-composition/route.tsx:L27 | neighbors=[route.tsx, n(), t()]
- "products_route_fmtdate": "fmtDate()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/products/route.tsx:L10 | neighbors=[route.ts, t(), GET()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-043.json

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
