# Node Description Batch 81 of 139

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

- "public_pdf_worker_min_templatenamespace_pagearea": ".pageArea()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, PageArea]
- "public_pdf_worker_min_templatenamespace_pageset": ".pageSet()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, PageSet]
- "public_pdf_worker_min_templatenamespace_para": ".para()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, Para]
- "public_pdf_worker_min_templatenamespace_passwordedit": ".passwordEdit()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, PasswordEdit]
- "public_pdf_worker_min_templatenamespace_pattern": ".pattern()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, template_Pattern]
- "public_pdf_worker_min_templatenamespace_picture": ".picture()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, Picture]
- "public_pdf_worker_min_templatenamespace_proto": ".proto()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, Proto]
- "public_pdf_worker_min_templatenamespace_radial": ".radial()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, Radial]
- "public_pdf_worker_min_templatenamespace_reason": ".reason()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, Reason]
- "public_pdf_worker_min_templatenamespace_reasons": ".reasons()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, Reasons]
- "public_pdf_worker_min_templatenamespace_rectangle": ".rectangle()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, Rectangle]
- "public_pdf_worker_min_templatenamespace_ref": ".ref()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, RefElement]
- "public_pdf_worker_min_templatenamespace_script": ".script()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, Script]
- "public_pdf_worker_min_templatenamespace_setproperty": ".setProperty()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, SetProperty]
- "public_pdf_worker_min_templatenamespace_signature": ".signature()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, Signature]
- "public_pdf_worker_min_templatenamespace_signdata": ".signData()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, SignData]
- "public_pdf_worker_min_templatenamespace_signing": ".signing()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, Signing]
- "public_pdf_worker_min_templatenamespace_solid": ".solid()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, Solid]
- "public_pdf_worker_min_templatenamespace_speak": ".speak()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, Speak]
- "public_pdf_worker_min_templatenamespace_stipple": ".stipple()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, Stipple]
- "public_pdf_worker_min_templatenamespace_subform": ".subform()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, Subform]
- "public_pdf_worker_min_templatenamespace_subformset": ".subformSet()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, SubformSet]
- "public_pdf_worker_min_templatenamespace_subjectdn": ".subjectDN()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, SubjectDN]
- "public_pdf_worker_min_templatenamespace_subjectdns": ".subjectDNs()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, SubjectDNs]
- "public_pdf_worker_min_templatenamespace_submit": ".submit()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, Submit]
- "public_pdf_worker_min_templatenamespace_template": ".template()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, Template]
- "public_pdf_worker_min_templatenamespace_text": ".text()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, Text]
- "public_pdf_worker_min_templatenamespace_textedit": ".textEdit()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, TextEdit]
- "public_pdf_worker_min_templatenamespace_time": ".time()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, Time]
- "public_pdf_worker_min_templatenamespace_timestamp": ".timeStamp()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, TimeStamp]
- "public_pdf_worker_min_templatenamespace_tooltip": ".toolTip()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, ToolTip]
- "public_pdf_worker_min_templatenamespace_traversal": ".traversal()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, Traversal]
- "public_pdf_worker_min_templatenamespace_traverse": ".traverse()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, Traverse]
- "public_pdf_worker_min_templatenamespace_validate": ".validate()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, Validate]
- "public_pdf_worker_min_templatenamespace_value": ".value()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, Value]
- "public_pdf_worker_min_templatenamespace_variables": ".variables()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, Variables]
- "public_pdf_worker_min_text_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Text, getInteger()]
- "public_pdf_worker_min_text_or": ".[Or]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Text, warn()]
- "public_pdf_worker_min_text_ur": ".[ur]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Text, sn]
- "public_pdf_worker_min_textmeasure_compute": ".compute()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[layoutText(), TextMeasure]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-080.json

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
