# Node Description Batch 117 of 139

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

- "public_pdf_worker_min_localpdfmanager_ensure": ".ensure()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[LocalPdfManager]
- "public_pdf_worker_min_localpdfmanager_requestloadedstream": ".requestLoadedStream()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[LocalPdfManager]
- "public_pdf_worker_min_localpdfmanager_requestrange": ".requestRange()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[LocalPdfManager]
- "public_pdf_worker_min_localpdfmanager_terminate": ".terminate()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[LocalPdfManager]
- "public_pdf_worker_min_localtilingpatterncache_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[LocalTilingPatternCache]
- "public_pdf_worker_min_localtilingpatterncache_set": ".set()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[LocalTilingPatternCache]
- "public_pdf_worker_min_log_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Log]
- "public_pdf_worker_min_ls": "ls" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_lt": "Lt" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_lzwstream_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[LZWStream]
- "public_pdf_worker_min_lzwstream_readbits": ".readBits()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[LZWStream]
- "public_pdf_worker_min_ma": "mA" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_mediuminfo_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[MediumInfo]
- "public_pdf_worker_min_meridiem_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Meridiem]
- "public_pdf_worker_min_meshstreamreader_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[MeshStreamReader]
- "public_pdf_worker_min_meshstreamreader_hasdata": ".hasData()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[MeshStreamReader]
- "public_pdf_worker_min_meshstreamreader_readbits": ".readBits()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[MeshStreamReader]
- "public_pdf_worker_min_messagehandler_aa": ".#AA()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[MessageHandler]
- "public_pdf_worker_min_messagehandler_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[MessageHandler]
- "public_pdf_worker_min_messagehandler_on": ".on()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[MessageHandler]
- "public_pdf_worker_min_messagehandler_send": ".send()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[MessageHandler]
- "public_pdf_worker_min_metadataparser_serializable": ".serializable()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[MetadataParser]
- "public_pdf_worker_min_mi": "mi" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_missingdataexception_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[MissingDataException]
- "public_pdf_worker_min_missingpdfexception_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[MissingPDFException]
- "public_pdf_worker_min_mn": "mn" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_mode_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Mode]
- "public_pdf_worker_min_modifyannots_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ModifyAnnots]
- "public_pdf_worker_min_month_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Month]
- "public_pdf_worker_min_ms": "ms" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_msgid_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[MsgId]
- "public_pdf_worker_min_mt": "mt" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_murmurhash3_64_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[MurmurHash3_64]
- "public_pdf_worker_min_na": "na" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_name_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Name]
- "public_pdf_worker_min_name_get": ".get()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Name]
- "public_pdf_worker_min_nameattr_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[NameAttr]
- "public_pdf_worker_min_nameornumbertree_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[NameOrNumberTree]
- "public_pdf_worker_min_nametree_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[NameTree]
- "public_pdf_worker_min_networkpdfmanager_ensure": ".ensure()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[NetworkPdfManager]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-116.json

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
