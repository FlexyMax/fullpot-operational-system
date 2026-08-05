# Node Description Batch 28 of 139

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

- "public_pdf_worker_min_chunkedstreammanager_requestallchunks": ".requestAllChunks()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ChunkedStreamManager, .getMissingChunks(), ._requestChunks(), .requestLoadedStream(), ._walk()]
- "public_pdf_worker_min_chunkedstreammanager_requestranges": ".requestRanges()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ChunkedStreamManager, .getBeginChunk(), .getEndChunk(), ._requestChunks(), ._walk()]
- "public_pdf_worker_min_circleannotation_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CircleAnnotation, .getArray(), getPdfColorArray(), getRgbColor(), ._setDefaultAppearance()]
- "public_pdf_worker_min_cmapfactory_create": ".create()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CMapFactory, CMap, createBuiltInCMap(), Lexer, parseCMap()]
- "public_pdf_worker_min_color": "Color" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[Fr](), .[on](), .color()]
- "public_pdf_worker_min_compiledfont_compileglyph": ".compileGlyph()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CompiledFont, .getFDIndex(), Commands, warn(), .getPathJs()]
- "public_pdf_worker_min_compileglyf": "compileGlyf()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, getFloat214(), getInt16(), getInt8(), .compileGlyphImpl()]
- "public_pdf_worker_min_computebbox": "computeBbox()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, measureToString(), yr, .[nn](), .[nn]()]
- "public_pdf_worker_min_computeids": "computeIDs()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, bytesToString(), vs, writeString(), incrementalUpdate()]
- "public_pdf_worker_min_contextcache_getcontexts": ".getContexts()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ContextCache, decodeBitmap(), decodeIAID(), decodeInteger(), decodeRefinement()]
- "public_pdf_worker_min_corner": "Corner" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[on](), .[nn](), .corner()]
- "public_pdf_worker_min_createnametable": "createNameTable()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, createPostscriptName(), string16(), .checkAndRepair(), .convert()]
- "public_pdf_worker_min_dateelement": "DateElement" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[gr](), .[nn](), .date()]
- "public_pdf_worker_min_datetime": "DateTime" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[gr](), .[nn](), .dateTime()]
- "public_pdf_worker_min_decimal": "Decimal" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[gr](), .[nn](), .decimal()]
- "public_pdf_worker_min_decoderefinement": "decodeRefinement()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .getContexts(), Jbig2Error, decodeTextRegion(), .onSymbolDictionary()]
- "public_pdf_worker_min_decodescan": "decodeScan()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, findNextFileMarker(), JpegError, warn(), .parse()]
- "public_pdf_worker_min_devicegraycs": "DeviceGrayCS" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .getOutputLength(), .getRgbBuffer(), .getRgbItem()]
- "public_pdf_worker_min_devicergbacs": "DeviceRgbaCS" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .fillRgb(), .getOutputLength(), .isPassthrough()]
- "public_pdf_worker_min_dict_merge": ".merge()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Dict, ._getInheritableProperty(), .handleTilingType(), .constructor(), ._getSaveFieldResources()]
- "public_pdf_worker_min_draw": "Draw" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[nn](), .[tn](), .draw()]
- "public_pdf_worker_min_float": "Float" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[gr](), .[nn](), .float()]
- "public_pdf_worker_min_font_chartoglyph": "._charToGlyph()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Font, .charsToGlyphs(), convertCidString(), fonts_Glyph, warn()]
- "public_pdf_worker_min_font_getcharpositions": ".getCharPositions()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Font, .readCharCode(), ._getCombAppearance(), ._splitLine(), ._computeFontSize()]
- "public_pdf_worker_min_fontinfo": "FontInfo" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .defaultFont(), .constructor(), .pushData()]
- "public_pdf_worker_min_getkeyword": "getKeyword()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), getStringOption(), .[gr](), .constructor()]
- "public_pdf_worker_min_gettransformmatrix": "getTransformMatrix()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .getOperatorList(), ._transformPoint(), .getAxialAlignedBoundingBox(), .getOperatorList()]
- "public_pdf_worker_min_getunicodeforglyph": "getUnicodeForGlyph()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, buildToFontChar(), .convert(), ._simpleFontToUnicode(), recoverGlyphName()]
- "public_pdf_worker_min_getxfafontdict": "getXfaFontDict()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, Dict, getXfaFontName(), .translateFont(), .loadXfaFonts()]
- "public_pdf_worker_min_highlightannotation": "HighlightAnnotation" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .create(), .constructor(), .createNewAppearanceStream(), .createNewDict()]
- "public_pdf_worker_min_highlightannotation_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[HighlightAnnotation, getPdfColorArray(), getQuadPoints(), ._setDefaultAppearance(), warn()]
- "public_pdf_worker_min_highlightannotation_createnewappearancestream": ".createNewAppearanceStream()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[HighlightAnnotation, Dict, getPdfColor(), numberToString(), StringStream]
- "public_pdf_worker_min_htmlresult_isbreak": ".isBreak()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.[nn](), .[nn](), HTMLResult, .[nn](), .[rn]()]
- "public_pdf_worker_min_huffmanline": "HuffmanLine" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, getStandardTable(), .constructor(), .onImmediateTextRegion(), .onTables()]
- "public_pdf_worker_min_huffmantreenode": "HuffmanTreeNode" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .buildTree(), .constructor(), .decodeNode()]
- "public_pdf_worker_min_image": "Image" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[nn](), .image(), .[tn]()]
- "public_pdf_worker_min_image_nn": ".[nn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Image, ariaLabel(), .success(), stringToBytes(), wr]
- "public_pdf_worker_min_imageresizer_guessmax": "._guessMax()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ImageResizer, ._areGoodDims(), .MAX_AREA(), .MAX_DIM(), .needsToBeResized()]
- "public_pdf_worker_min_imageresizer_needstoberesized": ".needsToBeResized()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ImageResizer, ._areGoodDims(), ._guessMax(), .createImageData(), .createMask()]
- "public_pdf_worker_min_integer": "Integer" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[gr](), .[nn](), .integer()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-027.json

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
