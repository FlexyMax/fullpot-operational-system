# Node Description Batch 110 of 139

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

- "public_pdf_worker_min_cmap_mapbfrangetoarray": ".mapBfRangeToArray()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CMap]
- "public_pdf_worker_min_cmap_mapcidrange": ".mapCidRange()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CMap]
- "public_pdf_worker_min_cmap_mapone": ".mapOne()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CMap]
- "public_pdf_worker_min_cmd_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Cmd]
- "public_pdf_worker_min_cmd_get": ".get()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Cmd]
- "public_pdf_worker_min_color_fr": ".[Fr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Color]
- "public_pdf_worker_min_colorspace_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ColorSpace]
- "public_pdf_worker_min_colorspace_fillrgb": ".fillRgb()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ColorSpace]
- "public_pdf_worker_min_colorspace_ispassthrough": ".isPassthrough()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ColorSpace]
- "public_pdf_worker_min_compiledfont_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CompiledFont]
- "public_pdf_worker_min_compositeglyph_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CompositeGlyph]
- "public_pdf_worker_min_compositeglyph_getsize": ".getSize()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CompositeGlyph]
- "public_pdf_worker_min_compositeglyph_scale": ".scale()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CompositeGlyph]
- "public_pdf_worker_min_compositeglyph_write": ".write()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CompositeGlyph]
- "public_pdf_worker_min_compression_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Compression]
- "public_pdf_worker_min_compresslogicalstructure_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CompressLogicalStructure]
- "public_pdf_worker_min_compressobjectstream_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CompressObjectStream]
- "public_pdf_worker_min_config_encrypt_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[config_Encrypt]
- "public_pdf_worker_min_config_encryption_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[config_Encryption]
- "public_pdf_worker_min_config_message_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[config_Message]
- "public_pdf_worker_min_config_picture_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[config_Picture]
- "public_pdf_worker_min_config_script_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[config_Script]
- "public_pdf_worker_min_config_template_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[config_Template]
- "public_pdf_worker_min_config_validate_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[config_Validate]
- "public_pdf_worker_min_confignamespace_adbe_jsconsole": ".ADBE_JSConsole()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace]
- "public_pdf_worker_min_confignamespace_adbe_jsdebugger": ".ADBE_JSDebugger()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace]
- "public_pdf_worker_min_confignamespace_cn": ".[cn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace]
- "public_pdf_worker_min_confignamespace_ps": ".ps()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace]
- "public_pdf_worker_min_conformance_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Conformance]
- "public_pdf_worker_min_connection_set_uri_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[connection_set_Uri]
- "public_pdf_worker_min_connectionsetnamespace_cn": ".[cn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConnectionSetNamespace]
- "public_pdf_worker_min_contentcopy_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ContentCopy]
- "public_pdf_worker_min_contentobject_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ContentObject]
- "public_pdf_worker_min_contentobject_gr": ".[gr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ContentObject]
- "public_pdf_worker_min_contentobject_wr": ".[Wr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ContentObject]
- "public_pdf_worker_min_contour_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Contour]
- "public_pdf_worker_min_copies_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Copies]
- "public_pdf_worker_min_creator_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Creator]
- "public_pdf_worker_min_cs": "cs" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_currentpage_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CurrentPage]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-109.json

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
