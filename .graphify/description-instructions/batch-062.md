# Node Description Batch 63 of 139

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

- "log_route_getempresauq": "getEmpresaUq()" | kind=code-symbol | source=src/app/api/audit/log/route.ts:L7 | neighbors=[route.ts, POST()]
- "log_route_post": "POST()" | kind=code-symbol | source=src/app/api/audit/log/route.ts:L16 | neighbors=[route.ts, getEmpresaUq()]
- "logo_route_extractjpeg": "extractJpeg()" | kind=code-symbol | source=src/app/api/system/companies/[unico]/logo/route.ts:L8 | neighbors=[route.ts, GET()]
- "logo_route_get": "GET()" | kind=code-symbol | source=src/app/api/system/companies/[unico]/logo/route.ts:L17 | neighbors=[route.ts, extractJpeg()]
- "menu_page_getgreeting": "getGreeting()" | kind=code-symbol | source=src/app/menu/page.tsx:L87 | neighbors=[page.tsx, MenuPage()]
- "menu_page_getlabel": "getLabel()" | kind=code-symbol | source=src/app/menu/page.tsx:L61 | neighbors=[page.tsx, getRoute()]
- "menu_page_getroute": "getRoute()" | kind=code-symbol | source=src/app/menu/page.tsx:L23 | neighbors=[page.tsx, getLabel()]
- "menu_page_menupage": "MenuPage()" | kind=code-symbol | source=src/app/menu/page.tsx:L96 | neighbors=[page.tsx, getGreeting()]
- "messages_route_post": "POST()" | kind=code-symbol | source=src/app/api/masters/customers/[unico]/messages/route.ts:L19 | neighbors=[route.ts, txt()]
- "messages_route_txt": "txt()" | kind=code-symbol | source=src/app/api/masters/customers/[unico]/messages/route.ts:L6 | neighbors=[route.ts, POST()]
- "modals_qcmodal_blankform": "blankForm()" | kind=code-symbol | source=src/app/qc/components/modals/QCModal.tsx:L62 | neighbors=[QCModal.tsx, today()]
- "modals_qcmodal_todatestr": "toDateStr()" | kind=code-symbol | source=src/app/qc/components/modals/QCModal.tsx:L11 | neighbors=[QCModal.tsx, fromCredit()]
- "modules_page_modulescreensetuppage": "ModuleScreenSetupPage()" | kind=code-symbol | source=src/app/system/modules/page.tsx:L38 | neighbors=[page.tsx, t()]
- "modules_page_t": "t()" | kind=code-symbol | source=src/app/system/modules/page.tsx:L27 | neighbors=[page.tsx, ModuleScreenSetupPage()]
- "modules_route_bit": "bit()" | kind=code-symbol | source=src/app/api/system/modules/route.ts:L9 | neighbors=[route.ts, POST()]
- "modules_route_post": "POST()" | kind=code-symbol | source=src/app/api/system/modules/route.ts:L22 | neighbors=[route.ts, bit()]
- "no_scanned_summary_route_fmtdate": "fmtDate()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/no-scanned-summary/route.tsx:L8 | neighbors=[route.tsx, t()]
- "no_scanned_summary_route_get": "GET()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/no-scanned-summary/route.tsx:L17 | neighbors=[route.tsx, t()]
- "pack_uq_route_bit": "bit()" | kind=code-symbol | source=src/app/api/inventory-entry/packings/[pack_uq]/route.ts:L12 | neighbors=[route.ts, PUT()]
- "pack_uq_route_put": "PUT()" | kind=code-symbol | source=src/app/api/inventory-entry/packings/[pack_uq]/route.ts:L24 | neighbors=[route.ts, bit()]
- "packing_invoices_route_get": "GET()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/packing-invoices/route.tsx:L23 | neighbors=[route.tsx, t()]
- "packing_invoices_route_t": "t()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/packing-invoices/route.tsx:L7 | neighbors=[route.tsx, GET()]
- "packings_route_bit": "bit()" | kind=code-symbol | source=src/app/api/inventory-entry/packings/route.ts:L11 | neighbors=[route.ts, POST()]
- "packings_route_newunico": "newUnico()" | kind=code-symbol | source=src/app/api/inventory-entry/packings/route.ts:L12 | neighbors=[route.ts, POST()]
- "payment_authorizations_page_fmtdate": "fmtDate()" | kind=code-symbol | source=src/app/payment-authorizations/page.tsx:L30 | neighbors=[page.tsx, t()]
- "payment_authorizations_page_fmtmodalval": "fmtModalVal()" | kind=code-symbol | source=src/app/payment-authorizations/page.tsx:L39 | neighbors=[page.tsx, t()]
- "payment_authorizations_page_modaldatetohistory": "ModalDateToHistory()" | kind=code-symbol | source=src/app/payment-authorizations/page.tsx:L214 | neighbors=[page.tsx, today()]
- "payment_authorizations_page_skipdetailcol": "skipDetailCol()" | kind=code-symbol | source=src/app/payment-authorizations/page.tsx:L38 | neighbors=[page.tsx, skipModalCol()]
- "payment_authorizations_page_skipmodalcol": "skipModalCol()" | kind=code-symbol | source=src/app/payment-authorizations/page.tsx:L37 | neighbors=[page.tsx, skipDetailCol()]
- "pbook2invoice_modalattachinvoice_fmtdate": "fmtDate()" | kind=code-symbol | source=src/components/pbook2invoice/ModalAttachInvoice.tsx:L7 | neighbors=[ModalAttachInvoice.tsx, t()]
- "pbook2invoice_modalattachinvoice_modalattachinvoice": "ModalAttachInvoice()" | kind=code-symbol | source=src/components/pbook2invoice/ModalAttachInvoice.tsx:L20 | neighbors=[ModalAttachInvoice.tsx, page.tsx]
- "pbook2invoice_modalattachinvoice_t": "t()" | kind=code-symbol | source=src/components/pbook2invoice/ModalAttachInvoice.tsx:L6 | neighbors=[ModalAttachInvoice.tsx, fmtDate()]
- "pbook2invoice_modalchangepo_t": "t()" | kind=code-symbol | source=src/components/pbook2invoice/ModalChangePO.tsx:L6 | neighbors=[ModalChangePO.tsx, ModalChangePO()]
- "pbook2invoice_modalinvoicesbycustomer_modalinvoicesbycustomer": "ModalInvoicesByCustomer()" | kind=code-symbol | source=src/components/pbook2invoice/ModalInvoicesByCustomer.tsx:L17 | neighbors=[ModalInvoicesByCustomer.tsx, page.tsx]
- "pbook2invoice_modalpartialinvoice_modalpartialinvoice": "ModalPartialInvoice()" | kind=code-symbol | source=src/components/pbook2invoice/ModalPartialInvoice.tsx:L16 | neighbors=[ModalPartialInvoice.tsx, page.tsx]
- "pbook2invoice_modalunassignstock_t": "t()" | kind=code-symbol | source=src/components/pbook2invoice/ModalUnassignStock.tsx:L6 | neighbors=[ModalUnassignStock.tsx, ModalUnassignStock()]
- "pbook2invoice_modalupdateline_t": "t()" | kind=code-symbol | source=src/components/pbook2invoice/ModalUpdateLine.tsx:L6 | neighbors=[ModalUpdateLine.tsx, ModalUpdateLine()]
- "pbook2invoice_page_fmtdate": "fmtDate()" | kind=code-symbol | source=src/app/pbook2invoice/page.tsx:L40 | neighbors=[page.tsx, Pbook2InvoicePage()]
- "pbook2invoice_page_invoicedtab": "InvoicedTab()" | kind=code-symbol | source=src/app/pbook2invoice/page.tsx:L129 | neighbors=[page.tsx, t()]
- "photo_route_extractjpeg": "extractJpeg()" | kind=code-symbol | source=src/app/api/system/users/[unico]/photo/route.ts:L9 | neighbors=[route.ts, GET()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-062.json

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
