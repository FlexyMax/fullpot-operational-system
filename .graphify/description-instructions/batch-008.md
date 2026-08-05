# Node Description Batch 9 of 139

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

- "components_crdbreportmodal": "CrDbReportModal.tsx" | kind=code-symbol | source=src/app/sales/customer-payments/components/CrDbReportModal.tsx:L1 | neighbors=[CrDbReportModal(), Shared.tsx, Btn(), cpFetch(), fmt(), fmtDate()]
- "components_customereditmodal": "CustomerEditModal.tsx" | kind=code-symbol | source=src/app/sales/customer-payments/components/CustomerEditModal.tsx:L1 | neighbors=[CustomerEditModal(), Shared.tsx, Btn(), cpFetch(), fmt(), fmtDate()]
- "components_invoicesearchmodal": "InvoiceSearchModal.tsx" | kind=code-symbol | source=src/app/sales/customer-payments/components/InvoiceSearchModal.tsx:L1 | neighbors=[InvoiceSearchModal(), Shared.tsx, Btn(), cpFetch(), fmt(), fmtDate()]
- "components_pendinginvoicesreportmodal": "PendingInvoicesReportModal.tsx" | kind=code-symbol | source=src/app/sales/customer-payments/components/PendingInvoicesReportModal.tsx:L1 | neighbors=[PendingInvoicesReportModal(), Shared.tsx, Btn(), cpFetch(), fmt(), fmtDate()]
- "components_userupsertmodal": "UserUpsertModal.tsx" | kind=code-symbol | source=src/app/system/users/components/UserUpsertModal.tsx:L1 | neighbors=[080dacf feat(auth): SUPERADMIN level re…, 8bad964 fix(users): email field spans 2…, EMPTY_FORM, generateUsername(), LEVELS, UserUpsertModal()]
- "composition_route": "route.ts" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/composition/route.ts:L1 | neighbors=[3b0d9e6 feat(inventory-entry): add serv…, GET(), int(), num(), P, POST()]
- "composition_uq_route": "route.ts" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/composition/[composition_uq]/route.ts:L1 | neighbors=[3b0d9e6 feat(inventory-entry): add serv…, DELETE(), int(), num(), P, PUT()]
- "log_route": "route.ts" | kind=code-symbol | source=src/app/api/system/users/[unico]/log/route.ts:L1 | neighbors=[6eb5e58 fix(system-users): cast records…, dates.ts, todayEST(), db.ts, executeProcedure(), executeQuery()]
- "pbook2invoice_modalupdateline": "ModalUpdateLine.tsx" | kind=code-symbol | source=src/components/pbook2invoice/ModalUpdateLine.tsx:L1 | neighbors=[Field(), FIELD_KEYS, FieldProps, int(), ModalUpdateLine(), num()]
- "public_pdf_worker_min_basestream_skip": ".skip()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[BaseStream, .checkAndRepair(), .parseImageProperties(), .findASCII85DecodeInlineStreamEnd(), .findASCIIHexDecodeInlineStreamEnd(), .findDCTDecodeInlineStreamEnd()]
- "public_pdf_worker_min_catalog_readdocumentoutline": "._readDocumentOutline()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Catalog, .documentOutline(), .parseDestDictionary(), .getRgb(), .getArray(), isNumberArray()]
- "public_pdf_worker_min_colorspace_parse": ".parse()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ColorSpace, AlternateCS, CalGrayCS, CalRGBCS, .getArray(), IndexedCS]
- "public_pdf_worker_min_flatestream": "FlateStream" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .asyncGetBytes(), .constructor(), .generateHuffmanTable(), .getBits(), .getCode()]
- "public_pdf_worker_min_font_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Font, adjustWidths(), amendFallbackToUnicode(), CFFFont, .checkAndRepair(), .fallbackToSystemFont()]
- "public_pdf_worker_min_fr": "fr" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, ._bindElement(), ._bindValue(), .constructor(), .serialize(), .[nn]()]
- "public_pdf_worker_min_getpdfcolorarray": "getPdfColorArray()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .constructor(), .constructor(), .constructor(), .constructor()]
- "public_pdf_worker_min_iswhitespace": "isWhiteSpace()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .readBlock(), findBlock(), .getNumber(), .#D(), .findASCII85DecodeInlineStreamEnd()]
- "public_pdf_worker_min_labcs": "LabCS" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .parse(), .constructor(), .#f(), .getOutputLength(), .getRgbBuffer()]
- "public_pdf_worker_min_lookupnormalrect": "lookupNormalRect()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .setRectangle(), getTilingPatternIR(), isNumberArray(), .normalizeRect(), .constructor()]
- "public_pdf_worker_min_meshshading": "MeshShading" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, ._buildFigureFromPatch(), .constructor(), ._decodeType4Shading(), ._decodeType5Shading(), ._decodeType6Shading()]
- "public_pdf_worker_min_partialevaluator_buildformxobject": ".buildFormXObject()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PartialEvaluator, .getRgb(), .getArray(), isName(), lookupMatrix(), lookupNormalRect()]
- "public_pdf_worker_min_popupannotation_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PopupAnnotation, .setColor(), .setContents(), .setFlags(), .setModificationDate(), .setTitle()]
- "public_pdf_worker_min_postscriptcompiler_compile": ".compile()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PostScriptCompiler, AstArgument, AstLiteral, AstVariable, AstVariableDefinition, buildAddOperation()]
- "public_pdf_worker_min_reader": "Reader" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, decodeBitmap(), .byteAlign(), .constructor(), .next(), .readBit()]
- "public_pdf_worker_min_simplexmlparser": "SimpleXMLParser" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .constructor(), .constructor(), .onBeginElement(), .onCdata()]
- "public_pdf_worker_min_stringtobytes": "stringToBytes()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .compileNameIndex(), .compileStringIndex(), .decryptString(), .encryptString(), .constructor()]
- "public_pdf_worker_min_tounicodemap": "ToUnicodeMap" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .fallbackToSystemFont(), .buildToUnicode(), .readToUnicode(), .amend(), .charCodeOf()]
- "public_pdf_worker_min_type1font": "Type1Font" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .constructor(), .getCharset(), .getGlyphMapping(), .getSeacs()]
- "public_pdf_worker_min_type1font_wrap": ".wrap()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Type1Font, .constructor(), CFF, CFFCharset, CFFCompiler, .setByName()]
- "public_pdf_worker_min_widgetannotation_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[WidgetAnnotation, ._constructFieldName(), ._hasFlag(), .setDefaultAppearance(), collectActions(), .getValue()]
- "seasons_route": "route.ts" | kind=code-symbol | source=src/app/api/masters/items/lookups/seasons/route.ts:L1 | neighbors=[4cb57ca feat(freights): eliminate direc…, db.ts, executeProcedure(), serverAudit.ts, serverAuditLog(), bit()]
- "subclasses_route": "route.ts" | kind=code-symbol | source=src/app/api/masters/items/warehouses-bogo/[unico]/subclasses/route.ts:L1 | neighbors=[15b09b1 feat(items): PanelGrid for Tab1…, db.ts, executeProcedure(), serverAudit.ts, serverAuditLog(), bit()]
- "without_invoice_route": "route.tsx" | kind=code-symbol | source=src/app/api/pbook2invoice/reports/without-invoice/route.tsx:L1 | neighbors=[db.ts, executeProcedure(), companyInfo.ts, getCompanyInfo(), ReportPDF.tsx, ReportColumn]
- "awb_route": "route.ts" | kind=code-symbol | source=src/app/api/scan-in/awb/route.ts:L1 | neighbors=[GET(), db.ts, executeProcedure(), route.ts, authOptions, 624fb9b fix(scan-in): map all SP column…]
- "cities_route": "route.ts" | kind=code-symbol | source=src/app/api/sales-reps/cities/route.ts:L1 | neighbors=[DELETE(), genUq(), GET(), POST(), txt(), db.ts]
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@0b02d049fdf1f9f4771b4fad451be5b628874ebe": "0b02d04 fix(payment-auth): 4 issues — VFP modal filter, vendor header in PDF, p…" | kind=Commit | source=git | neighbors=[worktree-agent-a59e3078904cba68a, bd0afde fix(payment-auth): blank PDF (A…, page.tsx, route.ts, route.tsx, route.tsx]
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@3d344484412206f5c176e36697deb8883fcd1240": "3d34448 feat(flexy2qb): comprehensive tab fixes across all 7 modules" | kind=Commit | source=git | neighbors=[worktree-agent-a59e3078904cba68a, e62e50b feat(flexy2qb): add LogRecordMo…, CustomerPaymentsTab.tsx, Purchases2QBTab.tsx, PurchasesCreditsTab.tsx, PurchasesOChargesTab.tsx]
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@50212fdd5216278addf38a61e8f63f8db016fbc6": "50212fd style(flexy2qb): taller sub-tab bar on mobile (h-11 vs h-9) + bigger te…" | kind=Commit | source=git | neighbors=[worktree-agent-a59e3078904cba68a, dc1c19d feat(payment-auth): PDF reports…, CustomerPaymentsTab.tsx, Purchases2QBTab.tsx, PurchasesCreditsTab.tsx, PurchasesOChargesTab.tsx]
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@505c1d8933c4673649a6a06ce7a5846475ccf7e4": "505c1d8 feat(standing-orders): PDF print report via sp_flower_standing_order_re…" | kind=Commit | source=git | neighbors=[4c79670 feat(standing-orders): Zustand …, master, worktree-agent-a59e3078904cba68a, 597add0 feat(standing-orders): Change S…, route.tsx, BoxCompositionModal.tsx]
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@657dacfc81592093168084bdc0bffc0ecfb092a1": "657dacf fix(ap-reports): filter VFP metadata columns + fix datetime format + ad…" | kind=Commit | source=git | neighbors=[worktree-agent-a59e3078904cba68a, a61433b fix(ap-reports): normalize colu…, route.tsx, route.tsx, route.tsx, route.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-008.json

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
