# Node Description Batch 104 of 139

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

- "payment_authorizations_page_pafetch": "paFetch()" | kind=code-symbol | source=src/app/payment-authorizations/page.tsx:L41 | neighbors=[page.tsx]
- "payment_authorizations_page_toastconfirm": "toastConfirm()" | kind=code-symbol | source=src/app/payment-authorizations/page.tsx:L49 | neighbors=[page.tsx]
- "payment_authorizations_page_vfp_skip_modal": "VFP_SKIP_MODAL" | kind=code-symbol | source=src/app/payment-authorizations/page.tsx:L34 | neighbors=[page.tsx]
- "payment_invoices_route_get": "GET()" | kind=code-symbol | source=src/app/api/payment-authorizations/payment-invoices/route.ts:L4 | neighbors=[route.ts]
- "payment_single_route_get": "GET()" | kind=code-symbol | source=src/app/api/payment-authorizations/reports/payment-single/route.tsx:L10 | neighbors=[route.tsx]
- "payments_resume_route_get": "GET()" | kind=code-symbol | source=src/app/api/payment-authorizations/reports/payments-resume/route.tsx:L11 | neighbors=[route.tsx]
- "payments_route_get": "GET()" | kind=code-symbol | source=src/app/api/payment-authorizations/reports/payments/route.tsx:L13 | neighbors=[route.tsx]
- "pbook2invoice_modalattachinvoice_props": "Props" | kind=code-symbol | source=src/components/pbook2invoice/ModalAttachInvoice.tsx:L13 | neighbors=[ModalAttachInvoice.tsx]
- "pbook2invoice_modalchangecustomer_props": "Props" | kind=code-symbol | source=src/components/pbook2invoice/ModalChangeCustomer.tsx:L13 | neighbors=[ModalChangeCustomer.tsx]
- "pbook2invoice_modalchangepo_props": "Props" | kind=code-symbol | source=src/components/pbook2invoice/ModalChangePO.tsx:L8 | neighbors=[ModalChangePO.tsx]
- "pbook2invoice_modalinvoicesbycustomer_fmt": "fmt()" | kind=code-symbol | source=src/components/pbook2invoice/ModalInvoicesByCustomer.tsx:L7 | neighbors=[ModalInvoicesByCustomer.tsx]
- "pbook2invoice_modalinvoicesbycustomer_fmtdate": "fmtDate()" | kind=code-symbol | source=src/components/pbook2invoice/ModalInvoicesByCustomer.tsx:L8 | neighbors=[ModalInvoicesByCustomer.tsx]
- "pbook2invoice_modalinvoicesbycustomer_fmti": "fmtI()" | kind=code-symbol | source=src/components/pbook2invoice/ModalInvoicesByCustomer.tsx:L6 | neighbors=[ModalInvoicesByCustomer.tsx]
- "pbook2invoice_modalinvoicesbycustomer_props": "Props" | kind=code-symbol | source=src/components/pbook2invoice/ModalInvoicesByCustomer.tsx:L10 | neighbors=[ModalInvoicesByCustomer.tsx]
- "pbook2invoice_modalinvoicesbycustomer_t": "t()" | kind=code-symbol | source=src/components/pbook2invoice/ModalInvoicesByCustomer.tsx:L5 | neighbors=[ModalInvoicesByCustomer.tsx]
- "pbook2invoice_modalpartialinvoice_fmti": "fmtI()" | kind=code-symbol | source=src/components/pbook2invoice/ModalPartialInvoice.tsx:L7 | neighbors=[ModalPartialInvoice.tsx]
- "pbook2invoice_modalpartialinvoice_props": "Props" | kind=code-symbol | source=src/components/pbook2invoice/ModalPartialInvoice.tsx:L9 | neighbors=[ModalPartialInvoice.tsx]
- "pbook2invoice_modalpartialinvoice_t": "t()" | kind=code-symbol | source=src/components/pbook2invoice/ModalPartialInvoice.tsx:L6 | neighbors=[ModalPartialInvoice.tsx]
- "pbook2invoice_modalunassignstock_props": "Props" | kind=code-symbol | source=src/components/pbook2invoice/ModalUnassignStock.tsx:L8 | neighbors=[ModalUnassignStock.tsx]
- "pbook2invoice_modalupdateline_field": "Field()" | kind=code-symbol | source=src/components/pbook2invoice/ModalUpdateLine.tsx:L170 | neighbors=[ModalUpdateLine.tsx]
- "pbook2invoice_modalupdateline_field_keys": "FIELD_KEYS" | kind=code-symbol | source=src/components/pbook2invoice/ModalUpdateLine.tsx:L18 | neighbors=[ModalUpdateLine.tsx]
- "pbook2invoice_modalupdateline_fieldprops": "FieldProps" | kind=code-symbol | source=src/components/pbook2invoice/ModalUpdateLine.tsx:L161 | neighbors=[ModalUpdateLine.tsx]
- "pbook2invoice_modalupdateline_int": "int()" | kind=code-symbol | source=src/components/pbook2invoice/ModalUpdateLine.tsx:L8 | neighbors=[ModalUpdateLine.tsx]
- "pbook2invoice_modalupdateline_num": "num()" | kind=code-symbol | source=src/components/pbook2invoice/ModalUpdateLine.tsx:L7 | neighbors=[ModalUpdateLine.tsx]
- "pbook2invoice_modalupdateline_props": "Props" | kind=code-symbol | source=src/components/pbook2invoice/ModalUpdateLine.tsx:L10 | neighbors=[ModalUpdateLine.tsx]
- "pbook2invoice_modalupdateline_textfield": "TextField()" | kind=code-symbol | source=src/components/pbook2invoice/ModalUpdateLine.tsx:L189 | neighbors=[ModalUpdateLine.tsx]
- "pbook2invoice_modalupdateline_textfieldprops": "TextFieldProps" | kind=code-symbol | source=src/components/pbook2invoice/ModalUpdateLine.tsx:L183 | neighbors=[ModalUpdateLine.tsx]
- "pbook2invoice_page_assignedstocktab": "AssignedStockTab()" | kind=code-symbol | source=src/app/pbook2invoice/page.tsx:L195 | neighbors=[page.tsx]
- "pbook2invoice_page_bottom_tabs": "BOTTOM_TABS" | kind=code-symbol | source=src/app/pbook2invoice/page.tsx:L62 | neighbors=[page.tsx]
- "pbook2invoice_page_empty_arr": "EMPTY_ARR" | kind=code-symbol | source=src/app/pbook2invoice/page.tsx:L32 | neighbors=[page.tsx]
- "pbook2invoice_page_fmt": "fmt()" | kind=code-symbol | source=src/app/pbook2invoice/page.tsx:L38 | neighbors=[page.tsx]
- "pbook2invoice_page_fmti": "fmtI()" | kind=code-symbol | source=src/app/pbook2invoice/page.tsx:L39 | neighbors=[page.tsx]
- "pbook2invoice_page_headertools": "HeaderTools()" | kind=code-symbol | source=src/app/pbook2invoice/page.tsx:L115 | neighbors=[page.tsx]
- "pbook2invoice_page_norm": "norm()" | kind=code-symbol | source=src/app/pbook2invoice/page.tsx:L36 | neighbors=[page.tsx]
- "pbook2invoice_page_normone": "normOne()" | kind=code-symbol | source=src/app/pbook2invoice/page.tsx:L37 | neighbors=[page.tsx]
- "pbook2invoice_page_purchasetab": "PurchaseTab()" | kind=code-symbol | source=src/app/pbook2invoice/page.tsx:L261 | neighbors=[page.tsx]
- "pbook2invoice_page_sbtn": "SBtn()" | kind=code-symbol | source=src/app/pbook2invoice/page.tsx:L104 | neighbors=[page.tsx]
- "pbook2invoice_page_similartab": "SimilarTab()" | kind=code-symbol | source=src/app/pbook2invoice/page.tsx:L371 | neighbors=[page.tsx]
- "pbook2invoice_page_stockomtab": "StockOmTab()" | kind=code-symbol | source=src/app/pbook2invoice/page.tsx:L307 | neighbors=[page.tsx]
- "pbook2invoice_page_tbtn": "TBtn()" | kind=code-symbol | source=src/app/pbook2invoice/page.tsx:L87 | neighbors=[page.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-103.json

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
