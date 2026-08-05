# Node Description Batch 107 of 139

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

- "public_pdf_worker_min_as": "As" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_ascii85stream_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Ascii85Stream]
- "public_pdf_worker_min_asciihexstream_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[AsciiHexStream]
- "public_pdf_worker_min_asciihexstream_readblock": ".readBlock()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[AsciiHexStream]
- "public_pdf_worker_min_assist_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Assist]
- "public_pdf_worker_min_assist_nn": ".[nn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Assist]
- "public_pdf_worker_min_astargument_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[AstArgument]
- "public_pdf_worker_min_astbinaryoperation_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[AstBinaryOperation]
- "public_pdf_worker_min_astliteral_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[AstLiteral]
- "public_pdf_worker_min_astmin_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[AstMin]
- "public_pdf_worker_min_astnode_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[AstNode]
- "public_pdf_worker_min_astvariable_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[AstVariable]
- "public_pdf_worker_min_astvariabledefinition_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[AstVariableDefinition]
- "public_pdf_worker_min_attributes_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Attributes]
- "public_pdf_worker_min_autosave_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[AutoSave]
- "public_pdf_worker_min_b_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[B]
- "public_pdf_worker_min_b_jr": ".[jr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[B]
- "public_pdf_worker_min_ba": "Ba" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_base_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Base]
- "public_pdf_worker_min_basepdfmanager_catalog": ".catalog()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[BasePdfManager]
- "public_pdf_worker_min_basepdfmanager_cleanup": ".cleanup()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[BasePdfManager]
- "public_pdf_worker_min_basepdfmanager_docbaseurl": ".docBaseUrl()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[BasePdfManager]
- "public_pdf_worker_min_basepdfmanager_docid": ".docId()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[BasePdfManager]
- "public_pdf_worker_min_basepdfmanager_ensurexref": ".ensureXRef()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[BasePdfManager]
- "public_pdf_worker_min_basepdfmanager_fontfallback": ".fontFallback()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[BasePdfManager]
- "public_pdf_worker_min_basepdfmanager_getpage": ".getPage()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[BasePdfManager]
- "public_pdf_worker_min_basepdfmanager_loadxfafonts": ".loadXfaFonts()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[BasePdfManager]
- "public_pdf_worker_min_basepdfmanager_loadxfaimages": ".loadXfaImages()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[BasePdfManager]
- "public_pdf_worker_min_basepdfmanager_password": ".password()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[BasePdfManager]
- "public_pdf_worker_min_basepdfmanager_serializexfadata": ".serializeXfaData()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[BasePdfManager]
- "public_pdf_worker_min_basepdfmanager_updatepassword": ".updatePassword()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[BasePdfManager]
- "public_pdf_worker_min_basestream_canasyncdecodeimagefrombuffer": ".canAsyncDecodeImageFromBuffer()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[BaseStream]
- "public_pdf_worker_min_basestream_getbasestreams": ".getBaseStreams()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[BaseStream]
- "public_pdf_worker_min_basestream_getimagedata": ".getImageData()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[BaseStream]
- "public_pdf_worker_min_basestream_gettransferableimage": ".getTransferableImage()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[BaseStream]
- "public_pdf_worker_min_basestream_getuint16": ".getUint16()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[BaseStream]
- "public_pdf_worker_min_basestream_isasync": ".isAsync()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[BaseStream]
- "public_pdf_worker_min_behavioroverride_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[BehaviorOverride]
- "public_pdf_worker_min_behavioroverride_gr": ".[gr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[BehaviorOverride]
- "public_pdf_worker_min_bi": "bi" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-106.json

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
