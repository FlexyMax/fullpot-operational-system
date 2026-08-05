# Node Description Batch 10 of 139

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

- "commit:repo:github.com/FlexyMax/fullpot-operational-system@6e51a97816cddd4f1869e1f7116c8f5c7b66a13c": "6e51a97 fix(flexy2qb): show real SP error message in all 6 tabs" | kind=Commit | source=git | neighbors=[5d9ddbd feat(payment-authorizations): e…, worktree-agent-a59e3078904cba68a, 90f7847 fix(flexy2qb): Invoice Not Read…, CustomerPaymentsTab.tsx, Purchases2QBTab.tsx, PurchasesCreditsTab.tsx] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@7350a1a3e9129cfa3f5df017666d1adf7cce0a4d": "7350a1a feat(auth): implement 2-step login with email verification (Mandrill)" | kind=Commit | source=git | neighbors=[master, worktree-agent-a59e3078904cba68a, d7aa6e3 fix(auth): enforce user permiss…, authCodes.ts, mailer.ts, page.tsx] | lang=pt
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@7d048eda82f9dbbf174f42bfda968b3f088c4287": "7d048ed fix(payment-authorizations): 7 UI/report fixes from live review" | kind=Commit | source=git | neighbors=[worktree-agent-a59e3078904cba68a, 6b863f3 fix(payment-authorizations): hi…, route.ts, page.tsx, route.tsx, route.tsx] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@96d9f4655d116c57396f5148637dfc4c80928b32": "96d9f46 refactor(flexy2qb): move Log/Refresh/Download to grid header icons" | kind=Commit | source=git | neighbors=[3c0001a feat(flexy2qb): add CSV downloa…, worktree-agent-a59e3078904cba68a, ba2e1f0 feat(flexy2qb): mobile date pic…, CustomerPaymentsTab.tsx, Purchases2QBTab.tsx, PurchasesCreditsTab.tsx] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@cd58626dc046d1383306468cebcc5be4f69d9222": "cd58626 feat(vendors): serverAuditLog on all CRUD routes + UI standard complian…" | kind=Commit | source=git | neighbors=[78efbaf style(customers): move Statemen…, master, worktree-agent-a59e3078904cba68a, route.ts, f1ce20c feat(vendors): Web Settings mod…, route.ts] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@d468a28785024708c1ba1a506deefa0fa1a1b140": "d468a28 feat(carriers+payment-auth): infinite scroll, SP routes, PanelGrid moda…" | kind=Commit | source=git | neighbors=[5cdc4a2 fix(vendors): Web Settings moda…, master, worktree-agent-a59e3078904cba68a, page.tsx, route.ts, ed2d277 fix(carriers): mobile grid over…] | lang=pt
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@d7aa6e3275d139bb70c1a30dcebe1ff1a465f936": "d7aa6e3 fix(auth): enforce user permissions in menu and clear cache on user swi…" | kind=Commit | source=git | neighbors=[7350a1a feat(auth): implement 2-step lo…, master, worktree-agent-a59e3078904cba68a, 8b0d476 fix(auth): lazy Nodemailer tran…, AppHeader.tsx, permissions.ts] | lang=en
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@dc1c19d052cec8016751af7c1422a180249dcdef": "dc1c19d feat(payment-auth): PDF reports, orange codes, ReportModal standard" | kind=Commit | source=git | neighbors=[50212fd style(flexy2qb): taller sub-tab…, worktree-agent-a59e3078904cba68a, 7d048ed fix(payment-authorizations): 7 …, route.ts, page.tsx, route.tsx] | lang=en
- "copy_route": "route.ts" | kind=code-symbol | source=src/app/api/system/access/copy/route.ts:L1 | neighbors=[3b0d9e6 feat(inventory-entry): add serv…, 4cb57ca feat(freights): eliminate direc…, d4bfb3c feat(audit+ui): serverAuditLog …, P, POST(), txt()] | lang=en
- "flexy2qb_useflexy2qbstore": "useFlexy2QBStore.ts" | kind=code-symbol | source=src/store/flexy2qb/useFlexy2QBStore.ts:L1 | neighbors=[page.tsx, Flexy2QBState, useFlexy2QBStore, CustomerPaymentsTab.tsx, Purchases2QBTab.tsx, PurchasesCreditsTab.tsx] | lang=en
- "header_route": "route.ts" | kind=code-symbol | source=src/app/api/standing-orders/header/route.ts:L1 | neighbors=[5c9b4e0 feat(standing-orders): register…, 821d7d5 feat(standing-orders): audit lo…, GET(), POST(), db.ts, executeProcedure()] | lang=en
- "inventory_entry_modalawbsetup": "ModalAWBSetup.tsx" | kind=code-symbol | source=src/components/inventory-entry/ModalAWBSetup.tsx:L1 | neighbors=[6285dc8 fix(qc+inventory-entry): Scan O…, bbc39ac feat(inventory-entry): migrate …, EMPTY_FORM, fmtDate(), ModalAWBSetup(), Props] | lang=en
- "inventory_entry_modalboxpo": "ModalBoxPO.tsx" | kind=code-symbol | source=src/components/inventory-entry/ModalBoxPO.tsx:L1 | neighbors=[bbc39ac feat(inventory-entry): migrate …, fmt2(), ModalBoxPO(), norm(), Props, t()] | lang=en
- "inventory_entry_modalwhousetotals": "ModalWhouseTotals.tsx" | kind=code-symbol | source=src/components/inventory-entry/ModalWhouseTotals.tsx:L1 | neighbors=[6285dc8 fix(qc+inventory-entry): Scan O…, bbc39ac feat(inventory-entry): migrate …, ModalWhouseTotals(), Props, t(), today()] | lang=en
- "lib_csv": "csv.ts" | kind=code-symbol | source=src/lib/csv.ts:L1 | neighbors=[3c0001a feat(flexy2qb): add CSV downloa…, c12c454 fix(csv): dedupe duplicate lowe…, d3f37c5 feat(flexy2qb): add CSV + Excel…, e8d0d5e feat: proper xlsx export with S…, coerce(), dedupeHeaders()] | lang=en
- "lib_mailer": "mailer.ts" | kind=code-symbol | source=src/lib/mailer.ts:L1 | neighbors=[7350a1a feat(auth): implement 2-step lo…, 8b0d476 fix(auth): lazy Nodemailer tran…, 977afcf fix(auth): add SMTP timeouts an…, cfe2d43 feat(ar): send statement as PDF…, fcafe0d feat(ar): wire statement email …, createTransporter()] | lang=en
- "messages_route": "route.ts" | kind=code-symbol | source=src/app/api/masters/customers/[unico]/messages/route.ts:L1 | neighbors=[4a1017f fix(customers): replace direct …, db.ts, executeProcedure(), serverAudit.ts, serverAuditLog(), DELETE()] | lang=en
- "packings_route": "route.ts" | kind=code-symbol | source=src/app/api/inventory-entry/packings/route.ts:L1 | neighbors=[3b0d9e6 feat(inventory-entry): add serv…, db.ts, executeProcedure(), serverAudit.ts, serverAuditLog(), bit()] | lang=en
- "public_pdf_worker_min_annotation_getoperatorlist": ".getOperatorList()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Annotation, Dict, .getArray(), getTransformMatrix(), lookupMatrix(), lookupRect()] | lang=en
- "public_pdf_worker_min_annotation_setborderstyle": ".setBorderStyle()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Annotation, .constructor(), AnnotationBorderStyle, .setDashArray(), .setHorizontalCornerRadius(), .setStyle()] | lang=en
- "public_pdf_worker_min_basepdfmanager_ensurecatalog": ".ensureCatalog()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.createGlobals(), ._getPageIndex(), BasePdfManager, .extractTextContent(), .getStructTree(), .checkLastPage()] | lang=en
- "public_pdf_worker_min_basestream_peekbytes": ".peekBytes()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[BaseStream, find(), .checkAndRepair(), getFontFileType(), isTrueTypeCollectionFile(), .#D()] | lang=en
- "public_pdf_worker_min_binarycmapstream": "BinaryCMapStream" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .process(), .constructor(), .readByte(), .readHex(), .readHexNumber()] | lang=en
- "public_pdf_worker_min_binder_bindvalue": "._bindValue()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Binder, ._bindOccurrences(), ._bindElement(), ._isConsumeData(), ._isMatchTemplate(), createText()] | lang=en
- "public_pdf_worker_min_builder": "Builder" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, ._addNamespacePrefix(), .build(), .buildRoot(), .clean(), .constructor()] | lang=en
- "public_pdf_worker_min_checkbutton_nn": ".[nn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CheckButton, ariaLabel(), .success(), isRequired(), measureToString(), nn] | lang=en
- "public_pdf_worker_min_collectactions": "collectActions()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .jsActions(), _collectJS(), .getKeys(), getInheritableProperty()] | lang=en
- "public_pdf_worker_min_createbuiltincmap": "createBuiltInCMap()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .create(), BinaryCMapReader, .process(), CMap, IdentityCMap] | lang=en
- "public_pdf_worker_min_decodestream": "DecodeStream" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .ensureBuffer(), .getBaseStreams(), .getByte(), .getBytes()] | lang=en
- "public_pdf_worker_min_expressionbuildervisitor": "ExpressionBuilderVisitor" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .toString(), .visitArgument(), .visitBinaryOperation(), .visitLiteral()] | lang=en
- "public_pdf_worker_min_font_fallbacktosystemfont": ".fallbackToSystemFont()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Font, .constructor(), Aa, amendFallbackToUnicode(), applyStandardFontGlyphMap(), buildToFontChar()] | lang=en
- "public_pdf_worker_min_getinheritableproperty": "getInheritableProperty()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .setDefaultAppearance(), .create(), .constructor(), collectActions(), .getArray()] | lang=en
- "public_pdf_worker_min_getpdfcolor": "getPdfColor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .createAppearance(), .createNewAppearanceStream(), .createNewDict(), numberToString(), .createNewAppearanceStream()] | lang=en
- "public_pdf_worker_min_identitytounicodemap": "IdentityToUnicodeMap" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .amend(), .charCodeOf(), .constructor(), .forEach(), .get()] | lang=en
- "public_pdf_worker_min_jpegimage_getdata": ".getData()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[JpegImage, JpegError, ._convertCmykToRgb(), ._convertCmykToRgba(), ._convertYcckToCmyk(), ._convertYcckToRgb()] | lang=en
- "public_pdf_worker_min_jpegimage_parse": ".parse()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[JpegImage, buildComponentData(), buildHuffmanTable(), decodeScan(), findNextFileMarker(), JpegError] | lang=en
- "public_pdf_worker_min_lookupmatrix": "lookupMatrix()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .extractTextContent(), .getOperatorList(), .getOperatorList(), getTilingPatternIR(), isNumberArray()] | lang=en
- "public_pdf_worker_min_nameornumbertree_getall": ".getAll()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.attachments(), ._collectJavaScript(), .destinations(), ._readPageLabels(), .xfaImages(), NameOrNumberTree] | lang=en
- "public_pdf_worker_min_page_getoperatorlist": ".getOperatorList()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Page, .mustBePrinted(), .generateImages(), .ensureDoc(), getNewAnnotationsMap(), .addOpList()] | lang=en
- "public_pdf_worker_min_partialevaluator_extractdatastructures": ".extractDataStructures()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PartialEvaluator, FormatError, getEncoding(), .buildToUnicode(), .readCidToGidMap(), .readToUnicode()] | lang=en

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-009.json

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
