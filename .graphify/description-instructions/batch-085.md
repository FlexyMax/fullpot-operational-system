# Node Description Batch 86 of 139

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

- "standing_orders_orderdetailmodal_fmtdate": "fmtDate()" | kind=code-symbol | source=src/app/standing-orders/OrderDetailModal.tsx:L34 | neighbors=[OrderDetailModal.tsx, OrderDetailModal()]
- "standing_orders_orderdetailmodal_t": "t()" | kind=code-symbol | source=src/app/standing-orders/OrderDetailModal.tsx:L29 | neighbors=[OrderDetailModal.tsx, OrderDetailModal()]
- "standing_orders_productslistmodal_mapproduct": "mapProduct()" | kind=code-symbol | source=src/app/standing-orders/ProductsListModal.tsx:L39 | neighbors=[ProductsListModal.tsx, t()]
- "standing_orders_productslistmodal_productslistmodal": "ProductsListModal()" | kind=code-symbol | source=src/app/standing-orders/ProductsListModal.tsx:L56 | neighbors=[OrderDetailModal.tsx, ProductsListModal.tsx]
- "standing_orders_productslistmodal_t": "t()" | kind=code-symbol | source=src/app/standing-orders/ProductsListModal.tsx:L10 | neighbors=[ProductsListModal.tsx, mapProduct()]
- "standing_orders_setweeksmodal_fmtdate": "fmtDate()" | kind=code-symbol | source=src/app/standing-orders/SetWeeksModal.tsx:L9 | neighbors=[SetWeeksModal.tsx, SetWeeksModal()]
- "standing_orders_setweeksmodal_t": "t()" | kind=code-symbol | source=src/app/standing-orders/SetWeeksModal.tsx:L8 | neighbors=[SetWeeksModal.tsx, SetWeeksModal()]
- "stock_om_route_get": "GET()" | kind=code-symbol | source=src/app/api/pbook2invoice/stock-om/route.ts:L6 | neighbors=[route.ts, t()]
- "stock_om_route_t": "t()" | kind=code-symbol | source=src/app/api/pbook2invoice/reports/stock-om/route.tsx:L6 | neighbors=[route.ts, GET()]
- "store_useapstore_useapstore": "useAPStore" | kind=code-symbol | source=src/store/useAPStore.ts:L19 | neighbors=[page.tsx, useAPStore.ts]
- "store_useauthstore_useauthstore": "useAuthStore" | kind=code-symbol | source=src/store/useAuthStore.ts:L12 | neighbors=[page.tsx, useAuthStore.ts]
- "store_useawbstore_useawbstore": "useAwbStore" | kind=code-symbol | source=src/store/useAwbStore.ts:L40 | neighbors=[page.tsx, useAwbStore.ts]
- "store_usecarriersstore_usecarriersstore": "useCarriersStore" | kind=code-symbol | source=src/store/useCarriersStore.ts:L28 | neighbors=[page.tsx, useCarriersStore.ts]
- "store_usecustomersstore_usecustomersstore": "useCustomersStore" | kind=code-symbol | source=src/store/useCustomersStore.ts:L48 | neighbors=[page.tsx, useCustomersStore.ts]
- "store_usefreightsstore_usefreightsstore": "useFreightsStore" | kind=code-symbol | source=src/store/useFreightsStore.ts:L41 | neighbors=[page.tsx, useFreightsStore.ts]
- "store_usepaymentauthorizationsstore_usepaymentauthorizationsstore": "usePaymentAuthorizationsStore" | kind=code-symbol | source=src/store/usePaymentAuthorizationsStore.ts:L34 | neighbors=[page.tsx, usePaymentAuthorizationsStore.ts]
- "store_usepbook2invoicestore_usepbook2invoicestore": "usePbook2InvoiceStore" | kind=code-symbol | source=src/store/usePbook2InvoiceStore.ts:L46 | neighbors=[page.tsx, usePbook2InvoiceStore.ts]
- "store_useposstore_useposstore": "usePOSStore" | kind=code-symbol | source=src/store/usePOSStore.ts:L19 | neighbors=[page.tsx, usePOSStore.ts]
- "store_usesalesrepsstore_activetab": "ActiveTab" | kind=code-symbol | source=src/store/useSalesRepsStore.ts:L3 | neighbors=[page.tsx, useSalesRepsStore.ts]
- "store_usesalesrepsstore_usesalesrepsstore": "useSalesRepsStore" | kind=code-symbol | source=src/store/useSalesRepsStore.ts:L21 | neighbors=[page.tsx, useSalesRepsStore.ts]
- "store_usescaninstore_scanintabid": "ScanInTabId" | kind=code-symbol | source=src/store/useScanInStore.ts:L3 | neighbors=[page.tsx, useScanInStore.ts]
- "store_usescaninstore_usescaninstore": "useScanInStore" | kind=code-symbol | source=src/store/useScanInStore.ts:L58 | neighbors=[page.tsx, useScanInStore.ts]
- "store_usescanoutstore_scanoutitem": "ScanOutItem" | kind=code-symbol | source=src/store/useScanOutStore.ts:L6 | neighbors=[page.tsx, useScanOutStore.ts]
- "store_usescanoutstore_scanoutorder": "ScanOutOrder" | kind=code-symbol | source=src/store/useScanOutStore.ts:L15 | neighbors=[page.tsx, useScanOutStore.ts]
- "store_usescanoutstore_usescanoutstore": "useScanOutStore" | kind=code-symbol | source=src/store/useScanOutStore.ts:L55 | neighbors=[page.tsx, useScanOutStore.ts]
- "store_usescanstore_scantabid": "ScanTabId" | kind=code-symbol | source=src/store/useScanStore.ts:L3 | neighbors=[page.tsx, useScanStore.ts]
- "store_usescanstore_usescanstore": "useScanStore" | kind=code-symbol | source=src/store/useScanStore.ts:L24 | neighbors=[page.tsx, useScanStore.ts]
- "store_usevendorsstore_usevendorsstore": "useVendorsStore" | kind=code-symbol | source=src/store/useVendorsStore.ts:L40 | neighbors=[useVendorsStore.ts, page.tsx]
- "subclasses_route_bit": "bit()" | kind=code-symbol | source=src/app/api/masters/items/subclasses/route.ts:L7 | neighbors=[route.ts, POST()]
- "subclasses_route_num": "num()" | kind=code-symbol | source=src/app/api/masters/items/subclasses/route.ts:L8 | neighbors=[route.ts, POST()]
- "subclasses_route_txt": "txt()" | kind=code-symbol | source=src/app/api/masters/items/subclasses/route.ts:L6 | neighbors=[route.ts, POST()]
- "system_bi_saved_configs": "bi_saved_configs.sql" | kind=code-symbol | source=sql/system/bi_saved_configs.sql:L1 | neighbors=[91438b4 feat(bi): persist saved pivot/g…, dbo.NC_bi_saved_configs]
- "system_useaccessstore_useaccessstore": "useAccessStore" | kind=code-symbol | source=src/store/system/useAccessStore.ts:L22 | neighbors=[page.tsx, useAccessStore.ts]
- "system_usecompanystore_usecompanystore": "useCompanyStore" | kind=code-symbol | source=src/store/system/useCompanyStore.ts:L15 | neighbors=[page.tsx, useCompanyStore.ts]
- "system_usemodulestore_usemodulestore": "useModuleStore" | kind=code-symbol | source=src/store/system/useModuleStore.ts:L17 | neighbors=[page.tsx, useModuleStore.ts]
- "tabs_cancelledpurchasestab_cancelledpurchasestab": "CancelledPurchasesTab()" | kind=code-symbol | source=src/app/qc/components/tabs/CancelledPurchasesTab.tsx:L110 | neighbors=[CancelledPurchasesTab.tsx, toISO()]
- "tabs_cancelledpurchasestab_fmtdate": "fmtDate()" | kind=code-symbol | source=src/app/qc/components/tabs/CancelledPurchasesTab.tsx:L13 | neighbors=[CancelledPurchasesTab.tsx, t()]
- "tabs_qchistorytab_fmtdate": "fmtDate()" | kind=code-symbol | source=src/app/qc/components/tabs/QCHistoryTab.tsx:L14 | neighbors=[QCHistoryTab.tsx, t()]
- "tabs_qchistorytab_qchistorytab": "QCHistoryTab()" | kind=code-symbol | source=src/app/qc/components/tabs/QCHistoryTab.tsx:L133 | neighbors=[QCHistoryTab.tsx, toISO()]
- "tabs_qualitycreditstab_fmtdate": "fmtDate()" | kind=code-symbol | source=src/app/qc/components/tabs/QualityCreditsTab.tsx:L14 | neighbors=[QualityCreditsTab.tsx, t()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-085.json

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
