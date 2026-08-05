# Node Description Batch 2 of 139

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

- "reports_companyinfo": "companyInfo.ts" | kind=code-symbol | source=src/lib/reports/companyInfo.ts:L1 | neighbors=[route.tsx, route.tsx, route.tsx, route.tsx, route.tsx, route.tsx]
- "tabs_customerpaymentstab": "CustomerPaymentsTab.tsx" | kind=code-symbol | source=src/app/flexy2qb/components/tabs/CustomerPaymentsTab.tsx:L1 | neighbors=[1d76b42 fix(flexy2qb): pass first recor…, 3c0001a feat(flexy2qb): add CSV downloa…, 3d34448 feat(flexy2qb): comprehensive t…, 50212fd style(flexy2qb): taller sub-tab…, 6e51a97 fix(flexy2qb): show real SP err…, 96d9f46 refactor(flexy2qb): move Log/Re…]
- "tabs_sales2qbtab": "Sales2QBTab.tsx" | kind=code-symbol | source=src/app/flexy2qb/components/tabs/Sales2QBTab.tsx:L1 | neighbors=[3c0001a feat(flexy2qb): add CSV downloa…, 3d34448 feat(flexy2qb): comprehensive t…, 50212fd style(flexy2qb): taller sub-tab…, 6e51a97 fix(flexy2qb): show real SP err…, 7448ff1 fix(flexy2qb): Mark as Not Read…, 96d9f46 refactor(flexy2qb): move Log/Re…]
- "tabs_salescosts2qbtab": "SalesCosts2QBTab.tsx" | kind=code-symbol | source=src/app/flexy2qb/components/tabs/SalesCosts2QBTab.tsx:L1 | neighbors=[3c0001a feat(flexy2qb): add CSV downloa…, 3d34448 feat(flexy2qb): comprehensive t…, 50212fd style(flexy2qb): taller sub-tab…, 6e51a97 fix(flexy2qb): show real SP err…, 7448ff1 fix(flexy2qb): Mark as Not Read…, 96d9f46 refactor(flexy2qb): move Log/Re…]
- "lib_permissions": "permissions.ts" | kind=code-symbol | source=src/lib/permissions.ts:L1 | neighbors=[page.tsx, page.tsx, page.tsx, page.tsx, page.tsx, 1c0ea4a fix(permissions): wire correct …]
- "public_pdf_worker_min_unreachable": "unreachable()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, ._expandKey(), assert(), .visit(), .getByName(), .set()]
- "tabs_purchasescreditstab": "PurchasesCreditsTab.tsx" | kind=code-symbol | source=src/app/flexy2qb/components/tabs/PurchasesCreditsTab.tsx:L1 | neighbors=[3c0001a feat(flexy2qb): add CSV downloa…, 3d34448 feat(flexy2qb): comprehensive t…, 50212fd style(flexy2qb): taller sub-tab…, 6e51a97 fix(flexy2qb): show real SP err…, 96d9f46 refactor(flexy2qb): move Log/Re…, ba2e1f0 feat(flexy2qb): mobile date pic…]
- "tabs_purchasesochargestab": "PurchasesOChargesTab.tsx" | kind=code-symbol | source=src/app/flexy2qb/components/tabs/PurchasesOChargesTab.tsx:L1 | neighbors=[3c0001a feat(flexy2qb): add CSV downloa…, 3d34448 feat(flexy2qb): comprehensive t…, 50212fd style(flexy2qb): taller sub-tab…, 6e51a97 fix(flexy2qb): show real SP err…, 96d9f46 refactor(flexy2qb): move Log/Re…, ba2e1f0 feat(flexy2qb): mobile date pic…]
- "tabs_salescreditstab": "SalesCreditsTab.tsx" | kind=code-symbol | source=src/app/flexy2qb/components/tabs/SalesCreditsTab.tsx:L1 | neighbors=[3c0001a feat(flexy2qb): add CSV downloa…, 3d34448 feat(flexy2qb): comprehensive t…, 50212fd style(flexy2qb): taller sub-tab…, 6e51a97 fix(flexy2qb): show real SP err…, 96d9f46 refactor(flexy2qb): move Log/Re…, ba2e1f0 feat(flexy2qb): mobile date pic…]
- "items_tab1": "Tab1.tsx" | kind=code-symbol | source=src/app/masters/items/Tab1.tsx:L1 | neighbors=[15b09b1 feat(items): PanelGrid for Tab1…, 1e63937 fix(items): Tab1 description fi…, 43ad896 style(items): stack Grades, Col…, 9d52dd6 style(items): show Item Hierarc…, eb1606a feat(masters/items): serverAudi…, ee1d500 feat(items): add useItemsStore …]
- "vendors_page": "page.tsx" | kind=code-symbol | source=src/app/vendors/page.tsx:L1 | neighbors=[2fb1952 fix(vendors): handleOpenWs was …, 5cdc4a2 fix(vendors): Web Settings moda…, cd58626 feat(vendors): serverAuditLog o…, f1ce20c feat(vendors): Web Settings mod…, AppFooter.tsx, AppFooter()]
- "lib_audit": "audit.ts" | kind=code-symbol | source=src/lib/audit.ts:L1 | neighbors=[page.tsx, page.tsx, page.tsx, page.tsx, page.tsx, 8e92481 feat(system-access): convert to…]
- "public_pdf_worker_min_dict_getarray": ".getArray()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.constructor(), .extractTextContent(), .getOperatorList(), .setBorderAndBackgroundColors(), .setBorderStyle(), .getOperatorList()]
- "public_pdf_worker_min_getinteger": "getInteger()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .constructor(), .constructor(), .constructor(), .constructor()]
- "public_pdf_worker_min_info": "info()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, ._getPageIndex(), .constructor(), .constructor(), .acroForm(), .collection()]
- "public_pdf_worker_min_pdfdocument": "PDFDocument" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .constructor(), .annotationGlobals(), .calculationOrderIds(), .checkFirstPage()]
- "sales_reps_page": "page.tsx" | kind=code-symbol | source=src/app/sales-reps/page.tsx:L1 | neighbors=[4ffbbe0 fix(sales-reps): use SALESMAN_F…, d151d61 feat(sales-reps): reports modal…, AppFooter.tsx, AppFooter(), AppHeader.tsx, AppHeader()]
- "ui_panelgridtable_panelgridtable": "PanelGridTable()" | kind=code-symbol | source=src/components/ui/PanelGridTable.tsx:L12 | neighbors=[page.tsx, page.tsx, page.tsx, page.tsx, AuditLogModal.tsx, page.tsx]
- "ui_panelgridtable_panelgridtbody": "PanelGridTbody()" | kind=code-symbol | source=src/components/ui/PanelGridTable.tsx:L62 | neighbors=[page.tsx, page.tsx, page.tsx, page.tsx, AuditLogModal.tsx, page.tsx]
- "ui_panelgridtable_panelgridtd": "PanelGridTd()" | kind=code-symbol | source=src/components/ui/PanelGridTable.tsx:L100 | neighbors=[page.tsx, page.tsx, page.tsx, page.tsx, AuditLogModal.tsx, page.tsx]
- "ui_panelgridtable_panelgridth": "PanelGridTh()" | kind=code-symbol | source=src/components/ui/PanelGridTable.tsx:L34 | neighbors=[page.tsx, page.tsx, page.tsx, page.tsx, AuditLogModal.tsx, page.tsx]
- "ui_panelgridtable_panelgridthead": "PanelGridThead()" | kind=code-symbol | source=src/components/ui/PanelGridTable.tsx:L26 | neighbors=[page.tsx, page.tsx, page.tsx, page.tsx, AuditLogModal.tsx, page.tsx]
- "ui_panelgridtable_panelgridtr": "PanelGridTr()" | kind=code-symbol | source=src/components/ui/PanelGridTable.tsx:L66 | neighbors=[page.tsx, page.tsx, page.tsx, page.tsx, AuditLogModal.tsx, page.tsx]
- "carriers_page": "page.tsx" | kind=code-symbol | source=src/app/masters/carriers/page.tsx:L1 | neighbors=[CarriersDefinitionPage(), ConfirmDlg(), EMPTY, EMPTY_ARR, F(), sF()]
- "public_pdf_worker_min_annotation": "Annotation" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, ._buildFlags(), ._constructFieldName(), .constructor(), .extractTextContent(), .getFieldObject()]
- "sales_page": "page.tsx" | kind=code-symbol | source=src/app/sales/page.tsx:L1 | neighbors=[AppFooter.tsx, AppFooter(), AppHeader.tsx, AppHeader(), MobileActionBar.tsx, MobileActionBar()]
- "scan_page": "page.tsx" | kind=code-symbol | source=src/app/scan/page.tsx:L1 | neighbors=[3ab71d6 feat(scan-out): add full Scan O…, 6ea09a8 fix(physical-scan): quickfixes …, 75b26c7 feat(physical-scan): add useSca…, 923e449 feat(physical-scan): convert al…, c12e586 feat(physical-scan): add 2 miss…, d645c42 fix(permissions): assign correc…]
- "standing_orders_page": "page.tsx" | kind=code-symbol | source=src/app/standing-orders/page.tsx:L1 | neighbors=[4c79670 feat(standing-orders): Zustand …, 505c1d8 feat(standing-orders): PDF prin…, 597add0 feat(standing-orders): Change S…, 821d7d5 feat(standing-orders): audit lo…, c23f0a7 fix(standing-orders): auto-sele…, AuditLogModal.tsx]
- "public_pdf_worker_min_font_checkandrepair": ".checkAndRepair()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Font, adjustMapping(), adjustWidths(), assert(), .getInt32(), .peekByte()]
- "public_pdf_worker_min_partialevaluator_getoperatorlist": ".getOperatorList()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PartialEvaluator, addLocallyCachedImageOps(), .getByRef(), .getRgb(), EvalState, EvaluatorPreprocessor]
- "public_pdf_worker_min_wr": "wr" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, applyAssist(), .[nn](), ._bindOccurrences(), ._createOccurrences(), ._findDataByNameToConsume()]
- "public_pdf_worker_min_xref_fetchifref": ".fetchIfRef()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.create(), ._saveCheckbox(), ._saveRadioButton(), .#P(), ._readDocumentOutline(), ._readStructTreeRoot()]
- "reports_reportutils": "reportUtils.ts" | kind=code-symbol | source=src/lib/reports/reportUtils.ts:L1 | neighbors=[route.tsx, 37b7727 fix(payment-auth): payments-by-…, a1d0e33 fix(reports): add TITULOREPORTE…, ecf4fd3 fix(reports): fix blank print +…, route.tsx, route.tsx]
- "users_page": "page.tsx" | kind=code-symbol | source=src/app/system/users/page.tsx:L1 | neighbors=[01eeb75 fix(users): remove invalid Even…, 080dacf feat(auth): SUPERADMIN level re…, 11c8872 fix(users): fix filter bar layo…, 39269e4 fix(system-users): prevent scro…, 7d02b5a fix(users): move log filters to…, 7efdb5e fix(system-users): replace miss…]
- "companies_page": "page.tsx" | kind=code-symbol | source=src/app/system/companies/page.tsx:L1 | neighbors=[080dacf feat(auth): SUPERADMIN level re…, a0363ff fix(companies): first-load blan…, CompaniesPage(), CompanyFormModal(), EMPTY_ARR, EMPTY_COMPANY]
- "reports_companyinfo_getcompanyinfo": "getCompanyInfo()" | kind=code-symbol | source=src/lib/reports/companyInfo.ts:L18 | neighbors=[route.tsx, route.tsx, route.tsx, route.tsx, route.tsx, route.tsx]
- "products_route": "route.ts" | kind=code-symbol | source=src/app/api/standing-orders/products/route.ts:L1 | neighbors=[3f0f8ef fix(awbs): rename report routes…, eb1606a feat(masters/items): serverAudi…, f3f0b38 fix(products): fix NULL descrip…, db.ts, executeProcedure(), serverAudit.ts]
- "crdb_route": "route.tsx" | kind=code-symbol | source=src/app/api/payment-authorizations/reports/crdb/route.tsx:L1 | neighbors=[085a822 fix(accounts-payable): mobile t…, 5949fec feat(audit): server-side bitaco…, 657dacf fix(ap-reports): filter VFP met…, 8364803 feat(payment-authorizations): i…, a61433b fix(ap-reports): normalize colu…, ca478bf perf(customer-payments): standa…]
- "access_page": "page.tsx" | kind=code-symbol | source=src/app/system/access/page.tsx:L1 | neighbors=[CopyAccessModal(), EMPTY_ARR, isSARow(), PERM_FIELDS, PERM_LABELS, PermField]
- "business_intelligence_page": "page.tsx" | kind=code-symbol | source=src/app/business-intelligence/page.tsx:L1 | neighbors=[apiDelete(), apiPost(), apiPut(), applyConfigToGrid(), BIConfigJson, biFetch()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-001.json

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
