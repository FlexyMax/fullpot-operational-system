# Node Description Batch 31 of 139

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

- "public_pdf_worker_min_xfafactory_createpages": "._createPages()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XFAFactory, warn(), ._createPagesHelper(), .getNumPages(), .getPages()]
- "public_pdf_worker_min_xfaobject_sn": ".[sn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XFAObject, .delete(), fn, _r, warn()]
- "public_pdf_worker_min_xfaobject_tr": ".[tr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XFAObject, shadow(), tr, wn, XFAObjectArray]
- "public_pdf_worker_min_xhtmlobject_jr": ".[jr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XhtmlObject, fr, getMeasurement(), stripQuotes(), .addString()]
- "public_pdf_worker_min_xref_processxreftable": ".processXRefTable()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XRef, FormatError, isCmd(), .readXRefTable(), .readXRef()]
- "reports_companyinfo_companyinfo": "CompanyInfo" | kind=code-symbol | source=src/lib/reports/companyInfo.ts:L3 | neighbors=[companyInfo.ts, PaymentAuthPDF.tsx, ReportPDF.tsx, StatementPDF.tsx, StatementPDFv2.tsx]
- "reports_reportmodalinner": "ReportModalInner.tsx" | kind=code-symbol | source=src/components/reports/ReportModalInner.tsx:L1 | neighbors=[657dacf fix(ap-reports): filter VFP met…, ecf4fd3 fix(reports): fix blank print +…, ReportModal.tsx, Props, ReportModalInner()]
- "reports_statementpdf_statementpdf": "StatementPDF()" | kind=code-symbol | source=src/components/reports/StatementPDF.tsx:L114 | neighbors=[StatementPDF.tsx, c(), flex(), fmtD(), fmtN()]
- "reps_route": "route.ts" | kind=code-symbol | source=src/app/api/sales/reps/route.ts:L1 | neighbors=[db.ts, executeQuery(), route.ts, authOptions, GET()]
- "reset_route": "route.ts" | kind=code-symbol | source=src/app/api/pbook2invoice/reset/route.ts:L1 | neighbors=[db.ts, executeProcedure(), route.ts, authOptions, POST()]
- "returns_route": "route.ts" | kind=code-symbol | source=src/app/api/pos/history/returns/route.ts:L1 | neighbors=[db.ts, executeQuery(), route.ts, authOptions, GET()]
- "sales_page_salespage": "SalesPage()" | kind=code-symbol | source=src/app/sales/page.tsx:L88 | neighbors=[page.tsx, fmt(), fmtDate(), fmtI(), t()]
- "salesman_route": "route.ts" | kind=code-symbol | source=src/app/api/pos/salesman/route.ts:L1 | neighbors=[db.ts, executeProcedure(), route.ts, authOptions, GET()]
- "salesmen_links_route": "route.ts" | kind=code-symbol | source=src/app/api/sales-reps/salesmen-links/route.ts:L1 | neighbors=[db.ts, executeProcedure(), DELETE(), GET(), POST()]
- "salesmen_route": "route.ts" | kind=code-symbol | source=src/app/api/masters/items/lookups/salesmen/route.ts:L1 | neighbors=[a1da4e3 refactor(masters/items): replac…, ca478bf perf(customer-payments): standa…, db.ts, executeProcedure(), GET()]
- "seasons_route_post": "POST()" | kind=code-symbol | source=src/app/api/freights/seasons/route.ts:L23 | neighbors=[route.ts, bit(), genUq(), num(), txt()]
- "send_all_customers_route": "route.ts" | kind=code-symbol | source=src/app/api/customer-payments/send-all-customers/route.ts:L1 | neighbors=[a9637e0 fix: PA CRDB FK error + Stateme…, fad3cb1 fix(ar): send-all shows all 122…, db.ts, executeProcedure(), GET()]
- "shipto_carriers_route": "route.ts" | kind=code-symbol | source=src/app/api/pos/shipto-carriers/route.ts:L1 | neighbors=[db.ts, executeProcedure(), route.ts, authOptions, GET()]
- "shiptos_route": "route.ts" | kind=code-symbol | source=src/app/api/standing-orders/shiptos/route.ts:L1 | neighbors=[db.ts, executeProcedure(), route.ts, authOptions, GET()]
- "sp_companies": "sp_companies.sql" | kind=code-symbol | source=sp_companies.sql:L1 | neighbors=[company, empresas, sp_sistema_empresas_delete(), sp_sistema_empresas_insert(), sp_sistema_empresas_update()]
- "sp_modules_screens_reports_pantalla": "pantalla" | kind=code-symbol | source=sp_modules_screens_reports.sql:L82 | neighbors=[sp_modules_screens_reports.sql, sp_sistema_modulos_delete(), sp_sistema_pantallas_delete(), sp_sistema_pantallas_insert(), sp_sistema_pantallas_update()]
- "sp_modules_screens_reports_pantalla_reportes": "pantalla_reportes" | kind=code-symbol | source=sp_modules_screens_reports.sql:L182 | neighbors=[sp_modules_screens_reports.sql, sp_sistema_pantallas_delete(), sp_sistema_reportes_delete(), sp_sistema_reportes_insert(), sp_sistema_reportes_update()]
- "stock_route": "route.ts" | kind=code-symbol | source=src/app/api/sales/stock/route.ts:L1 | neighbors=[db.ts, executeProcedure(), route.ts, authOptions, GET()]
- "store_useitemsstore_useitemsstore": "useItemsStore" | kind=code-symbol | source=src/store/useItemsStore.ts:L35 | neighbors=[page.tsx, Tab1.tsx, Tab2.tsx, Tab3.tsx, useItemsStore.ts]
- "store_usepaymentauthorizationsstore": "usePaymentAuthorizationsStore.ts" | kind=code-symbol | source=src/store/usePaymentAuthorizationsStore.ts:L1 | neighbors=[113d989 fix(payment-auth): fix date upd…, page.tsx, defaults, PaymentAuthorizationsState, usePaymentAuthorizationsStore]
- "store_usepbook2invoicestore": "usePbook2InvoiceStore.ts" | kind=code-symbol | source=src/store/usePbook2InvoiceStore.ts:L1 | neighbors=[page.tsx, BottomTabId, DateMode, Pbook2InvoiceState, usePbook2InvoiceStore]
- "stores_usestandingordersstore": "useStandingOrdersStore.ts" | kind=code-symbol | source=src/stores/useStandingOrdersStore.ts:L1 | neighbors=[4c79670 feat(standing-orders): Zustand …, OrderDetailModal.tsx, page.tsx, StandingOrdersState, useStandingOrdersStore]
- "ui_panelgridtable_panelgridtfoot": "PanelGridTfoot()" | kind=code-symbol | source=src/components/ui/PanelGridTable.tsx:L130 | neighbors=[page.tsx, page.tsx, page.tsx, page.tsx, PanelGridTable.tsx]
- "unassign_stock_route": "route.ts" | kind=code-symbol | source=src/app/api/pbook2invoice/unassign-stock/route.ts:L1 | neighbors=[db.ts, executeProcedure(), route.ts, authOptions, POST()]
- "unico_route_delete": "DELETE()" | kind=code-symbol | source=src/app/api/vendors/groups/[unico]/route.ts:L25 | neighbors=[route.ts, getTargetNivel(), t(), txt(), userUq()]
- "update_route": "route.ts" | kind=code-symbol | source=src/app/api/sales/cart/update/route.ts:L1 | neighbors=[db.ts, executeProcedure(), route.ts, authOptions, PUT()]
- "vendors_backup_vendorspage": "VendorsPage()" | kind=code-symbol | source=vendors_backup.tsx:L198 | neighbors=[vendors_backup.tsx, firstOfYear(), norm(), t(), today()]
- "vendors_page_vendorspage": "VendorsPage()" | kind=code-symbol | source=src/app/vendors/page.tsx:L223 | neighbors=[page.tsx, firstOfYear(), norm(), t(), today()]
- "verify_code_route": "route.ts" | kind=code-symbol | source=src/app/api/auth/verify-code/route.ts:L1 | neighbors=[7350a1a feat(auth): implement 2-step lo…, authCodes.ts, storePreAuth(), verifyAndConsumeCode(), POST()]
- "virtual_route": "route.ts" | kind=code-symbol | source=src/app/api/sales/warehouses/virtual/route.ts:L1 | neighbors=[db.ts, executeProcedure(), route.ts, authOptions, GET()]
- "void_line_route": "route.ts" | kind=code-symbol | source=src/app/api/pbook2invoice/void-line/route.ts:L1 | neighbors=[db.ts, executeProcedure(), route.ts, authOptions, DELETE()]
- "add_exports": "add_exports.js" | kind=code-symbol | source=add_exports.js:L1 | neighbors=[dir, files, fs, path]
- "apply_route": "route.ts" | kind=code-symbol | source=src/app/api/customer-payments/apply/route.ts:L1 | neighbors=[POST(), db.ts, executeProcedure(), ca478bf perf(customer-payments): standa…]
- "awbs_page_awbsboxesmodal": "AwbsBoxesModal()" | kind=code-symbol | source=src/app/awbs/page.tsx:L518 | neighbors=[page.tsx, fmt(), fmtDate(), t()]
- "awbs_page_fmtdate": "fmtDate()" | kind=code-symbol | source=src/app/awbs/page.tsx:L31 | neighbors=[page.tsx, AwbsBoxesModal(), AwbsPage(), t()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-030.json

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
