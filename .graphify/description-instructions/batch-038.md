# Node Description Batch 39 of 139

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

- "public_pdf_worker_min_packets": "Packets" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .packets(), .constructor(), .[gr]()]
- "public_pdf_worker_min_page_getannotationsdata": ".getAnnotationsData()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Page, PartialEvaluator, warn(), .createDocumentHandler()]
- "public_pdf_worker_min_page_x": ".#X()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Page, .fromString(), warn(), .fetchAsync()]
- "public_pdf_worker_min_pagerange": "PageRange" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .pageRange(), .constructor(), .[gr]()]
- "public_pdf_worker_min_pageset_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PageSet, getRelevant(), getStringOption(), XFAObjectArray]
- "public_pdf_worker_min_pageset_mr": ".[mr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PageSet, Ar, mr, wr]
- "public_pdf_worker_min_para": "Para" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[on](), .para()]
- "public_pdf_worker_min_para_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Para, getInteger(), getMeasurement(), getStringOption()]
- "public_pdf_worker_min_parsecff": "parseCff()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .create(), CFFParser, Stream]
- "public_pdf_worker_min_parseexpression": "parseExpression()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, createDataNode(), warn(), searchNode()]
- "public_pdf_worker_min_parser_inlinestreamskipei": ".inlineStreamSkipEI()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Parser, .findASCII85DecodeInlineStreamEnd(), .findASCIIHexDecodeInlineStreamEnd(), .findDCTDecodeInlineStreamEnd()]
- "public_pdf_worker_min_partialevaluator_buildfontpaths": ".buildFontPaths()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PartialEvaluator, .buildPath(), .handleText(), .fallback()]
- "public_pdf_worker_min_partialevaluator_parsecolorspace": ".parseColorSpace()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PartialEvaluator, .buildFormXObject(), .getOperatorList(), .parseAsync()]
- "public_pdf_worker_min_partialevaluator_parsevisibilityexpression": "._parseVisibilityExpression()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PartialEvaluator, .parseMarkedContentProps(), warn(), .fetchIfRef()]
- "public_pdf_worker_min_passwordexception": "PasswordException" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .constructor(), wrapReason()]
- "public_pdf_worker_min_patterncs": "PatternCS" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .parse(), .constructor(), .isDefaultDecode()]
- "public_pdf_worker_min_pdfdocument_forminfo": ".formInfo()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFDocument, ._hasOnlyDocumentSignatures(), shadow(), warn()]
- "public_pdf_worker_min_pdffunction_constructinterpolated": ".constructInterpolated()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFFunction, .getArray(), toNumberArray(), .parse()]
- "public_pdf_worker_min_pdfimage_createrawmask": ".createRawMask()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.buildPaintImageXObject(), PDFImage, .createMask(), .fill()]
- "public_pdf_worker_min_pdfimage_decodebuffer": ".decodeBuffer()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFImage, .createImageData(), decodeAndClamp(), .fillGrayBuffer()]
- "public_pdf_worker_min_pdfimage_getimagebytes": ".getImageBytes()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFImage, .createImageData(), .fillGrayBuffer(), assert()]
- "public_pdf_worker_min_postscriptevaluator": "PostScriptEvaluator" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructPostScript(), .constructor(), .execute()]
- "public_pdf_worker_min_postscriptlexer_gettoken": ".getToken()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PostScriptLexer, isWhiteSpace(), PostScriptToken, .getOperator()]
- "public_pdf_worker_min_postscriptparser_parse": ".parse()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PostScriptParser, .expect(), .nextToken(), .parseBlock()]
- "public_pdf_worker_min_postscriptparser_parseblock": ".parseBlock()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PostScriptParser, .parse(), .accept(), .parseCondition()]
- "public_pdf_worker_min_qr": "Qr" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .[Lr](), .[Qr](), .[Qr]()]
- "public_pdf_worker_min_radial": "Radial" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[on](), .radial()]
- "public_pdf_worker_min_radialaxialshading": "RadialAxialShading" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .parseShading(), .constructor(), .getIR()]
- "public_pdf_worker_min_range": "Range" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .range(), .constructor(), .[gr]()]
- "public_pdf_worker_min_reader_bytealign": ".byteAlign()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Reader, readUncompressedBitmap(), .onImmediateTextRegion(), .onSymbolDictionary()]
- "public_pdf_worker_min_readregionsegmentinformation": "readRegionSegmentInformation()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, processSegment(), readUint32(), readSegmentHeader()]
- "public_pdf_worker_min_record": "Record" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .record(), .constructor(), .[gr]()]
- "public_pdf_worker_min_rectangle": "Rectangle" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[nn](), .rectangle()]
- "public_pdf_worker_min_regionalimagecache": "RegionalImageCache" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .constructor(), .set()]
- "public_pdf_worker_min_relevant": "Relevant" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .relevant(), .constructor(), .[gr]()]
- "public_pdf_worker_min_rename": "Rename" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .rename(), .constructor(), .[gr]()]
- "public_pdf_worker_min_rr": "rr" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .[Rr](), .dump(), .[rr]()]
- "public_pdf_worker_min_runlengthstream": "RunLengthStream" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .makeFilter(), .constructor(), .readBlock()]
- "public_pdf_worker_min_selectfont": "selectFont()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .[nn](), .constructor(), setFontFamily()]
- "public_pdf_worker_min_setaccess": "setAccess()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .[nn](), .[nn](), .[nn]()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-038.json

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
