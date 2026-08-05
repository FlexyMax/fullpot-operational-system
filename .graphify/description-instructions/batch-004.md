# Node Description Batch 5 of 139

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

- "public_pdf_worker_min_pdfimage": "PDFImage" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .buildPaintImageXObject(), .buildImage(), .constructor(), .createBitmap(), .createImageData()]
- "reports_reportutils_t": "t()" | kind=code-symbol | source=src/lib/reports/reportUtils.ts:L4 | neighbors=[route.tsx, route.tsx, route.tsx, route.tsx, route.tsx, route.tsx]
- "standing_orders_boxcompositionmodal": "BoxCompositionModal.tsx" | kind=code-symbol | source=src/app/standing-orders/BoxCompositionModal.tsx:L1 | neighbors=[505c1d8 feat(standing-orders): PDF prin…, b4899cc style(standing-orders): standar…, BoxCompositionModal(), CompRow, fmt(), fmtI()]
- "layout_mobileactionbar": "MobileActionBar.tsx" | kind=code-symbol | source=src/components/layout/MobileActionBar.tsx:L1 | neighbors=[page.tsx, page.tsx, GRID_ICONS, GRID_LABELS, MobileActionBar(), utils.ts]
- "modals_qcmodal": "QCModal.tsx" | kind=code-symbol | source=src/app/qc/components/modals/QCModal.tsx:L1 | neighbors=[b8b372b fix(qc): wire AuditLogModal to …, blankForm(), calcQC(), CBRow(), EMPTY_ARR, Field()]
- "permissions_route": "route.ts" | kind=code-symbol | source=src/app/api/system/permissions/route.ts:L1 | neighbors=[080dacf feat(auth): SUPERADMIN level re…, 8e92481 feat(system-access): convert to…, d4bfb3c feat(audit+ui): serverAuditLog …, d7aa6e3 fix(auth): enforce user permiss…, authGuards.ts, getSessionNivel()]
- "public_pdf_worker_min_annotation_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Annotation, ._constructFieldName(), .setAppearance(), .setBorderAndBackgroundColors(), .setBorderStyle(), .setColor()]
- "public_pdf_worker_min_binder": "Binder" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .bind(), ._bindElement(), ._bindItems(), ._bindOccurrences(), ._bindValue()]
- "public_pdf_worker_min_chunkedstreammanager": "ChunkedStreamManager" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .abort(), .constructor(), .getBeginChunk(), .getEndChunk(), .getStream()]
- "public_pdf_worker_min_word64_assign": ".assign()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.[nn](), .[on](), .[on](), .opMap(), .[nn](), .[nn]()]
- "report_route": "route.tsx" | kind=code-symbol | source=src/app/api/standing-orders/report/route.tsx:L1 | neighbors=[505c1d8 feat(standing-orders): PDF prin…, db.ts, executeProcedure(), COLUMNS, GET(), P]
- "scan_route": "route.ts" | kind=code-symbol | source=src/app/api/scan-in/scan/route.ts:L1 | neighbors=[624fb9b fix(scan-in): map all SP column…, 6ea09a8 fix(physical-scan): quickfixes …, 7772f1b feat(scan-in): add AWB Receptio…, a54e0fd fix(scan-in): correct SP error/…, a5dce9a fix(scan-in): pass lcUser_uq fr…, ea21633 fix(scan-in): rename SPs to NC_…]
- "standing_orders_futurestockmodal": "FutureStockModal.tsx" | kind=code-symbol | source=src/app/standing-orders/FutureStockModal.tsx:L1 | neighbors=[505c1d8 feat(standing-orders): PDF prin…, 821d7d5 feat(standing-orders): audit lo…, fmt(), FutureStockModal(), Props, StockRow]
- "ui_mobiledatecalendar": "MobileDateCalendar.tsx" | kind=code-symbol | source=src/components/ui/MobileDateCalendar.tsx:L1 | neighbors=[f61ab73 feat(flexy2qb): replace mobile …, CustomerPaymentsTab.tsx, Purchases2QBTab.tsx, PurchasesCreditsTab.tsx, PurchasesOChargesTab.tsx, Sales2QBTab.tsx]
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@4cb57ca83ca84d12166b75feda3c1601a33f36d1": "4cb57ca feat(freights): eliminate direct SQL, add serverAuditLog, PanelGrid mod…" | kind=Commit | source=git | neighbors=[route.ts, route.ts, master, worktree-agent-a59e3078904cba68a, route.ts, fdce648 fix(freights): restore GET hand…]
- "companies_route": "route.ts" | kind=code-symbol | source=src/app/api/system/companies/route.ts:L1 | neighbors=[080dacf feat(auth): SUPERADMIN level re…, a0363ff fix(companies): first-load blan…, ce6710b feat(audit+ux): serverAuditLog …, bit(), GET(), POST()]
- "components_shared_fmtdate": "fmtDate()" | kind=code-symbol | source=src/app/sales/customer-payments/components/Shared.tsx:L11 | neighbors=[ApplyPaymentModal.tsx, ApproveCreditModal.tsx, CashBackModal.tsx, CorpInvoiceModal.tsx, CorpPaymentModal.tsx, CrDbModal.tsx]
- "components_shared_t": "t()" | kind=code-symbol | source=src/app/sales/customer-payments/components/Shared.tsx:L7 | neighbors=[ApplyPaymentModal.tsx, ApproveCreditModal.tsx, CashBackModal.tsx, CorpInvoiceModal.tsx, CorpPaymentModal.tsx, CrDbModal.tsx]
- "items_page": "page.tsx" | kind=code-symbol | source=src/app/masters/items/page.tsx:L1 | neighbors=[64d7480 fix(tab3): components grid now …, 984655c fix(items): 4 UI fixes — tab la…, ee1d500 feat(items): add useItemsStore …, ItemsSetupPage(), Tab1.tsx, Tab2.tsx]
- "lib_authguards": "authGuards.ts" | kind=code-symbol | source=src/lib/authGuards.ts:L1 | neighbors=[080dacf feat(auth): SUPERADMIN level re…, 1c0ea4a fix(permissions): wire correct …, route.ts, route.ts, route.ts, getSessionNivel()]
- "lib_permissions_permission_msgs": "PERMISSION_MSGS" | kind=code-symbol | source=src/lib/permissions.ts:L87 | neighbors=[page.tsx, page.tsx, page.tsx, page.tsx, page.tsx, page.tsx]
- "public_pdf_worker_min_calrgbcs": "CalRGBCS" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .#B(), .#c(), .constructor(), .#d(), .#E()]
- "public_pdf_worker_min_cffcompiler_compile": ".compile()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFCompiler, .compileCharset(), .compileCharStrings(), .compileEncoding(), .compileFDSelect(), .compileHeader()]
- "public_pdf_worker_min_colorspace": "ColorSpace" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, ._cache(), .constructor(), .fillRgb(), .getCached(), .getOutputLength()]
- "public_pdf_worker_min_jpegimage": "JpegImage" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .canUseImageDecoder(), .constructor(), ._convertCmykToRgb(), ._convertCmykToRgba(), ._convertYcckToCmyk()]
- "public_pdf_worker_min_meshshading_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[MeshShading, .getRgb(), .getArray(), FormatError, lookupNormalRect(), ._buildFigureFromPatch()]
- "public_pdf_worker_min_messagehandler": "MessageHandler" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, assert(), MessageHandler, .#AA(), .constructor(), .destroy()]
- "public_pdf_worker_min_pdfdocument_loadxfafonts": ".loadXfaFonts()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFDocument, .ensureCatalog(), .getAsync(), getXfaFontDict(), getXfaFontName(), ObjectLoader]
- "public_pdf_worker_min_simplesegmentvisitor_onsymboldictionary": ".onSymbolDictionary()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[SimpleSegmentVisitor, decodeBitmap(), decodeIAID(), decodeInteger(), decodeMMRBitmap(), decodeRefinement()]
- "public_pdf_worker_min_structtreeroot": "StructTreeRoot" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, ._readStructTreeRoot(), .addAnnotationIdToPage(), .canCreateStructureTree(), .canUpdateStructTree(), .constructor()]
- "public_pdf_worker_min_writeobject": "writeObject()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .saveNewAnnotations(), ._saveCheckbox(), ._saveRadioButton(), incrementalUpdate(), .createNewAnnotation()]
- "public_pdf_worker_min_xfafactory": "XFAFactory" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .xfaFactory(), .appendFonts(), .constructor(), ._createDocument(), ._createPages()]
- "public_pdf_worker_min_xhtmlnamespace": "XhtmlNamespace" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .a(), .b(), .body(), .br(), .[cn]()]
- "reports_reportutils_fmtdate": "fmtDate()" | kind=code-symbol | source=src/lib/reports/reportUtils.ts:L6 | neighbors=[route.tsx, route.tsx, route.tsx, route.tsx, route.tsx, route.tsx]
- "reports_statementpdfv2": "StatementPDFv2.tsx" | kind=code-symbol | source=src/components/reports/StatementPDFv2.tsx:L1 | neighbors=[4c69f8a fix(ar): replace orange header …, 4d6d80d feat(ar): white header + aging/…, 581b42b fix(ar): remove gray separator …, companyInfo.ts, CompanyInfo, flx()]
- "sp_modules_screens_reports": "sp_modules_screens_reports.sql" | kind=code-symbol | source=sp_modules_screens_reports.sql:L1 | neighbors=[module, modulo, pantalla, pantalla_reportes, report, screen]
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@6ea09a8493eaa8996792b501594c1ba20a8a7ee1": "6ea09a8 fix(physical-scan): quickfixes — auth, audit log, orange codes, gray ba…" | kind=Commit | source=git | neighbors=[master, worktree-agent-a59e3078904cba68a, 923e449 feat(physical-scan): convert al…, route.ts, permissions.ts, page.tsx]
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@821d7d50c8afa0206bbfa8b9537c4ea2f08c2f62": "821d7d5 feat(standing-orders): audit logs, PanelGrid in all modal grids, dark h…" | kind=Commit | source=git | neighbors=[master, worktree-agent-a59e3078904cba68a, route.ts, route.ts, b4899cc style(standing-orders): standar…, route.ts]
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@ca478bff82ccefbc653b23784c2665476c4910ac": "ca478bf perf(customer-payments): standardize AR routes, fix SPs, orange code co…" | kind=Commit | source=git | neighbors=[route.ts, worktree-agent-a59e3078904cba68a, route.ts, e5fdd2c docs(standards): SP return form…, route.ts, route.ts]
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@eb1606a7713ebf174b8e3de85473faa327edeb0e": "eb1606a feat(masters/items): serverAuditLog on all CRUD routes + Sonner toasts …" | kind=Commit | source=git | neighbors=[15b09b1 feat(items): PanelGrid for Tab1…, route.ts, master, worktree-agent-a59e3078904cba68a, a1da4e3 refactor(masters/items): replac…, route.ts]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-004.json

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
