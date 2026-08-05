# Node Description Batch 62 of 139

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

- "inventory_entry_modalsendtowhouse_modalsendtowhouse": "ModalSendToWhouse()" | kind=code-symbol | source=src/components/inventory-entry/ModalSendToWhouse.tsx:L17 | neighbors=[ModalSendToWhouse.tsx, page.tsx]
- "inventory_entry_modalwarehousetransfer_t": "t()" | kind=code-symbol | source=src/components/inventory-entry/ModalWarehouseTransfer.tsx:L6 | neighbors=[ModalWarehouseTransfer.tsx, ModalWarehouseTransfer()]
- "inventory_entry_modalwhousetotals_t": "t()" | kind=code-symbol | source=src/components/inventory-entry/ModalWhouseTotals.tsx:L8 | neighbors=[ModalWhouseTotals.tsx, ModalWhouseTotals()]
- "inventory_entry_modalwhousetotals_today": "today()" | kind=code-symbol | source=src/components/inventory-entry/ModalWhouseTotals.tsx:L9 | neighbors=[ModalWhouseTotals.tsx, ModalWhouseTotals()]
- "inventory_entry_page_colorfromint": "colorFromInt()" | kind=code-symbol | source=src/app/inventory-entry/page.tsx:L65 | neighbors=[page.tsx, subtleColorFromInt()]
- "inventory_entry_page_fmt2": "fmt2()" | kind=code-symbol | source=src/app/inventory-entry/page.tsx:L54 | neighbors=[page.tsx, InventoryEntryPage()]
- "inventory_entry_page_fmtdate": "fmtDate()" | kind=code-symbol | source=src/app/inventory-entry/page.tsx:L57 | neighbors=[page.tsx, t()]
- "inventory_entry_page_iecalendar": "IECalendar()" | kind=code-symbol | source=src/app/inventory-entry/page.tsx:L193 | neighbors=[page.tsx, today()]
- "inventory_entry_page_subtlecolorfromint": "subtleColorFromInt()" | kind=code-symbol | source=src/app/inventory-entry/page.tsx:L75 | neighbors=[page.tsx, colorFromInt()]
- "invoice_email_route_createtransporter": "createTransporter()" | kind=code-symbol | source=src/app/api/customer-payments/invoice-email/route.ts:L6 | neighbors=[route.ts, POST()]
- "invoice_email_route_post": "POST()" | kind=code-symbol | source=src/app/api/customer-payments/invoice-email/route.ts:L18 | neighbors=[route.ts, createTransporter()]
- "invoice_route_fmtdate": "fmtDate()" | kind=code-symbol | source=src/app/api/pbook2invoice/reports/invoice/route.tsx:L10 | neighbors=[route.tsx, GET()]
- "invoice_route_t": "t()" | kind=code-symbol | source=src/app/api/pbook2invoice/reports/invoice/route.tsx:L7 | neighbors=[route.tsx, GET()]
- "items_boxrecipemodal_boxrecipemodal": "BoxRecipeModal()" | kind=code-symbol | source=src/app/masters/items/BoxRecipeModal.tsx:L24 | neighbors=[BoxRecipeModal.tsx, t()]
- "items_boxrecipemodal_t": "t()" | kind=code-symbol | source=src/app/masters/items/BoxRecipeModal.tsx:L13 | neighbors=[BoxRecipeModal.tsx, BoxRecipeModal()]
- "items_bunchrecipemodal_bunchrecipemodal": "BunchRecipeModal()" | kind=code-symbol | source=src/app/masters/items/BunchRecipeModal.tsx:L124 | neighbors=[BunchRecipeModal.tsx, t()]
- "items_bunchrecipemodal_t": "t()" | kind=code-symbol | source=src/app/masters/items/BunchRecipeModal.tsx:L110 | neighbors=[BunchRecipeModal.tsx, BunchRecipeModal()]
- "items_tab1_producteditmodal": "ProductEditModal()" | kind=code-symbol | source=src/app/masters/items/Tab1.tsx:L86 | neighbors=[Tab1.tsx, t()]
- "items_tab1_t": "t()" | kind=code-symbol | source=src/app/masters/items/Tab1.tsx:L19 | neighbors=[Tab1.tsx, ProductEditModal()]
- "items_tab2_buyersquotasmodal": "BuyersQuotasModal()" | kind=code-symbol | source=src/app/masters/items/Tab2.tsx:L185 | neighbors=[Tab2.tsx, t()]
- "items_tab2_imagemodal": "ImageModal()" | kind=code-symbol | source=src/app/masters/items/Tab2.tsx:L878 | neighbors=[Tab2.tsx, t()]
- "items_tab3_getpages": "getPages()" | kind=code-symbol | source=src/app/masters/items/Tab3.tsx:L25 | neighbors=[Tab3.tsx, Tab3()]
- "items_tab3_gettotal": "getTotal()" | kind=code-symbol | source=src/app/masters/items/Tab3.tsx:L26 | neighbors=[Tab3.tsx, Tab3()]
- "items_tab3_packsmodal": "PacksModal()" | kind=code-symbol | source=src/app/masters/items/Tab3.tsx:L89 | neighbors=[Tab3.tsx, t()]
- "items_tab3_subclassbogomodal": "SubclassBOGOModal()" | kind=code-symbol | source=src/app/masters/items/Tab3.tsx:L355 | neighbors=[Tab3.tsx, t()]
- "items_tab3_usesentinel": "useSentinel()" | kind=code-symbol | source=src/app/masters/items/Tab3.tsx:L28 | neighbors=[Tab3.tsx, Tab3()]
- "items_tab3_varietydefinitionmodal": "VarietyDefinitionModal()" | kind=code-symbol | source=src/app/masters/items/Tab3.tsx:L244 | neighbors=[Tab3.tsx, t()]
- "label_meto_route_get": "GET()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/label-meto/route.ts:L8 | neighbors=[route.ts, t()]
- "label_meto_route_t": "t()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/label-meto/route.ts:L4 | neighbors=[route.ts, GET()]
- "label_zebra_repacking_route_get": "GET()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/label-zebra-repacking/route.ts:L8 | neighbors=[route.ts, t()]
- "label_zebra_repacking_route_t": "t()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/label-zebra-repacking/route.ts:L4 | neighbors=[route.ts, GET()]
- "label_zebra_route_get": "GET()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/label-zebra/route.ts:L9 | neighbors=[route.ts, t()]
- "label_zebra_route_t": "t()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/label-zebra/route.ts:L4 | neighbors=[route.ts, GET()]
- "label_zebra4m_route_get": "GET()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/label-zebra4m/route.ts:L8 | neighbors=[route.ts, t()]
- "label_zebra4m_route_t": "t()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/label-zebra4m/route.ts:L4 | neighbors=[route.ts, GET()]
- "layout_appheader_getinitials": "getInitials()" | kind=code-symbol | source=src/components/layout/AppHeader.tsx:L17 | neighbors=[AppHeader.tsx, AppHeader()]
- "lib_audit_fetchrecordaudit": "fetchRecordAudit()" | kind=code-symbol | source=src/lib/audit.ts:L75 | neighbors=[AuditLogModal.tsx, audit.ts]
- "lib_authguards_issuperadminonlyperm": "isSuperAdminOnlyPerm()" | kind=code-symbol | source=src/lib/authGuards.ts:L13 | neighbors=[authGuards.ts, route.ts]
- "lib_pdf_htmltopdfbuffer": "htmlToPdfBuffer()" | kind=code-symbol | source=src/lib/pdf.ts:L3 | neighbors=[route.ts, pdf.ts]
- "lib_serveraudit_getempresauq": "getEmpresaUq()" | kind=code-symbol | source=src/lib/serverAudit.ts:L6 | neighbors=[serverAudit.ts, serverAuditLog()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-061.json

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
