# Node Description Batch 109 of 139

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

- "public_pdf_worker_min_cffencoding_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFEncoding]
- "public_pdf_worker_min_cfffdselect_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFFDSelect]
- "public_pdf_worker_min_cfffont_getcharset": ".getCharset()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFFont]
- "public_pdf_worker_min_cfffont_hasglyphid": ".hasGlyphId()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFFont]
- "public_pdf_worker_min_cfffont_numglyphs": ".numGlyphs()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFFont]
- "public_pdf_worker_min_cffheader_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFHeader]
- "public_pdf_worker_min_cffindex_add": ".add()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFIndex]
- "public_pdf_worker_min_cffindex_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFIndex]
- "public_pdf_worker_min_cffindex_count": ".count()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFIndex]
- "public_pdf_worker_min_cffindex_get": ".get()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFIndex]
- "public_pdf_worker_min_cffindex_set": ".set()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFIndex]
- "public_pdf_worker_min_cffoffsettracker_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFOffsetTracker]
- "public_pdf_worker_min_cffparser_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFParser]
- "public_pdf_worker_min_cffprivatedict_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFPrivateDict]
- "public_pdf_worker_min_cffstrings_add": ".add()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFStrings]
- "public_pdf_worker_min_cffstrings_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFStrings]
- "public_pdf_worker_min_cffstrings_count": ".count()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFStrings]
- "public_pdf_worker_min_cffstrings_get": ".get()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFStrings]
- "public_pdf_worker_min_cfftopdict_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFTopDict]
- "public_pdf_worker_min_cg": "cg" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_change_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Change]
- "public_pdf_worker_min_choicewidgetannotation_amendsaveddict": ".amendSavedDict()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ChoiceWidgetAnnotation]
- "public_pdf_worker_min_choicewidgetannotation_getfieldobject": ".getFieldObject()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ChoiceWidgetAnnotation]
- "public_pdf_worker_min_chunkedstream_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ChunkedStream]
- "public_pdf_worker_min_chunkedstream_getbasestreams": ".getBaseStreams()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ChunkedStream]
- "public_pdf_worker_min_chunkedstream_isdataloaded": ".isDataLoaded()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ChunkedStream]
- "public_pdf_worker_min_chunkedstream_numchunksloaded": ".numChunksLoaded()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ChunkedStream]
- "public_pdf_worker_min_chunkedstream_onreceivedata": ".onReceiveData()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ChunkedStream]
- "public_pdf_worker_min_chunkedstreammanager_onerror": ".onError()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ChunkedStreamManager]
- "public_pdf_worker_min_chunkedstreammanager_onprogress": ".onProgress()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ChunkedStreamManager]
- "public_pdf_worker_min_ciphertransform_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CipherTransform]
- "public_pdf_worker_min_cmap_charcodeof": ".charCodeOf()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CMap]
- "public_pdf_worker_min_cmap_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CMap]
- "public_pdf_worker_min_cmap_contains": ".contains()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CMap]
- "public_pdf_worker_min_cmap_foreach": ".forEach()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CMap]
- "public_pdf_worker_min_cmap_getmap": ".getMap()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CMap]
- "public_pdf_worker_min_cmap_isidentitycmap": ".isIdentityCMap()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CMap]
- "public_pdf_worker_min_cmap_length": ".length()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CMap]
- "public_pdf_worker_min_cmap_lookup": ".lookup()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CMap]
- "public_pdf_worker_min_cmap_mapbfrange": ".mapBfRange()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CMap]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-108.json

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
