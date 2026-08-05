# Node Description Batch 17 of 139

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

- "public_pdf_worker_min_getfontfiletype": "getFontFileType()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .peekBytes(), bytesToString(), isTrueTypeCollectionFile(), readUint32()]
- "public_pdf_worker_min_getfontsubstitution": "getFontSubstitution()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, generateFont(), getFamilyName(), normalizeFontName(), validateFontName(), warn()]
- "public_pdf_worker_min_gettilingpatternir": "getTilingPatternIR()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .getArray(), FormatError, lookupMatrix(), lookupNormalRect(), .handleColorN()]
- "public_pdf_worker_min_glyph": "Glyph" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .constructor(), .getSize(), .parse(), .scale()]
- "public_pdf_worker_min_htmlresult": "HTMLResult" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .breakNode(), .constructor(), .EMPTY(), .FAILURE(), .isBreak()]
- "public_pdf_worker_min_huffmantable": "HuffmanTable" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, getStandardTable(), .assignPrefixCodes(), .constructor(), .decode(), .onImmediateTextRegion()]
- "public_pdf_worker_min_indexedcs": "IndexedCS" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .parse(), .constructor(), .getOutputLength(), .getRgbBuffer(), .getRgbItem()]
- "public_pdf_worker_min_isarrayequal": "isArrayEqual()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .view(), .checkOwnerPassword(), .checkUserPassword(), .checkOwnerPassword(), .checkUserPassword()]
- "public_pdf_worker_min_isprintonly": "isPrintOnly()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .[nn](), .[nn](), createWrapper(), .[nn](), .[nn]()]
- "public_pdf_worker_min_jpegerror": "JpegError" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, decodeScan(), .constructor(), .canUseImageDecoder(), .getData(), .parse()]
- "public_pdf_worker_min_layoutnode": "layoutNode()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .[ur](), .[nn](), .[nn](), layoutText(), sn]
- "public_pdf_worker_min_meshshading_decodetype4shading": "._decodeType4Shading()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[MeshShading, .constructor(), FormatError, .align(), .readComponents(), .readCoordinate()]
- "public_pdf_worker_min_networkpdfmanager": "NetworkPdfManager" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .ensure(), .requestLoadedStream(), .requestRange(), .sendProgressiveData()]
- "public_pdf_worker_min_nulloptimizer": "NullOptimizer" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .flush(), ._optimize(), .push(), .reset()]
- "public_pdf_worker_min_opentypefilebuilder": "OpenTypeFileBuilder" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .checkAndRepair(), .convert(), .addTable(), .constructor(), .getSearchParams()]
- "public_pdf_worker_min_page_getinheritableproperty": "._getInheritableProperty()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Page, .annotations(), ._getBoundingBox(), .merge(), getInheritableProperty(), .resources()]
- "public_pdf_worker_min_partialevaluator_extractwidths": ".extractWidths()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PartialEvaluator, .getArray(), isNumberArray(), .buildCharCodeToWidth(), .getBaseFontMetrics(), .fetchIfRef()]
- "public_pdf_worker_min_partialevaluator_fetchstandardfontdata": ".fetchStandardFontData()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PartialEvaluator, .sendWithPromise(), Stream, warn(), .fetch(), Zi]
- "public_pdf_worker_min_partialevaluator_handletilingtype": ".handleTilingType()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PartialEvaluator, .handleColorN(), .merge(), getTilingPatternIR(), OperatorList, .addDependencies()]
- "public_pdf_worker_min_pdf20": "PDF20" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .#U(), .checkOwnerPassword(), .checkUserPassword(), .getOwnerKey(), .getUserKey()]
- "public_pdf_worker_min_pdfdocument_getlinearizationpage": "._getLinearizationPage()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFDocument, .getPageDict(), FormatError, isName(), warn(), .fetchAsync()]
- "public_pdf_worker_min_pdffunction_constructsampled": ".constructSampled()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFFunction, .getArray(), FormatError, info(), .getSampleArray(), toNumberArray()]
- "public_pdf_worker_min_polylineannotation_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PolylineAnnotation, .setLineEndings(), .getArray(), getPdfColorArray(), isNumberArray(), ._setDefaultAppearance()]
- "public_pdf_worker_min_processsegment": "processSegment()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, Jbig2Error, readInt8(), readRegionSegmentInformation(), readUint16(), readUint32()]
- "public_pdf_worker_min_queueoptimizer": "QueueOptimizer" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .constructor(), .flush(), .isOffscreenCanvasSupported(), ._optimize()]
- "public_pdf_worker_min_readuint32": "readUint32()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, getFontFileType(), .toArray(), processSegment(), readRegionSegmentInformation(), readSegmentHeader()]
- "public_pdf_worker_min_s": "_s" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .[nn](), .[nn](), .[nn](), .[nn](), .[nn]()]
- "public_pdf_worker_min_settabindex": "setTabIndex()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .[nn](), .[nn](), .[nn](), fr, wr]
- "public_pdf_worker_min_stampannotation": "StampAnnotation" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .create(), .constructor(), .createImage(), .createNewAppearanceStream(), .createNewDict()]
- "public_pdf_worker_min_statemanager": "StateManager" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .getOperatorList(), .getTextContent(), .constructor(), .restore(), .save()]
- "public_pdf_worker_min_stringtoasciiorutf16be": "stringToAsciiOrUTF16BE()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .createNewDict(), .createNewDict(), .createNewDict(), stringToUTF16String(), .#T()]
- "public_pdf_worker_min_structtreepage_addnode": ".addNode()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[StructTreePage, .delete(), isName(), StructElementNode, .addTopLevelNode(), warn()]
- "public_pdf_worker_min_structtreeroot_v": ".#v()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[StructTreeRoot, Dict, StructTreePage, .collectObjects(), writeObject(), .fetch()]
- "public_pdf_worker_min_template": "Template" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[gr](), .[Lr](), .[$r](), .[rn]()]
- "public_pdf_worker_min_templatenamespace_fill": ".fill()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.parseCharString(), .createImage(), .createImageData(), .createRawMask(), .onPageInformation(), TemplateNamespace]
- "public_pdf_worker_min_textmeasure_addstring": ".addString()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.[jr](), layoutText(), .[jr](), TextMeasure, .topFont(), .pop()]
- "public_pdf_worker_min_translatedfont": "TranslatedFont" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .handleSetFont(), .constructor(), .fallback(), .loadType3Data(), ._removeType3ColorOperators()]
- "public_pdf_worker_min_widgetannotation_computefontsize": "._computeFontSize()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[._getAppearance(), WidgetAnnotation, escapePDFName(), .getCharPositions(), getPdfColor(), ._getTextWidth()]
- "public_pdf_worker_min_widgetannotation_hasfieldflag": ".hasFieldFlag()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.constructor(), .constructor(), .constructor(), .getFieldObject(), WidgetAnnotation, .constructor()]
- "public_pdf_worker_min_widgetannotation_rendertext": "._renderText()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[._getAppearance(), ._getMultilineAppearance(), WidgetAnnotation, ._getAppearance(), escapeString(), numberToString()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-016.json

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
