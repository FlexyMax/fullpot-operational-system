# Node Description Batch 120 of 139

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

- "public_pdf_worker_min_pdfworkerstreamreader_headersready": ".headersReady()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFWorkerStreamReader]
- "public_pdf_worker_min_pdfworkerstreamreader_israngesupported": ".isRangeSupported()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFWorkerStreamReader]
- "public_pdf_worker_min_pdfworkerstreamreader_isstreamingsupported": ".isStreamingSupported()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFWorkerStreamReader]
- "public_pdf_worker_min_pdfworkerstreamreader_read": ".read()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFWorkerStreamReader]
- "public_pdf_worker_min_permissions_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Permissions]
- "public_pdf_worker_min_pi": "pi" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_picktraybypdfsize_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PickTrayByPDFSize]
- "public_pdf_worker_min_picture_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Picture]
- "public_pdf_worker_min_plaintextmetadata_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PlaintextMetadata]
- "public_pdf_worker_min_pn": "pn" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_polygonannotation_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PolygonAnnotation]
- "public_pdf_worker_min_postscriptevaluator_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PostScriptEvaluator]
- "public_pdf_worker_min_postscriptlexer_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PostScriptLexer]
- "public_pdf_worker_min_postscriptlexer_nextchar": ".nextChar()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PostScriptLexer]
- "public_pdf_worker_min_postscriptparser_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PostScriptParser]
- "public_pdf_worker_min_postscriptstack_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PostScriptStack]
- "public_pdf_worker_min_postscriptstack_push": ".push()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PostScriptStack]
- "public_pdf_worker_min_postscripttoken_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PostScriptToken]
- "public_pdf_worker_min_predictorstream_readblocktiff": ".readBlockTiff()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PredictorStream]
- "public_pdf_worker_min_presence_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Presence]
- "public_pdf_worker_min_print_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Print]
- "public_pdf_worker_min_printername_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PrinterName]
- "public_pdf_worker_min_printhighquality_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PrintHighQuality]
- "public_pdf_worker_min_printscaling_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PrintScaling]
- "public_pdf_worker_min_producer_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Producer]
- "public_pdf_worker_min_ps_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ps]
- "public_pdf_worker_min_pt": "Pt" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_qa": "Qa" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_qi": "Qi" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_qn": "qn" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_qs": "Qs" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_qt": "qt" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_queueoptimizer_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[QueueOptimizer]
- "public_pdf_worker_min_queueoptimizer_flush": ".flush()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[QueueOptimizer]
- "public_pdf_worker_min_queueoptimizer_isoffscreencanvassupported": ".isOffscreenCanvasSupported()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[QueueOptimizer]
- "public_pdf_worker_min_queueoptimizer_optimize": "._optimize()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[QueueOptimizer]
- "public_pdf_worker_min_queueoptimizer_reset": ".reset()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[QueueOptimizer]
- "public_pdf_worker_min_ra": "ra" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_radial_on": ".[on]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Radial]
- "public_pdf_worker_min_range_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Range]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-119.json

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
