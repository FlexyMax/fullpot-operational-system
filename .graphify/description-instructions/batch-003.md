# Node Description Batch 4 of 139

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
LANGUAGE: each entry has a `lang=` marker giving the language of its source.
Write that entry's description in EXACTLY that language. Do not translate to
a single common language — match each node's source language individually.
No marketing language.
Respond ONLY with a JSON object mapping each node id (as a string) to its
one-sentence description — no prose, no markdown fences.

- "public_pdf_worker_min_partialevaluator_translatefont": ".translateFont()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PartialEvaluator, .loadFont(), Dict, .getArray(), Font, FormatError] | lang=en
- "public_pdf_worker_min_postscriptstack_pop": ".pop()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.parse(), .clean(), buildHuffmanTable(), .getAllPageDicts(), .getPageDict(), compileCharString()] | lang=en
- "public_pdf_worker_min_refset": "RefSet" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, ._constructFieldName(), .constructor(), .getAllPageDicts(), .getPageDict(), .#P()] | lang=en
- "public_pdf_worker_min_stream": "Stream" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, createBuiltInCMap(), .makeSubStream(), .asyncGetBytes(), .checkAndRepair(), incrementalUpdate()] | lang=en
- "vendors_backup": "vendors_backup.tsx" | kind=code-symbol | source=vendors_backup.tsx:L1 | neighbors=[GridMenu.tsx, GridMenu(), AppHeader.tsx, AppHeader(), audit.ts, useAuditLog()] | lang=en
- "invoice_route": "route.tsx" | kind=code-symbol | source=src/app/api/pbook2invoice/reports/invoice/route.tsx:L1 | neighbors=[5949fec feat(audit): server-side bitaco…, COLUMNS, DELETE(), fmt2(), fmtDate(), fmtI()] | lang=en
- "public_pdf_worker_min_basepdfmanager": "BasePdfManager" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .catalog(), .cleanup(), .constructor(), .docBaseUrl(), .docId()] | lang=en
- "public_pdf_worker_min_measuretostring": "measureToString()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, addHTML(), .[nn](), .[nn](), .[nn](), .[nn]()] | lang=en
- "public_pdf_worker_min_xmlobject": "XmlObject" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, ._bindElement(), .constructor(), .[cn](), .createNodes(), .constructor()] | lang=en
- "quarterly_detail_route": "route.tsx" | kind=code-symbol | source=src/app/api/payment-authorizations/reports/quarterly-detail/route.tsx:L1 | neighbors=[0b02d04 fix(payment-auth): 4 issues — V…, bd0afde fix(payment-auth): blank PDF (A…, ecf4fd3 fix(reports): fix blank print +…, db.ts, executeProcedure(), GET()] | lang=en
- "action_route": "route.ts" | kind=code-symbol | source=src/app/api/qc/[tab]/[action]/route.ts:L1 | neighbors=[MUTATION_ACTIONS, P, POST(), QB_TABLE, db.ts, executeProcedure()] | lang=en
- "public_pdf_worker_min_lexer": "Lexer" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .create(), createBuiltInCMap(), .constructor(), .constructor(), .getHexString()] | lang=en
- "public_pdf_worker_min_operatorlist": "OperatorList" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .getOperatorList(), .getOperatorList(), .addDependencies(), .addDependency(), .addImageOps()] | lang=en
- "public_pdf_worker_min_widgetannotation": "WidgetAnnotation" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .create(), .amendSavedDict(), ._computeFontSize(), .constructor(), ._decodeFormValue()] | lang=en
- "public_pdf_worker_min_workermessagehandler_createdocumenthandler": ".createDocumentHandler()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[WorkerMessageHandler, AbortException, .generateImages(), .ensureCatalog(), .ensureDoc(), clearGlobalCaches()] | lang=en
- "quarterly_route": "route.tsx" | kind=code-symbol | source=src/app/api/payment-authorizations/reports/quarterly/route.tsx:L1 | neighbors=[0b02d04 fix(payment-auth): 4 issues — V…, bd0afde fix(payment-auth): blank PDF (A…, ecf4fd3 fix(reports): fix blank print +…, db.ts, executeProcedure(), GET()] | lang=en
- "reports_reportpdf_reportcolumn": "ReportColumn" | kind=code-symbol | source=src/components/reports/ReportPDF.tsx:L42 | neighbors=[route.tsx, route.tsx, route.tsx, route.tsx, route.tsx, route.ts] | lang=en
- "tabs_cancelledpurchasestab": "CancelledPurchasesTab.tsx" | kind=code-symbol | source=src/app/qc/components/tabs/CancelledPurchasesTab.tsx:L1 | neighbors=[3091e96 feat(qc/panelgrid): Download as…, 7c0d5ac feat(qc): infinite scroll, auto…, 8b150b9 fix(qc): add onLog/onRefresh to…, af5d85c style(qc): remove duplicate sea…, b8b372b fix(qc): wire AuditLogModal to …, efc6ad8 refactor(qc): migrate all grid …] | lang=en
- "public_pdf_worker_min_cffparser": "CFFParser" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .constructor(), .createDict(), .emptyPrivateDictionary(), .parse()] | lang=en
- "public_pdf_worker_min_exclgroup_nn": ".[nn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ExclGroup, applyAssist(), checkDimensions(), createWrapper(), fixDimensions(), .isBreak()] | lang=en
- "public_pdf_worker_min_getmeasurement": "getMeasurement()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .constructor(), .constructor(), .constructor(), .constructor()] | lang=en
- "public_pdf_worker_min_isname": "isName()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .setBorderStyle(), .getAllPageDicts(), .getPageDict(), .metadata(), .parseDestDictionary()] | lang=en
- "public_pdf_worker_min_partialevaluator_buildpaintimagexobject": ".buildPaintImageXObject()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PartialEvaluator, assert(), .getArray(), .addByteSize(), .hasDecodeFailed(), .setData()] | lang=en
- "standing_orders_productslistmodal": "ProductsListModal.tsx" | kind=code-symbol | source=src/app/standing-orders/ProductsListModal.tsx:L1 | neighbors=[505c1d8 feat(standing-orders): PDF prin…, 821d7d5 feat(standing-orders): audit lo…, OrderDetailModal.tsx, utils.ts, cn(), fmt()] | lang=en
- "charges_route": "route.tsx" | kind=code-symbol | source=src/app/api/awbs/reports/charges/route.tsx:L1 | neighbors=[GET(), POST(), db.ts, executeProcedure(), companyInfo.ts, getCompanyInfo()] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@6285dc8249ac639cc48d7d60f0bcf144915c34e9": "6285dc8 fix(qc+inventory-entry): Scan OUT mobile modal + replace all inline err…" | kind=Commit | source=git | neighbors=[5949fec feat(audit): server-side bitaco…, worktree-agent-a59e3078904cba68a, 3b0d9e6 feat(inventory-entry): add serv…, ModalAddProductToPacking.tsx, ModalAvailableDate.tsx, ModalAWBSetup.tsx] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@7772f1ba7f8b4355b35948f946c037b9977c4df4": "7772f1b feat(scan-in): add AWB Reception / Scan IN screen" | kind=Commit | source=git | neighbors=[68885a9 fix(menu+scan-out): disable Sca…, route.ts, route.ts, master, f4ad8b5 fix(scan-in): correct all SP pa…, route.ts] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@ce6710b132314909825146f4f8218557efee4ad1": "ce6710b feat(audit+ux): serverAuditLog on System/PaymentAuth routes; replace co…" | kind=Commit | source=git | neighbors=[page.tsx, route.ts, master, worktree-agent-a59e3078904cba68a, route.ts, d4bfb3c feat(audit+ui): serverAuditLog …] | lang=fr
- "layout_appheader_appheader": "AppHeader()" | kind=code-symbol | source=src/components/layout/AppHeader.tsx:L28 | neighbors=[page.tsx, page.tsx, page.tsx, page.tsx, page.tsx, page.tsx] | lang=en
- "public_pdf_worker_min_cmap": "CMap" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .addCodespaceRange(), .charCodeOf(), .constructor(), .contains(), .forEach()] | lang=en
- "public_pdf_worker_min_draw_nn": ".[nn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Draw, applyAssist(), checkDimensions(), computeBbox(), createWrapper(), fixDimensions()] | lang=en
- "public_pdf_worker_min_refsetcache": "RefSetCache" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .constructor(), .optionalContentConfig(), .constructor(), .saveNewAnnotations()] | lang=en
- "public_pdf_worker_min_tostyle": "toStyle()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .[nn](), .[nn](), .[nn](), .[nn](), .[on]()] | lang=en
- "public_pdf_worker_min_widgetannotation_getappearance": "._getAppearance()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[WidgetAnnotation, assert(), .getKeys(), escapeString(), FakeUnicodeFont, .createFontResources()] | lang=en
- "tabs_transitboxestab": "TransitBoxesTab.tsx" | kind=code-symbol | source=src/app/qc/components/tabs/TransitBoxesTab.tsx:L1 | neighbors=[3091e96 feat(qc/panelgrid): Download as…, 7c0d5ac feat(qc): infinite scroll, auto…, 8b150b9 fix(qc): add onLog/onRefresh to…, af5d85c style(qc): remove duplicate sea…, b8b372b fix(qc): wire AuditLogModal to …, efc6ad8 refactor(qc): migrate all grid …] | lang=en
- "duties_route": "route.tsx" | kind=code-symbol | source=src/app/api/awbs/reports/duties/route.tsx:L1 | neighbors=[3f0f8ef fix(awbs): rename report routes…, GET(), db.ts, executeProcedure(), companyInfo.ts, getCompanyInfo()] | lang=en
- "list_route": "route.tsx" | kind=code-symbol | source=src/app/api/sales-reps/reports/list/route.tsx:L1 | neighbors=[2fa45a1 fix(sales-reps): add explicit a…, d151d61 feat(sales-reps): reports modal…, db.ts, executeProcedure(), GET(), companyInfo.ts] | lang=en
- "menu_page": "page.tsx" | kind=code-symbol | source=src/app/menu/page.tsx:L1 | neighbors=[080dacf feat(auth): SUPERADMIN level re…, 1c3fd1b fix(menu): only map P.O.S./BILL…, 3ab71d6 feat(scan-out): add full Scan O…, 68885a9 fix(menu+scan-out): disable Sca…, 6ea09a8 fix(physical-scan): quickfixes …, 7772f1b feat(scan-in): add AWB Receptio…] | lang=en
- "public_pdf_worker_min_chunkedstream": "ChunkedStream" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .ensureByte(), .ensureRange(), .getBaseStreams(), .getByte()] | lang=en
- "public_pdf_worker_min_nn": "nn" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, applyAssist(), .[nn](), .[nn](), .[nn](), .[nn]()] | lang=en

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-003.json

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
