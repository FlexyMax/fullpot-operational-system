# Node Description Batch 66 of 139

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

- "public_pdf_worker_min_calendarsymbols_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CalendarSymbols, XFAObjectArray]
- "public_pdf_worker_min_caption_tn": ".[tn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Caption, _setValue()]
- "public_pdf_worker_min_caption_ur": ".[ur]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Caption, layoutNode()]
- "public_pdf_worker_min_catalog_acroformref": ".acroFormRef()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Catalog, shadow()]
- "public_pdf_worker_min_catalog_cleanup": ".cleanup()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Catalog, clearGlobalCaches()]
- "public_pdf_worker_min_catalog_clonedict": ".cloneDict()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Catalog, .createStructureTree()]
- "public_pdf_worker_min_catalog_fontfallback": ".fontFallback()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Catalog, .fallback()]
- "public_pdf_worker_min_catalog_needsrendering": ".needsRendering()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Catalog, shadow()]
- "public_pdf_worker_min_catalog_pagelayout": ".pageLayout()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Catalog, shadow()]
- "public_pdf_worker_min_catalog_pagemode": ".pageMode()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Catalog, shadow()]
- "public_pdf_worker_min_catalog_readmarkinfo": "._readMarkInfo()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Catalog, .markInfo()]
- "public_pdf_worker_min_catalog_readpermissions": "._readPermissions()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Catalog, .permissions()]
- "public_pdf_worker_min_catalog_setactualnumpages": ".setActualNumPages()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Catalog, .checkLastPage()]
- "public_pdf_worker_min_ccittfaxstream_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CCITTFaxStream, CCITTFaxDecoder]
- "public_pdf_worker_min_ccittfaxstream_readblock": ".readBlock()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CCITTFaxStream, .readNextChar()]
- "public_pdf_worker_min_certificates_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Certificates, getStringOption()]
- "public_pdf_worker_min_cff_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFF, CFFStrings]
- "public_pdf_worker_min_cffcompiler_compileheader": ".compileHeader()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFCompiler, .compile()]
- "public_pdf_worker_min_cffcompiler_encodefloat": ".encodeFloat()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFCompiler, .encodeNumber()]
- "public_pdf_worker_min_cffcompiler_encodefloatregexp": ".EncodeFloatRegExp()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFCompiler, shadow()]
- "public_pdf_worker_min_cffcompiler_encodeinteger": ".encodeInteger()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFCompiler, .encodeNumber()]
- "public_pdf_worker_min_cffdict_getbyname": ".getByName()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFDict, FormatError]
- "public_pdf_worker_min_cfffont_createbuiltinencoding": "._createBuiltInEncoding()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFFont, .constructor()]
- "public_pdf_worker_min_cfffont_getglyphmapping": ".getGlyphMapping()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFFont, type1FontGlyphMapping()]
- "public_pdf_worker_min_cffoffsettracker_istracking": ".isTracking()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.compileDict(), CFFOffsetTracker]
- "public_pdf_worker_min_cffstrings_getsid": ".getSID()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.compileCharset(), CFFStrings]
- "public_pdf_worker_min_chunkedstream_getbyte": ".getByte()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ChunkedStream, .ensureByte()]
- "public_pdf_worker_min_chunkedstream_getbyterange": ".getByteRange()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ChunkedStream, .ensureRange()]
- "public_pdf_worker_min_chunkedstream_getbytes": ".getBytes()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ChunkedStream, .ensureRange()]
- "public_pdf_worker_min_chunkedstream_getmissingchunks": ".getMissingChunks()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ChunkedStream, .requestAllChunks()]
- "public_pdf_worker_min_chunkedstream_nextemptychunk": ".nextEmptyChunk()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ChunkedStream, .onReceiveData()]
- "public_pdf_worker_min_chunkedstream_onreceiveprogressivedata": ".onReceiveProgressiveData()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ChunkedStream, .onReceiveData()]
- "public_pdf_worker_min_chunkedstreammanager_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ChunkedStreamManager, ChunkedStream]
- "public_pdf_worker_min_chunkedstreammanager_getstream": ".getStream()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ChunkedStreamManager, .constructor()]
- "public_pdf_worker_min_chunkedstreammanager_groupchunks": ".groupChunks()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ChunkedStreamManager, ._requestChunks()]
- "public_pdf_worker_min_ciphertransformfactory_h": ".#H()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CipherTransformFactory, vs]
- "public_pdf_worker_min_cmap_getcharcodelength": ".getCharCodeLength()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CMap, .encodeString()]
- "public_pdf_worker_min_cmapfactory": "CMapFactory" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .create()]
- "public_pdf_worker_min_cn": "cn" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .build()]
- "public_pdf_worker_min_color_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Color, getStringOption()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-065.json

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
