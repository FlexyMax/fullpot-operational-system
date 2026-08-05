# Node Description Batch 8 of 139

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

- "pick_list_route": "route.tsx" | kind=code-symbol | source=src/app/api/pbook2invoice/reports/pick-list/route.tsx:L1 | neighbors=[db.ts, executeProcedure(), COLUMNS, fmtDate(), fmtI(), GET()]
- "public_pdf_worker_min_ccittfaxdecoder_readnextchar": ".readNextChar()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CCITTFaxDecoder, ._addPixels(), ._addPixelsNeg(), ._eatBits(), ._getBlackCode(), ._getTwoDimCode()]
- "public_pdf_worker_min_cffindex": "CFFIndex" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .compileCharStrings(), .compileNameIndex(), .compileStringIndex(), .compileTopDicts(), .add()]
- "public_pdf_worker_min_exclgroup": "ExclGroup" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[Cr](), .[Fr](), .[Gr](), .[Hr]()]
- "public_pdf_worker_min_fakeunicodefont": "FakeUnicodeFont" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .baseFontRef(), .constructor(), .createAppearance(), ._createContext(), .createFontResources()]
- "public_pdf_worker_min_getrelevant": "getRelevant()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .constructor(), .constructor(), .constructor(), .constructor()]
- "public_pdf_worker_min_globalimagecache": "GlobalImageCache" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .addByteSize(), .addDecodeFailed(), .clear(), .constructor()]
- "public_pdf_worker_min_imageresizer": "ImageResizer" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, ._areGoodDims(), .canUseImageDecoder(), .constructor(), .createImage(), ._encodeBMP()]
- "public_pdf_worker_min_isnumberarray": "isNumberArray()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, ._readDocumentOutline(), .add(), getQuadPoints(), lookupMatrix(), lookupNormalRect()]
- "public_pdf_worker_min_markupannotation_setdefaultappearance": "._setDefaultAppearance()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.constructor(), .constructor(), .constructor(), .constructor(), MarkupAnnotation, Dict]
- "public_pdf_worker_min_operatorlist_addop": ".addOp()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.getOperatorList(), OperatorList, .addDependency(), .addImageOps(), .addOpList(), .buildFormXObject()]
- "public_pdf_worker_min_parser_finddefaultinlinestreamend": ".findDefaultInlineStreamEnd()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Parser, .findASCII85DecodeInlineStreamEnd(), .findASCIIHexDecodeInlineStreamEnd(), .findDCTDecodeInlineStreamEnd(), .peekByte(), .peekBytes()]
- "public_pdf_worker_min_parser_makeinlineimage": ".makeInlineImage()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Parser, .getObj(), .createStream(), Dict, FormatError, isCmd()]
- "public_pdf_worker_min_partialevaluator_handlecolorn": ".handleColorN()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PartialEvaluator, .getOperatorList(), .getByRef(), .getRgb(), .getArray(), FormatError]
- "public_pdf_worker_min_pdfimage_createimagedata": ".createImageData()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.buildPaintImageXObject(), PDFImage, .createBitmap(), assert(), .needsToBeResized(), .decodeBuffer()]
- "public_pdf_worker_min_subform": "Subform" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[Cr](), .[Gr](), .[Hr](), .[Lr]()]
- "public_pdf_worker_min_word64": "Word64" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .add(), .and(), .assign(), .constructor(), .copyTo()]
- "public_pdf_worker_min_xfaparser": "XFAParser" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .getRichTextAsHtml(), .constructor(), ._getNameAndPrefix(), ._mkAttributes()]
- "reports_paymentauthpdf": "PaymentAuthPDF.tsx" | kind=code-symbol | source=src/components/reports/PaymentAuthPDF.tsx:L1 | neighbors=[72a649b fix(ap): remove 'use client' fr…, d8a9f3c feat(ap): add proper Payment Au…, route.tsx, companyInfo.ts, CompanyInfo, c()]
- "reports_reportutils_amount_keys": "AMOUNT_KEYS" | kind=code-symbol | source=src/lib/reports/reportUtils.ts:L11 | neighbors=[route.tsx, route.tsx, route.tsx, route.tsx, route.tsx, route.tsx]
- "reports_reportutils_buildcolumns": "buildColumns()" | kind=code-symbol | source=src/lib/reports/reportUtils.ts:L69 | neighbors=[route.tsx, route.tsx, route.tsx, route.tsx, route.tsx, route.tsx]
- "reports_reportutils_buildsubtitle": "buildSubtitle()" | kind=code-symbol | source=src/lib/reports/reportUtils.ts:L120 | neighbors=[route.tsx, route.tsx, route.tsx, route.tsx, route.tsx, route.ts]
- "reports_statementpdf": "StatementPDF.tsx" | kind=code-symbol | source=src/components/reports/StatementPDF.tsx:L1 | neighbors=[4d6d80d feat(ar): white header + aging/…, cfe2d43 feat(ar): send statement as PDF…, eeffe24 feat(ar): logo + fix balance to…, companyInfo.ts, CompanyInfo, c()]
- "standing_orders_setweeksmodal": "SetWeeksModal.tsx" | kind=code-symbol | source=src/app/standing-orders/SetWeeksModal.tsx:L1 | neighbors=[8042468 perf(standing-orders): dirty tr…, b4899cc style(standing-orders): standar…, OrderDetailModal.tsx, utils.ts, cn(), EVEN_WEEKS]
- "tabs_dashboardtab": "DashboardTab.tsx" | kind=code-symbol | source=src/app/qc/components/tabs/DashboardTab.tsx:L1 | neighbors=[d78faa6 fix(flexy2qb): dashboard defaul…, page.tsx, utils.ts, cn(), CLASSES, CUSTOMER_TYPES]
- "uq_route": "route.ts" | kind=code-symbol | source=src/app/api/pos/stock/uq/route.ts:L1 | neighbors=[113d989 fix(payment-auth): fix date upd…, 5d9ddbd feat(payment-authorizations): e…, ce6710b feat(audit+ux): serverAuditLog …, db.ts, executeProcedure(), serverAudit.ts]
- "vendors_route": "route.ts" | kind=code-symbol | source=src/app/api/vendors/route.ts:L1 | neighbors=[cd58626 feat(vendors): serverAuditLog o…, db.ts, executeProcedure(), serverAudit.ts, serverAuditLog(), bit()]
- "boxes_route": "route.ts" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/route.ts:L1 | neighbors=[bit(), GET(), int(), num(), POST(), str()]
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@3c0001a67d0e73a3cd40a297e06f78a1ea2ea379": "3c0001a feat(flexy2qb): add CSV download to all 7 Ready to QB sub-tabs" | kind=Commit | source=git | neighbors=[worktree-agent-a59e3078904cba68a, 96d9f46 refactor(flexy2qb): move Log/Re…, csv.ts, CustomerPaymentsTab.tsx, Purchases2QBTab.tsx, PurchasesCreditsTab.tsx]
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@4a1017f13dd9b1e06b80fab2092736a92eb083af": "4a1017f fix(customers): replace direct SQL with SPs + serverAuditLog + Sonner t…" | kind=Commit | source=git | neighbors=[4907715 feat(sales-reps): group custome…, master, worktree-agent-a59e3078904cba68a, route.ts, 5405f55 style(customers): enforce Panel…, route.ts]
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@5c9b4e04bf29c502888670b17b1edc970d017652": "5c9b4e0 feat(standing-orders): register SCREEN_PANTA (XD6Z7064)" | kind=Commit | source=git | neighbors=[master, worktree-agent-a59e3078904cba68a, route.ts, route.ts, 4c79670 feat(standing-orders): Zustand …, route.ts]
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@ba2e1f03dea898375209ed71566ca2f188b823e7": "ba2e1f0 feat(flexy2qb): mobile date picker + by-date actions for OCharges & Cre…" | kind=Commit | source=git | neighbors=[96d9f46 refactor(flexy2qb): move Log/Re…, route.ts, worktree-agent-a59e3078904cba68a, 6e70d68 fix(flexy2qb): remove extra dat…, CustomerPaymentsTab.tsx, Purchases2QBTab.tsx]
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@bbc39ac5dc29374f0ae8990c30119f29774b7312": "bbc39ac feat(inventory-entry): migrate all modal grids to PanelGrid standard" | kind=Commit | source=git | neighbors=[3b0d9e6 feat(inventory-entry): add serv…, worktree-agent-a59e3078904cba68a, f982d3e fix(inventory-entry+qc): modal …, ModalAddPOToInventory.tsx, ModalAWBSetup.tsx, ModalBoxComposition.tsx]
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@d4bfb3c73198af1466b6c42b45a114271462dd0b": "d4bfb3c feat(audit+ui): serverAuditLog on access routes & flexy2qb; PanelGrid i…" | kind=Commit | source=git | neighbors=[ce6710b feat(audit+ux): serverAuditLog …, route.ts, master, worktree-agent-a59e3078904cba68a, route.ts, 8a33467 fix(qc): wrap nullish-coalescin…]
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@e62e50be32c2e98beccd03ba84f78f865b9c70ab": "e62e50b feat(flexy2qb): add LogRecordModal and View Log to all tab grids" | kind=Commit | source=git | neighbors=[3d34448 feat(flexy2qb): comprehensive t…, worktree-agent-a59e3078904cba68a, 3ed1d77 fix(flexy2qb): correctly pass r…, LogRecordModal.tsx, CustomerPaymentsTab.tsx, Purchases2QBTab.tsx]
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@f61ab73d4f97cb67dcc2105a6191d2ef72ed6fce": "f61ab73 feat(flexy2qb): replace mobile date input with full-month MobileDateCal…" | kind=Commit | source=git | neighbors=[6e70d68 fix(flexy2qb): remove extra dat…, worktree-agent-a59e3078904cba68a, dc61ccb feat(flexy2qb): wire new NC SPs…, CustomerPaymentsTab.tsx, Purchases2QBTab.tsx, PurchasesCreditsTab.tsx]
- "components_applypaymentmodal": "ApplyPaymentModal.tsx" | kind=code-symbol | source=src/app/sales/customer-payments/components/ApplyPaymentModal.tsx:L1 | neighbors=[ApplyPaymentModal(), Shared.tsx, Btn(), cpFetch(), fmt(), fmtDate()]
- "components_approvecreditmodal": "ApproveCreditModal.tsx" | kind=code-symbol | source=src/app/sales/customer-payments/components/ApproveCreditModal.tsx:L1 | neighbors=[ApproveCreditModal(), Shared.tsx, Btn(), cpFetch(), fmt(), fmtDate()]
- "components_cashbackmodal": "CashBackModal.tsx" | kind=code-symbol | source=src/app/sales/customer-payments/components/CashBackModal.tsx:L1 | neighbors=[CashBackModal(), Shared.tsx, Btn(), cpFetch(), fmt(), fmtDate()]
- "components_corppaymentmodal": "CorpPaymentModal.tsx" | kind=code-symbol | source=src/app/sales/customer-payments/components/CorpPaymentModal.tsx:L1 | neighbors=[CorpPaymentModal(), Shared.tsx, Btn(), cpFetch(), fmt(), fmtDate()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-007.json

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
