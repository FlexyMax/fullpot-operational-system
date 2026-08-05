# Node Description Batch 47 of 139

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

- "public_pdf_worker_min_cffparser_parsedict": ".parseDict()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFParser, .parse(), .parsePrivateDict()]
- "public_pdf_worker_min_cffparser_parsenameindex": ".parseNameIndex()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFParser, .parse(), bytesToString()]
- "public_pdf_worker_min_cffprivatedict_tables": ".tables()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFPrivateDict, .createTables(), shadow()]
- "public_pdf_worker_min_cfftopdict_tables": ".tables()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFTopDict, .createTables(), shadow()]
- "public_pdf_worker_min_change": "Change" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .change()]
- "public_pdf_worker_min_checkbutton_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CheckButton, getMeasurement(), getStringOption()]
- "public_pdf_worker_min_choicelist_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ChoiceList, getInteger(), getStringOption()]
- "public_pdf_worker_min_chunkedstream_haschunk": ".hasChunk()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ChunkedStream, .onReceiveData(), ._requestChunks()]
- "public_pdf_worker_min_chunkedstream_makesubstream": ".makeSubStream()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ChunkedStream, .ensureByte(), .ensureRange()]
- "public_pdf_worker_min_chunkedstreammanager_getbeginchunk": ".getBeginChunk()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ChunkedStreamManager, .requestRange(), .requestRanges()]
- "public_pdf_worker_min_chunkedstreammanager_getendchunk": ".getEndChunk()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ChunkedStreamManager, .requestRange(), .requestRanges()]
- "public_pdf_worker_min_chunkedstreammanager_sendrequest": ".sendRequest()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ChunkedStreamManager, ._requestChunks(), .getRangeReader()]
- "public_pdf_worker_min_ciphertransformfactory_u": ".#U()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CipherTransformFactory, PDF17, PDF20]
- "public_pdf_worker_min_circleannotation": "CircleAnnotation" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .create(), .constructor()]
- "public_pdf_worker_min_cmap_readcharcode": ".readCharCode()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CMap, .charsToGlyphs(), .getCharPositions()]
- "public_pdf_worker_min_cmd": "Cmd" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .get()]
- "public_pdf_worker_min_colorspace_getcached": ".getCached()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ColorSpace, .getByRef(), .fetch()]
- "public_pdf_worker_min_colorspace_parseasync": ".parseAsync()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ColorSpace, ._parse(), .parseColorSpace()]
- "public_pdf_worker_min_comb": "Comb" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .comb()]
- "public_pdf_worker_min_commands": "Commands" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .add(), .compileGlyph()]
- "public_pdf_worker_min_commands_add": ".add()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Commands, isNumberArray(), warn()]
- "public_pdf_worker_min_common": "Common" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .common()]
- "public_pdf_worker_min_compiledfont_getpathjs": ".getPathJs()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CompiledFont, .compileGlyph(), lookupCmap()]
- "public_pdf_worker_min_compositeglyph_parse": ".parse()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CompositeGlyph, getInt16(), getInt8()]
- "public_pdf_worker_min_compress": "Compress" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .compress()]
- "public_pdf_worker_min_compression": "Compression" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .compression()]
- "public_pdf_worker_min_compresslogicalstructure": "CompressLogicalStructure" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .compressLogicalStructure()]
- "public_pdf_worker_min_compressobjectstream": "CompressObjectStream" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .compressObjectStream()]
- "public_pdf_worker_min_config": "Config" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .config()]
- "public_pdf_worker_min_config_area": "config_Area" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .area()]
- "public_pdf_worker_min_config_area_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[config_Area, getInteger(), getStringOption()]
- "public_pdf_worker_min_config_encrypt": "config_Encrypt" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .encrypt()]
- "public_pdf_worker_min_config_encryption": "config_Encryption" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .encryption()]
- "public_pdf_worker_min_config_fontinfo": "config_FontInfo" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .fontInfo()]
- "public_pdf_worker_min_config_message": "config_Message" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .message()]
- "public_pdf_worker_min_config_picture": "config_Picture" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .picture()]
- "public_pdf_worker_min_config_script": "config_Script" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .script()]
- "public_pdf_worker_min_config_template": "config_Template" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .template()]
- "public_pdf_worker_min_config_validate": "config_Validate" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .validate()]
- "public_pdf_worker_min_conformance": "Conformance" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .conformance(), .constructor()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-046.json

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
