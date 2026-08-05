# Node Description Batch 30 of 139

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

- "public_pdf_worker_min_pdfworkerstream": "PDFWorkerStream" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .cancelAllRequests(), .constructor(), .getFullReader(), .getRangeReader()]
- "public_pdf_worker_min_postscriptparser_accept": ".accept()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PostScriptParser, .nextToken(), .expect(), .parseBlock(), .parseCondition()]
- "public_pdf_worker_min_postscriptparser_expect": ".expect()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PostScriptParser, FormatError, .accept(), .parse(), .parseCondition()]
- "public_pdf_worker_min_postscriptparser_parsecondition": ".parseCondition()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PostScriptParser, .parseBlock(), FormatError, .accept(), .expect()]
- "public_pdf_worker_min_predictorstream": "PredictorStream" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .makeFilter(), .constructor(), .readBlockPng(), .readBlockTiff()]
- "public_pdf_worker_min_r": "_r" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .[gr](), .[Fn](), .[sn](), .[Un]()]
- "public_pdf_worker_min_readdatablock": "readDataBlock()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .parse(), findNextFileMarker(), readUint16(), warn()]
- "public_pdf_worker_min_recoverglyphname": "recoverGlyphName()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .checkAndRepair(), getUnicodeForGlyph(), info(), type1FontGlyphMapping()]
- "public_pdf_worker_min_ref": "Ref" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .fromString(), .get(), .toString()]
- "public_pdf_worker_min_refset_remove": ".remove()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[_collectJS(), ._walk(), RefSet, .delete(), .fetch()]
- "public_pdf_worker_min_root": "Root" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .buildRoot(), .constructor(), .[gr](), .[Or]()]
- "public_pdf_worker_min_searchnode": "searchNode()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, hr, lr, parseExpression(), wr]
- "public_pdf_worker_min_setfirstunsplittable": "setFirstUnsplittable()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .[nn](), .[nn](), .[nn](), .[nn]()]
- "public_pdf_worker_min_setminmaxdimensions": "setMinMaxDimensions()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .[nn](), .[nn](), measureToString(), yr]
- "public_pdf_worker_min_simplesegmentvisitor_drawbitmap": ".drawBitmap()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[SimpleSegmentVisitor, Jbig2Error, .onImmediateGenericRegion(), .onImmediateHalftoneRegion(), .onImmediateTextRegion()]
- "public_pdf_worker_min_simplesegmentvisitor_onimmediategenericregion": ".onImmediateGenericRegion()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[SimpleSegmentVisitor, decodeBitmap(), DecodingContext, .drawBitmap(), .onImmediateLosslessGenericRegion()]
- "public_pdf_worker_min_simplesegmentvisitor_ontables": ".onTables()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[SimpleSegmentVisitor, HuffmanLine, HuffmanTable, Reader, readUint32()]
- "public_pdf_worker_min_simplexmlparser_parsefromstring": ".parseFromString()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.constructor(), .constructor(), SimpleXMLParser, .parseXml(), updateXFA()]
- "public_pdf_worker_min_squareannotation_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[SquareAnnotation, .getArray(), getPdfColorArray(), getRgbColor(), ._setDefaultAppearance()]
- "public_pdf_worker_min_string16": "string16()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, createCmapTable(), createNameTable(), createOS2Table(), .convert()]
- "public_pdf_worker_min_string32": "string32()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, createCmapTable(), createOS2Table(), createPostTable(), .toArray()]
- "public_pdf_worker_min_stripquotes": "stripQuotes()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .[nn](), setFontFamily(), .setFonts(), .[jr]()]
- "public_pdf_worker_min_structtreepage_parse": ".parse()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[StructTreePage, NumberTree, .addNode(), .fetch(), .fetchIfRef()]
- "public_pdf_worker_min_structtreeroot_updatestructuretree": ".updateStructureTree()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[StructTreeRoot, RefSetCache, writeObject(), .fetch(), .getNewTemporaryRef()]
- "public_pdf_worker_min_submit_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Submit, getInteger(), getKeyword(), getStringOption(), XFAObjectArray]
- "public_pdf_worker_min_template_font": "template_Font" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[on](), .[$s](), .font()]
- "public_pdf_worker_min_template_font_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[template_Font, getFloat(), getInteger(), getMeasurement(), getStringOption()]
- "public_pdf_worker_min_textedit": "TextEdit" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .[nn](), .textEdit(), .constructor(), .[nn]()]
- "public_pdf_worker_min_time": "Time" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .time(), .constructor(), .[gr](), .[nn]()]
- "public_pdf_worker_min_tn": "tn" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, ._bindValue(), .serialize(), .[tn](), _setValue()]
- "public_pdf_worker_min_translatedfont_loadtype3data": ".loadType3Data()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.handleSetFont(), TranslatedFont, .getKeys(), RefSet, .normalizeRect()]
- "public_pdf_worker_min_traverse": "Traverse" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .traverse(), .constructor(), .[Jr](), .name()]
- "public_pdf_worker_min_type1charstring": "Type1CharString" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .convert(), .executeCommand(), .extractFontProgram()]
- "public_pdf_worker_min_type1parser_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Type1Parser, decrypt(), isHexDigit(), isWhiteSpace(), Stream]
- "public_pdf_worker_min_type1parser_extractfontheader": ".extractFontHeader()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.constructor(), Type1Parser, getEncoding(), .readInt(), .readNumberArray()]
- "public_pdf_worker_min_unknownnamespace": "UnknownNamespace" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), ._searchNamespace(), .[cn](), .constructor()]
- "public_pdf_worker_min_unsetfirstunsplittable": "unsetFirstUnsplittable()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .[nn](), .[nn](), .[nn](), .[nn]()]
- "public_pdf_worker_min_util_intersect": ".intersect()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.constructor(), .constructor(), .view(), .constructor(), Util]
- "public_pdf_worker_min_util_normalizerect": ".normalizeRect()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.constructor(), lookupNormalRect(), .loadType3Data(), ._removeType3ColorOperators(), Util]
- "public_pdf_worker_min_widgetannotation_getborderandbackgroundappearances": ".getBorderAndBackgroundAppearances()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[._getCombAppearance(), ._getMultilineAppearance(), WidgetAnnotation, ._getAppearance(), getPdfColor()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-029.json

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
