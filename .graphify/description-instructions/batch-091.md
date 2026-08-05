# Node Description Batch 92 of 139

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

- "companies_page_sysfetch": "sysFetch()" | kind=code-symbol | source=src/app/system/companies/page.tsx:L26 | neighbors=[page.tsx]
- "companies_route_get": "GET()" | kind=code-symbol | source=src/app/api/system/companies/route.ts:L12 | neighbors=[route.ts]
- "components_applypaymentmodal_applypaymentmodal": "ApplyPaymentModal()" | kind=code-symbol | source=src/app/sales/customer-payments/components/ApplyPaymentModal.tsx:L8 | neighbors=[ApplyPaymentModal.tsx]
- "components_approvecreditmodal_approvecreditmodal": "ApproveCreditModal()" | kind=code-symbol | source=src/app/sales/customer-payments/components/ApproveCreditModal.tsx:L8 | neighbors=[ApproveCreditModal.tsx]
- "components_auditlogmodal_props": "Props" | kind=code-symbol | source=src/components/AuditLogModal.tsx:L11 | neighbors=[AuditLogModal.tsx]
- "components_cashbackmodal_cashbackmodal": "CashBackModal()" | kind=code-symbol | source=src/app/sales/customer-payments/components/CashBackModal.tsx:L8 | neighbors=[CashBackModal.tsx]
- "components_corpinvoicemodal_corpinvoicemodal": "CorpInvoiceModal()" | kind=code-symbol | source=src/app/sales/customer-payments/components/CorpInvoiceModal.tsx:L8 | neighbors=[CorpInvoiceModal.tsx]
- "components_corppaymentmodal_corppaymentmodal": "CorpPaymentModal()" | kind=code-symbol | source=src/app/sales/customer-payments/components/CorpPaymentModal.tsx:L8 | neighbors=[CorpPaymentModal.tsx]
- "components_crdbmodal_crdbmodal": "CrDbModal()" | kind=code-symbol | source=src/app/sales/customer-payments/components/CrDbModal.tsx:L8 | neighbors=[CrDbModal.tsx]
- "components_crdbreportmodal_crdbreportmodal": "CrDbReportModal()" | kind=code-symbol | source=src/app/sales/customer-payments/components/CrDbReportModal.tsx:L8 | neighbors=[CrDbReportModal.tsx]
- "components_customereditmodal_customereditmodal": "CustomerEditModal()" | kind=code-symbol | source=src/app/sales/customer-payments/components/CustomerEditModal.tsx:L8 | neighbors=[CustomerEditModal.tsx]
- "components_entityformmodal_checkfield": "CheckField" | kind=code-symbol | source=src/components/EntityFormModal.tsx:L12 | neighbors=[EntityFormModal.tsx]
- "components_entityformmodal_entityformmodal": "EntityFormModal()" | kind=code-symbol | source=src/components/EntityFormModal.tsx:L33 | neighbors=[EntityFormModal.tsx]
- "components_entityformmodal_entityformmodalprops": "EntityFormModalProps" | kind=code-symbol | source=src/components/EntityFormModal.tsx:L17 | neighbors=[EntityFormModal.tsx]
- "components_entityformmodal_formfield": "FormField" | kind=code-symbol | source=src/components/EntityFormModal.tsx:L6 | neighbors=[EntityFormModal.tsx]
- "components_entitylistmodal_entitylistmodal": "EntityListModal()" | kind=code-symbol | source=src/components/EntityListModal.tsx:L21 | neighbors=[EntityListModal.tsx]
- "components_entitylistmodal_entitylistmodalprops": "EntityListModalProps" | kind=code-symbol | source=src/components/EntityListModal.tsx:L7 | neighbors=[EntityListModal.tsx]
- "components_gridmenu_gridmenuitem": "GridMenuItem" | kind=code-symbol | source=src/components/GridMenu.tsx:L7 | neighbors=[GridMenu.tsx]
- "components_gridmenu_item_colors": "ITEM_COLORS" | kind=code-symbol | source=src/components/GridMenu.tsx:L16 | neighbors=[GridMenu.tsx]
- "components_invoicesearchmodal_invoicesearchmodal": "InvoiceSearchModal()" | kind=code-symbol | source=src/app/sales/customer-payments/components/InvoiceSearchModal.tsx:L8 | neighbors=[InvoiceSearchModal.tsx]
- "components_newpaymentmodal_newpaymentmodal": "NewPaymentModal()" | kind=code-symbol | source=src/app/sales/customer-payments/components/NewPaymentModal.tsx:L8 | neighbors=[NewPaymentModal.tsx]
- "components_pendinginvoicesreportmodal_pendinginvoicesreportmodal": "PendingInvoicesReportModal()" | kind=code-symbol | source=src/app/sales/customer-payments/components/PendingInvoicesReportModal.tsx:L8 | neighbors=[PendingInvoicesReportModal.tsx]
- "components_route_get": "GET()" | kind=code-symbol | source=src/app/api/masters/items/components/route.ts:L4 | neighbors=[route.ts]
- "components_salesmanselectormodal_salesmanselectormodal": "SalesmanSelectorModal()" | kind=code-symbol | source=src/app/sales/customer-payments/components/SalesmanSelectorModal.tsx:L8 | neighbors=[SalesmanSelectorModal.tsx]
- "components_tabtable_column": "Column" | kind=code-symbol | source=src/app/flexy2qb/components/TabTable.tsx:L8 | neighbors=[TabTable.tsx]
- "components_tabtable_downloadexcel": "downloadExcel()" | kind=code-symbol | source=src/app/flexy2qb/components/TabTable.tsx:L31 | neighbors=[TabTable.tsx]
- "components_tabtable_tabtable": "TabTable()" | kind=code-symbol | source=src/app/flexy2qb/components/TabTable.tsx:L48 | neighbors=[TabTable.tsx]
- "components_tabtable_tabtableprops": "TabTableProps" | kind=code-symbol | source=src/app/flexy2qb/components/TabTable.tsx:L15 | neighbors=[TabTable.tsx]
- "components_topactionbar_actionitem": "ActionItem" | kind=code-symbol | source=src/app/flexy2qb/components/TopActionBar.tsx:L8 | neighbors=[TopActionBar.tsx]
- "components_topactionbar_topactionbar": "TopActionBar()" | kind=code-symbol | source=src/app/flexy2qb/components/TopActionBar.tsx:L21 | neighbors=[TopActionBar.tsx]
- "components_topactionbar_topactionbarprops": "TopActionBarProps" | kind=code-symbol | source=src/app/flexy2qb/components/TopActionBar.tsx:L15 | neighbors=[TopActionBar.tsx]
- "components_userupsertmodal_empty_form": "EMPTY_FORM" | kind=code-symbol | source=src/app/system/users/components/UserUpsertModal.tsx:L9 | neighbors=[UserUpsertModal.tsx]
- "components_userupsertmodal_generateusername": "generateUsername()" | kind=code-symbol | source=src/app/system/users/components/UserUpsertModal.tsx:L15 | neighbors=[UserUpsertModal.tsx]
- "components_userupsertmodal_levels": "LEVELS" | kind=code-symbol | source=src/app/system/users/components/UserUpsertModal.tsx:L7 | neighbors=[UserUpsertModal.tsx]
- "composition_route_get": "GET()" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/composition/route.ts:L13 | neighbors=[route.ts]
- "composition_route_int": "int()" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/composition/route.ts:L10 | neighbors=[route.ts]
- "composition_route_p": "P" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/composition/route.ts:L7 | neighbors=[route.ts]
- "composition_route_str": "str()" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/composition/route.ts:L9 | neighbors=[route.ts]
- "composition_uq_route_delete": "DELETE()" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/composition/[composition_uq]/route.ts:L35 | neighbors=[route.ts]
- "composition_uq_route_int": "int()" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/composition/[composition_uq]/route.ts:L10 | neighbors=[route.ts]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-091.json

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
