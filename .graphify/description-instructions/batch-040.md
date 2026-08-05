# Node Description Batch 41 of 139

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

- "public_pdf_worker_min_xref_getnewpersistentref": ".getNewPersistentRef()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.baseFontRef(), .descendantFontRef(), .fontDescriptorRef(), XRef]
- "public_pdf_worker_min_xref_readxreftable": ".readXRefTable()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XRef, .processXRefTable(), FormatError, isCmd()]
- "public_pdf_worker_min_xrefentryexception": "XRefEntryException" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .fetchCompressed(), .fetchUncompressed(), .constructor()]
- "quotas_route": "route.ts" | kind=code-symbol | source=src/app/api/masters/items/products/[unico]/quotas/route.ts:L1 | neighbors=[db.ts, executeProcedure(), GET(), POST()]
- "refactor_cp": "refactor_cp.js" | kind=code-symbol | source=refactor_cp.js:L1 | neighbors=[content, file, fs, path]
- "reports_htmlreportmodal": "HtmlReportModal.tsx" | kind=code-symbol | source=src/components/reports/HtmlReportModal.tsx:L1 | neighbors=[ba40c73 feat(ar): fix invoice print/ema…, page.tsx, HtmlReportModal(), Props]
- "reports_labelgridpdf": "LabelGridPDF.tsx" | kind=code-symbol | source=src/components/reports/LabelGridPDF.tsx:L1 | neighbors=[route.tsx, LabelGridPDF(), styles, t()]
- "sales_usecustomerpaymentsstore": "useCustomerPaymentsStore.ts" | kind=code-symbol | source=src/store/sales/useCustomerPaymentsStore.ts:L1 | neighbors=[3907ed7 feat(customer-payments): defaul…, page.tsx, CustomerPaymentsState, useCustomerPaymentsStore]
- "salesman_uq_route": "route.ts" | kind=code-symbol | source=src/app/api/customer-payments/customers-by-salesman/[salesman_uq]/route.ts:L1 | neighbors=[db.ts, executeProcedure(), GET(), P]
- "scan_history_route": "route.ts" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/scan-history/route.ts:L1 | neighbors=[db.ts, getFullpotPool(), GET(), P]
- "scratch_extractsistema": "extractSistema.js" | kind=code-symbol | source=scratch/extractSistema.js:L1 | neighbors=[files, fs, path, results]
- "scratch_extractvfp": "extractVfp.js" | kind=code-symbol | source=scratch/extractVfp.js:L1 | neighbors=[files, fs, path, results]
- "scratch_findsps": "findSps.js" | kind=code-symbol | source=scratch/findSps.js:L1 | neighbors=[files, fs, path, results]
- "scratch_rewrite_setupmodal": "rewrite_setupmodal.js" | kind=code-symbol | source=scratch/rewrite_setupmodal.js:L1 | neighbors=[content, filePath, fs, path]
- "scratch_rewrite_setupmodal2": "rewrite_setupmodal2.js" | kind=code-symbol | source=scratch/rewrite_setupmodal2.js:L1 | neighbors=[content, filePath, fs, path]
- "scripts_copy_pdf_worker": "copy-pdf-worker.mjs" | kind=code-symbol | source=scripts/copy-pdf-worker.mjs:L1 | neighbors=[dest, destDir, __dirname, require]
- "send_label_route": "route.ts" | kind=code-symbol | source=src/app/api/inventory-entry/packings/[pack_uq]/send-label/route.ts:L1 | neighbors=[db.ts, executeProcedure(), P, POST()]
- "shipto_route_post": "POST()" | kind=code-symbol | source=src/app/api/masters/customers/shipto/route.ts:L12 | neighbors=[route.ts, bit(), num(), txt()]
- "sp_companies_empresas": "empresas" | kind=code-symbol | source=sp_companies.sql:L36 | neighbors=[sp_companies.sql, sp_sistema_empresas_delete(), sp_sistema_empresas_insert(), sp_sistema_empresas_update()]
- "sp_modules_screens_reports_modulo": "modulo" | kind=code-symbol | source=sp_modules_screens_reports.sql:L26 | neighbors=[sp_modules_screens_reports.sql, sp_sistema_modulos_delete(), sp_sistema_modulos_insert(), sp_sistema_modulos_update()]
- "standing_orders_changesalesmanmodal": "ChangeSalesmanModal.tsx" | kind=code-symbol | source=src/app/standing-orders/ChangeSalesmanModal.tsx:L1 | neighbors=[ChangeSalesmanModal(), Props, t(), OrderDetailModal.tsx]
- "standing_orders_headermodal_headermodal": "HeaderModal()" | kind=code-symbol | source=src/app/standing-orders/HeaderModal.tsx:L47 | neighbors=[HeaderModal.tsx, t(), OrderDetailModal.tsx, page.tsx]
- "standing_orders_orderdetailmodal_orderdetailmodal": "OrderDetailModal()" | kind=code-symbol | source=src/app/standing-orders/OrderDetailModal.tsx:L76 | neighbors=[OrderDetailModal.tsx, fmtDate(), t(), page.tsx]
- "standing_orders_setweeksmodal_setweeksmodal": "SetWeeksModal()" | kind=code-symbol | source=src/app/standing-orders/SetWeeksModal.tsx:L30 | neighbors=[OrderDetailModal.tsx, SetWeeksModal.tsx, fmtDate(), t()]
- "store_usecarriersstore": "useCarriersStore.ts" | kind=code-symbol | source=src/store/useCarriersStore.ts:L1 | neighbors=[page.tsx, d468a28 feat(carriers+payment-auth): in…, CarriersState, useCarriersStore]
- "store_usesalesrepsstore": "useSalesRepsStore.ts" | kind=code-symbol | source=src/store/useSalesRepsStore.ts:L1 | neighbors=[page.tsx, ActiveTab, SalesRepsState, useSalesRepsStore]
- "store_usevendorsstore": "useVendorsStore.ts" | kind=code-symbol | source=src/store/useVendorsStore.ts:L1 | neighbors=[ModalVendorTab, useVendorsStore, VendorsState, page.tsx]
- "subclasses_route_post": "POST()" | kind=code-symbol | source=src/app/api/masters/items/subclasses/route.ts:L26 | neighbors=[route.ts, bit(), num(), txt()]
- "system_useaccessstore": "useAccessStore.ts" | kind=code-symbol | source=src/store/system/useAccessStore.ts:L1 | neighbors=[page.tsx, AccessState, CopyModal, useAccessStore]
- "system_useuserstore": "useUserStore.ts" | kind=code-symbol | source=src/store/system/useUserStore.ts:L1 | neighbors=[UserUpsertModal.tsx, UserState, useUserStore, page.tsx]
- "test_api": "test_api.js" | kind=code-symbol | source=test_api.js:L1 | neighbors=[config, executeProcedure(), run(), sql]
- "test_lookups": "test_lookups.js" | kind=code-symbol | source=test_lookups.js:L1 | neighbors=[config, executeProcedure(), run(), sql]
- "test_salesman": "test_salesman.js" | kind=code-symbol | source=test_salesman.js:L1 | neighbors=[config, executeProcedure(), run(), sql]
- "unico_route_txt": "txt()" | kind=code-symbol | source=src/app/api/system/users/[unico]/route.ts:L16 | neighbors=[route.ts, DELETE(), GET(), PUT()]
- "user_route": "route.ts" | kind=code-symbol | source=src/app/api/system/access/user/route.ts:L1 | neighbors=[8e92481 feat(system-access): convert to…, db.ts, executeProcedure(), GET()]
- "vendors_summary_route": "route.ts" | kind=code-symbol | source=src/app/api/payment-authorizations/vendors-summary/route.ts:L1 | neighbors=[0b02d04 fix(payment-auth): 4 issues — V…, db.ts, executeProcedure(), GET()]
- "verify_bi_exec": "verify_bi_exec.js" | kind=code-symbol | source=verify_bi_exec.js:L1 | neighbors=[config, main(), runPositional(), sql]
- "warehouse_route_post": "POST()" | kind=code-symbol | source=src/app/api/freights/warehouse/route.ts:L11 | neighbors=[route.ts, bit(), num(), txt()]
- "wh_instructions_route_get": "GET()" | kind=code-symbol | source=src/app/api/inventory-entry/reports/wh-instructions/route.tsx:L33 | neighbors=[route.tsx, fmt2(), fmtI(), t()]
- "whouse_totals_route": "route.ts" | kind=code-symbol | source=src/app/api/inventory-entry/whouse-totals/route.ts:L1 | neighbors=[db.ts, executeProcedure(), GET(), str()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-040.json

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
