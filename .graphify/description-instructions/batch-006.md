# Node Description Batch 7 of 139

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
Write every description in English (en). Do not switch languages.
No marketing language.
Respond ONLY with a JSON object mapping each node id (as a string) to its
one-sentence description — no prose, no markdown fences.

- "public_pdf_worker_min_assert": "assert()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, unreachable(), .checkAndRepair(), ._buildFigureFromPatch(), MessageHandler, .buildPaintImageXObject()]
- "public_pdf_worker_min_buttonwidgetannotation": "ButtonWidgetAnnotation" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .create(), .constructor(), .fallbackFontDict(), ._getDefaultCheckedAppearance(), .getFieldObject()]
- "public_pdf_worker_min_catalog_parsedestdictionary": ".parseDestDictionary()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[._processPushButton(), Catalog, .openAction(), createValidAbsoluteUrl(), fetchRemoteDest(), FileSpec]
- "public_pdf_worker_min_ccittfaxdecoder": "CCITTFaxDecoder" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, ._addPixels(), ._addPixelsNeg(), .constructor(), ._eatBits(), ._findTableCode()]
- "public_pdf_worker_min_dict_getkeys": ".getKeys()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[._processCheckBox(), ._processRadioButton(), .viewerPreferences(), collectActions(), Dict, .clone()]
- "public_pdf_worker_min_font_convert": ".convert()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Font, adjustMapping(), createCmapTable(), createNameTable(), createOS2Table(), createPostTable()]
- "public_pdf_worker_min_incrementalupdate": "incrementalUpdate()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, computeIDs(), Dict, getIndexes(), getSizeInBytes(), Stream]
- "public_pdf_worker_min_jpegstream": "JpegStream" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .printNewAnnotations(), .bytes(), .canAsyncDecodeImageFromBuffer(), .canUseImageDecoder(), .constructor()]
- "public_pdf_worker_min_numbertostring": "numberToString()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, ._getDefaultCheckedAppearance(), .createAppearance(), .createNewAppearanceStream(), getPdfColor(), .createNewAppearanceStream()]
- "public_pdf_worker_min_simpledomnode": "SimpleDOMNode" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .children(), .constructor(), .dump(), .firstChild(), .hasChildNodes()]
- "public_pdf_worker_min_simplesegmentvisitor": "SimpleSegmentVisitor" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .parseChunks(), .drawBitmap(), .onImmediateGenericRegion(), .onImmediateHalftoneRegion(), .onImmediateLosslessGenericRegion()]
- "public_pdf_worker_min_simplesegmentvisitor_onimmediatetextregion": ".onImmediateTextRegion()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[SimpleSegmentVisitor, .onImmediateLosslessTextRegion(), decodeTextRegion(), DecodingContext, getCustomHuffmanTable(), getStandardTable()]
- "public_pdf_worker_min_sn": "sn" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, ._bindItems(), ._setProperties(), .[nn](), .[nn](), .[nn]()]
- "public_pdf_worker_min_type1parser": "Type1Parser" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .constructor(), .extractFontHeader(), .extractFontProgram(), .getToken()]
- "public_pdf_worker_min_widgetannotation_save": ".save()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[WidgetAnnotation, ._buildFlags(), Dict, .getKeys(), getModificationDate(), isArrayEqual()]
- "public_pdf_worker_min_xref_readxref": ".readXRef()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XRef, .indexObjects(), .parse(), FormatError, info(), isCmd()]
- "public_pdf_worker_min_yr": "yr" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .[nn](), checkDimensions(), computeBbox(), .[nn](), .[Lr]()]
- "reports_reportutils_date_keys": "DATE_KEYS" | kind=code-symbol | source=src/lib/reports/reportUtils.ts:L25 | neighbors=[route.tsx, route.tsx, route.tsx, route.tsx, route.tsx, route.tsx]
- "reports_reportutils_fmtdatetime": "fmtDateTime()" | kind=code-symbol | source=src/lib/reports/reportUtils.ts:L7 | neighbors=[route.tsx, route.tsx, route.tsx, route.tsx, route.tsx, route.tsx]
- "send_code_route": "route.ts" | kind=code-symbol | source=src/app/api/auth/send-code/route.ts:L1 | neighbors=[080dacf feat(auth): SUPERADMIN level re…, 0bfb1d7 fix(auth): use first email only…, 7350a1a feat(auth): implement 2-step lo…, 977afcf fix(auth): add SMTP timeouts an…, authCodes.ts, storeCode()]
- "ui_downloadbtn": "DownloadBtn.tsx" | kind=code-symbol | source=src/components/ui/DownloadBtn.tsx:L1 | neighbors=[d3f37c5 feat(flexy2qb): add CSV + Excel…, CustomerPaymentsTab.tsx, Purchases2QBTab.tsx, PurchasesCreditsTab.tsx, PurchasesOChargesTab.tsx, Sales2QBTab.tsx]
- "users_route": "route.ts" | kind=code-symbol | source=src/app/api/system/users/route.ts:L1 | neighbors=[080dacf feat(auth): SUPERADMIN level re…, 3322075 fix(users): close unico mismatc…, 8e92481 feat(system-access): convert to…, ce6710b feat(audit+ux): serverAuditLog …, db.ts, executeProcedure()]
- "wh_instructions_route": "route.tsx" | kind=code-symbol | source=src/app/api/inventory-entry/reports/wh-instructions/route.tsx:L1 | neighbors=[db.ts, executeProcedure(), companyInfo.ts, getCompanyInfo(), ReportPDF.tsx, ReportColumn]
- "awb_cporder_route": "route.tsx" | kind=code-symbol | source=src/app/api/inventory-entry/reports/awb-cporder/route.tsx:L1 | neighbors=[COLUMNS, fmtDate(), fmtI(), GET(), t(), db.ts]
- "batch_scan_route": "route.ts" | kind=code-symbol | source=src/app/api/scan-in/batch-scan/route.ts:L1 | neighbors=[POST(), db.ts, executeProcedure(), serverAudit.ts, serverAuditLog(), route.ts]
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@15b09b1ac81b25ba684f10f63aaa5d416b5297b6": "15b09b1 feat(items): PanelGrid for Tab1 grids, orange codes, badges, serverAudi…" | kind=Commit | source=git | neighbors=[master, worktree-agent-a59e3078904cba68a, route.ts, route.ts, route.ts, eb1606a feat(masters/items): serverAudi…]
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@3ab71d638d4c39b02e1f4e6247def032f2b358ce": "3ab71d6 feat(scan-out): add full Scan Out screen with dual-label scan loop" | kind=Commit | source=git | neighbors=[master, worktree-agent-a59e3078904cba68a, d645c42 fix(permissions): assign correc…, route.ts, permissions.ts, page.tsx]
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@d3f37c5f604dd979774ac4bce6a871b98c583dfc": "d3f37c5 feat(flexy2qb): add CSV + Excel download to all tab sub-grids" | kind=Commit | source=git | neighbors=[master, c12c454 fix(csv): dedupe duplicate lowe…, csv.ts, CustomerPaymentsTab.tsx, Purchases2QBTab.tsx, PurchasesCreditsTab.tsx]
- "components_corpinvoicemodal": "CorpInvoiceModal.tsx" | kind=code-symbol | source=src/app/sales/customer-payments/components/CorpInvoiceModal.tsx:L1 | neighbors=[CorpInvoiceModal(), Shared.tsx, Btn(), cpFetch(), EMPTY_ARR, fmt()]
- "components_crdbmodal": "CrDbModal.tsx" | kind=code-symbol | source=src/app/sales/customer-payments/components/CrDbModal.tsx:L1 | neighbors=[CrDbModal(), Shared.tsx, Btn(), cpFetch(), EMPTY_ARR, fmt()]
- "components_salesmanselectormodal": "SalesmanSelectorModal.tsx" | kind=code-symbol | source=src/app/sales/customer-payments/components/SalesmanSelectorModal.tsx:L1 | neighbors=[SalesmanSelectorModal(), Shared.tsx, Btn(), cpFetch(), EMPTY_ARR, fmt()]
- "confirm_route": "route.ts" | kind=code-symbol | source=src/app/api/scan-out/confirm/route.ts:L1 | neighbors=[3ab71d6 feat(scan-out): add full Scan O…, 7772f1b feat(scan-in): add AWB Receptio…, a54e0fd fix(scan-in): correct SP error/…, d645c42 fix(permissions): assign correc…, f4ad8b5 fix(scan-in): correct all SP pa…, POST()]
- "create_route": "route.ts" | kind=code-symbol | source=src/app/api/pos/invoice/create/route.ts:L1 | neighbors=[4a1017f fix(customers): replace direct …, bit(), int(), num(), POST(), txt()]
- "cut_off_route": "route.tsx" | kind=code-symbol | source=src/app/api/inventory-entry/reports/cut-off/route.tsx:L1 | neighbors=[COLUMNS, fmt(), fmtI(), GET(), t(), db.ts]
- "inventory_entry_modalboxcomposition": "ModalBoxComposition.tsx" | kind=code-symbol | source=src/components/inventory-entry/ModalBoxComposition.tsx:L1 | neighbors=[bbc39ac feat(inventory-entry): migrate …, f982d3e fix(inventory-entry+qc): modal …, EMPTY_ROW, fmt2(), int(), ModalBoxComposition()]
- "layout_mobileactionbar_mobileactionbar": "MobileActionBar()" | kind=code-symbol | source=src/components/layout/MobileActionBar.tsx:L29 | neighbors=[page.tsx, page.tsx, MobileActionBar.tsx, page.tsx, page.tsx, CustomerPaymentsTab.tsx]
- "no_scanned_route": "route.tsx" | kind=code-symbol | source=src/app/api/inventory-entry/reports/no-scanned/route.tsx:L1 | neighbors=[db.ts, executeProcedure(), COLUMNS, fmtDate(), fmtI(), GET()]
- "no_scanned_summary_route": "route.tsx" | kind=code-symbol | source=src/app/api/inventory-entry/reports/no-scanned-summary/route.tsx:L1 | neighbors=[db.ts, executeProcedure(), COLUMNS, fmtDate(), fmtI(), GET()]
- "pack_uq_route": "route.ts" | kind=code-symbol | source=src/app/api/inventory-entry/packings/[pack_uq]/route.ts:L1 | neighbors=[3b0d9e6 feat(inventory-entry): add serv…, db.ts, executeProcedure(), serverAudit.ts, serverAuditLog(), bit()]
- "packing_invoices_route": "route.tsx" | kind=code-symbol | source=src/app/api/inventory-entry/reports/packing-invoices/route.tsx:L1 | neighbors=[db.ts, executeProcedure(), COLUMNS, fmtDate(), fmtI(), GET()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-006.json

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
