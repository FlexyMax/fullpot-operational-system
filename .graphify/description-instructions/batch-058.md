# Node Description Batch 59 of 139

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

- "store_usecustomersstore": "useCustomersStore.ts" | kind=code-symbol | source=src/store/useCustomersStore.ts:L1 | neighbors=[page.tsx, CustomersState, useCustomersStore]
- "store_usefreightsstore": "useFreightsStore.ts" | kind=code-symbol | source=src/store/useFreightsStore.ts:L1 | neighbors=[page.tsx, FreightsState, useFreightsStore]
- "store_useposstore": "usePOSStore.ts" | kind=code-symbol | source=src/store/usePOSStore.ts:L1 | neighbors=[page.tsx, POSState, usePOSStore]
- "stores_usestandingordersstore_usestandingordersstore": "useStandingOrdersStore" | kind=code-symbol | source=src/stores/useStandingOrdersStore.ts:L37 | neighbors=[OrderDetailModal.tsx, page.tsx, useStandingOrdersStore.ts]
- "suppliers_route": "route.ts" | kind=code-symbol | source=src/app/api/awbs/lookups/suppliers/route.ts:L1 | neighbors=[db.ts, executeProcedure(), GET()]
- "system_usecompanystore": "useCompanyStore.ts" | kind=code-symbol | source=src/store/system/useCompanyStore.ts:L1 | neighbors=[page.tsx, CompanyState, useCompanyStore]
- "system_usemodulestore": "useModuleStore.ts" | kind=code-symbol | source=src/store/system/useModuleStore.ts:L1 | neighbors=[page.tsx, ModuleState, useModuleStore]
- "system_users_route": "route.ts" | kind=code-symbol | source=src/app/api/sales-reps/system-users/route.ts:L1 | neighbors=[db.ts, executeProcedure(), GET()]
- "system_useuserstore_useuserstore": "useUserStore" | kind=code-symbol | source=src/store/system/useUserStore.ts:L15 | neighbors=[UserUpsertModal.tsx, useUserStore.ts, page.tsx]
- "tabs_cancelledpurchasestab_t": "t()" | kind=code-symbol | source=src/app/qc/components/tabs/CancelledPurchasesTab.tsx:L11 | neighbors=[CancelledPurchasesTab.tsx, fmtDate(), toISO()]
- "tabs_cancelledpurchasestab_toiso": "toISO()" | kind=code-symbol | source=src/app/qc/components/tabs/CancelledPurchasesTab.tsx:L20 | neighbors=[CancelledPurchasesTab.tsx, CancelledPurchasesTab(), t()]
- "tabs_qchistorytab_t": "t()" | kind=code-symbol | source=src/app/qc/components/tabs/QCHistoryTab.tsx:L13 | neighbors=[QCHistoryTab.tsx, fmtDate(), toISO()]
- "tabs_qchistorytab_toiso": "toISO()" | kind=code-symbol | source=src/app/qc/components/tabs/QCHistoryTab.tsx:L21 | neighbors=[QCHistoryTab.tsx, QCHistoryTab(), t()]
- "terms_route": "route.ts" | kind=code-symbol | source=src/app/api/accounts-payable/terms/route.ts:L1 | neighbors=[db.ts, executeProcedure(), GET()]
- "unico_route_get": "GET()" | kind=code-symbol | source=src/app/api/vendors/documents/[unico]/route.ts:L8 | neighbors=[route.ts, getExtraFields(), txt()]
- "unico_route_gettargetnivel": "getTargetNivel()" | kind=code-symbol | source=src/app/api/system/users/[unico]/route.ts:L9 | neighbors=[route.ts, DELETE(), PUT()]
- "unico_route_t": "t()" | kind=code-symbol | source=src/app/api/bi/saved-configs/[unico]/route.ts:L8 | neighbors=[route.ts, DELETE(), PUT()]
- "unico_route_useruq": "userUq()" | kind=code-symbol | source=src/app/api/bi/saved-configs/[unico]/route.ts:L17 | neighbors=[route.ts, DELETE(), PUT()]
- "update_stock_route": "route.ts" | kind=code-symbol | source=src/app/api/masters/items/products/update-stock/route.ts:L1 | neighbors=[db.ts, executeProcedure(), GET()]
- "vendors_route_post": "POST()" | kind=code-symbol | source=src/app/api/vendors/route.ts:L55 | neighbors=[route.ts, bit(), num()]
- "vendors_summary_detail_route": "route.ts" | kind=code-symbol | source=src/app/api/payment-authorizations/vendors-summary-detail/route.ts:L1 | neighbors=[db.ts, executeProcedure(), GET()]
- "verify_alt_sp": "verify_alt_sp.js" | kind=code-symbol | source=verify_alt_sp.js:L1 | neighbors=[config, main(), sql]
- "web_user_route_post": "POST()" | kind=code-symbol | source=src/app/api/masters/customers/web-user/route.ts:L9 | neighbors=[route.ts, bit(), txt()]
- "web_users_route": "route.ts" | kind=code-symbol | source=src/app/api/masters/customers/[unico]/web-users/route.ts:L1 | neighbors=[db.ts, executeProcedure(), GET()]
- "wh_instructions_route_t": "t()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/wh-instructions/route.tsx:L7 | neighbors=[route.tsx, caseBreakdown(), GET()]
- "years_route": "route.ts" | kind=code-symbol | source=src/app/api/accounts-payable/years/route.ts:L1 | neighbors=[db.ts, executeProcedure(), GET()]
- "airlines_route_genuq": "genUq()" | kind=code-symbol | source=src/app/api/freights/airlines/route.ts:L9 | neighbors=[route.ts, POST()]
- "airlines_route_txt": "txt()" | kind=code-symbol | source=src/app/api/freights/airlines/route.ts:L8 | neighbors=[route.ts, POST()]
- "atpda_route_num": "num()" | kind=code-symbol | source=src/app/api/freights/atpda/route.ts:L8 | neighbors=[route.ts, POST()]
- "atpda_route_txt": "txt()" | kind=code-symbol | source=src/app/api/freights/atpda/route.ts:L7 | neighbors=[route.ts, POST()]
- "awb_full_route_fmtdate": "fmtDate()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/awb-full/route.tsx:L10 | neighbors=[route.tsx, t()]
- "awb_full_route_get": "GET()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/awb-full/route.tsx:L27 | neighbors=[route.tsx, t()]
- "awbs_page_awbschargesmodal": "AwbsChargesModal()" | kind=code-symbol | source=src/app/awbs/page.tsx:L157 | neighbors=[page.tsx, today()]
- "awbs_page_awbsfreightsmodal": "AwbsFreightsModal()" | kind=code-symbol | source=src/app/awbs/page.tsx:L262 | neighbors=[page.tsx, today()]
- "awbs_page_awbsinvoicechargesmodal": "AwbsInvoiceChargesModal()" | kind=code-symbol | source=src/app/awbs/page.tsx:L340 | neighbors=[page.tsx, today()]
- "awbs_page_changedatemodal": "ChangeDateModal()" | kind=code-symbol | source=src/app/awbs/page.tsx:L695 | neighbors=[page.tsx, today()]
- "awbs_page_fmt": "fmt()" | kind=code-symbol | source=src/app/awbs/page.tsx:L30 | neighbors=[page.tsx, AwbsBoxesModal()]
- "awbs_page_suppliercombobox": "SupplierCombobox()" | kind=code-symbol | source=src/app/awbs/page.tsx:L104 | neighbors=[page.tsx, t()]
- "box_history_route_get": "GET()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/box-history/route.tsx:L25 | neighbors=[route.tsx, t()]
- "box_history_route_t": "t()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/box-history/route.tsx:L7 | neighbors=[route.tsx, GET()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-058.json

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
