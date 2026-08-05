# Node Description Batch 50 of 139

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

- "public_pdf_worker_min_flatestream_getbits": ".getBits()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[FlateStream, FormatError, .readBlock()]
- "public_pdf_worker_min_flatestream_getcode": ".getCode()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[FlateStream, FormatError, .readBlock()]
- "public_pdf_worker_min_fliplabel": "FlipLabel" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .flipLabel(), .constructor()]
- "public_pdf_worker_min_font_charstoglyphs": ".charsToGlyphs()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Font, .readCharCode(), ._charToGlyph()]
- "public_pdf_worker_min_fontinfo_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[FontInfo, .defaultFont(), selectFont()]
- "public_pdf_worker_min_fontinfo_defaultfont": ".defaultFont()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[FontInfo, .constructor(), .getDefault()]
- "public_pdf_worker_min_fontselector_topfont": ".topFont()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[FontSelector, .addPara(), .addString()]
- "public_pdf_worker_min_format": "Format" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .format()]
- "public_pdf_worker_min_formfieldfilling": "FormFieldFilling" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .formFieldFilling(), .constructor()]
- "public_pdf_worker_min_generatefont": "generateFont()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .assign(), getFontSubstitution()]
- "public_pdf_worker_min_getavailablespace": "getAvailableSpace()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .[Cr](), .[Cr]()]
- "public_pdf_worker_min_getborderdims": "getBorderDims()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .[nn](), ur]
- "public_pdf_worker_min_getcurrentpara": "getCurrentPara()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, setFontFamily(), setPara()]
- "public_pdf_worker_min_getfloat": "getFloat()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .constructor()]
- "public_pdf_worker_min_getfloat214": "getFloat214()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, compileGlyf(), getInt16()]
- "public_pdf_worker_min_getint8": "getInt8()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, compileGlyf(), .parse()]
- "public_pdf_worker_min_getnewannotationsmap": "getNewAnnotationsMap()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .getOperatorList(), .createDocumentHandler()]
- "public_pdf_worker_min_getsizeinbytes": "getSizeInBytes()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, log2(), incrementalUpdate()]
- "public_pdf_worker_min_getstandardfontname": "getStandardFontName()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, normalizeFontName(), .translateFont()]
- "public_pdf_worker_min_getsubroutinebias": "getSubroutineBias()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, compileCharString(), .constructor()]
- "public_pdf_worker_min_globalimagecache_setdata": ".setData()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[GlobalImageCache, warn(), .buildPaintImageXObject()]
- "public_pdf_worker_min_glyftable_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[GlyfTable, getUint32(), Glyph]
- "public_pdf_worker_min_gn": "gn" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .serialize(), .[gn]()]
- "public_pdf_worker_min_groupparent": "GroupParent" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .groupParent(), .constructor()]
- "public_pdf_worker_min_handlebreak": "handleBreak()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, wr, .[nn]()]
- "public_pdf_worker_min_handleoverflow": "handleOverflow()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, nn, .[nn]()]
- "public_pdf_worker_min_handler": "Handler" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .handler()]
- "public_pdf_worker_min_hr": "hr" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, createDataNode(), searchNode()]
- "public_pdf_worker_min_html_nn": ".[nn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Html, .success(), _s]
- "public_pdf_worker_min_huffmantreenode_decodenode": ".decodeNode()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.decode(), HuffmanTreeNode, Jbig2Error]
- "public_pdf_worker_min_hyphenation": "Hyphenation" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .hyphenation()]
- "public_pdf_worker_min_i": "i" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[jr]()]
- "public_pdf_worker_min_ifempty": "IfEmpty" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .ifEmpty(), .constructor()]
- "public_pdf_worker_min_imageresizer_aregooddims": "._areGoodDims()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ImageResizer, ._guessMax(), .needsToBeResized()]
- "public_pdf_worker_min_imageresizer_max_area": ".MAX_AREA()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ImageResizer, ._guessMax(), shadow()]
- "public_pdf_worker_min_imageresizer_max_dim": ".MAX_DIM()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ImageResizer, ._guessMax(), shadow()]
- "public_pdf_worker_min_imageresizer_setoptions": ".setOptions()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ImageResizer, .setMaxArea(), .constructor()]
- "public_pdf_worker_min_includexdpcontent": "IncludeXDPContent" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .includeXDPContent(), .constructor()]
- "public_pdf_worker_min_incrementalload": "IncrementalLoad" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .incrementalLoad(), .constructor()]
- "public_pdf_worker_min_incrementalmerge": "IncrementalMerge" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .incrementalMerge(), .constructor()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-049.json

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
