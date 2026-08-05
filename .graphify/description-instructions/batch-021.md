# Node Description Batch 22 of 139

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

- "public_pdf_worker_min_operatorlist_adddependency": ".addDependency()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[addLocallyCachedImageOps(), OperatorList, .addDependencies(), .addOp(), .buildPaintImageXObject(), .getOperatorList()]
- "public_pdf_worker_min_page_getboundingbox": "._getBoundingBox()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Page, .cropBox(), lookupNormalRect(), ._getInheritableProperty(), warn(), .mediaBox()]
- "public_pdf_worker_min_pageset": "PageSet" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .[Ar](), .constructor(), .[mr](), .[Yr](), .pageSet()]
- "public_pdf_worker_min_parsebfrange": "parseBfRange()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, expectString(), FormatError, isCmd(), strToInt(), parseCMap()]
- "public_pdf_worker_min_parsecidchar": "parseCidChar()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, expectInt(), expectString(), isCmd(), strToInt(), parseCMap()]
- "public_pdf_worker_min_parsecidrange": "parseCidRange()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, expectInt(), expectString(), isCmd(), strToInt(), parseCMap()]
- "public_pdf_worker_min_parsecodespacerange": "parseCodespaceRange()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, parseCMap(), .addCodespaceRange(), FormatError, isCmd(), strToInt()]
- "public_pdf_worker_min_parser_findasciihexdecodeinlinestreamend": ".findASCIIHexDecodeInlineStreamEnd()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Parser, .skip(), .findDefaultInlineStreamEnd(), .inlineStreamSkipEI(), warn(), .makeInlineImage()]
- "public_pdf_worker_min_parser_finddctdecodeinlinestreamend": ".findDCTDecodeInlineStreamEnd()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Parser, .skip(), .findDefaultInlineStreamEnd(), .inlineStreamSkipEI(), warn(), .makeInlineImage()]
- "public_pdf_worker_min_partialevaluator_buildtounicode": ".buildToUnicode()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PartialEvaluator, FormatError, IdentityToUnicodeMap, ._simpleFontToUnicode(), ToUnicodeMap, .extractDataStructures()]
- "public_pdf_worker_min_partialevaluator_hasblendmodes": ".hasBlendModes()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PartialEvaluator, .getRawValues(), info(), .shift(), RefSet, .fetch()]
- "public_pdf_worker_min_partialevaluator_simplefonttounicode": "._simpleFontToUnicode()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PartialEvaluator, .buildToUnicode(), assert(), getEncoding(), getUnicodeForGlyph(), xi]
- "public_pdf_worker_min_pattern_parseshading": ".parseShading()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Pattern, DummyShading, FormatError, MeshShading, RadialAxialShading, warn()]
- "public_pdf_worker_min_pdf17": "PDF17" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .#U(), .checkOwnerPassword(), .checkUserPassword(), .getOwnerKey(), .getUserKey()]
- "public_pdf_worker_min_pdf20_hash": "._hash()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDF20, .checkOwnerPassword(), .checkUserPassword(), .getOwnerKey(), .getUserKey(), AES128Cipher]
- "public_pdf_worker_min_pdfdocument_documentinfo": ".documentInfo()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFDocument, .getKeys(), info(), shadow(), stringToPDFString(), warn()]
- "public_pdf_worker_min_pdfdocument_loadxfaimages": ".loadXfaImages()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFDocument, .ensureCatalog(), .getKeys(), ObjectLoader, .load(), .setImages()]
- "public_pdf_worker_min_pdfdocument_z": ".#Z()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFDocument, .getAsync(), isName(), stringToPDFString(), warn(), .fetchAsync()]
- "public_pdf_worker_min_pdffunction_constructstiched": ".constructStiched()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFFunction, .getArray(), FormatError, toNumberArray(), .fetchIfRef(), .parse()]
- "public_pdf_worker_min_pdffunction_parse": ".parse()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFFunction, FormatError, .constructInterpolated(), .constructPostScript(), .constructSampled(), .constructStiched()]
- "public_pdf_worker_min_pdfimage_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFImage, .getArray(), FormatError, .parseImageProperties(), warn(), .fetchIfRef()]
- "public_pdf_worker_min_pdfimage_createmask": ".createMask()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.buildPaintImageXObject(), PDFImage, convertBlackAndWhiteToRGBA(), .needsToBeResized(), .createImageData(), .createRawMask()]
- "public_pdf_worker_min_pdfimage_fillgraybuffer": ".fillGrayBuffer()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFImage, FormatError, .decodeBuffer(), .getComponents(), .getImageBytes(), .fillOpacity()]
- "public_pdf_worker_min_pdfworkerstreamrangereader": "PDFWorkerStreamRangeReader" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .getRangeReader(), .cancel(), .constructor(), .isStreamingSupported(), .read()]
- "public_pdf_worker_min_postscriptlexer": "PostScriptLexer" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructPostScript(), .constructor(), .getNumber(), .getToken(), .nextChar()]
- "public_pdf_worker_min_readsegmentheader": "readSegmentHeader()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, Jbig2Error, readRegionSegmentInformation(), readUint16(), readUint32(), readSegments()]
- "public_pdf_worker_min_setfontfamily": "setFontFamily()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, mapStyle(), getCurrentPara(), selectFont(), stripQuotes(), .[on]()]
- "public_pdf_worker_min_setvalue": "_setValue()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .[tn](), .[tn](), .[tn](), tn, Value]
- "public_pdf_worker_min_simpleglyph": "SimpleGlyph" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .getSize(), .parse(), .scale(), .write()]
- "public_pdf_worker_min_stringtoutf8string": "stringToUTF8String()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .metadata(), createValidAbsoluteUrl(), decodeString(), .xfaData(), .xfaDatasets()]
- "public_pdf_worker_min_strtoint": "strToInt()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, parseBfChar(), parseBfRange(), parseCidChar(), parseCidRange(), parseCodespaceRange()]
- "public_pdf_worker_min_structelementnode": "StructElementNode" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .parseKid(), .parseKids(), .role(), .addNode()]
- "public_pdf_worker_min_structtreeroot_createstructuretree": ".createStructureTree()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[StructTreeRoot, .cloneDict(), Dict, RefSetCache, writeObject(), .getNewTemporaryRef()]
- "public_pdf_worker_min_subform_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Subform, getInteger(), getMeasurement(), getRelevant(), getStringOption(), XFAObjectArray]
- "public_pdf_worker_min_subformset": "SubformSet" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[Gr](), .[pr](), .[yr](), .subformSet()]
- "public_pdf_worker_min_textedit_nn": ".[nn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TextEdit, ariaLabel(), .success(), isRequired(), toStyle(), wr]
- "public_pdf_worker_min_textwidgetannotation_getcombappearance": "._getCombAppearance()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TextWidgetAnnotation, escapeString(), .getCharPositions(), numberToString(), .getBorderAndBackgroundAppearances(), ._getAppearance()]
- "public_pdf_worker_min_textwidgetannotation_getmultilineappearance": "._getMultilineAppearance()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TextWidgetAnnotation, numberToString(), ._splitLine(), .getBorderAndBackgroundAppearances(), ._renderText(), ._getAppearance()]
- "public_pdf_worker_min_timeslotmanager": "TimeSlotManager" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .getOperatorList(), .getTextContent(), .check(), .constructor(), .reset()]
- "public_pdf_worker_min_tonumberarray": "toNumberArray()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructInterpolated(), .constructPostScript(), .constructSampled(), .constructStiched(), isNumberArray()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-021.json

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
