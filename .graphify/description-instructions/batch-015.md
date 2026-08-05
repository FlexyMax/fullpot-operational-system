# Node Description Batch 16 of 139

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

- "inventory_entry_modaladdproducttopacking": "ModalAddProductToPacking.tsx" | kind=code-symbol | source=src/components/inventory-entry/ModalAddProductToPacking.tsx:L1 | neighbors=[6285dc8 fix(qc+inventory-entry): Scan O…, int(), ModalAddProductToPacking(), num(), Props, t()]
- "inventory_entry_modalboxrepacking": "ModalBoxRepacking.tsx" | kind=code-symbol | source=src/components/inventory-entry/ModalBoxRepacking.tsx:L1 | neighbors=[6285dc8 fix(qc+inventory-entry): Scan O…, int(), ModalBoxRepacking(), num(), Props, t()]
- "inventory_entry_modalheader2": "ModalHeader2.tsx" | kind=code-symbol | source=src/components/inventory-entry/ModalHeader2.tsx:L1 | neighbors=[6285dc8 fix(qc+inventory-entry): Scan O…, EMPTY, ModalHeader2(), Props, t(), today()]
- "inventory_entry_modalscanhistory": "ModalScanHistory.tsx" | kind=code-symbol | source=src/components/inventory-entry/ModalScanHistory.tsx:L1 | neighbors=[6285dc8 fix(qc+inventory-entry): Scan O…, bbc39ac feat(inventory-entry): migrate …, ModalScanHistory(), Props, t(), PanelGrid.tsx]
- "inventory_entry_modalwarehousetransfer": "ModalWarehouseTransfer.tsx" | kind=code-symbol | source=src/components/inventory-entry/ModalWarehouseTransfer.tsx:L1 | neighbors=[6285dc8 fix(qc+inventory-entry): Scan O…, int(), ModalWarehouseTransfer(), Props, t(), today()]
- "invoice_uq_route": "route.ts" | kind=code-symbol | source=src/app/api/customer-payments/invoice-print/[invoice_uq]/route.ts:L1 | neighbors=[7841f8d fix(ar): invoice search navigat…, ba40c73 feat(ar): fix invoice print/ema…, bffba33 fix(ar): use correct InvoiceHTM…, GET(), P, db.ts]
- "invoices_route": "route.ts" | kind=code-symbol | source=src/app/api/scan-in/invoices/route.ts:L1 | neighbors=[7772f1b feat(scan-in): add AWB Receptio…, f4ad8b5 fix(scan-in): correct all SP pa…, GET(), db.ts, executeProcedure(), route.ts]
- "modals_boxtransfermodal": "BoxTransferModal.tsx" | kind=code-symbol | source=src/app/qc/components/modals/BoxTransferModal.tsx:L1 | neighbors=[45709f7 fix(qc): wire Send to Warehouse…, f2d0c3d feat(qc): redesign BoxTransferM…, BoxTransferModal(), BoxTransferModalProps, EMPTY_ARR, qcPost()]
- "no_scan_list_route": "route.ts" | kind=code-symbol | source=src/app/api/scan-in/no-scan-list/route.ts:L1 | neighbors=[7772f1b feat(scan-in): add AWB Receptio…, f4ad8b5 fix(scan-in): correct all SP pa…, db.ts, executeProcedure(), route.ts, authOptions]
- "packs_route": "route.ts" | kind=code-symbol | source=src/app/api/masters/items/varieties/[unico]/packs/route.ts:L1 | neighbors=[b6ad5a5 feat(masters/items): variety pa…, db.ts, executeProcedure(), serverAudit.ts, serverAuditLog(), GET()]
- "packunico_route": "route.ts" | kind=code-symbol | source=src/app/api/masters/items/varieties/[unico]/packs/[packUnico]/route.ts:L1 | neighbors=[b6ad5a5 feat(masters/items): variety pa…, db.ts, executeProcedure(), serverAudit.ts, serverAuditLog(), DELETE()]
- "payment_authorizations_page_t": "t()" | kind=code-symbol | source=src/app/payment-authorizations/page.tsx:L28 | neighbors=[page.tsx, fmtDate(), fmtModalVal(), ModalPayInvoice(), ModalPaymentsReport(), ModalReports()]
- "pbook2invoice_modalinvoicesbycustomer": "ModalInvoicesByCustomer.tsx" | kind=code-symbol | source=src/components/pbook2invoice/ModalInvoicesByCustomer.tsx:L1 | neighbors=[fmt(), fmtDate(), fmtI(), ModalInvoicesByCustomer(), Props, t()]
- "public_pdf_worker_min_aesbasecipher": "AESBaseCipher" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), ._decrypt(), .decryptBlock(), ._decryptBlock2(), ._encrypt()]
- "public_pdf_worker_min_annotationfactory": "AnnotationFactory" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .create(), .createGlobals(), .generateImages(), ._getPageIndex(), .printNewAnnotations()]
- "public_pdf_worker_min_applyassist": "applyAssist()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, nn, wr, .[nn](), .[nn](), .[nn]()]
- "public_pdf_worker_min_arc_nn": ".[nn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Arc, Edge, hasMargin(), .success(), measureToString(), .assign()]
- "public_pdf_worker_min_area_nn": ".[nn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Area, .isBreak(), .success(), isPrintOnly(), measureToString(), _s]
- "public_pdf_worker_min_arialabel": "ariaLabel()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .[nn](), .[nn](), .[nn](), .[nn](), .[nn]()]
- "public_pdf_worker_min_baselocalcache_getbyref": ".getByRef()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[BaseLocalCache, .getByName(), .getCached(), .getOperatorList(), .getTextContent(), .handleColorN()]
- "public_pdf_worker_min_basestream_peekbyte": ".peekByte()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[BaseStream, .readBlock(), .checkAndRepair(), .peekChar(), .findASCII85DecodeInlineStreamEnd(), .findDefaultInlineStreamEnd()]
- "public_pdf_worker_min_binder_binditems": "._bindItems()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Binder, createText(), Items, sn, warn(), ._bindOccurrences()]
- "public_pdf_worker_min_binder_setproperties": "._setProperties()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Binder, ._bindOccurrences(), ._setAndBind(), gr, sn, warn()]
- "public_pdf_worker_min_builder_build": ".build()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Builder, ._addNamespacePrefix(), ._getNamespaceToUse(), ._searchNamespace(), cn, Empty]
- "public_pdf_worker_min_buttonwidgetannotation_getdefaultcheckedappearance": "._getDefaultCheckedAppearance()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ButtonWidgetAnnotation, Dict, numberToString(), StringStream, unreachable(), ._processCheckBox()]
- "public_pdf_worker_min_buttonwidgetannotation_savecheckbox": "._saveCheckbox()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ButtonWidgetAnnotation, .save(), ._buildFlags(), getModificationDate(), ._getMKDict(), writeObject()]
- "public_pdf_worker_min_calgraycs": "CalGrayCS" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .getOutputLength(), .getRgbBuffer(), .getRgbItem(), .#t()]
- "public_pdf_worker_min_catalog_getallpagedicts": ".getAllPageDicts()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Catalog, FormatError, isName(), .pop(), RefSet, .fetchAsync()]
- "public_pdf_worker_min_catalog_metadata": ".metadata()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Catalog, info(), isName(), MetadataParser, shadow(), stringToUTF8String()]
- "public_pdf_worker_min_ccittfaxdecoder_eatbits": "._eatBits()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CCITTFaxDecoder, .constructor(), ._findTableCode(), ._getBlackCode(), ._getTwoDimCode(), ._getWhiteCode()]
- "public_pdf_worker_min_ccittfaxdecoder_lookbits": "._lookBits()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CCITTFaxDecoder, .constructor(), ._findTableCode(), ._getBlackCode(), ._getTwoDimCode(), ._getWhiteCode()]
- "public_pdf_worker_min_cffcompiler_compiledict": ".compileDict()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFCompiler, .encodeNumber(), .isTracking(), .track(), FormatError, .compilePrivateDicts()]
- "public_pdf_worker_min_ciphertransformfactory_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CipherTransformFactory, FormatError, isName(), PasswordException, stringToBytes(), utf8StringToString()]
- "public_pdf_worker_min_createdatanode": "createDataNode()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, ._bindElement(), hr, lr, parseExpression(), warn()]
- "public_pdf_worker_min_createos2table": "createOS2Table()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, FormatError, getUnicodeRangeFor(), string16(), string32(), .checkAndRepair()]
- "public_pdf_worker_min_datahandler_serialize": ".serialize()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DataHandler, cr, fr, gn, .pop(), tn]
- "public_pdf_worker_min_decodetextregion": "decodeTextRegion()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, decodeIAID(), decodeInteger(), decodeRefinement(), Jbig2Error, .onImmediateTextRegion()]
- "public_pdf_worker_min_evaluatorpreprocessor_read": ".read()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[EvaluatorPreprocessor, .preprocessCommand(), FormatError, info(), .shift(), .pop()]
- "public_pdf_worker_min_fontfinder": "FontFinder" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .add(), .addPdfFont(), .constructor(), .find(), .getDefault()]
- "public_pdf_worker_min_freetextannotation_createnewappearancestream": ".createNewAppearanceStream()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[FreeTextAnnotation, Dict, escapeString(), getPdfColor(), numberToString(), StringStream]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-015.json

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
