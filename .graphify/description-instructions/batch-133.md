# Node Description Batch 134 of 139

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

- "store_usefreightsstore_freightsstate": "FreightsState" | kind=code-symbol | source=src/store/useFreightsStore.ts:L3 | neighbors=[useFreightsStore.ts]
- "store_useitemsstore_itemsstate": "ItemsState" | kind=code-symbol | source=src/store/useItemsStore.ts:L3 | neighbors=[useItemsStore.ts]
- "store_usepaymentauthorizationsstore_defaults": "defaults" | kind=code-symbol | source=src/store/usePaymentAuthorizationsStore.ts:L23 | neighbors=[usePaymentAuthorizationsStore.ts]
- "store_usepaymentauthorizationsstore_paymentauthorizationsstate": "PaymentAuthorizationsState" | kind=code-symbol | source=src/store/usePaymentAuthorizationsStore.ts:L3 | neighbors=[usePaymentAuthorizationsStore.ts]
- "store_usepbook2invoicestore_bottomtabid": "BottomTabId" | kind=code-symbol | source=src/store/usePbook2InvoiceStore.ts:L4 | neighbors=[usePbook2InvoiceStore.ts]
- "store_usepbook2invoicestore_datemode": "DateMode" | kind=code-symbol | source=src/store/usePbook2InvoiceStore.ts:L3 | neighbors=[usePbook2InvoiceStore.ts]
- "store_usepbook2invoicestore_pbook2invoicestate": "Pbook2InvoiceState" | kind=code-symbol | source=src/store/usePbook2InvoiceStore.ts:L6 | neighbors=[usePbook2InvoiceStore.ts]
- "store_useposstore_posstate": "POSState" | kind=code-symbol | source=src/store/usePOSStore.ts:L4 | neighbors=[usePOSStore.ts]
- "store_usesalesrepsstore_salesrepsstate": "SalesRepsState" | kind=code-symbol | source=src/store/useSalesRepsStore.ts:L5 | neighbors=[useSalesRepsStore.ts]
- "store_usescaninstore_initial": "INITIAL" | kind=code-symbol | source=src/store/useScanInStore.ts:L39 | neighbors=[useScanInStore.ts]
- "store_usescaninstore_scaninstate": "ScanInState" | kind=code-symbol | source=src/store/useScanInStore.ts:L10 | neighbors=[useScanInStore.ts]
- "store_usescaninstore_scanintotals": "ScanInTotals" | kind=code-symbol | source=src/store/useScanInStore.ts:L5 | neighbors=[useScanInStore.ts]
- "store_usescanoutstore_initial": "INITIAL" | kind=code-symbol | source=src/store/useScanOutStore.ts:L45 | neighbors=[useScanOutStore.ts]
- "store_usescanoutstore_scanoutstate": "ScanOutState" | kind=code-symbol | source=src/store/useScanOutStore.ts:L25 | neighbors=[useScanOutStore.ts]
- "store_usescanoutstore_scanoutstep": "ScanOutStep" | kind=code-symbol | source=src/store/useScanOutStore.ts:L3 | neighbors=[useScanOutStore.ts]
- "store_usescanoutstore_scanouttabid": "ScanOutTabId" | kind=code-symbol | source=src/store/useScanOutStore.ts:L4 | neighbors=[useScanOutStore.ts]
- "store_usescanstore_scanstate": "ScanState" | kind=code-symbol | source=src/store/useScanStore.ts:L14 | neighbors=[useScanStore.ts]
- "store_usevendorsstore_modalvendortab": "ModalVendorTab" | kind=code-symbol | source=src/store/useVendorsStore.ts:L3 | neighbors=[useVendorsStore.ts]
- "store_usevendorsstore_vendorsstate": "VendorsState" | kind=code-symbol | source=src/store/useVendorsStore.ts:L5 | neighbors=[useVendorsStore.ts]
- "stores_usestandingordersstore_standingordersstate": "StandingOrdersState" | kind=code-symbol | source=src/stores/useStandingOrdersStore.ts:L3 | neighbors=[useStandingOrdersStore.ts]
- "subclasses_route_get": "GET()" | kind=code-symbol | source=src/app/api/masters/items/warehouses-bogo/[unico]/subclasses/route.ts:L4 | neighbors=[route.ts]
- "subclasses_route_int": "int()" | kind=code-symbol | source=src/app/api/masters/items/subclasses/route.ts:L9 | neighbors=[route.ts]
- "summary_route_get": "GET()" | kind=code-symbol | source=src/app/api/payment-authorizations/reports/summary/route.tsx:L11 | neighbors=[route.tsx]
- "suppliers_route_get": "GET()" | kind=code-symbol | source=src/app/api/awbs/lookups/suppliers/route.ts:L4 | neighbors=[route.ts]
- "sys_not_physical_route_get": "GET()" | kind=code-symbol | source=src/app/api/physical-scan/sys-not-physical/route.ts:L7 | neighbors=[route.ts]
- "system_bi_saved_configs_dbo_nc_bi_saved_configs": "dbo.NC_bi_saved_configs" | kind=code-symbol | source=sql/system/bi_saved_configs.sql:L14 | neighbors=[bi_saved_configs.sql]
- "system_useaccessstore_accessstate": "AccessState" | kind=code-symbol | source=src/store/system/useAccessStore.ts:L5 | neighbors=[useAccessStore.ts]
- "system_useaccessstore_copymodal": "CopyModal" | kind=code-symbol | source=src/store/system/useAccessStore.ts:L3 | neighbors=[useAccessStore.ts]
- "system_usecompanystore_companystate": "CompanyState" | kind=code-symbol | source=src/store/system/useCompanyStore.ts:L3 | neighbors=[useCompanyStore.ts]
- "system_usemodulestore_modulestate": "ModuleState" | kind=code-symbol | source=src/store/system/useModuleStore.ts:L3 | neighbors=[useModuleStore.ts]
- "system_users_route_get": "GET()" | kind=code-symbol | source=src/app/api/sales-reps/system-users/route.ts:L4 | neighbors=[route.ts]
- "system_useuserstore_userstate": "UserState" | kind=code-symbol | source=src/store/system/useUserStore.ts:L3 | neighbors=[useUserStore.ts]
- "tabs_cancelledpurchasestab_cancelcalendar": "CancelCalendar()" | kind=code-symbol | source=src/app/qc/components/tabs/CancelledPurchasesTab.tsx:L31 | neighbors=[CancelledPurchasesTab.tsx]
- "tabs_cancelledpurchasestab_day_labels": "DAY_LABELS" | kind=code-symbol | source=src/app/qc/components/tabs/CancelledPurchasesTab.tsx:L28 | neighbors=[CancelledPurchasesTab.tsx]
- "tabs_cancelledpurchasestab_empty_arr": "EMPTY_ARR" | kind=code-symbol | source=src/app/qc/components/tabs/CancelledPurchasesTab.tsx:L9 | neighbors=[CancelledPurchasesTab.tsx]
- "tabs_cancelledpurchasestab_month_names": "MONTH_NAMES" | kind=code-symbol | source=src/app/qc/components/tabs/CancelledPurchasesTab.tsx:L27 | neighbors=[CancelledPurchasesTab.tsx]
- "tabs_customerpaymentstab_customerpaymentstab": "CustomerPaymentsTab()" | kind=code-symbol | source=src/app/flexy2qb/components/tabs/CustomerPaymentsTab.tsx:L36 | neighbors=[CustomerPaymentsTab.tsx]
- "tabs_customerpaymentstab_empty_arr": "EMPTY_ARR" | kind=code-symbol | source=src/app/flexy2qb/components/tabs/CustomerPaymentsTab.tsx:L18 | neighbors=[CustomerPaymentsTab.tsx]
- "tabs_customerpaymentstab_filterrows": "filterRows()" | kind=code-symbol | source=src/app/flexy2qb/components/tabs/CustomerPaymentsTab.tsx:L25 | neighbors=[CustomerPaymentsTab.tsx]
- "tabs_customerpaymentstab_fmtdate": "fmtDate()" | kind=code-symbol | source=src/app/flexy2qb/components/tabs/CustomerPaymentsTab.tsx:L28 | neighbors=[CustomerPaymentsTab.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-133.json

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
