# Node Description Batch 23 of 139

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

- "public_pdf_worker_min_tr": "tr" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, ._bindOccurrences(), .constructor(), ._createOccurrences(), .[Fn](), .[tr]()]
- "public_pdf_worker_min_type1fontglyphmapping": "type1FontGlyphMapping()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .getGlyphMapping(), .getGlyphMapping(), getEncoding(), recoverGlyphName(), xi]
- "public_pdf_worker_min_vs": "vs" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .#H(), .#L(), .#M(), computeIDs(), .fingerprints()]
- "public_pdf_worker_min_widgetannotation_decodeformvalue": "._decodeFormValue()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[._processCheckBox(), ._processRadioButton(), .constructor(), WidgetAnnotation, .constructor(), stringToPDFString()]
- "public_pdf_worker_min_widgetannotation_getfontdata": "._getFontData()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[._getAppearance(), .createNewAppearanceStream(), WidgetAnnotation, ._getAppearance(), OperatorList, .handleSetFont()]
- "public_pdf_worker_min_widgetannotation_getmkdict": "._getMKDict()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[._saveCheckbox(), ._saveRadioButton(), WidgetAnnotation, Dict, getPdfColorArray(), .save()]
- "public_pdf_worker_min_widgetannotation_getoperatorlist": ".getOperatorList()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[WidgetAnnotation, getTransformMatrix(), OperatorList, .addOp(), .parseMarkedContentProps(), StringStream]
- "public_pdf_worker_min_xfafactory_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XFAFactory, Binder, DataHandler, warn(), ._createDocument(), XFAParser]
- "public_pdf_worker_min_xref_fetchcompressed": ".fetchCompressed()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XRef, .fetch(), FormatError, Lexer, Parser, XRefEntryException]
- "public_pdf_worker_min_xrefparseexception": "XRefParseException" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .checkFirstPage(), .checkLastPage(), .parse(), .readXRef(), .constructor()]
- "public_pdf_worker_min_zr": "Zr" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .[nn](), .[nn](), .[nn](), .[nn](), .[nn]()]
- "ready_to_scan_route": "route.ts" | kind=code-symbol | source=src/app/api/physical-scan/ready-to-scan/route.ts:L1 | neighbors=[6ea09a8 fix(physical-scan): quickfixes …, db.ts, executeProcedure(), route.ts, authOptions, GET()]
- "reasons_route": "route.ts" | kind=code-symbol | source=src/app/api/scan-in/reasons/route.ts:L1 | neighbors=[7772f1b feat(scan-in): add AWB Receptio…, db.ts, executeProcedure(), route.ts, authOptions, GET()]
- "recipe_route": "route.ts" | kind=code-symbol | source=src/app/api/masters/items/products/recipe/route.ts:L1 | neighbors=[eb1606a feat(masters/items): serverAudi…, db.ts, executeProcedure(), serverAudit.ts, serverAuditLog(), POST()]
- "reports_paymentauthpdf_paymentauthpdf": "PaymentAuthPDF()" | kind=code-symbol | source=src/components/reports/PaymentAuthPDF.tsx:L61 | neighbors=[route.tsx, PaymentAuthPDF.tsx, c(), flex(), fmtD(), fmtN()]
- "reports_statementpdfv2_statementpdfv2": "StatementPDFv2()" | kind=code-symbol | source=src/components/reports/StatementPDFv2.tsx:L94 | neighbors=[StatementPDFv2.tsx, flx(), fmt(), fmtD(), route.ts, route.tsx]
- "scanned_boxes_route": "route.ts" | kind=code-symbol | source=src/app/api/physical-scan/scanned-boxes/route.ts:L1 | neighbors=[6ea09a8 fix(physical-scan): quickfixes …, db.ts, executeProcedure(), route.ts, authOptions, GET()]
- "search_route": "route.ts" | kind=code-symbol | source=src/app/api/sales-reps/search/route.ts:L1 | neighbors=[db.ts, executeProcedure(), route.ts, authOptions, GET(), POST()]
- "standing_orders_changecustomermodal": "ChangeCustomerModal.tsx" | kind=code-symbol | source=src/app/standing-orders/ChangeCustomerModal.tsx:L1 | neighbors=[utils.ts, cn(), ChangeCustomerModal(), Props, t(), OrderDetailModal.tsx]
- "standing_orders_changeseasonmodal": "ChangeSeasonModal.tsx" | kind=code-symbol | source=src/app/standing-orders/ChangeSeasonModal.tsx:L1 | neighbors=[597add0 feat(standing-orders): Change S…, ChangeSeasonModal(), fmtDate(), Props, t(), OrderDetailModal.tsx]
- "standing_orders_linemodal": "LineModal.tsx" | kind=code-symbol | source=src/app/standing-orders/LineModal.tsx:L1 | neighbors=[b4899cc style(standing-orders): standar…, LabelInput(), LineModal(), Props, t(), OrderDetailModal.tsx]
- "store_useapstore": "useAPStore.ts" | kind=code-symbol | source=src/store/useAPStore.ts:L1 | neighbors=[page.tsx, dates.ts, currentYearEST(), todayEST(), APState, useAPStore]
- "store_useawbstore": "useAwbStore.ts" | kind=code-symbol | source=src/store/useAwbStore.ts:L1 | neighbors=[page.tsx, 785797e feat(awbs): full page rewrite w…, AwbState, AwbTabId, todayStr(), useAwbStore]
- "store_usescanstore": "useScanStore.ts" | kind=code-symbol | source=src/store/useScanStore.ts:L1 | neighbors=[75b26c7 feat(physical-scan): add useSca…, c12e586 feat(physical-scan): add 2 miss…, page.tsx, ScanState, ScanTabId, useScanStore]
- "sys_not_physical_route": "route.ts" | kind=code-symbol | source=src/app/api/physical-scan/sys-not-physical/route.ts:L1 | neighbors=[6ea09a8 fix(physical-scan): quickfixes …, db.ts, executeProcedure(), route.ts, authOptions, GET()]
- "totals_route": "route.ts" | kind=code-symbol | source=src/app/api/physical-scan/totals/route.ts:L1 | neighbors=[6ea09a8 fix(physical-scan): quickfixes …, db.ts, executeProcedure(), route.ts, authOptions, GET()]
- "update_awb_route": "route.ts" | kind=code-symbol | source=src/app/api/freights/rates/[unico]/update-awb/route.ts:L1 | neighbors=[4cb57ca feat(freights): eliminate direc…, db.ts, executeProcedure(), serverAudit.ts, serverAuditLog(), PUT()]
- "varieties_for_recipes_route": "route.ts" | kind=code-symbol | source=src/app/api/masters/items/lookups/varieties-for-recipes/route.ts:L1 | neighbors=[3e16b69 revert(items): restore sp_flowe…, 63f5a43 fix(items): fix variety search …, a2a004f feat(items): Bunch Recipe + Box…, db.ts, executeProcedure(), GET()]
- "verify_route": "route.ts" | kind=code-symbol | source=src/app/api/scan-out/verify/route.ts:L1 | neighbors=[3ab71d6 feat(scan-out): add full Scan O…, db.ts, executeProcedure(), route.ts, authOptions, POST()]
- "weeks_route": "route.ts" | kind=code-symbol | source=src/app/api/standing-orders/weeks/route.ts:L1 | neighbors=[db.ts, executeProcedure(), route.ts, authOptions, GET(), PUT()]
- "add_route": "route.ts" | kind=code-symbol | source=src/app/api/sales/cart/add/route.ts:L1 | neighbors=[POST(), db.ts, executeProcedure(), route.ts, authOptions]
- "attach_invoice_route": "route.ts" | kind=code-symbol | source=src/app/api/pbook2invoice/attach-invoice/route.ts:L1 | neighbors=[POST(), db.ts, executeProcedure(), route.ts, authOptions]
- "awbs_page_t": "t()" | kind=code-symbol | source=src/app/awbs/page.tsx:L29 | neighbors=[page.tsx, AwbsBoxesModal(), AwbsPage(), fmtDate(), SupplierCombobox()]
- "awbs_page_today": "today()" | kind=code-symbol | source=src/app/awbs/page.tsx:L32 | neighbors=[page.tsx, AwbsChargesModal(), AwbsFreightsModal(), AwbsInvoiceChargesModal(), ChangeDateModal()]
- "banks_route": "route.ts" | kind=code-symbol | source=src/app/api/payment-authorizations/banks/route.ts:L1 | neighbors=[GET(), POST(), db.ts, executeProcedure(), 808d098 feat(ap): add Create Bank modal…]
- "barcode_route": "route.ts" | kind=code-symbol | source=src/app/api/pos/invoice/line/barcode/route.ts:L1 | neighbors=[POST(), db.ts, executeProcedure(), route.ts, authOptions]
- "box_recipe_route": "route.ts" | kind=code-symbol | source=src/app/api/masters/items/products/[unico]/box-recipe/route.ts:L1 | neighbors=[GET(), POST(), db.ts, executeProcedure(), a2a004f feat(items): Bunch Recipe + Box…]
- "change_po_route": "route.ts" | kind=code-symbol | source=src/app/api/pbook2invoice/change-po/route.ts:L1 | neighbors=[POST(), db.ts, executeProcedure(), route.ts, authOptions]
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@01eeb75d6582cf804f865dbb06abd7f5e3ef3130": "01eeb75 fix(users): remove invalid Event type on select onChange handler" | kind=Commit | source=git | neighbors=[master, worktree-agent-a59e3078904cba68a, 11c8872 fix(users): fix filter bar layo…, page.tsx, 83b28ae feat(users): add Ext-Action col…]
- "commit:repo:github.com/FlexyMax/fullpot-operational-system@085a82202fdfe6ce3b0194e67cdb41b910d2ff39": "085a822 fix(accounts-payable): mobile toolbar wrap, orange codes, SP-only CRDB …" | kind=Commit | source=git | neighbors=[page.tsx, worktree-agent-a59e3078904cba68a, 72f5229 docs(claude): add design docume…, route.tsx, f7acc6c fix(qc/mobile): 3 mobile UX imp…]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-022.json

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
