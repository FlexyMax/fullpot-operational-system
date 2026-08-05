# Node Description Batch 14 of 139

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

- "move_route": "route.ts" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/move/route.ts:L1 | neighbors=[3b0d9e6 feat(inventory-entry): add serv…, db.ts, executeProcedure(), serverAudit.ts, serverAuditLog(), P]
- "po_entries_route": "route.ts" | kind=code-symbol | source=src/app/api/inventory-entry/po-entries/route.ts:L1 | neighbors=[3b0d9e6 feat(inventory-entry): add serv…, db.ts, executeProcedure(), serverAudit.ts, serverAuditLog(), int()]
- "product_route": "route.ts" | kind=code-symbol | source=src/app/api/products/images/product/route.ts:L1 | neighbors=[809d3e2 feat(images): add delete image …, _cache.ts, ensureCache(), getS3(), signKey(), route.ts]
- "public_pdf_worker_min_aes256cipher": "AES256Cipher" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), ._expandKey(), .#J(), .getOwnerKey(), .getUserKey()]
- "public_pdf_worker_min_annotationborderstyle": "AnnotationBorderStyle" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .setBorderStyle(), .constructor(), .setDashArray(), .setHorizontalCornerRadius(), .setStyle()]
- "public_pdf_worker_min_annotationfactory_getpageindex": "._getPageIndex()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[AnnotationFactory, .create(), .ensureCatalog(), .ensureDoc(), info(), isRefsEqual()]
- "public_pdf_worker_min_astliteral": "AstLiteral" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .visit(), buildAddOperation(), buildMinOperation(), buildMulOperation()]
- "public_pdf_worker_min_binder_bindoccurrences": "._bindOccurrences()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Binder, ._bindElement(), ._bindItems(), ._bindValue(), ._setProperties(), kr]
- "public_pdf_worker_min_buttonwidgetannotation_saveradiobutton": "._saveRadioButton()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ButtonWidgetAnnotation, .save(), ._buildFlags(), getModificationDate(), ._getMKDict(), writeObject()]
- "public_pdf_worker_min_caption_nn": ".[nn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Caption, .success(), measureToString(), nn, setPara(), toStyle()]
- "public_pdf_worker_min_catalog_getpagedict": ".getPageDict()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Catalog, FormatError, isName(), .pop(), RefSet, .fetchAsync()]
- "public_pdf_worker_min_catalog_readpagelabels": "._readPageLabels()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Catalog, .pageLabels(), FormatError, isName(), .getAll(), NumberTree]
- "public_pdf_worker_min_cffcompiler_compileindex": ".compileIndex()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFCompiler, .compile(), .compileCharStrings(), .offset(), .compileNameIndex(), .compilePrivateDicts()]
- "public_pdf_worker_min_cffcompiler_compiletopdicts": ".compileTopDicts()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFCompiler, .compile(), .compileDict(), .compileIndex(), .removeByName(), CFFIndex]
- "public_pdf_worker_min_cffdict": "CFFDict" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .createTables(), .getByName(), .hasName(), .removeByName()]
- "public_pdf_worker_min_cffoffsettracker": "CFFOffsetTracker" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .compilePrivateDicts(), .compileTopDicts(), .constructor(), .isTracking(), .offset()]
- "public_pdf_worker_min_choicelist_nn": ".[nn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ChoiceList, ariaLabel(), .success(), isRequired(), nn, sn]
- "public_pdf_worker_min_chunkedstreammanager_requestchunks": "._requestChunks()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ChunkedStreamManager, .onReceiveData(), .requestAllChunks(), .hasChunk(), .groupChunks(), .sendRequest()]
- "public_pdf_worker_min_decodebitmap": "decodeBitmap()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .getContexts(), decodeMMRBitmap(), Reader, .onImmediateGenericRegion(), .onImmediateHalftoneRegion()]
- "public_pdf_worker_min_edge": "Edge" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .[nn](), .[ur](), .constructor(), .[on](), .[nn]()]
- "public_pdf_worker_min_evaluatorpreprocessor": "EvaluatorPreprocessor" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .opMap(), .preprocessCommand(), .read(), .savedStatesDepth()]
- "public_pdf_worker_min_fakeunicodefont_createappearance": ".createAppearance()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[FakeUnicodeFont, Dict, ._createContext(), getPdfColor(), numberToString(), StringStream]
- "public_pdf_worker_min_freetextannotation_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[FreeTextAnnotation, .setDefaultAppearance(), ._transformPoint(), AppearanceStreamEvaluator, FakeUnicodeFont, .createAppearance()]
- "public_pdf_worker_min_getmodificationdate": "getModificationDate()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, ._saveCheckbox(), ._saveRadioButton(), .createNewDict(), .createNewDict(), .createNewDict()]
- "public_pdf_worker_min_getquadpoints": "getQuadPoints()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .getArray(), isNumberArray(), .constructor(), .constructor(), .constructor()]
- "public_pdf_worker_min_jbig2stream": "Jbig2Stream" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .bytes(), .canAsyncDecodeImageFromBuffer(), .constructor(), .decodeImage(), .ensureBuffer()]
- "public_pdf_worker_min_jpxstream": "JpxStream" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .bytes(), .canAsyncDecodeImageFromBuffer(), .constructor(), .decodeImage(), .ensureBuffer()]
- "public_pdf_worker_min_markupannotation_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[MarkupAnnotation, .setColor(), .setContents(), .setModificationDate(), .setTitle(), .getArray()]
- "public_pdf_worker_min_metadataparser": "MetadataParser" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .metadata(), .constructor(), ._getSequence(), ._parse(), ._parseArray()]
- "public_pdf_worker_min_pagearea": "PageArea" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .[Ar](), .constructor(), .[Cr](), .[mr](), .[nn]()]
- "public_pdf_worker_min_partialevaluator_loadfont": ".loadFont()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PartialEvaluator, .handleSetFont(), assert(), .preEvaluateFont(), .translateFont(), .putAlias()]
- "public_pdf_worker_min_partialevaluator_parsemarkedcontentprops": ".parseMarkedContentProps()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.getOperatorList(), PartialEvaluator, .buildFormXObject(), .buildPaintImageXObject(), .getOperatorList(), FormatError]
- "public_pdf_worker_min_pdffunction": "PDFFunction" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructInterpolated(), .constructPostScript(), .constructSampled(), .constructStiched(), .getSampleArray()]
- "public_pdf_worker_min_postscriptevaluator_execute": ".execute()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PostScriptEvaluator, .log(), FormatError, PostScriptStack, .copy(), .index()]
- "public_pdf_worker_min_postscriptstack": "PostScriptStack" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .execute(), .constructor(), .copy(), .index(), .pop()]
- "public_pdf_worker_min_readuint16": "readUint16()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, findNextFileMarker(), .canUseImageDecoder(), .parse(), processSegment(), readDataBlock()]
- "public_pdf_worker_min_rectangle_nn": ".[nn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Rectangle, Corner, Edge, hasMargin(), .success(), measureToString()]
- "public_pdf_worker_min_textmeasure": "TextMeasure" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, layoutText(), .addPara(), .addString(), .compute(), .constructor()]
- "public_pdf_worker_min_type1parser_extractfontprogram": ".extractFontProgram()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.constructor(), Type1Parser, Type1CharString, .prevChar(), .readBoolean(), .readCharStrings()]
- "public_pdf_worker_min_ur": "ur" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .[on](), .[nn](), .[nn](), getBorderDims(), .[nn]()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-013.json

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
