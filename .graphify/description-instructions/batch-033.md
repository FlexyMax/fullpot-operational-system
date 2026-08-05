# Node Description Batch 34 of 139

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

- "images_cache_ensurecache": "ensureCache()" | kind=code-symbol | source=src/app/api/products/images/_cache.ts:L66 | neighbors=[_cache.ts, buildCache(), route.ts, route.ts]
- "import_route_post": "POST()" | kind=code-symbol | source=src/app/api/system/modules/import/route.ts:L9 | neighbors=[route.ts, bit(), num(), txt()]
- "in_corp_uq_route": "route.ts" | kind=code-symbol | source=src/app/api/customer-payments/corporate-payments/[in_corp_uq]/route.ts:L1 | neighbors=[GET(), P, db.ts, executeProcedure()]
- "income_route": "route.ts" | kind=code-symbol | source=src/app/api/customer-payments/income/route.ts:L1 | neighbors=[ca478bf perf(customer-payments): standa…, POST(), db.ts, executeProcedure()]
- "income_uq_route": "route.ts" | kind=code-symbol | source=src/app/api/customer-payments/payment-invoices/[income_uq]/route.ts:L1 | neighbors=[GET(), P, db.ts, executeProcedure()]
- "inventory_entry_modalfiltercustomers": "ModalFilterCustomers.tsx" | kind=code-symbol | source=src/components/inventory-entry/ModalFilterCustomers.tsx:L1 | neighbors=[ModalFilterCustomers(), Props, t(), page.tsx]
- "inventory_entry_modalfiltergrowers": "ModalFilterGrowers.tsx" | kind=code-symbol | source=src/components/inventory-entry/ModalFilterGrowers.tsx:L1 | neighbors=[ModalFilterGrowers(), Props, t(), page.tsx]
- "inventory_entry_modalheadercopy_modalheadercopy": "ModalHeaderCopy()" | kind=code-symbol | source=src/components/inventory-entry/ModalHeaderCopy.tsx:L20 | neighbors=[ModalHeaderCopy.tsx, t(), today(), page.tsx]
- "inventory_entry_modalwhousetotals_modalwhousetotals": "ModalWhouseTotals()" | kind=code-symbol | source=src/components/inventory-entry/ModalWhouseTotals.tsx:L18 | neighbors=[ModalWhouseTotals.tsx, t(), today(), page.tsx]
- "inventory_entry_page_inventoryentrypage": "InventoryEntryPage()" | kind=code-symbol | source=src/app/inventory-entry/page.tsx:L271 | neighbors=[page.tsx, fmt2(), t(), today()]
- "invoice_charges_route": "route.ts" | kind=code-symbol | source=src/app/api/awbs/invoice-charges/route.ts:L1 | neighbors=[GET(), POST(), db.ts, executeProcedure()]
- "invoice_no_route": "route.ts" | kind=code-symbol | source=src/app/api/customer-payments/invoice-by-number/[invoice_no]/route.ts:L1 | neighbors=[GET(), P, db.ts, executeProcedure()]
- "items_tab2_duallistmodal": "DualListModal()" | kind=code-symbol | source=src/app/masters/items/Tab2.tsx:L64 | neighbors=[Tab2.tsx, getPages(), getTotal(), useSentinel()]
- "items_tab2_gettotal": "getTotal()" | kind=code-symbol | source=src/app/masters/items/Tab2.tsx:L46 | neighbors=[Tab2.tsx, DualListModal(), POPricesModal(), Tab2()]
- "items_tab2_popricesmodal": "POPricesModal()" | kind=code-symbol | source=src/app/masters/items/Tab2.tsx:L361 | neighbors=[Tab2.tsx, getPages(), getTotal(), useSentinel()]
- "items_tab2_t": "t()" | kind=code-symbol | source=src/app/masters/items/Tab2.tsx:L23 | neighbors=[Tab2.tsx, BuyersQuotasModal(), ImageModal(), Tab2()]
- "items_tab3_t": "t()" | kind=code-symbol | source=src/app/masters/items/Tab3.tsx:L19 | neighbors=[Tab3.tsx, PacksModal(), SubclassBOGOModal(), VarietyDefinitionModal()]
- "items_tab3_tab3": "Tab3()" | kind=code-symbol | source=src/app/masters/items/Tab3.tsx:L553 | neighbors=[Tab3.tsx, getPages(), getTotal(), useSentinel()]
- "label_meto_route": "route.ts" | kind=code-symbol | source=src/app/api/inventory-entry/reports/label-meto/route.ts:L1 | neighbors=[GET(), t(), db.ts, executeProcedure()]
- "label_zebra_repacking_route": "route.ts" | kind=code-symbol | source=src/app/api/inventory-entry/reports/label-zebra-repacking/route.ts:L1 | neighbors=[GET(), t(), db.ts, executeProcedure()]
- "label_zebra_route": "route.ts" | kind=code-symbol | source=src/app/api/inventory-entry/reports/label-zebra/route.ts:L1 | neighbors=[GET(), t(), db.ts, executeProcedure()]
- "label_zebra4m_route": "route.ts" | kind=code-symbol | source=src/app/api/inventory-entry/reports/label-zebra4m/route.ts:L1 | neighbors=[GET(), t(), db.ts, executeProcedure()]
- "lib_authcodes_cleanup": "cleanup()" | kind=code-symbol | source=src/lib/authCodes.ts:L23 | neighbors=[authCodes.ts, consumePreAuth(), storeCode(), verifyAndConsumeCode()]
- "lib_authguards_getsessionnivel": "getSessionNivel()" | kind=code-symbol | source=src/lib/authGuards.ts:L23 | neighbors=[authGuards.ts, requireSuperAdmin(), route.ts, route.ts]
- "lib_csv_downloadcsv": "downloadCSV()" | kind=code-symbol | source=src/lib/csv.ts:L47 | neighbors=[csv.ts, dedupeHeaders(), Purchases2QBTab.tsx, DownloadBtn.tsx]
- "lib_dates_formatdateest": "formatDateEST()" | kind=code-symbol | source=src/lib/dates.ts:L28 | neighbors=[page.tsx, page.tsx, page.tsx, dates.ts]
- "lib_dates_formatmoney": "formatMoney()" | kind=code-symbol | source=src/lib/dates.ts:L64 | neighbors=[page.tsx, page.tsx, page.tsx, dates.ts]
- "menu_route": "route.ts" | kind=code-symbol | source=src/app/api/user/menu/route.ts:L1 | neighbors=[d7aa6e3 fix(auth): enforce user permiss…, db.ts, executeProcedure(), GET()]
- "modals_viewbalancemodal": "ViewBalanceModal.tsx" | kind=code-symbol | source=src/app/flexy2qb/components/modals/ViewBalanceModal.tsx:L1 | neighbors=[utils.ts, cn(), Props, ViewBalanceModal()]
- "modals_viewinvoicemodal": "ViewInvoiceModal.tsx" | kind=code-symbol | source=src/app/flexy2qb/components/modals/ViewInvoiceModal.tsx:L1 | neighbors=[utils.ts, cn(), Props, ViewInvoiceModal()]
- "move_targets_route": "route.ts" | kind=code-symbol | source=src/app/api/inventory-entry/packings/[pack_uq]/move-targets/route.ts:L1 | neighbors=[db.ts, executeProcedure(), GET(), P]
- "payment_authorizations_page_fmt": "fmt()" | kind=code-symbol | source=src/app/payment-authorizations/page.tsx:L29 | neighbors=[page.tsx, ModalCRDB(), ModalPayInvoice(), PaymentAuthorizationsPage()]
- "pbook2invoice_modalchangecustomer_modalchangecustomer": "ModalChangeCustomer()" | kind=code-symbol | source=src/components/pbook2invoice/ModalChangeCustomer.tsx:L21 | neighbors=[ModalChangeCustomer.tsx, fmtDate(), t(), page.tsx]
- "pbook2invoice_modalchangepo": "ModalChangePO.tsx" | kind=code-symbol | source=src/components/pbook2invoice/ModalChangePO.tsx:L1 | neighbors=[ModalChangePO(), Props, t(), page.tsx]
- "pbook2invoice_modalunassignstock": "ModalUnassignStock.tsx" | kind=code-symbol | source=src/components/pbook2invoice/ModalUnassignStock.tsx:L1 | neighbors=[ModalUnassignStock(), Props, t(), page.tsx]
- "products_route_post": "POST()" | kind=code-symbol | source=src/app/api/masters/items/products/route.ts:L30 | neighbors=[route.ts, bit(), num(), txt()]
- "public_pdf_worker_min_abortexception": "AbortException" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .createDocumentHandler(), wrapReason()]
- "public_pdf_worker_min_addlocallycachedimageops": "addLocallyCachedImageOps()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .addDependency(), .addImageOps(), .getOperatorList()]
- "public_pdf_worker_min_adjustmapping": "adjustMapping()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, warn(), .checkAndRepair(), .convert()]
- "public_pdf_worker_min_annotation_buildflags": "._buildFlags()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Annotation, ._saveCheckbox(), ._saveRadioButton(), .save()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-033.json

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
