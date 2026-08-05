# Node Description Batch 123 of 139

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

- "public_pdf_worker_min_stream_makesubstream": ".makeSubStream()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Stream]
- "public_pdf_worker_min_stream_movestart": ".moveStart()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Stream]
- "public_pdf_worker_min_stream_reset": ".reset()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Stream]
- "public_pdf_worker_min_streamssequencestream_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[StreamsSequenceStream]
- "public_pdf_worker_min_streamssequencestream_getbasestreams": ".getBaseStreams()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[StreamsSequenceStream]
- "public_pdf_worker_min_stringobject_gr": ".[gr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[StringObject]
- "public_pdf_worker_min_structelement_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[StructElement]
- "public_pdf_worker_min_structelementnode_role": ".role()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[StructElementNode]
- "public_pdf_worker_min_structtreepage_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[StructTreePage]
- "public_pdf_worker_min_structtreepage_serializable": ".serializable()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[StructTreePage]
- "public_pdf_worker_min_structtreeroot_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[StructTreeRoot]
- "public_pdf_worker_min_stylesheet_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Stylesheet]
- "public_pdf_worker_min_stylesheetnamespace_cn": ".[cn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[StylesheetNamespace]
- "public_pdf_worker_min_sub_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Sub]
- "public_pdf_worker_min_subform_gr": ".[Gr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Subform]
- "public_pdf_worker_min_subform_pr": ".[pr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Subform]
- "public_pdf_worker_min_subformset_gr": ".[Gr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[SubformSet]
- "public_pdf_worker_min_subformset_pr": ".[pr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[SubformSet]
- "public_pdf_worker_min_subjectdn_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[SubjectDN]
- "public_pdf_worker_min_subjectdn_gr": ".[gr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[SubjectDN]
- "public_pdf_worker_min_submitformat_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[SubmitFormat]
- "public_pdf_worker_min_submiturl_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[SubmitUrl]
- "public_pdf_worker_min_subsetbelow_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[SubsetBelow]
- "public_pdf_worker_min_sup_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Sup]
- "public_pdf_worker_min_suppressbanner_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[SuppressBanner]
- "public_pdf_worker_min_t": "_t" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_ta": "ta" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_tagged_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Tagged]
- "public_pdf_worker_min_template_font_s": ".[$s]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[template_Font]
- "public_pdf_worker_min_template_lr": ".[Lr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Template]
- "public_pdf_worker_min_template_pattern_on": ".[on]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[template_Pattern]
- "public_pdf_worker_min_template_r": ".[$r]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Template]
- "public_pdf_worker_min_templatenamespace_ui": ".ui()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace]
- "public_pdf_worker_min_text_gr": ".[gr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Text]
- "public_pdf_worker_min_text_wr": ".[Wr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Text]
- "public_pdf_worker_min_text_zs": ".[Zs]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Text]
- "public_pdf_worker_min_textannotation_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TextAnnotation]
- "public_pdf_worker_min_textmeasure_popfont": ".popFont()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TextMeasure]
- "public_pdf_worker_min_textmeasure_pushdata": ".pushData()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TextMeasure]
- "public_pdf_worker_min_textstate_clone": ".clone()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TextState]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-122.json

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
