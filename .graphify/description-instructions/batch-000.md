# Node Description Batch 1 of 139

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
For an entity node (any other kind — e.g. a person, place, event, object),
describe what the entity is and its role, grounded in its type, its
relations (neighbors) and the provided citations/evidence — e.g.
"Lady Carfax, a wealthy heiress who disappears en route to Lausanne.".
Ground entity descriptions in the citations/evidence when present; do not
speculate beyond the context, so a node with no supporting context may be
left out of the reply.
Write every description in Portuguese (pt). Do not switch languages.
No marketing language.
Respond ONLY with a JSON object mapping each node id (as a string) to its
one-sentence description — no prose, no markdown fences.

- "public_pdf_worker_min": "pdf.worker.min.mjs" | kind=code-symbol | source=public/pdf.worker.min.mjs:L1 | neighbors=[a, Aa, AbortException, Acrobat, Acrobat7, ADBE_JSConsole]
- "lib_db": "db.ts" | kind=code-symbol | source=src/lib/db.ts:L1 | neighbors=[route.ts, route.ts, route.ts, route.ts, route.ts, route.ts]
- "lib_db_executeprocedure": "executeProcedure()" | kind=code-symbol | source=src/lib/db.ts:L55 | neighbors=[route.ts, route.ts, route.ts, route.ts, route.ts, route.ts]
- "branch:repo:github.com/FlexyMax/fullpot-operational-system#master": "master" | kind=Branch | source=git | neighbors=[01eeb75 fix(users): remove invalid Even…, 080dacf feat(auth): SUPERADMIN level re…, 0a24231 style(bi): increase grid worksp…, 0b1681d feat(ap): add multi-invoice che…, 0bfb1d7 fix(auth): use first email only…, 0d80aaa fix(log): use History icon + ad…]
- "branch:repo:github.com/FlexyMax/fullpot-operational-system#worktree-agent-a59e3078904cba68a": "worktree-agent-a59e3078904cba68a" | kind=Branch | source=git | neighbors=[01eeb75 fix(users): remove invalid Even…, 080dacf feat(auth): SUPERADMIN level re…, 081d28f fix(payment-auth): payments PDF…, 085a822 fix(accounts-payable): mobile t…, 0b02d04 fix(payment-auth): 4 issues — V…, 0bfb1d7 fix(auth): use first email only…]
- "public_pdf_worker_min_warn": "warn()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, adjustMapping(), ._constructFieldName(), .setLineEndings(), .setOptionalContent(), .setWidth()]
- "public_pdf_worker_min_confignamespace": "ConfigNamespace" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .acrobat(), .acrobat7(), .ADBE_JSConsole(), .ADBE_JSDebugger(), .addSilentPrint()]
- "public_pdf_worker_min_templatenamespace": "TemplateNamespace" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .appearanceFilter(), .arc(), .area(), .assist(), .barcode()]
- "public_pdf_worker_min_shadow": "shadow()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, ._localColorSpaceCache(), ._pdfFunctionFactory(), .isDataLoaded(), .fallbackFontDict(), .acroForm()]
- "nextauth_route": "route.ts" | kind=code-symbol | source=src/app/api/auth/[...nextauth]/route.ts:L1 | neighbors=[route.ts, route.ts, route.ts, route.ts, route.ts, route.ts]
- "inventory_entry_page": "page.tsx" | kind=code-symbol | source=src/app/inventory-entry/page.tsx:L1 | neighbors=[165c3d0 feat(inventory-entry): update m…, 2e367ec feat(inventory-entry): vertical…, 3d2b0df feat(inventory-entry): full-cel…, 3f09764 feat: sticky AP totals, IE Prod…, 6285dc8 fix(qc+inventory-entry): Scan O…, 74dd6c2 fix(inventory-entry): restore m…]
- "lib_serveraudit": "serverAudit.ts" | kind=code-symbol | source=src/lib/serverAudit.ts:L1 | neighbors=[route.ts, route.ts, route.ts, route.ts, route.ts, route.ts]
- "public_pdf_worker_min_formaterror": "FormatError" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .readHexNumber(), .readNumber(), .constructor(), .constructor(), .constructor()]
- "public_pdf_worker_min_getstringoption": "getStringOption()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .constructor(), .constructor(), .constructor(), .constructor()]
- "nextauth_route_authoptions": "authOptions" | kind=code-symbol | source=src/app/api/auth/[...nextauth]/route.ts:L6 | neighbors=[route.ts, route.ts, route.ts, route.ts, route.ts, route.ts]
- "lib_utils": "utils.ts" | kind=code-symbol | source=src/lib/utils.ts:L1 | neighbors=[page.tsx, page.tsx, page.tsx, page.tsx, page.tsx, ApplyPaymentModal.tsx]
- "lib_serveraudit_serverauditlog": "serverAuditLog()" | kind=code-symbol | source=src/lib/serverAudit.ts:L22 | neighbors=[route.ts, route.ts, route.ts, route.ts, route.ts, route.ts]
- "lib_utils_cn": "cn()" | kind=code-symbol | source=src/lib/utils.ts:L4 | neighbors=[page.tsx, page.tsx, page.tsx, page.tsx, page.tsx, ApplyPaymentModal.tsx]
- "customer_payments_page": "page.tsx" | kind=code-symbol | source=src/app/sales/customer-payments/page.tsx:L1 | neighbors=[0eba280 feat(ar): increase totals row h…, 1da1d3f feat(ar): inline email editor i…, 1f53c31 fix(ar/mobile): 4 mobile fixes …, 3907ed7 feat(customer-payments): defaul…, 7841f8d fix(ar): invoice search navigat…, 7dac8f6 fix(ar): pass date range + mode…]
- "payment_authorizations_page": "page.tsx" | kind=code-symbol | source=src/app/payment-authorizations/page.tsx:L1 | neighbors=[0b02d04 fix(payment-auth): 4 issues — V…, 0b1681d feat(ap): add multi-invoice che…, 113d989 fix(payment-auth): fix date upd…, 21d3998 fix(ui): remove redundant recor…, 232afb7 fix(payment-auth): safer paFetc…, 4b782d7 fix(ap): pass supplier_uq in Ed…]
- "public_pdf_worker_min_xfaobjectarray": "XFAObjectArray" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .constructor(), .constructor(), .constructor(), .constructor()]
- "items_tab2": "Tab2.tsx" | kind=code-symbol | source=src/app/masters/items/Tab2.tsx:L1 | neighbors=[15d0436 fix(images): enable Delete imme…, 1e41950 fix(images): constrain ImageMod…, 30b16d9 feat(items): uppercase manual d…, 387e481 feat(items): migrate grids to P…, 416549a feat(items): add Show checkboxe…, 5b51284 fix(items): fetch full product …]
- "awbs_page": "page.tsx" | kind=code-symbol | source=src/app/awbs/page.tsx:L1 | neighbors=[awbFetch(), AwbsBoxesModal(), AwbsChargesModal(), AwbsFreightsModal(), AwbsInvoiceChargesModal(), AwbsPage()]
- "ui_panelgrid": "PanelGrid.tsx" | kind=code-symbol | source=src/components/ui/PanelGrid.tsx:L1 | neighbors=[page.tsx, page.tsx, page.tsx, page.tsx, 21d3998 fix(ui): remove redundant recor…, 3091e96 feat(qc/panelgrid): Download as…]
- "accounts_payable_page": "page.tsx" | kind=code-symbol | source=src/app/accounts-payable/page.tsx:L1 | neighbors=[AccountsPayablePage(), APCalendar(), apFetch(), APSearchModal(), CrdbForm, crdbSchema]
- "standing_orders_orderdetailmodal": "OrderDetailModal.tsx" | kind=code-symbol | source=src/app/standing-orders/OrderDetailModal.tsx:L1 | neighbors=[331a363 style(standing-orders): white h…, 4c79670 feat(standing-orders): Zustand …, 505c1d8 feat(standing-orders): PDF prin…, 597add0 feat(standing-orders): Change S…, 821d7d5 feat(standing-orders): audit lo…, c23f0a7 fix(standing-orders): auto-sele…]
- "unico_route": "route.ts" | kind=code-symbol | source=src/app/api/vendors/groups/[unico]/route.ts:L1 | neighbors=[080dacf feat(auth): SUPERADMIN level re…, 15b09b1 feat(items): PanelGrid for Tab1…, 1afc81e fix(masters/items/grades): corr…, 1da1d3f feat(ar): inline email editor i…, 3322075 fix(users): close unico mismatc…, 3b0d9e6 feat(inventory-entry): add serv…]
- "customers_page": "page.tsx" | kind=code-symbol | source=src/app/masters/customers/page.tsx:L1 | neighbors=[2f37a65 feat(customers): statement moda…, 4a1017f fix(customers): replace direct …, 5405f55 style(customers): enforce Panel…, 78efbaf style(customers): move Statemen…, bd8b5c8 style(customers): search toolba…, cc3d5cb fix(customers): export CSV down…]
- "items_tab3": "Tab3.tsx" | kind=code-symbol | source=src/app/masters/items/Tab3.tsx:L1 | neighbors=[387e481 feat(items): migrate grids to P…, 3f5ad89 fix(tab3): trim Varieties menu …, 64d7480 fix(tab3): components grid now …, 984655c fix(items): 4 UI fixes — tab la…, ae15318 fix(tab3): remove duplicate pre…, b6ad5a5 feat(masters/items): variety pa…]
- "public_pdf_worker_min_dict": "Dict" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .getOperatorList(), .saveNewAnnotations(), .fallbackFontDict(), ._getDefaultCheckedAppearance(), .openAction()]
- "pbook2invoice_page": "page.tsx" | kind=code-symbol | source=src/app/pbook2invoice/page.tsx:L1 | neighbors=[AuditLogModal.tsx, AuditLogModal(), GridMenu.tsx, GridMenu(), AppFooter.tsx, AppHeader.tsx]
- "public_pdf_worker_min_catalog": "Catalog" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .acroForm(), .acroFormRef(), .attachments(), .baseUrl(), .cleanup()]
- "ui_panelgridtable": "PanelGridTable.tsx" | kind=code-symbol | source=src/components/ui/PanelGridTable.tsx:L1 | neighbors=[page.tsx, page.tsx, page.tsx, 387e481 feat(items): migrate grids to P…, f11125f feat(awbs): scroll to searched …, page.tsx]
- "public_pdf_worker_min_partialevaluator": "PartialEvaluator" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .extractTextContent(), .getAnnotationsData(), .getOperatorList(), .save(), .saveNewAnnotations()]
- "modules_page": "page.tsx" | kind=code-symbol | source=src/app/system/modules/page.tsx:L1 | neighbors=[080dacf feat(auth): SUPERADMIN level re…, 186ed6c feat(modules): module dropdown …, ce6710b feat(audit+ux): serverAuditLog …, d4bfb3c feat(audit+ui): serverAuditLog …, fac809c perf(modules): eliminate raw SQ…, AuditLogModal.tsx]
- "components_auditlogmodal": "AuditLogModal.tsx" | kind=code-symbol | source=src/components/AuditLogModal.tsx:L1 | neighbors=[page.tsx, page.tsx, page.tsx, page.tsx, 0d80aaa fix(log): use History icon + ad…, 75a1bd0 feat(qc): AuditLogModal uses Pa…]
- "tabs_purchases2qbtab": "Purchases2QBTab.tsx" | kind=code-symbol | source=src/app/flexy2qb/components/tabs/Purchases2QBTab.tsx:L1 | neighbors=[3c0001a feat(flexy2qb): add CSV downloa…, 3d34448 feat(flexy2qb): comprehensive t…, 50212fd style(flexy2qb): taller sub-tab…, 6e51a97 fix(flexy2qb): show real SP err…, 7448ff1 fix(flexy2qb): Mark as Not Read…, 80a4735 fix(flexy2qb): refresh dates pa…]
- "reports_reportpdf": "ReportPDF.tsx" | kind=code-symbol | source=src/components/reports/ReportPDF.tsx:L1 | neighbors=[route.tsx, route.tsx, route.tsx, route.tsx, 0b02d04 fix(payment-auth): 4 issues — V…, c71d597 fix(reports): subtotal label sp…]
- "freights_page": "page.tsx" | kind=code-symbol | source=src/app/masters/freights/page.tsx:L1 | neighbors=[4cb57ca feat(freights): eliminate direc…, 8d9c355 feat(freights): add season filt…, fdce648 fix(freights): restore GET hand…, AuditLogModal.tsx, AuditLogModal(), GridMenu.tsx]
- "public_pdf_worker_min_xfaobject": "XFAObject" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .[An](), .constructor(), .[Cr](), .createNodes(), .[Dr]()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-000.json

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
