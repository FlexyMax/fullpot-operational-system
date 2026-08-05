# Node Description Batch 67 of 139

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

- "public_pdf_worker_min_color_on": ".[on]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Color, .makeHexColor()]
- "public_pdf_worker_min_colorspace_cache": "._cache()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ColorSpace, .fetch()]
- "public_pdf_worker_min_colorspace_getoutputlength": ".getOutputLength()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ColorSpace, unreachable()]
- "public_pdf_worker_min_colorspace_getrgbbuffer": ".getRgbBuffer()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ColorSpace, unreachable()]
- "public_pdf_worker_min_colorspace_getrgbitem": ".getRgbItem()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ColorSpace, unreachable()]
- "public_pdf_worker_min_colorspace_isdefaultdecode": ".isDefaultDecode()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ColorSpace, warn()]
- "public_pdf_worker_min_colorspace_singletons": ".singletons()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ColorSpace, shadow()]
- "public_pdf_worker_min_colorspace_useszerotoonerange": ".usesZeroToOneRange()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ColorSpace, shadow()]
- "public_pdf_worker_min_comb_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Comb, getInteger()]
- "public_pdf_worker_min_common_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Common, XFAObjectArray]
- "public_pdf_worker_min_compiledfont_compileglyphimpl": ".compileGlyphImpl()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CompiledFont, unreachable()]
- "public_pdf_worker_min_compiledfont_hasbuiltpath": ".hasBuiltPath()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CompiledFont, lookupCmap()]
- "public_pdf_worker_min_compress_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Compress, getStringOption()]
- "public_pdf_worker_min_config_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Config, XFAObjectArray]
- "public_pdf_worker_min_config_fontinfo_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[config_FontInfo, XFAObjectArray]
- "public_pdf_worker_min_confignamespace_acrobat": ".acrobat()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Acrobat]
- "public_pdf_worker_min_confignamespace_acrobat7": ".acrobat7()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Acrobat7]
- "public_pdf_worker_min_confignamespace_addsilentprint": ".addSilentPrint()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, AddSilentPrint]
- "public_pdf_worker_min_confignamespace_addviewerpreferences": ".addViewerPreferences()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, AddViewerPreferences]
- "public_pdf_worker_min_confignamespace_adjustdata": ".adjustData()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, AdjustData]
- "public_pdf_worker_min_confignamespace_adobeextensionlevel": ".adobeExtensionLevel()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, AdobeExtensionLevel]
- "public_pdf_worker_min_confignamespace_agent": ".agent()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Agent]
- "public_pdf_worker_min_confignamespace_alwaysembed": ".alwaysEmbed()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, AlwaysEmbed]
- "public_pdf_worker_min_confignamespace_amd": ".amd()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Amd]
- "public_pdf_worker_min_confignamespace_area": ".area()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, config_Area]
- "public_pdf_worker_min_confignamespace_attributes": ".attributes()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Attributes]
- "public_pdf_worker_min_confignamespace_autosave": ".autoSave()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, AutoSave]
- "public_pdf_worker_min_confignamespace_base": ".base()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Base]
- "public_pdf_worker_min_confignamespace_batchoutput": ".batchOutput()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, BatchOutput]
- "public_pdf_worker_min_confignamespace_behavioroverride": ".behaviorOverride()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, BehaviorOverride]
- "public_pdf_worker_min_confignamespace_cache": ".cache()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Cache]
- "public_pdf_worker_min_confignamespace_change": ".change()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Change]
- "public_pdf_worker_min_confignamespace_common": ".common()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Common]
- "public_pdf_worker_min_confignamespace_compress": ".compress()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Compress]
- "public_pdf_worker_min_confignamespace_compression": ".compression()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Compression]
- "public_pdf_worker_min_confignamespace_compresslogicalstructure": ".compressLogicalStructure()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, CompressLogicalStructure]
- "public_pdf_worker_min_confignamespace_compressobjectstream": ".compressObjectStream()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, CompressObjectStream]
- "public_pdf_worker_min_confignamespace_config": ".config()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Config]
- "public_pdf_worker_min_confignamespace_conformance": ".conformance()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Conformance]
- "public_pdf_worker_min_confignamespace_contentcopy": ".contentCopy()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, ContentCopy]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-066.json

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
