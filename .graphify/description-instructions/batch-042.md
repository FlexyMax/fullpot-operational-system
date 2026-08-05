# Node Description Batch 43 of 139

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

- "date_to_history_route": "route.ts" | kind=code-symbol | source=src/app/api/payment-authorizations/date-to-history/route.ts:L1 | neighbors=[7d048ed fix(payment-authorizations): 7 …, dc1c19d feat(payment-auth): PDF reports…, POST()]
- "default_route": "route.ts" | kind=code-symbol | source=src/app/api/masters/customers/carrier/[unico]/default/route.ts:L1 | neighbors=[PUT(), db.ts, executeProcedure()]
- "delayed_route_fmtdate": "fmtDate()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/delayed/route.tsx:L9 | neighbors=[route.ts, t(), GET()]
- "delayed_route_get": "GET()" | kind=code-symbol | source=src/app/api/scan-in/delayed/route.ts:L10 | neighbors=[route.ts, fmtDate(), t()]
- "delayed_route_t": "t()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/delayed/route.tsx:L7 | neighbors=[route.ts, fmtDate(), GET()]
- "future_stock_route": "route.ts" | kind=code-symbol | source=src/app/api/standing-orders/future-stock/route.ts:L1 | neighbors=[GET(), db.ts, executeProcedure()]
- "get_alt_sp": "get_alt_sp.js" | kind=code-symbol | source=get_alt_sp.js:L1 | neighbors=[config, main(), sql]
- "get_bi_catalog": "get_bi_catalog.js" | kind=code-symbol | source=get_bi_catalog.js:L1 | neighbors=[config, main(), sql]
- "get_pantalla": "get_pantalla.js" | kind=code-symbol | source=get_pantalla.js:L1 | neighbors=[config, main(), sql]
- "get_prod_sp": "get_prod_sp.js" | kind=code-symbol | source=get_prod_sp.js:L1 | neighbors=[config, main(), sql]
- "get_sp_def": "get_sp_def.js" | kind=code-symbol | source=get_sp_def.js:L1 | neighbors=[config, main(), sql]
- "get_sp_def2": "get_sp_def2.js" | kind=code-symbol | source=get_sp_def2.js:L1 | neighbors=[config, main(), sql]
- "grower_terms_route": "route.ts" | kind=code-symbol | source=src/app/api/accounts-payable/grower-terms/route.ts:L1 | neighbors=[GET(), db.ts, executeProcedure()]
- "handling_route_post": "POST()" | kind=code-symbol | source=src/app/api/freights/handling/route.ts:L21 | neighbors=[route.ts, num(), txt()]
- "id_route": "route.ts" | kind=code-symbol | source=src/app/api/audit/record/[id]/route.ts:L1 | neighbors=[GET(), db.ts, executeQuery()]
- "images_cache_buildcache": "buildCache()" | kind=code-symbol | source=src/app/api/products/images/_cache.ts:L32 | neighbors=[_cache.ts, getS3(), ensureCache()]
- "images_cache_signkey": "signKey()" | kind=code-symbol | source=src/app/api/products/images/_cache.ts:L74 | neighbors=[_cache.ts, route.ts, route.ts]
- "income_types_route": "route.ts" | kind=code-symbol | source=src/app/api/customer-payments/lookups/income-types/route.ts:L1 | neighbors=[GET(), db.ts, executeProcedure()]
- "inventory_entry_modaladdpotoinventory_modaladdpotoinventory": "ModalAddPOToInventory()" | kind=code-symbol | source=src/components/inventory-entry/ModalAddPOToInventory.tsx:L24 | neighbors=[ModalAddPOToInventory.tsx, t(), page.tsx]
- "inventory_entry_modaladdproducttopacking_modaladdproducttopacking": "ModalAddProductToPacking()" | kind=code-symbol | source=src/components/inventory-entry/ModalAddProductToPacking.tsx:L20 | neighbors=[ModalAddProductToPacking.tsx, t(), page.tsx]
- "inventory_entry_modalavailabledate_modalavailabledate": "ModalAvailableDate()" | kind=code-symbol | source=src/components/inventory-entry/ModalAvailableDate.tsx:L17 | neighbors=[ModalAvailableDate.tsx, today(), page.tsx]
- "inventory_entry_modalboxpo_modalboxpo": "ModalBoxPO()" | kind=code-symbol | source=src/components/inventory-entry/ModalBoxPO.tsx:L21 | neighbors=[ModalBoxPO.tsx, t(), page.tsx]
- "inventory_entry_modalwarehousetransfer_modalwarehousetransfer": "ModalWarehouseTransfer()" | kind=code-symbol | source=src/components/inventory-entry/ModalWarehouseTransfer.tsx:L19 | neighbors=[ModalWarehouseTransfer.tsx, t(), page.tsx]
- "inventory_entry_page_t": "t()" | kind=code-symbol | source=src/app/inventory-entry/page.tsx:L48 | neighbors=[page.tsx, fmtDate(), InventoryEntryPage()]
- "inventory_entry_page_today": "today()" | kind=code-symbol | source=src/app/inventory-entry/page.tsx:L56 | neighbors=[page.tsx, IECalendar(), InventoryEntryPage()]
- "invoice_route_get": "GET()" | kind=code-symbol | source=src/app/api/pbook2invoice/reports/invoice/route.tsx:L31 | neighbors=[route.tsx, fmtDate(), t()]
- "items_tab2_updatestockmodal": "UpdateStockModal()" | kind=code-symbol | source=src/app/masters/items/Tab2.tsx:L542 | neighbors=[Tab2.tsx, getPages(), useSentinel()]
- "lib_authcodes_consumepreauth": "consumePreAuth()" | kind=code-symbol | source=src/lib/authCodes.ts:L55 | neighbors=[authCodes.ts, cleanup(), route.ts]
- "lib_authcodes_storecode": "storeCode()" | kind=code-symbol | source=src/lib/authCodes.ts:L29 | neighbors=[authCodes.ts, cleanup(), route.ts]
- "lib_authcodes_storepreauth": "storePreAuth()" | kind=code-symbol | source=src/lib/authCodes.ts:L46 | neighbors=[authCodes.ts, route.ts, route.ts]
- "lib_authcodes_verifyandconsumecode": "verifyAndConsumeCode()" | kind=code-symbol | source=src/lib/authCodes.ts:L37 | neighbors=[authCodes.ts, cleanup(), route.ts]
- "lib_csv_dedupeheaders": "dedupeHeaders()" | kind=code-symbol | source=src/lib/csv.ts:L5 | neighbors=[csv.ts, downloadCSV(), downloadXLS()]
- "lib_csv_downloadxls": "downloadXLS()" | kind=code-symbol | source=src/lib/csv.ts:L31 | neighbors=[csv.ts, dedupeHeaders(), DownloadBtn.tsx]
- "lib_dates_currentyearest": "currentYearEST()" | kind=code-symbol | source=src/lib/dates.ts:L23 | neighbors=[page.tsx, dates.ts, useAPStore.ts]
- "lib_dates_parsemoney": "parseMoney()" | kind=code-symbol | source=src/lib/dates.ts:L71 | neighbors=[page.tsx, page.tsx, dates.ts]
- "lib_mailer_createtransporter": "createTransporter()" | kind=code-symbol | source=src/lib/mailer.ts:L3 | neighbors=[mailer.ts, sendStatementEmail(), sendVerificationCode()]
- "lib_mailer_sendstatementemail": "sendStatementEmail()" | kind=code-symbol | source=src/lib/mailer.ts:L30 | neighbors=[mailer.ts, createTransporter(), route.ts]
- "lib_mailer_sendverificationcode": "sendVerificationCode()" | kind=code-symbol | source=src/lib/mailer.ts:L47 | neighbors=[mailer.ts, createTransporter(), route.ts]
- "lib_pdf": "pdf.ts" | kind=code-symbol | source=src/lib/pdf.ts:L1 | neighbors=[ba40c73 feat(ar): fix invoice print/ema…, route.ts, htmlToPdfBuffer()]
- "lines_route": "route.ts" | kind=code-symbol | source=src/app/api/pbook2invoice/lines/route.ts:L1 | neighbors=[db.ts, executeProcedure(), GET()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-042.json

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
