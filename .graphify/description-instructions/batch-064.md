# Node Description Batch 65 of 139

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

- "public_pdf_worker_min_astmin_visit": ".visit()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[AstMin, .visitMin()]
- "public_pdf_worker_min_astnode_visit": ".visit()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[AstNode, unreachable()]
- "public_pdf_worker_min_astvariable_visit": ".visit()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[AstVariable, .visitVariable()]
- "public_pdf_worker_min_astvariabledefinition_visit": ".visit()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[AstVariableDefinition, .visitVariableDefinition()]
- "public_pdf_worker_min_baselocalcache_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[BaseLocalCache, RefSetCache]
- "public_pdf_worker_min_baselocalcache_set": ".set()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[BaseLocalCache, unreachable()]
- "public_pdf_worker_min_basepdfmanager_ensure": ".ensure()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[BasePdfManager, unreachable()]
- "public_pdf_worker_min_basepdfmanager_requestloadedstream": ".requestLoadedStream()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[BasePdfManager, unreachable()]
- "public_pdf_worker_min_basepdfmanager_requestrange": ".requestRange()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[BasePdfManager, unreachable()]
- "public_pdf_worker_min_basepdfmanager_sendprogressivedata": ".sendProgressiveData()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[BasePdfManager, unreachable()]
- "public_pdf_worker_min_basepdfmanager_terminate": ".terminate()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[BasePdfManager, unreachable()]
- "public_pdf_worker_min_baseshading": "BaseShading" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .getIR()]
- "public_pdf_worker_min_baseshading_getir": ".getIR()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[BaseShading, unreachable()]
- "public_pdf_worker_min_basestream_asyncgetbytes": ".asyncGetBytes()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[BaseStream, unreachable()]
- "public_pdf_worker_min_basestream_getbyte": ".getByte()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[BaseStream, unreachable()]
- "public_pdf_worker_min_basestream_getbyterange": ".getByteRange()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[BaseStream, unreachable()]
- "public_pdf_worker_min_basestream_getbytes": ".getBytes()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[BaseStream, unreachable()]
- "public_pdf_worker_min_basestream_getstring": ".getString()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[BaseStream, bytesToString()]
- "public_pdf_worker_min_basestream_isdataloaded": ".isDataLoaded()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[BaseStream, shadow()]
- "public_pdf_worker_min_basestream_isempty": ".isEmpty()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[BaseStream, unreachable()]
- "public_pdf_worker_min_basestream_length": ".length()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[BaseStream, unreachable()]
- "public_pdf_worker_min_basestream_makesubstream": ".makeSubStream()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[BaseStream, unreachable()]
- "public_pdf_worker_min_basestream_movestart": ".moveStart()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[BaseStream, unreachable()]
- "public_pdf_worker_min_basestream_reset": ".reset()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[BaseStream, unreachable()]
- "public_pdf_worker_min_batchoutput_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[BatchOutput, getStringOption()]
- "public_pdf_worker_min_binarycmapstream_readhex": ".readHex()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.process(), BinaryCMapStream]
- "public_pdf_worker_min_binarycmapstream_readsigned": ".readSigned()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.process(), BinaryCMapStream]
- "public_pdf_worker_min_binarycmapstream_readstring": ".readString()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.process(), BinaryCMapStream]
- "public_pdf_worker_min_bind_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Bind, getStringOption()]
- "public_pdf_worker_min_binder_bind": ".bind()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Binder, ._bindElement()]
- "public_pdf_worker_min_binder_getoccurinfo": "._getOccurInfo()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Binder, ._bindElement()]
- "public_pdf_worker_min_body_nn": ".[nn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Body, nn]
- "public_pdf_worker_min_booleanelement_nn": ".[nn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[BooleanElement, valueToHtml()]
- "public_pdf_worker_min_border_ur": ".[ur]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Border, Edge]
- "public_pdf_worker_min_br_jr": ".[jr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[br, .addString()]
- "public_pdf_worker_min_br_nn": ".[nn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[br, .success()]
- "public_pdf_worker_min_builder_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Builder, UnknownNamespace]
- "public_pdf_worker_min_builder_isnsagnostic": ".isNsAgnostic()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Builder, .onBeginElement()]
- "public_pdf_worker_min_button_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Button, getStringOption()]
- "public_pdf_worker_min_calculate_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Calculate, getStringOption()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-064.json

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
