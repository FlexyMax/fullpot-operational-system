# Node Description Batch 121 of 139

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

- "public_pdf_worker_min_range_gr": ".[gr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Range]
- "public_pdf_worker_min_reader_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Reader]
- "public_pdf_worker_min_reader_next": ".next()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Reader]
- "public_pdf_worker_min_reader_readbits": ".readBits()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Reader]
- "public_pdf_worker_min_reason_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Reason]
- "public_pdf_worker_min_record_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Record]
- "public_pdf_worker_min_record_gr": ".[gr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Record]
- "public_pdf_worker_min_ref_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Ref]
- "public_pdf_worker_min_ref_get": ".get()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Ref]
- "public_pdf_worker_min_ref_tostring": ".toString()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Ref]
- "public_pdf_worker_min_refelement_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[RefElement]
- "public_pdf_worker_min_refset_clear": ".clear()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[RefSet]
- "public_pdf_worker_min_refset_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[RefSet]
- "public_pdf_worker_min_refset_has": ".has()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[RefSet]
- "public_pdf_worker_min_refset_put": ".put()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[RefSet]
- "public_pdf_worker_min_refset_symbol_iterator": ".[Symbol.iterator]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[RefSet]
- "public_pdf_worker_min_refsetcache_clear": ".clear()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[RefSetCache]
- "public_pdf_worker_min_refsetcache_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[RefSetCache]
- "public_pdf_worker_min_refsetcache_get": ".get()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[RefSetCache]
- "public_pdf_worker_min_refsetcache_has": ".has()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[RefSetCache]
- "public_pdf_worker_min_refsetcache_put": ".put()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[RefSetCache]
- "public_pdf_worker_min_refsetcache_size": ".size()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[RefSetCache]
- "public_pdf_worker_min_refsetcache_symbol_iterator": ".[Symbol.iterator]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[RefSetCache]
- "public_pdf_worker_min_regionalimagecache_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[RegionalImageCache]
- "public_pdf_worker_min_regionalimagecache_set": ".set()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[RegionalImageCache]
- "public_pdf_worker_min_relevant_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Relevant]
- "public_pdf_worker_min_relevant_gr": ".[gr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Relevant]
- "public_pdf_worker_min_rename_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Rename]
- "public_pdf_worker_min_renderpolicy_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[RenderPolicy]
- "public_pdf_worker_min_rg": "rg" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_ri": "Ri" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_root_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Root]
- "public_pdf_worker_min_root_or": ".[Or]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Root]
- "public_pdf_worker_min_rootelement_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[RootElement]
- "public_pdf_worker_min_rs": "rs" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_rt": "Rt" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_runlengthstream_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[RunLengthStream]
- "public_pdf_worker_min_runlengthstream_readblock": ".readBlock()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[RunLengthStream]
- "public_pdf_worker_min_runscripts_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[RunScripts]
- "public_pdf_worker_min_sa": "sa" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-120.json

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
