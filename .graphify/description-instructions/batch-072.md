# Node Description Batch 73 of 139

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

- "public_pdf_worker_min_fonts_glyph_category": ".category()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[fonts_Glyph, shadow()]
- "public_pdf_worker_min_fontselector_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[FontSelector, FontInfo]
- "public_pdf_worker_min_fontselector_popfont": ".popFont()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[FontSelector, .pop()]
- "public_pdf_worker_min_fontselector_pushdata": ".pushData()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[FontSelector, FontInfo]
- "public_pdf_worker_min_getb": "getB()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, ._buildFigureFromPatch()]
- "public_pdf_worker_min_getblockbufferoffset": "getBlockBufferOffset()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, buildComponentData()]
- "public_pdf_worker_min_getfamilyname": "getFamilyName()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, getFontSubstitution()]
- "public_pdf_worker_min_getindexes": "getIndexes()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, incrementalUpdate()]
- "public_pdf_worker_min_getratio": "getRatio()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor()]
- "public_pdf_worker_min_getunicoderangefor": "getUnicodeRangeFor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, createOS2Table()]
- "public_pdf_worker_min_getverbositylevel": "getVerbosityLevel()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .createDocumentHandler()]
- "public_pdf_worker_min_globalimagecache_addbytesize": ".addByteSize()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[GlobalImageCache, .buildPaintImageXObject()]
- "public_pdf_worker_min_globalimagecache_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[GlobalImageCache, RefSetCache]
- "public_pdf_worker_min_globalimagecache_hasdecodefailed": ".hasDecodeFailed()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[GlobalImageCache, .buildPaintImageXObject()]
- "public_pdf_worker_min_globalimagecache_shouldcache": ".shouldCache()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[GlobalImageCache, .buildPaintImageXObject()]
- "public_pdf_worker_min_glyphheader_parse": ".parse()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[GlyphHeader, getInt16()]
- "public_pdf_worker_min_handler_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Handler, getStringOption()]
- "public_pdf_worker_min_hextoint": "hexToInt()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .process()]
- "public_pdf_worker_min_hextostr": "hexToStr()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .process()]
- "public_pdf_worker_min_hs": "hs" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, getXfaFontName()]
- "public_pdf_worker_min_htmlresult_breaknode": ".breakNode()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[HTMLResult, .[nn]()]
- "public_pdf_worker_min_htmlresult_empty": ".EMPTY()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[HTMLResult, shadow()]
- "public_pdf_worker_min_htmlresult_failure": ".FAILURE()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[HTMLResult, shadow()]
- "public_pdf_worker_min_huffmantable_assignprefixcodes": ".assignPrefixCodes()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[HuffmanTable, .constructor()]
- "public_pdf_worker_min_huffmantable_decode": ".decode()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[HuffmanTable, .decodeNode()]
- "public_pdf_worker_min_huffmantreenode_buildtree": ".buildTree()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.constructor(), HuffmanTreeNode]
- "public_pdf_worker_min_hyphenation_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Hyphenation, getInteger()]
- "public_pdf_worker_min_ia": "ia" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .getBaseFontMetrics()]
- "public_pdf_worker_min_identitycmap_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[IdentityCMap, .addCodespaceRange()]
- "public_pdf_worker_min_identitycmap_isidentitycmap": ".isIdentityCMap()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[IdentityCMap, unreachable()]
- "public_pdf_worker_min_identitycmap_mapbfrange": ".mapBfRange()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[IdentityCMap, unreachable()]
- "public_pdf_worker_min_identitycmap_mapbfrangetoarray": ".mapBfRangeToArray()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[IdentityCMap, unreachable()]
- "public_pdf_worker_min_identitycmap_mapcidrange": ".mapCidRange()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[IdentityCMap, unreachable()]
- "public_pdf_worker_min_identitycmap_mapone": ".mapOne()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[IdentityCMap, unreachable()]
- "public_pdf_worker_min_identitytounicodemap_amend": ".amend()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[IdentityToUnicodeMap, unreachable()]
- "public_pdf_worker_min_image_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Image, getStringOption()]
- "public_pdf_worker_min_imageedit_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ImageEdit, getStringOption()]
- "public_pdf_worker_min_imageedit_nn": ".[nn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ImageEdit, .success()]
- "public_pdf_worker_min_imageresizer_canuseimagedecoder": ".canUseImageDecoder()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ImageResizer, shadow()]
- "public_pdf_worker_min_imageresizer_encodebmp": "._encodeBMP()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ImageResizer, .createImage()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-072.json

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
