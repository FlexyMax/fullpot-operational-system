# Node Description Batch 21 of 139

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

- "public_pdf_worker_min_exdata": "ExData" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[nn](), .[Nr](), .[Or](), .exData()]
- "public_pdf_worker_min_expectstring": "expectString()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, FormatError, parseBfChar(), parseBfRange(), parseCidChar(), parseCidRange()]
- "public_pdf_worker_min_featuretest": "FeatureTest" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .isCSSRoundSupported(), .isEvalSupported(), .isLittleEndian(), .isOffscreenCanvasSupported(), .platform()]
- "public_pdf_worker_min_field": "Field" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[Gr](), .[nn](), .[tn](), .field()]
- "public_pdf_worker_min_field_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Field, getInteger(), getMeasurement(), getRelevant(), getStringOption(), XFAObjectArray]
- "public_pdf_worker_min_findnextfilemarker": "findNextFileMarker()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, decodeScan(), readUint16(), .parse(), readDataBlock(), skipData()]
- "public_pdf_worker_min_fixdimensions": "fixDimensions()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .[nn](), .[nn](), .[nn](), yr, .[nn]()]
- "public_pdf_worker_min_flatestream_readblock": ".readBlock()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[FlateStream, .peekByte(), .generateHuffmanTable(), .getBits(), .getCode(), FormatError]
- "public_pdf_worker_min_fontrendererfactory_create": ".create()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[FontRendererFactory, bytesToString(), getUint32(), parseCff(), TrueTypeCompiled, Type2Compiled]
- "public_pdf_worker_min_fontselector": "FontSelector" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .popFont(), .pushData(), .topFont(), .constructor()]
- "public_pdf_worker_min_freetextannotation": "FreeTextAnnotation" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .create(), .constructor(), .createNewAppearanceStream(), .createNewDict(), .hasTextContent()]
- "public_pdf_worker_min_freetextannotation_createnewdict": ".createNewDict()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[FreeTextAnnotation, Dict, .delete(), getModificationDate(), getPdfColor(), stringToAsciiOrUTF16BE()]
- "public_pdf_worker_min_getencoding": "getEncoding()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .checkAndRepair(), .extractDataStructures(), ._simpleFontToUnicode(), type1FontGlyphMapping(), .extractFontHeader()]
- "public_pdf_worker_min_getint16": "getInt16()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, compileGlyf(), .parse(), getFloat214(), .parse(), .parse()]
- "public_pdf_worker_min_getrgbcolor": "getRgbColor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .setBorderAndBackgroundColors(), .setColor(), .constructor(), .constructor(), .constructor()]
- "public_pdf_worker_min_getstandardtable": "getStandardTable()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, HuffmanLine, HuffmanTable, Jbig2Error, .onImmediateTextRegion(), .onSymbolDictionary()]
- "public_pdf_worker_min_getxfafontname": "getXfaFontName()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, getXfaFontDict(), hs, normalizeFontName(), .translateFont(), .loadXfaFonts()]
- "public_pdf_worker_min_glyftable": "GlyfTable" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .checkAndRepair(), .constructor(), .getSize(), .scale(), .write()]
- "public_pdf_worker_min_glyphheader": "GlyphHeader" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .getSize(), .parse(), .scale(), .write()]
- "public_pdf_worker_min_gr": "gr" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, ._setProperties(), .[gr](), .onBeginElement(), .onEndElement(), .parse()]
- "public_pdf_worker_min_inkannotation": "InkAnnotation" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .create(), .constructor(), .createNewAppearanceStream(), .createNewAppearanceStreamForHighlight(), .createNewDict()]
- "public_pdf_worker_min_inkannotation_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[InkAnnotation, .getArray(), getPdfColorArray(), ._setDefaultAppearance(), .intersect(), .fetchIfRef()]
- "public_pdf_worker_min_inkannotation_createnewappearancestream": ".createNewAppearanceStream()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[InkAnnotation, Dict, getPdfColor(), .createNewAppearanceStreamForHighlight(), numberToString(), StringStream]
- "public_pdf_worker_min_inkannotation_createnewappearancestreamforhighlight": ".createNewAppearanceStreamForHighlight()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[InkAnnotation, .createNewAppearanceStream(), Dict, getPdfColor(), numberToString(), StringStream]
- "public_pdf_worker_min_isrequired": "isRequired()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .[nn](), .[nn](), .[nn](), .[nn](), .[nn]()]
- "public_pdf_worker_min_lexer_getnumber": ".getNumber()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Lexer, FormatError, info(), isWhiteSpace(), .peekChar(), warn()]
- "public_pdf_worker_min_line_nn": ".[nn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Line, Edge, hasMargin(), .success(), measureToString(), wr]
- "public_pdf_worker_min_localpdfmanager": "LocalPdfManager" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .ensure(), .requestLoadedStream(), .requestRange(), .terminate()]
- "public_pdf_worker_min_log2": "log2()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, getSizeInBytes(), .createImage(), .onImmediateHalftoneRegion(), .onImmediateTextRegion(), .onSymbolDictionary()]
- "public_pdf_worker_min_mapstyle": "mapStyle()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, fixTextIndent(), getMeasurement(), measureToString(), setFontFamily(), .[nn]()]
- "public_pdf_worker_min_markupannotation": "MarkupAnnotation" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .createNewAnnotation(), .createNewPrintAnnotation(), .setCreationDate(), ._setDefaultAppearance()]
- "public_pdf_worker_min_meshshading_decodetype6shading": "._decodeType6Shading()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[MeshShading, .constructor(), FormatError, .readComponents(), .readCoordinate(), .readFlag()]
- "public_pdf_worker_min_meshshading_decodetype7shading": "._decodeType7Shading()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[MeshShading, .constructor(), FormatError, .readComponents(), .readCoordinate(), .readFlag()]
- "public_pdf_worker_min_meshstreamreader_readcomponents": ".readComponents()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[._decodeType4Shading(), ._decodeType5Shading(), ._decodeType6Shading(), ._decodeType7Shading(), MeshStreamReader, .getRgb()]
- "public_pdf_worker_min_metadataparser_parse": "._parse()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.parse(), .parseAsync(), MetadataParser, .constructor(), ._parseArray(), .hasChildNodes()]
- "public_pdf_worker_min_nametree": "NameTree" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .attachments(), ._collectJavaScript(), ._readDests(), .xfaImages(), .constructor()]
- "public_pdf_worker_min_normalizefontname": "normalizeFontName()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .fallbackToSystemFont(), getFontSubstitution(), getStandardFontName(), getXfaFontName(), isKnownFontName()]
- "public_pdf_worker_min_numbertree": "NumberTree" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, ._readPageLabels(), .constructor(), .collectObjects(), .parse(), .canUpdateStructTree()]
- "public_pdf_worker_min_numericedit_nn": ".[nn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[NumericEdit, ariaLabel(), .success(), isRequired(), toStyle(), wr]
- "public_pdf_worker_min_objectloader": "ObjectLoader" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .load(), ._walk(), .loadXfaFonts(), .loadXfaImages()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-020.json

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
