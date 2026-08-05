# Node Description Batch 112 of 139

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

- "public_pdf_worker_min_devicergbacs_getoutputlength": ".getOutputLength()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DeviceRgbaCS]
- "public_pdf_worker_min_devicergbacs_ispassthrough": ".isPassthrough()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DeviceRgbaCS]
- "public_pdf_worker_min_devicergbcs_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DeviceRgbCS]
- "public_pdf_worker_min_devicergbcs_getoutputlength": ".getOutputLength()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DeviceRgbCS]
- "public_pdf_worker_min_devicergbcs_getrgbbuffer": ".getRgbBuffer()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DeviceRgbCS]
- "public_pdf_worker_min_devicergbcs_getrgbitem": ".getRgbItem()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DeviceRgbCS]
- "public_pdf_worker_min_devicergbcs_ispassthrough": ".isPassthrough()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DeviceRgbCS]
- "public_pdf_worker_min_di": "di" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_dict_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Dict]
- "public_pdf_worker_min_dict_foreach": ".forEach()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Dict]
- "public_pdf_worker_min_dict_getraw": ".getRaw()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Dict]
- "public_pdf_worker_min_dict_has": ".has()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Dict]
- "public_pdf_worker_min_dict_set": ".set()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Dict]
- "public_pdf_worker_min_dict_size": ".size()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Dict]
- "public_pdf_worker_min_digestmethod_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DigestMethod]
- "public_pdf_worker_min_dn": "dn" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_dnlmarkererror_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DNLMarkerError]
- "public_pdf_worker_min_documentassembly_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DocumentAssembly]
- "public_pdf_worker_min_driver_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Driver]
- "public_pdf_worker_min_ds": "ds" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_dt": "Dt" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_dummyshading_getir": ".getIR()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DummyShading]
- "public_pdf_worker_min_duplexoption_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DuplexOption]
- "public_pdf_worker_min_dynamicrender_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DynamicRender]
- "public_pdf_worker_min_effectiveinputpolicy_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[EffectiveInputPolicy]
- "public_pdf_worker_min_effectiveoutputpolicy_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[EffectiveOutputPolicy]
- "public_pdf_worker_min_eg": "eg" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_ei": "ei" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_embed_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Embed]
- "public_pdf_worker_min_empty_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Empty]
- "public_pdf_worker_min_empty_or": ".[Or]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Empty]
- "public_pdf_worker_min_encoding_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Encoding]
- "public_pdf_worker_min_encrypt_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Encrypt]
- "public_pdf_worker_min_encryptionlevel_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[EncryptionLevel]
- "public_pdf_worker_min_encryptionmethod_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[EncryptionMethod]
- "public_pdf_worker_min_enforce_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Enforce]
- "public_pdf_worker_min_eoimarkererror_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[EOIMarkerError]
- "public_pdf_worker_min_equaterange_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[EquateRange]
- "public_pdf_worker_min_er": "er" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_era_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Era]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-111.json

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
